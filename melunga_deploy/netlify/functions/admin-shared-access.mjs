import crypto from 'node:crypto';
import { getAccessStore } from './access-store.mjs';
import { accountHasAccess, hasPermanentAccess } from './complimentary-access.mjs';
import { cleanDeviceId } from './device-access.mjs';

// This operation is deliberately restricted to the account requested by its owner.
const TARGET_EMAIL = 'contact@melunga.com';
const DEVICE_LIMIT = 30;
const KEY = 'email:' + TARGET_EMAIL;

class ProvisionError extends Error {
  constructor(code, status = 409) { super(code); this.code = code; this.status = status; }
}
const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
});

function authenticated(req) {
  const configured = process.env.ADMIN_SECRET || '';
  const match = (req.headers.get('authorization') || '').match(/^Bearer\s+(\S+)$/i);
  if (!configured || !match) return false;
  const supplied = Buffer.from(match[1]);
  const expected = Buffer.from(configured);
  return supplied.length === expected.length && crypto.timingSafeEqual(supplied, expected);
}

async function readAccount(store) {
  // A failed read must never be treated as a missing account.
  const snapshot = await store.getWithMetadata(KEY, { type: 'json' });
  if (snapshot === null) return { account: null, revision: 'absent' };
  if (!snapshot || !snapshot.data || typeof snapshot.data !== 'object'
      || Array.isArray(snapshot.data) || typeof snapshot.etag !== 'string' || !snapshot.etag) {
    throw new ProvisionError('invalid_store_snapshot', 503);
  }
  if (snapshot.data.email !== TARGET_EMAIL) throw new ProvisionError('account_identity_mismatch');
  return { account: snapshot.data, revision: snapshot.etag };
}

function migratedDevices(account) {
  const result = Object.create(null);
  if (!account || account.devices == null) return result;
  const original = account.devices;
  if (typeof original !== 'object' || Array.isArray(original)) throw new ProvisionError('invalid_device_registry');
  const capped = Number.isInteger(account.deviceLimit) && account.deviceLimit > 0;
  for (const [key, slot] of Object.entries(original)) {
    if (!capped && !['desktop', 'mobile'].includes(key)) throw new ProvisionError('invalid_device_registry');
    if (slot === null && !capped) continue;
    if (!slot || typeof slot !== 'object' || typeof slot.deviceId !== 'string'
        || !slot.deviceId || cleanDeviceId(slot.deviceId) !== slot.deviceId) throw new ProvisionError('invalid_device_registry');
    if (capped && slot.deviceId !== key) throw new ProvisionError('invalid_device_registry');
    if (Object.hasOwn(result, slot.deviceId)) throw new ProvisionError('duplicate_device_identity');
    if (typeof slot.sessionHash !== 'string' || !/^[a-f0-9]{64}$/.test(slot.sessionHash)) {
      throw new ProvisionError('legacy_session_requires_review');
    }
    // Preserve session hashes and every existing slot attribute.
    result[slot.deviceId] = { ...slot };
  }
  if (Object.keys(result).length > DEVICE_LIMIT) throw new ProvisionError('existing_device_limit_exceeded');
  return result;
}

function stateOf(snapshot) {
  const { account, revision } = snapshot;
  let registeredDevices = 0;
  let blocker = null;
  try { registeredDevices = Object.keys(migratedDevices(account)).length; }
  catch (error) { registeredDevices = null; blocker = error.code || 'invalid_device_registry'; }
  return {
    email: TARGET_EMAIL, exists: !!account, revision,
    permanent: hasPermanentAccess(account), accessActive: accountHasAccess(account),
    deviceLimit: account ? account.deviceLimit || 2 : DEVICE_LIMIT,
    registeredDevices, canActivate: !blocker, blocker,
    subscriptionPlan: account ? account.plan || null : null,
    subscriptionExpiry: account ? account.expiry ?? null : null
  };
}

function passwordMatches(account, password) {
  if (!account.salt || !/^[a-f0-9]{64}$/i.test(account.passwordHash || '')) return false;
  const attempt = crypto.pbkdf2Sync(password, account.salt, 100000, 32, 'sha256');
  const expected = Buffer.from(account.passwordHash, 'hex');
  return attempt.length === expected.length && crypto.timingSafeEqual(attempt, expected);
}

export default async req => {
  if (req.method !== 'POST') return json({ success: false, error: 'method_not_allowed' }, 405);
  if (!authenticated(req)) return json({ success: false, error: 'unauthorized' }, 401);
  try {
    let body;
    try { body = await req.json(); } catch (_) { return json({ success: false, error: 'invalid_json' }, 400); }
    if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ success: false, error: 'invalid_request' }, 400);
    if (body.email !== undefined && String(body.email).trim().toLowerCase() !== TARGET_EMAIL) {
      return json({ success: false, error: 'account_not_allowed' }, 400);
    }
    if (!['inspect', 'activate'].includes(body.action)) return json({ success: false, error: 'invalid_action' }, 400);
    if (body.action === 'activate' && new URL(req.url).origin !== 'https://melunga.com') {
      return json({ success: false, error: 'production_required' }, 409);
    }
    const store = getAccessStore();
    const snapshot = await readAccount(store);
    if (body.action === 'inspect') return json({ success: true, state: stateOf(snapshot) });

    if (typeof body.password !== 'string' || body.password.length < 8 || body.password.length > 1024) {
      return json({ success: false, error: 'invalid_password' }, 400);
    }
    if (typeof body.requestId !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_.:-]{7,127}$/.test(body.requestId)
        || typeof body.expectedRevision !== 'string' || !body.expectedRevision || body.expectedRevision.length > 512) {
      return json({ success: false, error: 'inspection_required' }, 400);
    }
    const existing = snapshot.account;
    if (existing && !passwordMatches(existing, body.password)) {
      // Creating a grant is not permission to reset an existing user's password.
      throw new ProvisionError('existing_password_mismatch');
    }
    if (hasPermanentAccess(existing) && existing.deviceLimit === DEVICE_LIMIT
        && existing.complimentaryAccess.requestId === body.requestId) {
      return json({ success: true, changed: false, state: stateOf(snapshot) });
    }
    if (snapshot.revision !== body.expectedRevision) throw new ProvisionError('account_changed');
    const devices = migratedDevices(existing);
    const now = Date.now();
    let base = existing;
    if (!base) {
      const salt = crypto.randomBytes(16).toString('hex');
      base = {
        email: TARGET_EMAIL, salt,
        passwordHash: crypto.pbkdf2Sync(body.password, salt, 100000, 32, 'sha256').toString('hex'),
        paid: false, expiry: null, plan: 'complimentary', created: now,
        createdBy: 'admin-shared-access'
      };
    }
    const next = {
      ...base, deviceLimit: DEVICE_LIMIT, devices, updated: now,
      complimentaryAccess: {
        ...(existing && existing.complimentaryAccess || {}),
        status: 'active', permanent: true, maxDevices: DEVICE_LIMIT,
        grantedAt: existing && existing.complimentaryAccess && existing.complimentaryAccess.grantedAt || now,
        grantedBy: 'Kartech', requestId: body.requestId
      }
    };
    const condition = existing ? { onlyIfMatch: snapshot.revision } : { onlyIfNew: true };
    const written = await store.setJSON(KEY, next, condition);
    if (!written || typeof written.modified !== 'boolean') throw new ProvisionError('conditional_write_unavailable', 503);
    if (!written.modified) throw new ProvisionError('account_changed');
    const confirmed = await readAccount(store);
    if (!hasPermanentAccess(confirmed.account) || confirmed.account.deviceLimit !== DEVICE_LIMIT
        || confirmed.account.complimentaryAccess.requestId !== body.requestId) {
      throw new ProvisionError('activation_not_confirmed', 503);
    }
    return json({ success: true, changed: true, state: stateOf(confirmed) });
  } catch (error) {
    // No request body, password, salt, hash, token or provider error is logged.
    return json({ success: false, error: error instanceof ProvisionError ? error.code : 'service_unavailable' },
      error instanceof ProvisionError ? error.status : 503);
  }
};
