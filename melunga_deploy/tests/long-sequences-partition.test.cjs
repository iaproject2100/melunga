/* Actual source conservation for the long-theme display partitioner.
 * No DOM, server, account or provider calls. Run with node --test.
 * Optional LONG_SEQUENCES_CONSERVATION_REPORT writes the resulting evidence. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const { test, before, after } = require('node:test');

const ROOT = path.resolve(__dirname, '../..');
const WEB = path.join(ROOT, 'melunga_deploy');
const BASE = 'f25250627f94334fd097a4eed0d4da814d65561f';
const CONTROLLER = 'maquette-guidee.js';
const read = file => fs.readFileSync(path.join(WEB, file));
const json = file => JSON.parse(read(file));
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const baselineCache = new Map();
function baseline(file) {
  if (!baselineCache.has(file)) baselineCache.set(file, execFileSync('git',
    ['show', BASE + ':melunga_deploy/' + file], { cwd: ROOT, maxBuffer: 40 * 1024 * 1024 }));
  return baselineCache.get(file);
}
const manifest = json('content/niveaux-progressifs/manifest.json');
const nativeManifest = json('content/native-catalogue/manifest.json');
const reviewedFiles = ['content/niveaux-progressifs/manifest.json',
  ...manifest.pairs.flatMap(pair => [pair.repertoirePath, ...pair.levels.map(level => level.dataPath)])];
const nativeFiles = ['content/native-catalogue/manifest.json',
  ...Object.values(nativeManifest.banks).map(bank => bank.path)];
const artworkFiles = execFileSync('git', ['ls-tree', '-r', '--name-only', BASE, '--', 'melunga_deploy'],
  { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(file => /\.(png|svg|webp)$/.test(file))
  .map(file => file.slice('melunga_deploy/'.length));
const protectedFiles = [...reviewedFiles, ...nativeFiles, ...artworkFiles, 'content/course-access.json',
  'course-access.js', 'course-native.js'];
const inputFiles = [...new Set([...protectedFiles, CONTROLLER, 'course-i18n.js'])].sort();
const fingerprints = () => Object.fromEntries([
  ['melunga_deploy/tests/long-sequences-partition.test.cjs', sha(fs.readFileSync(__filename))],
  ...inputFiles.map(file => ['melunga_deploy/' + file, sha(read(file))])
]);

// Extract one bounded function, keeping nested functions and comments intact.
function functionSource(source, name) {
  const match = new RegExp('\\bfunction\\s+' + name + '\\s*\\([^)]*\\)\\s*\\{').exec(source);
  assert.ok(match, 'the actual controller supplies ' + name);
  let depth = 0, quote = null, escaped = false, lineComment = false, blockComment = false;
  for (let index = match.index + match[0].length - 1; index < source.length; index++) {
    const char = source[index], next = source[index + 1];
    if (lineComment) { if (char === '\n') lineComment = false; continue; }
    if (blockComment) { if (char === '*' && next === '/') { blockComment = false; index++; } continue; }
    if (quote) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '/' && next === '/') { lineComment = true; index++; continue; }
    if (char === '/' && next === '*') { blockComment = true; index++; continue; }
    if (['"', "'", '`'].includes(char)) { quote = char; continue; }
    if (char === '{') depth++;
    else if (char === '}' && !--depth) return source.slice(match.index, index + 1);
  }
  assert.fail('unclosed function ' + name);
}

let partitionContext, inputs, rows = [], firstThemes = [];
const report = {
  status: 'running', sourceReference: BASE, scope: 'pure function and source conservation; no DOM',
  actualProviderCalls: false, realAccountsUsed: false, contentSourceBytesIdentical: null,
  reviewedRuntimeJson: reviewedFiles.length, nativeCatalogueJson: nativeFiles.length,
  protectedArtworkFiles: artworkFiles.length,
  checks: [], errors: [], references: [], totals: {}, firstThemes: [], longThemes: []
};
function partition(weights) {
  partitionContext.weights = weights;
  const result = vm.runInContext('partitionGroupBoundaries(weights)', partitionContext, { timeout: 5000 });
  return JSON.parse(JSON.stringify(result));
}
const zeroTotals = () => ({ themes: 0, cards: 0, guidedSteps: 0, chunks: 0,
  preparations: 0, receivedSteps: 0, receivedModels: 0, templates: 0,
  reviewSteps: 0, contextReuseSteps: 0, duplicateIds: 0 });
const totals = { reviewed: zeroTotals(), native: zeroTotals() };
let maximumTechnicalGroupWeight = 0, checkedThemes = 0;

function checkTheme(pairId, level, theme, kind, sourceModels) {
  const before = JSON.stringify(theme), groups = theme.sequences;
  const weights = groups.map(group => group.phraseIds.length);
  for (const weight of weights) maximumTechnicalGroupWeight = Math.max(maximumTechnicalGroupWeight, weight);
  const ids = groups.flatMap(group => group.phraseIds), steps = groups.flatMap(group => group.steps);
  const chunks = partition(weights);
  assert.ok(chunks.length > 0);
  let groupEnd = 0, cardEnd = 0;
  for (const chunk of chunks) {
    assert.equal(chunk.groupStart, groupEnd, 'no skipped or repeated prepared group');
    assert.ok(Number.isInteger(chunk.groupEndExclusive) && chunk.groupEndExclusive > groupEnd);
    assert.ok(chunk.groupEndExclusive <= groups.length);
    const cards = groups.slice(chunk.groupStart, chunk.groupEndExclusive)
      .reduce((count, group) => count + group.phraseIds.length, 0);
    assert.equal(chunk.cards, cards);
    assert.equal(chunk.firstPresentation, cardEnd + 1, 'the visible range starts after the preceding range');
    cardEnd += cards;
    assert.equal(chunk.lastPresentation, cardEnd);
    groupEnd = chunk.groupEndExclusive;
    if (ids.length > 100) assert.ok(cards >= 30 && cards <= 40, 'long themes use complete 30–40-card stages');
  }
  assert.equal(groupEnd, groups.length);
  assert.equal(cardEnd, ids.length);
  if (ids.length <= 100) assert.equal(chunks.length, 1, 'short themes remain one lesson');
  const regrouped = chunks.flatMap(chunk => groups.slice(chunk.groupStart, chunk.groupEndExclusive));
  assert.ok(regrouped.every((group, index) => group === groups[index]), 'prepared-group identities and order remain exact');
  assert.equal(regrouped.length, groups.length);
  assert.equal(JSON.stringify(regrouped.flatMap(group => group.phraseIds)), JSON.stringify(ids), 'all original presentations remain in order, including repeated ids');
  const regroupedSteps = regrouped.flatMap(group => group.steps);
  assert.equal(JSON.stringify(regroupedSteps), JSON.stringify(steps), 'all step fields and their order remain exact');
  assert.ok(regroupedSteps.every((step, index) => step === steps[index]), 'the original step objects are retained');
  assert.equal(JSON.stringify(theme), before, 'theme metadata, title, photo and objects are not rewritten');
  assert.deepEqual(partition(weights), chunks, 'partition is deterministic');
  checkedThemes++;
  if (level === 1 && theme === sourceModels.firstTheme) {
    assert.ok(ids.length <= 100, 'the first L1 theme remains compatible with direct lesson entry: ' + pairId);
    assert.equal(chunks.length, 1);
    firstThemes.push({ pairId, level, themeId: theme.id, cards: ids.length, stages: chunks.length });
  }
  if (ids.length <= 100) return;
  const refIds = new Set([...ids, ...steps.flatMap(step => [step.utterance, ...(step.choices || [])])]);
  refIds.delete(undefined);
  const models = [...refIds].map(id => sourceModels.models.get(id));
  assert.ok(models.every(Boolean), 'all long-theme source references resolve');
  const record = { pairId, level, themeId: theme.id, title: theme.title,
    cards: ids.length, guidedSteps: steps.length, technicalGroups: groups.length,
    partitionCards: chunks.map(chunk => chunk.cards),
    ranges: chunks.map(chunk => [chunk.firstPresentation, chunk.lastPresentation]),
    originalCardOrderSha256: sha(JSON.stringify(ids)),
    originalStepObjectsSha256: sha(JSON.stringify(steps)),
    originalThemeSha256: sha(before) };
  rows.push(record);
  const total = totals[kind];
  total.themes++; total.cards += ids.length; total.guidedSteps += steps.length; total.chunks += chunks.length;
  total.preparations += steps.filter(step => step.isPreparation).length;
  total.receivedSteps += steps.filter(step => step.kind === 'receive').length;
  total.receivedModels += models.filter(model => model.kind === 'received' || model.speaker === 'B').length;
  total.templates += models.filter(model => model.isTemplate).length;
  total.reviewSteps += steps.filter(step => step.isReview).length;
  total.contextReuseSteps += steps.filter(step => step.isContextReuse).length;
  total.duplicateIds += ids.length - new Set(ids).size;
}

function nativeBuilder(fromBaseline) {
  const sandbox = {
    TextDecoder, crypto: crypto.webcrypto,
    MelungaCourseData: { fetch: async requested => {
      assert.ok(nativeFiles.includes(requested), 'native builder reads only verified local catalogue inputs');
      const bytes = fromBaseline ? baseline(requested) : read(requested);
      return { ok: true, arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) };
    } }
  };
  sandbox.window = sandbox;
  const context = vm.createContext(sandbox);
  for (const file of ['course-i18n.js', 'course-native.js']) vm.runInContext(
    (fromBaseline ? baseline(file) : read(file)).toString(), context, { filename: file, timeout: 10000 });
  return context.MelungaNativeCourses;
}

before(() => {
  inputs = fingerprints();
  const source = functionSource(read(CONTROLLER).toString(), 'partitionGroupBoundaries');
  partitionContext = vm.createContext({});
  vm.runInContext(source, partitionContext, { timeout: 5000 });
  report.partitionerSha256 = sha(source);
  report.inputSha256 = inputs;
});
after(() => {
  report.inputsStable = JSON.stringify(inputs) === JSON.stringify(fingerprints());
  report.checkedThemes = checkedThemes;
  report.maximumTechnicalGroupWeight = maximumTechnicalGroupWeight;
  report.totals = totals;
  report.firstThemes = firstThemes.sort((a, b) => a.pairId.localeCompare(b.pairId));
  report.longThemes = rows;
  report.status = report.checks.length === 5 && !report.errors.length && report.inputsStable ? 'passed' : 'failed';
  if (process.env.LONG_SEQUENCES_CONSERVATION_REPORT) fs.writeFileSync(
    process.env.LONG_SEQUENCES_CONSERVATION_REPORT, JSON.stringify(report, null, 2) + '\n');
  assert.equal(report.inputsStable, true, 'all inspected source bytes remain frozen throughout the run');
  assert.deepEqual(report.errors, []);
  assert.equal(report.checks.length, 5, 'all five conservation groups completed');
});
async function checked(name, run) {
  try { await run(); report.checks.push(name); }
  catch (error) { report.errors.push(name + ': ' + error.message); throw error; }
}

test('78 reviewed JSON files, eight native catalogue JSON files, original artwork, rights and the native builder remain byte exact', () => checked('protected-source-bytes', () => {
  assert.equal(reviewedFiles.length, 78);
  assert.equal(nativeFiles.length, 8);
  assert.equal(artworkFiles.length, 33);
  for (const file of protectedFiles) assert.ok(read(file).equals(baseline(file)), 'whole source preserved: ' + file);
  report.contentSourceBytesIdentical = true;
  report.protectedSourceSha256 = Object.fromEntries(protectedFiles.map(file => [file, sha(read(file))]));
}));

test('all reviewed and actual generated native themes preserve groups, every card and complete step metadata', { timeout: 120000 }, () => checked('all-42-pair-content-conservation', async () => {
  for (const descriptor of manifest.pairs) {
    const bank = json(descriptor.repertoirePath);
    for (const spec of descriptor.levels) {
      const pair = json(spec.dataPath);
      const models = new Map([...bank.phrases, ...(bank.receivedModels || []),
        ...pair.themes.flatMap(theme => theme.phrases)].map(model => [model.id, model]));
      for (const theme of pair.themes) checkTheme(descriptor.id, spec.level, theme, 'reviewed',
        { models, firstTheme: pair.themes[0] });
    }
  }
  const current = nativeBuilder(false), original = nativeBuilder(true);
  for (const pairId of nativeManifest.derivedPairIds) for (let level = 1; level <= 10; level++) {
    const [actual, prior] = await Promise.all([current.loadPair(pairId, level), original.loadPair(pairId, level)]);
    assert.equal(sha(JSON.stringify(actual.pair)), sha(JSON.stringify(prior.pair)),
      'whole native theme order, metadata, content and photos match the baseline: ' + pairId + '/L' + level);
    const models = new Map(actual.pair.themes.flatMap(theme => theme.phrases).map(model => [model.id, model]));
    for (const theme of actual.pair.themes) checkTheme(pairId, level, theme, 'native',
      { models, firstTheme: actual.pair.themes[0] });
  }
  assert.deepEqual(totals.reviewed, { themes: 67, cards: 11809, guidedSteps: 35427, chunks: 337,
    preparations: 0, receivedSteps: 0, receivedModels: 0, templates: 0,
    reviewSteps: 7320, contextReuseSteps: 0, duplicateIds: 0 });
  assert.deepEqual(totals.native, { themes: 235, cards: 38918, guidedSteps: 116754, chunks: 1120,
    preparations: 0, receivedSteps: 0, receivedModels: 0, templates: 0,
    reviewSteps: 0, contextReuseSteps: 0, duplicateIds: 0 });
  assert.equal(maximumTechnicalGroupWeight, 5);
}));

test('independent reference partitions and presentation ranges identify real Spanish, Chinese and Korean-native examples', () => checked('reference-partitions', () => {
  const references = [
    ['fr-es', 2, 'L2-conversation', [30, 35, 35, 35, 35, 35, 35, 35, 34]],
    ['fr-zh', 2, 'L2-conversation', [35, 35, 40, 39]],
    ['ko-fr', 2, 'L2-conversation', [30, 30, 30, 35, 35, 35, 34]],
    ['fr-zh', 10, 'L10-vocab-adjectifs', [35, 35, 35, 35, 35, 35, 35, 35, 35, 35, 37]]
  ];
  for (const [pairId, level, themeId, expected] of references) {
    const actual = rows.find(row => row.pairId === pairId && row.level === level && row.themeId === themeId);
    assert.ok(actual, 'the independently identified source theme exists');
    assert.deepEqual(actual.partitionCards, expected);
    assert.equal(actual.ranges[0][0], 1);
    assert.equal(actual.ranges.at(-1)[1], expected.reduce((sum, count) => sum + count, 0));
    report.references.push(actual);
  }
}));

test('the first L1 themes of all 42 native/study pairs remain one unchanged direct-entry lesson', () => checked('first-theme-direct-entry', () => {
  assert.equal(firstThemes.length, 42);
  assert.deepEqual(new Set(firstThemes.map(row => row.pairId)), new Set(nativeManifest.pairIds));
  assert.ok(firstThemes.every(row => row.cards > 0 && row.cards <= 100 && row.stages === 1));
}));

test('short themes stay whole; invalid or impossible atomic inputs fail without splitting a group', () => checked('thresholds-and-atomic-errors', () => {
  assert.deepEqual(partition([40, 40, 20]), [{ groupStart: 0, groupEndExclusive: 3,
    cards: 100, firstPresentation: 1, lastPresentation: 100 }]);
  assert.deepEqual(partition(Array(21).fill(5)).map(chunk => chunk.cards), [35, 35, 35]);
  const edge = partition([...Array(20).fill(5), 1]);
  assert.equal(edge.reduce((sum, chunk) => sum + chunk.cards, 0), 101);
  assert.ok(edge.every(chunk => chunk.cards >= 30 && chunk.cards <= 40));
  for (const invalid of [null, [], [0], [-1], [41], [2.5], [NaN], Array(1)]) assert.throws(() => partition(invalid), /Invalid technical group weights/);
  for (const impossible of [[40, 40, 21], [20, 20, 20, 20, 21]]) assert.throws(
    () => partition(impossible), /No contiguous 30–40-card partition/);
}));
