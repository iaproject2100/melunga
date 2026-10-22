# Part de types écrits inédits — suivi indépendant

Comparaison figée des niveaux source de `bcd108d` et du parcours `99478df`. La nouvelle relecture donne des marches sans préciser son calcul exécutable, son périmètre ou son arrondi : **une hypothèse reproduit numériquement les sept lignes, sans établir que son implémentation est celle de Claude**.

## Hypothèse compatible et limites

On retient les quatre variantes entières de chaque unité, **sans les dialogues**. Pour les langues latines : groupes de lettres Unicode en minuscules, apostrophes et traits d’union séparateurs. Pour zh/ja/ko : caractères Unicode lettre/nombre ; le coréen est donc découpé en syllabes, alors que l’ancien `mesure_briques.py` conservait les blocs de syllabes. Aucune phonétique ne participe au calcul.

À chaque niveau : **types distincts absents de tous les niveaux précédents / types distincts du niveau**. Une répétition ne pèse rien de plus ; toutes les formes du niveau rejoignent ensuite l’ensemble précédent. Le tableau de la relecture est compatible avec la comparaison des pourcentages **arrondis à l’entier**, et non avec les seules fractions exactes.

Ces formes de surface ne sont ni des sens, ni des opérations grammaticales, ni des acquis. En coréen une syllabe connue ne prépare pas une terminaison ; en chinois ou japonais des caractères connus ne préparent pas un mot composé. La métrique est sans unité de longueur, mais reste sensible à la segmentation : elle ne classe pas les langues entre elles. L’ordre à l’intérieur d’un niveau n’y change rien.

## Marches : comparaison sans et avec arrondi

| Couple | Avant, ratios exacts | Après, ratios exacts | Avant, % entiers | Après, % entiers | Compatible avec le tableau |
| --- | --- | --- | --- | --- | --- |
| fr-en | L3<L4 · L6<L7 · L7<L8 · L9<L10 | L3<L4 · L6<L7 · L9<L10 | L3<L4 · L6<L7 · L7<L8 · L9<L10 | L3<L4 · L6<L7 · L9<L10 | oui |
| fr-es | L3<L4 · L7<L8 | L3<L4 · L7<L8 · L9<L10 | L3<L4 · L7<L8 | L3<L4 · L7<L8 | oui |
| fr-it | L3<L4 · L4<L5 · L6<L7 · L7<L8 | L4<L5 | L3<L4 · L4<L5 · L6<L7 · L7<L8 | L4<L5 | oui |
| fr-zh | L3<L4 · L6<L7 · L7<L8 | L3<L4 · L7<L8 | L3<L4 · L6<L7 · L7<L8 | L3<L4 · L7<L8 | oui |
| fr-ja | L6<L7 · L7<L8 | — | L6<L7 · L7<L8 | — | oui |
| fr-ko | L4<L5 · L6<L7 · L7<L8 · L9<L10 | L4<L5 · L6<L7 | L4<L5 · L6<L7 · L7<L8 · L9<L10 | L4<L5 · L6<L7 | oui |
| zh-fr | L6<L7 | L3<L4 · L8<L9 | L6<L7 | L8<L9 | oui |

Deux marches exactes sont masquées par cet arrondi dans `99478df` : **fr→es L9 = 39/103 = 37,864 % → L10 = 50/130 = 38,462 %** (38 → 38), et **zh→fr L3 = 64/113 = 56,637 % → L4 = 63/111 = 56,757 %** (57 → 57). Leur petite taille ne prouve pas un défaut pédagogique ; il faut seulement rendre le seuil de lecture explicite.

## Espagnol et français pour sinophones : numérateurs et dénominateurs

| Couple | Niveau | Source : nouveaux / types | `99478df` : nouveaux / types |
| --- | --- | --- | --- |
| fr-es | L1 | 63/63 = 100.000 % | 63/63 = 100.000 % |
| fr-es | L2 | 69/85 = 81.176 % | 97/121 = 80.165 % |
| fr-es | L3 | 55/89 = 61.798 % | 59/103 = 57.282 % |
| fr-es | L4 | 68/105 = 64.762 % | 70/110 = 63.636 % |
| fr-es | L5 | 66/105 = 62.857 % | 65/105 = 61.905 % |
| fr-es | L6 | 62/124 = 50.000 % | 68/142 = 47.887 % |
| fr-es | L7 | 41/114 = 35.965 % | 37/107 = 34.579 % |
| fr-es | L8 | 63/132 = 47.727 % | 39/92 = 42.391 % |
| fr-es | L9 | 48/113 = 42.478 % | 39/103 = 37.864 % |
| fr-es | L10 | 52/135 = 38.519 % | 50/130 = 38.462 % |
| zh-fr | L1 | 69/69 = 100.000 % | 69/69 = 100.000 % |
| zh-fr | L2 | 64/88 = 72.727 % | 76/102 = 74.510 % |
| zh-fr | L3 | 60/99 = 60.606 % | 64/113 = 56.637 % |
| zh-fr | L4 | 55/96 = 57.292 % | 63/111 = 56.757 % |
| zh-fr | L5 | 52/105 = 49.524 % | 58/116 = 50.000 % |
| zh-fr | L6 | 40/106 = 37.736 % | 64/148 = 43.243 % |
| zh-fr | L7 | 50/106 = 47.170 % | 30/76 = 39.474 % |
| zh-fr | L8 | 62/142 = 43.662 % | 29/85 = 34.118 % |
| zh-fr | L9 | 45/122 = 36.885 % | 44/124 = 35.484 % |
| zh-fr | L10 | 50/156 = 32.051 % | 50/156 = 32.051 % |

**fr→es** : les deux remontées visibles après arrondi restent L3→L4 et L7→L8. Elles subsistent mais leur taille change : **57,282→63,636 %** et **34,579→42,391 %**, contre **61,798→64,762 %** et **35,965→47,727 %** auparavant. Une liste de marches inchangée ne signifie donc pas que toutes les charges sont inchangées. Le JSON donne les types exacts, leur provenance et les contributions non additives des unités pour distinguer nouvelles formes, lexique et construction.

**zh→fr** : la remontée visible se déplace de L6→L7 (**37,736→47,170 %**) à L8→L9 (**34,118→35,484 %**). C’est un écart de **1,366 point**, qui appelle l’examen des unités et de leurs opérations, sans chercher à l’effacer mécaniquement.

## Sensibilité au périmètre et au découpage

Le JSON conserve aussi trois calculs alternatifs : variantes seules avec l’ancien découpage ; variantes + dialogues restés à leur niveau source avec l’ancien découpage ; même périmètre étendu avec le découpage compatible. Les dialogues n’ayant pas de reclassement dans ce lot, leur maintien au niveau source est seulement un scénario de sensibilité. Il ne décrit pas une progression de dialogues prête à publier.

| Couple | Ancien découpage, variantes seules : avant → après | Ancienne mesure avec dialogues non déplacés : avant → après |
| --- | --- | --- |
| fr-en | L3<L4 · L6<L7 · L7<L8 · L9<L10 → L3<L4 · L6<L7 · L9<L10 | L3<L4 · L6<L7 · L7<L8 · L9<L10 → L3<L4 · L6<L7 · L7<L8 · L9<L10 |
| fr-es | L3<L4 · L7<L8 → L3<L4 · L7<L8 | L4<L5 · L7<L8 → L4<L5 · L7<L8 · L9<L10 |
| fr-it | L3<L4 · L4<L5 · L6<L7 · L7<L8 → L4<L5 | L3<L4 · L6<L7 · L9<L10 → L6<L7 · L9<L10 |
| fr-zh | L3<L4 · L6<L7 · L7<L8 → L3<L4 · L7<L8 | L3<L4 · L6<L7 · L7<L8 → L5<L6 · L6<L7 · L9<L10 |
| fr-ja | L6<L7 · L7<L8 → — | L6<L7 · L7<L8 → L2<L3 · L8<L9 |
| fr-ko | L4<L5 · L6<L7 → L3<L4 · L4<L5 · L6<L7 | L3<L4 · L4<L5 · L6<L7 · L9<L10 → L4<L5 · L6<L7 · L9<L10 |
| zh-fr | L6<L7 → L8<L9 | L6<L7 · L7<L8 → L7<L8 |

841 unités, 3 364 variantes et 11488 champs conformes aux sources figées sont contrôlés avant le calcul. Les empreintes des 70 fichiers actifs, du parcours et du script ancien figurent dans le JSON. Aucune source, phonétique, affectation de niveau ou donnée d’exécution n’est modifiée par cet audit.

## Candidat supplémentaire

Le candidat est mesuré séparément et conserve la référence figée ci-dessus. Son empreinte figure dans le JSON.

| Couple | Marches exactes `99478df` → candidat | Marches après arrondi `99478df` → candidat |
| --- | --- | --- |
| fr-en | L3<L4 · L6<L7 · L9<L10 → L3<L4 · L6<L7 · L9<L10 | L3<L4 · L6<L7 · L9<L10 → L3<L4 · L6<L7 · L9<L10 |
| fr-es | L3<L4 · L7<L8 · L9<L10 → L3<L4 · L7<L8 · L9<L10 | L3<L4 · L7<L8 → L3<L4 · L7<L8 |
| fr-it | L4<L5 → L4<L5 | L4<L5 → L4<L5 |
| fr-zh | L3<L4 · L7<L8 → L3<L4 · L7<L8 | L3<L4 · L7<L8 → L3<L4 · L7<L8 |
| fr-ja | — → — | — → — |
| fr-ko | L4<L5 · L6<L7 → L4<L5 · L6<L7 | L4<L5 · L6<L7 → L4<L5 · L6<L7 |
| zh-fr | L3<L4 · L8<L9 → L3<L4 · L8<L9 | L8<L9 → L8<L9 |
