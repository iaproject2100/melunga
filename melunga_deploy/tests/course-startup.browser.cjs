/* Startup regression checks against the real HTML/CSS/JS. All network responses
 * are local fixtures, including a production-like unpaid account. Chromium
 * profiles do not establish physical Android, Safari, PWA or audio behavior. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');
const {test, before, after} = require('node:test');
const {chromium} = require('playwright-core');
const ROOT = path.resolve(__dirname, '../..'), WEB = path.join(ROOT, 'melunga_deploy');
const BASE = 'ff4f1e0';
const ORIGIN = 'https://course-startup.test'; // Deliberately not an unrestricted deploy-preview hostname.
const CODES = ['fr', 'en', 'es', 'zh', 'it', 'ja', 'ko'];
const FRENCH_PAIRS = ['fr-en', 'fr-es', 'fr-it', 'fr-zh', 'fr-ja', 'fr-ko'];
const ANDROID = 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36';
const read = file => fs.readFileSync(path.join(WEB, file));
const json = file => JSON.parse(read(file));
const baseline = file => execFileSync('git', ['show', BASE + ':melunga_deploy/' + file], {cwd: ROOT, maxBuffer: 40 * 1024 * 1024});
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const manifest = json('content/niveaux-progressifs/manifest.json');
const corpus = ['content/niveaux-progressifs/manifest.json', ...manifest.pairs.flatMap(p => [p.repertoirePath, ...p.levels.map(l => l.dataPath)])];
const preserved = ['course-access.js', 'content/course-access.json', 'store-billing.js', 'netlify/functions/get-pricing.mjs', 'netlify/functions/check-status.mjs', 'netlify/functions/login.mjs', 'netlify/functions/create-payment-link.mjs'];
const supplements = json('content/course-locales/supplements.json');
const text = (locale, source) => locale === 'fr' ? source : supplements[locale]?.[source] || json('content/course-locales/' + locale + '.json').ui[source] || source;
function productFiles() {
  const roots = fs.readdirSync(WEB, {withFileTypes: true}).filter(n => n.isFile() && /\.(?:js|html|css)$/.test(n.name)).map(n => n.name);
  const locales = fs.readdirSync(path.join(WEB, 'content/course-locales')).filter(f => f.endsWith('.json')).map(f => 'content/course-locales/' + f);
  const native = fs.readdirSync(path.join(WEB, 'content/native-catalogue')).filter(f => f.endsWith('.json')).map(f => 'content/native-catalogue/' + f);
  return [...new Set([...roots, ...locales, ...native, ...corpus, ...preserved])].sort();
}
const fingerprint = () => Object.fromEntries([__filename, ...productFiles().map(f => path.join(WEB, f))].sort().map(f => [path.relative(ROOT, f), sha(fs.readFileSync(f))]));
const reportPath = process.env.COURSE_STARTUP_REPORT || '/tmp/melunga-course-startup-browser.json';
const captures = process.env.COURSE_STARTUP_CAPTURES || '/tmp/melunga-course-startup-browser';
const required = ['preserved-corpus-and-access', 'static-first-paint', 'concurrent-load-with-trusted-access', 'localized-errors-and-retry', 'native-language-and-menu-bounds', 'malformed-route-no-fallback'];
const report = {status: 'running', baseCommit: BASE, environment: 'local Chromium; desktop and Android UA/viewport/touch profiles',
  physicalDeviceTested: false, safariTested: false, realAccountsUsed: false, actualAudioPlayed: false, allApiResponsesMocked: true,
  publicPreviewOpened: false, checks: [], cases: [], errors: [], unexpected: [], fixtureErrors: [], screenshots: []};
let browser, inputs;
const checked = async (name, fn) => {try {await fn(); report.checks.push(name);} catch (error) {report.errors.push(name + ': ' + error.message); throw error;}};
before(async () => {inputs = fingerprint(); fs.mkdirSync(captures, {recursive: true}); browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox']});});
after(async () => {
  await browser?.close(); report.inputsStable = JSON.stringify(inputs) === JSON.stringify(fingerprint()); report.inputSha256 = inputs;
  report.missingChecks = required.filter(name => !report.checks.includes(name));
  report.status = report.inputsStable && !report.errors.length && !report.unexpected.length && !report.fixtureErrors.length && !report.missingChecks.length ? 'passed' : 'failed';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
  assert.equal(report.inputsStable, true, 'product bytes remained stable'); assert.deepEqual(report.errors, []);
  assert.deepEqual(report.unexpected, []); assert.deepEqual(report.fixtureErrors, []); assert.deepEqual(report.missingChecks, []);
});
function deferred() {let resolve; const promise = new Promise(done => {resolve = done;}); return {promise, resolve};}
async function started(f, kind) {
  let timer; try {await Promise.race([f.started[kind].promise, new Promise((_, reject) => {timer = setTimeout(() => reject(new Error(kind + ' request did not start independently')), 3500);})]);}
  finally {clearTimeout(timer);}
}
async function fixture({pair = 'fr-es', level = 4, width = 390, height = 700, locale = pair.split('-')[0], javascript = true,
  hold = [], fail = null, paid = false, query = null, legacy = false, staleNative = false} = {}) {
  const android = width <= 844;
  const context = await browser.newContext({viewport: {width, height}, userAgent: android ? ANDROID : undefined,
    isMobile: android, hasTouch: android, javaScriptEnabled: javascript, reducedMotion: 'reduce', serviceWorkers: 'block'});
  const f = {context, closed: false, events: [], counts: {}, fail, paid, gates: {}, started: {}, pair, level, locale};
  for (const kind of ['main', 'status', 'manifest', 'level']) {f.gates[kind] = deferred(); f.started[kind] = deferred(); if (!hold.includes(kind)) f.gates[kind].resolve();}
  f.release = kind => f.gates[kind].resolve();
  f.close = async () => {f.closed = true; for (const gate of Object.values(f.gates)) gate.resolve(); await context.close();};
  await context.addInitScript(({locale, staleNative, expectedPair, expectedLevel}) => {
    localStorage.setItem('ox_device', 'course-startup-fixture'); localStorage.setItem('ox_paid', '1');
    localStorage.setItem('melunga-app-language', JSON.stringify({locale, label: locale}));
    if (staleNative) {localStorage.setItem('melunga-course-pair', 'zh-fr'); localStorage.setItem('melunga-course-level', '1'); localStorage.setItem('ox_nat', 'zh'); localStorage.setItem('ox_lang', 'fr');}
    window.__startupQA = {wrongFrames: [], frames: [], audio: [], expectedPair, expectedLevel};
    const visible = node => node && node.getClientRects().length && getComputedStyle(node).visibility !== 'hidden';
    function inspect() {
      const flag = document.getElementById('mgLanguageFlag'), level = document.getElementById('mgLevelText');
      const row = {flag: visible(flag) ? flag.textContent : '', level: visible(level) ? level.textContent : '',
        notice: !!document.querySelector('.mg-previewnotice'), view: document.body?.dataset.view || null};
      const wrong = row.notice || expectedPair.split('-')[1] !== 'zh' && row.flag.includes('🇨🇳') || expectedLevel !== 1 && row.level.trim() === 'L1';
      if (wrong && !window.__startupQA.wrongFrames.some(item => JSON.stringify(item) === JSON.stringify(row))) window.__startupQA.wrongFrames.push(row);
      if (window.__startupQA.frames.length < 120) window.__startupQA.frames.push(row);
    }
    new MutationObserver(inspect).observe(document, {subtree: true, childList: true, attributes: true, characterData: true});
    const tick = () => {inspect(); requestAnimationFrame(tick);}; requestAnimationFrame(tick);
    window.Audio = class extends EventTarget {constructor(src) {super(); this.src = src || ''; this.paused = true;} play() {window.__startupQA.audio.push(this.src); return Promise.resolve();} pause() {this.paused = true;} load() {} removeAttribute(name) {if (name === 'src') this.src = '';}};
    window.SpeechSynthesisUtterance = class {constructor(text) {this.text = text;}};
    Object.defineProperty(window, 'speechSynthesis', {value: {cancel() {}, getVoices() {return [];}, addEventListener() {}, speak(u) {window.__startupQA.audio.push('browser:' + u.text);}}});
  }, {locale, staleNative, expectedPair: pair, expectedLevel: level});
  await context.route('**/*', async route => {
    const request = route.request(), url = new URL(request.url());
    try {
      if (url.origin !== ORIGIN) {report.unexpected.push({origin: url.origin, path: url.pathname}); return await route.abort();}
      let kind = url.pathname === '/maquette-guidee.js' ? 'main'
        : url.pathname === '/.netlify/functions/check-status' ? 'status'
        : url.pathname === '/content/niveaux-progressifs/manifest.json' || url.pathname === '/content/maquette-guidee.json' ? 'manifest'
        : /^\/content\/niveaux-progressifs\/[^/]+\/L\d+\.json$/.test(url.pathname) ? 'level' : null;
      if (kind) {f.counts[kind] = (f.counts[kind] || 0) + 1; f.events.push({kind, phase: 'start', path: url.pathname, time: Date.now()}); f.started[kind].resolve(); await f.gates[kind].promise;}
      if (request.method() !== 'GET') {report.unexpected.push({path: url.pathname, method: request.method()}); return await route.abort();}
      if (kind === 'status') {f.events.push({kind, phase: 'complete', time: Date.now()}); return await route.fulfill({json: {paid: f.paid}});}
      if (url.pathname === '/.netlify/functions/tts' && url.searchParams.get('catalog') === 'chirp3') return await route.fulfill({status: 503, json: {error: 'fixture_voice_catalogue_unavailable'}});
      if (/^\/(?:\.netlify|api)\//.test(url.pathname)) {report.unexpected.push({path: url.pathname, method: request.method()}); return await route.abort();}
      if (kind && f.fail === kind) return await route.fulfill({status: 500, json: {error: 'fixture_content_unavailable'}});
      const name = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname).slice(1), file = path.resolve(WEB, name);
      if (!file.startsWith(WEB + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return await route.fulfill({status: 404, body: 'Not found'});
      if (kind) f.events.push({kind, phase: 'complete', time: Date.now()});
      return await route.fulfill({body: fs.readFileSync(file), contentType: ({'.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml'})[path.extname(file)] || 'application/octet-stream'});
    } catch (error) {if (!f.closed) report.fixtureErrors.push(error.message);}
  });
  const page = f.page = await context.newPage(); page.setDefaultTimeout(6500); page.on('pageerror', error => report.errors.push(error.message));
  const params = query === null ? 'pair=' + pair + '&level=' + level : query;
  await page.goto(ORIGIN + (legacy ? '/maquette-guidee.html' : '/parcours-niveaux.html') + '?' + params,
    {waitUntil: hold.includes('main') ? 'commit' : 'domcontentloaded'});
  return f;
}
const settled = page => page.evaluate(() => new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done))));
async function shot(page, name) {const file = path.join(captures, name + '.png'); await page.screenshot({path: file, animations: 'disabled'}); report.screenshots.push(file);}
async function ready(page, pair, level = 4) {await page.waitForFunction(({pair, level}) => {const s = window.MelungaMockup?.state(); return s?.screen === 'themes' && s.pairId === pair && s.level === level;}, {pair, level}); await settled(page);}
async function shell(page, {loading = true, error = false} = {}) {
  const bodyText = await page.locator('body').innerText(); assert.doesNotMatch(bodyText, /\bMaquette\b|Site actuel/i); assert.equal(await page.locator('.mg-previewnotice').count(), 0);
  const geometry = await page.evaluate(() => {
    const rect = node => {const r = node.getBoundingClientRect(); return {left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height};};
    const brand = document.querySelector('.mg-brand'), wordmark = document.querySelector('.mg-wordmark'), loading = document.getElementById('mgLoading');
    return {width: innerWidth, height: innerHeight, documentWidth: document.documentElement.scrollWidth, documentHeight: document.documentElement.scrollHeight,
      background: getComputedStyle(document.body).backgroundImage, brand: rect(brand), wordmarkWeight: parseInt(getComputedStyle(wordmark).fontWeight), loading: rect(loading),
      retry: rect(document.getElementById('mgRetry')), contentOverflow: loading.hidden ? null : {x: document.getElementById('mgContent').scrollWidth - document.getElementById('mgContent').clientWidth, y: document.getElementById('mgContent').scrollHeight - document.getElementById('mgContent').clientHeight}, title: document.title};
  });
  assert.ok(geometry.documentWidth <= geometry.width + 1, 'shell has no horizontal overflow'); assert.ok(geometry.documentHeight <= geometry.height + 1, 'loading shell fits one viewport');
  assert.notEqual(geometry.background, 'none', 'the application stylesheet is applied'); assert.ok(geometry.wordmarkWeight >= 600); assert.ok(geometry.brand.width >= 40, 'brand retains its styled size on the vertical desktop rail too');
  assert.ok(geometry.brand.top >= -1 && geometry.brand.bottom <= geometry.height + 1 && geometry.brand.left >= -1 && geometry.brand.right <= geometry.width + 1, 'the application brand remains visible in loading and error states');
  assert.doesNotMatch(geometry.title, /maquette/i);
  if (loading) {assert.equal(await page.locator('#mgLoading').isVisible(), true); assert.ok(geometry.loading.width > 100 && geometry.loading.height > 60); assert.equal(await page.locator('#mgThemeView').isHidden(), true); assert.equal(await page.locator('#mgLessonView').isHidden(), true); assert.ok(geometry.contentOverflow.x <= 1 && geometry.contentOverflow.y <= 1, 'loading frame needs no internal scroll');}
  if (error) {assert.equal(await page.locator('#mgRetry').isVisible(), true); const r = geometry.retry; assert.ok(r.height >= 40 && r.top >= -1 && r.bottom <= geometry.height + 1, 'retry is a reachable touch target');}
  return geometry;
}
async function noPrematureContent(page) {
  assert.equal(await page.locator('#mgThemeView').isHidden(), true); assert.equal(await page.locator('#mgLessonView').isHidden(), true);
  assert.equal(await page.locator('#mgThemeGrid button').count(), 0); assert.equal(await page.locator('#mgMenuTrigger').isDisabled(), true);
  const s = await page.evaluate(() => ({access: window.MelungaCourseAccess?.state(), audio: window.__startupQA?.audio || [], wrong: window.__startupQA?.wrongFrames || []}));
  assert.equal(s.access.paid, false); assert.equal(s.access.ready, false); assert.deepEqual(s.audio, []); assert.deepEqual(s.wrong, []);
  return s;
}
function expectedFree(pair, level) {
  const row = json('content/niveaux-progressifs/' + pair + '/L' + level + '.json'), bank = json('content/niveaux-progressifs/repertoires/' + pair + '.json');
  const models = new Map([...bank.phrases, ...(bank.receivedModels || []), ...row.themes.flatMap(t => t.phrases)].map(p => [p.id, p]));
  const rights = new Set(json('content/course-access.json').pairs.find(p => p.id === pair).historicalFreeIds);
  const allowed = phrase => (Number.isInteger(phrase.editorialLevel) ? phrase.editorialLevel : level) === 1 || rights.has(phrase.id)
    || phrase.source?.sourceLevel === 1 && /^conversation/.test(phrase.source?.collection || '');
  const total = row.themes.reduce((sum, theme) => sum + new Set(theme.sequences.flatMap(s => s.phraseIds)).size, 0);
  const free = row.themes.reduce((sum, theme) => sum + [...new Set(theme.sequences.flatMap(s => s.phraseIds))].filter(id => allowed(models.get(id))).length, 0);
  assert.ok(free < total, 'fixture level has paid learner presentations to protect'); return {free, total};
}
async function choices(page) {
  const hidden = await page.locator('#mgLanguage option').evaluateAll(nodes => nodes.map(n => n.value)); assert.deepEqual(new Set(hidden), new Set(FRENCH_PAIRS));
  await page.locator('#mgLanguageTrigger').click(); await page.locator('#mgLanguageDialog').waitFor({state: 'visible'});
  const visible = await page.locator('#mgLanguageChoices button').evaluateAll(nodes => nodes.map(n => ({pair: n.dataset.pair, label: n.textContent.trim()})));
  assert.deepEqual(new Set(visible.map(n => n.pair)), new Set(FRENCH_PAIRS)); assert.equal(visible.some(n => n.pair === 'zh-fr' || /Français|法语/.test(n.label)), false);
  return visible;
}
async function optionWithin(page, selector, dialog, body) {
  const value = await page.locator(selector).evaluate((node, {dialog, body}) => {
    const rect = n => {const r = n.getBoundingClientRect(); return {top: r.top, bottom: r.bottom, left: r.left, right: r.right};};
    return {item: rect(node), header: rect(document.querySelector(dialog + ' header')), body: rect(document.querySelector(body)), width: innerWidth, height: innerHeight};
  }, {dialog, body});
  assert.ok(value.item.top >= value.header.bottom - 1 && value.item.top >= value.body.top - 1 && value.item.bottom <= value.body.bottom + 1);
  assert.ok(value.header.top >= -1 && value.header.bottom <= value.height + 1 && value.item.left >= -1 && value.item.right <= value.width + 1);
  return value;
}

test('startup changes preserve all card sources, prices and the whole trusted access implementation', () => checked('preserved-corpus-and-access', async () => {
  assert.equal(corpus.length, 78); for (const file of corpus.concat(preserved)) assert.ok(read(file).equals(baseline(file)), 'immutable whole source ' + file);
  for (const file of ['parcours-niveaux.html', 'maquette-guidee.html']) {
    const html = read(file).toString(); assert.doesNotMatch(html, /class="mg-previewnotice"/); assert.doesNotMatch(html, />Maquette</); assert.doesNotMatch(html, />Site actuel/);
    assert.match(html, /<body[^>]*data-view="loading"/); assert.match(html, /href="course-startup\.css\?v=1"/);
  }
  report.cases.push({name: 'immutable-cards-prices-access', jsonDocuments: 78, wholeProtectedFiles: preserved.length});
}));

test('the static HTML already has a styled neutral loader and no preview banner before any JavaScript executes', {timeout: 90000}, () => checked('static-first-paint', async () => {
  for (const legacy of [false, true]) for (const size of [{width: 320, height: 568}, {width: 390, height: 700}, {width: 1440, height: 900}]) {
    const f = await fixture({...size, legacy, javascript: false});
    try {
      const p = f.page, geometry = await shell(p); assert.equal(await p.locator('body').getAttribute('data-view'), 'loading');
      assert.equal(await p.locator('#mgLoading').getAttribute('aria-busy'), 'true'); assert.equal(await p.locator('.mg-loading-skeleton').isVisible(), true);
      assert.equal(await p.locator('.mg-loading-skeleton').getAttribute('aria-hidden'), 'true'); assert.ok(await p.locator('.mg-loading-card').count() >= 2);
      assert.doesNotMatch(await p.locator('#mgLanguageFlag').textContent(), /🇨🇳/); assert.equal((await p.locator('.mg-controls .mg-level').textContent()).trim(), '…');
      assert.equal(f.counts.status || 0, 0); assert.equal(f.counts.manifest || 0, 0); await shot(p, 'static-' + (legacy ? 'legacy-' : '') + size.width + 'x' + size.height);
      report.cases.push({name: 'before-javascript-static-shell', legacy, ...size, javascript: false, neutralHeader: true, geometry});
    } finally {await f.close();}
  }
}));

test('content metadata starts concurrently with account verification while the requested Spanish level stays correct and all cards wait for access', {timeout: 90000}, () => checked('concurrent-load-with-trusted-access', async () => {
  const expected = expectedFree('fr-es', 4);
  for (const size of [{width: 320, height: 568}, {width: 390, height: 700}, {width: 1440, height: 900}]) {
    const f = await fixture({...size, hold: ['main', 'status', 'manifest'], staleNative: true});
    try {
      const p = f.page; await p.locator('#mgLoading').waitFor({state: 'visible'}); await shell(p);
      assert.notEqual((await p.locator('#mgLevelText').textContent()).trim(), 'L1'); assert.doesNotMatch(await p.locator('#mgLanguageFlag').textContent(), /🇨🇳/);
      f.release('main'); await Promise.all([started(f, 'status'), started(f, 'manifest')]);
      await p.waitForFunction(() => document.body.dataset.loadingContext === 'ready');
      assert.equal(await p.locator('#mgLevelText').textContent(), 'L4'); assert.equal(await p.locator('#mgLanguageFlag').getAttribute('data-language'), 'es');
      assert.equal(await p.locator('html').getAttribute('lang'), 'fr'); assert.equal(await p.locator('#mgLoadingText').textContent(), text('fr', 'Chargement des leçons…'));
      const before = await noPrematureContent(p); assert.equal(await p.locator('#mgLoading').getAttribute('aria-busy'), 'true'); await shell(p);
      const metadataResponse = p.waitForResponse(response => new URL(response.url()).pathname === '/content/niveaux-progressifs/manifest.json');
      f.release('manifest'); await (await metadataResponse).finished(); await settled(p); await noPrematureContent(p);
      assert.equal(f.events.some(e => e.kind === 'status' && e.phase === 'complete'), false); await shot(p, 'awaiting-trusted-access-' + size.width + 'x' + size.height);
      f.release('status'); await ready(p, 'fr-es', 4); const actual = await p.evaluate(() => window.MelungaMockup.state());
      assert.equal(actual.access.mode, 'production'); assert.equal(actual.access.unrestricted, false); assert.equal(actual.access.ready, true); assert.equal(actual.access.paid, false);
      assert.equal(actual.totalPhrases, expected.free); assert.ok(actual.totalPhrases < expected.total); assert.equal(await p.evaluate(() => localStorage.getItem('ox_paid')), '0');
      assert.equal(await p.locator('#mgLevelText').textContent(), 'L4'); assert.equal(await p.locator('#mgLanguageFlag').getAttribute('data-language'), 'es');
      assert.deepEqual(await p.evaluate(() => window.__startupQA.wrongFrames), []); assert.deepEqual(await p.evaluate(() => window.__startupQA.audio), []);
      report.cases.push({name: 'metadata-concurrent-access-guarded', ...size, pair: 'fr-es', level: 4, before, freePresentations: actual.totalPhrases, fullPresentations: expected.total, events: f.events});
    } finally {await f.close();}
  }
  const truthy = await fixture({paid: 'true'});
  try {await ready(truthy.page, 'fr-es', 4); const state = await truthy.page.evaluate(() => window.MelungaMockup.state()); assert.equal(state.access.paid, false); assert.equal(state.totalPhrases, expected.free); report.cases.push({name: 'truthy-paid-string-refused', paidServerValue: 'true', paidEffective: false, freePresentations: expected.free});}
  finally {await truthy.close();}
}));

test('localized loading and errors keep the application frame and a reachable retry returns to the same requested course', {timeout: 90000}, () => checked('localized-errors-and-retry', async () => {
  for (const config of [{pair: 'en-es', locale: 'en', fail: 'manifest', width: 320, height: 568}, {pair: 'zh-fr', locale: 'zh', fail: 'manifest', width: 390, height: 700}, {pair: 'fr-es', locale: 'fr', fail: 'level', width: 1440, height: 900}]) {
    const f = await fixture({...config, hold: [config.fail]});
    try {
      const p = f.page; await started(f, config.fail); await p.waitForFunction(() => document.body.dataset.loadingContext === 'ready');
      assert.equal(await p.locator('#mgLoadingText').textContent(), text(config.locale, 'Chargement des leçons…'));
      assert.equal(await p.locator('html').getAttribute('lang'), config.locale); await shell(p); await shot(p, 'localized-loading-' + config.locale);
      f.release(config.fail); await p.locator('#mgRetry').waitFor({state: 'visible'}); await shell(p, {error: true});
      assert.equal(await p.locator('#mgLoadingText').textContent(), text(config.locale, 'Les thèmes n’ont pas pu se charger.'));
      assert.equal(await p.locator('#mgRetry').textContent(), text(config.locale, 'Réessayer')); assert.equal(await p.locator('#mgLoading').getAttribute('aria-busy'), 'false');
      assert.equal(await p.locator('.mg-loading-skeleton').isHidden(), true); assert.equal(await p.locator('#mgThemeGrid button').count(), 0);
      await shot(p, 'localized-error-' + config.locale); f.fail = null; await p.locator('#mgRetry').click(); await ready(p, config.pair, 4);
      const actual = await p.evaluate(() => window.MelungaMockup.state()); assert.equal(actual.access.paid, false); assert.equal(actual.access.ready, true); assert.equal(actual.access.unrestricted, false);
      assert.equal(await p.locator('html').getAttribute('lang'), config.locale); assert.equal(f.counts[config.fail], 2);
      assert.deepEqual(await p.evaluate(() => window.__startupQA.wrongFrames), []);
      report.cases.push({name: 'localized-error-and-retry', ...config, attempts: f.counts[config.fail], samePairAndLevel: true, serverPaid: false});
    } finally {await f.close();}
  }
}));

test('after asynchronous startup French learners see exactly six targets and dialogs retain their header plus first and last options', {timeout: 90000}, () => checked('native-language-and-menu-bounds', async () => {
  for (const size of [{width: 320, height: 568}, {width: 390, height: 700}, {width: 1440, height: 900}]) {
    const f = await fixture({...size, hold: ['manifest']});
    try {
      const p = f.page; await started(f, 'manifest'); f.release('manifest'); await ready(p, 'fr-es', 4);
      const all = await choices(p), first = p.locator('#mgLanguageChoices button').first(), last = p.locator('#mgLanguageChoices button').last();
      await first.focus(); await p.keyboard.press('Home'); const firstBounds = await optionWithin(p, '#mgLanguageChoices button:first-child', '#mgLanguageDialog', '#mgLanguageDialog .mg-menu-body');
      await p.keyboard.press('End'); const lastBounds = await optionWithin(p, '#mgLanguageChoices button:last-child', '#mgLanguageDialog', '#mgLanguageDialog .mg-menu-body');
      assert.ok(Math.abs(firstBounds.header.top - lastBounds.header.top) <= 1, 'dialog title does not scroll away'); await shot(p, 'six-french-native-targets-' + size.width);
      await p.locator('#mgLanguageChoices [data-pair="fr-ja"]').click(); await ready(p, 'fr-ja', 4);
      assert.equal(await p.locator('html').getAttribute('lang'), 'fr'); assert.equal(new URL(p.url()).searchParams.get('pair'), 'fr-ja'); assert.equal(new URL(p.url()).searchParams.get('level'), '4');
      assert.deepEqual(new Set(await p.locator('#mgLanguage option').evaluateAll(nodes => nodes.map(n => n.value))), new Set(FRENCH_PAIRS));
      if (await p.locator('#mgMenuTrigger').isVisible()) {
        await p.locator('#mgMenuTrigger').click(); await p.locator('#mgMenuDialog').waitFor({state: 'visible'}); const menuFirst = p.locator('#mgMenuNav .mg-menu-item').first(), menuLast = p.locator('#mgMenuNav .mg-menu-item').last();
        await menuFirst.focus(); await menuFirst.scrollIntoViewIfNeeded(); const firstMenu = await optionWithin(p, '#mgMenuNav .mg-menu-item:first-child', '#mgMenuDialog', '#mgMenuBody');
        await menuLast.focus(); await menuLast.scrollIntoViewIfNeeded(); const lastMenu = await optionWithin(p, '#mgMenuNav .mg-menu-item:last-child', '#mgMenuDialog', '#mgMenuBody');
        assert.ok(Math.abs(firstMenu.header.top - lastMenu.header.top) <= 1); assert.ok((await menuLast.textContent()).trim()); await shot(p, 'menu-after-async-' + size.width); await p.keyboard.press('Escape');
      } else {
        const rail = await p.locator('#mgDesktopNav .mg-rail-item').evaluateAll(nodes => nodes.map(n => {const r = n.getBoundingClientRect(); return {top: r.top, bottom: r.bottom, left: r.left, right: r.right};}));
        assert.equal(rail.length, 9); for (const r of rail) assert.ok(r.top >= 0 && r.bottom <= size.height + 1 && r.left >= 0 && r.right <= size.width + 1);
      }
      assert.deepEqual(await p.evaluate(() => window.__startupQA.wrongFrames), []); report.cases.push({name: 'filtered-targets-and-dialog-bounds', ...size, targets: all, languageChange: 'fr-es → fr-ja', nativeRetained: 'fr', firstBounds, lastBounds});
    } finally {await f.close();}
  }
  for (const size of [{width: 320, height: 568}, {width: 390, height: 700}]) {
    const f = await fixture({...size, level: 1});
    try {
      const p = f.page; await ready(p, 'fr-es', 1); await p.locator('#mgThemeGrid .mg-theme:not([data-access="paid"])').first().click();
      await p.waitForFunction(() => window.MelungaMockup?.state().screen === 'lesson'); await settled(p);
      const geometry = await p.evaluate(() => {
        const app = document.querySelector('.mg-app').getBoundingClientRect(), footer = document.getElementById('mgFooter').getBoundingClientRect();
        return {app: {top: app.top, bottom: app.bottom, height: app.height}, footer: {top: footer.top, bottom: footer.bottom},
          viewport: {height: visualViewport?.height || innerHeight, offsetTop: visualViewport?.offsetTop || 0, width: innerWidth},
          document: {height: document.documentElement.scrollHeight, width: document.documentElement.scrollWidth},
          oldNoticeHeight: getComputedStyle(document.body).getPropertyValue('--mg-notice-height').trim()};
      });
      assert.equal(geometry.oldNoticeHeight, '0px'); assert.ok(Math.abs(geometry.app.height - geometry.viewport.height) <= 1, 'no obsolete 29/34px banner gap remains');
      assert.ok(geometry.footer.bottom <= geometry.viewport.height + 1); assert.ok(geometry.document.width <= geometry.viewport.width + 1 && geometry.document.height <= geometry.viewport.height + 1);
      assert.equal(await p.locator('.mg-previewnotice').count(), 0); assert.deepEqual(await p.evaluate(() => window.__startupQA.audio), []);
      await shot(p, 'lesson-full-viewport-' + size.width + 'x' + size.height); report.cases.push({name: 'lesson-fills-viewport-after-banner-removal', ...size, geometry});
    } finally {await f.close();}
  }

}));

test('invalid or ambiguous routes show an explicit localized error rather than exposing another native-language course', {timeout: 60000}, () => checked('malformed-route-no-fallback', async () => {
  for (const query of ['pair=fr-fr&level=4', 'pair=xx-es&level=4', 'pair=fr-es&pair=zh-fr&level=4']) {
    const f = await fixture({query, staleNative: true});
    try {
      const p = f.page; await p.locator('#mgRetry').waitFor({state: 'visible'}); await shell(p, {error: true});
      const state = await p.evaluate(() => window.MelungaMockup.state()); assert.equal(state.pairId, null); assert.equal(state.screen, 'loading');
      assert.equal(await p.locator('html').getAttribute('lang'), 'fr'); assert.equal(await p.locator('#mgLoadingText').textContent(), text('fr', 'Ce couple de langues n’est pas disponible. Choisis tes langues pour continuer.'));
      assert.equal(await p.locator('#mgRetry').textContent(), text('fr', 'Choisir mes langues')); assert.equal(await p.locator('#mgThemeGrid button').count(), 0);
      assert.deepEqual(await p.evaluate(() => window.__startupQA.wrongFrames), []); assert.equal(state.access.paid, false);
      report.cases.push({name: 'malformed-pair-explicit-error', query, fallbackPair: state.pairId});
    } finally {await f.close();}
  }
}));
