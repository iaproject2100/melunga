'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const ROOT=path.resolve(__dirname,'../..'),WEB=path.join(ROOT,'melunga_deploy'),BASE='24e09c1';
const natives=['fr','en','es','it','zh','ja','ko'];
const files={hi:{count:4487,sha:'5c0be1bed4d66bfecd56d4cb5f320756bb770e4e871931cbaefb7d9b547479c3'},ru:{count:4488,sha:'751f8774365882775f8b2b640980c872e9a91bb9f2bf985cd568427be0253ca8'}};
const read=f=>fs.readFileSync(path.join(WEB,f)),plain=v=>JSON.parse(JSON.stringify(v));
const old=f=>execFileSync('git',['show',BASE+':melunga_deploy/'+f],{cwd:ROOT,maxBuffer:50*1024*1024});
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function fixture(baseline=false){
 const load=f=>baseline?old(f):read(f);
 const c={URL,URLSearchParams,Headers,TextDecoder,TextEncoder,AbortController,crypto:crypto.webcrypto,
  fetch:async p=>{const b=load(p);return{ok:true,arrayBuffer:async()=>Uint8Array.from(b).buffer,json:async()=>JSON.parse(b)}}};
 c.window=c;c.globalThis=c;vm.createContext(c);
 for(const f of ['course-i18n.js','course-native.js'])vm.runInContext(load(f).toString(),c);
 return c.MelungaNativeCourses;
}
test('the eight established banks, meanings, rights and original classic literals stay unchanged',()=>{
 for(const code of [...natives,'de','de-native-meanings'])assert.equal(hash(read('content/native-catalogue/'+code+'.json')),hash(old('content/native-catalogue/'+code+'.json')));
 for(const f of ['content/course-access.json','content/niveaux-progressifs/manifest.json'])assert.equal(hash(read(f)),hash(old(f)));
 const before=old('app.html').toString(),current=read('app.html').toString();
 for(const name of ['DECKS','PEDAGOGY_FAMILIES']){
  const find=s=>s.split('\n').find(line=>line.startsWith('var '+name+' = '));assert.equal(find(current),find(before));
 }
});
test('both complete imported decks keep every field, level, category and source index',()=>{
 const app=read('app.html').toString(),line=app.split('\n').find(l=>l.startsWith('var IMPORTED_DECKS = '));
 const embedded=JSON.parse(line.slice('var IMPORTED_DECKS = '.length,-1));
 const fields=['cat','cn','en','esm','frm','itm','jam','kom','lv','pf','phon','pi','ps','py','t'].sort();
 for(const [code,definition]of Object.entries(files)){
  const bytes=fs.readFileSync(path.join(ROOT,'tools/maquette-guidee/imports/'+code+'-deck-v1.json')),cards=JSON.parse(bytes),bank=JSON.parse(read('content/native-catalogue/'+code+'.json'));
  assert.equal(hash(bytes),definition.sha);assert.equal(cards.length,definition.count);assert.equal(new Set(cards.map(c=>c.t)).size,definition.count);
  assert.deepEqual(embedded[code],cards);assert.deepEqual(bank.cards,cards);
  for(const card of cards){assert.deepEqual(Object.keys(card).sort(),fields);assert(!/[A-Za-z]/.test(card.t));}
  const ids=bank.levels.flatMap(l=>[...l.themes.flatMap(t=>t.phraseIds),...l.reserveIds]);
  assert.equal(ids.length,cards.length);assert.equal(new Set(ids).size,cards.length);
  for(const level of bank.levels){assert(level.themes.length>1);for(const theme of level.themes)assert(fs.existsSync(path.join(WEB,theme.photo.asset)));}
 }
});
test('all 140 imported pair-levels preserve exact study/meaning/phonetic fields and L1 access',async()=>{
 const api=fixture();await api.ensureRights();assert.equal(api.pairIds.length,70);
 assert(!api.isPair('de-hi'));assert(!api.isPair('hi-en'));assert(!api.isPair('de-ru'));
 const meanings={fr:'frm',en:'en',es:'esm',it:'itm',zh:'cn',ja:'jam',ko:'kom'},phons={fr:'pf',en:'py',es:'ps',it:'pi',zh:'phon',ja:'py',ko:'py'};
 for(const code of Object.keys(files)){
  const cards=JSON.parse(fs.readFileSync(path.join(ROOT,'tools/maquette-guidee/imports/'+code+'-deck-v1.json')));
  for(const native of natives){const pair=native+'-'+code;const seen=new Set();
   for(let lv=1;lv<=10;lv++){
    const result=await api.loadPair(pair,lv);
    for(const model of result.sourcePhraseMap.values()){
     const index=model.source.sourceIndex,card=cards[index];assert.deepEqual(plain(model.source.originalFields),card);assert.equal(model.study,card.t);assert.equal(model.native,card[meanings[native]]);assert.equal(model.phon,card[phons[native]]);
    }
    for(const model of [...result.pair.themes.flatMap(t=>t.phrases),...result.pair.reserve]){
     assert(!seen.has(model.id));seen.add(model.id);assert.equal(model.editorialLevel,lv);assert(api.isEligible(pair,model.id));assert.equal(api.isHistoricalFree(pair,model.id),lv===1);
    }
   }
   assert.equal(seen.size,cards.length);
  }
 }
});
test('the 56 previously available pairs keep their exact source models',async()=>{
 const before=fixture(true),current=fixture();await Promise.all([before.ensureRights(),current.ensureRights()]);
 for(const pair of before.pairIds.filter(p=>!before.isReviewed(p))){
  for(let lv=1;lv<=10;lv++){
   const a=await before.loadPair(pair,lv),b=await current.loadPair(pair,lv);
   assert.equal(JSON.stringify([...a.sourcePhraseMap]),JSON.stringify([...b.sourcePhraseMap]),pair+' L'+lv+' whole source models');
   const pa=plain(a.pair),pb=plain(b.pair);delete pa.nativeCatalogueManifestSha256;delete pb.nativeCatalogueManifestSha256;
   assert.deepEqual(pb,pa,pair+' L'+lv+' themes/sequences');
  }
 }
});
test('answer normalization preserves Russian/Hindi contrasts while accepting the requested variants',()=>{
 const app=read('app.html').toString(),source=app.match(/function _norm\(s\)\{[\s\S]*?\n\}/)[0],c={};vm.runInNewContext(source,c);const n=c._norm;
 for(const [a,b]of [['ёлка','елка'],['«Привет…»','привет'],['ज़रा','जरा'],['फ़ोन','फोन'],['ड़','ड'],['हँसी','हंसी'],['आप कैसे हैं।','आप कैसे हैं'],['Été!','ete']])assert.equal(n(a),n(b));
 for(const [a,b]of [['й','и'],['ы','и'],['ख','क'],['है','हूँ'],['Привет','Пока'],['नमस्ते','पानी']])assert.notEqual(n(a),n(b));
 assert.equal(n('मैं ठीक हूँ').normalize('NFC'),n('मैं ठीक हूँ'));
});
