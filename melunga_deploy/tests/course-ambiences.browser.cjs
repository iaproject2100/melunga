/* Palette interaction only; production data stays local and account/audio
 * endpoints are declared fixtures. Chromium does not establish device testing. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const {test,before,after}=require('node:test'),{chromium}=require('playwright-core');
const WEB=path.resolve(__dirname,'..'),ORIGIN='https://ambiences.test';
const report={status:'running',allApiResponsesMocked:true,actualAudioPlayed:false,physicalDeviceTested:false,checks:[],errors:[]};
const out=process.env.COURSE_AMBIENCES_REPORT||'/tmp/melunga-course-ambiences.json';
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
let browser;
before(async()=>{browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});});
after(async()=>{await browser?.close();report.status=report.errors.length?'failed':'passed';fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');});
async function check(name,fn){try{await fn();report.checks.push(name);}catch(e){report.errors.push(name+': '+e.message);throw e;}}
async function fixture({width=1440,height=900,javascript=true,local=null,session=null,unavailable=false,legacy=false}={}){
 const context=await browser.newContext({viewport:{width,height},javaScriptEnabled:javascript,serviceWorkers:'block',reducedMotion:'reduce'});
 await context.addInitScript(({local,session,unavailable})=>{if(local!==null)localStorage.setItem('melunga-course-ambience',local);if(session!==null)sessionStorage.setItem('melunga-course-ambience',session);if(unavailable){Storage.prototype.getItem=function(){throw Error('Storage fixture');};Storage.prototype.setItem=function(){throw Error('Storage fixture');};}}, {local,session,unavailable});
 await context.route('**/*',async route=>{const url=new URL(route.request().url());if(url.origin!==ORIGIN||route.request().method()!=='GET')return route.abort();
  if(url.pathname==='/.netlify/functions/check-status')return route.fulfill({json:{paid:false}});
  if(url.pathname==='/.netlify/functions/tts')return route.fulfill({status:503,json:{error:'fixture-no-audio'}});
  if(url.pathname==='/.netlify/functions/get-pricing')return route.fulfill({json:{monthlyDisplay:'7,90 €',annualDisplay:'42 €',country:'FR'}});
  const file=path.resolve(WEB,'.'+url.pathname);if(!file.startsWith(WEB+path.sep)||!fs.existsSync(file))return route.fulfill({status:404,body:''});
  const type={'.html':'text/html','.css':'text/css','.js':'application/javascript','.json':'application/json','.png':'image/png','.webp':'image/webp'}[path.extname(file)]||'application/octet-stream';
  return route.fulfill({body:fs.readFileSync(file),contentType:type});
 });
 const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));await page.goto(ORIGIN+'/'+(legacy?'maquette-guidee.html':'parcours-niveaux.html')+'?pair=fr-es&level=1',{waitUntil:'load'});
 if(javascript)await page.waitForFunction(()=>window.MelungaMockup?.state().screen==='themes');return {context,page};
}
async function changeColor(page){const control=page.locator('#mgPalette');if(await control.isVisible())await control.click();else await page.getByRole('button',{name:'Couleur',exact:true}).click();}
async function palette(page){return page.evaluate(()=>({id:document.body.dataset.ambience,background:getComputedStyle(document.body).backgroundImage,ink:getComputedStyle(document.body).color,local:localStorage.getItem('melunga-course-ambience'),session:sessionStorage.getItem('melunga-course-ambience')}));}
test('the requested pastel appears before JavaScript on desktop and mobile in both pages',()=>check('static-pastel-first-paint',async()=>{
 for(const legacy of [false,true])for(const width of [390,1440]){const f=await fixture({width,height:width===390?700:900,javascript:false,legacy});try{const p=await palette(f.page);assert.equal(p.id,'dusk');assert.match(p.background,/237, 206, 168/);assert.equal(p.ink,'rgb(23, 52, 64)');assert.equal(p.local,null);}finally{await f.context.close();}}
}));
test('all fourteen classic backgrounds are reachable alongside the three retained palettes',()=>check('seventeen-visible-palettes-and-content-preserved',async()=>{
 const classic=fs.readFileSync(path.join(WEB,'app.html'),'utf8');
 const source=classic.match(/var AMB=\[([\s\S]*?)\n  \];/);assert.ok(source,'classic AMB array found');const classicPalettes=vm.runInNewContext('['+source[1]+']',{}, {timeout:1000}).filter(p=>p.imm);assert.equal(classicPalettes.length,14);
 const f=await fixture();try{const p=f.page,before=await p.locator('#mgThemeGrid').textContent(),initial=await palette(p);assert.equal(initial.id,'dusk');assert.equal(initial.local,null);
  const seen=[];for(let i=0;i<17;i++){const v=await palette(p);assert.ok(v.background&&v.background!=='none');assert.ok(!seen.some(s=>s.id===v.id),'every cycle entry is distinct');seen.push(v);await changeColor(p);}
  assert.equal((await palette(p)).id,'dusk');assert.equal(seen.filter(s=>s.id.startsWith('legacy-')).length,14);for(const id of ['dusk','ocean','aurora'])assert.ok(seen.some(s=>s.id===id));
  const restored=seen.filter(s=>s.id.startsWith('legacy-'));
  for(let index=0;index<restored.length;index++){const row=restored[index];const actual=await p.evaluate(id=>{const style=[...document.styleSheets].find(s=>s.href?.includes('course-ambiences.css'));const rule=[...style.cssRules].find(r=>r.selectorText==='body[data-ambience="'+id+'"]');return rule?.style.backgroundImage;},row.id);assert.ok(actual,'a real palette rule exists');
   const expected=await p.evaluate(gradient=>{const node=document.createElement('span');node.style.backgroundImage=gradient;return node.style.backgroundImage;},classicPalettes[index].grad);assert.ok(expected);assert.equal(actual,expected,'classic gradient and order retained exactly for '+row.id);assert.equal(row.background,actual,'the restored gradient is actually visible');}
  assert.equal(await p.locator('#mgThemeGrid').textContent(),before);assert.equal(await p.evaluate(()=>localStorage.getItem('melunga-guided-known-v1')),null);assert.equal(await p.evaluate(()=>localStorage.getItem('melunga-guided-review-v1')),null);
  report.palettes=seen.map(({id,background,ink})=>({id,background,ink}));report.classicSourceSha256=hash(classic);
 }finally{await f.context.close();}
}));
test('explicit colors persist after reload and in a fresh session',()=>check('durable-explicit-preference',async()=>{
 const f=await fixture();let selected;try{await changeColor(f.page);selected=(await palette(f.page)).id;assert.notEqual(selected,'dusk');await f.page.reload();await f.page.waitForFunction(()=>window.MelungaMockup?.state().screen==='themes');assert.equal((await palette(f.page)).id,selected);}finally{await f.context.close();}
 const fresh=await fixture({local:selected,session:'dusk'});try{const value=await palette(fresh.page);assert.equal(value.id,selected);assert.equal(value.local,selected);}finally{await fresh.context.close();}
}));
test('old valid session choices survive, invalid preferences use pastel without writing a favorite',()=>check('legacy-and-invalid-preferences',async()=>{
 for(const options of [{session:'aurora',expected:'aurora'},{local:'unknown',session:'ocean',expected:'ocean'},{local:'unknown',session:'invalid',expected:'dusk'}]){const f=await fixture(options);try{assert.equal((await palette(f.page)).id,options.expected);assert.equal((await palette(f.page)).local,options.local??null);}finally{await f.context.close();}}
}));
test('blocked storage does not break the palette control or the course',()=>check('storage-unavailable',async()=>{
 const f=await fixture({unavailable:true});try{assert.equal(await f.page.locator('body').getAttribute('data-ambience'),'dusk');await changeColor(f.page);assert.equal(await f.page.locator('body').getAttribute('data-ambience'),'ocean');assert.equal(await f.page.locator('#mgThemeView').isVisible(),true);}finally{await f.context.close();}
}));
