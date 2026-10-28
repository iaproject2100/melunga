/* Local capture adapter. The existing dock measures its new height itself. */
(() => {
  'use strict';
  window.MelungaCompactDockProposal = {
    apply(option) {
      if (![1,2,3,4].includes(option) || innerWidth>760) throw new Error('Unknown compact mobile proposal');
      document.body.dataset.compactProposal=String(option);
      window.MelungaDesktopCourse.refresh();
      window.dispatchEvent(new Event('resize'));
    }
  };
})();
