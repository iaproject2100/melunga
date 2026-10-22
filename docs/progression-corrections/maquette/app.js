(function () {
  'use strict';
  var labels = {
    'fr-en':['🇬🇧','Anglais'],'fr-es':['🇪🇸','Espagnol'],'fr-it':['🇮🇹','Italien'],
    'fr-zh':['🇨🇳','Chinois'],'fr-ja':['🇯🇵','Japonais'],'fr-ko':['🇰🇷','Coréen'],'zh-fr':['🇫🇷','Français']
  };
  var languageCodes={en:'en-GB',es:'es-ES',it:'it-IT',zh:'zh-CN',ja:'ja-JP',ko:'ko-KR',fr:'fr-FR'};
  var bundle=null,sourceMap=new Map(),audioSerial=0,loadingSerial=0;
  var state={pairId:'fr-en',level:1,unitId:null,stepIndex:0,choiceId:null,hidden:false,helpRequested:false};
  var $=function(id){return document.getElementById(id);};
  function node(tag,className,value){var result=document.createElement(tag);if(className)result.className=className;if(value!==undefined&&value!==null)result.textContent=String(value);return result;}
  function pair(){return bundle&&bundle.pairs.find(function(item){return item.id===state.pairId;});}
  function level(){return pair()&&pair().levels.find(function(item){return Number(item.level)===Number(state.level);});}
  function unit(){return level()&&level().units.find(function(item){return item.unitId===state.unitId;});}
  function step(){return unit()&&unit().steps[state.stepIndex];}
  function chinese(){return pair()&&pair().nativeLanguage==='zh';}
  function reader(fr,zh){return chinese()?zh:fr;}
  function stopAudio(){audioSerial++;try{if(window.speechSynthesis)window.speechSynthesis.cancel();}catch(_error){}$('audio-status').textContent='';}
  function phrase(id){var result=sourceMap.get(id);if(!result)throw new Error('Une référence de phrase manque dans cette proposition.');return result;}
  function stepIds(){
    var item=step();if(!item)return[];
    if(item.kind==='choose-and-recall'){var choices=item.choices||[];return choices.length?[state.choiceId&&choices.indexOf(state.choiceId)!==-1?state.choiceId:choices[0]]:item.utterance?[item.utterance]:[];}
    if(Array.isArray(item.utterances))return item.utterances;
    if(item.kind==='compare'&&Array.isArray(item.choices))return item.choices;
    return item.utterance?[item.utterance]:Array.isArray(item.choices)?item.choices:[];
  }
  function canRecall(){return !!(step()&&step().kind==='choose-and-recall');}
  function describePhase(){
    var kind=step().kind;
    if(step().preparationId&&kind==='understand')return[reader('D’abord, une phrase','先看一个句子'),reader('Écoute cette phrase entière et découvre son sens.','听完整的句子，了解它的意思。')];
    if(step().preparationId&&kind==='imitate')return[reader('Imiter la phrase','跟读句子'),reader('Écoute, puis répète la phrase entière avant de la retrouver dans la situation.','先听一遍，再跟读完整的句子，然后在情境中重温。')];
    if(kind==='understand')return[reader('Comprendre','理解'),reader('Écoute une phrase entière et découvre son sens.','听完整的句子，了解它的意思。')];
    if(kind==='imitate')return[reader('Imiter','跟读'),reader('Écoute, puis répète la phrase entière.','先听一遍，再跟读完整的句子。')];
    if(kind==='compare')return[reader('Remplacer un élément','替换一个部分'),reader('Compare ces phrases déjà présentées. Repère ce qui reste et ce qui change.','比较已经学过的句子，留意相同和变化的部分。')];
    return[reader('Choisir et essayer','选择并尝试'),reader('Choisis ce que tu veux dire. Tu peux ensuite essayer sans modèle et retrouver l’aide.','选择你想表达的意思，然后可以隐藏范例尝试说出来，需要时再查看。')];
  }
  function speakPhrase(id){
    var item=phrase(id),serial=++audioSerial;
    try{
      if(!window.speechSynthesis||typeof window.SpeechSynthesisUtterance!=='function'){throw new Error('speech-unavailable');}
      window.speechSynthesis.cancel();
      var utterance=new SpeechSynthesisUtterance(item.study);utterance.lang=languageCodes[pair().studyLanguage]||pair().studyLanguage;utterance.rate=.9;
      utterance.onerror=function(event){if(serial===audioSerial&&(!event||event.error!=='canceled'&&event.error!=='interrupted'))$('audio-status').textContent=reader('Cette voix n’est pas disponible sur cet appareil.','此设备暂时无法播放这段语音。');};
      window.speechSynthesis.speak(utterance);
    }catch(_error){if(serial===audioSerial)$('audio-status').textContent=reader('L’audio n’est pas disponible sur cet appareil.','此设备暂时无法播放语音。');}
  }
  function ear(id){
    var control=node('button','ear','👂');control.type='button';
    control.setAttribute('aria-label',state.hidden?reader('Retrouver le modèle et écouter la phrase','查看范例并听这句话'):reader('Écouter la phrase','听这句话'));
    control.addEventListener('click',function(){
      if(state.hidden){
        state.hidden=false;state.helpRequested=true;render();
        Array.from($('phrase-list').children).filter(function(card){return card.dataset.sourceId===id;}).forEach(function(card){var restored=card.querySelector('.ear');if(restored)restored.focus({preventScroll:true});});
      }
      speakPhrase(id);
    });return control;
  }
  function phraseCard(id,index){
    var item=phrase(id),card=node('li','phrase-card'+(state.hidden?' masked':''));card.dataset.sourceId=id;
    card.append(node('p','phrase-label',reader(step().kind==='compare'?'Phrase '+(index+1):'Ta phrase',step().kind==='compare'?'句子 '+(index+1):'你的句子')));
    if(state.hidden){
      var intention=node('p','native',item.native);intention.lang=pair().nativeLanguage;
      card.append(intention,node('p','intention-prompt',reader('À toi de le dire. L’oreille réaffiche le modèle avant l’écoute.','试着说出来。点击耳朵可以查看范例并听语音。')),ear(id));return card;
    }
    var study=node('p','study',item.study);study.lang=pair().studyLanguage;
    var phon=node('p','phon',item.phon);phon.lang=pair().nativeLanguage;
    var phoneticRow=node('div','phonetic-row');phoneticRow.append(phon,ear(id));card.append(study,phoneticRow);
    if(Object.prototype.hasOwnProperty.call(item,'reading')){var reading=node('p','reading',item.reading);reading.lang=pair().studyLanguage;card.append(reading);}
    var meaning=node('p','native',item.native);meaning.lang=pair().nativeLanguage;card.append(meaning);return card;
  }
  function renderDetails(){
    var details=$('review-details'),content=$('review-content');details.open=false;details.hidden=state.hidden;content.replaceChildren();
    if(state.hidden)return;
    var current=unit();
    content.append(node('p','',current.unitId),node('p','',('Niveau source : L'+current.sourceLevel+' · placement proposé : L'+current.proposedLevel)),node('p','',('Point de relecture : '+(current.focus||''))),node('p','',current.rationale||''));
    var prereqs=current.plannedPrerequisites||[];content.append(node('p','',prereqs.length?'Préparation prévue par les unités antérieures :':'Aucun lien antérieur déclaré pour cette unité.'));
    if(prereqs.length){var list=node('ul');prereqs.forEach(function(id){var line=node('li');line.append(node('code','',typeof id==='string'?id:JSON.stringify(id)));list.append(line);});content.append(list);}
    if(current.firstSubstitution){var sub=current.firstSubstitution;content.append(node('p','',('Invariant : '+(sub.invariant||''))),node('p','',('Changement visé : '+(sub.changedPart||''))));}
    else content.append(node('p','review-note','Ces expressions sont préparées entières. Elles ne sont pas présentées comme des morceaux librement interchangeables.'));
    (current.gaps||[]).forEach(function(gap){content.append(node('p','review-note',typeof gap==='string'?gap:JSON.stringify(gap)));});
    content.append(node('p','','Ces liens décrivent un ordre prévu ; ils ne prouvent pas les acquis de l’apprenant.'));
  }
  function renderChoices(){
    var group=$('intention-choices'),choices=step().kind==='choose-and-recall'?step().choices||[]:[];group.replaceChildren();group.hidden=!choices.length;
    group.setAttribute('aria-label',reader('Choisir ce que tu veux dire','选择你想表达的意思'));
    choices.forEach(function(id){var item=phrase(id),control=node('button','choice-button',item.native);control.type='button';control.dataset.choiceId=id;control.lang=pair().nativeLanguage;control.setAttribute('aria-pressed',String(id===(state.choiceId||choices[0])));control.onclick=function(){state.choiceId=id;state.hidden=false;state.helpRequested=false;render();};group.append(control);});
  }
  function render(){
    stopAudio();var current=unit(),currentStep=step();if(!current||!currentStep)throw new Error('Cette unité n’a pas encore de plan de présentation.');
    var ids=stepIds();if(!ids.length)throw new Error('Cette étape n’a pas de phrase source.');
    var phase=describePhase();$('phase-label').textContent=phase[0];$('step-instruction').textContent=phase[1];$('step-instruction').lang=pair().nativeLanguage;
    $('focus-heading').textContent=chinese()?'准备一句你能使用的话':current.situation||'Une phrase pour agir';
    $('step-count').textContent=reader('Étape ','步骤 ')+(state.stepIndex+1)+' / '+current.steps.length;
    $('phrase-list').replaceChildren.apply($('phrase-list'),ids.map(phraseCard));renderChoices();renderDetails();
    $('recall-actions').hidden=!canRecall();$('recall-toggle').textContent=state.hidden?reader('Retrouver le modèle','查看范例'):reader('Essayer sans modèle','隐藏范例尝试');$('recall-toggle').setAttribute('aria-pressed',String(state.hidden));
    $('recall-state').textContent=state.hidden?reader('Le sens reste visible. Demander une aide reste possible.','意思仍然可见，随时可以请求帮助。'):state.helpRequested?reader('Le modèle a été réaffiché à ta demande.','范例已按你的要求重新显示。'):'';
    $('transfer-task').hidden=!canRecall();$('transfer-title').textContent=reader('À toi de construire','试着自己表达');
    $('transfer-prompt').textContent=current.firstSubstitution?reader('Reprends le cadre des phrases préparées. Choisis un autre élément déjà entendu dans une phrase entière et dis ce que tu veux exprimer. Si une forme nouvelle est nécessaire, retrouve d’abord un modèle.','使用刚才准备过的句式，选择一个已经在完整句子中听过的部分，说出你想表达的意思。如果需要新的表达形式，请先找完整范例。'):reader('Choisis l’expression préparée qui correspond à ton intention et dis-la dans une situation proche de la tienne. Garde l’expression entière ; une autre construction se prépare séparément.','选择一个符合你想法的完整表达，在与自己相关的相近情境中说出来。保留完整表达，其他句式需要单独准备。');
    $('transfer-prompt').lang=pair().nativeLanguage;
    $('prev-step').textContent=reader('Précédent','上一步');$('next-step').textContent=reader('Continuer','继续');$('prev-step').disabled=state.stepIndex===0;$('next-step').disabled=state.stepIndex===current.steps.length-1;
  }
  function resetStep(){stopAudio();state.stepIndex=0;state.choiceId=null;state.hidden=false;state.helpRequested=false;}
  function renderUnitOptions(){
    var currentLevel=level();if(!currentLevel||!currentLevel.units.length)throw new Error('Ce niveau n’a pas de sélection.');
    var select=$('unit-select');select.replaceChildren();
    currentLevel.units.forEach(function(item,index){
      var label=chinese()?'情境 '+(index+1)+(item.phrases[0]&&item.phrases[0].native?' · '+item.phrases[0].native:''):(index+1)+'. '+(item.situation||'Une phrase pour agir');
      var option=node('option','',label);option.value=item.unitId;select.append(option);
    });
    if(!currentLevel.units.some(function(item){return item.unitId===state.unitId;}))state.unitId=currentLevel.units[0].unitId;select.value=state.unitId;
    $('level-label').textContent='Parcours proposé · L'+state.level;$('level-title').textContent=currentLevel.title||'Des phrases pour agir';
    $('level-summary').textContent=currentLevel.goal||currentLevel.summary||'Des phrases entières, préparées avant leur réemploi.';
    var allCount=pair().levels.reduce(function(total,item){return total+item.units.length;},0);$('unit-count').textContent=currentLevel.units.length+' situations à ce niveau · '+allCount+' dans cette langue';
    $('reader-context').textContent=labels[pair().id][1]+' · '+(chinese()?'帮助面向中文读者':'Aide de prononciation pour francophones');
  }
  function renderLevelOptions(){
    var select=$('level-select');select.replaceChildren();pair().levels.forEach(function(item){var option=node('option','','L'+item.level+' · '+(item.title||''));option.value=String(item.level);select.append(option);});
    if(!pair().levels.some(function(item){return Number(item.level)===Number(state.level);}))state.level=pair().levels[0].level;select.value=String(state.level);
  }
  function select(pairId,levelNumber,unitId){
    if(!bundle)throw new Error('La proposition n’est pas chargée.');
    if(pairId&&!bundle.pairs.some(function(item){return item.id===pairId;}))throw new Error('Ce couple de langues n’est pas disponible.');
    state.pairId=pairId||state.pairId;state.level=Number(levelNumber||state.level);state.unitId=unitId||null;resetStep();
    $('pair-select').value=state.pairId;renderLevelOptions();renderUnitOptions();render();return getState();
  }
  function move(delta){
    if(!bundle||!unit())return;
    var next=Math.max(0,Math.min(unit().steps.length-1,state.stepIndex+delta));if(next===state.stepIndex)return;
    stopAudio();state.stepIndex=next;state.choiceId=null;state.hidden=false;state.helpRequested=false;render();
  }
  function validate(data){
    if(!data||data.version!==1||!Array.isArray(data.pairs)||data.pairs.length!==7)throw new Error('Le fichier de progression n’a pas le format attendu.');
    var nextMap=new Map(),pairIds=new Set();
    data.pairs.forEach(function(item){
      if(!labels[item.id]||pairIds.has(item.id)||item.id!==item.nativeLanguage+'-'+item.studyLanguage||!Array.isArray(item.levels)||item.levels.length!==10)throw new Error('Le couple ou ses dix niveaux sont incomplets.');
      pairIds.add(item.id);var unitIds=new Set(),levels=new Set();
      item.levels.forEach(function(level){
        if(!Number.isInteger(level.level)||level.level<1||level.level>10||levels.has(level.level)||!Array.isArray(level.units)||!level.units.length)throw new Error('Un niveau de la proposition est incomplet.');levels.add(level.level);
        level.units.forEach(function(current){
          if(!current.unitId||unitIds.has(current.unitId)||!Array.isArray(current.phrases)||current.phrases.length!==4||!Array.isArray(current.steps)||!current.steps.length)throw new Error('Une unité de la proposition est incomplète.');unitIds.add(current.unitId);
          function register(record){
            if(!record.id||typeof record.study!=='string'||typeof record.native!=='string'||typeof record.phon!=='string'||('reading'in record&&typeof record.reading!=='string'))throw new Error('Une phrase ou son aide manque.');
            if(nextMap.has(record.id)&&JSON.stringify(nextMap.get(record.id))!==JSON.stringify(record))throw new Error('Une référence de phrase possède deux copies différentes.');nextMap.set(record.id,record);
          }
          current.phrases.forEach(register);
          var supports=current.preparations===undefined?[]:current.preparations;
          if(!Array.isArray(supports))throw new Error('Les préparations de cette unité sont incomplètes.');
          var supportIds=new Set(),sourceIds=new Set(current.phrases.map(function(record){return record.id;}));
          supports.forEach(function(support){
            var source=support.source||{},expected=current.unitId==='L4-fr-es-01'?{264:1,283:0}:current.unitId==='L4-fr-es-03'?{542:3}:{};
            if(item.id!=='fr-es'||level.level!==4||!Number.isInteger(source.index)||!Object.prototype.hasOwnProperty.call(expected,source.index)||support.beforeVariantIndex!==expected[source.index]||source.type!=='catalogue-card'||source.file!=='melunga_deploy/app.html'||source.collection!=='DECKS.es'||source.sourceCommit!=='bcd108dff5c5931f935f70f694a040d235403b64'||source.indexBase!==0||source.sourceLevel!==(source.index===542?3:2)||source.readerLanguage!=='fr'||source.studyLanguage!=='es'||!source.fieldMap||source.fieldMap.study!=='t'||source.fieldMap.native!=='frm'||source.fieldMap.phon!=='pf'||!support.phrase||!support.id||supportIds.has(support.id))throw new Error('Une préparation ne correspond pas à sa source ou à sa destination.');
            if(support.id!==current.unitId+'-preparation-'+source.index||support.phrase.id!=='catalogue:DECKS.es:'+source.index+':reader-fr'||support.understoodInStep!==support.id+'-understand'||support.imitatedInStep!==support.id+'-imitate')throw new Error('Une préparation possède des références incohérentes.');
            supportIds.add(support.id);register(support.phrase);
          });
          current.steps.forEach(function(step){
            var ids=(step.utterance?[step.utterance]:[]).concat(step.utterances||[],step.choices||[]),preparation=supports.find(function(support){return support.id===step.preparationId;});
            var known=preparation&&(step.kind==='understand'||step.kind==='imitate')?new Set([preparation.phrase.id]):sourceIds;
            if(!ids.length||ids.some(function(id){return!known.has(id);})||['understand','imitate','compare','choose-and-recall'].indexOf(step.kind)===-1||step.preparationId&&(!preparation||!['understand','imitate'].includes(step.kind)||step.utterance!==preparation.phrase.id||step.choices||step.utterances))throw new Error('Une étape ne correspond pas aux phrases de son unité.');
          });
          supports.forEach(function(support){
            var understood=current.steps.findIndex(function(step){return step.id===support.understoodInStep;}),imitated=current.steps.findIndex(function(step){return step.id===support.imitatedInStep;}),target=current.steps.findIndex(function(step){return step.id===current.unitId+'-understand-'+support.beforeVariantIndex;});
            if(understood<0||imitated!==understood+1||target!==imitated+1||current.steps[understood].kind!=='understand'||current.steps[imitated].kind!=='imitate'||current.steps[understood].preparationId!==support.id||current.steps[imitated].preparationId!==support.id)throw new Error('Une préparation doit précéder sa reprise dans la situation.');
          });
        });
      });
    });return{data:data,phrases:nextMap};
  }
  function getState(){return{ready:!!bundle,pairId:state.pairId,level:state.level,unitId:state.unitId,stepIndex:state.stepIndex,stepCount:unit()?unit().steps.length:0,kind:step()?step().kind:null,phraseIds:bundle&&step()?stepIds():[],hidden:state.hidden,helpRequested:state.helpRequested};}
  function fail(error){stopAudio();$('workspace').hidden=true;$('load-status').textContent='';$('error-box').hidden=false;$('error-text').textContent=error&&error.message||'Le fichier de relecture est indisponible ici.';}
  function initialize(){
    var serial=++loadingSerial;stopAudio();bundle=null;sourceMap=new Map();$('workspace').hidden=true;$('error-box').hidden=true;$('load-status').textContent='Chargement de la proposition…';
    var localData=window.MELUNGA_CORRECTIONS_REVIEW;
    var request=localData?Promise.resolve(localData):fetch('../parcours-corriges.json',{credentials:'omit',cache:'no-store'}).then(function(response){if(!response.ok)throw new Error('Le fichier parcours-corriges.json n’est pas disponible. Ouvre cette maquette avec un serveur HTTP.');return response.json();});
    var task=request.then(validate).then(function(validated){
      if(serial!==loadingSerial)return false;bundle=validated.data;sourceMap=validated.phrases;var data=bundle,select=$('pair-select');select.replaceChildren();
      data.pairs.forEach(function(item){var display=labels[item.id],option=node('option','',display[0]+' '+display[1]+(item.nativeLanguage==='zh'?' · 中文读者':''));option.value=item.id;select.append(option);});
      if(!data.pairs.some(function(item){return item.id===state.pairId;}))state.pairId=data.pairs[0].id;
      select.value=state.pairId;renderLevelOptions();renderUnitOptions();resetStep();render();$('load-status').textContent='';$('workspace').hidden=false;return true;
    }).catch(function(error){if(serial===loadingSerial)fail(error);return false;});return task;
  }
  $('pair-select').addEventListener('change',function(){try{select(this.value,state.level);}catch(error){fail(error);}});
  $('level-select').addEventListener('change',function(){try{select(state.pairId,Number(this.value));}catch(error){fail(error);}});
  $('unit-select').addEventListener('change',function(){try{state.unitId=this.value;resetStep();render();}catch(error){fail(error);}});
  $('prev-step').addEventListener('click',function(){move(-1);});$('next-step').addEventListener('click',function(){move(1);});
  $('recall-toggle').addEventListener('click',function(){if(!canRecall())return;state.hidden=!state.hidden;state.helpRequested=!state.hidden;render();});
  $('retry-load').addEventListener('click',function(){window.ProgressionCorrections.ready=initialize();});
  document.addEventListener('visibilitychange',function(){if(document.hidden)stopAudio();});
  window.addEventListener('pagehide',stopAudio);
  window.ProgressionCorrections={getState:getState,select:select,next:function(){move(1);},previous:function(){move(-1);},reveal:function(){if(canRecall()){state.hidden=false;state.helpRequested=true;render();}},speak:function(){if(!state.hidden&&stepIds().length)speakPhrase(stepIds()[0]);},ready:null};
  window.ProgressionCorrections.ready=initialize();
})();
