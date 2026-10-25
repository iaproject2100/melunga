# Lot 5 — quatre paires aide/lecture atomiques

Le registre [revue-claude-lot5.json](revue-claude-lot5.json) reprend les deux
preuves de `62daa86`, sur les avant `f22202c`. Quatre aides et quatre lectures
liées forment quatre paires atomiques ; les huit événements ne sont jamais
transformés en règle à étendre aux autres cartes.

| Identifiant | Correction de la lecture présente |
|---|---|
| 3630 | 食洗機 : shokusenki, pas la lecture de 食器洗い機 |
| 3771 | に rendu ni, pas la lecture e de へ |
| 2400 | さよなら sans voyelle longue ajoutée |
| 4320 | ボディ sans voyelle longue ajoutée ; ソー reste long |

La couche s’applique après le contenu du lot 4, avec annotation
`lot5FieldCorrection` et déclaration de manifeste `lot5FieldCorrections`.
Les quatre canoniques et la copie de 4320 donnent **cinq objets / dix valeurs**.
Les trois paires actives sont utilisables ; 3771 reste un modèle en réserve
sans étape de production.

Les profils avant complets, valeurs après, annotations antérieures et copies
sont contrôlés. Un avant inattendu, une lecture seule ou une aide seule après
modification, une copie périmée ou une annotation forgée est refusé. Une
régénération repart des sources puis réapplique les valeurs figées ; source
et provenance historiques ne sont pas réécrits.

Les [26 gloses](../../corrections-contenu/lot5/README.md) sont un registre distinct
appliqué ensuite. Cette première couche ne change pas les cibles, sens, types,
placements, niveaux, rôles, étapes ou accès ; les autres lectures restent
conservées. La lecture romaji japonaise reste affichée en complément de l’aide
par l’interface existante, sans changement du comportement du Pinyin chinois.

[Contre-lecture et limites](../../reponse-revue-integrale-lot5/alignements-contenu.md).
Aucune fusion ni publication de production.
