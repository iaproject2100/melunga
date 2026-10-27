/* Preserve the original PNG exactly; hide only its exterior background in CSS.
 * Local browser checks only; account status is a read-only simulated response. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const nativeLayer=require('./native-routing-layer.cjs');
const {test,before,after}=require('node:test');
const {chromium}=require('playwright-core');
const REPO=path.resolve(__dirname,'../..'),WEB=path.join(REPO,'melunga_deploy');
// This visual-only correction is compared with the reviewed account/progress preview.
const BASE='f13eafd270df3958507d88cdbb585ce5bc51099d',ORIGIN='https://logo-outline.test';
const old=f=>execFileSync('git',['show',BASE+':melunga_deploy/'+f],{cwd:REPO,maxBuffer:40*1024*1024});
const BRAND_BASE='40f671a';
const beforeBrand=f=>execFileSync('git',['show',BRAND_BASE+':melunga_deploy/'+f],{cwd:REPO,maxBuffer:40*1024*1024});
// Only these four whole files belong to the approved capsule presentation.
// Historical logo assertions retain the exact pre-capsule snapshot after the
// current files have passed their finite whole-byte pins; no broad skip flag.
const CAPSULE_UI_BASE='711537b27778c38f43e49fc47bfca513e8d94d97';
const CAPSULE_UI_SHA256={'maquette-guidee.css': '2da16667452ebe1781a5d202f68fd811b554086b6831a8d0fa164e9588cc348e', 'maquette-guidee.js': '7da1a3539013ced41084d2dfa300c8f6c18b96b7cf9bab33b4955e2c113e29ae', 'parcours-niveaux.html': '683697aa9028965fd8e5599a991e3a165dc918a4782dd284ac37928f489cec85', 'maquette-guidee.html': '27cc4f0fc6a563dd4f44a34bc40721423723a510b1619e8310d0e008241026a2'};
// The bounded desktop navigation and guest login skin are a later, separately
// checked layer. Project exactly these whole files to the approved main first;
// the capsule projection below retains its original independent pins.
const NAVIGATION_UI_BASE='a5c721f51a217750c3b83ecd56c85dbfc4ccb7f8';
const NAVIGATION_UI_SHA256={
 'maquette-guidee.css':'f31685f8b30f2dba14bd51e38c4a6bb2bb390609c21e895b5b8e20fab01ad00e',
 'maquette-guidee.js':'8243a2e44c0b56783df00947032a802a16f274a990c4e46c0b178332911529b4',
 'parcours-niveaux.html':'cbdabdd39b92a431060731cdf8f93dbbccbf2ef199aefa780f53845d3e37f58e',
 'maquette-guidee.html':'33e6f13def069dc342447db0ba6b07a0efef7d17ab2b42abef71a2c567c8d2f3',
 'app.html':'3544302224ad8e162b9ba40e76b8e5905dbebce2987431c8e8d30fca85df5c1a'
};
const LOGIN_HELPER_SHA256={'course-login.css':'bdcfa4b4bc85daca76b728a14e3e97326a739b13137ae6f17b6cd90d059ff46c','course-login.js':'3ec780d1f6a10b68b54f7bcedd6aa96f2e39a334175841973be8e4e785654291'};
function beforeNavigationUi(f){
 const actual=nativeLayer.beforeBytes(path.join(WEB,f));
 if(!Object.hasOwn(NAVIGATION_UI_SHA256,f))return actual;
 assert.equal(hash(actual),NAVIGATION_UI_SHA256[f],'exact approved navigation whole file '+f);
 const previous=execFileSync('git',['show',NAVIGATION_UI_BASE+':melunga_deploy/'+f],{cwd:REPO,maxBuffer:40*1024*1024});
 if(f==='app.html'){
  const includes='<link rel="stylesheet" href="course-login.css?v=1">\n<script src="course-login.js?v=1" defer></script>\n';
  assert.equal(actual.toString().split(includes).length,2,'exactly two bounded head includes once');
  assert.equal(actual.toString().replace(includes,''),previous.toString(),'the entire classic application remains exact outside these head includes');
 }
 return previous;
}
function beforeCapsuleUi(f){
 const actual=beforeNavigationUi(f);
 if(!Object.hasOwn(CAPSULE_UI_SHA256,f))return actual;
 assert.equal(hash(actual),CAPSULE_UI_SHA256[f],'exact approved capsule whole file '+f);
 return execFileSync('git',['show',CAPSULE_UI_BASE+':melunga_deploy/'+f],{cwd:REPO,maxBuffer:40*1024*1024});
}
const read=f=>JSON.parse(fs.readFileSync(path.join(WEB,f),'utf8'));
const manifest=read('content/niveaux-progressifs/manifest.json');
const runtimeFiles=['content/niveaux-progressifs/manifest.json',...manifest.pairs.flatMap(p=>[p.repertoirePath,...p.levels.map(l=>l.dataPath)])];
const protectedFiles=['app.html','index.html','desktop-home.js','maquette-guidee.js','melunga-logo.png','assets/melunga-logo.png','course-access.js','content/course-access.json','store-billing.js','netlify/functions/get-pricing.mjs','netlify/functions/login.mjs','netlify/functions/check-status.mjs'];
const sourceFiles=[...runtimeFiles,...protectedFiles,'parcours-niveaux.html','maquette-guidee.html','maquette-guidee.css','melunga-logo.svg',...Object.keys(LOGIN_HELPER_SHA256)];
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const fingerprints=()=>Object.fromEntries([__filename,...sourceFiles.map(f=>path.join(WEB,f)),...nativeLayer.inputFiles()].sort().map(f=>[path.relative(REPO,f),hash(fs.readFileSync(f))]));
const report={status:'running',baseCommit:BASE,environment:'local Chromium with mobile/desktop viewports',publicSiteChecked:false,physicalDeviceChecked:false,realAccountsUsed:false,actualAudioPlayed:false,apiFixture:'only GET check-status mocked',checks:[],cases:[],errors:[],unexpectedRequests:[],mockedStatusChecks:0,screenshots:[]};
const required=['canonical-source','outer-ring-counterexample','preserved-mobile-and-desktop-layout','lesson-controls'];
let browser,inputs;
const checked=async(label,fn)=>{try{await fn();report.checks.push(label);}catch(e){report.errors.push(label+': '+e.message);throw e;}};
before(async()=>{inputs=fingerprints();browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});});
after(async()=>{await browser?.close();report.inputsStable=JSON.stringify(inputs)===JSON.stringify(fingerprints());report.inputSha256=inputs;report.missingChecks=required.filter(k=>!report.checks.includes(k));report.status=!report.errors.length&&!report.unexpectedRequests.length&&!report.missingChecks.length&&report.inputsStable?'passed':'failed';fs.writeFileSync(process.env.LOGO_OUTLINE_REPORT||'/tmp/melunga-logo-outline-qa.json',JSON.stringify(report,null,2)+'\n');assert.equal(report.inputsStable,true);assert.deepEqual(report.errors,[]);assert.deepEqual(report.unexpectedRequests,[]);assert.deepEqual(report.missingChecks,[]);});
async function fixture({width=390,height=700,baseline=false}={}){
 const context=await browser.newContext({viewport:{width,height},isMobile:width<=760,hasTouch:width<=760,reducedMotion:'reduce',serviceWorkers:'block'});
 await context.addInitScript(()=>{localStorage.setItem('ox_device','logo-outline-regression');window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},speak(){throw Error('Audio not expected');},getVoices(){return[];},addEventListener(){}}});});
 await context.route('**/*',async route=>{const req=route.request(),url=new URL(req.url());if(url.origin!==ORIGIN){report.unexpectedRequests.push({path:url.origin+url.pathname,method:req.method()});return route.abort();}if(url.pathname==='/.netlify/functions/check-status'&&req.method()==='GET'){report.mockedStatusChecks++;return route.fulfill({json:{paid:false}});}if(req.method()!=='GET'||/^\/(?:\.netlify|api)\//.test(url.pathname)){report.unexpectedRequests.push({path:url.pathname,method:req.method()});return route.abort();}const relative=decodeURIComponent(url.pathname).replace(/^\//,'')||'parcours-niveaux.html',file=path.resolve(WEB,relative);if(!file.startsWith(WEB+path.sep)||!fs.existsSync(file))return route.fulfill({status:404,body:'Not found'});const type={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2'}[path.extname(file)]||'application/octet-stream';return route.fulfill({contentType:type,body:baseline&&['parcours-niveaux.html','maquette-guidee.html','maquette-guidee.css','maquette-guidee.js'].includes(relative)?beforeBrand(relative):fs.readFileSync(file)});});
 const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));await page.goto(ORIGIN+'/parcours-niveaux.html?pair=fr-zh&level=1');await page.waitForFunction(()=>window.MelungaMockup?.state().screen==='themes');await page.locator('.mg-logo').evaluate(n=>n.decode());return{context,page};
}
async function geometry(page){return page.evaluate(()=>{
 const r=n=>{const q=n.getBoundingClientRect();return{x:q.x,y:q.y,width:q.width,height:q.height};},logo=document.querySelector('.mg-logo'),wordmark=document.querySelector('.mg-wordmark'),clip=getComputedStyle(logo).clipPath,parts=clip.match(/circle\(([\d.]+)% at ([\d.]+)% ([\d.]+)%\)/);if(!parts)throw Error('Expected original circle mask '+clip);
 const logoBounds=r(logo),radius=Number(parts[1])/100*Math.min(logoBounds.width,logoBounds.height),cx=logoBounds.x+Number(parts[2])/100*logoBounds.width,cy=logoBounds.y+Number(parts[3])/100*logoBounds.height;
 return{brand:r(document.querySelector('.mg-brand')),logo:logoBounds,wordmark:r(wordmark),wordmarkFont:parseFloat(getComputedStyle(wordmark).fontSize),wordmarkOverflow:wordmark.scrollWidth-wordmark.clientWidth,clip,visibleLogo:{x:cx-radius,y:cy-radius,width:radius*2,height:radius*2},controls:r(document.querySelector('.mg-controls')),sidebar:r(document.querySelector('.mg-sidebar')),commands:[...document.querySelectorAll('.mg-controls .mg-round')].map(r),visibleCommands:[...document.querySelectorAll('.mg-controls .mg-round')].filter(n=>getComputedStyle(n).display!=='none').map(n=>({id:n.id,rect:r(n)})),rail:[...document.querySelectorAll('#mgDesktopNav .mg-rail-item')].filter(n=>n.getBoundingClientRect().width>0).map(n=>({id:n.dataset.menuItem,rect:r(n)})),viewport:{width:innerWidth,height:innerHeight,documentWidth:document.documentElement.scrollWidth}};
});}
async function settled(page){await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));}
async function enter(page){await page.locator('#mgThemeGrid button').first().click();await page.waitForFunction(()=>window.MelungaMockup.state().screen==='lesson');await settled(page);}
async function capture(page,name){const dir=process.env.LOGO_OUTLINE_CAPTURES||'/tmp/melunga-logo-outline-qa';fs.mkdirSync(dir,{recursive:true});const f=path.join(dir,name+'.png');await page.screenshot({path:f});report.screenshots.push(f);}

test('the exact original PNG, source data and application are preserved',()=>checked('canonical-source',async()=>{
 assert.equal(runtimeFiles.length,78);for(const [f,pin] of Object.entries(LOGIN_HELPER_SHA256))assert.equal(hash(nativeLayer.beforeBytes(path.join(WEB,f))),pin,'exact bounded guest helper before native A '+f);for(const f of runtimeFiles.concat(protectedFiles)){
  let expected=old(f);
  if(f==='maquette-guidee.js'){
   const reviewed=execFileSync('git',['show','f2e536e6f782def5c3c77e40b1f2564fe7dea7af:melunga_deploy/maquette-guidee.js'],{cwd:REPO});
   assert.ok(expected.equals(reviewed),'original reviewed script is the exact pre-removal script');
   const row="      { label: 'Toutes les leçons', icon: icons.globe, href: lessonUrl() },\n";
   assert.equal(reviewed.toString().split(row).length,2,'exactly one reviewed menu row');
   expected=Buffer.from(reviewed.toString().replace(row,''));
  }
  assert.ok(expected.equals(beforeCapsuleUi(f)),'whole protected source after finite capsule-only UI projection '+f);
 }
 assert.equal(hash(fs.readFileSync(path.join(WEB,'melunga-logo.png'))),'1aa277028faa2128c78405c839748dff8b1497827c04b02610216056c92b18c0','original bitmap bytes and two-bubble design preserved');
 for(const f of ['parcours-niveaux.html','maquette-guidee.html']){const a=old(f).toString(),expected=a.replace('<img class="mg-logo" src="melunga-logo.svg" alt="">','<img class="mg-logo" src="melunga-logo.png" alt="">').replace('maquette-guidee.css?v=14','maquette-guidee.css?v=15').replace('maquette-guidee.js?v=23','maquette-guidee.js?v=24');assert.equal(beforeCapsuleUi(f).toString(),expected,'only original logo, CSS cache and approved navigation cache before the pinned capsule layer '+f);}
 const css=beforeCapsuleUi('maquette-guidee.css').toString(),rule=css.match(/\.mg-logo\{[^}]*\}/)[0],mask=rule.match(/;clip-path:circle\([^;{}]*\)/);assert.ok(mask,'one circular display mask');assert.equal(fs.readFileSync(path.join(WEB,'maquette-guidee.css'),'utf8').match(/\.mg-logo\{[^}]*\}/)[0],rule,'capsule and palette changes preserve the entire original PNG logo rule');assert.equal(css.replace(mask[0],''),old('maquette-guidee.css').toString(),'all other CSS remains exact');
 report.cases.push({name:'original-source-preserved',runtimeFiles:78,protectedFiles:protectedFiles.length,pngSha256:hash(fs.readFileSync(path.join(WEB,'melunga-logo.png'))),mask:mask[0]});
}));

test('CSS removes the outer dark background without changing the original artwork pixels',async()=>checked('outer-ring-counterexample',async()=>{
 const f=await fixture();try{const pixels=await f.page.locator('.mg-logo').evaluate(async im=>{await im.decode();if(!im.currentSrc.endsWith('/melunga-logo.png'))throw Error('The displayed master is not the original PNG');const clip=getComputedStyle(im).clipPath,parts=clip.match(/circle\(([\d.]+)% at ([\d.]+)% ([\d.]+)%\)/);if(!parts)throw Error('Expected percentage circle mask: '+clip);const radius=Number(parts[1])*1.28,cx=Number(parts[2])*1.28,cy=Number(parts[3])*1.28;
 const paint=masked=>{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.beginPath();x.arc(masked?cx:64,masked?cy:64,masked?radius:64,0,Math.PI*2);x.clip();const w=128,h=128*im.naturalHeight/im.naturalWidth;x.drawImage(im,0,(128-h)/2,w,h);return x.getImageData(0,0,128,128).data;};const before=paint(false),after=paint(true);let oldDark=0,newDark=0,innerChanged=0,mascotChanged=0,sampled=0,opaque=0;
 for(let y=0;y<128;y++)for(let x=0;x<128;x++){const r=Math.hypot(x+.5-cx,y+.5-cy),i=(y*128+x)*4,changed=[0,1,2,3].some(d=>before[i+d]!==after[i+d]);if(r<=50&&changed)innerChanged++;if(before[i+3]>240&&before[i]>=90&&changed)mascotChanged++;if(r<53||r>62)continue;sampled++;if(before[i+3]>240&&before[i]<40&&before[i+1]<90&&before[i+2]<115)oldDark++;if(after[i+3]>240){opaque++;if(after[i]<40&&after[i+1]<90&&after[i+2]<115)newDark++;}}
 return{oldDark,newDark,innerChanged,mascotChanged,sampled,opaque,clip,naturalWidth:im.naturalWidth,naturalHeight:im.naturalHeight};});assert.ok(pixels.oldDark>100,'original background defect reproduced');assert.equal(pixels.newDark,0,'no dark background survives the display mask');assert.equal(pixels.innerChanged,0,'central artwork remains pixel-identical');assert.equal(pixels.mascotChanged,0,'white/blue body and golden bubbles remain pixel-identical');assert.ok(pixels.opaque>500,'blue disk remains visible');assert.equal(pixels.naturalWidth,143);assert.equal(pixels.naturalHeight,137);report.cases.push({name:'original-png-css-mask',pixels});
 await f.page.locator('.mg-logo').evaluate(n=>{n.style.width='172px';n.style.height='172px';n.style.flexBasis='172px';});const dir=process.env.LOGO_OUTLINE_CAPTURES||'/tmp/melunga-logo-outline-qa';fs.mkdirSync(dir,{recursive:true});const shot=path.join(dir,'original-logo-enlarged.png');await f.page.locator('.mg-logo').screenshot({path:shot});report.screenshots.push(shot);
 }finally{await f.context.close();}
}));

test('mobile brand is visibly stronger than controls while desktop geometry is preserved',{timeout:60000},async()=>checked('preserved-mobile-and-desktop-layout',async()=>{
 const sizes=[{width:320,height:700},{width:390,height:700},{width:461,height:700},{width:640,height:480},{width:1440,height:900}];
 for(const size of sizes){const a=await fixture({...size,baseline:true}),b=await fixture(size);try{
  for(const screen of ['themes','lesson']){
   if(screen==='lesson'){await enter(a.page);await enter(b.page);}const before=await geometry(a.page),after=await geometry(b.page);
   assert.equal(after.clip,before.clip,'the original artwork mask is unchanged at every size');
   if(size.width<=760){
    assert.equal(after.logo.width,64);assert.equal(after.logo.height,64);assert.equal(after.wordmarkFont,size.width<340?28:30);assert.ok(after.wordmarkOverflow<=1,'complete Melunga wordmark fits');
    assert.equal(after.visibleCommands.length,4);assert.equal(after.rail.length,0);assert.deepEqual(after.visibleCommands.map(n=>n.id),['mgLevelTrigger','mgLanguageTrigger','mgPalette','mgMenuTrigger']);
    for(const item of after.visibleCommands){assert.equal(item.rect.width,44);assert.equal(item.rect.height,44);assert.ok(after.visibleLogo.width>item.rect.width&&after.visibleLogo.height>item.rect.height,'actual visible logo after clipping is bigger than '+item.id);}
    assert.ok(after.visibleLogo.width>before.visibleLogo.width,'visible mascot is larger than the previous production version');assert.ok(after.wordmarkFont>before.wordmarkFont,'Melunga name is more visible than before');
    for(const [id,box] of [['brand',after.brand],['logo',after.logo],['visible-logo',after.visibleLogo],['wordmark',after.wordmark],['controls',after.controls],...after.visibleCommands.map(n=>[n.id,n.rect])])assert.ok(box.x>=-1&&box.y>=-1&&box.x+box.width<=size.width+1&&box.y+box.height<=size.height+1,'complete mobile header element '+id+' '+JSON.stringify(box));
    assert.ok(after.logo.x+after.logo.width<=after.wordmark.x+1,'mascot and name do not overlap');
    const overlapX=Math.min(after.brand.x+after.brand.width,after.controls.x+after.controls.width)-Math.max(after.brand.x,after.controls.x),overlapY=Math.min(after.brand.y+after.brand.height,after.controls.y+after.controls.height)-Math.max(after.brand.y,after.controls.y);assert.ok(overlapX<=1||overlapY<=1,'brand and four controls do not overlap');
    if(size.width<=460)assert.ok(after.brand.y+after.brand.height<=after.controls.y+1,'compact phones keep the brand on its own row');
    assert.ok(after.viewport.documentWidth<=size.width+1,'larger brand does not create horizontal overflow');
   }else{
    assert.deepEqual(after,before,'the complete desktop brand, rail and controls geometry stays exact');assert.equal(after.sidebar.width,180);assert.deepEqual(after.visibleCommands.map(n=>n.id),['mgLevelTrigger','mgLanguageTrigger']);assert.equal(after.rail.length,9);
    for(const item of [...after.visibleCommands,...after.rail]){assert.ok(item.rect.x>=after.sidebar.x&&item.rect.x+item.rect.width<=after.sidebar.x+after.sidebar.width+1,'action remains inside rail '+item.id);assert.ok(item.rect.y>=after.sidebar.y&&item.rect.y+item.rect.height<=after.sidebar.y+after.sidebar.height+1,'action stays visible without scrolling '+item.id);}
   }
   assert.equal(after.commands.length,4,'the four original controls remain in the DOM');report.cases.push({name:'geometry',screen,...size,baselineCommit:BRAND_BASE,geometry:after});
  }
  await capture(b.page,'brand-'+size.width+'x'+size.height);
 }finally{await a.context.close();await b.context.close();}}
}));

test('Pinyin, coloured levels and menu remain usable with the borderless logo',{timeout:30000},async()=>checked('lesson-controls',async()=>{
 const f=await fixture();try{const {page}=f;await enter(page);const original=await page.evaluate(()=>window.MelungaMockup.state());const readingBefore=await page.locator('#mgReadingToggle').getAttribute('aria-pressed');await page.locator('#mgReadingToggle').click();await settled(page);assert.notEqual(await page.locator('#mgReadingToggle').getAttribute('aria-pressed'),readingBefore,'Pinyin can still be toggled');await page.locator('#mgLevelTrigger').click();await page.locator('#mgLevelDialog').waitFor({state:'visible'});assert.equal(await page.locator('#mgLevelChoices button').count(),10);const colours=await page.locator('.mg-level-badge').evaluateAll(nodes=>nodes.map(n=>getComputedStyle(n).backgroundColor));assert.equal(new Set(colours).size,10);await page.keyboard.press('Escape');await page.locator('#mgLevelDialog').waitFor({state:'hidden'});await page.locator('#mgMenuTrigger').click();await page.locator('#mgMenuDialog').waitFor({state:'visible'});assert.equal(await page.locator('#mgMenuNav .mg-menu-item').count(),9);for(const i of [0,8]){const row=page.locator('#mgMenuNav .mg-menu-item').nth(i);await row.scrollIntoViewIfNeeded();assert.ok(await row.isVisible());}await page.keyboard.press('Escape');await page.locator('#mgMenuDialog').waitFor({state:'hidden'});const current=await page.evaluate(()=>window.MelungaMockup.state());assert.equal(current.phraseId,original.phraseId);assert.equal(current.stepIndex,original.stepIndex);report.cases.push({name:'preserved-lesson-controls',colours});}finally{await f.context.close();}
}));
