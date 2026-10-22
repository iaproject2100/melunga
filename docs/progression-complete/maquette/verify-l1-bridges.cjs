/* Review-only DOM checks. No publication, storage writes or real audio. */
'use strict';
const { chromium } = require('playwright-core');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), http = require('node:http');
const review = path.resolve(__dirname, '..');
const output = process.env.SCREENSHOT_DIR || '/tmp/melunga-l1-bridge-ui';
const read = name => JSON.parse(fs.readFileSync(path.join(review, name), 'utf8'));
const annex = read('l1-bridges.json'), fragmentBank = read('banks/l1-bridges.json');
const sourceBank = read('banque-phrases.json');
const bank = new Map([...sourceBank.entries, ...fragmentBank.entries].map(entry => [entry.id, entry]));
const languages = { fr:'fr-FR', en:'en-GB', es:'es-ES', it:'it-IT', zh:'zh-CN', ja:'ja-JP', ko:'ko-KR' };
const pairs = ['fr-en','fr-es','fr-it','fr-zh','fr-ja','fr-ko','zh-fr'];
const report = { scope:'review-only-no-publication', viewports:[], errors:[], externalRequests:[], writeRequests:[], audio:'Simulated: exact studied text and language checked; voice quality not evaluated.' };

function expectedPlan(scene, unit) {
  const dialogue = unit ? null : scene.dialogue;
  const steps = unit ? unit.steps : [...dialogue.preparation, ...dialogue.steps];
  return steps.map(step => ({
    kind:step.kind, recall:!!step.hideLearnerModelOnRequest || step.kind === 'reply-without-model', scene:!!step.turns,
    contextReader:unit ? unit.contextReader : '',
    items:(step.utterance ? [step.utterance] : step.turns).map(id => {
      const entry = bank.get(id); assert(entry, 'Missing bank entry '+id);
      const speaker = dialogue?.preparation.find(preparation => preparation.utterance === id)?.speaker;
      return { id, ...entry.copy, nativeLanguage:entry.nativeLanguage, studyLanguage:entry.studyLanguage,
        kind:dialogue && speaker !== dialogue.learnerRole ? 'received' : 'learner', role:dialogue ? dialogue.roles[speaker] : 'Toi' };
    })
  }));
}

async function runPlan(page, expected, label) {
  return page.evaluate(({ expected, label, languages }) => {
    const $ = id => document.getElementById(id);
    const counts = { steps:0, phraseRenders:0, earActivations:0, recalls:0 };
    function check(value, message) { if (!value) throw Error(label+': '+message); }
    function equal(actual, wanted, message) { check(JSON.stringify(actual) === JSON.stringify(wanted), message+' '+JSON.stringify(actual)+' != '+JSON.stringify(wanted)); }
    function verify(items, hidden) {
      const cards = [...$('phrase-list').children]; equal(cards.length, items.length, 'phrase count');
      cards.forEach((card, index) => {
        const item = items[index]; equal(card.dataset.sourceId, item.id, 'exact bank identity'); equal(card.dataset.kind, item.kind, 'source role');
        equal(card.querySelector('.role-label').textContent, item.role, 'named role');
        equal(card.querySelector('.native').textContent, item.native, 'native translation');
        equal(card.querySelector('.native').lang, item.nativeLanguage, 'native language');
        if (hidden && item.kind === 'learner') {
          equal(card.querySelectorAll('.study,.phonetic,.reading,.reading-text,.ear-button').length, 0, 'learner text and aids removed from DOM');
          check(!card.textContent.includes(item.study), 'learner studied answer removed');
        } else {
          equal(card.querySelector('.study').textContent, item.study, 'studied source text');
          equal(card.querySelector('.study').lang, item.studyLanguage, 'studied language');
          equal(card.querySelector('.phonetic').textContent, item.aids.phon, 'exact reader phonetics');
          equal(card.querySelector('.phonetic').lang, item.nativeLanguage, 'phonetic reader');
          equal(card.querySelector('.reading-text')?.textContent || '', item.aids.reading || '', 'exact reading');
          const ear = card.querySelector('.ear-button'), bounds = ear.getBoundingClientRect();
          check(bounds.width >= 44 && bounds.height >= 44, 'ear target at least 44px');
          const before = window.__bridgeAudio.length; ear.click();
          equal(window.__bridgeAudio.slice(before), [{text:item.study,lang:languages[item.studyLanguage]}], 'ear reads only exact studied text');
          counts.earActivations++;
        }
        if (item.kind === 'received') equal(card.querySelector('.received-badge')?.textContent, 'À comprendre', 'received turn remains visible');
        counts.phraseRenders++;
      });
      check(document.documentElement.scrollWidth <= innerWidth+1, 'no horizontal overflow');
      if (hidden) { equal($('source-content').textContent, '', 'source content removed from DOM'); check($('source-details').hidden, 'source details hidden'); }
    }
    function verifyContext(step) {
      equal($('bridge-context').textContent, step.contextReader, 'exact reader context');
      equal($('bridge-context').lang, step.items[0].nativeLanguage, 'context reader language');
      equal($('bridge-context').hidden, !step.contextReader, 'context only visible for bridge units');
      check(!$('bridge-context').querySelector('.study,.phonetic,.reading,.ear-button'), 'context contains no studied answer or audio');
      if (step.contextReader) step.items.forEach(item => check(!step.contextReader.includes(item.study), 'reader context does not reveal the studied answer'));
    }
    expected.forEach((step, index) => {
      equal($('step-count').textContent, 'Étape '+(index+1)+' / '+expected.length, 'step order');
      equal($('intention-choices').children.length, 0, 'no artificial one-choice exercise');
      check($('all-variants').hidden, 'source variants are not grafted into bridge'); check($('transfer-task').hidden, 'source-unit transfer task stays separate');
      check(!$('bridge-lesson-status').hidden, 'review status visible');
      verifyContext(step);
      verify(step.items, false);
      check(/relecture native reste à faire/.test($('source-content').textContent), 'pending native review is explicit');
      if (['ja','ko'].includes(step.items[0].studyLanguage)) check(/sens du refus.*intonation/.test($('source-content').textContent), 'Japanese/Korean meaning and intonation pending');
      if (step.scene) {
        equal(step.items.length, 7, 'split scene has seven turns'); equal(step.items.filter(item => item.kind === 'learner').length, 4, 'four learner utterances');
        const before = window.__bridgeAudio.length; $('scene-audio').click();
        equal(window.__bridgeAudio.slice(before), step.items.map(item => ({text:item.study,lang:languages[item.studyLanguage]})), 'whole scene exact audio order');
        counts.earActivations += step.items.length;
      }
      if (step.recall) {
        check(!$('recall-actions').hidden, 'voluntary recall available'); $('recall-toggle').click();
        equal($('recall-toggle').getAttribute('aria-pressed'), 'true', 'model hidden on request'); verify(step.items, true);
        verifyContext(step);
        if (step.scene) { check($('scene-audio').disabled, 'scene audio cannot reveal answers'); equal($('phrase-list').querySelectorAll('[data-kind="received"] .study').length, 3, 'three received turns stay visible'); }
        $('recall-toggle').click(); equal($('recall-toggle').getAttribute('aria-pressed'), 'false', 'help restored'); verify(step.items, false); counts.recalls++;
      }
      counts.steps++; equal($('next-step').disabled, index === expected.length-1, 'step boundaries');
      if (index < expected.length-1) $('next-step').click();
    });
    return counts;
  }, { expected, label, languages });
}

(async () => {
  assert.equal(annex.scenes.length, 7); assert.equal(annex.scenes.reduce((sum, scene) => sum+scene.bridgeUnits.length, 0), 14);
  for (const scene of annex.scenes) {
    const dialogue = scene.dialogue, ids = dialogue.steps[0].turns;
    assert.equal(dialogue.preparation.length, 11); assert.equal(ids.length, 7);
    scene.bridgeUnits.forEach(unit => assert(typeof unit.contextReader === 'string' && unit.contextReader, 'Every bridge unit needs a reader context'));
    assert(dialogue.preparation.some(step => step.id === scene.pricePreparation.preparedInStep && step.utterance === scene.pricePreparation.utteranceId));
    assert.equal(ids[5], scene.pricePreparation.utteranceId);
    assert.deepEqual(dialogue.received[1].answerWith.map(answer => answer.utteranceId), [scene.bridgeUnits[1].utteranceId]);
    assert.equal(dialogue.received[2].replyRequired, false); assert.deepEqual(dialogue.received[2].answerWith, []);
  }
  const server = http.createServer((request, response) => {
    let pathname = new URL(request.url, 'http://local').pathname; if (pathname.endsWith('/')) pathname += 'index.html';
    const file = path.resolve(review, '.'+pathname);
    if (!file.startsWith(review+path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { response.writeHead(404).end(); return; }
    response.setHeader('Content-Type', ({'.js':'text/javascript','.css':'text/css','.json':'application/json'})[path.extname(file)] || 'text/html');
    fs.createReadStream(file).pipe(response);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:'+server.address().port;
  let browser;
  try {
    browser = await chromium.launch({ executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium', args:['--no-sandbox'] });
    fs.mkdirSync(output, { recursive:true });
    async function context(viewport) {
      const instance = await browser.newContext({ viewport, reducedMotion:'reduce' });
      await instance.addInitScript(() => {
        window.__bridgeAudio = []; window.__bridgeStorageWrites = [];
        ['setItem','removeItem','clear'].forEach(name => { Storage.prototype[name] = function(...args) { window.__bridgeStorageWrites.push({method:name,key:args[0] || ''}); }; });
        speechSynthesis.cancel = () => {}; speechSynthesis.getVoices = () => [];
        speechSynthesis.speak = utterance => { window.__bridgeAudio.push({text:utterance.text,lang:utterance.lang}); utterance.onend?.(); };
      });
      await instance.route('**/*', route => {
        const request = route.request(), url = new URL(request.url());
        if (!['GET','HEAD'].includes(request.method())) report.writeRequests.push({method:request.method(),path:url.pathname});
        if (url.origin !== base) { report.externalRequests.push(url.origin+url.pathname); return route.abort(); }
        return route.continue();
      });
      return instance;
    }
    for (const [width, height] of [[320,568],[390,844],[1440,900]]) {
      const instance = await context({width,height}), page = await instance.newPage(); page.on('pageerror', error => report.errors.push(error.message));
      await page.goto(base+'/maquette/'); await page.waitForSelector('.bridge-unit-choice');
      const result = {width,height,units:0,scenes:0,steps:0,phraseRenders:0,earActivations:0,recalls:0};
      for (const pair of pairs) {
        const scene = annex.scenes.find(scene => scene.nativeLanguage+'-'+scene.studyLanguage === pair); assert(scene);
        await page.locator('.language-button[data-pair="'+pair+'"]').click();
        await page.waitForFunction(pair => !document.getElementById('workspace').hidden && document.querySelector('.language-button[aria-pressed="true"]')?.dataset.pair === pair && document.querySelectorAll('.bridge-unit-choice').length === 2, pair);
        assert.equal(await page.locator('.unit-choice').count(), 3); assert.equal(await page.locator('.dialogue-choice').count(), 3);
        for (const unit of scene.bridgeUnits) {
          await page.locator('.bridge-unit-choice[data-unit-id="'+unit.unitId+'"]').focus(); await page.keyboard.press('Enter');
          const counts = await runPlan(page, expectedPlan(scene, unit), pair+' '+unit.unitId); for (const key of Object.keys(counts)) result[key] += counts[key]; result.units++;
        }
        await page.locator('.bridge-scene-choice').click();
        const counts = await runPlan(page, expectedPlan(scene), pair+' scene'); for (const key of Object.keys(counts)) result[key] += counts[key]; result.scenes++;
        if (pair === 'fr-ko') {
          await page.locator('#recall-toggle').click(); await page.screenshot({path:path.join(output,'fr-ko-scene-recall-'+width+'x'+height+'.png'),fullPage:true}); await page.locator('#recall-toggle').click();
        }
        await page.locator('#leave-dialogue').click(); assert.equal(await page.locator('#bridge-lesson-status').isVisible(), false);
        assert.equal(await page.locator('#bridge-context').isVisible(), false); assert.equal(await page.locator('#bridge-context').textContent(), '');
        await page.locator('#dialogue-picker').evaluate(element => {element.open=true;}); await page.locator('.dialogue-choice').first().click();
        const original = read('sequences/seq-'+pair+'.json').levels.find(level => level.sourceLevel === 1).dialogues[0];
        assert.equal(await page.locator('#step-count').textContent(), 'Étape 1 / '+(original.preparation.length+original.steps.length));
        assert.equal(await page.locator('#bridge-lesson-status').isVisible(), false);
      }
      await page.locator('.level-button[data-level="2"]').click(); await page.waitForFunction(() => !document.getElementById('workspace').hidden && document.getElementById('level-label').textContent.endsWith('L2'));
      assert.equal(await page.locator('#bridge-section').isVisible(), false); assert.equal(await page.locator('.unit-choice').count(), 3);
      assert.equal(await page.locator('#bridge-context').isVisible(), false); assert.equal(await page.locator('#bridge-context').textContent(), '');
      assert.deepEqual(await page.evaluate(() => window.__bridgeStorageWrites), []);
      report.viewports.push(result); await instance.close();
    }
    const fallbackContext = await context({width:320,height:568}), fallback = await fallbackContext.newPage();
    await fallback.route('**/l1-bridges.json', route => route.fulfill({status:404,body:''}));
    await fallback.goto(base+'/maquette/'); await fallback.waitForFunction(() => !document.getElementById('workspace').hidden && /n’a pas pu/.test(document.getElementById('bridge-status').textContent));
    assert.equal(await fallback.locator('#empty-state').isVisible(), false); assert.equal(await fallback.locator('.unit-choice').count(), 3);
    await fallback.locator('#next-step').click(); assert.equal(await fallback.locator('#phase-label').textContent(), 'Imiter');
    report.missingAnnexPreservesLessons = true; await fallbackContext.close();
    const bundleContext = await context({width:390,height:844}), bundlePage = await bundleContext.newPage(); let unexpectedJson = 0;
    await bundleContext.addInitScript(bundle => { window.MELUNGA_PROGRESS_REVIEW = bundle; }, { selection:read('selection-guidee-enrichie.json'), bank:sourceBank, bridges:annex, bridgeBank:fragmentBank, sequences:Object.fromEntries(pairs.map(pair => [pair, read('sequences/seq-'+pair+'.json')])) });
    await bundlePage.route('**/*.json', route => {unexpectedJson++; return route.abort();});
    await bundlePage.goto(base+'/maquette/'); await bundlePage.waitForSelector('.bridge-scene-choice'); await bundlePage.locator('.bridge-unit-choice').last().click();
    assert.equal(await bundlePage.locator('#phrase-list .study').textContent(), bank.get(annex.scenes.find(scene => scene.studyLanguage === 'es').bridgeUnits[1].utteranceId).copy.study);
    assert.equal(unexpectedJson, 0); report.bundledAnnexSupported = true; await bundleContext.close();
    assert.deepEqual(report.errors, []); assert.deepEqual(report.externalRequests, []); assert.deepEqual(report.writeRequests, []);
    fs.writeFileSync(path.join(output, 'verification.json'), JSON.stringify(report, null, 2)+'\n');
    process.stdout.write(JSON.stringify(report, null, 2)+'\n');
  } finally { if (browser) await browser.close(); server.close(); }
})().catch(error => { process.stderr.write(error.stack+'\n'); process.exitCode=1; });
