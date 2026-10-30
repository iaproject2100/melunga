'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{execFileSync}=require('node:child_process');
const ROOT=path.resolve(__dirname,'../..'),WEB=path.join(ROOT,'melunga_deploy'),BASE='120f136';
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const source=JSON.parse(read('tools/maquette-guidee/course-locale-keys.json'));
function api(text){const c={};c.window=c;vm.runInNewContext(text,c);return c.MelungaCourseI18n;}
const current=api(read('melunga_deploy/course-i18n.js'));
const before=api(execFileSync('git',['show',BASE+':melunga_deploy/course-i18n.js'],{cwd:ROOT,encoding:'utf8',maxBuffer:10*1024*1024}));
const oldLocales=['fr','en','es','it','zh','ja','ko','de'],newLocales=['ru','pt','ar','hi'];
const capture=fn=>{try{return{value:fn()};}catch(e){return{error:e.message};}};
test('all eight established interface dictionaries keep every published value',()=>{
 for(const locale of oldLocales){
  for(const key of [...source.uiKeys,...Object.keys(JSON.parse(read('melunga_deploy/content/course-locales/supplements.json')).fr)])assert.equal(current.t(locale,key),before.t(locale,key));
  for(const title of source.themeKeys)assert.deepEqual(capture(()=>current.theme(locale,title)),capture(()=>before.theme(locale,title)));
  for(let level=1;level<=10;level++)assert.equal(current.levelTitle(locale,level),before.levelTitle(locale,level));
  for(const code of Object.keys(source.languages))assert.equal(current.languageName(locale,code),before.languageName(locale,code));
  for(const key of Object.keys(source.formats))assert.equal(current.format(locale,key,{n:2}),before.format(locale,key,{n:2}));
 }
});
test('the four prepared interfaces cover all labels, themes, levels, language names and formats',()=>{
 assert.deepEqual(Array.from(current.locales),[...oldLocales,...newLocales]);
 for(const locale of newLocales){
  const d=JSON.parse(read('melunga_deploy/content/course-locales/'+locale+'.json'));
  for(const key of source.uiKeys)assert.equal(current.t(locale,key),d.ui[key]);
  for(const title of source.themeKeys)assert.equal(current.theme(locale,title),d.themes[title]);
  for(let level=1;level<=10;level++)assert.equal(current.levelTitle(locale,level),d.levels[level]);
  for(const code of Object.keys(source.languages))assert.equal(current.languageName(locale,code),d.languages[code]);
  for(const key of Object.keys(source.formats))assert.equal(current.format(locale,key,{n:2}),d.formats[key].replaceAll('{n}','2'));
 }
 assert.equal(current.t('ru','Thèmes'),'Темы');assert.equal(current.t('pt','Thèmes'),'Temas');assert.equal(current.t('ar','Thèmes'),'المواضيع');
 assert.equal(current.languageName('pt','pt'),'Português (Brasil)');assert.equal(current.t('hi','Thèmes'),'विषय');assert.equal(current.languageName('hi','hi'),'हिन्दी');assert.equal(current.t('hi','Langue maternelle'),'मातृभाषा');
});
test('unreviewed machine lesson translations never enter the shipped catalogue or studied decks',()=>{
 for(const code of ['fr','en','es','it','zh','ja','ko','de','hi','ru','pt','ar']){
  const file='melunga_deploy/content/native-catalogue/'+code+'.json';
  const original=execFileSync('git',['show',BASE+':'+file],{cwd:ROOT,maxBuffer:20*1024*1024});assert(original.equals(fs.readFileSync(path.join(ROOT,file))));
 }
 const c={};c.window=c;vm.runInNewContext(read('melunga_deploy/course-native.js'),c);
 for(const pair of ['ru-en','pt-en','ar-en','hi-en'])assert.equal(c.MelungaNativeCourses.isPair(pair),false,'native route requires reviewed meaning sidecars');
 assert.equal(fs.existsSync(path.join(WEB,'content/native-catalogue/ru-native-meanings.json')),false);
});
