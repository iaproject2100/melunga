/* Independent checks of the finite owner-decided convention literals.
 * Full current objects are proved before any C→B→historical inverse is exposed. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {execFileSync}=require('node:child_process'),{isDeepStrictEqual}=require('node:util');
const ROOT=path.resolve(__dirname,'../..'),WEB=path.join(ROOT,'melunga_deploy');
const BASE='13f42b5814f2b230d76d2d0ef267dcf406c523c2',B_BASE='e85c8c355be8cc0213543eddb21467432edb57b8';
const SOURCE='68031b7c8643e78cae7b40ad59600db32b08f79a',ERRATUM='4247ca470354f59ea37992608b38e3728a6e22f9',REPLACEMENTS='d5ad5e422f3fe1563d425ef8e0a07bea7b874559';
const DIRECTORY='docs/niveaux-progressifs/conventions-tranchees/registre/',REGISTRY=DIRECTORY+'conventions-tranchees.json';
const REGISTRY_SHA='3058f970810166d471607251a2544cb7cdb73e50422794a8bbbedbd613b62705';
const CHECKER='tools/maquette-guidee/check_conventions_independent.py',CHECKER_SHA='9da06b3f30b2282c445aa6f79eb91b36b05ad85576d66ef8bd457c0082b6ce43';
const PREFIX='melunga_deploy/content/niveaux-progressifs/';
const PINS=[
 ['evidence-registre-jota.json',SOURCE,'docs/revue-integrale/convention-jota-es/registre-jota.json','a7ab05654d63f82f17b2e42fa379af1d9a652e1128090347a59c089e244b7bbc'],
 ['evidence-registre-batchim.json',SOURCE,'docs/revue-integrale/convention-batchim-ko/registre-batchim.json','13104a811bf0bc6f123622dbafc24a13ef7da794f7406b05134b274fcbf8a818'],
 ['evidence-errata-contenu-1.json',ERRATUM,'docs/revue-integrale/contenu-incertain/errata-1.json','5418f06dcef98785a617e55a2f033c9bbdd99d9b563efe28f689fca81b9e1453'],
 ['evidence-errata-batchim-1.json',REPLACEMENTS,'docs/revue-integrale/convention-batchim-ko/errata-1.json','0a724d5f9d9de43baee3188cbec543f86eda13433ae0a42a80dd9c7a58bb86ba']
];
const clone=v=>JSON.parse(JSON.stringify(v)),hash=raw=>crypto.createHash('sha256').update(raw).digest('hex'),key=(pair,id)=>pair+'\0'+id;
const at=(doc,loc)=>loc.reduce((node,part)=>node[part],doc),rawRead=file=>JSON.parse(fs.readFileSync(path.join(ROOT,file)));
const bytesCache=new Map(),baseCache=new Map();
function baselineBytes(file){if(!bytesCache.has(file))bytesCache.set(file,execFileSync('git',['show',B_BASE+':'+file],{cwd:ROOT,maxBuffer:64*1024*1024}));return bytesCache.get(file);}
function baseline(file){if(!baseCache.has(file))baseCache.set(file,JSON.parse(baselineBytes(file)));return baseCache.get(file);}
function* walk(node,location=[]){if(!node||typeof node!=='object')return;if(!Array.isArray(node))yield{node,location};for(const[p,v]of Object.entries(node))if(v&&typeof v==='object')yield*walk(v,[...location,Array.isArray(node)?Number(p):p]);}
let ledgerCache;
function loadLedger(override){
 if(!override&&ledgerCache)return ledgerCache;
 const raw=fs.readFileSync(path.join(ROOT,REGISTRY));assert.equal(hash(raw),REGISTRY_SHA,'independently frozen final conventions registry');
 const registry=override||JSON.parse(raw),proofs=PINS.map(([name,commit,gitPath,pin])=>{const file=DIRECTORY+name,bytes=fs.readFileSync(path.join(ROOT,file));assert.equal(hash(bytes),pin);assert.ok(bytes.equals(execFileSync('git',['show',commit+':'+gitPath],{cwd:ROOT,maxBuffer:64*1024*1024})));return{file,data:JSON.parse(bytes),descriptor:{path:file,gitPath,gitCommit:commit,sha256:pin}};});
 assert.deepEqual(registry.evidenceFiles,proofs.map(p=>p.descriptor));
 assert.equal(registry.id,'conventions-tranchees');assert.equal(registry.baseSnapshotCommit,BASE);assert.equal(registry.status,'frozen-owner-decided-phonetic-literals-not-global-native-approval');
 assert.deepEqual(registry.appliesAfter,[{registryPath:'docs/niveaux-progressifs/contenu-tranche/registre-contenu-tranche.json',registrySha256:'3fa187478a03e1398e7b14fa545c0950bf1ff166789a480745ca689061377130'}]);
 const selected=new Map(),primary=new Map(),post=new Map(),excluded=new Map();
 for(const[pair,convention,proof,count]of[['fr-es','convention-jota-es',proofs[0],110],['fr-ko','convention-batchim-ko',proofs[1],1989]]){
  assert.equal(proof.data.eventCount,count);assert.equal(proof.data.events.length,count);assert.equal(proof.data.baseSnapshotCommit,BASE);
  proof.data.events.forEach((event,index)=>{const id=key(pair,event.id);assert.ok(!primary.has(id));assert.equal(typeof event.beforePhon,'string');assert.equal(typeof event.afterPhon,'string');assert.notEqual(event.beforePhon,event.afterPhon);const row={pairId:pair,id:event.id,convention,beforePhon:event.beforePhon,afterPhon:event.afterPhon,events:[{evidencePath:proof.file,evidenceCollection:'events',evidenceIndex:index}],sourceAnchor:event.occurrence};primary.set(id,event);selected.set(id,row);});
  (proof.data.afterContentRegister||[]).forEach((event,index)=>{const id=key(pair,event.id);assert.ok(!post.has(id));post.set(id,event);const row=selected.get(id)||{pairId:pair,id:event.id,convention,events:[],sourceAnchor:null};assert.equal(typeof event.contentBlocAfterPhon,'string');assert.equal(typeof event.afterBatchim,'string');Object.assign(row,{beforePhon:event.contentBlocAfterPhon,afterPhon:event.afterBatchim});row.events.push({evidencePath:proof.file,evidenceCollection:'afterContentRegister',evidenceIndex:index});selected.set(id,row);});
  (proof.data.notApplied||[]).forEach((event,index)=>{const id=key(pair,event.id);assert.ok(!selected.has(id)&&!excluded.has(id));excluded.set(id,{event,index});});
 }
 assert.equal(primary.size,2099);assert.equal(post.size,21);assert.equal([...post.keys()].filter(id=>primary.has(id)).length,17);assert.equal(excluded.size,69);
 const replacementIds=['catalogue:ko:3090','catalogue:ko:4275','catalogue:ko:3870','catalogue:ko:1433','catalogue:ko:4193'];assert.deepEqual(proofs[3].data.events.map(e=>e.id),replacementIds);
 proofs[3].data.events.forEach((event,index)=>{const id=key('fr-ko',event.id),original=primary.get(id),row=selected.get(id);assert.ok(original&&!post.has(id));assert.equal(event.beforePhon,original.beforePhon);assert.equal(event.study,original.study);assert.equal(event.deliveredAfterPhon,original.afterPhon);assert.notEqual(event.afterPhon,event.deliveredAfterPhon);row.afterPhon=event.afterPhon;row.events.push({evidencePath:proofs[3].file,evidenceCollection:'events',evidenceIndex:index});});
 const superseded=[key('fr-es','catalogue:es:3353'),key('fr-ko','catalogue:ko:3767'),key('fr-ko','catalogue:ko:3637')];for(const id of superseded){assert.ok(selected.has(id)&&!post.has(id));selected.delete(id);}
 assert.equal(selected.size,2100);assert.equal([...selected.values()].reduce((n,r)=>n+r.events.length,0),2122);
 assert.equal(registry.correctionCount,2100);assert.equal(registry.occurrenceCount,2167);assert.equal(registry.appliedSourceReferenceCount,2122);assert.equal(registry.corrections.length,2100);
 const contentRaw=fs.readFileSync(path.join(ROOT,'docs/niveaux-progressifs/contenu-tranche/evidence-registre-contenu.json'));assert.equal(hash(contentRaw),'0276ad1dac00161a6619de315d22d558f65b55a8821f3ddab95a1f10ad9a9e02');const content=JSON.parse(contentRaw),contentById=new Map(content.events.map(e=>[key(e.pair,e.id),e]));
 const entries=new Map();
 for(const row of registry.corrections){const id=key(row.pairId,row.id),wanted=selected.get(id);assert.ok(wanted&&!entries.has(id));assert.deepEqual(Object.fromEntries(['pairId','id','convention','beforePhon','afterPhon','events'].map(f=>[f,row[f]])),Object.fromEntries(['pairId','id','convention','beforePhon','afterPhon','events'].map(f=>[f,wanted[f]])),'complete primary/override/replacement literal chain');assert.deepEqual(row.sourceAnchor,wanted.sourceAnchor);const anchor=row.sourceAnchor||contentById.get(id).occurrence;assert.ok(row.occurrences.some(o=>o.path===anchor.path&&isDeepStrictEqual(o.location,anchor.location)));entries.set(id,row);}
 const protectedIds=new Set([...excluded.keys(),...superseded]);assert.equal(protectedIds.size,72);assert.equal(registry.protectedExcluded.length,72);assert.deepEqual(new Set(registry.protectedExcluded.map(r=>key(r.pairId,r.id))),protectedIds);
 assert.deepEqual(registry.supersededByContent.map(r=>key(r.pairId,r.id)),superseded);assert.equal(registry.notAppliedCount,69);
 const result={registry,entries,primary,post,excluded,protectedIds,proofs,registrySha256:hash(raw)};if(!override)ledgerCache=result;return result;
}
function actualPack(){const m=baseline(PREFIX+'manifest.json');return Object.fromEntries([PREFIX+'manifest.json',...m.pairs.flatMap(p=>[p.repertoirePath,...p.levels.map(l=>l.dataPath)]).map(f=>'melunga_deploy/'+f)].map(f=>[f,rawRead(f)]));}
function declaration(){return{registryPath:REGISTRY,registrySha256:REGISTRY_SHA,baseSnapshotCommit:BASE,appliesAfter:[{registryPath:'docs/niveaux-progressifs/contenu-tranche/registre-contenu-tranche.json',registrySha256:'3fa187478a03e1398e7b14fa545c0950bf1ff166789a480745ca689061377130'}],correctionCount:2100,sourceEventCount:2099,postContentOverrideCount:21,supersededSourceEventCount:3,notAppliedCount:69,batchimErratumEventCount:5,appliedSourceReferenceCount:2122,evidenceCommits:[SOURCE,ERRATUM,REPLACEMENTS]};}
function annotation(row,before){return{id:row.id,convention:row.convention,registryPath:REGISTRY,registrySha256:REGISTRY_SHA,baseSnapshotCommit:BASE,fields:['phon'],beforeFields:{phon:before.phon},originalPhoneticReviewStatusPresent:Object.hasOwn(before,'phoneticReviewStatus'),originalPhoneticReviewStatus:before.phoneticReviewStatus??null,evidenceCommits:[SOURCE,ERRATUM,REPLACEMENTS],events:row.events};}
function assertOwnConventions(actual){
 const audit=loadLedger(),found=new Map(),protectedFound=new Map(),profiles={};
 for(const[file,doc]of Object.entries(actual)){
  if(file.endsWith('/manifest.json'))continue;const original=baseline(file),expected=clone(original),pair=doc.pairId||doc.id;
  for(const{node:before,location}of walk(original)){
   if(!['id','study','native','phon'].every(f=>typeof before[f]==='string'))continue;const id=key(pair,before.id),row=audit.entries.get(id),current=at(doc,location),role=file.includes('/repertoires/')?location[0]==='receivedModels'?'received-model':'transport-phrase':'canonical';
   if(row){assert.equal(before.phon,row.beforePhon);const wanted=at(expected,location);wanted.phon=row.afterPhon;wanted.phoneticReviewStatus='corrected-by-owner-'+row.convention;wanted.conventionCorrection=annotation(row,before);assert.deepEqual(current,wanted,'complete current object with all B fields/status history/source/role conserved');if(!found.has(id))found.set(id,[]);found.get(id).push({file,location,role,before,current});profiles[role]=(profiles[role]||0)+1;}
   if(audit.protectedIds.has(id)){assert.deepEqual(current,before,'all69excluded+3superseded objects completely preserved from B');if(!protectedFound.has(id))protectedFound.set(id,[]);protectedFound.get(id).push({file,location});}
  }
  assert.deepEqual(doc,expected,'only registered phon/status/annotation changes in '+file);
 }
 assert.equal(found.size,2100);assert.deepEqual(profiles,{canonical:2099,'transport-phrase':66,'received-model':2});
 for(const[id,row]of audit.entries){const copies=found.get(id);assert.equal(copies.length,row.occurrences.length);for(const o of row.occurrences){const match=copies.find(c=>c.file===o.path&&isDeepStrictEqual(c.location,o.location));assert.ok(match);assert.equal(o.profile,match.role);const p=o.expectedBefore,b=match.before;for(const f of ['study','native','phon','source'])assert.deepEqual(p[f],b[f]);for(const f of ['reading','phoneticReviewStatus']){assert.equal(p[f+'Present'],Object.hasOwn(b,f));assert.deepEqual(p[f],b[f]??null);}assert.deepEqual(p.priorAnnotations,Object.fromEntries(Object.entries(b).filter(([f])=>f.endsWith('Correction')&&f!=='conventionCorrection')));}for(const c of copies)for(const field of ['study','native','phon','reading'])assert.equal(c.current[field],copies[0].current[field]);}
 assert.equal(protectedFound.size,72);assert.equal([...protectedFound.values()].reduce((n,a)=>n+a.length,0),78);
 for(const row of audit.registry.protectedExcluded){const found=protectedFound.get(key(row.pairId,row.id));assert.equal(row.occurrences.length,found.length);for(const o of row.occurrences)assert.ok(found.some(c=>c.file===o.path&&isDeepStrictEqual(c.location,o.location)));}
 const manifest=clone(baseline(PREFIX+'manifest.json'));manifest.conventionCorrections=declaration();for(const pair of manifest.pairs)pair.repertoireSha256=hash(rawRead(PREFIX+'manifest.json').allClassification?require('./all-classification.cjs').baselineBytes('melunga_deploy/'+pair.repertoirePath):fs.readFileSync(path.join(WEB,pair.repertoirePath)));assert.deepEqual(actual[PREFIX+'manifest.json'],manifest,'B manifest and access data preserved except convention proof and actual bank hashes');
 for(const file of ['app.html','maquette-guidee.js','maquette-guidee.css','parcours-niveaux.html','maquette-guidee.html','content/maquette-guidee.json']){const filename='melunga_deploy/'+file,bytes=rawRead(PREFIX+'manifest.json').allClassification?require('./all-classification.cjs').beforeAssetBytes(filename):fs.readFileSync(path.join(WEB,file));assert.ok(bytes.equals(baselineBytes(filename)),'UI/classic32115/prices/free unchanged before separately frozen classification-only asset changes');}
 return{identities:2100,objects:2167,fields:2167,sourceReferences:2122,profiles,protectedIdentities:72,protectedObjects:78,wholeDocuments:78,postContentOverrides:21,batchimErrata:5};
}
let projectedCache;
function ensureProjection(){
 if(projectedCache)return projectedCache;
 const actual=actualPack();
 if(actual[PREFIX+'manifest.json'].allClassification){
  const classification=require('./all-classification.cjs').ensureProjection();assert.deepEqual(actual,classification.actual,'the same actual composed bytes enter every layer');
  const conventionActual=classification.beforeClassification,summary=assertOwnConventions(conventionActual),beforeB=classification.beforeConventions,bankHashes={};
  assert.equal(hash(fs.readFileSync(path.join(ROOT,CHECKER))),CHECKER_SHA,'frozen convention proof checker');
  for(const file of Object.keys(beforeB)){assert.deepEqual(beforeB[file],baseline(file),'whole independently checked B inverse');}
  for(const pair of beforeB[PREFIX+'manifest.json'].pairs){const file='melunga_deploy/'+pair.repertoirePath;bankHashes[file]=hash(baselineBytes(file));assert.equal(pair.repertoireSha256,bankHashes[file]);}
  projectedCache={actual,conventionActual,beforeB,bankHashes,documents:classification.documents,fingerprints:classification.fingerprints,summary:{...summary,independent:{composition:classification.summary.independent,content:classification.summary.independent},classification:classification.summary}};return projectedCache;
 }
 const summary=assertOwnConventions(actual);assert.equal(hash(fs.readFileSync(path.join(ROOT,CHECKER))),CHECKER_SHA,'frozen independent C/B inverse checker');
 const output=JSON.parse(execFileSync('python3',['-B',path.join(ROOT,CHECKER),'--root',ROOT,'--project-content-runtime'],{cwd:ROOT,encoding:'utf8',maxBuffer:96*1024*1024}));assert.ok(output.documents&&output.summary&&output.actualRawDocumentSha256);
 const beforeB=clone(actual),fingerprints={},bankHashes={};
 for(const row of loadLedger().registry.corrections)for(const o of row.occurrences){const phrase=at(beforeB[o.path],o.location);phrase.phon=row.beforePhon;delete phrase.conventionCorrection;if(o.expectedBefore.phoneticReviewStatusPresent)phrase.phoneticReviewStatus=clone(o.expectedBefore.phoneticReviewStatus);else delete phrase.phoneticReviewStatus;}
 delete beforeB[PREFIX+'manifest.json'].conventionCorrections;
 for(const pair of beforeB[PREFIX+'manifest.json'].pairs){const file='melunga_deploy/'+pair.repertoirePath;bankHashes[file]=hash(baselineBytes(file));pair.repertoireSha256=bankHashes[file];}
 for(const[file,document]of Object.entries(actual)){fingerprints[file]=hash(fs.readFileSync(path.join(ROOT,file)));assert.equal(output.actualRawDocumentSha256[file],fingerprints[file],'same actual C raw bytes independently validated');assert.deepEqual(beforeB[file],baseline(file),'finite own inverse preserves every complete B document');}
 projectedCache={actual,conventionActual:actual,beforeB,bankHashes,documents:output.documents,fingerprints,summary:{...summary,independent:output.summary}};return projectedCache;
}
function inputFiles(){return[...(rawRead(PREFIX+'manifest.json').allClassification?require('./all-classification.cjs').inputFiles():[]),__filename,path.join(ROOT,REGISTRY),path.join(ROOT,CHECKER),path.join(ROOT,'tools/maquette-guidee/check_uncertain_content_independent.py'),path.join(ROOT,'tools/maquette-guidee/check_levels_independent.py'),path.join(WEB,'tests/uncertain-content.cjs'),...['registre-contenu-tranche.json','evidence-registre-contenu.json','evidence-errata-1.json','evidence-README.md','exceptions-contenu-tranche.json'].map(f=>path.join(ROOT,'docs/niveaux-progressifs/contenu-tranche',f)),...PINS.map(p=>path.join(ROOT,DIRECTORY+p[0])),...['app.html','maquette-guidee.js','maquette-guidee.css','parcours-niveaux.html','maquette-guidee.html','content/maquette-guidee.json'].map(f=>path.join(WEB,f)),...Object.keys(actualPack()).map(f=>path.join(ROOT,f))];}
function auditRuntime(){return ensureProjection().summary;}
module.exports={loadLedger,baseline,baselineBytes,rawRead,actualPack,assertOwnConventions,ensureProjection,inputFiles,auditRuntime};

if(require.main===module){
 const {test,before,after}=require('node:test'),http=require('node:http'),{chromium}=require('playwright-core');
 let server,browser,base,snapshots;const errors=[],requests=[],report={status:'running',checks:[],actualContent:true,publicSiteChecked:false,nativeOrPhoneticApproval:false,environment:'local Chromium; emulated viewports; mocked speechSynthesis',viewports:[{width:320,height:640},{width:1280,height:720}],models:[],speechChecks:0,fitChecks:0};
 before(async()=>{report.sourceAudit=auditRuntime();report.contentAudit=require('./uncertain-content.cjs').auditRuntime();snapshots=new Map(inputFiles().map(f=>[f,hash(fs.readFileSync(f))]));server=http.createServer((req,res)=>{const file=path.resolve(WEB,'.'+new URL(req.url,'http://local').pathname);if(!file.startsWith(WEB+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile())return res.writeHead(404).end();res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css'})[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base='http://127.0.0.1:'+server.address().port;browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});});
 after(async()=>{await browser?.close();if(server)await new Promise(resolve=>server.close(resolve));report.errors=errors;report.externalOrApiRequests=requests;report.stableInputs=[...snapshots||[]].every(([f,h])=>hash(fs.readFileSync(f))===h);report.status=!errors.length&&!requests.length&&report.stableInputs&&report.checks.length===4?'passed':'failed';if(process.env.CONVENTION_QA_REPORT)fs.writeFileSync(process.env.CONVENTION_QA_REPORT,JSON.stringify(report,null,2)+'\n');assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);assert.equal(report.stableInputs,true);});
  function fixtures() {
    const audit = loadLedger(), pack = ensureProjection().actual, result = [];
    for (const pair of pack[PREFIX + 'manifest.json'].pairs) {
      const bank = pack['melunga_deploy/' + pair.repertoirePath], models = new Map([...bank.phrases, ...(bank.receivedModels || [])].map(p => [p.id, p]));
      const receivedModels = new Map((bank.receivedModels || []).map(p => [p.id,p]));
      const canonical = new Map(pair.levels.flatMap(level => {const cell=pack['melunga_deploy/'+level.dataPath]; return [...cell.themes,...(cell.heldThemes||[])].flatMap(theme=>theme.phrases).concat(cell.reserve||[]);}).map(p=>[p.id,p]));
      for (const level of pair.levels) {
        const cell = pack['melunga_deploy/' + level.dataPath];
        for (const [themeIndex, theme] of cell.themes.entries()) {
          for (const phrase of theme.phrases) models.set(phrase.id, phrase);
          for (const [stepIndex, step] of theme.sequences.flatMap(s => s.steps).entries()) {
            const entry = audit.entries.get(key(pair.id, step.utterance)) || (audit.protectedIds.has(key(pair.id,step.utterance)) ? {pairId:pair.id,id:step.utterance,protected:true,events:[]} : null);
            if (entry) {const phrase=step.kind==='receive'?receivedModels.get(step.utterance):canonical.get(step.utterance)||models.get(step.utterance); assert.ok(phrase,'real current model '+pair.id+'/'+step.utterance+'/'+step.kind); result.push({pairId: pair.id, studyLanguage: pair.studyLanguage, level: level.level, themeIndex, stepIndex, step, entry, phrase});}
          }
        }
      }
    }
    return result;
  }
  async function open(viewport) {
    const context = await browser.newContext({viewport, isMobile: viewport.width < 600, hasTouch: viewport.width < 600, reducedMotion: 'reduce'});
    await context.addInitScript(() => {window.__contentSpeech = []; window.SpeechSynthesisUtterance = class {constructor(text) {this.text = text;}}; Object.defineProperty(window, 'speechSynthesis', {value: {cancel() {}, getVoices() {return [];}, addEventListener() {}, speak(utterance) {window.__contentSpeech.push({text: utterance.text, lang: utterance.lang}); utterance.onend?.();}}});});
    await context.route('**/*', async route => {const url = new URL(route.request().url()); if (url.origin !== base || /\/(?:\.netlify|api)\//.test(url.pathname)) {requests.push(url.origin + url.pathname); await route.abort();} else await route.continue();});
    const page = await context.newPage(); page.on('pageerror', error => errors.push(error.message)); return {context, page};
  }
  async function enter(page, target, previous) {
    if (!previous || previous.pairId !== target.pairId || previous.level !== target.level || previous.themeIndex !== target.themeIndex || previous.stepIndex >= target.stepIndex) {
      await page.goto(base + '/parcours-niveaux.html?pair=' + target.pairId + '&level=' + target.level);
      await page.waitForFunction(t => window.MelungaMockup?.state().screen === 'themes' && window.MelungaMockup.state().pairId === t.pairId && window.MelungaMockup.state().level === t.level, target);
      await page.locator('#mgThemeGrid > button').nth(target.themeIndex).click();
    }
    await page.evaluate(target => {while (window.MelungaMockup.state().stepIndex < target.stepIndex) {document.querySelector('#mgChoices:not([hidden]) button')?.click(); const next = document.getElementById('mgContinue'); if (next.disabled) throw new Error('Real lesson blocked while advancing to ' + target.entry.id); next.click();}}, target);
    assert.equal(await page.evaluate(() => window.MelungaMockup.state().phraseId), target.entry.id);
  }
  async function checkModel(page, target, fit) {
    const phrase = target.phrase;
    for (const [id, field] of [['mgPhrase','study'],['mgPhon','phon'],['mgTranslation','native'],['mgReading','reading']]) assert.equal(await page.locator('#' + id).textContent(), phrase[field] || '', 'actual whole DOM field ' + target.pairId + '/' + phrase.id + '/' + field);
    await page.evaluate(() => document.querySelector('#mgChoices:not([hidden]) button')?.click());
    const wasMasked = await page.evaluate(() => window.MelungaMockup.state().masked);
    await page.click('#mgEar');
    const spoken = await page.evaluate(() => window.__contentSpeech.at(-1));
    assert.equal(spoken.text, phrase.study, 'TTS receives the whole study script, never reading or phonetic aid'); assert.equal(spoken.lang.split('-')[0], target.studyLanguage); report.speechChecks++;
    if (wasMasked) assert.equal(await page.evaluate(() => window.MelungaMockup.state().masked), false, 'explicit ear reveals recall');
    if (target.step.kind === 'receive') {assert.equal(await page.locator('#mgReplay').isDisabled(), true); assert.equal(phrase.heardOnly, true); assert.equal(phrase.referenceOnly, true);}
    if (fit) {
      if (['ja','ko'].includes(target.studyLanguage) && phrase.reading && !await page.locator('#mgReading').isVisible()) {const toggle = page.locator('#mgReadingToggle'); if (await toggle.isVisible()) await toggle.click();}
      await page.evaluate(async () => {await document.fonts.ready; await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));});
      const result = await page.evaluate(() => {
        const rect = n => {const r = n.getBoundingClientRect(); return {top:r.top,bottom:r.bottom,left:r.left,right:r.right};};
        const visible = n => n && !n.hidden && getComputedStyle(n).display !== 'none' && n.getBoundingClientRect().width > 0;
        return {lesson:rect(document.getElementById('mgLessonView')), texts:['mgPhrase','mgPhon','mgTranslation','mgReading'].map(id => document.getElementById(id)).filter(visible).map(n => {const range = document.createRange(); range.selectNodeContents(n); return {id:n.id,text:rect(range),element:rect(n),overflow:getComputedStyle(n).overflowY};}), scrollers:[document.scrollingElement,...['mgContent','mgLessonView','mgModel'].map(id => document.getElementById(id))].map(n => ({id:n.id || n.tagName,scrollHeight:n.scrollHeight,clientHeight:n.clientHeight,scrollWidth:n.scrollWidth,clientWidth:n.clientWidth})), actions:['mgEar','mgContinue','mgReplay'].map(id => {const n = document.getElementById(id); return {id,visible:visible(n),rect:rect(n)};}),viewport:{width:innerWidth,height:innerHeight}};
      });
      const label = target.pairId + '/' + phrase.id + '/' + target.step.kind;
      for (const n of result.scrollers) {assert.ok(n.scrollHeight <= n.clientHeight + 2, label + '/' + n.id + ' no vertical scrolling'); assert.ok(n.scrollWidth <= n.clientWidth + 2, label + '/' + n.id + ' no horizontal scrolling');}
      for (const n of result.texts) {assert.ok(n.text.top >= result.lesson.top - 2 && n.text.bottom <= result.lesson.bottom + 2, label + '/' + n.id + ' entire text inside card'); assert.ok(n.text.left >= result.lesson.left - 2 && n.text.right <= result.lesson.right + 2, label + '/' + n.id + ' no lateral clipping'); if (n.overflow !== 'visible') assert.ok(n.text.top >= n.element.top - 2 && n.text.bottom <= n.element.bottom + 2, label + '/' + n.id + ' no inner clipping');}
      for (let i = 0; i < result.texts.length; i++) for (let j = i + 1; j < result.texts.length; j++) {const a = result.texts[i].text, b = result.texts[j].text; assert.ok(Math.min(a.right,b.right) - Math.max(a.left,b.left) <= 1 || Math.min(a.bottom,b.bottom) - Math.max(a.top,b.top) <= 1, label + ' text fields do not overlap');}
      for (const action of result.actions) {assert.equal(action.visible,true,label + '/' + action.id + ' action visible'); assert.ok(action.rect.top >= -2 && action.rect.bottom <= result.viewport.height + 2 && action.rect.left >= -2 && action.rect.right <= result.viewport.width + 2,label + '/' + action.id + ' entire action in viewport');} report.fitChecks++;
    }
    report.models.push({pair:target.pairId,id:phrase.id,kind:target.step.kind,level:target.level,fit});
  }

 test('2100 whole literal identities preserve B content, 2167 objects, 72 protected identities and all runtime documents',()=>{
  const audit=auditRuntime();assert.equal(audit.identities,2100);assert.equal(audit.objects,2167);assert.equal(audit.sourceReferences,2122);assert.equal(audit.protectedIdentities,72);assert.equal(audit.protectedObjects,78);
  const pack=ensureProjection().conventionActual,ledger=loadLedger();let reserved=0,received=0; // Exact convention layer; actual classified routing is checked by the outer suite.
  for(const row of ledger.registry.corrections)if(row.occurrences.some(o=>o.location[0]==='reserve'))reserved++;
  assert.equal(reserved,48);
  const blockedByPair=new Map(pack[PREFIX+'manifest.json'].pairs.map(pair=>[pair.id,new Set(pair.levels.flatMap(level=>{const cell=pack['melunga_deploy/'+level.dataPath];return[...(cell.reserve||[]),...(cell.heldThemes||[]).flatMap(t=>t.phrases)].map(p=>p.id);}))]));
  for(const pair of pack[PREFIX+'manifest.json'].pairs)for(const level of pair.levels){const cell=pack['melunga_deploy/'+level.dataPath],blocked=blockedByPair.get(pair.id);for(const theme of cell.themes)for(const sequence of theme.sequences)for(const step of sequence.steps){if(step.kind==='receive'){assert.equal(step.requiresProduction,false);assert.equal(step.countsForProgress,false);if(ledger.entries.has(key(pair.id,step.utterance)))received++;}else for(const id of [step.utterance,...(step.choices||[])].filter(Boolean))assert.ok(!blocked.has(id),'reserve/held source never becomes learner production');}}
  report.productionIsolation={reservedConventionIds:reserved,correctedReceiveUses:received};report.checks.push('whole-runtime-and-B-conservation');
 });
 test('stale delivered afters, forged chains, promoted statuses, lost B fields and protected converter suggestions are rejected',()=>{
  const state=ensureProjection(),audit=loadLedger(),first=audit.registry.corrections[0],post=audit.registry.corrections.find(r=>r.events.some(e=>e.evidenceCollection==='afterContentRegister')),transport=audit.registry.corrections.find(r=>r.occurrences.some(o=>o.profile==='transport-phrase')),heard=audit.registry.corrections.find(r=>r.occurrences.some(o=>o.profile==='received-model'));
  const faults=[[first,p=>{p.phon=first.beforePhon;}],[first,p=>{p.phoneticReviewStatus='native-approved';}],[first,p=>{delete p.conventionCorrection;}],[first,p=>{p.study+='unapproved';}],[first,p=>{p.native+='unapproved';}],[first,p=>{p.reading=123;}],[post,p=>{p.uncertainContentCorrection.beforeFields={};}],[transport,p=>{p.phon=transport.beforePhon;},'transport-phrase'],[heard,p=>{p.heardOnly=false;},'received-model']];
  for(const replacement of audit.proofs[3].data.events){const row=audit.entries.get(key('fr-ko',replacement.id));faults.push([row,p=>{p.phon=replacement.deliveredAfterPhon;}]);}
  for(const[row,mutate,role]of faults){const changed=clone(state.conventionActual),o=role?row.occurrences.find(o=>o.profile===role):row.occurrences[0];mutate(at(changed[o.path],o.location));assert.throws(()=>assertOwnConventions(changed));}
  const protectedRow=audit.registry.protectedExcluded[0],o=protectedRow.occurrences[0],changed=clone(state.conventionActual);at(changed[o.path],o.location).phon+='converter suggestion';assert.throws(()=>assertOwnConventions(changed));
  for(const mutate of [r=>{r.corrections[0].afterPhon=123;},r=>{r.corrections[0].events=[];},r=>{r.corrections.find(r=>r.events.length>1).events.pop();},r=>{r.protectedExcluded.pop();},r=>{r.notAppliedCount=68;}]){const wrong=clone(audit.registry);mutate(wrong);assert.throws(()=>loadLedger(wrong));}
  report.adversarialCases=faults.length+6;report.checks.push('adversarial');
 });
 test('all21 post-content chains, five whole after replacements, excluded overlaps and longest convention cards fit and speak current scripts', {timeout:900000},async()=>{
  const all=fixtures(),audit=loadLedger(),selected=new Map(),required=new Set([...audit.post.keys(),...audit.proofs[3].data.events.map(e=>key('fr-ko',e.id)),...audit.registry.supersededByContent.map(r=>key(r.pairId,r.id)),...audit.registry.notAppliedContentOverlaps.map(r=>key(r.pairId,r.id))]);
  for(const target of all)if(['understand','receive'].includes(target.step.kind)&&required.has(key(target.pairId,target.entry.id))&&!selected.has(key(target.pairId,target.entry.id)))selected.set(key(target.pairId,target.entry.id),target);
  const pack=ensureProjection().actual,reservedIds=new Set();
  for(const pair of pack[PREFIX+'manifest.json'].pairs)for(const level of pair.levels){const cell=pack['melunga_deploy/'+level.dataPath];for(const phrase of [...(cell.reserve||[]),...(cell.heldThemes||[]).flatMap(t=>t.phrases)])reservedIds.add(key(pair.id,phrase.id));}
  const reservedRequired=[...required].filter(id=>!selected.has(id));for(const id of reservedRequired)assert.ok(reservedIds.has(id),'every non-displayed explicit case is retained in its approved current reserve');
  report.explicitSourceCasesReserved=reservedRequired;report.explicitSourceCasesDisplayed=required.size-reservedRequired.length;
  for(const target of all)if(target.step.kind==='receive'&&audit.entries.has(key(target.pairId,target.entry.id)))selected.set(key(target.pairId,target.entry.id),target);
  for(const pairId of ['fr-es','fr-ko'])for(let level=1;level<=10;level++){const candidates=all.filter(t=>t.pairId===pairId&&t.level===level&&t.step.kind==='understand'&&!t.entry.protected);for(const score of [p=>p.phon.length,p=>['study','native','phon','reading'].reduce((n,f)=>n+(p[f]||'').length,0)]){const longest=[...candidates].sort((a,b)=>score(b.phrase)-score(a.phrase))[0];if(longest)selected.set(key(pairId,longest.entry.id),longest);}}
  const targets=[...selected.values()].sort((a,b)=>a.pairId.localeCompare(b.pairId)||a.level-b.level||a.themeIndex-b.themeIndex||a.stepIndex-b.stepIndex);
  report.explicitSourceCases=required.size;report.postContentCases=21;report.batchimErratumCases=5;report.viewportModels=targets.length;
  for(const viewport of report.viewports){const{context,page}=await open(viewport);let previous;try{for(const target of targets){await enter(page,target,previous);await checkModel(page,target,true);previous=target;}}finally{await context.close();}}
  report.checks.push('post-content-errata-protection-and-fit');
 });
 test('Spanish and Korean all actual lesson kinds preserve whole fields, explicit recall reveal and receive-only roles',{timeout:300000},async()=>{
  const selected=new Map();for(const target of fixtures())if(!target.entry.protected&&!selected.has(target.pairId+'/'+target.step.kind))selected.set(target.pairId+'/'+target.step.kind,target);
  const{context,page}=await open({width:390,height:844});try{for(const target of selected.values()){await enter(page,target);await checkModel(page,target,false);}}finally{await context.close();}
  report.stepKinds=[...new Set([...selected.values()].map(t=>t.step.kind))].sort();report.pairs=[...new Set([...selected.values()].map(t=>t.pairId))].sort();assert.deepEqual(report.pairs,['fr-es','fr-ko']);assert.deepEqual(report.stepKinds,['choose-and-recall','imitate','receive','understand']);report.checks.push('pairs-and-step-kinds');
 });
}
