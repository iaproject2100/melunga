/* Independent proof and browser checks of lot4 phonetics and separate certain
 * content transactions. No generator is imported. Reverse projection follows
 * content -> lot4 phonetics -> the served 606592c edition. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const {isDeepStrictEqual}=require('node:util');
const ROOT=path.resolve(__dirname,'..','..'),WEB=path.join(ROOT,'melunga_deploy');
const BASELINE='606592ccf11886810a6bb9fbabc56728cf5055c9';
const LOT3={registryPath:'docs/niveaux-progressifs/corrections-phonetiques/lot3/revue-claude-lot3.json',registrySha256:'20ad657496a94a036c8e6aa74088f172ddc8c4ebb7eacb074f2133fa84beb393'};
const REG_A='docs/niveaux-progressifs/corrections-phonetiques/lot4/revue-claude-lot4.json';
const REG_B='docs/niveaux-progressifs/corrections-contenu/lot3-lot4/revue-contenu-lot3-lot4.json';
const COMMIT4='7631c0fe64170f952e086487462e94c87bfb13e1';
const COMMIT3='c849bf3d13d4141eae8b34f8cc5d3d43167bec60';
const PROOFS={
 'docs/revue-integrale/lot4-zh-fr-L1-L10/registre-phonetique.json':{gitCommit:COMMIT4,sha256:'15237777a65b287a4008d53167b458dde2e486af27deafb31698e91c99ff5167',kind:'phon',pair:'zh-fr'},
 'docs/revue-integrale/lot3-fr-zh-L3-L10/lot-contenu-gloses.json':{gitCommit:COMMIT3,sha256:'b78984789b573c89d1cb0a755cc14a097a331927c3143b38fcbabaf4207a3367',kind:'content',pair:'fr-zh'},
 'docs/revue-integrale/lot4-zh-fr-L1-L10/lot-contenu-gloses.json':{gitCommit:COMMIT4,sha256:'2a9fb36c77f2749d646faac352fe527d7c9df3d922b1e1c6baccca4d970f2ba6',kind:'content',pair:'zh-fr'}
};
const SPEC={
 A:{path:REG_A,id:'revue-claude-lot4-phonetique',annotation:'lot4PhoneticCorrection',manifest:'lot4PhoneticCorrections',count:259,events:259,approved:259,changed:259,objects:275,profiles:{canonical:257,'transport-phrase':15,'received-model':3}},
 B:{path:REG_B,id:'revue-contenu-lot3-lot4',annotation:'reviewedContentCorrection',manifest:'reviewedContentCorrections',count:35,events:35,approved:40,changed:39,objects:36,profiles:{canonical:34,'transport-phrase':1,'received-model':1}}
};
const clone=value=>JSON.parse(JSON.stringify(value));
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const read=filename=>JSON.parse(fs.readFileSync(path.join(ROOT,filename),'utf8'));
const key=(pair,id)=>pair+'\0'+id;
const at=(document,location)=>location.reduce((value,part)=>value[part],document);
const baselines=new Map();
function baseline(filename){
 if(!baselines.has(filename))baselines.set(filename,JSON.parse(execFileSync('git',['show',BASELINE+':'+filename],{cwd:ROOT,encoding:'utf8',maxBuffer:32*1024*1024})));
 return baselines.get(filename);
}
function beforeProfile(phrase){
 const result={study:phrase.study,native:phrase.native,phon:phrase.phon,source:phrase.source,
  readingPresent:Object.hasOwn(phrase,'reading'),reading:phrase.reading??null,
  phoneticReviewStatusPresent:Object.hasOwn(phrase,'phoneticReviewStatus'),phoneticReviewStatus:phrase.phoneticReviewStatus??null};
 for(const field of ['phoneticCorrection','reviewedFieldCorrection','lot4PhoneticCorrection']){
  result[field+'Present']=Object.hasOwn(phrase,field);result[field]=phrase[field]??null;
 }
 return result;
}
let cached;
function proofSelection(descriptor,which){
 const pin=PROOFS[descriptor.gitPath];assert.ok(pin,'only independently pinned proof files');
 assert.equal(descriptor.gitCommit,pin.gitCommit);assert.equal(descriptor.sha256,pin.sha256);
 assert.equal(pin.kind,which==='A'?'phon':'content');
 assert.ok(descriptor.path.startsWith(which==='A'?'docs/niveaux-progressifs/corrections-phonetiques/lot4/':'docs/niveaux-progressifs/corrections-contenu/lot3-lot4/'));
 const file=path.resolve(ROOT,descriptor.path);assert.ok(file.startsWith(ROOT+path.sep));
 const bytes=fs.readFileSync(file);assert.equal(hash(bytes),pin.sha256,'exact frozen local proof');
 const git=execFileSync('git',['show',pin.gitCommit+':'+descriptor.gitPath],{cwd:ROOT,maxBuffer:32*1024*1024});
 assert.ok(bytes.equals(git),'proof bytes agree with the actual pinned Git object');
 const data=JSON.parse(bytes),selected=[];
 if(which==='A'){
  assert.equal(data.baseSnapshotCommit,BASELINE);assert.equal(data.events.length,259);
  data.events.forEach((event,index)=>selected.push({event,index,collection:'events',pair:event.pair,
   fields:{phon:{before:event.beforePhon,after:event.afterPhon}},atomic:false,rules:event.rules}));
 }else{
  assert.ok(['3df885df8db00f0bdc2a703b92bd17801accabce',BASELINE].includes(data.reference));
  data.items.forEach((event,index)=>{if(event.certainty==='certain'){
   assert.equal(event.field,'native','only explicitly certain standalone gloss fields');
   selected.push({event,index,collection:'items',pair:pin.pair,fields:{native:{before:event.before,after:event.after}},atomic:false,rules:[]});
  }});
  for(const [index,event]of (data.linkedBundles||[]).entries())if(event.certainty==='certain'){
   assert.equal(event.applyTogether,true,'linked source requires whole transaction');
   assert.deepEqual(Object.keys(event.before).sort(),Object.keys(event.after).sort());
   selected.push({event,index,collection:'linkedBundles',pair:pin.pair,
    fields:Object.fromEntries(Object.keys(event.before).map(field=>[field,{before:event.before[field],after:event.after[field]}])),atomic:true,rules:[]});
  }
 }
 return selected.map(row=>({...row,descriptor}));
}
function annotationFor(which,entry,before,audit){
 const fields=Object.keys(entry.fields).sort();
 return {id:entry.id,registryPath:SPEC[which].path,registrySha256:audit.registrySha256,
  baseSnapshotCommit:BASELINE,fields,beforeFields:Object.fromEntries(fields.map(field=>[field,entry.fields[field].before])),
  originalPhoneticReviewStatusPresent:before.phoneticReviewStatusPresent,
  originalPhoneticReviewStatus:before.phoneticReviewStatusPresent?before.phoneticReviewStatus:null,
  evidenceCommits:[...new Set(audit.registry.evidenceFiles.map(file=>file.gitCommit))].sort()};
}
function statusFor(which,entry,before){
 if(!entry.fields.phon||entry.fields.phon.before===entry.fields.phon.after)return before.phoneticReviewStatus;
 return which==='A'?'corrected-by-Claude-lot4-'+entry.rules.join('+'):'corrected-by-Claude-content-lot3-lot4';
}
function applyAForProof(pair,phrase,audit){
 const entry=audit.entries.get(key(pair,phrase.id));if(!entry)return clone(phrase);
 const before=beforeProfile(phrase),copy=clone(phrase);
 for(const [field,event]of Object.entries(entry.fields))copy[field]=event.after;
 copy.phoneticReviewStatus=statusFor('A',entry,before);
 copy[SPEC.A.annotation]=annotationFor('A',entry,before,audit);return copy;
}
function loadBatch(which,override,previous){
 const spec=SPEC[which],raw=fs.readFileSync(path.join(ROOT,spec.path)),registry=override||JSON.parse(raw);
 assert.equal(registry.version,1);assert.equal(registry.id,spec.id);assert.equal(registry.baseSnapshotCommit,BASELINE);
 assert.equal(registry.correctionCount,spec.count);assert.equal(registry.eventCount,spec.events);
 assert.equal(registry.approvedFieldCount,spec.approved);assert.equal(registry.changedFieldCount,spec.changed);
 const expectedPrevious=which==='A'?LOT3:{registryPath:REG_A,registrySha256:previous.registrySha256};
 assert.deepEqual(registry.appliesAfter,[expectedPrevious]);
 assert.equal(hash(fs.readFileSync(path.join(ROOT,expectedPrevious.registryPath))),expectedPrevious.registrySha256,'prior registry remains unchanged');
 assert.equal(registry.evidenceFiles.length,which==='A'?1:2);
 const approved=new Map(),proofByPath=new Map();
 for(const descriptor of registry.evidenceFiles){
  assert.ok(!proofByPath.has(descriptor.path),'unique proof');proofByPath.set(descriptor.path,descriptor);
  for(const event of proofSelection(descriptor,which)){
   const id=key(event.pair,event.event.id);assert.ok(!approved.has(id),'one frozen transaction per identity');approved.set(id,event);
  }
 }
 assert.equal(approved.size,spec.count);
 const entries=new Map(),addresses=new Set(),profiles={canonical:0,'transport-phrase':0,'received-model':0};
 let objects=0,approvedFields=0,changedFields=0;
 const audit={registry,registrySha256:hash(raw),entries,approved,proofByPath};
 for(const entry of registry.corrections){
  const id=key(entry.pairId,entry.id);assert.ok(!entries.has(id),'one final transaction per identity');
  const proof=approved.get(id);assert.ok(proof,'entry is authorized by frozen selected evidence');
  assert.deepEqual(entry.fields,proof.fields,'whole fields exactly match source event');
  assert.deepEqual(entry.rules,proof.rules);assert.equal(entry.atomicBundle,proof.atomic);
  assert.deepEqual(entry.events,[{evidencePath:proof.descriptor.path,evidenceCollection:proof.collection,evidenceIndex:proof.index}]);
  assert.ok(entry.occurrences.length,'every reviewed entry has source locations');
  entries.set(id,entry);approvedFields+=Object.keys(entry.fields).length;
  changedFields+=Object.values(entry.fields).filter(field=>field.before!==field.after).length;
  for(const occurrence of entry.occurrences){
   assert.match(occurrence.path,/^melunga_deploy\/content\/niveaux-progressifs\/(?:[a-z]{2}-[a-z]{2}\/L(?:10|[1-9])|repertoires\/[a-z]{2}-[a-z]{2})\.json$/);
   assert.ok(Object.hasOwn(profiles,occurrence.profile));
   const address=occurrence.path+'\0'+JSON.stringify(occurrence.location);assert.ok(!addresses.has(address));addresses.add(address);
   const original=at(baseline(occurrence.path),occurrence.location);assert.equal(original.id,entry.id);
   const before=which==='B'?applyAForProof(entry.pairId,original,previous):original;
   assert.deepEqual(occurrence.expectedBefore,beforeProfile(before),'full before profile is pinned baseline or its declared predecessor');
   for(const [field,event]of Object.entries(entry.fields))assert.equal(before[field],event.before,'before exact for each approved field');
   if(proof.collection==='events'){
    assert.equal(original.study,proof.event.study);assert.equal(original.native,proof.event.native);
    assert.equal(original.phoneticCorrection,undefined);assert.equal(original.reviewedFieldCorrection,undefined);
   }else if(proof.collection==='items')assert.equal(original.study,proof.event.study);
   profiles[occurrence.profile]++;objects++;
  }
 }
 assert.equal(entries.size,spec.count);assert.equal(objects,spec.objects);assert.deepEqual(profiles,spec.profiles);
 assert.equal(approvedFields,spec.approved);assert.equal(changedFields,spec.changed);
 if(which==='B'){
  assert.deepEqual(Object.keys(entries.get(key('fr-zh','catalogue:zh:1900')).fields).sort(),['native','phon','reading','study']);
  const bundle=entries.get(key('zh-fr','catalogue:fr:757'));assert.deepEqual(Object.keys(bundle.fields).sort(),['native','phon','study']);
  assert.equal(bundle.fields.native.before,bundle.fields.native.after,'unchanged native guard is part of the whole 757 bundle');
 }
 return {...audit,profiles,objects};
}
function loadRegistries(overrides){
 if(!overrides&&cached)return cached;
 const A=loadBatch('A',overrides?.A),B=loadBatch('B',overrides?.B,A),result={A,B};
 if(!overrides)cached=result;return result;
}
function projectStage(which,pair,phrase,expectedBefore){
 const audit=loadRegistries()[which],spec=SPEC[which],entry=audit.entries.get(key(pair,phrase.id));
 if(!entry){assert.equal(phrase[spec.annotation],undefined,'no stray transaction annotation');return phrase;}
 const copy=clone(phrase),annotation=copy[spec.annotation];assert.ok(annotation&&typeof annotation==='object','reviewed transaction annotation required');
 for(const [field,event]of Object.entries(entry.fields))copy[field]=event.before;
 delete copy[spec.annotation];
 let before;
 for(const occurrence of entry.occurrences){
  const candidate=occurrence.expectedBefore;
  if(annotation.originalPhoneticReviewStatusPresent!==candidate.phoneticReviewStatusPresent
   || !isDeepStrictEqual(annotation.originalPhoneticReviewStatus,candidate.phoneticReviewStatus))continue;
  const changedPhon=entry.fields.phon&&entry.fields.phon.before!==entry.fields.phon.after;
  if(changedPhon){if(candidate.phoneticReviewStatusPresent)copy.phoneticReviewStatus=candidate.phoneticReviewStatus;else delete copy.phoneticReviewStatus;}
  if(isDeepStrictEqual(beforeProfile(copy),candidate)){before=candidate;break;}
 }
 assert.ok(before,'whole before/source/earlier annotations match the evidence');
 if(expectedBefore)assert.deepEqual(before,expectedBefore);
 assert.deepEqual(annotation,annotationFor(which,entry,before,audit),'exact transaction annotation');
 for(const [field,event]of Object.entries(entry.fields))assert.equal(phrase[field],event.after,'entire approved after field');
 const changedPhon=entry.fields.phon&&entry.fields.phon.before!==entry.fields.phon.after;
 assert.equal(Object.hasOwn(phrase,'phoneticReviewStatus'),changedPhon?true:before.phoneticReviewStatusPresent);
 if(changedPhon||before.phoneticReviewStatusPresent)assert.equal(phrase.phoneticReviewStatus,statusFor(which,entry,before));
 return copy;
}
function verifyPhrase(pair,phrase){projectBefore(pair,phrase);return phrase;}
function projectBefore(pair,phrase){return projectStage('A',pair,projectStage('B',pair,phrase));}
function projectDocument(pair,document,isBank){
 const copy=clone(document);
 if(isBank){for(const field of ['phrases','receivedModels'])copy[field]=(copy[field]||[]).map(phrase=>projectBefore(pair,phrase));}
 else{
  for(const field of ['themes','heldThemes'])for(const theme of copy[field]||[])theme.phrases=theme.phrases.map(phrase=>projectBefore(pair,phrase));
  copy.reserve=(copy.reserve||[]).map(phrase=>projectBefore(pair,phrase));
 }
 return copy;
}
function declaration(which,audit=loadRegistries()[which]){
 const registry=audit.registry;
 return {registryPath:SPEC[which].path,registrySha256:audit.registrySha256,baseSnapshotCommit:BASELINE,
  appliesAfter:registry.appliesAfter,correctionCount:registry.correctionCount,eventCount:registry.eventCount,
  approvedFieldCount:registry.approvedFieldCount,changedFieldCount:registry.changedFieldCount,
  evidenceCommits:[...new Set(registry.evidenceFiles.map(file=>file.gitCommit))].sort()};
}
function manifestDeclarations(){return Object.fromEntries(['A','B'].map(which=>[SPEC[which].manifest,declaration(which)]));}
function inputFiles(){
 const audits=loadRegistries();return [__filename,...['A','B'].flatMap(which=>[path.join(ROOT,SPEC[which].path),...audits[which].registry.evidenceFiles.map(file=>path.join(ROOT,file.path))])];
}
function auditRuntime(){
 const audits=loadRegistries(),manifestPath='melunga_deploy/content/niveaux-progressifs/manifest.json',manifest=read(manifestPath),old=baseline(manifestPath);
 const files=old.pairs.flatMap(pair=>[pair.repertoirePath,...pair.levels.map(level=>level.dataPath)]).map(file=>'melunga_deploy/'+file);assert.equal(files.length,77);
 const stats={};
 for(const which of ['A','B']){
  const audit=audits[which];let approvedFields=0,changedFields=0;
  for(const entry of audit.registry.corrections){
   const copies=[];
   for(const occurrence of entry.occurrences){
    const phrase=at(read(occurrence.path),occurrence.location);verifyPhrase(entry.pairId,phrase);
    assert.deepEqual(projectBefore(entry.pairId,phrase),at(baseline(occurrence.path),occurrence.location),'complete tuple, source, role and metadata conserved');
    copies.push(phrase);approvedFields+=Object.keys(entry.fields).length;changedFields+=Object.values(entry.fields).filter(event=>event.before!==event.after).length;
   }
   for(const copy of copies)for(const field of ['study','native','phon','reading'])assert.equal(copy[field],copies[0][field],'every transport and received copy uses the same final edition');
  }
  stats[which]={identities:audit.entries.size,events:audit.registry.eventCount,objects:audit.objects,profiles:audit.profiles,approvedFields,changedFields};
 }
 for(const file of files){const document=read(file),pair=document.pairId||document.id;assert.deepEqual(projectDocument(pair,document,file.includes('/repertoires/')),baseline(file),'no undeclared runtime change: '+file);}
 const expected=clone(old);Object.assign(expected,manifestDeclarations());
 for(const pair of expected.pairs)pair.repertoireSha256=hash(fs.readFileSync(path.join(WEB,pair.repertoirePath)));
 assert.deepEqual(manifest,expected,'manifest only adds two declarations and actual bank hashes');
 for(const filename of ['app.html','maquette-guidee.js','maquette-guidee.css','parcours-niveaux.html','maquette-guidee.html']){
  assert.ok(fs.readFileSync(path.join(WEB,filename)).equals(execFileSync('git',['show',BASELINE+':melunga_deploy/'+filename],{cwd:ROOT,maxBuffer:32*1024*1024})),'application/UI unchanged: '+filename);
 }
 assert.equal(stats.A.changedFields,275);assert.equal(stats.B.approvedFields,41);assert.equal(stats.B.changedFields,40);
 return {phonetic:stats.A,content:stats.B,files:77,approvedRuntimeFields:316,changedRuntimeFields:315};
}
module.exports={loadRegistries,verifyPhrase,projectBefore,projectDocument,manifestDeclarations,declaration,auditRuntime,inputFiles,baseline,beforeProfile,projectStage};

if(require.main===module){
 const {test,before,after}=require('node:test'),http=require('node:http'),{chromium}=require('playwright-core');
 let server,browser,base;const errors=[],requests=[],snapshots=new Map();
 before(async()=>{
  const files=inputFiles(),manifest=read('melunga_deploy/content/niveaux-progressifs/manifest.json');files.push(path.join(WEB,'content/niveaux-progressifs/manifest.json'));
  for(const pair of manifest.pairs)files.push(path.join(WEB,pair.repertoirePath),...pair.levels.map(level=>path.join(WEB,level.dataPath)));
  for(const filename of ['app.html','maquette-guidee.js','maquette-guidee.css','parcours-niveaux.html'])files.push(path.join(WEB,filename));
  for(const file of files)snapshots.set(file,hash(fs.readFileSync(file)));
  server=http.createServer((req,res)=>{const file=path.resolve(WEB,'.'+new URL(req.url,'http://local').pathname);if(!file.startsWith(WEB+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())return res.writeHead(404).end();res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css'})[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base='http://127.0.0.1:'+server.address().port;
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 });
 after(async()=>{await browser?.close();if(server)await new Promise(resolve=>server.close(resolve));assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);for(const[file,beforeHash]of snapshots)assert.equal(hash(fs.readFileSync(file)),beforeHash,'stable test input: '+file);});
 function fixture(pairId,id,later=false,received=false){
  const pair=read('melunga_deploy/content/niveaux-progressifs/manifest.json').pairs.find(pair=>pair.id===pairId);
  for(const level of pair.levels){const data=read('melunga_deploy/'+level.dataPath);for(const[themeIndex,theme]of data.themes.entries()){
   const stepIndex=theme.sequences.flatMap(sequence=>sequence.steps).findIndex(step=>step.utterance===id&&step.kind===(received?'receive':'understand'));
   const reused=[...(theme.reviewReferences||[]),...(theme.contextReferences||[])].some(ref=>ref.id===id);
   if(stepIndex>=0&&(received||reused===later))return{pairId,id,level:level.level,themeIndex,stepIndex};
  }}throw new Error('No real active fixture '+pairId+'/'+id+'/later='+later+'/received='+received);
 }
 async function openPage(){
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  await context.addInitScript(()=>{window.__lot4Speech=[];window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},getVoices(){return[];},addEventListener(){},speak(item){window.__lot4Speech.push({text:item.text,lang:item.lang});item.onend?.();}}});});
  await context.route('**/*',async route=>{const url=new URL(route.request().url());if(url.origin!==base||/\/(?:\.netlify|api)\//.test(url.pathname)){requests.push(url.origin+url.pathname);await route.abort();}else await route.continue();});
  const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));return{context,page};
 }
 async function enter(page,target){
  await page.goto(base+'/parcours-niveaux.html?pair='+target.pairId+'&level='+target.level);
  await page.waitForFunction(target=>window.MelungaMockup?.state().screen==='themes'&&window.MelungaMockup.state().pairId===target.pairId&&window.MelungaMockup.state().level===target.level,target);
  await page.locator('#mgThemeGrid > button').nth(target.themeIndex).click();
  await page.evaluate(target=>{while(window.MelungaMockup.state().stepIndex<target.stepIndex){document.querySelector('#mgChoices:not([hidden]) button')?.click();const button=document.getElementById('mgContinue');if(button.disabled)throw new Error('Blocked lesson fixture');button.click();}},target);
  assert.equal(await page.evaluate(()=>window.MelungaMockup.state().phraseId),target.id);
 }
 function sourceFor(which,id,received=false){const entry=[...loadRegistries()[which].entries.values()].find(entry=>entry.id===id);assert.ok(entry);const occurrence=received?entry.occurrences.find(o=>o.profile==='received-model'):entry.occurrences[0];assert.ok(occurrence);return at(read(occurrence.path),occurrence.location);}
 async function checkDom(page,pair,id,which='A',received=false){
  const source=sourceFor(which,id,received);assert.equal(await page.locator('#mgPhrase').textContent(),source.study);assert.equal(await page.locator('#mgPhon').textContent(),source.phon);assert.equal(await page.locator('#mgTranslation').textContent(),source.native);assert.equal(await page.locator('#mgReading').textContent(),source.reading||'');
  await page.click('#mgEar');const spoken=await page.evaluate(()=>window.__lot4Speech.at(-1));assert.equal(spoken.text,source.study,'TTS receives the final whole studied text');assert.equal(spoken.lang.split('-')[0],pair.split('-')[1]);return source;
 }
 test('259 frozen whole aids and separate 35 content transactions retain every source, placement, role and UI file',()=>{const report=auditRuntime();assert.equal(report.changedRuntimeFields,315);});
 test('forged proof, added field, partial atomic bundle and stale final values are rejected',()=>{
  const audits=loadRegistries(),faults=[
   ['A',value=>{value.corrections[0].fields.native={before:'x',after:'y'};}],
   ['A',value=>{value.corrections[0].fields.phon.after+='wrong';}],
   ['A',value=>{value.evidenceFiles[0].sha256='0'.repeat(64);}],
   ['A',value=>{value.corrections[0].occurrences[0].expectedBefore.source.collection='fake';}],
   ['A',value=>{value.corrections[0].rules=['auto'];}],
   ['B',value=>{value.corrections.find(entry=>entry.id==='catalogue:fr:757').atomicBundle=false;}],
   ['B',value=>{delete value.corrections.find(entry=>entry.id==='catalogue:zh:1900').fields.reading;}],
   ['B',value=>{delete value.corrections.find(entry=>entry.id==='catalogue:fr:757').fields.phon;}],
   ['B',value=>{value.corrections.find(entry=>entry.id==='catalogue:fr:757').fields.native.after+='wrong';}],
   ['B',value=>{value.corrections[0].events[0].evidenceCollection='unapproved';}],
   ['B',value=>{value.appliesAfter[0].registrySha256='0'.repeat(64);}]
  ];
  for(const[which,mutate]of faults){const changed=clone(audits[which].registry);mutate(changed);assert.throws(()=>loadRegistries({[which]:changed}));}
  const specimens=[
   ['A',audits.A.registry.corrections[0].id,value=>{value.phon+='wrong';}],
   ['A',audits.A.registry.corrections[0].id,value=>{delete value.lot4PhoneticCorrection;}],
   ['A',audits.A.registry.corrections[0].id,value=>{value.lot4PhoneticCorrection.registrySha256='0'.repeat(64);}],
   ['A',audits.A.registry.corrections[0].id,value=>{value.source.sourceSha256='0'.repeat(64);}],
   ['B','catalogue:fr:757',value=>{value.study='Il fait moins zéro.';}],
   ['B','catalogue:fr:757',value=>{value.phon='伊尔 费 姆万 泽罗';}],
   ['B','catalogue:zh:1900',value=>{value.reading+=' shì zhī yě';}],
   ['B','catalogue:zh:1900',value=>{value.native+='wrong';}],
   ['B','catalogue:zh:4812',value=>{delete value.reviewedFieldCorrection;}],
   ['B','catalogue:fr:2922',value=>{value.phoneticReviewStatus='native-approved';}]
  ];
  for(const[which,id,mutate]of specimens){const entry=[...audits[which].entries.values()].find(entry=>entry.id===id),bad=clone(sourceFor(which,id));mutate(bad);assert.throws(()=>verifyPhrase(entry.pairId,bad));}
  const received=[...audits.A.entries.values()].find(entry=>entry.occurrences.some(o=>o.profile==='received-model'));
  const occurrence=received.occurrences.find(o=>o.profile==='received-model'),bad=clone(at(read(occurrence.path),occurrence.location));bad.heardOnly=false;
  assert.throws(()=>assert.deepEqual(projectBefore(received.pairId,bad),at(baseline(occurrence.path),occurrence.location)),'received role cannot be reassigned');
  assert.equal(faults.length+specimens.length+1,22);
 });
 test('truncated aid, obligatory liaison, feminine form and French bus/acronym aid display their whole final source',async()=>{
  const{context,page}=await openPage();try{
   const entries=loadRegistries().A.registry.corrections;
   for(const rule of ['T','L','G','A']){
    const entry=entries.find(entry=>entry.rules.includes(rule)&&entry.occurrences.some(o=>o.profile==='canonical'&&o.location[0]!=='reserve'));
    assert.ok(entry,'active source for rule '+rule);await enter(page,fixture(entry.pairId,entry.id));await checkDom(page,entry.pairId,entry.id);
   }
  }finally{await context.close();}
 });
 test('canonical and later review copy share the corrected edition; heard models stay outside production',async()=>{
  const{context,page}=await openPage();try{
   const entries=loadRegistries().A.registry.corrections;
   const revision=entries.find(entry=>entry.occurrences.some(o=>o.profile==='transport-phrase'));
   for(const later of [false,true]){await enter(page,fixture(revision.pairId,revision.id,later));await checkDom(page,revision.pairId,revision.id);}
   const received=entries.find(entry=>entry.occurrences.some(o=>o.profile==='received-model'));
   await enter(page,fixture(received.pairId,received.id,false,true));const source=await checkDom(page,received.pairId,received.id,'A',true);assert.equal(source.heardOnly,true);assert.equal(source.referenceOnly,true);assert.equal(await page.evaluate(()=>window.MelungaMockup.state().masked),false);
   const target=fixture(received.pairId,received.id,false,true),data=read('melunga_deploy/content/niveaux-progressifs/'+received.pairId+'/L'+target.level+'.json');const step=data.themes[target.themeIndex].sequences.flatMap(sequence=>sequence.steps)[target.stepIndex];assert.equal(step.requiresProduction,false);assert.equal(step.countsForProgress,false);
  }finally{await context.close();}
 });
 test('757 and 1900 are served as whole transactions, including spoken study and corrected Pinyin',async()=>{
  const{context,page}=await openPage();try{
   for(const[pair,id]of [['zh-fr','catalogue:fr:757'],['fr-zh','catalogue:zh:1900']]){
    await enter(page,fixture(pair,id));const source=await checkDom(page,pair,id,'B');
    if(id==='catalogue:fr:757'){assert.equal(source.study,'Il fait en dessous de zéro.');assert.equal(source.native,'零下');assert.equal(source.phon,'伊尔 费 昂 德苏 德 泽罗');}
    else{
     assert.equal(source.study,'过而不改是谓过矣');assert.equal(source.reading,'guò ér bù gǎi shì wèi guò yǐ');
     if(!await page.locator('#mgReadingToggle').isVisible())await page.click('#mgHelp');await page.click('#mgReadingToggle');assert.equal(await page.locator('#mgPhon').textContent(),source.reading);if(await page.locator('#mgHelpPanel').isVisible())await page.click('#mgHelp');await page.click('#mgEar');assert.equal(await page.evaluate(()=>window.__lot4Speech.at(-1).text),source.study);
    }
   }
   await enter(page,fixture('zh-fr','catalogue:fr:2922'));const gloss=await checkDom(page,'zh-fr','catalogue:fr:2922','B');assert.equal(gloss.native,'请求 / 申请');
  }finally{await context.close();}
 });
 test('new complete study and longer corrected glosses fit mobile and desktop cards without scrolling or clipping',async()=>{
  const{context,page}=await openPage();try{
   for(const viewport of [{width:320,height:640},{width:1280,height:720}]){
    await page.setViewportSize(viewport);
    for(const[pair,id]of [['zh-fr','catalogue:fr:757'],['fr-zh','catalogue:zh:1900'],['fr-zh','catalogue:zh:4504']]){
     await enter(page,fixture(pair,id));await checkDom(page,pair,id,'B');
     await page.evaluate(async()=>{await document.fonts.ready;await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});
     const measured=await page.evaluate(()=>{
      const rect=node=>{const r=node.getBoundingClientRect();return{top:r.top,left:r.left,bottom:r.bottom,right:r.right,width:r.width,height:r.height};};
      const visible=node=>node&&!node.hidden&&getComputedStyle(node).display!=='none'&&node.getBoundingClientRect().width>0&&node.getBoundingClientRect().height>0;
      return{lesson:rect(document.getElementById('mgLessonView')),
       texts:['#mgPhrase','#mgPhon','#mgTranslation','#mgReading'].filter(selector=>visible(document.querySelector(selector))).map(selector=>{const node=document.querySelector(selector),range=document.createRange();range.selectNodeContents(node);return{selector,text:rect(range),element:rect(node),overflow:getComputedStyle(node).overflowY};}),
       scrollers:[document.scrollingElement,...['mgContent','mgLessonView','mgModel'].map(id=>document.getElementById(id))].map(node=>({id:node.id||node.tagName,clientHeight:node.clientHeight,scrollHeight:node.scrollHeight,clientWidth:node.clientWidth,scrollWidth:node.scrollWidth})),
       controls:['#mgEar','#mgContinue','#mgReplay'].map(selector=>({selector,visible:visible(document.querySelector(selector))}))};
     });
     for(const box of measured.scrollers){assert.ok(box.scrollHeight<=box.clientHeight+2,box.id+' has no vertical scroll');assert.ok(box.scrollWidth<=box.clientWidth+2,box.id+' has no horizontal scroll');}
     for(const text of measured.texts){assert.ok(text.text.top>=measured.lesson.top-2&&text.text.bottom<=measured.lesson.bottom+2,text.selector+' whole text is inside card');assert.ok(text.text.left>=measured.lesson.left-2&&text.text.right<=measured.lesson.right+2,text.selector+' no lateral clipping');if(text.overflow!=='visible')assert.ok(text.text.top>=text.element.top-2&&text.text.bottom<=text.element.bottom+2,text.selector+' no internal clipping');}
     for(let i=0;i<measured.texts.length;i++)for(let j=i+1;j<measured.texts.length;j++){const a=measured.texts[i].text,b=measured.texts[j].text;assert.ok(Math.min(a.right,b.right)-Math.max(a.left,b.left)<=1||Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)<=1,'source, aid and meaning do not overlap');}
     assert.ok(measured.controls.every(control=>control.visible),'study actions remain visible');
    }
   }
  }finally{await context.close();}
 });

}
