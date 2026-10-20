(function () {
  'use strict';
  const copy = {
    fr: {languages:'Langues',levels:'Niveaux',close:'Fermer',language:'Changer de langue',level:'Changer de niveau'},
    en: {languages:'Languages',levels:'Levels',close:'Close',language:'Change language',level:'Change level'},
    es: {languages:'Idiomas',levels:'Niveles',close:'Cerrar',language:'Cambiar de idioma',level:'Cambiar de nivel'},
    zh: {languages:'语言',levels:'级别',close:'关闭',language:'切换语言',level:'切换级别'},
    it: {languages:'Lingue',levels:'Livelli',close:'Chiudi',language:'Cambia lingua',level:'Cambia livello'},
    ja: {languages:'言語',levels:'レベル',close:'閉じる',language:'言語を変更',level:'レベルを変更'},
    ko: {languages:'언어',levels:'레벨',close:'닫기',language:'언어 변경',level:'레벨 변경'}
  };
  const languageTriggers = '#studyLang,.desktop-progress-language,#selLang';
  const levelTriggers = '#currentLevel,.desktop-progress-level,#selLv,.menu-b-level';
  const flagCodes = {lFR:'fr',lEN:'en',lES:'es',lZH:'zh',lIT:'it',lJA:'ja',lKO:'ko'};
  const dialog = document.createElement('dialog');
  dialog.id = 'lessonPicker';
  dialog.className = 'lesson-picker';
  dialog.setAttribute('aria-labelledby','lessonPickerTitle');
  dialog.innerHTML = '<header class="lesson-picker-head"><button class="lesson-picker-back" type="button"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="m14 5-7 7 7 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button><h2 class="lesson-picker-title" id="lessonPickerTitle"></h2></header><div class="lesson-picker-list"></div>';
  document.body.append(dialog);
  const title = dialog.querySelector('.lesson-picker-title');
  const back = dialog.querySelector('.lesson-picker-back');
  const list = dialog.querySelector('.lesson-picker-list');
  let launcher = null;

  function labels() { return copy[typeof nat === 'string' ? nat : 'fr'] || copy.fr; }

  function close() {
    if (dialog.open) dialog.close();
    document.documentElement.classList.remove('lesson-picker-open');
    if (launcher) {
      launcher.setAttribute('aria-expanded','false');
      if (launcher.isConnected) launcher.focus({preventScroll:true});
      launcher = null;
    }
  }

  function closeOldMenus() {
    ['closeSels','closeLangSel','closeVoiceSel','closeRevSel','closeUMenu','closeCtrlDrawer'].forEach(function (name) {
      if (typeof window[name] === 'function') window[name]();
    });
  }

  function option(source,kind) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'lesson-picker-option';
    const text = document.createElement('span');
    text.className = 'lesson-picker-label';
    let selected;
    if (kind === 'language') {
      const code = flagCodes[source.id];
      const flag = document.createElement('span');
      flag.className = 'lesson-picker-flag menu-b-flag flag-' + code;
      flag.setAttribute('aria-hidden','true');
      button.append(flag);
      text.textContent = Array.from(source.childNodes).filter(function (node) { return node.nodeType === Node.TEXT_NODE; }).map(function (node) { return node.textContent; }).join('').trim();
      button.dataset.value = code;
      selected = code === (typeof lang === 'string' ? lang : '');
    } else {
      const match = (source.getAttribute('onclick') || '').match(/setMode\(['"](L(?:10|[1-9]))['"]/);
      const value = match && match[1];
      if (!value) return null;
      const badge = document.createElement('span');
      badge.className = 'lesson-picker-level';
      badge.textContent = value;
      button.append(badge);
      text.textContent = source.querySelector('small').textContent;
      button.dataset.value = value;
      selected = value === document.getElementById('ballLv').textContent.trim();
    }
    button.append(text);
    const locked = source.querySelector('.lockico');
    const mark = document.createElement('span');
    mark.className = 'lesson-picker-mark' + (locked ? ' lesson-picker-lock' : '');
    // Preserve the original lock label in the accessible name.
    if (!locked) mark.setAttribute('aria-hidden','true');
    mark.textContent = locked ? locked.textContent : selected ? '✓' : '';
    button.append(mark);
    if (selected) button.setAttribute('aria-current','true');
    button.addEventListener('click',function () {
      close();
      // Use the original selection handler, including the existing access check.
      source.click();
      closeOldMenus();
    });
    return button;
  }

  function open(kind,trigger) {
    if (dialog.open) return;
    closeOldMenus();
    const sourceSelector = kind === 'language' ? '#selLang .langs > .lang' : '#levels > .lv';
    const sources = Array.from(document.querySelectorAll(sourceSelector)).filter(function (source) {
      return !source.hidden && source.style.display !== 'none';
    });
    if (!sources.length) return;
    title.textContent = kind === 'language' ? labels().languages : labels().levels;
    back.setAttribute('aria-label',labels().close);
    list.replaceChildren();
    sources.forEach(function (source) {
      const row = option(source,kind);
      if (row) list.append(row);
    });
    launcher = trigger;
    launcher.setAttribute('aria-expanded','true');
    dialog.dataset.kind = kind;
    document.documentElement.classList.add('lesson-picker-open');
    dialog.showModal();
    const current = list.querySelector('[aria-current=true]') || list.firstElementChild;
    if (current) {
      current.focus({preventScroll:true});
      current.scrollIntoView({block:'nearest'});
    }
  }

  function triggerFor(target) {
    if (!(target instanceof Element) || target.closest('.selmenu') || dialog.contains(target)) return null;
    const language = target.closest(languageTriggers);
    if (language) return {kind:'language',element:language};
    const level = target.closest(levelTriggers);
    return level ? {kind:'level',element:level} : null;
  }

  document.addEventListener('click',function (event) {
    const trigger = triggerFor(event.target);
    if (!trigger) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    open(trigger.kind,trigger.element);
  },true);

  document.addEventListener('keydown',function (event) {
    if (dialog.open) {
      // Keep the lesson's arrow shortcuts from navigating the card behind us.
      event.stopImmediatePropagation();
      const options = Array.from(list.querySelectorAll('button'));
      const index = options.indexOf(document.activeElement);
      let next = null;
      if (event.key === 'ArrowDown') next = Math.min(index + 1,options.length - 1);
      if (event.key === 'ArrowUp') next = Math.max(index - 1,0);
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = options.length - 1;
      if (next !== null && options[next]) {
        event.preventDefault();
        options[next].focus();
      }
      return;
    }
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const trigger = triggerFor(event.target);
    if (!trigger) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    open(trigger.kind,trigger.element);
  },true);

  back.addEventListener('click',close);
  // Scrolling a choice list must never trigger the lesson's document swipes.
  ['touchstart','touchmove','touchend','touchcancel'].forEach(function (type) {
    dialog.addEventListener(type,function (event) { event.stopPropagation(); },{passive:true});
  });
  dialog.addEventListener('cancel',function (event) { event.preventDefault(); close(); });
  dialog.addEventListener('close',function () { if (!dialog.open) close(); });

  function enhanceTriggers() {
    [[languageTriggers,'language'],[levelTriggers,'level']].forEach(function (entry) {
      document.querySelectorAll(entry[0]).forEach(function (trigger) {
        trigger.dataset.lessonPicker = entry[1];
        trigger.setAttribute('role','button');
        trigger.tabIndex = 0;
        trigger.setAttribute('aria-haspopup','dialog');
        trigger.setAttribute('aria-controls',dialog.id);
        trigger.setAttribute('aria-expanded',trigger === launcher ? 'true' : 'false');
        const value = trigger.matches('#selLang,#selLv') ? '' : trigger.textContent.trim();
        trigger.setAttribute('aria-label',labels()[entry[1]] + (value ? ' — ' + value : ''));
      });
    });
  }
  let pending = false;
  new MutationObserver(function () {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () { pending = false; enhanceTriggers(); });
  }).observe(document.body,{childList:true,characterData:true,subtree:true});
  enhanceTriggers();
})();
