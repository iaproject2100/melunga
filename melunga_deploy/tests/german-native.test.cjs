/* German native catalogue acceptance. Every response is a local, SHA-checked source file. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const {execFileSync}=require('node:child_process'),{test,after}=require('node:test');
const ROOT=path.resolve(__dirname,'../..'),WEB=path.join(ROOT,'melunga_deploy'),BASE='5675b012ddbd5d7b19cd440e64ee14132a20921e';
const ORIGINAL=['fr','en','es','it','zh','ja','ko'],CODES=[...ORIGINAL,'de'];
const read=f=>fs.readFileSync(path.join(WEB,f)),json=f=>JSON.parse(read(f));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex'),plain=x=>JSON.parse(JSON.stringify(x));
const historical=new Map();
function old(file){if(!historical.has(file))historical.set(file,execFileSync('git',['show',BASE+':melunga_deploy/'+file],{cwd:ROOT,maxBuffer:50*1024*1024}));return historical.get(file);}
const report={status:'running',baseCommit:BASE,allResponsesLocal:true,providerCalled:false,cases:[],errors:[]};
function fixture({baseline=false,paid=false}={}){
 const storage=new Map([['ox_device','german-native-unit-fixture'],['ox_paid','1']]);
 const context={URL,URLSearchParams,Headers,AbortController,TextEncoder,TextDecoder,setTimeout,clearTimeout,crypto:crypto.webcrypto,
  location:{hostname:'melunga.com',origin:'https://melunga.com',href:'https://melunga.com/parcours-niveaux.html',protocol:'https:'},
  navigator:{userAgent:'Local German native unit fixture'},addEventListener(){},dispatchEvent(){},CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail;}},
  localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)},
  fetch:async(request)=>{
   const u=new URL(typeof request==='string'?request:request.url,'https://melunga.com');assert.equal(u.origin,'https://melunga.com');
   if(u.pathname==='/.netlify/functions/check-status')return{ok:true,status:200,json:async()=>({paid})};
   assert.match(u.pathname,/^\/content\/(?:native-catalogue\/[a-z0-9-]+|course-access)\.json$/,'only declared local content');
   const bytes=baseline?old(u.pathname.slice(1)):read(u.pathname.slice(1));
   return{ok:true,status:200,arrayBuffer:async()=>Uint8Array.from(bytes).buffer,text:async()=>bytes.toString(),json:async()=>JSON.parse(bytes)};
  }};
 context.window=context;context.globalThis=context;vm.createContext(context);
 vm.runInContext((baseline?old('course-i18n.js'):read('course-i18n.js')).toString(),context);
 vm.runInContext((baseline?old('course-native.js'):read('course-native.js')).toString(),context);
 return{context,api:context.MelungaNativeCourses,storage,access(){vm.runInContext(read('course-access.js').toString(),context);return context.MelungaCourseAccess;}};
}
async function checked(name,fn){try{await fn();report.cases.push(name);}catch(error){report.errors.push(name+': '+error.message);throw error;}}
after(()=>{report.status=report.errors.length?'failed':'passed';if(process.env.GERMAN_NATIVE_UNIT_REPORT)fs.writeFileSync(process.env.GERMAN_NATIVE_UNIT_REPORT,JSON.stringify(report,null,2)+'\n');assert.deepEqual(report.errors,[]);});

test('twelve native languages expose 128 available directions and all previous banks remain byte-identical',()=>checked('source-domain-and-immutable-banks',async()=>{
 const manifest=json('content/native-catalogue/manifest.json'),f=fixture();
 assert.deepEqual(plain(f.api.pairIds),[...CODES,'ru','pt','ar','hi'].flatMap(native=>[...CODES,'hi','ru','pt','ar'].filter(study=>native!==study&&!(native==='de'&&['hi','ru','pt','ar'].includes(study))).map(study=>native+'-'+study)));
 assert.equal(f.api.pairIds.length,128);assert.deepEqual(manifest.nativeLanguageIds,[...CODES,'ru','pt','ar','hi']);assert.deepEqual(manifest.studyLanguageIds,[...CODES,'hi','ru','pt','ar']);
 for(const code of CODES){assert.equal(f.api.isPair(code+'-'+code),false);assert.equal(hash(read('content/native-catalogue/'+code+'.json')),hash(old('content/native-catalogue/'+code+'.json')),code+' source bank bytes');}
 assert.equal(hash(read('content/course-access.json')),hash(old('content/course-access.json')),'historical account rights unchanged');
 assert.equal(hash(read('content/niveaux-progressifs/manifest.json')),hash(old('content/niveaux-progressifs/manifest.json')));
 report.sourceBankCount=8;report.nativePairCount=128;
}));

test('32,115 source identities resolve through the complete German translation sidecar without blank meanings',()=>checked('complete-german-meaning-sidecar',async()=>{
 const manifest=json('content/native-catalogue/manifest.json'),descriptor=manifest.germanNativeMeanings;
 const sidecar=json(descriptor.path),sourceBytes=fs.readFileSync(path.join(ROOT,descriptor.sourcePath)),source=JSON.parse(sourceBytes);
 assert.equal(hash(read(descriptor.path)),descriptor.sha256);assert.equal(hash(sourceBytes),descriptor.sourceSha256);
 assert.equal(sidecar.nativeLanguage,'de');assert.equal(sidecar.sourceCardCount,32115);assert.equal(sidecar.conceptCount,15869);
 assert.deepEqual(sidecar.concepts,source.concepts.map(concept=>concept.de));
 assert.equal(sidecar.concepts[13715],'Beförderung');assert.equal(sidecar.concepts[15868],'Verkaufsförderung');assert.equal(sidecar.banks.zh.conceptIds[3507],15868);
 assert(sidecar.concepts.every(text=>typeof text==='string'&&text.trim()));
 let total=0;
 for(const study of ORIGINAL){
  const bank=json('content/native-catalogue/'+study+'.json'),row=sidecar.banks[study];
  assert.equal(row.sourceBankSha256,hash(read('content/native-catalogue/'+study+'.json')));
  assert.deepEqual(row.conceptIds,source.banks[study].conceptIds);assert.equal(row.conceptIds.length,bank.cards.length);
  for(const index of row.conceptIds)assert(Number.isInteger(index)&&typeof sidecar.concepts[index]==='string'&&sidecar.concepts[index].trim());
  total+=row.conceptIds.length;
 }
 assert.equal(total,32115);report.sourceIdentitiesWithGermanMeanings=total;report.germanConceptCount=sidecar.concepts.length;
}));

test('all seven German-native courses preserve source text, phonetics, placement, images and three-step groups across ten levels',()=>checked('all-german-native-models-and-levels',async()=>{
 const f=fixture(),manifest=json('content/native-catalogue/manifest.json'),meanings=json(manifest.germanNativeMeanings.path),dictionary=json('content/course-locales/de.json');
 const total={levels:0,themes:0,models:0,englishFallback:0,pinyinFallback:0,unavailable:0};
 for(const study of ORIGINAL){
  const pairId='de-'+study,bank=json('content/native-catalogue/'+study+'.json'),first=await f.api.loadPair(pairId,1);
  const policy=manifest.pairs[pairId],eligible=manifest.eligibilityGroups[policy.eligibilityGroup];
  assert.equal(first.sourcePhraseMap.size,eligible.length);
  for(const index of eligible){
   const id='catalogue:'+study+':'+index,model=first.sourcePhraseMap.get(id),raw=bank.cards[index],conceptId=meanings.banks[study].conceptIds[index];
   assert.equal(model.study,raw.t);assert.equal(model.native,meanings.concepts[conceptId]);assert(model.native.trim());
   assert.equal(model.phon,raw.py||'','German reader receives only the exact original English/pinyin fallback');
   assert.equal(model.phoneticMode,raw.py?(study==='zh'?'pinyin-fallback':'english-fallback'):'unavailable');
   assert.equal(model.phoneticSourceField,raw.py?'py':undefined);assert.equal(model.reading,study==='zh'?raw.py||'':'');
   assert.deepEqual(plain(model.source.classicFields),raw);assert.equal(model.source.sourceIndex,index);assert.equal(model.source.sourceLevel,raw.lv);
   assert.equal(model.source.nativeMeaningSource.conceptId,conceptId);assert.equal(model.source.nativeMeaningSource.sha256,manifest.germanNativeMeanings.sha256);
   assert(Object.isFrozen(model)&&Object.isFrozen(model.source));total.models++;
   total[raw.py?(study==='zh'?'pinyinFallback':'englishFallback'):'unavailable']++;
  }
  for(let level=1;level<=10;level++){
   const {pair,sourcePhraseMap}=await f.api.loadPair(pairId,level);assert.equal(pair.nativeLanguage,'de');assert.equal(pair.studyLanguage,study);assert.equal(pair.levelTitle,dictionary.levels[level]);
   for(const theme of pair.themes){
    const original=bank.levels[level-1].themes.find(item=>item.id===theme.id);assert(original);
    assert.equal(theme.title,dictionary.themes[original.title]);assert.deepEqual(plain(theme.photo),original.photo);assert.equal(theme.visualId,original.visualId);
    assert.deepEqual(plain(theme.phrases.map(p=>p.id)),original.phraseIds.filter(id=>sourcePhraseMap.has(id)));
    assert.deepEqual(plain(theme.sequences.flatMap(s=>s.phraseIds)),plain(theme.phrases.map(p=>p.id)));
    for(const sequence of theme.sequences){assert(sequence.phraseIds.length<=5);assert.equal(sequence.steps.length,sequence.phraseIds.length*3);assert.match(sequence.title,/^Übungsrunde \d+$/);
     for(const id of sequence.phraseIds)assert.deepEqual(plain(sequence.steps.filter(step=>step.utterance===id).map(step=>step.kind)),['understand','imitate','choose-and-recall']);}
    total.themes++;
   }
   total.levels++;
  }
 }
 assert.equal(total.levels,70);report.germanNativeCoverage=total;
}));

test('all 49 previous source models and ten-level projections retain all fields apart from the manifest fingerprint and approved English badge',()=>checked('all-prior-49-directions-preserved',async()=>{
 const previous=fixture({baseline:true}),current=fixture(),reviewed=JSON.parse(old('content/niveaux-progressifs/manifest.json'));
 const priorPairs=plain(previous.api.pairIds);assert.equal(priorPairs.length,49);let checkedPairs=0,checkedLevels=0,checkedModels=0;
 for(const pairId of priorPairs){
  if(previous.api.isReviewed(pairId)){
   const entry=reviewed.pairs.find(pair=>pair.id===pairId);for(const file of [entry.repertoirePath,...entry.levels.map(level=>level.dataPath)])assert.equal(hash(read(file)),hash(old(file)),file+' reviewed bytes');checkedPairs++;continue;
  }
  for(let level=1;level<=10;level++){
   const before=await previous.api.loadPair(pairId,level),after=await current.api.loadPair(pairId,level);
   const clean=value=>{const result=plain(value);delete result.nativeCatalogueManifestSha256;return result;};
   const oldPair=clean(before.pair),currentPair=clean(after.pair);
   if(oldPair.studyLanguage==='en'){
    assert.equal(oldPair.flag,'🇬🇧',pairId+' historical English badge');
    assert.equal(currentPair.flag,'🇺🇸',pairId+' user-approved English badge');
    oldPair.flag='🇺🇸';
   }
   assert.deepEqual(currentPair,oldPair,pairId+' level '+level);
   if(level===1){assert.deepEqual(plain([...after.sourcePhraseMap]),plain([...before.sourcePhraseMap]),pairId+' all canonical models');checkedModels+=after.sourcePhraseMap.size;}
   checkedLevels++;
  }
  checkedPairs++;
 }
 assert.equal(checkedPairs,49);report.previousModelsPreserved={pairs:checkedPairs,derivedLevels:checkedLevels,derivedModels:checkedModels,reviewedPairs:7,approvedPresentationChange:'English badge UK to US only'};
}));

test('German rights accept all L1 models, preserve historical free IDs, and require server-confirmed access for other L2 models',()=>checked('german-native-free-and-paid-rights',async()=>{
 const f=fixture(),access=f.access(),manifest=json('content/native-catalogue/manifest.json');await access.initialize();assert.equal(access.state().paid,false,'forged local paid cache grants no rights');
 let free=0,locked=0;
 for(const study of ORIGINAL){
  const pairId='de-'+study,bank=json('content/native-catalogue/'+study+'.json');
  for(const level of [1,2]){const {pair}=await f.api.loadPair(pairId,level);for(const model of pair.themes.flatMap(t=>t.phrases)){
   const expected=level===1||f.api.isHistoricalFree(pairId,model.id);assert.equal(access.canLearn(pairId,model,level),expected);expected?free++:locked++;
  }}
  assert.equal(access.canLearn(pairId,{id:'catalogue:de:0',editorialLevel:1},1),false);
  assert.equal(access.loginUrl(pairId,2),'app.html?login=1&lang=de&study='+study+'&courseReturn='+pairId+'&courseLevel=2');
  const donor=(study==='en'?'it':'en')+'-'+study;
  assert.deepEqual(manifest.historicalFreeGroups[manifest.pairs[pairId].historicalFreeGroup],manifest.historicalFreeGroups[manifest.pairs[donor].historicalFreeGroup]);
  assert.equal(bank.studyLanguage,study);
 }
 assert(free>0&&locked>0);const paid=fixture({paid:true}),paidAccess=paid.access();await paidAccess.initialize();const model=(await paid.api.loadPair('de-en',2)).pair.themes.flatMap(t=>t.phrases).find(p=>!paid.api.isHistoricalFree('de-en',p.id));assert(model);assert.equal(paidAccess.canLearn('de-en',model,2),true);
 report.accessDecisions={free,locked,serverConfirmedUnlock:true};
}));
