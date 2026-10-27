/* Server-first lesson speech acceptance. Local Chromium, including Android UA
 * and touch/viewport emulation. Audio and browser voices are fixtures; no sound,
 * public site, real account, external TTS request, login or server write. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');
const {test, before, after} = require('node:test');
const {chromium} = require('playwright-core');

const REPO = path.resolve(__dirname, '../..');
const WEB = path.join(REPO, 'melunga_deploy');
const BASE = 'ef147deacf85b4a5631c1b05ff8050de7918ea1f';
const ORIGIN = 'https://lesson-server-audio.test';
const ANDROID = 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36';
const PAIRS = ['fr-en','fr-es','fr-it','fr-zh','fr-ja','fr-ko','zh-fr'];
const EXPECTED = {
  en: {female:'en-GB-Wavenet-C', male:'en-GB-Wavenet-D', lang:'en-GB'},
  es: {female:'es-ES-Wavenet-F', male:'es-ES-Wavenet-E', lang:'es-ES'},
  it: {female:'it-IT-Wavenet-E', male:'it-IT-Wavenet-F', lang:'it-IT'},
  zh: {female:'cmn-CN-Wavenet-A', male:'cmn-CN-Wavenet-B', lang:'cmn-CN'},
  ja: {female:'ja-JP-Wavenet-B', male:'ja-JP-Wavenet-C', lang:'ja-JP'},
  ko: {female:'ko-KR-Wavenet-A', male:'ko-KR-Wavenet-C', lang:'ko-KR'},
  fr: {female:'fr-FR-Wavenet-F', male:'fr-FR-Wavenet-G', lang:'fr-FR'}
};
const raw = file => fs.readFileSync(path.join(WEB, file));
const json = file => JSON.parse(raw(file));
const manifest = json('content/niveaux-progressifs/manifest.json');
const runtimeFiles = ['content/niveaux-progressifs/manifest.json', ...manifest.pairs.flatMap(pair => [pair.repertoirePath, ...pair.levels.map(level => level.dataPath)])];
const protectedFiles = ['app.html','index.html','desktop-home.js','maquette-guidee.css','course-access.js','content/course-access.json','store-billing.js','account-ui.js','account-ui.css','melunga-logo.png','assets/melunga-logo.png', ...fs.readdirSync(path.join(WEB, 'netlify/functions')).filter(file => file.endsWith('.mjs')).map(file => 'netlify/functions/'+file)];
const productFiles = ['lesson-audio.js','maquette-guidee.js','maquette-guidee.html','parcours-niveaux.html'];
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const fingerprint = () => Object.fromEntries([__filename, ...runtimeFiles.concat(protectedFiles, productFiles).map(file => path.join(WEB, file))].sort().map(file => [path.relative(REPO, file), sha(fs.readFileSync(file))]));
const report = {status:'running', baseCommit:BASE, environment:'local Chromium; Android user agent/touch/viewport emulation only', publicSiteChecked:false, physicalAndroidChecked:false, realAccountsUsed:false, actualAudioPlayed:false, serverWrites:false, externalTtsCalls:false, audioInstrumentation:'Audio sources/playback/events and speech voices are captured in memory; no audio media is fetched or decoded', checks:[], cases:[], errors:[], unexpectedRequests:[], mockedStatusGets:0, screenshots:[]};
const required = ['source-conservation','seven-server-voices','server-choice-and-speed','strict-browser-fallback','replacement-and-navigation','recall-reveal-and-controls'];
let browser, inputs;
const checked = async (name, fn) => {try {await fn(); report.checks.push(name);} catch (error) {report.errors.push(name+': '+error.message); throw error;}};
before(async () => {inputs = fingerprint(); browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium', args:['--no-sandbox']});});
after(async () => {
  await browser?.close();
  report.inputsStable = JSON.stringify(inputs) === JSON.stringify(fingerprint());
  report.inputSha256 = inputs;
  report.missingChecks = required.filter(name => !report.checks.includes(name));
  report.status = report.inputsStable && !report.errors.length && !report.unexpectedRequests.length && !report.missingChecks.length ? 'passed' : 'failed';
  if (process.env.LESSON_SERVER_AUDIO_REPORT) fs.writeFileSync(process.env.LESSON_SERVER_AUDIO_REPORT, JSON.stringify(report,null,2)+'\n');
  assert.equal(report.inputsStable, true, 'reviewed inputs remain frozen');
  assert.deepEqual(report.errors, []);
  assert.deepEqual(report.unexpectedRequests, []);
  assert.deepEqual(report.missingChecks, []);
});

async function fixture({pair='fr-es', width=390, height=700, android=true, voices=[]}={}) {
  const context = await browser.newContext({viewport:{width,height}, userAgent:android?ANDROID:undefined, isMobile:width<=760, hasTouch:width<=760, reducedMotion:'reduce', serviceWorkers:'block'});
  await context.addInitScript(({voices}) => {
    localStorage.setItem('ox_device','lesson-server-audio-fixture');
    window.__qaAudio = [];
    window.__qaAudioPlays = [];
    window.__qaSpeech = [];
    window.__qaUtterances = [];
    window.__qaVoices = voices;
    window.__qaSpeechCancels = 0;
    const types = ['playing','ended','error','waiting','stalled','abort'];
    class FixtureAudio extends EventTarget {
      constructor(src) {
        super();
        this.id = window.__qaAudio.length;
        this._src = '';
        this.playbackRate = 1;
        this.volume = 1;
        this.pauses = 0;
        this.loads = 0;
        this.plays = 0;
        this.listenerCopies = new Map();
        this.saved = null;
        window.__qaAudio.push(this);
        if (src !== undefined) this.src = src;
      }
      get src() {return this._src;}
      set src(value) {this._src = String(value);}
      addEventListener(type, listener, options) {
        const list = this.listenerCopies.get(type) || [];
        list.push(listener); this.listenerCopies.set(type,list);
        super.addEventListener(type,listener,options);
      }
      removeEventListener(type,listener,options) {
        this.listenerCopies.set(type,(this.listenerCopies.get(type)||[]).filter(item=>item!==listener));
        super.removeEventListener(type,listener,options);
      }
      play() {
        this.plays++;
        this.saved = Object.fromEntries(types.map(type => [type, [this['on'+type], ...(this.listenerCopies.get(type)||[])].filter(fn=>typeof fn==='function')]));
        window.__qaAudioPlays.push({id:this.id,src:this.src,playbackRate:this.playbackRate});
        return new Promise((resolve,reject) => {this.resolvePlay=resolve;this.rejectPlay=reject;});
      }
      pause() {this.pauses++;}
      load() {this.loads++;}
      setAttribute(name,value) {if(name==='src')this.src=value;}
      removeAttribute(name) {if(name==='src')this._src='';}
      emit(type) {const event=new Event(type);this.dispatchEvent(event);if(typeof this['on'+type]==='function')this['on'+type](event);if(type==='playing')this.resolvePlay?.();}
      stale(type) {for(const listener of this.saved?.[type]||[]) listener.call(this,new Event(type));}
    }
    window.Audio = FixtureAudio;
    window.SpeechSynthesisUtterance = class {constructor(text){this.text=text;}};
    Object.defineProperty(window,'speechSynthesis',{value:{
      getVoices(){return window.__qaVoices;},
      cancel(){window.__qaSpeechCancels++;},
      addEventListener(){},
      speak(u){window.__qaUtterances.push(u);window.__qaSpeech.push({text:u.text,lang:u.lang,rate:u.rate,voice:u.voice?{voiceURI:u.voice.voiceURI,name:u.voice.name,lang:u.voice.lang}:null});}
    }});
  }, {voices});
  await context.route('**/*', async route => {
    const req=route.request(),url=new URL(req.url());
    if(url.origin!==ORIGIN){report.unexpectedRequests.push({origin:url.origin,path:url.pathname,method:req.method()});return route.abort();}
    if(url.pathname==='/.netlify/functions/check-status'&&req.method()==='GET'){report.mockedStatusGets++;return route.fulfill({json:{paid:false}});}
    if(req.method()!=='GET'||/^\/(?:\.netlify|api)\//.test(url.pathname)){report.unexpectedRequests.push({path:url.pathname,method:req.method()});return route.abort();}
    const file=path.resolve(WEB,'.'+decodeURIComponent(url.pathname));
    if(!file.startsWith(WEB+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())return route.fulfill({status:404,body:'Not found'});
    return route.fulfill({body:fs.readFileSync(file),contentType:({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream'});
  });
  const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));
  await page.goto(ORIGIN+'/parcours-niveaux.html?pair='+pair+'&level=1');
  await ready(page,pair);
  return {context,page,pair,width,height,android};
}
async function ready(page,pair){await page.waitForFunction(pair=>window.MelungaMockup?.state().screen==='themes'&&window.MelungaMockup.state().pairId===pair,pair);await settled(page);}
async function settled(page){await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));}
async function firstLesson(page){await page.locator('#mgThemeGrid .mg-theme').first().click();await page.waitForFunction(()=>window.MelungaMockup.state().screen==='lesson');await settled(page);}
async function state(page){return page.evaluate(()=>{const s=window.MelungaMockup.state();return{screen:s.screen,pairId:s.pairId,level:s.level,themeId:s.themeId,phraseId:s.phraseId,stepIndex:s.stepIndex,known:localStorage.getItem('melunga-guided-known-v1'),review:localStorage.getItem('melunga-guided-review-v1')};});}
async function audioState(page){return page.evaluate(()=>({plays:window.__qaAudioPlays,audios:window.__qaAudio.map(a=>({id:a.id,src:a.src,plays:a.plays,pauses:a.pauses,loads:a.loads,playbackRate:a.playbackRate})),speech:window.__qaSpeech,cancels:window.__qaSpeechCancels,status:document.getElementById('mgStatus').textContent,controls:['mgEar','mgListen'].map(id=>{const n=document.getElementById(id);return{id,busy:n.getAttribute('aria-busy'),playing:n.classList.contains('is-playing'),visible:!!n.getClientRects().length&&!n.hidden,label:n.getAttribute('aria-label')};})}));}
async function busy(page,value){const current=await audioState(page);for(const c of current.controls){assert.equal(c.busy,value?'true':null,c.id+' synchronized busy');assert.equal(c.playing,value,c.id+' synchronized playing');}return current;}
async function emit(page,id,type,stale=false){await page.evaluate(({id,type,stale})=>window.__qaAudio[id][stale?'stale':'emit'](type),{id,type,stale});await settled(page);}
async function speechEnd(page,index=0,error){await page.evaluate(({index,error})=>{const u=window.__qaUtterances[index];if(error)u.onerror?.({error});else u.onend?.();},{index,error});await settled(page);}
function assertServer(play,study,text,{gender='female',rate=.85}={}){const url=new URL(play.src,ORIGIN),expected=EXPECTED[study];assert.equal(url.origin,ORIGIN);assert.equal(url.pathname,'/.netlify/functions/tts');assert.deepEqual([...url.searchParams.keys()].sort(),['lang','rate','text','voice']);assert.equal(url.searchParams.get('voice'),expected[gender]);assert.equal(url.searchParams.get('lang'),expected.lang);assert.equal(Number(url.searchParams.get('rate')),rate);assert.equal(url.searchParams.get('text'),text);assert.equal(play.playbackRate,1,'server synthesis rate is not applied twice');return{voice:url.searchParams.get('voice'),lang:url.searchParams.get('lang'),rate:Number(url.searchParams.get('rate')),text};}
async function capture(page,name){const dir=process.env.LESSON_SERVER_AUDIO_CAPTURES;if(!dir)return;fs.mkdirSync(dir,{recursive:true});const file=path.join(dir,name+'.png');await page.screenshot({path:file});report.screenshots.push(file);}
async function openVoice(page){if(await page.locator('#mgMenuTrigger').isVisible()){await page.locator('#mgMenuTrigger').click();await page.locator('#mgMenuNav [data-menu-item="voice"]').click();}else await page.locator('#mgDesktopNav [data-menu-item="voice"]').click();await page.locator('#mgVoicePanel').waitFor({state:'visible'});}
async function closeMenu(page){await page.keyboard.press('Escape');await page.locator('#mgMenuDialog').waitFor({state:'hidden'});}
async function assertFits(page){const fit=await page.evaluate(()=>({width:innerWidth,height:innerHeight,documentWidth:document.documentElement.scrollWidth,documentHeight:document.documentElement.scrollHeight,items:['mgPhrase','mgPhon','mgTranslation','mgListen','mgEar','mgFooter'].map(id=>{const n=document.getElementById(id),r=n.getBoundingClientRect();return{id,visible:!!n.getClientRects().length&&!n.hidden,bounds:{left:r.left,right:r.right,top:r.top,bottom:r.bottom}};}),scroll:['mgContent','mgLessonView','mgModel'].map(id=>{const n=document.getElementById(id);return{id,deltaY:n.scrollHeight-n.clientHeight,deltaX:n.scrollWidth-n.clientWidth};})}));assert.ok(fit.documentWidth<=fit.width&&fit.documentHeight<=fit.height);for(const x of fit.items){assert.equal(x.visible,true);assert.ok(x.bounds.left>=-1&&x.bounds.right<=fit.width+1&&x.bounds.top>=-1&&x.bounds.bottom<=fit.height+1,x.id+' visible');}for(const x of fit.scroll){assert.ok(x.deltaY<=1&&x.deltaX<=1,x.id+' needs no scrolling');}return fit;}
function realRecall(pair){const cell=json('content/niveaux-progressifs/'+pair+'/L1.json');for(const theme of cell.themes){const steps=theme.sequences.flatMap(sequence=>sequence.steps),target=steps.findIndex(step=>step.kind==='choose-and-recall'&&step.utterance);if(target>=0)return{theme,index:cell.themes.indexOf(theme),steps,target};}throw Error('No real recall in '+pair);}
async function enterRecall(page,pair){const source=realRecall(pair);await page.locator('#mgThemeGrid .mg-theme').nth(source.index).click();await page.waitForFunction(()=>window.MelungaMockup.state().screen==='lesson');for(let i=0;i<source.target;i++){assert.equal(await page.locator('#mgContinue').isEnabled(),true,'prepared source step advances without a synthetic choice');await page.locator('#mgContinue').click();}await settled(page);assert.equal(await page.evaluate(()=>window.MelungaMockup.state().masked),true);return source;}

test('runtime content, classic application, endpoint, access and billing remain exact',()=>checked('source-conservation',async()=>{
  assert.equal(runtimeFiles.length,78);
  execFileSync('git',['diff','--quiet',BASE,'--',...runtimeFiles.concat(protectedFiles).map(file=>'melunga_deploy/'+file)],{cwd:REPO});
  assert.equal(raw('netlify/functions/tts.mjs').toString(),execFileSync('git',['show',BASE+':melunga_deploy/netlify/functions/tts.mjs'],{cwd:REPO,encoding:'utf8'}));
  for(const html of ['parcours-niveaux.html','maquette-guidee.html']){const text=raw(html).toString();assert.equal((text.match(/<script\b[^>]*src="lesson-audio\.js\?v=\d+"/g)||[]).length,1);assert.ok(text.indexOf('src="lesson-audio.js?')<text.indexOf('src="maquette-guidee.js?'),'player loads before the course controller');}
  report.cases.push({name:'source-conservation',runtimeJson:78,protectedWholeFiles:protectedFiles.length,ttsEndpointUnchanged:true});
}));

test('all seven studied languages use their exact classic female WaveNet voice without installed browser voices',{timeout:60000},()=>checked('seven-server-voices',async()=>{
  for(const pair of PAIRS){const study=pair.split('-')[1],options=pair==='fr-zh'?{width:320,height:700}:pair==='fr-en'?{width:1366,height:768,android:false}:{};const f=await fixture({pair,voices:[],...options});try{const p=f.page;await firstLesson(p);const before=await state(p),text=await p.locator('#mgPhrase').textContent(),phon=await p.locator('#mgPhon').textContent();await p.locator('#mgListen').focus();await p.keyboard.press('Enter');let a=await busy(p,true);assert.equal(a.plays.length,1);assert.equal(a.speech.length,0);const request=assertServer(a.plays[0],study,text);assert.notEqual(request.text,phon);assert.deepEqual(await state(p),before);await emit(p,0,'playing');await busy(p,true);await emit(p,0,'ended');await busy(p,false);
    await p.locator('#mgEar').click();a=await busy(p,true);assert.equal(a.plays.length,2);assert.deepEqual(assertServer(a.plays[1],study,text),request);await emit(p,1,'ended');assert.equal((await busy(p,false)).speech.length,0);
    if(pair==='fr-zh'){await p.locator('#mgReadingToggle').click();assert.equal(await p.locator('#mgReadingToggle').getAttribute('aria-pressed'),'true');await p.locator('#mgListen').click();a=await busy(p,true);assertServer(a.plays[2],study,text);await emit(p,2,'ended');await assertFits(p);await capture(p,'server-audio-chinese-pinyin-320');}
    if(pair==='fr-es'){await assertFits(p);await capture(p,'server-audio-spanish-mobile');}
    if(pair==='fr-en')await capture(p,'server-audio-english-desktop');
    assert.deepEqual(await state(p),before);report.cases.push({name:'seven-server-voice',pair,androidEmulated:f.android,installedBrowserVoices:0,request,sourceCard:before.phraseId,earAndSpeakerEquivalent:true});
  }finally{await f.context.close();}}
}));

test('voice and speed menus describe actual server choices and retain the selected rate',{timeout:30000},()=>checked('server-choice-and-speed',async()=>{
  const f=await fixture({pair:'fr-es',voices:[{name:'French default',voiceURI:'french',lang:'fr-FR',default:true}]});try{const p=f.page;await firstLesson(p);await openVoice(p);const values=await p.locator('#mgVoice option').evaluateAll(nodes=>nodes.map(n=>({value:n.value,label:n.textContent})));assert.deepEqual(values.map(x=>x.value),['female','male']);assert.ok(values.every(x=>x.label.trim()));assert.equal(await p.locator('#mgVoice').inputValue(),'female');await p.locator('#mgVoice').selectOption('male');await p.locator('#mgSpeed').selectOption('0.75');await capture(p,'server-audio-spanish-voice-menu');await closeMenu(p);const before=await state(p),text=await p.locator('#mgPhrase').textContent();await p.locator('#mgEar').click();let a=await busy(p,true);assertServer(a.plays[0],'es',text,{gender:'male',rate:.75});assert.equal(a.speech.length,0);await emit(p,0,'ended');await busy(p,false);await openVoice(p);assert.equal(await p.locator('#mgVoice').inputValue(),'male');assert.equal(await p.locator('#mgSpeed').inputValue(),'0.75');await p.locator('#mgVoice').selectOption('female');await p.locator('#mgSpeed').selectOption('1');await closeMenu(p);await p.locator('#mgListen').click();a=await busy(p,true);assertServer(a.plays[1],'es',text,{gender:'female',rate:1});assert.equal(a.speech.length,0);await emit(p,1,'ended');await busy(p,false);assert.deepEqual(await state(p),before);report.cases.push({name:'server-choices-and-rates',choices:values,voices:['es-ES-Wavenet-E','es-ES-Wavenet-F'],rates:[.75,1],defaultRateCoveredElsewhere:.85,noBrowserFrenchVoiceUsed:true});}finally{await f.context.close();}
}));

test('browser fallback requires an explicitly installed voice in the studied language, including empty and French-only Android fixtures',{timeout:45000},()=>checked('strict-browser-fallback',async()=>{
  for(const voices of [[],[{name:'French default',voiceURI:'french-default',lang:'fr-FR',default:true}]]){const f=await fixture({voices});try{const p=f.page;await firstLesson(p);await p.locator('#mgListen').click();await emit(p,0,'error');const a=await busy(p,false);assert.equal(a.speech.length,0,'never ask an automatic or French voice to speak Spanish');assert.match(a.status,/(indisponible|pas disponible|pas pu démarrer)/i);assert.equal(await p.locator('#mgListen').isEnabled(),true);await p.locator('#mgListen').click();let retry=await busy(p,true);assert.equal(retry.plays.length,2);assert.equal(retry.status,'');await emit(p,1,'playing');await emit(p,1,'ended');await busy(p,false);report.cases.push({name:'android-no-compatible-voice',installedVoiceLanguages:voices.map(v=>v.lang),browserSpeechCalls:0,retryWorks:true});}finally{await f.context.close();}}
  const f=await fixture({voices:[{name:'French default',voiceURI:'french-default',lang:'fr-FR',default:true},{name:'Spanish Mexico',voiceURI:'spanish-mx',lang:'es-MX'},{name:'Spanish Spain',voiceURI:'spanish-es',lang:'es-ES'}]});try{const p=f.page;await firstLesson(p);const before=await state(p),text=await p.locator('#mgPhrase').textContent();await p.locator('#mgListen').click();await emit(p,0,'error');const a=await busy(p,true);assert.equal(a.speech.length,1);assert.equal(a.speech[0].text,text);assert.equal(a.speech[0].rate,.85);assert.ok(a.speech[0].voice,'fallback must always explicitly set a compatible voice');assert.equal(a.speech[0].voice.lang.split('-')[0],'es');assert.notEqual(a.speech[0].voice.voiceURI,'french-default');assert.equal(a.speech[0].lang.split('-')[0],'es');await speechEnd(p);await busy(p,false);assert.deepEqual(await state(p),before);report.cases.push({name:'explicit-spanish-fallback',speech:a.speech[0],noDefaultFrenchFallback:true});}finally{await f.context.close();}
  for(const voices of [[],[{name:'French default',voiceURI:'french-default',lang:'fr-FR',default:true}],[{name:'French default',voiceURI:'french-default',lang:'fr-FR',default:true},{name:'Spanish',voiceURI:'spanish',lang:'es-ES'}]]){const f=await fixture({voices});try{const p=f.page;await firstLesson(p);await p.locator('#mgListen').click();await p.evaluate(()=>window.__qaAudio[0].rejectPlay(new DOMException('Fixture media gesture refused','NotAllowedError')));await settled(p);const compatible=voices.some(v=>v.lang==='es-ES'),a=await busy(p,compatible);assert.equal(a.speech.length,compatible?1:0);if(compatible){assert.equal(a.speech[0].voice.voiceURI,'spanish');await speechEnd(p);await busy(p,false);}else assert.match(a.status,/(indisponible|pas disponible|pas pu démarrer)/i);report.cases.push({name:'NotAllowedError-safe-fallback',installedVoiceLanguages:voices.map(v=>v.lang),compatibleBrowserFallback:compatible,frenchVoiceNeverUsed:true});}finally{await f.context.close();}}
  for(const item of [
    {voice:{name:'Cantonese',voiceURI:'cantonese',lang:'yue-HK'},compatible:false},
    {voice:{name:'Hong Kong',voiceURI:'zh-hk',lang:'zh-HK'},compatible:false},
    {voice:{name:'Macao',voiceURI:'zh-mo',lang:'zh-MO'},compatible:false},
    {voice:{name:'Cantonese voice',voiceURI:'named-cantonese',lang:'zh-CN'},compatible:false},
    {voice:{name:'Taiwan Mandarin',voiceURI:'zh-tw',lang:'zh-TW'},compatible:true},
    {voice:{name:'Singapore Mandarin',voiceURI:'zh-sg',lang:'zh-SG'},compatible:true},
    {voice:{name:'Mandarin',voiceURI:'cmn',lang:'cmn-CN'},compatible:true}
  ]){const f=await fixture({pair:'fr-zh',voices:[{name:'French default',voiceURI:'french-default',lang:'fr-FR',default:true},item.voice]});try{const p=f.page;await firstLesson(p);const text=await p.locator('#mgPhrase').textContent();await p.locator('#mgListen').click();await emit(p,0,'error');const a=await busy(p,item.compatible);assert.equal(a.speech.length,item.compatible?1:0);if(item.compatible){assert.equal(a.speech[0].voice.voiceURI,item.voice.voiceURI);assert.equal(a.speech[0].text,text);assert.equal(a.speech[0].lang,item.voice.lang);await speechEnd(p);await busy(p,false);}else assert.match(a.status,/(indisponible|pas disponible|pas pu démarrer)/i);report.cases.push({name:'Mandarin-only-fallback',browserVoice:item.voice,compatibleMandarin:item.compatible,noFrenchOrCantoneseFallback:true});}finally{await f.context.close();}}
}));

test('retry, old media callbacks, pending promises and navigation cannot start stale fallback or change the new lesson',{timeout:45000},()=>checked('replacement-and-navigation',async()=>{
  const voices=[{name:'Spanish',voiceURI:'spanish',lang:'es-ES'},{name:'French default',voiceURI:'french-default',lang:'fr-FR',default:true}],f=await fixture({voices});try{const p=f.page;await firstLesson(p);const before=await state(p);await p.locator('#mgListen').click();await busy(p,true);await p.locator('#mgListen').click();let a=await busy(p,true);assert.equal(a.plays.length,2);assert.ok(a.audios[0].pauses>0);assert.equal(a.audios[0].src,'');await emit(p,0,'error',true);await emit(p,0,'ended',true);await p.evaluate(()=>window.__qaAudio[0].rejectPlay?.(new Error('Old pending play rejected')));a=await busy(p,true);assert.equal(a.speech.length,0);assert.equal(a.status,'');await emit(p,1,'ended');await busy(p,false);assert.deepEqual(await state(p),before);
    await p.locator('#mgListen').click();await p.locator('#mgContinue').click();const advanced=await state(p);assert.notEqual(advanced.stepIndex,before.stepIndex);await busy(p,false);await emit(p,2,'error',true);await emit(p,2,'ended',true);assert.equal((await busy(p,false)).speech.length,0);assert.deepEqual(await state(p),advanced);
    await p.locator('#mgListen').click();await p.locator('#mgLanguageTrigger').click();await p.locator('#mgLanguageChoices [data-pair="fr-it"]').click();await ready(p,'fr-it');const changed=await state(p);await emit(p,3,'error',true);assert.equal((await busy(p,false)).speech.length,0);assert.deepEqual(await state(p),changed);assert.equal((await audioState(p)).status,'');report.cases.push({name:'media-replacement-and-navigation',oldCallbacksIgnored:true,oldPromisesIgnored:true,currentCardAndDecisionsRetained:true});
  }finally{await f.context.close();}
  const g=await fixture({voices});try{const p=g.page;await firstLesson(p);await p.locator('#mgListen').click();await emit(p,0,'error');assert.equal((await busy(p,true)).speech.length,1);const saved=await state(p);await p.locator('#mgBack').click();await ready(p,'fr-es');const current=await state(p);await speechEnd(p,0,'network');await speechEnd(p,0);const a=await busy(p,false);assert.equal(a.status,'');assert.deepEqual(await state(p),current);assert.equal(current.known,saved.known);assert.equal(current.review,saved.review);report.cases.push({name:'fallback-navigation-cancellation',lateSpeechEventsIgnored:true});}finally{await g.context.close();}
}));

test('real recall cards reveal only on the audio control and preserve both controls, card state and decisions',{timeout:45000},()=>checked('recall-reveal-and-controls',async()=>{
  for(const pair of ['fr-zh','zh-fr']){const f=await fixture({pair,width:390,height:844});try{const p=f.page;await enterRecall(p,pair);const before=await state(p),text=await p.locator('#mgPhrase').textContent();assert.equal(await p.locator('#mgPhrase').isVisible(),false);for(const id of ['mgEar','mgListen']){assert.equal(await p.locator('#'+id).isVisible(),true);assert.match(await p.locator('#'+id).getAttribute('aria-label'),pair==='zh-fr'?/显示并听/:/Révéler et écouter/);}await p.locator('#mgListen').click();assert.equal(await p.evaluate(()=>window.MelungaMockup.state().masked),false);assert.equal(await p.locator('#mgPhrase').isVisible(),true);const a=await busy(p,true);assert.equal(a.plays.length,1);assertServer(a.plays[0],pair.split('-')[1],text);assert.equal(a.speech.length,0);await emit(p,0,'ended');await busy(p,false);assert.deepEqual(await state(p),before);report.cases.push({name:'real-recall-explicit-reveal',pair,sourceCard:before.phraseId,cardAndDecisionsUnchanged:true});}finally{await f.context.close();}}
}));
