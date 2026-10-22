/* Browser coverage for the account menu and the existing login/payment forms.
 * Run with NODE_PATH exposing playwright-core and CHROMIUM_PATH if needed.
 * Every API and external request is intercepted; no account or payment is made.
 */
'use strict';
const {chromium}=require('playwright-core');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const root=path.resolve(__dirname,'..');
const output=process.env.SCREENSHOT_DIR;
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const report={viewports:[],locales:[],flows:[],errors:[]};

(async()=>{
 const server=http.createServer((request,response)=>{
  const file=path.resolve(root,'.'+new URL(request.url,'http://local').pathname);
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){
   response.writeHead(404).end();return;
  }
  response.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml'})[path.extname(file)]||'text/html');
  fs.createReadStream(file).pipe(response);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
  async function open(width=390,height=844,query='start=1&lang=fr&study=es'){
   const context=await browser.newContext({viewport:{width,height},isMobile:width<1000,hasTouch:width<1000,reducedMotion:'reduce'});
   const fixture={login:{success:false,error:'invalid_credentials'},payment:{error:'test_fixture'},replacementRequest:{success:true},replacementConfirmation:{success:true,session_token:'account-ui-replacement-session'},requests:[]};
   await context.route('**/*',route=>{
    const request=route.request(),url=new URL(request.url());
    if(url.pathname.includes('/.netlify/')){
     let body=null;try{body=request.postDataJSON();}catch(_error){}
     fixture.requests.push({path:url.pathname,method:request.method(),body});
     const data=url.pathname.endsWith('/get-pricing')?{monthlyDisplay:'7,90 €',annualDisplay:'42 €'}
      :url.pathname.endsWith('/login')?fixture.login
      :url.pathname.endsWith('/create-payment-link')?fixture.payment
      :url.pathname.endsWith('/request-device-replacement')?fixture.replacementRequest
      :url.pathname.endsWith('/confirm-device-replacement')?fixture.replacementConfirmation:{paid:false};
     return route.fulfill({json:data});
    }
    if(url.pathname.endsWith('/mobile-runtime.js'))return route.fulfill({contentType:'text/javascript',body:''});
    if(url.origin!==base)return route.abort();
    return route.continue();
   });
   const page=await context.newPage();
   page.on('pageerror',error=>report.errors.push(error.message));
   await page.goto(base+'/app.html?'+query);
   await page.waitForFunction(()=>typeof pool!=='undefined'&&pool.length&&document.querySelector('#btnAuth')&&document.querySelector('#accountBackdrop'));
   await delay(1100);
   return {page,context,fixture};
  }
  async function screenshot(page,name){
   if(!output)return;
   fs.mkdirSync(output,{recursive:true});
   await page.evaluate(()=>document.fonts.ready);
   await page.screenshot({path:path.join(output,name+'.png'),animations:'disabled'});
  }
  async function visible(page,selector){
   return page.locator(selector).evaluate(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0;});
  }
  async function opened(page,tab='existing'){
   await page.locator('#paywall').waitFor({state:'visible'});
   await page.waitForFunction(()=>!document.getElementById('accountBackdrop').hidden);
   assert.equal(await page.locator('#paywall').getAttribute('role'),'dialog');
   assert.equal(await page.locator('#paywall').getAttribute('aria-modal'),'true');
   assert.equal(await visible(page,tab==='existing'?'#pwExistingSection':'#pwNewSection'),true);
   assert.equal(await visible(page,tab==='existing'?'#pwNewSection':'#pwExistingSection'),false);
   assert.equal(await page.locator('#ctrlDrawer').evaluate(e=>e.classList.contains('open')),false,'account dialog closes the mobile menu');
   assert.equal(await page.locator('#ctrlVeil').evaluate(e=>e.classList.contains('on')),false);
  }
  async function closed(page,{focus=true}={}){
   await page.locator('#paywall').waitFor({state:'hidden'});
   await page.waitForFunction(()=>document.getElementById('accountBackdrop').hidden);
   if(focus){
    const expected=page.viewportSize().width>=1024?'#btnAuth':'.utrigger';
    assert(await page.locator(expected).evaluate(e=>document.activeElement===e),'closing returns focus to the visible launching control '+expected);
   }
  }
  async function menuOpen(page){
   if(page.viewportSize().width<1024){
    await page.locator('.utrigger').click();
    await page.locator('#ctrlDrawer.open').waitFor();
   }
   await page.locator('#btnAuth').waitFor({state:'visible'});
   const menu=await page.locator('#btnAuth').evaluate(e=>{
    const r=e.getBoundingClientRect();return {width:r.width,height:r.height,left:r.left,top:r.top,right:r.right,bottom:r.bottom,label:e.getAttribute('aria-label'),text:e.textContent.trim()};
   });
   assert(menu.width>=44&&menu.height>=44,'account menu tap target is at least 44 × 44 px');
   assert(menu.left>=0&&menu.top>=0&&menu.right<=page.viewportSize().width+1&&menu.bottom<=page.viewportSize().height+1,'account menu item is reachable on screen');
   assert(menu.label&&menu.label.trim(),'account menu has an accessible label');
   await page.locator('#btnAuth').click();
   await opened(page);
   return menu;
  }
  async function fitAndTargets(page){
   const bounds=await page.locator('#paywall').evaluate(e=>{
    const r=e.getBoundingClientRect();
    const targets=Array.from(e.querySelectorAll('button,input')).filter(control=>control.getClientRects().length&&getComputedStyle(control).visibility!=='hidden').map(control=>{
     const t=control.getBoundingClientRect();return {id:control.id,width:t.width,height:t.height};
    });
    return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:innerWidth,height:innerHeight,scrollWidth:e.scrollWidth,clientWidth:e.clientWidth,pageWidth:document.documentElement.scrollWidth,targets};
   });
   assert(bounds.left>=7&&bounds.right<=bounds.width-7&&bounds.top>=7&&bounds.bottom<=bounds.height-7,'dialog fits the viewport with a visible margin: '+JSON.stringify(bounds));
   assert(bounds.pageWidth<=bounds.width+1,'document has no horizontal overflow');
   assert(bounds.scrollWidth<=bounds.clientWidth+1,'account form has no horizontal overflow');
   for(const target of bounds.targets)assert(target.width>=44&&target.height>=44,'44 px account input/button target: '+JSON.stringify(target));
  }
  async function theme(page,name,bg){
   await page.evaluate(target=>{
    for(let i=0;i<16;i++){
     if(getComputedStyle(document.documentElement).getPropertyValue('--bg').trim().toLowerCase()===target.toLowerCase())return;
     cycleAmb();
    }
    throw Error('Missing actual ambience '+target);
   },bg);
   await delay(400); // Existing ambience and form colors animate between presets.
   const colors=await page.locator('#paywall').evaluate(dialog=>{
    function rgba(value){const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');canvas.width=canvas.height=1;ctx.fillStyle=value;ctx.fillRect(0,0,1,1);return Array.from(ctx.getImageData(0,0,1,1).data);}
    const style=getComputedStyle(dialog),backdrop=getComputedStyle(document.getElementById('accountBackdrop'));
    const probe=document.createElement('i');probe.style.setProperty('transition','none','important');dialog.append(probe);
    probe.style.background='linear-gradient(color-mix(in srgb,var(--bg) 64%,transparent),color-mix(in srgb,var(--bg) 64%,transparent)),var(--immgrad)';
    const expectedImage=getComputedStyle(probe).backgroundImage;
    probe.style.backgroundColor='color-mix(in srgb,var(--bg) 85%,var(--card) 15%)';
    const expectedField=rgba(getComputedStyle(probe).backgroundColor);probe.remove();
    return {surface:rgba(style.backgroundColor),image:style.backgroundImage,expectedImage,field:rgba(getComputedStyle(document.getElementById('pwLoginEmail')).backgroundColor),expectedField,shadow:style.boxShadow,backdrop:rgba(backdrop.backgroundColor),backdropOpacity:Number(backdrop.opacity),bg:getComputedStyle(document.documentElement).getPropertyValue('--bg').trim(),light:document.body.classList.contains('ambclair')};
   });
   assert.equal(colors.bg.toLowerCase(),bg.toLowerCase());
   assert.equal(colors.image,colors.expectedImage,'account surface follows the selected gradient through its 64% ambience wash');
   assert(colors.field.every((value,index)=>Math.abs(value-colors.expectedField[index])<=1),'account fields use the chosen background/card mix: '+JSON.stringify(colors));
   assert(colors.backdrop[3]/255*colors.backdropOpacity<=.35,'backdrop softly dims the selected ambience');
   assert(!/vmax|10000px|9999px/.test(colors.shadow),'dialog has no viewport-covering navy shadow');
   // A computed box shadow converts viewport units to pixels. A large spread is
   // the old opaque mask even if its original 100vmax token is no longer visible.
   for(const shadow of colors.shadow.split(/,(?![^()]*\))/)){
    const lengths=shadow.match(/-?[\d.]+px/g)||[];
    if(lengths.length>=4)assert(Math.abs(parseFloat(lengths[3]))<100,'box shadow cannot be used as an opaque full-screen backdrop');
   }
   await fitAndTargets(page);
   return {name,...colors};
  }
  const lessonState=page=>page.evaluate(()=>({index:idx,cards:pool.map(card=>card.t),ratings:Object.fromEntries(Object.entries(localStorage).filter(([key])=>/^ox_(known|again)_|^melunga_srs/.test(key)))}));
  async function isolatedKeysAndTouch(page){
   const before=await lessonState(page);
   await page.locator('#pwLoginEmail').focus();
   for(const key of ['ArrowDown','ArrowUp','ArrowRight','ArrowLeft','Space'])await page.keyboard.press(key);
   assert.deepEqual(await lessonState(page),before,'account form keyboard does not navigate or rate the lesson');
   const client=await page.context().newCDPSession(page);
   async function swipe(x1,y1,x2,y2){
    await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x1,y:y1}]});
    for(let i=1;i<=6;i++){
     await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x1+(x2-x1)*i/6,y:y1+(y2-y1)*i/6}]});
     await delay(25);
    }
    await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await delay(400);
   }
   try{
    const r=await page.locator('#paywall').boundingBox();
    await swipe(r.x+35,r.y+r.height*.65,r.x+r.width-35,r.y+r.height*.65);
    assert.equal(new URL(page.url()).pathname,'/app.html','horizontal dialog swipe stays in the lesson: '+page.url());
    await swipe(r.x+r.width*.7,r.y+r.height-40,r.x+r.width*.7,r.y+40);
    assert.equal(new URL(page.url()).pathname,'/app.html','vertical dialog swipe stays in the lesson: '+page.url());
    assert.deepEqual(await lessonState(page),before,'horizontal/vertical account swipes cannot navigate or rate');
    await swipe(3,Math.min(page.viewportSize().height-20,450),3,70);
    assert.deepEqual(await lessonState(page),before,'backdrop swipe cannot navigate or rate');
   }finally{await client.detach();}
  }
  async function focusTrap(page){
   const focusable=await page.locator('#paywall').evaluate(e=>Array.from(e.querySelectorAll('button,input,a[href],[tabindex]')).filter(c=>c.tabIndex>=0&&!c.disabled&&c.getClientRects().length&&getComputedStyle(c).visibility!=='hidden').map(c=>c.id));
   assert(focusable.length>=5,'existing customer form has its original focusable controls');
   await page.locator('#'+focusable.at(-1)).focus();await page.keyboard.press('Tab');
   assert.equal(await page.evaluate(()=>document.activeElement.id),focusable[0],'Tab wraps to the first dialog control');
   await page.keyboard.press('Shift+Tab');
   assert.equal(await page.evaluate(()=>document.activeElement.id),focusable.at(-1),'Shift+Tab wraps to the final dialog control');
   await page.locator('#pwLoginPassword').focus();await page.keyboard.press('Escape');await closed(page);
  }

  for(const [width,height] of [[320,568],[390,844],[1440,900]]){
   const {page,context}=await open(width,height);
   await menuOpen(page);
   const themes=[];
   for(const [name,bg] of [['ocean','#06283D'],['rose','#FFE9F0'],['neon','#12081F']]){
    themes.push(await theme(page,name,bg));
    if((width===320&&name==='rose')||(width===390&&name==='ocean')||(width===1440&&name==='neon'))await screenshot(page,`account-${width}x${height}-${name}-login`);
   }
   assert.equal(new Set(themes.map(t=>JSON.stringify([t.surface,t.image]))).size,3,'all three actual ambiences produce distinct account surfaces');
   await page.locator('#pwTabNew').click();await opened(page,'new');await fitAndTargets(page);
   assert.equal(await page.locator('#pwEmail').getAttribute('type'),'email');
   assert.equal(await page.locator('#pwPassword2').getAttribute('autocomplete'),'new-password');
   assert(await visible(page,'#pwMonthly')&&await visible(page,'#pwAnnual'),'both original purchase options remain available');
   if(width===320||width===1440)await screenshot(page,`account-${width}x${height}-neon-create`);
   await page.locator('#pwTabExisting').click();await opened(page);
   if(width<1024)await isolatedKeysAndTouch(page);
   await focusTrap(page);
   await menuOpen(page);
   const before=await lessonState(page);
   await page.mouse.click(3,3);await closed(page);
   assert.deepEqual(await lessonState(page),before,'backdrop dismissal does not rate or advance');
   await menuOpen(page);await page.locator('#pwClose').click();await closed(page);
   // Existing scripts sometimes assign display directly after successful login.
   await menuOpen(page);await page.locator('#paywall').evaluate(e=>{e.style.display='none';});await closed(page,{focus:false});
   await page.evaluate(()=>showPaywall());await opened(page);await page.evaluate(()=>hidePaywall());await closed(page,{focus:false});
   report.viewports.push({width,height,themes,keyboard:true,touch:width<1024,legacyShowHide:true});
   console.log(`PASS ${width}×${height}: menu, three ambiences, original tabs, fit/targets, focus, dismissal and legacy show/hide`);
   await context.close();
  }

  // Changing the site language updates the account menu, title and form labels.
  {
   const {page,context}=await open(320,568);
   const labels=new Set();
   const expected={fr:'Se connecter / Créer un compte',en:'Sign in / Create account',es:'Iniciar sesión / Crear cuenta',zh:'登录 / 注册账号',it:'Accedi / Crea un account',ja:'ログイン / アカウント作成',ko:'로그인 / 계정 만들기'};
   for(const locale of ['fr','en','es','zh','it','ja','ko']){
    await page.evaluate(locale=>setNat(locale),locale);
    await page.waitForFunction(label=>document.getElementById('btnAuth').getAttribute('aria-label')===label,expected[locale]);
    const menu=await menuOpen(page);labels.add(menu.label);
    assert.equal(await page.locator('#pwTabNewTxt').textContent(),await page.evaluate(()=>T('pwTabNew')));
    assert.equal(await page.locator('#pwTabExistingTxt').textContent(),await page.evaluate(()=>T('pwTabExisting')));
    assert.equal(await page.locator('#pwLoginBtnTxt').textContent(),await page.evaluate(()=>T('loginBtn')));
    assert.equal(await page.locator('#pwLoginPassword').getAttribute('placeholder'),await page.evaluate(()=>T('passwordPh')));
    await fitAndTargets(page);
    await page.locator('#pwTabNew').click();await opened(page,'new');await fitAndTargets(page);
    await page.keyboard.press('Escape');await closed(page);
    report.locales.push({locale,menuLabel:menu.label});
   }
   assert.equal(labels.size,7,'all seven site languages have translated account menu labels');
   await context.close();console.log('PASS fr/en/es/zh/it/ja/ko: translated account menu and original form labels fit 320 px');
  }

  // Homepage links keep the same forms and server payloads. Fixtures return
  // errors or a fake session token, never a live payment URL or account.
  {
   const {page,context,fixture}=await open(390,844,'login=1&lang=en&study=es');
   await opened(page);
   await page.locator('#pwLoginBtn').click();
   assert.equal(fixture.requests.filter(r=>r.path.endsWith('/login')).length,0,'empty login validates locally');
   await page.locator('#pwLoginEmail').fill('account-ui@example.invalid');
   await page.locator('#pwLoginPassword').fill('fixture-password');
   await page.locator('#pwLoginBtn').click();
   await page.waitForFunction(()=>!document.getElementById('pwLoginBtn').disabled);
   assert.equal(fixture.requests.filter(r=>r.path.endsWith('/login')).length,1);
   assert.equal(await page.locator('#paywall').isVisible(),true,'failed login keeps the form open');
   fixture.login={success:true,session_token:'account-ui-fixture-session'};
   await page.locator('#pwLoginBtn').click();await closed(page,{focus:false});
   assert.equal(await page.evaluate(()=>isPaid),true,'original successful login grants fixture access');
   assert.equal(await visible(page,'#card'),true,'successful login returns to the lesson');
   assert.equal(await page.locator('#btnAuth').evaluate(e=>e.hidden),true,'successful login hides the sign-in menu');
   const request=fixture.requests.filter(r=>r.path.endsWith('/login')).at(-1);
   assert.equal(request.body.email,'account-ui@example.invalid');assert.equal(request.body.password,'fixture-password');
   assert(request.body.device_id,'original login still supplies its device identifier');
   report.flows.push('homepage-login-validation-failure-success');await context.close();
  }
  {
   const {page,context,fixture}=await open();
   // The optional access-v2 asset is not loaded by the base app. Load its real
   // local integration explicitly to cover its secondary device-code dialog.
   await page.addScriptTag({url:base+'/web-access-v2.js'});
   fixture.login={success:false,error:'device_limit_reached',device_type:'mobile'};
   await menuOpen(page);
   await page.locator('#pwLoginEmail').fill('account-ui@example.invalid');
   await page.locator('#pwLoginPassword').fill('fixture-password');
   await page.locator('#pwLoginBtn').click();
   const replace=page.locator('[data-device-replacement]');await replace.waitFor({state:'visible'});await replace.click();
   const replacement=page.locator('body > [role="dialog"][aria-modal="true"]');
   await replacement.waitFor({state:'visible'});
   const code=replacement.locator('input[autocomplete="one-time-code"]');
   await code.focus();await code.fill('123456');
   assert(await code.evaluate(e=>document.activeElement===e),'device replacement code input keeps focus above the account form');
   assert.equal(await code.inputValue(),'123456');
   await page.keyboard.press('Escape');
   assert(await visible(page,'#paywall'),'Escape in replacement must not close the underlying account form');
   assert.equal(await page.locator('#accountBackdrop').evaluate(e=>e.hidden),false);
   if(!await replacement.count()){await replace.click();await replacement.waitFor({state:'visible'});}
   await code.fill('123456');await replacement.locator('button').last().click();
   await closed(page,{focus:false});
   assert.equal(await page.evaluate(()=>localStorage.getItem('ox_session')),'account-ui-replacement-session');
   const request=fixture.requests.find(r=>r.path.endsWith('/confirm-device-replacement'));
   assert.equal(request.body.code,'123456');
   report.flows.push('device-replacement-code-focus-confirmation');await context.close();
  }
  for(const plan of ['monthly','annual']){
   const {page,context,fixture}=await open(390,844,`checkout=${plan}&lang=fr&study=es`);
   await opened(page,'new');
   assert(await page.locator('#'+(plan==='annual'?'pwAnnual':'pwMonthly')).evaluate(e=>e.classList.contains('pwPlanChosen')),'homepage checkout preserves selected '+plan+' plan');
   const button=page.locator(plan==='annual'?'#pwAnnual':'#pwMonthly');
   await button.click();assert.equal(fixture.requests.filter(r=>r.path.endsWith('/create-payment-link')).length,0,'empty checkout validates locally');
   await page.locator('#pwEmail').fill('account-ui@example.invalid');await page.locator('#pwPassword').fill('fixture-password');
   await page.locator('#pwPassword2').fill('wrong-confirmation');await button.click();
   assert.equal(fixture.requests.filter(r=>r.path.endsWith('/create-payment-link')).length,0,'password confirmation validates locally');
   await page.locator('#pwPassword2').fill('fixture-password');await button.click();
   await page.waitForFunction(()=>!document.getElementById('pwMonthly').disabled&&!document.getElementById('pwAnnual').disabled);
   const requests=fixture.requests.filter(r=>r.path.endsWith('/create-payment-link'));
   assert.equal(requests.length,1);assert.equal(requests[0].body.plan,plan);assert.equal(requests[0].body.email,'account-ui@example.invalid');
   assert.equal(new URL(page.url()).origin,base,'payment fixture never navigates to an external provider');
   await page.keyboard.press('Escape');await closed(page,{focus:false});
   assert.equal(await visible(page,'#card'),true,'closing homepage checkout restores the lesson');
   report.flows.push('homepage-'+plan+'-checkout-validation-payload');await context.close();
  }
  assert.deepEqual(report.errors,[],'no JavaScript errors during account flows');
  if(output)fs.writeFileSync(path.join(output,'account-ui-report.json'),JSON.stringify(report,null,2)+'\n');
  console.log('PASS homepage login and monthly/annual checkout with isolated API fixtures; no JavaScript errors');
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
