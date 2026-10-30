/* Independent comparison acceptance. Chromium Linux executes the real UI.
 * Android is a viewport/touch/UA profile, never a physical phone. All catalogue
 * responses and all media events are fixtures: no speech is heard or decoded. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');
const {test, before, after} = require('node:test');
const {chromium, webkit} = require('playwright-core');
const ROOT = path.resolve(__dirname, '../..'), WEB = path.join(ROOT, 'melunga_deploy');
const BASE = '4fafe31';
const ORIGIN = 'https://deploy-preview-999--chic-dragon-e2baf2.netlify.app';
const PAGE = '/comparaison-voix.html';
const ANDROID = 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36';
const STORAGE = 'melunga-preview-voice-selection-v1';
const SELECTION_VERSION = 'kartech-2026-10-27';
const APPROVED_DEFAULTS = Object.freeze({
  fr: 'fr-FR-Chirp3-HD-Aoede', en: 'en-US-Chirp3-HD-Kore', es: 'es-ES-Chirp3-HD-Kore',
  zh: 'cmn-CN-Chirp3-HD-Kore', it: 'it-IT-Chirp3-HD-Charon', ja: 'ja-JP-Chirp3-HD-Kore', ko: 'ko-KR-Chirp3-HD-Kore'
});
const LANGUAGES = ['fr', 'en', 'es', 'zh', 'it', 'ja', 'ko'];
const VOICES = {
  fr: ['fr-FR', 'fr-FR-Wavenet-F'], en: ['en-US', 'en-US-Wavenet-C'],
  es: ['es-ES', 'es-ES-Wavenet-F'], zh: ['cmn-CN', 'cmn-CN-Wavenet-A'],
  it: ['it-IT', 'it-IT-Wavenet-E'], ja: ['ja-JP', 'ja-JP-Wavenet-B'], ko: ['ko-KR', 'ko-KR-Wavenet-A']
};
const read = file => fs.readFileSync(path.join(WEB, file));
const json = file => JSON.parse(read(file));
const baseline = file => execFileSync('git', ['show', BASE + ':melunga_deploy/' + file], {cwd: ROOT, maxBuffer: 40 * 1024 * 1024});
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const manifest = json('content/niveaux-progressifs/manifest.json');
const canonicalFiles = ['content/niveaux-progressifs/manifest.json', ...manifest.pairs.flatMap(p => [p.repertoirePath, ...p.levels.map(l => l.dataPath)])];
const preserved = ['content/course-access.json', 'maquette-guidee.css', 'desktop-home.css', 'store-billing.js', 'account-ui.js', 'account-ui.css',
  'melunga-logo.png', 'assets/melunga-logo.png', 'netlify/functions/get-pricing.mjs', 'netlify/functions/login.mjs',
  'netlify/functions/check-status.mjs', 'netlify/functions/create-payment-link.mjs', 'netlify/functions/logout.mjs',
  ...LANGUAGES.map(c => 'content/native-catalogue/' + c + '.json'), 'content/native-catalogue/manifest.json'];
function productFiles() {
  const rootFiles = fs.readdirSync(WEB, {withFileTypes: true}).filter(f => f.isFile() && /\.(?:html|css|js|webmanifest)$/.test(f.name)).map(f => f.name);
  const helper = path.join(WEB, 'netlify/functions/lib');
  const server = fs.readdirSync(path.join(WEB, 'netlify/functions')).filter(f => f.endsWith('.mjs')).map(f => 'netlify/functions/' + f);
  const helperFiles = fs.existsSync(helper) ? fs.readdirSync(helper).filter(f => /\.(?:js|mjs)$/.test(f)).map(f => 'netlify/functions/lib/' + f) : [];
  return [...new Set([...rootFiles, ...server, ...helperFiles, ...canonicalFiles, ...preserved, 'content/course-locales/supplements.json'])].sort();
}
const fingerprint = () => Object.fromEntries([__filename, ...productFiles().map(f => path.join(WEB, f))].sort().map(f => [path.relative(ROOT, f), sha(fs.readFileSync(f))]));
const reportPath = process.env.CHIRP_COMPARISON_REPORT || '/tmp/melunga-chirp-comparison-browser.json';
const captures = process.env.CHIRP_COMPARISON_CAPTURES || '/tmp/melunga-chirp-comparison-browser';
const required = ['preserved-content-and-prices', 'seven-language-comparisons', 'errors-and-partial-catalogue', 'selection-export-and-modern-lesson', 'classic-choice-and-wave-net', 'approved-defaults-in-both-readers', 'missing-approved-default-never-substitutes', 'short-screen-layout'];
const report = {status: 'running', baseCommit: BASE, environment: 'Chromium Linux headless; Android touch/viewport/user-agent emulation',
  chromiumExecutable: process.env.CHROMIUM_PATH || '/usr/bin/chromium', webkitInstalled: fs.existsSync(webkit.executablePath()),
  safariTested: false, physicalAndroidTested: false, physicalIPhoneTested: false, installedPwaTested: false, hardwareMuteSwitchTested: false,
  realAudioHeard: false, audioDecoded: false, upstreamGoogleCalled: false, realAccountsUsed: false, publicPreviewOpened: false,
  fixtures: 'Fresh controlled seven-language catalogue metadata and in-memory HTMLMediaElement events; no claim of current Google voice availability',
  checks: [], cases: [], errors: [], unexpected: [], api: [], screenshots: []};
let browser, inputs;
const checked = async (name, fn) => {try {await fn(); report.checks.push(name);} catch (error) {report.errors.push(name + ': ' + error.message); throw error;}};
before(async () => {inputs = fingerprint(); fs.mkdirSync(captures, {recursive: true}); browser = await chromium.launch({executablePath: report.chromiumExecutable, args: ['--no-sandbox']});});
after(async () => {
  await browser?.close(); report.inputsStable = JSON.stringify(inputs) === JSON.stringify(fingerprint()); report.inputSha256 = inputs;
  report.missingChecks = required.filter(name => !report.checks.includes(name));
  report.status = report.inputsStable && !report.errors.length && !report.unexpected.length && !report.missingChecks.length ? 'passed' : 'failed';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
  assert.equal(report.inputsStable, true, 'product inputs were frozen throughout independent QA');
  assert.deepEqual(report.errors, []); assert.deepEqual(report.unexpected, []); assert.deepEqual(report.missingChecks, []);
});
function catalogue({unavailable = [], missingDefaults = [], defaultOnly = []} = {}) {
  const now = Date.now();
  return {version: 1, source: 'google-voices-list', previewOnly: true, selectionVersion: SELECTION_VERSION, verifiedAt: new Date(now - 1000).toISOString(), expiresAt: new Date(now + 240000).toISOString(),
    languages: Object.fromEntries(LANGUAGES.map(language => {
      const [languageCode, waveName] = VOICES[language];
      // Deliberately vary the gender distribution. The UI must describe records,
      // rather than assume a fixed female/male order from these fixture names.
      const candidates = language === 'en' ? [['Charon', 'MALE'], ['Kore', 'FEMALE'], ['Fenrir', 'MALE']]
        : [['Aoede', 'FEMALE'], ['Kore', 'FEMALE'], ['Charon', 'MALE']];
      const available = !unavailable.includes(language) && !defaultOnly.includes(language);
      let chirp = unavailable.includes(language) ? [] : candidates.map(([name, gender]) => ({name: languageCode + '-Chirp3-HD-' + name, languageCode, gender, engine: 'chirp3', rateMode: 'client'}));
      if (missingDefaults.includes(language)) chirp = chirp.map(voice => voice.name === APPROVED_DEFAULTS[language]
        ? {...voice, name: languageCode + '-Chirp3-HD-Zephyr', gender: 'FEMALE'} : voice);
      const defaultVoice = chirp.find(voice => voice.name === APPROVED_DEFAULTS[language]) || null;
      if (defaultOnly.includes(language)) chirp = defaultVoice ? [defaultVoice] : [];
      return [language, {language, available, waveNet: {name: waveName, languageCode, gender: 'FEMALE', engine: 'wavenet', rateMode: 'server'},
        chirp, defaultVoice, defaultReason: defaultVoice ? null : 'approved_voice_unavailable',
        ...(!available ? {reason: 'insufficient_voices'} : {})}];
    }))};
}
async function fixture({width = 390, height = 844, android = true, mode = 'ready', unavailable = [], missingDefaults = [], defaultOnly = [], saved = null, entry = PAGE} = {}) {
  const context = await browser.newContext({viewport: {width, height}, userAgent: android ? ANDROID : undefined, isMobile: android, hasTouch: android, reducedMotion: 'reduce', serviceWorkers: 'block', acceptDownloads: true});
  const f = {context, catalogue: catalogue({unavailable, missingDefaults, defaultOnly}), catalogueStatus: mode === 'failed' ? 503 : 200, catalogueGets: 0, navigation: []};
  await context.addInitScript(({saved, key}) => {
    if (!localStorage.getItem('__chirpQASeed')) {
      localStorage.setItem('__chirpQASeed', '1'); localStorage.setItem('ox_device', 'chirp-independent-fixture');
      if (saved) localStorage.setItem(key, JSON.stringify(saved));
    }
    const records = [], map = new WeakMap();
    window.__chirpMedia = {records, plays: [], speech: [], speechVoiceReads: 0, nextPlay: 'resolve'};
    const record = node => {
      if (!map.has(node)) {const r = {id: records.length, node, src: '', paused: true, ended: false, plays: 0, pauses: 0, loads: 0, listeners: {}, callbacks: {}}; records.push(r); map.set(node, r);}
      return map.get(node);
    };
    const proto = HTMLMediaElement.prototype;
    Object.defineProperty(proto, 'src', {configurable: true, get() {return record(this).src;}, set(value) {record(this).src = value ? new URL(String(value), location.href).href : '';}});
    Object.defineProperty(proto, 'currentSrc', {configurable: true, get() {return record(this).src;}});
    Object.defineProperty(proto, 'paused', {configurable: true, get() {return record(this).paused;}});
    Object.defineProperty(proto, 'ended', {configurable: true, get() {return record(this).ended;}});
    const originalGet = proto.getAttribute, originalSet = proto.setAttribute, originalRemove = proto.removeAttribute;
    proto.getAttribute = function (name) {return name === 'src' ? record(this).src || null : originalGet.call(this, name);};
    proto.setAttribute = function (name, value) {if (name === 'src') this.src = value; else originalSet.call(this, name, value);};
    proto.removeAttribute = function (name) {if (name === 'src') record(this).src = ''; else originalRemove.call(this, name);};
    const originalAdd = proto.addEventListener, originalOff = proto.removeEventListener;
    proto.addEventListener = function (type, fn, opts) {const r = record(this); (r.listeners[type] ||= []).push(fn); return originalAdd.call(this, type, fn, opts);};
    proto.removeEventListener = function (type, fn, opts) {const r = record(this); r.listeners[type] = (r.listeners[type] || []).filter(f => f !== fn); return originalOff.call(this, type, fn, opts);};
    proto.load = function () {record(this).loads++;};
    proto.pause = function () {const r = record(this), wasPlaying = !r.paused; r.pauses++; r.paused = true; if (wasPlaying) this.dispatchEvent(new Event('pause'));};
    proto.play = function () {
      const r = record(this); r.plays++; r.paused = false; r.ended = false;
      for (const type of ['playing', 'ended', 'error', 'pause', 'waiting']) r.callbacks[type] = [this['on' + type], ...(r.listeners[type] || [])].filter(f => typeof f === 'function');
      window.__chirpMedia.plays.push({id: r.id, src: r.src, playbackRate: this.playbackRate, preservesPitch: this.preservesPitch, muted: this.muted, volume: this.volume});
      const mode = window.__chirpMedia.nextPlay; window.__chirpMedia.nextPlay = 'resolve';
      if (mode === 'reject') {r.paused = true; return Promise.reject(new DOMException('Fixture autoplay denial', 'NotAllowedError'));}
      if (mode === 'pending') return new Promise((resolve, reject) => {r.resolve = resolve; r.reject = reject;});
      queueMicrotask(() => {if (!r.paused && r.src) this.dispatchEvent(new Event('playing'));});
      return Promise.resolve();
    };
    window.Audio = function (src) {const node = document.createElement('audio'); record(node); if (src !== undefined) node.src = src; return node;};
    window.Audio.prototype = HTMLAudioElement.prototype;
    window.SpeechSynthesisUtterance = class {constructor(text) {this.text = text;}};
    Object.defineProperty(window, 'speechSynthesis', {value: {cancel() {}, addEventListener() {}, removeEventListener() {}, getVoices() {window.__chirpMedia.speechVoiceReads++; return [];}, speak(u) {window.__chirpMedia.speech.push({text: u.text, lang: u.lang});}}});
  }, {saved, key: STORAGE});
  await context.route('**/*', async route => {
    const req = route.request(), url = new URL(req.url());
    if (url.origin !== ORIGIN) {
      if (/^fonts\.(?:googleapis|gstatic)\.com$/.test(url.hostname) && !req.isNavigationRequest()) return route.abort();
      report.unexpected.push({origin: url.origin, path: url.pathname, method: req.method()}); return route.abort();
    }
    if (url.pathname === '/.netlify/functions/tts' && req.method() === 'GET' && url.searchParams.get('catalog') === 'chirp3') {
      assert.equal(url.searchParams.get('selectionVersion'), SELECTION_VERSION, 'catalogue URL pins the approved selection edition');
      assert.deepEqual([...url.searchParams.keys()].sort(), ['catalog', 'selectionVersion']);
      f.catalogueGets++; report.api.push({path: url.pathname, kind: 'catalogue', status: f.catalogueStatus, selectionVersion: url.searchParams.get('selectionVersion')});
      return route.fulfill({status: f.catalogueStatus, json: f.catalogueStatus === 200 ? f.catalogue : {error: 'tts_catalogue_unavailable'}});
    }
    if (url.pathname === '/.netlify/functions/check-status' && req.method() === 'GET') return route.fulfill({json: {paid: false}});
    if (url.pathname === '/.netlify/functions/get-pricing' && req.method() === 'GET') return route.fulfill({json: {monthlyDisplay: '7,90 €', annualDisplay: '42 €', country: 'FR'}});
    if (url.pathname === '/api/geolocation' && req.method() === 'GET') return route.fulfill({json: {country: 'FR'}});
    if (req.method() !== 'GET' || /^\/(?:\.netlify|api)\//.test(url.pathname)) {
      report.unexpected.push({path: url.pathname, method: req.method(), why: 'All media must be captured in memory; no remote audio or mutation is expected'}); return route.abort();
    }
    const relative = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname).slice(1), file = path.resolve(WEB, relative);
    if (!file.startsWith(WEB + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return route.fulfill({status: 404, body: 'Not found'});
    return route.fulfill({body: fs.readFileSync(file), contentType: ({'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp'})[path.extname(file)] || 'application/octet-stream'});
  });
  const page = f.page = await context.newPage(); page.on('pageerror', e => report.errors.push(e.message)); page.on('framenavigated', frame => {if (frame === page.mainFrame()) f.navigation.push(frame.url());});
  await page.goto(ORIGIN + entry); return f;
}
const settled = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
async function readyPage(f) {await f.page.waitForFunction(() => window.MelungaVoiceSelection?.state().status === 'ready'); await f.page.locator('.vc-language').last().waitFor(); await settled(f.page);}
const card = (page, language) => page.locator('.vc-language[data-language="' + language + '"]');
const listenButton = (page, language, voice) => page.locator('[data-listen][data-language="' + language + '"][data-voice="' + voice + '"]');
const radio = (page, language, voice) => page.locator('[data-select][data-language="' + language + '"][data-voice="' + voice + '"]');
async function media(page) {return page.evaluate(() => ({plays: window.__chirpMedia.plays, speech: window.__chirpMedia.speech, voiceReads: window.__chirpMedia.speechVoiceReads, records: window.__chirpMedia.records.map(r => ({id: r.id, src: r.src, paused: r.paused, ended: r.ended, pauses: r.pauses, loads: r.loads})), selected: localStorage.getItem('melunga-preview-voice-selection-v1')}));}
async function emit(page, id, type, stale = false) {await page.evaluate(({id, type, stale}) => {const r = window.__chirpMedia.records[id]; if (type === 'ended') {r.ended = true; r.paused = true;} if (type === 'error') r.paused = true; if (stale) for (const fn of r.callbacks[type] || []) fn.call(r.node, new Event(type)); else r.node.dispatchEvent(new Event(type));}, {id, type, stale}); await settled(page);}
function request(play) {const u = new URL(play.src); assert.equal(u.origin, ORIGIN); assert.equal(u.pathname, '/.netlify/functions/tts'); assert.deepEqual([...u.searchParams.keys()].sort(), ['lang', 'rate', 'text', 'voice']); return {voice: u.searchParams.get('voice'), languageCode: u.searchParams.get('lang'), text: u.searchParams.get('text'), rate: Number(u.searchParams.get('rate'))};}
async function assertSingleMedia(page) {const s = await media(page); assert.ok(s.records.filter(r => !r.paused && !r.ended && r.src).length <= 1, 'only one media remains active'); assert.equal(s.speech.length, 0, 'no browser voice replaces a comparison'); return s;}
async function shot(page, name) {const file = path.join(captures, name + '.png'); await page.screenshot({path: file, animations: 'disabled'}); report.screenshots.push(file);}
async function firstModernLesson(page, pair) {await page.waitForFunction(pair => window.MelungaMockup?.state().screen === 'themes' && window.MelungaMockup.state().pairId === pair, pair); await page.locator('#mgThemeGrid .mg-theme:not([data-access="paid"])').first().click(); await page.waitForFunction(() => window.MelungaMockup.state().screen === 'lesson'); await page.waitForFunction(() => window.MelungaVoiceSelection?.state().status === 'ready'); await settled(page);}
async function modernVoiceMenu(page) {if (await page.locator('#mgMenuTrigger').isVisible()) {await page.locator('#mgMenuTrigger').click(); await page.locator('#mgMenuNav [data-menu-item="voice"]').click();} else await page.locator('#mgDesktopNav [data-menu-item="voice"]').click(); await page.locator('#mgVoicePanel').waitFor({state: 'visible'});}


test('card sources, classic literals and payment contracts stay identical before the voice preview', () => checked('preserved-content-and-prices', async () => {
  assert.equal(canonicalFiles.length, 78);
  for (const file of canonicalFiles.concat(preserved)) assert.ok(read(file).equals(baseline(file)), 'immutable source ' + file);
  const app = read('app.html').toString(), oldApp = baseline('app.html').toString();
  for (const name of ['DECKS', 'PEDAGOGY_FAMILIES']) {
    const prefix = 'var ' + name + ' = ', now = app.split('\n').filter(line => line.startsWith(prefix)), old = oldApp.split('\n').filter(line => line.startsWith(prefix));
    assert.equal(now.length, 1); assert.equal(old.length, 1); assert.equal(sha(now[0]), sha(old[0]), 'whole classic ' + name + ' literal');
  }
  const html = read('comparaison-voix.html').toString(), appManifest = json('voice-comparison.webmanifest');
  assert.match(html, /name="apple-mobile-web-app-capable" content="yes"/);
  assert.match(html, /rel="apple-touch-icon"/); assert.match(html, /rel="manifest" href="voice-comparison\.webmanifest"/);
  assert.equal(appManifest.display, 'standalone'); assert.equal(new URL(appManifest.start_url, ORIGIN + PAGE).origin, ORIGIN);
  assert.equal(new URL(appManifest.start_url, ORIGIN + PAGE).pathname, PAGE);
  assert.doesNotMatch(read('voice-comparison.js').toString(), /serviceWorker\.register/);
  report.cases.push({name: 'source-and-install-metadata', canonicalJson: 78, preservedFiles: preserved.length,
    installMetadataPresent: true, installationExecuted: false, offlineVoiceAvailabilityClaimed: false});
}));

test('seven languages expose three named Chirp voices plus WaveNet and compare the same studied text without a default favorite', {timeout: 90000}, () => checked('seven-language-comparisons', async () => {
  const f = await fixture();
  try {
    const p = f.page; await readyPage(f);
    assert.equal(await p.locator('.vc-language').count(), 7); assert.equal(await p.locator('[data-listen]').count(), 28);
    assert.equal(await p.locator('[data-select]:checked').count(), 0); assert.equal((await media(p)).selected, null);
    assert.equal(await p.locator('#vcCopy').isDisabled(), true); assert.equal(await p.locator('#vcDownload').isDisabled(), true);
    for (const language of LANGUAGES) {
      const row = f.catalogue.languages[language], choices = [row.waveNet, ...row.chirp], study = await card(p, language).locator('.vc-study').textContent();
      assert.ok(study.trim()); assert.equal(await card(p, language).locator('.vc-study').getAttribute('lang'), language);
      assert.equal(await card(p, language).locator('[data-listen]').count(), 4);
      for (const choice of choices) {
        const option = card(p, language).locator('.vc-option[data-voice="' + choice.name + '"]');
        assert.equal(await option.locator('.vc-gender').textContent(), choice.gender === 'MALE' ? 'Voix masculine' : 'Voix féminine');
        await listenButton(p, language, choice.name).click(); await settled(p);
        const s = await assertSingleMedia(p), play = s.plays.at(-1), sent = request(play);
        assert.deepEqual(sent, {voice: choice.name, languageCode: choice.languageCode, text: study, rate: 1});
        assert.equal(play.playbackRate, 1); assert.equal(play.muted, false); assert.equal(play.volume, 1);
        assert.equal(await p.locator('#audioComparison').getAttribute('controls'), ''); assert.equal(await p.locator('#audioComparison').getAttribute('playsinline'), '');
        assert.equal(await p.locator('#audioComparison').getAttribute('preload'), 'none');
        assert.equal(await radio(p, language, choice.name).isChecked(), false, 'listening alone never marks a favorite');
        await emit(p, play.id, 'ended'); await assertSingleMedia(p);
        report.cases.push({name: 'named-same-text-comparison', language, voice: choice.name, engine: choice.engine, gender: choice.gender, text: study, rate: 1});
      }
    }
    const before = await media(p); assert.equal(before.selected, null); assert.equal(before.voiceReads, 0); assert.equal(before.speech.length, 0);
    const first = f.catalogue.languages.es.chirp[0], second = f.catalogue.languages.es.chirp[1];
    await p.evaluate(() => window.__chirpMedia.nextPlay = 'pending');
    await listenButton(p, 'es', first.name).click(); let s = await media(p); const oldId = s.plays.at(-1).id;
    await listenButton(p, 'es', second.name).click(); s = await assertSingleMedia(p); const currentId = s.plays.at(-1).id;
    assert.notEqual(oldId, currentId); assert.equal(s.records.find(r => r.id === oldId).paused, true);
    await p.evaluate(id => window.__chirpMedia.records[id].reject?.(new DOMException('Old pending promise', 'NotAllowedError')), oldId);
    await emit(p, oldId, 'error', true); assert.ok((await card(p, 'es').locator('.vc-card-status').textContent()).includes('Écoute en cours'));
    await p.locator('#vcStop').click(); s = await assertSingleMedia(p); assert.equal(s.records.every(r => r.paused || !r.src), true);
    assert.equal(await p.locator('#vcPlayerPanel').isHidden(), true);
    await listenButton(p, 'es', second.name).click(); await p.locator('[data-language-jump][href="#lang-fr"]').click();
    s = await assertSingleMedia(p); assert.equal(s.records.every(r => r.paused || !r.src), true, 'jumping to another language stops the old sample');
    await shot(p, 'comparison-android-profile-390');
  } finally {await f.context.close();}
}));

test('catalogue and media failures remain explicit, partial availability cannot fabricate voices and failed storage cannot pretend to save', {timeout: 90000}, () => checked('errors-and-partial-catalogue', async () => {
  {
    const f = await fixture({mode: 'failed'});
    try {
      const p = f.page; await p.locator('#vcRetryCatalogue').waitFor({state: 'visible'});
      assert.equal(await p.locator('[data-listen]').count(), 0); assert.match(await p.locator('#vcCatalogueStatus').textContent(), /indisponible/i);
      assert.equal((await media(p)).plays.length, 0); f.catalogueStatus = 200;
      await p.locator('#vcRetryCatalogue').click(); await readyPage(f); assert.equal(await p.locator('[data-listen]').count(), 28); assert.equal(f.catalogueGets, 2);
      report.cases.push({name: 'catalogue-503-and-user-retry', requests: f.catalogueGets, browserVoiceSubstitution: false});
    } finally {await f.context.close();}
  }
  {
    const f = await fixture({unavailable: ['es']});
    try {
      const p = f.page; await readyPage(f); assert.equal(await card(p, 'es').locator('[data-listen]').count(), 1);
      assert.equal(await card(p, 'es').locator('[data-select]').count(), 1); assert.match(await card(p, 'es').locator('.vc-card-status').textContent(), /pas disponibles/i);
      assert.equal(await p.locator('[data-listen]').count(), 25); assert.match(await p.locator('#vcCatalogueStatus').textContent(), /partie.*indisponible/i);
      const wave = f.catalogue.languages.es.waveNet; await listenButton(p, 'es', wave.name).click();
      let s = await assertSingleMedia(p); assert.equal(request(s.plays.at(-1)).voice, wave.name);
      await emit(p, s.plays.at(-1).id, 'error'); s = await media(p);
      assert.match(await card(p, 'es').locator('.vc-card-status').textContent(), /Audio indisponible/i);
      const plays = s.plays.length; await settled(p); assert.equal((await media(p)).plays.length, plays); assert.equal(s.speech.length, 0); assert.equal(s.voiceReads, 0);
      await listenButton(p, 'es', wave.name).click(); s = await assertSingleMedia(p); assert.equal(s.plays.length, plays + 1, 'media failure allows an explicit new server attempt');
      await p.locator('#vcStop').click();
      const choice = f.catalogue.languages.fr.chirp[0];
      await p.evaluate(key => {const original = Storage.prototype.setItem; Storage.prototype.setItem = function (name, value) {if (name === key) throw new DOMException('Fixture storage full', 'QuotaExceededError'); return original.call(this, name, value);};}, STORAGE);
      await radio(p, 'fr', choice.name).click(); assert.equal(await radio(p, 'fr', choice.name).isChecked(), false);
      assert.equal(await p.evaluate(() => window.MelungaVoiceSelection.getSelected('fr')), null); assert.equal((await media(p)).selected, null);
      assert.match(await card(p, 'fr').locator('.vc-card-status').textContent(), /Impossible.*enregistrer/i);
      report.cases.push({name: 'partial-catalogue-media-error-and-storage-failure', unavailable: 'es', availableChoices: 25, silentReplacement: false});
    } finally {await f.context.close();}
  }
  {
    const f = await fixture();
    try {
      const p = f.page; await readyPage(f); const voice = f.catalogue.languages.fr.chirp[0];
      await p.evaluate(() => window.__chirpMedia.nextPlay = 'reject'); await listenButton(p, 'fr', voice.name).click(); await settled(p);
      const s = await media(p); assert.equal(s.plays.length, 1); assert.equal(s.speech.length, 0); assert.equal(s.voiceReads, 0);
      assert.match(await card(p, 'fr').locator('.vc-card-status').textContent(), /Audio indisponible/i);
      report.cases.push({name: 'autoplay-rejection-no-comparison-fallback'});
      await p.clock.install(); await p.evaluate(() => window.__chirpMedia.nextPlay = 'pending');
      await listenButton(p, 'fr', voice.name).click(); const pendingId = (await media(p)).plays.at(-1).id;
      await p.clock.fastForward(20001); assert.match(await card(p, 'fr').locator('.vc-card-status').textContent(), /Audio indisponible/i);
      let timedOut = await media(p); assert.equal(timedOut.records.find(r => r.id === pendingId).paused, true, 'a timed-out comparison is stopped');
      await emit(p, pendingId, 'playing', true); await p.evaluate(id => window.__chirpMedia.records[id].resolve?.(), pendingId); await settled(p);
      timedOut = await media(p); assert.match(await card(p, 'fr').locator('.vc-card-status').textContent(), /Audio indisponible/i);
      assert.equal(await listenButton(p, 'fr', voice.name).getAttribute('aria-busy'), null); assert.equal(timedOut.speech.length, 0);
      report.cases.push({name: 'timed-out-pending-media-never-restarts-from-late-events'});
    } finally {await f.context.close();}
  }
}));

test('explicit choices persist, export exact names and route the modern lesson through the selected voice at each speed', {timeout: 90000}, () => checked('selection-export-and-modern-lesson', async () => {
  const f = await fixture();
  try {
    const p = f.page; await readyPage(f); const choice = f.catalogue.languages.es.chirp[2];
    await radio(p, 'es', choice.name).check(); assert.equal(await radio(p, 'es', choice.name).isChecked(), true);
    let stored = JSON.parse((await media(p)).selected); assert.deepEqual(stored, {version: 1, choices: {es: choice.name}});
    assert.equal(await p.evaluate(() => localStorage.getItem('melunga-guided-known-v1')), null); assert.equal(await p.evaluate(() => localStorage.getItem('melunga-guided-review-v1')), null);
    await p.reload(); await readyPage(f); assert.equal(await radio(p, 'es', choice.name).isChecked(), true); assert.equal(await p.locator('[data-select]:checked').count(), 1);
    await p.evaluate(() => {window.__qaClipboard = []; Object.defineProperty(navigator, 'clipboard', {configurable: true, value: {writeText: async text => {window.__qaClipboard.push(text);}}});});
    await p.locator('#vcCopy').click(); const copied = await p.evaluate(() => window.__qaClipboard[0]); assert.ok(copied.includes(choice.name)); assert.ok(copied.includes('Espagnol'));
    const downloadPromise = p.waitForEvent('download'); await p.locator('#vcDownload').click(); const download = await downloadPromise;
    assert.equal(download.suggestedFilename(), 'melunga-choix-voix.txt'); const downloadPath = await download.path();
    const exported = fs.readFileSync(downloadPath, 'utf8'); assert.equal(exported.trimEnd(), copied.trimEnd());
    await p.locator('#vcLessons').click(); await p.waitForURL(url => url.pathname === '/parcours-niveaux.html');
    assert.equal(new URL(p.url()).origin, ORIGIN); await p.goto(ORIGIN + '/parcours-niveaux.html?pair=fr-es&level=1'); await firstModernLesson(p, 'fr-es');
    const studied = await p.locator('#mgPhrase').textContent(); await p.locator('#mgListen').click(); let s = await assertSingleMedia(p), play = s.plays.at(-1);
    assert.deepEqual(request(play), {voice: choice.name, languageCode: choice.languageCode, text: studied, rate: 1}); assert.equal(play.playbackRate, 0.85); assert.equal(play.preservesPitch, true);
    await modernVoiceMenu(p); await p.locator('#mgSpeed').selectOption('0.75'); await p.keyboard.press('Escape'); await p.locator('#mgMenuDialog').waitFor({state: 'hidden'});
    assert.equal((await media(p)).records.every(r => r.paused || !r.src), true, 'speed changes stop the old media');
    await p.locator('#mgListen').click(); s = await assertSingleMedia(p); play = s.plays.at(-1); assert.equal(request(play).rate, 1); assert.equal(play.playbackRate, 0.75);
    await modernVoiceMenu(p); await p.locator('#mgSpeed').selectOption('1'); await p.keyboard.press('Escape'); await p.locator('#mgMenuDialog').waitFor({state: 'hidden'});
    await p.locator('#mgListen').click(); s = await assertSingleMedia(p); play = s.plays.at(-1); assert.equal(request(play).rate, 1); assert.equal(play.playbackRate, 1);
    await p.locator('#mgBack').click(); assert.equal((await media(p)).records.every(r => r.paused || !r.src), true, 'returning to themes stops media');
    assert.equal(await p.evaluate(() => localStorage.getItem('melunga-guided-known-v1')), null); assert.equal(await p.evaluate(() => localStorage.getItem('melunga-guided-review-v1')), null);
    report.cases.push({name: 'explicit-preference-export-and-modern-route', language: 'es', voice: choice.name, rates: [0.85, 0.75, 1], sameOrigin: true, progressChanged: false});
  } finally {await f.context.close();}
}));

test('classic and modern readers honor an explicit WaveNet or Chirp preference without applying speed twice', {timeout: 90000}, () => checked('classic-choice-and-wave-net', async () => {
  const data = catalogue(), chirp = data.languages.es.chirp.find(voice => voice.name !== APPROVED_DEFAULTS.es && voice.gender === 'MALE'), wave = data.languages.es.waveNet;
  assert.ok(chirp && chirp.name !== APPROVED_DEFAULTS.es, 'classic explicit choice must differ from its approved default');
  const f = await fixture({width: 1366, height: 900, android: false, saved: {version: 1, choices: {es: chirp.name}}, entry: '/app.html?classic=1&start=1&lang=fr&study=es'});
  try {
    const p = f.page; await p.waitForFunction(() => window.MelungaVoiceSelection?.state().status === 'ready' && typeof lang === 'string' && lang === 'es' && typeof pool !== 'undefined' && pool.length > 0);
    await p.locator('#listen').waitFor({state: 'visible'}); await p.locator('#listen').click(); await settled(p);
    let s = await assertSingleMedia(p), play = s.plays.at(-1); assert.equal(request(play).voice, chirp.name); assert.equal(request(play).languageCode, chirp.languageCode); assert.equal(request(play).rate, 1); assert.equal(play.playbackRate, 1);
    // The legacy speed buttons are hidden by its existing CSS. Exercise the
    // unchanged controller route without claiming that hidden UI was clicked.
    await p.evaluate(() => setSpeed(true, document.getElementById('sS'))); await settled(p); s = await assertSingleMedia(p); play = s.plays.at(-1);
    assert.equal(request(play).voice, chirp.name); assert.equal(request(play).rate, 1); assert.equal(play.playbackRate, 0.75); assert.equal(play.preservesPitch, true);
    await p.goto(ORIGIN + PAGE); await readyPage(f); await radio(p, 'es', wave.name).check();
    await p.goto(ORIGIN + '/parcours-niveaux.html?pair=fr-es&level=1'); await firstModernLesson(p, 'fr-es');
    await modernVoiceMenu(p); await p.locator('#mgSpeed').selectOption('0.75'); await p.keyboard.press('Escape'); await p.locator('#mgMenuDialog').waitFor({state: 'hidden'});
    const studied = await p.locator('#mgPhrase').textContent(); await p.locator('#mgListen').click(); s = await assertSingleMedia(p); play = s.plays.at(-1);
    assert.deepEqual(request(play), {voice: wave.name, languageCode: wave.languageCode, text: studied, rate: 0.75}); assert.equal(play.playbackRate, 1);
    report.cases.push({name: 'classic-and-modern-preference-speed', chirpVoice: chirp.name, classicSlowRate: 0.75, classicSlowExercisedVia: 'existing controller; legacy speed control is hidden', waveNetVoice: wave.name, waveNetServerRate: 0.75, rateAppliedOnce: true});
  } finally {await f.context.close();}
}));

test('fresh devices use the seven approved defaults in both readers without writing personal favorites', {timeout: 150000}, () => checked('approved-defaults-in-both-readers', async () => {
  for (const language of LANGUAGES) {
    const pair = language === 'fr' ? 'zh-fr' : 'fr-' + language;
    for (const reader of ['modern', 'classic']) {
      const entry = reader === 'modern' ? '/parcours-niveaux.html?pair=' + pair + '&level=1'
        : '/app.html?classic=1&start=1&lang=' + pair.split('-')[0] + '&study=' + language;
      const f = await fixture({entry, width: reader === 'classic' ? 1366 : 390, height: 844, android: reader !== 'classic'});
      try {
        const p = f.page;
        if (reader === 'modern') await firstModernLesson(p, pair);
        else await p.waitForFunction(language => window.MelungaVoiceSelection?.state().status === 'ready'
          && typeof lang === 'string' && lang === language && typeof pool !== 'undefined' && pool.length > 0, language);
        await p.waitForFunction(() => window.MelungaVoiceSelection?.state().status === 'ready');
        const before = await media(p); assert.equal(before.selected, null, 'approved defaults are not personal storage choices');
        const snapshot = await p.evaluate(language => window.MelungaVoiceSelection.getSnapshot(language), language);
        assert.equal(snapshot.selected, null); assert.equal(snapshot.voice.name, APPROVED_DEFAULTS[language]);
        assert.equal(snapshot.defaultVoice.name, APPROVED_DEFAULTS[language]); assert.equal(snapshot.approvedDefault.name, APPROVED_DEFAULTS[language]); assert.equal(snapshot.usesApprovedDefault, true); assert.equal(snapshot.provisional, false);
        assert.equal(snapshot.sourceMetadata.selectionVersion, SELECTION_VERSION); assert.equal(snapshot.sourceMetadata.choiceSource, 'approved-default');
        assert.equal(snapshot.voice.gender, language === 'it' ? 'MALE' : 'FEMALE');
        await p.locator(reader === 'modern' ? '#mgListen' : '#listen').click(); await settled(p);
        const current = await assertSingleMedia(p), played = current.plays.at(-1), sent = request(played);
        assert.equal(sent.voice, APPROVED_DEFAULTS[language], language + ' ' + reader + ' uses the approved voice, not the first candidate');
        assert.equal(sent.languageCode, VOICES[language][0]); assert.equal(sent.rate, 1);
        assert.equal(played.playbackRate, reader === 'modern' ? 0.85 : 1);
        assert.equal(current.selected, null); assert.equal(current.speech.length, 0);
        assert.equal(await p.evaluate(() => localStorage.getItem('melunga-guided-known-v1')), null);
        assert.equal(await p.evaluate(() => localStorage.getItem('melunga-guided-review-v1')), null);
        report.cases.push({name: 'fresh-device-approved-default', language, reader, voice: sent.voice, languageCode: sent.languageCode,
          gender: snapshot.voice.gender, selectionVersion: SELECTION_VERSION, choiceSource: 'approved-default', personalFavoriteWritten: false});
      } finally {await f.context.close();}
    }
  }
}));

test('an unavailable approved voice never silently switches to another Chirp and an incomplete comparison may retain its verified default', {timeout: 60000}, () => checked('missing-approved-default-never-substitutes', async () => {
  {
    const f = await fixture({missingDefaults: ['es'], entry: '/parcours-niveaux.html?pair=fr-es&level=1'});
    try {
      const p = f.page; await firstModernLesson(p, 'fr-es'); await p.waitForFunction(() => window.MelungaVoiceSelection?.state().status === 'ready');
      const snapshot = await p.evaluate(() => window.MelungaVoiceSelection.getSnapshot('es'));
      assert.equal(snapshot.defaultVoice, null); assert.equal(snapshot.voice, null); assert.equal(snapshot.selected, null); assert.equal(snapshot.choices.length, 4);
      await p.locator('#mgListen').click(); await settled(p); const s = await media(p);
      assert.equal(s.plays.length, 0); assert.equal(s.speech.length, 0); assert.equal(s.selected, null);
      assert.match(await p.locator('#mgStatus').textContent(), /Audio indisponible/i);
      await p.goto(ORIGIN + PAGE); await readyPage(f); assert.equal(await p.locator('[data-select]:checked').count(), 0);
      const explicit = f.catalogue.languages.es.waveNet;
      await radio(p, 'es', explicit.name).check();
      await p.goto(ORIGIN + '/parcours-niveaux.html?pair=fr-es&level=1'); await firstModernLesson(p, 'fr-es');
      await p.locator('#mgListen').click(); await settled(p); const chosen = await media(p);
      assert.equal(request(chosen.plays.at(-1)).voice, explicit.name, 'a valid explicit preference still overrides a missing default');
      report.cases.push({name: 'missing-approved-default-no-implicit-substitution', language: 'es', implicitMediaPlays: 0, explicitOverride: explicit.name});
    } finally {await f.context.close();}
  }
  {
    const f = await fixture({defaultOnly: ['it'], entry: '/parcours-niveaux.html?pair=fr-it&level=1'});
    try {
      const p = f.page; await firstModernLesson(p, 'fr-it'); await p.waitForFunction(() => window.MelungaVoiceSelection?.state().status === 'ready');
      const snapshot = await p.evaluate(() => window.MelungaVoiceSelection.getSnapshot('it'));
      assert.equal(snapshot.choices.length, 2); assert.equal(snapshot.defaultVoice.name, APPROVED_DEFAULTS.it); assert.equal(snapshot.voice.name, APPROVED_DEFAULTS.it);
      assert.equal(snapshot.approvedDefault.name, APPROVED_DEFAULTS.it); assert.equal(snapshot.usesApprovedDefault, true); assert.equal(snapshot.selected, null);
      await p.locator('#mgListen').click(); await settled(p); const s = await media(p);
      assert.equal(request(s.plays.at(-1)).voice, APPROVED_DEFAULTS.it); assert.equal(s.selected, null);
      report.cases.push({name: 'incomplete-comparison-retains-approved-default', language: 'it', choices: 2, voice: APPROVED_DEFAULTS.it});
    } finally {await f.context.close();}
  }
}));

test('comparison controls and full language rows remain reachable on desktop, short Android profiles and large text', {timeout: 90000}, () => checked('short-screen-layout', async () => {
  for (const size of [{width: 1440, height: 900, android: false}, {width: 390, height: 700, android: true}, {width: 320, height: 568, android: true}, {width: 844, height: 390, android: true}, {width: 320, height: 568, android: true, largeText: true}]) {
    const f = await fixture(size);
    try {
      const p = f.page; await readyPage(f);
      if (size.largeText) await p.addStyleTag({content: 'body{font-size:200%} .vc-voice-name,.vc-gender,.vc-favorite,.vc-listen{font-size:1.2em!important}'});
      const first = f.catalogue.languages.fr.chirp[0], last = f.catalogue.languages.ko.chirp[2];
      await listenButton(p, 'fr', first.name).click(); await settled(p);
      const bounds = await p.evaluate(() => ({width: innerWidth, documentWidth: document.documentElement.scrollWidth, controls: ['vcStop', 'audioComparison'].map(id => {const n = document.getElementById(id), r = n.getBoundingClientRect(); return {id, left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height};}), height: innerHeight}));
      assert.ok(bounds.documentWidth <= bounds.width + 1, 'no horizontal page overflow');
      for (const r of bounds.controls) assert.ok(r.left >= -1 && r.right <= bounds.width + 1 && r.top >= -1 && r.bottom <= bounds.height + 1, 'visible player control ' + r.id);
      await p.locator('#vcStop').click(); await listenButton(p, 'ko', last.name).click(); await settled(p);
      await assertSingleMedia(p); assert.equal(await p.locator('#vcNowLanguage').textContent(), 'Coréen');
      await p.locator('#vcStop').click(); await p.locator('[data-language-jump][href="#lang-fr"]').click(); await shot(p, 'comparison-' + size.width + 'x' + size.height + (size.largeText ? '-large-text' : ''));
      report.cases.push({name: 'reachable-comparison-layout', ...size, engine: 'Chromium', physicalDevice: false, playerBounds: bounds});
    } finally {await f.context.close();}
  }
}));
