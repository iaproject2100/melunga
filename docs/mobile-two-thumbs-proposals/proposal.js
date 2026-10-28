/* Review-only presentation adapter; original controls and lesson handlers are retained. */
(() => {
  'use strict';
  window.MelungaThumbsProposal = {
    apply(option) {
      if (![1,2,3,4].includes(option) || innerWidth > 760) throw new Error('Unknown two-thumb proposal');
      document.body.dataset.thumbsProposal=String(option);
      window.MelungaDesktopCourse.refresh();
      window.dispatchEvent(new Event('resize'));
    }
  };
})();
