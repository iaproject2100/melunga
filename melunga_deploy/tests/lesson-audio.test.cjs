/* Deterministic media/synthesis tests. No audio, HTTP, account or public site. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const source = fs.readFileSync(path.join(__dirname, '../lesson-audio.js'), 'utf8');
const selectionSource = fs.readFileSync(path.join(__dirname, '../voice-selection.js'), 'utf8');
const female = {
  fr: ['fr-FR-Wavenet-F', 'fr-FR'], en: ['en-GB-Wavenet-C', 'en-GB'],
  es: ['es-ES-Wavenet-F', 'es-ES'], zh: ['cmn-CN-Wavenet-A', 'cmn-CN'],
  it: ['it-IT-Wavenet-E', 'it-IT'], ja: ['ja-JP-Wavenet-B', 'ja-JP'],
  ko: ['ko-KR-Wavenet-A', 'ko-KR']
};
const male = { fr: 'fr-FR-Wavenet-G', en: 'en-GB-Wavenet-D', es: 'es-ES-Wavenet-E',
  zh: 'cmn-CN-Wavenet-B', it: 'it-IT-Wavenet-F', ja: 'ja-JP-Wavenet-C', ko: 'ko-KR-Wavenet-C' };
const voice = (lang, name = lang) => ({ lang, name, voiceURI: 'test:' + name });
const deferred = () => { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };
// Catalogue response fixtures exercise selection; their names do not assert
// that a provider currently offers these candidates in a live deployment.
function previewCatalogue() {
  return {version:1,source:'google-voices-list',previewOnly:true,
    verifiedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+300000).toISOString(),
    languages:Object.fromEntries(Object.entries(female).map(([language,[name,locale]])=>[language,{
      language,available:true,waveNet:{name,languageCode:locale,gender:'FEMALE',engine:'wavenet',rateMode:'server'},
      chirp:[['Aoede','FEMALE'],['Kore','FEMALE'],['Charon','MALE']].map(([suffix,gender])=>({
        name:locale+'-Chirp3-HD-'+suffix,languageCode:locale,gender,engine:'chirp3',rateMode:'client'}))
    }]))};
}
function fixture(options = {}) {
  const f = { audio: [], speech: [], unavailable: 0, playing: false, canceled: 0,
    voices: options.voices || [], timers: new Map(), nextTimer: 0, nextPlay: null,voiceEvents:[],catalogueCalls:[],storage:new Map(),now:Date.now() };
  class FixtureDate extends Date { static now(){return f.now;} }
  class Audio {
    constructor() { this.paused = 0; this.loaded = 0; this.src = ''; f.audio.push(this); }
    play() { this.plays=(this.plays||0)+1;return f.nextPlay || Promise.resolve(); }
    pause() { this.paused++; }
    removeAttribute(name) { if (name === 'src') this.src = ''; }
    load() { this.loaded++; }
  }
  const c = { URLSearchParams, Date:FixtureDate, Audio: options.noAudio ? undefined : Audio,
    location:{protocol:'https:'},
    localStorage:{getItem:key=>f.storage.get(key)??null,setItem:(key,value)=>f.storage.set(key,value)},
    fetch:async(url)=>{f.catalogueCalls.push(url);if(options.catalogueFails)throw new Error('Catalogue offline');
      return {ok:true,json:async()=>options.catalogue||previewCatalogue()};},
    SpeechSynthesisUtterance: class { constructor(text) { this.text = text; } },
    speechSynthesis: { getVoices: () => f.voices, speak: utterance => f.speech.push(utterance), cancel: () => f.canceled++ },
    setTimeout: fn => { const id = ++f.nextTimer; f.timers.set(id, fn); return id; },
    clearTimeout: id => f.timers.delete(id) };
  if (options.noSynthesis) c.speechSynthesis = undefined;
  c.window = c;
  if(options.preview){vm.runInNewContext(selectionSource,c);f.selection=c.MelungaVoiceSelection;f.ready=f.selection.ready();}
  vm.runInNewContext(source, c);
  f.player = c.MelungaLessonAudio.createPlayer({ onPlaying: value => { f.playing = value; }, onUnavailable: () => f.unavailable++,onVoice:value=>f.voiceEvents.push(value) });
  f.last = () => f.audio.at(-1);
  f.expire = () => { const pending = [...f.timers.values()]; f.timers.clear(); for (const fn of pending) fn(); };
  return f;
}

test('all seven server voices preserve whole study text and apply each speed once, without needing a browser voice', () => {
  for (const [language, [name, locale]] of Object.entries(female)) for (const rate of [0.75, 0.85, 1]) {
    const f = fixture({ noSynthesis: true }), text = 'Étude entière : 我叫玛丽。 & + ?';
    assert.equal(f.player.play({ text, language, rate }), true);
    const audio = f.last(), url = new URL(audio.src, 'https://lesson.test');
    assert.equal(url.pathname, '/.netlify/functions/tts');
    assert.deepEqual(Object.fromEntries(url.searchParams), { voice: name, lang: locale, rate: String(rate), text });
    assert.equal(audio.playbackRate, 1);
    assert.equal(f.playing, true);
    audio.onplaying(); assert.equal(f.timers.size, 0);
    audio.onended(); assert.equal(f.playing, false); assert.equal(f.unavailable, 0);
    assert.deepEqual(f.speech, []);
  }
});

test('male selection uses the existing male WaveNet endpoint IDs in every language', () => {
  for (const [language, name] of Object.entries(male)) {
    const f = fixture(); f.player.play({ text: 'Phrase', language, voice: 'male' });
    assert.equal(new URL(f.last().src, 'https://lesson.test').searchParams.get('voice'), name);
    f.player.stop(); assert.equal(f.timers.size, 0);
  }
});

test('an empty voice list or French-only Android list cannot read Spanish after a media failure', () => {
  for (const voices of [[], [voice('fr-FR', 'French system default')], [voice('et-EE')], [voice('')]]) {
    const f = fixture({ voices }); f.player.play({ text: 'Buenos días.', language: 'es' }); f.last().onerror();
    assert.equal(f.unavailable, 1); assert.equal(f.playing, false); assert.deepEqual(f.speech, []);
    assert.equal(f.last().src, ''); assert.ok(f.last().paused); assert.equal(f.timers.size, 0);
  }
});

test('fallback explicitly selects a compatible studied-language voice, never the first French voice', () => {
  const preferred = voice('es-ES', 'Spanish'), f = fixture({ voices: [voice('fr-FR'), voice('es-MX'), preferred] });
  f.player.play({ text: '¿Cuánto cuesta?', language: 'es', rate: 0.75 }); f.last().onerror();
  assert.equal(f.speech.length, 1); const utterance = f.speech[0];
  assert.equal(utterance.voice, preferred); assert.equal(utterance.lang, 'es-ES'); assert.equal(utterance.rate, 0.75);
  assert.equal(utterance.text, '¿Cuánto cuesta?'); assert.equal(f.playing, true);
  utterance.onstart(); assert.equal(f.timers.size, 0);
  utterance.onend(); assert.equal(f.playing, false); assert.equal(f.unavailable, 0);
});

test('Mandarin cmn voices are compatible with Chinese, and a differently declared language is rejected', () => {
  const mandarin = voice('cmn-CN'), f = fixture({ voices: [voice('fr-FR'), mandarin] });
  f.player.play({ text: '你好。', language: 'zh' }); f.last().onerror(); assert.equal(f.speech[0].voice, mandarin);
  f.player.stop();
  const other = fixture({ voices: [voice('yue-HK')] }); other.player.play({ text: '你好。', language: 'zh' }); other.last().onerror();
  assert.equal(other.speech.length, 0); assert.equal(other.unavailable, 1);
});

test('Mandarin fallback excludes Hong Kong, Macao and explicitly Cantonese voices, while accepting known Mandarin locales', () => {
  for (const candidate of [voice('yue-HK'), voice('zh-HK'), voice('zh-Hant-HK'), voice('zh-MO'),
    voice('zh-CN', 'Chinese Cantonese'), voice('cmn-CN', '广东话')]) {
    const f = fixture({ voices: [voice('fr-FR'), candidate] });
    f.player.play({ text: '你好。', language: 'zh' }); f.last().onerror();
    assert.equal(f.speech.length, 0); assert.equal(f.unavailable, 1);
  }
  for (const language of ['zh-CN', 'zh-TW', 'zh-SG', 'cmn-CN']) {
    const candidate = voice(language), f = fixture({ voices: [voice('fr-FR'), candidate] });
    f.player.play({ text: '你好。', language: 'zh' }); f.last().onerror();
    assert.equal(f.speech[0].voice, candidate); assert.equal(f.unavailable, 0); f.player.stop();
  }
});

test('a NotAllowedError rejects server playback safely, with a compatible fallback or an explicit unavailable result', async () => {
  for (const voices of [[], [voice('fr-FR')], [voice('es-ES')]]) {
    const f = fixture({ voices }), pending = deferred(); f.nextPlay = pending.promise;
    f.player.play({ text: 'Gracias.', language: 'es' }); pending.reject(Object.assign(new Error('blocked'), { name: 'NotAllowedError' }));
    await Promise.resolve(); await Promise.resolve();
    assert.equal(f.speech.length, voices.some(v => v.lang === 'es-ES') ? 1 : 0);
    assert.equal(f.unavailable, f.speech.length ? 0 : 1);
    f.player.stop();
  }
});

test('late server errors, endings and rejected play promises cannot disturb a newer click or start old speech', async () => {
  const f = fixture({ voices: [voice('es-ES')] }), pending = deferred(); f.nextPlay = pending.promise;
  f.player.play({ text: 'Anterior.', language: 'es' });
  const old = f.last(), lateError = old.onerror, lateEnd = old.onended, latePlaying = old.onplaying;
  f.nextPlay = null; f.player.play({ text: 'Nueva.', language: 'es' }); const latest = f.last();
  lateError(); lateEnd(); latePlaying(); pending.reject(new Error('old request aborted'));
  await Promise.resolve(); await Promise.resolve();
  assert.equal(f.last(), latest); assert.equal(f.playing, true); assert.equal(f.speech.length, 0); assert.equal(f.unavailable, 0);
  latest.onended(); assert.equal(f.playing, false);
});

test('stop cancels pending media and fallback, and stale callbacks cannot report an error after navigation', () => {
  const f = fixture({ voices: [voice('es-ES')] }); f.player.play({ text: 'Media.', language: 'es' });
  const audio = f.last(), late = audio.onerror; f.player.stop(); late();
  assert.equal(audio.src, ''); assert.ok(audio.paused); assert.equal(f.speech.length, 0); assert.equal(f.playing, false);
  f.player.play({ text: 'Système.', language: 'es' }); f.last().onerror();
  const old = f.speech[0], oldError = old.onerror, oldEnd = old.onend;
  f.player.stop(); oldError({ error: 'network' }); oldEnd(); f.expire();
  assert.equal(f.canceled, 1); assert.equal(f.unavailable, 0); assert.equal(f.playing, false); assert.equal(f.timers.size, 0);
});

test('retry is a fresh server attempt after errors and never remembers a failed voice permanently', () => {
  const f = fixture(); f.player.play({ text: 'Réessai.', language: 'es' }); f.last().onerror(); assert.equal(f.unavailable, 1);
  f.player.play({ text: 'Réessai.', language: 'es' }); assert.equal(f.audio.length, 2); assert.equal(f.playing, true);
  f.last().onplaying(); f.last().onended(); assert.equal(f.playing, false); assert.equal(f.unavailable, 1);
});

test('stalled media times out to a safe fallback, and an unstarted fallback also times out without a default voice', () => {
  const f = fixture({ voices: [voice('es-ES')] }); f.player.play({ text: 'Espera.', language: 'es' });
  f.last().onplaying(); f.last().onstalled(); f.expire(); assert.equal(f.speech.length, 1); assert.equal(f.playing, true);
  f.expire(); assert.equal(f.unavailable, 1); assert.equal(f.playing, false); assert.equal(f.canceled, 1);
});

test('server callbacks saved before fallback cannot finish the active system utterance', () => {
  const f = fixture({ voices: [voice('es-ES')] }); f.player.play({ text: 'Gracias.', language: 'es' });
  const audio = f.last(), end = audio.onended, playing = audio.onplaying; audio.onerror();
  end(); playing(); assert.equal(f.playing, true); assert.equal(f.speech.length, 1);
  f.speech[0].onend(); assert.equal(f.playing, false);
});

test('unsupported language, self-invented voice and invalid rate cannot choose a different server voice', () => {
  for (const request of [{ text: ' ', language: 'es' }, { text: 'Text', language: 'de' },
    { text: 'Text', language: 'es', rate: 9 }, { text: 'Text', language: 'es', voice: 'fr-FR-Wavenet-F' }]) {
    const f = fixture(); assert.equal(f.player.play(request), false); assert.equal(f.audio.length, 0);
    assert.equal(f.speech.length, 0); assert.equal(f.unavailable, 1); assert.equal(f.playing, false);
  }
});

test('preloaded Chirp preview plays synchronously at natural server speed and applies each classic or modern speed exactly once on media',async()=>{
  for(const language of Object.keys(female))for(const rate of [0.7,0.75,0.85,1]){
    const f=fixture({preview:true,noSynthesis:true});await f.ready;
    const text='Phrase entière : 你好。 & + ?';
    assert.equal(f.player.play({text,language,rate}),true);
    const audio=f.last(),url=new URL(audio.src,'https://lesson.test');
    assert.equal(audio.plays,1,'Audio.play has run before the click handler returns');
    assert.equal(url.searchParams.get('voice'),f.selection.getChoices(language)[1].name);
    assert.equal(url.searchParams.get('text'),text);assert.equal(url.searchParams.get('rate'),'1');
    assert.equal(audio.playbackRate,rate);assert.equal(audio.preservesPitch,true);assert.equal(audio.webkitPreservesPitch,true);
    assert.equal(f.selection.getSelected(language),null);assert.equal(f.storage.size,0);
    assert.equal(f.voiceEvents.at(-1).provisional,true);assert.equal(f.voiceEvents.at(-1).engine,'chirp3');
    audio.onplaying();audio.onended();assert.equal(f.playing,false);assert.equal(f.unavailable,0);
  }
});

test('explicit WaveNet favourites retain server speed, while candidate trials do not save a new favourite',async()=>{
  const f=fixture({preview:true});await f.ready;
  const choices=f.selection.getChoices('es');assert.equal(f.selection.setVoice('es',choices[0].name),true);
  f.player.play({text:'Una frase.',language:'es',rate:0.7});
  let url=new URL(f.last().src,'https://lesson.test');
  assert.equal(url.searchParams.get('voice'),female.es[0]);assert.equal(url.searchParams.get('rate'),'0.7');
  assert.equal(f.last().playbackRate,1);assert.equal(f.voiceEvents.at(-1).provisional,false);
  const stored=f.storage.get('melunga-preview-voice-selection-v1');
  f.player.play({text:'La misma frase.',language:'es',rate:0.75,voiceName:choices[3].name});
  url=new URL(f.last().src,'https://lesson.test');assert.equal(url.searchParams.get('voice'),choices[3].name);
  assert.equal(url.searchParams.get('rate'),'1');assert.equal(f.last().playbackRate,0.75);
  assert.equal(f.storage.get('melunga-preview-voice-selection-v1'),stored);
  assert.equal(f.player.play({text:'Bad',language:'es',voiceName:f.selection.getChoices('fr')[1].name}),false);
  assert.equal(f.player.play({text:'Bad',language:'es',voiceName:'unverified-name'}),false);
});

test('a loading preview catalogue never falls through to old WaveNet or delayed speech after the gesture',async()=>{
  const f=fixture({preview:true,voices:[voice('es-ES')]});
  assert.equal(f.player.play({text:'Hola.',language:'es'}),false);assert.equal(f.audio.length,0);assert.equal(f.speech.length,0);
  await f.ready;assert.equal(f.audio.length,0,'catalogue completion does not start delayed playback');
  assert.equal(f.player.play({text:'Hola.',language:'es'}),true);assert.equal(f.last().plays,1);
});

test('a failed catalogue permits only an explicit matching browser voice, without a server candidate or French default',async()=>{
  for(const voices of [[],[voice('fr-FR')],[voice('es-ES')]]){
    const f=fixture({preview:true,catalogueFails:true,voices});await assert.rejects(f.ready);
    assert.equal(f.player.play({text:'Hola.',language:'es',rate:0.7}),true);assert.equal(f.audio.length,0);
    assert.equal(f.speech.length,voices.some(candidate=>candidate.lang==='es-ES')?1:0);
    assert.equal(f.voiceEvents.length,0,'no Chirp metadata is announced for local-only fallback');
    if(f.speech.length){assert.equal(f.speech[0].lang,'es-ES');assert.equal(f.speech[0].rate,0.7);assert.equal(f.speech[0].text,'Hola.');}
    else{assert.equal(f.unavailable,1);assert.equal(f.playing,false);}
    await assert.rejects(f.selection.ready());f.player.stop();
  }
});

test('catalogue retry completion neither interrupts local fallback nor starts a delayed server playback',async()=>{
  const options={preview:true,catalogueFails:true,voices:[voice('es-ES')]},f=fixture(options);await assert.rejects(f.ready);
  options.catalogueFails=false;assert.equal(f.player.play({text:'Una frase.',language:'es'}),true);
  const utterance=f.speech[0];await f.selection.ready();
  assert.equal(f.audio.length,0);assert.equal(f.speech.length,1);assert.equal(f.playing,true);
  utterance.onend();assert.equal(f.playing,false);
  assert.equal(f.player.play({text:'Otra frase.',language:'es'}),true);assert.equal(f.audio.length,1);
  assert.equal(f.voiceEvents.at(-1).engine,'chirp3');f.player.stop();
});

test('an expired catalogue uses only matching browser speech while its refresh remains a later-gesture operation',async()=>{
  const f=fixture({preview:true,voices:[voice('fr-FR'),voice('es-ES')]});await f.ready;f.now+=300001;
  assert.equal(f.selection.state().status,'expired');assert.equal(f.player.play({text:'Una frase.',language:'es'}),true);
  assert.equal(f.audio.length,0);assert.equal(f.speech.length,1);assert.equal(f.speech[0].lang,'es-ES');
  await assert.rejects(f.selection.ready());assert.equal(f.speech.length,1);assert.equal(f.playing,true);f.player.stop();
});

test('explicit male selection uses the actual masculine catalogue candidate in each of the seven languages',async()=>{
  for(const language of Object.keys(female)){
    const f=fixture({preview:true});await f.ready;
    const candidate=f.selection.getChoices(language).find(item=>item.engine==='chirp3'&&item.gender==='MALE');
    assert.ok(candidate);assert.equal(f.selection.setVoice(language,candidate.name),true);
    f.player.play({text:'Phrase.',language});const url=new URL(f.last().src,'https://lesson.test');
    assert.equal(url.searchParams.get('voice'),candidate.name);assert.equal(f.voiceEvents.at(-1).provisional,false);f.player.stop();
  }
});

test('Chirp failures permit only the studied browser language, and reject French defaults or Cantonese for Mandarin',async()=>{
  for(const candidates of [[],[voice('fr-FR')],[voice('es-ES')]]){
    const f=fixture({preview:true,voices:candidates});await f.ready;
    f.player.play({text:'Buenos días.',language:'es',rate:0.7});f.last().onerror();
    assert.equal(f.speech.length,candidates.some(v=>v.lang==='es-ES')?1:0);
    if(f.speech.length){assert.equal(f.speech[0].rate,0.7);assert.equal(f.speech[0].lang,'es-ES');}
    else assert.equal(f.unavailable,1);
    f.player.stop();
  }
  for(const candidate of [voice('yue-HK'),voice('zh-HK'),voice('cmn-CN','Cantonese')]){
    const f=fixture({preview:true,voices:[candidate]});await f.ready;
    f.player.play({text:'你好。',language:'zh'});f.last().onerror();assert.equal(f.speech.length,0);assert.equal(f.unavailable,1);
  }
});

test('a changed local favourite cancels current Chirp and stale callbacks cannot speak or stop its replacement',async()=>{
  const f=fixture({preview:true,voices:[voice('es-ES')]});await f.ready;
  const pending=deferred();f.nextPlay=pending.promise;f.player.play({text:'Anterior.',language:'es'});
  const audio=f.last(),lateError=audio.onerror,lateEnd=audio.onended;
  assert.equal(f.selection.setVoice('es',f.selection.getChoices('es')[3].name),true);
  assert.equal(audio.src,'');assert.equal(f.playing,false);f.nextPlay=null;
  f.player.play({text:'Nueva.',language:'es'});const latest=f.last();
  lateError();lateEnd();pending.reject(new Error('Old play aborted'));await Promise.resolve();await Promise.resolve();
  assert.equal(f.last(),latest);assert.equal(f.playing,true);assert.equal(f.speech.length,0);assert.equal(f.unavailable,0);
  f.player.destroy();assert.equal(latest.src,'');assert.equal(f.timers.size,0);
});
