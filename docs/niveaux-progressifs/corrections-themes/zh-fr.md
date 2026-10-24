# Corrections ciblées — français pour sinophones

**4500 cartes sources conservées ; aucune aide phonétique, traduction, orthographe ou niveau source modifié.** Classement et progression relèvent de Codex. Claude vérifie seulement les nouvelles phonétiques entières du master. Cet audit ciblé ne prétend pas valider toutes les progressions du catalogue.

## Périmètre effectivement relu

64 rubriques comportant moins de 6 cartes (178 cartes), 156 lexèmes des familles Corps/personnes, Restaurant/achats et Voyage, et 166 cas à risque dans les situations Voyage/Repas. Des cas concrets supplémentaires observés dans ces listes sont corrigés explicitement. Aucune nouvelle règle globale par mot-clé n’a été ajoutée.

## Corrections bornées

| Décision | Nombre |
|---|---:|
| contentTypeChanges | 5 |
| lexicalClassChanges | 21 |
| familyOverrides | 80 |
| situationOverrides | 239 |
| colorEntries | 15 |
| changedSourceAssignments | 337 |

Les trois faux lexèmes #4416 «Un autre fournisseur propose moins cher.»,#3430 «Le chat grimpe à l’arbre.» et#3537 «Le prix dépend du grammage.» deviennent des phrases. #264/#265 «tout de suite», de sens立刻/马上, deviennent du vocabulaire adverbial. Les données sources restent strictement identiques.

Les verbes aller/arriver/sortir et les mots pain/pied/carte ne prouvent aucun déplacement ou repas. Ainsi#817 «On va y arriver.» est un encouragement,#1688 «Je n’arrive pas à me connecter.» un problème pratique,#4447 «Je l’ai pris au pied de la lettre.» un problème de sens,#2047 «Avoir du pain sur la planche.» une locution de travail. Les destinations sont décidées par indice avec le sens chinois.

Les intrus concrets sont réaffectés : sac à dos→Voyage, ticket de sens车票→Voyage, robinet→Maison/Mobilier, coût de moule→Travail. Nature/jardin/météo accueille les éléments naturels et les animaux ; Loisirs/culture reçoit musique, instruments, cinéma, lecture et fêtes. La peinture de sens油漆 reste un matériau ; le film plastique de sens塑料膜 reste de l’emballage.

**Cas conservé après vérification :**#3107 «une radio» signifieX光 : la famille Corps/santé est juste. Un simple rapprochement avec le mot radio aurait créé une mauvaise correction.

## Adjectifs demandés et formes M/F

| Forme | Entrée isolée existante | Nouveau mot entier du master |
|---|---|---|
| grand | #3676 (L1) | — |
| grande | Absente | new-zh-fr-large-f — phonétique à vérifier par Claude |
| petit | #3677 (L1) | — |
| petite | Absente | new-zh-fr-small-f — phonétique à vérifier par Claude |
| gros | Absente | new-zh-fr-fat-m — phonétique à vérifier par Claude |
| grosse | Absente | new-zh-fr-fat-f — phonétique à vérifier par Claude |
| beau | Absente | new-zh-fr-beautiful-m — phonétique à vérifier par Claude |
| belle | Absente | new-zh-fr-beautiful-f — phonétique à vérifier par Claude |
| léger | #3690 (L1) | — |
| légère | Absente | new-zh-fr-light-f — phonétique à vérifier par Claude |
| lourd | #3689 (L1) | — |
| lourde | Absente | new-zh-fr-heavy-f — phonétique à vérifier par Claude |
| radin | Absente | new-zh-fr-stingy-m — phonétique à vérifier par Claude |
| radine | Absente | new-zh-fr-stingy-f — phonétique à vérifier par Claude |
| égoïste | Absente | new-zh-fr-selfish — phonétique à vérifier par Claude |
| triste | Absente | new-zh-fr-sad — phonétique à vérifier par Claude |
| heureux | Absente | new-zh-fr-happy-m — phonétique à vérifier par Claude |
| heureuse | Absente | new-zh-fr-happy-f — phonétique à vérifier par Claude |
| zéro | Absente | new-zh-fr-zero — phonétique à vérifier par Claude |

Les 15 entrées françaises nouvelles du master n’ont aucun doublon isolé dans DECKS.fr. Les phrases «Il est beau.»,«Elle est belle.»,«Je suis triste.» ou«Je suis heureux.» ne valent pas disponibilité d’un mot isolé. Aucun fragment de leurs phonétiques n’a été repris. «le prix de gros»,«la grand-mère» et«la belle-famille» ne sont pas des adjectifs isolés.

## Couleurs, destination distincte

| Indice | Source exacte | Sens chinois exact | Niveau source |
|---:|---|---|---:|
| 3830 | rouge | 红色 | 2 |
| 3831 | bleu | 蓝色 | 3 |
| 3832 | vert | 绿色 | 3 |
| 3833 | jaune | 黄色 | 4 |
| 3834 | noir | 黑色 | 2 |
| 3835 | blanc | 白色 | 3 |
| 3836 | gris | 灰色 | 4 |
| 3837 | marron | 棕色 | 5 |
| 3838 | rose | 粉色 | 3 |
| 3839 | orange | 橙色 | 4 |
| 3840 | beige | 米色 | 5 |
| 3841 | bleu foncé | 深蓝色 | 5 |
| 3842 | bleu clair | 浅蓝色 | 3 |
| 3843 | doré | 金色的 | 5 |
| 3844 | argenté | 银色的 | 5 |

Ces 15 unités ont lexicalClass=color. rose=粉色,orange=橙色,marron=棕色,argenté=银色的 ; la fleur, le fruit et la monnaie ne sont pas assimilés à une couleur. Les 15 aides phonétiques et toutes les formes sources restent identiques.

## Rubriques faibles à regrouper dans le même niveau

Le regroupement est une proposition de présentation, pas une fusion sémantique ni un changement de niveau. Afficher directement le vocabulaire d’un niveau avec ses sous-rubriques évite une étape de démarrage pour un seul mot. Après réaffectation des intrus, une entrée vide doit disparaître ; elle ne doit pas être remplie par des mots hors sujet. Les niveaux riches ne perdent aucune carte.

| Niveau | Rubrique actuelle | Cartes avant correction | Proposition |
|---:|---|---:|---|
| L1 | reperes | 3 | Vue directe des situations du même niveau, après réaffectation |
| L1 | quotidien | 1 | Vue directe des situations du même niveau, après réaffectation |
| L1 | decrire | 3 | Vue directe des situations du même niveau, après réaffectation |
| L1 | L1-vocab-restaurant | 1 | Vue Vocabulaire du niveau, familles conservées |
| L1 | L1-vocab-voyage | 4 | Vue Vocabulaire du niveau, familles conservées |
| L1 | L1-vocab-travail | 4 | Vue Vocabulaire du niveau, familles conservées |
| L1 | L1-nombres | 5 | Vue Vocabulaire du niveau, familles conservées |
| L2 | L2-vocab-restaurant | 5 | Vue Vocabulaire du niveau, familles conservées |
| L2 | L2-vocab-maison | 5 | Vue Vocabulaire du niveau, familles conservées |
| L2 | L2-vocab-voyage | 2 | Vue Vocabulaire du niveau, familles conservées |
| L2 | L2-vocab-reperes | 2 | Vue Vocabulaire du niveau, familles conservées |
| L2 | L2-vocab-travail | 3 | Vue Vocabulaire du niveau, familles conservées |
| L2 | L2-nombres | 5 | Vue Vocabulaire du niveau, familles conservées |
| L2 | L2-vocab-prepositions | 1 | Vue Vocabulaire du niveau, familles conservées |
| L3 | L3-vocab-reperes | 4 | Vue Vocabulaire du niveau, familles conservées |
| L3 | L3-vocab-travail | 2 | Vue Vocabulaire du niveau, familles conservées |
| L4 | L4-vocab-voyage | 2 | Vue Vocabulaire du niveau, familles conservées |
| L4 | L4-vocab-travail | 4 | Vue Vocabulaire du niveau, familles conservées |
| L5 | L5-decrire | 4 | Vue directe des situations du même niveau, après réaffectation |
| L5 | L5-vocab-voyage | 2 | Vue Vocabulaire du niveau, familles conservées |
| L5 | L5-vocab-personnes | 2 | Vue Vocabulaire du niveau, familles conservées |
| L5 | L5-vocab-reperes | 3 | Vue Vocabulaire du niveau, familles conservées |
| L5 | L5-vocab-travail | 3 | Vue Vocabulaire du niveau, familles conservées |
| L6 | L6-comprendre | 2 | Vue directe des situations du même niveau, après réaffectation |
| L6 | L6-vocab-maison | 5 | Vue Vocabulaire du niveau, familles conservées |
| L6 | L6-vocab-voyage | 1 | Vue Vocabulaire du niveau, familles conservées |
| L6 | L6-vocab-personnes | 1 | Vue Vocabulaire du niveau, familles conservées |
| L6 | L6-vocab-reperes | 5 | Vue Vocabulaire du niveau, familles conservées |
| L6 | L6-vocab-travail | 3 | Vue Vocabulaire du niveau, familles conservées |
| L6 | L6-vocab-adjectifs | 3 | Vue Vocabulaire du niveau, familles conservées |
| L7 | L7-saluer | 4 | Vue directe des situations du même niveau, après réaffectation |
| L7 | L7-vocab-restaurant | 4 | Vue Vocabulaire du niveau, familles conservées |
| L7 | L7-vocab-maison | 4 | Vue Vocabulaire du niveau, familles conservées |
| L7 | L7-vocab-voyage | 2 | Vue Vocabulaire du niveau, familles conservées |
| L7 | L7-vocab-personnes | 1 | Vue Vocabulaire du niveau, familles conservées |
| L7 | L7-vocab-reperes | 1 | Vue Vocabulaire du niveau, familles conservées |
| L7 | L7-vocab-travail | 2 | Vue Vocabulaire du niveau, familles conservées |
| L7 | L7-nombres | 2 | Vue Vocabulaire du niveau, familles conservées |
| L8 | L8-vocab-maison | 3 | Vue Vocabulaire du niveau, familles conservées |
| L8 | L8-vocab-voyage | 3 | Vue Vocabulaire du niveau, familles conservées |
| L8 | L8-vocab-personnes | 1 | Vue Vocabulaire du niveau, familles conservées |
| L8 | L8-vocab-reperes | 2 | Vue Vocabulaire du niveau, familles conservées |
| L8 | L8-vocab-travail | 3 | Vue Vocabulaire du niveau, familles conservées |
| L8 | L8-nombres | 1 | Vue Vocabulaire du niveau, familles conservées |
| L8 | L8-vocab-adjectifs | 3 | Vue Vocabulaire du niveau, familles conservées |
| L8 | L8-vocab-adverbes | 2 | Vue Vocabulaire du niveau, familles conservées |
| L9 | L9-comprendre | 3 | Vue directe des situations du même niveau, après réaffectation |
| L9 | L9-deplacements | 5 | Vue directe des situations du même niveau, après réaffectation |
| L9 | L9-quotidien | 2 | Vue directe des situations du même niveau, après réaffectation |
| L9 | L9-decrire | 1 | Vue directe des situations du même niveau, après réaffectation |
| L9 | L9-vocab-restaurant | 3 | Vue Vocabulaire du niveau, familles conservées |
| L9 | L9-vocab-reperes | 3 | Vue Vocabulaire du niveau, familles conservées |
| L9 | L9-vocab-travail | 4 | Vue Vocabulaire du niveau, familles conservées |
| L9 | L9-nombres | 1 | Vue Vocabulaire du niveau, familles conservées |
| L9 | L9-vocab-adverbes | 2 | Vue Vocabulaire du niveau, familles conservées |
| L10 | L10-saluer | 4 | Vue directe des situations du même niveau, après réaffectation |
| L10 | L10-comprendre | 3 | Vue directe des situations du même niveau, après réaffectation |
| L10 | L10-decrire | 4 | Vue directe des situations du même niveau, après réaffectation |
| L10 | L10-vocab-maison | 3 | Vue Vocabulaire du niveau, familles conservées |
| L10 | L10-vocab-voyage | 3 | Vue Vocabulaire du niveau, familles conservées |
| L10 | L10-vocab-reperes | 3 | Vue Vocabulaire du niveau, familles conservées |
| L10 | L10-vocab-travail | 2 | Vue Vocabulaire du niveau, familles conservées |
| L10 | L10-vocab-prepositions | 1 | Vue Vocabulaire du niveau, familles conservées |
| L10 | L10-vocab-adverbes | 3 | Vue Vocabulaire du niveau, familles conservées |

## Exemples de décisions de routage

| Indice | Source exacte | Ancienne rubrique | Nouvelle rubrique |
|---:|---|---|---|
| 175 | Ça me va bien. | deplacements | decrire |
| 38 | Je vais mieux. | deplacements | ressentis |
| 817 | On va y arriver. | deplacements | conversation |
| 1185 | Ça ne mange pas de pain. | repas | conversation |
| 1688 | Je n'arrive pas à me connecter. | deplacements | comprendre |
| 2047 | Avoir du pain sur la planche. | vocab-restaurant | vocab-travail |
| 4447 | Je l'ai pris au pied de la lettre. | deplacements | comprendre |
| 3119 | un sac à dos | vocab-personnes | vocab-voyage |
| 3342 | le ticket | vocab-restaurant | vocab-voyage |
| 3491 | Le robinet d'eau chaude. | vocab-restaurant | vocab-maison |
| 3525 | le coût de moule | vocab-restaurant | vocab-travail |
| 3274 | une tempête de neige | vocab-maison | vocab-nature |
| 3166 | le cinéma | vocab-actions | vocab-loisirs |
| 1776 | l'ordre du jour | vocab-reperes | vocab-travail |
| 3284 | la matière première | vocab-reperes | vocab-travail |
| 3653 | la pièce jointe | vocab-maison | vocab-travail |
| 4416 | Un autre fournisseur propose moins cher. | vocab-travail | travail |
| 3430 | Le chat grimpe à l'arbre. | vocab-maison | quotidien |
| 3537 | Le prix dépend du grammage. | vocab-restaurant | travail |

Le JSON joint donne toutes les décisions explicites, les avant/après, les champs sources complets et leurs empreintes, les 64 rubriques faibles et leurs cartes, les 166 cas à risque et les disponibilités des formes demandées. Les constructions absentes ne sont jamais inventées.

Empreinte canonique inchangée de DECKS.fr : `8ba6854ad6e77063c9d3d02b9696f1cfa0bf009265bda3f37200a007ed820acf`.

Reproduction : `python3 -B tools/maquette-guidee/classify_fr.py --check`. Aucun appel au builder ou mise en production n’a été fait par cet audit.


## Amendement ciblé — carte 2969

La carte `le plan` porte réellement `cn: 地图` et `en: the map`. Mon ancienne annotation citait à tort 计划 : la famille éditoriale est corrigée de Travail vers Voyage. Texte, sens chinois, aide `勒 普隆` et niveau source restent identiques. Cet ID ne fait pas partie des 700 canoniques protégés de l’extension. Les totaux de types et de classes lexicales ne changent pas ; cela ne prétend pas valider les autres placements.


## Amendement ciblé des dix soutiens de situations

Dix routages éditoriaux supplémentaires sont corrigés sur instruction du propriétaire, sans modification de source, de phonétique, de niveau source ou de type : mot de passe3076, cahier3892 et écran4270 vers Travail ; climatisation3877 et chauffage4386 vers Maison ; horaires3455 vers Repères ; sac3872 vers Voyage ; course4347 vers Loisirs ; invitation4356 vers Personnes ; défaut3366 vers Restaurant/achats. Les dix IDs sont hors des 700 canoniques protégés. Ce lot borné ne vaut pas validation des autres placements.
