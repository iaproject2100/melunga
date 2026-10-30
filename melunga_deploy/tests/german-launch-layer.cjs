/* Exact German launch delta above the approved 541afb7 edition.
 * The user-approved thematic follow-up adds placement metadata only; its
 * accepted German card import remains independently pinned and verbatim.
 * A historical source view is available only after the complete current tuple,
 * unchanged product files, and live content/auth/progress invariants pass.
 * Functional tests load the current product files directly. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');
const ROOT = path.resolve(__dirname, '../..');
const BASE = '541afb7f67b499130af60211e72a8614bdaaf31d';
const FIXTURE = 'melunga_deploy/tests/fixtures/german-launch-layer.json';
const FIXTURE_SHA256 = 'cfb9a04e22eb85c02ec1f8bd4ec8dd5205fe4ed6a1e607267f12bc6c687d4b61';
// BEGIN FINITE GERMAN PATHS — written by seal_german_launch_layer.cjs.
const MODIFIED = Object.freeze([
  "melunga_deploy/account-ui.js",
  "melunga_deploy/app.html",
  "melunga_deploy/comparaison-voix.html",
  "melunga_deploy/content/course-locales/en.json",
  "melunga_deploy/content/course-locales/es.json",
  "melunga_deploy/content/course-locales/it.json",
  "melunga_deploy/content/course-locales/ja.json",
  "melunga_deploy/content/course-locales/ko.json",
  "melunga_deploy/content/course-locales/supplements.json",
  "melunga_deploy/content/course-locales/zh.json",
  "melunga_deploy/content/native-catalogue/manifest.json",
  "melunga_deploy/course-desktop.js",
  "melunga_deploy/course-i18n.js",
  "melunga_deploy/course-login.js",
  "melunga_deploy/course-native.js",
  "melunga_deploy/desktop-home.css",
  "melunga_deploy/desktop-home.js",
  "melunga_deploy/entry-bridge.js",
  "melunga_deploy/index.html",
  "melunga_deploy/lesson-audio.js",
  "melunga_deploy/maquette-guidee.css",
  "melunga_deploy/maquette-guidee.html",
  "melunga_deploy/maquette-guidee.js",
  "melunga_deploy/native-speech.js",
  "melunga_deploy/netlify/functions/lib/chirp-catalog.mjs",
  "melunga_deploy/netlify/functions/tts.mjs",
  "melunga_deploy/parcours-niveaux.html",
  "melunga_deploy/tests/native-courses.test.cjs",
  "melunga_deploy/voice-comparison.js",
  "melunga_deploy/voice-selection.js",
  "tools/maquette-guidee/build_course_i18n.cjs",
  "tools/maquette-guidee/build_home_i18n.cjs",
  "tools/maquette-guidee/course-locale-keys.json",
  "tools/maquette-guidee/export_native_catalogue.py"
]);
const ADDED = Object.freeze([
  "melunga_deploy/content/course-locales/de.json",
  "melunga_deploy/content/native-catalogue/de-native-meanings.json",
  "melunga_deploy/content/native-catalogue/de.json",
  "melunga_deploy/german-account-ui.js",
  "tools/maquette-guidee/imports/de-deck-v3.1.json",
  "tools/maquette-guidee/imports/de-native-meanings-v1.json",
  "tools/maquette-guidee/imports/de-themes-v1.json"
]);
// END FINITE GERMAN PATHS
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const actual = file => fs.readFileSync(path.join(ROOT, file));
const historical = new Map();
let cache = null;
function relative(file) {
  const value = path.relative(ROOT, path.resolve(ROOT, file));
  assert.ok(value && value !== '..' && !value.startsWith('..' + path.sep) && !path.isAbsolute(value), 'source stays inside repository');
  return value.split(path.sep).join('/');
}
function baseline(file) {
  if (!historical.has(file)) historical.set(file, execFileSync('git', ['show', BASE + ':' + file], {cwd:ROOT, maxBuffer:40 * 1024 * 1024}));
  return historical.get(file);
}
const productPaths = execFileSync('git', ['ls-tree', '-r', '--name-only', BASE, '--', 'melunga_deploy'], {cwd:ROOT, encoding:'utf8'})
  .trim().split('\n').filter(file => !file.startsWith('melunga_deploy/tests/')).sort();
function inventory(directory, prefix) {
  const files = [];
  for (const entry of fs.readdirSync(directory, {withFileTypes:true})) {
    if (entry.name === 'tests' && prefix === 'melunga_deploy') continue;
    if (entry.isFile()) files.push(prefix + '/' + entry.name);
    else if (entry.isDirectory()) files.push(...inventory(path.join(directory, entry.name), prefix + '/' + entry.name));
    else assert.fail('unrecognized product filesystem entry: ' + prefix + '/' + entry.name);
  }
  return files.sort();
}
function fixture() {
  const raw = actual(FIXTURE);
  assert.equal(sha(raw), FIXTURE_SHA256, 'whole finite German launch fixture is pinned');
  const f = JSON.parse(raw);
  assert.equal(f.version, 1); assert.equal(f.id, 'german-launch-exact-layer'); assert.equal(f.baseCommit, BASE);
  assert.deepEqual(Object.keys(f.modifiedFiles).sort(), [...MODIFIED].sort(), 'only explicit German launch sources may be projected');
  assert.deepEqual(Object.keys(f.newFiles).sort(), [...ADDED].sort(), 'only explicit German launch assets may be added');
  assert.equal(f.patchPath, 'melunga_deploy/tests/fixtures/german-launch-layer.patch');
  return f;
}
function pinMessage(file) {
  if (file === 'melunga_deploy/lesson-audio.js') return 'whole audio module is pinned: ' + file;
  if (['app.html','course-access.js','course-login.js','desktop-home.js','entry-bridge.js','index.html','maquette-guidee.html','maquette-guidee.js','parcours-niveaux.html'].some(name => file === 'melunga_deploy/' + name)) return 'whole native A+B source before German projection: ' + file;
  return 'actual protected bytes unchanged before projection: ' + file;
}
function sourceFunction(source, name) {
  const match = new RegExp('\\b(?:async\\s+)?function\\s+' + name + '\\s*\\([^)]*\\)\\s*\\{').exec(source);
  assert.ok(match, 'bounded source function ' + name);
  let i = match.index + match[0].length - 1, depth=0, quote=null, escaped=false, lineComment=false, blockComment=false;
  for (;i<source.length;i++) {
    const c=source[i], next=source[i+1];
    if (lineComment) {if(c==='\n')lineComment=false;continue;}
    if (blockComment) {if(c==='*'&&next==='/'){blockComment=false;i++;}continue;}
    if (quote) {if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c===quote)quote=null;continue;}
    if(c==='/'&&next==='/'){lineComment=true;i++;continue;}
    if(c==='/'&&next==='*'){blockComment=true;i++;continue;}
    if(c==='"'||c==="'"||c==='`'){quote=c;continue;}
    if(c==='{')depth++;else if(c==='}'&&!--depth)return source.slice(match.index,i+1);
  }
  throw Error('Unclosed source function '+name);
}
function assertInvariants() {
  const germanSource=actual('tools/maquette-guidee/imports/de-deck-v3.1.json');
  assert.equal(sha(germanSource),'49d6f1cd3b2a44b4ab4efcbae4c5f58988ebc7e142ebb74b1505d4ce9e39d789','accepted German card import stays byte exact');
  const germanCards=JSON.parse(germanSource);
  assert.equal(germanCards.length,4519,'all accepted German cards are retained');
  assert.deepEqual(JSON.parse(actual('melunga_deploy/content/native-catalogue/de.json')).cards,germanCards,'German thematic placement preserves every original card field and source order');
  const appPath='melunga_deploy/app.html', jsPath='melunga_deploy/maquette-guidee.js';
  const app=actual(appPath).toString(), oldApp=baseline(appPath).toString();
  for (const name of ['DECKS','PEDAGOGY_FAMILIES']) {
    const lines=source=>source.split('\n').filter(line=>line.startsWith('var '+name+' = '));
    assert.equal(lines(app).length,1);assert.equal(lines(oldApp).length,1);
    assert.equal(lines(app)[0],lines(oldApp)[0],'actual classic literal unchanged by German launch: '+name);
  }
  const auth=['doLogout','loadPricing','rememberPermanentLogout','checkPaidStatus','unlock','loginExisting','showPaywall','hidePaywall'];
  for (const name of auth) assert.equal(sourceFunction(app,name),sourceFunction(oldApp,name),'actual authentication/payment function unchanged by German launch: '+name);
  const progress=['collectLevelProgressIds','levelProgress','loadKnownCards','saveKnownCard','saveCardDecision','markKnown','markForReview','validateNextPhrase'];
  const js=actual(jsPath).toString(), oldJs=baseline(jsPath).toString();
  for (const name of progress) assert.equal(sourceFunction(js,name),sourceFunction(oldJs,name),'actual progress function unchanged by German launch: '+name);
  return {germanSourceCards:germanCards.length,classicAuthFunctions:auth,progressFunctions:progress};
}
function inputFiles() {
  const f=fixture();
  return [...new Set([__filename,FIXTURE,f.patchPath,...productPaths,...MODIFIED,...ADDED].map(file=>path.isAbsolute(file)?file:path.join(ROOT,file)))];
}
function stamp(file) {const s=fs.statSync(file,{bigint:true});return[s.dev,s.ino,s.mode,s.size,s.mtimeNs,s.ctimeNs].join(':');}
function validate({force=false}={}) {
  const f=fixture();
  const current=inventory(path.join(ROOT,'melunga_deploy'),'melunga_deploy');
  assert.deepEqual(current,[...productPaths,...ADDED.filter(file=>file.startsWith('melunga_deploy/'))].sort(),'no other runtime asset may be introduced or removed by German launch');
  const files=inputFiles();
  if(!force&&cache&&cache.reader===fs.readFileSync&&cache.lister===fs.readdirSync&&files.every(file=>cache.stamps.get(file)===stamp(file)))return cache.summary;
  for(const file of productPaths) {
    if (MODIFIED.includes(file)) {
      assert.equal(sha(baseline(file)),f.modifiedFiles[file].beforeSha256,'exact pre-German source: '+file);
      assert.equal(sha(actual(file)),f.modifiedFiles[file].currentSha256,pinMessage(file));
    } else assert.ok(actual(file).equals(baseline(file)),pinMessage(file));
  }
  for (const file of MODIFIED.filter(file=>!productPaths.includes(file))) {
    assert.equal(sha(baseline(file)),f.modifiedFiles[file].beforeSha256,'exact pre-German source: '+file);
    assert.equal(sha(actual(file)),f.modifiedFiles[file].currentSha256,pinMessage(file));
  }
  for(const file of ADDED)assert.equal(sha(actual(file)),f.newFiles[file],'whole finite new German asset: '+file);
  const patch=actual(f.patchPath);
  assert.equal(sha(patch),f.patchSha256,'whole finite German launch patch is pinned');
  const diff=execFileSync('git',['diff','--binary','--no-ext-diff','--no-textconv','--unified=0',BASE,'--',...MODIFIED],{cwd:ROOT,maxBuffer:40*1024*1024});
  assert.ok(diff.equals(patch),'actual complete German delta equals its exact frozen patch');
  const invariants=assertInvariants();
  const summary=Object.freeze({layer:'German-launch',baseCommit:BASE,fixtureSha256:FIXTURE_SHA256,modifiedFiles:MODIFIED.length,newFiles:ADDED.length,unchangedProductFiles:productPaths.length-MODIFIED.filter(file=>productPaths.includes(file)).length,...invariants});
  cache={summary,reader:fs.readFileSync,lister:fs.readdirSync,stamps:new Map(files.map(file=>[file,stamp(file)]))};
  return summary;
}
function beforeGermanBytes(file,bytes) {
  file=relative(file);validate();
  const raw=actual(file);
  if(bytes!==undefined)assert.ok(Buffer.from(bytes).equals(raw),'mutated caller bytes cannot be hidden by German launch: '+file);
  return MODIFIED.includes(file)?Buffer.from(baseline(file)):raw;
}
function sourceView() {
  validate();
  const f=fixture();
  return file=>{
    file=relative(file);
    const raw=actual(file);
    if(MODIFIED.includes(file)) {
      assert.equal(sha(raw),f.modifiedFiles[file].currentSha256,pinMessage(file));
      return Buffer.from(baseline(file));
    }
    return raw;
  };
}
module.exports=Object.freeze({validate,beforeGermanBytes,sourceView,inputFiles,baseCommit:BASE,modifiedPaths:MODIFIED,addedPaths:ADDED});
if(require.main===module)console.log(JSON.stringify(validate({force:true})));
