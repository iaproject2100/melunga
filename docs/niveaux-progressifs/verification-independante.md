# Vérification indépendante des niveaux et types de contenu

Le contrôle relit le catalogue, les sept partitions sémantiques, les 70 cellules, les décisions, les instantanés conversation et le registre photo. Il n’importe aucun générateur et ne répare aucune donnée.

## Sources, actifs et réserve

| Couple | Catalogue exact | Imports entiers | Actifs | Réserve | Indices L1 historiques |
|---|---:|---:|---:|---:|---:|
| fr-en | 4502 | 5 | 4382 | 125 | 323 |
| fr-es | 4672 | 7 | 4517 | 162 | 289 |
| fr-it | 4509 | 5 | 4365 | 149 | 338 |
| fr-zh | 4903 | 8 | 4820 | 91 | 314 |
| fr-ja | 4509 | 7 | 4404 | 112 | 290 |
| fr-ko | 4520 | 6 | 4447 | 79 | 287 |
| zh-fr | 4500 | 5 | 4374 | 131 | 293 |

**32 115 cartes classiques** existent exactement une fois, dans les thèmes actifs ou dans la réserve. **110 277 champs** étudiés, natifs, phonétiques et lectures sont identiques aux sources. Les **43 imports entiers / 150 champs** sont identiques aux sept instantanés comparés à leur commit source ; les **13 imports écartés** sont absents.

Le bundle contient **31 309 entrées actives** et **849 réservées**, soit 32 158 sources canoniques. La réserve ne reçoit aucune étape de leçon. Le catalogue classique et ses droits restent accessibles par leur code existant, inchangé.

L’aide francophone provient de pf en anglais/espagnol/italien/japonais/coréen et phf en chinois ; le lecteur sinophone reçoit phon et cn. py sert uniquement de lecture complémentaire quand il existe. Aucun collage ou calcul phonétique n’est autorisé.

## Partition sémantique et entraînement

La partition du catalogue compte **22 323 énoncés**, **8 736 éléments de vocabulaire**, **207 nombres**, **482 formes incomplètes** et **367 réserves de sens**. Chaque indice a exactement une affectation et l’empreinte exacte de son deck.

Les situations ne contiennent que des énoncés ; le vocabulaire et les nombres ont leurs thèmes distincts. Les classes adjective/preposition/adverb ont priorité sur les familles maison/restaurant/etc, sans duplication principale. La correspondance entre annotation et exécution est contrôlée ; l’annotation elle-même reste candidate à une relecture sémantique.

Les **93 957 étapes** se répartissent en **67 128 étapes de situations** et **26 829 étapes lexicales**. Chaque rappel cite une compréhension puis une imitation réellement antérieures dans son groupe. Les sources réservées ne sont jamais référencées par ces étapes.

**11 exceptions nominatives bornées** neutralisent des faux marqueurs de modèle sans toucher à la source (dont an X-ray). Les **349 autres marqueurs de modèle** restent hors production. Une exception contenant un véritable emplacement est refusée.

## Liens prévus : ordre vérifié et limites

Sur **418 liens déclarés**, **295 relient deux énoncés**. Parmi ces derniers, **15** ont une présentation primaire tardive et sont tous préparés localement avant leur cible : **15 références / 14 sources / 30 étapes**, sans deuxième carte principale. Le nombre de liens entre énoncés sans fermeture d’ordre est **0**.

Les **76 liens lexicaux** sont comptés à part ; **56 références** à des mots/nombres d’un niveau égal ou antérieur figurent sur leurs phrases cibles. Ces mots ne sont jamais injectés dans les étapes de situation. Leur présence dans un autre thème ne prouve pas qu’ils ont été étudiés.

**37 liens impliquent une réserve** sur au moins une extrémité ; **10** ont une autre cible non phrastique. **1 phrase active dépend encore d’une source réservée**. La fermeture globale des prérequis est donc explicitement non validée.

- fr-zh : carte 2944 ← 2207 (incomplete) ; source réservée, jamais exercée.

Le seul lien supprimé est fr-zh 245 ← 2168 : 是 signifie dans sa carte source « oui / c’est ça », ce qui ne prépare pas son emploi de copule. La revue originale et l’adjudication restent traçables ; aucun autre lien n’est effacé.

**518 placements** sont proposés individuellement ; les **31 597 autres** restent au niveau source sans validation individuelle revendiquée. Ni une copie exacte, ni une affectation de type, ni un ordre prévu ne démontrent la progressivité L1–L10 ou une acquisition.

## Droits, prix et photos

Les **15 fichiers produit protégés** sont identiques à origin/main (562431e), dont app.html et les fonctions de compte, accès et prix. Les **2 134 indices de source L1** sont conservés. Les nouveaux niveaux éditoriaux doivent rester distincts du lv qui détermine l’accès historique.

**220 emplacements visuels** et **220 cases photo physiques distinctes** sont vérifiés dans **18 atlas**. Les empreintes, octets, dimensions, grilles et coordonnées correspondent au registre. **11 emplacements sont signalés approuvés** et **209 proposés** ; l’adéquation de chaque image reste une question visuelle.

## Reproduire

    python3 -B tools/maquette-guidee/check_levels_independent.py --write-report --require-visuals --strict-editorial
    python3 -B tools/maquette-guidee/check_levels_independent.py --check-report --require-visuals --strict-editorial --self-test

strict-editorial exige ici la fermeture d’ordre des seuls liens énoncé→énoncé. Il ne transforme pas les liens lexicaux ou réservés en acquis. Les dix fautes adverses en mémoire couvrent la phonétique, le niveau, une identité dupliquée, le champ phonétique, le rappel, la production d’une réserve, un import exclu, un mot injecté dans un thème de situation, un mot inséré par une préparation et une préparation après sa cible.

Ce contrôle ne remplace ni Claude pour la méthode phonétique, ni une relecture native, ni un essai avec apprenants. Aucune publication n’est approuvée par ce rapport.
