// netlify/functions/airwallex-webhook.mjs
// Recoit les notifications Airwallex (payment_intent.succeeded), verifie la
// signature HMAC-SHA256, puis debloque l'appareil ET cree le compte email.
//
// Constat en production : les metadata posees sur le payment LINK n'arrivent
// pas toujours sur le payment INTENT (metadata = {}). Strategie en 3 niveaux :
//   1. metadata de l'intent si presentes (cas ideal)
//   2. sinon, enregistrement "pending" ecrit par create-payment-link dans
//      Netlify Blobs, retrouve via payment_link_id present dans le payload
//   3. sinon, appel API Airwallex pour recuperer l'intent complet et son
//      payment_link_id, puis retour au niveau 2
//
// Variables d'environnement requises :
//   AIRWALLEX_WEBHOOK_SECRET, AIRWALLEX_CLIENT_ID, AIRWALLEX_API_KEY,
//   AIRWALLEX_ENV ('demo'|'live'), BREVO_API_KEY (optionnelle)

import crypto from 'node:crypto';
import { getStore } from '@netlify/blobs';
import {
  ensureDeviceSlots,
  makeDeviceSlot
} from './device-access.mjs';

function baseUrl() {
  return (process.env.AIRWALLEX_ENV || 'demo') === 'live'
    ? 'https://api.airwallex.com'
    : 'https://api-demo.airwallex.com';
}

async function getAccessToken() {
  const res = await fetch(`${baseUrl()}/api/v1/authentication/login`, {
    method: 'POST',
    headers: {
      'x-client-id': process.env.AIRWALLEX_CLIENT_ID,
      'x-api-key': process.env.AIRWALLEX_API_KEY,
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) throw new Error('Airwallex auth failed: ' + res.status);
  const data = await res.json();
  return data.token;
}

async function sendConfirmationEmail(email, plan) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.log('[airwallex-webhook] BREVO_API_KEY absente, email de confirmation non envoye');
    return;
  }
  try {
    const planLabel = plan === 'annual' ? 'annuel' : 'mensuel';
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: 'Melunga', email: 'contact@melunga.com' },
        to: [{ email }],
        subject: 'Bienvenue sur Melunga · votre compte est actif',
        htmlContent: `<p>Bonjour,</p>
<p>Votre abonnement Melunga (${planLabel}) est bien actif. Vous pouvez maintenant utiliser cet e-mail et votre mot de passe sur un ordinateur et un appareil mobile, via l'onglet « Déjà client ».</p>
<p>Merci de votre confiance,<br>L'équipe Melunga 梅伦加</p>`
      })
    });
    const resText = await res.text();
    console.log('[airwallex-webhook] Brevo email status =', res.status, 'body =', resText);
  } catch (err) {
    console.error('[airwallex-webhook] echec envoi email confirmation:', err);
  }
}

// Cherche un payment_link_id dans le payload de l'intent, quel que soit
// l'endroit ou Airwallex l'a range selon la version d'API.
function extractLinkId(obj) {
  if (!obj) return null;
  return obj.payment_link_id
    || (obj.payment_link && obj.payment_link.id)
    || (obj.order && obj.order.payment_link_id)
    || null;
}

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('method not allowed', { status: 405 });
  }

  const rawBody = await req.text();
  const timestamp = req.headers.get('x-timestamp') || '';
  const signature = req.headers.get('x-signature') || '';
  const secret = process.env.AIRWALLEX_WEBHOOK_SECRET || '';

  const expected = crypto
    .createHmac('sha256', secret)
    .update(timestamp + rawBody)
    .digest('hex');

  const sigBuf = Buffer.from(signature || '', 'utf8');
  const expBuf = Buffer.from(expected, 'utf8');
  const validSig = sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);

  console.log('[airwallex-webhook] signature valide =', validSig);
  if (!validSig) {
    return new Response('invalid signature', { status: 401 });
  }

  let event;
  try { event = JSON.parse(rawBody); } catch (e) {
    console.error('[airwallex-webhook] JSON invalide:', e);
    return new Response('bad json', { status: 400 });
  }

  console.log('[airwallex-webhook] evenement recu =', event && event.name);

  if (event && event.name === 'payment_intent.succeeded') {
    const obj = (event.data && event.data.object) ? event.data.object : {};
    const intentId = obj.id || null;
    const store = getStore({ name: 'melunga-access', consistency: 'strong' });

    // --- Niveau 1 : metadata directes de l'intent ---
    let meta = obj.metadata || {};
    console.log('[airwallex-webhook] metadata recue =', JSON.stringify(meta));

    let info = null;
    if (meta.device_id) {
      info = {
        deviceId: meta.device_id,
        deviceType: meta.device_type || 'desktop',
        deviceLabel: meta.device_label || null,
        email: meta.email ? String(meta.email).trim().toLowerCase() : null,
        passwordHash: meta.password_hash || null,
        salt: meta.salt || null,
        plan: meta.plan || 'monthly',
        accessDays: parseInt(meta.access_days || '30', 10)
      };
      console.log('[airwallex-webhook] infos trouvees via metadata intent');
    }

    // --- Niveau 2 : pending via payment_link_id du payload ---
    if (!info) {
      let linkId = extractLinkId(obj);
      console.log('[airwallex-webhook] payment_link_id dans payload =', linkId);

      // --- Niveau 3 : payload sans link id -> retrouver l'intent complet via API ---
      if (!linkId && intentId) {
        try {
          const token = await getAccessToken();
          const r = await fetch(`${baseUrl()}/api/v1/pa/payment_intents/${intentId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (r.ok) {
            const full = await r.json();
            linkId = extractLinkId(full);
            // bonus : l'intent complet a parfois les metadata que le payload n'avait pas
            if (!linkId && full.metadata && full.metadata.device_id) {
              const m = full.metadata;
              info = {
                deviceId: m.device_id,
                deviceType: m.device_type || 'desktop',
                deviceLabel: m.device_label || null,
                email: m.email ? String(m.email).trim().toLowerCase() : null,
                passwordHash: m.password_hash || null,
                salt: m.salt || null,
                plan: m.plan || 'monthly',
                accessDays: parseInt(m.access_days || '30', 10)
              };
              console.log('[airwallex-webhook] infos trouvees via metadata de l\'intent complet (API)');
            }
            console.log('[airwallex-webhook] payment_link_id via API =', linkId);
          } else {
            console.log('[airwallex-webhook] GET intent API status =', r.status);
          }
        } catch (e) {
          console.error('[airwallex-webhook] echec recuperation intent via API:', e);
        }
      }

      if (!info && linkId) {
        try {
          const pending = await store.get('pending:link:' + linkId, { type: 'json' });
          if (pending && pending.deviceId) {
            info = {
              deviceId: pending.deviceId,
              deviceType: pending.deviceType || 'desktop',
              deviceLabel: pending.deviceLabel || null,
              email: pending.email || null,
              passwordHash: pending.passwordHash || null,
              salt: pending.salt || null,
              plan: pending.plan || 'monthly',
              accessDays: pending.accessDays || 30
            };
            console.log('[airwallex-webhook] infos trouvees via pending:link:', linkId);
          }
        } catch (e) {
          console.log('[airwallex-webhook] aucun pending pour link', linkId);
        }
      }
    }

    if (info && info.deviceId) {
      const expiry = Date.now() + info.accessDays * 24 * 60 * 60 * 1000;

      // Creation / mise a jour du compte email
      if (info.email && info.passwordHash && info.salt) {
        const accountKey = 'email:' + info.email;
        const previousAccount = await store.get(accountKey, { type: 'json' }).catch(() => null);
        const devices = previousAccount && previousAccount.expiry > Date.now()
          ? ensureDeviceSlots(previousAccount)
          : ensureDeviceSlots(null);
        const deviceType = info.deviceType === 'mobile' ? 'mobile' : 'desktop';
        const previousSlot = devices[deviceType];
        const now = Date.now();

        devices[deviceType] = makeDeviceSlot({
          deviceId: info.deviceId,
          deviceType,
          deviceLabel: info.deviceLabel || (deviceType === 'mobile' ? 'Appareil mobile' : 'Ordinateur'),
          previousSlot,
          now
        });

        await store.setJSON(info.deviceId, {
          paid: true,
          expiry,
          plan: info.plan,
          email: info.email,
          deviceType,
          updated: now
        });
        console.log('[airwallex-webhook] device_id marque paye =', info.deviceId);

        await store.setJSON(accountKey, {
          ...(previousAccount || {}),
          email: info.email,
          passwordHash: info.passwordHash,
          salt: info.salt,
          paid: true,
          expiry,
          plan: info.plan,
          devices,
          updated: now
        });
        console.log('[airwallex-webhook] compte cree/mis a jour pour email =', info.email);
        await sendConfirmationEmail(info.email, info.plan);
      } else {
        await store.setJSON(info.deviceId, {
          paid: true,
          expiry,
          plan: info.plan,
          updated: Date.now()
        });
        console.log('[airwallex-webhook] pas d\'email/hash disponibles, compte non cree (appareil debloque)');
      }

      // Nettoyage des pending devenus inutiles
      try { await store.delete('pending:device:' + info.deviceId); } catch (e) {}
    } else {
      console.log('[airwallex-webhook] IMPOSSIBLE d\'identifier le paiement — payload objet =', JSON.stringify(obj).slice(0, 2000));
    }
  }

  return new Response('ok', { status: 200 });
};
