/* Mobile navigation regressions: coloured HTML level picker and independently
 * scrollable menu body. Local Chromium, emulated sizes, read-only API fixture.
 * No real accounts, pricing operation or public-site attestation is involved.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');
const {test, before, after} = require('node:test');
const {chromium} = require('playwright-core');
const REPO = path.resolve(__dirname, '../..'), WEB = path.join(REPO, 'melunga_deploy');
const BASE = '1b1d60e6a8756018fa4e9d6abce8457986a04550';
const ORIGIN = 'https://mobile-navigation.test';
const PREFIX = 'content/niveaux-progressifs/';
const json = file => JSON.parse(fs.readFileSync(path.join(WEB,file), 'utf8'));
const manifest = json(PREFIX+'manifest.json');
const sourceFiles = [PREFIX+'manifest.json', ...manifest.pairs.flatMap(pair => [pair.repertoirePath, ...pair.levels.map(level=>level.dataPath)])];
const protectedFiles = ['app.html','index.html','desktop-home.js','course-access.js','content/course-access.json','store-billing.js',
  'netlify/functions/get-pricing.mjs','netlify/functions/login.mjs','netlify/functions/check-status.mjs','netlify/functions/create-payment-link.mjs'];
const productFiles = ['maquette-guidee.js','maquette-guidee.css','parcours-niveaux.html','maquette-guidee.html'];
const hash = raw => crypto.createHash('sha256').update(raw).digest('hex');
const fingerprint = () => Object.fromEntries([__filename, ...sourceFiles.concat(protectedFiles,productFiles).map(f=>path.join(WEB,f))].sort().map(file=>[path.relative(REPO,file),hash(fs.readFileSync(file))]));
const report = {status:'running', baseCommit:BASE, environment:'local Chromium with mobile/desktop sizes emulated',
  publicSiteChecked:false, physicalPhoneChecked:false, realAccountsUsed:false, actualAudioPlayed:false,
  apiFixture:'only GET check-status mocked; no login, feedback, payment or TTS calls permitted',
  checks:[],cases:[],errors:[],unexpectedRequests:[],mockedStatusChecks:0,screenshots:[]};
const REQUIRED = ['source-integrity','level-picker-responsive','level-picker-colours','menu-scroll-and-reachability','keyboard-and-dialog-lifecycle','viewport-and-large-text'];
let browser, inputs;
const checked = async (label, action) => {
  try { await action(); report.checks.push(label); }
  catch(error) { report.errors.push(label+': '+error.message); throw error; }
};
before(async()=>{
  inputs=fingerprint();
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
});
after(async()=>{
  await browser?.close(); report.inputsStable=JSON.stringify(inputs)===JSON.stringify(fingerprint());
  report.inputSha256=inputs;report.missingChecks=REQUIRED.filter(name=>!report.checks.includes(name));
  report.status=!report.errors.length&&!report.unexpectedRequests.length&&!report.missingChecks.length&&report.inputsStable?'passed':'failed';
  if(process.env.MOBILE_PICKER_MENU_REPORT)fs.writeFileSync(process.env.MOBILE_PICKER_MENU_REPORT,JSON.stringify(report,null,2)+'\n');
  assert.equal(report.inputsStable,true,'source files cannot change during checks');
  assert.deepEqual(report.errors,[],'no JS or assertion errors');
  assert.deepEqual(report.unexpectedRequests,[],'read-only fixture scope');
  assert.deepEqual(report.missingChecks,[],'all focused checks completed');
});
async function fixture({width=390,height=700,paid=false,pair='fr-zh',legacy=false}={}) {
  const context=await browser.newContext({viewport:{width,height},isMobile:width<=760,hasTouch:width<=760,reducedMotion:'reduce',serviceWorkers:'block'});
  await context.addInitScript(()=>{localStorage.setItem('ox_device','mobile-menu-regression-fixture');
    window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};
    Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},speak(){throw Error('No actual audio expected');},getVoices(){return[];},addEventListener(){}}});
  });
  await context.route('**/*',async route=>{
    const req=route.request(),url=new URL(req.url());
    if(url.origin!==ORIGIN){report.unexpectedRequests.push({url:url.origin+url.pathname,method:req.method()});return route.abort();}
    if(url.pathname==='/.netlify/functions/check-status'&&req.method()==='GET'){
      report.mockedStatusChecks++;return route.fulfill({json:{paid}});
    }
    if(req.method()!=='GET'||/^\/(?:\.netlify|api)\//.test(url.pathname)){
      report.unexpectedRequests.push({path:url.pathname,method:req.method()});return route.abort();
    }
    const relative=decodeURIComponent(url.pathname).replace(/^\//,'')||'parcours-niveaux.html';
    const file=path.resolve(WEB,relative);
    if(!file.startsWith(WEB+path.sep)||!fs.existsSync(file))return route.fulfill({status:404,body:'Not found'});
    const ext=path.extname(file),type={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2'}[ext]||'application/octet-stream';
    return route.fulfill({contentType:type,body:fs.readFileSync(file)});
  });
  const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));
  await page.goto(ORIGIN+(legacy?'/maquette-guidee.html':'/parcours-niveaux.html')+'?pair='+pair+'&level=1');
  await page.waitForFunction(()=>window.MelungaMockup?.state().screen==='themes');
  return {context,page};
}
async function opened(page, trigger, dialog){
  await page.locator(trigger).click();await page.locator(dialog).waitFor({state:'visible'});
}
async function closeDialog(page,dialog){
  await page.keyboard.press('Escape');await page.locator(dialog).waitFor({state:'hidden'});
}
async function bounds(page,dialog){
  return page.locator(dialog).evaluate(node=>{
    const r=node.getBoundingClientRect(),v=visualViewport;
    return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height,
      viewport:{left:v?.offsetLeft||0,top:v?.offsetTop||0,width:v?.width||innerWidth,height:v?.height||innerHeight},
      bodyWidth:document.documentElement.scrollWidth,layoutWidth:innerWidth};
  });
}
async function assertBounds(page,dialog,label){
  const b=await bounds(page,dialog),v=b.viewport;
  assert.ok(b.left>=v.left-1&&b.top>=v.top-1,label+' starts within visible viewport '+JSON.stringify(b));
  assert.ok(b.right<=v.left+v.width+1&&b.bottom<=v.top+v.height+1,label+' ends within visible viewport '+JSON.stringify(b));
  assert.ok(b.bodyWidth<=b.layoutWidth+1,label+' causes no horizontal document overflow');
  return b;
}
async function reachable(page,selector,dialog,{full=true}={}){
  const item=page.locator(selector);await item.scrollIntoViewIfNeeded();
  const m=await item.evaluate((node,dialogSelector)=>{
    const r=node.getBoundingClientRect(),d=node.closest(dialogSelector),head=d.querySelector('header').getBoundingClientRect(),dr=d.getBoundingClientRect();
    const center={x:r.left+r.width/2,y:r.top+r.height/2};const hit=document.elementFromPoint(center.x,center.y);
    return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,width:r.width,height:r.height,headBottom:head.bottom,dialogBottom:dr.bottom,
      hit:hit===node||node.contains(hit),text:node.textContent.trim(),center};
  },dialog);
  assert.ok(m.hit,selector+' receives a pointer at its centre '+JSON.stringify(m));
  assert.ok(m.top>=m.headBottom-1,selector+' does not hide behind the fixed header '+JSON.stringify(m));
  if(full)assert.ok(m.bottom<=m.dialogBottom-4,selector+' is fully visible after scrolling '+JSON.stringify(m));
  assert.ok(m.width>=44&&m.height>=44,selector+' touch target is at least 44px');
  return m;
}
async function screenshot(page,name){
  const dir=process.env.MOBILE_PICKER_MENU_CAPTURES;if(!dir)return;
  fs.mkdirSync(dir,{recursive:true});const target=path.join(dir,name+'.png');
  await page.screenshot({path:target});report.screenshots.push(target);
}
const sizes=[{width:390,height:700},{width:390,height:844},{width:280,height:500},{width:844,height:390},{width:1440,height:900}];

test('all card data, classic access, prices and account sources remain byte-exact',()=>checked('source-integrity',async()=>{
  assert.equal(sourceFiles.length,78);
  for(const file of [...sourceFiles,...protectedFiles]){
    const old=execFileSync('git',['show',BASE+':melunga_deploy/'+file],{cwd:REPO,maxBuffer:40*1024*1024});
    assert.ok(old.equals(fs.readFileSync(path.join(WEB,file))),'protected full file '+file);
  }
  report.cases.push({name:'source-conservation',runtimeJson:78,protectedProductFiles:protectedFiles.length});
}));

test('the level selector is a styled HTML dialog and L9/L10 can be chosen on five viewport sizes', {timeout:120000},()=>checked('level-picker-responsive',async()=>{
  for(const size of sizes){
    const f=await fixture(size);
    try{
      const {page}=f;
      assert.equal(await page.locator('#mgLevel').isVisible(),false,'native select is not the touch surface');
      for(const level of [10,9,1]){
        await opened(page,'#mgLevelTrigger','#mgLevelDialog');
        const b=await assertBounds(page,'#mgLevelDialog','level picker '+JSON.stringify(size));
        assert.equal(await page.locator('#mgLevelDialog .mg-level-grid button[data-level]').count(),10);
        await reachable(page,'#mgLevelDialog button[data-level="'+level+'"]','#mgLevelDialog');
        await page.locator('#mgLevelDialog button[data-level="'+level+'"]').click();
        await page.waitForFunction(n=>{const s=window.MelungaMockup?.state();return s?.screen==='themes'&&s.level===n&&s.pairId==='fr-zh';},level);
        assert.equal(await page.locator('#mgLevel').inputValue(),String(level),'source selector stays synchronized');
        assert.equal(await page.locator('#mgLevelDialog').isVisible(),false);
        assert.equal(await page.locator('#mgLevelTrigger').getAttribute('aria-expanded'),'false');
        report.cases.push({name:'level-selection',...size,level,bounds:b});
      }
    }finally{await f.context.close();}
  }
}));

test('each level has its own colour and the dialog follows all three site ambiences', {timeout:60000},()=>checked('level-picker-colours',async()=>{
  const f=await fixture();
  try{
    const {page}=f;const themes=[];
    for(const ambiance of ['ocean','aurora','dusk']){
      await page.evaluate(value=>document.body.dataset.ambience=value,ambiance);
      await opened(page,'#mgLevelTrigger','#mgLevelDialog');
      const detail=await page.locator('#mgLevelDialog').evaluate(node=>({
        background:getComputedStyle(node).backgroundColor,color:getComputedStyle(node).color,
        swatches:[...node.querySelectorAll('.mg-level-grid button[data-level]')].map(button=>{
          const badge=button.querySelector('.mg-level-badge');if(!badge)return null;
          const cs=getComputedStyle(badge);return {level:button.dataset.level,background:cs.backgroundColor,image:cs.backgroundImage,color:cs.color};
        })
      }));
      assert.ok(detail.swatches.every(Boolean),'all ten level badges exist');
      assert.equal(new Set(detail.swatches.map(s=>s.background+'|'+s.image)).size,10,'all ten badges have distinct visible colour');
      assert.ok(detail.swatches.every(s=>s.background!=='rgba(0, 0, 0, 0)'||s.image!=='none'),'no transparent/uncoloured badge');
      themes.push({ambiance,...detail});
      await screenshot(page,'levels-'+ambiance+'-390x700');
      await closeDialog(page,'#mgLevelDialog');
    }
    assert.equal(new Set(themes.map(t=>t.background)).size,3,'dialog background tracks the three site ambiences');
    report.cases.push({name:'level-colours-and-ambiences',themes});
  }finally{await f.context.close();}
}));

test('all ten menu entries remain reachable without passing behind its header', {timeout:90000},()=>checked('menu-scroll-and-reachability',async()=>{
  for(const size of sizes){
    const f=await fixture(size);
    try{
      const {page}=f;await opened(page,'#mgMenuTrigger','#mgMenuDialog');
      const b=await assertBounds(page,'#mgMenuDialog','menu '+JSON.stringify(size));
      assert.equal(await page.locator('#mgMenuNav .mg-menu-item').count(),10);
      const scroll=page.locator('#mgMenuDialog .mg-menu-body');assert.equal(await scroll.count(),1,'header and scroll area are separate');
      const container=await scroll.evaluate(node=>({overflow:getComputedStyle(node).overflowY,scrollHeight:node.scrollHeight,clientHeight:node.clientHeight}));
      assert.ok(['auto','scroll'].includes(container.overflow),'menu body explicitly scrolls');
      for(const index of [0,1,9])await reachable(page,'#mgMenuNav .mg-menu-item:nth-child('+(index+1)+')','#mgMenuDialog');
      await page.locator('#mgMenuClose').scrollIntoViewIfNeeded();
      const closeBox=await page.locator('#mgMenuClose').boundingBox();
      assert.ok(closeBox.y>=b.top&&closeBox.y+closeBox.height<=b.bottom,'close remains on screen at the end of the list');
      await screenshot(page,'menu-last-'+size.width+'x'+size.height);
      await scroll.evaluate(node=>node.scrollTop=0);
      await reachable(page,'#mgMenuNav .mg-menu-item:nth-child(1)','#mgMenuDialog');
      await screenshot(page,'menu-first-'+size.width+'x'+size.height);
      if(size.width===280){
        const region=await scroll.boundingBox(), cdp=await f.context.newCDPSession(page);
        const x=region.x+region.width/2, y0=region.y+region.height-30, y1=region.y+25;
        await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y:y0}]});
        for(let i=1;i<=8;i++){
          await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y0+(y1-y0)*i/8}]});
          await new Promise(resolve=>setTimeout(resolve,16));
        }
        await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
        await page.waitForFunction(()=>document.querySelector('#mgMenuDialog .mg-menu-body').scrollTop>0);
        const moved=await scroll.evaluate(node=>node.scrollTop);assert.ok(moved>0,'a real touch swipe scrolls the menu body');
        report.cases.push({name:'menu-touch-scroll',...size,scrollTop:moved});
      }
      await page.locator('[data-menu-item="voice"]').click();
      await page.locator('#mgVoicePanel').waitFor({state:'visible'});
      await page.locator('#mgMenuBack').click();
      assert.equal(await page.locator('#mgMenuNav').isVisible(),true);
      await reachable(page,'#mgMenuNav .mg-menu-item:nth-child(1)','#mgMenuDialog');
      const link=await page.locator('#mgMenuNav .mg-menu-item').last().getAttribute('href');
      assert.match(link,/^app\.html\?/);assert.match(link,/login=1/);
      report.cases.push({name:'menu-entry-reachability',...size,bounds:b,scroll:container,loginHref:link});
    }finally{await f.context.close();}
  }
}));

test('Escape, focus return, switching dialogs and the legacy L1 menu remain usable', {timeout:60000},()=>checked('keyboard-and-dialog-lifecycle',async()=>{
  const f=await fixture();
  try{
    const {page}=f;
    await page.locator('#mgLevelTrigger').focus();await page.keyboard.press('Enter');
    await page.locator('#mgLevelDialog').waitFor({state:'visible'});
    assert.equal(await page.locator('#mgLevelTrigger').getAttribute('aria-expanded'),'true');
    await closeDialog(page,'#mgLevelDialog');
    assert.equal(await page.locator('#mgLevelTrigger').evaluate(node=>document.activeElement===node),true,'Escape restores opener focus');
    await opened(page,'#mgMenuTrigger','#mgMenuDialog');await closeDialog(page,'#mgMenuDialog');
    await page.waitForFunction(()=>document.querySelector('#mgMenuTrigger').getAttribute('aria-expanded')==='false');
    assert.equal(await page.locator('#mgMenuTrigger').getAttribute('aria-expanded'),'false');
    assert.equal(await page.locator('#mgMenuTrigger').evaluate(node=>document.activeElement===node),true);
    await opened(page,'#mgLevelTrigger','#mgLevelDialog');
    await page.mouse.click(2,2);
    assert.equal(await page.locator('#mgLevelDialog').isVisible(),false,'level picker backdrop dismisses');
    await opened(page,'#mgMenuTrigger','#mgMenuDialog');await page.mouse.click(2,2);
    assert.equal(await page.locator('#mgMenuDialog').isVisible(),false,'menu backdrop dismisses');
  }finally{await f.context.close();}
  const legacy=await fixture({legacy:true});
  try{
    assert.equal(await legacy.page.locator('#mgLevelTrigger').count(),0,'legacy L1 stays fixed at L1');
    await opened(legacy.page,'#mgMenuTrigger','#mgMenuDialog');
    await reachable(legacy.page,'#mgMenuNav .mg-menu-item:nth-child(10)','#mgMenuDialog');
    await closeDialog(legacy.page,'#mgMenuDialog');
    report.cases.push({name:'keyboard-lifecycle-and-legacy'});
  }finally{await legacy.context.close();}
}));

test('large text and viewport changes keep both dialog headers and last controls accessible', {timeout:60000},()=>checked('viewport-and-large-text',async()=>{
  const f=await fixture({width:390,height:700});
  try{
    const {page}=f;
    await page.evaluate(()=>{
      const nodes=[...document.querySelectorAll('#mgMenuDialog *,#mgLevelDialog *')];
      const sizes=nodes.map(node=>parseFloat(getComputedStyle(node).fontSize));
      nodes.forEach((node,i)=>node.style.setProperty('font-size',sizes[i]*2+'px','important'));
    });
    await opened(page,'#mgMenuTrigger','#mgMenuDialog');
    await assertBounds(page,'#mgMenuDialog','menu at 200% text');
    for(const index of [1,10])await reachable(page,'#mgMenuNav .mg-menu-item:nth-child('+index+')','#mgMenuDialog');
    await screenshot(page,'menu-large-text');
    await page.setViewportSize({width:844,height:390});
    await assertBounds(page,'#mgMenuDialog','resized landscape menu');
    await reachable(page,'#mgMenuNav .mg-menu-item:nth-child(10)','#mgMenuDialog');
    await closeDialog(page,'#mgMenuDialog');
    await opened(page,'#mgLevelTrigger','#mgLevelDialog');
    await assertBounds(page,'#mgLevelDialog','large text landscape levels');
    await reachable(page,'#mgLevelDialog button[data-level="10"]','#mgLevelDialog');
    await screenshot(page,'levels-large-text-landscape');
    await closeDialog(page,'#mgLevelDialog');
    await page.setViewportSize({width:390,height:700});
    const cdp=await f.context.newCDPSession(page);
    for(const [trigger,dialog,last] of [
      ['#mgMenuTrigger','#mgMenuDialog','#mgMenuNav .mg-menu-item:nth-child(10)'],
      ['#mgLevelTrigger','#mgLevelDialog','#mgLevelDialog button[data-level="10"]']
    ]){
      await opened(page,trigger,dialog);
      await cdp.send('Emulation.setPageScaleFactor',{pageScaleFactor:1.5});
      await page.waitForTimeout(100);
      const b=await assertBounds(page,dialog,'pinch-zoom '+dialog);
      assert.ok(b.viewport.width<390,'real visual viewport narrowed by pinch');
      await reachable(page,last,dialog);
      await screenshot(page,dialog==='#mgMenuDialog'?'menu-pinch-and-large-text':'levels-pinch-and-large-text');
      report.cases.push({name:'real-visual-viewport-pinch',dialog,scale:1.5,bounds:b});
      await closeDialog(page,dialog);
      await cdp.send('Emulation.setPageScaleFactor',{pageScaleFactor:1});
    }
    report.cases.push({name:'large-text-and-landscape-resize',textScale:2});
  }finally{await f.context.close();}
}));
