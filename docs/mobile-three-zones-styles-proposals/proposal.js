/* Review-only adapter. Original controls, labels and lesson handlers remain in place. */
(() => {
  'use strict';
  window.MelungaActionStyleProposal = {
    apply(option) {
      if (![1,2,3,4].includes(option) || innerWidth > 760) throw new Error('Unknown action-button style');
      document.body.dataset.actionStyle=String(option);
      window.MelungaDesktopCourse.refresh();
      window.dispatchEvent(new Event('resize'));
    }
  };
})();
