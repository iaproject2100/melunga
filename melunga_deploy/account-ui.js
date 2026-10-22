(function () {
  'use strict';
  var panel = document.getElementById('paywall');
  if (!panel) return;
  var copy = {
    fr: { login: 'Se connecter', create: 'Créer un compte', close: 'Fermer' },
    en: { login: 'Sign in', create: 'Create account', close: 'Close' },
    es: { login: 'Iniciar sesión', create: 'Crear cuenta', close: 'Cerrar' },
    zh: { login: '登录', create: '注册账号', close: '关闭' },
    it: { login: 'Accedi', create: 'Crea un account', close: 'Chiudi' },
    ja: { login: 'ログイン', create: 'アカウント作成', close: '閉じる' },
    ko: { login: '로그인', create: '계정 만들기', close: '닫기' }
  };
  var backdrop = document.createElement('div');
  backdrop.id = 'accountBackdrop';
  backdrop.hidden = true;
  backdrop.setAttribute('aria-hidden', 'true');
  document.body.appendChild(backdrop);
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-labelledby', 'pwTitle');
  panel.tabIndex = -1;
  panel.querySelector('.pwTabs').setAttribute('role', 'tablist');
  document.getElementById('pwFree').setAttribute('aria-live', 'polite');
  var wasOpen = false;
  var returnTo = null;
  var lessonDisplay = null;
  var inertElements = [];

  function visible() { return panel.style.display === 'block'; }
  function text() { return copy[typeof nat === 'string' ? nat : 'fr'] || copy.fr; }
  function activePanel() {
    // Device replacement opens its code-confirmation dialog above this one.
    return Array.from(document.querySelectorAll('[role="dialog"][aria-modal="true"]')).reverse().find(function (dialog) {
      return dialog !== panel && !panel.contains(dialog) && !dialog.closest('[inert]') &&
        dialog.getClientRects().length && Number(getComputedStyle(dialog).zIndex) > Number(getComputedStyle(panel).zIndex);
    }) || panel;
  }
  function focusable(root) {
    return Array.from((root || panel).querySelectorAll('button,input,a[href],[tabindex="0"]')).filter(function (element) {
      return !element.disabled && !element.hidden && element.tabIndex >= 0 && element.getClientRects().length;
    });
  }
  function onScreen(element) {
    if (!element || !element.isConnected || element.closest('[inert]')) return false;
    var rect = element.getBoundingClientRect();
    return getComputedStyle(element).visibility !== 'hidden' && rect.width > 0 && rect.height > 0 &&
      rect.left >= 0 && rect.top >= 0 && rect.right <= innerWidth && rect.bottom <= innerHeight;
  }
  function isolate() {
    var branch = panel;
    while (branch.parentElement) {
      Array.from(branch.parentElement.children).forEach(function (element) {
        if (element === branch || element === backdrop || /^(SCRIPT|STYLE|LINK)$/.test(element.tagName)) return;
        inertElements.push([element, element.inert]);
        element.inert = true;
      });
      branch = branch.parentElement;
      if (branch === document.body) break;
    }
  }
  function refresh() {
    var labels = text();
    var button = document.getElementById('btnAuth');
    if (button) button.hidden = typeof isPaid === 'boolean' && isPaid;
    var label = document.getElementById('authLbl');
    if (label) label.textContent = labels.login + ' / ' + labels.create;
    document.getElementById('pwClose').setAttribute('aria-label', labels.close);
    var existing = document.getElementById('pwTabExisting').classList.contains('on');
    if (visible()) {
      document.getElementById('pwTitle').textContent = existing ? labels.login :
        (panel.dataset.accountEntry === 'menu' ? labels.create : T('pwTitle'));
    }
    [['pwTabNew', 'pwNewSection', !existing], ['pwTabExisting', 'pwExistingSection', existing]].forEach(function (item) {
      var tab = document.getElementById(item[0]);
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', item[1]);
      tab.setAttribute('aria-selected', String(item[2]));
      tab.tabIndex = item[2] ? 0 : -1;
      var section = document.getElementById(item[1]);
      section.setAttribute('role', 'tabpanel');
      section.setAttribute('aria-labelledby', item[0]);
    });
    panel.querySelectorAll('.pwInput').forEach(function (input) {
      input.setAttribute('aria-label', input.placeholder);
    });
  }
  function sync() {
    var open = visible();
    backdrop.hidden = !open;
    document.documentElement.classList.toggle('account-open', open);
    document.body.classList.toggle('account-open', open);
    refresh();
    if (open === wasOpen) return;
    wasOpen = open;
    if (open) {
      if (!returnTo && document.activeElement !== document.body) returnTo = document.activeElement;
      isolate();
      panel.focus({ preventScroll: true });
    } else {
      inertElements.forEach(function (entry) { entry[0].inert = entry[1]; });
      inertElements = [];
      // Login, device replacement and native billing may hide the panel directly.
      // Restore the lesson display captured before opening in those cases too.
      if (lessonDisplay) {
        lessonDisplay.forEach(function (entry) { entry[0].style.display = entry[1]; });
        lessonDisplay = null;
      }
      var target = returnTo;
      returnTo = null;
      if (onScreen(target)) {
        target.focus({ preventScroll: true });
      } else {
        var menu = document.querySelector('.utrigger');
        var home = document.getElementById('btnHome');
        var fallback = onScreen(menu) ? menu : home;
        if (onScreen(fallback)) fallback.focus({ preventScroll: true });
      }
    }
  }
  var show = window.showPaywall;
  window.showPaywall = function (context) {
    if (!visible()) {
      returnTo = document.activeElement;
      lessonDisplay = ['count', 'card', 'nav'].map(function (id) {
        var element = document.getElementById(id);
        return [element, element.style.display];
      });
    }
    if (context === 'account') panel.dataset.accountEntry = 'menu';
    else delete panel.dataset.accountEntry;
    var result = show.apply(this, arguments);
    sync();
    return result;
  };
  var hide = window.hidePaywall;
  window.hidePaywall = function () {
    var result = hide.apply(this, arguments);
    sync();
    return result;
  };
  var switchTab = window.pwSwitchTab;
  window.pwSwitchTab = function () {
    var result = switchTab.apply(this, arguments);
    refresh();
    return result;
  };
  window.refreshAccountMenu = refresh;
  window.openAccount = function () {
    ['closeCtrlDrawer', 'closeUMenu', 'closeSels', 'closeLangSel', 'closeVoiceSel', 'closeRevSel'].forEach(function (name) {
      if (typeof window[name] === 'function') window[name]();
    });
    window.showPaywall('account');
    window.pwSwitchTab('existing');
  };
  backdrop.addEventListener('click', function () { window.hidePaywall(); });
  // Form scrolling must never navigate or rate the lesson underneath it.
  [panel, backdrop].forEach(function (element) {
    ['touchstart', 'touchmove', 'touchend', 'touchcancel'].forEach(function (type) {
      element.addEventListener(type, function (event) { event.stopPropagation(); }, { passive: true });
    });
  });
  document.addEventListener('keydown', function (event) {
    if (!visible()) return;
    var root = activePanel();
    if (event.key === 'Escape') {
      event.stopImmediatePropagation();
      if (root === panel) {
        event.preventDefault();
        window.hidePaywall();
      }
    } else if (event.key === 'Tab') {
      var controls = focusable(root);
      var first = controls[0] || root;
      var last = controls[controls.length - 1] || root;
      if ((event.shiftKey && (document.activeElement === first || document.activeElement === root)) ||
          (!event.shiftKey && (document.activeElement === last || document.activeElement === root))) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      }
    } else if (/^Arrow/.test(event.key)) {
      event.stopImmediatePropagation();
      if (event.target.matches('.pwTab') && /^(ArrowLeft|ArrowRight)$/.test(event.key)) {
        var next = event.target.id === 'pwTabNew' ? 'existing' : 'new';
        window.pwSwitchTab(next);
        document.getElementById(next === 'existing' ? 'pwTabExisting' : 'pwTabNew').focus();
      }
      if (!/^(INPUT|TEXTAREA)$/.test(event.target.tagName)) event.preventDefault();
    }
  }, true);
  document.addEventListener('focusin', function (event) {
    if (!visible()) return;
    var root = activePanel();
    if (!root.contains(event.target)) (focusable(root)[0] || root).focus({ preventScroll: true });
  });
  new MutationObserver(sync).observe(panel, { attributes: true, subtree: true, attributeFilter: ['style', 'class'] });
  refresh();
  sync();
})();
