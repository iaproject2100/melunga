/* Actual lesson integration, local fixtures only. No account/payment is made.
 * NODE_PATH=/tmp/melunga-review-tools/node_modules node tests/l1-cafe.test.cjs
 */
'use strict';
const {chromium}=require('playwright-core');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const repository=path.dirname(root);
const data=JSON.parse(fs.readFileSync(path.join(root,'content/l1-cafe.json'),'utf8'));
const output=process.env.SCREENSHOT_DIR;
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const report={pairs:[],steps:0,errors:[],flows:[]};

function protectCanonicalContent(){
 const baseline=execFileSync('git',['show','origin/main:melunga_deploy/app.html'],{cwd:repository,encoding:'utf8',maxBuffer:32*1024*1024});
 const current=fs.readFileSync(path.join(root,'app.html'),'utf8');
 for(const name of ['DECKS','PEDAGOGY_FAMILIES']){
  const line=text=>text.split('\n').find(row=>row.startsWith('var '+name+' = '));
  assert(line(baseline),'baseline defines '+name);
  assert.equal(line(current),line(baseline),name+' stays byte-for-byte identical to production');
 }
 const free=text=>text.match(/var FREE_LV\s*=\s*\[[^\]]*\]/)[0];
 assert.equal(free(current),free(baseline),'classic free levels are unchanged');
}

(async()=>{
 protectCanonicalContent();
 const server=http.createServer((request,response)=>{
  const file=path.resolve(root,'.'+new URL(request.url,'http://local').pathname);
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())return response.writeHead(404).end();
  response.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml'})[path.extname(file)]||'text/html');
  fs.createReadStream(file).pipe(response);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
  async function open(pair,width=390,height=844,options={}){
   const context=await browser.newContext({viewport:{width,height},isMobile:width<1000,hasTouch:width<1000,reducedMotion:'reduce'});
   const fixture={bundleRequests:0,bundleFailure:options.bundleFailure||null,hold:false,held:[],api:[]};
   await context.route('**/*',async route=>{
    const request=route.request(),url=new URL(request.url());
    if(url.pathname.includes('/.netlify/')){
     fixture.api.push(url.pathname);
     return route.fulfill({json:url.pathname.endsWith('/get-pricing')?{monthlyDisplay:'7,90 €',annualDisplay:'42 €'}:{paid:false}});
    }
    if(url.pathname.endsWith('/mobile-runtime.js'))return route.fulfill({contentType:'text/javascript',body:''});
    // Exercise the shipped owner-selected release artifact without overriding it.
    if(url.origin!==base)return route.abort();
    if(url.pathname.endsWith('/content/l1-cafe.json')){
     fixture.bundleRequests++;
     if(fixture.hold)await new Promise(resolve=>fixture.held.push(resolve));
     if(fixture.bundleFailure==='missing')return route.fulfill({status:503,body:'unavailable'});
     if(fixture.bundleFailure==='corrupt')return route.fulfill({json:{version:1,pairs:[]}});
    }
    return route.continue();
   });
   if(options.nativeRecognition)await context.addInitScript(()=>{
    window.__nativeCalls=0;
    window.Capacitor={Plugins:{MelungaSpeech:{recognize(){window.__nativeCalls++;return new Promise(resolve=>{window.__resolveNative=resolve;});}}}};
   });
   if(options.blockStorage)await context.addInitScript(()=>{
    Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Storage blocked','SecurityError');}});
   });
   const page=await context.newPage();
   page.on('pageerror',error=>report.errors.push(error.message));
   await page.goto(base+'/app.html?start=1&lang='+pair.nativeLanguage+'&study='+pair.studyLanguage);
   await page.waitForFunction(()=>window.MelungaL1Cafe&&typeof pool!=='undefined'&&pool.length);
   await pause(1000); // Existing entry bridge applies the selected target at 700 ms.
   await page.evaluate(({nativeLanguage,studyLanguage})=>{setNat(nativeLanguage);setLang(studyLanguage);window.__cafeAudio=[];window.__realCafeSpeak=window.speak;window.speak=(text)=>window.__cafeAudio.push(text);},pair);
   return {page,context,fixture};
  }
  async function start(page){
   await page.evaluate(()=>setMode('l1-cafe'));
   await page.waitForFunction(()=>{const s=MelungaL1Cafe.state();return MelungaL1Cafe.active()&&!s.loading&&!s.error&&s.total>0;});
  }
  const store=page=>page.evaluate(()=>{
   try{return Object.fromEntries(Object.entries(localStorage).filter(([key])=>/^(ox_(known|again|paid)|melunga_srs|.*(entitlement|access_token|session_token))/.test(key)));}catch(_error){return {blocked:true};}
  });
  const state=page=>page.evaluate(()=>MelungaL1Cafe.state());
  async function snapshot(page){
   return page.evaluate(()=>{
    const text=id=>{const node=document.getElementById(id);return node?node.textContent:'';};
    const visible=id=>{const node=document.getElementById(id);if(!node)return false;const r=node.getBoundingClientRect(),s=getComputedStyle(node);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none';};
    return {study:text('fr'),phon:text('phon'),native:text('cn'),reading:text('l1CafeReading'),role:text('l1CafeRole'),phase:text('l1CafePhase'),instruction:text('l1CafeInstruction'),reveal:visible('l1CafeReveal'),peek:text('peek'),immchip:text('immchip'),width:innerWidth,pageWidth:document.documentElement.scrollWidth,cardText:document.getElementById('card').textContent,audio:window.__cafeAudio.slice()};
   });
  }
  function expectedSteps(pair){
   const steps=pair.preparation.map(step=>({id:step.utterance,phase:step.kind,hidden:false}));
   for(const pass of pair.steps)for(const id of pass.turns)steps.push({id,phase:pass.kind,hidden:pass.kind==='reply-without-model'&&pair.phrases.find(p=>p.id===id).kind==='learner'});
   return steps;
  }
  async function screen(page,name){
   if(!output)return;
   fs.mkdirSync(output,{recursive:true});
   await page.screenshot({path:path.join(output,name+'.png'),animations:'disabled'});
  }
  async function controlsFit(page){
   const rects=await page.evaluate(()=>{
    function rect(node){const r=node.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};}
    return ['rateAgainLabel','rateKnownLabel'].map(id=>{const label=document.getElementById(id);return {id,label:rect(label),button:rect(label.closest('button')),viewport:{width:innerWidth,height:innerHeight}};});
   });
   for(const entry of rects){
    const {label,button,viewport}=entry;
    assert(button.width>=44&&button.height>=44,'44px bottom action target: '+JSON.stringify(entry));
    assert(button.left>=-1&&button.right<=viewport.width+1&&button.top>=-1&&button.bottom<=viewport.height+1,'bottom action stays in viewport: '+JSON.stringify(entry));
    assert(label.left>=button.left-1&&label.right<=button.right+1,'bottom label fits its own button: '+JSON.stringify(entry));
   }
   assert(rects[0].label.right<=rects[1].label.left-4,'bottom action labels never overlap');
  }
  async function exactPhrase(page,pair,step){
   const phrase=pair.phrases.find(p=>p.id===step.id),s=await state(page),view=await snapshot(page);
   const ear=page.locator('#card .phonrow .earicon');
   assert.equal(s.currentPhraseId,step.id,'source utterance selected');
   assert.equal(s.hidden,step.hidden,'only learner in final pass starts hidden');
   assert.equal(view.native,phrase.native,'native intention copied exactly');
   assert.equal(view.study,step.hidden?'':phrase.study,'study text exact or removed for recall');
   assert.equal(view.phon,step.hidden?'':phrase.phon,'phonetic aid exact or removed for recall');
   assert.equal(view.reading,step.hidden?'':(phrase.reading||''),'original reading exact or absent');
   assert(view.pageWidth<=view.width+1,'actual lesson does not overflow horizontally');
   await controlsFit(page);
   assert(await ear.isVisible(),'ear remains accessible on every active dialogue phrase');
   assert.equal(await ear.evaluate(node=>node.tagName),'BUTTON','active ear uses native button keyboard semantics');
   const earBox=await ear.boundingBox();
   assert(earBox&&earBox.width>=44&&earBox.height>=44,'ear has a 44px listening target');
   if(phrase.kind==='received'){
    assert(!s.hidden,'received never hidden');
    assert(!view.reveal,'received never needs learner model reveal');
    assert(!/À toi de parler|轮到你说/.test(view.phase),'received heading never assigns learner production');
    assert(/comprends|听懂/.test(view.instruction),'received instruction explicitly asks for comprehension');
    assert(!/répète|imite|à toi|repeat|imitate/i.test(view.instruction.replace(/Tu n’as pas à répéter sa phrase\./,'')),'received never asks for production');
    await ear.click();
    assert.equal((await snapshot(page)).audio.at(-1),phrase.study,'received ear reads the exact server phrase');
    assert.equal((await state(page)).stepIndex,s.stepIndex,'received listening does not advance or change the turn');
    assert.equal((await snapshot(page)).reveal,false,'received listening never creates a learner model prompt');
   }
   if(step.hidden){
    assert(view.reveal,'help can be restored');
    assert(!view.peek.includes(phrase.study),'peek does not disclose the learner answer');
    assert(!view.immchip.includes(phrase.study),'immersive chip does not disclose learner answer');
    const before=view.audio.length;
    await page.evaluate(()=>playCurrent());
    assert.equal((await snapshot(page)).audio.length,before,'implicit listening never discloses a hidden learner answer');
    assert.equal((await state(page)).hidden,true,'implicit listening never restores the model');
    await ear.click();
    const earHelp=await snapshot(page);
    assert.equal((await state(page)).hidden,false,'explicit ear is a request to restore help');
    assert.equal(earHelp.study,phrase.study,'ear assistance restores exact study text');
    assert.equal(earHelp.phon,phrase.phon,'ear assistance restores exact phonetic aid');
    assert.equal(earHelp.reading,phrase.reading||'','ear assistance restores the optional original reading');
    assert.equal(earHelp.audio.length,before+1,'explicit ear triggers one listening request');
    assert.equal(earHelp.audio.at(-1),phrase.study,'ear assistance reads the study text, never phonetics');
    await page.locator('#l1CafeReveal').click();
    assert.equal((await state(page)).hidden,true,'model can be hidden again after ear assistance');
    assert.equal((await snapshot(page)).study,'','hiding help clears the source text again');
    assert.equal((await snapshot(page)).phon,'','hiding help clears the phonetic aid again');
    assert.equal((await snapshot(page)).reading,'','hiding help clears the reading again');
    await ear.focus();
    await page.keyboard.press('Enter');
    assert.equal((await state(page)).hidden,false,'keyboard activation of the ear restores the model');
    assert.equal((await snapshot(page)).audio.at(-1),phrase.study,'keyboard ear reads exact source text');
    await page.locator('#l1CafeReveal').click();
    assert.equal((await state(page)).hidden,true,'keyboard help can also be hidden again');
    await page.locator('#l1CafeReveal').click();
    const helped=await snapshot(page);
    assert.equal(helped.study,phrase.study,'help restores the exact original phrase');
    assert.equal(helped.phon,phrase.phon,'help restores phonetics verbatim');
    assert.equal(helped.reading,phrase.reading||'','help restores optional original reading');
   }
   await page.evaluate(()=>playCurrent());
   assert.equal((await snapshot(page)).audio.at(-1),phrase.study,'audio uses exact study text, never phonetic spelling');
  }
  for(const [width,height] of [[390,844],[1440,900]]){
   for(const pair of data.pairs){
    const {page,context,fixture}=await open(pair,width,height);
    const before=await store(page);
    assert.equal(await page.locator('#l1CafeEntry,[data-l1-cafe-entry]').count(),1,'entry exists in real lesson menu for '+pair.id);
    if(pair.id===data.pairs[0].id){
     await page.locator('#selRb').click();
     await page.locator('#l1CafeEntry').waitFor({state:'visible'});
     await screen(page,`cafe-menu-${width}`);
     await page.locator('#l1CafeEntry').click();
     await page.waitForFunction(()=>MelungaL1Cafe.active()&&MelungaL1Cafe.state().total===32);
    }else await start(page);
    const steps=expectedSteps(pair);
    assert.equal((await state(page)).total,steps.length);
    for(let i=0;i<steps.length;i++){
     assert.equal((await state(page)).stepIndex,i);
     if(i===25&&pair.id==='fr-zh')await screen(page,`cafe-${pair.id}-${width}-hidden`);
     await exactPhrase(page,pair,steps[i]);
     if(i===0&&['fr-zh','fr-ko'].includes(pair.id))await screen(page,`cafe-${pair.id}-${width}-preparation`);
     if(i===26&&pair.id==='fr-zh')await screen(page,`cafe-${pair.id}-${width}-received`);
     await page.evaluate(()=>next());
     report.steps++;
    }
    assert.equal((await state(page)).complete,true,'sequence reaches a bounded completion');
    await controlsFit(page);
    await page.evaluate(()=>next());
    assert.equal((await state(page)).complete,true,'completion does not wrap into an unprepared phrase');
    assert.deepEqual(await store(page),before,'no SRS, known/again, paid or session state is written by sequence');
    assert.equal(fixture.api.filter(p=>/login|payment|replace/.test(p)).length,0,'no account/payment requests');
    await page.evaluate(()=>setMode('all'));
    assert.equal(await page.evaluate(()=>MelungaL1Cafe.active()),false);
    assert.equal(await page.evaluate(()=>mode),'all');
    assert.equal(await page.locator('#card .phonrow .earicon').evaluate(node=>node.tagName),'SPAN','leaving the sequence restores the original classic ear element');
    assert(await page.evaluate(()=>pool.length>0&&document.getElementById('fr').textContent===pool[idx].t),'classic lesson restored');
    await page.evaluate(()=>setMode('L2'));
    await page.locator('#paywall').waitFor({state:'visible'});
    assert.equal(await page.evaluate(()=>isPaid),false,'L2 still requires access');
    await page.evaluate(()=>hidePaywall());
    report.pairs.push({id:pair.id,width,height,steps:steps.length});
    console.log(`PASS ${pair.id} ${width}×${height}: ${steps.length} exact-source steps, received, hidden/reveal, audio, no credit, exit and L2 gate`);
    await context.close();
   }
  }

  // Real mobile gestures use the same player dispatch as the visible buttons.
  {
   const {page,context}=await open(data.pairs[1]);
   await start(page);
   const before=await store(page);
   const client=await context.newCDPSession(page);
   const card=await page.locator('#card').boundingBox();
   const y=Math.min(card.y+card.height*.7,730),x=card.x+card.width*.35;
   await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
   for(let n=1;n<=5;n++)await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+110*n/5,y}]});
   await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   await pause(450);await client.detach();
   assert.equal((await state(page)).stepIndex,1,'real horizontal touch advances instead of rating');
   await page.evaluate(()=>rateCard(false));
   assert.deepEqual(await store(page),before,'negative gesture never puts a bridge in again');
   await page.evaluate(()=>prev());
   assert((await state(page)).stepIndex>=0,'back navigation stays bounded');
   await page.evaluate(()=>setLang('zh'));
   assert.equal(await page.evaluate(()=>MelungaL1Cafe.active()),false,'target change exits the old scene');
   await start(page);
   assert((await state(page)).currentPhraseId.includes('fr-zh'),'new pair loads its own sources');
   await page.evaluate(()=>{for(let n=0;n<25;n++)next();});
   assert.equal((await state(page)).hidden,true);
   const maskedStep=(await state(page)).stepIndex;
   await page.evaluate(()=>showPaywall());
   await page.locator('#paywall').waitFor({state:'visible'});
   for(const key of ['ArrowDown','ArrowUp','ArrowRight','ArrowLeft','Space'])await page.keyboard.press(key);
   assert.equal((await state(page)).stepIndex,maskedStep,'account form isolates the new sequence keyboard');
   await page.evaluate(()=>hidePaywall());
   assert.equal((await state(page)).hidden,true,'account close keeps learner answer masked');
   assert.equal((await snapshot(page)).study,'');
   await page.evaluate(()=>setNat('en')); // Not an activated bridge pair.
   assert.equal(await page.evaluate(()=>MelungaL1Cafe.available(nat,lang)),false);
   assert.equal(await page.locator('#l1CafeEntry,[data-l1-cafe-entry]').count(),0,'unsupported reader pair is not offered');
   assert.equal(await page.evaluate(()=>MelungaL1Cafe.active()),false);
   report.flows.push('gesture dispatch, bounds, target/reader exit, exact pair allowlist');
   await context.close();
  }
  // A locked-level selection exits the sequence without leaving its answer on screen.
  {
   const {page,context}=await open(data.pairs[0]);
   const classic=await page.evaluate(()=>({t:pool[idx].t,count:pool.length,rateAgain:document.getElementById('rateAgainLabel').textContent}));
   await start(page);await page.evaluate(()=>{for(let n=0;n<25;n++)next();});
   assert.equal((await state(page)).hidden,true);
   await page.evaluate(()=>setMode('L2'));
   await page.locator('#paywall').waitFor({state:'visible'});
   assert.equal(await page.evaluate(()=>MelungaL1Cafe.active()),false);
   await page.evaluate(()=>hidePaywall());
   assert.equal(await page.locator('#fr').textContent(),classic.t,'locked-level exit restores classic source text');
   assert.equal(await page.evaluate(()=>pool.length),classic.count,'locked-level exit restores classic pool');
   assert.equal(await page.locator('#rateAgainLabel').textContent(),classic.rateAgain,'classic rating label restored');
   report.flows.push('direct locked-level exit restores original lesson and controls');
   await context.close();
  }
  // A classic card rating queued before entry must not grade a source phrase.
  {
   const {page,context}=await open(data.pairs[0]);
   const before=await store(page);
   await page.evaluate(()=>{rateCard(true);setMode('l1-cafe');});
   await page.waitForFunction(()=>MelungaL1Cafe.active()&&MelungaL1Cafe.state().total===32);
   await pause(450);
   assert.equal((await state(page)).stepIndex,0);
   assert.deepEqual(await store(page),before,'stale classic animation never rates bridge data');
   report.flows.push('queued classic rating discarded on café entry');
   await context.close();
  }
  // Exercise the real speech retry/fallback code with controllable audio promises.
  {
   const {page,context}=await open(data.pairs[0]);await start(page);
   await page.evaluate(()=>{
    window.speak=window.__realCafeSpeak;window.__audioPlayed=[];window.__systemSpoken=[];
    window.Audio=function(){this.src='';this.pause=function(){};this.load=function(){};this.removeAttribute=function(){};this.play=function(){window.__audioPlayed.push(this.src);return {catch:failure=>{this.fail=failure;}};};};
    Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{cancel(){},speak(u){window.__systemSpoken.push(u.text);},getVoices(){return [];}}});
    speechPreloads={};speechPreloadOrder=[];deadVoice={};_audioUnlocked=true;
    VOICES[lang][gender]=['fixture-first','fixture-second'];
    playCurrent();window.__staleAudioError=curAudio.onerror;window.__staleAudioReject=curAudio.fail;
   });
   assert.equal(await page.evaluate(()=>__audioPlayed.length),1);
   await page.evaluate(()=>{next();__staleAudioError();__staleAudioReject();});
   assert.equal(await page.evaluate(()=>__audioPlayed.length),1,'late media failure cannot retry the previous phrase');
   await page.evaluate(()=>{fallback('OBSOLETE PHRASE',speechGeneration);next();});
   await pause(1500);
   assert.deepEqual(await page.evaluate(()=>__systemSpoken),[],'delayed fallback cannot speak after moving to another step');
   report.flows.push('real delayed audio retry and fallback cancelled across steps');
   await context.close();
  }
  {
   const {page,context}=await open(data.pairs[0],390,844,{nativeRecognition:true});
   await page.evaluate(()=>{window.__pendingRecognition=startRec();});
   assert.equal(await page.evaluate(()=>__nativeCalls),1,'native recognition fixture is installed');
   await start(page);
   await page.evaluate(async()=>{__resolveNative({matches:['Hello!']});await __pendingRecognition;});
   assert.equal((await state(page)).stepIndex,0,'late native recognition cannot alter café progression');
   await page.evaluate(()=>startRec());
   assert.equal(await page.evaluate(()=>__nativeCalls),1,'received/learner café steps do not launch native grading');
   assert.equal(await page.locator('#heard').textContent(),'','stale native result cannot publish a score in the new lesson');
   report.flows.push('simulated native recognition result discarded and grading blocked in café');
   await context.close();
  }
  for(const failure of ['missing','corrupt']){
   const {page,context,fixture}=await open(data.pairs[0],390,844,{bundleFailure:failure});
   await page.evaluate(()=>setMode('l1-cafe'));
   await page.waitForFunction(()=>Boolean(MelungaL1Cafe.state().error));
   await page.locator('#l1CafeRetry').waitFor({state:'visible'});
   fixture.bundleFailure=null;
   await page.locator('#l1CafeRetry').click();
   await page.waitForFunction(()=>{const s=MelungaL1Cafe.state();return !s.loading&&!s.error&&s.total===32;});
   await page.locator('#l1CafeExit').click();
   assert.equal(await page.evaluate(()=>MelungaL1Cafe.active()),false,'error/retry flow can exit to reserve');
   assert.equal(await page.evaluate(()=>mode),'all');
   report.flows.push(failure+' bundle fails safely, retries, exits');
   await context.close();
  }
  // Slow requests cannot resurrect a scene after the learner changes language.
  {
   const {page,context,fixture}=await open(data.pairs[0]);fixture.hold=true;
   await page.evaluate(()=>setMode('l1-cafe'));
   await page.waitForFunction(()=>MelungaL1Cafe.state().loading);
   await page.evaluate(()=>setLang('ko'));
   fixture.hold=false;fixture.held.splice(0).forEach(resolve=>resolve());
   await pause(250);
   assert.equal(await page.evaluate(()=>MelungaL1Cafe.active()),false);
   assert.equal(await page.evaluate(()=>mode),'all');
   assert(await page.evaluate(()=>document.getElementById('fr').textContent===pool[idx].t),'late data does not overwrite current classic card');
   report.flows.push('late fetch discarded after target change');
   await context.close();
  }
  {
   const {page,context}=await open(data.pairs[0],320,568,{blockStorage:true});
   await start(page);
   await exactPhrase(page,data.pairs[0],expectedSteps(data.pairs[0])[0]);
   await page.evaluate(()=>next());
   assert.equal((await state(page)).stepIndex,1,'sequence works when browser storage is blocked');
   report.flows.push('320 px and blocked storage');
   await screen(page,'cafe-fr-en-320-blocked-storage');
   await context.close();
  }
  assert.deepEqual(report.errors,[],'no browser page errors');
  console.log(JSON.stringify(report,null,2));
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
