/* A standalone preview. No account, payment or lesson-state APIs are used here. */
(() => {
  'use strict';

  const byId = id => document.getElementById(id);
  const ui = {
    language: byId('mgLanguage'), flag: byId('mgLanguageFlag'), palette: byId('mgPalette'),
    level: byId('mgLevel'), levelText: byId('mgLevelText'),
    menuTrigger: byId('mgMenuTrigger'), menu: byId('mgMenuDialog'), menuNav: byId('mgMenuNav'),
    menuTitle: byId('mgMenuTitle'), menuBack: byId('mgMenuBack'), menuClose: byId('mgMenuClose'),
    voice: byId('mgVoice'), speed: byId('mgSpeed'), reviewTheme: byId('mgReviewTheme'),
    reviewModel: byId('mgReviewModel'), reviewRecall: byId('mgReviewRecall'),
    feedbackForm: byId('mgFeedbackForm'), feedbackMessage: byId('mgFeedbackMessage'),
    feedbackEmail: byId('mgFeedbackEmail'), feedbackHp: byId('mgFeedbackHp'),
    feedbackSend: byId('mgFeedbackSend'), feedbackStatus: byId('mgFeedbackStatus'),
    back: byId('mgBack'), backText: byId('mgBackText'),
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
    speechGeneration: 0, ambienceIndex: 0, lessonScope: 'sequence', menuView: 'nav',
    voiceChoices: new Map(), speechRate: 0.85, level: 1, requestedPair: null,
    loadGeneration: 0, request: null, levelCache: new Map(),
    referenceMap: new Map(), repertoireCache: new Map()
  };
  const ambiences = ['ocean', 'aurora', 'dusk'];
  // One local image atlas, shared by all languages. Each tile is a 4:3 scene.
  const themePhotos = new Map([
    'saluer', 'comprendre', 'ressentis', 'repas', 'deplacements', 'reperes',
    'quotidien', 'decrire', 'conversation', 'travail', 'personnaliser'
  ].map((id, index) => [id, { column: index % 3, row: Math.floor(index / 3) }]));
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
    arrow: svg('<path d="M4 12h16m-6-6 6 6-6 6"/>'),
    folder: svg('<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/><path d="M3 11h18"/>'),
    cap: svg('<path d="m2 9 10-5 10 5-10 5L2 9Zm4 2v6c4 3 8 3 12 0v-6m4-2v8"/>'),
    info: svg('<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/>')
  };
  const chinese = {
    'Tes thèmes': '主题', 'Thèmes': '主题', 'Séquences': '学习小组', 'Continuer': '继续',
    'Réécouter': '再听一次', 'Rejouer': '再练一次', 'Séquence terminée': '本组已完成',
    'Thème terminé': '本主题已完成', 'Facultatif': '可选',
    'Révision terminée': '复习已完成',
    'Menu': '菜单', 'Menu des rubriques': '栏目菜单', 'Rubriques': '栏目',
    'Revenir au menu': '返回菜单', 'Fermer le menu': '关闭菜单',
    'Accueil': '首页', 'Révisions et exercices': '复习与练习', 'Toutes les leçons': '所有课程',
    'Voix': '语音', 'Couleur': '背景颜色', 'Comment ça marche': '使用方法',
    'Avis': '意见反馈', 'Se connecter / Créer un compte': '登录 / 注册账号',
    'Voix automatique': '自动选择语音', 'Vitesse de lecture': '语速',
    'Lente': '慢速', 'Posée': '舒缓', 'Normale': '正常',
    'Choisir un thème': '选择主题', 'Écouter et répéter': '听与跟读', 'Exercice de rappel': '回忆练习',
    'Ton avis': '你的意见', 'Email (facultatif)': '邮箱（选填）', 'Envoyer mon avis': '发送意见',
    'Envoi en cours…': '正在发送…', 'Merci, ton avis a été envoyé.': '谢谢，你的意见已发送。',
    'L’envoi a échoué. Tu peux réessayer.': '发送失败，请重试。',
    'Écris au moins quelques mots.': '请写下你的意见。',
    'Choisis un thème et écoute la phrase.': '选择主题并听句子。',
    'Répète avec la phonétique.': '借助发音提示跟读。',
    'Retrouve la phrase à partir de son sens.': '根据意思回忆句子。',
    'L’oreille permet toujours de réécouter ou de révéler le modèle.': '点击耳朵可以随时重听或查看原句。',
    'Séquence suivante': '下一组', 'Les séquences': '所有小组', 'Interlocuteur': '对方',
    'Afficher la lecture': '显示读音', 'Masquer la lecture': '隐藏读音',
    'Écouter la phrase': '听这句话', 'Écouter': '听一听',
    'Révéler et écouter la phrase': '显示并听这句话', 'Révéler et écouter': '显示并听一听',
    'Changer d’ambiance': '更换背景', 'Voir les thèmes': '查看主题',
    'Langue à apprendre': '学习语言', 'Choisir un niveau': '选择级别', 'Aide pour cette étape': '本步骤帮助',
    'Choisir une réponse': '选择回答', 'Niveau 1': '第一级',
    'Modèle': '待补全', 'Écouter l’autre': '听对方说话', 'Se rappeler': '回忆',
    'Répéter': '跟读', 'Comparer': '比较',
    'Tu peux regarder ce modèle et choisir toi-même les mots à y placer.': '看看这个表达，自己选择合适的词来补全。',
    'Cette phrase appartient à ton interlocuteur. Tu peux l’écouter sans avoir à la reproduire.': '这是对方说的话。听懂即可，不需要复述。',
    'Dis la phrase à partir de son sens. L’oreille révèle le modèle et permet de le réécouter.': '根据意思说出这句话。点击耳朵可以查看并再次听到原句。',
    'Prononce la phrase à voix haute. Tu peux la réécouter autant de fois que tu veux.': '大声跟读。需要时可以反复听。',
    'Écoute les phrases et observe ce qui change entre elles.': '听这些句子，看看哪些词发生了变化。',
    'Écoute la phrase et regarde son sens et sa prononciation.': '听这句话，看看意思和发音提示。',
    'Écoute le mot et regarde son sens et sa prononciation.': '听这个词语，看看意思和发音提示。',
    'Prononce le mot à voix haute. Tu peux le réécouter autant de fois que tu veux.': '大声读出这个词语。需要时可以反复听。',
    'Cette forme s’emploie devant un nom ; elle ne constitue pas une phrase toute seule.': '这个形式用于名词前，不能单独构成句子。',
    'Retrouve le mot à partir de son sens. L’oreille révèle le modèle et permet de le réécouter.': '根据意思回忆这个词语。点击耳朵可以查看并再次听到它。',
    'Écouter le mot': '听这个词语', 'Révéler et écouter le mot': '显示并听这个词语',
    'L’audio n’est pas disponible sur ce navigateur.': '此浏览器暂不支持播放语音。',
    'L’audio n’a pas pu démarrer. Tu peux réessayer.': '语音未能播放，请重试。'
  };
  const tr = value => state.pair && state.pair.nativeLanguage === 'zh' ? chinese[value] || value : value;
  const quantityLabel = (count, contentType) => {
    const isChinese = state.pair && state.pair.nativeLanguage === 'zh';
    if (contentType === 'vocabulary') return count + (isChinese ? ' 个词语' : count === 1 ? ' mot ou locution' : ' mots et locutions');
    if (contentType === 'number') return count + (isChinese ? ' 个数词' : count === 1 ? ' nombre' : ' nombres');
    return count + (isChinese ? ' 句表达' : count === 1 ? ' expression' : ' expressions');
  };
  const levelQuantityLabel = () => {
    if (!state.pair.counts) return quantityLabel(pairCount(state.pair));
    const presented = new Map();
    for (const theme of state.pair.themes) for (const phrase of presentedPhrases(theme)) presented.set(phrase.id, phrase);
    return ['utterance', 'vocabulary', 'number'].map(type => [type, [...presented.values()].filter(phrase => phrase.contentType === type).length])
      .filter(([, count]) => count).map(([type, count]) => quantityLabel(count, type)).join(' · ');
  };

  const text = (node, value) => { node.textContent = typeof value === 'string' ? value : ''; };
  const primaryCount = theme => Array.isArray(theme.phrases) ? theme.phrases.length : 0;
  const phraseCount = theme => Number.isInteger(theme.presentedCount) ? theme.presentedCount : primaryCount(theme);
  const pairCount = pair => pair.themes.reduce((total, theme) => total + phraseCount(theme), 0);
  const themeNumber = theme => String(state.pair.themes.indexOf(theme) + 1).padStart(2, '0');
  const themeLabel = theme => state.pair.themes.includes(theme) ? themeNumber(theme) + ' · ' + theme.title : theme.title;
  const currentStep = () => state.sequence && state.sequence.steps[state.stepIndex];
  const phraseById = id => {
    const current = state.theme && state.theme.phrases.find(phrase => phrase.id === id);
    if (current) return current;
    // Local preparations reference a canonical card elsewhere in this level;
    // they never create another copy or another phonetic transcription.
    for (const theme of [...(state.pair?.themes || []), ...(state.pair?.heldThemes || [])]) {
      const phrase = theme.phrases.find(candidate => candidate.id === id);
      if (phrase) return phrase;
    }
    return state.referenceMap.get(id) || null;
  };
  const presentedPhrases = theme => {
    const primary = new Map((theme.phrases || []).map(phrase => [phrase.id, phrase]));
    const ids = theme.sequences?.flatMap(sequence => sequence.phraseIds) || [...primary.keys()];
    return [...new Set(ids)].map(id => primary.get(id) || state.referenceMap.get(id)).filter(Boolean);
  };
  const currentPhrase = () => {
    const step = currentStep();
    return step && phraseById(state.selectedPhraseId || step.utterance || (step.choices || [])[0]);
  };
  const isTemplate = phrase => Boolean(phrase && phrase.isTemplate
    || !currentStep()?.isPreparation && state.theme && (state.theme.isTemplate || state.theme.isTemplateCollection));
  const isReceived = (step, phrase) => Boolean(step && step.kind === 'receive' || phrase && (phrase.kind === 'received' || phrase.speaker === 'B'));
  const isRecall = step => Boolean(step && ['choose-and-recall', 'reply-without-model', 'recall'].includes(step.kind));
  const isMasked = () => {
    const phrase = currentPhrase();
    return Boolean(phrase && isRecall(currentStep()) && !isReceived(currentStep(), phrase) && !isTemplate(phrase) && !state.revealed);
  };
  const setStatus = message => text(ui.status, tr(message));

  const menuPanels = {
    voice: byId('mgVoicePanel'), review: byId('mgReviewPanel'),
    feedback: byId('mgFeedbackPanel'), info: byId('mgInfoPanel')
  };
  const menuTitles = { nav: 'Menu', voice: 'Voix', review: 'Révisions et exercices', feedback: 'Avis', info: 'Comment ça marche' };

  function lessonUrl(login = false) {
    const query = new URLSearchParams({ lang: state.pair.nativeLanguage });
    if (login) query.set('login', '1');
    else { query.set('start', '1'); query.set('study', state.pair.studyLanguage); }
    return 'app.html?' + query;
  }

  function buildMenu() {
    const rows = [
      { label: 'Accueil', icon: icons.home, href: 'index.html' },
      { label: 'Thèmes', icon: icons.folder, action: () => { closeMenu(); showThemes(); } },
      { label: 'Révisions et exercices', icon: icons.cap, panel: 'review' },
      { label: 'Toutes les leçons', icon: icons.globe, href: lessonUrl() },
      { label: 'Voix', icon: icons.headphones, panel: 'voice' },
      { label: 'Couleur', icon: '<span class="mg-colorwheel" aria-hidden="true"></span>', action: () => {
        state.ambienceIndex = (state.ambienceIndex + 1) % ambiences.length;
        document.body.dataset.ambience = ambiences[state.ambienceIndex];
      } },
      { label: 'Comment ça marche', icon: icons.info, panel: 'info' },
      { label: 'Avis', icon: icons.chat, panel: 'feedback' },
      { label: 'Se connecter / Créer un compte', icon: icons.person, href: lessonUrl(true) }
    ];
    ui.menuNav.replaceChildren(...rows.map(row => {
      const item = document.createElement(row.href ? 'a' : 'button');
      item.className = 'mg-menu-item';
      item.dataset.menuItem = row.panel || row.label;
      if (row.href) item.href = row.href;
      else {
        item.type = 'button';
        item.addEventListener('click', row.action || (() => setMenuView(row.panel)));
      }
      const icon = document.createElement('span');
      icon.className = 'mg-menu-icon'; icon.innerHTML = row.icon; icon.setAttribute('aria-hidden', 'true');
      const label = document.createElement('span'); label.textContent = tr(row.label);
      item.append(icon, label);
      return item;
    }));
    document.querySelectorAll('[data-mg-i18n]').forEach(node => text(node, tr(node.dataset.mgI18n)));
    [[ui.menuClose, 'Fermer le menu'], [ui.menuBack, 'Revenir au menu'], [ui.menuNav, 'Rubriques']]
      .forEach(([node, label]) => node.setAttribute('aria-label', tr(label)));
  }

  function positionMenu() {
    if (!ui.menu.open) return;
    const anchor = ui.menuTrigger.getBoundingClientRect();
    const rect = ui.menu.getBoundingClientRect();
    const left = innerWidth > 760 ? Math.min(anchor.right + 14, innerWidth - rect.width - 14) : (innerWidth - rect.width) / 2;
    const top = Math.min(innerWidth > 760 ? anchor.top : anchor.bottom + 10, innerHeight - rect.height - 14);
    ui.menu.style.setProperty('--mg-menu-left', Math.max(14, left) + 'px');
    ui.menu.style.setProperty('--mg-menu-top', Math.max(14, top) + 'px');
  }

  function fillVoices() {
    const options = [new Option(tr('Voix automatique'), '')];
    if ('speechSynthesis' in window) window.speechSynthesis.getVoices()
      .filter(voice => voice.lang.toLowerCase().split('-')[0] === state.pair.studyLanguage)
      .forEach(voice => options.push(new Option(voice.name, voice.voiceURI)));
    ui.voice.replaceChildren(...options);
    ui.voice.value = state.voiceChoices.get(state.pair.studyLanguage) || '';
    if (ui.voice.selectedIndex < 0) ui.voice.selectedIndex = 0;
    ui.speed.value = String(state.speechRate);
  }

  function setMenuView(view) {
    state.menuView = view;
    ui.menuNav.hidden = view !== 'nav';
    Object.entries(menuPanels).forEach(([name, panel]) => { panel.hidden = name !== view; });
    ui.menuBack.hidden = view === 'nav';
    text(ui.menuTitle, tr(menuTitles[view]));
    if (view === 'voice') fillVoices();
    if (view === 'review') {
      const themes = state.pair.themes.filter(theme => !theme.isTemplateCollection);
      ui.reviewTheme.replaceChildren(...themes.map(theme => new Option(themeLabel(theme), theme.id)));
      if (state.theme && themes.includes(state.theme)) ui.reviewTheme.value = state.theme.id;
    }
    ui.menu.scrollTop = 0;
    positionMenu();
    const section = view === 'nav' ? ui.menuNav : menuPanels[view];
    section.querySelector('button,a,select,input,textarea')?.focus({ preventScroll: true });
  }

  function openMenu() {
    if (!state.pair) return;
    if (ui.menu.open) return closeMenu();
    stopAudio(); closeHelp(); buildMenu();
    ui.menu.showModal();
    ui.menuTrigger.setAttribute('aria-expanded', 'true');
    setMenuView('nav');
  }

  function closeMenu() {
    if (ui.menu.open) ui.menu.close();
    ui.menuTrigger.setAttribute('aria-expanded', 'false');
  }

  function reviewTheme(recall) {
    const theme = state.pair.themes.find(item => item.id === ui.reviewTheme.value);
    if (!theme) return;
    closeMenu();
    const phrases = presentedPhrases(theme).filter(phrase => !phrase.isTemplate);
    state.theme = theme;
    // Reuse the source preparation, including imitation, before any recall.
    const steps = theme.sequences.flatMap(sequence => sequence.steps)
      .filter(step => recall || !isRecall(step));
    startSequence({ id: state.pair.id + ':' + theme.id + ':review', phraseIds: phrases.map(phrase => phrase.id), steps }, 'review');
  }

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
    ui.menuTrigger.disabled = screen === 'loading';
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
    const scene = className === 'mg-theme' && theme && (theme.photo || themePhotos.get(theme.domain || theme.id));
    if (scene) {
      pictogram.classList.add('mg-theme-photo');
      pictogram.dataset.themePhoto = theme.visualId || theme.id;
      pictogram.style.setProperty('--mg-photo-column', scene.column);
      pictogram.style.setProperty('--mg-photo-row', scene.row);
      pictogram.style.setProperty('--mg-photo-columns', scene.columns || 3);
      pictogram.style.setProperty('--mg-photo-rows', scene.rows || 4);
      const photo = document.createElement('img');
      photo.src = scene.asset || (state.pair && state.pair.level > 1
        ? 'assets/theme-scenes-L' + state.pair.level + '.webp' : 'assets/theme-scenes.webp');
      photo.alt = '';
      photo.decoding = 'async';
      photo.loading = 'lazy';
      photo.draggable = false;
      // Keep the existing pictogram behind the photo as a network-failure fallback.
      photo.addEventListener('error', () => photo.remove(), { once: true });
      pictogram.append(photo);
    }
    const content = document.createElement('span');
    content.className = 'mg-sequence-copy';
    const label = document.createElement(className === 'mg-theme' ? 'span' : 'strong');
    label.className = 'mg-theme-title';
    label.textContent = title;
    const quantity = document.createElement(className === 'mg-theme' ? 'span' : 'small');
    quantity.className = 'mg-theme-count';
    quantity.textContent = quantityLabel(count, theme && theme.contentType);
    if (theme && theme.reviewCount) {
      quantity.textContent += state.pair.nativeLanguage === 'zh'
        ? ' · 其中 ' + theme.reviewCount + ' 项复习'
        : ' · ' + theme.reviewCount + (theme.reviewCount === 1 ? ' révision' : ' révisions');
    }
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
    text(ui.counter, levelQuantityLabel());
    ui.progress.style.width = '0%';
    const cards = [];
    let section = null;
    for (const theme of state.pair.themes) {
      if (theme.section && theme.section !== section) {
        section = theme.section;
        const heading = document.createElement('h2');
        heading.className = 'mg-grid-section';
        heading.textContent = state.pair.nativeLanguage === 'zh'
          ? section === 'situations' ? '情境表达' : '词汇与数字'
          : section === 'situations' ? 'Situations' : 'Vocabulaire et nombres';
        cards.push(heading);
      }
      cards.push(tile(theme.title, phraseCount(theme), themeIcon(theme), () => openTheme(theme), 'mg-theme', theme));
    }
    ui.themeGrid.replaceChildren(...cards);
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
    if (phrase.contentType === 'vocabulary' || phrase.contentType === 'number') {
      if (isRecall(step)) return { icon: icons.recall, label: 'Se rappeler', help: 'Retrouve le mot à partir de son sens. L’oreille révèle le modèle et permet de le réécouter.' };
      if (step.kind === 'imitate') return { icon: icons.mic, label: 'Répéter', help: 'Prononce le mot à voix haute. Tu peux le réécouter autant de fois que tu veux.' };
      return { icon: icons.headphones, label: 'Écouter', help: 'Écoute le mot et regarde son sens et sa prononciation.' };
    }
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
    text(ui.lessonTheme, themeLabel(state.theme) + (step.isReview
      ? state.pair.nativeLanguage === 'zh' ? ' · 复习' : ' · Révision' : ''));
    text(ui.backText, tr(state.lessonScope !== 'sequence' ? 'Thèmes' : 'Séquences'));
    ui.phase.innerHTML = definition.icon;
    ui.phase.setAttribute('aria-label', tr(definition.label));
    ui.phase.title = tr(definition.label);
    const formHelp = phrase.lexicalUsage?.requiresNounInUtterance
      ? 'Cette forme s’emploie devant un nom ; elle ne constitue pas une phrase toute seule.' : '';
    text(ui.helpText, tr(definition.help) + (formHelp ? ' ' + tr(formHelp) : ''));
    const position = Math.max(0, state.sequence.phraseIds.indexOf(step.prepares || phrase.id)) + 1;
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
    const lexical = phrase.contentType === 'vocabulary' || phrase.contentType === 'number';
    ui.ear.setAttribute('aria-label', tr(lexical
      ? masked ? 'Révéler et écouter le mot' : 'Écouter le mot'
      : masked ? 'Révéler et écouter la phrase' : 'Écouter la phrase'));
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
    text(ui.doneHeading, tr(state.lessonScope === 'review' ? 'Révision terminée'
      : state.lessonScope === 'theme' ? 'Thème terminé' : 'Séquence terminée'));
    text(ui.counter, state.sequence.phraseIds.length + ' / ' + state.sequence.phraseIds.length);
    ui.progress.style.width = '100%';
    ui.replay.disabled = false;
    ui.next.disabled = false;
    text(ui.replayText, tr('Rejouer'));
    const index = state.theme.sequences.indexOf(state.sequence);
    text(ui.nextText, tr(state.lessonScope !== 'sequence' ? 'Thèmes'
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
    utterance.rate = state.speechRate;
    const voiceList = window.speechSynthesis.getVoices();
    const exactVoice = voiceList.find(voice => voice.lang.toLowerCase() === utterance.lang.toLowerCase());
    const languageVoice = voiceList.find(voice => voice.lang.toLowerCase().split('-')[0] === state.pair.studyLanguage);
    const preferredVoice = voiceList.find(voice => voice.voiceURI === state.voiceChoices.get(state.pair.studyLanguage)
      && voice.lang.toLowerCase().split('-')[0] === state.pair.studyLanguage);
    if (preferredVoice || exactVoice || languageVoice) utterance.voice = preferredVoice || exactVoice || languageVoice;
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

  function displayPair(pair) {
    resetStep();
    state.pair = pair;
    document.documentElement.lang = pair.nativeLanguage;
    text(byId('mgThemeHeading'), pair.levelTitle || tr('Tes thèmes'));
    [[ui.palette, 'Changer d’ambiance'], [ui.menuTrigger, 'Menu des rubriques'], [ui.language, 'Langue à apprendre'],
      [ui.help, 'Aide pour cette étape'], [ui.choices, 'Choisir une réponse'],
      [ui.level || document.querySelector('.mg-level'), ui.level ? 'Choisir un niveau' : 'Niveau 1']].forEach(([node, label]) => {
      node.setAttribute('aria-label', tr(label));
    });
    ui.palette.title = tr('Changer d’ambiance');
    ui.menuTrigger.title = tr('Menu');
    ui.language.value = pair.id;
    text(ui.flag, pair.flag);
    ui.language.title = pair.name;
    if (ui.level) {
      const metadata = state.data.pairs.find(candidate => candidate.id === pair.id);
      ui.level.replaceChildren(...metadata.levels.map(level => new Option('L' + level.level + ' · ' + level.title, level.level)));
      ui.level.value = String(pair.level);
      ui.level.disabled = false;
      text(ui.levelText, 'L' + pair.level);
      ui.level.parentElement.title = 'L' + pair.level + ' · ' + pair.levelTitle;
    }
    const url = new URL(window.location.href);
    url.searchParams.set('pair', pair.id);
    if (ui.level) url.searchParams.set('level', String(pair.level));
    window.history.replaceState(null, '', url);
    showThemes();
  }

  async function choosePair(id, requestedLevel = state.level) {
    const metadata = state.data.pairs.find(candidate => candidate.id === id);
    if (!metadata) return;
    if (!ui.level) { displayPair(metadata); return; }
    const entry = metadata.levels.find(candidate => candidate.level === Number(requestedLevel));
    if (!entry) return;
    const generation = ++state.loadGeneration;
    state.request?.abort();
    state.request = new AbortController();
    const request = state.request;
    state.level = entry.level;
    state.requestedPair = id;
    stopAudio(); closeHelp(); closeMenu();
    showView('loading');
    ui.retry.hidden = true;
    text(ui.loadingText, metadata.nativeLanguage === 'zh' ? '主题正在加载…' : 'Tes thèmes arrivent…');
    try {
      const key = id + ':' + entry.level;
      let pair = state.levelCache.get(key);
      if (!pair) {
        const response = await fetch(entry.dataPath, { credentials: 'omit', cache: 'no-cache', signal: request.signal });
        if (!response.ok) throw new Error('Level unavailable');
        pair = await response.json();
        if (pair.id !== id || pair.level !== entry.level) throw new Error('Wrong level');
      }
      let references = new Map();
      let validatedBank = null;
      if (pair.themes.some(theme => (theme.reviewReferences || []).length)) {
        const repertoirePath = 'content/niveaux-progressifs/repertoires/' + id + '.json';
        if (metadata.repertoirePath !== repertoirePath) throw new Error('Missing repertoire');
        let bank = state.repertoireCache.get(id);
        if (!bank) {
          const response = await fetch(repertoirePath, { credentials: 'omit', cache: 'no-cache', signal: request.signal });
          if (!response.ok) throw new Error('Repertoire unavailable');
          bank = validateRepertoire(await response.json(), id);
        }
        references = new Map(bank.phrases.map(phrase => [phrase.id, phrase]));
        if (generation !== state.loadGeneration) return;
        validatedBank = bank;
      }
      validateData({ pairs: [pair] }, references);
      if (generation !== state.loadGeneration) return;
      if (validatedBank) {
        state.repertoireCache.delete(id);
        state.repertoireCache.set(id, validatedBank);
        while (state.repertoireCache.size > 3) state.repertoireCache.delete(state.repertoireCache.keys().next().value);
      }
      state.levelCache.delete(key);
      state.levelCache.set(key, pair);
      while (state.levelCache.size > 4) state.levelCache.delete(state.levelCache.keys().next().value);
      state.referenceMap = references;
      displayPair(pair);
    } catch (error) {
      if (generation !== state.loadGeneration || error.name === 'AbortError') return;
      text(ui.loadingText, metadata.nativeLanguage === 'zh' ? '主题暂时无法加载。' : 'Les thèmes n’ont pas pu se charger.');
      ui.retry.hidden = false;
    } finally {
      if (state.request === request) state.request = null;
    }
  }

  function validateRepertoire(bank, pairId) {
    if (!bank || bank.version !== 1 || bank.pairId !== pairId || !Array.isArray(bank.phrases)) throw new Error('Invalid repertoire');
    const ids = new Set();
    for (const phrase of bank.phrases) {
      const location = phrase.canonicalLocation;
      if (!phrase.id || ids.has(phrase.id) || phrase.referenceOnly !== true || phrase.isTemplate
          || !['utterance', 'vocabulary', 'number'].includes(phrase.contentType)
          || typeof phrase.study !== 'string' || !phrase.study.trim()
          || typeof phrase.native !== 'string' || !phrase.native.trim()
          || typeof phrase.phon !== 'string' || !phrase.phon.trim()
          || !location || location.pairId !== pairId || !location.themeId
          || !Number.isInteger(location.level) || location.level < 1 || location.level > 10
          || phrase.editorialLevel !== location.level) throw new Error('Invalid repertoire phrase');
      ids.add(phrase.id);
    }
    return bank;
  }

  function validateManifest(data) {
    if (!data || data.version !== 2 || !Array.isArray(data.pairs) || data.pairs.length !== 7) throw new Error('Missing levels');
    const pairs = new Set();
    data.pairs.forEach(pair => {
      if (!pair.id || pairs.has(pair.id) || !Array.isArray(pair.levels) || pair.levels.length !== 10) throw new Error('Invalid pair manifest');
      pairs.add(pair.id);
      const levels = new Set();
      pair.levels.forEach(level => {
        if (!Number.isInteger(level.level) || level.level < 1 || level.level > 10 || levels.has(level.level)
            || typeof level.title !== 'string' || !level.title
            || level.dataPath !== 'content/niveaux-progressifs/' + pair.id + '/L' + level.level + '.json') throw new Error('Invalid level manifest');
        levels.add(level.level);
      });
    });
    return data;
  }

  function validateData(data, references = new Map()) {
    if (!data || !Array.isArray(data.pairs) || !data.pairs.length) throw new Error('Missing pairs');
    const pairIds = new Set();
    data.pairs.forEach(pair => {
      if (!pair || !pair.id || pairIds.has(pair.id) || !Array.isArray(pair.themes) || !pair.themes.length) throw new Error('Invalid pair');
      pairIds.add(pair.id);
      const allThemes = [...pair.themes, ...(pair.heldThemes || [])];
      const active = allThemes.flatMap(theme => theme.phrases || []);
      const canonical = new Set(active.map(phrase => phrase.id));
      const activeById = new Map([...references, ...active.map(phrase => [phrase.id, phrase])]);
      if (canonical.size !== active.length) throw new Error('Duplicate canonical phrase');
      if (pair.version === 2 && pair.counts) {
        const reserve = pair.reserve || [];
        const all = [...active, ...reserve];
        if (!Array.isArray(pair.reserve) || new Set(all.map(phrase => phrase.id)).size !== all.length
            || pair.totalPhrases !== active.length || pair.totalCanonicalPhrases !== all.length
            || pair.reservedPhrases !== reserve.length) throw new Error('Invalid content partition');
        for (const type of ['utterance', 'vocabulary', 'number', 'incomplete', 'review']) {
          if (all.filter(phrase => phrase.contentType === type).length !== pair.counts[type]) throw new Error('Invalid content counts');
        }
        if (reserve.some(phrase => !['incomplete', 'review'].includes(phrase.contentType))) throw new Error('Invalid reserve');
      }
      pair.themes.forEach(theme => {
        if (!theme.id || !theme.title || !Array.isArray(theme.phrases) || !Array.isArray(theme.sequences) || !theme.sequences.length) throw new Error('Invalid theme');
        if (pair.counts && (!['utterance', 'vocabulary', 'number'].includes(theme.contentType)
            || theme.section !== (theme.contentType === 'utterance' ? 'situations' : 'vocabulary')
            || theme.phrases.some(phrase => phrase.contentType !== theme.contentType || phrase.isTemplate))) throw new Error('Mixed content theme');
        if (theme.photo && (!/^assets\/(?:theme-scenes(?:-L(?:[2-9]|10))?|vocabulary-scenes-L(?:1|3|5|7|9)-L(?:2|4|6|8|10)|pos-scenes-L1-L4|pos-scenes-L5-L8|pos-scenes-L9-L10|color-scenes|nature-scenes|leisure-scenes)\.webp$/.test(theme.photo.asset)
            || ![3, 4].includes(theme.photo.columns) || theme.photo.rows !== 4
            || !Number.isInteger(theme.photo.column) || theme.photo.column < 0 || theme.photo.column >= theme.photo.columns
            || !Number.isInteger(theme.photo.row) || theme.photo.row < 0 || theme.photo.row >= theme.photo.rows)) throw new Error('Invalid theme photo');
        const ids = new Set();
        const lexicalClass = { 'vocab-adjectifs': 'adjective', 'vocab-couleurs': 'color', 'vocab-adverbes': 'adverb' }[theme.domain];
        theme.phrases.forEach(phrase => {
          if (!phrase.id || ids.has(phrase.id) || typeof phrase.study !== 'string' || typeof phrase.native !== 'string' || typeof phrase.phon !== 'string') throw new Error('Invalid phrase');
          if (lexicalClass && phrase.lexicalClass !== lexicalClass) throw new Error('Invalid lexical class');
          ids.add(phrase.id);
        });
        const reviewIds = new Set();
        for (const reference of theme.reviewReferences || []) {
          const phrase = references.get(reference.id);
          if (!phrase || ids.has(reference.id) || reviewIds.has(reference.id)
              || phrase.contentType !== theme.contentType
              || phrase.placement?.domain !== theme.domain
              || lexicalClass && phrase.lexicalClass !== lexicalClass
              || reference.firstEditorialLevel !== phrase.canonicalLocation.level
              || reference.firstEditorialLevel >= pair.level
              || reference.canonicalThemeId !== phrase.canonicalLocation.themeId
              || !reference.reason) throw new Error('Invalid review reference');
          reviewIds.add(reference.id);
        }
        const presentedIds = new Set([...ids, ...reviewIds]);
        if (pair.counts && Number.isInteger(theme.presentedCount)
            && (theme.newCount !== ids.size || theme.reviewCount !== reviewIds.size
                || theme.presentedCount !== presentedIds.size || theme.presentedCount < 6
                || !Number.isInteger(theme.pedagogicalConceptCount)
                || theme.pedagogicalConceptCount < 6)) throw new Error('Invalid theme repertoire counts');
        const included = [];
        theme.sequences.forEach(sequence => {
          if (!Array.isArray(sequence.phraseIds) || !sequence.phraseIds.length || sequence.phraseIds.length > 5 || !Array.isArray(sequence.steps) || !sequence.steps.length) throw new Error('Invalid sequence');
          sequence.phraseIds.forEach(id => { if (!presentedIds.has(id)) throw new Error('Unknown phrase'); included.push(id); });
          const preparationIds = sequence.preparationIds || [];
          if (!Array.isArray(preparationIds) || preparationIds.some(id => !canonical.has(id))) throw new Error('Unknown preparation');
          sequence.steps.forEach(step => {
            const references = [step.utterance, ...(step.choices || [])].filter(Boolean);
            if (!references.length || references.some(id => !(step.isPreparation ? preparationIds : sequence.phraseIds).includes(id))) throw new Error('Unknown step phrase');
            if (step.isPreparation && (!['understand', 'imitate'].includes(step.kind) || !sequence.phraseIds.includes(step.prepares))) throw new Error('Invalid preparation step');
            if (reviewIds.has(step.utterance) && step.isReview !== true) throw new Error('Unmarked review');
            if (!step.isPreparation && step.isReview && !reviewIds.has(step.utterance)) throw new Error('False review');
            if (theme.contentType === 'utterance' && references.some(id => activeById.get(id)?.contentType !== 'utterance')) throw new Error('Lexical step in a situation');
          });
        });
        if (included.length !== presentedIds.size || new Set(included).size !== presentedIds.size) throw new Error('Incomplete theme');
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
      const response = await fetch(ui.level ? 'content/niveaux-progressifs/manifest.json' : 'content/maquette-guidee.json', { credentials: 'omit', cache: 'no-cache' });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      state.data = (ui.level ? validateManifest : validateData)(await response.json());
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
      if (ui.level) {
        const requestedLevel = Number(new URL(window.location.href).searchParams.get('level') || 1);
        state.level = Number.isInteger(requestedLevel) && requestedLevel >= 1 && requestedLevel <= 10 ? requestedLevel : 1;
      }
      await choosePair(firstPair.id);
    } catch (_) {
      text(ui.loadingText, 'Les thèmes n’ont pas pu se charger.');
      ui.retry.hidden = false;
      setStatus('');
    }
  }

  ui.language.addEventListener('change', () => choosePair(ui.language.value));
  ui.level?.addEventListener('change', () => choosePair(ui.language.value, ui.level.value));
  ui.menuTrigger.addEventListener('click', openMenu);
  ui.menuClose.addEventListener('click', closeMenu);
  ui.menuBack.addEventListener('click', () => setMenuView('nav'));
  ui.menu.addEventListener('close', () => ui.menuTrigger.setAttribute('aria-expanded', 'false'));
  ui.menu.addEventListener('click', event => {
    if (event.target !== ui.menu) return;
    const rect = ui.menu.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeMenu();
  });
  window.addEventListener('resize', positionMenu);
  ui.voice.addEventListener('change', () => state.voiceChoices.set(state.pair.studyLanguage, ui.voice.value));
  ui.speed.addEventListener('change', () => {
    const rate = Number(ui.speed.value);
    if ([0.75, 0.85, 1].includes(rate)) state.speechRate = rate;
  });
  if ('speechSynthesis' in window) window.speechSynthesis.addEventListener?.('voiceschanged', () => {
    if (ui.menu.open && state.menuView === 'voice') fillVoices();
  });
  ui.reviewModel.addEventListener('click', () => reviewTheme(false));
  ui.reviewRecall.addEventListener('click', () => reviewTheme(true));
  ui.feedbackMessage.addEventListener('input', () => ui.feedbackMessage.setCustomValidity(''));
  ui.feedbackForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (ui.feedbackSend.disabled) return;
    const message = ui.feedbackMessage.value.trim();
    if (message.length < 3) {
      ui.feedbackMessage.setCustomValidity(tr('Écris au moins quelques mots.'));
      ui.feedbackMessage.reportValidity(); return;
    }
    ui.feedbackSend.disabled = true;
    text(ui.feedbackStatus, tr('Envoi en cours…'));
    try {
      const response = await fetch('/.netlify/functions/send-feedback', {
        method: 'POST', credentials: 'omit', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, email: ui.feedbackEmail.value.trim(), hp: ui.feedbackHp.value,
          lang: state.pair.studyLanguage, nat: state.pair.nativeLanguage })
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error('Feedback not sent');
      ui.feedbackForm.reset();
      text(ui.feedbackStatus, tr('Merci, ton avis a été envoyé.'));
    } catch (_) { text(ui.feedbackStatus, tr('L’envoi a échoué. Tu peux réessayer.')); }
    finally { ui.feedbackSend.disabled = false; }
  });
  document.querySelector('.mg-brand').addEventListener('click', event => {
    if (!state.pair) return;
    event.preventDefault();
    showThemes();
  });
  ui.back.addEventListener('click', () => {
    if (state.screen === 'sequences' || state.lessonScope !== 'sequence') showThemes();
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
      if (state.lessonScope !== 'sequence') return showThemes();
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
  ui.retry.addEventListener('click', () => ui.level && state.data
    ? choosePair(state.requestedPair || ui.language.value, state.level) : loadData());
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeHelp(); });
  window.addEventListener('pagehide', stopAudio);

  // Read-only state supports preview checks without touching the real application.
  window.MelungaMockup = Object.freeze({ state: () => Object.freeze({
    screen: state.screen, pairId: state.pair && state.pair.id, level: state.pair && state.pair.level || 1,
    themeId: state.theme && state.theme.id,
    sequenceId: state.sequence && state.sequence.id, stepIndex: state.stepIndex, lessonScope: state.lessonScope,
    phraseId: currentPhrase() && currentPhrase().id, masked: isMasked(), helpOpen: state.helpOpen,
    template: isTemplate(currentPhrase()), totalPhrases: state.pair ? pairCount(state.pair) : 0
  }) });
  loadData();
})();
