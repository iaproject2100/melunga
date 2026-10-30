/* Only candidates observed in Google's current voices:list may be synthesized.
 * The eight studied languages and three choices per language are deliberately finite. */
export const CHIRP_LOCALES = Object.freeze({
  fr: Object.freeze({languageCodes:Object.freeze(['fr-FR']), waveNet:'fr-FR-Wavenet-F'}),
  en: Object.freeze({languageCodes:Object.freeze(['en-GB']), waveNet:'en-GB-Wavenet-C'}),
  es: Object.freeze({languageCodes:Object.freeze(['es-ES']), waveNet:'es-ES-Wavenet-F'}),
  zh: Object.freeze({languageCodes:Object.freeze(['cmn-CN','zh-CN']), waveNet:'cmn-CN-Wavenet-A'}),
  it: Object.freeze({languageCodes:Object.freeze(['it-IT']), waveNet:'it-IT-Wavenet-E'}),
  ja: Object.freeze({languageCodes:Object.freeze(['ja-JP']), waveNet:'ja-JP-Wavenet-B'}),
  ko: Object.freeze({languageCodes:Object.freeze(['ko-KR']), waveNet:'ko-KR-Wavenet-A'}),
  de: Object.freeze({languageCodes:Object.freeze(['de-DE']), waveNet:'de-DE-Wavenet-A'})
});

export const APPROVED_SELECTION_VERSION = 'kartech-2026-10-30-de';
export const LEGACY_SELECTION_VERSION = 'kartech-2026-10-27';
const LEGACY_LANGUAGES = Object.freeze(['fr', 'en', 'es', 'zh', 'it', 'ja', 'ko']);
const APPROVED_DEFAULTS = Object.freeze({
  fr:Object.freeze({name:'fr-FR-Chirp3-HD-Aoede', gender:'FEMALE'}),
  en:Object.freeze({name:'en-GB-Chirp3-HD-Kore', gender:'FEMALE'}),
  es:Object.freeze({name:'es-ES-Chirp3-HD-Kore', gender:'FEMALE'}),
  zh:Object.freeze({name:'cmn-CN-Chirp3-HD-Kore', gender:'FEMALE'}),
  it:Object.freeze({name:'it-IT-Chirp3-HD-Charon', gender:'MALE'}),
  ja:Object.freeze({name:'ja-JP-Chirp3-HD-Kore', gender:'FEMALE'}),
  ko:Object.freeze({name:'ko-KR-Chirp3-HD-Kore', gender:'FEMALE'}),
  de:Object.freeze({name:'de-DE-Chirp3-HD-Kore', gender:'FEMALE'})
});

const PREFERENCES = Object.freeze([['Aoede','FEMALE'], ['Kore','FEMALE'], ['Charon','MALE']]);
const CATALOGUE_URL = 'https://texttospeech.googleapis.com/v1/voices';
const TIMEOUT_MS = 8000;

function freeze(value) {
  for (const child of Object.values(value)) if (child && typeof child === 'object') freeze(child);
  return Object.freeze(value);
}

// Cached seven-language clients require their exact version and row inventory.
// Both contracts share the same fresh provider observation and unchanged voices.
export function legacyChirpCatalogue(catalogue) {
  return freeze({...catalogue, selectionVersion:LEGACY_SELECTION_VERSION,
    languages:Object.fromEntries(LEGACY_LANGUAGES.map(language => [language, catalogue.languages[language]]))});
}

function candidatesFor(language, definition, voices) {
  const records = new Map(), conflicts = new Set();
  for (const voice of voices) {
    if (!voice || typeof voice.name !== 'string' || !Array.isArray(voice.languageCodes)
        || !['FEMALE','MALE'].includes(voice.ssmlGender)) continue;
    const code = definition.languageCodes.find(locale => voice.name.startsWith(locale + '-Chirp3-HD-')
      && voice.languageCodes.includes(locale));
    if (!code) continue;
    const suffix = voice.name.slice((code + '-Chirp3-HD-').length);
    if (!/^[A-Za-z][A-Za-z0-9]*$/.test(suffix)) continue;
    const record = {name:voice.name, languageCode:code, gender:voice.ssmlGender, engine:'chirp3', rateMode:'client'};
    const previous = records.get(record.name);
    if (previous && (previous.gender !== record.gender || previous.languageCode !== record.languageCode)) conflicts.add(record.name);
    else records.set(record.name, record);
  }
  const rank = voice => {
    const index = PREFERENCES.findIndex(([name,gender]) => voice.name.endsWith('-' + name) && voice.gender === gender);
    return index < 0 ? PREFERENCES.length : index;
  };
  const actual = [...records.values()].filter(voice => !conflicts.has(voice.name))
    .sort((a,b) => rank(a) - rank(b) || a.name.localeCompare(b.name, 'en'));
  const approved = APPROVED_DEFAULTS[language];
  const defaultVoice = actual.find(voice => voice.name === approved.name && voice.gender === approved.gender) || null;
  const defaultReason = defaultVoice ? null : conflicts.has(approved.name) ? 'approved_voice_conflict'
    : records.has(approved.name) ? 'approved_voice_gender_mismatch' : 'approved_voice_unavailable';
  const selected = actual.slice(0,3);
  if (defaultVoice && !selected.includes(defaultVoice)) selected[selected.length - 1] = defaultVoice;
  if (selected.length === 3 && new Set(selected.map(voice => voice.gender)).size === 1) {
    const opposite = actual.find(voice => voice.gender !== selected[0].gender);
    const replace = selected.findLastIndex(voice => voice !== defaultVoice);
    if (opposite && replace >= 0) selected[replace] = opposite;
  }
  selected.sort((a,b) => rank(a) - rank(b) || a.name.localeCompare(b.name, 'en'));
  const available = selected.length === 3 && new Set(selected.map(voice => voice.gender)).size === 2;
  const waveNetLanguage = definition.waveNet.split('-Wavenet-')[0];
  return {
    language, available,
    waveNet:{name:definition.waveNet, languageCode:waveNetLanguage, gender:'FEMALE', engine:'wavenet', rateMode:'server'},
    chirp:available ? selected : defaultVoice ? [defaultVoice] : [],
    defaultVoice, defaultReason,
    ...(available ? {} : {reason:'insufficient_voices'})
  };
}

export function createChirpCatalogue({fetchImpl=(...args) => fetch(...args), now=() => Date.now(), ttlMs=300000} = {}) {
  let cache = null, pending = null;
  async function load(apiKey) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetchImpl(CATALOGUE_URL, {
        method:'GET', headers:{'x-goog-api-key':apiKey}, signal:controller.signal
      });
      if (!response.ok) throw new Error('voice_catalogue_provider_error');
      const payload = await response.json();
      if (!payload || !Array.isArray(payload.voices)) throw new Error('invalid_voice_catalogue');
      const verifiedAt = now();
      return freeze({version:1, source:'google-voices-list', verifiedAt:new Date(verifiedAt).toISOString(),
        expiresAt:new Date(verifiedAt + ttlMs).toISOString(), previewOnly:true,
        selectionVersion:APPROVED_SELECTION_VERSION,
        languages:Object.fromEntries(Object.entries(CHIRP_LOCALES).map(([language,definition]) =>
          [language, candidatesFor(language, definition, payload.voices)]))});
    } finally {
      clearTimeout(timeout);
    }
  }
  return Object.freeze({
    async get(apiKey) {
      if (cache && cache.key === apiKey && now() < Date.parse(cache.catalogue.expiresAt)) return cache.catalogue;
      if (pending && pending.key === apiKey) return pending.promise;
      const request = {key:apiKey, promise:null};
      pending = request;
      request.promise = load(apiKey).then(catalogue => {
        if (pending === request) cache = {key:apiKey, catalogue};
        return catalogue;
      }).finally(() => {if (pending === request) pending = null;});
      return request.promise;
    }
  });
}
