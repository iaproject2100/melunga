# Lot A — chargeur des contenus de conversation (`melunga_deploy/conversation-loader.js`)

Branche `feat/conversation-integration` (= `feat/mode-construire` + PR #6). Aucun changement dans `construire.js` ; `app.html` charge seulement le script avant `construire.js`. Rien de fusionné ni déployé.

## Contrat `window.ConversationContent`

```js
loadLevel(nat, study, level) → Promise<Result>      // ne rejette jamais
request(nat, study, level, cb) → Promise<Result>     // cb(Result) seulement si c'est encore la dernière sélection
isPairAvailable(nat, study) → bool                   // couples publiés : fr→es/en/zh/it/ja/ko, zh→fr
levelUrl(nat, study, level) → string                 // URL effective (absolue sur l'application native)
normalize(doc, level[, nat, study]) → Level | null   // v2 vérifié ; v1 converti pour ce niveau ; Error si invalide ; null si niveau absent
clearCache() · configure({ fetch, origin })          // tests
```

`Result` :
| status | champs | usage dans l'interface |
|---|---|---|
| `ok` | `data: Level`, `fromCache` | afficher |
| `unavailable` | `reason: 'pair' \| 'level' \| 'missing'` (404) | **pastille masquée**, aucun message |
| `error` | `kind: 'network' \| 'invalid'`, `message`, `url`, `retry()` | **message court + « Réessayer »** (`retry()` relance le même chargement) |

`Level` (format générique v2, identique aux fichiers `content/conversation/L<n>-<nat>-<étude>.json`) : `units[]` (`id`, `situation`, `model{study,phon,native[,reading][,note]}`, `variants[]{slot, study, phon, native[, reading][, assembled:false]}`, `practice`), `dialogues[]` (`id`, `situation`, `turns[]{speaker,study,phon,native[,reading]}`, `practice`, `reuses[]`), plus `title`, `goal`, `phoneticConvention`, `reviewStatus`, `fields`, `exercisePath`, `reviewPreviousLevels`, `readiness`.

Règles pour le lot B :
- Afficher toujours les phrases complètes (`variants[i].*`, `turns[i].*`) ; le gabarit `model.study` sert uniquement à souligner `slot.study` dans `study`. Une variante `assembled:false` (fichier v1 converti) ne doit jamais être recomposée.
- `speak()` reçoit `study` (caractères pour zh), jamais `phon` ni `reading`.
- `reading` existe pour zh/ja/ko (libellé via `fields.reading` : pinyin / hiragana / romanisation).
- `reuses` sont heuristiques : ni évaluation ni déblocage.
- `reviewStatus` et `phoneticConvention` sont transmis tels quels (lot F : mention « contenu en relecture »).

## Comportement
- **Indisponible ≠ panne** : couple non publié, niveau hors 1–10 ou fichier 404 → `unavailable` ; réseau, HTTP ≠ 2xx, JSON illisible ou fichier non conforme → `error` avec `retry()`.
- **Cache** par (maternelle, étudiée, niveau), succès uniquement ; requêtes simultanées sur la même clé fusionnées ; une panne ne pollue pas le cache.
- **Réponse tardive** : `request()` applique « dernière sélection gagnante » — un changement de langue pendant un chargement lent n'affiche jamais l'ancienne langue.
- **Vérification des fichiers reçus** : `version` (1 ou 2), `format`, langues et niveau égaux à la demande, champs racine, `{s}` dans chaque gabarit et absent des phrases, `study/phon/native` (+ `reading` pour zh/ja/ko) sur chaque variante, slot et réplique, morceau présent dans la phrase, `speaker` A/B.
- **Conversion v1** (`conversation-fr-es.json`) : mêmes règles que `content/conversation/adapt.py` — phrases complètes, traductions et phonétiques copiées telles quelles, gabarit choisi sur la variante qui en redonne le plus, exceptions marquées `assembled:false`, `reuses` détectés, `sourceId` conservé ; un niveau absent du fichier renvoie `null` → `unavailable`, rien n'est inventé.
- **URL native** : même règle que `speechSource()` dans `app.html` (hôte `localhost` ou protocole ≠ https → `https://melunga.com/…`, sinon URL relative). `netlify.toml` ajoute `Access-Control-Allow-Origin: *` (GET) et un cache d'une heure sur `/content/conversation/*`, nécessaires à l'origine `https://localhost` de Capacitor.

## Tests simulés (passés) — `node melunga_deploy/tests/conversation-loader.test.cjs`
1. Sept couples chargés en L1 (+ `reading` présent pour zh/ja/ko, L10 es).
2. Conversion v1 identique à `adapt.py` sur les 6 niveaux (gabarits, phrases, exceptions, reuses) ; niveau 7 absent → `null` ; « Où sont les toilettes ? » conservé avec `assembled:false`.
3. Cache : relecture depuis le cache, 4 clés → 4 requêtes, requêtes simultanées fusionnées.
4. Panne réseau → `error/network` + `retry()` ; retry réussit ; cache non pollué.
5. Indisponible : couple non publié, niveau 11, fichier 404.
6. Fichier invalide (niveau, langues, version, champ vide, `{s}` résiduel, `reading` manquant) → `error/invalid`.
7. Changement rapide fr→es puis fr→en avec réponse es tardive : seul en est affiché.
8. URL : `https://localhost` → absolue melunga.com ; `melunga.com` → relative ; http local → absolue.

Smoke Playwright dans `app.html` servi en local (scratchpad `pw/loader-smoke.js`) : script présent, es/ja/zh→fr chargés, en→fr indisponible, `openConstruire` et pastille intacts, aucune erreur JS.

## Essais sur appareil (à faire, non simulables ici)
- APK Capacitor : `ConversationContent.loadLevel('fr','es',1)` depuis la console WebView → `ok` ; vérifier l'en-tête `Access-Control-Allow-Origin` réellement servi par Netlify sur `https://melunga.com/content/conversation/L1-fr-es.json` (après déploiement de `netlify.toml`, hors de ce lot).
- Si `mobile-runtime.js` (APK uniquement) réécrit `fetch`, confirmer qu'il laisse passer les URL absolues `https://melunga.com/content/…`.
- Mode avion : `error/network` puis `retry()` au retour du réseau.
