/* Real homepage/carousel controls, with local files and explicit API fixtures.
 * Audio is an in-memory event stub: no voice is fetched, decoded or heard.
 * Chromium viewport/touch emulation does not establish phone/Safari behavior. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {test, before, after} = require('node:test');
const {chromium} = require('playwright-core');
const ROOT = path.resolve(__dirname, '../..'), WEB = path.join(ROOT, 'melunga_deploy');
const ORIGIN = 'https://proof-localization.test';
const LANGUAGES = ['fr', 'en', 'es', 'zh', 'it', 'ja', 'ko'];
const ANDROID = 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36';
const reportFile = process.env.PROOF_LOCALIZATION_REPORT || '/tmp/melunga-proof-localization-browser.json';
const captureDir = process.env.PROOF_LOCALIZATION_CAPTURES || '/tmp/melunga-proof-localization-browser';
const read = file => fs.readFileSync(path.join(WEB, file));
const json = file => JSON.parse(read(file));
const dictionaries = Object.fromEntries(LANGUAGES.filter(l => l !== 'fr').map(l => [l, json('content/course-locales/' + l + '.json')]));
const supplements = json('content/course-locales/supplements.json');
const translated = (locale, key) => locale === 'fr' ? key : supplements[locale]?.[key] ?? dictionaries[locale].ui[key] ?? key;
const plain = value => value.replace(/<br\s*\/?>/gi, '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
const HERO = {fr: 'La preuveMelunga', en: 'The Melunga demonstration', es: 'La pruebaMelunga', zh: '亲自验证Melunga', it: 'La provaMelunga', ja: '体験でわかるMelunga', ko: '직접 확인하는 Melunga'};
const EXAMPLE_BUTTON = {fr: 'Voir un exemple', en: 'See an example', es: 'Ver un ejemplo', zh: '查看示例', it: 'Vedi un esempio', ja: '例を見る', ko: '예시 보기'};
const NEXT = ['Découvrir la preuve', 'J’ai lu la phonétique', 'Comprendre la méthode', 'Voir la progression', 'Créer mon compte'];
const SLIDES = [
  [['.proof-kicker', 'Découvre notre différence'], ['h2', 'La preuve<span>Melunga</span>'], ['p', 'Tu vas bien prononcer une phrase étrangère dès ta première lecture.']],
  [['.proof-kicker', '1 · Lis à voix haute'], ['h2', 'Lis uniquement cette phonétique.'], ['.accent-note', 'Les <strong>MAJUSCULES</strong> montrent l’accentuation.']],
  [['.proof-kicker', '2 · Écoute la voix native'], ['h2', 'Maintenant, compare.'], ['.proof-step > p', 'Tu vas entendre la phrase que tu viens de prononcer.']],
  [['.proof-kicker', 'La méthode Melunga'], ['h2', 'Une phrase apprise devient un modèle.'], [':scope > p', 'Tu n’étudies pas une règle isolée. Tu acquiers une structure que tu peux réutiliser.'],
    ['.method-flow-step:nth-child(1) strong', 'Écouter et imiter'], ['.method-flow-step:nth-child(1) span', 'Une phrase naturelle, avec sa voix et sa phonétique.'],
    ['.method-flow-step:nth-child(2) strong', 'Mémoriser la phrase complète'], ['.method-flow-step:nth-child(2) span', 'Le vocabulaire et la structure sont acquis ensemble.'],
    ['.method-flow-step:nth-child(3) strong', 'Remplacer et recombiner'], ['.method-flow-step:nth-child(3) span', 'Tu construis de nouvelles phrases avec les modèles acquis.']],
  [['.proof-kicker', 'Du simple au nuancé'], ['h2', 'Apprends comme on acquiert une langue.'], [':scope > p', 'La difficulté augmente progressivement, sans cours de grammaire séparé.'],
    ['.method-pillar:nth-child(1) strong', 'Des phrases utiles'], ['.method-pillar:nth-child(1) span', 'Des phrases complètes réellement utilisées dans la vie quotidienne.'],
    ['.method-pillar:nth-child(2) strong', 'Une phonétique native'], ['.method-pillar:nth-child(2) span', 'La prononciation est écrite avec les repères sonores de ta langue.'],
    ['.method-pillar:nth-child(3) strong', 'Une progression L1–L10'], ['.method-pillar:nth-child(3) span', 'La longueur, les structures et les nuances augmentent pas à pas.'],
    ['.method-signature', 'Écouter · Mémoriser · Recombiner']]
];
const REQUIRED = ['complete-dictionaries', 'seven-languages-five-slides', 'locale-switch-and-return', 'carousel-mobile-and-desktop-geometry', 'localized-audio-events', 'absent-and-old-i18n-module', 'initial-locale-precedence'];
const report = {status: 'running', environment: 'local Chromium desktop and Android user-agent/viewport/touch profiles', physicalDeviceTested: false, safariTested: false,
  allApiResponsesMocked: true, actualAudioPlayed: false, realAccountUsed: false, publicSiteOpened: false, checks: [], cases: [], errors: [], fixtureErrors: [], unexpected: [], api: [], screenshots: []};
const fingerprint = () => Object.fromEntries([__filename, ...['index.html', 'desktop-home.js', 'desktop-home.css', 'course-i18n.js', 'store-billing.js',
  ...fs.readdirSync(path.join(WEB, 'content/course-locales')).filter(n => n.endsWith('.json')).map(n => 'content/course-locales/' + n)].map(n => path.join(WEB, n))]
  .sort().map(file => [path.relative(ROOT, file), crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')]));
let browser, inputs;
const checked = async (name, fn) => {try {await fn(); report.checks.push(name);} catch (e) {report.errors.push(name + ': ' + e.message); throw e;}};
before(async () => {inputs = fingerprint(); fs.mkdirSync(captureDir, {recursive: true}); browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox']});});
after(async () => {
  await browser?.close(); report.inputsStable = JSON.stringify(inputs) === JSON.stringify(fingerprint()); report.inputSha256 = inputs;
  report.missingChecks = REQUIRED.filter(name => !report.checks.includes(name));
  report.status = report.inputsStable && !report.errors.length && !report.fixtureErrors.length && !report.unexpected.length && !report.missingChecks.length ? 'passed' : 'failed';
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2) + '\n');
  assert.equal(report.inputsStable, true, 'tested product stayed frozen'); assert.deepEqual(report.errors, []); assert.deepEqual(report.fixtureErrors, []);
  assert.deepEqual(report.unexpected, []); assert.deepEqual(report.missingChecks, []);
});
async function fixture({width = 390, height = 700, savedLocale = null, local = {}, query = '', i18n = 'current'} = {}) {
  const mobile = width < 960;
  const context = await browser.newContext({viewport: {width, height}, userAgent: mobile ? ANDROID : undefined, isMobile: mobile, hasTouch: mobile, reducedMotion: 'reduce', serviceWorkers: 'block'});
  const f = {context, closed: false, i18nRequests: 0};
  await context.addInitScript(({savedLocale, local}) => {
    if (savedLocale) localStorage.setItem('melunga-app-language', JSON.stringify({locale: savedLocale, label: savedLocale}));
    for (const [key, value] of Object.entries(local)) localStorage.setItem(key, value);
    window.__proofQA = {audio: [], pending: [], fail: false, speech: []};
    window.Audio = class extends EventTarget {
      constructor(src) {super(); this.src = src || ''; this.paused = true; this.currentTime = 0;}
      play() {this.paused = false; window.__proofQA.audio.push({src: this.src, kind: 'stub'}); const media = this;
        return new Promise((resolve, reject) => window.__proofQA.pending.push(() => {
          if (window.__proofQA.fail) {reject(new Error('Fixture: unavailable audio')); return;}
          if (!media.paused) {media.onplaying?.(new Event('playing')); media.dispatchEvent(new Event('playing'));} resolve();
        }));
      }
      pause() {this.paused = true;} load() {} removeAttribute(n) {if (n === 'src') this.src = '';}
    };
    window.SpeechSynthesisUtterance = class {constructor(text) {this.text = text;}};
    Object.defineProperty(window, 'speechSynthesis', {value: {cancel() {}, getVoices() {return [];}, speak(u) {window.__proofQA.speech.push(u.text); u.onerror?.(new Event('error'));}}});
  }, {savedLocale, local});
  await context.route('**/*', async route => {
    const request = route.request(), url = new URL(request.url());
    try {
      if (url.origin !== ORIGIN) {report.unexpected.push({origin: url.origin, path: url.pathname, method: request.method()}); return await route.abort();}
      if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/.netlify/functions/')) {
        const event = {path: url.pathname, method: request.method()}; report.api.push(event);
        if (request.method() === 'GET' && url.pathname === '/api/geolocation') return await route.fulfill({json: {country: 'FR'}});
        if (request.method() === 'GET' && url.pathname === '/.netlify/functions/get-pricing') return await route.fulfill({json: {country: 'FR', monthlyDisplay: '7,90 €', annualDisplay: '42 €'}});
        if (request.method() === 'GET' && url.pathname === '/.netlify/functions/check-status') return await route.fulfill({json: {paid: false}});
        // Shared voice selection preloads its catalogue; this carousel fixture
        // deliberately exercises an unavailable catalogue without any real TTS.
        if (request.method() === 'GET' && url.pathname === '/.netlify/functions/tts' && url.searchParams.get('catalog') === 'chirp3' && url.searchParams.get('selectionVersion') === 'kartech-2026-10-30-en-us') return await route.fulfill({status: 503, json: {error: 'Fixture: voice catalogue unavailable'}});
        report.unexpected.push(event); return await route.abort();
      }
      if (request.method() !== 'GET') {report.unexpected.push({path: url.pathname, method: request.method()}); return await route.abort();}
      if (url.pathname === '/course-i18n.js') {
        f.i18nRequests++;
        if (i18n === 'missing') return await route.fulfill({status: 503, contentType: 'text/javascript', body: '/* Deliberately unavailable localization module. */'});
        if (i18n === 'old') return await route.fulfill({contentType: 'text/javascript', body: 'window.MelungaCourseI18n = {t: function(locale, source) {return source;}, format: function() {return "";}, languageName: function(locale, code) {return code;}};'});
      }
      const file = path.resolve(WEB, decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname).slice(1));
      if (!file.startsWith(WEB + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {report.unexpected.push({missingFile: url.pathname}); return await route.fulfill({status: 404, body: 'Not found'});}
      return await route.fulfill({body: fs.readFileSync(file), contentType: ({'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml'})[path.extname(file)] || 'application/octet-stream'});
    } catch (e) {if (!f.closed) report.fixtureErrors.push(e.message);}
  });
  const page = f.page = await context.newPage(); page.setDefaultTimeout(7000); page.on('pageerror', e => report.errors.push(e.message));
  f.close = async () => {f.closed = true; await context.close();};
  await page.goto(ORIGIN + '/index.html?country=FR' + (query ? '&' + query : '')); await settled(page); return f;
}
async function settled(page) {await page.evaluate(() => new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done))));}
async function pickLocale(page, locale) {
  if (page.viewportSize().width >= 960) await page.locator('.dh-language').selectOption(locale);
  else {
    await page.locator('[data-open-app-language]').click(); await page.locator('#appLanguageMenu').waitFor({state: 'visible'});
    await page.locator('[data-app-language="' + locale + '"]').click(); await page.locator('#appLanguageMenu').waitFor({state: 'hidden'});
  }
  assert.equal(await page.locator('html').getAttribute('lang'), locale);
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('melunga-app-language')).locale), locale);
  assert.equal(await page.locator('[data-screen="welcome"] [data-go="method"]').textContent(), EXAMPLE_BUTTON[locale], 'homepage and proof must share the selected native language');
}
async function openProof(page) {
  const desktop = page.viewportSize().width >= 960, size = page.viewportSize();
  // Desktop homepage links to its method section. Enter through the genuine
  // mobile example button, then resize: never click hidden controls or call go().
  if (desktop) await page.setViewportSize({width: 390, height: 700});
  await page.locator('[data-screen="welcome"].active [data-go="method"]').click();
  await page.locator('[data-screen="method"].active').waitFor({state: 'visible'});
  if (desktop) await page.setViewportSize(size); await settled(page);
}
async function assertCommon(page, locale, index) {
  assert.equal(await page.locator('html').getAttribute('lang'), locale);
  assert.equal(await page.locator('.phone').getAttribute('aria-label'), 'Melunga', 'brand region has a neutral accessible name, without a French prototype label');
  const screen = page.locator('[data-screen="method"].active'); assert.equal(await screen.count(), 1);
  assert.equal(plain(await screen.locator('.proof-skip').textContent()), plain(translated(locale, 'PASSER')));
  assert.equal(await screen.locator('.proof-top [data-go="welcome"]').getAttribute('aria-label'), translated(locale, 'Retour'));
  assert.equal(await screen.locator('.proof-dots').getAttribute('aria-label'), translated(locale, 'Progression de la démonstration'));
  for (let i = 0; i < 5; i++) {
    const label = locale === 'fr' ? 'Page ' + (i + 1) : dictionaries[locale].formats.page.replace('{n}', String(i + 1));
    assert.equal(await screen.locator('[data-proof-dot="' + i + '"]').getAttribute('aria-label'), label);
  }
  assert.equal(await screen.locator('.proof-dot.active').getAttribute('data-proof-dot'), String(index));
  assert.equal(plain(await screen.locator('[data-proof-next]').textContent()), plain(translated(locale, NEXT[index])));
}
async function assertSlide(page, locale, index) {
  await assertCommon(page, locale, index);
  const slide = page.locator('.proof-slide').nth(index);
  for (const [selector, key] of SLIDES[index]) assert.equal(plain(await slide.locator(selector).textContent()), plain(translated(locale, key)), locale + ' slide ' + index + ' ' + key);
  if (index === 0) {
    assert.equal(plain(await slide.locator('h2').textContent()), HERO[locale], 'independent hero language marker');
    assert.equal(plain(await slide.locator('.swipe-hint').textContent()), plain(translated(locale, 'Glisse vers la gauche') + ' ←'));
    if (locale === 'en') {
      const words = await slide.locator('h2').evaluate(heading => {
        const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT), words = [];
        for (let node = walker.nextNode(); node; node = walker.nextNode()) for (const match of node.data.matchAll(/[A-Za-z]{5,}/g)) {
          const range = document.createRange(); range.setStart(node, match.index); range.setEnd(node, match.index + match[0].length);
          words.push({word: match[0], lines: range.getClientRects().length});
        }
        return words;
      });
      assert.ok(words.some(word => word.word.toLowerCase() === 'demonstration'), 'word-range check exercises the formerly broken English word');
      assert.ok(words.every(word => word.lines === 1), 'English hero words stay whole: ' + JSON.stringify(words));
    }
  }
  if (index === 1) {
    const key = locale === 'fr' ? 'Elle utilise les repères sonores de ta langue native.' : 'Cet exemple utilise une aide phonétique et une traduction françaises.';
    assert.equal(plain(await slide.locator('[data-proof-native-note]').textContent()), plain(translated(locale, key)));
    assert.equal(plain(await slide.locator('.proof-translation').textContent()), 'Je voudrais de l’eau.');
    assert.equal(plain(await slide.locator('.phon-demo').textContent()), 'aïe wouD laïkseum WÔ-teur');
  }
  if (index === 2) {
    assert.equal(plain(await slide.locator('.target-demo').textContent()), 'I would like some water.');
    assert.equal(plain(await slide.locator('[data-speak-demo]').textContent()), plain(translated(locale, '🔊 Écouter la voix native')));
  }
  return {locale, slide: index + 1, heading: plain(await slide.locator('h2').textContent()), next: plain(await page.locator('[data-proof-next]').textContent())};
}
async function shot(page, name) {const file = path.join(captureDir, name + '.png'); await page.screenshot({path: file, animations: 'disabled'}); report.screenshots.push(file);}
async function geometry(page, index) {
  await settled(page);
  await page.waitForFunction(index => Math.abs(document.querySelectorAll('.proof-slide')[index].getBoundingClientRect().left - document.getElementById('proofViewport').getBoundingClientRect().left) < 0.75, index);
  const g = await page.evaluate(index => {
    const rect = node => {const r = node.getBoundingClientRect(); return {top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height};};
    const slide = document.querySelectorAll('.proof-slide')[index], viewport = document.getElementById('proofViewport');
    return {width: innerWidth, height: innerHeight, docWidth: document.documentElement.scrollWidth, docHeight: document.documentElement.scrollHeight,
      slide: rect(slide), viewport: rect(viewport), footer: rect(document.querySelector('.proof-footer')), top: rect(document.querySelector('.proof-top')),
      next: rect(document.querySelector('[data-proof-next]')), slideX: slide.scrollWidth - slide.clientWidth,
      slideY: slide.scrollHeight - slide.clientHeight, overflowY: getComputedStyle(slide).overflowY,
      heading: rect(slide.querySelector('h2')), headingFont: parseFloat(getComputedStyle(slide.querySelector('h2')).fontSize)};
  }, index);
  assert.ok(g.docWidth <= g.width + 1, 'document has no horizontal overflow');
  assert.ok(g.docHeight <= g.height + 1, 'carousel fits viewport'); assert.ok(g.slideX <= 1, 'translated slide has no horizontal overflow');
  assert.ok(g.top.top >= -1 && g.top.bottom <= g.height + 1, 'back and skip region visible');
  assert.ok(g.next.top >= g.viewport.bottom - 1 && g.next.bottom <= g.height + 1 && g.next.height >= 44, 'next action stays visible outside any content scroll');
  assert.ok(g.slide.left >= g.viewport.left - 1 && g.slide.right <= g.viewport.right + 1, 'current slide is aligned, without stale carousel translation');
  assert.ok(g.headingFont >= 24 && g.heading.width > 100 && g.heading.height > 20, 'heading is styled and readable');
  if (g.slideY > 1) assert.ok(['auto', 'scroll'].includes(g.overflowY), 'tall translated content must remain scrollable rather than clipped');
  const last = await page.locator('.proof-slide').nth(index).evaluate(slide => {
    const targets = [...slide.querySelectorAll('p,h2,.phon-demo,.target-demo,button,.swipe-hint,.method-flow-step span,.method-pillar span,.method-signature')]
      .filter(node => node.getClientRects().length && getComputedStyle(node).display !== 'none');
    const node = targets.at(-1); slide.scrollTop = slide.scrollHeight;
    const r = node.getBoundingClientRect(), view = document.getElementById('proofViewport').getBoundingClientRect();
    const result = {text: node.textContent.trim(), top: r.top, bottom: r.bottom, viewTop: view.top, viewBottom: view.bottom, scrollTop: slide.scrollTop};
    slide.scrollTop = 0; return result;
  });
  assert.ok(last.top >= last.viewTop - 1 && last.bottom <= last.viewBottom + 1, 'last paragraph or action remains reachable in the slide');
  g.lastContent = last;
  return g;
}

async function audioScenario(page, locale) {
  const listen = page.locator('[data-speak-demo]'); await listen.click();
  assert.equal(plain(await listen.textContent()), plain(translated(locale, 'Chargement de la voix…'))); assert.equal(await listen.getAttribute('aria-busy'), 'true');
  await page.evaluate(() => window.__proofQA.pending.shift()()); await settled(page);
  assert.equal(plain(await listen.textContent()), plain(translated(locale, '🔊 Réécouter la voix native')));
  assert.equal(await listen.getAttribute('aria-busy'), null); assert.equal(await page.locator('#wowProof').isVisible(), true);
  assert.equal(plain(await page.locator('#wowProof').textContent()), plain(translated(locale, '✨ Tu l’avais déjà bien prononcée.<br>C’est la différence Melunga.')));
  await page.locator('[data-proof-dot="1"]').click(); await page.locator('[data-proof-next]').click(); await settled(page);
  assert.equal(plain(await listen.textContent()), plain(translated(locale, '🔊 Réécouter la voix native')), 'navigation must not restore initial French audio label');
  await page.evaluate(() => {window.__proofQA.fail = true;}); await listen.click(); await page.evaluate(() => window.__proofQA.pending.shift()()); await settled(page);
  assert.equal(plain(await listen.textContent()), plain(translated(locale, '🔊 Réessayer'))); assert.equal(await listen.getAttribute('aria-busy'), null);
  const events = await page.evaluate(() => ({audio: window.__proofQA.audio, speech: window.__proofQA.speech}));
  assert.equal(events.audio.length, 2); return events;
}

test('all proof instructions have complete translations in every course locale', () => checked('complete-dictionaries', async () => {
  const keys = [...new Set([...SLIDES.flatMap(slide => slide.map(([, key]) => key)), ...NEXT, 'Glisse vers la gauche', 'PASSER', 'Retour', 'Progression de la démonstration',
    'Cet exemple utilise une aide phonétique et une traduction françaises.', '🔊 Écouter la voix native', 'Chargement de la voix…', '🔊 Réécouter la voix native', '🔊 Réessayer', '✨ Tu l’avais déjà bien prononcée.<br>C’est la différence Melunga.'])];
  for (const locale of LANGUAGES.filter(l => l !== 'fr')) for (const key of keys) {
    const value = supplements[locale]?.[key] ?? dictionaries[locale].ui[key]; assert.equal(typeof value, 'string', locale + ' complete key ' + key);
    assert.ok(value.length > 0); assert.notEqual(value, key, locale + ' does not silently fall back to French');
  }
  report.cases.push({name: 'dictionary-coverage', locales: 6, translatedKeysPerLocale: keys.length});
}));

test('seven native languages selected through homepage buttons survive all five proof slides', () => checked('seven-languages-five-slides', async () => {
  for (const locale of LANGUAGES) {
    const f = await fixture(); try {
      const p = f.page; await pickLocale(p, locale); await openProof(p);
      assert.equal(f.i18nRequests, 1, 'the external localization request was actually intercepted');
      for (let index = 0; index < 5; index++) {
        report.cases.push({name: 'five-slide-content', ...await assertSlide(p, locale, index)});
        if (index === 2) assert.equal(plain(await p.locator('[data-speak-demo]').textContent()), plain(translated(locale, '🔊 Écouter la voix native')));
        if (index === 0 || index === 4 && ['en', 'zh'].includes(locale)) await shot(p, locale + '-slide-' + (index + 1) + '-390');
        await p.locator('[data-proof-next]').click(); await settled(p);
      }
      assert.equal(await p.locator('[data-screen="premium"].active').isVisible(), true);
      assert.equal(await p.locator('html').getAttribute('lang'), locale);
      assert.deepEqual(await p.evaluate(() => window.__proofQA.audio), []);
    } finally {await f.close();}
  }
}));

test('changing native language and returning through real controls cannot restore French copy', () => checked('locale-switch-and-return', async () => {
  const f = await fixture(); try {
    const p = f.page;
    for (const locale of ['en', 'zh', 'es', 'it', 'ja', 'ko', 'fr', 'en']) {
      await pickLocale(p, locale); await openProof(p); await assertSlide(p, locale, 0);
      await p.locator('[data-proof-dot="4"]').click(); await settled(p); await assertSlide(p, locale, 4);
      await p.locator('[data-proof-dot="1"]').click(); await settled(p); await assertSlide(p, locale, 1);
      await p.locator('.proof-top [data-go="welcome"]').click(); await p.locator('[data-screen="welcome"].active').waitFor();
      report.cases.push({name: 'locale-switch', locale});
    }
    await p.reload(); await openProof(p); await assertSlide(p, 'en', 0);
    await p.locator('.proof-skip').click(); await p.locator('[data-screen="premium"].active').waitFor();
    await p.locator('[data-screen="premium"] .back').click(); await assertSlide(p, 'en', 0);
    report.cases.push({name: 'saved-locale-reload-skip-back', locale: 'en'});
  } finally {await f.close();}
}));

test('translated carousel stays usable at 320, 390 and desktop widths', () => checked('carousel-mobile-and-desktop-geometry', async () => {
  for (const size of [{width: 320, height: 568}, {width: 390, height: 700}, {width: 1440, height: 900}]) {
    for (const locale of LANGUAGES) {
      const f = await fixture(size); try {
        const p = f.page; await pickLocale(p, locale); await openProof(p);
        for (let index = 0; index < 5; index++) {
          await assertSlide(p, locale, index); const bounds = await geometry(p, index);
          report.cases.push({name: 'geometry', locale, slide: index + 1, size, bounds});
          if (size.width === 320 && locale === 'en' && index === 3 || size.width === 1440 && locale === 'zh' && index === 0) await shot(p, locale + '-slide-' + (index + 1) + '-' + size.width);
          if (index < 4) {await p.locator('[data-proof-next]').click(); await settled(p);}
        }
      } finally {await f.close();}
    }
  }
}));

test('loading, replay, result and retry labels use the selected native language', () => checked('localized-audio-events', async () => {
  for (const locale of LANGUAGES) {
    const f = await fixture(); try {
      const p = f.page; await pickLocale(p, locale); await openProof(p); await p.locator('[data-proof-dot="2"]').click(); await settled(p);
      const events = await audioScenario(p, locale);
      report.cases.push({name: 'audio-ui-events', locale, media: 'stub only; no network or hearing', plays: 2, fallbackEvents: events.speech.length});
    } finally {await f.close();}
  }
}));

test('proof copy remains native when the external localization module fails or returns source text', () => checked('absent-and-old-i18n-module', async () => {
  for (const i18n of ['missing', 'old']) for (const locale of LANGUAGES) {
    const f = await fixture({i18n}); try {
      const p = f.page; await pickLocale(p, locale); await openProof(p);
      assert.equal(f.i18nRequests, 1, 'missing/old module fixture was exercised');
      for (let index = 0; index < 5; index++) {
        await assertSlide(p, locale, index); report.cases.push({name: 'external-module-fallback', module: i18n, locale, slide: index + 1});
        if (index === 2) {await audioScenario(p, locale); report.cases.push({name: 'audio-ui-events-with-module-fallback', module: i18n, locale, plays: 2, media: 'stub only'});}
        if (i18n === 'missing' && locale === 'ja' && index === 0) await shot(p, 'ja-slide-1-without-external-module-390');
        if (index < 4) {await p.locator('[data-proof-next]').click(); await settled(p);}
      }
    } finally {await f.close();}
  }
}));

test('initial native language follows valid URL, saved app language, native preference and course pair in that order', () => checked('initial-locale-precedence', async () => {
  const cases = [
    {name: 'url-over-all-preferences', savedLocale: 'en', local: {ox_nat: 'ko', 'melunga-course-pair': 'zh-fr'}, query: 'lang=ja', expected: 'ja'},
    {name: 'app-over-native-and-pair', savedLocale: 'zh', local: {ox_nat: 'ja', 'melunga-course-pair': 'ko-fr'}, expected: 'zh'},
    {name: 'native-without-app-key', local: {ox_nat: 'ko', 'melunga-course-pair': 'es-fr'}, expected: 'ko'},
    {name: 'course-pair-without-native-preference', local: {ox_nat: 'invalid', 'melunga-course-pair': 'it-ko'}, expected: 'it'},
    {name: 'malformed-app-json', local: {'melunga-app-language': '{broken', ox_nat: 'en'}, expected: 'en'},
    {name: 'unknown-url-does-not-erase-app', query: 'lang=unknown', savedLocale: 'es', expected: 'es'},
    {name: 'unknown-app-does-not-erase-native', local: {'melunga-app-language': JSON.stringify({locale: 'unknown'}), ox_nat: 'ja'}, expected: 'ja'},
    {name: 'unknown-everywhere-french-default', query: 'lang=unknown', local: {ox_nat: 'unknown', 'melunga-course-pair': 'xx-ko'}, expected: 'fr'},
    {name: 'fresh-profile-french-default', expected: 'fr'}
  ];
  for (const item of cases) {
    const f = await fixture({...item, i18n: 'missing'}); try {
      const p = f.page; assert.equal(await p.locator('html').getAttribute('lang'), item.expected, item.name);
      assert.equal(f.i18nRequests, 1, 'precedence scenario ran without the external localization module');
      await openProof(p); await assertSlide(p, item.expected, 0);
      assert.equal(await p.evaluate(() => JSON.parse(localStorage.getItem('melunga-app-language')).locale), item.expected, 'persist the selected native language, without replacing a valid native preference with French');
      await p.reload(); await openProof(p); await assertSlide(p, item.expected, 0);
      report.cases.push({name: 'initial-locale-precedence', scenario: item.name, expected: item.expected, externalModule: 'missing', survivesReload: true});
    } finally {await f.close();}
  }
}));
