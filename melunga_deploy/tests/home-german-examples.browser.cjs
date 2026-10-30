/* Homepage German example acceptance. All requests and audio are local fixtures. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {test, before, after} = require('node:test');
const {chromium} = require('playwright-core');

const ROOT = path.resolve(__dirname, '../..');
const WEB = path.join(ROOT, 'melunga_deploy');
const ORIGIN = 'https://home-german-examples.test';
const OUT = process.env.HOME_GERMAN_REPORT_DIR || '/workspace/work/home-german-examples';
const NAMES = {fr:'Allemand', en:'German', es:'Alemán', it:'Tedesco', zh:'德语', ja:'ドイツ語', ko:'독일어', de:'Deutsch'};
const SOURCE = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/maquette-guidee/imports/de-deck-v3.1.json')));
const GERMAN = SOURCE[278];
const report = {status:'running', allRequestsLocal:true, realAudioPlayed:false,
  providerCalled:false, physicalDeviceTested:false, cases:[], errors:[], unexpected:[], screenshots:[]};
let browser, frozen;
const fingerprint = () => Object.fromEntries(['index.html','desktop-home.js','voice-selection.js','lesson-audio.js'].map(file =>
  [file, crypto.createHash('sha256').update(fs.readFileSync(path.join(WEB,file))).digest('hex')]));

function catalogue() {
  const now=Date.now(), codes={fr:['fr-FR','F','Aoede'],en:['en-US','C','Kore'],es:['es-ES','F','Kore'],
    it:['it-IT','E','Charon'],zh:['cmn-CN','A','Kore'],ja:['ja-JP','B','Kore'],ko:['ko-KR','A','Kore'],de:['de-DE','A','Kore']};
  return {version:1, source:'google-voices-list', previewOnly:true, selectionVersion:'kartech-2026-10-30-en-us',
    verifiedAt:new Date(now-1000).toISOString(), expiresAt:new Date(now+240000).toISOString(),
    languages:Object.fromEntries(Object.entries(codes).map(([language,[languageCode,wave,approved]]) => {
      const chirp=[['Aoede','FEMALE'],['Kore','FEMALE'],['Charon','MALE']].map(([name,gender]) =>
        ({name:languageCode+'-Chirp3-HD-'+name, languageCode, gender, engine:'chirp3', rateMode:'client'}));
      return [language, {language, available:true, chirp, defaultVoice:chirp.find(v=>v.name.endsWith('-'+approved)),
        waveNet:{name:languageCode+'-Wavenet-'+wave, languageCode, gender:'FEMALE', engine:'wavenet', rateMode:'server'}}];
    }))};
}

before(async () => {
  frozen=fingerprint();fs.mkdirSync(OUT,{recursive:true});
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
});
after(async () => {
  await browser?.close();report.inputsStable=JSON.stringify(frozen)===JSON.stringify(fingerprint());
  report.inputSha256=frozen;report.status=!report.errors.length&&!report.unexpected.length&&report.inputsStable?'passed':'failed';
  fs.writeFileSync(path.join(OUT,'acceptance.json'),JSON.stringify(report,null,2)+'\n');
  assert.deepEqual(report.errors,[]);assert.deepEqual(report.unexpected,[]);assert.equal(report.inputsStable,true);
});

async function fixture(locale='fr',width=1366,height=900) {
  const context=await browser.newContext({viewport:{width,height},isMobile:width<960,hasTouch:width<960,
    reducedMotion:'reduce',serviceWorkers:'block'});
  await context.addInitScript(locale => {
    localStorage.setItem('melunga-app-language',JSON.stringify({locale,label:locale}));
    const media=window.__homeExampleMedia={plays:[],speech:[]};
    window.Audio=class extends EventTarget {
      constructor(src){super();this.src=src||'';this.paused=true;this.currentTime=0;this.playbackRate=1;}
      play(){this.paused=false;media.plays.push({src:this.src,rate:this.playbackRate});queueMicrotask(()=>{
        if(!this.paused){this.onplaying?.(new Event('playing'));this.dispatchEvent(new Event('playing'));}
      });return Promise.resolve();}
      pause(){this.paused=true;}load(){}removeAttribute(n){if(n==='src')this.src='';}
    };
    window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};
    Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},getVoices(){return[];},
      speak(u){media.speech.push({text:u.text,lang:u.lang});},addEventListener(){},removeEventListener(){}}});
  },locale);
  const requests=[];
  await context.route('**/*',async route => {
    const req=route.request(),u=new URL(req.url());
    if(u.origin!==ORIGIN){
      if(!/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname))report.unexpected.push(req.url());
      return route.abort();
    }
    if(req.method()!=='GET'){report.unexpected.push(req.method()+' '+u.pathname);return route.abort();}
    if(u.pathname==='/.netlify/functions/tts'&&u.searchParams.get('catalog')==='chirp3'){
      assert.equal(u.searchParams.get('selectionVersion'),'kartech-2026-10-30-en-us');requests.push('catalogue');
      return route.fulfill({json:catalogue()});
    }
    if(u.pathname==='/.netlify/functions/get-pricing')return route.fulfill({json:{country:'FR',monthlyDisplay:'7,90 €',annualDisplay:'42 €'}});
    if(u.pathname==='/api/geolocation')return route.fulfill({json:{country:'FR'}});
    if(/^\/(?:\.netlify|api)\//.test(u.pathname)){report.unexpected.push(u.pathname);return route.abort();}
    const file=path.resolve(WEB,'.'+(u.pathname==='/'?'/index.html':u.pathname));
    if(!file.startsWith(WEB+path.sep)||!fs.existsSync(file)){report.unexpected.push(u.pathname);return route.fulfill({status:404,body:'not found'});}
    return route.fulfill({body:fs.readFileSync(file),contentType:{'.html':'text/html','.js':'text/javascript',
      '.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'}[path.extname(file)]||'application/octet-stream'});
  });
  const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  await page.goto(ORIGIN+'/index.html?country=FR');
  await page.locator(width>=960?'.desktop-home':'[data-screen="welcome"].active').waitFor({state:'visible'});
  return {page,context,requests};
}

test('Twelve homepage examples follow the requested order in all eight site languages and German keeps its exact source card',async () => {
  assert.equal(GERMAN.t,'Können Sie mir helfen?');
  for(const locale of Object.keys(NAMES)){
    const f=await fixture(locale);try{
      const p=f.page;assert.deepEqual(await p.locator('[data-dh-example]').evaluateAll(ns=>ns.map(n=>n.dataset.dhExample)),["en","zh","ar","hi","ru","fr","es","pt","ja","ko","de","it"]);
      const originalNote=await p.locator('.dh-example-note').textContent();
      for (const code of ['en','zh','ar','hi','ru','fr','es','pt','ja','ko','de','it']) {
        await p.locator('[data-dh-example="'+code+'"]').click();
        assert.equal(await p.locator('.dh-phrase').getAttribute('lang'),code);
        assert.ok((await p.locator('.dh-phrase').textContent()).trim());
        assert.equal(await p.locator('.dh-phonetic-area').isVisible(),code!=='fr');
      }
      await p.locator('[data-dh-example="fr"]').click();
      assert.equal(await p.locator('.dh-phrase').textContent(),'Merci.');
      await p.locator('[data-dh-example="en"]').click();
      assert.equal(await p.locator('.dh-example-note').textContent(),originalNote);
      assert.equal(await p.locator('[data-dh-example-name="de"]').textContent(),NAMES[locale]);
      assert.equal(await p.locator('.dh-language option[value="de"]').count(),1,'German remains available as the published site locale');
      assert.equal(await p.locator('.dh-languages .home-flag-de').count(),1);
      assert.deepEqual(f.requests,['catalogue'],'shared voice module preloads without playing audio');
      await p.locator('[data-dh-example="de"]').click();await p.waitForFunction(()=>window.MelungaVoiceSelection.state().status==='ready');
      assert.equal(await p.locator('.dh-phrase').textContent(),GERMAN.t);assert.equal(await p.locator('.dh-phrase').getAttribute('lang'),'de');
      assert.equal(await p.locator('.dh-phonetic').textContent(),GERMAN.pf);assert.equal(await p.locator('.dh-translation').textContent(),GERMAN.frm);
      assert.equal(await p.locator('[data-dh-example="de"]').getAttribute('aria-pressed'),'true');
      assert.deepEqual(await p.evaluate(()=>window.__homeExampleMedia.plays),[],'selection never autoplays');
      const flag=p.locator('[data-dh-example="de"] .home-flag-de');
      assert.match(await flag.evaluate(n=>getComputedStyle(n).backgroundImage),/linear-gradient/);
      const bounds=await p.locator('[data-dh-example="de"]').boundingBox();assert.ok(bounds.height>=44&&bounds.x>=0&&bounds.x+bounds.width<=1366);
      await p.locator('.dh-listen').click();const media=await p.evaluate(()=>window.__homeExampleMedia);
      assert.equal(media.plays.length,1);const audio=new URL(media.plays[0].src,ORIGIN);
      assert.equal(audio.pathname,'/.netlify/functions/tts');assert.equal(audio.searchParams.get('text'),GERMAN.t);
      assert.equal(audio.searchParams.get('voice'),'de-DE-Chirp3-HD-Kore');assert.equal(audio.searchParams.get('lang'),'de-DE');
      assert.equal(audio.searchParams.get('rate'),'1');assert.equal(media.plays[0].rate,0.85);assert.deepEqual(media.speech,[]);
      if(locale==='fr'){const shot=path.join(OUT,'desktop-german-example.png');await p.screenshot({path:shot,animations:'disabled'});report.screenshots.push(shot);}
      report.cases.push({name:'desktop-german-example',locale,exactSourceIndex:278,sharedChirpAudio:true});
    }finally{await f.context.close();}
  }
});

test('the three existing example cards and audio destinations remain unchanged',async () => {
  const original={en:['Can you help me?','kan you HÈLP mi','Tu peux m’aider ?','en-US-Wavenet-C'],
    es:['Necesito ayuda.','né-sé-SSI-to a-YOU-da','J’ai besoin d’aide.','es-ES-Wavenet-F'],
    zh:['你能帮我吗？','ni neung bang ouo ma ?','Tu peux m’aider ?','cmn-CN-Wavenet-A']};
  const f=await fixture();try{
    for(const [language,[text,phon,meaning,voice]] of Object.entries(original)){
      await f.page.locator('[data-dh-example="'+language+'"]').click();
      assert.equal(await f.page.locator('.dh-phrase').textContent(),text);assert.equal(await f.page.locator('.dh-phonetic').textContent(),phon);
      assert.equal(await f.page.locator('.dh-translation').textContent(),meaning);await f.page.locator('.dh-listen').click();
      const played=await f.page.evaluate(()=>window.__homeExampleMedia.plays.at(-1));const url=new URL(played.src,ORIGIN);
      assert.equal(url.searchParams.get('voice'),voice);assert.equal(url.searchParams.get('text'),text);
    }
    assert.deepEqual(f.requests,['catalogue']);report.cases.push({name:'three-existing-examples-conserved'});
  }finally{await f.context.close();}
});

test('mobile welcome keeps bubbles, green example and the existing single-English method demonstration',async () => {
  const f=await fixture('fr',390,844);try{
    const p=f.page;assert.equal(await p.locator('[data-screen="welcome"] .site-bubble').count(),11);
    assert.equal(await p.locator('[data-screen="welcome"] .hc-example').isVisible(),true);
    await p.locator('[data-screen="welcome"] .hc-example').click();await p.locator('[data-screen="method"].active').waitFor();
    assert.equal(await p.locator('.target-demo').textContent(),'I would like some water.');
    assert.equal(await p.locator('.proof-slide').count(),5);assert.deepEqual(f.requests,['catalogue']);
    assert.deepEqual(await p.evaluate(()=>window.__homeExampleMedia.plays),[]);
    assert.equal(await p.locator('[data-language-choice="Allemand"]').count(),1);
    const legacy=await p.evaluate(()=>{applyLanguageSample('Allemand');return{phrase:document.querySelector('[data-target-phrase]').textContent,
      phon:document.querySelector('[data-phonetic-text]').textContent,meaning:document.querySelector('[data-translated-phrase]').textContent};});
    assert.deepEqual(legacy,{phrase:GERMAN.t,phon:GERMAN.pf,meaning:GERMAN.frm});
    await p.evaluate(()=>go('language'));
    await p.locator('[data-screen="language"].active').waitFor();
    const order=['en','zh','ar','hi','ru','fr','es','pt','ja','ko','de','it'];
    assert.deepEqual(await p.locator('[data-study-language]').evaluateAll(ns=>ns.map(n=>n.dataset.studyLanguage)),order);
    assert.deepEqual(await p.locator('[data-study-language]:visible').evaluateAll(ns=>ns.map(n=>n.dataset.studyLanguage)),order.filter(c=>c!=='fr'));
    const shot=path.join(OUT,'mobile-language-order.png');await p.screenshot({path:shot,animations:'disabled'});report.screenshots.push(shot);
    report.cases.push({name:'mobile-presentation-preserved',width:390,height:844});
  }finally{await f.context.close();}
});
