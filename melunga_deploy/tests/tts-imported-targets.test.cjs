'use strict';
const assert=require('node:assert/strict'),{test}=require('node:test');
test('the four Hindi/Russian WaveNet voices send only whole target text and the correct locale',async()=>{
 const {createHandler}=await import('../netlify/functions/tts.mjs');const calls=[];
 const handler=createHandler({apiKey:()=> 'fixture-only',fetchImpl:async(url,options)=>{
  calls.push({url,body:JSON.parse(options.body)});return{ok:true,json:async()=>({audioContent:'SUQz'})};
 }});
 for(const [locale,suffix,text]of [['hi-IN','C','मैं घर जा रही हूँ।'],['hi-IN','B','मैं घर जा रहा हूँ।'],['ru-RU','A','Я устала.'],['ru-RU','B','Я устал.']]){
  const voice=locale+'-Wavenet-'+suffix,r=await handler({httpMethod:'GET',headers:{},queryStringParameters:{voice,lang:locale,text,rate:'.85'}});
  assert.equal(r.statusCode,200);assert.equal(r.headers['content-type'],'audio/mpeg');
  const body=calls.at(-1).body;assert.deepEqual(body.voice,{name:voice,languageCode:locale,ssmlGender:suffix==='B'?'MALE':'FEMALE'});assert.equal(body.input.text,text);
  assert.equal(body.audioConfig.speakingRate,.85);
 }
 assert.equal(calls.length,4);assert(calls.every(c=>c.url.endsWith('/text:synthesize')));
 const wrong=await handler({httpMethod:'GET',headers:{},queryStringParameters:{voice:'hi-IN-Wavenet-C',lang:'ru-RU',text:'नमस्ते।'}});assert.equal(wrong.statusCode,400);assert.equal(calls.length,4);
});
