/* Local review adapter. No controller, content, audio or navigation changes. */
(() => {
  'use strict';
  let group;
  window.MelungaPhotoProposal = {
    apply(option) {
      if (![1, 2, 3].includes(option)) throw new Error('Unknown photo proposal');
      if (innerWidth > 1100) throw new Error('Mobile presentation only');
      const selected = window.MelungaMockup.state();
      const tile = [...document.querySelectorAll('#mgThemeGrid .mg-theme')]
        .find(node => node.dataset.themeId === selected.themeId);
      const source = tile?.querySelector('.mg-theme-photo');
      if (!source) throw new Error('The selected theme has no source thumbnail');
      const label = document.getElementById('mgLessonTheme');
      if (group) group.replaceWith(label);
      const copy = source.cloneNode(true);
      const image = copy.querySelector('img');
      image.loading = 'eager';
      image.alt = '';
      copy.setAttribute('aria-hidden', 'true');
      group = document.createElement('span');
      group.className = 'mg-proposal-theme';
      label.before(group);
      group.append(copy, label);
      document.body.dataset.photoProposal = String(option);
      return {option, themeId:selected.themeId, photoId:copy.dataset.themePhoto};
    }
  };
})();
