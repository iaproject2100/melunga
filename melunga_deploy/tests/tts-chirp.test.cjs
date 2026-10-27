/* Server-only contract checks. Google responses, credentials and clocks are
 * fixtures: no public HTTP request, account operation or actual audio. */
'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const {test, before, after} = require('node:test');

const LIST_URL = 'https://texttospeech.googleapis.com/v1/voices';
const SYNTH_URL = 'https://texttospeech.googleapis.com/v1/text:synthesize';
const KEY = 'fake-test-key-not-a-credential';
const START = Date.parse('2026-10-27T12:00:00.000Z');
const AUDIO = Buffer.from('fixture-mp3-not-played').toString('base64');
const LOCALES = {fr:'fr-FR',en:'en-GB',es:'es-ES',zh:'cmn-CN',it:'it-IT',ja:'ja-JP',ko:'ko-KR'};
const WAVENET = {
  fr:[['fr-FR-Wavenet-F','FEMALE'],['fr-FR-Wavenet-G','MALE']],
  en:[['en-GB-Wavenet-C','FEMALE'],['en-GB-Wavenet-D','MALE']],
  es:[['es-ES-Wavenet-F','FEMALE'],['es-ES-Wavenet-E','MALE']],
  zh:[['cmn-CN-Wavenet-A','FEMALE'],['cmn-CN-Wavenet-B','MALE']],
  it:[['it-IT-Wavenet-E','FEMALE'],['it-IT-Wavenet-F','MALE']],
  ja:[['ja-JP-Wavenet-B','FEMALE'],['ja-JP-Wavenet-C','MALE']],
  ko:[['ko-KR-Wavenet-A','FEMALE'],['ko-KR-Wavenet-C','MALE']]
};
const APPROVED = {
  fr:{name:'fr-FR-Chirp3-HD-Aoede',gender:'FEMALE'},
  en:{name:'en-GB-Chirp3-HD-Kore',gender:'FEMALE'},
  es:{name:'es-ES-Chirp3-HD-Kore',gender:'FEMALE'},
  zh:{name:'cmn-CN-Chirp3-HD-Kore',gender:'FEMALE'},
  it:{name:'it-IT-Chirp3-HD-Charon',gender:'MALE'},
  ja:{name:'ja-JP-Chirp3-HD-Kore',gender:'FEMALE'},
  ko:{name:'ko-KR-Chirp3-HD-Kore',gender:'FEMALE'}
};
const SELECTION_VERSION = 'kartech-2026-10-27';
let createHandler, createChirpCatalogue, CHIRP_LOCALES, realFetch;
before(async () => {
  realFetch = global.fetch;
  global.fetch = async () => {throw new Error('Unstubbed network is forbidden in this test');};
  ({createHandler} = await import(pathToFileURL(path.join(__dirname,'../netlify/functions/tts.mjs'))));
  ({createChirpCatalogue, CHIRP_LOCALES} = await import(pathToFileURL(path.join(__dirname,'../netlify/functions/lib/chirp-catalog.mjs'))));
});
after(() => {global.fetch = realFetch;});
const event = (params={}, origin='https://melunga.com', method='GET') => ({httpMethod:method,headers:{origin},queryStringParameters:params});
const catalogEvent = () => event({catalog:'chirp3'});
const providerVoice = (locale, suffix, gender) => ({name:locale+'-Chirp3-HD-'+suffix,languageCodes:[locale],ssmlGender:gender,naturalSampleRateHertz:24000});
const providers = () => Object.values(LOCALES).flatMap(locale => [providerVoice(locale,'Puck','MALE'),providerVoice(locale,'Kore','FEMALE'),providerVoice(locale,'Charon','MALE'),providerVoice(locale,'Aoede','FEMALE')]);
const reply = (payload,status=200) => new Response(JSON.stringify(payload),{status,headers:{'content-type':'application/json'}});
const deferred = () => {let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
function fixture({voices=providers(), listResponse, synthResponse, key=KEY, now=START}={}) {
  const f={calls:[],voices,key,time:now,listResponse,synthResponse};
  f.fetchImpl=async (url,options={}) => {
    assert.ok(url===LIST_URL||url===SYNTH_URL,'only the two fixed Google APIs are called');
    assert.equal(new URL(url).search,'','credentials and arbitrary endpoints never enter a provider URL');
    assert.equal(options.headers['x-goog-api-key'],f.key);
    const call={url,options,body:options.body?JSON.parse(options.body):null};f.calls.push(call);
    if(url===LIST_URL){assert.equal(options.method,'GET');assert.ok(options.signal instanceof AbortSignal);return f.listResponse?f.listResponse(call):reply({voices:f.voices});}
    assert.equal(options.method,'POST');assert.equal(options.headers['content-type'],'application/json');
    return f.synthResponse?f.synthResponse(call):reply({audioContent:AUDIO});
  };
  f.handler=createHandler({fetchImpl:f.fetchImpl,now:()=>f.time,apiKey:()=>f.key});
  f.list=()=>f.calls.filter(call=>call.url===LIST_URL);
  f.synth=()=>f.calls.filter(call=>call.url===SYNTH_URL);
  return f;
}
function jsonResult(result,status){assert.equal(result.statusCode,status);assert.match(result.headers['content-type'],/^application\/json/);return JSON.parse(result.body);}
function noStore(result,status){const payload=jsonResult(result,status);assert.equal(result.headers['cache-control'],'no-store');assert.ok(!result.headers['netlify-cdn-cache-control']||result.headers['netlify-cdn-cache-control']==='no-store');return payload;}
function audioResult(result){assert.equal(result.statusCode,200);assert.equal(result.headers['content-type'],'audio/mpeg');assert.equal(result.isBase64Encoded,true);assert.equal(result.body,AUDIO);assert.equal(result.headers['cache-control'],'public, max-age=31536000, immutable');assert.equal(result.headers['netlify-cdn-cache-control'],'public, durable, max-age=31536000, stale-while-revalidate=86400');}
async function silentErrors(fn){const original=console.error,logs=[];console.error=(...args)=>logs.push(args.map(String).join(' '));try{const value=await fn();assert.ok(logs.every(line=>!line.includes(KEY)&&!line.includes('provider-private-body')),'provider bodies and credentials never appear in logs');return value;}finally{console.error=original;}}

test('fourteen historical WaveNet voices keep their exact synthesis fields and year-long cache, without listing voices',async()=>{
  const f=fixture();
  for(const [language,voices] of Object.entries(WAVENET))for(const [name,gender] of voices){
    const result=await f.handler(event({voice:name,lang:LOCALES[language],text:'  Phrase entière 我。 & ?  ',rate:'0.85'}));
    audioResult(result);
    assert.deepEqual(f.synth().at(-1).body,{input:{text:'Phrase entière 我。 & ?'},voice:{languageCode:LOCALES[language],name,ssmlGender:gender},audioConfig:{audioEncoding:'MP3',speakingRate:.85,pitch:0}});
    assert.deepEqual(result.headers,{
      'access-control-allow-origin':'https://melunga.com',
      'access-control-allow-methods':'GET, OPTIONS',
      'access-control-allow-headers':'Authorization, Content-Type',
      'access-control-max-age':'86400',vary:'Origin',
      'content-type':'audio/mpeg',
      'cache-control':'public, max-age=31536000, immutable',
      'netlify-cdn-cache-control':'public, durable, max-age=31536000, stale-while-revalidate=86400',
      'x-content-type-options':'nosniff'
    },'the complete historical WaveNet header object remains unchanged');
  }
  assert.equal(f.synth().length,14);assert.equal(f.list().length,0);
});

test('WaveNet rate defaults, bounds and zero-pitch behavior remain identical',async()=>{
  const f=fixture();
  for(const [rate,expected] of [[undefined,1],['nonsense',1],['0.75',.75],['0.85',.85],['1',1],['0',.65],['0.1',.65],['2',1.2],['',.65]]){
    audioResult(await f.handler(event({voice:'es-ES-Wavenet-F',lang:'es-ES',text:'Hola.',rate})));
    assert.deepEqual(f.synth().at(-1).body.audioConfig,{audioEncoding:'MP3',speakingRate:expected,pitch:0});
  }
  assert.equal(f.list().length,0);
});

test('catalogue lists exactly three provider-observed mixed-gender Chirp voices for each of the seven locales',async()=>{
  assert.deepEqual(Object.keys(CHIRP_LOCALES).sort(),Object.keys(LOCALES).sort());
  const f=fixture(),result=await f.handler(catalogEvent()),body=jsonResult(result,200);
  assert.equal(body.version,1);assert.equal(body.source,'google-voices-list');assert.equal(body.previewOnly,true);
  assert.equal(body.selectionVersion,SELECTION_VERSION);
  assert.equal(body.verifiedAt,new Date(START).toISOString());assert.equal(body.expiresAt,new Date(START+300000).toISOString());
  assert.deepEqual(Object.keys(body.languages).sort(),Object.keys(LOCALES).sort());
  assert.equal(result.headers['cache-control'],'public, max-age=300');assert.equal(result.headers['netlify-cdn-cache-control'],'public, max-age=300');
  let count=0;
  for(const [language,locale] of Object.entries(LOCALES)){
    const item=body.languages[language];assert.equal(item.language,language);assert.equal(item.available,true);
    assert.deepEqual(item.waveNet,{name:WAVENET[language][0][0],languageCode:locale,gender:'FEMALE',engine:'wavenet',rateMode:'server'});
    assert.deepEqual(item.chirp.map(v=>[v.name,v.gender]),[[locale+'-Chirp3-HD-Aoede','FEMALE'],[locale+'-Chirp3-HD-Kore','FEMALE'],[locale+'-Chirp3-HD-Charon','MALE']]);
    assert.equal(new Set(item.chirp.map(v=>v.name)).size,3);assert.equal(new Set(item.chirp.map(v=>v.gender)).size,2);
    for(const voice of item.chirp){assert.deepEqual(Object.keys(voice).sort(),['name','languageCode','gender','engine','rateMode'].sort());assert.equal(voice.languageCode,locale);assert.equal(voice.engine,'chirp3');assert.equal(voice.rateMode,'client');assert.ok(f.voices.some(source=>source.name===voice.name&&source.ssmlGender===voice.gender&&source.languageCodes.includes(voice.languageCode)));count++;}
  }
  assert.equal(count,21);assert.equal(f.list().length,1);assert.equal(f.synth().length,0);assert.ok(!result.body.includes(KEY));
});

test('catalogue fallbacks choose real mixed-gender candidates rather than inventing missing preferred IDs',async()=>{
  const voices=providers().filter(v=>!v.name.startsWith('es-ES-')).concat([providerVoice('es-ES','Achernar','FEMALE'),providerVoice('es-ES','Autonoe','FEMALE'),providerVoice('es-ES','Callirrhoe','FEMALE'),providerVoice('es-ES','Puck','MALE')]);
  const f=fixture({voices}),body=jsonResult(await f.handler(catalogEvent()),200),selected=body.languages.es.chirp;
  assert.equal(body.languages.es.available,true);assert.equal(selected.length,3);assert.equal(new Set(selected.map(v=>v.gender)).size,2);
  for(const voice of selected)assert.ok(voices.some(v=>v.name===voice.name&&v.ssmlGender===voice.gender));
  assert.ok(selected.every(v=>!/(?:Aoede|Kore|Charon)$/.test(v.name)));
  assert.equal(body.languages.es.defaultVoice,null,'comparison choices never become an automatic replacement for absent Kore');
  assert.equal(body.languages.es.defaultReason,'approved_voice_unavailable');
});

test('malformed voices, wrong locales and conflicting duplicates cannot fill a missing candidate',async()=>{
  const voices=providers().filter(v=>!v.name.startsWith('es-ES-')).concat([
    providerVoice('es-ES','Kore','FEMALE'),providerVoice('es-ES','Charon','MALE'),
    providerVoice('es-ES','Aoede','FEMALE'),providerVoice('es-ES','Aoede','MALE'),
    {...providerVoice('es-ES','Puck','MALE'),languageCodes:['fr-FR']},
    {...providerVoice('en-US','Puck','MALE'),languageCodes:['es-ES']},
    providerVoice('es-ES','../relay','FEMALE'),providerVoice('es-ES','Bad?key=leak','FEMALE'),
    providerVoice('es-ES','InvalidGender','NEUTRAL'),{name:'es-ES-Chirp3-HD-MissingFields'},null,
    {name:'es-ES-Wavenet-F',languageCodes:['es-ES'],ssmlGender:'FEMALE'}
  ]);
  const f=fixture({voices}),body=jsonResult(await f.handler(catalogEvent()),200);
  assert.equal(body.languages.es.available,false);assert.deepEqual(body.languages.es.chirp.map(v=>v.name),['es-ES-Chirp3-HD-Kore']);assert.equal(body.languages.es.reason,'insufficient_voices');
  assert.equal(body.languages.es.defaultVoice.name,'es-ES-Chirp3-HD-Kore','a valid approved voice remains usable without three comparison voices');
  assert.equal(body.languages.fr.available,true);
  noStore(await f.handler(event({voice:'es-ES-Chirp3-HD-Aoede',lang:'es-ES',text:'Hola.'})),400);assert.equal(f.synth().length,0);
  const singleGender=fixture({voices:[providerVoice('es-ES','Aoede','FEMALE'),providerVoice('es-ES','Kore','FEMALE'),providerVoice('es-ES','Autonoe','FEMALE')]});
  const unavailable=jsonResult(await singleGender.handler(catalogEvent()),200).languages.es;
  assert.equal(unavailable.available,false);assert.deepEqual(unavailable.chirp.map(v=>v.name),['es-ES-Chirp3-HD-Kore']);
});

test('the seven approved defaults are exact verified members, with one versioned cache URL and no free parameters',async()=>{
  const f=fixture(),legacy=jsonResult(await f.handler(catalogEvent()),200);
  const versioned=jsonResult(await f.handler(event({catalog:'chirp3',selectionVersion:SELECTION_VERSION})),200);
  assert.deepEqual(versioned,legacy);assert.equal(versioned.selectionVersion,SELECTION_VERSION);assert.equal(f.list().length,1);
  for(const [language,expected] of Object.entries(APPROVED)){
    const row=versioned.languages[language];
    assert.deepEqual(row.defaultVoice,{...expected,languageCode:LOCALES[language],engine:'chirp3',rateMode:'client'});
    assert.equal(row.defaultReason,null);assert.ok(row.chirp.some(v=>JSON.stringify(v)===JSON.stringify(row.defaultVoice)));
  }
  for(const params of [{catalog:'chirp3',selectionVersion:'older-version'},{catalog:'chirp3',selectionVersion:''},
    {catalog:'chirp3',selectionVersion:SELECTION_VERSION,other:'free-param'}])noStore(await f.handler(event(params)),400);
  assert.equal(f.list().length,1,'invalid versions and free parameters never reach the provider');
});

test('absent, wrong-gender and conflicting approved IDs never default to another real candidate',async()=>{
  for(const [language,approved] of Object.entries(APPROVED))for(const scenario of ['missing','wrong-gender','conflict']){
    const voices=providers().filter(v=>v.name!==approved.name);
    if(scenario==='wrong-gender'||scenario==='conflict')voices.push({...providerVoice(LOCALES[language],approved.name.split('-').at(-1),approved.gender==='FEMALE'?'MALE':'FEMALE')});
    if(scenario==='conflict')voices.push(providerVoice(LOCALES[language],approved.name.split('-').at(-1),approved.gender));
    const f=fixture({voices}),row=jsonResult(await f.handler(catalogEvent()),200).languages[language];
    assert.equal(row.defaultVoice,null,language+' '+scenario+' never selects another default');
    assert.equal(row.defaultReason,scenario==='missing'?'approved_voice_unavailable':scenario==='wrong-gender'?'approved_voice_gender_mismatch':'approved_voice_conflict');
    if(scenario==='missing')noStore(await f.handler(event({voice:approved.name,lang:LOCALES[language],text:'Fixture phrase.'})),400);
    assert.equal(f.synth().length,0);
  }
});

test('one observed approved voice can be synthesized while the three-voice comparison remains unavailable',async()=>{
  for(const [language,approved] of Object.entries(APPROVED)){
    const f=fixture({voices:[providerVoice(LOCALES[language],approved.name.split('-').at(-1),approved.gender)]});
    const row=jsonResult(await f.handler(catalogEvent()),200).languages[language];
    assert.equal(row.available,false);assert.equal(row.reason,'insufficient_voices');assert.equal(row.defaultReason,null);
    assert.deepEqual(row.chirp,[row.defaultVoice]);assert.equal(row.defaultVoice.name,approved.name);
    audioResult(await f.handler(event({voice:approved.name,lang:LOCALES[language],text:'Fixture phrase.',rate:'0.7'})));
    assert.deepEqual(f.synth().at(-1).body,{input:{text:'Fixture phrase.'},voice:{name:approved.name,languageCode:LOCALES[language]},audioConfig:{audioEncoding:'MP3'}});
    const alternative=approved.name.endsWith('-Aoede')?'Kore':'Aoede';
    noStore(await f.handler(event({voice:LOCALES[language]+'-Chirp3-HD-'+alternative,lang:LOCALES[language],text:'Fixture phrase.'})),400);
    assert.equal(f.synth().length,1);
  }
});

test('Mandarin aliases preserve the exact approved cmn-CN Kore among three mixed candidates and never substitute zh-CN',async()=>{
  const voices=providers().concat(['Aoede','Kore','Charon'].map(name=>providerVoice('zh-CN',name,name==='Charon'?'MALE':'FEMALE')));
  const f=fixture({voices}),row=jsonResult(await f.handler(catalogEvent()),200).languages.zh;
  assert.equal(row.available,true);assert.equal(row.chirp.length,3);assert.equal(new Set(row.chirp.map(v=>v.gender)).size,2);
  assert.equal(row.defaultVoice.name,'cmn-CN-Chirp3-HD-Kore');assert.ok(row.chirp.some(v=>v.name===row.defaultVoice.name));
  const onlyAlias=fixture({voices:voices.filter(v=>!v.name.startsWith('cmn-CN-'))});
  const missing=jsonResult(await onlyAlias.handler(catalogEvent()),200).languages.zh;
  assert.equal(missing.available,true);assert.equal(missing.defaultVoice,null);assert.equal(missing.defaultReason,'approved_voice_unavailable');
});

test('an approved default disappearing at expiry is not retained or replaced from a previous catalogue',async()=>{
  const f=fixture();assert.equal(jsonResult(await f.handler(catalogEvent()),200).languages.it.defaultVoice.name,APPROVED.it.name);
  f.voices=f.voices.filter(v=>v.name!==APPROVED.it.name);f.time+=300000;
  const current=jsonResult(await f.handler(event({catalog:'chirp3',selectionVersion:SELECTION_VERSION})),200).languages.it;
  assert.equal(current.defaultVoice,null);assert.equal(current.defaultReason,'approved_voice_unavailable');
  assert.equal(current.available,true,'three real comparison candidates may remain without changing the owner choice');
  noStore(await f.handler(event({voice:APPROVED.it.name,lang:'it-IT',text:'Ciao.'})),400);assert.equal(f.synth().length,0);
});

test('all 21 selected Chirp voices synthesize MP3 only and explicitly leave playback speed to the client',async()=>{
  const f=fixture(),body=jsonResult(await f.handler(catalogEvent()),200);
  for(const item of Object.values(body.languages))for(const voice of item.chirp)for(const rate of ['0.75','1']){
    const result=await f.handler(event({voice:voice.name,lang:voice.languageCode,text:'  Étude <speak>entière</speak> 我。  ',rate,pitch:'999',endpoint:'https://attacker.invalid/relay'}));
    audioResult(result);assert.equal(result.headers['x-melunga-applied-rate'],'1');assert.equal(result.headers['access-control-expose-headers'],'x-melunga-applied-rate');
    assert.deepEqual(f.synth().at(-1).body,{input:{text:'Étude <speak>entière</speak> 我。'},voice:{languageCode:voice.languageCode,name:voice.name},audioConfig:{audioEncoding:'MP3'}});
  }
  assert.equal(f.synth().length,42);assert.equal(f.list().length,1);
});

test('a fourth real voice, unobserved IDs and cross-locale names are refused without synthesis',async()=>{
  const f=fixture();await f.handler(catalogEvent());
  for(const [voice,lang] of [['es-ES-Chirp3-HD-Puck','es-ES'],['es-ES-Chirp3-HD-Invented','es-ES'],['es-ES-Chirp3-HD-Aoede','fr-FR'],['en-US-Chirp3-HD-Aoede','en-US'],['es-ES-Chirp3-HD-Aoede?key=bad','es-ES'],['es-ES-Wavenet-A','es-ES'],['https://attacker.invalid/relay','es-ES'],['__proto__','es-ES']])noStore(await f.handler(event({voice,lang,text:'Hola.'})),400);
  assert.equal(f.synth().length,0);assert.equal(f.list().length,1);
});

test('Mandarin cmn-CN and zh-CN aliases are observed independently and never become a universal locale bypass',async()=>{
  for(const locale of ['cmn-CN','zh-CN']){
    const voices=providers().filter(v=>!v.name.startsWith('cmn-CN-')).concat([providerVoice(locale,'Aoede','FEMALE'),providerVoice(locale,'Kore','FEMALE'),providerVoice(locale,'Charon','MALE')]);
    const f=fixture({voices}),item=jsonResult(await f.handler(catalogEvent()),200).languages.zh;
    assert.equal(item.available,true);assert.equal(item.chirp.length,3);assert.ok(item.chirp.every(v=>v.languageCode===locale));
    const voice=item.chirp[0];audioResult(await f.handler(event({voice:voice.name,lang:locale,text:'你好。'})));
    noStore(await f.handler(event({voice:voice.name,lang:locale==='zh-CN'?'cmn-CN':'zh-CN',text:'你好。'})),400);
    assert.equal(f.synth().length,1);
  }
});

test('catalogue requests coalesce, count down cache age, expire, and separate provider keys',async()=>{
  const gate=deferred(),f=fixture({listResponse:async()=>{await gate.promise;return reply({voices:providers()});}});
  const a=f.handler(catalogEvent()),b=f.handler(catalogEvent());await Promise.resolve();assert.equal(f.list().length,1);gate.resolve();
  const [first,second]=await Promise.all([a,b]);assert.equal(first.body,second.body);
  f.time+=1500;const cached=await f.handler(catalogEvent());assert.equal(cached.headers['cache-control'],'public, max-age=298');assert.equal(f.list().length,1);
  f.key='fake-second-test-key';await f.handler(catalogEvent());assert.equal(f.list().length,2);
  f.time+=300000;await f.handler(catalogEvent());assert.equal(f.list().length,3);
  assert.deepEqual(f.list().map(c=>c.options.headers['x-goog-api-key']),[KEY,'fake-second-test-key','fake-second-test-key']);
});

test('expired catalogues fail closed and failed loads are retried rather than cached or synthesized',async()=>silentErrors(async()=>{
  const f=fixture();await f.handler(catalogEvent());f.time+=300000;
  f.listResponse=()=>reply({error:{message:'provider-private-body '+KEY}},403);
  noStore(await f.handler(catalogEvent()),502);
  noStore(await f.handler(event({voice:'es-ES-Chirp3-HD-Aoede',lang:'es-ES',text:'Hola.'})),502);
  assert.equal(f.synth().length,0);assert.equal(f.list().length,3);
  f.listResponse=()=>reply({voices:providers()});jsonResult(await f.handler(catalogEvent()),200);assert.equal(f.list().length,4);
  const invalid=fixture({listResponse:()=>reply({voices:'not-an-array'})});
  noStore(await invalid.handler(catalogEvent()),502);assert.equal(invalid.list().length,1);
  invalid.listResponse=()=>reply({voices:[]});const empty=jsonResult(await invalid.handler(catalogEvent()),200);
  assert.ok(Object.values(empty.languages).every(item=>item.available===false&&item.chirp.length===0));assert.equal(invalid.list().length,2);
}));

test('catalogue timeout aborts after eight seconds without leaving a successful or stale cache',async t=>{
  t.mock.timers.enable({apis:['setTimeout']});
  const f=fixture({listResponse:call=>new Promise((resolve,reject)=>call.options.signal.addEventListener('abort',()=>reject(new DOMException('fixture timeout','AbortError')),{once:true}))});
  let finished=false;const pending=f.handler(catalogEvent()).then(result=>{finished=true;return result;});
  await Promise.resolve();assert.equal(f.list().length,1);t.mock.timers.tick(7999);await Promise.resolve();assert.equal(finished,false);
  t.mock.timers.tick(1);noStore(await pending,502);assert.equal(f.list()[0].options.signal.aborted,true);
  f.listResponse=()=>reply({voices:providers()});jsonResult(await f.handler(catalogEvent()),200);assert.equal(f.list().length,2);
});

test('preflight, origin rules, missing key, method and invalid input retain closed behavior',async()=>{
  const f=fixture({key:undefined});f.key=undefined;
  const options=await f.handler(event({},'capacitor://localhost','OPTIONS'));assert.equal(options.statusCode,204);assert.equal(options.headers['access-control-allow-origin'],'capacitor://localhost');
  noStore(await f.handler(event({},'https://melunga.com','POST')),405);noStore(await f.handler(catalogEvent()),503);assert.equal(f.calls.length,0);
  f.key=KEY;
  for(const params of [{catalog:'anything'},{catalog:'chirp3',voice:'es-ES-Wavenet-F'},{voice:'es-ES-Wavenet-F',lang:'es-ES',text:''},{voice:'es-ES-Wavenet-F',lang:'es-ES',text:' '.repeat(2)},{voice:'es-ES-Wavenet-F',lang:'es-ES',text:'a'.repeat(501)},{voice:'es-ES-Wavenet-F',lang:'fr-FR',text:'Hola.'}])noStore(await f.handler(event(params)),400);
  assert.equal(f.calls.length,0);
  const untrusted=await f.handler(event({voice:'es-ES-Wavenet-F',lang:'es-ES',text:'Hola.'},'https://attacker.invalid'));audioResult(untrusted);assert.equal(untrusted.headers['access-control-allow-origin'],undefined);assert.equal(untrusted.headers.vary,'Origin');
});

test('both engines return no-store provider errors without exposing provider bodies or credentials',async()=>silentErrors(async()=>{
  for(const chirp of [false,true])for(const behavior of ['http','empty','throw','invalid-json']){
    const f=fixture({synthResponse:()=>{if(behavior==='http')return reply({error:'provider-private-body '+KEY},403);if(behavior==='empty')return reply({});if(behavior==='throw')throw new Error('provider-private-body '+KEY);return new Response('provider-private-body '+KEY,{status:200});}});
    const result=await f.handler(event({voice:chirp?'es-ES-Chirp3-HD-Aoede':'es-ES-Wavenet-F',lang:'es-ES',text:'Hola.'}));
    noStore(result,502);assert.ok(!result.body.includes(KEY)&&!result.body.includes('provider-private-body'));assert.equal(f.synth().length,1);assert.equal(f.list().length,chirp?1:0);
  }
}));

test('catalogue factory cache has the requested finite lifetime and returns immutable candidates',async()=>{
  let time=START,calls=0;
  const catalogue=createChirpCatalogue({fetchImpl:async()=>{calls++;return reply({voices:providers()});},now:()=>time,ttlMs:1000});
  const first=await catalogue.get(KEY);assert.ok(Object.isFrozen(first)&&Object.isFrozen(first.languages)&&Object.isFrozen(first.languages.es.chirp[0]));
  assert.equal(Date.parse(first.expiresAt)-Date.parse(first.verifiedAt),1000);time+=999;assert.equal(await catalogue.get(KEY),first);assert.equal(calls,1);
  time++;assert.notEqual(await catalogue.get(KEY),first);assert.equal(calls,2);
});
