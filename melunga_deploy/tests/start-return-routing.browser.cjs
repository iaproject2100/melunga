/* Additional real-page start/checkout-return regressions. Every network call
 * is local and explicitly fulfilled; POST, payment, accounts and audio are
 * forbidden. Existing happy-path/free/login suites remain separate. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {test,before,after}=require('node:test');
const {chromium}=require('playwright-core');
const ROOT=path.resolve(__dirname,'../..'),WEB=path.join(ROOT,'melunga_deploy'),ORIGIN='https://start-return-routing.test';
const REPORT=process.env.START_RETURN_ROUTING_REPORT||'/tmp/melunga-start-return-routing-browser.json';
const CAPTURES=process.env.START_RETURN_ROUTING_CAPTURES||'/tmp/melunga-start-return-routing-browser';
const CODES=['fr','en','es','zh','it','ja','ko'];
const REQUIRED=['premium-real-page-and-close','already-paid-premium-entry','saved-bare-welcome-start','incomplete-web-start','checkout-return-status','back-and-start-again','invalid-and-explicit-classic'];
const report={status:'running',environment:'Local Chromium; desktop and emulated mobile viewport/touch',physicalDeviceTested:false,safariTested:false,
  actualAudioPlayed:false,realAccountsUsed:false,realPaymentsUsed:false,postRequestsAllowed:false,allApiResponsesMocked:true,checks:[],cases:[],api:[],assetFixtures:[],errors:[],unexpected:[],fixtureErrors:[],screenshots:[]};
const checked=async(name,fn)=>{try{await fn();report.checks.push(name);}catch(e){report.errors.push(name+': '+e.message);throw e;}};
const files=()=>fs.readdirSync(WEB,{withFileTypes:true}).filter(x=>x.isFile()&&/\.(html|js|css)$/.test(x.name)).map(x=>x.name).sort();
const fingerprint=()=>Object.fromEntries([__filename,...files().map(f=>path.join(WEB,f))].sort().map(f=>[path.relative(ROOT,f),crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')]));
let browser,inputs;
before(async()=>{inputs=fingerprint();fs.mkdirSync(CAPTURES,{recursive:true});browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});});
after(async()=>{await browser?.close();report.inputsStable=JSON.stringify(inputs)===JSON.stringify(fingerprint());report.inputSha256=inputs;report.missingChecks=REQUIRED.filter(n=>!report.checks.includes(n));
  report.status=report.inputsStable&&!report.errors.length&&!report.unexpected.length&&!report.fixtureErrors.length&&!report.missingChecks.length?'passed':'failed';fs.writeFileSync(REPORT,JSON.stringify(report,null,2)+'\n');
  assert.equal(report.inputsStable,true,'tested runtime remains frozen');assert.deepEqual(report.errors,[]);assert.deepEqual(report.unexpected,[]);assert.deepEqual(report.fixtureErrors,[]);assert.deepEqual(report.missingChecks,[]);});
const pref=(pair='en-es',level=2)=>({'melunga-app-language':JSON.stringify({locale:pair.split('-')[0],label:pair.split('-')[0]}),'melunga-course-pair':pair,'melunga-course-level':String(level),ox_nat:pair.split('-')[0],ox_lang:pair.split('-')[1],ox_site:pair.split('-')[0]});
async function fixture({paid=false,width=390,height=700,local={},session={},status=200,native=false}={}){
  const context=await browser.newContext({viewport:{width,height},isMobile:width<960,hasTouch:width<960,reducedMotion:'reduce',serviceWorkers:'block'}),f={context,paid,status,closed:false,paths:[],api:[]};
  await context.addInitScript(({local,session,native})=>{
    if(!sessionStorage.getItem('__start-return-fixture-seeded')){
      localStorage.setItem('ox_device','start-return-fixture-device');localStorage.setItem('ox_paid','1');
      for(const [k,v] of Object.entries(local))localStorage.setItem(k,v);for(const [k,v]of Object.entries(session))sessionStorage.setItem(k,v);
      sessionStorage.setItem('__start-return-fixture-seeded','1');
    }
    if(native)window.Capacitor={isNativePlatform:()=>true,getPlatform:()=> 'android'};
    window.__startReturnQA={audio:[]};
    function recordAudio(value){window.__startReturnQA.audio.push(value);const history=JSON.parse(sessionStorage.getItem('__start-return-audio')||'[]');history.push(value);sessionStorage.setItem('__start-return-audio',JSON.stringify(history));}
    window.Audio=class{constructor(src){this.src=src||'';this.currentTime=0;this.paused=true;}play(){recordAudio(this.src);return Promise.reject(new Error('Audio forbidden in routing fixtures'));}pause(){this.paused=true;}load(){}removeAttribute(n){if(n==='src')this.src='';}};
    const synthesis={cancel(){},getVoices(){return[];},speak(u){recordAudio('browser:'+u.text);},addEventListener(){},removeEventListener(){}};
    Object.defineProperty(window,'speechSynthesis',{value:synthesis,configurable:true});window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};
    function inspect(){
      if(!/\/app\.html$/.test(location.pathname))return;const card=document.getElementById('card');if(!card||!card.getClientRects().length||getComputedStyle(card).visibility==='hidden')return;
      const r=card.getBoundingClientRect(),point=document.elementFromPoint(Math.min(innerWidth-1,r.left+r.width/2),Math.min(innerHeight-1,r.top+r.height/2));
      if(!point||!card.contains(point))return;
      const frames=JSON.parse(sessionStorage.getItem('__start-return-legacy-frames')||'[]');if(frames.length<6){frames.push({path:location.pathname,text:card.textContent.trim().slice(0,140)});sessionStorage.setItem('__start-return-legacy-frames',JSON.stringify(frames));}
    }
    const tick=()=>{inspect();requestAnimationFrame(tick);};requestAnimationFrame(tick);
  },{local,session,native});
  await context.route('**/*',async route=>{
    const req=route.request(),url=new URL(req.url());
    try{
      if(req.method()==='GET'&&url.origin==='https://fonts.googleapis.com'&&url.pathname==='/css2'){
        report.assetFixtures.push({resource:'Google Fonts stylesheet',response:'empty offline CSS; system font stack used'});
        return await route.fulfill({contentType:'text/css',body:'/* Explicit offline fixture: retain the local system font stack. */'});
      }
      const nativeCatalogue=native&&url.origin==='https://melunga.com'&&url.pathname==='/.netlify/functions/tts'&&url.searchParams.get('catalog')==='chirp3';
      if((url.origin!==ORIGIN&&!nativeCatalogue)||req.method()!=='GET'){report.unexpected.push({origin:url.origin,path:url.pathname,method:req.method()});return await route.abort();}
      if(url.pathname.startsWith('/.netlify/functions/')||url.pathname==='/api/geolocation'){
        const event={path:url.pathname,method:req.method()};f.api.push(event);report.api.push(event);
        if(url.pathname==='/.netlify/functions/check-status'){assert.equal(req.headers().authorization,undefined);assert.ok(url.searchParams.get('device_id'));return await route.fulfill({status:f.status,json:{paid:f.paid}});}
        if(url.pathname==='/.netlify/functions/get-pricing')return await route.fulfill({json:{country:'FR',monthlyDisplay:'7,90 €',annualDisplay:'42 €'}});
        if(url.pathname==='/api/geolocation')return await route.fulfill({json:{country:'FR'}});
        if(url.pathname==='/.netlify/functions/tts'&&url.searchParams.get('catalog')==='chirp3')return await route.fulfill({status:503,json:{error:'fixture_voice_catalogue_unavailable'}});
        report.unexpected.push(event);return await route.abort();
      }
      if(url.pathname==='/mobile-runtime.js'){
        report.assetFixtures.push({resource:'mobile-runtime.js',response:'empty web-container fixture; no native billing or account provider'});
        return await route.fulfill({contentType:'text/javascript',body:'/* Explicit ordinary-web fixture, matching the existing account-entry suites. */'});
      }
      const file=path.resolve(WEB,decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname).slice(1));
      if(!file.startsWith(WEB+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){report.unexpected.push({missingFile:url.pathname});return await route.fulfill({status:404,body:'Not found'});}
      return await route.fulfill({body:fs.readFileSync(file),contentType:{'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'}[path.extname(file)]||'application/octet-stream'});
    }catch(e){if(!f.closed)report.fixtureErrors.push(e.message);}
  });
  const page=f.page=await context.newPage();page.setDefaultTimeout(7000);page.on('pageerror',e=>report.errors.push(e.message));page.on('framenavigated',frame=>{if(frame===page.mainFrame())f.paths.push(new URL(frame.url()).pathname);});
  f.close=async()=>{f.closed=true;await context.close();};return f;
}
async function modern(f,pair,level){
  const p=f.page;await p.waitForURL(u=>u.pathname==='/parcours-niveaux.html',{timeout:12000});
  const url=new URL(p.url());assert.equal(url.searchParams.get('pair'),pair);assert.equal(url.searchParams.get('level'),String(level));
  await p.waitForFunction(({pair,level})=>{const s=window.MelungaMockup?.state();return s?.screen==='themes'&&s.pairId===pair&&s.level===level;},{pair,level},{timeout:20000});
  assert.equal(await p.locator('html').getAttribute('lang'),pair.split('-')[0]);assert.equal(await p.evaluate(()=>window.MelungaCourseAccess.state().paid),f.status===200&&f.paid===true);
  assert.deepEqual(await p.evaluate(()=>JSON.parse(sessionStorage.getItem('__start-return-audio')||'[]')),[],'no audio was played on any previous document');assert.deepEqual(await p.evaluate(()=>JSON.parse(sessionStorage.getItem('__start-return-legacy-frames')||'[]')),[],'no classic lesson is exposed during ordinary web start/return');
}
async function chooseLocale(p,locale){
  if(p.viewportSize().width>=960)await p.locator('.dh-language').selectOption(locale);
  else{await p.locator('[data-open-app-language]').click();await p.locator('[data-app-language="'+locale+'"]').click();}
}
async function premiumStart(f,{locale='en',study='es',plan='yearly'}={}){
  const p=f.page;await p.goto(ORIGIN+'/index.html?country=FR');await chooseLocale(p,locale);
  if(p.viewportSize().width>=960)await p.locator('[data-dh-plan="'+plan+'"]').first().click();
  else{await p.locator('[data-screen="welcome"].active [data-go="method"]').click();await p.locator('.proof-skip').click();}
  await p.locator('[data-screen="premium"].active').waitFor();await p.locator('[data-plan="'+plan+'"]').click();await p.locator('[data-start-trial]').click();
  await p.locator('[data-screen="language"].active').waitFor();await p.locator('[data-study-language="'+study+'"]').click();await p.locator('[data-launch-course]').click();
  await p.waitForURL(u=>u.pathname!=='/index.html');return locale+'-'+study;
}
async function shot(page,name){const file=path.join(CAPTURES,name+'.png');await page.screenshot({path:file,animations:'disabled'});report.screenshots.push(file);}
async function closeCheckout(f,capture=null){
  await f.page.locator('#paywall').waitFor({state:'visible'});if(capture)await shot(f.page,capture);await f.page.locator('#pwClose').click();
}
function pending(pair='en-es',level=2){return JSON.stringify({pair,level,nativeLanguage:pair.split('-')[0],studyLanguage:pair.split('-')[1],createdAt:Date.now()});}

test('premium choice carries its native course into the real account page and closing it returns to modern themes',()=>checked('premium-real-page-and-close',async()=>{
  for(const config of [{locale:'en',study:'es',width:390,plan:'yearly'},{locale:'en',study:'es',width:1366,plan:'monthly'},{locale:'zh',study:'fr',width:390,plan:'monthly'}]){
    const f=await fixture({width:config.width,local:pref(config.locale+'-'+config.study,2)});try{
      const pair=await premiumStart(f,config),url=new URL(f.page.url());assert.equal(url.pathname,'/app.html','billing/account shell is retained');assert.equal(url.searchParams.get('checkout'),config.plan==='yearly'?'annual':'monthly');
      assert.equal(url.searchParams.get('courseReturn'),pair,'premium start must retain a native course return, not just a classic study language');assert.equal(url.searchParams.get('courseLevel'),'1');
      await closeCheckout(f,config.locale==='en'&&config.width===390?'premium-en-es-before-close-390':null);await modern(f,pair,1);
      if(config.locale==='en')await shot(f.page,'modern-en-es-after-close-'+config.width);
      report.cases.push({name:'home-premium-close',...config,pair,paths:f.paths,allPostRequestsForbidden:true});
    }finally{await f.close();}
  }
}));

test('an already verified subscriber who chooses premium resumes the course without another checkout or login',()=>checked('already-paid-premium-entry',async()=>{
  for(const width of [390,1366]){
    const f=await fixture({paid:true,width,local:pref()});try{const pair=await premiumStart(f);await modern(f,pair,1);assert.ok(f.api.some(a=>a.path.endsWith('/check-status')),'server confirmation was exercised');report.cases.push({name:'verified-premium-start',pair,width,paths:f.paths,loginPosts:0,paymentPosts:0});}finally{await f.close();}
  }
  const f=await fixture({paid:true,local:pref('fr-it',1)});try{
    await f.page.goto(ORIGIN+'/app.html?login=1&lang=en&study=es&courseLevel=2');await modern(f,'en-es',2);
    report.cases.push({name:'legacy-login-without-return-parameters',pair:'en-es',level:2,paths:f.paths,loginPosts:0});
  }finally{await f.close();}
}));

test('bare classic welcome uses the saved native, study and level when the learner starts again',()=>checked('saved-bare-welcome-start',async()=>{
  for(const paid of [false,true]){
    const f=await fixture({paid,local:pref()});try{
      await f.page.goto(ORIGIN+'/app.html');
      await modern(f,'en-es',2);if(!paid)await shot(f.page,'modern-en-es-bare-resume-L2-390');
      report.cases.push({name:'saved-bare-app-start',paid,pair:'en-es',level:2,redirectsBeforeClassicWelcome:true,paths:f.paths});
    }finally{await f.close();}
  }
  const legacy=await fixture({local:{ox_nat:'en',ox_lang:'es'}});try{
    await legacy.page.goto(ORIGIN+'/app.html');await modern(legacy,'en-es',1);report.cases.push({name:'bare-app-legacy-language-preferences',pair:'en-es',level:1,paths:legacy.paths});
  }finally{await legacy.close();}
  const fresh=await fixture();try{
    await fresh.page.goto(ORIGIN+'/app.html');await fresh.page.waitForURL(u=>u.pathname==='/index.html');await fresh.page.locator('[data-screen="welcome"].active').waitFor();
    assert.equal(await fresh.page.locator('#card').count(),0);report.cases.push({name:'bare-app-without-course-opens-home-choice',paths:fresh.paths});
  }finally{await fresh.close();}
}));

test('incomplete old web-start links restore the saved native course rather than opening a classic/default lesson',()=>checked('incomplete-web-start',async()=>{
  for(const query of ['start=1','start=1&lang=en','start=1&lang=en&study=es&level=2']){
    const local=query.includes('study=es')?pref('fr-it',1):pref();
    const level=query.includes('level=2')?2:1;
    const f=await fixture({local});try{await f.page.goto(ORIGIN+'/app.html?'+query);await modern(f,'en-es',level);report.cases.push({name:'saved-web-start',query,pair:'en-es',level,paths:f.paths});}finally{await f.close();}
  }
}));

test('checkout return keeps its native pair and only server confirmation grants paid access',()=>checked('checkout-return-status',async()=>{
  for(const paid of [false,true]){
    const f=await fixture({paid,local:pref('fr-it',1),session:{'melunga-course-return':pending()}});try{
      await f.page.goto(ORIGIN+'/app.html');
      await modern(f,'en-es',2);
      assert.equal(await f.page.evaluate(()=>sessionStorage.getItem('melunga-course-return')),null,'the validated return token is consumed rather than replayed on later bare visits');
      await f.page.evaluate(values=>{for(const [key,value]of Object.entries(values))localStorage.setItem(key,value);},pref('it-ko',3));
      await f.page.goto(ORIGIN+'/app.html');await modern(f,'it-ko',3);
      report.cases.push({name:'pending-checkout-return',paid,pair:'en-es',level:2,conflictingLocalPreference:'fr-it L1',tokenConsumed:true,nextBareResumes:'it-ko L3',paths:f.paths,paymentNetworkUsed:false});
    }finally{await f.close();}
  }
  const f=await fixture({local:pref()});try{
    await f.page.goto(ORIGIN+'/app.html?start=1&checkout=annual&lang=en&study=es&courseReturn=en-es&courseLevel=2');await closeCheckout(f);await modern(f,'en-es',2);
    report.cases.push({name:'start-with-checkout-close',pair:'en-es',level:2,paths:f.paths});
  }finally{await f.close();}
  const old=await fixture({local:pref('fr-it',1)});try{
    await old.page.goto(ORIGIN+'/app.html?checkout=annual&lang=en&study=es&courseLevel=2');await closeCheckout(old);await modern(old,'en-es',2);
    report.cases.push({name:'legacy-checkout-without-return-parameters',pair:'en-es',level:2,paths:old.paths});
  }finally{await old.close();}
}));

test('returning to the language choice after closing checkout starts the same modern direction again',()=>checked('back-and-start-again',async()=>{
  const f=await fixture({width:390,local:pref()});try{
    await premiumStart(f);await closeCheckout(f);await modern(f,'en-es',1);await f.page.goBack();
    await f.page.waitForURL(u=>u.pathname==='/index.html');
    // History may restore the DOM from BFcache or rebuild the homepage. Both
    // user-visible forms must let the learner start the same chosen direction.
    if(!await f.page.locator('[data-screen="language"].active').isVisible())await f.page.locator('[data-select-access="free"]:visible').first().click();
    await f.page.locator('[data-screen="language"].active').waitFor();
    assert.equal(await f.page.locator('[data-study-language].selected').getAttribute('data-study-language'),'es');
    await f.page.locator('[data-launch-course]').click();
    await f.page.waitForURL(u=>u.pathname!=='/index.html');
    if(new URL(f.page.url()).pathname==='/app.html')await closeCheckout(f);
    await modern(f,'en-es',1);report.cases.push({name:'back-then-start-again',pair:'en-es',level:1,paths:f.paths});
  }finally{await f.close();}
}));

test('invalid and ambiguous old starts never invent a course, and explicit classic or native entries stay classic',()=>checked('invalid-and-explicit-classic',async()=>{
  const cases=[
    {query:'start=1&lang=en&lang=fr&study=es',kind:'duplicate-language'},
    {query:'start=1&lang=en&study=en',kind:'self-pair'},
    {query:'start=1&lang=pt&study=es',kind:'unknown-language'},
    {query:'start=1&level=invalid',kind:'invalid-level'},
    {query:'classic=1',kind:'explicit-classic'},
    {query:'',kind:'native-container',native:true}
  ];
  for(const config of cases){const f=await fixture({local:pref(),native:config.native});try{
    await f.page.goto(ORIGIN+'/app.html'+(config.query?'?'+config.query:''));
    await f.page.waitForFunction(()=>document.readyState==='complete'&&typeof window.isPaid==='boolean'&&window.isPaid===false);
    assert.equal(new URL(f.page.url()).pathname,'/app.html');assert.notEqual(await f.page.evaluate(()=>window.__courseStartRedirecting),true);
    assert.deepEqual(await f.page.evaluate(()=>JSON.parse(sessionStorage.getItem('__start-return-audio')||'[]')),[]);
    report.cases.push({name:'guarded-classic-entry',...config,paths:f.paths});
  }finally{await f.close();}}
}));
