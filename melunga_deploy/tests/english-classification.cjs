/* Independent checks of the frozen English classification ledger.
 * No generator/producer is imported. Historical source checks may use a private
 * before-view only after the actual classified pack has been validated. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');
const {isDeepStrictEqual} = require('node:util');
const ROOT = path.resolve(__dirname, '..', '..');
const WEB = path.join(ROOT, 'melunga_deploy');
const BASE = '13f42b5814f2b230d76d2d0ef267dcf406c523c2';
const COMMIT = '1bf76c72f58e2ffe37e27d2b137a1ebe350e097f';
const SOURCE = 'docs/revue-integrale/classement-fr-en/registre-classement.json';
const REGISTRY = 'docs/niveaux-progressifs/classement-fr-en/registre/registre-classement.json';
const REGISTRY_SHA = 'a605a44eb886e598014dab0ed4b1000c819060ad4dcf83f939fd70c9a4dc020a';
const PREFIX = 'melunga_deploy/content/niveaux-progressifs/';
const INDEPENDENT_CHECKER_SHA256 = 'd4def65530776f9accaba85e7073cf8e03b6f98ced792ff78506ab9786049ea6';
const PAIR = 'fr-en';
const clone = value => JSON.parse(JSON.stringify(value));
const sha256 = raw => crypto.createHash('sha256').update(raw).digest('hex');
function canonical(value) {return Array.isArray(value) ? '[' + value.map(canonical).join(',') + ']' : value && typeof value === 'object' ? '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + canonical(value[k])).join(',') + '}' : JSON.stringify(value);}
const at = (node, location) => location.reduce((value, part) => value[part], node);
const rawRead = filename => JSON.parse(fs.readFileSync(path.join(ROOT, filename), 'utf8'));
const baseCache = new Map(), baseBytesCache = new Map();
function baselineBytes(filename) {if (!baseBytesCache.has(filename)) baseBytesCache.set(filename,execFileSync('git',['show',BASE+':'+filename],{cwd:ROOT,maxBuffer:32*1024*1024}));return baseBytesCache.get(filename);}
function baseline(filename) {
  if (!baseCache.has(filename)) baseCache.set(filename, JSON.parse(execFileSync('git', ['show', BASE + ':' + filename], {cwd: ROOT, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024})));
  return baseCache.get(filename);
}
let sourceCache;
function loadLedger(override) {
  if (!override && sourceCache) return sourceCache;
  const pinned = execFileSync('git', ['show', COMMIT + ':' + SOURCE], {cwd: ROOT, maxBuffer: 32 * 1024 * 1024});
  assert.equal(sha256(pinned), REGISTRY_SHA, 'independently pinned reviewer ledger');
  const local = fs.readFileSync(path.join(ROOT, REGISTRY));
  assert.ok(local.equals(pinned), 'durable registry is the exact reviewer Git object');
  const ledger = override || JSON.parse(local);
  assert.equal(ledger.id, 'tri-themes-claude-fr-en');
  assert.equal(ledger.pair, PAIR);
  assert.equal(ledger.baseSnapshotCommit, BASE);
  assert.deepEqual(ledger.counts, {cards: 670, move: 610, 'to-reserve': 37, keep: 23, levelChanges: 127, intoNewThemes: 9});
  assert.deepEqual(ledger.newThemes, [
    {id: 'L3-sante', level: 3, title: 'Santé : demander une aide médicale'},
    {id: 'L5-cuisine-recette', level: 5, title: 'Cuisine : suivre une recette'},
    {id: 'L9-telephone', level: 9, title: 'Téléphone : accueillir, filtrer et faire patienter'}
  ]);
  assert.deepEqual(ledger.renameThemes, [{id: 'L9-saluer', level: 9, newTitle: 'Remercier et s’excuser en registre soutenu'}]);
  assert.equal(ledger.ops.length, 670);
  const ops = new Map(), counts = {move: 0, 'to-reserve': 0, keep: 0};
  const originalById = new Map(), originalThemes = new Map();
  for (let level = 1; level <= 10; level++) {
    const filename = PREFIX + PAIR + '/L' + level + '.json';
    const cell = baseline(filename);
    for (const theme of [...cell.themes, ...(cell.heldThemes || [])]) {
      originalThemes.set(level + ':' + theme.id, theme);
      for (const phrase of theme.phrases) {assert.ok(!originalById.has(phrase.id)); originalById.set(phrase.id, {phrase, level, themeId: theme.id, reserved: false});}
    }
    for (const phrase of cell.reserve || []) {assert.ok(!originalById.has(phrase.id)); originalById.set(phrase.id, {phrase, level, themeId: null, reserved: true});}
  }
  let changedLevel = 0, intoNew = 0;
  for (const op of ledger.ops) {
    assert.ok(!ops.has(op.id), 'one final operation per source card');
    assert.ok(Object.hasOwn(counts, op.op)); counts[op.op]++;
    const e = op.expectedBefore;
    assert.equal(e.path, PREFIX + PAIR + '/L' + op.fromLevel + '.json');
    assert.equal(e.level, op.fromLevel); assert.equal(e.theme, op.fromTheme); assert.equal(e.study, op.study);
    const cell = baseline(e.path), phrase = at(cell, e.location);
    if (e.location[0] === 'reserve') {assert.equal(op.op, 'keep'); assert.equal(op.fromTheme, 'reserve'); assert.equal(e.location.length, 2);}
    else {assert.equal(e.location[0], 'themes'); assert.equal(e.location[2], 'phrases'); assert.equal(cell.themes[e.location[1]].id, op.fromTheme);}
    assert.equal(phrase.id, op.id); assert.equal(phrase.study, op.study);
    assert.equal(phrase.editorialLevel, op.fromLevel); assert.ok(Array.isArray(op.proposals) && op.proposals.length);
    if (op.op === 'move') {
      assert.ok(Number.isInteger(op.toLevel) && op.toLevel >= 1 && op.toLevel <= 10);
      assert.equal(typeof op.toTheme, 'string');
      assert.ok(originalThemes.has(op.toLevel + ':' + op.toTheme) || ledger.newThemes.some(t => t.id === op.toTheme && t.level === op.toLevel), 'reviewed destination exists or is explicitly created');
      assert.ok(op.fromLevel !== op.toLevel || op.fromTheme !== op.toTheme, 'move actually changes routing');
      changedLevel += Number(op.fromLevel !== op.toLevel);
      intoNew += Number(ledger.newThemes.some(t => t.id === op.toTheme));
    } else if (op.op === 'keep') {
      assert.ok(op.toLevel === undefined || op.toLevel === op.fromLevel);
      assert.ok(op.toTheme === undefined || op.toTheme === op.fromTheme);
    } else {
      assert.ok(!Object.hasOwn(op, 'toTheme') || op.toTheme === null);
      assert.equal(typeof (op.reason || op.motif), 'string');
    }
    ops.set(op.id, op);
  }
  assert.deepEqual(counts, {move: 610, 'to-reserve': 37, keep: 23});
  assert.equal(changedLevel, 127); assert.equal(intoNew, 9);
  assert.equal(originalById.size, 4704);
  const result = {ledger, ops, originalById, originalThemes, registrySha256: sha256(local)};
  if (!override) sourceCache = result;
  return result;
}
function actualPack() {
  const m = baseline(PREFIX + 'manifest.json');
  return Object.fromEntries([PREFIX + 'manifest.json', ...m.pairs.flatMap(pair => [pair.repertoirePath, ...pair.levels.map(level => level.dataPath)]).map(p => 'melunga_deploy/' + p)].map(p => [p, rawRead(p)]));
}
function canonicalIndex(pack) {
  const entries = new Map();
  for (let level = 1; level <= 10; level++) {
    const filename = PREFIX + PAIR + '/L' + level + '.json', cell = pack[filename]; assert.ok(cell);
    for (const theme of [...cell.themes, ...(cell.heldThemes || [])]) for (const phrase of theme.phrases) {
      assert.ok(!entries.has(phrase.id), 'no source duplicated across classified themes/levels');
      entries.set(phrase.id, {phrase, level, themeId: theme.id, reserved: false, filename});
    }
    for (const phrase of cell.reserve || []) {
      assert.ok(!entries.has(phrase.id), 'reserve never duplicates an active source');
      entries.set(phrase.id, {phrase, level, themeId: null, reserved: true, filename});
    }
  }
  return entries;
}
function expectedPhrase(original, op, theme) {
  const result = clone(original);
  if (!op || op.op === 'keep') return result;
  const reserved = op.op === 'to-reserve';
  const level = reserved ? op.fromLevel : op.toLevel;
  const themeId = reserved ? null : op.toTheme;
  result.editorialLevel = level;
  Object.assign(result.placement, reserved ? {domain: 'reserve', section: 'reserve', themeId: null}
    : {domain: theme.domain, section: theme.section, themeId});
  result.englishClassification = {registrySha256: REGISTRY_SHA, operation: op.op,
    fromLevel: op.fromLevel, fromTheme: op.fromTheme, toLevel: level, toTheme: themeId};
  return result;
}
function assertOwnClassification(pack) {
  const audit = loadLedger(), manifest = pack[PREFIX + 'manifest.json'];
  assert.ok(manifest && manifest.englishClassification, 'classified pack has a source-bound declaration');
  const declaration = manifest.englishClassification;
  assert.equal(declaration.registryPath, REGISTRY);
  assert.equal(declaration.registrySha256, REGISTRY_SHA);
  assert.equal(declaration.evidenceCommit, COMMIT);
  assert.equal(declaration.baseSnapshotCommit, BASE);
  assert.deepEqual(declaration.counts, audit.ledger.counts);
  assert.deepEqual(declaration.reserveIds, audit.ledger.ops.filter(op => op.op === 'to-reserve').map(op => op.id));
  assert.deepEqual(declaration.newThemes, audit.ledger.newThemes);
  assert.deepEqual(declaration.renamedThemes, audit.ledger.renameThemes);
  assert.equal(declaration.operations.length, 670);
  const entries = canonicalIndex(pack), currentThemes = new Map();
  for (let level = 1; level <= 10; level++) for (const theme of pack[PREFIX + PAIR + '/L' + level + '.json'].themes) currentThemes.set(level + ':' + theme.id, theme);
  assert.equal(entries.size, 4704, 'no English source card deleted or created');
  const reservedIds = new Set(audit.ledger.ops.filter(op => op.op === 'to-reserve').map(op => op.id));
  for (const [id, original] of audit.originalById) {
    const current = entries.get(id), op = audit.ops.get(id); assert.ok(current, 'all original IDs survive');
    const reserved = op?.op === 'to-reserve' || original.reserved && op?.op !== 'move';
    const level = op?.op === 'move' ? op.toLevel : original.level;
    const themeId = reserved ? null : op?.op === 'move' ? op.toTheme : original.themeId;
    assert.equal(current.level, level, 'exact reviewed level for ' + id);
    assert.equal(current.themeId, themeId, 'exact reviewed theme for ' + id);
    assert.equal(current.reserved, reserved, 'exact reviewed partition for ' + id);
    const target = !reserved ? currentThemes.get(level + ':' + themeId) : null;
    assert.deepEqual(current.phrase, expectedPhrase(original.phrase, op, target), 'complete phrase/source/phonetics/prior annotations conserved for ' + id);
  }
  for (const op of audit.ledger.ops) {
    const current = entries.get(op.id);
    const metadata = declaration.operations.find(row => row.id === op.id);
    assert.ok(metadata); assert.equal(metadata.op, op.op); assert.equal(metadata.fromLevel, op.fromLevel); assert.equal(metadata.fromTheme, op.fromTheme);
    assert.equal(metadata.toLevel, op.op === 'move' ? op.toLevel : op.fromLevel);
    assert.equal(metadata.toTheme, op.op === 'to-reserve' ? null : op.op === 'move' ? op.toTheme : op.fromTheme);
    assert.equal(metadata.contentType, current.phrase.contentType);
  }
  for (const t of audit.ledger.newThemes) {
    const theme = currentThemes.get(t.level + ':' + t.id); assert.ok(theme, 'new theme visible');
    assert.equal(theme.title, t.title); assert.equal(theme.visualId, t.id);
    const expected = audit.ledger.ops.filter(op => op.op === 'move' && op.toLevel === t.level && op.toTheme === t.id).map(op => op.id);
    assert.equal(expected.length, 3);
    assert.deepEqual(theme.phrases.map(p => p.id), expected, 'three genuinely reviewed cards, no density padding');
    assert.equal(theme.presentedCount, 3); assert.equal(theme.pedagogicalConceptCount, 3);
    assert.ok(declaration.smallThemeExceptions.some(e => e.id === t.id && e.level === t.level && e.presentedCount === 3 && e.minimum === 3), 'reviewed three-card exception is explicit and bounded');
  }
  for (const t of audit.ledger.renameThemes) assert.equal(currentThemes.get(t.level + ':' + t.id).title, t.newTitle);
  let active = 0, reserve = 0, steps = 0;
  for (let level = 1; level <= 10; level++) {
    const cell = pack[PREFIX + PAIR + '/L' + level + '.json'];
    const primaries = [...cell.themes, ...(cell.heldThemes || [])].flatMap(t => t.phrases);
    active += primaries.length; reserve += cell.reserve.length;
    assert.equal(cell.totalPhrases, primaries.length); assert.equal(cell.totalCanonicalPhrases, primaries.length + cell.reserve.length);
    assert.equal(cell.reservedPhrases, cell.reserve.length);
    for (const type of ['utterance', 'vocabulary', 'number', 'incomplete', 'review']) assert.equal(cell.counts[type], [...primaries, ...cell.reserve].filter(p => p.contentType === type).length);
    for (const theme of cell.themes) {
      const shown = theme.sequences.flatMap(s => s.phraseIds);
      assert.equal(new Set(shown).size, shown.length, 'one presentation per source within theme');
      assert.equal(theme.newCount, theme.phrases.length);
      assert.equal(theme.presentedCount, theme.phrases.length + (theme.reviewReferences || []).length + (theme.contextReferences || []).length);
      for (const id of shown) assert.ok(!reservedIds.has(id), 'reserved duplicate is not a presented exercise');
      const prepared = new Map();
      for (const sequence of theme.sequences) {
        for (const id of sequence.preparationIds || []) assert.ok(!reservedIds.has(id), 'reserved duplicate is not a lexical/preparation source');
        for (const step of sequence.steps) {
          steps++;
          if (step.kind === 'receive') {assert.equal(step.requiresProduction, false); assert.equal(step.countsForProgress, false); continue;}
          for (const id of [step.utterance, ...(step.choices || [])].filter(Boolean)) assert.ok(!reservedIds.has(id), 'reserve never returns as learner production');
          if (step.kind === 'understand' || step.kind === 'imitate') {if (!prepared.has(step.utterance)) prepared.set(step.utterance, {}); prepared.get(step.utterance)[step.kind] = step.id;}
          if (['choose-and-recall', 'recall', 'reply-without-model'].includes(step.kind)) {
            assert.equal(step.preparedInSteps.understoodInStep, prepared.get(step.utterance)?.understand);
            assert.equal(step.preparedInSteps.imitatedInStep, prepared.get(step.utterance)?.imitate);
          }
        }
      }
    }
  }
  assert.equal(active + reserve, 4704); assert.equal(reserve, 162); assert.equal(active, 4542);
  for (const pair of manifest.pairs) if (pair.id !== PAIR) for (const filename of [pair.repertoirePath, ...pair.levels.map(l => l.dataPath)].map(p => 'melunga_deploy/' + p)) assert.deepEqual(pack[filename], baseline(filename), 'other six pairs unchanged');
  return {operations: 670, moves: 610, levelChanges: 127, toReserve: 37, keep: 23,
    canonical: entries.size, active, reserve, newThemes: 3, renamedThemes: 1, preservedStudyPhoneticAndSourceFields: true, stepsChecked: steps};
}
let projectedCache;
function ensureProjection() {
  if (projectedCache) return projectedCache;
  const actual = actualPack(), audit = assertOwnClassification(actual);
  const program = path.join(ROOT, 'tools/maquette-guidee/check_english_classification_independent.py');
  assert.equal(sha256(fs.readFileSync(program)), INDEPENDENT_CHECKER_SHA256, 'the independently reviewed projection validator is frozen');
  const result = JSON.parse(execFileSync('python3', ['-B', program, '--root', ROOT, '--project-runtime'], {cwd: ROOT, encoding: 'utf8', maxBuffer: 96 * 1024 * 1024}));
  assert.ok(result.documents && result.summary, 'independent projection validates the actual pack before returning any before-view');
  for (const [filename, document] of Object.entries(actual)) {assert.deepEqual(result.documents[filename], baseline(filename), 'private inverse restores every whole original document'); assert.equal(result.actualRawDocumentSha256[filename], sha256(fs.readFileSync(path.join(ROOT, filename))), 'independent subprocess validated the same actual raw bytes');}
  const fingerprints = Object.fromEntries(Object.keys(actual).map(filename => [filename, sha256(fs.readFileSync(path.join(ROOT, filename)))]));
  projectedCache = {actual, documents: result.documents, summary: {...audit, independent: result.summary}, fingerprints, canonical: canonicalIndex(actual), originalById: loadLedger().originalById};
  return projectedCache;
}
function relativeFilename(filename) {
  const relative = path.isAbsolute(filename) ? path.relative(ROOT, filename) : filename;
  return relative.split(path.sep).join('/');
}
function beforeRead(filename, document) {
  filename = relativeFilename(filename);
  if (!filename.startsWith(PREFIX)) return typeof document === 'string' || Buffer.isBuffer(document) ? JSON.parse(document) : document;
  const state = ensureProjection();
  assert.ok(Object.hasOwn(state.documents, filename), 'only known runtime documents are projected');
  assert.equal(sha256(fs.readFileSync(path.join(ROOT, filename))), state.fingerprints[filename], 'runtime file changed after actual classification validation');
  if (typeof document === 'string' || Buffer.isBuffer(document)) assert.equal(sha256(document), state.fingerprints[filename], 'raw bytes were actually validated before the before-view');
  else assert.deepEqual(document, state.actual[filename], 'an unvalidated mutated argument cannot be hidden by a baseline read');
  return clone(state.documents[filename]);
}
function beforeBytes(filename) {
  filename = relativeFilename(filename);
  if (!filename.startsWith(PREFIX)) return fs.readFileSync(path.join(ROOT, filename));
  const state = ensureProjection();
  assert.equal(sha256(fs.readFileSync(path.join(ROOT, filename))), state.fingerprints[filename], 'actual fingerprint before historical byte comparison');
  return baselineBytes(filename);
}
function inputFiles() {
  return [__filename, path.join(ROOT, REGISTRY), path.join(ROOT, 'tools/maquette-guidee/check_english_classification_independent.py'),
    ...Object.keys(actualPack()).map(filename => path.join(ROOT, filename))];
}
function auditRuntime() {return ensureProjection().summary;}
module.exports = {loadLedger, baseline, rawRead, actualPack, canonicalIndex, expectedPhrase, assertOwnClassification,
  beforeRead, beforeBytes, inputFiles, auditRuntime};

function projectPhrase(pair, phrase) {
  if (pair !== PAIR || !phrase || !phrase.id) return phrase;
  const state = ensureProjection();
  const current = state.canonical.get(phrase.id);
  const old = state.originalById.get(phrase.id);
  const bankPath = PREFIX + 'repertoires/' + PAIR + '.json';
  const candidates = [];
  if (current && old) candidates.push([current.phrase, old.phrase]);
  for (const category of ['phrases', 'receivedModels']) {
    const a = state.actual[bankPath][category].find(p => p.id === phrase.id);
    const b = state.documents[bankPath][category].find(p => p.id === phrase.id);
    if (a && b) candidates.push([a, b]);
  }
  for (const [actual, before] of candidates) {
    if (isDeepStrictEqual(phrase, actual) || isDeepStrictEqual(phrase, before)) return clone(before);
  }
  throw new Error('Unvalidated classified phrase cannot be hidden by historical projection: ' + phrase.id);
}
// Filled once the intentional runtime-guard/cache-migration edit is gelled.
// This pins the entire new script; it never accepts an arbitrary UI difference.
const CLASSIFIED_JS_SHA256 = '2b0cd51838305173f8cfa4bdc2b9c3cc9deaa465cea42160002c4b274c320308';
const CLASSIFIED_HTML_SHA256 = {'melunga_deploy/maquette-guidee.html':'3194000b91aff53bdfdc5194c07d990e9eb238e9afbbe88d4082a5c545fab81d','melunga_deploy/parcours-niveaux.html':'b1915c438e64847341fd036252319bbd5bb0aadd3abcac49b74b9d4af4e5080b'};
function beforeAssetBytes(filename) {
  filename = relativeFilename(filename);
  const actual = fs.readFileSync(path.join(ROOT, filename));
  const eligible = ['melunga_deploy/maquette-guidee.js', 'melunga_deploy/parcours-niveaux.html', 'melunga_deploy/maquette-guidee.html'];
  if (!eligible.includes(filename)) return actual;
  const before = baselineBytes(filename);
  if (filename.endsWith('.js')) assert.equal(sha256(actual), CLASSIFIED_JS_SHA256, 'entire reviewed classification UI guard/cache change is frozen');
  else {
    const text = before.toString('utf8'); assert.equal(text.split('maquette-guidee.js?v=12').length, 2);
    assert.equal(actual.toString('utf8'), text.replace('maquette-guidee.js?v=12', 'maquette-guidee.js?v=13'), 'only intentional script cache version changes in HTML');
    assert.equal(sha256(actual), CLASSIFIED_HTML_SHA256[filename], 'whole HTML cache change pinned independently');
  }
  return before;
}
module.exports.projectPhrase = projectPhrase;
module.exports.beforeAssetBytes = beforeAssetBytes;

if (require.main === module) {
  const {test, before, after} = require('node:test');
  const http = require('node:http');
  const {chromium} = require('playwright-core');
  let server, browser, base;
  const report = {status: 'running', scope: 'local classified English runtime and emulated Chromium',
    publicSiteChecked: false, physicalDeviceChecked: false, nativeOrPedagogicalValidation: false,
    speechMechanism: 'mock speechSynthesis; whole source text only', checks: [], cases: [],
    errors: [], externalRequests: [], apiRequests: [], negativeCasesRejected: 0};
  let snapshots;
  const fingerprint = () => Object.fromEntries([...new Set([...inputFiles(),
    ...['maquette-guidee.js','maquette-guidee.css','parcours-niveaux.html','maquette-guidee.html','app.html'].map(p=>path.join(WEB,p)),
    path.join(ROOT,'docs/niveaux-progressifs/classement-fr-en/visuels.json')])].sort().map(p=>[path.relative(ROOT,p),sha256(fs.readFileSync(p))]));
  before(async () => {
    snapshots = fingerprint(); report.inputSha256 = snapshots;
    report.classification = auditRuntime();
    server = http.createServer((req,res)=>{
      const filename=path.resolve(WEB,'.'+new URL(req.url,'http://local').pathname);
      if(!filename.startsWith(WEB+path.sep)||!fs.existsSync(filename)||!fs.statSync(filename).isFile()) return res.writeHead(404).end();
      res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml'})[path.extname(filename)]||'application/octet-stream');
      fs.createReadStream(filename).pipe(res);
    });
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve)); base='http://127.0.0.1:'+server.address().port;
    browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
  });
  after(async () => {
    await browser?.close(); if(server) await new Promise(resolve=>server.close(resolve));
    report.inputSha256Stable = isDeepStrictEqual(fingerprint(), snapshots);
    const required=['all-670-whole-identity-and-placement','classification-tamper-rejection','new-theme-photos-and-nine-cards','cross-level-and-received-role','saved-review-migration-and-reserve','saved-review-migration-race','runtime-policy-and-body-integrity','new-cards-fit-mobile-and-desktop'];
    report.missingChecks=required.filter(name=>!report.checks.includes(name));
    report.executedAt=new Date().toISOString(); report.status=report.inputSha256Stable&&!report.missingChecks.length&&!report.errors.length&&!report.externalRequests.length&&!report.apiRequests.length?'passed':'failed';
    if(process.env.ENGLISH_CLASSIFICATION_REPORT) fs.writeFileSync(process.env.ENGLISH_CLASSIFICATION_REPORT,JSON.stringify(report,null,2)+'\n');
    assert.equal(report.inputSha256Stable,true,'all actual classified inputs remain frozen during tests');
    assert.deepEqual(report.errors,[]); assert.deepEqual(report.externalRequests,[]); assert.deepEqual(report.apiRequests,[]);
    assert.deepEqual(report.missingChecks,[],'all eight declared checks actually completed');
  });
  async function pageFixture(viewport={width:390,height:844},options={}) {
    const context=await browser.newContext({viewport,isMobile:viewport.width<=760,hasTouch:viewport.width<=760,reducedMotion:'reduce'});
    await context.addInitScript(entries=>{
      window.__classificationSpeech=[];
      window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};
      Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},getVoices(){return[];},addEventListener(){},speak(u){window.__classificationSpeech.push({text:u.text,lang:u.lang});u.onend?.();}}});
      if(entries) localStorage.setItem('melunga-guided-review-v1',JSON.stringify({version:1,entries}));
    },options.savedEntries||null);
    await context.route('**/*',async route=>{
      const url=new URL(route.request().url());
      if(url.origin!==base){report.externalRequests.push(url.origin+url.pathname);await route.abort();return;}
      if(/\/(?:\.netlify|api)\//.test(url.pathname)){report.apiRequests.push(url.pathname);await route.abort();return;}
      if(options.intercept&&await options.intercept(route,url))return;
      await route.continue();
    });
    const page=await context.newPage(); page.on('pageerror',e=>report.errors.push(e.message));
    return{context,page};
  }
  async function ready(page,pair,level) {
    await page.waitForFunction(({pair,level})=>{const s=window.MelungaMockup?.state();return s?.screen==='themes'&&s.pairId===pair&&s.level===level;},{pair,level});
  }
  async function visit(page,level,pair=PAIR) {
    await page.goto(base+'/parcours-niveaux.html?pair='+pair+'&level='+level); await ready(page,pair,level);
  }
  function locate(id,received=false) {
    const data=ensureProjection().actual;
    for(let level=1;level<=10;level++){
      const cell=data[PREFIX+PAIR+'/L'+level+'.json'];
      for(const[themeIndex,theme]of cell.themes.entries()){
        const steps=theme.sequences.flatMap(s=>s.steps),stepIndex=steps.findIndex(s=>s.utterance===id&&s.kind===(received?'receive':'understand'));
        if(stepIndex>=0){const phrase=received?data[PREFIX+'repertoires/'+PAIR+'.json'].receivedModels.find(p=>p.id===id):canonicalIndex(data).get(id)?.phrase;
          return{id,level,themeIndex,theme,steps,stepIndex,phrase};}
      }
    } throw new Error('No active classified fixture '+id);
  }
  async function enter(page,target) {
    await visit(page,target.level); await page.locator('#mgThemeGrid > button').nth(target.themeIndex).click();
    await page.evaluate(count=>{for(let n=0;n<count;n++)document.getElementById('mgContinue').click();},target.stepIndex);
    assert.equal(await page.evaluate(()=>window.MelungaMockup.state().phraseId),target.id);
  }
  async function checkDom(page,target) {
    for(const[selector,field]of [['#mgPhrase','study'],['#mgPhon','phon'],['#mgTranslation','native'],['#mgReading','reading']]) assert.equal(await page.locator(selector).textContent(),target.phrase[field]||'','whole source '+field);
    await page.click('#mgEar');const spoken=await page.evaluate(()=>window.__classificationSpeech.at(-1));assert.equal(spoken.text,target.phrase.study);assert.equal(spoken.lang.split('-')[0],'en');
  }
  async function savedPanel(page) {await page.click('#mgMenuTrigger');await page.locator('[data-menu-item="À revoir"]').click();assert.equal(await page.locator('#mgSavedReviewPanel').isVisible(),true);}
  const cachedEntry=op=>({id:op.id,pairId:PAIR,level:op.fromLevel,themeId:op.fromTheme,study:'STALE CACHE STUDY',native:'STALE CACHE MEANING',addedAt:100});

  test('all 670 frozen decisions preserve canonical identity, whole fields and six unaffected pairs',()=>{
    const a=auditRuntime();assert.equal(a.operations,670);assert.equal(a.moves,610);assert.equal(a.levelChanges,127);assert.equal(a.toReserve,37);assert.equal(a.keep,23);assert.equal(a.canonical,4704);assert.equal(a.active,4542);assert.equal(a.reserve,162);
    for(const file of ['app.html','maquette-guidee.css'])assert.ok(fs.readFileSync(path.join(WEB,file)).equals(execFileSync('git',['show',BASE+':melunga_deploy/'+file],{cwd:ROOT,maxBuffer:32*1024*1024})),'prices/source access and layout source untouched');
    for(const file of ['maquette-guidee.js','parcours-niveaux.html','maquette-guidee.html'])beforeAssetBytes(path.join(WEB,file));
    report.checks.push('all-670-whole-identity-and-placement');
  });

  test('unapproved routes, changed whole aids, fake source levels and reserved production are rejected',()=>{
    const state=ensureProjection(),firstMove=loadLedger().ledger.ops.find(op=>op.op==='move'),firstKeep=loadLedger().ledger.ops.find(op=>op.op==='keep'&&op.fromTheme!=='reserve');
    const firstReserve=loadLedger().ledger.ops.find(op=>op.op==='to-reserve');
    const byId=(pack,id)=>canonicalIndex(pack).get(id).phrase;
    const faults=[
      p=>{byId(p,firstMove.id).phon+=' WRONG';},p=>{byId(p,firstMove.id).study+=' WRONG';},p=>{byId(p,firstMove.id).native+=' WRONG';},
      p=>{byId(p,firstMove.id).reading='invented';},p=>{byId(p,firstMove.id).source.sourceLevel=10;},
      p=>{byId(p,firstMove.id).editorialLevel=firstMove.fromLevel===10?9:10;},
      p=>{byId(p,firstMove.id).placement.themeId='unapproved';},p=>{byId(p,firstMove.id).englishClassification.registrySha256='0'.repeat(64);},
      p=>{byId(p,firstKeep.id).englishClassification={operation:'keep'};},
      p=>{p[PREFIX+PAIR+'/L'+firstReserve.fromLevel+'.json'].themes[0].phrases.push(clone(byId(p,firstReserve.id)));},
      p=>{const cell=p[PREFIX+PAIR+'/L'+firstMove.toLevel+'.json'];cell.reserve.push(clone(byId(p,firstMove.id)));},
      p=>{p[PREFIX+'manifest.json'].englishClassification.reserveIds.pop();},
      p=>{p[PREFIX+'manifest.json'].englishClassification.operations[0].toTheme='unapproved';},
      p=>{const t=loadLedger().ledger.newThemes[0];p[PREFIX+PAIR+'/L'+t.level+'.json'].themes.find(x=>x.id===t.id).phrases.pop();},
      p=>{const t=loadLedger().ledger.renameThemes[0];p[PREFIX+PAIR+'/L'+t.level+'.json'].themes.find(x=>x.id===t.id).title='old name';},
      p=>{const t=loadLedger().ledger.newThemes[0];p[PREFIX+'manifest.json'].englishClassification.smallThemeExceptions.find(x=>x.id===t.id).minimum=0;},
      p=>{p[PREFIX+'fr-es/L1.json'].themes[0].phrases[0].phon+=' WRONG';},
      p=>{const seq=p[PREFIX+PAIR+'/L1.json'].themes[0].sequences[0];seq.steps.find(s=>s.kind==='choose-and-recall').preparedInSteps.understoodInStep='unprepared';},
      p=>{byId(p,firstMove.id).unexpectedField='not authorized';}
    ];
    for(const fault of faults){const bad=clone(state.actual);fault(bad);assert.throws(()=>assertOwnClassification(bad));report.negativeCasesRejected++;}
    const bad=clone(state.actual[PREFIX+PAIR+'/L1.json']);bad.themes[0].phrases[0].phon+='wrong';assert.throws(()=>beforeRead(PREFIX+PAIR+'/L1.json',bad));report.negativeCasesRejected++;
    report.checks.push('classification-tamper-rejection');
  });

  test('three new themes show distinct approved photos and all nine whole cards enter in one click',async()=>{
    const visual=rawRead('docs/niveaux-progressifs/classement-fr-en/visuels.json');
    const {context,page}=await pageFixture();try{
      const positions=new Set();
      for(const t of loadLedger().ledger.newThemes){
        await visit(page,t.level);const cell=ensureProjection().actual[PREFIX+PAIR+'/L'+t.level+'.json'];const index=cell.themes.findIndex(x=>x.id===t.id),theme=cell.themes[index];
        const tile=page.locator('#mgThemeGrid > button').nth(index);assert.equal(await tile.locator('.mg-theme-title').textContent(),t.title);
        const image=tile.locator('img');await image.evaluate(image=>image.decode());assert.ok(await image.evaluate(i=>i.naturalWidth>0));
        assert.ok((await image.getAttribute('src')).endsWith(theme.photo.asset));positions.add(theme.photo.asset+':'+theme.photo.column+':'+theme.photo.row);
        const spec=visual.themes.find(x=>x.themeId===t.id);assert.ok(spec,'new visual has a reviewed registry entry');assert.deepEqual(theme.photo,spec.photo);
        for(const phrase of theme.phrases){const target=locate(phrase.id);await enter(page,target);assert.equal(await page.locator('#mgSequenceView').isVisible(),false);await checkDom(page,target);report.cases.push({check:'new-theme-card',themeId:t.id,id:phrase.id,level:t.level});}
      }assert.equal(positions.size,3);report.checks.push('new-theme-photos-and-nine-cards');
    }finally{await context.close();}
  });

  test('moved cards and the retained interlocutor role use actual destinations and unchanged source audio',async()=>{
    const {context,page}=await pageFixture();try{
      const moves=loadLedger().ledger.ops.filter(op=>op.op==='move'&&op.toLevel!==op.fromLevel);
      const selected=[moves[0],moves.find(op=>op.toLevel>op.fromLevel),moves.find(op=>op.toLevel<op.fromLevel),loadLedger().ledger.ops.find(op=>op.op==='move'&&op.toLevel===op.fromLevel)].filter(Boolean);
      for(const op of selected){const target=locate(op.id);assert.equal(target.level,op.toLevel);assert.equal(target.theme.id,op.toTheme);await enter(page,target);await checkDom(page,target);report.cases.push({check:'moved-card',id:op.id,fromLevel:op.fromLevel,toLevel:target.level,toTheme:target.theme.id});}
      const received=locate('catalogue:en:748',true);await enter(page,received);await checkDom(page,received);assert.equal(received.phrase.heardOnly,true);assert.equal(received.phrase.referenceOnly,true);assert.equal(received.phrase.firstHeardLevel,2);assert.deepEqual(received.phrase.canonicalReserveLocation,{pairId:PAIR,level:3,themeId:null});assert.equal(await page.locator('#mgReplay').isDisabled(),true);
      report.checks.push('cross-level-and-received-role');
    }finally{await context.close();}
  });

  test('saved review resolves stale old levels by source ID and never resurrects reserved duplicates',async()=>{
    const ops=loadLedger().ledger.ops,moves=ops.filter(o=>o.op==='move'&&o.fromLevel!==o.toLevel),reserved=ops.find(o=>o.op==='to-reserve');
    for(const op of [moves[0],moves.find(o=>o.toLevel>o.fromLevel)].filter(Boolean)){
      const {context,page}=await pageFixture({width:390,height:844},{savedEntries:[cachedEntry(op)]});try{
        await visit(page,op.fromLevel);await savedPanel(page);await page.locator('[data-review-id="'+op.id+'"]').locator('[data-review-action="resume"]').click();
        await page.waitForFunction(id=>window.MelungaMockup.state().screen==='lesson'&&window.MelungaMockup.state().phraseId===id,op.id);
        assert.equal(await page.evaluate(()=>window.MelungaMockup.state().level),op.toLevel);const target=locate(op.id);await checkDom(page,target);
        const cached=await page.evaluate(id=>JSON.parse(localStorage.getItem('melunga-guided-review-v1')).entries.find(e=>e.id===id),op.id);
        assert.equal(cached.level,op.toLevel);assert.equal(cached.themeId,op.toTheme);assert.equal(cached.study,target.phrase.study);
      }finally{await context.close();}
    }
    const {context,page}=await pageFixture({width:390,height:844},{savedEntries:[cachedEntry(reserved)]});try{
      await visit(page,reserved.fromLevel);await savedPanel(page);const resume=page.locator('[data-review-id="'+reserved.id+'"]').locator('[data-review-action="resume"]');
      if(!await resume.isDisabled()){await resume.click();await page.waitForFunction(()=>window.MelungaMockup.state().screen==='themes');}
      const s=await page.evaluate(()=>window.MelungaMockup.state());assert.notEqual(s.phraseId,reserved.id);
      const cached=await page.evaluate(id=>JSON.parse(localStorage.getItem('melunga-guided-review-v1')).entries.find(e=>e.id===id),reserved.id);assert.ok(cached,'reserved saved entry is not silently deleted');
      report.checks.push('saved-review-migration-and-reserve');
    }finally{await context.close();}
  });

  test('a delayed saved-review migration cannot overwrite a newly selected language or update its cache prematurely',async()=>{
    const op=loadLedger().ledger.ops.find(o=>o.op==='move'&&o.fromLevel!==o.toLevel);
    let release,requestedResolve,block=false;const requested=new Promise(resolve=>{requestedResolve=resolve;});
    const cellPath='/content/niveaux-progressifs/fr-en/L'+op.toLevel+'.json';
    const fixture=await pageFixture({width:390,height:844},{savedEntries:[cachedEntry(op)],intercept:async(route,url)=>{
      if(block&&url.pathname===cellPath&&!release){await new Promise(resolve=>{release=async()=>{try{await route.fulfill({contentType:'application/json',body:fs.readFileSync(path.join(WEB,'.'+cellPath))});}catch(_){}resolve();};requestedResolve();});return true;}return false;
    }});try{
      const{page}=fixture;await visit(page,op.fromLevel);await savedPanel(page);block=true;
      await page.locator('[data-review-id="'+op.id+'"]').locator('[data-review-action="resume"]').click();await requested;
      const old=await page.evaluate(id=>JSON.parse(localStorage.getItem('melunga-guided-review-v1')).entries.find(e=>e.id===id),op.id);assert.equal(old.level,op.fromLevel,'no cache migration before source validation');
      await page.selectOption('#mgLanguage','fr-es');await page.waitForFunction(()=>window.MelungaMockup.state().screen==='themes'&&window.MelungaMockup.state().pairId==='fr-es');
      await release();await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      assert.equal(await page.evaluate(()=>window.MelungaMockup.state().pairId),'fr-es');assert.equal(await page.evaluate(()=>window.MelungaMockup.state().screen),'themes');
      const after=await page.evaluate(id=>JSON.parse(localStorage.getItem('melunga-guided-review-v1')).entries.find(e=>e.id===id),op.id);assert.equal(after.level,op.fromLevel,'aborted stale resume does not rewrite saved location');
      report.checks.push('saved-review-migration-race');
    }finally{if(release)await release();await fixture.context.close();}
  });

  test('classified descriptor and exact cell body corruption are refused and retry restores genuine data',async()=>{
    for(const kind of ['descriptor','body']){
      let corrupted=true;
      const fixture=await pageFixture({width:390,height:844},{intercept:async(route,url)=>{
        if(corrupted&&kind==='descriptor'&&url.pathname.endsWith('/manifest.json')){const m=clone(ensureProjection().actual[PREFIX+'manifest.json']);m.englishClassification.operations[0].toTheme='unapproved';await route.fulfill({contentType:'application/json',body:JSON.stringify(m)});return true;}
        if(corrupted&&kind==='body'&&url.pathname.endsWith('/fr-en/L3.json')){const d=clone(ensureProjection().actual[PREFIX+PAIR+'/L3.json']);d.themes[0].phrases[0].phon+=' WRONG';await route.fulfill({contentType:'application/json',body:JSON.stringify(d)});return true;}
        return false;
      }});try{
        await fixture.page.goto(base+'/parcours-niveaux.html?pair=fr-en&level=3');await fixture.page.locator('#mgRetry').waitFor({state:'visible'});assert.equal(await fixture.page.evaluate(()=>window.MelungaMockup.state().screen),'loading');
        corrupted=false;await fixture.page.click('#mgRetry');await ready(fixture.page,PAIR,3);report.negativeCasesRejected++;report.cases.push({check:'runtime-integrity-retry',kind,restored:true});
      }finally{await fixture.context.close();}
    }report.checks.push('runtime-policy-and-body-integrity');
  });

  test('new-theme cards fit complete mobile and desktop viewports without scrolling or text clipping',async()=>{
    const {context,page}=await pageFixture();try{
      for(const viewport of [{width:320,height:640},{width:1280,height:720}])for(const t of loadLedger().ledger.newThemes){
        const theme=ensureProjection().actual[PREFIX+PAIR+'/L'+t.level+'.json'].themes.find(x=>x.id===t.id);
        for(const phrase of theme.phrases){await page.setViewportSize(viewport);const target=locate(phrase.id);await enter(page,target);await page.evaluate(async()=>{await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});
          const measure=await page.evaluate(()=>{const rect=n=>{const x=n.getBoundingClientRect();return{top:x.top,bottom:x.bottom,left:x.left,right:x.right};},visible=n=>n&&!n.hidden&&getComputedStyle(n).display!=='none'&&n.getBoundingClientRect().width>0;return{card:rect(document.getElementById('mgLessonView')),texts:['mgPhrase','mgPhon','mgTranslation','mgReading'].map(id=>document.getElementById(id)).filter(visible).map(n=>{const r=document.createRange();r.selectNodeContents(n);return{id:n.id,text:rect(r)};}),scroll:[document.scrollingElement,...['mgContent','mgLessonView','mgModel'].map(id=>document.getElementById(id))].map(n=>({id:n.id||n.tagName,vertical:n.scrollHeight-n.clientHeight,horizontal:n.scrollWidth-n.clientWidth})),controls:['mgEar','mgReplay','mgContinue'].every(id=>visible(document.getElementById(id)))};});
          for(const n of measure.scroll){assert.ok(n.vertical<=2,n.id+' no vertical scroll');assert.ok(n.horizontal<=2,n.id+' no horizontal scroll');}
          for(const n of measure.texts){assert.ok(n.text.top>=measure.card.top-2&&n.text.bottom<=measure.card.bottom+2,n.id+' inside card vertically');assert.ok(n.text.left>=measure.card.left-2&&n.text.right<=measure.card.right+2,n.id+' inside card horizontally');}
          for(let a=0;a<measure.texts.length;a++)for(let b=a+1;b<measure.texts.length;b++){const x=measure.texts[a].text,y=measure.texts[b].text;assert.ok(Math.min(x.right,y.right)-Math.max(x.left,y.left)<=1||Math.min(x.bottom,y.bottom)-Math.max(x.top,y.top)<=1,'text fields do not overlap');}
          assert.ok(measure.controls);report.cases.push({check:'complete-card',id:phrase.id,viewport,measure});
        }
      }report.checks.push('new-cards-fit-mobile-and-desktop');
    }finally{await context.close();}
  });
}
