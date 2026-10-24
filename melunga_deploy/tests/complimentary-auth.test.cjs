// Run: node --experimental-vm-modules --test tests/complimentary-auth.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { MemoryStore, fixtureAccount, loadFunctions, login, status, logout } = require('./helpers/complimentary-function-harness.cjs');

const EMAIL = 'fixture@example.test';
const KEY = 'email:' + EMAIL;
const GRANT = { status: 'active', permanent: true, grantedBy: 'fixture-owner' };
const hash = token => crypto.createHash('sha256').update(token).digest('hex');
const permanent = overrides => fixtureAccount({ expiry: null, deviceLimit: 30, devices: {}, complimentaryAccess: GRANT, ...overrides });
async function setup(account = permanent(), records = {}) {
  const store = new MemoryStore({ [KEY]: account, ...records });
  return loadFunctions(store);
}

test('owner grant is explicit, typed and independent of commercial expiry', async () => {
  const h = await setup();
  const { helper } = h;
  assert.equal(helper.hasPermanentAccess(permanent()), true);
  assert.equal(helper.accountHasAccess(permanent({ paid: false, expiry: 1 }), Date.UTC(2500, 0, 1)), true);
  assert.equal(helper.accessExpiry(permanent()), null);
  for (const grant of [null, {}, { permanent: true }, { status: 'revoked', permanent: true }, { status: 'active', permanent: 'true' }]) {
    assert.equal(helper.hasPermanentAccess({ complimentaryAccess: grant }), false);
  }
  assert.equal(helper.accountHasAccess(fixtureAccount({ expiry: 1 })), false);
});

test('permanent login works beyond 2099 and both status routes report no expiry', async () => {
  const h = await setup(permanent({ paid: false, expiry: Date.UTC(2020, 0, 1) }));
  h.clock.now = Date.UTC(2500, 0, 1);
  const signed = await login(h, 'future-device');
  assert.equal(signed.status, 200);
  assert.equal(signed.body.permanent, true);
  assert.equal(signed.body.expiry, null);
  for (const identity of [{ token: signed.body.session_token }, { deviceId: 'future-device' }]) {
    const checked = await status(h, identity);
    assert.equal(checked.body.paid, true);
    assert.equal(checked.body.permanent, true);
    assert.equal(checked.body.expiry, null);
  }
  assert.equal(h.store.value('future-device').expiry, null);
  assert.equal(h.store.value(KEY).untouched, 'preserve-me');
});

test('30 mixed desktop/mobile devices work, device 31 is refused without mutations', async () => {
  const h = await setup();
  for (let i = 0; i < 30; i += 1) {
    const result = await login(h, 'device-' + i, { mobile: i % 2 === 1 });
    assert.equal(result.status, 200);
  }
  assert.equal(Object.keys(h.store.value(KEY).devices).length, 30);
  const before = JSON.stringify([...h.store.rows]);
  const refused = await login(h, 'device-31');
  assert.equal(refused.status, 409);
  assert.equal(refused.body.error, 'device_limit_reached');
  assert.equal(refused.body.device_limit, 30);
  assert.equal(JSON.stringify([...h.store.rows]), before);
});

test('prototype names cannot bypass the cap and can be real owned IDs below it', async () => {
  const h = await setup();
  for (const id of ['constructor', '__proto__', 'toString']) {
    const result = await login(h, id);
    assert.equal(result.status, 200);
    assert.equal((await status(h, { deviceId: id })).body.paid, true);
  }
  assert.deepEqual(Object.keys(h.store.value(KEY).devices).sort(), ['__proto__', 'constructor', 'toString']);
  assert.equal(Object.getPrototypeOf(h.devices.ensureDeviceMap(h.store.value(KEY))), null);
  const full = await setup(permanent({ devices: Object.fromEntries(Array.from({ length: 30 }, (_, i) => ['full-' + i, { deviceId: 'full-' + i }])) }));
  for (const id of ['constructor', '__proto__', 'toString']) assert.equal((await login(full, id)).status, 409);
  assert.equal(Object.keys(full.store.value(KEY).devices).length, 30);
  assert.equal({}.polluted, undefined);
});

test('permanent permission never bypasses password validation', async () => {
  const h = await setup();
  const before = JSON.stringify([...h.store.rows]);
  assert.equal((await login(h, 'wrong', { password: 'incorrect-fixture' })).status, 401);
  assert.equal((await login(h, 'missing', { email: 'missing@example.test' })).status, 401);
  assert.equal(JSON.stringify([...h.store.rows]), before);
});

test('ordinary accounts keep one desktop and one mobile and their public response', async () => {
  const h = await setup(fixtureAccount());
  const pc = await login(h, 'ordinary-pc');
  const phone = await login(h, 'ordinary-phone', { mobile: true });
  assert.equal(pc.status, 200); assert.equal(phone.status, 200);
  assert.deepEqual(Object.keys(pc.body).sort(), ['device_label', 'device_type', 'expiry', 'session_token', 'success']);
  assert.equal(pc.body.expiry, Date.UTC(2080, 0, 1));
  assert.equal((await login(h, 'second-pc')).status, 409);
  assert.equal((await login(h, 'second-phone', { mobile: true })).status, 409);
  assert.deepEqual(Object.keys(h.store.value(KEY).devices).sort(), ['desktop', 'mobile']);
  assert.equal((await status(h, { token: pc.body.session_token })).body.paid, true);
  assert.equal((await status(h, { deviceId: 'ordinary-phone' })).body.paid, true);
  assert.equal(h.store.value(KEY).plan, 'annual');
});

test('expired ordinary subscriptions and malformed/revoked grants stay denied', async () => {
  for (const overrides of [
    { expiry: 1 }, { paid: false },
    { expiry: null, complimentaryAccess: { status: 'revoked', permanent: true } },
    { expiry: null, complimentaryAccess: { status: 'active', permanent: 'true' } }
  ]) {
    const h = await setup(fixtureAccount(overrides));
    assert.equal((await login(h, 'expired')).status, 403);
  }
  const h = await setup(permanent());
  const signed = await login(h, 'revoked');
  h.store.seed(KEY, { ...h.store.value(KEY), complimentaryAccess: { ...GRANT, status: 'revoked' } });
  assert.equal((await status(h, { token: signed.body.session_token })).body.paid, false);
  assert.equal((await status(h, { deviceId: 'revoked' })).body.paid, false);
});

test('legacy cache does not grant access without the registered slot and backing session', async () => {
  const h = await setup();
  const signed = await login(h, 'bound');
  const account = h.store.value(KEY);
  const cache = h.store.value('bound');
  const sessionKey = 'session:' + hash(signed.body.session_token);
  const session = h.store.value(sessionKey);
  h.store.rows.delete('bound');
  assert.equal((await status(h, { deviceId: 'bound' })).body.paid, false);
  h.store.seed('bound', cache);
  h.store.seed(KEY, { ...account, devices: {} });
  assert.equal((await status(h, { deviceId: 'bound' })).body.paid, false);
  h.store.seed(KEY, account);
  h.store.rows.delete(sessionKey);
  assert.equal((await status(h, { deviceId: 'bound' })).body.paid, false);
  h.store.seed(sessionKey, { ...session, email: 'foreign@example.test' });
  assert.equal((await status(h, { deviceId: 'bound' })).body.paid, false);
  h.store.seed(sessionKey, session);
  h.store.seed('bound', { ...cache, sessionHash: 'not-the-slot-hash' });
  assert.equal((await status(h, { deviceId: 'bound' })).body.paid, false);
});

test('conversion preserves existing token and expired device cache under the owner grant', async () => {
  const h = await setup(fixtureAccount());
  const signed = await login(h, 'converted');
  const before = h.store.value(KEY);
  const slot = before.devices.desktop;
  h.store.seed(KEY, { ...before, expiry: null, deviceLimit: 30, devices: { converted: slot }, complimentaryAccess: GRANT });
  h.store.seed('converted', { ...h.store.value('converted'), expiry: 1 });
  assert.equal((await status(h, { token: signed.body.session_token })).body.permanent, true);
  assert.equal((await status(h, { deviceId: 'converted' })).body.permanent, true);
  assert.deepEqual(h.store.value(KEY).devices.converted, slot);
});

test('legacy permanent logout revokes only the session and keeps a reusable registered place', async () => {
  const h = await setup();
  const first = await login(h, 'stable-browser');
  const other = await login(h, 'other-browser');
  const before = h.store.value(KEY);
  const result = await logout(h, { deviceId: 'stable-browser' });
  assert.deepEqual(result, { status: 200, body: { success: true } });
  assert.deepEqual(h.store.value(KEY), before);
  assert.equal((await status(h, { token: first.body.session_token })).body.paid, false);
  assert.equal((await status(h, { deviceId: 'stable-browser' })).body.paid, false);
  assert.equal((await status(h, { token: other.body.session_token })).body.paid, true);
  const next = await login(h, 'stable-browser');
  assert.equal(next.status, 200);
  assert.equal(Object.keys(h.store.value(KEY).devices).length, 2);
  assert.equal((await status(h, { deviceId: 'stable-browser' })).body.paid, true);
});

test('stale bearer logout cannot erase a later login on the same permanent browser', async () => {
  const h = await setup();
  const first = await login(h, 'same-browser');
  const next = await login(h, 'same-browser');
  const before = h.store.value(KEY);
  await logout(h, { token: first.body.session_token });
  assert.deepEqual(h.store.value(KEY), before);
  assert.equal((await status(h, { token: next.body.session_token })).body.paid, true);
  assert.equal((await status(h, { deviceId: 'same-browser' })).body.paid, true);
});

test('logout A interleaved with login B only revokes A', async () => {
  const h = await setup();
  const first = await login(h, 'racing-browser');
  const oldKey = 'session:' + hash(first.body.session_token);
  let next;
  h.store.hooks.beforeDelete = async ({ key }) => {
    if (key !== oldKey) return;
    h.store.hooks.beforeDelete = null;
    next = await login(h, 'racing-browser');
  };
  await logout(h, { token: first.body.session_token });
  assert.equal(next.status, 200);
  assert.equal((await status(h, { token: next.body.session_token })).body.paid, true);
  assert.equal((await status(h, { deviceId: 'racing-browser' })).body.paid, true);
  assert.equal(Object.keys(h.store.value(KEY).devices).length, 1);
});

test('concurrent logouts keep the registry and all other sessions untouched', async () => {
  const h = await setup();
  const users = [];
  for (let i = 0; i < 3; i += 1) users.push(await login(h, 'member-' + i));
  const before = h.store.value(KEY);
  await Promise.all(users.slice(0, 2).map(user => logout(h, { token: user.body.session_token })));
  assert.deepEqual(h.store.value(KEY), before);
  for (let i = 0; i < 2; i += 1) assert.equal((await status(h, { token: users[i].body.session_token })).body.paid, false);
  assert.equal((await status(h, { token: users[2].body.session_token })).body.paid, true);
});

test('account CAS admits only one new device at the last place and loses no prior member', async () => {
  const devices = Object.fromEntries(Array.from({ length: 29 }, (_, i) => ['existing-' + i, { deviceId: 'existing-' + i }]));
  const h = await setup(permanent({ devices }));
  let snapshots = 0; let release;
  const gate = new Promise(resolve => { release = resolve; });
  h.store.hooks.afterSnapshot = async ({ key }) => {
    if (key !== KEY || snapshots >= 2) return;
    snapshots += 1;
    if (snapshots === 2) release();
    await gate;
  };
  const responses = await Promise.all([login(h, 'last-A'), login(h, 'last-B')]);
  assert.deepEqual(responses.map(result => result.status).sort(), [200, 409]);
  const kept = h.store.value(KEY).devices;
  assert.equal(Object.keys(kept).length, 30);
  for (const id of Object.keys(devices)) assert.deepEqual(kept[id], devices[id]);
});

test('two new devices below the cap both survive a conflicting snapshot', async () => {
  const h = await setup();
  let snapshots = 0; let release;
  const gate = new Promise(resolve => { release = resolve; });
  h.store.hooks.afterSnapshot = async ({ key }) => {
    if (key !== KEY || snapshots >= 2) return;
    snapshots += 1;
    if (snapshots === 2) release();
    await gate;
  };
  const results = await Promise.all([login(h, 'new-A'), login(h, 'new-B')]);
  assert.deepEqual(results.map(result => result.status), [200, 200]);
  assert.deepEqual(Object.keys(h.store.value(KEY).devices).sort(), ['new-A', 'new-B']);
  for (const result of results) assert.equal((await status(h, { token: result.body.session_token })).body.paid, true);
});

test('a standard login cannot overwrite a concurrent owner grant', async () => {
  const h = await setup(fixtureAccount());
  h.store.hooks.beforeSet = async ({ key }) => {
    if (key !== KEY) return;
    h.store.hooks.beforeSet = null;
    h.store.seed(KEY, { ...h.store.value(KEY), complimentaryAccess: GRANT, expiry: null, deviceLimit: 30, devices: {} });
  };
  const signed = await login(h, 'upgraded');
  assert.equal(signed.status, 200);
  assert.equal(signed.body.permanent, true);
  assert.equal(h.store.value(KEY).complimentaryAccess.status, 'active');
  assert.equal(h.store.value(KEY).devices.upgraded.deviceId, 'upgraded');
});

test('a standard logout uses a cache tombstone and keeps another account untouched', async () => {
  const foreign = fixtureAccount({ email: 'foreign@example.test' });
  const h = await setup(fixtureAccount(), { 'email:foreign@example.test': foreign });
  const signed = await login(h, 'ordinary-browser');
  const result = await logout(h, { deviceId: 'ordinary-browser' });
  assert.equal(result.status, 200);
  assert.equal(h.store.value(KEY).devices.desktop, null);
  assert.equal(h.store.value('ordinary-browser').paid, false);
  assert.equal((await status(h, { token: signed.body.session_token })).body.paid, false);
  assert.equal((await status(h, { deviceId: 'ordinary-browser' })).body.paid, false);
  assert.deepEqual(h.store.value('email:foreign@example.test'), foreign);
  assert.equal((await login(h, 'different-browser')).status, 200);
});

test('a concurrent owner grant survives a standard logout snapshot', async () => {
  const h = await setup(fixtureAccount());
  const signed = await login(h, 'new-grant');
  h.store.hooks.beforeSet = async ({ key }) => {
    if (key !== KEY) return;
    h.store.hooks.beforeSet = null;
    const account = h.store.value(KEY);
    h.store.seed(KEY, { ...account, expiry: null, complimentaryAccess: GRANT, deviceLimit: 30,
      devices: { 'new-grant': account.devices.desktop } });
  };
  const result = await logout(h, { token: signed.body.session_token });
  assert.equal(result.status, 200);
  assert.equal(h.store.value(KEY).complimentaryAccess.status, 'active');
  assert.equal(h.store.value(KEY).devices['new-grant'].deviceId, 'new-grant');
  assert.equal((await status(h, { deviceId: 'new-grant' })).body.paid, false);
});

test('a concurrent standard login is preserved by a stale standard logout', async () => {
  const h = await setup(fixtureAccount());
  const first = await login(h, 'ordinary-race');
  let next;
  h.store.hooks.beforeSet = async ({ key }) => {
    if (key !== KEY) return;
    h.store.hooks.beforeSet = null;
    next = await login(h, 'ordinary-race');
  };
  await logout(h, { token: first.body.session_token });
  assert.equal(next.status, 200);
  assert.equal((await status(h, { token: next.body.session_token })).body.paid, true);
  assert.equal((await status(h, { deviceId: 'ordinary-race' })).body.paid, true);
});

test('legacy slot migration cannot replace a concurrent permanent map', async () => {
  const token = 'fixture-existing-token';
  const sessionHash = hash(token);
  const cache = { paid: true, expiry: Date.UTC(2080, 0, 1), email: EMAIL, deviceType: 'desktop', sessionHash };
  const h = await setup(fixtureAccount(), {
    legacy: cache,
    ['session:' + sessionHash]: { email: EMAIL, deviceId: 'legacy', deviceType: 'desktop', expiry: cache.expiry }
  });
  h.store.hooks.beforeSet = async ({ key }) => {
    if (key !== KEY) return;
    h.store.hooks.beforeSet = null;
    h.store.seed(KEY, permanent({ devices: { legacy: { deviceId: 'legacy', deviceType: 'desktop', sessionHash } } }));
  };
  const checked = await status(h, { deviceId: 'legacy' });
  assert.equal(checked.body.paid, true);
  assert.equal(checked.body.permanent, true);
  assert.equal(h.store.value(KEY).devices.legacy.sessionHash, sessionHash);
});

test('device IDs cannot read or overwrite server-owned record namespaces', async () => {
  const protectedKeys = ['email:other@example.test', 'session:fixture-session',
    'pending:link:fixture-link', 'pending:device:fixture-device',
    'replacement:other@example.test:desktop'];
  const records = Object.fromEntries(protectedKeys.map(key => [key, { protected: key }]));
  const h = await setup(permanent(), records);
  const before = JSON.stringify([...h.store.rows]);
  for (const id of protectedKeys.concat([' EMAIL:other@example.test ', 'Session:fixture-session'])) {
    assert.equal(h.devices.cleanDeviceId(id), '');
    assert.equal((await login(h, id)).status, 400);
    assert.equal((await status(h, { deviceId: id })).status, 400);
    assert.equal((await logout(h, { deviceId: id })).body.success, true);
  }
  assert.equal(JSON.stringify([...h.store.rows]), before);
  assert.equal(h.store.calls.some(call => call.method === 'setJSON' || call.method === 'delete'), false);
});

test('login refuses missing account revisions without any write', async () => {
  for (const etag of [undefined, '', null, 7]) {
    const h = await setup();
    h.store.hooks.afterSnapshot = ({ key, snapshot }) => { if (key === KEY) snapshot.etag = etag; };
    const signed = await login(h, 'no-account-revision');
    assert.equal(signed.status, 500);
    assert.equal(signed.body.success, false);
    assert.equal(h.store.calls.some(call => call.method === 'setJSON' || call.method === 'delete'), false);
  }
});

test('login refuses an unversioned existing device cache and removes its unusable session', async () => {
  const existingCache = { paid: false, email: EMAIL, expiry: 1 };
  const h = await setup(permanent(), { unversioned: existingCache });
  h.store.hooks.afterSnapshot = ({ key, snapshot }) => { if (key === 'unversioned') snapshot.etag = undefined; };
  const signed = await login(h, 'unversioned');
  assert.equal(signed.status, 500);
  assert.deepEqual(h.store.value('unversioned'), existingCache);
  assert.equal(h.store.calls.some(call => call.method === 'setJSON' && call.key === 'unversioned'), false);
  assert.equal([...h.store.rows.keys()].some(key => key.startsWith('session:')), false);
  assert.equal((await status(h, { deviceId: 'unversioned' })).body.paid, false);
});

test('ordinary migration and logout never write a record without its revision', async () => {
  for (const missingKey of [KEY, 'legacy-no-revision']) {
    const h = await setup(fixtureAccount(), {
      'legacy-no-revision': { paid: true, expiry: Date.UTC(2080, 0, 1), email: EMAIL, deviceType: 'desktop' }
    });
    h.store.hooks.afterSnapshot = ({ key, snapshot }) => { if (key === missingKey) snapshot.etag = ''; };
    const checked = await status(h, { deviceId: 'legacy-no-revision' });
    assert.equal(checked.body.paid, false);
    assert.equal(h.store.calls.some(call => call.method === 'setJSON'), false);
  }
  for (const missingKey of [KEY, 'logout-no-revision']) {
    const h = await setup(fixtureAccount());
    await login(h, 'logout-no-revision');
    h.store.calls.length = 0;
    h.store.hooks.afterSnapshot = ({ key, snapshot }) => { if (key === missingKey) snapshot.etag = ''; };
    assert.equal((await logout(h, { deviceId: 'logout-no-revision' })).status, 500);
    assert.equal(h.store.calls.some(call => call.method === 'setJSON' && call.key === missingKey), false);
  }
});

test('login does not announce success after a concurrent permanent logout revokes its session', async () => {
  const h = await setup();
  h.store.hooks.afterSet = async ({ key }) => {
    if (key !== 'logout-during-login') return;
    h.store.hooks.afterSet = null;
    assert.equal((await logout(h, { deviceId: key })).status, 200);
  };
  const signed = await login(h, 'logout-during-login');
  assert.equal(signed.status, 409);
  assert.equal(signed.body.success, false);
  assert.equal((await status(h, { deviceId: 'logout-during-login' })).body.paid, false);
  assert.equal(Object.keys(h.store.value(KEY).devices).length, 1);
});

test('ordinary desktop and mobile sessions expire at the original subscription boundary', async () => {
  const expiry = Date.UTC(2026, 9, 24);
  const h = await setup(fixtureAccount({ expiry }));
  const desktop = await login(h, 'expiring-desktop');
  const mobile = await login(h, 'expiring-mobile', { mobile: true });
  h.clock.now = expiry;
  for (const signed of [desktop, mobile]) assert.equal((await status(h, { token: signed.body.session_token })).body.paid, false);
  for (const deviceId of ['expiring-desktop', 'expiring-mobile']) assert.equal((await status(h, { deviceId })).body.paid, false);
  assert.equal((await login(h, 'expiring-desktop')).status, 403);
  assert.equal(h.store.value(KEY).expiry, expiry);
});
