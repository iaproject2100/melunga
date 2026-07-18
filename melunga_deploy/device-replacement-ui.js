(function () {
  'use strict';

  var copy = {
    fr: {
      replace: 'Remplacer l’ancien appareil',
      sending: 'Envoi du code…',
      title: 'Confirmer le nouvel appareil',
      intro: 'Un code à 6 chiffres vient d’être envoyé à votre adresse e-mail.',
      code: 'Code de confirmation',
      confirm: 'Confirmer le remplacement',
      cancel: 'Annuler',
      invalid: 'Le code est incorrect ou expiré.',
      requestError: 'Le code n’a pas pu être envoyé. Réessayez dans un instant.'
    },
    en: {
      replace: 'Replace the previous device',
      sending: 'Sending code…',
      title: 'Confirm the new device',
      intro: 'A 6-digit code has been sent to your email address.',
      code: 'Confirmation code',
      confirm: 'Confirm replacement',
      cancel: 'Cancel',
      invalid: 'The code is incorrect or has expired.',
      requestError: 'The code could not be sent. Please try again.'
    },
    es: {
      replace: 'Reemplazar el dispositivo anterior',
      sending: 'Enviando código…',
      title: 'Confirmar el nuevo dispositivo',
      intro: 'Se ha enviado un código de 6 cifras a tu correo electrónico.',
      code: 'Código de confirmación',
      confirm: 'Confirmar sustitución',
      cancel: 'Cancelar',
      invalid: 'El código es incorrecto o ha caducado.',
      requestError: 'No se pudo enviar el código. Inténtalo de nuevo.'
    },
    it: {
      replace: 'Sostituisci il dispositivo precedente',
      sending: 'Invio del codice…',
      title: 'Conferma il nuovo dispositivo',
      intro: 'Un codice di 6 cifre è stato inviato al tuo indirizzo e-mail.',
      code: 'Codice di conferma',
      confirm: 'Conferma sostituzione',
      cancel: 'Annulla',
      invalid: 'Il codice non è corretto o è scaduto.',
      requestError: 'Non è stato possibile inviare il codice. Riprova.'
    },
    zh: {
      replace: '更换原有设备',
      sending: '正在发送验证码…',
      title: '确认新设备',
      intro: '6 位验证码已发送到您的电子邮箱。',
      code: '验证码',
      confirm: '确认更换',
      cancel: '取消',
      invalid: '验证码错误或已过期。',
      requestError: '验证码发送失败，请稍后重试。'
    },
    ja: {
      replace: '以前の端末を置き換える',
      sending: 'コードを送信中…',
      title: '新しい端末を確認',
      intro: '6桁のコードをメールアドレスへ送信しました。',
      code: '確認コード',
      confirm: '端末を置き換える',
      cancel: 'キャンセル',
      invalid: 'コードが正しくないか、有効期限が切れています。',
      requestError: 'コードを送信できませんでした。もう一度お試しください。'
    }
  };

  function textFor(language) {
    return copy[language] || copy.fr;
  }

  function button(label) {
    var element = document.createElement('button');
    element.type = 'button';
    element.textContent = label;
    element.style.cssText = [
      'border:0',
      'border-radius:12px',
      'padding:11px 16px',
      'font:inherit',
      'font-weight:700',
      'cursor:pointer',
      'background:#23262b',
      'color:#fff'
    ].join(';');
    return element;
  }

  function showCodeDialog(options, strings) {
    var overlay = document.createElement('div');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.style.cssText = [
      'position:fixed',
      'inset:0',
      'z-index:2147483000',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'padding:20px',
      'background:rgba(20,20,20,.55)'
    ].join(';');

    var panel = document.createElement('div');
    panel.style.cssText = [
      'width:min(430px,100%)',
      'border-radius:20px',
      'padding:24px',
      'background:#fff',
      'color:#23262b',
      'box-shadow:0 24px 80px rgba(0,0,0,.28)'
    ].join(';');

    var title = document.createElement('h2');
    title.textContent = strings.title;
    title.style.cssText = 'margin:0 0 10px;font-size:22px';

    var intro = document.createElement('p');
    intro.textContent = strings.intro;
    intro.style.cssText = 'margin:0 0 18px;line-height:1.45';

    var input = document.createElement('input');
    input.type = 'text';
    input.inputMode = 'numeric';
    input.autocomplete = 'one-time-code';
    input.maxLength = 6;
    input.placeholder = strings.code;
    input.setAttribute('aria-label', strings.code);
    input.style.cssText = [
      'box-sizing:border-box',
      'width:100%',
      'border:2px solid #ddd3c5',
      'border-radius:12px',
      'padding:13px',
      'font:700 24px/1.1 monospace',
      'letter-spacing:6px',
      'text-align:center'
    ].join(';');

    var error = document.createElement('p');
    error.style.cssText = 'min-height:22px;margin:10px 0;color:#b42318;font-weight:600';

    var actions = document.createElement('div');
    actions.style.cssText = 'display:flex;gap:10px;justify-content:flex-end';

    var cancel = button(strings.cancel);
    cancel.style.background = '#e9e3da';
    cancel.style.color = '#23262b';
    var confirm = button(strings.confirm);

    cancel.addEventListener('click', function () {
      overlay.remove();
    });
    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) overlay.remove();
    });

    confirm.addEventListener('click', async function () {
      var code = input.value.replace(/\D/g, '').slice(0, 6);
      if (code.length !== 6) {
        error.textContent = strings.invalid;
        input.focus();
        return;
      }

      confirm.disabled = true;
      error.textContent = '';
      try {
        var response = await fetch('/.netlify/functions/confirm-device-replacement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: options.email,
            device_id: options.deviceId,
            device_type: options.deviceType,
            code: code
          })
        });
        var data = await response.json();
        if (!data || !data.success) throw new Error(data && data.error);

        overlay.remove();
        options.onSuccess(data);
      } catch (_) {
        confirm.disabled = false;
        error.textContent = strings.invalid;
        input.select();
      }
    });

    actions.append(cancel, confirm);
    panel.append(title, intro, input, error, actions);
    overlay.append(panel);
    document.body.append(overlay);
    setTimeout(function () { input.focus(); }, 0);
  }

  function offer(options) {
    if (!options || !options.container || options.container.querySelector('[data-device-replacement]')) {
      return;
    }

    var strings = textFor(options.language);
    var replaceButton = button(strings.replace);
    replaceButton.dataset.deviceReplacement = 'true';
    replaceButton.style.marginTop = '12px';

    replaceButton.addEventListener('click', async function () {
      replaceButton.disabled = true;
      replaceButton.textContent = strings.sending;

      try {
        var response = await fetch('/.netlify/functions/request-device-replacement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: options.email,
            password: options.password,
            device_id: options.deviceId,
            device_type: options.deviceType,
            device_label: options.deviceLabel,
            language: options.language
          })
        });
        var data = await response.json();
        if (!data || !data.success) throw new Error(data && data.error);

        replaceButton.textContent = strings.replace;
        replaceButton.disabled = false;
        showCodeDialog(options, strings);
      } catch (_) {
        replaceButton.textContent = strings.replace;
        replaceButton.disabled = false;
        alert(strings.requestError);
      }
    });

    options.container.append(document.createElement('br'), replaceButton);
  }

  window.MelungaDeviceReplacement = { offer: offer };
})();
