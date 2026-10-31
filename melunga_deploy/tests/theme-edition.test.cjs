/* Independent receipt-to-presentation checks. No remote services are called. */
'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const ROOT=path.resolve(__dirname,'../..'),WEB=path.join(ROOT,'melunga_deploy');
const read=p=>fs.readFileSync(path.join(ROOT,p)),web=p=>fs.readFileSync(path.join(WEB,p));
const json=p=>JSON.parse(read(p)),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const manifest=JSON.parse(web('content/native-catalogue/manifest.json'));
const receipts=['L1-L3','L4-L6','L7-L10'].map(b=>json('docs/livraison-claude-2026-10-31/audit_'+b+'.json'));
const moves=new Map(receipts.flatMap(r=>r.proposals).map(r=>[r.id,r]));
const controller=web('maquette-guidee.js').toString();
const partition=vm.runInNewContext('('+controller.slice(controller.indexOf('function partitionGroupBoundaries('),controller.indexOf('  function hasVisibleSequences(')).trim()+')');
function fixture(tamper){
 const ctx={URL,URLSearchParams,TextDecoder,TextEncoder,AbortController,crypto:crypto.webcrypto,
  fetch:async file=>{let bytes=web(file);if(tamper)bytes=await tamper(file,bytes);return {ok:true,arrayBuffer:async()=>Uint8Array.from(bytes).buffer};}};
 ctx.window=ctx;vm.createContext(ctx);
 for(const file of ['course-i18n.js','course-theme-edition.js','course-native.js'])vm.runInContext(web(file).toString(),ctx);
 return ctx;
}
test('all 54,583 explicit placements match the supplied decisions; uncertain, absent, scene, template and reserve positions stay fixed',()=>{
 const baseline=json('tools/maquette-guidee/imports/domain-edition-v1/edition.json');let total=0,changed=0;
 for(const [p,hash] of Object.entries(baseline.reviewedRuntimeSha256ByPath))assert.equal(sha(read(p)),hash,p);
 for(const study of manifest.studyLanguageIds){
  const bank=JSON.parse(web(manifest.banks[study].path));assert.equal(sha(web(manifest.banks[study].path)),baseline.sourceBanks[study]);
  const source=json('tools/maquette-guidee/imports/domain-edition-v1/'+study+'-themes-v1.json');
  assert.equal(source.placements.length,bank.cards.length);
  source.placements.forEach((row,index)=>{
   const old=bank.locations[index],decision=moves.get('catalogue:'+study+':'+index);
   assert.deepEqual(row,[old[0],old[1],decision?decision.proposedTheme:old[1],...old.slice(2)]);
   if(decision){assert.equal(decision.t,bank.cards[index].t);assert.equal(decision.currentTheme,old[1]);changed++;}
   total++;
  });
 }
 assert.equal(total,54583);assert.equal(changed,10343);
 assert.equal(receipts.flatMap(r=>r.uncertain).length,4582);assert.equal(receipts.flatMap(r=>r.targetAbsent).length,775);
});
test('all 1,280 available pair-levels retain exact card/activity objects, preparations, photos and rights while applying every eligible reviewed move',async()=>{
 const ctx=fixture(),api=ctx.MelungaNativeCourses;await api.ensureRights();let cells=0,applied=0,steps=0,longThemes=0;
 for(const pairId of api.pairIds){
  const reviewed=api.isReviewed(pairId),references=reviewed?new Map(JSON.parse(web('content/niveaux-progressifs/repertoires/'+pairId+'.json')).phrases.map(p=>[p.id,p])):new Map();
  for(let level=1;level<=10;level++){
   const loaded=reviewed?{pair:JSON.parse(web('content/niveaux-progressifs/'+pairId+'/L'+level+'.json')),referenceMap:references}:await api.loadPair(pairId,level);
   const source=loaded.pair,snapshot=JSON.stringify(source),before=new Map(source.themes.flatMap(t=>t.phrases.map(p=>[p.id,{p,theme:t.id}])));
   const activity=new Map(source.themes.flatMap(t=>t.sequences.flatMap(s=>s.steps.map(step=>[step.id,step]))));
   const rights=new Map([...before.keys()].map(id=>[id,[api.isEligible(pairId,id),api.isHistoricalFree(pairId,id)]]));
   const view=await api.applyThemeEdition(source,loaded),after=new Map(view.themes.flatMap(t=>t.phrases.map(p=>[p.id,{p,theme:t.id}])));
   assert.equal(JSON.stringify(source),snapshot,pairId+' raw pair never mutated');assert.equal(after.size,before.size);
   let expectedCount=0;
   for(const [id,{p,theme}] of before){
    const decision=moves.get(id);assert.equal(after.get(id).p,p,id+' same object');
    assert.equal(after.get(id).theme,decision?decision.proposedTheme:theme,id+' placement');
    assert.deepEqual([api.isEligible(pairId,id),api.isHistoricalFree(pairId,id)],rights.get(id));
    if(decision)expectedCount++;
   }
   assert.equal(view.themePlacementEdition.appliedMoves,expectedCount);applied+=expectedCount;
   const now=view.themes.flatMap(t=>t.sequences.flatMap(s=>s.steps));assert.equal(now.length,activity.size);
   for(const step of now)assert.equal(step,activity.get(step.id),step.id+' unchanged activity');
   for(const t of view.themes){
    const old=source.themes.find(x=>x.id===t.id);
    if(old){for(const key of Object.keys(old).filter(k=>/photo|image|illustration/i.test(k)))assert.equal(t[key],old[key]);}
    if(t.id.includes('-situation-')||t.isTemplateCollection)assert.equal(t,old,'protected parent unchanged');
    for(const seq of t.sequences){
     const ids=new Set(seq.steps.map(s=>s.id));
     for(const step of seq.steps)for(const dependency of Object.values(step.preparedInSteps||{}))assert(ids.has(dependency),step.id+' prerequisite retained in group');
     if(t.themePlacementEdition)assert(seq.phraseIds.length<=5);
    }
    if(t.themePlacementEdition){
     const types=new Set(t.sequences.flatMap(s=>s.phraseIds).map(id=>after.get(id)?.p?.contentType||references.get(id)?.contentType||loaded.sourcePhraseMap?.get(id)?.contentType));
     assert.equal(t.contentType,types.size===1?[...types][0]:'mixed');
     const models=t.sequences.flatMap(s=>s.phraseIds).map(id=>after.get(id)?.p||references.get(id)||loaded.sourcePhraseMap?.get(id));
     assert.equal(t.pedagogicalConceptCount,new Set(models.map(p=>p.lexicalConceptId||JSON.stringify([p.study,p.native]))).size);
     const retained=(old?.phrases||[]).filter(p=>!moves.has(p.id)).map(p=>p.id);
     const incoming=t.phrases.filter(p=>moves.has(p.id)).map(p=>p.source.sourceIndex);
     assert.deepEqual(Array.from(t.phrases.slice(0,retained.length),p=>p.id),Array.from(retained));
     assert.deepEqual(Array.from(incoming),[...incoming].sort((a,b)=>a-b));
    }
    if(t.presentedCount>100){
     const boundaries=partition(Array.from(t.sequences,s=>s.phraseIds.length));
     assert(boundaries.every(b=>b.cards>=30&&b.cards<=40),pairId+' '+level+' '+t.id+' stages');
     assert.equal(boundaries.reduce((n,b)=>n+b.cards,0),t.sequences.reduce((n,s)=>n+s.phraseIds.length,0));longThemes++;
    }
   }
   assert.equal(view.reserve,source.reserve);assert.equal(view.heldThemes,source.heldThemes);
   assert.equal(await api.applyThemeEdition(view),view,'idempotent');cells++;steps+=now.length;
  }
 }
 assert.equal(cells,1280);assert(applied>90000);assert(steps>1e6);
 console.log(JSON.stringify({pairLevels:cells,eligiblePresentationMoves:applied,unchangedPracticeSteps:steps,longThemesPartitioned:longThemes}));
});
test('the 31 previously corrected presentations are kept when their topic changes',async()=>{
 const api=fixture().MelungaNativeCourses;await api.ensureRights();
 const rows=json('docs/repartition-themes-l1-l10/compatibilite-presentations.json');
 const list=Array.isArray(rows)?rows:rows.differences;
 assert.equal(list.length,31);
 for(const row of list){
  const pair=JSON.parse(read(row.reviewedSourcePath));
  const referenceMap=new Map(JSON.parse(web('content/niveaux-progressifs/repertoires/'+pair.id+'.json')).phrases.map(p=>[p.id,p]));
  const view=await api.applyThemeEdition(pair,{referenceMap});
  const theme=view.themes.find(t=>t.phrases.some(p=>p.id===row.id));
  assert.equal(theme.id,row.proposedTheme);assert.equal(theme.phrases.find(p=>p.id===row.id).study,row.publishedStudy);
 }
});
test('corrupt edition bytes and aborted callers fail without installing an older presentation',async()=>{
 const api=fixture((file,bytes)=>file.endsWith('theme-placements.json')?Buffer.concat([bytes,Buffer.from(' ')]):bytes).MelungaNativeCourses;
 const loaded=await api.loadPair('hi-pt',6);await assert.rejects(()=>api.applyThemeEdition(loaded.pair),/fingerprint/);
 const clean=fixture().MelungaNativeCourses,other=await clean.loadPair('hi-pt',6),abort=new AbortController();abort.abort();
 await assert.rejects(()=>clean.applyThemeEdition(other.pair,{signal:abort.signal}),{name:'AbortError'});
});
test('one aborted caller cannot cancel a shared verified edition load for the next selection',async()=>{
 let release,started;const gate=new Promise(r=>release=r),begun=new Promise(r=>started=r);
 const api=fixture(async(file,bytes)=>{if(file.endsWith('theme-placements.json')){started();await gate;}return bytes;}).MelungaNativeCourses;
 const first=await api.loadPair('fr-hi',6),second=await api.loadPair('fr-pt',6),abort=new AbortController();
 const pending=api.applyThemeEdition(first.pair,{signal:abort.signal});await begun;
 const next=api.applyThemeEdition(second.pair);abort.abort();release();
 await assert.rejects(()=>pending,{name:'AbortError'});assert.equal((await next).id,'fr-pt');
});
