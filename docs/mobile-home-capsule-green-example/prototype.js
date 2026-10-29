/* Presentation-only proposal: loaded by the local capture harness, never by
 * the application. Original trial, language, example and login nodes move with
 * their existing delegated handlers. No account is created by this script. */
(function () {
  'use strict';
  const variant = String(window.__homeCapsuleVariant || '4');
  if (!['1', '2', '3', '4'].includes(variant)) throw new Error('Unknown proposal');
  const welcome = document.querySelector('[data-screen="welcome"]');
  const trial = welcome.querySelector('[data-select-access="free"]');
  const language = welcome.querySelector('[data-open-app-language]');
  const example = welcome.querySelector('[data-go="method"]');
  const login = welcome.querySelector('[data-go="signin"]');
  const before = {trial, language, example, login};
  document.documentElement.dataset.homeCapsuleProposal = variant;
  welcome.classList.add('hc-welcome');

  const bottom = document.createElement('div');
  bottom.className = 'hc-bottom';
  const capsules = document.createElement('nav');
  capsules.className = 'hc-capsules';
  capsules.setAttribute('aria-label', 'Commencer avec Melunga');
  const account = document.createElement('button');
  account.type = 'button';
  account.dataset.go = 'signup';
  account.className = 'hc-account';
  account.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="10" cy="7.5" r="3.5"/><path d="M3 21v-2a7 7 0 0 1 11-5.7M19 13v8m-4-4h8"/></svg><span></span>';
  trial.classList.add('hc-trial');
  language.classList.add('hc-language');
  example.classList.add('hc-example');
  login.classList.add('hc-link');
  capsules.append(trial, account, language);
  if (variant === '3') capsules.prepend(language);
  const secondary = document.createElement('div');
  secondary.className = 'hc-secondary';
  secondary.append(login);
  bottom.append(example, capsules, secondary);
  welcome.append(bottom);
  welcome.querySelector('.topline').remove();
  welcome.querySelector('.cta-stack').remove();

  const copy = {
    fr: ['Créer un compte', 'Se connecter', 'Commencer avec Melunga'],
    en: ['Create an account', 'Sign in', 'Start with Melunga'],
    es: ['Crear una cuenta', 'Iniciar sesión', 'Empezar con Melunga'],
    zh: ['创建账户', '登录', '开始使用 Melunga'],
    it: ['Crea un account', 'Accedi', 'Inizia con Melunga'],
    ja: ['アカウントを作成', 'ログイン', 'Melungaを始める'],
    ko: ['계정 만들기', '로그인', 'Melunga 시작하기']
  };
  function labels() {
    const text = copy[document.documentElement.lang] || copy.fr;
    account.querySelector('span').textContent = text[0];
    // Retain the original login node and destination, with a shorter label.
    login.textContent = text[1];
    capsules.setAttribute('aria-label', text[2]);
  }
  labels();
  new MutationObserver(labels).observe(document.documentElement, {attributes: true, attributeFilter: ['lang']});
  window.__homeCapsuleProposal = {variant, originalNodes: before, account, bottom};
})();
