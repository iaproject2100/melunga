/* A standalone preview. No account, payment or lesson-state APIs are used here. */
(() => {
  'use strict';

  const byId = id => document.getElementById(id);
  const ui = {
    language: byId('mgLanguage'), flag: byId('mgLanguageFlag'), palette: byId('mgPalette'),
    themes: byId('mgThemes'), back: byId('mgBack'), backText: byId('mgBackText'),
    counter: byId('mgCounter'), progress: byId('mgProgress'), content: byId('mgContent'),
    loading: byId('mgLoading'), loadingText: byId('mgLoadingText'), retry: byId('mgRetry'),
    themeView: byId('mgThemeView'), themeGrid: byId('mgThemeGrid'),
    sequenceView: byId('mgSequenceView'), sequenceHeading: byId('mgSequenceHeading'),
    sequences: byId('mgSequences'), lessonView: byId('mgLessonView'), lessonTheme: byId('mgLessonTheme'),
    phase: byId('mgPhaseIcon'), help: byId('mgHelp'), helpPanel: byId('mgHelpPanel'),
    helpText: byId('mgHelpText'), readingToggle: byId('mgReadingToggle'),
    model: byId('mgModel'), speaker: byId('mgSpeaker'), choices: byId('mgChoices'),
    phrase: byId('mgPhrase'), phonrow: byId('mgPhonrow'), phon: byId('mgPhon'),
    ear: byId('mgEar'), reading: byId('mgReading'), translation: byId('mgTranslation'),
    done: byId('mgDone'), doneHeading: byId('mgDoneHeading'), status: byId('mgStatus'),
    footer: byId('mgFooter'), replay: byId('mgReplay'), replayText: byId('mgReplayText'),
    next: byId('mgContinue'), nextText: byId('mgContinueText')
  };
  const state = {
    data: null, pair: null, theme: null, sequence: null, screen: 'loading', stepIndex: 0,
    selectedPhraseId: null, revealed: false, helpOpen: false, readingVisible: false,
    speechGeneration: 0, ambienceIndex: 0, lessonScope: 'sequence'
  };
  const ambiences = ['ocean', 'aurora', 'dusk'];
  const voices = { zh: 'zh-CN', es: 'es-ES', en: 'en-GB', fr: 'fr-FR', it: 'it-IT', ko: 'ko-KR', ja: 'ja-JP' };
  const svg = paths => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + '</svg>';
  const icons = {
    chat: svg('<path d="M21 11.5a8.4 8.4 0 0 1-9 8.2 10 10 0 0 1-4-.8L3 21l1.4-5.3A8.2 8.2 0 0 1 3 11.5a9 9 0 0 1 18 0Z"/><path d="M8 11h.01M12 11h.01M16 11h.01"/>'),
    person: svg('<circle cx="12" cy="7" r="3.3"/><path d="M5 21v-3a7 7 0 0 1 14 0v3"/>'),
    cafe: svg('<path d="M4 8h12v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8Zm12 1h2a3 3 0 0 1 0 6h-2M8 3v2m4-2v2M2 22h18"/>'),
    compass: svg('<circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5L16 8Z"/>'),
    home: svg('<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10Z"/>'),
    heart: svg('<path d="M20.5 5.5a5.2 5.2 0 0 0-7.4 0L12 6.6l-1.1-1.1a5.2 5.2 0 0 0-7.4 7.4L12 21l8.5-8.1a5.2 5.2 0 0 0 0-7.4Z"/>'),
    bag: svg('<rect x="4" y="7" width="16" height="15" rx="3"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/>'),
    clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>'),
    globe: svg('<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 6h14M5 18h14"/>'),
    shape: svg('<rect x="3" y="3" width="7" height="7" rx="2"/><circle cx="17" cy="7" r="4"/><path d="m6.5 14 4.5 7H2l4.5-7Zm7.5 0h7v7h-7z"/>'),
    headphones: svg('<path d="M4 14v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="12" width="5" height="9" rx="2"/><rect x="16" y="12" width="5" height="9" rx="2"/>'),
    mic: svg('<rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 11v1a7 7 0 0 0 14 0v-1M12 19v3m-4 0h8"/>'),
    recall: svg('<path d="M9 18h6m-6 3h6M8 14a7 7 0 1 1 8 0c-1 1-1 2-1 4H9c0-2 0-3-1-4Z"/>'),
    arrow: svg('<path d="M4 12h16m-6-6 6 6-6 6"/>')
  };
  const chinese = {
    'Tes thèmes': '主题', 'Thèmes': '主题', 'Séquences': '学习小组', 'Continuer': '继续',
    'Réécouter': '再听一次', 'Rejouer': '再练一次', 'Séquence terminée': '本组已完成',
    'Thème terminé': '本主题已完成', 'Facultatif': '可选',
    'Séquence suivante': '下一组', 'Les séquences': '所有小组', 'Interlocuteur': '对方',
    'Afficher la lecture': '显示读音', 'Masquer la lecture': '隐藏读音',
    'Écouter la phrase': '听这句话', 'Écouter': '听一听',
    'Révéler et écouter la phrase': '显示并听这句话', 'Révéler et écouter': '显示并听一听',
    'Changer d’ambiance': '更换背景', 'Voir les thèmes': '查看主题',
    'Langue à apprendre': '学习语言', 'Aide pour cette étape': '本步骤帮助',
    'Choisir une réponse': '选择回答', 'Niveau 1': '第一级',
    'Modèle': '待补全', 'Écouter l’autre': '听对方说话', 'Se rappeler': '回忆',
    'Répéter': '跟读', 'Comparer': '比较',
    'Tu peux regarder ce modèle et choisir toi-même les mots à y placer.': '看看这个表达，自己选择合适的词来补全。',
    'Cette phrase appartient à ton interlocuteur. Tu peux l’écouter sans avoir à la reproduire.': '这是对方说的话。听懂即可，不需要复述。',
    'Dis la phrase à partir de son sens. L’oreille révèle le modèle et permet de le réécouter.': '根据意思说出这句话。点击耳朵可以查看并再次听到原句。',
    'Prononce la phrase à voix haute. Tu peux la réécouter autant de fois que tu veux.': '大声跟读。需要时可以反复听。',
    'Écoute les phrases et observe ce qui change entre elles.': '听这些句子，看看哪些词发生了变化。',
    'Écoute la phrase et regarde son sens et sa prononciation.': '听这句话，看看意思和发音提示。',
    'L’audio n’est pas disponible sur ce navigateur.': '此浏览器暂不支持播放语音。',
    'L’audio n’a pas pu démarrer. Tu peux réessayer.': '语音未能播放，请重试。'
  };
  const tr = value => state.pair && state.pair.nativeLanguage === 'zh' ? chinese[value] || value : value;
  const quantityLabel = count => state.pair && state.pair.nativeLanguage === 'zh'
    ? count + ' 句表达' : count + (count === 1 ? ' expression' : ' expressions');

  const text = (node, value) => { node.textContent = typeof value === 'string' ? value : ''; };
  const phraseCount = theme => Array.isArray(theme.phrases) ? theme.phrases.length : 0;
  const pairCount = pair => pair.themes.reduce((total, theme) => total + phraseCount(theme), 0);
  const themeNumber = theme => String(state.pair.themes.indexOf(theme) + 1).padStart(2, '0');
  const themeLabel = theme => themeNumber(theme) + ' · ' + theme.title;
  const currentStep = () => state.sequence && state.sequence.steps[state.stepIndex];
  const phraseById = id => state.theme && state.theme.phrases.find(phrase => phrase.id === id);
  const currentPhrase = () => {
    const step = currentStep();
    return step && phraseById(state.selectedPhraseId || step.utterance || (step.choices || [])[0]);
  };
  const isTemplate = phrase => Boolean(state.theme && (state.theme.isTemplate || state.theme.isTemplateCollection) || phrase && phrase.isTemplate);
  const isReceived = (step, phrase) => Boolean(step && step.kind === 'receive' || phrase && (phrase.kind === 'received' || phrase.speaker === 'B'));
  const isRecall = step => Boolean(step && ['choose-and-recall', 'reply-without-model', 'recall'].includes(step.kind));
  const isMasked = () => {
    const phrase = currentPhrase();
    return Boolean(phrase && isRecall(currentStep()) && !isReceived(currentStep(), phrase) && !isTemplate(phrase) && !state.revealed);
  };
  const setStatus = message => text(ui.status, tr(message));

  function stopAudio() {
    state.speechGeneration += 1;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    ui.ear.classList.remove('is-playing');
    ui.ear.removeAttribute('aria-busy');
  }

  function closeHelp() {
    state.helpOpen = false;
    ui.helpPanel.hidden = true;
    ui.help.setAttribute('aria-expanded', 'false');
  }

  function resetStep() {
    stopAudio();
    state.selectedPhraseId = null;
    state.revealed = false;
    state.readingVisible = false;
    closeHelp();
    setStatus('');
  }

  function showView(screen) {
    state.screen = screen;
    ui.loading.hidden = screen !== 'loading';
    ui.themeView.hidden = screen !== 'themes';
    ui.sequenceView.hidden = screen !== 'sequences';
    ui.lessonView.hidden = !['lesson', 'done'].includes(screen);
    ui.footer.hidden = !['lesson', 'done'].includes(screen);
    ui.back.hidden = ['loading', 'themes'].includes(screen);
    ui.themes.disabled = screen === 'loading';
    ui.content.scrollTop = 0;
    document.body.dataset.view = screen;
  }

  function themeIcon(theme) {
    const byTheme = {
      saluer: icons.chat, comprendre: icons.chat, ressentis: icons.heart,
      repas: icons.cafe, deplacements: icons.compass, reperes: icons.clock,
      quotidien: icons.home, decrire: icons.shape, conversation: icons.chat,
      travail: icons.bag, personnaliser: icons.shape
    };
    if (byTheme[theme.id]) return byTheme[theme.id];
    const subject = (theme.id + ' ' + theme.title).toLowerCase();
    if (/salu|échang|echange|polit|merci|bonjour|communic/.test(subject)) return icons.chat;
    if (/café|cafe|mang|boi|aliment|restaurant|nourri/.test(subject)) return icons.cafe;
    if (/présent|present|person|famill|proche|relation/.test(subject)) return icons.person;
    if (/maison|quotid|domicil|habitat/.test(subject)) return icons.home;
    if (/santé|sante|corps|sentiment|émotion|emotion/.test(subject)) return icons.heart;
    if (/achat|boutiq|argent|prix|vêtement|vetement/.test(subject)) return icons.bag;
    if (/temps|heure|jour|date|moment/.test(subject)) return icons.clock;
    if (/voyag|déplac|deplac|transport|ville|direction|lieu/.test(subject)) return icons.compass;
    if (theme.isTemplate || /modèle|modele|structure|constr/.test(subject)) return icons.shape;
    return icons.globe;
  }

  function tile(title, count, icon, action, className, theme) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    const pictogram = document.createElement('span');
    pictogram.className = className === 'mg-theme' ? 'mg-theme-icon' : 'mg-sequence-icon';
    pictogram.innerHTML = icon;
    pictogram.setAttribute('aria-hidden', 'true');
    const content = document.createElement('span');
    content.className = 'mg-sequence-copy';
    const label = document.createElement(className === 'mg-theme' ? 'span' : 'strong');
    label.className = 'mg-theme-title';
    label.textContent = title;
    const quantity = document.createElement(className === 'mg-theme' ? 'span' : 'small');
    quantity.className = 'mg-theme-count';
    quantity.textContent = quantityLabel(count);
    if (theme && theme.optional) quantity.textContent += ' · ' + tr('Facultatif');
    content.append(label, quantity);
    const arrow = document.createElement('span');
    arrow.className = 'mg-tile-arrow';
    arrow.innerHTML = icons.arrow;
    arrow.setAttribute('aria-hidden', 'true');
    if (className === 'mg-theme') {
      const number = document.createElement('span');
      number.className = 'mg-theme-number';
      number.textContent = themeNumber(theme);
      number.setAttribute('aria-hidden', 'true');
      button.setAttribute('aria-label', themeLabel(theme) + ', ' + quantity.textContent);
      button.append(pictogram, number, label, quantity);
    }
    else button.append(content, arrow);
    button.addEventListener('click', action);
    return button;
  }

  function showThemes() {
    if (!state.pair) return;
    stopAudio();
    closeHelp();
    state.theme = null;
    state.sequence = null;
    state.lessonScope = 'sequence';
    setStatus('');
    text(ui.counter, quantityLabel(pairCount(state.pair)));
    ui.progress.style.width = '0%';
    ui.themeGrid.replaceChildren(...state.pair.themes.map(theme => tile(
      theme.title, phraseCount(theme), themeIcon(theme), () => openTheme(theme), 'mg-theme', theme
    )));
    showView('themes');
  }

  function openTheme(theme) {
    state.theme = theme;
    // Keep the prepared groups in order, but make the whole theme one lesson.
    startSequence({
      id: state.pair.id + ':' + theme.id + ':all',
      phraseIds: theme.sequences.flatMap(sequence => sequence.phraseIds),
      steps: theme.sequences.flatMap(sequence => sequence.steps)
    }, 'theme');
  }

  function showSequences(theme = state.theme) {
    if (!theme) return showThemes();
    stopAudio();
    closeHelp();
    state.theme = theme;
    state.sequence = null;
    state.lessonScope = 'sequence';
    setStatus('');
    text(ui.sequenceHeading, themeLabel(theme));
    text(ui.backText, tr('Thèmes'));
    text(ui.counter, quantityLabel(phraseCount(theme)));
    ui.progress.style.width = '0%';
    ui.sequences.replaceChildren(...theme.sequences.map((sequence, index) => tile(
      sequence.title || (state.pair.nativeLanguage === 'zh' ? '第 ' + (index + 1) + ' 组' : 'Séquence ' + (index + 1)),
      sequence.phraseIds.length, themeIcon(theme), () => startSequence(sequence), 'mg-sequence'
    )));
    showView('sequences');
    ui.sequenceHeading.focus({ preventScroll: true });
  }

  function startSequence(sequence, lessonScope = 'sequence') {
    state.sequence = sequence;
    state.lessonScope = lessonScope;
    state.stepIndex = 0;
    resetStep();
    renderStep();
  }

  function phaseDefinition(step, phrase) {
    if (isTemplate(phrase)) return { icon: icons.shape, label: 'Modèle', help: 'Tu peux regarder ce modèle et choisir toi-même les mots à y placer.' };
    if (isReceived(step, phrase)) return { icon: icons.chat, label: 'Écouter l’autre', help: 'Cette phrase appartient à ton interlocuteur. Tu peux l’écouter sans avoir à la reproduire.' };
    if (isRecall(step)) return { icon: icons.recall, label: 'Se rappeler', help: 'Dis la phrase à partir de son sens. L’oreille révèle le modèle et permet de le réécouter.' };
    if (step.kind === 'imitate') return { icon: icons.mic, label: 'Répéter', help: 'Prononce la phrase à voix haute. Tu peux la réécouter autant de fois que tu veux.' };
    if (step.kind === 'compare') return { icon: icons.shape, label: 'Comparer', help: 'Écoute les phrases et observe ce qui change entre elles.' };
    return { icon: icons.headphones, label: 'Écouter', help: 'Écoute la phrase et regarde son sens et sa prononciation.' };
  }

  function renderChoices(step) {
    const choiceIds = !step.utterance && Array.isArray(step.choices) ? step.choices : [];
    ui.choices.replaceChildren();
    ui.choices.hidden = choiceIds.length < 2;
    if (ui.choices.hidden) return;
    choiceIds.forEach(id => {
      const phrase = phraseById(id);
      if (!phrase) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'mg-choice';
      button.textContent = phrase.native;
      button.setAttribute('aria-pressed', String(id === state.selectedPhraseId));
      button.addEventListener('click', () => {
        resetStep();
        state.selectedPhraseId = id;
        renderStep();
      });
      ui.choices.append(button);
    });
  }

  function renderStep() {
    const step = currentStep();
    const phrase = currentPhrase();
    if (!step || !phrase) return showDone();
    const masked = isMasked();
    const template = isTemplate(phrase);
    const hasChoices = !step.utterance && Array.isArray(step.choices) && step.choices.length > 1;
    const waitingForChoice = hasChoices && !state.selectedPhraseId;
    const definition = phaseDefinition(step, phrase);
    ui.model.hidden = false;
    ui.done.hidden = true;
    ui.help.hidden = false;
    ui.phase.hidden = false;
    text(ui.lessonTheme, themeLabel(state.theme));
    text(ui.backText, tr(state.lessonScope === 'theme' ? 'Thèmes' : 'Séquences'));
    ui.phase.innerHTML = definition.icon;
    ui.phase.setAttribute('aria-label', tr(definition.label));
    ui.phase.title = tr(definition.label);
    text(ui.helpText, tr(definition.help));
    const position = Math.max(0, state.sequence.phraseIds.indexOf(phrase.id)) + 1;
    text(ui.counter, position + ' / ' + state.sequence.phraseIds.length);
    ui.progress.style.width = ((state.stepIndex + 1) / state.sequence.steps.length * 100) + '%';
    renderChoices(step);
    text(ui.phrase, phrase.study);
    ui.phrase.lang = state.pair.studyLanguage;
    ui.phrase.hidden = masked || waitingForChoice;
    text(ui.phon, phrase.phon);
    ui.phon.hidden = masked || waitingForChoice || !phrase.phon;
    ui.phonrow.classList.toggle('is-recall', masked || waitingForChoice || !phrase.phon);
    ui.ear.hidden = template || waitingForChoice;
    ui.phonrow.hidden = template && !phrase.phon || waitingForChoice;
    ui.ear.setAttribute('aria-label', tr(masked ? 'Révéler et écouter la phrase' : 'Écouter la phrase'));
    ui.ear.title = tr(masked ? 'Révéler et écouter' : 'Écouter');
    text(ui.translation, waitingForChoice ? '' : phrase.native);
    ui.translation.lang = state.pair.nativeLanguage;
    text(ui.reading, phrase.reading);
    ui.reading.hidden = !state.readingVisible || masked || waitingForChoice || !phrase.reading;
    ui.readingToggle.hidden = !phrase.reading || masked || waitingForChoice;
    ui.readingToggle.setAttribute('aria-pressed', String(state.readingVisible));
    text(ui.readingToggle, tr(state.readingVisible ? 'Masquer la lecture' : 'Afficher la lecture'));
    ui.speaker.hidden = !isReceived(step, phrase);
    text(ui.speaker, phrase.speakerName || tr('Interlocuteur'));
    ui.replay.disabled = template || masked || waitingForChoice;
    text(ui.replayText, tr('Réécouter'));
    text(ui.nextText, tr('Continuer'));
    ui.next.disabled = waitingForChoice;
    ui.model.classList.toggle('is-masked', masked);
    ui.model.classList.toggle('is-template', template);
    showView('lesson');
  }

  function showDone() {
    stopAudio();
    closeHelp();
    ui.model.hidden = true;
    ui.done.hidden = false;
    ui.help.hidden = true;
    ui.phase.hidden = true;
    text(ui.doneHeading, tr(state.lessonScope === 'theme' ? 'Thème terminé' : 'Séquence terminée'));
    text(ui.counter, state.sequence.phraseIds.length + ' / ' + state.sequence.phraseIds.length);
    ui.progress.style.width = '100%';
    ui.replay.disabled = false;
    ui.next.disabled = false;
    text(ui.replayText, tr('Rejouer'));
    const index = state.theme.sequences.indexOf(state.sequence);
    text(ui.nextText, tr(state.lessonScope === 'theme' ? 'Thèmes'
      : index < state.theme.sequences.length - 1 ? 'Séquence suivante' : 'Les séquences'));
    setStatus('');
    showView('done');
  }

  function speak(shouldReveal) {
    const phrase = currentPhrase();
    if (state.screen !== 'lesson' || !phrase || isTemplate(phrase)) return;
    if (isMasked()) {
      if (!shouldReveal) return;
      state.revealed = true;
      renderStep();
    }
    stopAudio();
    setStatus('');
    if (!('speechSynthesis' in window) || typeof window.SpeechSynthesisUtterance !== 'function') {
      setStatus('L’audio n’est pas disponible sur ce navigateur.');
      return;
    }
    const token = state.speechGeneration;
    const utterance = new SpeechSynthesisUtterance(phrase.study);
    utterance.lang = voices[state.pair.studyLanguage] || state.pair.studyLanguage;
    utterance.rate = 0.85;
    const voiceList = window.speechSynthesis.getVoices();
    const exactVoice = voiceList.find(voice => voice.lang.toLowerCase() === utterance.lang.toLowerCase());
    const languageVoice = voiceList.find(voice => voice.lang.toLowerCase().split('-')[0] === state.pair.studyLanguage);
    if (exactVoice || languageVoice) utterance.voice = exactVoice || languageVoice;
    const finish = () => {
      if (token !== state.speechGeneration) return;
      ui.ear.classList.remove('is-playing');
      ui.ear.removeAttribute('aria-busy');
    };
    utterance.onend = finish;
    utterance.onerror = event => {
      if (token !== state.speechGeneration) return;
      finish();
      if (!['canceled', 'interrupted'].includes(event.error)) setStatus('L’audio n’a pas pu démarrer. Tu peux réessayer.');
    };
    ui.ear.classList.add('is-playing');
    ui.ear.setAttribute('aria-busy', 'true');
    try { window.speechSynthesis.speak(utterance); }
    catch (_) { finish(); setStatus('L’audio n’a pas pu démarrer. Tu peux réessayer.'); }
  }

  function choosePair(id) {
    const pair = state.data.pairs.find(candidate => candidate.id === id);
    if (!pair) return;
    resetStep();
    state.pair = pair;
    document.documentElement.lang = pair.nativeLanguage;
    text(byId('mgThemeHeading'), tr('Tes thèmes'));
    [[ui.palette, 'Changer d’ambiance'], [ui.themes, 'Voir les thèmes'], [ui.language, 'Langue à apprendre'],
      [ui.help, 'Aide pour cette étape'], [ui.choices, 'Choisir une réponse'],
      [document.querySelector('.mg-level'), 'Niveau 1']].forEach(([node, label]) => {
      node.setAttribute('aria-label', tr(label));
    });
    ui.palette.title = tr('Changer d’ambiance');
    ui.themes.title = tr('Thèmes');
    ui.language.value = pair.id;
    text(ui.flag, pair.flag);
    ui.language.title = pair.name;
    const url = new URL(window.location.href);
    url.searchParams.set('pair', pair.id);
    window.history.replaceState(null, '', url);
    showThemes();
  }

  function validateData(data) {
    if (!data || !Array.isArray(data.pairs) || !data.pairs.length) throw new Error('Missing pairs');
    const pairIds = new Set();
    data.pairs.forEach(pair => {
      if (!pair || !pair.id || pairIds.has(pair.id) || !Array.isArray(pair.themes) || !pair.themes.length) throw new Error('Invalid pair');
      pairIds.add(pair.id);
      pair.themes.forEach(theme => {
        if (!theme.id || !theme.title || !Array.isArray(theme.phrases) || !theme.phrases.length || !Array.isArray(theme.sequences) || !theme.sequences.length) throw new Error('Invalid theme');
        const ids = new Set();
        theme.phrases.forEach(phrase => {
          if (!phrase.id || ids.has(phrase.id) || typeof phrase.study !== 'string' || typeof phrase.native !== 'string' || typeof phrase.phon !== 'string') throw new Error('Invalid phrase');
          ids.add(phrase.id);
        });
        const included = [];
        theme.sequences.forEach(sequence => {
          if (!Array.isArray(sequence.phraseIds) || !sequence.phraseIds.length || sequence.phraseIds.length > 5 || !Array.isArray(sequence.steps) || !sequence.steps.length) throw new Error('Invalid sequence');
          sequence.phraseIds.forEach(id => { if (!ids.has(id)) throw new Error('Unknown phrase'); included.push(id); });
          sequence.steps.forEach(step => {
            const references = [step.utterance, ...(step.choices || [])].filter(Boolean);
            if (!references.length || references.some(id => !sequence.phraseIds.includes(id))) throw new Error('Unknown step phrase');
          });
        });
        if (included.length !== ids.size || new Set(included).size !== ids.size) throw new Error('Incomplete theme');
      });
    });
    return data;
  }

  async function loadData() {
    showView('loading');
    text(ui.loadingText, 'Tes thèmes arrivent…');
    ui.retry.hidden = true;
    ui.language.disabled = true;
    try {
      const response = await fetch('content/maquette-guidee.json', { credentials: 'omit' });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      state.data = validateData(await response.json());
      ui.language.replaceChildren(...state.data.pairs.map(pair => {
        const option = document.createElement('option');
        option.value = pair.id;
        option.textContent = pair.flag + ' ' + pair.name;
        return option;
      }));
      ui.language.disabled = false;
      const requested = new URL(window.location.href).searchParams.get('pair');
      const firstPair = state.data.pairs.find(pair => pair.id === requested)
        || state.data.pairs.find(pair => pair.nativeLanguage === 'fr' && pair.studyLanguage === 'zh')
        || state.data.pairs[0];
      choosePair(firstPair.id);
    } catch (_) {
      text(ui.loadingText, 'Les thèmes n’ont pas pu se charger.');
      ui.retry.hidden = false;
      setStatus('');
    }
  }

  ui.language.addEventListener('change', () => choosePair(ui.language.value));
  ui.themes.addEventListener('click', showThemes);
  document.querySelector('.mg-brand').addEventListener('click', event => {
    if (!state.pair) return;
    event.preventDefault();
    showThemes();
  });
  ui.back.addEventListener('click', () => {
    if (state.screen === 'sequences' || state.lessonScope === 'theme') showThemes();
    else showSequences();
  });
  ui.palette.addEventListener('click', () => {
    state.ambienceIndex = (state.ambienceIndex + 1) % ambiences.length;
    document.body.dataset.ambience = ambiences[state.ambienceIndex];
  });
  ui.help.addEventListener('click', () => {
    state.helpOpen = !state.helpOpen;
    ui.helpPanel.hidden = !state.helpOpen;
    ui.help.setAttribute('aria-expanded', String(state.helpOpen));
  });
  ui.readingToggle.addEventListener('click', () => {
    state.readingVisible = !state.readingVisible;
    const phrase = currentPhrase();
    ui.reading.hidden = !state.readingVisible || isMasked() || !phrase || !phrase.reading;
    ui.readingToggle.setAttribute('aria-pressed', String(state.readingVisible));
    text(ui.readingToggle, tr(state.readingVisible ? 'Masquer la lecture' : 'Afficher la lecture'));
  });
  ui.ear.addEventListener('click', () => speak(true));
  ui.replay.addEventListener('click', () => state.screen === 'done'
    ? startSequence(state.sequence, state.lessonScope) : speak(false));
  ui.next.addEventListener('click', () => {
    if (state.screen === 'done') {
      if (state.lessonScope === 'theme') return showThemes();
      const nextSequence = state.theme.sequences[state.theme.sequences.indexOf(state.sequence) + 1];
      if (nextSequence) startSequence(nextSequence);
      else showSequences();
      return;
    }
    if (state.screen !== 'lesson' || ui.next.disabled) return;
    state.stepIndex += 1;
    resetStep();
    if (state.stepIndex >= state.sequence.steps.length) showDone();
    else renderStep();
  });
  ui.retry.addEventListener('click', loadData);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeHelp(); });
  window.addEventListener('pagehide', stopAudio);

  // Read-only state supports preview checks without touching the real application.
  window.MelungaMockup = Object.freeze({ state: () => Object.freeze({
    screen: state.screen, pairId: state.pair && state.pair.id, themeId: state.theme && state.theme.id,
    sequenceId: state.sequence && state.sequence.id, stepIndex: state.stepIndex, lessonScope: state.lessonScope,
    phraseId: currentPhrase() && currentPhrase().id, masked: isMasked(), helpOpen: state.helpOpen,
    template: isTemplate(currentPhrase()), totalPhrases: state.pair ? pairCount(state.pair) : 0
  }) });
  loadData();
})();
