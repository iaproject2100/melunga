/* Independent proof and browser checks of lot6 paired Korean aids/readings
 * and its separate certain glosses/bundles. No producer is imported. The private
 * reverse projection follows content -> reviewed fields -> served 161d0eb. */
'use strict';
const englishClassification = require('./english-classification.cjs');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const {isDeepStrictEqual}=require('node:util');
const lot7Corrections=require('./lot7-corrections.cjs');
const ROOT=path.resolve(__dirname,'..','..'),WEB=path.join(ROOT,'melunga_deploy');
const BASELINE='161d0ebef38bb38ea9e26a836ca701b9d136f6d2';
const COMMIT='87357b16c7d77a1c94fdbd940dcb3f232758748d';
const PREVIOUS={registryPath:'docs/niveaux-progressifs/corrections-contenu/lot5/revue-contenu-lot5.json',registrySha256:'ef394ba1007bc474ca98cc4a166cc680d185ad824c894b710656e5e60ca1758a'};
const REG_A='docs/niveaux-progressifs/corrections-phonetiques/lot6/revue-claude-lot6.json';
const REG_B='docs/niveaux-progressifs/corrections-contenu/lot6/revue-contenu-lot6.json';
const PROOFS={
 'docs/revue-integrale/lot6-fr-ko-L1-L10/registre-phonetique.json':{kind:'phon',sha256:'4c5861f15f7c77b4107c70ba3a7a2106065874ed42147f1bf428cc97e5230239'},
 'docs/revue-integrale/lot6-fr-ko-L1-L10/registre-lectures.json':{kind:'reading',sha256:'d250e9fbd5b2d5d6b27eb9469c7563fac20d6cbc12f410b28cf172b9d24f89de'},
 'docs/revue-integrale/lot6-fr-ko-L1-L10/lot-contenu-gloses.json':{kind:'content',sha256:'9a522d18d620ce38b2b462ab543a6c78179bf5b00b5989427a82c2ae6df8f73e'}
};
const SPEC={
 A:{path:REG_A,id:'revue-claude-lot6-phonetique-lectures',status:'frozen-whole-and-paired-reading-events-not-global-native-approval',annotation:'lot6FieldCorrection',manifest:'lot6FieldCorrections',count:18,events:23,fields:23,objects:18,profiles:{canonical:17,'transport-phrase':0,'received-model':1}},
 B:{path:REG_B,id:'revue-contenu-lot6',status:'frozen-certain-gloss-and-linked-bundle-events-not-global-native-approval',annotation:'lot6ContentCorrection',manifest:'lot6ContentCorrections',count:47,events:47,fields:51,objects:47,profiles:{canonical:47,'transport-phrase':0,'received-model':0}}
};
const PRIOR=['phoneticCorrection','reviewedFieldCorrection','lot4PhoneticCorrection','reviewedContentCorrection','lot5FieldCorrection','lot5ContentCorrection','lot6FieldCorrection'];
const clone=value=>JSON.parse(JSON.stringify(value));
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const read=filename=>englishClassification.beforeRead(filename,fs.readFileSync(path.join(ROOT,filename),'utf8'));
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
 for(const field of PRIOR){result[field+'Present']=Object.hasOwn(phrase,field);result[field]=phrase[field]??null;}
 return result;
}
let cached;
function proofSelection(descriptor,which){
 const pin=PROOFS[descriptor.gitPath];assert.ok(pin,'independently named frozen proof');
 assert.equal(descriptor.gitCommit,COMMIT);assert.equal(descriptor.sha256,pin.sha256);
 assert.equal(pin.kind==='content',which==='B');
 assert.ok(descriptor.path.startsWith(which==='A'?'docs/niveaux-progressifs/corrections-phonetiques/lot6/':'docs/niveaux-progressifs/corrections-contenu/lot6/'));
 const file=path.resolve(ROOT,descriptor.path);assert.ok(file.startsWith(ROOT+path.sep));
 const raw=fs.readFileSync(file);assert.equal(hash(raw),pin.sha256,'frozen proof bytes');
 const git=execFileSync('git',['show',COMMIT+':'+descriptor.gitPath],{cwd:ROOT,maxBuffer:32*1024*1024});assert.ok(raw.equals(git),'proof is the actual Git object');
 const data=JSON.parse(raw);assert.equal(data.baseSnapshotCommit||data.reference,BASELINE);
 if(which==='A'){
  assert.equal(data.eventCount,pin.kind==='phon'?18:5);assert.equal(data.events.length,data.eventCount);
  return data.events.map((event,index)=>{assert.equal(event.pair,'fr-ko');if(pin.kind==='reading'){assert.equal(event.field,'reading');assert.equal(event.linkedPhonEvent,true);}
   return{descriptor,event,index,pair:'fr-ko',collection:'events',field:pin.kind,before:pin.kind==='phon'?event.beforePhon:event.beforeReading,after:pin.kind==='phon'?event.afterPhon:event.afterReading};});
 }
 assert.equal(data.certainCount,45);
 return [...data.items.flatMap((event,index)=>{if(event.certainty!=='certain')return[];assert.equal(event.field,'native');return[{descriptor,event,index,pair:'fr-ko',collection:'items',field:'native',before:event.before,after:event.after}];}),
  ...data.linkedBundles.flatMap((event,index)=>{assert.equal(event.certainty,'certain');assert.equal(event.applyTogether,true);assert.deepEqual(Object.keys(event.before).sort(),['phon','reading','study']);assert.deepEqual(Object.keys(event.before).sort(),Object.keys(event.after).sort());return Object.keys(event.before).map(field=>({descriptor,event,index,pair:'fr-ko',collection:'linkedBundles',field,before:event.before[field],after:event.after[field]}));})];
}

function annotationFor(which,entry,before,audit){
 const fields=Object.keys(entry.fields).sort();
 return{id:entry.id,registryPath:SPEC[which].path,registrySha256:audit.registrySha256,baseSnapshotCommit:BASELINE,
  fields,beforeFields:Object.fromEntries(fields.map(field=>[field,entry.fields[field].before])),
  originalPhoneticReviewStatusPresent:before.phoneticReviewStatusPresent,
  originalPhoneticReviewStatus:before.phoneticReviewStatusPresent?before.phoneticReviewStatus:null,
  evidenceCommits:[COMMIT]};
}
function statusFor(which,entry,before){if(!entry.fields.phon)return before.phoneticReviewStatus;return which==='A'?'corrected-by-Claude-lot6-'+entry.rules.join('+'):'corrected-by-Claude-content-lot6';}
function applyAForProof(pair,phrase,audit){
 const entry=audit.entries.get(key(pair,phrase.id));if(!entry)return clone(phrase);
 const copy=clone(phrase),before=beforeProfile(phrase);for(const[field,event]of Object.entries(entry.fields))copy[field]=event.after;
 copy.phoneticReviewStatus=statusFor('A',entry,before);copy[SPEC.A.annotation]=annotationFor('A',entry,before,audit);return copy;
}
function loadBatch(which,override,previous){
 const spec=SPEC[which],raw=fs.readFileSync(path.join(ROOT,spec.path)),registry=override||JSON.parse(raw);
 assert.equal(registry.version,1);assert.equal(registry.id,spec.id);assert.equal(registry.status,spec.status);assert.equal(registry.baseSnapshotCommit,BASELINE);
 assert.equal(registry.correctionCount,spec.count);assert.equal(registry.eventCount,spec.events);assert.equal(registry.approvedFieldCount,spec.fields);assert.equal(registry.changedFieldCount,spec.fields);
 const predecessor=which==='A'?PREVIOUS:{registryPath:REG_A,registrySha256:previous.registrySha256};assert.deepEqual(registry.appliesAfter,[predecessor]);
 assert.equal(hash(fs.readFileSync(path.join(ROOT,predecessor.registryPath))),predecessor.registrySha256,'predecessor registry intact');
 assert.equal(registry.evidenceFiles.length,which==='A'?2:1);
 const approved=new Map(),proofFiles=new Set();
 for(const descriptor of registry.evidenceFiles){assert.ok(!proofFiles.has(descriptor.gitPath));proofFiles.add(descriptor.gitPath);
  for(const proof of proofSelection(descriptor,which)){
   const id=key(proof.pair,proof.event.id);if(!approved.has(id))approved.set(id,{fields:{},proofs:[]});
   const group=approved.get(id);assert.equal(group.fields[proof.field],undefined,'one frozen event per field');group.fields[proof.field]={before:proof.before,after:proof.after};group.proofs.push(proof);
  }
 }
 assert.equal(approved.size,spec.count);assert.equal([...approved.values()].reduce((n,p)=>n+new Set(p.proofs.map(p=>p.collection+':'+p.index)).size,0),which==='A'?23:47);
 const entries=new Map(),profiles={canonical:0,'transport-phrase':0,'received-model':0},addresses=new Set();let objects=0,fieldCount=0;
 const audit={registry,registrySha256:hash(raw),entries,approved};
 for(const entry of registry.corrections){
  const id=key(entry.pairId,entry.id);assert.equal(entry.pairId,'fr-ko');assert.ok(!entries.has(id),'unique reviewed identity');const proof=approved.get(id);assert.ok(proof,'only pinned selected identities');
  assert.deepEqual(entry.fields,proof.fields,'whole paired fields or native gloss exactly follow evidence');assert.equal(entry.atomicBundle,which==='A'?Object.hasOwn(proof.fields,'reading'):proof.proofs[0].collection==='linkedBundles','only linked whole fields form a single transaction');
  if(which==='A'){
   assert.deepEqual(Object.keys(entry.fields).sort(),Object.hasOwn(proof.fields,'reading')?['phon','reading']:['phon']);
   assert.equal(proof.proofs.filter(p=>p.field==='phon').length,1);assert.equal(proof.proofs.filter(p=>p.field==='reading').length,Object.hasOwn(proof.fields,'reading')?1:0);
   assert.deepEqual(entry.rules,proof.proofs.find(p=>p.field==='phon').event.rules);
  }else{assert.deepEqual(Object.keys(entry.fields).sort(),entry.atomicBundle?['phon','reading','study']:['native']);assert.deepEqual(entry.rules,[]);}
  const ordered=which==='A'?[proof.proofs.find(p=>p.field==='phon'),...proof.proofs.filter(p=>p.field==='reading')]:[proof.proofs[0]];
  assert.deepEqual(entry.events,ordered.map(p=>({evidencePath:p.descriptor.path,evidenceCollection:p.collection,evidenceIndex:p.index})));
  assert.ok(entry.occurrences.length);
  for(const occurrence of entry.occurrences){
   assert.match(occurrence.path,/^melunga_deploy\/content\/niveaux-progressifs\/(?:fr-ko\/L(?:10|[1-9])|repertoires\/fr-ko)\.json$/);assert.ok(Object.hasOwn(profiles,occurrence.profile));
   const address=occurrence.path+'\0'+JSON.stringify(occurrence.location);assert.ok(!addresses.has(address));addresses.add(address);
   const original=at(baseline(occurrence.path),occurrence.location);assert.equal(original.id,entry.id);
   const before=which==='B'?applyAForProof(entry.pairId,original,previous):original;assert.deepEqual(occurrence.expectedBefore,beforeProfile(before),'complete before matches pinned served file');
   for(const p of proof.proofs){assert.equal(before[p.field],p.before);if(p.collection!=='linkedBundles')assert.equal(original.study,p.event.study);assert.equal(original.native,p.event.native??original.native);if(which==='A'&&p.field==='phon')assert.equal(original.reading,p.event.reading);}
   profiles[occurrence.profile]++;objects++;
  }
  entries.set(id,entry);fieldCount+=Object.keys(entry.fields).length;
 }
 assert.equal(entries.size,spec.count);assert.equal(objects,spec.objects);assert.deepEqual(profiles,spec.profiles);assert.equal(fieldCount,spec.fields);
 if(which==='A')assert.deepEqual([...entries.values()].filter(e=>e.atomicBundle).map(e=>e.id).sort(),[3766,3980,4341,4391,4125].map(id=>'catalogue:ko:'+id).sort());
 return {...audit,profiles,objects};
}
function loadRegistries(overrides){if(!overrides&&cached)return cached;const A=loadBatch('A',overrides?.A),B=loadBatch('B',overrides?.B,A),result={A,B};if(!overrides)cached=result;return result;}
function projectStage(which,pair,phrase,expectedBefore){
 const audit=loadRegistries()[which],spec=SPEC[which],entry=audit.entries.get(key(pair,phrase.id));
 if(!entry){assert.equal(phrase[spec.annotation],undefined,'no unregistered lot6 annotation');return phrase;}
 const copy=clone(phrase),annotation=copy[spec.annotation];assert.ok(annotation&&typeof annotation==='object','review declaration required');
 for(const[field,event]of Object.entries(entry.fields))copy[field]=event.before;delete copy[spec.annotation];
 let before;
 for(const occurrence of entry.occurrences){const candidate=occurrence.expectedBefore;
  if(annotation.originalPhoneticReviewStatusPresent!==candidate.phoneticReviewStatusPresent||!isDeepStrictEqual(annotation.originalPhoneticReviewStatus,candidate.phoneticReviewStatus))continue;
  if(entry.fields.phon){if(candidate.phoneticReviewStatusPresent)copy.phoneticReviewStatus=candidate.phoneticReviewStatus;else delete copy.phoneticReviewStatus;}
  if(isDeepStrictEqual(beforeProfile(copy),candidate)){before=candidate;break;}
 }
 assert.ok(before,'full before source and prior metadata agree');if(expectedBefore)assert.deepEqual(before,expectedBefore);
 assert.deepEqual(annotation,annotationFor(which,entry,before,audit),'exact source-bound annotation');
 for(const[field,event]of Object.entries(entry.fields))assert.equal(phrase[field],event.after,'whole reviewed after');
 assert.equal(Object.hasOwn(phrase,'phoneticReviewStatus'),entry.fields.phon?true:before.phoneticReviewStatusPresent);
 if(entry.fields.phon||before.phoneticReviewStatusPresent)assert.equal(phrase.phoneticReviewStatus,statusFor(which,entry,before));
 return copy;
}
function projectBefore(pair,phrase){phrase=lot7Corrections.projectBefore(pair,phrase);return projectStage('A',pair,projectStage('B',pair,phrase));}
function verifyPhrase(pair,phrase){projectBefore(pair,phrase);return phrase;}
function projectDocument(pair,document,isBank){
 const copy=clone(document);
 if(isBank){for(const field of ['phrases','receivedModels'])copy[field]=(copy[field]||[]).map(phrase=>projectBefore(pair,phrase));}
 else{for(const field of ['themes','heldThemes'])for(const theme of copy[field]||[])theme.phrases=theme.phrases.map(phrase=>projectBefore(pair,phrase));copy.reserve=(copy.reserve||[]).map(phrase=>projectBefore(pair,phrase));}
 return copy;
}
function declaration(which,audit=loadRegistries()[which]){const r=audit.registry;return{registryPath:SPEC[which].path,registrySha256:audit.registrySha256,baseSnapshotCommit:BASELINE,appliesAfter:r.appliesAfter,correctionCount:r.correctionCount,eventCount:r.eventCount,approvedFieldCount:r.approvedFieldCount,changedFieldCount:r.changedFieldCount,evidenceCommits:[COMMIT]};}
function manifestDeclarations(){return {...Object.fromEntries(['A','B'].map(which=>[SPEC[which].manifest,declaration(which)])),...lot7Corrections.manifestDeclarations()};}
function inputFiles(){const audits=loadRegistries();return[__filename,...['A','B'].flatMap(which=>[path.join(ROOT,SPEC[which].path),...audits[which].registry.evidenceFiles.map(file=>path.join(ROOT,file.path))]),...lot7Corrections.inputFiles()];}
function auditRuntime(){
 const lot7Audit=lot7Corrections.auditRuntime();
 const audits=loadRegistries(),manifestPath='melunga_deploy/content/niveaux-progressifs/manifest.json',manifest=read(manifestPath),old=baseline(manifestPath);
 const files=old.pairs.flatMap(pair=>[pair.repertoirePath,...pair.levels.map(level=>level.dataPath)]).map(file=>'melunga_deploy/'+file);assert.equal(files.length,77);const stats={};
 for(const which of ['A','B']){const audit=audits[which];let changed=0;
  for(const entry of audit.registry.corrections){const copies=[];
   for(const occurrence of entry.occurrences){const phrase=at(read(occurrence.path),occurrence.location);verifyPhrase(entry.pairId,phrase);assert.deepEqual(projectBefore(entry.pairId,phrase),at(baseline(occurrence.path),occurrence.location),'complete source/placement/role and fields preserved');copies.push(phrase);changed+=Object.keys(entry.fields).length;}
   for(const copy of copies)for(const field of ['study','native','phon','reading'])assert.equal(copy[field],copies[0][field],'canonical and transport share the same final edition');
  }
  stats[which]={identities:audit.entries.size,events:audit.registry.eventCount,objects:audit.objects,profiles:audit.profiles,changedFields:changed};
 }
 for(const file of files){const document=read(file),pair=document.pairId||document.id;assert.deepEqual(projectDocument(pair,document,file.includes('/repertoires/')),baseline(file),'no undeclared change anywhere in runtime document: '+file);}
 const expected=clone(old);Object.assign(expected,manifestDeclarations());for(const pair of expected.pairs)pair.repertoireSha256=hash(englishClassification.beforeBytes(path.join(WEB,pair.repertoirePath)));assert.deepEqual(manifest,expected,'only two new declarations and actual bank hashes');
 for(const filename of ['app.html','maquette-guidee.js','maquette-guidee.css','parcours-niveaux.html','maquette-guidee.html'])assert.ok(englishClassification.beforeAssetBytes(path.join(WEB,filename)).equals(execFileSync('git',['show',BASELINE+':melunga_deploy/'+filename],{cwd:ROOT,maxBuffer:32*1024*1024})),'UI/classic byte-for-byte unchanged');
 assert.equal(stats.A.changedFields,23);assert.equal(stats.B.changedFields,51);
 // Unapproved convention changes, level/theme changes and all other card edits
 // are excluded by the complete document comparison above. In particular the
 // ASTM transaction does not also silently normalize its mat-a-yo batchim.
 const astm=audits.A.entries.get(key('fr-ko','catalogue:ko:4271'));assert.ok(astm.fields.phon.after.endsWith('mat-a-yo'));
 return{pairedFields:stats.A,content:stats.B,files:77,changedRuntimeFields:74,objects:65,lot7:lot7Audit};
}
module.exports={loadRegistries,verifyPhrase,projectBefore,projectDocument,manifestDeclarations,declaration,auditRuntime,inputFiles,baseline,beforeProfile,projectStage};

if(require.main===module){
 const {test,before,after}=require('node:test'),http=require('node:http'),{chromium}=require('playwright-core');
 let server,browser,base;const errors=[],requests=[],snapshots=new Map();
 before(async()=>{
  const files=inputFiles(),manifest=read('melunga_deploy/content/niveaux-progressifs/manifest.json');files.push(path.join(WEB,'content/niveaux-progressifs/manifest.json'));
  for(const pair of manifest.pairs)files.push(path.join(WEB,pair.repertoirePath),...pair.levels.map(level=>path.join(WEB,level.dataPath)));
  for(const file of ['app.html','maquette-guidee.js','maquette-guidee.css','parcours-niveaux.html'])files.push(path.join(WEB,file));
  for(const file of files)snapshots.set(file,hash(fs.readFileSync(file)));
  server=http.createServer((req,res)=>{const file=path.resolve(WEB,'.'+new URL(req.url,'http://local').pathname);if(!file.startsWith(WEB+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())return res.writeHead(404).end();res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css'})[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base='http://127.0.0.1:'+server.address().port;
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 });
 after(async()=>{await browser?.close();if(server)await new Promise(resolve=>server.close(resolve));assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);for(const[file,beforeHash]of snapshots)assert.equal(hash(fs.readFileSync(file)),beforeHash,'stable test input: '+file);});
 function fixture(id,received=false){
  const pair=read('melunga_deploy/content/niveaux-progressifs/manifest.json').pairs.find(pair=>pair.id==='fr-ko');
  for(const level of pair.levels){const data=read('melunga_deploy/'+level.dataPath);for(const[themeIndex,theme]of data.themes.entries()){
   const steps=theme.sequences.flatMap(sequence=>sequence.steps),stepIndex=steps.findIndex(step=>step.utterance===id&&step.kind===(received?'receive':'understand'));
   if(stepIndex>=0)return{pairId:'fr-ko',id,level:level.level,themeIndex,stepIndex};
  }}throw new Error('No real active fixture '+id+'/received='+received);
 }
 async function openPage(){
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  await context.addInitScript(()=>{window.__lot6Speech=[];window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},getVoices(){return[];},addEventListener(){},speak(item){window.__lot6Speech.push({text:item.text,lang:item.lang});item.onend?.();}}});});
  await context.route('**/*',async route=>{const url=new URL(route.request().url());if(url.origin!==base||/\/(?:\.netlify|api)\//.test(url.pathname)){requests.push(url.origin+url.pathname);await route.abort();}else await route.continue();});
  const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));return{context,page};
 }
 async function enter(page,target){
  await page.goto(base+'/parcours-niveaux.html?pair=fr-ko&level='+target.level);
  await page.waitForFunction(target=>window.MelungaMockup?.state().screen==='themes'&&window.MelungaMockup.state().pairId==='fr-ko'&&window.MelungaMockup.state().level===target.level,target);
  await page.locator('#mgThemeGrid > button').nth(target.themeIndex).click();
  await page.evaluate(target=>{while(window.MelungaMockup.state().stepIndex<target.stepIndex){document.querySelector('#mgChoices:not([hidden]) button')?.click();const button=document.getElementById('mgContinue');if(button.disabled)throw new Error('Blocked real lesson fixture');button.click();}},target);
  assert.equal(await page.evaluate(()=>window.MelungaMockup.state().phraseId),target.id);
 }
 function sourceFor(which,id,received=false){const entry=loadRegistries()[which].entries.get(key('fr-ko',id));assert.ok(entry);const occurrence=received?entry.occurrences.find(o=>o.profile==='received-model'):entry.occurrences.find(o=>o.profile==='canonical');assert.ok(occurrence);return at(read(occurrence.path),occurrence.location);}
 async function checkDom(page,id,which='A',received=false){
  const source=sourceFor(which,id,received);assert.equal(await page.locator('#mgPhrase').textContent(),source.study);assert.equal(await page.locator('#mgPhon').textContent(),source.phon);assert.equal(await page.locator('#mgTranslation').textContent(),source.native);assert.equal(await page.locator('#mgReading').textContent(),source.reading||'');
  await page.click('#mgEar');const spoken=await page.evaluate(()=>window.__lot6Speech.at(-1));assert.equal(spoken.text,source.study,'TTS uses the whole unchanged Korean study, never reading or aid');assert.equal(spoken.lang.split('-')[0],'ko');return source;
 }
 async function readingButton(page){if(!await page.locator('#mgReadingToggle').isVisible())await page.click('#mgHelp');await page.click('#mgReadingToggle');if(await page.locator('#mgHelpPanel').isVisible())await page.click('#mgHelp');}
 test('18 frozen aid transactions and 47 separate content transactions preserve all 77 runtime documents',()=>{
  const audit=auditRuntime();assert.equal(audit.changedRuntimeFields,74);assert.equal(audit.objects,65);
  const e=loadRegistries().A.entries.get(key('fr-ko','catalogue:ko:3980'));assert.equal(e.occurrences[0].expectedBefore.phoneticCorrectionPresent,true,'new whole aid follows earlier immutable B event');
 });
 test('partial pairs/bundles, forged proof/source, unapproved gloss and stale after values are rejected',()=>{
  const audits=loadRegistries(),pairedIndex=audits.A.registry.corrections.findIndex(e=>e.atomicBundle),bundleIndex=audits.B.registry.corrections.findIndex(e=>e.atomicBundle);
  const registryFaults=[
   ['A',r=>{delete r.corrections[pairedIndex].fields.reading;}],
   ['A',r=>{delete r.corrections[pairedIndex].fields.phon;}],
   ['A',r=>{r.corrections[pairedIndex].atomicBundle=false;}],
   ['A',r=>{r.corrections[pairedIndex].fields.reading.after+='bad';}],
   ['A',r=>{r.corrections[0].fields.study={before:'x',after:'y'};}],
   ['A',r=>{r.corrections[pairedIndex].events.pop();}],
   ['A',r=>{r.corrections[0].rules=['automatic'];}],
   ['A',r=>{r.evidenceFiles[0].sha256='0'.repeat(64);}],
   ['A',r=>{r.corrections[0].occurrences[0].expectedBefore.source.collection='fake';}],
   ['A',r=>{r.appliesAfter[0].registrySha256='0'.repeat(64);}],
   ['B',r=>{r.corrections[0].fields.native.after+='bad';}],
   ['B',r=>{r.corrections[0].id='catalogue:ko:2076';}],
   ['B',r=>{r.corrections[0].fields.phon={before:'x',after:'y'};}],
   ['B',r=>{r.corrections[bundleIndex].atomicBundle=false;}],
   ['B',r=>{delete r.corrections[bundleIndex].fields.reading;}],
   ['B',r=>{delete r.corrections[bundleIndex].fields.study;}],
   ['B',r=>{r.corrections[bundleIndex].events[0].evidenceCollection='items';}]
  ];
  for(const[which,mutate]of registryFaults){const bad=clone(audits[which].registry);mutate(bad);assert.throws(()=>loadRegistries({[which]:bad}));}
  const specimenFaults=[
   ['A','catalogue:ko:3766',p=>{p.phon='dak-eul gou-ouo-sso-yo';}],
   ['A','catalogue:ko:3766',p=>{p.reading='dak-eul gu-wo-sseo-yo';}],
   ['A','catalogue:ko:3980',p=>{delete p.phoneticCorrection;}],
   ['A','catalogue:ko:3980',p=>{p.phoneticCorrection.registrySha256='0'.repeat(64);}],
   ['A','catalogue:ko:4391',p=>{delete p.lot6FieldCorrection;}],
   ['A','catalogue:ko:4391',p=>{p.lot6FieldCorrection.registrySha256='0'.repeat(64);}],
   ['A','catalogue:ko:4341',p=>{p.phoneticReviewStatus='native-approved';}],
   ['A','catalogue:ko:4125',p=>{p.source.sourceSha256='0'.repeat(64);}],
   ['B','catalogue:ko:1678',p=>{p.native='Ça fait dix euros.';}],
   ['B','catalogue:ko:1679',p=>{p.native='Depuis quand tu apprends le français ?';}],
   ['B','catalogue:ko:2362',p=>{p.study='최악의 경우에요.';}],
   ['B','catalogue:ko:2362',p=>{p.reading='choe-ak-ui gyeong-u-e-yo';}],
   ['B','catalogue:ko:1896',p=>{p.phon+='bad';}],
   ['B','catalogue:ko:1896',p=>{delete p.lot6ContentCorrection;}]
  ];
  for(const[which,id,mutate]of specimenFaults){const bad=clone(sourceFor(which,id));mutate(bad);assert.throws(()=>verifyPhrase('fr-ko',bad));}
  const received=audits.A.entries.get(key('fr-ko','heard-authored:fr-ko:piste-incident-objet-received-01'));
  const occurrence=received.occurrences[0],bad=clone(at(read(occurrence.path),occurrence.location));bad.heardOnly=false;
  assert.throws(()=>assert.deepEqual(projectBefore('fr-ko',bad),at(baseline(occurrence.path),occurrence.location)),'received role cannot become learner production');
  assert.equal(registryFaults.length+specimenFaults.length+1,32);
 });
 test('all five linked reading pairs and both L1 romanization corrections display final whole aids and speak unchanged Hangul',async()=>{
  const{context,page}=await openPage();try{
   for(const number of [3766,3980,4341,4391,4125]){
    const id='catalogue:ko:'+number;await enter(page,fixture(id));const source=await checkDom(page,id);
    await readingButton(page);assert.equal(await page.locator('#mgPhon').textContent(),source.phon,'Korean keeps adapted aid when separate reading is visible');assert.equal(await page.locator('#mgReading').textContent(),source.reading);assert.equal(await page.locator('#mgReading').isVisible(),true);await page.click('#mgEar');assert.equal(await page.evaluate(()=>window.__lot6Speech.at(-1).text),source.study);
    await readingButton(page);assert.equal(await page.locator('#mgReading').isVisible(),false);
   }
   for(const id of ['conversation:L1-fr-ko.json:L1-fr-ko-01:v1','conversation:L1-fr-ko.json:L1-fr-ko-09:v0']){await enter(page,fixture(id));await checkDom(page,id);}
   const id='heard-authored:fr-ko:piste-incident-objet-received-01';await enter(page,fixture(id,true));const received=await checkDom(page,id,'A',true);assert.equal(received.heardOnly,true);assert.equal(received.referenceOnly,true);assert.equal(await page.evaluate(()=>window.MelungaMockup.state().masked),false);
   const target=fixture(id,true),data=read('melunga_deploy/content/niveaux-progressifs/fr-ko/L'+target.level+'.json'),step=data.themes[target.themeIndex].sequences.flatMap(s=>s.steps)[target.stepIndex];assert.equal(step.requiresProduction,false);assert.equal(step.countsForProgress,false);
  }finally{await context.close();}
 });
 test('both atomic spelling bundles display complete study/reading/aid editions and dispatch their corrected Hangul to TTS',async()=>{
  const{context,page}=await openPage();try{
   for(const number of [2362,1896]){const id='catalogue:ko:'+number;await enter(page,fixture(id));const source=await checkDom(page,id,'B');assert.equal(source.study.includes(number===2362?'경우예요':'모두의 것을'),true);assert.ok(source.phon.includes(number===2362?'guyong-ou-yé-yo':'mo-dou-eui'));await readingButton(page);assert.equal(await page.locator('#mgReading').textContent(),source.reading);await page.click('#mgEar');assert.equal(await page.evaluate(()=>window.__lot6Speech.at(-1).text),source.study);}
  }finally{await context.close();}
 });
 test('all five reviewed 한국어 glosses say Korean, the currency is won, and selected exact meanings reach the actual lesson DOM',async()=>{
  const{context,page}=await openPage();try{
   for(const number of [1679,1472,1900,1902,1847]){const id='catalogue:ko:'+number;await enter(page,fixture(id));const source=await checkDom(page,id,'B');assert.ok(source.native.includes('coréen'));assert.ok(!source.native.includes('français'));}
   // The frozen certain source identifies five whole cards, each with one 한국어.
   const all=[...loadRegistries().B.entries.values()].filter(e=>e.fields.native?.before.includes('français'));assert.equal(all.length,5);assert.equal(all.reduce((n,e)=>n+(e.occurrences[0].expectedBefore.study.match(/한국어/g)||[]).length,0),5);
   for(const[number,expected]of [[1678,'— C\'est combien ? — Ça fait dix mille wons.'],[3108,'les fesses'],[3765,'Portez-vous bien !'],[1917,'Ravi de vous rencontrer.']]){const id='catalogue:ko:'+number;await enter(page,fixture(id));const source=await checkDom(page,id,'B');assert.equal(source.native,expected);}
  }finally{await context.close();}
 });
 test('the longest corrected Korean atomic bundle fits a complete mobile and desktop card without scrolling',async()=>{
  const{context,page}=await openPage();try{
   for(const viewport of [{width:320,height:640},{width:1280,height:720}]){
    await page.setViewportSize(viewport);await enter(page,fixture('catalogue:ko:1896'));await checkDom(page,'catalogue:ko:1896','B');
    await page.evaluate(async()=>{await document.fonts.ready;await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});
    const measured=await page.evaluate(()=>{const rect=n=>{const r=n.getBoundingClientRect();return{top:r.top,bottom:r.bottom,left:r.left,right:r.right};};const visible=n=>n&&!n.hidden&&getComputedStyle(n).display!=='none'&&n.getBoundingClientRect().width>0;return{lesson:rect(document.getElementById('mgLessonView')),texts:['mgPhrase','mgPhon','mgTranslation','mgReading'].map(id=>document.getElementById(id)).filter(visible).map(n=>{const range=document.createRange();range.selectNodeContents(n);return{id:n.id,text:rect(range),element:rect(n),overflow:getComputedStyle(n).overflowY};}),scrollers:[document.scrollingElement,...['mgContent','mgLessonView','mgModel'].map(id=>document.getElementById(id))].map(n=>({id:n.id||n.tagName,scrollHeight:n.scrollHeight,clientHeight:n.clientHeight,scrollWidth:n.scrollWidth,clientWidth:n.clientWidth})),actions:['mgEar','mgContinue','mgReplay'].every(id=>visible(document.getElementById(id)))};});
    for(const n of measured.scrollers){assert.ok(n.scrollHeight<=n.clientHeight+2,n.id+' no vertical scroll');assert.ok(n.scrollWidth<=n.clientWidth+2,n.id+' no horizontal scroll');}
    for(const n of measured.texts){assert.ok(n.text.top>=measured.lesson.top-2&&n.text.bottom<=measured.lesson.bottom+2,n.id+' entire text inside card');assert.ok(n.text.left>=measured.lesson.left-2&&n.text.right<=measured.lesson.right+2,n.id+' no lateral clipping');if(n.overflow!=='visible')assert.ok(n.text.top>=n.element.top-2&&n.text.bottom<=n.element.bottom+2,n.id+' no inner clipping');}
    for(let i=0;i<measured.texts.length;i++)for(let j=i+1;j<measured.texts.length;j++){const a=measured.texts[i].text,b=measured.texts[j].text;assert.ok(Math.min(a.right,b.right)-Math.max(a.left,b.left)<=1||Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)<=1,'text fields do not overlap');}
    assert.ok(measured.actions,'study actions remain visible');
   }
  }finally{await context.close();}
 });

}
