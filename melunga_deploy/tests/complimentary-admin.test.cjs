const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const { MemoryStore, fixtureAccount, FIXTURE_PASSWORD } = require('./helpers/complimentary-function-harness.cjs');

// This address is the route's fixed target, but every record below lives only in MemoryStore.
const EMAIL = 'contact@melunga.com';
const KEY = 'email:' + EMAIL;
const ADMIN = 'fixture-admin-credential-not-a-real-secret';
const REQUEST_ID = 'fixture-grant-request-001';
const FUNCTIONS = path.resolve(__dirname, '../netlify/functions');
const BASE = fixtureAccount({ email: EMAIL });
const clone = value => JSON.parse(JSON.stringify(value));
const existing = overrides => ({ ...clone(BASE), ...clone(overrides || {}) });
const writes = store => store.calls.filter(call => call.method === 'setJSON');
const slot = (id, extra = {}) => ({ deviceId: id, sessionHash: crypto.createHash('sha256').update(id).digest('hex'), ...extra });

async function harness(records = {}, options = {}) {
  const store = new MemoryStore(records);
  let stores = 0;
  const logs = [];
  const context = vm.createContext({
    Request, Response, Headers, Buffer, Date,
    process: { env: { ADMIN_SECRET: options.secret === undefined ? ADMIN : options.secret } },
    console: {
      log: (...args) => logs.push(args.join(' ')),
      warn: (...args) => logs.push(args.join(' ')),
      error: (...args) => logs.push(args.join(' '))
    }
  });
  const cache = new Map();
  async function load(filename) {
    if (cache.has(filename)) return cache.get(filename);
    let mod;
    if (filename === '@netlify/blobs') {
      mod = new vm.SyntheticModule(['getStore'], function () {
        this.setExport('getStore', config => {
          assert.equal(config.name, 'melunga-access');
          assert.equal(config.consistency, 'strong');
          stores++;
          return store;
        });
      }, { context });
    } else if (filename === 'node:crypto') {
      mod = new vm.SyntheticModule(['default'], function () { this.setExport('default', crypto); }, { context });
    } else {
      assert.ok(filename.startsWith(FUNCTIONS + path.sep), 'only the route and its local helper are loaded');
      mod = new vm.SourceTextModule(fs.readFileSync(filename, 'utf8'), { context, identifier: filename });
    }
    cache.set(filename, mod);
    if (mod instanceof vm.SourceTextModule) {
      await mod.link((specifier, parent) => load(specifier.startsWith('.')
        ? path.resolve(path.dirname(parent.identifier), specifier) : specifier));
    }
    return mod;
  }
  const mod = await load(path.join(FUNCTIONS, 'admin-shared-access.mjs'));
  await mod.evaluate();
  return {
    store, logs, get stores() { return stores; },
    async call(body, { token = ADMIN, method = 'POST', raw } = {}) {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = 'Bearer ' + token;
      const req = new Request('https://fixture.example.invalid/.netlify/functions/admin-shared-access', {
        method, headers, ...(method === 'GET' ? {} : { body: raw === undefined ? JSON.stringify(body) : raw })
      });
      const response = await mod.namespace.default(req);
      return { status: response.status, body: await response.json(), headers: response.headers };
    }
  };
}

async function activation(h, overrides = {}) {
  const inspection = await h.call({ action: 'inspect' });
  assert.equal(inspection.status, 200);
  return h.call({
    action: 'activate', password: FIXTURE_PASSWORD,
    expectedRevision: inspection.body.state.revision, requestId: REQUEST_ID, ...overrides
  });
}

test('missing, wrong, or unconfigured administrative credentials fail before store access', async () => {
  for (const [secret, token] of [[ADMIN, ''], [ADMIN, 'incorrect-fixture-token'], ['', ADMIN]]) {
    const h = await harness({ [KEY]: existing() }, { secret });
    const response = await h.call({ action: 'activate', password: FIXTURE_PASSWORD }, { token });
    assert.equal(response.status, 401);
    assert.equal(response.body.error, 'unauthorized');
    assert.equal(h.stores, 0);
    assert.deepEqual(h.store.calls, []);
    assert.deepEqual(h.logs, []);
  }
});

test('non-POST and malformed requests cannot write any account', async () => {
  const h = await harness();
  assert.equal((await h.call({}, { method: 'GET' })).status, 405);
  assert.equal((await h.call({}, { raw: '{invalid-json' })).status, 400);
  for (const body of [null, [], {}, { action: 'delete' }, { action: 'inspect', email: 'someone@example.invalid' }]) {
    assert.equal((await h.call(body)).status, 400);
  }
  assert.deepEqual(writes(h.store), []);
  assert.equal(h.stores, 0);
});

test('inspection is read-only and returns no password, hash, salt, session, or grant secret', async () => {
  const account = existing({ devices: { desktop: slot('fixture-desktop'), mobile: null } });
  const h = await harness({ [KEY]: account });
  const response = await h.call({ action: 'inspect' });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(response.body.state, {
    email: EMAIL, exists: true, revision: '"v1"', permanent: false, accessActive: true,
    deviceLimit: 2, registeredDevices: 1, canActivate: true, blocker: null,
    subscriptionPlan: account.plan, subscriptionExpiry: account.expiry
  });
  const serialized = JSON.stringify(response.body);
  for (const value of [FIXTURE_PASSWORD, ADMIN, account.salt, account.passwordHash, account.devices.desktop.sessionHash]) {
    assert.equal(serialized.includes(value), false);
  }
  assert.deepEqual(writes(h.store), []);
  assert.deepEqual(h.store.value(KEY), account);
  assert.deepEqual(h.logs, []);
});

test('an absent account is created with a real permanent grant and conditional creation', async () => {
  const h = await harness({ unrelated: { untouched: true } });
  const response = await activation(h);
  assert.equal(response.status, 200);
  assert.equal(response.body.changed, true);
  assert.equal(response.body.state.permanent, true);
  assert.equal(response.body.state.accessActive, true);
  assert.equal(response.body.state.deviceLimit, 30);
  assert.equal(response.body.state.registeredDevices, 0);
  const created = h.store.value(KEY);
  assert.equal(created.paid, false);
  assert.equal(created.expiry, null);
  assert.equal(created.plan, 'complimentary');
  assert.equal(created.passwordHash, crypto.pbkdf2Sync(FIXTURE_PASSWORD, created.salt, 100000, 32, 'sha256').toString('hex'));
  assert.equal(created.complimentaryAccess.status, 'active');
  assert.equal(created.complimentaryAccess.permanent, true);
  assert.equal(created.complimentaryAccess.maxDevices, 30);
  assert.equal(created.complimentaryAccess.grantedBy, 'Kartech');
  assert.equal(created.complimentaryAccess.requestId, REQUEST_ID);
  assert.ok(Number.isSafeInteger(created.complimentaryAccess.grantedAt));
  assert.deepEqual(created.devices, {});
  assert.deepEqual(writes(h.store), [{ method: 'setJSON', key: KEY, options: { onlyIfNew: true } }]);
  assert.deepEqual(h.store.value('unrelated'), { untouched: true });
  assert.deepEqual(h.logs, []);
});

test('legacy slots migrate without resetting credentials, billing, metadata, or session hashes', async () => {
  const desktop = slot('fixture-desktop', { label: 'Office PC', lastLogin: 45, nested: { retained: true } });
  const mobile = slot('fixture-mobile', { label: 'Phone' });
  const account = existing({ devices: { desktop, mobile }, custom: { source: 'keep-this' }, updated: 15 });
  const h = await harness({ [KEY]: account, ['session:' + desktop.sessionHash]: { marker: 'unchanged' } });
  const response = await activation(h);
  assert.equal(response.status, 200);
  const after = h.store.value(KEY);
  for (const name of ['email', 'salt', 'passwordHash', 'paid', 'expiry', 'plan', 'untouched', 'custom']) {
    assert.deepEqual(after[name], account[name], name + ' preserved');
  }
  assert.deepEqual(after.devices, { 'fixture-desktop': desktop, 'fixture-mobile': mobile });
  assert.deepEqual(h.store.value('session:' + desktop.sessionHash), { marker: 'unchanged' });
  assert.deepEqual(writes(h.store), [{ method: 'setJSON', key: KEY, options: { onlyIfMatch: '"v1"' } }]);
  assert.ok(after.updated > account.updated);
});

test('an existing capped registry, including own prototype-like IDs, remains exact', async () => {
  const devices = Object.fromEntries(['constructor', '__proto__', 'toString'].map(id => [id, slot(id)]));
  const h = await harness({ [KEY]: existing({ deviceLimit: 12, devices }) });
  const response = await activation(h);
  assert.equal(response.status, 200);
  assert.deepEqual(h.store.value(KEY).devices, devices);
  assert.equal(Object.keys(h.store.value(KEY).devices).length, 3);
});

test('existing password mismatch cannot reset a password or grant access', async () => {
  const before = existing();
  const h = await harness({ [KEY]: before });
  const response = await activation(h, { password: 'a-different-fixture-password' });
  assert.equal(response.status, 409);
  assert.equal(response.body.error, 'existing_password_mismatch');
  assert.deepEqual(h.store.value(KEY), before);
  assert.deepEqual(writes(h.store), []);
});

test('activation requires a prior revision, safe request ID, and valid password', async () => {
  const h = await harness();
  for (const overrides of [
    { expectedRevision: undefined }, { expectedRevision: '' }, { requestId: undefined },
    { requestId: '../unsafe' }, { requestId: 'short' }, { password: '' },
    { password: 'short' }, { password: 123 }, { password: 'x'.repeat(1025) }
  ]) {
    const response = await h.call({ action: 'activate', expectedRevision: 'absent', requestId: REQUEST_ID, password: FIXTURE_PASSWORD, ...overrides });
    assert.equal(response.status, 400);
  }
  assert.deepEqual(writes(h.store), []);
});

test('a stale inspection does not overwrite a more recent account', async () => {
  const h = await harness({ [KEY]: existing() });
  const inspection = await h.call({ action: 'inspect' });
  const newer = existing({ custom: 'newer-account-edit' });
  h.store.seed(KEY, newer);
  const response = await h.call({ action: 'activate', expectedRevision: inspection.body.state.revision, requestId: REQUEST_ID, password: FIXTURE_PASSWORD });
  assert.equal(response.status, 409);
  assert.equal(response.body.error, 'account_changed');
  assert.deepEqual(h.store.value(KEY), newer);
  assert.deepEqual(writes(h.store), []);
});

test('a login between the read and CAS cannot be erased by activation', async () => {
  const h = await harness({ [KEY]: existing() });
  const newer = existing({ devices: { desktop: slot('concurrent-login'), mobile: null } });
  h.store.hooks.beforeSet = ({ store }) => { store.seed(KEY, newer); };
  const response = await activation(h);
  assert.equal(response.status, 409);
  assert.equal(response.body.error, 'account_changed');
  assert.deepEqual(h.store.value(KEY), newer);
  assert.deepEqual(writes(h.store)[0].options, { onlyIfMatch: '"v1"' });
});

test('concurrent creation is protected with onlyIfNew instead of overwriting the other account', async () => {
  const h = await harness();
  const newer = existing({ custom: 'created-concurrently' });
  h.store.hooks.beforeSet = ({ store }) => { store.seed(KEY, newer); };
  const response = await activation(h);
  assert.equal(response.status, 409);
  assert.equal(response.body.error, 'account_changed');
  assert.deepEqual(h.store.value(KEY), newer);
  assert.deepEqual(writes(h.store)[0].options, { onlyIfNew: true });
});

test('the same successful request is idempotent even with its original stale revision', async () => {
  const h = await harness();
  const body = { action: 'activate', expectedRevision: 'absent', requestId: REQUEST_ID, password: FIXTURE_PASSWORD };
  assert.equal((await h.call(body)).body.changed, true);
  const before = h.store.value(KEY);
  const count = writes(h.store).length;
  const again = await h.call(body);
  assert.equal(again.status, 200);
  assert.equal(again.body.changed, false);
  assert.equal(writes(h.store).length, count);
  assert.deepEqual(h.store.value(KEY), before);
  const wrong = await h.call({ ...body, password: 'wrong-fixture-password' });
  assert.equal(wrong.status, 409);
});

test('failed reads are service errors and never interpreted as an absent account', async () => {
  const h = await harness({ [KEY]: existing() });
  h.store.getWithMetadata = async () => { throw new Error('fixture store unavailable'); };
  for (const action of ['inspect', 'activate']) {
    const response = await h.call({ action, expectedRevision: 'absent', requestId: REQUEST_ID, password: FIXTURE_PASSWORD });
    assert.equal(response.status, 503);
    assert.equal(response.body.error, 'service_unavailable');
  }
  assert.deepEqual(writes(h.store), []);
  assert.deepEqual(h.logs, []);
});

test('missing ETag or malformed snapshots stop inspection and activation without writes', async () => {
  for (const snapshot of [undefined, {}, { data: existing() }, { data: existing(), etag: '' }, { data: [], etag: 'v1' }]) {
    const h = await harness({ [KEY]: existing() });
    h.store.getWithMetadata = async () => snapshot;
    const response = await h.call({ action: 'inspect' });
    assert.equal(response.status, 503);
    assert.equal(response.body.error, 'invalid_store_snapshot');
    assert.deepEqual(writes(h.store), []);
  }
});

test('a record with a foreign email is never converted into the requested account', async () => {
  const before = existing({ email: 'another-person@example.invalid' });
  const h = await harness({ [KEY]: before });
  const response = await h.call({ action: 'inspect' });
  assert.equal(response.status, 409);
  assert.equal(response.body.error, 'account_identity_mismatch');
  assert.deepEqual(h.store.value(KEY), before);
  assert.deepEqual(writes(h.store), []);
});

test('malformed device registries are reported and never silently discarded', async () => {
  const invalid = [false, 0, '', [], 'not-an-object', { other: slot('other') }, { desktop: {} }];
  for (const devices of invalid) {
    const before = existing({ devices });
    const h = await harness({ [KEY]: before });
    const inspect = await h.call({ action: 'inspect' });
    assert.equal(inspect.body.state.canActivate, false, JSON.stringify(devices));
    assert.equal(inspect.body.state.blocker, 'invalid_device_registry');
    const response = await h.call({ action: 'activate', expectedRevision: inspect.body.state.revision, requestId: REQUEST_ID, password: FIXTURE_PASSWORD });
    assert.equal(response.status, 409);
    assert.equal(response.body.error, 'invalid_device_registry');
    assert.deepEqual(h.store.value(KEY), before);
    assert.deepEqual(writes(h.store), []);
  }
});

test('legacy slots without a real session hash require review instead of fabricating a session', async () => {
  for (const sessionHash of [undefined, '', 'old-non-hash-session', 'a'.repeat(63)]) {
    const before = existing({ devices: { desktop: { deviceId: 'legacy-device', sessionHash }, mobile: null } });
    const h = await harness({ [KEY]: before });
    const inspect = await h.call({ action: 'inspect' });
    assert.equal(inspect.body.state.canActivate, false);
    assert.equal(inspect.body.state.blocker, 'legacy_session_requires_review');
    const response = await activation(h);
    assert.equal(response.status, 409);
    assert.equal(response.body.error, 'legacy_session_requires_review');
    assert.deepEqual(h.store.value(KEY), before);
    assert.deepEqual(writes(h.store), []);
  }
});

test('duplicate legacy device IDs and mismatched capped IDs are refused without eviction', async () => {
  for (const [account, code] of [
    [existing({ devices: { desktop: slot('same-device'), mobile: slot('same-device') } }), 'duplicate_device_identity'],
    [existing({ deviceLimit: 30, devices: { wrong: slot('actual-device') } }), 'invalid_device_registry']
  ]) {
    const h = await harness({ [KEY]: account });
    const response = await activation(h);
    assert.equal(response.status, 409);
    assert.equal(response.body.error, code);
    assert.deepEqual(h.store.value(KEY), account);
    assert.deepEqual(writes(h.store), []);
  }
});

test('reserved store namespaces and normalized or truncated device IDs cannot migrate', async () => {
  const invalidIds = [
    'email:someone@example.invalid', 'EMAIL:someone@example.invalid',
    'session:fixture-session', 'SeSsIoN:fixture-session',
    'pending:fixture-payment', 'PENDING:fixture-payment',
    'replacement:fixture-code', 'RePlAcEmEnT:fixture-code',
    ' leading-space', 'trailing-space ', ' both-sides ', '\tfixture-device\n',
    ' ', 'x'.repeat(129)
  ];
  for (const deviceId of invalidIds) {
    // Exercise both migration paths: classic desktop/mobile slots and capped maps.
    for (const capped of [false, true]) {
      const devices = capped ? { [deviceId]: slot(deviceId) } : { desktop: slot(deviceId), mobile: null };
      const before = existing({ devices, ...(capped ? { deviceLimit: 30 } : {}) });
      const h = await harness({ [KEY]: before, 'email:someone@example.invalid': { paid: true, marker: 'untouched' } });
      const inspection = await h.call({ action: 'inspect' });
      assert.equal(inspection.body.state.canActivate, false, JSON.stringify({ deviceId, capped }));
      assert.equal(inspection.body.state.blocker, 'invalid_device_registry');
      const response = await h.call({
        action: 'activate', expectedRevision: inspection.body.state.revision,
        requestId: REQUEST_ID, password: FIXTURE_PASSWORD
      });
      assert.equal(response.status, 409);
      assert.equal(response.body.error, 'invalid_device_registry');
      assert.deepEqual(h.store.value(KEY), before);
      assert.deepEqual(h.store.value('email:someone@example.invalid'), { paid: true, marker: 'untouched' });
      assert.deepEqual(writes(h.store), []);
    }
  }
});

test('canonical device IDs at the length boundary migrate without truncation', async () => {
  const deviceId = 'x'.repeat(128);
  const account = existing({ devices: { desktop: slot(deviceId), mobile: null } });
  const h = await harness({ [KEY]: account });
  const response = await activation(h);
  assert.equal(response.status, 200);
  assert.deepEqual(h.store.value(KEY).devices, { [deviceId]: slot(deviceId) });
});

test('more than thirty registered devices cannot be reduced silently to thirty', async () => {
  const devices = Object.fromEntries(Array.from({ length: 31 }, (_, i) => ['device-' + i, slot('device-' + i)]));
  const account = existing({ deviceLimit: 100, devices });
  const h = await harness({ [KEY]: account });
  const response = await activation(h);
  assert.equal(response.status, 409);
  assert.equal(response.body.error, 'existing_device_limit_exceeded');
  assert.deepEqual(h.store.value(KEY), account);
  assert.deepEqual(writes(h.store), []);
});

test('a store that does not implement the conditional-write contract cannot report success', async () => {
  const h = await harness();
  h.store.setJSON = async () => undefined;
  const response = await activation(h);
  assert.equal(response.status, 503);
  assert.equal(response.body.error, 'conditional_write_unavailable');
  assert.equal(h.store.value(KEY), undefined);
});

test('activation is not announced if the committed grant cannot be verified', async () => {
  const h = await harness();
  h.store.hooks.afterSet = ({ store }) => { store.seed(KEY, existing({ custom: 'intervening-update' })); };
  const response = await activation(h);
  assert.equal(response.status, 503);
  assert.equal(response.body.error, 'activation_not_confirmed');
  assert.equal(response.body.success, false);
});
