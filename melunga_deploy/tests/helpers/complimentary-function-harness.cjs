const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');

const FIXTURE_PASSWORD = 'Fixture-only-passphrase-843';
const FUNCTION_ROOT = path.resolve(__dirname, '../../netlify/functions');
const clone = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value));

class MemoryStore {
  constructor(records = {}) {
    this.rows = new Map(); this.version = 0; this.calls = []; this.hooks = {};
    for (const [key, value] of records instanceof Map ? records : Object.entries(records)) this.seed(key, value);
  }
  seed(key, value) { this.rows.set(key, { data: clone(value), etag: '"v' + (++this.version) + '"' }); }
  value(key) { return clone(this.rows.get(key)?.data); }
  async get(key) {
    this.calls.push({ method: 'get', key });
    const value = this.value(key);
    await this.hooks.afterGet?.({ key, value, store: this });
    return value === undefined ? null : value;
  }
  async getWithMetadata(key) {
    this.calls.push({ method: 'getWithMetadata', key });
    const row = this.rows.get(key);
    const snapshot = row ? { data: clone(row.data), etag: row.etag, metadata: {} } : null;
    await this.hooks.afterSnapshot?.({ key, snapshot, store: this });
    return snapshot;
  }
  async setJSON(key, value, options = {}) {
    this.calls.push({ method: 'setJSON', key, options: { ...options } });
    await this.hooks.beforeSet?.({ key, value, options, store: this });
    const current = this.rows.get(key);
    if (options.onlyIfNew && current || options.onlyIfMatch && current?.etag !== options.onlyIfMatch) {
      return { modified: false };
    }
    this.seed(key, value);
    const result = { modified: true, etag: this.rows.get(key).etag };
    await this.hooks.afterSet?.({ key, value, options, store: this });
    return result;
  }
  async delete(key) {
    this.calls.push({ method: 'delete', key });
    await this.hooks.beforeDelete?.({ key, store: this });
    this.rows.delete(key);
  }
}

function fixtureAccount(overrides = {}) {
  const salt = '00112233445566778899aabbccddeeff';
  return {
    email: 'fixture@example.test', salt,
    passwordHash: crypto.pbkdf2Sync(FIXTURE_PASSWORD, salt, 100000, 32, 'sha256').toString('hex'),
    paid: true, expiry: Date.UTC(2080, 0, 1), plan: 'annual',
    devices: { desktop: null, mobile: null }, untouched: 'preserve-me',
    ...clone(overrides)
  };
}

async function loadFunctions(store, { now = Date.UTC(2026, 9, 23) } = {}) {
  if (!vm.SourceTextModule) throw new Error('Run Node with --experimental-vm-modules');
  const clock = { now };
  class TestDate extends Date {
    constructor(...args) { super(...(args.length ? args : [clock.now])); }
    static now() { return clock.now; }
  }
  const errors = [];
  const context = vm.createContext({
    Request, Response, Headers, URL, URLSearchParams, Buffer, Date: TestDate,
    console: { error: (...args) => errors.push(args.map(String).join(' ')), log() {} },
    setTimeout, clearTimeout
  });
  const cache = new Map();
  const blobs = new vm.SyntheticModule(['getStore'], function () { this.setExport('getStore', () => store); }, { context });
  const cryptoModule = new vm.SyntheticModule(['default', ...Object.keys(crypto)], function () {
    this.setExport('default', crypto);
    for (const name of Object.keys(crypto)) this.setExport(name, crypto[name]);
  }, { context });
  async function moduleFor(file) {
    if (file === '@netlify/blobs') return blobs;
    if (file === 'node:crypto') return cryptoModule;
    if (!file.startsWith(FUNCTION_ROOT + path.sep)) throw new Error('Unexpected import: ' + file);
    if (cache.has(file)) return cache.get(file);
    const mod = new vm.SourceTextModule(fs.readFileSync(file, 'utf8'), { context, identifier: file });
    cache.set(file, mod);
    await mod.link((specifier, parent) => moduleFor(specifier.startsWith('.')
      ? path.resolve(path.dirname(parent.identifier), specifier) : specifier));
    return mod;
  }
  async function endpoint(name) {
    const mod = await moduleFor(path.join(FUNCTION_ROOT, name + '.mjs'));
    if (mod.status !== 'evaluated') await mod.evaluate();
    return mod.namespace;
  }
  return {
    login: (await endpoint('login')).default,
    status: (await endpoint('check-status')).default,
    logout: (await endpoint('logout')).default,
    helper: await endpoint('complimentary-access'),
    devices: await endpoint('device-access'), clock, errors, store
  };
}

function request(body = {}, token = '', { ua = 'Mozilla/5.0 Desktop', method = 'POST', query = '' } = {}) {
  const headers = { 'Content-Type': 'application/json', 'User-Agent': ua };
  if (token) headers.Authorization = 'Bearer ' + token;
  return new Request('https://fixture.example.test/.netlify/functions/test' + query, {
    method, headers, ...(method === 'GET' ? {} : { body: JSON.stringify(body) })
  });
}

async function login(harness, deviceId, { email = 'fixture@example.test', password = FIXTURE_PASSWORD, mobile = false } = {}) {
  const response = await harness.login(request({
    email, password, device_id: deviceId, device_type: mobile ? 'mobile' : 'desktop'
  }, '', { ua: mobile ? 'Mozilla/5.0 Android Mobile' : 'Mozilla/5.0 Desktop' }));
  return { status: response.status, body: await response.json() };
}
async function status(harness, { token = '', deviceId = '' } = {}) {
  const response = await harness.status(request({}, token, {
    method: 'GET', query: deviceId ? '?device_id=' + encodeURIComponent(deviceId) : ''
  }));
  return { status: response.status, body: await response.json() };
}
async function logout(harness, { token = '', deviceId = '' } = {}) {
  const response = await harness.logout(request(deviceId ? { device_id: deviceId } : {}, token));
  return { status: response.status, body: await response.json() };
}

module.exports = { MemoryStore, fixtureAccount, loadFunctions, request, login, status, logout, FIXTURE_PASSWORD };
