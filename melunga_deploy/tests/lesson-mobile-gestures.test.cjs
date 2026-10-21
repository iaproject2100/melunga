/* Real touch checks: NODE_PATH must expose playwright-core. No live API,
 * purchase or APK is used. SCREENSHOT_DIR optionally saves the results. */
'use strict';
const {chromium}=require('playwright-core');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..'),output=process.env.SCREENSHOT_DIR;
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const report={short:[],long:{},errors:[]};

(async()=>{
 const server=http.createServer((request,response)=>{
  const file=path.resolve(root,'.'+new URL(request.url,'http://local').pathname);
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){response.writeHead(404).end();return;}
  response.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml'})[path.extname(file)]||'text/html');
  fs.createReadStream(file).pipe(response);
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
  async function open(width,height,study='zh',nat='fr'){
   const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
   await context.route('**/*',route=>{
    const url=new URL(route.request().url());
    if(url.pathname.includes('/.netlify/'))return route.fulfill({json:{paid:false}});
    if(url.pathname.endsWith('/mobile-runtime.js'))return route.fulfill({contentType:'text/javascript',body:''});
    if(url.origin!==base)return route.abort();
    return route.continue();
   });
   const page=await context.newPage();
   page.on('pageerror',error=>report.errors.push(error.message));
   await page.goto(base+'/app.html?start=1&lang='+nat+'&study='+study);
   await page.waitForFunction(()=>typeof pool!=='undefined'&&pool.length&&document.body.classList.contains('lesson-mobile-pastilles'));
   await delay(1150);return {page,context};
  }
  async function settle(page){await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await delay(180);}
  async function swipe(page,direction='up',cancel=false){
   const r=await page.locator('#card').boundingBox();
   const x=r.x+r.width*.9;
   const top=await page.locator('#card').evaluate(e=>e.getBoundingClientRect().top+e.clientTop+20);
   const bottom=r.y+r.height-30;
   const y1=direction==='down'?top:bottom,y2=direction==='down'?bottom:top;
   const client=await page.context().newCDPSession(page);
   await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y:y1}]});
   for(let i=1;i<=8;i++){
    await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y1+(y2-y1)*i/8}]});await delay(25);
   }
   await client.send('Input.dispatchTouchEvent',{type:cancel?'touchCancel':'touchEnd',touchPoints:[]});
   await client.detach();await delay(450);
  }
  const state=page=>page.evaluate(()=>({idx,notes:Object.fromEntries(Object.entries(localStorage).filter(([key])=>/^ox_(known|again)_|^melunga_srs/.test(key)))}));
  async function scrollTo(page,where){await page.locator('#card').evaluate((e,where)=>{e.scrollTop=where==='bottom'?e.scrollHeight:where;},where);await settle(page);}

  for(const[width,height,study,nat]of[[320,568,'zh','fr'],[390,600,'zh','fr'],[390,844,'zh','fr'],[320,568,'ja','fr'],[320,568,'ko','fr'],[390,720,'es','fr'],[390,720,'en','fr'],[390,720,'it','fr'],[390,720,'fr','zh']]){
   const {page,context}=await open(width,height,study,nat),label=[width,height,nat,study].join('-');
   const first=await state(page);await swipe(page);
   assert.equal(await page.evaluate(()=>idx),first.idx+1,label+': upward swipe advances exactly once');
   assert.deepEqual((await state(page)).notes,first.notes,label+': navigation does not rate');
   await swipe(page,'down');assert.equal(await page.evaluate(()=>idx),first.idx,label+': downward swipe returns');
   if(study==='zh'){
    await page.locator('#pytgl').click();await settle(page);
    assert.equal(await page.evaluate(()=>idx),first.idx,label+': Pinyin control does not navigate');
    const index=await page.evaluate(()=>idx);await swipe(page);
    assert.equal(await page.evaluate(()=>idx),index+1,label+': Pinyin also permits navigation');
    if(output){fs.mkdirSync(output,{recursive:true});await page.screenshot({path:path.join(output,'chinois-'+width+'x'+height+'.png')});}
   }
   const size=await page.locator('#fr').evaluate(e=>parseFloat(getComputedStyle(e).fontSize));
   assert(size>=24,label+': short phrase remains readable');
   report.short.push({width,height,study,nat,passed:true});await context.close();
  }

  const {page,context}=await open(390,600);
  // Stress rendered content only; the catalogue and access rights are untouched.
  await page.evaluate(()=>{
   document.getElementById('fr').textContent='我想和你一起去市场，然后回家做饭。'.repeat(12);
   document.getElementById('phon').textContent='ouo siang hé ni i-tchi tchu cheu-tchang. '.repeat(15);
   document.getElementById('cn').textContent='Je voudrais aller au marché avec toi. '.repeat(15);fitCard();
  });await settle(page);
  assert(await page.locator('#card').evaluate(e=>e.classList.contains('lesson-card-scrollable')),'long content remains scrollable');
  const clip=await page.locator('#card').evaluate(e=>{const r=e.getBoundingClientRect();return{x:Math.ceil(r.x+1),y:Math.ceil(r.y+1),width:Math.floor(r.width-2),height:Math.floor(e.clientTop-2)}});
  const band=await page.screenshot({clip,animations:'disabled'}),original=await state(page);
  await swipe(page);
  assert(await page.locator('#card').evaluate(e=>e.scrollTop>0),'first upward gesture reads long content');
  assert.deepEqual(await state(page),original,'reading from the top neither navigates nor rates');
  assert(band.equals(await page.screenshot({clip,animations:'disabled'})),'content stays below the tools while reading');
  await scrollTo(page,100);await swipe(page);
  assert(await page.locator('#card').evaluate(e=>e.scrollTop>100),'native scrolling works in the middle');
  assert.deepEqual(await state(page),original,'native scrolling neither navigates nor rates');
  await page.locator('#card').evaluate(e=>{e.scrollTop=e.scrollHeight-e.clientHeight-15});await settle(page);await swipe(page);
  assert(await page.locator('#card').evaluate(e=>e.scrollHeight-e.clientHeight-e.scrollTop<=1),'reading can reach the bottom');
  assert.deepEqual(await state(page),original,'reaching the bottom in the same gesture does not navigate');
  await swipe(page,'up',true);
  assert.deepEqual(await state(page),original,'cancelled gesture cannot navigate or rate');
  await swipe(page,'down');
  assert(await page.locator('#card').evaluate(e=>e.scrollHeight-e.clientHeight-e.scrollTop>1),'reverse gesture at the bottom reads earlier text');
  assert.deepEqual(await state(page),original,'reverse reading does not navigate');
  await scrollTo(page,'bottom');await swipe(page);
  assert.equal(await page.evaluate(()=>idx),original.idx+1,'a new upward swipe from the bottom advances once');
  assert.equal(await page.locator('#card').evaluate(e=>e.scrollTop),0,'next card starts at the top');
  assert.deepEqual((await state(page)).notes,original.notes,'boundary navigation does not rate');
  report.long={reading:true,nativePan:true,cancelSafe:true,bottomNavigation:true,toolsProtected:true};
  await context.close();
  const rating=await open(390,720,'es');
  const ratingPage=rating.page,r=await ratingPage.locator('#card').boundingBox();
  const y=await ratingPage.locator('#card').evaluate(e=>e.getBoundingClientRect().top+e.clientTop+20);
  const client=await ratingPage.context().newCDPSession(ratingPage),count=await ratingPage.evaluate(()=>pool.length);
  await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r.x+30,y}]});
  for(let i=1;i<=8;i++){
   await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:r.x+30+(r.width-60)*i/8,y}]});await delay(25);
  }
  await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await delay(500);
  assert.equal(await ratingPage.evaluate(()=>pool.length),count-1,'horizontal known gesture retains its rating behaviour');
  const beforeZoom=await state(ratingPage);
  const points=[{x:r.x+r.width*.4,y},{x:r.x+r.width*.6,y:y+30}];
  await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[points[0]]});
  await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points});
  await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:points[0].x-30,y:y-30},{x:points[1].x+30,y:y+60}]});
  await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await delay(300);
  assert.deepEqual(await state(ratingPage),beforeZoom,'two-finger gesture cannot navigate or rate');
  await client.detach();await rating.context.close();
  report.controls={horizontalRating:true,multitouchSafe:true};
  assert.deepEqual(report.errors,[],'no JavaScript errors');
  if(output)fs.writeFileSync(path.join(output,'verification.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
