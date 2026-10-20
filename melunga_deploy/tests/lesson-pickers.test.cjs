/* Browser checks for lesson language/level selectors only.
 * NODE_PATH exposes playwright-core; no live APIs, audio or real APK are used.
 */
'use strict';
const {chromium}=require('playwright-core');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const root=path.resolve(__dirname,'..');
const shotDirectory=process.env.SCREENSHOT_DIR;
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));

(async()=>{
 const server=http.createServer((request,response)=>{
  const file=path.resolve(root,'.'+new URL(request.url,'http://local').pathname);
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){
   response.writeHead(404);response.end();return;
  }
  response.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.json')?'application/json':'text/html');
  fs.createReadStream(file).pipe(response);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
  async function open({width=320,height=568,native=false}={}){
   const context=await browser.newContext({viewport:{width,height},isMobile:width<1000,hasTouch:width<1000});
   if(native)await context.addInitScript(()=>{window.Capacitor={isNativePlatform:()=>true,getPlatform:()=> 'android',Plugins:{}};});
   await context.route('**/*',route=>{
    const url=new URL(route.request().url());
    if(url.pathname.includes('/.netlify/'))return route.fulfill({json:{paid:false}});
    if(url.pathname.endsWith('/mobile-runtime.js'))return route.fulfill({contentType:'text/javascript',body:''});
    if(url.origin!==base)return route.abort();
    return route.continue();
   });
   const page=await context.newPage();const errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   await page.goto(base+'/app.html?start=1&lang=fr&study=es');
   await page.waitForFunction(()=>typeof lang==='string'&&lang==='es'&&typeof pool!=='undefined'&&pool.length&&document.querySelector('#lessonPicker'));
   await page.waitForTimeout(1050);
   const languageTrigger=native?'#studyLang':'.desktop-progress-language';
   const levelTrigger=native?'#currentLevel':'.desktop-progress-level';
   await page.locator(languageTrigger).waitFor({state:'visible'});
   return {page,context,errors,languageTrigger,levelTrigger};
  }
  async function opened(page,kind){
   await page.waitForFunction(kind=>{const d=document.querySelector('#lessonPicker');return d?.open&&d.dataset.kind===kind;},kind);
   assert.equal(await page.locator('#ctrlDrawer').evaluate(e=>e.classList.contains('open')),false,'selector must not open the drawer behind it');
   assert.equal(await page.locator('#ctrlVeil').evaluate(e=>e.classList.contains('on')),false);
   assert.equal(await page.locator('.selbox.open').count(),0,'legacy popups must stay closed');
   const style=await page.locator('#lessonPicker').evaluate(e=>{
    const c=getComputedStyle(e),b=getComputedStyle(e,'::backdrop'),r=e.getBoundingClientRect();
    return {background:c.backgroundColor,backdrop:b.backgroundColor,backdropOpacity:b.opacity,left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:innerWidth,height:innerHeight};
   });
   assert.equal(style.background,'rgb(246, 250, 252)','selector surface must be opaque');
   assert.equal(style.backdrop,'rgb(246, 250, 252)','desktop backdrop must hide sidebar and lesson');
   assert.equal(style.backdropOpacity,'1');
   assert(style.left>=-1&&style.top>=-1&&style.right<=style.width+1&&style.bottom<=style.height+1,'selector must fit viewport');
   if(style.width<1024){assert(Math.abs(style.left)<1&&Math.abs(style.top)<1&&Math.abs(style.right-style.width)<1&&Math.abs(style.bottom-style.height)<1,'mobile selector fills screen');}
  }
  async function screenshot(page,name){if(shotDirectory){fs.mkdirSync(shotDirectory,{recursive:true});await page.screenshot({path:path.join(shotDirectory,name+'.png')});}}
  async function closeEscape(page,trigger){
   await page.keyboard.press('Escape');
   await page.waitForFunction(()=>!document.querySelector('#lessonPicker').open);
   assert(await page.locator(trigger).evaluate(e=>document.activeElement===e),'Escape restores launching control focus');
   assert.equal(await page.locator(trigger).getAttribute('aria-expanded'),'false');
  }
  async function swipeWithoutRating(page){
   const snapshot=()=>page.evaluate(()=>({index:idx,cards:pool.map(d=>d.t),archive:Object.keys(localStorage).filter(k=>/^ox_(known|again)_/.test(k)).sort().map(k=>[k,localStorage.getItem(k)])}));
   const before=await snapshot();
   const list=page.locator('.lesson-picker-list');
   await list.evaluate(e=>{e.scrollTop=0;});
   const bounds=await list.boundingBox();
   const client=await page.context().newCDPSession(page);
   async function swipe(x1,y1,x2,y2){
    await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x1,y:y1}]});
    for(let i=1;i<=6;i++){
     await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x1+(x2-x1)*i/6,y:y1+(y2-y1)*i/6}]});
     await delay(35);
    }
    await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await delay(400); // The original rating handler mutates its pool after 300 ms.
   }
   try{
    const middleX=bounds.x+bounds.width/2;
    await swipe(middleX,bounds.y+bounds.height-55,middleX,bounds.y+65);
    assert(await list.evaluate(e=>e.scrollTop>0),'a real touch swipe scrolls the list');
    assert.deepEqual(await snapshot(),before,'vertical list swipe must not change lesson or archive');
    const middleY=bounds.y+Math.min(180,bounds.height/2);
    await swipe(bounds.x+55,middleY,bounds.x+bounds.width-45,middleY);
    assert.deepEqual(await snapshot(),before,'horizontal list swipe must not rate or navigate the lesson');
    assert.equal(await page.locator('#lessonPicker').evaluate(e=>e.open),true);
   }finally{await client.detach();}
  }
  // Phone web: actual controls, nested scrolling, keyboard isolation and access checks.
  {
   const {page:p,context,errors,languageTrigger,levelTrigger}=await open();
   await p.locator(languageTrigger).click();await opened(p,'language');
   assert(await p.locator('.lesson-picker-option').count()>=6);
   assert(await p.locator('.lesson-picker-list').evaluate(e=>e.scrollHeight>e.clientHeight),'language choices scroll on a short phone');
   await screenshot(p,'mobile-langues');
   await swipeWithoutRating(p);
   const indexBefore=await p.evaluate(()=>idx);
   for(const key of ['ArrowDown','ArrowDown','ArrowUp','ArrowRight','ArrowLeft'])await p.keyboard.press(key);
   assert.equal(await p.evaluate(()=>idx),indexBefore,'picker arrows must not navigate the lesson');
   await closeEscape(p,languageTrigger);
   // Both Enter and Space must activate the visible lesson controls.
   await p.locator(languageTrigger).focus();await p.keyboard.press('Enter');await opened(p,'language');await closeEscape(p,languageTrigger);
   await p.locator(levelTrigger).focus();await p.keyboard.press('Space');await opened(p,'level');
   assert.equal(await p.locator('.lesson-picker-option').count(),10);
   assert.deepEqual(await p.locator('.lesson-picker-option').evaluateAll(es=>es.map(e=>e.dataset.value)),Array.from({length:10},(_,i)=>'L'+(i+1)));
   await p.keyboard.press('End');
   assert.equal(await p.evaluate(()=>document.activeElement.dataset.value),'L10');
   const last=await p.locator('.lesson-picker-option[data-value=L10]').boundingBox();
   const list=await p.locator('.lesson-picker-list').boundingBox();
   assert(last.y>=list.y&&last.y+last.height<=list.y+list.height+1,'L10 is visible after scrolling');
   assert(await p.locator('.lesson-picker-list').evaluate(e=>e.scrollTop>0));
   await screenshot(p,'mobile-niveaux');await closeEscape(p,levelTrigger);
   // Controlled Premium state: original handler selects cards, language stays unchanged.
   await p.evaluate(()=>{isPaid=true;buildLevels();});
   await p.locator(levelTrigger).click();await opened(p,'level');
   await p.locator('.lesson-picker-option[data-value=L10]').click();
   await p.waitForFunction(()=>!document.querySelector('#lessonPicker').open&&mode==='L10');
   assert.equal(await p.evaluate(()=>lang),'es');
   assert(await p.evaluate(()=>pool.length>0&&pool.every(d=>d.lv===10)),'Premium L10 selection uses existing level filter');
   assert.equal(await p.locator('#paywall').evaluate(e=>e.style.display),'none');
   // Downgrade test state and start from valid L1; selecting a locked level must show paywall.
   await p.evaluate(()=>{isPaid=false;buildLevels();setMode('L1',null);});await delay(80);
   const freeCards=await p.evaluate(()=>pool.map(d=>d.t));
   await p.locator(levelTrigger).click();await opened(p,'level');
   assert.equal(await p.locator('.lesson-picker-option[data-value=L10] .lesson-picker-lock').count(),1);
   await p.locator('.lesson-picker-option[data-value=L10]').click();
   await p.waitForFunction(()=>document.querySelector('#paywall').style.display==='block');
   assert.deepEqual(await p.evaluate(()=>pool.map(d=>d.t)),freeCards,'locked choice must not replace L1 pool with premium content');
   assert.equal(await p.evaluate(()=>lang),'es');
   assert.equal(await p.locator('#lessonPicker').evaluate(e=>e.open),false);
   assert.deepEqual(errors,[]);console.log('PASS mobile 320×568: opaque selectors, scrolling L10, keyboard/focus, Premium selection and free paywall');await context.close();
  }
  // Desktop: persistent sidebar is covered by opaque dialog backdrop; same picker from menu.
  {
   const {page:p,context,errors,languageTrigger,levelTrigger}=await open({width:1440,height:900});
   await p.locator(languageTrigger).click();await opened(p,'language');await screenshot(p,'ordinateur-langues');await closeEscape(p,languageTrigger);
   await p.locator('#selLang').click();await opened(p,'language');
   await p.locator('.lesson-picker-option[data-value=it]').click();
   await p.waitForFunction(()=>lang==='it'&&!document.querySelector('#lessonPicker').open);
   assert.equal(await p.locator('#ctrlDrawer').evaluate(e=>e.classList.contains('open')),false);
   await p.locator(levelTrigger).focus();await p.keyboard.press('Enter');await opened(p,'level');
   assert.equal(await p.locator('.lesson-picker-option').count(),10);
   await screenshot(p,'ordinateur-niveaux');await closeEscape(p,levelTrigger);
   assert.equal(await p.evaluate(()=>lang),'it');assert.deepEqual(errors,[]);
   console.log('PASS desktop: language from bar/menu, selected language preserved, level keyboard and opaque backdrop');await context.close();
  }
  // Mobile drawer entry follows the same isolated selector, rather than stacking the menus.
  {
   const {page:p,context,errors}=await open({width:390,height:844});
   await p.locator('.utrigger').click();await p.locator('#ctrlDrawer.open').waitFor();
   await p.locator('#selLang').click();await opened(p,'language');
   await p.locator('.lesson-picker-back').click();
   assert.equal(await p.locator('#lessonPicker').evaluate(e=>e.open),false);
   assert.deepEqual(errors,[]);console.log('PASS mobile: drawer language opens an isolated selector');await context.close();
  }
  // Native simulated only: desktop adaptation is skipped, original native header controls used.
  {
   const {page:p,context,errors,languageTrigger,levelTrigger}=await open({native:true});
   const nativeCss=path.resolve(root,'../tools/apk-test/mobile-app.css');
   // The production branch has no APK project. Keep the native parent's
   // pointer-events constraint covered there too, without shipping APK assets.
   await p.addStyleTag({content:fs.existsSync(nativeCss)?fs.readFileSync(nativeCss,'utf8'):'.countrow{pointer-events:none}'});
   assert.equal(await p.locator('.desktop-progress').count(),0,'native simulation skips desktop header adaptation');
   await p.locator(languageTrigger).click();await opened(p,'language');await closeEscape(p,languageTrigger);
   await p.locator(levelTrigger).click();await opened(p,'level');
   assert.equal(await p.locator('.lesson-picker-option').count(),10);await p.keyboard.press('End');
   assert.equal(await p.evaluate(()=>document.activeElement.dataset.value),'L10');
   await closeEscape(p,levelTrigger);assert.deepEqual(errors,[]);
   console.log('PASS Capacitor simulation: native language/header level clicks with parent pointer-events constraint, scrolling and Escape focus');await context.close();
  }
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
