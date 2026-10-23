(function () {
  'use strict';
  function enter() {
    var query = new URLSearchParams(window.location.search);
    // Account and checkout links keep their existing destination. The library
    // is always reachable via the explicit card-library menu item.
    if (query.get('login') === '1' || query.has('checkout') || query.get('library') === '1') return;
    if (typeof window.curriculumAvailable === 'function' && window.curriculumAvailable() && window.mode === 'all') {
      window.setMode('path', null);
    }
  }
  if (document.readyState === 'complete') enter();
  else window.addEventListener('load', enter, {once:true});
})();
