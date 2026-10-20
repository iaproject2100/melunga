# Plan d'intégration — contenus de conversation L1–L10 dans « Mes phrases »

Proposition soumise à Codex. Branche dédiée `feat/conversation-integration` (issue de `feat/mode-construire` + PR #6). Rien n'est fusionné ni déployé avant validation.

## Objectif
Faire tourner le mode « Mes phrases » (3 étapes actuelles : exemple → remplacer → essayer de mémoire) sur les 70 fichiers `content/conversation/L<n>-<nat>-<étude>.json`, pour les 7 langues étudiées, au lieu des données espagnoles embarquées dans `construire.js`. Ajouter l'étape « converser » (dialogues). Même interface, même pastille sur la carte de leçon.

## Principes
1. **Les phrases complètes font autorité** : l'interface affiche `variants[i].study / phon / native / reading`, jamais le gabarit `{s}` rempli. Le gabarit sert uniquement à souligner le morceau remplaçable (`slot.study` cherché dans `study`).
2. **Chargement à la demande** : un fichier par niveau et par couple de langues (`fetch` de `content/conversation/L<n>-<nat>-<étude>.json`), mis en cache en mémoire ; rien d'embarqué dans `app.html`. Dans l'APK, URL absolue vers melunga.com comme pour le TTS (`mobile-runtime.js`).
3. **Un seul format en mémoire** : le chargeur applique la correspondance de `adapt.py` si un fichier `version: 1` (es/pf/fr) est rencontré — `conversation-fr-es.json` reste lisible sans conversion sur disque.
4. **Aucune promesse de couverture** dans l'interface ; les `reuses` ne servent ni à évaluer ni à débloquer tant qu'ils ne sont pas vérifiés.
5. **Couples de langues disponibles** : `fr→es/en/zh/it/ja/ko` et `zh→fr`. La pastille n'apparaît que si un fichier existe pour le couple (nat, lang) courant ; sinon rien ne change pour l'utilisateur.

## Découpage (petits lots, chacun testable seul)
| Lot | Contenu | Qui | Vérification |
|---|---|---|---|
| A | `conversation-loader.js` : `loadLevel(nat, study, n)` → objet normalisé (v2 natif, v1 converti), cache, URL absolue sur APK, erreurs silencieuses (pastille masquée) | Claude | test Playwright : 7 couples × L1 chargés, un fichier v1 converti identique à `adapt.py` |
| B | `construire.js` : remplacer `CONSTRUIRE[lang]` par le chargeur ; étape 1 = choix du niveau (1–10, débloqués tous pour l'instant) puis du modèle (situation + exemple) ; étape 2 = variantes (morceau souligné, écoute `speak(study)`) ; étape 3 = rappel (traduction affichée, phrase cachée puis révélée) | Codex (UI) + Claude (branchement données) | test Playwright existant adapté : es, puis ja (reading), puis zh→fr (nat = zh) |
| C | Étape 4 « converser » : dialogue à deux rôles, masquer un rôle, écoute par réplique, `reading` affiché pour zh/ja/ko | Codex | test : 3 dialogues L1-fr-es, Escape/retour, swipe bloqué |
| D | Libellés UI 7 langues maternelles (`UI[nat]`) : niveau, situation, converser, « à moi d'essayer », « une autre » ; `reading` nommé « pinyin / kana / romanisation » selon la langue | Claude | revue des 7 blocs |
| E | Progression locale : dernier niveau/modèle vu par couple de langues (`localStorage`), sans déblocage conditionnel | Codex | test : reprise après rechargement |
| F | Mention du statut de relecture dans l'écran (« contenu en relecture linguistique ») pour zh/ja/ko et zh→fr, tant que `reviewStatus` l'indique | Claude | affichage conditionnel |

## Hors périmètre de cette étape
Évaluation des acquis, déblocage par niveau, exercices notés, autres langues maternelles (en, es, zh lecteurs d'autres langues), Google Play / facturation.

## Risques et garde-fous
- Poids : 70 fichiers ≈ 1,2 Mo au total, ~15–20 Ko chacun → chargement par niveau, pas de préchargement global.
- Audio : `speak(text)` reçoit toujours `study` (jamais `phon`) ; pour zh, le TTS reçoit les caractères, pas le pinyin.
- Régression du mode actuel : `construire.js` garde l'ancien chemin tant que le chargeur ne répond pas (bascule par constante `USE_CONVERSATION_FILES`), retirée au lot final.
- Tests : `validate.py` reste la porte d'entrée des contenus ; les tests Playwright existants (`construire.js`, `lesson-shot.js`) sont adaptés et non supprimés.

## Ordre proposé
A → B (es seul) → D → B (7 couples) → C → E → F → revue croisée Codex/Claude → PR unique vers `feat/mode-construire`.
