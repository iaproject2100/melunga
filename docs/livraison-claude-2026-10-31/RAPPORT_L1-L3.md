# Audit thématique Melunga — lot L1–L3

Revue du classement thématique, faite par lecture du sens. **Aucune carte n'a été modifiée.** Ce lot ne contient que des propositions, que Codex devra confronter aux banques avant de les appliquer.

## Méthode et couverture réelle

- **Source :** les banques `melunga_deploy/content/native-catalogue/{code}.json` de la branche `feat/interface-russe-portugais`, pour les 12 langues. Chaque carte est identifiée par son `id` (`catalogue:<langue>:<sourceIndex>`, `sourceIndex` compté à partir de 0) et son texte `t` tel qu'il figure dans la banque.
- **Regroupement :** les cartes de même sens dans un même niveau ont été regroupées dans les 12 langues, d'après la traduction anglaise ; les marqueurs (male)/(female) sont ignorés pour ce regroupement. Chaque groupe a été lu en entier, avec sa référence anglaise et française et ses thèmes actuels, puis affecté au thème du même niveau qui correspond à son domaine.
- **Effet du regroupement :** une décision vaut pour toutes les langues du groupe. Les incohérences entre banques ressortent donc, y compris les mauvais classements propagés par les correspondances de traduction.
- **Lots lus :** L01_00.json, L01_01.json, L02_00.json, L02_01.json, L02_02.json, L02_03.json, L02_04.json, L03_00.json, L03_01.json, L03_02.json, L03_03.json, L03_04.json, L03_05.json, L03_06.json. Lots manquants : aucun.
- **Cartes affichées dans des rubriques et relues :** 17227 sur 17227. Les mini-scènes (`*-situation-piste-*`) et les collections de modèles n'ont pas été touchées, conformément aux consignes. Les réserves restent inventoriées et ne sont pas réaffectées.

## Résultat

- **2544 déplacements proposés** (`status: proposed`), tous vers un thème existant du même niveau et présent dans la langue concernée.
- **1411 cas incertains** (`status: uncertain`), à arbitrer avant toute application. Ils regroupent les doutes signalés à la lecture, les changements de section entre situations et vocabulaire, et les phrases météo, pour lesquelles aucune convention n'existe (voir plus bas).
- **258 cas où le thème cible n'existe pas dans cette langue** à ce niveau (`targetAbsent`). Ils sont à traiter avec les propositions de création de thème.

### Principaux flux proposés

| Thème actuel | Destination | Cartes |
|---|---|---:|
| `L3-conversation` | `L3-repas` | 181 |
| `L2-conversation` | `L2-repas` | 145 |
| `L3-conversation` | `L3-quotidien` | 109 |
| `L3-conversation` | `L3-deplacements` | 102 |
| `L2-conversation` | `L2-deplacements` | 99 |
| `L2-conversation` | `L2-ressentis` | 98 |
| `L3-vocab-actions` | `L3-vocab-travail` | 78 |
| `L3-conversation` | `L3-ressentis` | 75 |
| `L3-conversation` | `L3-travail` | 72 |
| `L3-conversation` | `L3-decrire` | 67 |
| `conversation` | `saluer` | 58 |
| `L2-conversation` | `L2-quotidien` | 56 |
| `conversation` | `repas` | 54 |
| `L3-vocab-actions` | `L3-vocab-maison` | 54 |
| `L2-conversation` | `L2-decrire` | 51 |
| `L3-vocab-actions` | `L3-vocab-personnes` | 46 |
| `L2-conversation` | `L2-saluer` | 43 |
| `L3-conversation` | `L3-comprendre` | 38 |
| `L3-vocab-actions` | `L3-vocab-loisirs` | 38 |
| `L1-vocab-actions` | `L1-vocab-adjectifs` | 35 |

## Bilan des cellules langue × niveau

| Langue | Niveau | Cartes affichées | Lues | Déplacements | Incertains | Plus grosse situation (avant → après) |
|---|---:|---:|---:|---:|---:|---|
| ar | L1 | 270 | 270 | 93 | 19 | `conversation` 123 → 52 |
| ar | L2 | 532 | 532 | 84 | 40 | `L2-conversation` 195 → 128 |
| ar | L3 | 622 | 622 | 194 | 56 | `L3-conversation` 276 → 143 |
| de | L1 | 270 | 270 | 5 | 6 | `conversation` 31 → 28 |
| de | L2 | 532 | 532 | 13 | 17 | `L2-conversation` 115 → 121 |
| de | L3 | 661 | 661 | 14 | 10 | `L3-conversation` 168 → 174 |
| en | L1 | 373 | 373 | 22 | 35 | `conversation` 22 → 19 |
| en | L2 | 546 | 546 | 66 | 46 | `L2-conversation` 223 → 183 |
| en | L3 | 716 | 716 | 91 | 62 | `L3-conversation` 225 → 189 |
| es | L1 | 275 | 275 | 4 | 18 | `conversation` 60 → 61 |
| es | L2 | 618 | 618 | 57 | 28 | `L2-conversation` 309 → 271 |
| es | L3 | 523 | 523 | 94 | 44 | `L3-conversation` 206 → 185 |
| fr | L1 | 311 | 311 | 18 | 7 | `saluer` 21 → 22 |
| fr | L2 | 549 | 549 | 51 | 49 | `L2-conversation` 232 → 201 |
| fr | L3 | 630 | 630 | 87 | 47 | `L3-conversation` 217 → 165 |
| hi | L1 | 270 | 270 | 63 | 28 | `conversation` 120 → 77 |
| hi | L2 | 532 | 532 | 115 | 44 | `L2-conversation` 180 → 103 |
| hi | L3 | 622 | 622 | 187 | 79 | `L3-conversation` 208 → 126 |
| it | L1 | 371 | 371 | 24 | 28 | `conversation` 30 → 28 |
| it | L2 | 530 | 530 | 77 | 73 | `L2-conversation` 193 → 168 |
| it | L3 | 533 | 533 | 116 | 53 | `L3-conversation` 167 → 131 |
| ja | L1 | 333 | 333 | 20 | 26 | `conversation` 28 → 26 |
| ja | L2 | 532 | 532 | 56 | 51 | `L2-conversation` 229 → 194 |
| ja | L3 | 515 | 515 | 65 | 41 | `L3-conversation` 185 → 139 |
| ko | L1 | 346 | 346 | 13 | 42 | `conversation` 30 → 30 |
| ko | L2 | 424 | 424 | 38 | 49 | `L2-conversation` 174 → 152 |
| ko | L3 | 509 | 509 | 71 | 46 | `L3-conversation` 176 → 149 |
| pt | L1 | 270 | 270 | 52 | 27 | `conversation` 108 → 75 |
| pt | L2 | 532 | 532 | 111 | 44 | `L2-conversation` 177 → 104 |
| pt | L3 | 622 | 622 | 180 | 72 | `L3-conversation` 201 → 122 |
| ru | L1 | 271 | 271 | 61 | 28 | `conversation` 119 → 78 |
| ru | L2 | 532 | 532 | 119 | 46 | `L2-conversation` 185 → 111 |
| ru | L3 | 622 | 622 | 190 | 77 | `L3-conversation` 210 → 129 |
| zh | L1 | 288 | 288 | 7 | 8 | `conversation` 30 → 28 |
| zh | L2 | 591 | 591 | 37 | 22 | `L2-conversation` 149 → 131 |
| zh | L3 | 554 | 554 | 49 | 43 | `L3-conversation` 149 → 141 |

Le détail par rubrique, avec l'effectif avant et après et l'indication « touchée / inchangée après lecture », figure dans le JSON (`cells[].themes`). Une rubrique marquée `touched: false` a été lue sans qu'aucun changement soit nécessaire.
## Propositions distinctes : fusion, création et renommage de thèmes (non appliquées)

Ces propositions relèvent d'une décision éditoriale. Aucun déplacement de la liste `proposals` n'en dépend.

1. **Météo** : il n'existe aucun thème de situation consacré à la météo en L1, L2 ou L3. Les phrases météo sont dispersées entre `quotidien`, `decrire`, `reperes`, `conversation` et `vocab-nature`. Deux options :
   - créer « Parler du temps qu'il fait » à chaque niveau ;
   - fixer une convention commune, par exemple `decrire` pour la description du temps et `reperes` pour les températures.
   Les déplacements météo sont classés incertains en attendant cette décision.
2. **Loisirs (L2)** : il n'y a pas de thème de situation pour la lecture, le sport, la musique ou les sorties. Ces phrases restent dans `L2-conversation`. Proposition : créer « Parler de ses loisirs », pendant de `L2-vocab-loisirs`.
3. **Téléphone et messages (L2–L3)** : les phrases du type allô, ligne occupée, batterie, wifi sont réparties entre `comprendre` et `conversation`. Proposition : créer une rubrique « Téléphone et messages », ou les regrouper dans `comprendre`. Les cas concernés sont classés incertains.
4. **Banque et argent (L2)** : les phrases sur le distributeur, le change et les retraits sont réparties entre `travail`, `repas` et `deplacements`. Il faut harmoniser, ou créer « Banque et argent ».
5. **Urgences (L3)** : les phrases sur un vol, un incendie ou la police n'ont pas de thème. Elles sont envoyées vers `deplacements` ou `sante` et classées incertaines. Proposition : créer « Imprévus et urgences ».
6. **Vocabulaire des vêtements (L2–L3)** : ces mots sont éclatés entre `vocab-actions`, `vocab-personnes` et `vocab-restaurant`. Proposition : créer un thème de vocabulaire « Vêtements et matières ».
7. **Mots-outils (L1, L3)** : les connecteurs et interrogatifs (et, mais, donc, sinon, puisque, qui, quoi, où…) sont rangés dans `vocab-actions`. Deux options : créer « Mots-outils et connecteurs », ou les rattacher à `vocab-prepositions`.
8. **`vocab-actions` sert de fourre-tout à tous les niveaux.** Les noms concrets en ont été retirés vers les thèmes de vocabulaire précis. Une fois nettoyé, il pourrait être renommé « Verbes et actions ».
9. **Émotions** : elles sont partagées entre `vocab-adjectifs` et `vocab-personnes`. Proposition de règle : `vocab-personnes`, dont le titre mentionne déjà les émotions.
10. **Titres qui ne correspondent plus au contenu, en L3** :
    - `L3-ressentis` « Parler de ses goûts » → « Goûts, besoins et émotions » ;
    - `L3-repas` « Organiser une sortie » → « Sorties, repas et achats » ;
    - `L3-comprendre` → « Comprendre et demander un service » ;
    - `L3-saluer` → « Saluer, féliciter et se présenter ».
11. **Vœux et condoléances** : les formules religieuses et de condoléances, surtout en arabe, sont laissées dans `conversation`. Elles pourraient former un thème « Vœux et condoléances », comme `L6-souhaits` en français.

## Points à vérifier par Codex

- **Doublons de sens dans une même banque** : par exemple « peut-être » apparaît deux fois en zh L1 (conversation et vocab-adverbes), et « le rhume » deux fois en L3 hi/ru. Ces cas sont signalés dans `themeNotes` ; ils ne concernent pas le classement.
- **Phrases complètes rangées en section vocabulaire** : par exemple « Do you need a bag? » ou « La voiture accélère. ». Les cas flagrants sont dans `uncertain` (changement de section) ; les autres sont laissés en place.
- **Banque it** : plusieurs exclamations y sont rangées dans des thèmes de vocabulaire (« Vite ! », « Quelle chance ! »).
- **Progression** : un déplacement change l'effectif des étapes de 30 à 40 cartes, dans la rubrique d'origine comme dans la rubrique de destination. Les cartes déjà vues ou maîtrisées doivent garder leur état en suivant leur `id`, et le découpage en étapes doit être recalculé.

## Fichier joint

`audit_L1-L3.json` contient :
- `proposals`, `uncertain` et `targetAbsent`, avec pour chaque carte : `language`, `level`, `id`, `sourceIndex` (à partir de 0), `t`, `fr`, `currentTheme`, `proposedTheme`, `reason` et `status` ;
- `cells`, les 36 cellules de ce lot avec leur couverture et le détail des rubriques ;
- `themeNotes`, les remarques brutes faites pendant la lecture.

Les lots L4–L6 et L7–L10 sont en cours.
