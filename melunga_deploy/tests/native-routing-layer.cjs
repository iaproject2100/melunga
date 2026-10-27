/* Finite A+B layer: validate actual native-routing and server-audio bytes, then expose ef147de to
 * older source assertions. Runtime JSON, historical pins and access tests are
 * never replaced. No environment switch or general projection exemption. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const chirpLayer=require('./chirp-preview-layer.cjs');
const ROOT=path.resolve(__dirname,'../..');
const BASE='ef147deacf85b4a5631c1b05ff8050de7918ea1f';
const FIXTURE='melunga_deploy/tests/fixtures/native-routing-layer.json';
const AUDIO_BASE='d110366';
const AUDIO_MODULE='melunga_deploy/lesson-audio.js';
const AUDIO_MODULE_SHA256='5eda5fbd765f197b1c6a758e6a7d1b0dd88203f662a369bc667465048ce70e0d';
const FIXTURE_SHA256='1bb6ce85a7bf2f931c7a3a81fe3bdeec0f53c6b222cecb4219f313736653268f';
const ALLOWED=Object.freeze(['app.html','course-access.js','course-login.js','desktop-home.js','entry-bridge.js',
  'index.html','maquette-guidee.html','maquette-guidee.js','parcours-niveaux.html'].map(file=>'melunga_deploy/'+file));
const sha=raw=>crypto.createHash('sha256').update(raw).digest('hex');
let fixtureCache=null,validationCache=null;
function relative(filename){
 const value=path.relative(ROOT,path.resolve(ROOT,filename));
 assert.ok(value&&!value.startsWith('..'+path.sep)&&value!=='..'&&!path.isAbsolute(value),'source stays inside repository');
 return value.split(path.sep).join('/');
}
function read(filename){return fs.readFileSync(path.join(ROOT,filename));}
function fixture(){
 const raw=read(FIXTURE);assert.equal(sha(raw),FIXTURE_SHA256,'exact frozen native A+B fixture');
 if(!fixtureCache)fixtureCache=JSON.parse(raw);
 const f=fixtureCache;
 assert.equal(f.version,1);assert.equal(f.id,'native-routing-A+B-exact-layer');assert.equal(f.baseCommit,BASE);
 assert.deepEqual(Object.keys(f.modifiedFiles).sort(),[...ALLOWED].sort(),'only nine explicit composed A+B product sources may be projected');
 assert.equal(f.patchPath,'melunga_deploy/tests/fixtures/native-routing-layer.patch');
 assert.equal(f.audioBaseCommit,AUDIO_BASE);
 assert.equal(f.audioEvidencePath,'docs/audio-server/runtime-layer.patch');
 assert.equal(f.newFiles[AUDIO_MODULE],AUDIO_MODULE_SHA256);
 return f;
}
function stamp(filename){const s=fs.statSync(path.join(ROOT,filename),{bigint:true});return[s.dev,s.ino,s.mode,s.size,s.mtimeNs,s.ctimeNs].join(':');}
function inputFiles(){const f=fixture();return[__filename,path.join(ROOT,FIXTURE),path.join(ROOT,f.patchPath),path.join(ROOT,f.audioEvidencePath),
 ...Object.keys(f.modifiedFiles).concat(Object.keys(f.newFiles)).map(file=>path.join(ROOT,file)),...chirpLayer.inputFiles()];}
function assertCurrentBytes(filename,bytes){
 filename=relative(filename);const f=fixture(),pin=f.modifiedFiles[filename]?.currentSha256||f.newFiles[filename];
 const beforeChirp=chirpLayer.beforeChirpBytes(filename,bytes);
 assert.ok(pin,'source has an explicit native A+B pin: '+filename);assert.equal(sha(beforeChirp),pin,'whole native A+B source '+filename);
 return beforeChirp;
}
function sourceFunction(source,name){
 const match=new RegExp('\\b(?:async\\s+)?function\\s+'+name+'\\s*\\([^)]*\\)\\s*\\{').exec(source);
 assert.ok(match,'bounded source function '+name);const start=match.index;
 let i=start+match[0].length-1,depth=0,quote=null,escaped=false,lineComment=false,blockComment=false;
 for(;i<source.length;i++){
  const c=source[i],next=source[i+1];
  if(lineComment){if(c==='\n')lineComment=false;continue;}
  if(blockComment){if(c==='*'&&next==='/'){blockComment=false;i++;}continue;}
  if(quote){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c===quote)quote=null;continue;}
  if(c==='/'&&next==='/'){lineComment=true;i++;continue;}
  if(c==='/'&&next==='*'){blockComment=true;i++;continue;}
  if(c==='"'||c==="'"||c==='`'){quote=c;continue;}
  if(c==='{')depth++;else if(c==='}'&&!--depth)return source.slice(start,i+1);
 }
 throw Error('Unclosed source function '+name);
}
function assertSourceInvariants(current,before){
 const app=current.get('melunga_deploy/app.html').toString(),oldApp=before.get('melunga_deploy/app.html').toString();
 for(const name of ['DECKS','PEDAGOGY_FAMILIES']){
  const prefix='var '+name+' = ',lines=source=>source.split('\n').filter(line=>line.startsWith(prefix));
  const now=lines(app),old=lines(oldApp);assert.equal(now.length,1);assert.equal(old.length,1);
  assert.equal(now[0],old[0],'actual classic literal unchanged before native projection: '+name);
 }
 const auth=['doLogout','loadPricing','rememberPermanentLogout','checkPaidStatus','unlock','loginExisting','showPaywall','hidePaywall'];
 for(const name of auth)assert.equal(sourceFunction(app,name),sourceFunction(oldApp,name),'actual classic authentication/payment function unchanged: '+name);
 const js=current.get('melunga_deploy/maquette-guidee.js').toString(),oldJs=before.get('melunga_deploy/maquette-guidee.js').toString();
 const progress=['collectLevelProgressIds','levelProgress','loadKnownCards','saveKnownCard','saveCardDecision','markKnown','markForReview'];
 const audio=['speak','stopAudio','setAudioPlaying','fillVoices'];
 for(const name of progress)assert.equal(sourceFunction(js,name),sourceFunction(oldJs,name),'actual composed A+B preserves complete progress function: '+name);
 const audioJs=execFileSync('git',['show',AUDIO_BASE+':melunga_deploy/maquette-guidee.js'],{cwd:ROOT,maxBuffer:40*1024*1024}).toString();
 for(const name of audio)assert.equal(sourceFunction(js,name),sourceFunction(audioJs,name),'actual composed A+B preserves the complete reviewed B audio function: '+name);
 const access=current.get('melunga_deploy/course-access.js').toString(),oldAccess=before.get('melunga_deploy/course-access.js').toString();
 for(const name of ['deviceId','checkServer','refresh','initialize','logout'])assert.equal(sourceFunction(access,name),sourceFunction(oldAccess,name),'actual server access contract unchanged: '+name);
 return {classicAuthFunctions:auth,progressFunctions:progress,audioFunctions:audio};
}
function validate({force=false}={}){
 chirpLayer.validate();
 const f=fixture(),files=inputFiles();
 if(!force&&validationCache&&validationCache.readFileSync===fs.readFileSync&&files.every(file=>validationCache.stamps.get(file)===stamp(path.relative(ROOT,file))))return validationCache.summary;
 assert.equal(sha(chirpLayer.beforeChirpBytes(AUDIO_MODULE)),AUDIO_MODULE_SHA256,'whole audio module is pinned');
 const audioEvidence=read(f.audioEvidencePath);
 assert.equal(sha(audioEvidence),f.audioEvidenceSha256,'whole finite audio patch is pinned');
 assert.ok(audioEvidence.equals(execFileSync('git',['show',AUDIO_BASE+':'+f.audioEvidencePath],{cwd:ROOT,maxBuffer:4*1024*1024})),'original B patch remains immutable evidence');
 const patch=read(f.patchPath);assert.equal(sha(patch),f.patchSha256,'exact composed A+B patch bytes');
 // The actual complete Chirp delta has already passed. Its finite before view
 // is exactly 4fafe31, so the original immutable A+B patch remains unchanged.
 const actualDiff=execFileSync('git',['diff','--binary','--no-ext-diff','--no-textconv','--unified=0',BASE,chirpLayer.baseCommit,'--',...ALLOWED],{cwd:ROOT,maxBuffer:32*1024*1024});
 assert.ok(actualDiff.equals(patch),'actual composed A+B delta equals its complete frozen patch');
 const current=new Map(),before=new Map();
 for(const file of ALLOWED){
  const bytes=assertCurrentBytes(file,read(file));current.set(file,bytes);
  const old=execFileSync('git',['show',BASE+':'+file],{cwd:ROOT,maxBuffer:40*1024*1024});
  assert.equal(sha(old),f.modifiedFiles[file].beforeSha256,'exact pre-native source '+file);before.set(file,old);
 }
 for(const file of Object.keys(f.newFiles))assertCurrentBytes(file,read(file));
 const invariants=assertSourceInvariants(current,before);
 const summary=Object.freeze({layer:'A+B',baseCommit:BASE,audioBaseCommit:AUDIO_BASE,fixtureSha256:FIXTURE_SHA256,modifiedFiles:ALLOWED.length,
  newFiles:Object.keys(f.newFiles).length,...invariants});
 validationCache={summary,before,readFileSync:fs.readFileSync,stamps:new Map(files.map(file=>[file,stamp(path.relative(ROOT,file))]))};
 return summary;
}
function beforeBytes(filename){
 filename=relative(filename);validate();
 return ALLOWED.includes(filename)?Buffer.from(validationCache.before.get(filename)):read(filename);
}
module.exports={validate,beforeBytes,inputFiles,assertCurrentBytes,projectedPaths:ALLOWED};
if(require.main===module)console.log(JSON.stringify(validate()));
