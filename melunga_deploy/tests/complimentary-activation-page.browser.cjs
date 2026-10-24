/* Run with NODE_PATH exposing playwright-core and CHROMIUM_PATH if needed.
 * All pages, scripts and API requests are fulfilled in the browser harness.
 * No real account, credential, payment or external request is used.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {test,before,after} = require('node:test');
const {chromium} = require('playwright-core');

const ROOT = path.resolve(__dirname,'..');
const PAGE = '/activer-compte-partage.html';
const SCRIPT = '/activer-compte-partage.js';
const ENDPOINT = '/.netlify/functions/admin-shared-access';
const ORIGIN = 'https://melunga.com';
const ADMIN = 'fictitious-browser-admin-key';
const PASSWORD = 'Fictitious-browser-password-54';
const EMAIL = 'contact@melunga.com';
const state = overrides => ({email:EMAIL,exists:false,revision:'absent',permanent:false,
  accessActive:false,deviceLimit:30,registeredDevices:0,canActivate:true,blocker:null,
  subscriptionPlan:null,subscriptionExpiry:null,...overrides});
const active = overrides => state({exists:true,revision:'"v2"',permanent:true,accessActive:true,...overrides});
let browser;

function headersFor(urlPath){
  // Read the real policy, rather than a second hand-maintained browser policy.
  const output={};
  const source=fs.readFileSync(path.join(ROOT,'netlify.toml'),'utf8');
  for(const section of source.split(/^\[\[headers\]\]\s*$/m).slice(1)){
    const raw=section.match(/^\s*for\s*=\s*("(?:[^"\\]|\\.)*")\s*$/m);
    if(!raw)continue;
    const pattern=JSON.parse(raw[1]);
    const matcher=new RegExp('^'+pattern.split('*').map(part=>part.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('.*')+'$');
    if(!matcher.test(urlPath))continue;
    const values=section.split(/^\s*\[headers\.values\]\s*$/m)[1]||'';
    for(const line of values.split('\n')){
      const match=line.match(/^\s*([\w-]+)\s*=\s*("(?:[^"\\]|\\.)*")\s*$/);
      if(match)output[match[1]]=JSON.parse(match[2]);
    }
  }
  return output;
}

before(async()=>{
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
});
after(async()=>{await browser?.close();});

async function open({origin=ORIGIN,width=390,height=844,reply}={}){
  const context=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});
  await context.addCookies([{name:'fixture_session',value:'fictitious-cookie',domain:new URL(origin).hostname,
    path:'/',secure:true,httpOnly:true,sameSite:'Strict'}]);
  const seen={api:[],unexpected:[],console:[],errors:[]};
  await context.addInitScript(()=>{
    window.__activationCspViolations=[];
    window.addEventListener('securitypolicyviolation',event=>{
      window.__activationCspViolations.push({directive:event.violatedDirective,blocked:event.blockedURI});
    });
  });
  await context.route('**/*',async route=>{
    const request=route.request();
    const url=new URL(request.url());
    if(url.origin===origin && url.pathname===PAGE){
      return route.fulfill({contentType:'text/html',headers:headersFor(PAGE),body:fs.readFileSync(path.join(ROOT,PAGE),'utf8')});
    }
    if(url.origin===origin && url.pathname===SCRIPT){
      return route.fulfill({contentType:'text/javascript',headers:headersFor(SCRIPT),body:fs.readFileSync(path.join(ROOT,SCRIPT),'utf8')});
    }
    if(url.origin===origin && url.pathname===ENDPOINT){
      const entry={url:url.href,method:request.method(),headers:request.headers(),body:request.postDataJSON()};
      seen.api.push(entry);
      if(reply){
        const result=await reply(entry,seen.api);
        if(result?.abort)return route.abort('failed');
        return route.fulfill({status:result?.status||200,headers:result?.headers,
          json:result?.body||{success:true,state:state()}});
      }
      return route.fulfill({json:{success:true,state:entry.body.action==='activate'?active():state()}});
    }
    if(url.origin===origin && url.pathname==='/favicon.ico')return route.fulfill({status:204});
    seen.unexpected.push(url.href);
    return route.abort();
  });
  const page=await context.newPage();
  page.on('console',message=>seen.console.push(message.text()));
  page.on('pageerror',error=>seen.errors.push(error.message));
  await page.goto(origin+PAGE);
  await page.locator('#inspectButton').waitFor();
  return {page,context,seen};
}

async function inspect(h){
  await h.page.locator('#adminKey').fill(ADMIN);
  await h.page.locator('#inspectButton').click();
}
async function ready(h){
  await inspect(h);
  await h.page.locator('#passwordSection').waitFor({state:'visible'});
}
async function activate(h){
  await h.page.locator('#accountPassword').fill(PASSWORD);
  await h.page.locator('#activateButton').click();
}
async function clean(h){
  assert.deepEqual(h.seen.errors,[],'no JavaScript errors');
  assert.deepEqual(h.seen.unexpected,[],'no external network request');
  const leaked=await h.page.evaluate(()=>({url:location.href,text:document.body.innerText,
    html:document.documentElement.innerHTML,local:[...Object.entries(localStorage)],session:[...Object.entries(sessionStorage)],
    csp:window.__activationCspViolations}));
  const serialized=JSON.stringify({...leaked,console:h.seen.console,urls:h.seen.api.map(r=>r.url)});
  for(const secret of [ADMIN,PASSWORD])assert(!serialized.includes(secret),'no credential in URL, text, markup, storage or logs');
  assert.deepEqual(leaked.local,[]);
  assert.deepEqual(leaked.session,[]);
  assert.deepEqual(leaked.csp,[],'the actual Netlify CSP allows the intended page and API flow');
  await h.context.close();
}

test('initial page requires explicit inspection and masks both credential inputs',async()=>{
  const h=await open();
  assert.equal(await h.page.locator('#adminKey').getAttribute('type'),'password');
  assert.equal(await h.page.locator('#accountPassword').getAttribute('type'),'password');
  assert.equal(await h.page.locator('#passwordSection').isVisible(),false);
  assert.equal(await h.page.locator('#successPanel').isVisible(),false);
  assert.deepEqual(h.seen.api,[]);
  await h.page.locator('#adminKey').fill(ADMIN);
  assert.deepEqual(h.seen.api,[],'typing a key does not submit it');
  await clean(h);
});

test('the page and its extensionless alias use the same strict administrative headers',()=>{
  const pagePolicy=headersFor(PAGE);
  assert.equal(pagePolicy['Cache-Control'],'no-store');
  assert.match(pagePolicy['X-Robots-Tag'],/noindex/);
  assert.equal(pagePolicy['Referrer-Policy'],'no-referrer');
  assert.match(pagePolicy['Content-Security-Policy'],/connect-src 'self'/);
  assert.deepEqual(headersFor('/activer-compte-partage'),pagePolicy);
  assert.deepEqual(headersFor(SCRIPT),pagePolicy);
});

test('inspection sends the key only in the same-origin Authorization header',async()=>{
  const h=await open();
  await ready(h);
  assert.equal(h.seen.api.length,1);
  assert.deepEqual(h.seen.api[0].body,{action:'inspect'});
  assert.equal(h.seen.api[0].method,'POST');
  assert.equal(h.seen.api[0].headers.authorization,'Bearer '+ADMIN);
  assert.equal(h.seen.api[0].headers.cookie,undefined,'administrative API request omits existing site cookies');
  assert.equal(h.seen.api[0].headers.referer,undefined,'the administrative no-referrer policy is effective in the browser');
  assert.equal(h.seen.api[0].url,ORIGIN+ENDPOINT);
  await clean(h);
});

test('a wrong administrative key cannot enable or submit activation',async()=>{
  const h=await open({reply:()=>({status:401,body:{success:false,error:'unauthorized'}})});
  await inspect(h);
  await h.page.waitForFunction(()=>!document.querySelector('#inspectButton').disabled);
  assert.equal(await h.page.locator('#passwordSection').isVisible(),false);
  assert.equal(await h.page.locator('#successPanel').isVisible(),false);
  assert.equal(h.seen.api.length,1);
  assert.match(await h.page.locator('#status').innerText(),/clé|autoris|administr/i);
  await clean(h);
});

test('an administrative redirect is refused before any second destination is requested',async()=>{
  const h=await open({reply:()=>({status:302,headers:{Location:'https://never-request.example.invalid/'},
    body:{success:false,error:'service_unavailable'}})});
  await inspect(h);
  await h.page.waitForFunction(()=>!document.querySelector('#inspectButton').disabled);
  assert.equal(h.seen.api.length,1);
  assert.equal(await h.page.locator('#passwordSection').isVisible(),false);
  assert.equal(await h.page.locator('#successPanel').isVisible(),false);
  await clean(h);
});

test('an inconsistent device registry blocks activation without dropping places',async()=>{
  const h=await open({reply:()=>({body:{success:true,state:state({exists:true,revision:'"v1"',registeredDevices:null,
    canActivate:false,blocker:'legacy_session_requires_review'})}})});
  await inspect(h);
  await h.page.waitForFunction(()=>!document.querySelector('#inspectButton').disabled);
  assert.equal(await h.page.locator('#passwordSection').isVisible(),false);
  assert.equal(await h.page.locator('#successPanel').isVisible(),false);
  assert.equal(h.seen.api.length,1);
  await clean(h);
});

test('activation uses the inspected revision and confirms the exact permanent 30-device grant',async()=>{
  const h=await open({reply:entry=>({body:{success:true,state:entry.body.action==='inspect'
    ?state({exists:true,revision:'"fixture-etag"',registeredDevices:2,deviceLimit:2}):active({registeredDevices:2})}})});
  await ready(h);
  await activate(h);
  await h.page.locator('#successPanel').waitFor({state:'visible'});
  const request=h.seen.api.find(r=>r.body.action==='activate');
  assert.equal(request.body.password,PASSWORD);
  assert.equal(request.body.expectedRevision,'"fixture-etag"');
  assert.match(request.body.requestId,/^[0-9a-f-]{36}$/i);
  assert.equal(request.headers.authorization,'Bearer '+ADMIN);
  assert.equal(await h.page.locator('#adminKey').inputValue(),'');
  assert.equal(await h.page.locator('#accountPassword').inputValue(),'');
  assert.equal(await h.page.locator('#passwordSection').isVisible(),false);
  await clean(h);
});

test('an account already active is reported without an activation write or password',async()=>{
  const h=await open({reply:()=>({body:{success:true,state:active({registeredDevices:8})}})});
  await inspect(h);
  await h.page.locator('#successPanel').waitFor({state:'visible'});
  assert.equal(h.seen.api.length,1);
  assert.equal(h.seen.api[0].body.action,'inspect');
  assert.equal(await h.page.locator('#adminKey').inputValue(),'');
  assert.equal(await h.page.locator('#passwordSection').isVisible(),false);
  await clean(h);
});

test('changing the key invalidates the old inspection before an activation',async()=>{
  const h=await open();
  await ready(h);
  await h.page.locator('#accountPassword').fill(PASSWORD);
  await h.page.locator('#adminKey').fill('another-fictitious-key');
  assert.equal(await h.page.locator('#passwordSection').isVisible(),false);
  assert.equal(await h.page.locator('#accountPassword').inputValue(),'');
  assert.equal(h.seen.api.length,1);
  await clean(h);
});

test('a revision conflict clears the password and requires a new inspection',async()=>{
  const h=await open({reply:entry=>entry.body.action==='activate'
    ?{status:409,body:{success:false,error:'account_changed'}}:{body:{success:true,state:state()}}});
  await ready(h);
  await activate(h);
  await h.page.waitForFunction(()=>!document.querySelector('#inspectButton').disabled);
  assert.equal(await h.page.locator('#accountPassword').inputValue(),'');
  assert.equal(await h.page.locator('#passwordSection').isVisible(),false);
  assert.equal(await h.page.locator('#successPanel').isVisible(),false);
  assert.match(await h.page.locator('#status').innerText(),/vérifi|modifi|nouveau/i);
  assert.equal(h.seen.api.filter(r=>r.body.action==='activate').length,1);
  await clean(h);
});

test('a lost activation response retries with the same operation ID after re-entering the password',async()=>{
  let activations=0;
  const h=await open({reply:entry=>{
    if(entry.body.action==='inspect')return {body:{success:true,state:state()}};
    activations++;
    return activations===1?{abort:true}:{body:{success:true,changed:false,state:active()}};
  }});
  await ready(h);
  await activate(h);
  await h.page.waitForFunction(()=>!document.querySelector('#activateButton').disabled);
  assert.equal(await h.page.locator('#accountPassword').inputValue(),'');
  assert.equal(await h.page.locator('#successPanel').isVisible(),false);
  await activate(h);
  await h.page.locator('#successPanel').waitFor({state:'visible'});
  const attempts=h.seen.api.filter(r=>r.body.action==='activate');
  assert.equal(attempts.length,2);
  assert.equal(attempts[0].body.requestId,attempts[1].body.requestId);
  assert.equal(attempts[0].body.expectedRevision,attempts[1].body.expectedRevision);
  await clean(h);
});

test('a busy activation cannot be submitted twice',async()=>{
  let release;
  const pending=new Promise(resolve=>{release=resolve;});
  const h=await open({reply:async entry=>{
    if(entry.body.action==='inspect')return {body:{success:true,state:state()}};
    await pending;
    return {body:{success:true,state:active()}};
  }});
  await ready(h);
  await h.page.locator('#accountPassword').fill(PASSWORD);
  await h.page.locator('#passwordForm').evaluate(form=>{
    form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
    form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));
  });
  await h.page.waitForFunction(()=>document.querySelector('#activateButton').disabled);
  assert.equal(h.seen.api.filter(r=>r.body.action==='activate').length,1);
  release();
  await h.page.locator('#successPanel').waitFor({state:'visible'});
  await clean(h);
});

test('a nominal success cannot misreport a wrong account, finite grant, or wrong limit',async()=>{
  for(const malformed of [{permanent:false},{deviceLimit:2},{accessActive:false},{email:'other@example.test'}]){
    const h=await open({reply:entry=>({body:{success:true,state:entry.body.action==='inspect'?state():active(malformed)}})});
    await ready(h);
    await activate(h);
    await h.page.waitForFunction(()=>!document.querySelector('#inspectButton').disabled);
    assert.equal(await h.page.locator('#successPanel').isVisible(),false);
    await clean(h);
  }
});

test('clear removes credentials and the inspected state without an activation request',async()=>{
  const h=await open();
  await ready(h);
  await h.page.locator('#accountPassword').fill(PASSWORD);
  await h.page.locator('#clearButton').click();
  assert.equal(await h.page.locator('#adminKey').inputValue(),'');
  assert.equal(await h.page.locator('#accountPassword').inputValue(),'');
  assert.equal(await h.page.locator('#passwordSection').isVisible(),false);
  assert.equal(h.seen.api.length,1);
  await clean(h);
});

test('deploy previews cannot inspect or activate and link to the production page',async()=>{
  const h=await open({origin:'https://deploy-preview-12--chic-dragon-e2baf2.netlify.app'});
  assert.equal(await h.page.locator('#inspectButton').isDisabled(),true);
  assert.equal(await h.page.locator('#passwordSection').isVisible(),false);
  assert.equal(h.seen.api.length,0);
  assert(await h.page.locator('a[href="'+ORIGIN+PAGE+'"]').count(),'blocked preview offers the production destination');
  await clean(h);
});

test('the administrative form fits narrow mobile and desktop viewports',async()=>{
  for(const [width,height] of [[320,568],[390,844],[1440,900]]){
    const h=await open({width,height});
    await ready(h);
    const widths=await h.page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:innerWidth}));
    assert(widths.scroll<=widths.viewport+1,'no horizontal overflow at '+width+'px');
    for(const selector of ['#adminKey','#inspectButton','#accountPassword','#activateButton']){
      const box=await h.page.locator(selector).boundingBox();
      assert(box && box.width>=44 && box.height>=44,'reachable touch control '+selector);
    }
    await clean(h);
  }
});
