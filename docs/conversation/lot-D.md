# Lot D — libellés d'interface en 7 langues maternelles (`melunga_deploy/conversation-labels.js`)

Fichier séparé, chargé dans `app.html` après `conversation-loader.js` et avant `construire.js` ; `construire.js` n'est pas modifié (lot B lit `window.ConversationLabels[nat]` via `BText`, repli sur ses valeurs fr/zh).

## Contenu
- **Clés du contrat lot B**, pour fr, en, es, it, zh, ja, ko : `level, model, loading, error, retry, missing, try, reveal, another, phrase, back, close, step, of, premium, reading, pinyin, kana, romanization`.
- **Clés pour les lots C et F** (dialogues, statut éditorial) : `stepDiscover/stepReplace/stepRecall/stepConverse`, `dialogue, dialogues, turns, hideRole, showAll, roleA, roleB, yourTurn, reuses`, `reviewNotice, phonHint`, `variants, replaced, translation, pronunciation, listen, slow, sayIt, recallPrompt, progress, seen, goal, readiness, offline, done, next`.
- **Titres et objectifs des 10 niveaux** traduits (`levelTitles[]`, `levelGoals[]`) ; noms des 7 langues (`langs`) ; nom de l'aide de lecture par langue étudiée (`reading: {zh, ja, ko}`).
- Aides (non énumérables, ne gênent pas `ConversationLabels[nat]`) : `get(nat)` (repli fr), `fmt(str, {n, total, lang, native})`, `readingLabel(nat, study)`, `levelTitle(nat, n)`, `levelGoal(nat, n)`, `langName(nat, code)`, `LANGS`.

Les situations (`units[].situation`) et `readiness` viennent des fichiers de contenu dans la langue maternelle du couple ; elles ne sont pas traduites ici.

## Vérification
- `node --check` + contrôle Node : 7 langues × toutes les clés présentes, 10 titres / 10 objectifs par langue, `get('xx')` → fr, `fmt` avec gabarits.
- Playwright dans `app.html` (serveur local) : `zh→fr` → panneau « 我的句子 / 级别 / 级别 1 » ; `fr→ja` → « Mes phrases / Niveau » ; aucune erreur JS.
- À faire relire : traductions ja/ko/zh des titres de niveaux (relecture native conseillée, comme les contenus).
