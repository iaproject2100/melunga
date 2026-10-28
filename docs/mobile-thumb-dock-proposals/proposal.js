/* Local visual review: relocate the four original controls and keep their listeners. */
(() => {
  'use strict';
  let nav;
  window.MelungaThumbProposal = {
    apply(option) {
      if (![1,2,3,4].includes(option) || innerWidth > 760) throw new Error('Unknown mobile dock');
      if (!nav) {
        nav = document.createElement('nav');
        nav.className = 'thumb-nav';
        nav.setAttribute('aria-label', 'Commandes du parcours');
        for (const [id,label] of [['mgLevelTrigger','Niveau'],['mgLanguageTrigger','Langue'],['mgPalette','Couleur'],['mgMenuTrigger','Menu']]) {
          const button = document.getElementById(id);
          const icon = document.createElement('span');
          icon.className = 'thumb-icon';
          icon.setAttribute('aria-hidden','true');
          icon.append(...button.childNodes);
          const caption = document.createElement('span');
          caption.className = 'thumb-label';
          caption.textContent = label;
          button.replaceChildren(icon,caption);
          button.classList.add('thumb-control');
          nav.append(button);
        }
        document.querySelector('.mg-app').append(nav);
      }
      document.body.dataset.thumbProposal = String(option);
      window.dispatchEvent(new Event('resize'));
    }
  };
})();
