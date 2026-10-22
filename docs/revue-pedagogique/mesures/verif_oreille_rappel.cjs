// L'oreille pendant le rappel : visible ? un appui révèle-t-il explicitement ?
// un bouton d'arrière-plan peut-il révéler à son insu ?
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
  await ctx.route('**/*',async route=>{const u=new URL(route.request().url());
   if(u.pathname.includes('/.netlify/'))return route.fulfill({json:u.pathname.endsWith('/get-pricing')?{monthlyDisplay:'7,90 €',annualDisplay:'42 €'}:{paid:false}});
   return route.continue();});
  const page=await ctx.newPage(); const errs=[]; page.on('pageerror',e=>errs.push(String(e)));
  await page.addInitScript(([n,l])=>{try{localStorage.setItem('ox_nat',n);localStorage.setItem('ox_lang',l);}catch(e){}},pair);
  await page.goto(base+'/app.html',{waitUntil:'load'}); await page.waitForTimeout(1800);
  await page.evaluate(()=>setMode('l1-cafe',document.getElementById('l1CafeEntry')));
  await page.waitForTimeout(1600);
  const r=await page.evaluate(async()=>{
   const S=()=>{const e=document.querySelector('#card .earicon');const cs=e?getComputedStyle(e):null;
    return {masque:document.getElementById('card').classList.contains('l1-cafe-hidden'),
     texteEtudie:(document.getElementById('fr')||{}).textContent,
     phonetique:(document.getElementById('phon')||{}).textContent,
     sens:(document.getElementById('cn')||{}).textContent,
     oreille:!e?'absente':(cs.display==='none'||cs.visibility==='hidden'?'cachée':(e.disabled?'désactivée':'VISIBLE et active')),
     aria:e?e.getAttribute('aria-label'):null};};
   let g=0; while(g++<40 && !S().masque){ window.MelungaL1Cafe.next(); await new Promise(x=>setTimeout(x,40)); }
   const avant=S();
   // 1) le bouton d'arrière-plan ne doit PAS révéler
   window.MelungaL1Cafe.listen(document.getElementById('listen'));
   await new Promise(x=>setTimeout(x,220));
   const viaFond=S();
   // 2) l'appui sur l'oreille doit révéler explicitement
   const e=document.querySelector('#card .earicon'); if(e) e.click();
   await new Promise(x=>setTimeout(x,260));
   const viaOreille=S();
   return {avant,viaFond,viaOreille};
  });
  // l'oreille sur une réplique reçue (non masquée)
  const recue=await page.evaluate(async()=>{
   let g=0; while(g++<40){ const st=window.MelungaL1Cafe.state?window.MelungaL1Cafe.state():null;
    const role=(document.getElementById('l1CafeRole')||{}).textContent||'';
    if(/À comprendre|理解/.test(role)){ const e=document.querySelector('#card .earicon');
      return {role:role, oreille:e?(e.disabled?'désactivée':'VISIBLE et active'):'absente'}; }
    window.MelungaL1Cafe.next(); await new Promise(x=>setTimeout(x,40)); }
   return null;
  });
  out[pair.join('-')]={erreursJS:errs.length, rappel:r, surRepliqueRecue:recue};
  await ctx.close();
 }
 await browser.close(); server.close();
 console.log(JSON.stringify(out,null,1));
})();
