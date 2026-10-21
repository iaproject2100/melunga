/* Local browser verification only. No purchase, account or deployment action. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
let chromium;
try { ({ chromium } = require('playwright-core')); }
catch (_) { ({ chromium } = require('/tmp/melunga-review-tools/node_modules/playwright-core')); }
const repository = path.resolve(__dirname, '../../..');
const captures = process.env.MELUNGA_PREMIUM_CAPTURES || '/tmp/melunga-premium-review';
const prefix = '/docs/revue-pedagogique/maquette-premium/';
const mime = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.json':'application/json; charset=utf-8', '.png':'image/png', '.svg':'image/svg+xml', '.jpg':'image/jpeg', '.webp':'image/webp' };
const normalize = value => String(value).replace(/\s+/g, ' ').trim();
const server = http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch (_) { res.writeHead(400); res.end(); return; }
  const file = path.resolve(repository, '.' + pathname + (pathname.endsWith('/') ? 'index.html' : ''));
  if (!file.startsWith(repository + path.sep)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (error, bytes) => {
    if (error) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type':mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control':'no-store' });
    res.end(bytes);
  });
});

function sourceEntries(pair) {
  const codes = pair.match(/(?:^|[^a-z])([a-z]{2})(?:[^a-z]|$)/g);
  let parts = pair.split(/[^a-z]+/).filter(Boolean);
  if (parts.length !== 2 && codes) parts = codes.map(code => code.replace(/[^a-z]/g, ''));
  assert.equal(parts.length, 2, 'Pair value must identify native/study languages: ' + pair);
  return [1, 2].flatMap(level => {
    const file = path.join(repository, 'melunga_deploy/content/conversation', `L${level}-${parts[0]}-${parts[1]}.json`);
    const doc = JSON.parse(fs.readFileSync(file, 'utf8'));
    return doc.units.flatMap(unit => unit.variants).concat(doc.dialogues.flatMap(dialogue => dialogue.turns));
  });
}

function verifySourceData(demo) {
  assert.equal(demo.pairs.length,7);
  let checkedTurns = 0;
  for (const pair of demo.pairs) {
    const documents = [pair.sourceL1,pair.sourceL2].map(ref => JSON.parse(fs.readFileSync(path.join(repository,ref.file),'utf8')));
    const dialogues = documents.map((doc,i) => doc.dialogues.find(dialogue => dialogue.id === [pair.sourceL1,pair.sourceL2][i].dialogueId));
    assert(dialogues.every(Boolean),'Source dialogues exist for ' + pair.id);
    const compare = (item,dialogue) => {
      const original = dialogue.turns[item.turnIndex];
      assert(original,'Source turn exists for ' + pair.id);
      for (const key of ['speaker','study','phon','native','reading']) assert.equal(item[key],original[key],pair.id + ': exact source ' + key);
      if (dialogue.roles) assert.equal(item.role,dialogue.roles[item.speaker],pair.id + ': original named role');
      checkedTurns++;
    };
    compare(pair.l1,dialogues[0]);
    compare(pair.previewContext,dialogues[1]);
    assert.equal(pair.previewContext.turnIndex,0);
    assert.deepEqual(pair.preview.map(turn=>turn.turnIndex),[1,2]);
    assert.deepEqual(pair.preview.map(turn=>turn.speaker),['B','A']);
    pair.preview.forEach(item=>compare(item,dialogues[1]));
    assert.equal(pair.l1Dialogue.turns.length,dialogues[0].turns.length);
    pair.l1Dialogue.turns.forEach(item=>compare(item,dialogues[0]));
  }
  return checkedTurns;
}

async function noHorizontalOverflow(page, context) {
  const dimensions = await page.evaluate(() => ({
    width:innerWidth,
    document:document.documentElement.scrollWidth,
    body:document.body.scrollWidth,
    dialogs:Array.from(document.querySelectorAll('dialog[open],[role=dialog]')).filter(node => node.getBoundingClientRect().width).map(node => ({left:node.getBoundingClientRect().left,right:node.getBoundingClientRect().right}))
  }));
  assert(dimensions.document <= dimensions.width + 1, context + ': document horizontal overflow');
  assert(dimensions.body <= dimensions.width + 1, context + ': body horizontal overflow');
  for (const box of dimensions.dialogs) assert(box.left >= -1 && box.right <= dimensions.width + 1, context + ': dialog exceeds viewport');
}

async function reachable(page, selector, label) {
  const node = page.locator(selector);
  await node.scrollIntoViewIfNeeded();
  assert(await node.isVisible(), label + ' must remain visible');
  const box = await node.boundingBox();
  assert(box && box.width >= 32 && box.height >= 32, label + ' needs a usable touch target');
  const viewport = page.viewportSize();
  assert(box.x >= -1 && box.x + box.width <= viewport.width + 1 && box.y >= -1 && box.y + box.height <= viewport.height + 1, label + ' must be reachable within viewport');
}

(async () => {
  let browser;
  try {
    assert(fs.existsSync(path.join(__dirname, 'index.html')), 'Wait for the mockup before running this verification.');
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const origin = 'http://127.0.0.1:' + server.address().port;
    fs.mkdirSync(captures, {recursive:true});
    browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',headless:true,args:['--no-sandbox']});
    const mutations = [], unexpectedErrors = [], audio = [];
    let checkedSourceTurns = 0;
    for (const viewport of [{width:390,height:844},{width:320,height:568},{width:1440,height:900}]) {
      const context = await browser.newContext({viewport,deviceScaleFactor:1,reducedMotion:'reduce'});
      const page = await context.newPage();
      page.on('pageerror', error => unexpectedErrors.push(String(error)));
      await page.exposeFunction('__recordDemoSpeech', item => audio.push(item));
      await page.addInitScript(() => {
        const speech = {
          getVoices:() => [], cancel:() => {}, pause:() => {}, resume:() => {},
          speak:utterance => {
            window.__demoSpoken = {text:utterance.text,lang:utterance.lang};
            window.__recordDemoSpeech(window.__demoSpoken);
            setTimeout(() => { if (utterance.onstart) utterance.onstart(); if (utterance.onend) utterance.onend(); },0);
          }, addEventListener:() => {}, removeEventListener:() => {}
        };
        try { Object.defineProperty(window,'speechSynthesis',{value:speech,configurable:true}); } catch (_) {}
        HTMLMediaElement.prototype.play = function () { window.__recordDemoSpeech({src:this.src}); return Promise.resolve(); };
      });
      await page.route('**/*', async route => {
        const request = route.request(), url = request.url();
        if (!['GET','HEAD'].includes(request.method()) || /create-payment|payment_links|verify-google-play|\/purchase|\/checkout/.test(url)) mutations.push({method:request.method(),url});
        if (url.startsWith(origin + '/') || url.startsWith('data:') || url.startsWith('blob:')) await route.continue();
        else await route.abort();
      });
      await page.goto(origin + prefix, {waitUntil:'networkidle'});
      const demo = await page.evaluate(() => window.PREMIUM_DEMO);
      checkedSourceTurns = verifySourceData(demo);
      const initialRights = await page.evaluate(() => ({isPaid:typeof window.isPaid,storage:Object.fromEntries(Object.entries(localStorage))}));
      assert.equal(initialRights.isPaid,'undefined','Isolated mockup must not assign isPaid');
      await noHorizontalOverflow(page,'module ' + viewport.width);
      const pairs = await page.locator('#pairSelect option').evaluateAll(nodes => nodes.map(node => ({value:node.value,text:node.textContent})));
      assert.equal(pairs.length,7,'Mockup must expose the seven reviewed language pairs');
      const surfaces = await page.locator('#surfaceSelect option').evaluateAll(nodes => nodes.map(node => node.value));
      assert(surfaces.includes('web') && surfaces.includes('native'),'Both web and native mockups are required');
      await page.selectOption('#surfaceSelect','web');
      for (const pair of pairs) {
        await page.selectOption('#pairSelect',pair.value);
        const body = normalize(await page.locator('body').innerText());
        const matches = sourceEntries(pair.value).filter(entry => ['study','phon','native'].every(field => entry[field] && body.includes(normalize(entry[field]))));
        assert(matches.length > 0,'Visible study phrase / phonetics / translation must form an exact source entry for ' + pair.value);
        const expected = demo.pairs.find(item=>item.id===pair.value);
        assert.equal(normalize(await page.locator('#knownStudy').innerText()),normalize(expected.l1.study));
        assert.equal(normalize(await page.locator('#knownNative').innerText()),normalize(expected.l1.native));
        assert(normalize(await page.locator('#sceneContext').innerText()).includes(normalize(expected.previewContext.native)),'Opening context must prepare the received turn');
        for (const [index,tab] of ['#receivedTab','#replyTab'].entries()) {
          await page.click(tab);
          const item = expected.preview[index];
          for (const [selector,key] of [['#previewStudy','study'],['#previewPhon','phon'],['#previewNative','native']]) assert.equal(normalize(await page.locator(selector).innerText()),normalize(item[key]),pair.value + ': visible exact ' + key);
          if (item.reading) assert.equal(normalize(await page.locator('#previewReading').innerText()),normalize(item.reading));
          else assert(!(await page.locator('#previewReading').isVisible()));
          await reachable(page,'#previewListen','Audio preview');
          await page.click('#previewListen');
          assert.equal(await page.evaluate(()=>window.__demoSpoken.text),item.study,'Audio uses original studied phrase');
          await noHorizontalOverflow(page,'pair ' + pair.value + ' ' + viewport.width);
        }
      }
      await page.selectOption('#pairSelect',pairs[0].value);
      await page.locator('#premiumOpen').scrollIntoViewIfNeeded();
      await page.evaluate(() => window.scrollTo(0,0));
      if (viewport.width !== 320) await page.screenshot({path:path.join(captures, viewport.width < 1024 ? 'phone-module.png' : 'desktop-module.png'),fullPage:false});
      await reachable(page,'#premiumOpen','Premium offer');
      await page.click('#premiumOpen');
      assert(await page.locator('#offerPanel').isVisible(),'Offer must open');
      await noHorizontalOverflow(page,'offer ' + viewport.width);
      const webOffer = normalize(await page.locator('#offerPanel').innerText());
      assert(/7[,.]90/.test(webOffer) && /42(?:[,.]00)?/.test(webOffer),'Web demo must retain €7.90 / €42 source prices');
      assert(/paiement unique/i.test(webOffer),'Web plans must clearly identify a one-time payment');
      assert(webOffer.includes('30 jours') && webOffer.includes('365 jours'),'Web access periods stay explicit');
      assert(!/7\s*jours?\s*(?:offerts?|gratuits?)/i.test(webOffer),'No unsupported free trial promise');
      await page.evaluate(() => { window.scrollTo(0,0); const panel=document.getElementById('offerPanel'); panel.scrollTop=0; const content=panel.querySelector('.offer-content'); if(content) content.scrollTop=0; });
      if (viewport.width < 1024) {
        const bounds = await page.locator('#offerPanel').evaluate(panel => ({top:panel.getBoundingClientRect().top,bottom:panel.getBoundingClientRect().bottom,height:innerHeight}));
        assert(Math.abs(bounds.top) <= 1,'Mobile offer must start at the viewport top');
        assert(Math.abs(bounds.bottom - bounds.height) <= 1,'Mobile offer must cover the viewport bottom');
      }
      assert.equal(await page.locator('[data-plan][aria-pressed="true"]').count(),0,'Initial offer capture must precede plan selection');
      if (viewport.width !== 320) await page.screenshot({path:path.join(captures, viewport.width < 1024 ? 'phone-offer.png' : 'desktop-offer.png'),fullPage:false});
      for (const plan of ['monthly','annual']) {
        await reachable(page,`[data-plan="${plan}"]`,plan + ' plan');
        await page.click(`[data-plan="${plan}"]`);
      }
      await page.keyboard.press('Escape');
      assert(!(await page.locator('#offerPanel').isVisible()),'Escape must close the offer');
      assert.equal(await page.evaluate(() => document.activeElement.id),'premiumOpen','Escape should restore trigger focus');
      await page.selectOption('#surfaceSelect','native');
      await page.click('#premiumOpen');
      const nativeOffer = normalize(await page.locator('#offerPanel').innerText());
      assert(/Google\s*Play/i.test(nativeOffer),'Native offer must identify Google Play');
      assert(!/7[,.]90|42\s*€|7\s*jours?\s*(?:offerts?|gratuits?)/i.test(nativeOffer),'Native mockup must not invent a price or trial');
      await reachable(page,'#storeContinue','Google Play demonstration');
      await page.click('#storeContinue');
      assert(/Aucun achat dans cette maquette/i.test(await page.locator('#demoChoice').innerText()),'Native demo must not imitate a completed purchase');
      const afterNativeAction = await page.evaluate(() => ({isPaid:typeof window.isPaid,storage:Object.fromEntries(Object.entries(localStorage))}));
      assert.deepEqual(afterNativeAction,initialRights,'Demo must not write entitlement state or local storage');
      if (await page.locator('#offerPanel').isVisible()) await page.click('#offerBack');
      await page.selectOption('#surfaceSelect','web');
      await page.click('#premiumOpen');
      await reachable(page,'#offerFree','Free route from offer');
      await page.click('#offerFree');
      assert(await page.locator('#freePage').isVisible(),'Free route from offer shows L1');
      await page.click('#returnPreview');
      await reachable(page,'#continueFree','Continue free');
      await page.click('#continueFree');
      await reachable(page,'#returnPreview','Return from free lesson');
      await page.click('#returnPreview');
      assert(await page.locator('#premiumOpen').isVisible(),'Return should restore the preview module');
      assert.equal(await page.evaluate(()=>document.activeElement.id),'premiumOpen','Returning from free learning restores Premium trigger focus');
      assert.deepEqual(await page.evaluate(() => ({isPaid:typeof window.isPaid,storage:Object.fromEntries(Object.entries(localStorage))})),initialRights,'Free route must not change entitlement state');
      await noHorizontalOverflow(page,'returned module ' + viewport.width);
      await context.close();
    }
    assert.equal(mutations.length,0,'No purchase or write request may be attempted: ' + JSON.stringify(mutations));
    assert.equal(unexpectedErrors.length,0,'No JavaScript errors: ' + JSON.stringify(unexpectedErrors));
    assert(audio.length >= 42,'Audio preview actions should reach the browser speech/audio mechanism');
    console.log('PASS: 7 pairs, 3 viewport sizes, exact source entries, web/native pricing separation, free return, keyboard/focus, no rights or payment writes.');
    console.log('Exact data comparisons: ' + checkedSourceTurns + ' source-turn references per run (including recap repetitions).');
    console.log('Screenshots: ' + captures);
  } finally {
    if (browser) await browser.close();
    if (server.listening) await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
