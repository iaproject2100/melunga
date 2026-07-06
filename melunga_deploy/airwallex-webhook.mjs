// netlify/functions/airwallex-webhook.mjs
// Recoit les notifications Airwallex (evenement payment_intent.succeeded), verifie la
// signature HMAC-SHA256, puis marque l'appareil ET le compte (email) comme payes dans
// Netlify Blobs. Le compte email permet de se reconnecter depuis un nouvel appareil.
// Envoie aussi un email de confirmation de creation de compte via l'API Brevo.
//
// Variables d'environnement requises :
//   AIRWALLEX_WEBHOOK_SECRET - cle secrete de l'abonnement webhook
//   BREVO_API_KEY            - cle API Brevo (Settings > SMTP & API > API Keys),
//                              differente de la cle SMTP deja utilisee pour Gmail
//
// A configurer cote Airwallex : Settings > Developer > Webhooks > New webhook
//   Notification URL = https://melunga.com/.netlify/functions/airwallex-webhook
//   Evenement a cocher = payment_intent.succeeded (au minimum)

import crypto from 'node:crypto';
import { getStore } from '@netlify/blobs';

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
<p>Votre abonnement Melunga (${planLabel}) est bien actif. Vous pouvez maintenant utiliser cet email et votre mot de passe pour retrouver votre accès sur n'importe quel appareil, via l'onglet "Déjà client".</p>
<p>Merci de votre confiance,<br>L'équipe Melunga 梅伦加</p>`
      })
    });
    const resText = await res.text();
    console.log('[airwallex-webhook] Brevo email status =', res.status, 'body =', resText);
  } catch (err) {
    console.error('[airwallex-webhook] echec envoi email confirmation:', err);
  }
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
    const obj = event.data && event.data.object ? event.data.object : {};
    const meta = obj.metadata || {};
    const deviceId = meta.device_id;
    const accessDays = parseInt(meta.access_days || '30', 10);
    const plan = meta.plan || 'monthly';

    console.log('[airwallex-webhook] metadata recue =', JSON.stringify(meta));

    if (deviceId) {
      const store = getStore({ name: 'melunga-access', consistency: 'strong' });
      const expiry = Date.now() + accessDays * 24 * 60 * 60 * 1000;

      // Statut de l'appareil qui a paye (comportement existant, inchange)
      await store.setJSON(deviceId, { paid: true, expiry, plan, updated: Date.now() });
      console.log('[airwallex-webhook] device_id marque paye =', deviceId);

      // Compte email (nouveau) : permet de se reconnecter depuis un autre appareil
      if (meta.email && meta.password_hash && meta.salt) {
        await store.setJSON('email:' + meta.email, {
          email: meta.email,
          passwordHash: meta.password_hash,
          salt: meta.salt,
          paid: true,
          expiry,
          plan,
          updated: Date.now()
        });
        console.log('[airwallex-webhook] compte cree/mis a jour pour email =', meta.email);

        await sendConfirmationEmail(meta.email, plan);
      } else {
        console.log('[airwallex-webhook] pas d\'email/mot de passe dans les metadata, compte non cree');
      }
    } else {
      console.log('[airwallex-webhook] aucun device_id dans les metadata, rien enregistre');
    }
  }

  return new Response('ok', { status: 200 });
};
