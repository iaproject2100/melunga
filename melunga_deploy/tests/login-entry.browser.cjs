/* One-click sign-in from the real home page into the lesson ambience.
 * Run with NODE_PATH exposing playwright-core, and CHROMIUM_PATH if needed.
 * Every API and external request is intercepted; no real account is used.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const {test,before,after} = require('node:test');
const {chromium} = require('playwright-core');

const ROOT = path.resolve(__dirname,'..');
const PASSWORD = 'Fictitious-entry-password-28';
const EMAIL = 'login-entry-fixture@example.test';
let server,base,browser;

before(async()=>{
  server=http.createServer((req,res)=>{
    let pathname=new URL(req.url,'http://fixture').pathname;
    if(pathname==='/')pathname='/index.html';
    const file=path.resolve(ROOT,'.'+pathname);
    if(!file.startsWith(ROOT+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){
      res.writeHead(404).end();return;
    }
    res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css',
      '.json':'application/json','.png':'image/png','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');
    fs.createReadStream(file).pipe(res);
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  base='http://127.0.0.1:'+server.address().port;
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
});
after(async()=>{
  await browser?.close();
  if(server)await new Promise(resolve=>server.close(resolve));
});

async function open({width=390,height=844,locale='fr',delayLoad=false}={}){
  const context=await browser.newContext({viewport:{width,height},isMobile:width<1024,
    hasTouch:width<1024,reducedMotion:'reduce',locale:'fr-FR'});
  const fixture={requests:[],paths:[],errors:[],paid:false,release:null,slowRequested:false};
  await context.addInitScript(({locale,delayLoad})=>{
    localStorage.setItem('melunga-app-language',JSON.stringify({locale,label:locale}));
    localStorage.setItem('ox_imm','1');
    localStorage.setItem('ox_bg','#FFE9F0');
    localStorage.setItem('ox_bgd','0');
    localStorage.setItem('ox_immgrad','linear-gradient(180deg,#FFE9F0,#DCA0CA)');
    window.__loginEntryTrace={welcomeFrames:0,signinFrames:0,loaded:false};
    addEventListener('load',()=>{window.__loginEntryTrace.loaded=true;},{once:true});
    function sample(){
      const trace=window.__loginEntryTrace;
      const welcome=document.getElementById('welcome');
      if(welcome&&getComputedStyle(welcome).display!=='none'&&getComputedStyle(welcome).visibility!=='hidden'
          &&welcome.getBoundingClientRect().height>0)trace.welcomeFrames++;
      const signin=document.querySelector('.screen[data-screen="signin"].active');
      if(signin&&getComputedStyle(signin).display!=='none')trace.signinFrames++;
      requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
    if(delayLoad&&/\/app(?:\.html)?$/.test(location.pathname)){
      document.addEventListener('DOMContentLoaded',()=>{
        const image=document.createElement('img');
        image.src='/__login_entry_slow_image.png';
        image.alt='';image.style.cssText='position:fixed;width:1px;height:1px;opacity:0;pointer-events:none';
        document.body.appendChild(image);
      },{once:true});
    }
  },{locale,delayLoad});
  await context.route('**/*',async route=>{
    const req=route.request(),url=new URL(req.url());
    if(url.origin!==base)return route.abort();
    if(url.pathname==='/__login_entry_slow_image.png'){
      fixture.slowRequested=true;
      await new Promise(resolve=>{
        fixture.release=async()=>{
          await route.fulfill({contentType:'image/png',body:Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aK/0AAAAASUVORK5CYII=','base64')});
          resolve();
        };
      });
      return;
    }
    if(url.pathname.includes('/.netlify/')||url.pathname==='/api/geolocation'){
      let body=null;try{body=req.postDataJSON();}catch(_error){}
      fixture.requests.push({path:url.pathname,method:req.method(),body});
      if(url.pathname.endsWith('/login')){
        fixture.paid=true;
        return route.fulfill({json:{success:true,expiry:null,permanent:true,session_token:'fictitious-entry-session'}});
      }
      if(url.pathname.endsWith('/get-pricing'))return route.fulfill({json:{country:'FR',monthlyDisplay:'7,90 €',annualDisplay:'42 €'}});
      if(url.pathname==='/api/geolocation')return route.fulfill({json:{country:'FR'}});
      if(url.pathname.endsWith('/check-status'))return route.fulfill({json:{paid:fixture.paid,
        ...(fixture.paid?{expiry:null,permanent:true}:{})}});
      return route.fulfill({json:{success:false,error:'test_fixture'}});
    }
    if(url.pathname.endsWith('/mobile-runtime.js'))return route.fulfill({contentType:'text/javascript',body:''});
    return route.continue();
  });
  const page=await context.newPage();
  page.on('pageerror',error=>fixture.errors.push(error.message));
  page.on('framenavigated',frame=>{if(frame===page.mainFrame())fixture.paths.push(new URL(frame.url()).pathname);});
  await page.goto(base+'/index.html');
  await page.locator('[data-go="signin"]:visible').first().waitFor();
  return {page,context,fixture};
}

async function clickSignIn(h,{beforeLoad=false}={}){
  const {page}=h;
  const result=await Promise.all([
    page.waitForURL(url=>url.pathname==='/app.html'&&url.searchParams.get('login')==='1',{
      waitUntil:beforeLoad?'domcontentloaded':'load',timeout:10000}),
    page.locator('[data-go="signin"]:visible').first().click({noWaitAfter:true})
  ]);
  await page.locator('#paywall').waitFor({state:'visible',timeout:7000});
  await page.waitForFunction(()=>document.getElementById('accountBackdrop')
    &&!document.getElementById('accountBackdrop').hidden
    &&(!document.getElementById('bootCover')||document.getElementById('bootCover').classList.contains('hide')));
  return result;
}

async function readyAssertions(h,locale){
  const {page,fixture}=h;
  const url=new URL(page.url());
  assert.equal(url.searchParams.get('lang'),locale,'the chosen home-page language follows the direct login');
  assert.equal(await page.locator('#pwExistingSection').isVisible(),true);
  assert.equal(await page.locator('#pwNewSection').isVisible(),false);
  assert.equal(await page.locator('#pwTabExisting').getAttribute('aria-selected'),'true');
  assert.equal(await page.locator('#welcome').isVisible(),false,'the old splash is never presented as another step');
  assert.equal(await page.evaluate(()=>nat),locale);
  assert(await page.evaluate(()=>pool.length>0),'the lesson behind the form has a real card pool');
  const trace=await page.evaluate(()=>window.__loginEntryTrace);
  assert.equal(trace.welcomeFrames,0,'no rendered frame exposes the old splash');
  assert.equal(trace.signinFrames,0,'no intermediate sign-in screen is rendered in the app');
  assert.deepEqual(fixture.paths,['/index.html','/app.html'],'one click makes only the direct page transition');
  const ambience=await page.evaluate(()=>({bg:getComputedStyle(document.documentElement).getPropertyValue('--bg').trim(),
    immersive:document.body.classList.contains('immersif'),
    panel:getComputedStyle(document.getElementById('paywall')).backgroundImage}));
  assert.equal(ambience.bg.toLowerCase(),'#ffe9f0','the saved lesson colour is retained');
  assert(ambience.immersive,'the existing lesson ambience remains active');
  assert(ambience.panel.includes('linear-gradient'),'the login form uses the lesson gradient');
  assert.deepEqual(fixture.errors,[]);
}

async function closeAndReadLesson(h){
  await h.page.locator('#bootCover').waitFor({state:'hidden'});
  await h.page.locator('#pwClose').click();
  await h.page.locator('#paywall').waitFor({state:'hidden'});
  await h.page.locator('#card').waitFor({state:'visible'});
  assert.equal(await h.page.locator('#accountBackdrop').isVisible(),false);
  assert.equal(await h.page.locator('#welcome').isVisible(),false);
  assert((await h.page.locator('#fr').textContent()).trim().length>0,'closing the login shows a real lesson phrase');
}

for(const [width,height] of [[320,568],[390,844],[1440,900]]){
  for(const locale of ['fr','zh','ko']){
    test(`one click opens sign-in on lesson ambience at ${width}px in ${locale}`,async()=>{
      const h=await open({width,height,locale});
      try{
        await clickSignIn(h);
        await readyAssertions(h,locale);
        await closeAndReadLesson(h);
        assert.deepEqual(h.fixture.errors,[]);
      }finally{await h.context.close();}
    });
  }
}

test('login is ready before a late image finishes and stays open after window load',async()=>{
  const h=await open({delayLoad:true});
  try{
    await clickSignIn(h,{beforeLoad:true});
    await readyAssertions(h,'fr');
    assert.equal(h.fixture.slowRequested,true);
    assert.equal(await h.page.evaluate(()=>window.__loginEntryTrace.loaded),false,'the held image still prevents load');
    await h.fixture.release();
    await h.page.waitForLoadState('load');
    await h.page.waitForTimeout(450);
    assert.equal(await h.page.locator('#paywall').isVisible(),true,'late initialization cannot dismiss the existing login form');
    assert.equal(await h.page.locator('#pwExistingSection').isVisible(),true);
    await closeAndReadLesson(h);
  }finally{await h.context.close();}
});

test('closing before window load is respected and does not reopen the form later',async()=>{
  const h=await open({delayLoad:true,width:1440,height:900});
  try{
    await clickSignIn(h,{beforeLoad:true});
    assert.equal(await h.page.evaluate(()=>window.__loginEntryTrace.loaded),false);
    await closeAndReadLesson(h);
    await h.fixture.release();
    await h.page.waitForLoadState('load');
    await h.page.waitForTimeout(450);
    assert.equal(await h.page.locator('#paywall').isVisible(),false);
    assert.equal(await h.page.locator('#card').isVisible(),true);
    assert.equal(await h.page.locator('#welcome').isVisible(),false);
    assert.deepEqual(h.fixture.errors,[]);
  }finally{await h.context.close();}
});

test('a successful fictitious login before load remains signed in after late initialization',async()=>{
  const h=await open({delayLoad:true});
  try{
    await clickSignIn(h,{beforeLoad:true});
    await h.page.locator('#bootCover').waitFor({state:'hidden'});
    await h.page.locator('#pwLoginEmail').fill(EMAIL);
    await h.page.locator('#pwLoginPassword').fill(PASSWORD);
    await h.page.locator('#pwLoginBtn').click();
    await h.page.locator('#paywall').waitFor({state:'hidden'});
    assert.equal(await h.page.evaluate(()=>isPaid),true);
    const requests=h.fixture.requests.filter(req=>req.path.endsWith('/login'));
    assert.equal(requests.length,1);
    assert.equal(requests[0].body.email,EMAIL);
    await h.fixture.release();
    await h.page.waitForLoadState('load');
    await h.page.waitForTimeout(450);
    assert.equal(await h.page.evaluate(()=>isPaid),true);
    assert.equal(await h.page.locator('#paywall').isVisible(),false);
    assert.equal(await h.page.locator('#card').isVisible(),true);
    assert.deepEqual(h.fixture.errors,[]);
  }finally{await h.context.close();}
});

test('unsupported and inherited language keys fall back to French without a blocked cover',async()=>{
  for(const locale of ['invalide','__proto__']){
    const h=await open();
    try{
      await h.page.goto(base+'/app.html?login=1&lang='+encodeURIComponent(locale));
      await h.page.locator('#paywall').waitFor({state:'visible'});
      await h.page.locator('#bootCover').waitFor({state:'hidden'});
      assert.equal(await h.page.evaluate(()=>nat),'fr');
      assert.equal(await h.page.locator('#pwExistingSection').isVisible(),true);
      assert.equal(await h.page.locator('#accountBackdrop').isVisible(),true);
      assert.equal(await h.page.locator('#welcome').isVisible(),false);
      assert.equal(await h.page.evaluate(()=>window.__loginEntryTrace.welcomeFrames),0);
      assert.deepEqual(h.fixture.errors,[]);
      await closeAndReadLesson(h);
    }finally{await h.context.close();}
  }
});
