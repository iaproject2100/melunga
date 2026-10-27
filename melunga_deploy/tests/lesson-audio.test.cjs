/* Deterministic media/synthesis tests. No audio, HTTP, account or public site. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const source = fs.readFileSync(path.join(__dirname, '../lesson-audio.js'), 'utf8');
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
function fixture(options = {}) {
  const f = { audio: [], speech: [], unavailable: 0, playing: false, canceled: 0,
    voices: options.voices || [], timers: new Map(), nextTimer: 0, nextPlay: null };
  class Audio {
    constructor() { this.paused = 0; this.loaded = 0; this.src = ''; f.audio.push(this); }
    play() { return f.nextPlay || Promise.resolve(); }
    pause() { this.paused++; }
    removeAttribute(name) { if (name === 'src') this.src = ''; }
    load() { this.loaded++; }
  }
  const c = { URLSearchParams, Audio: options.noAudio ? undefined : Audio,
    SpeechSynthesisUtterance: class { constructor(text) { this.text = text; } },
    speechSynthesis: { getVoices: () => f.voices, speak: utterance => f.speech.push(utterance), cancel: () => f.canceled++ },
    setTimeout: fn => { const id = ++f.nextTimer; f.timers.set(id, fn); return id; },
    clearTimeout: id => f.timers.delete(id) };
  if (options.noSynthesis) c.speechSynthesis = undefined;
  c.window = c;
  vm.runInNewContext(source, c);
  f.player = c.MelungaLessonAudio.createPlayer({ onPlaying: value => { f.playing = value; }, onUnavailable: () => f.unavailable++ });
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
