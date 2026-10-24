const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');

const FUNCTIONS = path.resolve(__dirname, '../netlify/functions');
const EMAIL = 'shared-owner@example.invalid';
const PASSWORD = 'fixture-account-password';
const WEBHOOK_SECRET = 'fixture-webhook-secret';
const REPLACEMENT_SECRET = 'fixture-replacement-secret';
const clone = value => value == null ? value : structuredClone(value);

function account(overrides = {}) {
  const salt = '0123456789abcdef0123456789abcdef';
  return {
    email: EMAIL,
    salt,
    passwordHash: crypto.pbkdf2Sync(PASSWORD, salt, 100000, 32, 'sha256').toString('hex'),
    paid: true,
    expiry: Date.now() + 86400000,
    plan: 'monthly',
    devices: {
      desktop: { deviceId: 'old-desktop', deviceType: 'desktop', sessionHash: 'old-session', label: 'PC' },
      mobile: { deviceId: 'kept-mobile', deviceType: 'mobile', sessionHash: 'mobile-session', label: 'Phone' }
    },
    ...overrides
  };
}

function permanentAccount(overrides = {}) {
  return account({
    expiry: null,
    deviceLimit: 30,
    complimentaryAccess: { status: 'active', permanent: true, grantedAt: 123456 },
    devices: Object.fromEntries(Array.from({ length: 30 }, (_, i) => [
      'shared-device-' + i,
      { deviceId: 'shared-device-' + i, deviceType: i % 2 ? 'mobile' : 'desktop', sessionHash: 'session-' + i }
    ])),
    ...overrides
  });
}

async function harness(entry, initial = {}, options = {}) {
  const records = options.records || new Map(Object.entries(clone(initial)));
  const versions = new Map([...records.keys()].map(key => [key, 1]));
  const writes = [];
  const writeAttempts = [];
  const deletes = [];
  const requests = [];
  const reads = [];
  function putRecord(key, value) {
    records.set(key, clone(value));
    versions.set(key, (versions.get(key) || 0) + 1);
  }
  const store = {
    async get(key) {
      reads.push(key);
      if (options.beforeRead) await options.beforeRead(key, records, reads.length);
      return clone(records.get(key) ?? null);
    },
    async getWithMetadata(key) {
      const data = await this.get(key);
      return data == null ? null : { data, metadata: {}, etag: options.omitEtag ? undefined : String(versions.get(key)) };
    },
    async setJSON(key, value, conditions = {}) {
      writeAttempts.push({ key, conditions: clone(conditions) });
      if (options.beforeWrite) await options.beforeWrite({ key, value, conditions, records, putRecord });
      if (conditions.onlyIfNew && records.has(key)) return { modified: false };
      if (conditions.onlyIfMatch && (!records.has(key) || conditions.onlyIfMatch !== String(versions.get(key)))) return { modified: false };
      writes.push(key); putRecord(key, value);
      return { modified: true, etag: String(versions.get(key)) };
    },
    async delete(key) { deletes.push(key); records.delete(key); versions.delete(key); }
  };
  const context = vm.createContext({
    Request, Response, Headers, URL, Buffer, Date, console: { log() {}, warn() {}, error() {} },
    process: { env: {
      AIRWALLEX_ENV: 'demo', AIRWALLEX_WEBHOOK_SECRET: WEBHOOK_SECRET,
      DEVICE_REPLACEMENT_SECRET: REPLACEMENT_SECRET, BREVO_API_KEY: 'fixture-mail-key'
    } },
    fetch: async (url, init = {}) => {
      const request = { url: String(url), ...init };
      requests.push(request);
      if (options.fetch) return options.fetch(request);
      if (request.url.endsWith('/authentication/login')) return Response.json({ token: 'fixture-provider-token' });
      if (request.url.endsWith('/customers/create')) return Response.json({ id: 'fixture-customer' });
      if (request.url.endsWith('/payment_links/create')) return Response.json({ id: 'fixture-link', url: 'https://checkout.example.invalid/fixture' });
      if (request.url === 'https://api.brevo.com/v3/smtp/email') return Response.json({ messageId: 'fixture-mail' }, { status: 201 });
      throw new Error('Unexpected external request: ' + request.url);
    }
  });
  const modules = new Map();
  async function load(filename) {
    if (modules.has(filename)) return modules.get(filename);
    let module;
    if (filename === 'node:crypto') {
      module = new vm.SyntheticModule(['default'], function () { this.setExport('default', crypto); }, { context });
    } else if (filename === '@netlify/blobs') {
      module = new vm.SyntheticModule(['getStore'], function () { this.setExport('getStore', () => store); }, { context });
    } else {
      module = new vm.SourceTextModule(await fs.readFile(filename, 'utf8'), { context, identifier: filename });
    }
    modules.set(filename, module);
    if (filename !== 'node:crypto' && filename !== '@netlify/blobs') {
      await module.link((specifier, referring) => load(specifier.startsWith('.')
        ? path.resolve(path.dirname(referring.identifier), specifier) : specifier));
    }
    return module;
  }
  const module = await load(path.join(FUNCTIONS, entry + '.mjs'));
  await module.evaluate();
  return { handler: module.namespace.default, records, writes, writeAttempts, deletes, requests, reads };
}

function post(body) {
  return new Request('https://app.example.invalid/test', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'User-Agent': 'Windows Desktop' }, body: JSON.stringify(body)
  });
}

function paymentBody(overrides = {}) {
  return { device_id: 'new-desktop', email: EMAIL, password: PASSWORD, plan: 'monthly', ...overrides };
}

function paymentEvent(metadata = {}, object = {}) {
  return {
    name: 'payment_intent.succeeded',
    data: { object: {
      id: 'fixture-intent', captured_amount: 7.9, currency: 'EUR',
      metadata: {
        device_id: 'new-desktop', device_type: 'desktop', email: EMAIL,
        password_hash: 'replacement-hash-from-old-payment', salt: 'replacement-salt',
        plan: 'monthly', access_days: '30', amount: '7.9', currency: 'EUR', ...metadata
      }, ...object
    } }
  };
}

function signedEvent(event, secret = WEBHOOK_SECRET) {
  const body = JSON.stringify(event);
  const timestamp = String(Date.now());
  const signature = crypto.createHmac('sha256', secret).update(timestamp + body).digest('hex');
  return new Request('https://app.example.invalid/webhook', {
    method: 'POST', headers: { 'x-timestamp': timestamp, 'x-signature': signature }, body
  });
}

function replacementPending(overrides = {}) {
  const email = EMAIL;
  const deviceType = 'desktop';
  const deviceId = 'new-desktop';
  const code = '123456';
  const codeHash = crypto.createHmac('sha256', REPLACEMENT_SECRET)
    .update([email, deviceType, deviceId, code].join('|')).digest('hex');
  return {
    email, deviceType, deviceId, codeHash, deviceLabel: 'New PC', attempts: 0,
    created: Date.now() - 1000, expires: Date.now() + 600000, ...overrides
  };
}

test('permanent grants block checkout before any provider call, including a stale paid flag', async () => {
  for (const value of [permanentAccount(), permanentAccount({ paid: false, expiry: 1 })]) {
    const h = await harness('create-payment-link', { ['email:' + EMAIL]: value });
    const response = await h.handler(post(paymentBody()), { geo: { country: { code: 'FR' } } });
    assert.equal(response.status, 409);
    assert.equal((await response.json()).error, 'access_already_granted');
    assert.equal(h.requests.length, 0);
    assert.deepEqual(h.writes, []);
    assert.deepEqual(h.records.get('email:' + EMAIL), value);
  }
});

test('ordinary active subscriptions still reject duplicate checkout as email_taken', async () => {
  const h = await harness('create-payment-link', { ['email:' + EMAIL]: account() });
  const response = await h.handler(post(paymentBody()), { geo: { country: { code: 'FR' } } });
  assert.equal(response.status, 409);
  assert.equal((await response.json()).error, 'email_taken');
  assert.equal(h.requests.length, 0);
  assert.deepEqual(h.writes, []);
});

test('expired ordinary subscriptions and revoked grants retain the existing EUR checkout', async () => {
  for (const value of [account({ expiry: 1 }), account({ expiry: 1, complimentaryAccess: { status: 'revoked', permanent: true } })]) {
    const h = await harness('create-payment-link', { ['email:' + EMAIL]: value });
    const response = await h.handler(post(paymentBody()), { geo: { country: { code: 'FR' } } });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).url, 'https://checkout.example.invalid/fixture');
    const payload = JSON.parse(h.requests.find(request => request.url.endsWith('/payment_links/create')).body);
    assert.equal(payload.amount, 7.9);
    assert.equal(payload.currency, 'EUR');
    assert.deepEqual(h.writes.sort(), ['pending:device:new-desktop', 'pending:link:fixture-link']);
    assert.deepEqual(h.records.get('email:' + EMAIL), value);
  }
});

test('a signed old payment cannot replace a permanent account, hash, or 30-device map', async () => {
  const value = permanentAccount({ paid: false });
  const h = await harness('airwallex-webhook', { ['email:' + EMAIL]: value, unrelated: { paid: true } });
  const before = clone(Object.fromEntries(h.records));
  const response = await h.handler(signedEvent(paymentEvent()));
  assert.equal(response.status, 200);
  assert.equal(await response.text(), 'complimentary access preserved');
  assert.deepEqual(Object.fromEntries(h.records), before);
  assert.deepEqual(h.writes, []);
  assert.deepEqual(h.deletes, []);
  assert.equal(h.requests.length, 0);
});

test('old pending-link metadata cannot replace a grant', async () => {
  const pending = {
    deviceId: 'new-desktop', deviceType: 'desktop', email: EMAIL,
    passwordHash: 'pending-hash', salt: 'pending-salt', plan: 'monthly', accessDays: 30, amount: 7.9, currency: 'EUR'
  };
  const h = await harness('airwallex-webhook', { ['email:' + EMAIL]: permanentAccount(), 'pending:link:old-link': pending });
  const before = clone(Object.fromEntries(h.records));
  const event = paymentEvent({}, { metadata: {}, payment_link_id: 'old-link' });
  assert.equal((await h.handler(signedEvent(event))).status, 200);
  assert.deepEqual(Object.fromEntries(h.records), before);
  assert.equal(h.requests.length, 0);
});

test('device-only old payments preserve a grant found through the registered device', async () => {
  const h = await harness('airwallex-webhook', {
    ['email:' + EMAIL]: permanentAccount(), 'new-desktop': { email: EMAIL, paid: true, expiry: null }
  });
  const before = clone(Object.fromEntries(h.records));
  const event = paymentEvent({ email: '', password_hash: '', salt: '' });
  const response = await h.handler(signedEvent(event));
  assert.equal(await response.text(), 'complimentary access preserved');
  assert.deepEqual(Object.fromEntries(h.records), before);
  assert.equal(h.requests.length, 0);
});

test('payment amount and signature checks remain in effect', async () => {
  const h = await harness('airwallex-webhook', { ['email:' + EMAIL]: permanentAccount() });
  const invalidSignature = await h.handler(signedEvent(paymentEvent(), 'incorrect-fixture-secret'));
  assert.equal(invalidSignature.status, 401);
  const invalidAmount = await h.handler(signedEvent(paymentEvent({}, { captured_amount: 0.1 })));
  assert.equal(await invalidAmount.text(), 'amount mismatch');
  assert.deepEqual(h.writes, []);
  assert.deepEqual(h.deletes, []);
  assert.equal(h.requests.length, 0);
});

test('ordinary payments still provision two slots, preserve the other slot, and send one simulated confirmation', async () => {
  const value = account();
  const other = permanentAccount({ email: 'another-owner@example.invalid' });
  const h = await harness('airwallex-webhook', { ['email:' + EMAIL]: value, 'email:another-owner@example.invalid': other });
  const response = await h.handler(signedEvent(paymentEvent()));
  assert.equal(response.status, 200);
  const updated = h.records.get('email:' + EMAIL);
  assert.equal(updated.passwordHash, 'replacement-hash-from-old-payment');
  assert.equal(updated.devices.desktop.deviceId, 'new-desktop');
  assert.deepEqual(updated.devices.mobile, value.devices.mobile);
  assert.equal(updated.plan, 'monthly');
  assert.ok(updated.expiry > Date.now());
  assert.deepEqual(h.records.get('email:another-owner@example.invalid'), other);
  assert.equal(h.requests.filter(request => request.url.includes('api.brevo.com')).length, 1);
});

test('replacement requests disclose the shared-account guard only after the password is checked', async () => {
  const value = permanentAccount();
  const h = await harness('request-device-replacement', { ['email:' + EMAIL]: value });
  const wrong = await h.handler(post(paymentBody({ password: 'incorrect-fixture-password' })));
  assert.equal(wrong.status, 401);
  assert.equal((await wrong.json()).error, 'invalid_credentials');
  const correct = await h.handler(post(paymentBody()));
  assert.equal(correct.status, 409);
  assert.equal((await correct.json()).error, 'shared_account_managed_by_owner');
  assert.deepEqual(h.records.get('email:' + EMAIL), value);
  assert.deepEqual(h.writes, []);
  assert.equal(h.requests.length, 0);
});

test('an already-issued valid replacement code cannot convert a grant back to two slots', async () => {
  const value = permanentAccount();
  const pending = replacementPending();
  const h = await harness('confirm-device-replacement', { ['email:' + EMAIL]: value, ['replacement:' + EMAIL + ':desktop']: pending });
  const before = clone(Object.fromEntries(h.records));
  const response = await h.handler(post({ email: EMAIL, device_id: 'new-desktop', code: '123456' }));
  assert.equal(response.status, 409);
  assert.equal((await response.json()).error, 'shared_account_managed_by_owner');
  assert.deepEqual(Object.fromEntries(h.records), before);
  assert.deepEqual(h.writes, []);
  assert.deepEqual(h.deletes, []);
  assert.equal(h.requests.length, 0);
});

test('invalid and expired replacement codes retain their existing responses without changing the grant', async () => {
  const value = permanentAccount();
  const key = 'replacement:' + EMAIL + ':desktop';
  const h = await harness('confirm-device-replacement', { ['email:' + EMAIL]: value, [key]: replacementPending() });
  const invalid = await h.handler(post({ email: EMAIL, device_id: 'new-desktop', code: '000000' }));
  assert.equal(invalid.status, 401);
  assert.equal((await invalid.json()).error, 'invalid_code');
  assert.equal(h.records.get(key).attempts, 1);
  assert.deepEqual(h.records.get('email:' + EMAIL), value);
  h.records.set(key, replacementPending({ expires: 1 }));
  const expired = await h.handler(post({ email: EMAIL, device_id: 'new-desktop', code: '123456' }));
  assert.equal(expired.status, 410);
  assert.equal((await expired.json()).error, 'code_expired');
  assert.deepEqual(h.records.get('email:' + EMAIL), value);
  assert.equal(h.requests.length, 0);
});

test('ordinary replacement still sends a simulated code and replaces only the selected slot', async () => {
  const value = account();
  const request = await harness('request-device-replacement', {
    ['email:' + EMAIL]: value,
    'old-desktop': { email: EMAIL, paid: true },
    'session:old-session': { email: EMAIL }
  });
  const sent = await request.handler(post(paymentBody()));
  assert.equal(sent.status, 200);
  assert.equal((await sent.json()).success, true);
  assert.equal(request.requests.length, 1);
  const mail = JSON.parse(request.requests[0].body);
  const code = mail.htmlContent.match(/>(\d{6})<\/p>/)[1];
  const confirm = await harness('confirm-device-replacement', {}, { records: request.records });
  const response = await confirm.handler(post({ email: EMAIL, device_id: 'new-desktop', code }));
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.success, true);
  assert.equal(result.expiry, value.expiry);
  assert.ok(result.session_token);
  const updated = confirm.records.get('email:' + EMAIL);
  assert.deepEqual(updated.devices.mobile, value.devices.mobile);
  assert.equal(updated.devices.desktop.deviceId, 'new-desktop');
  assert.equal(confirm.records.has('old-desktop'), false);
  assert.equal(confirm.records.has('session:old-session'), false);
  assert.equal(confirm.records.has('replacement:' + EMAIL + ':desktop'), false);
  assert.equal(confirm.requests.length, 0);
});

test('an unreadable account cannot trigger a checkout while its access is unknown', async () => {
  const h = await harness('create-payment-link', {}, { beforeRead() { throw new Error('simulated store outage'); } });
  const response = await h.handler(post(paymentBody()), { geo: { country: { code: 'FR' } } });
  assert.equal(response.status, 500);
  assert.equal((await response.json()).error, 'server_error');
  assert.equal(h.requests.length, 0);
  assert.deepEqual(h.writes, []);
});

test('webhook CAS preserves a grant applied after its account snapshot', async () => {
  const grant = permanentAccount();
  let inserted = false;
  const h = await harness('airwallex-webhook', { ['email:' + EMAIL]: account() }, {
    beforeWrite({ key, conditions, putRecord }) {
      if (key === 'email:' + EMAIL && conditions.onlyIfMatch && !inserted) {
        inserted = true;
        putRecord(key, grant);
      }
    }
  });
  const response = await h.handler(signedEvent(paymentEvent()));
  assert.equal(response.status, 200);
  assert.equal(await response.text(), 'complimentary access preserved');
  assert.equal(inserted, true);
  assert.deepEqual(h.records.get('email:' + EMAIL), grant);
  assert.equal(h.records.has('new-desktop'), false);
  assert.deepEqual(h.writes, []);
  assert.deepEqual(h.deletes, []);
  assert.equal(h.requests.length, 0);
});

test('webhook creation uses onlyIfNew and cannot overwrite a concurrently created grant', async () => {
  const grant = permanentAccount();
  const h = await harness('airwallex-webhook', {}, {
    beforeWrite({ key, conditions, putRecord }) {
      if (key === 'email:' + EMAIL && conditions.onlyIfNew) putRecord(key, grant);
    }
  });
  const response = await h.handler(signedEvent(paymentEvent()));
  assert.equal(await response.text(), 'complimentary access preserved');
  assert.ok(h.writeAttempts.some(attempt => attempt.key === 'email:' + EMAIL && attempt.conditions.onlyIfNew === true));
  assert.deepEqual(h.records.get('email:' + EMAIL), grant);
  assert.equal(h.records.has('new-desktop'), false);
  assert.deepEqual(h.writes, []);
  assert.equal(h.requests.length, 0);
});

test('a webhook conflict retries from the latest ordinary account without losing its other slot', async () => {
  const value = account();
  const latestMobile = { ...value.devices.mobile, label: 'Updated phone' };
  let injected = false;
  const h = await harness('airwallex-webhook', { ['email:' + EMAIL]: value }, {
    beforeWrite({ key, conditions, putRecord }) {
      if (key === 'email:' + EMAIL && conditions.onlyIfMatch && !injected) {
        injected = true;
        putRecord(key, { ...value, ownerNote: 'concurrent update', devices: { ...value.devices, mobile: latestMobile } });
      }
    }
  });
  const response = await h.handler(signedEvent(paymentEvent()));
  assert.equal(response.status, 200);
  const updated = h.records.get('email:' + EMAIL);
  assert.equal(updated.ownerNote, 'concurrent update');
  assert.deepEqual(updated.devices.mobile, latestMobile);
  assert.equal(updated.devices.desktop.deviceId, 'new-desktop');
  assert.equal(h.requests.length, 1);
  assert.equal(h.writeAttempts.filter(attempt => attempt.key === 'email:' + EMAIL).length, 2);
});

test('webhook conflicts stop after three attempts without provisioning a device or email', async () => {
  const h = await harness('airwallex-webhook', { ['email:' + EMAIL]: account() }, {
    beforeWrite({ key, conditions, records, putRecord }) {
      if (key === 'email:' + EMAIL && conditions.onlyIfMatch) putRecord(key, { ...records.get(key), concurrentUpdate: Date.now() });
    }
  });
  const response = await h.handler(signedEvent(paymentEvent()));
  assert.equal(response.status, 503);
  assert.equal(await response.text(), 'account update conflict');
  assert.equal(h.writeAttempts.filter(attempt => attempt.key === 'email:' + EMAIL).length, 3);
  assert.deepEqual(h.writes, []);
  assert.equal(h.records.has('new-desktop'), false);
  assert.equal(h.requests.length, 0);
});

test('replacement CAS cannot replace a grant applied after password/code authentication', async () => {
  const grant = permanentAccount();
  const pending = replacementPending();
  let inserted = false;
  const h = await harness('confirm-device-replacement', {
    ['email:' + EMAIL]: account(), ['replacement:' + EMAIL + ':desktop']: pending,
    'old-desktop': { paid: true, email: EMAIL }, 'session:old-session': { email: EMAIL }
  }, {
    beforeWrite({ key, conditions, putRecord }) {
      if (key === 'email:' + EMAIL && conditions.onlyIfMatch && !inserted) { inserted = true; putRecord(key, grant); }
    }
  });
  const response = await h.handler(post({ email: EMAIL, device_id: 'new-desktop', code: '123456' }));
  assert.equal(response.status, 409);
  assert.equal((await response.json()).error, 'shared_account_managed_by_owner');
  assert.equal(inserted, true);
  assert.deepEqual(h.records.get('email:' + EMAIL), grant);
  assert.deepEqual(h.records.get('replacement:' + EMAIL + ':desktop'), pending);
  assert.equal(h.records.has('new-desktop'), false);
  assert.equal(h.records.has('old-desktop'), true);
  assert.equal(h.records.has('session:old-session'), true);
  assert.deepEqual(h.writes, []);
  assert.deepEqual(h.deletes, []);
});

test('ordinary replacement retries from the latest slot data on an account conflict', async () => {
  const value = account();
  const latestMobile = { ...value.devices.mobile, label: 'Concurrent phone label' };
  let injected = false;
  const h = await harness('confirm-device-replacement', {
    ['email:' + EMAIL]: value, ['replacement:' + EMAIL + ':desktop']: replacementPending()
  }, {
    beforeWrite({ key, conditions, putRecord }) {
      if (key === 'email:' + EMAIL && conditions.onlyIfMatch && !injected) {
        injected = true;
        putRecord(key, { ...value, ownerNote: 'kept', devices: { ...value.devices, mobile: latestMobile } });
      }
    }
  });
  const response = await h.handler(post({ email: EMAIL, device_id: 'new-desktop', code: '123456' }));
  assert.equal(response.status, 200);
  const updated = h.records.get('email:' + EMAIL);
  assert.equal(updated.ownerNote, 'kept');
  assert.deepEqual(updated.devices.mobile, latestMobile);
  assert.equal(updated.devices.desktop.deviceId, 'new-desktop');
  assert.equal(h.writeAttempts.filter(attempt => attempt.key === 'email:' + EMAIL).length, 2);
});

test('replacement conflicts are bounded and do not revoke current devices or codes', async () => {
  const pending = replacementPending();
  const h = await harness('confirm-device-replacement', {
    ['email:' + EMAIL]: account(), ['replacement:' + EMAIL + ':desktop']: pending
  }, {
    beforeWrite({ key, conditions, records, putRecord }) {
      if (key === 'email:' + EMAIL && conditions.onlyIfMatch) putRecord(key, { ...records.get(key), concurrentUpdate: Date.now() });
    }
  });
  const response = await h.handler(post({ email: EMAIL, device_id: 'new-desktop', code: '123456' }));
  assert.equal(response.status, 409);
  assert.equal((await response.json()).error, 'account_update_conflict');
  assert.equal(h.writeAttempts.filter(attempt => attempt.key === 'email:' + EMAIL).length, 3);
  assert.deepEqual(h.records.get('replacement:' + EMAIL + ':desktop'), pending);
  assert.deepEqual(h.writes, []);
  assert.deepEqual(h.deletes, []);
  assert.equal(h.records.has('new-desktop'), false);
});

test('missing account ETags never fall back to blind account writes', async () => {
  const payment = await harness('airwallex-webhook', { ['email:' + EMAIL]: account() }, { omitEtag: true });
  assert.equal((await payment.handler(signedEvent(paymentEvent()))).status, 503);
  assert.deepEqual(payment.writes, []);
  assert.equal(payment.requests.length, 0);
  const replacement = await harness('confirm-device-replacement', {
    ['email:' + EMAIL]: account(), ['replacement:' + EMAIL + ':desktop']: replacementPending()
  }, { omitEtag: true });
  const response = await replacement.handler(post({ email: EMAIL, device_id: 'new-desktop', code: '123456' }));
  assert.equal(response.status, 409);
  assert.equal((await response.json()).error, 'account_update_conflict');
  assert.deepEqual(replacement.writes, []);
});

test('a device-only payment retains the account and session when a grant is activated during its cache write', async () => {
  const deviceId = 'shared-device-0';
  const grant = permanentAccount();
  const cache = { paid: true, expiry: Date.now() + 10000, email: EMAIL, deviceType: 'desktop', sessionHash: 'session-0' };
  let inserted = false;
  const h = await harness('airwallex-webhook', {
    ['email:' + EMAIL]: account(), [deviceId]: cache,
    'session:session-0': { email: EMAIL, deviceId, deviceType: 'desktop' }
  }, {
    beforeWrite({ key, conditions, putRecord }) {
      if (key === deviceId && conditions.onlyIfMatch && !inserted) {
        inserted = true;
        putRecord('email:' + EMAIL, grant);
      }
    }
  });
  const response = await h.handler(signedEvent(paymentEvent({ device_id: deviceId, email: null, password_hash: null, salt: null })));
  assert.equal(response.status, 200);
  assert.equal(await response.text(), 'complimentary access preserved');
  assert.equal(inserted, true);
  assert.deepEqual(h.records.get('email:' + EMAIL), grant);
  assert.equal(h.records.get(deviceId).email, EMAIL);
  assert.equal(h.records.get(deviceId).sessionHash, 'session-0');
  assert.equal(h.records.get(deviceId).deviceType, 'desktop');
  assert.deepEqual(h.deletes, []);
  assert.equal(h.requests.length, 0);

  // The preserved association makes the account grant authoritative even if
  // the old payment left a finite expiry in this device cache.
  const checker = await harness('check-status', {}, { records: h.records });
  const checked = await checker.handler(new Request('https://app.example.invalid/check?device_id=' + deviceId));
  const status = await checked.json();
  assert.equal(status.paid, true);
  assert.equal(status.permanent, true);
  assert.equal(status.expiry, null);
});

test('a device-only payment cannot replace a concurrent login session with its stale cache', async () => {
  const cache = { paid: true, expiry: Date.now() + 10000, email: EMAIL, deviceType: 'desktop', sessionHash: 'old-session' };
  let reconnected = false;
  const h = await harness('airwallex-webhook', { ['email:' + EMAIL]: account(), 'new-desktop': cache }, {
    beforeWrite({ key, conditions, putRecord }) {
      if (key === 'new-desktop' && conditions.onlyIfMatch && !reconnected) {
        reconnected = true;
        putRecord(key, { ...cache, sessionHash: 'new-session', loginMarker: 'preserve-me' });
        putRecord('session:new-session', { email: EMAIL, deviceId: key, deviceType: 'desktop' });
      }
    }
  });
  const response = await h.handler(signedEvent(paymentEvent({ email: null, password_hash: null, salt: null })));
  assert.equal(response.status, 200);
  assert.equal(reconnected, true);
  assert.equal(h.records.get('new-desktop').sessionHash, 'new-session');
  assert.equal(h.records.get('new-desktop').email, EMAIL);
  assert.equal(h.records.get('new-desktop').loginMarker, 'preserve-me');
  assert.equal(h.records.has('session:new-session'), true);
  assert.equal(h.writeAttempts.filter(attempt => attempt.key === 'new-desktop').length, 2);
  assert.equal(h.requests.length, 0);
});

test('device-only legacy payments keep anonymous devices working without creating accounts', async () => {
  for (const initial of [{}, { 'new-desktop': { paid: false, expiry: 1, oldMarker: 'kept' } }]) {
    const h = await harness('airwallex-webhook', initial);
    const response = await h.handler(signedEvent(paymentEvent({ email: null, password_hash: null, salt: null })));
    assert.equal(response.status, 200);
    const device = h.records.get('new-desktop');
    assert.equal(device.paid, true);
    assert.ok(device.expiry > Date.now());
    assert.equal(device.plan, 'monthly');
    assert.equal(device.email, undefined);
    assert.equal(h.records.has('email:' + EMAIL), false);
    assert.equal(h.requests.length, 0);
    assert.deepEqual(h.writes, ['new-desktop']);
    if (initial['new-desktop']) assert.equal(device.oldMarker, 'kept');
  }
});

test('device-only cache conflicts are bounded and never trigger a blind write', async () => {
  const cache = { paid: true, expiry: Date.now() + 10000, email: EMAIL, sessionHash: 'kept-session' };
  for (const omitEtag of [false, true]) {
    const h = await harness('airwallex-webhook', { ['email:' + EMAIL]: account(), 'new-desktop': cache }, {
      omitEtag,
      beforeWrite({ key, conditions, records, putRecord }) {
        if (key === 'new-desktop' && conditions.onlyIfMatch) putRecord(key, { ...records.get(key), concurrent: true });
      }
    });
    const response = await h.handler(signedEvent(paymentEvent({ email: null, password_hash: null, salt: null })));
    assert.equal(response.status, 503);
    assert.equal(await response.text(), 'device update conflict');
    assert.equal(h.writeAttempts.filter(attempt => attempt.key === 'new-desktop').length, omitEtag ? 0 : 3);
    assert.equal(h.records.get('new-desktop').sessionHash, 'kept-session');
    assert.deepEqual(h.writes, []);
    assert.deepEqual(h.deletes, []);
    assert.equal(h.requests.length, 0);
  }
});

test('a credential payment cannot overwrite a grant and fresh session created before its cache write', async () => {
  const grant = permanentAccount();
  delete grant.devices['shared-device-0'];
  grant.devices['new-desktop'] = { deviceId: 'new-desktop', deviceType: 'desktop', sessionHash: 'fresh-shared-session' };
  const cache = { paid: true, expiry: Date.now() + 10000, email: EMAIL, deviceType: 'desktop', sessionHash: 'old-session' };
  const fresh = { ...cache, expiry: null, sessionHash: 'fresh-shared-session' };
  let granted = false;
  const h = await harness('airwallex-webhook', { ['email:' + EMAIL]: account(), 'new-desktop': cache }, {
    beforeWrite({ key, conditions, putRecord }) {
      if (key === 'new-desktop' && conditions.onlyIfMatch && !granted) {
        granted = true;
        putRecord('email:' + EMAIL, grant);
        putRecord(key, fresh);
        putRecord('session:fresh-shared-session', { email: EMAIL, deviceId: key, deviceType: 'desktop' });
      }
    }
  });
  const response = await h.handler(signedEvent(paymentEvent()));
  assert.equal(response.status, 200);
  assert.equal(await response.text(), 'complimentary access preserved');
  assert.equal(granted, true);
  assert.deepEqual(h.records.get('email:' + EMAIL), grant);
  assert.deepEqual(h.records.get('new-desktop'), fresh);
  assert.equal(h.records.has('session:fresh-shared-session'), true);
  assert.equal(h.requests.length, 0);
  assert.deepEqual(h.deletes, []);
});

test('a credential payment preserves an ordinary login session created during its cache write', async () => {
  const cache = { paid: true, expiry: Date.now() + 10000, email: EMAIL, deviceType: 'desktop', sessionHash: 'old-session' };
  let reconnected = false;
  const h = await harness('airwallex-webhook', { ['email:' + EMAIL]: account(), 'new-desktop': cache }, {
    beforeWrite({ key, conditions, records, putRecord }) {
      if (key === 'new-desktop' && conditions.onlyIfMatch && !reconnected) {
        reconnected = true;
        putRecord(key, { ...cache, sessionHash: 'fresh-session', loginMarker: 'preserved' });
        const latest = records.get('email:' + EMAIL);
        putRecord('email:' + EMAIL, { ...latest, devices: {
          ...latest.devices, desktop: { ...latest.devices.desktop, sessionHash: 'fresh-session' }
        } });
      }
    }
  });
  const response = await h.handler(signedEvent(paymentEvent()));
  assert.equal(response.status, 200);
  assert.equal(reconnected, true);
  assert.equal(h.records.get('new-desktop').sessionHash, 'fresh-session');
  assert.equal(h.records.get('new-desktop').loginMarker, 'preserved');
  assert.equal(h.records.get('email:' + EMAIL).devices.desktop.sessionHash, 'fresh-session');
  assert.equal(h.writeAttempts.filter(attempt => attempt.key === 'new-desktop').length, 2);
  assert.equal(h.requests.length, 1);
});

test('reserved device keys cannot address account, session, pending, or replacement records', async () => {
  const value = account();
  for (const prefix of ['email:', 'session:', 'pending:', 'replacement:', 'EMAIL:']) {
    const deviceId = prefix + 'protected';
    const initial = { ['email:' + EMAIL]: value, [deviceId]: { protected: true } };
    for (const entry of ['create-payment-link', 'request-device-replacement', 'confirm-device-replacement', 'airwallex-webhook']) {
      const h = await harness(entry, initial);
      const response = await h.handler(entry === 'airwallex-webhook'
        ? signedEvent(paymentEvent({ device_id: deviceId }))
        : post({ ...paymentBody({ device_id: deviceId }), code: '123456' }));
      assert.equal(response.status, entry === 'airwallex-webhook' ? 200 : 400, entry + ': ' + deviceId);
      if (entry === 'airwallex-webhook') assert.equal(await response.text(), 'invalid device');
      assert.deepEqual(Object.fromEntries(h.records), initial);
      assert.deepEqual(h.writes, []);
      assert.deepEqual(h.deletes, []);
      assert.equal(h.requests.length, 0);
    }
  }
});

test('historic pending-link metadata also rejects a reserved device key', async () => {
  const h = await harness('airwallex-webhook', {
    ['email:' + EMAIL]: account(),
    'pending:link:unsafe-link': {
      deviceId: 'email:' + EMAIL, email: EMAIL, passwordHash: 'old-hash', salt: 'old-salt',
      plan: 'monthly', accessDays: 30, amount: 7.9, currency: 'EUR'
    }
  });
  const before = clone(Object.fromEntries(h.records));
  const response = await h.handler(signedEvent(paymentEvent({}, { metadata: {}, payment_link_id: 'unsafe-link' })));
  assert.equal(response.status, 200);
  assert.equal(await response.text(), 'invalid device');
  assert.deepEqual(Object.fromEntries(h.records), before);
  assert.deepEqual(h.writes, []);
  assert.deepEqual(h.deletes, []);
  assert.equal(h.requests.length, 0);
});

test('replacement never deletes a historic reserved-key device entry', async () => {
  const value = account();
  value.devices.desktop.deviceId = 'email:protected';
  const protectedAccount = { protected: true };
  const h = await harness('confirm-device-replacement', {
    ['email:' + EMAIL]: value, 'email:protected': protectedAccount,
    ['replacement:' + EMAIL + ':desktop']: replacementPending()
  });
  const response = await h.handler(post({ email: EMAIL, device_id: 'new-desktop', code: '123456' }));
  assert.equal(response.status, 200);
  assert.deepEqual(h.records.get('email:protected'), protectedAccount);
  assert.equal(h.deletes.includes('email:protected'), false);
});
