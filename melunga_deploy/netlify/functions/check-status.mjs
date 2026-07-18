import { getStore } from '@netlify/blobs';
import {
  cleanDeviceId,
  deviceLabelFor,
  deviceTypeFor,
  ensureDeviceSlots,
  hashSessionToken,
  makeDeviceSlot
} from './device-access.mjs';
import { jsonResponse, preflight } from './cors.mjs';

function bearerToken(req) {
  const header = req.headers.get('authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : '';
}

async function checkTokenSession(store, token) {
  const sessionHash = hashSessionToken(token);
  const session = await store.get('session:' + sessionHash, { type: 'json' }).catch(() => null);

  if (!session || !session.email || !session.deviceId || !session.deviceType) {
    return { paid: false, error: 'invalid_session' };
  }

  const account = await store.get('email:' + session.email, { type: 'json' }).catch(() => null);
  const slot = ensureDeviceSlots(account)[session.deviceType];
  const paid = !!(
    account
    && account.paid
    && account.expiry > Date.now()
    && slot
    && slot.deviceId === session.deviceId
    && slot.sessionHash === sessionHash
  );

  if (!paid) {
    return { paid: false, error: 'session_revoked' };
  }

  return {
    paid: true,
    expiry: account.expiry,
    device_type: session.deviceType
  };
}

async function checkLegacyDevice(store, deviceId, req) {
  const record = await store.get(deviceId, { type: 'json' }).catch(() => null);
  if (!record || !record.paid || record.expiry <= Date.now()) {
    return { paid: false, expiry: record ? record.expiry : null };
  }

  /*
   * Les anciens paiements ne contenaient pas encore l'e-mail et le type.
   * Ils restent valides pendant la migration. Tout enregistrement créé par
   * la nouvelle version doit correspondre au slot actif du compte.
   */
  if (!record.email) {
    return {
      paid: true,
      expiry: record.expiry,
      legacy_session: true
    };
  }

  const account = await store.get('email:' + record.email, { type: 'json' }).catch(() => null);
  if (!account || !account.paid || account.expiry <= Date.now()) {
    return { paid: false, error: 'subscription_expired' };
  }

  /*
   * Migration automatique des connexions créées avant l'ajout des deux
   * slots. Le premier appareil actif de chaque catégorie prend le slot ;
   * les appareils supplémentaires du même type sont immédiatement refusés.
   */
  const migratedType = record.deviceType || deviceTypeFor(req, null);
  const devices = ensureDeviceSlots(account);
  let slot = devices[migratedType];

  if (!slot) {
    slot = makeDeviceSlot({
      deviceId,
      deviceType: migratedType,
      deviceLabel: deviceLabelFor(req, null, migratedType)
    });
    devices[migratedType] = slot;
    await store.setJSON('email:' + record.email, {
      ...account,
      devices,
      updated: Date.now()
    });
    await store.setJSON(deviceId, {
      ...record,
      email: record.email,
      deviceType: migratedType,
      updated: Date.now()
    });
    const confirmedAccount = await store.get('email:' + record.email, { type: 'json' }).catch(() => null);
    slot = ensureDeviceSlots(confirmedAccount)[migratedType];
  }

  const paid = !!(
    slot
    && slot.deviceId === deviceId
  );

  return {
    paid,
    expiry: paid ? account.expiry : null,
    device_type: migratedType,
    error: paid ? undefined : 'session_revoked'
  };
}

export default async (req) => {
  const preflightResponse = preflight(req);
  if (preflightResponse) return preflightResponse;

  try {
    const store = getStore({ name: 'melunga-access', consistency: 'strong' });
    const token = bearerToken(req);

    if (token) {
      const result = await checkTokenSession(store, token);
      return jsonResponse(req, result, result.paid ? 200 : 401);
    }

    const url = new URL(req.url);
    const deviceId = cleanDeviceId(url.searchParams.get('device_id'));
    if (!deviceId) {
      return jsonResponse(req, { paid: false, error: 'missing_authentication' }, 400);
    }

    return jsonResponse(req, await checkLegacyDevice(store, deviceId, req));
  } catch (err) {
    console.error('[check-status] EXCEPTION:', err);
    return jsonResponse(req, { paid: false, error: 'server_error' }, 500);
  }
};
