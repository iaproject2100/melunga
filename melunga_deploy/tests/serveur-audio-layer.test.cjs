/* Historical-gate counterchecks use read-only memory substitutions. They never
 * alter a product file or silently substitute a changed runtime document. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { test } = require('node:test');
const ROOT = path.resolve(__dirname, '../..'), BASE = 'ef147deacf85b4a5631c1b05ff8050de7918ea1f';
const layer = require('./serveur-audio-layer.cjs');
const classification = require('./all-classification.cjs');
const layered = require('./native-routing-layer.cjs').projectedPaths;
const audioAssets = ['maquette-guidee.js', 'maquette-guidee.html', 'parcours-niveaux.html'].map(f => 'melunga_deploy/' + f);
function withChangedRead(filename, fn) {
  const original = fs.readFileSync, target = path.join(ROOT, filename);
  fs.readFileSync = function (file, ...args) {
    const value = original.call(this, file, ...args);
    if (typeof file !== 'string' || path.resolve(file) !== target) return value;
    return typeof value === 'string' ? value + '\n' : Buffer.concat([value, Buffer.from('\n')]);
  };
  try { fn(); } finally { fs.readFileSync = original; }
}

test('the complete actual audio edition passes before the original entry asset pins are checked', () => {
  const result = layer.validate(); assert.equal(result.layeredAssets, 3); assert.equal(result.newRuntimeAssets, 3); assert.equal(result.composedAssets, 9); assert.equal(result.layer, 'A+B');
  assert.equal(result.runtimeJson, 78); assert.ok(result.protectedFiles >= 27);
  classification.validateEntryAssets();
});

test('only the nine exact composed assets restore their exact complete ef147de bodies', () => {
  for (const filename of layered) {
    const before = execFileSync('git', ['show', BASE + ':' + filename], { cwd: ROOT, maxBuffer: 40 * 1024 * 1024 });
    assert.ok(layer.beforeAssetBytes(filename).equals(before));
  }
  for (const filename of ['melunga_deploy/maquette-guidee.css', 'melunga_deploy/content/course-access.json', 'melunga_deploy/lesson-audio.js']) {
    assert.ok(layer.beforeAssetBytes(filename).equals(fs.readFileSync(path.join(ROOT, filename))), 'no projection for ' + filename);
  }
});

test('a changed controller, either HTML or any native route source is rejected before projection', () => {
  for (const filename of layered) withChangedRead(filename, () => {
    assert.throws(() => classification.validateEntryAssets(), error => /whole native A\+B source/.test(error.message) && error.message.includes(filename));
  });
});

test('a different audio module or patch cannot be hidden behind the historical entry shell', () => {
  withChangedRead('melunga_deploy/lesson-audio.js', () => assert.throws(() => classification.validateEntryAssets(), /whole audio module is pinned/));
  withChangedRead('docs/audio-server/runtime-layer.patch', () => assert.throws(() => classification.validateEntryAssets(), /whole finite audio patch is pinned/));
});

test('runtime data, rights, pricing endpoint and home edits are rejected before any asset projection', () => {
  for (const filename of ['melunga_deploy/content/niveaux-progressifs/fr-es/L1.json',
    'melunga_deploy/content/course-access.json', 'melunga_deploy/netlify/functions/tts.mjs',
    'melunga_deploy/netlify/functions/get-pricing.mjs', 'melunga_deploy/index.html']) {
    withChangedRead(filename, () => assert.throws(() => layer.beforeAssetBytes(audioAssets[0]), error =>
      /actual protected bytes unchanged before projection|whole native A\+B source/.test(error.message) && error.message.includes(filename)));
  }
});

test('a caller cannot pass altered bytes and receive a valid historical controller', () => {
  for (const file of layered) {
    const changed = Buffer.concat([fs.readFileSync(path.join(ROOT, file)), Buffer.from('\n')]);
    assert.throws(() => layer.beforeAssetBytes(file, changed), /mutated caller bytes cannot be hidden/);
  }
});

test('another runtime script cannot be introduced by broadening the audio layer', () => {
  const original = fs.readdirSync;
  fs.readdirSync = function (filename, ...args) {
    const entries = original.call(this, filename, ...args);
    if (path.resolve(filename) === path.join(ROOT, 'melunga_deploy')) return [...entries, { name: 'unreviewed-player.js', isFile: () => true }];
    return entries;
  };
  try { assert.throws(() => layer.validate(), /no other runtime asset may be introduced or removed/); }
  finally { fs.readdirSync = original; }
});

test('all original historical constants remain unchanged', () => {
  const file = 'melunga_deploy/tests/all-classification.cjs';
  const before = execFileSync('git', ['show', BASE + ':' + file], { cwd: ROOT, encoding: 'utf8' });
  const after = fs.readFileSync(path.join(ROOT, file), 'utf8');
  for (const name of ['BASE', 'INPUT', 'CONTENT_INPUT', 'COMMIT', 'REGISTRY_SHAS', 'DESCRIPTOR_SHA256',
    'MANIFEST_SHA256', 'INDEPENDENT_CHECKER_SHA256', 'CLASSIFIED_JS_SHA256', 'CLASSIFIED_HTML_SHA256', 'ENTRY_ASSET_SHA256']) {
    const pattern = new RegExp('const ' + name + ' = [\\s\\S]*?;');
    assert.equal(after.match(pattern)?.[0], before.match(pattern)?.[0], 'whole historical constant ' + name);
  }
});
