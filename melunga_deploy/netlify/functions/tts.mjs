const VOICES = Object.freeze({
  'fr-FR-Wavenet-F': { languageCode: 'fr-FR', gender: 'FEMALE' },
  'fr-FR-Wavenet-G': { languageCode: 'fr-FR', gender: 'MALE' },
  'en-GB-Wavenet-C': { languageCode: 'en-GB', gender: 'FEMALE' },
  'en-GB-Wavenet-D': { languageCode: 'en-GB', gender: 'MALE' },
  'es-ES-Wavenet-F': { languageCode: 'es-ES', gender: 'FEMALE' },
  'es-ES-Wavenet-E': { languageCode: 'es-ES', gender: 'MALE' },
  'cmn-CN-Wavenet-A': { languageCode: 'cmn-CN', gender: 'FEMALE' },
  'cmn-CN-Wavenet-B': { languageCode: 'cmn-CN', gender: 'MALE' },
  'it-IT-Wavenet-E': { languageCode: 'it-IT', gender: 'FEMALE' },
  'it-IT-Wavenet-F': { languageCode: 'it-IT', gender: 'MALE' },
  'ja-JP-Wavenet-B': { languageCode: 'ja-JP', gender: 'FEMALE' },
  'ja-JP-Wavenet-C': { languageCode: 'ja-JP', gender: 'MALE' }
});

const ALLOWED_ORIGINS = new Set([
  'https://melunga.com',
  'https://www.melunga.com',
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

export const handler = async (event) => {
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

  const apiKey = process.env.GOOGLE_TTS_API_KEY;
  if (!apiKey) {
    return json(event, 503, { error: 'tts_not_configured' });
  }

  const params = event.queryStringParameters || {};
  const text = String(params.text || '').trim();
  const voiceName = String(params.voice || '');
  const requestedLanguage = String(params.lang || '');
  const selected = VOICES[voiceName];

  if (!text || text.length > 500) {
    return json(event, 400, { error: 'invalid_text' });
  }
  if (!selected || selected.languageCode !== requestedLanguage) {
    return json(event, 400, { error: 'invalid_voice' });
  }

  const parsedRate = Number(params.rate);
  const speakingRate = Number.isFinite(parsedRate)
    ? Math.min(1.2, Math.max(0.65, parsedRate))
    : 1;

  try {
    const response = await fetch(
      'https://texttospeech.googleapis.com/v1/text:synthesize',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: selected.languageCode,
            name: voiceName,
            ssmlGender: selected.gender
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate,
            pitch: 0
          }
        })
      }
    );

    if (!response.ok) {
      const details = await response.text();
      console.error('Google TTS error', response.status, details.slice(0, 500));
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
        'x-content-type-options': 'nosniff'
      },
      isBase64Encoded: true,
      body: payload.audioContent
    };
  } catch (error) {
    console.error('TTS function failure', error);
    return json(event, 502, { error: 'tts_unavailable' });
  }
};
