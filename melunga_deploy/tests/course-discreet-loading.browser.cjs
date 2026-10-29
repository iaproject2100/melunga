/* Underwater logo-path loading presentation regression. Static assets/content are real files;
 * status and voice catalogue are explicit local fixtures. No real accounts,
 * payments, providers or audio are used. Chromium emulation is not phone QA. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {execFileSync}=require('node:child_process');
const os=require('node:os');
const {chromium} = require('playwright-core');
const ROOT = path.resolve(__dirname, '../..'), WEB = path.join(ROOT, 'melunga_deploy');
const ORIGIN = 'https://course-startup-presentation.test';
const OUT = process.env.COURSE_DISCREET_LOADING_REPORT_DIR || '/tmp/melunga-course-loading-underwater-animation';
const ORIGINAL_LOGO_SHA='1aa277028faa2128c78405c839748dff8b1497827c04b02610216056c92b18c0';
const CODES = ['fr','en','es','zh','it','ja','ko'];
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const productFiles = directory => fs.readdirSync(directory, {withFileTypes:true}).flatMap(entry =>
  entry.isDirectory() ? productFiles(path.join(directory,entry.name)) : [path.join(directory,entry.name)]);
const fingerprint = () => Object.fromEntries(productFiles(WEB).filter(file => !file.includes(path.sep+'tests'+path.sep))
  .concat(__filename).sort().map(file => [path.relative(ROOT,file),sha(fs.readFileSync(file))]));
const report = {status:'running',environment:'Local Chromium; desktop and emulated touch/mobile viewports',
  physicalDeviceTested:false,safariTested:false,realAccountsUsed:false,realPaymentsUsed:false,actualAudioPlayed:false,
  allResponsesLocalFixtures:true,contrast:[],cases:[],errors:[],fixtureErrors:[],unexpected:[],requests:[]};
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
            !document.getElementById('mgLevelTrigger')?.closest(view==='themes'?'.mg-mobile-dock':'.mg-mobile-context')))reason='old-mobile-controls';
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
  assert.equal(await p.locator('#mgPresentationArtwork').count(),0,'loading animation leaves the DOM with its cover');
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
  await p.locator('#mgPresentationArtwork').waitFor({state:'visible'});
  await p.locator('#mgPresentationLogo').evaluate(img=>img.decode());
  assert.equal(await p.locator('.mg-app').evaluate(n=>getComputedStyle(n).visibility),'hidden');
  const visual=await p.locator('#mgPresentationBoot').evaluate(n=>{
    const box=node=>{const r=node.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
    const s=getComputedStyle(n),status=n.querySelector('#mgPresentationStatus'),art=n.querySelector('#mgPresentationArtwork'),logo=n.querySelector('#mgPresentationLogo');
    const mascot=art.querySelector('.mg-presentation-mascot'),bubbles=[...art.querySelectorAll('.mg-presentation-bubble')];
    return {background:s.backgroundImage,images:n.querySelectorAll('img').length,wordmarks:n.querySelectorAll('strong').length,
      text:n.querySelector('#mgPresentationText').textContent,locale:document.documentElement.lang,status:box(status),artwork:box(art),
      logo:{...box(logo),src:new URL(logo.currentSrc||logo.src).pathname,naturalWidth:logo.naturalWidth,naturalHeight:logo.naturalHeight,alt:logo.alt},
      artworkHiddenFromAT:art.getAttribute('aria-hidden'),viewport:{width:innerWidth,height:innerHeight},statusColor:getComputedStyle(status).color,
      mascotAnimation:getComputedStyle(mascot).animationName,mascotTransform:getComputedStyle(mascot).transform,
      haloAnimation:getComputedStyle(art,'::before').animationName,
      bubbles:bubbles.map(b=>({box:box(b),animation:getComputedStyle(b).animationName,opacity:getComputedStyle(b).opacity})),
      activeAnimations:art.getAnimations({subtree:true}).map(a=>({name:a.animationName,playState:a.playState}))};
  });
  assert.match(visual.background,/linear-gradient/);
  assert.ok(visual.background.includes('rgb(28, 181, 224)')&&visual.background.includes('rgb(0, 8, 81)'),'ocean-blue gradient is rendered');
  assert.equal(visual.images,1,'one original Melunga logo');
  assert.equal(visual.wordmarks,0,'no large wordmark');
  assert.equal(visual.logo.src,'/melunga-logo.png');assert.equal(visual.logo.alt,'');
  assert.equal(visual.artworkHiddenFromAT,'true','animation decorative; localized status is the announcement');
  assert.equal(sha(fs.readFileSync(path.join(WEB,visual.logo.src.slice(1)))),ORIGINAL_LOGO_SHA,'original logo asset bytes unchanged');
  assert.ok(visual.logo.naturalWidth>0&&visual.logo.naturalHeight>0,'actual original logo decoded');
  assert.ok(visual.logo.width<=146&&visual.logo.height<=146,'moving loading logo stays moderate in size');
  assert.ok(visual.text.length>3,'localized loading text');
  for(const b of [visual.status,visual.artwork])assert.ok(b.width<=visual.viewport.width-24&&b.x>=12&&b.bottom<=visual.viewport.height&&b.y>=0,'loading elements fit');
  assert.ok(visual.artwork.bottom<=visual.status.y,'logo above loading caption without overlap');
  assert.equal(visual.bubbles.length,3,'only three light bubbles');
  assert.deepEqual(await p.evaluate(()=>window.__coursePresentationFrames.bad),[]);
  return visual;
}

async function movingArtwork(f,{short=false}={}) {
  const p=f.page;
  const before=await p.locator('.mg-presentation-mascot').evaluate(n=>getComputedStyle(n).transform);
  await p.waitForTimeout(250);
  const after=await p.locator('.mg-presentation-mascot').evaluate(n=>getComputedStyle(n).transform);
  assert.notEqual(before,after,'logo actually travels under normal-motion preference');
  const active=await p.locator('#mgPresentationArtwork').evaluate(n=>n.getAnimations({subtree:true}).map(a=>({name:a.animationName,playState:a.playState})));
  assert.ok(active.length>=5&&active.every(a=>a.playState==='running'),'logo, halo and all three bubbles actually run');
  const swim=await p.locator('.mg-presentation-mascot').evaluate(async n=>{
    const box=node=>{const r=node.getBoundingClientRect();return{x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height};};
    const a=n.getAnimations()[0],previous=a.currentTime; a.pause(); const samples=[];
    for(const time of [0,1000,2000,3000,4000,5000,6000,7000]){
      a.currentTime=time;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
      const m=new DOMMatrixReadOnly(getComputedStyle(n).transform),logo=n.querySelector('img');
      samples.push({time,x:m.m41,y:m.m42,degrees:Math.atan2(m.m12,m.m11)*180/Math.PI,
        scale:Math.hypot(m.m11,m.m12),logo:box(logo),art:box(document.getElementById('mgPresentationArtwork')),
        status:box(document.getElementById('mgPresentationStatus')),viewport:{width:innerWidth,height:innerHeight}});
    }
    a.currentTime=previous;a.play();return samples;
  });
  const range=key=>Math.max(...swim.map(s=>s[key]))-Math.min(...swim.map(s=>s[key]));
  assert.ok(range('x')>=(short?50:80)&&range('y')>=(short?15:35),'underwater trajectory visibly travels sideways and vertically');
  assert.ok(range('scale')>=.12,'depth changes make the logo approach and recede');
  assert.ok(range('degrees')>=3,'logo gently tilts while swimming');
  for(const sample of swim){
    const b=sample.logo;
    assert.ok(b.x>=0&&b.y>=0&&b.right<=sample.viewport.width&&b.bottom<=sample.viewport.height,'travelling logo stays in viewport '+JSON.stringify(sample));
    assert.ok(b.bottom+4<=sample.status.y,'travelling logo remains clear of loading caption '+JSON.stringify(sample));
  }
  return{before,after,active,swim,ranges:{x:range('x'),y:range('y'),scale:range('scale'),degrees:range('degrees')}};
}

async function readableLoading(f,{retry=false}={}) {
  const p=f.page;
  const nodes=await p.evaluate(retry=>['mgPresentationStatus',...(retry?['mgPresentationRetry']:[])].map(id=>{
    const n=document.getElementById(id),r=n.getBoundingClientRect();return{id,x:Math.round(r.x+12),y:Math.round(r.y+r.height/2),color:getComputedStyle(n).color};
  }),retry);
  const cdp=await p.context().newCDPSession(p),shot=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await cdp.detach();
  const backgrounds=await p.evaluate(async ({data,nodes})=>{
    const img=new Image();img.src='data:image/png;base64,'+data;await img.decode();
    const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
    const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0);
    return nodes.map(n=>({...n,bg:[...ctx.getImageData(n.x,n.y,1,1).data].slice(0,3)}));
  },{data:shot.data,nodes});
  const channel=x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;};
  const lum=a=>.2126*channel(a[0])+.7152*channel(a[1])+.0722*channel(a[2]);
  const values=backgrounds.map(n=>{const fg=n.color.match(/[\d.]+/g).slice(0,3).map(Number),a=lum(fg),b=lum(n.bg);return{...n,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};});
  for(const n of values)assert.ok(n.ratio>=4.5,'actual ocean loading text contrast '+JSON.stringify(n));
  report.contrast.push(...values);return values;
}

async function captureAnimation(f) {
  const p=f.page,frames=fs.mkdtempSync(path.join(os.tmpdir(),'melunga-logo-frames-'));
  // Each frame is a screenshot of actual browser pixels. Pause only the artwork's
  // real CSS animations and advance their time evenly to export its full eight-second cycle.
  const cdp=await p.context().newCDPSession(p);
  await p.locator('#mgPresentationArtwork').evaluate(n=>{window.__logoPreviewAnimations=n.getAnimations({subtree:true});for(const a of window.__logoPreviewAnimations)a.pause();});
  for(let index=0;index<96;index++){
    await p.evaluate(ms=>{for(const a of window.__logoPreviewAnimations)a.currentTime=ms;},index*1000/12);
    await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    const shot=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
    fs.writeFileSync(path.join(frames,'frame-'+String(index).padStart(3,'0')+'.png'),Buffer.from(shot.data,'base64'));
  }
  await cdp.detach();
  const file=path.join(OUT,'animation-logo-melunga.gif');
  execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-framerate','12','-i',path.join(frames,'frame-%03d.png'),'-filter_complex_threads','1','-filter_complex','split[a][b];[a]palettegen=max_colors=192[p];[b][p]paletteuse=dither=bayer:bayer_scale=3','-loop','0',file],{stdio:'pipe'});
  await p.locator('#mgPresentationArtwork').evaluate(()=>{for(const a of window.__logoPreviewAnimations)a.play();delete window.__logoPreviewAnimations;});
  return{file:path.basename(file),frames:96,fps:12,seconds:8,sha256:sha(fs.readFileSync(file)),capture:'actual Chromium artwork CSS animation pixels'};
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
        labels[locale]=visual.text;await readableLoading(f);
        assert.equal(visual.mascotAnimation,'none','reduced motion keeps logo still');assert.equal(visual.haloAnimation,'none');assert.ok(visual.bubbles.every(b=>b.animation==='none'),'reduced motion keeps bubbles still');assert.equal(visual.activeAnimations.length,0,'all decorative animations disabled');
        if(locale==='fr')await screenshotWhileParserHeld(f.page,path.join(OUT,'logo-chargement-mobile.png'));
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
        assert.notEqual(visual.mascotAnimation,'none','normal motion logo has animation');assert.notEqual(visual.haloAnimation,'none');assert.ok(visual.bubbles.every(b=>b.animation!=='none'));const motion=await movingArtwork(f);await readableLoading(f);
        if(config.width===320){await screenshotWhileParserHeld(f.page,path.join(OUT,'logo-chargement-anime-mobile.png'));if(process.env.COURSE_LOADING_ANIMATION_CAPTURE==='1')report.animationPreview=await captureAnimation(f);}
        if(config.width===1366)await screenshotWhileParserHeld(f.page,path.join(OUT,'logo-chargement-ordinateur.png'));
        f.release();await launch;const final=await accepted(f,'fr-es');
        report.cases.push({name:'real-language-click-underwater-path-logo',...config,visual,motion,oldVisibleFrames:final.samples.bad.length});
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
    const failure=await fixture({width:640,height:320,pair:'en-fr',failOnce:'course-desktop.js'});try{
      await failure.course('&start=lesson');const p=failure.page;
      await p.locator('#mgPresentationRetry').waitFor({state:'visible'});
      assert.equal(await p.locator('#mgPresentationLogo').count(),1);assert.equal(await p.locator('#mgPresentationBoot strong').count(),0);
      const short=await p.locator('#mgPresentationBoot').evaluate(n=>{const r=x=>{const b=x.getBoundingClientRect();return{x:b.x,y:b.y,right:b.right,bottom:b.bottom,width:b.width,height:b.height};};return{logo:r(n.querySelector('#mgPresentationLogo')),art:r(n.querySelector('#mgPresentationArtwork')),status:r(n.querySelector('#mgPresentationStatus')),retry:r(n.querySelector('#mgPresentationRetry')),w:innerWidth,h:innerHeight};});
      for(const b of [short.art,short.status,short.retry])assert.ok(b.x>=0&&b.y>=0&&b.right<=short.w&&b.bottom<=short.h,'short landscape loading and retry fit');
      await readableLoading(failure,{retry:true});assert.ok(short.logo.width<=100&&short.logo.height<=100,'logo reduced on short landscape');await p.emulateMedia({reducedMotion:'no-preference'});const shortMotion=await movingArtwork(failure,{short:true});await screenshotWhileParserHeld(p,path.join(OUT,'logo-chargement-paysage.png'));
      assert.equal(await p.locator('.mg-app').evaluate(n=>getComputedStyle(n).visibility),'hidden');
      assert.equal(await p.locator('html').evaluate(n=>n.classList.contains('course-presentation-slow')),true,'failure immediately exposes status and retry');
      await p.locator('#mgPresentationRetry').click();const final=await accepted(failure,'en-fr');
      report.cases.push({name:'short-landscape-asset-error-still-retries-original-direct-lesson',bounds:short,motion:shortMotion,oldVisibleFrames:final.samples.bad.length});
    }finally{await failure.close();}
    const narrow=await fixture({width:280,height:620,pair:'fr-es',hold:'course-desktop.js'});try{
      const p=narrow.page;await p.emulateMedia({reducedMotion:'no-preference'});
      const launch=narrow.course('&start=lesson');const visual=await indicator(narrow),motion=await movingArtwork(narrow);
      await readableLoading(narrow);await screenshotWhileParserHeld(p,path.join(OUT,'logo-chargement-etroit.png'));
      narrow.release();await launch;const final=await accepted(narrow,'fr-es');
      report.cases.push({name:'narrow-280px-underwater-path-remains-clear',visual,motion,oldVisibleFrames:final.samples.bad.length});
    }finally{await narrow.close();}
    assert.deepEqual(report.errors,[]);assert.deepEqual(report.fixtureErrors,[]);assert.deepEqual(report.unexpected,[]);
    report.inputsStable=JSON.stringify(inputs)===JSON.stringify(fingerprint());assert.equal(report.inputsStable,true,'runtime stayed frozen');
    report.inputSha256=inputs;report.status='passed';
  }catch(e){report.status='failed';report.failure=e.stack;process.exitCode=1;console.error(e.stack);}
  finally{await browser.close();fs.writeFileSync(path.join(OUT,'browser-report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,cases:report.cases.length,errors:report.errors,unexpected:report.unexpected,failure:report.failure}));}
})();
