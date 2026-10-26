/* Independent proof and browser checks of lot8 whole Spanish aids
 * and its separate certain glosses/bundles. No producer is imported. The private
 * reverse projection follows content -> reviewed fields -> served 224e459. */
'use strict';
const englishClassification = require('./english-classification.cjs');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const {isDeepStrictEqual}=require('node:util');
const ROOT=path.resolve(__dirname,'..','..'),WEB=path.join(ROOT,'melunga_deploy');
const lot9Corrections=require('./lot9-corrections.cjs');
const BASELINE='224e45948ac3739066f34178375b2e4437197e90';
const COMMIT='e12c600f97a6339a0566cdaf879aa0d449f96284';
const PREVIOUS={registryPath:'docs/niveaux-progressifs/corrections-contenu/lot7/revue-contenu-lot7.json',registrySha256:'68a81f3568ba85f1de5f0ca3e2f5494728f65e806536e36f136376b22fac22a0'};
const REG_A='docs/niveaux-progressifs/corrections-phonetiques/lot8/revue-claude-lot8.json';
const REG_B='docs/niveaux-progressifs/corrections-contenu/lot8/revue-contenu-lot8.json';
const PROOFS={
 'docs/revue-integrale/lot8-fr-es-L1-L10/registre-phonetique.json':{kind:'phon',sha256:'3bdbb4a152ab80fea877bec8f1a6f70e88ea69c2f3bdb88f781ea9bd77992da6'},
 'docs/revue-integrale/lot8-fr-es-L1-L10/lot-contenu-gloses.json':{kind:'content',sha256:'4c078120ce79094af6d968c6c3ac590cb01958eb3f9dfe9e5152d4e35c3ae821'}
};
const SPEC={
 A:{path:REG_A,id:'revue-claude-lot8-phonetique',status:'frozen-whole-phonetic-events-not-global-native-approval',annotation:'lot8PhoneticCorrection',manifest:'lot8PhoneticCorrections',count:63,events:63,fields:63,objects:64,profiles:{canonical:62,'transport-phrase':1,'received-model':1}},
 B:{path:REG_B,id:'revue-contenu-lot8',status:'frozen-certain-gloss-and-linked-bundle-events-not-global-native-approval',annotation:'lot8ContentCorrection',manifest:'lot8ContentCorrections',count:23,events:23,fields:27,objects:24,profiles:{canonical:23,'transport-phrase':1,'received-model':0}}
};
const PRIOR=['phoneticCorrection','reviewedFieldCorrection','lot4PhoneticCorrection','reviewedContentCorrection','lot5FieldCorrection','lot5ContentCorrection','lot6FieldCorrection','lot6ContentCorrection','lot7PhoneticCorrection','lot7ContentCorrection','lot8PhoneticCorrection'];
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
 assert.ok(descriptor.path.startsWith(which==='A'?'docs/niveaux-progressifs/corrections-phonetiques/lot8/':'docs/niveaux-progressifs/corrections-contenu/lot8/'));
 const file=path.resolve(ROOT,descriptor.path);assert.ok(file.startsWith(ROOT+path.sep));
 const raw=fs.readFileSync(file);assert.equal(hash(raw),pin.sha256,'frozen proof bytes');
 const git=execFileSync('git',['show',COMMIT+':'+descriptor.gitPath],{cwd:ROOT,maxBuffer:32*1024*1024});assert.ok(raw.equals(git),'proof is the actual Git object');
 const data=JSON.parse(raw);assert.equal(data.baseSnapshotCommit||data.reference,BASELINE);
 if(which==='A'){
  assert.equal(data.eventCount,63);assert.equal(data.events.length,63);
  return data.events.map((event,index)=>{assert.equal(event.pair,'fr-es');assert.ok(event.rules.length&&event.rules.every(rule=>['S','G','R','A','T'].includes(rule)));return{descriptor,event,index,pair:'fr-es',collection:'events',field:'phon',before:event.beforePhon,after:event.afterPhon};});
 }
 assert.equal(data.certainCount,20);
 return [...data.items.flatMap((event,index)=>{if(event.certainty!=='certain')return[];assert.ok(['native','study'].includes(event.field));return[{descriptor,event,index,pair:'fr-es',collection:'items',field:event.field,before:event.before,after:event.after}];}),
  ...data.linkedBundles.flatMap((event,index)=>{assert.equal(event.certainty,'certain');assert.equal(event.applyTogether,true);assert.ok(['phon,native,study','native,phon,study','phon,study'].includes(Object.keys(event.before).sort().join(',')));assert.deepEqual(Object.keys(event.before).sort(),Object.keys(event.after).sort());return Object.keys(event.before).map(field=>({descriptor,event,index,pair:'fr-es',collection:'linkedBundles',field,before:event.before[field],after:event.after[field]}));})];
}

function annotationFor(which,entry,before,audit){
 const fields=Object.keys(entry.fields).sort();
 return{id:entry.id,registryPath:SPEC[which].path,registrySha256:audit.registrySha256,baseSnapshotCommit:BASELINE,
  fields,beforeFields:Object.fromEntries(fields.map(field=>[field,entry.fields[field].before])),
  originalPhoneticReviewStatusPresent:before.phoneticReviewStatusPresent,
  originalPhoneticReviewStatus:before.phoneticReviewStatusPresent?before.phoneticReviewStatus:null,
  evidenceCommits:[COMMIT]};
}
function statusFor(which,entry,before){if(!entry.fields.phon)return before.phoneticReviewStatus;return which==='A'?'corrected-by-Claude-lot8-'+entry.rules.join('+'):'corrected-by-Claude-content-lot8';}
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
 assert.equal(registry.evidenceFiles.length,1);
 const approved=new Map(),proofFiles=new Set();
 for(const descriptor of registry.evidenceFiles){assert.ok(!proofFiles.has(descriptor.gitPath));proofFiles.add(descriptor.gitPath);
  for(const proof of proofSelection(descriptor,which)){
   const id=key(proof.pair,proof.event.id);if(!approved.has(id))approved.set(id,{fields:{},proofs:[]});
   const group=approved.get(id);assert.equal(group.fields[proof.field],undefined,'one frozen event per field');group.fields[proof.field]={before:proof.before,after:proof.after};group.proofs.push(proof);
  }
 }
 assert.equal(approved.size,spec.count);assert.equal([...approved.values()].reduce((n,p)=>n+new Set(p.proofs.map(p=>p.collection+':'+p.index)).size,0),which==='A'?63:23);
 const entries=new Map(),profiles={canonical:0,'transport-phrase':0,'received-model':0},addresses=new Set();let objects=0,fieldCount=0;
 const audit={registry,registrySha256:hash(raw),entries,approved};
 for(const entry of registry.corrections){
  const id=key(entry.pairId,entry.id);assert.equal(entry.pairId,'fr-es');assert.ok(!entries.has(id),'unique reviewed identity');const proof=approved.get(id);assert.ok(proof,'only pinned selected identities');
  assert.deepEqual(entry.fields,proof.fields,'whole phonetic events or native gloss exactly follow evidence');assert.equal(entry.atomicBundle,which==='A'?false:proof.proofs[0].collection==='linkedBundles','only linked whole fields form a single transaction');
  if(which==='A'){
   assert.deepEqual(Object.keys(entry.fields),['phon']);assert.equal(proof.proofs.length,1);assert.deepEqual(entry.rules,proof.proofs[0].event.rules);
  }else{assert.deepEqual(Object.keys(entry.fields).sort(),entry.atomicBundle?Object.keys(proof.fields).sort():[proof.proofs[0].field]);assert.deepEqual(entry.rules,[]);}
  assert.deepEqual(entry.events,[proof.proofs[0]].map(p=>({evidencePath:p.descriptor.path,evidenceCollection:p.collection,evidenceIndex:p.index})));
  assert.ok(entry.occurrences.length);
  for(const occurrence of entry.occurrences){
   assert.match(occurrence.path,/^melunga_deploy\/content\/niveaux-progressifs\/(?:fr-es\/L(?:10|[1-9])|repertoires\/fr-es)\.json$/);assert.ok(Object.hasOwn(profiles,occurrence.profile));
   const address=occurrence.path+'\0'+JSON.stringify(occurrence.location);assert.ok(!addresses.has(address));addresses.add(address);
   const original=at(baseline(occurrence.path),occurrence.location);assert.equal(original.id,entry.id);const inferred=occurrence.path.includes('/repertoires/')?(occurrence.location[0]==='receivedModels'?'received-model':'transport-phrase'):'canonical';assert.equal(occurrence.profile,inferred,'profile follows actual served role');
   const before=which==='B'?applyAForProof(entry.pairId,original,previous):original;assert.deepEqual(occurrence.expectedBefore,beforeProfile(before),'complete before matches pinned served file');
   for(const p of proof.proofs){assert.equal(before[p.field],p.before);if(p.collection!=='linkedBundles')assert.equal(original.study,p.event.study);assert.equal(original.native,p.event.native??original.native);if(which==='A'){assert.equal(Object.hasOwn(original,'reading'),false,'Spanish has no source reading');assert.equal(PRIOR.some(field=>field!=='lot8PhoneticCorrection'&&Object.hasOwn(original,field)),p.event.priorCorrection);}}
   profiles[occurrence.profile]++;objects++;
  }
  if(which==='A'){const event=proof.proofs[0].event;assert.ok(entry.occurrences.some(o=>o.path===event.occurrence.path&&isDeepStrictEqual(o.location,event.occurrence.location)),'source proof anchor retained');assert.equal(entry.occurrences.filter(o=>o.profile==='transport-phrase').length,event.transportCopies);assert.equal(entry.occurrences.filter(o=>o.profile!=='transport-phrase').length,1);}
  entries.set(id,entry);fieldCount+=Object.keys(entry.fields).length;
 }
 assert.equal(entries.size,spec.count);assert.equal(objects,spec.objects);assert.deepEqual(profiles,spec.profiles);assert.equal(fieldCount,spec.fields);
 if(which==='A'){assert.ok([...entries.values()].every(e=>!e.atomicBundle));const counts={};for(const entry of entries.values())for(const rule of entry.rules)counts[rule]=(counts[rule]||0)+1;assert.deepEqual(counts,{G:11,R:10,T:2,A:9,S:31});}
 return {...audit,profiles,objects};
}
function loadRegistries(overrides){if(!overrides&&cached)return cached;const A=loadBatch('A',overrides?.A),B=loadBatch('B',overrides?.B,A),result={A,B};if(!overrides)cached=result;return result;}
function projectStage(which,pair,phrase,expectedBefore){
 const audit=loadRegistries()[which],spec=SPEC[which],entry=audit.entries.get(key(pair,phrase.id));
 if(!entry){assert.equal(phrase[spec.annotation],undefined,'no unregistered lot8 annotation');return phrase;}
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
function projectBefore(pair,phrase){phrase=lot9Corrections.projectBefore(pair,phrase);return projectStage('A',pair,projectStage('B',pair,phrase));}
function verifyPhrase(pair,phrase){projectBefore(pair,phrase);return phrase;}
function projectDocument(pair,document,isBank){
 const copy=clone(document);
 if(isBank){for(const field of ['phrases','receivedModels'])copy[field]=(copy[field]||[]).map(phrase=>projectBefore(pair,phrase));}
 else{for(const field of ['themes','heldThemes'])for(const theme of copy[field]||[])theme.phrases=theme.phrases.map(phrase=>projectBefore(pair,phrase));copy.reserve=(copy.reserve||[]).map(phrase=>projectBefore(pair,phrase));}
 return copy;
}
function declaration(which,audit=loadRegistries()[which]){const r=audit.registry;return{registryPath:SPEC[which].path,registrySha256:audit.registrySha256,baseSnapshotCommit:BASELINE,appliesAfter:r.appliesAfter,correctionCount:r.correctionCount,eventCount:r.eventCount,approvedFieldCount:r.approvedFieldCount,changedFieldCount:r.changedFieldCount,evidenceCommits:[COMMIT]};}
function manifestDeclarations(){return {...Object.fromEntries(['A','B'].map(which=>[SPEC[which].manifest,declaration(which)])),...lot9Corrections.manifestDeclarations()};}
function inputFiles(){const audits=loadRegistries();return[__filename,...['A','B'].flatMap(which=>[path.join(ROOT,SPEC[which].path),...audits[which].registry.evidenceFiles.map(file=>path.join(ROOT,file.path))]),...lot9Corrections.inputFiles()];}
function auditRuntime(){
 const lot9Audit=lot9Corrections.auditRuntime();
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
 assert.equal(stats.A.changedFields,64);assert.equal(stats.B.changedFields,28);
 assert.equal(new Set([...audits.A.entries.keys()].filter(id=>audits.B.entries.has(id))).size,0,'separate content identities do not overlap phonetic identities');
 const oldB=audits.A.entries.get(key('fr-es','catalogue:es:3159')).occurrences[0];assert.deepEqual(at(read(oldB.path),oldB.location).phoneticCorrection,at(baseline(oldB.path),oldB.location).phoneticCorrection,'previous B annotation survives the later whole event');
 return{phonetic:stats.A,content:stats.B,files:77,changedRuntimeFields:92,objects:88,lot9:lot9Audit};
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
  const pair=read('melunga_deploy/content/niveaux-progressifs/manifest.json').pairs.find(pair=>pair.id==='fr-es');
  for(const level of pair.levels){const data=read('melunga_deploy/'+level.dataPath);for(const[themeIndex,theme]of data.themes.entries()){
   const steps=theme.sequences.flatMap(sequence=>sequence.steps),stepIndex=steps.findIndex(step=>step.utterance===id&&step.kind===(received?'receive':'understand'));
   if(stepIndex>=0)return{pairId:'fr-es',id,level:level.level,themeIndex,stepIndex};
  }}throw new Error('No real active fixture '+id+'/received='+received);
 }
 async function openPage(){
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  await context.addInitScript(()=>{window.__lot8Speech=[];window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},getVoices(){return[];},addEventListener(){},speak(item){window.__lot8Speech.push({text:item.text,lang:item.lang});item.onend?.();}}});});
  await context.route('**/*',async route=>{const url=new URL(route.request().url());if(url.origin!==base||/\/(?:\.netlify|api)\//.test(url.pathname)){requests.push(url.origin+url.pathname);await route.abort();}else await route.continue();});
  const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));return{context,page};
 }
 async function enter(page,target){
  await page.goto(base+'/parcours-niveaux.html?pair=fr-es&level='+target.level);
  await page.waitForFunction(target=>window.MelungaMockup?.state().screen==='themes'&&window.MelungaMockup.state().pairId==='fr-es'&&window.MelungaMockup.state().level===target.level,target);
  await page.locator('#mgThemeGrid > button').nth(target.themeIndex).click();
  await page.evaluate(target=>{while(window.MelungaMockup.state().stepIndex<target.stepIndex){document.querySelector('#mgChoices:not([hidden]) button')?.click();const button=document.getElementById('mgContinue');if(button.disabled)throw new Error('Blocked real lesson fixture');button.click();}},target);
  assert.equal(await page.evaluate(()=>window.MelungaMockup.state().phraseId),target.id);
 }
 function sourceFor(which,id,received=false){const entry=loadRegistries()[which].entries.get(key('fr-es',id));assert.ok(entry);const occurrence=received?entry.occurrences.find(o=>o.profile==='received-model'):entry.occurrences.find(o=>o.profile==='canonical');assert.ok(occurrence);return at(read(occurrence.path),occurrence.location);}
 async function checkDom(page,id,which='A',received=false){
  const source=sourceFor(which,id,received);assert.equal(await page.locator('#mgPhrase').textContent(),source.study);assert.equal(await page.locator('#mgPhon').textContent(),source.phon);assert.equal(await page.locator('#mgTranslation').textContent(),source.native);assert.equal(await page.locator('#mgReading').textContent(),source.reading||'');
  await page.click('#mgEar');const spoken=await page.evaluate(()=>window.__lot8Speech.at(-1));assert.equal(spoken.text,source.study,'TTS uses the whole unchanged Spanish study, never reading or aid');assert.equal(spoken.lang.split('-')[0],'es');return source;
 }
 test('63 frozen Spanish aids and 23 separate content transactions preserve all 77 runtime documents',()=>{
  const audit=auditRuntime();assert.equal(audit.changedRuntimeFields,92);assert.equal(audit.objects,88);
  const l1=read('melunga_deploy/content/niveaux-progressifs/fr-es/L1.json'),oldL1=baseline('melunga_deploy/content/niveaux-progressifs/fr-es/L1.json');for(const id of ['catalogue:es:701','catalogue:es:4579'])assert.equal(l1.themes.flatMap(t=>t.phrases).find(p=>p.id===id).phon,oldL1.themes.flatMap(t=>t.phrases).find(p=>p.id===id).phon,'pending rr/jota conventions remain unchanged');
  const reserved=['catalogue:es:3418','catalogue:es:4361'];
  for(const id of reserved){const entry=loadRegistries().A.entries.get(key('fr-es',id));assert.ok(entry.occurrences.some(o=>o.location[0]==='reserve'));}
  const manifest=read('melunga_deploy/content/niveaux-progressifs/manifest.json');
  for(const pair of manifest.pairs)for(const level of pair.levels)for(const theme of read('melunga_deploy/'+level.dataPath).themes)for(const sequence of theme.sequences)for(const step of sequence.steps)assert.ok(!reserved.includes(step.utterance),'reserved source does not become learner production');
 });
 test('partial Spanish bundles, punctuation-only leaks, stale copies, received models and forged metadata are rejected',()=>{
  const audits=loadRegistries(),bundleIndex=audits.B.registry.corrections.findIndex(e=>e.atomicBundle),copyIndex=audits.A.registry.corrections.findIndex(e=>e.occurrences.some(o=>o.profile==='transport-phrase')),priorIndex=audits.A.registry.corrections.findIndex(e=>e.id==='catalogue:es:3159'),punctIndex=audits.B.registry.corrections.findIndex(e=>e.id==='catalogue:es:661');
  const registryFaults=[
   ['A',r=>{r.corrections[0].fields.reading={before:'',after:'invented'};}],
   ['A',r=>{r.corrections[0].fields.study={before:'x',after:'y'};}],
   ['A',r=>{r.corrections[0].fields.phon.after+='bad';}],
   ['A',r=>{r.corrections[0].rules=['automatic'];}],
   ['A',r=>{r.corrections[0].rules=['R'];}],
   ['A',r=>{r.corrections[0].atomicBundle=true;}],
   ['A',r=>{r.evidenceFiles[0].sha256='0'.repeat(64);}],
   ['A',r=>{r.evidenceFiles[0].gitCommit=BASELINE;}],
   ['A',r=>{r.corrections[0].occurrences[0].expectedBefore.source.collection='fake';}],
   ['A',r=>{r.corrections[priorIndex].occurrences[0].expectedBefore.phoneticCorrection=null;r.corrections[priorIndex].occurrences[0].expectedBefore.phoneticCorrectionPresent=false;}],
   ['A',r=>{r.appliesAfter[0].registrySha256='0'.repeat(64);}],
   ['A',r=>{r.corrections[copyIndex].occurrences.pop();}],
   ['A',r=>{r.corrections[0].events[0].evidenceIndex=62;}],
   ['B',r=>{r.corrections[0].fields.native.after+='bad';}],
   ['B',r=>{r.corrections[0].id='catalogue:es:712';}],
   ['B',r=>{r.corrections[0].fields.phon={before:'x',after:'y'};}],
   ['B',r=>{r.corrections[bundleIndex].atomicBundle=false;}],
   ['B',r=>{delete r.corrections[bundleIndex].fields.phon;}],
   ['B',r=>{delete r.corrections[bundleIndex].fields.study;}],
   ['B',r=>{r.corrections[punctIndex].fields.phon={before:'x',after:'y'};}],
   ['B',r=>{r.corrections[punctIndex].atomicBundle=true;}],
   ['B',r=>{r.corrections[bundleIndex].events[0].evidenceCollection='items';}]
  ];
  for(const[which,mutate]of registryFaults){const bad=clone(audits[which].registry);mutate(bad);assert.throws(()=>loadRegistries({[which]:bad}));}
  const specimenFaults=[
   ['A','catalogue:es:712',p=>{p.phon=audits.A.entries.get(key('fr-es',p.id)).fields.phon.before;}],
   ['A','catalogue:es:712',p=>{p.reading='invented';}],
   ['A','catalogue:es:712',p=>{delete p.lot8PhoneticCorrection;}],
   ['A','catalogue:es:712',p=>{p.lot8PhoneticCorrection.registrySha256='0'.repeat(64);}],
   ['A','catalogue:es:712',p=>{p.phoneticReviewStatus='native-approved';}],
   ['A','catalogue:es:712',p=>{p.source.sourceSha256='0'.repeat(64);}],
   ['A','catalogue:es:3159',p=>{delete p.phoneticCorrection;}],
   ['B','catalogue:es:661',p=>{p.study=audits.B.entries.get(key('fr-es',p.id)).fields.study.before;}],
   ['B','catalogue:es:661',p=>{p.phon+='unapproved';}],
   ['B','catalogue:es:661',p=>{p.native+='unapproved';}],
   ['B','catalogue:es:661',p=>{p.phoneticReviewStatus='native-approved';}],
   ['B','catalogue:es:875',p=>{p.lot8ContentCorrection.fields.push('phon');}],
   ['B','catalogue:es:999',p=>{p.native=audits.B.entries.get(key('fr-es',p.id)).fields.native.before;}],
   ['B','catalogue:es:999',p=>{p.phoneticReviewStatus='native-approved';}],
   ['B','catalogue:es:1340',p=>{p.native=audits.B.entries.get(key('fr-es',p.id)).fields.native.before;}],
   ['B','catalogue:es:1340',p=>{p.phon=audits.B.entries.get(key('fr-es',p.id)).fields.phon.before;}],
   ['B','catalogue:es:2727',p=>{p.native+='unapproved';}],
   ['B','catalogue:es:3186',p=>{delete p.lot8ContentCorrection;}]
  ];
  for(const[which,id,mutate]of specimenFaults){const bad=clone(sourceFor(which,id));mutate(bad);assert.throws(()=>verifyPhrase('fr-es',bad));}
  for(const[which,id]of [['A','catalogue:es:619'],['B','situation-support-conversation:fr-es:piste-douleur-simple-support-02']]){const entry=audits[which].entries.get(key('fr-es',id)),copy=entry.occurrences.find(o=>o.profile==='transport-phrase'),bad=clone(at(read(copy.path),copy.location));for(const[field,event]of Object.entries(entry.fields))bad[field]=event.before;assert.throws(()=>verifyPhrase('fr-es',bad));}
  const received=[...audits.A.entries.values()].find(e=>e.id.startsWith('heard-authored:')),occurrence=received.occurrences[0],badAid=clone(at(read(occurrence.path),occurrence.location));badAid.phon=received.fields.phon.before;assert.throws(()=>verifyPhrase('fr-es',badAid));
  const badRole=clone(at(read(occurrence.path),occurrence.location));badRole.heardOnly=false;assert.throws(()=>assert.deepEqual(projectBefore('fr-es',badRole),at(baseline(occurrence.path),occurrence.location)),'received role cannot become learner production');
  for(const id of ['catalogue:es:701','catalogue:es:4579']){const file='melunga_deploy/content/niveaux-progressifs/fr-es/L1.json',bad=clone(read(file)),phrase=bad.themes.flatMap(t=>t.phrases).find(p=>p.id===id);assert.ok(phrase);phrase.phon+=' convention-non-approuvée';assert.throws(()=>assert.deepEqual(projectDocument('fr-es',bad,false),baseline(file)),'unapproved rr/jota normalization rejected');}
  assert.equal(registryFaults.length+specimenFaults.length+6,46);
 });
 test('S/G/R/A/T families, the B3159 chain and one received model display whole aids and dispatch Spanish study',async()=>{
  const{context,page}=await openPage();try{
   const selected=['catalogue:es:712','catalogue:es:619','catalogue:es:3159','catalogue:es:2452','catalogue:es:1148','catalogue:es:2256','catalogue:es:2825','catalogue:es:2205'];const covered=new Set(),audits=loadRegistries();
   for(const id of selected){await enter(page,fixture(id));const source=await checkDom(page,id);for(const rule of audits.A.entries.get(key('fr-es',id)).rules)covered.add(rule);if(id==='catalogue:es:3159')assert.deepEqual(source.phoneticCorrection,audits.A.entries.get(key('fr-es',id)).occurrences[0].expectedBefore.phoneticCorrection);}
   assert.deepEqual([...covered].sort(),['A','G','R','S','T']);
   const entry=[...audits.A.entries.values()].find(e=>e.id.startsWith('heard-authored:')),target=fixture(entry.id,true);await enter(page,target);const received=await checkDom(page,entry.id,'A',true);assert.equal(received.heardOnly,true);assert.equal(received.referenceOnly,true);assert.equal(await page.evaluate(()=>window.MelungaMockup.state().masked),false);
   const data=read('melunga_deploy/content/niveaux-progressifs/fr-es/L'+target.level+'.json'),step=data.themes[target.themeIndex].sequences.flatMap(s=>s.steps)[target.stepIndex];assert.equal(step.requiresProduction,false);assert.equal(step.countsForProgress,false);
  }finally{await context.close();}
 });
 test('three atomic Spanish bundles and two punctuation-only studies display and speak their exact complete editions',async()=>{
  const{context,page}=await openPage();try{
   for(const number of [1340,2727,3186,661,875]){const id='catalogue:es:'+number;await enter(page,fixture(id));const source=await checkDom(page,id,'B'),entry=loadRegistries().B.entries.get(key('fr-es',id));for(const[field,event]of Object.entries(entry.fields))assert.equal(source[field],event.after);if(!entry.fields.native)assert.equal(source.native,entry.occurrences[0].expectedBefore.native);if(!entry.fields.phon){assert.equal(source.phon,entry.occurrences[0].expectedBefore.phon);assert.equal(Object.hasOwn(source,'phoneticReviewStatus'),entry.occurrences[0].expectedBefore.phoneticReviewStatusPresent);if(entry.occurrences[0].expectedBefore.phoneticReviewStatusPresent)assert.equal(source.phoneticReviewStatus,entry.occurrences[0].expectedBefore.phoneticReviewStatus);else assert.equal(source.phoneticReviewStatus,undefined);assert.match(source.study,/^¡.+!$/);}}
  }finally{await context.close();}
 });
 test('all eighteen certain glosses reach the actual lesson DOM and the stomach support copy preserves the exact new meaning',async()=>{
  const{context,page}=await openPage();try{
   const glosses=[...loadRegistries().B.entries.values()].filter(e=>!e.atomicBundle&&e.fields.native);assert.equal(glosses.length,18);
   for(const entry of glosses){await enter(page,fixture(entry.id));const source=await checkDom(page,entry.id,'B');assert.equal(source.native,entry.fields.native.after);assert.equal(source.study,entry.occurrences[0].expectedBefore.study);assert.equal(source.phon,entry.occurrences[0].expectedBefore.phon);}
   const id='situation-support-conversation:fr-es:piste-douleur-simple-support-02',entry=loadRegistries().B.entries.get(key('fr-es',id)),copy=entry.occurrences.find(o=>o.profile==='transport-phrase');assert.equal(at(read(copy.path),copy.location).native,"l'estomac");
  }finally{await context.close();}
 });
 test('all three Spanish bundles and two punctuated studies fit complete mobile and desktop cards without scrolling',async()=>{
  const{context,page}=await openPage();try{
   for(const viewport of [{width:320,height:640},{width:1280,height:720}])for(const number of [1340,2727,3186,661,875]){
    await page.setViewportSize(viewport);await enter(page,fixture('catalogue:es:'+number));await checkDom(page,'catalogue:es:'+number,'B');
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
