# Conservation du contenu lors du découpage d’affichage

Le test Node utilise la fonction pure `partitionGroupBoundaries(weights)` extraite du contrôleur réellement livré dans la branche de revue. Il n’exécute aucun DOM et ne réimplémente pas l’algorithme de répartition.

Référence des contenus et du constructeur natif : `f25250627f94334fd097a4eed0d4da814d65561f`.

- Contrôleur testé : `a4d3864167810eb352c8cfbe55b02a1732135b9c6abeb5e1f48217d37f8c436b`.
- Fonction pure extraite : `3d9181d0ed5622122772189a9b01daab36a6ed3e58556cb0510e92f692e63f44`.
- Résultat final : **5 tests réussis**, aucune erreur, **125 empreintes stables** durant l’exécution.

## Sources conservées

Les **78 fichiers JSON des cours revus**, les **8 JSON du catalogue natif**, les droits et le constructeur natif sont comparés octet pour octet avec la référence. Les **33 fichiers graphiques** présents dans cette référence sont également identiques : 27 ressources graphiques d’origine et 6 aperçus historiques déjà publiés.

Le vrai constructeur des 35 cours natifs supplémentaires s’exécute avec le vrai dictionnaire, avec des lectures locales vérifiées du catalogue. Ses 350 vues paire/niveau sont comparées intégralement aux sorties du constructeur et du dictionnaire de référence. Aucun compte, paiement ou fournisseur audio n’est appelé.

## Rubriques et étapes

Les **8 800 thèmes** des 42 paires et de leurs dix niveaux ont été examinés. Les **302 rubriques dépassant 100 présentations** sont découpées sans couper leurs groupes préparés :

| Source | Rubriques longues | Présentations | Pas guidés | Étapes de 30–40 cartes |
|---|---:|---:|---:|---:|
| 7 cours revus | 67 | 11 809 | 35 427 | 337 |
| 35 cours natifs supplémentaires | 235 | 38 918 | 116 754 | 1 120 |
| Total | 302 | 50 727 | 152 181 | 1 457 |

Les 50 727 présentations sont additionnées par paire, niveau et rubrique ; il ne s’agit pas d’autant de modèles canoniques uniques. Les autres rubriques restent en un seul bloc.

Pour chaque thème, le test vérifie :

- Les frontières contiguës, sans groupe omis, répété ou coupé.
- La liste complète des identifiants de cartes et son ordre exact.
- Tous les objets de pas, leur identité, leurs champs et leur ordre exacts.
- Le thème complet avant/après, y compris titre, photo et métadonnées.
- Les plages de progression, sans trou ni chevauchement, de 1 au total du thème.
- Le déterminisme du résultat et les bornes de 30 à 40 cartes pour les rubriques longues.

Le plus grand groupe technique actuel contient cinq cartes. Aucune des 302 rubriques longues n’est impossible à répartir. Elles ne contiennent actuellement ni préparation, ni interlocuteur, ni modèle à compléter, ni réemploi, ni doublon interne. Les **7 320 pas de révision** présents dans les rubriques revues restent conservés.

## Références indépendantes

| Rubrique | Découpage attendu et vérifié |
|---|---|
| fr-es L2 « Poser et reprendre une question », 309 cartes | 30, 35, 35, 35, 35, 35, 35, 35, 34 |
| fr-zh L2 même rubrique, 149 cartes | 35, 35, 40, 39 |
| ko-fr L2 même rubrique, 229 cartes | 30, 30, 30, 35, 35, 35, 34 |
| fr-zh L10 « Adjectifs », 387 cartes | dix étapes de 35, puis 37 |

Les **42 premiers thèmes L1** comptent de **11 à 29 cartes** : chacun reste une seule leçon, ce qui préserve le chemin d’entrée directe. Les cas synthétiques vérifient le seuil exact de 100, les poids invalides et les distributions atomiques impossibles ; un échec est signalé sans scinder artificiellement un groupe.

## Reproduction

```sh
LONG_SEQUENCES_CONSERVATION_REPORT=docs/sequences-longues-actualisees/conservation.json \
  node --test melunga_deploy/tests/long-sequences-partition.test.cjs
```

`conservation.json` contient les 302 partitions, leurs plages, les empreintes complètes des listes de cartes, des pas et des thèmes, ainsi que les 42 contrôles d’entrée L1.

Cette preuve concerne le contenu complet et la fonction de répartition. Le filtre d’accès doit rester appliqué avant le découpage : en accès gratuit, par exemple, les rubriques L2 française→espagnole et française→chinoise retenues pour les aperçus ne contiennent respectivement que 2 et 5 cartes autorisées. La navigation réelle, l’enregistrement de progression et le rendu mobile/ordinateur sont vérifiés séparément par les tests navigateur de la branche de revue.
