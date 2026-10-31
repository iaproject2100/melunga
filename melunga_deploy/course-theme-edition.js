/* Reviewed domain presentation over verified sources. Card and activity objects
 * are reused verbatim; only their parent topic and five-card groups change. */
(() => {
  'use strict';
  const requireValue = (value, message) => { if (!value) throw new Error('Theme edition: ' + message); };
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const protectedTheme = theme => theme.isTemplateCollection || theme.id.includes('-situation-');
  const allowedKinds = new Set(['understand', 'imitate', 'choose-and-recall']);

  function validate(data, manifest) {
    const expected = manifest.themePlacementEdition;
    requireValue(data?.version === 1 && data.id === 'reviewed-domain-placement-edition-v1'
      && data.moves === 10343 && data.moves === expected.moves
      && data.uncertainKept === 4582 && data.absentTargetsKept === 775
      && data.sourceCardCount === manifest.sourceCardCount
      && same(data.receiptInputs, expected.receiptInputs) && same(data.sourceMaps, expected.sourceMaps)
      && same(Object.keys(data.banks || {}), manifest.studyLanguageIds), 'invalid reviewed inventory');
    let count = 0;
    for (const study of manifest.studyLanguageIds) {
      const bank = data.banks[study], original = manifest.banks[study];
      requireValue(bank.sourceBankSha256 === original.sha256 && bank.sourceCardCount === original.sourceCardCount
        && bank.sourceSha256 === data.sourceMaps[bank.sourcePath]
        && Array.isArray(bank.levels) && bank.levels.length === 10 && Array.isArray(bank.moves), 'source bank differs');
      const definitions = new Map();
      bank.levels.forEach((level, index) => {
        requireValue(level.level === index + 1 && Array.isArray(level.themes), 'invalid level definitions');
        for (const theme of level.themes) {
          const key = level.level + ':' + theme.id;
          requireValue(typeof theme.id === 'string' && !definitions.has(key)
            && typeof theme.title === 'string' && theme.title && typeof theme.section === 'string', 'invalid topic');
          definitions.set(key, theme);
        }
      });
      let previous = -1;
      for (const row of bank.moves) {
        requireValue(Array.isArray(row) && row.length === 4 && Number.isInteger(row[0])
          && row[0] > previous && row[0] < bank.sourceCardCount
          && Number.isInteger(row[1]) && row[1] >= 1 && row[1] <= 10 && row[2] !== row[3], 'invalid source move');
        const from = definitions.get(row[1] + ':' + row[2]), to = definitions.get(row[1] + ':' + row[3]);
        requireValue(from && to && !protectedTheme(from) && !protectedTheme(to)
          && from.section === to.section, 'protected topic or section change');
        previous = row[0];count++;
      }
    }
    requireValue(count === 10343, 'incomplete reviewed moves');
    return data;
  }

  function activityUnits(theme) {
    const primary = new Set(theme.phrases.map(p => p.id)), units = new Map();
    for (const sequence of theme.sequences) for (const step of sequence.steps) {
      requireValue(allowedKinds.has(step.kind) && typeof step.utterance === 'string', 'unreviewed activity shape');
      // A prerequisite travels with the phrase it prepares, not with another
      // primary occurrence of the prerequisite card in this or a later group.
      const main = step.isPreparation && primary.has(step.prepares) ? step.prepares
        : !step.isReview && !step.isContextReuse && primary.has(step.utterance) ? step.utterance : null;
      const key = main ? 'primary:' + main
        : 'aux:' + sequence.id + ':' + step.utterance + ':' + Boolean(step.isReview) + ':' + Boolean(step.isContextReuse);
      if (!units.has(key)) units.set(key, {primary:main, phraseId:main || step.utterance, steps:[]});
      units.get(key).steps.push(step);
    }
    for (const unit of units.values()) {
      const ids = new Set(unit.steps.map(step => step.id));
      for (const step of unit.steps) for (const dependency of Object.values(step.preparedInSteps || {})) {
        requireValue(ids.has(dependency), 'activity prerequisite crosses its phrase unit');
      }
    }
    return [...units.values()];
  }

  function regroup(pair, theme, units, title) {
    const sequences = [];
    for (let offset = 0; offset < units.length; offset += 5) {
      const batch = units.slice(offset, offset + 5), number = sequences.length + 1;
      const steps = pair.nativeCatalogue ? batch.flatMap(unit => unit.steps)
        : [...batch.flatMap(unit => unit.steps.filter(s => s.kind !== 'choose-and-recall')),
          ...batch.flatMap(unit => unit.steps.filter(s => s.kind === 'choose-and-recall'))];
      sequences.push({id:pair.id + ':L' + pair.level + ':' + theme.id + ':domain-edition:' + number,
        title:title(number), phraseIds:[...new Set(batch.map(unit => unit.phraseId))],
        preparationIds:[...new Set(steps.filter(s => s.isPreparation).map(s => s.utterance))], steps});
    }
    return sequences;
  }

  function apply(pair, edition, {isEligible, sequenceTitle, themeTitle = title => title, lookupModel = () => null} = {}) {
    requireValue(pair && typeof pair.id === 'string' && Number.isInteger(pair.level)
      && pair.level >= 1 && pair.level <= 10 && Array.isArray(pair.themes), 'invalid source pair');
    const study = pair.studyLanguage, bank = edition.banks[study];
    requireValue(bank && pair.id === pair.nativeLanguage + '-' + study, 'wrong study direction');
    if (pair.themePlacementEdition?.id === edition.id) return pair;
    const moves = bank.moves.filter(row => row[1] === pair.level);
    const definitions = bank.levels[pair.level-1].themes;
    const byDefinition = new Map(definitions.map(theme => [theme.id, theme]));
    const beforeModels = new Map(), beforeSteps = new Map(), owners = new Map();
    for (const theme of pair.themes) {
      for (const model of theme.phrases) {
        requireValue(!beforeModels.has(model.id), 'duplicate source primary');
        beforeModels.set(model.id, model);owners.set(model.id, theme);
      }
      for (const sequence of theme.sequences) for (const step of sequence.steps) {
        requireValue(!beforeSteps.has(step.id), 'duplicate source activity');beforeSteps.set(step.id, step);
      }
    }
    const applied = [], destinations = new Map(), affected = new Set();
    for (const row of moves) {
      const id = 'catalogue:' + study + ':' + row[0], current = owners.get(id);
      if (!current) {
        requireValue(isEligible && !isEligible(id), 'eligible reviewed primary missing from source: ' + id);
        continue;
      }
      requireValue(current.id === row[2] && !protectedTheme(current)
        && beforeModels.get(id).source.sourceIndex === row[0], 'source placement changed: ' + id);
      const target = byDefinition.get(row[3]);
      requireValue(target && !protectedTheme(target) && current.section === target.section, 'destination changed');
      destinations.set(id, row[3]);affected.add(row[2]);affected.add(row[3]);applied.push(row);
    }
    if (!applied.length) return {...pair, themePlacementEdition:{id:edition.id, appliedMoves:0}};
    const originalById = new Map(pair.themes.map(theme => [theme.id, theme]));
    const unitsByTheme = new Map(), primaryUnits = new Map();
    for (const id of affected) {
      const theme = originalById.get(id);
      const units = theme ? activityUnits(theme) : [];
      unitsByTheme.set(id, units);
      for (const unit of units) if (unit.primary) {
        requireValue(!primaryUnits.has(unit.primary), 'duplicate primary unit');primaryUnits.set(unit.primary, unit);
      }
    }
    const incoming = new Map();
    for (const row of applied) {
      const id = 'catalogue:' + study + ':' + row[0];
      requireValue(primaryUnits.has(id), 'reviewed phrase has no complete practice unit');
      if (!incoming.has(row[3])) incoming.set(row[3], []);
      incoming.get(row[3]).push(id);
    }
    const updated = new Map(), omitted = [];
    for (const id of affected) {
      const old = originalById.get(id) || byDefinition.get(id);
      const added = (incoming.get(id) || []).sort((a, b) => Number(a.split(':').at(-1))-Number(b.split(':').at(-1)));
      const phrases = [...(old.phrases || []).filter(p => !destinations.has(p.id)), ...added.map(id => beforeModels.get(id))];
      const units = [...unitsByTheme.get(id).filter(u => !u.primary || !destinations.has(u.primary)),
        ...added.map(id => primaryUnits.get(id))];
      if (!phrases.length && !units.length) {omitted.push(id);continue;}
      const theme = {...old, phrases};
      if (!originalById.has(id)) {theme.title = themeTitle(theme.title);delete theme.phraseIds;}
      theme.sequences = regroup(pair, theme, units, sequenceTitle);
      theme.presentationOrder = [...new Set(theme.sequences.flatMap(s => s.phraseIds))];
      theme.totalPhrases = theme.newCount = phrases.length;
      theme.reviewReferences = old.reviewReferences || [];theme.contextReferences = old.contextReferences || [];
      const primaryIds = new Set(phrases.map(p => p.id));
      theme.reviewCount = theme.reviewReferences.length;
      theme.reuseCount = theme.contextReferences.filter(r => !primaryIds.has(r.id)).length;
      theme.presentedCount = theme.presentationOrder.length;
      const presentedModels = theme.presentationOrder.map(id => beforeModels.get(id) || lookupModel(id));
      requireValue(presentedModels.every(Boolean), 'presented reference unavailable');
      theme.pedagogicalConceptCount = new Set(presentedModels.map(p => p.lexicalConceptId || JSON.stringify([p.study, p.native]))).size;
      const kinds = [...new Set(presentedModels.map(p => p.contentType))].sort();
      theme.contentType = kinds.length === 1 ? kinds[0] : 'mixed';
      if (kinds.length > 1) theme.contentTypes = kinds;else delete theme.contentTypes;
      theme.densityStatus = 'reviewed-domain-placement';
      theme.themePlacementEdition = edition.id;updated.set(id, theme);
    }
    const themes = pair.themes.filter(t => !omitted.includes(t.id)).map(t => updated.get(t.id) || t);
    const positions = new Map(definitions.map((t, i) => [t.id, i]));
    for (const [id, theme] of updated) if (!originalById.has(id)) {
      const at = themes.findIndex(t => (positions.get(t.id) ?? Infinity) > positions.get(id));
      themes.splice(at < 0 ? themes.length : at, 0, theme);
    }
    const afterModels = themes.flatMap(t => t.phrases), afterSteps = themes.flatMap(t => t.sequences.flatMap(s => s.steps));
    requireValue(afterModels.length === beforeModels.size && new Set(afterModels.map(p => p.id)).size === beforeModels.size
      && afterModels.every(p => beforeModels.get(p.id) === p), 'primary card objects changed or lost');
    requireValue(afterSteps.length === beforeSteps.size && new Set(afterSteps.map(s => s.id)).size === beforeSteps.size
      && afterSteps.every(s => beforeSteps.get(s.id) === s), 'practice activities changed or lost');
    return {...pair, themes, themePlacementEdition:{id:edition.id, appliedMoves:applied.length, omittedEmptyTopics:omitted}};
  }

  Object.defineProperty(globalThis, 'MelungaThemeEdition', {value:Object.freeze({validate, apply}), writable:false, configurable:false});
})();
