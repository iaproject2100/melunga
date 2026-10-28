/* Finite Chirp preview layer. Only its sealed whole-file tuple is accepted;
 * historical gates see 4fafe31 after the actual delta and protected bytes pass.
 * Runtime course JSON is always read and checked as delivered, never projected. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');
const ROOT = path.resolve(__dirname, '../..');
const WEB = path.join(ROOT, 'melunga_deploy');
const BASE = '4fafe31271df3d5e7b601f41ee9056511860bd17';
const APPROVED_PREVIEW = 'ff4f1e0ca8b19ea93ea978a7372f43883eb18bca';
const APPROVED_SELECTION_VERSION = 'kartech-2026-10-27';
const FIXTURE = 'melunga_deploy/tests/fixtures/chirp-preview-layer.json';
const FIXTURE_SHA256 = '663c052b80602cb6ad9a1ea5f79766ae1aca43f9ecb5b8398dfb7e97193db5a5';
const MODIFIED = Object.freeze(['app.html', 'maquette-guidee.js', 'maquette-guidee.html', 'parcours-niveaux.html',
  'lesson-audio.js', 'course-i18n.js', 'content/course-locales/supplements.json', 'netlify/functions/tts.mjs',
  'index.html', 'desktop-home.js', 'course-login.js', 'course-native.js', 'course-access.js'].map(f => 'melunga_deploy/' + f));
const ADDED = Object.freeze(['voice-selection.js', 'comparaison-voix.html', 'voice-comparison.css', 'voice-comparison.js',
  'voice-comparison.webmanifest', 'netlify/functions/lib/chirp-catalog.mjs', 'course-startup.css', 'course-ambiences.css',
  'course-data.js', 'course-desktop.js', 'course-desktop.css'].map(f => 'melunga_deploy/' + f));
const APPROVED_AUDIO_ADDED = Object.freeze(['voice-selection.js', 'comparaison-voix.html', 'voice-comparison.css',
  'voice-comparison.js', 'voice-comparison.webmanifest', 'netlify/functions/lib/chirp-catalog.mjs'].map(f => 'melunga_deploy/' + f));
const NATIVE_CONTEXT = new Set(['app.html', 'course-access.js', 'course-login.js', 'desktop-home.js', 'entry-bridge.js',
  'index.html', 'maquette-guidee.html', 'maquette-guidee.js', 'parcours-niveaux.html'].map(f => 'melunga_deploy/' + f));
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const actual = file => fs.readFileSync(path.join(ROOT, file));
const baselineCache = new Map();
const approvedCache = new Map();
let cache = null;
function relative(file) {
  const value = path.relative(ROOT, path.resolve(ROOT, file));
  assert.ok(value && value !== '..' && !value.startsWith('..' + path.sep) && !path.isAbsolute(value), 'source stays inside repository');
  return value.split(path.sep).join('/');
}
function baseline(file) {
  if (!baselineCache.has(file)) baselineCache.set(file, execFileSync('git', ['show', BASE + ':' + file], {cwd: ROOT, maxBuffer: 40 * 1024 * 1024}));
  return baselineCache.get(file);
}
function approvedPreview(file) {
  if (!approvedCache.has(file)) approvedCache.set(file, execFileSync('git', ['show', APPROVED_PREVIEW + ':' + file], {cwd: ROOT, maxBuffer: 40 * 1024 * 1024}));
  return approvedCache.get(file);
}
const baselinePaths = execFileSync('git', ['ls-tree', '-r', '--name-only', BASE, '--', 'melunga_deploy'], {cwd: ROOT, encoding: 'utf8'}).trim().split('\n');
const rootRuntime = baselinePaths.filter(f => /^melunga_deploy\/[^/]+\.(?:js|css|html|webmanifest)$/.test(f)).sort();
const backend = baselinePaths.filter(f => /^melunga_deploy\/netlify\/functions\//.test(f)).sort();
const artwork = baselinePaths.filter(f => /\.(?:png|svg|webp)$/.test(f)).sort();
const manifestFile = 'melunga_deploy/content/niveaux-progressifs/manifest.json';
const manifest = JSON.parse(baseline(manifestFile));
const runtime = [manifestFile, ...manifest.pairs.flatMap(pair => ['melunga_deploy/' + pair.repertoirePath,
  ...pair.levels.map(level => 'melunga_deploy/' + level.dataPath)])];
const protectedFiles = [...new Set([...rootRuntime, ...backend, ...artwork, 'melunga_deploy/content/course-access.json'])].filter(f => !MODIFIED.includes(f)).sort();
function inventory(directory, prefix, recursive = false) {
  const files = [];
  for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
    if (entry.isFile()) files.push(prefix + '/' + entry.name);
    else if (recursive && entry.isDirectory()) files.push(...inventory(path.join(directory, entry.name), prefix + '/' + entry.name, true));
    else if (recursive) assert.fail('unrecognized server filesystem entry: ' + prefix + '/' + entry.name);
  }
  return files.sort();
}
function assertInventories() {
  const additions = ADDED.filter(f => /^melunga_deploy\/[^/]+\.(?:js|css|html|webmanifest)$/.test(f));
  const current = inventory(WEB, 'melunga_deploy').filter(f => /\.(?:js|css|html|webmanifest)$/.test(f));
  assert.deepEqual(current, [...rootRuntime, ...additions].sort(), 'no other runtime asset may be introduced or removed');
  assert.deepEqual(inventory(path.join(WEB, 'netlify/functions'), 'melunga_deploy/netlify/functions', true),
    [...backend, ...ADDED.filter(f => f.startsWith('melunga_deploy/netlify/functions/'))].sort(), 'no unreviewed server asset may be introduced or removed');
}
function fixture() {
  const raw = actual(FIXTURE);
  assert.equal(sha(raw), FIXTURE_SHA256, 'whole finite Chirp fixture is pinned');
  const f = JSON.parse(raw);
  assert.equal(f.version, 1); assert.equal(f.id, 'chirp-preview-exact-layer'); assert.equal(f.baseCommit, BASE);
  assert.equal(f.selectionVersion, APPROVED_SELECTION_VERSION, 'the frozen voice defaults record the owner decision');
  assert.equal(f.startupPresentationBaseCommit, APPROVED_PREVIEW, 'startup presentation retains the approved audio preview');
  assert.match(f.entryRoutingGuardSha256, /^[a-f0-9]{64}$/, 'the exact early course routing block is pinned');
  assert.deepEqual(Object.keys(f.modifiedFiles).sort(), [...MODIFIED].sort(), 'only explicit Chirp sources may be projected');
  assert.deepEqual(Object.keys(f.newFiles).sort(), [...ADDED].sort(), 'only explicit Chirp assets may be added');
  assert.equal(f.patchPath, 'melunga_deploy/tests/fixtures/chirp-preview-layer.patch');
  return f;
}
function pinMessage(file) {
  if (file === 'melunga_deploy/lesson-audio.js') return 'whole audio module is pinned: ' + file;
  if (NATIVE_CONTEXT.has(file)) return 'whole native A+B source before Chirp projection: ' + file;
  return 'actual protected bytes unchanged before projection: ' + file;
}
function sourceFunction(source, name) {
  const match = new RegExp('\\b(?:async\\s+)?function\\s+' + name + '\\s*\\([^)]*\\)\\s*\\{').exec(source);
  assert.ok(match, 'bounded source function ' + name);
  let i = match.index + match[0].length - 1, depth = 0, quote = null, escaped = false, lineComment = false, blockComment = false;
  for (; i < source.length; i++) {
    const c = source[i], next = source[i + 1];
    if (lineComment) { if (c === '\n') lineComment = false; continue; }
    if (blockComment) { if (c === '*' && next === '/') { blockComment = false; i++; } continue; }
    if (quote) { if (escaped) escaped = false; else if (c === '\\') escaped = true; else if (c === quote) quote = null; continue; }
    if (c === '/' && next === '/') { lineComment = true; i++; continue; }
    if (c === '/' && next === '*') { blockComment = true; i++; continue; }
    if (c === '"' || c === "'" || c === '`') { quote = c; continue; }
    if (c === '{') depth++; else if (c === '}' && !--depth) return source.slice(match.index, i + 1);
  }
  throw Error('Unclosed source function ' + name);
}
function replaceOnce(source, before, after, label) {
  const pieces = source.split(before);
  assert.equal(pieces.length, 2, 'one exact authorized app edit: ' + label);
  return pieces[0] + after + pieces[1];
}
function beforeCourseEntryApp(source) {
  const startMarker = '<style>html.course-entry-redirect body{visibility:hidden!important}</style>\n<script>\n/* Web lessons default to the course.';
  const endMarker = '})();\n</script>\n\n';
  const start = source.indexOf(startMarker);
  assert.ok(start >= 0 && source.indexOf(startMarker, start + 1) === -1, 'one exact early course routing block');
  const end = source.indexOf(endMarker, start);
  assert.ok(end >= start, 'bounded end of the early course routing block');
  const block = source.slice(start, end + endMarker.length);
  assert.equal(sha(Buffer.from(block)), fixture().entryRoutingGuardSha256, 'whole exact early course routing block');
  let before = replaceOnce(source, block, '', 'early routing block');
  before = replaceOnce(before, '<script src="course-login.js?v=2" defer></script>', '<script src="course-login.js?v=1" defer></script>', 'account helper cache version');
  before = replaceOnce(before, "  if(window.__courseStartRedirecting || !/[?&](start|checkout|login)=/.test(location.search)) return;",
    "  if(!/[?&](start|checkout|login)=/.test(location.search)) return;", 'old boot cover guard');
  return Buffer.from(before);
}
function beforeCourseDocumentFetch(file, source) {
  const lines = {
    'melunga_deploy/course-access.js': [
      "    const response = await (window.MelungaCourseData?.fetch || fetch)('content/course-access.json', {cache:'no-cache', credentials:'same-origin'});",
      "    const response = await fetch('content/course-access.json', {cache:'no-cache', credentials:'same-origin'});"
    ],
    'melunga_deploy/course-native.js': [
      "    const response = await (globalThis.MelungaCourseData?.fetch || fetch)(path, {credentials:'omit', cache:'no-cache', signal});",
      "    const response = await fetch(path, {credentials:'omit', cache:'no-cache', signal});"
    ]
  };
  assert.ok(Object.hasOwn(lines, file), 'one of the two explicit course document fetch callers');
  return Buffer.from(replaceOnce(source, lines[file][0], lines[file][1], 'read-only course document fetch in ' + file));
}
function assertInvariants() {
  assert.ok(actual('melunga_deploy/voice-selection.js').toString().includes("const SELECTION_VERSION = '" + APPROVED_SELECTION_VERSION + "';"), 'actual client records the approved voice selection version');
  assert.ok(actual('melunga_deploy/netlify/functions/lib/chirp-catalog.mjs').toString().includes("export const APPROVED_SELECTION_VERSION = '" + APPROVED_SELECTION_VERSION + "';"), 'actual server records the approved voice selection version');
  const app = actual('melunga_deploy/app.html').toString(), oldApp = baseline('melunga_deploy/app.html').toString();
  for (const name of ['DECKS', 'PEDAGOGY_FAMILIES']) {
    const lines = source => source.split('\n').filter(line => line.startsWith('var ' + name + ' = '));
    assert.equal(lines(app).length, 1); assert.equal(lines(oldApp).length, 1);
    assert.equal(lines(app)[0], lines(oldApp)[0], 'actual classic literal unchanged by Chirp: ' + name);
  }
  const auth = ['doLogout', 'loadPricing', 'rememberPermanentLogout', 'checkPaidStatus', 'unlock', 'loginExisting', 'showPaywall', 'hidePaywall'];
  for (const name of auth) assert.equal(sourceFunction(app, name), sourceFunction(oldApp, name), 'actual classic authentication/payment function unchanged by Chirp: ' + name);
  const progress = ['collectLevelProgressIds', 'levelProgress', 'loadKnownCards', 'saveKnownCard', 'saveCardDecision', 'markKnown', 'markForReview'];
  const js = actual('melunga_deploy/maquette-guidee.js').toString(), oldJs = baseline('melunga_deploy/maquette-guidee.js').toString();
  for (const name of progress) assert.equal(sourceFunction(js, name), sourceFunction(oldJs, name), 'actual progress function unchanged by Chirp: ' + name);
  const approvedJs = approvedPreview('melunga_deploy/maquette-guidee.js').toString();
  const audio = ['speak', 'stopAudio', 'setAudioPlaying', 'fillVoices'];
  for (const name of audio) assert.equal(sourceFunction(js, name), sourceFunction(approvedJs, name), 'startup preserves the approved complete audio function: ' + name);
  const approvedSources = ['melunga_deploy/app.html', 'melunga_deploy/lesson-audio.js', 'melunga_deploy/netlify/functions/tts.mjs',
    ...APPROVED_AUDIO_ADDED];
  for (const file of approvedSources) {
    const bytes = file === 'melunga_deploy/app.html' ? beforeCourseEntryApp(app) : actual(file);
    assert.ok(bytes.equals(approvedPreview(file)), 'startup leaves the approved audio/app source exact after the three pinned app routing edits: ' + file);
  }
  const access = actual('melunga_deploy/course-access.js').toString(), oldAccess = baseline('melunga_deploy/course-access.js').toString();
  const server = ['deviceId', 'checkServer', 'refresh', 'initialize', 'logout'];
  for (const name of server) assert.equal(sourceFunction(access, name), sourceFunction(oldAccess, name), 'actual server access contract unchanged by Chirp: ' + name);
  const normalizedFetchSources = ['melunga_deploy/course-access.js', 'melunga_deploy/course-native.js'];
  for (const file of normalizedFetchSources) assert.ok(beforeCourseDocumentFetch(file, actual(file).toString()).equals(baseline(file)),
    'whole course source unchanged after its one exact document fetch substitution: ' + file);
  return {classicAuthFunctions: auth, progressFunctions: progress, serverAccessFunctions: server, approvedAudioFunctions: audio,
    approvedAudioAppSources: approvedSources.length, normalizedAppRoutingEdits: 3, normalizedDocumentFetchSources: normalizedFetchSources,
    protectedArtwork: artwork.length};
}
function inputFiles() {
  const f = fixture();
  return [...new Set([__filename, ...[FIXTURE, f.patchPath, ...MODIFIED, ...ADDED, ...runtime, ...protectedFiles].map(file => path.join(ROOT, file))])];
}
function stamp(file) { const s = fs.statSync(file, {bigint: true}); return [s.dev, s.ino, s.mode, s.size, s.mtimeNs, s.ctimeNs].join(':'); }
function validate({force = false} = {}) {
  assertInventories();
  const f = fixture(), files = inputFiles();
  if (!force && cache && cache.reader === fs.readFileSync && cache.lister === fs.readdirSync && files.every(file => cache.stamps.get(file) === stamp(file))) return cache.summary;
  assert.equal(runtime.length, 78, '78 actual runtime JSON files, never projected');
  for (const file of [...runtime, ...protectedFiles]) assert.ok(actual(file).equals(baseline(file)), pinMessage(file));
  for (const file of MODIFIED) {
    assert.equal(sha(baseline(file)), f.modifiedFiles[file].beforeSha256, 'whole exact 4fafe31 source ' + file);
    assert.equal(sha(actual(file)), f.modifiedFiles[file].currentSha256, pinMessage(file));
  }
  for (const file of ADDED) assert.equal(sha(actual(file)), f.newFiles[file], 'whole finite new Chirp asset: ' + file);
  const patch = actual(f.patchPath);
  assert.equal(sha(patch), f.patchSha256, 'whole finite Chirp patch is pinned');
  const diff = execFileSync('git', ['diff', '--binary', '--no-ext-diff', '--no-textconv', '--unified=0', BASE, '--', ...MODIFIED], {cwd: ROOT, maxBuffer: 32 * 1024 * 1024});
  assert.ok(diff.equals(patch), 'actual complete Chirp delta equals its exact frozen patch');
  const invariants = assertInvariants();
  const summary = Object.freeze({layer: 'Chirp-preview', baseCommit: BASE, selectionVersion: APPROVED_SELECTION_VERSION, startupPresentationBaseCommit: APPROVED_PREVIEW,
    fixtureSha256: FIXTURE_SHA256, modifiedFiles: MODIFIED.length, newFiles: ADDED.length, runtimeJson: runtime.length, ...invariants});
  cache = {summary, reader: fs.readFileSync, lister: fs.readdirSync, stamps: new Map(files.map(file => [file, stamp(file)]))};
  return summary;
}
function beforeChirpBytes(file, bytes) {
  file = relative(file); validate();
  const current = actual(file);
  if (bytes !== undefined) assert.ok(Buffer.from(bytes).equals(current), 'mutated caller bytes cannot be hidden by Chirp: ' + file);
  return MODIFIED.includes(file) ? Buffer.from(baseline(file)) : current;
}
module.exports = Object.freeze({validate, beforeChirpBytes, inputFiles, baseCommit: BASE, modifiedPaths: MODIFIED, addedPaths: ADDED});

if (require.main === module) {
  const {test} = require('node:test');
  function changedRead(file, run) {
    const original = fs.readFileSync, target = path.join(ROOT, file);
    fs.readFileSync = function (name, ...args) {
      const bytes = original.call(this, name, ...args);
      if (typeof name !== 'string' || path.resolve(name) !== target) return bytes;
      return typeof bytes === 'string' ? bytes + '\n' : Buffer.concat([bytes, Buffer.from('\n')]);
    };
    try { run(); } finally { fs.readFileSync = original; }
  }
  test('sealed actual Chirp tuple preserves classic, access, progression and all 78 runtime JSON files', () => {
    const result = validate({force: true}); assert.equal(result.runtimeJson, 78);
    for (const file of MODIFIED) assert.ok(beforeChirpBytes(file).equals(baseline(file)));
    assert.ok(beforeChirpBytes(runtime[1]).equals(actual(runtime[1])), 'runtime data is not projected');
  });
  test('each actual modified or added Chirp asset is checked before any projection', () => {
    for (const file of [...MODIFIED, ...ADDED]) changedRead(file, () => assert.throws(() => beforeChirpBytes(MODIFIED[0]), error => error.message.includes(file)));
  });
  test('unknown runtime and server assets cannot broaden the finite layer', () => {
    const original = fs.readdirSync;
    for (const target of [WEB, path.join(WEB, 'netlify/functions/lib')]) {
      fs.readdirSync = function (directory, ...args) { const rows = original.call(this, directory, ...args); return path.resolve(directory) === target ? [...rows, {name: 'unreviewed-player.js', isFile: () => true}] : rows; };
      try { assert.throws(() => validate(), /no other runtime asset|no unreviewed server asset/); } finally { fs.readdirSync = original; }
    }
  });
  test('caller tampering, runtime edits and evidence edits are rejected rather than projected', () => {
    const file = MODIFIED[0]; assert.throws(() => beforeChirpBytes(file, Buffer.concat([actual(file), Buffer.from('\n')])), /mutated caller bytes/);
    changedRead(runtime[1], () => assert.throws(() => beforeChirpBytes(file), error => error.message.includes(runtime[1])));
    changedRead('melunga_deploy/melunga-logo.png', () => assert.throws(() => beforeChirpBytes(file), /melunga-logo\.png/));
    changedRead(FIXTURE, () => assert.throws(() => validate(), /whole finite Chirp fixture/));
    changedRead(fixture().patchPath, () => assert.throws(() => validate(), /whole finite Chirp patch/));
  });
}
