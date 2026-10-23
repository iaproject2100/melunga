/* Lot B browser checks. NODE_PATH must expose playwright-core; CHROMIUM_PATH is optional. */
const {chromium}=require('playwright-core');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..');
(async()=>{
 const server=http.createServer((req,res)=>{const p=path.join(root,new URL(req.url,'http://local').pathname);if(!p.startsWith(root+path.sep)||!fs.existsSync(p)||!fs.statSync(p).isFile()){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',p.endsWith('.js')?'text/javascript':p.endsWith('.css')?'text/css':p.endsWith('.json')?'application/json':'text/html');fs.createReadStream(p).pipe(res);});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port;
 let browser;
 try{
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 async function open(nat,study,width=390,height=844,production=false){
  const context=await browser.newContext({viewport:{width,height},isMobile:width<1000,hasTouch:width<1000});
  const p=await context.newPage(),errors=[];let mode='ok';
  p.on('pageerror',e=>errors.push(e.message));
  await context.route('**/*',async route=>{const u=new URL(route.request().url());
   if(u.pathname.includes('/.netlify/'))return route.fulfill({json:{paid:false}});
   if(u.pathname.startsWith('/content/conversation/')){
    if(mode==='network')return route.abort();
    if(mode==='invalid')return route.fulfill({json:{version:2}});
    const name=path.basename(u.pathname),file=path.join(root,'content/conversation',name);
    if(mode==='missing'||!fs.existsSync(file))return route.fulfill({status:404,body:''});
    if(mode==='slow-es'&&name.includes('-fr-es'))await new Promise(r=>setTimeout(r,500));
    return route.fulfill({contentType:'application/json',body:fs.readFileSync(file)});
   }
   if(production&&u.hostname==='melunga.com')return route.fulfill({response:await route.fetch({url:base+u.pathname+u.search})});
   if(u.origin!==base)return route.abort();return route.continue();
  });
  await p.goto((production?'https://melunga.com':base)+'/app.html?start=1&lang='+nat+'&study='+study);
  await p.waitForTimeout(1000);
  return{p,context,errors,setMode:x=>{mode=x;}};
 }
 for(const [nat,study]of [['fr','es'],['fr','en'],['fr','zh'],['fr','it'],['fr','ja'],['fr','ko'],['zh','fr']]){
  const {p,context,errors}=await open(nat,study);const doc=JSON.parse(fs.readFileSync(path.join(root,'content/conversation','L1-'+nat+'-'+study+'.json')));
  await p.locator('#cxEntry').click();await p.locator('.cxModel').first().waitFor();assert.equal(await p.locator('.cxModel').count(),doc.units.length);
  assert.equal(await p.locator('.cxNotice').count(),(['zh','ja','ko'].includes(study)||nat==='zh')?1:0);
  await p.locator('.cxModel').first().click();assert.equal(await p.locator('.cxText').textContent(),doc.units[0].variants[0].study);
  assert.equal(await p.locator('.cxPart').textContent(),doc.units[0].variants[0].slot.study);
  if(['zh','ja','ko'].includes(study))assert.equal(await p.locator('.cxReading').textContent(),doc.units[0].variants[0].reading);
  await p.locator('.cxGrid button').nth(1).click();assert.equal(await p.locator('.cxText').textContent(),doc.units[0].variants[1].study);
  await p.locator('.cxNext').click();assert.equal(await p.locator('.cxText').count(),0);assert.equal(await p.locator('.cxPhon').count(),0);assert.equal(await p.locator('.cxReading').count(),0);
  await p.locator('.cxSelect').selectOption('3');await p.locator('.cxSheet>.cxBtn:not(.cxAgain)').click();assert.equal(await p.locator('.cxText').textContent(),doc.units[0].variants[3].study);
  await p.evaluate(()=>{window.audioChecks=[];window.speak=t=>audioChecks.push(t);});await p.locator('.cxCard > button.cxBtn').click();assert.deepEqual(await p.evaluate(()=>audioChecks),[doc.units[0].variants[3].study]);
  const before=await p.evaluate(()=>[idx,localStorage.getItem('ox_known_'+lang)]);
  await p.locator('.cxText').evaluate(e=>{e.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[new Touch({identifier:1,target:e,clientX:20,clientY:200})]}));e.dispatchEvent(new TouchEvent('touchend',{bubbles:true,changedTouches:[new Touch({identifier:1,target:e,clientX:190,clientY:200})]}));});
  assert.deepEqual(await p.evaluate(()=>[idx,localStorage.getItem('ox_known_'+lang)]),before);
  await p.locator('.cxConverse').click();await p.locator('#cxDialogue').waitFor();
  assert.equal(await p.locator('#cxDialogue option').count(),doc.dialogues.length);
  assert.equal(await p.locator('#cxHiddenRole').inputValue(),doc.dialogues[0].learnerRole);
  assert.equal(await p.locator('#cxHiddenRole option[value="A"]').textContent(),doc.dialogues[0].roles.A);
  if(doc.dialogues[0].learnerRole==='A')assert.equal(await p.locator('.cxTurnText').count(),0);
  await p.locator('#cxHiddenRole').selectOption('B');
  assert.equal(await p.locator('.cxTurnText').textContent(),doc.dialogues[0].turns[0].study);
  await p.locator('.cxTurnNext').click();
  assert.equal(await p.locator('.cxTurnText').count(),0);assert.equal(await p.locator('.cxPhon').count(),0);assert.equal(await p.locator('.cxReading').count(),0);assert.equal(await p.locator('.cxTurnListen').count(),0);
  assert.equal(await p.locator('.cxDialogueCard .cxFr').textContent(),doc.dialogues[0].turns[1].native);
  const dialogueBefore=await p.evaluate(()=>[idx,localStorage.getItem('ox_known_'+lang)]);
  await p.locator('.cxDialogueCard .cxFr').evaluate(e=>{e.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,touches:[new Touch({identifier:1,target:e,clientX:20,clientY:200})]}));e.dispatchEvent(new TouchEvent('touchend',{bubbles:true,changedTouches:[new Touch({identifier:1,target:e,clientX:190,clientY:200})]}));});
  assert.deepEqual(await p.evaluate(()=>[idx,localStorage.getItem('ox_known_'+lang)]),dialogueBefore);

  if(process.env.SCREENSHOT_DIR&&nat==='fr'&&study==='es'){fs.mkdirSync(process.env.SCREENSHOT_DIR,{recursive:true});await p.screenshot({path:path.join(process.env.SCREENSHOT_DIR,'2-role-masque.png')});}
  await p.locator('.cxTurnReveal').click();assert.equal(await p.locator('.cxTurnText').textContent(),doc.dialogues[0].turns[1].study);await p.locator('.cxTurnListen').click();assert.equal(await p.evaluate(()=>audioChecks.at(-1)),doc.dialogues[0].turns[1].study);
  await p.locator('.cxTurnPrevious').click();await p.locator('#cxHiddenRole').selectOption('A');assert.equal(await p.locator('.cxTurnText').count(),0);
  await p.locator('#cxHiddenRole').selectOption('');
  if(process.env.SCREENSHOT_DIR&&nat==='fr'&&study==='es')await p.screenshot({path:path.join(process.env.SCREENSHOT_DIR,'1-replique.png')});
  for(let di=0;di<doc.dialogues.length;di++){
   await p.locator('#cxDialogue').selectOption(String(di));assert.equal(await p.locator('#cxHiddenRole').inputValue(),doc.dialogues[di].learnerRole);await p.locator('#cxHiddenRole').selectOption('');
   for(let ti=0;ti<doc.dialogues[di].turns.length;ti++){
    const turn=doc.dialogues[di].turns[ti];assert.equal(await p.locator('.cxTurnText').textContent(),turn.study);
    if(turn.reading)assert.equal(await p.locator('.cxReading').textContent(),turn.reading);
    assert(await p.locator('.cxSheet').evaluate(e=>e.scrollWidth<=e.clientWidth+1));
    if(ti<doc.dialogues[di].turns.length-1)await p.locator('.cxTurnNext').click();
   }
  }
  await p.locator('.cxTurnNext').click();assert.equal(await p.locator('#cxDialogue').count(),0);assert(await p.locator('.cxConverse').isVisible());
  await p.locator('.cxConverse').click();await p.locator('.cxHead .cxIcon').first().click();assert.equal(await p.locator('#cxDialogue').count(),0);
  await p.locator('.cxConverse').click();
  await p.keyboard.press('Escape');assert(!await p.locator('.cxPanel').evaluate(e=>e.classList.contains('on')));assert.equal(await p.evaluate(()=>document.activeElement.id),'cxEntry');assert.deepEqual(errors,[]);
  console.log('PASS pair',nat,study,'variants, recall, all 3 dialogues, hidden roles, reading, audio, back/done/Escape, gestures, focus');await context.close();
 }
 for(const [width,height]of [[320,568],[1440,900]]){
  const {p,context,errors}=await open('fr','es',width,height);await p.locator('#cxEntry').click();await p.locator('.cxModel').first().waitFor();await p.locator('#cxLevel').selectOption('10');await p.waitForFunction(()=>document.querySelector('.cxModelExample')?.textContent.includes('D’un')||document.querySelector('.cxModelExample')?.textContent.includes("D'un"));
  await p.locator('.cxModel').first().click();assert(await p.locator('.cxSheet').evaluate(e=>e.scrollWidth<=e.clientWidth+1));assert(await p.locator('.cxSheet').evaluate(e=>e.getBoundingClientRect().bottom<=innerHeight+1));await p.locator('.cxNext').click();await p.locator('.cxConverse').click();await p.locator('#cxHiddenRole').selectOption('');
  const longDialogue=JSON.parse(fs.readFileSync(path.join(root,'content/conversation/L10-fr-es.json'))).dialogues[0];
  for(let ti=0;ti<longDialogue.turns.length;ti++){assert.equal(await p.locator('.cxTurnText').textContent(),longDialogue.turns[ti].study);assert(await p.locator('.cxSheet').evaluate(e=>e.scrollWidth<=e.clientWidth+1));if(ti<longDialogue.turns.length-1)await p.locator('.cxTurnNext').click();}
  assert.deepEqual(errors,[]);console.log('PASS viewport, L10 and full dialogue',width,height);await context.close();
 }
 {const {p,context,errors,setMode}=await open('fr','es');setMode('network');await p.locator('#cxEntry').click();await p.locator('[role=alert]').waitFor();setMode('invalid');await p.locator('.cxSheet>.cxBtn').click();await p.locator('[role=alert]').waitFor();setMode('ok');await p.locator('.cxSheet>.cxBtn').click();await p.locator('.cxModel').first().waitFor();
  await p.keyboard.press('Escape');await p.evaluate(()=>ConversationContent.clearCache());setMode('slow-es');await p.locator('#cxEntry').click();await p.evaluate(()=>setLang('ja'));await p.locator('.cxModel').first().waitFor();await p.waitForTimeout(700);await p.locator('.cxModel').first().click();assert((await p.locator('.cxText').textContent()).includes('です'));await p.evaluate(()=>setNat('en'));assert(!await p.locator('.cxPanel').evaluate(e=>e.classList.contains('on')));assert(!await p.locator('#cxEntry').isVisible());assert.deepEqual(errors,[]);console.log('PASS network/invalid retry and stale selection/unsupported pair');await context.close();}
 {const {p,context,setMode}=await open('fr','es');setMode('missing');await p.locator('#cxEntry').click();await p.waitForTimeout(300);assert(!await p.locator('#cxEntry').isVisible());assert(!await p.locator('.cxPanel').evaluate(e=>e.classList.contains('on')));console.log('PASS missing content');await context.close();}
 {const {p,context,errors}=await open('fr','es',390,844,true);await p.locator('#cxEntry').click();await p.locator('.cxModel').first().waitFor();assert(await p.locator('#cxLevel option[value="2"]').isDisabled());await p.evaluate(()=>{isPaid=true;closeConstruire();openConstruire();});await p.locator('.cxModel').first().waitFor();assert(!await p.locator('#cxLevel option[value="2"]').isDisabled());assert.deepEqual(errors,[]);console.log('PASS public free/Premium access unchanged');await context.close();}
 // Lot E: refresh, pair isolation, obsolete/corrupt records and unavailable storage.
 {const {p,context,errors}=await open('fr','es');
  const readDoc=(n,nat,study)=>JSON.parse(fs.readFileSync(path.join(root,'content/conversation',`L${n}-${nat}-${study}.json`)));
  await p.locator('#cxEntry').click();await p.locator('.cxModel').first().waitFor();await p.locator('#cxLevel').selectOption('5');await p.waitForFunction(()=>document.querySelector('.cxModelExample')?.textContent.startsWith('Hier'));
  await p.locator('.cxModel').nth(3).click();const selected=readDoc(5,'fr','es').units[3];
  await p.reload();await p.waitForTimeout(1000);await p.locator('#cxEntry').click();await p.locator('.cxText').waitFor();assert.equal(await p.locator('.cxText').textContent(),selected.variants[0].study);
  await p.evaluate(()=>setLang('ja'));await p.locator('.cxModel').first().waitFor();assert.equal(await p.locator('#cxLevel').inputValue(),'1');await p.locator('.cxModel').nth(1).click();assert.equal(await p.locator('.cxNotice').count(),1);
  await p.evaluate(()=>setLang('es'));await p.locator('.cxText').waitFor();assert.equal(await p.locator('.cxText').textContent(),selected.variants[0].study);
  await p.evaluate(()=>setLang('ja'));await p.locator('.cxText').waitFor();assert.equal(await p.locator('.cxText').textContent(),readDoc(1,'fr','ja').units[1].variants[0].study);
  await p.locator('.cxNext').click();assert.equal(await p.locator('.cxNotice').count(),1);await p.locator('.cxConverse').click();assert.equal(await p.locator('.cxNotice').count(),1);
  await p.keyboard.press('Escape');await p.evaluate(()=>{localStorage.setItem('melunga_conversation_resume_v1:fr:ja',JSON.stringify({version:1,level:2,unitId:'deleted-model'}));openConstruire();});await p.locator('.cxModel').first().waitFor();assert.equal(await p.locator('#cxLevel').inputValue(),'2');
  await p.keyboard.press('Escape');await p.evaluate(()=>{localStorage.setItem('melunga_conversation_resume_v1:fr:ja','{broken');openConstruire();});await p.locator('.cxModel').first().waitFor();assert.equal(await p.locator('#cxLevel').inputValue(),'1');
  await p.keyboard.press('Escape');await p.evaluate(()=>{window.oldGet=Storage.prototype.getItem;window.oldSet=Storage.prototype.setItem;Storage.prototype.getItem=function(){throw new Error('blocked');};Storage.prototype.setItem=function(){throw new Error('quota');};openConstruire();});await p.locator('.cxModel').first().waitFor();await p.locator('.cxModel').first().click();assert(await p.locator('.cxText').isVisible());await p.evaluate(()=>{Storage.prototype.getItem=oldGet;Storage.prototype.setItem=oldSet;});assert.deepEqual(errors,[]);console.log('PASS resume refresh, pair isolation, removed model, corrupt and blocked storage; review notice on resumed exercises/dialogue');await context.close();
 }
 {const {p,context}=await open('fr','es',390,844,true);await p.evaluate(()=>{localStorage.setItem('melunga_conversation_resume_v1:fr:es',JSON.stringify({version:1,level:5,unitId:'L5-fr-es-01'}));openConstruire();});await p.locator('.cxModel').first().waitFor();assert.equal(await p.locator('#cxLevel').inputValue(),'1');assert(await p.locator('#cxLevel option[value="5"]').isDisabled());console.log('PASS saved premium level cannot bypass current access');await context.close();}
 {const {p,context,setMode}=await open('fr','es',390,844,true);setMode('slow-es');await p.evaluate(()=>{isPaid=true;localStorage.setItem('melunga_conversation_resume_v1:fr:es',JSON.stringify({version:1,level:5,unitId:'L5-fr-es-01'}));openConstruire();setTimeout(()=>{isPaid=false;},50);});await p.locator('.cxModel').first().waitFor();assert.equal(await p.locator('#cxLevel').inputValue(),'1');console.log('PASS access rechecked after delayed saved-level response');await context.close();}
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
