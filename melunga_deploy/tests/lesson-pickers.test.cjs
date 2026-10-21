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
const visualChecks=[];

(async()=>{
 const server=http.createServer((request,response)=>{
  const file=path.resolve(root,'.'+new URL(request.url,'http://local').pathname);
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){
   response.writeHead(404);response.end();return;
  }
  response.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.json')?'application/json':file.endsWith('.png')?'image/png':file.endsWith('.svg')?'image/svg+xml':'text/html');
  fs.createReadStream(file).pipe(response);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
  async function open({width=320,height=568,native=false}={}){
   const context=await browser.newContext({viewport:{width,height},isMobile:width<1000,hasTouch:width<1000,reducedMotion:'reduce'});
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
   await page.waitForTimeout(60);
   assert.equal(await page.locator('#ctrlDrawer').evaluate(e=>e.classList.contains('open')),false,'selector must not open the drawer behind it');
   assert.equal(await page.locator('#ctrlVeil').evaluate(e=>e.classList.contains('on')),false);
   assert.equal(await page.locator('.selbox.open').count(),0,'legacy popups must stay closed');
   const style=await page.locator('#lessonPicker').evaluate(e=>{
    const c=getComputedStyle(e),b=getComputedStyle(e,'::backdrop'),r=e.getBoundingClientRect();
    const card=document.querySelector('#card'),cr=card.getBoundingClientRect(),cs=getComputedStyle(card);
    const area=q=>Math.max(0,q.right-q.left)*Math.max(0,q.bottom-q.top);
    const visibleCard={left:Math.max(0,cr.left),top:Math.max(0,cr.top),right:Math.min(innerWidth,cr.right),bottom:Math.min(innerHeight,cr.bottom)};
    const covered={left:Math.max(visibleCard.left,r.left),top:Math.max(visibleCard.top,r.top),right:Math.min(visibleCard.right,r.right),bottom:Math.min(visibleCard.bottom,r.bottom)};
    return {background:c.backgroundColor,backdrop:b.backgroundColor,backdropOpacity:b.opacity,left:r.left,top:r.top,right:r.right,bottom:r.bottom,dialogWidth:r.width,dialogHeight:r.height,width:innerWidth,height:innerHeight,native:!!window.Capacitor?.isNativePlatform(),lessonVisible:cs.display!=='none'&&cs.visibility!=='hidden'&&Number(cs.opacity)>0,lessonExposedArea:area(visibleCard)-area(covered)};
   });
   const backdropAlpha=Number((style.backdrop.match(/rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)/)||[])[1]);
   assert(Math.abs(backdropAlpha-.14)<.005,'backdrop softly dims the lesson at alpha .14');
   assert.equal(style.backdropOpacity,'1');
   assert(style.left>=15&&style.top>=15&&style.right<=style.width-15&&style.bottom<=style.height-15,'compact selector must fit inside a 16 px viewport margin');
   assert(Math.abs(style.dialogWidth-Math.min(320,style.width-32))<=1,'selector width is min(320 px, viewport - 32 px)');
   assert(style.dialogHeight<style.height-30&&style.dialogHeight<=440,'selector height stays limited, rather than filling the screen');
   assert(style.lessonVisible,'lesson stays rendered behind the compact selector');
   // Native simulation below covers the original controls, without shipping the
   // real APK layout assets. The exposed lesson area is a web layout check.
   if(!style.native)assert(style.lessonExposedArea>100,'web lesson stays partly exposed beside the translucent backdrop');
   await checkTheme(page,kind);
  }
  async function checkTheme(page,kind){
   const colors=await page.locator('#lessonPicker').evaluate(dialog=>{
    function rgba(value){const c=document.createElement('canvas');c.width=c.height=1;const x=c.getContext('2d');x.fillStyle=value;x.fillRect(0,0,1,1);return Array.from(x.getImageData(0,0,1,1).data);}
    function resolve(value){const probe=document.createElement('i');probe.style.background=value;dialog.append(probe);const result=rgba(getComputedStyle(probe).backgroundColor);probe.remove();return result;}
    function over(a,b){const alpha=a[3]/255;return a.slice(0,3).map((v,i)=>v*alpha+b[i]*(1-alpha)).concat(255);}
    function effective(element){if(!element)return [255,255,255,255];return over(rgba(getComputedStyle(element).backgroundColor),effective(element.parentElement));}
    function luminance(rgb){return rgb.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);}
    function contrast(element){const foreground=luminance(rgba(getComputedStyle(element).color)),background=luminance(effective(element));return (Math.max(foreground,background)+.05)/(Math.min(foreground,background)+.05);}
    const selected=dialog.querySelector('.lesson-picker-option[aria-current=true]');
    const checks=Array.from(dialog.querySelectorAll('.lesson-picker-title,.lesson-picker-label,.lesson-picker-level')).map(element=>({text:element.textContent.trim(),ratio:contrast(element)}));
    return {bg:getComputedStyle(document.documentElement).getPropertyValue('--bg').trim(),surface:rgba(getComputedStyle(dialog).backgroundColor),expectedSurface:resolve('color-mix(in srgb,var(--bg) 80%,var(--card) 20%)'),selected:selected&&rgba(getComputedStyle(selected).backgroundColor),expectedSelected:resolve('color-mix(in srgb,var(--accent) 14%,var(--lp-surface) 86%)'),checks};
   });
   assert.equal(colors.surface[3],255,'selector surface is opaque');
   assert(colors.surface.slice(0,3).some(v=>v<250),'selector surface is tinted, rather than fixed white');
   assert(colors.surface.every((v,i)=>Math.abs(v-colors.expectedSurface[i])<=1),'selector uses the chosen ambience: 80% background + 20% card');
   if(colors.selected)assert(colors.selected.every((v,i)=>Math.abs(v-colors.expectedSelected[i])<=1),'selected choice uses a 14% accent tint');
   for(const check of colors.checks)assert(check.ratio>=4.5,`${kind} text contrast ${check.ratio.toFixed(2)}: ${check.text}`);
   visualChecks.push({kind,viewport:page.viewportSize(),...colors});
  }
  async function screenshot(page,name){if(shotDirectory){fs.mkdirSync(shotDirectory,{recursive:true});await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await page.screenshot({path:path.join(shotDirectory,name+'.png'),fullPage:false});}}
  async function visibleFocus(page){
   const focus=await page.evaluate(()=>{const e=document.activeElement;if(!(e instanceof HTMLElement))return {visible:false};const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {visible:e.matches('[data-lesson-picker],.utrigger')&&s.visibility!=='hidden'&&s.display!=='none'&&r.width>0&&r.height>0&&r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight,tag:e.tagName,id:e.id,className:e.className,rect:{left:r.left,top:r.top,right:r.right,bottom:r.bottom},visibility:s.visibility,display:s.display};});
   if(!focus.visible)focus.controls=await page.locator('[data-lesson-picker],.utrigger').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {id:e.id,className:e.className,tabIndex:e.tabIndex,expanded:e.getAttribute('aria-expanded'),rect:{left:r.left,top:r.top,right:r.right,bottom:r.bottom},visibility:s.visibility,display:s.display};}));
   assert(focus.visible,'closing restores focus to an on-screen lesson control: '+JSON.stringify(focus));
  }
  async function lessonSnapshot(page){return page.evaluate(()=>({index:idx,cards:pool.map(d=>d.t),archive:Object.keys(localStorage).filter(k=>/^ox_(known|again)_/.test(k)).sort().map(k=>[k,localStorage.getItem(k)])}));}
  async function outsideWithoutRating(page){
   const before=await lessonSnapshot(page),bounds=await page.locator('#lessonPicker').boundingBox(),size=page.viewportSize();
   const point=[{x:5,y:5},{x:size.width-5,y:5},{x:5,y:size.height-5},{x:size.width-5,y:size.height-5}].find(p=>p.x<bounds.x||p.x>bounds.x+bounds.width||p.y<bounds.y||p.y>bounds.y+bounds.height);
   assert(point,'there is exposed backdrop outside the compact dialog');
   await page.mouse.click(point.x,point.y);
   await page.waitForFunction(()=>!document.querySelector('#lessonPicker').open);
   await delay(400);
   assert.deepEqual(await lessonSnapshot(page),before,'outside click closes without rating or advancing the lesson');
   await visibleFocus(page);
  }
  async function closeEscape(page,trigger){
   await page.keyboard.press('Escape');
   await page.waitForFunction(()=>!document.querySelector('#lessonPicker').open);
   assert(await page.locator(trigger).evaluate(e=>document.activeElement===e),'Escape restores launching control focus');
   assert.equal(await page.locator(trigger).getAttribute('aria-expanded'),'false');
  }
  async function swipeWithoutRating(page){
   const snapshot=()=>lessonSnapshot(page);
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
   await p.locator(languageTrigger).click();await opened(p,'language');await outsideWithoutRating(p);
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
   assert.deepEqual(errors,[]);console.log('PASS mobile 320×568: compact theme-aware selectors, scrolling L10, keyboard/focus, outside dismissal without rating, Premium selection and free paywall');await context.close();
  }
  // Desktop: compact anchored picker leaves the lesson visible; same picker from menu.
  {
   const {page:p,context,errors,languageTrigger,levelTrigger}=await open({width:1440,height:900});
   await p.locator(languageTrigger).click();await opened(p,'language');await screenshot(p,'ordinateur-langues-entete');
   const anchor=await p.locator(languageTrigger).boundingBox(),popup=await p.locator('#lessonPicker').boundingBox();
   assert(Math.min(Math.abs(popup.y-anchor.y-anchor.height),Math.abs(anchor.y-popup.y-popup.height))<=20,'desktop popup is positioned beside its launching control');
   await p.setViewportSize({width:320,height:568});await opened(p,'language');
   await p.setViewportSize({width:1024,height:768});await opened(p,'language');
   await p.setViewportSize({width:1440,height:900});await opened(p,'language');
   await p.keyboard.press('Escape');await p.waitForFunction(()=>!document.querySelector('#lessonPicker').open);await visibleFocus(p);
   await p.locator('#selLang').click();await opened(p,'language');
   await screenshot(p,'ordinateur-langues');
   await p.locator('.lesson-picker-option[data-value=it]').click();
   await p.waitForFunction(()=>lang==='it'&&!document.querySelector('#lessonPicker').open);
   assert.equal(await p.locator('#ctrlDrawer').evaluate(e=>e.classList.contains('open')),false);
   await p.locator(levelTrigger).focus();await p.keyboard.press('Enter');await opened(p,'level');
   assert.equal(await p.locator('.lesson-picker-option').count(),10);
   await screenshot(p,'ordinateur-niveaux');await closeEscape(p,levelTrigger);
   assert.equal(await p.evaluate(()=>lang),'it');assert.deepEqual(errors,[]);
   console.log('PASS desktop: anchored popup, resize fit, language from bar/menu, selected language preserved and level keyboard');await context.close();
  }
  // Mobile drawer entry follows the same isolated selector, rather than stacking the menus.
  {
   const {page:p,context,errors}=await open({width:390,height:844});
   await p.locator('.utrigger').click();await p.locator('#ctrlDrawer.open').waitFor();
   await p.locator('#selLang').click();await opened(p,'language');
   const header=await p.locator('.desktop-progress-language').boundingBox(),popup=await p.locator('#lessonPicker').boundingBox();
   assert(Math.abs(popup.y-header.y-header.height)<=20,'drawer language popup anchors near the visible lesson header, rather than the closing drawer');
   await screenshot(p,'mobile-390-langues');
   await p.locator('.lesson-picker-back').click();
   assert.equal(await p.locator('#lessonPicker').evaluate(e=>e.open),false);
   await visibleFocus(p);
   await p.locator('.utrigger').click();await p.locator('#ctrlDrawer.open').waitFor();
   await p.locator('#selLv').click();await opened(p,'level');await screenshot(p,'mobile-390-niveaux');
   await outsideWithoutRating(p);
   assert.deepEqual(errors,[]);console.log('PASS mobile 390×844: drawer entries close the drawer, then return focus to an on-screen control');await context.close();
  }
  // Three actual ambience presets, without replaying all functional flows per theme.
  {
   const {page:p,context,errors,languageTrigger,levelTrigger}=await open({width:390,height:844});
   const themes=[{name:'clair',bg:'#F7F3EC'},{name:'sombre',bg:'#12151C'},{name:'rose',bg:'#FFE9F0'}];
   const surfaces=[];
   for(const theme of themes){
    await p.evaluate(target=>{for(let i=0;i<13;i++){if(getComputedStyle(document.documentElement).getPropertyValue('--bg').trim().toLowerCase()===target.toLowerCase())return;cycleAmb();}throw new Error('Ambience not found: '+target);},theme.bg);
    for(const [kind,trigger] of [['language',languageTrigger],['level',levelTrigger]]){
     await p.locator(trigger).click();await opened(p,kind);await screenshot(p,`mobile-390-${theme.name}-${kind}`);
     if(kind==='language')surfaces.push(visualChecks.at(-1).surface.slice(0,3).join(','));
     await closeEscape(p,trigger);
    }
   }
   assert.equal(new Set(surfaces).size,3,'light, dark and pink produce three distinct popup surfaces');
   assert.deepEqual(errors,[]);console.log('PASS actual light/dark/pink ambience: themed opaque surfaces, 14% accent selection, readable text and visible lesson');await context.close();
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
  if(shotDirectory)fs.writeFileSync(path.join(shotDirectory,'picker-report.json'),JSON.stringify({checks:visualChecks},null,2)+'\n');
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
