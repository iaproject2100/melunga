/* Visual review adapter. No duplicate buttons or changes to the lesson controller. */
(() => {
  'use strict';
  window.MelungaBandProposal = {
    apply(option) {
      if (![1,2,3,4].includes(option) || innerWidth > 760) throw new Error('Unknown mobile band');
      document.body.dataset.bandProposal=String(option);
      window.MelungaDesktopCourse.refresh();
      window.dispatchEvent(new Event('resize'));
    }
  };
})();
