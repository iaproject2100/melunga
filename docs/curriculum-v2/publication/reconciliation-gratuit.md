# Réconciliation indépendante des comptages du gratuit

Base historique examinée : `bb9f904`. Aucune modification produit ni de catalogue.

## Résultat

Les deux séries se reproduisent intégralement, avec deux conventions différentes. Les nombres de Claude sont exactement ceux de l’union des **textes étudiés uniques `t`**, entre **toutes** les cartes brutes `lv===1` (avant filtrage de thème) et les cibles du guidé L1. La série du manifeste correspond à l’union des **indices de cartes effectivement accessibles** depuis `activeDeck()` classique et `guidedPool()` L1.

Il s’agit d’une reproduction exacte de ses chiffres, pas d’une inspection de son implémentation.

| Couple | Cartes historiques accessibles | Ajout brut hors filtre biz | Réduction doublons de texte | Textes uniques bruts = Claude |
|---|---:|---:|---:|---:|
| fr-en | 342 | +0 | −0 | 342 |
| fr-es | 300 | +1 | −0 | 301 |
| fr-it | 347 | +3 | −5 | 345 |
| fr-zh | 331 | +0 | −0 | 331 |
| fr-ja | 305 | +3 | −9 | 299 |
| fr-ko | 284 | +3 | −4 | 283 |
| zh-fr | 309 | +0 | −0 | 309 |

**Vérification directe supplémentaire** : les fonctions originales `activeDeck`, `guidedActiveDeck`, `guidedPool`, `sourcingRelevant`, `isFreeCard`, extraites du vrai HTML historique, ont été exécutées dans une VM Node isolée. Les sept listes d’indices obtenues sont identiques au manifeste actuel, pas seulement leurs totaux.

## Différences par couple

### fr-es

300 + 1 - 0 = 301.

Cartes brutes lv1 historiquement masquées par le filtre `th:biz` (toutes ont bien une traduction et un niveau) :

- index 3497 : `Buena idea.` — bonne idée. Hors du pool classique, hors des références guidées gratuites. Aucune disparition liée à ce lot.

Groupes fusionnés si l’on compte uniquement `t` :

Aucun.

### fr-it

347 + 3 - 5 = 345.

Cartes brutes lv1 historiquement masquées par le filtre `th:biz` (toutes ont bien une traduction et un niveau) :

- index 2548 : `da fare` — à faire. Hors du pool classique, hors des références guidées gratuites. Aucune disparition liée à ce lot.
- index 2661 : `A meno che...` — À moins que.... Hors du pool classique, hors des références guidées gratuites. Aucune disparition liée à ce lot.
- index 2678 : `in corso` — en cours. Hors du pool classique, hors des références guidées gratuites. Aucune disparition liée à ce lot.

Groupes fusionnés si l’on compte uniquement `t` :

- `Prego.` : 6 : De rien. [lv1] ; 9 : Je vous en prie. [lv1].
- `Va bene.` : 2547 : Ça va. [lv1] ; 2671 : Ça marche. [lv1].
- `perché` : 2557 : parce que [lv1] ; 2731 : pourquoi [lv1].
- `Nessun problema.` : 2591 : Sans problème. [lv1] ; 2668 : Pas de problème. [lv1].
- `tuttavia` : 2804 : cependant [lv1] ; 2808 : néanmoins [lv1].

### fr-ja

305 + 3 - 9 = 299.

Cartes brutes lv1 historiquement masquées par le filtre `th:biz` (toutes ont bien une traduction et un niveau) :

- index 2952 : `やること` — à faire. Hors du pool classique, hors des références guidées gratuites. Aucune disparition liée à ce lot.
- index 3037 : `〜でなければ…` — À moins que.... Hors du pool classique, hors des références guidées gratuites. Aucune disparition liée à ce lot.
- index 3048 : `進行中` — en cours. Hors du pool classique, hors des références guidées gratuites. Aucune disparition liée à ce lot.

Groupes fusionnés si l’on compte uniquement `t` :

- `ごめんなさい。` : 3 : Désolé. [lv1] ; 7 : Je suis désolé. [lv1] ; 8 : Je suis désolé(e). [lv1].
- `すみません。` : 5 : Pardon. [lv1] ; 6 : Excusez-moi. [lv1].
- `可能です。` : 49 : C'est possible. [lv2] ; 2990 : Possible. [lv1].
- `まだ` : 2958 : pas encore [lv1] ; 3113 : encore [lv1].
- `今のところ` : 3043 : en ce moment [lv1] ; 3055 : pour l'instant [lv1].
- `後で` : 3058 : tout à l'heure [lv1] ; 3108 : après [lv1].
- `前に` : 3101 : devant [lv1] ; 3109 : avant [lv1].
- `面白い` : 3115 : intéressant [lv1] ; 3129 : drôle [lv1].

### fr-ko

284 + 3 - 4 = 283.

Cartes brutes lv1 historiquement masquées par le filtre `th:biz` (toutes ont bien une traduction et un niveau) :

- index 2105 : `할 일` — à faire. Hors du pool classique, hors des références guidées gratuites. Aucune disparition liée à ce lot.
- index 2189 : `아니라면…` — À moins que.... Hors du pool classique, hors des références guidées gratuites. Aucune disparition liée à ce lot.
- index 2200 : `진행 중` — en cours. Hors du pool classique, hors des références guidées gratuites. Aucune disparition liée à ce lot.

Groupes fusionnés si l’on compte uniquement `t` :

- `안녕하세요!` : 4 : Bonjour ! [lv1] ; 5 : Bonsoir ! [lv1].
- `문제없어요.` : 2141 : Sans problème. [lv1] ; 2196 : Pas de problème. [lv1].
- `첫 번째` : 2169 : le premier [lv1] ; 2323 : premier [lv1].
- `아기` : 2335 : un bébé [lv1] ; 2346 : un tout-petit [lv1].

## Convention recommandée pour le feu vert

Garder les chiffres du manifeste comme **droits historiques de cartes accessibles, par identité/indice**, en explicitant la convention dans le README. Les chiffres de Claude sont corrects pour un inventaire distinct de textes uniques du catalogue brut. Ils ne doivent pas servir à supprimer des cartes ou à tester l’égalité des droits : des cartes au même texte étudié peuvent porter des sens, traductions et niveaux différents. Le moteur classique `srsKey(d) = lang + "|" + d.t` partage en revanche sa clé de révision pour ces doublons ; ce compteur de cartes n’est donc pas non plus un nombre de clés SRS uniques.

En japonais, il n’y a donc pas six cartes perdues : 305 droits d’indices sont conservés. Le total 299 inclut trois cartes biz non atteignables auparavant et fusionne neuf occurrences de texte. Un des doublons, `可能です。`, regroupe même une carte source lv2 (offerte via le guidé) et une carte lv1. Une déduplication par texte ferait disparaître cette distinction.

Les aides francophones des doublons recensés sont identiques à l’intérieur des groupes, mais plusieurs sens/traductions diffèrent ; leurs identités complètes ne sont pas interchangeables. Le JSON annexe fournit chaque carte entière.

## Frontière gratuit/payant

Historiquement `FREE_LV=[1]`, donc `isFreeCard` teste bien le niveau catalogue 1. Le candidat garde cette base et ajoute un cas explicite pour les indices déjà gratuits dans l’ancien guidé L1 : dire qu’il ne teste **aujourd’hui que** `lv===1` serait inexact. Relever le niveau d’une carte du catalogue peut déplacer la frontière de base ; la présence éventuelle dans l’exception historique doit également être considérée. Ce lot ne change aucun niveau catalogue.

Ne pas confondre niveau pédagogique du nouveau cours, niveau source catalogue, appartenance à la liste historique gratuite et nombre de textes uniques.

## Preuve de droits complète, au-delà du routage visible

Le contrôle avant publication doit porter sur **F = toutes les cartes brutes lv1 ∪ cartes résolues de l’ancien guidé L1**. Les dix cartes th:biz masquées par activeDeck étaient et restent gratuites selon le prédicat isFreeCard, même si le routage ne les présentait pas. Les exclure d’un compteur de visibilité est correct ; les oublier dans une preuve de droits serait incomplet.

| Couple | Indices visibles historiques | Droits d’indices complets F | Textes uniques bruts = Claude | Perdus | Nouveaux |
|---|---:|---:|---:|---:|---:|
| fr-en |342|342|342|0|0|
| fr-es |300|301|301|0|0|
| fr-it |347|350|345|0|0|
| fr-zh |331|331|331|0|0|
| fr-ja |305|308|299|0|0|
| fr-ko |284|287|283|0|0|
| zh-fr |309|309|309|0|0|
| Total |2218|2228|2210|0|0|

`/tmp/melunga-free-rights-runtime-audit.cjs` reproduit ces résultats et compare **chaque indice**, pas uniquement le total. Il exécute les anciennes fonctions de résolution et les nouvelles fonctions isFreeCard/isLegacyFreeCard avec le véritable manifeste livré. Il vérifie les 32 115 cartes inchangées et l’absence de changement du prédicat hors des sept couples (35 couples non actifs). `--output` écrit la preuve complète avec les listes F avant/après ; aucun fichier produit n’est modifié.

Les cartes de source lv>1 du guidé étaient atteignables par l’ancien mode `path` (déverrouillé pour les non-payants, pool filtré sur `_path.pathLv===1`), bien que l’ancien prédicat classique `isFreeCard` les refusât. Le nouveau prédicat conserve ce droit issu du mode en exception explicite d’indices. Le contrôle « 0 nouveau » est donc relatif à l’union des droits bruts catalogue **et** du mode guidé, pas à l’ancien prédicat seul.
