// netlify/functions/login.mjs
// Permet a un client deja abonne de se reconnecter depuis un nouvel appareil.
// Verifie email + mot de passe contre le compte enregistre lors du paiement
// (voir airwallex-webhook.mjs), et si valide + abonnement encore actif,
// marque l'appareil demandeur (device_id) comme paye a son tour.

import crypto from 'node:crypto';
import { getStore } from '@netlify/blobs';

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256').toString('hex');
}

function safeEqual(a, b) {
  const bufA = Buffer.from(String(a || ''), 'utf8');
  const bufB = Buffer.from(String(b || ''), 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: 'method_not_allowed' }), { status: 405 });
  }

  try {
    const body = await req.json();
    const deviceId = (body && body.device_id ? String(body.device_id) : '').slice(0, 128);
    const email = (body && body.email ? String(body.email).trim().toLowerCase() : '').slice(0, 200);
    const password = (body && body.password ? String(body.password) : '').slice(0, 200);

    if (!deviceId || !email || !password) {
      return new Response(JSON.stringify({ success: false, error: 'missing_fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const store = getStore({ name: 'melunga-access', consistency: 'strong' });
    const account = await store.get('email:' + email, { type: 'json' }).catch(() => null);

    if (!account) {
      return new Response(JSON.stringify({ success: false, error: 'account_not_found' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const computedHash = hashPassword(password, account.salt);
    if (!safeEqual(computedHash, account.passwordHash)) {
      return new Response(JSON.stringify({ success: false, error: 'wrong_password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const stillActive = !!(account.paid && account.expiry > Date.now());
    if (!stillActive) {
      return new Response(JSON.stringify({ success: false, error: 'subscription_expired' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Identifiants corrects et abonnement actif : on debloque ce nouvel appareil aussi.
    await store.setJSON(deviceId, { paid: true, expiry: account.expiry, plan: account.plan, updated: Date.now() });

    return new Response(JSON.stringify({ success: true, expiry: account.expiry }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    });
  } catch (err) {
    console.error('[login] EXCEPTION:', err);
    return new Response(JSON.stringify({ success: false, error: 'server_error' }), { status: 500 });
  }
};
