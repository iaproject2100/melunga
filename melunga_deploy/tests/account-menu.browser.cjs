/* Account navigation and existing logout contracts. Local Chromium only.
 * GET status and explicit test logout POSTs are simulated; no real account,
 * payment, feedback, TTS or public-site operation is performed. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');
const {test,before,after} = require('node:test');
const {chromium} = require('playwright-core');
const REPO=path.resolve(__dirname,'../..'), WEB=path.join(REPO,'melunga_deploy');
const BASE='a1085e8cd1b0a070af3b458e3c40b503d8ae0b6f';
// The reviewed original-logo clipping is the only allowed CSS change.
const LOGO_CSS_SHA='af06c0518e80af465eeb4349f5ff1d4a0615bf18b37ac7eeacf5b38eca1bf968';
const DEVICE='account-menu-fixture', ORIGIN='https://account-menu.test';
const read=f=>fs.readFileSync(path.join(WEB,f));
const json=f=>JSON.parse(read(f));
const manifest=json('content/niveaux-progressifs/manifest.json');
const sources=['content/niveaux-progressifs/manifest.json',...manifest.pairs.flatMap(p=>[p.repertoirePath,...p.levels.map(l=>l.dataPath)])];
const protectedFiles=['app.html','index.html','desktop-home.js','store-billing.js','account-ui.js','account-ui.css','maquette-guidee.css','melunga-logo.png','assets/melunga-logo.png','content/course-access.json',...fs.readdirSync(path.join(WEB,'netlify/functions')).filter(f=>f.endsWith('.mjs')).map(f=>'netlify/functions/'+f)];
const products=['course-access.js','maquette-guidee.js','parcours-niveaux.html','maquette-guidee.html','melunga-logo.svg'];
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const fingerprint=()=>Object.fromEntries([__filename,...sources.concat(protectedFiles,products).map(f=>path.join(WEB,f))].sort().map(f=>[path.relative(REPO,f),sha(fs.readFileSync(f))]));
const report={status:'running',baseCommit:BASE,environment:'local Chromium; emulated mobile and desktop sizes',publicSiteChecked:false,physicalPhoneChecked:false,realAccountsUsed:false,actualAudioPlayed:false,allApiCallsMocked:true,apiFixture:'GET check-status and user-confirmed test POST logout only',checks:[],cases:[],errors:[],unexpectedRequests:[],requests:[],screenshots:[]};
report.reviewedLogoCssSha256=LOGO_CSS_SHA;
const REQUIRED=['source-integrity','paid-account-stays-in-course','guest-and-preview','ordinary-logout','permanent-logout','pending-status-and-legacy'];
let browser,inputs;
const checked=async(name,fn)=>{try{await fn();report.checks.push(name);}catch(e){report.errors.push(name+': '+e.message);throw e;}};
before(async()=>{inputs=fingerprint();browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});});
after(async()=>{await browser?.close();report.inputsStable=JSON.stringify(inputs)===JSON.stringify(fingerprint());report.inputSha256=inputs;report.missingChecks=REQUIRED.filter(k=>!report.checks.includes(k));report.status=!report.errors.length&&!report.unexpectedRequests.length&&!report.missingChecks.length&&report.inputsStable?'passed':'failed';if(process.env.ACCOUNT_MENU_REPORT)fs.writeFileSync(process.env.ACCOUNT_MENU_REPORT,JSON.stringify(report,null,2)+'\n');assert.equal(report.inputsStable,true,'inputs must remain frozen');assert.deepEqual(report.errors,[]);assert.deepEqual(report.unexpectedRequests,[]);assert.deepEqual(report.missingChecks,[]);});
function deferred(){let resolve;const promise=new Promise(r=>resolve=r);return{promise,resolve};}
async function fixture({width=390,height=700,paid=true,permanent=false,pair='fr-zh',preview=false,legacy=false}={}){
 const origin=preview?'https://deploy-preview-999--chic-dragon-e2baf2.netlify.app':ORIGIN;
 const context=await browser.newContext({viewport:{width,height},isMobile:width<=760,hasTouch:width<=760,reducedMotion:'reduce',serviceWorkers:'block'});
 const f={origin,context,page:null,serverPaid:paid,permanent,logoutFailure:false,holdLogout:false,holdStatus:false,posts:[],statuses:[],documents:[],postReady:deferred(),statusReady:deferred(),releaseLogout:null,releaseStatus:null};
 await context.addInitScript(({device})=>{
  localStorage.setItem('ox_device',device);localStorage.setItem('ox_paid','1');localStorage.setItem('ox_session','stale-unused-bearer');
  localStorage.setItem('qa-retain-progress','keep');localStorage.setItem('melunga-guided-known-v1',JSON.stringify({version:1,pairs:{'fr-zh':['catalogue:zh:1']}}));
  window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};
  Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},speak(){throw Error('No actual speech expected');},getVoices(){return[];},addEventListener(){}}});
 },{device:DEVICE});
 await context.route('**/*',async route=>{
  const req=route.request(),url=new URL(req.url());
  if(url.origin!==origin){report.unexpectedRequests.push({origin:url.origin,path:url.pathname,method:req.method()});return route.abort();}
  if(req.resourceType()==='document')f.documents.push(url.pathname);
  if(url.pathname==='/.netlify/functions/check-status'&&req.method()==='GET'){
   const body={paid:f.serverPaid&&url.searchParams.get('device_id')===DEVICE,...(f.permanent?{permanent:true}:{})};
   const entry={method:'GET',path:url.pathname,deviceId:url.searchParams.get('device_id'),body};f.statuses.push(entry);report.requests.push(entry);
   if(f.holdStatus){f.holdStatus=false;f.statusReady.resolve();await new Promise(resolve=>{f.releaseStatus=async()=>{await route.fulfill({json:body});resolve();};});return;}
   return route.fulfill({json:body});
  }
  if(url.pathname==='/.netlify/functions/logout'&&req.method()==='POST'){
   const entry={method:'POST',path:url.pathname,body:req.postDataJSON(),authorization:req.headers().authorization||null};f.posts.push(entry);report.requests.push(entry);f.postReady.resolve();
   const settle=async()=>{if(f.logoutFailure)await route.fulfill({status:500,json:{success:false,error:'simulated'}});else{f.serverPaid=false;await route.fulfill({json:{success:true}});}};
   if(f.holdLogout){await new Promise(resolve=>{f.releaseLogout=async()=>{await settle();resolve();};});return;}
   return settle();
  }
  if(req.method()!=='GET'||/^\/(?:\.netlify|api)\//.test(url.pathname)){report.unexpectedRequests.push({path:url.pathname,method:req.method()});return route.abort();}
  if(url.pathname==='/app.html')return route.fulfill({contentType:'text/html',body:'<!doctype html><title>Unexpected account navigation sentinel</title>'});
  const relative=decodeURIComponent(url.pathname).replace(/^\//,'')||'parcours-niveaux.html',file=path.resolve(WEB,relative);
  if(!file.startsWith(WEB+path.sep)||!fs.existsSync(file))return route.fulfill({status:404,body:'Not found'});
  const type={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2'}[path.extname(file)]||'application/octet-stream';
  return route.fulfill({contentType:type,body:fs.readFileSync(file)});
 });
 const page=await context.newPage();f.page=page;page.on('pageerror',e=>report.errors.push(e.message));
 await page.goto(origin+(legacy?'/maquette-guidee.html':'/parcours-niveaux.html')+'?pair='+pair+'&level=1');
 await page.waitForFunction(()=>window.MelungaMockup?.state().screen==='themes');return f;
}
const state=page=>page.evaluate(()=>window.MelungaMockup.state());
const access=page=>page.evaluate(()=>window.MelungaCourseAccess.state());
async function openAccount(f){await f.page.locator('#mgMenuTrigger').click();const row=f.page.locator('#mgMenuNav [data-menu-item="account"]');await row.waitFor();assert.equal(await row.evaluate(n=>n.tagName),'BUTTON','paid account is an in-page button, not a lesson URL');await row.click();await f.page.locator('#mgAccountPanel').waitFor({state:'visible'});}
async function closeMenu(page){await page.keyboard.press('Escape');await page.locator('#mgMenuDialog').waitFor({state:'hidden'});}
async function confirmLogout(f,accept=true){f.page.once('dialog',async d=>{assert.equal(d.type(),'confirm');await(accept?d.accept():d.dismiss());});await f.page.locator('#mgAccountLogout').click();}
async function saveShot(page,name){const dir=process.env.ACCOUNT_MENU_CAPTURES;if(!dir)return;fs.mkdirSync(dir,{recursive:true});const file=path.join(dir,name+'.png');await page.screenshot({path:file});report.screenshots.push(file);}
function stateKey(s){return{screen:s.screen,pairId:s.pairId,level:s.level,phraseId:s.phraseId,stepIndex:s.stepIndex,lessonScope:s.lessonScope};}
async function accountFits(page){const b=await page.locator('#mgMenuDialog').evaluate(n=>{const r=n.getBoundingClientRect(),head=n.querySelector('header').getBoundingClientRect();return{top:r.top,bottom:r.bottom,left:r.left,right:r.right,width:innerWidth,height:innerHeight,headBottom:head.bottom,bodyOverflow:document.documentElement.scrollWidth>innerWidth};});assert.ok(b.top>=0&&b.left>=0&&b.bottom<=b.height+1&&b.right<=b.width+1);assert.equal(b.bodyOverflow,false);for(const id of ['mgAccountBack','mgAccountLogout']){const r=await page.locator('#'+id).evaluate(n=>{const r=n.getBoundingClientRect();return{top:r.top,bottom:r.bottom,height:r.height,width:r.width};});assert.ok(r.top>=b.headBottom-1&&r.bottom<=b.bottom&&r.height>=44&&r.width>=44,id+' stays visible and usable');}}
function section(text,name){const start=text.indexOf('  function '+name+'(');assert.ok(start>=0);const tail=text.slice(start+1);let candidates=['\n  function ','\n  async function ','\n  // Returning'].map(token=>tail.indexOf(token)).filter(i=>i>=0);const end=candidates.length?start+1+Math.min(...candidates):text.length;return text.slice(start,end);}

test('card data, classic account backend, pricing and access filter functions are preserved',()=>checked('source-integrity',async()=>{
 assert.equal(sources.length,78);for(const f of [...sources,...protectedFiles]){if(f==='maquette-guidee.css'){assert.equal(sha(read(f)),LOGO_CSS_SHA,'whole reviewed logo CSS');continue;}const old=execFileSync('git',['show',BASE+':melunga_deploy/'+f],{cwd:REPO,maxBuffer:40*1024*1024});assert.ok(read(f).equals(old),'protected '+f);}
 const current=read('course-access.js').toString(),old=execFileSync('git',['show',BASE+':melunga_deploy/course-access.js'],{cwd:REPO}).toString();
 for(const name of ['canLearn','loginUrl','classicUrl','buildLearningView'])assert.equal(section(current,name),section(old,name),'unchanged whole filter '+name);
 report.sourceJsonCount=78;report.protectedFileCount=protectedFiles.length;report.cases.push({name:'unchanged-data-and-account-backend',json:78,protected:protectedFiles.length});
}));

test('Mon compte opens an in-page account panel and closing preserves the exact current lesson',()=>checked('paid-account-stays-in-course',async()=>{
 for(const item of [{width:390,height:700,pair:'fr-zh',shot:'paid-account-mobile'},{width:1440,height:900,pair:'fr-zh',shot:'paid-account-desktop'},{width:390,height:700,pair:'zh-fr',shot:'paid-account-chinese'}]){
  const f=await fixture(item);try{
   const p=f.page;await p.locator('#mgThemeGrid .mg-theme').first().click();await p.waitForFunction(()=>window.MelungaMockup.state().screen==='lesson');
   const beforeState=stateKey(await state(p)),beforeUrl=p.url(),beforeDocs=f.documents.length;await openAccount(f);
   assert.equal(await p.locator('#mgMenuTitle').textContent(),item.pair==='zh-fr'?'我的账户':'Mon compte');
   assert.equal(await p.locator('#mgAccountStatus').textContent(),item.pair==='zh-fr'?'此设备可使用全部内容。':'Accès complet actif sur cet appareil.');
   assert.equal(await p.locator('#mgAccountLogout').isEnabled(),true);assert.equal(await p.locator('#mgAccountLogin').isVisible(),false);await accountFits(p);await saveShot(p,item.shot);
   assert.equal(p.url(),beforeUrl);assert.deepEqual(stateKey(await state(p)),beforeState);assert.equal(f.documents.length,beforeDocs);assert.equal(f.posts.length,0);
   await p.locator('#mgAccountBack').click();await p.locator('#mgMenuDialog').waitFor({state:'hidden'});assert.deepEqual(stateKey(await state(p)),beforeState);
   assert.ok(!f.documents.includes('/app.html'));report.cases.push({name:'account-in-place',...item,url:beforeUrl,lessonStatePreserved:true});
  }finally{await f.context.close();}
 }
}));

test('forged paid cache keeps direct guest login and preview account is clearly read-only',()=>checked('guest-and-preview',async()=>{
 const guest=await fixture({paid:false});try{const p=guest.page;assert.equal((await access(p)).paid,false);await p.locator('#mgMenuTrigger').click();assert.equal(await p.locator('#mgMenuNav [data-menu-item="account"]').count(),0);const link=p.locator('#mgMenuNav a[href*="login=1"]');assert.equal(await link.count(),1);const q=new URL(await link.getAttribute('href'),guest.origin).searchParams;assert.equal(q.get('courseReturn'),'fr-zh');assert.equal(q.get('courseLevel'),'1');assert.equal(q.get('login'),'1');assert.equal(guest.posts.length,0);report.cases.push({name:'guest-login-retained'});}finally{await guest.context.close();}
 const preview=await fixture({preview:true,paid:true,permanent:true});try{const p=preview.page;await openAccount(preview);assert.equal(await p.locator('#mgAccountStatus').textContent(),'Aperçu de l’espace compte.');assert.equal(await p.locator('#mgAccountLogout').isDisabled(),true);assert.equal(await p.evaluate(()=>window.MelungaCourseAccess.logout()),false);assert.equal(preview.statuses.length,0);assert.equal(preview.posts.length,0);assert.equal((await access(p)).paid,false);assert.equal((await access(p)).unrestricted,true);await saveShot(p,'preview-account-mobile');report.cases.push({name:'preview-is-not-a-fake-session'});}finally{await preview.context.close();}
}));

test('ordinary logout is confirmed, clears only the old local identity and reports storage failure',()=>checked('ordinary-logout',async()=>{
 const f=await fixture();try{const p=f.page;await openAccount(f);await confirmLogout(f,false);assert.equal((await access(p)).paid,true);assert.equal(await p.evaluate(()=>localStorage.getItem('ox_device')),DEVICE);assert.equal(f.posts.length,0);
  const kept=await p.evaluate(()=>({marker:localStorage.getItem('qa-retain-progress'),known:localStorage.getItem('melunga-guided-known-v1')}));
  await confirmLogout(f,true);await p.waitForFunction(()=>!window.MelungaCourseAccess.state().paid&&window.MelungaMockup.state().screen==='themes');
  assert.equal(await p.evaluate(()=>localStorage.getItem('ox_device')),'');assert.equal(await p.evaluate(()=>localStorage.getItem('ox_paid')),'0');assert.deepEqual(await p.evaluate(()=>({marker:localStorage.getItem('qa-retain-progress'),known:localStorage.getItem('melunga-guided-known-v1')})),kept);assert.equal(f.posts.length,0);assert.ok(!f.documents.includes('/app.html'));report.cases.push({name:'ordinary-cancel-then-local-logout'});
 }finally{await f.context.close();}
 const blocked=await fixture();try{const p=blocked.page;await openAccount(blocked);await p.evaluate(()=>{const set=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='ox_device')throw new DOMException('Test write refusal','QuotaExceededError');return set.call(this,k,v);};});await confirmLogout(blocked,true);await p.waitForFunction(()=>document.getElementById('mgAccountError').textContent.includes('impossible'));assert.equal((await access(p)).paid,true);assert.equal(await p.evaluate(()=>localStorage.getItem('ox_device')),DEVICE);assert.equal(await p.evaluate(()=>localStorage.getItem('ox_paid')),'1');assert.equal(blocked.posts.length,0);report.cases.push({name:'ordinary-storage-failure-preserves-session'});}finally{await blocked.context.close();}
}));

test('permanent logout uses the existing server contract and preserves its registered device on failure or success',()=>checked('permanent-logout',async()=>{
 const f=await fixture({permanent:true});try{const p=f.page;f.logoutFailure=true;await openAccount(f);await confirmLogout(f,true);await p.waitForFunction(()=>document.getElementById('mgAccountError').textContent.includes('impossible'));assert.equal((await access(p)).paid,true);assert.equal(await p.evaluate(()=>localStorage.getItem('ox_device')),DEVICE);assert.equal(await p.locator('#mgAccountLogout').isEnabled(),true);assert.equal(f.posts.length,1);assert.deepEqual(f.posts[0].body,{device_id:DEVICE});assert.equal(f.posts[0].authorization,null);
  f.logoutFailure=false;await confirmLogout(f,true);await p.waitForFunction(()=>!window.MelungaCourseAccess.state().paid&&window.MelungaMockup.state().screen==='themes');assert.equal(f.posts.length,2);assert.deepEqual(f.posts[1].body,{device_id:DEVICE});assert.equal(f.posts[1].authorization,null);assert.equal(await p.evaluate(()=>localStorage.getItem('ox_device')),DEVICE);assert.equal(await p.evaluate(()=>localStorage.getItem('ox_paid')),'0');assert.equal(await p.evaluate(()=>localStorage.getItem('qa-retain-progress')),'keep');assert.ok(!f.documents.includes('/app.html'));report.cases.push({name:'permanent-server-failure-and-retry',failedRequests:1,successfulRequests:1,registeredDevicePreserved:true});
 }finally{await f.context.close();}
}));

test('a pending permanent logout coalesces calls and a delayed status cannot grant access again; legacy page stays usable',()=>checked('pending-status-and-legacy',async()=>{
 const checking=await fixture({permanent:true});try{
  const p=checking.page;checking.holdStatus=true;
  await p.evaluate(()=>{window.__qaCheckingStatus=window.MelungaCourseAccess.refresh();return true;});await checking.statusReady.promise;
  assert.equal((await access(p)).paid,false);assert.equal((await access(p)).status,'checking');
  assert.equal(await p.evaluate(()=>window.MelungaCourseAccess.logout()),false,'logout must not announce success before account verification settles');
  assert.equal(checking.posts.length,0);assert.equal(await p.evaluate(()=>localStorage.getItem('ox_device')),DEVICE);
  await checking.releaseStatus();await p.evaluate(()=>window.__qaCheckingStatus);assert.equal((await access(p)).paid,true,'an unchanged server session remains live after the refused logout');
  report.cases.push({name:'refresh-first-refuses-unconfirmed-logout',successAnnounced:false,requests:0});
 }finally{await checking.context.close();}
 const f=await fixture({permanent:true});try{const p=f.page;f.holdLogout=true;await openAccount(f);await confirmLogout(f,true);await f.postReady.promise;assert.equal(await p.locator('#mgAccountLogout').isDisabled(),true);assert.equal(await p.evaluate(()=>{window.__qaLogoutFirst=window.MelungaCourseAccess.logout();window.__qaLogoutSecond=window.MelungaCourseAccess.logout();return window.__qaLogoutFirst===window.__qaLogoutSecond;}),true);assert.equal(f.posts.length,1);
  f.holdStatus=true;await p.evaluate(()=>{window.__qaDelayedStatus=window.MelungaCourseAccess.refresh();return true;});await f.statusReady.promise;
  await f.releaseLogout();assert.equal(await p.evaluate(()=>window.__qaLogoutFirst),true);assert.equal((await access(p)).paid,false);
  await f.releaseStatus();await p.evaluate(()=>window.__qaDelayedStatus);assert.equal((await access(p)).paid,false);assert.equal(await p.evaluate(()=>localStorage.getItem('ox_device')),DEVICE);assert.equal(f.posts.length,1);report.cases.push({name:'permanent-coalescing-and-stale-status',requests:1,stalePaidTrueIgnored:true});
 }finally{if(f.releaseLogout&&f.posts.length===0)await f.releaseLogout();await f.context.close();}
 const legacy=await fixture({legacy:true});try{const p=legacy.page;assert.equal(await p.locator('#mgLevelTrigger').count(),0);await p.locator('#mgMenuTrigger').click();assert.equal(await p.locator('#mgMenuNav a[href*="login=1"]').count(),1);await closeMenu(p);await p.locator('#mgThemeGrid .mg-theme').first().click();await p.waitForFunction(()=>window.MelungaMockup.state().screen==='lesson');assert.equal(legacy.posts.length,0);assert.ok(!legacy.documents.includes('/app.html'));report.cases.push({name:'legacy-l1-menu-and-lesson-retained'});}finally{await legacy.context.close();}
}));
