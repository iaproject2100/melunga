/* Read-only checks against the actual production origin. No local server,
 * response fixtures, fake entitlement, account creation or checkout request.
 * Run --probe before release only to diagnose reachability; run without it
 * after the owner-authorized merge and observed production deployment.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {chromium} = require('playwright-core');
const origin = process.env.MELUNGA_PRODUCTION_ORIGIN || 'https://melunga.com';
assert(['melunga.com','www.melunga.com'].includes(new URL(origin).hostname), 'this script is production-only');
const reportPath = process.env.MELUNGA_REPORT_PATH || '/tmp/melunga-production-smoke.json';
const screenshots = process.env.MELUNGA_SCREENSHOT_DIR || '/tmp/melunga-production-screenshots';
const probe = process.argv.includes('--probe');
const report = {version:1, executedAt:new Date().toISOString(), origin, mode:probe?'reachability-only':'post-deployment',
  status:'running', realHostedOrigin:true, localContentServer:false, responseFixtures:false,
  account:'fresh anonymous browser contexts, no paid state injected', physicalPhoneTested:false,
  browser:'Chromium, 390×844 mobile/touch emulation', browserVersion:null,
  proxy:'inherited HTTP(S) proxy; TLS verification remains enabled',
  audio:'real speak() retained with a dispatch recorder; acoustic pronunciation and audible playback not established',
  pairs:[], networkErrors:[], pageErrors:[], blockedActions:[], limitations:[
    'Mobile Chromium emulation is not a physical Android/iPhone test.',
    'The active production files are read from HTTPS, not fulfilled from local fixtures.',
    'Speech text dispatch is checked, but acoustic quality, pronunciation and a listener hearing it are not inferred.'
  ]};
function write(){fs.writeFileSync(reportPath, JSON.stringify(report,null,2)+'\n');}
function proxySettings(){
  const inherited = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
  if(!inherited) return undefined;
  const url = new URL(inherited);
  const settings = {server:url.protocol+'//'+url.hostname+(url.port?':'+url.port:'')};
  if(url.username) settings.username=decodeURIComponent(url.username);
  if(url.password) settings.password=decodeURIComponent(url.password);
  return settings;
}
async function text(page,id){return page.locator('#'+id).textContent();}
async function state(page){return page.evaluate(()=>MelungaCurriculum.state());}
async function ready(page){
  await page.waitForFunction(()=>window.MelungaCurriculum&&MelungaCurriculum.active()&&!MelungaCurriculum.state().loading&&!MelungaCurriculum.state().error,null,{timeout:30000});
  await page.waitForFunction(()=>{const cover=document.getElementById('bootCover');return !cover||cover.classList.contains('hide');},null,{timeout:15000});
}
async function paidState(page){return page.evaluate(()=>({paid:window.isPaid,storedPaid:localStorage.getItem('ox_paid'),native:window.nat,study:window.lang}));}
async function realJson(page,file){
  return page.evaluate(async file=>{
    const response=await fetch(file,{cache:'no-store',credentials:'same-origin'});
    if(!response.ok)throw new Error(file+' HTTP '+response.status);
    return {body:await response.text(),url:response.url,status:response.status};
  },file);
}
async function playLesson(page,item,result){
  const phrases=Object.fromEntries(item.phrases.map(p=>[p.id,p]));
  const initial=await state(page);
  assert.equal(initial.lessonId,item.id,'visible lesson click opens expected source lesson');
  for(let i=0;i<item.steps.length;i++){
    const step=item.steps[i];
    assert.equal((await state(page)).stepIndex,i);
    if(step.choices){
      const buttons=page.locator('#curriculumChoices button');
      assert.equal(await buttons.count(),step.choices.length);
      await buttons.first().click();
    }
    const phrase=phrases[step.utterance||(step.choices&&step.choices[0])];
    const received=phrase.kind==='received'||phrase.speaker==='B'||step.kind==='receive'||step.speaker==='B';
    const hidden=!received&&(step.kind==='choose-and-recall'||step.kind==='reply-without-model');
    assert.equal(await text(page,'cn'),phrase.native,'meaning is the served native field');
    assert.equal(await text(page,'fr'),hidden?'':phrase.study,'study is served text or intentionally hidden');
    assert.equal(await text(page,'phon'),hidden?'':phrase.phon,'phonetic field stays verbatim');
    assert.equal((await state(page)).hidden,hidden);
    if(received){
      result.receivedSteps++;
      assert.equal(await page.locator('#curriculumReveal').isVisible(),false,'received utterances are never recall prompts');
    }
    const ear=page.locator('#curriculumEar');
    assert(await ear.isVisible());assert(await ear.isEnabled());
    await ear.click();
    assert.equal(await text(page,'fr'),phrase.study,'ear restores exact studied text');
    assert.equal(await text(page,'phon'),phrase.phon,'ear restores exact phonetics');
    assert.equal(await page.evaluate(()=>__productionSpeech.at(-1)),phrase.study,'real speech dispatch reads study, not phonetics');
    if(hidden){
      result.recallSteps++;
      await page.locator('#curriculumReveal').click();
      assert.equal((await state(page)).hidden,true,'model can be hidden again');
      await ear.click();
    }
    await page.locator('#rateKnownLabel').click();
    result.steps++;
  }
  assert.equal((await state(page)).complete,true,'lesson has a bounded ending');
  result.lessons.push({id:item.id,title:item.title,steps:item.steps.length});
  await page.locator('#curriculumPlan').click();
  assert.equal((await state(page)).screen,'plan');
}

(async()=>{
  let browser;
  try{
    fs.mkdirSync(screenshots,{recursive:true});
    browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',
      args:['--no-sandbox'],proxy:proxySettings()});
    report.browserVersion=browser.version();
    for(const study of probe?['zh']:['zh','es']){
      const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
      const page=await context.newPage();
      const result={pair:'fr-'+study,status:'running',url:origin+'/app.html?start=1&lang=fr&study='+study,
        steps:0,receivedSteps:0,recallSteps:0,lessons:[],apiRequests:[]};
      report.pairs.push(result);
      page.on('pageerror',error=>report.pageErrors.push({pair:result.pair,message:error.message}));
      page.on('requestfailed',request=>report.networkErrors.push({pair:result.pair,url:new URL(request.url()).origin+new URL(request.url()).pathname,error:request.failure()?.errorText}));
      page.on('request',request=>{
        const u=new URL(request.url());
        if(u.pathname.includes('/.netlify/'))result.apiRequests.push({method:request.method(),path:u.pathname});
      });
      const navigation=await page.goto(result.url,{waitUntil:'domcontentloaded',timeout:45000});
      result.navigationStatus=navigation?.status();result.finalUrl=page.url();
      assert(navigation&&navigation.ok(),'production document returned a successful HTTP response');
      if(probe){
        result.title=await page.title();
        result.curriculumModuleObserved=await page.evaluate(()=>!!window.MelungaCurriculum);
        result.status='reachable-predeployment-only';
        await page.screenshot({path:path.join(screenshots,'reachability.png')});
        await context.close();continue;
      }
      await ready(page);
      // The existing delayed entry bridge reapplies the target once at 700 ms.
      await page.waitForTimeout(900);
      await ready(page);
      const account=await paidState(page);
      assert.equal(account.paid,false,'the real fresh session is non-paying');
      assert.notEqual(account.storedPaid,'1');assert.equal(account.native,'fr');assert.equal(account.study,study);
      result.account=account;
      const served=await realJson(page,'content/curriculum/fr-'+study+'.json');
      result.bundle={url:served.url,status:served.status,sha256:crypto.createHash('sha256').update(served.body).digest('hex')};
      const bundle=JSON.parse(served.body),l1=bundle.levels.find(l=>l.level===1);
      assert.equal(l1.lessons.length,9);
      assert.deepEqual(l1.lessons.map(l=>l.capability),['01','07','08','09','02','03','04','05','06']);
      assert.equal(await page.locator('.curriculum-lesson').count(),9);
      await page.screenshot({path:path.join(screenshots,result.pair+'-plan.png')});
      await page.evaluate(()=>{
        window.__productionSpeech=[];
        const original=window.speak;
        window.speak=function(study,button){window.__productionSpeech.push(study);return original.apply(this,arguments);};
      });
      // All nine lessons are played from visible buttons; the browser reads
      // the source expectations from the live HTTPS bundle above.
      for(let index=0;index<l1.lessons.length;index++){
        await page.locator('.curriculum-lesson').nth(index).click();
        await playLesson(page,l1.lessons[index],result);
      }
      await page.selectOption('#curriculumLevel','2');
      await page.locator('#paywall').waitFor({state:'visible'});
      assert.equal((await state(page)).level,1,'a free account cannot enter the full L2 course');
      result.fullL2Blocked=true;
      await page.locator('#pwClose').click();
      await page.locator('#curriculumLibrary').click();
      assert.equal((await state(page)).screen,'library');
      assert.equal(await page.locator('.curriculum-lesson').count(),11);
      await page.locator('.curriculum-lesson').first().click();
      assert.equal((await state(page)).screen,'lesson');
      assert.equal((await paidState(page)).paid,false);
      result.freeLibraryAccessible=true;
      await page.locator('#curriculumExit').click();
      assert.equal(await page.evaluate(()=>MelungaCurriculum.active()),false);
      const cafe=await realJson(page,'content/l1-cafe.json');
      const cafeData=JSON.parse(cafe.body);
      assert.equal(cafeData.nativeReviewPending,false);
      assert.equal(cafeData.status,'owner-instruction-activated');
      result.cafeMetadata={status:cafeData.status,nativeReviewPending:cafeData.nativeReviewPending,sourceCommit:cafeData.sourceCommit};
      await page.evaluate(()=>setMode('l1-cafe'));
      await page.waitForFunction(()=>window.MelungaL1Cafe&&MelungaL1Cafe.active()&&!MelungaL1Cafe.state().loading&&!MelungaL1Cafe.state().error);
      const cafePair=cafeData.pairs.find(pair=>pair.id==='fr-'+study);
      assert(cafePair,'the served café bundle contains this pair');
      const firstUtterance=cafePair.preparation[0].utterance;
      assert.equal(await page.evaluate(()=>MelungaL1Cafe.state().currentPhraseId),firstUtterance);
      assert.equal(await text(page,'fr'),cafePair.phrases.find(phrase=>phrase.id===firstUtterance).study);
      result.separateCafeActivated=true;
      await page.screenshot({path:path.join(screenshots,result.pair+'-cafe.png')});
      assert.equal((await paidState(page)).paid,false,'no paid status granted by either course');
      const forbidden=result.apiRequests.filter(r=>r.method!=='GET'&&/login|signup|register|checkout|payment|subscribe|create|purchase/i.test(r.path));
      assert.deepEqual(forbidden,[],'no account or payment mutation is submitted');
      result.status='passed';
      await context.close();
    }
    assert.deepEqual(report.pageErrors,[],'no production JavaScript exception');
    report.status=probe?'reachability-only':'passed';
  }catch(error){
    report.status='failed';report.failure={message:error.message,stack:error.stack};process.exitCode=1;
  }finally{
    if(browser)await browser.close();write();
    console.log(JSON.stringify({report:reportPath,status:report.status,pairs:report.pairs.map(p=>({pair:p.pair,status:p.status,steps:p.steps})),failure:report.failure?.message},null,2));
  }
})();
