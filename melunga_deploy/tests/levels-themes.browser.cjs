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
const {execFileSync} = require('node:child_process');
const {test, before, after} = require('node:test');
const {chromium} = require('playwright-core');
const phoneticCorrections = require('./phonetic-corrections.cjs');
const allClassification = require('./all-classification.cjs');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'content/niveaux-progressifs');
const manifest = JSON.parse(fs.readFileSync(path.join(DATA, 'manifest.json')));
const visualRegistry = JSON.parse(fs.readFileSync(path.resolve(ROOT, '../docs/niveaux-progressifs/visuels.json')));
const authoredPath = path.resolve(ROOT, '../docs/niveaux-progressifs/corrections-themes/enrichissements-rediges.json');
const authored = JSON.parse(fs.readFileSync(authoredPath));
const situationDirectory = path.resolve(ROOT, '../docs/niveaux-progressifs/enrichissement-situations');
const situationPlanPath = path.join(situationDirectory, 'plan.json');
const situationPlan = JSON.parse(fs.readFileSync(situationPlanPath));
const baseSituationPlanPath = path.join(situationDirectory, 'plan-base10.json');
const baseSituationPlan = JSON.parse(fs.readFileSync(baseSituationPlanPath));
const situationLedgers = new Map(manifest.pairs.map(pair => {
  const file = path.join(situationDirectory, pair.id + '.json');
  const extensionFile = path.join(situationDirectory, 'extension-' + pair.id + '.json');
  const data = JSON.parse(fs.readFileSync(file));
  const extensionData = JSON.parse(fs.readFileSync(extensionFile));
  return [pair.id, {file, data, extensionFile, extensionData,
    items: [...data.items, ...extensionData.items],
    documents: [{file, data}, {file: extensionFile, data: extensionData}]}];
}));
function canonicalJson(value) {
  if (Array.isArray(value)) return '[' + value.map(canonicalJson).join(',') + ']';
  if (value && typeof value === 'object') return '{' + Object.keys(value).sort()
    .map(key => JSON.stringify(key) + ':' + canonicalJson(value[key])).join(',') + '}';
  return JSON.stringify(value);
}
function sha256(value) { return crypto.createHash('sha256').update(value).digest('hex'); }
let rawLedgerItemHashes;
function ledgerItemHashes() {
  if (rawLedgerItemHashes) return rawLedgerItemHashes;
  // The source contract uses Python JSON types: 1.0 and 1 have different
  // canonical bytes. JSON.parse would erase this distinction in audit metadata.
  // Read the original ledgers independently with the contract's numeric types.
  const program = [
    'import json,hashlib,sys', 'result={}',
    'for name in sys.argv[1:]:',
    ' with open(name,encoding="utf-8") as stream: document=json.load(stream)',
    ' for category in ("items","receivedTurns","lexicalSupports"):',
    '  for row in document.get(category,[]):',
    '   assert row["id"] not in result, "Duplicate raw ledger item"',
    '   raw=json.dumps(row,ensure_ascii=False,sort_keys=True,separators=(",",":"),allow_nan=False).encode("utf-8")',
    '   result[row["id"]]=hashlib.sha256(raw).hexdigest()',
    'print(json.dumps(result,ensure_ascii=False))'
  ].join('\n');
  const files = [...situationLedgers.values()].flatMap(ledger => ledger.documents.map(document => document.file));
  rawLedgerItemHashes = JSON.parse(execFileSync('python3', ['-c', program, ...files], {encoding: 'utf8', maxBuffer: 8 * 1024 * 1024}));
  return rawLedgerItemHashes;
}
function situationInputs() {
  const files = new Set([situationPlanPath, baseSituationPlanPath, path.join(ROOT, 'maquette-guidee.js'),
    path.join(ROOT, 'maquette-guidee.css'), path.join(ROOT, 'parcours-niveaux.html'),
    path.join(ROOT, 'maquette-guidee.html'), path.join(ROOT, 'content/maquette-guidee.json'), __filename,
    path.join(ROOT, 'app.html'), path.join(situationDirectory, 'catalogue.json'),
    path.resolve(ROOT, '../docs/niveaux-progressifs/visuels.json')]);
  for (const file of phoneticCorrections.inputFiles()) files.add(file);
  for (const asset of [...visualRegistry.levels, ...visualRegistry.vocabularyAtlases,
    ...visualRegistry.grammarAtlases, ...visualRegistry.correctionAtlases, ...visualRegistry.situationAtlases]) {
    files.add(path.join(ROOT, asset.asset));
  }
  for (const ledger of situationLedgers.values()) for (const {file, data} of ledger.documents) {
    files.add(file);
    for (const item of [...data.items, ...(data.receivedTurns || []), ...(data.lexicalSupports || [])]) {
      if (item.kind === 'conversation-whole-entry') files.add(path.resolve(ROOT, '..', item.source.path));
    }
  }
  const catalogue = JSON.parse(fs.readFileSync(path.join(situationDirectory, 'catalogue.json')));
  if (catalogue.searchIndexPath) files.add(path.resolve(ROOT, '..', catalogue.searchIndexPath));
  for (const key of ['baselinePath', 'baseProtectionPath', 'protectedBaselinePath']) {
    if (catalogue[key]) files.add(path.resolve(ROOT, '..', catalogue[key]));
  }
  return Object.fromEntries([...files].sort().map(file => [path.relative(path.resolve(ROOT, '..'), file), sha256(fs.readFileSync(file))]));
}
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
  speechMechanism: 'mock speechSynthesis: whole study text dispatch and reveal behavior, not human audio or linguistic phonetic validation',
  publicSiteChecked: false, nativeOrPedagogicalValidation: false,
  widths: [320, 390, 1440], cellViews: 0, themeEntries: 0, domSteps: 0,
  runtimeJsonFieldsCompared: 0, templateSteps: 0, preparationSteps: 0, reserveCardsTracked: 0,
  heldCardsTracked: 0, canonicalCardsTracked: 0, reviewSteps: 0, reviewReferencesTracked: 0,
  contextReuseSteps: 0, contextReferencesTracked: 0,
  additionalSituationViews: 0, additionalSituationCases: [], additionalWholeUtterancesChecked: 0,
  additionalSourceFieldsCompared: 0, additionalAudioChecks: 0, additionalRecallChecks: 0,
  additionalReadModelFieldsCompared: 0, additionalAudioByKind: {},
  receivedDomSteps: 0, receivedAudioChecks: 0, receivedFieldsCompared: 0,
  receivedProductionCounterChecks: 0, receivedPreparedAnswerChecks: 0,
  lexicalSupportReferencesChecked: 0,
  adnominalHelpChecks: 0,
  authoredEntriesChecked: 0, authoredPhoneticReviewStatus: 'pending-Claude',
  renderedStepsByType: {}, failures: [],
  checks: [], manifestSha256: crypto.createHash('sha256').update(fs.readFileSync(path.join(DATA, 'manifest.json'))).digest('hex'),
  cellBundleSha256: cellBundleSha256(),
  repertoireBundleSha256: repertoireBundleSha256(),
  authoredSourceSha256: crypto.createHash('sha256').update(fs.readFileSync(authoredPath)).digest('hex'),
  situationInputsSha256: situationInputs(),
  situationPlanSha256: sha256(fs.readFileSync(situationPlanPath)),
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
  report.situationInputsStableDuringRun = canonicalJson(situationInputs()) === canonicalJson(report.situationInputsSha256);
  if (!report.situationInputsStableDuringRun) report.failures.push({check: 'situation-input-stability', error: 'Situation plan, language ledgers, snapshots, renderer or visual registry changed while the suite was running.'});
  const expectedCases = situationPlan.themes.length * manifest.pairs.length;
  const expectedPositions = expectedCases * 8;
  const expectedReceived = situationPlan.receivedTurnsDefs.length * manifest.pairs.length;
  report.completeMatrixCoverage = report.cellViews === 210 && report.additionalSituationCases.length === expectedCases
    && report.additionalWholeUtterancesChecked === expectedPositions && report.additionalWholeSourceAudit?.intentPositions === expectedPositions
    && report.receivedSourceAudit?.positions === expectedReceived && report.receivedDomSteps >= expectedReceived;
  report.requiredChecks = ['matrix-320', 'matrix-390', 'matrix-1440', 'additional-situation-whole-source-and-intents',
    'lexical-family-priority', 'authored-source-and-bank-conservation', 'ja-ko-semantic-routing-regressions',
    'fetch-races-and-retry', 'initial-load-retries', 'repertoire-loading-and-retry', 'same-level-context-reuse',
    'context-reference-guards-and-retry', 'repertoire-reference-guards', 'repertoire-pair-race',
    'menu-palette-targets', 'legacy-v1-compatibility', 'photo-atlases-and-network-isolation',
    'received-and-lexical-source-contract', 'received-reference-guards-and-retry'];
  report.completeSuiteCoverage = report.completeMatrixCoverage && report.requiredChecks.every(check => report.checks.includes(check));
  report.status = report.failures.length ? 'failed' : report.completeSuiteCoverage ? 'passed' : 'partial';
  report.executedAt = new Date().toISOString();
  const destination = process.env.LEVELS_BROWSER_REPORT;
  if (destination) {
    fs.writeFileSync(destination, JSON.stringify(report, null, 2) + '\n');
    const audit = report.additionalWholeSourceAudit || {};
    const text = [
      '# Vérification navigateur du parcours local', '',
      'Exécution : `' + report.executedAt + '` — statut **' + report.status + '**.', '',
      'Chromium local, largeurs 320, 390 et 1440 px. Ces vues émulent des écrans ; aucun téléphone physique ni site déployé n’a été testé par cette suite.', '',
      '- Contrôles réussis : ' + report.checks.length + ' / ' + report.requiredChecks.length + '.',
      '- Matrice : ' + report.cellViews + ' vues de cellules ; ' + report.themeEntries + ' entrées de thèmes ; ' + report.domSteps + ' étapes DOM.',
      '- Nouvelles situations : ' + report.additionalSituationCases.length + ' cas couple/thème, ' + report.additionalWholeUtterancesChecked + ' positions de phrases entières distinctes vérifiées.',
      '- Répartition de ces positions : ' + (audit.primaryPositions ?? 'non terminé') + ' premières rencontres et ' + (audit.contextualReuses ?? 'non terminé') + ' réemplois ; aucun réemploi compté comme révision.',
      '- Sources du lot : ' + report.additionalSourceFieldsCompared + ' comparaisons de champs entiers, dont contrôle de l’absence de lecture lorsqu’elle n’existe pas.',
      '- Affichage du lot : ' + report.additionalReadModelFieldsCompared + ' comparaisons de champs dans le DOM ; ' + report.additionalRecallChecks + ' rappels contrôlés.',
      '- Audio simulé : ' + report.additionalAudioChecks + ' envois du texte étudié entier ; la phonétique n’est pas utilisée comme texte TTS.',
      '- Interlocuteurs : ' + (report.receivedSourceAudit?.positions ?? 'non terminé') + ' positions sourcées, ' + report.receivedDomSteps + ' affichages contrôlés ; ' + report.receivedPreparedAnswerChecks + ' preuves de réponse préparée ; ' + report.receivedProductionCounterChecks + ' contrôles d’exclusion de la progression de production.',
      '- Soutiens lexicaux : ' + (report.lexicalSupportSourceAudit?.positions ?? 'non terminé') + ' positions sourcées, séparées des étapes de production de phrase.',
      '- Gardes du réemploi : ' + (report.contextGuardResults?.length || 0) + ' corruptions refusées, puis correction et rechargement de banque contrôlés.',
      '- Gardes des reçus : ' + (report.receivedGuardResults?.length || 0) + ' corruptions refusées, puis banque corrigée rechargée.',
      '- Visuels : ' + (report.visualRegistryChecked?.slots ?? 'non terminé') + ' emplacements et ' + (report.visualRegistryChecked?.atlases ?? 'non terminé') + ' atlas vérifiés.', '',
      'Le masquage conserve le sens ; l’oreille révèle explicitement le modèle et le bouton de fond ne le révèle pas. Les contrôles de révision ordinaire, de chargements concurrents, de reprise après erreur, du menu et de la page L1 v1 sont conservés dans la suite.', '',
      'Fraîcheur : les empreintes avant/après des cellules, banques, manifeste, sources rédigées, plan, ledgers, snapshots de conversation, catalogue/index, HTML, CSS, JavaScript, suite de tests et images sont enregistrées dans le JSON. Une exécution partielle ne reçoit pas le statut passed.', '',
      'Le TTS est remplacé par un témoin d’envoi : cette suite vérifie le texte transmis et le comportement d’écoute, pas le son réel ni la justesse linguistique des aides. Claude vérifie la phonétique ; les résultats ne sont pas une mesure d’acquisition.', '',
      'Rapport détaillé : [' + path.basename(destination) + '](' + path.basename(destination) + ').',
      'Plan : `' + report.situationPlanSha256 + '`.',
      'Manifeste : `' + report.manifestSha256 + '`.', ''
    ];
    if (report.failures.length) text.push('Échecs :', '', ...report.failures.map(failure => '- ' + failure.check + ' : ' + failure.error), '');
    fs.writeFileSync(destination.replace(/\.json$/i, '') + '.md', text.join('\n'));
  }
  assert.equal(report.cellBundleStableDuringRun, true, 'stable cell bundle during browser tests');
  assert.equal(report.manifestStableDuringRun, true, 'stable manifest during browser tests');
  assert.equal(report.repertoiresStableDuringRun, true, 'stable repertoire banks during browser tests');
  assert.equal(report.authoredSourceStableDuringRun, true, 'stable authored master during browser tests');
  assert.equal(report.situationInputsStableDuringRun, true, 'stable situation inputs and renderer during browser tests');
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
function historicalCell(pair, level) {
  const filename = path.join(DATA, pair, 'L' + level + '.json');
  return allClassification.beforeRead(filename, JSON.parse(fs.readFileSync(filename)));
}
function historicalRepertoire(pairId) {
  const metadata = manifest.pairs.find(pair => pair.id === pairId);
  const filename = path.join(ROOT, metadata.repertoirePath);
  return allClassification.beforeRead(filename, JSON.parse(fs.readFileSync(filename)));
}
function reviewFixture(pairId) {
  for (let level = 2; level <= 10; level++) {
    const data = cell(pairId, level);
    const themeIndex = data.themes.findIndex(theme => theme.reviewReferences?.length);
    if (themeIndex >= 0) return {data, level, themeIndex, reference: data.themes[themeIndex].reviewReferences[0]};
  }
  throw new Error('No review fixture for ' + pairId);
}
function contextFixture(pairId, {sameLevel = false} = {}) {
  for (let level = 2; level <= 6; level++) {
    const data = cell(pairId, level);
    const themeIndex = data.themes.findIndex(theme => theme.isAdditionalSituation &&
      theme.contextReferences?.some(reference => !sameLevel || reference.firstEditorialLevel === level));
    if (themeIndex >= 0) {
      const theme = data.themes[themeIndex];
      return {data, level, themeIndex, reference: theme.contextReferences.find(reference => !sameLevel || reference.firstEditorialLevel === level)};
    }
  }
  throw new Error('No ' + (sameLevel ? 'same-level ' : '') + 'context fixture for ' + pairId);
}
function receivedFixture(pairId) {
  for (let level = 1; level <= 10; level++) {
    const data = cell(pairId, level);
    const themeIndex = data.themes.findIndex(theme => theme.receivedTurns?.some(turn => turn.beforeIntentId)
      && theme.receivedTurns.some(turn => turn.afterIntentId) && theme.lexicalSupports?.length);
    if (themeIndex >= 0) return {data, level, themeIndex};
  }
  throw new Error('No complete received cycle for ' + pairId);
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
  allClassification.auditRuntime(); // validates the exact frozen policy before any finite auditor exception
  const additionalThemes = situationPlan.themes.filter(theme => theme.level === expected.level);
  return page.evaluate(({expected, bank, exhaustive, additionalThemes, classification}) => {
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
    if (reserve.some(phrase => !['incomplete', 'review'].includes(phrase.contentType) && !([...(classification?.reserveIds || []), ...(classification?.hiddenThemeReserveIds || [])].includes(phrase.id) && ['to-reserve', 'hide-theme-to-reserve'].includes(phrase.classification?.operation) && phrase.classification.registrySha256 === classification.registrySha256))) throw new Error('active content leaked into reserve');
    if (active.some(phrase => reserveIds.has(phrase.id) || !['utterance', 'vocabulary', 'number'].includes(phrase.contentType))) throw new Error('reserve leaked into active themes');
    const learnable = (bank?.phrases || []).filter(phrase => !phrase.canonicalReserveLocation);
    const bankPhrases = new Map(learnable.map(phrase => [phrase.id, phrase]));
    const canonicalPhrases = new Map([...learnable, ...active].map(phrase => [phrase.id, phrase]));
    const receivedModels = new Map((bank?.receivedModels || []).map(phrase => [phrase.id, phrase]));
    const allModels = new Map([...receivedModels, ...canonicalPhrases]);
    const additional = expected.themes.filter(theme => theme.isAdditionalSituation);
    eq(additional.length, additionalThemes.length, 'new situation count at this level');
    eq(JSON.stringify(additional.map(theme => theme.id).sort()),
      JSON.stringify(additionalThemes.map(theme => theme.themeId).sort()), 'new situation identities follow the frozen plan');
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
    let contextSteps = 0, contextReferences = 0, additionalAudio = 0, additionalRecall = 0, additionalFields = 0;
    let receivedSteps = 0, receivedAudio = 0, receivedFields = 0, receivedCounterChecks = 0, preparedAnswerChecks = 0, lexicalSupportChecks = 0;
    const additionalAudioByKind = {};
    const situationCases = [];
    const renderedByType = {};
    expected.themes.forEach((theme, i) => {
      // showThemes replaces the buttons after every back action.
      const tile = document.querySelectorAll('#mgThemeGrid > button')[i];
      eq(tile.querySelector('.mg-theme-title').textContent, theme.title, 'theme title');
      eq(tile.querySelector('.mg-theme-number').textContent, String(i + 1).padStart(2, '0'), 'ordinal');
      const references = theme.reviewReferences || [];
      const reviews = new Set(references.map(reference => reference.id));
      const contextual = theme.contextReferences || [];
      const mixed = classification?.mixedThemes.find(t => t.level === expected.level && t.id === theme.id);
      const thin = classification?.smallThemeExceptions.find(t => t.level === expected.level && t.id === theme.id);
      const extension = classification?.situationExtensions.find(t => t.level === expected.level && t.id === theme.id);
      const classificationExtras = new Set(extension?.addedIds || []);
      const typedExtensions = (classification?.typedSituationExtensions || []).filter(item => item.themeId === theme.id);
      const typedIds = new Set(typedExtensions.map(item => item.id));
      eq(JSON.stringify(theme.classificationTypedExtensionIds || []), JSON.stringify([...typedIds]), 'exact finite typed tail');
      if (typedExtensions.some(item => !classificationExtras.has(item.id)
          || theme.phrases.find(phrase => phrase.id === item.id)?.contentType !== item.contentType)) throw new Error('unbound typed extension');
      const contextIds = new Set(contextual.map(reference => reference.id));
      const aliases = (classification?.contextPrimaryAliases || []).filter(alias => alias.themeId === theme.id);
      const retainedCoreIds = new Set((classification?.outboundCoreContextReuses || []).filter(item => item.themeId === theme.id).map(item => item.id));
      const newIds = new Set(theme.phrases.map(phrase => phrase.id));
      eq(theme.newCount, newIds.size, 'new count excludes reviews');
      eq(theme.reviewCount, reviews.size, 'review count');
      eq(theme.reuseCount || 0, [...contextIds].filter(id => !newIds.has(id)).length, 'context reuse count');
      eq(theme.presentedCount, new Set([...newIds, ...reviews, ...contextIds]).size, 'presentation count distinguishes first introduction/revision/context reuse');
      const minimum = thin ? thin.minimum : 6;
      if (thin) {eq(thin.presentedCount, theme.presentedCount, 'finite small-theme exception count'); if (minimum < 1) throw new Error('zero minimum exception');}
      if (theme.presentedCount < minimum) throw new Error('visible theme below reviewed minimum');
      if (!Number.isInteger(theme.pedagogicalConceptCount) || theme.pedagogicalConceptCount < minimum) throw new Error('visible theme declares fewer than reviewed concepts');
      let countLabel = quantity(theme.presentedCount, theme.contentType);
      if (theme.reviewCount) countLabel += expected.nativeLanguage === 'zh' ? ' · 其中 ' + theme.reviewCount + ' 项复习' : ' · ' + theme.reviewCount + (theme.reviewCount === 1 ? ' révision' : ' révisions');
      if (theme.reuseCount) countLabel += expected.nativeLanguage === 'zh' ? ' · 其中 ' + theme.reuseCount + ' 项情境复用' : ' · ' + theme.reuseCount + (theme.reuseCount === 1 ? ' réemploi' : ' réemplois');
      if (theme.optional) countLabel += expected.nativeLanguage === 'zh' ? ' · 可选' : ' · Facultatif';
      eq(tile.querySelector('.mg-theme-count').textContent, countLabel, 'theme counter with explicit revisions');
      for (const reference of references) {
        const phrase = bankPhrases.get(reference.id);
        if (!phrase || newIds.has(reference.id)) throw new Error('review is missing or a duplicate primary');
        eq(reference.firstEditorialLevel, phrase.canonicalLocation.level, 'review first level');
        if (reference.firstEditorialLevel >= expected.level) throw new Error('future review');
        eq(reference.canonicalThemeId, phrase.canonicalLocation.themeId, 'review first theme');
        eq(phrase.canonicalLocation.pairId, expected.id, 'review belongs to this pair');
        if (mixed) { if (!mixed.contentTypes.includes(phrase.contentType)) throw new Error('review has unapproved mixed type'); }
        else eq(phrase.contentType, theme.contentType, 'review preserves content type');
        eq(phrase.placement.domain, theme.domain, 'review preserves family');
        if (reserveIds.has(reference.id)) throw new Error('reserve became a review');
      }
      reviewReferences += references.length;
      for (const reference of contextual) {
        const phrase = bankPhrases.get(reference.id);
        if (!theme.isAdditionalSituation || !phrase || newIds.has(reference.id) && !aliases.some(alias => alias.id === reference.id && alias.intentId === reference.intentId) || reviews.has(reference.id)) throw new Error('context reuse is missing, mixed with review or a duplicate primary');
        eq(reference.firstEditorialLevel, phrase.canonicalLocation.level, 'context reuse first level');
        if (reference.firstEditorialLevel > expected.level) throw new Error('future context reuse');
        eq(reference.canonicalThemeId, phrase.canonicalLocation.themeId, 'context reuse first theme');
        eq(phrase.canonicalLocation.pairId, expected.id, 'context reuse belongs to this pair');
        eq(phrase.contentType, 'utterance', 'context reuse is a whole utterance');
        if (!theme.intentIds.includes(reference.intentId) || !reference.reason) throw new Error('context reuse is not bound to a declared intent');
        if (reserveIds.has(reference.id)) throw new Error('reserve became a context reuse');
        const local = active.find(candidate => candidate.id === reference.id);
        if (local) for (const field of ['study', 'native', 'phon', 'reading']) eq(phrase[field], local[field], 'same-level reuse keeps canonical ' + field);
      }
      contextReferences += contextual.length;
      if (mixed) {
        eq(theme.contentType, 'mixed', 'only registered themes may declare mixed content');
        eq(JSON.stringify(theme.contentTypes), JSON.stringify(mixed.contentTypes), 'exact reviewed mixed content types');
        eq(JSON.stringify(theme.phrases.map(phrase => phrase.id)), JSON.stringify(mixed.phraseIds), 'exact reviewed mixed primary identities');
        if (!['situations', 'vocabulary'].includes(theme.section)) throw new Error('unapproved mixed theme section');
      } else {
        if (!['utterance', 'vocabulary', 'number'].includes(theme.contentType)) throw new Error('invalid theme type');
        eq(theme.section, theme.contentType === 'utterance' ? 'situations' : 'vocabulary', 'theme section');
      }
      if (theme.phrases.some(phrase => phrase.isTemplate || phrase.contentType !== theme.contentType && !(mixed?.phraseIds.includes(phrase.id) && mixed.contentTypes.includes(phrase.contentType)))) throw new Error('unregistered mixed or incomplete theme ' + theme.id);
      if (theme.contentType === 'vocabulary' || mixed) {
        for (const phrase of theme.phrases.filter(phrase => phrase.contentType === 'vocabulary')) if (phrase.lexicalClass && !['adjective', 'preposition', 'adverb', 'color', 'other', 'uncertain'].includes(phrase.lexicalClass)) throw new Error('invalid lexical family');
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
      const receivedUses = new Map((theme.receivedTurns || []).map(turn => [turn.id, turn]));
      const preparedAnswers = new Map();
      const seenReceived = new Set();
      for (const [index, step] of allSteps.entries()) {
        if (step.kind !== 'receive') {
          if (['understand', 'imitate'].includes(step.kind)) {
            if (!preparedAnswers.has(step.utterance)) preparedAnswers.set(step.utterance, new Map());
            preparedAnswers.get(step.utterance).set(step.kind, step.id);
          }
          continue;
        }
        const turn = receivedUses.get(step.receivedId);
        if (!turn || seenReceived.has(turn.id)) throw new Error('missing or repeated interlocutor use');
        if (!receivedModels.has(step.utterance)) throw new Error('interlocutor model absent from dedicated bank');
        eq(step.analyse, false, 'received is not analysed');
        eq(step.countsForProgress, false, 'received excluded from production progress');
        eq(step.requiresProduction, false, 'received never assigned to learner production');
        if (step.isPreparation || step.isReview || step.isContextReuse) throw new Error('received turn mislabeled as learner preparation/review/reuse');
        eq(JSON.stringify(step.role), JSON.stringify(turn.role), 'received localized usage role');
        eq(JSON.stringify(step.answerWith), JSON.stringify(turn.answerWith), 'received answer intent list');
        for (const id of turn.answerWithUtteranceIds) {
          const prior = preparedAnswers.get(id);
          if (!prior?.has('understand') || !prior?.has('imitate')) throw new Error('interlocutor asks for an unprepared response');
          eq(step.preparedAnswerSteps[id].understoodInStep, prior.get('understand'), 'prepared understanding witness');
          eq(step.preparedAnswerSteps[id].imitatedInStep, prior.get('imitate'), 'prepared imitation witness');
          preparedAnswerChecks++;
        }
        const recall = turn.beforeIntentId ? allSteps[index + 1] : allSteps[index - 1];
        if (!recall || !['choose-and-recall', 'reply-without-model', 'recall'].includes(recall.kind)) throw new Error('interlocutor detached from real recall');
        eq(recall.utterance, turn.prepares, 'received immediately adjacent to its prepared response');
        if (turn.afterIntentId) eq(turn.answerWith.length, 0, 'closure explicitly answers no new learner task');
        seenReceived.add(turn.id);
      }
      eq(seenReceived.size, receivedUses.size, 'every received usage is heard once');
      for (const support of theme.lexicalSupports || []) {
        const model = canonicalPhrases.get(support.utterance || support.id);
        if (!model || !['vocabulary', 'number'].includes(model.contentType)) throw new Error('lexical support missing or not autonomous');
        if (support.firstEditorialLevel > expected.level) throw new Error('future word mislabeled as prepared lexical support');
        if (!theme.intentIds.includes(support.introducedBeforeIntentId)) throw new Error('word support is unbound to theme intent');
        eq(support.analyse, false, 'word support is not an automatic sentence exercise');
        eq(support.countsTowardProductionProgression, false, 'word support does not inflate learner phrase progression');
        eq(support.insertedIntoPhraseSteps, false, 'word remains outside sentence steps');
        if ((primaryIds.includes(model.id) || allSteps.some(step => step.utterance === model.id)) && !typedIds.has(model.id)) throw new Error('isolated word entered situation practice');
        lexicalSupportChecks++;
      }
      if (theme.isAdditionalSituation) {
        const planned = additionalThemes.find(candidate => candidate.themeId === theme.id);
        if (!planned) throw new Error('new situation is absent from the frozen plan');
        eq(theme.contentType, mixed ? 'mixed' : 'utterance', 'additional situation type is ordinary utterance or its finite registered extension');
        eq(theme.section, 'situations', 'new situation section');
        eq(theme.visualId, planned.visualId, 'new situation photo identity');
        eq(theme.title, planned.title[expected.nativeLanguage], 'localized new situation title');
        const expectedIntentOrder = planned.intents.map(intent => intent.id);
        eq(JSON.stringify(theme.intentIds), JSON.stringify(expectedIntentOrder), 'eight intents preserve their planned order');
        const intentForPhrase = id => contextual.find(reference => reference.id === id)?.intentId
          || (() => { const phrase = theme.phrases.find(phrase => phrase.id === id); return phrase?.situationIntentId || phrase?.intentId; })();
        const plannedIds = primaryIds.filter(id => !classificationExtras.has(id));
        eq(JSON.stringify(primaryIds.slice(8)), JSON.stringify(extension?.addedIds || []), 'classification additions follow the eight original intents');
        const presentedIntentOrder = plannedIds.map(intentForPhrase);
        eq(JSON.stringify(presentedIntentOrder), JSON.stringify(expectedIntentOrder), 'main phrase order follows intentions 01 to 08, mixing primaries and context reuse');
        for (const kinds of [['understand'], ['imitate'], ['choose-and-recall', 'reply-without-model', 'recall']]) {
          const phaseOrder = allSteps.filter(step => !step.isPreparation && !classificationExtras.has(step.utterance) && kinds.includes(step.kind)).map(step => intentForPhrase(step.utterance));
          eq(JSON.stringify(phaseOrder), JSON.stringify(expectedIntentOrder), 'planned intent order within phase ' + kinds.join('/'));
        }
        eq(theme.intentIds.length, 8, 'eight new situation intents');
        eq(theme.reviewCount, 0, 'a context reuse is not relabeled as a revision');
        eq(primaryIds.length, 8 + classificationExtras.size, 'eight planned positions plus exact classification additions');
        eq(new Set(plannedIds).size, 8, 'eight unique planned canonical phrases per new situation');
        const forms = plannedIds.map(id => canonicalPhrases.get(id)?.study?.normalize('NFKC').toLocaleLowerCase()
          .replace(/\p{P}/gu, '').replace(/\s+/gu, ' ').trim());
        if (forms.some(form => !form)) throw new Error('new situation contains an empty whole phrase');
        eq(new Set(forms).size, 8, 'eight distinct whole utterances, not punctuation variants');
        if (primaryIds.some(id => canonicalPhrases.get(id)?.isTemplate || canonicalPhrases.get(id)?.contentType !== 'utterance' && !classificationExtras.has(id))) throw new Error('lexical or open fragment in a new situation');
        situationCases.push({pair: expected.id, level: expected.level, topicId: planned.id,
          themeId: theme.id, intentIds: [...theme.intentIds], newCount: theme.newCount,
          reuseCount: theme.reuseCount || 0, reviewCount: theme.reviewCount,
          uniqueWholeUtterances: forms.length, presentedCount: theme.presentedCount,
          receivedTurns: receivedUses.size, lexicalSupports: (theme.lexicalSupports || []).length,
          sameLevelReuses: contextual.filter(reference => reference.firstEditorialLevel === expected.level).length,
          presentedIntentOrder, threePhaseOrdersChecked: true});
      }
      let startedNew = false;
      for (const step of allSteps) {
        if (step.isReview && startedNew) throw new Error('review returns after introducing new content');
        if (!step.isReview && !step.isPreparation) startedNew = true;
      }
      for (const id of reviews) {
        const kinds = allSteps.filter(step => step.utterance === id).map(step => step.kind);
        if (!kinds.includes('understand') || !kinds.includes('imitate') || !kinds.some(kind => ['choose-and-recall', 'reply-without-model', 'recall'].includes(kind))) throw new Error('review omits a complete hear/imitate/recall cycle');
      }
      for (const id of contextIds) {
        const reuseSteps = allSteps.filter(step => step.utterance === id);
        if (reuseSteps.some(step => step.isContextReuse !== !retainedCoreIds.has(id) || step.isReview)) throw new Error('context reuse cycle is not explicitly marked');
        const kinds = reuseSteps.map(step => step.kind);
        if (!kinds.includes('understand') || !kinds.includes('imitate') || !kinds.some(kind => ['choose-and-recall', 'reply-without-model', 'recall'].includes(kind))) throw new Error('context reuse omits a complete hear/imitate/recall cycle');
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
          if (references.some(id => reserveIds.has(id) && !(step.kind === 'receive' && receivedModels.get(id)?.heardOnly && receivedModels.get(id)?.canonicalReserveLocation))) throw new Error('reserve became an exercise ' + step.id);
          if ((theme.contentType === 'utterance' || theme.isAdditionalSituation && references.some(id => !classificationExtras.has(id)))
              && references.some(id => allModels.get(id)?.contentType !== 'utterance')) throw new Error('lexeme became a situation exercise ' + step.id);
        }
      });
      // At 390px check every rendered step/field. Other widths exercise each theme entry.
      const limit = exhaustive ? allSteps.length : Math.min(allSteps.length, theme.sequences[0].steps.length);
      for (let index = 0; index < limit; index++) {
        const step = allSteps[index];
        const phrase = allModels.get(step.utterance || step.choices?.[0]);
        if (!phrase) throw new Error('Unresolved step ' + step.id);
        eq(state().stepIndex, index, 'step index');
        eq(state().phraseId, phrase.id, 'phrase identity');
        const received = step.kind === 'receive';
        const review = !received && reviews.has(phrase.id);
        const contextReuse = !received && contextIds.has(phrase.id) && !retainedCoreIds.has(phrase.id);
        eq(!!step.isReview, review, 'review step is explicitly marked');
        eq(!!step.isContextReuse, contextReuse, 'context reuse step is explicitly marked');
        eq(byId('mgLessonTheme').textContent, String(i + 1).padStart(2, '0') + ' · ' + theme.title
          + (review ? expected.nativeLanguage === 'zh' ? ' · 复习' : ' · Révision'
            : contextReuse ? expected.nativeLanguage === 'zh' ? ' · 情境复用' : ' · Réemploi' : ''), 'explicit review/context-reuse badge');
        if (review) reviewSteps++;
        if (contextReuse) contextSteps++;
        if (reserveIds.has(state().phraseId) && !(received && receivedModels.get(state().phraseId)?.heardOnly && receivedModels.get(state().phraseId)?.canonicalReserveLocation)) throw new Error('reserve reached learner DOM/audio state');
        eq(byId('mgCounter').textContent, (primaryIds.indexOf(step.prepares || phrase.id) + 1) + ' / ' + primaryIds.length, 'primary-only lesson counter');
        const learnerStepCount = allSteps.filter(candidate => candidate.kind !== 'receive').length;
        const completedLearnerSteps = allSteps.slice(0, index + 1).filter(candidate => candidate.kind !== 'receive').length;
        const expectedProgress = completedLearnerSteps / learnerStepCount * 100;
        if (Math.abs(parseFloat(byId('mgProgress').style.width) - expectedProgress) > 0.001) throw new Error('interlocutor listening inflated learner progression');
        if (received) {
          eq(state().masked, false, 'received always displayed as comprehension');
          eq(byId('mgPhrase').hidden, false, 'whole received text visible');
          eq(byId('mgPhon').hidden, false, 'whole received aid visible');
          eq(byId('mgTranslation').hidden, false, 'whole received meaning visible');
          eq(byId('mgSpeaker').hidden, false, 'received role visible');
          eq(byId('mgSpeaker').textContent, step.role[expected.nativeLanguage], 'received role belongs to usage');
          eq(byId('mgPhaseIcon').getAttribute('aria-label'), expected.nativeLanguage === 'zh' ? '听对方说话' : 'Écouter l’autre', 'received listening phase');
          eq(byId('mgEar').hidden, false, 'received ear accessible');
          eq(byId('mgReplay').disabled, true, 'received turn cannot enter learner saved review');
          receivedSteps++; receivedCounterChecks++;
        } else eq(byId('mgSpeaker').hidden, true, 'interlocutor role does not leak into learner response');
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
        if (theme.isAdditionalSituation) additionalFields += 4;
        if (received) receivedFields += 4;
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
        } else if (index === 0 || theme.isAdditionalSituation && !state().masked) {
          byId('mgEar').click();
          eq(window.__speech.at(-1)?.text, phrase.study, 'TTS receives study text only');
          eq(window.__speech.at(-1)?.lang?.split('-')[0], expected.studyLanguage, 'TTS uses the studied language');
          if (received) {
            receivedAudio += 2;
            const spoken = window.__speech.length;
            byId('mgEar').click();
            eq(window.__speech.length, spoken + 1, 'received ear remains directly replayable');
            eq(window.__speech.at(-1)?.text, phrase.study, 'received replay speaks whole target-language text');
          }
          if (theme.isAdditionalSituation) {
            additionalAudio += received ? 2 : 1;
            const key = received ? 'received' : contextReuse ? 'context-reuse' : phrase.source.collection === 'situation-authored' ? 'new-authored' : 'existing-primary';
            additionalAudioByKind[key] = (additionalAudioByKind[key] || 0) + (received ? 2 : 1);
          }
        }
        if (state().masked) {
          eq(byId('mgPhrase').hidden, true, 'recall hides study');
          eq(byId('mgPhon').hidden, true, 'recall hides phonetic');
          eq(byId('mgTranslation').hidden, false, 'recall keeps meaning');
          const spoken = window.__speech.length;
          byId('mgPhonrow').click();
          eq(state().masked, true, 'phonetic background must not reveal');
          eq(window.__speech.length, spoken, 'phonetic background must not speak recalled model');
          byId('mgEar').click();
          eq(state().masked, false, 'explicit ear reveals recall');
          eq(window.__speech.at(-1)?.text, phrase.study, 'revealed TTS receives study text');
          eq(window.__speech.at(-1)?.lang?.split('-')[0], expected.studyLanguage, 'revealed TTS uses the studied language');
          if (theme.isAdditionalSituation) {
            additionalAudio++; additionalRecall++;
            const key = contextReuse ? 'context-reuse' : phrase.source.collection === 'situation-authored' ? 'new-authored' : 'existing-primary';
            additionalAudioByKind[key] = (additionalAudioByKind[key] || 0) + 1;
          }
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
    return {steps, fields, templates, preparations, reviewSteps, reviewReferences, usageChecks,
      contextSteps, contextReferences, situationCases, additionalAudio, additionalRecall, additionalFields,
      receivedSteps, receivedAudio, receivedFields, receivedCounterChecks, preparedAnswerChecks, lexicalSupportChecks,
      additionalAudioByKind, themes: expected.themes.length,
      renderedByType, reserved: reserve.length, held: held.length, canonical: combined.length};
  }, {expected, bank, exhaustive, additionalThemes, classification: manifest.allClassification?.pairs.find(pair => pair.pair === expected.id) || null});
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
        report.contextReuseSteps += result.contextSteps;
        report.additionalSituationViews += result.situationCases.length;
        report.additionalAudioChecks += result.additionalAudio;
        report.additionalRecallChecks += result.additionalRecall;
        report.additionalReadModelFieldsCompared += result.additionalFields;
        report.receivedDomSteps += result.receivedSteps;
        report.receivedAudioChecks += result.receivedAudio;
        report.receivedFieldsCompared += result.receivedFields;
        report.receivedProductionCounterChecks += result.receivedCounterChecks;
        report.receivedPreparedAnswerChecks += result.preparedAnswerChecks;
        report.lexicalSupportReferencesChecked += result.lexicalSupportChecks;
        for (const [kind, count] of Object.entries(result.additionalAudioByKind)) report.additionalAudioByKind[kind] = (report.additionalAudioByKind[kind] || 0) + count;
        report.adnominalHelpChecks += result.usageChecks;
        if (width === 390) {
          report.reserveCardsTracked += result.reserved; report.heldCardsTracked += result.held;
          report.canonicalCardsTracked += result.canonical; report.reviewReferencesTracked += result.reviewReferences;
          report.contextReferencesTracked += result.contextReferences;
          report.additionalSituationCases.push(...result.situationCases);
          report.additionalWholeUtterancesChecked += result.situationCases.reduce((sum, result) => sum + result.uniqueWholeUtterances, 0);
        }
        for (const [type, count] of Object.entries(result.renderedByType)) report.renderedStepsByType[type] = (report.renderedStepsByType[type] || 0) + count;
      }
    }
    assert.deepEqual(fixture.errors, []);
  } finally { await fixture.context.close(); }
}));

test('196 additional situations preserve 1568 whole source positions without inflating canonical entries', async () => checked('additional-situation-whole-source-and-intents', async () => {
  // Check the exact approved after-help, annotation and whole-card conservation
  // first. Only source comparisons below project back to the original whole aid;
  // the DOM matrix continues to expect the actual corrected runtime JSON.
  report.allClassificationAudit = allClassification.auditRuntime();
  report.phoneticCorrectionsSourceAudit = phoneticCorrections.auditRuntime();
  report.reviewedFieldCorrectionsSourceAudit = report.phoneticCorrectionsSourceAudit.lot3;
  report.lot4CorrectionsSourceAudit = report.phoneticCorrectionsSourceAudit.lot3.lot4;
  report.lot5CorrectionsSourceAudit = report.phoneticCorrectionsSourceAudit.lot3.lot4.lot5;
  report.lot6CorrectionsSourceAudit = report.lot5CorrectionsSourceAudit.lot6;
  report.lot7CorrectionsSourceAudit = report.lot6CorrectionsSourceAudit.lot7;
  report.lot8CorrectionsSourceAudit = report.lot7CorrectionsSourceAudit.lot8;
  report.lot9CorrectionsSourceAudit = report.lot8CorrectionsSourceAudit.lot9;
  const catalogue = JSON.parse(fs.readFileSync(path.join(situationDirectory, 'catalogue.json')));
  assert.equal(catalogue.status, 'ready-for-preview', 'the complete situation catalogue was frozen before generation');
  assert.equal(catalogue.planSha256, report.situationPlanSha256);
  const appSource = fs.readFileSync(path.join(ROOT, 'app.html'), 'utf8');
  const marker = 'var DECKS = ';
  const start = appSource.indexOf(marker);
  assert.ok(start >= 0, 'catalogue source marker');
  const end = appSource.indexOf('\n', start);
  const decks = JSON.parse(appSource.slice(start + marker.length, end < 0 ? undefined : end).trim().replace(/;$/, ''));
  const sourceFiles = new Map([...situationLedgers.values()].flatMap(ledger => ledger.documents)
    .flatMap(({file, data}) => [...data.items, ...(data.receivedTurns || []), ...(data.lexicalSupports || [])].map(item => [item.id, file])));
  const rawItems = new Map([...situationLedgers.values()].flatMap(ledger => ledger.documents)
    .flatMap(({data}) => [...data.items, ...(data.receivedTurns || []), ...(data.lexicalSupports || [])]).map(item => [item.id, item]));
  const canonical = new Map();
  for (const pair of manifest.pairs) for (let level = 1; level <= 10; level++) {
    const data = historicalCell(pair.id, level);
    for (const theme of [...data.themes, ...(data.heldThemes || [])]) for (const phrase of theme.phrases) {
      const key = pair.id + ':' + phrase.id;
      assert.ok(!canonical.has(key), 'one canonical across all levels ' + key);
      canonical.set(key, {phrase, themeId: theme.id, level, held: !data.themes.includes(theme)});
    }
  }
  const tuple = phrase => JSON.stringify(['study', 'native', 'phon', 'reading'].map(field => phrase[field] ?? null));
  const pointer = (document, jsonPointer) => (jsonPointer ? jsonPointer.slice(1).split('/') : []).reduce((value, token) =>
    value[token.replace(/~1/g, '/').replace(/~0/g, '~')], document);
  const totals = {cases: 0, intentPositions: 0, primaryPositions: 0, contextualReuses: 0,
    sameLevelReuses: 0, earlierLevelReuses: 0, sourceFields: 0,
    candidateKinds: {}, newCanonicalAuthored: new Set(), newCanonicalConversation: new Set()};
  for (const pair of manifest.pairs) {
    const descriptor = situationLedgers.get(pair.id);
    const ledger = {items: descriptor.items};
    assert.equal(descriptor.data.planHash, sha256(fs.readFileSync(baseSituationPlanPath)), 'base ledger keeps its frozen base plan ' + pair.id);
    assert.equal(descriptor.extensionData.planHash, report.situationPlanSha256, 'extension follows full frozen plan ' + pair.id);
    assert.equal(descriptor.data.items.length, 80, '80 original learner records preserved');
    assert.equal(descriptor.extensionData.items.length, 144, '144 appended pair intent candidates');
    assert.equal(ledger.items.length, 224, '224 combined pair intent candidates');
    assert.equal(new Set(ledger.items.map(item => item.intentId)).size, 224, 'no repeated pair intent');
    for (const [relative, expectedHash] of Object.entries(situationPlan.extension.preservedInputFingerprints)) {
      assert.equal(sha256(fs.readFileSync(path.resolve(ROOT, '..', relative))), expectedHash, 'protected previous file ' + relative);
    }
    const bank = new Map(historicalRepertoire(pair.id).phrases.map(phrase => [phrase.id, phrase]));
    for (const topic of situationPlan.themes) {
      const levelData = historicalCell(pair.id, topic.level);
      const theme = levelData.themes.find(theme => theme.id === topic.themeId);
      assert.ok(theme?.isAdditionalSituation, 'additional theme is visible ' + pair.id + ':' + topic.id);
      assert.equal(theme.presentedCount, 8);
      assert.equal(theme.reviewCount, 0);
      assert.equal(theme.newCount + theme.reuseCount, 8, 'new/reuse split sums to eight');
      const ids = theme.sequences.flatMap(sequence => sequence.phraseIds);
      assert.equal(ids.length, 8); assert.equal(new Set(ids).size, 8);
      const primary = new Map(theme.phrases.map(phrase => [phrase.id, phrase]));
      const presented = ids.map(id => primary.get(id) || bank.get(id));
      assert.ok(presented.every(phrase => phrase?.contentType === 'utterance' && !phrase.isTemplate));
      for (const [intentIndex, intent] of topic.intents.entries()) {
        const item = ledger.items.find(item => item.intentId === intent.id);
        assert.ok(item && item.pair === pair.id && item.topicId === topic.id);
        assert.equal(item.proposedLevel, topic.level);
        const matches = presented.filter(phrase => tuple(phoneticCorrections.projectBefore(pair.id, phrase)) === tuple(item));
        assert.equal(matches.length, 1, 'one exact whole candidate per intent ' + item.id);
        const phrase = matches[0];
        const originalPhrase = phoneticCorrections.projectBefore(pair.id, phrase);
        assert.equal(ids[intentIndex], phrase.id, 'planned global order keeps primary and reused intentions interleaved ' + intent.id);
        const contextual = (theme.contextReferences || []).find(reference => reference.id === phrase.id);
        if (contextual) {
          assert.equal(contextual.intentId, intent.id);
          assert.equal(contextual.firstEditorialLevel, phrase.canonicalLocation.level);
          assert.ok(contextual.firstEditorialLevel <= topic.level, 'no future source silently reused');
          const origin = canonical.get(pair.id + ':' + phrase.id);
          assert.ok(origin && !origin.held, 'context source is actually presentable');
          assert.equal(origin.level, contextual.firstEditorialLevel);
          assert.equal(origin.themeId, contextual.canonicalThemeId);
          for (const field of ['study', 'native', 'phon', 'reading']) assert.equal(phrase[field], origin.phrase[field], 'transport equals original ' + field);
          totals.contextualReuses++;
          if (contextual.firstEditorialLevel === topic.level) totals.sameLevelReuses++; else totals.earlierLevelReuses++;
        } else {
          assert.ok(primary.has(phrase.id));
          assert.equal(phrase.situationIntentId || phrase.intentId, intent.id, 'primary is bound to its intent');
          assert.equal(phrase.placement.domain, topic.id, 'primary is bound to its topic');
          totals.primaryPositions++;
        }
        for (const field of ['study', 'native', 'phon', 'reading']) {
          assert.equal(originalPhrase[field], item[field], 'whole original ledger field after approved correction proof ' + item.id + ':' + field);
          totals.sourceFields++;
        }
        if (item.readingScript !== undefined && phrase.source.collection.startsWith('situation-') && phrase.source.itemId === item.id) {
          assert.equal(phrase.readingScript, item.readingScript, 'creation-owned reading script metadata ' + item.id);
        }
        if (item.kind === 'catalogue-reference') {
          const source = item.source;
          const deck = decks[source.collection.replace('DECKS.', '')];
          const original = deck[source.sourceIndex];
          assert.equal(sha256(canonicalJson(original)), source.sourceSha256);
          assert.equal(source.sourceLevel, original.lv);
          const preferred = item.duplicateAudit?.preferredCanonicalId;
          if (preferred) assert.equal(item.duplicateAudit.decision, 'reuse-existing');
          assert.equal(phrase.id, preferred || 'catalogue:' + pair.studyLanguage + ':' + source.sourceIndex);
          const fieldMap = {study: 't', native: pair.nativeLanguage === 'zh' ? 'cn' : 'frm',
            phon: pair.nativeLanguage === 'zh' ? 'phon' : pair.studyLanguage === 'zh' ? 'phf' : 'pf'};
          for (const [field, key] of Object.entries(fieldMap)) assert.equal(item[field], original[key], 'original catalogue field ' + field);
        } else if (item.kind === 'conversation-whole-entry') {
          const source = item.source;
          const sourceBytes = fs.readFileSync(path.resolve(ROOT, '..', source.path));
          assert.equal(sha256(sourceBytes), source.fileSha256);
          const entry = pointer(JSON.parse(sourceBytes), source.jsonPointer);
          assert.equal(sha256(canonicalJson(entry)), source.entrySha256);
          for (const field of ['study', 'native', 'phon', 'reading']) assert.equal(item[field], entry[field], 'whole conversation field ' + field);
        } else if (item.kind === 'candidate-reference') {
          const other = item.source.canonicalId
            ? phoneticCorrections.projectBefore(pair.id, canonical.get(pair.id + ':' + item.source.canonicalId)?.phrase)
            : rawItems.get(item.source.candidateId);
          assert.ok(other && (!other.pair || other.pair === pair.id), 'candidate reuse stays in the same pair');
          assert.equal(tuple(item), tuple(other), 'candidate reuse cannot rewrite aids or meaning');
          assert.ok(phrase.editorialLevel <= item.proposedLevel, 'resolved candidate first introduction is not in the future');
        } else assert.equal(item.kind, 'editorial-authored-whole-entry');
        if (phrase.source.collection === 'situation-authored' || phrase.source.collection === 'situation-conversation') {
          const originItem = rawItems.get(phrase.source.itemId);
          assert.ok(originItem, 'new canonical source identifies its ledger entry');
          const originFile = sourceFiles.get(originItem.id);
          assert.equal(phrase.source.ledgerFile, path.relative(path.resolve(ROOT, '..'), originFile));
          assert.equal(phrase.source.ledgerFileSha256, sha256(fs.readFileSync(originFile)));
          const ledgerItemSha256 = ledgerItemHashes()[originItem.id];
          assert.equal(phrase.source.ledgerItemSha256, ledgerItemSha256);
          assert.equal(phrase.source.sourceSha256, phrase.source.collection === 'situation-authored'
            ? ledgerItemSha256 : originItem.source.entrySha256, 'source object and ledger item keep distinct fingerprints');
          assert.equal(tuple(originalPhrase), tuple(originItem));
          assert.equal(originalPhrase.phoneticReviewStatus, originItem.phoneticReviewStatus);
          if (phrase.source.collection === 'situation-authored') {
            assert.equal(phrase.id, 'situation-authored:' + originItem.id);
            assert.equal(originItem.kind, 'editorial-authored-whole-entry');
            assert.equal(originalPhrase.phoneticReviewStatus, 'pending-Claude');
            totals.newCanonicalAuthored.add(pair.id + ':' + phrase.id);
          } else {
            assert.equal(phrase.id, 'situation-conversation:' + originItem.id);
            assert.equal(originItem.kind, 'conversation-whole-entry');
            totals.newCanonicalConversation.add(pair.id + ':' + phrase.id);
          }
        }
        totals.candidateKinds[item.kind] = (totals.candidateKinds[item.kind] || 0) + 1;
        totals.intentPositions++;
      }
      totals.cases++;
    }
  }
  assert.equal(totals.cases, situationPlan.themes.length * manifest.pairs.length);
  assert.equal(totals.intentPositions, situationPlan.themes.length * manifest.pairs.length * 8);
  assert.equal(totals.primaryPositions + totals.contextualReuses, totals.intentPositions);
  assert.ok(totals.sameLevelReuses > 0, 'real same-level context reuse covered');
  report.additionalSourceFieldsCompared = totals.sourceFields;
  report.additionalWholeSourceAudit = {...totals,
    newCanonicalAuthored: totals.newCanonicalAuthored.size,
    newCanonicalConversation: totals.newCanonicalConversation.size};
}));

test('259 interlocutor turns and all lexical supports preserve whole sources and stay outside production', async () => checked('received-and-lexical-source-contract', async () => {
  const app = fs.readFileSync(path.join(ROOT, 'app.html'), 'utf8');
  const start = app.indexOf('var DECKS = ') + 'var DECKS = '.length;
  const decks = JSON.parse(app.slice(start, app.indexOf('\n', start)).trim().replace(/;$/, ''));
  const tuple = value => canonicalJson(['study', 'native', 'phon', 'reading'].map(field => value[field] ?? null));
  const records = new Map();
  for (const descriptor of situationLedgers.values()) for (const {file, data} of descriptor.documents) {
    for (const row of [...data.items, ...(data.receivedTurns || []), ...(data.lexicalSupports || [])]) records.set(row.id, {row, file});
  }
  const receivedTotals = {positions: 0, sourceFields: 0, questions: 0, closures: 0, preparedAnswers: 0, kinds: {}};
  const supportTotals = {positions: 0, sourceFields: 0, kinds: {}, newCanonicalIds: new Set()};
  const definitions = new Map(situationPlan.receivedTurnsDefs.map(turn => [turn.id, turn]));
  function compareSource(item, model, pair, bank) {
    const originalModel = phoneticCorrections.projectBefore(pair.id, model);
    assert.equal(item.pair, pair.id, 'source usage remains in its declared language pair');
    assert.equal(tuple(originalModel), tuple(item), 'whole original runtime fields match exact ledger after approved correction proof ' + item.id);
    if (item.readingScript !== undefined && model.source.collection.startsWith('situation-') && model.source.itemId === item.id) {
      assert.equal(model.readingScript, item.readingScript, 'creation-owned reading script preserved for received/support model ' + item.id);
    }
    if (item.kind === 'catalogue-reference') {
      const source = item.source;
      const card = decks[pair.studyLanguage][source.sourceIndex];
      assert.equal(sha256(canonicalJson(card)), source.sourceSha256, 'whole catalogue object fingerprint');
      assert.equal(source.sourceLevel, card.lv, 'source access level retained');
      const mapping = {study: 't', native: pair.nativeLanguage === 'zh' ? 'cn' : 'frm',
        phon: pair.studyLanguage === 'fr' ? 'phon' : pair.studyLanguage === 'zh' ? 'phf' : 'pf'};
      if (['zh', 'ja', 'ko'].includes(pair.studyLanguage)) mapping.reading = 'py';
      for (const [output, field] of Object.entries(mapping)) assert.equal(item[output], card[field], 'source catalogue ' + output);
    } else if (item.kind === 'conversation-whole-entry') {
      const bytes = fs.readFileSync(path.resolve(ROOT, '..', item.source.path));
      assert.equal(sha256(bytes), item.source.fileSha256);
      const raw = item.source.jsonPointer.slice(1).split('/').reduce((value, token) => value[token.replace(/~1/g, '/').replace(/~0/g, '~')], JSON.parse(bytes));
      assert.equal(sha256(canonicalJson(raw)), item.source.entrySha256);
      assert.equal(tuple(item), tuple(raw), 'conversation copied as one whole entry');
    } else if (item.kind === 'candidate-reference') {
      const other = item.source.canonicalId ? phoneticCorrections.projectBefore(pair.id, bank.phrases.find(phrase => phrase.id === item.source.canonicalId))
        : records.get(item.source.candidateId)?.row;
      assert.ok(other, 'explicit same-pair canonical/candidate support source');
      assert.equal(tuple(item), tuple(other), 'canonical/candidate reuse never rewrites a field');
    } else {
      assert.equal(item.kind, 'editorial-authored-whole-entry');
      assert.equal(item.phoneticReviewStatus, 'pending-Claude');
    }
    if (/^situation-(?:(?:received|support)-)?(?:authored|conversation)$/.test(model.source.collection)) {
      const origin = records.get(model.source.itemId);
      assert.ok(origin, 'runtime source points to an actual ledger entry');
      assert.equal(tuple(originalModel), tuple(origin.row));
      assert.equal(model.source.ledgerFile, path.relative(path.resolve(ROOT, '..'), origin.file));
      assert.equal(model.source.ledgerFileSha256, sha256(fs.readFileSync(origin.file)));
      assert.equal(model.source.ledgerItemSha256, ledgerItemHashes()[origin.row.id]);
      const authored = origin.row.kind === 'editorial-authored-whole-entry';
      assert.equal(model.source.sourceSha256, authored ? ledgerItemHashes()[origin.row.id] : origin.row.source.entrySha256);
    }
    for (const field of ['study', 'native', 'phon', 'reading']) assert.equal(originalModel[field], item[field], field + ' original is copied whole after approved correction proof');
  }
  for (const pair of manifest.pairs) {
    const ledger = situationLedgers.get(pair.id).extensionData;
    const bank = historicalRepertoire(pair.id);
    const heard = new Map((bank.receivedModels || []).map(model => [model.id, model]));
    const active = new Map(bank.phrases.map(model => [model.id, model]));
    assert.equal(ledger.receivedTurns.length, situationPlan.receivedTurnsDefs.length);
    for (const topic of situationPlan.themes.slice(baseSituationPlan.themes.length)) {
      const theme = historicalCell(pair.id, topic.level).themes.find(candidate => candidate.id === topic.themeId);
      assert.ok(theme, 'appended theme is visible ' + pair.id + ':' + topic.id);
      const primaryIds = theme.sequences.flatMap(sequence => sequence.phraseIds);
      const steps = theme.sequences.flatMap(sequence => sequence.steps);
      const turns = ledger.receivedTurns.filter(row => row.topicId === topic.id);
      assert.equal(turns.length, topic.receivedTurnIds.length, 'all planned turns present');
      assert.equal((theme.receivedTurns || []).length, turns.length);
      for (const row of turns) {
        const definition = definitions.get(row.definitionId || row.id.replace(new RegExp('^' + pair.id + '-'), ''));
        assert.ok(definition, 'received row has a known plan definition');
        const usage = theme.receivedTurns.find(turn => turn.id === row.id);
        assert.ok(usage, 'received turn is wired into theme');
        const model = heard.get(usage.utterance);
        assert.ok(model?.heardOnly && model.referenceOnly, 'dedicated comprehension model');
        assert.equal(model.role, undefined, 'usage role never overwrites canonical source');
        assert.equal(model.speaker, undefined, 'speaker is a use, not an intrinsic model field');
        assert.equal(model.contentType, 'utterance');
        assert.ok(model.firstHeardLevel <= topic.level, 'no future first-hearing declaration');
        if (/^heard-/.test(model.id)) assert.equal(active.has(model.id), false, 'heard-only additions cannot inflate canonical learner stock');
        compareSource(row, model, pair, bank);
        assert.deepEqual(usage.role, row.role);
        assert.equal(usage.analyse, false);
        for (const key of ['answerWith', 'beforeIntentId', 'afterIntentId']) assert.deepEqual(usage[key], definition[key], 'usage follows received definition ' + key);
        const matchingSteps = steps.filter(step => step.receivedId === usage.id);
        assert.equal(matchingSteps.length, 1, 'one real listen per received usage');
        const step = matchingSteps[0], index = steps.indexOf(step);
        assert.equal(step.kind, 'receive'); assert.equal(step.requiresProduction, false); assert.equal(step.countsForProgress, false);
        assert.equal(primaryIds.includes(step.utterance), false, 'interlocutor is not a ninth learner position');
        for (const answer of usage.answerWithUtteranceIds) {
          const before = steps.slice(0, index);
          assert.ok(before.some(prior => prior.kind === 'understand' && prior.utterance === answer));
          assert.ok(before.some(prior => prior.kind === 'imitate' && prior.utterance === answer));
          receivedTotals.preparedAnswers++;
        }
        if (usage.beforeIntentId) {
          assert.equal(steps[index + 1].utterance, usage.prepares);
          assert.ok(['choose-and-recall', 'reply-without-model', 'recall'].includes(steps[index + 1].kind));
          receivedTotals.questions++;
        } else {
          assert.deepEqual(usage.answerWith, [], 'closure contains no implicit answer');
          assert.equal(steps[index - 1].utterance, usage.prepares);
          assert.ok(['choose-and-recall', 'reply-without-model', 'recall'].includes(steps[index - 1].kind));
          receivedTotals.closures++;
        }
        receivedTotals.positions++; receivedTotals.sourceFields += 4;
        receivedTotals.kinds[row.kind] = (receivedTotals.kinds[row.kind] || 0) + 1;
      }
      const supports = ledger.lexicalSupports.filter(row => row.topicId === topic.id);
      assert.ok(supports.length >= 2, 'two autonomous lexical supports per research proposal');
      assert.equal(theme.lexicalSupports.length, supports.length);
      for (const row of supports) {
        const use = theme.lexicalSupports.find(support => support.supportId === row.id);
        assert.ok(use, 'lexical support explicitly wired');
        const model = active.get(use.utterance || use.id);
        assert.ok(model && ['vocabulary', 'number'].includes(model.contentType));
        assert.equal(model.placement.domain, row.lexicalFamily, 'support retains reviewed semantic family');
        assert.ok(model.editorialLevel <= topic.level, 'source support introduced before use');
        assert.equal(use.insertedIntoPhraseSteps, false);
        assert.equal(use.countsTowardProductionProgression, false);
        assert.equal(use.introducedBeforeIntentId, row.introducedBeforeIntentId);
        assert.ok(!steps.some(step => step.utterance === model.id), 'isolated support not injected into sentence exercise');
        compareSource(row, model, pair, bank);
        supportTotals.positions++; supportTotals.sourceFields += 4;
        supportTotals.kinds[row.kind] = (supportTotals.kinds[row.kind] || 0) + 1;
        if (/^situation-support-/.test(model.source.collection)) supportTotals.newCanonicalIds.add(pair.id + ':' + model.id);
      }
    }
  }
  assert.equal(receivedTotals.positions, 259); assert.equal(receivedTotals.questions, 133); assert.equal(receivedTotals.closures, 126);
  assert.ok(supportTotals.positions >= 252);
  report.receivedSourceAudit = receivedTotals;
  report.lexicalSupportSourceAudit = {...supportTotals, newCanonicalIds: supportTotals.newCanonicalIds.size};
}));

test('native lexical classes and reviewed relational groups follow their declared families', async () => checked('lexical-family-priority', async () => {
  const families = {adjective: 'vocab-adjectifs', preposition: 'vocab-prepositions', adverb: 'vocab-adverbes', color: 'vocab-couleurs'};
  const totals = {cells: 0, adjective: 0, preposition: 0, adverb: 0, color: 0, functionalRelationGroups: 0};
  const locativeExceptions = new Map([
    ...[2348, 2349, 2848, 2849, 2927, 2928, 2929, 2930].map(index => ['fr-zh:' + index, 'chinese-localizer']),
    ['fr-es:3894', 'whole-locative-prepositional-group-with-complement']
  ]);
  for (const pair of manifest.pairs) for (const metadata of pair.levels) {
    const data = historicalCell(pair.id, metadata.level);
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
    const data = historicalCell(pair.id, metadata.level);
    for (const phrase of [...data.themes, ...(data.heldThemes || [])].flatMap(theme => theme.phrases).concat(data.reserve || [])) {
      const key = pair.id + ':' + phrase.id;
      assert.ok(!canonical.has(key), 'one canonical first placement ' + key);
      canonical.set(key, phrase);
    }
  }
  for (const pair of manifest.pairs) {
    const bank = historicalRepertoire(pair.id);
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
    const originalPhrase = phoneticCorrections.projectBefore(item.pair, phrase);
    for (const field of ['study', 'native', 'phon', 'reading']) assert.equal(originalPhrase[field], item[field], 'whole original authored field after approved correction proof ' + item.id + ':' + field);
    assert.equal(originalPhrase.phoneticReviewStatus, 'pending-Claude');
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
    const data = historicalCell(pair, level);
    for (const theme of [...data.themes, ...(data.heldThemes || [])]) for (const phrase of theme.phrases) {
      if (phrase.source?.sourceIndex !== undefined) routes.set(pair + ':' + phrase.source.sourceIndex, {domain: theme.domain, phrase});
    }
  }
  let explicitSituationIntroductions = 0;
  for (const correction of corrections.routingCorrections) {
    const actual = routes.get(correction.pair + ':' + correction.sourceIndex);
    assert.ok(actual, 'retained semantic correction ' + correction.pair + ':' + correction.sourceIndex);
    if (actual.domain === correction.afterDomain) continue;
    const item = situationLedgers.get(correction.pair).items.find(item => item.kind === 'catalogue-reference'
      && item.source.sourceIndex === correction.sourceIndex && item.introductionDecision?.action === 'introduce-earlier'
      && item.topicId === actual.domain && item.proposedLevel === actual.phrase.editorialLevel);
    assert.ok(item, 'changed destination requires an individually reviewed whole-source situation introduction');
    assert.equal(item.introductionDecision.reviewStatus, 'reviewed');
    assert.ok(item.introductionDecision.fromEditorialLevel > item.proposedLevel && item.introductionDecision.reason);
    assert.equal(actual.phrase.placement.previousDomain, correction.afterDomain, 'semantic destination preserved as pre-introduction origin');
    assert.equal(actual.phrase.placement.classification, 'explicit-situation-first-introduction');
    assert.equal(actual.phrase.situationIntentId, item.intentId);
    explicitSituationIntroductions++;
  }
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
  report.jaKoSemanticDestinationsExplicitlyIntroducedInSituations = explicitSituationIntroductions;
  report.jaKoWholeNumericQuantitiesChecked = (corrections.isolatedNumberCorrections || []).length;
  for (const [pair, first, second] of [['fr-ja', 'catalogue:ja:3062', 'catalogue:ja:3063'], ['fr-ko', 'catalogue:ko:2213', 'catalogue:ko:2214']]) {
    const adjectives = historicalCell(pair, 1).themes.find(theme => theme.domain === 'vocab-adjectifs');
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

test('L1 received/context references load their bank and a failed bank can be retried', {timeout: 30000}, async () => checked('repertoire-loading-and-retry', async () => {
  const pairId = 'fr-es'; // generic corruption fixtures stay outside the pinned English edition
  const target = reviewFixture(pairId);
  const bankPath = '/' + manifest.pairs.find(pair => pair.id === pairId).repertoirePath;
  const noBank = await open(390);
  try {
    await noBank.page.goto(base + '/parcours-niveaux.html?pair=' + pairId + '&level=1'); await ready(noBank.page, pairId, 1);
    assert.equal(cell(pairId, 1).themes.some(theme => theme.reviewReferences?.length), false, 'L1 cannot cite an earlier level');
    assert.equal(cell(pairId, 1).themes.some(theme => theme.receivedTurns?.length), true, 'L1 includes actual interlocutor references');
    assert.ok(noBank.localRequests.includes(bankPath), 'received and contextual models load the repertoire bank in L1');
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

test('same-level context reuse is explicit, audible and distinct from a revision', {timeout: 30000}, async () => checked('same-level-context-reuse', async () => {
  let target;
  for (const pair of manifest.pairs) {
    try { target = {...contextFixture(pair.id, {sameLevel: true}), pair}; break; }
    catch (error) { if (!error.message.startsWith('No same-level context fixture')) throw error; }
  }
  assert.ok(target, 'a real same-level reuse exists in the frozen bundle');
  const fixture = await open(390);
  try {
    const {page} = fixture;
    await page.goto(base + '/parcours-niveaux.html?pair=' + target.pair.id + '&level=' + target.level);
    await ready(page, target.pair.id, target.level);
    const theme = target.data.themes[target.themeIndex];
    const steps = theme.sequences.flatMap(sequence => sequence.steps);
    const reference = target.reference;
    const phrase = repertoire(target.pair.id).phrases.find(candidate => candidate.id === reference.id);
    const readIndex = steps.findIndex(step => step.utterance === reference.id && step.kind === 'understand');
    const recallIndex = steps.findIndex(step => step.utterance === reference.id && ['choose-and-recall', 'reply-without-model', 'recall'].includes(step.kind));
    assert.ok(readIndex >= 0 && recallIndex > readIndex);
    await page.locator('#mgThemeGrid > button').nth(target.themeIndex).click();
    await page.evaluate(count => { for (let index = 0; index < count; index++) document.getElementById('mgContinue').click(); }, readIndex);
    assert.equal((await page.evaluate(() => window.MelungaMockup.state())).phraseId, phrase.id);
    for (const [node, field] of [['#mgPhrase', 'study'], ['#mgPhon', 'phon'], ['#mgTranslation', 'native'], ['#mgReading', 'reading']]) {
      assert.equal(await page.locator(node).textContent(), phrase[field] || '', 'same-level context whole ' + field);
    }
    const badge = target.pair.nativeLanguage === 'zh' ? ' · 情境复用' : ' · Réemploi';
    assert.ok((await page.locator('#mgLessonTheme').textContent()).endsWith(badge));
    assert.ok(!(await page.locator('#mgLessonTheme').textContent()).endsWith(' · Révision'));
    await page.click('#mgEar');
    assert.equal(await page.evaluate(() => window.__speech.at(-1).text), phrase.study);
    await page.evaluate(count => { for (let index = 0; index < count; index++) document.getElementById('mgContinue').click(); }, recallIndex - readIndex);
    assert.equal((await page.evaluate(() => window.MelungaMockup.state())).masked, true);
    assert.equal(await page.locator('#mgPhrase').getAttribute('hidden'), '');
    assert.equal(await page.locator('#mgPhon').getAttribute('hidden'), '');
    assert.equal(await page.locator('#mgTranslation').textContent(), phrase.native);
    const spoken = await page.evaluate(() => window.__speech.length);
    await page.evaluate(() => document.getElementById('mgPhonrow').click());
    assert.equal((await page.evaluate(() => window.MelungaMockup.state())).masked, true);
    assert.equal(await page.evaluate(() => window.__speech.length), spoken);
    await page.click('#mgEar');
    assert.equal((await page.evaluate(() => window.MelungaMockup.state())).masked, false);
    assert.equal(await page.locator('#mgPhon').textContent(), phrase.phon);
    assert.equal(await page.evaluate(() => window.__speech.at(-1).text), phrase.study);
    report.sameLevelContextReuse = {pair: target.pair.id, level: target.level, themeId: theme.id,
      canonicalId: phrase.id, firstEditorialLevel: reference.firstEditorialLevel,
      wholeFieldsChecked: 4, explicitRecallReveal: true, backgroundAudioDidNotReveal: true};
    assert.deepEqual(fixture.errors, []);
  } finally { await fixture.context.close(); }
}));

test('invalid context intent, future, type and review markers are refused and a corrected bank reloads', {timeout: 90000}, async () => checked('context-reference-guards-and-retry', async () => {
  const pairId = 'fr-es'; // generic corruption fixtures stay outside the pinned English edition
  const basic = contextFixture(pairId);
  report.contextGuardResults = [];
  for (const alteration of ['future', 'intent', 'type', 'not-additional', 'mixed-review-marker', 'missing-context-marker', 'missing-intent-position', 'duplicate-intent', 'intent-order']) {
    const target = JSON.parse(JSON.stringify(basic.data));
    const bank = repertoire(pairId);
    const theme = target.themes[basic.themeIndex];
    const reference = theme.contextReferences.find(reference => reference.id === basic.reference.id);
    const phrase = bank.phrases.find(candidate => candidate.id === reference.id);
    assert.ok(phrase);
    if (alteration === 'future') {
      reference.firstEditorialLevel = target.level + 1;
      phrase.editorialLevel = target.level + 1;
      phrase.canonicalLocation.level = target.level + 1;
    } else if (alteration === 'intent') reference.intentId = 'absent-topic-intent-99';
    else if (alteration === 'type') phrase.contentType = 'vocabulary';
    else if (alteration === 'not-additional') theme.isAdditionalSituation = false;
    else if (alteration === 'mixed-review-marker') {
      for (const sequence of theme.sequences) for (const step of sequence.steps) if (step.utterance === reference.id) step.isReview = true;
    } else if (alteration === 'missing-context-marker') {
      for (const sequence of theme.sequences) for (const step of sequence.steps) if (step.utterance === reference.id) delete step.isContextReuse;
    } else if (alteration === 'duplicate-intent') {
      reference.intentId = theme.intentIds.find(id => id !== reference.intentId);
    } else if (alteration === 'intent-order') {
      const sequence = theme.sequences.find(sequence => sequence.phraseIds.length > 1);
      if (sequence) sequence.phraseIds.reverse();
      else theme.sequences.reverse();
    } else {
      theme.contextReferences = theme.contextReferences.filter(candidate => candidate.id !== reference.id);
      theme.reuseCount--;
      theme.presentedCount--;
      theme.pedagogicalConceptCount = theme.presentedCount;
      theme.sequences = theme.sequences.map(sequence => ({...sequence,
        phraseIds: sequence.phraseIds.filter(id => id !== reference.id),
        steps: sequence.steps.filter(step => step.utterance !== reference.id).map(step => {
          const corrected = {...step};
          if (corrected.choices) corrected.choices = corrected.choices.filter(id => id !== reference.id);
          return corrected;
        })})).filter(sequence => sequence.phraseIds.length);
    }
    const cellPath = '/content/niveaux-progressifs/' + pairId + '/L' + target.level + '.json';
    const bankPath = '/' + manifest.pairs.find(pair => pair.id === pairId).repertoirePath;
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
      assert.equal((await fixture.page.evaluate(() => window.MelungaMockup.state())).screen, 'loading', alteration + ' cannot display a partial lesson');
      const before = fixture.localRequests.filter(value => value === bankPath).length;
      corrupted = false;
      await fixture.page.click('#mgRetry'); await ready(fixture.page, pairId, target.level);
      const after = fixture.localRequests.filter(value => value === bankPath).length;
      assert.equal(after, before + 1, 'retry requests a corrected context bank instead of retaining poisoned data');
      const originalTheme = basic.data.themes[basic.themeIndex];
      await fixture.page.locator('#mgThemeGrid > button').nth(basic.themeIndex).click();
      assert.equal((await fixture.page.evaluate(() => window.MelungaMockup.state())).screen, 'lesson');
      assert.equal(originalTheme.presentedCount, 8);
      const originalPhrase = repertoire(pairId).phrases.find(candidate => candidate.id === basic.reference.id);
      const originalSteps = originalTheme.sequences.flatMap(sequence => sequence.steps);
      const referenceIndex = originalSteps.findIndex(step => step.utterance === basic.reference.id);
      assert.ok(referenceIndex >= 0);
      await fixture.page.evaluate(count => { for (let index = 0; index < count; index++) document.getElementById('mgContinue').click(); }, referenceIndex);
      for (const [selector, field] of [['#mgPhrase', 'study'], ['#mgPhon', 'phon'], ['#mgTranslation', 'native'], ['#mgReading', 'reading']]) {
        assert.equal(await fixture.page.locator(selector).textContent(), originalPhrase[field] || '', 'corrected retry bank preserves whole ' + field);
      }
      await fixture.page.click('#mgEar');
      assert.equal(await fixture.page.evaluate(() => window.__speech.at(-1).text), originalPhrase.study);
      report.contextGuardResults.push({alteration, refused: true, bankRequestsBeforeRetry: before,
        bankRequestsAfterRetry: after, retryRestored: true, correctedWholeFields: 4, correctedAudioText: true});
      assert.deepEqual(fixture.errors, []);
    } finally { await fixture.context.close(); }
  }
}));

test('corrupt interlocutor roles, preparation, progress and lexical wiring are refused; corrected bank retries restore a full cycle', {timeout: 180000}, async () => checked('received-reference-guards-and-retry', async () => {
  const pairId = 'fr-es'; // generic corruption fixtures stay outside the pinned English edition
  const basic = receivedFixture(pairId);
  report.receivedGuardResults = [];
  const alterations = ['future-first-hearing', 'wrong-model-type', 'role-on-model', 'production-progress',
    'requires-production', 'unprepared-answer', 'unknown-answer', 'question-before-preparation',
    'closure-without-explicit-list', 'closure-before-response', 'missing-received-model',
    'future-lexical-support', 'lexical-word-in-phrase-steps'];
  for (const alteration of alterations) {
    const target = JSON.parse(JSON.stringify(basic.data));
    const bank = repertoire(pairId);
    const theme = target.themes[basic.themeIndex];
    const question = theme.receivedTurns.find(turn => turn.beforeIntentId);
    const closure = theme.receivedTurns.find(turn => turn.afterIntentId);
    const sequence = theme.sequences.find(sequence => sequence.steps.some(step => step.receivedId === question.id));
    const questionStep = sequence.steps.find(step => step.receivedId === question.id);
    const closureSequence = theme.sequences.find(sequence => sequence.steps.some(step => step.receivedId === closure.id));
    const closureStep = closureSequence.steps.find(step => step.receivedId === closure.id);
    const model = bank.receivedModels.find(model => model.id === question.utterance);
    assert.ok(model && questionStep && closureStep);
    if (alteration === 'future-first-hearing') model.firstHeardLevel = target.level + 1;
    else if (alteration === 'wrong-model-type') model.contentType = 'vocabulary';
    else if (alteration === 'role-on-model') model.role = question.role;
    else if (alteration === 'production-progress') questionStep.countsForProgress = true;
    else if (alteration === 'requires-production') questionStep.requiresProduction = true;
    else if (alteration === 'unprepared-answer') {
      questionStep.preparedAnswerSteps[question.answerWithUtteranceIds[0]].imitatedInStep = 'not-a-prior-imitation';
    } else if (alteration === 'unknown-answer') {
      question.answerWith = ['not-a-prepared-intent']; questionStep.answerWith = [...question.answerWith];
    } else if (alteration === 'question-before-preparation') {
      sequence.steps.splice(sequence.steps.indexOf(questionStep), 1); sequence.steps.unshift(questionStep);
    } else if (alteration === 'closure-without-explicit-list') {
      delete closure.answerWith; delete closureStep.answerWith;
    } else if (alteration === 'closure-before-response') {
      closureSequence.steps.splice(closureSequence.steps.indexOf(closureStep), 1); closureSequence.steps.unshift(closureStep);
    } else if (alteration === 'missing-received-model') {
      bank.receivedModels = bank.receivedModels.filter(candidate => candidate.id !== model.id);
      bank.phrases = bank.phrases.filter(candidate => candidate.id !== model.id);
    } else if (alteration === 'future-lexical-support') {
      theme.lexicalSupports[0].firstEditorialLevel = target.level + 1;
    } else {
      sequence.steps.unshift({id: 'injected-word', kind: 'understand', utterance: theme.lexicalSupports[0].utterance || theme.lexicalSupports[0].id});
    }
    const cellPath = '/content/niveaux-progressifs/' + pairId + '/L' + target.level + '.json';
    const bankPath = '/' + manifest.pairs.find(pair => pair.id === pairId).repertoirePath;
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
      const {page} = fixture;
      await page.goto(base + '/parcours-niveaux.html?pair=' + pairId + '&level=' + target.level);
      await page.locator('#mgRetry').waitFor({state: 'visible'});
      assert.equal((await page.evaluate(() => window.MelungaMockup.state())).screen, 'loading', alteration + ' cannot launch a partial lesson');
      const before = fixture.localRequests.filter(value => value === bankPath).length;
      corrupted = false;
      await page.click('#mgRetry'); await ready(page, pairId, target.level);
      const after = fixture.localRequests.filter(value => value === bankPath).length;
      assert.equal(after, before + 1, 'retry reloads corrected interlocutor bank');
      const original = basic.data.themes[basic.themeIndex];
      const originalSteps = original.sequences.flatMap(sequence => sequence.steps);
      const originalQuestion = original.receivedTurns.find(turn => turn.beforeIntentId);
      const cueIndex = originalSteps.findIndex(step => step.receivedId === originalQuestion.id);
      const originalBank = repertoire(pairId);
      const cue = originalBank.receivedModels.find(model => model.id === originalQuestion.utterance);
      await page.locator('#mgThemeGrid > button').nth(basic.themeIndex).click();
      await page.evaluate(count => { for (let index = 0; index < count; index++) document.getElementById('mgContinue').click(); }, cueIndex);
      assert.equal((await page.evaluate(() => window.MelungaMockup.state())).masked, false);
      for (const [selector, field] of [['#mgPhrase', 'study'], ['#mgPhon', 'phon'], ['#mgTranslation', 'native'], ['#mgReading', 'reading']]) {
        assert.equal(await page.locator(selector).textContent(), cue[field] || '', 'corrected whole interlocutor ' + field);
      }
      assert.equal(await page.locator('#mgSpeaker').textContent(), originalQuestion.role[basic.data.nativeLanguage]);
      const progressAtCue = await page.locator('#mgProgress').getAttribute('style');
      await page.click('#mgEar');
      assert.equal(await page.evaluate(() => window.__speech.at(-1).text), cue.study);
      await page.click('#mgContinue');
      const replyState = await page.evaluate(() => window.MelungaMockup.state());
      assert.equal(replyState.phraseId, originalQuestion.prepares);
      assert.equal(replyState.masked, true, 'prepared learner response is recalled after real question');
      assert.equal(await page.locator('#mgSpeaker').getAttribute('hidden'), '', 'interlocutor role clears for learner reply');
      const reply = original.phrases.find(phrase => phrase.id === originalQuestion.prepares)
        || originalBank.phrases.find(phrase => phrase.id === originalQuestion.prepares);
      assert.equal(await page.locator('#mgTranslation').textContent(), reply.native, 'recall meaning stays available');
      const closing = original.receivedTurns.find(turn => turn.afterIntentId);
      const closeIndex = originalSteps.findIndex(step => step.receivedId === closing.id);
      await page.evaluate(count => { for (let index = 0; index < count; index++) document.getElementById('mgContinue').click(); }, closeIndex - cueIndex - 1);
      const closeModel = originalBank.receivedModels.find(model => model.id === closing.utterance);
      assert.equal((await page.evaluate(() => window.MelungaMockup.state())).phraseId, closeModel.id);
      assert.equal((await page.evaluate(() => window.MelungaMockup.state())).masked, false);
      assert.equal(await page.locator('#mgPhrase').textContent(), closeModel.study, 'closure remains comprehension only');
      assert.deepEqual(closing.answerWith, []);
      await page.click('#mgEar'); assert.equal(await page.evaluate(() => window.__speech.at(-1).text), closeModel.study);
      report.receivedGuardResults.push({alteration, refused: true, retryRestored: true, bankRequestsBeforeRetry: before,
        bankRequestsAfterRetry: after, correctedWholeFields: 4, questionPreparedReplyClosure: true, progressAtCue});
      assert.deepEqual(fixture.errors, []);
    } finally { await fixture.context.close(); }
  }
}));

test('future, wrong-type, wrong-family, wrong-subclass and insufficient-concept references are refused', {timeout: 60000}, async () => checked('repertoire-reference-guards', async () => {
  const pairId = 'fr-es'; // generic corruption fixtures stay outside the pinned English edition
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
    const bankPath = '/' + manifest.pairs.find(pair => pair.id === pairId).repertoirePath;
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
  const first = 'fr-es', second = 'fr-zh'; // generic late-response behavior, independently of English raw-body integrity
  const firstTarget = reviewFixture(first), secondTarget = reviewFixture(second);
  const firstBankPath = '/' + manifest.pairs.find(pair => pair.id === first).repertoirePath;
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
      assert.equal(await page.locator('#mgMenuNav > *').count(), 10);
      assert.equal(await page.locator('[data-menu-item="À revoir"]').count(), 1, 'saved review joins the existing menu');
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
      await page.evaluate(() => document.getElementById('mgPhonrow').click());
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

test('278 registered photo slots in 24 distinct atlases; no external or API operations', {timeout: 30000}, async () => checked('photo-atlases-and-network-isolation', async () => {
  const fixture = await open();
  try {
    await fixture.page.goto(base + '/parcours-niveaux.html'); await ready(fixture.page, 'fr-zh', 1);
    const assets = [...visualRegistry.levels, ...visualRegistry.vocabularyAtlases, ...visualRegistry.grammarAtlases,
      ...visualRegistry.correctionAtlases, ...visualRegistry.situationAtlases];
    assert.equal(assets.length, 24, '24 atlases');
    assert.equal(visualRegistry.themes.length, 278, '278 distinct slots');
    assert.equal(new Set(visualRegistry.themes.map(theme => theme.asset + ':' + theme.column + ':' + theme.row)).size, 278, 'one slot per theme/level');
    for (const theme of situationPlan.themes) assert.equal(visualRegistry.themes.filter(visual => visual.visualId === theme.visualId).length, 1, 'one registered new topic photo ' + theme.id);
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
    assert.equal(hashes.size, 24, 'unique atlas files');
    report.visualRegistryChecked = {atlases: assets.length, slots: visualRegistry.themes.length, additionalSituationPhotos: situationPlan.themes.length};
    assert.equal(assetByName.get('assets/theme-scenes.webp').sha256, 'ba431628deddbaafa34384b196c1f3428d606673662681a3835c4b92fe5d7a1c', 'approved L1 image preserved');
    assert.deepEqual(report.externalRequests, []);
    assert.deepEqual(report.apiRequests, []);
  } finally { await fixture.context.close(); }
}));
