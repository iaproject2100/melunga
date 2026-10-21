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
  let gesture = null, scrollPending = false, suppressTouchClickUntil = 0;
  function scrollState() {
    const max = Math.max(0,card.scrollHeight - card.clientHeight);
    const top = Math.max(0,Math.min(max,card.scrollTop));
    // Once the last control is visible, an empty bottom padding is not unread content.
    const bottomGap = (parseFloat(getComputedStyle(card).paddingBottom) || 0) + 2;
    return {max:max,top:top,scrolling:active && max > 2,atTop:top <= 2,atBottom:max - top <= bottomGap};
  }
  function scrollMode() {
    scrollPending = false;
    const state = scrollState();
    card.classList.toggle('lesson-card-scrollable',state.scrolling);
    card.classList.toggle('lesson-scroll-edge',state.scrolling && (state.atTop || state.atBottom));
  }
  function queueScrollMode() {
    if (scrollPending) return;
    scrollPending = true;
    requestAnimationFrame(scrollMode);
  }
  card.addEventListener('scroll',scrollMode,{passive:true});
  if (typeof ResizeObserver === 'function') {
    const observer = new ResizeObserver(queueScrollMode);
    observer.observe(card);
    Array.from(card.children).forEach(function (child) { observer.observe(child); });
  }
  card.addEventListener('touchstart',function (event) {
    gesture = null;
    if (!active) return;
    suppressTouchClickUntil = 0;
    window._justDragged = false;
    if (event.touches.length !== 1) return;
    const control = event.target.closest('button,input,textarea,select,a,.earicon,.pytgl,[contenteditable]');
    if (control && !control.matches('#listen,.earicon,#pytgl')) return;
    const touch = event.touches[0];
    const state = scrollState();
    gesture = {x:touch.clientX,y:touch.clientY,dx:0,dy:0,top:state.top,max:state.max,scrolling:state.scrolling,atTop:state.atTop,atBottom:state.atBottom,control:!!control,manual:!state.scrolling || state.atTop || state.atBottom};
  },{passive:true});
  card.addEventListener('touchmove',function (event) {
    if (!gesture) return;
    if (event.touches.length !== 1) { gesture = null; return; }
    gesture.dx = event.touches[0].clientX - gesture.x;
    gesture.dy = event.touches[0].clientY - gesture.y;
    if (!gesture.manual) return;
    if (gesture.scrolling && Math.abs(gesture.dy) > Math.abs(gesture.dx)) {
      card.scrollTop = Math.max(0,Math.min(gesture.max,gesture.top - gesture.dy));
    }
  },{passive:true});
  card.addEventListener('touchcancel',function () { gesture = null; queueScrollMode(); },{passive:true});
  card.addEventListener('touchend',function (event) {
    const state = gesture; gesture = null;
    if (!state || event.touches.length || !active) return;
    const touch = event.changedTouches[0];
    if (touch) { state.dx = touch.clientX - state.x; state.dy = touch.clientY - state.y; }
    if (Math.abs(state.dx) > 15 || Math.abs(state.dy) > 15) {
      window._justDragged = true;
      suppressTouchClickUntil = Date.now() + 600;
    }
    if (!state.manual) return;
    const vertical = Math.abs(state.dy) >= 70 && Math.abs(state.dy) > Math.abs(state.dx) * 1.2;
    const forward = vertical && state.dy < 0 && (!state.scrolling || state.atBottom);
    const back = vertical && state.dy > 0 && (!state.scrolling || state.atTop);
    if (forward || back) {
      card.scrollTop = 0;
      if (forward) window.next(); else window.prevOrHome();
      queueScrollMode();
    } else if (!state.control && !state.scrolling && Math.abs(state.dx) >= 80 && Math.abs(state.dy) < 60) {
      window.rateCard(state.dx > 0);
    }
  },{passive:true});
  card.addEventListener('click',function (event) {
    if (!active) return;
    if (event.detail === 0) { window._justDragged = false; return; }
    if (Date.now() > suppressTouchClickUntil) return;
    suppressTouchClickUntil = 0;
    window._justDragged = false;
    event.preventDefault();
    event.stopImmediatePropagation();
  },true);
  function append(parent,child) {
    if (child && child.parentNode !== parent) parent.append(child);
  }
  function place() {
    active = mobile.matches && document.body.classList.contains('immersif');
    document.body.classList.toggle('lesson-mobile-pastilles',active);
    progress.classList.toggle('mobile-lesson-commands',active);
    toolbar.hidden = !active;
    if (active) {
      palette.classList.remove('desktop-rail-palette');
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
      if (!mobile.matches && document.body.classList.contains('immersif')) {
        palette.classList.add('desktop-rail-palette');
        if (palette.parentNode !== grid || palette.nextElementSibling !== themes) grid.insertBefore(palette,themes);
      } else {
        palette.classList.remove('desktop-rail-palette');
        const rate = document.getElementById('rateBar');
        if (palette.parentNode !== stage) stage.insertBefore(palette,rate);
      }
    }
    // The legacy wrapper remains for desktop; CSS makes it contents on mobile.
    if (languageTools) languageTools.classList.toggle('mobile-pastilles-language',active);
    if (!active) gesture = null;
    queueScrollMode();
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
      let size = longest > 180 ? 20 : longest > 100 ? 22 : longest > 65 ? 25 : base;
      card.style.setProperty('--mobile-lesson-size',size + 'px');
      // Pinyin must not turn a short phrase into a scrolling card by a few pixels.
      const minimum = Math.min(size,24);
      while (size > minimum && card.scrollHeight > card.clientHeight + 2) {
        size -= 1;
        card.style.setProperty('--mobile-lesson-size',size + 'px');
      }
    }
    queueScrollMode();
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
