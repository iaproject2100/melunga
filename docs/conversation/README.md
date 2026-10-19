# Contenus de conversation — niveaux 1 à 10, 7 langues

État : **matrice des 10 niveaux + échantillon L1 pour chaque langue étudiée, à valider avant production complète.**
Aucune modification de l'interface ni des données existantes (`conversation-fr-es.json` de Codex est conservé tel quel).

## Fichiers
- `melunga_deploy/content/conversation/matrix.json` — matrice des 10 niveaux (objectif, fonctions, situations, structures par langue, réutilisation, parcours d'exercices, minimums). Lisible : `docs/conversation/matrice-niveaux.md`.
- `melunga_deploy/content/conversation/L1-<maternelle>-<étudiée>.json` — échantillon L1 : `L1-fr-es`, `L1-fr-en`, `L1-fr-zh`, `L1-fr-it`, `L1-fr-ja`, `L1-fr-ko` (lecteurs francophones) et `L1-zh-fr` (français pour sinophones, aide de prononciation en caractères chinois comme dans le deck existant). Lisible : `docs/conversation/echantillon-L1.md`.
- `validate.py` — vérifie champs manquants, `{s}` résiduels, identifiants en double, références, minimums. `conv_matrix.py` / `conv_L1.py` — générateurs (sources des fichiers JSON).

## Schéma (générique, une entrée = `{study, phon, native[, reading]}`)
- `study` : phrase dans la langue étudiée · `native` : traduction dans la langue maternelle · `phon` : prononciation écrite **pour le lecteur de la langue maternelle** (jamais la phonétique « francophone » réutilisée pour un autre public) · `reading` : aide de lecture propre à la langue étudiée — pinyin avec tons (zh), hiragana (ja), romanisation révisée (ko).
- `units[]` : `id` stable `L<niveau>-<nat>-<étude>-<nn>`, `situation`, `model` (avec `{s}` à l'emplacement remplaçable, éventuellement `note`), `variants[]` (`slot` = le morceau remplacé + phrase complète), `practice` = découvrir (index) → remplacer (index) → rappel sans réponse visible (index).
- `dialogues[]` : `id` `L<niveau>-<nat>-<étude>-d<n>`, 6 à 10 `turns` (A/B), `practice`, `reuses` (modèles réutilisés).
- Racine : `phoneticConvention` (choix documentés), `reviewStatus` (vérifié / relecture requise), `coverageClaim: null` (aucune promesse de « 80 % »), `readiness` (repère pédagogique).
- Compatibilité : mêmes idées que `conversation-fr-es.json` de Codex (`model/variants/slot/practice/dialogue`), avec clés génériques `study/native` au lieu de `es/fr` pour servir les 7 langues.

## Choix linguistiques (L1)
- Pas de grammaire française imposée : ja/ko expriment « j'ai faim/soif/froid » par un adjectif ou un verbe complet (modèle = phrase entière, signalé par `note`) ; zh utilise 了 / 很 ; ko inclut les particules dans le morceau remplaçable ; registre poli partout (es *usted* dans les dialogues, it *Lei*, ja です/ます, ko -요).
- Chinois : mandarin standard, caractères simplifiés, pinyin avec tons dans `reading` ; l'approximation francophone ne note pas les tons.
- Statut : es/en/it rédigés à la main à partir des briques du deck, relecture native conseillée ; zh/ja/ko et zh→fr : **relecture linguistique requise**.

## Suite (après validation)
Production L2–L10 pour les 7 langues selon la matrice, mêmes fichiers `L<n>-<nat>-<étude>.json`, puis autres langues maternelles (en, es, zh… lecteurs) avec des phonétiques dédiées.
