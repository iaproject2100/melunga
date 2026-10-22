// Contrôle indépendant : un utilisateur NON payant peut-il parcourir la scène,
// les répliques reçues restent-elles visibles au masquage, et l'oreille ?
const http=require('http'),fs=require('fs'),path=require('path'),{chromium}=require('playwright-core');
const root=path.resolve(__dirname,'melunga_deploy');
(async()=>{
 const server=http.createServer((rq,rs)=>{
  const f=path.resolve(root,'.'+new URL(rq.url,'http://local').pathname);
  if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile())return rs.writeHead(404).end();
  rs.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml'})[path.extname(f)]||'text/html');
  fs.createReadStream(f).pipe(rs);
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']});
 const out={};
 for(const pair of [['fr','ko'],['fr','zh'],['zh','fr']]){
  const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  // utilisateur NON payant
  await ctx.route('**/*',async route=>{
   const u=new URL(route.request().url());
   if(u.pathname.includes('/.netlify/')) return route.fulfill({json:u.pathname.endsWith('/get-pricing')?{monthlyDisplay:'7,90 €',annualDisplay:'42 €'}:{paid:false}});
   return route.continue();
  });
  const page=await ctx.newPage();
  const errs=[]; page.on('pageerror',e=>errs.push(String(e)));
  await page.addInitScript(([n,l])=>{try{localStorage.setItem('ox_nat',n);localStorage.setItem('ox_lang',l);}catch(e){}},pair);
  await page.goto(base+'/app.html',{waitUntil:'load'});
  await page.waitForTimeout(1800);
  const id=pair[0]+'-'+pair[1];
  const entry=await page.locator('[data-l1-cafe-entry]').count();
  let res={entree:entry>0,erreursJS:errs.length};
  if(entry>0){
   // mesurer la découvrabilité : combien de gestes pour atteindre l'entrée
   res.visibleDirecte=await page.locator('[data-l1-cafe-entry]:visible').count()>0;
   if(!res.visibleDirecte){
     const opener=await page.evaluate(()=>{
       const b=document.getElementById('l1CafeEntry'); let n=b, chain=[];
       while(n&&n!==document.body){ const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden'||cs.opacity==='0') chain.push(n.className||n.id); n=n.parentElement; }
       return chain;
     });
     res.conteneursMasques=opener;
     // ouvrir les sélecteurs de thèmes
     for(const sel of ['#selTheme','.selbtn','[onclick*="openSel"]','.sel']){
       const c=await page.locator(sel).count();
       if(c){ try{ await page.locator(sel).first().click({timeout:2000}); await page.waitForTimeout(400); }catch(e){} }
       if(await page.locator('[data-l1-cafe-entry]:visible').count()>0){ res.ouvertPar=sel; break; }
     }
     res.visibleApresOuverture=await page.locator('[data-l1-cafe-entry]:visible').count()>0;
   }
   await page.evaluate(()=>setMode('l1-cafe',document.getElementById('l1CafeEntry')));
   await page.waitForTimeout(1500);
   res.paywall=await page.locator('#paywall:visible').count()>0;
   res.actif=await page.evaluate(()=>!!(window.MelungaL1Cafe&&window.MelungaL1Cafe.active()));
   const snap=async()=>await page.evaluate(()=>{
     const s=window.MelungaL1Cafe.state?window.MelungaL1Cafe.state():null;
     return {s, fr:(document.getElementById('fr')||{}).textContent,
       phon:(document.getElementById('phon')||{}).textContent,
       cn:(document.getElementById('cn')||{}).textContent,
       oreille:getComputedStyle(document.getElementById('listen')).display,
       phase:document.getElementById('card').getAttribute('data-l1-cafe-phase'),
       masque:document.getElementById('card').classList.contains('l1-cafe-hidden')};
   });
   // avancer jusqu'à la passe sans modèle
   let seen=[],guard=0,maskedLearner=null,maskedReceived=null;
   while(guard++<40){
    const v=await snap();
    if(v.phase==='reply-without-model'){
      if(v.masque && maskedLearner===null) maskedLearner={fr:v.fr,phon:v.phon,cn:v.cn,oreille:v.oreille};
      if(!v.masque && maskedReceived===null && v.fr) maskedReceived={fr:v.fr,cn:v.cn};
    }
    seen.push(v.phase);
    if(maskedLearner&&maskedReceived) break;
    await page.evaluate(()=>window.MelungaL1Cafe.next());
    await page.waitForTimeout(120);
   }
   res.phases=[...new Set(seen)];
   res.apprenantMasque=maskedLearner; res.recueVisible=maskedReceived;
   // sortie : retour aux cartes classiques
   await page.evaluate(()=>setMode('all',document.querySelector('.lv')));
   await page.waitForTimeout(600);
   res.sortieActif=await page.evaluate(()=>!!(window.MelungaL1Cafe&&window.MelungaL1Cafe.active()));
   res.carteClassique=await page.evaluate(()=>((document.getElementById('fr')||{}).textContent||'').slice(0,28));
   res.erreursJS=errs.length;
  }
  out[id]=res;
  await ctx.close();
 }
 await browser.close(); server.close();
 console.log(JSON.stringify(out,null,1));
})();
