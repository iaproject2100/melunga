/* Provider/catalogue fixtures only: no assertion of live Google availability. */
'use strict';
const assert = require('node:assert/strict');
const {test} = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../voice-selection.js'), 'utf8');
const NOW = Date.parse('2026-10-27T12:00:00Z');
const STORAGE_KEY = 'melunga-preview-voice-selection-v1';
const SELECTION_VERSION = 'kartech-2026-10-30-de';
const CATALOGUE_PATH = '/.netlify/functions/tts?catalog=chirp3&selectionVersion='+SELECTION_VERSION;
const approved = {
  fr:['fr-FR-Chirp3-HD-Aoede','FEMALE'],en:['en-GB-Chirp3-HD-Kore','FEMALE'],
  es:['es-ES-Chirp3-HD-Kore','FEMALE'],zh:['cmn-CN-Chirp3-HD-Kore','FEMALE'],
  it:['it-IT-Chirp3-HD-Charon','MALE'],ja:['ja-JP-Chirp3-HD-Kore','FEMALE'],ko:['ko-KR-Chirp3-HD-Kore','FEMALE'],
  de:['de-DE-Chirp3-HD-Kore','FEMALE']
};
const definitions = {
  fr:['fr-FR','F'],en:['en-GB','C'],es:['es-ES','F'],zh:['cmn-CN','A'],
  it:['it-IT','E'],ja:['ja-JP','B'],ko:['ko-KR','A'],de:['de-DE','A']
};
const copy = value => JSON.parse(JSON.stringify(value));
function catalogue() {
  return {version:1, source:'google-voices-list', previewOnly:true,selectionVersion:SELECTION_VERSION,
    verifiedAt:new Date(NOW).toISOString(), expiresAt:new Date(NOW+300000).toISOString(),
    languages:Object.fromEntries(Object.entries(definitions).map(([language,[locale,suffix]])=>{
      const chirp=[['Aoede','FEMALE'],['Kore','FEMALE'],['Charon','MALE']].map(([name,gender])=>({
        name:locale+'-Chirp3-HD-'+name,languageCode:locale,gender,engine:'chirp3',rateMode:'client'}));
      return [language,{language,available:true,
        waveNet:{name:locale+'-Wavenet-'+suffix,languageCode:locale,gender:'FEMALE',engine:'wavenet',rateMode:'server'},
        chirp,defaultVoice:chirp.find(voice=>voice.name===approved[language][0])}];
    }))};
}
function fixture({data=catalogue(),storage=new Map(),storageFails=false,networkFails=false,status=200,protocol='https:',hostname='preview.test',native=false,bridgeAbsent=false}={}) {
  const f={calls:[],writes:[],listeners:{},now:NOW,storage,networkFails};
  class FixtureDate extends Date { static now(){return f.now;} }
  const context={URL,Date:FixtureDate,Promise,Object,Set,
    location:{protocol,hostname,origin:protocol+'//'+hostname},
    ...(bridgeAbsent?{}:{Capacitor:{isNativePlatform:()=>native}}),
    localStorage:{getItem:key=>storage.get(key)??null,setItem(key,value){
      if(storageFails)throw new Error('Storage blocked');f.writes.push({key,value});storage.set(key,value);
    }},
    addEventListener:(type,handler)=>{f.listeners[type]=handler;},
    fetch:async(url,options)=>{f.calls.push({url,options});if(f.networkFails)throw new Error('Offline');return {ok:status===200,status,json:async()=>copy(data)};}
  };
  context.window=context;vm.runInNewContext(source,context);
  f.api=context.MelungaVoiceSelection;return f;
}

test('a fresh profile uses all eight exact approved defaults without writing local favourites',async()=>{
  const f=fixture();assert.equal(f.api.getVoice('es'),null);
  const pending=f.api.ready();assert.equal(f.api.ready(),pending);await pending;
  assert.equal(f.calls.length,1);assert.equal(f.calls[0].url,CATALOGUE_PATH);
  assert.equal(f.api.state().status,'ready');
  for(const language of Object.keys(definitions)){
    const snapshot=f.api.getSnapshot(language);
    assert.equal(snapshot.choices.length,4);assert.equal(snapshot.selected,null);assert.equal(snapshot.provisional,false);
    assert.equal(snapshot.voice.name,approved[language][0]);assert.equal(snapshot.voice.gender,approved[language][1]);
    assert.equal(snapshot.usesApprovedDefault,true);assert.equal(snapshot.approvedDefault.name,approved[language][0]);
    assert.equal(snapshot.defaultVoice.name,approved[language][0]);
    assert.equal(snapshot.sourceMetadata.selectionVersion,SELECTION_VERSION);assert.equal(snapshot.sourceMetadata.choiceSource,'approved-default');
    assert.equal(snapshot.voice.engine,'chirp3');assert.equal(snapshot.voice.rateMode,'client');
  }
  assert.deepEqual(f.writes,[]);assert.equal(f.api.getVoice('ar'),null);assert.equal(f.api.getChoices('__proto__').length,0);
});

test('explicit local favourites are independent by language, survive reload and only accept current catalogue candidates',async()=>{
  const f=fixture();await f.api.ready();
  const es=f.api.getChoices('es')[3],fr=f.api.getChoices('fr')[0];
  assert.equal(f.api.setVoice('es',es.name),true);assert.equal(f.api.getSelected('es').name,es.name);
  assert.equal(f.api.getSelected('fr'),null);assert.equal(f.api.getSnapshot('es').provisional,false);
  assert.equal(f.api.getSnapshot('es').usesApprovedDefault,false);assert.equal(f.api.getSnapshot('es').sourceMetadata.choiceSource,'local');
  assert.equal(f.api.setVoice('es',fr.name),false);assert.equal(f.api.setVoice('es','unverified-provider-id'),false);
  assert.equal(f.api.setVoice('__proto__',fr.name),false);assert.equal(f.writes.length,1);
  assert.equal(f.api.setVoice('fr',fr.name),true);assert.equal(f.api.getVoice('fr').engine,'wavenet');
  const stored=JSON.parse(f.storage.get(STORAGE_KEY));assert.deepEqual(stored,{version:1,choices:{es:es.name,fr:fr.name}});
  const reloaded=fixture({storage:f.storage});await reloaded.api.ready();
  assert.equal(reloaded.api.getSelected('es').name,es.name);assert.equal(reloaded.api.getSelected('fr').name,fr.name);
  assert.equal(reloaded.writes.length,0);
  assert.equal(reloaded.api.clearVoice('es'),true);assert.equal(reloaded.api.getSelected('es'),null);
  assert.equal(reloaded.api.getSelected('fr').name,fr.name);
  assert.throws(()=>{reloaded.api.getVoice('fr').name='tampered';},TypeError);
});

test('adding a German favourite preserves all seven existing language choices under the unchanged storage key',async()=>{
  const choices=Object.fromEntries(Object.entries(approved).filter(([language])=>language!=='de')
    .map(([language,[name]])=>[language,name]));
  const storage=new Map([[STORAGE_KEY,JSON.stringify({version:1,choices})]]),f=fixture({storage});
  await f.api.ready();assert.equal(f.writes.length,0);
  for(const [language,name] of Object.entries(choices))assert.equal(f.api.getSelected(language).name,name);
  const german=f.api.getChoices('de').find(candidate=>candidate.gender==='MALE');
  assert.equal(f.api.setVoice('de',german.name),true);
  assert.deepEqual(JSON.parse(storage.get(STORAGE_KEY)),{version:1,choices:{...choices,de:german.name}});
  const reloaded=fixture({storage});await reloaded.api.ready();
  assert.equal(reloaded.api.getSelected('de').name,german.name);
  for(const [language,name] of Object.entries(choices))assert.equal(reloaded.api.getSelected(language).name,name);
  assert.equal(reloaded.api.setVoice('de',approved.fr[0]),false);
  assert.equal(reloaded.api.clearVoice('de'),true);assert.equal(reloaded.api.getVoice('de').name,approved.de[0]);
  assert.deepEqual(JSON.parse(storage.get(STORAGE_KEY)).choices,choices);
});

test('malformed or stale stored identities never become a selection, and blocked storage never reports a saved favourite',async()=>{
  for(const raw of ['not-json','null','{"version":2,"choices":{"es":"bad"}}',JSON.stringify({version:1,choices:{es:'fr-FR-Wavenet-F',fr:'invented'}})]){
    const f=fixture({storage:new Map([[STORAGE_KEY,raw]])});await f.api.ready();
    assert.equal(f.api.getSelected('es'),null);assert.equal(f.api.getSelected('fr'),null);assert.equal(f.writes.length,0);
  }
  const blocked=fixture({storageFails:true});await blocked.api.ready();
  assert.equal(blocked.api.setVoice('es',blocked.api.getChoices('es')[1].name),false);
  assert.equal(blocked.api.getSelected('es'),null);assert.equal(blocked.api.clearVoice('es'),false);
});

test('invalid, cross-language, duplicate or expired provider catalogues fail closed',async()=>{
  const mutations=[
    data=>{data.previewOnly=false;},data=>{delete data.languages.ko;},
    data=>{delete data.selectionVersion;},data=>{data.selectionVersion='unapproved-version';},
    data=>{data.selectionVersion='kartech-2026-10-27';},data=>{delete data.languages.de;},
    data=>{data.languages.es.defaultVoice=copy(data.languages.es.chirp[0]);},
    data=>{data.languages.it.defaultVoice.gender='FEMALE';},
    data=>{data.languages.es.chirp[0].languageCode='fr-FR';},
    data=>{data.languages.es.chirp[0].languageCode='es-MX';},
    data=>{data.languages.es.chirp[0].name='fr-FR-Chirp3-HD-Aoede';},
    data=>{data.languages.es.chirp[2]=copy(data.languages.es.chirp[0]);},
    data=>{data.languages.es.chirp.pop();},data=>{data.languages.es.chirp[2].gender='FEMALE';},
    data=>{data.languages.es.chirp[0].rateMode='server';},
    data=>{data.languages.zh.chirp[0].languageCode='zh-HK';},
    data=>{data.expiresAt=new Date(NOW-1).toISOString();}
  ];
  for(const mutate of mutations){
    const data=catalogue();mutate(data);const f=fixture({data});
    await assert.rejects(f.api.ready());assert.equal(f.api.state().status,'error');
    assert.equal(f.api.getChoices('es').length,0);assert.equal(f.api.getSelected('es'),null);
  }
});

test('provider errors and missing candidates permit retry without a French or unverified voice substitution',async()=>{
  const f=fixture({networkFails:true});await assert.rejects(f.api.ready());
  assert.equal(f.api.getChoices('es').length,0);assert.equal(f.api.getVoice('es'),null);
  f.networkFails=false;await f.api.ready();assert.equal(f.api.getVoice('es').languageCode,'es-ES');
  const data=catalogue();data.languages.es.available=false;data.languages.es.chirp=[];data.languages.es.defaultVoice=null;data.languages.es.reason='insufficient_voices';
  const unavailable=fixture({data});await unavailable.api.ready();
  assert.equal(unavailable.api.getVoice('es'),null);assert.equal(unavailable.api.getChoices('es').length,1);
  assert.equal(unavailable.api.getSnapshot('es').provisional,false);
});

test('expiry requires a refreshed catalogue and native containers use the existing public endpoint',async()=>{
  const f=fixture();await f.api.ready();f.now=NOW+300001;
  assert.equal(f.api.state().status,'expired');assert.equal(f.api.getChoices('es').length,0);
  assert.equal(f.api.getVoice('es'),null);await assert.rejects(f.api.ready());
  for(const options of [{protocol:'file:'},{protocol:'capacitor:',bridgeAbsent:true},{native:true}]){
    const n=fixture(options);await n.api.ready();
    assert.equal(n.calls[0].url,'https://melunga.com'+CATALOGUE_PATH);
    assert.equal(n.calls[0].options.credentials,'omit');
  }
});

test('HTTPS localhost uses the public native endpoint even before the Capacitor bridge exists',async()=>{
  const f=fixture({protocol:'https:',hostname:'localhost',bridgeAbsent:true});await f.api.ready();
  assert.equal(f.calls[0].url,'https://melunga.com'+CATALOGUE_PATH);
  assert.equal(f.calls[0].options.credentials,'omit');assert.equal(f.api.state().endpointBase,'https://melunga.com');
});

test('HTTP localhost development keeps the same-origin endpoint without a native bridge',async()=>{
  const f=fixture({protocol:'http:',hostname:'localhost',bridgeAbsent:true});await f.api.ready();
  assert.equal(f.calls[0].url,CATALOGUE_PATH);
  assert.equal(f.calls[0].options.credentials,'same-origin');assert.equal(f.api.state().endpointBase,'');
});

test('subscriptions reflect actual choices, storage events and disposal without accepting foreign language keys',async()=>{
  const f=fixture();await f.api.ready();let count=0;const unsubscribe=f.api.subscribe(()=>count++);
  assert.equal(f.api.setVoice('es',f.api.getChoices('es')[1].name),true);assert.equal(count,1);
  f.listeners.storage({key:STORAGE_KEY,newValue:JSON.stringify({version:1,choices:{fr:f.api.getChoices('fr')[3].name,de:'invented'}})});
  assert.equal(count,2);assert.equal(f.api.getSelected('es'),null);assert.equal(f.api.getSelected('fr').gender,'MALE');
  unsubscribe();f.api.clearVoice('fr');assert.equal(count,2);
});

test('read-only getters never start a fetch and reentrant subscribers reuse the published in-flight promise',async()=>{
  const f=fixture({networkFails:true});await assert.rejects(f.api.ready());
  let notifications=0;
  f.api.subscribe(()=>{notifications++;f.api.getSnapshot('es');f.api.ready().catch(()=>{});});
  assert.equal(f.api.getVoice('es'),null);assert.equal(f.calls.length,1);
  f.networkFails=false;await f.api.preload();assert.equal(f.calls.length,2);assert.equal(notifications,2);
  f.now=NOW+300001;assert.equal(f.api.getVoice('es'),null);assert.equal(f.api.getSnapshot('es').status,'expired');
  assert.equal(f.calls.length,2,'expired getters remain side-effect free');
});

test('a missing approved default never falls back to the first candidate, while explicit personal choices still work',async()=>{
  for(const language of Object.keys(definitions))for(const missing of [true,false]){
    const data=catalogue();if(missing)delete data.languages[language].defaultVoice;else data.languages[language].defaultVoice=null;
    const f=fixture({data});await f.api.ready();const snapshot=f.api.getSnapshot(language);
    assert.equal(snapshot.voice,null);assert.equal(snapshot.defaultVoice,null);assert.equal(snapshot.approvedDefault,null);assert.equal(snapshot.usesApprovedDefault,false);
    assert.equal(snapshot.sourceMetadata.choiceSource,null);assert.equal(f.writes.length,0);
    const explicit=f.api.getChoices(language)[1];assert.equal(f.api.setVoice(language,explicit.name),true);
    assert.equal(f.api.getVoice(language).name,explicit.name);assert.equal(f.api.getSnapshot(language).sourceMetadata.choiceSource,'local');
    assert.equal(f.api.clearVoice(language),true);assert.equal(f.api.getVoice(language),null);
  }
});

test('a verified approved default works alone when three-way comparison is unavailable, but an unapproved singleton is rejected',async()=>{
  for(const language of Object.keys(definitions)){
    const data=catalogue(),row=data.languages[language];row.available=false;row.chirp=[row.defaultVoice];
    const f=fixture({data});await f.api.ready();assert.equal(f.api.getVoice(language).name,approved[language][0]);
    assert.equal(f.api.getChoices(language).length,2);assert.equal(f.api.getSnapshot(language).usesApprovedDefault,true);assert.equal(f.writes.length,0);
    const invalid=catalogue();invalid.languages[language].available=false;
    invalid.languages[language].chirp=[invalid.languages[language].chirp.find(candidate=>candidate.name!==approved[language][0])];
    invalid.languages[language].defaultVoice=null;
    await assert.rejects(fixture({data:invalid}).api.ready());
  }
});
