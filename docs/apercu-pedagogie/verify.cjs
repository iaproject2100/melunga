/* Browser verification for the comparison preview only.
 * NODE_PATH exposes playwright-core. No live audio, account, payment or APK.
 */
'use strict';
const {chromium}=require('playwright-core');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../../melunga_deploy');
const output=process.env.SCREENSHOT_DIR||'/tmp/melunga-comparaison';
const prefix='/essais-progression/';
const order={
 zh:['zh-understand','zh-imitate','zh-received','zh-visible','zh-prepare-home','zh-substitute','zh-choice'],
 ko:['ko-understand','ko-imitate','ko-substitute','ko-greeting','ko-received','ko-visible','ko-choice']
};
const report={scope:'aperçu comparatif — anciens découpages conservés',viewports:[],audio:'simulation du texte et de la langue, sans validation vocale',errors:[],externalRequests:[],writeRequests:[]};
const tracked=['index.html','style.css','data.js','app.js'];
const hashes=()=>Object.fromEntries(tracked.map(name=>[name,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'essais-progression',name))).digest('hex')]));

(async()=>{
 const beforeFiles=hashes();
 const server=http.createServer((request,response)=>{
  let pathname=new URL(request.url,'http://local').pathname;
  if(pathname.endsWith('/'))pathname+='index.html';
  const file=path.resolve(root,'.'+pathname);
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){response.writeHead(404).end();return;}
  response.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml'})[path.extname(file)]||'text/html');
  fs.createReadStream(file).pipe(response);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
  fs.mkdirSync(output,{recursive:true});
  for(const [width,height] of [[320,568],[390,844],[1440,900]]){
   const context=await browser.newContext({viewport:{width,height},isMobile:width<1024,hasTouch:width<1024,reducedMotion:'reduce'});
   await context.addInitScript(()=>{
    window.__comparisonAudio=[];window.__comparisonStorageWrites=[];
    ['setItem','removeItem','clear'].forEach(name=>{
     const original=Storage.prototype[name];
     Storage.prototype[name]=function(...args){window.__comparisonStorageWrites.push({method:name,key:args[0]||''});return original.apply(this,args);};
    });
    speechSynthesis.cancel=()=>{};
    speechSynthesis.getVoices=()=>[];
    speechSynthesis.speak=utterance=>{window.__comparisonAudio.push({text:utterance.text,lang:utterance.lang});};
   });
   await context.route('**/*',route=>{
    const request=route.request(),url=new URL(request.url());
    if(!['GET','HEAD'].includes(request.method()))report.writeRequests.push({method:request.method(),path:url.pathname});
    if(url.origin!==base){report.externalRequests.push(url.origin+url.pathname);return route.abort();}
    return route.continue();
   });
   const page=await context.newPage();
   page.on('pageerror',error=>report.errors.push(error.message));
   await page.goto(base+prefix);
   await page.waitForFunction(()=>window.ProgressionPilotData&&document.querySelectorAll('.pilot-button').length===2);
   const initial=await page.evaluate(()=>JSON.stringify(window.ProgressionPilotData));
   const data=JSON.parse(initial);
   assert.equal(data.pilots.length,2);
   assert.equal(data.pilots.reduce((count,pilot)=>count+pilot.steps.length,0),14,'comparison retains fourteen steps');
   assert((await page.locator('meta[name="robots"]').getAttribute('content')).includes('noindex'),'preview remains excluded from search indexing');
   const rendered=[];
   async function shot(name){
    await page.evaluate(()=>document.fonts.ready);
    await page.evaluate(()=>window.scrollTo(0,0));
    await page.screenshot({path:path.join(output,name+'-'+width+'x'+height+'.png'),fullPage:true});
   }
   async function verifyStep(pilot,step,choice,hidden=false){
    const items=step.utterances.map(item=>item.kind==='learner'&&choice?choice.utterance:item);
    assert.equal(await page.locator('#step-count').textContent(),'Étape '+(pilot.steps.indexOf(step)+1)+' / 7');
    const cards=page.locator('#utterance-list > li');
    assert.equal(await cards.count(),items.length,step.id+': every original turn is rendered');
    for(let index=0;index<items.length;index++){
     const item=items[index],card=cards.nth(index);
     assert.equal(await card.getAttribute('data-utterance-id'),item.id);
     assert.equal(await card.getAttribute('data-kind'),item.kind);
     assert.equal(await card.locator('.utterance-role').textContent(),item.role);
     assert.equal(await card.locator(':scope > .native').textContent(),item.native,'source translation remains unchanged');
     if(hidden&&item.kind==='learner'){
      assert.equal(await card.locator('.study,.phonetic,.reading,.ear-button,.focus-brick').count(),0,'model and aids are absent from the recall DOM');
      assert(!(await card.textContent()).includes(item.study));
     }else{
      assert.equal(await card.locator(':scope > .study').textContent(),item.study);
      assert.equal(await card.locator(':scope > .phonetic-row > .phonetic').textContent(),item.phon);
      if(item.reading)assert.equal(await card.locator(':scope > .reading > .reading-text').textContent(),item.reading);
      const ear=card.locator(':scope > .phonetic-row > .ear-button');
      const bounds=await ear.boundingBox();
      assert(bounds&&bounds.width>=44&&bounds.height>=44,'ear remains a usable touch target');
      await ear.click();
      assert.deepEqual(await page.evaluate(()=>window.__comparisonAudio.at(-1)),{text:item.study,lang:pilot.pair.study==='zh'?'zh-CN':'ko-KR'},'ear reads exact source phrase in its studied language');
     }
     if(item.kind==='received')assert.equal(await card.locator('.received-badge').textContent(),'À comprendre','received role remains visible while the learner is recalled');
    }
    if(step.focusBrick&&!hidden){
     const support=page.locator('.focus-brick');
     assert.equal(await support.locator('.brick-study').textContent(),step.focusBrick.study);
     assert.equal(await support.locator('.brick-phonetic').textContent(),step.focusBrick.phon);
     await support.locator('.ear-button').click();
     assert.equal(await page.evaluate(()=>window.__comparisonAudio.at(-1).text),step.focusBrick.study,'support ear reads its own exact full group');
    }
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    assert(overflow<=1,step.id+': no horizontal overflow');
   }
   for(let pilotIndex=0;pilotIndex<data.pilots.length;pilotIndex++){
    const pilot=data.pilots[pilotIndex];
    assert.deepEqual(pilot.steps.map(step=>step.id),order[pilot.pair.study],'the differing historical orders remain intact');
    await page.locator('.pilot-button').nth(pilotIndex).click();
    for(let stepIndex=0;stepIndex<pilot.steps.length;stepIndex++){
     const step=pilot.steps[stepIndex];
     await verifyStep(pilot,step,step.choices?.[0]);
     if(['zh-visible','ko-greeting','ko-visible'].includes(step.id))await shot(step.id);
     if(step.id==='zh-understand')assert.equal(await page.locator('.phonetic').textContent(),'ouo chyang chyo chi','chyo source is retained, not silently amended');
     if(step.id==='ko-understand')assert.equal(await page.locator('.native').textContent(),'Je veux un café.','source register is unchanged for comparison');
     if(step.id==='ko-greeting')assert.equal(await page.locator('.utterance-role').textContent(),'Serveur','one server role is used consistently');
     if(step.recall){
      await page.locator('#recall-toggle').click();
      await verifyStep(pilot,step,step.choices?.[0],true);
      assert.equal(await page.locator('#novelty').textContent(),'','editorial text cannot disclose an answer in recall');
      assert.equal(await page.locator('.focus-brick').count(),0);
      for(const choice of step.choices||[]){
       await page.locator('#intention-choices button[data-choice-id="'+choice.id+'"]').click();
       assert.equal(await page.locator('#recall-toggle').getAttribute('aria-pressed'),'true','changing intention does not reveal the answer');
       await verifyStep(pilot,step,choice,true);
      }
      await shot(step.id+'-sans-modele');
      await page.locator('#recall-toggle').click();
      await verifyStep(pilot,step,step.choices?.at(-1));
     }
     rendered.push(step.id);
     if(stepIndex<pilot.steps.length-1)await page.locator('#next-step').click();
    }
    assert(await page.locator('#next-step').isDisabled(),'last comparison step grants no mastery or new access');
   }
   assert.equal(await page.evaluate(()=>JSON.stringify(window.ProgressionPilotData)),initial,'rendering, choices, audio and recall cannot rewrite the source data or order');
   assert.deepEqual(await page.evaluate(()=>window.__comparisonStorageWrites),[],'comparison never changes local/session storage');
   report.viewports.push({width,height,steps:rendered,sourceDataUnchanged:true,storageWrites:0,passed:true});
   await context.close();
  }
  assert.deepEqual(hashes(),beforeFiles,'verification cannot modify preview assets');
  assert.deepEqual(report.errors,[],'no JavaScript errors');
  assert.deepEqual(report.externalRequests,[],'comparison makes no external application requests');
  assert.deepEqual(report.writeRequests,[],'comparison makes no network writes');
  report.filesSha256=beforeFiles;
  fs.writeFileSync(path.join(output,'verification.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
