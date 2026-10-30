/* German presentation for the validated modern course account entry.
 * The bundled classic lesson remains on its supported French native deck. */
(function () {
  'use strict';
  var query = new URLSearchParams(location.search);
  var login = query.get('login') === '1';
  var checkout = ['monthly', 'annual'].includes(query.get('checkout'));
  if (login === checkout || login && query.has('checkout') || checkout && query.has('login')
      || ['login','checkout','lang','study','courseReturn','courseLevel','classic'].some(function (key) { return query.getAll(key).length > 1; })
      || query.get('classic') === '1' || typeof window.validateCourseReturn !== 'function') return;
  var approved = window.approvedCourseReturn;
  approved = approved && window.validateCourseReturn(approved.pair, approved.level,
    approved.nativeLanguage, approved.studyLanguage);
  if (!approved || approved.nativeLanguage !== 'de') return;

  var copy = {
    pwTitle: 'Vollständigen Zugang freischalten',
    pwDesc: 'L1 · dauerhaft kostenlos<br>Alle Inhalte von L2 bis L10 freischalten.<br>Einmalige Zahlung, ohne automatische Verlängerung.',
    pwFree: '✓ Sichere Zahlung',
    pwMonthlyLabel: '/ 30 Tage',
    pwAnnualLabel: '/ Jahr',
    pwSaveBadge: '58 % sparen',
    pwTabNew: 'Konto erstellen',
    pwTabExisting: 'Anmelden',
    emailRequired: 'Bitte gib deine E-Mail-Adresse ein.',
    passwordTooShort: 'Dein Passwort muss mindestens 6 Zeichen lang sein.',
    passwordRequired: 'Bitte gib dein Passwort ein.',
    passwordMismatch: 'Die Passwörter stimmen nicht überein.',
    passwordPh: 'Passwort',
    passwordPh2: 'Passwort bestätigen',
    emailTaken: 'Diese E-Mail-Adresse wird bereits verwendet.',
    loginError: 'E-Mail-Adresse oder Passwort ist falsch.',
    loginBtn: 'Anmelden',
    subExpired: 'Dein Zugang ist abgelaufen. Bitte verlängere ihn.',
    unlockError: 'Ein Fehler ist aufgetreten. Versuch es noch einmal.',
    footTerms: 'Nutzungsbedingungen',
    footPrivacy: 'Datenschutz',
    footContact: 'Kontakt'
  };
  var translate = window.T;
  window.T = function (key) {
    return Object.prototype.hasOwnProperty.call(copy, key) ? copy[key] : translate.apply(this, arguments);
  };

  function setText(id, value, html) {
    var node = document.getElementById(id);
    if (node && node[html ? 'innerHTML' : 'textContent'] !== value) node[html ? 'innerHTML' : 'textContent'] = value;
  }
  function refresh() {
    document.documentElement.lang = 'de';
    var panel = document.getElementById('paywall');
    if (!panel) return;
    panel.lang = 'de';
    var existing = document.getElementById('pwTabExisting').classList.contains('on');
    setText('pwTitle', existing ? 'Anmelden' : panel.dataset.accountEntry === 'menu' ? 'Konto erstellen' : copy.pwTitle);
    ['pwDesc','pwMonthlyLabel','pwAnnualLabel','pwSaveBadge'].forEach(function (key) { setText(key, copy[key], key === 'pwDesc'); });
    setText('pwTabNewTxt', copy.pwTabNew);
    setText('pwTabExistingTxt', copy.pwTabExisting);
    setText('pwLoginBtnTxt', copy.loginBtn);
    [['pwEmail','E-Mail-Adresse'],['pwLoginEmail','E-Mail-Adresse'],['pwPassword',copy.passwordPh],
      ['pwLoginPassword',copy.passwordPh],['pwPassword2',copy.passwordPh2]].forEach(function (item) {
      var input = document.getElementById(item[0]);
      if (input) { input.placeholder = item[1]; input.setAttribute('aria-label', item[1]); }
    });
    document.getElementById('pwClose').setAttribute('aria-label', 'Schließen');
  }
  window.MelungaGermanAccountUI = Object.freeze({active: true, locale: 'de', refresh: refresh});
  // The classic data model has no German native meanings. Its hidden underlay
  // uses French while the immutable approved return continues to name de-*.
  window.nat = 'fr';
  ['applyNat', 'setLang', 'pwSwitchTab'].forEach(function (name) {
    var original = window[name];
    if (typeof original !== 'function') return;
    window[name] = function () { var result = original.apply(this, arguments); refresh(); return result; };
  });
  var setSite = window.wlcSetSite;
  window.wlcSetSite = function (locale) {
    var result = setSite.call(this, locale === 'de' ? 'fr' : locale);
    refresh();
    return result;
  };

  // Existing device-confirmation dialogs keep their account logic and requests.
  // Translate only their own fixed UI text, never user input or server payloads.
  var messages = {
    'Remplacer l’ancien appareil': 'Vorheriges Gerät ersetzen',
    'Envoi du code…': 'Code wird gesendet…',
    'Confirmer le nouvel appareil': 'Neues Gerät bestätigen',
    'Un code à 6 chiffres vient d’être envoyé à votre adresse e-mail.': 'Ein sechsstelliger Code wurde an deine E-Mail-Adresse gesendet.',
    'Code de confirmation': 'Bestätigungscode',
    'Confirmer le remplacement': 'Gerätewechsel bestätigen',
    'Annuler': 'Abbrechen',
    'Le code est incorrect ou expiré.': 'Der Code ist falsch oder abgelaufen.',
    'Le code n’a pas pu être envoyé. Réessayez dans un instant.': 'Der Code konnte nicht gesendet werden. Versuch es gleich noch einmal.',
    'Chargement plus long que prévu · Réessayer': 'Das Laden dauert länger als erwartet · Noch einmal versuchen'
  };
  Object.keys(copy).forEach(function (key) {
    if (window.UI?.fr?.[key] && !/<[^>]+>/.test(window.UI.fr[key])) messages[window.UI.fr[key]] = copy[key];
  });
  var showAlert = window.alert;
  window.alert = function (message) {
    return showAlert.call(window, Object.prototype.hasOwnProperty.call(messages, message) ? messages[message] : message);
  };
  function translateMessages() {
    document.querySelectorAll('#paywall,#bootCover,body > [role="dialog"][aria-modal="true"]').forEach(function (root) {
      var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      var node;
      while ((node = walker.nextNode())) if (Object.prototype.hasOwnProperty.call(messages, node.nodeValue)) node.nodeValue = messages[node.nodeValue];
      root.querySelectorAll('[placeholder],[aria-label]').forEach(function (input) {
        ['placeholder','aria-label'].forEach(function (attribute) {
          var value = input.getAttribute(attribute);
          if (Object.prototype.hasOwnProperty.call(messages, value)) input.setAttribute(attribute, messages[value]);
        });
      });
    });
  }
  new MutationObserver(translateMessages).observe(document.body, {childList: true, characterData: true, subtree: true});
  refresh();
  translateMessages();
})();
