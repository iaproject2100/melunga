(function () {
  'use strict';

  function plugin() {
    return window.Capacitor
      && window.Capacitor.Plugins
      && window.Capacitor.Plugins.MelungaSpeech;
  }

  function languageCode() {
    var codes = {
      fr: 'fr-FR', en: 'en-US', es: 'es-ES', zh: 'zh-CN',
      it: 'it-IT', ja: 'ja-JP', ko: 'ko-KR', de: 'de-DE'
    };
    return codes[typeof lang === 'string' ? lang : 'en'] || 'en-US';
  }

  function install() {
    if (!plugin() || typeof window.startRec !== 'function') return;
    var browserRecognition = window.startRec;

    window.startRec = async function (event) {
      if (!plugin()) {
        browserRecognition(event);
        return;
      }
      if (event && event.stopPropagation) event.stopPropagation();
      if (!window.pool || !pool.length) return;

      var card = pool[idx];
      var mic = document.getElementById('mic');
      var heard = document.getElementById('heard');
      try {
        if (window.curAudio) {
          curAudio.pause();
          curAudio.src = '';
          curAudio = null;
        }
        if (window.speechSynthesis) window.speechSynthesis.cancel();
      } catch (_error) {}

      if (mic) {
        mic.textContent = typeof T === 'function' ? T('micListening') : 'Écoute…';
        mic.classList.add('rec');
      }
      if (heard) heard.textContent = '';

      try {
        var result = await plugin().recognize({
          language: languageCode(),
          prompt: typeof T === 'function' ? T('micListening') : 'Parle maintenant'
        });
        var matches = result && result.matches || [];
        if (result && result.cancelled) return;
        if (!matches.length) {
          if (heard) heard.textContent = typeof T === 'function' ? T('micNoSpeech') : 'Aucune parole détectée.';
          return;
        }

        if (mode === 'recall') {
          var best = matches[0] || '';
          for (var i = 0; i < matches.length; i += 1) {
            if (matchPhrase(matches[i], card.t)) {
              best = matches[i];
              break;
            }
          }
          var input = document.getElementById('recallInput');
          if (input) input.value = best;
          checkRecall();
          return;
        }

        var correct = matches.some(function (value) { return matchPhrase(value, card.t); });
        if (correct) {
          if (heard) heard.innerHTML = '<span class="okk">' + T('correctPrefix') + '</span>';
          revealed = true;
          show();
          return;
        }

        var target = _norm(card.t);
        var bestMatch = matches[0] || '';
        var bestScore = 0;
        matches.forEach(function (candidate) {
          var normalized = _norm(candidate);
          var maximum = Math.max(normalized.length, target.length);
          var score = maximum ? Math.round(100 * (1 - _lev(normalized, target) / maximum)) : 0;
          if (score > bestScore) {
            bestScore = score;
            bestMatch = candidate;
          }
        });
        if (heard) heard.innerHTML = T('heardPrefix') + '<b>' + bestMatch + '</b> · ' + bestScore + '%<br><span style="opacity:.7">' + T('heardRetry') + '</span>';
      } catch (_error) {
        if (heard) heard.textContent = typeof T === 'function' ? T('micDenied') : 'Microphone indisponible.';
      } finally {
        if (mic) {
          mic.textContent = typeof T === 'function' ? T('micAgain') : 'Réessayer';
          mic.classList.remove('rec');
        }
      }
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
