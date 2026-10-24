import { getAccessStore } from './access-store.mjs';
import {
  cleanDeviceId,
  deviceLabelFor,
  deviceLimitFor,
  deviceTypeFor,
  ensureDeviceMap,
  ensureDeviceSlots,
  hashSessionToken,
  makeDeviceSlot
} from './device-access.mjs';
import { jsonResponse, preflight } from './cors.mjs';
import { accessExpiry, accountHasAccess, hasPermanentAccess } from './complimentary-access.mjs';

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

  /*
   * Comptes plafonnés (deviceLimit) : le slot est indexé par deviceId
   * dans la map, et non par type d'appareil.
   */
  if (deviceLimitFor(account) > 0) {
    const slot = ensureDeviceMap(account)[session.deviceId];
    const paid = !!(
      accountHasAccess(account)
      && slot
      && slot.deviceId === session.deviceId
      && slot.sessionHash === sessionHash
    );

    if (!paid) {
      return { paid: false, error: 'session_revoked' };
    }

    return {
      paid: true,
      expiry: accessExpiry(account),
      device_type: session.deviceType,
      ...(hasPermanentAccess(account) ? { permanent: true } : {})
    };
  }

  const slot = ensureDeviceSlots(account)[session.deviceType];
  const paid = !!(
    accountHasAccess(account)
    && slot
    && slot.deviceId === session.deviceId
    && slot.sessionHash === sessionHash
  );

  if (!paid) {
    return { paid: false, error: 'session_revoked' };
  }

  return {
    paid: true,
    expiry: accessExpiry(account),
    device_type: session.deviceType,
    ...(hasPermanentAccess(account) ? { permanent: true } : {})
  };
}

async function checkLegacyDevice(store, deviceId, req, attempt = 0) {
  if (attempt >= 8) return { paid: false, error: 'account_changed_retry' };
  const recordSnapshot = await store.getWithMetadata(deviceId, { type: 'json' });
  const record = recordSnapshot && recordSnapshot.data;
  if (!record) return { paid: false, expiry: null };

  /*
   * Les anciens paiements ne contenaient pas encore l'e-mail et le type.
   * Ils restent valides pendant la migration. Tout enregistrement créé par
   * la nouvelle version doit correspondre au slot actif du compte.
   */
  if (!record.email) {
    if (!record.paid || record.expiry <= Date.now()) {
      return { paid: false, expiry: record.expiry };
    }
    return {
      paid: true,
      expiry: record.expiry,
      legacy_session: true
    };
  }

  const accountSnapshot = await store.getWithMetadata('email:' + record.email, { type: 'json' });
  const account = accountSnapshot && accountSnapshot.data;

  // A permanent grant belongs to the account, never to an arbitrary device cache.
  // Its session backing is checked even on the older device_id entry point.
  if (hasPermanentAccess(account)) {
    const slot = deviceLimitFor(account) > 0
      ? ensureDeviceMap(account)[deviceId]
      : ensureDeviceSlots(account)[record.deviceType || deviceTypeFor(req, null)];
    const sessionHash = slot && slot.sessionHash;
    const session = sessionHash
      ? await store.get('session:' + sessionHash, { type: 'json' }).catch(() => null)
      : null;
    const paid = !!(slot && slot.deviceId === deviceId
      && sessionHash && record.sessionHash === sessionHash
      && session && session.email === record.email && session.deviceId === deviceId
      && session.deviceType === slot.deviceType);
    return {
      paid,
      expiry: null,
      ...(paid ? { permanent: true } : {}),
      device_type: slot ? slot.deviceType : (record.deviceType || deviceTypeFor(req, null)),
      error: paid ? undefined : 'session_revoked'
    };
  }

  if (!record.paid || record.expiry <= Date.now()) {
    return { paid: false, expiry: record.expiry };
  }
  if (!account || !account.paid || account.expiry <= Date.now()) {
    return { paid: false, error: 'subscription_expired' };
  }

  /*
   * Comptes plafonnés (deviceLimit) : lecture directe par deviceId dans la
   * map. Aucune migration/creation de slot ici — l'appareil doit avoir été
   * enregistré au préalable via login.
   */
  if (deviceLimitFor(account) > 0) {
    const slot = ensureDeviceMap(account)[deviceId];
    const paid = !!(slot && slot.deviceId === deviceId);
    return {
      paid,
      expiry: paid ? account.expiry : null,
      device_type: slot ? slot.deviceType : (record.deviceType || deviceTypeFor(req, null)),
      error: paid ? undefined : 'session_revoked'
    };
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
    if (typeof accountSnapshot.etag !== 'string' || !accountSnapshot.etag
      || typeof recordSnapshot.etag !== 'string' || !recordSnapshot.etag) {
      return { paid: false, error: 'server_error' };
    }
    slot = makeDeviceSlot({
      deviceId,
      deviceType: migratedType,
      deviceLabel: deviceLabelFor(req, null, migratedType)
    });
    devices[migratedType] = slot;
    const written = await store.setJSON('email:' + record.email, {
      ...account,
      devices,
      updated: Date.now()
    }, { onlyIfMatch: accountSnapshot.etag });
    if (!written.modified) return checkLegacyDevice(store, deviceId, req, attempt + 1);
    const cacheWritten = await store.setJSON(deviceId, {
      ...record,
      email: record.email,
      deviceType: migratedType,
      updated: Date.now()
    }, { onlyIfMatch: recordSnapshot.etag });
    if (!cacheWritten.modified) return checkLegacyDevice(store, deviceId, req, attempt + 1);
    const confirmedAccount = await store.get('email:' + record.email, { type: 'json' }).catch(() => null);
    if (hasPermanentAccess(confirmedAccount)) return checkLegacyDevice(store, deviceId, req, attempt + 1);
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
    const store = getAccessStore();
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
