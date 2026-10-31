'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const ROOT=path.resolve(__dirname,'../..'),WEB=path.join(ROOT,'melunga_deploy'),BASE='17ca814';
const INPUT='tools/maquette-guidee/imports/indonesian-v1/';
const raw=p=>fs.readFileSync(path.join(ROOT,p)),read=p=>fs.readFileSync(path.join(WEB,p));
const json=p=>JSON.parse(raw(p)),plain=v=>JSON.parse(JSON.stringify(v));
const old=p=>execFileSync('git',['show',BASE+':'+p],{cwd:ROOT,maxBuffer:40e6});
const manifest=JSON.parse(read('content/native-catalogue/manifest.json'));
const original=json(INPUT+'id_deck.json'),cards=json(INPUT+'id-deck-v1.json');
const natives=['fr','en','es','it','zh','ja','ko'];
function fixture(){
 const c={URL,URLSearchParams,TextDecoder,TextEncoder,AbortController,crypto:crypto.webcrypto,
  fetch:async p=>({ok:true,arrayBuffer:async()=>Uint8Array.from(read(p)).buffer})};
 c.window=c;vm.createContext(c);
 for(const f of ['course-i18n.js','course-theme-edition.js','course-native.js'])vm.runInContext(read(f).toString(),c);
 return c.MelungaNativeCourses;
}
test('the twelve published banks, thematic editions, meanings and 128 existing pair policies stay exact',()=>{
 const before=JSON.parse(old('melunga_deploy/content/native-catalogue/manifest.json'));
 assert.equal(manifest.pairIds.length,135);assert.equal(manifest.sourceCardCount,59070);
 for(const [code,descriptor] of Object.entries(before.banks)){
  assert.deepEqual(manifest.banks[code],descriptor,code+' descriptor');
  assert(read(descriptor.path).equals(old('melunga_deploy/'+descriptor.path)),code+' whole source bank');
 }
 for(const pair of before.pairIds){assert.deepEqual(manifest.pairs[pair],before.pairs[pair]);assert.deepEqual(manifest.coverageByPair[pair],before.coverageByPair[pair]);}
 for(const [key,value] of Object.entries(before.eligibilityGroups))assert.deepEqual(manifest.eligibilityGroups[key],value);
 for(const [key,value] of Object.entries(before.historicalFreeGroups))assert.deepEqual(manifest.historicalFreeGroups[key],value);
 assert.deepEqual(manifest.themePlacementEdition,before.themePlacementEdition);
 const frozen=['content/native-catalogue/theme-placements.json','content/course-access.json','content/niveaux-progressifs/manifest.json',
  'content/native-catalogue/de-native-meanings.json',...['ru','pt','ar','hi'].map(c=>'content/native-catalogue/'+c+'-native-meanings.json')];
 for(const f of frozen)assert(read(f).equals(old('melunga_deploy/'+f)),f);
 const historical=json('tools/maquette-guidee/imports/domain-edition-v1/edition.json');
 for(const [p,sha] of Object.entries(historical.reviewedRuntimeSha256ByPath))assert.equal(crypto.createHash('sha256').update(raw(p)).digest('hex'),sha,p);
});
test('4,487 fifteen-field cards retain source text, level, category and order; every editorial change has an explicit ledger',()=>{
 assert.equal(cards.length,4487);assert.equal(new Set(cards.map(c=>c.t)).size,4487);
 const fields=['t','py','pf','ps','pi','phon','cn','en','frm','esm','itm','jam','kom','lv','cat'].sort();
 for(let i=0;i<cards.length;i++){
  assert.deepEqual(Object.keys(cards[i]).sort(),fields);
  for(const f of ['t','lv','cat'])assert.equal(cards[i][f],original[i][f]);
 }
 const changes=json(INPUT+'editorial-corrections-v1.json'),expected=structuredClone(original);
 assert.equal(changes.changes.length,191);assert.equal(new Set(changes.changes.map(c=>c.index)).size,40);
 for(const row of changes.changes){assert.equal(expected[row.index][row.field],row.before);expected[row.index][row.field]=row.after;}
 assert.deepEqual(cards,expected);
 const sample=json(INPUT+'sample-review-v1.json');assert.equal(sample.cards.length,500);
 for(let lv=1;lv<=10;lv++)assert.equal(sample.cards.filter(c=>c.level===lv).length,50);
 const placements=json(INPUT+'id-themes-v1.json');assert.equal(placements.placements.length,4487);
 assert.equal(placements.placements.filter(p=>p.domain===null).length,77);
 for(const p of placements.placements)assert.equal(p.domain===null,cards[p.index].cat==='template');
 const byIndex=new Map(placements.placements.map(p=>[p.index,p.domain]));
 for(const [index,domain] of [[741,'deplacements'],[2198,'deplacements'],[2613,'deplacements'],[4378,'deplacements'],
  [4212,'comprendre'],[4240,'conversation'],[4264,'repas'],[4465,'comprendre'],[3566,'quotidien']])assert.equal(byIndex.get(index),domain,'semantic placement '+index);
});
test('all 22,435 phonetic outputs reproduce the reviewed input map through the three supplied generators',()=>{
 const script=`import importlib.util,sys,json\nfrom pathlib import Path\np=Path(sys.argv[1])\nfor name in ['de_phon','ru_phon','id_phon']:\n s=importlib.util.spec_from_file_location(name,p/(name+'.py'));m=importlib.util.module_from_spec(s);sys.modules[name]=m;s.loader.exec_module(m)\nc=json.loads((p/'id-deck-v1.json').read_text());t=json.loads((p/'id-tr-map-v1.json').read_text())\nassert len(t)==len(c)==4487\nfor i,x in enumerate(c):\n actual=sys.modules['id_phon'].phon_all(t[x['t']])\n assert tuple(x[f] for f in ['py','pf','ps','pi','phon'])==actual,(i,x['t'])\n assert not any(mark in x[f] for f in ['py','pf','ps','pi','phon'] for mark in ['*','@'])\nprint('22435 generated outputs verified')\n`;
 assert.match(execFileSync('python3',['-I','-c',script,path.join(ROOT,INPUT)],{encoding:'utf8'}),/22435/);
});
test('all seventy supplied native/Indonesian pair-levels use exact meanings and guides and keep every template in reserve',async()=>{
 const api=fixture();await api.ensureRights();let views=0;
 for(const native of natives){
  const seen=new Set(),field=manifest.policies.meaningFields[native],phon=manifest.policies.phoneticFields[native];
  for(let level=1;level<=10;level++){
   const loaded=await api.loadPair(native+'-id',level),pair=await api.applyThemeEdition(loaded.pair,loaded);
   assert.equal(pair.totalPhrases,pair.themes.flatMap(t=>t.phrases).length);
   for(const theme of pair.themes){
    assert(!theme.isTemplateCollection);assert(theme.photo);
    if(level>=7&&theme.section==='situations')assert(theme.skillSubtitle);
    const ids=theme.phrases.map(p=>p.source.sourceIndex);assert.deepEqual(Array.from(ids),[...ids].sort((a,b)=>a-b));
    assert.deepEqual(Array.from(theme.sequences.flatMap(s=>s.phraseIds)),Array.from(theme.phrases,p=>p.id));
   }
   for(const model of [...pair.themes.flatMap(t=>t.phrases),...pair.reserve]){
    const index=model.source.sourceIndex;assert(!seen.has(index));seen.add(index);
    assert.equal(model.id,'catalogue:id:'+index);assert.equal(model.study,cards[index].t);
    assert.equal(model.native,cards[index][field]);assert.equal(model.phon,cards[index][phon]||cards[index].py);
    assert.deepEqual(plain(model.source.originalFields),cards[index]);assert.equal(model.editorialLevel,level);
    assert.equal(api.isHistoricalFree(pair.id,model.id),level===1);
    assert.equal(model.isTemplate,cards[index].cat==='template');
   }
   assert(pair.themes.every(t=>t.phrases.every(p=>!p.isTemplate)));
   assert(pair.reserve.every(p=>p.isTemplate));views++;
  }
  assert.equal(seen.size,4487);
 }
 assert.equal(views,70);
 for(const native of ['de','ru','pt','ar','hi','id'])assert.equal(api.isPair(native+'-id'),false,'no supplied meaning for '+native);
});
test('Indonesian answer comparison accepts punctuation, spaced reduplication and written 2 without changing the other languages',()=>{
 const app=read('app.html').toString(),start=app.indexOf('function indonesianAnswerWords('),end=app.indexOf('var rec=null',start);
 const c={lang:'id'};vm.createContext(c);vm.runInContext(app.slice(start,end),c);
 for(const input of ['LAKI-LAKI','laki laki','“laki2”…','laki‑laki','laki–laki']){
  assert.equal(c._norm(input),c._norm('laki-laki'));assert(c.matchPhrase(input,'laki-laki'));
  assert.equal(c._recallDiff(input,'laki-laki').pct,100,input+' correct recall feedback');
 }
 assert.equal(c._norm('anak2nya'),c._norm('anak-anaknya'));
 assert.equal(c._norm('2026'),'2026');assert.equal(c._norm('dua anak'),'duaanak');
 assert(!c.matchPhrase('selamat pagi','terima kasih'));
 for(const locale of ['fr','en','ru','ar','hi']){c.lang=locale;assert.equal(c._norm('laki2'),'laki2');}
});
test('both Indonesian WaveNet candidates are confirmed against the provider list before synthesis; absent or conflicting voices fail closed',async()=>{
 const {createHandler}=await import('../netlify/functions/tts.mjs');
 const voice=(name,gender,languageCodes=['id-ID'])=>({name,ssmlGender:gender,languageCodes});
 const event=(voice)=>({httpMethod:'GET',headers:{origin:'https://melunga.com'},queryStringParameters:{text:'Halo.',lang:'id-ID',voice}});
 for(const [rows,accepted] of [
  [[voice('id-ID-Wavenet-A','FEMALE'),voice('id-ID-Wavenet-B','MALE')],true],
  [[],false],[[voice('id-ID-Wavenet-A','MALE')],false],
  [[voice('id-ID-Wavenet-A','FEMALE',['en-US'])],false],
  [[voice('id-ID-Wavenet-A','FEMALE'),voice('id-ID-Wavenet-A','MALE')],false]]){
  const calls=[];
  const handler=createHandler({apiKey:()=> 'indonesian-test-fixture',fetchImpl:async(url,options)=>{
   calls.push({url,options});return {ok:true,json:async()=>url.endsWith('/voices')?{voices:rows}:{audioContent:'SUQ='}};
  }});
  const result=await handler(event('id-ID-Wavenet-A'));
  assert.equal(result.statusCode,accepted?200:400);
  assert.equal(calls.filter(c=>c.url.endsWith('text:synthesize')).length,accepted?1:0);
  if(accepted){
   const male=await handler(event('id-ID-Wavenet-B'));assert.equal(male.statusCode,200);
   assert.equal(calls.filter(c=>c.url.endsWith('/voices')).length,1,'fresh provider observation shared');
   const posted=JSON.parse(calls.at(-1).options.body);assert.equal(posted.voice.languageCode,'id-ID');assert.equal(posted.voice.ssmlGender,'MALE');
  }
 }
});
