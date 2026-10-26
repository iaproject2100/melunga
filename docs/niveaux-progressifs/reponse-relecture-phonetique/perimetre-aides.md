# Périmètre des aides : 334 copies sans statut, 1 668 entrées nouvelles

**Les 334 lignes sans statut sont toutes des copies exactes du catalogue, pas 334 créations à ajouter au périmètre.** Le nombre de 1 715 `pending-Claude` est un nombre d’occurrences dans les dossiers : après retrait de copies redondantes et d’une aide entière reprise, il retrouve exactement les **1 668 entrées nouvelles annoncées**. Ce contrôle ne valide aucune phonétique linguistiquement.

## Références et méthode

Lecture indépendante des objets Git figés à `90a3433`, contre la relecture et les scripts de Claude à `295adf3`. Aucun compilateur produit n’est importé, aucune donnée produit ou ledger n’est modifié. Les empreintes, les 334 localisateurs et valeurs copiées, ainsi que les renvois redondants, sont dans [perimetre-aides.json](perimetre-aides.json). [perimetre-reproduire.py](perimetre-reproduire.py) permet de rejouer les contrôles.

Deux adaptations de harnais sont explicites : la référence distante `origin/review/themes-niveaux-progressifs` du script initial est remplacée par l’objet figé `90a3433` ; les conversations sont lues par leurs chemins d’archive dans `docs/niveaux-progressifs/`, pas dans un dossier produit absent. Aucune source n’est déplacée pour satisfaire le script.

Comme `phon1.py`, le relevé parcourt les deux dossiers `enrichissement-situations` et `corrections-themes`, puis les cinq listes de premier niveau `items`, `receivedTurns`, `lexicalSupports`, `entries`, `introductions`. **Ce n’est pas un décompte de toutes les aides du site ni de tous les objets imbriqués des archives conversation.** Les 87 fichiers examinés donnent 2 965 objets portant `phon` dans ce périmètre :

| Statut déclaré | Occurrences |
| --- | ---: |
| `pending-Claude` | 1 715 |
| `existing-verbatim` | 535 |
| `source-exact-preserved` | 381 |
| Statut absent | 334 |

## Les 334 lignes identifiées, au caractère près

Elles viennent de **deux fichiers seulement** : `corrections-themes/introductions-nombres.json` (223) et `corrections-themes/introductions-phrases-L1.json` (111). Chaque ligne porte son couple, son `sourceIndex`, son niveau source et le hash de la carte entière. Les **334 identités couple/index sont distinctes**.

| Couple | Nombres | Phrases L1 | Total |
| --- | ---: | ---: | ---: |
| fr→en | 30 | 22 | 52 |
| fr→es | 28 | 16 | 44 |
| fr→it | 32 | 15 | 47 |
| fr→zh | 36 | 4 | 40 |
| fr→ja | 32 | 21 | 53 |
| fr→ko | 32 | 17 | 49 |
| zh→fr | 33 | 16 | 49 |
| **Total** | **223** | **111** | **334** |

Vérification directe contre `DECKS` dans `app.html` à la même révision : **1 144 champs présents comparés, zéro écart** (`study`, `native`, `phon`, et `reading` lorsqu’elle est recopiée), plus les **334 hashes de cartes entières et niveaux source**. Pour les francophones, le champ source phonétique est `pf` en en/es/it/ja/ko et `phf` en zh ; pour les sinophones étudiant le français, c’est `phon`, avec `cn` pour le sens. Les lectures présentes renvoient à `py`.

Treize de ces cartes sont aussi référencées dans les situations des dix-huit pistes : trois en anglais, trois en japonais, cinq en coréen et deux en français pour sinophones. Ce sont treize renvois supplémentaires vers les mêmes cartes entières ; ils ne deviennent pas treize prononciations nouvelles. Chaque renvoi exact est indiqué dans `sameCanonicalSourceReferences` du JSON.

L’absence de `phoneticReviewStatus` est donc une **lacune de qualification du dossier**, pas une absence de provenance ni une preuve de rédaction nouvelle. Chacune des 334 lignes de preuve propose explicitement `source-exact-preserved`, avec `classificationAppliedToLedger: false` : la qualification est prête à relire, sans changement silencieux des sources. Une copie exacte peut toujours nécessiter une relecture de méthode : son ancienneté ne la rend pas juste.

## Pourquoi 1 715 et 1 668 sont compatibles

| Ajustement du relevé brut | Occurrences retranchées |
| --- | ---: |
| Complément chinois avancé copié également dans `extension-fr-zh.json` | 30 |
| `candidate-reference` vers des entrées du précédent lot lexical déjà comptées | 16 |
| Aide entière `LAÏT` de `light`, réemployée depuis le catalogue pour un nouveau sens | 1 |
| **Total redondant ou non nouvellement transcrit** | **47** |

**1 715 − 30 − 16 − 1 = 1 668.**

Le complément chinois contient en fait **31 lignes** : 24 productions et sept répliques reçues, toutes reprises au caractère près dans le ledger principal. Trente sont `pending-Claude`, la dernière `existing-verbatim`. Retirer trente du compteur pending ne supprime donc pas une étape ni une réplique : cela évite de compter deux fichiers de provenance comme deux créations.

Les seize renvois lexicaux appartiennent à l’extension espagnole (onze occurrences) et chinoise (cinq). Leurs champs entiers coïncident avec les entrées canoniques `editorial:new-*` du précédent lot de 140. Les sources et les reprises restent à relire si leur aide est encore pending ; une reprise de cette même aide n’ajoute pas une création indépendante.

Le cas `new-fr-en-light` reste une entrée avec sens nouvellement rédigé, mais son aide `LAÏT` est explicitement reprise entière de `DECKS.en[3936].pf`. C’est pourquoi le tableau lexical annonce **140 entrées, 139 aides nouvelles**, et le tableau des situations **1 529 formes nouvellement rédigées** : **1 529 + 139 = 1 668**.

Ces 1 668 lignes ont 1 668 identités complètes distinctes par couple (`study/native/phon/reading`) et 1 668 couples `study/phon` distincts. Elles ont **1 667 graphies d’aide distinctes** par couple : en chinois, 自私 et 紫色 partagent `tseu seu`. Ce dernier décompte n’est pas une raison de confondre les deux mots ni une validation de la qualité de leur repère.

## Étendue du contrôle de conservation

Les **1 250 lignes déclarées ou établies comme copies** (535 + 381 + 334) ont été comparées à leur provenance, indépendamment de leurs statuts : catalogue par index et hash de carte, conversation par chemin/pointeur et hashes du fichier et de l’objet, et référence à un candidat par son identifiant source. Résultat : **4 176 champs comparés, zéro écart**. Les seize renvois pending et les 31 lignes du complément font également l’objet d’une comparaison entière séparée, détaillée dans le JSON.

Ce constat répond à la question de périmètre. Il ne tranche ni la convention coréenne, ni le `ss` espagnol, ni les valeurs des caractères d’aide chinois ; il ne déduit aucune correction de fragments. Les réserves linguistiques de Claude restent à instruire sur les phrases entières. Aucun statut de validation, de production ou d’acquisition n’est ajouté ici. Aucun changement des cartes, aucune fusion ni publication de l’application.

Pour reproduire :

```sh
python3 -B docs/niveaux-progressifs/reponse-relecture-phonetique/perimetre-reproduire.py
```
