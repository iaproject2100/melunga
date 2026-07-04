// netlify/functions/airwallex-webhook.mjs
// Recoit les notifications Airwallex (evenement payment_intent.succeeded), verifie la
// signature HMAC-SHA256, puis marque l'appareil correspondant comme paye dans Netlify Blobs.
// La duree d'acces (30 ou 365 jours) est lue depuis les metadonnees du paiement (access_days),
// definies par create-payment-link.mjs selon la formule choisie (mensuel/annuel).
//
// Variable d'environnement requise :
//   AIRWALLEX_WEBHOOK_SECRET - cle secrete de l'abonnement webhook
//                              (Airwallex > Settings > Developer > Webhooks > votre URL > secret)
//
// A configurer cote Airwallex : Settings > Developer > Webhooks > New webhook
//   Notification URL = https://melunga.com/.netlify/functions/airwallex-webhook
//   Evenement a cocher = payment_intent.succeeded (au minimum)

import crypto from 'node:crypto';
import { getStore } from '@netlify/blobs';

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

  if (!validSig) {
    return new Response('invalid signature', { status: 401 });
  }

  let event;
  try { event = JSON.parse(rawBody); } catch (e) {
    return new Response('bad json', { status: 400 });
  }

  // On ne traite que les paiements reussis
  if (event && event.name === 'payment_intent.succeeded') {
    const obj = event.data && event.data.object ? event.data.object : {};
    const deviceId = obj.metadata && obj.metadata.device_id;
    const accessDays = parseInt((obj.metadata && obj.metadata.access_days) || '30', 10);
    if (deviceId) {
      const store = getStore({ name: 'melunga-access', consistency: 'strong' });
      const expiry = Date.now() + accessDays * 24 * 60 * 60 * 1000;
      await store.setJSON(deviceId, { paid: true, expiry, plan: (obj.metadata && obj.metadata.plan) || 'monthly', updated: Date.now() });
    }
  }

  // Toujours repondre 200 rapidement pour eviter les re-essais Airwallex
  return new Response('ok', { status: 200 });
};
