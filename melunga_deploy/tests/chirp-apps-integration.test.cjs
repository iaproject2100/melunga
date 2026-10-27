/* Local VM integration only. Catalogue metadata and media are explicitly mocked;
 * no provider, network audio, physical device or listening assessment is used. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const crypto=require('node:crypto'),{execFileSync}=require('node:child_process'),{test}=require('node:test');
const ROOT=path.resolve(__dirname,'../..'),WEB=path.join(ROOT,'melunga_deploy'),BASE='4fafe31';
const read=file=>fs.readFileSync(path.join(WEB,file),'utf8');
const classic=read('app.html'),modern=read('maquette-guidee.js');
const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const LANGUAGES=['fr','en','es','it','zh','ja','ko'];
const SELECTION_VERSION='kartech-2026-10-27';
const APPROVED={fr:'fr-FR-Chirp3-HD-Aoede',en:'en-GB-Chirp3-HD-Kore',es:'es-ES-Chirp3-HD-Kore',it:'it-IT-Chirp3-HD-Charon',zh:'cmn-CN-Chirp3-HD-Kore',ja:'ja-JP-Chirp3-HD-Kore',ko:'ko-KR-Chirp3-HD-Kore'};
function fn(source,name){
 const match=new RegExp('\\b(?:async\\s+)?function\\s+'+name+'\\s*\\([^)]*\\)\\s*\\{').exec(source);assert.ok(match,name);
 let i=match.index+match[0].length-1,depth=0,quote=null,escape=false,line=false,block=false;
 for(;i<source.length;i++){const c=source[i],next=source[i+1];if(line){if(c==='\n')line=false;continue;}if(block){if(c==='*'&&next==='/'){block=false;i++;}continue;}if(quote){if(escape)escape=false;else if(c==='\\')escape=true;else if(c===quote)quote=null;continue;}if(c==='/'&&next==='/'){line=true;i++;continue;}if(c==='/'&&next==='*'){block=true;i++;continue;}if(['"',"'",'`'].includes(c)){quote=c;continue;}if(c==='{')depth++;else if(c==='}'&&!--depth)return source.slice(match.index,i+1);}
 throw Error('Unclosed '+name);
}
function catalogue(){
 const codes={fr:'fr-FR',en:'en-GB',es:'es-ES',it:'it-IT',zh:'cmn-CN',ja:'ja-JP',ko:'ko-KR'};
 return{version:1,previewOnly:true,source:'google-voices-list',selectionVersion:SELECTION_VERSION,verifiedAt:new Date(Date.now()-1000).toISOString(),expiresAt:new Date(Date.now()+600000).toISOString(),languages:Object.fromEntries(LANGUAGES.map(language=>{
  const code=codes[language],names=language==='fr'?[['Kore','FEMALE'],['Charon','MALE'],['Aoede','FEMALE']]:[['Aoede','FEMALE'],['Charon','MALE'],['Kore','FEMALE']];
  const chirp=names.map(([name,gender])=>({name:code+'-Chirp3-HD-'+name,languageCode:code,gender,engine:'chirp3',rateMode:'client'}));
  return[language,{language,available:true,waveNet:{name:code+'-Wavenet-A',languageCode:code,gender:'FEMALE',engine:'wavenet',rateMode:'server'},chirp,defaultVoice:chirp.find(voice=>voice.name===APPROVED[language])}];
 }))};
}
class Node{
 constructor(){this.childNodes=[];this.textContent='';this.title='';this.style={};this.dataset={};this.attributes=new Map();this.values=new Set();this.classList={toggle:(name,on)=>{if(on===undefined)on=!this.values.has(name);on?this.values.add(name):this.values.delete(name);},remove:name=>this.values.delete(name),contains:name=>this.values.has(name)};}
 setAttribute(name,value){this.attributes.set(name,String(value));}removeAttribute(name){this.attributes.delete(name);}
 replaceChildren(...options){this.options=options;this._value=options[0]?.value||'';}
 get value(){return this._value||'';}set value(value){this._value=String(value);}
}
async function context({failure=false,catalogueData=null}={}){
 const nodes=new Map(),storage=new Map(),events=new Map(),plays=[],speech=[],fetches=[];
 const get=id=>{if(!nodes.has(id))nodes.set(id,new Node());return nodes.get(id);};
 let ctx;
 const sandbox={console,URL,URLSearchParams,Promise,Date,Object,Map,Set,Error,setTimeout,clearTimeout,
  location:{protocol:'https:',hostname:'deploy-preview-1--chic-dragon-e2baf2.netlify.app',href:'https://deploy-preview-1--chic-dragon-e2baf2.netlify.app/app.html',origin:'https://deploy-preview-1--chic-dragon-e2baf2.netlify.app'},
  localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,String(value))},
  document:{hidden:false,getElementById:get,addEventListener:(name,callback)=>events.set('document:'+name,callback)},
  addEventListener:(name,callback)=>events.set(name,callback),
  fetch:async url=>{fetches.push(url);const request=new URL(url,'https://fixture.test');assert.equal(request.pathname,'/.netlify/functions/tts');assert.equal(request.searchParams.get('catalog'),'chirp3');assert.equal(request.searchParams.get('selectionVersion'),SELECTION_VERSION);assert.deepEqual([...request.searchParams.keys()].sort(),['catalog','selectionVersion']);if(failure)throw Error('fixture catalogue unavailable');return{ok:true,json:async()=>catalogueData||catalogue()};},
  Audio:class{constructor(){this.src='';this.playbackRate=1;}play(){plays.push({source:this.src,playbackRate:this.playbackRate,preservesPitch:this.preservesPitch});return Promise.resolve();}pause(){}load(){}removeAttribute(name){if(name==='src')this.src='';}},
  SpeechSynthesisUtterance:class{constructor(text){this.text=text;}},
  speechSynthesis:{getVoices:()=>[{name:'French fixture',lang:'fr-FR',voiceURI:'fixture-fr'},{name:'Spanish fixture',lang:'es-ES',voiceURI:'fixture-es'}],cancel(){},speak(utterance){speech.push(utterance);utterance.onstart?.();}},
  Option:class{constructor(text,value){this.text=String(text);this.value=String(value);}},
  MelungaCourseI18n:{t:(locale,source)=>locale+':'+source}};
 ctx=vm.createContext(sandbox);ctx.window=ctx;
 vm.runInContext(read('voice-selection.js'),ctx);vm.runInContext(read('lesson-audio.js'),ctx);
 await ctx.MelungaVoiceSelection.ready().catch(()=>{});
 return{ctx,get,events,plays,speech,fetches,storage};
}
function installClassic(f){
 const c=f.ctx;c.lang='es';c.nat='fr';c.gender='female';c.pool=[{t:'Exact study payload.'}];c.idx=0;
 c.T=key=>key==='audioUnavailable'?'audio-unavailable':key;c.lsSet=(key,value)=>c.localStorage.setItem(key,value);
 const start=classic.indexOf('var slowMode=false, classicAudioPlayer='),end=classic.indexOf("\nwindow.addEventListener('load',function(){",start);assert.ok(start>=0&&end>start);
 vm.runInContext([fn(classic,'clean'),fn(classic,'voiceTextOf'),fn(classic,'updateVoiceLabel'),fn(classic,'applyVoiceUI'),fn(classic,'setVoice'),classic.slice(start,end)].join('\n'),c);
}
function installModern(f){
 const c=f.ctx;c.state={screen:'lesson',pair:{id:'fr-es',studyLanguage:'es',nativeLanguage:'fr'},speechRate:.85,revealed:false,voiceChoices:new Map()};
 c.ui={voice:f.get('modernVoice'),speed:f.get('modernSpeed')};c.voiceSelection=c.MelungaVoiceSelection;
 c.tr=source=>'fr:'+source;c.currentPhrase=()=>({study:'Exact modern payload.',contentType:'utterance'});
 c.canShowCurrent=()=>true;c.currentStep=()=>({kind:'understand'});c.isTemplate=()=>false;c.isMasked=()=>false;c.renderStep=()=>{};
 c.setStatus=message=>{c.lastStatus=message;};c.setAudioPlaying=()=>{};
 const start=modern.indexOf('  const lessonAudio = '),end=modern.indexOf('\n  });',start)+6;assert.ok(start>=0&&end>start);
 vm.runInContext(modern.slice(start,end).replace('const lessonAudio =','globalThis.lessonAudio ='),c);
 c.stopAudio=()=>c.lessonAudio.stop();
 vm.runInContext(fn(modern,'fillVoices')+'\n'+fn(modern,'speak'),c);
}

test('classic source literals, eight account/payment functions, rights and reviewed content stay exact',()=>{
 const before=execFileSync('git',['show',BASE+':melunga_deploy/app.html'],{cwd:ROOT,maxBuffer:40*1024*1024}).toString();
 for(const name of ['DECKS','PEDAGOGY_FAMILIES']){const prefix='var '+name+' = ';const a=classic.split('\n').filter(line=>line.startsWith(prefix)),b=before.split('\n').filter(line=>line.startsWith(prefix));assert.equal(a.length,1);assert.equal(b.length,1);assert.equal(sha(a[0]),sha(b[0]),'whole original literal '+name);}
 for(const name of ['doLogout','loadPricing','rememberPermanentLogout','checkPaidStatus','unlock','loginExisting','showPaywall','hidePaywall','isFreeCard','isLockedMode','activeDeck','guidedActiveDeck','guidedPool','meaningOf','phonOf','clean'])assert.equal(fn(classic,name),fn(before,name),name);
 const access=read('course-access.js'), delegatedRights="await (window.MelungaCourseData?.fetch || fetch)('content/course-access.json',";
 assert.equal(access.split(delegatedRights).length,2,'exactly one delegated static rights request');
 assert.equal(access.replace(delegatedRights,"await fetch('content/course-access.json',"),execFileSync('git',['show',BASE+':melunga_deploy/course-access.js'],{cwd:ROOT}).toString(),'all access logic preserved after one read-only fetch delegation');
 execFileSync('git',['diff','--exit-code',BASE,'--','melunga_deploy/content/niveaux-progressifs','melunga_deploy/content/native-catalogue','melunga_deploy/content/course-access.json','melunga_deploy/store-billing.js'],{cwd:ROOT,stdio:'pipe'});
 const oldModern=execFileSync('git',['show',BASE+':melunga_deploy/maquette-guidee.js'],{cwd:ROOT}).toString();
 for(const name of ['collectLevelProgressIds','levelProgress','loadKnownCards','saveKnownCard','saveCardDecision','markKnown','markForReview'])assert.equal(fn(modern,name),fn(oldModern,name),name);
 assert.doesNotMatch(classic,/translate\.google\.com\/translate_tts|api\.streamelements\.com|function trySE\(|function fallback\(/,'no unrequested third-party studied-speech route');
});

test('both HTML shells load selection before the shared player and current controller; classic loads the same modules',()=>{
 for(const file of ['parcours-niveaux.html','maquette-guidee.html']){const source=read(file),selection=source.indexOf('voice-selection.js?v=2'),player=source.indexOf('lesson-audio.js?v=3'),controller=source.indexOf('maquette-guidee.js?v=37');assert.ok(selection>0&&selection<player&&player<controller);assert.match(source,/course-i18n\.js\?v=5/);assert.match(source,/course-startup\.css\?v=1/);assert.match(source,/course-ambiences\.css\?v=1/);}
 assert.match(classic,/course-i18n\.js\?v=4/);assert.doesNotMatch(classic,/course-startup\.css/);
 assert.ok(classic.indexOf('voice-selection.js?v=2')<classic.indexOf('lesson-audio.js?v=3'));
 assert.ok(classic.indexOf('lesson-audio.js?v=3')<classic.indexOf('var DECKS = '));
});

test('seven fresh profiles use the exact approved defaults synchronously in both apps without writing a local favourite',async t=>{
 for(const language of LANGUAGES)await t.test(language,async()=>{
  const f=await context();installClassic(f);const c=f.ctx;c.lang=language;c.nat=language==='fr'?'zh':'fr';
  const initialFetches=f.fetches.length;assert.equal(f.storage.size,0,'fresh profile has no stored choice');assert.equal(c.MelungaVoiceSelection.getSelected(language),null);
  const approved=c.MelungaVoiceSelection.getSnapshot(language);assert.equal(approved.voice.name,APPROVED[language]);assert.equal(approved.defaultVoice.name,APPROVED[language]);assert.equal(approved.approvedDefault.name,APPROVED[language]);assert.equal(approved.usesApprovedDefault,true);assert.equal(approved.provisional,false);assert.equal(approved.sourceMetadata.selectionVersion,SELECTION_VERSION);assert.equal(approved.sourceMetadata.choiceSource,'approved-default');assert.equal(approved.voice.gender,language==='it'?'MALE':'FEMALE');assert.notEqual(c.MelungaVoiceSelection.getChoices(language).find(voice=>voice.engine==='chirp3').name,APPROVED[language],'fixture order intentionally differs from the approved default');
  c.applyVoiceUI();assert.equal(f.get(language==='it'?'vM':'vF').classList.contains('on'),true,'classic control reflects the approved voice gender');
  c.speak('Exact classic <'+language+'> payload.',f.get('listen'));
  assert.equal(f.plays.length,1,'play starts inside the gesture');const classicRequest=new URL(f.plays[0].source,'https://fixture.test');
  assert.equal(classicRequest.pathname,'/.netlify/functions/tts');assert.equal(classicRequest.searchParams.get('voice'),APPROVED[language]);assert.equal(classicRequest.searchParams.get('text'),'Exact classic <'+language+'> payload.');assert.equal(classicRequest.searchParams.get('rate'),'1');
  assert.equal(c.MelungaVoiceSelection.getSelected(language),null,'approved default is not a personal favourite');assert.equal(f.storage.size,0,'classic playback does not write local storage');
  c.stopClassicAudio();installModern(f);c.state.pair={id:c.nat+'-'+language,studyLanguage:language,nativeLanguage:c.nat};c.fillVoices();assert.equal(c.ui.voice.value,APPROVED[language],'modern menu shows the exact approved default');c.speak(true);
  assert.equal(f.plays.length,2);const modernRequest=new URL(f.plays[1].source,'https://fixture.test');assert.equal(modernRequest.searchParams.get('text'),'Exact modern payload.');assert.equal(modernRequest.searchParams.get('voice'),APPROVED[language]);assert.equal(modernRequest.searchParams.get('voice'),classicRequest.searchParams.get('voice'));assert.equal(f.plays[1].playbackRate,.85);assert.equal(modernRequest.searchParams.get('rate'),'1');assert.equal(f.fetches.length,initialFetches,'no catalogue wait or fetch in a successful play gesture');assert.equal(f.storage.size,0,'neither app silently stores an approved default');assert.equal(c.MelungaVoiceSelection.getSelected(language),null);c.lessonAudio.stop();
 });
});

test('classic male control saves a real male Chirp for both apps and preserves the previous .75 primary slow speed exactly',async()=>{
 const f=await context();installClassic(f);const c=f.ctx;
 c.setVoice('male',f.get('vM'));const chosen=c.MelungaVoiceSelection.getSelected('es');assert.equal(chosen.gender,'MALE');assert.equal(chosen.engine,'chirp3');assert.equal(c.MelungaVoiceSelection.getSnapshot('es').usesApprovedDefault,false);assert.equal(c.MelungaVoiceSelection.getSnapshot('es').sourceMetadata.choiceSource,'local');assert.match(new URL(f.plays.at(-1).source,'https://fixture.test').searchParams.get('voice'),/-Charon$/);
 c.setSpeed(true);assert.equal(f.plays.at(-1).playbackRate,.75);assert.equal(new URL(f.plays.at(-1).source,'https://fixture.test').searchParams.get('rate'),'1');assert.equal(f.plays.at(-1).preservesPitch,true);
 c.stopClassicAudio();installModern(f);c.fillVoices();assert.equal(c.ui.voice.value,chosen.name);assert.equal(c.ui.voice.options.length,3);assert.ok(c.ui.voice.options.every(option=>option.value.includes('-Chirp3-HD-')));c.speak(true);assert.equal(new URL(f.plays.at(-1).source,'https://fixture.test').searchParams.get('voice'),chosen.name);c.lessonAudio.stop();
});

test('explicit comparator choice is read by both apps, without fabricated catalogue options',async()=>{
 const f=await context();installClassic(f);const c=f.ctx,reference=c.MelungaVoiceSelection.getChoices('es').find(voice=>voice.engine==='wavenet');assert.ok(c.MelungaVoiceSelection.setVoice('es',reference.name));
 c.speak('Whole comparator-shared source.');assert.equal(new URL(f.plays.at(-1).source,'https://fixture.test').searchParams.get('voice'),reference.name);c.stopClassicAudio();installModern(f);c.fillVoices();assert.equal(c.ui.voice.value,reference.name);assert.equal(c.ui.voice.options.length,4,'an explicitly chosen reference remains visible alongside the three Chirp candidates');c.lessonAudio.stop();
});

test('failed catalogue is explicit, never waits to play, and the only fallback has the exact studied language',async()=>{
 const f=await context({failure:true});installClassic(f);const c=f.ctx;c.lang='es';c.nat='fr';c.speak('La misma frase.');assert.equal(f.plays.length,0);assert.equal(f.speech.length,1);assert.equal(f.speech[0].text,'La misma frase.');assert.equal(f.speech[0].lang,'es-ES');c.stopClassicAudio();
});


test('final failure in both apps says Audio indisponible even while catalogue refresh retries in background',async()=>{
 const f=await context({failure:true});installClassic(f);const c=f.ctx;c.speechSynthesis.getVoices=()=>[{name:'French only',lang:'fr-FR',voiceURI:'fixture-fr'}];c.lang='es';c.nat='fr';c.speak('Exact classic failure.');assert.equal(f.plays.length,0);assert.equal(f.speech.length,0);assert.equal(f.get('heard').textContent,'fr:Audio indisponible. Réessaie.');c.stopClassicAudio();await c.MelungaVoiceSelection.ready().catch(()=>{});installModern(f);c.speak(true);assert.equal(c.lastStatus,'Audio indisponible. Réessaie.');assert.equal(f.plays.length,0);assert.equal(f.speech.length,0);c.lessonAudio.stop();
});


test('a missing verified default never falls back to the first candidate in either app',async()=>{
 const data=catalogue();data.languages.es.defaultVoice=null;
 const f=await context({catalogueData:data});installClassic(f);const c=f.ctx;
 assert.equal(c.MelungaVoiceSelection.getVoice('es'),null);assert.equal(c.MelungaVoiceSelection.getSnapshot('es').approvedDefault,null);assert.equal(c.MelungaVoiceSelection.getSnapshot('es').usesApprovedDefault,false);
 c.speak('No unapproved first-candidate fallback.');assert.equal(f.plays.length,0);assert.equal(f.speech.length,0);c.stopClassicAudio();
 installModern(f);c.fillVoices();assert.equal(c.ui.voice.value,'');c.speak(true);assert.equal(f.plays.length,0);assert.equal(f.speech.length,0);assert.equal(f.storage.size,0);c.lessonAudio.stop();
});
