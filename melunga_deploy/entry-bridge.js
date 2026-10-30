(function () {
  'use strict';

  var query = new URLSearchParams(window.location.search);
  var nativeLanguage = query.get('lang') || 'fr';
  var studyLanguage = query.get('study') || '';
  var wantsLogin = query.get('login') === '1';
  var comesFromMobileEntry = wantsLogin || query.get('start') === '1' || query.has('checkout');

  if (!comesFromMobileEntry || window.__courseStartRedirecting) return;

  function removeBootCover() {
    try {
      if (window.__removeBootCover) window.__removeBootCover();
    } catch (_error) {}
  }

  if (wantsLogin) {
    function openLogin() {
      try {
        var approved = window.approvedCourseReturn;
        approved = approved && typeof window.validateCourseReturn === 'function'
          ? window.validateCourseReturn(approved.pair, approved.level, approved.nativeLanguage, approved.studyLanguage) : null;
        if (approved) nativeLanguage = approved.nativeLanguage;
        if (!Object.prototype.hasOwnProperty.call(window.WLC_I18N || {}, nativeLanguage)) nativeLanguage = 'fr';
        if (typeof window.wlcSetSite === 'function') window.wlcSetSite(nativeLanguage);
        if (typeof window.wlcLogin !== 'function') return;
        if (approved) window.wlcLogin(approved.studyLanguage);
        else window.wlcLogin();
        var panel = document.getElementById('paywall');
        if (!panel || panel.style.display !== 'block') return;
        window.__loginEntryReady = true;
        removeBootCover();
      } catch (_error) {}
    }
    // All lesson/account scripts are parsed at this point; images and fonts
    // must not delay access to the form or reveal another welcome screen.
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', openLogin, { once: true });
    else openLogin();
    return;
  }

  window.addEventListener('load', function () {
    if (studyLanguage && studyLanguage !== nativeLanguage
        && Object.prototype.hasOwnProperty.call(window.DECKS || {}, studyLanguage)) {
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
