/* Capture the standalone proposals with original embedded artwork. No provider calls. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright-core');
const HERE=__dirname,ORIGIN='https://melunga-desktop-proposals.test';
const names=['themes-et-commandes','bibliotheque-a-droite','ruban-de-themes','navigation-en-colonne','themes-en-mosaique'];
const titles=['Thèmes à gauche, commandes à droite','Bibliothèque de thèmes à droite','Ruban de thèmes en bas','Navigation en colonne','Thèmes en mosaïque'];
const descriptions=['Le parcours reste visible, la leçon est centrée et les actions sont toutes proches.','De grandes vignettes sur le côté, avec les trois actions sous la leçon.','Les photos des thèmes occupent le bas ; les commandes restent à droite.','Les rubriques sont à gauche et les commandes sont attachées au bord de la carte.','Six grandes vignettes à droite : une présentation plus visuelle.'];
const report={environment:'Local Chromium, desktop viewport emulation',productChanged:false,realProviderCalls:false,cases:[],errors:[],unexpected:[]};
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  for(const size of[{width:1600,height:900},{width:1366,height:768}])for(let variant=1;variant<=5;variant++){
   const page=await browser.newPage({viewport:size,deviceScaleFactor:1});
   page.on('pageerror',error=>report.errors.push(error.message));
   await page.route('**/*',route=>{const u=new URL(route.request().url());if(u.origin!==ORIGIN){report.unexpected.push(u.href);return route.abort();}return route.fulfill({contentType:'text/html',body:fs.readFileSync(path.join(HERE,'maquettes.html'))});});
   await page.goto(ORIGIN+'/maquettes.html?v='+variant);await page.waitForFunction(()=>window.__mockupReady);await page.evaluate(()=>document.fonts.ready);
   await page.locator('img').evaluateAll(ns=>Promise.all(ns.map(n=>n.decode())));
   await page.evaluate(()=>new Promise((resolve,reject)=>{const image=new Image();image.onload=resolve;image.onerror=reject;image.src=getComputedStyle(document.documentElement).getPropertyValue('--scene').trim().slice(5,-2);}));
   await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   const layout=await page.evaluate(()=>{
    const rect=n=>{const r=n.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
    return{document:{width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight},viewport:{width:innerWidth,height:innerHeight},lesson:rect(document.querySelector('.lesson')),footer:rect(document.querySelector('.legal')),fonts:['.study','.phonetic strong','.translation'].map(s=>parseFloat(getComputedStyle(document.querySelector(s)).fontSize)),actions:[...document.querySelectorAll('[data-action]')].filter(n=>n.getClientRects().length).map(n=>({label:n.getAttribute('aria-label')||n.textContent.trim(),rect:rect(n)})),themePhotos:[...document.querySelectorAll('.theme-item .photo')].map(rect)};
   });
   assert.ok(layout.document.width<=size.width+1,'no horizontal overflow '+variant+' '+size.width);
   assert.ok(layout.footer.bottom<=size.height+1,'legal footer visible '+variant+' '+size.width+' '+JSON.stringify(layout));
   assert.ok(layout.fonts[0]>=40&&layout.fonts[1]>=29&&layout.fonts[2]>=28,'readable lesson');
   for(const action of layout.actions)assert.ok(action.rect.x>=0&&action.rect.right<=size.width&&action.rect.y>=0&&action.rect.bottom<=size.height,'all actions visible');
   if(size.width===1600){const file=`${variant}-${names[variant-1]}.png`;await page.screenshot({path:path.join(HERE,file),animations:'disabled'});}
   // The preview Next must be usable without contacting a live service or saving progress.
   const before=await page.locator('.study').textContent();await page.locator('[data-action="next"]').click();assert.notEqual(await page.locator('.study').textContent(),before);assert.equal(await page.evaluate(()=>localStorage.length),0);
   report.cases.push({variant,size,layout});await page.close();
  }
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.unexpected,[]);report.status='passed';
  const cards=names.map((name,i)=>`<article><div class="caption"><b>${i+1}. ${titles[i]}</b>${i===0?'<span>Mon conseil</span>':''}</div><a href="${i+1}-${name}.png"><img src="${i+1}-${name}.png" alt="Maquette ${i+1} : ${titles[i]}"></a><p>${descriptions[i]}</p><div class="links"><a href="maquettes.html?v=${i+1}">Ouvrir la maquette</a><a href="${i+1}-${name}.png" download>Télécharger l’image ↗</a></div></article>`).join('');
  fs.writeFileSync(path.join(HERE,'comparaison.html'),`<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Melunga · 5 maquettes ordinateur</title><style>*{box-sizing:border-box}body{margin:0;padding:45px;background:#f4eff3;color:#342735;font:16px/1.5 system-ui,sans-serif}header{max-width:1440px;margin:0 auto 26px}small{font-size:12px;text-transform:uppercase;letter-spacing:.13em;color:#96617e}h1{font-size:36px;letter-spacing:-.04em;line-height:1.1;margin:12px 0}header p{max-width:850px;color:#6d5767}main{max-width:1440px;margin:auto;display:grid;grid-template-columns:1fr 1fr;gap:24px}article{padding:14px;background:white;border-radius:22px;border:1px solid #e9dfe7;overflow:hidden}.caption{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:16px;padding:4px 4px 12px}.caption span{font-size:11px;background:#edf6f1;color:#276959;padding:5px 10px;border-radius:12px;white-space:nowrap}img{display:block;width:100%;height:auto;border:1px solid #efe5eb;border-radius:12px}article p{font-size:13px;color:#705a6a;padding-inline:4px;min-height:38px}.links{display:flex;justify-content:space-between;gap:12px;border-top:1px solid #f1e9ef;padding:11px 4px 0;font-size:12px}.links a{color:#75405e;text-underline-offset:3px}.advice{padding:35px;background:#fce9f2;display:flex;flex-direction:column;justify-content:center}.advice h2{font-size:27px;line-height:1.15;margin:0 0 15px;letter-spacing:-.035em}.advice p{font-size:16px;max-width:470px}.foot{max-width:1440px;margin:25px auto 0;color:#826c7c;font-size:12px}@media(max-width:800px){body{padding:20px}main{grid-template-columns:1fr}h1{font-size:30px}.advice{padding:25px}}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto}}</style><header><small>Melunga · Propositions ordinateur</small><h1>Une leçon plus compacte,<br>des repères à portée de main.</h1><p>Cinq dispositions avec la même phrase, l’ambiance rose et une phonétique translucide. Ouvre chaque image pour la voir en grand.</p></header><main>${cards}<article class="advice"><small>Mon conseil</small><h2>La 1, pour réunir<br>les thèmes et les actions.</h2><p>La leçon occupe le centre. Les thèmes restent faciles à retrouver, et « Écouter » est juste au-dessus de « Suivant ».</p><p>La 2 est une alternative plus simple si tu préfères conserver les trois boutons sous la leçon.</p></article></main><p class="foot">Maquettes à comparer avant ton choix. Les prototypes ne modifient pas ta progression.</p></html>`);
  const page=await browser.newPage({viewport:{width:1600,height:1600},deviceScaleFactor:1});
  await page.route('**/*',route=>{const u=new URL(route.request().url()),file=path.join(HERE,path.basename(u.pathname));return route.fulfill({contentType:file.endsWith('.png')?'image/png':'text/html',body:fs.readFileSync(file)});});
  await page.goto(ORIGIN+'/comparaison.html');await page.locator('img').evaluateAll(ns=>Promise.all(ns.map(n=>n.decode())));await page.evaluate(()=>document.fonts.ready);await page.screenshot({path:path.join(HERE,'comparaison-5-maquettes.png'),fullPage:true});await page.close();
 }catch(error){report.status='failed';report.failure=error.stack;throw error;}finally{await browser.close();fs.writeFileSync(path.join(HERE,'verification.json'),JSON.stringify(report,null,2)+'\n');}
 console.log(JSON.stringify({status:report.status,cases:report.cases.length,errors:report.errors,unexpected:report.unexpected}));
})().catch(error=>{console.error(error);process.exitCode=1;});
