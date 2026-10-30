import {createChirpCatalogue, legacyChirpCatalogue, previousChirpCatalogue, CHIRP_LOCALES,
  APPROVED_SELECTION_VERSION, PREVIOUS_SELECTION_VERSION, LEGACY_SELECTION_VERSION} from './lib/chirp-catalog.mjs';

const VOICES = Object.freeze({
  'fr-FR-Wavenet-F': { languageCode: 'fr-FR', gender: 'FEMALE' },
  'fr-FR-Wavenet-G': { languageCode: 'fr-FR', gender: 'MALE' },
  'en-GB-Wavenet-C': { languageCode: 'en-GB', gender: 'FEMALE' },
  'en-GB-Wavenet-D': { languageCode: 'en-GB', gender: 'MALE' },
  'en-US-Wavenet-C': { languageCode: 'en-US', gender: 'FEMALE' },
  'en-US-Wavenet-D': { languageCode: 'en-US', gender: 'MALE' },
  'es-ES-Wavenet-F': { languageCode: 'es-ES', gender: 'FEMALE' },
  'es-ES-Wavenet-E': { languageCode: 'es-ES', gender: 'MALE' },
  'cmn-CN-Wavenet-A': { languageCode: 'cmn-CN', gender: 'FEMALE' },
  'cmn-CN-Wavenet-B': { languageCode: 'cmn-CN', gender: 'MALE' },
  'it-IT-Wavenet-E': { languageCode: 'it-IT', gender: 'FEMALE' },
  'it-IT-Wavenet-F': { languageCode: 'it-IT', gender: 'MALE' },
  'ja-JP-Wavenet-B': { languageCode: 'ja-JP', gender: 'FEMALE' },
  'ja-JP-Wavenet-C': { languageCode: 'ja-JP', gender: 'MALE' },
  'ko-KR-Wavenet-A': { languageCode: 'ko-KR', gender: 'FEMALE' },
  'ko-KR-Wavenet-C': { languageCode: 'ko-KR', gender: 'MALE' },
  'hi-IN-Wavenet-C': { languageCode:'hi-IN', gender:'FEMALE' },
  'hi-IN-Wavenet-B': { languageCode:'hi-IN', gender:'MALE' },
  'ru-RU-Wavenet-A': { languageCode:'ru-RU', gender:'FEMALE' },
  'ru-RU-Wavenet-B': { languageCode:'ru-RU', gender:'MALE' },
  'ar-XA-Wavenet-A': { languageCode: 'ar-XA', gender: 'FEMALE' },
  'ar-XA-Wavenet-B': { languageCode: 'ar-XA', gender: 'MALE' },
  'de-DE-Wavenet-A': { languageCode: 'de-DE', gender: 'FEMALE' },
  'de-DE-Wavenet-B': { languageCode: 'de-DE', gender: 'MALE' }
});

const ALLOWED_ORIGINS = new Set([
  'https://melunga.com',
  'https://www.melunga.com',
  'https://melunga.app',
  'https://www.melunga.app',
  'https://localhost',
  'http://localhost',
  'capacitor://localhost'
]);

const corsHeaders = (event) => {
  const headers = event.headers || {};
  const origin = headers.origin || headers.Origin || '';
  return {
    ...(ALLOWED_ORIGINS.has(origin) ? { 'access-control-allow-origin': origin } : {}),
    'access-control-allow-methods': 'GET, OPTIONS',
    'access-control-allow-headers': 'Authorization, Content-Type',
    'access-control-max-age': '86400',
    'vary': 'Origin'
  };
};

const json = (event, statusCode, payload) => ({
  statusCode,
  headers: {
    ...corsHeaders(event),
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff'
  },
  body: JSON.stringify(payload)
});

export function createHandler({fetchImpl=(...args) => fetch(...args), now=() => Date.now(), apiKey=() => process.env.GOOGLE_TTS_API_KEY} = {}) {
  const catalogue = createChirpCatalogue({fetchImpl, now});
  return async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders(event),
      body: ''
    };
  }

  if (event.httpMethod !== 'GET') {
    return json(event, 405, { error: 'method_not_allowed' });
  }

  const key = apiKey();
  if (!key) {
    return json(event, 503, { error: 'tts_not_configured' });
  }

  const params = event.queryStringParameters || {};
  if (Object.hasOwn(params, 'catalog')) {
    if (params.catalog !== 'chirp3' || Object.keys(params).some(name => !['catalog','selectionVersion'].includes(name))
        || Object.hasOwn(params,'selectionVersion')
          && ![APPROVED_SELECTION_VERSION, PREVIOUS_SELECTION_VERSION, LEGACY_SELECTION_VERSION].includes(params.selectionVersion)) {
      return json(event, 400, { error:'invalid_catalogue' });
    }
    try {
      const complete = await catalogue.get(key);
      const current = params.selectionVersion === APPROVED_SELECTION_VERSION ? complete
        : params.selectionVersion === PREVIOUS_SELECTION_VERSION ? previousChirpCatalogue(complete) : legacyChirpCatalogue(complete);
      const maxAge = Math.max(0, Math.min(300, Math.floor((Date.parse(current.expiresAt) - now()) / 1000)));
      const result = json(event, 200, current);
      result.headers['cache-control'] = 'public, max-age=' + maxAge;
      result.headers['netlify-cdn-cache-control'] = 'public, max-age=' + maxAge;
      return result;
    } catch {
      return json(event, 502, { error:'voice_catalogue_unavailable' });
    }
  }
  const text = String(params.text || '').trim();
  const voiceName = String(params.voice || '');
  const requestedLanguage = String(params.lang || '');
  let selected = VOICES[voiceName], isChirp = false;

  if (!text || text.length > 500) {
    return json(event, 400, { error: 'invalid_text' });
  }
  if (!selected) {
    const supported = Object.values(CHIRP_LOCALES).some(definition => definition.languageCodes.some(code =>
      requestedLanguage === code && voiceName.startsWith(code + '-Chirp3-HD-')));
    if (!supported || !/^[a-z]{2,3}-[A-Z]{2}-Chirp3-HD-[A-Za-z][A-Za-z0-9]*$/.test(voiceName)) {
      return json(event, 400, { error:'invalid_voice' });
    }
    try {
      const current = await catalogue.get(key);
      const actual = [...Object.values(current.languages), ...Object.values(previousChirpCatalogue(current).languages)].flatMap(language => language.chirp)
        .find(voice => voice.name === voiceName && voice.languageCode === requestedLanguage);
      if (actual) {selected = {languageCode:actual.languageCode, gender:actual.gender}; isChirp = true;}
    } catch {
      return json(event, 502, { error:'voice_catalogue_unavailable' });
    }
  }
  if (!selected || selected.languageCode !== requestedLanguage) {
    return json(event, 400, { error: 'invalid_voice' });
  }

  const parsedRate = Number(params.rate);
  const speakingRate = Number.isFinite(parsedRate)
    ? Math.min(1.2, Math.max(0.65, parsedRate))
    : 1;

  try {
    const response = await fetchImpl(
      'https://texttospeech.googleapis.com/v1/text:synthesize',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-goog-api-key': key
        },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: selected.languageCode,
            name: voiceName,
            ...(isChirp ? {} : {ssmlGender: selected.gender})
          },
          audioConfig: {
            audioEncoding: 'MP3',
            ...(isChirp ? {} : {speakingRate, pitch:0})
          }
        })
      }
    );

    if (!response.ok) {
      return json(event, 502, { error: 'tts_provider_error' });
    }

    const payload = await response.json();
    if (!payload.audioContent) {
      return json(event, 502, { error: 'empty_audio' });
    }

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders(event),
        'content-type': 'audio/mpeg',
        'cache-control': 'public, max-age=31536000, immutable',
        'netlify-cdn-cache-control': 'public, durable, max-age=31536000, stale-while-revalidate=86400',
        'x-content-type-options': 'nosniff',
        ...(isChirp ? {'x-melunga-applied-rate':'1', 'access-control-expose-headers':'x-melunga-applied-rate'} : {})
      },
      isBase64Encoded: true,
      body: payload.audioContent
    };
  } catch {
    return json(event, 502, { error: 'tts_unavailable' });
  }
  };
}

export const handler = createHandler();
