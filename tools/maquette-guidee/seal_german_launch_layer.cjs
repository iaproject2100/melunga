/* Review-time fixture builder. It never changes product code or historical
 * Chirp/native-routing evidence. Run only after the German runtime is frozen. */
'use strict';
const fs=require('node:fs'), path=require('node:path'), crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const ROOT=path.resolve(__dirname,'../..');
const BASE='541afb7f67b499130af60211e72a8614bdaaf31d';
const LAYER='melunga_deploy/tests/german-launch-layer.cjs';
const FIXTURE='melunga_deploy/tests/fixtures/german-launch-layer.json';
const PATCH='melunga_deploy/tests/fixtures/german-launch-layer.patch';
const allowedModified=new Set([
 'app.html','index.html','desktop-home.js','desktop-home.css','maquette-guidee.js','maquette-guidee.html','maquette-guidee.css','parcours-niveaux.html','entry-bridge.js',
 'course-i18n.js','course-native.js','course-desktop.js','course-login.js','account-ui.js','voice-selection.js','lesson-audio.js','native-speech.js',
 'comparaison-voix.html','voice-comparison.js','netlify/functions/tts.mjs','netlify/functions/lib/chirp-catalog.mjs',
 'content/native-catalogue/manifest.json','tests/native-courses.test.cjs',...['en','es','it','zh','ja','ko','supplements'].map(id=>'content/course-locales/'+id+'.json')
].map(file=>'melunga_deploy/'+file).concat(['tools/maquette-guidee/course-locale-keys.json','tools/maquette-guidee/export_native_catalogue.py','tools/maquette-guidee/build_course_i18n.cjs','tools/maquette-guidee/build_home_i18n.cjs']));
// The thematic metadata is an independently authored placement map. It never
// replaces the validated German card import or changes any of its 15 fields.
const addedCandidates=['melunga_deploy/content/native-catalogue/de.json','tools/maquette-guidee/imports/de-deck-v3.1.json',
 'tools/maquette-guidee/imports/de-themes-v1.json','tools/maquette-guidee/imports/de-native-meanings-v1.json',
 'melunga_deploy/content/native-catalogue/de-native-meanings.json','melunga_deploy/content/course-locales/de.json','melunga_deploy/german-account-ui.js',
 'tools/maquette-guidee/imported_target_catalogues.py',
 ...['hi','ru'].flatMap(code=>['melunga_deploy/content/native-catalogue/'+code+'.json','tools/maquette-guidee/imports/'+code+'-deck-v1.json','tools/maquette-guidee/imports/'+code+'-themes-v1.json'])];
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const git=(args)=>execFileSync('git',args,{cwd:ROOT,maxBuffer:40*1024*1024});
const changed=git(['diff','--name-only',BASE,'--','melunga_deploy','tools/maquette-guidee']).toString().trim().split('\n').filter(Boolean)
 .filter(file=>(!file.startsWith('melunga_deploy/tests/')||file==='melunga_deploy/tests/native-courses.test.cjs')&&!file.endsWith('/seal_german_launch_layer.cjs'));
for(const file of changed)if(!allowedModified.has(file)&&!addedCandidates.includes(file))throw Error('German source delta outside explicit scope: '+file);
const modified=changed.filter(file=>allowedModified.has(file)).sort();
const added=addedCandidates.filter(file=>fs.existsSync(path.join(ROOT,file))).sort();
if(added.length!==addedCandidates.length)throw Error('German validated source, thematic metadata and runtime bank are required before sealing');
const patch=git(['diff','--binary','--no-ext-diff','--no-textconv','--unified=0',BASE,'--',...modified]);
fs.writeFileSync(path.join(ROOT,PATCH),patch);
const modifiedFiles=Object.fromEntries(modified.map(file=>[file,{beforeSha256:sha(git(['show',BASE+':'+file])),currentSha256:sha(fs.readFileSync(path.join(ROOT,file)))}]));
const newFiles=Object.fromEntries(added.map(file=>[file,sha(fs.readFileSync(path.join(ROOT,file)))]));
const fixture={version:1,id:'german-launch-exact-layer',baseCommit:BASE,modifiedFiles,newFiles,patchPath:PATCH,patchSha256:sha(patch)};
const raw=Buffer.from(JSON.stringify(fixture,null,2)+'\n');fs.writeFileSync(path.join(ROOT,FIXTURE),raw);
let source=fs.readFileSync(path.join(ROOT,LAYER),'utf8');
source=source.replace(/const FIXTURE_SHA256 = '[^']+';/,"const FIXTURE_SHA256 = '"+sha(raw)+"';");
source=source.replace(/\/\/ BEGIN FINITE GERMAN PATHS[^\n]*\n[\s\S]*?\/\/ END FINITE GERMAN PATHS/,
 '// BEGIN FINITE GERMAN PATHS — written by seal_german_launch_layer.cjs.\nconst MODIFIED = Object.freeze('+JSON.stringify(modified,null,2)+');\nconst ADDED = Object.freeze('+JSON.stringify(added,null,2)+');\n// END FINITE GERMAN PATHS');
fs.writeFileSync(path.join(ROOT,LAYER),source);
console.log(JSON.stringify({baseCommit:BASE,fixtureSha256:sha(raw),modified,newFiles:added,patchSha256:sha(patch)}));
