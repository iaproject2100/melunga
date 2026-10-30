#!/usr/bin/env node
'use strict';
// Embed the existing home/proof translations so this first experience also
// works when the larger course dictionary is unavailable or cached too old.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),web=path.join(root,'melunga_deploy');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const source=read(path.join(__dirname,'course-locale-keys.json'));
const supplements=read(path.join(web,'content/course-locales/supplements.json'));
const codes=['fr','en','de','es','it','zh','ja','ko'];
const proofStart=source.uiKeys.indexOf('PASSER');assert.ok(proofStart>0);
const keys=[...new Set([...source.uiKeys.slice(proofStart),'Retour','Fermer',
 'UN SEUL CHOIX POUR COMMENCER','Quelle langue veux-tu parler ?',
 'Choisis une langue et commence immédiatement. Tu pourras changer plus tard.',
 'Démarrer ma première leçon','🔊 Réécouter la voix native','Chargement de la voix…','🔊 Réessayer'])];
const dictionaries={};
for(const locale of codes){
 const data=locale==='fr'?{ui:Object.fromEntries(source.uiKeys.map(k=>[k,k])),languages:source.languages,formats:source.formats}
  :read(path.join(web,'content/course-locales/'+locale+'.json'));
 const ui={...data.ui,...supplements[locale]};
 dictionaries[locale]={ui:Object.fromEntries(keys.map(k=>{assert.ok(typeof ui[k]==='string'&&ui[k].trim(),locale+' missing '+k);return [k,ui[k]];})),
  languages:data.languages,formats:{page:data.formats.page,nativeAudience:data.formats.nativeAudience}};
}
const marker=/\/\* BEGIN GENERATED HOME I18N \*\/[\s\S]*?\/\* END GENERATED HOME I18N \*\//;
const block='/* BEGIN GENERATED HOME I18N */\n    const homeDictionaries = '+JSON.stringify(dictionaries).replace(/</g,'\\u003c')+';\n    /* END GENERATED HOME I18N */';
const file=path.join(web,'index.html'),original=fs.readFileSync(file,'utf8');assert.ok(marker.test(original),'home translation markers exist');
const updated=original.replace(marker,block);
if(process.argv.includes('--check'))assert.equal(original,updated,'embedded home translations are current');else fs.writeFileSync(file,updated);
process.stdout.write(JSON.stringify({status:'passed',locales:codes.length,uiKeys:keys.length,generatedFromExistingTranslations:true,check:process.argv.includes('--check')})+'\n');
