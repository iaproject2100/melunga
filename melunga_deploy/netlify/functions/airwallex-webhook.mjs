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
import { getAccessStore } from './access-store.mjs';
import {
  cleanDeviceId,
  ensureDeviceSlots,
  makeDeviceSlot
} from './device-access.mjs';
import { expectedAmount } from './pricing-table.mjs';
import { hasPermanentAccess } from './complimentary-access.mjs';

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

async function updatePaidAccount(store, accountKey, info, expiry) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const snapshot = await store.getWithMetadata(accountKey, { type: 'json' });
    const previous = snapshot ? snapshot.data : null;
    if (hasPermanentAccess(previous)) return { preserved: true };
    if (snapshot && !snapshot.etag) return { conflict: true };

    const devices = previous && previous.expiry > Date.now()
      ? ensureDeviceSlots(previous)
      : ensureDeviceSlots(null);
    const deviceType = info.deviceType === 'mobile' ? 'mobile' : 'desktop';
    const now = Date.now();
    devices[deviceType] = makeDeviceSlot({
      deviceId: info.deviceId,
      deviceType,
      deviceLabel: info.deviceLabel || (deviceType === 'mobile' ? 'Appareil mobile' : 'Ordinateur'),
      previousSlot: devices[deviceType],
      now
    });

    const result = await store.setJSON(accountKey, {
      ...(previous || {}),
      email: info.email,
      passwordHash: info.passwordHash,
      salt: info.salt,
      paid: true,
      expiry,
      plan: info.plan,
      devices,
      updated: now
    }, snapshot ? { onlyIfMatch: snapshot.etag } : { onlyIfNew: true });
    if (result.modified) return { deviceType, now };
  }
  return { conflict: true };
}

async function updatePaymentDevice(store, info, expiry, accountDeviceType = null) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const snapshot = await store.getWithMetadata(info.deviceId, { type: 'json' });
    const previous = snapshot ? snapshot.data : null;
    if (snapshot && !snapshot.etag) return { conflict: true };
    const emails = new Set([info.email, previous && previous.email].filter(Boolean));
    for (const email of emails) {
      if (hasPermanentAccess(await store.get('email:' + email, { type: 'json' }))) {
        return { preserved: true };
      }
    }

    // A payment must retain the latest account/session association.
    // The account remains authoritative if an owner grant is created between
    // this check and the cache write; CAS also protects a concurrent login.
    const next = {
      ...(previous || {}),
      paid: true,
      expiry,
      plan: info.plan,
      updated: Date.now()
    };
    if (accountDeviceType) {
      next.email = info.email;
      next.deviceType = accountDeviceType;
      // A session from a different account cannot authenticate this payment's
      // account. A fresh login on the same account keeps its current token.
      if (previous && previous.email && previous.email !== info.email) delete next.sessionHash;
    }
    const result = await store.setJSON(info.deviceId, next,
      snapshot ? { onlyIfMatch: snapshot.etag } : { onlyIfNew: true });
    if (!result.modified) continue;
    for (const email of emails) {
      if (hasPermanentAccess(await store.get('email:' + email, { type: 'json' }))) {
        return { preserved: true };
      }
    }
    return { updated: true };
  }
  return { conflict: true };
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
    const store = getAccessStore();

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
        accessDays: parseInt(meta.access_days || '30', 10),
        amount: meta.amount != null ? Number(meta.amount) : null,
        currency: meta.currency || null
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
                accessDays: parseInt(m.access_days || '30', 10),
                amount: m.amount != null ? Number(m.amount) : null,
                currency: m.currency || null
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
              accessDays: pending.accessDays || 30,
              amount: pending.amount != null ? Number(pending.amount) : null,
              currency: pending.currency || null
            };
            console.log('[airwallex-webhook] infos trouvees via pending:link:', linkId);
          }
        } catch (e) {
          console.log('[airwallex-webhook] aucun pending pour link', linkId);
        }
      }
    }

    // All metadata sources, including historic pending links, must pass the
    // same reserved-key guard as login before they can address device records.
    if (info) {
      info.deviceId = cleanDeviceId(info.deviceId);
      if (!info.deviceId) return new Response('invalid device', { status: 200 });
    }

    // --- Controle du montant et de la devise reellement payes ---
    // On compare ce qu'Airwallex a encaisse (captured_amount, sinon amount / currency) a ce qui etait attendu
    // pour ce lien (enregistre par create-payment-link). Pour un lien ancien sans montant
    // enregistre, on retombe sur la grille tarifaire via le plan et la devise encaissee.
    if (info && info.deviceId) {
      // Documentation PaymentIntent : `amount` = montant de la commande demande,
      // `captured_amount` = montant effectivement capture. On controle l'encaissement reel.
      const paidAmount = Number.isFinite(Number(obj.captured_amount)) && obj.captured_amount != null
        ? Number(obj.captured_amount)
        : Number(obj.amount);
      const paidCurrency = String(obj.currency || '').toUpperCase();
      const expectedCurrency = info.currency ? String(info.currency).toUpperCase() : paidCurrency;
      const expected = (info.amount != null && Number.isFinite(info.amount))
        ? info.amount
        : expectedAmount(info.plan, expectedCurrency);
      const amountOk = Number.isFinite(paidAmount) && expected != null && Math.abs(paidAmount - expected) < 0.005;
      const currencyOk = !!paidCurrency && paidCurrency === expectedCurrency;
      if (!amountOk || !currencyOk) {
        console.error('[airwallex-webhook] PAIEMENT REFUSE : montant/devise inattendus. recu =',
          paidAmount, paidCurrency, 'attendu =', expected, expectedCurrency, 'intent =', intentId, 'device =', info.deviceId);
        // 200 pour eviter les re-livraisons ; l'acces n'est PAS active, a traiter manuellement.
        return new Response('amount mismatch', { status: 200 });
      }
      console.log('[airwallex-webhook] montant verifie =', paidAmount, paidCurrency);
    }

    if (info && info.deviceId) {
      // A payment link can predate an owner grant. It must not replace that
      // grant, its credentials or its shared-device register when delivered.
      // Check both the payment's email and an existing device association:
      // old device-only payment links may not carry the email in metadata.
      const existingDevice = await store.get(info.deviceId, { type: 'json' });
      const emails = new Set([info.email, existingDevice && existingDevice.email].filter(Boolean));
      for (const email of emails) {
        const account = await store.get('email:' + email, { type: 'json' });
        if (hasPermanentAccess(account)) {
          return new Response('complimentary access preserved', { status: 200 });
        }
      }

      const expiry = Date.now() + info.accessDays * 24 * 60 * 60 * 1000;

      // Creation / mise a jour du compte email
      if (info.email && info.passwordHash && info.salt) {
        const accountKey = 'email:' + info.email;
        const updated = await updatePaidAccount(store, accountKey, info, expiry);
        if (updated.preserved) {
          return new Response('complimentary access preserved', { status: 200 });
        }
        if (updated.conflict) return new Response('account update conflict', { status: 503 });
        const cached = await updatePaymentDevice(store, info, expiry, updated.deviceType);
        if (cached.preserved) return new Response('complimentary access preserved', { status: 200 });
        if (cached.conflict) return new Response('device update conflict', { status: 503 });
        console.log('[airwallex-webhook] device_id marque paye =', info.deviceId);

        console.log('[airwallex-webhook] compte cree/mis a jour pour email =', info.email);
        await sendConfirmationEmail(info.email, info.plan);
      } else {
        const updated = await updatePaymentDevice(store, info, expiry);
        if (updated.preserved) {
          return new Response('complimentary access preserved', { status: 200 });
        }
        if (updated.conflict) return new Response('device update conflict', { status: 503 });
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
