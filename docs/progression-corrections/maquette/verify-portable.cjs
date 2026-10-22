/* Verify the standalone review over local HTTP; never publish or bypass file policy.
 * NODE_PATH exposes playwright-core; CHROMIUM_PATH selects the local browser.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const {chromium}=require('playwright-core');
const review=path.resolve(__dirname,'..'),repository=path.resolve(review,'../..');
const destination=path.resolve(process.argv[2]||path.join(repository,'../exports/melunga-progression-L1-L10.html'));
const output=path.join(review,'transition-es'),captures=path.join(output,'captures');
const runtimeFile=path.join(review,'parcours-corriges.json'),runtimeBytes=fs.readFileSync(runtimeFile);
const runtime=JSON.parse(runtimeBytes),sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const languages={fr:'fr-FR',en:'en-GB',es:'es-ES',it:'it-IT',zh:'zh-CN',ja:'ja-JP',ko:'ko-KR'};
const cases=[{unitId:'L4-fr-es-01',sourceIndex:264},{unitId:'L4-fr-es-01',sourceIndex:283},{unitId:'L4-fr-es-03',sourceIndex:542}];
execFileSync('python3',['-B',path.join(repository,'tools/pedagogy/export_progression_corrections.py'),destination],{stdio:'inherit'});
const html=fs.readFileSync(destination);
const report={scope:'Maquette autonome de revue locale, non publiée',file:path.basename(destination),sha256:sha(html),runtimeSha256:sha(runtimeBytes),
 selfContainedHttpCheck:false,fileProtocolCheck:'not-tested-administrator-policy-known-from-prior-check-no-bypass',documentRequests:0,additionalResources:0,
 pairs:0,exactEmbeddedRuntime:false,pairEarsChecked:0,distinctSupportEarsChecked:0,recallChecks:0,captures:[],errors:[],externalRequests:[],writeRequests:[],
 limits:'Rendu et copies sources contrôlés avec audio simulé ; aucune preuve d’écoute humaine, d’acquisition, de qualité vocale réelle ou de validation native.'};

(async()=>{
 fs.mkdirSync(captures,{recursive:true});
 const server=http.createServer((request,response)=>{
  if(request.url==='/review.html'){response.setHeader('Content-Type','text/html; charset=utf-8');return response.end(html);}
  response.writeHead(404).end();
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
  // One navigation; the two widths below exercise responsive layouts, without
  // claiming to simulate a physical phone. Touch formats are covered by verify.cjs.
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await context.addInitScript(()=>{
   window.__portableAudio=[];window.__portableWrites=[];
   for(const name of ['setItem','removeItem','clear']){
    const original=Storage.prototype[name];Storage.prototype[name]=function(...args){window.__portableWrites.push(name);return original.apply(this,args);};
   }
   speechSynthesis.cancel=()=>{};speechSynthesis.getVoices=()=>[];
   speechSynthesis.speak=utterance=>window.__portableAudio.push({text:utterance.text,lang:utterance.lang});
  });
  await context.route('**/*',route=>{
   const request=route.request(),url=new URL(request.url());
   if(url.origin!==base){report.externalRequests.push(url.origin+url.pathname);return route.abort();}
   if(!['GET','HEAD'].includes(request.method()))report.writeRequests.push({method:request.method(),path:url.pathname});
   if(request.isNavigationRequest())report.documentRequests++;else report.additionalResources++;
   return route.continue();
  });
  const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));
  await page.goto(base+'/review.html');assert.equal(await page.evaluate(()=>ProgressionCorrections.ready),true);
  assert.deepEqual(await page.evaluate(()=>window.MELUNGA_CORRECTIONS_REVIEW),runtime,'all embedded runtime fields stay exact');report.exactEmbeddedRuntime=true;
  assert.equal(await page.locator('#pair-select option').count(),7);
  async function actual(){return page.evaluate(()=>({
   state:ProgressionCorrections.getState(),study:document.querySelector('.phrase-card .study')?.textContent,
   native:document.querySelector('.phrase-card .native')?.textContent,phon:document.querySelector('.phrase-card .phon')?.textContent,
   id:document.querySelector('.phrase-card')?.dataset.sourceId,noHorizontalOverflow:document.documentElement.scrollWidth<=innerWidth+1,
   audio:window.__portableAudio.slice()
  }));}
  async function exact(phrase){
   const value=await actual();assert.equal(value.id,phrase.id);assert.equal(value.study,phrase.study);assert.equal(value.phon,phrase.phon);assert.equal(value.native,phrase.native);
   assert.ok(value.noHorizontalOverflow);return value;
  }
  async function listen(phrase,language){
   const before=(await actual()).audio.length;await page.locator('.phrase-card .ear').click();const after=await actual();
   assert.equal(after.audio.length,before+1);assert.deepEqual(after.audio.at(-1),{text:phrase.study,lang:language});
  }
  for(const pair of runtime.pairs){
   const level=pair.levels.find(level=>level.level===8),unit=level.units[0];
   await page.evaluate(({pair,unit})=>ProgressionCorrections.select(pair,8,unit),{pair:pair.id,unit:unit.unitId});
   const phrase=unit.phrases.find(phrase=>phrase.id===unit.steps[0].utterance);assert.ok(phrase);
   await exact(phrase);await listen(phrase,languages[pair.studyLanguage]);report.pairEarsChecked++;
  }
  report.pairs=runtime.pairs.length;
  for(const [width,height]of [[390,844],[1440,900]]){
   await page.setViewportSize({width,height});
   for(const item of cases){
    const pair=runtime.pairs.find(pair=>pair.id==='fr-es');
    const unit=pair.levels.find(level=>level.level===4).units.find(unit=>unit.unitId===item.unitId);
    const preparation=unit.preparations.find(preparation=>preparation.source.index===item.sourceIndex);
    assert.ok(preparation,'requested real support exists');
    const start=unit.steps.findIndex(step=>step.id===preparation.understoodInStep);
    await page.evaluate(({unitId,start})=>{ProgressionCorrections.select('fr-es',4,unitId);for(let i=0;i<start;i++)ProgressionCorrections.next();window.scrollTo(0,0);},{unitId:unit.unitId,start});
    const presented=await exact(preparation.phrase);assert.equal(presented.state.kind,'understand');
    if(width===390){await listen(preparation.phrase,'es-ES');report.distinctSupportEarsChecked++;}
    const filename=`preparation-${item.sourceIndex}-${width}x${height}.png`,file=path.join(captures,filename);
    await page.screenshot({path:file,fullPage:true,animations:'disabled'});
    await page.evaluate(()=>ProgressionCorrections.next());const imitation=await exact(preparation.phrase);assert.equal(imitation.state.kind,'imitate');
    await page.evaluate(()=>ProgressionCorrections.next());const target=unit.phrases[preparation.beforeVariantIndex];const displayedTarget=await exact(target);assert.equal(displayedTarget.state.kind,'understand');
    report.captures.push({file:'captures/'+filename,sha256:sha(fs.readFileSync(file)),width,height,unitId:unit.unitId,
     supportSourceId:preparation.phrase.id,supportStudy:preparation.phrase.study,supportPhon:preparation.phrase.phon,
     targetSourceId:target.id,targetStudy:target.study,targetPhon:target.phon,steps:[preparation.understoodInStep,preparation.imitatedInStep,unit.steps[displayedTarget.state.stepIndex].id],
     noHorizontalOverflow:true,visualInspection:{inspected:false,notes:'Vérification visuelle à consigner après ouverture de cette image.'}});
    if(width===390){
     await page.evaluate(()=>{while(!document.getElementById('next-step').disabled)ProgressionCorrections.next();});
     assert.equal(await page.locator('#intention-choices button').count(),4);
     const chosen=unit.phrases[unit.variantOrder[0]];await exact(chosen);await page.locator('#recall-toggle').click();
     assert.equal(await page.locator('.phrase-card .study,.phrase-card .phon,.phrase-card .reading').count(),0);
     assert.equal(await page.locator('.phrase-card .native').textContent(),chosen.native);
     const before=(await actual()).audio.length;await page.evaluate(()=>ProgressionCorrections.speak());assert.equal((await actual()).audio.length,before);
     await page.locator('.phrase-card .ear').click();await exact(chosen);assert.deepEqual((await actual()).audio.at(-1),{text:chosen.study,lang:'es-ES'});
     assert.equal((await actual()).state.helpRequested,true);report.recallChecks++;
    }
   }
  }
  assert.deepEqual(await page.evaluate(()=>window.__portableWrites),[]);await context.close();
  assert.equal(report.documentRequests,1);assert.equal(report.additionalResources,0);assert.equal(report.pairs,7);assert.equal(report.distinctSupportEarsChecked,3);
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.externalRequests,[]);assert.deepEqual(report.writeRequests,[]);
  assert.equal(sha(fs.readFileSync(runtimeFile)),report.runtimeSha256,'runtime remains untouched');
  assert.equal(sha(fs.readFileSync(destination)),report.sha256,'standalone export remains untouched');
  report.selfContainedHttpCheck=true;fs.writeFileSync(path.join(output,'verification-portable.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({runtimeSha256:report.runtimeSha256,documentRequests:report.documentRequests,additionalResources:report.additionalResources,pairs:report.pairs,supportEars:report.distinctSupportEarsChecked,captures:report.captures.length}));
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
