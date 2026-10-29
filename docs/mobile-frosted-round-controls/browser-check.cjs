/* Real course acceptance for the approved desktop header and nearby controls.
 * Network/status/catalogue/media are explicit fixtures. Mobile layout is also
 * compared with the actual 7b17e56 HTML/CSS/JS, not a hand-drawn approximation. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const {chromium}=require('playwright-core');
const {PNG}=require('pngjs');
const ROOT=path.resolve(__dirname,'../..'),WEB=path.join(ROOT,'melunga_deploy'),BASE='69674c0508d04c0332a4cf1969a1467165a45544';
const ORIGIN='https://desktop-course-layout.test',CODES=['fr','en','es','zh','it','ja','ko'];
const OUT='/workspace/melunga/docs/mobile-speaker-four-integration/browser-report.json';
const CAPTURES='/workspace/melunga/docs/mobile-speaker-four-integration/captures';
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
}
const state=p=>p.evaluate(()=>window.MelungaMockup.state());
async function settled(p){await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));}
async function ready(p,pair,level=1){await p.waitForFunction(({pair,level})=>{const s=window.MelungaMockup?.state();return s?.screen==='themes'&&s.pairId===pair&&s.level===level;},{pair,level},{timeout:25000});await p.waitForFunction(()=>window.MelungaVoiceSelection?.state().status==='ready');await p.evaluate(()=>document.fonts.ready);await settled(p);}
async function enter(p,{long=false}={}){
 const tile=long?p.locator('#mgThemeGrid .mg-theme').filter({hasText:'Réclamation : négocier avec tact'}):p.locator('#mgThemeGrid .mg-theme:not([data-access="paid"]):visible').first();
 if(long&&p.viewportSize().width>=1101)for(let i=0;i<30&&!await tile.isVisible();i++){const next=p.locator(SELECT.next);assert.equal(await next.isEnabled(),true,'long source theme remains reachable');await next.click();await settled(p);}
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
  return{document:{width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight},viewport:{width:innerWidth,height:innerHeight},card:rect(document.getElementById('mgLessonView')),content:rect(document.getElementById('mgContent')),footer:rect(document.querySelector('.mg-mobile-dock #mgListen:not([hidden])') || (document.getElementById('mgFooter').getClientRects().length ? document.getElementById('mgFooter') : document.getElementById('mgReplay'))),
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
const PHOTO='.mg-lesson-top > .mg-mobile-theme-photo',SELECT={next:'.mg-desktop-page-next'};
async function decodedPhotos(p,selector){const data=await p.locator(selector).evaluateAll(async ns=>Promise.all(ns.filter(n=>n.getClientRects().length&&getComputedStyle(n).visibility!=='hidden').map(async n=>{await n.decode();return{src:new URL(n.currentSrc||n.src).pathname,width:n.naturalWidth,height:n.naturalHeight};})));assert.ok(data.length,'actual photo images exist in '+selector);assert.ok(data.every(n=>n.width>0&&n.height>0),'all visible actual photo images decode');return data;}
const cropKeys=['--mg-photo-column','--mg-photo-row','--mg-photo-columns','--mg-photo-rows'];
async function currentPhoto(p){await settled(p);const data=await p.evaluate(({selector,cropKeys})=>{const chosen=window.MelungaMockup.state(),source=[...document.querySelectorAll('#mgThemeGrid .mg-theme')].find(n=>n.dataset.themeId===chosen.themeId)?.querySelector('.mg-theme-photo'),copy=document.querySelector(selector),label=document.getElementById('mgLessonTheme');const rect=n=>{const b=n.getBoundingClientRect();return{left:b.left,right:b.right,top:b.top,bottom:b.bottom,width:b.width,height:b.height};};const info=n=>n?{photoId:n.dataset.themePhoto,src:n.querySelector('img')?.getAttribute('src')||null,crop:cropKeys.map(k=>n.style.getPropertyValue(k)),style:n.getAttribute('style')}:null;return{themeId:chosen.themeId,source:info(source),clone:info(copy),count:document.querySelectorAll(selector).length,photo:copy?rect(copy):null,number:{text:label.textContent,aria:label.getAttribute('aria-label'),title:label.title,rect:rect(label)},phase:rect(document.getElementById('mgPhaseIcon')),help:rect(document.getElementById('mgHelp')),decorative:copy?.getAttribute('aria-hidden')==='true'&&copy.querySelector('img')?.alt==='',isPreviousSibling:copy===label.previousElementSibling,parentClass:label.parentElement.className};},{selector:PHOTO,cropKeys});
 assert.equal(data.count,1,'one selected theme photo');assert.deepEqual(data.clone,data.source,'exact selected tile source and four crop variables');assert.ok(data.clone.crop.every(v=>v!==''),'crop variables actually measured');assert.ok(data.decorative,'photo decorative');assert.ok(data.isPreviousSibling,'photo is immediately beside original number');assert.equal(data.photo.width,48);assert.equal(data.photo.height,36);assert.match(data.number.text,/^\d+$/,'only existing number is repeated');assert.ok(data.photo.right<data.number.rect.left,'photo left of number');assert.ok(data.number.rect.right+5<=data.phase.left,'number stays clear of phase');assert.ok(data.phase.right+5<=data.help.left,'phase stays clear of Help');await decodedPhotos(p,PHOTO+' img');return data;
}
async function assertTouchTargets(p){for(const id of ['#mgEar','#mgListen','#mgHelp','#mgReplay','#mgContinue']){assert.equal(await p.locator(id).isVisible(),true,'visible '+id);const b=await fits(p,id);assert.ok(b.width>=44&&b.height>=44,'touch target44 '+id);}}
async function sourceConservation(){const allowed=new Set(['course-desktop.css','course-desktop.js','parcours-niveaux.html','maquette-guidee.html']);let count=0;for(const file of productFiles())if(!allowed.has(file)){assert.ok(raw(file).equals(old(file)),'protected complete product file unchanged '+file);count++;}report.cases.push({name:'source-conservation',files:count,exceptions:[...allowed]});}
async function mobileMatrix(){for(const config of [{width:320,height:620,pair:'fr-es',level:1,tight:true},{width:320,height:568,pair:'fr-es',level:1,tight:true},{width:390,height:780,pair:'fr-es',level:1,tight:true},{width:430,height:780,pair:'fr-es',level:1,tight:true},{width:390,height:700,pair:'fr-zh',level:1,pinyin:true},{width:390,height:700,pair:'fr-es',level:8,long:true}]){
 let before;for(const baseline of [true,false]){const f=await fixture({...config,baseline});try{const p=f.page;await enterApproved(p,config);if(config.pinyin)await p.locator('#mgReadingToggle').click();await modelSource(p);await wholeCard(p);const snap=await mobileSnapshot(p),label=await p.locator('#mgLessonTheme').evaluate(n=>({text:n.textContent,aria:n.getAttribute('aria-label'),title:n.title})),oldState=await state(p);let photo=null;if(!baseline){sameMobile(before.snap,snap);assert.deepEqual(label,before.label,'original number and accessible label preserved');photo=await currentPhoto(p);await assertTouchTargets(p);if(config.width===390&&config.height===780)await shot(p,'mobile-option-1-integrated');if(config.pinyin)await shot(p,'mobile-pinyin-integrated');if(config.long)await shot(p,'mobile-long-theme-integrated');}
 await p.locator('#mgContinue').click();await settled(p);const next=await state(p),transition={beforePhrase:oldState.phraseId,beforeStep:oldState.stepIndex,afterPhrase:next.phraseId,afterStep:next.stepIndex,masked:next.masked};if(baseline)before={snap,label,transition};else{assert.deepEqual(transition,before.transition,'original mobile next-step behavior preserved');report.cases.push({name:'mobile-baseline',config,label,photo,snapshot:snap,transition});}
 }finally{await f.close();}}
}}
async function updates(){const f=await fixture({width:390,height:780,pair:'fr-es'});try{const p=f.page;await enter(p);const first=await currentPhoto(p);await p.locator('#mgBack').click();await ready(p,'fr-es');assert.equal(await p.locator(PHOTO).count(),0,'no lesson thumbnail on theme grid');await p.locator('#mgThemeGrid .mg-theme').nth(1).click();await p.waitForFunction(()=>window.MelungaMockup.state().screen==='lesson');const second=await currentPhoto(p);assert.equal(first.clone.src,second.clone.src,'two theme photos share atlas');assert.notDeepEqual(first.clone.crop,second.clone.crop,'different theme selects correct atlas crop');assert.notEqual(first.themeId,second.themeId);
 await dialog(p,'#mgLevelTrigger','#mgLevelDialog');await p.locator('#mgLevelChoices [data-level="2"]').click();await ready(p,'fr-es',2);assert.equal(await p.locator(PHOTO).count(),0);await enter(p);const level2=await currentPhoto(p);
 await dialog(p,'#mgLanguageTrigger','#mgLanguageDialog');await p.locator('#mgLanguageChoices [data-pair="fr-zh"]').click();await ready(p,'fr-zh',2);assert.equal(await p.locator(PHOTO).count(),0);await enter(p);const language=await currentPhoto(p);await modelSource(p);report.cases.push({name:'theme-level-language-updates',first,second,level2,language});
 }finally{await f.close();}}
async function desktopSnapshot(p){await settled(p);return p.evaluate(()=>{const rect=n=>{const b=n.getBoundingClientRect();return{left:b.left,right:b.right,top:b.top,bottom:b.bottom,width:b.width,height:b.height};};const selectors=['.mg-app','.mg-main','.mg-desktop-header','.mg-desktop-heading','.mg-desktop-theme-photo','#mgLessonView','#mgLessonTheme','#mgPhaseIcon','#mgHelp','#mgPhrase','#mgPhonrow','#mgPhon','#mgTranslation','#mgEar','#mgListen','#mgReplay','#mgContinue','.mg-desktop-legal'];return Object.fromEntries(selectors.map(selector=>{const n=document.querySelector(selector),s=getComputedStyle(n);return[selector,{rect:rect(n),text:n.textContent,font:s.fontSize,foreground:s.color,background:s.backgroundColor,hidden:n.hidden,display:s.display}];}));});}
async function desktopAndResize(){for(const size of [{width:1366,height:768},{width:1920,height:1080}]){let original;for(const baseline of [true,false]){const f=await fixture({...size,pair:'fr-es',baseline});try{const p=f.page;await enter(p);await decodedPhotos(p,'.mg-desktop-theme-photo img');await modelSource(p);await wholeCard(p);const snap=await desktopSnapshot(p);if(baseline)original=snap;else{assert.deepEqual(snap,original,'complete existing desktop layout/styles same49b baseline');assert.equal(await p.locator(PHOTO).count(),0,'no mobile photo on desktop');report.cases.push({name:'desktop-baseline',size,snapshot:snap});}}finally{await f.close();}}}
 const f=await fixture({width:390,height:780,pair:'fr-es'});try{const p=f.page;await enter(p);const original=await state(p),mobile=await currentPhoto(p);for(const size of [{width:1366,height:768},{width:390,height:780},{width:1920,height:1080},{width:320,height:700}]){await p.setViewportSize(size);await settled(p);assert.deepEqual(await state(p),original,'resize keeps actual current step');if(size.width>1100){assert.equal(await p.locator(PHOTO).count(),0);assert.equal(await p.locator('.mg-desktop-theme-photo').count(),1);assert.equal(await p.locator('.mg-desktop-header').count(),1);}else{const photo=await currentPhoto(p);assert.deepEqual(photo.clone,mobile.clone,'same selected source after resize');assert.equal(await p.locator('.mg-desktop-header').count(),0);}for(const id of ['mgLessonTheme','mgEar','mgListen','mgContinue','mgHelp','mgLevelTrigger','mgLanguageTrigger','mgMenuTrigger'])assert.equal(await p.locator('#'+id).count(),1,'single original control '+id);await wholeCard(p);}await shot(p,'responsive-return-mobile');report.cases.push({name:'resize-restoration',theme:mobile.themeId});}finally{await f.close();}
}
async function fallbackAndMasked(){const f=await fixture({width:390,height:700,pair:'fr-es'});try{const p=f.page;await enter(p);await currentPhoto(p);await p.evaluate(()=>{const image=document.querySelector('.mg-mobile-theme-photo img');image.dispatchEvent(new Event('error'));});assert.equal(await p.locator(PHOTO+' img').count(),0,'broken image removed');assert.equal(await p.locator(PHOTO+' svg').isVisible(),true,'existing SVG fallback visible after imageerror');await p.evaluate(()=>{const s=window.MelungaMockup.state();[...document.querySelectorAll('#mgThemeGrid .mg-theme')].find(n=>n.dataset.themeId===s.themeId).querySelector('.mg-theme-photo').remove();window.MelungaDesktopCourse.refresh();});await settled(p);assert.equal(await p.locator(PHOTO).count(),0,'missing source removes thumbnail entirely');assert.equal(await p.locator('.mg-has-theme-photo').count(),0,'missing source leaves no styled empty slot');await wholeCard(p);report.cases.push({name:'image-and-no-source-fallback',explicitPresentationFixture:true});}finally{await f.close();}
 const g=await fixture({width:390,height:700,pair:'fr-zh'});try{const p=g.page;await enter(p);for(let i=0;i<20&&!(await state(p)).masked;i++)await p.locator('#mgContinue').click();assert.equal((await state(p)).masked,true,'real recall reached through real mobile steps');assert.equal(await p.locator('#mgPhon').isVisible(),false);await currentPhoto(p);await p.setViewportSize({width:1366,height:768});await settled(p);assert.equal(await p.locator('#mgPhon').isVisible(),false,'resize does not reveal masked phonetic');assert.equal(await p.locator('.mg-desktop-phonetic-label').isVisible(),false);assert.equal(await p.locator(PHOTO).count(),0);await p.setViewportSize({width:390,height:700});await settled(p);assert.equal(await p.locator('#mgPhon').isVisible(),false);await currentPhoto(p);await shot(p,'recall-mask-mobile');await p.locator('.mg-brand').click();await ready(p,'fr-zh');await enter(p);await p.evaluate(()=>{for(const id of ['mgPhrase','mgPhon','mgPhonrow','mgEar'])document.getElementById(id).hidden=true;document.getElementById('mgReadingToggle').disabled=true;window.MelungaDesktopCourse.refresh();});await settled(p);for(const id of ['mgPhrase','mgPhon','mgPhonrow','mgEar'])assert.equal(await p.locator('#'+id).isVisible(),false,'waiting choice keeps original hidden flags '+id);report.cases.push({name:'masked-and-waiting',realRecall:true,waitingSourceStepUsed:false,waitingPresentationFlags:true});}finally{await g.close();}}
// Focused acceptance groups are appended below after the final selectors are confirmed.
const DOCK='.mg-mobile-dock',SETTINGS='.mg-dock-settings',ACTIONS='.mg-dock-actions';
const CONTROL_IDS=['mgLevelTrigger','mgLanguageTrigger','mgPalette','mgMenuTrigger','mgReplay','mgContinue'];
const AMBIENCES=['dusk','ocean','aurora','legacy-gamified','legacy-zen','legacy-premium','legacy-sunset','legacy-neon','legacy-ocean','legacy-forest','legacy-spotify','legacy-plum','legacy-lantern','legacy-aurora','legacy-cafe','legacy-insta','legacy-bordeaux'];
const expectedNative={fr:{next:/^Suivant$/,level:/^Niveau$/,language:/^Langue$/,colour:/^Couleur$/,menu:/^Menu$/},en:{next:/^Next$/,level:/^Level$/,language:/^Language$/,colour:/^Colou?r$/,menu:/^Menu$/},es:{next:/^Siguiente$/,level:/^Nivel$/,language:/^Idioma$/,colour:/^Color$/,menu:/^Menú$/},it:{next:/^Avanti$/,level:/^Livello$/,language:/^Lingua$/,colour:/^Colore$/,menu:/^Menu$/},zh:{next:/^下一步$/,level:/^(等级|级别|水平)$/,language:/^语言$/,colour:/^(颜色|色彩|背景颜色)$/,menu:/^菜单$/},ja:{next:/^次へ$/,level:/^レベル$/,language:/^言語$/,colour:/^(色|カラー|背景色)$/,menu:/^メニュー$/},ko:{next:/^다음$/,level:/^레벨$/,language:/^언어$/,colour:/^(색상|배경 색상)$/,menu:/^메뉴$/}};
async function settleDock(p){await p.waitForFunction(()=>document.querySelector('.mg-mobile-dock'));await settled(p);await p.waitForTimeout(60);await settled(p);}
async function dockGeometry(p){return p.evaluate(()=>{const r=n=>{const b=n.getBoundingClientRect();return{left:b.left,right:b.right,top:b.top,bottom:b.bottom,width:b.width,height:b.height};},visible=n=>!!n?.getClientRects().length&&getComputedStyle(n).visibility!=='hidden',bar=document.querySelector('.mg-mobile-dock'),row=document.querySelector('.mg-dock-actions');const selectors=['#mgLevelTrigger','#mgLanguageTrigger','.mg-dock-shortcut[data-menu-item="review"]','.mg-dock-shortcut[data-menu-item="voice"]','#mgPalette','#mgMenuTrigger','#mgReplay','#mgContinue','#mgListen'];return{viewport:{width:innerWidth,height:innerHeight},document:{width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight},view:document.body.dataset.view,dock:r(bar),app:r(document.querySelector('.mg-app')),card:visible(document.getElementById('mgLessonView'))?r(document.getElementById('mgLessonView')):null,context:r(document.querySelector('.mg-mobile-context')),inert:bar.inert,actionsVisible:visible(document.getElementById('mgReplay'))&&visible(document.getElementById('mgContinue')),listenVisible:visible(document.getElementById('mgListen')),hasListen:bar.classList.contains('mg-dock-has-listen'),settings:r(document.querySelector('.mg-dock-settings')),actions:row?r(row):null,buttons:selectors.map(selector=>{const n=document.querySelector(selector);if(!n)return null;const cap=[...n.querySelectorAll('.mg-dock-label,.mg-dock-shortcut-label,.mg-dock-next-label,#mgReplayText,#mgContinueText,.mg-dock-listen-label')].find(visible);let ink=null;if(cap){const range=document.createRange();range.selectNodeContents(cap);ink=r(range);}return{id:n.id||n.dataset.menuItem,selector,scope:n.closest('.mg-mobile-context')?'context':'dock',visible:visible(n),disabled:n.disabled,parent:n.parentElement.className,text:visible(n)?n.innerText.trim():'',bounds:r(n),caption:cap?{text:cap.textContent.trim(),bounds:ink}:null};}).filter(Boolean)};});}
function validateDockGeometry(g,{actions=true,occupiedBottom=0}={}){assert.ok(g.document.width<=g.viewport.width+1&&g.document.height<=g.viewport.height+1,'one viewport without overflow '+JSON.stringify(g.document));assert.equal(g.actionsVisible,actions);assert.ok(g.dock.left>=0&&g.dock.right<=g.viewport.width+1&&g.dock.bottom<=g.viewport.height-occupiedBottom+1,'dock unobstructed');assert.ok(g.app.bottom+3<=g.dock.top&&g.dock.top-g.app.bottom<=24,'dock reserve once');if(g.card)assert.ok(g.card.bottom+3<=g.dock.top);const visible=g.buttons.filter(b=>b.visible),bar=visible.filter(b=>b.scope==='dock');assert.equal(visible.filter(b=>b.scope==='context').length,2);if(g.view==='loading')assert.ok(bar.length>=2&&bar.length<=4,'only currently built source shortcuts while loading');else assert.equal(bar.length,(actions?6:4)+(g.listenVisible?1:0));for(const b of visible){assert.ok(b.bounds.width>=44&&b.bounds.height>=44,'touch44 '+b.id);const outer=b.scope==='context'?g.context:g.dock;assert.ok(b.bounds.left>=outer.left-.5&&b.bounds.right<=outer.right+.5&&b.bounds.top>=outer.top-.5&&b.bounds.bottom<=outer.bottom+.5,'control contained '+b.id);if(b.caption)assert.ok(b.caption.bounds.left>=b.bounds.left-.5&&b.caption.bounds.right<=b.bounds.right+.5&&b.caption.bounds.top>=b.bounds.top-.5&&b.caption.bounds.bottom<=b.bounds.bottom+.5,'caption ink fits '+b.id);}assert.ok(g.context.left>=0&&g.context.right<=g.viewport.width&&g.context.top>=0&&g.context.bottom<=g.viewport.height);for(let i=0;i<visible.length;i++)for(let j=i+1;j<visible.length;j++){const a=visible[i].bounds,b=visible[j].bounds;assert.ok(a.right<=b.left+.5||b.right<=a.left+.5||a.bottom<=b.top+.5||b.bottom<=a.top+.5,'targets separate '+visible[i].id+'/'+visible[j].id);}assert.equal(g.hasListen,g.listenVisible&&g.view==='lesson','row follows actual source listening availability');}
async function assertSettingsIconsOnly(p){for(const id of ['mgLevelTrigger','mgLanguageTrigger','mgPalette','mgMenuTrigger']){const button=p.locator('#'+id),label=button.locator('.mg-dock-label');assert.equal(await label.count(),1);assert.equal(await label.isVisible(),false);assert.ok(await button.getAttribute('aria-label'));}const shortcuts=p.locator('.mg-dock-settings>.mg-dock-shortcut');assert.equal(await shortcuts.count(),2);for(const panel of ['review','voice']){const button=p.locator('.mg-dock-settings>.mg-dock-shortcut[data-menu-item="'+panel+'"]');assert.equal(await button.count(),1);assert.equal(await button.locator('.mg-dock-shortcut-label').isVisible(),false);assert.ok(await button.getAttribute('aria-label'));assert.equal(await p.locator('#mgDesktopNav [data-menu-item="'+panel+'"]').count(),0,'actual original rail item moved');}assert.equal(await p.locator('.mg-dock-settings>button').count(),4);}
async function singleControls(p){assert.equal(await p.evaluate(()=>Object.entries(window.__qaOriginalNodes).every(([id,n])=>n===document.getElementById(id))),true,'original actual control nodes retained');for(const id of CONTROL_IDS.concat(['mgContinueText','mgReplayText','mgListen','mgEar']))assert.equal(await p.locator('#'+id).count(),1,'one original '+id);}
async function fieldIdentity(p){return p.evaluate(()=>Object.fromEntries(['mgPhrase','mgPhon','mgTranslation','mgLessonTheme'].map(id=>{const n=document.getElementById(id);return[id,{text:n.textContent,aria:n.getAttribute('aria-label'),title:n.title}];})));}

async function enterApproved(p,config={}){
 if(!config.tight)return enter(p,config);
 for(let i=0;i<17&&await p.locator('body').getAttribute('data-ambience')!=='legacy-plum';i++){await p.locator('#mgPalette').click();await settled(p);}
 assert.equal(await p.locator('body').getAttribute('data-ambience'),'legacy-plum');
 await p.locator('#mgThemeGrid .mg-theme[data-theme-id="decrire"]').click();
 await p.waitForFunction(()=>window.MelungaMockup.state().screen==='lesson');await settled(p);await p.waitForTimeout(80);
 assert.equal((await state(p)).phraseId,'catalogue:es:302','actual first phrase of approved theme08');
}

const FDIR=__dirname;
const result={status:'running',physicalDeviceTested:false,safariTested:false,realAudioPlayed:false,caseCount:0,cases:[],contrast:[],desktop:[]};
const chan=n=>{const x=n/255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;};
const lum=a=>.2126*chan(a[0])+.7152*chan(a[1])+.0722*chan(a[2]);
const contrast=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
const rgb=s=>s.match(/[\d.]+/g).slice(0,3).map(Number);
async function view(p){await p.waitForFunction(()=>!document.documentElement.classList.contains('course-presentation-pending'));await settled(p);}
async function metrics(p){return p.evaluate(()=>{
 const box=n=>{const r=n.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom};};
 const cs=n=>{const s=getComputedStyle(n);return{background:s.backgroundColor,color:s.color,radius:s.borderTopLeftRadius,blur:s.backdropFilter};};
 const buttons=[...document.querySelectorAll('.mg-mobile-context>button,.mg-dock-settings>button,.mg-dock-actions>button,.mg-dock-listen,#mgBack,#mgHelp,#mgEar,#mgReadingToggle')].filter(n=>n.getClientRects().length&&getComputedStyle(n).display!=='none').map(n=>({id:n.id,panel:n.dataset.menuItem,label:n.getAttribute('aria-label')||n.title||n.textContent.trim(),...box(n),...cs(n)}));
 return{width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,buttons,dock:box(document.querySelector('.mg-mobile-dock')),app:box(document.querySelector('.mg-app')),level:cs(document.querySelector('#mgLevelTrigger .mg-dock-icon')),flag:document.querySelector('#mgLanguageFlag').outerHTML,wheel:document.querySelector('.mg-colorwheel').outerHTML};
});}
function validate(m){
 assert.ok(m.scrollWidth<=m.width+1,'page width '+JSON.stringify(m));
 for(const b of m.buttons){assert.ok(b.w>=44&&b.h>=44,'target44 '+JSON.stringify(b));assert.ok(Math.abs(b.w-b.h)<.6,'round '+JSON.stringify(b));assert.equal(b.radius,'50%');assert.ok(b.x>=-.5&&b.right<=m.width+.5&&b.y>=0&&b.bottom<=m.height+.5,'onscreen '+JSON.stringify(b));assert.ok(b.label,'accessible label');if(!['mgReplay','mgContinue'].includes(b.id)){assert.equal(b.background,'rgba(255, 255, 255, 0.46)');assert.equal(b.blur,'blur(25px)');}}
 for(let i=0;i<m.buttons.length;i++)for(let j=i+1;j<m.buttons.length;j++){const a=m.buttons[i],b=m.buttons[j];assert.ok(Math.min(a.right,b.right)-Math.max(a.x,b.x)<1||Math.min(a.bottom,b.bottom)-Math.max(a.y,b.y)<1,'no overlap '+a.id+'/'+b.id);}
 assert.ok(m.app.bottom+3<=m.dock.y,'content clear of dock');
}
async function captureF(p,name){await p.locator('.mg-theme-photo img').evaluateAll(images=>Promise.all(images.filter(img=>{const r=img.getBoundingClientRect();return r.y<innerHeight&&r.bottom>0&&getComputedStyle(img).visibility!=='hidden';}).map(img=>img.decode())));await settled(p);await p.screenshot({path:path.join(FDIR,name+'.png'),animations:'disabled'});}
async function addCase(name,fn){await fn();result.cases.push(name);result.caseCount++;console.log('PASS '+name);}
(async()=>{
 fs.mkdirSync(FDIR,{recursive:true});const before=fingerprint();browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 for(const [width,height] of [[280,620],[320,568],[320,620],[390,740],[430,900],[760,620]])await addCase('round controls '+width+'x'+height,async()=>{
  const f=await fixture({width,height,pair:'fr-es',paid:false});try{const p=f.page;await view(p);validate(await metrics(p));if(width===320&&height===620)await captureF(p,'themes-verre-givre');
   await dialog(p,'#mgLevelTrigger','#mgLevelDialog');await dismiss(p,'#mgLevelDialog');await dialog(p,'#mgLanguageTrigger','#mgLanguageDialog');await dismiss(p,'#mgLanguageDialog');
   await enter(p);await settled(p);const m=await metrics(p);validate(m);assert.equal(m.buttons.find(b=>b.id==='mgReplay').background,'rgb(232, 243, 241)');assert.equal(m.buttons.find(b=>b.id==='mgContinue').background,'rgb(20, 125, 120)');
   assert.equal(await p.locator('#mgContinue').getAttribute('aria-label'),null);assert.match(await p.locator('#mgContinue').ariaSnapshot(),/button ".+"/,'native accessible Next caption');assert.match(await p.locator('#mgBack').ariaSnapshot(),/button ".+"/);assert.match(await p.locator('#mgReplay').ariaSnapshot(),/button ".+"/);
   if(width===320&&height===620)await captureF(p,'lecon-verre-givre');await singleControls(p);
   const prev=await p.evaluate(()=>window.__desktopLayoutMedia.plays.length);await p.locator('#mgListen').click();await p.waitForFunction(n=>window.__desktopLayoutMedia.plays.length===n+1,prev);
   const s=await state(p);await p.locator('#mgContinue').click();await p.waitForFunction(index=>window.MelungaMockup.state().stepIndex!==index,s.stepIndex);
  }finally{await f.close();}
 });
 await addCase('17 ambiences and current semantic colours',async()=>{
  const f=await fixture({width:390,height:740,pair:'fr-es',paid:false});try{const p=f.page;await view(p);const seen=new Set();
   for(let i=0;i<17;i++){await settled(p);const ambiance=await p.locator('body').getAttribute('data-ambience');assert.ok(!seen.has(ambiance));seen.add(ambiance);const m=await metrics(p);validate(m);
    const png=PNG.sync.read(await p.screenshot());for(const b of m.buttons){if(['mgPalette','mgLanguageTrigger','mgLevelTrigger'].includes(b.id))continue;const x=Math.round(b.x+5),y=Math.round(b.y+b.h/2),off=(y*png.width+x)*4,bg=[...png.data.slice(off,off+3)],ratio=contrast(rgb(b.color),bg);assert.ok(ratio>=3,'contrast '+JSON.stringify({ambiance,button:b,bg,ratio}));result.contrast.push({ambiance,id:b.id,ratio});}
    assert.equal(m.level.color,'rgb(255, 255, 255)');assert.notEqual(m.level.background,'rgba(0, 0, 0, 0)');await p.locator('#mgPalette').click();
   }assert.equal(seen.size,17);
  }finally{await f.close();}
 });
 await addCase('original panels, pinyin, review and hidden states',async()=>{
  const f=await fixture({width:390,height:740,pair:'fr-zh'});try{const p=f.page;await view(p);await enter(p);for(const panel of ['review','voice']){await p.locator('.mg-dock-settings>[data-menu-item="'+panel+'"]').click();await p.locator('#mgMenuDialog').waitFor({state:'visible'});await p.locator(panel==='review'?'#mgReviewPanel':'#mgVoicePanel').waitFor({state:'visible'});await dismiss(p,'#mgMenuDialog');}
   await p.locator('#mgReadingToggle').click();assert.equal(await p.locator('#mgReadingToggle').getAttribute('aria-pressed'),'true');await settled(p);validate(await metrics(p));assert.match(await p.locator('#mgReadingToggle').ariaSnapshot(),/button ".+"/);
   await p.locator('#mgReplay').click();await settled(p);assert.ok((await state(p)).stepIndex>0);for(const id of ['mgEar','mgListen','mgReadingToggle']){const n=p.locator('#'+id);if(await n.getAttribute('hidden')!==null)assert.equal(await n.isVisible(),false);}
  }finally{await f.close();}
 });
 for(const [width,height] of [[1366,768],[1920,1080]])await addCase('desktop unchanged '+width,async()=>{
  const snaps=[];for(const baseline of [true,false]){const f=await fixture({width,height,pair:'fr-es',paid:false,baseline});try{const p=f.page;await view(p);await enter(p);await p.locator('.mg-desktop-theme-photo img').evaluateAll(ns=>Promise.all(ns.map(n=>n.decode())));await settled(p);const image=await p.screenshot({animations:'disabled'});snaps.push(hash(image));assert.equal(await p.locator('.mg-mobile-dock').count(),0);result.desktop.push({width,baseline,sha256:hash(image)});}finally{await f.close();}}
  assert.equal(snaps[0],snaps[1],'exact unchanged desktop image');
 });
 await addCase('mobile desktop mobile restoration',async()=>{
  const f=await fixture({width:390,height:740,pair:'fr-es',paid:false});try{const p=f.page;await view(p);await enter(p);await p.setViewportSize({width:1366,height:768});await p.waitForFunction(()=>document.body.classList.contains('mg-desktop-course'));await settled(p);assert.equal(await p.locator('.mg-mobile-dock').count(),0);await p.setViewportSize({width:320,height:620});await p.waitForFunction(()=>document.body.classList.contains('mg-mobile-dock-course'));await settled(p);validate(await metrics(p));await singleControls(p);}finally{await f.close();}
 });
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.unexpected,[]);assert.deepEqual(report.fixtureErrors,[]);assert.deepEqual(fingerprint(),before,'final source stable');result.sourceFingerprints=before;result.status='passed';await browser.close();fs.writeFileSync(path.join(FDIR,'browser-report.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({status:result.status,cases:result.caseCount,contrastPoints:result.contrast.length}));
})().catch(async e=>{console.error(e);await browser?.close();process.exitCode=1;});
