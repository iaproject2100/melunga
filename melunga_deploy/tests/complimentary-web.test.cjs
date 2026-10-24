'use strict';

// Exercises the actual web handlers with isolated storage and HTTP responses.
// No account, network request or real credential is used.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const source = fs.readFileSync(path.join(__dirname, '..', 'app.html'), 'utf8');

function between(start, end) {
  const index = source.indexOf(start);
  assert(index >= 0, 'source handler exists: ' + start);
  const stop = source.indexOf(end, index);
  assert(stop > index, 'source boundary exists: ' + end);
  return source.slice(index, stop);
}

const handlers = [
  between('async function doLogout(){', '\nfunction meaningOf('),
  between('function getDeviceId(){', '\nvar currentPricing'),
  between('function rememberPermanentLogout(', '\nasync function checkPaidStatus('),
  between('async function checkPaidStatus(){', '\nfunction pwSwitchTab('),
  between('async function loginExisting(){', '\nfunction setLang(')
].join('\n');
const serverResponse = (body, ok = true) => ({ ok, async json() { return body; } });

function harness({ paid = true, confirm = true, nat = 'fr', storedHint = false, fetch } = {}) {
  const storage = new Map([['ox_device', 'registered-browser'], ['ox_paid', paid ? '1' : '0']]);
  if (storedHint) storage.set('ox_permanent_logout', '1');
  const requests = [], toasts = [], calls = { reload: 0, hide: 0, levels: 0, menu: 0, confirms: 0 };
  const nodes = {
    pwLoginEmail: { value: 'fixture@example.test' },
    pwLoginPassword: { value: 'fixture-only-password' },
    pwLoginBtn: { disabled: false }, pwFree: { textContent: '' }
  };
  const context = vm.createContext({
    nat, Math, Date, JSON,
    lsGet: key => storage.get(key) || '',
    lsSet: (key, value) => storage.set(key, value),
    confirm: () => { calls.confirms += 1; return confirm; },
    T: key => key,
    toastMsg: message => toasts.push(message),
    location: { reload() { calls.reload += 1; } },
    document: { getElementById: id => nodes[id] || null },
    hidePaywall: () => { calls.hide += 1; },
    buildLevels: () => { calls.levels += 1; },
    updateUtilBar: () => { calls.menu += 1; },
    fetch: async (url, options) => {
      requests.push({ url, method: options?.method || 'GET', body: options?.body ? JSON.parse(options.body) : null });
      return fetch ? fetch(url, options) : serverResponse({ paid: false });
    }
  });
  const stateLines = ['isPaid', 'isPermanentAccess', 'permanentLogoutHint', 'sharedLogoutPending'].map(name => {
    const line = source.split('\n').find(value => value.startsWith('var ' + name + '='));
    assert(line, 'source state exists: ' + name); return line;
  }).join('\n');
  vm.runInContext(stateLines + '\n' + handlers, context);
  return { context, storage, requests, toasts, calls, nodes };
}

test('standard logout retains the historical behavior without an HTTP request', async () => {
  const h = harness();
  await h.context.doLogout();
  assert.equal(h.storage.get('ox_paid'), '0');
  assert.equal(h.storage.get('ox_device'), '');
  assert.equal(h.calls.reload, 1);
  assert.equal(h.requests.length, 0);
});

test('canceling logout changes neither storage nor server state', async () => {
  const h = harness({ confirm: false });
  h.context.isPermanentAccess = true;
  await h.context.doLogout();
  assert.equal(h.storage.get('ox_paid'), '1');
  assert.equal(h.storage.get('ox_device'), 'registered-browser');
  assert.equal(h.calls.reload, 0);
  assert.equal(h.requests.length, 0);
});

test('a permanent status with no expiry enables only the server-derived logout path', async () => {
  const h = harness({ fetch: async () => serverResponse({ paid: true, permanent: true, expiry: null }) });
  await h.context.checkPaidStatus();
  assert.equal(h.context.isPaid, true);
  assert.equal(h.context.isPermanentAccess, true);
  assert.equal(h.requests[0].url, '/.netlify/functions/check-status?device_id=registered-browser');
  assert.equal(h.storage.has('ox_permanent_access'), false);
  assert.equal(h.storage.get('ox_permanent_logout'), '1');
});

test('an untrusted local logout hint cannot establish paid or permanent access', async () => {
  const h = harness({ paid: false, storedHint: true, fetch: async () => serverResponse({ success: true }) });
  assert.equal(h.context.isPaid, false);
  assert.equal(h.context.isPermanentAccess, false);
  await h.context.doLogout();
  assert.equal(h.context.isPaid, false);
  assert.equal(h.context.isPermanentAccess, false);
  assert.equal(h.requests.length, 1);
  assert.equal(h.requests[0].url, '/.netlify/functions/logout');
  assert.equal(h.storage.get('ox_device'), 'registered-browser');
});

test('the permanent marker is cleared when the server reports a normal or denied account', async () => {
  for (const body of [{ paid: true, expiry: Date.now() + 1000 }, { paid: false, error: 'session_revoked' }]) {
    const h = harness({ storedHint: true, fetch: async () => serverResponse(body) });
    h.context.isPermanentAccess = true;
    await h.context.checkPaidStatus();
    assert.equal(h.context.isPermanentAccess, false);
    assert.equal(h.context.isPaid, body.paid);
    assert.equal(h.context.permanentLogoutHint, false);
    assert.equal(h.storage.get('ox_permanent_logout'), '');
  }
});

test('a previously established logout hint preserves device identity after an offline reload', async () => {
  let offline = true;
  const h = harness({ storedHint: true, fetch: async () => {
    if (offline) throw new Error('offline fixture');
    return serverResponse({ success: true });
  } });
  await h.context.checkPaidStatus();
  assert.equal(h.context.isPermanentAccess, false, 'offline storage never establishes a permanent right');
  await h.context.doLogout();
  assert.equal(h.storage.get('ox_device'), 'registered-browser');
  assert.equal(h.calls.reload, 0);
  assert.equal(h.storage.get('ox_paid'), '1');
  offline = false;
  await h.context.doLogout();
  assert.equal(h.storage.get('ox_device'), 'registered-browser');
  assert.equal(h.storage.get('ox_paid'), '0');
  assert.equal(h.calls.reload, 1);
});

test('an unsuccessful status response cannot establish the permanent marker', async () => {
  const h = harness({ fetch: async () => serverResponse({ paid: true, permanent: true }, false) });
  await h.context.checkPaidStatus();
  assert.equal(h.context.isPermanentAccess, false);
});

test('login accepts permanent expiry:null and keeps standard logins unchanged', async () => {
  for (const permanent of [true, false]) {
    const h = harness({ fetch: async () => serverResponse({ success: true, ...(permanent ? { permanent: true, expiry: null } : { expiry: 2000000000000 }) }) });
    await h.context.loginExisting();
    assert.equal(h.context.isPaid, true);
    assert.equal(h.context.isPermanentAccess, permanent);
    assert.equal(h.calls.hide, 1);
    assert.equal(h.calls.levels, 1);
    assert.equal(h.calls.menu, 1);
    assert.equal(h.storage.get('ox_device'), 'registered-browser');
  }
});

test('failed login cannot establish permanent access', async () => {
  const h = harness({ paid: false, fetch: async () => serverResponse({ success: false, permanent: true, error: 'invalid_credentials' }, false) });
  await h.context.loginExisting();
  assert.equal(h.context.isPaid, false);
  assert.equal(h.context.isPermanentAccess, false);
  assert.equal(h.calls.hide, 0);
  assert.equal(h.nodes.pwLoginBtn.disabled, false);
});

test('permanent logout waits for the server and prevents duplicate submissions', async () => {
  let complete;
  const pending = new Promise(resolve => { complete = resolve; });
  const h = harness({ fetch: async () => pending });
  h.context.isPermanentAccess = true;
  const logout = h.context.doLogout();
  assert.equal(h.context.sharedLogoutPending, true);
  assert.equal(h.storage.get('ox_paid'), '1');
  assert.equal(h.calls.reload, 0);
  await h.context.doLogout();
  assert.equal(h.requests.length, 1);
  assert.equal(h.calls.confirms, 1);
  assert.deepEqual(h.requests[0], { url: '/.netlify/functions/logout', method: 'POST', body: { device_id: 'registered-browser' } });
  complete(serverResponse({ success: true }));
  await logout;
  assert.equal(h.context.isPaid, false);
  assert.equal(h.context.isPermanentAccess, false);
  assert.equal(h.storage.get('ox_paid'), '0');
  assert.equal(h.storage.get('ox_device'), 'registered-browser');
  assert.equal(h.context.sharedLogoutPending, false);
  assert.equal(h.calls.reload, 1);
});

test('logout failure does not erase the identity or announce success', async () => {
  for (const failure of ['network', 'http', 'declined', 'json']) {
    const h = harness({ fetch: async () => {
      if (failure === 'network') throw new Error('offline fixture');
      if (failure === 'json') return { ok: true, json: async () => { throw new Error('fixture JSON failure'); } };
      return serverResponse({ success: failure === 'http' }, failure !== 'http');
    } });
    h.context.isPermanentAccess = true;
    await h.context.doLogout();
    assert.equal(h.context.isPaid, true, failure);
    assert.equal(h.context.isPermanentAccess, true, failure);
    assert.equal(h.storage.get('ox_paid'), '1', failure);
    assert.equal(h.storage.get('ox_device'), 'registered-browser', failure);
    assert.equal(h.calls.reload, 0, failure);
    assert.equal(h.context.sharedLogoutPending, false, failure);
    assert.equal(h.toasts.length, 1, failure);
  }
});

test('reconnecting the shared account reuses one device identity through repeated logout cycles', async () => {
  const h = harness({ fetch: async url => serverResponse(url.endsWith('/logout') ? { success: true } : { success: true, permanent: true, expiry: null }) });
  const ids = new Set();
  for (let i = 0; i < 12; i += 1) {
    await h.context.loginExisting();
    ids.add(h.context.getDeviceId());
    await h.context.doLogout();
    ids.add(h.context.getDeviceId());
  }
  assert.deepEqual([...ids], ['registered-browser']);
  assert.equal(h.calls.reload, 12);
});

test('auth-only edits preserve catalogue and guided-family strings byte for byte', () => {
  const expected = {
    DECKS: 'cd5c049204cc07b07a6fb46bb02fa29ead0007b6a6097fc933e899a48316314a',
    PEDAGOGY_FAMILIES: 'a467e620aba67b49115af935c2a73d8b923c6bf3984ce4d6c8a19e06fa2c65fd'
  };
  for (const [name, hash] of Object.entries(expected)) {
    const line = source.split('\n').find(value => value.startsWith('var ' + name + ' = '));
    assert.equal(crypto.createHash('sha256').update(line).digest('hex'), hash, name);
  }
});
