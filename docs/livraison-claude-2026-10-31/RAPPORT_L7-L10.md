# Audit thématique Melunga — lot L7–L10

Revue du classement thématique, faite par lecture du sens. **Aucune carte n'a été modifiée.** Ce lot ne contient que des propositions, que Codex devra confronter aux banques avant de les appliquer.

## Méthode et couverture réelle

- **Source :** les banques `melunga_deploy/content/native-catalogue/{code}.json` de la branche `feat/interface-russe-portugais`, pour les 12 langues. Chaque carte est identifiée par son `id` (`catalogue:<langue>:<sourceIndex>`, `sourceIndex` compté à partir de 0) et son texte `t` tel qu'il figure dans la banque.
- **Regroupement :** les cartes de même sens dans un même niveau ont été regroupées dans les 12 langues, d'après la traduction anglaise ; les marqueurs (male)/(female) sont ignorés pour ce regroupement. Chaque groupe a été lu en entier, avec sa référence anglaise et française et ses thèmes actuels, puis affecté au thème du même niveau qui correspond à son domaine.
- **Effet du regroupement :** une décision vaut pour toutes les langues du groupe. Les incohérences entre banques ressortent donc, y compris les mauvais classements propagés par les correspondances de traduction.
- **Lots lus :** L07_00.json, L07_01.json, L07_02.json, L07_03.json, L07_04.json, L08_00.json, L08_01.json, L08_02.json, L08_03.json, L09_00.json, L09_01.json, L09_02.json, L10_00.json, L10_01.json, L10_02.json. Lots manquants : aucun.
- **Cartes affichées dans des rubriques et relues :** 15458 sur 15458. Les mini-scènes (`*-situation-piste-*`) et les collections de modèles n'ont pas été touchées, conformément aux consignes. Les réserves restent inventoriées et ne sont pas réaffectées.

## Résultat

- **3554 déplacements proposés** (`status: proposed`), tous vers un thème existant du même niveau et présent dans la langue concernée.
- **1355 cas incertains** (`status: uncertain`), à arbitrer avant toute application. Ils regroupent les doutes signalés à la lecture, les changements de section entre situations et vocabulaire, et les phrases météo, pour lesquelles aucune convention n'existe (voir plus bas).
- **246 cas où le thème cible n'existe pas dans cette langue** à ce niveau (`targetAbsent`). Ils sont à traiter avec les propositions de création de thème.

### Principaux flux proposés

| Thème actuel | Destination | Cartes |
|---|---|---:|
| `L7-conversation` | `L7-travail` | 356 |
| `L9-conversation` | `L9-travail` | 313 |
| `L10-conversation` | `L10-travail` | 282 |
| `L8-conversation` | `L8-travail` | 166 |
| `L7-conversation` | `L7-quotidien` | 129 |
| `L7-conversation` | `L7-ressentis` | 88 |
| `L9-vocab-actions` | `L9-vocab-adjectifs` | 69 |
| `L7-conversation` | `L7-repas` | 53 |
| `L10-vocab-actions` | `L10-vocab-travail` | 51 |
| `L8-vocab-actions` | `L8-vocab-personnes` | 50 |
| `L7-vocab-actions` | `L7-vocab-travail` | 49 |
| `L9-vocab-actions` | `L9-vocab-adverbes` | 46 |
| `L10-vocab-actions` | `L10-vocab-adjectifs` | 44 |
| `L8-conversation` | `L8-ressentis` | 41 |
| `L7-conversation` | `L7-deplacements` | 38 |
| `L7-reperes` | `L7-quotidien` | 37 |
| `L9-reperes` | `L9-travail` | 37 |
| `L8-travail` | `L8-conversation` | 36 |
| `L9-conversation` | `L9-ressentis` | 35 |
| `L7-travail` | `L7-quotidien` | 34 |

## Bilan des cellules langue × niveau

| Langue | Niveau | Cartes affichées | Lues | Déplacements | Incertains | Plus grosse situation (avant → après) |
|---|---:|---:|---:|---:|---:|---|
| ar | L7 | 424 | 424 | 125 | 63 | `L7-travail` 274 → 176 |
| ar | L8 | 399 | 399 | 99 | 54 | `L8-travail` 220 → 155 |
| ar | L9 | 224 | 224 | 24 | 6 | `L9-travail` 114 → 118 |
| ar | L10 | 247 | 247 | 29 | 26 | `L10-travail` 106 → 94 |
| de | L7 | 422 | 422 | 4 | 4 | `L7-conversation` 80 → 80 |
| de | L8 | 398 | 398 | 2 | 1 | `L8-travail` 98 → 99 |
| de | L9 | 223 | 223 | 2 | 2 | `L9-travail` 46 → 46 |
| de | L10 | 222 | 222 | 5 | 3 | `L10-conversation` 51 → 49 |
| en | L7 | 437 | 437 | 120 | 82 | `L7-conversation` 198 → 152 |
| en | L8 | 296 | 296 | 85 | 24 | `L8-conversation` 100 → 56 |
| en | L9 | 145 | 145 | 49 | 8 | `L9-conversation` 68 → 21 |
| en | L10 | 220 | 220 | 87 | 16 | `L10-conversation` 58 → 26 |
| es | L7 | 462 | 462 | 145 | 33 | `L7-conversation` 187 → 119 |
| es | L8 | 417 | 417 | 36 | 21 | `L8-travail` 188 → 207 |
| es | L9 | 285 | 285 | 116 | 26 | `L9-conversation` 153 → 69 |
| es | L10 | 276 | 276 | 88 | 17 | `L10-conversation` 118 → 69 |
| fr | L7 | 397 | 397 | 113 | 47 | `L7-conversation` 177 → 118 |
| fr | L8 | 358 | 358 | 94 | 30 | `L8-conversation` 110 → 62 |
| fr | L9 | 212 | 212 | 84 | 27 | `L9-conversation` 95 → 38 |
| fr | L10 | 214 | 214 | 66 | 22 | `L10-conversation` 73 → 44 |
| hi | L7 | 424 | 424 | 136 | 28 | `L7-conversation` 203 → 138 |
| hi | L8 | 399 | 399 | 92 | 24 | `L8-conversation` 174 → 138 |
| hi | L9 | 224 | 224 | 84 | 18 | `L9-conversation` 92 → 78 |
| hi | L10 | 247 | 247 | 59 | 49 | `L10-conversation` 78 → 71 |
| it | L7 | 389 | 389 | 127 | 62 | `L7-conversation` 171 → 114 |
| it | L8 | 350 | 350 | 88 | 42 | `L8-conversation` 56 → 38 |
| it | L9 | 207 | 207 | 79 | 27 | `L9-conversation` 81 → 36 |
| it | L10 | 248 | 248 | 78 | 32 | `L10-conversation` 92 → 53 |
| ja | L7 | 490 | 490 | 107 | 67 | `L7-conversation` 175 → 141 |
| ja | L8 | 276 | 276 | 33 | 16 | `L8-travail` 78 → 96 |
| ja | L9 | 175 | 175 | 32 | 12 | `L9-travail` 49 → 78 |
| ja | L10 | 244 | 244 | 59 | 21 | `L10-conversation` 76 → 41 |
| ko | L7 | 501 | 501 | 135 | 67 | `L7-conversation` 219 → 151 |
| ko | L8 | 383 | 383 | 57 | 29 | `L8-conversation` 80 → 67 |
| ko | L9 | 196 | 196 | 56 | 13 | `L9-conversation` 76 → 30 |
| ko | L10 | 249 | 249 | 60 | 28 | `L10-conversation` 88 → 56 |
| pt | L7 | 424 | 424 | 127 | 31 | `L7-conversation` 193 → 139 |
| pt | L8 | 399 | 399 | 85 | 21 | `L8-conversation` 169 → 142 |
| pt | L9 | 224 | 224 | 81 | 19 | `L9-conversation` 89 → 83 |
| pt | L10 | 247 | 247 | 57 | 50 | `L10-conversation` 74 → 71 |
| ru | L7 | 424 | 424 | 142 | 28 | `L7-conversation` 198 → 140 |
| ru | L8 | 399 | 399 | 90 | 23 | `L8-conversation` 173 → 145 |
| ru | L9 | 224 | 224 | 84 | 17 | `L9-conversation` 90 → 84 |
| ru | L10 | 247 | 247 | 58 | 50 | `L10-conversation` 75 → 71 |
| zh | L7 | 446 | 446 | 89 | 22 | `L7-conversation` 126 → 72 |
| zh | L8 | 526 | 526 | 41 | 24 | `L8-travail` 86 → 94 |
| zh | L9 | 276 | 276 | 18 | 9 | `L9-conversation` 41 → 33 |
| zh | L10 | 342 | 342 | 27 | 14 | `L10-conversation` 107 → 92 |

Le détail par rubrique, avec l'effectif avant et après et l'indication « touchée / inchangée après lecture », figure dans le JSON (`cells[].themes`). Une rubrique marquée `touched: false` a été lue sans qu'aucun changement soit nécessaire.
## Point de méthode à trancher avant d'appliquer L7–L10

À partir de L7, les titres des thèmes de situation décrivent une **fonction de communication**, pas un domaine. Par exemple :
- L7 : « Proposer une alternative », « Négocier une option » ;
- L9 : « Répondre à une objection », « Structurer une argumentation » ;
- L10 : « Relier causes, temps et conséquences », « Choisir le mot juste ».

Les identifiants techniques, eux, restent ceux des domaines (`repas`, `deplacements`, `travail`…). L'audit a classé selon le **domaine concret** de la phrase, parce que c'est ce que font les banques ja et ko, les mieux triées, et c'est le critère retenu en L1–L6.

Si Melunga veut au contraire classer L7–L10 **par fonction**, une partie des déplacements proposés devient discutable : par exemple, une phrase d'objection commerciale envoyée vers `travail` alors qu'elle illustre « Répondre à une objection ». Il faut décider de ce point avant d'appliquer ce lot. Dans les deux cas, les incohérences entre banques (même sens rangé dans des thèmes différents selon la langue) restent à corriger.

## Constats propres à L7–L10

- **Les banques hi, pt et ru semblent rangées presque au hasard** de L7 à L9 : un business plan dans `deplacements`, des formules d'adieu dans `reperes`, la famille dans `decrire`. Elles concentrent beaucoup de déplacements.
- **Banque ar** :
  - `L7-travail` et `L8-travail` servent de fourre-tout, avec environ 270 phrases en L7 : famille, cuisine, football, hôtel, proverbes ;
  - `L10-vocab-travail` contient des mots métaphoriques tirés de récits, peu utiles comme vocabulaire.
  Une révision éditoriale de la banque arabe s'impose.
- **Sourcing et commerce B2B** : ces phrases sont très nombreuses à tous les niveaux et sont rapatriées vers `travail`. `L7-travail` à `L10-travail` deviennent donc très chargés.
- **Banque es** :
  - `L9-conversation` contient environ 130 phrases de commerce et de courtes phrases au passé composé ;
  - `L9-reperes`, `L9-repas` et `L9-deplacements` contiennent peu de phrases qui correspondent à leur titre.
- **Banque zh** : les chengyu et les maximes classiques (Laozi, Confucius) remplissent `conversation`, `reperes`, `vocab-actions` et `vocab-travail`.
- **`L8-marqueurs-oraux` ne contient que 3 phrases**, alors que des dizaines de phrases à marqueurs oraux (« D'ailleurs », « Bref », « Cela dit », « Toujours est-il ») sont dispersées ailleurs. Il faut décider s'il faut l'alimenter.
- **Traductions approximatives** relevées au passage, hors du périmètre de cet audit :
  - « go off on a tangent » traduit par « tourner autour du pot » (L9) ;
  - « worth noting » traduit par « à surveiller » (L9) ;
  - plusieurs gloses françaises de la banque zh en L8.
  Le détail est dans `themeNotes`.
- **Langues manquantes dans certains groupes de sens** (L10) :
  - pt absent pour « l'avantage » et « saisir » ;
  - ru absent pour « le consensus ».
  À vérifier : il peut s'agir d'un choix de banque.

## Propositions distinctes : fusion, création et renommage de thèmes (non appliquées)

1. **Scinder `travail` en L7–L10**, par exemple en « Négocier et commander », « Production, qualité et logistique » et « Correspondance professionnelle ».
2. **« Correspondance formelle » en L10** : les formules de courrier (« dans l'attente de votre réponse », « je vous saurais gré ») sont actuellement dans `comprendre`, `saluer` et `travail`.
3. **« Proverbes et maximes » en L8–L10, et un thème de vocabulaire « Expressions idiomatiques »**, surtout pour zh.
4. **« Culture et histoire » ou « Lecture et culture » en L7–L9** : Pouchkine, Boulgakov, Machado, Jorge Amado, Premchand, Tagore, Kabir, Gagarine…
5. **Thèmes de situation absents en L7–L8** :
   - loisirs, nature et environnement ;
   - technologie ;
   - justice et vie civique.
6. **Vocabulaire** :
   - « Société, sciences et idées » pour les noms abstraits de `vocab-actions` ;
   - « Vêtements ».
7. **Titres** : compléter les titres fonctionnels par leur domaine, par exemple `L8-repas` « Formuler une demande délicate » → « Négocier un achat ou une réclamation ». La même remarque vaut pour `L9-reperes` et `L8-comprendre`.

## Points à vérifier par Codex

- **Doublons de sens dans une même banque**, avec de nombreuses occurrences en L7–L10 : la liste est dans `themeNotes`.
- **Courtes phrases es de niveau très bas en L10** (« je l'ai noté », « je l'ai serré ») : c'est une question de niveau, pas de thème.
- **Progression** : les remarques des lots précédents s'appliquent aussi ici.

## Fichier joint

`audit_L7-L10.json` a la même structure que les deux lots précédents. Avec ce lot, **les 120 cellules langue × niveau ont été lues** : toutes les cartes affichées dans les rubriques ont été relues, hors mini-scènes et modèles, qui n'ont pas été touchés.
