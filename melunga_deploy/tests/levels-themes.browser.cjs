/* Local browser acceptance checks for the editorial L1–L10 preview.
 * NODE_PATH=/tmp/melunga-review-tools/node_modules node --test tests/levels-themes.browser.cjs
 * No account, payment, e-mail or external network request is permitted.
 * Viewports emulate screen sizes; this is not a physical-phone attestation.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const crypto = require('node:crypto');
const {test, before, after} = require('node:test');
const {chromium} = require('playwright-core');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'content/niveaux-progressifs');
const manifest = JSON.parse(fs.readFileSync(path.join(DATA, 'manifest.json')));
const visualRegistry = JSON.parse(fs.readFileSync(path.resolve(ROOT, '../docs/niveaux-progressifs/visuels.json')));
const authoredPath = path.resolve(ROOT, '../docs/niveaux-progressifs/corrections-themes/enrichissements-rediges.json');
const authored = JSON.parse(fs.readFileSync(authoredPath));
function cellBundleSha256() {
  const bundle = crypto.createHash('sha256');
  for (const pair of manifest.pairs) for (const level of pair.levels) {
    bundle.update(level.dataPath + '\0'); bundle.update(fs.readFileSync(path.join(ROOT, level.dataPath)));
  }
  return bundle.digest('hex');
}
function repertoireBundleSha256() {
  const bundle = crypto.createHash('sha256');
  for (const pair of manifest.pairs) {
    bundle.update(pair.repertoirePath + '\0');
    bundle.update(fs.readFileSync(path.join(ROOT, pair.repertoirePath)));
  }
  return bundle.digest('hex');
}
const report = {
  status: 'running', environment: 'local Chromium; emulated viewports, no physical device',
  publicSiteChecked: false, nativeOrPedagogicalValidation: false,
  widths: [320, 390, 1440], cellViews: 0, themeEntries: 0, domSteps: 0,
  runtimeJsonFieldsCompared: 0, templateSteps: 0, preparationSteps: 0, reserveCardsTracked: 0,
  heldCardsTracked: 0, canonicalCardsTracked: 0, reviewSteps: 0, reviewReferencesTracked: 0,
  adnominalHelpChecks: 0,
  authoredEntriesChecked: 0, authoredPhoneticReviewStatus: 'pending-Claude',
  renderedStepsByType: {}, failures: [],
  checks: [], manifestSha256: crypto.createHash('sha256').update(fs.readFileSync(path.join(DATA, 'manifest.json'))).digest('hex'),
  cellBundleSha256: cellBundleSha256(),
  repertoireBundleSha256: repertoireBundleSha256(),
  authoredSourceSha256: crypto.createHash('sha256').update(fs.readFileSync(authoredPath)).digest('hex'),
  externalRequests: [], apiRequests: []
};
let browser, server, base;

before(async () => {
  server = http.createServer((req, res) => {
    const pathname = new URL(req.url, 'http://fixture').pathname;
    const file = path.resolve(ROOT, '.' + pathname);
    if (!file.startsWith(ROOT + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      res.writeHead(404).end(); return;
    }
    res.setHeader('Content-Type', ({'.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json',
      '.css': 'text/css', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.png': 'image/png'})[path.extname(file)] || 'application/octet-stream');
    fs.createReadStream(file).pipe(res);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = 'http://127.0.0.1:' + server.address().port;
  browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox']});
});

after(async () => {
  await browser?.close();
  if (server) await new Promise(resolve => server.close(resolve));
  report.cellBundleStableDuringRun = cellBundleSha256() === report.cellBundleSha256;
  if (!report.cellBundleStableDuringRun) report.failures.push({check: 'content-stability', error: 'Cell JSON changed while the suite was running; rerun on a stable bundle.'});
  report.manifestStableDuringRun = crypto.createHash('sha256').update(fs.readFileSync(path.join(DATA, 'manifest.json'))).digest('hex') === report.manifestSha256;
  if (!report.manifestStableDuringRun) report.failures.push({check: 'manifest-stability', error: 'Manifest changed while the suite was running; rerun on a stable bundle.'});
  report.repertoiresStableDuringRun = repertoireBundleSha256() === report.repertoireBundleSha256;
  if (!report.repertoiresStableDuringRun) report.failures.push({check: 'bank-stability', error: 'Repertoire banks changed while the suite was running.'});
  report.authoredSourceStableDuringRun = crypto.createHash('sha256').update(fs.readFileSync(authoredPath)).digest('hex') === report.authoredSourceSha256;
  if (!report.authoredSourceStableDuringRun) report.failures.push({check: 'authored-stability', error: 'Authored source changed while the suite was running.'});
  report.status = report.failures.length ? 'failed' : 'passed';
  report.executedAt = new Date().toISOString();
  const destination = process.env.LEVELS_BROWSER_REPORT;
  if (destination) fs.writeFileSync(destination, JSON.stringify(report, null, 2) + '\n');
  assert.equal(report.cellBundleStableDuringRun, true, 'stable cell bundle during browser tests');
  assert.equal(report.manifestStableDuringRun, true, 'stable manifest during browser tests');
  assert.equal(report.repertoiresStableDuringRun, true, 'stable repertoire banks during browser tests');
  assert.equal(report.authoredSourceStableDuringRun, true, 'stable authored master during browser tests');
});

async function checked(name, action) {
  try { await action(); report.checks.push(name); }
  catch (error) { report.failures.push({check: name, error: error.message}); throw error; }
}

function cell(pair, level) {
  return JSON.parse(fs.readFileSync(path.join(DATA, pair, 'L' + level + '.json')));
}
function repertoire(pairId) {
  const metadata = manifest.pairs.find(pair => pair.id === pairId);
  return JSON.parse(fs.readFileSync(path.join(ROOT, metadata.repertoirePath)));
}
function reviewFixture(pairId) {
  for (let level = 2; level <= 10; level++) {
    const data = cell(pairId, level);
    const themeIndex = data.themes.findIndex(theme => theme.reviewReferences?.length);
    if (themeIndex >= 0) return {data, level, themeIndex, reference: data.themes[themeIndex].reviewReferences[0]};
  }
  throw new Error('No review fixture for ' + pairId);
}

async function open(width = 390, intercept = async () => false) {
  const context = await browser.newContext({viewport: {width, height: width > 760 ? 960 : 844},
    isMobile: width < 761, hasTouch: width < 761, reducedMotion: 'reduce'});
  const errors = [];
  const localRequests = [];
  await context.addInitScript(() => {
    window.__speech = [];
    window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
    Object.defineProperty(window, 'speechSynthesis', {value: {
      cancel() {}, getVoices() { return []; }, addEventListener() {},
      speak(utterance) { window.__speech.push({text: utterance.text, lang: utterance.lang}); utterance.onend?.(); }
    }});
  });
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin !== base) { report.externalRequests.push(url.origin + url.pathname); await route.abort(); return; }
    localRequests.push(url.pathname);
    if (/\/(?:\.netlify|api)\//.test(url.pathname)) {
      report.apiRequests.push({path: url.pathname, method: route.request().method()});
      await route.fulfill({json: {success: false, error: 'blocked-test-fixture'}}); return;
    }
    if (await intercept(route, url)) return;
    await route.continue();
  });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  return {context, page, errors, localRequests};
}

async function ready(page, pair, level) {
  await page.waitForFunction(({pair, level}) => {
    const state = window.MelungaMockup?.state();
    return state?.screen === 'themes' && state.pairId === pair && state.level === level;
  }, {pair, level});
}

async function inspectCell(page, expected, bank, exhaustive) {
  return page.evaluate(({expected, bank, exhaustive}) => {
    const eq = (actual, wanted, label) => {
      if (actual !== wanted) throw new Error(label + ': ' + JSON.stringify(actual) + ' != ' + JSON.stringify(wanted));
    };
    const byId = id => document.getElementById(id);
    const state = () => window.MelungaMockup.state();
    const visible = node => !node.hidden && getComputedStyle(node).display !== 'none';
    const quantity = (count, type) => {
      if (type === 'vocabulary') return count + (expected.nativeLanguage === 'zh' ? ' 个词语' : count === 1 ? ' mot ou locution' : ' mots et locutions');
      if (type === 'number') return count + (expected.nativeLanguage === 'zh' ? ' 个数词' : count === 1 ? ' nombre' : ' nombres');
      return count + (expected.nativeLanguage === 'zh' ? ' 句表达' : count === 1 ? ' expression' : ' expressions');
    };
    const tiles = [...document.querySelectorAll('#mgThemeGrid > button')];
    eq(tiles.length, expected.themes.length, 'theme count');
    eq(new Set(expected.themes.map(theme => theme.title)).size, tiles.length, 'distinct titles');
    eq(byId('mgThemeHeading').textContent, expected.levelTitle, 'level title');
    eq(document.documentElement.lang, expected.nativeLanguage, 'interface language');
    eq(byId('mgLevelText').textContent, 'L' + expected.level, 'level circle');
    eq(byId('mgLevel').value, String(expected.level), 'level select');
    eq(byId('mgLevel').options.length, 10, 'ten selectable levels');
    eq(byId('mgLevel').selectedOptions[0].textContent, 'L' + expected.level + ' · ' + expected.levelTitle, 'level option label');
    eq(byId('mgLanguage').value, expected.id, 'language select');
    eq(byId('mgLanguage').options.length, 7, 'seven selectable language pairs');
    const allCanonicalThemes = [...expected.themes, ...(expected.heldThemes || [])];
    const active = allCanonicalThemes.flatMap(theme => theme.phrases);
    const held = (expected.heldThemes || []).flatMap(theme => theme.phrases);
    const reserve = expected.reserve || [];
    const reserveIds = new Set(reserve.map(phrase => phrase.id));
    const combined = [...active, ...reserve];
    eq(new Set(combined.map(phrase => phrase.id)).size, combined.length, 'unique canonical cards including reserve');
    eq(active.length, expected.totalPhrases, 'active total');
    eq(combined.length, expected.totalCanonicalPhrases, 'active plus reserve total');
    eq(reserve.length, expected.reservedPhrases, 'reserve total');
    for (const type of ['utterance', 'vocabulary', 'number', 'incomplete', 'review']) {
      eq(combined.filter(phrase => phrase.contentType === type).length, expected.counts[type], 'partition ' + type);
    }
    if (reserve.some(phrase => !['incomplete', 'review'].includes(phrase.contentType))) throw new Error('active content leaked into reserve');
    if (active.some(phrase => reserveIds.has(phrase.id) || !['utterance', 'vocabulary', 'number'].includes(phrase.contentType))) throw new Error('reserve leaked into active themes');
    const canonicalPhrases = new Map([...(bank?.phrases || []), ...active].map(phrase => [phrase.id, phrase]));
    const presented = new Map();
    expected.themes.forEach(theme => theme.sequences.flatMap(sequence => sequence.phraseIds).forEach(id => presented.set(id, canonicalPhrases.get(id))));
    if ([...presented.values()].some(phrase => !phrase)) throw new Error('unknown presented reference');
    const expectedQuantity = ['utterance', 'vocabulary', 'number'].map(type => [type, [...presented.values()].filter(phrase => phrase.contentType === type).length])
      .filter(([, count]) => count).map(([type, count]) => quantity(count, type)).join(' · ');
    eq(byId('mgCounter').textContent, expectedQuantity, 'presented counter by type, excluding reserve and hidden stock');
    eq(state().totalPhrases, expected.themes.reduce((sum, theme) => sum + theme.presentedCount, 0), 'runtime presentation count');
    const sections = expected.themes.map(theme => theme.section).filter((section, index, list) => index === 0 || section !== list[index - 1]);
    eq(JSON.stringify([...document.querySelectorAll('#mgThemeGrid > h2')].map(node => node.textContent)),
      JSON.stringify(sections.map(section => expected.nativeLanguage === 'zh'
        ? section === 'situations' ? '情境表达' : '词汇与数字'
        : section === 'situations' ? 'Situations' : 'Vocabulaire et nombres')), 'section headings');
    const visualPositions = new Set();
    const ids = new Set();
    let steps = 0, fields = 0, templates = 0, preparations = 0, reviewSteps = 0, reviewReferences = 0, usageChecks = 0;
    const renderedByType = {};
    expected.themes.forEach((theme, i) => {
      // showThemes replaces the buttons after every back action.
      const tile = document.querySelectorAll('#mgThemeGrid > button')[i];
      eq(tile.querySelector('.mg-theme-title').textContent, theme.title, 'theme title');
      eq(tile.querySelector('.mg-theme-number').textContent, String(i + 1).padStart(2, '0'), 'ordinal');
      const references = theme.reviewReferences || [];
      const reviews = new Set(references.map(reference => reference.id));
      const newIds = new Set(theme.phrases.map(phrase => phrase.id));
      eq(theme.newCount, newIds.size, 'new count excludes reviews');
      eq(theme.reviewCount, reviews.size, 'review count');
      eq(theme.presentedCount, newIds.size + reviews.size, 'presentation count');
      if (theme.presentedCount < 6) throw new Error('visible theme has fewer than six presentations');
      if (!Number.isInteger(theme.pedagogicalConceptCount) || theme.pedagogicalConceptCount < 6) throw new Error('visible theme declares fewer than six concepts');
      let countLabel = quantity(theme.presentedCount, theme.contentType);
      if (theme.reviewCount) countLabel += expected.nativeLanguage === 'zh' ? ' · 其中 ' + theme.reviewCount + ' 项复习' : ' · ' + theme.reviewCount + (theme.reviewCount === 1 ? ' révision' : ' révisions');
      if (theme.optional) countLabel += expected.nativeLanguage === 'zh' ? ' · 可选' : ' · Facultatif';
      eq(tile.querySelector('.mg-theme-count').textContent, countLabel, 'theme counter with explicit revisions');
      for (const reference of references) {
        const phrase = canonicalPhrases.get(reference.id);
        if (!phrase || newIds.has(reference.id)) throw new Error('review is missing or a duplicate primary');
        eq(reference.firstEditorialLevel, phrase.canonicalLocation.level, 'review first level');
        if (reference.firstEditorialLevel >= expected.level) throw new Error('future review');
        eq(reference.canonicalThemeId, phrase.canonicalLocation.themeId, 'review first theme');
        eq(phrase.canonicalLocation.pairId, expected.id, 'review belongs to this pair');
        eq(phrase.contentType, theme.contentType, 'review preserves content type');
        eq(phrase.placement.domain, theme.domain, 'review preserves family');
        if (reserveIds.has(reference.id)) throw new Error('reserve became a review');
      }
      reviewReferences += references.length;
      if (!['utterance', 'vocabulary', 'number'].includes(theme.contentType)) throw new Error('invalid theme type');
      eq(theme.section, theme.contentType === 'utterance' ? 'situations' : 'vocabulary', 'theme section');
      if (theme.phrases.some(phrase => phrase.contentType !== theme.contentType || phrase.isTemplate)) throw new Error('mixed or incomplete theme ' + theme.id);
      if (theme.contentType === 'vocabulary') {
        for (const phrase of theme.phrases) if (phrase.lexicalClass && !['adjective', 'preposition', 'adverb', 'color', 'other', 'uncertain'].includes(phrase.lexicalClass)) throw new Error('invalid lexical family');
      }
      const photo = tile.querySelector('.mg-theme-photo');
      const img = photo?.querySelector('img');
      if (!theme.photo || !photo || !img || !img.src.endsWith('/' + theme.photo.asset)) throw new Error(theme.id + ': missing correct photo atlas');
      eq(Number(photo.style.getPropertyValue('--mg-photo-column')), theme.photo.column, 'photo column');
      eq(Number(photo.style.getPropertyValue('--mg-photo-row')), theme.photo.row, 'photo row');
      eq(Number(photo.style.getPropertyValue('--mg-photo-columns')), theme.photo.columns, 'atlas columns');
      eq(Number(photo.style.getPropertyValue('--mg-photo-rows')), theme.photo.rows, 'atlas rows');
      visualPositions.add(theme.photo.asset + ':' + theme.photo.column + ':' + theme.photo.row);
      ids.add(photo.dataset.themePhoto);
      const box = tile.getBoundingClientRect();
      if (box.height < 44 || box.width < 44) throw new Error(theme.id + ': small theme target');
      tile.click();
      eq(state().screen, 'lesson', 'one-click theme entry');
      eq(state().lessonScope, 'theme', 'one lesson per theme');
      if (visible(byId('mgSequenceView'))) throw new Error('sequence screen became visible');
      const allSteps = theme.sequences.flatMap(sequence => sequence.steps);
      const primaryIds = theme.sequences.flatMap(sequence => sequence.phraseIds);
      let startedNew = false;
      for (const step of allSteps) {
        if (step.isReview && startedNew) throw new Error('review returns after introducing new content');
        if (!step.isReview && !step.isPreparation) startedNew = true;
      }
      for (const id of reviews) {
        const kinds = allSteps.filter(step => step.utterance === id).map(step => step.kind);
        if (!kinds.includes('understand') || !kinds.includes('imitate') || !kinds.some(kind => ['choose-and-recall', 'reply-without-model', 'recall'].includes(kind))) throw new Error('review omits a complete hear/imitate/recall cycle');
      }
      theme.sequences.forEach(sequence => {
        sequence.steps.filter(step => step.isPreparation).forEach(step => {
          if (!['understand', 'imitate'].includes(step.kind)) throw new Error('support must only be heard/imitated ' + step.id);
          if (!sequence.preparationIds?.includes(step.utterance)) throw new Error('undeclared preparation ' + step.id);
          if (!sequence.phraseIds.includes(step.prepares)) throw new Error('support has no primary target ' + step.id);
          const support = canonicalPhrases.get(step.utterance);
          if (!support || support.isTemplate) throw new Error('missing or incomplete preparation ' + step.id);
        });
        for (const step of sequence.steps) {
          const references = [step.utterance, ...(step.choices || [])].filter(Boolean);
          if (references.some(id => reserveIds.has(id))) throw new Error('reserve became an exercise ' + step.id);
          if (theme.contentType === 'utterance' && references.some(id => canonicalPhrases.get(id)?.contentType !== 'utterance')) throw new Error('lexeme became a situation exercise ' + step.id);
        }
      });
      // At 390px check every rendered step/field. Other widths exercise each theme entry.
      const limit = exhaustive ? allSteps.length : Math.min(allSteps.length, theme.sequences[0].steps.length);
      for (let index = 0; index < limit; index++) {
        const step = allSteps[index];
        const phrase = canonicalPhrases.get(step.utterance || step.choices?.[0]);
        if (!phrase) throw new Error('Unresolved step ' + step.id);
        eq(state().stepIndex, index, 'step index');
        eq(state().phraseId, phrase.id, 'phrase identity');
        const review = reviews.has(phrase.id);
        eq(!!step.isReview, review, 'review step is explicitly marked');
        eq(byId('mgLessonTheme').textContent, String(i + 1).padStart(2, '0') + ' · ' + theme.title
          + (review ? expected.nativeLanguage === 'zh' ? ' · 复习' : ' · Révision' : ''), 'explicit review badge');
        if (review) reviewSteps++;
        if (reserveIds.has(state().phraseId)) throw new Error('reserve reached DOM/audio state');
        eq(byId('mgCounter').textContent, (primaryIds.indexOf(step.prepares || phrase.id) + 1) + ' / ' + primaryIds.length, 'primary-only lesson counter');
        eq(byId('mgPhrase').textContent, phrase.study, 'study verbatim ' + phrase.id);
        eq(byId('mgPhon').textContent, phrase.phon, 'phonetic verbatim ' + phrase.id);
        eq(byId('mgTranslation').textContent, phrase.native, 'meaning verbatim ' + phrase.id);
        eq(byId('mgReading').textContent, phrase.reading || '', 'reading verbatim ' + phrase.id);
        if (phrase.lexicalUsage?.requiresNounInUtterance) {
          const instruction = expected.nativeLanguage === 'zh' ? '这个形式用于名词前，不能单独构成句子。'
            : 'Cette forme s’emploie devant un nom ; elle ne constitue pas une phrase toute seule.';
          if (!byId('mgHelpText').textContent.includes(instruction)) throw new Error('missing adnominal usage in optional help');
          usageChecks++;
        }
        if (index === 0 && document.documentElement.scrollWidth > innerWidth + 1) throw new Error('horizontal lesson overflow');
        fields += 4;
        renderedByType[phrase.contentType] = (renderedByType[phrase.contentType] || 0) + 1;
        const lexical = ['vocabulary', 'number'].includes(phrase.contentType);
        const earLabel = expected.nativeLanguage === 'zh'
          ? lexical ? state().masked ? '显示并听这个词语' : '听这个词语' : state().masked ? '显示并听这句话' : '听这句话'
          : lexical ? state().masked ? 'Révéler et écouter le mot' : 'Écouter le mot' : state().masked ? 'Révéler et écouter la phrase' : 'Écouter la phrase';
        eq(byId('mgEar').getAttribute('aria-label'), earLabel, 'word/phrase audio label');
        const template = !!(phrase.isTemplate || !step.isPreparation && (theme.isTemplateCollection || theme.isTemplate));
        if (step.isPreparation) {
          preparations++;
          eq(state().masked, false, 'preparation has no recall');
        }
        if (template) {
          templates++;
          eq(state().masked, false, 'template must never be masked');
          eq(byId('mgEar').hidden, true, 'template ear disabled');
          eq(byId('mgReplay').disabled, true, 'template replay disabled');
          const spoken = window.__speech.length;
          byId('mgEar').click(); byId('mgReplay').click();
          eq(window.__speech.length, spoken, 'template never sent to TTS');
        } else if (index === 0) {
          byId('mgEar').click();
          eq(window.__speech.at(-1)?.text, phrase.study, 'TTS receives study text only');
        }
        if (state().masked) {
          eq(byId('mgPhrase').hidden, true, 'recall hides study');
          eq(byId('mgPhon').hidden, true, 'recall hides phonetic');
          eq(byId('mgTranslation').hidden, false, 'recall keeps meaning');
          const spoken = window.__speech.length;
          byId('mgReplay').click();
          eq(state().masked, true, 'background audio must not reveal');
          eq(window.__speech.length, spoken, 'background audio must not speak recalled model');
          byId('mgEar').click();
          eq(state().masked, false, 'explicit ear reveals recall');
          eq(window.__speech.at(-1)?.text, phrase.study, 'revealed TTS receives study text');
        }
        steps++;
        if (index < limit - 1) byId('mgContinue').click();
      }
      if (exhaustive) {
        byId('mgContinue').click(); eq(state().screen, 'done', 'theme reaches completion');
        byId('mgContinue').click();
      } else byId('mgBack').click();
      eq(state().screen, 'themes', 'return to themes');
    });
    eq(visualPositions.size, expected.themes.length, 'one distinct photo tile per theme');
    eq(ids.size, expected.themes.length, 'distinct theme visual identities');
    if (document.documentElement.scrollWidth > innerWidth + 1) throw new Error('horizontal document overflow');
    return {steps, fields, templates, preparations, reviewSteps, reviewReferences, usageChecks, themes: expected.themes.length,
      renderedByType, reserved: reserve.length, held: held.length, canonical: combined.length};
  }, {expected, bank, exhaustive});
}

for (const width of report.widths) test('70 pair/level cells at ' + width + 'px', {timeout: 300000}, async () => checked('matrix-' + width, async () => {
  const fixture = await open(width);
  try {
    const {page} = fixture;
    await page.goto(base + '/parcours-niveaux.html?pair=' + manifest.pairs[0].id + '&level=1');
    for (const pair of manifest.pairs) {
      for (let level = 1; level <= 10; level++) {
        if (await page.locator('#mgLanguage').inputValue() !== pair.id) {
          const previousLevel = Number(await page.locator('#mgLevel').inputValue());
          await page.selectOption('#mgLanguage', pair.id); await ready(page, pair.id, previousLevel);
        }
        if (Number(await page.locator('#mgLevel').inputValue()) !== level) await page.selectOption('#mgLevel', String(level));
        await ready(page, pair.id, level);
        let result;
        try { result = await inspectCell(page, cell(pair.id, level), repertoire(pair.id), width === 390); }
        catch (error) { throw new Error(pair.id + '/L' + level + ' @' + width + ': ' + error.message); }
        report.cellViews++; report.themeEntries += result.themes; report.domSteps += result.steps;
        report.runtimeJsonFieldsCompared += result.fields; report.templateSteps += result.templates;
        report.preparationSteps += result.preparations;
        report.reviewSteps += result.reviewSteps;
        report.adnominalHelpChecks += result.usageChecks;
        if (width === 390) {
          report.reserveCardsTracked += result.reserved; report.heldCardsTracked += result.held;
          report.canonicalCardsTracked += result.canonical; report.reviewReferencesTracked += result.reviewReferences;
        }
        for (const [type, count] of Object.entries(result.renderedByType)) report.renderedStepsByType[type] = (report.renderedStepsByType[type] || 0) + count;
      }
    }
    assert.deepEqual(fixture.errors, []);
  } finally { await fixture.context.close(); }
}));

test('native lexical classes and reviewed relational groups follow their declared families', async () => checked('lexical-family-priority', async () => {
  const families = {adjective: 'vocab-adjectifs', preposition: 'vocab-prepositions', adverb: 'vocab-adverbes', color: 'vocab-couleurs'};
  const totals = {cells: 0, adjective: 0, preposition: 0, adverb: 0, color: 0, functionalRelationGroups: 0};
  const locativeExceptions = new Map([
    ...[2348, 2349, 2848, 2849, 2927, 2928, 2929, 2930].map(index => ['fr-zh:' + index, 'chinese-localizer']),
    ['fr-es:3894', 'whole-locative-prepositional-group-with-complement']
  ]);
  for (const pair of manifest.pairs) for (const metadata of pair.levels) {
    const data = cell(pair.id, metadata.level);
    for (const theme of [...data.themes, ...(data.heldThemes || [])]) {
      for (const phrase of theme.phrases) {
        if (phrase.contentType !== 'vocabulary') continue;
        assert.ok(['adjective', 'preposition', 'adverb', 'color', 'other', 'uncertain'].includes(phrase.lexicalClass), 'lexical class ' + phrase.id);
        const family = families[phrase.lexicalClass];
        if (family) {
          assert.equal(theme.domain, family, 'family before situation/theme bucket for ' + phrase.id);
          totals[phrase.lexicalClass]++;
        }
        for (const [type, domain] of Object.entries(families)) if (theme.domain === domain) {
          if (domain === 'vocab-prepositions' && phrase.lexicalClass === 'other') {
            const usage = locativeExceptions.get(pair.id + ':' + phrase.source.sourceIndex);
            assert.ok(usage, 'only individually reviewed functional locatives may keep another native class');
            assert.equal(phrase.lexicalUsage, usage, 'explicit native locative usage');
            assert.equal(phrase.lexicalFamilyOverride, domain, 'reviewed functional family');
            assert.equal(phrase.semanticReview.status, 'reviewed');
            totals.functionalRelationGroups++;
          } else assert.equal(phrase.lexicalClass, type, 'homogeneous POS family ' + theme.id);
        }
      }
    }
    totals.cells++;
  }
  report.lexicalFamilyRouting = totals;
}));

test('new whole entries copy the authored source; review transport creates no canonical cards', async () => checked('authored-source-and-bank-conservation', async () => {
  const canonical = new Map();
  for (const pair of manifest.pairs) for (const metadata of pair.levels) {
    const data = cell(pair.id, metadata.level);
    for (const phrase of [...data.themes, ...(data.heldThemes || [])].flatMap(theme => theme.phrases).concat(data.reserve || [])) {
      const key = pair.id + ':' + phrase.id;
      assert.ok(!canonical.has(key), 'one canonical first placement ' + key);
      canonical.set(key, phrase);
    }
  }
  for (const pair of manifest.pairs) {
    const bank = repertoire(pair.id);
    assert.equal(bank.pairId, pair.id);
    assert.equal(new Set(bank.phrases.map(phrase => phrase.id)).size, bank.phrases.length);
    for (const phrase of bank.phrases) {
      const original = canonical.get(pair.id + ':' + phrase.id);
      assert.ok(original && !['incomplete', 'review'].includes(original.contentType), 'bank references existing active canonical source');
      assert.equal(phrase.referenceOnly, true);
      for (const field of ['study', 'native', 'phon', 'reading', 'contentType', 'editorialLevel', 'lexicalClass']) assert.equal(phrase[field], original[field], 'bank verbatim ' + field);
      for (const field of ['lexicalUsage', 'numberKind', 'numberValue', 'numberOrder']) assert.deepEqual(phrase[field], original[field], 'bank preserves native/numeric usage ' + field);
      assert.equal(phrase.canonicalLocation.level, original.editorialLevel);
      assert.equal(phrase.canonicalLocation.pairId, pair.id);
    }
  }
  for (const item of authored.items) {
    const phrase = canonical.get(item.pair + ':editorial:' + item.id);
    assert.ok(phrase, 'authored entry retained ' + item.id);
    for (const field of ['study', 'native', 'phon', 'reading']) assert.equal(phrase[field], item[field], 'whole authored field ' + item.id + ':' + field);
    assert.equal(phrase.phoneticReviewStatus, 'pending-Claude');
    assert.equal(phrase.source.collection, 'editorial-authored');
    assert.equal(phrase.source.itemId, item.id);
    assert.equal(phrase.source.sourceFileSha256, report.authoredSourceSha256);
    report.authoredEntriesChecked++;
  }
  assert.equal(report.authoredEntriesChecked, authored.items.length);
  report.canonicalEntriesAcrossAllCells = canonical.size;
}));

test('reviewed Japanese/Korean semantic corrections reach the actual canonical themes', async () => checked('ja-ko-semantic-routing-regressions', async () => {
  const corrections = JSON.parse(fs.readFileSync(path.resolve(ROOT, '../docs/niveaux-progressifs/corrections-themes/ja-ko.json')));
  const routes = new Map();
  for (const pair of ['fr-ja', 'fr-ko']) for (let level = 1; level <= 10; level++) {
    const data = cell(pair, level);
    for (const theme of [...data.themes, ...(data.heldThemes || [])]) for (const phrase of theme.phrases) {
      if (phrase.source?.sourceIndex !== undefined) routes.set(pair + ':' + phrase.source.sourceIndex, {domain: theme.domain, phrase});
    }
  }
  for (const correction of corrections.routingCorrections) assert.equal(routes.get(correction.pair + ':' + correction.sourceIndex)?.domain, correction.afterDomain,
    correction.pair + ':' + correction.sourceIndex + ' meaning-based destination');
  for (const correction of corrections.isolatedNumberCorrections || []) {
    const actual = routes.get(correction.pair + ':' + correction.sourceIndex);
    assert.equal(actual?.domain, 'nombres', 'whole numeric quantity has its number theme');
    assert.equal(actual.phrase.contentType, 'number');
    assert.equal(actual.phrase.numberKind, correction.numberKind, 'exact collective vs approximate quantity');
    if (correction.numberKind === 'fraction') assert.deepEqual(actual.phrase.numberValue,
      correction.numberExactValue.split('/').map(Number), 'exact rational value');
    else assert.equal(actual.phrase.numberValue, correction.numberValue, 'exact or central numeric value');
  }
  report.jaKoSemanticDestinationsChecked = corrections.routingCorrections.length;
  report.jaKoWholeNumericQuantitiesChecked = (corrections.isolatedNumberCorrections || []).length;
  for (const [pair, first, second] of [['fr-ja', 'catalogue:ja:3062', 'catalogue:ja:3063'], ['fr-ko', 'catalogue:ko:2213', 'catalogue:ko:2214']]) {
    const adjectives = cell(pair, 1).themes.find(theme => theme.domain === 'vocab-adjectifs');
    assert.ok(adjectives);
    assert.deepEqual(adjectives.sequences.flatMap(sequence => sequence.phraseIds).slice(0, 2), [first, second], 'begin with large then small, before authored extensions');
  }
}));

test('latest pair/level wins delayed responses; failed cells can be retried', {timeout: 30000}, async () => checked('fetch-races-and-retry', async () => {
  const releases = new Map();
  let fail = true;
  const fixture = await open(390, async (route, url) => {
    const delayedLevel = /\/fr-zh\/L(2|4)\.json$/.exec(url.pathname)?.[1];
    if (delayedLevel && !releases.has(delayedLevel)) {
      await new Promise(resolve => { releases.set(delayedLevel, async () => {
        try { await route.fulfill({contentType: 'application/json', body: JSON.stringify(cell('fr-zh', Number(delayedLevel)))}); } catch (_) {}
        resolve();
      }); });
      return true;
    }
    if (url.pathname.endsWith('/fr-es/L7.json') && fail) {
      fail = false; await route.fulfill({status: 503, contentType: 'application/json', body: '{}'}); return true;
    }
    return false;
  });
  try {
    const {page} = fixture;
    await page.goto(base + '/parcours-niveaux.html?pair=fr-zh&level=1'); await ready(page, 'fr-zh', 1);
    await page.selectOption('#mgLevel', '2');
    await page.waitForFunction(() => document.body.dataset.view === 'loading');
    await page.selectOption('#mgLevel', '3'); await ready(page, 'fr-zh', 3);
    assert.ok(releases.has('2')); await releases.get('2')();
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    assert.equal((await page.evaluate(() => window.MelungaMockup.state())).level, 3);
    await page.selectOption('#mgLevel', '4');
    await page.waitForFunction(() => document.body.dataset.view === 'loading');
    await page.selectOption('#mgLanguage', 'fr-es'); await ready(page, 'fr-es', 4);
    await page.selectOption('#mgLevel', '3'); await ready(page, 'fr-es', 3);
    assert.ok(releases.has('4')); await releases.get('4')();
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    assert.equal((await page.evaluate(() => window.MelungaMockup.state())).pairId, 'fr-es');
    assert.equal((await page.evaluate(() => window.MelungaMockup.state())).level, 3);
    assert.match(page.url(), /pair=fr-es/); assert.match(page.url(), /level=3/);
    await page.selectOption('#mgLevel', '7'); await page.locator('#mgRetry').waitFor({state: 'visible'});
    assert.equal((await page.evaluate(() => window.MelungaMockup.state())).screen, 'loading');
    await page.click('#mgRetry'); await ready(page, 'fr-es', 7);
    assert.equal(await page.locator('#mgLevelText').textContent(), 'L7');
    assert.deepEqual(fixture.errors, []);
  } finally { for (const release of releases.values()) await release(); await fixture.context.close(); }
}));

test('first manifest and first cell failures have an operational retry', {timeout: 30000}, async () => checked('initial-load-retries', async () => {
  for (const failPath of ['/manifest.json', '/fr-zh/L1.json']) {
    let fail = true;
    const fixture = await open(390, async (route, url) => {
      if (url.pathname.endsWith(failPath) && fail) {
        fail = false; await route.fulfill({status: 503, contentType: 'application/json', body: '{}'}); return true;
      }
      return false;
    });
    try {
      await fixture.page.goto(base + '/parcours-niveaux.html?pair=fr-zh&level=1');
      await fixture.page.locator('#mgRetry').waitFor({state: 'visible'});
      await fixture.page.click('#mgRetry'); await ready(fixture.page, 'fr-zh', 1);
      assert.deepEqual(fixture.errors, []);
    } finally { await fixture.context.close(); }
  }
}));

test('a repertoire bank is loaded only for reviews and a failed bank can be retried', {timeout: 30000}, async () => checked('repertoire-loading-and-retry', async () => {
  const pairId = manifest.pairs[0].id;
  const target = reviewFixture(pairId);
  const bankPath = '/' + manifest.pairs[0].repertoirePath;
  const noBank = await open(390);
  try {
    await noBank.page.goto(base + '/parcours-niveaux.html?pair=' + pairId + '&level=1'); await ready(noBank.page, pairId, 1);
    assert.equal(cell(pairId, 1).themes.some(theme => theme.reviewReferences?.length), false, 'L1 cannot cite an earlier level');
    assert.ok(!noBank.localRequests.includes(bankPath), 'no bank request without references');
  } finally { await noBank.context.close(); }
  let fail = true;
  const fixture = await open(390, async (route, url) => {
    if (url.pathname === bankPath && fail) {
      fail = false; await route.fulfill({status: 404, contentType: 'application/json', body: '{}'}); return true;
    }
    return false;
  });
  try {
    await fixture.page.goto(base + '/parcours-niveaux.html?pair=' + pairId + '&level=' + target.level);
    await fixture.page.locator('#mgRetry').waitFor({state: 'visible'});
    assert.equal((await fixture.page.evaluate(() => window.MelungaMockup.state())).screen, 'loading');
    await fixture.page.click('#mgRetry'); await ready(fixture.page, pairId, target.level);
    assert.equal(fixture.localRequests.filter(value => value === bankPath).length, 2);
    assert.deepEqual(fixture.errors, []);
  } finally { await fixture.context.close(); }
}));

test('future, wrong-type, wrong-family, wrong-subclass and insufficient-concept references are refused', {timeout: 60000}, async () => checked('repertoire-reference-guards', async () => {
  const pairId = manifest.pairs[0].id;
  const basic = reviewFixture(pairId);
  for (const alteration of ['future', 'type', 'family', 'subclass', 'concept-count']) {
    const target = JSON.parse(JSON.stringify(basic.data));
    const bank = repertoire(pairId);
    let theme = target.themes[basic.themeIndex];
    if (alteration === 'subclass') {
      theme = target.themes.find(candidate => ['vocab-adjectifs', 'vocab-prepositions', 'vocab-adverbes', 'vocab-couleurs'].includes(candidate.domain) && candidate.reviewReferences?.length);
      assert.ok(theme, 'a reviewed POS family is available');
    }
    const reference = theme.reviewReferences[0];
    const phrase = bank.phrases.find(candidate => candidate.id === reference.id);
    assert.ok(phrase);
    if (alteration === 'future') {
      reference.firstEditorialLevel = target.level;
      phrase.editorialLevel = target.level;
      phrase.canonicalLocation.level = target.level;
    } else if (alteration === 'type') {
      phrase.contentType = theme.contentType === 'utterance' ? 'vocabulary' : 'utterance';
    } else if (alteration === 'subclass') {
      phrase.lexicalClass = phrase.lexicalClass === 'adjective' ? 'color' : 'adjective';
    } else if (alteration === 'concept-count') {
      theme.pedagogicalConceptCount = 5;
    } else {
      phrase.placement.domain = theme.domain === 'vocab-maison' ? 'vocab-voyage' : 'vocab-maison';
    }
    const cellPath = '/content/niveaux-progressifs/' + pairId + '/L' + target.level + '.json';
    const bankPath = '/' + manifest.pairs[0].repertoirePath;
    let corrupted = true;
    const fixture = await open(390, async (route, url) => {
      if (url.pathname === cellPath || url.pathname === bankPath) {
        const body = corrupted ? url.pathname === cellPath ? target : bank
          : url.pathname === cellPath ? cell(pairId, target.level) : repertoire(pairId);
        await route.fulfill({contentType: 'application/json', body: JSON.stringify(body)}); return true;
      }
      return false;
    });
    try {
      await fixture.page.goto(base + '/parcours-niveaux.html?pair=' + pairId + '&level=' + target.level);
      await fixture.page.locator('#mgRetry').waitFor({state: 'visible'});
      assert.equal((await fixture.page.evaluate(() => window.MelungaMockup.state())).screen, 'loading', alteration + ' must not display a partial lesson');
      corrupted = false;
      await fixture.page.click('#mgRetry'); await ready(fixture.page, pairId, target.level);
      assert.equal(fixture.localRequests.filter(value => value === bankPath).length, 2, alteration + ' retry refetches the corrected bank');
      assert.deepEqual(fixture.errors, []);
    } finally { await fixture.context.close(); }
  }
}));

test('a delayed old bank cannot overwrite a newly selected pair or its review audio', {timeout: 30000}, async () => checked('repertoire-pair-race', async () => {
  const first = manifest.pairs[0].id, second = manifest.pairs[1].id;
  const firstTarget = reviewFixture(first), secondTarget = reviewFixture(second);
  const firstBankPath = '/' + manifest.pairs[0].repertoirePath;
  let release;
  let requestedResolve;
  const requested = new Promise(resolve => { requestedResolve = resolve; });
  const fixture = await open(390, async (route, url) => {
    if (url.pathname === firstBankPath && !release) {
      await new Promise(resolve => {
        release = async () => { try { await route.fulfill({contentType: 'application/json', body: JSON.stringify(repertoire(first))}); } catch (_) {} resolve(); };
        requestedResolve();
      }); return true;
    }
    return false;
  });
  try {
    const {page} = fixture;
    await page.goto(base + '/parcours-niveaux.html?pair=' + first + '&level=' + firstTarget.level);
    await requested;
    await page.selectOption('#mgLanguage', second); await ready(page, second, firstTarget.level);
    if (firstTarget.level !== secondTarget.level) { await page.selectOption('#mgLevel', String(secondTarget.level)); await ready(page, second, secondTarget.level); }
    await release();
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    assert.equal((await page.evaluate(() => window.MelungaMockup.state())).pairId, second);
    const theme = secondTarget.data.themes[secondTarget.themeIndex];
    const steps = theme.sequences.flatMap(sequence => sequence.steps);
    const reviewIndex = steps.findIndex(step => step.isReview);
    assert.ok(reviewIndex >= 0);
    await page.locator('#mgThemeGrid > button').nth(secondTarget.themeIndex).click();
    await page.evaluate(count => { for (let index = 0; index < count; index++) document.getElementById('mgContinue').click(); }, reviewIndex);
    const step = steps[reviewIndex];
    const phrase = repertoire(second).phrases.find(candidate => candidate.id === step.utterance);
    assert.equal((await page.evaluate(() => window.MelungaMockup.state())).phraseId, phrase.id);
    assert.equal(await page.locator('#mgPhon').textContent(), phrase.phon);
    await page.click('#mgEar');
    assert.equal(await page.evaluate(() => window.__speech.at(-1).text), phrase.study);
    assert.deepEqual(fixture.errors, []);
  } finally { if (release) await release(); await fixture.context.close(); }
}));

test('L5 menu, three ambiences and minimum controls at all widths', {timeout: 60000}, async () => checked('menu-palette-targets', async () => {
  for (const width of report.widths) {
    const fixture = await open(width);
    try {
      const {page} = fixture;
      await page.goto(base + '/parcours-niveaux.html?pair=fr-ko&level=5'); await ready(page, 'fr-ko', 5);
      const smallTopTargets = await page.locator('#mgLevel, #mgLanguage, #mgPalette, #mgMenuTrigger').evaluateAll(nodes => nodes
        .map(node => ({id: node.id, width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height}))
        .filter(node => node.width < 44 || node.height < 44));
      assert.deepEqual(smallTopTargets, [], '44px top controls at ' + width + 'px');
      const ambiences = new Set();
      for (let i = 0; i < 3; i++) { ambiences.add(await page.locator('body').getAttribute('data-ambience')); await page.click('#mgPalette'); }
      assert.equal(ambiences.size, 3);
      await page.click('#mgMenuTrigger'); assert.equal(await page.locator('#mgMenuTrigger').getAttribute('aria-expanded'), 'true');
      assert.equal(await page.locator('#mgMenuNav > *').count(), 9);
      const targets = await page.locator('#mgMenuNav > *').evaluateAll(nodes => nodes.map(node => ({
        label: node.textContent, width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height
      })));
      assert.deepEqual(targets.filter(target => target.width < 44 || target.height < 44), []);
      await page.locator('[data-menu-item="voice"]').click(); await page.locator('#mgVoicePanel').waitFor({state: 'visible'});
      await page.selectOption('#mgSpeed', '0.75'); await page.click('#mgMenuBack');
      await page.click('#mgMenuClose');
      assert.equal((await page.evaluate(() => window.MelungaMockup.state())).level, 5);
      await page.locator('#mgThemeGrid > button').first().click();
      const small = await page.locator('#mgBack, #mgHelp, #mgEar, #mgReplay, #mgContinue').evaluateAll(nodes => nodes
        .filter(node => !node.hidden && getComputedStyle(node).display !== 'none')
        .map(node => ({id: node.id, width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height}))
        .filter(node => node.width < 44 || node.height < 44));
      assert.deepEqual(small, []);
      assert.deepEqual(fixture.errors, []);
    } finally { await fixture.context.close(); }
  }
}));

test('approved L1-only page stays compatible with v1 data and no level selector', {timeout: 30000}, async () => checked('legacy-v1-compatibility', async () => {
  const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/maquette-guidee.json')));
  assert.equal(data.pairs.flatMap(pair => pair.themes.flatMap(theme => theme.phrases)).length, 2134, 'approved L1 card count');
  const fixture = await open(390);
  try {
    const {page} = fixture;
    for (const pair of data.pairs) {
      await page.goto(base + '/maquette-guidee.html?pair=' + pair.id); await ready(page, pair.id, 1);
      assert.equal(await page.locator('#mgLevel').count(), 0);
      assert.equal(await page.locator('#mgThemeGrid > button').count(), pair.themes.length);
      const photos = await page.locator('#mgThemeGrid .mg-theme-photo').evaluateAll(nodes => nodes.map(node => ({
        source: node.querySelector('img')?.getAttribute('src'), columns: node.style.getPropertyValue('--mg-photo-columns'), rows: node.style.getPropertyValue('--mg-photo-rows')
      })));
      assert.equal(photos.length, pair.themes.length);
      assert.ok(photos.every(photo => photo.source === 'assets/theme-scenes.webp' && photo.columns === '3' && photo.rows === '4'), 'legacy 3x4 atlas');
      await page.locator('#mgThemeGrid > button').first().click();
      assert.equal((await page.evaluate(() => window.MelungaMockup.state())).screen, 'lesson');
      const first = pair.themes[0].phrases.find(phrase => phrase.id === pair.themes[0].sequences[0].steps[0].utterance);
      assert.equal(await page.locator('#mgPhrase').textContent(), first.study);
      assert.equal(await page.locator('#mgPhon').textContent(), first.phon);
      const steps = pair.themes[0].sequences.flatMap(sequence => sequence.steps);
      const recallIndex = steps.findIndex(step => ['choose-and-recall', 'reply-without-model', 'recall'].includes(step.kind));
      assert.ok(recallIndex >= 0, pair.id + ' legacy recall');
      await page.evaluate(count => { for (let i = 0; i < count; i++) document.getElementById('mgContinue').click(); }, recallIndex);
      const recalled = pair.themes[0].phrases.find(phrase => phrase.id === steps[recallIndex].utterance);
      assert.equal((await page.evaluate(() => window.MelungaMockup.state())).masked, true);
      assert.equal(await page.locator('#mgTranslation').textContent(), recalled.native);
      const spoken = await page.evaluate(() => window.__speech.length);
      await page.evaluate(() => document.getElementById('mgReplay').click());
      assert.equal((await page.evaluate(() => window.MelungaMockup.state())).masked, true);
      assert.equal(await page.evaluate(() => window.__speech.length), spoken);
      await page.click('#mgEar');
      assert.equal((await page.evaluate(() => window.MelungaMockup.state())).masked, false);
      assert.equal(await page.locator('#mgPhrase').textContent(), recalled.study);
      assert.equal(await page.locator('#mgPhon').textContent(), recalled.phon);
      assert.equal(await page.evaluate(() => window.__speech.at(-1).text), recalled.study);
      await page.click('#mgBack'); await ready(page, pair.id, 1);
    }
    assert.deepEqual(fixture.errors, []);
  } finally { await fixture.context.close(); }
}));

test('250 registered photo slots in 21 distinct atlases; no external or API operations', {timeout: 30000}, async () => checked('photo-atlases-and-network-isolation', async () => {
  const fixture = await open();
  try {
    await fixture.page.goto(base + '/parcours-niveaux.html'); await ready(fixture.page, 'fr-zh', 1);
    const assets = [...visualRegistry.levels, ...visualRegistry.vocabularyAtlases, ...visualRegistry.grammarAtlases, ...visualRegistry.correctionAtlases];
    assert.equal(assets.length, 21, '21 atlases');
    assert.equal(visualRegistry.themes.length, 250, '250 distinct slots');
    assert.equal(new Set(visualRegistry.themes.map(theme => theme.asset + ':' + theme.column + ':' + theme.row)).size, 250, 'one slot per theme/level');
    const assetByName = new Map(assets.map(asset => [asset.asset, asset]));
    for (const theme of visualRegistry.themes) {
      const atlas = assetByName.get(theme.asset);
      assert.ok(atlas, 'known atlas ' + theme.asset);
      assert.ok(theme.column >= 0 && theme.column < atlas.columns && theme.row >= 0 && theme.row < atlas.rows, 'slot inside atlas');
    }
    const hashes = new Set();
    for (const asset of assets) {
      const file = asset.asset;
      assert.ok(fs.existsSync(path.join(ROOT, file)), 'Missing atlas ' + file);
      const hash = crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, file))).digest('hex');
      assert.equal(hash, asset.sha256, 'registry asset fingerprint ' + file);
      hashes.add(hash);
      const result = await fixture.page.evaluate(async file => {
        const image = new Image(); image.src = '/' + file; await image.decode();
        return {width: image.naturalWidth, height: image.naturalHeight};
      }, file);
      assert.ok(result.width >= 768 && result.height >= 1024, file + ' resolution');
    }
    assert.equal(hashes.size, 21, 'unique atlas files');
    assert.equal(assetByName.get('assets/theme-scenes.webp').sha256, 'ba431628deddbaafa34384b196c1f3428d606673662681a3835c4b92fe5d7a1c', 'approved L1 image preserved');
    assert.deepEqual(report.externalRequests, []);
    assert.deepEqual(report.apiRequests, []);
  } finally { await fixture.context.close(); }
}));
