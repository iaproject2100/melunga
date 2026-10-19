(function () {
  'use strict';

  var query = new URLSearchParams(window.location.search);
  var nativeLanguage = query.get('lang') || 'fr';
  var studyLanguage = query.get('study') || '';
  var wantsLogin = query.get('login') === '1';
  var comesFromMobileEntry = wantsLogin || query.get('start') === '1' || query.has('checkout');

  if (!comesFromMobileEntry) return;

  function removeBootCover() {
    try {
      if (window.__removeBootCover) window.__removeBootCover();
    } catch (_error) {}
  }

  window.addEventListener('load', function () {
    if (wantsLogin) {
      window.setTimeout(function () {
        try {
          if (typeof window.wlcSetSite === 'function') window.wlcSetSite(nativeLanguage);
          if (typeof window.wlcLogin === 'function') window.wlcLogin();
        } catch (_error) {}
        removeBootCover();
      }, 350);
      return;
    }

    if (studyLanguage && studyLanguage !== nativeLanguage) {
      window.setTimeout(function () {
        try {
          // setLang resets the lesson and hides its paywall. Preserve an open checkout.
          var paywall = document.getElementById('paywall');
          var checkoutWasOpen = paywall && paywall.style.display === 'block';
          if (typeof window.setLang === 'function') window.setLang(studyLanguage);
          if (checkoutWasOpen && typeof window.showPaywall === 'function') window.showPaywall();
        } catch (_error) {}
      }, 700);
    }
  });
})();
