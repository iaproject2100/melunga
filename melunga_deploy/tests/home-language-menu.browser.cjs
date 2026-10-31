/* Local browser fixtures only: no accounts, provider calls or physical devices. */
'use strict';
const {test,before,after}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {chromium}=require('playwright-core');
const ROOT=path.resolve(__dirname,'../..'),WEB=path.join(ROOT,'melunga_deploy'),ORIGIN='https://indonesian.test';
const OUT=process.env.HOME_MENU_BROWSER_DIR||'/workspace/work/home-language-menu/browser';
const read=p=>fs.readFileSync(path.join(WEB,p));
const cards=JSON.parse(fs.readFileSync(path.join(ROOT,'tools/maquette-guidee/imports/indonesian-v1/id-deck-v1.json')));
const bank=JSON.parse(read('content/native-catalogue/id.json'));
const report={status:'running',allResponsesLocal:true,providerCalled:false,realAudioPlayed:false,physicalDeviceTested:false,cases:[],errors:[],unexpected:[],screenshots:[]};
let browser,initial;
const fingerprint=()=>Object.fromEntries([...fs.readdirSync(WEB).filter(f=>/\.(js|css|html)$/.test(f)),
 'content/native-catalogue/manifest.json','content/native-catalogue/id.json','content/native-catalogue/theme-placements.json',
 'netlify/functions/tts.mjs','netlify/functions/lib/chirp-catalog.mjs'].map(p=>[p,crypto.createHash('sha256').update(read(p)).digest('hex')]));
function catalogue(){
 const now=Date.now(),codes={fr:['fr-FR','F','Aoede'],en:['en-US','C','Kore'],es:['es-ES','F','Kore'],zh:['cmn-CN','A','Kore'],it:['it-IT','E','Charon'],ja:['ja-JP','B','Kore'],ko:['ko-KR','A','Kore'],de:['de-DE','A','Kore']};
 return {version:1,source:'google-voices-list',previewOnly:true,selectionVersion:'kartech-2026-10-30-en-us',verifiedAt:new Date(now-1000).toISOString(),expiresAt:new Date(now+240000).toISOString(),
  languages:Object.fromEntries(Object.entries(codes).map(([language,[languageCode,wave,approved]])=>{
   const chirp=[['Aoede','FEMALE'],['Kore','FEMALE'],['Charon','MALE']].map(([name,gender])=>({name:languageCode+'-Chirp3-HD-'+name,languageCode,gender,engine:'chirp3',rateMode:'client'}));
   return [language,{language,available:true,chirp,defaultVoice:chirp.find(v=>v.name.endsWith('-'+approved)),waveNet:{name:languageCode+'-Wavenet-'+wave,languageCode,gender:'FEMALE',engine:'wavenet',rateMode:'server'}}];
  }))};
}
before(async()=>{fs.mkdirSync(OUT,{recursive:true});initial=fingerprint();browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});});
after(async()=>{await browser?.close();report.inputsStable=JSON.stringify(initial)===JSON.stringify(fingerprint());report.inputSha256=initial;
 report.status=!report.errors.length&&!report.unexpected.length&&report.inputsStable?'passed':'failed';
 fs.writeFileSync(path.join(OUT,'acceptance.json'),JSON.stringify(report,null,2)+'\n');assert.deepEqual(report.errors,[]);assert.deepEqual(report.unexpected,[]);assert(report.inputsStable);});
async function checked(name,fn){try{await fn();report.cases.push(name);}catch(e){report.errors.push(name+': '+e.message);throw e;}}
async function fixture({width=1366,height=900,pair='fr-id',level=1,paid=true,plugin=false}={}){
 const context=await browser.newContext({viewport:{width,height},isMobile:width<960,hasTouch:width<960,reducedMotion:'reduce',serviceWorkers:'block'}),f={context,posts:[]};
 await context.addInitScript(({pair,level,plugin})=>{
  if(!sessionStorage.getItem('__idSeed')){localStorage.setItem('ox_device','indonesian-browser-fixture');localStorage.setItem('ox_paid','1');localStorage.setItem('melunga-app-language',JSON.stringify({locale:pair.split('-')[0]}));localStorage.setItem('melunga-course-pair',pair);localStorage.setItem('melunga-course-level',String(level));sessionStorage.setItem('__idSeed','1');}
  const media=window.__idMedia={plays:[],speech:[],recognition:[],nativeRecognition:[]};
  window.Audio=class extends EventTarget{constructor(src){super();this.src=src||'';this.paused=true;this.currentTime=0;this.playbackRate=1;}play(){this.paused=false;media.plays.push({src:this.src,rate:this.playbackRate});queueMicrotask(()=>{if(!this.paused){this.onplaying?.(new Event('playing'));this.dispatchEvent(new Event('playing'));}});return Promise.resolve();}pause(){this.paused=true;}load(){}removeAttribute(n){if(n==='src')this.src='';}};
  window.SpeechRecognition=class{start(){media.recognition.push(this.lang);this.onstart?.();}stop(){this.onend?.();}abort(){this.onend?.();}};
  window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};
  Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},getVoices(){return[{lang:'fr-FR',name:'French fixture'},{lang:'id-ID',name:'Indonesian fixture'}];},addEventListener(){},removeEventListener(){},speak(u){media.speech.push({text:u.text,lang:u.lang,voice:u.voice?.lang});u.onstart?.();}}});
  if(plugin)window.Capacitor={isNativePlatform:()=>false,Plugins:{MelungaSpeech:{recognize:async options=>{media.nativeRecognition.push(options);return{matches:['laki2']};}}}};
 },{pair,level,plugin});
 await context.route('**/*',async route=>{
  const req=route.request(),u=new URL(req.url());
  if(u.origin!==ORIGIN){if(!/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname))report.unexpected.push(u.origin+u.pathname);return route.abort();}
  if(req.method()!=='GET'){f.posts.push(u.pathname);report.unexpected.push('POST '+u.pathname);return route.abort();}
  if(u.pathname==='/.netlify/functions/check-status')return route.fulfill({json:{paid}});
  if(u.pathname==='/.netlify/functions/get-pricing')return route.fulfill({json:{country:'FR',monthlyDisplay:'7,90 €',annualDisplay:'42 €'}});
  if(u.pathname==='/api/geolocation')return route.fulfill({json:{country:'FR'}});
  if(u.pathname==='/.netlify/functions/tts'&&u.searchParams.get('catalog')==='chirp3')return route.fulfill({json:catalogue()});
  if(u.pathname==='/mobile-runtime.js')return route.fulfill({contentType:'text/javascript',body:'/* ordinary web fixture */'});
  const relative=decodeURIComponent(u.pathname==='/'?'/index.html':u.pathname).slice(1),file=path.resolve(WEB,relative);
  if(!file.startsWith(WEB+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){report.unexpected.push('missing '+u.pathname);return route.fulfill({status:404,body:'Not found'});}
  return route.fulfill({body:fs.readFileSync(file),contentType:{'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2'}[path.extname(file)]||'application/octet-stream'});
 });
 f.page=await context.newPage();f.page.setDefaultTimeout(12000);f.page.on('pageerror',e=>report.errors.push(e.message));return f;
}
const state=p=>p.evaluate(()=>MelungaMockup.state());
async function ready(p,pair,level=1,screen='themes'){await p.waitForFunction(({pair,level,screen})=>{const s=window.MelungaMockup?.state();return s?.pairId===pair&&s.level===level&&s.screen===screen;},{pair,level,screen},{timeout:30000});await p.waitForFunction(()=>!document.documentElement.classList.contains('course-presentation-pending'));}
async function go(p,pair='fr-id',level=1){await p.goto(ORIGIN+'/parcours-niveaux.html?'+new URLSearchParams({pair,level:String(level)}),{waitUntil:'domcontentloaded'});await ready(p,pair,level);}
async function capture(p,name){await p.evaluate(()=>document.fonts.ready);await p.locator('img').evaluateAll(nodes=>Promise.all(nodes.filter(n=>{const r=n.getBoundingClientRect();return r.width&&r.height&&r.top<innerHeight&&r.bottom>0;}).map(n=>n.decode().catch(()=>{}))));const file=path.join(OUT,name+'.png');await p.screenshot({path:file,animations:'disabled'});report.screenshots.push(file);}
async function fit(p){assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no horizontal overflow');}
async function enter(p,theme){const button=p.locator('#mgThemeGrid .mg-theme[data-theme-id="'+theme+'"]');for(let i=0;i<30&&!await button.isVisible();i++)await p.locator('.mg-desktop-page-next').click();await button.scrollIntoViewIfNeeded();await button.click();if((await state(p)).screen==='sequences')await p.locator('#mgSequences .mg-sequence').first().click();await p.waitForFunction(()=>MelungaMockup.state().screen==='lesson');}

test('compact translucent application-language menu keeps every existing locale accessible on mobile, desktop and short windows',{timeout:180000},()=>checked('compact-glass-menu-all-locales',async()=>{
 const locales=['fr','en','es','it','zh','ja','ko','de','ru','pt','ar','hi'];
 for(const [width,height] of [[320,568],[390,844],[1024,600],[1366,900]])for(const locale of locales){
  const f=await fixture({width,height,pair:locale+'-en'});try{
   const p=f.page;await p.goto(ORIGIN+'/index.html',{waitUntil:'domcontentloaded'});
   const opener=width>=960?p.locator('.dh-language'):p.locator('[data-open-app-language]');await opener.click();
   await p.locator('#appLanguageMenu[open]').waitFor();
   const g=await p.locator('.app-language-sheet').evaluate(n=>{const r=n.getBoundingClientRect(),style=getComputedStyle(n),list=n.querySelector('.app-language-grid');return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,viewport:[innerWidth,innerHeight],scrollWidth:document.documentElement.scrollWidth,bg:style.backgroundColor,opacity:style.opacity,blur:style.backdropFilter,listOverflow:list.scrollHeight>list.clientHeight,flagCount:n.querySelectorAll('[data-app-language]:not([hidden])').length};});
   assert(g.width<=288.1&&g.width<=width-24);assert(g.x>=0&&g.y>=0&&g.right<=width+.5&&g.bottom<=height+.5,JSON.stringify(g));assert(g.scrollWidth<=width+1);assert.equal(g.opacity,'1');assert.match(g.bg,/0\.78/);assert.equal(g.flagCount,12);assert(g.listOverflow);assert.equal(await p.locator('.app-indonesian-shortcut').isVisible(),['fr','en','es','it','zh','ja','ko'].includes(locale));
   assert(await p.locator('.app-language-track').isVisible());assert(await p.locator('.app-language-more').isVisible());
   assert(await p.locator('.app-language-head h3').evaluate(n=>n.scrollWidth<=n.clientWidth+1));
   assert(await p.locator('.app-language-choice').evaluateAll(ns=>ns.every(n=>n.scrollWidth<=n.clientWidth+1)));
   await p.locator('.app-language-grid').evaluate(n=>{n.scrollTop=0;n.dispatchEvent(new Event('scroll'));});
   await p.locator('.app-language-more').click();await p.waitForTimeout(80);assert(await p.locator('.app-language-grid').evaluate(n=>n.scrollTop)>0);
   await p.locator('[data-app-language=it]').focus();await p.keyboard.press('End');await p.waitForTimeout(30);assert.equal(await p.evaluate(()=>document.activeElement.dataset.appLanguage),'it');
   assert.match(await p.locator('.app-language-range').textContent(),/12 \/ 12$/);
   await p.locator('.app-language-more').click();await p.waitForTimeout(60);assert.equal(await p.locator('.app-language-grid').evaluate(n=>n.scrollTop),0);
   if(locale==='fr'){
    const thumb=await p.locator('.app-language-thumb').boundingBox();await p.mouse.move(thumb.x+thumb.width/2,thumb.y+thumb.height/2);await p.mouse.down();await p.mouse.move(thumb.x+thumb.width/2,thumb.y+thumb.height/2+30,{steps:5});await p.mouse.up();assert(await p.locator('.app-language-grid').evaluate(n=>n.scrollTop)>0);
    await p.locator('.app-language-grid').evaluate(n=>{n.scrollTop=0;n.dispatchEvent(new Event('scroll'));});await capture(p,'menu-'+width+'-'+height);
   }
   await p.locator('[data-close-app-language]').click();assert(await p.locator('#appLanguageMenu').evaluate(n=>!n.open));
   await opener.click();await p.keyboard.press('Escape');assert(await p.locator('#appLanguageMenu').evaluate(n=>!n.open));assert(await opener.evaluate(n=>document.activeElement===n));
   report.cases.push({locale,width,height,menuWidth:g.width,translucent:true,languages:12,thumbAndButtons:true});
  }finally{await f.context.close();}
 }
}));

test('Bahasa Indonesia is reachable from the first-page language menu in all seven supplied explanation languages',{timeout:90000},()=>checked('first-page-indonesian-access',async()=>{
 for(const width of [390,1366])for(const locale of ['fr','en','es','it','zh','ja','ko']){
  const f=await fixture({width,pair:locale+'-id'});try{
   const p=f.page;await p.goto(ORIGIN+'/index.html',{waitUntil:'domcontentloaded'});
   await (width>=960?p.locator('.dh-language'):p.locator('[data-open-app-language]')).click();
   assert(await p.locator('[data-learn-indonesian]').isVisible());
   assert.equal(await p.locator('[data-learn-indonesian] .home-flag').evaluate(n=>getComputedStyle(n).backgroundImage.startsWith('url(')),true);
   await p.locator('[data-learn-indonesian]').click();await p.waitForURL(/parcours-niveaux\.html/);
   await p.waitForFunction(()=>window.MelungaMockup?.state().screen==='lesson');
   assert.equal((await state(p)).pairId,locale+'-id');assert.equal((await state(p)).level,1);assert.equal(await p.locator('#mgLanguageFlag').getAttribute('data-language'),'id');
   assert.equal(JSON.parse(await p.evaluate(()=>localStorage.getItem('melunga-app-language'))).locale,locale);
   if(locale==='fr'&&width===390)await capture(p,'indonesien-depuis-accueil');
   report.cases.push({name:'indonesian-access',locale,width,pair:locale+'-id'});
  }finally{await f.context.close();}
 }
}));
