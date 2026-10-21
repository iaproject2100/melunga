(function () {
  'use strict';
  const data = window.ProgressionPilotData;
  const byId = id => document.getElementById(id);
  const languageNames = {zh:'Chinois',ko:'Coréen'};
  const speechLanguages = {zh:'zh-CN',ko:'ko-KR'};
  const state = {pilotIndex:0,stepIndex:0,choiceId:null,modelHidden:false};
  let audioRun = 0;

  function element(tag,className,text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }
  function pilot() { return data.pilots[state.pilotIndex]; }
  function step() { return pilot().steps[state.stepIndex]; }
  function utterances() {
    const current = step();
    const choices = current.choices || [];
    const choice = choices.find(item => item.id === state.choiceId) || choices[0];
    return (current.utterances || []).map(item => item.kind === 'learner' && choice ? choice.utterance : item);
  }
  function stopAudio() {
    audioRun += 1;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    byId('audio-status').textContent = '';
  }
  function speak(item) {
    // Hidden learner phrases have no audio control. This guard also protects
    // against a queued click from a control removed by a later render.
    if (state.modelHidden && (item.kind === 'learner' || item.kind === 'brick')) return;
    stopAudio();
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      byId('audio-status').textContent = 'L’écoute système n’est pas disponible sur cet appareil.';
      return;
    }
    const run = audioRun;
    const language = speechLanguages[pilot().pair.study] || pilot().pair.study;
    const speech = new SpeechSynthesisUtterance(item.study);
    speech.lang = language;
    const voices = window.speechSynthesis.getVoices();
    const matches = voices.filter(voice => voice.lang.toLowerCase().startsWith(pilot().pair.study));
    const voice = matches.find(candidate => candidate.localService) || matches[0];
    if (voice) speech.voice = voice;
    speech.onstart = function () { if (run === audioRun) byId('audio-status').textContent = 'Lecture en cours…'; };
    speech.onend = function () { if (run === audioRun) byId('audio-status').textContent = ''; };
    speech.onerror = function () { if (run === audioRun) byId('audio-status').textContent = 'Cette voix n’est pas disponible sur cet appareil.'; };
    window.speechSynthesis.speak(speech);
  }
  function audioButton(item,single) {
    const button = element('button','ear-button' + (single ? ' single' : ''));
    button.type = 'button';
    const label = item.kind === 'brick' ? 'Écouter le morceau à réutiliser' : 'Écouter la phrase de ' + (item.role || 'ce rôle');
    button.setAttribute('aria-label',label + ' en ' + (languageNames[pilot().pair.study] || pilot().pair.study).toLowerCase());
    const ear = element('span','ear','👂');
    ear.setAttribute('aria-hidden','true');
    button.append(ear);
    if (single) button.append(element('span','listen-label','Écouter'));
    button.addEventListener('click',function () { speak(item); });
    return button;
  }
  function renderFocusBrick(item) {
    if (!item || state.modelHidden) return null;
    const support = element('section','focus-brick');
    support.setAttribute('aria-label',item.role || 'Le morceau à réutiliser');
    support.append(element('p','brick-label','Appui'));
    const content = element('div','brick-content');
    const studied = element('p','brick-study',item.study);
    studied.lang = pilot().pair.study;
    const native = element('p','brick-native',item.native);
    native.lang = pilot().pair.native;
    content.append(studied,native);
    const row = element('div','brick-phonetic-row');
    const phon = element('p','brick-phonetic',item.phon);
    phon.lang = pilot().pair.native;
    row.append(phon,audioButton(item,false));
    support.append(content,row);
    if (item.reading) {
      const reading = element('p','reading brick-reading');
      reading.append(element('span','reading-label',(pilot().pair.study === 'zh' ? 'Pinyin' : 'Romanisation') + ' · '));
      const text = element('span','reading-text',item.reading);
      text.lang = pilot().pair.study;
      reading.append(text);
      support.append(reading);
    }
    return support;
  }
  function renderUtterance(item,single,focusBrick) {
    const hidden = state.modelHidden && item.kind === 'learner';
    const card = element('li','utterance-card' + (hidden ? ' masked' : ''));
    card.dataset.kind = item.kind || '';
    card.dataset.utteranceId = item.id || '';
    const heading = element('div','utterance-heading');
    heading.append(element('p','utterance-role',item.role || ''));
    if (item.kind === 'received') heading.append(element('span','received-badge','À comprendre'));
    card.append(heading);
    if (hidden) {
      card.append(element('p','recall-label','Ton intention'));
      const intention = element('p','native',item.native);
      intention.lang = pilot().pair.native;
      card.append(intention,element('p','recall-prompt','À toi de le dire à voix haute.'));
      // Do not put the missing answer in a hidden node, title or data attribute.
      return card;
    }
    const studied = element('p','study',item.study);
    studied.lang = pilot().pair.study;
    const row = element('div','phonetic-row');
    const phon = element('p','phonetic',item.phon);
    phon.lang = pilot().pair.native;
    row.append(phon,audioButton(item,single));
    card.append(studied,row);
    if (item.reading) {
      const label = pilot().pair.study === 'zh' ? 'Pinyin' : 'Romanisation';
      const reading = element('p','reading');
      reading.append(element('span','reading-label',label + ' · '));
      const text = element('span','reading-text',item.reading);
      text.lang = pilot().pair.study;
      reading.append(text);
      card.append(reading);
    }
    const native = element('p','native',item.native);
    native.lang = pilot().pair.native;
    card.append(native);
    // Proposal notes may describe the model. Keep them out of the recall DOM
    // for every role, not only when the learner card itself is masked.
    if (!state.modelHidden && item.editorialNote) card.append(element('p','utterance-editorial-note',item.editorialNote));
    const support = renderFocusBrick(focusBrick);
    if (support) card.append(support);
    return card;
  }
  function renderChoices() {
    const choices = step().choices || [];
    const group = byId('intention-choices');
    group.hidden = choices.length === 0;
    group.replaceChildren();
    choices.forEach(function (choice,index) {
      const button = element('button','intention-button',choice.label);
      button.type = 'button';
      button.dataset.choiceId = choice.id;
      button.setAttribute('aria-pressed',String(choice.id === (state.choiceId || choices[0].id)));
      button.addEventListener('click',function () {
        state.choiceId = choice.id;
        render('choice');
      });
      group.append(button);
    });
  }
  function render(focus) {
    stopAudio();
    const currentPilot = pilot(), currentStep = step();
    document.querySelectorAll('.pilot-button').forEach(function (button,index) {
      button.setAttribute('aria-pressed',String(index === state.pilotIndex));
    });
    byId('pilot-level').textContent = currentPilot.levelLabel;
    byId('pilot-title').textContent = currentPilot.title;
    byId('pilot-goal').textContent = currentPilot.goal;
    byId('step-phase').textContent = currentStep.phase;
    byId('step-count').textContent = 'Étape ' + (state.stepIndex + 1) + ' / ' + currentPilot.steps.length;
    byId('step-title').textContent = currentStep.title;
    byId('step-instruction').textContent = currentStep.instruction;
    renderChoices();
    const canRecall = Boolean(currentStep.recall && utterances().some(item => item.kind === 'learner'));
    byId('recall-actions').hidden = !canRecall;
    byId('recall-toggle').textContent = state.modelHidden ? 'Réafficher l’aide' : 'Essayer sans modèle';
    byId('recall-toggle').setAttribute('aria-pressed',String(state.modelHidden));
    byId('recall-state').textContent = canRecall && state.modelHidden ? 'Le sens reste visible.' : '';
    const items = utterances();
    const supportIndex = items.findIndex(item => item.kind === 'learner');
    byId('utterance-list').replaceChildren(...items.map((item,index) => renderUtterance(item,items.length === 1,index === supportIndex ? currentStep.focusBrick : null)));
    byId('previous-step').disabled = state.stepIndex === 0;
    byId('next-step').disabled = state.stepIndex === currentPilot.steps.length - 1;
    // Editorial notes can quote target-language words. Remove them while the
    // learner model is hidden rather than merely collapsing the details.
    byId('editorial').hidden = state.modelHidden || !currentStep.novelty;
    byId('editorial').open = false;
    byId('novelty').textContent = state.modelHidden ? '' : currentStep.novelty || '';
    if (focus === 'step') {
      byId('step-title').focus({preventScroll:true});
      byId('step-title').scrollIntoView({block:'start',behavior:'auto'});
    } else if (focus === 'choice') {
      Array.from(byId('intention-choices').children).find(button => button.dataset.choiceId === state.choiceId)?.focus({preventScroll:true});
    } else if (focus === 'recall') byId('recall-toggle').focus({preventScroll:true});
  }
  function move(index) {
    state.stepIndex = Math.max(0,Math.min(pilot().steps.length - 1,index));
    state.modelHidden = false;
    state.choiceId = null;
    render('step');
  }
  if (!data || !Array.isArray(data.pilots) || !data.pilots.length) {
    byId('step-title').textContent = 'Les contenus d’essai ne sont pas encore disponibles.';
    byId('step-instruction').textContent = 'Le fichier data.js doit accompagner cette maquette.';
    byId('previous-step').disabled = true;
    byId('next-step').disabled = true;
    return;
  }
  data.pilots.forEach(function (item,index) {
    const button = element('button','pilot-button');
    button.type = 'button';
    button.append(element('span','language-code',item.pair.study.toUpperCase()),element('span','pilot-name',languageNames[item.pair.study] || item.pair.study));
    button.setAttribute('aria-label',(languageNames[item.pair.study] || item.pair.study) + ' — ' + item.title);
    button.addEventListener('click',function () {
      state.pilotIndex = index;
      state.stepIndex = 0;
      state.choiceId = null;
      state.modelHidden = false;
      render('step');
    });
    byId('pilot-switch').append(button);
  });
  byId('recall-toggle').addEventListener('click',function () {
    state.modelHidden = !state.modelHidden;
    render('recall');
  });
  byId('previous-step').addEventListener('click',function () { move(state.stepIndex - 1); });
  byId('next-step').addEventListener('click',function () { move(state.stepIndex + 1); });
  byId('source-line').textContent = 'Source ' + String(data.sourceCommit || '').slice(0,7) + ' · Propositions locales à relire';
  window.addEventListener('pagehide',stopAudio);
  render();
})();
