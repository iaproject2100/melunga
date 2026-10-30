/* Approved defaults are verified by the live server catalogue. Explicit
 * personal choices stay on this device and take priority over those defaults. */
(() => {
  'use strict';
  const CATALOGUE_LANGUAGES = Object.freeze(['fr', 'en', 'es', 'zh', 'it', 'ja', 'ko', 'de']);
  const LANGUAGES = Object.freeze([...CATALOGUE_LANGUAGES,'hi','ru']);
  const configured = Object.freeze(Object.assign(Object.create(null),Object.fromEntries([['hi','hi-IN','C','B'],['ru','ru-RU','A','B']].map(([language,locale,female,male])=>[language,Object.freeze([[female,'FEMALE'],[male,'MALE']].map(([suffix,gender])=>Object.freeze({name:locale+'-Wavenet-'+suffix,languageCode:locale,gender,engine:'wavenet',rateMode:'server'})))]))));
  const STORAGE_KEY = 'melunga-preview-voice-selection-v1';
  const SELECTION_VERSION = 'kartech-2026-10-30-en-us';
  const APPROVED_DEFAULTS = Object.freeze({
    fr: Object.freeze({name:'fr-FR-Chirp3-HD-Aoede',gender:'FEMALE'}),
    en: Object.freeze({name:'en-US-Chirp3-HD-Kore',gender:'FEMALE'}),
    es: Object.freeze({name:'es-ES-Chirp3-HD-Kore',gender:'FEMALE'}),
    zh: Object.freeze({name:'cmn-CN-Chirp3-HD-Kore',gender:'FEMALE'}),
    it: Object.freeze({name:'it-IT-Chirp3-HD-Charon',gender:'MALE'}),
    ja: Object.freeze({name:'ja-JP-Chirp3-HD-Kore',gender:'FEMALE'}),
    ko: Object.freeze({name:'ko-KR-Chirp3-HD-Kore',gender:'FEMALE'}),
    de: Object.freeze({name:'de-DE-Chirp3-HD-Kore',gender:'FEMALE'})
  });
  const listeners = new Set();
  let catalogue = null, pending = null, status = 'idle', error = null;
  let selected = Object.create(null);

  function defaultEndpointBase() {
    let native = false;
    try { native = !!window.Capacitor?.isNativePlatform?.(); } catch (_) {}
    const location = window.location;
    return native || ['file:', 'capacitor:'].includes(location?.protocol)
      || location?.protocol === 'https:' && location.hostname === 'localhost' ? 'https://melunga.com' : '';
  }
  let endpointBase = defaultEndpointBase();
  function readSelection(raw) {
    const result = Object.create(null);
    try {
      const data = JSON.parse(raw);
      if (data?.version !== 1 || !data.choices || typeof data.choices !== 'object') return result;
      for (const language of LANGUAGES) if (Object.hasOwn(data.choices, language)
        && typeof data.choices[language] === 'string') result[language] = data.choices[language];
    } catch (_) {}
    return result;
  }
  try { selected = readSelection(window.localStorage?.getItem(STORAGE_KEY)); } catch (_) {}
  function notify(reason = 'catalogue') {
    for (const listener of listeners) { try { listener(state(), reason); } catch (_) {} }
  }
  function matchesLanguage(languageCode, language) {
    const tag = String(languageCode || '').toLowerCase().replace(/_/g, '-');
    const base = tag.split('-')[0];
    if (language === 'en') return tag === 'en-us' || tag.startsWith('en-us-');
    return language === 'zh' ? ['zh', 'cmn'].includes(base)
      && !/(?:^|-)(?:hk|mo)(?:-|$)/.test(tag) : base === language;
  }
  function validateVoice(candidate, language, engine) {
    if (!candidate || typeof candidate.name !== 'string'
      || !/^[A-Za-z0-9-]{1,160}$/.test(candidate.name)
      || typeof candidate.languageCode !== 'string' || !/^[a-z]{2,3}-[A-Z]{2}$/.test(candidate.languageCode)
      || !candidate.name.startsWith(candidate.languageCode + '-')
      || !matchesLanguage(candidate.languageCode, language)
      || !matchesLanguage(candidate.name, language)
      || !['FEMALE', 'MALE'].includes(candidate.gender)
      || candidate.engine !== engine
      || candidate.rateMode !== (engine === 'chirp3' ? 'client' : 'server')
      || !candidate.name.includes(engine === 'chirp3' ? '-Chirp3-HD-' : '-Wavenet-')) {
      throw new Error('Invalid voice catalogue candidate');
    }
    return Object.freeze({name: candidate.name, languageCode: candidate.languageCode,
      gender: candidate.gender, engine, rateMode: candidate.rateMode});
  }
  function validateCatalogue(data) {
    if (data?.version !== 1 || data.previewOnly !== true || data.source !== 'google-voices-list'
      || data.selectionVersion !== SELECTION_VERSION
      || !data.languages || typeof data.languages !== 'object'
      || !Number.isFinite(Date.parse(data.verifiedAt)) || !Number.isFinite(Date.parse(data.expiresAt))
      || Date.parse(data.expiresAt) <= Date.now() || Date.parse(data.verifiedAt) > Date.parse(data.expiresAt)
      || Object.keys(data.languages).length !== CATALOGUE_LANGUAGES.length) throw new Error('Invalid voice catalogue');
    const languages = Object.create(null), names = new Set();
    for (const language of CATALOGUE_LANGUAGES) {
      const row = data.languages[language];
      if (!row || row.language !== language || typeof row.available !== 'boolean' || !Array.isArray(row.chirp)) {
        throw new Error('Invalid voice catalogue language');
      }
      const waveNet = validateVoice(row.waveNet, language, 'wavenet');
      const chirp = row.chirp.map(candidate => validateVoice(candidate, language, 'chirp3'));
      if (row.available ? chirp.length !== 3 || new Set(chirp.map(v => v.gender)).size !== 2 : chirp.length > 1) {
        throw new Error('Invalid voice catalogue availability');
      }
      for (const candidate of [waveNet, ...chirp]) {
        if (names.has(candidate.name)) throw new Error('Duplicate voice catalogue candidate');
        names.add(candidate.name);
      }
      let defaultVoice = null;
      if (row.defaultVoice !== undefined && row.defaultVoice !== null) {
        const approved = APPROVED_DEFAULTS[language];
        const candidate = validateVoice(row.defaultVoice, language, 'chirp3');
        defaultVoice = chirp.find(voice => ['name','languageCode','gender','engine','rateMode']
          .every(field => voice[field] === candidate[field]));
        if (!defaultVoice || candidate.name !== approved.name || candidate.gender !== approved.gender) {
          throw new Error('Invalid approved default voice');
        }
      }
      if (!row.available && chirp.length === 1 && defaultVoice !== chirp[0]) {
        throw new Error('Incomplete comparison may only retain its approved default');
      }
      languages[language] = Object.freeze({language, available: row.available, waveNet,
        chirp: Object.freeze(chirp), defaultVoice,
        ...(typeof row.reason === 'string' ? {reason: row.reason} : {}),
        ...(typeof row.defaultReason === 'string' ? {defaultReason: row.defaultReason} : {})});
    }
    return Object.freeze({version: 1, previewOnly: true, source: data.source, selectionVersion: SELECTION_VERSION,
      verifiedAt: data.verifiedAt, expiresAt: data.expiresAt, languages: Object.freeze(languages)});
  }
  const fresh = () => catalogue && Date.parse(catalogue.expiresAt) > Date.now();
  function state() { return Object.freeze({status: fresh() ? status : status === 'ready' ? 'expired' : status, error, endpointBase}); }
  function preload(options = {}) {
    if (options.endpointBase !== undefined && options.endpointBase !== endpointBase) {
      if (pending || catalogue) return Promise.reject(new Error('Voice endpoint already initialized'));
      const base = String(options.endpointBase).replace(/\/$/, '');
      if (base !== '' && base !== 'https://melunga.com') return Promise.reject(new Error('Unsupported voice endpoint'));
      endpointBase = base;
    }
    if (fresh()) return Promise.resolve(catalogue);
    if (pending) return pending;
    status = 'loading'; error = null;
    pending = Promise.resolve().then(() => {
      if (typeof window.fetch !== 'function') throw new Error('Voice catalogue unavailable');
      return window.fetch(endpointBase + '/.netlify/functions/tts?catalog=chirp3&selectionVersion=' + encodeURIComponent(SELECTION_VERSION),
        {method: 'GET', credentials: endpointBase ? 'omit' : 'same-origin', cache: 'no-store'});
    }).then(response => {
      if (!response?.ok) throw new Error('Voice catalogue unavailable');
      return response.json();
    }).then(data => {
      catalogue = validateCatalogue(data); status = 'ready'; error = null; notify(); return catalogue;
    }).catch(cause => {
      catalogue = null; status = 'error'; error = 'Voice catalogue unavailable'; notify(); throw cause;
    }).finally(() => { pending = null; });
    // Publish the in-flight promise before subscribers can call ready() again.
    notify();
    return pending;
  }
  function getChoices(language) {
    if (configured[language]) return configured[language];
    if (!LANGUAGES.includes(language) || !fresh()) return Object.freeze([]);
    const row = catalogue.languages[language];
    return Object.freeze([row.waveNet, ...row.chirp]);
  }
  function getSelected(language) {
    return getChoices(language).find(candidate => candidate.name === selected[language]) || null;
  }
  function getVoice(language) {
    if (configured[language]) return getSelected(language) || configured[language][0];
    if (!LANGUAGES.includes(language) || !fresh()) return null;
    return getSelected(language) || catalogue.languages[language].defaultVoice;
  }
  function getSnapshot(language) {
    const choice = getSelected(language), voice = getVoice(language);
    const defaultVoice = configured[language]?.[0] || (CATALOGUE_LANGUAGES.includes(language) && fresh() ? catalogue.languages[language].defaultVoice : null);
    const sourceMetadata = configured[language] ? Object.freeze({source:'configured-wavenet',selectionVersion:'configured-wavenet-v1',choiceSource:choice?'local':'configured-default'}) : fresh() ? Object.freeze({source: catalogue.source,
      selectionVersion: catalogue.selectionVersion, verifiedAt: catalogue.verifiedAt, expiresAt: catalogue.expiresAt,
      choiceSource: choice ? 'local' : defaultVoice ? 'approved-default' : null}) : null;
    return Object.freeze({status: configured[language] ? 'ready' : state().status, language, choices: getChoices(language),
      selected: choice, voice, provisional: false, defaultVoice,
      approvedDefault: defaultVoice,
      usesApprovedDefault: !!voice && !choice && voice.name === defaultVoice?.name, sourceMetadata});
  }
  function setVoice(language, name) {
    if (!LANGUAGES.includes(language) || !getChoices(language).some(candidate => candidate.name === name)) return false;
    const next = Object.assign(Object.create(null), selected, {[language]: name});
    try {
      if (typeof window.localStorage?.setItem !== 'function') return false;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({version: 1, choices: next}));
    } catch (_) { return false; }
    selected = next;
    notify('selection'); return true;
  }
  function clearVoice(language) {
    if (!LANGUAGES.includes(language)) return false;
    const next = Object.assign(Object.create(null), selected); delete next[language];
    try {
      if (typeof window.localStorage?.setItem !== 'function') return false;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({version: 1, choices: next}));
    } catch (_) { return false; }
    selected = next;
    notify('selection'); return true;
  }
  window.addEventListener?.('storage', event => {
    if (event.key === STORAGE_KEY || event.key === null) { selected = readSelection(event.newValue); notify('selection'); }
  });
  window.MelungaVoiceSelection = Object.freeze({preload, ready: preload, state, getChoices,
    getSelected, getVoice, getSnapshot, setVoice, clearVoice,
    subscribe(listener) { if (typeof listener !== 'function') return () => {}; listeners.add(listener); return () => listeners.delete(listener); }});
  // Fetch before any play gesture. play() itself only reads the ready map.
  preload().catch(() => {});
})();
