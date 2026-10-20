/* Melunga — chargeur des contenus de conversation (lot A).
   Contrat : window.ConversationContent (navigateur) / module.exports (Node, pour les tests).

   loadLevel(nat, study, level) → Promise<Result>, ne rejette jamais :
     { status:'ok',          data: Level, fromCache: bool }
     { status:'unavailable', reason:'pair'|'level'|'missing' }        → couple ou niveau inexistant : la pastille se masque
     { status:'error',       kind:'network'|'invalid', message, retry() } → panne : message court + « Réessayer »
   request(nat, study, level, cb) → même Result, mais cb n'est appelé que si (nat, study, level) est toujours la
     dernière sélection demandée (une réponse tardive n'affiche jamais l'ancienne langue).
   isPairAvailable(nat, study) → bool (couples publiés) · levelUrl(nat, study, level) → URL effective
   normalize(doc, level) → Level (v2 vérifié, ou v1 converti pour ce niveau ; lève une Error si invalide)
   clearCache() · configure({ fetch, origin }) (tests)

   Level = { version:2, format:'conversation-generic', nativeLanguage, studyLanguage, level, title, goal,
             phoneticConvention, reviewStatus, fields, exercisePath, reviewPreviousLevels, readiness,
             units:[{ id, situation, model:{study,phon,native[,reading][,note]},
                      variants:[{ slot:{study,phon,native[,reading]}, study, phon, native[, reading][, assembled:false] }],
                      practice:{discover, replace[], recall} }],
             dialogues:[{ id, situation, turns:[{speaker, study, phon, native[, reading]}], practice, reuses[] }] }
   Règle : l'interface affiche toujours les phrases complètes (variants[i].*, turns[i].*), jamais le gabarit rempli.
   Le gabarit model.study sert seulement à repérer le morceau remplaçable (slot.study dans study). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ConversationContent = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var FILES_BASE = 'content/conversation/';
  /* Couples publiés (langue maternelle → langues étudiées). Un fichier absent (404) reste traité comme indisponible. */
  var PAIRS = { fr: ['es', 'en', 'zh', 'it', 'ja', 'ko'], zh: ['fr'] };
  var LEVELS = 10;
  var READING = { zh: 'pinyin avec tons', ja: 'lecture en hiragana', ko: 'romanisation révisée' };
  var cfg = { fetch: null, origin: null };
  var cache = Object.create(null);   // clé nat|study|level → Level (seuls les succès sont mis en cache)
  var pending = Object.create(null); // clé → Promise en cours (évite les doubles requêtes)
  var latest = null;                 // dernière sélection demandée via request()

  /* Même règle que speechSource() dans app.html : l'application native (Capacitor) est servie depuis
     https://localhost, une URL relative n'atteindrait jamais le serveur. */
  function origin() {
    if (typeof cfg.origin === 'string') return cfg.origin;
    if (typeof location === 'undefined') return '';
    return (location.hostname === 'localhost' || location.protocol !== 'https:') ? 'https://melunga.com/' : '';
  }
  function key(nat, study, level) { return nat + '|' + study + '|' + level; }
  function isPairAvailable(nat, study) { return !!(PAIRS[nat] && PAIRS[nat].indexOf(study) >= 0); }
  function levelUrl(nat, study, level) { return origin() + FILES_BASE + 'L' + level + '-' + nat + '-' + study + '.json'; }
  function doFetch(url) { return (cfg.fetch || fetch)(url, { cache: 'default', credentials: 'omit' }); }

  /* ---------- vérification du format générique (v2) ---------- */
  function need(cond, msg) { if (!cond) throw new Error(msg); }
  function checkEntry(e, where, reading) {
    need(e && typeof e === 'object', where + ' : entrée absente');
    ['study', 'phon', 'native'].concat(reading ? ['reading'] : []).forEach(function (k) {
      need(typeof e[k] === 'string' && e[k].length, where + ' : champ « ' + k + ' » manquant');
      need(e[k].indexOf('{s}') < 0, where + ' : « {s} » non remplacé dans ' + k);
    });
  }
  function checkV2(doc, nat, study, level) {
    need(doc.format === 'conversation-generic', 'format inattendu : ' + doc.format);
    need(doc.nativeLanguage === nat && doc.studyLanguage === study, 'langues du fichier (' + doc.nativeLanguage + '→' + doc.studyLanguage + ') ≠ demandées (' + nat + '→' + study + ')');
    need(doc.level === level, 'niveau du fichier (' + doc.level + ') ≠ demandé (' + level + ')');
    ['title', 'goal', 'phoneticConvention', 'reviewStatus'].forEach(function (k) { need(typeof doc[k] === 'string', 'champ racine « ' + k + ' » manquant'); });
    need(Array.isArray(doc.units) && doc.units.length, 'aucun modèle');
    need(Array.isArray(doc.dialogues), 'dialogues manquants');
    var reading = !!READING[study];
    doc.units.forEach(function (u, i) {
      var w = 'modèle ' + (u && u.id || i);
      need(u && typeof u.id === 'string', w + ' : identifiant manquant');
      need(u.model && typeof u.model.study === 'string' && u.model.study.indexOf('{s}') >= 0, w + ' : gabarit sans {s}');
      need(Array.isArray(u.variants) && u.variants.length, w + ' : aucune variante');
      u.variants.forEach(function (v, j) {
        checkEntry(v, w + ' variante ' + j, reading); checkEntry(v.slot, w + ' variante ' + j + ' (slot)', reading);
        need(v.study.indexOf(v.slot.study) >= 0, w + ' variante ' + j + ' : le morceau remplacé n\'apparaît pas dans la phrase');
      });
    });
    doc.dialogues.forEach(function (d, i) {
      var w = 'dialogue ' + (d && d.id || i);
      need(d && Array.isArray(d.turns) && d.turns.length, w + ' : répliques manquantes');
      d.turns.forEach(function (t, j) { checkEntry(t, w + ' réplique ' + j, reading); need(t.speaker === 'A' || t.speaker === 'B', w + ' réplique ' + j + ' : speaker invalide'); });
    });
    return doc;
  }

  /* ---------- conversion du format initial (v1 : levels[], clés es/pf/fr, dialogue unique) ---------- */
  var END = /[\s.?!。？！,，、]+$/;
  function norm(x) { return String(x).replace(END, '').toLowerCase(); }
  function isCJK(s) { return /[぀-鿿가-힯]/.test(s); }
  function fill(tpl, s) { return tpl.split('{s}').join(s).replace(/  /g, ' '); }
  function nativeFill(tpl, s, nat) {
    if (nat === 'fr') {
      if (tpl.indexOf(' de {s}') >= 0 && /^[aeiouéèêhAEIOU]/.test(s)) tpl = tpl.replace(' de {s}', " d'{s}");
      if (tpl.indexOf(' que {s}') >= 0 && /^[aeiouéèêhAEIOU]/.test(s)) tpl = tpl.replace(' que {s}', " qu'{s}");
    }
    var out = fill(tpl, s);
    return nat === 'fr' && out ? out.charAt(0).toUpperCase() + out.slice(1) : out;
  }
  /* Modèles réellement réutilisés par un dialogue (heuristique textuelle, même règle que conv_build.py / adapt.py :
     une variante complète, ou tous les fragments fixes du gabarit, apparaissent dans une réplique). À vérifier
     avant tout usage pour évaluer ou débloquer. */
  function findReuses(turns, unitsByLevel, level) {
    var found = [], texts = turns.map(function (t) { return t.study.toLowerCase(); });
    Object.keys(unitsByLevel).map(Number).filter(function (k) { return k <= level; }).sort(function (a, b) { return a - b; }).forEach(function (lv) {
      unitsByLevel[lv].forEach(function (u) {
        var frags = u.model.study.split('{s}').map(norm).filter(function (f) { return f.length >= (isCJK(f) ? 2 : 4); });
        var hit = texts.some(function (tx) {
          return u.variants.some(function (v) { var n = norm(v.study); return n && tx.indexOf(n) >= 0; }) || (frags.length && frags.every(function (f) { return tx.indexOf(f) >= 0; }));
        });
        if (hit && found.indexOf(u.id) < 0) found.push(u.id);
      });
    });
    return found;
  }
  function entryV1(e, nat, study) { return { study: e[study], phon: e.pf, native: e[nat] }; }
  function tplFrom(v, unit, nat, study) {
    var tpl = {};
    [[study, 'study'], ['pf', 'phon'], [nat, 'native']].forEach(function (p) {
      var full = v[p[0]], part = v.slot[p[0]];
      tpl[p[1]] = (part && full.indexOf(part) >= 0) ? full.replace(part, '{s}') : unit.model[p[0]] + ' {s}';
    });
    return tpl;
  }
  function assembles(tpl, v, nat) {
    return ['study', 'phon', 'native'].every(function (k) { return (k === 'native' ? nativeFill(tpl[k], v.slot[k], nat) : fill(tpl[k], v.slot[k])) === v[k]; });
  }
  function convertV1(doc, level) {
    var nat = doc.nativeLanguage, study = doc.studyLanguage;
    need(Array.isArray(doc.levels), 'v1 : levels[] manquant');
    var unitsByLevel = {}, target = null;
    doc.levels.forEach(function (L) {
      var units = L.units.map(function (u, i) {
        var variants = u.variants.map(function (v) { var e = entryV1(v, nat, study); e.slot = entryV1(v.slot, nat, study); return e; });
        var best = null, bestN = -1;
        u.variants.forEach(function (v0) { var t = tplFrom(v0, u, nat, study), n = variants.filter(function (v) { return assembles(t, v, nat); }).length; if (n > bestN) { best = t; bestN = n; } });
        variants.forEach(function (v) { if (!assembles(best, v, nat)) v.assembled = false; }); // exception d'accord / d'élision : la phrase complète fait foi
        return { id: 'L' + L.level + '-' + nat + '-' + study + '-' + String(i + 1).padStart(2, '0'), sourceId: u.id, situation: u.situation || '', model: best, variants: variants,
                 practice: u.practice || { discover: 0, replace: variants.map(function (_, k) { return k; }).slice(1), recall: variants.length - 1 } };
      });
      unitsByLevel[L.level] = units;
      if (L.level !== level) return;
      var dl = L.dialogues || (L.dialogue ? [L.dialogue] : []);
      target = {
        version: 2, format: 'conversation-generic', status: doc.status || 'converti', convertedFrom: 'conversation-v1',
        studyLanguage: study, nativeLanguage: nat,
        fields: { study: 'phrase en ' + study, phon: 'prononciation écrite pour lecteurs ' + nat, native: 'traduction en langue maternelle' },
        phoneticConvention: doc.phoneticConvention || '', reviewStatus: doc.reviewStatus || 'statut du fichier d\'origine', coverageClaim: doc.coverageClaim == null ? null : doc.coverageClaim,
        level: L.level, title: L.title, goal: L.goal, reviewPreviousLevels: L.reviewPreviousLevels || [], exercisePath: ['découvrir', 'remplacer', 'essayer sans réponse visible', 'converser'],
        units: units,
        dialogues: dl.map(function (d, j) {
          var T = d.turns.map(function (t) { var e = entryV1(t, nat, study); e.speaker = t.speaker; return e; });
          return { id: 'L' + L.level + '-' + nat + '-' + study + '-d' + (j + 1), situation: d.situation || '', turns: T, practice: d.practice || '', reuses: findReuses(T, unitsByLevel, L.level) };
        }),
        readiness: L.readiness || ''
      };
      if (!target.reviewPreviousLevels.length) for (var k = 1; k < L.level; k++) target.reviewPreviousLevels.push(k);
    });
    return target; // null si le niveau n'existe pas dans le fichier : rien n'est inventé
  }

  function normalize(doc, level, nat, study) {
    need(doc && typeof doc === 'object', 'contenu non JSON');
    if (doc.version === 1) {
      var conv = convertV1(doc, level);
      if (!conv) return null;
      return checkV2(conv, nat || conv.nativeLanguage, study || conv.studyLanguage, level);
    }
    need(doc.version === 2, 'version inconnue : ' + doc.version);
    return checkV2(doc, nat || doc.nativeLanguage, study || doc.studyLanguage, level);
  }

  /* ---------- chargement ---------- */
  function unavailable(reason) { return { status: 'unavailable', reason: reason }; }
  function loadLevel(nat, study, level) {
    level = Number(level);
    if (!isPairAvailable(nat, study)) return Promise.resolve(unavailable('pair'));
    if (!(level >= 1 && level <= LEVELS)) return Promise.resolve(unavailable('level'));
    var k = key(nat, study, level);
    if (cache[k]) return Promise.resolve({ status: 'ok', data: cache[k], fromCache: true });
    if (pending[k]) return pending[k];
    var url = levelUrl(nat, study, level);
    var p = Promise.resolve().then(function () { return doFetch(url); }).then(function (res) {
      if (res.status === 404) return unavailable('missing');
      if (!res.ok) throw Object.assign(new Error('HTTP ' + res.status), { kind: 'network' });
      return res.json().catch(function () { throw Object.assign(new Error('JSON illisible'), { kind: 'invalid' }); }).then(function (doc) {
        var data;
        try { data = normalize(doc, level, nat, study); } catch (e) { throw Object.assign(e, { kind: 'invalid' }); }
        if (!data) return unavailable('missing');
        cache[k] = data;
        return { status: 'ok', data: data, fromCache: false };
      });
    }).catch(function (e) {
      return { status: 'error', kind: e && e.kind === 'invalid' ? 'invalid' : 'network', message: (e && e.message) || String(e), url: url,
               retry: function () { return loadLevel(nat, study, level); } };
    }).then(function (r) { delete pending[k]; return r; });
    pending[k] = p;
    return p;
  }
  /* Dernière sélection gagnante : cb ignoré si une autre sélection a été demandée entre-temps. */
  function request(nat, study, level, cb) {
    var token = latest = {};
    return loadLevel(nat, study, level).then(function (r) { if (token === latest) cb(r); return r; });
  }
  function clearCache() { cache = Object.create(null); pending = Object.create(null); latest = null; }
  function configure(o) { if (o && 'fetch' in o) cfg.fetch = o.fetch; if (o && 'origin' in o) cfg.origin = o.origin; }

  return { loadLevel: loadLevel, request: request, isPairAvailable: isPairAvailable, levelUrl: levelUrl, normalize: normalize,
           findReuses: findReuses, clearCache: clearCache, configure: configure, PAIRS: PAIRS, LEVELS: LEVELS, READING: READING };
});
