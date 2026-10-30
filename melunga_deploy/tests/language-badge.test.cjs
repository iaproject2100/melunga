/* Badge scope checks: whole card literals/banks remain the approved source.
 * No HTML script execution, provider call or account operation is performed. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {execFileSync}=require('node:child_process');
const {test}=require('node:test');
const ROOT=path.resolve(__dirname,'../..'),WEB=path.join(ROOT,'melunga_deploy');
const BASE='5675b012ddbd5d7b19cd440e64ee14132a20921e';
const read=file=>fs.readFileSync(path.join(WEB,file),'utf8');
const before=file=>execFileSync('git',['show',BASE+':melunga_deploy/'+file],{cwd:ROOT,maxBuffer:40*1024*1024});
const literal=(source,name)=>{const line=source.split('\n').find(value=>value.startsWith('var '+name+' = '));assert.ok(line,'single-line source literal '+name);return line;};
const app=read('app.html');
const UI_FILES=['app.html','index.html','course-native.js','maquette-guidee.js','voice-comparison.js','desktop-home.js','desktop-home.css'];

test('all classic cards/families and every historical/native card-bank file remain byte exact',()=>{
  const old=before('app.html').toString();
  for(const name of ['DECKS','PEDAGOGY_FAMILIES'])assert.equal(literal(app,name),literal(old,name),'whole unchanged '+name+' literal');
  const decks=JSON.parse(literal(app,'DECKS').replace(/^var DECKS = /,'').replace(/;$/,''));
  assert.deepEqual(Object.fromEntries(Object.entries(decks).map(([code,cards])=>[code,cards.length])),{fr:4500,en:4502,es:4672,zh:4903,it:4509,ja:4509,ko:4520});
  assert.equal(Object.values(decks).reduce((total,cards)=>total+cards.length,0),32115);
  const files=execFileSync('git',['ls-tree','-r','--name-only',BASE,'--','melunga_deploy/content/niveaux-progressifs','melunga_deploy/content/native-catalogue'],{cwd:ROOT,encoding:'utf8'}).trim().split('\n')
    .filter(file=>file.endsWith('.json')&&!file.endsWith('/native-catalogue/manifest.json'));
  assert.ok(files.length>=85,'all source banks and historical runtime JSON are covered');
  for(const file of files)assert.ok(fs.readFileSync(path.join(ROOT,file)).equals(before(file.replace(/^melunga_deploy\//,''))),'whole bank unchanged: '+file);
});

test('the current modern bank inventory stays eight languages/36634 cards without an Arabic bank',()=>{
  const manifest=JSON.parse(read('content/native-catalogue/manifest.json'));
  assert.deepEqual(Object.keys(manifest.banks).sort(),['de','en','es','fr','it','ja','ko','zh']);
  assert.deepEqual(Object.fromEntries(Object.entries(manifest.banks).map(([code,bank])=>[code,bank.sourceCardCount])),{fr:4500,en:4502,es:4672,it:4509,zh:4903,ja:4509,ko:4520,de:4519});
  assert.equal(manifest.sourceCardCount,36634);
  assert.equal(Object.values(manifest.banks).reduce((sum,bank)=>sum+bank.sourceCardCount,0),36634);
  assert.equal(Object.hasOwn(manifest.banks,'ar'),false);
  assert.equal(/<button\b[^>]*\bid=["']l(?:AR|DE)["']/i.test(app),false,'Arabic/German classic buttons are absent; browser additions are explicit fixtures');
});

test('English UI flags use the US while the English speech locale remains en-US',()=>{
  for(const file of UI_FILES)assert.ok(!read(file).includes('🇬🇧')&&!read(file).includes('🇸🇦'),'no old visible flag in '+file);
  for(const file of ['app.html','index.html','course-native.js','maquette-guidee.js','voice-comparison.js'])assert.ok(read(file).includes('🇺🇸'),'US English badge in '+file);
  assert.match(read('voice-selection.js'),/en-US/,'actual shared voice controller keeps the English GB locale');
  const tts=read('netlify/functions/tts.mjs');
  for(const name of ['en-US-Wavenet-C','en-US-Wavenet-D'])assert.ok(tts.includes("'"+name+"': { languageCode: 'en-US'"));
  assert.ok(tts.includes('en-US-Wavenet-C') && tts.includes('en-US-Wavenet-D'),'American voices are supported');
});

test('Arabic/German future badges use known IDs, neutral letter CSS and the correct country colours',()=>{
  const match=app.match(/var LANGUAGE_FLAGS = (\{[\s\S]*?\n  \});/);assert.ok(match);
  const flags=vm.runInNewContext('('+match[1]+')');assert.equal(flags.lDE,'de');assert.equal(flags.lAR,'ar');
  assert.match(app,/\.fl\.fl-ar,#ballLang\.fl-ar\s*\{[^}]*background:#0b6e4f;color:#fff/);
  assert.match(app,/\.menu-b-flag\.flag-ar::after\s*\{[^}]*content:"ع"/);
  assert.match(app,/\.menu-b-flag\.flag-de\s*\{[^}]*#111[^}]*#dd0000[^}]*#ffce00/);
});

test('each inline JavaScript and affected external UI script compiles',()=>{
  let scripts=0;
  for(const file of ['app.html','index.html']){
    for(const match of read(file).matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)){
      if(/\bsrc\s*=|\btype\s*=\s*["'](?:application\/json|application\/ld\+json)/i.test(match[1])||!match[2].trim())continue;
      new vm.Script(match[2],{filename:file+'#inline-'+(++scripts)});
    }
  }
  assert.ok(scripts>=7,'every executable inline script was compiled');
  for(const file of UI_FILES.filter(file=>file.endsWith('.js')))new vm.Script(read(file),{filename:file});
});
