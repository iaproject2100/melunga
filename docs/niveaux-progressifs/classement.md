# Classement éditorial L1–L10 — proposition à relire

Les thèmes de situation et les rubriques de vocabulaire figurent dans la même grille, sans nouvel écran de sélection. Une situation ne présente que des phrases ou répliques communicatives entières. Les mots, groupes lexicaux et nombres isolés se pratiquent dans leurs rubriques dédiées. Les modèles ouverts et les cas incertains sont conservés dans une réserve de revue, hors entraînement.

**32115 cartes du catalogue** sont conservées exactement une fois, entre rubriques actives et réserve ; **110277 champs** restent identiques aux sources. Les **2134 cartes historiquement lv1** restent présentes avec leur niveau source. Les droits de l’application classique sont inchangés.

Le lot comporte **518 décisions explicites** de placement. Les **31597 autres cartes** gardent un niveau source non revu individuellement. Ni une partition complète ni la conservation des textes ne prouvent la progressivité ou l’acquisition.

## Typage et couverture

| Type | Nombre canonique | Destination |
|---|---:|---|
| Répliques et phrases entières | 22364 | Thèmes de situation |
| Vocabulaire | 8738 | Familles lexicales et catégories déclarées |
| Nombres isolés | 207 | Nombres |
| Modèles incomplets | 482 | Réserve, aucune étape |
| Cas à revoir | 367 | Réserve, aucune étape |

Total canonique : **32158** ; contenu actif : **31309** ; réserve : **849**. La réserve n’est ni supprimée de l’inventaire ni publiée comme une leçon de phrases complètes.

Les sept partitions s’appuient sur des indices et une empreinte du deck source. Elles distinguent la fonction communicative du lexème : Bonjour, Merci ou Oui peuvent former une réplique entière ; un groupe lexical de plusieurs mots peut rester du vocabulaire. Le nombre de mots, la ponctuation et la catégorie source ne constituent pas à eux seuls ce jugement. Les classements candidats et leurs raisons restent exposés pour revue. Les familles lexicales déduites de signaux ou de l’ancien domaine sont aussi des propositions, sans prétention de relecture exhaustive.

## Répartition active par niveau

| Couple | L1 | L2 | L3 | L4 | L5 | L6 | L7 | L8 | L9 | L10 | Réserve | Canonique |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| fr-en | 314 | 532 | 726 | 518 | 693 | 472 | 445 | 294 | 166 | 222 | 125 | 4507 |
| fr-es | 276 | 611 | 529 | 571 | 569 | 490 | 473 | 417 | 305 | 276 | 162 | 4679 |
| fr-it | 321 | 534 | 575 | 620 | 659 | 390 | 400 | 382 | 227 | 257 | 149 | 4514 |
| fr-zh | 287 | 563 | 572 | 685 | 653 | 503 | 462 | 506 | 282 | 307 | 91 | 4911 |
| fr-ja | 281 | 547 | 553 | 632 | 676 | 420 | 509 | 316 | 222 | 248 | 112 | 4516 |
| fr-ko | 286 | 458 | 556 | 608 | 691 | 438 | 519 | 395 | 233 | 263 | 79 | 4526 |
| zh-fr | 257 | 541 | 661 | 600 | 668 | 414 | 425 | 364 | 217 | 227 | 131 | 4505 |

## Réemploi de sources existantes

Phrases existantes importées depuis des variantes entières de conversation : **43**, avec **150 champs** copiés. Candidats exclus en attendant une décision sur l’aide ou le sens : **13**. Aucune phrase ni phonétique nouvelle n’est composée.

Chaque import vérifie le fichier source, la paire de langues, l’unité, l’indice de variante et les empreintes. Une copie exacte ne valide pas la conformité à la méthode phonétique de Kartech ; Claude doit encore la relire.

## Préparation prévue et limites

Les groupes internes comptent au maximum cinq expressions primaires et s’enchaînent directement. Les **349 modèles source explicites** restent en réserve, sans étape de compréhension, imitation, rappel ou audio dans les leçons.

Parmi les **360 marqueurs source de modèle**, **11 faux marqueurs** ont une exception explicite approuvée par indice : entrées lexicales bornées ou formules conventionnelles complètes. Leur source reste intacte ; leur statut n’autorise aucune phrase fabriquée à partir d’un mot.

Le graphe déclare **418 liens** : **295 liens entre répliques entières**, **76 liens lexicaux**, **37 liens touchant la réserve** et **10 liens entre d’autres types, non clos et à revoir**. Les supports lexicaux admissibles sont référencés par **56 `reuseVocabularyIds`** canoniques, au même niveau ou à un niveau antérieur documenté. Aucun mot ni nombre de ces références n’est inséré dans les étapes de situation.

Les reprises locales entre phrases entières ajoutent **15 références**, soit **30 étapes** de compréhension et d’imitation. Elles ne recopient pas la carte et n’augmentent pas le compteur primaire. Liens structurels sans fermeture de l’ordre éditorial : **0**. La fermeture globale vaut **false** ; les références lexicales prévues et les liens vers réserve ne sont pas présentés comme une préparation accomplie.

Les deux compteurs de position et de reprise ont des périmètres différents : `plannedPrerequisitesNotEarlier` compte **30 liens** dont le prérequis ne précède pas la cible dans l’ordre canonique ; `plannedPrerequisitesWithoutEarlierPresentation` compte **403 liens** sans reprise locale explicitement insérée, y compris des prérequis déjà antérieurs dans l’ordre prévu. Ils ne mesurent pas l’acquisition et ne sont pas interchangeables.

L’ordre entre thèmes reste libre. Un emplacement antérieur est un rendez-vous éditorial prévu, pas la preuve que la personne l’a parcouru ou acquis. Les étapes réellement ajoutées, les liens lexicaux, les réserves et les écarts sont détaillés séparément dans le JSON de rapport. Un cycle du graphe complet fait échouer la génération. Les dépendances à une source réservée restent des écarts explicites ; elles ne réintroduisent aucun modèle incomplet dans une leçon.

L’adjudication retirant le lien de 我是学生 à la carte 是, rendue « oui / c’est ça » dans la source, reste tracée. Aucun sens n’est réécrit pour faire passer une métrique. La revue globale de progressivité reste incomplète.

## Droits et diffusion

Le champ source lv du catalogue n’est jamais écrit. L’application classique, son filtre isFreeCard(lv === 1), les prix et les abonnements restent indépendants de editorialLevel. Une future intégration doit préserver les droits source ; verrouiller tous les niveaux éditoriaux supérieurs à L1 retirerait des cartes historiquement gratuites et n’est pas autorisé par ce classement.

Ces 70 fichiers constituent un aperçu de revue. Aucun contenu de cette proposition n’est publié dans les leçons de production par cet outil.

## Reproduction

```sh
python3 -B tools/maquette-guidee/build_levels.py
python3 -B tools/maquette-guidee/build_levels.py --check
```

Entrées : catalogue, plan de thèmes, décisions de placement, partitions sémantiques, politique de vocabulaire et snapshots conversation. Une identité, une partition, un niveau ou une empreinte incohérents fait échouer la génération. Le générateur et le JSON L1 approuvés restent intacts.

Empreinte du catalogue : `2fd6735db365ab869d8426bf879ef0106418698fbb9307b0eca60a5549b89d2a`.
