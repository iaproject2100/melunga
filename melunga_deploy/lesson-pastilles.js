(function () {
  'use strict';
  // Web layout only. Installed APKs keep their own runtime and resources.
  if (!document.documentElement.classList.contains('melunga-lesson-web')) return;
  const drawer = document.getElementById('ctrlDrawer');
  const stage = document.querySelector('.main .stage');
  const card = document.getElementById('card');
  const progress = document.querySelector('.desktop-progress');
  const palette = document.getElementById('colorBtn');
  if (!drawer || !stage || !card || !progress || !palette) return;
  if (typeof window.buildCtrlDrawer === 'function') window.buildCtrlDrawer();
  const mobile = matchMedia('(max-width:1023px)');
  const toolbar = document.createElement('div');
  toolbar.className = 'mobile-card-tools';
  toolbar.setAttribute('role','group');
  toolbar.hidden = true;
  stage.append(toolbar);
  const voice = document.getElementById('selVoice');
  const themes = document.getElementById('selRb');
  const review = document.getElementById('selRev');
  const number = progress.querySelector('.desktop-progress-count');
  const languageTools = progress.querySelector('.mobile-language-tools');
  const labels = {
    fr:'Couleur, thèmes et révisions',en:'Colour, topics and review',
    es:'Color, temas y repaso',zh:'颜色、主题和复习',
    it:'Colore, temi e ripasso',ja:'色、テーマ、復習',ko:'색상, 주제 및 복습'
  };
  let active = false;
  function append(parent,child) {
    if (child && child.parentNode !== parent) parent.append(child);
  }
  function place() {
    active = mobile.matches && document.body.classList.contains('immersif');
    document.body.classList.toggle('lesson-mobile-pastilles',active);
    progress.classList.toggle('mobile-lesson-commands',active);
    toolbar.hidden = !active;
    if (active) {
      if (voice && voice.parentNode !== progress) progress.insertBefore(voice,number);
      [palette,themes,review].forEach(function (control) { append(toolbar,control); });
      const locale = typeof nat === 'string' ? nat : 'fr';
      toolbar.setAttribute('aria-label',labels[locale] || labels.fr);
    } else {
      const grid = drawer.querySelector('.menu-b-quick-grid') || drawer;
      // Restore the real selectors in their original order at desktop sizes.
      ['selLang','selLv','selRb','selRev','selVoice'].forEach(function (id) {
        append(grid,document.getElementById(id));
      });
      const rate = document.getElementById('rateBar');
      if (palette.parentNode !== stage) stage.insertBefore(palette,rate);
    }
    // The legacy wrapper remains for desktop; CSS makes it contents on mobile.
    if (languageTools) languageTools.classList.toggle('mobile-pastilles-language',active);
  }
  window.placeLessonPastilles = place;
  document.documentElement.classList.add('lesson-pastilles-ready');
  const menuTrigger = document.querySelector('.utrigger');
  function menuState() {
    if (!menuTrigger) return;
    menuTrigger.setAttribute('aria-controls',drawer.id);
    menuTrigger.setAttribute('aria-expanded',drawer.classList.contains('open') ? 'true' : 'false');
  }
  new MutationObserver(menuState).observe(drawer,{attributes:true,attributeFilter:['class']});
  menuState();
  document.addEventListener('keydown',function (event) {
    if (event.key !== 'Escape' || !active || !drawer.classList.contains('open')) return;
    if (document.querySelector('#lessonPicker[open],.selbox.open,#fbOverlay.show')) return;
    if (typeof window.closeCtrlDrawer === 'function') window.closeCtrlDrawer();
    if (menuTrigger) menuTrigger.focus({preventScroll:true});
    event.preventDefault();
  });
  [toolbar,progress].forEach(function (group) {
    ['touchstart','touchmove','touchend','touchcancel'].forEach(function (type) {
      group.addEventListener(type,function (event) { event.stopPropagation(); },{passive:true});
    });
    group.addEventListener('pointerdown',function (event) { event.stopPropagation(); });
  });
  const originalFit = window.fitCard;
  window.fitCard = function () {
    const result = originalFit.apply(this,arguments);
    if (active) {
      const phrase = document.getElementById('fr');
      const phon = document.getElementById('phon');
      const translation = document.getElementById('cn');
      const longest = Math.max(...[phrase,phon,translation].map(function (node) { return node ? node.textContent.length : 0; }));
      const base = innerHeight < 680 ? 28 : 36;
      const size = longest > 180 ? 20 : longest > 100 ? 22 : longest > 65 ? 25 : base;
      card.style.setProperty('--mobile-lesson-size',size + 'px');
    }
    return result;
  };
  let pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () {
      pending = false;
      place();
      if (active) window.fitCard();
    });
  }
  mobile.addEventListener('change',function () {
    ['closeSels','closeLangSel','closeVoiceSel','closeRevSel','closeCtrlDrawer'].forEach(function (name) {
      if (typeof window[name] === 'function') window[name]();
    });
    schedule();
  });
  new MutationObserver(schedule).observe(document.body,{attributes:true,attributeFilter:['class']});
  window.addEventListener('resize',schedule);
  place();
  if (document.readyState === 'complete') schedule();
  else window.addEventListener('load',schedule);
})();
