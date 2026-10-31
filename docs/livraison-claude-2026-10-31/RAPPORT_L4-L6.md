# Audit thématique Melunga — lot L4–L6

Revue du classement thématique, faite par lecture du sens. **Aucune carte n'a été modifiée.** Ce lot ne contient que des propositions, que Codex devra confronter aux banques avant de les appliquer.

## Méthode et couverture réelle

- **Source :** les banques `melunga_deploy/content/native-catalogue/{code}.json` de la branche `feat/interface-russe-portugais`, pour les 12 langues. Chaque carte est identifiée par son `id` (`catalogue:<langue>:<sourceIndex>`, `sourceIndex` compté à partir de 0) et son texte `t` tel qu'il figure dans la banque.
- **Regroupement :** les cartes de même sens dans un même niveau ont été regroupées dans les 12 langues, d'après la traduction anglaise ; les marqueurs (male)/(female) sont ignorés pour ce regroupement. Chaque groupe a été lu en entier, avec sa référence anglaise et française et ses thèmes actuels, puis affecté au thème du même niveau qui correspond à son domaine.
- **Effet du regroupement :** une décision vaut pour toutes les langues du groupe. Les incohérences entre banques ressortent donc, y compris les mauvais classements propagés par les correspondances de traduction.
- **Lots lus :** L04_00.json, L04_01.json, L04_02.json, L04_03.json, L04_04.json, L04_05.json, L04_06.json, L05_00.json, L05_01.json, L05_02.json, L05_03.json, L05_04.json, L05_05.json, L05_06.json, L06_00.json, L06_01.json, L06_02.json, L06_03.json, L06_04.json. Lots manquants : aucun.
- **Cartes affichées dans des rubriques et relues :** 19980 sur 19980. Les mini-scènes (`*-situation-piste-*`) et les collections de modèles n'ont pas été touchées, conformément aux consignes. Les réserves restent inventoriées et ne sont pas réaffectées.

## Résultat

- **4245 déplacements proposés** (`status: proposed`), tous vers un thème existant du même niveau et présent dans la langue concernée.
- **1816 cas incertains** (`status: uncertain`), à arbitrer avant toute application. Ils regroupent les doutes signalés à la lecture, les changements de section entre situations et vocabulaire, et les phrases météo, pour lesquelles aucune convention n'existe (voir plus bas).
- **271 cas où le thème cible n'existe pas dans cette langue** à ce niveau (`targetAbsent`). Ils sont à traiter avec les propositions de création de thème.

### Principaux flux proposés

| Thème actuel | Destination | Cartes |
|---|---|---:|
| `L6-conversation` | `L6-travail` | 231 |
| `L5-conversation` | `L5-travail` | 160 |
| `L4-conversation` | `L4-quotidien` | 143 |
| `L4-conversation` | `L4-ressentis` | 137 |
| `L5-vocab-actions` | `L5-vocab-maison` | 133 |
| `L5-vocab-actions` | `L5-vocab-travail` | 127 |
| `L4-conversation` | `L4-repas` | 110 |
| `L5-conversation` | `L5-quotidien` | 109 |
| `L5-vocab-actions` | `L5-vocab-restaurant` | 100 |
| `L4-conversation` | `L4-deplacements` | 99 |
| `L4-vocab-actions` | `L4-vocab-travail` | 99 |
| `L4-vocab-actions` | `L4-vocab-nature` | 96 |
| `L5-vocab-actions` | `L5-vocab-nature` | 96 |
| `L5-conversation` | `L5-repas` | 93 |
| `L4-conversation` | `L4-travail` | 92 |
| `L5-conversation` | `L5-ressentis` | 92 |
| `L5-conversation` | `L5-deplacements` | 83 |
| `L6-conversation` | `L6-repas` | 80 |
| `L4-vocab-actions` | `L4-vocab-maison` | 77 |
| `L5-vocab-actions` | `L5-vocab-loisirs` | 73 |

## Bilan des cellules langue × niveau

| Langue | Niveau | Cartes affichées | Lues | Déplacements | Incertains | Plus grosse situation (avant → après) |
|---|---:|---:|---:|---:|---:|---|
| ar | L4 | 589 | 589 | 161 | 72 | `L4-conversation` 231 → 130 |
| ar | L5 | 674 | 674 | 205 | 89 | `L5-conversation` 280 → 138 |
| ar | L6 | 429 | 429 | 108 | 69 | `L6-conversation` 268 → 189 |
| de | L4 | 589 | 589 | 14 | 1 | `L4-quotidien` 103 → 102 |
| de | L5 | 704 | 704 | 9 | 4 | `L5-travail` 92 → 92 |
| de | L6 | 423 | 423 | 1 | 6 | `L6-quotidien` 77 → 78 |
| en | L4 | 436 | 436 | 116 | 29 | `L4-conversation` 105 → 99 |
| en | L5 | 672 | 672 | 239 | 39 | `L5-conversation` 124 → 101 |
| en | L6 | 443 | 443 | 19 | 37 | `L6-conversation` 96 → 89 |
| es | L4 | 567 | 567 | 113 | 35 | `L4-conversation` 220 → 159 |
| es | L5 | 565 | 565 | 156 | 38 | `L5-conversation` 234 → 187 |
| es | L6 | 485 | 485 | 99 | 54 | `L6-conversation` 218 → 167 |
| fr | L4 | 579 | 579 | 178 | 25 | `L4-conversation` 165 → 115 |
| fr | L5 | 638 | 638 | 229 | 57 | `L5-conversation` 215 → 174 |
| fr | L6 | 388 | 388 | 67 | 32 | `L6-conversation` 132 → 95 |
| hi | L4 | 589 | 589 | 141 | 77 | `L4-conversation` 202 → 130 |
| hi | L5 | 674 | 674 | 173 | 139 | `L5-conversation` 223 → 175 |
| hi | L6 | 429 | 429 | 143 | 37 | `L6-conversation` 208 → 157 |
| it | L4 | 605 | 605 | 207 | 71 | `L4-conversation` 178 → 131 |
| it | L5 | 643 | 643 | 242 | 58 | `L5-conversation` 159 → 130 |
| it | L6 | 384 | 384 | 89 | 40 | `L6-conversation` 128 → 104 |
| ja | L4 | 608 | 608 | 88 | 66 | `L4-conversation` 199 → 153 |
| ja | L5 | 651 | 651 | 74 | 50 | `L5-conversation` 135 → 120 |
| ja | L6 | 414 | 414 | 62 | 38 | `L6-conversation` 138 → 106 |
| ko | L4 | 580 | 580 | 94 | 41 | `L4-conversation` 170 → 127 |
| ko | L5 | 657 | 657 | 68 | 38 | `L5-conversation` 163 → 148 |
| ko | L6 | 431 | 431 | 75 | 41 | `L6-conversation` 144 → 111 |
| pt | L4 | 589 | 589 | 131 | 64 | `L4-conversation` 189 → 124 |
| pt | L5 | 674 | 674 | 155 | 119 | `L5-conversation` 195 → 156 |
| pt | L6 | 429 | 429 | 121 | 32 | `L6-conversation` 202 → 159 |
| ru | L4 | 589 | 589 | 147 | 67 | `L4-conversation` 199 → 126 |
| ru | L5 | 674 | 674 | 161 | 134 | `L5-conversation` 213 → 172 |
| ru | L6 | 429 | 429 | 129 | 39 | `L6-conversation` 211 → 171 |
| zh | L4 | 623 | 623 | 34 | 21 | `L4-conversation` 96 → 86 |
| zh | L5 | 642 | 642 | 121 | 24 | `L5-conversation` 147 → 96 |
| zh | L6 | 485 | 485 | 76 | 33 | `L6-conversation` 119 → 84 |

Le détail par rubrique, avec l'effectif avant et après et l'indication « touchée / inchangée après lecture », figure dans le JSON (`cells[].themes`). Une rubrique marquée `touched: false` a été lue sans qu'aucun changement soit nécessaire.
## Concordance avec les 18 propositions déjà vérifiées par Codex (L6)

L'audit retrouve indépendamment les 18 propositions, avec la même destination dans tous les cas. Six d'entre elles avaient été jugées incertaines à la lecture : les trois cartes sur le notaire et les trois sur les bouchons. Comme leur destination concorde avec l'exemple vérifié, elles sont repassées en `proposed`, avec la mention correspondante dans `reason`.

## Constats propres à L4–L6

- **Classement selon la grammaire plutôt que le sens** : en L4 et L6, les banques es, it, ja et ko rangent dans `deplacements` beaucoup de phrases au futur proche (« je vais ranger », « je vais me marier »). Le verbe « aller » semble avoir déclenché un classement automatique. Ces phrases sont redistribuées selon leur domaine, et la règle de placement automatique mérite d'être vérifiée.
- **`conversation` sert de fourre-tout** dans les banques hi, ru, pt et ar à chaque niveau, ainsi qu'en es et zh en L5. On y trouve de la santé, du logement, de l'informatique, des démarches et des achats. En L6, les phrases de sourcing B2B (OEM, MOQ, échantillons, normes) sont envoyées vers `L6-travail`.
- **`L6-souhaits` et `L6-relations` n'existent qu'en français.** Les vœux et encouragements des autres langues qui iraient vers `L6-souhaits` figurent donc dans `targetAbsent`. Il faut décider d'étendre ces thèmes aux 11 autres langues.

## Propositions distinctes : fusion, création et renommage de thèmes (non appliquées)

1. **Météo et saisons** : il n'existe aucun thème de situation consacré à la météo de L4 à L6 non plus. Les déplacements correspondants restent incertains (voir le lot L1–L3).
2. **Loisirs, culture et sport** : il n'y a pas de thème de situation de L4 à L6. Ces phrases sont dispersées entre `repas`, `conversation`, `saluer` et `deplacements`.
3. **Numérique, téléphone et banque** (L5–L6) : les applis, mots de passe, l'hameçonnage, les comptes bancaires et les appels n'ont pas de thème. Proposition : « Numérique et téléphone » ou « Démarches, banque et numérique ».
4. **Études et formation** (L4–L6) : l'université, les examens et les diplômes sont rangés à titre provisoire dans `quotidien` ou `travail`.
5. **Fêtes, coutumes et traditions** (L4, L6) : Diwali, Holi, l'Aïd, Noël, les superstitions et le banya sont dispersés selon les banques. Proposition : « Fêtes et traditions ».
6. **Sourcing et commerce international** (L5–L6) : ces phrases sont très nombreuses. Proposition : un sous-thème « Négocier avec un fournisseur », distinct de `travail`.
7. **Services du quotidien** (L4) : coiffeur, poste, colis, salle de sport. Proposition : « Services et démarches ».
8. **Vocabulaire** :
   - créer « Langues et apprentissage » (prononciation, dictionnaire, accent) ;
   - créer « Numérique » ;
   - créer « Vêtements » ;
   - créer « Notions abstraites et société » ;
   - `vocab-actions` reste un fourre-tout à chaque niveau.
9. **Titres à revoir** :
   - `L4-repas` « Raconter une sortie » → « Sorties, repas et achats » ;
   - `L4-comprendre` « Vérifier ce qui s'est passé », qui contient surtout des formules de politesse et de téléphone ;
   - `L5-repas` → « Réservations, achats et services » ;
   - `L5-ressentis` → « Santé, problèmes et émotions » ;
   - `L5-decrire` « Choisir une solution adaptée » → « Décrire et comparer » ;
   - `L6-ressentis` « Donner les raisons d'un choix » → « Émotions, santé et préférences ».
10. **Frontières à clarifier** :
    - `L5-quotidien` et `L5-ressentis` pour les pannes ;
    - `L6-reperes` et `L6-quotidien` pour les habitudes passées.

## Points à vérifier par Codex

- **Doublons de sens dans une même banque** : ils sont listés dans `themeNotes` et ne concernent pas le classement.
- **Phrases complètes en section vocabulaire** : par exemple « Il gèle dehors », « Elle a rompu avec lui », « j'ai grillé la viande ». Elles sont laissées en place, sauf les cas flagrants, qui figurent dans `uncertain`.
- **Progression** : les remarques du lot L1–L3 s'appliquent aussi ici (recalcul des étapes, état des cartes conservé grâce à leur `id`).

## Fichier joint

`audit_L4-L6.json` a la même structure que `audit_L1-L3.json`. Le lot L7–L10 est en cours.
