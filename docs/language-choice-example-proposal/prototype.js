/* Isolated presentation proposal; not loaded by the product. */
(() => {
  const screen = document.querySelector('[data-screen="language"]');
  const example = document.querySelector('[data-screen="welcome"] [data-go="method"]').cloneNode(true);
  example.classList.add('language-example-proposal');
  screen.append(example);
})();
