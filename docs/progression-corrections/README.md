# Correction proposée du parcours L1–L10

Cette branche de revue reprend l’audit `bcd108d` pour **changer concrètement l’ordre des unités proposées**, dans les sept couples actifs : français vers anglais, espagnol, italien, chinois, japonais et coréen ; chinois vers français. Elle ne modifie ni `main`, ni le site public, ni l’intégration L1 relue dans `939b82e`.

La proposition couvre les **841 unités et leurs 3 364 variantes entières**, réparties dans les 70 cases langue/niveau. Elle propose **122 déplacements**, **319 premières comparaisons ciblées** et **522 unités préparées comme expressions entières**. Les décisions sont consignées unité par unité, avec leur opération principale, leur niveau source, leur nouveau placement proposé, leur ordre, leurs prérequis éditoriaux et les difficultés encore à préparer.

La [suite à la relecture corrigée de Claude](suivi-relecture/README.md) examine maintenant la nouveauté en espagnol et en français pour sinophones. **29 lignes éditoriales sont amendées**, avec des découvertes réordonnées, des reprises mieux reliées et des limites explicites. Aucun déplacement de niveau supplémentaire n’est ajouté ; le grief sur l’italien et les marches de longueur anglais/coréen a été retiré. Les mesures de formes inédites, leur périmètre et leurs limites sont reproductibles ; aucune baisse nouvelle de ces ratios n’est revendiquée pour les amendements internes aux niveaux.

## Les changements à examiner

- Les énoncés simples de vie quotidienne peuvent précéder les questions qui les réutilisent. Une unité n’est pas conservée tard uniquement parce que son fichier porte ce numéro.
- Les constructions multiples de L7 et les demandes plus simples de L8 sont redistribuées selon leurs dépendances, et non par longueur de phrase ou par permutation générale des deux niveaux.
- Chaque variante entière est présentée et proposée à l’imitation avant qu’elle entre dans un choix. Une comparaison de remplacement n’est proposée que pour une paire déclarée précisément ; les séries hétérogènes restent des expressions à préparer séparément.
- Tous les autres exemples sont conservés. Changer le point de départ ou le placement ne supprime aucune variante.

Le [rapport de classement](corrections.md) détaille les déplacements et les raisons. Les quatre fichiers `editorial-*.json` constituent les décisions à relire ; le [paquet de parcours](parcours-corriges.json) et le rapport sont générés à partir de ces décisions et des sources immuables.

## Essayer la proposition

La [maquette](maquette/index.html) permet de parcourir toutes les unités dans l’ordre proposé, et pas seulement trois exemples par niveau. Elle conserve les phrases, leur sens, les phonétiques et les lectures présentes. L’oreille lit le texte étudié ; pendant le rappel, un appui explicite retrouve le modèle puis l’écoute. Les consignes du lecteur sinophone sont en chinois.

Servir la racine du dépôt avec un serveur HTTP local, puis ouvrir `docs/progression-corrections/maquette/`. Ouvrir le fichier HTML directement ne suffit pas pour charger les données. Aucun nouvel aperçu Netlify n’est publié dans ce lot.

Les repères éditoriaux indiquent le niveau source et le placement proposé. Ils ne constituent pas des règles de grammaire à apprendre avant de parler. L’activité part toujours d’une phrase entière située, puis de son réemploi.

## Ce que signifie « préparé »

Le [repère de méthode](element-prepare.md) distingue réception globale, phrase entière proposée à l’imitation, groupe réemployé et opération de construction. Les liens entre unités indiquent un ordre de travail prévu ; ils ne prouvent pas ce qu’une personne sait. Dans chaque unité, les références `preparedChoices` indiquent les étapes précises où les phrases choisies ont été présentées et proposées à l’imitation.

La conservation du cadre écrit est contrôlable. Elle ne suffit pas à garantir qu’un remplacement ne cache aucune nouvelle opération linguistique : c’est un objet de la revue croisée, avec les raisons et réserves de chaque décision.

## Sources, accès et périmètre

Les 110 fichiers conversation et l’application source de `bcd108d` sont protégés contre toute modification. Aucune phrase, traduction, phonétique, romanisation, lecture ou ponctuation source n’est corrigée ou normalisée. Aucun énoncé n’est produit en collant un modèle et un morceau de phrase, ni en assemblant des aides phonétiques.

L1 conserve ses unités sources ; aucune unité payante n’est introduite dans L1 et aucune unité L1 n’en sort. Les déplacements proposés portent sur les niveaux 2–10. Les numéros des fichiers, les identifiants et les règles d’accès existantes ne sont pas réécrits. Les quatre couples en réserve ne sont pas activés.

Le catalogue classique de 32 115 entrées et les anciennes familles restent inchangés. **Ce lot reclasse les unités conversation du parcours proposé ; il ne prétend pas avoir reclassé les 32 115 cartes du catalogue.** Les dialogues ne sont pas automatiquement déplacés avec ces unités : leur pertinence et leur préparation restent à relire, notamment en cas de décalage entre niveau source et placement proposé. Les sept scènes d’entrée L1 relues séparément ne sont pas remplacées par les anciens dialogues.

Les ambiguïtés de registre de `L1-fr-ja-03` et `L1-fr-ko-03`, ainsi que les conventions phonétiques chinoises divergentes, sont signalées sans modification. Le taux lexical relevé en italien L8 reste un indicateur de corpus ; une nouvelle référence de prérequis ne permet pas de le déclarer résolu.

## Reproduire les contrôles

```sh
python3 -B tools/pedagogy/build_progression_corrections.py --check
python3 -B -m unittest discover -s tools/pedagogy -p 'test_progression_corrections.py'
python3 -B -m unittest discover -s tools/pedagogy -p 'test_reclassement*.py'
python3 -B tools/pedagogy/guard_phonetics.py --check
NODE_PATH=/tmp/melunga-review-tools/node_modules node docs/progression-corrections/maquette/verify.cjs
```

Les [résultats et captures](validation.md) sont joints. Les **56 tests Python** vérifient intégrité, couverture, ordre des références, aides, décisions ciblées et reproductibilité des métriques ; ils ne mesurent ni compréhension réelle ni acquisition, et ne constituent pas une relecture native. Le rapport navigateur et ses captures sont liés par empreinte au paquet affiché.

Un fichier HTML autonome peut aussi être exporté avec `tools/pedagogy/export_progression_corrections.py`, pour consulter la maquette sans charger d’autres fichiers. Il est vérifié par HTTP local ; les limites du test d’ouverture directe sont précisées dans le compte rendu.

## Revue et publication

Cette branche est issue de l’audit et de ses maquettes, **pas une branche de livraison à fusionner directement dans `main`**. Les nouveaux changements sont limités au dossier de revue et aux outils qui le génèrent et le vérifient. Les sources produit restent inchangées. Une intégration du parcours corrigé dans l’application fera l’objet d’un lot distinct après relecture.

La prochaine revue de Claude doit porter sur les placements précis, la pertinence des prérequis, les comparaisons déclarées et les difficultés laissées explicites. Le but reste de comprendre, imiter, varier et combiner progressivement pour parler, avec une réussite utile dans une situation. La relecture linguistique et les essais avec apprenants restent nécessaires avant de présenter cette proposition comme une progression validée.
