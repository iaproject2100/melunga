/* Lesson audio uses the existing same-origin WaveNet endpoint. A browser voice
 * is a fallback only when its declared language matches the studied language. */
(() => {
  'use strict';

  const voices = Object.freeze({
    fr: Object.freeze({ locale: 'fr-FR', serverLanguage: 'fr-FR', female: 'fr-FR-Wavenet-F', male: 'fr-FR-Wavenet-G' }),
    en: Object.freeze({ locale: 'en-GB', serverLanguage: 'en-GB', female: 'en-GB-Wavenet-C', male: 'en-GB-Wavenet-D' }),
    es: Object.freeze({ locale: 'es-ES', serverLanguage: 'es-ES', female: 'es-ES-Wavenet-F', male: 'es-ES-Wavenet-E' }),
    zh: Object.freeze({ locale: 'zh-CN', serverLanguage: 'cmn-CN', female: 'cmn-CN-Wavenet-A', male: 'cmn-CN-Wavenet-B' }),
    it: Object.freeze({ locale: 'it-IT', serverLanguage: 'it-IT', female: 'it-IT-Wavenet-E', male: 'it-IT-Wavenet-F' }),
    ja: Object.freeze({ locale: 'ja-JP', serverLanguage: 'ja-JP', female: 'ja-JP-Wavenet-B', male: 'ja-JP-Wavenet-C' }),
    ko: Object.freeze({ locale: 'ko-KR', serverLanguage: 'ko-KR', female: 'ko-KR-Wavenet-A', male: 'ko-KR-Wavenet-C' })
  });
  const normalizedLanguage = value => String(value || '').toLowerCase().replace(/_/g, '-');
  function matchesLanguage(voice, language) {
    if (!voice || typeof voice.lang !== 'string') return false;
    const tag = normalizedLanguage(voice.lang), primary = tag.split('-')[0];
    if (language !== 'zh') return primary === language;
    // The Chinese course teaches Mandarin. A Cantonese system voice must not
    // pronounce the same characters in another spoken language after failure.
    const cantonese = /canton|粤|粵|广东|廣東/i.test((voice.name || '') + ' ' + (voice.voiceURI || ''));
    return !cantonese && (primary === 'cmn' || primary === 'zh' && !/(?:^|-)(?:hk|mo)(?:-|$)/.test(tag));
  }

  function createPlayer({ onPlaying = () => {}, onUnavailable = () => {} } = {}) {
    let generation = 0, current = null;
    const isCurrent = request => current === request && request.generation === generation;

    function clearTimer(request) {
      if (request.timer !== null) clearTimeout(request.timer);
      request.timer = null;
    }
    function releaseAudio(request) {
      clearTimer(request);
      const audio = request.audio;
      request.audio = null;
      if (!audio) return;
      audio.onplaying = audio.onended = audio.onerror = audio.onwaiting = audio.onstalled = null;
      try { audio.pause(); } catch (_) {}
      try { audio.removeAttribute('src'); } catch (_) {}
      try { audio.load(); } catch (_) {}
    }
    function releaseSpeech(request, cancel) {
      const utterance = request.utterance;
      request.utterance = null;
      if (!utterance) return;
      utterance.onstart = utterance.onend = utterance.onerror = null;
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
        utterance.onstart = () => { if (active()) clearTimer(request); };
        utterance.onend = () => { if (active()) finish(request); };
        utterance.onerror = event => {
          if (active()) finish(request, !['canceled', 'interrupted'].includes(event?.error));
        };
        request.timer = setTimeout(() => { if (active()) finish(request, true); }, 10000);
        synthesis.speak(utterance);
      } catch (_) { finish(request, true); }
    }

    function play({ text, language, rate = 0.85, voice = 'female' } = {}) {
      stop();
      const config = voices[language];
      if (!config || typeof text !== 'string' || !text.trim()
          || ![0.75, 0.85, 1].includes(rate) || !['female', 'male'].includes(voice)) {
        onUnavailable();
        return false;
      }
      const request = { generation, text, language, rate, config, audio: null,
        utterance: null, timer: null, usedFallback: false };
      current = request;
      onPlaying(true);
      if (typeof window.Audio !== 'function') {
        browserFallback(request);
        return true;
      }
      try {
        const audio = new Audio();
        request.audio = audio;
        const active = () => isCurrent(request) && request.audio === audio;
        const waitForAudio = () => {
          if (!active()) return;
          clearTimer(request);
          request.timer = setTimeout(() => { if (active()) browserFallback(request); }, 10000);
        };
        audio.preload = 'auto';
        audio.playbackRate = 1; // The endpoint applies the requested speakingRate.
        audio.onplaying = () => { if (active()) clearTimer(request); };
        audio.onended = () => { if (active()) finish(request); };
        audio.onerror = () => { if (active()) browserFallback(request); };
        audio.onwaiting = audio.onstalled = waitForAudio;
        audio.src = '/.netlify/functions/tts?' + new URLSearchParams({
          voice: config[voice], lang: config.serverLanguage, rate: String(rate), text
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
    return Object.freeze({ play, stop });
  }

  window.MelungaLessonAudio = Object.freeze({ createPlayer });
})();
