/* The preview catalogue selects actual Chirp 3 HD candidates before the click.
 * Pages without that preview module keep the existing WaveNet contract. A
 * browser voice is a fallback only when it matches the studied language. */
(() => {
  'use strict';

  const voices = Object.freeze({
    fr: Object.freeze({ locale: 'fr-FR', serverLanguage: 'fr-FR', female: 'fr-FR-Wavenet-F', male: 'fr-FR-Wavenet-G' }),
    en: Object.freeze({ locale: 'en-US', serverLanguage: 'en-US', female: 'en-US-Wavenet-C', male: 'en-US-Wavenet-D' }),
    es: Object.freeze({ locale: 'es-ES', serverLanguage: 'es-ES', female: 'es-ES-Wavenet-F', male: 'es-ES-Wavenet-E' }),
    zh: Object.freeze({ locale: 'zh-CN', serverLanguage: 'cmn-CN', female: 'cmn-CN-Wavenet-A', male: 'cmn-CN-Wavenet-B' }),
    it: Object.freeze({ locale: 'it-IT', serverLanguage: 'it-IT', female: 'it-IT-Wavenet-E', male: 'it-IT-Wavenet-F' }),
    ja: Object.freeze({ locale: 'ja-JP', serverLanguage: 'ja-JP', female: 'ja-JP-Wavenet-B', male: 'ja-JP-Wavenet-C' }),
    ko: Object.freeze({ locale: 'ko-KR', serverLanguage: 'ko-KR', female: 'ko-KR-Wavenet-A', male: 'ko-KR-Wavenet-C' }),
    hi: Object.freeze({ locale:'hi-IN', serverLanguage:'hi-IN', female:'hi-IN-Wavenet-C', male:'hi-IN-Wavenet-B' }),
    ar: Object.freeze({locale:'ar-SA',serverLanguage:'ar-XA',female:'ar-XA-Wavenet-A',male:'ar-XA-Wavenet-B'}),
    pt: Object.freeze({locale:'pt-BR',serverLanguage:'pt-BR',female:'pt-BR-Wavenet-A',male:'pt-BR-Wavenet-B'}),
    ru: Object.freeze({ locale:'ru-RU', serverLanguage:'ru-RU', female:'ru-RU-Wavenet-A', male:'ru-RU-Wavenet-B' }),
    id: Object.freeze({ locale:'id-ID', serverLanguage:'id-ID', female:'id-ID-Wavenet-A', male:'id-ID-Wavenet-B' }),
    de: Object.freeze({ locale: 'de-DE', serverLanguage: 'de-DE', female: 'de-DE-Wavenet-A', male: 'de-DE-Wavenet-B' })
  });
  const normalizedLanguage = value => String(value || '').toLowerCase().replace(/_/g, '-');
  function matchesLanguage(voice, language) {
    if (!voice || typeof voice.lang !== 'string') return false;
    const tag = normalizedLanguage(voice.lang), primary = tag.split('-')[0];
    if (language === 'pt') return tag === 'pt-br';
    if (language === 'en') return tag === 'en-us';
    if (language !== 'zh') return primary === language;
    // The Chinese course teaches Mandarin. A Cantonese system voice must not
    // pronounce the same characters in another spoken language after failure.
    const cantonese = /canton|粤|粵|广东|廣東/i.test((voice.name || '') + ' ' + (voice.voiceURI || ''));
    return !cantonese && (primary === 'cmn' || primary === 'zh' && !/(?:^|-)(?:hk|mo)(?:-|$)/.test(tag));
  }

  function createPlayer({ onPlaying = () => {}, onUnavailable = () => {}, onVoice = () => {}, endpointBase } = {}) {
    let generation = 0, current = null;
    const isCurrent = request => current === request && request.generation === generation;
    const selection = window.MelungaVoiceSelection;
    const base = endpointBase === undefined ? selection?.state?.().endpointBase || '' : String(endpointBase).replace(/\/$/, '');
    if (!['', 'https://melunga.com'].includes(base)) throw new Error('Unsupported voice endpoint');

    function clearTimer(request) {
      if (request.timer !== null) clearTimeout(request.timer);
      request.timer = null;
    }
    function releaseAudio(request) {
      clearTimer(request);
      const audio = request.audio;
      request.audio = null;
      if (!audio) return;
      audio.onplaying = audio.onpause = audio.onended = audio.onerror = audio.onwaiting = audio.onstalled = null;
      try { audio.pause(); } catch (_) {}
      try { audio.removeAttribute('src'); } catch (_) {}
      try { audio.load(); } catch (_) {}
    }
    function releaseSpeech(request, cancel) {
      const utterance = request.utterance;
      request.utterance = null;
      if (!utterance) return;
      utterance.onstart = utterance.onpause = utterance.onresume = utterance.onend = utterance.onerror = null;
      if (cancel) { try { window.speechSynthesis?.cancel(); } catch (_) {} }
    }
    function finish(request, unavailable = false) {
      if (!isCurrent(request)) return;
      current = null;
      releaseAudio(request);
      releaseSpeech(request, unavailable);
      onPlaying(false);
      if (unavailable) onUnavailable();
    }
    function stop() {
      ++generation;
      const request = current;
      current = null;
      if (request) {
        releaseAudio(request);
        releaseSpeech(request, true);
      }
      onPlaying(false);
    }

    function browserFallback(request) {
      if (!isCurrent(request) || request.usedFallback) return;
      request.usedFallback = true;
      onPlaying(false);
      releaseAudio(request);
      const synthesis = window.speechSynthesis;
      let available = [];
      try { available = synthesis?.getVoices() || []; } catch (_) {}
      const matching = available.filter(voice => matchesLanguage(voice, request.language));
      const voice = matching.find(candidate => normalizedLanguage(candidate.lang) === normalizedLanguage(request.config.locale)) || matching[0];
      // Leaving voice unset allows Android to choose its French default. Never
      // invoke synthesis unless an explicit compatible voice is available.
      if (!voice || typeof synthesis?.speak !== 'function' || typeof window.SpeechSynthesisUtterance !== 'function') {
        finish(request, true);
        return;
      }
      try {
        const utterance = new SpeechSynthesisUtterance(request.text);
        request.utterance = utterance;
        utterance.voice = voice;
        utterance.lang = voice.lang;
        utterance.rate = request.rate;
        utterance.volume = 1;
        const active = () => isCurrent(request) && request.utterance === utterance;
        utterance.onstart = utterance.onresume = () => { if (active()) {clearTimer(request);onPlaying(true);} };
        utterance.onpause = () => { if (active()) {clearTimer(request);onPlaying(false);} };
        utterance.onend = () => { if (active()) finish(request); };
        utterance.onerror = event => {
          if (active()) finish(request, !['canceled', 'interrupted'].includes(event?.error));
        };
        request.timer = setTimeout(() => { if (active()) finish(request, true); }, 10000);
        synthesis.speak(utterance);
      } catch (_) { finish(request, true); }
    }

    function play({ text, language, rate = 0.85, voice = 'female', genderHint = '', voiceName } = {}) {
      stop();
      const config = voices[language];
      if (!config || typeof text !== 'string' || !text.trim()
          || ![0.7, 0.75, 0.85, 1].includes(rate) || !['female', 'male'].includes(voice)) {
        onUnavailable();
        return false;
      }
      const imported = ['hi','ru','pt','ar','id'].includes(language);
      const marker = imported && /\((male|female)\)/i.exec(genderHint);
      if (marker) voice = marker[1].toLowerCase();
      let candidate = null, provisional = false, browserOnly = false;
      if (selection && !imported) {
        const catalogueStatus = selection.state().status;
        candidate = voiceName === undefined ? selection.getVoice(language)
          : selection.getChoices(language).find(item => item.name === voiceName);
        provisional = voiceName === undefined && !!candidate && selection.getSnapshot(language).provisional;
        // No delayed play after a catalogue request: a second explicit gesture
        // can retry when preload is ready, without losing mobile activation.
        if (!candidate) {
          if (voiceName === undefined && ['error', 'expired'].includes(catalogueStatus)) {
            browserOnly = true;
            // Retry the catalogue for a later gesture; this request is handled
            // immediately by a matching local voice and is never replayed.
            selection.preload().catch(() => {});
          } else { onUnavailable(); return false; }
        }
      } else {
        if (imported && selection && voiceName !== undefined) {
          candidate = selection.getChoices(language).find(item => item.name === voiceName);
          if (!candidate) { onUnavailable(); return false; }
        } else {
          if (voiceName !== undefined) { onUnavailable(); return false; }
          candidate = imported && !marker && selection?.getVoice(language)
            || {name: config[voice], languageCode: config.serverLanguage, engine:'wavenet', rateMode:'server'};
        }
      }
      const clientRate = candidate?.rateMode === 'client';
      const request = { generation, text, language, rate, config, audio: null,
        utterance: null, timer: null, usedFallback: false };
      current = request;
      if (candidate) onVoice(Object.freeze({name: candidate.name, engine: candidate.engine, provisional,
        rateMode: candidate.rateMode, serverRate: clientRate ? 1 : rate, playbackRate: clientRate ? rate : 1}));
      // Only media playing / speech start events may light the shared controls.
      if (browserOnly || typeof window.Audio !== 'function') {
        browserFallback(request);
        return true;
      }
      try {
        const audio = new Audio();
        request.audio = audio;
        const active = () => isCurrent(request) && request.audio === audio;
        const waitForAudio = () => {
          if (!active()) return;
          onPlaying(false);
          clearTimer(request);
          request.timer = setTimeout(() => { if (active()) browserFallback(request); }, 10000);
        };
        audio.preload = 'auto';
        // Chirp receives MP3 only at its natural speed. WaveNet already applies
        // speakingRate on the server, so it must not also be slowed here.
        audio.playbackRate = clientRate ? rate : 1;
        if (clientRate) { audio.preservesPitch = true; audio.webkitPreservesPitch = true; }
        audio.onplaying = () => { if (active()) {clearTimer(request);onPlaying(true);} };
        audio.onpause = () => { if (active()) {clearTimer(request);onPlaying(false);} };
        audio.onended = () => { if (active()) finish(request); };
        audio.onerror = () => { if (active()) browserFallback(request); };
        audio.onwaiting = audio.onstalled = waitForAudio;
        audio.src = base + '/.netlify/functions/tts?' + new URLSearchParams({
          voice: candidate.name, lang: candidate.languageCode, rate: String(clientRate ? 1 : rate), text
        }).toString();
        if (!active()) return true;
        waitForAudio();
        // Keep play() inside the user's click/keyboard gesture. A fetch/blob
        // round trip here would lose activation on some mobile browsers.
        const playing = audio.play();
        playing?.catch(() => { if (active()) browserFallback(request); });
      } catch (_) { browserFallback(request); }
      return true;
    }
    const unsubscribe = selection?.subscribe?.((_state, reason) => { if (reason === 'selection') stop(); });
    return Object.freeze({ play, stop, destroy() { stop(); unsubscribe?.(); } });
  }

  window.MelungaLessonAudio = Object.freeze({ createPlayer });
})();
