/* The real classic account form, presented on the course ambience.
 * Every API and navigation target is local/mocked; no account is created. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {execFileSync}=require('node:child_process'),{test,before,after}=require('node:test'),{chromium}=require('playwright-core');
const REPO=path.resolve(__dirname,'../..'),WEB=path.join(REPO,'melunga_deploy'),BASE='a5c721f',ORIGIN='https://course-login.test';
const CSS_INCLUDE='<link rel="stylesheet" href="course-login.css?v=1">\n',JS_INCLUDE='<script src="course-login.js?v=1" defer></script>\n';
const PAIR='fr-es',QUERY='login=1&lang=fr&study=es&courseReturn=fr-es&courseLevel=4',DEVICE='course-login-fixture-device',EMAIL='course-login-fixture@example.test',PASSWORD='Fictitious-course-password-91';
const sha=x=>crypto.createHash('sha256').update(x).digest('hex'),source=f=>fs.readFileSync(path.join(WEB,f));
const old=f=>execFileSync('git',['show',BASE+':melunga_deploy/'+f],{cwd:REPO,maxBuffer:40*1024*1024});
const modules=['account-ui.js','account-ui.css','device-replacement-ui.js','entry-bridge.js','store-billing.js','web-access-v2.js','course-access.js'];
const backend=fs.readdirSync(path.join(WEB,'netlify/functions')).filter(f=>f.endsWith('.mjs')).map(f=>'netlify/functions/'+f);
const inputs=()=>Object.fromEntries(['app.html','course-login.css','course-login.js',...modules,...backend].map(f=>[f,sha(source(f))]));
const report={status:'running',baseCommit:BASE,environment:'local Chromium; mobile/desktop emulated',realAccountsUsed:false,remoteApiCalls:false,publicSiteChecked:false,courseReturnTargetStubbed:true,checks:[],cases:[],errors:[],api:[],screenshots:[]};
let browser,initial;
before(async()=>{initial=inputs();browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});});
after(async()=>{await browser?.close();report.inputsStable=JSON.stringify(initial)===JSON.stringify(inputs());report.inputSha256=initial;report.status=!report.errors.length&&report.checks.length===5&&report.inputsStable?'passed':'failed';if(process.env.COURSE_LOGIN_REPORT)fs.writeFileSync(process.env.COURSE_LOGIN_REPORT,JSON.stringify(report,null,2)+'\n');assert.equal(report.inputsStable,true);assert.deepEqual(report.errors,[]);assert.equal(report.checks.length,5);});
async function checked(name,fn){try{await fn();report.checks.push(name);}catch(e){report.errors.push(name+': '+e.message);throw e;}}
async function fixture({query=QUERY,width=1440,height=900,ambience='ocean',storageFails=false,native=false}={}){
 const context=await browser.newContext({viewport:{width,height},isMobile:width<760,hasTouch:width<760,reducedMotion:'reduce',serviceWorkers:'block'}),f={posts:[],paid:false,login:{success:false,error:'invalid_credentials'},documents:[]};
 await context.addInitScript(({ambience,storageFails,native,device})=>{
  localStorage.setItem('ox_device',device);localStorage.setItem('ox_paid','0');localStorage.setItem('ox_imm','1');localStorage.setItem('ox_bg','#FFE9F0');localStorage.setItem('ox_bgd','0');localStorage.setItem('ox_immgrad','linear-gradient(180deg,#FFE9F0,#DCA0CA)');
  if(ambience!==null)sessionStorage.setItem('melunga-course-ambience',ambience);
  if(storageFails){const get=Storage.prototype.getItem;Storage.prototype.getItem=function(key){if(key==='melunga-course-ambience')throw new DOMException('Fixture unavailable','SecurityError');return get.call(this,key);};}
  if(native)window.Capacitor={isNativePlatform(){return true;},getPlatform(){return'android';}};
  window.__courseLoginReplacementDone=false;
 },{ambience,storageFails,native,device:DEVICE});
 await context.route('**/*',async route=>{
  const req=route.request(),url=new URL(req.url());
  if(url.origin!==ORIGIN)return route.abort();
  if(req.isNavigationRequest())f.documents.push(url.pathname+url.search);
  if(url.pathname==='/parcours-niveaux.html')return route.fulfill({contentType:'text/html',body:'<!doctype html><title>Validated course return fixture</title>'});
  if(url.pathname==='/.netlify/functions/check-status')return route.fulfill({json:{paid:f.paid}});
  if(url.pathname==='/.netlify/functions/get-pricing')return route.fulfill({json:{monthlyDisplay:'7,90 €',annualDisplay:'42 €'}});
  if(url.pathname==='/api/geolocation')return route.fulfill({json:{country:'FR'}});
  if(req.method()==='POST'){
   const body=req.postDataJSON(),entry={method:'POST',path:url.pathname,body};f.posts.push(entry);report.api.push(entry);
   if(url.pathname.endsWith('/login')){if(f.login.success)f.paid=true;return route.fulfill({json:f.login});}
   if(url.pathname.endsWith('/request-device-replacement'))return route.fulfill({json:{success:true}});
   if(url.pathname.endsWith('/confirm-device-replacement'))return route.fulfill({json:{success:true,session_token:'fictitious-course-replacement'}});
   throw Error('Unexpected mocked POST '+url.pathname);
  }
  if(url.pathname.endsWith('/mobile-runtime.js'))return route.fulfill({contentType:'text/javascript',body:''});
  const file=path.resolve(WEB,'.'+decodeURIComponent(url.pathname));
  if(!file.startsWith(WEB+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())return route.fulfill({status:404,body:'Not found'});
  return route.fulfill({contentType:({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream',body:fs.readFileSync(file)});
 });
 const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));await page.goto(ORIGIN+'/app.html?'+query);await page.waitForFunction(()=>typeof window.loginExisting==='function'&&document.getElementById('accountBackdrop'));if(new URL(page.url()).searchParams.get('login')==='1')await page.locator('#paywall').waitFor({state:'visible'});return{...f,context,page,fixture:f};
}
async function capture(page,name){const dir=process.env.COURSE_LOGIN_CAPTURES;if(!dir)return;fs.mkdirSync(dir,{recursive:true});const file=path.join(dir,name+'.png');await page.screenshot({path:file});report.screenshots.push(file);}
async function returnAssertions(page,pair=PAIR,level=4){await page.waitForURL(u=>u.pathname==='/parcours-niveaux.html');const u=new URL(page.url());assert.equal(u.origin,ORIGIN);assert.deepEqual([...u.searchParams],[['pair',pair],['level',String(level)]]);}
function section(s,name){const start=s.indexOf('function '+name+'(');assert.ok(start>=0,name);let end=s.indexOf('\nfunction ',start+1),asyncEnd=s.indexOf('\nasync function ',start+1);if(asyncEnd>=0&&(end<0||asyncEnd<end))end=asyncEnd;assert.ok(end>start,name+' boundary');return s.slice(start,end);}

test('the classic document changes only by two includes; card data, seven business functions and account/backend modules stay exact',()=>checked('source-integrity',async()=>{
 const app=source('app.html').toString(),before=old('app.html').toString();assert.equal(app.split(CSS_INCLUDE).length,2);assert.equal(app.split(JS_INCLUDE).length,2);assert.equal(app.replace(CSS_INCLUDE,'').replace(JS_INCLUDE,''),before);
 const names=['validateCourseReturn','readApprovedCourseReturn','completeApprovedCourseReturn','loginExisting','unlock','getDeviceId','checkPaidStatus'];for(const name of names)assert.equal(section(app,name),section(before,name),name);
 const deck=s=>{const start=s.indexOf('var DECKS = ');return s.slice(start,s.indexOf('\n',start));};assert.equal(deck(app),deck(before));const decks=JSON.parse(deck(app).slice('var DECKS = '.length).replace(/;$/,'')),cards=Object.values(decks).reduce((sum,list)=>sum+list.length,0);assert.equal(cards,32115);
 for(const f of [...modules,...backend])assert.ok(source(f).equals(old(f)),f);report.cases.push({name:'source-integrity',businessFunctions:names,classicCards:cards,classicDeckSha256:sha(deck(app)),protectedModules:modules.length,backendFiles:backend.length});
}));

test('three course ambiences cover the real login form on desktop and Chinese mobile without classic lesson chrome',()=>checked('ambience-and-layout',async()=>{
 for(const locale of ['fr','zh'])for(const ambience of ['ocean','aurora','dusk']){
  const pair=locale==='zh'?'zh-fr':'fr-es',width=locale==='zh'?390:1440,query=new URLSearchParams({login:'1',lang:locale,study:locale==='zh'?'fr':'es',courseReturn:pair,courseLevel:'4'}).toString(),h=await fixture({query,width,ambience});try{
   const {page}=h;assert.equal(await page.locator('body').getAttribute('data-course-ambience'),ambience);assert.equal(await page.locator('html').evaluate(n=>n.classList.contains('course-login')),true);assert.equal(await page.locator('#pwLoginEmail').isVisible(),true);assert.equal(await page.locator('#courseLoginBack').textContent(),locale==='zh'?'返回主题':'Retour aux thèmes');
   const result=await page.evaluate(()=>{const panel=document.getElementById('paywall'),r=panel.getBoundingClientRect(),hidden=[...document.querySelectorAll('[data-course-login-chrome]')];return{bounds:{left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:innerWidth,height:innerHeight},body:getComputedStyle(document.body).backgroundImage,panel:getComputedStyle(panel).backgroundImage,chromeHidden:hidden.every(n=>getComputedStyle(n).visibility==='hidden'),nonHidden:hidden.filter(n=>getComputedStyle(n).visibility!=='hidden').map(n=>({id:n.id,tag:n.tagName,classes:n.className,visibility:getComputedStyle(n).visibility})),formHiddenAncestor:!!panel.closest('[data-course-login-chrome]'),bodyWidth:document.documentElement.scrollWidth,targets:[...panel.querySelectorAll('button,input')].filter(n=>n.getClientRects().length).map(n=>{const b=n.getBoundingClientRect();return{id:n.id,width:b.width,height:b.height};})};});
   assert.ok(result.chromeHidden,JSON.stringify(result.nonHidden));assert.equal(result.formHiddenAncestor,false);assert.match(result.body,/radial-gradient/);assert.match(result.panel,/gradient/);assert.ok(result.bounds.left>=7&&result.bounds.right<=width-7);assert.ok(result.bounds.top>=7&&result.bounds.bottom<=900-7);assert.ok(result.bodyWidth<=width+1);for(const t of result.targets)assert.ok(t.width>=44&&t.height>=44,'44px target '+JSON.stringify(t));assert.deepEqual(h.fixture.posts,[]);await capture(page,locale+'-'+ambience+'-'+width);report.cases.push({name:'ambience-and-layout',locale,ambience,width,...result});
  }finally{await h.context.close();}
 }
 for(const options of [{ambience:'unknown<script>'},{ambience:null},{storageFails:true}]){const h=await fixture({...options,width:320,height:568});try{assert.equal(await h.page.locator('body').getAttribute('data-course-ambience'),'ocean');assert.equal(await h.page.locator('#pwLoginEmail').isVisible(),true);report.cases.push({name:'ambience-fallback',...options});}finally{await h.context.close();}}
}));

test('cross, explicit back, backdrop and Escape return only to the validated pair and level',()=>checked('explicit-cancellation',async()=>{
 for(const mode of ['cross','back','backdrop','escape']){const h=await fixture();try{const {page}=h;if(mode==='escape')await page.keyboard.press('Escape');else if(mode==='cross')await page.locator('#pwClose').click();else if(mode==='back')await page.locator('#courseLoginBack').click();else await page.locator('#accountBackdrop').click({position:{x:10,y:10}});await returnAssertions(page);assert.deepEqual(h.fixture.posts,[]);report.cases.push({name:'explicit-cancellation',mode});}finally{await h.context.close();}}
}));

test('invalid and classic/native routes retain the old account presentation',()=>checked('route-scope',async()=>{
 const cases=[{query:'login=1&lang=fr'},{query:'login=1&lang=fr&study=es&courseReturn=https%3A%2F%2Fevil.test&courseLevel=4'},{query:'login=1&lang=fr&study=es&courseReturn=fr-es&courseLevel=99'},{query:QUERY+'&classic=1'},{query:QUERY+'&checkout=annual'},{query:QUERY+'&login=1'},{query:'start=1&lang=fr&study=es&courseReturn=fr-es&courseLevel=4'},{query:QUERY,native:true}];
 for(const options of cases){const h=await fixture(options);try{assert.equal(await h.page.locator('html').evaluate(n=>n.classList.contains('course-login')),false);assert.equal(await h.page.locator('#courseLoginBack').count(),0);assert.equal(await h.page.locator('[data-course-login-chrome]').count(),0);assert.deepEqual(h.fixture.posts,[]);report.cases.push({name:'route-scope',...options});}finally{await h.context.close();}}
}));

test('real login success owns its handoff; hide and a higher device-replacement dialog never trigger cancellation',()=>checked('auth-and-replacement-handoffs',async()=>{
 const h=await fixture();try{
  const {page}=h;await page.locator('#pwLoginEmail').fill(EMAIL);await page.locator('#pwLoginPassword').fill(PASSWORD);await page.locator('#pwLoginBtn').click();await page.waitForFunction(()=>!document.getElementById('pwLoginBtn').disabled);assert.equal(new URL(page.url()).pathname,'/app.html');assert.equal(await page.locator('#paywall').isVisible(),true);assert.equal(h.fixture.posts.length,1);assert.deepEqual(h.fixture.posts[0].body,{device_id:DEVICE,email:EMAIL,password:PASSWORD});
  await page.evaluate(()=>hidePaywall());await page.waitForTimeout(100);assert.equal(new URL(page.url()).pathname,'/app.html','programmatic hide is not cancellation');assert.equal(await page.locator('[data-course-login-chrome]').evaluateAll(nodes=>nodes.every(n=>getComputedStyle(n).visibility==='hidden')),true,'classic chrome stays hidden throughout a handoff');await page.evaluate(()=>{showPaywall();pwSwitchTab('existing');});
  await page.evaluate(({email,device})=>MelungaDeviceReplacement.offer({container:document.getElementById('pwFree'),email,password:'fictitious-replacement-password',deviceId:device,deviceType:'desktop',deviceLabel:'Fixture',language:'fr',onSuccess(){window.__courseLoginReplacementDone=true;hidePaywall();}}),{email:EMAIL,device:DEVICE});
  await page.locator('[data-device-replacement]').click();const dialog=page.locator('body > [role="dialog"][aria-modal="true"]');await dialog.waitFor({state:'visible'});await page.keyboard.press('Escape');assert.equal(new URL(page.url()).pathname,'/app.html');assert.equal(await page.locator('#paywall').isVisible(),true);await dialog.getByRole('button',{name:'Annuler',exact:true}).click();assert.equal(new URL(page.url()).pathname,'/app.html');
  await page.locator('[data-device-replacement]').click();await dialog.waitFor({state:'visible'});await dialog.locator('input').fill('123456');await dialog.getByRole('button',{name:'Confirmer le remplacement',exact:true}).click();await page.waitForFunction(()=>window.__courseLoginReplacementDone);await page.waitForTimeout(100);assert.equal(new URL(page.url()).pathname,'/app.html','a replacement success that hides the form is not canceled by presentation code');assert.equal(await page.locator('[data-course-login-chrome]').evaluateAll(nodes=>nodes.every(n=>getComputedStyle(n).visibility==='hidden')),true);
  report.cases.push({name:'auth-failure-programmatic-hide-and-replacement',posts:h.fixture.posts.map(p=>p.path)});
 }finally{await h.context.close();}
 const success=await fixture();try{success.fixture.login={success:true,permanent:true};await success.page.locator('#pwLoginEmail').fill(EMAIL);await success.page.locator('#pwLoginPassword').fill(PASSWORD);await success.page.locator('#pwLoginBtn').click();await returnAssertions(success.page);assert.equal(success.fixture.posts.length,1);report.cases.push({name:'existing-login-success-course-handoff'});}finally{await success.context.close();}
}));
