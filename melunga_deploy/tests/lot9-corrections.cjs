/* Independent proof and browser checks of lot9 whole Italian aids
 * and its separate certain glosses/bundles. No producer is imported. The private
 * reverse projection follows content -> reviewed fields -> served 40d4c0b. */
'use strict';
// Historical source/browser fixtures use the independently validated finite inverse.
// Actual current-content DOM acceptance lives in uncertain-content.cjs and the matrix.
const uncertainContent = require('./uncertain-content.cjs');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const {isDeepStrictEqual}=require('node:util');
const ROOT=path.resolve(__dirname,'..','..'),WEB=path.join(ROOT,'melunga_deploy');
const BASELINE='40d4c0b264b364fe31d4fd1bc9acae03dc130e01';
const COMMIT='5d450cc79f32d180f9331c5d06387fe36e8d94a6';
const PREVIOUS={registryPath:'docs/niveaux-progressifs/corrections-phonetiques/lot8-errata-1/revue-claude-lot8-errata-1.json',registrySha256:'cbbfa4e5f1ca6afd83e53eb8f12045d3cd0d2d7e879f1053efa69bf4e9e1361e'};
const REG_A='docs/niveaux-progressifs/corrections-phonetiques/lot9/revue-claude-lot9.json';
const REG_B='docs/niveaux-progressifs/corrections-contenu/lot9/revue-contenu-lot9.json';
const PROOFS={
 'docs/revue-integrale/lot9-fr-it-L1-L10/registre-phonetique.json':{kind:'phon',sha256:'661131a84a421f29d017872879713ccc3ddcbd8a5f4f9b441a312dcedaaa51e9'},
 'docs/revue-integrale/lot9-fr-it-L1-L10/lot-contenu-gloses.json':{kind:'content',sha256:'cf20a6f4595f4e8c3627aac8bd4956ef5724bd9f220b2676288a88878f4636a0'}
};
const SPEC={
 A:{path:REG_A,id:'revue-claude-lot9-phonetique',status:'frozen-whole-phonetic-events-not-global-native-approval',annotation:'lot9PhoneticCorrection',manifest:'lot9PhoneticCorrections',count:70,events:70,fields:70,objects:74,profiles:{canonical:69,'transport-phrase':4,'received-model':1}},
 B:{path:REG_B,id:'revue-contenu-lot9',status:'frozen-certain-gloss-and-linked-bundle-events-not-global-native-approval',annotation:'lot9ContentCorrection',manifest:'lot9ContentCorrections',count:37,events:37,fields:43,objects:37,profiles:{canonical:35,'transport-phrase':0,'received-model':2}}
};
const PRIOR=['phoneticCorrection','reviewedFieldCorrection','lot4PhoneticCorrection','reviewedContentCorrection','lot5FieldCorrection','lot5ContentCorrection','lot6FieldCorrection','lot6ContentCorrection','lot7PhoneticCorrection','lot7ContentCorrection','lot8PhoneticCorrection','lot8ContentCorrection','lot8Erratum1Correction','lot9PhoneticCorrection'];
const clone=value=>JSON.parse(JSON.stringify(value));
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const read=filename=>uncertainContent.beforeRead(filename,fs.readFileSync(path.join(ROOT,filename),'utf8'));
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
const ERR={path:'docs/niveaux-progressifs/corrections-phonetiques/lot8-errata-1/revue-claude-lot8-errata-1.json',commit:'76602a1b0be0a3539171090733d0a17b079644c6',gitPath:'docs/revue-integrale/lot8-fr-es-L1-L10/errata-1.json',proofSha256:'480f4c9348a393d29f1c3c3d6d0ffe5e16b01e802d94403840d90c15b52f7535',annotation:'lot8Erratum1Correction',before:'KOUM-plé la NOR-ma é-né sé-TÉN-ta i OU-no',after:'KOUM-plé la NOR-ma é É-né sé-TÉN-ta i OU-no'};
let erratumCache;
function loadErratum(override){
 if(!override&&erratumCache)return erratumCache;
 const raw=fs.readFileSync(path.join(ROOT,ERR.path)),r=override||JSON.parse(raw);assert.equal(r.version,1);assert.equal(r.status,'frozen-whole-phonetic-erratum-not-global-native-approval');assert.equal(r.id,'revue-claude-lot8-errata-1');assert.equal(r.baseSnapshotCommit,BASELINE);
 for(const field of ['correctionCount','eventCount','approvedFieldCount','changedFieldCount'])assert.equal(r[field],1);
 assert.deepEqual(r.appliesAfter,[{registryPath:'docs/niveaux-progressifs/corrections-contenu/lot8/revue-contenu-lot8.json',registrySha256:'756c2e867928b24a0e4e8a86216072f4fea2dfa832d3938b5e38dc622c01a8ce'}]);
 assert.equal(r.evidenceFiles.length,1);const d=r.evidenceFiles[0];assert.equal(d.gitCommit,ERR.commit);assert.equal(d.gitPath,ERR.gitPath);assert.equal(d.sha256,ERR.proofSha256);assert.ok(d.path.startsWith('docs/niveaux-progressifs/corrections-phonetiques/lot8-errata-1/'));
 const proof=fs.readFileSync(path.join(ROOT,d.path));assert.equal(hash(proof),ERR.proofSha256);assert.ok(proof.equals(execFileSync('git',['show',ERR.commit+':'+ERR.gitPath],{cwd:ROOT})));const e=JSON.parse(proof).events[0];assert.equal(e.id,'catalogue:es:2205');assert.equal(e.beforePhon,'KOUM-plé la NOR-ma én');assert.equal(e.deliveredAfterPhon,ERR.before);assert.equal(e.afterPhon,ERR.after);
 assert.equal(r.corrections.length,1);const entry=r.corrections[0];assert.equal(entry.pairId,'fr-es');assert.equal(entry.id,e.id);assert.deepEqual(entry.fields,{phon:{before:ERR.before,after:ERR.after}});assert.deepEqual(entry.rules,['S']);assert.equal(entry.atomicBundle,false);assert.deepEqual(entry.events,[{evidencePath:d.path,evidenceCollection:'events',evidenceIndex:0}]);
 assert.equal(entry.occurrences.length,1);const o=entry.occurrences[0];assert.equal(o.path,'melunga_deploy/content/niveaux-progressifs/fr-es/L6.json');assert.deepEqual(o.location,['themes',8,'phrases',143]);assert.equal(o.profile,'canonical');const before=at(baseline(o.path),o.location);assert.equal(before.id,e.id);assert.equal(before.study,e.study);assert.equal(before.phon,ERR.before);assert.deepEqual(o.expectedBefore,beforeProfile(before));
 const out={registry:r,registrySha256:hash(raw),entry,occurrence:o};if(!override)erratumCache=out;return out;
}
function erratumAnnotation(audit=loadErratum()){
 const before=audit.occurrence.expectedBefore;return{id:'catalogue:es:2205',registryPath:ERR.path,registrySha256:audit.registrySha256,baseSnapshotCommit:BASELINE,fields:['phon'],beforeFields:{phon:ERR.before},originalPhoneticReviewStatusPresent:before.phoneticReviewStatusPresent,originalPhoneticReviewStatus:before.phoneticReviewStatusPresent?before.phoneticReviewStatus:null,evidenceCommits:[ERR.commit]};
}
function projectErratum(pair,phrase){
 if(pair!=='fr-es'||phrase.id!=='catalogue:es:2205'){assert.equal(phrase[ERR.annotation],undefined,'no unregistered erratum');return phrase;}
 const audit=loadErratum();assert.equal(phrase.phon,ERR.after);assert.equal(phrase.phoneticReviewStatus,'corrected-by-Claude-lot8-errata-1-S');assert.deepEqual(phrase[ERR.annotation],erratumAnnotation(audit));const copy=clone(phrase);copy.phon=ERR.before;const old=audit.occurrence.expectedBefore;if(old.phoneticReviewStatusPresent)copy.phoneticReviewStatus=old.phoneticReviewStatus;else delete copy.phoneticReviewStatus;delete copy[ERR.annotation];assert.deepEqual(beforeProfile(copy),old,'old lot8 annotation preserved');return copy;
}
function erratumDeclaration(){const audit=loadErratum(),r=audit.registry;return{registryPath:ERR.path,registrySha256:audit.registrySha256,baseSnapshotCommit:BASELINE,appliesAfter:r.appliesAfter,correctionCount:1,eventCount:1,approvedFieldCount:1,changedFieldCount:1,evidenceCommits:[ERR.commit]};}
function erratumInputs(){const a=loadErratum();return[path.join(ROOT,ERR.path),path.join(ROOT,a.registry.evidenceFiles[0].path)];}
function auditErratum(){const a=loadErratum(),phrase=at(read(a.occurrence.path),a.occurrence.location);assert.deepEqual(projectErratum('fr-es',phrase),at(baseline(a.occurrence.path),a.occurrence.location));return{identities:1,events:1,objects:1,changedFields:1,oldLot8AnnotationPreserved:true};}

let cached;
function proofSelection(descriptor,which){
 const pin=PROOFS[descriptor.gitPath];assert.ok(pin,'independently named frozen proof');
 assert.equal(descriptor.gitCommit,COMMIT);assert.equal(descriptor.sha256,pin.sha256);
 assert.equal(pin.kind==='content',which==='B');
 assert.ok(descriptor.path.startsWith(which==='A'?'docs/niveaux-progressifs/corrections-phonetiques/lot9/':'docs/niveaux-progressifs/corrections-contenu/lot9/'));
 const file=path.resolve(ROOT,descriptor.path);assert.ok(file.startsWith(ROOT+path.sep));
 const raw=fs.readFileSync(file);assert.equal(hash(raw),pin.sha256,'frozen proof bytes');
 const git=execFileSync('git',['show',COMMIT+':'+descriptor.gitPath],{cwd:ROOT,maxBuffer:32*1024*1024});assert.ok(raw.equals(git),'proof is the actual Git object');
 const data=JSON.parse(raw);assert.equal(data.baseSnapshotCommit||data.reference,BASELINE);
 if(which==='A'){
  assert.equal(data.eventCount,70);assert.equal(data.events.length,70);
  return data.events.map((event,index)=>{assert.equal(event.pair,'fr-it');assert.ok(event.rules.length&&event.rules.every(rule=>['N','S','T','A'].includes(rule)));return{descriptor,event,index,pair:'fr-it',collection:'events',field:'phon',before:event.beforePhon,after:event.afterPhon};});
 }
 assert.equal(data.certainCount,34);
 return [...data.items.flatMap((event,index)=>{if(event.certainty!=='certain')return[];assert.ok(['native','study'].includes(event.field));return[{descriptor,event,index,pair:'fr-it',collection:'items',field:event.field,before:event.before,after:event.after}];}),
  ...data.linkedBundles.flatMap((event,index)=>{assert.equal(event.certainty,'certain');assert.equal(event.applyTogether,true);assert.ok(['phon,native,study','native,phon,study','phon,study'].includes(Object.keys(event.before).sort().join(',')));assert.deepEqual(Object.keys(event.before).sort(),Object.keys(event.after).sort());return Object.keys(event.before).map(field=>({descriptor,event,index,pair:'fr-it',collection:'linkedBundles',field,before:event.before[field],after:event.after[field]}));})];
}

function annotationFor(which,entry,before,audit){
 const fields=Object.keys(entry.fields).sort();
 return{id:entry.id,registryPath:SPEC[which].path,registrySha256:audit.registrySha256,baseSnapshotCommit:BASELINE,
  fields,beforeFields:Object.fromEntries(fields.map(field=>[field,entry.fields[field].before])),
  originalPhoneticReviewStatusPresent:before.phoneticReviewStatusPresent,
  originalPhoneticReviewStatus:before.phoneticReviewStatusPresent?before.phoneticReviewStatus:null,
  evidenceCommits:[COMMIT]};
}
function statusFor(which,entry,before){if(!entry.fields.phon)return before.phoneticReviewStatus;return which==='A'?'corrected-by-Claude-lot9-'+entry.rules.join('+'):'corrected-by-Claude-content-lot9';}
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
 assert.equal(approved.size,spec.count);assert.equal([...approved.values()].reduce((n,p)=>n+new Set(p.proofs.map(p=>p.collection+':'+p.index)).size,0),which==='A'?70:37);
 const entries=new Map(),profiles={canonical:0,'transport-phrase':0,'received-model':0},addresses=new Set();let objects=0,fieldCount=0;
 const audit={registry,registrySha256:hash(raw),entries,approved};
 for(const entry of registry.corrections){
  const id=key(entry.pairId,entry.id);assert.equal(entry.pairId,'fr-it');assert.ok(!entries.has(id),'unique reviewed identity');const proof=approved.get(id);assert.ok(proof,'only pinned selected identities');
  assert.deepEqual(entry.fields,proof.fields,'whole phonetic events or native gloss exactly follow evidence');assert.equal(entry.atomicBundle,which==='A'?false:proof.proofs[0].collection==='linkedBundles','only linked whole fields form a single transaction');
  if(which==='A'){
   assert.deepEqual(Object.keys(entry.fields),['phon']);assert.equal(proof.proofs.length,1);assert.deepEqual(entry.rules,proof.proofs[0].event.rules);
  }else{assert.deepEqual(Object.keys(entry.fields).sort(),entry.atomicBundle?Object.keys(proof.fields).sort():[proof.proofs[0].field]);assert.deepEqual(entry.rules,[]);}
  assert.deepEqual(entry.events,[proof.proofs[0]].map(p=>({evidencePath:p.descriptor.path,evidenceCollection:p.collection,evidenceIndex:p.index})));
  assert.ok(entry.occurrences.length);
  for(const occurrence of entry.occurrences){
   assert.match(occurrence.path,/^melunga_deploy\/content\/niveaux-progressifs\/(?:fr-it\/L(?:10|[1-9])|repertoires\/fr-it)\.json$/);assert.ok(Object.hasOwn(profiles,occurrence.profile));
   const address=occurrence.path+'\0'+JSON.stringify(occurrence.location);assert.ok(!addresses.has(address));addresses.add(address);
   const original=at(baseline(occurrence.path),occurrence.location);assert.equal(original.id,entry.id);const inferred=occurrence.path.includes('/repertoires/')?(occurrence.location[0]==='receivedModels'?'received-model':'transport-phrase'):'canonical';assert.equal(occurrence.profile,inferred,'profile follows actual served role');
   const before=which==='B'?applyAForProof(entry.pairId,original,previous):original;assert.deepEqual(occurrence.expectedBefore,beforeProfile(before),'complete before matches pinned served file');
   for(const p of proof.proofs){assert.equal(before[p.field],p.before);if(p.collection!=='linkedBundles')assert.equal(original.study,p.event.study);assert.equal(original.native,p.event.native??original.native);if(which==='A'){assert.equal(Object.hasOwn(original,'reading'),false,'Italian has no source reading');assert.equal(PRIOR.some(field=>field!=='lot9PhoneticCorrection'&&Object.hasOwn(original,field)),p.event.priorCorrection);}}
   profiles[occurrence.profile]++;objects++;
  }
  if(which==='A'){const event=proof.proofs[0].event;assert.ok(entry.occurrences.some(o=>o.path===event.occurrence.path&&isDeepStrictEqual(o.location,event.occurrence.location)),'source proof anchor retained');assert.equal(entry.occurrences.filter(o=>o.profile==='transport-phrase').length,event.transportCopies);assert.equal(entry.occurrences.filter(o=>o.profile!=='transport-phrase').length,1);}
  entries.set(id,entry);fieldCount+=Object.keys(entry.fields).length;
 }
 assert.equal(entries.size,spec.count);assert.equal(objects,spec.objects);assert.deepEqual(profiles,spec.profiles);assert.equal(fieldCount,spec.fields);
 if(which==='A'){assert.ok([...entries.values()].every(e=>!e.atomicBundle));const counts={};for(const entry of entries.values())for(const rule of entry.rules)counts[rule]=(counts[rule]||0)+1;assert.deepEqual(counts,{N:63,S:3,A:1,T:3});}
 return {...audit,profiles,objects};
}
function loadRegistries(overrides){if(!overrides&&cached)return cached;const A=loadBatch('A',overrides?.A),B=loadBatch('B',overrides?.B,A),result={A,B};if(!overrides)cached=result;return result;}
function projectStage(which,pair,phrase,expectedBefore){
 const audit=loadRegistries()[which],spec=SPEC[which],entry=audit.entries.get(key(pair,phrase.id));
 if(!entry){assert.equal(phrase[spec.annotation],undefined,'no unregistered lot9 annotation');return phrase;}
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
function projectBefore(pair,phrase){phrase=uncertainContent.projectPhrase(pair,phrase);return projectErratum(pair,projectStage('A',pair,projectStage('B',pair,phrase)));}
function verifyPhrase(pair,phrase){projectBefore(pair,phrase);return phrase;}
function projectDocument(pair,document,isBank){
 const copy=clone(document);
 if(isBank){for(const field of ['phrases','receivedModels'])copy[field]=(copy[field]||[]).map(phrase=>projectBefore(pair,phrase));}
 else{for(const field of ['themes','heldThemes'])for(const theme of copy[field]||[])theme.phrases=theme.phrases.map(phrase=>projectBefore(pair,phrase));copy.reserve=(copy.reserve||[]).map(phrase=>projectBefore(pair,phrase));}
 return copy;
}
function declaration(which,audit=loadRegistries()[which]){const r=audit.registry;return{registryPath:SPEC[which].path,registrySha256:audit.registrySha256,baseSnapshotCommit:BASELINE,appliesAfter:r.appliesAfter,correctionCount:r.correctionCount,eventCount:r.eventCount,approvedFieldCount:r.approvedFieldCount,changedFieldCount:r.changedFieldCount,evidenceCommits:[COMMIT]};}
function manifestDeclarations(){return {...Object.fromEntries(['A','B'].map(which=>[SPEC[which].manifest,declaration(which)])),lot8Erratum1Corrections:erratumDeclaration()};}
function inputFiles(){const audits=loadRegistries();return[__filename,...uncertainContent.inputFiles(),...erratumInputs(),...['A','B'].flatMap(which=>[path.join(ROOT,SPEC[which].path),...audits[which].registry.evidenceFiles.map(file=>path.join(ROOT,file.path))])];}
function auditRuntime(){
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
 const expected=clone(old);Object.assign(expected,manifestDeclarations());for(const pair of expected.pairs)pair.repertoireSha256=hash(uncertainContent.beforeBytes(path.join(WEB,pair.repertoirePath)));assert.deepEqual(manifest,expected,'only three new declarations and actual bank hashes');
 for(const filename of ['app.html','maquette-guidee.js','maquette-guidee.css','parcours-niveaux.html','maquette-guidee.html'])assert.ok(uncertainContent.beforeAssetBytes(path.join(WEB,filename)).equals(execFileSync('git',['show',BASELINE+':melunga_deploy/'+filename],{cwd:ROOT,maxBuffer:32*1024*1024})),'historical UI and current classic source bytes preserved');
 assert.equal(stats.A.changedFields,74);assert.equal(stats.B.changedFields,43);
 assert.deepEqual([...audits.A.entries.keys()].filter(id=>audits.B.entries.has(id)),[key('fr-it','catalogue:it:1736')],'one explicit A→B identity chain');
 const erratum= auditErratum();
 return{phonetic:stats.A,content:stats.B,erratum,files:77,changedRuntimeFields:118,objects:112,distinctObjects:111};
}
module.exports={loadRegistries,verifyPhrase,projectBefore,projectDocument,manifestDeclarations,declaration,auditRuntime,inputFiles,baseline,beforeProfile,projectStage,loadErratum,projectErratum};

if(require.main===module){
 const {test,before,after}=require('node:test'),http=require('node:http'),{chromium}=require('playwright-core');
 let server,browser,base;const errors=[],requests=[],snapshots=new Map();
 before(async()=>{
  const files=inputFiles(),manifest=read('melunga_deploy/content/niveaux-progressifs/manifest.json');files.push(path.join(WEB,'content/niveaux-progressifs/manifest.json'));
  for(const pair of manifest.pairs)files.push(path.join(WEB,pair.repertoirePath),...pair.levels.map(level=>path.join(WEB,level.dataPath)));
  for(const file of ['app.html','maquette-guidee.js','maquette-guidee.css','parcours-niveaux.html'])files.push(path.join(WEB,file));
  for(const file of files)snapshots.set(file,hash(fs.readFileSync(file)));
  server=http.createServer((req,res)=>{const file=path.resolve(WEB,'.'+new URL(req.url,'http://local').pathname);if(!file.startsWith(WEB+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())return res.writeHead(404).end();res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css'})[path.extname(file)]||'application/octet-stream');// This server is a historical inverse fixture, validated against actual bytes first.
      if (file.includes('/content/niveaux-progressifs/')) return res.end(uncertainContent.beforeBytes(file));
      // Historical fixture assets are exposed only after the current A/B/C edition is verified.
      if (['maquette-guidee.js', 'parcours-niveaux.html', 'maquette-guidee.html'].includes(path.relative(WEB, file))) return res.end(uncertainContent.beforeAssetBytes(file));
      fs.createReadStream(file).pipe(res);});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base='http://127.0.0.1:'+server.address().port;
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 });
 after(async()=>{await browser?.close();if(server)await new Promise(resolve=>server.close(resolve));assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);for(const[file,beforeHash]of snapshots)assert.equal(hash(fs.readFileSync(file)),beforeHash,'stable test input: '+file);});
 function fixture(id,received=false,pairId='fr-it'){
  const pair=read('melunga_deploy/content/niveaux-progressifs/manifest.json').pairs.find(pair=>pair.id===pairId);
  for(const level of pair.levels){const data=read('melunga_deploy/'+level.dataPath);for(const[themeIndex,theme]of data.themes.entries()){
   const steps=theme.sequences.flatMap(sequence=>sequence.steps),stepIndex=steps.findIndex(step=>step.utterance===id&&step.kind===(received?'receive':'understand'));
   if(stepIndex>=0)return{pairId,id,level:level.level,themeIndex,stepIndex};
  }}throw new Error('No real active fixture '+id+'/received='+received);
 }
 async function openPage(){
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  await context.addInitScript(()=>{window.__lot9Speech=[];window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},getVoices(){return[];},addEventListener(){},speak(item){window.__lot9Speech.push({text:item.text,lang:item.lang});item.onend?.();}}});});
  await context.route('**/*',async route=>{const url=new URL(route.request().url());if(url.origin!==base||/\/(?:\.netlify|api)\//.test(url.pathname)){requests.push(url.origin+url.pathname);await route.abort();}else await route.continue();});
  const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));return{context,page};
 }
 async function enter(page,target){
  await page.goto(base+'/parcours-niveaux.html?pair='+target.pairId+'&level='+target.level);
  await page.waitForFunction(target=>window.MelungaMockup?.state().screen==='themes'&&window.MelungaMockup.state().pairId===target.pairId&&window.MelungaMockup.state().level===target.level,target);
  await page.locator('#mgThemeGrid > button').nth(target.themeIndex).click();
  await page.evaluate(target=>{while(window.MelungaMockup.state().stepIndex<target.stepIndex){document.querySelector('#mgChoices:not([hidden]) button')?.click();const button=document.getElementById('mgContinue');if(button.disabled)throw new Error('Blocked real lesson fixture');button.click();}},target);
  assert.equal(await page.evaluate(()=>window.MelungaMockup.state().phraseId),target.id);
 }
 function sourceFor(which,id,received=false){const entry=loadRegistries()[which].entries.get(key('fr-it',id));assert.ok(entry);const occurrence=received?entry.occurrences.find(o=>o.profile==='received-model'):entry.occurrences.find(o=>o.profile==='canonical');assert.ok(occurrence);return at(read(occurrence.path),occurrence.location);}
 async function checkDom(page,id,which='A',received=false){
  const source=sourceFor(which,id,received);assert.equal(await page.locator('#mgPhrase').textContent(),source.study);assert.equal(await page.locator('#mgPhon').textContent(),source.phon);assert.equal(await page.locator('#mgTranslation').textContent(),source.native);assert.equal(await page.locator('#mgReading').textContent(),source.reading||'');
  await page.click('#mgEar');const spoken=await page.evaluate(()=>window.__lot9Speech.at(-1));assert.equal(spoken.text,source.study,'TTS uses the whole unchanged Italian study, never reading or aid');assert.equal(spoken.lang.split('-')[0],'it');return source;
 }
 test('70 frozen Italian aids, 37 content events and one EN71 erratum preserve all 77 runtime documents',()=>{
  const audit=auditRuntime();assert.equal(audit.changedRuntimeFields,118);assert.equal(audit.objects,112);assert.equal(audit.distinctObjects,111);
  const reserved=['catalogue:it:3092','catalogue:it:4091'];for(const id of reserved){const e=loadRegistries().B.entries.get(key('fr-it',id));assert.ok(e.occurrences.some(o=>o.location[0]==='reserve'));}
  const manifest=read('melunga_deploy/content/niveaux-progressifs/manifest.json');for(const pair of manifest.pairs)for(const level of pair.levels)for(const theme of read('melunga_deploy/'+level.dataPath).themes)for(const sequence of theme.sequences)for(const step of sequence.steps)assert.ok(!reserved.includes(step.utterance),'reserved source stays outside learner production');
 });
 test('partial Italian bundles, stale copies, received models and forged EN71 chain are rejected',()=>{
  const audits=loadRegistries(),bundleIndex=audits.B.registry.corrections.findIndex(e=>e.atomicBundle),copyIndex=audits.A.registry.corrections.findIndex(e=>e.occurrences.some(o=>o.profile==='transport-phrase')),chainIndex=audits.B.registry.corrections.findIndex(e=>e.id==='catalogue:it:1736');
  const faults=[
   ['A',r=>{r.corrections[0].fields.reading={before:'',after:'invented'};}],
   ['A',r=>{r.corrections[0].fields.study={before:'x',after:'y'};}],
   ['A',r=>{r.corrections[0].fields.phon.after+='bad';}],
   ['A',r=>{r.corrections[0].rules=['automatic'];}],
   ['A',r=>{r.corrections[0].rules=['S'];}],
   ['A',r=>{r.corrections[0].atomicBundle=true;}],
   ['A',r=>{r.evidenceFiles[0].sha256='0'.repeat(64);}],
   ['A',r=>{r.evidenceFiles[0].gitCommit=BASELINE;}],
   ['A',r=>{r.corrections[0].occurrences[0].expectedBefore.source.collection='fake';}],
   ['A',r=>{r.appliesAfter[0].registrySha256='0'.repeat(64);}],
   ['A',r=>{r.corrections[copyIndex].occurrences.pop();}],
   ['A',r=>{r.corrections[0].events[0].evidenceIndex=69;}],
   ['B',r=>{r.corrections[0].fields.native.after+='bad';}],
   ['B',r=>{r.corrections[0].id='catalogue:it:712';}],
   ['B',r=>{r.corrections[0].fields.phon={before:'x',after:'y'};}],
   ['B',r=>{r.corrections[bundleIndex].atomicBundle=false;}],
   ['B',r=>{delete r.corrections[bundleIndex].fields.phon;}],
   ['B',r=>{delete r.corrections[bundleIndex].fields.study;}],
   ['B',r=>{r.corrections[bundleIndex].events[0].evidenceCollection='items';}],
   ['B',r=>{r.corrections[chainIndex].occurrences[0].expectedBefore.lot9PhoneticCorrection=null;}]
  ];for(const[which,mutate]of faults){const bad=clone(audits[which].registry);mutate(bad);assert.throws(()=>loadRegistries({[which]:bad}));}
  const specimens=[
   ['A','catalogue:it:2670',p=>{p.phon=audits.A.entries.get(key('fr-it',p.id)).fields.phon.before;}],
   ['A','catalogue:it:2670',p=>{p.reading='invented';}],
   ['A','catalogue:it:2670',p=>{delete p.lot9PhoneticCorrection;}],
   ['A','catalogue:it:2670',p=>{p.lot9PhoneticCorrection.registrySha256='0'.repeat(64);}],
   ['A','catalogue:it:2670',p=>{p.phoneticReviewStatus='native-approved';}],
   ['A','catalogue:it:2670',p=>{p.source.sourceSha256='0'.repeat(64);}],
   ['B','catalogue:it:1736',p=>{delete p.lot9PhoneticCorrection;}],
   ['B','catalogue:it:1736',p=>{p.native=audits.B.entries.get(key('fr-it',p.id)).fields.native.before;}],
   ['B','catalogue:it:2647',p=>{p.phon+='unapproved';}],
   ['B','catalogue:it:2647',p=>{p.phoneticReviewStatus='native-approved';}],
   ['B','catalogue:it:2489',p=>{p.native=audits.B.entries.get(key('fr-it',p.id)).fields.native.before;}],
   ['B','catalogue:it:2489',p=>{p.phon=audits.B.entries.get(key('fr-it',p.id)).fields.phon.before;}],
   ['B','catalogue:it:3879',p=>{delete p.lot9ContentCorrection;}],
   ['B','catalogue:it:4098',p=>{p.study=audits.B.entries.get(key('fr-it',p.id)).fields.study.before;}]
  ];for(const[which,id,mutate]of specimens){const bad=clone(sourceFor(which,id));mutate(bad);assert.throws(()=>verifyPhrase('fr-it',bad));}
  const copied=audits.A.registry.corrections.filter(e=>e.occurrences.some(o=>o.profile==='transport-phrase'));assert.equal(copied.length,4);for(const e of copied){const o=e.occurrences.find(o=>o.profile==='transport-phrase'),bad=clone(at(read(o.path),o.location));bad.phon=e.fields.phon.before;assert.throws(()=>verifyPhrase('fr-it',bad));}
  const received=[...audits.A.registry.corrections,...audits.B.registry.corrections].filter(e=>e.id.startsWith('heard-authored:'));assert.equal(received.length,3);for(const e of received){const o=e.occurrences[0],bad=clone(at(read(o.path),o.location));bad.heardOnly=false;assert.throws(()=>assert.deepEqual(projectBefore('fr-it',bad),at(baseline(o.path),o.location)));}
  const c=loadErratum();for(const mutate of [r=>{r.corrections[0].fields.phon.before='KOUM-plé la NOR-ma én';},r=>{r.corrections[0].fields.phon.after=ERR.before;},r=>{r.evidenceFiles[0].gitCommit=COMMIT;},r=>{r.corrections[0].occurrences[0].expectedBefore.lot8PhoneticCorrection=null;}]){const bad=clone(c.registry);mutate(bad);assert.throws(()=>loadErratum(bad));}
  const original=at(read(c.occurrence.path),c.occurrence.location);for(const mutate of [p=>{p.phon=ERR.before;},p=>{delete p.lot8PhoneticCorrection;},p=>{delete p.lot8Erratum1Correction;},p=>{p.lot8Erratum1Correction.evidenceCommits=[COMMIT];}]){const bad=clone(original);mutate(bad);assert.throws(()=>verifyPhrase('fr-es',bad));}
  assert.equal(faults.length+specimens.length+copied.length+received.length+8,49);
 });
 test('N/S/T/A families and all three received corrections display whole aids and speak complete Italian studies',async()=>{
  const{context,page}=await openPage();try{
   const ids=['catalogue:it:2670','catalogue:it:2762','catalogue:it:1549','catalogue:it:1555','catalogue:it:2615','situation-authored:fr-it:piste-gouts-activites-05','situation-authored:fr-it:piste-reclamation-tact-02'];const covered=new Set(),audits=loadRegistries();
   for(const id of ids){await enter(page,fixture(id));await checkDom(page,id);for(const rule of audits.A.entries.get(key('fr-it',id)).rules)covered.add(rule);}
   for(const which of ['A','B'])for(const e of audits[which].registry.corrections.filter(e=>e.id.startsWith('heard-authored:'))){const target=fixture(e.id,true);await enter(page,target);const phrase=await checkDom(page,e.id,which,true);assert.equal(phrase.heardOnly,true);assert.equal(phrase.referenceOnly,true);assert.equal(await page.evaluate(()=>window.MelungaMockup.state().masked),false);if(which==='A')for(const rule of e.rules)covered.add(rule);const data=read('melunga_deploy/content/niveaux-progressifs/fr-it/L'+target.level+'.json'),step=data.themes[target.themeIndex].sequences.flatMap(s=>s.steps)[target.stepIndex];assert.equal(step.requiresProduction,false);assert.equal(step.countsForProgress,false);}
   assert.deepEqual([...covered].sort(),['A','N','S','T']);
  }finally{await context.close();}
 });
 test('three atomic Italian bundles and all active certain glosses reach the real lesson DOM with unchanged native-only phonetics',async()=>{
  const{context,page}=await openPage();try{
   for(const e of loadRegistries().B.registry.corrections.filter(e=>!e.id.startsWith('heard-authored:')&&!e.occurrences.some(o=>o.location[0]==='reserve'))){await enter(page,fixture(e.id));const phrase=await checkDom(page,e.id,'B');for(const[field,event]of Object.entries(e.fields))assert.equal(phrase[field],event.after);if(!e.fields.phon){assert.equal(phrase.phon,e.occurrences[0].expectedBefore.phon);assert.equal(Object.hasOwn(phrase,'phoneticReviewStatus'),e.occurrences[0].expectedBefore.phoneticReviewStatusPresent);if(e.occurrences[0].expectedBefore.phoneticReviewStatusPresent)assert.equal(phrase.phoneticReviewStatus,e.occurrences[0].expectedBefore.phoneticReviewStatus);}}
  }finally{await context.close();}
 });
 test('EN71 serves explicit E and N while preserving the earlier S-event and speaking the Spanish whole sentence',async()=>{
  const{context,page}=await openPage();try{
   await enter(page,fixture('catalogue:es:2205',false,'fr-es'));const a=loadErratum(),source=at(read(a.occurrence.path),a.occurrence.location);assert.equal(await page.locator('#mgPhrase').textContent(),source.study);assert.equal(await page.locator('#mgPhon').textContent(),ERR.after);await page.click('#mgEar');const spoken=await page.evaluate(()=>window.__lot9Speech.at(-1));assert.equal(spoken.text,'¿Cumple la norma EN71?');assert.equal(spoken.lang.split('-')[0],'es');assert.deepEqual(source.lot8PhoneticCorrection,at(baseline(a.occurrence.path),a.occurrence.location).lot8PhoneticCorrection);
  }finally{await context.close();}
 });
 test('all three changed Italian studies fit complete mobile and desktop cards without scrolling',async()=>{
  const{context,page}=await openPage();try{
   for(const viewport of [{width:320,height:640},{width:1280,height:720}])for(const number of [2489,3879,4098]){
    await page.setViewportSize(viewport);await enter(page,fixture('catalogue:it:'+number));await checkDom(page,'catalogue:it:'+number,'B');
    await page.evaluate(async()=>{await document.fonts.ready;await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});
    const measured=await page.evaluate(()=>{const rect=n=>{const r=n.getBoundingClientRect();return{top:r.top,bottom:r.bottom,left:r.left,right:r.right};};const visible=n=>n&&!n.hidden&&getComputedStyle(n).display!=='none'&&n.getBoundingClientRect().width>0;return{lesson:rect(document.getElementById('mgLessonView')),texts:['mgPhrase','mgPhon','mgTranslation','mgReading'].map(id=>document.getElementById(id)).filter(visible).map(n=>{const range=document.createRange();range.selectNodeContents(n);return{id:n.id,text:rect(range),element:rect(n),overflow:getComputedStyle(n).overflowY};}),scrollers:[document.scrollingElement,...['mgContent','mgLessonView','mgModel'].map(id=>document.getElementById(id))].map(n=>({id:n.id||n.tagName,scrollHeight:n.scrollHeight,clientHeight:n.clientHeight,scrollWidth:n.scrollWidth,clientWidth:n.clientWidth})),actions:['mgEar','mgContinue','mgReplay'].every(id=>visible(document.getElementById(id)))};});
    for(const n of measured.scrollers){assert.ok(n.scrollHeight<=n.clientHeight+2,n.id+' no vertical scroll');assert.ok(n.scrollWidth<=n.clientWidth+2,n.id+' no horizontal scroll');}
    for(const n of measured.texts){assert.ok(n.text.top>=measured.lesson.top-2&&n.text.bottom<=measured.lesson.bottom+2,n.id+' entire text inside card');assert.ok(n.text.left>=measured.lesson.left-2&&n.text.right<=measured.lesson.right+2,n.id+' no lateral clipping');if(n.overflow!=='visible')assert.ok(n.text.top>=n.element.top-2&&n.text.bottom<=n.element.bottom+2,n.id+' no inner clipping');}
    for(let i=0;i<measured.texts.length;i++)for(let j=i+1;j<measured.texts.length;j++){const a=measured.texts[i].text,b=measured.texts[j].text;assert.ok(Math.min(a.right,b.right)-Math.max(a.left,b.left)<=1||Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)<=1,'text fields do not overlap');}assert.ok(measured.actions,'study actions remain visible');
   }
  }finally{await context.close();}
 });
}
