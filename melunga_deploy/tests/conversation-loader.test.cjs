/* Tests simulés du chargeur (Node, sans navigateur) : node melunga_deploy/tests/conversation-loader.test.cjs
   Les essais sur appareil (Capacitor, CORS réel) sont distincts et listés dans docs/conversation/lot-A.md. */
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const ROOT0 = path.join(__dirname, '..');
// Le chargeur est un script navigateur (le package est en "type": "module") : on l'évalue tel quel avec un `module` CommonJS factice.
const CC = (() => { const m = { exports: {} }; new Function('module', 'self', fs.readFileSync(path.join(ROOT0, 'conversation-loader.js'), 'utf8'))(m, undefined); return m.exports; })();
const ROOT = path.join(__dirname, '..');
let failures = 0;
function check(name, ok, extra) { console.log((ok ? '  ✔ ' : '  ✘ ') + name + (extra && !ok ? ' — ' + extra : '')); if (!ok) failures++; }
function fileFetch(opts = {}) {
  const calls = [];
  const f = async (url) => {
    calls.push(url);
    if (opts.fail) throw new Error('réseau coupé');
    const rel = url.replace(/^https?:\/\/[^/]+\//, '').replace(/^\//, '');
    const p = path.join(ROOT, rel);
    if (opts.override && opts.override[rel]) return { ok: true, status: 200, json: async () => opts.override[rel] };
    if (!fs.existsSync(p)) return { ok: false, status: 404, json: async () => ({}) };
    if (opts.delay && opts.delay[rel]) await new Promise(r => setTimeout(r, opts.delay[rel]));
    return { ok: true, status: 200, json: async () => JSON.parse(fs.readFileSync(p, 'utf8')) };
  };
  f.calls = calls; return f;
}
(async () => {
  console.log('1. Sept couples chargés en L1');
  CC.clearCache(); CC.configure({ fetch: fileFetch(), origin: '' });
  for (const [nat, study] of [['fr', 'es'], ['fr', 'en'], ['fr', 'zh'], ['fr', 'it'], ['fr', 'ja'], ['fr', 'ko'], ['zh', 'fr']]) {
    const r = await CC.loadLevel(nat, study, 1);
    check(`${nat}→${study} L1`, r.status === 'ok' && r.data.units.length >= 10 && r.data.dialogues.length === 3, JSON.stringify(r).slice(0, 160));
    if (r.status === 'ok' && CC.READING[study]) check(`${study} : reading présent`, r.data.units.every(u => u.variants.every(v => v.reading)));
  }
  const all = await CC.loadLevel('fr', 'es', 10); check('fr→es L10', all.status === 'ok');

  console.log('2. Conversion v1 comparée à adapt.py');
  const tmp = fs.mkdtempSync('/tmp/adapt-'); execFileSync('python3', [path.join(ROOT, 'content/conversation/adapt.py'), 'to-generic', path.join(ROOT, 'content/conversation-fr-es.json'), tmp]);
  const v1 = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/conversation-fr-es.json'), 'utf8'));
  const sortKeys = o => Array.isArray(o) ? o.map(sortKeys) : (o && typeof o === 'object') ? Object.fromEntries(Object.keys(o).sort().map(k => [k, sortKeys(o[k])])) : o;
  const strip = d => JSON.stringify(sortKeys({ u: d.units.map(u => ({ id: u.id, m: u.model, v: u.variants.map(v => ({ s: v.study, p: v.phon, n: v.native, slot: v.slot, a: v.assembled === false })) })), d: d.dialogues.map(x => ({ id: x.id, t: x.turns, r: x.reuses })), t: d.title, g: d.goal, l: d.level }));
  for (let n = 1; n <= 6; n++) {
    const js = CC.normalize(v1, n), py = JSON.parse(fs.readFileSync(path.join(tmp, `L${n}-fr-es.json`), 'utf8'));
    check(`L${n} identique à adapt.py (gabarits, phrases, exceptions, reuses)`, strip(js) === strip(py));
  }
  check('niveau absent du fichier v1 → null (rien inventé)', CC.normalize(v1, 7) === null);
  const bano = CC.normalize(v1, 1).units.find(u => u.variants.some(v => /baño/.test(v.study)));
  check('exception préservée : « Où sont les toilettes ? » conservé, marqué assembled:false', bano && bano.variants.some(v => v.native === 'Où sont les toilettes ?' && v.assembled === false));

  console.log('3. Cache par (maternelle, étudiée, niveau)');
  const ff = fileFetch(); CC.clearCache(); CC.configure({ fetch: ff, origin: '' });
  await CC.loadLevel('fr', 'es', 1); const again = await CC.loadLevel('fr', 'es', 1); await CC.loadLevel('fr', 'es', 2); await CC.loadLevel('fr', 'en', 1); await CC.loadLevel('zh', 'fr', 1);
  check('relecture servie depuis le cache', again.fromCache === true);
  check('4 clés distinctes → 4 requêtes', ff.calls.length === 4, ff.calls.length);
  const [p1, p2] = [CC.loadLevel('fr', 'it', 3), CC.loadLevel('fr', 'it', 3)]; await Promise.all([p1, p2]);
  check('requêtes simultanées fusionnées', ff.calls.filter(u => /L3-fr-it/.test(u)).length === 1);

  console.log('4. Panne puis nouvelle tentative');
  const bad = fileFetch({ fail: true }); CC.clearCache(); CC.configure({ fetch: bad, origin: '' });
  const err = await CC.loadLevel('fr', 'es', 1);
  check('panne réseau → status error/network avec retry()', err.status === 'error' && err.kind === 'network' && typeof err.retry === 'function');
  CC.configure({ fetch: fileFetch(), origin: '' }); const ok = await err.retry();
  check('retry() réussit une fois le réseau revenu', ok.status === 'ok' && ok.fromCache === false);
  check('la panne n\'a pas pollué le cache', (await CC.loadLevel('fr', 'es', 1)).fromCache === true);

  console.log('5. Indisponible ≠ panne');
  CC.clearCache(); CC.configure({ fetch: fileFetch(), origin: '' });
  check('couple non publié (en→fr) → unavailable/pair', (await CC.loadLevel('en', 'fr', 1)).reason === 'pair');
  check('niveau 11 → unavailable/level', (await CC.loadLevel('fr', 'es', 11)).reason === 'level');
  check('niveau fractionnaire → unavailable/level', (await CC.loadLevel('fr', 'es', 1.5)).reason === 'level');
  CC.clearCache(); CC.configure({ fetch: async () => ({ ok: false, status: 404, json: async () => ({}) }), origin: '' });
  check('fichier 404 → unavailable/missing (pastille masquée, pas de message)', (await CC.loadLevel('fr', 'es', 1)).reason === 'missing');

  console.log('6. Fichier invalide');
  const good = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/conversation/L1-fr-es.json'), 'utf8'));
  const cases = {
    'mauvais niveau': Object.assign({}, good, { level: 2 }),
    'mauvaises langues': Object.assign({}, good, { studyLanguage: 'en' }),
    'version inconnue': Object.assign({}, good, { version: 3 }),
    'champ manquant (phon)': (() => { const g = JSON.parse(JSON.stringify(good)); g.units[0].variants[0].phon = ''; return g; })(),
    '{s} non remplacé': (() => { const g = JSON.parse(JSON.stringify(good)); g.units[0].variants[0].study = 'Soy {s}.'; return g; })(),
    'reading manquant (zh)': (() => { const z = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/conversation/L1-fr-zh.json'), 'utf8')); delete z.units[0].variants[0].reading; return z; })(),
  };
  for (const [name, doc] of Object.entries(cases)) {
    CC.clearCache(); CC.configure({ fetch: async () => ({ ok: true, status: 200, json: async () => doc }), origin: '' });
    const r = await CC.loadLevel('fr', /zh/.test(name) ? 'zh' : 'es', 1);
    check(`${name} → error/invalid`, r.status === 'error' && r.kind === 'invalid', r.message);
  }

  console.log('7. Changement rapide de langue : la réponse tardive n\'affiche pas l\'ancienne langue');
  CC.clearCache(); CC.configure({ fetch: fileFetch({ delay: { 'content/conversation/L1-fr-es.json': 120 } }), origin: '' });
  const shown = [];
  const a = CC.request('fr', 'es', 1, r => shown.push('es')); const b = CC.request('fr', 'en', 1, r => shown.push('en'));
  await Promise.all([a, b]);
  check('seule la dernière sélection (en) est affichée', shown.join(',') === 'en', shown.join(','));

  console.log('8. Chemin d\'URL natif');
  CC.configure({ origin: null });
  global.location = { hostname: 'localhost', protocol: 'https:' };
  check('Capacitor (https://localhost) → URL absolue melunga.com', CC.levelUrl('fr', 'es', 1) === 'https://melunga.com/content/conversation/L1-fr-es.json', CC.levelUrl('fr', 'es', 1));
  global.location = { hostname: 'melunga.com', protocol: 'https:' };
  check('site (melunga.com) → URL relative', CC.levelUrl('fr', 'ja', 4) === 'content/conversation/L4-fr-ja.json');
  global.location = { hostname: '127.0.0.1', protocol: 'http:' };
  check('http local → URL absolue (même règle que speechSource)', /^https:\/\/melunga\.com\//.test(CC.levelUrl('zh', 'fr', 2)));

  console.log('9. Origine de test explicite (APK d\'essai)');
  CC.configure({ origin: null }); global.MELUNGA_CONTENT_ORIGIN = 'https://deploy-preview-7--chic-dragon-e2baf2.netlify.app'; global.location = { hostname: 'localhost', protocol: 'https:' };
  check('MELUNGA_CONTENT_ORIGIN prime sur la règle native', CC.levelUrl('fr', 'es', 1) === 'https://deploy-preview-7--chic-dragon-e2baf2.netlify.app/content/conversation/L1-fr-es.json', CC.levelUrl('fr', 'es', 1));
  delete global.MELUNGA_CONTENT_ORIGIN;
  console.log(failures ? `\n✘ ${failures} échec(s)` : '\n✔ tous les tests simulés passent');
  process.exit(failures ? 1 : 0);
})();
