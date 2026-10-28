/* Isolated appearance proposal, never imported by the application. */
(() => {
  const variant = String(window.__roundGlassVariant || '1');
  if (!['1', '2', '3', '4'].includes(variant)) throw new Error('Unknown glass proposal');
  document.body.dataset.roundGlass = variant;
  // Captions remain available to assistive technology when visually hidden.
  for (const node of document.querySelectorAll('.mg-mobile-dock button,#mgBack,#mgReadingToggle')) {
    if (!node.hasAttribute('aria-label')) {
      const label = node.title || node.textContent.trim();
      if (label) node.setAttribute('aria-label', label);
    }
  }
})();
