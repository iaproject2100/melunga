/* German modern-course account forms. All APIs, payment and course targets are local fixtures. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {test, before, after} = require('node:test');
const {chromium} = require('playwright-core');
const WEB = path.resolve(__dirname, '..');
const ORIGIN = 'https://german-account.test';
const DEVICE = 'german-account-fixture-device';
const EMAIL = 'german-account-fixture@example.test';
const PASSWORD = 'Fictitious-German-password-28';
const QUERY = 'lang=de&study=en&courseReturn=de-en&courseLevel=4';
const report = {status:'running', providerCalled:false, realAccountsUsed:false, cases:[], errors:[]};
let browser;
before(async () => { browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium', args:['--no-sandbox']}); });
after(async () => {
  await browser?.close();
  report.status = report.errors.length ? 'failed' : 'passed';
  if (process.env.GERMAN_ACCOUNT_REPORT) fs.writeFileSync(process.env.GERMAN_ACCOUNT_REPORT, JSON.stringify(report, null, 2) + '\n');
  assert.deepEqual(report.errors, []);
});
async function fixture({mode='login=1', query=QUERY, width=390, delayLoad=false, native=false}={}) {
  const context = await browser.newContext({viewport:{width,height:900}, isMobile:width<760, hasTouch:width<760, reducedMotion:'reduce', serviceWorkers:'block'});
  const state = {posts:[], login:{success:false,error:'invalid_credentials'}, payment:{error:'email_taken'}, paid:false, release:null};
  await context.addInitScript(({device,delayLoad,native}) => {
    localStorage.setItem('ox_device',device);
    localStorage.setItem('ox_nat','de');
    if (native) window.Capacitor = {isNativePlatform:()=>true,getPlatform:()=>'android'};
    window.__germanAccountLoaded = false;
    addEventListener('load',()=>{window.__germanAccountLoaded=true;},{once:true});
    if (delayLoad) document.addEventListener('DOMContentLoaded',()=>{
      const image=document.createElement('img');image.src='/__slow-account-image';image.hidden=true;document.body.appendChild(image);
    },{once:true});
  },{device:DEVICE,delayLoad,native});
  await context.route('**/*',async route => {
    const request=route.request(),url=new URL(request.url());
    if (url.origin!==ORIGIN) return route.abort();
    if (url.pathname==='/__slow-account-image') {
      await new Promise(resolve=>{state.release=async()=>{try{await route.fulfill({status:204});}catch(_){}finally{resolve();}};});
      return;
    }
    if (url.pathname==='/parcours-niveaux.html' || url.pathname==='/__payment-fixture') return route.fulfill({contentType:'text/html',body:'<!doctype html><title>Local return fixture</title>'});
    if (url.pathname==='/.netlify/functions/check-status') return route.fulfill({json:{paid:state.paid}});
    if (url.pathname==='/.netlify/functions/get-pricing') return route.fulfill({json:{monthlyDisplay:'7,90 €',annualDisplay:'42 €'}});
    if (request.method()==='POST') {
      const body=request.postDataJSON();state.posts.push({path:url.pathname,body});
      if (url.pathname.endsWith('/login')) return route.fulfill({json:state.login});
      if (url.pathname.endsWith('/create-payment-link')) return route.fulfill({json:state.payment});
      if (url.pathname.endsWith('/request-device-replacement')) return route.fulfill({json:{success:true}});
      if (url.pathname.endsWith('/confirm-device-replacement')) return route.fulfill({json:{success:true,session_token:'fictitious-german-replacement-session'}});
      throw Error('Unexpected fixture POST '+url.pathname);
    }
    if (/^\/(?:\.netlify|api)\//.test(url.pathname)) return route.fulfill({status:503,json:{error:'Local fixture only'}});
    if (url.pathname.endsWith('/mobile-runtime.js')) return route.fulfill({contentType:'text/javascript',body:''});
    const file=path.resolve(WEB,'.'+url.pathname);
    if (!file.startsWith(WEB+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()) return route.fulfill({status:404,body:'Not found'});
    return route.fulfill({body:fs.readFileSync(file),contentType:{'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml'}[path.extname(file)]||'application/octet-stream'});
  });
  const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));
  await page.goto(ORIGIN+'/app.html?'+mode+'&'+query,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>typeof loginExisting==='function'&&document.getElementById('accountBackdrop'));
  return {context,page,state};
}
async function returned(page) {
  await page.waitForURL(url=>url.pathname==='/parcours-niveaux.html');
  assert.equal(page.url(),ORIGIN+'/parcours-niveaux.html?pair=de-en&level=4');
}
async function hiddenClassic(page) {
  assert.equal(await page.locator('[data-course-login-chrome]').evaluateAll(nodes=>nodes.length>0&&nodes.every(node=>getComputedStyle(node).visibility==='hidden')),true);
  assert.equal(await page.evaluate(()=>nat),'fr');
}

test('German login opens before delayed load and keeps the real form and validation in German',async()=>{
  const {context,page,state}=await fixture({delayLoad:true});
  try {
    await page.locator('#pwLoginEmail').waitFor({state:'visible'});
    await page.waitForFunction(()=>!document.getElementById('bootCover'));
    assert.equal(await page.evaluate(()=>window.__germanAccountLoaded),false);
    assert.equal(await page.locator('html').getAttribute('lang'),'de');
    assert.equal(await page.locator('#pwTitle').textContent(),'Anmelden');
    assert.equal(await page.locator('#pwLoginEmail').getAttribute('placeholder'),'E-Mail-Adresse');
    assert.equal(await page.locator('#pwLoginPassword').getAttribute('placeholder'),'Passwort');
    assert.equal(await page.locator('#courseLoginBack').textContent(),'Zurück zu den Themen');
    await hiddenClassic(page);
    await page.locator('#pwLoginBtn').click();assert.equal(await page.locator('#pwFree').textContent(),'Bitte gib deine E-Mail-Adresse ein.');
    await page.locator('#pwLoginEmail').fill(EMAIL);await page.locator('#pwLoginPassword').fill(PASSWORD);
    await page.locator('#pwLoginBtn').click();await page.waitForFunction(()=>!document.getElementById('pwLoginBtn').disabled);
    assert.equal(await page.locator('#pwFree').textContent(),'E-Mail-Adresse oder Passwort ist falsch.');
    assert.deepEqual(state.posts,[{path:'/.netlify/functions/login',body:{device_id:DEVICE,email:EMAIL,password:PASSWORD}}]);
    await state.release();await page.waitForFunction(()=>window.__germanAccountLoaded);
    await page.waitForTimeout(850);assert.equal(await page.locator('#paywall').isVisible(),true);assert.equal(await page.locator('#pwTitle').textContent(),'Anmelden');await hiddenClassic(page);
    report.cases.push('login-before-delayed-load-real-form-german-validation-and-unchanged-post');
  } finally { await state.release?.();await context.close(); }
});

test('closing and server-confirmed login return to the same German pair and level',async()=>{
  for (const action of ['back','close','escape','success']) {
    const {context,page,state}=await fixture({width:1440});
    try {
      await page.locator('#pwLoginEmail').waitFor({state:'visible'});
      if (action==='success') {
        assert.equal(await page.evaluate(()=>completeApprovedCourseReturn(false,{success:true})),false);
        state.login={success:true,permanent:true};
        await page.locator('#pwLoginEmail').fill(EMAIL);await page.locator('#pwLoginPassword').fill(PASSWORD);await page.locator('#pwLoginBtn').click();
        assert.deepEqual(state.posts[0].body,{device_id:DEVICE,email:EMAIL,password:PASSWORD});
      } else if (action==='escape') await page.keyboard.press('Escape');
      else await page.locator(action==='back'?'#courseLoginBack':'#pwClose').click();
      await returned(page);report.cases.push('typed-de-en-return-'+action);
    } finally { await context.close(); }
  }
});

test('both checkout plans stay German after the delayed 700ms lesson reset and preserve checkout metadata',async()=>{
  for (const plan of ['annual','monthly']) {
    const {context,page,state}=await fixture({mode:'checkout='+plan});
    try {
      await page.locator('#pwEmail').waitFor({state:'visible'});await page.waitForTimeout(850);
      assert.equal(await page.locator('html').getAttribute('lang'),'de');assert.equal(await page.locator('#paywall').isVisible(),true);
      assert.equal(await page.locator('#pwTitle').textContent(),'Vollständigen Zugang freischalten');
      assert.equal(await page.locator('#pwPassword2').getAttribute('placeholder'),'Passwort bestätigen');
      assert.equal(await page.locator('#pwMonthlyLabel').textContent(),'/ 30 Tage');assert.equal(await page.locator('#pwAnnualLabel').textContent(),'/ Jahr');
      assert.match(await page.locator('#pwDesc').textContent(),/ohne automatische Verlängerung/);await hiddenClassic(page);
      assert.equal(await page.evaluate(()=>lang),'en');
      await page.locator('#pwEmail').fill(EMAIL);await page.locator('#pwPassword').fill(PASSWORD);await page.locator('#pwPassword2').fill(PASSWORD);
      await page.locator(plan==='annual'?'#pwAnnual':'#pwMonthly').click();await page.waitForFunction(()=>!document.getElementById('pwAnnual').disabled);
      assert.equal(await page.locator('#pwFree').textContent(),'Diese E-Mail-Adresse wird bereits verwendet.');
      assert.deepEqual(state.posts[0],{path:'/.netlify/functions/create-payment-link',body:{device_id:DEVICE,plan,email:EMAIL,password:PASSWORD}});
      await page.evaluate(()=>rememberCourseReturnForCheckout());const pending=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('melunga-course-return')));
      assert.equal(pending.pair,'de-en');assert.equal(pending.nativeLanguage,'de');assert.equal(pending.studyLanguage,'en');assert.equal(pending.level,4);
      await page.locator('#courseLoginBack').click();await returned(page);report.cases.push('checkout-'+plan+'-german-after-700ms-and-preserved-contract');
    } finally { await context.close(); }
  }
});

test('unapproved, classic and legacy native entries cannot activate the German account overlay',async()=>{
  for (const options of [
    {query:'lang=de&study=en&courseReturn=de-de&courseLevel=4'},
    {query:QUERY+'&classic=1'},
    {query:QUERY,native:true}
  ]) {
    const {context,page}=await fixture(options);
    try {
      assert.equal(await page.evaluate(()=>!!window.MelungaGermanAccountUI?.active),false);
      assert.notEqual(await page.evaluate(()=>nat),'de');
      report.cases.push('scoped-overlay-rejects-'+(options.native?'native':options.query.includes('classic')?'classic':'invalid-pair'));
    } finally { await context.close(); }
  }
});


test('the existing device confirmation dialog is presented in German and preserves its request contract',async()=>{
  const {context,page,state}=await fixture();
  try {
    await page.locator('#pwLoginEmail').waitFor({state:'visible'});
    await page.evaluate(({email,password,device})=>MelungaDeviceReplacement.offer({
      container:document.getElementById('pwFree'),email,password,deviceId:device,
      deviceType:'mobile',deviceLabel:'Local fixture',language:'fr',
      onSuccess(){window.__germanReplacementConfirmed=true;}
    }),{email:EMAIL,password:PASSWORD,device:DEVICE});
    await page.getByRole('button',{name:'Vorheriges Gerät ersetzen',exact:true}).click();
    const dialog=page.locator('body > [role="dialog"][aria-modal="true"]');
    await dialog.getByRole('heading',{name:'Neues Gerät bestätigen'}).waitFor();
    assert.equal(await dialog.locator('input').getAttribute('placeholder'),'Bestätigungscode');
    await page.keyboard.press('Escape');assert.equal(new URL(page.url()).pathname,'/app.html');
    await dialog.getByRole('button',{name:'Gerätewechsel bestätigen',exact:true}).click();
    await dialog.getByText('Der Code ist falsch oder abgelaufen.',{exact:true}).waitFor();
    await dialog.locator('input').fill('123456');
    await dialog.getByRole('button',{name:'Gerätewechsel bestätigen',exact:true}).click();
    await page.waitForFunction(()=>window.__germanReplacementConfirmed);
    assert.deepEqual(state.posts.map(post=>post.path),['/.netlify/functions/request-device-replacement','/.netlify/functions/confirm-device-replacement']);
    assert.deepEqual(state.posts[0].body,{email:EMAIL,password:PASSWORD,device_id:DEVICE,device_type:'mobile',device_label:'Local fixture',language:'fr'});
    assert.deepEqual(state.posts[1].body,{email:EMAIL,device_id:DEVICE,device_type:'mobile',code:'123456'});
    assert.equal(new URL(page.url()).pathname,'/app.html');await hiddenClassic(page);
    report.cases.push('german-device-confirmation-dialog-and-unchanged-contract');
  } finally { await context.close(); }
});
