/* Independent finite content QA. Actual whole documents are validated before
 * a private historical inverse is exposed. No producer or generator is loaded. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');
const {isDeepStrictEqual} = require('node:util');
const ROOT = path.resolve(__dirname, '../..'), WEB = path.join(ROOT, 'melunga_deploy');
const BASE = '13f42b5814f2b230d76d2d0ef267dcf406c523c2';
const COMMIT = '17b003810a15954d933f49decc2bafa53de8d881';
const ERRATUM_COMMIT = '4247ca470354f59ea37992608b38e3728a6e22f9';
const DIRECTORY = 'docs/niveaux-progressifs/contenu-tranche/';
const REGISTRY = DIRECTORY + 'registre-contenu-tranche.json';
const SOURCE = 'docs/revue-integrale/contenu-incertain/registre-contenu.json';
const ERRATUM_SOURCE = 'docs/revue-integrale/contenu-incertain/errata-1.json';
const SOURCE_SHA = '0276ad1dac00161a6619de315d22d558f65b55a8821f3ddab95a1f10ad9a9e02';
const ERRATUM_SHA = '5418f06dcef98785a617e55a2f033c9bbdd99d9b563efe28f689fca81b9e1453';
const REGISTRY_SHA = '3fa187478a03e1398e7b14fa545c0950bf1ff166789a480745ca689061377130';
const CHECKER_SHA = '248d194b72e13aa79ae65fe5022448e622ec1462993181459663f99014b95796';
const PREFIX = 'melunga_deploy/content/niveaux-progressifs/';
const CHECKER = 'tools/maquette-guidee/check_uncertain_content_independent.py';
const ANNOTATION = 'uncertainContentCorrection';
const PRIOR = ['phoneticCorrection','reviewedFieldCorrection','lot4PhoneticCorrection','reviewedContentCorrection','lot5FieldCorrection','lot5ContentCorrection','lot6FieldCorrection','lot6ContentCorrection','lot7PhoneticCorrection','lot7ContentCorrection','lot8PhoneticCorrection','lot8ContentCorrection','lot8Erratum1Correction','lot9PhoneticCorrection','lot9ContentCorrection'];
const clone = value => JSON.parse(JSON.stringify(value));
const hash = raw => crypto.createHash('sha256').update(raw).digest('hex');
const at = (document, location) => location.reduce((node, part) => node[part], document);
const key = (pair, id) => pair + '\0' + id;
const rawRead = filename => JSON.parse(fs.readFileSync(path.join(ROOT, filename)));
const sourceBytes = new Map(), sourceDocuments = new Map();
function baselineBytes(filename) {
  if (!sourceBytes.has(filename)) sourceBytes.set(filename, execFileSync('git', ['show', BASE + ':' + filename], {cwd: ROOT, maxBuffer: 64 * 1024 * 1024}));
  return sourceBytes.get(filename);
}
function baseline(filename) {
  if (!sourceDocuments.has(filename)) sourceDocuments.set(filename, JSON.parse(baselineBytes(filename)));
  return sourceDocuments.get(filename);
}
function* walk(node, location = []) {
  if (!node || typeof node !== 'object') return;
  if (!Array.isArray(node)) yield {node, location};
  for (const [part, value] of Object.entries(node)) if (value && typeof value === 'object') yield* walk(value, [...location, Array.isArray(node) ? Number(part) : part]);
}
function profile(phrase) {
  const result = Object.fromEntries(['study','native','phon','source'].map(field => [field, clone(phrase[field])]));
  for (const field of ['reading','phoneticReviewStatus', ...PRIOR]) {result[field + 'Present'] = Object.hasOwn(phrase, field); result[field] = phrase[field] ?? null;}
  return result;
}
let ledgerCache;
function loadLedger(override) {
  if (!override && ledgerCache) return ledgerCache;
  const raw = fs.readFileSync(path.join(ROOT, REGISTRY));
  assert.equal(hash(raw), REGISTRY_SHA, 'independently frozen registry bytes');
  const sourceRaw = fs.readFileSync(path.join(ROOT, DIRECTORY + 'evidence-registre-contenu.json'));
  assert.equal(hash(sourceRaw), SOURCE_SHA);
  assert.ok(sourceRaw.equals(execFileSync('git', ['show', COMMIT + ':' + SOURCE], {cwd: ROOT, maxBuffer: 64 * 1024 * 1024})), 'exact author source Git object');
  const erratumRaw = fs.readFileSync(path.join(ROOT, DIRECTORY + 'evidence-errata-1.json'));
  assert.equal(hash(erratumRaw), ERRATUM_SHA);
  assert.ok(erratumRaw.equals(execFileSync('git', ['show', ERRATUM_COMMIT + ':' + ERRATUM_SOURCE], {cwd: ROOT})), 'exact author erratum Git object');
  const source = JSON.parse(sourceRaw), events = clone(source.events), erratum = JSON.parse(erratumRaw);
  assert.equal(source.baseSnapshotCommit, BASE); assert.equal(events.length, 638);
  assert.deepEqual(erratum.events.map(event => event.id), ['catalogue:it:1239','catalogue:es:3353','catalogue:ko:3767','catalogue:ko:3637']);
  assert.equal(events[211].id, 'catalogue:it:1239'); assert.equal(events[467].id, 'catalogue:ko:3637');
  assert.equal(erratum.events[3].finalPhon, 'gueu-nyo-neun sam-guè gou-go-reul hè-sso-yo');
  assert.equal(events[467].after.phon, erratum.events[3].blocAfterPhon);
  events[467].after.phon = erratum.events[3].finalPhon;
  const registry = override || JSON.parse(raw), entries = new Map();
  assert.equal(registry.id, 'contenu-incertain-tranche'); assert.equal(registry.baseSnapshotCommit, BASE);
  assert.equal(registry.correctionCount, 637); assert.equal(registry.eventCount, 637);
  assert.equal(registry.approvedFieldCount, 870); assert.equal(registry.changedFieldCount, 870);
  assert.deepEqual(registry.kindCounts, {glose: 478, bloc: 159});
  assert.deepEqual(registry.withdrawnEvents, [{eventIndex: 211, pair: 'fr-it', id: 'catalogue:it:1239'}]);
  assert.equal(registry.rejectedCount, 145); assert.equal(registry.corrections.length, 637);
  const selected = new Map(); let studyOnly = 0;
  for (const [index, event] of events.entries()) {
    assert.equal(typeof event.pair, 'string'); assert.equal(typeof event.id, 'string');
    assert.deepEqual(Object.keys(event.before).sort(), [...event.fields].sort());
    assert.deepEqual(Object.keys(event.after).sort(), [...event.fields].sort());
    for (const field of event.fields) for (const side of ['before','after']) assert.equal(typeof event[side][field], 'string', 'whole literal retains its string type');
    assert.ok(!selected.has(key(event.pair, event.id))); selected.set(key(event.pair, event.id), {event, index});
    if (index !== 211 && event.kind === 'bloc' && !event.fields.includes('phon')) studyOnly++;
  }
  assert.equal(studyOnly, 9, 'nine study-only blocks retain the existing phonetic status');
  for (const entry of registry.corrections) {
    const identity = key(entry.pairId, entry.id), source = selected.get(identity);
    assert.ok(source && source.index !== 211 && !entries.has(identity), 'one accepted whole author event per identity');
    const {event, index} = source;
    assert.equal(entry.eventIndex, index); assert.equal(entry.kind, event.kind); assert.equal(entry.atomicBundle, event.kind === 'bloc');
    assert.deepEqual(entry.fields, Object.fromEntries(event.fields.map(field => [field, {before: event.before[field], after: event.after[field]}])));
    assert.ok(entry.occurrences.some(o => o.path === event.occurrence.path && isDeepStrictEqual(o.location, event.occurrence.location)), 'reviewed source anchor survives');
    entries.set(identity, entry);
  }
  const result = {registry, source, events, entries, registrySha256: hash(raw)};
  if (!override) ledgerCache = result;
  return result;
}
function actualPack() {
  const m = baseline(PREFIX + 'manifest.json');
  return Object.fromEntries([PREFIX + 'manifest.json', ...m.pairs.flatMap(p => [p.repertoirePath, ...p.levels.map(l => l.dataPath)]).map(p => 'melunga_deploy/' + p)].map(p => [p, rawRead(p)]));
}
function annotation(entry, before) {
  return {id: entry.id, registryPath: REGISTRY, registrySha256: REGISTRY_SHA, baseSnapshotCommit: BASE,
    fields: Object.keys(entry.fields).sort(), beforeFields: Object.fromEntries(Object.keys(entry.fields).sort().map(field => [field, before[field]])),
    originalPhoneticReviewStatusPresent: Object.hasOwn(before, 'phoneticReviewStatus'), originalPhoneticReviewStatus: before.phoneticReviewStatus ?? null,
    evidenceCommits: [COMMIT, ERRATUM_COMMIT], kind: entry.kind, evidenceEventIndex: entry.eventIndex};
}
function assertOwnContent(pack, projectedBankHashes) {
  const audit = loadLedger(), objects = new Map(), profiles = {}, fields = {}, occurrences = new Map();
  for (const [filename, document] of Object.entries(pack)) {
    if (filename.endsWith('/manifest.json')) continue;
    const original = baseline(filename), pair = document.pairId || document.id;
    const expected = clone(original);
    for (const {node: before, location} of walk(original)) {
      if (!['id','study','native','phon'].every(field => typeof before[field] === 'string')) continue;
      const identity = key(pair, before.id), entry = audit.entries.get(identity);
      if (!entry) continue;
      const current = at(document, location), wanted = at(expected, location);
      const role = filename.includes('/repertoires/') ? location[0] === 'receivedModels' ? 'received-model' : 'transport-phrase' : 'canonical';
      if (!occurrences.has(identity)) occurrences.set(identity, []);
      occurrences.get(identity).push({path: filename, location, profile: role, expectedBefore: profile(before)});
      for (const [field, change] of Object.entries(entry.fields)) {assert.equal(before[field], change.before); wanted[field] = change.after; fields[field] = (fields[field] || 0) + 1;}
      if (entry.fields.phon && entry.fields.phon.before !== entry.fields.phon.after) wanted.phoneticReviewStatus = 'corrected-by-Claude-content-tranche';
      wanted[ANNOTATION] = annotation(entry, before);
      assert.deepEqual(current, wanted, 'complete current tuple, role, provenance, prior annotations and after for ' + identity);
      profiles[role] = (profiles[role] || 0) + 1;
      if (!objects.has(identity)) objects.set(identity, []); objects.get(identity).push(current);
    }
    // Metadata is checked independently below before the full-document comparison.
    for (const change of audit.registry.derivedMetadataChanges) if (filename === PREFIX + change.pairId + '/L' + change.level + '.json') {
      const theme = [...expected.themes, ...(expected.heldThemes || [])].find(t => t.id === change.themeId);
      assert.equal(theme.pedagogicalConceptCount, change.before); theme.pedagogicalConceptCount = change.after;
    }
    assert.deepEqual(document, expected, 'no unapproved field, occurrence, step, role or partition change in ' + filename);
  }
  for (const [identity, entry] of audit.entries) {
    const found = occurrences.get(identity) || [];
    assert.equal(found.length, entry.occurrences.length, 'complete canonical/transport/received occurrence coverage');
    for (const occurrence of entry.occurrences) {
      const match = found.find(row => row.path === occurrence.path && isDeepStrictEqual(row.location, occurrence.location)); assert.ok(match);
      assert.equal(occurrence.profile, match.profile); assert.deepEqual(occurrence.expectedBefore, match.expectedBefore);
    }
    for (const copy of objects.get(identity)) for (const field of ['study','native','phon','reading']) assert.equal(copy[field], objects.get(identity)[0][field], 'all whole copies agree');
  }
  assert.equal(objects.size, 637); assert.deepEqual(profiles, {canonical: 626, 'transport-phrase': 17, 'received-model': 11});
  assert.deepEqual(fields, {native: 528, phon: 150, study: 159, reading: 50});
  let recountedThemes = 0;
  for (const pair of pack[PREFIX + 'manifest.json'].pairs) {
    const bank = pack['melunga_deploy/' + pair.repertoirePath], copies = new Map(bank.phrases.map(p => [p.id, p]));
    for (const level of pair.levels) {
      const cell = pack['melunga_deploy/' + level.dataPath];
      for (const theme of [...cell.themes, ...(cell.heldThemes || [])]) {
        const phrases = [...theme.phrases, ...[...(theme.reviewReferences || []), ...(theme.contextReferences || [])].map(r => {assert.ok(copies.has(r.id)); return copies.get(r.id);})];
        const concepts = new Set(phrases.map(p => p.lexicalConceptId ? ['leger','léger','léger'].includes(p.lexicalConceptId) ? 'leger' : p.lexicalConceptId : JSON.stringify([p.study, p.native])));
        assert.equal(theme.pedagogicalConceptCount, concepts.size, 'current concept metadata derives from the served content'); recountedThemes++;
      }
    }
  }
  assert.equal(audit.registry.derivedMetadataChanges.length, 7);
  const expectedManifest = clone(baseline(PREFIX + 'manifest.json')), declaration = {};
  for (const field of ['appliesAfter','correctionCount','eventCount','approvedFieldCount','changedFieldCount','kindCounts','pairCounts','rejectedCount','rejectedCounts','sourceEventCount','withdrawnEventCount','withdrawnEvents','exceptionsFile','authorErratum']) declaration[field] = clone(audit.registry[field]);
  Object.assign(declaration, {registryPath: REGISTRY, registrySha256: REGISTRY_SHA, baseSnapshotCommit: BASE, evidenceCommits: [COMMIT, ERRATUM_COMMIT]});
  expectedManifest.uncertainContentCorrections = declaration;
  for (const pair of expectedManifest.pairs) pair.repertoireSha256 = projectedBankHashes ? projectedBankHashes['melunga_deploy/' + pair.repertoirePath] : hash(fs.readFileSync(path.join(WEB, pair.repertoirePath)));
  assert.deepEqual(pack[PREFIX + 'manifest.json'], expectedManifest, 'only finite content declaration and actual bank hashes');
  for (const filename of ['app.html','maquette-guidee.js','maquette-guidee.css','parcours-niveaux.html','maquette-guidee.html','content/maquette-guidee.json']) {const file='melunga_deploy/'+filename; const bytes=rawRead(PREFIX+'manifest.json').allClassification?require('./all-classification.cjs').beforeAssetBytes(file):fs.readFileSync(path.join(WEB,filename));assert.ok(bytes.equals(baselineBytes(file)), 'classic/prices/free access unchanged; any classification-only UI difference separately frozen');}
  return {events: 637, glosses: 478, blocks: 159, objects: 654, fields: 887, profiles, fieldOccurrences: fields, metadataChanges: 7, recountedThemes, wholeDocuments: 78};
}
let projectedCache;
function ensureProjection() {
  if (projectedCache) return projectedCache;
  const actual = actualPack();
  if(actual[PREFIX+'manifest.json'].allClassification){
    const classification=require('./all-classification.cjs').ensureProjection();
    assert.deepEqual(actual,classification.actual,'the same complete actual edition enters the outer classification proof');
    const contentActual=classification.beforeConventions;
    const bankHashes=Object.fromEntries(contentActual[PREFIX+'manifest.json'].pairs.map(pair=>['melunga_deploy/'+pair.repertoirePath,pair.repertoireSha256]));
    const summary=assertOwnContent(contentActual,bankHashes);
    assert.equal(hash(fs.readFileSync(path.join(ROOT,CHECKER))),CHECKER_SHA,'the content proof checker is still frozen');
    projectedCache={actual,contentActual,documents:classification.documents,fingerprints:classification.fingerprints,phraseCandidates:classification.phraseCandidates,summary:{...summary,independent:classification.summary.independent,classification:classification.summary}};
    return projectedCache;
  }
  // C proves current whole objects and its exact B inverse before B source checks.
  const conventions = actual[PREFIX + 'manifest.json'].conventionCorrections ? require('./convention-corrections.cjs').ensureProjection() : null;
  if (conventions) assert.deepEqual(actual, conventions.actual, 'the same actual C documents enter both independent layers');
  const contentActual = conventions ? conventions.beforeB : actual;
  const summary = assertOwnContent(contentActual, conventions?.bankHashes);
  assert.equal(hash(fs.readFileSync(path.join(ROOT, CHECKER))), CHECKER_SHA, 'pinned independent inverse checker');
  const result = conventions ? {documents:conventions.documents, summary:conventions.summary.independent.content, actualRawDocumentSha256:conventions.fingerprints} : JSON.parse(execFileSync('python3', ['-B', path.join(ROOT, CHECKER), '--root', ROOT, '--project-runtime'], {cwd: ROOT, encoding: 'utf8', maxBuffer: 96 * 1024 * 1024}));
  assert.ok(result.documents && result.summary && result.actualRawDocumentSha256);
  const fingerprints = {}, phraseCandidates = new Map();
  for (const [filename, document] of Object.entries(actual)) {
    assert.deepEqual(result.documents[filename], baseline(filename), 'validated finite inverse restores the complete source document');
    fingerprints[filename] = hash(fs.readFileSync(path.join(ROOT, filename)));
    assert.equal(result.actualRawDocumentSha256[filename], fingerprints[filename], 'independent process checked these actual raw bytes');
    const pair = document.pairId || document.id;
    for (const {node, location} of walk(document)) if (typeof node.id === 'string' && typeof node.study === 'string') {
      const identity = key(pair, node.id); if (!phraseCandidates.has(identity)) phraseCandidates.set(identity, []);
      phraseCandidates.get(identity).push([node, at(result.documents[filename], location)]);
    }
  }
  projectedCache = {actual, contentActual, documents: result.documents, fingerprints, phraseCandidates, summary: {...summary, independent: result.summary, ...(conventions ? {conventions:conventions.summary} : {})}};
  return projectedCache;
}
const relative = filename => (path.isAbsolute(filename) ? path.relative(ROOT, filename) : filename).split(path.sep).join('/');
function beforeRead(filename, document) {
  filename = relative(filename);
  if (!filename.startsWith(PREFIX)) return typeof document === 'string' || Buffer.isBuffer(document) ? JSON.parse(document) : document;
  const state = ensureProjection(); assert.ok(Object.hasOwn(state.documents, filename));
  assert.equal(hash(fs.readFileSync(path.join(ROOT, filename))), state.fingerprints[filename], 'actual bytes remain validated');
  if (typeof document === 'string' || Buffer.isBuffer(document)) assert.equal(hash(document), state.fingerprints[filename]);
  else assert.deepEqual(document, state.actual[filename], 'mutated input cannot be concealed by a historical projection');
  return clone(state.documents[filename]);
}
function beforeAssetBytes(filename){
  filename=relative(filename);
  if(rawRead(PREFIX+'manifest.json').allClassification)return require('./all-classification.cjs').beforeAssetBytes(filename);
  return fs.readFileSync(path.join(ROOT,filename));
}
function beforeBytes(filename) {
  filename = relative(filename);
  if (!filename.startsWith(PREFIX)) return beforeAssetBytes(filename);
  const state = ensureProjection(); assert.equal(hash(fs.readFileSync(path.join(ROOT, filename))), state.fingerprints[filename]);
  return baselineBytes(filename);
}
function projectPhrase(pair, phrase) {
  if (!phrase || !phrase.id) return phrase;
  const state = ensureProjection(), candidates = state.phraseCandidates.get(key(pair, phrase.id));
  if (!candidates) return phrase;
  for (const [actual, before] of candidates) if (isDeepStrictEqual(phrase, actual) || isDeepStrictEqual(phrase, before)) return clone(before);
  throw new Error('An unvalidated content tuple cannot be hidden: ' + pair + '/' + phrase.id);
}
function inputFiles() {return [...(rawRead(PREFIX+'manifest.json').allClassification?require('./all-classification.cjs').inputFiles():[]), ...(rawRead(PREFIX + 'manifest.json').conventionCorrections ? require('./convention-corrections.cjs').inputFiles() : []), __filename, path.join(ROOT, REGISTRY), path.join(ROOT, CHECKER), ...loadLedger().registry.evidenceFiles.map(f => path.join(ROOT, f.path)), path.join(ROOT, DIRECTORY + 'exceptions-contenu-tranche.json'), ...['app.html','maquette-guidee.js','maquette-guidee.css','parcours-niveaux.html','maquette-guidee.html','content/maquette-guidee.json'].map(f => path.join(WEB,f)), ...Object.keys(actualPack()).map(f => path.join(ROOT, f))];}
function auditRuntime() {return ensureProjection().summary;}
module.exports = {loadLedger, baseline, rawRead, actualPack, assertOwnContent, beforeRead, beforeBytes, beforeAssetBytes, projectPhrase, inputFiles, auditRuntime, ensureProjection};

if (require.main === module) {
  const {test, before, after} = require('node:test'), http = require('node:http');
  const {chromium} = require('playwright-core');
  let server, browser, base;
  const errors = [], requests = [], report = {status: 'running', actualContent: true, publicSiteChecked: false,
    environment: 'local Chromium; emulated viewports; mocked speechSynthesis', nativeOrPhoneticApproval: false,
    viewports: [{width: 320, height: 640}, {width: 1280, height: 720}], checks: [], models: [], speechChecks: 0, fitChecks: 0};
  let snapshots;
  before(async () => {
    report.sourceAudit = auditRuntime();
    snapshots = new Map(inputFiles().map(file => [file, hash(fs.readFileSync(file))]));
    server = http.createServer((req, res) => {
      const file = path.resolve(WEB, '.' + new URL(req.url, 'http://local').pathname);
      if (!file.startsWith(WEB + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return res.writeHead(404).end();
      res.setHeader('Content-Type', ({'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css'})[path.extname(file)] || 'application/octet-stream');
      fs.createReadStream(file).pipe(res);
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve)); base = 'http://127.0.0.1:' + server.address().port;
    browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox']});
  });
  after(async () => {
    await browser?.close(); if (server) await new Promise(resolve => server.close(resolve));
    report.errors = errors; report.externalOrApiRequests = requests;
    report.stableInputs = [...snapshots || []].every(([file, fingerprint]) => hash(fs.readFileSync(file)) === fingerprint);
    report.status = !errors.length && !requests.length && report.stableInputs && report.checks.length === 4 ? 'passed' : 'failed';
    if (process.env.CONTENT_QA_REPORT) fs.writeFileSync(process.env.CONTENT_QA_REPORT, JSON.stringify(report, null, 2) + '\n');
    assert.deepEqual(errors, []); assert.deepEqual(requests, []); assert.equal(report.stableInputs, true);
  });
  function fixtures() {
    const audit = loadLedger(), pack = ensureProjection().actual, result = [];
    for (const pair of pack[PREFIX + 'manifest.json'].pairs) {
      const bank = pack['melunga_deploy/' + pair.repertoirePath], models = new Map([...bank.phrases, ...(bank.receivedModels || [])].map(p => [p.id, p]));
      const receivedModels=new Map((bank.receivedModels||[]).map(p=>[p.id,p]));
      const canonical=new Map(pair.levels.flatMap(level=>{const cell=pack['melunga_deploy/'+level.dataPath];return[...cell.themes,...(cell.heldThemes||[])].flatMap(t=>t.phrases).concat(cell.reserve||[]);}).map(p=>[p.id,p]));
      for (const level of pair.levels) {
        const cell = pack['melunga_deploy/' + level.dataPath];
        for (const [themeIndex, theme] of cell.themes.entries()) {
          for (const phrase of theme.phrases) models.set(phrase.id, phrase);
          for (const [stepIndex, step] of theme.sequences.flatMap(s => s.steps).entries()) {
            const entry = audit.entries.get(key(pair.id, step.utterance));
            if (entry) {const phrase=step.kind==='receive'?receivedModels.get(step.utterance):canonical.get(step.utterance)||models.get(step.utterance);assert.ok(phrase,'real current model '+pair.id+'/'+step.utterance+'/'+step.kind); result.push({pairId: pair.id, studyLanguage: pair.studyLanguage, level: level.level, themeIndex, stepIndex, step, entry, phrase});}
          }
        }
      }
    }
    return result;
  }
  test('637 whole accepted events, 654 objects and 887 fields preserve every complete runtime document', () => {
    const audit = auditRuntime(); assert.equal(audit.events, 637); assert.equal(audit.objects, 654); assert.equal(audit.fields, 887);
    const pack = ensureProjection().actual, source = loadLedger().events[211];
    const held = at(ensureProjection().contentActual[source.occurrence.path], source.occurrence.location); // Source withdrawal tested in the verified B view; routing is tested on actual A below.
    assert.deepEqual(held, at(baseline(source.occurrence.path), source.occurrence.location), 'withdrawn Italian tuple remains completely unchanged');
    assert.equal(held.study, 'Si guadagna bene da vivere.');
    const protectedIds = new Set(); let received = 0, steps = 0;
    for (const pair of pack[PREFIX + 'manifest.json'].pairs) for (const level of pair.levels) {
      const cell = pack['melunga_deploy/' + level.dataPath];
      for (const phrase of [...(cell.reserve || []), ...(cell.heldThemes || []).flatMap(t => t.phrases)]) protectedIds.add(key(pair.id, phrase.id));
    }
    for (const pair of pack[PREFIX + 'manifest.json'].pairs) for (const level of pair.levels) for (const theme of pack['melunga_deploy/' + level.dataPath].themes) for (const sequence of theme.sequences) for (const step of sequence.steps) {
      steps++;
      if (step.kind === 'receive') {assert.equal(step.requiresProduction, false); assert.equal(step.countsForProgress, false); received++;}
      else for (const id of [step.utterance, ...(step.choices || [])].filter(Boolean)) assert.ok(!protectedIds.has(key(pair.id, id)), 'held/reserved source is never learner production');
    }
    const classic = fs.readFileSync(path.join(WEB,'app.html'),'utf8'), marker = 'var DECKS = ', start = classic.indexOf(marker) + marker.length;
    const decks = JSON.parse(classic.slice(start, classic.indexOf('\n', start)).trim().replace(/;$/, ''));
    const classicCards = Object.values(decks).reduce((n, cards) => n + cards.length, 0); assert.equal(classicCards, 32115);
    report.classicCardsUnchanged = classicCards; report.priceAndFreeLevelAccessUnchanged = true;
    report.productionIsolation = {protectedIds: protectedIds.size, steps, received}; report.checks.push('whole-runtime');
  });
  test('partial bundles, stale copies, status promotion, false roles and historical concealment are rejected', () => {
    const audit = loadLedger(), pack = ensureProjection().contentActual;
    const bankHashes = Object.fromEntries(pack[PREFIX + 'manifest.json'].pairs.map(pair => ['melunga_deploy/' + pair.repertoirePath, pair.repertoireSha256]));
    assertOwnContent(pack, bankHashes); // Positive B inverse must pass before its negative specimens.
    const atomic = audit.registry.corrections.find(e => e.kind === 'bloc' && e.fields.phon);
    const native = audit.registry.corrections.find(e => e.kind === 'glose');
    const studyOnly = audit.registry.corrections.find(e => e.kind === 'bloc' && !e.fields.phon);
    const copied = audit.registry.corrections.find(e => e.occurrences.some(o => o.profile === 'transport-phrase'));
    const heard = audit.registry.corrections.find(e => e.occurrences.some(o => o.profile === 'received-model'));
    const faults = [
      [atomic, p => {p.study = atomic.fields.study.before;}],
      [atomic, p => {p.phon = atomic.fields.phon.before;}],
      [native, p => {p.phoneticReviewStatus = 'native-approved';}],
      [studyOnly, p => {p.phoneticReviewStatus = 'corrected-by-Claude-content-tranche';}],
      [atomic, p => {p.reading = 123;}],
      [atomic, p => {p.source.sourceSha256 = '0'.repeat(64);}],
      [atomic, p => {delete p[ANNOTATION];}],
      [copied, p => {p.native += ' stale';}, 'transport-phrase'],
      [heard, p => {p.heardOnly = false;}, 'received-model']
    ];
    for (const [entry, mutate, role] of faults) {
      const changed = clone(pack), occurrence = role ? entry.occurrences.find(o => o.profile === role) : entry.occurrences[0];
      mutate(at(changed[occurrence.path], occurrence.location)); assert.throws(() => assertOwnContent(changed, bankHashes));
    }
    const held = audit.events[211], changed = clone(pack); Object.assign(at(changed[held.occurrence.path], held.occurrence.location), held.after); assert.throws(() => assertOwnContent(changed, bankHashes));
    const documentPath = atomic.occurrences[0].path, bad = clone(pack[documentPath]); at(bad, atomic.occurrences[0].location).study = 'unapproved';
    assert.throws(() => beforeRead(documentPath, bad));
    const phrase = clone(at(pack[documentPath], atomic.occurrences[0].location)); phrase.native += ' unapproved'; assert.throws(() => projectPhrase(atomic.pairId, phrase));
    for (const mutate of [r => {r.corrections[0].fields.native.after = 123;}, r => {r.corrections.find(e => e.kind === 'bloc').atomicBundle = false;}, r => {r.corrections[0].eventIndex = 211;}, r => {r.corrections[0].occurrences = [];}]) {const wrong = clone(audit.registry); mutate(wrong); assert.throws(() => loadLedger(wrong));}
    report.adversarialCases = faults.length + 7; report.checks.push('adversarial');
  });
  async function open(viewport) {
    const context = await browser.newContext({viewport, isMobile: viewport.width < 600, hasTouch: viewport.width < 600, reducedMotion: 'reduce'});
    await context.addInitScript(() => {window.__contentSpeech = []; window.SpeechSynthesisUtterance = class {constructor(text) {this.text = text;}}; Object.defineProperty(window, 'speechSynthesis', {value: {cancel() {}, getVoices() {return [];}, addEventListener() {}, speak(utterance) {window.__contentSpeech.push({text: utterance.text, lang: utterance.lang}); utterance.onend?.();}}});});
    await context.route('**/*', async route => {const url = new URL(route.request().url()); if (url.origin !== base || /\/(?:\.netlify|api)\//.test(url.pathname)) {requests.push(url.origin + url.pathname); await route.abort();} else await route.continue();});
    const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message)); return {context, page};
  }
  async function enter(page, target, previous) {
    if (!previous || previous.pairId !== target.pairId || previous.level !== target.level || previous.themeIndex !== target.themeIndex || previous.stepIndex >= target.stepIndex) {
      await page.goto(base + '/parcours-niveaux.html?pair=' + target.pairId + '&level=' + target.level);
      await page.waitForFunction(t => window.MelungaMockup?.state().screen === 'themes' && window.MelungaMockup.state().pairId === t.pairId && window.MelungaMockup.state().level === t.level, target);
      await page.locator('#mgThemeGrid > button').nth(target.themeIndex).click();
    }
    await page.evaluate(target => {while (window.MelungaMockup.state().stepIndex < target.stepIndex) {document.querySelector('#mgChoices:not([hidden]) button')?.click(); const next = document.getElementById('mgContinue'); if (next.disabled) throw new Error('Real lesson blocked while advancing to ' + target.entry.id); next.click();}}, target);
    assert.equal(await page.evaluate(() => window.MelungaMockup.state().phraseId), target.entry.id);
  }
  async function checkModel(page, target, fit) {
    const phrase = target.phrase;
    for (const [id, field] of [['mgPhrase','study'],['mgPhon','phon'],['mgTranslation','native'],['mgReading','reading']]) assert.equal(await page.locator('#' + id).textContent(), phrase[field] || '', 'actual whole DOM field ' + target.pairId + '/' + phrase.id + '/' + field);
    await page.evaluate(() => document.querySelector('#mgChoices:not([hidden]) button')?.click());
    const wasMasked = await page.evaluate(() => window.MelungaMockup.state().masked);
    await page.click('#mgEar');
    const spoken = await page.evaluate(() => window.__contentSpeech.at(-1));
    assert.equal(spoken.text, phrase.study, 'TTS receives the whole study script, never reading or phonetic aid'); assert.equal(spoken.lang.split('-')[0], target.studyLanguage); report.speechChecks++;
    if (wasMasked) assert.equal(await page.evaluate(() => window.MelungaMockup.state().masked), false, 'explicit ear reveals recall');
    if (target.step.kind === 'receive') {assert.equal(await page.locator('#mgReplay').isDisabled(), true); assert.equal(phrase.heardOnly, true); assert.equal(phrase.referenceOnly, true);}
    if (fit) {
      if (['ja','ko'].includes(target.studyLanguage) && phrase.reading && !await page.locator('#mgReading').isVisible()) {const toggle = page.locator('#mgReadingToggle'); if (await toggle.isVisible()) await toggle.click();}
      await page.evaluate(async () => {await document.fonts.ready; await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));});
      const result = await page.evaluate(() => {
        const rect = n => {const r = n.getBoundingClientRect(); return {top:r.top,bottom:r.bottom,left:r.left,right:r.right};};
        const visible = n => n && !n.hidden && getComputedStyle(n).display !== 'none' && n.getBoundingClientRect().width > 0;
        return {lesson:rect(document.getElementById('mgLessonView')), texts:['mgPhrase','mgPhon','mgTranslation','mgReading'].map(id => document.getElementById(id)).filter(visible).map(n => {const range = document.createRange(); range.selectNodeContents(n); return {id:n.id,text:rect(range),element:rect(n),overflow:getComputedStyle(n).overflowY};}), scrollers:[document.scrollingElement,...['mgContent','mgLessonView','mgModel'].map(id => document.getElementById(id))].map(n => ({id:n.id || n.tagName,scrollHeight:n.scrollHeight,clientHeight:n.clientHeight,scrollWidth:n.scrollWidth,clientWidth:n.clientWidth})), actions:['mgEar','mgContinue','mgReplay'].map(id => {const n = document.getElementById(id); return {id,visible:visible(n),rect:rect(n)};}),viewport:{width:innerWidth,height:innerHeight}};
      });
      const label = target.pairId + '/' + phrase.id + '/' + target.step.kind;
      for (const n of result.scrollers) {assert.ok(n.scrollHeight <= n.clientHeight + 2, label + '/' + n.id + ' no vertical scrolling'); assert.ok(n.scrollWidth <= n.clientWidth + 2, label + '/' + n.id + ' no horizontal scrolling');}
      for (const n of result.texts) {assert.ok(n.text.top >= result.lesson.top - 2 && n.text.bottom <= result.lesson.bottom + 2, label + '/' + n.id + ' entire text inside card'); assert.ok(n.text.left >= result.lesson.left - 2 && n.text.right <= result.lesson.right + 2, label + '/' + n.id + ' no lateral clipping'); if (n.overflow !== 'visible') assert.ok(n.text.top >= n.element.top - 2 && n.text.bottom <= n.element.bottom + 2, label + '/' + n.id + ' no inner clipping');}
      for (let i = 0; i < result.texts.length; i++) for (let j = i + 1; j < result.texts.length; j++) {const a = result.texts[i].text, b = result.texts[j].text; assert.ok(Math.min(a.right,b.right) - Math.max(a.left,b.left) <= 1 || Math.min(a.bottom,b.bottom) - Math.max(a.top,b.top) <= 1, label + ' text fields do not overlap');}
      for (const action of result.actions) {assert.equal(action.visible,true,label + '/' + action.id + ' action visible'); assert.ok(action.rect.top >= -2 && action.rect.bottom <= result.viewport.height + 2 && action.rect.left >= -2 && action.rect.right <= result.viewport.width + 2,label + '/' + action.id + ' entire action in viewport');} report.fitChecks++;
    }
    report.models.push({pair:target.pairId,id:phrase.id,kind:target.step.kind,level:target.level,fit});
  }
  test('all active whole content blocks fit and speak actual studies at mobile and desktop sizes', {timeout: 900000}, async () => {
    const all = fixtures(), selected = new Map();
    for (const target of all) if (target.entry.kind === 'bloc' && ['understand','receive'].includes(target.step.kind) && !selected.has(key(target.pairId, target.entry.id))) selected.set(key(target.pairId, target.entry.id), target);
    const blocks = [...selected.values()];
    const pack=ensureProjection().actual, reservedIds=new Set();
    for(const pair of pack[PREFIX+'manifest.json'].pairs)for(const level of pair.levels){const cell=pack['melunga_deploy/'+level.dataPath];for(const phrase of [...(cell.reserve||[]),...(cell.heldThemes||[]).flatMap(t=>t.phrases)])reservedIds.add(key(pair.id,phrase.id));}
    const allBlocks=loadLedger().registry.corrections.filter(e=>e.kind==='bloc'),reservedBlocks=allBlocks.filter(e=>!selected.has(key(e.pairId,e.id)));
    for(const entry of reservedBlocks)assert.ok(reservedIds.has(key(entry.pairId,entry.id)),'a non-displayed accepted block is retained in the exact current reserve');
    assert.equal(allBlocks.length,159);assert.equal(blocks.length+reservedBlocks.length,159,'all accepted whole studies are either shown or explicitly reserved');
    report.activeCanonicalBlocks=blocks.filter(t=>t.step.kind!=='receive').length;report.receivedOnlyBlocks=blocks.filter(t=>t.step.kind==='receive').length;report.reservedBlocks=reservedBlocks.length;
    report.classificationActive=!!pack[PREFIX+'manifest.json'].allClassification;
    if(!report.classificationActive){assert.equal(blocks.length,155);assert.equal(report.activeCanonicalBlocks,154);assert.equal(report.receivedOnlyBlocks,1);assert.equal(report.reservedBlocks,4);}
    // Longest native-only forms and every corrected receive-only model also get
    // viewport checks, in addition to every displayed accepted changed study.
    // Current classification reserves are counted explicitly, never silently skipped.
    for (const pair of new Set(all.map(t => t.pairId))) {
      const longest = all.filter(t => t.pairId === pair && t.entry.kind === 'glose' && ['understand','receive'].includes(t.step.kind)).sort((a,b) => b.phrase.native.length - a.phrase.native.length)[0]; if (longest) selected.set(key(longest.pairId,longest.entry.id),longest);
    }
    for (const target of all) if (target.step.kind === 'receive') selected.set(key(target.pairId,target.entry.id),target);
    const targets = [...selected.values()].sort((a,b) => a.pairId.localeCompare(b.pairId) || a.level-b.level || a.themeIndex-b.themeIndex || a.stepIndex-b.stepIndex);
    for (const viewport of report.viewports) {
      const {context,page} = await open(viewport); let previous;
      try {for (const target of targets) {await enter(page,target,previous); await checkModel(page,target,true); previous = target;}}
      finally {await context.close();}
    }
    report.checks.push('whole-block-dom-and-fit');
  });
  test('all seven pairs and lesson step kinds retain current fields, recall reveal and receive-only behavior', {timeout: 90000}, async () => {
    const selected = new Map();
    for (const target of fixtures()) {const identity = target.pairId + '/' + target.step.kind; if (!selected.has(identity)) selected.set(identity,target);}
    const {context,page} = await open({width:390,height:844});
    try {for (const target of selected.values()) {await enter(page,target); await checkModel(page,target,false);}}
    finally {await context.close();}
    report.stepKinds = [...new Set([...selected.values()].map(t => t.step.kind))].sort(); report.pairs = [...new Set([...selected.values()].map(t => t.pairId))].sort();
    assert.equal(report.pairs.length,7); assert.deepEqual(report.stepKinds,['choose-and-recall','imitate','receive','understand']);
    report.checks.push('pairs-and-step-kinds');
  });
}
