(function () {
  'use strict';

  var SESSION_KEY = 'ox_session';
  var originalFetch = window.fetch.bind(window);

  function deviceType() {
    return /Android|iPhone|iPad|iPod|Mobile|Tablet/i.test(navigator.userAgent || '')
      ? 'mobile'
      : 'desktop';
  }

  function deviceLabel() {
    var ua = navigator.userAgent || '';
    if (/iPad/i.test(ua)) return 'iPad';
    if (/iPhone|iPod/i.test(ua)) return 'iPhone';
    if (/Android/i.test(ua)) {
      return /Mobile/i.test(ua) ? 'Téléphone Android' : 'Tablette Android';
    }
    if (/Windows/i.test(ua)) return 'Ordinateur Windows';
    if (/Macintosh|Mac OS X/i.test(ua)) return 'Mac';
    if (/Linux/i.test(ua)) return 'Ordinateur Linux';
    return deviceType() === 'mobile' ? 'Appareil mobile' : 'Ordinateur';
  }

  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || '';
    var isLogin = url.indexOf('/.netlify/functions/login') === 0;
    var isPayment = url.indexOf('/.netlify/functions/create-payment-link') === 0;
    var isStatus = url.indexOf('/.netlify/functions/check-status') === 0;
    var nextInit = Object.assign({}, init || {});

    if ((isLogin || isPayment) && nextInit.body) {
      try {
        var body = JSON.parse(nextInit.body);
        body.device_type = deviceType();
        body.device_label = deviceLabel();
        nextInit.body = JSON.stringify(body);
      } catch (_) {
        /* La fonction serveur validera le corps reçu. */
      }
    }

    if (isStatus) {
      var token = localStorage.getItem(SESSION_KEY) || '';
      if (token) {
        var headers = new Headers(nextInit.headers || {});
        headers.set('Authorization', 'Bearer ' + token);
        nextInit.headers = headers;
      }
    }

    return originalFetch(input, nextInit);
  };

  function deviceLimitMessage(data) {
    var type = data && data.device_type === 'mobile' ? 'mobile' : 'desktop';
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

  async function loginExistingV2() {
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
          device_type: deviceType(),
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
            deviceType: deviceType(),
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

  async function logoutV2() {
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

  function installAccessV2() {
    window.loginExisting = loginExistingV2;
    window.doLogout = logoutV2;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installAccessV2, { once: true });
  } else {
    installAccessV2();
  }
})();
