(function () {
  'use strict';
  var PAIRS = [
    {id:'fr-en',native:'fr',study:'en',name:'Anglais',flag:'🇬🇧'},
    {id:'fr-es',native:'fr',study:'es',name:'Espagnol',flag:'🇪🇸'},
    {id:'fr-it',native:'fr',study:'it',name:'Italien',flag:'🇮🇹'},
    {id:'fr-zh',native:'fr',study:'zh',name:'Chinois',flag:'🇨🇳'},
    {id:'fr-ja',native:'fr',study:'ja',name:'Japonais',flag:'🇯🇵'},
    {id:'fr-ko',native:'fr',study:'ko',name:'Coréen',flag:'🇰🇷'},
    {id:'zh-fr',native:'zh',study:'fr',name:'Français',flag:'🇫🇷'}
  ];
  var LANG = {fr:'fr-FR',en:'en-GB',es:'es-ES',it:'it-IT',zh:'zh-CN',ja:'ja-JP',ko:'ko-KR'};
  var PHASES = {
    understand:['Comprendre','Écoute et découvre le sens.','Prends le temps de comprendre la phrase entière.'],
    imitate:['Imiter','À toi de reprendre la phrase.','Écoute, puis répète. Tu peux réécouter quand tu veux.'],
    replace:['Comparer','Une autre façon de dire ce dont tu as besoin.','Compare les deux phrases entières déjà présentées.'],
    'choose-and-recall':['Choisir','Choisis ce que tu veux dire.','Retrouve ta phrase avec son modèle, puis essaie sans lui si tu le souhaites.'],
    'recall-whole-phrase':['Essayer','Essaie de dire cette phrase.','Retrouve la phrase entière avec son sens, puis essaie sans modèle si tu le souhaites.'],
    receive:['À comprendre','Écoute ton interlocuteur.','Cette réplique est à comprendre ; tu n’as pas à la produire ici.'],
    'understand-and-imitate':['Préparer la conversation','Prépare ta réplique.','Découvre la phrase entière, puis écoute et reprends-la.'],
    'listen-whole-dialogue':['Échanger','Écoute la conversation entière.','Chaque réplique vient d’être présentée. Retrouve maintenant l’échange dans son ordre.'],
    'reply-with-help':['Répondre','Prends ta place dans l’échange.','Dis tes répliques à voix haute. Le modèle reste disponible.'],
    'reply-without-model':['Essayer','Essaie à ton rythme.','Tu peux masquer tes répliques et retrouver l’aide à tout moment.']
  };
  var state = {pairId:'fr-es',level:1,unitIndex:0,stepIndex:0,choiceId:null,hidden:false,dialogueIndex:null,fullVariants:false,bridgeMode:null,bridgeUnitIndex:null};
  var selection = [], bank = new Map(), sequences = new Map(), requests = new Map();
  var bridges = [], bridgeBank = new Map(), bridgeStatus = 'loading', bridgeRequestSerial = 0;
  var currentSequence = null, requestSerial = 0, renderSerial = 0, audioSerial = 0;
  var $ = function (id) { return document.getElementById(id); };
  function el(tag,className,text) { var node=document.createElement(tag);if(className)node.className=className;if(text!==undefined&&text!==null)node.textContent=String(text);return node; }
  function pair() { return PAIRS.find(function (item) { return item.id===state.pairId; }); }
  function row() { return selection.find(function (item) { var p=item.pair||{};return p.nativeLanguage===pair().native&&p.studyLanguage===pair().study&&Number(item.niveau)===state.level; }); }
  function unitRef() { return state.bridgeMode?null:row()&&row().unitRefs[state.unitIndex]; }
  function bridgeScene() { return state.level===1&&bridges.find(function(scene){return scene.nativeLanguage===pair().native&&scene.studyLanguage===pair().study&&Number(scene.level)===1;}); }
  function levelData(level) { return currentSequence&&currentSequence.levels.find(function (item) { return Number(item.sourceLevel)===Number(level); }); }
  function selectedUnit() { if(state.bridgeMode==='unit'){var scene=bridgeScene();return scene&&scene.bridgeUnits[state.bridgeUnitIndex];}var ref=unitRef();var level=ref&&levelData(ref.sourceContentLevel||ref.sequenceRef&&ref.sequenceRef.sourceLevel||state.level);return level&&level.units.find(function (item) { return item.unitId===ref.unitId; }); }
  function dialogues() { var level=levelData(state.level);return level&&level.dialogues||[]; }
  function selectedDialogue() { if(state.bridgeMode==='scene'){var scene=bridgeScene();return scene&&scene.dialogue;}return state.dialogueIndex===null?null:dialogues()[state.dialogueIndex]; }
  function curatedIndices() { var reference=unitRef();return reference&&reference.primary&&Array.isArray(reference.firstSessionCandidateIndices)&&reference.firstSessionCandidateIndices.length?reference.firstSessionCandidateIndices:null; }
  function plan() {
    var dialogue=selectedDialogue();if(dialogue)return(dialogue.preparation||[]).concat(dialogue.steps||[]);
    var steps=selectedUnit()&&selectedUnit().steps||[],indices=curatedIndices();if(state.fullVariants||!indices)return steps;
    var reference=unitRef();
    function allowed(id){var entry=bank.get(id);return Boolean(entry&&entry.source&&entry.source.unitId===reference.unitId&&indices.indexOf(entry.source.variantIndex)>=0);}
    return steps.reduce(function(result,step){
      if(step.utterance&&!allowed(step.utterance))return result;
      if((step.from||step.to)&&(!allowed(step.from)||!allowed(step.to)))return result;
      if(step.choices){var choices=step.choices.filter(allowed);if(choices.length)result.push(Object.assign({},step,{choices:choices}));}
      else result.push(step);
      return result;
    },[]);
  }
  function currentStep() { return plan()[state.stepIndex]; }
  function resetLesson() { state.stepIndex=0;state.choiceId=null;state.hidden=false;state.dialogueIndex=null;state.fullVariants=false;state.bridgeMode=null;state.bridgeUnitIndex=null;stopAudio(); }
  function stopAudio() { audioSerial++;if('speechSynthesis'in window)window.speechSynthesis.cancel();$('audio-status').textContent=''; }
  function copyRecord(id,kind,role) {
    var entry=state.bridgeMode?bridgeBank.get(id)||bank.get(id):bank.get(id);
    if(!entry||entry.nativeLanguage!==pair().native||entry.studyLanguage!==pair().study)throw new Error('Une référence de phrase ne correspond pas au couple sélectionné.');
    var copy=entry.copy||{},aids=copy.aids||{};
    if(!copy.study||!copy.native||!aids.phon||entry.source&&entry.source.slot||copy.study.indexOf('{s}')>=0)throw new Error('Une phrase complète ou son aide manque dans la proposition.');
    return {id:id,study:copy.study,native:copy.native,phon:aids.phon,reading:aids.reading||'',kind:kind||'learner',role:role||'Toi',source:entry.source};
  }
  function records() {
    var step=currentStep(),dialogue=selectedDialogue();if(!step)return [];
    if(dialogue){
      var ids=step.utterance?[step.utterance]:step.turns||[];
      return ids.map(function (id) {
        var preparation=(dialogue.preparation||[]).find(function (item) { return item.utterance===id; });
        var speaker=preparation&&preparation.speaker;
        var learner=speaker===dialogue.learnerRole;
        return copyRecord(id,learner?'learner':'received',dialogue.roles&&dialogue.roles[speaker]||(learner?'Toi':'Ton interlocuteur'));
      });
    }
    if(step.kind==='replace')return [copyRecord(step.from,'learner','Phrase de départ'),copyRecord(step.to,'learner','Autre possibilité')];
    if(step.choices){var id=step.choices.indexOf(state.choiceId)>=0?state.choiceId:step.choices[0];return [copyRecord(id)];}
    return step.utterance?[copyRecord(step.utterance)]:[];
  }
  function canRecall() { var step=currentStep();return Boolean(step&&(step.hideLearnerModelOnRequest||step.kind==='reply-without-model')); }
  function speak(items) {
    if(!items.length||items.some(function(item){return state.hidden&&item.kind==='learner';}))return;
    stopAudio();var run=audioSerial;
    if(!('speechSynthesis'in window)||!('SpeechSynthesisUtterance'in window)){$('audio-status').textContent='L’écoute système n’est pas disponible sur cet appareil.';return;}
    var language=LANG[pair().study];var voices=window.speechSynthesis.getVoices().filter(function(voice){return voice.lang.toLowerCase().indexOf(pair().study)===0;});
    var voice=voices.find(function(item){return item.localService;})||voices[0];
    function next(index){
      if(run!==audioSerial||index>=items.length){if(run===audioSerial)$('audio-status').textContent='';return;}
      var utterance=new SpeechSynthesisUtterance(items[index].study);utterance.lang=language;if(voice)utterance.voice=voice;
      utterance.onstart=function(){if(run===audioSerial)$('audio-status').textContent='Lecture en cours…';};
      utterance.onend=function(){next(index+1);};
      utterance.onerror=function(){if(run===audioSerial)$('audio-status').textContent='Cette voix n’est pas disponible sur cet appareil.';};
      window.speechSynthesis.speak(utterance);
    }
    next(0);
  }
  function earButton(item) {
    var serial=renderSerial,button=el('button','ear-button');button.type='button';
    button.setAttribute('aria-label','Écouter la phrase de '+item.role+' en '+pair().name.toLowerCase());
    var ear=el('span','','👂');ear.setAttribute('aria-hidden','true');button.append(ear);
    button.addEventListener('click',function(){if(serial===renderSerial)speak([item]);});return button;
  }
  function phraseCard(item) {
    var hidden=state.hidden&&item.kind==='learner',card=el('li','phrase-card'+(hidden?' masked':''));card.dataset.kind=item.kind;card.dataset.sourceId=item.id;
    var heading=el('div','phrase-heading');heading.append(el('p','role-label',item.role));if(item.kind==='received')heading.append(el('span','received-badge','À comprendre'));card.append(heading);
    if(hidden){var intention=el('p','native',item.native);intention.lang=pair().native;card.append(intention,el('p','intention-prompt','À toi de le dire. Réaffiche l’aide quand tu veux.'));return card;}
    var text=el('p','study',item.study);text.lang=pair().study;
    var phoneticRow=el('div','phonetic-row'),phon=el('p','phonetic',item.phon);phon.lang=pair().native;phoneticRow.append(phon,earButton(item));
    card.append(text,phoneticRow);
    if(item.reading){var reading=el('p','reading');var readingName={zh:'Pinyin',ja:'Lecture',ko:'Romanisation'}[pair().study]||'Lecture';reading.append(el('span','reading-label',readingName+' · '));var readingText=el('span','reading-text',item.reading);readingText.lang=pair().study;reading.append(readingText);card.append(reading);}
    var native=el('p','native',item.native);native.lang=pair().native;card.append(native);return card;
  }
  function renderChoices() {
    var step=currentStep(),choices=step&&step.choices||[],group=$('intention-choices');group.replaceChildren();group.hidden=!choices.length;
    choices.forEach(function(id){var item=copyRecord(id),button=el('button','intention-button',item.native);button.type='button';button.dataset.choiceId=id;button.setAttribute('aria-pressed',String(id===(state.choiceId||choices[0])));button.onclick=function(){state.choiceId=id;renderLesson('choice');};group.append(button);});
  }
  function renderDetails(items) {
    var details=$('source-details'),content=$('source-content');content.replaceChildren();details.open=false;details.hidden=state.hidden;
    if(state.hidden)return;
    var reference=unitRef(),dialogue=selectedDialogue();
    content.append(el('p','detail-status','Proposition à relire. Présentation des sources vérifiée séparément ; apprentissage et niveau non certifiés.'));
    if(state.bridgeMode){
      content.append(el('p','','Essai à relire : la relecture native reste à faire.'));
      if(pair().study==='ja'||pair().study==='ko')content.append(el('p','','Le sens du refus, son degré de politesse et son intonation restent à vérifier avec un locuteur natif.'));
    }
    if(reference&&!dialogue){[reference.reason,reference.noveltyCaution,reference.reviewStatus].filter(Boolean).forEach(function(note){content.append(el('p','',note));});}
    if(dialogue&&dialogue.reviewQuestion)content.append(el('p','',dialogue.reviewQuestion));
    var list=el('ul','source-list');items.forEach(function(item){var line=el('li');line.append(el('code','',item.id),el('small','',item.source&&item.source.file||''));list.append(line);});content.append(list);
  }
  function renderLesson(focus) {
    stopAudio();renderSerial++;
    var steps=plan(),step=currentStep();if(!step)throw new Error('La séquence de cette situation n’est pas disponible.');
    var copy=PHASES[step.kind]||['Découvrir','Découvre cette phrase.','Écoute la phrase entière et retrouve son sens.'];
    $('phase-label').textContent=copy[0];$('step-count').textContent='Étape '+(state.stepIndex+1)+' / '+steps.length;
    $('lesson-title').textContent=copy[1];$('step-instruction').textContent=copy[2];
    var bridgeUnit=state.bridgeMode==='unit'&&selectedUnit(),context=bridgeUnit&&bridgeUnit.contextReader||'';
    $('bridge-context').textContent=context;$('bridge-context').lang=pair().native;$('bridge-context').hidden=!context;
    $('bridge-lesson-status').hidden=!state.bridgeMode;
    $('all-variants').hidden=Boolean(state.bridgeMode)||state.dialogueIndex!==null||!curatedIndices();$('all-variants').setAttribute('aria-pressed',String(state.fullVariants));
    $('leave-dialogue').hidden=!state.bridgeMode&&state.dialogueIndex===null;renderChoices();
    $('recall-actions').hidden=!canRecall();$('recall-toggle').textContent=state.hidden?'Réafficher l’aide':'Essayer sans modèle';$('recall-toggle').setAttribute('aria-pressed',String(state.hidden));
    $('recall-state').textContent=state.hidden?'Le sens et les répliques reçues restent visibles.':'';
    var items=records();$('phrase-list').replaceChildren.apply($('phrase-list'),items.map(phraseCard));
    $('scene-audio').hidden=!(selectedDialogue()&&step.turns&&step.turns.length>1);$('scene-audio').disabled=state.hidden;
    $('previous-step').disabled=state.stepIndex===0;$('next-step').disabled=state.stepIndex===steps.length-1;
    var transfer=row()&&row().transferTask;
    var prompt=transfer&&(transfer.readerInstructions&&transfer.readerInstructions[pair().native]||transfer.instruction)||'';
    var showTransfer=!state.bridgeMode&&state.dialogueIndex===null&&state.stepIndex===steps.length-1&&Boolean(prompt);
    $('transfer-task').hidden=!showTransfer;$('transfer-prompt').textContent=showTransfer?prompt:'';$('transfer-prompt').lang=pair().native;
    renderDetails(items);
    if(focus==='step'){$('lesson-title').focus({preventScroll:true});$('lesson-title').scrollIntoView({block:'start'});}
    if(focus==='recall')$('recall-toggle').focus({preventScroll:true});
    if(focus==='choice'){Array.from($('intention-choices').children).find(function(button){return button.dataset.choiceId===state.choiceId;})?.focus({preventScroll:true});}
  }
  function renderBridgeChoices() {
    var section=$('bridge-section'),choices=$('bridge-choices'),status=$('bridge-status');
    section.hidden=state.level!==1;choices.replaceChildren();if(section.hidden)return;
    var scene=bridgeScene();
    status.textContent=bridgeStatus==='loading'?'Préparation du premier échange…':!scene?'Le premier échange n’a pas pu être chargé. Les autres situations restent disponibles.':'';
    status.hidden=!status.textContent;
    if(!scene)return;
    function open(mode,index){resetLesson();state.bridgeMode=mode;state.bridgeUnitIndex=index;renderUnitList();renderLesson('step');}
    scene.bridgeUnits.forEach(function(unit,index){
      var button=el('button','bridge-unit-choice',unit.title);button.type='button';button.dataset.unitId=unit.unitId;
      button.setAttribute('aria-pressed',String(state.bridgeMode==='unit'&&state.bridgeUnitIndex===index));button.onclick=function(){open('unit',index);};choices.append(button);
    });
    var sceneButton=el('button','bridge-scene-choice','Le café, pas à pas');sceneButton.type='button';sceneButton.dataset.dialogueId=scene.dialogue.dialogueId;
    sceneButton.setAttribute('aria-pressed',String(state.bridgeMode==='scene'));sceneButton.onclick=function(){open('scene',null);};choices.append(sceneButton);
  }
  function renderUnitList() {
    var list=$('unit-list');list.replaceChildren();var references=row().unitRefs;
    references.forEach(function(reference,index){var button=el('button','unit-choice');button.type='button';button.dataset.unitId=reference.unitId;button.setAttribute('aria-pressed',String(!state.bridgeMode&&state.dialogueIndex===null&&index===state.unitIndex));button.append(el('small','',reference.primary?'Point de départ':'Autre situation'),el('span','',reference.situationLabel||reference.situation));button.onclick=function(){state.unitIndex=index;resetLesson();renderUnitList();try{renderLesson('step');}catch(error){showError(error);}};list.append(button);});
    var dialogueList=$('dialogue-list');dialogueList.replaceChildren();dialogues().forEach(function(dialogue,index){var button=el('button','dialogue-choice',dialogue.situation||'Conversation '+(index+1));button.type='button';button.dataset.dialogueId=dialogue.dialogueId;button.setAttribute('aria-pressed',String(!state.bridgeMode&&index===state.dialogueIndex));button.onclick=function(){resetLesson();state.dialogueIndex=index;renderUnitList();renderLesson('step');};dialogueList.append(button);});$('dialogue-picker').hidden=!dialogues().length;
    renderBridgeChoices();
  }
  function renderSelectors() {
    document.querySelectorAll('.language-button').forEach(function(button){button.setAttribute('aria-pressed',String(button.dataset.pair===state.pairId));});
    document.querySelectorAll('.level-button').forEach(function(button){button.setAttribute('aria-pressed',String(Number(button.dataset.level)===state.level));});
    $('context-line').textContent=pair().name+' · '+(pair().native==='zh'?'Aide de lecture pour sinophones':'Aide de lecture pour francophones');
  }
  function showError(error) {
    stopAudio();$('workspace').hidden=true;$('load-status').textContent='';var box=$('empty-state');box.hidden=false;box.replaceChildren(el('h2','','La proposition est en préparation.'),el('p','',error.message||'Les fichiers de relecture ne sont pas disponibles ici.'));
    var retry=el('button','quiet-button','Réessayer');retry.type='button';retry.onclick=function(){initialize();};box.append(retry);
  }
  function fetchJson(url) { return fetch(url,{credentials:'omit',cache:'no-store'}).then(function(response){if(!response.ok)throw new Error('Le fichier de sélection ou de contenu n’est pas encore disponible.');return response.json();}); }
  function loadBridges() {
    var token=++bridgeRequestSerial,bundle=window.MELUNGA_PROGRESS_REVIEW;bridgeStatus='loading';
    var bridgeData=bundle&&bundle.bridges?Promise.resolve(bundle.bridges):fetchJson('../l1-bridges.json');
    var bankData=bundle&&bundle.bridgeBank?Promise.resolve(bundle.bridgeBank):fetchJson('../banks/l1-bridges.json');
    return Promise.all([bridgeData,bankData]).then(function(results){
      if(token!==bridgeRequestSerial)return;
      if(!Array.isArray(results[0].scenes)||!Array.isArray(results[1].entries))throw new Error('Le premier échange est en préparation.');
      var entries=new Map();results[1].entries.forEach(function(entry){if(!entry.id||entries.has(entry.id))throw new Error('Une référence du premier échange est en préparation.');entries.set(entry.id,entry);});
      results[0].scenes.forEach(function(scene){if(!Array.isArray(scene.bridgeUnits)||!scene.dialogue||!Array.isArray(scene.dialogue.preparation)||!Array.isArray(scene.dialogue.steps))throw new Error('Le premier échange est en préparation.');});
      bridges=results[0].scenes;bridgeBank=entries;bridgeStatus='ready';
    }).catch(function(){if(token===bridgeRequestSerial){bridges=[];bridgeBank=new Map();bridgeStatus='unavailable';}}).then(function(){if(token===bridgeRequestSerial&&currentSequence&&!$('workspace').hidden)renderBridgeChoices();});
  }
  function loadSequence(id) {
    if(sequences.has(id))return Promise.resolve(sequences.get(id));
    if(requests.has(id))return requests.get(id);
    var bundle=window.MELUNGA_PROGRESS_REVIEW,promise=bundle&&bundle.sequences&&bundle.sequences[id]?Promise.resolve(bundle.sequences[id]):fetchJson('../sequences/seq-'+id+'.json');
    var pending=promise.then(function(data){sequences.set(id,data);requests.delete(id);return data;},function(error){requests.delete(id);throw error;});requests.set(id,pending);return pending;
  }
  function showSelection(focus) {
    var token=++requestSerial;stopAudio();renderSelectors();$('empty-state').hidden=true;$('workspace').hidden=true;$('load-status').textContent='Préparation des phrases…';
    return loadSequence(state.pairId).then(function(data){
      if(token!==requestSerial)return;currentSequence=data;
      if(data.nativeLanguage!==pair().native||data.studyLanguage!==pair().study)throw new Error('Les aides de lecture ne correspondent pas au public sélectionné.');
      var selected=row();if(!selected||!selected.unitRefs||!selected.unitRefs.length)throw new Error('La sélection de ce niveau est encore à préparer.');
      state.unitIndex=Math.max(0,selected.unitRefs.findIndex(function(reference){return reference.primary;}));resetLesson();
      var level=levelData(state.level);$('level-label').textContent='Niveau proposé · L'+state.level;$('level-title').textContent=level&&level.title||'Des phrases pour agir';$('level-goal').textContent=level&&level.goal||'';
      renderUnitList();renderLesson(focus?'step':null);$('load-status').textContent='';$('workspace').hidden=false;
    }).catch(function(error){if(token===requestSerial)showError(error);});
  }
  function buildSelectors() {
    PAIRS.forEach(function(item){var button=el('button','language-button');button.type='button';button.dataset.pair=item.id;button.setAttribute('aria-label','Pratiquer le '+item.name.toLowerCase());var flag=el('span','flag',item.flag);flag.setAttribute('aria-hidden','true');button.append(flag,el('span','language-name',item.name));button.onclick=function(){state.pairId=item.id;state.unitIndex=0;resetLesson();showSelection();};$('language-selector').append(button);});
    for(var level=1;level<=10;level++)(function(number){var button=el('button','level-button','L'+number);button.type='button';button.dataset.level=String(number);button.setAttribute('aria-label','Niveau proposé '+number);button.onclick=function(){state.level=number;state.unitIndex=0;resetLesson();showSelection();};$('level-selector').append(button);})(level);
  }
  function initialize() {
    var bundle=window.MELUNGA_PROGRESS_REVIEW;
    var selectionData=bundle&&bundle.selection?Promise.resolve(bundle.selection):fetchJson('../selection-guidee-enrichie.json');
    var bankData=bundle&&bundle.bank?Promise.resolve(bundle.bank):fetchJson('../banque-phrases.json');
    $('empty-state').hidden=true;$('load-status').textContent='Préparation des phrases…';
    loadBridges();
    Promise.all([selectionData,bankData]).then(function(results){selection=results[0].entries||[];bank=new Map((results[1].entries||[]).map(function(entry){return[entry.id,entry];}));if(!selection.length||!bank.size)throw new Error('La sélection et les phrases doivent accompagner cette maquette.');return showSelection();}).catch(showError);
  }
  $('previous-step').onclick=function(){if(state.stepIndex>0){state.stepIndex--;state.hidden=false;state.choiceId=null;renderLesson('step');}};
  $('next-step').onclick=function(){if(state.stepIndex<plan().length-1){state.stepIndex++;state.hidden=false;state.choiceId=null;renderLesson('step');}};
  $('recall-toggle').onclick=function(){if(canRecall()){state.hidden=!state.hidden;renderLesson('recall');}};
  $('all-variants').onclick=function(){state.fullVariants=!state.fullVariants;state.stepIndex=0;state.choiceId=null;state.hidden=false;renderLesson('step');};
  $('scene-audio').onclick=function(){speak(records());};
  $('leave-dialogue').onclick=function(){resetLesson();renderUnitList();renderLesson('step');};
  window.addEventListener('pagehide',stopAudio);buildSelectors();renderSelectors();initialize();
})();
