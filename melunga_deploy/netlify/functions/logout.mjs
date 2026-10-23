import { getAccessStore } from './access-store.mjs';
import {
  cleanDeviceId, deviceLimitFor, ensureDeviceMap, ensureDeviceSlots, hashSessionToken
} from './device-access.mjs';
import { jsonResponse, preflight } from './cors.mjs';
import { hasPermanentAccess } from './complimentary-access.mjs';

function bearerToken(req) {
  const match = (req.headers.get('authorization') || '').match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : '';
}

export default async (req) => {
  const preflightResponse = preflight(req);
  if (preflightResponse) return preflightResponse;
  if (req.method !== 'POST') return jsonResponse(req, { success: false, error: 'method_not_allowed' }, 405);

  try {
    let body = {};
    try { body = await req.json(); } catch (_) { body = {}; }
    const store = getAccessStore();
    const token = bearerToken(req);
    const sessionHash = token ? hashSessionToken(token) : '';
    const session = sessionHash ? await store.get('session:' + sessionHash, { type: 'json' }) : null;
    const deviceId = cleanDeviceId(session ? session.deviceId : body.device_id);
    const cacheSnapshot = deviceId ? await store.getWithMetadata(deviceId, { type: 'json' }) : null;
    const deviceRecord = cacheSnapshot && cacheSnapshot.data;
    const email = session && session.email ? session.email : deviceRecord && deviceRecord.email || '';
    const deviceType = session && session.deviceType ? session.deviceType : deviceRecord && deviceRecord.deviceType || '';
    const accountKey = email ? 'email:' + email : '';
    const targetHash = token ? sessionHash : deviceRecord && deviceRecord.sessionHash || '';
    const ownsCache = !!(deviceRecord && deviceRecord.email === email
      && (!token || deviceRecord.sessionHash === sessionHash));

    let accountSettled = !accountKey;
    for (let attempt = 0; accountKey && attempt < 8; attempt += 1) {
      const snapshot = await store.getWithMetadata(accountKey, { type: 'json' });
      const account = snapshot && snapshot.data;
      if (hasPermanentAccess(account)) {
        if (token && !session) return jsonResponse(req, { success: false, error: 'invalid_session' }, 401);
        const slot = deviceLimitFor(account) > 0 ? ensureDeviceMap(account)[deviceId] : ensureDeviceSlots(account)[deviceType];
        const currentHash = slot && slot.deviceId === deviceId ? slot.sessionHash : '';
        const revokeHash = token ? sessionHash : ownsCache && targetHash === currentHash ? targetHash : '';
        // Revoke the immutable session key only. The registered place and cache
        // are kept, so a stale logout cannot erase a newer login for this ID.
        if (revokeHash) await store.delete('session:' + revokeHash);
        return jsonResponse(req, { success: true });
      }

      const devices = ensureDeviceSlots(account);
      const slot = devices[deviceType];
      if (!snapshot || !slot || slot.deviceId !== deviceId || ((slot.sessionHash || targetHash) && slot.sessionHash !== targetHash)) {
        accountSettled = true; break;
      }
      if (typeof snapshot.etag !== 'string' || !snapshot.etag) {
        return jsonResponse(req, { success: false, error: 'server_error' }, 500);
      }
      devices[deviceType] = null;
      const written = await store.setJSON(accountKey, { ...account, devices, updated: Date.now() }, { onlyIfMatch: snapshot.etag });
      if (!written.modified) continue;
      accountSettled = true; break;
    }
    if (!accountSettled) return jsonResponse(req, { success: false, error: 'account_changed_retry' }, 409);

    // The SDK has no conditional delete. A false cache written by revision is a
    // logout tombstone: legacy status stays false, and a newer cache is spared.
    if (cacheSnapshot && ownsCache) {
      if (typeof cacheSnapshot.etag !== 'string' || !cacheSnapshot.etag) {
        return jsonResponse(req, { success: false, error: 'server_error' }, 500);
      }
      await store.setJSON(deviceId, { ...deviceRecord, paid: false, updated: Date.now() }, { onlyIfMatch: cacheSnapshot.etag });
    }
    if (targetHash && (token && session || ownsCache)) await store.delete('session:' + targetHash);
    return jsonResponse(req, { success: true });
  } catch (err) {
    console.error('[logout] EXCEPTION:', err);
    return jsonResponse(req, { success: false, error: 'server_error' }, 500);
  }
};
