/* Reproduce both counting conventions and prove full per-index free-rights equality.
 * Node built-ins only. Reads the actual historical and candidate JS functions.
 * Usage: node this-file.cjs --repo /path/to/repo [--historical bb9f904] [--output /tmp/report.json]
 * Does not change a repository or evaluate the whole application.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const args=process.argv.slice(2);
function arg(name,fallback){const i=args.indexOf(name);return i<0?fallback:args[i+1];}
const repo=path.resolve(arg('--repo',process.cwd()));
const baseline=arg('--historical','bb9f904d79afff6efee19a80e7fe80980c733514');
const historical=execFileSync('git',['show',baseline+':melunga_deploy/app.html'],{cwd:repo,encoding:'utf8',maxBuffer:32*1024*1024});
const candidate=fs.readFileSync(path.join(repo,'melunga_deploy/app.html'),'utf8');
function literal(source,name){const row=source.split('\n').find(l=>new RegExp('^var\\s+'+name+'\\s*=').test(l));assert(row,'Missing '+name);return JSON.parse(row.slice(row.indexOf('=')+1).trim().replace(/;$/,''));}
function fn(source,name){
 const start=source.search(new RegExp('^function '+name+'\\(', 'm'));assert(start>=0,'Missing function '+name);
 const rest=source.slice(start),first=rest.slice(0,rest.indexOf('\n'));
 if(first.endsWith('}'))return first;
 const end=rest.search(/^\}/m);assert(end>=0,'Unterminated '+name);return rest.slice(0,end+1);
}
const decks=literal(historical,'DECKS'),families=literal(historical,'PEDAGOGY_FAMILIES');
assert.deepEqual(literal(candidate,'DECKS'),decks,'All catalogue card contents, phonetics, levels and indices remain unchanged');
const sourceHeader='var DECKS='+JSON.stringify(decks)+';\nvar PEDAGOGY_FAMILIES='+JSON.stringify(families)+';\n';
const sourcing=historical.split('\n').find(l=>l.startsWith('var SOURCING_TH='));assert(sourcing);
const oldCode=sourceHeader+sourcing+'\nvar FREE_LV=[1];\n'+['isFreeCard','sourcingRelevant','activeDeck','guidedActiveDeck','guidedPool'].map(n=>fn(historical,n)).join('\n');
const newCode=sourceHeader+'var FREE_LV=[1];\n'+['isFreeCard','isLegacyFreeCard'].map(n=>fn(candidate,n)).join('\n');
const manifest=JSON.parse(fs.readFileSync(path.join(repo,'melunga_deploy/content/curriculum-legacy-free.json'),'utf8'));
const js=fs.readFileSync(path.join(repo,'melunga_deploy/curriculum-legacy-free.js'),'utf8');
const pairs=['fr-en','fr-es','fr-it','fr-zh','fr-ja','fr-ko','zh-fr'];
const reportedClaude={'fr-en':342,'fr-es':301,'fr-it':345,'fr-zh':331,'fr-ja':299,'fr-ko':283,'zh-fr':309};
const knownOldVisible={'fr-en':342,'fr-es':300,'fr-it':347,'fr-zh':331,'fr-ja':305,'fr-ko':284,'zh-fr':309};
const knownRawRights={'fr-en':342,'fr-es':301,'fr-it':350,'fr-zh':331,'fr-ja':308,'fr-ko':287,'zh-fr':309};
const report={version:1,executedAt:new Date().toISOString(),historicalCommit:baseline,catalogueEntries:Object.values(decks).reduce((n,d)=>n+d.length,0),convention:'F = all raw catalogue lv1 indices UNION resolved historical guided L1 indices; no topic filter and no text deduplication.',historicalVisibleConvention:'activeDeck().filter(isFreeCard) catalogue indices UNION resolved guided L1 indices.',conventionReproducingClaude:'unique t strings in F (before activeDeck topic filtering).',scope:'Catalogue rights only; conversation variants and café scenes are separate unchanged access grants.',pairs:[],outsideActivePairs:[],totals:{historicalVisible:0,rawIndexRights:0,rawUniqueTexts:0,lost:0,new:0}};
function context(native,study,code){const ctx=vm.createContext({nat:native,lang:study});ctx.window=ctx;vm.runInContext(code,ctx);return ctx;}
function normal(value){return JSON.parse(JSON.stringify(value));}
for(const id of pairs){
 const [native,study]=id.split('-');const old=context(native,study,oldCode),now=context(native,study,newCode+js);
 const before=normal(vm.runInContext(`(()=>{const d=DECKS[lang],raw=d.map((c,i)=>isFreeCard(c)?i:-1).filter(i=>i>=0),visible=activeDeck().filter(isFreeCard).map(c=>d.indexOf(c)),refs=guidedPool(guidedActiveDeck()).filter(c=>c._path.pathLv===1),guided=refs.map(c=>{delete c._path;const i=d.findIndex(x=>JSON.stringify(x)===JSON.stringify(c));if(i<0)throw Error('Guided clone does not resolve');return i;});const F=Array.from(new Set(raw.concat(guided))).sort((a,b)=>a-b);return {raw,visible,guided,F,visibleF:Array.from(new Set(visible.concat(guided))).sort((a,b)=>a-b),uniqueTexts:Array.from(new Set(F.map(i=>d[i].t)))};})()`,old));
 const after=normal(vm.runInContext('DECKS[lang].map((c,i)=>isFreeCard(c)?i:-1).filter(i=>i>=0)',now));
 const b=new Set(before.F),a=new Set(after),lost=before.F.filter(i=>!a.has(i)),added=after.filter(i=>!b.has(i));
 assert.deepEqual(lost,[],id+' loses a historical free card');assert.deepEqual(added,[],id+' grants a previously non-free card');
 assert.deepEqual(after,before.F,id+' exact full-rights index equality');
 const pin=manifest.pairs.find(p=>p.id===id);assert(pin,id+' manifest missing');assert.deepEqual(before.visibleF,pin.catalogue.sourceIndices,id+' visible rights mismatch');
 assert.equal(before.visibleF.length,knownOldVisible[id]);assert.equal(before.F.length,knownRawRights[id]);assert.equal(before.uniqueTexts.length,reportedClaude[id]);
 const hiddenRawFree=before.F.filter(i=>!before.visibleF.includes(i));
 const row={id,historicalVisibleCardIndices:before.visibleF.length,historicalRawFreeCardIndices:before.F.length,candidateRawFreeCardIndices:after.length,rawUniqueTexts:before.uniqueTexts.length,lostIndices:lost,newIndices:added,rawHistoricallyTopicFilteredButStillPredicateFree:hiddenRawFree.map(i=>({index:i,study:decks[study][i].t,lv:decks[study][i].lv,theme:decks[study][i].th})),historicalIndices:before.F,candidateIndices:after};
 report.pairs.push(row);report.totals.historicalVisible+=before.visibleF.length;report.totals.rawIndexRights+=before.F.length;report.totals.rawUniqueTexts+=before.uniqueTexts.length;report.totals.lost+=lost.length;report.totals.new+=added.length;
}
for(const native of Object.keys(decks))for(const study of Object.keys(decks)){
 const id=native+'-'+study;if(native===study||pairs.includes(id))continue;
 const now=context(native,study,newCode+js);
 const unexpected=normal(vm.runInContext('DECKS[lang].map((c,i)=>isFreeCard(c)!==(c.lv===1)?i:-1).filter(i=>i>=0)',now));
 assert.deepEqual(unexpected,[],id+' unexpected predicate extension outside seven active pairs');report.outsideActivePairs.push({id,changedPredicateIndices:unexpected});
}
assert.equal(report.totals.historicalVisible,2218);assert.equal(report.totals.rawIndexRights,2228);assert.equal(report.totals.rawUniqueTexts,2210);assert.equal(report.catalogueEntries,32115);
const output=arg('--output');if(output)fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({ok:true,catalogueEntries:report.catalogueEntries,pairs:report.pairs.map(p=>({id:p.id,visible:p.historicalVisibleCardIndices,fullRights:p.historicalRawFreeCardIndices,uniqueTexts:p.rawUniqueTexts,lost:p.lostIndices.length,new:p.newIndices.length})),totals:report.totals,unmodifiedOutsidePairs:report.outsideActivePairs.length}));
