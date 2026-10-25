/* Independent QA of the approved whole-aid overlay. No producer is imported.
 * node --test tests/phonetic-corrections.cjs
 * Browser checks use local Chromium and mocked TTS, never a public service.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');
const {isDeepStrictEqual} = require('node:util');
const lot4Corrections = require('./lot4-corrections.cjs');
const lot3Corrections = require('./lot3-corrections.cjs');
const ROOT = path.resolve(__dirname, '..', '..');
const WEB = path.join(ROOT, 'melunga_deploy');
const REGISTRY = 'docs/niveaux-progressifs/corrections-phonetiques/revue-claude-lot2.json';
const EVIDENCE_COMMIT = 'dfc665bf5574dd99d308c756efc69c571aec62cc';
const BASELINE = '97e80f9';
const EVIDENCE = {
  'docs/revue-integrale/registre-phonetique.json': '2833fca404acbac078e03090c864b4dd1a8aaa658ab626563672d20c0db9569c',
  'docs/revue-integrale/registre-tj.json': '856ccdd4525fdd74706ae16081c28e60bd629b3e83039502df81f824ebca74d0'
};
const fields = ['study', 'native', 'phon', 'reading'];
const read = filename => JSON.parse(fs.readFileSync(path.join(ROOT, filename), 'utf8'));
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const clone = value => JSON.parse(JSON.stringify(value));
const key = (pair, id) => pair + '\0' + id;
const at = (document, location) => location.reduce((value, part) => value[part], document);
const baselines = new Map();
function baseline(filename) {
  if (!baselines.has(filename)) baselines.set(filename, JSON.parse(execFileSync('git',
    ['show', BASELINE + ':' + filename], {cwd: ROOT, encoding:'utf8', maxBuffer:32 * 1024 * 1024})));
  return baselines.get(filename);
}
let loaded;
function loadRegistry(override) {
  if (!override && loaded) return loaded;
  const bytes = fs.readFileSync(path.join(ROOT, REGISTRY));
  const registry = override || JSON.parse(bytes);
  assert.equal(registry.version, 1);
  assert.equal(registry.id, 'revue-claude-lot2');
  assert.equal(registry.evidenceCommit, EVIDENCE_COMMIT);
  assert.equal(registry.baseSnapshotCommit, BASELINE);
  assert.deepEqual(registry.allowedRules, ['B', 'C', 'D']);
  assert.deepEqual(registry.withdrawnRules, ['A']);
  assert.equal(registry.eventCount, 774);
  assert.equal(registry.correctionCount, 772);
  assert.equal(registry.evidenceFiles.length, 2);
  const approved = new Map();
  for (const file of registry.evidenceFiles) {
    assert.ok(Object.hasOwn(EVIDENCE, file.gitPath), 'named frozen reviewer evidence');
    const raw = fs.readFileSync(path.resolve(ROOT, file.path));
    assert.equal(hash(raw), EVIDENCE[file.gitPath], 'independently pinned evidence bytes');
    assert.equal(file.sha256, EVIDENCE[file.gitPath]);
    const rows = JSON.parse(raw).corrections;
    rows.forEach((row, index) => {
      const id = key(row.pair, row.id);
      if (!approved.has(id)) approved.set(id, []);
      approved.get(id).push({row, index, evidencePath:file.path});
    });
  }
  assert.equal(approved.size, 772);
  assert.equal([...approved.values()].reduce((n, rows) => n + rows.length, 0), 774);
  const entries = new Map();
  for (const correction of registry.corrections) {
    const id = key(correction.pairId, correction.id);
    assert.ok(!entries.has(id), 'one final correction per pair/id');
    const evidence = approved.get(id);
    assert.ok(evidence, 'no unapproved correction identity');
    assert.equal(correction.events.length, evidence.length);
    let previous;
    correction.events.forEach((event, index) => {
      const source = evidence[index];
      assert.equal(event.evidencePath, source.evidencePath);
      assert.equal(event.evidenceIndex, source.index);
      assert.equal(event.rule, source.row.regle);
      assert.equal(event.beforePhon, source.row.avant);
      assert.equal(event.afterPhon, source.row.apres);
      if (previous !== undefined) assert.equal(event.beforePhon, previous, 'B then D chain is continuous');
      previous = event.afterPhon;
    });
    assert.equal(correction.afterPhon, previous);
    assert.equal(correction.rule, evidence.map(source => source.row.regle).join('+'));
    const status = correction.rule.includes('D') ? 'corrected-by-Claude-tj-vers-dj'
      : correction.rule === 'C' ? 'corrected-by-Claude-les-lei' : 'corrected-by-Claude-g-devant-e-i';
    assert.equal(correction.afterReviewStatus, status);
    assert.ok(correction.occurrences.length, 'every approved correction has runtime occurrences');
    entries.set(id, correction);
  }
  assert.equal(entries.size, approved.size);
  const result = {registry, registrySha256:hash(bytes), entries, approved};
  if (!override) loaded = result;
  return result;
}
function annotationFor(entry, before, registrySha256) {
  return {id:entry.id, registryPath:REGISTRY, registrySha256,
    beforePhon:before.phon,
    originalReviewStatusPresent:before.phoneticReviewStatusPresent,
    originalReviewStatus:before.phoneticReviewStatusPresent ? before.phoneticReviewStatus : null,
    evidenceCommit:EVIDENCE_COMMIT, rule:entry.rule};
}
function verifyLot2Phrase(pairId, phrase, expectedBefore) {
  const audit = loadRegistry();
  const entry = audit.entries.get(key(pairId, phrase.id));
  if (!entry) {
    assert.equal(phrase.phoneticCorrection, undefined, 'unlisted phrase has no correction annotation');
    return phrase;
  }
  const before = expectedBefore || entry.occurrences.map(row => row.expectedBefore).find(candidate =>
    candidate.study === phrase.study && candidate.native === phrase.native
    && candidate.phon === phrase.phoneticCorrection?.beforePhon
    && candidate.phoneticReviewStatusPresent === phrase.phoneticCorrection?.originalReviewStatusPresent
    && isDeepStrictEqual(candidate.source, phrase.source));
  assert.ok(before, 'corrected occurrence has an exact original whole source');
  assert.equal(phrase.phon, entry.afterPhon, 'runtime uses approved final whole aid');
  assert.equal(phrase.phoneticReviewStatus, entry.afterReviewStatus);
  assert.deepEqual(phrase.phoneticCorrection, annotationFor(entry, before, audit.registrySha256));
  for (const field of ['study', 'native']) assert.equal(phrase[field], before[field], 'unchanged ' + field);
  assert.equal(Object.hasOwn(phrase, 'reading'), before.readingPresent, 'reading presence unchanged');
  if (before.readingPresent) assert.equal(phrase.reading, before.reading);
  assert.deepEqual(phrase.source, before.source, 'source object is never rewritten');
  return phrase;
}
function verifyPhrase(pairId, phrase, expectedBefore) {
  return verifyLot2Phrase(pairId, lot3Corrections.projectBefore(pairId, phrase), expectedBefore);
}
function projectBefore(pairId, phrase) {
  phrase = lot3Corrections.projectBefore(pairId, phrase);
  verifyLot2Phrase(pairId, phrase);
  if (!phrase.phoneticCorrection) return phrase;
  const original = {...phrase, phon:phrase.phoneticCorrection.beforePhon};
  if (phrase.phoneticCorrection.originalReviewStatusPresent) {
    original.phoneticReviewStatus = phrase.phoneticCorrection.originalReviewStatus;
  } else delete original.phoneticReviewStatus;
  delete original.phoneticCorrection;
  return original;
}
function inputFiles() {
  const {registry} = loadRegistry();
  return [path.join(ROOT, REGISTRY), __filename,
    ...registry.evidenceFiles.map(file => path.resolve(ROOT, file.path)), ...lot3Corrections.inputFiles()];
}
function auditRuntime() {
  const lot3Audit = lot3Corrections.auditRuntime();
  const audit = loadRegistry();
  const manifestPath = 'melunga_deploy/content/niveaux-progressifs/manifest.json';
  const manifest = read(manifestPath);
  const files = new Set(manifest.pairs.flatMap(pair => [pair.repertoirePath,
    ...pair.levels.map(level => level.dataPath)]).map(file => 'melunga_deploy/' + file));
  const actual = new Map([...files].map(file => [file, read(file)]));
  const restored = new Map([...actual].map(([file, value]) => [file,
    lot3Corrections.projectDocument(value.pairId || value.id, value, file.includes('/repertoires/'))]));
  const listedLocations = new Set();
  let occurrences = 0;
  for (const entry of audit.registry.corrections) {
    const beforeEvidence = audit.approved.get(key(entry.pairId, entry.id))[0].row;
    const copies = [];
    for (const occurrence of entry.occurrences) {
      assert.ok(files.has(occurrence.path), 'correction stays inside named runtime files');
      const address = occurrence.path + '\0' + JSON.stringify(occurrence.location);
      assert.ok(!listedLocations.has(address), 'one patch per actual occurrence');
      listedLocations.add(address);
      const phrase = at(actual.get(occurrence.path), occurrence.location);
      const original = at(baseline(occurrence.path), occurrence.location);
      assert.equal(phrase.id, entry.id);
      assert.equal(original.study, beforeEvidence.study);
      assert.equal(original.native, beforeEvidence.native);
      assert.equal(original.phon, beforeEvidence.avant);
      const before = occurrence.expectedBefore;
      assert.equal(before.study, original.study); assert.equal(before.native, original.native);
      assert.equal(before.phon, original.phon);
      assert.equal(before.readingPresent, Object.hasOwn(original, 'reading'));
      if (before.readingPresent) assert.equal(before.reading, original.reading);
      assert.deepEqual(before.source, original.source);
      assert.equal(before.phoneticReviewStatusPresent, Object.hasOwn(original, 'phoneticReviewStatus'));
      if (before.phoneticReviewStatusPresent) assert.equal(before.phoneticReviewStatus, original.phoneticReviewStatus);
      verifyPhrase(entry.pairId, phrase, before);
      const reverted = projectBefore(entry.pairId, phrase);
      assert.deepEqual(reverted, original, 'the complete card, level, rights, reading and provenance are conserved');
      const parent = at(restored.get(occurrence.path), occurrence.location.slice(0, -1));
      parent[occurrence.location.at(-1)] = reverted;
      copies.push(phrase); occurrences++;
    }
    for (const copy of copies) for (const field of fields) {
      assert.equal(copy[field], copies[0][field], 'canonical/transport agreement for corrected ' + entry.id + ':' + field);
    }
  }
  for (const [file, document] of restored) assert.deepEqual(document, baseline(file),
    'no other change to runtime content, placements, sequences, grants or readings: ' + file);
  function scan(value, location, filename) {
    if (!value || typeof value !== 'object') return;
    if (Object.hasOwn(value, 'phoneticCorrection')) {
      assert.ok(listedLocations.has(filename + '\0' + JSON.stringify(location)), 'no unregistered annotated occurrence');
    }
    for (const [name, child] of Object.entries(value)) scan(child, location.concat(Array.isArray(value) ? Number(name) : name), filename);
  }
  for (const [file, document] of actual) scan(document, [], file);
  const expectedManifest = clone(baseline(manifestPath));
  expectedManifest.phoneticCorrections = {registryPath:REGISTRY, registrySha256:audit.registrySha256,
    correctionCount:772, eventCount:774, evidenceCommit:EVIDENCE_COMMIT};
  expectedManifest.reviewedFieldCorrections = lot3Corrections.declaration();
  Object.assign(expectedManifest, lot4Corrections.manifestDeclarations());
  for (const pair of expectedManifest.pairs) pair.repertoireSha256 = hash(fs.readFileSync(path.join(WEB, pair.repertoirePath)));
  assert.deepEqual(manifest, expectedManifest, 'manifest changes only overlay proof and real transport hashes');
  const legacy = 'melunga_deploy/content/maquette-guidee.json';
  assert.deepEqual(read(legacy), baseline(legacy), 'legacy v1 source remains untouched');
  assert.equal(fs.readFileSync(path.join(WEB, 'app.html'), 'utf8'),
    execFileSync('git', ['show', BASELINE + ':melunga_deploy/app.html'], {cwd:ROOT, encoding:'utf8', maxBuffer:32 * 1024 * 1024}),
    'classic source and existing rights code remain byte-for-byte unchanged');
  return {correctionCount:772, eventCount:774, occurrences, files:files.size, lot3:lot3Audit};
}
module.exports = {loadRegistry, verifyPhrase, projectBefore, auditRuntime, inputFiles};

if (require.main === module) {
  const {test, before, after} = require('node:test');
  const http = require('node:http');
  const {chromium} = require('playwright-core');
  let server, browser, base;
  const errors = [], requests = [];
  before(async () => {
    server = http.createServer((req, res) => {
      const file = path.resolve(WEB, '.' + new URL(req.url, 'http://local').pathname);
      if (!file.startsWith(WEB + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return res.writeHead(404).end();
      res.setHeader('Content-Type', ({'.html':'text/html', '.js':'text/javascript', '.json':'application/json', '.css':'text/css'})[path.extname(file)] || 'application/octet-stream');
      fs.createReadStream(file).pipe(res);
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    base = 'http://127.0.0.1:' + server.address().port;
    browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium', args:['--no-sandbox']});
  });
  after(async () => {
    await browser?.close(); if (server) await new Promise(resolve => server.close(resolve));
    assert.deepEqual(errors, []); assert.deepEqual(requests, [], 'no external or account/API operation');
  });
  test('774 reviewer events compose into 772 exact corrections with all non-phonetic fields and transports conserved', () => {
    assert.equal(auditRuntime().correctionCount, 772);
    const {entries} = loadRegistry();
    assert.equal(entries.get(key('fr-zh', 'catalogue:zh:175')).afterPhon, 'djyao gueï ouo ba');
    assert.equal(entries.get(key('fr-zh', 'catalogue:zh:1032')).afterPhon, 'ouo-meunn chang gueu ué bann-djya leu');
  });
  test('unapproved rule, changed after-aid, broken chained event and wrong evidence hash are rejected', () => {
    const registry = loadRegistry().registry;
    for (const mutate of [
      value => { value.corrections[0].rule = 'A'; },
      value => { value.corrections[0].afterPhon += ' bad'; },
      value => { value.corrections.find(row => row.rule === 'B+D').events[1].beforePhon = 'broken'; },
      value => { value.evidenceFiles[0].sha256 = '0'.repeat(64); }
    ]) { const bad = clone(registry); mutate(bad); assert.throws(() => loadRegistry(bad)); }
    const entry = registry.corrections[0], occurrence = entry.occurrences[0];
    const good = at(read(occurrence.path), occurrence.location);
    for (const mutate of [
      value => { value.phon = occurrence.expectedBefore.phon; },
      value => { value.phoneticCorrection.registrySha256 = '0'.repeat(64); },
      value => { value.reading = 'changed'; },
      value => { value.source.sourceIndex = -1; }
    ]) { const bad = clone(good); mutate(bad); assert.throws(() => verifyPhrase(entry.pairId, bad, occurrence.expectedBefore)); }
  });
  function fixture(pairId, id, later = false) {
    const metadata = read('melunga_deploy/content/niveaux-progressifs/manifest.json').pairs.find(row => row.id === pairId);
    for (const level of metadata.levels) {
      const data = read('melunga_deploy/' + level.dataPath);
      for (const [themeIndex, theme] of data.themes.entries()) {
        const index = theme.sequences.flatMap(row => row.steps).findIndex(step => step.utterance === id && step.kind === 'understand');
        if (index >= 0 && (!!(theme.reviewReferences || []).some(row => row.id === id)
          || !!(theme.contextReferences || []).some(row => row.id === id)) === later) {
          return {pairId, level:level.level, themeIndex, stepIndex:index, id};
        }
      }
    }
    throw new Error('Missing real fixture ' + pairId + '/' + id + '/later=' + later);
  }
  async function openPage() {
    const context = await browser.newContext({viewport:{width:390,height:844}, isMobile:true, hasTouch:true, reducedMotion:'reduce'});
    await context.addInitScript(() => {
      window.__phoneticSpeech = [];
      window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text; } };
      Object.defineProperty(window, 'speechSynthesis', {value:{cancel(){}, getVoices(){return [];}, addEventListener(){},
        speak(item){window.__phoneticSpeech.push({text:item.text,lang:item.lang});item.onend?.();}}});
    });
    await context.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.origin !== base || /\/(?:\.netlify|api)\//.test(url.pathname)) {
        requests.push(url.origin + url.pathname); await route.abort();
      } else await route.continue();
    });
    const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message));
    return {context,page};
  }
  async function enter(page, target) {
    await page.goto(base + '/parcours-niveaux.html?pair=' + target.pairId + '&level=' + target.level);
    await page.waitForFunction(target => window.MelungaMockup?.state().screen === 'themes'
      && window.MelungaMockup.state().pairId === target.pairId && window.MelungaMockup.state().level === target.level, target);
    await page.locator('#mgThemeGrid > button').nth(target.themeIndex).click();
    await page.evaluate(target => {
      while (window.MelungaMockup.state().stepIndex < target.stepIndex) {
        document.querySelector('#mgChoices:not([hidden]) button')?.click();
        const button = document.getElementById('mgContinue');
        if (button.disabled) throw new Error('Unexpected blocked source fixture'); button.click();
      }
    }, target);
    assert.equal(await page.evaluate(() => window.MelungaMockup.state().phraseId), target.id);
  }
  async function checkDomAndSpeech(page, pairId, id) {
    const entry = loadRegistry().entries.get(key(pairId,id));
    const source = entry.occurrences[0].expectedBefore;
    assert.equal(await page.locator('#mgPhrase').textContent(), source.study);
    assert.equal(await page.locator('#mgPhon').textContent(), entry.afterPhon);
    assert.equal(await page.locator('#mgTranslation').textContent(), source.native);
    assert.equal(await page.locator('#mgReading').textContent(), source.readingPresent ? source.reading : '');
    await page.click('#mgEar');
    const spoken = await page.evaluate(() => window.__phoneticSpeech.at(-1));
    assert.equal(spoken.text, source.study, 'TTS receives the whole studied phrase, never the phonetic help');
    assert.equal(spoken.lang.split('-')[0], pairId.split('-')[1]);
  }
  test('我要那个 uses the corrected gueu at first encounter and later contextual reuse; djinn keeps original Pinyin and spoken study', async () => {
    const {context,page} = await openPage();
    try {
      for (const later of [false,true]) {
        await enter(page, fixture('fr-zh','catalogue:zh:221',later));
        await checkDomAndSpeech(page,'fr-zh','catalogue:zh:221');
        assert.equal(await page.locator('#mgPhon').textContent(),'ouo yao na gueu');
      }
      await enter(page, fixture('fr-zh','catalogue:zh:4821'));
      await checkDomAndSpeech(page,'fr-zh','catalogue:zh:4821');
      assert.equal(await page.locator('#mgPhon').textContent(),'djinn-tyenn tyenn-tchi heunn hao');
      if (!await page.locator('#mgReadingToggle').isVisible()) await page.click('#mgHelp');
      await page.click('#mgReadingToggle');
      assert.equal(await page.locator('#mgPhon').textContent(),'jīntiān tiānqì hěn hǎo');
      if (await page.locator('#mgHelpPanel').isVisible()) await page.click('#mgHelp');
      await page.click('#mgEar');
      assert.equal(await page.evaluate(() => window.__phoneticSpeech.at(-1).text), '今天天气很好。', 'Pinyin display never becomes TTS input');
      if (!await page.locator('#mgReadingToggle').isVisible()) await page.click('#mgHelp');
      await page.click('#mgReadingToggle');
      assert.equal(await page.locator('#mgPhon').textContent(),'djinn-tyenn tyenn-tchi heunn hao');
    } finally { await context.close(); }
  });
  test('all 17 les→雷 corrections are rendered verbatim and speak unchanged French study text', async () => {
    const {context,page} = await openPage();
    try {
      const entries = loadRegistry().registry.corrections.filter(row => row.rule === 'C');
      assert.equal(entries.length,17);
      for (const row of entries) {
        await enter(page, fixture(row.pairId,row.id));
        await checkDomAndSpeech(page,row.pairId,row.id);
      }
    } finally { await context.close(); }
  });
}
