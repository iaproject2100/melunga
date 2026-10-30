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
const THEMES = 'tools/maquette-guidee/imports/de-themes-v1.json';
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
const editorial = json(THEMES);
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
    MelungaCourseI18n:{t:(locale, text) => locale + ':' + text, theme:(locale, text) => locale + ':' + text,
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

test('semantic photo themes partition all source cards and retain original order within each theme', () => {
  const seen = [];
  assert.equal(editorial.placements.length, 4519);
  assert.deepEqual(editorial.placements.map(row => row.index), original.map((_, index) => index));
  for (let level = 1; level <= 10; level++) {
    const row = bank.levels[level - 1];assert.equal(row.level, level);assert.ok(row.themes.length >= 8);
    assert.equal(new Set(row.themes.map(theme => theme.id)).size, row.themes.length);
    for (const theme of row.themes) {
      assert.notEqual(theme.id, 'all-lessons');assert.notEqual(theme.title, 'Toutes les leçons');
      assert.equal(theme.id, level === 1 && !theme.domain.startsWith('vocab-') && theme.domain !== 'nombres'
        ? theme.domain : 'L' + level + '-' + theme.domain, 'theme identities follow the existing language catalogue');
      assert.ok(theme.title.length > 0);assert.ok(fs.existsSync(path.join(WEB, theme.photo.asset)));
      assert.ok(['situations', 'vocabulary'].includes(theme.section));
      const wanted = editorial.placements.filter(placement => original[placement.index].lv === level
        && !placement.isTemplate && placement.domain === theme.domain).map(placement => id(placement.index));
      assert.ok(wanted.length > 0);assert.deepEqual(theme.phraseIds, wanted, 'original source order inside ' + theme.id);
      assert.equal(theme.section, theme.domain.startsWith('vocab-') || theme.domain === 'nombres' ? 'vocabulary' : 'situations');
      seen.push(...theme.phraseIds);
    }
    assert.deepEqual(row.reserveIds, original.flatMap((card, index) => card.lv === level && card.cat === 'template' ? [id(index)] : []));
    seen.push(...row.reserveIds);
  }
  assert.equal(new Set(seen).size, 4519);assert.equal(seen.length, 4519);
  original.forEach((card, index) => {
    const placement = editorial.placements[index], reserved = card.cat === 'template';
    const theme = bank.levels[card.lv - 1].themes.find(row => row.domain === placement.domain);
    assert.equal(placement.isTemplate, reserved);
    assert.deepEqual(bank.locations[index], [card.lv, reserved ? null : theme.id, placement.contentType,
      placement.lexicalClass, reserved, null]);
  });
  assert.equal(bank.levels[0].themes[0].id, 'saluer');
  assert.equal(bank.levels[0].themes[0].phraseIds.length, 31, 'the first German lesson is a focused greeting theme');
  const photos = ['saluer','repas','deplacements'].map(domain => {
    const theme = bank.levels[0].themes.find(row => row.domain === domain);assert.ok(theme);
    return JSON.stringify(theme.photo);
  });
  assert.equal(new Set(photos).size, 3, 'greetings, restaurant and travel use different photo scenes');
});

test('German meanings independently distinguish situations, lexical units, numbers and unfinished templates', () => {
  const examples = [
    ['Hallo!', 'saluer', 'utterance', null],
    ['Ich verstehe nicht.', 'comprendre', 'utterance', null],
    ['Die Rechnung, bitte.', 'repas', 'utterance', null],
    ['Wo ist der Bahnhof?', 'deplacements', 'utterance', null],
    ['Ich habe Hunger.', 'ressentis', 'utterance', null],
    ['mein Vater', 'vocab-personnes', 'vocabulary', 'other'],
    ['zwölf', 'nombres', 'number', null],
    ['Der Film war gut; die Musik war aber zu laut.', 'decrire', 'utterance', null],
    ['Ich möchte einen Tisch für zwei Personen reservieren.', 'repas', 'utterance', null],
    ['Ich fahre morgen mit dem Zug nach Berlin.', 'deplacements', 'utterance', null],
    ['Rufen Sie einen Krankenwagen!', 'ressentis', 'utterance', null],
    ['Der Vertrag ist unterschriftsreif.', 'travail', 'utterance', null]
  ];
  for (const [german, domain, contentType, lexicalClass] of examples) {
    const index = original.findIndex(card => card.t === german);assert.ok(index >= 0, german);
    const card = original[index], theme = bank.levels[card.lv - 1].themes.find(row => row.phraseIds.includes(id(index)));
    assert.ok(theme, german);assert.equal(theme.domain, domain, german);
    assert.equal(bank.locations[index][2], contentType, german);assert.equal(bank.locations[index][3], lexicalClass, german);
  }
  assert.equal(original.find(card => card.t === 'Der Film war gut; die Musik war aber zu laut.').cat, 'vocab',
    'a complete German utterance is classified by meaning even when its source category says vocab');
  const index = original.findIndex(card => card.t === 'Es würde mich freuen, wenn …');assert.ok(index >= 0);
  assert.deepEqual(bank.locations[index], [7, null, 'incomplete', null, true, null]);
});

test('all 240 German theme definitions resolve through the seven real interface dictionaries', () => {
  const context = vm.createContext({});context.window = context;
  vm.runInContext(read('melunga_deploy/course-i18n.js').toString(), context, {filename:'course-i18n.js'});
  const dictionary = context.MelungaCourseI18n;
  assert.deepEqual(plain(dictionary.locales), NATIVES);
  let definitions = 0, translations = 0;
  for (const [level, themes] of Object.entries(editorial.levelThemes)) for (const [domain, definition] of Object.entries(themes)) {
    definitions++;
    for (const native of NATIVES) {
      const label = native + '/L' + level + '/' + domain;
      let title;
      assert.doesNotThrow(() => {title = dictionary.theme(native, definition.title);}, label);
      assert.equal(typeof title, 'string', label);assert.ok(title.trim().length > 0, label);
      if (native === 'fr') assert.doesNotMatch(title, /[\u3400-\u9fff]/, label + ' has a French title');
      translations++;
    }
  }
  assert.equal(definitions, 240, 'unused definitions are checked alongside populated themes');
  assert.equal(translations, 1680);
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
      assert.equal(pair.themes.length, bank.levels[level - 1].themes.length);
      const expectedActive = original.flatMap((card, index) => card.lv === level && card.cat !== 'template' ? [id(index)] : []);
      const activeModels = pair.themes.flatMap(theme => theme.phrases);
      assert.deepEqual(plain(activeModels.map(model => model.id)).sort(), [...expectedActive].sort());
      assert.equal(pair.totalPhrases, expectedActive.length);
      assert.equal(pair.totalCanonicalPhrases, original.filter(card => card.lv === level).length);
      assert.equal(pair.reservedPhrases, original.filter(card => card.lv === level && card.cat === 'template').length);
      const rows = [...activeModels, ...pair.reserve];
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
      const production = [];
      for (const theme of pair.themes) {
        const definition = bank.levels[level - 1].themes.find(row => row.id === theme.id);assert.ok(definition);
        assert.equal(theme.title, native + ':' + definition.title);
        assert.deepEqual(plain(theme.phrases.map(model => model.id)), definition.phraseIds);
        const sequenceIds = theme.sequences.flatMap(sequence => sequence.phraseIds);
        assert.deepEqual(plain(sequenceIds), definition.phraseIds, 'prepared groups keep original order inside ' + theme.id);
        production.push(...sequenceIds);
      }
      assert.deepEqual(plain(production).sort(), [...expectedActive].sort());
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
      assert(pair.themes.every(theme => theme.phrases.every(model => access.canLearn(pair.id, model, level) === (level === 1 || higherAllowed))));
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
