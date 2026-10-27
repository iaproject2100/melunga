/* Finite audio presentation layer: actual data and all other assets stay exact
 * before any historical source view becomes available. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const composedLayer = require('./native-routing-layer.cjs');
const ROOT = path.resolve(__dirname, '../..'), WEB = path.join(ROOT, 'melunga_deploy');
const BASE = 'ef147deacf85b4a5631c1b05ff8050de7918ea1f';
const AUDIO_COMMIT = 'd110366';
const PATCH = 'docs/audio-server/runtime-layer.patch';
const PATCH_SHA256 = '046138b8043992b46a282d8fe64db12113c15872279e95c0caeee11c7087d697';
const LAYER = Object.freeze({
  'melunga_deploy/maquette-guidee.js': Object.freeze({ before: '8243a2e44c0b56783df00947032a802a16f274a990c4e46c0b178332911529b4', after: 'f692662a58b0899253ddfd79c1b5be9041c14e362c84184bf406585a919b835d' }),
  'melunga_deploy/maquette-guidee.html': Object.freeze({ before: '33e6f13def069dc342447db0ba6b07a0efef7d17ab2b42abef71a2c567c8d2f3', after: '68b970eb02fa34ba96d3a9b11a8795cf51a2081a1396246e1bbd16222dc96a40' }),
  'melunga_deploy/parcours-niveaux.html': Object.freeze({ before: 'cbdabdd39b92a431060731cdf8f93dbbccbf2ef199aefa780f53845d3e37f58e', after: 'f4254397645269e1129566a0037392a4ab6accb40a62fa4c3911a3d46f9e0312' })
});
const MODULE = 'melunga_deploy/lesson-audio.js';
const MODULE_SHA256 = '5eda5fbd765f197b1c6a758e6a7d1b0dd88203f662a369bc667465048ce70e0d';
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const relative = filename => {
  const value = path.relative(ROOT, path.resolve(ROOT, filename));
  assert.ok(value && value !== '..' && !value.startsWith('..' + path.sep) && !path.isAbsolute(value), 'source stays inside repository');
  return value.split(path.sep).join('/');
};
const actual = filename => fs.readFileSync(path.join(ROOT, filename));
const baselineCache = new Map();
function baseline(filename) {
  if (!baselineCache.has(filename)) baselineCache.set(filename, execFileSync('git', ['show', BASE + ':' + filename], { cwd: ROOT, maxBuffer: 40 * 1024 * 1024 }));
  return baselineCache.get(filename);
}
const baselinePaths = execFileSync('git', ['ls-tree', '-r', '--name-only', BASE, '--', 'melunga_deploy'], { cwd: ROOT, encoding: 'utf8' }).trim().split('\n');
const rootRuntime = baselinePaths.filter(file => /^melunga_deploy\/[^/]+\.(?:js|css|html)$/.test(file)).sort();
const backend = baselinePaths.filter(file => /^melunga_deploy\/netlify\/functions\/[^/]+\.mjs$/.test(file)).sort();
const manifestPath = 'melunga_deploy/content/niveaux-progressifs/manifest.json';
const manifest = JSON.parse(baseline(manifestPath));
const runtime = [manifestPath, ...manifest.pairs.flatMap(pair => ['melunga_deploy/' + pair.repertoirePath,
  ...pair.levels.map(level => 'melunga_deploy/' + level.dataPath)])];
const protectedFiles = [...new Set([...rootRuntime.filter(file => !composedLayer.projectedPaths.includes(file)),
  ...backend, 'melunga_deploy/content/course-access.json'])].sort();

function validate() {
  assert.equal(runtime.length, 78, 'actual historical runtime stays at 78 whole JSON files');
  assert.ok(!baselinePaths.includes(MODULE), 'the module is the single new root runtime');
  const currentRoot = fs.readdirSync(WEB, { withFileTypes: true }).filter(entry => entry.isFile() && /\.(?:js|css|html)$/.test(entry.name))
    .map(entry => 'melunga_deploy/' + entry.name).sort();
  const additionalRuntime = [MODULE, 'melunga_deploy/course-i18n.js', 'melunga_deploy/course-native.js'];
  assert.deepEqual(currentRoot, [...rootRuntime, ...additionalRuntime].sort(), 'no other runtime asset may be introduced or removed');
  const currentBackend = fs.readdirSync(path.join(WEB, 'netlify/functions')).filter(file => file.endsWith('.mjs'))
    .map(file => 'melunga_deploy/netlify/functions/' + file).sort();
  assert.deepEqual(currentBackend, backend, 'server function inventory stays exact');
  for (const file of [...runtime, ...protectedFiles]) assert.ok(actual(file).equals(baseline(file)), 'actual protected bytes unchanged before projection: ' + file);
  for (const [file, pin] of Object.entries(LAYER)) {
    assert.equal(sha(baseline(file)), pin.before, 'exact pinned before: ' + file);
    const audioBeforeComposition = execFileSync('git', ['show', AUDIO_COMMIT + ':' + file], { cwd: ROOT, maxBuffer: 40 * 1024 * 1024 });
    assert.equal(sha(audioBeforeComposition), pin.after, 'exact reviewed B audio edition before composition: ' + file);
  }
  assert.equal(sha(actual(MODULE)), MODULE_SHA256, 'whole audio module is pinned');
  const patch = actual(PATCH);
  assert.equal(sha(patch), PATCH_SHA256, 'whole finite audio patch is pinned');
  const originalAudioPatch = execFileSync('git', ['show', AUDIO_COMMIT + ':' + PATCH], { cwd: ROOT, maxBuffer: 4 * 1024 * 1024 });
  assert.ok(originalAudioPatch.equals(patch), 'the original three-asset B patch remains immutable evidence');
  const composition = composedLayer.validate({force:true});
  return { baseline: BASE, layer: 'A+B', layeredAssets: 3, composedAssets: composition.modifiedFiles,
    newRuntimeAssets: additionalRuntime.length, runtimeJson: runtime.length, protectedFiles: protectedFiles.length };
}

function beforeAssetBytes(filename, bytes) {
  filename = relative(filename);
  const input = bytes === undefined ? actual(filename) : Buffer.from(bytes);
  if (!composedLayer.projectedPaths.includes(filename)) return input;
  validate();
  assert.ok(input.equals(actual(filename)), 'mutated caller bytes cannot be hidden: ' + filename);
  return composedLayer.beforeBytes(filename);
}
function inputFiles() { return [__filename, path.join(ROOT, PATCH), path.join(ROOT, MODULE), ...composedLayer.inputFiles(),
  ...runtime.concat(protectedFiles).map(file => path.join(ROOT, file))]; }
module.exports = Object.freeze({ validate, beforeAssetBytes, inputFiles });
