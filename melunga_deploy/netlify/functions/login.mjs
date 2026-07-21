import crypto from 'node:crypto';
import { getStore } from '@netlify/blobs';
import {
  cleanDeviceId,
  cleanEmail,
  countDevices,
  deviceLabelFor,
  deviceLimitFor,
  deviceTypeFor,
  ensureDeviceMap,
  ensureDeviceSlots,
  hashSessionToken,
  makeDeviceSlot,
  randomSessionToken,
  safeDeviceSummary
} from './device-access.mjs';
import { jsonResponse, preflight } from './cors.mjs';

const PBKDF2_ITERATIONS = 100000;
const PBKDF2_KEYLEN = 32;
const PBKDF2_DIGEST = 'sha256';

export default async (req) => {
  const preflightResponse = preflight(req);
  if (preflightResponse) return preflightResponse;

  if (req.method !== 'POST') {
    return jsonResponse(req, { success: false, error: 'method_not_allowed' }, 405);
  }

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

    const store = getStore({ name: 'melunga-access', consistency: 'strong' });
    const accountKey = 'email:' + email;
    const account = await store.get(accountKey, { type: 'json' }).catch(() => null);

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

    if (!account.paid || !account.expiry || account.expiry <= Date.now()) {
      return jsonResponse(req, { success: false, error: 'subscription_expired' }, 403);
    }

    /* ---------------------------------------------------------------- *
     * Comptes plafonnés (deviceLimit) : registre indexé par deviceId,
     * tous types confondus, avec refus strict au-delà de la limite.
     * Un appareil déjà enregistré peut se reconnecter librement.
     * ---------------------------------------------------------------- */
    const limit = deviceLimitFor(account);
    if (limit > 0) {
      const deviceMap = ensureDeviceMap(account);
      const existing = deviceMap[deviceId] || null;

      if (!existing && countDevices(deviceMap) >= limit) {
        return jsonResponse(req, {
          success: false,
          error: 'device_limit_reached',
          device_limit: limit,
          device_count: countDevices(deviceMap)
        }, 409);
      }

      const now = Date.now();
      const sessionToken = randomSessionToken();
      const sessionHash = hashSessionToken(sessionToken);

      const newSlot = {
        ...makeDeviceSlot({ deviceId, deviceType, deviceLabel, previousSlot: existing, now }),
        sessionHash
      };
      deviceMap[deviceId] = newSlot;

      await store.setJSON(accountKey, {
        ...account,
        devices: deviceMap,
        updated: now
      });

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
        plan: account.plan || 'demo',
        email,
        deviceType,
        sessionHash,
        updated: now
      });

      /*
       * Relecture de sécurité : on confirme que notre écriture est bien
       * celle qui a survécu pour ce deviceId (deux connexions du même
       * appareil au même instant sont possibles).
       */
      const confirmedAccount = await store.get(accountKey, { type: 'json' }).catch(() => null);
      const confirmedSlot = ensureDeviceMap(confirmedAccount)[deviceId];
      if (!confirmedSlot || confirmedSlot.sessionHash !== sessionHash) {
        await store.delete('session:' + sessionHash).catch(() => {});
        return jsonResponse(req, {
          success: false,
          error: 'device_limit_reached',
          device_limit: limit
        }, 409);
      }

      return jsonResponse(req, {
        success: true,
        device_type: deviceType,
        device_label: deviceLabel,
        session_token: sessionToken,
        expiry: account.expiry
      });
    }

    /* ---------------------------------------------------------------- *
     * Comptes standard : comportement historique à deux slots
     * (1 mobile + 1 PC), inchangé.
     * ---------------------------------------------------------------- */
    const devices = ensureDeviceSlots(account);
    const occupiedSlot = devices[deviceType];

    if (occupiedSlot && occupiedSlot.deviceId !== deviceId) {
      return jsonResponse(req, {
        success: false,
        error: 'device_limit_reached',
        device_type: deviceType,
        existing_device: safeDeviceSummary(occupiedSlot)
      }, 409);
    }

    const now = Date.now();
    const sessionToken = randomSessionToken();
    const sessionHash = hashSessionToken(sessionToken);

    const newSlot = {
      ...makeDeviceSlot({
        deviceId,
        deviceType,
        deviceLabel,
        previousSlot: occupiedSlot,
        now
      }),
      sessionHash
    };

    devices[deviceType] = newSlot;

    await store.setJSON(accountKey, {
      ...account,
      devices,
      updated: now
    });

    await store.setJSON('session:' + sessionHash, {
      email,
      deviceId,
      deviceType,
      created: now,
      lastSeen: now,
      expiry: account.expiry
    });

    /*
     * Enregistrement compatible avec le check-status historique. Il permet
     * une migration progressive du site, tout en vérifiant désormais que le
     * device est bien le slot actif du compte.
     */
    await store.setJSON(deviceId, {
      paid: true,
      expiry: account.expiry,
      plan: account.plan || 'monthly',
      email,
      deviceType,
      sessionHash,
      updated: now
    });

    /*
     * Une seconde connexion arrivée au même instant peut avoir remplacé ce
     * slot entre-temps. La relecture évite d'annoncer un succès si ce login
     * n'est déjà plus le titulaire du slot.
     */
    const confirmedAccount = await store.get(accountKey, { type: 'json' }).catch(() => null);
    const confirmedSlot = ensureDeviceSlots(confirmedAccount)[deviceType];
    if (!confirmedSlot
      || confirmedSlot.deviceId !== deviceId
      || confirmedSlot.sessionHash !== sessionHash) {
      await store.delete('session:' + sessionHash).catch(() => {});
      return jsonResponse(req, {
        success: false,
        error: 'device_limit_reached',
        device_type: deviceType
      }, 409);
    }

    return jsonResponse(req, {
      success: true,
      device_type: deviceType,
      device_label: deviceLabel,
      session_token: sessionToken,
      expiry: account.expiry
    });
  } catch (err) {
    console.error('[login] EXCEPTION:', err);
    return jsonResponse(req, { success: false, error: 'server_error' }, 500);
  }
};
