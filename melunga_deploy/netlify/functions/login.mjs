// netlify/functions/login.mjs
// Connexion "Deja client" : verifie email + mot de passe contre le compte
// stocke dans Netlify Blobs, puis debloque l'appareil courant.
// Recoit du front : { device_id, email, password }
// Repond : { success: true } ou { success: false, error: '...' }
//
// Parametres PBKDF2 : IDENTIQUES a create-payment-link.mjs et
// admin-create-account.mjs (100000 iterations, 32 octets, sha256, hex).

import crypto from 'node:crypto';
import { getStore } from '@netlify/blobs';

const PBKDF2_ITERATIONS = 100000;
const PBKDF2_KEYLEN = 32;
const PBKDF2_DIGEST = 'sha256';

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: 'method_not_allowed' }), { status: 405 });
  }
  try {
    let body = {};
    try { body = await req.json(); } catch (e) { body = {}; }

    const deviceId = (body && body.device_id ? String(body.device_id) : '').slice(0, 128);
    // Normalisation en minuscules : la meme qu'a la creation du compte,
    // pour neutraliser les majuscules automatiques des claviers mobiles.
    const email = (body && body.email ? String(body.email) : '').trim().toLowerCase().slice(0, 254);
    const password = (body && body.password ? String(body.password) : '');

    if (!deviceId || !email || email.indexOf('@') < 0 || !password) {
      return new Response(JSON.stringify({ success: false, error: 'invalid_credentials' }), { status: 400 });
    }

    const store = getStore({ name: 'melunga-access', consistency: 'strong' });

    let account = null;
    try {
      account = await store.get('email:' + email, { type: 'json' });
    } catch (e) { account = null; }

    if (!account || !account.passwordHash || !account.salt) {
      console.log('[login] compte introuvable pour email =', email);
      return new Response(JSON.stringify({ success: false, error: 'invalid_credentials' }), { status: 401 });
    }

    const attempt = crypto
      .pbkdf2Sync(password, account.salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST)
      .toString('hex');

    const a = Buffer.from(attempt, 'utf8');
    const b = Buffer.from(String(account.passwordHash), 'utf8');
    const ok = a.length === b.length && crypto.timingSafeEqual(a, b);

    if (!ok) {
      console.log('[login] mot de passe incorrect pour email =', email);
      return new Response(JSON.stringify({ success: false, error: 'invalid_credentials' }), { status: 401 });
    }

    if (!account.paid || !account.expiry || account.expiry <= Date.now()) {
      console.log('[login] abonnement expire pour email =', email);
      return new Response(JSON.stringify({ success: false, error: 'subscription_expired' }), { status: 403 });
    }

    // Identifiants valides + abonnement actif -> deblocage de cet appareil,
    // avec la meme date d'expiration que le compte.
    await store.setJSON(deviceId, {
      paid: true,
      expiry: account.expiry,
      plan: account.plan || 'monthly',
      email: email,
      updated: Date.now()
    });
    console.log('[login] connexion reussie, appareil debloque pour email =', email);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('[login] EXCEPTION:', err);
    return new Response(JSON.stringify({ success: false, error: 'server_error' }), { status: 500 });
  }
};
