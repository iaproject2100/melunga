/* Read-only transport tests. Every fetch and timer is an in-memory fixture;
 * no server, account, HTTP request or real 12-second wait is used. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const {test, after} = require('node:test');
const FILE = path.join(__dirname, '../course-data.js');
const SOURCE = fs.readFileSync(FILE, 'utf8');
const DOCUMENT = 'content/niveaux-progressifs/fr-es/L1.json';
const flush = async () => { for (let i = 0; i < 6; i++) await new Promise(setImmediate); };
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

function response({status = 200, body = '{"source":"current-document"}', failure, headers = { 'content-type': 'application/json' }} = {}) {
  const bytes = Buffer.from(body);
  return {ok: status >= 200 && status < 300, status, statusText: 'Fixture ' + status, headers: new Headers(headers),
    arrayBuffer: async () => { if (failure) throw failure; return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength); }};
}
function fixture(responder) {
  const f = {calls: [], timers: new Map(), nextTimer: 0};
  const nativeFetch = function (url, options) {
    const call = {url, options}; f.calls.push(call); return responder(call, f.calls.length);
  };
  const context = {fetch: nativeFetch, AbortController, DOMException, Response, TextDecoder,
    setTimeout(fn, delay) { const id = ++f.nextTimer; f.timers.set(id, {fn, delay}); return id; },
    clearTimeout(id) { f.timers.delete(id); }};
  context.window = context;
  vm.runInNewContext(SOURCE, context, {filename: FILE});
  f.api = context.MelungaCourseData;
  f.context = context;
  f.nativeFetch = nativeFetch;
  f.watch = promise => {
    const result = {settled: false};
    promise.then(value => { result.value = value; result.settled = true; }, error => { result.error = error; result.settled = true; });
    return result;
  };
  f.fire = async delay => {
    const entry = [...f.timers].find(([, timer]) => timer.delay === delay);
    assert.ok(entry, 'one pending fixture timer at ' + delay + ' ms');
    f.timers.delete(entry[0]); entry[1].fn(); await flush();
  };
  return f;
}
function pendingUntilAbort(call) {
  return new Promise((resolve, reject) => {
    call.options.signal.addEventListener('abort', () => reject(new DOMException('Fixture aborted', 'AbortError')), {once: true});
  });
}
function completed(result) {
  assert.equal(result.settled, true, 'request settled without an extra attempt or real timer');
  if (result.error) throw result.error;
  return result.value;
}
after(() => assert.equal(fs.readFileSync(FILE, 'utf8'), SOURCE, 'the tested course-data source stayed frozen'));

test('the exact document bytes, SHA input, status, headers and caller options survive the helper', async () => {
  const bytes = Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(' {\n "study": "你好。 café e\u0301", "n": 1\n}\n')]);
  const f = fixture(() => response({body: bytes, headers: {'content-type': 'application/json', etag: '"whole-source"'}}));
  const options = {cache: 'no-cache', credentials: 'omit', headers: {'x-fixture': 'source-only'}};
  const result = f.watch(f.api.fetch(DOCUMENT, options)); await flush();
  const actual = completed(result), received = Buffer.from(await actual.arrayBuffer());
  assert.deepEqual(received, bytes); assert.equal(digest(received), digest(bytes));
  assert.equal(actual.status, 200); assert.equal(actual.statusText, 'Fixture 200');
  assert.equal(actual.headers.get('etag'), '"whole-source"');
  assert.equal(actual.headers.get('content-type'), 'application/json');
  assert.equal(f.calls.length, 1); assert.equal(f.calls[0].url, DOCUMENT);
  assert.equal(f.calls[0].options.cache, options.cache); assert.equal(f.calls[0].options.credentials, options.credentials);
  assert.equal(f.calls[0].options.headers, options.headers); assert.equal(f.calls[0].options.body, undefined);
  assert.equal(f.context.fetch, f.nativeFetch, 'the global fetch is never replaced');
  assert.equal(f.timers.size, 0); assert.equal(f.api.state(), null);
});

test('each transient HTTP status receives exactly one retry before the current document succeeds', async () => {
  for (const status of [408, 425, 429, 500, 502, 503, 504]) {
    const f = fixture((call, attempt) => response({status: attempt === 1 ? status : 200}));
    const result = f.watch(f.api.fetch(DOCUMENT)); await flush();
    assert.equal(result.settled, false); assert.equal(f.calls.length, 1); assert.equal(f.api.state().status, status);
    await f.fire(300);
    assert.equal(completed(result).status, 200); assert.equal(f.calls.length, 2);
    assert.equal(f.api.state(), null); assert.equal(f.timers.size, 0);
  }
});

test('a continuing transient HTTP failure stops after two requests and returns its real final response', async () => {
  const f = fixture((call, attempt) => response({status: 503, body: '{"attempt":' + attempt + '}'}));
  const result = f.watch(f.api.fetch(DOCUMENT)); await flush(); await f.fire(300);
  const actual = completed(result);
  assert.equal(f.calls.length, 2); assert.equal(actual.ok, false); assert.equal(actual.status, 503);
  assert.deepEqual(await actual.json(), {attempt: 2});
  assert.equal(f.api.state().retrying, false); assert.equal(f.timers.size, 0);
});

test('a 404 with a non-JSON error body is returned once without retry or fabricated course data', async () => {
  const f = fixture(() => response({status: 404, body: '<h1>Missing document</h1>', headers: {'content-type': 'text/html'}}));
  const result = f.watch(f.api.fetch(DOCUMENT)); await flush();
  const actual = completed(result);
  assert.equal(f.calls.length, 1); assert.equal(actual.status, 404);
  assert.equal(await actual.text(), '<h1>Missing document</h1>');
  assert.equal(f.timers.size, 0); assert.equal(f.api.state().retrying, false);
});

test('truncated JSON, a broken body stream and a raw network rejection retry once then recover', async () => {
  for (const failure of ['truncated-json', 'broken-body', 'network']) {
    const f = fixture((call, attempt) => {
      if (attempt === 2) return response({body: '{"source":"second-complete-document"}'});
      if (failure === 'truncated-json') return response({body: '{"source":'});
      if (failure === 'broken-body') return response({failure: new TypeError('Fixture body download interrupted')});
      throw new TypeError('Fixture network disconnected');
    });
    const result = f.watch(f.api.fetch(DOCUMENT)); await flush(); await f.fire(300);
    assert.deepEqual(await completed(result).json(), {source: 'second-complete-document'});
    assert.equal(f.calls.length, 2); assert.equal(f.timers.size, 0);
  }
});

test('permanent network failure is rethrown after two attempts with no cached or fallback document', async () => {
  const lastError = new TypeError('Fixture still offline');
  const f = fixture((call, attempt) => {
    if (attempt === 1) return response({body: '{"source":"earlier-success"}'});
    throw lastError;
  });
  const first = f.watch(f.api.fetch(DOCUMENT)); await flush();
  assert.deepEqual(await completed(first).json(), {source: 'earlier-success'});
  const second = f.watch(f.api.fetch(DOCUMENT)); await flush(); await f.fire(300);
  assert.equal(second.settled, true); assert.equal(second.error, lastError);
  assert.equal(second.value, undefined); assert.equal(f.calls.length, 3); assert.equal(f.timers.size, 0);
});

test('two truncated JSON downloads reject instead of exposing partial or replacement data', async () => {
  const f = fixture(() => response({body: '{"partial":'}));
  const result = f.watch(f.api.fetch(DOCUMENT)); await flush(); await f.fire(300);
  assert.equal(result.settled, true); assert.equal(result.error?.name, 'SyntaxError');
  assert.equal(result.value, undefined); assert.equal(f.calls.length, 2);
  assert.equal(f.api.state().kind, 'invalid-json'); assert.equal(f.api.state().retrying, false);
  assert.equal(f.timers.size, 0);
});

test('each attempt has a 12-second timeout and an exhausted timeout becomes TimeoutError', async () => {
  const f = fixture(pendingUntilAbort);
  const result = f.watch(f.api.fetch(DOCUMENT)); await flush();
  assert.equal(f.calls.length, 1); assert.equal(f.calls[0].options.signal.aborted, false);
  await f.fire(12000); assert.equal(f.calls[0].options.signal.aborted, true);
  assert.equal(f.calls.length, 1); assert.equal(result.settled, false);
  await f.fire(300); assert.equal(f.calls.length, 2);
  await f.fire(12000);
  assert.equal(result.settled, true); assert.equal(result.error?.name, 'TimeoutError');
  assert.equal(result.value, undefined); assert.equal(f.api.state().kind, 'timeout');
  assert.equal(f.api.state().retrying, false); assert.equal(f.timers.size, 0);
});

test('API, POST, external and non-content requests pass through once with their original options', async () => {
  for (const [url, options] of [
    ['/.netlify/functions/check-status?device_id=fixture', {method: 'GET'}],
    ['/.netlify/functions/login', {method: 'POST', body: '{"email":"fixture@example.test"}'}],
    ['/.netlify/functions/create-payment-link', {method: 'POST', body: '{"plan":"fixture"}'}],
    ['https://fixture.example/content/a.json', {method: 'GET'}],
    ['/content/a.json', {method: 'GET'}],
    ['assets/a.json', {method: 'GET'}],
    ['content/a.txt', {method: 'GET'}],
    ['content/a.json?fixture=1', {method: 'GET'}],
    ['content/a.json', {method: 'HEAD'}],
    ['content/a.json', {method: 'POST', body: '{"fixture":true}'}],
    ['content/a.json', {method: 'GET', body: 'not-an-intercepted-request'}]
  ]) {
    const original = response({status: 503}), f = fixture(() => original);
    const result = f.watch(f.api.fetch(url, options)); await flush();
    assert.equal(completed(result), original); assert.equal(f.calls.length, 1);
    assert.equal(f.calls[0].url, url); assert.equal(f.calls[0].options, options);
    assert.equal(f.timers.size, 0); assert.equal(f.context.fetch, f.nativeFetch);
  }
});

test('caller abort propagates before a request, during fetch and during backoff without a retry', async () => {
  {
    const controller = new AbortController(); controller.abort();
    const f = fixture(() => response()), result = f.watch(f.api.fetch(DOCUMENT, {signal: controller.signal}));
    await flush(); assert.equal(result.error?.name, 'AbortError'); assert.equal(f.calls.length, 0); assert.equal(f.timers.size, 0);
  }
  {
    const controller = new AbortController(), f = fixture(pendingUntilAbort);
    const result = f.watch(f.api.fetch(DOCUMENT, {signal: controller.signal})); await flush();
    assert.notEqual(f.calls[0].options.signal, controller.signal); controller.abort(); await flush();
    assert.equal(result.error?.name, 'AbortError'); assert.equal(f.calls[0].options.signal.aborted, true);
    assert.equal(f.calls.length, 1); assert.equal(f.timers.size, 0);
  }
  {
    const controller = new AbortController(), f = fixture(() => response({status: 503}));
    const result = f.watch(f.api.fetch(DOCUMENT, {signal: controller.signal})); await flush();
    assert.equal(f.calls.length, 1); assert.ok([...f.timers.values()].some(timer => timer.delay === 300));
    controller.abort(); await flush();
    assert.equal(result.error?.name, 'AbortError'); assert.equal(f.calls.length, 1); assert.equal(f.timers.size, 0);
  }
});
