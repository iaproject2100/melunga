import crypto from 'node:crypto';
import { getAccessStore } from './access-store.mjs';
import {
  cleanDeviceId, cleanEmail, countDevices, deviceLabelFor, deviceLimitFor,
  deviceTypeFor, ensureDeviceMap, ensureDeviceSlots, hashSessionToken,
  makeDeviceSlot, randomSessionToken, safeDeviceSummary
} from './device-access.mjs';
import { jsonResponse, preflight } from './cors.mjs';
import { accessExpiry, accountHasAccess, hasPermanentAccess } from './complimentary-access.mjs';

const PBKDF2_ITERATIONS = 100000;
const PBKDF2_KEYLEN = 32;
const PBKDF2_DIGEST = 'sha256';
const MAX_ACCOUNT_ATTEMPTS = 8;

function slotFor(account, deviceId, deviceType) {
  return deviceLimitFor(account) > 0
    ? ensureDeviceMap(account)[deviceId]
    : ensureDeviceSlots(account)[deviceType];
}

function passwordMatches(account, password) {
  const attempt = crypto.pbkdf2Sync(password, account.salt,
    PBKDF2_ITERATIONS, PBKDF2_KEYLEN, PBKDF2_DIGEST).toString('hex');
  const actual = Buffer.from(attempt, 'utf8');
  const expected = Buffer.from(String(account.passwordHash), 'utf8');
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

async function finishLogin(store, accountKey, identity, sessionHash, sessionToken, firstAccount) {
  const { email, deviceId, deviceType, deviceLabel } = identity;
  const now = Date.now();
  await store.setJSON('session:' + sessionHash, {
    email, deviceId, deviceType, created: now, lastSeen: now,
    expiry: accessExpiry(firstAccount)
  });

  // A slower login must not overwrite the device cache of a newer login.
  for (let attempt = 0; attempt < MAX_ACCOUNT_ATTEMPTS; attempt += 1) {
    const previousCache = await store.getWithMetadata(deviceId, { type: 'json' });
    if (previousCache && (typeof previousCache.etag !== 'string' || !previousCache.etag)) {
      await store.delete('session:' + sessionHash);
      throw new Error('device_cache_revision_missing');
    }
    const account = await store.get(accountKey, { type: 'json' });
    const slot = slotFor(account, deviceId, deviceType);
    if (!accountHasAccess(account) || !slot || slot.deviceId !== deviceId || slot.sessionHash !== sessionHash) break;

    const written = await store.setJSON(deviceId, {
      paid: true,
      expiry: accessExpiry(account),
      plan: account.plan || (deviceLimitFor(account) > 0 ? 'demo' : 'monthly'),
      email, deviceType, sessionHash, updated: now
    }, previousCache ? { onlyIfMatch: previousCache.etag } : { onlyIfNew: true });
    if (!written.modified) continue;

    const confirmed = await store.get(accountKey, { type: 'json' });
    const confirmedSlot = slotFor(confirmed, deviceId, deviceType);
    const confirmedSession = await store.get('session:' + sessionHash, { type: 'json' });
    if (accountHasAccess(confirmed) && confirmedSlot && confirmedSlot.deviceId === deviceId
      && confirmedSlot.sessionHash === sessionHash && confirmedSession
      && confirmedSession.email === email && confirmedSession.deviceId === deviceId
      && confirmedSession.deviceType === deviceType) {
      return {
        success: true, device_type: deviceType, device_label: deviceLabel,
        session_token: sessionToken, expiry: accessExpiry(confirmed),
        ...(hasPermanentAccess(confirmed) ? { permanent: true } : {})
      };
    }
    break;
  }

  await store.delete('session:' + sessionHash);
  return null;
}

export default async (req) => {
  const preflightResponse = preflight(req);
  if (preflightResponse) return preflightResponse;
  if (req.method !== 'POST') return jsonResponse(req, { success: false, error: 'method_not_allowed' }, 405);

  try {
    let body = {};
    try { body = await req.json(); } catch (_) { body = {}; }
    const deviceId = cleanDeviceId(body.device_id);
    const email = cleanEmail(body.email);
    const password = body.password ? String(body.password) : '';
    const deviceType = deviceTypeFor(req, body.device_type);
    const deviceLabel = deviceLabelFor(req, body.device_label, deviceType);
    if (!deviceId || !email || !email.includes('@') || !password) {
      return jsonResponse(req, { success: false, error: 'invalid_credentials' }, 400);
    }

    const store = getAccessStore();
    const accountKey = 'email:' + email;
    for (let attempt = 0; attempt < MAX_ACCOUNT_ATTEMPTS; attempt += 1) {
      const snapshot = await store.getWithMetadata(accountKey, { type: 'json' });
      const account = snapshot && snapshot.data;
      if (!account || !account.passwordHash || !account.salt || !passwordMatches(account, password)) {
        return jsonResponse(req, { success: false, error: 'invalid_credentials' }, 401);
      }
      if (!accountHasAccess(account)) {
        return jsonResponse(req, { success: false, error: 'subscription_expired' }, 403);
      }
      if (typeof snapshot.etag !== 'string' || !snapshot.etag) {
        return jsonResponse(req, { success: false, error: 'server_error' }, 500);
      }

      const limit = deviceLimitFor(account);
      const devices = limit > 0 ? ensureDeviceMap(account) : ensureDeviceSlots(account);
      const occupied = limit > 0 ? devices[deviceId] || null : devices[deviceType];
      if (limit > 0 && !occupied && countDevices(devices) >= limit) {
        return jsonResponse(req, {
          success: false, error: 'device_limit_reached', device_limit: limit,
          device_count: countDevices(devices)
        }, 409);
      }
      if (!limit && occupied && occupied.deviceId !== deviceId) {
        return jsonResponse(req, {
          success: false, error: 'device_limit_reached', device_type: deviceType,
          existing_device: safeDeviceSummary(occupied)
        }, 409);
      }

      const now = Date.now();
      const sessionToken = randomSessionToken();
      const sessionHash = hashSessionToken(sessionToken);
      devices[limit > 0 ? deviceId : deviceType] = {
        ...makeDeviceSlot({ deviceId, deviceType, deviceLabel, previousSlot: occupied, now }),
        sessionHash
      };
      const written = await store.setJSON(accountKey, {
        ...account, devices, updated: now
      }, { onlyIfMatch: snapshot.etag });
      if (!written.modified) continue;

      const result = await finishLogin(store, accountKey,
        { email, deviceId, deviceType, deviceLabel }, sessionHash, sessionToken, account);
      if (result) return jsonResponse(req, result);
      return jsonResponse(req, {
        success: false, error: 'device_limit_reached',
        ...(limit > 0 ? { device_limit: limit } : { device_type: deviceType })
      }, 409);
    }

    return jsonResponse(req, { success: false, error: 'account_changed_retry' }, 409);
  } catch (err) {
    console.error('[login] EXCEPTION:', err);
    return jsonResponse(req, { success: false, error: 'server_error' }, 500);
  }
};
