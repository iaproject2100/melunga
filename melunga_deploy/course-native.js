/* Source-verbatim native catalogue views. Reviewed pair bundles are never projected here. */
(() => {
  'use strict';
  const MANIFEST_SHA256 = '6ec2f35df31e116910cd61eef648732878676dd2e5ea7fb4d7c94e45724b5c64';
  const ROOT = 'content/native-catalogue/';
  const languages = Object.freeze(['fr', 'en', 'es', 'it', 'zh', 'ja', 'ko']);
  const reviewedPairIds = Object.freeze(['fr-en', 'fr-es', 'fr-it', 'fr-zh', 'fr-ja', 'fr-ko', 'zh-fr']);
  const pairIds = Object.freeze(languages.flatMap(native => languages.filter(study => study !== native).map(study => native + '-' + study)));
  const reviewed = new Set(reviewedPairIds), validPairs = new Set(pairIds);
  const cardCounts = Object.freeze({fr:4500, en:4502, es:4672, it:4509, zh:4903, ja:4509, ko:4520});
  const basePairs = Object.freeze({fr:'zh-fr', en:'fr-en', es:'fr-es', it:'fr-it', zh:'fr-zh', ja:'fr-ja', ko:'fr-ko'});
  const flags = Object.freeze({fr:'🇫🇷', en:'🇬🇧', es:'🇪🇸', it:'🇮🇹', zh:'🇨🇳', ja:'🇯🇵', ko:'🇰🇷'});
  const contentTypes = new Set(['utterance', 'vocabulary', 'number', 'incomplete', 'review']);
  let manifest = null, manifestPromise = null;
  const eligibleByPair = new Map(), freeByPair = new Map(), bankCache = new Map(), modelCache = new Map();

  function requireValue(condition, message) {
    if (!condition) throw new Error('Native catalogue: ' + message);
  }
  const isPair = id => typeof id === 'string' && validPairs.has(id);
  const isReviewed = id => typeof id === 'string' && reviewed.has(id);
  const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);
  function freeze(value) {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      for (const child of Object.values(value)) freeze(child);
      Object.freeze(value);
    }
    return value;
  }
  function aborted(signal) {
    if (!signal?.aborted) return;
    const error = new Error('Native catalogue request aborted'); error.name = 'AbortError'; throw error;
  }
  function catalogueIndex(pairId, id) {
    if (!isPair(pairId) || typeof id !== 'string') return null;
    const study = pairId.split('-')[1];
    const match = /^catalogue:([a-z]{2}):(0|[1-9]\d*)$/.exec(id);
    if (!match || match[1] !== study) return null;
    const index = Number(match[2]);
    return Number.isSafeInteger(index) && index < cardCounts[study] ? index : null;
  }
  const isEligible = (pairId, id) => {
    const index = catalogueIndex(pairId, id);
    return index !== null && eligibleByPair.get(pairId)?.has(index) === true;
  };
  const isHistoricalFree = (pairId, id) => {
    const index = catalogueIndex(pairId, id);
    return index !== null && freeByPair.get(pairId)?.has(index) === true;
  };
  async function checkedJson(path, expected, signal) {
    aborted(signal);
    requireValue(globalThis.crypto?.subtle && /^[a-f0-9]{64}$/.test(expected), 'SHA-256 verification unavailable');
    const response = await fetch(path, {credentials:'omit', cache:'no-cache', signal});
    requireValue(response.ok, 'source unavailable: ' + path);
    const bytes = await response.arrayBuffer();
    aborted(signal);
    const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
    const actual = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
    requireValue(actual === expected, 'source fingerprint differs: ' + path);
    return JSON.parse(new TextDecoder().decode(bytes));
  }
  function indices(values, limit) {
    requireValue(Array.isArray(values) && values.every((index, rank) => Number.isInteger(index)
      && index >= 0 && index < limit && (!rank || index > values[rank - 1])), 'invalid source index set');
    return new Set(values);
  }
  function validateManifest(document) {
    requireValue(document?.version === 1 && document.id === 'native-catalogue-35-source-views'
      && document.sourceSnapshotCommit === 'ef147deacf85b4a5631c1b05ff8050de7918ea1f'
      && same(document.languageIds, languages) && same(document.pairIds, pairIds)
      && same(document.reviewedPairIds, reviewedPairIds)
      && same(document.derivedPairIds, pairIds.filter(id => !reviewed.has(id)))
      && Object.keys(document.pairs || {}).length === 42, 'invalid pair domain');
    requireValue(document.sourceCardCount === 32115 && document.activeCatalogueCount === 30909
      && document.reservedCatalogueCount === 1206 && document.excludedModernExtraCount === 1539
      && document.source?.reviewedHistoricalFreeIdsVerified === 2218
      && document.newTranslationsCreated === 0 && document.newPhoneticsCreated === 0
      && document.reviewedRuntimeModified === false, 'invalid source inventory');
    const eligibility = new Map(), historical = new Map();
    for (const pair of pairIds) {
      const [native, study] = pair.split('-'), policy = document.pairs[pair], bank = document.banks?.[study];
      requireValue(policy?.nativeLanguage === native && policy.studyLanguage === study
        && bank?.path === ROOT + study + '.json' && /^[a-f0-9]{64}$/.test(bank.sha256)
        && bank.sourceCardCount === cardCounts[study] && bank.reviewedPairId === basePairs[study], 'invalid pair policy');
      const allowed = indices(document.eligibilityGroups?.[policy.eligibilityGroup], cardCounts[study]);
      const free = indices(document.historicalFreeGroups?.[policy.historicalFreeGroup], cardCounts[study]);
      requireValue(allowed.size === policy.eligibleCount && free.size === policy.historicalFreeCount
        && [...free].every(index => allowed.has(index)), 'invalid eligibility or historical access policy');
      eligibility.set(pair, allowed); historical.set(pair, free);
    }
    for (const pair of pairIds) {eligibleByPair.set(pair, eligibility.get(pair)); freeByPair.set(pair, historical.get(pair));}
    return freeze(document);
  }
  async function ensureRights() {
    if (manifest) return manifest;
    if (!manifestPromise) manifestPromise = checkedJson(ROOT + 'manifest.json', MANIFEST_SHA256)
      .then(document => {manifest = validateManifest(document); return manifest;})
      .catch(error => {manifestPromise = null; throw error;});
    return manifestPromise;
  }
  function i18n() {
    const language = globalThis.MelungaCourseI18n;
    requireValue(language && ['t', 'theme', 'levelTitle', 'languageName', 'format'].every(key => typeof language[key] === 'function'), 'native interface dictionary unavailable');
    return language;
  }
  function metadata(reviewedManifest) {
    requireValue(Array.isArray(reviewedManifest?.pairs) && reviewedPairIds.every(id =>
      reviewedManifest.pairs.some(pair => pair.id === id && pair.nativeLanguage + '-' + pair.studyLanguage === id)), 'reviewed metadata missing');
    const dictionary = i18n();
    return pairIds.filter(id => !reviewed.has(id)).map(id => {
      const [native, study] = id.split('-');
      return {id, nativeLanguage:native, studyLanguage:study, flag:flags[study],
        name:dictionary.languageName(native, study), nativeCatalogue:true, nativeCatalogueSourcePair:basePairs[study],
        levels:Array.from({length:10}, (_, index) => ({level:index + 1, title:dictionary.levelTitle(native, index + 1)}))};
    });
  }
  function validateBank(bank, study, descriptor, source) {
    requireValue(bank?.version === 1 && bank.id === 'native-catalogue-' + study && bank.studyLanguage === study
      && bank.reviewedPairId === basePairs[study] && bank.decksLiteralSha256 === source.decksLiteralSha256
      && Array.isArray(bank.cards) && bank.cards.length === cardCounts[study]
      && Array.isArray(bank.locations) && bank.locations.length === bank.cards.length
      && same(bank.locationFields, ['editorialLevel', 'themeId', 'contentType', 'lexicalClass', 'isTemplate', 'lexicalConceptId'])
      && Array.isArray(bank.levels) && bank.levels.length === 10, 'invalid source bank');
    const seen = new Set(); let active = 0, reserved = 0;
    bank.cards.forEach((card, index) => {
      const location = bank.locations[index];
      requireValue(card && typeof card.t === 'string' && card.t.length > 0
        && Number.isInteger(card.lv) && card.lv >= 1 && card.lv <= 10
        && Array.isArray(location) && location.length === 6 && Number.isInteger(location[0])
        && location[0] >= 1 && location[0] <= 10 && (location[1] === null || typeof location[1] === 'string')
        && contentTypes.has(location[2]) && typeof location[4] === 'boolean', 'invalid whole source model');
    });
    bank.levels.forEach((level, rank) => {
      requireValue(level.level === rank + 1 && Array.isArray(level.themes) && Array.isArray(level.reserveIds), 'invalid source level');
      const themes = new Set();
      for (const theme of level.themes) {
        requireValue(typeof theme.id === 'string' && !themes.has(theme.id) && typeof theme.title === 'string'
          && Array.isArray(theme.phraseIds) && theme.phraseIds.length > 0, 'invalid source theme');
        themes.add(theme.id);
        for (const id of theme.phraseIds) {
          const index = catalogueIndex(basePairs[study], id);
          requireValue(index !== null && !seen.has(index) && bank.locations[index][0] === level.level
            && bank.locations[index][1] === theme.id && bank.locations[index][4] === false
            && ['utterance', 'vocabulary', 'number'].includes(bank.locations[index][2]), 'invalid active source placement');
          seen.add(index);active += 1;
        }
      }
      for (const id of level.reserveIds) {
        const index = catalogueIndex(basePairs[study], id);
        requireValue(index !== null && !seen.has(index) && bank.locations[index][0] === level.level
          && bank.locations[index][1] === null, 'invalid reserved source placement');
        seen.add(index);reserved += 1;
      }
    });
    requireValue(seen.size === bank.cards.length && active === descriptor.activeCatalogueCount
      && reserved === descriptor.reservedCatalogueCount, 'source partition differs');
    return freeze(bank);
  }
  async function sourceBank(study, signal) {
    aborted(signal);
    if (bankCache.has(study)) return bankCache.get(study);
    const document = await ensureRights(), descriptor = document.banks[study];
    aborted(signal);
    const bank = validateBank(await checkedJson(descriptor.path, descriptor.sha256, signal), study, descriptor, document.source);
    bankCache.set(study, bank);
    while (bankCache.size > 2) bankCache.delete(bankCache.keys().next().value);
    return bank;
  }
  function sourceModels(pairId, bank, document) {
    if (modelCache.has(pairId)) return modelCache.get(pairId);
    const [native, study] = pairId.split('-'), policy = document.policies, result = new Map();
    const nativeField = policy.meaningFields[native];
    const requestedPhoneticField = (study === 'zh' ? policy.chinesePhoneticFields : policy.phoneticFields)[native];
    const definitions = new Map(bank.levels.flatMap(level => level.themes.map(theme => [level.level + ':' + theme.id, theme])));
    for (const index of document.eligibilityGroups[document.pairs[pairId].eligibilityGroup]) {
      const raw = bank.cards[index], location = bank.locations[index], id = 'catalogue:' + study + ':' + index;
      requireValue(typeof raw[nativeField] === 'string' && raw[nativeField].trim().length > 0, 'missing requested native meaning');
      let phon = raw[requestedPhoneticField] || '', phoneticField = requestedPhoneticField;
      let phoneticMode = phon ? 'native-source' : 'unavailable';
      if (!phon && native !== 'zh' && raw.py) {
        phon = raw.py;phoneticField = 'py';phoneticMode = study === 'zh' ? 'pinyin-fallback' : 'english-fallback';
      }
      requireValue(typeof phon === 'string', 'invalid source phonetic');
      const definition = location[1] === null ? null : definitions.get(location[0] + ':' + location[1]);
      requireValue(location[1] === null || definition, 'unknown source theme');
      const model = {id, study:raw.t, native:raw[nativeField], phon, reading:study === 'zh' ? raw.py || '' : '',
        speaker:'A', kind:'learner', isTemplate:location[4], contentType:location[2], editorialLevel:location[0],
        phoneticMode, phoneticSourceField:phoneticField, nativeCatalogue:true, nativeCatalogueReserved:location[1] === null,
        source:{collection:'DECKS.' + study, sourceIndex:index, sourceLevel:raw.lv,
          fieldMap:{study:'t', native:nativeField, phon:phoneticField, ...(study === 'zh' ? {reading:'py'} : {})},
          decksLiteralSha256:document.source.decksLiteralSha256, nativeCataloguePath:ROOT + study + '.json', classicFields:raw},
        placement:{domain:definition?.domain || 'reserve', themeId:location[1], section:definition?.section || 'reserve',
          classification:'existing-catalogue-native-source-view', plannedPrerequisiteIndices:[]}};
      if (location[3] !== null) model.lexicalClass = location[3];
      if (location[5] !== null) model.lexicalConceptId = location[5];
      if (location[1] === null) model.canonicalReserveLocation = {pairId, level:location[0], themeId:null};
      result.set(id, freeze(model));
    }
    modelCache.set(pairId, result);
    while (modelCache.size > 2) modelCache.delete(modelCache.keys().next().value);
    return result;
  }
  function sequences(pairId, level, themeId, phrases, dictionary, native) {
    const result = [];
    for (let offset = 0; offset < phrases.length; offset += 5) {
      const batch = phrases.slice(offset, offset + 5), number = result.length + 1;
      const id = pairId + ':L' + level + ':' + themeId + ':native-catalogue:' + number;
      const steps = [];
      batch.forEach((phrase, index) => {
        const prefix = id + ':' + index;
        for (const kind of ['understand', 'imitate', 'choose-and-recall']) {
          const step = {id:prefix + ':' + kind, kind, utterance:phrase.id, wholePhrase:phrase.contentType === 'utterance',
            contentType:phrase.contentType, requiresProduction:kind !== 'understand', isReview:false, isContextReuse:false};
          if (kind === 'choose-and-recall') step.preparedInSteps = {understoodInStep:prefix + ':understand', imitatedInStep:prefix + ':imitate'};
          steps.push(step);
        }
      });
      result.push({id, title:dictionary.format(native, 'sequence', {n:number}), phraseIds:batch.map(phrase => phrase.id), preparationIds:[], steps});
    }
    return result;
  }
  function counts(phrases) {
    return Object.fromEntries([...contentTypes].map(type => [type, phrases.filter(phrase => phrase.contentType === type).length]));
  }
  function lexicalCounts(phrases) {
    const result = {};
    for (const phrase of phrases) if (phrase.contentType === 'vocabulary') result[phrase.lexicalClass] = (result[phrase.lexicalClass] || 0) + 1;
    return Object.fromEntries(Object.entries(result).sort(([left], [right]) => left.localeCompare(right)));
  }
  async function loadPair(pairId, level, {signal} = {}) {
    requireValue(isPair(pairId) && !isReviewed(pairId), 'only the 35 additional native pairs use this loader');
    requireValue(Number.isInteger(level) && level >= 1 && level <= 10, 'invalid level');
    aborted(signal);
    const document = await ensureRights(), [native, study] = pairId.split('-');
    const bank = await sourceBank(study, signal), models = sourceModels(pairId, bank, document), dictionary = i18n();
    aborted(signal);
    const sourceLevel = bank.levels[level - 1], themes = [];
    for (const definition of sourceLevel.themes) {
      const phrases = definition.phraseIds.filter(id => models.has(id)).map(id => models.get(id));
      if (!phrases.length) continue;
      const kinds = [...new Set(phrases.map(phrase => phrase.contentType))].sort();
      const concepts = new Set(phrases.map(phrase => phrase.lexicalConceptId || JSON.stringify([phrase.study, phrase.native])));
      const theme = {...definition, title:dictionary.theme(native, definition.title), phrases,
        contentType:kinds.length === 1 ? kinds[0] : 'mixed', totalPhrases:phrases.length,
        reviewReferences:[], contextReferences:[], newCount:phrases.length, reviewCount:0, reuseCount:0,
        presentedCount:phrases.length, pedagogicalConceptCount:concepts.size, densityStatus:'native-catalogue-source-view',
        presentationOrder:'original-source-order-groups-of-five', nativeCatalogue:true,
        sequences:sequences(pairId, level, definition.id, phrases, dictionary, native)};
      delete theme.phraseIds;
      if (kinds.length > 1) theme.contentTypes = kinds;
      themes.push(theme);
    }
    const reserve = sourceLevel.reserveIds.filter(id => models.has(id)).map(id => models.get(id));
    const active = themes.flatMap(theme => theme.phrases), rows = active.concat(reserve);
    const pair = {version:1, status:'existing-source-native-view', id:pairId, pairId,
      nativeLanguage:native, studyLanguage:study, flag:flags[study], name:dictionary.languageName(native, study),
      level, levelTitle:dictionary.levelTitle(native, level), themes, heldThemes:[], reserve,
      totalPhrases:active.length, totalCanonicalPhrases:rows.length, counts:counts(rows), lexicalClassCounts:lexicalCounts(rows),
      reservedPhrases:reserve.length, heldPhrases:0, visibleCanonicalPhrases:active.length,
      presentedCount:active.length, contextReuseCount:0, nativeCatalogue:true,
      nativeCatalogueSourcePair:basePairs[study], nativeCatalogueManifestSha256:MANIFEST_SHA256};
    return {pair, referenceMap:new Map(), sourcePhraseMap:new Map(models)};
  }
  Object.defineProperty(globalThis, 'MelungaNativeCourses', {value:Object.freeze({pairIds, reviewedPairIds,
    isPair, isReviewed, metadata, loadPair, isEligible, isHistoricalFree, ensureRights, manifestSha256:MANIFEST_SHA256}), writable:false, configurable:false});
})();
