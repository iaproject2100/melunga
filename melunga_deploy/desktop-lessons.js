(function () {
  'use strict';
  if (window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform()) return;
  document.documentElement.classList.add('melunga-lesson-web');
  const desktop = window.matchMedia('(min-width:1024px)');
  const copy = {
    fr: ['Phrase suivante', 'Écoute, puis répète à voix haute.'],
    en: ['Next phrase', 'Listen, then repeat aloud.'],
    es: ['Siguiente frase', 'Escucha y repite en voz alta.'],
    zh: ['下一句', '听录音，然后大声跟读。'],
    it: ['Frase successiva', 'Ascolta, poi ripeti ad alta voce.'],
    ja: ['次の文', '聞いてから、声に出して繰り返しましょう。'],
    ko: ['다음 문장', '듣고 소리 내어 따라 하세요.']
  };
  const stage = document.querySelector('.main .stage');
  if (!stage || typeof window.fitCard !== 'function') return;
  const row = document.createElement('div');
  row.className = 'desktop-next';
  const hint = document.createElement('span');
  const next = document.createElement('button');
  next.type = 'button';
  next.addEventListener('click', function () { if (typeof window.next === 'function') window.next(); });
  row.append(hint,next); stage.append(row);
  const labels = {
    fr:['Langue','Niveau','Thèmes','Révisions et exercices','Voix'],
    en:['Language','Level','Topics','Review and practice','Voice'],
    es:['Idioma','Nivel','Temas','Repaso y práctica','Voz'],
    zh:['语言','级别','主题','复习与练习','声音'],
    it:['Lingua','Livello','Temi','Ripasso ed esercizi','Voce'],
    ja:['言語','レベル','テーマ','復習と練習','音声'],
    ko:['언어','레벨','주제','복습과 연습','음성']
  };
  function labelControls() {
    const values = labels[typeof nat === 'string' ? nat : 'fr'] || labels.fr;
    ['selLang','selLv','selRb','selRev','selVoice'].forEach(function (id,index) {
      const control = document.getElementById(id); if (!control) return;
      let label = control.querySelector('.desktop-control-label');
      if (!label) { label = document.createElement('span'); label.className = 'desktop-control-label'; control.insertBefore(label,control.querySelector('.selmenu')); }
      if (label.textContent !== values[index]) label.textContent = values[index];
    });
  }
  const originalFit = window.fitCard;
  window.fitCard = function () {
    const t = copy[typeof nat === 'string' ? nat : 'fr'] || copy.fr;
    hint.textContent = t[1]; next.textContent = t[0] + ' →';
    const card = document.getElementById('card');
    if (!desktop.matches || !document.body.classList.contains('immersif')) { if (card) card.style.removeProperty('--learning-text-size'); return originalFit.apply(this,arguments); }
    labelControls();
    const phrase = document.getElementById('fr'), phonetic = document.getElementById('phon');
    if (!phrase) return;
    const length = phrase.textContent.length;
    const longest = Math.max(length,phonetic ? phonetic.textContent.length : 0,(document.getElementById('cn').textContent || '').length);
    if (card) card.style.setProperty('--learning-text-size',(longest > 150 ? 24 : longest > 90 ? 28 : 36) + 'px');
    const paywall = document.getElementById('paywall');
    row.style.visibility = paywall && paywall.style.display === 'block' ? 'hidden' : '';
  };
  desktop.addEventListener('change',function () { window.fitCard(); });
  // Existing rendering calls fitCard after changes of language, mode and phrase.
  if (document.readyState === 'complete') window.fitCard();
  else window.addEventListener('load',function () { window.fitCard(); });
})();
