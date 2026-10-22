/* Per-language release controls in the real lesson player, local fixtures only.
 * NODE_PATH=/tmp/melunga-review-tools/node_modules node tests/l1-cafe-release.test.cjs
 * CHROMIUM_PATH overrides the local Chromium executable.
 * Fixture activation is not native review or publication approval.
 */
'use strict';
const {chromium}=require('playwright-core');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const repository=path.dirname(root);
const bundle=JSON.parse(fs.readFileSync(path.join(root,'content/l1-cafe.json'),'utf8'));
const pairIds=bundle.pairs.map(pair=>pair.id);
const releasePath=path.join(root,'l1-cafe-release.js');
const reportPath=path.join(repository,'docs/integration-ponts-L1/activation-instruction/tests-navigateur.json');
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const report={version:1,status:'running',scope:'local-browser-delivered-owner-activation-and-reversible-fixtures',baseline:execFileSync('git',['rev-parse','HEAD'],{cwd:repository,encoding:'utf8'}).trim(),
 publicationPerformed:false,nativeReviewClaimed:false,shippedActivationFixtureModified:false,
 limitations:['Chromium with mobile viewport/touch emulation; no physical device or native app execution.','mobile-runtime.js is neutralized by a local fixture, matching the integration harness.','Speech is spied to check the exact study-text argument; actual sound output is not assessed.'],
 shippedReleaseSha256Before:hash(releasePath),bundlePairs:pairIds,
 scenarios:[],browserErrors:[],accountOrPaymentRequests:[],cafeStepsChecked:0,directStartRefusals:0,indirectEntryRefusals:0};

(async()=>{
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
  assert.equal(pairIds.length,7,'the actual bundle still contains seven scenes');
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
  async function open(width,height,fixture){
   const context=await browser.newContext({viewport:{width,height},isMobile:width<1000,hasTouch:width<1000,reducedMotion:'reduce'});
   const requests={release:0,bundle:0};
   await context.route('**/*',async route=>{
    const request=route.request(),url=new URL(request.url());
    if(url.pathname.includes('/.netlify/')){
     if(/login|payment|replace|register|signup|checkout/.test(url.pathname))report.accountOrPaymentRequests.push(url.pathname);
     return route.fulfill({json:url.pathname.endsWith('/get-pricing')?{monthlyDisplay:'7,90 €',annualDisplay:'42 €'}:{paid:false}});
    }
    if(url.origin!==base)return route.abort();
    if(url.pathname.endsWith('/mobile-runtime.js'))return route.fulfill({contentType:'text/javascript',body:''});
    if(url.pathname.endsWith('/l1-cafe-release.js')){
     requests.release++;
     if(fixture&&fixture.missing)return route.fulfill({contentType:'text/javascript',body:'/* Deliberately absent test fixture. */'});
     if(fixture)return route.fulfill({contentType:'text/javascript',body:'window.MelungaL1CafeRelease='+JSON.stringify(fixture.value)+';'});
    }
    if(url.pathname.endsWith('/content/l1-cafe.json'))requests.bundle++;
    return route.continue();
   });
   const page=await context.newPage();
   page.on('pageerror',error=>report.browserErrors.push(error.message));
   await page.goto(base+'/app.html?start=1&lang=fr&study=en');
   await page.waitForFunction(()=>window.MelungaL1Cafe&&typeof pool!=='undefined'&&pool.length);
   await pause(1000); // Existing entry bridge applies the requested target at 700 ms.
   await page.evaluate(()=>{window.__releaseAudio=[];window.speak=text=>window.__releaseAudio.push(text);});
   assert.equal(requests.release,1,'real page loads the release artifact exactly once');
   const order=await page.evaluate(()=>Array.from(document.scripts).map(node=>new URL(node.src||location.href).pathname));
   const releaseIndex=order.findIndex(src=>src.endsWith('/l1-cafe-release.js'));
   assert(releaseIndex>=0&&releaseIndex<order.findIndex(src=>src.endsWith('/l1-cafe.js')),'release script loads before the player');
   return {context,page,requests};
  }
  async function select(page,pair,paid){
   await page.evaluate(({nativeLanguage,studyLanguage,paid})=>{
    setNat(nativeLanguage);setLang(studyLanguage);isPaid=paid;hidePaywall();buildLevels();
   },{...pair,paid});
  }
  async function unavailable(page,pair,paid){
   await select(page,pair,paid);
   assert.equal(await page.evaluate(()=>isPaid),paid,'test uses the explicitly requested paid state');
   assert.equal(await page.evaluate(()=>MelungaL1Cafe.available(nat,lang)),false,'unreleased pair is unavailable: '+pair.id);
   assert.equal(await page.locator('#l1CafeEntry,[data-l1-cafe-entry]').count(),0,'unreleased pair is absent from the real menu: '+pair.id);
   assert.equal(await page.evaluate(()=>MelungaL1Cafe.start()),false,'direct start refuses unreleased pair even when paid: '+pair.id);
   assert.equal(await page.evaluate(()=>MelungaL1Cafe.active()),false,'refusal never starts a scene');
   report.directStartRefusals++;
   const classic=await page.evaluate(()=>({mode,idx,length:pool.length,study:document.getElementById('fr').textContent}));
   await page.evaluate(()=>setMode('l1-cafe'));
   assert.deepEqual(await page.evaluate(()=>({mode,idx,length:pool.length,study:document.getElementById('fr').textContent})),classic,'indirect entry refuses the pair before changing mode or classic content');
   assert.equal(await page.evaluate(()=>MelungaL1Cafe.active()),false,'indirect entry never starts a withheld scene');
   report.indirectEntryRefusals++;
   assert.equal(await page.locator('#paywall').isVisible(),false,'release refusal does not open checkout');
   assert(await page.evaluate(()=>pool.length>0&&document.getElementById('fr').textContent===pool[idx].t),'release refusal preserves the classic card');
  }
  async function checkEar(page,pair,stepIndex,expectHidden){
   await page.evaluate(index=>{
    const remaining=Math.max(0,index-MelungaL1Cafe.state().stepIndex);
    for(let attempt=0;attempt<remaining;attempt++)next();
   },stepIndex);
   const state=await page.evaluate(()=>MelungaL1Cafe.state());
   assert.equal(state.stepIndex,stepIndex,'bounded navigation reaches the requested source step');
   const phrase=pair.phrases.find(p=>p.id===state.currentPhraseId);
   assert(phrase,'the player selected a phrase from its exact pair');
   assert.equal(state.hidden,expectHidden,'model visibility agrees with the phase and role');
   assert.equal(await page.locator('#cn').textContent(),phrase.native,'intention stays exact during recall');
   const ear=page.locator('#card .phonrow .earicon');
   assert(await ear.isVisible(),'ear remains visible');
   assert.equal(await ear.evaluate(node=>node.tagName),'BUTTON','ear is an actual accessible button');
   assert.equal(await ear.isDisabled(),false,'ear stays active');
   const rect=await ear.boundingBox();
   assert(rect&&rect.width>=44&&rect.height>=44,'ear has an accessible touch target');
   await ear.click();
   assert.equal(await page.evaluate(()=>__releaseAudio.at(-1)),phrase.study,'ear reads study text, never phonetic text');
   assert.equal((await page.evaluate(()=>MelungaL1Cafe.state())).stepIndex,stepIndex,'ear does not advance the scene');
   assert.equal((await page.evaluate(()=>MelungaL1Cafe.state())).hidden,false,'explicit listening can restore the model');
   assert.equal(await page.locator('#fr').textContent(),phrase.study,'exact source study is visible');
   assert.equal(await page.locator('#phon').textContent(),phrase.phon,'exact source phonetic aid is visible');
   report.cafeStepsChecked++;
  }

  // Exercise the delivered all-pair selection without overriding its script.
  // The owner instruction supplies editorial authorization; this test supplies
  // no native review, approval identity or substitute evidence document.
  for(const [width,height] of [[390,844],[1440,900]]){
   const {context,page,requests}=await open(width,height);
   const shipped=await page.evaluate(()=>({version:MelungaL1CafeRelease.version,pairs:Array.from(MelungaL1CafeRelease.pairs)}));
   assert.deepEqual(shipped,{version:1,pairs:pairIds},'the shipped artifact activates the seven owner-selected pairs');
   for(const pair of bundle.pairs)for(const paid of [false,true]){
    await select(page,pair,paid);
    assert.equal(await page.evaluate(()=>isPaid),paid,'paid state is explicit');
    assert.equal(await page.evaluate(()=>MelungaL1Cafe.available(nat,lang)),true,'delivered scene is available: '+pair.id);
    assert.equal(await page.locator('#l1CafeEntry,[data-l1-cafe-entry]').count(),1,'delivered scene is offered in the actual lesson menu');
    assert.equal(await page.evaluate(()=>MelungaL1Cafe.start()),true,'direct start accepts the owner-selected scene in either paid state');
    assert.equal((await page.evaluate(()=>MelungaL1Cafe.state())).total,32,'direct start loads the complete scene');
    assert.equal(await page.locator('#paywall').isVisible(),false,'direct start opens no checkout');
    await page.evaluate(()=>setMode('all'));
    assert.equal(await page.evaluate(()=>MelungaL1Cafe.active()),false,'direct-start exit stops the scene');
    assert(await page.evaluate(()=>pool.length>0&&document.getElementById('fr').textContent===pool[idx].t),'direct-start exit restores the classic card');
    await page.evaluate(()=>setMode('l1-cafe'));
    await page.waitForFunction(()=>{const state=MelungaL1Cafe.state();return MelungaL1Cafe.active()&&!state.loading&&!state.error&&state.total>0;});
    const state=await page.evaluate(()=>MelungaL1Cafe.state());
    assert.equal(state.total,32,'all actual preparation/dialogue steps are present');
    assert.equal(await page.locator('#paywall').isVisible(),false,'delivered scene requires no checkout');
    if(!paid){
     await checkEar(page,pair,0,false);
     const recallStart=pair.preparation.length+pair.steps.slice(0,2).reduce((n,pass)=>n+pass.turns.length,0);
     await checkEar(page,pair,recallStart+pair.phrases.findIndex(p=>p.kind==='learner'),true);
     await checkEar(page,pair,recallStart+pair.phrases.findIndex(p=>p.kind==='received'),false);
    }else{
     const first=pair.phrases.find(phrase=>phrase.id===state.currentPhraseId);
     assert.equal(await page.locator('#fr').textContent(),first.study,'paid start displays the exact same source study');
     assert.equal(await page.locator('#phon').textContent(),first.phon,'paid start displays the exact same source phonetic aid');
    }
    await page.evaluate(()=>setMode('all'));
    assert.equal(await page.evaluate(()=>MelungaL1Cafe.active()),false,'exit stops the delivered scene');
    assert.equal(await page.evaluate(()=>mode),'all','exit restores the classic mode');
    assert.equal(await page.locator('#card .phonrow .earicon').evaluate(node=>node.tagName),'SPAN','exit restores the original classic ear');
    assert(await page.evaluate(()=>pool.length>0&&document.getElementById('fr').textContent===pool[idx].t),'exit restores an exact classic card');
   }
   assert.equal(requests.bundle,1,'all seven delivered scenes share the complete bundle without per-pair edits');
   report.scenarios.push({kind:'delivered-all-pairs',width,height,activatedPairsChecked:7,paidStates:[false,true],entryMethods:['direct-start','setMode'],bundleRequests:1,earOnPreparationRecallReceived:true,classicExit:true});
   await context.close();
  }

  // Reversible editorial selection still permits withholding every scene.
  for(const [width,height] of [[390,844],[1440,900]]){
   const {context,page,requests}=await open(width,height,{value:{version:1,pairs:[]}});
   for(const pair of bundle.pairs)for(const paid of [false,true])await unavailable(page,pair,paid);
   assert.equal(requests.bundle,0,'an empty selection never requests the scene content');
   report.scenarios.push({kind:'empty-selection-fixture',width,height,unreleasedPairsChecked:7,paidStates:[false,true],bundleRequests:0});
   await context.close();
  }

  // Bad or missing configuration never enables even its valid-looking entries.
  const invalid=[
   ['missing',{missing:true}],['null',{value:null}],['missing-version',{value:{pairs:['fr-en']}}],
   ['wrong-version',{value:{version:2,pairs:['fr-en']}}],['pairs-string',{value:{version:1,pairs:'fr-en'}}],
   ['unknown-pair',{value:{version:1,pairs:['en-fr']}}],['nonstring-pair',{value:{version:1,pairs:[null]}}],
   ['mixed-known-and-unknown',{value:{version:1,pairs:['fr-en','en-fr']}}],
   ['duplicate-pair',{value:{version:1,pairs:['fr-en','fr-en']}}]
  ];
  for(const [name,fixture] of invalid){
   const {context,page,requests}=await open(390,844,fixture);
   assert.deepEqual(await page.evaluate(ids=>ids.map(id=>{const [n,s]=id.split('-');return MelungaL1Cafe.available(n,s);}),pairIds),Array(7).fill(false),name+' fails closed for every pair');
   for(const paid of [false,true])await unavailable(page,bundle.pairs[0],paid);
   assert.equal(requests.bundle,0,'invalid config never fetches the bundle');
   report.scenarios.push({kind:'invalid-config',name,allSevenUnavailable:true,paidStates:[false,true],bundleRequests:0});
   await context.close();
  }

  // Every singleton loads the complete seven-pair bundle while exposing only itself.
  for(const [width,height] of [[390,844],[1440,900]])for(const pair of bundle.pairs){
   const {context,page,requests}=await open(width,height,{value:{version:1,pairs:[pair.id]}});
   await select(page,pair,false);
   assert.equal(await page.evaluate(()=>isPaid),false,'released scene runs as a nonpaying learner');
   assert.equal(await page.evaluate(()=>MelungaL1Cafe.available(nat,lang)),true,'singleton is available');
   assert.equal(await page.locator('#l1CafeEntry,[data-l1-cafe-entry]').count(),1,'only activated scene appears in the real menu');
   assert.equal(await page.evaluate(()=>MelungaL1Cafe.start()),true,'singleton validates the real seven-pair bundle');
   const state=await page.evaluate(()=>MelungaL1Cafe.state());
   assert(state.total>0&&!state.error&&!state.loading,'singleton loads completely');
   assert.equal(state.total,pair.preparation.length+pair.steps.reduce((n,pass)=>n+pass.turns.length,0),'all actual source steps are present');
   assert.equal(await page.locator('#paywall').isVisible(),false,'released L1 scene opens without paywall');
   await checkEar(page,pair,0,false);
   const recallStart=pair.preparation.length+pair.steps.slice(0,2).reduce((n,pass)=>n+pass.turns.length,0);
   const learner=pair.phrases.findIndex(p=>p.kind==='learner');
   const received=pair.phrases.findIndex(p=>p.kind==='received');
   await checkEar(page,pair,recallStart+learner,true);
   await checkEar(page,pair,recallStart+received,false);
   await page.evaluate(()=>setMode('all'));
   assert.equal(await page.evaluate(()=>MelungaL1Cafe.active()),false,'exit stops the scene');
   assert.equal(await page.evaluate(()=>mode),'all','exit restores the classic mode');
   assert.equal(await page.locator('#card .phonrow .earicon').evaluate(node=>node.tagName),'SPAN','exit restores original classic ear');
   assert(await page.evaluate(()=>pool.length>0&&document.getElementById('fr').textContent===pool[idx].t),'exit restores a classic source card');
   for(const other of bundle.pairs.filter(p=>p.id!==pair.id))for(const paid of [false,true])await unavailable(page,other,paid);
   assert.equal(requests.bundle,1,'only the singleton scene ever loads the bundle');
   report.scenarios.push({kind:'singleton',id:pair.id,width,height,paid:false,bundlePairsValidated:7,sceneSteps:state.total,otherPairsRefused:6,refusalPaidStates:[false,true],earOnPreparationRecallReceived:true,classicExit:true});
   console.log(`PASS singleton ${pair.id} ${width}×${height}: nonpaying, seven-pair validation, six withheld, ear and classic exit`);
   await context.close();
  }
  assert.deepEqual(report.browserErrors,[],'no browser JavaScript errors');
  assert.deepEqual(report.accountOrPaymentRequests,[],'no account or payment request');
  assert.equal(hash(releasePath),report.shippedReleaseSha256Before,'fixtures never modify the delivered release artifact');
  report.status='passed';
 }catch(error){report.status='failed';report.failure=error.stack||String(error);throw error;}
 finally{
  report.shippedReleaseSha256After=hash(releasePath);
  report.sourceFilesSha256=Object.fromEntries(['app.html','l1-cafe-release.js','l1-cafe.js','content/l1-cafe.json','tests/l1-cafe-release.test.cjs','tests/l1-cafe.test.cjs'].map(file=>['melunga_deploy/'+file,hash(path.join(root,file))]));
  report.completedScenarios=report.scenarios.length;
  if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));
  fs.mkdirSync(path.dirname(reportPath),{recursive:true});fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({status:report.status,scenarios:report.completedScenarios,cafeStepsChecked:report.cafeStepsChecked,browserErrors:report.browserErrors,report:path.relative(repository,reportPath)},null,2));
 }
})().catch(error=>{console.error(error);process.exitCode=1;});
