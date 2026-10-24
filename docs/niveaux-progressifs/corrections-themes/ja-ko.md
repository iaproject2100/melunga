# Correction sémantique des rubriques japonais/coréen

Codex porte la sémantique et la progression ; Claude relit uniquement les phonétiques. Aucun champ des catalogues n’est modifié. Cette passe ne certifie pas globalement les 9 029 cartes.

Périmètre : 118 rubriques de moins de six cartes (350 cartes), plus 2076 cartes lexicales concrètes/de la rubrique Actions. Le JSON conserve les références et les textes/aides entiers.

Résultat : 1351 destinations corrigées, 539 destinations confirmées explicitement, 150 changements de type, classe ou condition d’emploi. Il ne s’agit pas de nouveaux mots ajoutés pour gonfler un compteur.

## Corrections représentatives

- `ja:4355` 金型費用 / le coût de moule → `vocab-travail`. La cible appartient aux métiers, études, démarches, outils de communication ou à la production/logistique ; elle est conservée entière. Cible source : 金型費用
- `ko:4024` 금형 비용 / le coût de moule → `vocab-travail`. La cible appartient aux métiers, études, démarches, outils de communication ou à la production/logistique ; elle est conservée entière. Cible source : 금형 비용
- `ja:4321` 搭乗ゲート / la porte d'embarquement → `vocab-voyage`. La cible désigne réellement un déplacement, un transport ou son infrastructure ; il ne s’agit pas d’un emploi figuré d’un verbe français. Cible source : 搭乗ゲート
- `ko:3915` 탑승구 / la porte d'embarquement → `vocab-voyage`. La cible désigne réellement un déplacement, un transport ou son infrastructure ; il ne s’agit pas d’un emploi figuré d’un verbe français. Cible source : 탑승구
- `ja:4093` 原材料 / la matière première → `vocab-travail`. La cible appartient aux métiers, études, démarches, outils de communication ou à la production/logistique ; elle est conservée entière. Cible source : 原材料
- `ko:3242` 원자재 / la matière première → `vocab-travail`. La cible appartient aux métiers, études, démarches, outils de communication ou à la production/logistique ; elle est conservée entière. Cible source : 원자재
- `ja:3324` ガラス / le verre → `vocab-maison`. ガラス est le matériau verre, distinct du récipient グラス (3294). Cible source : ガラス
- `ko:2473` 유리 / le verre → `vocab-maison`. 유리 est le matériau verre, distinct du récipient 컵 (2443). Cible source : 유리
- `ja:3513` 買い物 / la course → `vocab-restaurant`. 買い物 signifie les achats/courses, pas la course sportive. Cible source : 買い物
- `ko:2662` 달리기 / la course → `vocab-loisirs`. 달리기 est la course à pied, pas les courses/achats japonais de la carte parallèle. Cible source : 달리기
- `ja:4272` メジャー / un mètre → `vocab-maison`. メジャー désigne le mètre ruban, outil ; ce n’est pas le nombre ou l’unité « un mètre ». Cible source : メジャー
- `ko:3733` 일 미터 / un mètre → `vocab-reperes`. 일 미터 est l’unité de longueur « un mètre », distinct de l’outil メジャー japonais. Cible source : 일 미터
- `ja:4328` ターミナル / le terminal → `vocab-voyage`. ターミナル désigne ici un terminal de transport, distinct du terminal informatique coréen de la carte parallèle. Cible source : ターミナル
- `ko:3924` 단말기 / le terminal → `vocab-travail`. 단말기 est un terminal/appareil informatique, pas un aéroport. Cible source : 단말기
- `ja:3734` ドラム / la batterie → `vocab-loisirs`. ドラム est la batterie instrument de musique, pas une pile électrique. Cible source : ドラム
- `ko:2883` 드럼 / la batterie → `vocab-loisirs`. 드럼 est la batterie instrument, pas la batterie d’un appareil. Cible source : 드럼
- `ja:460` きっとできますよ！ / Tu vas y arriver ! → `conversation`. できます exprime l’encouragement à réussir, pas l’arrivée à une destination.
- `ko:283` 할 수 있을 거예요! / Tu vas y arriver ! → `conversation`. 할 수 있을 거예요 est un encouragement à réussir, sans arrivée physique.
- `ja:908` 信じられません。 / Je n'arrive pas à y croire. → `ressentis`. 信じられません exprime l’incrédulité, pas un trajet malgré « n’arrive pas » en français.
- `ko:966` 믿을 수가 없어요. / Je n'arrive pas à y croire. → `ressentis`. 믿을 수가 없어요 est une réaction d’incrédulité, sans mouvement.
- `ja:2268` 続けていれば、きっとできますよ。 / À force d'essayer, tu vas y arriver. → `conversation`. L’essai et la réussite sont le sens de la cible ; ni restaurant ni consommation ne sont concernés.
- `ko:1597` 계속하다 보면 꼭 될 거예요. / À force d'essayer, tu vas y arriver. → `conversation`. Essayer et réussir sont le sens de la cible, sans relation avec un repas.

## Formes adjectivales et vrais schémas ouverts

`큰`, `작은`, `무거운`, `가벼운` sont des formes adnominales entières. Elles restent dans Vocabulaire/Adjectifs avec `lexicalUsage.form: adnominal` et `requiresNounInUtterance: true`. Elles ne sont pas présentées comme des phrases autonomes. Leurs aides restent `keun`, `djak-eun`, `mou-go-oun`, `ga-byo-oun` telles qu’au catalogue.

En revanche `에서 멀리`, `보다 더`, `보다 나은`, `보다 적게`, `와 같은 것`, `보다 큰`, `보다 나쁜` laissent un support de particule/comparaison absent. `一袋の`, `一箱の`, `一杯の`, `한 잔의` attendent le contenu d’une mesure. Ils sont réservés sans inventer de mot ni de phonétique. `한 봉지` et `한 상자`, sans `의`, restent des groupes nominaux entiers : les deux langues ne sont pas forcées à suivre la même analyse.

## Dix nombres/quantités isolés supplémentaires

La moitié, un quart, un tiers, une douzaine et une dizaine sont maintenant `number`, dans les deux couples, avec tous leurs champs sources entiers. La progression finale commune place les fractions en L3, puis les quantités collectives et approximatives en L4, après les cardinaux déjà préparés. Ce ne sont pas de nouvelles cartes ni de nouvelles phonétiques.

`一ダース` et `열두 개` désignent exactement douze éléments : `numberKind: collective-quantity`, pas une approximation universelle. `十個ほど` et `열 개쯤` incluent réellement un marqueur approximatif natif : `approximate-quantity`, valeur centrale dix. La fraction exacte 1/3 est transportée sous forme rationnelle `[1,3]` ; aucune approximation décimale n’est présentée à l’apprenant.

| Couple | Index | Forme entière | Type numérique | Valeur exacte ou centrale |
|---|---:|---|---|---|
| fr-ja | 3346 | 半分 | fraction | 1/2 |
| fr-ja | 4142 | 四分の一 | fraction | 1/4 |
| fr-ja | 4244 | 三分の一 | fraction | 1/3 |
| fr-ja | 4178 | 一ダース | collective-quantity | 12 |
| fr-ja | 4329 | 十個ほど | approximate-quantity | environ 10 |
| fr-ko | 2495 | 절반 | fraction | 1/2 |
| fr-ko | 3291 | 사분의 일 | fraction | 1/4 |
| fr-ko | 3645 | 삼분의 일 | fraction | 1/3 |
| fr-ko | 3341 | 열두 개 | collective-quantity | 12 |
| fr-ko | 3926 | 열 개쯤 | approximate-quantity | environ 10 |

## Adjectifs demandés

| Concept | Japonais isolé sourcé | Coréen isolé sourcé | Première rencontre conseillée |
|---|---|---|---|
| grand | 3062 | 2213 | L1 |
| petit | 3063 | 2214 | L1 |
| gros-corpulence | Absent ; phrases entières listées au JSON | Absent ; phrases entières listées au JSON | L1 |
| beau-belle | Absent ; phrases entières listées au JSON | Absent ; phrases entières listées au JSON | L1 |
| leger-legere | 3076 | 2227 | L1 |
| lourd-lourde | 3075 | 2226 | L1 |
| radin | Absent ; phrases entières listées au JSON | Absent ; phrases entières listées au JSON | L3 |
| egoiste | Absent ; phrases entières listées au JSON | Absent ; phrases entières listées au JSON | L3 |
| triste | Absent ; phrases entières listées au JSON | Absent ; phrases entières listées au JSON | L1 |
| heureux | Absent ; phrases entières listées au JSON | Absent ; phrases entières listées au JSON | L1 |

Grand/petit portent d’abord sur la taille/volume. La taille humaine de `背が高い` / `키가 커요` est un autre cadre, repris dans ses phrases sources entières. Les traits radin/égoïste arrivent en L3 après les descriptions concrètes. Les genres français ne deviennent pas des accords japonais/coréens.

Les nouveaux mots du lot maître n’ont aucun doublon de graphie entière dans ces decks. `太い` conserve son sens gros/épais (objet) ; `うれしい` reste content/ravi lié à une occasion ; `幸せな` fournit séparément heureux/heureuse. Le JSON détaille leurs limites. Les nouvelles phonétiques du maître restent à relire par Claude.

## Couleurs

Quinze couleurs isolées par couple sont reprises entières et marquées `color`, dans une rubrique autonome. Rose = `ピンク` / `분홍색`, pas une rose-fleur. Orange-fruit = `3650` / `2799`, distinct de la série de couleur `3589` / `2738`. Doré et argenté = `金色` / `銀色`, `금색` / `은색`, distincts du métal ou de la monnaie. Les couleurs de base sont conseillées en L1, les teintes et les nuances plus tard ; cela ne modifie pas les niveaux d’accès du catalogue.

## Petites rubriques

Les demandes de toilettes passent en Déplacements ; les commandes « la même chose » passent en Repas. Il faut masquer les anciennes rubriques L1 alors vides. Pour Temps/Lieux, un regroupement explicite « Se repérer et se déplacer » est préférable à des tuiles d’un mot. Les chiffres restent une famille autonome.

Pour Comprendre au L1, quatre sources entières réellement utiles sont proposées : JA763/984, KO363/438. Elles ne nécessitent aucune phonétique reconstruite. Les petites familles lexicales ultérieures peuvent revenir à un répertoire de révision cohérent de la même famille et du même couple ; aucun intrus ne doit servir de remplissage. Le JSON indique une action pour chaque petite rubrique observée.

## Limites

Cette passe audite les cas cités et le périmètre lexical indiqué. Elle n’atteste ni la progression complète L1–L10 ni une acquisition de l’apprenant. La compilation et les 14 contrôles locaux passent sur le manifeste `bd78bc5e…` : 210 vues et 625 672 champs rendus comparés au JSON. Le rapport navigateur est lié dans le JSON compagnon ; aucun test sur téléphone physique ni site hébergé n’est revendiqué. Aucune publication ni fusion n’est effectuée.
