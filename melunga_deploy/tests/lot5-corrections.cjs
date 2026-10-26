/* Independent proof and browser checks of lot5 paired Japanese aids/readings
 * and its separate certain glosses. No producer is imported. The private
 * reverse projection follows content -> paired fields -> served f22202c. */
'use strict';
const englishClassification = require('./english-classification.cjs');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const {isDeepStrictEqual}=require('node:util');
const lot6Corrections=require('./lot6-corrections.cjs');
const ROOT=path.resolve(__dirname,'..','..'),WEB=path.join(ROOT,'melunga_deploy');
const BASELINE='f22202cc4622c26794a6ada0c88d1741b82c1967';
const COMMIT='62daa86414d937b0554831a4c032e05b3046bb61';
const PREVIOUS={registryPath:'docs/niveaux-progressifs/corrections-contenu/lot3-lot4/revue-contenu-lot3-lot4.json',registrySha256:'346a85c459bb3adfc556c8946262509d19e9ffd46e65e9aa2dba40729aceab91'};
const REG_A='docs/niveaux-progressifs/corrections-phonetiques/lot5/revue-claude-lot5.json';
const REG_B='docs/niveaux-progressifs/corrections-contenu/lot5/revue-contenu-lot5.json';
const PROOFS={
 'docs/revue-integrale/lot5-fr-ja-L1-L10/registre-phonetique.json':{kind:'phon',sha256:'76a8bed5f6218fc74aa0fb75f7f19b2bcd9518aa1440780877d5dd03b6789158'},
 'docs/revue-integrale/lot5-fr-ja-L1-L10/registre-lectures.json':{kind:'reading',sha256:'2e863193df9228431b04011f343acc38af3bb4266921777291f97077100195c5'},
 'docs/revue-integrale/lot5-fr-ja-L1-L10/lot-contenu-gloses.json':{kind:'content',sha256:'2fd7c7b35af687260013d563b8f7bd4fd6e14bdce0e4d7025fc1dd4f847a5cd0'}
};
const SPEC={
 A:{path:REG_A,id:'revue-claude-lot5-phonetique-lectures',status:'frozen-paired-reading-events-not-global-native-approval',annotation:'lot5FieldCorrection',manifest:'lot5FieldCorrections',count:4,events:8,fields:8,objects:5,profiles:{canonical:4,'transport-phrase':1,'received-model':0}},
 B:{path:REG_B,id:'revue-contenu-lot5',status:'frozen-certain-gloss-events-not-global-native-approval',annotation:'lot5ContentCorrection',manifest:'lot5ContentCorrections',count:26,events:26,fields:26,objects:26,profiles:{canonical:26,'transport-phrase':0,'received-model':0}}
};
const PRIOR=['phoneticCorrection','reviewedFieldCorrection','lot4PhoneticCorrection','reviewedContentCorrection','lot5FieldCorrection'];
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
 assert.ok(descriptor.path.startsWith(which==='A'?'docs/niveaux-progressifs/corrections-phonetiques/lot5/':'docs/niveaux-progressifs/corrections-contenu/lot5/'));
 const file=path.resolve(ROOT,descriptor.path);assert.ok(file.startsWith(ROOT+path.sep));
 const raw=fs.readFileSync(file);assert.equal(hash(raw),pin.sha256,'frozen proof bytes');
 const git=execFileSync('git',['show',COMMIT+':'+descriptor.gitPath],{cwd:ROOT,maxBuffer:32*1024*1024});assert.ok(raw.equals(git),'proof is the actual Git object');
 const data=JSON.parse(raw);assert.equal(data.baseSnapshotCommit||data.reference,BASELINE);
 if(which==='A'){
  assert.equal(data.eventCount,4);assert.equal(data.events.length,4);
  return data.events.map((event,index)=>{assert.equal(event.pair,'fr-ja');if(pin.kind==='reading'){assert.equal(event.field,'reading');assert.equal(event.linkedPhonEvent,true);}
   return{descriptor,event,index,pair:'fr-ja',collection:'events',field:pin.kind,before:pin.kind==='phon'?event.beforePhon:event.beforeReading,after:pin.kind==='phon'?event.afterPhon:event.afterReading};});
 }
 assert.equal(data.certainCount,26);
 return data.items.flatMap((event,index)=>{if(event.certainty!=='certain')return[];assert.equal(event.field,'native');return[{descriptor,event,index,pair:'fr-ja',collection:'items',field:'native',before:event.before,after:event.after}];});
}
function annotationFor(which,entry,before,audit){
 const fields=Object.keys(entry.fields).sort();
 return{id:entry.id,registryPath:SPEC[which].path,registrySha256:audit.registrySha256,baseSnapshotCommit:BASELINE,
  fields,beforeFields:Object.fromEntries(fields.map(field=>[field,entry.fields[field].before])),
  originalPhoneticReviewStatusPresent:before.phoneticReviewStatusPresent,
  originalPhoneticReviewStatus:before.phoneticReviewStatusPresent?before.phoneticReviewStatus:null,
  evidenceCommits:[COMMIT]};
}
function statusFor(which,entry,before){return which==='A'?'corrected-by-Claude-lot5-'+entry.rules.join('+'):before.phoneticReviewStatus;}
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
 assert.equal(approved.size,spec.count);assert.equal([...approved.values()].reduce((n,p)=>n+p.proofs.length,0),spec.events);
 const entries=new Map(),profiles={canonical:0,'transport-phrase':0,'received-model':0},addresses=new Set();let objects=0,fieldCount=0;
 const audit={registry,registrySha256:hash(raw),entries,approved};
 for(const entry of registry.corrections){
  const id=key(entry.pairId,entry.id);assert.equal(entry.pairId,'fr-ja');assert.ok(!entries.has(id),'unique reviewed identity');const proof=approved.get(id);assert.ok(proof,'only pinned selected identities');
  assert.deepEqual(entry.fields,proof.fields,'whole paired fields or native gloss exactly follow evidence');assert.equal(entry.atomicBundle,which==='A','phon and reading form a single transaction');
  if(which==='A'){
   assert.deepEqual(Object.keys(entry.fields).sort(),['phon','reading']);
   assert.equal(proof.proofs.filter(p=>p.field==='phon').length,1);assert.equal(proof.proofs.filter(p=>p.field==='reading').length,1);
   assert.deepEqual(entry.rules,proof.proofs.find(p=>p.field==='phon').event.rules);
  }else{assert.deepEqual(Object.keys(entry.fields),['native']);assert.deepEqual(entry.rules,[]);}
  const ordered=which==='A'?[proof.proofs.find(p=>p.field==='phon'),proof.proofs.find(p=>p.field==='reading')]:proof.proofs;
  assert.deepEqual(entry.events,ordered.map(p=>({evidencePath:p.descriptor.path,evidenceCollection:p.collection,evidenceIndex:p.index})));
  assert.ok(entry.occurrences.length);
  for(const occurrence of entry.occurrences){
   assert.match(occurrence.path,/^melunga_deploy\/content\/niveaux-progressifs\/(?:fr-ja\/L(?:10|[1-9])|repertoires\/fr-ja)\.json$/);assert.ok(Object.hasOwn(profiles,occurrence.profile));
   const address=occurrence.path+'\0'+JSON.stringify(occurrence.location);assert.ok(!addresses.has(address));addresses.add(address);
   const original=at(baseline(occurrence.path),occurrence.location);assert.equal(original.id,entry.id);
   const before=which==='B'?applyAForProof(entry.pairId,original,previous):original;assert.deepEqual(occurrence.expectedBefore,beforeProfile(before),'complete before matches pinned served file');
   for(const p of proof.proofs){assert.equal(before[p.field],p.before);assert.equal(original.study,p.event.study);assert.equal(original.native,p.event.native??original.native);if(p.field==='phon')assert.equal(original.reading,p.event.reading);}
   profiles[occurrence.profile]++;objects++;
  }
  entries.set(id,entry);fieldCount+=Object.keys(entry.fields).length;
 }
 assert.equal(entries.size,spec.count);assert.equal(objects,spec.objects);assert.deepEqual(profiles,spec.profiles);assert.equal(fieldCount,spec.fields);
 if(which==='A')assert.deepEqual([...entries.keys()].sort(),[3630,3771,2400,4320].map(id=>key('fr-ja','catalogue:ja:'+id)).sort());
 return {...audit,profiles,objects};
}
function loadRegistries(overrides){if(!overrides&&cached)return cached;const A=loadBatch('A',overrides?.A),B=loadBatch('B',overrides?.B,A),result={A,B};if(!overrides)cached=result;return result;}
function projectStage(which,pair,phrase,expectedBefore){
 const audit=loadRegistries()[which],spec=SPEC[which],entry=audit.entries.get(key(pair,phrase.id));
 if(!entry){assert.equal(phrase[spec.annotation],undefined,'no unregistered lot5 annotation');return phrase;}
 const copy=clone(phrase),annotation=copy[spec.annotation];assert.ok(annotation&&typeof annotation==='object','review declaration required');
 for(const[field,event]of Object.entries(entry.fields))copy[field]=event.before;delete copy[spec.annotation];
 let before;
 for(const occurrence of entry.occurrences){const candidate=occurrence.expectedBefore;
  if(annotation.originalPhoneticReviewStatusPresent!==candidate.phoneticReviewStatusPresent||!isDeepStrictEqual(annotation.originalPhoneticReviewStatus,candidate.phoneticReviewStatus))continue;
  if(which==='A'){if(candidate.phoneticReviewStatusPresent)copy.phoneticReviewStatus=candidate.phoneticReviewStatus;else delete copy.phoneticReviewStatus;}
  if(isDeepStrictEqual(beforeProfile(copy),candidate)){before=candidate;break;}
 }
 assert.ok(before,'full before source and prior metadata agree');if(expectedBefore)assert.deepEqual(before,expectedBefore);
 assert.deepEqual(annotation,annotationFor(which,entry,before,audit),'exact source-bound annotation');
 for(const[field,event]of Object.entries(entry.fields))assert.equal(phrase[field],event.after,'whole reviewed after');
 assert.equal(Object.hasOwn(phrase,'phoneticReviewStatus'),which==='A'?true:before.phoneticReviewStatusPresent);
 if(which==='A'||before.phoneticReviewStatusPresent)assert.equal(phrase.phoneticReviewStatus,statusFor(which,entry,before));
 return copy;
}
function projectBefore(pair,phrase){phrase=lot6Corrections.projectBefore(pair,phrase);return projectStage('A',pair,projectStage('B',pair,phrase));}
function verifyPhrase(pair,phrase){projectBefore(pair,phrase);return phrase;}
function projectDocument(pair,document,isBank){
 const copy=clone(document);
 if(isBank){for(const field of ['phrases','receivedModels'])copy[field]=(copy[field]||[]).map(phrase=>projectBefore(pair,phrase));}
 else{for(const field of ['themes','heldThemes'])for(const theme of copy[field]||[])theme.phrases=theme.phrases.map(phrase=>projectBefore(pair,phrase));copy.reserve=(copy.reserve||[]).map(phrase=>projectBefore(pair,phrase));}
 return copy;
}
function declaration(which,audit=loadRegistries()[which]){const r=audit.registry;return{registryPath:SPEC[which].path,registrySha256:audit.registrySha256,baseSnapshotCommit:BASELINE,appliesAfter:r.appliesAfter,correctionCount:r.correctionCount,eventCount:r.eventCount,approvedFieldCount:r.approvedFieldCount,changedFieldCount:r.changedFieldCount,evidenceCommits:[COMMIT]};}
function manifestDeclarations(){return {...Object.fromEntries(['A','B'].map(which=>[SPEC[which].manifest,declaration(which)])),...lot6Corrections.manifestDeclarations()};}
function inputFiles(){const audits=loadRegistries();return[__filename,...['A','B'].flatMap(which=>[path.join(ROOT,SPEC[which].path),...audits[which].registry.evidenceFiles.map(file=>path.join(ROOT,file.path))]),...lot6Corrections.inputFiles()];}
function auditRuntime(){
 const lot6Audit=lot6Corrections.auditRuntime();
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
 const reserved=audits.A.entries.get(key('fr-ja','catalogue:ja:3771'));assert.equal(reserved.occurrences.length,1);const occurrence=reserved.occurrences[0];assert.equal(occurrence.location[0],'reserve');
 for(const level of manifest.pairs.find(pair=>pair.id==='fr-ja').levels){const data=read('melunga_deploy/'+level.dataPath);for(const theme of data.themes)for(const sequence of theme.sequences)assert.ok(sequence.steps.every(step=>step.utterance!==reserved.id),'reserved pattern never becomes a production exercise');}
 assert.equal(stats.A.changedFields,10);assert.equal(stats.B.changedFields,26);
 return{pairedFields:stats.A,content:stats.B,files:77,changedRuntimeFields:36,objects:31,lot6:lot6Audit};
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
 function fixture(id,later=false){
  const pair=read('melunga_deploy/content/niveaux-progressifs/manifest.json').pairs.find(pair=>pair.id==='fr-ja');
  for(const level of pair.levels){const data=read('melunga_deploy/'+level.dataPath);for(const[themeIndex,theme]of data.themes.entries()){
   const steps=theme.sequences.flatMap(sequence=>sequence.steps),stepIndex=steps.findIndex(step=>step.utterance===id&&step.kind==='understand');
   const reused=[...(theme.reviewReferences||[]),...(theme.contextReferences||[])].some(ref=>ref.id===id);
   if(stepIndex>=0&&reused===later)return{pairId:'fr-ja',id,level:level.level,themeIndex,stepIndex};
  }}throw new Error('No real active fixture '+id+'/later='+later);
 }
 async function openPage(){
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  await context.addInitScript(()=>{window.__lot5Speech=[];window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},getVoices(){return[];},addEventListener(){},speak(item){window.__lot5Speech.push({text:item.text,lang:item.lang});item.onend?.();}}});});
  await context.route('**/*',async route=>{const url=new URL(route.request().url());if(url.origin!==base||/\/(?:\.netlify|api)\//.test(url.pathname)){requests.push(url.origin+url.pathname);await route.abort();}else await route.continue();});
  const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));return{context,page};
 }
 async function enter(page,target){
  await page.goto(base+'/parcours-niveaux.html?pair=fr-ja&level='+target.level);
  await page.waitForFunction(target=>window.MelungaMockup?.state().screen==='themes'&&window.MelungaMockup.state().pairId==='fr-ja'&&window.MelungaMockup.state().level===target.level,target);
  await page.locator('#mgThemeGrid > button').nth(target.themeIndex).click();
  await page.evaluate(target=>{while(window.MelungaMockup.state().stepIndex<target.stepIndex){document.querySelector('#mgChoices:not([hidden]) button')?.click();const button=document.getElementById('mgContinue');if(button.disabled)throw new Error('Blocked real lesson fixture');button.click();}},target);
  assert.equal(await page.evaluate(()=>window.MelungaMockup.state().phraseId),target.id);
 }
 function sourceFor(which,id,copy=false){const entry=loadRegistries()[which].entries.get(key('fr-ja',id));assert.ok(entry);const occurrence=copy?entry.occurrences.find(o=>o.profile==='transport-phrase'):entry.occurrences.find(o=>o.profile==='canonical');assert.ok(occurrence);return at(read(occurrence.path),occurrence.location);}
 async function checkDom(page,id,which='A',copy=false){
  const source=sourceFor(which,id,copy);assert.equal(await page.locator('#mgPhrase').textContent(),source.study);assert.equal(await page.locator('#mgPhon').textContent(),source.phon);assert.equal(await page.locator('#mgTranslation').textContent(),source.native);assert.equal(await page.locator('#mgReading').textContent(),source.reading||'');
  await page.click('#mgEar');const spoken=await page.evaluate(()=>window.__lot5Speech.at(-1));assert.equal(spoken.text,source.study,'TTS uses the whole unchanged Japanese study, never reading or aid');assert.equal(spoken.lang.split('-')[0],'ja');return source;
 }
 async function readingButton(page){if(!await page.locator('#mgReadingToggle').isVisible())await page.click('#mgHelp');await page.click('#mgReadingToggle');if(await page.locator('#mgHelpPanel').isVisible())await page.click('#mgHelp');}
 test('4 paired aids/readings and 26 selected glosses preserve complete runtime documents and all original UI/access fields',()=>{
  assert.equal(auditRuntime().changedRuntimeFields,36);
  assert.equal(loadRegistries().A.entries.get(key('fr-ja','catalogue:ja:3771')).occurrences[0].location[0],'reserve');
 });
 test('partial pair, forged source, wrong proof, unapproved gloss and stale transport values are rejected',()=>{
  const audits=loadRegistries();
  const registryFaults=[
   ['A',r=>{delete r.corrections[0].fields.reading;}],
   ['A',r=>{delete r.corrections[0].fields.phon;}],
   ['A',r=>{r.corrections[0].atomicBundle=false;}],
   ['A',r=>{r.corrections[0].fields.reading.after+='bad';}],
   ['A',r=>{r.corrections[0].fields.study={before:'x',after:'y'};}],
   ['A',r=>{r.corrections[0].events.pop();}],
   ['A',r=>{r.corrections[0].rules=['automatic'];}],
   ['A',r=>{r.evidenceFiles[0].sha256='0'.repeat(64);}],
   ['A',r=>{r.corrections[0].occurrences[0].expectedBefore.source.collection='fake';}],
   ['A',r=>{r.appliesAfter[0].registrySha256='0'.repeat(64);}],
   ['B',r=>{r.corrections[0].fields.native.after+='bad';}],
   ['B',r=>{r.corrections[0].id='catalogue:ja:652';}],
   ['B',r=>{r.corrections[0].fields.phon={before:'x',after:'y'};}],
   ['B',r=>{r.corrections[0].atomicBundle=true;}]
  ];
  for(const[which,mutate]of registryFaults){const bad=clone(audits[which].registry);mutate(bad);assert.throws(()=>loadRegistries({[which]:bad}));}
  const specimenFaults=[
   ['A','catalogue:ja:3630',p=>{p.phon='cho-kki a-ra-i-ki';}],
   ['A','catalogue:ja:3630',p=>{p.reading='sho-k-ki a-ra-i-ki';}],
   ['A','catalogue:ja:2400',p=>{delete p.lot5FieldCorrection;}],
   ['A','catalogue:ja:4320',p=>{p.lot5FieldCorrection.registrySha256='0'.repeat(64);}],
   ['A','catalogue:ja:4320',p=>{p.phoneticReviewStatus='native-approved';}],
   ['A','catalogue:ja:3771',p=>{p.source.sourceSha256='0'.repeat(64);}],
   ['B','catalogue:ja:1684',p=>{p.native='Cette place est prise ?';}],
   ['B','catalogue:ja:1956',p=>{p.reading+='bad';}],
   ['B','catalogue:ja:1956',p=>{p.phoneticReviewStatus='native-approved';}],
   ['B','catalogue:ja:3002',p=>{delete p.lot5ContentCorrection;}]
  ];
  for(const[which,id,mutate]of specimenFaults){const bad=clone(sourceFor(which,id));mutate(bad);assert.throws(()=>verifyPhrase('fr-ja',bad));}
  const copy=clone(sourceFor('A','catalogue:ja:4320',true));copy.reading='bo-di-i so-o-pu';assert.throws(()=>verifyPhrase('fr-ja',copy),'transport cannot keep its former reading');
  const reserved=clone(sourceFor('A','catalogue:ja:3771'));reserved.contentType='utterance';assert.throws(()=>assert.deepEqual(projectBefore('fr-ja',reserved),at(baseline(audits.A.entries.get(key('fr-ja',reserved.id)).occurrences[0].path),audits.A.entries.get(key('fr-ja',reserved.id)).occurrences[0].location)),'reserve metadata cannot be silently changed');
  assert.equal(registryFaults.length+specimenFaults.length+2,26);
 });
 test('three active aid/reading pairs and the later 4320 transport copy display exact final values and speak unchanged Japanese',async()=>{
  const{context,page}=await openPage();try{
   for(const number of [3630,2400,4320]){
    const id='catalogue:ja:'+number;await enter(page,fixture(id));const source=await checkDom(page,id);
    await readingButton(page);assert.equal(await page.locator('#mgPhon').textContent(),source.phon,'Japanese keeps its adapted aid while the separate reading is shown');assert.equal(await page.locator('#mgReading').textContent(),source.reading);assert.equal(await page.locator('#mgReading').isVisible(),true);await page.click('#mgEar');assert.equal(await page.evaluate(()=>window.__lot5Speech.at(-1).text),source.study);
    await readingButton(page);assert.equal(await page.locator('#mgPhon').textContent(),source.phon);assert.equal(await page.locator('#mgReading').isVisible(),false);
   }
   await enter(page,fixture('catalogue:ja:4320',true));const copy=await checkDom(page,'catalogue:ja:4320','A',true);assert.equal(copy.reading,'bo-di so-o-pu');assert.equal(copy.phon,'bo-di so-o-pou');
  }finally{await context.close();}
 });
 test('all five 日本語 glosses say Japanese, the seat question keeps its polarity and other selected meanings are shown',async()=>{
  const{context,page}=await openPage();try{
   for(const number of [1956,2352,2395,2615,2647]){const id='catalogue:ja:'+number;await enter(page,fixture(id));const source=await checkDom(page,id,'B');assert.ok(source.native.includes('japonais'));assert.ok(!source.native.includes('français'));}
   for(const[number,expected]of [[1684,'Cette place est libre ?'],[3002,'Peu importe.'],[956,'Il fait en dessous de zéro.'],[707,'Nous allons vous rembourser.']]){const id='catalogue:ja:'+number;await enter(page,fixture(id));const source=await checkDom(page,id,'B');assert.equal(source.native,expected);}
  }finally{await context.close();}
 });
 test('the longer corrected quoted-word gloss still fits the complete mobile and desktop card',async()=>{
  const{context,page}=await openPage();try{
   for(const viewport of [{width:320,height:640},{width:1280,height:720}]){
    await page.setViewportSize(viewport);await enter(page,fixture('catalogue:ja:2615'));await checkDom(page,'catalogue:ja:2615','B');
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
