(function () {
  'use strict';

  var API_ORIGIN = 'https://melunga.com';
  window.MELUNGA_CONTENT_ORIGIN = 'https://deploy-preview-8--chic-dragon-e2baf2.netlify.app/';
  window.MELUNGA_TEST_BUILD = 'conversation-preview-8-v3';
  var DEVICE_TYPE = 'mobile';
  var SESSION_KEY = 'ox_session';
  var originalFetch = window.fetch.bind(window);

  window.MELUNGA_MOBILE_APP = true;
  window.MELUNGA_DEVICE_TYPE = DEVICE_TYPE;

  /* Les abonnements mobiles sont désormais proposés par la boutique native. */
  var storeStyle = document.createElement('style');
  storeStyle.textContent = [
    '.melunga-native-app .native-store-actions{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:12px}',
    '.melunga-native-app .native-store-actions button{border:1px solid rgba(255,255,255,.25);border-radius:999px;background:rgba(255,255,255,.1);color:inherit;padding:9px 13px;font:inherit;font-size:12px;font-weight:800}'
  ].join('\n');
  document.head.appendChild(storeStyle);

  /* Mise en page propre à l'application : sans logo sur les cartes, roue de
     couleurs translucide et défilement sûr avec les grands caractères. */
  var cardStyle = document.createElement('style');
  cardStyle.id = 'melunga-native-card-adjustments';
  cardStyle.textContent = [
    '@media (max-width:859px){',
    'body.immersif .top .lockup{display:none!important}',
    'body.immersif .top{min-height:0!important;padding:0!important;border:0!important;background:transparent!important}',
    'body.immersif .countrow{top:calc(10px + env(safe-area-inset-top))!important;left:50%!important;right:auto!important;width:min(520px,calc(100vw - 136px))!important;transform:translateX(-50%)!important;flex-direction:row!important;align-items:center!important;justify-content:center!important}',
    'body.immersif .progwrap{top:calc(58px + env(safe-area-inset-top))!important;left:50%!important;right:auto!important;transform:translateX(-50%)!important;width:min(640px,calc(100vw - 116px))!important;margin:0!important}',
    'body.immersif .study-lang{left:50%!important;right:auto!important;transform:translateX(-50%)!important;width:max-content!important;max-width:calc(100vw - 40px)!important}',
    'body.immersif .stage,body.immersif.pile-bas .stage,body.immersif.pile-haut .stage,body.immersif.pile-gauche .stage,body.immersif.pile-droite .stage{padding-top:calc(102px + env(safe-area-inset-top))!important;overflow-x:hidden!important;overflow-y:auto!important;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}',
    'body.immersif .themebtn{display:none!important;place-items:center;position:fixed!important;z-index:170!important;top:calc(72px + env(safe-area-inset-top))!important;right:20px!important;left:auto!important;width:36px!important;height:36px!important;min-width:36px!important;min-height:36px!important;padding:0!important;border:0!important;border-radius:50%!important;background:rgba(255,255,255,.10)!important;box-shadow:0 7px 18px rgba(0,0,0,.14)!important;-webkit-backdrop-filter:blur(7px);backdrop-filter:blur(7px);opacity:.76}',
    'body.immersif .themebtn:active{transform:scale(.92) rotate(12deg)}',
    '.theme-wheel-app{position:relative;display:block;width:30px;height:30px;border-radius:50%;background:conic-gradient(rgba(255,81,75,.86) 0 45deg,rgba(255,192,59,.86) 45deg 90deg,rgba(0,199,104,.86) 90deg 135deg,rgba(42,157,220,.86) 135deg 180deg,rgba(43,86,219,.86) 180deg 225deg,rgba(103,31,205,.86) 225deg 270deg,rgba(229,70,158,.86) 270deg 315deg,rgba(255,83,91,.86) 315deg 360deg);box-shadow:inset 0 0 0 1px rgba(255,255,255,.22)}',
    '.theme-wheel-app:before{content:"";position:absolute;inset:7px;border-radius:50%;background:rgba(255,255,255,.36);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}',
    'body.immersif #card.card{flex:0 0 auto!important;width:100%;min-height:min(58dvh,500px)!important;overflow:visible!important}',
    'body.immersif .ratebar .rate{height:auto!important;min-height:50px!important;padding-block:10px!important}',
    'body.immersif .umenupop,body.immersif .ctrldrawer,body.immersif .tpanel .tsheet,body.immersif .hiwPanel .hiwSheet{max-height:calc(100dvh - env(safe-area-inset-top) - 20px)!important;overflow-y:auto!important;overscroll-behavior:contain}',
    '}',
    '@media (max-width:420px){',
    'body.immersif .countrow{width:calc(100vw - 112px)!important;gap:5px!important}',
    'body.immersif .count,body.immersif .level-now{max-width:none;overflow:visible;white-space:nowrap}',
    'body.immersif .ratebar{align-items:stretch!important}',
    'body.immersif .ratebar .rate{flex:1 1 0!important;min-width:0!important;max-width:none!important;white-space:normal!important;line-height:1.15!important}',
    'body.immersif .ratebar .rate-label{white-space:nowrap!important;overflow-wrap:normal!important}',
    'body.immersif #card .cxEntry{top:66px!important}',
    'body.immersif .ratebar .rate{font-size:clamp(13px,3.8vw,17px)!important;white-space:nowrap!important;gap:6px!important}',
    '}',
    '@media (max-height:620px){body.immersif #card.card{min-height:440px!important}}'
  ].join('\n');
  document.head.appendChild(cardStyle);

  function deviceLabel() {
    var ua = navigator.userAgent || '';
    if (/iPad/i.test(ua)) return 'iPad';
    if (/iPhone|iPod/i.test(ua)) return 'iPhone';
    if (/Android/i.test(ua)) {
      return /Mobile/i.test(ua) ? 'Téléphone Android' : 'Tablette Android';
    }
    return 'Application mobile';
  }

  function mergeHeaders(initialHeaders) {
    var headers = new Headers(initialHeaders || {});
    var token = localStorage.getItem(SESSION_KEY) || '';
    if (token) headers.set('Authorization', 'Bearer ' + token);
    return headers;
  }

  /*
   * Dans l'application, index.html est servi depuis le conteneur natif.
   * Les fonctions Netlify restent hébergées sur melunga.com.
   */
  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || '';
    var isFunction = url.indexOf('/.netlify/functions/') === 0;
    var isLogin = url.indexOf('/.netlify/functions/login') === 0;
    var isPayment = url.indexOf('/.netlify/functions/create-payment-link') === 0;
    var isPricing = url.indexOf('/.netlify/functions/get-pricing') === 0;
    var isStatus = url.indexOf('/.netlify/functions/check-status') === 0;
    var isDeleteAccount = url.indexOf('/.netlify/functions/delete-account') === 0;
    var nextInit = Object.assign({}, init || {});

    if (isPayment) {
      return Promise.resolve(new Response(JSON.stringify({
        error: 'store_purchase_required'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }));
    }

    /* Dans l'application, la devise et le prix viennent exclusivement de Google Play. */
    if (isPricing) {
      return Promise.resolve(new Response(JSON.stringify({
        monthlyDisplay: '…',
        annualDisplay: '…',
        country: 'STORE'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }));
    }

    if (isLogin && nextInit.body) {
      try {
        var loginBody = JSON.parse(nextInit.body);
        loginBody.device_type = DEVICE_TYPE;
        loginBody.device_label = deviceLabel();
        loginBody.app_platform = /Android/i.test(navigator.userAgent)
          ? 'android'
          : 'ios';
        nextInit.body = JSON.stringify(loginBody);
      } catch (_) {
        /* Le serveur validera une requête qui ne serait pas du JSON. */
      }
    }

    if (isStatus || isDeleteAccount) {
      nextInit.headers = mergeHeaders(nextInit.headers);
    }

    if (isFunction) {
      url = API_ORIGIN + url;
    }

    return originalFetch(url, nextInit);
  };

  function deviceLimitMessage(data) {
    var type = data && data.device_type === 'desktop' ? 'desktop' : 'mobile';
    var messages = {
      fr: type === 'desktop'
        ? 'Ce compte est déjà utilisé sur un autre ordinateur. Déconnectez cet ordinateur avant de continuer.'
        : 'Ce compte est déjà utilisé sur un autre mobile. Déconnectez cet appareil avant de continuer.',
      en: type === 'desktop'
        ? 'This account is already used on another computer. Sign out on that computer before continuing.'
        : 'This account is already used on another mobile device. Sign out on that device before continuing.',
      es: type === 'desktop'
        ? 'Esta cuenta ya se utiliza en otro ordenador. Cierra la sesión allí antes de continuar.'
        : 'Esta cuenta ya se utiliza en otro móvil. Cierra la sesión allí antes de continuar.',
      it: type === 'desktop'
        ? 'Questo account è già utilizzato su un altro computer. Disconnettilo prima di continuare.'
        : 'Questo account è già utilizzato su un altro dispositivo mobile. Disconnettilo prima di continuare.',
      zh: type === 'desktop'
        ? '此账户已在另一台电脑上使用。请先在该电脑上退出登录。'
        : '此账户已在另一台移动设备上使用。请先在该设备上退出登录。',
      ja: type === 'desktop'
        ? 'このアカウントは別のパソコンで使用中です。先にそのパソコンからログアウトしてください。'
        : 'このアカウントは別のモバイル端末で使用中です。先にその端末からログアウトしてください。'
    };
    var currentLanguage = typeof lang === 'string' ? lang : 'fr';
    return messages[currentLanguage] || messages.fr;
  }

  async function mobileLoginExisting() {
    var emailEl = document.getElementById('pwLoginEmail');
    var passEl = document.getElementById('pwLoginPassword');
    var email = (emailEl ? emailEl.value : '').trim();
    var password = passEl ? passEl.value : '';
    var feedback = document.getElementById('pwFree');
    var button = document.getElementById('pwLoginBtn');

    if (!email || email.indexOf('@') < 0) {
      if (feedback) feedback.textContent = T('emailRequired');
      return;
    }
    if (!password) {
      if (feedback) feedback.textContent = T('passwordRequired');
      return;
    }
    if (button) button.disabled = true;

    try {
      var response = await fetch('/.netlify/functions/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: getDeviceId(),
          device_type: DEVICE_TYPE,
          device_label: deviceLabel(),
          email: email,
          password: password
        })
      });
      var data = await response.json();

      if (data && data.success) {
        if (data.session_token) localStorage.setItem(SESSION_KEY, data.session_token);
        isPaid = true;
        var paywall = document.getElementById('paywall');
        if (paywall) paywall.style.display = 'none';
        buildLevels();
        return;
      }

      if (button) button.disabled = false;
      if (feedback) {
        feedback.textContent = data && data.error === 'device_limit_reached'
          ? deviceLimitMessage(data)
          : data && data.error === 'subscription_expired'
            ? T('subExpired')
            : T('loginError');

        if (data && data.error === 'device_limit_reached'
          && window.MelungaDeviceReplacement) {
          window.MelungaDeviceReplacement.offer({
            container: feedback,
            email: email,
            password: password,
            deviceId: getDeviceId(),
            deviceType: DEVICE_TYPE,
            deviceLabel: deviceLabel(),
            language: typeof lang === 'string' ? lang : 'fr',
            onSuccess: function (replacement) {
              if (replacement.session_token) {
                localStorage.setItem(SESSION_KEY, replacement.session_token);
              }
              isPaid = true;
              var paywall = document.getElementById('paywall');
              if (paywall) paywall.style.display = 'none';
              buildLevels();
            }
          });
        }
      }
    } catch (_) {
      if (button) button.disabled = false;
      if (feedback) feedback.textContent = T('loginError');
    }
  }

  async function mobileLogout() {
    if (!confirm(T('logoutConfirm'))) return;

    var token = localStorage.getItem(SESSION_KEY) || '';
    var headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = 'Bearer ' + token;

    try {
      var response = await fetch('/.netlify/functions/logout', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ device_id: getDeviceId() })
      });
      if (!response.ok) throw new Error('logout_failed');

      localStorage.removeItem(SESSION_KEY);
      localStorage.setItem('ox_paid', '0');
      localStorage.removeItem('ox_device');
      location.reload();
    } catch (_) {
      alert('La déconnexion nécessite une connexion Internet. Réessayez dans un instant.');
    }
  }

  async function mobileDeleteAccount() {
    var language = typeof nat === 'string' ? nat : 'fr';
    var copy = {
      fr: {
        first: 'Supprimer définitivement ton compte Melunga et ta progression ? Cette action est irréversible.',
        second: 'Attention : supprimer le compte ne résilie pas automatiquement un abonnement Google Play ou App Store. Veux-tu continuer ?',
        failed: 'La suppression nécessite une connexion active. Reconnecte-toi puis réessaie.'
      },
      en: {
        first: 'Permanently delete your Melunga account and progress? This cannot be undone.',
        second: 'Deleting the account does not automatically cancel a Google Play or App Store subscription. Continue?',
        failed: 'Deletion requires an active session. Sign in again and retry.'
      },
      es: {
        first: '¿Eliminar definitivamente tu cuenta Melunga y tu progreso? Esta acción es irreversible.',
        second: 'Eliminar la cuenta no cancela automáticamente una suscripción de Google Play o App Store. ¿Continuar?',
        failed: 'La eliminación requiere una sesión activa. Inicia sesión y vuelve a intentarlo.'
      },
      zh: {
        first: '永久删除你的 Melunga 账户和学习进度？此操作无法撤销。',
        second: '删除账户不会自动取消 Google Play 或 App Store 订阅。是否继续？',
        failed: '删除账户需要有效登录。请重新登录后再试。'
      },
      it: {
        first: 'Eliminare definitivamente il tuo account Melunga e i progressi? L’azione è irreversibile.',
        second: 'Eliminare l’account non annulla automaticamente un abbonamento Google Play o App Store. Continuare?',
        failed: 'Per eliminare l’account devi essere connesso. Accedi e riprova.'
      },
      ja: {
        first: 'Melungaアカウントと学習履歴を完全に削除しますか？元に戻せません。',
        second: 'アカウントを削除してもGoogle PlayまたはApp Storeの購読は自動解約されません。続行しますか？',
        failed: '削除にはログインが必要です。再度ログインしてお試しください。'
      },
      ko: {
        first: 'Melunga 계정과 학습 기록을 영구 삭제할까요? 되돌릴 수 없습니다.',
        second: '계정 삭제는 Google Play 또는 App Store 구독을 자동으로 취소하지 않습니다. 계속할까요?',
        failed: '삭제하려면 로그인 상태여야 합니다. 다시 로그인한 뒤 시도하세요.'
      }
    };
    var text = copy[language] || copy.fr;
    if (!confirm(text.first) || !confirm(text.second)) return;

    try {
      var response = await fetch('/.netlify/functions/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true })
      });
      if (!response.ok) throw new Error('delete_failed');
      localStorage.clear();
      location.href = 'index.html?account_deleted=1';
    } catch (_) {
      alert(text.failed);
    }
  }

  function configureStoreBuild() {
    /* Replace ces styles en dernier dans le <head>. Le fichier app.html charge
       encore ses anciens styles après mobile-runtime.js ; sans ce déplacement,
       ils pouvaient réafficher le logo de la carte sur certains téléphones. */
    document.head.appendChild(storeStyle);
    document.head.appendChild(cardStyle);
    document.documentElement.classList.add('melunga-native-app');

    window.loginExisting = mobileLoginExisting;
    window.doLogout = mobileLogout;
    window.deleteMelungaAccount = mobileDeleteAccount;

    /* Petite roue translucide toujours accessible sur la page des cartes. */
    var themeButton = document.querySelector('.themebtn');
    if (themeButton) {
      themeButton.removeAttribute('style');
      themeButton.innerHTML = '<span class="theme-wheel-app" aria-hidden="true"></span>';
      themeButton.setAttribute('aria-label', 'Changer la couleur');
      themeButton.setAttribute('title', 'Changer la couleur');
      themeButton.onclick = function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (typeof window.cycleAmb === 'function') window.cycleAmb();
      };
    }

    /* Airwallex reste réservé au site ; l'application utilise la boutique native. */
    var newTab = document.getElementById('pwTabNew');
    var newSection = document.getElementById('pwNewSection');
    var existingTab = document.getElementById('pwTabExisting');

    if (newTab) {
      newTab.hidden = false;
      newTab.style.display = '';
    }
    if (newSection) {
      newSection.hidden = false;
    }
    if (existingTab) {
      existingTab.style.width = '';
    }

    var query = new URLSearchParams(window.location.search);
    if (query.get('login') === '1' && existingTab) existingTab.click();
    else if (newTab) newTab.click();

    var utilityMenu = document.getElementById('umenupop');
    if (utilityMenu && !document.getElementById('btnDeleteAccount')) {
      var deleteLabels = {
        fr: 'Supprimer mon compte', en: 'Delete my account', es: 'Eliminar mi cuenta',
        zh: '删除我的账户', it: 'Elimina il mio account', ja: 'アカウントを削除', ko: '계정 삭제'
      };
      var deleteButton = document.createElement('button');
      deleteButton.className = 'uitem';
      deleteButton.id = 'btnDeleteAccount';
      deleteButton.type = 'button';
      deleteButton.innerHTML = '🗑️<span>' + (deleteLabels[typeof nat === 'string' ? nat : 'fr'] || deleteLabels.fr) + '</span>';
      deleteButton.addEventListener('click', function () {
        if (typeof closeUMenu === 'function') closeUMenu();
        mobileDeleteAccount();
      });
      utilityMenu.appendChild(deleteButton);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', configureStoreBuild, {
      once: true
    });
  } else {
    configureStoreBuild();
  }
})();
