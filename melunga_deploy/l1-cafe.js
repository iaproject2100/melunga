/* Seven L1 café bridges: source-exact preparation and dialogue, without grading. */
(function () {
  'use strict';
  var allowed = ['fr-en','fr-es','fr-it','fr-zh','fr-ja','fr-ko','zh-fr'];
  // Editorial release selection, independent of subscription rights. A missing
  // or malformed configuration offers no scene; local tests supply fixtures.
  function supported(nativeLanguage, studyLanguage) {
    return allowed.indexOf(nativeLanguage + '-' + studyLanguage) !== -1;
  }
  function releasedPairs() {
    var config = window.MelungaL1CafeRelease;
    if (!config || config.version !== 1 || !Array.isArray(config.pairs)) return [];
    var seen = Object.create(null);
    for (var i = 0; i < config.pairs.length; i++) {
      var pair = config.pairs[i];
      if (typeof pair !== 'string' || allowed.indexOf(pair) === -1 || seen[pair]) return [];
      seen[pair] = true;
    }
    return config.pairs.slice();
  }
  var released = releasedPairs();
  var sourceCommit = '30e7d40a8af3f51ee186bf83f983596b8ca8798f';
  var running = false, scene = null, sequence = [], position = 0, helped = false;
  var complete = false, loading = false, failed = false, generation = 0;
  var saved = null, bundlePromise = null, controller = null;
  var nodes = null;

  function currentPair() { return String(window.nat || '') + '-' + String(window.lang || ''); }
  function available(nativeLanguage, studyLanguage) {
    return supported(nativeLanguage, studyLanguage) && released.indexOf(nativeLanguage + '-' + studyLanguage) !== -1;
  }
  function chinese() { return window.nat === 'zh'; }
  function text(fr, zh) { return chinese() ? zh : fr; }
  function el(id) { return document.getElementById(id); }
  function setText(id, value) { var node = el(id); if (node) node.textContent = value; }
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
  function button(id, action) {
    var node = document.createElement('button'); node.id = id; node.type = 'button';
    node.addEventListener('click', function (event) { event.stopPropagation(); if (!modalOpen()) action(); });
    return node;
  }
  function ensureNodes() {
    if (nodes) return;
    var card = el('card');
    if (!card) throw new Error('lesson-card-missing');
    var originalEar = card.querySelector('.earicon');
    var ear = document.createElement('button'); ear.type = 'button'; ear.className = 'earicon'; ear.textContent = '👂';
    ear.addEventListener('click', function (event) { event.stopPropagation(); listen(ear); });
    var header = document.createElement('div'); header.id = 'l1CafeHeader'; header.className = 'l1-cafe-ui';
    var phase = document.createElement('div'); phase.id = 'l1CafePhase';
    var role = document.createElement('div'); role.id = 'l1CafeRole';
    var instruction = document.createElement('p'); instruction.id = 'l1CafeInstruction';
    var context = document.createElement('p'); context.id = 'l1CafeContext';
    var exit = button('l1CafeExit', exitLesson);
    header.append(phase, role, instruction, context, exit);
    card.insertBefore(header, card.firstChild);
    var reading = document.createElement('div'); reading.id = 'l1CafeReading'; reading.className = 'l1-cafe-ui';
    card.insertBefore(reading, el('cn'));
    var status = document.createElement('p'); status.id = 'l1CafeStatus'; status.className = 'l1-cafe-ui';
    status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
    var actions = document.createElement('div'); actions.id = 'l1CafeActions'; actions.className = 'l1-cafe-ui';
    var revealButton = button('l1CafeReveal', function () { if (helped) cancelAudio(); helped = !helped; render(); });
    var retry = button('l1CafeRetry', function () { loadScene(true); });
    var restart = button('l1CafeRestart', function () { position = 0; complete = false; helped = false; render(); });
    actions.append(revealButton, retry, restart);
    card.append(status, actions);
    nodes = {header:header,phase:phase,role:role,instruction:instruction,context:context,
      exit:exit,reading:reading,status:status,actions:actions,reveal:revealButton,retry:retry,restart:restart,
      ear:ear,originalEar:originalEar};
  }
  function validate(bundle) {
    if (!bundle || bundle.version !== 1 || bundle.sourceCommit !== sourceCommit ||
        bundle.doesNotChangeAccess !== true || !Array.isArray(bundle.pairs) || bundle.pairs.length !== 7) {
      throw new Error('invalid-l1-bundle');
    }
    var seen = Object.create(null);
    bundle.pairs.forEach(function (pair) {
      if (!pair || !supported(pair.nativeLanguage, pair.studyLanguage) || seen[pair.id] ||
          pair.id !== pair.nativeLanguage + '-' + pair.studyLanguage || pair.level !== 1 ||
          pair.learnerRole !== 'A' || !pair.roles || typeof pair.roles.A !== 'string' ||
          typeof pair.roles.B !== 'string' || !Array.isArray(pair.phrases) || pair.phrases.length !== 7 ||
          !Array.isArray(pair.preparation) || pair.preparation.length !== 11 ||
          !Array.isArray(pair.steps) || pair.steps.length !== 3 ||
          !Array.isArray(pair.received) || pair.received.length !== 3 ||
          !pair.contextReader || typeof pair.contextReader.scene !== 'string' ||
          typeof pair.contextReader.greeting !== 'string' || typeof pair.contextReader.refusal !== 'string' ||
          !Array.isArray(pair.bridgeUnits) || pair.bridgeUnits.length !== 2) throw new Error('invalid-l1-pair');
      seen[pair.id] = true;
      var phrases = Object.create(null), preparations = Object.create(null), learners = 0, received = 0;
      pair.phrases.forEach(function (phrase) {
        if (!phrase || typeof phrase.id !== 'string' || phrases[phrase.id] ||
            typeof phrase.study !== 'string' || !phrase.study || typeof phrase.native !== 'string' ||
            typeof phrase.phon !== 'string' || !phrase.phon ||
            ('reading' in phrase && typeof phrase.reading !== 'string') ||
            (phrase.speaker !== 'A' && phrase.speaker !== 'B') ||
            phrase.kind !== (phrase.speaker === 'A' ? 'learner' : 'received')) throw new Error('invalid-l1-phrase');
        phrases[phrase.id] = phrase;
        if (phrase.speaker === 'A') learners++; else received++;
      });
      if (learners !== 4 || received !== 3) throw new Error('invalid-l1-roles');
      pair.bridgeUnits.forEach(function (unit) {
        if (!unit || !phrases[unit.utteranceId] || phrases[unit.utteranceId].speaker !== 'A' || unit.sourceAccessLevel !== 1) throw new Error('invalid-l1-bridge');
      });
      pair.preparation.forEach(function (step) {
        var phrase = phrases[step.utterance];
        if (!phrase || preparations[step.id] || phrase.speaker !== step.speaker || step.wholePhrase !== true ||
            ['understand','imitate','receive'].indexOf(step.kind) === -1 ||
            (phrase.speaker === 'B' && (step.kind !== 'receive' || step.requiresProduction !== false)) ||
            (step.kind === 'imitate' && (phrase.speaker !== 'A' || step.requiresProduction !== true))) throw new Error('invalid-l1-preparation');
        preparations[step.id] = step;
      });
      var phaseKinds = ['listen-whole-dialogue','reply-with-help','reply-without-model'];
      pair.steps.forEach(function (step, index) {
        if (step.kind !== phaseKinds[index] || step.learnerRole !== 'A' ||
            !Array.isArray(step.turns) || step.turns.length !== 7 ||
            step.turns.some(function (id, turn) { return !phrases[id] || id !== pair.phrases[turn].id; })) throw new Error('invalid-l1-dialogue');
      });
      pair.received.forEach(function (contract) {
        var phrase = phrases[contract.utteranceId], introduction = preparations[contract.introducedInStep];
        if (!phrase || phrase.speaker !== 'B' || contract.analyse !== false || contract.countsAsProduction !== false ||
            !introduction || introduction.kind !== 'receive' || introduction.utterance !== phrase.id ||
            !Array.isArray(contract.answerWith) || typeof contract.replyRequired !== 'boolean' ||
            (contract.replyRequired !== (contract.answerWith.length > 0))) throw new Error('invalid-l1-received');
        contract.answerWith.forEach(function (answer) {
          var target = phrases[answer.utteranceId], preparation = preparations[answer.preparedInStep];
          if (!target || target.speaker !== 'A' || target.study !== answer.expectedStudy ||
              !preparation || preparation.utterance !== target.id || preparation.kind !== 'understand') throw new Error('invalid-l1-answer');
        });
      });
    });
    return bundle;
  }
  function fetchBundle(retry) {
    if (retry) bundlePromise = null;
    if (!bundlePromise) {
      controller = typeof AbortController === 'function' ? new AbortController() : null;
      var options = {credentials:'same-origin'};
      if (controller) options.signal = controller.signal;
      var request = fetch('content/l1-cafe.json', options).then(function (response) {
        if (!response.ok) throw new Error('l1-load-failed');
        return response.json();
      }).then(validate);
      var ownedPromise = request.catch(function (error) { if (bundlePromise === ownedPromise) bundlePromise = null; throw error; });
      bundlePromise = ownedPromise;
    }
    return bundlePromise;
  }
  function buildSequence(pair) {
    var phrases = Object.create(null);
    pair.phrases.forEach(function (phrase) { phrases[phrase.id] = phrase; });
    var result = pair.preparation.map(function (step) {
      return {phase:'preparation',kind:step.kind,phrase:phrases[step.utterance]};
    });
    pair.steps.forEach(function (phase) {
      phase.turns.forEach(function (id) {
        result.push({phase:phase.kind,kind:phase.kind,phrase:phrases[id]});
      });
    });
    return result;
  }
  function snapshot() {
    var ids = ['nav','rateBar','listen','badge','fr','phon','cn'];
    var elements = [];
    ids.forEach(function (id) { var node = el(id); if (node) elements.push({node:node,style:node.getAttribute('style')}); });
    var labels = [];
    ['rateAgainLabel','rateKnownLabel'].forEach(function (id) {
      var label = el(id); if (!label) return;
      var parent = label.closest('button'), icon = parent && parent.querySelector('[aria-hidden]');
      labels.push({node:label,text:label.textContent,button:parent,aria:parent && parent.getAttribute('aria-label'),
        disabled:parent && parent.disabled,icon:icon,iconText:icon && icon.textContent});
    });
    var content = [];
    ['badge','fr','phon','cn','count','currentLevel','ballLv','peek','immchip','heard'].forEach(function (id) {
      var node=el(id);if(node)content.push({node:node,text:node.textContent});
    });
    var progress=el('progBar'); if(progress)elements.push({node:progress,style:progress.getAttribute('style')});
    return {pool:window.pool,idx:window.idx,elements:elements,labels:labels,content:content,listenAria:el('listen')&&el('listen').getAttribute('aria-label')};
  }
  function start() {
    if (running) stop();
    if (!available(window.nat, window.lang)) return Promise.resolve(false);
    ensureNodes(); saved = snapshot(); running = true; complete = false; position = 0; helped = false;
    if (nodes.originalEar && nodes.originalEar.parentNode) nodes.originalEar.replaceWith(nodes.ear);
    // A recognition session from a classic card must release the microphone.
    try {
      var previousRecognition = window.rec;
      if (previousRecognition) { previousRecognition.onresult = null; previousRecognition.onerror = null; previousRecognition.onend = null; previousRecognition.abort(); window.rec = null; }
    } catch (_error) {}
    var microphone = el('mic'); if (microphone) microphone.classList.remove('rec');
    window.selfTest = false; window.revealed = false;
    document.body.classList.add('l1-cafe-active');
    return loadScene(false);
  }
  function loadScene(retry) {
    var token = ++generation, pairId = currentPair();
    cancelAudio(); scene = null; sequence = []; loading = true; failed = false;
    window.pool = []; window.idx = 0; render();
    return fetchBundle(retry).then(function (bundle) {
      if (!running || token !== generation || currentPair() !== pairId) return false;
      scene = bundle.pairs.filter(function (pair) { return pair.id === pairId; })[0];
      if (!scene) throw new Error('l1-pair-unavailable');
      sequence = buildSequence(scene); position = 0; complete = false; helped = false; loading = false;
      // Display rows feed existing counters only. They never enter classic DECKS or grading.
      window.pool = sequence.map(function (step) { return {lv:1,t:step.phrase.study,_l1Cafe:true}; });
      render(); return true;
    }).catch(function (_error) {
      if (!running || token !== generation || currentPair() !== pairId) return false;
      loading = false; failed = true; render(); return false;
    });
  }
  function stop() {
    if (!running) return;
    running = false; generation++; cancelAudio();
    if (controller && loading) { controller.abort(); bundlePromise = null; }
    controller = null;
    document.body.classList.remove('l1-cafe-active');
    var card = el('card'); if (card) { card.classList.remove('l1-cafe-hidden','l1-cafe-finished'); card.removeAttribute('data-l1-cafe-phase'); }
    if (nodes) {
      if (nodes.ear.parentNode && nodes.originalEar) nodes.ear.replaceWith(nodes.originalEar);
      nodes.reading.textContent = ''; nodes.status.textContent = ''; nodes.phase.textContent = '';
      nodes.role.textContent = ''; nodes.instruction.textContent = ''; nodes.context.textContent = '';
    }
    if (saved) {
      window.pool = saved.pool; window.idx = saved.idx;
      saved.elements.forEach(function (item) { if (item.style === null) item.node.removeAttribute('style'); else item.node.setAttribute('style',item.style); });
      saved.content.forEach(function(item){item.node.textContent=item.text;});
      var listenButton=el('listen'); if(listenButton){if(saved.listenAria===null)listenButton.removeAttribute('aria-label');else listenButton.setAttribute('aria-label',saved.listenAria);}
      saved.labels.forEach(function (item) {
        item.node.textContent = item.text;
        if (item.button) { item.button.disabled = item.disabled; if (item.aria === null) item.button.removeAttribute('aria-label'); else item.button.setAttribute('aria-label',item.aria); }
        if (item.icon) item.icon.textContent = item.iconText;
      });
    }
    saved = null; scene = null; sequence = []; position = 0; helped = false; complete = false; loading = false; failed = false;
    if(typeof window.fitCard==='function')window.fitCard();
  }
  function hidden() {
    var step = sequence[position];
    return !!(step && step.phase === 'reply-without-model' && step.phrase.speaker === 'A' && !helped && !complete);
  }
  function phaseLabel(step) {
    if (step.phase === 'preparation') return text('Préparer mon échange','准备对话');
    if (step.phase === 'listen-whole-dialogue') return text('Écouter l’échange','听完整对话');
    if (step.phase === 'reply-with-help') return text('Échanger avec le modèle','参照范例对话');
    return text('Échanger sans modèle','尝试独立对话');
  }
  function instruction(step) {
    if (step.phrase.kind === 'received') return text('Écoute et comprends le serveur. Tu n’as pas à répéter sa phrase.','听懂服务员的话，不需要跟读。');
    if (step.phase === 'listen-whole-dialogue') return text('Écoute cette réplique de l’échange.','听对话中的这句话。');
    if (step.kind === 'understand') return text('Écoute la phrase et découvre ce qu’elle veut dire.','听这句话，了解它的意思。');
    if (step.kind === 'imitate') return text('Écoute, puis répète la phrase entière.','听一遍，再跟读完整的句子。');
    if (step.phase === 'reply-without-model') return text('Dis ta réplique. Tu peux retrouver le modèle à tout moment.','试着说出你的这句回应，需要时可以查看范例。');
    return text('Dis ta réplique avec l’aide du modèle.','参照范例说出你的回应。');
  }
  function labels() {
    setText('rateAgainLabel', text('Réécouter','再听一遍'));
    setText('rateKnownLabel', complete ? text('Retour aux leçons','返回课程') : text('Continuer','继续'));
    var left = el('rateAgainLabel'), right = el('rateKnownLabel');
    [[left,text('Réécouter','再听一遍'),'↶'],[right,complete?text('Retour aux leçons','返回课程'):text('Continuer','继续'),'→']].forEach(function (item) {
      var parent = item[0] && item[0].closest('button');
      if (parent) { parent.setAttribute('aria-label',item[1]); parent.disabled = loading || failed || (item[0] === left && hidden()); var icon=parent.querySelector('[aria-hidden]'); if(icon)icon.textContent=item[2]; }
    });
    if (left && complete) { left.textContent=text('Recommencer','重新开始'); left.closest('button').setAttribute('aria-label',left.textContent); }
  }
  function render() {
    if (!running) return;
    ensureNodes(); var card = el('card'), step = sequence[position], mask = hidden();
    window.idx = position;
    card.classList.toggle('l1-cafe-hidden',mask); card.classList.toggle('l1-cafe-finished',complete);
    card.setAttribute('data-l1-cafe-phase', step ? step.phase : (failed ? 'error' : 'loading'));
    nodes.exit.textContent=text('Quitter l’échange','退出对话');
    nodes.retry.textContent=text('Réessayer','重试'); nodes.retry.hidden=!failed;
    nodes.restart.textContent=text('Recommencer','重新开始'); nodes.restart.hidden=!complete;
    nodes.reveal.textContent=helped ? text('Masquer le modèle','隐藏范例') : text('Retrouver le modèle','查看范例');
    nodes.reveal.hidden=!(step && step.phase==='reply-without-model' && step.phrase.speaker==='A' && !complete);
    nodes.reading.textContent=''; nodes.reading.hidden=true;
    nodes.status.textContent=''; setText('badge',''); setText('fr',''); setText('phon',''); setText('cn','');
    setText('peek',''); setText('immchip',''); setText('heard','');
    setText('ballLv','L1'); setText('currentLevel',text('Niveau L1','等级 L1'));
    setText('count',text('Étape ','步骤 ')+(sequence.length ? position+1 : 0)+' / '+sequence.length);
    var progress=el('progBar'); if(progress)progress.style.width=complete?'100%':(sequence.length?Math.round((position+1)/sequence.length*100):0)+'%';
    var nav=el('nav'); if(nav)nav.style.display=''; var ratebar=el('rateBar'); if(ratebar)ratebar.style.display='flex';
    var listenButton=el('listen'); if(listenButton) { listenButton.style.display=mask||loading||failed||complete?'none':''; listenButton.setAttribute('aria-label',text('Écouter la phrase','听这句话')); }
    nodes.ear.disabled=loading||failed||complete;
    nodes.ear.setAttribute('aria-label',mask?text('Retrouver le modèle et écouter la phrase','查看范例并听这句话'):text('Écouter la phrase','听这句话'));
    if(loading||failed) {
      nodes.phase.textContent=text('Premier échange · L1','第一次对话 · L1'); nodes.role.textContent=''; nodes.context.textContent='';
      nodes.instruction.textContent=failed?text('L’échange n’a pas pu se charger. Réessaie ou reviens aux leçons.','对话加载失败。请重试或返回课程。'):text('Chargement de l’échange…','正在加载对话…');
      nodes.status.textContent=failed?text('Les autres leçons restent disponibles.','其他课程仍可使用。'):'';
    } else if(complete) {
      nodes.phase.textContent=text('Échange parcouru','对话练习已结束'); nodes.role.textContent=''; nodes.context.textContent=scene.contextReader.scene;
      nodes.instruction.textContent=text('Tu as parcouru la préparation et l’échange. Tu peux rejouer la scène à ton rythme.','你已完成准备和对话练习。可以按自己的节奏再次练习。');
    } else if(step) {
      var phrase=step.phrase;
      nodes.phase.textContent=phaseLabel(step);
      nodes.role.textContent=phrase.kind==='received' ? text('À comprendre · ','理解 · ')+scene.roles[phrase.speaker] : text('Ta réplique · ','你的回应 · ')+scene.roles[phrase.speaker];
      nodes.instruction.textContent=instruction(step);
      var greeting=scene.bridgeUnits[0], refusal=scene.bridgeUnits[1];
      nodes.context.textContent=step.phase==='preparation' ? (phrase.id===greeting.utteranceId?scene.contextReader.greeting:phrase.id===refusal.utteranceId?scene.contextReader.refusal:scene.contextReader.scene) : scene.contextReader.scene;
      if(!mask) {
        setText('fr',phrase.study); setText('phon',phrase.phon);
        if(Object.prototype.hasOwnProperty.call(phrase,'reading')) { nodes.reading.textContent=phrase.reading; nodes.reading.hidden=!phrase.reading; }
      }
      setText('cn',phrase.native);
    }
    labels();
    if(typeof window.fitCard==='function')window.fitCard();
    // Clear any classic preview even if a responsive adapter refreshed it.
    setText('peek',''); setText('immchip','');
    card.scrollTop=0;
  }
  function move(delta) {
    if(!running||loading||failed||modalOpen())return;
    cancelAudio();
    if(complete) { if(delta<0)complete=false; else return; }
    else if(delta>0 && position===sequence.length-1)complete=true;
    else position=Math.max(0,Math.min(sequence.length-1,position+delta));
    helped=false; render();
  }
  function listen(btn) {
    if(!running||loading||failed||complete||modalOpen())return;
    if(hidden()) {
      // Listening is explicit help: keep the ear available without silently
      // treating an assisted reply as recall. Background controls cannot reveal it.
      if(btn!==nodes.ear)return;
      helped=true;render();
    }
    var step=sequence[position]; if(step && typeof window.speak==='function')window.speak(step.phrase.study,btn||el('listen'));
  }
  function reveal() { if(running&&!modalOpen()&&!complete&&!loading&&!failed) { helped=true;render(); } }
  function exitLesson() { if(typeof window.setMode==='function')window.setMode('all',null);else stop(); }
  function rateCard(known) {
    if(!running||modalOpen())return;
    if(complete) { if(known)exitLesson();else {complete=false;position=0;helped=false;render();} }
    else if(known)move(1);else listen();
  }
  function state() {
    var step=sequence[position];
    return {phase:step?step.phase:null,stepIndex:position,total:sequence.length,currentPhraseId:step?step.phrase.id:null,
      hidden:hidden(),complete:complete,loading:loading,error:failed};
  }
  window.MelungaL1Cafe=Object.freeze({available:available,active:function(){return running;},start:start,stop:stop,render:render,
    next:function(){move(1);},prev:function(){move(-1);},rateCard:rateCard,listen:listen,reveal:reveal,
    cardTap:function(){},selfTest:function(){},state:state});
  // Native recognition installs its own wrapper; protect this ungraded mode there too.
  var previousStartRec=window.startRec;
  if(typeof previousStartRec==='function')window.startRec=function(event){
    if(running){if(event&&event.stopPropagation)event.stopPropagation();return;}
    return previousStartRec.apply(this,arguments);
  };
  if(typeof window.buildLevels==='function')window.buildLevels();
})();
