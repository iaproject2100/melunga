/* Level progress acceptance: exact independent card identities, explicit known
 * declarations, persistent local status and an unchanged lesson/classic UI.
 * Local Chromium and emulated screens; only read-only access GETs are mocked. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const {test,before,after}=require('node:test');
const {chromium}=require('playwright-core');
const REPO=path.resolve(__dirname,'../..'),WEB=path.join(REPO,'melunga_deploy');
const BASE='a1085e8cd1b0a070af3b458e3c40b503d8ae0b6f',ORIGIN='https://level-progress.test';
// The account component changes course-access. Original-logo clipping has
// its own whole CSS pin; other protected files keep the public main reference.
const LOGO_CSS_SHA='40e8c1ad854c4147ef303a7cd4b77633dcd554b689d035e21800f5204ddbf7a2';
const ACCOUNT_COMPONENT_REF='665d0def5df2644bb8421553ed4876292ef23f10';
const KNOWN='melunga-guided-known-v1',REVIEW='melunga-guided-review-v1';
const read=f=>JSON.parse(fs.readFileSync(path.join(WEB,f),'utf8'));
const manifest=read('content/niveaux-progressifs/manifest.json');
const sourceFiles=['content/niveaux-progressifs/manifest.json',...manifest.pairs.flatMap(p=>[p.repertoirePath,...p.levels.map(l=>l.dataPath)])];
const protectedFiles=['maquette-guidee.css','melunga-logo.png','assets/melunga-logo.png','app.html','index.html','desktop-home.js','course-access.js','content/course-access.json','store-billing.js','netlify/functions/get-pricing.mjs','netlify/functions/login.mjs','netlify/functions/check-status.mjs','netlify/functions/create-payment-link.mjs'];
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const baseline=f=>execFileSync('git',['show',(f==='course-access.js'?ACCOUNT_COMPONENT_REF:BASE)+':melunga_deploy/'+f],{cwd:REPO,maxBuffer:40*1024*1024});
const fingerprint=()=>Object.fromEntries([__filename,...sourceFiles.concat(protectedFiles,['maquette-guidee.js','parcours-niveaux.html','maquette-guidee.html','melunga-logo.svg']).map(f=>path.join(WEB,f))].sort().map(f=>[path.relative(REPO,f),sha(fs.readFileSync(f))]));
const cells=new Map(),banks=new Map();
function cell(pair,level=1){const key=pair+':'+level;if(!cells.has(key))cells.set(key,read('content/niveaux-progressifs/'+pair+'/L'+level+'.json'));return cells.get(key);}
function bank(pair){if(!banks.has(pair))banks.set(pair,read('content/niveaux-progressifs/repertoires/'+pair+'.json'));return banks.get(pair);}
function levelData(pair,level=1){
 const raw=cell(pair,level),models=new Map([...bank(pair).phrases,...(bank(pair).receivedModels||[]),...raw.themes.flatMap(t=>t.phrases)].map(p=>[p.id,p]));
 const positions=[];
 for(const theme of raw.themes){
  if(theme.isTemplate||theme.isTemplateCollection)continue;
  for(const sequence of theme.sequences)for(const id of sequence.phraseIds){
   const p=models.get(id);assert.ok(p,'validated level identity resolves '+pair+'/'+id);
   if(!p.isTemplate&&p.kind!=='received'&&p.speaker!=='B')positions.push(id);
  }
 }
 return{raw,models,positions,ids:[...new Set(positions)]};
}
function registry(pairs){return JSON.stringify({version:1,pairs});}
function expected(pair,level,known){const ids=levelData(pair,level).ids,knownSet=new Set(known||[]),count=ids.filter(id=>knownSet.has(id)).length;return{known:count,total:ids.length,ratio:ids.length?count/ids.length:0,percent:ids.length?Math.floor(count/ids.length*100):0};}
const report={status:'running',baseCommit:BASE,courseAccessSourceRef:ACCOUNT_COMPONENT_REF,environment:'local Chromium, mobile and desktop sizes emulated',publicSiteChecked:false,physicalPhoneChecked:false,realAccountsUsed:false,actualAudioPlayed:false,
 apiFixture:'only GET check-status mocked; browser speech instrumented; no login, billing, feedback or TTS API calls',checks:[],cases:[],errors:[],unexpectedRequests:[],mockedStatusChecks:0,signInHandoffs:[],screenshots:[]};
const required=['source-and-unchanged-theme-counts','fresh-and-localized-header','known-review-and-persistence','continue-storage-events-and-pair-scope','whole-level-free-access-denominator','storage-failure-and-legacy-scope'];
let browser,inputs;
const checked=async(name,fn)=>{try{await fn();report.checks.push(name);}catch(error){report.errors.push(name+': '+error.message);throw error;}};
before(async()=>{inputs=fingerprint();browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});});
after(async()=>{await browser?.close();report.inputsStable=JSON.stringify(inputs)===JSON.stringify(fingerprint());report.inputSha256=inputs;report.missingChecks=required.filter(n=>!report.checks.includes(n));report.status=!report.errors.length&&!report.unexpectedRequests.length&&!report.missingChecks.length&&report.inputsStable?'passed':'failed';if(process.env.LEVEL_PROGRESS_REPORT)fs.writeFileSync(process.env.LEVEL_PROGRESS_REPORT,JSON.stringify(report,null,2)+'\n');assert.equal(report.inputsStable,true);assert.deepEqual(report.errors,[]);assert.deepEqual(report.unexpectedRequests,[]);assert.deepEqual(report.missingChecks,[]);});
async function fixture({pair='fr-ja',level=1,width=390,height=700,paid=false,knownRaw,reviewEntries=[],baselineJs=false,legacy=false}={}){
 const context=await browser.newContext({viewport:{width,height},isMobile:width<=760,hasTouch:width<=760,reducedMotion:'reduce',serviceWorkers:'block'});
 await context.addInitScript(({knownRaw,hasSeed,reviewEntries,knownKey,reviewKey})=>{
  if(!localStorage.getItem('__level-progress-fixture-seeded')){
   localStorage.setItem('__level-progress-fixture-seeded','1');localStorage.setItem('ox_device','level-progress-regression');
   localStorage.setItem('ox_known_ja',JSON.stringify({'ja|マリーと言います。':true}));
   if(hasSeed)localStorage.setItem(knownKey,knownRaw);
   if(reviewEntries.length)localStorage.setItem(reviewKey,JSON.stringify({version:1,entries:reviewEntries}));
  }
  window.__knownWriteFail=false;const nativeSet=Storage.prototype.setItem;
  Storage.prototype.setItem=function(key,value){if(window.__knownWriteFail&&key===knownKey)throw new DOMException('Fixture known-state quota failure','QuotaExceededError');return nativeSet.call(this,key,value);};
  window.__progressSpeech=[];window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};
  Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},getVoices(){return[];},addEventListener(){},speak(u){window.__progressSpeech.push(u.text);u.onend?.();}}});
 },{knownRaw:knownRaw??null,hasSeed:knownRaw!==undefined,reviewEntries,knownKey:KNOWN,reviewKey:REVIEW});
 await context.route('**/*',async route=>{
  const req=route.request(),url=new URL(req.url());
  if(url.origin!==ORIGIN){report.unexpectedRequests.push({url:url.origin+url.pathname,method:req.method()});return route.abort();}
  if(url.pathname==='/.netlify/functions/check-status'&&req.method()==='GET'){report.mockedStatusChecks++;return route.fulfill({json:{paid}});}
  if(req.method()!=='GET'||/^\/(?:\.netlify|api)\//.test(url.pathname)){report.unexpectedRequests.push({path:url.pathname,method:req.method()});return route.abort();}
  if(url.pathname==='/app.html'){report.signInHandoffs.push(url.pathname+url.search);return route.fulfill({contentType:'text/html',body:'<!doctype html><title>Expected sign-in handoff</title>'});}
  const relative=decodeURIComponent(url.pathname).replace(/^\//,'')||'parcours-niveaux.html',file=path.resolve(WEB,relative);
  if(!file.startsWith(WEB+path.sep)||!fs.existsSync(file))return route.fulfill({status:404,body:'Not found'});
  const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2'};
  return route.fulfill({contentType:types[path.extname(file)]||'application/octet-stream',body:baselineJs&&relative==='maquette-guidee.js'?baseline(relative):fs.readFileSync(file)});
 });
 const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));await page.goto(ORIGIN+(legacy?'/maquette-guidee.html':'/parcours-niveaux.html')+'?pair='+pair+'&level='+level);await ready(page,pair,level);return{context,page};
}
async function ready(page,pair,level=1){await page.waitForFunction(({pair,level})=>{const s=window.MelungaMockup?.state();return s?.screen==='themes'&&s.pairId===pair&&s.level===level;},{pair,level});await settled(page);}
async function settled(page){await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));}
async function knownIds(page,pair){return page.evaluate(({key,pair})=>{try{return JSON.parse(localStorage.getItem(key)||'{}').pairs?.[pair]||[];}catch(_){return[];}},{key:KNOWN,pair});}
async function review(page){return page.evaluate(key=>{try{return JSON.parse(localStorage.getItem(key)||'{}').entries||[];}catch(_){return[];}},REVIEW);}
async function progress(page,pair,level,known){
 const e=expected(pair,level,known),caption=(pair==='zh-fr'?'第 '+level+' 级':'Niveau '+level)+' · '+e.percent+' %';
 await page.waitForFunction(c=>document.getElementById('mgCounter').textContent===c,caption);
 assert.equal(await page.locator('#mgCounter').textContent(),caption);
 const actual=await page.locator('#mgProgress').evaluate(n=>({width:parseFloat(n.style.width)||0,track:n.parentElement.getAttribute('role'),hidden:n.parentElement.getAttribute('aria-hidden'),now:n.parentElement.getAttribute('aria-valuenow'),min:n.parentElement.getAttribute('aria-valuemin'),max:n.parentElement.getAttribute('aria-valuemax'),label:n.parentElement.getAttribute('aria-label'),text:n.parentElement.getAttribute('aria-valuetext')}));
 assert.ok(Math.abs(actual.width-e.ratio*100)<0.0001,'bar reflects the independently computed whole-level share '+JSON.stringify({actual,e}));
 assert.equal(actual.track,'progressbar');assert.notEqual(actual.hidden,'true');assert.equal(Number(actual.min),0);assert.equal(Number(actual.max),100);assert.ok(Math.abs(Number(actual.now)-e.ratio*100)<1.001);
 assert.ok((actual.label||actual.text||'').includes(pair==='zh-fr'?'级':'Niveau'),'progress has a native-language accessible label');
 if(actual.text)assert.equal(actual.text,caption);
 const b=await page.locator('#mgCounter').evaluate(n=>{const r=n.getBoundingClientRect();return{left:r.left,right:r.right,top:r.top,bottom:r.bottom,scrollWidth:n.scrollWidth,clientWidth:n.clientWidth,innerWidth,bodyWidth:document.documentElement.scrollWidth};});
 assert.ok(b.left>=-1&&b.right<=b.innerWidth+1&&b.scrollWidth<=b.clientWidth+1&&b.bodyWidth<=b.innerWidth+1,'short progress caption fits mobile '+JSON.stringify(b));
 return{...e,caption,track:actual};
}
async function enter(page,index=0){await page.locator('#mgThemeGrid .mg-theme').nth(index).click();await page.waitForFunction(()=>window.MelungaMockup.state().screen==='lesson');await settled(page);}
async function themes(page){await page.locator('#mgBack').click();await page.waitForFunction(()=>window.MelungaMockup.state().screen==='themes');await settled(page);}
async function gesture(page,dx,dy=0){const box=await page.locator('#mgTranslation').boundingBox();assert.ok(box);const x=box.x+box.width/2,y=box.y+box.height/2,cdp=await page.context().newCDPSession(page);try{await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx/2,y:y+dy/2}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx,y:y+dy}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}finally{await cdp.detach();}await settled(page);await page.waitForTimeout(230);}
async function next(page){if(await page.locator('#mgContinue').isDisabled())await page.locator('#mgChoices .mg-choice').first().click();await page.locator('#mgContinue').click();await settled(page);}
async function capture(page,name){const dir=process.env.LEVEL_PROGRESS_CAPTURES;if(!dir)return;fs.mkdirSync(dir,{recursive:true});const f=path.join(dir,name+'.png');await page.screenshot({path:f});report.screenshots.push(f);}
async function getState(page){return page.evaluate(()=>window.MelungaMockup.state());}

test('card sources, access, prices, logo and per-theme counters are preserved', {timeout:60000},()=>checked('source-and-unchanged-theme-counts',async()=>{
 assert.equal(sourceFiles.length,78);for(const f of sourceFiles.concat(protectedFiles)){if(f==='maquette-guidee.css'){assert.equal(sha(fs.readFileSync(path.join(WEB,f))),LOGO_CSS_SHA,'whole reviewed logo CSS');continue;}assert.ok(baseline(f).equals(fs.readFileSync(path.join(WEB,f))),'whole protected file '+f);}report.reviewedLogoCssSha256=LOGO_CSS_SHA;
 const a=await fixture({baselineJs:true}),b=await fixture();try{const oldCounts=await a.page.locator('#mgThemeGrid .mg-theme-count').allTextContents(),newCounts=await b.page.locator('#mgThemeGrid .mg-theme-count').allTextContents();assert.deepEqual(newCounts,oldCounts);assert.ok(newCounts.includes('15 expressions'));assert.match(await a.page.locator('#mgCounter').textContent(),/116 expressions.*234 mots/);await progress(b.page,'fr-ja',1,[]);report.cases.push({name:'conservation',runtimeJson:78,protectedFiles:protectedFiles.length,themeCounts:newCounts});}finally{await a.context.close();await b.context.close();}
}));

test('fresh and Chinese-native students see a fitting zero or persisted level percentage', {timeout:60000},()=>checked('fresh-and-localized-header',async()=>{
 assert.equal(levelData('fr-ja').ids.length,361);assert.equal(levelData('fr-zh').ids.length,314);assert.equal(levelData('zh-fr').ids.length,344);assert.equal(levelData('fr-ja').positions.length,363);
 for(const options of [{pair:'fr-ja',width:390,height:700,capture:'fresh-level-zero'},{pair:'zh-fr',width:390,height:700,capture:'chinese-native-level-progress',knownRaw:registry({'zh-fr':levelData('zh-fr').ids.slice(0,86)})},{pair:'fr-ja',width:280,height:500,knownRaw:'{malformed-json'}]){
  const f=await fixture(options);try{const seeded=options.pair==='zh-fr'?levelData('zh-fr').ids.slice(0,86):[];const p=await progress(f.page,options.pair,1,seeded);if(options.capture)await capture(f.page,options.capture);report.cases.push({name:'fresh-localized-mobile',pair:options.pair,width:options.width,...p});}finally{await f.context.close();}
 }
 const ids=levelData('fr-ja').ids,duplicates=levelData('fr-ja').positions.filter((id,i,list)=>list.indexOf(id)!==i),same=duplicates[0];assert.ok(same);
 const f=await fixture({knownRaw:registry({'fr-ja':[same,same,same,'not-a-current-card']})});try{const p=await progress(f.page,'fr-ja',1,[same]);assert.equal(p.known,1);report.cases.push({name:'deduplicated-known-and-presentations',...p});}finally{await f.context.close();}
}));

test('real right swipes persist explicit knowledge and À revoir reverses it without inventing completion', {timeout:60000},()=>checked('known-review-and-persistence',async()=>{
 const {ids}=levelData('fr-ja'),first=cell('fr-ja').themes[0].sequences[0].phraseIds[0],initial=ids.filter(id=>id!==first);
 const f=await fixture({knownRaw:registry({'fr-ja':initial})});try{
  const {page}=f;assert.equal((await progress(page,'fr-ja',1,initial)).percent,99,'one missing card never rounds to 100');
  const classicBefore=await page.evaluate(()=>localStorage.getItem('ox_known_ja'));
  await enter(page);assert.equal((await getState(page)).phraseId,first);await gesture(page,105,3);assert.ok((await knownIds(page,'fr-ja')).includes(first));await themes(page);await progress(page,'fr-ja',1,ids);
  await page.reload();await ready(page,'fr-ja');await progress(page,'fr-ja',1,ids);assert.equal(await page.evaluate(()=>localStorage.getItem('ox_known_ja')),classicBefore,'classic progress is not touched');
  await enter(page);assert.equal((await getState(page)).phraseId,first);await page.locator('#mgReplay').click();assert.ok(!(await knownIds(page,'fr-ja')).includes(first));assert.ok((await review(page)).some(row=>row.id===first));await themes(page);await progress(page,'fr-ja',1,initial);
  await page.locator('#mgMenuTrigger').click();await page.locator('[data-menu-item="À revoir"]').click();await page.locator('.mg-saved-review-item[data-review-id="'+first+'"] [data-review-action="remove"]').click();await page.keyboard.press('Escape');await page.locator('#mgMenuDialog').waitFor({state:'hidden'});await progress(page,'fr-ja',1,initial);assert.ok(!(await knownIds(page,'fr-ja')).includes(first),'removing a review bookmark does not declare knowledge');
  const sample=ids.slice(0,37);await page.evaluate(({key,value})=>{localStorage.setItem(key,value);window.dispatchEvent(new StorageEvent('storage',{key,newValue:value}));},{key:KNOWN,value:registry({'fr-ja':sample})});await progress(page,'fr-ja',1,sample);await page.reload();await ready(page,'fr-ja');await progress(page,'fr-ja',1,sample);await capture(page,'persisted-level-progress');
  report.cases.push({name:'known-persistence-and-review-reversal',total:ids.length,knownAfterExplicitSwipe:ids.length,knownAfterReview:initial.length});
 }finally{await f.context.close();}
}));

test('Continue, listening and theme completion do not declare knowledge; storage updates stay scoped', {timeout:90000},()=>checked('continue-storage-events-and-pair-scope',async()=>{
 const ja=levelData('fr-ja').ids,zh=levelData('fr-zh').ids,seed={'fr-ja':ja.slice(0,37),'fr-zh':zh.slice(0,73)};
 const f=await fixture({knownRaw:registry(seed)});try{
  const {page}=f;await progress(page,'fr-ja',1,seed['fr-ja']);const original=await page.evaluate(key=>localStorage.getItem(key),KNOWN);
  await enter(page);const counter=await page.locator('#mgCounter').textContent();assert.match(counter,/\d+ \/ \d+/);assert.equal(await page.getByRole('progressbar').count(),0,'lesson progress is not announced as the whole-level percentage');await next(page);await page.locator('#mgEar').click();await settled(page);assert.equal(await page.evaluate(key=>localStorage.getItem(key),KNOWN),original,'continue/listening do not write known status');await themes(page);await progress(page,'fr-ja',1,seed['fr-ja']);
  await page.goto(ORIGIN+'/parcours-niveaux.html?pair=fr-zh&level=1');await ready(page,'fr-zh');await progress(page,'fr-zh',1,seed['fr-zh']);
  await page.locator('#mgLevelTrigger').click();await page.locator('#mgLevelChoices button[data-level="2"]').click();await ready(page,'fr-zh',2);const p2=await progress(page,'fr-zh',2,seed['fr-zh']);report.cases.push({name:'pair-and-level-scoped-identities',...p2});
  await page.goto(ORIGIN+'/parcours-niveaux.html?pair=fr-ja&level=1');await ready(page,'fr-ja');
  const other=await f.context.newPage();other.on('pageerror',e=>report.errors.push(e.message));await other.goto(ORIGIN+'/parcours-niveaux.html?pair=fr-ja&level=1');await ready(other,'fr-ja');await other.evaluate(({key,value})=>localStorage.setItem(key,value),{key:KNOWN,value:registry({'fr-ja':ja.slice(0,74)})});await progress(page,'fr-ja',1,ja.slice(0,74));
  await enter(page);const before=await getState(page),lessonCounter=await page.locator('#mgCounter').textContent();await other.evaluate(({key,value})=>localStorage.setItem(key,value),{key:KNOWN,value:registry({'fr-ja':ja})});await page.waitForTimeout(60);assert.equal((await getState(page)).phraseId,before.phraseId);assert.equal((await getState(page)).stepIndex,before.stepIndex);assert.equal(await page.locator('#mgCounter').textContent(),lessonCounter);await themes(page);await progress(page,'fr-ja',1,ja);await other.close();
 }finally{await f.context.close();}
 const z=await fixture({pair:'fr-zh'});try{const shortest=cell('fr-zh').themes.map((t,i)=>({i,steps:t.sequences.flatMap(s=>s.steps).length})).sort((a,b)=>a.steps-b.steps)[0];await enter(z.page,shortest.i);for(let n=0;n<160&&(await getState(z.page)).screen!=='done';n++)await next(z.page);assert.equal((await getState(z.page)).screen,'done');assert.deepEqual(await knownIds(z.page,'fr-zh'),[]);await z.page.locator('.mg-brand').click();await ready(z.page,'fr-zh');await progress(z.page,'fr-zh',1,[]);report.cases.push({name:'completion-does-not-imply-knowledge',steps:shortest.steps});}finally{await z.context.close();}
}));

test('non-paying progress uses the complete raw level denominator and never unlocks paid topics', {timeout:60000},()=>checked('whole-level-free-access-denominator',async()=>{
 const pair='fr-ja',data=levelData(pair,2),rights=new Set(read('content/course-access.json').pairs.find(p=>p.id===pair).historicalFreeIds);
 const accessible=data.ids.filter(id=>{const p=data.models.get(id);return rights.has(id)||p.editorialLevel===1||p.source?.sourceLevel===1&&/^conversation/.test(p.source?.collection||'');});assert.ok(accessible.length>0&&accessible.length<data.ids.length);
 const f=await fixture({pair,level:2,knownRaw:registry({[pair]:accessible}),paid:false});try{const p=await progress(f.page,pair,2,accessible);assert.equal(p.total,674);assert.ok(p.percent>0&&p.percent<100);assert.equal((await getState(f.page)).access.paid,false);const locked=f.page.locator('#mgThemeGrid button[data-access="paid"]');assert.ok(await locked.count()>0);const target=locked.first();await target.click();await f.page.waitForURL(url=>url.pathname==='/app.html');assert.equal(new URL(f.page.url()).searchParams.get('login'),'1');report.cases.push({name:'full-denominator-with-free-subset',accessible:accessible.length,...p});}finally{await f.context.close();}
}));

test('failed local persistence does not advance or fake knowledge and legacy L1 stays separate', {timeout:60000},()=>checked('storage-failure-and-legacy-scope',async()=>{
 const data=levelData('fr-ja'),first=cell('fr-ja').themes[0].sequences[0].phraseIds[0],p=data.models.get(first),remaining=data.ids.filter(id=>id!==first),saved={id:first,pairId:'fr-ja',level:1,themeId:cell('fr-ja').themes[0].id,study:p.study,native:p.native,addedAt:1};
 const f=await fixture({knownRaw:registry({'fr-ja':remaining}),reviewEntries:[saved]});try{await enter(f.page);const before=await getState(f.page);await f.page.evaluate(()=>{window.__knownWriteFail=true;});await gesture(f.page,105,3);assert.equal((await getState(f.page)).phraseId,before.phraseId);assert.equal((await getState(f.page)).stepIndex,before.stepIndex);assert.deepEqual(await knownIds(f.page,'fr-ja'),remaining);assert.deepEqual(await review(f.page),[saved],'failed known write restores the saved review row');assert.ok((await f.page.locator('#mgStatus').textContent()).length>0);
  await f.page.evaluate(()=>{window.__knownWriteFail=false;});await gesture(f.page,105,3);assert.ok((await knownIds(f.page,'fr-ja')).includes(first));await themes(f.page);await progress(f.page,'fr-ja',1,data.ids);report.cases.push({name:'failed-known-write-does-not-consume-card'});
 }finally{await f.context.close();}
 const legacy=await fixture({pair:'fr-zh',legacy:true,knownRaw:registry({'fr-zh':levelData('fr-zh').ids.slice(0,37)})});try{assert.ok(!/^Niveau/.test(await legacy.page.locator('#mgCounter').textContent()));assert.equal(await legacy.page.getByRole('progressbar').count(),0);const before=await legacy.page.evaluate(key=>localStorage.getItem(key),KNOWN);await enter(legacy.page);await gesture(legacy.page,105,3);assert.equal(await legacy.page.evaluate(key=>localStorage.getItem(key),KNOWN),before,'legacy preview does not create modern progress');report.cases.push({name:'legacy-L1-preserved'});}finally{await legacy.context.close();}
}));
