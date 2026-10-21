(function () {
  'use strict';
  const drawer = document.getElementById('ctrlDrawer');
  if (!drawer) return;
  const names = {
    fr:['Accueil','Langue','Niveau','Thèmes','Révisions et exercices','Audio','Avis','Déconnexion'],
    en:['Home','Language','Level','Topics','Review and practice','Audio','Feedback','Sign out'],
    es:['Inicio','Idioma','Nivel','Temas','Repaso y práctica','Audio','Opiniones','Cerrar sesión'],
    zh:['主页','语言','级别','主题','复习与练习','音频','反馈','退出登录'],
    it:['Home','Lingua','Livello','Temi','Ripasso ed esercizi','Audio','Parere','Esci'],
    ja:['ホーム','言語','レベル','テーマ','復習と練習','音声','フィードバック','ログアウト'],
    ko:['홈','언어','레벨','주제','복습 및 연습','오디오','피드백','로그아웃']
  };
  const items = [
    ['btnHome','<path d="m4 11 8-7 8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>'],
    ['selLang','<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c4 4.5 4 13.5 0 18-4-4.5-4-13.5 0-18Z"/>'],
    ['selLv','<path d="M5 19v-4m7 4v-9m7 9V5"/><path d="m15 5 4-1 1 4"/>'],
    ['selRb','<rect x="3.5" y="3.5" width="6" height="6" rx="1.7"/><rect x="14.5" y="3.5" width="6" height="6" rx="1.7"/><rect x="3.5" y="14.5" width="6" height="6" rx="1.7"/><rect x="14.5" y="14.5" width="6" height="6" rx="1.7"/>'],
    ['selRev','<path d="M3 10a9 9 0 1 1 1.8 7.5M3 4v6h6"/><path d="M12 7v5l3 2"/>'],
    ['selVoice','<path d="m11 4-6 5H2v6h3l6 5zM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>'],
    ['btnFb','<path d="M20.5 11.5a8.5 8.5 0 0 1-12 7.8L3 21l1.7-5.5A8.5 8.5 0 1 1 20.5 11.5Z"/><path d="M7.5 11.5h.01M12 11.5h.01M16.5 11.5h.01" stroke-width="2.8"/>'],
    ['btnLogout','<path d="M9 4H4v16h5m6-13 5 5-5 5m-7-5h12"/>']
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
      if (!control || !drawer.contains(control)) return;
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
      control.querySelectorAll('.ball,.selk,.selv,.desktop-control-icon,.desktop-control-label,.menu-b-quick-caption,#homeLbl,#fbBtnLbl,#logoutLbl').forEach(function (element) {
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
      if (drawer.querySelector('.selbox.open')) {
        ['closeSels','closeVoiceSel','closeRevSel'].forEach(function (name) { if (typeof window[name] === 'function') window[name](); });
        if (returnTo && returnTo.isConnected) returnTo.focus({preventScroll:true});
        event.preventDefault();
        event.stopImmediatePropagation();
      }
      return;
    }
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const control = event.target instanceof Element && event.target.closest('#ctrlDrawer.lesson-tools .lesson-control');
    if (!control || control.tagName === 'BUTTON' || event.target !== control) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    control.click();
  },true);
  window.addEventListener('resize',hideTip);
  drawer.addEventListener('scroll',hideTip,{passive:true});
  let pending = false;
  new MutationObserver(function () {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () { pending = false; refresh(); });
  }).observe(document.body,{childList:true,characterData:true,attributes:true,attributeFilter:['class'],subtree:true});
  refresh();
})();
