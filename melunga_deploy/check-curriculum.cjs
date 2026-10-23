/* Build-time integrity check, using only Node built-ins and checkout-relative paths. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const source = path.join(root, 'docs/curriculum-v2/source');
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const fields = ['study', 'native', 'phon', 'reading'];
const pairs = ['fr-en', 'fr-es', 'fr-it', 'fr-zh', 'fr-ja', 'fr-ko', 'zh-fr'];
const report = read(path.join(root, 'docs/curriculum-v2/build-report.json'));
const manifest = read(path.join(source, 'manifest.json'));
for (const [file, digest] of Object.entries(manifest.files)) {
  assert.equal(hash(fs.readFileSync(path.join(source, file))), digest, 'source changed: ' + file);
}
assert.equal(hash(fs.readFileSync(path.join(source, 'placements-entree-v2.json'))), report.placementSha256);
for (const [file, digest] of Object.entries(report.runtimeFilesSha256)) {
  assert.equal(hash(fs.readFileSync(path.join(root, file))), digest, 'generated output stale: ' + file);
}
const app = fs.readFileSync(path.join(__dirname, 'app.html'), 'utf8');
for (const [name, digest] of Object.entries(report.classicContentLineSha256)) {
  const line = app.split('\n').find(row => row.startsWith('var ' + name + ' = '));
  assert(line, 'missing classic source ' + name);
  assert.equal(hash(line), digest, 'classic source changed: ' + name);
}
function equalPhrase(actual, expected) {
  for (const key of fields) assert.deepEqual(actual[key], expected[key], actual.id + ': ' + key);
}
const plan = read(path.join(source, 'parcours-corriges.json'));
const common = read(path.join(source, 'cadre-commun.json'));
let units = 0, steps = 0, copiedFields = 0, lessons = 0;
for (const id of pairs) {
  const data = read(path.join(__dirname, 'content/curriculum', id + '.json'));
  assert.equal(data.id, id);
  assert.deepEqual(data.levels.map(l => l.level), [1,2,3,4,5,6,7,8,9,10]);
  assert.deepEqual(data.levels[0].lessons.map(l => l.capability), ['01','07','08','09','02','03','04','05','06']);
  assert.equal(data.freeLibrary.length, 11);
  const bank = new Map(data.levels.flatMap(l => l.lessons).map(l => [l.id, l]));
  assert.equal(bank.size, data.levels.reduce((n,l) => n + l.lessons.length, 0), 'duplicate lesson id');
  for (const level of data.levels) for (const lesson of level.lessons) {
    lessons++;
    assert(lesson.steps.length && lesson.phrases.length);
    const phrases = new Map(lesson.phrases.map(p => [p.id, p]));
    const seen = new Set();
    for (const step of lesson.steps) {
      steps++;
      if (step.utterance) {
        assert(phrases.has(step.utterance), 'missing whole phrase');
        const phrase = phrases.get(step.utterance);
        if (phrase.kind === 'received') assert.equal(step.requiresProduction, false);
        if (step.kind === 'imitate') seen.add(step.utterance);
      }
      for (const pid of step.choices || []) assert(phrases.has(pid) && seen.has(pid), 'choice before whole preparation');
    }
  }
  const old = plan.pairs.find(p => p.id === id);
  for (const unit of old.levels.flatMap(l => l.units)) {
    const lesson = bank.get(unit.unitId);
    assert(lesson, 'source unit omitted: ' + unit.unitId);
    const sourceDocument = read(path.join(source, 'conversation', path.basename(unit.source.file)));
    const original = sourceDocument.units.find(u => u.id === unit.unitId);
    assert.equal(original.variants.length, 4);
    for (let i = 0; i < 4; i++) {
      equalPhrase(lesson.phrases[i], original.variants[i]);
      copiedFields += fields.filter(key => Object.hasOwn(original.variants[i], key)).length;
    }
    units++;
  }
  for (const lesson of data.freeLibrary) {
    assert.equal(lesson.sourceLevel, 1);
    assert.deepEqual(lesson, bank.get(lesson.id), 'free library diverges from course');
  }
  // Starter selections must remain the exact declared source copies, including
  // fragments. The Python compiler independently checks their parent offsets.
  const entry = common.l1Entry.pairs.find(p => p.id === id);
  const selection = new Map(Object.values(entry.records).map(r => [path.basename(entry.sourceFile) + ':' + r.id, r.copy]));
  for (const lesson of data.levels[0].lessons) for (const phrase of lesson.phrases) {
    assert(selection.has(phrase.id)); equalPhrase(phrase, selection.get(phrase.id));
  }
}
assert.equal(units, 841);
assert.equal(copiedFields, 11488);
assert.equal(lessons, report.counts.runtimeLessons);
assert.equal(steps, report.counts.runtimeSteps);
console.log(JSON.stringify({ok:true, pairs:pairs.length, levels:70, sourceUnits:units, copiedFields, lessons, steps,
  productionApproved:false}));
