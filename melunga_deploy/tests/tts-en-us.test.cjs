'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
test('US English is current; both cached British catalogue contracts and observed audio remain supported',async()=>{
 const {createHandler}=await import('../netlify/functions/tts.mjs');
 const locales=['fr-FR','en-US','en-GB','es-ES','cmn-CN','it-IT','ja-JP','ko-KR','de-DE'];
 const voices=locales.flatMap(code=>[['Aoede','FEMALE'],['Kore','FEMALE'],['Charon','MALE']].map(([suffix,ssmlGender])=>({name:code+'-Chirp3-HD-'+suffix,languageCodes:[code],ssmlGender})));
 const calls=[];const handler=createHandler({apiKey:()=> 'fixture-only',fetchImpl:async(url,options)=>{
  calls.push({url,options});return {ok:true,json:async()=>url.endsWith('/voices')?{voices}:{audioContent:'SUQz'}};
 }});
 const event=params=>({httpMethod:'GET',headers:{},queryStringParameters:params});
 const catalogue=async version=>{const r=await handler(event({catalog:'chirp3',selectionVersion:version}));assert.equal(r.statusCode,200);return JSON.parse(r.body);};
 const current=await catalogue('kartech-2026-10-30-en-us');
 const previous=await catalogue('kartech-2026-10-30-de');
 const legacy=await catalogue('kartech-2026-10-27');
 assert.equal(current.languages.en.defaultVoice.name,'en-US-Chirp3-HD-Kore');
 assert.equal(current.languages.en.waveNet.name,'en-US-Wavenet-C');
 assert(current.languages.en.chirp.every(v=>v.languageCode==='en-US'));
 assert.equal(previous.languages.en.defaultVoice.name,'en-GB-Chirp3-HD-Kore');
 assert.deepEqual(previous.languages.en,legacy.languages.en);
 assert.equal(Object.keys(current.languages).length,8);assert.equal(Object.keys(legacy.languages).length,7);
 for(const lang of ['fr','es','zh','it','ja','ko','de'])assert.deepEqual(current.languages[lang],previous.languages[lang]);
 for(const [voice,lang] of [['en-US-Wavenet-C','en-US'],['en-US-Wavenet-D','en-US'],['en-US-Chirp3-HD-Kore','en-US'],['en-GB-Chirp3-HD-Kore','en-GB']]){
  const r=await handler(event({voice,lang,text:'Can you help me?',rate:'1'}));assert.equal(r.statusCode,200);
  const body=JSON.parse(calls.at(-1).options.body);assert.equal(body.voice.name,voice);assert.equal(body.voice.languageCode,lang);assert.equal(body.input.text,'Can you help me?');
 }
 const wrong=await handler(event({voice:'en-US-Wavenet-C',lang:'en-GB',text:'Hello'}));assert.equal(wrong.statusCode,400);
 assert.equal(calls.filter(c=>c.url.endsWith('/voices')).length,1);
});
