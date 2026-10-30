/* Offline visual regression against actual app DOM, CSS and selection code.
 * Current classic buttons contain neither Arabic nor German. Those two future
 * button badges are explicit DOM fixtures, never cards or enabled courses.
 * The raw production setLang runs with unrelated lesson/audio rebuilds stubbed.
 */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {test,before,after}=require('node:test');
let chromium;try{({chromium}=require('playwright-core'));}catch{({chromium}=require('/opt/codex/cua_node/lib/node_modules/playwright-core'));}
const ROOT=path.resolve(__dirname,'../..'),WEB=path.join(ROOT,'melunga_deploy'),ORIGIN='https://language-badges.test';
const OUTPUT=process.env.LANGUAGE_BADGE_REPORT_DIR||'/tmp/melunga-arabic-badges';
const app=fs.readFileSync(path.join(WEB,'app.html'),'utf8');
const rawSetLang=app.match(/function setLang\(l,btn\)\{[\s\S]*?\n\}/)?.[0];assert.ok(rawSetLang);
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const report={status:'running',allResponsesLocalFixtures:true,publicSiteChecked:false,realAccountsUsed:false,actualAudioPlayed:false,upstreamTtsCalled:false,
  arabicDeckIntegrated:false,arabicAndGermanClassicButtons:'absent in product; explicit DOM fixture only',
  setLangExecution:'actual production function; unrelated storage/audio/lesson-rebuild functions stubbed',cases:[],requests:[],unexpected:[],errors:[],screenshots:[]};
report.visualFixture='After the actual menu decorator runs, DOM observers are paused. Actual controls are presented in an explicitly labelled test panel so the current tool rail cannot clip legacy badges; product badge CSS is unchanged.';
let browser;
before(async()=>{fs.mkdirSync(OUTPUT,{recursive:true});browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});});
after(async()=>{
  await browser?.close();report.status=!report.errors.length&&!report.unexpected.length&&report.cases.length===3?'passed':'failed';
  report.appSha256=sha(fs.readFileSync(path.join(WEB,'app.html')));
  fs.writeFileSync(path.join(OUTPUT,'report.json'),JSON.stringify(report,null,2)+'\n');
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.unexpected,[]);assert.equal(report.status,'passed');
});
async function fixture(url='/app.html?classic=1'){
  const context=await browser.newContext({viewport:{width:1100,height:850},reducedMotion:'reduce',serviceWorkers:'block'});
  await context.addInitScript(()=>{
    const Observer=window.MutationObserver;window.__badgeObservers=[];
    window.MutationObserver=class extends Observer{constructor(callback){super(callback);window.__badgeObservers.push(this);}};
    localStorage.setItem('ox_nat','fr');localStorage.setItem('ox_lang','en');localStorage.setItem('ox_device','offline-badge-fixture');
    localStorage.setItem('melunga-app-language',JSON.stringify({locale:'fr',label:'FR Français'}));
    window.SpeechSynthesisUtterance=class{};Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},getVoices(){return[];},addEventListener(){},removeEventListener(){},speak(){throw Error('Badge tests must not play speech');}}});
    window.Audio=class{pause(){}load(){}play(){throw Error('Badge tests must not play audio');}addEventListener(){}removeEventListener(){}};
  });
  await context.route('**/*',async route=>{
    const request=route.request(),u=new URL(request.url());
    if(request.method()!=='GET'){report.unexpected.push({method:request.method(),path:u.pathname});return route.abort();}
    if(u.origin==='https://fonts.googleapis.com')return route.fulfill({contentType:'text/css',body:'/* offline font fixture */'});
    if(u.origin!==ORIGIN){report.unexpected.push({origin:u.origin,path:u.pathname});return route.abort();}
    if(u.pathname==='/.netlify/functions/tts'&&u.searchParams.get('catalog')==='chirp3'){report.requests.push({path:u.pathname,kind:'catalogue-fixture'});return route.fulfill({status:503,json:{error:'offline_catalogue_fixture'}});}
    if(u.pathname==='/.netlify/functions/check-status'){report.requests.push({path:u.pathname,kind:'status-fixture'});return route.fulfill({json:{paid:false}});}
    if(u.pathname==='/.netlify/functions/get-pricing')return route.fulfill({json:{country:'FR',monthlyDisplay:'7,90 €',annualDisplay:'42 €'}});
    if(u.pathname==='/api/geolocation')return route.fulfill({json:{country:'FR'}});
    if(u.pathname==='/mobile-runtime.js')return route.fulfill({contentType:'text/javascript',body:'/* Explicit ordinary-web runtime fixture; native bridge unavailable. */'});
    if(/^\/(?:\.netlify|api)\//.test(u.pathname)){report.unexpected.push({method:request.method(),path:u.pathname});return route.abort();}
    const file=path.resolve(WEB,decodeURIComponent(u.pathname).replace(/^\//,'')||'index.html');
    if(!file.startsWith(WEB+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){report.unexpected.push({missing:u.pathname});return route.fulfill({status:404,body:'Not found'});}
    return route.fulfill({body:fs.readFileSync(file),contentType:{'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp'}[path.extname(file)]||'application/octet-stream'});
  });
  const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));
  await page.goto(ORIGIN+url,{waitUntil:'domcontentloaded'});
  if(url.startsWith('/app'))await page.waitForFunction(()=>document.querySelector('#lEN .menu-b-flag')&&typeof window.setLang==='function');
  return {context,page};
}
async function prepare(page,menuB){
  return page.evaluate(async({rawSetLang,menuB})=>{
    const existing={arabic:!!document.getElementById('lAR'),german:!!document.getElementById('lDE')};
    const target=document.getElementById('lEN').parentElement;
    for(const [id,code,label] of [['lAR','ar','العربية'],['lDE','de','Deutsch']]){
      const button=document.createElement('button');button.id=id;button.className='lang';button.dataset.badgeFixture='true';
      button.innerHTML='<span class="fl'+(code==='ar'?' fl-ar':'')+'">'+(code==='ar'?'ع':'🇩🇪')+'</span>'+label;target.appendChild(button);
    }
    if(menuB){
      // Run the actual production refresh/decorator, including LANGUAGE_FLAGS.
      window.toggleUMenu();
      await new Promise(resolve=>setTimeout(resolve,20));
    }
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    window.__badgeObservers.forEach(observer=>observer.disconnect());
    const welcome=document.getElementById('welcome');if(welcome)welcome.style.setProperty('display','none','important');
    const drawer=document.getElementById('ctrlDrawer');drawer.classList.toggle('menu-b',menuB);drawer.classList.add('open');
    drawer.style.setProperty('transform','none','important');drawer.style.setProperty('visibility','visible','important');
    const picker=document.getElementById('selLang');picker.classList.add('open');
    const menu=picker.querySelector('.selmenu');if(menu){menu.style.setProperty('display','flex','important');menu.style.setProperty('position','static','important');menu.style.setProperty('flex-wrap','wrap','important');}
    if(!menuB)document.querySelectorAll('#selLang .lang .fl').forEach(flag=>{
      const code=({lFR:'fr',lEN:'en',lES:'es',lZH:'zh',lIT:'it',lJA:'ja',lKO:'ko',lDE:'de',lAR:'ar'})[flag.parentElement.id];
      flag.className='fl'+(code==='ar'?' fl-ar':'');
      flag.textContent=({fr:'🇫🇷',en:'🇺🇸',es:'🇪🇸',zh:'🇨🇳',it:'🇮🇹',ja:'🇯🇵',ko:'🇰🇷',de:'🇩🇪',ar:'ع'})[code];
    });
    // The production menu hides collapsed controls. Reveal fixture ancestry
    // only; all badge sizing, colours and backgrounds remain product CSS.
    for(const node of document.querySelectorAll('#selLang .fl,#ballLang')){
      for(let ancestor=node.parentElement;ancestor&&ancestor!==document.body;ancestor=ancestor.parentElement){
        const style=getComputedStyle(ancestor);
        if(style.display==='none')ancestor.style.setProperty('display','block','important');
        if(style.visibility==='hidden')ancestor.style.setProperty('visibility','visible','important');
      }
    }
    const caption=document.createElement('p');caption.dataset.badgeFixture='true';
    caption.textContent=(menuB?'Menu B':'Classic')+' badge fixture — Arabic/German have no classic course or button in the product.';
    caption.style.cssText='margin:0 0 20px;color:#173e50;font:600 15px/1.5 Arial,sans-serif;text-align:center';
    drawer.replaceChildren(caption,picker);
    picker.classList.remove('open'); // explicit panel replaces the original modal veil
    for(const [property,value] of Object.entries({display:'block',position:'fixed',left:'210px',right:'auto',top:'180px',bottom:'auto',width:'680px','max-width':'680px',height:'auto','max-height':'none',padding:'24px',overflow:'visible',background:'#f7fbff',opacity:'1',transform:'none','z-index':'99999','border-radius':'18px'}))drawer.style.setProperty(property,value,'important');
    for(const [property,value] of Object.entries({display:'flex','flex-direction':'column',gap:'20px',width:'100%',height:'auto','min-height':'0',position:'relative',padding:'10px',overflow:'visible'}))picker.style.setProperty(property,value,'important');
    for(const child of picker.children)if(!child.classList.contains('ball')&&!child.classList.contains('selmenu'))child.style.setProperty('display','none','important');
    const ball=document.getElementById('ballLang').parentElement;
    for(const [property,value] of Object.entries({display:'grid','place-items':'center',position:'static',width:'64px',height:'50px',margin:'0 auto'}))ball.style.setProperty(property,value,'important');
    for(const [property,value] of Object.entries({display:'block',position:'static',width:'100%','max-width':'none','max-height':'none',overflow:'visible',opacity:'1',transform:'none'}))menu.style.setProperty(property,value,'important');
    const list=document.getElementById('lEN').parentElement;
    for(const [property,value] of Object.entries({display:'flex','flex-direction':'row','flex-wrap':'wrap',gap:'12px',padding:'8px',width:'100%','justify-content':'center'}))list.style.setProperty(property,value,'important');
    for(const button of list.querySelectorAll('.lang')){
      if(!['lEN','lAR','lDE'].includes(button.id)){button.style.setProperty('display','none','important');continue;}
      for(const [property,value] of Object.entries({display:'flex',position:'static',flex:'0 0 180px',width:'180px',height:'52px','min-height':'52px','max-height':'52px',margin:'0'}))button.style.setProperty(property,value,'important');
    }
    const veil=document.getElementById('ctrlVeil');if(veil)veil.style.setProperty('display','none','important');
    for(const name of ['lsSet','updatePinyinBtn','applyVoiceUI','buildLevels','setMode','closeLangSel'])window[name]=()=>{};
    window.__badgeSetLang=(new Function('return ('+rawSetLang+')'))();
    return existing;
  },{rawSetLang,menuB});
}
const selected=async(page,code)=>{
  await page.evaluate(code=>window.__badgeSetLang(code,document.getElementById(({ar:'lAR',de:'lDE',en:'lEN'})[code])),code);
  if(code==='ar')await page.waitForFunction(()=>getComputedStyle(document.getElementById('ballLang')).backgroundColor==='rgb(11, 110, 79)');
  return page.locator('#ballLang').evaluate(node=>{const s=getComputedStyle(node),p=getComputedStyle(node,'::after');return{text:node.textContent,classes:node.className,background:s.backgroundColor,image:s.backgroundImage,color:s.color,pseudo:p.content,pseudoColor:p.color,width:node.getBoundingClientRect().width,height:node.getBoundingClientRect().height,display:s.display,inline:node.getAttribute('style'),backgroundRules:Array.from(document.styleSheets).flatMap(sheet=>{try{return Array.from(sheet.cssRules);}catch{return[];}}).filter(rule=>rule.selectorText&&node.matches(rule.selectorText)&&(rule.style.background||rule.style.backgroundColor||rule.style.backgroundImage)).map(rule=>({selector:rule.selectorText,css:rule.style.cssText})),ancestors:Array.from((function*(n){while(n&&n!==document.body){yield n;n=n.parentElement;}})(node.parentElement)).map(n=>({id:n.id,cls:n.className,display:getComputedStyle(n).display,visibility:getComputedStyle(n).visibility}))};});
};
async function capture(page,name){const filename=path.join(OUTPUT,name+'.png');await page.screenshot({path:filename});report.screenshots.push(filename);}

test('classic badge uses the neutral Arabic letter and resets correctly to US English',async()=>{
  const f=await fixture();try{
    assert.deepEqual(await prepare(f.page,false),{arabic:false,german:false});
    const ar=await selected(f.page,'ar');assert.equal(ar.text,'ع');assert.match(ar.classes,/\bfl-ar\b/);assert.equal(ar.background,'rgb(11, 110, 79)',JSON.stringify(ar));assert.equal(ar.color,'rgb(255, 255, 255)');assert.ok(ar.width>=25&&ar.height>=21,JSON.stringify(ar));
    const swatch=await f.page.locator('#lAR .fl').evaluate(n=>({text:n.textContent,color:getComputedStyle(n).color,bg:getComputedStyle(n).backgroundColor}));
    assert.deepEqual(swatch,{text:'ع',color:'rgb(255, 255, 255)',bg:'rgb(11, 110, 79)'});await capture(f.page,'classic-arabic-fixture');
    const en=await selected(f.page,'en');assert.equal(en.text,'🇺🇸');assert.equal(en.classes,'pgl');
    assert.equal(await f.page.locator('#lEN .fl').textContent(),'🇺🇸');await capture(f.page,'classic-us-english');
    report.cases.push({name:'classic-arabic-dom-fixture-and-real-english',ar,en});
  }finally{await f.context.close();}
});

test('menu B badges use Arabic pseudo lettering, German colours and an actual US SVG',async()=>{
  const f=await fixture();try{
    assert.deepEqual(await prepare(f.page,true),{arabic:false,german:false});
    const decorated=await f.page.locator('#lAR .fl').evaluate(n=>({text:n.textContent,classes:n.className,pseudo:getComputedStyle(n,'::after').content,width:n.getBoundingClientRect().width,height:n.getBoundingClientRect().height}));
    assert.equal(decorated.text,'');assert.match(decorated.classes,/menu-b-flag flag-ar/);assert.equal(decorated.pseudo,'"ع"');assert.ok(decorated.width>=29&&decorated.height>=19);
    const ar=await selected(f.page,'ar');assert.equal(ar.text,'');assert.match(ar.classes,/menu-b-flag flag-ar/);assert.equal(ar.background,'rgb(11, 110, 79)',JSON.stringify(ar));assert.equal(ar.pseudo,'"ع"');assert.equal(ar.pseudoColor,'rgb(255, 255, 255)');assert.ok(ar.width>=30&&ar.height>=20,JSON.stringify(ar));await capture(f.page,'menu-b-arabic-fixture');
    const de=await selected(f.page,'de');assert.equal(de.text,'');assert.match(de.image,/rgb\(17, 17, 17\).*rgb\(221, 0, 0\).*rgb\(255, 206, 0\)/);
    const en=await selected(f.page,'en');assert.equal(en.text,'');assert.match(en.classes,/menu-b-flag flag-en/);
    const svg=decodeURIComponent(en.image);assert.ok(svg.includes('#B22234')&&svg.includes('#3C3B6E'));assert.equal((svg.match(/<use /g)||[]).length,50,'US flag has fifty white stars');
    assert.ok(!en.classes.includes('fl-ar')&&!en.classes.includes('flag-ar'));await capture(f.page,'menu-b-us-english');
    report.cases.push({name:'menu-b-neutral-arabic-and-german-dom-fixtures-real-english',decorated,ar,de,en});
  }finally{await f.context.close();}
});

test('modern lesson shows the US badge while its reviewed manifest still contains UK metadata',async()=>{
  const f=await fixture('/parcours-niveaux.html?pair=fr-en&level=1');try{
    await f.page.waitForFunction(()=>window.MelungaMockup?.state().screen==='themes');
    const flags=await f.page.locator('[data-language="en"]').allTextContents();assert.ok(flags.length>0);assert.ok(flags.every(text=>text.trim()==='🇺🇸'));
    const reviewed=JSON.parse(fs.readFileSync(path.join(WEB,'content/niveaux-progressifs/manifest.json'),'utf8'));
    assert.ok(reviewed.pairs.some(pair=>pair.id==='fr-en'&&pair.flag==='🇬🇧'),'historical reviewed metadata is retained');
    await capture(f.page,'modern-us-english');report.cases.push({name:'modern-visible-us-with-unchanged-reviewed-uk-metadata',flags});
  }finally{await f.context.close();}
});
