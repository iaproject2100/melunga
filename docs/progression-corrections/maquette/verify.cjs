/* Actual DOM checks of the corrected-order review, never the published site.
 * NODE_PATH exposes playwright-core; CHROMIUM_PATH selects a local browser.
 * Audio is simulated: exact text/language are checked, not voice quality.
 */
'use strict';
const {chromium}=require('playwright-core');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),crypto=require('node:crypto');
const review=path.resolve(__dirname,'..'),repository=path.resolve(review,'../..');
const output=process.env.SCREENSHOT_DIR||path.join(review,'captures');
const runtime=JSON.parse(fs.readFileSync(path.join(review,'parcours-corriges.json'),'utf8'));
const languages={fr:'fr-FR',en:'en-GB',es:'es-ES',it:'it-IT',zh:'zh-CN',ja:'ja-JP',ko:'ko-KR'};
const sourceById={};
for(const pair of runtime.pairs){
 for(let level=1;level<=10;level++){
  const basename=`L${level}-${pair.id}.json`;
  const document=JSON.parse(fs.readFileSync(path.join(repository,'melunga_deploy/content/conversation',basename),'utf8'));
  for(const unit of document.units)unit.variants.forEach((variant,index)=>{
   sourceById[`${basename}:${unit.id}:v${index}`]=Object.fromEntries(Object.entries(variant).filter(([key])=>key!=='slot'));
  });
 }
}
assert.equal(Object.keys(sourceById).length,3364);
const tracked=['parcours-corriges.json','maquette/index.html','maquette/app.js','maquette/style.css'];
const hashes=()=>Object.fromEntries(tracked.map(name=>[name,crypto.createHash('sha256').update(fs.readFileSync(path.join(review,name))).digest('hex')]));
const report={scope:'Maquette de revue locale ; aucune publication',runtimeSha256:hashes()['parcours-corriges.json'],
 runtimeCounts:runtime.counts,sourceVariantCount:Object.keys(sourceById).length,viewports:[],errors:[],externalRequests:[],writeRequests:[],
 limits:'Sources et ordre éditorial vérifiés ; acquisition humaine, qualité vocale réelle et validation native non démontrées.'};

(async()=>{
 const before=hashes();
 const server=http.createServer((request,response)=>{
  let pathname=new URL(request.url,'http://local').pathname;
  if(pathname.endsWith('/'))pathname+='index.html';
  const file=path.resolve(review,'.'+pathname);
  if(!file.startsWith(review+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())return response.writeHead(404).end();
  response.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png'})[path.extname(file)]||'text/html');
  fs.createReadStream(file).pipe(response);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
  fs.mkdirSync(output,{recursive:true});
  async function contextFor(width,height,fixture={}){
   const context=await browser.newContext({viewport:{width,height},isMobile:width<1024,hasTouch:width<1024,reducedMotion:'reduce'});
   await context.addInitScript(()=>{
    window.__reviewAudio=[];window.__reviewStorageWrites=[];
    for(const name of ['setItem','removeItem','clear']){
     const original=Storage.prototype[name];Storage.prototype[name]=function(...args){window.__reviewStorageWrites.push({method:name,key:args[0]||''});return original.apply(this,args);};
    }
    speechSynthesis.cancel=()=>{};speechSynthesis.getVoices=()=>[];
    speechSynthesis.speak=utterance=>{window.__reviewAudio.push({text:utterance.text,lang:utterance.lang});};
   });
   await context.route('**/*',route=>{
    const request=route.request(),url=new URL(request.url());
    if(!['GET','HEAD'].includes(request.method()))report.writeRequests.push({method:request.method(),path:url.pathname});
    if(url.origin!==base){report.externalRequests.push(url.origin+url.pathname);return route.abort();}
    if(fixture.fail&&url.pathname.endsWith('/parcours-corriges.json'))return route.fulfill({status:503,body:'fixture unavailable'});
    return route.continue();
   });
   const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));
   await page.goto(base+'/maquette/');return{page,context};
  }
  for(const [width,height] of [[320,568],[390,844],[1440,900]]){
   const {page,context}=await contextFor(width,height);
   assert.equal(await page.evaluate(()=>ProgressionCorrections.ready),true);
   await page.locator('#workspace').waitFor({state:'visible'});
   assert.equal(await page.locator('#pair-select option').count(),7);
   const viewportReport={width,height,cells:0,units:0,steps:0,phraseRenders:0,ears:0,recalls:0,choices:0};
   for(const pair of runtime.pairs){
    const expected={...pair,levels:pair.levels.map(level=>({...level,units:level.units.map(unit=>({
     unitId:unit.unitId,steps:unit.steps,phrases:Object.fromEntries(unit.phrases.map(phrase=>[phrase.id,sourceById[phrase.id]])),
    }))}))};
    const result=await page.evaluate(({expected,language})=>{
     const api=window.ProgressionCorrections,$=id=>document.getElementById(id);
     const totals={cells:0,units:0,steps:0,phraseRenders:0,ears:0,recalls:0,choices:0};
     function check(value,message){if(!value)throw Error(expected.id+': '+message);}
     function equal(actual,wanted,message){check(actual===wanted,message+' ('+JSON.stringify(actual)+' vs '+JSON.stringify(wanted)+')');}
     function change(id,value){const control=$(id);control.value=String(value);control.dispatchEvent(new Event('change',{bubbles:true}));}
     function verify(ids,phrases,hidden){
      const cards=Array.from($('phrase-list').children);equal(cards.length,ids.length,'visible source phrase count');
      cards.forEach((card,index)=>{
       const id=ids[index],source=phrases[id];check(source,'independent canonical source exists');equal(card.dataset.sourceId,id,'exact source reference');
       equal(card.querySelector('.native').textContent,source.native,'reader meaning unchanged');
       equal(card.querySelector('.native').lang,expected.nativeLanguage,'reader language unchanged');
       const ear=card.querySelector('.ear');check(ear&&ear.tagName==='BUTTON','ear is a real button');
       const rectangle=ear.getBoundingClientRect();check(rectangle.width>=44&&rectangle.height>=44,'44px ear remains available');
       check(getComputedStyle(ear).display!=='none'&&getComputedStyle(ear).visibility!=='hidden','ear is visible');
       check(ear.getAttribute('aria-label'),'ear has an accessible name');
       if(hidden){
        equal(card.querySelectorAll('.study,.phon,.reading').length,0,'hidden answer and aids removed from card DOM');
        equal($('review-content').childNodes.length,0,'review details contain no hidden source answer');
        check($('review-details').hidden,'review details stay hidden during recall');
       }else{
        equal(card.querySelector('.study').textContent,source.study,'study phrase copied verbatim');
        equal(card.querySelector('.study').lang,expected.studyLanguage,'study language');
        equal(card.querySelector('.phon').textContent,source.phon,'phonetic copied verbatim');
        equal(card.querySelector('.phon').lang,expected.nativeLanguage,'phonetics remain tied to reader');
        const hasReading=Object.prototype.hasOwnProperty.call(source,'reading');
        equal(card.querySelectorAll('.reading').length,hasReading?1:0,'reading existence preserved, no placeholder');
        if(hasReading)equal(card.querySelector('.reading').textContent,source.reading,'reading copied verbatim');
       }
       totals.phraseRenders++;
      });
      check(document.documentElement.scrollWidth<=innerWidth+1,'no horizontal page overflow');
     }
     function listen(id,phrases){
      const card=Array.from($('phrase-list').children).find(card=>card.dataset.sourceId===id);
      const count=window.__reviewAudio.length;card.querySelector('.ear').click();
      equal(window.__reviewAudio.length,count+1,'one deliberate ear activation, one phrase');
      equal(window.__reviewAudio.at(-1).text,phrases[id].study,'audio reads exact study text, never phonetics');
      equal(window.__reviewAudio.at(-1).lang,language,'audio language');totals.ears++;
     }
     change('pair-select',expected.id);equal($('level-select').options.length,10,'ten selectable levels');
     for(const level of expected.levels){
      change('level-select',level.level);equal(api.getState().level,level.level,'real level control updates state');
      equal($('unit-select').options.length,level.units.length,'all units reachable in this level');totals.cells++;
      for(const unit of level.units){
       change('unit-select',unit.unitId);equal(api.getState().unitId,unit.unitId,'real situation control updates state');
       equal(api.getState().stepCount,unit.steps.length,'whole declared sequence reachable');
       check($('prev-step').disabled,'first step has a start boundary');
       for(let index=0;index<unit.steps.length;index++){
        const step=unit.steps[index],state=api.getState();equal(state.stepIndex,index,'source step order');equal(state.kind,step.kind,'source phase order');
        const ids=step.kind==='choose-and-recall'?[step.choices[0]]:step.utterance?[step.utterance]:step.choices;
        equal(JSON.stringify(state.phraseIds),JSON.stringify(ids),'phase uses only declared phrase IDs');verify(ids,unit.phrases,false);
        if(step.kind==='choose-and-recall'){
         equal($('intention-choices').children.length,step.choices.length,'all whole-phrase choices remain accessible');
         for(const choiceId of step.choices){
          Array.from($('intention-choices').children).find(button=>button.dataset.choiceId===choiceId).click();
          verify([choiceId],unit.phrases,false);$('recall-toggle').click();check(api.getState().hidden,'recall can hide the learner model');verify([choiceId],unit.phrases,true);
          const before=window.__reviewAudio.length;api.speak();equal(window.__reviewAudio.length,before,'implicit audio cannot disclose a hidden answer');
          listen(choiceId,unit.phrases);check(!api.getState().hidden&&api.getState().helpRequested,'ear explicitly restores the model as help');verify([choiceId],unit.phrases,false);
          $('recall-toggle').click();verify([choiceId],unit.phrases,true);$('recall-toggle').click();verify([choiceId],unit.phrases,false);
          totals.recalls++;totals.choices++;
         }
        }else ids.forEach(id=>listen(id,unit.phrases));
        if(index<unit.steps.length-1)$('next-step').click();totals.steps++;
       }
       check($('next-step').disabled,'last step has an end boundary');const final=api.getState().stepIndex;api.next();equal(api.getState().stepIndex,final,'no wrap at end');totals.units++;
      }
     }
     return totals;
    },{expected,language:languages[pair.studyLanguage]});
    for(const [key,value]of Object.entries(result))viewportReport[key]+=value;
    console.log(`PASS ${pair.id} ${width}×${height}: ${result.units} units, ${result.steps} steps, ${result.recalls} recall choices`);
   }
   assert.equal(viewportReport.cells,70);assert.equal(viewportReport.units,841);assert.equal(viewportReport.recalls,3364);
   assert.deepEqual(await page.evaluate(()=>window.__reviewStorageWrites),[],'the review writes no rights or acquired state');
   async function capture(pairId,level,name,hidden=false){
    await page.evaluate(({pairId,level,hidden})=>{ProgressionCorrections.select(pairId,level);if(hidden){while(!document.getElementById('next-step').disabled)ProgressionCorrections.next();document.getElementById('recall-toggle').click();}window.scrollTo(0,0);},{pairId,level,hidden});
    await page.screenshot({path:path.join(output,`${name}-${width}x${height}.png`),fullPage:true,animations:'disabled'});
   }
   await capture('fr-it',8,'italien-L8');await capture('fr-zh',2,'chinois-L2');await capture('zh-fr',7,'francais-L7-rappel',true);
   report.viewports.push(viewportReport);await context.close();
  }
  const fixture={fail:true},{page,context}=await contextFor(390,844,fixture);
  assert.equal(await page.evaluate(()=>ProgressionCorrections.ready),false);
  await page.locator('#error-box').waitFor({state:'visible'});fixture.fail=false;await page.locator('#retry-load').click();
  assert.equal(await page.evaluate(()=>ProgressionCorrections.ready),true);
  await page.locator('#workspace').waitFor({state:'visible'});await context.close();report.failedFetchAndRetry=true;
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.externalRequests,[]);assert.deepEqual(report.writeRequests,[]);
  assert.deepEqual(hashes(),before,'browser verification leaves the runtime and preview files unchanged');
  fs.writeFileSync(path.join(review,'verification-navigateur.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
 }finally{
  if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));
 }
})().catch(error=>{console.error(error);process.exitCode=1;});
