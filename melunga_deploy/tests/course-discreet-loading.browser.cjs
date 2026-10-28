/* Discreet loading presentation regression. Static assets/content are real files;
 * status and voice catalogue are explicit local fixtures. No real accounts,
 * payments, providers or audio are used. Chromium emulation is not phone QA. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {chromium} = require('playwright-core');
const ROOT = path.resolve(__dirname, '../..'), WEB = path.join(ROOT, 'melunga_deploy');
const ORIGIN = 'https://course-startup-presentation.test';
const OUT = process.env.COURSE_DISCREET_LOADING_REPORT_DIR || '/tmp/melunga-course-discreet-loading';
const CODES = ['fr','en','es','zh','it','ja','ko'];
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const productFiles = directory => fs.readdirSync(directory, {withFileTypes:true}).flatMap(entry =>
  entry.isDirectory() ? productFiles(path.join(directory,entry.name)) : [path.join(directory,entry.name)]);
const fingerprint = () => Object.fromEntries(productFiles(WEB).filter(file => !file.includes(path.sep+'tests'+path.sep))
  .concat(__filename).sort().map(file => [path.relative(ROOT,file),sha(fs.readFileSync(file))]));
const report = {status:'running',environment:'Local Chromium; desktop and emulated touch/mobile viewports',
  physicalDeviceTested:false,safariTested:false,realAccountsUsed:false,realPaymentsUsed:false,actualAudioPlayed:false,
  allResponsesLocalFixtures:true,cases:[],errors:[],fixtureErrors:[],unexpected:[],requests:[]};
let browser;

function catalogue() {
  const voices = {fr:['fr-FR','Aoede','F'],en:['en-GB','Kore','C'],es:['es-ES','Kore','F'],
    zh:['cmn-CN','Kore','A'],it:['it-IT','Charon','E'],ja:['ja-JP','Kore','B'],ko:['ko-KR','Kore','A']};
  return {version:1,source:'google-voices-list',previewOnly:true,selectionVersion:'kartech-2026-10-27',
    verifiedAt:new Date(Date.now()-1000).toISOString(),expiresAt:new Date(Date.now()+240000).toISOString(),
    languages:Object.fromEntries(CODES.map(language => {
      const [languageCode,name,wave] = voices[language];
      const chirp = [['Aoede','FEMALE'],['Kore','FEMALE'],['Charon','MALE']].map(([n,gender]) =>
        ({name:languageCode+'-Chirp3-HD-'+n,languageCode,gender,engine:'chirp3',rateMode:'client'}));
      return [language,{language,available:true,waveNet:{name:languageCode+'-Wavenet-'+wave,languageCode,
        gender:'FEMALE',engine:'wavenet',rateMode:'server'},chirp,defaultVoice:chirp.find(v=>v.name.endsWith('-'+name))}];
    }))};
}

async function fixture({width=390,height=740,pair='fr-es',direct=true,ambience='legacy-neon',hold=null,failOnce=null,failAttempts=1}={}) {
  const context = await browser.newContext({viewport:{width,height},isMobile:width<960,hasTouch:width<960,
    reducedMotion:'reduce',serviceWorkers:'block'});
  const f = {context,closed:false,paths:[],counts:{},release:()=>{}};
  let signal;
  const started = new Promise(resolve=>signal=resolve);
  const gate = new Promise(resolve=>f.release=resolve);
  f.held = started;
  await context.addInitScript(({pair,direct,ambience})=>{
    if (!sessionStorage.getItem('__course-presentation-seeded')) {
      localStorage.setItem('ox_device','course-presentation-fixture');
      localStorage.setItem('melunga-app-language',JSON.stringify({locale:pair.split('-')[0],label:pair.split('-')[0]}));
      localStorage.setItem('melunga-course-pair',pair);localStorage.setItem('melunga-course-level','1');
      localStorage.setItem('melunga-course-ambience',ambience);
      sessionStorage.setItem('__course-presentation-seeded','1');
    }
    window.__courseMedia=[];
    window.Audio=class extends EventTarget {
      constructor(src){super();this.src=src||'';this.paused=true;this.currentTime=0;this.playbackRate=1;}
      play(){window.__courseMedia.push(this.src);sessionStorage.setItem('__course-media-history',JSON.stringify([
        ...JSON.parse(sessionStorage.getItem('__course-media-history')||'[]'),this.src]));return Promise.resolve();}
      pause(){this.paused=true;}load(){}removeAttribute(n){if(n==='src')this.src='';}
    };
    window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};
    Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},getVoices(){return[];},addEventListener(){},
      removeEventListener(){},speak(u){window.__courseMedia.push('browser:'+u.text);}}});
    const samples=window.__coursePresentationFrames={total:0,visible:0,bad:[],firstVisible:null,allowThemes:!direct,allowLoading:false};
    function sample() {
      samples.total++;
      const app=document.querySelector('.mg-app'),cover=document.getElementById('mgPresentationBoot');
      const covered=cover&&getComputedStyle(cover).display!=='none'&&getComputedStyle(cover).visibility!=='hidden';
      if (app&&location.pathname.endsWith('/parcours-niveaux.html')&&!covered&&getComputedStyle(app).visibility!=='hidden'&&app.getBoundingClientRect().width) {
        const view=document.body.dataset.view,frame={view,locale:document.documentElement.lang,
          ambience:document.body.dataset.ambience,classes:document.body.className};
        samples.visible++;samples.firstVisible||=frame;
        let reason='';
        if(innerWidth<=760&&(!document.body.classList.contains('mg-mobile-dock-course')||
            !document.getElementById('mgLevelTrigger')?.closest('.mg-mobile-context')))reason='old-mobile-controls';
        if(innerWidth>=1101&&(!document.body.classList.contains('mg-desktop-course')||
            !document.querySelector('.mg-desktop-header')))reason='old-desktop-controls';
        if(view==='themes'&&!samples.allowThemes)reason='intermediate-themes-before-first-lesson';
        if(view==='loading'&&!samples.allowLoading&&!document.getElementById('mgLoading')?.classList.contains('has-error'))reason='unfinished-entry';
        if(reason&&samples.bad.length<12)samples.bad.push({reason,...frame});
      }
      requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
  },{pair,direct,ambience});
  await context.route('**/*',async route=>{
    const request=route.request(),url=new URL(request.url()),relative=decodeURIComponent(url.pathname.slice(1));
    try {
      if(request.method()!=='GET'||url.origin!==ORIGIN){report.unexpected.push({origin:url.origin,path:url.pathname,method:request.method()});return await route.abort();}
      f.counts[relative]=(f.counts[relative]||0)+1;report.requests.push({path:url.pathname,attempt:f.counts[relative]});
      if(relative===hold&&f.counts[relative]===1){signal();await gate;}
      if(relative===failOnce&&f.counts[relative]<=failAttempts)return await route.fulfill({status:503,contentType:relative.endsWith('.js')?'text/javascript':relative.endsWith('.css')?'text/css':'application/json',body:'/* explicit transport failure */'});
      if(url.pathname==='/.netlify/functions/check-status')return await route.fulfill({json:{paid:false}});
      if(url.pathname==='/.netlify/functions/tts'&&url.searchParams.get('catalog')==='chirp3')return await route.fulfill({json:catalogue()});
      if(url.pathname==='/.netlify/functions/get-pricing')return await route.fulfill({json:{country:'FR',monthlyDisplay:'7,90 €',annualDisplay:'42 €'}});
      if(url.pathname==='/api/geolocation')return await route.fulfill({json:{country:'FR'}});
      if(relative==='mobile-runtime.js')return await route.fulfill({contentType:'text/javascript',body:'/* ordinary web fixture */'});
      if(relative.startsWith('.netlify/')||relative.startsWith('api/')){report.unexpected.push({path:url.pathname});return await route.abort();}
      const file=path.resolve(WEB,relative||'index.html');
      if(!file.startsWith(WEB+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){
        report.unexpected.push({missingFile:url.pathname});return await route.fulfill({status:404,body:'Not found'});
      }
      await route.fulfill({body:fs.readFileSync(file),contentType:({'.html':'text/html','.js':'text/javascript',
        '.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream'});
    } catch(e){if(!f.closed)report.fixtureErrors.push(e.message);}
  });
  f.page=await context.newPage();f.page.setDefaultTimeout(12000);
  f.page.on('pageerror',e=>{if(!f.closed)report.errors.push(e.message);});
  f.page.on('framenavigated',frame=>{if(frame===f.page.mainFrame())f.paths.push(new URL(frame.url()).pathname);});
  f.close=async()=>{f.closed=true;f.release();await context.close();};
  f.home=async(targetPair=pair)=>{
    const p=f.page;await p.goto(ORIGIN+'/index.html?country=FR');
    if(targetPair.split('-')[0]!==pair.split('-')[0]){
      if(width>=960)await p.locator('.dh-language').selectOption(targetPair.split('-')[0]);
      else{await p.locator('[data-open-app-language]').click();await p.locator('[data-app-language="'+targetPair.split('-')[0]+'"]').click();}
    }
    await p.locator('[data-dh-free]:visible,[data-select-access="free"]:visible').first().click();
    await p.locator('[data-study-language="'+targetPair.split('-')[1]+'"]').click({noWaitAfter:true});
  };
  f.course=async(query='')=>f.page.goto(ORIGIN+'/parcours-niveaux.html?pair='+pair+'&level=1'+query,{waitUntil:'commit'});
  return f;
}

async function heldCover(f) {
  await f.held;await f.page.locator('#mgPresentationBoot').waitFor({state:'visible'});
  await f.page.waitForFunction(()=>window.__coursePresentationFrames.total>=20);
  assert.equal(await f.page.locator('.mg-app').evaluate(n=>getComputedStyle(n).visibility),'hidden');
  assert.deepEqual(await f.page.evaluate(()=>window.__coursePresentationFrames.bad),[]);
}

async function accepted(f,pair,expected='lesson') {
  const p=f.page;
  await p.waitForFunction(expected=>!document.documentElement.classList.contains('course-presentation-pending')&&
    !document.getElementById('mgPresentationBoot')&&window.MelungaMockup?.state().screen===expected,expected,{timeout:25000});
  await p.waitForFunction(()=>window.__coursePresentationFrames.visible>=8);
  const value=await p.evaluate(()=>({state:window.MelungaMockup.state(),samples:window.__coursePresentationFrames,
    lang:document.documentElement.lang,ambience:document.body.dataset.ambience,media:JSON.parse(sessionStorage.getItem('__course-media-history')||'[]')}));
  assert.equal(value.state.pairId,pair);assert.equal(value.lang,pair.split('-')[0]);assert.equal(value.ambience,'legacy-neon');
  assert.deepEqual(value.samples.bad,[]);assert.deepEqual(value.media,[]);assert.ok(!f.paths.includes('/app.html'));
  if(expected==='lesson'){assert.equal(value.state.stepIndex,0);assert.equal(value.state.access.paid,false);assert.equal(new URL(p.url()).searchParams.has('start'),false);}
  return value;
}


async function screenshotWhileParserHeld(page,file) {
  // The held bottom script keeps document.fonts.ready pending; capture actual pixels via CDP.
  const session=await page.context().newCDPSession(page);
  const capture=await session.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
  fs.writeFileSync(file,Buffer.from(capture.data,'base64'));await session.detach();
}

async function indicator(f) {
  const p=f.page;
  await f.held;
  await p.waitForFunction(()=>document.documentElement.classList.contains('course-presentation-slow'));
  await p.locator('#mgPresentationStatus').waitFor({state:'visible'});
  assert.equal(await p.locator('.mg-app').evaluate(n=>getComputedStyle(n).visibility),'hidden');
  const visual=await p.locator('#mgPresentationBoot').evaluate(n=>{
    const s=getComputedStyle(n),status=n.querySelector('#mgPresentationStatus'),text=n.querySelector('#mgPresentationText');
    const r=status.getBoundingClientRect();
    return {background:s.backgroundImage,images:n.querySelectorAll('img,strong').length,text:text.textContent,
      locale:document.documentElement.lang,status:{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom},
      viewport:{width:innerWidth,height:innerHeight},spinnerAnimation:getComputedStyle(status,'::before').animationName};
  });
  assert.match(visual.background,/linear-gradient/);
  assert.ok(visual.background.includes('rgb(250, 229, 187)')&&visual.background.includes('rgb(216, 208, 232)'),'same pastel endpoints as language choices');
  assert.equal(visual.images,0,'no large logo or wordmark in loading cover');
  assert.ok(visual.text.length>3,'localized loading text');
  assert.ok(visual.status.width<=visual.viewport.width-24&&visual.status.x>=12&&visual.status.bottom<=visual.viewport.height,'small loading capsule fits');
  assert.deepEqual(await p.evaluate(()=>window.__coursePresentationFrames.bad),[]);
  return visual;
}

(async()=>{
  fs.mkdirSync(OUT,{recursive:true});
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
  const inputs=fingerprint();
  try {
    const labels={};
    for(const locale of CODES){
      const pair=locale==='fr'?'fr-es':locale+'-fr';
      const f=await fixture({width:390,pair,hold:'course-desktop.js'});
      try{
        const launch=f.course('&start=lesson');
        const visual=await indicator(f);
        assert.equal(visual.locale,locale,'loading copy uses native locale even before final adapter');
        labels[locale]=visual.text;
        assert.equal(visual.spinnerAnimation,'none','reduced motion removes spinning');
        if(locale==='fr')await screenshotWhileParserHeld(f.page,path.join(OUT,'attente-discrete-mobile.png'));
        f.release();await launch;const final=await accepted(f,pair);
        assert.equal(await f.page.locator('html').evaluate(n=>n.classList.contains('course-presentation-slow')),false,'slow marker removed on completion');
        report.cases.push({name:'localized-discreet-loading',locale,pair,visual,firstVisible:final.samples.firstVisible});
      }finally{await f.close();}
    }
    assert.equal(new Set(Object.values(labels)).size,7,'seven distinct localized messages');
    assert.ok(!Object.entries(labels).some(([locale,label])=>locale!=='fr'&&label===labels.fr),'non-French native UI is translated');
    for(const config of [{width:320,hold:'content/niveaux-progressifs/manifest.json'},{width:1366,hold:'course-desktop.js'}]){
      const f=await fixture({...config,pair:'fr-es'});try{
        await f.page.emulateMedia({reducedMotion:'no-preference'});
        const launch=f.home();const visual=await indicator(f);
        assert.notEqual(visual.spinnerAnimation,'none','normal motion indicator is animated');
        if(config.width===1366)await screenshotWhileParserHeld(f.page,path.join(OUT,'attente-discrete-ordinateur.png'));
        f.release();await launch;const final=await accepted(f,'fr-es');
        report.cases.push({name:'real-language-click-pastel-indicator',...config,visual,oldVisibleFrames:final.samples.bad.length});
      }finally{await f.close();}
    }
    const early=await fixture({width:390,pair:'fr-es'});try{
      const p=early.page;
      await p.clock.install({time:new Date('2026-10-28T12:00:00Z')});
      await p.clock.pauseAt(new Date('2026-10-28T12:00:01Z'));
      await early.course('&start=lesson');
      let clockElapsed=0;
      for(let attempt=0;attempt<20;attempt++){
        await p.clock.runFor(16);clockElapsed+=16;
        if(await p.evaluate(()=>!document.documentElement.classList.contains('course-presentation-pending')))break;
        // Network routes run in real time while the presentation clock is paused.
        await new Promise(resolve=>setTimeout(resolve,40));
      }
      assert.ok(clockElapsed<400,'first lesson can complete before slow indicator deadline');
      assert.equal(await p.evaluate(()=>document.documentElement.classList.contains('course-presentation-pending')),false);
      assert.equal(await p.locator('#mgPresentationBoot').count(),0);
      await p.clock.runFor(1000);
      assert.equal(await p.locator('html').evaluate(n=>n.classList.contains('course-presentation-slow')),false,'cancelled slow timer never flashes later');
      assert.equal((await p.evaluate(()=>window.MelungaMockup.state())).screen,'lesson');
      assert.deepEqual(await p.evaluate(()=>window.__coursePresentationFrames.bad),[]);
      report.cases.push({name:'early-first-lesson-cancels-delayed-indicator',clockElapsed,lateIndicator:false});
    }finally{await early.close();}
    const failure=await fixture({width:390,pair:'en-fr',failOnce:'course-desktop.js'});try{
      await failure.course('&start=lesson');const p=failure.page;
      await p.locator('#mgPresentationRetry').waitFor({state:'visible'});
      assert.equal(await p.locator('#mgPresentationBoot img,#mgPresentationBoot strong').count(),0);
      assert.equal(await p.locator('.mg-app').evaluate(n=>getComputedStyle(n).visibility),'hidden');
      assert.equal(await p.locator('html').evaluate(n=>n.classList.contains('course-presentation-slow')),true,'failure immediately exposes status and retry');
      await p.locator('#mgPresentationRetry').click();const final=await accepted(failure,'en-fr');
      report.cases.push({name:'asset-error-still-retries-original-direct-lesson',oldVisibleFrames:final.samples.bad.length});
    }finally{await failure.close();}
    assert.deepEqual(report.errors,[]);assert.deepEqual(report.fixtureErrors,[]);assert.deepEqual(report.unexpected,[]);
    report.inputsStable=JSON.stringify(inputs)===JSON.stringify(fingerprint());assert.equal(report.inputsStable,true,'runtime stayed frozen');
    report.inputSha256=inputs;report.status='passed';
  }catch(e){report.status='failed';report.failure=e.stack;process.exitCode=1;console.error(e.stack);}
  finally{await browser.close();fs.writeFileSync(path.join(OUT,'browser-report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,cases:report.cases.length,errors:report.errors,unexpected:report.unexpected,failure:report.failure}));}
})();
