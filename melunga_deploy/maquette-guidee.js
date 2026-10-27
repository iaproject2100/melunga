/* Published progressive course; immutable content is validated before account access views. */
(() => {
  'use strict';

  const byId = id => document.getElementById(id);
  const ui = {
    language: byId('mgLanguage'), flag: byId('mgLanguageFlag'), palette: byId('mgPalette'),
    languageTrigger: byId('mgLanguageTrigger'), languageDialog: byId('mgLanguageDialog'),
    languageChoices: byId('mgLanguageChoices'), languageClose: byId('mgLanguageClose'), desktopNav: byId('mgDesktopNav'),
    level: byId('mgLevel'), levelText: byId('mgLevelText'), levelTrigger: byId('mgLevelTrigger'),
    levelDialog: byId('mgLevelDialog'), levelChoices: byId('mgLevelChoices'), levelClose: byId('mgLevelClose'),
    menuTrigger: byId('mgMenuTrigger'), menu: byId('mgMenuDialog'), menuNav: byId('mgMenuNav'),
    menuTitle: byId('mgMenuTitle'), menuBack: byId('mgMenuBack'), menuClose: byId('mgMenuClose'), menuBody: byId('mgMenuBody'),
    voice: byId('mgVoice'), speed: byId('mgSpeed'), reviewTheme: byId('mgReviewTheme'),
    reviewModel: byId('mgReviewModel'), reviewRecall: byId('mgReviewRecall'),
    savedReviewList: byId('mgSavedReviewList'), savedReviewEmpty: byId('mgSavedReviewEmpty'),
    feedbackForm: byId('mgFeedbackForm'), feedbackMessage: byId('mgFeedbackMessage'),
    feedbackEmail: byId('mgFeedbackEmail'), feedbackHp: byId('mgFeedbackHp'),
    feedbackSend: byId('mgFeedbackSend'), feedbackStatus: byId('mgFeedbackStatus'),
    accountStatus: byId('mgAccountStatus'), accountBack: byId('mgAccountBack'),
    accountLogout: byId('mgAccountLogout'), accountLogin: byId('mgAccountLogin'), accountError: byId('mgAccountError'),
    back: byId('mgBack'), backText: byId('mgBackText'),
    counter: byId('mgCounter'), progress: byId('mgProgress'), progressTrack: byId('mgProgress').closest('.mg-progress'), content: byId('mgContent'),
    levelPercent: byId('mgLevelPercent'), levelEnd: byId('mgLevelEnd'),
    loading: byId('mgLoading'), loadingText: byId('mgLoadingText'), retry: byId('mgRetry'),
    themeView: byId('mgThemeView'), themeGrid: byId('mgThemeGrid'),
    sequenceView: byId('mgSequenceView'), sequenceHeading: byId('mgSequenceHeading'),
    sequences: byId('mgSequences'), lessonView: byId('mgLessonView'), lessonTheme: byId('mgLessonTheme'),
    phase: byId('mgPhaseIcon'), help: byId('mgHelp'), helpPanel: byId('mgHelpPanel'),
    helpText: byId('mgHelpText'), readingToggle: byId('mgReadingToggle'), readingToggleText: byId('mgReadingToggleText'),
    model: byId('mgModel'), modelTools: byId('mgModelTools'), speaker: byId('mgSpeaker'), choices: byId('mgChoices'),
    phrase: byId('mgPhrase'), phonrow: byId('mgPhonrow'), phon: byId('mgPhon'),
    ear: byId('mgEar'), listen: byId('mgListen'), reading: byId('mgReading'), translation: byId('mgTranslation'),
    done: byId('mgDone'), doneHeading: byId('mgDoneHeading'), status: byId('mgStatus'),
    footer: byId('mgFooter'), replay: byId('mgReplay'), replayText: byId('mgReplayText'),
    next: byId('mgContinue'), nextText: byId('mgContinueText'), toast: byId('mgCardToast')
  };
  const state = {
    data: null, pair: null, theme: null, sequence: null, screen: 'loading', stepIndex: 0,
    selectedPhraseId: null, revealed: false, helpOpen: false, readingVisible: false,
    speechGeneration: 0, ambienceIndex: 0, lessonScope: 'sequence', menuView: 'nav',
    voiceChoices: new Map(), speechRate: 0.85, level: 1, requestedPair: null,
    loadGeneration: 0, request: null, levelCache: new Map(),
    referenceMap: new Map(), repertoireCache: new Map(), savedReview: [], readingPreferences: {},
    deferredPhraseIds: new Set(), resumeGeneration: 0, allClassification: null, classificationOps: new Map(), accountLogoutPending: false
  };
  const courseAccess = window.MelungaCourseAccess;
  let menuAnchor = ui.menuTrigger;
  state.sourcePhraseMap = new Map();
  state.accessContextStepIds = new Set();
  state.levelProgressIds = new Set();
  const canProduce = phrase => !ui.level || courseAccess?.canLearn(state.pair?.id, phrase, state.pair?.level) === true;
  const canShowCurrent = (step, phrase) => canProduce(phrase) || state.accessContextStepIds.has(step?.id)
    && (step?.kind === 'receive' || step?.isPreparation && step.kind === 'understand' && step.requiresProduction === false);
  function openAccount() {
    stopAudio();
    window.location.href = courseAccess?.loginUrl(state.pair?.id, state.pair?.level) || lessonUrl(true);
  }
  const reviewStorageKey = 'melunga-guided-review-v1';
  const readingStorageKey = 'melunga-guided-reading-v1';
  const knownStorageKey = 'melunga-guided-known-v1';
  const progressPairs = ['fr-en', 'fr-es', 'fr-it', 'fr-zh', 'fr-ja', 'fr-ko', 'zh-fr'];
  const cardMotion = { gesture: null, suppressClickUntil: 0, animationTimer: 0, toastTimer: 0, fitFrame: 0 };
  state.savedReview = loadSavedReview();
  state.knownCards = loadKnownCards();
  try {
    const preferences = JSON.parse(localStorage.getItem(readingStorageKey) || '{}');
    if (preferences.version === 1 && preferences.pairs && typeof preferences.pairs === 'object') {
      for (const [pair, value] of Object.entries(preferences.pairs)) if (/^[a-z]{2}-[a-z]{2}$/.test(pair) && typeof value === 'boolean') state.readingPreferences[pair] = value;
    }
  } catch (_) { /* Storage can be unavailable; the lesson still works. */ }
  const ambiences = ['ocean', 'aurora', 'dusk'];
  try {
    const savedAmbience = sessionStorage.getItem('melunga-course-ambience');
    if (ambiences.includes(savedAmbience)) {
      state.ambienceIndex = ambiences.indexOf(savedAmbience);
      document.body.dataset.ambience = savedAmbience;
    }
  } catch (_) { /* The selected colour still works when storage is unavailable. */ }
  function changeAmbience() {
    state.ambienceIndex = (state.ambienceIndex + 1) % ambiences.length;
    const ambience = ambiences[state.ambienceIndex];
    document.body.dataset.ambience = ambience;
    try { sessionStorage.setItem('melunga-course-ambience', ambience); } catch (_) { /* Keep the current colour. */ }
  }
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
    'Abonnement': '订阅解锁', 'gratuits': '免费', 'Mon compte': '我的账户',
    'Accès complet actif sur cet appareil.': '此设备可使用全部内容。',
    'Aperçu de l’espace compte.': '账户页面预览。',
    'Connecte-toi pour retrouver ton accès.': '登录以恢复访问权限。',
    'Revenir aux leçons': '返回课程', 'Se déconnecter': '退出登录',
    'Déconnexion en cours…': '正在退出…', 'Déconnexion impossible. Réessaie.': '暂时无法退出，请重试。',
    'Se déconnecter ? Cet appareil sera verrouillé jusqu’à ta prochaine connexion.': '确定退出登录？此设备将被锁定，直到你重新登录。',
    'Révision terminée': '复习已完成',
    'À revoir': '待复习', 'Revoir': '复习', 'Retirer': '移除', 'Pinyin': '拼音',
    'Enregistré dans À revoir.': '已加入待复习。', 'Je connais.': '我会了。',
    'Elle reviendra': '稍后再练', 'Rangée': '已掌握',
    'Aucun mot ni phrase à revoir pour le moment.': '暂时没有待复习的词句。',
    'Cette carte ne peut pas être enregistrée. Réessaie avant de quitter cette page.': '无法保存这张卡片。离开前请重试。',
    'Ce contenu a été actualisé. Tu peux le retrouver dans les thèmes.': '内容已更新，可以在主题中重新查找。',
    'Menu': '菜单', 'Menu des rubriques': '栏目菜单', 'Rubriques': '栏目',
    'Revenir au menu': '返回菜单', 'Fermer le menu': '关闭菜单', 'Fermer les niveaux': '关闭级别选择',
    'Cette progression ne peut pas être enregistrée. Réessaie avant de quitter cette page.': '无法保存学习进度。请在离开此页前重试。',
    'Accueil': '首页', 'Révisions et exercices': '复习与练习', 'Toutes les leçons': '所有课程', 'Fin': '完成',
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
    'Langue à apprendre': '学习语言', 'Choisir une langue': '选择学习语言', 'Langues': '语言', 'Fermer les langues': '关闭语言选择',
    'Anglais': '英语', 'Espagnol': '西班牙语', 'Italien': '意大利语', 'Chinois': '中文', 'Japonais': '日语', 'Coréen': '韩语', 'Français': '法语',
    'Révisions': '复习', 'Aide': '帮助', 'Connexion': '登录',
    'Choisir un niveau': '选择级别', 'Aide pour cette étape': '本步骤帮助',
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
    if (state.pair._accessView && !state.pair.themes.some(theme => theme.presentedCount > 0)) return tr('Abonnement');
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
    return state.referenceMap.get(id) || state.sourcePhraseMap.get(id) || null;
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

  // Only an explicit “Je connais” decision counts. Source identity, not the
  // number of appearances or lesson steps, makes a card unique in a level.
  function collectLevelProgressIds(pair, models) {
    const ids = new Set();
    for (const theme of pair.themes) {
      if (theme.isTemplate || theme.isTemplateCollection) continue;
      for (const sequence of theme.sequences) for (const id of sequence.phraseIds) {
        const phrase = models.get(id);
        if (phrase && !phrase.isTemplate && phrase.kind !== 'received' && phrase.speaker !== 'B') ids.add(id);
      }
    }
    return ids;
  }

  function levelProgress() {
    const ids = state.levelProgressIds;
    const knownIds = state.knownCards.get(state.pair?.id);
    let known = 0;
    for (const id of ids) if (knownIds?.has(id)) known += 1;
    const total = ids.size;
    const ratio = total ? known / total : 0;
    // Integer labels never announce 100% while any card remains unknown.
    return { known, total, ratio, percent: Math.floor(ratio * 100) };
  }

  function renderLevelProgress() {
    if (!ui.level || !state.pair) return;
    const summary = levelProgress();
    const levelName = state.pair.nativeLanguage === 'zh'
      ? '第 ' + state.pair.level + ' 级' : 'Niveau ' + state.pair.level;
    const label = levelName + ' · ' + summary.percent + ' %';
    text(ui.counter, 'L' + state.pair.level);
    text(ui.levelPercent, summary.percent + ' %');
    text(ui.levelEnd, tr('Fin'));
    ui.progress.style.width = summary.ratio * 100 + '%';
    ui.progressTrack.style.setProperty('--mg-level-ratio', summary.ratio * 100 + '%');
    // Positive colour cues are presentation only; the known-card ratio above
    // remains the sole source of progress and completion.
    const stops = [[80, 214, 232], [112, 234, 173], [255, 216, 113]];
    const stage = summary.ratio < 0.5 ? 0 : 1;
    const blend = stage ? (summary.ratio - 0.5) * 2 : summary.ratio * 2;
    const colour = stops[stage].map((channel, index) => Math.round(channel + (stops[stage + 1][index] - channel) * blend));
    ui.progressTrack.style.setProperty('--mg-journey-colour', 'rgb(' + colour.join(', ') + ')');
    ui.progressTrack.classList.toggle('is-complete', summary.known === summary.total && summary.total > 0);
    ui.progressTrack.removeAttribute('aria-hidden');
    ui.progressTrack.setAttribute('role', 'progressbar');
    ui.progressTrack.setAttribute('aria-label', levelName);
    ui.progressTrack.setAttribute('aria-valuemin', '0');
    ui.progressTrack.setAttribute('aria-valuemax', '100');
    ui.progressTrack.setAttribute('aria-valuenow', String(summary.ratio * 100));
    ui.progressTrack.setAttribute('aria-valuetext', label);
  }

  function loadKnownCards() {
    const pairs = new Map();
    try {
      const stored = JSON.parse(localStorage.getItem(knownStorageKey) || '{}');
      if (stored.version !== 1 || !stored.pairs || typeof stored.pairs !== 'object' || Array.isArray(stored.pairs)) return pairs;
      for (const pair of progressPairs) {
        const values = stored.pairs[pair];
        if (!Array.isArray(values)) continue;
        pairs.set(pair, new Set(values.filter(id => typeof id === 'string' && id.length > 0 && id.length <= 512)));
      }
    } catch (_) { /* No prior decisions can be inferred from missing storage. */ }
    return pairs;
  }

  function saveKnownCard(pairId, id, known) {
    const pairs = loadKnownCards();
    const ids = pairs.get(pairId) || new Set();
    if (ids.has(id) === known) { state.knownCards = pairs; return true; }
    if (known) ids.add(id); else ids.delete(id);
    if (ids.size) pairs.set(pairId, ids); else pairs.delete(pairId);
    try {
      localStorage.setItem(knownStorageKey, JSON.stringify({ version: 1,
        pairs: Object.fromEntries([...pairs].map(([pair, values]) => [pair, [...values]])) }));
      state.knownCards = pairs;
      return true;
    } catch (_) {
      setStatus('Cette progression ne peut pas être enregistrée. Réessaie avant de quitter cette page.');
      return false;
    }
  }

  function saveCardDecision(phrase, known, reviewEntries) {
    if (!ui.level) return saveReviewEntries(reviewEntries);
    const previousReview = state.savedReview;
    const changed = previousReview.length !== reviewEntries.length
      || previousReview.some((entry, index) => entry !== reviewEntries[index]);
    if (changed && !saveReviewEntries(reviewEntries)) return false;
    if (ui.level && !saveKnownCard(state.pair.id, phrase.id, known)) {
      // Keep the prior reminder if the separate progress write is refused.
      if (changed) saveReviewEntries(previousReview);
      return false;
    }
    return true;
  }

  const menuPanels = {
    voice: byId('mgVoicePanel'), review: byId('mgReviewPanel'),
    saved: byId('mgSavedReviewPanel'),
    feedback: byId('mgFeedbackPanel'), info: byId('mgInfoPanel'), account: byId('mgAccountPanel')
  };
  const menuTitles = { nav: 'Menu', voice: 'Voix', review: 'Révisions et exercices', saved: 'À revoir', feedback: 'Avis', info: 'Comment ça marche', account: 'Mon compte' };

  function loadSavedReview() {
    try {
      const stored = JSON.parse(localStorage.getItem(reviewStorageKey) || '{}');
      if (stored.version !== 1 || !Array.isArray(stored.entries)) return [];
      const entries = new Map();
      for (const entry of stored.entries) {
        if (!entry || !/^[a-z]{2}-[a-z]{2}$/.test(entry.pairId) || typeof entry.id !== 'string' || !entry.id
            || typeof entry.themeId !== 'string' || !Number.isInteger(entry.level) || entry.level < 1 || entry.level > 10
            || typeof entry.study !== 'string' || typeof entry.native !== 'string' || !Number.isFinite(entry.addedAt)) continue;
        entries.set(entry.pairId + '|' + entry.id, entry);
      }
      return [...entries.values()];
    } catch (_) { return []; }
  }

  function saveReviewEntries(entries) {
    try {
      localStorage.setItem(reviewStorageKey, JSON.stringify({ version: 1, entries }));
      state.savedReview = entries;
      return true;
    } catch (_) {
      setStatus('Cette carte ne peut pas être enregistrée. Réessaie avant de quitter cette page.');
      return false;
    }
  }

  function renderSavedReview() {
    const entries = state.savedReview.filter(entry => entry.pairId === state.pair.id).sort((a, b) => b.addedAt - a.addedAt);
    ui.savedReviewEmpty.hidden = entries.length > 0;
    ui.savedReviewList.replaceChildren(...entries.map(entry => {
      const row = document.createElement('article');
      row.className = 'mg-saved-review-item'; row.dataset.reviewId = entry.id;
      const copy = document.createElement('div'); copy.className = 'mg-saved-review-copy';
      const study = document.createElement('strong'); study.textContent = entry.study; study.lang = state.pair.studyLanguage;
      const native = document.createElement('span'); native.textContent = entry.native; native.lang = state.pair.nativeLanguage;
      const relocation = effectiveOperation(entry.pairId, entry.id);
      const level = document.createElement('small'); level.textContent = 'L' + (relocation?.op === 'move' ? relocation.toLevel : entry.level);
      copy.append(study, native, level);
      const actions = document.createElement('div'); actions.className = 'mg-saved-review-actions';
      for (const action of ['resume', 'remove']) {
        const button = document.createElement('button'); button.type = 'button'; button.className = 'mg-action';
        button.dataset.reviewAction = action;
        const label = tr(action === 'resume' ? 'Revoir' : 'Retirer'); button.textContent = label;
        button.setAttribute('aria-label', label + ' : ' + entry.study);
        button.addEventListener('click', () => {
          if (action === 'resume') resumeSavedReview(entry);
          else if (saveReviewEntries(state.savedReview.filter(item => item.pairId !== entry.pairId || item.id !== entry.id))) {
            renderSavedReview(); positionMenu();
            (ui.savedReviewList.querySelector('button') || ui.menuBack).focus({ preventScroll: true });
          }
        });
        actions.append(button);
      }
      row.append(copy, actions);
      return row;
    }));
  }

  async function resumeSavedReview(entry) {
    const token = ++state.resumeGeneration;
    closeMenu();
    const operation = effectiveOperation(entry.pairId, entry.id);
    const targetLevel = operation && operation.op !== 'keep' ? operation.toLevel : entry.level;
    const targetTheme = operation?.op === 'move' ? operation.toTheme : entry.themeId;
    const loading = choosePair(entry.pairId, targetLevel);
    const generation = state.loadGeneration;
    await loading;
    if (token !== state.resumeGeneration || generation !== state.loadGeneration || state.screen === 'loading'
        || state.pair?.id !== entry.pairId || ui.level && state.pair.level !== targetLevel) return;
    if (operation && ['to-reserve', 'hide-theme-to-reserve'].includes(operation.op)) {
      showThemes(); setStatus('Cette fiche reste enregistrée dans À revoir, mais n’est plus proposée dans le parcours.'); return;
    }
    const theme = state.pair.themes.find(candidate => candidate.id === targetTheme && presentedPhrases(candidate).some(phrase => phrase.id === entry.id))
      || state.pair.themes.find(candidate => presentedPhrases(candidate).some(phrase => phrase.id === entry.id));
    const phrase = theme && presentedPhrases(theme).find(candidate => candidate.id === entry.id);
    const sourcePhrase = phrase || state.sourcePhraseMap.get(entry.id);
    if (sourcePhrase && !canProduce(sourcePhrase)) { openAccount(); return; }
    if (!phrase || phrase.isTemplate || phrase.kind === 'received' || phrase.speaker === 'B') {
      showThemes(); setStatus('Ce contenu a été actualisé. Tu peux le retrouver dans les thèmes.'); return;
    }
    if (operation?.op === 'move' && (entry.level !== targetLevel || entry.themeId !== theme.id)) {
      saveReviewEntries(state.savedReview.map(item => item.pairId === entry.pairId && item.id === entry.id
        ? { ...item, level: targetLevel, themeId: theme.id, study: phrase.study, native: phrase.native } : item));
    }
    state.theme = theme;
    const id = state.pair.id + ':saved:' + phrase.id;
    const steps = ['understand', 'imitate', 'choose-and-recall'].map(kind => ({
      id: id + ':' + kind, kind, utterance: phrase.id, contentType: phrase.contentType,
      requiresProduction: kind === 'choose-and-recall',
      ...(kind === 'choose-and-recall' ? { preparedInSteps: { understoodInStep: id + ':understand', imitatedInStep: id + ':imitate' } } : {})
    }));
    startSequence({ id, phraseIds: [phrase.id], steps }, 'saved-review');
  }

  function markForReview() {
    const phrase = currentPhrase();
    if (state.screen !== 'lesson' || ui.next.disabled || !phrase || !canProduce(phrase) || isTemplate(phrase) || isReceived(currentStep(), phrase)) return;
    const inTheme = presentedPhrases(state.theme).some(candidate => candidate.id === phrase.id);
    const location = state.referenceMap.get(phrase.id)?.canonicalLocation;
    const originalTheme = state.pair.themes.find(theme => theme.phrases.some(candidate => candidate.id === phrase.id));
    const previous = state.savedReview.find(entry => entry.pairId === state.pair.id && entry.id === phrase.id);
    const entry = { id: phrase.id, pairId: state.pair.id,
      level: inTheme ? state.pair.level || 1 : location?.level || phrase.editorialLevel || 1,
      themeId: inTheme ? state.theme.id : location?.themeId || originalTheme?.id || state.theme.id,
      study: phrase.study, native: phrase.native, addedAt: previous?.addedAt || Date.now() };
    const entries = state.savedReview.filter(item => item.pairId !== entry.pairId || item.id !== entry.id);
    if (!saveCardDecision(phrase, false, [...entries, entry])) return;
    state.deferredPhraseIds.add(phrase.id);
    browsePhrase(1);
    showCardToast('Elle reviendra');
    return true;
  }

  function lessonUrl(login = false) {
    if (courseAccess) return login
      ? courseAccess.loginUrl(state.pair.id, state.pair.level)
      : courseAccess.classicUrl(state.pair.id);
    const query = new URLSearchParams({ lang: state.pair.nativeLanguage });
    if (login) query.set('login', '1');
    else { query.set('start', '1'); query.set('study', state.pair.studyLanguage); }
    return 'app.html?' + query;
  }

  function menuRows() {
    const account = courseAccess?.state();
    return [
      { label: 'Accueil', icon: icons.home, href: 'index.html' },
      { label: 'Thèmes', icon: icons.folder, action: () => { closeMenu(); showThemes(); } },
      { label: 'À revoir', icon: icons.recall, panel: 'saved', key: 'À revoir' },
      { label: 'Révisions et exercices', shortLabel: 'Révisions', icon: icons.cap, panel: 'review' },
      { label: 'Voix', icon: icons.headphones, panel: 'voice' },
      { label: 'Couleur', icon: '<span class="mg-colorwheel" aria-hidden="true"></span>', action: changeAmbience },
      { label: 'Comment ça marche', shortLabel: 'Aide', icon: icons.info, panel: 'info' },
      { label: 'Avis', icon: icons.chat, panel: 'feedback' },
      account?.paid || account?.unrestricted
        ? { label: 'Mon compte', icon: icons.person, panel: 'account' }
        : { label: 'Se connecter / Créer un compte', shortLabel: 'Connexion', icon: icons.person, href: lessonUrl(true) }
    ];
  }

  function menuItem(row, desktop = false) {
    const item = document.createElement(row.href ? 'a' : 'button');
    item.className = desktop ? 'mg-rail-item' : 'mg-menu-item';
    item.dataset.menuItem = row.key || row.panel || row.label;
    item.setAttribute('aria-label', tr(row.label));
    if (desktop) item.title = tr(row.label);
    if (row.href) item.href = row.href;
    else {
      item.type = 'button';
      if (row.panel) {
        item.setAttribute('aria-haspopup', 'dialog');
        item.setAttribute('aria-controls', 'mgMenuDialog');
      }
      item.addEventListener('click', row.action || (() => desktop ? openMenu(item, row.panel) : setMenuView(row.panel)));
    }
    const icon = document.createElement('span');
    icon.className = desktop ? 'mg-rail-icon' : 'mg-menu-icon';
    icon.innerHTML = row.icon; icon.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span'); label.textContent = tr(desktop ? row.shortLabel || row.label : row.label);
    item.append(icon, label);
    return item;
  }

  function buildMenu(includeDesktop = true) {
    const rows = menuRows();
    ui.menuNav.replaceChildren(...rows.map(row => menuItem(row)));
    if (includeDesktop && ui.desktopNav) ui.desktopNav.replaceChildren(...rows.map(row => menuItem(row, true)));
    document.querySelectorAll('[data-mg-i18n]').forEach(node => text(node, tr(node.dataset.mgI18n)));
    [[ui.menuClose, 'Fermer le menu'], [ui.menuBack, 'Revenir au menu'], [ui.menuNav, 'Rubriques'], [ui.desktopNav, 'Rubriques']]
      .forEach(([node, label]) => node?.setAttribute('aria-label', tr(label)));
  }

  function positionPopup(dialog, trigger) {
    if (!dialog?.open) return;
    const viewport = window.visualViewport;
    const bounds = { left: viewport?.offsetLeft || 0, top: viewport?.offsetTop || 0,
      width: viewport?.width || innerWidth, height: viewport?.height || innerHeight };
    const gutter = 12;
    dialog.style.setProperty('--mg-dialog-max-width', Math.max(0, bounds.width - gutter * 2) + 'px');
    dialog.style.setProperty('--mg-dialog-max-height', Math.max(0, bounds.height - gutter * 2) + 'px');
    const anchor = trigger.getBoundingClientRect(), rect = dialog.getBoundingClientRect();
    const left = bounds.width > 760 ? anchor.right + 14 : bounds.left + (bounds.width - rect.width) / 2;
    const top = bounds.width > 760 ? anchor.top : anchor.bottom + 10;
    dialog.style.setProperty('--mg-menu-left', Math.max(bounds.left + gutter,
      Math.min(left, bounds.left + bounds.width - rect.width - gutter)) + 'px');
    dialog.style.setProperty('--mg-menu-top', Math.max(bounds.top + gutter,
      Math.min(top, bounds.top + bounds.height - rect.height - gutter)) + 'px');
  }

  function positionMenu() { positionPopup(ui.menu, menuAnchor); }
  function positionPopups() {
    positionMenu(); positionPopup(ui.levelDialog, ui.levelTrigger); positionPopup(ui.languageDialog, ui.languageTrigger);
  }

  function buildLanguageChoices() {
    const names = { en: 'Anglais', es: 'Espagnol', it: 'Italien', zh: 'Chinois', ja: 'Japonais', ko: 'Coréen', fr: 'Français' };
    text(byId('mgLanguageTitle'), tr('Langues'));
    ui.languageClose.setAttribute('aria-label', tr('Fermer les langues'));
    ui.languageTrigger.disabled = false;
    ui.languageChoices.replaceChildren(...state.data.pairs.map(pair => {
      const button = document.createElement('button'); button.type = 'button';
      button.className = 'mg-language-option'; button.dataset.pair = pair.id;
      button.setAttribute('aria-pressed', String(pair.id === state.pair.id));
      const badge = document.createElement('span'); badge.className = 'mg-language-badge';
      badge.textContent = pair.flag; badge.dataset.language = pair.studyLanguage; badge.setAttribute('aria-hidden', 'true');
      const title = document.createElement('span'); title.className = 'mg-language-title';
      title.textContent = tr(names[pair.studyLanguage] || pair.name);
      button.append(badge, title);
      button.addEventListener('click', () => {
        closeLanguages();
        if (state.screen !== 'loading' && state.pair.id === pair.id) return;
        ui.language.value = pair.id;
        ui.language.dispatchEvent(new Event('change', { bubbles: true }));
      });
      return button;
    }));
  }
  function closeLanguages() {
    if (ui.languageDialog?.open) ui.languageDialog.close();
    ui.languageTrigger?.setAttribute('aria-expanded', 'false');
  }
  function openLanguages() {
    if (!state.pair || ui.languageTrigger.disabled) return;
    if (ui.languageDialog.open) return closeLanguages();
    stopAudio(); closeHelp(); closeMenu(); closeLevels(); resetCardMotion();
    ui.languageDialog.showModal(); ui.languageTrigger.setAttribute('aria-expanded', 'true');
    positionPopup(ui.languageDialog, ui.languageTrigger);
    ui.languageChoices.querySelector('[aria-pressed="true"]')?.focus({ preventScroll: true });
  }

  const levelColors = ['#228574', '#237e99', '#3369aa', '#5e5bb4', '#8b51ad',
    '#a54982', '#b2485c', '#a95d30', '#89671b', '#5f782d'];
  function buildLevelChoices(metadata) {
    if (!ui.levelChoices) return;
    text(byId('mgLevelTitle'), tr('Choisir un niveau'));
    ui.levelClose.setAttribute('aria-label', tr('Fermer les niveaux'));
    ui.levelTrigger.disabled = false;
    ui.levelTrigger.style.setProperty('--mg-level-color', levelColors[state.pair.level - 1]);
    ui.levelChoices.replaceChildren(...metadata.levels.map(level => {
      const button = document.createElement('button'); button.type = 'button';
      button.className = 'mg-level-option'; button.dataset.level = String(level.level);
      button.style.setProperty('--mg-level-color', levelColors[level.level - 1]);
      button.setAttribute('aria-pressed', String(level.level === state.pair.level));
      const badge = document.createElement('span'); badge.className = 'mg-level-badge';
      badge.textContent = 'L' + level.level;
      const title = document.createElement('span'); title.className = 'mg-level-title'; title.textContent = level.title;
      button.append(badge, title);
      button.addEventListener('click', () => {
        closeLevels();
        if (state.screen !== 'loading' && state.pair.level === level.level) return;
        ui.level.value = String(level.level);
        ui.level.dispatchEvent(new Event('change', { bubbles: true }));
      });
      return button;
    }));
  }
  function closeLevels() {
    if (ui.levelDialog?.open) ui.levelDialog.close();
    ui.levelTrigger?.setAttribute('aria-expanded', 'false');
  }
  function openLevels() {
    if (!state.pair || ui.levelTrigger.disabled) return;
    if (ui.levelDialog.open) return closeLevels();
    stopAudio(); closeHelp(); closeMenu(); closeLanguages(); resetCardMotion();
    ui.levelDialog.showModal(); ui.levelTrigger.setAttribute('aria-expanded', 'true');
    positionPopup(ui.levelDialog, ui.levelTrigger);
    const selected = ui.levelChoices.querySelector('[aria-pressed="true"]');
    selected?.focus({ preventScroll: true });
    selected?.scrollIntoView({ block: 'nearest' });
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
    if (view === 'saved') renderSavedReview();
    if (view === 'account') renderAccount();
    if (view === 'review') {
      const themes = state.pair.themes.filter(theme => !theme.isTemplateCollection);
      ui.reviewTheme.replaceChildren(...themes.map(theme => new Option(themeLabel(theme), theme.id)));
      if (state.theme && themes.includes(state.theme)) ui.reviewTheme.value = state.theme.id;
    }
    ui.menuBody.scrollTop = 0;
    positionMenu();
    const section = view === 'nav' ? ui.menuNav : menuPanels[view];
    section.querySelector('button,a,select,input,textarea')?.focus({ preventScroll: true });
  }

  function openMenu(anchor = ui.menuTrigger, view = 'nav') {
    if (!state.pair) return;
    if (ui.menu.open) return closeMenu();
    stopAudio(); closeHelp(); closeLevels(); closeLanguages(); buildMenu(false);
    menuAnchor = anchor;
    ui.menu.showModal();
    ui.menuTrigger.setAttribute('aria-expanded', 'true');
    setMenuView(view);
  }

  function closeMenu() {
    if (ui.menu.open) ui.menu.close();
    ui.menuTrigger.setAttribute('aria-expanded', 'false');
  }

  function renderAccount() {
    const account = courseAccess?.state();
    text(ui.accountStatus, tr(account?.unrestricted ? 'Aperçu de l’espace compte.'
      : account?.paid ? 'Accès complet actif sur cet appareil.' : 'Connecte-toi pour retrouver ton accès.'));
    text(ui.accountError, '');
    text(ui.accountLogout, tr(state.accountLogoutPending ? 'Déconnexion en cours…' : 'Se déconnecter'));
    ui.accountLogout.hidden = !account?.paid && !account?.unrestricted;
    ui.accountLogout.disabled = !account?.paid || state.accountLogoutPending;
    ui.accountLogin.hidden = Boolean(account?.paid || account?.unrestricted);
    ui.accountLogin.href = lessonUrl(true);
  }

  async function logoutAccount() {
    if (state.accountLogoutPending || !courseAccess?.state().paid) return;
    if (!window.confirm(tr('Se déconnecter ? Cet appareil sera verrouillé jusqu’à ta prochaine connexion.'))) return;
    state.accountLogoutPending = true;
    renderAccount();
    ui.accountLogout.setAttribute('aria-busy', 'true');
    try {
      if (await courseAccess.logout() !== true) throw new Error('Logout unavailable');
      closeMenu();
    } catch (_) {
      text(ui.accountError, tr('Déconnexion impossible. Réessaie.'));
    } finally {
      state.accountLogoutPending = false;
      ui.accountLogout.removeAttribute('aria-busy');
      ui.accountLogout.disabled = !courseAccess.state().paid;
      text(ui.accountLogout, tr('Se déconnecter'));
    }
  }

  function reviewTheme(recall) {
    const theme = state.pair.themes.find(item => item.id === ui.reviewTheme.value);
    if (!theme) return;
    if (theme._accessLocked) { closeMenu(); openAccount(); return; }
    closeMenu();
    const phrases = presentedPhrases(theme).filter(phrase => !phrase.isTemplate);
    state.theme = theme;
    // Reuse the source preparation, including imitation, before any recall.
    const steps = theme.sequences.flatMap(sequence => sequence.steps)
      .filter(step => recall || !isRecall(step));
    startSequence({ id: state.pair.id + ':' + theme.id + ':review', phraseIds: phrases.map(phrase => phrase.id), steps }, 'review');
  }

  function setAudioPlaying(playing) {
    for (const control of [ui.ear, ui.listen]) {
      if (!control) continue;
      control.classList.toggle('is-playing', playing);
      if (playing) control.setAttribute('aria-busy', 'true');
      else control.removeAttribute('aria-busy');
    }
  }

  function stopAudio() {
    state.speechGeneration += 1;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setAudioPlaying(false);
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
    closeHelp();
    setStatus('');
  }

  function showView(screen) {
    resetCardMotion();
    state.screen = screen;
    ui.loading.hidden = screen !== 'loading';
    ui.themeView.hidden = screen !== 'themes';
    ui.sequenceView.hidden = screen !== 'sequences';
    ui.lessonView.hidden = !['lesson', 'done'].includes(screen);
    ui.footer.hidden = !['lesson', 'done'].includes(screen);
    ui.back.hidden = ['loading', 'themes'].includes(screen);
    ui.menuTrigger.disabled = screen === 'loading';
    ui.languageTrigger.disabled = screen === 'loading';
    if (ui.levelTrigger) ui.levelTrigger.disabled = screen === 'loading';
    if (ui.desktopNav) ui.desktopNav.inert = screen === 'loading';
    ui.content.scrollTop = 0;
    document.body.dataset.view = screen;
    const levelSummary = Boolean(ui.level && screen === 'themes');
    document.body.classList.toggle('mg-has-level-progress', levelSummary);
    ui.progressTrack.classList.toggle('is-level-progress', levelSummary);
    if (ui.levelPercent) ui.levelPercent.hidden = !levelSummary;
    if (ui.levelEnd) ui.levelEnd.hidden = !levelSummary;
    if (levelSummary) renderLevelProgress();
    else {
      ui.progressTrack.setAttribute('aria-hidden', 'true');
      for (const attr of ['role', 'aria-label', 'aria-valuemin', 'aria-valuemax', 'aria-valuenow', 'aria-valuetext']) ui.progressTrack.removeAttribute(attr);
    }
    queueLessonFit();
  }

  // Fit the complete text, rather than truncating it or giving the lesson an
  // inner scrollbar. Short cards retain their normal large type. Longer cards
  // first use tighter spacing, then adapt to the available viewport.
  function queueLessonFit() {
    if (cardMotion.fitFrame) return;
    cardMotion.fitFrame = requestAnimationFrame(() => {
      cardMotion.fitFrame = 0;
      fitLesson();
    });
  }

  function fitLesson() {
    if (!['lesson', 'done'].includes(state.screen)) return;
    const root = document.body;
    // A deploy preview can add its own fixed bottom toolbar. Reserve its real
    // occupied space, including when it is injected after the lesson loads.
    let usableHeight = window.innerHeight;
    for (const element of root.children) {
      if (element.matches('.mg-app,.mg-previewnotice,.mg-card-toast,dialog,script,style')) continue;
      const bounds = element.getBoundingClientRect();
      if (getComputedStyle(element).position === 'fixed' && bounds.width >= window.innerWidth * 0.4
          && bounds.height >= 20 && bounds.height <= 180 && bounds.top >= window.innerHeight * 0.6
          && bounds.bottom >= window.innerHeight - 4) usableHeight = Math.min(usableHeight, bounds.top - 6);
    }
    root.style.setProperty('--mg-usable-height', usableHeight + 'px');
    if (state.screen !== 'lesson' || ui.model.hidden) return;
    const nodes = [ui.phrase, ui.phon, ui.translation, ui.reading];
    for (const node of nodes) node.style.removeProperty('font-size');
    for (const property of ['--mg-fit-gap', '--mg-fit-model-padding', '--mg-fit-phon-padding']) root.style.removeProperty(property);
    const visible = nodes.filter(node => !node.hidden && node.getClientRects().length);
    const baseline = visible.map(node => parseFloat(getComputedStyle(node).fontSize));
    const fits = () => {
      const bounds = ui.model.getBoundingClientRect();
      const style = getComputedStyle(ui.model);
      const top = bounds.top + parseFloat(style.paddingTop);
      const bottom = bounds.bottom - parseFloat(style.paddingBottom);
      return ui.model.scrollHeight <= ui.model.clientHeight + 1 && [...ui.model.children].every(node => {
        if (node.hidden || !node.getClientRects().length) return true;
        const rect = node.getBoundingClientRect();
        return rect.top >= top - 1 && rect.bottom <= bottom + 1 && node.scrollWidth <= node.clientWidth + 1;
      });
    };
    if (fits()) return;
    root.style.setProperty('--mg-fit-gap', '4px');
    root.style.setProperty('--mg-fit-model-padding', '2px');
    root.style.setProperty('--mg-fit-phon-padding', '6px');
    if (fits()) return;
    const scaleFonts = scale => visible.forEach((node, index) => {
      node.style.fontSize = Math.max(node === ui.reading ? 10 : 12, baseline[index] * scale) + 'px';
    });
    let low = 0, high = 1;
    for (let iteration = 0; iteration < 9; iteration += 1) {
      const middle = (low + high) / 2;
      scaleFonts(middle);
      if (fits()) low = middle;
      else high = middle;
    }
    scaleFonts(low);
  }

  function resetCardMotion() {
    cardMotion.gesture = null;
    clearTimeout(cardMotion.animationTimer);
    ui.lessonView.classList.remove('mg-gesture-dragging', 'mg-card-enter-up', 'mg-card-enter-down', 'mg-card-enter-left', 'mg-card-enter-right');
    ui.lessonView.style.removeProperty('--mg-drag-x');
    ui.lessonView.style.removeProperty('--mg-drag-y');
  }

  function animateCard(direction) {
    if (!['lesson', 'done'].includes(state.screen)) return;
    resetCardMotion();
    // Restart the animation even when two consecutive swipes go the same way.
    void ui.lessonView.offsetWidth;
    ui.lessonView.classList.add('mg-card-enter-' + direction);
    cardMotion.animationTimer = setTimeout(resetCardMotion, 220);
  }

  function showCardToast(message) {
    clearTimeout(cardMotion.toastTimer);
    text(ui.toast, tr(message));
    ui.toast.hidden = false;
    cardMotion.toastTimer = setTimeout(() => { ui.toast.hidden = true; }, 1400);
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
    if (theme && theme.reuseCount) {
      quantity.textContent += state.pair.nativeLanguage === 'zh'
        ? ' · 其中 ' + theme.reuseCount + ' 项情境复用'
        : ' · ' + theme.reuseCount + (theme.reuseCount === 1 ? ' réemploi' : ' réemplois');
    }
    if (theme && theme.optional) quantity.textContent += ' · ' + tr('Facultatif');
    if (theme?._accessLocked) {
      quantity.textContent = quantityLabel(theme._accessTotalPresentedCount, theme.contentType) + ' · 🔒 ' + tr('Abonnement');
      button.dataset.access = 'paid';
    } else if (theme?._accessView && theme.presentedCount < theme._accessTotalPresentedCount) {
      quantity.textContent += ' · ' + tr('gratuits');
      button.dataset.access = 'free';
    }
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
    if (!ui.level) {
      text(ui.counter, levelQuantityLabel());
      ui.progress.style.width = '0%';
    }
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
    if (theme._accessLocked) { openAccount(); return; }
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
    state.deferredPhraseIds = new Set();
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
      if (!phrase || !canProduce(phrase)) return;
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
    if (!canShowCurrent(step, phrase)) { openAccount(); return; }
    const masked = isMasked();
    const template = isTemplate(phrase);
    const hasChoices = !step.utterance && Array.isArray(step.choices) && step.choices.length > 1;
    const waitingForChoice = hasChoices && !state.selectedPhraseId;
    const definition = phaseDefinition(step, phrase);
    ui.model.hidden = false;
    ui.done.hidden = true;
    ui.help.hidden = false;
    ui.phase.hidden = false;
    const themeDescription = themeLabel(state.theme) + (step.isReview
      ? state.pair.nativeLanguage === 'zh' ? ' · 复习' : ' · Révision'
      : step.isContextReuse ? state.pair.nativeLanguage === 'zh' ? ' · 情境复用' : ' · Réemploi' : '');
    text(ui.lessonTheme, state.pair.themes.includes(state.theme) ? themeNumber(state.theme) : state.theme.title);
    ui.lessonTheme.setAttribute('aria-label', themeDescription);
    ui.lessonTheme.title = themeDescription;
    text(ui.backText, tr(state.lessonScope !== 'sequence' ? 'Thèmes' : 'Séquences'));
    ui.phase.innerHTML = definition.icon;
    ui.phase.setAttribute('aria-label', tr(definition.label));
    ui.phase.title = tr(definition.label);
    const formHelp = phrase.lexicalUsage?.requiresNounInUtterance
      ? 'Cette forme s’emploie devant un nom ; elle ne constitue pas une phrase toute seule.' : '';
    text(ui.helpText, tr(definition.help) + (formHelp ? ' ' + tr(formHelp) : ''));
    const position = Math.max(0, state.sequence.phraseIds.indexOf(step.prepares || phrase.id)) + 1;
    text(ui.counter, position + ' / ' + state.sequence.phraseIds.length);
    // Listening to the other speaker is context, never another learner task.
    const progressSteps = state.sequence.steps.filter(item => item.kind !== 'receive');
    const completed = state.sequence.steps.slice(0, state.stepIndex + 1).filter(item => item.kind !== 'receive').length;
    ui.progress.style.width = (completed / progressSteps.length * 100) + '%';
    renderChoices(step);
    text(ui.phrase, phrase.study);
    ui.phrase.lang = state.pair.studyLanguage;
    ui.phrase.hidden = masked || waitingForChoice;
    const pinyin = state.pair.studyLanguage === 'zh' && state.readingVisible && Boolean(phrase.reading);
    text(ui.phon, pinyin ? phrase.reading : phrase.phon);
    ui.phon.lang = pinyin ? 'zh-Latn' : state.pair.nativeLanguage;
    ui.phonrow.dataset.readingMode = pinyin ? 'pinyin' : 'phonetic';
    ui.phon.hidden = masked || waitingForChoice || !phrase.phon;
    ui.phonrow.classList.toggle('is-recall', masked || waitingForChoice || !phrase.phon);
    ui.ear.hidden = template || waitingForChoice;
    ui.phonrow.hidden = template && !phrase.phon || waitingForChoice;
    const lexical = phrase.contentType === 'vocabulary' || phrase.contentType === 'number';
    ui.ear.setAttribute('aria-label', tr(lexical
      ? masked ? 'Révéler et écouter le mot' : 'Écouter le mot'
      : masked ? 'Révéler et écouter la phrase' : 'Écouter la phrase'));
    ui.ear.title = tr(masked ? 'Révéler et écouter' : 'Écouter');
    if (ui.listen) {
      ui.listen.hidden = ui.ear.hidden;
      ui.listen.setAttribute('aria-label', ui.ear.getAttribute('aria-label'));
      ui.listen.title = ui.ear.title;
    }
    text(ui.translation, waitingForChoice ? '' : phrase.native);
    ui.translation.lang = state.pair.nativeLanguage;
    text(ui.reading, phrase.reading);
    ui.reading.hidden = state.pair.studyLanguage === 'zh' || !state.readingVisible || masked || waitingForChoice || !phrase.reading;
    ui.readingToggle.hidden = !phrase.reading || state.pair.studyLanguage !== 'zh' && (masked || waitingForChoice);
    ui.readingToggle.disabled = masked || waitingForChoice;
    ui.readingToggle.setAttribute('aria-pressed', String(state.readingVisible));
    if (ui.modelTools) ui.modelTools.hidden = ui.readingToggle.hidden && (!ui.listen || ui.listen.hidden);
    text(ui.readingToggleText, state.pair.studyLanguage === 'zh' ? tr('Pinyin') : tr(state.readingVisible ? 'Masquer la lecture' : 'Afficher la lecture'));
    ui.speaker.hidden = !isReceived(step, phrase);
    const role = step.role;
    text(ui.speaker, (typeof role === 'string' ? role : role?.[state.pair.nativeLanguage]) || step.speakerName || phrase.speakerName || tr('Interlocuteur'));
    ui.replay.disabled = template || isReceived(step, phrase) || waitingForChoice || !canProduce(phrase);
    text(ui.replayText, tr('À revoir'));
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
    text(ui.doneHeading, tr(['review', 'saved-review'].includes(state.lessonScope) ? 'Révision terminée'
      : state.lessonScope === 'theme' ? 'Thème terminé' : 'Séquence terminée'));
    text(ui.counter, state.sequence.phraseIds.length + ' / ' + state.sequence.phraseIds.length);
    ui.progress.style.width = '100%';
    ui.replay.disabled = false;
    ui.next.disabled = false;
    text(ui.replayText, tr('Rejouer'));
    const index = state.theme.sequences.indexOf(state.sequence);
    text(ui.nextText, tr(state.lessonScope === 'saved-review' ? 'À revoir' : state.lessonScope !== 'sequence' ? 'Thèmes'
      : index < state.theme.sequences.length - 1 ? 'Séquence suivante' : 'Les séquences'));
    setStatus('');
    showView('done');
  }

  function isDeferred(step) {
    return state.deferredPhraseIds.has(step.utterance) || step.prepares && state.deferredPhraseIds.has(step.prepares);
  }

  function advanceStep() {
    if (state.screen !== 'lesson' || ui.next.disabled) return;
    do { state.stepIndex += 1; } while (state.stepIndex < state.sequence.steps.length && isDeferred(currentStep()));
    resetStep();
    if (state.stepIndex >= state.sequence.steps.length) showDone();
    else renderStep();
  }

  function browsePhrase(direction) {
    if (state.screen !== 'lesson' || !state.sequence || ui.next.disabled) return;
    const step = currentStep();
    if (direction > 0 && isReceived(step, currentPhrase())) return advanceStep();
    const current = state.sequence.phraseIds.indexOf(step.prepares || step.utterance || state.selectedPhraseId);
    let position = current + direction;
    while (direction > 0 && position < state.sequence.phraseIds.length && state.deferredPhraseIds.has(state.sequence.phraseIds[position])) position += 1;
    if (position < 0) return;
    if (position >= state.sequence.phraseIds.length) return showDone();
    const target = state.sequence.phraseIds[position];
    const index = state.sequence.steps.findIndex(candidate => !candidate.isPreparation && candidate.kind === 'understand' && candidate.utterance === target);
    const fallback = state.sequence.steps.findIndex(candidate => !candidate.isPreparation && candidate.kind !== 'receive'
      && (candidate.utterance === target || candidate.choices?.includes(target)));
    if (index < 0 && fallback < 0) return;
    state.deferredPhraseIds.delete(target);
    state.stepIndex = index >= 0 ? index : fallback;
    resetStep(); renderStep();
  }

  function markKnown() {
    const phrase = currentPhrase();
    if (state.screen !== 'lesson' || ui.next.disabled || !phrase || !canProduce(phrase) || isTemplate(phrase) || isReceived(currentStep(), phrase)) return;
    if (!saveCardDecision(phrase, true, state.savedReview.filter(entry => entry.pairId !== state.pair.id || entry.id !== phrase.id))) return;
    state.deferredPhraseIds.add(phrase.id);
    browsePhrase(1);
    showCardToast('Rangée');
    return true;
  }

  function speak(shouldReveal) {
    const phrase = currentPhrase();
    if (state.screen !== 'lesson' || !phrase || !canShowCurrent(currentStep(), phrase) || isTemplate(phrase)) return;
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
      setAudioPlaying(false);
    };
    utterance.onend = finish;
    utterance.onerror = event => {
      if (token !== state.speechGeneration) return;
      finish();
      if (!['canceled', 'interrupted'].includes(event.error)) setStatus('L’audio n’a pas pu démarrer. Tu peux réessayer.');
    };
    setAudioPlaying(true);
    try { window.speechSynthesis.speak(utterance); }
    catch (_) { finish(); setStatus('L’audio n’a pas pu démarrer. Tu peux réessayer.'); }
  }

  function displayPair(pair) {
    resetStep();
    state.pair = pair;
    state.readingVisible = state.readingPreferences[pair.id] === true;
    document.documentElement.lang = pair.nativeLanguage;
    text(byId('mgThemeHeading'), pair.levelTitle || tr('Tes thèmes'));
    [[ui.palette, 'Changer d’ambiance'], [ui.menuTrigger, 'Menu des rubriques'], [ui.language, 'Langue à apprendre'],
      [ui.languageTrigger, 'Choisir une langue'],
      [ui.help, 'Aide pour cette étape'], [ui.choices, 'Choisir une réponse'],
      [ui.levelTrigger || ui.level || document.querySelector('.mg-level'), ui.level ? 'Choisir un niveau' : 'Niveau 1']].forEach(([node, label]) => {
      node.setAttribute('aria-label', tr(label));
    });
    ui.palette.title = tr('Changer d’ambiance');
    ui.menuTrigger.title = tr('Menu');
    ui.language.value = pair.id;
    text(ui.flag, pair.flag);
    ui.flag.dataset.language = pair.studyLanguage;
    ui.language.title = pair.name;
    ui.languageTrigger.title = pair.name;
    buildLanguageChoices();
    buildMenu();
    if (ui.level) {
      const metadata = state.data.pairs.find(candidate => candidate.id === pair.id);
      ui.level.replaceChildren(...metadata.levels.map(level => new Option('L' + level.level + ' · ' + level.title, level.level)));
      ui.level.value = String(pair.level);
      ui.level.disabled = false;
      text(ui.levelText, 'L' + pair.level);
      ui.levelTrigger.title = 'L' + pair.level + ' · ' + pair.levelTitle;
      buildLevelChoices(metadata);
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
    stopAudio(); closeHelp(); closeMenu(); closeLanguages(); closeLevels();
    showView('loading');
    ui.retry.hidden = true;
    text(ui.loadingText, metadata.nativeLanguage === 'zh' ? '主题正在加载…' : 'Tes thèmes arrivent…');
    try {
      const key = id + ':' + entry.level;
      let pair = state.levelCache.get(key);
      if (!pair) {
        const response = await fetch(entry.dataPath, { credentials: 'omit', cache: 'no-cache', signal: request.signal });
        if (!response.ok) throw new Error('Level unavailable');
        pair = await readRuntimeJson(response, entry.dataPath);
        if (pair.id !== id || pair.level !== entry.level) throw new Error('Wrong level');
      }
      let references = new Map();
      let validatedBank = null;
      if (pair.themes.some(theme => (theme.reviewReferences || []).length || (theme.contextReferences || []).length
          || (theme.receivedTurns || []).length || (theme.lexicalSupports || []).length)) {
        const repertoirePath = 'content/niveaux-progressifs/repertoires/' + id + '.json';
        if (metadata.repertoirePath !== repertoirePath) throw new Error('Missing repertoire');
        let bank = state.repertoireCache.get(id);
        if (!bank) {
          const response = await fetch(repertoirePath, { credentials: 'omit', cache: 'no-cache', signal: request.signal });
          if (!response.ok) throw new Error('Repertoire unavailable');
          bank = validateRepertoire(await readRuntimeJson(response, repertoirePath), id);
        }
        // Reserved canonical aliases remain validated in the bank, but cannot
        // supply a learnable phrase. A separate heard-only model stays listenable.
        references = new Map([...bank.phrases.filter(phrase => !phrase.canonicalReserveLocation),
          ...(bank.receivedModels || [])].map(phrase => [phrase.id, phrase]));
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
      state.sourcePhraseMap = new Map([...references, ...[...pair.themes, ...(pair.heldThemes || [])]
        .flatMap(theme => theme.phrases.map(phrase => [phrase.id, phrase]))]);
      state.levelProgressIds = collectLevelProgressIds(pair, state.sourcePhraseMap);
      const accessView = courseAccess.learningView(pair, references);
      state.accessContextStepIds = accessView.contextStepIds;
      displayPair(accessView.pair);
      try { localStorage.setItem('melunga-course-pair', pair.id); localStorage.setItem('melunga-course-level', String(pair.level)); } catch (_) {}
      if (courseAccess.state().status === 'unavailable') setStatus(pair.nativeLanguage === 'zh'
        ? '网络暂时不可用，免费内容仍可使用。' : 'Connexion indisponible : le contenu gratuit reste accessible.');
    } catch (error) {
      if (generation !== state.loadGeneration || error.name === 'AbortError') return;
      text(ui.loadingText, metadata.nativeLanguage === 'zh' ? '主题暂时无法加载。' : 'Les thèmes n’ont pas pu se charger.');
      ui.retry.hidden = false;
    } finally {
      if (state.request === request) state.request = null;
    }
  }

  // Only this reviewed ledger may relax density or type guards. The complete
  // finite policy is pinned; changing the manifest cannot widen an exception.
  const allClassificationPolicySha = '57d7731c5001d065ce53ced537f782953dcd40dd61846627739adeb1bfd06f20';
  const classificationPairIds = ['fr-en', 'fr-es', 'fr-it', 'fr-ja', 'fr-ko', 'fr-zh', 'zh-fr'];
  const stableJson = value => JSON.stringify((function sort(item) {
    if (Array.isArray(item)) return item.map(sort);
    if (item && typeof item === 'object') return Object.fromEntries(Object.keys(item).sort().map(key => [key, sort(item[key])]));
    return item;
  })(value));
  const sameItems = (left, right) => Array.isArray(left) && Array.isArray(right)
    && left.length === right.length && new Set(left).size === left.length
    && left.every(item => right.includes(item));
  const effectiveOperation = (pairId, id) => state.classificationOps.get(pairId + '|' + id);
  const classificationPolicy = pairId => state.allClassification?.pairs.find(pair => pair.pair === pairId);
  const isReservedOperation = operation => operation && (['to-reserve', 'hide-theme-to-reserve'].includes(operation.op)
    || operation.op === 'keep' && operation.fromTheme === 'reserve');

  async function loadClassificationPolicy(manifest) {
    state.allClassification = null;
    state.classificationOps = new Map();
    const policy = manifest.allClassification;
    if (policy === undefined) return;
    if (!policy || policy.version !== 1 || policy.id !== 'classement-sept-couples'
        || !sameItems(policy.pairIds, classificationPairIds)
        || policy.baseSnapshotCommit !== '13f42b5814f2b230d76d2d0ef267dcf406c523c2'
        || policy.composition?.inputCommit !== 'd30c1c97769fa180e2370e6b182535e3886bc70f'
        || policy.evidenceCommit !== '342600641c8a621019d0c05d75a481843640e9ed'
        || !Array.isArray(policy.pairs) || policy.pairs.length !== 7
        || !window.crypto?.subtle) throw new Error('Invalid classification policy');
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(stableJson(policy)));
    const actual = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
    if (actual !== allClassificationPolicySha) throw new Error('Unapproved classification policy');
    const operations = new Map();
    for (const pair of policy.pairs) {
      if (!classificationPairIds.includes(pair.pair) || !Array.isArray(pair.operations)
          || pair.operations.length !== pair.counts.cards
          || !sameItems(pair.reserveIds, pair.operations.filter(operation => operation.op === 'to-reserve').map(operation => operation.id))) {
        throw new Error('Invalid classification inventory');
      }
      for (const operation of pair.operations) {
        const key = pair.pair + '|' + operation.id;
        if (operations.has(key)) throw new Error('Duplicate classification operation');
        operations.set(key, operation);
      }
      // Theme hiding applies after the simultaneous card operations. In
      // particular, a move into a subsequently hidden theme stays in reserve.
      for (const theme of pair.hiddenThemes) for (const id of theme.additionalReserveIds) {
        const key = pair.pair + '|' + id, previous = operations.get(key);
        operations.set(key, { id, op: 'hide-theme-to-reserve', fromLevel: theme.level,
          fromTheme: theme.id, toLevel: theme.level, toTheme: null,
          ...(previous ? { supersededOperation: previous.op, contentType: previous.contentType } : {}) });
      }
    }
    if (policy.pairs.reduce((total, pair) => total + pair.operations.length, 0) !== 2906
        || Object.keys(policy.runtimeSha256ByPath || {}).length !== 77) throw new Error('Incomplete classification policy');
    state.allClassification = policy;
    state.classificationOps = operations;
  }

  async function readRuntimeJson(response, dataPath) {
    const raw = await response.text();
    const expected = state.allClassification?.runtimeSha256ByPath?.['melunga_deploy/' + dataPath];
    if (expected) {
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
      const actual = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
      if (actual !== expected) throw new Error('Classified content differs from its reviewed edition');
    } else if (state.allClassification && dataPath.startsWith('content/niveaux-progressifs/')) {
      throw new Error('Missing classified artifact');
    }
    return JSON.parse(raw);
  }

  function classificationFor(pair) {
    const edition = pair.classificationEdition, policy = classificationPolicy(pair.id);
    if (!policy) {
      if (edition !== undefined) throw new Error('Missing classification policy');
      return null;
    }
    if (!edition || edition.pair !== pair.id || edition.registrySha256 !== policy.registrySha256) {
      throw new Error('Wrong classification edition');
    }
    return policy;
  }

  function classificationAnnotation(phrase, operation, policy) {
    if (!operation || operation.op === 'keep') return phrase.classification === undefined;
    const expected = { registrySha256: policy.registrySha256, operation: operation.op,
      fromLevel: operation.fromLevel, fromTheme: operation.fromTheme,
      toLevel: operation.toLevel, toTheme: isReservedOperation(operation) ? null : operation.toTheme,
      ...(operation.supersededOperation ? { supersededOperation: operation.supersededOperation } : {}) };
    return stableJson(phrase.classification) === stableJson(expected);
  }

  function validateClassifiedLocations(pair, policy) {
    if (!policy) return;
    const found = new Map();
    for (const theme of pair.themes) for (const phrase of theme.phrases) found.set(phrase.id, { phrase, themeId: theme.id, reserve: false });
    for (const phrase of pair.reserve || []) found.set(phrase.id, { phrase, themeId: null, reserve: true });
    const affectedIds = new Set([...policy.operations.map(operation => operation.id), ...policy.hiddenThemeReserveIds]);
    for (const id of affectedIds) {
      const operation = effectiveOperation(pair.id, id);
      const level = operation.op === 'keep' ? operation.fromLevel : operation.toLevel;
      const target = found.get(id);
      if (level !== pair.level) { if (target) throw new Error('Classification duplicated across levels'); continue; }
      const reserved = isReservedOperation(operation);
      const themeId = reserved ? null : operation.op === 'keep' ? operation.fromTheme : operation.toTheme;
      if (!target || target.reserve !== Boolean(reserved) || target.themeId !== themeId
          || operation.contentType && target.phrase.contentType !== operation.contentType
          || target.phrase.editorialLevel !== level
          || !classificationAnnotation(target.phrase, operation, policy)) throw new Error('Wrong classified placement');
      if (operation.op !== 'keep' && (target.phrase.placement?.themeId !== themeId
          || reserved && (target.phrase.placement?.domain !== 'reserve' || target.phrase.placement?.section !== 'reserve'))) {
        throw new Error('Wrong classified source placement');
      }
    }
    for (const { phrase } of found.values()) if (phrase.classification !== undefined
        && !affectedIds.has(phrase.id)) throw new Error('Undeclared classification');
  }

  function classifiedTheme(policy, group, pair, theme) {
    return policy && (policy[group] || []).find(item => item.id === theme.id && item.level === pair.level);
  }

  function approvedLexicalClass(policy, pair, theme, phrase, expected) {
    return policy && (policy.lexicalClassExceptions || []).some(item => item.id === phrase.id
      && (item.themeId || item.theme) === theme.id && item.level === pair.level
      && item.expected === expected && (item.actual ?? null) === (phrase.lexicalClass ?? null));
  }

  function validateRepertoire(bank, pairId) {
    if (!bank || bank.version !== 1 || bank.pairId !== pairId || !Array.isArray(bank.phrases)) throw new Error('Invalid repertoire');
    const classification = classificationFor({ id: pairId, classificationEdition: bank.classificationEdition });
    const validateLocation = (phrase, heardOnly = false) => {
      const location = phrase.canonicalLocation, reserve = phrase.canonicalReserveLocation;
      const operation = classification && effectiveOperation(pairId, phrase.id);
      if (reserve !== undefined) {
        if (!classification || !isReservedOperation(operation) || location !== undefined
            || reserve.pairId !== pairId || reserve.level !== operation.toLevel || reserve.themeId !== null
            || !heardOnly && (!classification.bankReservedReferenceIds.includes(phrase.id)
              || phrase.editorialLevel !== reserve.level || !classificationAnnotation(phrase, operation, classification))) {
          throw new Error('Invalid reserve alias');
        }
      } else if (location) {
        if (location.pairId !== pairId || !location.themeId
            || !Number.isInteger(location.level) || location.level < 1 || location.level > 10
            || !heardOnly && phrase.editorialLevel !== location.level
            || operation && (isReservedOperation(operation)
              || operation.op === 'move' && (location.level !== operation.toLevel || location.themeId !== operation.toTheme))) {
          throw new Error('Stale classified repertoire');
        }
        if (!heardOnly && !classificationAnnotation(phrase, operation, classification)) throw new Error('Invalid repertoire annotation');
      } else if (!heardOnly) throw new Error('Missing canonical location');
    };
    const ids = new Set();
    for (const phrase of bank.phrases) {
      if (!phrase.id || ids.has(phrase.id) || phrase.referenceOnly !== true || phrase.isTemplate
          || !['utterance', 'vocabulary', 'number'].includes(phrase.contentType)
          || ['study', 'native', 'phon'].some(field => typeof phrase[field] !== 'string' || !phrase[field].trim())) throw new Error('Invalid repertoire phrase');
      validateLocation(phrase);
      ids.add(phrase.id);
    }
    const receivedIds = new Set();
    if (bank.receivedModels !== undefined && !Array.isArray(bank.receivedModels)) throw new Error('Invalid received models');
    for (const phrase of bank.receivedModels || []) {
      if (!phrase.id || receivedIds.has(phrase.id) || phrase.heardOnly !== true || phrase.referenceOnly !== true
          || phrase.contentType !== 'utterance' || phrase.isTemplate
          || !Number.isInteger(phrase.firstHeardLevel) || phrase.firstHeardLevel < 1 || phrase.firstHeardLevel > 10
          || ['study', 'native', 'phon'].some(field => typeof phrase[field] !== 'string' || !phrase[field].trim())
          || phrase.role !== undefined || phrase.speaker !== undefined) throw new Error('Invalid received model');
      const canonical = bank.phrases.find(item => item.id === phrase.id);
      if (canonical && ['study', 'native', 'phon', 'reading', 'contentType'].some(field => canonical[field] !== phrase[field])) throw new Error('Conflicting received model');
      validateLocation(phrase, true);
      receivedIds.add(phrase.id);
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
      const classification = classificationFor(pair);
      validateClassifiedLocations(pair, classification);
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
        if (reserve.some(phrase => !['incomplete', 'review'].includes(phrase.contentType)
            && !(classification && isReservedOperation(effectiveOperation(pair.id, phrase.id))
              && classificationAnnotation(phrase, effectiveOperation(pair.id, phrase.id), classification)))) throw new Error('Invalid reserve');
      }
      pair.themes.forEach(theme => {
        if (!theme.id || !theme.title || !Array.isArray(theme.phrases) || !Array.isArray(theme.sequences) || !theme.sequences.length) throw new Error('Invalid theme');
        const mixed = classifiedTheme(classification, 'mixedThemes', pair, theme);
        const types = new Set(mixed ? mixed.contentTypes : [theme.contentType]);
        if (mixed && (theme.contentType !== 'mixed' || !sameItems(theme.contentTypes, mixed.contentTypes)
            || !sameItems(theme.phrases.map(phrase => phrase.id), mixed.phraseIds))) throw new Error('Invalid classified mixed theme');
        if (pair.counts && (!(mixed ? theme.contentType === 'mixed' && types.size > 1
              : ['utterance', 'vocabulary', 'number'].includes(theme.contentType))
            || (mixed ? !['situations', 'vocabulary'].includes(theme.section)
              : theme.section !== (theme.contentType === 'utterance' ? 'situations' : 'vocabulary'))
            || theme.phrases.some(phrase => !types.has(phrase.contentType) || phrase.isTemplate))) throw new Error('Mixed content theme');
        const extension = classifiedTheme(classification, 'situationExtensions', pair, theme);
        const extraIds = extension?.addedIds || [];
        if (!sameItems(theme.classificationExtensionIds || [], extraIds)) throw new Error('Unapproved situation extension');
        const extra = new Set(extraIds);
        const primaryAliases = (classification?.contextPrimaryAliases || []).filter(alias => alias.themeId === theme.id);
        const aliasIds = new Set(primaryAliases.map(alias => alias.id));
        const retainedCore = (classification?.outboundCoreContextReuses || []).filter(item => item.themeId === theme.id);
        const retainedCoreIds = new Set(retainedCore.map(item => item.id));
        if (primaryAliases.some(alias => !theme.phrases.some(phrase => phrase.id === alias.id && phrase.contentType === 'utterance')
            || !(theme.contextReferences || []).some(reference => reference.id === alias.id && reference.intentId === alias.intentId))
            || retainedCore.some(({themeId, ...reference}) => !(theme.contextReferences || []).some(item => stableJson(item) === stableJson(reference)))) {
          throw new Error('Invalid retained situation core');
        }
        const typedExtras = (classification?.typedSituationExtensions || []).filter(item => item.themeId === theme.id);
        if (!sameItems(theme.classificationTypedExtensionIds || [], typedExtras.map(item => item.id))
            || typedExtras.some(item => !extra.has(item.id)
              || theme.phrases.find(phrase => phrase.id === item.id)?.contentType !== item.contentType)) throw new Error('Invalid typed situation extension');
        const small = classifiedTheme(classification, 'smallThemeExceptions', pair, theme);
        const minimum = small ? small.minimum : 6;
        if (small && (!Number.isInteger(minimum) || minimum < 1 || minimum > 5
            || small.presentedCount !== theme.presentedCount
            || small.pedagogicalConceptCount !== undefined && small.pedagogicalConceptCount !== theme.pedagogicalConceptCount)) {
          throw new Error('Invalid reviewed small theme');
        }
        if (theme.photo && (!/^assets\/(?:theme-scenes(?:-L(?:[2-9]|10))?|vocabulary-scenes-L(?:1|3|5|7|9)-L(?:2|4|6|8|10)|pos-scenes-L1-L4|pos-scenes-L5-L8|pos-scenes-L9-L10|color-scenes|nature-scenes|leisure-scenes|situation-scenes|situation-pistes-[12])\.webp$/.test(theme.photo.asset)
            || ![3, 4].includes(theme.photo.columns) || theme.photo.rows !== 4
            || !Number.isInteger(theme.photo.column) || theme.photo.column < 0 || theme.photo.column >= theme.photo.columns
            || !Number.isInteger(theme.photo.row) || theme.photo.row < 0 || theme.photo.row >= theme.photo.rows)) throw new Error('Invalid theme photo');
        const ids = new Set();
        const lexicalClass = { 'vocab-adjectifs': 'adjective', 'vocab-couleurs': 'color', 'vocab-adverbes': 'adverb' }[theme.domain];
        theme.phrases.forEach(phrase => {
          if (!phrase.id || ids.has(phrase.id) || typeof phrase.study !== 'string' || typeof phrase.native !== 'string' || typeof phrase.phon !== 'string') throw new Error('Invalid phrase');
          if (lexicalClass && phrase.lexicalClass !== lexicalClass
              && !approvedLexicalClass(classification, pair, theme, phrase, lexicalClass)) throw new Error('Invalid lexical class');
          ids.add(phrase.id);
        });
        const reviewIds = new Set();
        for (const reference of theme.reviewReferences || []) {
          const phrase = references.get(reference.id);
          if (!phrase || ids.has(reference.id) || reviewIds.has(reference.id)
              || !types.has(phrase.contentType)
              || phrase.placement?.domain !== theme.domain
              || lexicalClass && phrase.lexicalClass !== lexicalClass
                && !approvedLexicalClass(classification, pair, theme, phrase, lexicalClass)
              || reference.firstEditorialLevel !== phrase.canonicalLocation.level
              || reference.firstEditorialLevel >= pair.level
              || reference.canonicalThemeId !== phrase.canonicalLocation.themeId
              || !reference.reason) throw new Error('Invalid review reference');
          reviewIds.add(reference.id);
        }
        const contextIds = new Set();
        if (theme.isAdditionalSituation !== undefined && typeof theme.isAdditionalSituation !== 'boolean') throw new Error('Invalid situation marker');
        if (theme.isAdditionalSituation && (!(theme.contentType === 'utterance' || mixed)
            || theme.section !== 'situations' || !Array.isArray(theme.intentIds)
            || theme.intentIds.some(id => typeof id !== 'string' || !id.trim())
            || theme.intentIds.length !== 8 || new Set(theme.intentIds).size !== 8)) throw new Error('Invalid additional situation');
        for (const reference of theme.contextReferences || []) {
          const phrase = references.get(reference.id);
          if (!theme.isAdditionalSituation || !phrase || phrase.contentType !== 'utterance'
              || ids.has(reference.id) && !primaryAliases.some(alias => alias.id === reference.id && alias.intentId === reference.intentId)
              || reviewIds.has(reference.id) || contextIds.has(reference.id)
              || reference.firstEditorialLevel !== phrase.canonicalLocation.level
              || reference.firstEditorialLevel > pair.level
              || reference.canonicalThemeId !== phrase.canonicalLocation.themeId
              || !theme.intentIds.includes(reference.intentId) || !reference.reason) throw new Error('Invalid context reference');
          contextIds.add(reference.id);
        }
        const presentedIds = new Set([...ids, ...reviewIds, ...contextIds]);
        if (theme.isAdditionalSituation && presentedIds.size !== 8 + extra.size) throw new Error('Incomplete additional situation');
        if (theme.isAdditionalSituation) {
          const coveredIntents = [
            ...theme.phrases.filter(phrase => !extra.has(phrase.id) && !aliasIds.has(phrase.id)).map(phrase => phrase.situationIntentId || phrase.intentId),
            ...(theme.contextReferences || []).map(reference => reference.intentId)
          ];
          if (coveredIntents.length !== 8 || new Set(coveredIntents).size !== 8
              || coveredIntents.some(id => !theme.intentIds.includes(id))) throw new Error('Invalid situation intent coverage');
        }
        if (pair.counts && Number.isInteger(theme.presentedCount)
            && (theme.newCount !== ids.size || theme.reviewCount !== reviewIds.size
                || (theme.reuseCount || 0) !== [...contextIds].filter(id => !ids.has(id)).length
                || theme.presentedCount !== presentedIds.size || theme.presentedCount < minimum
                || !Number.isInteger(theme.pedagogicalConceptCount)
                || theme.pedagogicalConceptCount < minimum)) throw new Error('Invalid theme repertoire counts');
        const intentByPhrase = new Map([
          ...theme.phrases.filter(phrase => !extra.has(phrase.id)).map(phrase => [phrase.id, phrase.situationIntentId || phrase.intentId]),
          ...(theme.contextReferences || []).map(reference => [reference.id, reference.intentId])
        ]);
        const phraseByIntent = new Map([...intentByPhrase].map(([id, intent]) => [intent, id]));
        const receivedUses = new Map();
        for (const turn of theme.receivedTurns || []) {
          const model = references.get(turn.utterance);
          const before = typeof turn.beforeIntentId === 'string';
          const after = typeof turn.afterIntentId === 'string';
          const target = turn.beforeIntentId || turn.afterIntentId;
          if (!theme.isAdditionalSituation || !turn.id || receivedUses.has(turn.id)
              || !model || model.contentType !== 'utterance' || model.heardOnly !== true
              || model.firstHeardLevel > pair.level || before === after
              || turn.level !== pair.level || turn.analyse !== false
              || !turn.role || ['fr', 'zh'].some(language => typeof turn.role[language] !== 'string' || !turn.role[language].trim())
              || !theme.intentIds.includes(target) || turn.targetIntentId !== target
              || turn.prepares !== phraseByIntent.get(target)
              || !Array.isArray(turn.answerWith) || !Array.isArray(turn.answerWithUtteranceIds)
              || new Set(turn.answerWith).size !== turn.answerWith.length
              || turn.answerWith.length !== turn.answerWithUtteranceIds.length
              || turn.answerWith.some((intent, index) => !theme.intentIds.includes(intent) || phraseByIntent.get(intent) !== turn.answerWithUtteranceIds[index])
              || (after ? turn.answerWith.length !== 0 : !turn.answerWith.length || !turn.answerWith.includes(target))) throw new Error('Invalid received turn');
          receivedUses.set(turn.id, turn);
        }
        const supportIds = new Set();
        for (const support of theme.lexicalSupports || []) {
          const id = support.utterance || support.id;
          const model = activeById.get(id);
          if (!theme.isAdditionalSituation || !model || !['vocabulary', 'number'].includes(model.contentType)
              || supportIds.has(id) || !theme.intentIds.includes(support.introducedBeforeIntentId)
              || model.editorialLevel > pair.level || support.firstEditorialLevel !== model.editorialLevel
              || support.canonicalThemeId !== references.get(id)?.canonicalLocation?.themeId
              || !support.supportId || !support.reason || support.analyse !== false
              || support.countsTowardProductionProgression !== false
              || support.insertedIntoPhraseSteps !== false) throw new Error('Invalid lexical support');
          supportIds.add(id);
        }
        const heardUses = new Set();
        const prepared = new Map();
        const recalled = new Set();
        const included = [];
        theme.sequences.forEach(sequence => {
          if (!Array.isArray(sequence.phraseIds) || !sequence.phraseIds.length || sequence.phraseIds.length > 5 || !Array.isArray(sequence.steps) || !sequence.steps.length) throw new Error('Invalid sequence');
          sequence.phraseIds.forEach(id => { if (!presentedIds.has(id)) throw new Error('Unknown phrase'); included.push(id); });
          const preparationIds = sequence.preparationIds || [];
          if (!Array.isArray(preparationIds) || preparationIds.some(id => !canonical.has(id))) throw new Error('Unknown preparation');
          const receivedModelIds = new Set([...receivedUses.values()].map(turn => turn.utterance));
          if (sequence.receivedIds !== undefined && (!Array.isArray(sequence.receivedIds)
              || new Set(sequence.receivedIds).size !== sequence.receivedIds.length
              || sequence.receivedIds.some(id => !receivedModelIds.has(id)))) throw new Error('Invalid sequence received list');
          const sequenceHeard = [];
          sequence.steps.forEach((step, stepIndex) => {
            if (step.kind === 'receive') {
              const turn = receivedUses.get(step.receivedId);
              if (!turn || heardUses.has(turn.id) || !(sequence.receivedIds || []).includes(turn.utterance)
                  || step.utterance !== turn.utterance || step.prepares !== turn.prepares
                  || step.targetIntentId !== turn.targetIntentId || step.analyse !== false
                  || step.countsForProgress !== false || step.requiresProduction !== false
                  || step.isPreparation || step.isReview || step.isContextReuse
                  || JSON.stringify(step.role) !== JSON.stringify(turn.role)
                  || JSON.stringify(step.answerWith) !== JSON.stringify(turn.answerWith)
                  || JSON.stringify(step.answerWithUtteranceIds) !== JSON.stringify(turn.answerWithUtteranceIds)
                  || !sequence.phraseIds.includes(turn.prepares)
                  || turn.answerWithUtteranceIds.some(id => !prepared.get(id)?.has('understand') || !prepared.get(id)?.has('imitate')
                    || step.preparedAnswerSteps?.[id]?.understoodInStep !== prepared.get(id)?.get('understand')
                    || step.preparedAnswerSteps?.[id]?.imitatedInStep !== prepared.get(id)?.get('imitate'))
                  || Object.keys(step.preparedAnswerSteps || {}).length !== turn.answerWithUtteranceIds.length) throw new Error('Invalid received step');
              if (turn.beforeIntentId) {
                const next = sequence.steps[stepIndex + 1];
                if (!next || next.utterance !== turn.prepares || !isRecall(next)) throw new Error('Received question without prepared reply');
              } else if (!recalled.has(turn.prepares)
                  || sequence.steps[stepIndex - 1]?.utterance !== turn.prepares
                  || !isRecall(sequence.steps[stepIndex - 1])) throw new Error('Received closure without completed reply');
              heardUses.add(turn.id);
              sequenceHeard.push(turn.utterance);
              return;
            }
            const references = [step.utterance, ...(step.choices || [])].filter(Boolean);
            if (!references.length || references.some(id => !(step.isPreparation ? preparationIds : sequence.phraseIds).includes(id))) throw new Error('Unknown step phrase');
            if (step.isPreparation && (!['understand', 'imitate'].includes(step.kind) || !sequence.phraseIds.includes(step.prepares))) throw new Error('Invalid preparation step');
            if (reviewIds.has(step.utterance) && step.isReview !== true) throw new Error('Unmarked review');
            if (!step.isPreparation && step.isReview && !reviewIds.has(step.utterance)) throw new Error('False review');
            if (contextIds.has(step.utterance) && (step.isContextReuse !== !retainedCoreIds.has(step.utterance) || step.isReview)) throw new Error('Unmarked context reuse');
            if (!step.isPreparation && step.isContextReuse && !contextIds.has(step.utterance)) throw new Error('False context reuse');
            if ((theme.contentType === 'utterance' || theme.isAdditionalSituation && references.some(id => !extra.has(id)))
                && references.some(id => activeById.get(id)?.contentType !== 'utterance')) throw new Error('Lexical step in a situation');
            if (['understand', 'imitate'].includes(step.kind)) for (const id of references) {
              if (!prepared.has(id)) prepared.set(id, new Map());
              prepared.get(id).set(step.kind, step.id);
            }
            if (isRecall(step)) for (const id of references) recalled.add(id);
          });
          if (new Set(sequenceHeard).size !== (sequence.receivedIds || []).length) throw new Error('Missing received use');
        });
        if (heardUses.size !== receivedUses.size) throw new Error('Missing interlocutor turn');
        if (included.length !== presentedIds.size || new Set(included).size !== presentedIds.size) throw new Error('Incomplete theme');
        if (theme.isAdditionalSituation) {
          if (included.filter(id => !extra.has(id)).some((id, index) => intentByPhrase.get(id) !== theme.intentIds[index])) throw new Error('Invalid situation order');
        }
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
      if (ui.level) {
        if (!courseAccess) throw new Error('Course access unavailable');
        await courseAccess.initialize();
        if (courseAccess.state().mode === 'production') document.querySelector('.mg-previewnotice')?.remove();
      }
      const response = await fetch(ui.level ? 'content/niveaux-progressifs/manifest.json' : 'content/maquette-guidee.json', { credentials: 'omit', cache: 'no-cache' });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const data = await response.json();
      if (ui.level) await loadClassificationPolicy(data);
      state.data = (ui.level ? validateManifest : validateData)(data);
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
  ui.languageTrigger.addEventListener('click', openLanguages);
  ui.languageClose.addEventListener('click', closeLanguages);
  ui.languageDialog.addEventListener('close', () => ui.languageTrigger.setAttribute('aria-expanded', 'false'));
  ui.languageDialog.addEventListener('click', event => {
    if (event.target !== ui.languageDialog) return;
    const rect = ui.languageDialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeLanguages();
  });
  ui.level?.addEventListener('change', () => choosePair(ui.language.value, ui.level.value));
  ui.levelTrigger?.addEventListener('click', openLevels);
  ui.levelClose?.addEventListener('click', closeLevels);
  ui.levelDialog?.addEventListener('close', () => ui.levelTrigger.setAttribute('aria-expanded', 'false'));
  ui.levelDialog?.addEventListener('click', event => {
    if (event.target !== ui.levelDialog) return;
    const rect = ui.levelDialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeLevels();
  });
  [ui.levelChoices, ui.languageChoices].filter(Boolean).forEach(choices => choices.addEventListener('keydown', event => {
    const buttons = [...choices.querySelectorAll('button')];
    const index = buttons.indexOf(event.target);
    if (index < 0) return;
    const columns = getComputedStyle(choices).gridTemplateColumns.split(' ').length;
    const moves = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -columns, ArrowDown: columns };
    const target = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1
      : Object.hasOwn(moves, event.key) ? Math.max(0, Math.min(buttons.length - 1, index + moves[event.key])) : -1;
    if (target < 0) return;
    event.preventDefault(); buttons[target].focus();
  }));
  ui.menuTrigger.addEventListener('click', () => openMenu());
  ui.menuClose.addEventListener('click', closeMenu);
  ui.menuBack.addEventListener('click', () => setMenuView('nav'));
  ui.accountBack.addEventListener('click', closeMenu);
  ui.accountLogout.addEventListener('click', logoutAccount);
  ui.menu.addEventListener('close', () => ui.menuTrigger.setAttribute('aria-expanded', 'false'));
  ui.menu.addEventListener('click', event => {
    if (event.target !== ui.menu) return;
    const rect = ui.menu.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeMenu();
  });
  window.addEventListener('resize', positionPopups);
  window.visualViewport?.addEventListener('resize', positionPopups);
  window.visualViewport?.addEventListener('scroll', positionPopups);
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
  ui.palette.addEventListener('click', changeAmbience);
  ui.help.addEventListener('click', () => {
    state.helpOpen = !state.helpOpen;
    ui.helpPanel.hidden = !state.helpOpen;
    ui.help.setAttribute('aria-expanded', String(state.helpOpen));
  });
  ui.readingToggle.addEventListener('click', () => {
    if (ui.readingToggle.disabled || state.screen !== 'lesson') return;
    state.readingVisible = !state.readingVisible;
    state.readingPreferences[state.pair.id] = state.readingVisible;
    try { localStorage.setItem(readingStorageKey, JSON.stringify({ version: 1, pairs: state.readingPreferences })); } catch (_) { /* Keep the in-page preference when storage is unavailable. */ }
    renderStep();
  });
  ui.ear.addEventListener('click', () => speak(true));
  ui.listen?.addEventListener('click', () => speak(true));
  ui.replay.addEventListener('click', () => state.screen === 'done'
    ? startSequence(state.sequence, state.lessonScope) : markForReview());
  ui.next.addEventListener('click', () => {
    if (state.screen === 'done') {
      if (state.lessonScope === 'saved-review') { openMenu(); setMenuView('saved'); return; }
      if (state.lessonScope !== 'sequence') return showThemes();
      const nextSequence = state.theme.sequences[state.theme.sequences.indexOf(state.sequence) + 1];
      if (nextSequence) startSequence(nextSequence);
      else showSequences();
      return;
    }
    advanceStep();
  });
  // Match the live mobile card: up/down browse, left defers, right acknowledges.
  // The card follows the finger in all four directions. Controls, selection,
  // and multi-touch never rate or navigate a card.
  ui.lessonView.addEventListener('touchstart', event => {
    resetCardMotion();
    cardMotion.suppressClickUntil = 0;
    if (state.screen !== 'lesson' || ui.next.disabled || ui.menu.open || ui.levelDialog?.open || ui.languageDialog.open || event.touches.length !== 1
        || event.target.closest('button,a,input,textarea,select,[contenteditable]')
        || window.getSelection()?.toString().trim()) return;
    const touch = event.touches[0];
    cardMotion.gesture = { x: touch.clientX, y: touch.clientY, pairId: state.pair.id,
      sequence: state.sequence, index: state.stepIndex };
  }, { passive: true });
  ui.lessonView.addEventListener('touchmove', event => {
    const gesture = cardMotion.gesture;
    if (!gesture) return;
    if (event.touches.length !== 1 || ui.menu.open || ui.levelDialog?.open || ui.languageDialog.open || state.screen !== 'lesson'
        || gesture.pairId !== state.pair.id || gesture.sequence !== state.sequence || gesture.index !== state.stepIndex
        || window.getSelection()?.toString().trim()) { resetCardMotion(); return; }
    const touch = event.touches[0];
    const dx = touch.clientX - gesture.x, dy = touch.clientY - gesture.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 8) return;
    ui.lessonView.classList.add('mg-gesture-dragging');
    ui.lessonView.style.setProperty('--mg-drag-x', dx + 'px');
    ui.lessonView.style.setProperty('--mg-drag-y', dy + 'px');
  }, { passive: true });
  ui.lessonView.addEventListener('touchcancel', resetCardMotion, { passive: true });
  ui.lessonView.addEventListener('touchend', event => {
    const gesture = cardMotion.gesture;
    resetCardMotion();
    const touch = event.changedTouches[0];
    if (!gesture || !touch || event.touches.length || state.screen !== 'lesson' || ui.menu.open || ui.levelDialog?.open || ui.languageDialog.open
        || gesture.pairId !== state.pair.id || gesture.sequence !== state.sequence || gesture.index !== state.stepIndex
        || window.getSelection()?.toString().trim()) return;
    const dx = touch.clientX - gesture.x, dy = touch.clientY - gesture.y;
    if (Math.abs(dx) > 15 || Math.abs(dy) > 15) cardMotion.suppressClickUntil = Date.now() + 600;
    const before = state.stepIndex;
    if (Math.abs(dy) >= 70 && Math.abs(dy) > Math.abs(dx) * 1.2) {
      browsePhrase(dy < 0 ? 1 : -1);
      if (before !== state.stepIndex || state.screen === 'done') animateCard(dy < 0 ? 'up' : 'down');
    } else if (Math.abs(dx) >= 80 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      const changed = dx < 0 ? markForReview() : markKnown();
      if (changed) animateCard(dx < 0 ? 'left' : 'right');
    }
  }, { passive: true });
  ui.lessonView.addEventListener('click', event => {
    if (event.detail === 0 || Date.now() > cardMotion.suppressClickUntil) return;
    event.preventDefault(); event.stopImmediatePropagation();
  }, true);
  ui.retry.addEventListener('click', () => ui.level && state.data
    ? choosePair(state.requestedPair || ui.language.value, state.level) : loadData());
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeHelp(); });
  window.addEventListener('melunga:course-access', () => {
    if (ui.level && state.data && state.pair) {
      stopAudio();
      choosePair(state.pair.id, state.pair.level);
    }
  });
  window.addEventListener('storage', event => {
    if (event.key !== knownStorageKey && event.key !== null) return;
    state.knownCards = loadKnownCards();
    if (ui.level && state.screen === 'themes') renderLevelProgress();
  });
  window.addEventListener('pagehide', stopAudio);
  window.addEventListener('resize', queueLessonFit);
  window.visualViewport?.addEventListener('resize', () => { if (window.visualViewport.scale === 1) queueLessonFit(); });
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(queueLessonFit);
    for (const node of [ui.content, ui.footer, ui.lessonView]) observer.observe(node);
  }
  new MutationObserver(queueLessonFit).observe(document.body, { childList: true });
  document.fonts?.ready.then(queueLessonFit);

  // Read-only state supports preview checks without touching the real application.
  window.MelungaMockup = Object.freeze({ state: () => Object.freeze({
    screen: state.screen, pairId: state.pair && state.pair.id, level: state.pair && state.pair.level || 1,
    themeId: state.theme && state.theme.id,
    sequenceId: state.sequence && state.sequence.id, stepIndex: state.stepIndex, lessonScope: state.lessonScope,
    phraseId: currentPhrase() && currentPhrase().id, masked: isMasked(), helpOpen: state.helpOpen,
    readingVisible: state.readingVisible, access: courseAccess?.state() || null,
    levelProgress: ui.level && state.pair ? Object.freeze(levelProgress()) : null,
    template: isTemplate(currentPhrase()), totalPhrases: state.pair ? pairCount(state.pair) : 0
  }) });
  loadData();
})();
