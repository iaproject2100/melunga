/* Local checks for visible 30–40-card learning sequences.
 * Approved JSON, card text, phonetics, themes and source order stay byte-exact.
 * Browser sizes are emulated; speechSynthesis is instrumented, not listened to.
 * NODE_PATH=/tmp/melunga-review-tools/node_modules node --test tests/long-theme-sequences.browser.cjs
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const crypto = require('node:crypto');
const vm = require('node:vm');
const {execFileSync} = require('node:child_process');
const {test, before, after} = require('node:test');
const {chromium} = require('playwright-core');

const WEB = path.resolve(__dirname, '..'), REPO = path.resolve(WEB, '..');
const DATA_BASE = 'ebd6519a6088e52c157231b44ae4cf41507f0667';
const PRODUCT_BASE = '946b254179e75cd342ecedab0b5448017079ffdc';
const helperPath = path.join(WEB, 'visible-sequences.js');
const manifestPath = 'content/niveaux-progressifs/manifest.json';
const read = name => JSON.parse(fs.readFileSync(path.join(WEB, name), 'utf8'));
const manifest = read(manifestPath);
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const jsonCopy = value => JSON.parse(JSON.stringify(value));
const documentPaths = [manifestPath, ...manifest.pairs.flatMap(pair => [pair.repertoirePath, ...pair.levels.map(level => level.dataPath)])];
assert.equal(documentPaths.length, 78);
const cells = new Map(), banks = new Map(), topics = [];
for (const pair of manifest.pairs) {
  banks.set(pair.id, read(pair.repertoirePath));
  for (const entry of pair.levels) {
    const cell = read(entry.dataPath); cells.set(pair.id + ':' + cell.level, cell);
    cell.themes.forEach((theme, themeIndex) => topics.push({pair, level: cell.level, cell, theme, themeIndex}));
  }
}
const longTopics = topics.filter(row => row.theme.presentedCount > 100);
const helperModule = {exports: {}};
vm.runInNewContext(fs.readFileSync(helperPath, 'utf8'), {module: helperModule}, {filename: helperPath});
const partition = weights => jsonCopy(helperModule.exports.partitionGroupBoundaries(weights));
const plans = new Map(longTopics.map(row => [row.pair.id + ':' + row.theme.id, partition(row.theme.sequences.map(group => group.phraseIds.length))]));
const planOf = row => plans.get(row.pair.id + ':' + row.theme.id);

function sourcePhrase(row, identifier) {
  const bank = banks.get(row.pair.id);
  return [...bank.phrases, ...(bank.receivedModels || []), ...row.cell.themes.flatMap(theme => theme.phrases)].find(phrase => phrase.id === identifier);
}
function fingerprints() {
  const files = [__filename, helperPath, ...['app.html', 'index.html', 'course-access.js', 'content/course-access.json', 'maquette-guidee.js', 'maquette-guidee.css', 'parcours-niveaux.html', 'maquette-guidee.html'].map(file => path.join(WEB, file)), ...documentPaths.map(file => path.join(WEB, file))];
  return Object.fromEntries(files.sort().map(file => [path.relative(REPO, file), sha(fs.readFileSync(file))]));
}
const report = {
  status: 'running', approvedSourceCommit: DATA_BASE, approvedEntryAndMobileProductCommit: PRODUCT_BASE,
  environment: 'local Chromium with emulated mobile/desktop sizes',
  hostedBrowserJourneyChecked: false, physicalPhoneChecked: false, nativeOrPhoneticApproval: false,
  speechMechanism: 'instrumented speechSynthesis; dispatch must equal the complete study text',
  accountMechanism: 'only GET check-status is mocked paid:true locally to exercise the full course; no real account or service request',
  checks: [], partitions: [], cases: [], errors: [], externalRequests: [], apiRequests: [], mockedStatusRequests: [],
  sourceDocumentsCompared: 0, productFilesCompared: 0, totalVisibleSequences: 0,
  browserThemeViews: 0, browserSequencesCompared: 0, modelFieldChecks: 0, speechChecks: 0, fitChecks: 0,
  inputSha256: fingerprints()
};
let server, browser, base;
const checked = async (name, action) => {
  try { await action(); report.checks.push(name); }
  catch (error) { report.errors.push(name + ': ' + error.message); throw error; }
};

// Feasibility-only reader, independent of the product optimizer and tie-breaks.
function feasibleCounts(weights) {
  const sums = [0]; weights.forEach(n => sums.push(sums.at(-1) + n));
  const counts = Array.from({length: weights.length + 1}, () => new Set()); counts[0].add(0);
  for (let end = 1; end < counts.length; end++) {
    for (let start = 0; start < end; start++) if (sums[end] - sums[start] >= 30 && sums[end] - sums[start] <= 40) {
      for (const count of counts[start]) counts[end].add(count + 1);
    }
  }
  return counts.at(-1);
}
function inspectPartition(weights, result, {large = true} = {}) {
  assert.ok(Array.isArray(result) && result.length);
  let group = 0, first = 1;
  for (const chunk of result) {
    assert.equal(chunk.groupStart, group); assert.ok(Number.isInteger(chunk.groupEndExclusive) && chunk.groupEndExclusive > group && chunk.groupEndExclusive <= weights.length);
    const cards = weights.slice(group, chunk.groupEndExclusive).reduce((a, b) => a + b, 0);
    assert.equal(chunk.cards, cards); assert.equal(chunk.firstPresentation, first); assert.equal(chunk.lastPresentation, first + cards - 1);
    if (large) assert.ok(cards >= 30 && cards <= 40, 'visible chunks contain 30–40 complete presentations');
    group = chunk.groupEndExclusive; first += cards;
  }
  assert.equal(group, weights.length); assert.equal(first - 1, weights.reduce((a, b) => a + b, 0));
  if (large) {
    const feasible = feasibleCounts(weights), total = first - 1;
    assert.ok(feasible.has(result.length));
    assert.equal(Math.abs(total - 35 * result.length), Math.min(...[...feasible].map(count => Math.abs(total - 35 * count))), 'number of chunks is as close as feasible to the 35-card target');
  }
}

before(async () => {
  server = http.createServer((request, response) => {
    const filename = path.resolve(WEB, '.' + new URL(request.url, 'http://local').pathname);
    if (!filename.startsWith(WEB + path.sep) || !fs.existsSync(filename) || !fs.statSync(filename).isFile()) { response.writeHead(404).end(); return; }
    response.setHeader('Content-Type', ({'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml'})[path.extname(filename)] || 'application/octet-stream');
    fs.createReadStream(filename).pipe(response);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = 'http://127.0.0.1:' + server.address().port;
  browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox']});
});
after(async () => {
  await browser?.close(); if (server) await new Promise(resolve => server.close(resolve));
  report.inputsStable = JSON.stringify(fingerprints()) === JSON.stringify(report.inputSha256);
  if (!report.inputsStable) report.errors.push('Sources changed during the run.');
  if (!report.mockedStatusRequests.length) report.errors.push('The full-course account fixture was not exercised.');
  report.status = !report.errors.length && !report.externalRequests.length && !report.apiRequests.length && report.checks.length === 6 ? 'passed' : 'failed';
  report.executedAt = new Date().toISOString();
  if (process.env.SEQUENCES_BROWSER_REPORT) fs.writeFileSync(process.env.SEQUENCES_BROWSER_REPORT, JSON.stringify(report, null, 2) + '\n');
  assert.equal(report.inputsStable, true); assert.deepEqual(report.externalRequests, []); assert.deepEqual(report.apiRequests, []); assert.deepEqual(report.errors, []);
});

test('all approved data, cards, themes and phonetics remain byte-exact; 67 topics become 337 ordered chunks', () => checked('whole-source-and-partitions', () => {
  const existing = execFileSync('git', ['ls-tree', '-r', '--name-only', DATA_BASE, 'melunga_deploy/content/niveaux-progressifs'], {cwd: REPO, encoding: 'utf8'}).trim().split('\n');
  assert.deepEqual(existing.sort(), documentPaths.map(p => 'melunga_deploy/' + p).sort());
  for (const filename of documentPaths) {
    const actual = fs.readFileSync(path.join(WEB, filename)), before = execFileSync('git', ['show', DATA_BASE + ':melunga_deploy/' + filename], {cwd: REPO, maxBuffer: 32 * 1024 * 1024});
    assert.ok(actual.equals(before), 'approved complete JSON bytes: ' + filename); report.sourceDocumentsCompared++;
  }
  const product = execFileSync('git', ['ls-tree', '-r', '--name-only', PRODUCT_BASE, 'melunga_deploy'], {cwd: REPO, encoding: 'utf8'}).trim().split('\n');
  const allowed = new Set(['melunga_deploy/maquette-guidee.js', 'melunga_deploy/maquette-guidee.html', 'melunga_deploy/parcours-niveaux.html']);
  for (const filename of product.filter(p => p.includes('/netlify/') || /^melunga_deploy\/[^/]+\.(?:html|js|css)$/.test(p) || p === 'melunga_deploy/content/course-access.json')) {
    if (allowed.has(filename)) continue;
    assert.ok(fs.readFileSync(path.join(REPO, filename)).equals(execFileSync('git', ['show', PRODUCT_BASE + ':' + filename], {cwd: REPO, maxBuffer: 32 * 1024 * 1024})), 'approved catalogue/auth/access/prices and unrelated UI unchanged: ' + filename); report.productFilesCompared++;
  }
  assert.equal(topics.reduce((sum, row) => sum + row.theme.phrases.length, 0) + [...cells.values()].reduce((sum, cell) => sum + cell.reserve.length, 0), 33654);
  assert.equal(longTopics.length, 67);
  const sizes = {};
  for (const row of longTopics) {
    const weights = row.theme.sequences.map(group => group.phraseIds.length), frozen = Object.freeze([...weights]), before = [...weights], chunks = partition(frozen);
    inspectPartition(weights, chunks); assert.deepEqual([...frozen], before); assert.deepEqual(chunks, partition(weights));
    assert.equal(weights.reduce((a, b) => a + b, 0), row.theme.presentedCount);
    assert.ok(weights.every(n => n <= 5));
    assert.ok(row.theme.sequences.every(group => !group.preparationIds.length && group.steps.every(step => ['understand', 'imitate', 'choose-and-recall'].includes(step.kind))));
    assert.deepEqual(chunks.flatMap(chunk => row.theme.sequences.slice(chunk.groupStart, chunk.groupEndExclusive).flatMap(group => group.phraseIds)), row.theme.sequences.flatMap(group => group.phraseIds));
    assert.deepEqual(chunks.flatMap(chunk => row.theme.sequences.slice(chunk.groupStart, chunk.groupEndExclusive).flatMap(group => group.steps)), row.theme.sequences.flatMap(group => group.steps));
    chunks.forEach(chunk => { sizes[chunk.cards] = (sizes[chunk.cards] || 0) + 1; });
    report.partitions.push({pair: row.pair.id, level: row.level, theme: row.theme.id, presentations: row.theme.presentedCount, chunks}); report.totalVisibleSequences += chunks.length;
  }
  assert.equal(report.totalVisibleSequences, 337); assert.equal(longTopics.reduce((sum, row) => sum + row.theme.presentedCount, 0), 11809); report.sizeDistribution = sizes;
}));

test('partition boundaries handle small tails, internal partial groups and invalid input without changing inputs', () => checked('partition-edge-cases', () => {
  for (const total of [101, 106, 111, 119, 120, 121, 161, 201, 387]) {
    const weights = [...Array(Math.floor(total / 5)).fill(5), ...(total % 5 ? [total % 5] : [])]; inspectPartition(weights, partition(weights));
  }
  const partial = longTopics.filter(row => row.theme.sequences.slice(0, -1).some(group => group.phraseIds.length < 5)); assert.equal(partial.length, 11);
  for (const weights of [[5], Array(20).fill(5), [3, 2, 5, 1]]) { const result = partition(weights); inspectPartition(weights, result, {large: false}); assert.equal(result.length, 1); }
  for (const value of [undefined, null, [], [0], [-1], [1.5], [41], [NaN], [Infinity], ['5'], Array(1)]) assert.throws(() => helperModule.exports.partitionGroupBoundaries(value));
}));

async function open(width, height) {
  const context = await browser.newContext({viewport: {width, height}, isMobile: width <= 760, hasTouch: width <= 760, reducedMotion: 'reduce'});
  await context.addInitScript(() => {
    window.__sequenceSpeech = [];
    window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
    Object.defineProperty(window, 'speechSynthesis', {value: {cancel() {}, getVoices() { return []; }, addEventListener() {}, speak(value) { window.__sequenceSpeech.push({text: value.text, lang: value.lang}); value.onend?.(); }}});
  });
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin !== base) { report.externalRequests.push(url.origin + url.pathname); await route.abort(); }
    else if (url.pathname === '/.netlify/functions/check-status' && route.request().method() === 'GET') {
      report.mockedStatusRequests.push({method:'GET', path:url.pathname, paid:true});
      await route.fulfill({status:200, contentType:'application/json', body:JSON.stringify({paid:true})});
    }
    else if (/\/(?:\.netlify|api)\//.test(url.pathname)) { report.apiRequests.push(url.pathname); await route.abort(); }
    else await route.continue();
  });
  const page = await context.newPage(); page.on('pageerror', error => report.errors.push(error.message));
  return {context, page};
}
async function ready(page, row) {
  await page.waitForFunction(({pair, level}) => { const s = window.MelungaMockup?.state(); return s?.screen === 'themes' && s.pairId === pair && s.level === level; }, {pair: row.pair.id, level: row.level});
}
async function visit(page, row) {
  await page.goto(base + '/parcours-niveaux.html?pair=' + row.pair.id + '&level=' + row.level); await ready(page, row);
}
async function atTopic(page, row) {
  const state = await page.evaluate(() => window.MelungaMockup?.state());
  if (!state || state.pairId !== row.pair.id || state.level !== row.level) await visit(page, row);
  else if (state.screen !== 'themes') { await page.locator('#mgBack').click(); if ((await page.evaluate(() => window.MelungaMockup.state())).screen !== 'themes') await page.locator('#mgBack').click(); }
  await ready(page, row); await page.locator('#mgThemeGrid > button').nth(row.themeIndex).click();
}
const stateOf = page => page.evaluate(() => window.MelungaMockup.state());
async function settle(page) { await page.evaluate(async () => { await document.fonts.ready; await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); }); }
async function assertFit(page) {
  await settle(page);
  const measured = await page.evaluate(() => {
    const rect = node => { const r = node.getBoundingClientRect(); return {left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height}; };
    const card = document.getElementById('mgLessonView'), footer = document.getElementById('mgFooter');
    const texts = ['mgPhrase', 'mgPhon', 'mgTranslation', 'mgReading'].map(id => document.getElementById(id)).filter(node => !node.hidden && getComputedStyle(node).display !== 'none').map(node => {
      const range = document.createRange(); range.selectNodeContents(node);
      return {id: node.id, rect: rect(range), element: rect(node), overflowY: getComputedStyle(node).overflowY, overflowX: getComputedStyle(node).overflowX};
    });
    return {width: innerWidth, height: innerHeight, bodyWidth: document.documentElement.scrollWidth, card: rect(card), footer: rect(footer), cardScroll: card.scrollHeight, cardClient: card.clientHeight, texts};
  });
  assert.ok(measured.bodyWidth <= measured.width + 1); assert.ok(measured.card.right <= measured.width + 1 && measured.card.left >= -1 && measured.card.top >= -1); assert.ok(measured.card.bottom <= measured.footer.top + 1); assert.ok(measured.cardScroll <= measured.cardClient + 1);
  for (const text of measured.texts) {
    assert.ok(text.rect.left >= measured.card.left - 2 && text.rect.right <= measured.card.right + 2 && text.rect.top >= measured.card.top - 2 && text.rect.bottom <= measured.card.bottom + 2, text.id + ' glyphs stay in the complete card');
    // Visible overflow includes font ascenders/descenders and is not clipping.
    // If a field establishes a clip box, the glyphs must also fit that box.
    if (text.overflowY !== 'visible') assert.ok(text.rect.top >= text.element.top - 2 && text.rect.bottom <= text.element.bottom + 2, text.id + ' glyphs are not vertically clipped');
    if (text.overflowX !== 'visible') assert.ok(text.rect.left >= text.element.left - 2 && text.rect.right <= text.element.right + 2, text.id + ' glyphs are not horizontally clipped');
  }
  const ordered = measured.texts.filter(text => text.rect.height > 0).sort((a, b) => a.rect.top - b.rect.top); for (let i = 1; i < ordered.length; i++) assert.ok(ordered[i - 1].rect.bottom <= ordered[i].rect.top + 1, 'model fields do not overlap');
  report.fitChecks++; return measured;
}
async function assertModel(page, row, identifier) {
  await page.waitForFunction(id => window.MelungaMockup.state().phraseId === id, identifier); const model = sourcePhrase(row, identifier); assert.ok(model);
  assert.equal(await page.locator('#mgPhrase').textContent(), model.study); assert.equal(await page.locator('#mgTranslation').textContent(), model.native);
  const s = await stateOf(page); assert.equal(await page.locator('#mgPhon').textContent(), row.pair.studyLanguage === 'zh' && s.readingVisible && model.reading ? model.reading : model.phon);
  // Keyboard activation also works immediately after a swipe, while the
  // existing 600 ms ghost-touch guard deliberately suppresses synthetic taps.
  await page.locator('#mgEar').focus(); await page.locator('#mgEar').press('Enter'); const spoken = await page.evaluate(() => window.__sequenceSpeech.at(-1)); assert.equal(spoken.text, model.study); assert.ok(spoken.lang.toLowerCase().startsWith(row.pair.studyLanguage)); report.speechChecks++; report.modelFieldChecks++;
  return model;
}
async function finish(page) {
  await page.evaluate(() => { for (let i = 0; i < 200; i++) { if (window.MelungaMockup.state().screen === 'done') return; const next = document.getElementById('mgContinue'); if (next.disabled) throw new Error('Sequence cannot advance through public control'); next.click(); } throw new Error('Sequence failed to finish within the actual 30–40-card bound'); });
  await page.waitForFunction(() => window.MelungaMockup.state().screen === 'done'); await settle(page);
}

test('all 67 actual theme plans and 337 sequence cards match whole ordered source steps at mobile and desktop sizes', {timeout: 600000}, () => checked('all-current-visible-plans', async () => {
  for (const [width, height] of [[320, 640], [1280, 800]]) {
    const {context, page} = await open(width, height);
    try {
      for (const row of longTopics) {
        await atTopic(page, row); await page.waitForFunction(() => window.MelungaMockup.state().screen === 'sequences');
        const actual = await page.evaluate(() => window.MelungaMockup.visibleSequences()), boundaries = planOf(row); assert.equal(actual.length, boundaries.length);
        assert.ok((await page.locator('#mgSequenceHeading').textContent()).includes(row.theme.title));
        const buttons = page.locator('#mgSequences > button'); assert.equal(await buttons.count(), actual.length);
        for (let i = 0; i < actual.length; i++) {
          const plan = actual[i], boundary = boundaries[i], groups = row.theme.sequences.slice(boundary.groupStart, boundary.groupEndExclusive);
          assert.deepEqual(plan.phraseIds, groups.flatMap(group => group.phraseIds)); assert.deepEqual(plan.preparationIds, groups.flatMap(group => group.preparationIds || [])); assert.deepEqual(plan.steps, groups.flatMap(group => group.steps));
          for (const key of ['groupStart', 'groupEndExclusive', 'cards', 'firstPresentation', 'lastPresentation']) assert.equal(plan[key], boundary[key]);
          assert.equal(plan.index, i + 1); assert.ok(plan.id.endsWith(':visible:' + (i + 1)));
          const button = buttons.nth(i); assert.equal(await button.getAttribute('data-sequence-index'), String(i + 1)); assert.equal(await button.getAttribute('data-sequence-count'), String(actual.length)); assert.equal(await button.getAttribute('data-first-presentation'), String(boundary.firstPresentation)); assert.equal(await button.getAttribute('data-last-presentation'), String(boundary.lastPresentation));
          assert.ok((await button.textContent()).includes(boundary.firstPresentation + '–' + boundary.lastPresentation)); report.browserSequencesCompared++;
        }
        const readonly = await page.evaluate(() => { const result = window.MelungaMockup.visibleSequences(); return Object.isFrozen(result) && result.every(item => Object.isFrozen(item) && Object.isFrozen(item.phraseIds) && Object.isFrozen(item.steps) && item.steps.every(step => Object.isFrozen(step))); }); assert.equal(readonly, true);
        await buttons.first().click(); const s = await stateOf(page); assert.equal(s.screen, 'lesson'); assert.equal(s.lessonScope, 'sequence'); assert.equal(s.visibleSequenceIndex, 1); assert.equal(s.visibleSequenceCount, boundaries.length);
        await assertModel(page, row, actual[0].phraseIds[0]); await assertFit(page); report.browserThemeViews++;
        report.cases.push({kind: 'theme-plan', pair: row.pair.id, level: row.level, theme: row.theme.id, viewport: {width, height}, sequences: actual.length});
      }
    } finally { await context.close(); }
  }
  assert.equal(report.browserThemeViews, 134); assert.equal(report.browserSequencesCompared, 674);
}));

test('first, next, last and replay boundaries remain visible; short themes still start directly for all seven pairs', {timeout: 180000}, () => checked('sequence-navigation-and-short-entry', async () => {
  for (const [width, height] of [[390, 740], [1280, 800]]) {
    const {context, page} = await open(width, height);
    try {
      for (const pair of manifest.pairs) {
        const row = longTopics.filter(item => item.pair.id === pair.id).sort((a, b) => b.theme.presentedCount - a.theme.presentedCount)[0], boundaries = planOf(row);
        await atTopic(page, row); await page.locator('#mgSequences > button').first().click(); const actual = await page.evaluate(() => window.MelungaMockup.visibleSequences());
        await assertModel(page, row, actual[0].phraseIds[0]); assert.equal((await page.locator('#mgCounter').textContent()).trim(), '1 / ' + boundaries[0].cards); await finish(page);
        assert.ok((await page.locator('#mgDoneHeading').textContent()).trim()); assert.equal(await page.locator('#mgProgress').evaluate(node => node.style.width), '100%');
        await page.locator('#mgReplay').click(); assert.equal((await stateOf(page)).visibleSequenceIndex, 1); assert.equal((await stateOf(page)).stepIndex, 0); await finish(page); await page.locator('#mgContinue').click();
        assert.equal((await stateOf(page)).visibleSequenceIndex, 2); await assertModel(page, row, actual[1].phraseIds[0]); await page.locator('#mgBack').click(); assert.equal((await stateOf(page)).screen, 'sequences'); assert.equal(await page.locator('#mgSequences > button').count(), actual.length);
        await page.locator('#mgSequences > button').last().click(); assert.equal((await stateOf(page)).visibleSequenceIndex, actual.length); await assertModel(page, row, actual.at(-1).phraseIds[0]); await finish(page); await page.locator('#mgContinue').click(); assert.equal((await stateOf(page)).screen, 'sequences');
        await page.locator('#mgBack').click(); assert.equal((await stateOf(page)).screen, 'themes');
        const short = topics.find(item => item.pair.id === pair.id && item.level === 1 && item.theme.presentedCount <= 100 && item.theme.sequences.length); assert.ok(short); await atTopic(page, short); assert.equal((await stateOf(page)).screen, 'lesson'); assert.equal((await stateOf(page)).lessonScope, 'theme'); assert.deepEqual(await page.evaluate(() => window.MelungaMockup.visibleSequences()), []); await assertFit(page); await page.locator('#mgBack').click(); assert.equal((await stateOf(page)).screen, 'themes');
        report.cases.push({kind: 'boundaries-and-short', pair: pair.id, longTheme: row.theme.id, shortTheme: short.theme.id, viewport: {width, height}});
      }
    } finally { await context.close(); }
  }
}));

async function swipe(page, dx, dy) {
  const point = await page.locator('#mgTranslation').boundingBox(); assert.ok(point); const x = point.x + point.width / 2, y = point.y + point.height / 2;
  const cdp = await page.context().newCDPSession(page);
  try { await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y}]}); await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: x + dx / 2, y: y + dy / 2}]}); await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: x + dx, y: y + dy}]}); await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); }
  finally { await cdp.detach(); }
  await settle(page);
}
test('Pinyin, four mobile swipes and À revoir stay within the selected sequence and preserve source models', {timeout: 90000}, () => checked('pinyin-swipes-saved-review', async () => {
  const row = longTopics.filter(item => item.pair.id === 'fr-zh').sort((a, b) => b.theme.presentedCount - a.theme.presentedCount)[0];
  const {context, page} = await open(390, 740);
  try {
    await atTopic(page, row); await page.locator('#mgSequences > button').first().click(); const plan = (await page.evaluate(() => window.MelungaMockup.visibleSequences()))[0], first = plan.phraseIds[0];
    const model = await assertModel(page, row, first); assert.ok(model.reading); await page.locator('#mgReadingToggle').click(); assert.equal(await page.locator('#mgPhon').textContent(), model.reading); assert.equal((await stateOf(page)).readingVisible, true); await assertFit(page);
    await swipe(page, 0, -110); await assertModel(page, row, plan.phraseIds[1]); assert.equal((await stateOf(page)).visibleSequenceIndex, 1); await swipe(page, 0, 110); await assertModel(page, row, first);
    await swipe(page, -125, 0); await assertModel(page, row, plan.phraseIds[1]); await page.waitForFunction(() => document.getElementById('mgCardToast').textContent === 'Elle reviendra' && !document.getElementById('mgCardToast').hidden);
    let saved = await page.evaluate(() => JSON.parse(localStorage.getItem('melunga-guided-review-v1'))); assert.ok(saved.entries.some(entry => entry.id === first));
    await swipe(page, 125, 0); await assertModel(page, row, plan.phraseIds[2]); await page.waitForFunction(() => document.getElementById('mgCardToast').textContent === 'Rangée' && !document.getElementById('mgCardToast').hidden); assert.equal((await stateOf(page)).visibleSequenceIndex, 1); await assertFit(page);
    await page.locator('#mgBack').click(); await page.locator('#mgMenuTrigger').click(); await page.locator('[data-menu-item="À revoir"]').click(); await page.locator('#mgSavedReviewList [data-review-action="resume"]').first().click();
    await page.waitForFunction(id => window.MelungaMockup.state().phraseId === id, first); assert.equal((await stateOf(page)).lessonScope, 'saved-review'); assert.equal(await page.locator('#mgPhrase').textContent(), model.study); assert.equal(await page.locator('#mgTranslation').textContent(), model.native); await assertFit(page);
    report.cases.push({kind: 'mobile-controls', pair: row.pair.id, theme: row.theme.id, savedId: first});
  } finally { await context.close(); }
}));

test('the L1 compatibility page keeps direct theme entry without visible chunk controls', {timeout: 30000}, () => checked('legacy-l1-compatibility', async () => {
  const {context, page} = await open(390, 740);
  try {
    await page.goto(base + '/maquette-guidee.html'); await page.waitForFunction(() => window.MelungaMockup?.state().screen === 'themes'); assert.equal(await page.locator('#mgLevel').count(), 0); await page.locator('#mgThemeGrid > button').first().click(); assert.equal((await stateOf(page)).screen, 'lesson'); assert.deepEqual(await page.evaluate(() => window.MelungaMockup.visibleSequences()), []); await assertFit(page);
  } finally { await context.close(); }
}));
