/* Progressive lessons use complete, source-preserved phrases; navigation is not grading. */
(function () {
  'use strict';
  var pairs = ['fr-en', 'fr-es', 'fr-it', 'fr-zh', 'fr-ja', 'fr-ko', 'zh-fr'];
  var kinds = ['understand', 'imitate', 'receive', 'compare', 'choose-and-recall',
    'listen-whole-dialogue', 'reply-with-help', 'reply-without-model'];
  var running = false, generation = 0, request = null, bundle = null, saved = null;
  var loading = false, failed = false, levelNumber = 1, lesson = null, position = 0;
  var screen = 'plan', helped = false, selected = Object.create(null), nodes = null, libraryContext = false;
  var activePair = '', lessonIndex = Object.create(null), phraseIndex = Object.create(null);

  function el(id) { return document.getElementById(id); }
  function text(fr, zh) { return window.nat === 'zh' ? zh : fr; }
  function pair() { return String(window.nat || '') + '-' + String(window.lang || ''); }
  function available(nativeLanguage, studyLanguage) { return pairs.indexOf(nativeLanguage + '-' + studyLanguage) !== -1; }
  function setText(id, value) { var node = el(id); if (node) node.textContent = value; }
  function allowed(level) { return level === 1 || window.isPaid === true; }
  function lessonAllowed(item, level) { return allowed(level) || !!(item && item.sourceLevel === 1); }
  function paywall() { if (typeof window.showPaywall === 'function') window.showPaywall(); }
  function modalOpen() {
    var account = el('paywall');
    return !!document.querySelector('#lessonPicker[open],dialog[open]') ||
      !!(account && getComputedStyle(account).display !== 'none' && account.getClientRects().length);
  }
  function cancelAudio() {
    if (typeof window.cancelCurrentSpeech === 'function') window.cancelCurrentSpeech();
    try { if (window.curAudio) { window.curAudio.pause(); window.curAudio.src = ''; window.curAudio = null; } } catch (_error) {}
    try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (_error) {}
  }
  function cancelRecognition() {
    try {
      var recognition = window.rec;
      if (recognition) {
        recognition.onresult = null; recognition.onerror = null; recognition.onend = null;
        recognition.abort(); window.rec = null;
      }
    } catch (_error) {}
    var microphone = el('mic'); if (microphone) microphone.classList.remove('rec');
  }
  function cancelActivity() { cancelAudio(); cancelRecognition(); }
  function button(id, action) {
    var node = document.createElement('button'); node.type = 'button';
    if (id) node.id = id;
    node.addEventListener('click', function (event) {
      event.stopPropagation();
      if (running && !modalOpen()) action();
    });
    return node;
  }
  function ensureNodes() {
    if (nodes) return;
    var card = el('card');
    if (!card) throw new Error('curriculum-card-missing');
    var originalEar = card.querySelector('.earicon');
    var ear = button('curriculumEar', function () { listen(ear); });
    ear.className = 'earicon'; ear.textContent = '👂';
    var header = document.createElement('div'); header.id = 'curriculumHeader'; header.className = 'curriculum-ui';
    var breadcrumb = document.createElement('div'); breadcrumb.id = 'curriculumBreadcrumb';
    var plan = button('curriculumPlan', function () {
      if (screen === 'library') openLevel(1); else if (libraryContext) openLibrary(); else openLevel(levelNumber);
    });
    var library = button('curriculumLibrary', openLibrary);
    var exit = button('curriculumExit', exitLesson);
    var heading = document.createElement('h2'); heading.id = 'curriculumHeading'; heading.tabIndex = -1;
    var instruction = document.createElement('p'); instruction.id = 'curriculumInstruction';
    var context = document.createElement('p'); context.id = 'curriculumContext';
    var toolbar = document.createElement('div'); toolbar.id = 'curriculumToolbar';
    var selectLabel = document.createElement('label'); selectLabel.htmlFor = 'curriculumLevel';
    var select = document.createElement('select'); select.id = 'curriculumLevel';
    select.addEventListener('click', function (event) { event.stopPropagation(); });
    select.addEventListener('change', function (event) {
      event.stopPropagation();
      if (modalOpen()) { select.value = String(levelNumber); return; }
      openLevel(Number(select.value)); select.value = String(levelNumber);
    });
    toolbar.append(selectLabel, select, plan, library, exit);
    header.append(toolbar, breadcrumb, heading, instruction, context);
    card.insertBefore(header, card.firstChild);
    var lessons = document.createElement('div'); lessons.id = 'curriculumLessons'; lessons.className = 'curriculum-ui';
    lessons.setAttribute('role', 'list');
    card.insertBefore(lessons, el('fr'));
    var choices = document.createElement('div'); choices.id = 'curriculumChoices'; choices.className = 'curriculum-ui';
    choices.setAttribute('role', 'group');
    card.insertBefore(choices, el('fr'));
    var reading = document.createElement('div'); reading.id = 'curriculumReading'; reading.className = 'curriculum-ui';
    card.insertBefore(reading, el('cn'));
    var status = document.createElement('p'); status.id = 'curriculumStatus'; status.className = 'curriculum-ui';
    status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
    var actions = document.createElement('div'); actions.id = 'curriculumActions'; actions.className = 'curriculum-ui';
    var reveal = button('curriculumReveal', function () { cancelAudio(); helped = !helped; render(); });
    var retry = button('curriculumRetry', function () { load(levelNumber); });
    var replay = button('curriculumReplay', function () { if (lesson) openLesson(lesson.id); });
    actions.append(reveal, retry, replay); card.append(status, actions);
    nodes = {header:header, breadcrumb:breadcrumb, heading:heading, instruction:instruction, context:context,
      toolbar:toolbar, selectLabel:selectLabel, select:select, plan:plan, library:library, exit:exit, lessons:lessons,
      choices:choices, reading:reading, status:status, actions:actions, reveal:reveal, retry:retry,
      replay:replay, ear:ear, originalEar:originalEar};
  }
  function snapshot() {
    var elements = [], content = [], labels = [];
    ['card', 'nav', 'rateBar', 'listen', 'badge', 'fr', 'phon', 'cn', 'progBar'].forEach(function (id) {
      var node = el(id); if (node) elements.push({node:node, style:node.getAttribute('style')});
    });
    var phonrow = el('card').querySelector('.phonrow');
    if (phonrow) elements.push({node:phonrow, style:phonrow.getAttribute('style')});
    ['badge', 'fr', 'phon', 'cn', 'count', 'currentLevel', 'ballLv', 'peek', 'immchip', 'heard'].forEach(function (id) {
      var node = el(id); if (node) content.push({node:node, text:node.textContent});
    });
    ['rateAgainLabel', 'rateKnownLabel'].forEach(function (id) {
      var node = el(id); if (!node) return;
      var parent = node.closest('button'), icon = parent && parent.querySelector('[aria-hidden]');
      labels.push({node:node, text:node.textContent, button:parent, disabled:parent && parent.disabled,
        aria:parent && parent.getAttribute('aria-label'), icon:icon, iconText:icon && icon.textContent});
    });
    var listenButton = el('listen');
    return {elements:elements, content:content, labels:labels, pool:window.pool, idx:window.idx,
      selfTest:window.selfTest, revealed:window.revealed,
      listenAria:listenButton && listenButton.getAttribute('aria-label')};
  }
  function validString(value) { return typeof value === 'string' && value.length > 0; }
  function signature(item) {
    function sorted(value) {
      if (Array.isArray(value)) return value.map(sorted);
      if (value && typeof value === 'object') {
        var result = {};
        Object.keys(value).sort().forEach(function (key) { result[key] = sorted(value[key]); });
        return result;
      }
      return value;
    }
    var content = {};
    Object.keys(item).forEach(function (key) { if (key !== 'level') content[key] = item[key]; });
    return JSON.stringify(sorted(content));
  }
  function validate(data, expectedPair) {
    if (!data || data.version !== 1 || data.id !== expectedPair ||
        data.nativeLanguage + '-' + data.studyLanguage !== expectedPair ||
        !Array.isArray(data.levels) || data.levels.length !== 10) throw new Error('invalid-curriculum');
    var ids = Object.create(null), seenLevels = Object.create(null);
    function validateLesson(item, level, fromLibrary) {
      if (!item || !validString(item.id) || !validString(item.title) ||
          ['starter', 'unit', 'dialogue'].indexOf(item.kind) === -1 ||
          !Array.isArray(item.phrases) || !item.phrases.length || !Array.isArray(item.steps) || !item.steps.length) throw new Error('invalid-lesson');
      if (ids[item.id]) {
        if (!fromLibrary || ids[item.id].level !== level || signature(ids[item.id].item) !== signature(item)) throw new Error('duplicate-lesson');
      } else ids[item.id] = {item:item, level:level};
      var phrases = Object.create(null), steps = Object.create(null);
      item.phrases.forEach(function (phrase) {
        if (!phrase || !validString(phrase.id) || phrases[phrase.id] || !validString(phrase.study) ||
            typeof phrase.native !== 'string' || typeof phrase.phon !== 'string' ||
            ('reading' in phrase && typeof phrase.reading !== 'string')) throw new Error('invalid-phrase');
        phrases[phrase.id] = phrase;
      });
      item.steps.forEach(function (step) {
        if (!step || !validString(step.id) || steps[step.id] || kinds.indexOf(step.kind) === -1) throw new Error('invalid-step');
        steps[step.id] = true;
        if (step.kind === 'compare' || step.kind === 'choose-and-recall') {
          if (!Array.isArray(step.choices) || !step.choices.length || step.choices.some(function (id) { return !phrases[id]; })) throw new Error('invalid-choices');
        } else if (!phrases[step.utterance]) throw new Error('invalid-utterance');
      });
    }
    data.levels.forEach(function (level) {
      if (!level || !Number.isInteger(level.level) || level.level < 1 || level.level > 10 || seenLevels[level.level] ||
          !validString(level.title) || !Array.isArray(level.lessons) || !level.lessons.length) throw new Error('invalid-level');
      seenLevels[level.level] = true;
      level.lessons.forEach(function (item) { validateLesson(item, level.level, false); });
    });
    if ('freeLibrary' in data && !Array.isArray(data.freeLibrary)) throw new Error('invalid-library');
    var libraryIds = Object.create(null);
    (data.freeLibrary || []).forEach(function (item) {
      if (!item || item.sourceLevel !== 1 || !Number.isInteger(item.level) || item.level < 1 || item.level > 10 || libraryIds[item.id]) throw new Error('invalid-library-lesson');
      libraryIds[item.id] = true; validateLesson(item, item.level, true);
    });
    return data;
  }
  function indexData() {
    lessonIndex = Object.create(null); phraseIndex = Object.create(null);
    bundle.levels.forEach(function (level) {
      level.lessons.forEach(function (item) {
        lessonIndex[item.id] = {lesson:item, level:level.level};
        var phrases = Object.create(null);
        item.phrases.forEach(function (phrase) { phrases[phrase.id] = phrase; });
        phraseIndex[item.id] = phrases;
      });
    });
    (bundle.freeLibrary || []).forEach(function (item) {
      if (!lessonIndex[item.id]) {
        lessonIndex[item.id] = {lesson:item, level:item.level};
        var phrases = Object.create(null);
        item.phrases.forEach(function (phrase) { phrases[phrase.id] = phrase; });
        phraseIndex[item.id] = phrases;
      }
    });
  }
  function load(level) {
    if (!running) return Promise.resolve(false);
    var token = ++generation, expectedPair = pair();
    if (request) request.abort();
    request = typeof AbortController === 'function' ? new AbortController() : null;
    var controller = request, options = {credentials:'same-origin'};
    if (controller) options.signal = controller.signal;
    cancelActivity(); activePair = expectedPair; bundle = null; lesson = null;
    screen = 'plan'; libraryContext = false; loading = true; failed = false; selected = Object.create(null);
    window.pool = []; window.idx = 0; render();
    return fetch('content/curriculum/' + expectedPair + '.json', options).then(function (response) {
      if (!response.ok) throw new Error('curriculum-fetch-failed');
      return response.json();
    }).then(function (data) {
      if (!running || generation !== token) return false;
      if (pair() !== expectedPair) { stop(); return false; }
      bundle = validate(data, expectedPair); indexData(); loading = false; request = null;
      levelNumber = allowed(level) ? level : 1; render(); return true;
    }).catch(function () {
      if (!running || generation !== token) return false;
      if (pair() !== expectedPair) { stop(); return false; }
      bundle = null; loading = false; failed = true; request = null; render(); return false;
    });
  }
  function start(level) {
    level = Number(level || 1);
    if (!Number.isInteger(level) || level < 1 || level > 10 || !available(window.nat, window.lang)) return Promise.resolve(false);
    if (!allowed(level)) { paywall(); return Promise.resolve(false); }
    if (running) stop();
    ensureNodes(); saved = snapshot(); running = true; levelNumber = level; activePair = pair();
    if (nodes.originalEar && nodes.originalEar.parentNode) nodes.originalEar.replaceWith(nodes.ear);
    window.selfTest = false; window.revealed = false;
    document.body.classList.add('curriculum-active');
    return load(level);
  }
  function stop() {
    if (!running) return;
    running = false; generation++; cancelActivity();
    if (request) request.abort(); request = null;
    document.body.classList.remove('curriculum-active');
    var card = el('card');
    if (card) {
      card.classList.remove('curriculum-hidden', 'curriculum-plan', 'curriculum-finished', 'curriculum-empty');
      card.removeAttribute('data-curriculum-step');
    }
    if (nodes && nodes.ear.parentNode && nodes.originalEar) nodes.ear.replaceWith(nodes.originalEar);
    if (saved) {
      window.pool = saved.pool; window.idx = saved.idx; window.selfTest = saved.selfTest; window.revealed = saved.revealed;
      saved.elements.forEach(function (item) {
        if (item.style === null) item.node.removeAttribute('style'); else item.node.setAttribute('style', item.style);
      });
      saved.content.forEach(function (item) { item.node.textContent = item.text; });
      saved.labels.forEach(function (item) {
        item.node.textContent = item.text;
        if (item.button) {
          item.button.disabled = item.disabled;
          if (item.aria === null) item.button.removeAttribute('aria-label'); else item.button.setAttribute('aria-label', item.aria);
        }
        if (item.icon) item.icon.textContent = item.iconText;
      });
      var listenButton = el('listen');
      if (listenButton) {
        if (saved.listenAria === null) listenButton.removeAttribute('aria-label'); else listenButton.setAttribute('aria-label', saved.listenAria);
      }
    }
    saved = null; bundle = null; lesson = null; loading = false; failed = false; helped = false;
    selected = Object.create(null); lessonIndex = Object.create(null); phraseIndex = Object.create(null);
    screen = 'plan'; libraryContext = false; position = 0; activePair = '';
  }
  function exitLesson() { if (typeof window.setMode === 'function') window.setMode('all', null); else stop(); }
  function currentLevel() { return bundle && bundle.levels.filter(function (item) { return item.level === levelNumber; })[0]; }
  function navigationLessons() { return libraryContext ? (bundle.freeLibrary || []) : currentLevel().lessons; }
  function step() { return screen === 'lesson' && lesson ? lesson.steps[position] : null; }
  function phrase() {
    var current = step(); if (!current || !lesson) return null;
    return phraseIndex[lesson.id][current.utterance || selected[current.id]] || null;
  }
  function received(currentPhrase, currentStep) {
    return !!(currentPhrase && (currentPhrase.kind === 'received' || currentPhrase.speaker === 'B' ||
      (currentStep && (currentStep.kind === 'receive' || currentStep.speaker === 'B'))));
  }
  function hidden() {
    var current = step(), currentPhrase = phrase();
    return !!(current && currentPhrase && !received(currentPhrase, current) && !helped &&
      (current.kind === 'reply-without-model' || current.kind === 'choose-and-recall'));
  }
  function openLevel(level) {
    level = Number(level);
    if (!Number.isInteger(level) || level < 1 || level > 10) return false;
    if (!allowed(level)) { paywall(); return false; }
    if (!running) return start(level);
    if (activePair !== pair()) { stop(); return false; }
    if (modalOpen() || loading || failed || !bundle) return false;
    cancelActivity(); levelNumber = level; screen = 'plan'; libraryContext = false; lesson = null; position = 0; helped = false;
    window.pool = []; window.idx = 0; render(); return true;
  }
  function openLibrary() {
    if (!running || activePair !== pair() || loading || failed || modalOpen() || !bundle) return false;
    cancelActivity(); levelNumber = 1; screen = 'library'; libraryContext = true; lesson = null; position = 0; helped = false;
    window.pool = []; window.idx = 0; render(); return true;
  }
  function openLesson(id) {
    if (!running || activePair !== pair() || loading || failed || modalOpen()) return false;
    var entry = lessonIndex[id]; if (!entry) return false;
    if (!lessonAllowed(entry.lesson, entry.level)) { paywall(); return false; }
    var inLibrary = (bundle.freeLibrary || []).some(function (item) { return item.id === id; });
    libraryContext = (inLibrary && (screen === 'library' || libraryContext)) || (!allowed(entry.level) && entry.lesson.sourceLevel === 1);
    cancelActivity(); levelNumber = entry.level; lesson = entry.lesson; screen = 'lesson'; position = 0;
    helped = false; selected = Object.create(null);
    lesson.steps.forEach(function (item) {
      if (item.kind === 'compare') selected[item.id] = item.choices[0];
    });
    // Counters only: these display rows never enter the catalogue or a review queue.
    window.pool = lesson.steps.map(function (item) {
      var first = phraseIndex[lesson.id][item.utterance || (item.choices && item.choices[0])];
      return {lv:levelNumber, t:first ? first.study : '', _curriculum:true};
    });
    window.idx = 0; render(); return true;
  }
  function phase(current) {
    var labels = {
      understand:['Comprendre', '理解'], imitate:['Imiter', '跟读'], receive:['Comprendre l’autre', '听懂对方'],
      compare:['Faire varier une phrase', '变换句子'], 'choose-and-recall':['Choisir et dire', '选择并说出'],
      'listen-whole-dialogue':['Écouter l’échange', '听完整对话'],
      'reply-with-help':['Échanger avec le modèle', '参照范例对话'],
      'reply-without-model':['Échanger sans modèle', '尝试独立对话']
    };
    return current ? text(labels[current.kind][0], labels[current.kind][1]) : '';
  }
  function instruction(current, currentPhrase) {
    if (received(currentPhrase, current)) return text('Écoute et comprends l’autre personne. Tu n’as pas à répéter sa phrase.', '听懂对方的话，不需要跟读。');
    if (current.kind === 'understand') return text('Écoute la phrase entière et découvre son sens.', '听完整的句子，了解它的意思。');
    if (current.kind === 'imitate') return text('Écoute, puis répète la phrase entière à voix haute.', '听一遍，再大声跟读完整的句子。');
    if (current.kind === 'compare') return text('Choisis une intention et observe comment la phrase change.', '选择你想表达的意思，观察句子如何变化。');
    if (current.kind === 'choose-and-recall') return text('Choisis ce que tu veux dire, puis essaie de le dire. L’oreille permet de retrouver le modèle.', '选择想表达的意思，再试着说出来。点击耳朵可查看范例并听发音。');
    if (current.kind === 'listen-whole-dialogue') return text('Écoute cette réplique de l’échange.', '听对话中的这句话。');
    if (current.kind === 'reply-without-model') return text('Dis ta réplique. Tu peux retrouver le modèle à tout moment.', '试着说出你的回应，需要时可以查看范例。');
    return text('Dis ta réplique avec l’aide du modèle.', '参照范例说出你的回应。');
  }
  function lessonKind(item) {
    return item.kind === 'dialogue' ? text('Échanger', '对话') : item.kind === 'starter' ? text('Premiers pas', '起步') : text('Construire une phrase', '练习句式');
  }
  function renderLevelSelect() {
    nodes.selectLabel.textContent = text('Niveau', '等级'); nodes.select.replaceChildren();
    for (var i = 1; i <= 10; i++) {
      var option = document.createElement('option'); option.value = String(i);
      option.textContent = 'L' + i + (allowed(i) ? '' : ' · ' + text('accès complet', '完整访问'));
      nodes.select.appendChild(option);
    }
    nodes.select.value = String(levelNumber); nodes.select.disabled = loading || failed;
    nodes.plan.textContent = screen === 'library' ? text('Parcours L1', 'L1 课程') : libraryContext ? text('Bibliothèque gratuite', '免费句库') : text('Plan du niveau', '本级课程');
    nodes.plan.hidden = screen === 'plan';
    nodes.library.textContent = text('Bibliothèque gratuite', '免费句库');
    nodes.library.hidden = !(screen === 'plan' && levelNumber === 1 && bundle && bundle.freeLibrary && bundle.freeLibrary.length);
    nodes.exit.textContent = text('Quitter', '退出');
  }
  function renderPlan(level) {
    nodes.heading.textContent = level.title;
    nodes.breadcrumb.textContent = text('Aperçu du parcours guidé', '引导课程预览') + (screen === 'library' ? text(' · Gratuit', ' · 免费') : ' · L' + levelNumber);
    nodes.instruction.textContent = level.goal || text('Choisis une leçon et avance à ton rythme.', '选择一课，按自己的节奏练习。');
    nodes.context.textContent = text('Écouter, imiter, faire varier, puis échanger. Chaque leçon peut être rejouée.', '先听懂、跟读，再变换表达并对话。每课都可以再次练习。');
    nodes.lessons.hidden = false; nodes.lessons.replaceChildren();
    level.lessons.forEach(function (item, index) {
      var row = document.createElement('div'); row.className = 'curriculum-lesson-item'; row.setAttribute('role', 'listitem');
      var entry = button('', function () { openLesson(item.id); }); entry.className = 'curriculum-lesson';
      var number = document.createElement('span'); number.className = 'curriculum-lesson-number'; number.textContent = String(index + 1).padStart(2, '0'); number.setAttribute('aria-hidden', 'true');
      var copy = document.createElement('span'); copy.className = 'curriculum-lesson-copy';
      var title = document.createElement('strong'); title.textContent = item.title;
      var detail = document.createElement('span'); detail.textContent = item.goal || item.situation || lessonKind(item);
      var type = document.createElement('small'); type.textContent = lessonKind(item);
      copy.append(type, title, detail);
      var arrow = document.createElement('span'); arrow.className = 'curriculum-lesson-arrow'; arrow.textContent = '→'; arrow.setAttribute('aria-hidden', 'true');
      entry.append(number, copy, arrow); row.append(entry); nodes.lessons.append(row);
    });
    nodes.status.textContent = level.lessons.length + (screen === 'library' ? text(' leçons supplémentaires gratuites', '课额外的免费练习') : text(' leçons à explorer', '课可供练习'));
  }
  function renderChoices(current) {
    nodes.choices.replaceChildren(); nodes.choices.hidden = !current.choices;
    nodes.choices.setAttribute('aria-label', text('Choisis ce que tu veux dire', '选择想表达的意思'));
    if (!current.choices) return;
    current.choices.forEach(function (id) {
      var value = phraseIndex[lesson.id][id];
      var choice = button('', function () {
        cancelActivity(); selected[current.id] = id; helped = false; render();
      });
      choice.className = 'curriculum-choice'; choice.textContent = value.native;
      choice.setAttribute('aria-pressed', selected[current.id] === id ? 'true' : 'false');
      nodes.choices.append(choice);
    });
  }
  function updateButtons(mask) {
    var left = screen === 'plan' ? text('Retour aux cartes', '返回卡片') : screen === 'library' ? text('Parcours L1', 'L1 课程') : screen === 'complete' ? text('Rejouer', '重新练习') : text('Réécouter', '再听一遍');
    var right = screen === 'plan' || screen === 'library' ? text('Commencer', '开始') : screen === 'complete' ? text('Leçon suivante', '下一课') : text('Continuer', '继续');
    var list = bundle ? navigationLessons() : [], index = lesson ? list.indexOf(lesson) : -1;
    // A free-library copy can share an id with its level-plan counterpart.
    if (lesson && index < 0) index = list.findIndex(function (item) { return item.id === lesson.id; });
    if (screen === 'complete' && index === list.length - 1) right = libraryContext ? text('Bibliothèque gratuite', '免费句库') : text('Plan du niveau', '本级课程');
    [[el('rateAgainLabel'), left, '↶'], [el('rateKnownLabel'), right, '→']].forEach(function (item, index) {
      if (!item[0]) return;
      item[0].textContent = item[1]; var parent = item[0].closest('button');
      if (parent) {
        parent.setAttribute('aria-label', item[1]);
        parent.disabled = loading || failed || (screen === 'lesson' && (index === 0 ? mask || !phrase() : !phrase()));
        var icon = parent.querySelector('[aria-hidden]'); if (icon) icon.textContent = item[2];
      }
    });
  }
  function render() {
    if (!running) return;
    if (pair() !== activePair) { stop(); return; }
    if (!lessonAllowed(lesson, levelNumber)) {
      levelNumber = 1; lesson = null; screen = 'plan'; position = 0; helped = false;
      window.pool = []; window.idx = 0; cancelActivity();
    }
    var card = el('card'), current = step(), currentPhrase = phrase(), mask = hidden();
    var empty = loading || failed || screen !== 'lesson' || !currentPhrase;
    window.idx = position;
    card.classList.toggle('curriculum-hidden', mask);
    card.classList.toggle('curriculum-plan', screen === 'plan' || screen === 'library');
    card.classList.toggle('curriculum-finished', screen === 'complete');
    card.classList.toggle('curriculum-empty', empty);
    card.setAttribute('data-curriculum-step', current ? current.kind : (loading ? 'loading' : failed ? 'error' : screen));
    renderLevelSelect();
    nodes.lessons.hidden = true; nodes.choices.hidden = true; nodes.reading.hidden = true; nodes.reading.textContent = '';
    nodes.status.textContent = ''; nodes.context.textContent = '';
    nodes.retry.textContent = text('Réessayer', '重试'); nodes.retry.hidden = !failed;
    nodes.replay.textContent = text('Rejouer cette leçon', '重新练习本课'); nodes.replay.hidden = screen !== 'complete';
    nodes.reveal.textContent = helped ? text('Masquer le modèle', '隐藏范例') : text('Afficher le modèle', '查看范例');
    nodes.reveal.hidden = !(current && currentPhrase && !received(currentPhrase, current) &&
      (current.kind === 'choose-and-recall' || current.kind === 'reply-without-model'));
    ['badge', 'fr', 'phon', 'cn', 'peek', 'immchip', 'heard'].forEach(function (id) { setText(id, ''); });
    setText('ballLv', 'L' + levelNumber); setText('currentLevel', text('Niveau L', '等级 L') + levelNumber);
    setText('count', screen === 'lesson' && lesson ? (position + 1) + ' / ' + lesson.steps.length : 'L' + levelNumber);
    var progress = el('progBar');
    if (progress) progress.style.width = screen === 'complete' ? '100%' : screen === 'lesson' && lesson ? ((position + 1) / lesson.steps.length * 100) + '%' : '0%';
    var nav = el('nav'); if (nav) nav.style.display = screen === 'lesson' ? '' : 'none';
    var ratebar = el('rateBar'); if (ratebar) ratebar.style.display = 'flex';
    var listenButton = el('listen');
    if (listenButton) {
      listenButton.style.display = empty || mask ? 'none' : '';
      listenButton.setAttribute('aria-label', text('Écouter la phrase', '听这句话'));
    }
    nodes.ear.disabled = empty;
    nodes.ear.setAttribute('aria-label', mask ? text('Afficher le modèle et écouter la phrase', '查看范例并听这句话') : text('Écouter la phrase', '听这句话'));
    if (loading || failed) {
      nodes.breadcrumb.textContent = text('Aperçu du parcours guidé', '引导课程预览');
      nodes.heading.textContent = failed ? text('Réessayer le chargement', '重新加载') : text('Tes leçons arrivent…', '正在加载课程…');
      nodes.instruction.textContent = failed ? text('Les leçons n’ont pas pu se charger. Réessaie ou retourne aux cartes.', '课程加载失败。请重试或返回卡片。') : text('Préparation du plan de tes leçons.', '正在准备课程列表。');
    } else if (screen === 'plan') {
      renderPlan(currentLevel());
    } else if (screen === 'library') {
      renderPlan({title:text('Bibliothèque gratuite', '免费句库'),
        goal:text('Des leçons supplémentaires gratuites à explorer à ton rythme.', '按自己的节奏，探索更多免费的句式练习。'),
        lessons:bundle.freeLibrary || []});
    } else if (screen === 'complete') {
      nodes.breadcrumb.textContent = text('Aperçu', '预览') + ' · L' + levelNumber + ' · ' + lesson.title;
      nodes.heading.textContent = text('Leçon parcourue', '本课练习已结束');
      nodes.instruction.textContent = text('Tu peux rejouer cette leçon ou continuer à ton rythme.', '可以再次练习本课，也可以按自己的节奏继续。');
      nodes.context.textContent = lesson.freePrompt || '';
    } else if (current) {
      nodes.breadcrumb.textContent = text('Aperçu', '预览') + ' · L' + levelNumber + ' · ' + lesson.title;
      nodes.heading.textContent = phase(current);
      nodes.instruction.textContent = instruction(current, currentPhrase);
      nodes.context.textContent = currentPhrase ? (received(currentPhrase, current) ? text('L’autre personne · à comprendre', '对方的话 · 只需理解') : text('À toi de parler', '轮到你说')) : '';
      renderChoices(current);
      if (currentPhrase) {
        setText('cn', currentPhrase.native);
        if (!mask) {
          setText('fr', currentPhrase.study); setText('phon', currentPhrase.phon);
          nodes.reading.textContent = currentPhrase.reading || ''; nodes.reading.hidden = !currentPhrase.reading;
        }
      } else nodes.status.textContent = text('Choisis une intention pour essayer de la dire.', '请选择想表达的意思，再试着说出来。');
    }
    updateButtons(mask);
    if (typeof window.fitCard === 'function') window.fitCard();
    setText('peek', ''); setText('immchip', ''); card.scrollTop = 0;
  }
  function move(delta) {
    if (!running || loading || failed || modalOpen()) return;
    if (activePair !== pair()) { stop(); return; }
    if (!lessonAllowed(lesson, levelNumber)) { paywall(); return; }
    if (screen === 'plan' || screen === 'library') {
      var entries = navigationLessons(); if (delta > 0 && entries.length) openLesson(entries[0].id);
      return;
    }
    if (screen === 'complete') {
      if (delta < 0) { screen = 'lesson'; position = lesson.steps.length - 1; }
      else {
        var list = navigationLessons(), index = list.findIndex(function (item) { return item.id === lesson.id; });
        if (index + 1 < list.length) openLesson(list[index + 1].id); else if (libraryContext) openLibrary(); else openLevel(levelNumber);
        return;
      }
    } else {
      if (delta > 0 && !phrase()) return;
      if (delta < 0 && position === 0) { if (libraryContext) openLibrary(); else openLevel(levelNumber); return; }
      position += delta;
      if (position >= lesson.steps.length) { position = lesson.steps.length - 1; screen = 'complete'; }
    }
    cancelActivity(); helped = false; render();
  }
  function listen(btn) {
    if (!running || loading || failed || screen !== 'lesson' || modalOpen()) return;
    if (activePair !== pair()) { stop(); return; }
    if (!lessonAllowed(lesson, levelNumber)) { paywall(); return; }
    var value = phrase(); if (!value) return;
    if (hidden()) {
      // Explicit help is reversible. Tapping the background or large audio control cannot reveal recall.
      if (btn !== nodes.ear) return;
      helped = true; render();
    }
    if (typeof window.speak === 'function') window.speak(value.study, btn || el('listen'));
  }
  function rateCard(known) {
    if (!running || loading || failed || modalOpen()) return;
    if (known) { move(1); return; }
    if (screen === 'plan') exitLesson();
    else if (screen === 'library') openLevel(1);
    else if (screen === 'complete') openLesson(lesson.id);
    else listen();
  }
  function state() {
    var current = step(), value = phrase();
    return {active:running, screen:screen, pair:activePair, level:levelNumber, lessonId:lesson && lesson.id,
      phase:current && current.kind, stepIndex:position, total:lesson ? lesson.steps.length : 0,
      currentPhraseId:value && value.id, hidden:hidden(), helped:helped, complete:screen === 'complete',
      loading:loading, error:failed, freeLibrary:libraryContext};
  }
  window.MelungaCurriculum = Object.freeze({available:available, active:function () { return running; },
    start:start, stop:stop, render:render, next:function () { move(1); }, prev:function () { move(-1); },
    rateCard:rateCard, listen:listen, cardTap:function () {}, selfTest:function () {}, state:state,
    openLevel:openLevel, openLesson:openLesson, openLibrary:openLibrary});
})();
