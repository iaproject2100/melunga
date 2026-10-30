/* Homepage's seven examples: immutable reviewed cards, actual selectors, and local audio fixtures. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const {execFileSync}=require('node:child_process'),{test,before,after}=require('node:test'),{chromium}=require('playwright-core');
const ROOT=path.resolve(__dirname,'../..'),WEB=path.join(ROOT,'melunga_deploy'),BASE='b0fcb96',ORIGIN='https://home-all-examples.test';
const OUT=process.env.HOME_ALL_EXAMPLES_REPORT_DIR||'/workspace/work/home-all-examples-2026-10-30';
const CODES=['en','es','zh','de','it','ja','ko'],LOCALES=['fr','en','de','es','zh','it','ja','ko'];
const NEW={it:{index:13,voice:'it-IT-Wavenet-E',code:'it-IT',sourceSha256:'2372cbd22ac7fc264a8f31e26ba615053e34d4ab5a206da0cca82f86f73e67be'},ja:{index:18,voice:'ja-JP-Wavenet-B',code:'ja-JP',sourceSha256:'cab80b7457c6b5d986900162ecd17d3bf9846c34785aa55e627beb910035dcab'},ko:{index:11,voice:'ko-KR-Wavenet-A',code:'ko-KR',sourceSha256:'d90584cf36921a6d7996ce6297c95d901b23512ccbfe6d6da5068abea0673b0a'}};
const read=file=>fs.readFileSync(path.join(WEB,file)),json=file=>JSON.parse(read(file)),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const original=execFileSync('git',['show',BASE+':melunga_deploy/desktop-home.js'],{cwd:ROOT,encoding:'utf8'}),current=read('desktop-home.js').toString();
function expression(source,name){const marker='const '+name+' = ',start=source.indexOf(marker);assert(start>=0);return vm.runInNewContext('('+source.slice(start+marker.length,source.indexOf('\n  };',start)+4)+')');}
const samples=expression(current,'samples'),names=expression(current,'exampleNames');
const report={status:'running',baseCommit:BASE,providerCalled:false,realAudioPlayed:false,allResponsesLocal:true,cases:[],errors:[],unexpected:[],sources:{},screenshots:[]};
let browser,initial;
const fingerprint=()=>Object.fromEntries(['desktop-home.js','desktop-home.css','index.html','lesson-audio.js','voice-selection.js',...Object.keys(NEW).flatMap(code=>['content/native-catalogue/'+code+'.json','content/niveaux-progressifs/fr-'+code+'/L1.json'])].map(file=>[file,hash(read(file))]));
before(async()=>{fs.mkdirSync(OUT,{recursive:true});initial=fingerprint();browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});});
after(async()=>{await browser?.close();report.inputsStable=JSON.stringify(initial)===JSON.stringify(fingerprint());report.inputSha256=initial;report.status=!report.errors.length&&!report.unexpected.length&&report.inputsStable&&report.cases.length===3?'passed':'failed';fs.writeFileSync(path.join(OUT,'acceptance.json'),JSON.stringify(report,null,2)+'\n');assert.equal(report.inputsStable,true);assert.deepEqual(report.errors,[]);assert.deepEqual(report.unexpected,[]);assert.equal(report.cases.length,3);});
async function checked(name,fn){try{await fn();report.cases.push(name);}catch(error){report.errors.push(name+': '+error.message);throw error;}}
function catalogue(){const now=Date.now();return{version:1,source:'google-voices-list',previewOnly:true,selectionVersion:'kartech-2026-10-30-de',verifiedAt:new Date(now-1000).toISOString(),expiresAt:new Date(now+240000).toISOString(),languages:{de:{language:'de',available:true,chirp:[{name:'de-DE-Chirp3-HD-Kore',languageCode:'de-DE',gender:'FEMALE',engine:'chirp3',rateMode:'client'}],defaultVoice:{name:'de-DE-Chirp3-HD-Kore',languageCode:'de-DE',gender:'FEMALE',engine:'chirp3',rateMode:'client'},waveNet:{name:'de-DE-Wavenet-A',languageCode:'de-DE',gender:'FEMALE',engine:'wavenet',rateMode:'server'}}}};}
async function fixture(locale='fr',width=1366){const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce',serviceWorkers:'block'}),requests=[];
 await context.addInitScript(locale=>{localStorage.setItem('melunga-app-language',JSON.stringify({locale}));window.__exampleMedia={plays:[],speech:[]};window.Audio=class extends EventTarget{constructor(src){super();this.src=src||'';this.paused=true;this.currentTime=0;this.playbackRate=1;}async play(){this.paused=false;window.__exampleMedia.plays.push({src:this.src,rate:this.playbackRate});const response=await fetch(this.src);if(!response.ok)throw Error('Local audio fixture failed');if(!this.paused){this.onplaying?.(new Event('playing'));this.dispatchEvent(new Event('playing'));}}pause(){this.paused=true;}load(){}removeAttribute(name){if(name==='src')this.src='';}};window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},getVoices(){return[];},addEventListener(){},removeEventListener(){},speak(u){window.__exampleMedia.speech.push({text:u.text,lang:u.lang});}}});},locale);
 await context.route('**/*',async route=>{const req=route.request(),u=new URL(req.url());
  if(u.origin!==ORIGIN){if(!/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname))report.unexpected.push(u.href);return route.abort();}
  assert.equal(req.method(),'GET');
  if(u.pathname==='/.netlify/functions/tts'&&u.searchParams.get('catalog')==='chirp3')return route.fulfill({json:catalogue()});
  if(u.pathname==='/.netlify/functions/tts'){requests.push(Object.fromEntries(u.searchParams));return route.fulfill({contentType:'audio/wav',body:Buffer.from('RIFF0000WAVEfmt ')});}
  if(u.pathname==='/api/geolocation')return route.fulfill({json:{country:'FR'}});
  if(u.pathname==='/.netlify/functions/get-pricing')return route.fulfill({json:{country:'FR',monthlyDisplay:'7,90 €',annualDisplay:'42 €'}});
  if(/^\/(?:\.netlify|api)\//.test(u.pathname)){report.unexpected.push(u.pathname);return route.abort();}
  const file=path.resolve(WEB,'.'+u.pathname);if(!file.startsWith(WEB+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){report.unexpected.push(u.pathname);return route.fulfill({status:404,body:'Not found'});}
  return route.fulfill({body:fs.readFileSync(file),contentType:{'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'}[path.extname(file)]||'application/octet-stream'});
 });
 const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));await page.goto(ORIGIN+'/index.html?country=FR');await page.locator('.desktop-home').waitFor();return{page,context,requests};
}

test('new examples copy complete reviewed source fields and preserve existing samples, audio handlers and CSS apart from the approved English badge',()=>checked('reviewed-source-and-existing-behavior',async()=>{
 const previous=expression(original,'samples');for(const code of ['en','es','zh','de'])assert.equal(JSON.stringify(samples[code]),JSON.stringify(previous[code]),code+' existing sample unchanged');
 assert.equal(samples.en.voice,'en-GB-Wavenet-C');assert.equal(samples.en.code,'en-GB');
 assert.equal(current.slice(current.indexOf("  let example = 'en'")),original.slice(original.indexOf("  let example = 'en'")),'existing renderer and audio handler remain byte exact');
 const oldCss=execFileSync('git',['show',BASE+':melunga_deploy/desktop-home.css'],{cwd:ROOT,encoding:'utf8'}),currentCss=read('desktop-home.css').toString();
 const englishFlagRule=/\.home-flag-en \{\n  background-image: url\("(data:image\/svg\+xml,[^"]+)"\);\n\}/;
 const oldFlag=oldCss.match(englishFlagRule),currentFlag=currentCss.match(englishFlagRule);assert(oldFlag&&currentFlag,'one bounded English flag background rule');
 assert(decodeURIComponent(oldFlag[1]).includes('#012169'),'historical English flag is UK');
 const usSvg=decodeURIComponent(currentFlag[1]);assert(usSvg.includes('#B22234')&&usSvg.includes('#3C3B6E'),'approved US stripe and canton colours');
 assert.equal((usSvg.match(/<use /g)||[]).length,50,'fifty white US stars');assert.equal((usSvg.match(/M0 /g)||[]).length,7,'seven red stripes alternate with six white stripes');
 assert.equal(currentCss.replace(currentFlag[0],oldFlag[0]),oldCss,'all presentation CSS outside the approved English badge stays byte exact');
 assert.match(read('index.html').toString(),/desktop-home\.js\?v=9/);
 for(const [code,reference]of Object.entries(NEW)){const bankPath='content/native-catalogue/'+code+'.json',reviewedPath='content/niveaux-progressifs/fr-'+code+'/L1.json',bank=json(bankPath),card=bank.cards[reference.index],level=json(reviewedPath),model=[...level.themes,...level.heldThemes].flatMap(theme=>theme.phrases).find(model=>model.id==='catalogue:'+code+':'+reference.index);assert(model);assert.equal(card.lv,1);assert.equal(model.editorialLevel,1);assert.equal(model.source.sourceIndex,reference.index);assert.equal(model.source.sourceSha256,reference.sourceSha256);assert.deepEqual(JSON.parse(JSON.stringify(samples[code])),{text:card.t,phonetic:card.pf,fr:card.frm,voice:reference.voice,code:reference.code});assert.equal(model.study,card.t);assert.equal(model.phon,card.pf);assert.equal(model.native,card.frm);report.sources[code]={id:model.id,bankPath,bankSha256:hash(read(bankPath)),reviewedPath,sourceSha256:reference.sourceSha256,fields:{t:card.t,pf:card.pf,frm:card.frm},voice:reference.voice};}
 for(const locale of LOCALES){assert(names[locale]);for(const code of CODES)assert(typeof names[locale][code]==='string'&&names[locale][code].trim(),locale+' '+code+' label');}
}));

test('seven real example buttons stay visible without overflow and display exact phrase, phonetics and translation in all eight site locales',()=>checked('seven-selectors-eight-locales-and-two-widths',async()=>{
 for(const width of [1366,1827])for(const locale of LOCALES){const f=await fixture(locale,width);try{const p=f.page;assert.equal(await p.locator('html').getAttribute('lang'),locale);assert.deepEqual(await p.locator('[data-dh-example]').evaluateAll(ns=>ns.map(n=>n.dataset.dhExample)),CODES);
  for(const code of CODES){const button=p.locator('[data-dh-example="'+code+'"]');assert.equal(await button.isVisible(),true);assert.equal(await button.locator('[data-dh-example-name]').textContent(),names[locale][code]);const box=await button.boundingBox();assert(box.x>=0&&box.y>=0&&box.x+box.width<=width&&box.y+box.height<=1000&&box.height>=44,'example tab fully visible '+locale+' '+code);await button.click();assert.equal(await p.locator('.dh-phrase').textContent(),samples[code].text);assert.equal(await p.locator('.dh-phrase').getAttribute('lang'),code);assert.equal(await p.locator('.dh-phonetic').textContent(),samples[code].phonetic);assert.equal(await p.locator('.dh-translation').textContent(),samples[code].fr);assert.equal(await button.getAttribute('aria-pressed'),'true');}
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'no horizontal overflow');assert.deepEqual(await p.evaluate(()=>window.__exampleMedia.plays),[],'tab selection never starts audio');
  if(locale==='fr'){const file=path.join(OUT,'seven-examples-'+width+'.png');await p.screenshot({path:file,animations:'disabled'});report.screenshots.push(file);}
 }finally{await f.context.close();}}
}));

test('Italian, Japanese and Korean listen actions use their authorized existing WaveNet routes with entirely mocked audio requests',()=>checked('three-new-local-audio-requests',async()=>{
 const f=await fixture();try{for(const code of ['it','ja','ko']){await f.page.locator('[data-dh-example="'+code+'"]').click();await f.page.locator('.dh-listen').click();await f.page.waitForFunction(count=>window.__exampleMedia.plays.length===count,f.requests.length||1);}
  assert.equal(f.requests.length,3);assert.deepEqual(f.requests,['it','ja','ko'].map(code=>({voice:NEW[code].voice,lang:NEW[code].code,text:samples[code].text})));assert.deepEqual(await f.page.evaluate(()=>window.__exampleMedia.speech),[]);report.mockedAudioRequests=f.requests;
 }finally{await f.context.close();}
}));
