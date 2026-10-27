/* Independent checks of all seven frozen classification ledgers. No producer
 * is imported. A historical before-view is available only after the complete
 * actual edition has passed the independently pinned subprocess checker. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');
const {isDeepStrictEqual} = require('node:util');
const ROOT = path.resolve(__dirname, '..', '..'), WEB = path.join(ROOT, 'melunga_deploy');
const BASE = '13f42b5814f2b230d76d2d0ef267dcf406c523c2'; // Immutable classification anchors.
const INPUT = 'd30c1c97769fa180e2370e6b182535e3886bc70f'; // Approved complete B+C objects.
const CONTENT_INPUT = 'e85c8c355be8cc0213543eddb21467432edb57b8';
const COMMIT = '342600641c8a621019d0c05d75a481843640e9ed';
const REVIEW = 'docs/niveaux-progressifs/classement-sept-couples';
const PREFIX = 'melunga_deploy/content/niveaux-progressifs/';
const PAIRS = ['fr-en','fr-es','fr-it','fr-ja','fr-ko','fr-zh','zh-fr'];
const REGISTRY_SHAS = {'fr-en':'dfcde432da30d22ca3375c5544e14fb5f7b6e84db04af9cec8271cf696e984e9','fr-es':'6bb12de6032dc75d68a9d5f4fe1ad37129b01b51870c38e882627856dac63aee','fr-it':'1705666cea584e445b8c2f77548da2728b353e2931789798fb30c2b2896ae754','fr-ja':'04c62d9afe93415a0eaa28da0c7a721a0bdb0795a2cac6f70e34441a14f6659d','fr-ko':'42c3d363fdf494ba5cb46b5979a3dce645431c82b6d2cdd37e25b08ec958acc6','fr-zh':'c89ec95f6d592cd296b506d8542db90becb6eca8c9569e8096611a53b9317480','zh-fr':'fb2123136e462cc72cdcd881b5c86bebd019cab66f182acb5c5320c80a7199f4'};
const DESCRIPTOR_SHA256 = '57d7731c5001d065ce53ced537f782953dcd40dd61846627739adeb1bfd06f20';
const MANIFEST_SHA256 = 'd0c785ebd39b1cc5fa14f6445b08c7982dda03255741f61bcf21c991c34c423c';
const INDEPENDENT_CHECKER_SHA256 = '81b140ac5c245acfaf804cd8a8cd8e95138975c8a671bfbda58853664f03685a';
const CLASSIFIED_JS_SHA256 = '8243a2e44c0b56783df00947032a802a16f274a990c4e46c0b178332911529b4';
const CLASSIFIED_HTML_SHA256 = {"melunga_deploy/maquette-guidee.html":'33e6f13def069dc342447db0ba6b07a0efef7d17ab2b42abef71a2c567c8d2f3',"melunga_deploy/parcours-niveaux.html":'cbdabdd39b92a431060731cdf8f93dbbccbf2ef199aefa780f53845d3e37f58e'};
const NAVIGATION_UI_BASE = 'a5c721f51a217750c3b83ecd56c85dbfc4ccb7f8';
const COURSE_LOGIN_HEAD = '<link rel="stylesheet" href="course-login.css?v=1">\n<script src="course-login.js?v=1" defer></script>\n';
// Authorized entry/mobile UI shell: exact whole current assets are validated
// before historical source tests may see the unchanged earlier presentation.
// Account and current mobile behavior have independent course-entry-access and
// mobile-picker-menu browser suites; source/content checks are never projected
// until their complete independently pinned runtime audit has passed.
const ENTRY_ASSET_SHA256 = {
  'melunga_deploy/app.html':'3544302224ad8e162b9ba40e76b8e5905dbebce2987431c8e8d30fca85df5c1a',
  'melunga_deploy/course-login.css':'bdcfa4b4bc85daca76b728a14e3e97326a739b13137ae6f17b6cd90d059ff46c',
  'melunga_deploy/course-login.js':'3ec780d1f6a10b68b54f7bcedd6aa96f2e39a334175841973be8e4e785654291',
  'melunga_deploy/index.html':'00dc701d8b9b5a84b025e9cc369d336317610fd92f2af4d34802cd830969fdbb',
  'melunga_deploy/course-access.js':'b5b3e0d547c84aa24b59d7381a5bfbf11a27836885b875e284b5795873abd082',
  'melunga_deploy/content/course-access.json':'35bd897d1e7f4995e7bd0c4dfa154049e63fcf1063282951b2a9f604481d7c05',
  'melunga_deploy/melunga-logo.svg':'b653fbd78c7b2a3853ad628d83e4230726a17f71e0a5441a01947dd854f86cec',
  'melunga_deploy/maquette-guidee.css':'f31685f8b30f2dba14bd51e38c4a6bb2bb390609c21e895b5b8e20fab01ad00e',
  'melunga_deploy/maquette-guidee.js':CLASSIFIED_JS_SHA256,...CLASSIFIED_HTML_SHA256
};
function validateEntryAssets(){
  for(const [filename, expected]of Object.entries(ENTRY_ASSET_SHA256))assert.equal(sha256(fs.readFileSync(path.join(ROOT,filename))),expected,'authorized whole entry asset '+filename);
  const current=fs.readFileSync(path.join(ROOT,'melunga_deploy/app.html'),'utf8'),original=anchorBytes('melunga_deploy/app.html').toString();
  const approvedClassic=execFileSync('git',['show',NAVIGATION_UI_BASE+':melunga_deploy/app.html'],{cwd:ROOT,maxBuffer:40*1024*1024}).toString();
  assert.equal(current.split(COURSE_LOGIN_HEAD).length,2,'exactly one approved two-include head layer');
  assert.equal(current.replace(COURSE_LOGIN_HEAD,''),approvedClassic,'the whole classic application is unchanged outside two exact head includes');
  for(const name of ['DECKS','PEDAGOGY_FAMILIES']){
    const prefix='var '+name+' = ';
    const now=current.split('\n').filter(line=>line.startsWith(prefix)),before=original.split('\n').filter(line=>line.startsWith(prefix));
    assert.equal(now.length,1,'current classic '+name+' literal exists exactly once');
    assert.equal(before.length,1,'historic classic '+name+' literal exists exactly once');
    assert.equal(now[0],before[0],'classic whole '+name+' literal preserved despite authorized entry shell');
  }
}
const clone = v => JSON.parse(JSON.stringify(v));
const sha256 = raw => crypto.createHash('sha256').update(raw).digest('hex');
function canonical(v) { return Array.isArray(v) ? '['+v.map(canonical).join(',')+']' : v && typeof v === 'object' ? '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}' : JSON.stringify(v); }
const at = (node, location) => location.reduce((v,k)=>v[k],node);
const rawRead = filename => JSON.parse(fs.readFileSync(path.join(ROOT, filename), 'utf8'));
const baseCache = new Map(), baseBytesCache = new Map(), ledgerCache = new Map(), anchorCache=new Map(), anchorBytesCache=new Map(), contentCache=new Map(), contentBytesCache=new Map();
function baselineBytes(filename) { if (!baseBytesCache.has(filename)) baseBytesCache.set(filename,execFileSync('git',['show',INPUT+':'+filename],{cwd:ROOT,maxBuffer:40*1024*1024})); return baseBytesCache.get(filename); }
function baseline(filename) { if (!baseCache.has(filename)) baseCache.set(filename,JSON.parse(baselineBytes(filename))); return baseCache.get(filename); }
function anchorBytes(filename){if(!anchorBytesCache.has(filename))anchorBytesCache.set(filename,execFileSync('git',['show',BASE+':'+filename],{cwd:ROOT,maxBuffer:64*1024*1024}));return anchorBytesCache.get(filename);}
function anchor(filename){if(!anchorCache.has(filename))anchorCache.set(filename,JSON.parse(anchorBytes(filename)));return anchorCache.get(filename);}
function contentBytes(filename){if(!contentBytesCache.has(filename))contentBytesCache.set(filename,execFileSync('git',['show',CONTENT_INPUT+':'+filename],{cwd:ROOT,maxBuffer:64*1024*1024}));return contentBytesCache.get(filename);}
function contentBaseline(filename){if(!contentCache.has(filename))contentCache.set(filename,JSON.parse(contentBytes(filename)));return contentCache.get(filename);}

function canonicalIndex(pack,pairId) {
  const entries=new Map();
  for(let level=1;level<=10;level++) {
    const filename=PREFIX+pairId+'/L'+level+'.json',cell=pack[filename]; assert.ok(cell,'actual cell exists');
    for(const theme of [...cell.themes,...(cell.heldThemes||[])]) for(const phrase of theme.phrases) {
      assert.ok(!entries.has(phrase.id),'canonical identity occurs once'); entries.set(phrase.id,{phrase,level,themeId:theme.id,reserved:false,filename});
    }
    for(const phrase of cell.reserve) { assert.ok(!entries.has(phrase.id),'reserve never duplicates active identity'); entries.set(phrase.id,{phrase,level,themeId:null,reserved:true,filename}); }
  }
  return entries;
}
function loadLedger(pairId) {
  assert.ok(PAIRS.includes(pairId)); if(ledgerCache.has(pairId)) return ledgerCache.get(pairId);
  const registry=REVIEW+'/registre/'+pairId+'.json',source='docs/revue-integrale/classement-'+pairId+'/registre-classement.json';
  const pinned=execFileSync('git',['show',COMMIT+':'+source],{cwd:ROOT,maxBuffer:32*1024*1024});
  assert.equal(sha256(pinned),REGISTRY_SHAS[pairId],'reviewer source hash is independently pinned');
  const raw=fs.readFileSync(path.join(ROOT,registry)); assert.ok(raw.equals(pinned),'local registry is the whole reviewer Git object');
  const ledger=JSON.parse(raw); assert.equal(ledger.pair,pairId); assert.equal(ledger.baseSnapshotCommit,BASE);
  const cells=Object.fromEntries(Array.from({length:10},(_,i)=>PREFIX+pairId+'/L'+(i+1)+'.json').map(f=>[f,baseline(f)]));
  const originalById=canonicalIndex(cells,pairId),ops=new Map();
  for(const op of ledger.ops) {
    assert.ok(!ops.has(op.id),'one final operation per ID'); assert.ok(['move','keep','to-reserve'].includes(op.op));
    const e=op.expectedBefore; assert.equal(e.path,PREFIX+pairId+'/L'+op.fromLevel+'.json'); assert.equal(e.level,op.fromLevel); assert.equal(e.theme,op.fromTheme);
    const phrase=at(anchor(e.path),e.location); assert.equal(phrase.id,op.id); assert.equal(phrase.study,e.study); assert.equal(phrase.study,op.study); assert.equal(phrase.editorialLevel,op.fromLevel);
    if(e.location[0]==='reserve') assert.equal(op.fromTheme,'reserve'); else assert.equal(anchor(e.path).themes[e.location[1]].id,op.fromTheme);
    ops.set(op.id,op);
  }
  const result={ledger,ops,originalById,registry}; ledgerCache.set(pairId,result); return result;
}
function documentPaths() { return [PREFIX+'manifest.json',...PAIRS.flatMap(p=>[PREFIX+'repertoires/'+p+'.json',...Array.from({length:10},(_,i)=>PREFIX+p+'/L'+(i+1)+'.json')])]; }
function actualPack() { return Object.fromEntries(documentPaths().map(f=>[f,rawRead(f)])); }
function finalRoute(original,op,policy) {
  let level=op&&op.op!=='keep'?(op.toLevel??op.fromLevel):original.level;
  let reserved=op?.op==='to-reserve'||original.reserved&&op?.op!=='move';
  let themeId=reserved?null:op?.op==='move'?op.toTheme:original.themeId;
  const hidden=policy.hiddenThemes.find(h=>h.level===level&&h.id===themeId);
  if(hidden) {reserved=true;themeId=null;}
  return {level,reserved,themeId,hidden};
}
function expectedPhrase(original,op,route,theme,registrySha) {
  const result=clone(original); if((!op||op.op==='keep')&&!route.hidden) return result;
  result.editorialLevel=route.level;
  Object.assign(result.placement,route.reserved?{domain:'reserve',section:'reserve',themeId:null}:{domain:theme.domain,section:theme.section,themeId:route.themeId});
  result.classification=route.hidden?{registrySha256:registrySha,operation:'hide-theme-to-reserve',fromLevel:route.level,fromTheme:route.hidden.id,toLevel:route.level,toTheme:null,...(op?{supersededOperation:op.op}:{})}:{registrySha256:registrySha,operation:op.op,fromLevel:op.fromLevel,fromTheme:op.fromTheme,toLevel:route.level,toTheme:route.themeId};
  return result;
}
function assertOwnClassification(pack) {
  const manifest=pack[PREFIX+'manifest.json'],descriptor=manifest?.allClassification;
  assert.ok(descriptor,'actual edition has seven-pair descriptor'); assert.equal(sha256(canonical(descriptor)),DESCRIPTOR_SHA256,'entire finite policy is independently pinned');
  assert.deepEqual(descriptor.pairIds,PAIRS); assert.equal(descriptor.evidenceCommit,COMMIT); assert.equal(descriptor.baseSnapshotCommit,BASE); assert.equal(descriptor.composition?.inputCommit,INPUT); assert.equal(descriptor.composition?.classificationReferenceCommit,BASE);
  assert.deepEqual(descriptor.counts,{cards:2906,move:2532,'to-reserve':318,keep:56,levelChanges:622,intoNewThemes:38,hiddenThemes:29,remainingToReserve:33});
  const totals={operations:0,moves:0,toReserve:0,keep:0,levelChanges:0,canonical:0,active:0,reserve:0,hiddenAdditional:0,alreadyReserved:0,smallThemes:0,mixedThemes:0,largeThemes:0,newThemes:0,newThemeCards:0,bankReservedAliases:0,contextPrimaryAliases:0,outboundCoreReuses:0,typedExtensions:0,stepsChecked:0};
  for(const pairId of PAIRS) {
    const audit=loadLedger(pairId),policy=descriptor.pairs.find(p=>p.pair===pairId),entries=canonicalIndex(pack,pairId),themes=new Map();
    assert.ok(policy); assert.equal(policy.registrySha256,REGISTRY_SHAS[pairId]); assert.deepEqual(policy.counts,audit.ledger.counts);
    assert.deepEqual(policy.newThemes,audit.ledger.newThemes); assert.deepEqual(policy.renamedThemes,audit.ledger.renameThemes);
    assert.equal(entries.size,audit.originalById.size,'all original identities survive');
    for(let level=1;level<=10;level++) for(const theme of pack[PREFIX+pairId+'/L'+level+'.json'].themes) themes.set(level+':'+theme.id,theme);
    for(const [id,original] of audit.originalById) {
      const current=entries.get(id),op=audit.ops.get(id),route=finalRoute(original,op,policy); assert.ok(current);
      assert.equal(current.level,route.level,'exact target level for '+pairId+'/'+id); assert.equal(current.themeId,route.themeId,'exact target theme'); assert.equal(current.reserved,route.reserved,'exact active/reserve partition');
      assert.deepEqual(current.phrase,expectedPhrase(original.phrase,op,route,themes.get(route.level+':'+route.themeId),REGISTRY_SHAS[pairId]),'complete source tuple, prior annotations and all card fields preserved for '+pairId+'/'+id);
    }
    for(const op of audit.ledger.ops) {
      const declared=policy.operations.find(x=>x.id===op.id),original=audit.originalById.get(op.id); assert.ok(declared);
      assert.deepEqual(declared,{id:op.id,op:op.op,fromLevel:op.fromLevel,fromTheme:op.fromTheme,toLevel:op.toLevel??op.fromLevel,toTheme:op.op==='move'?op.toTheme:op.op==='keep'?op.fromTheme:null,contentType:original.phrase.contentType});
      totals.operations++;totals[op.op==='move'?'moves':op.op==='keep'?'keep':'toReserve']++;
      if(op.op==='move'&&op.fromLevel!==op.toLevel)totals.levelChanges++;
    }
    for(const item of policy.newThemes) {
      const theme=themes.get(item.level+':'+item.id); assert.ok(theme); assert.equal(theme.title,item.title); assert.equal(theme.phrases.length,item.cards);
      assert.deepEqual(theme.phrases.map(p=>p.id),audit.ledger.ops.filter(o=>o.op==='move'&&o.toLevel===item.level&&o.toTheme===item.id).map(o=>o.id));
      totals.newThemes++;totals.newThemeCards+=item.cards;
    }
    for(const item of policy.renamedThemes)assert.equal(themes.get(item.level+':'+item.id).title,item.newTitle);
    for(const item of policy.retiredThemes)assert.ok(!themes.has(item.level+':'+item.id),'retired theme removed from visible navigation');
    const reserved=new Set([...entries].filter(([,v])=>v.reserved).map(([id])=>id));
    for(let level=1;level<=10;level++) {
      const cell=pack[PREFIX+pairId+'/L'+level+'.json'],active=[...cell.themes,...(cell.heldThemes||[])].flatMap(t=>t.phrases),all=[...active,...cell.reserve];
      assert.deepEqual(cell.classificationEdition,{pair:pairId,registrySha256:REGISTRY_SHAS[pairId]});
      assert.equal(cell.totalPhrases,active.length);assert.equal(cell.totalCanonicalPhrases,all.length);assert.equal(cell.reservedPhrases,cell.reserve.length);
      for(const type of ['utterance','vocabulary','number','incomplete','review'])assert.equal(cell.counts[type],all.filter(p=>p.contentType===type).length);
      for(const theme of cell.themes) {
        const primary=new Set(theme.phrases.map(p=>p.id)),context=theme.contextReferences||[],reviews=theme.reviewReferences||[];
        const shown=theme.sequences.flatMap(s=>s.phraseIds); assert.equal(shown.length,new Set(shown).size,'canonical/context aliases presented once');
        assert.equal(theme.newCount,primary.size);assert.equal(theme.reviewCount,reviews.length);assert.equal(theme.reuseCount||0,context.filter(r=>!primary.has(r.id)).length);
        assert.equal(theme.presentedCount,new Set([...primary,...context.map(r=>r.id),...reviews.map(r=>r.id)]).size);
        assert.equal(theme.presentedCount,shown.length,'all actual cards enter a sequence exactly once');
        for(const id of [...shown,...(theme.lexicalSupports||[]).map(s=>s.utterance||s.id)])assert.ok(!reserved.has(id),'reserved ID never returns as learner/support content');
        const prepared=new Map();
        for(const seq of theme.sequences) {
          for(const id of seq.preparationIds||[])assert.ok(!reserved.has(id));
          for(const step of seq.steps) {
            totals.stepsChecked++;
            if(step.kind==='receive'){assert.equal(step.requiresProduction,false);assert.equal(step.countsForProgress,false);continue;}
            for(const id of [step.utterance,...(step.choices||[])].filter(Boolean))assert.ok(!reserved.has(id),'reserve never becomes learner production');
            if(['understand','imitate'].includes(step.kind)){if(!prepared.has(step.utterance))prepared.set(step.utterance,{});prepared.get(step.utterance)[step.kind]=step.id;}
            if(['choose-and-recall','recall','reply-without-model'].includes(step.kind)){
              assert.equal(step.preparedInSteps.understoodInStep,prepared.get(step.utterance)?.understand);assert.equal(step.preparedInSteps.imitatedInStep,prepared.get(step.utterance)?.imitate);
            }
          }
        }
        if(theme.isAdditionalSituation){
          const old=[...baseline(PREFIX+pairId+'/L'+level+'.json').themes].find(t=>t.id===theme.id);
          assert.ok(old);assert.deepEqual(theme.sequences.slice(0,old.sequences.length),old.sequences,'all eight original intent/received steps are untouched');
        }
      }
      totals.active+=active.length;totals.reserve+=cell.reserve.length;
    }
    const bank=pack[PREFIX+'repertoires/'+pairId+'.json'];
    assert.deepEqual(bank.classificationEdition,{pair:pairId,registrySha256:REGISTRY_SHAS[pairId]});
    for(const phrase of bank.phrases){const entry=entries.get(phrase.id);assert.ok(entry);if(entry.reserved){assert.deepEqual(phrase.canonicalReserveLocation,{pairId,level:entry.level,themeId:null});assert.equal(phrase.canonicalLocation,undefined);assert.ok(policy.bankReservedReferenceIds.includes(phrase.id));}else assert.deepEqual(phrase.canonicalLocation,{pairId,level:entry.level,themeId:entry.themeId});}
    totals.canonical+=entries.size;totals.hiddenAdditional+=policy.hiddenThemeReserveIds.length;totals.alreadyReserved+=policy.reserveOperationsAlreadyReservedIds.length;
    totals.smallThemes+=policy.smallThemeExceptions.length;totals.mixedThemes+=policy.mixedThemes.length;totals.largeThemes+=policy.largeThemes.length;
    totals.bankReservedAliases+=policy.bankReservedReferenceIds.length;totals.contextPrimaryAliases+=policy.contextPrimaryAliases.length;totals.outboundCoreReuses+=policy.outboundCoreContextReuses.length;totals.typedExtensions+=policy.typedSituationExtensions.length;
  }
  assert.deepEqual(Object.fromEntries(Object.entries(totals).filter(([k])=>k!=='stepsChecked')),{operations:2906,moves:2532,toReserve:318,keep:56,levelChanges:622,canonical:33654,active:32448,reserve:1206,hiddenAdditional:33,alreadyReserved:7,smallThemes:72,mixedThemes:58,largeThemes:67,newThemes:9,newThemeCards:38,bankReservedAliases:13,contextPrimaryAliases:5,outboundCoreReuses:1,typedExtensions:1});
  return totals;
}
let projectedCache;
function identityProfiles(pack){
  const result=new Map();
  for(const pairId of PAIRS){
    for(const [id,row]of canonicalIndex(pack,pairId))result.set(pairId+'\0canonical\0'+id,row.phrase);
    const bank=pack[PREFIX+'repertoires/'+pairId+'.json'];
    for(const field of ['phrases','receivedModels'])for(const phrase of bank[field]||[])result.set(pairId+'\0'+field+'\0'+phrase.id,phrase);
  }return result;
}
function ensureProjection() {
  if(projectedCache)return projectedCache;
  const actual=actualPack(),audit=assertOwnClassification(actual),program=path.join(ROOT,'tools/maquette-guidee/check_all_classification_independent.py');
  validateEntryAssets();
  assert.equal(sha256(fs.readFileSync(program)),INDEPENDENT_CHECKER_SHA256,'whole independent checker is frozen');
  assert.equal(sha256(fs.readFileSync(path.join(ROOT,PREFIX+'manifest.json'))),MANIFEST_SHA256,'exact frozen composed manifest');
  const result=JSON.parse(execFileSync('python3',['-B',program,'--root',ROOT,'--project-all-runtimes'],{cwd:ROOT,encoding:'utf8',maxBuffer:512*1024*1024}));
  assert.ok(result.documentsByStage&&result.summary);
  const beforeClassification=result.documentsByStage.conventions,beforeConventions=result.documentsByStage.content,documents=result.documentsByStage.historical,fingerprints={};
  assert.ok(beforeClassification&&beforeConventions&&documents,'all three independently checked private inverse views');
  for(const filename of documentPaths()){
    assert.deepEqual(beforeClassification[filename],baseline(filename),'classification inverse restores every whole approved B+C document');
    assert.deepEqual(beforeConventions[filename],contentBaseline(filename),'convention inverse restores every whole approved B document');
    assert.deepEqual(documents[filename],anchor(filename),'historical inverse restores every whole 13f source document');
    fingerprints[filename]=sha256(fs.readFileSync(path.join(ROOT,filename)));
    assert.equal(result.actualRawDocumentSha256[filename],fingerprints[filename],'subprocess validated these actual composed bytes');
  }
  const historicalProfiles=identityProfiles(documents),phraseCandidates=new Map();
  for(const pack of [actual,beforeClassification,beforeConventions,documents])for(const [profile,phrase]of identityProfiles(pack)){
    const before=historicalProfiles.get(profile);if(!before)continue;
    const [pairId,,id]=profile.split('\0'),identity=pairId+'\0'+id;
    if(!phraseCandidates.has(identity))phraseCandidates.set(identity,[]);
    phraseCandidates.get(identity).push([phrase,before]);
  }
  projectedCache={actual,beforeClassification,beforeConventions,documents,summary:{...audit,independent:result.summary},fingerprints,phraseCandidates,canonicalByPair:new Map(PAIRS.map(p=>[p,canonicalIndex(actual,p)]))};return projectedCache;
}
const relativeFilename=f=>(path.isAbsolute(f)?path.relative(ROOT,f):f).split(path.sep).join('/');
function beforeRead(filename,document){filename=relativeFilename(filename);if(!filename.startsWith(PREFIX))return typeof document==='string'||Buffer.isBuffer(document)?JSON.parse(document):document;const s=ensureProjection();assert.ok(Object.hasOwn(s.documents,filename));assert.equal(sha256(fs.readFileSync(path.join(ROOT,filename))),s.fingerprints[filename],'actual file cannot change after validation');if(typeof document==='string'||Buffer.isBuffer(document))assert.equal(sha256(document),s.fingerprints[filename],'input bytes were validated');else assert.deepEqual(document,s.actual[filename],'mutated document cannot be hidden by historical projection');return clone(s.documents[filename]);}
function beforeBytes(filename){filename=relativeFilename(filename);if(!filename.startsWith(PREFIX))return fs.readFileSync(path.join(ROOT,filename));const s=ensureProjection();assert.equal(sha256(fs.readFileSync(path.join(ROOT,filename))),s.fingerprints[filename]);return Buffer.from(anchorBytes(filename));}
function projectPhrase(pairId,phrase){if(!PAIRS.includes(pairId)||!phrase?.id)return phrase;const candidates=ensureProjection().phraseCandidates.get(pairId+'\0'+phrase.id)||[];for(const [current,before]of candidates)if(isDeepStrictEqual(phrase,current))return clone(before);throw Error('Unvalidated composed tuple cannot be hidden: '+pairId+'/'+phrase.id);}
function beforeAssetBytes(filename){
  filename=relativeFilename(filename);
  const actual=fs.readFileSync(path.join(ROOT,filename));
  if(!Object.hasOwn(ENTRY_ASSET_SHA256,filename))return actual;
  ensureProjection();validateEntryAssets();
  if(['melunga_deploy/course-access.js','melunga_deploy/content/course-access.json','melunga_deploy/melunga-logo.svg','melunga_deploy/course-login.css','melunga_deploy/course-login.js'].includes(filename))return actual;
  const before=baselineBytes(filename);
  assert.ok(before.equals(anchorBytes(filename)),'approved B+C did not change original asset '+filename);
  // The mobile picker and scroll body deliberately change HTML/CSS structure.
  // validateEntryAssets has already required the exact entire authorized files;
  // returning a historical view does not accept arbitrary edits or skip the
  // independently audited current tuples, registries, copies or source hashes.
  return before;
}
function inputFiles(){const layers=['docs/niveaux-progressifs/contenu-tranche/registre-contenu-tranche.json','docs/niveaux-progressifs/conventions-tranchees/registre/conventions-tranchees.json'];const evidence=layers.flatMap(file=>{const registry=rawRead(file);return[file,...registry.evidenceFiles.map(p=>p.path)];});return[...Object.keys(ENTRY_ASSET_SHA256).map(f=>path.join(ROOT,f)),...evidence.map(f=>path.join(ROOT,f)),...['uncertain-content.cjs','convention-corrections.cjs'].map(f=>path.join(WEB,'tests',f)),path.join(ROOT,'docs/niveaux-progressifs/contenu-tranche/exceptions-contenu-tranche.json'),__filename,path.join(ROOT,'tools/maquette-guidee/check_all_classification_independent.py'),path.join(ROOT,'tools/maquette-guidee/check_conventions_independent.py'),path.join(ROOT,'tools/maquette-guidee/check_uncertain_content_independent.py'),path.join(ROOT,REVIEW+'/visuels.json'),path.join(ROOT,REVIEW+'/registre/composition-entree.json'),...PAIRS.map(p=>path.join(ROOT,REVIEW+'/registre/'+p+'.json')),...documentPaths().map(f=>path.join(ROOT,f))];}
function auditRuntime(){return ensureProjection().summary;}
module.exports={loadLedger,baseline,baselineBytes,anchor,anchorBytes,contentBaseline,contentBytes,rawRead,actualPack,canonicalIndex,expectedPhrase,assertOwnClassification,ensureProjection,beforeRead,beforeBytes,beforeAssetBytes,projectPhrase,inputFiles,auditRuntime,validateEntryAssets};

if(require.main===module){
  const {test,before,after}=require('node:test'),http=require('node:http'),{chromium}=require('playwright-core');
  let server,browser,base,snapshots;
  const report={status:'running',scope:'local seven-pair classified runtime and emulated Chromium',publicSiteChecked:false,physicalDeviceChecked:false,nativeOrPedagogicalValidation:false,speechMechanism:'mock speechSynthesis; unchanged whole source text only',checks:[],cases:[],errors:[],externalRequests:[],apiRequests:[],simulatedAccessChecks:[],negativeCasesRejected:0};
  const required=['all-2906-decisions-33654-whole-tuples','classification-tamper-rejection','all-seventy-cells-load','new-nine-photos-thirty-eight-cards','preserved-core-aliases-and-typed-tail','reserved-bank-aliases-and-heard-role','saved-review-moves-hidden-and-reserve','saved-review-migration-race','runtime-policy-and-body-integrity','finite-policy-scope-and-small-themes','cards-fit-mobile-and-desktop','content-and-convention-composition-whole-objects','composed-overlap-current-dom'];
  const fingerprint=()=>Object.fromEntries([...new Set([...inputFiles(),...['maquette-guidee.js','maquette-guidee.css','parcours-niveaux.html','maquette-guidee.html','app.html'].map(f=>path.join(WEB,f))])].sort().map(f=>[path.relative(ROOT,f),sha256(fs.readFileSync(f))]));
  before(async()=>{
    snapshots=fingerprint();report.inputSha256=snapshots;report.classification=auditRuntime();
    server=http.createServer((req,res)=>{const f=path.resolve(WEB,'.'+new URL(req.url,'http://local').pathname);if(!f.startsWith(WEB+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile())return res.writeHead(404).end();res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml'})[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(res);});
    await new Promise(r=>server.listen(0,'127.0.0.1',r));base='http://127.0.0.1:'+server.address().port;
    browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
  });
  after(async()=>{await browser?.close();if(server)await new Promise(r=>server.close(r));report.inputSha256Stable=isDeepStrictEqual(fingerprint(),snapshots);report.missingChecks=required.filter(c=>!report.checks.includes(c));report.executedAt=new Date().toISOString();report.status=report.inputSha256Stable&&!report.missingChecks.length&&!report.errors.length&&!report.externalRequests.length&&!report.apiRequests.length?'passed':'failed';if(process.env.ALL_CLASSIFICATION_REPORT)fs.writeFileSync(process.env.ALL_CLASSIFICATION_REPORT,JSON.stringify(report,null,2)+'\n');assert.equal(report.inputSha256Stable,true);assert.deepEqual(report.errors,[]);assert.deepEqual(report.externalRequests,[]);assert.deepEqual(report.apiRequests,[]);assert.deepEqual(report.missingChecks,[]);});
  async function pageFixture(viewport={width:390,height:844},options={}){
    const context=await browser.newContext({viewport,isMobile:viewport.width<=760,hasTouch:viewport.width<=760,reducedMotion:'reduce'});
    await context.addInitScript(entries=>{window.__classificationSpeech=[];window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},getVoices(){return[];},addEventListener(){},speak(u){window.__classificationSpeech.push({text:u.text,lang:u.lang});u.onend?.();}}});if(entries)localStorage.setItem('melunga-guided-review-v1',JSON.stringify({version:1,entries}));},options.savedEntries||null);
    await context.route('**/*',async route=>{const url=new URL(route.request().url());if(url.origin!==base){report.externalRequests.push(url.origin+url.pathname);return route.abort();}if(url.pathname==='/.netlify/functions/check-status'&&route.request().method()==='GET'){report.simulatedAccessChecks.push({path:url.pathname,method:'GET',paid:true});return route.fulfill({json:{paid:true}});}if(/\/(?:\.netlify|api)\//.test(url.pathname)){report.apiRequests.push(url.pathname);return route.abort();}if(options.intercept&&await options.intercept(route,url))return;await route.continue();});
    const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));return{context,page};
  }
  async function ready(page,pairId,level){await page.waitForFunction(({pairId,level})=>{const s=window.MelungaMockup?.state();return s?.screen==='themes'&&s.pairId===pairId&&s.level===level;},{pairId,level});}
  async function visit(page,level,pairId='fr-en'){await page.goto(base+'/parcours-niveaux.html?pair='+pairId+'&level='+level);await ready(page,pairId,level);}
  function policyFor(pairId){return ensureProjection().actual[PREFIX+'manifest.json'].allClassification.pairs.find(p=>p.pair===pairId);}
  function locate(pairId,id,options={}){
    const pack=ensureProjection().actual,index=canonicalIndex(pack,pairId);
    for(let level=1;level<=10;level++)for(const[themeIndex,theme]of pack[PREFIX+pairId+'/L'+level+'.json'].themes.entries()){
      if(options.themeId&&theme.id!==options.themeId||options.level&&level!==options.level)continue;
      const steps=theme.sequences.flatMap(s=>s.steps),stepIndex=steps.findIndex(s=>s.utterance===id&&s.kind===(options.received?'receive':'understand'));
      if(stepIndex>=0){const phrase=options.received?pack[PREFIX+'repertoires/'+pairId+'.json'].receivedModels.find(p=>p.id===id):index.get(id)?.phrase;assert.ok(phrase);return{pairId,id,level,themeIndex,theme,steps,stepIndex,phrase};}
    }throw Error('No active fixture '+pairId+'/'+id+'/'+(options.themeId||''));
  }
  async function enter(page,target){await visit(page,target.level,target.pairId);await page.locator('#mgThemeGrid > button').nth(target.themeIndex).click();await page.evaluate(count=>{for(let n=0;n<count;n++){document.querySelector('#mgChoices:not([hidden]) button')?.click();const next=document.getElementById('mgContinue');if(next.disabled)throw Error('Prepared actual lesson blocked while advancing');next.click();}},target.stepIndex);assert.equal(await page.evaluate(()=>window.MelungaMockup.state().phraseId),target.id);}
  async function checkDom(page,target){for(const[selector,field]of [['#mgPhrase','study'],['#mgPhon','phon'],['#mgTranslation','native'],['#mgReading','reading']])assert.equal(await page.locator(selector).textContent(),target.phrase[field]||'','unchanged whole '+field);await page.click('#mgEar');const spoken=await page.evaluate(()=>window.__classificationSpeech.at(-1));assert.equal(spoken.text,target.phrase.study);assert.equal(spoken.lang.split('-')[0],target.pairId.split('-')[1]);}
  async function savedPanel(page){if(await page.locator('#mgDesktopNav').isVisible())await page.locator('#mgDesktopNav [data-menu-item="À revoir"]').click();else{await page.click('#mgMenuTrigger');await page.locator('#mgMenuNav [data-menu-item="À revoir"]').click();}assert.equal(await page.locator('#mgSavedReviewPanel').isVisible(),true);}
  const cachedEntry=(pairId,op)=>({id:op.id,pairId,level:op.fromLevel,themeId:op.fromTheme,study:'STALE CACHE STUDY',native:'STALE CACHE MEANING',addedAt:100});
  const savedEntries=page=>page.evaluate(()=>JSON.parse(localStorage.getItem('melunga-guided-review-v1')).entries);
  const resumeButton=(page,id)=>page.locator('[data-review-id="'+id+'"]').locator('[data-review-action="resume"]');

  test('all 2906 decisions preserve all 33654 complete canonical tuples and exact routes',()=>{
    const a=auditRuntime();assert.equal(a.operations,2906);assert.equal(a.canonical,33654);assert.equal(a.active,32448);assert.equal(a.reserve,1206);
    assert.ok(beforeAssetBytes(path.join(WEB,'app.html')).equals(baselineBytes('melunga_deploy/app.html')),'authorized entry shell restores the exact verified historic classic source');assert.ok(beforeAssetBytes(path.join(WEB,'maquette-guidee.css')).equals(baselineBytes('melunga_deploy/maquette-guidee.css')),'authorized mobile layout restores the exact verified historic source after whole-file pin validation');
    for(const f of ['maquette-guidee.js','parcours-niveaux.html','maquette-guidee.html'])beforeAssetBytes(path.join(WEB,f));
    report.checks.push('all-2906-decisions-33654-whole-tuples');
  });
  test('whole source, routing, hide precedence, reserve and historical projection mutations are rejected',()=>{
    const actual=ensureProjection().actual,firstMove=loadLedger('fr-en').ledger.ops.find(o=>o.op==='move'),reserved=loadLedger('fr-ja').ledger.ops.find(o=>o.op==='to-reserve');
    const card=(p,pair,id)=>canonicalIndex(p,pair).get(id).phrase;
    const faults=[
      p=>{card(p,'fr-en',firstMove.id).phon+=' WRONG';},p=>{card(p,'fr-en',firstMove.id).study+=' WRONG';},p=>{card(p,'fr-en',firstMove.id).native+=' WRONG';},
      p=>{card(p,'fr-en',firstMove.id).reading='invented';},p=>{card(p,'fr-en',firstMove.id).contentType='number';},p=>{card(p,'fr-en',firstMove.id).source.sourceLevel=10;},
      p=>{card(p,'fr-en',firstMove.id).editorialLevel=10;},p=>{card(p,'fr-en',firstMove.id).classification.registrySha256='0'.repeat(64);},
      p=>{card(p,'fr-en',firstMove.id).placement.themeId='unapproved';},p=>{card(p,'fr-en',firstMove.id).unexpected='not reviewed';},
      p=>{p[PREFIX+'fr-ja/L'+reserved.fromLevel+'.json'].themes[0].phrases.push(clone(card(p,'fr-ja',reserved.id)));},
      p=>{const x=policyFor('fr-en').hiddenThemeSupersededOperations[0];card(p,'fr-en',x.id).classification.supersededOperation='keep';},
      p=>{p[PREFIX+'manifest.json'].allClassification.pairs[0].smallThemeExceptions[0].minimum=0;},
      p=>{p[PREFIX+'manifest.json'].allClassification.pairs[1].contextPrimaryAliases=[];},
      p=>{const x=policyFor('fr-it').typedSituationExtensions[0];card(p,'fr-it',x.id).contentType='utterance';},
      p=>{const cell=p[PREFIX+'fr-es/L1.json'];cell.themes[0].sequences[0].steps.find(s=>s.kind==='choose-and-recall').preparedInSteps.understoodInStep='missing';}
    ];
    for(const fault of faults){const bad=clone(actual);fault(bad);assert.throws(()=>assertOwnClassification(bad));report.negativeCasesRejected++;}
    const bad=clone(actual[PREFIX+'fr-ko/L1.json']);bad.themes[0].phrases[0].phon+=' changed';assert.throws(()=>beforeRead(PREFIX+'fr-ko/L1.json',bad));
    const phrase=clone(canonicalIndex(actual,'fr-ko').values().next().value.phrase);phrase.phon+=' changed';assert.throws(()=>projectPhrase('fr-ko',phrase));report.negativeCasesRejected+=2;
    report.checks.push('classification-tamper-rejection');
  });
  function compositionCases(){
    const state=ensureProjection(),content=require('./uncertain-content.cjs').loadLedger().entries,conventions=require('./convention-corrections.cjs').loadLedger().entries,rows=[];
    for(const pairId of PAIRS)for(const op of loadLedger(pairId).ledger.ops){const identity=pairId+'\0'+op.id,b=content.get(identity),c=conventions.get(identity);if(b||c){const row=state.canonicalByPair.get(pairId).get(op.id);assert.ok(row);rows.push({pairId,id:op.id,op,b,c,current:row.phrase,route:row});}}
    return{rows,content,conventions};
  }
  test('75 content overlaps and 211 convention overlaps retain complete corrected objects through classification',()=>{
    const {rows}=compositionCases(),b=rows.filter(r=>r.b),c=rows.filter(r=>r.c),triples=rows.filter(r=>r.b&&r.c);
    assert.equal(b.length,75);assert.equal(c.length,211);assert.equal(triples.length,6);
    let changedStudies=0;
    for(const row of rows){
      const source=loadLedger(row.pairId).originalById.get(row.id).phrase;
      for(const f of ['study','native','phon','reading','source','phoneticReviewStatus','uncertainContentCorrection','conventionCorrection'])assert.deepEqual(row.current[f],source[f],'the corrected whole current input field survives the approved route '+row.pairId+'/'+row.id+'/'+f);
      if(row.b){for(const[field,event]of Object.entries(row.b.fields))assert.equal(row.current[field],field==='phon'&&row.c?row.c.afterPhon:event.after,'content literal survives, followed only by its declared convention literal');
        if(row.current.study!==at(anchor(row.op.expectedBefore.path),row.op.expectedBefore.location).study)changedStudies++;
      }
      if(row.c)assert.equal(row.current.phon,row.c.afterPhon,'the final frozen whole convention aid survives the move');
    }
    assert.equal(changedStudies,23);
    const actual=ensureProjection().actual,changedB=b.find(r=>r.current.study!==at(anchor(r.op.expectedBefore.path),r.op.expectedBefore.location).study),changedC=c.find(r=>r.current.phon!==at(anchor(r.op.expectedBefore.path),r.op.expectedBefore.location).phon);
    assert.ok(changedB&&changedC);
    const mutations=[
      [changedB,p=>{p.study=at(anchor(changedB.op.expectedBefore.path),changedB.op.expectedBefore.location).study;}],
      [changedC,p=>{p.phon=at(anchor(changedC.op.expectedBefore.path),changedC.op.expectedBefore.location).phon;}],
      [triples[0],p=>{delete p.uncertainContentCorrection;}],
      [triples[0],p=>{delete p.conventionCorrection;}]
    ];
    for(const[row,mutate]of mutations){const bad=clone(actual);mutate(canonicalIndex(bad,row.pairId).get(row.id).phrase);assert.throws(()=>assertOwnClassification(bad),'an old aid/study or missing prior correction cannot be hidden behind valid routing');report.negativeCasesRejected++;}
    const errata=['catalogue:ko:3090','catalogue:ko:4275','catalogue:ko:3870','catalogue:ko:1433','catalogue:ko:4193'];
    const expected=['kkon-nip','al-lyak',...Array(3).fill('ha-ma-to-myon keun-nil nal ppon-hè-sso-yo')];
    report.composition={approvedInputCommit:INPUT,sourceContentOverlaps:b.length,sourceConventionOverlaps:c.length,tripleOverlaps:triples.length,changedStudies,errata:errata.map((id,index)=>{const row=ensureProjection().canonicalByPair.get('fr-ko').get(id);assert.equal(row.phrase.phon,expected[index]);return{id,level:row.level,themeId:row.themeId,reserved:row.reserved};})};
    report.checks.push('content-and-convention-composition-whole-objects');
  });
  test('corrected moved studies and aids remain visible, audible and complete at both viewport sizes',{timeout:600000},async()=>{
    const {rows,content,conventions}=compositionCases(),state=ensureProjection(),selected=new Map(),reserved=[];
    function add(pairId,id){const row=state.canonicalByPair.get(pairId)?.get(id);if(!row)return;if(row.reserved){reserved.push({pairId,id,level:row.level,phon:row.phrase.phon});return;}const target=locate(pairId,id,{level:row.level,themeId:row.themeId});selected.set(pairId+'\0'+id,target);}
    for(const row of rows.filter(r=>r.b&&r.c))add(row.pairId,row.id);
    for(const pairId of PAIRS){const changed=rows.find(r=>r.pairId===pairId&&r.b&&r.current.study!==at(anchor(r.op.expectedBefore.path),r.op.expectedBefore.location).study&&!r.route.reserved),any=rows.find(r=>r.pairId===pairId&&r.b&&!r.route.reserved);if(changed)add(pairId,changed.id);if(any)add(pairId,any.id);}
    for(const pairId of ['fr-es','fr-ko']){const entry=[...conventions.values()].find(e=>e.pairId===pairId&&!state.canonicalByPair.get(pairId).get(e.id)?.reserved&&state.canonicalByPair.get(pairId).has(e.id));assert.ok(entry);add(pairId,entry.id);}
    for(const id of ['catalogue:ko:3090','catalogue:ko:4275','catalogue:ko:3870','catalogue:ko:1433','catalogue:ko:4193'])add('fr-ko',id);
    const targets=[...selected.values()];assert.ok(targets.length>=10,'representative whole overlaps remain active');
    const {context,page}=await pageFixture();try{
      for(const viewport of [{width:320,height:640},{width:1280,height:720}])for(const target of targets){
        await page.setViewportSize(viewport);await enter(page,target);await checkDom(page,target);
        await page.evaluate(async()=>{await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});
        const fit=await page.evaluate(()=>{const rect=n=>{const r=n.getBoundingClientRect();return{top:r.top,bottom:r.bottom,left:r.left,right:r.right};},visible=n=>n&&!n.hidden&&getComputedStyle(n).display!=='none'&&n.getBoundingClientRect().width>0;return{card:rect(document.getElementById('mgLessonView')),texts:['mgPhrase','mgPhon','mgTranslation','mgReading'].map(id=>document.getElementById(id)).filter(visible).map(n=>{const range=document.createRange();range.selectNodeContents(n);return{id:n.id,rect:rect(range)};}),scroll:[document.scrollingElement,...['mgContent','mgLessonView','mgModel'].map(id=>document.getElementById(id))].map(n=>({id:n.id||n.tagName,vertical:n.scrollHeight-n.clientHeight,horizontal:n.scrollWidth-n.clientWidth})),controls:['mgEar','mgReplay','mgContinue'].every(id=>visible(document.getElementById(id)))};});
        for(const n of fit.scroll){assert.ok(n.vertical<=2,n.id+' complete composed card without vertical scrolling');assert.ok(n.horizontal<=2,n.id+' complete composed card without horizontal scrolling');}
        for(const n of fit.texts){assert.ok(n.rect.top>=fit.card.top-2&&n.rect.bottom<=fit.card.bottom+2,n.id+' whole text vertically visible');assert.ok(n.rect.left>=fit.card.left-2&&n.rect.right<=fit.card.right+2,n.id+' whole text laterally visible');}
        for(let i=0;i<fit.texts.length;i++)for(let j=i+1;j<fit.texts.length;j++){const a=fit.texts[i].rect,b=fit.texts[j].rect;assert.ok(Math.min(a.right,b.right)-Math.max(a.left,b.left)<=1||Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)<=1,'corrected whole text fields do not overlap');}assert.ok(fit.controls);
        report.cases.push({check:'composed-current-card',pairId:target.pairId,id:target.id,level:target.level,themeId:target.theme.id,viewport,fit});
      }
      report.compositionDom={models:targets.length,reservedNotProduced:reserved};report.checks.push('composed-overlap-current-dom');
    }finally{await context.close();}
  });
  test('all seven pairs and seventy exact cells pass browser guards',async()=>{const{context,page}=await pageFixture();try{for(const pairId of PAIRS)for(let level=1;level<=10;level++){await visit(page,level,pairId);const expected=ensureProjection().actual[PREFIX+pairId+'/L'+level+'.json'];assert.equal(await page.locator('#mgThemeGrid > button').count(),expected.themes.length);report.cases.push({check:'cell-load',pairId,level});}report.checks.push('all-seventy-cells-load');}finally{await context.close();}});
  test('nine reviewed new theme assignments show eight distinct photo crops and all 38 cards enter in one click',async()=>{
    const visual=rawRead(REVIEW+'/visuels.json'),{context,page}=await pageFixture();try{const positions=new Set();let cards=0;
      for(const pairId of PAIRS)for(const t of policyFor(pairId).newThemes){await visit(page,t.level,pairId);const cell=ensureProjection().actual[PREFIX+pairId+'/L'+t.level+'.json'],index=cell.themes.findIndex(x=>x.id===t.id),theme=cell.themes[index],tile=page.locator('#mgThemeGrid > button').nth(index);
        assert.equal(await tile.locator('.mg-theme-title').textContent(),t.title);const image=tile.locator('img');await image.evaluate(i=>i.decode());assert.ok(await image.evaluate(i=>i.naturalWidth>0));assert.ok((await image.getAttribute('src')).endsWith(theme.photo.asset));positions.add(theme.photo.asset+':'+theme.photo.column+':'+theme.photo.row);
        const spec=visual.themes.find(x=>x.pair===pairId&&x.themeId===t.id);assert.ok(spec);assert.deepEqual(theme.photo,spec.photo);assert.equal(sha256(fs.readFileSync(path.join(WEB,theme.photo.asset))),spec.assetSha256);
        for(const phrase of theme.phrases){const target=locate(pairId,phrase.id,{themeId:t.id});await enter(page,target);assert.equal(await page.locator('#mgSequenceView').isVisible(),false);await checkDom(page,target);cards++;report.cases.push({check:'new-theme-card',pairId,id:phrase.id,themeId:t.id});}
      }assert.equal(cards,38);assert.equal(positions.size,8);report.checks.push('new-nine-photos-thirty-eight-cards');
    }finally{await context.close();}
  });
  test('five context-to-primary aliases, one outbound core reuse and the Italian typed tail remain learnable exactly once',async()=>{
    const{context,page}=await pageFixture();try{
      let aliases=0,outbound=0;
      for(const pairId of PAIRS){const policy=policyFor(pairId);
        for(const a of policy.contextPrimaryAliases){const target=locate(pairId,a.id,{themeId:a.themeId});assert.ok(target.theme.phrases.some(p=>p.id===a.id));assert.ok(target.theme.contextReferences.some(r=>r.id===a.id&&r.intentId===a.intentId));assert.equal(target.theme.sequences.flatMap(s=>s.phraseIds).filter(id=>id===a.id).length,1);await enter(page,target);await checkDom(page,target);aliases++;}
        for(const a of policy.outboundCoreContextReuses){const target=locate(pairId,a.id,{themeId:a.themeId});assert.ok(!target.theme.phrases.some(p=>p.id===a.id));assert.ok(target.phrase.editorialLevel<=target.level);await enter(page,target);await checkDom(page,target);outbound++;}
      }
      const typed=policyFor('fr-it').typedSituationExtensions[0],target=locate('fr-it',typed.id,{themeId:typed.themeId});assert.equal(target.phrase.contentType,'vocabulary');assert.equal(target.steps[target.stepIndex].contentType,'vocabulary');assert.ok(target.stepIndex>=baseline(PREFIX+'fr-it/L'+target.level+'.json').themes.find(t=>t.id===typed.themeId).sequences.flatMap(s=>s.steps).length);await enter(page,target);await checkDom(page,target);assert.equal(await page.locator('#mgPhrase').isVisible(),true);assert.equal(await page.locator('#mgReplay').isEnabled(),true);
      assert.equal(aliases,5);assert.equal(outbound,1);report.checks.push('preserved-core-aliases-and-typed-tail');
    }finally{await context.close();}
  });
  test('thirteen reserved bank aliases stay bound to reserve while heard-only role models remain listenable',async()=>{
    const{context,page}=await pageFixture();try{let aliases=0;for(const pairId of PAIRS){const policy=policyFor(pairId),pack=ensureProjection().actual,entries=canonicalIndex(pack,pairId),bank=pack[PREFIX+'repertoires/'+pairId+'.json'];
      for(const id of policy.bankReservedReferenceIds){const phrase=bank.phrases.find(p=>p.id===id),entry=entries.get(id);assert.ok(entry.reserved);assert.equal(phrase.referenceOnly,true);assert.deepEqual(phrase.canonicalReserveLocation,{pairId,level:entry.level,themeId:null});assert.equal(phrase.canonicalLocation,undefined);aliases++;}
      const reservedHeard=bank.receivedModels.find(p=>p.canonicalReserveLocation);if(reservedHeard){const target=locate(pairId,reservedHeard.id,{received:true});await enter(page,target);await checkDom(page,target);assert.equal(await page.locator('#mgReplay').isDisabled(),true);assert.equal(target.steps[target.stepIndex].requiresProduction,false);assert.equal(target.steps[target.stepIndex].countsForProgress,false);report.cases.push({check:'heard-reserved-model',pairId,id:target.id});}
    }assert.equal(aliases,13);report.checks.push('reserved-bank-aliases-and-heard-role');}finally{await context.close();}
  });
  test('stale saved cards migrate by validated ID across pairs and levels; all effective reserves keep their old cache unchanged',async()=>{
    const moves=PAIRS.map(pairId=>({pairId,op:loadLedger(pairId).ledger.ops.find(o=>o.op==='move'&&o.fromLevel!==o.toLevel&&!policyFor(pairId).hiddenThemeReserveIds.includes(o.id))}));
    for(const{pairId,op}of moves){const entry=cachedEntry(pairId,op),{context,page}=await pageFixture(undefined,{savedEntries:[entry]});try{await visit(page,op.fromLevel,pairId);await savedPanel(page);await resumeButton(page,op.id).click();await page.waitForFunction(id=>window.MelungaMockup.state().screen==='lesson'&&window.MelungaMockup.state().phraseId===id,op.id);const target=locate(pairId,op.id,{themeId:op.toTheme});await checkDom(page,target);const cached=(await savedEntries(page))[0];assert.equal(cached.level,op.toLevel);assert.equal(cached.themeId,op.toTheme);assert.equal(cached.study,target.phrase.study);assert.equal(cached.native,target.phrase.native);assert.equal(cached.addedAt,entry.addedAt);}finally{await context.close();}}
    const reserves=[];for(const pairId of PAIRS){const p=policyFor(pairId),a=loadLedger(pairId);reserves.push({pairId,op:a.ledger.ops.find(o=>o.op==='to-reserve')});for(const h of p.hiddenThemeSupersededOperations)reserves.push({pairId,op:a.ops.get(h.id)});if(p.reserveLevelChanges.length)reserves.push({pairId,op:a.ops.get(p.reserveLevelChanges[0].id)});const hidden=p.hiddenThemeReserveIds.find(id=>!a.ops.has(id));if(hidden){const old=a.originalById.get(hidden);reserves.push({pairId,op:{id:hidden,fromLevel:old.level,fromTheme:old.themeId}});}}
    for(const{pairId,op}of reserves){const entry=cachedEntry(pairId,op),{context,page}=await pageFixture(undefined,{savedEntries:[entry]});try{await visit(page,op.fromLevel,pairId);await savedPanel(page);await resumeButton(page,op.id).click();await page.waitForFunction(()=>window.MelungaMockup.state().screen==='themes');assert.notEqual(await page.evaluate(()=>window.MelungaMockup.state().phraseId),op.id);assert.deepEqual((await savedEntries(page))[0],entry,'reserved/superseded saved entry is retained byte-for-byte including addedAt');report.cases.push({check:'reserved-cache-retained',pairId,id:op.id,operation:op.op||'hide-theme'});}finally{await context.close();}}
    report.checks.push('saved-review-moves-hidden-and-reserve');
  });
  test('delayed saved-review responses cannot overwrite a later pair selection or prematurely migrate storage',async()=>{
    for(const pairId of ['fr-es','fr-ko']){const op=loadLedger(pairId).ledger.ops.find(o=>o.op==='move'&&o.fromLevel!==o.toLevel&&!policyFor(pairId).hiddenThemeReserveIds.includes(o.id)),entry=cachedEntry(pairId,op),cellPath='/content/niveaux-progressifs/'+pairId+'/L'+op.toLevel+'.json';let release,requestedResolve,block=false;const requested=new Promise(r=>{requestedResolve=r;});
      const fixture=await pageFixture(undefined,{savedEntries:[entry],intercept:async(route,url)=>{if(block&&url.pathname===cellPath&&!release){await new Promise(r=>{release=async()=>{try{await route.fulfill({contentType:'application/json',body:fs.readFileSync(path.join(WEB,'.'+cellPath))});}catch(_){}r();};requestedResolve();});return true;}return false;}});
      try{const{page}=fixture;await visit(page,op.fromLevel,pairId);await savedPanel(page);block=true;await resumeButton(page,op.id).click();await requested;assert.deepEqual((await savedEntries(page))[0],entry);const nextPair=pairId==='fr-es'?'fr-ko':'zh-fr';await page.selectOption('#mgLanguage',nextPair);await page.waitForFunction(p=>window.MelungaMockup.state().screen==='themes'&&window.MelungaMockup.state().pairId===p,nextPair);await release();await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));assert.equal(await page.evaluate(()=>window.MelungaMockup.state().pairId),nextPair);assert.deepEqual((await savedEntries(page))[0],entry);}finally{if(release)await release();await fixture.context.close();}
    }report.checks.push('saved-review-migration-race');
  });
  test('full finite policy and every pair cell/bank raw body are pinned before use; retry restores genuine bytes',async()=>{
    for(const {kind,pairId} of [{kind:'descriptor',pairId:'fr-ja'},{kind:'descriptor-small-zero',pairId:'fr-ja'},{kind:'descriptor-small-crosspair',pairId:'fr-ja'},{kind:'descriptor-small-unknown-theme',pairId:'fr-ja'},{kind:'small-empty',pairId:'fr-ja'},...PAIRS.flatMap(pairId=>[{kind:'cell',pairId},{kind:'bank',pairId}])]){let corrupted=true;const level=2;
      const fixture=await pageFixture(undefined,{intercept:async(route,url)=>{
        if(corrupted&&kind.startsWith('descriptor')&&url.pathname.endsWith('/manifest.json')){const m=clone(ensureProjection().actual[PREFIX+'manifest.json']),p=m.allClassification.pairs.find(p=>p.pair==='fr-ja');if(kind==='descriptor-small-zero')p.smallThemeExceptions[0].minimum=0;else if(kind==='descriptor-small-crosspair')m.allClassification.pairs.find(p=>p.pair==='fr-en').smallThemeExceptions.push(p.smallThemeExceptions.pop());else if(kind==='descriptor-small-unknown-theme')p.smallThemeExceptions[0].id='not-a-reviewed-small-theme';else p.operations[0].toTheme='unapproved';await route.fulfill({contentType:'application/json',body:JSON.stringify(m)});return true;}
        const filename=kind==='cell'||kind==='small-empty'?PREFIX+pairId+'/L'+level+'.json':PREFIX+'repertoires/'+pairId+'.json';
        if(corrupted&&!kind.startsWith('descriptor')&&url.pathname==='/'+filename.slice('melunga_deploy/'.length)){const d=clone(ensureProjection().actual[filename]);if(kind==='small-empty'){const t=d.themes.find(t=>t.id==='L2-prevenir');t.phrases=[];t.sequences=[];t.newCount=0;t.presentedCount=0;t.pedagogicalConceptCount=0;}else(kind==='cell'?d.themes[0].phrases[0]:d.phrases[0]).phon+=' WRONG';await route.fulfill({contentType:'application/json',body:JSON.stringify(d)});return true;}return false;
      }});
      try{await fixture.page.goto(base+'/parcours-niveaux.html?pair='+pairId+'&level='+level);await fixture.page.locator('#mgRetry').waitFor({state:'visible'});assert.equal(await fixture.page.evaluate(()=>window.MelungaMockup.state().screen),'loading');corrupted=false;await fixture.page.click('#mgRetry');await ready(fixture.page,pairId,level);report.negativeCasesRejected++;}finally{await fixture.context.close();}
    }report.checks.push('runtime-policy-and-body-integrity');
  });
  test('small density exceptions remain finite, exact and pair-scoped, including the approved two-card theme',async()=>{
    const{context,page}=await pageFixture();try{const seen=new Set();for(const pairId of PAIRS){const p=policyFor(pairId);for(const item of p.smallThemeExceptions){assert.ok(item.minimum>=1&&item.minimum<=5);assert.ok(!seen.has(pairId+':'+item.level+':'+item.id));seen.add(pairId+':'+item.level+':'+item.id);}const item=p.smallThemeExceptions.reduce((a,b)=>b.minimum<a.minimum?b:a),cell=ensureProjection().actual[PREFIX+pairId+'/L'+item.level+'.json'],theme=cell.themes.find(t=>t.id===item.id);assert.equal(theme.presentedCount,item.presentedCount);assert.equal(theme.pedagogicalConceptCount,item.pedagogicalConceptCount);await visit(page,item.level,pairId);const index=cell.themes.indexOf(theme);await page.locator('#mgThemeGrid > button').nth(index).click();assert.equal(await page.evaluate(()=>window.MelungaMockup.state().screen),'lesson');assert.equal(await page.locator('#mgPhrase').textContent()!=='',true);report.cases.push({check:'small-exact-theme',pairId,themeId:item.id,minimum:item.minimum});}assert.equal(seen.size,72);report.checks.push('finite-policy-scope-and-small-themes');}finally{await context.close();}
  });
  test('all new cards and the Italian word tail fit 320 and 1280 viewports without scrolling, overlap or clipping',async()=>{
    const{context,page}=await pageFixture();try{const targets=[];for(const pairId of PAIRS)for(const t of policyFor(pairId).newThemes){const theme=ensureProjection().actual[PREFIX+pairId+'/L'+t.level+'.json'].themes.find(x=>x.id===t.id);for(const phrase of theme.phrases)targets.push(locate(pairId,phrase.id,{themeId:t.id}));}const typed=policyFor('fr-it').typedSituationExtensions[0];targets.push(locate('fr-it',typed.id,{themeId:typed.themeId}));
      for(const viewport of [{width:320,height:640},{width:1280,height:720}])for(const target of targets){await page.setViewportSize(viewport);await enter(page,target);await page.evaluate(async()=>{await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});const m=await page.evaluate(()=>{const rect=n=>{const r=n.getBoundingClientRect();return{top:r.top,bottom:r.bottom,left:r.left,right:r.right};},visible=n=>n&&!n.hidden&&getComputedStyle(n).display!=='none'&&n.getBoundingClientRect().width>0;return{card:rect(document.getElementById('mgLessonView')),texts:['mgPhrase','mgPhon','mgTranslation','mgReading'].map(id=>document.getElementById(id)).filter(visible).map(n=>{const r=document.createRange();r.selectNodeContents(n);return{id:n.id,text:rect(r)};}),scroll:[document.scrollingElement,...['mgContent','mgLessonView','mgModel'].map(id=>document.getElementById(id))].map(n=>({id:n.id||n.tagName,vertical:n.scrollHeight-n.clientHeight,horizontal:n.scrollWidth-n.clientWidth})),controls:['mgEar','mgReplay','mgContinue'].every(id=>visible(document.getElementById(id)))};});for(const n of m.scroll){assert.ok(n.vertical<=2,n.id+' no vertical scroll');assert.ok(n.horizontal<=2,n.id+' no horizontal scroll');}for(const n of m.texts){assert.ok(n.text.top>=m.card.top-2&&n.text.bottom<=m.card.bottom+2,n.id+' fits vertically');assert.ok(n.text.left>=m.card.left-2&&n.text.right<=m.card.right+2,n.id+' fits horizontally');}for(let a=0;a<m.texts.length;a++)for(let b=a+1;b<m.texts.length;b++){const x=m.texts[a].text,y=m.texts[b].text;assert.ok(Math.min(x.right,y.right)-Math.max(x.left,y.left)<=1||Math.min(x.bottom,y.bottom)-Math.max(x.top,y.top)<=1,'text fields do not overlap');}assert.ok(m.controls);report.cases.push({check:'complete-card',pairId:target.pairId,id:target.id,viewport,measure:m});}report.checks.push('cards-fit-mobile-and-desktop');
    }finally{await context.close();}
  });
}
