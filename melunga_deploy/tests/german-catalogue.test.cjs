/* Independent conservation and loader checks for the accepted German v3.1 import.
 * Local JSON/VM fixtures only; no account or speech provider is contacted. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');
const {test} = require('node:test');
const ROOT = path.resolve(__dirname, '../..');
const WEB = path.join(ROOT, 'melunga_deploy');
const BASE = '541afb7';
const SOURCE = 'tools/maquette-guidee/imports/de-deck-v3.1.json';
const SOURCE_SHA = '49d6f1cd3b2a44b4ab4efcbae4c5f58988ebc7e142ebb74b1505d4ce9e39d789';
const NATIVES = ['fr', 'en', 'es', 'it', 'zh', 'ja', 'ko'];
const MEANING = {fr:'frm', en:'en', es:'esm', it:'itm', zh:'cn', ja:'jam', ko:'kom'};
const PHON = {fr:'pf', en:'py', es:'ps', it:'pi', zh:'phon', ja:'py', ko:'py'};
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const read = file => fs.readFileSync(path.join(ROOT, file));
const json = file => JSON.parse(read(file));
const plain = value => JSON.parse(JSON.stringify(value));
const historic = file => execFileSync('git', ['show', BASE + ':' + file], {cwd:ROOT, maxBuffer:40 * 1024 * 1024});
const sourceBytes = read(SOURCE), original = JSON.parse(sourceBytes);
const bank = json('melunga_deploy/content/native-catalogue/de.json');
const manifest = json('melunga_deploy/content/native-catalogue/manifest.json');
const oldManifest = JSON.parse(historic('melunga_deploy/content/native-catalogue/manifest.json'));
const id = index => 'catalogue:de:' + index;

function fixture({hostname = 'melunga.com', paid = false, mutate} = {}) {
  const calls = [], storage = new Map([['ox_device', 'german-local-fixture']]);
  const context = {TextEncoder, TextDecoder, URL, URLSearchParams, AbortController,
    crypto:crypto.webcrypto, setTimeout, clearTimeout, CustomEvent:class {constructor(type) {this.type = type;}},
    location:{hostname, protocol:'https:', origin:'https://' + hostname},
    localStorage:{getItem:key => storage.get(key) ?? null, setItem:(key, value) => storage.set(key, String(value))},
    dispatchEvent:() => {}, addEventListener:() => {},
    MelungaCourseI18n:{t:(locale, text) => locale + ':' + text, theme:() => {throw Error('German neutral title uses an existing UI key');},
      levelTitle:(locale, level) => locale + ':L' + level, languageName:(locale, study) => locale + ':' + study,
      format:(locale, key, values) => locale + ':' + key + ':' + values.n},
    fetch:async (file, options) => {
      calls.push({file, options});
      if (file.startsWith('/.netlify/functions/check-status?')) return {ok:true, status:200, json:async () => ({paid})};
      assert.match(file, /^content\/(?:native-catalogue\/(?:manifest|de)|course-access)\.json$/, 'only declared local fixture documents');
      let bytes = read('melunga_deploy/' + file);
      if (mutate) bytes = mutate(file, bytes);
      return {ok:true, status:200, arrayBuffer:async () => Uint8Array.from(bytes).buffer, text:async () => bytes.toString()};
    }};
  context.window = context;context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(read('melunga_deploy/course-native.js').toString(), context, {filename:'course-native.js'});
  return {context, api:context.MelungaNativeCourses, calls,
    access() {vm.runInContext(read('melunga_deploy/course-access.js').toString(), context, {filename:'course-access.js'});return context.MelungaCourseAccess;}};
}

test('all 4,519 original German blocks and all 67,785 fields survive in their original order', () => {
  assert.equal(sha(sourceBytes), SOURCE_SHA, 'the accepted import is independently pinned');
  assert.equal(original.length, 4519);
  assert.equal(JSON.stringify(bank.cards), JSON.stringify(original), 'every string, category, level and property order is unchanged');
  assert.equal(original.reduce((sum, card) => sum + Object.keys(card).length, 0), 67785);
  assert.deepEqual(Object.fromEntries(Array.from({length:10}, (_, i) => [i + 1, original.filter(card => card.lv === i + 1).length])),
    {1:283, 2:545, 3:666, 4:594, 5:718, 6:432, 7:428, 8:401, 9:226, 10:226});
  assert.deepEqual(Object.fromEntries(['core','template','bonus','vocab','basics'].map(category => [category, original.filter(card => card.cat === category).length])),
    {core:3114, template:75, bonus:53, vocab:1213, basics:64});
  assert.equal(bank.sourceType, 'validated-import');assert.equal(bank.reviewedPairId, null);
  assert.equal(bank.importedSourceSha256, SOURCE_SHA);assert.equal(bank.importedSourcePath, SOURCE);
  const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object'
    ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
  assert.equal(bank.sourceDeckSha256, sha(Buffer.from(JSON.stringify(canonical(original)))));
  assert.equal(Object.hasOwn(bank, 'decksLiteralSha256'), false, 'an import never claims the classic literal as its source');
  assert.equal(sha(read('melunga_deploy/content/native-catalogue/de.json')), manifest.banks.de.sha256);
});

test('seven old banks, 78 reviewed runtime documents, rights and all old matrices remain byte-exact', () => {
  for (const code of NATIVES) {
    const file = 'melunga_deploy/content/native-catalogue/' + code + '.json';
    assert.ok(read(file).equals(historic(file)), file);
    assert.deepEqual(manifest.banks[code], oldManifest.banks[code]);
  }
  const reviewed = Object.keys(oldManifest.source.reviewedRuntimeSha256ByPath);
  assert.equal(reviewed.length, 78);
  for (const file of [...reviewed, oldManifest.source.historicalAccessPath]) assert.ok(read(file).equals(historic(file)), file);
  for (const section of ['pairs','coverageByPair','eligibilityGroups','historicalFreeGroups']) {
    for (const [key, value] of Object.entries(oldManifest[section])) assert.deepEqual(manifest[section][key], value, section + ':' + key);
  }
  for (const [key, value] of Object.entries(oldManifest.source)) assert.deepEqual(manifest.source[key], value, key);
  for (const [key, value] of Object.entries(oldManifest.policies)) assert.deepEqual(manifest.policies[key], value, key);
});

test('one neutral rubric per original level preserves active order and all 75 template reserves', () => {
  const seen = [];
  for (let level = 1; level <= 10; level++) {
    const row = bank.levels[level - 1];assert.equal(row.level, level);assert.equal(row.themes.length, 1);
    const theme = row.themes[0];assert.equal(theme.title, 'Toutes les leçons');assert.equal(theme.titleSource, 'interface');
    assert.equal(theme.photo.asset, 'assets/theme-scenes.webp');assert.ok(fs.existsSync(path.join(WEB, theme.photo.asset)));
    assert.deepEqual(theme.phraseIds, original.flatMap((card, index) => card.lv === level && card.cat !== 'template' ? [id(index)] : []));
    assert.deepEqual(row.reserveIds, original.flatMap((card, index) => card.lv === level && card.cat === 'template' ? [id(index)] : []));
    seen.push(...theme.phraseIds, ...row.reserveIds);
  }
  assert.equal(new Set(seen).size, 4519);assert.equal(seen.length, 4519);
  original.forEach((card, index) => {
    const reserved = card.cat === 'template', location = bank.locations[index];
    assert.deepEqual(location, [card.lv, reserved ? null : 'all-lessons', reserved ? 'incomplete' : card.cat === 'vocab' ? 'vocabulary' : 'utterance', null, reserved, null]);
  });
});

test('German is a target for the seven existing native languages, with original L1 access only', async () => {
  const {api} = fixture();
  assert.equal(api.pairIds.length, 49);assert.deepEqual(plain(api.reviewedPairIds), oldManifest.reviewedPairIds);
  assert.deepEqual(plain(api.pairIds).filter(pair => pair.endsWith('-de')), NATIVES.map(native => native + '-de'));
  assert.deepEqual(plain(api.pairIds).filter(pair => pair.startsWith('de-')), []);
  for (const pair of ['de-fr','de-en','de-de','fr-xx','xx-de']) assert.equal(api.isPair(pair), false, pair);
  const reviewedMetadata = json('melunga_deploy/content/niveaux-progressifs/manifest.json');
  const metadata = plain(api.metadata(reviewedMetadata));assert.equal(metadata.length, 42);
  for (const native of NATIVES) {
    const row = metadata.find(pair => pair.id === native + '-de');
    assert.equal(row.flag, '🇩🇪');assert.equal(row.nativeCatalogueSourcePair, null);
    assert.deepEqual(row.levels.map(level => level.level), [1,2,3,4,5,6,7,8,9,10]);
  }
  await api.ensureRights();
  for (const native of NATIVES) for (let index = 0; index < original.length; index++) {
    assert.equal(api.isEligible(native + '-de', id(index)), true);
    assert.equal(api.isHistoricalFree(native + '-de', id(index)), original[index].lv === 1);
  }
  for (const invalid of ['catalogue:de:4519','catalogue:de:01','catalogue:fr:0','catalogue:de:-1']) assert.equal(api.isEligible('fr-de', invalid), false);
});

test('all 70 German level views project exact native meaning and phonetic fields without losing source blocks', async () => {
  const {api, calls} = fixture();
  for (const native of NATIVES) {
    let active = 0, reserved = 0;
    for (let level = 1; level <= 10; level++) {
      const {pair, sourcePhraseMap, referenceMap} = await api.loadPair(native + '-de', level);
      assert.equal(sourcePhraseMap.size, 4519);assert.equal(referenceMap.size, 0);
      assert.equal(pair.themes.length, 1);assert.equal(pair.themes[0].title, native + ':Toutes les leçons');
      const expectedActive = original.flatMap((card, index) => card.lv === level && card.cat !== 'template' ? [id(index)] : []);
      assert.deepEqual(plain(pair.themes[0].phrases.map(model => model.id)), expectedActive);
      assert.equal(pair.totalPhrases, expectedActive.length);
      assert.equal(pair.totalCanonicalPhrases, original.filter(card => card.lv === level).length);
      assert.equal(pair.reservedPhrases, original.filter(card => card.lv === level && card.cat === 'template').length);
      const rows = [...pair.themes[0].phrases, ...pair.reserve];
      for (const model of rows) {
        const index = Number(model.id.split(':')[2]), card = original[index];
        assert.equal(model.study, card.t);assert.equal(model.native, card[MEANING[native]]);
        assert.equal(model.phon, card[PHON[native]]);assert.equal(model.reading, '');
        assert.equal(model.editorialLevel, card.lv);assert.equal(model.isTemplate, card.cat === 'template');
        assert.equal(model.source.collection, 'validated-import.de');assert.equal(model.source.sourceIndex, index);
        assert.equal(model.source.sourceLevel, card.lv);assert.equal(model.source.importedSourceSha256, SOURCE_SHA);
        assert.equal(model.source.fieldMap.native, MEANING[native]);assert.equal(model.source.fieldMap.phon, PHON[native]);
        assert.deepEqual(plain(model.source.originalFields), card);
        assert.equal(model.phoneticMode, ['ja','ko'].includes(native) ? 'english-fallback' : 'native-source');
        assert.equal(Object.hasOwn(model.source, 'decksLiteralSha256'), false);
      }
      const production = pair.themes[0].sequences.flatMap(sequence => sequence.phraseIds);
      assert.deepEqual(plain(production), expectedActive);
      for (const model of pair.reserve) assert.equal(production.includes(model.id), false);
      active += pair.totalPhrases;reserved += pair.reservedPhrases;
    }
    assert.equal(active, 4444);assert.equal(reserved, 75);
  }
  assert.equal(calls.filter(call => call.file === 'content/native-catalogue/de.json').length, 1);
  assert.equal(calls.some(call => call.file.includes('/.netlify/')), false);
});

test('production, paid and preview access use the existing account contract and exact German eligibility', async () => {
  for (const [hostname, paid, higherAllowed] of [['melunga.com',false,false],['melunga.com',true,true],['deploy-preview-123--chic-dragon-e2baf2.netlify.app',false,true]]) {
    const f = fixture({hostname, paid}), access = f.access();
    await f.api.ensureRights();await access.initialize();
    for (const native of NATIVES) for (const level of [1,2]) {
      const {pair} = await f.api.loadPair(native + '-de', level);
      assert(pair.themes[0].phrases.every(model => access.canLearn(pair.id, model, level) === (level === 1 || higherAllowed)));
      assert.equal(access.canLearn(pair.id, {...pair.themes[0].phrases[0], id:'catalogue:de:99999'}, level), false);
    }
    assert.equal(access.canLearn('de-fr', {id:'catalogue:fr:0', editorialLevel:1}, 1), false);
  }
});

test('source corruption fails closed and unsupported German-native routes never load', async () => {
  for (const target of ['content/native-catalogue/manifest.json','content/native-catalogue/de.json']) {
    const f = fixture({mutate:(file, bytes) => file === target ? Buffer.concat([bytes, Buffer.from(' ')]) : bytes});
    await assert.rejects(f.api.loadPair('fr-de', 1), /source fingerprint differs/);
  }
  const {api} = fixture();
  for (const pair of ['de-fr','de-en','de-de']) await assert.rejects(api.loadPair(pair, 1), /additional native pairs/);
  for (const level of [0,11,1.5]) await assert.rejects(api.loadPair('fr-de', level), /invalid level/);
});
