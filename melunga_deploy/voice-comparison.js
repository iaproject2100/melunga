/* A named-voice comparison: HTML media only, no system-voice fallback. */
(() => {
  'use strict';
  const samples = Object.freeze([
    {language:'fr',name:'Français',flag:'🇫🇷',text:'Vous pouvez parler plus lentement ?',meaning:'Vous pouvez parler plus lentement ?'},
    {language:'en',name:'Anglais',flag:'🇺🇸',text:'Can you speak more slowly?',meaning:'Tu peux parler plus lentement ?'},
    {language:'es',name:'Espagnol',flag:'🇪🇸',text:'Más despacio, por favor.',meaning:'Plus lentement, s’il vous plaît.'},
    {language:'zh',name:'Chinois',flag:'🇨🇳',text:'请慢慢说',meaning:'Parlez lentement, s’il vous plaît.'},
    {language:'it',name:'Italien',flag:'🇮🇹',text:'Più lentamente, per favore.',meaning:'Plus lentement, s’il vous plaît.'},
    {language:'ja',name:'Japonais',flag:'🇯🇵',text:'もっとゆっくり話してくれますか？',meaning:'Tu peux parler plus lentement ?'},
    {language:'ko',name:'Coréen',flag:'🇰🇷',text:'더 천천히 말해 줄 수 있어요?',meaning:'Tu peux parler plus lentement ?'}
  ]);
  const selection = window.MelungaVoiceSelection;
  const byId = id => document.getElementById(id);
  const ui = {languages:byId('vcLanguages'),status:byId('vcCatalogueStatus'),retry:byId('vcRetryCatalogue'),count:byId('vcChoiceCount'),copy:byId('vcCopy'),download:byId('vcDownload'),exportStatus:byId('vcExportStatus'),panel:byId('vcPlayerPanel'),stop:byId('vcStop'),nowLanguage:byId('vcNowLanguage'),nowVoice:byId('vcNowVoice')};
  const cards = new Map();
  const playIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="m9 5 11 7-11 7V5Z"/></svg>';
  let catalogue = null, loadingGeneration = 0, audioGeneration = 0, active = null;
  function element(tag,className,value){const node=document.createElement(tag);if(className)node.className=className;if(value!==undefined)node.textContent=value;return node;}
  function voiceName(choice){return choice.engine==='wavenet'?'Voix actuelle':choice.name.split(/-Chirp3-HD-/i).pop();}
  function voiceDescription(choice){return (choice.engine==='wavenet'?'WaveNet':'Chirp 3 HD')+' · '+voiceName(choice);}
  function gender(choice){return choice.gender==='FEMALE'?'Voix féminine':choice.gender==='MALE'?'Voix masculine':'Genre non indiqué';}
  function selected(language){return selection?.getSelected(language)||null;}
  function setListenLabel(button,source,choice,playing=false){button.replaceChildren();button.insertAdjacentHTML('afterbegin',playIcon);button.append(document.createTextNode(playing?' Arrêter':' '+(button.classList.contains('is-error')?'Réessayer':'Écouter')));button.setAttribute('aria-label',(playing?'Arrêter':'Écouter')+' · '+source.name+' · '+voiceDescription(choice));}
  function setBusy(request,playing){if(!request)return;request.button.classList.toggle('is-playing',playing);if(playing)request.button.setAttribute('aria-busy','true');else request.button.removeAttribute('aria-busy');setListenLabel(request.button,request.sample,request.choice,playing);}
  function clearTimer(request){if(request&&request.timer!==null){clearTimeout(request.timer);request.timer=null;}}
  function stopPlayback(hide=false){
    ++audioGeneration;const previous=active;active=null;
    if(previous){clearTimer(previous);previous.audio.onplaying=previous.audio.onpause=previous.audio.onended=previous.audio.onerror=previous.audio.onwaiting=previous.audio.onstalled=null;try{previous.audio.pause();previous.audio.removeAttribute('src');previous.audio.load();}catch(_){}setBusy(previous,false);cards.get(previous.sample.language).status.textContent='Écoute arrêtée.';}
    if(hide){ui.panel.hidden=true;document.body.classList.remove('vc-has-player');}
  }
  function unavailable(request){if(active!==request||request.token!==audioGeneration)return;stopPlayback(true);request.button.classList.add('is-error');setListenLabel(request.button,request.sample,request.choice);cards.get(request.sample.language).status.textContent='Audio indisponible. Réessaie.';}
  function play(sample,choice,button){
    if(active?.button===button&&!active.audio.paused){stopPlayback();cards.get(sample.language).status.textContent='Écoute arrêtée.';return;}
    stopPlayback();button.classList.remove('is-error');
    const audio=document.createElement('audio');audio.id='audioComparison';audio.controls=true;audio.preload='none';audio.setAttribute('playsinline','');audio.setAttribute('aria-label',sample.name+' · '+voiceDescription(choice));audio.muted=false;audio.volume=1;audio.playbackRate=1;
    byId('audioComparison').replaceWith(audio);
    const request={audio,button,sample,choice,token:audioGeneration,timer:null};active=request;
    const current=()=>active===request&&request.token===audioGeneration;
    const wait=()=>{if(!current())return;clearTimer(request);request.timer=setTimeout(()=>unavailable(request),20000);};
    audio.onplaying=()=>{if(!current())return;clearTimer(request);button.classList.remove('is-error');setBusy(request,true);cards.get(sample.language).status.textContent='Écoute en cours · '+voiceDescription(choice)+'.';};
    audio.onpause=()=>{if(!current())return;clearTimer(request);setBusy(request,false);if(!audio.ended)cards.get(sample.language).status.textContent='Lecture en pause.';};
    audio.onended=()=>{if(!current())return;clearTimer(request);setBusy(request,false);cards.get(sample.language).status.textContent='Écoute terminée.';};
    audio.onerror=()=>unavailable(request);audio.onwaiting=audio.onstalled=wait;
    ui.nowLanguage.textContent=sample.name;ui.nowVoice.textContent=voiceDescription(choice)+' · '+gender(choice).toLowerCase();ui.panel.hidden=false;document.body.classList.add('vc-has-player');
    cards.get(sample.language).status.textContent='Chargement de la voix…';setBusy(request,true);
    // Preserve the click/keyboard activation: do not await fetch/catalogue here.
    audio.src='/.netlify/functions/tts?'+new URLSearchParams({voice:choice.name,lang:choice.languageCode,rate:'1',text:sample.text}).toString();
    wait();try{const playback=audio.play();playback?.catch(()=>unavailable(request));}catch(_){unavailable(request);}
  }
  function buildCards(){
    for(const sample of samples){const card=element('section','vc-language');card.id='lang-'+sample.language;card.dataset.language=sample.language;
      const head=element('header','vc-language-head'),title=element('h2');title.id='title-'+sample.language;const flag=element('span','vc-flag',sample.flag);flag.setAttribute('aria-hidden','true');title.append(flag,document.createTextNode(sample.name));const state=element('span','vc-choice-state','Aucun choix');head.append(title,state);card.setAttribute('aria-labelledby',title.id);
      const phrase=element('div','vc-sample'),study=element('p','vc-study',sample.text),meaning=element('p','vc-meaning',sample.meaning);study.lang=sample.language;meaning.lang='fr';phrase.append(study,meaning);
      const options=element('fieldset','vc-voices'),legend=element('legend','vc-sr-only','Voix pour '+sample.name.toLowerCase());options.append(legend,element('p','vc-loading','Chargement des voix…'));
      const bottom=element('div','vc-card-bottom'),status=element('p','vc-status vc-card-status'),clear=element('button','vc-clear','Effacer mon choix');status.setAttribute('role','status');status.setAttribute('aria-live','polite');clear.type='button';clear.dataset.clear=sample.language;clear.disabled=true;clear.addEventListener('click',()=>{if(selection?.clearVoice(sample.language)){status.textContent='Choix effacé.';renderFavorites();}else status.textContent='Impossible d’effacer le choix. Réessaie.';});bottom.append(status,clear);card.append(head,phrase,options,bottom);cards.set(sample.language,{sample,card,state,options,status,clear});ui.languages.append(card);
    }
  }
  function renderVoices(){
    for(const {sample,options,status} of cards.values()){
      options.querySelectorAll(':scope > :not(legend)').forEach(node=>node.remove());
      const choices=selection.getChoices(sample.language),row=catalogue.languages[sample.language];
      if(!choices.length){options.append(element('p','vc-loading vc-error','Ces voix ne sont pas disponibles dans le catalogue actuel.'));continue;}
      for(const choice of choices){const option=element('div','vc-option');option.dataset.voice=choice.name;option.title=choice.name;
        const engine=element('p','vc-engine'+(choice.engine==='wavenet'?' is-current':''),choice.engine==='wavenet'?'Actuelle · WaveNet':'Chirp 3 HD');const info=element('div','vc-voice-info');info.append(element('h3','vc-voice-name',voiceName(choice)),element('p','vc-gender',gender(choice)));
        const listen=element('button','vc-button vc-listen');listen.type='button';listen.dataset.listen='';listen.dataset.language=sample.language;listen.dataset.voice=choice.name;setListenLabel(listen,sample,choice);listen.addEventListener('click',()=>play(sample,choice,listen));
        const favorite=element('label','vc-favorite'),radio=element('input');radio.type='radio';radio.name='favorite-'+sample.language;radio.value=choice.name;radio.dataset.select='';radio.dataset.language=sample.language;radio.dataset.voice=choice.name;radio.setAttribute('aria-label','Choisir '+voiceDescription(choice)+' pour '+sample.name.toLowerCase());favorite.append(radio,document.createTextNode('Ma préférée'));radio.addEventListener('change',()=>{if(selection.setVoice(sample.language,choice.name)){status.textContent='Choix enregistré sur cet appareil.';ui.exportStatus.textContent='';}else status.textContent='Impossible d’enregistrer le choix. Réessaie.';renderFavorites();});option.append(engine,info,listen,favorite);options.append(option);
      }
      if(!row?.available)status.textContent='Les trois voix Chirp ne sont pas disponibles pour cette langue.';
    }
    renderFavorites();
  }
  function renderFavorites(){
    let count=0;
    for(const [language,card] of cards){const favorite=selected(language);if(favorite)count++;card.state.textContent=favorite?'Préférée : '+voiceName(favorite):'Aucun choix';card.clear.disabled=!favorite;
      card.options.querySelectorAll('[data-select]').forEach(radio=>{const chosen=favorite?.name===radio.value;radio.checked=chosen;radio.closest('.vc-option').classList.toggle('is-selected',chosen);});
    }
    ui.count.textContent=count===0?'Aucune langue choisie':count+' langue'+(count>1?'s':'')+' choisie'+(count>1?'s':'')+' sur 7';ui.copy.disabled=ui.download.disabled=count===0;
  }
  async function loadCatalogue(){
    const token=++loadingGeneration;stopPlayback(true);for(const card of cards.values())card.options.querySelectorAll('button,input').forEach(control=>control.disabled=true);ui.retry.disabled=true;ui.retry.hidden=true;ui.status.parentElement.classList.remove('is-error');ui.status.textContent='Chargement du catalogue des voix…';ui.languages.setAttribute('aria-busy','true');
    try{
      if(!selection)throw Error('Catalogue module unavailable');await selection.preload();const result=await selection.ready();if(token!==loadingGeneration)return;
      if(result?.source!=='google-voices-list'||result.previewOnly!==true||!result.languages)throw Error('Unverified catalogue');catalogue=result;renderVoices();
      const ready=samples.every(s=>catalogue.languages[s.language]?.available&&selection.getChoices(s.language).length===4),date=new Date(catalogue.verifiedAt),when=Number.isFinite(date.getTime())?new Intl.DateTimeFormat('fr-FR',{dateStyle:'short',timeStyle:'short'}).format(date):'';
      ui.status.textContent=(ready?'Catalogue Google chargé.':'Une partie du catalogue Google est indisponible.')+(when?' Vérifié le '+when+'.':'');ui.retry.textContent='Actualiser les voix';ui.retry.hidden=false;
    }catch(_){if(token!==loadingGeneration)return;ui.retry.textContent='Réessayer';ui.status.textContent='Le catalogue des voix est indisponible. Réessaie.';ui.status.parentElement.classList.add('is-error');ui.retry.hidden=false;for(const card of cards.values()){card.options.querySelectorAll(':scope > :not(legend)').forEach(node=>node.remove());card.options.append(element('p','vc-loading','Le catalogue doit être chargé pour comparer les voix.'));}renderFavorites();}
    finally{if(token===loadingGeneration){ui.retry.disabled=false;ui.languages.setAttribute('aria-busy','false');}}
  }
  function summary(){
    const lines=['Mes choix de voix Melunga (sur cet appareil) :'];
    for(const sample of samples){const choice=selected(sample.language);lines.push('- '+sample.name+' : '+(choice?voiceDescription(choice)+' · '+gender(choice).toLowerCase()+' ['+choice.name+']':'aucun choix'));}
    lines.push('','Ces préférences ont été choisies dans l’aperçu de comparaison.');return lines.join('\n');
  }
  ui.retry.addEventListener('click',loadCatalogue);ui.stop.addEventListener('click',()=>{const request=active;stopPlayback(true);if(request)cards.get(request.sample.language).status.textContent='Écoute arrêtée.';});
  ui.copy.addEventListener('click',async()=>{try{if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');await navigator.clipboard.writeText(summary());ui.exportStatus.textContent='Récapitulatif copié.';}catch(_){ui.exportStatus.textContent='Copie indisponible. Tu peux télécharger le récapitulatif.';}});
  ui.download.addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([summary()+'\n'],{type:'text/plain;charset=utf-8'})),link=element('a');link.href=url;link.download='melunga-choix-voix.txt';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);ui.exportStatus.textContent='Téléchargement du récapitulatif préparé.';});
  window.addEventListener('pagehide',()=>stopPlayback(true));document.addEventListener('visibilitychange',()=>{if(document.hidden)stopPlayback(true);});document.querySelectorAll('[data-language-jump],#vcLessons,.vc-brand').forEach(link=>link.addEventListener('click',()=>stopPlayback(true)));
  buildCards();selection?.subscribe(renderFavorites);loadCatalogue();
})();
