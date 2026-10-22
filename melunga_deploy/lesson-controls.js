(function () {
  'use strict';
  const drawer = document.getElementById('ctrlDrawer');
  if (!drawer) return;
  const names = {
    fr:['Accueil','Langue','Niveau','Thèmes','Révisions et exercices','Voix','Avis','Déconnexion','Se connecter / Créer un compte'],
    en:['Home','Language','Level','Topics','Review and practice','Voice','Feedback','Sign out','Sign in / Create account'],
    es:['Inicio','Idioma','Nivel','Temas','Repaso y práctica','Voz','Opiniones','Cerrar sesión','Iniciar sesión / Crear cuenta'],
    zh:['主页','语言','级别','主题','复习与练习','声音','反馈','退出登录','登录 / 注册账号'],
    it:['Home','Lingua','Livello','Temi','Ripasso ed esercizi','Voce','Parere','Esci','Accedi / Crea un account'],
    ja:['ホーム','言語','レベル','テーマ','復習と練習','音声','フィードバック','ログアウト','ログイン / アカウント作成'],
    ko:['홈','언어','레벨','주제','복습 및 연습','음성','피드백','로그아웃','로그인 / 계정 만들기']
  };
  const items = [
    ['btnHome','<path d="m4 11 8-7 8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>'],
    ['selLang','<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c4 4.5 4 13.5 0 18-4-4.5-4-13.5 0-18Z"/>'],
    ['selLv','<path d="M5 19v-4m7 4v-9m7 9V5"/><path d="m15 5 4-1 1 4"/>'],
    ['selRb','<path d="M4 9V5h5l2 2h9v4" stroke="#b9a1e9" stroke-width="3"/><path d="M3 11V8h5l2 2h11v3" stroke="#efc56b" stroke-width="2.6"/><path d="M2.5 11h19l-2 10h-15Z" fill="currentColor" stroke="none"/><path d="M8 14h8m-8 3h5" stroke="var(--gc-base,#fff)" stroke-width="1.4"/>'],
    ['selRev','<path d="m1.5 8 10.5-5 10.5 5L12 13Z" fill="currentColor" stroke="none"/><path d="M6 12v6c3 3 9 3 12 0v-6l-6 3Z" fill="currentColor" stroke="none"/><path d="M22.5 8v10"/><circle cx="22.5" cy="19" r="1" fill="currentColor" stroke="none"/>'],
    ['selVoice','<circle cx="8" cy="7" r="3"/><path d="M2.5 20v-3a5.5 5.5 0 0 1 11 0v3M16 8a5 5 0 0 1 0 6m3-9a9 9 0 0 1 0 12"/>'],
    ['btnFb','<path d="M20.5 11.5a8.5 8.5 0 0 1-12 7.8L3 21l1.7-5.5A8.5 8.5 0 1 1 20.5 11.5Z"/><path d="M7.5 11.5h.01M12 11.5h.01M16.5 11.5h.01" stroke-width="2.8"/>'],
    ['btnLogout','<path d="M9 4H4v16h5m6-13 5 5-5 5m-7-5h12"/>'],
    ['btnAuth','<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 10-4M15 17h7m-3-3 3 3-3 3"/>']
  ];
  const tip = document.createElement('div');
  tip.id = 'lessonControlTip';
  tip.className = 'lesson-control-tooltip';
  tip.setAttribute('role','tooltip');
  tip.hidden = true;
  document.body.append(tip);
  let tipSource = null;
  let returnTo = null;

  function hideTip() {
    tip.hidden = true;
    if (tipSource) tipSource.removeAttribute('aria-describedby');
    tipSource = null;
  }
  function showTip(control) {
    if (document.querySelector('#lessonPicker[open]')) return;
    hideTip();
    tipSource = control;
    tip.textContent = control.dataset.controlLabel;
    tip.hidden = false;
    control.setAttribute('aria-describedby',tip.id);
    const rect = control.getBoundingClientRect();
    const size = tip.getBoundingClientRect();
    const desktop = document.documentElement.classList.contains('melunga-lesson-web') && innerWidth >= 1024;
    const left = desktop ? rect.right + 12 : rect.left + (rect.width - size.width) / 2;
    const top = desktop ? rect.top + (rect.height - size.height) / 2 : rect.bottom + 8;
    tip.style.left = Math.max(8,Math.min(left,innerWidth - size.width - 8)) + 'px';
    tip.style.top = Math.max(8,Math.min(top,innerHeight - size.height - 8)) + 'px';
  }
  function value(id) {
    const element = document.getElementById(id);
    const text = element && element.textContent.trim();
    return text && text !== '—' ? text : '';
  }
  function refresh() {
    const locale = typeof nat === 'string' ? nat : 'fr';
    const copy = names[locale] || names.fr;
    items.forEach(function (item,index) {
      const control = document.getElementById(item[0]);
      if (!control || (!drawer.contains(control) && !control.closest('.mobile-lesson-commands,.mobile-card-tools'))) return;
      if (!control.classList.contains('lesson-control')) {
        control.classList.add('lesson-control');
        const icon = document.createElement('span');
        icon.className = 'lesson-control-icon';
        icon.setAttribute('aria-hidden','true');
        icon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false">' + item[1] + '</svg>';
        control.prepend(icon);
        control.addEventListener('pointerenter',function (event) { if (event.pointerType !== 'touch') showTip(control); });
        control.addEventListener('pointerleave',hideTip);
        control.addEventListener('focus',function () { showTip(control); });
        control.addEventListener('blur',hideTip);
        control.addEventListener('click',function () { hideTip(); returnTo = control; });
      }
      // Preserve the original translated labels and values in the DOM.
      control.querySelectorAll('.ball,.selk,.selv,.desktop-control-icon,.desktop-control-label,.menu-b-quick-caption,#homeLbl,#fbBtnLbl,#logoutLbl,#authLbl').forEach(function (element) {
        element.style.setProperty('display','none','important');
      });
      Array.from(control.childNodes).forEach(function (node) {
        if (node.nodeType !== Node.TEXT_NODE || !node.textContent.trim()) return;
        const legacy = document.createElement('span');
        legacy.className = 'lesson-control-legacy';
        legacy.hidden = true;
        node.replaceWith(legacy);
        legacy.append(node);
      });
      let detail = '';
      if (item[0] === 'selLang') {
        try { detail = new Intl.DisplayNames([locale],{type:'language'}).of(lang); }
        catch (_error) { detail = value('langSelVal'); }
      } else if (item[0] === 'selLv') detail = value('ballLv');
      else if (item[0] === 'selVoice') detail = value('voiceSelVal');
      const visual = control.querySelector('.lesson-control-icon');
      if (visual && item[0] === 'selLang' && document.documentElement.classList.contains('melunga-lesson-web')) {
        const code = typeof lang === 'string' && /^(fr|en|es|zh|it|ja|ko)$/.test(lang) ? lang : 'en';
        if (visual.dataset.language !== code) {
          visual.innerHTML = '<span class="lesson-control-flag menu-b-flag flag-' + code + '"></span>';
          visual.dataset.language = code;
        }
      } else if (visual && item[0] === 'selLv' && document.documentElement.classList.contains('melunga-lesson-web')) {
        const text = value('ballLv') || 'L1';
        let badge = visual.querySelector('.lesson-control-level');
        if (!badge) { visual.innerHTML = '<span class="lesson-control-level"></span>'; badge = visual.firstChild; }
        if (badge.textContent !== text) badge.textContent = text;
      }
      if (['btnHome','btnFb','btnLogout','btnAuth'].includes(item[0])) {
        let menuLabel = control.querySelector('.mobile-menu-label');
        if (!menuLabel) { menuLabel = document.createElement('span'); menuLabel.className = 'mobile-menu-label'; control.append(menuLabel); }
        if (menuLabel.textContent !== copy[index]) menuLabel.textContent = copy[index];
      }
      const label = copy[index] + (detail ? ' · ' + detail : '');
      control.dataset.controlLabel = label;
      control.setAttribute('aria-label',label);
      if (control.tagName !== 'BUTTON') {
        control.setAttribute('role','button');
        control.tabIndex = 0;
      }
      if (control.classList.contains('selbox') && !control.dataset.lessonPicker) {
        control.setAttribute('aria-expanded',String(control.classList.contains('open')));
      }
    });
    if (!drawer.classList.contains('lesson-tools')) drawer.classList.add('lesson-tools');
    document.documentElement.classList.add('lesson-tools-ready');
    if (tipSource && !tip.hidden && tip.textContent !== tipSource.dataset.controlLabel) showTip(tipSource);
  }

  document.addEventListener('keydown',function (event) {
    if (event.key === 'Escape') {
      hideTip();
      if (document.querySelector('#ctrlDrawer .selbox.open,.mobile-lesson-commands .selbox.open,.mobile-card-tools .selbox.open')) {
        ['closeSels','closeVoiceSel','closeRevSel'].forEach(function (name) { if (typeof window[name] === 'function') window[name](); });
        if (returnTo && returnTo.isConnected) returnTo.focus({preventScroll:true});
        event.preventDefault();
        event.stopImmediatePropagation();
      }
      return;
    }
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const control = event.target instanceof Element && event.target.closest('#ctrlDrawer.lesson-tools .lesson-control,.mobile-lesson-commands .lesson-control,.mobile-card-tools .lesson-control');
    if (!control || control.tagName === 'BUTTON' || event.target !== control) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    control.click();
  },true);
  window.addEventListener('resize',hideTip);
  drawer.addEventListener('scroll',hideTip,{passive:true});
  // Scrolling the tool rail must not navigate or rate the lesson behind it.
  ['touchstart','touchmove','touchend','touchcancel'].forEach(function (type) {
    drawer.addEventListener(type,function (event) { event.stopPropagation(); },{passive:true});
  });
  let pending = false;
  new MutationObserver(function () {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () { pending = false; refresh(); });
  }).observe(document.body,{childList:true,characterData:true,attributes:true,attributeFilter:['class'],subtree:true});
  refresh();
})();
