/* Local HTTP browser integration. No real account, purchase or hosted-browser claim.
 * NODE_PATH=/tmp/melunga-review-tools/node_modules node tests/curriculum-player.test.cjs
 */
'use strict';
const {chromium}=require('playwright-core');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {createHash}=require('node:crypto');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const repository=path.dirname(root);
const reportPath=path.join(repository,'docs/curriculum-v2/tests-navigateur.json');
const pairIds=['fr-en','fr-es','fr-it','fr-zh','fr-ja','fr-ko','zh-fr'];
const capabilityOrder=['01','07','08','09','02','03','04','05','06'];
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const report={version:1,executedAt:new Date().toISOString(),status:'running',environment:{server:'local HTTP',browser:'Chromium',viewports:[{width:390,height:844,mobileEmulation:true},{width:1440,height:900,mobileEmulation:false}],account:'local paid/non-paying fixtures; no real account or payment',audio:'speech invocation spy; no acoustic pronunciation assessment',mobileRuntime:'native mobile-runtime bridge stubbed',hostedBrowserTested:false,nativeApplicationTested:false},coverage:{plans:0,lessons:0,steps:0,exactTextFields:0,receivedSteps:0,recallSteps:0,choiceAlternatives:0},pairs:[],checks:[],errors:[],limitations:['Local Chromium and emulated mobile viewports do not verify the deployed site, physical phones or native application.','The browser compares displayed strings with the compiled curriculum. Source provenance and every unvisited later-level variant are checked separately by the compiler.','A practice sequence and its navigation do not establish learner acquisition or linguistic/native-speaker approval.']};
function writeReport(){fs.mkdirSync(path.dirname(reportPath),{recursive:true});fs.writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');}
function protectCatalogue(){
 const base=execFileSync('git',['show','origin/main:melunga_deploy/app.html'],{cwd:repository,encoding:'utf8',maxBuffer:32*1024*1024});
 const current=fs.readFileSync(path.join(root,'app.html'),'utf8');
 const deckLine=text=>text.split('\n').find(row=>row.startsWith('var DECKS = '));
 assert(deckLine(base),'production catalogue exists');
 assert.equal(deckLine(current),deckLine(base),'all production DECKS fields, including phonetics, remain byte-for-byte identical');
 const free=text=>text.match(/var FREE_LV\s*=\s*\[[^\]]*\]/)?.[0];
 assert(free(base));assert.equal(free(current),free(base),'classic free-level access stays unchanged');
 report.checks.push('Production DECKS and classic FREE_LV unchanged against local origin/main.');
}
function loadBundles(){
 report.content=[];
 return pairIds.map(id=>{
  const raw=fs.readFileSync(path.join(root,'content/curriculum',id+'.json'),'utf8');
  const data=JSON.parse(raw);
  report.content.push({pair:id,sha256:createHash('sha256').update(raw).digest('hex')});
  assert.equal(data.id,id);assert.equal(data.levels.length,10);
  const l1=data.levels.find(level=>level.level===1);
  assert.equal(l1.lessons.length,9,id+' has nine initial lessons');
  assert.deepEqual(l1.lessons.map(lesson=>lesson.capability),capabilityOrder,id+' follows the shared capability order');
  return data;
 });
}
function longLesson(level){
 const score=lesson=>Math.max(...lesson.phrases.map(p=>Array.from(p.study+p.phon+p.native+(p.reading||'')).length));
 return level.lessons.reduce((best,item)=>score(item)>score(best)?item:best,level.lessons[0]);
}

(async()=>{
 let server,browser;
 try{
  protectCatalogue();
  report.revision=execFileSync('git',['rev-parse','HEAD'],{cwd:repository,encoding:'utf8'}).trim();
  const bundles=loadBundles();
  const legacy=JSON.parse(fs.readFileSync(path.join(root,'content/curriculum-legacy-free.json'),'utf8'));
  server=http.createServer((request,response)=>{
   const file=path.resolve(root,'.'+new URL(request.url,'http://local').pathname);
   if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())return response.writeHead(404).end();
   response.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'})[path.extname(file)]||'text/html');
   fs.createReadStream(file).pipe(response);
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
  async function open(bundle,width=390,height=844,options={}){
   const context=await browser.newContext({viewport:{width,height},isMobile:width<1000,hasTouch:width<1000,reducedMotion:'reduce'});
   const fixture={requests:[],api:[],holdPair:null,held:[],failure:options.failure||null};
   await context.route('**/*',async route=>{
    const url=new URL(route.request().url());
    if(url.pathname.includes('/.netlify/')){
     fixture.api.push(url.pathname);
     return route.fulfill({json:url.pathname.endsWith('/get-pricing')?{monthlyDisplay:'7,90 €',annualDisplay:'42 €'}:{paid:false}});
    }
    if(url.pathname.endsWith('/mobile-runtime.js'))return route.fulfill({contentType:'text/javascript',body:''});
    if(url.origin!==base)return route.abort();
    const match=url.pathname.match(/\/content\/curriculum\/([^/]+)\.json$/);
    if(match){
     fixture.requests.push(match[1]);
     if(fixture.holdPair===match[1])await new Promise(resolve=>fixture.held.push(resolve));
     if(fixture.failure==='missing')return route.fulfill({status:503,body:'unavailable'});
     if(fixture.failure==='corrupt')return route.fulfill({json:{version:1,id:match[1],levels:[]}});
    }
    try{return await route.continue();}catch(error){if(!/closed|canceled|intercepted|Invalid InterceptionId/i.test(error.message))throw error;}
   });
   const page=await context.newPage();
   page.on('pageerror',error=>report.errors.push({pair:bundle.id,width,message:error.message}));
   await page.goto(base+'/app.html?start=1&lang='+bundle.nativeLanguage+'&study='+bundle.studyLanguage);
   await page.waitForFunction(()=>window.MelungaCurriculum&&typeof pool!=='undefined',{},{timeout:15000});
   await page.waitForFunction(()=>{const cover=document.getElementById('bootCover');return !cover||cover.classList.contains('hide');},{},{timeout:10000});
   await pause(850); // Existing entry bridge applies the target after 700 ms.
   await page.evaluate(({nativeLanguage,studyLanguage,paid})=>{
    window.isPaid=paid;setNat(nativeLanguage);setLang(studyLanguage);setMode('all');hidePaywall();
    window.__curriculumAudio=[];window.speak=value=>window.__curriculumAudio.push(value);
   },{...bundle,paid:!!options.paid});
   return {page,context,fixture};
  }
  const state=page=>page.evaluate(()=>MelungaCurriculum.state());
  const store=page=>page.evaluate(()=>({storage:Object.fromEntries(Object.entries(localStorage).filter(([key])=>/^(ox_(known|again|paid)|melunga_srs|.*(entitlement|access_token|session_token))/.test(key))),srs:JSON.stringify(window.SRS||{}),known:JSON.stringify(typeof _knownLoad==='function'?_knownLoad():{}),again:JSON.stringify(typeof _againLoad==='function'?_againLoad():{})}));
  async function ready(page){await page.waitForFunction(()=>MelungaCurriculum.active()&&!MelungaCurriculum.state().loading&&!MelungaCurriculum.state().error);}
  async function start(page,level=1){await page.evaluate(level=>setMode(level===1?'path':'L'+level),level);await ready(page);}
  async function controlsFit(page){
   const entries=await page.evaluate(()=>['rateAgainLabel','rateKnownLabel'].map(id=>{
    const node=document.getElementById(id),button=node.closest('button'),a=node.getBoundingClientRect(),b=button.getBoundingClientRect();
    return {id,label:{left:a.left,right:a.right},button:{left:b.left,right:b.right,top:b.top,bottom:b.bottom,width:b.width,height:b.height},width:innerWidth,height:innerHeight};
   }));
   for(const entry of entries){const b=entry.button;assert(b.width>=44&&b.height>=44,'bottom action target >=44px '+JSON.stringify(entry));assert(b.left>=-1&&b.right<=entry.width+1&&b.top>=-1&&b.bottom<=entry.height+1,'bottom actions stay in viewport '+JSON.stringify(entry));assert(entry.label.left>=b.left-1&&entry.label.right<=b.right+1,'bottom labels fit '+JSON.stringify(entry));}
   assert(entries[0].label.right<entries[1].label.left,'bottom labels never overlap');
  }
  async function plan(page,bundle,level){
   const expected=bundle.levels.find(item=>item.level===level);
   const view=await page.evaluate(()=>({heading:document.getElementById('curriculumHeading').textContent,titles:Array.from(document.querySelectorAll('.curriculum-lesson strong'),n=>n.textContent),goals:Array.from(document.querySelectorAll('.curriculum-lesson-copy>span'),n=>n.textContent),values:Array.from(document.getElementById('curriculumLevel').options,n=>n.value),selected:document.getElementById('curriculumLevel').value,scroll:document.documentElement.scrollWidth,width:innerWidth}));
   assert.equal((await state(page)).screen,'plan');assert.equal(view.heading,expected.title);assert.deepEqual(view.titles,expected.lessons.map(item=>item.title));assert.deepEqual(view.goals,expected.lessons.map(item=>item.goal||item.situation));assert.equal(view.selected,String(level));assert.deepEqual(view.values,Array.from({length:10},(_,i)=>String(i+1)));assert(view.scroll<=view.width+1,'plan stays within viewport');
   await controlsFit(page);report.coverage.plans++;
  }
  // Exhaust every step in a selected lesson inside the browser. Assertions compare
  // rendered utterances against the compiled content, not duplicated player rules.
  async function lesson(page,bundle,item,level){
   const result=await page.evaluate(({item,level})=>{
    const api=MelungaCurriculum,counts={steps:0,fields:0,received:0,recall:0,choices:0};
    const fail=message=>{throw new Error(item.id+': '+message);};
    const eq=(actual,expected,label)=>{if(actual!==expected)fail(label+' expected '+JSON.stringify(expected)+' got '+JSON.stringify(actual));};
    const text=id=>document.getElementById(id).textContent;
    const visible=node=>!!node&&getComputedStyle(node).display!=='none'&&getComputedStyle(node).visibility!=='hidden'&&node.getBoundingClientRect().width>0&&node.getBoundingClientRect().height>0;
    if(!api.openLesson(item.id))fail('cannot open selected lesson');
    const phrases=Object.fromEntries(item.phrases.map(p=>[p.id,p]));
    for(let i=0;i<item.steps.length;i++){
     const expected=item.steps[i],s=api.state();eq(s.stepIndex,i,'step index');eq(s.phase,expected.kind,'phase');eq(s.level,level,'level');
     if(expected.choices){
      const choices=Array.from(document.querySelectorAll('#curriculumChoices button'));
      eq(choices.length,expected.choices.length,'choice count');
      expected.choices.forEach((id,index)=>eq(choices[index].textContent,phrases[id].native,'choice intention'));
      for(let index=0;index<choices.length;index++){
       const live=document.querySelectorAll('#curriculumChoices button')[index];live.click();
       const selected=api.state(),p=phrases[expected.choices[index]];
       eq(selected.currentPhraseId,p.id,'selected alternative');eq(text('cn'),p.native,'selected meaning');
       document.getElementById('curriculumEar').click();eq(text('fr'),p.study,'selected source');eq(text('phon'),p.phon,'selected phonetics');eq(window.__curriculumAudio.at(-1),p.study,'selected audio');counts.choices++;
      }
      // Choose first again so the primary pass has a predictable comparison.
      document.querySelector('#curriculumChoices button').click();
     }
     const p=phrases[expected.utterance||(expected.choices&&expected.choices[0])],current=api.state();
     const heard=p.kind==='received'||p.speaker==='B'||expected.kind==='receive'||expected.speaker==='B';
     const recall=!heard&&(expected.kind==='reply-without-model'||expected.kind==='choose-and-recall');
     eq(current.currentPhraseId,p.id,'current source');eq(current.hidden,recall,'recall state');eq(text('cn'),p.native,'native meaning stays available');
     eq(text('fr'),recall?'':p.study,'study source');eq(text('phon'),recall?'':p.phon,'phonetic source');eq(text('curriculumReading'),recall?'':p.reading||'','reading source');counts.fields+=4;
     const ear=document.getElementById('curriculumEar');
     if(!visible(ear)||ear.disabled||ear.tagName!=='BUTTON')fail('active ear is missing or inaccessible');
     const r=ear.getBoundingClientRect();if(r.width<44||r.height<44)fail('ear target below 44px');
     if(heard){counts.received++;if(current.hidden)fail('received utterance hidden');if(visible(document.getElementById('curriculumReveal')))fail('received utterance assigned a learner reveal');if(!/comprends|听懂/.test(text('curriculumInstruction')))fail('received instruction does not ask for comprehension');}
     if(recall){
      counts.recall++;const before=window.__curriculumAudio.length;
      playCurrent();api.cardTap();eq(api.state().hidden,true,'implicit action never reveals');eq(window.__curriculumAudio.length,before,'implicit action never reads hidden answer');
      ear.click();eq(api.state().hidden,false,'ear explicitly reveals');eq(text('fr'),p.study,'ear restored study');eq(text('phon'),p.phon,'ear restored phonetics');eq(text('curriculumReading'),p.reading||'','ear restored reading');eq(window.__curriculumAudio.length,before+1,'ear invokes one reading');
      document.getElementById('curriculumReveal').click();eq(api.state().hidden,true,'help can be hidden again');eq(text('fr'),'','study cleared again');eq(text('phon'),'','phonetics cleared again');
      document.getElementById('curriculumReveal').click();
     }
     const audioBefore=window.__curriculumAudio.length;ear.click();eq(window.__curriculumAudio.length,audioBefore+1,'visible ear reads once');eq(window.__curriculumAudio.at(-1),p.study,'audio is study text, never phonetics');eq(api.state().stepIndex,i,'audio does not advance');
     next();counts.steps++;
    }
    if(!api.state().complete)fail('bounded completion not reached');return counts;
   },{item,level});
   report.coverage.lessons++;report.coverage.steps+=result.steps;report.coverage.exactTextFields+=result.fields;report.coverage.receivedSteps+=result.received;report.coverage.recallSteps+=result.recall;report.coverage.choiceAlternatives+=result.choices;
  }
  async function longTextLayout(page,item){
   const longest=item.phrases.reduce((best,p)=>p.study.length+p.phon.length+p.native.length>best.study.length+best.phon.length+best.native.length?p:best,item.phrases[0]);
   const index=item.steps.findIndex(step=>step.utterance===longest.id||(step.choices||[]).includes(longest.id));
   assert(index>=0,'longest phrase is reachable');
   await page.evaluate(({id,index,phraseId})=>{
    MelungaCurriculum.openLesson(id);for(let i=0;i<index;i++)MelungaCurriculum.next();
    const choices=Array.from(document.querySelectorAll('#curriculumChoices button'));
    if(choices.length){const stepIndex=MelungaCurriculum.state().stepIndex;const current=window.__layoutLesson.steps[stepIndex];const n=current.choices.indexOf(phraseId);if(n>=0)choices[n].click();}
    document.getElementById('curriculumEar').click();
   },{id:item.id,index,phraseId:longest.id});
   const layout=await page.evaluate(()=>{
    const card=document.getElementById('card');const rect=n=>{const r=n.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};};
    const ids=['curriculumHeader','curriculumChoices','fr','curriculumReading','cn','curriculumStatus','curriculumActions'];
    const content=ids.map(id=>document.getElementById(id)).filter(n=>n&&getComputedStyle(n).display!=='none'&&n.getBoundingClientRect().height>0).map(n=>({id:n.id,...rect(n)}));
    const phon=document.getElementById('phon').closest('.phonrow');if(phon&&getComputedStyle(phon).display!=='none')content.push({id:'phonrow',...rect(phon)});
    content.sort((a,b)=>a.top-b.top);
    const result={card:rect(card),content,width:innerWidth,pageWidth:document.documentElement.scrollWidth,scrollHeight:card.scrollHeight,clientHeight:card.clientHeight,overflow:getComputedStyle(card).overflowY};
    card.scrollTop=card.scrollHeight;result.bottomReached=card.scrollTop+card.clientHeight>=card.scrollHeight-2;result.scrollTop=card.scrollTop;return result;
   });
   assert(layout.pageWidth<=layout.width+1,'long text never causes horizontal page scrolling '+item.id);
   for(const box of layout.content)assert(box.left>=layout.card.left-1&&box.right<=layout.card.right+1,'content stays inside its card '+item.id+' '+JSON.stringify(box));
   for(let i=1;i<layout.content.length;i++)assert(layout.content[i].top>=layout.content[i-1].bottom-2,'text blocks never overlap '+item.id+' '+JSON.stringify(layout.content.slice(i-1,i+1)));
   if(layout.scrollHeight>layout.clientHeight+2){assert(/auto|scroll/.test(layout.overflow),'long content has a scrolling container');assert(layout.bottomReached,'long lesson can be scrolled completely');}
   await controlsFit(page);
  }
  for(const [width,height] of [[390,844],[1440,900]])for(const bundle of bundles){
   const {page,context,fixture}=await open(bundle,width,height,{paid:true});
   try{
    const before=await store(page);await start(page);await plan(page,bundle,1);
    if(bundle.id==='fr-zh'){
     fs.mkdirSync('/tmp/melunga-curriculum-screenshots',{recursive:true});
     await page.screenshot({path:'/tmp/melunga-curriculum-screenshots/'+(width<1000?'mobile':'desktop')+'-plan.png',animations:'disabled'});
    }
    const l1=bundle.levels.find(item=>item.level===1);
    // Enter through a visible lesson button as well as the public navigation API.
    await page.locator('.curriculum-lesson').first().click();assert.equal((await state(page)).lessonId,l1.lessons[0].id);
    if(bundle.id==='fr-zh')await page.screenshot({path:'/tmp/melunga-curriculum-screenshots/'+(width<1000?'mobile':'desktop')+'-etape.png',animations:'disabled'});
    for(const item of l1.lessons)await lesson(page,bundle,item,1);
    for(const level of bundle.levels.filter(item=>item.level!==1)){
     await page.selectOption('#curriculumLevel',String(level.level));await plan(page,bundle,level.level);
     const selected=[longLesson(level)];
     if(bundle.id==='fr-es'&&level.level===4){const supportLesson=level.lessons.find(item=>item.id.includes('L4-fr-es-01'));if(supportLesson&&!selected.includes(supportLesson))selected.push(supportLesson);}
     for(const item of selected){await lesson(page,bundle,item,level.level);await page.evaluate(item=>{window.__layoutLesson=item;},item);await longTextLayout(page,item);}
    }
    assert.deepEqual(await store(page),before,'practice navigation never writes SRS, known/again, paid or session state '+bundle.id);
    await page.locator('#curriculumExit').click();
    assert.equal(await page.evaluate(()=>MelungaCurriculum.active()),false,'exit deactivates player');
    assert(await page.evaluate(()=>mode==='all'&&pool.length>0&&document.getElementById('fr').textContent===pool[idx].t),'classic card restored after exit');
    assert.equal(await page.locator('#card .phonrow .earicon').evaluate(node=>node.tagName),'SPAN','classic ear restored');
    assert.equal(fixture.api.filter(value=>/login|payment|replace/.test(value)).length,0,'no account or payment request');
    report.pairs.push({pair:bundle.id,width,height,allTenPlans:true,allL1Lessons:true,laterLevelSelection:'longest utterance lesson at each level; Spanish L4 support lesson additionally'});
    console.log('PASS '+bundle.id+' '+width+'×'+height+': nine L1 lessons, ten plans, exact utterances, recall/received, scrolling, exit');
   }finally{await context.close();}
  }
  // Access protection must hold for direct public API calls, not only a hidden menu.
  for(const bundle of bundles){
   const {page,context}=await open(bundle);
   try{
    const legacyPair=legacy.pairs.find(item=>item.id===bundle.id);
    const rights=await page.evaluate(({indices,study})=>{
     const deck=DECKS[study],active=new Set(activeDeck());setMode('all');const free=new Set(pool);
     return {missingActive:indices.filter(i=>!active.has(deck[i])),notFree:indices.filter(i=>!isFreeCard(deck[i])),missingAll:indices.filter(i=>!free.has(deck[i])),count:indices.length};
    },{indices:legacyPair.catalogue.sourceIndices,study:bundle.studyLanguage});
    assert.deepEqual(rights.missingActive,[],'all historical cards survive activeDeck filtering '+bundle.id);
    assert.deepEqual(rights.notFree,[],'all historical cards retain free rights '+bundle.id);
    assert.deepEqual(rights.missingAll,[],'all historical cards are reachable in free all mode '+bundle.id);
    report.coverage.legacyFreeCards=(report.coverage.legacyFreeCards||0)+rights.count;
    await start(page);const before=await store(page),l2=bundle.levels.find(level=>level.level===2).lessons.find(item=>item.sourceLevel!==1);
    assert(l2,'L2 has a paid lesson distinct from the preserved free library');
    assert.equal(await page.evaluate(()=>MelungaCurriculum.openLevel(2)),false,'free direct openLevel L2 rejected');
    await page.locator('#paywall').waitFor({state:'visible'});assert.equal((await state(page)).level,1);
    await page.evaluate(()=>{hidePaywall();setMode('path');});await ready(page);
    assert.equal(await page.evaluate(id=>MelungaCurriculum.openLesson(id),l2.id),false,'free direct openLesson L2 rejected');
    await page.locator('#paywall').waitFor({state:'visible'});assert.equal((await state(page)).level,1);
    await page.evaluate(()=>{hidePaywall();setMode('all');setMode('L2');});
    await page.locator('#paywall').waitFor({state:'visible'});assert.equal(await page.evaluate(()=>isPaid),false);assert.equal(await page.evaluate(()=>MelungaCurriculum.active()),false,'global L2 route cannot start for free');
    await page.evaluate(()=>{hidePaywall();setMode('path');});await ready(page);
    await page.locator('#curriculumLibrary').click();
    assert.equal((await state(page)).screen,'library','preserved L1 library is explicitly reachable');
    assert.deepEqual(await page.locator('.curriculum-lesson strong').allTextContents(),bundle.freeLibrary.map(item=>item.title),'all historical L1 conversation units remain in free library');
    assert.equal(await page.evaluate(id=>MelungaCurriculum.openLesson(id),bundle.freeLibrary[0].id),true,'postponed L1 lesson remains free');
    assert.equal((await state(page)).freeLibrary,true,'postponed free lesson keeps library navigation');
    assert.deepEqual(await store(page),before,'rejected access does not grant/write entitlement');
   }finally{await context.close();}
  }
  report.checks.push('Seven non-paying pairs: direct openLevel(2), openLesson(paid L2), and setMode(L2) rejected; all preserved L1 library units remain accessible.');
  {
   const {page,context}=await open(bundles[0]);
   try{
    const outside=await page.evaluate(allowedPairs=>{
     const result=[];for(const native of ['fr','en','es','it','ja','ko','zh'])for(const study of Object.keys(DECKS)){
      if(allowedPairs.includes(native+'-'+study))continue;
      nat=native;lang=study;for(const card of DECKS[study])if(isLegacyFreeCard(card)){result.push(native+'-'+study);break;}
     }return result;
    },pairIds);
    assert.deepEqual(outside,[],'legacy whitelist never broadens pairs outside the seven specified');
   }finally{await context.close();}
  }
  assert.equal(report.coverage.legacyFreeCards,2218,'all 2,218 historical rights were exercised');
  report.checks.push('All 2,218 legacy free catalogue indices remain active, free and reachable; no whitelist applies outside the seven pairs.');
  // Use actual browser touch input at the card edge, including Spanish, where
  // advancing after a long phrase previously regressed.
  for(const pairId of ['fr-es','fr-zh']){
   const bundle=bundles.find(item=>item.id===pairId),{page,context}=await open(bundle);
   try{
    await start(page);const item=bundle.levels[0].lessons.at(-1);
    await page.evaluate(id=>MelungaCurriculum.openLesson(id),item.id);
    const client=await context.newCDPSession(page);
    async function swipeUp(){
     const card=await page.locator('#card').boundingBox(),x=card.x+card.width*.6,y=card.y+card.height-45;
     await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
     for(let i=1;i<=5;i++)await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-i*22}]});
     await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await pause(50);
    }
    const canScroll=await page.evaluate(()=>{const c=document.getElementById('card');c.scrollTop=0;return c.scrollHeight-c.clientHeight>(parseFloat(getComputedStyle(c).paddingBottom)||0)+50;});
    if(canScroll){await swipeUp();assert.equal((await state(page)).stepIndex,0,'reading scroll does not skip a phrase '+pairId);assert(await page.evaluate(()=>document.getElementById('card').scrollTop>0),'touch input scrolls lesson content '+pairId);}
    await page.evaluate(()=>{const c=document.getElementById('card');c.scrollTop=c.scrollHeight;});
    await swipeUp();assert.equal((await state(page)).stepIndex,1,'swipe at bottom advances the real lesson '+pairId);
    // A keyboard user can restore the same model through the ear button.
    const recall=bundle.levels[0].lessons[0];
    await page.evaluate(id=>{MelungaCurriculum.openLesson(id);MelungaCurriculum.next();MelungaCurriculum.next();document.querySelector('#curriculumChoices button').click();},recall.id);
    assert.equal((await state(page)).hidden,true);
    await page.locator('#curriculumEar').focus();await page.keyboard.press('Enter');
    assert.equal((await state(page)).hidden,false,'keyboard ear restores recall model');
    assert.equal(await page.locator('#fr').textContent(),recall.phrases[0].study,'keyboard help restores exact study text');
   }finally{await context.close();}
  }
  report.checks.push('Real Chromium mobile touch input: Spanish/Chinese card scroll and edge swipe; keyboard ear restores recall.');
  // A delayed old-language response must never replace the new language card.
  {
   const source=bundles.find(item=>item.id==='fr-zh'),target=bundles.find(item=>item.id==='fr-es');
   const {page,context,fixture}=await open(source);
   try{
    fixture.holdPair=source.id;await page.evaluate(()=>{setMode('path');});
    await page.waitForFunction(()=>MelungaCurriculum.state().loading);await pause(30);
    await page.evaluate(({nativeLanguage,studyLanguage})=>{setNat(nativeLanguage);setLang(studyLanguage);setMode('path');},target);
    await ready(page);assert.equal((await state(page)).pair,target.id);
    fixture.holdPair=null;fixture.held.splice(0).forEach(resolve=>resolve());await pause(100);
    await plan(page,target,1);assert.equal((await state(page)).pair,target.id,'stale response cannot paint old-language lesson');
    // Escape during another pending fetch also restores the classic card.
    await page.evaluate(()=>setMode('all'));fixture.holdPair=target.id;
    await page.evaluate(()=>{setMode('path');});await page.waitForFunction(()=>MelungaCurriculum.state().loading);
    await page.evaluate(()=>setMode('all'));fixture.holdPair=null;fixture.held.splice(0).forEach(resolve=>resolve());await pause(100);
    assert(await page.evaluate(()=>!MelungaCurriculum.active()&&pool.length>0&&document.getElementById('fr').textContent===pool[idx].t),'leaving while loading retains classic card');
   }finally{fixture.held.splice(0).forEach(resolve=>resolve());await context.close();}
  }
  report.checks.push('Delayed fetch: language switch and exit keep stale responses out of the active card.');
  for(const failure of ['missing','corrupt']){
   const {page,context,fixture}=await open(bundles[0],390,844,{failure});
   try{
    fixture.failure=failure;await page.evaluate(()=>setMode('path'));await page.waitForFunction(()=>MelungaCurriculum.state().error);
    assert(await page.locator('#curriculumRetry').isVisible(),'loading failure offers retry');
    fixture.failure=null;await page.locator('#curriculumRetry').click();await ready(page);await plan(page,bundles[0],1);
   }finally{await context.close();}
  }
  report.checks.push('Missing and malformed bundles fail visibly and recover with retry.');
  // The all-levels review workshop is archived outside the publish directory.
  // Production navigation must never offer its forced-paid review context.
  assert.equal(fs.existsSync(path.join(root,'parcours-preview.html')),false,'review-only workshop is not published');
  report.checks.push('All-levels review workshop is archived outside the published site; app access checks remain active.');
  assert.deepEqual(report.errors,[],'no uncaught browser JavaScript errors');
  report.status='passed';console.log(JSON.stringify(report.coverage));
 }catch(error){report.status='failed';report.errors.push({message:error.message,stack:error.stack});console.error(error.stack);process.exitCode=1;}
 finally{if(browser)await browser.close();if(server)await new Promise(resolve=>server.close(resolve));writeReport();}
})();
