'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright-core');
const HERE=__dirname,ORIGIN='https://melunga-bottom-actions.test';
const report={status:'running',environment:'Local Chromium, emulated desktop sizes',liveProductChanged:false,errors:[],unexpected:[],cases:[]};
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  for(const size of[{width:1600,height:900},{width:1366,height:768}]){
   const page=await browser.newPage({viewport:size,deviceScaleFactor:1});page.on('pageerror',e=>report.errors.push(e.message));
   await page.route('**/*',route=>{if(new URL(route.request().url()).origin!==ORIGIN){report.unexpected.push(route.request().url());return route.abort();}return route.fulfill({contentType:'text/html',body:fs.readFileSync(path.join(HERE,'maquette-boutons-en-bas.html'))});});
   await page.goto(ORIGIN+'/maquette-boutons-en-bas.html');await page.waitForFunction(()=>window.__mockupReady);await page.evaluate(()=>document.fonts.ready);
   await page.locator('img').evaluateAll(ns=>Promise.all(ns.map(n=>n.decode())));
   await page.evaluate(()=>new Promise((resolve,reject)=>{const img=new Image();img.onload=resolve;img.onerror=reject;img.src=getComputedStyle(document.documentElement).getPropertyValue('--scene').trim().slice(5,-2);}));
   await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   const geometry=await page.evaluate(()=>{
    const rect=n=>{const r=n.getBoundingClientRect();return{x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height};};
    return{document:{width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight},themes:rect(document.querySelector('.theme-panel')),lesson:rect(document.querySelector('.lesson')),translation:rect(document.querySelector('.translation')),actions:[...document.querySelectorAll('.actions .action')].map(n=>({label:n.textContent.trim(),...rect(n)})),legal:rect(document.querySelector('.legal')),fonts:['.study','.phonetic strong','.translation'].map(s=>parseFloat(getComputedStyle(document.querySelector(s)).fontSize)),earVisible:!!document.querySelector('.ear').getClientRects().length,commandPanels:document.querySelectorAll('.command-panel').length};
   });
   assert.ok(geometry.document.width<=size.width&&geometry.document.height<=size.height,'no page overflow');
   assert.ok(geometry.themes.right<geometry.lesson.x,'themes stay on the left');assert.ok(geometry.lesson.width>=740&&geometry.lesson.width<=820,'lesson remains compact');
   assert.equal(geometry.commandPanels,0);assert.equal(geometry.earVisible,true);assert.deepEqual(geometry.actions.map(n=>n.label),['À revoir','Écouter','Suivant']);
   for(const action of geometry.actions){assert.ok(action.y>geometry.translation.bottom,'actions are below the lesson text');assert.ok(action.y>=0&&action.bottom<=size.height&&action.right<=size.width,'action visible');}
   assert.ok(Math.max(...geometry.actions.map(n=>n.y))-Math.min(...geometry.actions.map(n=>n.y))<=1,'three actions share one row');assert.ok(geometry.legal.bottom<=size.height,'legal links visible');
   assert.ok(geometry.fonts[0]>=40&&geometry.fonts[1]>=29&&geometry.fonts[2]>=28,'readable type');
   await page.screenshot({path:path.join(HERE,size.width===1600?'maquette-1-commandes-en-bas.png':'maquette-1-1366.png'),animations:'disabled'});
   const before=await page.locator('.study').textContent();await page.locator('.actions [data-action="next"]').click();assert.notEqual(await page.locator('.study').textContent(),before);assert.equal(await page.evaluate(()=>localStorage.length),0);
   report.cases.push({size,geometry});await page.close();
  }
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.unexpected,[]);report.status='passed';
 }catch(error){report.status='failed';report.failure=error.stack;throw error;}finally{await browser.close();fs.writeFileSync(path.join(HERE,'verification.json'),JSON.stringify(report,null,2)+'\n');}
 console.log(JSON.stringify({status:report.status,cases:report.cases.length}));
})().catch(error=>{console.error(error);process.exitCode=1;});
