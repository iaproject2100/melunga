/* Existing web account rights for the published progressive course.
 * Catalogue levels and source content are never rewritten by this module. */
(() => {
  'use strict';
  const PAIRS = ['fr-en', 'fr-es', 'fr-it', 'fr-zh', 'fr-ja', 'fr-ko', 'zh-fr'];
  const EXPECTED_COUNTS = {'fr-en':342,'fr-es':300,'fr-it':347,'fr-zh':331,'fr-ja':305,'fr-ko':284,'zh-fr':309};
  const RIGHTS_SHA = '35bd897d1e7f4995e7bd0c4dfa154049e63fcf1063282951b2a9f604481d7c05';
  const preview = /^deploy-preview-\d+--chic-dragon-e2baf2\.netlify\.app$/.test(location.hostname);
  const rights = new Map();
  let ready = false, paid = false, serverStatus = 'checking', rightsReady = false;
  let generation = 0, initialization = null;
  const read = key => { try { return localStorage.getItem(key) || ''; } catch (_) { return ''; } };
  const write = (key, value) => { try { localStorage.setItem(key, value); } catch (_) {} };
  const snapshot = () => Object.freeze({ready, paid, unrestricted: preview,
    mode: preview ? 'preview' : 'production', status: serverStatus, historicalRightsReady: rightsReady});

  function deviceId() {
    let id = read('ox_device');
    if (!id) {
      id = 'dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 12);
      write('ox_device', id);
    }
    return id;
  }

  async function loadRights() {
    if (rightsReady) return;
    const response = await fetch('content/course-access.json', {cache:'no-cache', credentials:'same-origin'});
    if (!response.ok) throw new Error('Historical rights unavailable');
    const raw = await response.text();
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
    const hash = Array.from(new Uint8Array(digest), x => x.toString(16).padStart(2, '0')).join('');
    if (hash !== RIGHTS_SHA) throw new Error('Historical rights edition mismatch');
    const data = JSON.parse(raw);
    if (data.version !== 1 || data.id !== 'historical-free-access'
        || data.historicalFreeCatalogueCount !== 2218 || !Array.isArray(data.pairs) || data.pairs.length !== 7) {
      throw new Error('Invalid historical rights');
    }
    const entries = new Map();
    for (const pair of data.pairs) {
      const study = pair.id?.split('-')[1];
      if (!PAIRS.includes(pair.id) || entries.has(pair.id) || pair.count !== EXPECTED_COUNTS[pair.id]
          || !Array.isArray(pair.historicalFreeIds) || pair.historicalFreeIds.length !== pair.count
          || new Set(pair.historicalFreeIds).size !== pair.count
          || pair.historicalFreeIds.some(id => !new RegExp('^catalogue:' + study + ':\\d+$').test(id))) {
        throw new Error('Invalid historical free identities');
      }
      entries.set(pair.id, new Set(pair.historicalFreeIds));
    }
    for (const [id, ids] of entries) rights.set(id, ids);
    rightsReady = true;
  }

  async function checkServer() {
    // Match the currently shipped classic application. Old ox_session hints
    // may belong to an unused wrapper and must not override its device access.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch('/.netlify/functions/check-status?device_id=' + encodeURIComponent(deviceId()), {
        cache:'no-store', credentials:'same-origin', signal:controller.signal
      });
      const data = await response.json();
      return {paid: response.ok && data.paid === true,
        status: response.ok || response.status === 401 ? 'ready' : 'unavailable'};
    } catch (_) { return {paid:false, status:'unavailable'}; }
    finally { clearTimeout(timeout); }
  }

  function notify() {
    window.dispatchEvent(new CustomEvent('melunga:course-access', {detail:snapshot()}));
  }

  async function refresh() {
    if (preview) {
      ready = true; paid = false; serverStatus = 'preview';
      notify();
      return snapshot();
    }
    const current = ++generation;
    const before = snapshot();
    if (paid) {
      paid = false;
      serverStatus = 'checking';
      notify();
    }
    const [rightsResult, server] = await Promise.allSettled([loadRights(), checkServer()]);
    if (current !== generation) return snapshot();
    if (rightsResult.status !== 'fulfilled') {
      ready = false; paid = false; serverStatus = 'invalid-free-rights';
      notify();
      throw new Error('Historical course access could not be verified');
    }
    paid = server.status === 'fulfilled' && server.value.paid === true;
    serverStatus = server.status === 'fulfilled' ? server.value.status : 'unavailable';
    ready = true;
    // This is only a shared UI hint; it never grants progressive-course access.
    if (serverStatus === 'ready') write('ox_paid', paid ? '1' : '0');
    if (before.paid || paid !== before.paid || ready !== before.ready || serverStatus !== before.status) notify();
    return snapshot();
  }

  function initialize() {
    if (!initialization) initialization = refresh().catch(error => { initialization = null; throw error; });
    return initialization;
  }

  function canLearn(pairId, phrase, editorialLevel) {
    if (!ready || !PAIRS.includes(pairId) || !phrase || typeof phrase.id !== 'string') return false;
    if (preview || paid) return true;
    const level = Number.isInteger(phrase.editorialLevel) ? phrase.editorialLevel : Number(editorialLevel);
    if (level === 1) return true;
    if (rights.get(pairId)?.has(phrase.id)) return true;
    // Existing level-one conversation units were already free in Mes phrases.
    return phrase.source?.sourceLevel === 1 && /^conversation/.test(phrase.source?.collection || '');
  }

  function loginUrl(pairId, level = 1) {
    const pair = PAIRS.includes(pairId) ? pairId : 'fr-en';
    const [native, study] = pair.split('-');
    const selected = Number.isInteger(Number(level)) && Number(level) >= 1 && Number(level) <= 10 ? Number(level) : 1;
    return 'app.html?' + new URLSearchParams({login:'1',lang:native,study,
      courseReturn:pair,courseLevel:String(selected)});
  }

  function classicUrl(pairId) {
    const pair = PAIRS.includes(pairId) ? pairId : 'fr-en';
    const [native, study] = pair.split('-');
    return 'app.html?' + new URLSearchParams({start:'1',lang:native,study,classic:'1'});
  }

  /* This function derives a presentation view only. The caller must validate the
   * immutable source pair and bank before calling it. No source object is edited. */
  function buildLearningView(sourcePair, referenceMap, isAllowed) {
    if (!sourcePair || !Array.isArray(sourcePair.themes) || typeof isAllowed !== 'function') {
      throw new TypeError('Invalid course access view input');
    }
    const modelById = new Map(referenceMap instanceof Map ? referenceMap : []);
    for (const theme of [...sourcePair.themes, ...(sourcePair.heldThemes || [])]) {
      for (const model of theme.phrases || []) modelById.set(model.id, model);
    }
    const contextIds = new Set(), contextStepIds = new Set(), productionIds = new Set();
    const themes = sourcePair.themes.map(theme => {
      const ids = new Set((theme.sequences || []).flatMap(sequence => sequence.phraseIds || []));
      const allowedIds = new Set([...ids].filter(id => {
        const model = modelById.get(id);
        return !!model && isAllowed(model);
      }));
      for (const id of allowedIds) productionIds.add(id);
      const keptReceivedIds = new Set(), keptPrepIds = new Set();
      const sequences = [];
      for (const sequence of theme.sequences || []) {
        const phraseIds = (sequence.phraseIds || []).filter(id => allowedIds.has(id));
        if (!phraseIds.length) continue;
        const steps = [];
        const sequencePrepIds = new Set(), sequenceReceivedModels = new Set();
        for (const step of sequence.steps || []) {
          if (step.kind === 'receive') {
            // A received question must not ask this free learner to produce a
            // response removed from the view. Its words remain comprehension only.
            if (step.requiresProduction !== false || !allowedIds.has(step.prepares)
                || (step.answerWithUtteranceIds || []).some(id => !allowedIds.has(id))) continue;
            steps.push(step);
            keptReceivedIds.add(step.receivedId);
            sequenceReceivedModels.add(step.utterance);
            if (!isAllowed(modelById.get(step.utterance))) contextIds.add(step.utterance);
            contextStepIds.add(step.id);
            continue;
          }
          if (step.isPreparation) {
            if (!allowedIds.has(step.prepares)) continue;
            const model = modelById.get(step.utterance);
            if (!model) continue;
            const independentlyAllowed = isAllowed(model);
            // A paid supporting model can only be heard/read here, never turned
            // into a learner imitation/recall or a saved paid learner card.
            if (!independentlyAllowed
                && !(step.kind === 'understand' && step.requiresProduction === false)) continue;
            if (!['understand', 'imitate'].includes(step.kind)) continue;
            steps.push(step);
            sequencePrepIds.add(step.utterance); keptPrepIds.add(step.utterance);
            if (!independentlyAllowed) {
              contextIds.add(step.utterance);
              contextStepIds.add(step.id);
            }
            continue;
          }
          if (step.utterance) {
            if (!allowedIds.has(step.utterance)) continue;
            // Do not alter a step's target to make a different card appear free.
            if (step.choices && step.choices.some(id => !allowedIds.has(id))) {
              const choices = step.choices.filter(id => allowedIds.has(id));
              steps.push({ ...step, choices });
            } else steps.push(step);
            continue;
          }
          const choices = (step.choices || []).filter(id => allowedIds.has(id));
          if (!choices.length) continue;
          steps.push(choices.length === step.choices.length ? step : { ...step, choices });
        }
        if (!steps.length) continue;
        const sameIds = phraseIds.length === sequence.phraseIds.length;
        const sameSteps = steps.length === sequence.steps.length
          && steps.every((step, i) => step === sequence.steps[i]);
        if (sameIds && sameSteps) sequences.push(sequence);
        else {
          const derived = { ...sequence, phraseIds, steps };
          if (sequence.preparationIds !== undefined) {
            derived.preparationIds = sequence.preparationIds.filter(id => sequencePrepIds.has(id));
          }
          if (sequence.receivedIds !== undefined) {
            derived.receivedIds = sequence.receivedIds.filter(id => sequenceReceivedModels.has(id));
          }
          sequences.push(derived);
        }
      }
      const presented = new Set(sequences.flatMap(sequence => sequence.phraseIds));
      const phrases = (theme.phrases || []).filter(model => presented.has(model.id));
      const primary = new Set(phrases.map(model => model.id));
      const reviewReferences = (theme.reviewReferences || []).filter(reference => presented.has(reference.id));
      const contextReferences = (theme.contextReferences || []).filter(reference => presented.has(reference.id));
      const presentedBefore = Number.isInteger(theme.presentedCount) ? theme.presentedCount : ids.size;
      const unchanged = sequences.length === theme.sequences.length
        && sequences.every((sequence, i) => sequence === theme.sequences[i]);
      if (unchanged) return theme;
      const view = {
        ...theme, phrases, sequences, reviewReferences, contextReferences,
        totalPhrases: phrases.length, newCount: phrases.length,
        reviewCount: reviewReferences.length,
        reuseCount: contextReferences.filter(reference => !primary.has(reference.id)).length,
        presentedCount: presented.size,
        _accessView: true, _accessTotalPresentedCount: presentedBefore,
        _accessLocked: presented.size === 0
      };
      if (theme.receivedTurns !== undefined) {
        view.receivedTurns = theme.receivedTurns.filter(turn => keptReceivedIds.has(turn.id));
      }
      if (theme.lexicalSupports !== undefined) {
        // Optional supports stay comprehension references for a retained free
        // response, even when their introduction intent was removed. None is
        // inserted as an independently producible learner card.
        view.lexicalSupports = presented.size ? theme.lexicalSupports.filter(support =>
          support.analyse === false && support.countsTowardProductionProgression === false
          && support.insertedIntoPhraseSteps === false) : [];
        for (const support of view.lexicalSupports) {
          const id = support.utterance || support.id, model = modelById.get(id);
          if (model && !isAllowed(model)) contextIds.add(id);
        }
      }
      return view;
    });
    const identical = themes.every((theme, index) => theme === sourcePair.themes[index]);
    const pair = identical ? sourcePair : { ...sourcePair, themes, _accessView: true };
    return { pair, contextIds, contextStepIds, productionIds, modelById };
  }

  // Returning from the existing account page must not revive a paid snapshot
  // after logout. Check the same device contract again before showing it.
  window.addEventListener?.('pageshow', event => {
    if (event.persisted && ready && !preview) refresh().catch(() => {});
  });
  window.addEventListener?.('storage', event => {
    if (ready && !preview && ['ox_device', 'ox_paid', 'ox_session'].includes(event.key)) refresh().catch(() => {});
  });

  Object.defineProperty(window, 'MelungaCourseAccess', {value:Object.freeze({initialize, refresh,
    state:snapshot, canLearn, loginUrl, classicUrl,
    learningView:(pair, references) => {
      if (!ready) throw new Error('Course access is not ready');
      if (preview || paid) return {pair, contextStepIds:new Set()};
      return buildLearningView(pair, references, phrase => canLearn(pair.id, phrase, pair.level));
    }
  }), writable:false, configurable:false});
})();
