// netlify/functions/create-payment-link.mjs
// Cree un lien de paiement Airwallex pour un abonnement Melunga.
// Recoit du front : { device_id, plan ('monthly'|'annual'), email, password }
// - Hash le mot de passe (PBKDF2 + sel aleatoire) : le mot de passe en clair
//   ne quitte jamais cette fonction et n'est jamais stocke.
// - Met les infos dans les metadata du payment link (au cas ou Airwallex les
//   propage jusqu'au payment_intent)
// - ET enregistre un "pending" dans Netlify Blobs, cle par l'id du lien,
//   pour que le webhook retrouve le compte a creer meme si les metadata
//   du payment_intent arrivent vides (comportement observe en production).
//
// Variables d'environnement requises :
//   AIRWALLEX_CLIENT_ID, AIRWALLEX_API_KEY, AIRWALLEX_ENV ('demo' ou 'live')

import crypto from 'node:crypto';
import { getStore } from '@netlify/blobs';
import {
  cleanDeviceId,
  cleanEmail,
  deviceLabelFor,
  deviceTypeFor
} from './device-access.mjs';

const PBKDF2_ITERATIONS = 100000;
const PBKDF2_KEYLEN = 32;
const PBKDF2_DIGEST = 'sha256';

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
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Airwallex auth failed: ${res.status} ${t}`);
  }
  const data = await res.json();
  return data.token;
}

// Cree un Customer Airwallex avec l'email du client, pour que la page de
// paiement arrive pre-remplie (le client ne retape pas son email).
// Si le customer existe deja (reabonnement), on le retrouve au lieu d'echouer.
async function getOrCreateCustomer(token, email) {
  try {
    const createRes = await fetch(`${baseUrl()}/api/v1/pa/customers/create`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        request_id: 'cust_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
        merchant_customer_id: email,
        email: email
      })
    });
    if (createRes.ok) {
      const c = await createRes.json();
      console.log('[create-payment-link] customer cree =', c.id);
      return c.id;
    }
    // Deja existant ? On le recherche par merchant_customer_id.
    const listRes = await fetch(`${baseUrl()}/api/v1/pa/customers?merchant_customer_id=${encodeURIComponent(email)}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (listRes.ok) {
      const list = await listRes.json();
      if (list.items && list.items.length) {
        console.log('[create-payment-link] customer existant retrouve =', list.items[0].id);
        return list.items[0].id;
      }
    }
  } catch (e) {
    console.error('[create-payment-link] getOrCreateCustomer echec:', e);
  }
  return null; // sans customer, le lien marche quand meme (email a saisir)
}

// Tarification geolocalisee : EUR pour UE + EEE + UK, USD pour le reste
// (Suisse incluse dans la zone USD).
const EUR_ZONE = new Set([
  'AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT',
  'LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE',
  'IS','LI','NO', // EEE
  'GB' // Royaume-Uni
]);

function plansFor(countryCode) {
  if (countryCode && EUR_ZONE.has(countryCode)) {
    return {
      monthly: { amount: 7.90, currency: 'EUR', days: 30,  title: 'Melunga · Abonnement mensuel' },
      annual:  { amount: 42.00, currency: 'EUR', days: 365, title: 'Melunga · Abonnement annuel' }
    };
  }
  return {
    monthly: { amount: 8.90, currency: 'USD', days: 30,  title: 'Melunga · Monthly subscription' },
    annual:  { amount: 49.00, currency: 'USD', days: 365, title: 'Melunga · Annual subscription' }
  };
}

export default async (req, context) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), { status: 405 });
  }
  try {
    let body = {};
    try { body = await req.json(); } catch (e) { body = {}; }

    const deviceId = cleanDeviceId(body && body.device_id);
    if (!deviceId) {
      console.log('[create-payment-link] missing device_id, body =', JSON.stringify(body));
      return new Response(JSON.stringify({ error: 'missing_device_id' }), { status: 400 });
    }
    const deviceType = deviceTypeFor(req, body && body.device_type);
    const deviceLabel = deviceLabelFor(req, body && body.device_label, deviceType);

    // Email normalise en minuscules : evite les comptes en double a cause
    // des majuscules automatiques des claviers mobiles.
    const email = cleanEmail(body && body.email);
    const password = (body && body.password ? String(body.password) : '');
    if (!email || email.indexOf('@') < 0) {
      return new Response(JSON.stringify({ error: 'invalid_email' }), { status: 400 });
    }
    if (!password || password.length < 6) {
      return new Response(JSON.stringify({ error: 'password_too_short' }), { status: 400 });
    }

    const store = getStore({ name: 'melunga-access', consistency: 'strong' });

    // Email deja utilise par un abonnement encore actif -> refus.
    // (Un compte expire peut se reabonner avec le meme email.)
    try {
      const existing = await store.get('email:' + email, { type: 'json' });
      if (existing && existing.paid && existing.expiry && existing.expiry > Date.now()) {
        return new Response(JSON.stringify({ error: 'email_taken' }), { status: 409 });
      }
    } catch (e) { /* compte inexistant : ok */ }

    // Hash du mot de passe : PBKDF2-SHA256, 100000 iterations, sel 16 octets.
    // Ces parametres DOIVENT rester identiques a ceux de login.mjs.
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = crypto
      .pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST)
      .toString('hex');

    const countryCode = (context.geo && context.geo.country && context.geo.country.code) || null;
    const PLANS = plansFor(countryCode);
    const planKey = (body && PLANS[body.plan]) ? body.plan : 'monthly';
    const plan = PLANS[planKey];
    console.log('[create-payment-link] country =', countryCode, 'plan =', planKey, 'email =', email);

    const token = await getAccessToken();

    // Pre-remplissage de la page de paiement avec l'email deja saisi dans l'app
    const customerId = await getOrCreateCustomer(token, email);

    const requestId = `melunga_${deviceId.slice(0, 40)}_${Date.now()}`;
    const linkPayload = {
      request_id: requestId,
      amount: plan.amount,
      currency: plan.currency,
      title: plan.title,
      reusable: false,
      ...(customerId ? { customer_id: customerId } : {}),
      collectable_shopper_info: { message: false, phone_number: false, reference: false, shipping_address: false },
      metadata: {
        device_id: deviceId,
        device_type: deviceType,
        device_label: deviceLabel,
        plan: planKey,
        access_days: String(plan.days),
        email: email,
        password_hash: passwordHash,
        salt: salt,
        product: 'melunga_access',
        country: countryCode || ''
      }
    };

    const linkRes = await fetch(`${baseUrl()}/api/v1/pa/payment_links/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(linkPayload)
    });

    const linkBodyText = await linkRes.text();
    console.log('[create-payment-link] payment_links/create status =', linkRes.status);

    if (!linkRes.ok) {
      console.error('[create-payment-link] link creation failed:', linkBodyText);
      return new Response(JSON.stringify({ error: 'link_creation_failed' }), { status: 502 });
    }

    const linkData = JSON.parse(linkBodyText);

    // Enregistrement "pending" : c'est LA source fiable pour le webhook,
    // qui la retrouve via l'id du lien meme si les metadata du
    // payment_intent arrivent vides. TTL logique de 48h geree cote webhook.
    const pending = {
      deviceId: deviceId,
      deviceType: deviceType,
      deviceLabel: deviceLabel,
      email: email,
      passwordHash: passwordHash,
      salt: salt,
      plan: planKey,
      accessDays: plan.days,
      linkId: linkData.id,
      requestId: requestId,
      created: Date.now()
    };
    await store.setJSON('pending:link:' + linkData.id, pending);
    await store.setJSON('pending:device:' + deviceId, pending);
    console.log('[create-payment-link] pending enregistre, link id =', linkData.id);

    return new Response(JSON.stringify({ url: linkData.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('[create-payment-link] EXCEPTION:', err);
    return new Response(JSON.stringify({ error: 'server_error' }), { status: 500 });
  }
};
