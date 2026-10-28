/* Capture adapter only; the real dock recalculates its reserved height. */
(() => {
  'use strict';
  window.MelungaTightDockProposal = {
    apply(option) {
      if (![1,2,3,4].includes(option) || innerWidth>760) throw new Error('Unknown mobile dock layout');
      document.body.dataset.tightProposal=String(option);
      window.MelungaDesktopCourse.refresh();
      window.dispatchEvent(new Event('resize'));
    }
  };
})();
