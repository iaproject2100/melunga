/* Classic lesson regressions for deferred rating, recognition and audio.
 * All media/native/network outcomes are fixtures; no live account or payment.
 * NODE_PATH must expose playwright-core; CHROMIUM_PATH is optional.
 */
'use strict';
const {chromium}=require('playwright-core');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..');
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const report={flows:[],errors:[]};

(async()=>{
 const server=http.createServer((request,response)=>{
  const file=path.resolve(root,'.'+new URL(request.url,'http://local').pathname);
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())return response.writeHead(404).end();
  response.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.json':'application/json'})[path.extname(file)]||'text/html');
  fs.createReadStream(file).pipe(response);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
  async function open(native=false){
   const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
   await context.route('**/*',route=>{
    const url=new URL(route.request().url());
    if(url.pathname.includes('/.netlify/'))return route.fulfill({json:{paid:false}});
    if(url.pathname.endsWith('/mobile-runtime.js'))return route.fulfill({contentType:'text/javascript',body:''});
    if(url.origin!==base)return route.abort();
    return route.continue();
   });
   await context.addInitScript(({native})=>{
    window.__recognitions=[];
    window.SpeechRecognition=function(){
     this.start=()=>window.__recognitions.push(this);
     this.abort=()=>{};
    };
    if(native){
     window.__nativeRequests=[];
     window.Capacitor={Plugins:{MelungaSpeech:{recognize(){return new Promise((resolve,reject)=>window.__nativeRequests.push({resolve,reject}));}}}};
    }
   },{native});
   const page=await context.newPage();
   page.on('pageerror',error=>report.errors.push(error.message));
   await page.goto(base+'/app.html?start=1&lang=fr&study=en');
   await page.waitForFunction(()=>typeof pool!=='undefined'&&pool.length&&window.MelungaL1Cafe);
   await pause(1100);
   await page.evaluate(()=>{setNat('fr');setLang('en');});
   return {page,context};
  }
  const snapshot=page=>page.evaluate(()=>({mode,lang,idx,length:pool.length,text:document.getElementById('fr').textContent,heard:document.getElementById('heard').textContent,revealed,
   notes:Object.fromEntries(Object.entries(localStorage).filter(([key])=>/^ox_(known|again)_|^melunga_srs/.test(key)))}));

  // Ordinary classification must still persist the original card.
  {
   const {page,context}=await open();
   const before=await page.evaluate(()=>({length:pool.length,key:lang+'|'+pool[idx].t,storage:'ox_known_'+lang}));
   await page.evaluate(()=>{window._navT=0;rateCard(true);});
   await pause(450);
   assert.equal(await page.evaluate(()=>pool.length),before.length-1,'normal classic rating removes one card');
   assert.equal(await page.evaluate(({storage,key})=>JSON.parse(localStorage.getItem(storage))[key],before),1,'normal classic rating persists the original phrase');
   report.flows.push('classic current rating still archives the original card');
   await context.close();
  }
  for(const change of ['language','rubric']){
   const {page,context}=await open();
   await page.evaluate(change=>{window._navT=0;rateCard(true);if(change==='language')setLang('es');else setMode('L1');},change);
   const afterChange=await snapshot(page);
   await pause(450);
   assert.deepEqual(await snapshot(page),afterChange,'pending classic rating cannot affect another classic '+change);
   report.flows.push('classic queued rating discarded after '+change+' change');
   await context.close();
  }

  // Browser recognition remains useful for the current card, not an obsolete one.
  {
   const {page,context}=await open();
   await page.evaluate(()=>{
    startSelfTest();startRec({stopPropagation(){}});
    const result=[{transcript:pool[idx].t}];result.isFinal=true;
    window.__recognitions.at(-1).onresult({results:[result]});
   });
   assert.equal(await page.evaluate(()=>revealed),true,'matching current browser recognition still reveals the classic card');
   assert.equal(await page.evaluate(()=>document.getElementById('fr').textContent===pool[idx].t),true);
   await page.evaluate(()=>{
    startSelfTest();startRec({stopPropagation(){}});
    window.__obsoleteRecognition=__recognitions.at(-1);window.__obsoleteText=pool[idx].t;
    setLang('es');
   });
   const afterChange=await snapshot(page),count=await page.evaluate(()=>__recognitions.length);
   await page.evaluate(()=>{
    const result=[{transcript:__obsoleteText}];result.isFinal=true;
    __obsoleteRecognition.onresult({results:[result]});
    __obsoleteRecognition.onerror({error:'no-speech'});
    __obsoleteRecognition.onend();
   });
   await pause(300);
   assert.deepEqual(await snapshot(page),afterChange,'obsolete browser callbacks cannot reveal or grade another classic card');
   assert.equal(await page.evaluate(()=>__recognitions.length),count,'obsolete browser error cannot restart recognition');
   report.flows.push('browser current result works; stale result/error/end are ignored on classic language change');
   await context.close();
  }
  {
   const {page,context}=await open();
   await page.evaluate(()=>{startSelfTest();startRec({stopPropagation(){}});__recognitions.at(-1).onerror({error:'no-speech'});});
   await pause(300);
   assert.equal(await page.evaluate(()=>__recognitions.length),2,'current no-speech still retries once');
   await page.evaluate(()=>{setLang('zh');startSelfTest();startRec({stopPropagation(){}});__recognitions.at(-1).onerror({error:'language-not-supported'});setLang('es');});
   const count=await page.evaluate(()=>__recognitions.length),afterChange=await snapshot(page);
   await pause(250);
   assert.equal(await page.evaluate(()=>__recognitions.length),count,'scheduled Chinese pack retry cannot restart after changing language');
   assert.deepEqual(await snapshot(page),afterChange);
   report.flows.push('current silence retry works; scheduled Chinese retry is cancelled on classic language change');
   await context.close();
  }

  // Native adapter tested with deferred promises, without a device or microphone.
  {
   const {page,context}=await open(true);
   await page.evaluate(()=>{startSelfTest();window.__pendingRecognition=startRec();});
   await page.evaluate(async()=>{__nativeRequests.at(-1).resolve({matches:[pool[idx].t]});await __pendingRecognition;});
   assert.equal(await page.evaluate(()=>revealed),true,'matching current native result still reveals the classic card');
   await page.evaluate(()=>{startSelfTest();window.__nativeText=pool[idx].t;window.__pendingRecognition=startRec();setLang('es');});
   const afterChange=await snapshot(page);
   await page.evaluate(async()=>{__nativeRequests.at(-1).resolve({matches:[__nativeText]});await __pendingRecognition;});
   assert.deepEqual(await snapshot(page),afterChange,'obsolete native result and finally cannot modify another classic card');
   report.flows.push('native simulated current result works; obsolete result is discarded on classic language change');
   await context.close();
  }

  async function audioFixture(page,voicesReady=true){
   await page.evaluate(voicesReady=>{
    cancelCurrentSpeech();window.__audioPlayed=[];window.__systemSpoken=[];
    window.Audio=function(){this.src='';this.pause=()=>{};this.load=()=>{};this.removeAttribute=()=>{};this.play=()=>{window.__audioPlayed.push(this.src);return {catch:failure=>{this.fail=failure;}};};};
    window.SpeechSynthesisUtterance=function(text){this.text=text;};
    Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{cancel(){},speak(utterance){window.__systemSpoken.push(utterance.text);},getVoices(){return voicesReady?[{name:'Fixture',lang:'en-US'}]:[];}}});
    speechPreloads={};speechPreloadOrder=[];deadVoice={};_audioUnlocked=true;
    VOICES[lang][gender]=['fixture-first','fixture-second'];
   },voicesReady);
  }
  {
   const {page,context}=await open();await audioFixture(page);
   const expected=await page.evaluate(()=>clean(pool[idx].t));
   await page.evaluate(()=>{playCurrent();curAudio.onerror();});
   const played=await page.evaluate(()=>__audioPlayed);
   assert.equal(played.length,2,'current audio failure still tries the next voice');
   assert(new URL(played[0]).searchParams.get('voice')==='fixture-first');
   assert(new URL(played[1]).searchParams.get('voice')==='fixture-second');
   await page.evaluate(()=>curAudio.onerror());
   assert.deepEqual(await page.evaluate(()=>__systemSpoken),[expected],'current exhausted voices still fall back to the system speech');
   report.flows.push('classic current audio tries the second voice then system fallback');
   await context.close();
  }
  {
   const {page,context}=await open();await audioFixture(page);
   await page.evaluate(()=>{playCurrent();window.__obsoleteAudioError=curAudio.onerror;window.__obsoleteAudioReject=curAudio.fail;window._navT=0;next();playCurrent();});
   const played=await page.evaluate(()=>__audioPlayed.slice());
   assert.equal(played.length,2,'new classic card starts one requested reading');
   await page.evaluate(()=>{__obsoleteAudioError();__obsoleteAudioReject();});
   assert.deepEqual(await page.evaluate(()=>__audioPlayed),played,'obsolete classic audio cannot retry over the newly requested card');
   assert.deepEqual(await page.evaluate(()=>__systemSpoken),[]);
   report.flows.push('classic obsolete media failure cannot restart over the current reading');
   await context.close();
  }
  {
   const {page,context}=await open();await audioFixture(page,false);
   await page.evaluate(()=>{VOICES[lang][gender]=[];playCurrent();window._navT=0;next();playCurrent();});
   const expected=await page.evaluate(()=>clean(pool[idx].t));
   await pause(1550);
   assert.deepEqual(await page.evaluate(()=>__systemSpoken),[expected],'delayed system voice reads only the latest classic card');
   report.flows.push('classic delayed fallback remains usable and ignores the preceding request');
   await context.close();
  }
  assert.deepEqual(report.errors,[],'no browser errors');
  console.log(JSON.stringify(report,null,2));
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
