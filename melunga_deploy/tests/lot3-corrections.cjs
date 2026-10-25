/* Independent proof and browser checks of frozen Claude lot3 field events.
 * No generator is imported. Projection is private and follows the reverse
 * layer order: lot3 -> the served 3df885d edition -> original lot2 baseline.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');
const {isDeepStrictEqual} = require('node:util');
const lot4Corrections = require('./lot4-corrections.cjs');
const ROOT = path.resolve(__dirname, '..', '..');
const WEB = path.join(ROOT, 'melunga_deploy');
const REGISTRY = 'docs/niveaux-progressifs/corrections-phonetiques/lot3/revue-claude-lot3.json';
const EVIDENCE_COMMIT = 'd06a62ea36120ffd73b8059645848c13bd4f172d';
const BASELINE = '3df885df8db00f0bdc2a703b92bd17801accabce';
const LOT2 = {registryPath:'docs/niveaux-progressifs/corrections-phonetiques/revue-claude-lot2.json',
  registrySha256:'efc075c6bbfbe660e1f62cc83ced4244fa8df8368b8e70ef90c6faf5897acbdc'};
const EVIDENCE = {
  'docs/niveaux-progressifs/corrections-phonetiques/lot3/evidence-registre-phonetique.json': {
    gitPath:'docs/revue-integrale/lot3-fr-zh-L3-L10/registre-phonetique.json',
    sha256:'09e470b8fba9004b62bcb9fbc5fe036dbda2d91c68868b178f9ba810a06ea9ba',field:'phon',count:90},
  'docs/niveaux-progressifs/corrections-phonetiques/lot3/evidence-registre-lectures.json': {
    gitPath:'docs/revue-integrale/lot3-fr-zh-L3-L10/registre-lectures.json',
    sha256:'c029d571a59303733d5bfa85fec59b94f0b989eb24a4d3c490a4a9fe50fd4ea8',field:'reading',count:5}
};
const clone = value => JSON.parse(JSON.stringify(value));
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const read = filename => JSON.parse(fs.readFileSync(path.join(ROOT, filename), 'utf8'));
const key = (pair,id) => pair + '\0' + id;
const at = (document, location) => location.reduce((value, part) => value[part], document);
const baselines = new Map();
function baseline(filename) {
  if (!baselines.has(filename)) baselines.set(filename, JSON.parse(execFileSync('git',
    ['show',BASELINE + ':' + filename],{cwd:ROOT,encoding:'utf8',maxBuffer:32 * 1024 * 1024})));
  return baselines.get(filename);
}
function beforeProfile(phrase) {
  return {study:phrase.study,native:phrase.native,phon:phrase.phon,
    readingPresent:Object.hasOwn(phrase,'reading'), reading:phrase.reading ?? null,
    source:phrase.source,
    phoneticReviewStatusPresent:Object.hasOwn(phrase,'phoneticReviewStatus'),
    phoneticReviewStatus:phrase.phoneticReviewStatus ?? null,
    phoneticCorrectionPresent:Object.hasOwn(phrase,'phoneticCorrection'),
    phoneticCorrection:phrase.phoneticCorrection ?? null};
}
let loaded;
function loadRegistry(override) {
  if (!override && loaded) return loaded;
  const bytes = fs.readFileSync(path.join(ROOT,REGISTRY));
  const registry = override || JSON.parse(bytes);
  assert.equal(registry.version,1); assert.equal(registry.id,'revue-claude-lot3');
  assert.equal(registry.evidenceCommit,EVIDENCE_COMMIT);
  assert.equal(registry.baseSnapshotCommit,BASELINE);
  assert.deepEqual(registry.appliesAfter,LOT2);
  assert.equal(hash(fs.readFileSync(path.join(ROOT,LOT2.registryPath))),LOT2.registrySha256,'lot2 registry remains intact');
  assert.equal(registry.correctionCount,91); assert.equal(registry.eventCount,95);
  assert.equal(registry.phoneticEventCount,90); assert.equal(registry.readingEventCount,5);
  assert.equal(registry.evidenceFiles.length,2);
  const approved = new Map(); let evidenceCount = 0;
  for (const file of registry.evidenceFiles) {
    const pinned = EVIDENCE[file.path]; assert.ok(pinned,'only the named reviewer proofs are accepted');
    assert.equal(file.sha256,pinned.sha256); assert.equal(file.gitPath,pinned.gitPath);
    assert.equal(file.eventCount,pinned.count); assert.equal(file.field,pinned.field);
    const raw = fs.readFileSync(path.join(ROOT,file.path));
    assert.equal(hash(raw),pinned.sha256,'frozen reviewer evidence bytes');
    const git = execFileSync('git',['show',EVIDENCE_COMMIT + ':' + pinned.gitPath],{cwd:ROOT,maxBuffer:32 * 1024 * 1024});
    assert.equal(hash(git),pinned.sha256,'reviewer evidence agrees with pinned Git object');
    const document = JSON.parse(raw); assert.equal(document.baseSnapshotCommit,BASELINE);
    assert.equal(document.events.length,pinned.count);
    for (const [index,event] of document.events.entries()) {
      const id = key(event.pair,event.id);
      if (!approved.has(id)) approved.set(id,{});
      const fields = approved.get(id); assert.equal(fields[pinned.field],undefined,'one reviewed event per field and identity');
      fields[pinned.field] = {event,path:file.path,index}; evidenceCount++;
    }
  }
  assert.equal(evidenceCount,95); assert.equal(approved.size,91);
  const entries = new Map(); const locations = new Set(); let objects = 0;
  const profiles = {canonical:0,'transport-phrase':0,'received-model':0};
  const afterB = [];
  for (const entry of registry.corrections) {
    const id = key(entry.pairId,entry.id); assert.ok(!entries.has(id),'one final correction per identity');
    const proof = approved.get(id); assert.ok(proof,'all entries cite actual frozen proof');
    assert.deepEqual(Object.keys(entry.fields).sort(),Object.keys(proof).sort(),'no added or omitted field');
    for (const [field,source] of Object.entries(proof)) {
      const actual = entry.fields[field], event = source.event;
      const before = field === 'phon' ? event.beforePhon : event.beforeReading;
      const after = field === 'phon' ? event.afterPhon : event.afterReading;
      assert.equal(actual.before,before); assert.equal(actual.after,after);
      assert.equal(actual.evidencePath,source.path); assert.equal(actual.evidenceIndex,source.index);
      if (field === 'phon') assert.deepEqual(actual.rules,event.rules);
      else assert.equal(actual.rules,undefined,'reading has no invented phonetic rule');
    }
    assert.ok(entry.occurrences.length,'every approved identity is present');
    for (const occurrence of entry.occurrences) {
      assert.match(occurrence.path,/^melunga_deploy\/content\/niveaux-progressifs\/(?:[a-z]{2}-[a-z]{2}\/L(?:10|[1-9])|repertoires\/[a-z]{2}-[a-z]{2})\.json$/);
      assert.ok(Object.hasOwn(profiles,occurrence.profile));
      const address = occurrence.path + '\0' + JSON.stringify(occurrence.location);
      assert.ok(!locations.has(address),'unique actual phrase occurrence'); locations.add(address);
      const original = at(baseline(occurrence.path),occurrence.location);
      assert.equal(original.id,entry.id,'before location contains this identity');
      assert.deepEqual(occurrence.expectedBefore,beforeProfile(original),'complete before profile agrees with served baseline');
      for (const [field,source] of Object.entries(proof)) {
        assert.equal(original[field],entry.fields[field].before,'reviewer before is exact in the declared edition');
        assert.equal(original.study,source.event.study); assert.equal(original.native,source.event.native);
      }
      profiles[occurrence.profile]++; objects++;
    }
    if (entry.fields.phon && entry.occurrences.some(o => o.expectedBefore.phoneticCorrectionPresent)) afterB.push(entry.id);
    entries.set(id,entry);
  }
  assert.equal(entries.size,91); assert.equal(objects,98);
  assert.deepEqual(profiles,{canonical:88,'transport-phrase':7,'received-model':3});
  assert.deepEqual(afterB.sort(),[1016,1143,1193,1898,2018,2145,2164].map(n=>'catalogue:zh:'+n).sort());
  const result = {registry,registrySha256:hash(bytes),approved,entries,profiles,objects};
  if (!override) loaded=result;
  return result;
}
function annotationFor(entry,before,registrySha256) {
  const fields=Object.keys(entry.fields).sort();
  return {id:entry.id,registryPath:REGISTRY,registrySha256,evidenceCommit:EVIDENCE_COMMIT,baseSnapshotCommit:BASELINE,
    fields,beforeFields:Object.fromEntries(fields.map(field=>[field,entry.fields[field].before])),
    originalPhoneticReviewStatusPresent:before.phoneticReviewStatusPresent,
    originalPhoneticReviewStatus:before.phoneticReviewStatusPresent ? before.phoneticReviewStatus : null};
}
function verifyLot3Phrase(pairId,phrase,expectedBefore) {
  const audit=loadRegistry(); const entry=audit.entries.get(key(pairId,phrase.id));
  if (!entry) { assert.equal(phrase.reviewedFieldCorrection,undefined,'no undeclared lot3 annotation'); return phrase; }
  const candidates=entry.occurrences.map(row=>row.expectedBefore);
  const before=expectedBefore || candidates.find(candidate=>candidate.study===phrase.study
    && candidate.native===phrase.native && isDeepStrictEqual(candidate.source,phrase.source)
    && candidate.phoneticCorrectionPresent===Object.hasOwn(phrase,'phoneticCorrection')
    && isDeepStrictEqual(candidate.phoneticCorrection,phrase.phoneticCorrection ?? null));
  assert.ok(before && candidates.some(candidate=>isDeepStrictEqual(candidate,before)),'the complete original profile is registered');
  assert.deepEqual(phrase.reviewedFieldCorrection,annotationFor(entry,before,audit.registrySha256),'exact lot3 annotation');
  assert.equal(phrase.study,before.study); assert.equal(phrase.native,before.native);
  assert.deepEqual(phrase.source,before.source,'source provenance is unchanged');
  assert.equal(Object.hasOwn(phrase,'phoneticCorrection'),before.phoneticCorrectionPresent);
  if (before.phoneticCorrectionPresent) assert.deepEqual(phrase.phoneticCorrection,before.phoneticCorrection,'B metadata is retained in the chain');
  for (const field of ['phon','reading']) {
    if (field==='reading') assert.equal(Object.hasOwn(phrase,field),before.readingPresent,'reading presence is unchanged');
    assert.equal(phrase[field] ?? null,entry.fields[field]?.after ?? before[field],'only the approved field after is served');
  }
  const status=entry.fields.phon ? 'corrected-by-Claude-lot3-'+entry.fields.phon.rules.join('+') : before.phoneticReviewStatus;
  assert.equal(Object.hasOwn(phrase,'phoneticReviewStatus'),entry.fields.phon ? true : before.phoneticReviewStatusPresent);
  if (entry.fields.phon || before.phoneticReviewStatusPresent) assert.equal(phrase.phoneticReviewStatus,status);
  return phrase;
}
function verifyPhrase(pairId,phrase,expectedBefore) {
  verifyLot3Phrase(pairId,lot4Corrections.projectBefore(pairId,phrase),expectedBefore);
  return phrase;
}
function projectBefore(pairId,phrase) {
  phrase=lot4Corrections.projectBefore(pairId,phrase);
  verifyLot3Phrase(pairId,phrase);
  if (!phrase.reviewedFieldCorrection) return phrase;
  const original={...phrase}; const annotation=phrase.reviewedFieldCorrection;
  for (const [field,value] of Object.entries(annotation.beforeFields)) original[field]=value;
  if (annotation.originalPhoneticReviewStatusPresent) original.phoneticReviewStatus=annotation.originalPhoneticReviewStatus;
  else delete original.phoneticReviewStatus;
  delete original.reviewedFieldCorrection;
  return original;
}
function projectDocument(pairId,document,isBank) {
  const copy=clone(document);
  if (isBank) {
    for (const field of ['phrases','receivedModels']) copy[field]=(copy[field] || []).map(p=>projectBefore(pairId,p));
  } else {
    for (const field of ['themes','heldThemes']) for (const theme of copy[field] || []) theme.phrases=theme.phrases.map(p=>projectBefore(pairId,p));
    copy.reserve=(copy.reserve || []).map(p=>projectBefore(pairId,p));
  }
  return copy;
}
function declaration(audit=loadRegistry()) {
  const registry=audit.registry;
  return {registryPath:REGISTRY,registrySha256:audit.registrySha256,correctionCount:91,eventCount:95,
    phoneticEventCount:90,readingEventCount:5,evidenceCommit:EVIDENCE_COMMIT,baseSnapshotCommit:BASELINE,appliesAfter:LOT2};
}
function inputFiles() {
  return [__filename,path.join(ROOT,REGISTRY),...Object.keys(EVIDENCE).map(file=>path.join(ROOT,file)),...lot4Corrections.inputFiles()];
}
function auditRuntime() {
  const lot4Audit=lot4Corrections.auditRuntime();
  const audit=loadRegistry(); const manifestPath='melunga_deploy/content/niveaux-progressifs/manifest.json';
  const manifest=read(manifestPath),oldManifest=baseline(manifestPath);
  const files=oldManifest.pairs.flatMap(pair=>[pair.repertoirePath,...pair.levels.map(level=>level.dataPath)]).map(file=>'melunga_deploy/'+file);
  assert.equal(files.length,77); const locations=new Set(); let fields=0;
  for (const entry of audit.registry.corrections) {
    const copies=[];
    for (const occurrence of entry.occurrences) {
      const phrase=at(read(occurrence.path),occurrence.location);
      verifyPhrase(entry.pairId,phrase,occurrence.expectedBefore);
      const projected=projectBefore(entry.pairId,phrase);
      assert.deepEqual(projected,at(baseline(occurrence.path),occurrence.location),'complete card and role unchanged outside approved fields');
      copies.push(phrase); fields+=Object.keys(entry.fields).length;
      locations.add(occurrence.path+'\0'+JSON.stringify(occurrence.location));
    }
    for (const copy of copies) for (const field of ['study','native','phon','reading']) assert.equal(copy[field],copies[0][field],'all corrected copies agree');
  }
  for (const filename of files) {
    const document=read(filename); const pair=document.pairId || document.id;
    assert.deepEqual(projectDocument(pair,document,filename.includes('/repertoires/')),baseline(filename),'full runtime file conserved outside lot3: '+filename);
    const visit=(node,location=[])=>{
      if (!node || typeof node!=='object') return;
      if (Object.hasOwn(node,'reviewedFieldCorrection')) assert.ok(locations.has(filename+'\0'+JSON.stringify(location)),'no unregistered annotation');
      for (const [name,child] of Object.entries(node)) visit(child,location.concat(Array.isArray(node)?Number(name):name));
    }; visit(document);
  }
  const expected=clone(oldManifest); expected.reviewedFieldCorrections=declaration(audit);
  Object.assign(expected,lot4Corrections.manifestDeclarations());
  for (const pair of expected.pairs) pair.repertoireSha256=hash(fs.readFileSync(path.join(WEB,pair.repertoirePath)));
  assert.deepEqual(manifest,expected,'only new declaration and actual bank hashes change in manifest');
  for (const filename of ['app.html','maquette-guidee.js','maquette-guidee.css','parcours-niveaux.html','maquette-guidee.html']) {
    const actual=fs.readFileSync(path.join(WEB,filename));
    const original=execFileSync('git',['show',BASELINE+':melunga_deploy/'+filename],{cwd:ROOT,maxBuffer:32*1024*1024});
    assert.ok(actual.equals(original),'UI/classic file stays byte-for-byte intact: '+filename);
  }
  assert.equal(fields,102);
  return {correctionCount:91,eventCount:95,phoneticEvents:90,readingEvents:5,occurrences:98,fields,profiles:audit.profiles,files:77,lot4:lot4Audit};
}
module.exports={loadRegistry,verifyPhrase,projectBefore,projectDocument,declaration,auditRuntime,inputFiles,baseline,beforeProfile};

if (require.main===module) {
  const {test,before,after}=require('node:test');
  const http=require('node:http');
  const {chromium}=require('playwright-core');
  let browser,server,base; const errors=[],requests=[];
  const snapshots=new Map();
  before(async()=>{
    const files=inputFiles();
    const manifest=read('melunga_deploy/content/niveaux-progressifs/manifest.json');
    files.push(path.join(WEB,'content/niveaux-progressifs/manifest.json'));
    for (const pair of manifest.pairs) files.push(path.join(WEB,pair.repertoirePath),...pair.levels.map(level=>path.join(WEB,level.dataPath)));
    for (const filename of ['app.html','maquette-guidee.js','maquette-guidee.css','parcours-niveaux.html']) files.push(path.join(WEB,filename));
    files.forEach(file=>snapshots.set(file,hash(fs.readFileSync(file))));
    server=http.createServer((req,res)=>{
      const file=path.resolve(WEB,'.'+new URL(req.url,'http://local').pathname);
      if (!file.startsWith(WEB+path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return res.writeHead(404).end();
      res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css'})[path.extname(file)] || 'application/octet-stream');
      fs.createReadStream(file).pipe(res);
    });
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    base='http://127.0.0.1:'+server.address().port;
    browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox']});
  });
  after(async()=>{
    await browser?.close(); if(server)await new Promise(resolve=>server.close(resolve));
    assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
    for (const [file,beforeHash] of snapshots) assert.equal(hash(fs.readFileSync(file)),beforeHash,'input stayed stable throughout tests: '+file);
  });
  const entryFor=id=>loadRegistry().registry.corrections.find(row=>row.id===id);
  const current=occurrence=>at(read(occurrence.path),occurrence.location);
  function fixture(pairId,id,later=false,received=false) {
    const metadata=read('melunga_deploy/content/niveaux-progressifs/manifest.json').pairs.find(row=>row.id===pairId);
    for (const level of metadata.levels) {
      const data=read('melunga_deploy/'+level.dataPath);
      for (const [themeIndex,theme] of data.themes.entries()) {
        const stepIndex=theme.sequences.flatMap(row=>row.steps).findIndex(step=>step.utterance===id && step.kind===(received?'receive':'understand'));
        const reused=!![...(theme.reviewReferences || []),...(theme.contextReferences || [])].some(row=>row.id===id);
        if (stepIndex>=0 && (received || reused===later)) return {pairId,level:level.level,themeIndex,stepIndex,id};
      }
    }
    throw new Error('No real lesson fixture: '+pairId+'/'+id+'/later='+later+'/received='+received);
  }
  async function openPage(pairId) {
    const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
    await context.addInitScript(()=>{
      window.__lot3Speech=[];
      window.SpeechSynthesisUtterance=class {constructor(text){this.text=text;}};
      Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},getVoices(){return [];},addEventListener(){},
        speak(item){window.__lot3Speech.push({text:item.text,lang:item.lang});item.onend?.();}}});
    });
    await context.route('**/*',async route=>{
      const url=new URL(route.request().url());
      if(url.origin!==base || /\/(?:\.netlify|api)\//.test(url.pathname)){requests.push(url.origin+url.pathname);await route.abort();}
      else await route.continue();
    });
    const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
    return {context,page};
  }
  async function enter(page,target) {
    await page.goto(base+'/parcours-niveaux.html?pair='+target.pairId+'&level='+target.level);
    await page.waitForFunction(target=>window.MelungaMockup?.state().screen==='themes'
      &&window.MelungaMockup.state().pairId===target.pairId&&window.MelungaMockup.state().level===target.level,target);
    await page.locator('#mgThemeGrid > button').nth(target.themeIndex).click();
    await page.evaluate(target=>{
      while(window.MelungaMockup.state().stepIndex<target.stepIndex){
        document.querySelector('#mgChoices:not([hidden]) button')?.click();
        const button=document.getElementById('mgContinue');if(button.disabled)throw new Error('Blocked lesson fixture');button.click();
      }
    },target);
    assert.equal(await page.evaluate(()=>window.MelungaMockup.state().phraseId),target.id);
  }
  async function checkDom(page,pairId,id) {
    const entry=entryFor(id),source=current(entry.occurrences[0]);
    assert.equal(await page.locator('#mgPhrase').textContent(),source.study);
    assert.equal(await page.locator('#mgPhon').textContent(),source.phon);
    assert.equal(await page.locator('#mgTranslation').textContent(),source.native);
    assert.equal(await page.locator('#mgReading').textContent(),source.reading || '');
    await page.click('#mgEar');
    const spoken=await page.evaluate(()=>window.__lot3Speech.at(-1));
    assert.equal(spoken.text,source.study,'ear uses studied language text, not either aid');
    assert.equal(spoken.lang.split('-')[0],pairId.split('-')[1]);
    return source;
  }
  test('lot3 freezes 95 events into 91 exact identities and all 98 objects without other runtime or UI changes',()=>{
    const report=auditRuntime();assert.equal(report.fields,102);
    const entry=entryFor('catalogue:zh:1323');
    assert.deepEqual(Object.keys(entry.fields),['reading']);
    assert.equal(current(entry.occurrences[0]).phon,entry.occurrences[0].expectedBefore.phon,'reading-only correction does not alter the aid');
    const reserved=entryFor('catalogue:zh:1608');assert.equal(reserved.occurrences[0].location[0],'reserve');
    for(const pair of read('melunga_deploy/content/niveaux-progressifs/manifest.json').pairs)for(const level of pair.levels){
      const data=read('melunga_deploy/'+level.dataPath);
      for(const theme of data.themes)for(const step of theme.sequences.flatMap(row=>row.steps))assert.notEqual(step.utterance,'catalogue:zh:1608','reserved pinyin source is not made an exercise');
    }
  });
  test('unreviewed fields, forged chain/evidence, stale copies and source/role changes are rejected',()=>{
    const registry=loadRegistry().registry;
    const registryFaults=[
      value=>{value.corrections[0].fields.native={before:'old',after:'new'};},
      value=>{value.corrections[0].fields.phon.after+=' wrong';},
      value=>{value.corrections[0].fields.phon.before+=' wrong';},
      value=>{value.corrections.find(e=>e.id==='catalogue:zh:1016').occurrences[0].expectedBefore.phoneticCorrection=null;},
      value=>{value.appliesAfter.registrySha256='0'.repeat(64);},
      value=>{value.evidenceFiles[0].sha256='0'.repeat(64);},
      value=>{value.corrections.find(e=>e.fields.reading).fields.reading.after+=' wrong';},
      value=>{value.corrections[0].occurrences[0].expectedBefore.source.collection='invented';}
    ];
    for(const mutate of registryFaults){const bad=clone(registry);mutate(bad);assert.throws(()=>loadRegistry(bad));}
    const mutations=[
      ['catalogue:zh:1016',value=>{value.phon=entryFor(value.id).fields.phon.before;}],
      ['catalogue:zh:1680',value=>{value.reading=entryFor(value.id).fields.reading.before;}],
      ['catalogue:zh:1016',value=>{delete value.reviewedFieldCorrection;}],
      ['catalogue:zh:1016',value=>{value.reviewedFieldCorrection.registrySha256='0'.repeat(64);} ],
      ['catalogue:zh:1016',value=>{value.source.sourceSha256='0'.repeat(64);} ],
      ['catalogue:zh:1016',value=>{delete value.phoneticCorrection;}],
      ['catalogue:zh:1323',value=>{value.phoneticReviewStatus='native-approved';}],
      ['catalogue:zh:143',value=>{value.phon=entryFor(value.id).fields.phon.before;}]
    ];
    for(const [id,mutate]of mutations){const entry=entryFor(id),o=entry.occurrences.at(-1),bad=clone(current(o));mutate(bad);assert.throws(()=>verifyPhrase(entry.pairId,bad,o.expectedBefore));}
    const entry=entryFor('heard-authored:situation-zh-fr-piste-gouts-activites-received-01'),o=entry.occurrences[0];
    const bad=clone(current(o));bad.heardOnly=false;
    assert.throws(()=>assert.deepEqual(projectBefore(entry.pairId,bad),at(baseline(o.path),o.location)),'received-only role stays part of complete conservation');
    assert.equal(registryFaults.length+mutations.length+1,17);
  });
  test('four active corrected Pinyin readings toggle verbatim and the ear always speaks unchanged study text',async()=>{
    const {context,page}=await openPage('fr-zh');
    try{
      const readings=loadRegistry().registry.corrections.filter(entry=>entry.fields.reading && entry.occurrences[0].location[0]!=='reserve');
      assert.equal(readings.length,4);
      for(const entry of readings){
        await enter(page,fixture('fr-zh',entry.id));
        const source=await checkDom(page,'fr-zh',entry.id);
        if(!await page.locator('#mgReadingToggle').isVisible())await page.click('#mgHelp');
        await page.click('#mgReadingToggle');
        assert.equal(await page.locator('#mgPhon').textContent(),entry.fields.reading.after);
        if(await page.locator('#mgHelpPanel').isVisible())await page.click('#mgHelp');
        await page.click('#mgEar');
        assert.equal(await page.evaluate(()=>window.__lot3Speech.at(-1).text),source.study);
        if(!await page.locator('#mgReadingToggle').isVisible())await page.click('#mgHelp');
        await page.click('#mgReadingToggle');
        assert.equal(await page.locator('#mgPhon').textContent(),source.phon);
        if(await page.locator('#mgHelpPanel').isVisible())await page.click('#mgHelp');
      }
    }finally{await context.close();}
  });
  test('after-B final aid and first/later revision copies use the same approved edition in the real lesson UI',async()=>{
    const {context,page}=await openPage('fr-zh');
    try{
      await enter(page,fixture('fr-zh','catalogue:zh:1016'));await checkDom(page,'fr-zh','catalogue:zh:1016');
      const after=current(entryFor('catalogue:zh:1016').occurrences[0]);
      assert.equal(after.phoneticCorrection.rule,'B','prior whole correction remains explicit');
      for(const later of [false,true]){
        await enter(page,fixture('fr-zh','catalogue:zh:143',later));await checkDom(page,'fr-zh','catalogue:zh:143');
        assert.equal(await page.locator('#mgPhon').textContent(),'djeu yang dzouèï hao');
      }
    }finally{await context.close();}
  });
  test('both received-only les→雷 aids remain visible, audible and outside learner production',async()=>{
    const {context,page}=await openPage('zh-fr');
    try{
      const entries=loadRegistry().registry.corrections.filter(entry=>entry.pairId==='zh-fr');assert.equal(entries.length,2);
      for(const entry of entries){
        await enter(page,fixture('zh-fr',entry.id,false,true));
        const source=await checkDom(page,'zh-fr',entry.id);
        assert.equal(await page.evaluate(()=>window.MelungaMockup.state().masked),false,'received turn never becomes hidden recall');
        assert.ok(source.phon.includes('雷'));assert.equal(source.heardOnly,true);assert.equal(source.referenceOnly,true);
        const step=fixture('zh-fr',entry.id,false,true);
        const data=read('melunga_deploy/content/niveaux-progressifs/zh-fr/L'+step.level+'.json');
        const model=data.themes[step.themeIndex].sequences.flatMap(sequence=>sequence.steps)[step.stepIndex];
        assert.equal(model.requiresProduction,false);assert.equal(model.countsForProgress,false);
      }
    }finally{await context.close();}
  });
}
