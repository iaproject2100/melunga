/* First-paint regression: hold scripts, sample rendered frames, and verify recovery.
 * All requests use local fixtures; no real account, audio or payment. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const {chromium}=require('playwright-core');
const ROOT=path.resolve(__dirname,'../..'),WEB=path.join(ROOT,'melunga_deploy'),BASE='46b34fcba27c94e82140953577804d0a4aaf6528';
const ORIGIN='https://desktop-course-layout.test',CODES=['fr','en','es','zh','it','ja','ko'];
const OUT='/workspace/melunga/docs/direct-language-start/layout-verification.json';
const CAPTURES='/workspace/melunga/docs/direct-language-start/captures';
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
const REQUIRED=['source-conservation','themes-icons-only','mobile-dock-matrix','native-hidden-labels','original-controls-and-review','desktop-and-restoration','contrast-17-ambiances','occupied-bottom-space','loading-themes-done','masked-hidden-states','shared-audio-seven-pairs','shortcut-rebuilds'];
const report={status:'running',baseCommit:BASE,environment:'Local Chromium; desktop and mobile viewport/touch emulation',physicalDeviceTested:false,safariTested:false,
  realAudioPlayed:false,upstreamTtsCalled:false,realAccountsUsed:false,nonGetRequestsAllowed:false,allResponsesLocalFixtures:true,checks:[],cases:[],api:[],errors:[],unexpected:[],fixtureErrors:[],screenshots:[]};
const checked=async(name,fn)=>{try{await fn();report.checks.push(name);}catch(e){report.errors.push(name+': '+e.message);throw e;}};
let browser,inputs;
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
   if(u.origin==='https://fonts.googleapis.com'&&req.method()==='GET')return await route.fulfill({contentType:'text/css',body:'/* local font fixture */'});
   if(u.origin!==ORIGIN||req.method()!=='GET'){report.unexpected.push({origin:u.origin,path:u.pathname,method:req.method()});return await route.abort();}
   if(u.pathname==='/.netlify/functions/check-status'){report.api.push({kind:'status',paid:f.paid});return await route.fulfill({json:{paid:f.paid}});}
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
 f.close=async()=>{f.closed=true;release();for(const done of f.waiters.values())done();await context.close();};await page.goto(ORIGIN+'/parcours-niveaux.html?pair='+pair+'&level='+level,{waitUntil:'domcontentloaded'});if(waitReady)await ready(page,pair,level);await page.evaluate(()=>window.__qaOriginalNodes=Object.fromEntries(['mgLevelTrigger','mgLanguageTrigger','mgPalette','mgMenuTrigger','mgReplay','mgContinue','mgListen','mgEar'].map(id=>[id,document.getElementById(id)])));return f;
}const state=p=>p.evaluate(()=>window.MelungaMockup.state());
async function settled(p){await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));}
async function ready(p,pair,level=1){await p.waitForFunction(({pair,level})=>{const s=window.MelungaMockup?.state();return s?.screen==='themes'&&s.pairId===pair&&s.level===level;},{pair,level},{timeout:25000});await p.waitForFunction(()=>window.MelungaVoiceSelection?.state().status==='ready');await p.evaluate(()=>document.fonts.ready);await settled(p);}

const OUTPUT=process.env.WELCOME_STARTUP_REPORT_DIR||'/tmp/melunga-welcome-startup';
(async()=>{
 fs.mkdirSync(OUTPUT,{recursive:true});browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const initial=fingerprint(),result={status:'running',physicalDeviceTested:false,safariTested:false,allResponsesLocalFixtures:true,cases:[]};
 try{
  for(const config of [{width:320,locale:'fr',script:'desktop-home.js'},{width:390,locale:'en',script:'desktop-home.js'},{width:1366,locale:'fr',script:'desktop-home.js'},{width:390,locale:'zh',script:'course-i18n.js'}]){
   const pair=config.locale==='fr'?'fr-es':config.locale+'-fr',f=await fixture({width:config.width,height:740,pair,paid:false});try{
    let release,started;const gate=new Promise(r=>release=r),seen=new Promise(r=>started=r);
    await f.context.route('**/'+config.script+'*',async route=>{started();await gate;await route.fulfill({contentType:'text/javascript',body:fs.readFileSync(path.join(WEB,config.script))});});
    await f.context.addInitScript(()=>{window.__startupFrames={count:0,bad:[]};function sample(){const data=window.__startupFrames,n=document.querySelector('[data-screen="welcome"].active');data.count++;if(n&&getComputedStyle(n).visibility!=='hidden'&&n.getBoundingClientRect().width&&innerWidth<960){const ex=n.querySelector('.hc-example'),capsules=n.querySelector('.hc-capsules');if(!n.classList.contains('hc-welcome')||!ex||!capsules||ex.parentElement!==n)data.bad.push({frame:data.count,text:n.textContent.slice(0,80)});}requestAnimationFrame(sample);}requestAnimationFrame(sample);});
    const p=f.page;await p.goto(ORIGIN+'/index.html?country=FR',{waitUntil:'commit'});await seen;await p.locator('#welcomeBoot').waitFor({state:'visible'});await p.waitForFunction(()=>window.__startupFrames.count>=35);
    assert.equal(await p.locator('.stage').evaluate(n=>getComputedStyle(n).visibility),'hidden');assert.equal(await p.locator('#welcomeBootRetry').isVisible(),false);
    assert.equal(await p.evaluate(()=>{const n=document.elementFromPoint(innerWidth/2,innerHeight/2);return !!n?.closest('#welcomeBoot');}),true);
    if(config.width===390&&config.locale==='en'){const session=await p.context().newCDPSession(p);const shot=await session.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(OUTPUT,'slow-loading-brand.png'),Buffer.from(shot.data,'base64'));await session.detach();}
    release();await p.waitForFunction(()=>!document.documentElement.classList.contains('welcome-pending')&&!document.getElementById('welcomeBoot'));await p.waitForFunction(()=>window.__startupFrames.count>=45);
    assert.equal(await p.locator('html').getAttribute('lang'),config.locale);assert.equal(await p.locator('.hc-example').count(),1);assert.deepEqual(await p.evaluate(()=>window.__startupFrames.bad),[]);
    if(config.width<960){await p.locator('.hc-example').click();await p.locator('[data-screen="method"].active').waitFor();await p.locator('[data-screen="method"] [data-go="welcome"]').click();await p.locator('.hc-example').waitFor({state:'visible'});assert.equal(await p.locator('#welcomeBoot').count(),0);assert.deepEqual(await p.evaluate(()=>window.__startupFrames.bad),[]);}
    result.cases.push({...config,status:'passed',oldVisibleFrames:0,frames:(await p.evaluate(()=>window.__startupFrames.count))});
   }finally{await f.close();}
  }
  const f=await fixture({width:390,height:740,pair:'en-es',paid:false});try{
   let requests=0;await f.context.route('**/desktop-home.js*',async route=>{requests++;await route.fulfill(requests===1?{status:503,contentType:'text/javascript',body:'/* controlled script failure */'}:{contentType:'text/javascript',body:fs.readFileSync(path.join(WEB,'desktop-home.js'))});});
   const p=f.page;await p.goto(ORIGIN+'/index.html?country=FR');await p.locator('#welcomeBootRetry').waitFor({state:'visible'});assert.equal(await p.locator('#welcomeBootRetry').textContent(),'Try again');assert.equal(await p.locator('.stage').evaluate(n=>getComputedStyle(n).visibility),'hidden');
   await p.locator('#welcomeBootRetry').click();await p.waitForFunction(()=>!document.documentElement.classList.contains('welcome-pending'));assert.equal(await p.locator('.hc-example').isVisible(),true);result.cases.push({name:'script-failure-retry-no-legacy-fallback',requests,status:'passed'});
  }finally{await f.close();}

  const native=await fixture({width:390,height:740,pair:'fr-es',paid:false});try{
   let release,started;const gate=new Promise(r=>release=r),seen=new Promise(r=>started=r);
   await native.context.route('**/desktop-home.js*',async route=>{started();await gate;await route.fulfill({contentType:'text/javascript',body:fs.readFileSync(path.join(WEB,'desktop-home.js'))});});
   const p=native.page;await p.goto(ORIGIN+'/index.html?country=FR',{waitUntil:'commit'});await seen;
   await p.evaluate(()=>{window.Capacitor={isNativePlatform:()=>true};});release();
   await p.waitForFunction(()=>!document.documentElement.classList.contains('welcome-pending'));assert.equal(await p.locator('#welcomeBoot').count(),0);assert.equal(await p.locator('.hc-welcome').count(),0);result.cases.push({name:'late-native-bridge-keeps-own-presentation-without-stuck-cover',status:'passed'});
  }finally{await native.close();}
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.unexpected,[]);assert.deepEqual(report.fixtureErrors,[]);result.inputsStable=JSON.stringify(initial)===JSON.stringify(fingerprint());assert.ok(result.inputsStable);result.status='passed';
 }catch(e){result.status='failed';result.failure=e.stack;process.exitCode=1;console.error(e.stack);}finally{await browser.close();fs.writeFileSync(path.join(OUTPUT,'verification.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({status:result.status,cases:result.cases.length,failure:result.failure}));}
})();
