'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const ROOT=path.resolve(__dirname,'../..'),WEB=path.join(ROOT,'melunga_deploy');
const natives=['ru','pt','ar','hi'];
const read=file=>fs.readFileSync(path.join(WEB,file));
const supplied=JSON.parse(fs.readFileSync(path.join(ROOT,'tools/maquette-guidee/imports/native-meanings-ru-pt-ar-hi-v1.json')));
const manifest=JSON.parse(read('content/native-catalogue/manifest.json'));
function fixture(tamper){
 const context={URL,URLSearchParams,TextDecoder,TextEncoder,AbortController,crypto:crypto.webcrypto,
  fetch:async file=>{let bytes=read(file);if(tamper)bytes=tamper(file,bytes);return {ok:true,arrayBuffer:async()=>Uint8Array.from(bytes).buffer};}};
 context.window=context;vm.createContext(context);
 for(const file of ['course-i18n.js','course-native.js'])vm.runInContext(read(file).toString(),context);
 return context.MelungaNativeCourses;
}
test('new native meanings are supplied separately; all twelve studied banks and existing rights stay byte-exact',()=>{
 const baseline=JSON.parse(execFileSync('git',['show','08404a3:melunga_deploy/content/native-catalogue/manifest.json'],{cwd:ROOT,maxBuffer:5e6}));
 assert.equal(manifest.pairIds.length,135);assert.equal(new Set(manifest.pairIds).size,135);
 for(const [k,v] of Object.entries(baseline.banks))assert.deepEqual(manifest.banks[k],v);
 for(const [k,v] of Object.entries(baseline.eligibilityGroups))assert.deepEqual(manifest.eligibilityGroups[k],v);
 for(const [k,v] of Object.entries(baseline.historicalFreeGroups))assert.deepEqual(manifest.historicalFreeGroups[k],v);
 for(const id of baseline.pairIds){assert.deepEqual(manifest.pairs[id],baseline.pairs[id]);assert.deepEqual(manifest.coverageByPair[id],baseline.coverageByPair[id]);}
 for(const code of baseline.studyLanguageIds){const name='content/native-catalogue/'+code+'.json';
  assert(read(name).equals(execFileSync('git',['show','08404a3:melunga_deploy/'+name],{cwd:ROOT,maxBuffer:25e6})),code+' studied bank');}
 assert.equal(supplied.concepts.length,29077);
 for(const c of supplied.concepts)for(const native of natives)assert.equal(typeof c[native],'string');
});
test('all 440 new pair-levels show exact supplied native meanings and unchanged studied cards, with explicit source-guide fallback',async()=>{
 const api=fixture();await api.ensureRights();assert.equal(api.pairIds.length,135);
 for(const native of natives){
  assert(!api.isPair(native+'-'+native));
  for(const study of manifest.nativeLocaleMeanings[native].studyLanguageIds){
   const pair=native+'-'+study,bank=JSON.parse(read('content/native-catalogue/'+study+'.json'));
   assert(api.isPair(pair));const seen=new Set();
   for(let level=1;level<=10;level++){
    const loaded=await api.loadPair(pair,level);
    assert.equal(loaded.pair.nativeLanguage,native);assert.equal(loaded.pair.studyLanguage,study);
    for(const model of [...loaded.pair.themes.flatMap(t=>t.phrases),...loaded.pair.reserve]){
     assert(!seen.has(model.id));seen.add(model.id);
     const index=model.source.sourceIndex,card=bank.cards[index],concept=supplied.concepts[supplied.banks[study][index]];
     assert.equal(model.study,card.t);assert.equal(model.native,concept[native]);
     assert.equal(model.phon,card.py||'');
     assert.equal(model.phoneticMode,card.py?(study==='zh'?'pinyin-fallback':'english-fallback'):'unavailable');
     assert.equal(model.source.fieldMap.native,'nativeLocaleMeanings.'+native);
     assert.equal(model.source.nativeMeaningSource.conceptId,concept.id);
     assert.equal(api.isHistoricalFree(pair,model.id),Boolean(manifest.historicalFreeGroups[manifest.pairs[pair].historicalFreeGroup].includes(index)));
     assert(api.isEligible(pair,model.id));
     assert.equal(model.editorialLevel,level);
    }
   }
   assert.equal(seen.size,manifest.pairs[pair].eligibleCount,pair+' complete eligibility');
  }
 }
 // German -> imported targets remain unavailable: this delivery adds four native locales only.
 for(const study of ['hi','ru','pt','ar'])assert(!api.isPair('de-'+study));
});
test('altered native meaning sidecars fail integrity checking rather than falling back to another language',async()=>{
 const api=fixture((file,bytes)=>file.endsWith('ru-native-meanings.json')?Buffer.from(bytes.toString().replace('Нет.','NO.')):bytes);
 await assert.rejects(()=>api.loadPair('ru-en',1),/integrity|fingerprint|checksum|hash/i);
});
