import crypto from 'node:crypto';
import { getAccessStore } from './access-store.mjs';
import {
  cleanDeviceId,
  cleanEmail,
  deviceTypeFor,
  ensureDeviceSlots,
  hashSessionToken,
  makeDeviceSlot,
  randomSessionToken
} from './device-access.mjs';
import { jsonResponse, preflight } from './cors.mjs';
import { hasPermanentAccess } from './complimentary-access.mjs';

function codeHash(secret, email, deviceType, deviceId, code) {
  return crypto
    .createHmac('sha256', secret)
    .update([email, deviceType, deviceId, code].join('|'))
    .digest('hex');
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
    const deviceId = cleanDeviceId(body.device_id);
    const deviceType = deviceTypeFor(req, body.device_type);
    const code = body.code ? String(body.code).replace(/\D/g, '').slice(0, 6) : '';

    if (!email || !deviceId || code.length !== 6) {
      return jsonResponse(req, { success: false, error: 'invalid_request' }, 400);
    }

    const store = getAccessStore();
    const pendingKey = ['replacement', email, deviceType].join(':');
    const pending = await store.get(pendingKey, { type: 'json' }).catch(() => null);

    if (!pending || pending.deviceId !== deviceId || pending.expires <= Date.now()) {
      if (pending && pending.expires <= Date.now()) {
        await store.delete(pendingKey).catch(() => {});
      }
      return jsonResponse(req, { success: false, error: 'code_expired' }, 410);
    }
    if ((pending.attempts || 0) >= 5) {
      await store.delete(pendingKey).catch(() => {});
      return jsonResponse(req, { success: false, error: 'too_many_attempts' }, 429);
    }

    const suppliedHash = codeHash(replacementSecret, email, deviceType, deviceId, code);
    const suppliedBuffer = Buffer.from(suppliedHash, 'utf8');
    const expectedBuffer = Buffer.from(String(pending.codeHash || ''), 'utf8');
    const codeValid = suppliedBuffer.length === expectedBuffer.length
      && crypto.timingSafeEqual(suppliedBuffer, expectedBuffer);

    if (!codeValid) {
      await store.setJSON(pendingKey, {
        ...pending,
        attempts: (pending.attempts || 0) + 1
      });
      return jsonResponse(req, { success: false, error: 'invalid_code' }, 401);
    }

    const accountKey = 'email:' + email;
    let committed = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const snapshot = await store.getWithMetadata(accountKey, { type: 'json' });
      const account = snapshot ? snapshot.data : null;
      if (hasPermanentAccess(account)) {
        return jsonResponse(req, { success: false, error: 'shared_account_managed_by_owner' }, 409);
      }
      if (!account || !account.paid || account.expiry <= Date.now()) {
        return jsonResponse(req, { success: false, error: 'subscription_expired' }, 403);
      }
      if (!snapshot.etag) break;

      const devices = ensureDeviceSlots(account);
      const oldSlot = devices[deviceType];
      const now = Date.now();
      const sessionToken = randomSessionToken();
      const sessionHash = hashSessionToken(sessionToken);
      devices[deviceType] = {
        ...makeDeviceSlot({ deviceId, deviceType, deviceLabel: pending.deviceLabel, now }),
        sessionHash
      };

      const result = await store.setJSON(accountKey, {
        ...account,
        devices,
        updated: now
      }, { onlyIfMatch: snapshot.etag });
      if (result.modified) {
        committed = { account, oldSlot, now, sessionToken, sessionHash };
        break;
      }
    }
    if (!committed) return jsonResponse(req, { success: false, error: 'account_update_conflict' }, 409);
    const { account, oldSlot, now, sessionToken, sessionHash } = committed;
    await store.setJSON('session:' + sessionHash, {
      email,
      deviceId,
      deviceType,
      created: now,
      lastSeen: now,
      expiry: account.expiry
    });
    await store.setJSON(deviceId, {
      paid: true,
      expiry: account.expiry,
      plan: account.plan || 'monthly',
      email,
      deviceType,
      sessionHash,
      updated: now
    });

    if (oldSlot && oldSlot.sessionHash) {
      await store.delete('session:' + oldSlot.sessionHash).catch(() => {});
    }
    const oldDeviceId = oldSlot && cleanDeviceId(oldSlot.deviceId);
    if (oldDeviceId && oldDeviceId === oldSlot.deviceId && oldDeviceId !== deviceId) {
      await store.delete(oldDeviceId).catch(() => {});
    }
    await store.delete(pendingKey).catch(() => {});

    return jsonResponse(req, {
      success: true,
      device_type: deviceType,
      session_token: sessionToken,
      expiry: account.expiry
    });
  } catch (err) {
    console.error('[confirm-device-replacement] EXCEPTION:', err);
    return jsonResponse(req, { success: false, error: 'server_error' }, 500);
  }
};
