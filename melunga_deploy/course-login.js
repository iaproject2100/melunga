/* Presentation only for the existing account form reached from the course. */
(function () {
  'use strict';
  var query = new URLSearchParams(location.search);
  var wantsLogin = query.get('login') === '1';
  var wantsCheckout = ['monthly', 'annual'].includes(query.get('checkout'));
  if (wantsLogin === wantsCheckout || wantsLogin && query.has('checkout') || wantsCheckout && query.has('login')
      || ['login','checkout','lang','study','courseReturn','courseLevel'].some(function (key) {return query.getAll(key).length > 1;})
      || !query.has('courseReturn') || query.getAll('courseReturn').length !== 1
      || query.get('classic') === '1') return;
  var approved = window.approvedCourseReturn;
  if (!approved || typeof window.validateCourseReturn !== 'function'
      || typeof window.courseReturnIsNative !== 'function' || window.courseReturnIsNative()) return;
  approved = window.validateCourseReturn(approved.pair, approved.level,
    approved.nativeLanguage, approved.studyLanguage);
  var panel = document.getElementById('paywall');
  if (!approved || !panel || !document.getElementById('accountBackdrop')) return;

  var target = 'parcours-niveaux.html?' + new URLSearchParams({
    pair: approved.pair, level: String(approved.level)
  });
  var ambience = 'dusk';
  try {
    var saved = localStorage.getItem('melunga-course-ambience') || sessionStorage.getItem('melunga-course-ambience');
    if (['ocean', 'aurora', 'dusk'].indexOf(saved) >= 0) ambience = saved;
  } catch (_) { /* A missing preference uses the normal course background. */ }
  document.documentElement.classList.add('course-login');
  document.body.classList.add('course-login');
  document.body.dataset.courseAmbience = ambience;

  // The form lives inside the classic lesson. Mark only siblings along its
  // ancestor path, so no hidden ancestor can also hide the form or a new dialog.
  var branch = panel;
  while (branch.parentElement) {
    Array.from(branch.parentElement.children).forEach(function (sibling) {
      if (sibling === branch || /^(SCRIPT|STYLE|LINK)$/.test(sibling.tagName)
          || sibling.id === 'accountBackdrop' || sibling.id === 'bootCover') return;
      sibling.setAttribute('data-course-login-chrome', '');
    });
    branch = branch.parentElement;
    if (branch === document.body) break;
  }

  var cancel = document.createElement('button');
  cancel.id = 'courseLoginBack';
  cancel.type = 'button';
  var backLabels = {
    fr: 'Retour aux thèmes', en: 'Back to topics', de: 'Zurück zu den Themen', es: 'Volver a los temas',
    it: 'Torna ai temi', zh: '返回主题', ja: 'テーマに戻る', ko: '주제로 돌아가기', ru: "Вернуться к темам", pt: "Voltar aos temas", ar: "العودة إلى المواضيع", hi: "विषयों पर वापस जाएँ"
  };
  cancel.textContent = backLabels[approved.nativeLanguage];
  panel.appendChild(cancel);

  function isAccountFrontmost() {
    if (panel.style.display !== 'block') return false;
    var other = Array.from(document.querySelectorAll('[role="dialog"][aria-modal="true"]')).some(function (dialog) {
      return dialog !== panel && !panel.contains(dialog) && !dialog.closest('[inert]')
        && dialog.getClientRects().length && getComputedStyle(dialog).visibility !== 'hidden'
        && Number(getComputedStyle(dialog).zIndex) > Number(getComputedStyle(panel).zIndex);
    });
    return !other;
  }
  function returnToCourse(event) {
    if (!isAccountFrontmost()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    location.replace(target);
  }
  // Explicit cancellation only. Hiding the form also occurs during successful
  // authentication, billing and device replacement; those flows stay untouched.
  window.addEventListener('click', function (event) {
    var node = event.target;
    if (node && (node.id === 'accountBackdrop' || node.closest?.('#pwClose,#courseLoginBack'))) returnToCourse(event);
  }, true);
  window.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') returnToCourse(event);
  }, true);
})();
