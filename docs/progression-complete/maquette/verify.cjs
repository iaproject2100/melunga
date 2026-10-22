/* Real DOM checks for the complete review mock-up, outside the published app.
 * NODE_PATH exposes playwright-core. Audio is simulated; no APK or linguistic
 * efficacy is certified. SCREENSHOT_DIR controls reports/captures under /tmp.
 */
'use strict';
const {chromium}=require('playwright-core');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),crypto=require('node:crypto');
const review=path.resolve(__dirname,'..');
const output=process.env.SCREENSHOT_DIR||'/tmp/melunga-progression-complete-test';
const pairs=['fr-en','fr-es','fr-it','fr-zh','fr-ja','fr-ko','zh-fr'];
const languages={fr:'fr-FR',en:'en-GB',es:'es-ES',it:'it-IT',zh:'zh-CN',ja:'ja-JP',ko:'ko-KR'};
const read=name=>JSON.parse(fs.readFileSync(path.join(review,name),'utf8'));
const selection=read('selection-guidee-enrichie.json');
const bank=read('banque-phrases.json'),byId=new Map(bank.entries.map(entry=>[entry.id,entry]));
const sequences=Object.fromEntries(pairs.map(pair=>[pair,read('sequences/seq-'+pair+'.json')]));
const tracked=['maquette/index.html','maquette/app.js','maquette/style.css','selection-guidee-enrichie.json','banque-phrases.json',...pairs.map(pair=>'sequences/seq-'+pair+'.json')];
const hashes=()=>Object.fromEntries(tracked.map(name=>[name,crypto.createHash('sha256').update(fs.readFileSync(path.join(review,name))).digest('hex')]));
const report={scope:'maquette documentaire seulement, sans publication',bankEntries:bank.entries.length,selectedUnits:selection.entries.reduce((sum,row)=>sum+row.unitRefs.length,0),viewports:[],errors:[],externalRequests:[],writeRequests:[],audio:'Synthèse simulée : texte exact et langue contrôlés, qualité vocale non évaluée.',limits:'Les sources et le rendu sont vérifiés ; ni progression humaine, ni relecture native, ni Android ne sont certifiés.'};

function pairId(row){return row.pair.nativeLanguage+'-'+row.pair.studyLanguage;}
function levelOf(sequence,number){return sequence.levels.find(level=>Number(level.sourceLevel)===Number(number));}
function unitOf(row,reference){
 const level=levelOf(sequences[pairId(row)],reference.sourceContentLevel||reference.sequenceRef?.sourceLevel||row.niveau);
 const unit=level?.units.find(unit=>unit.unitId===reference.unitId);
 assert(unit,'missing selected source unit '+reference.unitId);return unit;
}
function record(id,kind='learner',role='Toi'){
 const entry=byId.get(id);assert(entry,'unknown bank reference '+id);
 return {id,study:entry.copy.study,native:entry.copy.native,phon:entry.copy.aids.phon,reading:entry.copy.aids.reading||'',kind,role,nativeLanguage:entry.nativeLanguage,studyLanguage:entry.studyLanguage};
}
function unitPlan(row,reference,curated){
 let steps=unitOf(row,reference).steps;
 if(curated&&reference.primary){
  const indices=reference.firstSessionCandidateIndices;assert.equal(indices.length,3,'first session prepares three of the four reserve variants');
  const allowed=id=>{const entry=byId.get(id);return entry?.source?.unitId===reference.unitId&&indices.includes(entry.source.variantIndex);};
  steps=steps.flatMap(step=>{
   if(step.utterance&&!allowed(step.utterance))return [];
   if((step.from||step.to)&&(!allowed(step.from)||!allowed(step.to)))return [];
   if(step.choices){const choices=step.choices.filter(allowed);return choices.length?[{...step,choices}]:[];}
   return [step];
  });
 }
 return steps.map(step=>({kind:step.kind,recall:!!step.hideLearnerModelOnRequest,choices:(step.choices||[]).map(id=>record(id)),items:step.kind==='replace'?[record(step.from,'learner','Phrase de départ'),record(step.to,'learner','Autre possibilité')]:step.choices?[record(step.choices[0])]:[record(step.utterance)]}));
}
function dialoguePlan(dialogue){
 const sourceRecords=new Map(dialogue.preparation.map(step=>[step.utterance,record(step.utterance,step.speaker===dialogue.learnerRole?'learner':'received',dialogue.roles[step.speaker])]));
 return dialogue.preparation.concat(dialogue.steps).map(step=>({kind:step.kind,recall:step.kind==='reply-without-model'||!!step.hideLearnerModelOnRequest,choices:[],scene:!!step.turns,items:(step.utterance?[step.utterance]:step.turns).map(id=>sourceRecords.get(id))}));
}

(async()=>{
 const originalHashes=hashes();
 assert.equal(selection.entries.length,70);assert.equal(report.selectedUnits,210);assert.equal(bank.entries.length,7989);
 const server=http.createServer((request,response)=>{
  let pathname=new URL(request.url,'http://local').pathname;if(pathname.endsWith('/'))pathname+='index.html';
  const file=path.resolve(review,'.'+pathname);
  if(!file.startsWith(review+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){response.writeHead(404).end();return;}
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
    window.__reviewAudio=[];window.__reviewStorageWrites=[];
    ['setItem','removeItem','clear'].forEach(name=>{const original=Storage.prototype[name];Storage.prototype[name]=function(...args){window.__reviewStorageWrites.push({method:name,key:args[0]||''});return original.apply(this,args);};});
    speechSynthesis.cancel=()=>{};speechSynthesis.getVoices=()=>[];
    speechSynthesis.speak=utterance=>{window.__reviewAudio.push({text:utterance.text,lang:utterance.lang});if(utterance.onend)utterance.onend();};
   });
   await context.route('**/*',route=>{
    const request=route.request(),url=new URL(request.url());
    if(!['GET','HEAD'].includes(request.method()))report.writeRequests.push({method:request.method(),path:url.pathname});
    if(url.origin!==base){report.externalRequests.push(url.origin+url.pathname);return route.abort();}
    return route.continue();
   });
   const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));
   await page.goto(base+'/maquette/');await page.waitForFunction(()=>!document.getElementById('workspace').hidden&&document.querySelectorAll('.unit-choice').length===3);
   assert.equal(await page.locator('.language-button').count(),7);assert.equal(await page.locator('.level-button').count(),10);
   assert.deepEqual(await page.locator('.language-button').evaluateAll(items=>items.map(item=>item.dataset.pair)),pairs);
   const result={width,height,firstSessionPlans:0,firstSessionSteps:0,allReserveUnits:0,allReserveSteps:0,dialoguePlans:0,dialogueSteps:0,sourcePhraseRenders:0,earActivations:0,recallChecks:0,choiceChecks:0,cases:[]};
   async function loaded(pair,level){
    await page.waitForFunction(({pair,level})=>!document.getElementById('workspace').hidden&&document.querySelector('.language-button[aria-pressed="true"]')?.dataset.pair===pair&&document.getElementById('level-label').textContent==='Niveau proposé · L'+level,{pair,level});
    assert.equal(await page.locator('#empty-state').isVisible(),false,'selection has no loading error');
   }
   async function choose(pair,level){
    await page.evaluate(({pair,level})=>{document.querySelector('.language-button[data-pair="'+pair+'"]').click();document.querySelector('.level-button[data-level="'+level+'"]').click();},{pair,level});
    await loaded(pair,level);
   }
   async function capture(name){
    await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>window.scrollTo(0,0));
    await page.screenshot({path:path.join(output,name+'-'+width+'x'+height+'.png'),fullPage:true});
   }
   async function runPlan(expected,label){
    const summary=await page.evaluate(({expected,label,speechLanguage})=>{
     const $=id=>document.getElementById(id),counts={steps:0,phrases:0,ears:0,recalls:0,choices:0};
     function check(value,message){if(!value)throw Error(label+': '+message);}
     function equal(actual,wanted,message){check(actual===wanted,message+' ('+JSON.stringify(actual)+' vs '+JSON.stringify(wanted)+')');}
     function verify(items,hidden){
      const cards=Array.from($('phrase-list').children);equal(cards.length,items.length,'turn count');
      cards.forEach((card,index)=>{
       const item=items[index];check(item,'source record exists');equal(card.dataset.sourceId,item.id,'bank id');equal(card.dataset.kind,item.kind,'learner / received role');
       equal(card.querySelector('.role-label').textContent,item.role,'named source role');
       equal(card.querySelector('.native').textContent,item.native,'native translation is exact');equal(card.querySelector('.native').lang,item.nativeLanguage,'native reader language');
       if(hidden&&item.kind==='learner'){
        equal(card.querySelectorAll('.study,.phonetic,.reading,.reading-text,.ear-button').length,0,'learner answer and all aids removed from DOM');
        check(!card.textContent.includes(item.study),'masked phrase not retained in text');
       }else{
        equal(card.querySelector('.study').textContent,item.study,'studied phrase is exact');equal(card.querySelector('.study').lang,item.studyLanguage,'studied language');
        equal(card.querySelector('.phonetic').textContent,item.phon,'phonetics are exact');equal(card.querySelector('.phonetic').lang,item.nativeLanguage,'phonetic reader language');
        equal(card.querySelector('.reading-text')?.textContent||'',item.reading,'reading is exact');
        const ear=card.querySelector('.ear-button'),bounds=ear.getBoundingClientRect();check(bounds.width>=44&&bounds.height>=44,'ear target >=44px');
        const before=window.__reviewAudio.length;ear.click();equal(window.__reviewAudio.length,before+1,'one ear reads one phrase');
        const played=window.__reviewAudio.at(-1);equal(played.text,item.study,'audio exact phrase');equal(played.lang,speechLanguage,'audio studied language');counts.ears++;
       }
       if(item.kind==='received')equal(card.querySelector('.received-badge')?.textContent,'À comprendre','received role stays identified');
       counts.phrases++;
      });
      check(document.documentElement.scrollWidth-innerWidth<=1,'page fits viewport without horizontal overflow');
      if(hidden){equal($('source-content').textContent,'','source commentary removed during recall');check($('source-details').hidden,'source details removed during recall');}
     }
     expected.forEach((step,index)=>{
      equal($('step-count').textContent,'Étape '+(index+1)+' / '+expected.length,'step order/count');
      const choices=Array.from($('intention-choices').children);equal(choices.length,step.choices.length,'choice count');
      verify(step.items,false);
      if(step.scene){
       check(!$('scene-audio').hidden,'scene audio is available after preparation');const before=window.__reviewAudio.length;$('scene-audio').click();
       const played=window.__reviewAudio.slice(before);equal(JSON.stringify(played),JSON.stringify(step.items.map(item=>({text:item.study,lang:speechLanguage}))),'whole dialogue reads source turns in order');counts.ears+=played.length;
      }
      if(step.recall){
       check(!$('recall-actions').hidden,'recall control available');$('recall-toggle').click();equal($('recall-toggle').getAttribute('aria-pressed'),'true','recall is voluntary');verify(step.items,true);counts.recalls++;
       if(step.scene)check($('scene-audio').disabled,'whole scene audio cannot disclose the hidden learner answer');
       step.choices.forEach(choice=>{
        const control=Array.from($('intention-choices').children).find(button=>button.dataset.choiceId===choice.id);check(control,'prepared choice exists');control.click();
        equal($('recall-toggle').getAttribute('aria-pressed'),'true','choice keeps the model hidden');verify(step.items.map(item=>item.kind==='learner'?choice:item),true);counts.choices++;
       });
       $('recall-toggle').click();equal($('recall-toggle').getAttribute('aria-pressed'),'false','help restored');
       const last=step.choices.at(-1);verify(step.items.map(item=>item.kind==='learner'&&last?last:item),false);
      }
      counts.steps++;
      equal($('next-step').disabled,index===expected.length-1,'next control follows the plan boundaries');
      if(index<expected.length-1)$('next-step').click();
     });
     return counts;
    },{expected,label,speechLanguage:languages[expected[0].items[0].studyLanguage]});
    result.sourcePhraseRenders+=summary.phrases;result.earActivations+=summary.ears;result.recallChecks+=summary.recalls;result.choiceChecks+=summary.choices;
    return summary;
   }
   for(const pair of pairs){
    for(let level=1;level<=10;level++){
     const row=selection.entries.find(row=>pairId(row)===pair&&Number(row.niveau)===level);assert(row);
     await choose(pair,level);
     assert.equal(await page.locator('.unit-choice').count(),3,'three candidate situations per pair/level');
     assert.equal(await page.locator('.dialogue-choice').count(),3,'three conversations remain available per source level');
     const primary=row.unitRefs.find(reference=>reference.primary),firstPlan=unitPlan(row,primary,true);
     const first=await runPlan(firstPlan,pair+' L'+level+' first session');result.firstSessionPlans++;result.firstSessionSteps+=first.steps;
     assert.equal(await page.locator('#all-variants').getAttribute('aria-pressed'),'false','first session never opens all reserve variants by default');
     assert.equal(await page.locator('#intention-choices button').count(),3,'three initial choices are retained');
     if((level===1&&['fr-zh','fr-ko'].includes(pair))||(pair==='fr-es'&&level===5)||(level===10&&['fr-en','zh-fr'].includes(pair))){
      await page.evaluate(()=>document.getElementById('previous-step').click());await capture(pair+'-L'+level+'-phrases');
     }
     if(width===1440){
      for(const reference of row.unitRefs){
       await page.evaluate(id=>document.querySelector('.unit-choice[data-unit-id="'+id+'"]').click(),reference.unitId);
       if(reference.primary){
        await page.evaluate(()=>document.getElementById('all-variants').click());
        assert.equal(await page.locator('#all-variants').getAttribute('aria-pressed'),'true','four reserve variants can be reopened without deleting sources');
       }
       const full=await runPlan(unitPlan(row,reference,false),pair+' L'+level+' '+reference.unitId+' reserve');result.allReserveUnits++;result.allReserveSteps+=full.steps;
       assert.equal(await page.locator('#intention-choices button').count(),4,'full reserve retains four exact source variants');
      }
     }
     const dialogue=levelOf(sequences[pair],level).dialogues[0],expectedDialogue=dialoguePlan(dialogue);
     await page.evaluate(id=>document.querySelector('.dialogue-choice[data-dialogue-id="'+id+'"]').click(),dialogue.dialogueId);
     const conversation=await runPlan(expectedDialogue,pair+' L'+level+' '+dialogue.dialogueId);result.dialoguePlans++;result.dialogueSteps+=conversation.steps;
     if((level===1&&['fr-zh','fr-ko'].includes(pair))||(pair==='fr-es'&&level===5)||(level===10&&['fr-en','zh-fr'].includes(pair))){
      await page.evaluate(()=>document.getElementById('recall-toggle').click());await capture(pair+'-L'+level+'-dialogue-sans-modele');
     }
     result.cases.push({pair,level,primary:primary.unitId,firstSessionSteps:first.steps,reserveUnits:width===1440?3:0,dialogue:dialogue.dialogueId,dialogueSteps:conversation.steps});
    }
    console.log(JSON.stringify({viewport:width+'x'+height,pair,checkedLevels:10}));
   }
   assert.deepEqual(await page.evaluate(()=>window.__reviewStorageWrites),[],'review mock-up never writes local/session storage');
   report.viewports.push(result);await context.close();
  }
  assert.deepEqual(hashes(),originalHashes,'source files, plans and mock-up assets remain byte-identical after browser checks');
  assert.deepEqual(report.errors,[],'no JavaScript errors');assert.deepEqual(report.externalRequests,[],'no external application calls');assert.deepEqual(report.writeRequests,[],'no network writes');
  report.coverage={primaryCasesThreeViewports:report.viewports.reduce((sum,viewport)=>sum+viewport.firstSessionPlans,0),allReserveUnitsDesktop:report.viewports.reduce((sum,viewport)=>sum+viewport.allReserveUnits,0),firstDialoguesThreeViewports:report.viewports.reduce((sum,viewport)=>sum+viewport.dialoguePlans,0),renderedSteps:report.viewports.reduce((sum,viewport)=>sum+viewport.firstSessionSteps+viewport.allReserveSteps+viewport.dialogueSteps,0),sourcePhraseRenders:report.viewports.reduce((sum,viewport)=>sum+viewport.sourcePhraseRenders,0),earActivations:report.viewports.reduce((sum,viewport)=>sum+viewport.earActivations,0),recallChecks:report.viewports.reduce((sum,viewport)=>sum+viewport.recallChecks,0),choiceChecks:report.viewports.reduce((sum,viewport)=>sum+viewport.choiceChecks,0)};
  report.sourceFilesSha256=originalHashes;
  fs.writeFileSync(path.join(output,'verification.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({coverage:report.coverage,errors:report.errors},null,2));
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
