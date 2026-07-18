import { getStore } from '@netlify/blobs';
import {
  cleanDeviceId,
  ensureDeviceSlots,
  hashSessionToken
} from './device-access.mjs';
import { jsonResponse, preflight } from './cors.mjs';

function bearerToken(req) {
  const header = req.headers.get('authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : '';
}

export default async (req) => {
  const preflightResponse = preflight(req);
  if (preflightResponse) return preflightResponse;

  if (req.method !== 'POST') {
    return jsonResponse(req, { success: false, error: 'method_not_allowed' }, 405);
  }

  try {
    let body = {};
    try { body = await req.json(); } catch (_) { body = {}; }

    const store = getStore({ name: 'melunga-access', consistency: 'strong' });
    const token = bearerToken(req);
    const sessionHash = token ? hashSessionToken(token) : '';
    const session = sessionHash
      ? await store.get('session:' + sessionHash, { type: 'json' }).catch(() => null)
      : null;

    const deviceId = cleanDeviceId(session ? session.deviceId : body.device_id);
    const deviceRecord = deviceId
      ? await store.get(deviceId, { type: 'json' }).catch(() => null)
      : null;

    const email = session && session.email
      ? session.email
      : deviceRecord && deviceRecord.email
        ? deviceRecord.email
        : '';
    const deviceType = session && session.deviceType
      ? session.deviceType
      : deviceRecord && deviceRecord.deviceType
        ? deviceRecord.deviceType
        : '';

    if (email && (deviceType === 'desktop' || deviceType === 'mobile')) {
      const accountKey = 'email:' + email;
      const account = await store.get(accountKey, { type: 'json' }).catch(() => null);
      const devices = ensureDeviceSlots(account);
      const slot = devices[deviceType];

      if (slot && slot.deviceId === deviceId) {
        devices[deviceType] = null;
        await store.setJSON(accountKey, {
          ...account,
          devices,
          updated: Date.now()
        });
      }
    }

    if (sessionHash) {
      await store.delete('session:' + sessionHash).catch(() => {});
    }
    if (deviceId) {
      await store.delete(deviceId).catch(() => {});
    }

    return jsonResponse(req, { success: true });
  } catch (err) {
    console.error('[logout] EXCEPTION:', err);
    return jsonResponse(req, { success: false, error: 'server_error' }, 500);
  }
};
