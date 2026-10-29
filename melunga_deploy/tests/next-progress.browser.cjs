/* Acceptance for the approved Next = validate rule. Exercise the real page,
 * source content and visible controls; only access, voice catalogue and media
 * are local fixtures. No account, provider or user data are used.
 * Run with NODE_PATH pointing at playwright-core and CHROMIUM_PATH if needed.
 * Optional NEXT_PROGRESS_REPORT and NEXT_PROGRESS_CAPTURES write evidence. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { test, before, after } = require('node:test');
const { chromium } = require('playwright-core');
const ROOT = path.resolve(__dirname, '../..');
const WEB = path.join(ROOT, 'melunga_deploy');
const ORIGIN = 'https://next-progress.test';
const KNOWN = 'melunga-guided-known-v1', REVIEW = 'melunga-guided-review-v1';
const read = file => JSON.parse(fs.readFileSync(path.join(WEB, file), 'utf8'));
const codes = ['fr', 'en', 'es', 'zh', 'it', 'ja', 'ko'];
const manifest = read('content/niveaux-progressifs/manifest.json');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const inputFiles = [...new Set([
  __filename,
  ...fs.readdirSync(WEB).filter(name => /\.(html|js|css)$/.test(name)).map(name => path.join(WEB, name)),
  ...['content/course-access.json', 'content/maquette-guidee.json', 'content/niveaux-progressifs/manifest.json',
    'content/native-catalogue/manifest.json', ...codes.map(code => 'content/native-catalogue/' + code + '.json'),
    ...fs.readdirSync(path.join(WEB, 'content/course-locales')).filter(name => name.endsWith('.json')).map(name => 'content/course-locales/' + name),
    ...manifest.pairs.flatMap(pair => [pair.repertoirePath, ...pair.levels.map(level => level.dataPath)])]
    .map(file => path.join(WEB, file))
])].sort();
const fingerprints = () => Object.fromEntries(inputFiles.map(file => [path.relative(ROOT, file), sha(fs.readFileSync(file))]));
const eligible = phrase => phrase && !phrase.isTemplate && phrase.kind !== 'received' && phrase.speaker !== 'B';
const recall = step => ['choose-and-recall', 'reply-without-model', 'recall'].includes(step.kind);
function source(pair = 'fr-zh', level = 1) {
  const entry = manifest.pairs.find(item => item.id === pair);
  const raw = read(entry.levels.find(item => item.level === level).dataPath);
  const bank = read(entry.repertoirePath);
  const models = new Map([...bank.phrases, ...(bank.receivedModels || []), ...raw.themes.flatMap(theme => theme.phrases)].map(phrase => [phrase.id, phrase]));
  const ids = new Set(raw.themes.filter(theme => !theme.isTemplate && !theme.isTemplateCollection)
    .flatMap(theme => theme.sequences.flatMap(sequence => sequence.phraseIds)).filter(id => eligible(models.get(id))));
  return { raw, models, ids };
}
const zh = source(), firstTheme = zh.raw.themes[0];
const firstSteps = firstTheme.sequences.flatMap(sequence => sequence.steps);
const firstIds = firstTheme.sequences.flatMap(sequence => sequence.phraseIds);
const report = { status: 'running', environment: 'Local Chromium, mobile and desktop emulation',
  physicalDeviceTested: false, safariTested: false, actualAudioPlayed: false, upstreamTtsCalled: false,
  realAccountsUsed: false, allResponsesLocalFixtures: true, cases: [], errors: [], unexpected: [], screenshots: [] };
let browser, inputs;
before(async () => {
  inputs = fingerprints();
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
});
after(async () => {
  await browser?.close();
  report.inputsStable = JSON.stringify(inputs) === JSON.stringify(fingerprints());
  report.inputSha256 = inputs;
  report.status = report.cases.length === 6 && !report.errors.length && !report.unexpected.length && report.inputsStable ? 'passed' : 'failed';
  if (process.env.NEXT_PROGRESS_REPORT) fs.writeFileSync(process.env.NEXT_PROGRESS_REPORT, JSON.stringify(report, null, 2) + '\n');
  assert.equal(report.inputsStable, true, 'source bytes are stable throughout the acceptance run');
  assert.deepEqual(report.errors, []);
  assert.deepEqual(report.unexpected, []);
  assert.equal(report.cases.length, 6, 'all six acceptance groups completed');
});
function catalogue() {
  const now = Date.now();
  const locales = { fr: ['fr-FR', 'F', 'Aoede'], en: ['en-GB', 'C', 'Kore'], es: ['es-ES', 'F', 'Kore'],
    zh: ['cmn-CN', 'A', 'Kore'], it: ['it-IT', 'E', 'Charon'], ja: ['ja-JP', 'B', 'Kore'], ko: ['ko-KR', 'A', 'Kore'] };
  return { version: 1, source: 'google-voices-list', previewOnly: true, selectionVersion: 'kartech-2026-10-27',
    verifiedAt: new Date(now - 1000).toISOString(), expiresAt: new Date(now + 240000).toISOString(),
    languages: Object.fromEntries(codes.map(language => {
      const [languageCode, wave, approved] = locales[language];
      const chirp = [['Aoede', 'FEMALE'], ['Kore', 'FEMALE'], ['Charon', 'MALE']].map(([name, gender]) =>
        ({ name: languageCode + '-Chirp3-HD-' + name, languageCode, gender, engine: 'chirp3', rateMode: 'client' }));
      return [language, { language, available: true,
        waveNet: { name: languageCode + '-Wavenet-' + wave, languageCode, gender: 'FEMALE', engine: 'wavenet', rateMode: 'server' },
        chirp, defaultVoice: chirp.find(voice => voice.name.endsWith('-' + approved)), defaultReason: null }];
    })) };
}
async function fixture({ width = 390, height = 740, paid = false, legacy = false } = {}) {
  const context = await browser.newContext({ viewport: { width, height }, isMobile: width < 960,
    hasTouch: width < 960, reducedMotion: 'reduce', serviceWorkers: 'block' });
  await context.addInitScript(({ knownKey }) => {
    if (!sessionStorage.getItem('__nextProgressSeed')) {
      localStorage.setItem('ox_device', 'next-progress-fixture');
      localStorage.setItem('melunga-app-language', JSON.stringify({ locale: 'fr', label: 'fr' }));
      localStorage.setItem('melunga-course-pair', 'fr-zh'); localStorage.setItem('melunga-course-level', '1');
      sessionStorage.setItem('__nextProgressSeed', '1');
    }
    window.__nextKnownWriteFail = false;
    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (window.__nextKnownWriteFail && key === knownKey) throw new DOMException('Explicit known storage fixture failure', 'QuotaExceededError');
      return setItem.call(this, key, value);
    };
    window.__nextAudio = [];
    window.Audio = class extends EventTarget {
      constructor(src) { super(); this.src = src || ''; this.currentTime = 0; this.paused = true; this.playbackRate = 1; this.volume = 1; this.muted = false; }
      play() { this.paused = false; window.__nextAudio.push(this.src); queueMicrotask(() => {
        if (!this.paused && this.src) { this.onplaying?.(new Event('playing')); this.dispatchEvent(new Event('playing')); }
      }); return Promise.resolve(); }
      pause() { this.paused = true; } load() {} removeAttribute(name) { if (name === 'src') this.src = ''; }
    };
    window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
    Object.defineProperty(window, 'speechSynthesis', { value: { cancel() {}, getVoices() { return []; }, addEventListener() {}, removeEventListener() {},
      speak(utterance) { window.__nextAudio.push(utterance.text); } } });
  }, { knownKey: KNOWN });
  await context.route('**/*', async route => {
    const request = route.request(), url = new URL(request.url());
    if (url.origin !== ORIGIN || request.method() !== 'GET') {
      report.unexpected.push({ origin: url.origin, path: url.pathname, method: request.method() }); return route.abort();
    }
    if (url.pathname === '/.netlify/functions/check-status') return route.fulfill({ json: { paid } });
    if (url.pathname === '/.netlify/functions/tts' && url.searchParams.get('catalog') === 'chirp3') return route.fulfill({ json: catalogue() });
    if (url.pathname === '/.netlify/functions/get-pricing') return route.fulfill({ json: { country: 'FR', monthlyDisplay: '7,90 €', annualDisplay: '42 €' } });
    if (url.pathname === '/api/geolocation') return route.fulfill({ json: { country: 'FR' } });
    if (url.pathname === '/mobile-runtime.js') return route.fulfill({ contentType: 'text/javascript', body: '/* Explicit ordinary-web fixture. */' });
    if (/^\/(?:\.netlify|api)\//.test(url.pathname)) { report.unexpected.push({ path: url.pathname }); return route.abort(); }
    const file = path.resolve(WEB, decodeURIComponent(url.pathname).slice(1));
    if (!file.startsWith(WEB + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      report.unexpected.push({ missingFile: url.pathname }); return route.fulfill({ status: 404, body: 'Not found' });
    }
    return route.fulfill({ body: fs.readFileSync(file), contentType: {
      '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
      '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2'
    }[path.extname(file)] || 'application/octet-stream' });
  });
  const page = await context.newPage();
  page.setDefaultTimeout(8000); page.on('pageerror', error => report.errors.push(error.message));
  await page.goto(ORIGIN + (legacy ? '/maquette-guidee.html' : '/parcours-niveaux.html') + '?pair=fr-zh&level=1');
  await ready(page);
  return { page, close: () => context.close() };
}
const state = page => page.evaluate(() => window.MelungaMockup.state());
const settled = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
async function ready(page, pair = 'fr-zh') {
  await page.waitForFunction(pair => {
    const current = window.MelungaMockup?.state(); return current?.screen === 'themes' && current.pairId === pair && current.level === 1;
  }, pair, { timeout: 25000 });
  await page.waitForFunction(() => window.MelungaVoiceSelection?.state().status === 'ready');
  await page.waitForFunction(() => !document.documentElement.classList.contains('course-presentation-pending'));
  await settled(page);
}
async function enter(page, id = firstTheme.id) {
  await page.locator('#mgThemeGrid .mg-theme[data-theme-id="' + id + '"]').click();
  await page.waitForFunction(() => window.MelungaMockup.state().screen === 'lesson'); await settled(page);
}
async function next(page) {
  if (await page.locator('#mgContinue').isDisabled()) await page.locator('#mgChoices .mg-choice:visible').first().click();
  await page.locator('#mgContinue').click(); await settled(page);
}
async function known(page, pair = 'fr-zh') { return page.evaluate(({ key, pair }) => JSON.parse(localStorage.getItem(key) || '{}').pairs?.[pair] || [], { key: KNOWN, pair }); }
async function saved(page) { return page.evaluate(key => JSON.parse(localStorage.getItem(key) || '{}').entries || [], REVIEW); }
async function checkKnown(page, ids) {
  const actual = await known(page), expected = [...new Set(ids)];
  assert.equal(actual.length, expected.length, 'each known source identity is stored once');
  assert.deepEqual([...actual].sort(), expected.sort(), 'only validated production cards are known');
  const progress = (await state(page)).levelProgress;
  const count = expected.filter(id => zh.ids.has(id)).length;
  assert.deepEqual(progress, { known: count, total: zh.ids.size, ratio: count / zh.ids.size, percent: Math.floor(count / zh.ids.size * 100) });
  return progress;
}
async function snapshot(page, label) {
  return page.evaluate(label => ({ label, state: window.MelungaMockup.state(),
    knownRaw: localStorage.getItem('melunga-guided-known-v1'), savedRaw: localStorage.getItem('melunga-guided-review-v1'),
    bar: { label: document.getElementById('mgLevelPercent').textContent,
      width: document.getElementById('mgProgress').style.width,
      now: document.getElementById('mgProgress').closest('.mg-progress').getAttribute('aria-valuenow') },
    status: document.getElementById('mgStatus').textContent }), label);
}
async function themeProgress(page, ids) {
  assert.equal((await state(page)).screen, 'themes');
  const progress = await checkKnown(page, ids), snap = await snapshot(page, 'themes');
  assert.equal(snap.bar.label, progress.percent + ' %');
  assert.ok(Math.abs(parseFloat(snap.bar.width) - progress.ratio * 100) < 0.0001, 'visible level fill uses whole-level progress');
  assert.ok(Math.abs(Number(snap.bar.now) - progress.ratio * 100) < 0.0001, 'accessible progress agrees with the stored cards');
  return snap;
}
async function shot(page, name) {
  if (!process.env.NEXT_PROGRESS_CAPTURES) return;
  fs.mkdirSync(process.env.NEXT_PROGRESS_CAPTURES, { recursive: true });
  const file = path.join(process.env.NEXT_PROGRESS_CAPTURES, name + '.png');
  await page.screenshot({ path: file, animations: 'disabled' }); report.screenshots.push(path.relative(ROOT, file));
}
async function backToThemes(page) { await page.locator('.mg-brand').click(); await ready(page); }
async function resumeFirstSaved(page, id) {
  await page.locator('#mgMenuTrigger').click();
  await page.locator('#mgMenuNav [data-menu-item="À revoir"]').click();
  await page.locator('.mg-saved-review-item[data-review-id="' + id + '"] [data-review-action="resume"]').click();
  await page.waitForFunction(() => window.MelungaMockup.state().lessonScope === 'saved-review' && window.MelungaMockup.state().screen === 'lesson');
  await settled(page);
}

test('mobile visible Next validates only final production recall: first sequence 1%, complete Chinese theme 9%, reload and replay persist once', { timeout: 120000 }, async () => {
  assert.equal(zh.ids.size, 314); assert.equal(firstIds.length, 29); assert.equal(firstSteps.length, 89);
  const f = await fixture();
  try {
    const page = f.page, validated = new Set();
    const before = await themeProgress(page, []); await shot(page, 'corrected-before-mobile'); await enter(page);
    const events = [], listens = new Set(); let firstBoundary;
    for (let click = 0; click < firstSteps.length; click++) {
      const current = await state(page), step = firstSteps[current.stepIndex];
      assert.equal(current.stepIndex, click, 'all 89 guided steps remain reachable through visible Next');
      assert.equal(current.phraseId, step.utterance || step.choices?.[0]);
      const phase = step.isPreparation ? 'preparation' : recall(step) ? 'recall' : 'intermediate';
      if (!listens.has(phase) && await page.locator('#mgListen').isVisible()) {
        const previous = await known(page); await page.locator('#mgListen').click(); await settled(page);
        assert.deepEqual(await known(page), previous, 'listening/revealing does not validate a card'); listens.add(phase);
      }
      if (recall(step) && step.requiresProduction === true && !step.isPreparation && eligible(zh.models.get(current.phraseId))) validated.add(current.phraseId);
      await next(page); await checkKnown(page, validated);
      events.push({ step: step.id, phase, known: validated.size });
      if (click === 9) assert.equal(validated.size, 0, 'understand and imitate do not count as completion');
      if (click === 14) { firstBoundary = await snapshot(page, 'first source sequence complete'); assert.equal(firstBoundary.state.levelProgress.percent, 1); assert.equal(validated.size, 5); }
    }
    assert.equal((await state(page)).screen, 'done'); assert.equal(validated.size, 29);
    assert.equal(events.filter(event => event.phase === 'preparation').length, 2);
    assert.equal(await page.evaluate(() => window.__nextAudio.length > 0), true, 'actual listening controls reached the instrumented player');
    const done = await snapshot(page, 'all 29 expressions validated'); await shot(page, 'corrected-done-mobile');
    await next(page); const after = await themeProgress(page, firstIds); await shot(page, 'corrected-after-mobile');
    await page.reload(); await ready(page); const reloaded = await themeProgress(page, firstIds);
    assert.equal(reloaded.state.levelProgress.percent, 9); assert.deepEqual(await saved(page), []);
    await enter(page); for (let n = 0; n < 89; n++) await next(page);
    assert.equal((await state(page)).screen, 'done'); await next(page); await themeProgress(page, firstIds);
    report.cases.push({ name: 'chinese-mobile-real-next-completion', clicks: 89, before, firstBoundary, done, after, reloaded,
      replayClicks: 89, replayKnown: 29, events, listeningPhases: [...listens] });
  } finally { await f.close(); }
});

test('desktop visible Next validates its current production card and the complete theme persists after reload', { timeout: 60000 }, async () => {
  const f = await fixture({ width: 1366, height: 768 });
  try {
    const page = f.page, validated = new Set(); await enter(page);
    assert.equal(await page.locator('body').evaluate(node => node.classList.contains('mg-desktop-course')), true);
    for (const id of firstIds) {
      assert.equal((await state(page)).phraseId, id); validated.add(id);
      await next(page); await checkKnown(page, validated);
    }
    assert.equal((await state(page)).screen, 'done'); await next(page);
    const after = await themeProgress(page, firstIds); await shot(page, 'corrected-after-desktop');
    await page.reload(); await ready(page); const reloaded = await themeProgress(page, firstIds);
    report.cases.push({ name: 'desktop-real-next-completion', clicks: 29, after, reloaded });
  } finally { await f.close(); }
});

test('the first Chinese sequence visibly renders 1%; Korean-native French Next persists without changing the Chinese pair', { timeout: 60000 }, async () => {
  const f = await fixture();
  try {
    const page = f.page, firstFive = firstTheme.sequences[0].phraseIds;
    await enter(page); for (let click = 0; click < 15; click++) await next(page);
    await backToThemes(page); const chinese = await themeProgress(page, firstFive);
    assert.equal(chinese.bar.label, '1 %'); await shot(page, 'corrected-first-sequence-one-percent');
    const policy = read('content/native-catalogue/manifest.json'), bank = read('content/native-catalogue/fr.json');
    const allowed = new Set(policy.eligibilityGroups[policy.pairs['ko-fr'].eligibilityGroup]);
    const expectedIds = new Set(bank.levels[0].themes.filter(theme => !theme.isTemplate && !theme.isTemplateCollection)
      .flatMap(theme => theme.phraseIds).filter(id => {
        const index = Number(id.split(':').at(-1)); return allowed.has(index) && !bank.locations[index][4];
      }));
    await page.goto(ORIGIN + '/parcours-niveaux.html?pair=ko-fr&level=1'); await ready(page, 'ko-fr');
    assert.equal((await state(page)).levelProgress.total, expectedIds.size); await enter(page);
    const first = await state(page), index = Number(first.phraseId.split(':').at(-1));
    assert.ok(expectedIds.has(first.phraseId));
    assert.equal(await page.locator('#mgTranslation').textContent(), bank.cards[index][policy.policies.meaningFields.ko]);
    for (let click = 0; click < 2; click++) { await next(page); assert.deepEqual(await known(page, 'ko-fr'), []); }
    assert.equal((await state(page)).masked, true, 'actual Korean-native recall is reached');
    await next(page); assert.deepEqual(await known(page, 'ko-fr'), [first.phraseId]);
    assert.deepEqual(await known(page), firstFive, 'the Chinese pair is retained');
    await page.reload(); await ready(page, 'ko-fr');
    const reloaded = await snapshot(page, 'Korean-native French progression restored');
    assert.deepEqual(reloaded.state.levelProgress, { known: 1, total: expectedIds.size, ratio: 1 / expectedIds.size,
      percent: Math.floor(100 / expectedIds.size) });
    assert.deepEqual(await known(page, 'ko-fr'), [first.phraseId]); assert.deepEqual(await known(page), firstFive);
    await page.goto(ORIGIN + '/parcours-niveaux.html?pair=fr-zh&level=1'); await ready(page); await themeProgress(page, firstFive);
    report.cases.push({ name: 'first-sequence-visible-and-korean-native-pair-scope', chinese, koreanPair: 'ko-fr',
      validatedId: first.phraseId, koreanTotal: expectedIds.size, reloaded });
  } finally { await f.close(); }
});

test('À revoir defers a card, survives Next through the theme, and a successful saved-review recall validates and removes the reminder', { timeout: 90000 }, async () => {
  const f = await fixture();
  try {
    const page = f.page, id = firstIds[0]; await enter(page); await page.locator('#mgReplay').click(); await settled(page);
    await checkKnown(page, []); assert.deepEqual((await saved(page)).map(entry => entry.id), [id]);
    let clicks = 0;
    while ((await state(page)).screen !== 'done' && clicks++ < 100) await next(page);
    assert.equal((await state(page)).screen, 'done');
    const remaining = firstIds.filter(value => value !== id); await checkKnown(page, remaining);
    assert.deepEqual((await saved(page)).map(entry => entry.id), [id], 'later Next steps do not erase the deferred reminder');
    await next(page); const deferred = await themeProgress(page, remaining);
    await resumeFirstSaved(page, id);
    for (let n = 0; n < 2; n++) { await next(page); await checkKnown(page, remaining); assert.equal((await saved(page)).length, 1); }
    await next(page); assert.equal((await state(page)).screen, 'done'); await checkKnown(page, firstIds); assert.deepEqual(await saved(page), []);
    await backToThemes(page); await enter(page); await page.locator('#mgReplay').click(); await settled(page);
    await checkKnown(page, remaining); assert.equal((await saved(page)).length, 1, 'À revoir reverses a prior validation');
    await backToThemes(page); await enter(page); await page.locator('#mgReplay').click(); await settled(page);
    assert.equal((await saved(page)).length, 1, 'repeated À revoir keeps one reminder');
    await backToThemes(page); const after = await themeProgress(page, remaining);
    await page.reload(); await ready(page); await themeProgress(page, remaining); assert.equal((await saved(page)).length, 1);
    report.cases.push({ name: 'review-deferral-revalidation-and-deduplication', deferred, after, savedCount: 1 });
  } finally { await f.close(); }
});

test('failed known persistence blocks mobile recall and desktop Next, restores a review reminder, and allows an explicit retry', { timeout: 60000 }, async () => {
  const cases = [];
  for (const width of [390, 1366]) {
    const f = await fixture({ width, height: 768 });
    try {
      const page = f.page, id = firstIds[0]; await enter(page);
      if (width === 390) {
        await page.locator('#mgReplay').click(); await settled(page); await backToThemes(page); await resumeFirstSaved(page, id);
        await next(page); await next(page);
      }
      const before = await state(page), previousReview = await saved(page);
      await page.evaluate(() => { window.__nextKnownWriteFail = true; }); await next(page);
      const blocked = await state(page);
      assert.equal(blocked.stepIndex, before.stepIndex); assert.equal(blocked.phraseId, before.phraseId); assert.equal(blocked.screen, 'lesson');
      await checkKnown(page, []); assert.deepEqual(await saved(page), previousReview, 'failed validation restores the reminder');
      assert.match(await page.locator('#mgStatus').textContent(), /progression.*enregistrée/);
      const failure = await snapshot(page, 'storage failure blocks Next');
      await page.evaluate(() => { window.__nextKnownWriteFail = false; }); await next(page); await checkKnown(page, [id]);
      assert.deepEqual(await saved(page), []); assert.notDeepEqual(await state(page), before);
      cases.push({ width, failure, recovered: await snapshot(page, 'successful explicit retry') });
    } finally { await f.close(); }
  }
  report.cases.push({ name: 'failed-storage-does-not-consume-card', cases });
});

test('interlocutor-only turns and classic templates never become learner production progress', { timeout: 90000 }, async () => {
  const theme = zh.raw.themes.find(candidate => candidate.sequences.some(sequence => sequence.steps.some(step => step.kind === 'receive')));
  assert.ok(theme); const steps = theme.sequences.flatMap(sequence => sequence.steps), validated = new Set();
  const f = await fixture({ paid: true }); let received = 0;
  try {
    const page = f.page; await enter(page, theme.id);
    for (let click = 0; click < steps.length; click++) {
      const current = await state(page), step = steps[current.stepIndex], prior = await known(page);
      if (step.kind === 'receive') { received++; assert.equal(await page.locator('#mgReplay').isDisabled(), true); assert.equal(zh.ids.has(current.phraseId), false); }
      else if (recall(step) && step.requiresProduction === true && !step.isPreparation && eligible(zh.models.get(current.phraseId))) validated.add(current.phraseId);
      await next(page); await checkKnown(page, validated);
      if (step.kind === 'receive') assert.deepEqual(await known(page), prior, 'hearing the other speaker never counts as production');
    }
    assert.equal(received, 2); assert.equal((await state(page)).screen, 'done');
  } finally { await f.close(); }
  const classic = read('content/maquette-guidee.json').pairs.find(pair => pair.id === 'fr-zh');
  const templateTheme = classic.themes.find(theme => theme.isTemplate || theme.isTemplateCollection);
  assert.ok(templateTheme); const g = await fixture({ legacy: true });
  try {
    const page = g.page; await enter(page, templateTheme.id); let clicks = 0;
    while ((await state(page)).screen !== 'done' && clicks++ < 20) {
      assert.equal((await state(page)).template, true); assert.equal(await page.locator('#mgReplay').isDisabled(), true);
      await next(page); assert.deepEqual(await known(page), []);
    }
    assert.equal((await state(page)).screen, 'done'); assert.equal(clicks, 3); assert.deepEqual(await saved(page), []);
    report.cases.push({ name: 'received-and-template-exclusions', receivedTurns: received, productionCards: validated.size, templateNextClicks: clicks,
      templateSource: 'content/maquette-guidee.json', templateThemeId: templateTheme.id, classicKnownWrites: 0 });
  } finally { await g.close(); }
});
