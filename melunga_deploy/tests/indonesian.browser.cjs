/* Local browser fixtures only: no accounts, provider calls or physical devices. */
'use strict';
const {test,before,after}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {chromium}=require('playwright-core');
const ROOT=path.resolve(__dirname,'../..'),WEB=path.join(ROOT,'melunga_deploy'),ORIGIN='https://indonesian.test';
const OUT=process.env.INDONESIAN_BROWSER_DIR||'/workspace/work/indonesien-2026-10-31/browser';
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
test('desktop/mobile home choices show the Indonesian flag, preserve the requested order and fit all available choices on one desktop screen',{timeout:90000},()=>checked('home-and-one-page-language-grid',async()=>{
 for(const [width,height] of [[390,844],[1366,768],[1024,600]]){
  const f=await fixture({width,height});try{const p=f.page;await p.goto(ORIGIN+'/index.html');
   if(width>=960){await p.locator('[data-dh-example="id"]').click();assert.equal(await p.locator('.dh-phrase').textContent(),cards[76].t);assert.equal(await p.locator('.dh-phonetic').textContent(),cards[76].pf);}
   await p.locator(width>=960?'[data-dh-free]':'[data-select-access="free"]').first().click();
   const choices=p.locator('[data-study-language]:visible');assert.equal(await choices.count(),12);
   const code=await choices.evaluateAll(nodes=>nodes.map(n=>n.dataset.studyLanguage));assert.deepEqual(code,['en','zh','ar','hi','ru','es','pt','ja','ko','de','it','id']);
   const id=p.locator('[data-study-language="id"]');assert.equal(await id.locator('strong').textContent(),'Bahasa Indonesia');
   const flag=await id.locator('.home-flag-id').first().evaluate(n=>getComputedStyle(n).backgroundImage);assert(flag.includes('ef3340')&&flag.includes('fff'));
   if(width>=960){const g=await choices.evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return{top:r.top,bottom:r.bottom};}));assert(g.every(r=>r.top>=0&&r.bottom<=height));assert(await p.locator('.phone').evaluate(n=>n.scrollHeight<=n.clientHeight+1));await capture(p,'choix-id-'+width);}
   await id.scrollIntoViewIfNeeded();await id.click();await ready(p,'fr-id',1,'lesson');assert.equal(await p.locator('#mgPhrase').textContent(),cards[0].t);await fit(p);
  }finally{await f.context.close();}
 }
}));
test('all seven supplied explanation languages open their exact Indonesian lesson on desktop and mobile',{timeout:120000},()=>checked('seven-explanation-languages',async()=>{
 const fields={fr:'frm',en:'en',es:'esm',it:'itm',zh:'cn',ja:'jam',ko:'kom'};
 for(const width of [390,1366])for(const [native,field] of Object.entries(fields)){
  const pair=native+'-id',f=await fixture({width,pair});try{const p=f.page;await go(p,pair);await enter(p,'saluer');
   const current=await state(p),i=Number(current.phraseId.split(':').at(-1));assert.equal(await p.locator('#mgPhrase').textContent(),cards[i].t);assert.equal(await p.locator('#mgTranslation').textContent(),cards[i][field]);
   assert.equal(await p.locator('#mgPhon').textContent(),cards[i][({fr:'pf',en:'py',es:'ps',it:'pi',zh:'phon',ja:'py',ko:'py'})[native]]);
   assert.equal(await p.locator('#mgLanguageFlag').getAttribute('data-language'),'id');await fit(p);
  }finally{await f.context.close();}
 }
}));
test('all ten levels show their exact domain counts; advanced skill subtitles and existing photos remain visible',{timeout:180000},()=>checked('ten-domain-levels-and-subtitles',async()=>{
 for(const width of [390,1366]){
  const f=await fixture({width});try{const p=f.page;
   for(let lv=1;lv<=10;lv++){
    await go(p,'fr-id',lv);const themes=bank.levels[lv-1].themes;
    const actual=await p.locator('#mgThemeGrid .mg-theme').evaluateAll(nodes=>nodes.map(n=>({id:n.dataset.themeId,count:Number(n.querySelector('.mg-theme-count').textContent.match(/\d+/)[0]),subtitle:n.querySelector('.mg-theme-subtitle')?.textContent})));
    assert.deepEqual(actual.map(t=>[t.id,t.count]),themes.map(t=>[t.id,t.phraseIds.length]));
    if(lv>=7)for(const t of themes.filter(t=>t.section==='situations'))assert(actual.find(x=>x.id===t.id).subtitle);
    assert(await p.locator('.mg-theme-photo img').count()>0);await fit(p);
    if(lv===1||lv===7)await capture(p,'themes-id-L'+lv+'-'+width);
   }
  }finally{await f.context.close();}
 }
}));
test('Indonesian listening, voice selection, saved reviews, progress and reload use the shared course controls',{timeout:60000},()=>checked('listening-review-and-progress',async()=>{
 const f=await fixture();try{const p=f.page;await go(p);await enter(p,'saluer');const id=(await state(p)).phraseId;
  await p.locator('#mgListen').click();let plays=await p.evaluate(()=>__idMedia.plays);assert.equal(new URL(plays.at(-1).src,ORIGIN).searchParams.get('lang'),'id-ID');assert.equal(new URL(plays.at(-1).src,ORIGIN).searchParams.get('voice'),'id-ID-Wavenet-A');
  await p.locator('#mgDesktopNav [data-menu-item="voice"]').click();await p.locator('#mgVoice').selectOption('id-ID-Wavenet-B');await p.locator('#mgMenuClose').click();await p.locator('#mgEar').click();plays=await p.evaluate(()=>__idMedia.plays);assert.equal(new URL(plays.at(-1).src,ORIGIN).searchParams.get('voice'),'id-ID-Wavenet-B');
  await p.locator('#mgReplay').click();assert((await p.evaluate(()=>JSON.parse(localStorage.getItem('melunga-guided-review-v1')).entries)).some(r=>r.id===id));
  const next=(await state(p)).phraseId;await p.locator('#mgContinue').click();assert((await p.evaluate(()=>JSON.parse(localStorage.getItem('melunga-guided-known-v1')).pairs['fr-id'])).includes(next));
  await p.reload();await ready(p,'fr-id');assert((await p.evaluate(()=>JSON.parse(localStorage.getItem('melunga-guided-known-v1')).pairs['fr-id'])).includes(next));await capture(p,'id-progression');
 }finally{await f.context.close();}
}));
test('unpaid Indonesian L2 uses the existing account handoff and returns to the same pair and level',{timeout:60000},()=>checked('unpaid-account-return',async()=>{
 for(const width of [390,1366]){const f=await fixture({width,level:2,paid:false});try{const p=f.page;await go(p,'fr-id',2);await p.locator('#mgThemeGrid .mg-theme[data-access="paid"]').first().click();await p.waitForURL(u=>u.pathname==='/app.html');
  const url=new URL(p.url());assert.equal(url.searchParams.get('courseReturn'),'fr-id');assert.equal(url.searchParams.get('study'),'id');await p.locator('#pwLoginEmail').waitFor();await p.locator('#courseLoginBack').click();await ready(p,'fr-id',2);assert.equal((await state(p)).access.paid,false);assert.deepEqual(f.posts,[]);
 }finally{await f.context.close();}}
}));
test('classic browser and native recognition both pass id-ID and accept spoken/written reduplication',{timeout:60000},()=>checked('classic-and-native-recognition',async()=>{
 for(const plugin of [false,true]){const f=await fixture({plugin});try{const p=f.page;await p.goto(ORIGIN+'/app.html?classic=1');await p.waitForFunction(()=>typeof window.startRec==='function'&&window.DECKS?.id?.length===4487);
  const result=await p.evaluate(async plugin=>{document.getElementById('lID').click();lang='id';pool=DECKS.id;idx=536;mode='listen';revealed=false;
   await startRec();if(!plugin){const row=[{transcript:'laki2',confidence:1}];row.isFinal=true;rec.onresult({results:[row]});}
   return{locale:plugin?__idMedia.nativeRecognition.at(-1)?.language:__idMedia.recognition.at(-1),correct:matchPhrase('laki2',pool[idx].t),label:document.getElementById('lID').textContent};},plugin);
  assert.equal(result.locale,'id-ID');assert(result.correct);assert(result.label.includes('Bahasa Indonesia'));assert.deepEqual(f.posts,[]);
 }finally{await f.context.close();}}
}));
