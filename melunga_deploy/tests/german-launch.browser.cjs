/* German study-target launch acceptance. All HTTP, accounts, voices and media
 * are explicit local fixtures. No provider request or actual audio is made. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const {chromium}=require('playwright-core');
const ROOT=path.resolve(__dirname,'../..'),WEB=path.join(ROOT,'melunga_deploy');
const BASE='541afb7f67b499130af60211e72a8614bdaaf31d',ORIGIN='https://german-launch.test';
const NATIVE=['fr','en','es','it','zh','ja','ko'],VERSION='kartech-2026-10-30-en-us';
const FIELDS={fr:'frm',en:'en',es:'esm',it:'itm',zh:'cn',ja:'jam',ko:'kom'},PHON={fr:'pf',en:'py',es:'ps',it:'pi',zh:'phon',ja:'py',ko:'py'};
const KNOWN='melunga-guided-known-v1',REVIEW='melunga-guided-review-v1';
const OUTDIR=process.env.GERMAN_LAUNCH_REPORT_DIR||'/workspace/work/german-launch-browser';
const report={status:'running',baseCommit:BASE,environment:'local Chromium, mobile/desktop emulation',physicalDeviceTested:false,safariTested:false,actualAudioPlayed:false,upstreamTtsCalled:false,realAccountsUsed:false,allResponsesLocalFixtures:true,cases:[],checks:[],errors:[],unexpected:[],screenshots:[]};
const read=f=>fs.readFileSync(path.join(WEB,f)),json=f=>JSON.parse(read(f)),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const oldCache=new Map();
function old(file){if(!oldCache.has(file))oldCache.set(file,execFileSync('git',['show',BASE+':melunga_deploy/'+file],{cwd:ROOT,maxBuffer:40*1024*1024}));return oldCache.get(file);}
function fingerprint(){const files=execFileSync('git',['ls-files','melunga_deploy'],{cwd:ROOT,encoding:'utf8'}).trim().split('\n').filter(p=>/\.(js|mjs|css|html|json)$/.test(p));files.push('melunga_deploy/content/native-catalogue/de.json','tools/maquette-guidee/imports/de-deck-v3.1.json','tools/maquette-guidee/imports/de-themes-v1.json');return Object.fromEntries([...new Set(files)].sort().map(p=>[p,hash(fs.readFileSync(path.join(ROOT,p)))]));}
function catalogue(legacy=false){
 const now=Date.now(),locales={fr:['fr-FR','F','Aoede'],en:['en-GB','C','Kore'],es:['es-ES','F','Kore'],zh:['cmn-CN','A','Kore'],it:['it-IT','E','Charon'],ja:['ja-JP','B','Kore'],ko:['ko-KR','A','Kore'],de:['de-DE','A','Kore']};
 return{version:1,source:'google-voices-list',previewOnly:true,selectionVersion:legacy?'kartech-2026-10-27':VERSION,verifiedAt:new Date(now-1000).toISOString(),expiresAt:new Date(now+240000).toISOString(),languages:Object.fromEntries((legacy?NATIVE:[...NATIVE,'de']).map(language=>{
  const[languageCode,wave,approved]=locales[language],chirp=[['Aoede','FEMALE'],['Kore','FEMALE'],['Charon','MALE']].map(([name,gender])=>({name:languageCode+'-Chirp3-HD-'+name,languageCode,gender,engine:'chirp3',rateMode:'client'}));
  return[language,{language,available:true,waveNet:{name:languageCode+'-Wavenet-'+wave,languageCode,gender:'FEMALE',engine:'wavenet',rateMode:'server'},chirp,defaultVoice:chirp.find(v=>v.name.endsWith('-'+approved)),defaultReason:null}];
 }))};
}
let browser,inputs;
async function fixture({width=1366,height=768,native='fr',pair=native+'-de',level=1,paid=false,baseline=false,start='course'}={}){
 const context=await browser.newContext({viewport:{width,height},isMobile:width<960,hasTouch:width<960,reducedMotion:'reduce',serviceWorkers:'block'});
 const f={context,pair,level,paid,baseline,paths:[],api:[],closed:false,loginPosts:0};
 await context.addInitScript(({native,pair,level})=>{
  if(!sessionStorage.getItem('__germanSeed')){localStorage.setItem('ox_device','german-launch-fixture');localStorage.setItem('ox_paid','1');localStorage.setItem('melunga-app-language',JSON.stringify({locale:native,label:native}));localStorage.setItem('melunga-course-pair',pair);localStorage.setItem('melunga-course-level',String(level));sessionStorage.setItem('__germanSeed','1');}
  const media=window.__germanMedia={plays:[],browser:[]};
  window.Audio=class extends EventTarget{constructor(src){super();this.src=src||'';this.currentTime=0;this.paused=true;this.playbackRate=1;}play(){this.paused=false;media.plays.push({src:this.src,rate:this.playbackRate});queueMicrotask(()=>{if(!this.paused&&this.src){this.onplaying?.(new Event('playing'));this.dispatchEvent(new Event('playing'));}});return Promise.resolve();}pause(){this.paused=true;}load(){}removeAttribute(n){if(n==='src')this.src='';}};
  window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},getVoices(){return[];},addEventListener(){},removeEventListener(){},speak(u){media.browser.push({text:u.text,lang:u.lang});}}});
 },{native,pair,level});
 await context.route('**/*',async route=>{
  const req=route.request(),u=new URL(req.url());
  if(u.origin!==ORIGIN){if(!/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname))report.unexpected.push({external:u.origin+u.pathname});return route.abort();}
  if(req.method()!=='GET'){if(start==='login'&&u.pathname==='/.netlify/functions/login'&&req.method()==='POST'){assert.deepEqual(req.postDataJSON(),{device_id:'german-launch-fixture',email:'german-launch@example.test',password:'Fictitious-german-password-29'});f.loginPosts++;await new Promise(resolve=>setTimeout(resolve,700));f.paid=true;return route.fulfill({json:{success:true,paid:true}});}report.unexpected.push({path:u.pathname,method:req.method()});return route.abort();}
  if(u.pathname==='/.netlify/functions/check-status'){f.api.push({kind:'status',paid:f.paid});return route.fulfill({json:{paid:f.paid}});}
  if(u.pathname==='/.netlify/functions/get-pricing')return route.fulfill({json:{country:'FR',monthlyDisplay:'7,90 €',annualDisplay:'42 €'}});
  if(u.pathname==='/api/geolocation')return route.fulfill({json:{country:'FR'}});
  if(u.pathname==='/.netlify/functions/tts'&&u.searchParams.get('catalog')==='chirp3'){f.api.push({kind:'catalogue',version:u.searchParams.get('selectionVersion')});return route.fulfill({json:catalogue(u.searchParams.get('selectionVersion')!==VERSION)});}
  if(u.pathname==='/app.html'&&!['login','checkout'].includes(start))return route.fulfill({contentType:'text/html',body:'<!doctype html><title>Expected account handoff</title>'});
  if(u.pathname==='/mobile-runtime.js')return route.fulfill({contentType:'text/javascript',body:'/* ordinary web platform fixture */'});
  if(/^\/(?:\.netlify|api)\//.test(u.pathname)){report.unexpected.push({path:u.pathname,method:req.method()});return route.abort();}
  const relative=decodeURIComponent(u.pathname==='/'?'/index.html':u.pathname).slice(1),file=path.resolve(WEB,relative);
  if(!file.startsWith(WEB+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){report.unexpected.push({missing:u.pathname});return route.fulfill({status:404,body:'not found'});}
  let body;try{body=baseline&&/\.(?:html|js|css|json)$/.test(relative)?old(relative):read(relative);}catch(error){report.errors.push('baseline '+relative+': '+error.message);return route.abort();}
  return route.fulfill({body,contentType:{'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2'}[path.extname(file)]||'application/octet-stream'});
 });
 const p=f.page=await context.newPage();p.setDefaultTimeout(10000);p.on('pageerror',e=>report.errors.push(e.message));p.on('framenavigated',frame=>{if(frame===p.mainFrame())f.paths.push(new URL(frame.url()).pathname);});
 f.close=async()=>{f.closed=true;await context.close();};
 await p.goto(ORIGIN+(start==='home'?'/index.html?country=FR':start==='login'?'/app.html?login=1&lang='+native+'&study=de&courseReturn='+pair+'&courseLevel='+level:start==='checkout'?'/app.html?checkout=monthly&lang='+native+'&study=de&courseReturn='+pair+'&courseLevel='+level:'/parcours-niveaux.html?pair='+pair+'&level='+level),{waitUntil:'domcontentloaded'});return f;
}
const state=p=>p.evaluate(()=>window.MelungaMockup.state());
async function settled(p){await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));}
async function ready(p,{pair,level=1,screen='themes'}){await p.waitForFunction(c=>{const s=window.MelungaMockup?.state();return s?.pairId===c.pair&&s.level===c.level&&s.screen===c.screen;},{pair,level,screen},{timeout:25000});await p.waitForFunction(()=>window.MelungaVoiceSelection?.state().status==='ready');await p.waitForFunction(()=>!document.documentElement.classList.contains('course-presentation-pending'));await p.evaluate(()=>document.fonts.ready);await settled(p);}
async function neutral(p){await p.evaluate(()=>document.activeElement?.blur());await p.mouse.move(0,0);await p.locator('img').evaluateAll(ns=>Promise.all(ns.filter(n=>{const r=n.getBoundingClientRect();return r.width&&r.height&&r.y<innerHeight&&r.bottom>0;}).map(n=>n.decode())));await settled(p);}
async function shot(p,name){await neutral(p);const file=path.join(OUTDIR,name+'.png');await p.screenshot({path:file,animations:'disabled'});report.screenshots.push(file);}
async function next(p){if(await p.locator('#mgContinue').isDisabled())await p.locator('#mgChoices .mg-choice:visible').first().click();await p.locator('#mgContinue').click();await settled(p);}
const known=(p,pair)=>p.evaluate(({pair,key})=>JSON.parse(localStorage.getItem(key)||'{}').pairs?.[pair]||[],{pair,key:KNOWN});
const reviews=p=>p.evaluate(key=>JSON.parse(localStorage.getItem(key)||'{}').entries||[],REVIEW);
function bank(){return json('content/native-catalogue/de.json');}
function firstId(level=1){return bank().levels[level-1].themes[0].phraseIds[0];}
function expected(id){return bank().cards[Number(id.split(':').at(-1))];}
async function assertCard(p,native){const flag=p.locator('#mgLanguageFlag');assert.equal(await flag.getAttribute('data-language'),'de');const mark=await flag.evaluate(n=>({background:getComputedStyle(n).backgroundImage,width:n.getBoundingClientRect().width,height:n.getBoundingClientRect().height}));assert.match(mark.background,/linear-gradient/,'DE flag has a platform-independent painted mark');assert.ok(mark.width>=20&&mark.height>=15);const s=await state(p),raw=expected(s.phraseId);assert.equal(await p.locator('#mgPhrase').textContent(),raw.t);assert.equal(await p.locator('#mgTranslation').textContent(),raw[FIELDS[native]]);assert.equal(await p.locator('#mgPhon').textContent(),raw[PHON[native]]);assert.equal(await p.locator('#mgPhrase').getAttribute('lang'),'de');assert.equal(await p.locator('#mgTranslation').getAttribute('lang'),native);assert.equal(await p.locator('html').getAttribute('lang'),native);return s;}
async function showThemeTile(p,themeId){
 const tile=p.locator('#mgThemeGrid .mg-theme[data-theme-id="'+themeId+'"]');
 if(p.viewportSize().width>=1101){
  const previous=p.locator('.mg-desktop-page-previous'),next=p.locator('.mg-desktop-page-next');
  while(!await tile.isVisible()&&!await previous.isDisabled()){await previous.click();await settled(p);}
  while(!await tile.isVisible()&&!await next.isDisabled()){await next.click();await settled(p);}
 }
 assert.equal(await tile.isVisible(),true,'theme is reachable: '+themeId);await tile.scrollIntoViewIfNeeded();return tile;
}
async function enterTheme(p,pair,level=1,themeId=bank().levels[level-1].themes[0].id){
 await ready(p,{pair,level});const theme=bank().levels[level-1].themes.find(row=>row.id===themeId);assert.ok(theme);
 await (await showThemeTile(p,themeId)).click();let plan;
 if(theme.phraseIds.length>100){
  await ready(p,{pair,level,screen:'sequences'});plan=await p.evaluate(()=>window.MelungaMockup.visibleSequences());
  assert.deepEqual(plan.flatMap(stage=>stage.phraseIds),theme.phraseIds);assert.ok(plan.length>1);
  assert.ok(plan.every(stage=>stage.cards>=30&&stage.cards<=40));
  await p.locator('#mgSequences .mg-sequence:visible').first().click();
 }else{
  await ready(p,{pair,level,screen:'lesson'});const current=await state(p);
  assert.equal(current.lessonScope,'theme');assert.equal(current.visibleSequenceIndex,0);assert.equal(current.visibleSequenceCount,0);
  assert.deepEqual(await p.evaluate(()=>window.MelungaMockup.visibleSequences()),[]);
  assert.equal(await p.locator('#mgVisibleSequenceContext').isVisible(),false);
  const prepared=await p.evaluate(async({pair,level,themeId})=>{
   const loaded=await window.MelungaNativeCourses.loadPair(pair,level);return loaded.pair.themes.find(theme=>theme.id===themeId);
  },{pair,level,themeId});
  plan=[{cards:theme.phraseIds.length,phraseIds:theme.phraseIds,steps:prepared.sequences.flatMap(group=>group.steps)}];
 }
 await ready(p,{pair,level,screen:'lesson'});assert.equal((await state(p)).themeId,themeId);return{theme,plan};
}
async function photoSignature(photo){
 await photo.waitFor({state:'visible'});await photo.locator('img').evaluate(image=>image.decode());
 const box=await photo.boundingBox();assert.ok(box&&box.width>0&&box.height>0,'photo has visible bounds');
 return photo.evaluate(node=>{const image=node.querySelector('img');if(!image?.naturalWidth)throw Error('photo did not decode');
  return{visualId:node.dataset.themePhoto,src:image.getAttribute('src'),column:node.style.getPropertyValue('--mg-photo-column'),
   row:node.style.getPropertyValue('--mg-photo-row'),columns:node.style.getPropertyValue('--mg-photo-columns'),rows:node.style.getPropertyValue('--mg-photo-rows')};});
}
async function geometry(p){return p.evaluate(()=>{const rect=id=>{const n=document.querySelector(id),r=n?.getBoundingClientRect();return n&&getComputedStyle(n).display!=='none'&&r.width&&r.height?{x:r.x,y:r.y,width:r.width,height:r.height}:null;};return{width:innerWidth,height:innerHeight,bodyWidth:document.body.scrollWidth,phrase:rect('#mgPhrase'),model:rect('#mgModel'),replay:rect('#mgReplay'),listen:rect('#mgListen'),next:rect('#mgContinue'),sidebar:rect('.mg-desktop-theme-sidebar'),dock:rect('.mg-mobile-dock'),phraseSize:getComputedStyle(document.getElementById('mgPhrase')).fontSize,photo:rect('.mg-theme-photo')};});}
function functionSource(text,name){const re=new RegExp('^  function '+name+'\\([^]*?^  }','m'),m=text.match(re);assert.ok(m,'function '+name+' exists');return m[0];}
const groups={
 'architecture-and-source-conservation':async()=>{
  const flagRule='.mg-language-badge[data-language=\"de\"],#mgLanguageFlag[data-language=\"de\"]{\n  background: linear-gradient(#111 0 33.333%, #dd0000 33.333% 66.666%, #ffce00 66.666%);\n}\n';const css=read('maquette-guidee.css').toString();assert.equal(css.split(flagRule).length,2,'exactly one bounded German flag rule');assert.equal(css.replace(flagRule,''),old('maquette-guidee.css').toString(),'lesson CSS differs only by German flag paint');for(const file of['course-desktop.css','course-desktop.js','content/course-access.json'])assert.ok(read(file).equals(old(file)),file+' architecture preserved');
  const before=old('maquette-guidee.js').toString(),after=read('maquette-guidee.js').toString();
  for(const name of['collectLevelProgressIds','levelProgress','loadKnownCards','saveKnownCard','saveCardDecision','markKnown','markForReview','validateNextPhrase'])assert.equal(functionSource(after,name),functionSource(before,name),'protected '+name+' unchanged');
  const b=bank();assert.equal(b.cards.length,4519);assert.equal(new Set(b.cards.map(c=>c.t)).size,4519);for(const c of b.cards){assert.equal(Object.keys(c).length,15);assert.ok(Object.values(c).every(v=>typeof v==='number'||typeof v==='string'&&v.length>0));}
  const m=json('content/native-catalogue/manifest.json');assert.equal(m.pairIds.length,49);assert.ok(NATIVE.every(n=>m.pairIds.includes(n+'-de')));assert.ok(m.pairIds.every(p=>!p.startsWith('de-')));for(const n of NATIVE)assert.ok(read('content/native-catalogue/'+n+'.json').equals(old('content/native-catalogue/'+n+'.json')));
  report.cases.push({name:'protected-architecture-and-progress-byte-identical',sourceCards:4519,pairs:49});
 },
 'seven-native-german-home-entry':async()=>{
  for(const native of NATIVE){const width=['fr','it','ko'].includes(native)?1366:390,height=width===390?844:768,f=await fixture({width,height,native,start:'home'});try{
   const p=f.page;await p.locator(width>=960?'.desktop-home':'[data-screen="welcome"].active').waitFor({state:'visible'});
   await p.locator('[data-dh-free]:visible,[data-select-access="free"]:visible').first().click();await p.locator('[data-screen="language"].active').waitFor();
   const choice=p.locator('[data-study-language="de"]');await choice.scrollIntoViewIfNeeded();assert.equal(await choice.isVisible(),true);
   assert.equal(await p.locator('[data-study-language]:visible').count(),7);assert.equal(await p.locator('[data-study-language="'+native+'"]:visible').count(),0);
   if(native==='fr')await shot(p,'home-language-de-'+width);await choice.click();await ready(p,{pair:native+'-de',screen:'lesson'});
   assert.equal(new URL(p.url()).searchParams.get('start'),null);assert.ok(!f.paths.includes('/app.html'));
   const current=await assertCard(p,native);assert.equal(current.phraseId,firstId());assert.equal(current.themeId,'saluer');
   assert.equal(current.lessonScope,'theme');assert.equal(current.visibleSequenceCount,0);assert.equal(current.visibleSequenceIndex,0);
   assert.equal(await p.locator('#mgVisibleSequenceContext').isVisible(),false);assert.deepEqual(await known(p,native+'-de'),[]);
   assert.equal(current.access.paid,false);assert.equal(await p.evaluate(()=>window.__germanMedia.plays.length),0,'language choice never autoplays');
   if(native==='fr'){await p.locator('#mgLanguageTrigger').click();await p.locator('#mgLanguageDialog').waitFor({state:'visible'});
    const badge=p.locator('#mgLanguageChoices .mg-language-badge[data-language="de"]');assert.equal(await badge.count(),1);
    assert.match(await badge.evaluate(n=>getComputedStyle(n).backgroundImage),/linear-gradient/,'German dialog choice has its painted flag');
    await p.keyboard.press('Escape');await p.locator('#mgLanguageDialog').waitFor({state:'hidden'});}
   const g=await geometry(p);assert.ok(g.bodyWidth<=width+1);assert.ok(g.phrase&&g.replay&&g.next&&g.listen);
   if(width>=1101){assert.ok(g.sidebar);assert.ok(g.replay.y>g.phrase.y&&g.next.y>g.phrase.y,'desktop commands below lesson');}
   else{assert.ok(g.dock);assert.ok(g.replay.x<g.next.x,'mobile thumb commands at opposed ends');}
   await shot(p,'german-'+native+'-'+width);report.cases.push({name:'native-home-direct-german-course',native,width,height,first:current.phraseId,themeId:current.themeId,cards:31,stages:0,geometry:g});
   console.log('German home '+native+' '+width+' PASS');
  }finally{await f.close();}}
 },
 'german-semantic-theme-photos-and-navigation':async()=>{
  for(const width of[1366,390]){const pair='fr-de',f=await fixture({width,height:width===390?844:768});try{
   const p=f.page;await ready(p,{pair});const themes=bank().levels[0].themes,seen=[];
   assert.ok(themes.length>10);assert.equal(await p.locator('#mgThemeGrid .mg-theme').count(),themes.length);
   if(width>=1101){const pages=Math.ceil(themes.length/4),pagination=p.locator('.mg-desktop-pagination');
    assert.equal(Number(await pagination.getAttribute('data-pages')),pages);
    for(let page=1;page<=pages;page++){assert.equal(Number(await pagination.getAttribute('data-page')),page);
     const ids=await p.locator('#mgThemeGrid .mg-theme:visible').evaluateAll(nodes=>nodes.map(node=>node.dataset.themeId));
     assert.ok(ids.length>0&&ids.length<=4);seen.push(...ids);if(page<pages){await p.locator('.mg-desktop-page-next').click();await settled(p);}}
   }else{
    seen.push(...await p.locator('#mgThemeGrid .mg-theme:visible').evaluateAll(nodes=>nodes.map(node=>node.dataset.themeId)));
    const last=p.locator('#mgThemeGrid .mg-theme').last();await last.scrollIntoViewIfNeeded();await settled(p);
    const box=await last.boundingBox();assert.ok(box&&box.y>=0&&box.y+box.height<=p.viewportSize().height+1,'last mobile theme can be reached');
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'theme catalogue has no horizontal overflow');
    await shot(p,'german-themes-last-mobile');
   }
   assert.deepEqual(seen,themes.map(theme=>theme.id),'every semantic theme is reachable in catalogue order');
   const photos=[];
   for(const domain of['saluer','repas','deplacements']){
    await p.reload();await ready(p,{pair});const theme=themes.find(theme=>theme.domain===domain);assert.ok(theme);
    const tile=await showThemeTile(p,theme.id);assert.notEqual((await tile.locator('.mg-theme-title').textContent()).trim(),'Toutes les leçons');
    const before=await photoSignature(tile.locator('.mg-theme-photo'));assert.equal(before.src,theme.photo.asset);
    assert.equal(Number(before.column),theme.photo.column);assert.equal(Number(before.row),theme.photo.row);
    await enterTheme(p,pair,1,theme.id);const header=p.locator(width>=1101?'.mg-desktop-theme-photo .mg-theme-photo':'.mg-mobile-theme-photo');
    assert.deepEqual(await photoSignature(header),before,'lesson header keeps the selected tile photo');
    const current=await assertCard(p,'fr');assert.ok(theme.phraseIds.includes(current.phraseId));
    const {visualId,...scene}=before;photos.push(scene);await shot(p,'german-theme-'+domain+'-'+width);
   }
   assert.equal(new Set(photos.map(photo=>JSON.stringify(photo))).size,3,'greeting, restaurant and travel scenes differ');
   report.cases.push({name:'semantic-photo-themes-reachable',width,themes:seen,photos});
  }finally{await f.close();}}
  const level=bank().levels.find(level=>level.themes.some(theme=>theme.phraseIds.length>100));assert.ok(level,'a genuine long German theme is covered');
  const theme=level.themes.find(theme=>theme.phraseIds.length>100),f=await fixture({pair:'fr-de',level:level.level,paid:true});try{
   const opened=await enterTheme(f.page,'fr-de',level.level,theme.id);assert.ok(opened.plan.length>1);
   assert.equal((await state(f.page)).visibleSequenceCount,opened.plan.length);
   report.cases.push({name:'only-long-german-theme-uses-stages',level:level.level,themeId:theme.id,cards:theme.phraseIds.length,stageCards:opened.plan.map(stage=>stage.cards)});
  }finally{await f.close();}
 },
 'german-next-review-listen-and-persistence':async()=>{
  for(const width of[1366,390]){const pair='fr-de',f=await fixture({width,height:width===390?844:768});try{
   const p=f.page,{theme,plan}=await enterTheme(p,pair),id=firstId();assert.equal((await state(p)).phraseId,id);await assertCard(p,'fr');
   await p.locator('#mgListen').click();await settled(p);const media=await p.evaluate(()=>window.__germanMedia);
   assert.equal(media.plays.length,1);const audioUrl=new URL(media.plays[0].src,ORIGIN);
   assert.equal(audioUrl.searchParams.get('text'),expected(id).t);assert.equal(audioUrl.searchParams.get('lang'),'de-DE');
   assert.equal(audioUrl.searchParams.get('voice'),'de-DE-Chirp3-HD-Kore');assert.equal(audioUrl.searchParams.get('rate'),'1');
   assert.deepEqual(await known(p,pair),[]);assert.deepEqual(media.browser,[]);
   let firstAcquired=false;for(let i=0;i<plan[0].steps.length;i++){if((await state(p)).phraseId!==id)break;await next(p);firstAcquired=(await known(p,pair)).includes(id);}
   assert.equal(firstAcquired,true);assert.deepEqual(await known(p,pair),[id]);assert.equal((await state(p)).levelProgress.known,1);
   const deferred=(await state(p)).phraseId;assert.notEqual(deferred,id);await p.locator('#mgReplay').click();await settled(p);
   assert.deepEqual(await known(p,pair),[id]);assert.deepEqual((await reviews(p)).map(row=>row.id),[deferred]);
   await p.evaluate(key=>{const stored=JSON.parse(localStorage.getItem(key));stored.entries.forEach(entry=>entry.themeId='all-lessons');localStorage.setItem(key,JSON.stringify(stored));},REVIEW);
   await p.reload();await ready(p,{pair});assert.deepEqual(await known(p,pair),[id]);assert.deepEqual((await reviews(p)).map(row=>row.id),[deferred]);
   assert.equal((await state(p)).levelProgress.known,1);await enterTheme(p,pair);assert.equal((await state(p)).lessonScope,'theme');
   assert.equal((await state(p)).levelProgress.known,1);assert.equal(await p.locator('#mgVisibleSequenceContext').isVisible(),false);
   await shot(p,'german-progress-'+width);
   await p.reload();await ready(p,{pair});
   if(width>=1101)await p.locator('#mgDesktopNav [data-menu-item="À revoir"]').click();
   else{await p.locator('#mgMenuTrigger').click();await p.locator('#mgMenuNav [data-menu-item="À revoir"]').click();}
   await p.locator('#mgSavedReviewPanel').waitFor({state:'visible'});
   await p.locator('#mgSavedReviewList [data-review-id="'+deferred+'"] [data-review-action="resume"]').click();
   await p.waitForFunction(id=>{const s=window.MelungaMockup.state();return s.screen==='lesson'&&s.lessonScope==='saved-review'&&s.phraseId===id;},deferred);
   await settled(p);assert.equal((await state(p)).themeId,theme.id);await assertCard(p,'fr');assert.deepEqual(await known(p,pair),[id]);
   assert.deepEqual((await reviews(p)).map(row=>row.id),[deferred]);
   report.cases.push({name:'next-review-audio-persistence-and-old-theme-review',width,known:id,deferred,sourceAudio:audioUrl.pathname+audioUrl.search,themeCards:theme.phraseIds.length});
   console.log('German progress '+width+' PASS');
  }finally{await f.close();}}
 },
 'german-paid-access-and-native-rejection':async()=>{
  for(const paid of[false,true]){const pair='fr-de',f=await fixture({pair,level:2,paid});try{const p=f.page;await ready(p,{pair,level:2});assert.equal((await state(p)).access.paid,paid);const tile=p.locator('#mgThemeGrid .mg-theme:visible').first();if(!paid){assert.equal(await tile.getAttribute('data-access'),'paid');await tile.click();await p.waitForURL(u=>u.pathname==='/app.html');const u=new URL(p.url());assert.equal(u.searchParams.get('courseReturn'),pair);assert.equal(u.searchParams.get('courseLevel'),'2');assert.deepEqual(await known(p,pair),[]);}else{await enterTheme(p,pair,2);await assertCard(p,'fr');assert.equal((await state(p)).phraseId,firstId(2));}report.cases.push({name:'german-level2-rights',paid});}finally{await f.close();}}
  for(const pair of['de-fr','de-de']){const f=await fixture({pair,native:'fr'});try{const p=f.page;await p.locator('#mgRetry').waitFor({state:'visible'});assert.equal((await state(p)).pairId,null);assert.equal(await p.locator('#mgRetry').textContent(),'Choisir mes langues');assert.deepEqual(await known(p,pair),[]);report.cases.push({name:'invalid-german-native-rejected',pair});}finally{await f.close();}}
 },
 'confirmed-german-login-return':async()=>{
  const f=await fixture({pair:'fr-de',native:'fr',level:2,start:'login',paid:false});try{const p=f.page;await p.locator('#pwLoginEmail').waitFor({state:'visible'});await p.waitForTimeout(800);assert.equal(new URL(p.url()).pathname,'/app.html','German login remains in account form while awaiting user');assert.equal(await p.locator('#pwLoginEmail').isVisible(),true);assert.equal(f.loginPosts,0);await p.locator('#pwLoginEmail').fill('german-launch@example.test');await p.locator('#pwLoginPassword').fill('Fictitious-german-password-29');await p.locator('#pwLoginBtn').click();await p.waitForURL(u=>u.pathname==='/parcours-niveaux.html');await ready(p,{pair:'fr-de',level:2});assert.equal(f.loginPosts,1);assert.equal((await state(p)).access.paid,true);assert.equal(await p.evaluate(()=>localStorage.getItem('ox_session')),null,'modern rights keep the established device contract');report.cases.push({name:'German-confirmed-login-return',pair:'fr-de',level:2,mockedPosts:1,mockResponseDelayMs:700});}finally{await f.close();}
 },
 'german-checkout-form-keeps-approved-return':async()=>{
  const f=await fixture({pair:'fr-de',native:'fr',level:2,start:'checkout',paid:false});try{const p=f.page;await p.locator('#pwNewSection').waitFor({state:'visible'});await p.waitForTimeout(1200);assert.equal(new URL(p.url()).pathname,'/app.html');assert.equal(await p.locator('#paywall').isVisible(),true);assert.equal(await p.locator('#pwNewSection').isVisible(),true);assert.equal(await p.locator('#pwEmail').isVisible(),true);assert.equal(await p.locator('#pwMonthly').isVisible(),true);assert.equal(await p.locator('#bootCover').count(),0,'account checkout boot cover is removed');assert.deepEqual(await p.evaluate(()=>window.approvedCourseReturn),{pair:'fr-de',level:2,nativeLanguage:'fr',studyLanguage:'de'});assert.equal(f.loginPosts,0);assert.deepEqual(await known(p,'fr-de'),[]);report.cases.push({name:'German-checkout-keeps-form-and-approved-course',pair:'fr-de',level:2,waitAfterFormMs:1200,paymentPosts:0});}finally{await f.close();}
 },
 'existing-fr-es-pixels-unchanged':async()=>{
  for(const width of[390,1366]){let reference;for(const baseline of[true,false]){const f=await fixture({width,height:width===390?844:768,pair:'fr-es',paid:false,baseline});try{const p=f.page;await ready(p,{pair:'fr-es'});await p.locator('#mgThemeGrid .mg-theme[data-theme-id="saluer"]').click();await ready(p,{pair:'fr-es',screen:'lesson'});await neutral(p);const bytes=await p.screenshot({animations:'disabled'});if(baseline)reference=bytes;else{assert.ok(bytes.equals(reference),'existing '+width+' lesson screenshot equals deployed baseline');report.cases.push({name:'existing-lesson-pixel-identical',pair:'fr-es',width,pixelSha256:hash(bytes)});await shot(p,'unchanged-fr-es-'+width);}}finally{await f.close();}}
  }
 }
};
(async()=>{fs.mkdirSync(OUTDIR,{recursive:true});inputs=fingerprint();browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});try{const only=process.env.GERMAN_LAUNCH_ONLY;for(const[name,fn]of Object.entries(groups)){if(only&&name!==only)continue;await fn();report.checks.push(name);console.log(name+' PASS');}assert.deepEqual(report.errors,[]);assert.deepEqual(report.unexpected,[]);report.inputsStable=JSON.stringify(inputs)===JSON.stringify(fingerprint());assert.equal(report.inputsStable,true,'runtime source bytes stayed frozen');report.inputSha256=inputs;report.status=only?'partial':'passed';}catch(e){report.status='failed';report.failure=e.stack;process.exitCode=1;console.error(e.stack);}finally{await browser.close();fs.writeFileSync(path.join(OUTDIR,'acceptance.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,checks:report.checks,cases:report.cases.length,inputsStable:report.inputsStable,errors:report.errors,unexpected:report.unexpected,report:path.join(OUTDIR,'acceptance.json')}));}})();
