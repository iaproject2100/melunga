import assert from 'node:assert/strict';
import test from 'node:test';

// SDK retry delays are one millisecond in its documented test mode. These
// tests exercise the installed package, with every HTTP call intercepted.
process.env.NODE_ENV = 'test';
const { getStore, setEnvironmentContext } = await import('@netlify/blobs');
const { checkedBlobsFetch, getAccessStore } = await import('../netlify/functions/access-store.mjs');
const originalFetch = globalThis.fetch;
const originalContext = globalThis.netlifyBlobsContext;
const originalEnvironmentContext = process.env.NETLIFY_BLOBS_CONTEXT;

const fixtureContext = {
  siteID: 'fixture-site', token: 'fixture-token-not-a-credential',
  edgeURL: 'https://blobs.example.invalid',
  uncachedEdgeURL: 'https://strong-blobs.example.invalid'
};

function intercept(t, responseFactory) {
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    assert.ok(String(url).startsWith('https://strong-blobs.example.invalid/'),
      'all SDK requests remain on the intercepted fixture URL');
    calls.push({ url: String(url), ...options });
    return responseFactory(calls.length, options);
  };
  // The exported factory uses exactly the same environment-injected SDK
  // context as a function, but these credentials and hosts are fictitious.
  setEnvironmentContext(fixtureContext);
  t.after(() => {
    globalThis.fetch = originalFetch;
    if (originalContext === undefined) delete globalThis.netlifyBlobsContext;
    else globalThis.netlifyBlobsContext = originalContext;
    if (originalEnvironmentContext === undefined) delete process.env.NETLIFY_BLOBS_CONTEXT;
    else process.env.NETLIFY_BLOBS_CONTEXT = originalEnvironmentContext;
  });
  return calls;
}

test('real SDK getWithMetadata preserves JSON and exact ETag', async t => {
  const calls = intercept(t, () => new Response(JSON.stringify({ value: 7 }), {
    status: 200, headers: { etag: '"revision-17"', 'content-type': 'application/json' }
  }));
  const result = await getAccessStore().getWithMetadata('fixture-account', { type: 'json' });
  assert.deepEqual(result.data, { value: 7 });
  assert.equal(result.etag, '"revision-17"');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].method, 'get');
});

test('real SDK absent read returns null, rather than an account placeholder', async t => {
  intercept(t, () => new Response(null, { status: 404 }));
  assert.equal(await getAccessStore().getWithMetadata('absent', { type: 'json' }), null);
});

test('real SDK deleting an already missing session is idempotent', async t => {
  const calls = intercept(t, () => new Response(null, { status: 404 }));
  assert.equal(await getAccessStore().delete('session:already-removed'), undefined);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].method, 'delete');
});

test('real SDK onlyIfMatch transmits exact conditional header and JSON', async t => {
  const calls = intercept(t, () => new Response(null, { status: 200, headers: { etag: '"new-revision"' } }));
  const result = await getAccessStore().setJSON('fixture-account', { devices: 30 }, { onlyIfMatch: '"old-revision"' });
  assert.deepEqual(result, { modified: true, etag: '"new-revision"' });
  assert.equal(calls[0].method, 'put');
  assert.equal(calls[0].headers['if-match'], '"old-revision"');
  assert.equal(calls[0].headers['if-none-match'], undefined);
  assert.deepEqual(JSON.parse(calls[0].body), { devices: 30 });
});

test('real SDK onlyIfNew transmits If-None-Match star', async t => {
  const calls = intercept(t, () => new Response(null, { status: 200, headers: { etag: '"created"' } }));
  const result = await getAccessStore().setJSON('new-account', { value: true }, { onlyIfNew: true });
  assert.equal(result.modified, true);
  assert.equal(calls[0].headers['if-none-match'], '*');
  assert.equal(calls[0].headers['if-match'], undefined);
});

for (const condition of [{ onlyIfMatch: '"stale-revision"' }, { onlyIfNew: true }]) {
  test(`real SDK 412 reports conflict without success for ${Object.keys(condition)[0]}`, async t => {
    const calls = intercept(t, () => new Response(null, { status: 412 }));
    assert.deepEqual(await getAccessStore().setJSON('fixture-account', { ignored: true }, condition), { modified: false });
    assert.equal(calls.length, 1);
  });
}

test('real SDK read 500 is rejected after bounded retries and never means absence', async t => {
  const calls = intercept(t, () => new Response('provider failure', { status: 500 }));
  await assert.rejects(getAccessStore().getWithMetadata('fixture-account', { type: 'json' }), /blobs_request_failed/);
  assert.equal(calls.length, 6);
});

test('raw SDK 10 conditional-write 500 quirk is reproduced; checked factory fails closed', async t => {
  const calls = intercept(t, () => new Response('provider failure', { status: 500 }));
  const raw = getStore({ ...fixtureContext, name: 'melunga-access', consistency: 'strong', fetch: globalThis.fetch });
  const misleading = await raw.setJSON('fixture-account', { ignored: true }, { onlyIfMatch: '"old"' });
  assert.equal(misleading.modified, true,
    'SDK 10.7.13 itself misreports the final 500 as modified: production must use the checked factory');
  assert.equal(calls.length, 6);
  await assert.rejects(getAccessStore().setJSON('fixture-account', { ignored: true }, { onlyIfMatch: '"old"' }), /blobs_request_failed/);
  assert.equal(calls.length, 12);
});

for (const status of [401, 403, 404, 409]) {
  test(`checked conditional write rejects HTTP ${status}, rather than reporting modified`, async t => {
    const calls = intercept(t, () => new Response('opaque provider response', { status }));
    await assert.rejects(getAccessStore().setJSON('fixture-account', { ignored: true }, { onlyIfNew: true }), /blobs_request_failed/);
    assert.equal(calls.length, 6);
  });
}

test('checked fetch permits no accidental read 412 or redirect', async t => {
  const calls = intercept(t, () => new Response(null, { status: 412 }));
  await assert.rejects(checkedBlobsFetch('https://strong-blobs.example.invalid/fixture', { method: 'GET' }), /blobs_request_failed/);
  globalThis.fetch = async () => new Response(null, { status: 302 });
  await assert.rejects(checkedBlobsFetch('https://strong-blobs.example.invalid/fixture', { method: 'PUT' }), /blobs_request_failed/);
  assert.equal(calls.length, 1);
});
