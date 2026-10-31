/* New release proof checks actual files, not a historical projected edition. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {test}=require('node:test');
const layer=require('./german-launch-layer.cjs');
const ROOT=path.resolve(__dirname,'../..');
const FIXTURE='melunga_deploy/tests/fixtures/german-launch-layer.json';
function changedRead(file,run) {
  const original=fs.readFileSync,target=path.join(ROOT,file);
  fs.readFileSync=function(name,...args) {
    const value=original.call(this,name,...args);
    if(typeof name!=='string'||path.resolve(name)!==target)return value;
    return typeof value==='string'?value+'\n':Buffer.concat([value,Buffer.from('\n')]);
  };
  try {run();} finally {fs.readFileSync=original;}
}
test('current German release passes before the old edition is made available',()=>{
  const proof=layer.validate({force:true});
  assert.equal(proof.baseCommit,'541afb7f67b499130af60211e72a8614bdaaf31d');
  assert.equal(proof.newFiles,80);assert.ok(proof.unchangedProductFiles>180);
  assert.equal(proof.germanSourceCards,4519);
  assert.ok(proof.progressFunctions.includes('validateNextPhrase'));
  assert.equal(proof.classicAuthFunctions.length,8);
  const data='melunga_deploy/content/native-catalogue/de.json';
  assert.ok(layer.beforeGermanBytes(data).equals(fs.readFileSync(path.join(ROOT,data))),'new German data is never replaced by historical source');
});
test('every actual changed or added product/source is checked before any projection',()=>{
  for(const file of [...layer.modifiedPaths,...layer.addedPaths])changedRead(file,()=>assert.throws(()=>layer.beforeGermanBytes(layer.modifiedPaths[0]),error=>error.message.includes(file)));
});
test('historical data, layouts, rights, original banks and evidence cannot change silently',()=>{
  for(const file of ['melunga_deploy/content/niveaux-progressifs/fr-es/L1.json','melunga_deploy/content/native-catalogue/zh.json',
    'melunga_deploy/content/course-access.json','melunga_deploy/course-desktop.css','melunga_deploy/course-desktop.js',FIXTURE]) {
    changedRead(file,()=>assert.throws(()=>layer.beforeGermanBytes(layer.modifiedPaths[0]),error=>error.message.includes(file)||error.message.includes('finite German launch fixture')));
  }
  const fixture=JSON.parse(fs.readFileSync(path.join(ROOT,FIXTURE),'utf8'));
  changedRead(fixture.patchPath,()=>assert.throws(()=>layer.validate(),/finite German launch patch/));
});
test('a caller cannot submit changed bytes and get a valid before-German source',()=>{
  const file=layer.modifiedPaths[0],bytes=Buffer.concat([fs.readFileSync(path.join(ROOT,file)),Buffer.from('\n')]);
  assert.throws(()=>layer.beforeGermanBytes(file,bytes),/mutated caller bytes cannot be hidden/);
});
test('additional runtime assets are rejected by the exact product inventory',()=>{
  const original=fs.readdirSync;
  fs.readdirSync=function(directory,...args) {
    const rows=original.call(this,directory,...args);
    return path.resolve(directory)===path.join(ROOT,'melunga_deploy')?[...rows,{name:'unreviewed-player.js',isFile:()=>true}]:rows;
  };
  try {assert.throws(()=>layer.validate(),/no other runtime asset may be introduced or removed/);}finally{fs.readdirSync=original;}
});
