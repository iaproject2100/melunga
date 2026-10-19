(function () {
  'use strict';
  if (window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform()) return;
  document.documentElement.classList.add('melunga-lesson-web');
  const desktop = window.matchMedia('(min-width:1024px)');
  const stage = document.querySelector('.main .stage');
  if (!stage || typeof window.fitCard !== 'function') return;
  const progress = document.createElement('div');
  progress.className = 'desktop-progress';
  const languageName = document.createElement('span');
  const levelName = document.createElement('span');
  const phraseNumber = document.createElement('span');
  languageName.className = 'desktop-progress-language';
  levelName.className = 'desktop-progress-level';
  phraseNumber.className = 'desktop-progress-count';
  const languageFlag = document.createElement('span');
  languageFlag.setAttribute('aria-hidden','true');
  const languageText = document.createElement('span');
  languageName.append(languageFlag,languageText);
  progress.append(languageName,levelName,phraseNumber); stage.append(progress);
  const icons = ['🌐','📊','📚','🔁','🔊'];
  const hiddenLegacyValues = new Map();
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
      let icon = control.querySelector('.desktop-control-icon');
      if (!icon) {
        icon = document.createElement('span'); icon.className = 'desktop-control-icon';
        icon.setAttribute('aria-hidden','true');
        icon.textContent = icons[index];
        control.insertBefore(icon,control.firstChild);
      }
      const legacyValue = control.querySelector('.selv');
      if (legacyValue) {
        if (!hiddenLegacyValues.has(legacyValue)) hiddenLegacyValues.set(legacyValue,{value:legacyValue.style.getPropertyValue('display'),priority:legacyValue.style.getPropertyPriority('display')});
        legacyValue.style.setProperty('display','none','important');
      }
      let label = control.querySelector('.desktop-control-label');
      if (!label) { label = document.createElement('span'); label.className = 'desktop-control-label'; control.insertBefore(label,control.querySelector('.selmenu')); }
      if (label.textContent !== values[index]) label.textContent = values[index];
    });
  }
  const originalFit = window.fitCard;
  window.fitCard = function () {
    const card = document.getElementById('card');
    if (!desktop.matches || !document.body.classList.contains('immersif')) { if (card) card.style.removeProperty('--learning-text-size');
      hiddenLegacyValues.forEach(function (saved,element) { if (saved.value) element.style.setProperty('display',saved.value,saved.priority); else element.style.removeProperty('display'); });
      hiddenLegacyValues.clear();
      return originalFit.apply(this,arguments); }
    labelControls();
    const locale = typeof nat === 'string' ? nat : 'fr';
    const language = typeof lang === 'string' ? lang : 'en';
    let displayLanguage = language;
    try { displayLanguage = new Intl.DisplayNames([locale],{type:'language'}).of(language); } catch (_error) {}
    if (languageText.textContent !== displayLanguage) languageText.textContent = displayLanguage;
    languageFlag.className = 'menu-b-flag desktop-language-flag flag-' + language;
    const level = document.getElementById('ballLv');
    if (levelName.textContent !== (level ? level.textContent : 'L1')) levelName.textContent = level ? level.textContent : 'L1';
    levelName.setAttribute('aria-label',document.getElementById('currentLevel').textContent);
    phraseNumber.textContent = (typeof idx === 'number' ? idx + 1 : 1) + ' / ' + (typeof pool !== 'undefined' ? pool.length : 0);
    phraseNumber.setAttribute('aria-label',document.getElementById('count').textContent);

    const phrase = document.getElementById('fr'), phonetic = document.getElementById('phon');
    if (!phrase) return;
    const length = phrase.textContent.length;
    const longest = Math.max(length,phonetic ? phonetic.textContent.length : 0,(document.getElementById('cn').textContent || '').length);
    if (card) card.style.setProperty('--learning-text-size',(longest > 150 ? 24 : longest > 90 ? 28 : 36) + 'px');
    // Fit the three learning lines together; keep controls inside the viewport.
    let size = longest > 150 ? 24 : longest > 90 ? 28 : 36;
    while (card && card.scrollHeight > card.clientHeight + 1 && size > 16) {
      size -= 2; card.style.setProperty('--learning-text-size',size + 'px');
    }
  };
  const learningCard = document.getElementById('card');
  let drag = null, suppressClickUntil = 0;
  function resetDrag() {
    if (!drag) return null;
    const state = drag; drag = null;
    learningCard.classList.remove('desktop-dragging');
    learningCard.style.removeProperty('transform');
    if (learningCard.hasPointerCapture(state.id)) learningCard.releasePointerCapture(state.id);
    return state;
  }
  learningCard.addEventListener('pointerdown',function (event) {
    if (!desktop.matches || !document.body.classList.contains('immersif') || event.button !== 0 || event.pointerType === 'touch') return;
    if (event.target.closest('button,input,textarea,select,a,.earicon,.pytgl,[contenteditable="true"]')) return;
    if (document.getElementById('paywall').style.display === 'block') return;
    drag = {id:event.pointerId,x:event.clientX,y:event.clientY,dx:0,dy:0,moved:false};
    learningCard.setPointerCapture(event.pointerId);
  });
  learningCard.addEventListener('pointermove',function (event) {
    if (!drag || drag.id !== event.pointerId) return;
    drag.dx = event.clientX - drag.x; drag.dy = event.clientY - drag.y;
    if (Math.hypot(drag.dx,drag.dy) < 6 && !drag.moved) return;
    drag.moved = true;
    learningCard.classList.add('desktop-dragging');
    const x = Math.max(-160,Math.min(160,drag.dx * .6));
    const y = Math.max(-110,Math.min(110,drag.dy * .6));
    learningCard.style.transform = 'translate(' + x + 'px,' + y + 'px) rotate(' + (x / 90) + 'deg)';
    event.preventDefault();
  });
  learningCard.addEventListener('pointerup',function (event) {
    if (!drag || drag.id !== event.pointerId) return;
    const state = resetDrag();
    if (!state.moved) return;
    suppressClickUntil = performance.now() + 300;
    const horizontal = Math.abs(state.dx) >= 70 && Math.abs(state.dx) > Math.abs(state.dy) * 1.2;
    const vertical = Math.abs(state.dy) >= 65 && Math.abs(state.dy) > Math.abs(state.dx) * 1.2;
    if (!horizontal && !vertical) return;
    if ((horizontal && state.dx < 0) || (vertical && state.dy < 0)) window.next();
    else if (typeof window.navGate !== 'function' || window.navGate()) window.prev();
  });
  learningCard.addEventListener('pointercancel',resetDrag);
  learningCard.addEventListener('lostpointercapture',resetDrag);
  learningCard.addEventListener('click',function (event) {
    if (performance.now() < suppressClickUntil) { event.preventDefault(); event.stopImmediatePropagation(); }
  },true);
  desktop.addEventListener('change',function () { resetDrag(); window.fitCard(); });
  // Existing rendering calls fitCard after changes of language, mode and phrase.
  if (document.readyState === 'complete') window.fitCard();
  else window.addEventListener('load',function () { window.fitCard(); });
})();
