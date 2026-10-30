/* Native catalogue matrices and account access: local Node VM fixtures only.
 * node --test melunga_deploy/tests/native-courses.test.cjs
 * Expected text/meaning/pronunciation and historical free IDs are recomputed
 * from the pinned classic app, not from the newly exported manifest itself.
 */
'use strict';
const assert = require('node:assert/strict');
const {test} = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');
const ROOT = path.resolve(__dirname, '..', '..');
const WEB = path.join(ROOT, 'melunga_deploy');
const BASE = 'ef147deacf85b4a5631c1b05ff8050de7918ea1f';
const LANGUAGES = ['fr','en','es','it','zh','ja','ko'];
const STUDY_LANGUAGES = [...LANGUAGES,'de'];
const REVIEWED = ['fr-en','fr-es','fr-it','fr-zh','fr-ja','fr-ko','zh-fr'];
const HISTORICAL_PAIRS = LANGUAGES.flatMap(native => LANGUAGES.filter(study => native !== study).map(study => native+'-'+study));
const PAIRS = STUDY_LANGUAGES.flatMap(native => STUDY_LANGUAGES.filter(study => native !== study).map(study => native+'-'+study));
const DERIVED = HISTORICAL_PAIRS.filter(pair => !REVIEWED.includes(pair));
const NATIVE_PAIRS = PAIRS.filter(pair => !REVIEWED.includes(pair));
const BASE_PAIR = Object.fromEntries(REVIEWED.map(pair => [pair.split('-')[1],pair]));
const read = file => fs.readFileSync(path.join(WEB,file));
const json = file => JSON.parse(read(file));
const plain = value => JSON.parse(JSON.stringify(value));
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const historic = file => execFileSync('git',['show',BASE+':melunga_deploy/'+file],{cwd:ROOT,maxBuffer:40*1024*1024});
const classic = historic('app.html').toString();
function literal(source,name){
  const line=source.split('\n').find(row=>row.startsWith('var '+name+' = '));
  assert.ok(line,'classic literal '+name);
  return {line,value:JSON.parse(line.slice(line.indexOf('=')+1).trim().replace(/;$/,''))};
}
/* Independent bounded reader for the seven small classic selector functions. */
function sourceFunction(source,name){
  const start=source.indexOf('function '+name+'(');
  assert.notEqual(start,-1,'classic selector '+name);
  let i=source.indexOf('{',start),depth=0,quote=null,escaped=false,lineComment=false,blockComment=false;
  for(;i<source.length;i++){
    const c=source[i],next=source[i+1];
    if(lineComment){if(c==='\n')lineComment=false;continue;}
    if(blockComment){if(c==='*'&&next==='/'){blockComment=false;i++;}continue;}
    if(quote){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c===quote)quote=null;continue;}
    if(c==='/'&&next==='/'){lineComment=true;i++;continue;}
    if(c==='/'&&next==='*'){blockComment=true;i++;continue;}
    if(c==='"'||c==="'"||c==='`'){quote=c;continue;}
    if(c==='{')depth++;
    else if(c==='}'&&!--depth)return source.slice(start,i+1);
  }
  throw new Error('Unclosed classic selector '+name);
}
const decks=literal(classic,'DECKS').value;
const families=literal(classic,'PEDAGOGY_FAMILIES').value;
const selectorNames=['meaningOf','phonOf','sourcingRelevant','activeDeck','guidedActiveDeck','guidedPool','isFreeCard'];
const sourcingDeclaration=classic.match(/var SOURCING_TH=\[[^\n]+?\];/)[0];
const freeDeclaration=classic.match(/var FREE_LV=\[[^\n]+?\];/)[0];
const oracle={DECKS:decks,PEDAGOGY_FAMILIES:families,nat:'fr',lang:'en',pinyinOn:false};
vm.createContext(oracle);
vm.runInContext(sourcingDeclaration+'\n'+freeDeclaration+'\n'+selectorNames.map(name=>sourceFunction(classic,name)).join('\n'),oracle);
const sourceIndex=Object.fromEntries(LANGUAGES.map(lang=>[lang,new Map(decks[lang].map((card,index)=>[card,index]))]));
const expected = new Map();
for(const pairId of HISTORICAL_PAIRS){
  const [native,study]=pairId.split('-');oracle.nat=native;oracle.lang=study;oracle.pinyinOn=false;
  const active=Array.from(oracle.activeDeck());
  const eligible=new Set(active.map(card=>sourceIndex[study].get(card)));
  const free=new Set(active.filter(card=>oracle.isFreeCard(card)).map(card=>sourceIndex[study].get(card)));
  const guidedSource=Array.from(oracle.guidedActiveDeck()),firstByText=new Map();
  for(const card of guidedSource)if(!firstByText.has(card.t))firstByText.set(card.t,sourceIndex[study].get(card));
  for(const card of oracle.guidedPool(guidedSource)){
    const index=firstByText.get(card.t);eligible.add(index);
    if(card._path.pathLv===1)free.add(index);
  }
  const fields=decks[study].map(card=>({study:card.t,native:oracle.meaningOf(card),phon:oracle.phonOf(card),reading:study==='zh'?(card.py||''):''}));
  expected.set(pairId,{native,study,eligible,free,fields});
}
const reviewedManifest=json('content/niveaux-progressifs/manifest.json');
const reviewedPaths=['content/niveaux-progressifs/manifest.json',
  ...REVIEWED.flatMap(pair=>Array.from({length:10},(_,i)=>'content/niveaux-progressifs/'+pair+'/L'+(i+1)+'.json')),
  ...REVIEWED.map(pair=>'content/niveaux-progressifs/repertoires/'+pair+'.json')];
const beforeReviewed = new Map(reviewedPaths.map(file=>[file,hash(read(file))]));
const definitions=new Map();
for(const study of LANGUAGES){
  const cards=new Map(),levels=[];
  for(let level=1;level<=10;level++){
    const cell=json('content/niveaux-progressifs/'+BASE_PAIR[study]+'/L'+level+'.json');
    const themeRows=[];
    for(const theme of [...cell.themes,...cell.heldThemes]){
      const indices=[];
      for(const model of theme.phrases){
        if(model.source.collection!=='DECKS.'+study)continue;
        assert.equal(cards.has(model.id),false,'reviewed catalogue ID is canonical once');
        cards.set(model.id,{level,themeId:theme.id,model});indices.push(model.source.sourceIndex);
      }
      if(indices.length)themeRows.push({id:theme.id,indices});
    }
    const reserve=[];
    for(const model of cell.reserve){
      assert.equal(cards.has(model.id),false);cards.set(model.id,{level,themeId:null,model});reserve.push(model.source.sourceIndex);
    }
    levels.push({level,themes:themeRows,reserve});
  }
  assert.equal(cards.size,decks[study].length,'all original cards have a reviewed location');
  definitions.set(study,{cards,levels});
}
function fixture({hostname='melunga.com',server={paid:false},serverStatus=200,serverFails=false,cachedPaid='1',mutate}={}){
  const storage=new Map([['ox_paid',cachedPaid],['ox_device','native-course-fixture-device']]);
  const calls=[],events=[];
  const context={URL,URLSearchParams,Headers,AbortController,TextEncoder,TextDecoder,setTimeout,clearTimeout,
    crypto:crypto.webcrypto,
    location:{hostname,origin:'https://'+hostname,href:'https://'+hostname+'/parcours-niveaux.html',protocol:'https:'},
    navigator:{userAgent:'Native course VM test'},
    localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,String(value)),removeItem:key=>storage.delete(key)},
    addEventListener:()=>{},dispatchEvent:event=>events.push(event.type),
    CustomEvent:class{constructor(type,options){this.type=type;this.detail=options?.detail;}},
    MelungaCourseI18n:{
      t:(locale,value)=>locale+':'+value,
      theme:(locale,value)=>locale+':'+value,
      levelTitle:(locale,level)=>locale+':level:'+level,
      languageName:(locale,study)=>locale+':language:'+study,
      format:(locale,key,values)=>locale+':'+key+':'+values.n
    },
    fetch:async(request,options={})=>{
      const url=new URL(typeof request==='string'?request:request.url,'https://'+hostname);
      calls.push({path:url.pathname,options});
      assert.equal(url.origin,'https://'+hostname,'no remote origin is allowed');
      if(url.pathname==='/.netlify/functions/check-status'){
        assert.equal(options.method??'GET','GET');
        if(serverFails)throw new Error('Simulated status network failure');
        return {ok:serverStatus>=200&&serverStatus<300,status:serverStatus,json:async()=>server};
      }
      assert.match(url.pathname,/^\/content\/(?:native-catalogue\/(?:manifest|fr|en|es|it|zh|ja|ko|de)|course-access)\.json$/,'only local declared catalogue and rights fixtures');
      let bytes=read(url.pathname.slice(1));
      if(mutate)bytes=Buffer.from(await mutate(url.pathname,bytes,options));
      return {ok:true,status:200,arrayBuffer:async()=>Uint8Array.from(bytes).buffer,
        text:async()=>bytes.toString(),json:async()=>JSON.parse(bytes)};
    }
  };
  context.window=context;context.globalThis=context;
  vm.createContext(context);
  vm.runInContext(read('course-native.js').toString(),context,{filename:'course-native.js'});
  return {context,api:context.MelungaNativeCourses,calls,storage,events,
    access(){vm.runInContext(read('course-access.js').toString(),context,{filename:'course-access.js'});return context.MelungaCourseAccess;}};
}
function ids(indices,study){return [...indices].map(index=>'catalogue:'+study+':'+index).sort();}
function paidSourceId(pairId){
  const e=expected.get(pairId), source=definitions.get(e.study).cards;
  for(const index of e.eligible){
    const id='catalogue:'+e.study+':'+index,found=source.get(id);
    if(!e.free.has(index) && found.level>1 && found.themeId!==null)return id;
  }
  throw new Error('Missing paid source fixture for '+pairId);
}
async function paidModel(f,pairId){
  const {sourcePhraseMap}=await f.api.loadPair(pairId,1),model=sourcePhraseMap.get(paidSourceId(pairId));
  assert(model,'paid fixture is a real verified native catalogue model');return model;
}
function expectedPhoneticProvenance(raw,native,study){
  // These names come from phonOf in the original classic app. The value itself
  // is checked separately by actually executing that original selector.
  const fields=study==='zh'?{fr:'phf',es:'phs',en:'phe',it:'phi',ja:'pj',ko:'pk',zh:'phon'}:
    {fr:'pf',es:'ps',en:'py',it:'pi',ja:'pj',ko:'pk',zh:'phon'};
  const field=fields[native];
  if(raw[field])return {field,mode:'native-source'};
  if(native!=='zh'&&raw.py)return {field:'py',mode:study==='zh'?'pinyin-fallback':'english-fallback'};
  return {field,mode:'unavailable'};
}

test('classic source functions, both literals, all 78 reviewed documents and historical rights stay byte-exact',()=>{
  assert.equal(reviewedPaths.length,78);
  const current=read('app.html').toString();
  for(const name of ['DECKS','PEDAGOGY_FAMILIES'])assert.equal(literal(current,name).line,literal(classic,name).line,name+' original literal');
  for(const name of selectorNames)assert.equal(sourceFunction(current,name),sourceFunction(classic,name),name+' classic policy');
  assert.equal(current.match(/var SOURCING_TH=\[[^\n]+?\];/)[0],sourcingDeclaration,'classic sourcing domain unchanged');
  assert.equal(current.match(/var FREE_LV=\[[^\n]+?\];/)[0],freeDeclaration,'classic free-level policy unchanged');
  for(const file of reviewedPaths)assert.equal(hash(read(file)),hash(historic(file)),file+' reviewed bytes');
  assert.equal(hash(read('content/course-access.json')),hash(historic('content/course-access.json')),'seven historical rights unchanged');
});

test('native domain has 56 target pairs and preserves the historical 42 directions',()=>{
  const {api}=fixture();
  assert.deepEqual(plain(api.pairIds),PAIRS);assert.deepEqual(plain(api.reviewedPairIds),REVIEWED);
  assert.equal(PAIRS.length,56);assert.equal(HISTORICAL_PAIRS.length,42);assert.equal(DERIVED.length,35);
  assert.deepEqual(plain(api.pairIds).filter(pair=>!pair.endsWith('-de')&&!pair.startsWith('de-')),HISTORICAL_PAIRS);
  for(const native of LANGUAGES)assert.equal(api.isPair(native+'-'+native),false,'native cannot equal study');
  for(const pair of ['ar-fr','ar-en','de-de','xx-de','en','xx-zh','FR-en','en-en','en-fr-extra',null])assert.equal(api.isPair(pair),false);
  for(const pair of PAIRS){assert.equal(api.isPair(pair),true);assert.equal(api.isReviewed(pair),REVIEWED.includes(pair));}
  const snapshot=JSON.stringify(reviewedManifest),metadata=plain(api.metadata(reviewedManifest));
  assert.deepEqual(metadata.map(row=>row.id),NATIVE_PAIRS);assert.equal(metadata.length,49);
  assert.deepEqual(metadata.filter(row=>row.studyLanguage!=='de'&&row.nativeLanguage!=='de').map(row=>row.id),DERIVED);
  for(const row of metadata){
    const [native,study]=row.id.split('-');assert.equal(row.nativeLanguage,native);assert.equal(row.studyLanguage,study);
    assert.equal(row.name,native+':language:'+study);assert.equal(row.nativeCatalogue,true);
    assert.equal(row.nativeCatalogueSourcePair,study==='de'?null:BASE_PAIR[study]);
    assert.deepEqual(row.levels.map(level=>level.level),[1,2,3,4,5,6,7,8,9,10]);
    assert(row.levels.every(level=>level.title===native+':level:'+level.level));
  }
  assert.equal(JSON.stringify(reviewedManifest),snapshot,'metadata does not mutate reviewed data');
  assert.throws(()=>api.metadata({pairs:[]}),/reviewed metadata missing/);
  const mismatched=plain(reviewedManifest);mismatched.pairs[0].nativeLanguage=mismatched.pairs[0].studyLanguage;
  assert.throws(()=>api.metadata(mismatched),/reviewed metadata missing/);
});

test('all 42 eligibility and free matrices are independently recomputed through the original classic functions',async()=>{
  const {api,calls}=fixture();
  for(const pair of PAIRS){const study=pair.split('-')[1];assert.equal(api.isEligible(pair,'catalogue:'+study+':0'),false);assert.equal(api.isHistoricalFree(pair,'catalogue:'+study+':0'),false);}
  await api.ensureRights();
  for(const pair of HISTORICAL_PAIRS){
    const e=expected.get(pair),actualEligible=[],actualFree=[];
    for(let index=0;index<decks[e.study].length;index++){
      const id='catalogue:'+e.study+':'+index;
      if(api.isEligible(pair,id))actualEligible.push(index);
      if(api.isHistoricalFree(pair,id))actualFree.push(index);
    }
    assert.deepEqual(actualEligible,[...e.eligible].sort((a,b)=>a-b),pair+' classic activeDeck UNION guided whole-source eligibility');
    assert.deepEqual(actualFree,[...e.free].sort((a,b)=>a-b),pair+' lv1 UNION first whole guided pathLv1');
    for(const id of ['catalogue:'+e.study+':-1','catalogue:'+e.study+':01','catalogue:'+e.study+':1.5','catalogue:'+e.study+':999999','catalogue:xx:0','editorial:new-word']){
      assert.equal(api.isEligible(pair,id),false);assert.equal(api.isHistoricalFree(pair,id),false);
    }
  }
  const approved=json('content/course-access.json');
  for(const pair of approved.pairs){assert.deepEqual([...pair.historicalFreeIds].sort(),ids(expected.get(pair.id).free,pair.id.split('-')[1]),pair.id+' previous free identities');}
  assert.equal(calls.filter(call=>call.path.includes('/.netlify/')).length,0,'catalogue matrices never call account APIs');
});

test('35 native source projections preserve whole classic study/meaning/phon blocks and every reviewed catalogue location',async t=>{
  const {api,calls}=fixture();
  const ordered=[...DERIVED].sort((a,b)=>a.split('-')[1].localeCompare(b.split('-')[1])||a.localeCompare(b));
  let comparedModels=0,comparedCells=0;
  for(const pairId of ordered){
    const e=expected.get(pairId),source=definitions.get(e.study);
    const first=await api.loadPair(pairId,1);
    assert.equal(first.referenceMap.size,0,'native views add no borrowed model bank');
    assert.equal(first.sourcePhraseMap.size,e.eligible.size,pairId+' all eligible sources represented');
    for(const [id,model] of first.sourcePhraseMap){
      const index=Number(id.split(':')[2]),raw=decks[e.study][index],fields=e.fields[index],place=source.cards.get(id);
      assert.equal(id,'catalogue:'+e.study+':'+index);assert(e.eligible.has(index));
      for(const key of ['study','native','phon','reading'])assert.equal(model[key],fields[key],pairId+' '+id+' '+key+' matches classic selector');
      assert.deepEqual(plain(model.source.classicFields),raw,'the complete source block remains original, including untranslated alternatives');
      const provenance=expectedPhoneticProvenance(raw,e.native,e.study);
      assert.equal(model.phoneticMode,provenance.mode,'a fallback is never labelled as an adapted native guide');
      assert.equal(model.phoneticSourceField,provenance.field);assert.equal(model.source.fieldMap.phon,provenance.field);
      assert.equal(model.source.fieldMap.study,'t');
      assert.equal(model.source.fieldMap.native,{fr:'frm',es:'esm',en:'en',it:'itm',ja:'jam',ko:'kom',zh:'cn'}[e.native]);
      assert.equal(model.source.sourceIndex,index);assert.equal(model.source.sourceLevel,raw.lv);assert.equal(model.source.collection,'DECKS.'+e.study);
      assert.equal(model.editorialLevel,place.level);assert.equal(model.placement.themeId,place.themeId);assert.equal(model.contentType,place.model.contentType);
      assert.equal(model.nativeCatalogueReserved,place.themeId===null);assert.equal(model.isTemplate,place.model.isTemplate);
      assert.equal(model.lexicalClass,place.model.lexicalClass??undefined);assert.equal(model.lexicalConceptId,place.model.lexicalConceptId??undefined);
      assert.equal(Object.isFrozen(model),true);assert.equal(Object.isFrozen(model.source.classicFields),true);
      comparedModels++;
    }
    for(let level=1;level<=10;level++){
      const result=level===1?first:await api.loadPair(pairId,level),pair=result.pair,cell=source.levels[level-1];
      assert.equal(pair.id,pairId);assert.equal(pair.pairId,pairId);assert.equal(pair.level,level);assert.equal(pair.nativeLanguage,e.native);assert.equal(pair.studyLanguage,e.study);
      assert.equal(pair.nativeCatalogue,true);assert.equal(pair.nativeCatalogueSourcePair,BASE_PAIR[e.study]);
      assert.equal(pair.levelTitle,e.native+':level:'+level);assert.deepEqual(plain(pair.heldThemes),[]);
      const expectedThemes=cell.themes.map(theme=>({id:theme.id,ids:theme.indices.filter(i=>e.eligible.has(i)).map(i=>'catalogue:'+e.study+':'+i)})).filter(theme=>theme.ids.length);
      assert.deepEqual(plain(pair.themes.map(theme=>({id:theme.id,ids:theme.phrases.map(model=>model.id)}))),expectedThemes,pairId+' L'+level+' reviewed theme order');
      assert.deepEqual(plain(pair.reserve.map(model=>model.id)),cell.reserve.filter(i=>e.eligible.has(i)).map(i=>'catalogue:'+e.study+':'+i),'all eligible reserve sources stay available as reserve');
      assert.equal(pair.totalCanonicalPhrases,pair.totalPhrases+pair.reserve.length);
      assert.equal(pair.totalPhrases,pair.themes.reduce((n,t)=>n+t.phrases.length,0));
      for(const theme of pair.themes){
        assert.equal(theme.receivedTurns,undefined,'no received dialogue is falsely translated');
        assert.equal(theme.sequences.flatMap(sequence=>sequence.phraseIds).length,theme.phrases.length);
        for(const sequence of theme.sequences){
          assert(sequence.steps.length>0);assert.equal(sequence.steps.length,sequence.phraseIds.length*3);
          for(const id of sequence.phraseIds){
            const steps=sequence.steps.filter(step=>step.utterance===id);
            assert.deepEqual(plain(steps.map(step=>step.kind)),['understand','imitate','choose-and-recall']);
            assert.deepEqual(plain(steps.map(step=>step.requiresProduction)),[false,true,true]);
            assert.equal(steps[2].preparedInSteps.understoodInStep,steps[0].id);assert.equal(steps[2].preparedInSteps.imitatedInStep,steps[1].id);
          }
        }
      }
      comparedCells++;
    }
  }
  assert.equal(comparedCells,350);assert(comparedModels>100000,'every source row in all 35 matrices is checked');
  t.diagnostic(comparedModels+' eligible whole classic source models checked across '+comparedCells+' native-pair/level projections.');
  for(const call of calls){assert(!call.path.includes('/.netlify/'));assert.equal(call.options.credentials,'omit','public catalogue loads need no account');}
  for(const [file,sha] of beforeReviewed)assert.equal(hash(read(file)),sha,'native projections do not rewrite '+file);
});

test('loader refuses reviewed routes, same-language pairs, invalid levels and pre-aborted requests',async()=>{
  const {api,calls}=fixture();
  for(const pair of [...REVIEWED,'en-en','ar-fr',null])await assert.rejects(api.loadPair(pair,1));
  for(const level of [0,11,1.5,'1',null])await assert.rejects(api.loadPair('en-fr',level));
  const controller=new AbortController();controller.abort();
  await assert.rejects(api.loadPair('en-fr',1,{signal:controller.signal}),error=>error.name==='AbortError');
  assert.equal(calls.length,0,'invalid routes and pre-aborted requests do not fetch content');
});

test('the pinned manifest and each bank reject byte corruption even if the modified JSON has identical values',async()=>{
  for(const pathname of ['/content/native-catalogue/manifest.json',...STUDY_LANGUAGES.map(study=>'/content/native-catalogue/'+study+'.json')]){
    const f=fixture({mutate:(requested,bytes)=>requested===pathname?Buffer.concat([bytes,Buffer.from(' ')]):bytes});
    if(pathname.endsWith('/manifest.json')){
      await assert.rejects(f.api.ensureRights(),/fingerprint differs/);
      assert.equal(f.api.isEligible('en-fr','catalogue:fr:0'),false,'a corrupt manifest never installs access matrices');
    }else{
      const study=path.basename(pathname,'.json'),pair=NATIVE_PAIRS.find(id=>id.endsWith('-'+study));
      await assert.rejects(f.api.loadPair(pair,1),/fingerprint differs/);
    }
  }
});

test('a failed manifest can be retried, while a missing crypto verifier never admits unverified data',async()=>{
  let corrupt=true;
  const f=fixture({mutate:(requested,bytes)=>corrupt&&requested.endsWith('/manifest.json')?Buffer.concat([bytes,Buffer.from(' ')]):bytes});
  await assert.rejects(f.api.ensureRights(),/fingerprint differs/);corrupt=false;
  await f.api.ensureRights();assert.equal(f.api.isEligible('en-fr','catalogue:fr:0'),expected.get('en-fr').eligible.has(0));
  const g=fixture();g.context.crypto=undefined;
  await assert.rejects(g.api.ensureRights(),/SHA-256 verification unavailable/);
});

test('all 35 new pairs keep historical free identities and editorial L1 open; paid flags come only from strict server status',async()=>{
  const f=fixture({server:{paid:false},cachedPaid:'1'}),access=f.access();
  assert.equal(access.canLearn('en-fr',{id:'catalogue:fr:0',editorialLevel:1},1),false,'not ready cannot grant content');
  await access.initialize();assert.equal(access.state().paid,false,'cached ox_paid=1 never grants access');
  for(const pairId of DERIVED){
    const e=expected.get(pairId);
    const {sourcePhraseMap}=await f.api.loadPair(pairId,1);
    for(const [id,model] of sourcePhraseMap){
      const index=Number(id.split(':')[2]);
      assert.equal(access.canLearn(pairId,model,model.editorialLevel),model.editorialLevel===1||e.free.has(index),pairId+' '+id+' source/free policy');
    }
    const model=sourcePhraseMap.get(paidSourceId(pairId));
    assert.equal(access.canLearn(pairId,model,model.editorialLevel),false,'nonpaying learner cannot open L2–L10 paid source');
  }
  for(const pairId of ['en-en','xx-fr','en-xx','ar-fr'])assert.equal(access.canLearn(pairId,{id:'catalogue:fr:0',editorialLevel:1},1),false);
  assert(f.calls.every(call=>!call.path.includes('/login')&&!call.path.includes('/payment')),'all account calls are simulated status reads');
});

test('no truthy cached, string or failed-server paid result grants L2–L10; a real boolean paid=true does',async()=>{
  for(const options of [
    {server:{paid:'true'}},{server:{paid:1}},{server:{permanent:true}},{server:{paid:true},serverStatus:401},
    {server:{paid:true},serverStatus:500},{serverFails:true},{server:{paid:false},cachedPaid:'1'}
  ]){
    const f=fixture(options),access=f.access();await access.initialize();
    assert.equal(access.state().paid,false,JSON.stringify(options)+' stays unpaid');
    const model=await paidModel(f,'en-fr');assert.equal(access.canLearn('en-fr',model,model.editorialLevel),false);
  }
  const f=fixture({server:{paid:true}}),access=f.access();await access.initialize();assert.equal(access.state().paid,true);
  for(const pairId of DERIVED){
    const model=await paidModel(f,pairId);assert.equal(access.canLearn(pairId,model,model.editorialLevel),true,pairId+' paid source opens');
    const e=expected.get(pairId),index=decks[e.study].findIndex((_card,i)=>!e.eligible.has(i));
    if(index!==-1){
      const excluded={id:'catalogue:'+e.study+':'+index,editorialLevel:1,nativeCatalogue:true};
      assert.equal(access.canLearn(pairId,excluded,1),false,'payment does not import sourcing material excluded by the original native route');
    }
  }
  assert.equal(access.canLearn('en-fr',{id:'catalogue:en:0',editorialLevel:1,nativeCatalogue:true},1),false,'payment cannot turn a source in the wrong language into this course');
  assert.equal(access.canLearn('en-en',{id:'catalogue:en:0',editorialLevel:1},1),false,'paid does not invent a same-language course');
});

test('the original seven reviewed bundles retain their previous free-access policy for every canonical model',async t=>{
  const f=fixture({server:{paid:false}}),access=f.access();await access.initialize();
  let compared=0;
  for(const pairId of REVIEWED)for(let level=1;level<=10;level++){
    const cell=json('content/niveaux-progressifs/'+pairId+'/L'+level+'.json');
    const rows=[...cell.themes.flatMap(theme=>theme.phrases),...cell.heldThemes.flatMap(theme=>theme.phrases),...cell.reserve];
    const e=expected.get(pairId);
    for(const model of rows){
      const sourceIndex=Number(model.id.match(/^catalogue:[a-z]{2}:(\d+)$/)?.[1]);
      const free=model.editorialLevel===1 || e.free.has(sourceIndex)
        || (model.source?.sourceLevel===1 && /^conversation/.test(model.source?.collection||''));
      assert.equal(access.canLearn(pairId,model,level),free,pairId+' '+model.id+' previous reviewed access');
      compared++;
    }
  }
  assert.equal(compared,33654,'all reviewed canonical models covered, including reserves');
  t.diagnostic(compared+' reviewed canonical models retain their previous free-access outcome.');
});

test('login and classic URLs preserve all 56 native/target directions; invalid pairs return to language selection',()=>{
  const f=fixture(),access=f.access();
  for(const pairId of PAIRS){
    const [native,study]=pairId.split('-');
    const login=new URL(access.loginUrl(pairId,7),'https://fixture.example/');
    assert.equal(login.pathname,'/app.html');assert.equal(login.searchParams.get('lang'),native);assert.equal(login.searchParams.get('study'),study);
    assert.equal(login.searchParams.get('login'),'1');assert.equal(login.searchParams.get('courseReturn'),pairId);assert.equal(login.searchParams.get('courseLevel'),'7');
    const classicUrl=new URL(access.classicUrl(pairId),'https://fixture.example/');
    assert.equal(classicUrl.pathname,'/app.html');assert.equal(classicUrl.searchParams.get('lang'),native);assert.equal(classicUrl.searchParams.get('study'),study);
    assert.equal(classicUrl.searchParams.get('start'),'1');assert.equal(classicUrl.searchParams.get('classic'),'1');
    for(const level of [0,11,'invalid',1.5])assert.equal(new URL(access.loginUrl(pairId,level),'https://fixture.example/').searchParams.get('courseLevel'),'1');
  }
  for(const pairId of [...STUDY_LANGUAGES.map(language=>language+'-'+language),'ar-fr','ar-en','xx-fr',null,'https://example.test']){
    assert.equal(access.loginUrl(pairId,7),'index.html');assert.equal(access.classicUrl(pairId),'index.html');
  }
  assert.equal(f.calls.length,0,'URL creation never logs in or makes a network call');
});

test('deploy previews open the 35 additional native courses without paid status, while keeping native eligibility guards',async()=>{
  const f=fixture({hostname:'deploy-preview-999--chic-dragon-e2baf2.netlify.app'}),access=f.access();
  await access.initialize();assert.equal(access.state().unrestricted,true);assert.equal(access.state().paid,false);
  for(const pairId of DERIVED){
    const model=await paidModel(f,pairId);assert.equal(access.canLearn(pairId,model,model.editorialLevel),true,pairId+' preview can inspect paid-level source');
    const e=expected.get(pairId),index=decks[e.study].findIndex((_card,i)=>!e.eligible.has(i));
    if(index!==-1)assert.equal(access.canLearn(pairId,{id:'catalogue:'+e.study+':'+index,editorialLevel:1,nativeCatalogue:true},1),false,'preview cannot invent a source excluded from this native matrix');
  }
  assert.equal(access.canLearn('en-fr',{id:'catalogue:en:0',editorialLevel:1,nativeCatalogue:true},1),false,'preview cannot mix target identities');
  assert.equal(access.canLearn('en-en',{id:'catalogue:en:0',editorialLevel:1},1),false,'preview cannot invent a diagonal pair');
  assert.equal(f.calls.filter(call=>call.path.includes('/.netlify/')).length,0,'preview never checks or creates an account');
});
