/* Playback capsule acceptance. Media and all HTTP responses are local fixtures; no actual sound/provider. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {execFileSync}=require('node:child_process'),{test,before,after}=require('node:test'),{chromium}=require('playwright-core');
const ROOT=path.resolve(__dirname,'../..'),WEB=path.join(ROOT,'melunga_deploy'),BASE='77fe0f5',ORIGIN='https://capsule-audio.test';
const OUT=process.env.CAPSULE_BROWSER_DIR||'/workspace/work/capsule-audio-2026-10-31/browser';
const ORIGINAL=['fr','en','es','it','zh','ja','ko'],CODES=[...ORIGINAL,'de'];
const raw=file=>fs.readFileSync(path.join(WEB,file)),json=file=>JSON.parse(raw(file)),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const historical=new Map();function old(file){if(!historical.has(file))historical.set(file,execFileSync('git',['show',BASE+':melunga_deploy/'+file],{cwd:ROOT,maxBuffer:50*1024*1024}));return historical.get(file);}
const nativeManifest=json('content/native-catalogue/manifest.json'),meanings=json(nativeManifest.germanNativeMeanings.path),dictionary=json('content/course-locales/de.json');
const banks=Object.fromEntries(nativeManifest.studyLanguageIds.map(code=>[code,json('content/native-catalogue/'+code+'.json')]));
const nativeLocaleCodes=['ru','pt','ar','hi'];
const nativeInput=JSON.parse(fs.readFileSync(path.join(ROOT,'tools/maquette-guidee/imports/native-meanings-ru-pt-ar-hi-v1.json')));
const nativeCopy=JSON.parse(fs.readFileSync(path.join(ROOT,'tools/maquette-guidee/imports/native-interface-copy-v1.json'))).locales;
const report={status:'running',baseCommit:BASE,allResponsesLocal:true,actualProviderCalled:false,physicalDeviceTested:false,touchEmulated:true,actualAudioPlayed:false,cases:[],errors:[],unexpected:[],screenshots:[]};
let browser,initial;
function fingerprint(){const reviewed=json('content/niveaux-progressifs/manifest.json');const files=[...fs.readdirSync(WEB).filter(f=>/\.(html|js|css)$/.test(f)),'content/native-catalogue/manifest.json',nativeManifest.themePlacementEdition.path,nativeManifest.germanNativeMeanings.path,...nativeLocaleCodes.map(code=>nativeManifest.nativeLocaleMeanings[code].path),'content/course-access.json','content/niveaux-progressifs/manifest.json',...CODES.map(c=>'content/native-catalogue/'+c+'.json'),...CODES.filter(c=>c!=='fr').map(c=>'content/course-locales/'+c+'.json'),'content/course-locales/supplements.json',...reviewed.pairs.flatMap(p=>[p.repertoirePath,...p.levels.map(l=>l.dataPath)])];return Object.fromEntries(files.sort().map(file=>[file,hash(raw(file))]));}
function catalogue(){const now=Date.now(),voiceCodes={fr:'fr-FR',en:'en-US',es:'es-ES',it:'it-IT',zh:'cmn-CN',ja:'ja-JP',ko:'ko-KR',de:'de-DE'};return{version:1,source:'google-voices-list',previewOnly:true,selectionVersion:'kartech-2026-10-30-en-us',verifiedAt:new Date(now-1000).toISOString(),expiresAt:new Date(now+240000).toISOString(),languages:Object.fromEntries(CODES.map(language=>{const languageCode=voiceCodes[language],chirp=[['Aoede','FEMALE'],['Kore','FEMALE'],['Charon','MALE']].map(([name,gender])=>({name:languageCode+'-Chirp3-HD-'+name,languageCode,gender,engine:'chirp3',rateMode:'client'})),approved=language==='fr'?'Aoede':language==='it'?'Charon':'Kore';return[language,{language,available:true,chirp,defaultVoice:chirp.find(v=>v.name.endsWith('-'+approved)),waveNet:{name:languageCode+'-Wavenet-A',languageCode,gender:'FEMALE',engine:'wavenet',rateMode:'server'}}];}))};}
before(async()=>{fs.mkdirSync(OUT,{recursive:true});initial=fingerprint();browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});});
after(async()=>{await browser?.close();report.inputsStable=JSON.stringify(initial)===JSON.stringify(fingerprint());report.status=!report.errors.length&&!report.unexpected.length&&report.inputsStable?'passed':'failed';report.inputSha256=initial;fs.writeFileSync(path.join(OUT,'acceptance.json'),JSON.stringify(report,null,2)+'\n');assert.equal(report.inputsStable,true,'accepted sources remain frozen');assert.deepEqual(report.errors,[]);assert.deepEqual(report.unexpected,[]);});
async function checked(name,fn){try{await fn();report.cases.push(name);}catch(error){report.errors.push(name+': '+error.message);throw error;}}
async function fixture({width=1366,height=900,paid=true,baseline=false,pair='fr-ru',level=1}={}){
 const context=await browser.newContext({viewport:{width,height},isMobile:width<960,hasTouch:width<960,reducedMotion:'reduce',serviceWorkers:'block'}),f={context,paid,baseline,posts:[]};
 await context.addInitScript(({pair,level})=>{if(!sessionStorage.getItem('__germanAcceptanceSeed')){localStorage.setItem('ox_device','german-native-browser-fixture');localStorage.setItem('ox_paid','1');localStorage.setItem('melunga-app-language',JSON.stringify({locale:pair.split('-')[0]}));localStorage.setItem('melunga-course-pair',pair);localStorage.setItem('melunga-course-level',String(level));sessionStorage.setItem('__germanAcceptanceSeed','1');}window.__capsuleMedia={plays:[],speech:[],recognition:[],instances:[],utterances:[]};window.SpeechRecognition=class{start(){window.__capsuleMedia.recognition.push(this.lang);this.onstart?.();}stop(){this.onend?.();}abort(){this.onend?.();}};window.Audio=class extends EventTarget{constructor(src){super();this.src=src||'';this.paused=true;this.currentTime=0;this.playbackRate=1;window.__capsuleMedia.instances.push(this);}play(){this.paused=false;window.__capsuleMedia.plays.push({src:this.src,rate:this.playbackRate});queueMicrotask(()=>{if(!this.paused){this.onplaying?.(new Event('playing'));this.dispatchEvent(new Event('playing'));}});return Promise.resolve();}pause(){this.paused=true;}load(){}removeAttribute(n){if(n==='src')this.src='';}};window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},getVoices(){return[{name:'Local German fixture',lang:'de-DE'}];},addEventListener(){},removeEventListener(){},speak(u){window.__capsuleMedia.utterances.push(u);u.onstart?.();window.__capsuleMedia.speech.push({text:u.text,lang:u.lang});}}});},{pair,level});
 await context.route('**/*',async route=>{const req=route.request(),u=new URL(req.url());try{
  if(u.origin!==ORIGIN){if(!/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname))report.unexpected.push({external:u.origin+u.pathname});return route.abort();}
  if(u.pathname==='/.netlify/functions/check-status'){assert.equal(req.method(),'GET');return route.fulfill({json:{paid:f.paid}});}
  if(u.pathname==='/.netlify/functions/get-pricing')return route.fulfill({json:{country:'DE',monthlyDisplay:'7,90 €',annualDisplay:'42 €'}});
  if(u.pathname==='/api/geolocation')return route.fulfill({json:{country:'DE'}});
  if(u.pathname==='/.netlify/functions/tts'&&u.searchParams.get('catalog')==='chirp3')return route.fulfill({json:catalogue()});
  if(req.method()!=='GET'){f.posts.push({path:u.pathname,body:req.postDataJSON()});throw Error('No account, feedback or payment submission is authorized by this fixture');}
  if(/^\/(?:\.netlify|api)\//.test(u.pathname)){report.unexpected.push({path:u.pathname});return route.abort();}
  if(u.pathname==='/mobile-runtime.js')return route.fulfill({contentType:'text/javascript',body:'/* ordinary web fixture */'});
  const relative=decodeURIComponent(u.pathname==='/'?'/index.html':u.pathname).slice(1),file=path.resolve(WEB,relative);
  if(!file.startsWith(WEB+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){report.unexpected.push({missing:u.pathname});return route.fulfill({status:404,body:'Not found'});}
  const body=baseline&&(/^[^/]+\.(?:html|css|js)$/.test(relative)||relative==='content/native-catalogue/manifest.json')?old(relative):raw(relative);
  return route.fulfill({body,contentType:{'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2'}[path.extname(file)]||'application/octet-stream'});
 }catch(error){report.errors.push('fixture: '+error.message);await route.abort().catch(()=>{});}});
 if(process.env.GERMAN_NATIVE_DEBUG)await context.addInitScript(()=>{window.__MELUNGA_DEBUG=true;});
 const p=f.page=await context.newPage();p.setDefaultTimeout(12000);p.setDefaultNavigationTimeout(15000);p.on('dialog',async dialog=>{report.unexpected.push({dialog:dialog.type(),message:dialog.message()});await dialog.dismiss();});p.on('pageerror',error=>report.errors.push(error.message));f.close=async()=>{if(process.env.GERMAN_NATIVE_DEBUG)console.log('native debug',JSON.stringify(await p.evaluate(async()=>{const s=window.MelungaMockup?.state();let load;try{const r=await window.MelungaNativeCourses?.loadPair('ru-en',1);load={themes:r.pair.themes.length};}catch(e){load={error:e.message};}return{diagnostic:window.__courseDiagnostic,pairId:s?.pairId,screen:s?.screen,level:s?.level,lang:document.documentElement.lang,loading:document.getElementById('mgLoadingText')?.textContent,status:document.getElementById('mgStatus')?.textContent,load,rights:window.MelungaCourseAccess?.state?.()};})));await context.close();};return f;
}
const state=p=>p.evaluate(()=>window.MelungaMockup.state());
async function settle(p){await p.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));}
async function ready(p,pair,level=1,screen='themes'){if(process.env.GERMAN_NATIVE_DEBUG)console.log('ready before',pair,level,screen,p.url());await p.waitForFunction(({pair,level,screen})=>{const s=window.MelungaMockup?.state();return s?.pairId===pair&&s.level===level&&s.screen===screen;},{pair,level,screen},{timeout:process.env.GERMAN_NATIVE_DEBUG?5000:30000});await p.waitForFunction(()=>window.MelungaVoiceSelection?.state().status==='ready');await p.waitForFunction(()=>!document.documentElement.classList.contains('course-presentation-pending'));await settle(p);if(process.env.GERMAN_NATIVE_DEBUG)console.log('ready after',pair,screen,p.url());}
async function goCourse(f,pair='fr-ru',level=1,direct=false){await f.page.goto(ORIGIN+'/parcours-niveaux.html?'+new URLSearchParams({pair,level:String(level),...(direct?{start:'lesson'}:{})}),{waitUntil:'domcontentloaded'});if(!direct)return ready(f.page,pair,level);await f.page.waitForFunction(()=>['lesson','sequences'].includes(window.MelungaMockup?.state().screen),null,{timeout:process.env.GERMAN_NATIVE_DEBUG?5000:30000});if((await state(f.page)).screen==='sequences')await f.page.locator('#mgSequences .mg-sequence:visible').first().click();await ready(f.page,pair,level,'lesson');}
async function tap(p,selector){if(process.env.GERMAN_NATIVE_DEBUG)console.log('tap before',selector,p.url());const n=p.locator(selector).first();await n.scrollIntoViewIfNeeded();if(p.viewportSize().width<960)await n.tap();else await n.click();if(process.env.GERMAN_NATIVE_DEBUG)console.log('tap after',selector,p.url());}
async function fit(p){const g=await p.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));assert(g.scroll<=g.width+1,'no horizontal page overflow '+JSON.stringify(g));for(const selector of ['#mgPhrase','#mgTranslation','#mgPhon']){const item=p.locator(selector);if(await item.isVisible())assert(await item.evaluate(n=>n.scrollWidth<=n.clientWidth+1),selector+' wraps');}}
async function photo(p){const pictures=p.locator('.mg-theme-photo img,.mg-mobile-theme-photo img,.mg-desktop-theme-photo img');assert(await pictures.count()>0,'source theme illustration exists');}
function expected(id){const match=/^catalogue:([a-z]{2}):(\d+)$/.exec(id);assert(match);const[,study,rawIndex]=match,index=Number(rawIndex),source=banks[study].cards[index];return{study,index,source,native:meanings.concepts[meanings.banks[study].conceptIds[index]]};}
async function verify(p,pair){const s=await state(p),study=pair.split('-')[1],index=Number(s.phraseId.split(':').at(-1)),c=banks[study].cards[index];assert.equal(s.pairId,pair);assert.equal(await p.locator('#mgPhrase').textContent(),c.t);assert.equal(await p.locator('#mgTranslation').textContent(),c.frm);assert.equal(await p.locator('#mgPhon').textContent(),c.pf);assert.equal(await p.locator('#mgPhrase').getAttribute('lang'),study);const flag=await p.locator('#mgLanguageFlag').evaluate(n=>({language:n.dataset.language,image:getComputedStyle(n).backgroundImage,color:getComputedStyle(n).backgroundColor,after:getComputedStyle(n,'::after').content}));assert.equal(flag.language,study);if(study==='ar'){assert.equal(flag.color,'rgb(11, 110, 79)');assert.equal(flag.after,'"ع"');assert.equal(await p.locator('#mgPhrase').evaluate(n=>getComputedStyle(n).direction),'rtl');assert.equal(await p.locator('html').getAttribute('dir'),null);assert.equal(await p.locator('#mgTranslation').evaluate(n=>getComputedStyle(n).direction),'ltr');}else assert(flag.image.startsWith('url(')&&flag.image.includes('svg'),'rendered SVG flag');await fit(p);return{source:c,index};}
async function enterTheme(p,id){let tile=p.locator('#mgThemeGrid .mg-theme[data-theme-id="'+id+'"]');for(let i=0;i<30&&!await tile.isVisible();i++){await tap(p,'.mg-desktop-page-next');}await tap(p,'#mgThemeGrid .mg-theme[data-theme-id="'+id+'"]');if((await state(p)).screen==='sequences')await tap(p,'#mgSequences .mg-sequence:visible');await p.waitForFunction(()=>window.MelungaMockup.state().screen==='lesson');await settle(p);}
async function menu(p,item){const desktop=p.locator('#mgDesktopNav [data-menu-item="'+item+'"]');if(await desktop.isVisible())await desktop.click();else{await tap(p,'#mgMenuTrigger');await tap(p,'#mgMenuNav [data-menu-item="'+item+'"]');}await settle(p);}
async function known(p,pair){return p.evaluate(pair=>JSON.parse(localStorage.getItem('melunga-guided-known-v1')||'{}').pairs?.[pair]||[],pair);}
async function reviews(p){return p.evaluate(()=>JSON.parse(localStorage.getItem('melunga-guided-review-v1')||'{}').entries||[]);}
async function capture(p,name){if(process.env.GERMAN_NATIVE_DEBUG)console.log('capture before',name,p.url());await p.waitForTimeout(300);await p.evaluate(()=>document.activeElement?.blur());await p.mouse.move(0,0);await p.evaluate(()=>document.fonts.ready);await p.locator('img').evaluateAll(nodes=>Promise.all(nodes.filter(n=>{const r=n.getBoundingClientRect();return r.width&&r.height&&r.bottom>0&&r.top<innerHeight&&getComputedStyle(n).visibility!=='hidden';}).map(n=>n.decode().catch(()=>{}))));await settle(p);const file=path.join(OUT,name+'.png');await p.screenshot({path:file,animations:'disabled'});report.screenshots.push(file);if(process.env.GERMAN_NATIVE_DEBUG)console.log('capture after',name);return fs.readFileSync(file);}

test('all published study languages, three course ambiences and both layouts share one event-driven capsule without moving text',{timeout:180000},()=>checked('twelve-languages-three-ambiences-two-layouts',async()=>{
 let cells=0,plays=0;
 for(const width of [390,1366])for(const study of nativeManifest.studyLanguageIds){
  const pair=(study==='fr'?'zh':'fr')+'-'+study,f=await fixture({width,pair});try{
   const p=f.page;await goCourse(f,pair,1,true);
   const knownBefore=await p.evaluate(()=>localStorage.getItem('melunga-guided-known-v1'));
   const ambiences=new Set();
   for(let theme=0;theme<3;theme++){
    const ambience=await p.locator('body').getAttribute('data-ambience');ambiences.add(ambience);
    for(const rate of [1,.75])for(const control of ['mgListen','mgEar']){
     const result=await p.evaluate(({rate,control})=>{
      const row=document.getElementById('mgPhonrow'),phon=document.getElementById('mgPhon');
      const box=n=>{const r=n.getBoundingClientRect();return [r.x,r.y,r.width,r.height];};
      const geometry=[box(row),box(phon)],textOpacity=getComputedStyle(phon).opacity,ink=getComputedStyle(phon).color;
      const speed=document.getElementById('mgSpeed');speed.value=String(rate);speed.dispatchEvent(new Event('change',{bubbles:true}));
      document.getElementById(control).click();const audio=__capsuleMedia.instances.at(-1);
      const lit=row.classList.contains('is-audio-playing'),sameButton=document.getElementById('mgListen').classList.contains('is-playing');
      const style=getComputedStyle(row,'::after'),playingInk=getComputedStyle(phon).color;
      const playingGeometry=[box(row),box(phon)],buttonGreen=getComputedStyle(document.getElementById('mgListen')).backgroundColor;
      audio.onpause();const paused=!row.classList.contains('is-audio-playing');audio.onplaying();const resumed=row.classList.contains('is-audio-playing');audio.onended();
      return{lit,sameButton,paused,resumed,ended:!row.classList.contains('is-audio-playing'),geometry,playingGeometry,textOpacity,playingOpacity:getComputedStyle(phon).opacity,ink,playingInk,bg:style.backgroundColor,buttonGreen};
     },{rate,control});
     assert(result.lit&&result.sameButton&&result.paused&&result.resumed&&result.ended,pair+' '+ambience+' '+control);
     assert.deepEqual(result.playingGeometry,result.geometry,'capsule and text geometry unchanged');assert.equal(result.textOpacity,'1');assert.equal(result.playingOpacity,'1');assert.equal(result.playingInk,result.ink);
     assert.match(result.bg,/0\.22/);assert.equal(result.buttonGreen,'rgb(45, 125, 84)',JSON.stringify({width,pair,ambience,control,rate,result}));plays++;
    }
    await p.locator('#mgPalette').click();cells++;
   }
   assert.equal(ambiences.size,3);assert.equal(await p.evaluate(()=>localStorage.getItem('melunga-guided-known-v1')),knownBefore);
  }finally{await f.close();}
 }
 assert.equal(cells,nativeManifest.studyLanguageIds.length*6);assert.equal(plays,cells*4);report.cases.push({courseThemeLayoutCells:cells,normalSlowSpeakerEarPlays:plays});
}));

test('capsule fades in 150ms, survives long playback and browser-voice fallback, and clears on card changes and stale events',{timeout:60000},()=>checked('fade-fallback-card-change-and-stale-events',async()=>{
 for(const width of [390,1366]){
  const f=await fixture({width,pair:'fr-de'});try{
   const p=f.page;await p.emulateMedia({reducedMotion:'no-preference'});await goCourse(f,'fr-de',1,true);
   assert.equal(await p.locator('#mgPhonrow').evaluate(n=>getComputedStyle(n,'::after').transitionDuration),'0.15s');
   await p.locator('#mgListen').click();await p.waitForTimeout(190);
   assert.equal(await p.locator('#mgPhonrow').evaluate(n=>getComputedStyle(n,'::after').opacity),'1');
   await capture(p,'capsule-active-'+width);
   await p.evaluate(()=>{const a=__capsuleMedia.instances.at(-1);window.__oldEnd=a.onended;a.onerror();});
   assert.equal(await p.locator('#mgPhonrow').evaluate(n=>n.classList.contains('is-audio-playing')),true,'browser fallback stays lit');
   await p.evaluate(()=>__capsuleMedia.utterances.at(-1).onend());await p.waitForTimeout(190);
   assert.equal(await p.locator('#mgPhonrow').evaluate(n=>getComputedStyle(n,'::after').opacity),'0');
   await p.locator('#mgListen').click();await p.locator('#mgContinue').click();
   assert.equal(await p.locator('#mgPhonrow').evaluate(n=>n.classList.contains('is-audio-playing')),false);
   await p.locator('#mgListen').click();await p.evaluate(()=>window.__oldEnd());
   assert.equal(await p.locator('#mgPhonrow').evaluate(n=>n.classList.contains('is-audio-playing')),true,'old end cannot clear new card audio');
   await p.evaluate(()=>__capsuleMedia.instances.at(-1).onended());await p.waitForTimeout(190);await capture(p,'capsule-rest-'+width);
  }finally{await f.close();}
 }
}));

test('all classic ambience presets and available study decks support speaker, ear, normal and slow with no layout shift',{timeout:120000},()=>checked('classic-all-presets-and-decks',async()=>{
 for(const width of [390,1366]){
  const f=await fixture({width});try{
   const p=f.page;await p.goto(ORIGIN+'/app.html?classic=1');await p.waitForFunction(()=>typeof window.playCurrent==='function'&&window.MelungaVoiceSelection?.state().status==='ready');
   const result=await p.evaluate(()=>{
    document.querySelectorAll('.wlc-overlay,#welcome').forEach(n=>n.style.display='none');const source=Object.keys(DECKS),presets=[],failures=[];let cells=0;
    const row=document.getElementById('phon').closest('.phonrow');const visited=new Set();for(let i=0;i<40;i++){window.cycleAmb();const key=localStorage.getItem('ox_ambidx');if(visited.has(key))break;visited.add(key);presets.push(key);}if(row.getBoundingClientRect().width===0||row.getBoundingClientRect().height===0)failures.push('classic capsule must be visible');
    for(const preset of presets){window.cycleAmb();for(const study of source){
     nat=study==='fr'?'zh':'fr';lang=study;pool=DECKS[study];idx=0;mode='listen';show();
     const rect=()=>{const r=row.getBoundingClientRect();return [r.x,r.y,r.width,r.height];};
     for(const trigger of ['listen','ear','normal','slow']){
      const before=rect();
      if(trigger==='listen')document.getElementById('listen').click();
      else if(trigger==='ear')row.querySelector('.earicon').click();
      else document.getElementById(trigger==='normal'?'sN':'sS').click();
      const audio=__capsuleMedia.instances.at(-1);
      if(!row.classList.contains('is-audio-playing'))failures.push(study+' '+trigger+' not lit');
      if(JSON.stringify(before)!==JSON.stringify(rect()))failures.push(study+' '+trigger+' moved');
      if(getComputedStyle(document.getElementById('phon')).opacity!=='1')failures.push(study+' text opacity changed');
      audio.onended();if(row.classList.contains('is-audio-playing'))failures.push(study+' '+trigger+' end');
     }
     playCurrent(document.getElementById('listen'));show();if(row.classList.contains('is-audio-playing'))failures.push(study+' card change');cells++;
    }}
    return{decks:source.length,presets:presets.length,cells,failures};
   });
   assert(result.presets>=14);assert(result.decks>=11);assert.equal(result.cells,result.decks*result.presets);assert.deepEqual(result.failures,[]);report.cases.push({classicWidth:width,...result});
  }finally{await f.close();}
 }
}));


