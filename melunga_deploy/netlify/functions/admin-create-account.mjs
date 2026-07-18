// netlify/functions/admin-create-account.mjs
// FONCTION ADMIN TEMPORAIRE — a SUPPRIMER du repo apres usage.
// Cree manuellement un compte paye (cas du paiement encaisse avant que le
// systeme de compte soit deploye). Protegee par la variable d'environnement
// ADMIN_SECRET.
//
// Usage (depuis un terminal, ou l'adresse dans le navigateur ne suffit pas
// car il faut un POST) :
//
//   curl -X POST https://melunga.com/.netlify/functions/admin-create-account \
//     -H "Content-Type: application/json" \
//     -d '{"admin_secret":"TON_SECRET","email":"ton@email.com","password":"tonmotdepasse","plan":"monthly","access_days":30}'
//
// Reponse attendue : {"success":true,"email":"ton@email.com"}
//
// Parametres PBKDF2 : IDENTIQUES a login.mjs.

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

    const adminSecret = process.env.ADMIN_SECRET || '';
    const provided = (body && body.admin_secret) ? String(body.admin_secret) : '';
    if (!adminSecret || !provided) {
      return new Response(JSON.stringify({ success: false, error: 'unauthorized' }), { status: 401 });
    }
    const a = Buffer.from(provided, 'utf8');
    const b = Buffer.from(adminSecret, 'utf8');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return new Response(JSON.stringify({ success: false, error: 'unauthorized' }), { status: 401 });
    }

    const email = (body && body.email ? String(body.email) : '').trim().toLowerCase().slice(0, 254);
    const password = (body && body.password ? String(body.password) : '');
    const plan = (body && body.plan === 'annual') ? 'annual' : 'monthly';
    const accessDays = parseInt((body && body.access_days) || (plan === 'annual' ? '365' : '30'), 10);

    if (!email || email.indexOf('@') < 0) {
      return new Response(JSON.stringify({ success: false, error: 'invalid_email' }), { status: 400 });
    }
    if (!password || password.length < 6) {
      return new Response(JSON.stringify({ success: false, error: 'password_too_short' }), { status: 400 });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = crypto
      .pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST)
      .toString('hex');

    const expiry = Date.now() + accessDays * 24 * 60 * 60 * 1000;
    const store = getStore({ name: 'melunga-access', consistency: 'strong' });

    await store.setJSON('email:' + email, {
      email,
      passwordHash,
      salt,
      paid: true,
      expiry,
      plan,
      devices: {
        desktop: null,
        mobile: null
      },
      updated: Date.now(),
      createdBy: 'admin-create-account'
    });

    console.log('[admin-create-account] compte cree pour', email, 'plan =', plan, 'jours =', accessDays);
    return new Response(JSON.stringify({ success: true, email }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('[admin-create-account] EXCEPTION:', err);
    return new Response(JSON.stringify({ success: false, error: 'server_error' }), { status: 500 });
  }
};
