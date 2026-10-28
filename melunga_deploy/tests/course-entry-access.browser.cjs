/* Independent acceptance checks of the production course entry and access.
 * All network and account operations are simulated. No real account is used.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');
const {test, before, after} = require('node:test');
const {chromium} = require('playwright-core');
const nativeLayer = require('./native-routing-layer.cjs');

const ROOT = path.resolve(__dirname, '..', '..');
const WEB = path.join(ROOT, 'melunga_deploy');
const BASE = 'ebd6519a6088e52c157231b44ae4cf41507f0667';
// Chirp was approved before the direct-language entry change. Keep that exact
// whole TTS source while every other existing backend file retains BASE.
const APPROVED_TTS_COMMIT = 'ba3ac02313820b19cb4506c647c1e17f08543480';
const PAIRS = ['fr-en', 'fr-es', 'fr-it', 'fr-zh', 'fr-ja', 'fr-ko', 'zh-fr'];
const COUNTS = {'fr-en':342, 'fr-es':300, 'fr-it':347, 'fr-zh':331, 'fr-ja':305, 'fr-ko':284, 'zh-fr':309};
const PREFIX = 'content/niveaux-progressifs/';
const ORIGIN = 'https://melunga.com';
const EMAIL = 'course-entry-fixture@example.test';
const PASSWORD = 'Fictitious-course-entry-password-28';
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const read = filename => fs.readFileSync(path.join(WEB, filename));
const json = filename => JSON.parse(read(filename));
const baseline = filename => execFileSync('git', ['show', BASE + ':melunga_deploy/' + filename], {cwd:ROOT, maxBuffer:40*1024*1024});
const manifest = json(PREFIX + 'manifest.json');
const documents = new Map([[PREFIX + 'manifest.json', manifest]]);
const models = new Map();
for (const pair of manifest.pairs) {
  const bank = json(pair.repertoirePath); documents.set(pair.repertoirePath, bank);
  for (const level of pair.levels) {
    const cell = json(level.dataPath); documents.set(level.dataPath, cell);
    for (const theme of cell.themes) for (const phrase of theme.phrases) models.set(pair.id+'|'+phrase.id, {pair:pair.id, phrase, level:cell.level, theme, reserved:false});
    for (const phrase of cell.reserve) models.set(pair.id+'|'+phrase.id, {pair:pair.id, phrase, level:cell.level, reserved:true});
  }
}

function variable(source, name) {
  const line = source.split('\n').find(line => line.startsWith('var '+name+' = '));
  assert.ok(line, 'approved classic variable '+name);
  return JSON.parse(line.slice(line.indexOf('=')+1).trim().replace(/;$/, ''));
}
const classic = baseline('app.html').toString();
const decks = variable(classic, 'DECKS');
const families = variable(classic, 'PEDAGOGY_FAMILIES');
function independentHistoricalRights() {
  const sourcing = ['biz','textile','elec','furniture','lighting','toys','shoes','bags','machinery'];
  const fields = {fr:'frm', es:'esm', en:'en', it:'itm', ja:'jam', ko:'kom'};
  return Object.fromEntries(PAIRS.map(pair => {
    const [native, study] = pair.split('-'), all = decks[study].map((card, index) => ({card, index}));
    const relevant = native==='zh' || study==='zh' || (['fr','es'].includes(native) && study==='en');
    const eligible = row => !fields[native] || !!row.card[fields[native]];
    const source = all.filter(row => (relevant || !sourcing.includes(row.card.th)) && eligible(row) && row.card.lv===1);
    // guidedActiveDeck intentionally does not apply sourcingRelevant, and the
    // old guidedPool resolves the first eligible card by its whole target text.
    const first = new Map();
    for (const row of all.filter(eligible)) if (!first.has(row.card.t)) first.set(row.card.t, row.index);
    const guided = [];
    for (const family of families.languages[study]?.families || []) if (family.pathLv===1) {
      for (const reference of family.cards) if (first.has(reference.target)) guided.push(first.get(reference.target));
    }
    const ids = [...new Set([...source.map(row=>row.index), ...guided])].map(index=>'catalogue:'+study+':'+index).sort();
    assert.equal(ids.length, COUNTS[pair], pair+' historical union');
    return [pair, {ids, sourceIds:source.map(row=>'catalogue:'+study+':'+row.index).sort(), guidedIds:[...new Set(guided)].map(index=>'catalogue:'+study+':'+index).sort()}];
  }));
}
const historical = independentHistoricalRights();
const rightsFile = () => json('content/course-access.json');
// The access suite does not compare voices, but its reveal-audio assertion
// needs a verified catalogue. Return only the independently approved default
// per language; media itself stays inside the in-memory Audio fixture below.
function voiceCatalogue() {
  const approved={fr:['fr-FR','Aoede','FEMALE','F'],en:['en-GB','Kore','FEMALE','C'],
    es:['es-ES','Kore','FEMALE','F'],it:['it-IT','Charon','MALE','E'],
    zh:['cmn-CN','Kore','FEMALE','A'],ja:['ja-JP','Kore','FEMALE','B'],ko:['ko-KR','Kore','FEMALE','A']};
  return {version:1,previewOnly:true,source:'google-voices-list',selectionVersion:'kartech-2026-10-27',
    verifiedAt:new Date(Date.now()-1000).toISOString(),expiresAt:new Date(Date.now()+600000).toISOString(),
    languages:Object.fromEntries(Object.entries(approved).map(([language,[languageCode,name,gender,waveNet]])=>{
      const voice={name:languageCode+'-Chirp3-HD-'+name,languageCode,gender,engine:'chirp3',rateMode:'client'};
      return [language,{language,available:false,chirp:[voice],defaultVoice:voice,
        waveNet:{name:languageCode+'-Wavenet-'+waveNet,languageCode,gender:'FEMALE',engine:'wavenet',rateMode:'server'}}];
    }))};
}
function expectedFree(pair, phrase, level) {
  return (Number.isInteger(phrase.editorialLevel)?phrase.editorialLevel:level)===1
    || historical[pair].ids.includes(phrase.id)
    || (phrase.source?.sourceLevel===1 && /^conversation/.test(phrase.source?.collection||''));
}

function fingerprint() {
  const files = [__filename, ...['index.html','desktop-home.js','app.html','maquette-guidee.js',
    'maquette-guidee.html','parcours-niveaux.html','maquette-guidee.css','course-access.js',
    'content/course-access.json'].map(file=>path.join(WEB,file)), ...[...documents.keys()].map(file=>path.join(WEB,file)), ...nativeLayer.inputFiles()];
  return Object.fromEntries(files.filter(file=>fs.existsSync(file)).sort().map(file=>[path.relative(ROOT,file), hash(fs.readFileSync(file))]));
}
const report = {status:'running', baseCommit:BASE, actualProductionHostUsed:false, physicalPhoneChecked:false,
  environment:'local Chromium; production/review hostnames simulated with local request fulfillment',
  allApiCallsMocked:true, realAccountsUsed:false, checks:[], cases:[], errors:[], externalNavigations:[], unexpectedApiCalls:[]};
const REQUIRED = ['rights-source-and-content','permission-policy','home-trial-routing','confirmed-login-return','return-allowlist','modern-free-paid-dom'];
let browser, inputHashes;
before(async()=>{
  // Validate every actual byte of the finite A layer before using its source projection.
  report.nativeRoutingLayer = nativeLayer.validate();
  inputHashes = fingerprint();
  browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium', args:['--no-sandbox']});
});
after(async()=>{
  await browser?.close();
  report.inputsStable = JSON.stringify(inputHashes)===JSON.stringify(fingerprint());
  report.inputSha256 = inputHashes;
  report.missingChecks=REQUIRED.filter(name=>!report.checks.includes(name));
  const partial=process.env.COURSE_ENTRY_PARTIAL==='1';
  report.status = report.inputsStable && !report.errors.length && !report.externalNavigations.length && !report.unexpectedApiCalls.length && (partial||!report.missingChecks.length) ? (partial?'partial':'passed') : 'failed';
  if (process.env.COURSE_ENTRY_REPORT) fs.writeFileSync(process.env.COURSE_ENTRY_REPORT, JSON.stringify(report,null,2)+'\n');
  assert.equal(report.inputsStable,true,'source inputs remain stable');
  assert.deepEqual(report.errors,[],'no browser errors');
  assert.deepEqual(report.externalNavigations,[],'no external navigation');
  assert.deepEqual(report.unexpectedApiCalls,[],'only declared simulated API calls');
  if(!partial)assert.deepEqual(report.missingChecks,[],'all required acceptance groups completed');
});

async function isolatedAccess({paid=false, hostname='melunga.com', cachedPaid='1', status=200, fail=false, body,rightsCorrupt=false}={}) {
  const storage = new Map([['ox_device','entry-fixture-device'],['ox_paid',cachedPaid],['ox_session','fictitious-entry-session']]);
  const calls = [], events=[];
  const context = {
    URL, URLSearchParams, AbortController, Headers, TextEncoder, TextDecoder, setTimeout, clearTimeout,
    crypto:crypto.webcrypto,
    location:{hostname, origin:'https://'+hostname, protocol:'https:', href:'https://'+hostname+'/parcours-niveaux.html'},
    navigator:{userAgent:'Entry QA Chromium'},
    localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,String(value)),removeItem:key=>storage.delete(key)},
    sessionStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}},
    addEventListener:()=>{}, dispatchEvent:event=>events.push(event.type),
    CustomEvent:class {constructor(type, init){this.type=type;this.detail=init?.detail;}},
    fetch:async (request,options={})=>{
      const url = new URL(typeof request==='string'?request:request.url, 'https://'+hostname);
      calls.push(url.pathname);
      if (url.pathname==='/content/course-access.json') return {ok:true,status:200,json:async()=>rightsFile(),text:async()=>{
        const raw=read('content/course-access.json').toString();return rightsCorrupt?raw.replace('catalogue:en:0','catalogue:en:999999'):raw;
      }};
      if (url.pathname==='/.netlify/functions/check-status') {
        const headers=new Headers(options.headers||{});
        assert.equal(headers.get('Authorization'),null,'legacy device status does not inherit an unused stale bearer');
        if (fail) throw new Error('Simulated network outage');
        return {ok:status>=200&&status<300,status,json:async()=>body??{paid}};
      }
      throw new Error('Undeclared access request '+url.pathname);
    }
  };
  context.window=context; context.globalThis=context;
  vm.createContext(context); vm.runInContext(read('course-access.js').toString(),context,{filename:'course-access.js'});
  assert.ok(context.MelungaCourseAccess,'read-only access API');
  await context.MelungaCourseAccess.initialize();
  return {api:context.MelungaCourseAccess, calls, storage, events,
    makeReferenceMap(entries){const map=vm.runInContext('new Map()',context);for(const [key,value] of entries)map.set(key,value);return map;}};
}

async function open({hostname='melunga.com',paid=false,locale='fr',width=390,height=844,native=false,loginStatus=200,loginBody,checkStatus=200,checkBody,checkFails=false,legacyPlaceholder=false,sessionValues={},localValues={},cachedPaid='1'}={}) {
  const origin='https://'+hostname;
  const context = await browser.newContext({viewport:{width,height},isMobile:width<1024,hasTouch:width<1024,
    locale:'fr-FR',reducedMotion:'reduce',serviceWorkers:'block'});
  const fixture={paid,paths:[],api:[],errors:[],loginCalls:0};
  await context.addInitScript(({locale,native,sessionValues,localValues,cachedPaid})=>{
    localStorage.setItem('melunga-app-language',JSON.stringify({locale,label:locale}));
    localStorage.setItem('ox_device','entry-fixture-device');localStorage.setItem('ox_paid',cachedPaid);
    localStorage.setItem('ox_imm','1');
    for(const [key,value] of Object.entries(localValues))localStorage.setItem(key,value);
    for(const [key,value] of Object.entries(sessionValues))sessionStorage.setItem(key,value);
    if(native)window.Capacitor={isNativePlatform:()=>true,getPlatform:()=> 'android'};
    const voices=[];window.__entrySpeech=[];window.__entryAudioPlays=[];
    // Keep server audio entirely in memory; this suite exercises routing and
    // access, while the separate player suite covers media event failures.
    window.Audio=class {
      constructor(src=''){this.src=src;this.playbackRate=1;}
      play(){
        window.__entryAudioPlays.push({src:this.src,playbackRate:this.playbackRate});
        queueMicrotask(()=>{this.onplaying?.();this.onended?.();});
        return Promise.resolve();
      }
      pause(){}
      load(){}
      removeAttribute(name){if(name==='src')this.src='';}
    };
    const synthesis={cancel(){},getVoices:()=>voices,speak:u=>window.__entrySpeech.push({text:u.text,lang:u.lang}),addEventListener(){},removeEventListener(){}};
    Object.defineProperty(window,'speechSynthesis',{value:synthesis,configurable:true});
    window.SpeechSynthesisUtterance=class {constructor(text){this.text=text;}};
  },{locale,native,sessionValues,localValues,cachedPaid});
  await context.route('**/*',async route=>{
    const req=route.request(),url=new URL(req.url());
    if(url.origin!==origin){if(req.isNavigationRequest())report.externalNavigations.push(url.origin+url.pathname);return route.abort();}
    if(url.pathname.includes('/.netlify/')||url.pathname==='/api/geolocation'){
      fixture.api.push({path:url.pathname,method:req.method()});
      if(url.pathname.endsWith('/check-status')){
        assert.equal(req.headers().authorization,undefined,'active inline device contract remains device-only');
        if(checkFails)return route.abort('failed');
        return route.fulfill({status:checkStatus,json:checkBody??{paid:fixture.paid}});
      }
      if(url.pathname.endsWith('/get-pricing'))return route.fulfill({json:{country:'FR',monthlyDisplay:'7,90 €',annualDisplay:'42 €'}});
      if(url.pathname.endsWith('/tts')&&url.searchParams.get('catalog')==='chirp3'){
        assert.equal(url.searchParams.get('selectionVersion'),'kartech-2026-10-27');
        return route.fulfill({json:voiceCatalogue()});
      }
      if(url.pathname.endsWith('/tts'))return route.fulfill({status:503,json:{error:'simulated_audio_unavailable'}});
      if(url.pathname==='/api/geolocation')return route.fulfill({json:{country:'FR'}});
      if(url.pathname.endsWith('/login')){
        const body=req.postDataJSON();assert.equal(body.email,EMAIL);assert.equal(body.password,PASSWORD);
        fixture.loginCalls++;const response=loginBody??{success:true,permanent:true,session_token:'fictitious-entry-session'};
        if(loginStatus>=200&&loginStatus<300&&response.success)fixture.paid=true;
        return route.fulfill({status:loginStatus,json:response});
      }
      report.unexpectedApiCalls.push(url.pathname);return route.abort();
    }
    if(legacyPlaceholder&&url.pathname==='/app.html')return route.fulfill({contentType:'text/html',body:'<!doctype html><title>Classic route fixture</title><main id="classicRoute"></main>'});
    const pathname=url.pathname==='/'?'/index.html':url.pathname;
    const filename=path.resolve(WEB,'.'+pathname);
    if(!filename.startsWith(WEB+path.sep)||!fs.existsSync(filename)||!fs.statSync(filename).isFile())return route.fulfill({status:404,body:'Missing fixture'});
    return route.fulfill({contentType:({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json',
      '.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp'})[path.extname(filename)]||'application/octet-stream',body:fs.readFileSync(filename)});
  });
  const page=await context.newPage();
  page.on('pageerror',error=>{fixture.errors.push(error.message);report.errors.push(error.message);});
  page.on('framenavigated',frame=>{if(frame===page.mainFrame())fixture.paths.push(new URL(frame.url()).pathname);});
  return {page,context,fixture,origin};
}
async function readyCourse(page,pair,level,screen='themes'){
  await page.waitForFunction(({pair,level,screen})=>window.MelungaMockup?.state().screen===screen
    &&window.MelungaMockup.state().pairId===pair&&window.MelungaMockup.state().level===level,{pair,level,screen},{timeout:20000});
}
async function close(h){await h.context.close();report.cases.push({paths:h.fixture.paths,api:h.fixture.api,loginCalls:h.fixture.loginCalls});}

test('historical free rights reproduce the approved classic definitions and all 78 course JSON remain byte-exact',()=>{
  const asset=rightsFile();
  assert.equal(asset.sourceAppSha256,hash(baseline('app.html')),'rights are anchored to the approved classic app');
  for(const pair of PAIRS){
    const row=asset.pairs.find(row=>row.id===pair);assert.ok(row,pair);
    assert.deepEqual([...row.historicalFreeIds].sort(),historical[pair].ids,pair+' exact historical union');
    assert.equal(new Set(row.historicalFreeIds).size,COUNTS[pair]);
    if(row.historicalCatalogueFreeIds)assert.deepEqual([...row.historicalCatalogueFreeIds].sort(),historical[pair].sourceIds);
    if(row.historicalGuidedFreeIds)assert.deepEqual([...row.historicalGuidedFreeIds].sort(),historical[pair].guidedIds);
  }
  const current=nativeLayer.beforeBytes(path.join(WEB,'app.html')).toString();
  assert.deepEqual(variable(current,'DECKS'),decks,'32,115 classic cards are unchanged');
  assert.deepEqual(variable(current,'PEDAGOGY_FAMILIES'),families,'old guided families unchanged');
  for(const [filename] of documents)assert.ok(read(filename).equals(baseline(filename)),filename+' unchanged');
  const backend=execFileSync('git',['ls-tree','-r','--name-only',BASE,'melunga_deploy/netlify'],{cwd:ROOT}).toString().trim().split('\n');
  for(const filename of backend){
    const anchor=filename==='melunga_deploy/netlify/functions/tts.mjs'?APPROVED_TTS_COMMIT:BASE;
    assert.ok(fs.readFileSync(path.join(ROOT,filename)).equals(execFileSync('git',['show',anchor+':'+filename],{cwd:ROOT,maxBuffer:8*1024*1024})),filename+' whole approved backend unchanged');
  }
  report.historicalFreeCounts=COUNTS;report.freeIdCount=2218;report.contentJsonCount=documents.size;report.checks.push('rights-source-and-content');
});

test('production access ignores forged paid cache, keeps every old free card and limits unrestricted preview hosts',async()=>{
  const free=await isolatedAccess({paid:false});assert.equal(free.api.state().paid,false);
  let checked=0,moved=0,reserved=0,paid=0;
  for(const entry of models.values()){
    const allowed=expectedFree(entry.pair,entry.phrase,entry.level);
    assert.equal(free.api.canLearn(entry.pair,entry.phrase,entry.level),allowed,entry.pair+'/'+entry.phrase.id);
    checked++;if(historical[entry.pair].ids.includes(entry.phrase.id)&&entry.level>1)moved++;
    if(entry.reserved&&historical[entry.pair].ids.includes(entry.phrase.id))reserved++;
    if(!allowed)paid++;
  }
  assert(checked===33654&&moved>0&&reserved>0&&paid>0);
  let retainedHistorical=0,freeViewSteps=0;
  for(const pair of manifest.pairs){
    const bank=documents.get(pair.repertoirePath),references=free.makeReferenceMap([...bank.phrases,...bank.receivedModels].map(phrase=>[phrase.id,phrase]));
    for(const level of pair.levels){
      const cell=documents.get(level.dataPath),view=free.api.learningView(cell,references);
      assert.ok(view&&view.pair&&view.contextStepIds,'view is a derived pair with bounded comprehension context');
      for(const theme of cell.themes){
        const expected=theme.sequences.flatMap(sequence=>sequence.phraseIds).filter(id=>{
          const model=models.get(pair.id+'|'+id);assert.ok(model,'known learner canonical');return expectedFree(pair.id,model.phrase,model.level);
        });
        const actualTheme=view.pair.themes.find(candidate=>candidate.id===theme.id);
        if(expected.length)assert.ok(actualTheme,'a theme with free cards stays reachable');
        const actual=actualTheme?.sequences.flatMap(sequence=>sequence.phraseIds)||[];
        assert.deepEqual(Array.from(actual),expected,'free learner identities/order remain exact in '+pair.id+'/'+theme.id);
        retainedHistorical+=expected.filter(id=>historical[pair.id].ids.includes(id)).length;
        for(const sequence of actualTheme?.sequences||[])for(const step of sequence.steps){
          freeViewSteps++;
          if(view.contextStepIds.has(step.id)){
            const context=models.get(pair.id+'|'+step.utterance);
            if(context&&!expectedFree(context.pair,context.phrase,context.level)){
              assert.ok(['understand','receive'].includes(step.kind),'a paid model is only understood/received, never imitated');
              assert.equal(step.requiresProduction,false,'paid context never requires learner production');
            }else assert.ok(['understand','imitate','receive'].includes(step.kind),'bounded comprehension or independently free preparation');
          }
          else if(step.utterance){
            const learner=models.get(pair.id+'|'+step.utterance);
            if(learner)assert.ok(expectedFree(pair.id,learner.phrase,learner.level),'a paid learner step cannot leak into the free lesson');
            else assert.ok(step.kind==='receive','only a received model may lack a learner canonical');
          }
          else for(const id of step.choices||[]){const learner=models.get(pair.id+'|'+id);assert.ok(learner&&expectedFree(pair.id,learner.phrase,learner.level),'paid choices are excluded');}
        }
      }
    }
  }
  assert(retainedHistorical>0&&freeViewSteps>0);
  for(const config of [{paid:false,fail:true},{paid:true,status:500},{body:{paid:'true'}}]){
    const bad=await isolatedAccess(config);assert.equal(bad.api.state().paid,false,'unconfirmed paid state stays locked');
    const movedFree=[...models.values()].find(entry=>entry.level>1&&historical[entry.pair].ids.includes(entry.phrase.id));
    assert(bad.api.canLearn(movedFree.pair,movedFree.phrase,movedFree.level),'historical freebies survive a status failure');
  }
  await assert.rejects(isolatedAccess({paid:true,rightsCorrupt:true}),/Historical course access could not be verified/,'a corrupted whitelist cannot silently alter rights');
  const full=await isolatedAccess({paid:true});assert.equal(full.api.state().paid,true);
  const paidModel=[...models.values()].find(e=>!expectedFree(e.pair,e.phrase,e.level));assert(full.api.canLearn(paidModel.pair,paidModel.phrase,paidModel.level));
  for(const [hostname,expected] of [['deploy-preview-19--chic-dragon-e2baf2.netlify.app',true],['chic-dragon-e2baf2.netlify.app',false],
    ['branch--chic-dragon-e2baf2.netlify.app',false],['deploy-preview-19--other.netlify.app',false],['deploy-preview-19--chic-dragon-e2baf2.netlify.app.evil.example',false]]){
    const instance=await isolatedAccess({hostname});assert.equal(instance.api.state().mode==='preview',expected,hostname);
    assert.equal(instance.api.canLearn(paidModel.pair,paidModel.phrase,paidModel.level),expected,hostname+' permission');
  }
  report.accessModelsChecked=checked;report.movedHistoricalFree=moved;report.reservedHistoricalFree=reserved;
  report.freeViewStepsChecked=freeViewSteps;report.historicalFreePresentationsRetained=retainedHistorical;report.checks.push('permission-policy');
});

test('home free trial enters every supported web direction; native-device entries keep the classic route', {timeout:90000},async()=>{
  for(const config of [{locale:'fr',study:'zh',pair:'fr-zh',width:1280},{locale:'fr',study:'es',pair:'fr-es',width:390},
    {locale:'zh',study:'fr',pair:'zh-fr',width:390},
    {locale:'en',study:'es',pair:'en-es',width:1280}]){
    const h=await open(config);
    try{
      await h.page.goto(h.origin+'/index.html');
      const cta=h.page.locator('[data-dh-free]:visible,[data-go="language"]:visible,[data-select-access="free"]:visible').first();await cta.click();
      assert.equal(await h.page.locator('[data-launch-course]').count(),0,'no second start action is required');
      await h.page.locator('[data-study-language="'+config.study+'"]:visible').click();
      await h.page.waitForURL(url=>url.pathname==='/parcours-niveaux.html');
      const url=new URL(h.page.url());assert.equal(url.searchParams.get('pair'),config.pair);assert.equal(url.searchParams.get('level'),'1');
      await readyCourse(h.page,config.pair,1,'lesson');
      const state=await h.page.evaluate(()=>window.MelungaMockup.state());
      assert.equal(state.lessonScope,'theme');assert.equal(state.stepIndex,0);
      assert.equal(new URL(h.page.url()).searchParams.has('start'),false,'the first-lesson entry flag is consumed');
      await h.page.locator('#mgLessonView').waitFor({state:'visible'});
      assert.deepEqual(await h.page.evaluate(()=>window.__entryAudioPlays),[],'opening the first lesson never autoplays audio');
      assert.ok(!h.fixture.paths.includes('/app.html'),'free trial goes directly to the progressive lesson');
    }finally{await close(h);}
  }
  for(const config of [{locale:'fr',study:'zh',native:true}]){
    const h=await open({...config,legacyPlaceholder:true});
    try{
      await h.page.goto(h.origin+'/index.html');
      if(!(config.native&&new URL(h.page.url()).pathname==='/app.html')){
        if(config.native){
          // The native welcome deliberately hides the immediate web-trial CTA.
          // Follow its existing method carousel and then its free-L1 choice.
          await h.page.locator('[data-go="method"]:visible').first().click();
          for(let index=0;index<5;index++)await h.page.locator('[data-proof-next]:visible').click();
        }
        await h.page.locator('[data-dh-free]:visible,[data-go="language"]:visible,[data-select-access="free"]:visible').first().click();
        await h.page.locator('[data-study-language="'+config.study+'"]:visible').click();
        await h.page.waitForURL(url=>url.pathname==='/app.html');assert.equal(new URL(h.page.url()).searchParams.get('start'),'1');
      }
      assert.equal(new URL(h.page.url()).searchParams.get('courseReturn'),null);
    }finally{await close(h);}
  }
  const checkout=await open({width:1280,legacyPlaceholder:true});
  try{
    await checkout.page.goto(checkout.origin+'/index.html');
    await checkout.page.locator('[data-dh-plan="yearly"]:visible').first().click();
    await checkout.page.locator('[data-start-trial]:visible').click();
    await checkout.page.locator('[data-study-language="zh"]:visible').click();
    await checkout.page.waitForURL(url=>url.pathname==='/app.html');
    const url=new URL(checkout.page.url());assert.equal(url.searchParams.get('checkout'),'annual','annual checkout keeps the current payment flow');
    assert.equal(url.searchParams.get('study'),'zh');
  }finally{await close(checkout);}
  report.checks.push('home-trial-routing');
});

test('only a server-confirmed classic login returns to the allowlisted new course', {timeout:90000},async()=>{
  const home=await open({width:1280,localValues:{'melunga-course-pair':'fr-es','melunga-course-level':'4'}});
  try{
    await home.page.goto(home.origin+'/index.html');await home.page.locator('[data-go="signin"]:visible').first().click();
    await home.page.waitForURL(url=>url.pathname==='/app.html');
    const url=new URL(home.page.url());assert.equal(url.searchParams.get('courseReturn'),'fr-es');assert.equal(url.searchParams.get('courseLevel'),'4');
    await home.page.locator('#pwLoginEmail').fill(EMAIL);await home.page.locator('#pwLoginPassword').fill(PASSWORD);await home.page.locator('#pwLoginBtn').click();
    await home.page.waitForURL(url=>url.pathname==='/parcours-niveaux.html');
    assert.equal(new URL(home.page.url()).searchParams.get('pair'),'fr-es');assert.equal(new URL(home.page.url()).searchParams.get('level'),'4');
    await readyCourse(home.page,'fr-es',4);
    assert.equal(await home.page.evaluate(()=>localStorage.getItem('ox_session')),null,'the existing inline login does not gain new bearer storage');
  }finally{await close(home);}
  // The 42-pair domain now also includes English-native learners of French.
  const additional=await open({paid:true,locale:'en',cachedPaid:'0'});
  try{
    await additional.page.goto(additional.origin+'/app.html?login=1&lang=en&study=fr&courseReturn=en-fr&courseLevel=2');
    await additional.page.waitForURL(url=>url.pathname==='/parcours-niveaux.html');
    await readyCourse(additional.page,'en-fr',2);
    assert.equal(additional.fixture.loginCalls,0,'a confirmed device uses the newly supported direction without another login');
  }finally{await close(additional);}
  const target='/app.html?login=1&lang=fr&study=zh&courseReturn=fr-zh&courseLevel=2';
  const h=await open();
  try{
    await h.page.goto(h.origin+target);await h.page.locator('#pwLoginEmail').fill(EMAIL);await h.page.locator('#pwLoginPassword').fill(PASSWORD);await h.page.locator('#pwLoginBtn').click();
    await h.page.waitForURL(url=>url.pathname==='/parcours-niveaux.html');assert.equal(new URL(h.page.url()).searchParams.get('pair'),'fr-zh');
    assert.equal(new URL(h.page.url()).searchParams.get('level'),'2');await readyCourse(h.page,'fr-zh',2);assert.equal(h.fixture.loginCalls,1);
  }finally{await close(h);}
  const existing=await open({paid:true,cachedPaid:'0'});
  try{
    await existing.page.goto(existing.origin+target);
    await existing.page.waitForURL(url=>url.pathname==='/parcours-niveaux.html');
    await readyCourse(existing.page,'fr-zh',2);assert.equal(existing.fixture.loginCalls,0,'an already verified device resumes without a second login');
  }finally{await close(existing);}
  for(const config of [{loginStatus:401,loginBody:{success:false,error:'invalid_credentials'}},
    {loginStatus:409,loginBody:{success:false,error:'device_limit'}},{loginStatus:500,loginBody:{success:true}}]){
    const f=await open(config);
    try{
      await f.page.goto(f.origin+target);await f.page.locator('#pwLoginEmail').fill(EMAIL);await f.page.locator('#pwLoginPassword').fill(PASSWORD);await f.page.locator('#pwLoginBtn').click();
      await f.page.waitForFunction(()=>!document.getElementById('pwLoginBtn').disabled||document.getElementById('paywall').style.display==='none');
      assert.equal(new URL(f.page.url()).pathname,'/app.html','unconfirmed login cannot return');
    }finally{await close(f);}
  }
  report.checks.push('confirmed-login-return');
});

test('return parameters refuse foreign URLs, wrong native pairs and a forged cached paid status', {timeout:90000},async()=>{
  for(const value of ['https://outside.example/path','//outside.example/path','../index.html','javascript:alert(1)','fr-fr','fr-de','zh-fr','en-fr']){
    const h=await open({paid:true,cachedPaid:'0'});
    try{
      await h.page.goto(h.origin+'/app.html?login=1&lang=fr&study=zh&courseReturn='+encodeURIComponent(value)+'&courseLevel=2');
      await h.page.waitForFunction(()=>typeof isPaid!=='undefined'&&isPaid===true);
      assert.equal(new URL(h.page.url()).pathname,'/app.html','invalid return stays classic');
    }finally{await close(h);}
  }
  for(const duplicate of ['&courseReturn=fr-zh','&lang=en','&study=en','&courseLevel=3']){
    const duplicated=await open({paid:true,cachedPaid:'0'});
    try{
      await duplicated.page.goto(duplicated.origin+'/app.html?login=1&lang=fr&study=zh&courseReturn=fr-zh&courseLevel=2'+duplicate);
      await duplicated.page.waitForFunction(()=>typeof isPaid!=='undefined'&&isPaid===true);
      assert.equal(new URL(duplicated.page.url()).pathname,'/app.html','duplicate return coordinates cannot choose a course');
    }finally{await close(duplicated);}
  }
  const h=await open({paid:false});
  try{
    await h.page.goto(h.origin+'/app.html?login=1&lang=fr&study=zh&courseReturn=fr-zh&courseLevel=2');
    await h.page.waitForFunction(()=>typeof isPaid!=='undefined'&&isPaid===false);
    assert.equal(new URL(h.page.url()).pathname,'/app.html');assert.equal(await h.page.locator('#paywall').isVisible(),true);
  }finally{await close(h);}
  report.checks.push('return-allowlist');
});

test('actual free and paid modern pages preserve source fields, moved freebies and classic fallback', {timeout:90000},async()=>{
  const themeEntries=[];
  for(const pair of manifest.pairs)for(const level of pair.levels){
    const cell=documents.get(level.dataPath);if(cell.level===1)continue;
    for(const theme of cell.themes){
      const entries=theme.sequences.flatMap(sequence=>sequence.phraseIds).map(id=>models.get(pair.id+'|'+id));
      if(entries.length&&entries.every(Boolean))themeEntries.push({pair:pair.id,level:cell.level,theme,entries});
    }
  }
  const mixed=themeEntries.filter(row=>row.entries.some(entry=>historical[row.pair].ids.includes(entry.phrase.id))
    &&row.entries.some(entry=>!expectedFree(row.pair,entry.phrase,entry.level))
    &&row.theme.sequences.every(sequence=>!sequence.preparationIds.length&&sequence.steps.every(step=>step.kind!=='receive')))
    .sort((a,b)=>a.entries.filter(e=>expectedFree(e.pair,e.phrase,e.level)).length-b.entries.filter(e=>expectedFree(e.pair,e.phrase,e.level)).length)[0];
  const paidOnly=themeEntries.find(row=>row.entries.every(entry=>!expectedFree(entry.pair,entry.phrase,entry.level)));
  assert.ok(mixed&&paidOnly,'real mixed-free and paid-only fixtures');
  const expectedIds=[...new Set(mixed.entries.filter(entry=>expectedFree(entry.pair,entry.phrase,entry.level)).map(entry=>entry.phrase.id))];
  const free=await open({paid:false});
  try{
    await free.page.goto(free.origin+'/parcours-niveaux.html?pair='+mixed.pair+'&level='+mixed.level);await readyCourse(free.page,mixed.pair,mixed.level);
    await free.page.waitForFunction(()=>window.MelungaVoiceSelection?.state().status==='ready');
    assert.equal(await free.page.evaluate(()=>window.MelungaCourseAccess.state().paid),false);
    const freeCell=documents.get(PREFIX+mixed.pair+'/L'+mixed.level+'.json');
    await free.page.locator('#mgThemeGrid > button').nth(freeCell.themes.findIndex(theme=>theme.id===mixed.theme.id)).click();
    const seen=new Set();
    for(let i=0;i<Math.max(40,expectedIds.length*5);i++){
      const current=await free.page.evaluate(()=>window.MelungaMockup.state());if(current.screen==='done')break;
      if(await free.page.locator('#mgContinue').isDisabled())await free.page.locator('#mgChoices button:visible').first().click();
      const state=await free.page.evaluate(()=>window.MelungaMockup.state()),entry=models.get(mixed.pair+'|'+state.phraseId);
      assert.ok(entry&&expectedFree(entry.pair,entry.phrase,entry.level),'every produced free-view model is allowed');seen.add(entry.phrase.id);
      if(state.masked){
        const beforeAudio=await free.page.evaluate(()=>window.__entryAudioPlays.length);
        await free.page.locator('#mgEar').click();
        const plays=await free.page.evaluate(()=>window.__entryAudioPlays);
        assert.equal(plays.length,beforeAudio+1,'the revealed free card reaches the in-memory server audio fixture');
        const audioUrl=new URL(plays.at(-1).src,free.origin);
        assert.equal(audioUrl.pathname,'/.netlify/functions/tts');
        assert.equal(audioUrl.searchParams.get('text'),entry.phrase.study,'audio receives the whole studied phrase, never its phonetic aid');
      }
      assert.equal((await free.page.locator('#mgPhrase').textContent()).trim(),entry.phrase.study);
      assert.equal((await free.page.locator('#mgPhon').textContent()).trim(),entry.phrase.phon);
      await free.page.locator('#mgContinue').click();
    }
    assert.equal(await free.page.evaluate(()=>window.MelungaMockup.state().screen),'done');
    assert.deepEqual([...seen].sort(),expectedIds.sort(),'the entire free mixed theme retains all original freebies and no paid cards');
    await free.page.locator('#mgMenuTrigger').click();
    assert.equal(await free.page.locator('[data-menu-item="Toutes les leçons"]').count(),0,'removed menu entry stays absent');
    // Removing a navigation row does not remove the existing classic fallback
    // or its historical free-card rights, checked independently above.
    const classicHref=await free.page.evaluate(pair=>window.MelungaCourseAccess.classicUrl(pair),mixed.pair);
    const classic=new URL(classicHref,free.origin);
    assert.equal(classic.pathname,'/app.html');
    assert.equal(classic.searchParams.get('classic'),'1');
  }finally{await close(free);}
  for(const paid of [false,true]){
    const h=await open({paid});
    try{
      await h.page.goto(h.origin+'/parcours-niveaux.html?pair='+paidOnly.pair+'&level='+paidOnly.level);await readyCourse(h.page,paidOnly.pair,paidOnly.level);
      const paidCell=documents.get(PREFIX+paidOnly.pair+'/L'+paidOnly.level+'.json');
      await h.page.locator('#mgThemeGrid > button').nth(paidCell.themes.findIndex(theme=>theme.id===paidOnly.theme.id)).click();
      if(!paid){await h.page.waitForURL(url=>url.pathname==='/app.html');assert.equal(new URL(h.page.url()).searchParams.get('login'),'1');}
      else{
        await h.page.waitForFunction(()=>window.MelungaMockup.state().screen==='lesson');
        const current=await h.page.evaluate(()=>window.MelungaMockup.state()),entry=models.get(paidOnly.pair+'|'+current.phraseId);
        assert.ok(entry&&!expectedFree(entry.pair,entry.phrase,entry.level),'an actually paid-only card is reachable to the verified subscriber');
        assert.equal((await h.page.locator('#mgPhrase').textContent()).trim(),entry.phrase.study);
        assert.equal((await h.page.locator('#mgPhon').textContent()).trim(),entry.phrase.phon);
        h.fixture.paid=false;
        const spoken=await h.page.evaluate(()=>({speech:window.__entrySpeech.length,audio:window.__entryAudioPlays.length}));
        await h.page.evaluate(()=>{
          localStorage.removeItem('ox_device');localStorage.setItem('ox_paid','0');
          dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));
        });
        await h.page.waitForFunction(()=>window.MelungaCourseAccess.state().ready&&!window.MelungaCourseAccess.state().paid
          &&window.MelungaMockup.state().screen==='themes');
        await h.page.evaluate(()=>document.getElementById('mgEar').click());
        assert.deepEqual(await h.page.evaluate(()=>({speech:window.__entrySpeech.length,audio:window.__entryAudioPlays.length})),spoken,'a restored revoked page cannot speak the old paid card through either audio path');
        assert.equal(await h.page.locator('#mgLessonView').isVisible(),false,'paid lesson is hidden after restored free state');
      }
    }finally{await close(h);}
  }
  report.checks.push('modern-free-paid-dom');
});
