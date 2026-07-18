import crypto from 'node:crypto';
import { getStore } from '@netlify/blobs';
import {
  cleanDeviceId,
  cleanEmail,
  deviceLabelFor,
  deviceTypeFor,
  ensureDeviceSlots
} from './device-access.mjs';
import { jsonResponse, preflight } from './cors.mjs';

const PBKDF2_ITERATIONS = 100000;
const PBKDF2_KEYLEN = 32;
const PBKDF2_DIGEST = 'sha256';
const CODE_LIFETIME_MS = 10 * 60 * 1000;
const RESEND_DELAY_MS = 60 * 1000;

function codeHash(secret, email, deviceType, deviceId, code) {
  return crypto
    .createHmac('sha256', secret)
    .update([email, deviceType, deviceId, code].join('|'))
    .digest('hex');
}

async function sendCode(email, code, deviceLabel) {
  const apiKey = process.env.BREVO_API_KEY || '';
  if (!apiKey) throw new Error('brevo_not_configured');

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      sender: { name: 'Melunga', email: 'contact@melunga.com' },
      to: [{ email }],
      subject: 'Melunga · confirmation du nouvel appareil',
      htmlContent: `<p>Bonjour,</p>
<p>Une demande a été faite pour remplacer votre appareil Melunga par <strong>${deviceLabel}</strong>.</p>
<p>Votre code de confirmation est :</p>
<p style="font-size:28px;font-weight:700;letter-spacing:6px">${code}</p>
<p>Ce code expire dans 10 minutes. Si vous n'êtes pas à l'origine de cette demande, ne communiquez pas ce code et changez votre mot de passe.</p>
<p>L'équipe Melunga 梅伦加</p>`
    })
  });

  if (!response.ok) {
    throw new Error('brevo_send_failed:' + response.status);
  }
}

export default async (req) => {
  const preflightResponse = preflight(req);
  if (preflightResponse) return preflightResponse;

  if (req.method !== 'POST') {
    return jsonResponse(req, { success: false, error: 'method_not_allowed' }, 405);
  }

  try {
    const replacementSecret = process.env.DEVICE_REPLACEMENT_SECRET || '';
    if (!replacementSecret) {
      return jsonResponse(req, { success: false, error: 'replacement_not_configured' }, 503);
    }

    let body = {};
    try { body = await req.json(); } catch (_) { body = {}; }

    const email = cleanEmail(body.email);
    const password = body.password ? String(body.password) : '';
    const deviceId = cleanDeviceId(body.device_id);
    const deviceType = deviceTypeFor(req, body.device_type);
    const deviceLabel = deviceLabelFor(req, body.device_label, deviceType);

    if (!email || !email.includes('@') || !password || !deviceId) {
      return jsonResponse(req, { success: false, error: 'invalid_request' }, 400);
    }

    const store = getStore({ name: 'melunga-access', consistency: 'strong' });
    const account = await store.get('email:' + email, { type: 'json' }).catch(() => null);

    if (!account || !account.passwordHash || !account.salt) {
      return jsonResponse(req, { success: false, error: 'invalid_credentials' }, 401);
    }

    const attempt = crypto
      .pbkdf2Sync(password, account.salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST)
      .toString('hex');
    const attemptBuffer = Buffer.from(attempt, 'utf8');
    const expectedBuffer = Buffer.from(String(account.passwordHash), 'utf8');
    const passwordValid = attemptBuffer.length === expectedBuffer.length
      && crypto.timingSafeEqual(attemptBuffer, expectedBuffer);

    if (!passwordValid) {
      return jsonResponse(req, { success: false, error: 'invalid_credentials' }, 401);
    }
    if (!account.paid || account.expiry <= Date.now()) {
      return jsonResponse(req, { success: false, error: 'subscription_expired' }, 403);
    }

    const occupiedSlot = ensureDeviceSlots(account)[deviceType];
    if (!occupiedSlot || occupiedSlot.deviceId === deviceId) {
      return jsonResponse(req, {
        success: false,
        error: 'replacement_not_needed',
        device_type: deviceType
      }, 409);
    }

    const pendingKey = ['replacement', email, deviceType].join(':');
    const existing = await store.get(pendingKey, { type: 'json' }).catch(() => null);
    const now = Date.now();
    if (existing && existing.created && now - existing.created < RESEND_DELAY_MS) {
      return jsonResponse(req, {
        success: false,
        error: 'code_already_sent',
        retry_after: Math.ceil((RESEND_DELAY_MS - (now - existing.created)) / 1000)
      }, 429);
    }

    const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
    await store.setJSON(pendingKey, {
      email,
      deviceId,
      deviceType,
      deviceLabel,
      codeHash: codeHash(replacementSecret, email, deviceType, deviceId, code),
      attempts: 0,
      created: now,
      expires: now + CODE_LIFETIME_MS
    });

    try {
      await sendCode(email, code, deviceLabel);
    } catch (error) {
      await store.delete(pendingKey).catch(() => {});
      console.error('[request-device-replacement] echec email:', error);
      return jsonResponse(req, { success: false, error: 'email_send_failed' }, 502);
    }

    return jsonResponse(req, {
      success: true,
      device_type: deviceType,
      expires_in: CODE_LIFETIME_MS / 1000
    });
  } catch (err) {
    console.error('[request-device-replacement] EXCEPTION:', err);
    return jsonResponse(req, { success: false, error: 'server_error' }, 500);
  }
};
