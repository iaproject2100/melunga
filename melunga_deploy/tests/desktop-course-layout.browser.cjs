/* Real course acceptance for the approved desktop header and nearby controls.
 * Network/status/catalogue/media are explicit fixtures. Mobile layout is also
 * compared with the actual 7b17e56 HTML/CSS/JS, not a hand-drawn approximation. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const {test,before,after}=require('node:test');
const {chromium}=require('playwright-core');
const ROOT=path.resolve(__dirname,'../..'),WEB=path.join(ROOT,'melunga_deploy'),BASE='7b17e56';
const ORIGIN='https://desktop-course-layout.test',CODES=['fr','en','es','zh','it','ja','ko'];
const OUT=process.env.DESKTOP_COURSE_LAYOUT_REPORT||'/tmp/melunga-desktop-course-layout-browser.json';
const CAPTURES=process.env.DESKTOP_COURSE_LAYOUT_CAPTURES||'/tmp/melunga-desktop-course-layout-browser';
const raw=file=>fs.readFileSync(path.join(WEB,file)),json=file=>JSON.parse(raw(file));
const oldCache=new Map();
function old(file){if(!oldCache.has(file))oldCache.set(file,execFileSync('git',['show',BASE+':melunga_deploy/'+file],{cwd:ROOT,maxBuffer:40*1024*1024}));return oldCache.get(file);}
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const manifest=json('content/niveaux-progressifs/manifest.json');
const protectedFiles=['maquette-guidee.css','content/course-access.json','lesson-audio.js','voice-selection.js','course-i18n.js',
  'store-billing.js','account-ui.js','account-ui.css','melunga-logo.png','assets/melunga-logo.png',
  ...fs.readdirSync(path.join(WEB,'netlify/functions')).filter(f=>f.endsWith('.mjs')).map(f=>'netlify/functions/'+f),
  ...CODES.map(l=>'content/native-catalogue/'+l+'.json'),'content/native-catalogue/manifest.json',
  ...fs.readdirSync(path.join(WEB,'content/course-locales')).filter(f=>f.endsWith('.json')).map(f=>'content/course-locales/'+f),
  'content/niveaux-progressifs/manifest.json',...manifest.pairs.flatMap(p=>[p.repertoirePath,...p.levels.map(l=>l.dataPath)])];
const productFiles=()=>[...new Set([...protectedFiles,...fs.readdirSync(WEB,{withFileTypes:true}).filter(f=>f.isFile()&&/\.(js|html|css)$/.test(f.name)).map(f=>f.name)])].sort();
const fingerprint=()=>Object.fromEntries([__filename,...productFiles().map(f=>path.join(WEB,f))].sort().map(f=>[path.relative(ROOT,f),hash(fs.readFileSync(f))]));
const REQUIRED=['preserved-content-and-services','desktop-header-and-themes','desktop-pickers-menu-account','desktop-nearby-lesson-actions','mobile-baseline-layout','mobile-original-gestures','responsive-roundtrip','read-only-data-recovery'];
const report={status:'running',baseCommit:BASE,environment:'Local Chromium; desktop and mobile viewport/touch emulation',physicalDeviceTested:false,safariTested:false,
  realAudioPlayed:false,upstreamTtsCalled:false,realAccountsUsed:false,nonGetRequestsAllowed:false,allResponsesLocalFixtures:true,checks:[],cases:[],api:[],errors:[],unexpected:[],fixtureErrors:[],screenshots:[]};
const checked=async(name,fn)=>{try{await fn();report.checks.push(name);}catch(e){report.errors.push(name+': '+e.message);throw e;}};
let browser,inputs;
before(async()=>{inputs=fingerprint();fs.mkdirSync(CAPTURES,{recursive:true});browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});});
after(async()=>{await browser?.close();report.inputsStable=JSON.stringify(inputs)===JSON.stringify(fingerprint());report.inputSha256=inputs;report.missingChecks=REQUIRED.filter(n=>!report.checks.includes(n));
 report.status=report.inputsStable&&!report.errors.length&&!report.unexpected.length&&!report.fixtureErrors.length&&!report.missingChecks.length?'passed':'failed';fs.writeFileSync(OUT,JSON.stringify(report,null,2)+'\n');
 assert.equal(report.inputsStable,true,'product remains frozen during QA');assert.deepEqual(report.errors,[]);assert.deepEqual(report.unexpected,[]);assert.deepEqual(report.fixtureErrors,[]);assert.deepEqual(report.missingChecks,[]);});
function catalogue(){
 const now=Date.now(),locales={fr:['fr-FR','F','Aoede'],en:['en-GB','C','Kore'],es:['es-ES','F','Kore'],zh:['cmn-CN','A','Kore'],it:['it-IT','E','Charon'],ja:['ja-JP','B','Kore'],ko:['ko-KR','A','Kore']};
 return{version:1,source:'google-voices-list',previewOnly:true,selectionVersion:'kartech-2026-10-27',verifiedAt:new Date(now-1000).toISOString(),expiresAt:new Date(now+240000).toISOString(),languages:Object.fromEntries(CODES.map(language=>{
  const[languageCode,wave,approved]=locales[language],chirp=[['Aoede','FEMALE'],['Kore','FEMALE'],['Charon','MALE']].map(([name,gender])=>({name:languageCode+'-Chirp3-HD-'+name,languageCode,gender,engine:'chirp3',rateMode:'client'}));
  return[language,{language,available:true,waveNet:{name:languageCode+'-Wavenet-'+wave,languageCode,gender:'FEMALE',engine:'wavenet',rateMode:'server'},chirp,defaultVoice:chirp.find(v=>v.name.endsWith('-'+approved)),defaultReason:null}];
 }))};
}
async function fixture({width=1366,height=768,pair='en-es',level=1,paid=true,baseline=false,waitReady=true,faultPath=null,faultMode=null,holdPath=null,holdAttempt=2,extraOnce503=[]}={}){
 const context=await browser.newContext({viewport:{width,height},isMobile:width<960,hasTouch:width<960,reducedMotion:'reduce',serviceWorkers:'block'}),f={context,closed:false,baseline,pair,level,paid,faultMode,requests:{},waiters:new Map()};
 let release;const gate=new Promise(done=>{release=done;});f.release=release;
 f.started=(relative,count)=>{if((f.requests[relative]||0)>=count)return Promise.resolve();const key=relative+'#'+count;return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Expected document attempt did not start: '+key)),5000);f.waiters.set(key,()=>{clearTimeout(timer);resolve();});});};
 await context.addInitScript(({pair,level})=>{
  if(!sessionStorage.getItem('__desktopLayoutSeed')){
   localStorage.setItem('ox_device','desktop-course-layout-fixture');localStorage.setItem('ox_paid','1');localStorage.setItem('melunga-app-language',JSON.stringify({locale:pair.split('-')[0],label:pair.split('-')[0]}));
   localStorage.setItem('melunga-course-pair',pair);localStorage.setItem('melunga-course-level',String(level));sessionStorage.setItem('__desktopLayoutSeed','1');
  }
  const data=window.__desktopLayoutMedia={plays:[],instances:[],browser:[]};
  window.__desktopLayoutRetryClicks=0;document.addEventListener('click',e=>{if(e.target.closest?.('#mgRetry'))window.__desktopLayoutRetryClicks++;},true);
  window.Audio=class extends EventTarget{constructor(src){super();this.src=src||'';this.currentTime=0;this.paused=true;this.playbackRate=1;this.volume=1;this.muted=false;this.pauses=0;data.instances.push(this);}
   play(){this.paused=false;data.plays.push({src:this.src,rate:this.playbackRate,volume:this.volume,muted:this.muted});queueMicrotask(()=>{if(!this.paused&&this.src){this.onplaying?.(new Event('playing'));this.dispatchEvent(new Event('playing'));}});return Promise.resolve();}
   pause(){this.paused=true;this.pauses++;}load(){}removeAttribute(n){if(n==='src')this.src='';}};
  window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},getVoices(){return[];},addEventListener(){},removeEventListener(){},speak(u){data.browser.push({text:u.text,lang:u.lang});}}});
 },{pair,level});
 await context.route('**/*',async route=>{
  const req=route.request(),u=new URL(req.url());try{
   if(u.origin!==ORIGIN||req.method()!=='GET'){report.unexpected.push({origin:u.origin,path:u.pathname,method:req.method()});return await route.abort();}
   if(u.pathname==='/.netlify/functions/check-status'){report.api.push({kind:'status',paid});return await route.fulfill({json:{paid}});}
   if(u.pathname==='/.netlify/functions/tts'&&u.searchParams.get('catalog')==='chirp3'){report.api.push({kind:'catalogue',fixture:true});return await route.fulfill({json:catalogue()});}
   if(u.pathname==='/.netlify/functions/get-pricing')return await route.fulfill({json:{country:'FR',monthlyDisplay:'7,90 €',annualDisplay:'42 €'}});
   if(u.pathname==='/api/geolocation')return await route.fulfill({json:{country:'FR'}});
   if(u.pathname==='/mobile-runtime.js')return await route.fulfill({contentType:'text/javascript',body:'/* Explicit ordinary-web runtime fixture. */'});
   if(/^\/(?:\.netlify|api)\//.test(u.pathname)){report.unexpected.push({path:u.pathname,method:req.method()});return await route.abort();}
   const relative=decodeURIComponent(u.pathname==='/'?'/parcours-niveaux.html':u.pathname).slice(1),file=path.resolve(WEB,relative);
   if(!file.startsWith(WEB+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){report.unexpected.push({missingFile:u.pathname});return await route.fulfill({status:404,body:'Not found'});}
   if(relative.startsWith('content/')&&relative.endsWith('.json')){f.requests[relative]=(f.requests[relative]||0)+1;f.waiters.get(relative+'#'+f.requests[relative])?.();}
   if(extraOnce503.includes(relative)&&f.requests[relative]===1)return await route.fulfill({status:503,json:{error:'explicit_first_manifest_transport_fixture'}});
   if(relative===faultPath&&(f.faultMode==='permanent503'||f.faultMode==='once503'&&f.requests[relative]===1))return await route.fulfill({status:503,json:{error:'explicit_document_transport_fixture'}});
   if(relative===holdPath&&f.requests[relative]===holdAttempt)await gate;
   let body=baseline&&/^[^/]+\.(?:html|css|js)$/.test(relative)?old(relative):fs.readFileSync(file);
   if(relative===faultPath&&f.faultMode==='corrupt')body=Buffer.concat([body,Buffer.from('\n')]); // Valid JSON, deliberately wrong whole-document SHA.
   return await route.fulfill({body,contentType:{'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'}[path.extname(file)]||'application/octet-stream'});
  }catch(e){if(!f.closed)report.fixtureErrors.push(e.message);}
 });
 const page=f.page=await context.newPage();page.setDefaultTimeout(8000);page.on('pageerror',e=>report.errors.push(e.message));
 f.close=async()=>{f.closed=true;release();for(const done of f.waiters.values())done();await context.close();};await page.goto(ORIGIN+'/parcours-niveaux.html?pair='+pair+'&level='+level,{waitUntil:'domcontentloaded'});if(waitReady)await ready(page,pair,level);return f;
}
const state=p=>p.evaluate(()=>window.MelungaMockup.state());
async function settled(p){await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));}
async function ready(p,pair,level=1){await p.waitForFunction(({pair,level})=>{const s=window.MelungaMockup?.state();return s?.screen==='themes'&&s.pairId===pair&&s.level===level;},{pair,level},{timeout:25000});await p.waitForFunction(()=>window.MelungaVoiceSelection?.state().status==='ready');await p.evaluate(()=>document.fonts.ready);await settled(p);}
async function enter(p,{long=false}={}){
 const tile=long?p.locator('#mgThemeGrid .mg-theme').filter({hasText:'Réclamation : négocier avec tact'}):p.locator('#mgThemeGrid .mg-theme:not([data-access="paid"])').first();
 await tile.click();await p.waitForFunction(()=>window.MelungaMockup.state().screen==='lesson');await settled(p);
 if(long)assert.equal((await state(p)).phraseId,'situation-authored:fr-es:piste-reclamation-tact-01');
}
async function shot(p,name){const file=path.join(CAPTURES,name+'.png');await p.screenshot({path:file,animations:'disabled'});report.screenshots.push(file);}
async function fits(p,selector){const r=await p.locator(selector).evaluate(n=>{const r=n.getBoundingClientRect();return{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height,viewportWidth:innerWidth,viewportHeight:innerHeight};});assert.ok(r.left>=-1&&r.top>=-1&&r.right<=r.viewportWidth+1&&r.bottom<=r.viewportHeight+1,selector+' inside viewport '+JSON.stringify(r));return r;}
async function dialog(p,trigger,id){await p.locator(trigger).click();await p.locator(id).waitFor({state:'visible'});return fits(p,id);}
async function dismiss(p,id){await p.keyboard.press('Escape');await p.locator(id).waitFor({state:'hidden'});}
async function openPanel(p,panel){await p.locator('#mgMenuTrigger').click();if(panel==='voice'&&p.viewportSize().width===1366)await shot(p,'menu-1366');await p.locator('#mgMenuNav [data-menu-item="'+panel+'"]').click();await p.locator('#mgMenuTitle').waitFor();}
async function modelSource(p){
 const s=await state(p),[native,study]=s.pairId.split('-');let phrase;
 if(manifest.pairs.some(x=>x.id===s.pairId)){
  const level=json('content/niveaux-progressifs/'+s.pairId+'/L'+s.level+'.json'),bank=json(level.repertoirePath);
  phrase=[...bank.phrases,...(bank.receivedModels||[]),...level.themes.flatMap(t=>t.phrases)].find(c=>c.id===s.phraseId);
 }else{
  const policy=json('content/native-catalogue/manifest.json').policies,bank=json('content/native-catalogue/'+study+'.json'),index=Number(s.phraseId.split(':').at(-1)),card=bank.cards[index];
  const field=(study==='zh'?policy.chinesePhoneticFields:policy.phoneticFields)[native];phrase={id:s.phraseId,study:card.t,native:card[policy.meaningFields[native]],phon:card[field]||card.py||'',reading:study==='zh'?card.py||'':''};
 }
 assert.ok(phrase,'exact source record exists');assert.equal(await p.locator('#mgPhrase').textContent(),phrase.study);assert.equal(await p.locator('#mgTranslation').textContent(),phrase.native);
 assert.ok(phrase.study&&phrase.native&&phrase.phon,'chosen fixture has complete visible source fields');for(const id of ['#mgPhrase','#mgTranslation','#mgPhon'])assert.equal(await p.locator(id).isVisible(),true,'actual source field remains visible: '+id);
 assert.equal(await p.locator('#mgPhon').textContent(),s.readingVisible&&study==='zh'?phrase.reading:phrase.phon);return phrase;
}
async function wholeCard(p){
 await settled(p);const g=await p.evaluate(()=>{
  const rect=n=>{const r=n.getBoundingClientRect();return{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};};
  return{document:{width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight},viewport:{width:innerWidth,height:innerHeight},card:rect(document.getElementById('mgLessonView')),content:rect(document.getElementById('mgContent')),footer:rect(document.getElementById('mgFooter')),
   fields:['mgPhrase','mgPhon','mgTranslation'].map(id=>{const n=document.getElementById(id),r=document.createRange();r.selectNodeContents(n);let visible=!!n.getClientRects().length;for(let a=n;a&&visible;a=a.parentElement){const style=getComputedStyle(a);if(style.display==='none'||style.visibility==='hidden'||Number(style.opacity)<=0)visible=false;}return{id,bounds:rect(n),text:rect(r),hidden:n.hidden,visible,overflowX:getComputedStyle(n).overflowX,overflowY:getComputedStyle(n).overflowY,scrollX:n.scrollWidth-n.clientWidth,scrollY:n.scrollHeight-n.clientHeight};})};
 });
 assert.ok(g.document.width<=g.viewport.width+1&&g.document.height<=g.viewport.height+1,'lesson uses one viewport');
 for(const f of g.fields){assert.ok(!f.hidden&&f.visible&&f.text.width>5&&f.text.height>5,'complete unmasked model field is actually visible: '+f.id);
  // Font ink can exceed its line box with overflow:visible. The actual glyph
  // rectangles, ancestor visibility and clipping boundaries decide visibility.
  if(f.overflowX!=='visible')assert.ok(f.text.left>=f.bounds.left-1&&f.text.right<=f.bounds.right+1,'field does not clip text horizontally: '+f.id);
  if(f.overflowY!=='visible')assert.ok(f.text.top>=f.bounds.top-1&&f.text.bottom<=f.bounds.bottom+1,'field does not clip text vertically: '+f.id);
  assert.ok(f.text.left>=g.card.left-1&&f.text.right<=g.card.right+1&&f.text.top>=g.card.top-1&&f.text.bottom<=g.card.bottom+1,'text remains inside card: '+f.id+' '+JSON.stringify(f));}
 for(let i=1;i<g.fields.length;i++)assert.ok(g.fields[i].text.top>=g.fields[i-1].text.bottom-1,'visible text fields do not overlap');
 assert.ok(g.fields.at(-1).text.bottom<=g.footer.top+1,'commands do not cover the translation');
 return g;
}
async function mobileSnapshot(p){
 await settled(p);
 return p.evaluate(()=>{const ids=['mgLevelTrigger','mgLanguageTrigger','mgPalette','mgMenuTrigger','mgFooter','mgReplay','mgContinue','mgListen','mgReadingToggle','mgPhrase','mgPhon','mgTranslation'];const snapshot={};
  for(const id of ids){const n=document.getElementById(id),r=n.getBoundingClientRect(),visible=!!n.getClientRects().length&&getComputedStyle(n).visibility!=='hidden';snapshot[id]={visible,top:r.top,left:r.left,width:r.width,height:r.height,fontSize:getComputedStyle(n).fontSize,fontWeight:getComputedStyle(n).fontWeight,text:visible?n.innerText.trim():''};}return snapshot;});
}
function sameMobile(a,b){for(const id of Object.keys(a)){assert.equal(b[id].visible,a[id].visible,id+' same mobile visibility');assert.equal(b[id].fontSize,a[id].fontSize,id+' same mobile font');assert.equal(b[id].fontWeight,a[id].fontWeight,id+' same mobile weight');assert.equal(b[id].text,a[id].text,id+' same mobile text');if(a[id].visible)for(const key of ['top','left','width','height'])assert.ok(Math.abs(b[id][key]-a[id][key])<=1,id+' mobile '+key+' preserved '+JSON.stringify({before:a[id][key],after:b[id][key]}));}}
async function touch(p,dx,dy){
 const r=await p.locator('#mgTranslation').boundingBox();assert.ok(r);const x=r.x+r.width/2,y=r.y+r.height/2,cdp=await p.context().newCDPSession(p);
 try{await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx/2,y:y+dy/2}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx,y:y+dy}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}finally{await cdp.detach();}
 await p.waitForFunction(()=>{const n=document.getElementById('mgLessonView'),m=new DOMMatrixReadOnly(getComputedStyle(n).transform);return Math.abs(m.m41)<.6&&Math.abs(m.m42)<.6&&n.getAnimations().every(a=>!['running','pending'].includes(a.playState));});await settled(p);
}

test('card data, core mobile CSS, voices, rights, account and pricing services remain byte-exact',()=>checked('preserved-content-and-services',async()=>{
 for(const file of protectedFiles)assert.ok(raw(file).equals(old(file)),'protected whole file '+file);
 for(const[file,wrapper]of [['course-access.js','(window.MelungaCourseData?.fetch || fetch)'],['course-native.js','(globalThis.MelungaCourseData?.fetch || fetch)']]){
  const current=raw(file).toString();assert.equal(current.split(wrapper).length,2,'one finite authorized read wrapper in '+file);assert.equal(current.replace(wrapper,'fetch'),old(file).toString(),'all rights and validation code preserved outside the authorized read wrapper');
 }
 report.cases.push({name:'source-preservation',wholeFiles:protectedFiles.length,finiteReadWrappers:2});
}));

test('desktop themes use the top header and place level, language and colour beside the title',()=>checked('desktop-header-and-themes',async()=>{
 for(const size of [{width:1366,height:768},{width:1440,height:900}])for(const pair of ['en-es','fr-zh']){
  const f=await fixture({...size,pair});try{
   const p=f.page;assert.equal(await p.locator('#mgMenuTrigger').isVisible(),true);assert.equal(await p.locator('#mgPalette').isVisible(),true);assert.ok(await p.locator('#mgThemeGrid .mg-theme').count()>0);
   for(const id of ['#mgLevelTrigger','#mgLanguageTrigger','#mgPalette','#mgMenuTrigger','.mg-brand'])await fits(p,id);
   const g=await desktopLayout(p);assert.equal(await p.locator('#mgCounter').isVisible(),false,'the level is not repeated beside its pill');report.cases.push({name:'desktop-themes',pair,size,geometry:g});if(pair==='en-es')await shot(p,'themes-en-es-'+size.width);
  }finally{await f.close();}
 }
}));

async function desktopLayout(p){
 const g=await p.evaluate(()=>{const r=n=>{const b=n.getBoundingClientRect();return{left:b.left,right:b.right,top:b.top,bottom:b.bottom,width:b.width,height:b.height};};const header=document.querySelector('.mg-desktop-header'),brand=document.querySelector('.mg-brand'),logo=document.querySelector('.mg-logo');
  const title=[...document.querySelectorAll('.mg-desktop-heading h1')].find(n=>n.getClientRects().length),range=document.createRange();range.selectNodeContents(title);
  return{width:innerWidth,height:innerHeight,documentWidth:document.documentElement.scrollWidth,documentHeight:document.documentElement.scrollHeight,bar:r(header),brand:r(brand),logo:r(logo),level:r(document.getElementById('mgLevelTrigger')),language:r(document.getElementById('mgLanguageTrigger')),colour:r(document.getElementById('mgPalette')),menu:r(document.getElementById('mgMenuTrigger')),main:r(document.querySelector('.mg-main')),title:{...r(title),text:title.textContent.trim(),textBounds:r(range),font:parseFloat(getComputedStyle(title).fontSize),weight:Number(getComputedStyle(title).fontWeight)}};});
 assert.ok(g.bar.width>=g.width-4&&g.bar.height<150,'desktop navigation is a full-width top bar');assert.ok(g.logo.width>=90&&g.logo.height>=90,'commercial brand stays prominent');
 assert.ok(g.level.top>=g.bar.bottom-1&&g.language.top>=g.bar.bottom-1&&g.colour.top>=g.bar.bottom-1,'context pills have left the top bar');
 assert.ok(Math.abs(g.level.top-g.language.top)<2&&Math.abs(g.language.top-g.colour.top)<2,'three context pills align in one row');
 assert.ok(g.level.left<g.language.left&&g.language.left<g.colour.left,'level, flag and colour keep their order');assert.ok(g.colour.right>g.width*.75,'context pills occupy the right side of the title row');
 assert.ok(g.title.text&&g.title.font>=24&&g.title.weight>=600&&g.title.width>100,'theme or level title is prominent');assert.ok(g.title.right<=g.level.left-10&&g.title.textBounds.right<=g.title.right+1,'title and context pills do not overlap');
 assert.ok(g.menu.top>=g.bar.top&&g.menu.bottom<=g.bar.bottom+1,'secondary menu remains top right');assert.ok(g.documentWidth<=g.width+1&&g.documentHeight<=g.height+1,'desktop document does not scroll');return g;
}

test('desktop language, level, voice, colour, secondary menu and account remain usable',()=>checked('desktop-pickers-menu-account',async()=>{
 for(const size of [{width:1366,height:768},{width:1440,height:900}]){
  const f=await fixture(size);try{
   const p=f.page;await dialog(p,'#mgLanguageTrigger','#mgLanguageDialog');const pairs=await p.locator('#mgLanguageChoices button').evaluateAll(nodes=>nodes.map(n=>n.dataset.pair));assert.equal(pairs.length,6);assert.ok(pairs.every(pair=>pair.startsWith('en-')&&pair!=='en-en'));
   await p.locator('#mgLanguageChoices [data-pair="en-fr"]').click();await ready(p,'en-fr');await dialog(p,'#mgLanguageTrigger','#mgLanguageDialog');await p.locator('#mgLanguageChoices [data-pair="en-es"]').click();await ready(p,'en-es');
   await dialog(p,'#mgLevelTrigger','#mgLevelDialog');assert.equal(await p.locator('#mgLevelChoices button').count(),10);await p.locator('#mgLevelChoices [data-level="2"]').click();await ready(p,'en-es',2);await dialog(p,'#mgLevelTrigger','#mgLevelDialog');await p.locator('#mgLevelChoices [data-level="1"]').click();await ready(p,'en-es');
   const before=await p.locator('body').getAttribute('data-ambience');await p.locator('#mgPalette').click();assert.notEqual(await p.locator('body').getAttribute('data-ambience'),before);
   await enter(p);const current=await state(p);await openPanel(p,'voice');await p.locator('#mgVoicePanel').waitFor({state:'visible'});await fits(p,'#mgMenuDialog');if(size.width===1366)await shot(p,'voice-1366');await p.locator('#mgVoice').selectOption('es-ES-Chirp3-HD-Charon');await p.locator('#mgSpeed').selectOption('0.75');await dismiss(p,'#mgMenuDialog');
   await p.locator('#mgListen').click();const play=await p.evaluate(()=>window.__desktopLayoutMedia.plays.at(-1));assert.equal(new URL(play.src,ORIGIN).searchParams.get('voice'),'es-ES-Chirp3-HD-Charon');assert.equal(play.rate,.75,'selected speed reaches the media player');
   await openPanel(p,'account');await p.locator('#mgAccountPanel').waitFor({state:'visible'});await fits(p,'#mgAccountBack');if(size.width===1366)await shot(p,'account-1366');assert.equal(new URL(p.url()).pathname,'/parcours-niveaux.html');await p.locator('#mgAccountBack').click();assert.deepEqual(await state(p),current,'account closes back onto the exact modern lesson');
   report.cases.push({name:'desktop-all-controls',size,native:'en',voice:'es-ES-Chirp3-HD-Charon',speed:.75,accountStaysInCourse:true});
  }finally{await f.close();}
 }
}));

test('desktop listening and next stay nearby, fit whole real cards and validate the card explicitly left by Next',()=>checked('desktop-nearby-lesson-actions',async()=>{
 for(const size of [{width:1366,height:768},{width:1440,height:900}])for(const config of [{pair:'en-es',level:1},{pair:'fr-zh',level:1},{pair:'fr-es',level:8,long:true}]){
  const f=await fixture({...size,...config});try{
   const p=f.page;await enter(p,config);const phrase=await modelSource(p),before=await state(p),position=(await p.locator('#mgCounter').textContent()).match(/(\d+)\s*\/\s*(\d+)/);assert.ok(position,'real phrase counter exists');await shot(p,'initial-lesson-'+config.pair+'-L'+config.level+'-'+size.width);await wholeCard(p);await desktopLayout(p);
   const listen=await fits(p,'#mgListen'),next=await fits(p,'#mgContinue');assert.ok(Math.abs(listen.top-next.top)<=16,'audio and next share the same nearby command row');assert.ok(Math.abs((listen.left+listen.right)/2-(next.left+next.right)/2)<=310,'one short pointer movement reaches next');
   const known=await p.evaluate(()=>localStorage.getItem('melunga-guided-known-v1'));await p.locator('#mgListen').click();const media=await p.evaluate(()=>window.__desktopLayoutMedia.plays);assert.equal(media.length,1);const url=new URL(media[0].src,ORIGIN);assert.equal(url.searchParams.get('text'),phrase.study);assert.equal(url.searchParams.get('lang'),config.pair.endsWith('-zh')?'cmn-CN':'es-ES');
   assert.equal(await p.evaluate(()=>localStorage.getItem('melunga-guided-known-v1')),known,'listening does not validate the card');
   await p.locator('#mgContinue').click();const after=await state(p);
   assert.equal(after.pairId,before.pairId);assert.equal(after.themeId,before.themeId);assert.equal(after.level,before.level);
   if(after.screen==='done')assert.equal(Number(position[1]),Number(position[2]),'completion is allowed only after the last phrase');
   else{assert.notEqual(after.phraseId,before.phraseId,'one desktop next click must change the phrase, not just understand→imitate');const nextPosition=(await p.locator('#mgCounter').textContent()).match(/(\d+)\s*\/\s*(\d+)/);assert.ok(nextPosition);assert.equal(Number(nextPosition[1]),Number(position[1])+1,'one click advances exactly one phrase');assert.equal(nextPosition[2],position[2]);await modelSource(p);}
   const expectedKnown=JSON.parse(known||'{"version":1,"pairs":{}}');
   expectedKnown.pairs[before.pairId]=[...new Set([...(expectedKnown.pairs[before.pairId]||[]),before.phraseId])];
   assert.deepEqual(await p.evaluate(()=>JSON.parse(localStorage.getItem('melunga-guided-known-v1'))),expectedKnown,'desktop Next validates exactly the production card it leaves and preserves all prior decisions');
   assert.deepEqual(await p.evaluate(()=>window.__desktopLayoutMedia.browser),[]);assert.ok(await p.evaluate(()=>window.__desktopLayoutMedia.instances.every(a=>a.paused)),'moving on cancels the previous media');
   if(config.pair==='fr-zh'){await p.locator('#mgReadingToggle').click();assert.equal(await p.locator('#mgReadingToggle').getAttribute('aria-pressed'),'true');await modelSource(p);}
   report.cases.push({name:'desktop-real-card',size,...config,phraseId:phrase.id,study:phrase.study,nextPhraseId:after.phraseId,nextScreen:after.screen,oneClickChangesPhrase:true,listen,next});await shot(p,'lesson-'+config.pair+'-L'+config.level+'-'+size.width);
  }finally{await f.close();}
 }
}));

test('mobile header, pills, original footer, card and Pinyin match the actual published baseline',()=>checked('mobile-baseline-layout',async()=>{
 for(const config of [{pair:'en-es',level:1},{pair:'fr-zh',level:1},{pair:'fr-es',level:8,long:true}]){
  let before;for(const baseline of [true,false]){const f=await fixture({width:390,height:700,...config,baseline});try{
   const p=f.page;const themes=await mobileSnapshot(p);await enter(p,config);await modelSource(p);await wholeCard(p);const lesson=await mobileSnapshot(p);let pinyin=null;
   if(config.pair==='fr-zh'){await p.locator('#mgReadingToggle').click();await modelSource(p);pinyin=await mobileSnapshot(p);}
   const oldStep=await state(p),knownBefore=await p.evaluate(()=>localStorage.getItem('melunga-guided-known-v1'));await p.locator('#mgContinue').click();const newStep=await state(p),continued={beforePhrase:oldStep.phraseId,beforeIndex:oldStep.stepIndex,afterPhrase:newStep.phraseId,afterIndex:newStep.stepIndex};
   assert.equal(newStep.stepIndex,oldStep.stepIndex+1,'mobile Continue keeps its original one-step progression');
   assert.equal(await p.evaluate(()=>localStorage.getItem('melunga-guided-known-v1')),knownBefore,'the first mobile guided step does not validate');
   if(baseline)before={themes,lesson,pinyin,continued};else{sameMobile(before.themes,themes);sameMobile(before.lesson,lesson);if(pinyin)sameMobile(before.pinyin,pinyin);assert.deepEqual(continued,before.continued,'mobile Continue matches actual baseline, independently of desktop phrase navigation');await shot(p,'mobile-unchanged-'+config.pair+'-L'+config.level);}
   await p.locator('#mgContinue').click();const recallStep=await state(p);
   assert.equal(recallStep.stepIndex,oldStep.stepIndex+2,'the second mobile click reaches the recall step without skipping it');
   assert.equal(recallStep.phraseId,oldStep.phraseId,'the first two mobile clicks stay on the same production card');
   assert.equal(await p.evaluate(()=>localStorage.getItem('melunga-guided-known-v1')),knownBefore,'the second mobile guided step does not validate before recall');
   report.cases.push({name:'mobile-baseline-comparison',...config,baseline,originalFooter:true,continueTransition:continued});
  }finally{await f.close();}}
 }
}));

test('mobile keeps all four original swipe directions, feedback and classification separate from next',()=>checked('mobile-original-gestures',async()=>{
 let before;for(const baseline of [true,false]){const f=await fixture({width:390,height:700,pair:'fr-zh',baseline});try{
  const p=f.page;await enter(p);const initial=await state(p),transitions=[];await touch(p,0,-105);const second=await state(p);assert.notEqual(second.phraseId,initial.phraseId);transitions.push(second.phraseId);
  await touch(p,0,105);assert.equal((await state(p)).phraseId,initial.phraseId);await touch(p,-105,0);assert.equal((await state(p)).phraseId,second.phraseId);assert.equal(await p.locator('#mgCardToast').textContent(),'Elle reviendra');
  assert.ok(await p.evaluate(id=>JSON.parse(localStorage.getItem('melunga-guided-review-v1')).entries.some(x=>x.id===id),initial.phraseId));await touch(p,0,105);await touch(p,105,0);assert.equal((await state(p)).phraseId,second.phraseId);assert.equal(await p.locator('#mgCardToast').textContent(),'Rangée');
  const stored=await p.evaluate(()=>({review:JSON.parse(localStorage.getItem('melunga-guided-review-v1')),known:JSON.parse(localStorage.getItem('melunga-guided-known-v1'))}));
  assert.ok(stored.known.pairs['fr-zh'].includes(initial.phraseId));assert.ok(!stored.review.entries.some(x=>x.id===initial.phraseId));if(baseline)before={transitions,known:stored.known};else assert.deepEqual({transitions,known:stored.known},before);
  report.cases.push({name:'mobile-four-swipes',baseline,initial:initial.phraseId,next:second.phraseId,classificationPreserved:true});
 }finally{await f.close();}}
}));

test('resizing between desktop and mobile moves controls once and preserves the current card',()=>checked('responsive-roundtrip',async()=>{
 const f=await fixture();try{const p=f.page;await enter(p);const current=await state(p);await desktopLayout(p);await p.setViewportSize({width:390,height:700});await settled(p);await wholeCard(p);
  for(const id of ['mgLevelTrigger','mgLanguageTrigger','mgPalette','mgMenuTrigger','mgListen','mgContinue','mgReplay'])assert.equal(await p.locator('#'+id).count(),1,'one real control '+id);
  assert.deepEqual(await state(p),current);await fits(p,'#mgFooter');await p.setViewportSize({width:1440,height:900});await settled(p);await desktopLayout(p);await wholeCard(p);assert.deepEqual(await state(p),current);report.cases.push({name:'desktop-mobile-desktop-roundtrip',pair:current.pairId,phraseId:current.phraseId});
 }finally{await f.close();}
}));

test('read-only document recovery retries transient failures, keeps rights gated and rejects incompatible SHA',()=>checked('read-only-data-recovery',async()=>{
 const bank='content/native-catalogue/es.json',rights='content/course-access.json';
 {const f=await fixture({faultPath:bank,faultMode:'once503'});try{
  assert.equal(f.requests[bank],2,'one automatic retry recovers the Spanish bank');assert.equal(await f.page.evaluate(()=>window.__desktopLayoutRetryClicks),0);assert.equal(await f.page.locator('#mgRetry').isHidden(),true);
  report.cases.push({name:'bank-transient-503-recovers-without-click',pair:'en-es',level:1,attempts:f.requests[bank]});
 }finally{await f.close();}}
 {const f=await fixture({faultPath:rights,faultMode:'once503',holdPath:rights,waitReady:false,extraOnce503:['content/niveaux-progressifs/manifest.json']});try{
  await f.started(rights,2);assert.equal(await f.page.locator('#mgThemeView').isHidden(),true);assert.equal(await f.page.locator('#mgThemeGrid').locator('button').count(),0);assert.equal(await f.page.evaluate(()=>window.MelungaCourseAccess.state().ready),false,'no card while the valid rights document is still pending');
  f.release();await ready(f.page,'en-es');assert.equal(f.requests[rights],2);assert.equal(f.requests['content/niveaux-progressifs/manifest.json'],2);report.cases.push({name:'manifest-and-rights-retry-keep-every-card-gated',pair:'en-es',level:1,rightsAttempts:2,manifestAttempts:2});
 }finally{await f.close();}}
 {const f=await fixture({faultPath:bank,faultMode:'permanent503',waitReady:false});try{
  await f.page.locator('#mgRetry').waitFor({state:'visible'});assert.equal(f.requests[bank],2,'permanent failure stops after two attempts');assert.equal(await f.page.locator('#mgThemeGrid button').count(),0);await fits(f.page,'#mgRetry');
  f.faultMode=null;await f.page.locator('#mgRetry').click();await ready(f.page,'en-es');assert.equal(await f.page.evaluate(()=>window.__desktopLayoutRetryClicks),1);report.cases.push({name:'permanent-failure-then-real-retry',pair:'en-es',level:1,failedAttempts:2,totalBankRequests:f.requests[bank]});
 }finally{await f.close();}}
 {const f=await fixture({faultPath:bank,faultMode:'corrupt',waitReady:false});try{
  await f.page.locator('#mgRetry').waitFor({state:'visible'});assert.equal(await f.page.locator('#mgThemeView').isHidden(),true);assert.equal(await f.page.locator('#mgThemeGrid button').count(),0);assert.equal(f.requests[bank],1,'a successful HTTP transfer with incompatible SHA is refused, not replaced with fallback content');
  report.cases.push({name:'incompatible-source-sha-remains-refused',pair:'en-es',level:1,attempts:1,noDataFallback:true});
 }finally{await f.close();}}
}));
