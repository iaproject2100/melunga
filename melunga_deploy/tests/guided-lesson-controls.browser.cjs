/* Targeted local acceptance checks for lesson controls.
 * NODE_PATH=/tmp/melunga-review-tools/node_modules node --test tests/guided-lesson-controls.browser.cjs
 * The browser emulates desktop/mobile viewports. No public site, real phone,
 * account, billing operation or human audio/phonetic validation is exercised.
 */
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const crypto = require('node:crypto');
const {test, before, after} = require('node:test');
const {chromium} = require('playwright-core');

const PRODUCT_BASE = '946b254179e75cd342ecedab0b5448017079ffdc';
const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'content/niveaux-progressifs');
const readJson = filename => JSON.parse(fs.readFileSync(filename, 'utf8'));
const manifest = readJson(path.join(DATA, 'manifest.json'));
const cells = new Map();
const banks = new Map();
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

function cell(pairId, level) {
  const key = pairId + ':' + level;
  if (!cells.has(key)) cells.set(key, readJson(path.join(DATA, pairId, 'L' + level + '.json')));
  return cells.get(key);
}

function bank(pairId) {
  if (!banks.has(pairId)) {
    const pair = manifest.pairs.find(candidate => candidate.id === pairId);
    assert.ok(pair, 'known test pair');
    banks.set(pairId, readJson(path.join(ROOT, pair.repertoirePath)));
  }
  return banks.get(pairId);
}

function fingerprints() {
  const files = [__filename, ...['maquette-guidee.js', 'visible-sequences.js', 'course-access.js', 'content/course-access.json', 'maquette-guidee.css',
    'parcours-niveaux.html', 'maquette-guidee.html', 'app.html'].map(file => path.join(ROOT, file)),
    path.join(ROOT, 'content/maquette-guidee.json'), path.join(DATA, 'manifest.json')];
  for (const pair of manifest.pairs) {
    files.push(path.join(ROOT, pair.repertoirePath));
    for (const level of pair.levels) files.push(path.join(ROOT, level.dataPath));
  }
  return Object.fromEntries(files.sort().map(file => [path.relative(ROOT, file), sha256(fs.readFileSync(file))]));
}

const report = {
  status: 'running', approvedEntryAndMobileProductCommit: PRODUCT_BASE, environment: 'local Chromium with emulated viewports',
  publicSiteChecked: false, physicalDeviceChecked: false,
  phoneticOrNativeValidation: false,
  speechMechanism: 'mock speechSynthesis; whole study text dispatch only',
  accountMechanism: 'only GET check-status is mocked paid:true locally to exercise the full course; no real account or service request',
  checks: [], cases: [], errors: [], externalRequests: [], apiRequests: [], mockedStatusRequests: [],
  inputSha256: fingerprints(),
  requiredChecks: ['desktop-complete-card', 'pinyin-switch-persistence-and-recall',
    'mobile-four-direction-swipes', 'mobile-swipes-ignore-other-interactions',
    'mobile-complete-card', 'finger-follow-and-feedback', 'resize-and-preview-banner',
    'saved-review-persistence-pair-scope-and-removal', 'received-turn-cannot-be-saved']
};
let server, browser, base;

before(async () => {
  server = http.createServer((request, response) => {
    const pathname = new URL(request.url, 'http://fixture').pathname;
    const filename = path.resolve(ROOT, '.' + pathname);
    if (!filename.startsWith(ROOT + path.sep) || !fs.existsSync(filename) || !fs.statSync(filename).isFile()) {
      response.writeHead(404).end(); return;
    }
    response.setHeader('Content-Type', ({'.html': 'text/html', '.js': 'text/javascript',
      '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp',
      '.png': 'image/png', '.svg': 'image/svg+xml'})[path.extname(filename)] || 'application/octet-stream');
    fs.createReadStream(filename).pipe(response);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = 'http://127.0.0.1:' + server.address().port;
  browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
    args: ['--no-sandbox']});
});

after(async () => {
  await browser?.close();
  if (server) await new Promise(resolve => server.close(resolve));
  report.inputsStableDuringRun = JSON.stringify(fingerprints()) === JSON.stringify(report.inputSha256);
  if (!report.inputsStableDuringRun) report.errors.push('Product or source files changed during the run.');
  if (report.externalRequests.length || report.apiRequests.length) report.errors.push('Unexpected external/API operation.');
  if (!report.mockedStatusRequests.length) report.errors.push('The full-course account fixture was not exercised.');
  if (report.requiredChecks.some(name => !report.checks.includes(name))) report.errors.push('Incomplete lesson-control coverage.');
  const fits = report.cases.filter(entry => entry.measurements);
  report.fullCardMeasurements = fits.length;
  report.minimumMeasuredFontSizes = Object.fromEntries(['#mgPhrase', '#mgPhon', '#mgTranslation', '#mgReading']
    .map(selector => [selector, fits.flatMap(entry => entry.measurements.texts.filter(text => text.selector === selector).map(text => text.fontSize))])
    .filter(([, values]) => values.length).map(([selector, values]) => [selector, Math.min(...values)]));
  report.compactTextCases = fits.flatMap(entry => entry.measurements.texts
    .filter(text => text.fontSize < (text.selector === '#mgPhrase' ? 16 : text.selector === '#mgReading' ? 12 : 14) - 0.05)
    .map(text => ({pair: entry.pair, phraseId: entry.phraseId, viewport: entry.viewport,
      readingVisible: entry.readingVisible, selector: text.selector, measuredFontSize: text.fontSize})));
  report.executedAt = new Date().toISOString();
  report.status = report.errors.length ? 'failed' : 'passed';
  if (process.env.GUIDED_CONTROLS_REPORT) {
    fs.writeFileSync(process.env.GUIDED_CONTROLS_REPORT, JSON.stringify(report, null, 2) + '\n');
  }
  assert.equal(report.inputsStableDuringRun, true, 'controls and content remain stable during this run');
  assert.deepEqual(report.externalRequests, [], 'no external requests');
  assert.deepEqual(report.apiRequests, [], 'no unexpected account or service requests; only GET check-status is mocked');
  assert.deepEqual(report.errors, [], 'no page errors or failed control checks');
});

async function checked(name, action) {
  try { await action(); report.checks.push(name); }
  catch (error) { report.errors.push(name + ': ' + error.message); throw error; }
}

async function open(width = 390, height = 844, intercept = async () => false, options = {}) {
  const mobile = width <= 760;
  const context = await browser.newContext({viewport: {width, height},
    isMobile: mobile, hasTouch: mobile, reducedMotion: options.reducedMotion || 'reduce'});
  await context.addInitScript(() => {
    window.__controlSpeech = [];
    window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
    Object.defineProperty(window, 'speechSynthesis', {value: {
      cancel() {}, getVoices() { return []; }, addEventListener() {},
      speak(utterance) {
        window.__controlSpeech.push({text: utterance.text, lang: utterance.lang});
        utterance.onend?.();
      }
    }});
  });
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin !== base) {
      report.externalRequests.push(url.origin + url.pathname); await route.abort(); return;
    }
    if (url.pathname === '/.netlify/functions/check-status' && route.request().method() === 'GET') {
      report.mockedStatusRequests.push({method:'GET', path:url.pathname, paid:true});
      await route.fulfill({status:200, contentType:'application/json', body:JSON.stringify({paid:true})});
      return;
    }
    if (/\/(?:\.netlify|api)\//.test(url.pathname)) {
      report.apiRequests.push(url.pathname); await route.abort(); return;
    }
    if (await intercept(route, url)) return;
    await route.continue();
  });
  const page = await context.newPage();
  page.on('pageerror', error => report.errors.push(error.message));
  return {context, page};
}

async function ready(page, pairId, level) {
  await page.waitForFunction(({pairId, level}) => {
    const state = window.MelungaMockup?.state();
    return state?.screen === 'themes' && state.pairId === pairId && state.level === level;
  }, {pairId, level});
}

async function visit(page, pairId, level) {
  await page.goto(base + '/parcours-niveaux.html?pair=' + pairId + '&level=' + level);
  await ready(page, pairId, level);
}

async function settled(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
}

function phraseFixtures(pairId, level) {
  const data = cell(pairId, level);
  const lookup = new Map([...bank(pairId).phrases, ...(bank(pairId).receivedModels || []),
    ...data.themes.flatMap(theme => theme.phrases)].map(phrase => [phrase.id, phrase]));
  return data.themes.flatMap((theme, themeIndex) => theme.sequences.flatMap(sequence => sequence.steps)
    .map((step, stepIndex) => ({pairId, level, themeIndex, theme, stepIndex, step,
      phrase: lookup.get(step.utterance)}))
    .filter(entry => entry.step.kind === 'understand' && entry.phrase?.contentType === 'utterance'));
}

async function enter(page, fixture) {
  await visit(page, fixture.pairId, fixture.level);
  await page.locator('#mgThemeGrid > button').nth(fixture.themeIndex).click();
  let localStepIndex = fixture.stepIndex;
  if ((await page.evaluate(() => window.MelungaMockup.state())).screen === 'sequences') {
    const plans = await page.evaluate(() => window.MelungaMockup.visibleSequences());
    const sequenceIndex = plans.findIndex(sequence => sequence.steps.some(step => step.id === fixture.step.id));
    assert.ok(sequenceIndex >= 0, 'approved whole fixture belongs to exactly one visible sequence');
    assert.equal(plans.filter(sequence => sequence.steps.some(step => step.id === fixture.step.id)).length, 1);
    localStepIndex = plans[sequenceIndex].steps.findIndex(step => step.id === fixture.step.id);
    await page.locator('#mgSequences > button').nth(sequenceIndex).click();
  }
  // Use the real public controls to reach a fixture; the debug API is read-only.
  await page.evaluate(target => {
    for (let index = 0; index < target; index++) {
      const choice = document.querySelector('#mgChoices:not([hidden]) button');
      if (choice) choice.click();
      const next = document.getElementById('mgContinue');
      if (next.disabled) throw new Error('Fixture unexpectedly requires another action.');
      next.click();
    }
  }, localStepIndex);
  assert.equal(await page.evaluate(() => window.MelungaMockup.state().phraseId), fixture.phrase.id);
  await settled(page);
}

async function gestureOrigin(page, selector) {
  const bounds = await page.locator(selector).boundingBox();
  assert.ok(bounds, 'gesture starts on a visible element');
  const viewport = page.viewportSize();
  const left = Math.max(2, bounds.x), right = Math.min(viewport.width - 2, bounds.x + bounds.width);
  const top = Math.max(2, bounds.y), bottom = Math.min(viewport.height - 2, bounds.y + bounds.height);
  assert.ok(right > left && bottom > top, 'gesture surface is inside the viewport');
  let x = (left + right) / 2, y = (top + bottom) / 2;
  if (selector === '#mgContent') {
    const point = await page.evaluate(({left, right, top, bottom}) => {
      for (const fy of [0.5, 0.3, 0.7]) for (const fx of [0.5, 0.3, 0.7]) {
        const x = left + (right - left) * fx, y = top + (bottom - top) * fy;
        const hit = document.elementFromPoint(x, y);
        if (hit?.closest('#mgLessonView') && !hit.closest('button,a,input,select,textarea,[contenteditable]')) return {x, y};
      }
      return null;
    }, {left, right, top, bottom});
    assert.ok(point, 'card has a visible gesture surface without a control');
    ({x, y} = point);
  }
  return {x, y};
}

async function cardAtRest(page) {
  await page.waitForFunction(() => {
    const card = document.getElementById('mgLessonView');
    const matrix = new DOMMatrixReadOnly(getComputedStyle(card).transform);
    return Math.abs(matrix.m41) < 0.6 && Math.abs(matrix.m42) < 0.6
      && card.getAnimations().every(animation => !['running', 'pending'].includes(animation.playState));
  }, null, {timeout: 3000});
  await settled(page);
}

async function touchGesture(page, selector, dx, dy = 0) {
  const {x, y} = await gestureOrigin(page, selector);
  const client = await page.context().newCDPSession(page);
  try {
    await client.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y}]});
    await client.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: x + dx / 2, y: y + dy / 2}]});
    await client.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: x + dx, y: y + dy}]});
    await client.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
  } finally { await client.detach(); }
  await settled(page);
  await cardAtRest(page);
}

async function cardTransform(page) {
  return page.locator('#mgLessonView').evaluate(card => {
    const matrix = new DOMMatrixReadOnly(getComputedStyle(card).transform);
    return {x: matrix.m41, y: matrix.m42, className: card.className,
      animating: card.getAnimations().some(animation => animation.playState === 'running')};
  });
}

async function observedDrag(page, dx, dy, {cancel = false, selector = '#mgTranslation'} = {}) {
  const initial = await current(page);
  const {x, y} = await gestureOrigin(page, selector);
  const client = await page.context().newCDPSession(page);
  const samples = [];
  try {
    await client.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y}]});
    for (const fraction of [0.5, 1]) {
      await client.send('Input.dispatchTouchEvent', {type: 'touchMove',
        touchPoints: [{x: x + dx * fraction, y: y + dy * fraction}]});
      await settled(page);
      samples.push(await cardTransform(page));
      assert.deepEqual(await current(page), initial, 'source and step do not change while the finger is still down');
    }
    await client.send('Input.dispatchTouchEvent', {type: cancel ? 'touchCancel' : 'touchEnd', touchPoints: []});
    await settled(page);
    const released = await cardTransform(page);
    return {initial, samples, released};
  } finally { await client.detach(); }
}

async function assertModelSource(page, fixture, identifier) {
  await page.waitForFunction(identifier => window.MelungaMockup.state().phraseId === identifier, identifier);
  await cardAtRest(page);
  const phrase = phraseFixtures(fixture.pairId, fixture.level).find(row => row.phrase.id === identifier)?.phrase;
  assert.ok(phrase, 'new card is backed by a whole source');
  assert.equal(await page.locator('#mgPhrase').textContent(), phrase.study);
  assert.equal(await page.locator('#mgPhon').textContent(), phrase.phon);
  assert.equal(await page.locator('#mgTranslation').textContent(), phrase.native);
  return phrase;
}

async function toastVisible(page) {
  return page.locator('#mgCardToast').evaluate(node => !node.hidden && getComputedStyle(node).display !== 'none'
    && Number(getComputedStyle(node).opacity) > 0.1 && node.getBoundingClientRect().height > 0);
}

function moduleFixture(pairId, topicId = 'piste-visite-proches', level = 1) {
  const fixture = phraseFixtures(pairId, level).find(row => row.theme.id.endsWith(topicId));
  assert.ok(fixture, 'real module fixture exists');
  return fixture;
}

function themeSteps(fixture) {
  return fixture.theme.sequences.flatMap(sequence => sequence.steps);
}

function themePhraseIds(fixture) {
  return [...new Set(fixture.theme.sequences.flatMap(sequence => sequence.phraseIds))];
}

async function current(page) {
  return page.evaluate(() => window.MelungaMockup.state());
}

async function advanceToStep(page, target) {
  await page.evaluate(target => {
    let guard = 0;
    while (window.MelungaMockup.state().stepIndex < target) {
      if (++guard > 10000) throw new Error('Fixture target did not advance.');
      document.querySelector('#mgChoices:not([hidden]) button')?.click();
      const next = document.getElementById('mgContinue');
      if (next.disabled) throw new Error('Unexpected disabled fixture control.');
      next.click();
    }
  }, target);
  await settled(page);
}

async function setReading(page, enabled) {
  const toggle = page.locator('#mgReadingToggle');
  if (!(await toggle.isVisible())) await page.click('#mgHelp');
  assert.equal(await toggle.isVisible(), true, 'reading control is reachable');
  if ((await toggle.getAttribute('aria-pressed')) !== String(enabled)) await toggle.click();
  if (await page.locator('#mgHelpPanel').isVisible()) await page.click('#mgHelp');
  await settled(page);
}

async function assertCompleteCard(page, fixture, viewport, check) {
  await cardAtRest(page);
  const result = await page.evaluate(() => {
    const rect = node => {
      const box = node.getBoundingClientRect();
      return {top: box.top, left: box.left, bottom: box.bottom, right: box.right,
        width: box.width, height: box.height};
    };
    const visible = node => node && !node.hidden && getComputedStyle(node).display !== 'none'
      && node.getBoundingClientRect().width > 0 && node.getBoundingClientRect().height > 0;
    const box = selector => {
      const node = document.querySelector(selector);
      const range = document.createRange(); range.selectNodeContents(node);
      let scale = 1;
      for (let ancestor = node; ancestor; ancestor = ancestor.parentElement) {
        const matrix = new DOMMatrixReadOnly(getComputedStyle(ancestor).transform);
        scale *= Math.hypot(matrix.m21, matrix.m22, matrix.m23);
      }
      return {selector, visible: visible(node), element: rect(node),
        text: rect(range), fontSize: parseFloat(getComputedStyle(node).fontSize) * scale,
        overflowY: getComputedStyle(node).overflowY,
        value: node.textContent};
    };
    return {
      viewport: {width: innerWidth, height: innerHeight},
      lesson: rect(document.getElementById('mgLessonView')),
      texts: ['#mgPhrase', '#mgPhon', '#mgTranslation', '#mgReading']
        .filter(selector => visible(document.querySelector(selector))).map(box),
      controls: ['#mgEar', '#mgContinue', '#mgReplay', '#mgReadingToggle']
        .filter(selector => visible(document.querySelector(selector))).map(selector => ({selector,
        visible: visible(document.querySelector(selector)), ...rect(document.querySelector(selector))})),
      scrollers: [document.scrollingElement, ...['mgContent', 'mgLessonView', 'mgModel'].map(id => document.getElementById(id))]
        .map(node => ({id: node.id || node.tagName, clientHeight: node.clientHeight,
          scrollHeight: node.scrollHeight, clientWidth: node.clientWidth, scrollWidth: node.scrollWidth}))
    };
  });
  for (const selector of ['#mgEar', '#mgContinue', '#mgReplay', ...(fixture.phrase.reading ? ['#mgReadingToggle'] : [])]) {
    assert.ok(result.controls.some(control => control.selector === selector), selector + ' is present on the complete card');
  }
  for (const scroll of result.scrollers) {
    assert.ok(scroll.scrollHeight <= scroll.clientHeight + 2, scroll.id + ' has no vertical overflow');
    assert.ok(scroll.scrollWidth <= scroll.clientWidth + 2, scroll.id + ' has no horizontal overflow');
  }
  for (const text of result.texts) {
    assert.ok(text.text.top >= result.lesson.top - 2 && text.text.bottom <= result.lesson.bottom + 2,
      text.selector + ' is entirely inside the lesson card');
    assert.ok(text.text.left >= result.lesson.left - 2 && text.text.right <= result.lesson.right + 2,
      text.selector + ' has no text outside the card');
    if (text.overflowY !== 'visible') {
      assert.ok(text.text.bottom <= text.element.bottom + 2 && text.text.top >= text.element.top - 2,
        text.selector + ' does not clip its own text');
    }
    assert.ok(text.fontSize >= (text.selector === '#mgReading' ? 10 : 12) - 0.05,
      text.selector + ' remains readable');
    if (fixture.phrase.id === 'catalogue:zh:0' && viewport.width === 1280 && viewport.height === 500) {
      assert.ok(text.fontSize >= (text.selector === '#mgPhrase' ? 36 : 24) - 0.05,
        'the short desktop card retains larger typography despite the low window');
    }
    if (fixture.phrase.id === 'catalogue:zh:0' && viewport.width === 320 && viewport.height === 640) {
      assert.ok(text.fontSize >= (text.selector === '#mgPhrase' ? 28 : text.selector === '#mgPhon' ? 20 : 22) - 0.05,
        'the short mobile card retains larger typography');
    }
  }
  for (let a = 0; a < result.texts.length; a++) for (let b = a + 1; b < result.texts.length; b++) {
    const first = result.texts[a], second = result.texts[b];
    const overlapX = Math.min(first.text.right, second.text.right) - Math.max(first.text.left, second.text.left);
    const overlapY = Math.min(first.text.bottom, second.text.bottom) - Math.max(first.text.top, second.text.top);
    assert.ok(overlapX <= 1 || overlapY <= 1, first.selector + ' does not overlap ' + second.selector);
  }
  for (const control of result.controls) {
    assert.equal(control.visible, true, control.selector + ' is visible');
    assert.ok(control.top >= 0 && control.bottom <= result.viewport.height + 1,
      control.selector + ' fits vertically in the viewport');
    assert.ok(control.left >= 0 && control.right <= result.viewport.width + 1,
      control.selector + ' fits horizontally in the viewport');
    assert.ok(control.width >= 44 && control.height >= 44, control.selector + ' remains usable');
    if (['#mgReadingToggle', '#mgEar'].includes(control.selector)) {
      assert.ok(control.top >= result.lesson.top - 1 && control.bottom <= result.lesson.bottom + 1,
        control.selector + ' remains inside the complete card');
    }
  }
  assert.equal(await page.locator('#mgPhrase').textContent(), fixture.phrase.study);
  assert.equal(await page.locator('#mgTranslation').textContent(), fixture.phrase.native);
  const readingVisible = await page.evaluate(() => window.MelungaMockup.state().readingVisible);
  assert.equal(await page.locator('#mgPhon').textContent(), fixture.pairId === 'fr-zh' && readingVisible
    ? fixture.phrase.reading : fixture.phrase.phon, 'whole source help remains visible without shortening');
  report.cases.push({check, pair: fixture.pairId, level: fixture.level,
    phraseId: fixture.phrase.id, viewport, readingVisible, measurements: result});
}

function longestFixtures() {
  return ['fr-zh', 'fr-it', 'fr-ja', 'fr-ko'].map(pair => {
    const candidates = Array.from({length: 10}, (_, index) => phraseFixtures(pair, index + 1)).flat();
    return candidates.sort((a, b) => ['study', 'phon', 'native', 'reading'].reduce((sum, key) =>
      sum + (b.phrase[key]?.length || 0) - (a.phrase[key]?.length || 0), 0))[0];
  });
}

test('desktop shows complete short and longest real cards without scrolling or clipping', {timeout: 120000}, async () => checked('desktop-complete-card', async () => {
  const short = moduleFixture('fr-zh');
  const longest = longestFixtures();
  for (const viewport of [{width: 1366, height: 768}, {width: 1280, height: 720}, {width: 1280, height: 500}]) {
    const {context, page} = await open(viewport.width, viewport.height);
    try {
      for (const fixture of [short, ...longest]) {
        await enter(page, fixture);
        for (const reading of fixture.phrase.reading ? [false, true] : [false]) {
          if (fixture.phrase.reading) await setReading(page, reading);
          await assertCompleteCard(page, fixture, viewport, 'desktop-complete-card');
        }
      }
    } finally { await context.close(); }
  }
}));

test('Pinyin replaces the adapted help, survives navigation/reload, and respects recall masking', {timeout: 60000}, async () => checked('pinyin-switch-persistence-and-recall', async () => {
  const fixture = moduleFixture('fr-zh');
  const {context, page} = await open(390);
  try {
    await enter(page, fixture);
    const toggle = page.locator('#mgReadingToggle');
    assert.equal(await toggle.isVisible(), true, 'Pinyin is directly reachable outside the help panel');
    assert.match(await toggle.textContent(), /Pinyin/i);
    assert.equal(await page.locator('#mgPhon').textContent(), fixture.phrase.phon);
    await setReading(page, true);
    assert.equal(await page.locator('#mgPhon').textContent(), fixture.phrase.reading, 'whole source Pinyin replaces the adapted help');
    const other = phraseFixtures('fr-zh', 1).find(row => row.theme.id === fixture.theme.id && row.phrase.id !== fixture.phrase.id && row.phrase.reading);
    await advanceToStep(page, other.stepIndex);
    assert.equal(await page.locator('#mgPhon').textContent(), other.phrase.reading, 'preference follows the next source');
    await page.reload(); await ready(page, 'fr-zh', 1);
    await page.locator('#mgThemeGrid > button').nth(fixture.themeIndex).click();
    assert.equal(await toggle.getAttribute('aria-pressed'), 'true', 'Pinyin preference survives reload');
    assert.equal(await page.locator('#mgPhon').textContent(), fixture.phrase.reading);
    const recallIndex = themeSteps(fixture).findIndex(step => step.kind === 'choose-and-recall' && step.utterance === fixture.phrase.id);
    assert.ok(recallIndex > 0, 'real recall fixture');
    await advanceToStep(page, recallIndex);
    assert.equal((await current(page)).masked, true);
    assert.equal(await toggle.isVisible(), true, 'Pinyin switch remains discoverable during recall');
    assert.equal(await toggle.isDisabled(), true, 'the switch cannot reveal a recalled model');
    assert.equal(await page.locator('#mgPhrase').isVisible(), false);
    assert.equal(await page.locator('#mgPhon').isVisible(), false);
    assert.equal(await page.locator('#mgReading').isVisible(), false);
    assert.equal(await page.locator('#mgTranslation').textContent(), fixture.phrase.native);
    await page.click('#mgEar');
    assert.equal((await current(page)).masked, false);
    assert.equal(await page.locator('#mgPhon').textContent(), fixture.phrase.reading);
    assert.equal(await toggle.isDisabled(), false);
    assert.equal(await page.evaluate(() => window.__controlSpeech.at(-1).text), fixture.phrase.study,
      'ear speaks the whole target-language source, never Pinyin');
    await setReading(page, false);
    assert.equal(await page.locator('#mgPhon').textContent(), fixture.phrase.phon, 'adapted help remains verbatim');
    await page.click('#mgBack'); await page.selectOption('#mgLanguage', 'fr-es'); await ready(page, 'fr-es', 1);
    await page.locator('#mgThemeGrid > button').nth(moduleFixture('fr-es').themeIndex).click();
    assert.equal(await toggle.isVisible(), false, 'Pinyin is not offered for Spanish');
  } finally { await context.close(); }
}));

test('mobile four directions navigate vertically and classify horizontally without hiding known cards', {timeout: 60000}, async () => checked('mobile-four-direction-swipes', async () => {
  const fixture = moduleFixture('fr-zh');
  const ids = themePhraseIds(fixture);
  const {context, page} = await open(390);
  try {
    await enter(page, fixture);
    await touchGesture(page, '#mgTranslation', 3, -105);
    assert.equal((await current(page)).phraseId, ids[1], 'up swipe skips the repetition phase to the next phrase');
    const secondStart = themeSteps(fixture).findIndex(step => step.kind === 'understand' && step.utterance === ids[1]);
    assert.equal((await current(page)).stepIndex, secondStart, 'next phrase begins at its whole understanding model');
    await touchGesture(page, '#mgTranslation', 3, 105);
    assert.equal((await current(page)).phraseId, ids[0]);
    await touchGesture(page, '#mgTranslation', 3, 105);
    assert.equal((await current(page)).phraseId, ids[0], 'down swipe is stable at the first phrase');
    await touchGesture(page, '#mgTranslation', -105, 3);
    assert.equal((await current(page)).phraseId, ids[1], 'left swipe queues the learner card then advances');
    let saved = await page.evaluate(() => JSON.parse(localStorage.getItem('melunga-guided-review-v1')).entries);
    assert.equal(saved.filter(row => row.pairId === 'fr-zh' && row.id === ids[0]).length, 1);
    await touchGesture(page, '#mgTranslation', 3, 105);
    assert.equal((await current(page)).phraseId, ids[0]);
    await touchGesture(page, '#mgTranslation', 105, 3);
    assert.equal((await current(page)).phraseId, ids[1], 'right swipe marks known and advances');
    saved = await page.evaluate(() => JSON.parse(localStorage.getItem('melunga-guided-review-v1')).entries);
    assert.equal(saved.some(row => row.pairId === 'fr-zh' && row.id === ids[0]), false, 'right swipe removes the saved bookmark');
    await touchGesture(page, '#mgTranslation', 3, 105);
    assert.equal((await current(page)).phraseId, ids[0], 'known cards remain accessible in the full theme');
    const questionIndex = themeSteps(fixture).findIndex(step => step.kind === 'receive' && step.beforeIntentId);
    assert.ok(questionIndex >= 0, 'real interlocutor question fixture');
    await advanceToStep(page, questionIndex);
    const question = themeSteps(fixture)[questionIndex];
    const beforeReceivedSwipe = (await current(page)).stepIndex;
    await touchGesture(page, '#mgTranslation', -105, 3);
    assert.equal((await current(page)).stepIndex, beforeReceivedSwipe, 'left swipe never classifies the partner');
    await touchGesture(page, '#mgTranslation', 105, 3);
    assert.equal((await current(page)).stepIndex, beforeReceivedSwipe, 'right swipe never classifies the partner');
    await touchGesture(page, '#mgTranslation', 3, -105);
    assert.equal((await current(page)).phraseId, question.prepares, 'swiping a received turn reaches its prepared answer');
    assert.equal((await current(page)).stepIndex, questionIndex + 1, 'the received cue does not skip the actual response');
    const lastId = ids.at(-1);
    await page.click('#mgBack'); await page.locator('#mgThemeGrid > button').nth(fixture.themeIndex).click();
    for (let index = 1; index < ids.length; index++) await touchGesture(page, '#mgTranslation', 3, -105);
    assert.equal((await current(page)).phraseId, lastId);
    await touchGesture(page, '#mgTranslation', 3, -105);
    assert.equal((await current(page)).phraseId, lastId, 'up swipe cannot exceed the last phrase');
    assert.equal((await current(page)).screen, 'done', 'forward motion after the last phrase has an explicit completion screen');
    assert.equal(await page.locator('#mgDoneHeading').isVisible(), true);
    const completed = await current(page);
    await touchGesture(page, '#mgDone', 3, -105);
    assert.deepEqual(await current(page), completed, 'another gesture after completion never wraps or invents a phrase');
  } finally { await context.close(); }
}));

test('mobile swipe handling preserves buttons, small motion, selection and multitouch', {timeout: 60000}, async () => checked('mobile-swipes-ignore-other-interactions', async () => {
  const fixture = moduleFixture('fr-zh');
  const {context, page} = await open(390);
  try {
    await enter(page, fixture);
    const original = await current(page);
    await touchGesture(page, '#mgTranslation', 7, -9);
    assert.equal((await current(page)).stepIndex, original.stepIndex, 'small incidental motion does not navigate');
    await touchGesture(page, '#mgEar', -95, 2);
    assert.equal((await current(page)).stepIndex, original.stepIndex, 'gesture begun on a button is ignored');
    await page.click('#mgEar');
    assert.equal(await page.evaluate(() => window.__controlSpeech.at(-1).text), fixture.phrase.study, 'ear remains clickable');
    await page.evaluate(() => {
      const selection = getSelection(); const range = document.createRange();
      range.selectNodeContents(document.getElementById('mgTranslation'));
      selection.removeAllRanges(); selection.addRange(range);
    });
    await touchGesture(page, '#mgTranslation', -105, 2);
    assert.equal((await current(page)).stepIndex, original.stepIndex, 'text selection does not turn into navigation');
    await page.evaluate(() => getSelection().removeAllRanges());
    const bounds = await page.locator('#mgTranslation').boundingBox();
    const client = await context.newCDPSession(page);
    try {
      const points = [{x: bounds.x + 40, y: bounds.y + 10, id: 0}, {x: bounds.x + 85, y: bounds.y + 10, id: 1}];
      await client.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: points});
      await client.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: points.map(point => ({...point, x: point.x + 100}))});
      await client.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
    } finally { await client.detach(); }
    assert.equal((await current(page)).stepIndex, original.stepIndex, 'multitouch is not a lesson gesture');
  } finally { await context.close(); }
  // Exercise the supported v1 choice contract with real, unchanged whole
  // source cards. Only the in-memory test step is a waiting choice; no data
  // file, text or phonetic field is edited by this fixture.
  const legacy = readJson(path.join(ROOT, 'content/maquette-guidee.json'));
  const pair = legacy.pairs.find(row => row.id === 'fr-zh');
  const theme = pair.themes[0];
  const ids = theme.phrases.slice(0, 2).map(row => row.id);
  assert.equal(ids.length, 2);
  theme.sequences[0] = {...theme.sequences[0],
    steps: [{id: 'controls-waiting-choice', kind: 'choose-and-recall', choices: ids}, ...theme.sequences[0].steps]};
  const choiceFixture = await open(390, 844, async (route, url) => {
    if (url.pathname !== '/content/maquette-guidee.json') return false;
    await route.fulfill({json: legacy}); return true;
  });
  try {
    const page = choiceFixture.page;
    await page.goto(base + '/maquette-guidee.html?pair=fr-zh'); await ready(page, 'fr-zh', 1);
    await page.locator('#mgThemeGrid > button').first().click();
    assert.equal(await page.locator('#mgContinue').isDisabled(), true);
    const waiting = await current(page);
    await touchGesture(page, '#mgLessonTheme', -95, 2);
    assert.deepEqual(await current(page), waiting, 'left gesture cannot queue an invisible unselected answer');
    await touchGesture(page, '#mgLessonTheme', 95, 2);
    assert.deepEqual(await current(page), waiting, 'right gesture cannot classify an invisible unselected answer');
    assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem('melunga-guided-review-v1') || '{"entries":[]}').entries), []);
    await page.locator('#mgChoices button').first().click();
    assert.equal(await page.locator('#mgContinue').isDisabled(), false, 'explicit answer selection remains operational');
  } finally { await choiceFixture.context.close(); }
}));

test('short and longest mobile cards fit fully without any lesson scroll', {timeout: 120000}, async () => checked('mobile-complete-card', async () => {
  const fixtures = [moduleFixture('fr-zh'), ...longestFixtures()];
  for (const viewport of [{width: 320, height: 640}, {width: 390, height: 740}]) {
    const {context, page} = await open(viewport.width, viewport.height);
    try {
      for (const fixture of fixtures) {
        await enter(page, fixture);
        for (const reading of fixture.phrase.reading ? [false, true] : [false]) {
          if (fixture.phrase.reading) await setReading(page, reading);
          await assertCompleteCard(page, fixture, viewport, 'mobile-complete-card');
        }
      }
      const long = fixtures.find(fixture => fixture.pairId === 'fr-zh' && fixture.level > 1);
      await enter(page, long);
      const original = await current(page);
      await touchGesture(page, '#mgTranslation', 2, 105);
      assert.notEqual((await current(page)).phraseId, original.phraseId, 'down works immediately without scrolling a long card first');
      await touchGesture(page, '#mgTranslation', 2, -105);
      assert.equal((await current(page)).phraseId, original.phraseId, 'up returns to the complete long card');
    } finally { await context.close(); }
  }
}));

test('the card follows the finger, restores cancelled motion and shows non-blocking brief feedback', {timeout: 60000}, async () => checked('finger-follow-and-feedback', async () => {
  const fixture = moduleFixture('fr-zh'), ids = themePhraseIds(fixture);
  const {context, page} = await open(390, 740, async () => false, {reducedMotion: 'no-preference'});
  try {
    await enter(page, fixture);
    const initial = await current(page);
    const cancelled = await observedDrag(page, 48, 3, {cancel: true});
    assert.ok(cancelled.samples[0].x > 8 && cancelled.samples[1].x > cancelled.samples[0].x + 5,
      'the sheet follows even a gesture that will be cancelled');
    await cardAtRest(page);
    assert.deepEqual(await current(page), initial, 'touchcancel restores the same source and step');
    assert.equal(await toastVisible(page), false);
    const short = await observedDrag(page, -25, 2);
    assert.ok(short.samples[1].x < -8, 'small motion is visible before release');
    await cardAtRest(page);
    assert.deepEqual(await current(page), initial, 'subthreshold motion snaps back without classifying');

    const left = await observedDrag(page, -125, 4);
    assert.ok(left.samples[0].x < -15 && left.samples[1].x < left.samples[0].x - 10,
      'left displacement grows with the finger before touchend');
    assert.ok(left.released.animating || Math.hypot(left.released.x, left.released.y) > 3,
      'release has an animated exit/entry rather than an instant replacement');
    const second = await assertModelSource(page, fixture, ids[1]);
    await page.waitForFunction(() => {
      const node = document.getElementById('mgCardToast');
      return !node.hidden && Number(getComputedStyle(node).opacity) > 0.1;
    });
    assert.equal((await page.locator('#mgCardToast').textContent()).trim(), 'Elle reviendra');
    assert.equal(await toastVisible(page), true);
    const spoken = await page.evaluate(() => window.__controlSpeech.length);
    const ear = await page.locator('#mgEar').boundingBox();
    await page.touchscreen.tap(ear.x + ear.width / 2, ear.y + ear.height / 2);
    assert.equal(await page.evaluate(() => window.__controlSpeech.length), spoken + 1,
      'a real new tap works immediately while the feedback is visible');
    assert.equal(await page.evaluate(() => window.__controlSpeech.at(-1).text), second.study);
    await touchGesture(page, '#mgTranslation', 2, 105);
    assert.equal((await current(page)).phraseId, ids[0]);
    const right = await observedDrag(page, 125, 4);
    assert.ok(right.samples[0].x > 15 && right.samples[1].x > right.samples[0].x + 10,
      'right displacement follows the finger');
    await assertModelSource(page, fixture, ids[1]);
    assert.equal((await page.locator('#mgCardToast').textContent()).trim(), 'Rangée');
    assert.equal(await toastVisible(page), true);
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('melunga-guided-review-v1')).entries);
    assert.equal(saved.some(row => row.pairId === 'fr-zh' && row.id === ids[0]), false);
    await page.waitForFunction(() => {
      const node = document.getElementById('mgCardToast');
      return node.hidden || getComputedStyle(node).display === 'none' || Number(getComputedStyle(node).opacity) <= 0.1;
    }, null, {timeout: 2500});

    const up = await observedDrag(page, 3, -125);
    assert.ok(up.samples[0].y < -15 && up.samples[1].y < up.samples[0].y - 10,
      'vertical next displacement follows the finger');
    await assertModelSource(page, fixture, ids[2]);
    const down = await observedDrag(page, 3, 125);
    assert.ok(down.samples[0].y > 15 && down.samples[1].y > down.samples[0].y + 10,
      'vertical previous displacement follows the finger');
    await assertModelSource(page, fixture, ids[1]);
    const blocked = await observedDrag(page, -125, 4, {selector: '#mgEar'});
    assert.ok(blocked.samples.every(sample => Math.hypot(sample.x, sample.y) < 0.6),
      'a drag begun on a control never moves the sheet');
    await cardAtRest(page);
    assert.equal((await current(page)).phraseId, ids[1]);
    report.cases.push({check: 'finger-follow-and-feedback', cancelled, short, left, right, up, down, blocked});
  } finally { await context.close(); }
}));

test('resize and a late fixed preview banner refit the same whole Pinyin card without scrolling', {timeout: 60000}, async () => checked('resize-and-preview-banner', async () => {
  const fixture = longestFixtures().find(row => row.pairId === 'fr-zh');
  const {context, page} = await open(1366, 768);
  try {
    await enter(page, fixture); await setReading(page, true);
    await page.setViewportSize({width: 1280, height: 500}); await settled(page);
    assert.equal((await current(page)).phraseId, fixture.phrase.id);
    assert.equal((await current(page)).readingVisible, true);
    await assertCompleteCard(page, fixture, {width: 1280, height: 500}, 'resize-and-preview-banner');
    await page.evaluate(() => {
      const banner = document.createElement('div');
      banner.id = 'late-preview-banner'; banner.textContent = 'Bandeau d’aperçu';
      Object.assign(banner.style, {position: 'fixed', bottom: '0', left: '10%', width: '80%',
        height: '56px', zIndex: '99999', background: '#fff', color: '#123'});
      document.body.append(banner);
    });
    await settled(page);
    await page.waitForFunction(() => document.getElementById('mgFooter').getBoundingClientRect().bottom
      <= document.getElementById('late-preview-banner').getBoundingClientRect().top + 1, null, {timeout: 3000});
    await assertCompleteCard(page, fixture, {width: 1280, height: 500}, 'resize-and-preview-banner');
    assert.equal((await current(page)).phraseId, fixture.phrase.id, 'the preview overlay does not change source');
    assert.equal(await page.locator('#mgPhon').textContent(), fixture.phrase.reading, 'Pinyin remains the same whole reading');
    await page.locator('#late-preview-banner').evaluate(node => node.remove());
    await settled(page);
    await assertCompleteCard(page, fixture, {width: 1280, height: 500}, 'resize-and-preview-banner');
  } finally { await context.close(); }
}));

async function savedPanel(page) {
  await page.click('#mgMenuTrigger');
  await page.locator('[data-menu-item="À revoir"]').click();
  assert.equal(await page.locator('#mgSavedReviewPanel').isVisible(), true);
}

test('À revoir persists, deduplicates, isolates pairs and resumes source-backed cards before removal', {timeout: 90000}, async () => checked('saved-review-persistence-pair-scope-and-removal', async () => {
  const zh = moduleFixture('fr-zh'), es = moduleFixture('fr-es');
  const {context, page} = await open(390);
  try {
    await enter(page, zh);
    assert.equal((await page.locator('#mgReplayText').textContent()).trim(), 'À revoir');
    await page.click('#mgReplay');
    assert.equal((await current(page)).phraseId, themePhraseIds(zh)[1], 'saving advances to the next phrase');
    await touchGesture(page, '#mgTranslation', 2, 105);
    assert.equal((await current(page)).phraseId, zh.phrase.id);
    await page.click('#mgReplay');
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('melunga-guided-review-v1')));
    assert.equal(stored.version, 1);
    assert.equal(stored.entries.filter(entry => entry.pairId === 'fr-zh' && entry.id === zh.phrase.id).length, 1, 'same pair/id is stored once');
    await page.reload(); await ready(page, 'fr-zh', 1);
    await savedPanel(page);
    let rows = page.locator('#mgSavedReviewPanel [data-review-id]');
    assert.equal(await rows.count(), 1);
    assert.equal(await rows.first().getAttribute('data-review-id'), zh.phrase.id);
    await page.click('#mgMenuClose');
    await page.selectOption('#mgLanguage', 'fr-es'); await ready(page, 'fr-es', 1);
    await savedPanel(page);
    assert.equal(await page.locator('#mgSavedReviewPanel [data-review-id]').count(), 0, 'Chinese saved cards do not leak into Spanish');
    assert.equal(await page.locator('#mgSavedReviewEmpty').isVisible(), true);
    await page.click('#mgMenuClose');
    await page.locator('#mgThemeGrid > button').nth(es.themeIndex).click();
    await page.click('#mgReplay');
    await page.click('#mgBack'); await page.selectOption('#mgLanguage', 'fr-zh'); await ready(page, 'fr-zh', 1);
    // Labels are a cache. Resume must fetch and render the actual source tuple.
    await page.evaluate(() => {
      const key = 'melunga-guided-review-v1', value = JSON.parse(localStorage.getItem(key));
      for (const row of value.entries) if (row.pairId === 'fr-zh') { row.study = 'stale cache'; row.native = 'stale label'; }
      localStorage.setItem(key, JSON.stringify(value));
    });
    await page.reload(); await ready(page, 'fr-zh', 1);
    await savedPanel(page);
    await page.locator('#mgSavedReviewPanel [data-review-id]').first().locator('[data-review-action="resume"]').click();
    await page.waitForFunction(identifier => {
      const state = window.MelungaMockup.state();
      return state.screen === 'lesson' && state.pairId === 'fr-zh' && state.phraseId === identifier;
    }, zh.phrase.id);
    assert.equal((await current(page)).pairId, 'fr-zh');
    assert.equal((await current(page)).phraseId, zh.phrase.id);
    assert.equal(await page.locator('#mgPhrase').textContent(), zh.phrase.study, 'resume uses whole source study text');
    assert.equal(await page.locator('#mgPhon').textContent(), zh.phrase.phon, 'resume uses whole source phonetics');
    assert.equal(await page.locator('#mgTranslation').textContent(), zh.phrase.native, 'resume uses source meaning');
    await savedPanel(page);
    await page.locator('#mgSavedReviewPanel [data-review-id]').first().locator('[data-review-action="remove"]').click();
    assert.equal(await page.locator('#mgSavedReviewPanel [data-review-id]').count(), 0);
    await page.reload(); await ready(page, 'fr-zh', 1); await savedPanel(page);
    assert.equal(await page.locator('#mgSavedReviewEmpty').isVisible(), true, 'removal survives reload');
    await page.click('#mgMenuClose'); await page.selectOption('#mgLanguage', 'fr-es'); await ready(page, 'fr-es', 1);
    await savedPanel(page);
    rows = page.locator('#mgSavedReviewPanel [data-review-id]');
    assert.equal(await rows.count(), 1, 'removing Chinese does not remove the Spanish entry');
    assert.equal(await rows.first().getAttribute('data-review-id'), es.phrase.id);
  } finally { await context.close(); }
}));

test('received turns never become saved learner cards', {timeout: 60000}, async () => checked('received-turn-cannot-be-saved', async () => {
  const fixture = moduleFixture('fr-zh');
  const {context, page} = await open(390);
  try {
    await enter(page, fixture);
    const index = themeSteps(fixture).findIndex(step => step.kind === 'receive');
    assert.ok(index >= 0);
    await advanceToStep(page, index);
    await page.evaluate(() => document.getElementById('mgReplay').click());
    const entries = await page.evaluate(() => JSON.parse(localStorage.getItem('melunga-guided-review-v1') || '{"entries":[]}').entries);
    assert.deepEqual(entries, [], 'an interlocutor model is not queued as learner production');
    assert.equal((await current(page)).stepIndex, index, 'attempting to save a received turn does not navigate');
  } finally { await context.close(); }
}));
