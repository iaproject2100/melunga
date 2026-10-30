/* Arabic WaveNet contract checks use fake credentials and provider responses.
 * No network request, real audio, app state or account operation is used. */
'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const {test, before, after} = require('node:test');

const SYNTH_URL = 'https://texttospeech.googleapis.com/v1/text:synthesize';
const KEY = 'fake-arabic-test-key-not-a-credential';
const AUDIO = Buffer.from('fixture-mp3-not-played').toString('base64');
const VOICES = [['ar-XA-Wavenet-A','FEMALE'],['ar-XA-Wavenet-B','MALE']];
let createHandler, previousKey, realFetch;
before(async () => {
  previousKey = process.env.GOOGLE_TTS_API_KEY;
  process.env.GOOGLE_TTS_API_KEY = KEY;
  realFetch = global.fetch;
  global.fetch = async () => {throw new Error('Unstubbed network is forbidden in this test');};
  ({createHandler} = await import(pathToFileURL(path.join(__dirname,'../netlify/functions/tts.mjs'))));
});
after(() => {
  global.fetch = realFetch;
  if (previousKey === undefined) delete process.env.GOOGLE_TTS_API_KEY;
  else process.env.GOOGLE_TTS_API_KEY = previousKey;
});
const event = (params={}, origin='https://melunga.com', method='GET') => ({
  httpMethod:method, headers:{origin}, queryStringParameters:params
});
const params = (voice='ar-XA-Wavenet-A', extra={}) => ({
  voice, lang:'ar-XA', text:'  مَرْحَبًا بِكَ! كيف حالك؟  ', rate:'0.85', ...extra
});
const reply = (body, status=200) => new Response(JSON.stringify(body), {
  status, headers:{'content-type':'application/json'}
});
function fixture(synthResponse) {
  const calls = [];
  const handler = createHandler({fetchImpl:async (url, options) => {
    assert.equal(url, SYNTH_URL, 'Arabic WaveNet calls synthesis directly without listing voices');
    assert.equal(new URL(url).search, '', 'credentials never enter the provider URL');
    const call = {url, options, body:JSON.parse(options.body)};
    calls.push(call);
    return synthResponse ? synthResponse(call) : reply({audioContent:AUDIO});
  }});
  return {handler,calls};
}
function audioResult(result) {
  assert.equal(result.statusCode, 200);
  assert.equal(result.body, AUDIO);
  assert.equal(result.isBase64Encoded, true);
  assert.equal(result.headers['content-type'], 'audio/mpeg');
  assert.equal(result.headers['cache-control'], 'public, max-age=31536000, immutable');
  assert.equal(result.headers['netlify-cdn-cache-control'], 'public, durable, max-age=31536000, stale-while-revalidate=86400');
  assert.equal(result.headers['x-content-type-options'], 'nosniff');
  assert.equal(result.headers['x-melunga-applied-rate'], undefined);
  assert.ok(!JSON.stringify(result).includes(KEY), 'credentials do not enter the public response');
}
function errorResult(result, status, error) {
  assert.equal(result.statusCode, status);
  assert.equal(result.headers['cache-control'], 'no-store');
  assert.deepEqual(JSON.parse(result.body), {error});
}

test('both precise Arabic WaveNet voices forward Arabic text, locale, gender and MP3 fields', async () => {
  const f = fixture();
  for (const [voice,gender] of VOICES) {
    const request = event(params(voice));
    const beforeRequest = structuredClone(request);
    const result = await f.handler(request);
    audioResult(result);
    assert.deepEqual(request, beforeRequest, 'synthesis leaves request data unchanged');
    assert.deepEqual(f.calls.at(-1).body, {
      input:{text:'مَرْحَبًا بِكَ! كيف حالك؟'},
      voice:{languageCode:'ar-XA',name:voice,ssmlGender:gender},
      audioConfig:{audioEncoding:'MP3',speakingRate:0.85,pitch:0}
    });
    assert.equal(f.calls.at(-1).options.method, 'POST');
    assert.deepEqual(f.calls.at(-1).options.headers, {
      'content-type':'application/json', 'x-goog-api-key':KEY
    });
    assert.equal(result.headers['access-control-allow-origin'], 'https://melunga.com');
    assert.equal(result.headers.vary, 'Origin');
  }
  assert.equal(f.calls.length, 2);
});

test('Arabic keeps the existing WaveNet rate defaults, bounds and fixed pitch', async () => {
  const f = fixture();
  for (const [rate,expected] of [[undefined,1],['invalid',1],['0.75',0.75],['1',1],['0',0.65],['2',1.2],['',0.65]]) {
    audioResult(await f.handler(event(params('ar-XA-Wavenet-B', {rate,pitch:'999'}))));
    assert.deepEqual(f.calls.at(-1).body.audioConfig, {audioEncoding:'MP3',speakingRate:expected,pitch:0});
  }
});

test('Arabic accepts only A/B with ar-XA and does not extend Chirp locales', async () => {
  const f = fixture();
  for (const [voice,lang] of [
    ['ar-XA-Wavenet-A','ar'], ['ar-XA-Wavenet-B','ar-SA'],
    ['ar-XA-Wavenet-A','fr-FR'], ['fr-FR-Wavenet-F','ar-XA'],
    ['ar-XA-Wavenet-C','ar-XA'], ['ar-XA-Standard-A','ar-XA'],
    ['ar-XA-Chirp3-HD-Kore','ar-XA'], ['ar-XA-Wavenet-A?key=bad','ar-XA'],
    ['https://attacker.invalid/relay','ar-XA'], ['__proto__','ar-XA']
  ]) errorResult(await f.handler(event(params(voice,{lang}))), 400, 'invalid_voice');
  assert.equal(f.calls.length, 0);
});

test('Arabic input limits, method handling and CORS retain their existing behavior', async () => {
  const f = fixture();
  for (const text of ['', '   ', 'ع'.repeat(501)]) {
    errorResult(await f.handler(event(params('ar-XA-Wavenet-A',{text}))), 400, 'invalid_text');
  }
  errorResult(await f.handler(event(params(), 'https://melunga.com', 'POST')), 405, 'method_not_allowed');
  const preflight = await f.handler(event({}, 'capacitor://localhost', 'OPTIONS'));
  assert.equal(preflight.statusCode, 204);
  assert.equal(preflight.headers['access-control-allow-origin'], 'capacitor://localhost');
  assert.equal(f.calls.length, 0);
  const untrusted = await f.handler(event(params(), 'https://attacker.invalid'));
  audioResult(untrusted);
  assert.equal(untrusted.headers['access-control-allow-origin'], undefined);
  assert.equal(untrusted.headers.vary, 'Origin');
  audioResult(await f.handler(event(params('ar-XA-Wavenet-A',{text:'ع'.repeat(500)}))));
  assert.equal(f.calls.at(-1).body.input.text.length, 500);
});

test('the default key comes from GOOGLE_TTS_API_KEY and request parameters cannot supply it', async () => {
  const f = fixture();
  delete process.env.GOOGLE_TTS_API_KEY;
  try {
    errorResult(await f.handler(event(params('ar-XA-Wavenet-A',{key:KEY,apiKey:KEY}))), 503, 'tts_not_configured');
    assert.equal(f.calls.length, 0);
  } finally {
    process.env.GOOGLE_TTS_API_KEY = KEY;
  }
  audioResult(await f.handler(event(params('ar-XA-Wavenet-A',{key:'ignored-request-key'}))));
  assert.equal(f.calls[0].options.headers['x-goog-api-key'], KEY);
});

test('Arabic provider failures stay sanitized, uncached and silent', async () => {
  const originalLog = console.log, originalError = console.error, originalWarn = console.warn, logs = [];
  console.log = console.error = console.warn = (...args) => logs.push(args.map(String).join(' '));
  try {
    for (const [behavior,error] of [
      ['http','tts_provider_error'], ['empty','empty_audio'],
      ['throw','tts_unavailable'], ['invalid-json','tts_unavailable']
    ]) {
      const f = fixture(() => {
        if (behavior === 'http') return reply({error:'private-provider-body ' + KEY}, 403);
        if (behavior === 'empty') return reply({});
        if (behavior === 'throw') throw new Error('private-provider-body ' + KEY);
        return new Response('private-provider-body ' + KEY, {status:200});
      });
      const result = await f.handler(event(params()));
      errorResult(result, 502, error);
      assert.equal(f.calls.length, 1);
      assert.ok(!JSON.stringify(result).includes(KEY));
      assert.ok(!result.body.includes('private-provider-body'));
    }
    assert.deepEqual(logs, [], 'provider errors and credentials are never logged');
  } finally {
    console.log = originalLog; console.error = originalError; console.warn = originalWarn;
  }
});
