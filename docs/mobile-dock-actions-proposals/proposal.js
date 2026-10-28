/* Review-only extension of the chosen translucent dock; keep the real action listeners. */
(() => {
  'use strict';
  let applied = false;
  window.MelungaDockActionsProposal = {
    apply(variant) {
      if (!['reference','a','b','c'].includes(variant) || applied) throw new Error('Apply one mobile dock proposal per page');
      applied = true;
      window.MelungaThumbProposal.apply(2);
      const nextText = document.getElementById('mgContinueText');
      const labelNext = () => {if (nextText.textContent !== 'Suivant') nextText.textContent = 'Suivant';};
      labelNext();
      new MutationObserver(labelNext).observe(nextText,{childList:true,characterData:true,subtree:true});
      document.body.dataset.actionsProposal = variant;
      if (variant !== 'reference') {
        const nav = document.querySelector('.thumb-nav');
        const settings = document.createElement('div');
        settings.className = 'dock-settings';
        settings.append(...nav.children);
        const actions = document.createElement('div');
        actions.className = 'dock-actions';
        for (const id of ['mgReplay','mgContinue']) {
          const button = document.getElementById(id);
          const caption = button.querySelector('span');
          const icon = document.createElement('span');
          icon.className = 'thumb-icon';
          icon.setAttribute('aria-hidden','true');
          icon.append(button.querySelector('svg'));
          caption.classList.add('thumb-label');
          button.replaceChildren(icon,caption);
          button.classList.add('thumb-control','dock-action');
          actions.append(button);
        }
        nav.append(settings,actions);
      }
      window.dispatchEvent(new Event('resize'));
    }
  };
})();
