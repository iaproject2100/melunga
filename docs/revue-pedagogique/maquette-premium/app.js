(function () {
  'use strict';
  const demo = window.PREMIUM_DEMO;
  const $ = id => document.getElementById(id);
  const pairSelect = $('pairSelect');
  const surface = $('surfaceSelect');
  const offer = $('offerPanel');
  let turn = 0;
  let audioTimer;
  window.demoEvents = [];
  function event(name,details) { window.demoEvents.push({name,...details}); }
  function pair() { return demo.pairs.find(p => p.id === pairSelect.value) || demo.pairs[0]; }
  function set(id,text) { $(id).textContent = text || ''; }
  function stopAudio() { if (window.speechSynthesis) window.speechSynthesis.cancel(); }
  function listen(item,button) {
    const p = pair();
    event('preview_audio',{pair:p.id,turn:item.turnIndex});
    if (!window.speechSynthesis || typeof SpeechSynthesisUtterance !== 'function') {
      set('audioStatus','L’audio n’est pas disponible dans ce navigateur.');
      clearTimeout(audioTimer);audioTimer=setTimeout(()=>set('audioStatus',''),4500);return;
    }
    stopAudio();
    const utterance = new SpeechSynthesisUtterance(item.study);
    utterance.lang = {fr:'fr-FR',en:'en-GB',es:'es-ES',zh:'zh-CN',it:'it-IT',ja:'ja-JP',ko:'ko-KR'}[p.studyCode];
    utterance.rate = .85;
    utterance.onerror=()=>{
      set('audioStatus','La lecture audio n’est pas disponible dans ce navigateur.');
      clearTimeout(audioTimer);audioTimer=setTimeout(()=>set('audioStatus',''),4500);
    };
    window.speechSynthesis.speak(utterance);
  }
  function renderTurn() {
    const item = pair().preview[turn];
    set('previewRole',item.roleInterface || item.role);
    set('previewStudy',item.study);
    set('previewReading',item.reading);
    $('previewReading').hidden=!item.reading;
    set('previewPhon',item.phon);
    set('previewNative',item.native);
    $('previewStudy').lang=pair().studyCode;
    $('previewNative').lang=pair().nativeCode;
    $('receivedTab').setAttribute('aria-pressed',String(turn===0));
    $('replyTab').setAttribute('aria-pressed',String(turn===1));
  }
  function renderFree() {
    const root=$('freeDialogue');root.replaceChildren();
    pair().l1Dialogue.turns.forEach(item=>{
      const article=document.createElement('article');article.className='free-turn';
      for(const [key,className] of [['roleInterface','turn-role'],['study','turn-study'],['reading','turn-reading'],['phon','turn-phon'],['native','turn-native']]){
        const text=key==='roleInterface'?(item.roleInterface||item.role):item[key];
        if(!text)continue;
        const element=document.createElement('p');element.className=className;element.textContent=text;
        if(key==='study')element.lang=pair().studyCode;
        if(key==='native')element.lang=pair().nativeCode;
        article.append(element);
      }
      const audio=document.createElement('button');audio.type='button';audio.className='listen-button';
      audio.innerHTML='<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7Z" fill="currentColor"/></svg>Écouter';
      audio.addEventListener('click',()=>listen(item,audio));article.append(audio);root.append(article);
    });
  }
  function render() {
    const p=pair();stopAudio();turn=0;
    set('knownStudy',p.l1.study);set('knownNative',p.l1.native);
    $('knownStudy').lang=p.studyCode;$('knownNative').lang=p.nativeCode;
    set('readerNote','Aides et traduction : '+p.readerLabel.toLowerCase()+'.');
    set('situation',p.interfaceSituation||p.l2Situation);
    set('sceneContext',p.previewContext ? 'Pour commencer : « '+p.previewContext.native+' »' : '');
    renderTurn();renderFree();renderOffer();
  }
  function renderOffer() {
    const native=surface.value==='native';
    $('webOffer').hidden=native;$('nativeOffer').hidden=!native;
    set('monthlyPrice',demo.webPricing.monthlyDisplay);set('annualPrice',demo.webPricing.annualDisplay);
    set('marketNote',native?'Prix de la boutique non simulé dans cette maquette.':'Exemple de prix : France · EUR');
    set('demoChoice','');
    offer.querySelectorAll('[data-plan]').forEach(b=>b.setAttribute('aria-pressed','false'));
  }
  function openOffer() {
    stopAudio();renderOffer();offer.showModal();
    event('premium_offer_viewed',{pair:pair().id,surface:surface.value});
    $('offerBack').focus();
  }
  function closeOffer() { if(offer.open)offer.close();$('premiumOpen').focus({preventScroll:true}); }
  function returnFree() {
    stopAudio();if(offer.open)offer.close();
    $('previewPage').hidden=true;$('freePage').hidden=false;
    event('continue_free',{pair:pair().id});window.scrollTo(0,0);$('returnPreview').focus({preventScroll:true});
  }
  demo.pairs.forEach(p=>{const option=document.createElement('option');option.value=p.id;option.textContent=p.label;pairSelect.append(option);});
  pairSelect.value=new URLSearchParams(location.search).get('pair')||'fr-es';
  if(!pairSelect.value)pairSelect.value=demo.pairs[0].id;
  if(new URLSearchParams(location.search).get('surface')==='native')surface.value='native';
  pairSelect.addEventListener('change',render);
  surface.addEventListener('change',renderOffer);
  $('receivedTab').addEventListener('click',()=>{stopAudio();turn=0;renderTurn();});
  $('replyTab').addEventListener('click',()=>{stopAudio();turn=1;renderTurn();event('preview_reply_viewed',{pair:pair().id});});
  $('previewListen').addEventListener('click',()=>listen(pair().preview[turn],$('previewListen')));
  $('premiumOpen').addEventListener('click',openOffer);
  $('offerBack').addEventListener('click',closeOffer);
  offer.addEventListener('cancel',e=>{e.preventDefault();closeOffer();});
  $('continueFree').addEventListener('click',returnFree);$('offerFree').addEventListener('click',returnFree);
  $('returnPreview').addEventListener('click',()=>{$('previewPage').hidden=false;$('freePage').hidden=true;window.scrollTo(0,0);$('premiumOpen').focus({preventScroll:true});});
  offer.querySelectorAll('[data-plan]').forEach(button=>button.addEventListener('click',()=>{
    const plan=button.dataset.plan;
    offer.querySelectorAll('[data-plan]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    set('demoChoice',(plan==='annual'?'Accès de 365 jours':'Accès de 30 jours')+' sélectionné pour l’essai. Aucun paiement n’est lancé.');
    event('demo_plan_selected',{pair:pair().id,plan,surface:'web'});
  }));
  $('storeContinue').addEventListener('click',()=>{
    set('demoChoice','Aucun achat dans cette maquette. Le prix, le renouvellement et une éventuelle offre d’essai doivent être confirmés par Google Play.');
    event('demo_store_selected',{pair:pair().id,surface:'native'});
  });
  window.addEventListener('pagehide',stopAudio);
  render();
})();
