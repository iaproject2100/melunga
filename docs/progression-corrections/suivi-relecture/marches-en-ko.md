# Deux marches nouvelles : anglais L6/L7 et coréen L5/L6

**Statut après la seconde relecture :** Claude retire le grief des marches de longueur. Les retours EN vers L7 étudiés ci-dessous **ne sont pas adoptés**. Le candidat conserve leur placement L6 de `99478df` : la transition du récit passé vers le contraste de situations reste une possibilité, sans prétendre que le passé prépare à lui seul `used to`. Le [journal des décisions](decisions.json) fait foi. Cette analyse historique ne démontre pas qu’un autre placement soit obligatoire.

Suivi limité au classement de `99478df`. Les propositions ci-dessous sont des métadonnées à relire ; ce document ne les applique pas, ne modifie aucune source et ne mesure pas les acquis. Les citations proviennent des variantes exactes du paquet figé à ce commit.

## Mesure et limites

Pour retrouver les valeurs discutées : compter `re.findall(r"\w+", study)` en anglais ; compter les caractères de catégories Unicode lettre/nombre en coréen ; moyenner les quatre variantes de chaque unité. Les chiffres ne sont pas des niveaux de langue et ne sont pas comparables entre langues. Une apostrophe anglaise sépare ici deux tokens ; une syllabe coréenne précomposée compte pour un caractère.

## Anglais : la descente de deux contrastes temporels a créé la marche

| Ensemble | Somme des tokens / variantes | Moyenne |
| --- | --- | --- |
| L6 source | 336 / 48 | 7,0000 |
| L6 proposé dans `99478df` | 475 / 60 | 7,9167 |
| L7 source | 469 / 56 | 8,3750 |
| L7 proposé dans `99478df` | 395 / 52 | 7,5962 |

Le changement est entièrement décomposable :

| Unité | Déplacement de `99478df` | Tokens des quatre variantes | Moyenne |
| --- | --- | --- | --- |
| `L7-fr-en-08` | L7 → L6 | 50 | 12,50 |
| `L7-fr-en-09` | L7 → L6 | 52 | 13,00 |
| `L8-fr-en-07` | L8 → L6 | 37 | 9,25 |
| `L10-fr-en-13` | L10 → L7 | 28 | 7,00 |

Donc L6 = (336 + 50 + 52 + 37) / 60 ; L7 = (469 − 50 − 52 + 28) / 52. La nouvelle marche ne résulte pas d’un raccourcissement des phrases : les deux groupes les plus longs ont changé de niveau et la formule d’accord plus courte a rejoint L7.

### Alternative étudiée, non retenue : placer le contraste en fin de L7

Replacer `L7-fr-en-08` puis `L7-fr-en-09` **à la fin de L7**, aux positions 14 et 15. Le premier présente l’habitude passée révolue avec `used to` puis l’oppose à la situation actuelle avec `now` ; le second fait varier cette situation actuelle. Les unités de L6 organisent un projet, une invitation, un refus ou un accord : aucune ne dépend de cette paire de contrastes. Les bases L4 (habitudes présentes) et L5 (récit passé) restent nécessaires, mais ne suffisent pas à déclarer la construction `used to` déjà préparée.

La présence du passé ne prépare pas à elle seule une habitude révolue ni le contraste de deux situations. En fin de L7, la paire pourrait prolonger le travail discursif de comparaison et de point de vue ; en L6, le candidat l’introduit déjà par ses propres phrases entières après le récit passé. Cette alternative n’est donc pas une réparation imposée par les sources. Dans les deux placements, il ne s’agit pas d’une substitution productive réputée acquise.

Les seuls liens entrants vers cette paire sont `L7-fr-en-09` → `L7-fr-en-08` : aucune unité antérieure de projets ou d’invitation n’est ainsi privée d’un prérequis. Conserver `L8-fr-en-07` en fin de L6 prépare les promesses en `I’ll` réemployées dans les conditions L8. Conserver l’accord concret `L10-fr-en-13` en L7 reste cohérent avec l’avis.

Après ces deux corrections seulement, les moyennes seraient **L6 373/52 = 7,1731 ; L7 497/60 = 8,2833 ; L8 243/28 = 8,6786**. La marche L6>L7 disparaît ; c’est un effet descriptif de la décision, pas sa preuve pédagogique. Les autres non-monotonies anglaises, notamment L4>L5 et L8>L9, ne sont pas déclarées résolues par ce sous-lot.

### Exemples sources exacts

- `L7-fr-en-08` : « I used to take the train every day, now I work from home. »
- `L7-fr-en-09` : « I used to eat out a lot, now I cook every evening. »
- `L8-fr-en-07` : « I'm sorry, I'll fix it right away. »
- `L10-fr-en-13` : « I agree with you about the price. »

## Coréen : une composition différente, sans arrivée de longs récits en L5

| Ensemble | Somme des caractères / variantes | Moyenne |
| --- | --- | --- |
| L5 source | 422 / 48 | 8,7917 |
| L6 source | 422 / 48 | 8,7917 |
| L5 proposé dans `99478df` | 403 / 44 | 9,1591 |
| L6 proposé dans `99478df` | 422 / 48 | 8,7917 |

**Aucune unité de L7 n’est descendue en L5.** Le seul changement de composition de L5 est le départ de `L5-fr-ko-04` vers L3. Ses quatre répliques de nouvelles au présent totalisent 19 caractères ; retirer ces quatre variantes courtes donne exactement (422 − 19) / (48 − 4) = 403/44. L6 reste identique à sa source. La marche de 0,3674 caractère par variante est donc un effet de retrait, et non une augmentation de la complexité des énoncés conservés.

### Décision proposée : garder les relances au présent en L3

Ne pas replacer `L5-fr-ko-04` en L5 pour diminuer artificiellement sa moyenne. Les formes de nouvelles au présent servent aux relances précoces et n’introduisent pas de passé. Le lien de préparation depuis les réponses simples de L3 est conservé. La moyenne supérieure de L5 est acceptée explicitement : raconter deux événements peut produire une phrase plus longue qu’une invitation ultérieure sans rendre l’invitation élémentaire ou déjà acquise.

La plus longue unité conservée est `L5-fr-ko-06`, avec une moyenne de 17 caractères. Elle était déjà en L5 avant le reclassement ; elle n’explique donc pas l’apparition du nouvel écart. Elle relie deux actions avec `고`, un ordre `먼저` / `그다음에`, puis le passé : il faut la préparer comme unité de liaison entière, pas comme un remplacement de mots ni comme une forme supposée maîtrisée par l’ancien numéro de niveau.

Un ajustement de présentation est proposé, **sans effet sur les moyennes** : commencer par la variante 1 avec `운동하고`, réemployant l’activité `운동해요` proposée à plusieurs reprises dans `L4-fr-ko-08`, puis la variante 0 avec `장을 보고`, déjà rencontrée lexicalement dans `L4-fr-ko-09`. Ajouter explicitement `L4-fr-ko-08` aux prérequis, conserver `L5-fr-ko-08` pour le repas passé et garder les quatre phrases dans l’ordre `[1, 0, 2, 3]`. L’unité reste `whole-expression` ; les formes nouvelles et les autres activités sont présentées entières avant tout choix. Ce lien lexical ne prétend pas préparer à lui seul `고` ou les actions restantes.

### Exemples sources exacts

`L5-fr-ko-04` :

- variante 0 : « 잘 지내요? »
- variante 1 : « 별일 없어요? »
- variante 2 : « 네, 잘 지내요. »
- variante 3 : « 그냥 그래요. »

`L4-fr-ko-08` :

- variante 0 : « 매일 운동해요. »
- variante 1 : « 자주 운동해요. »
- variante 2 : « 가끔 운동해요. »
- variante 3 : « 주말에 운동해요. »

`L4-fr-ko-09` :

- variante 0 : « 주말에는 쉬어요. »
- variante 1 : « 주말에는 등산을 가요. »
- variante 2 : « 주말에는 가족하고 시간을 보내요. »
- variante 3 : « 주말에는 장을 봐요. »

`L5-fr-ko-08` :

- variante 0 : « 비빔밥을 먹었어요. »
- variante 1 : « 삼겹살을 먹었어요. »
- variante 2 : « 친구하고 점심을 먹었어요. »
- variante 3 : « 아침을 안 먹었어요. »

`L5-fr-ko-06` :

- variante 0 : « 먼저 장을 보고, 그다음에 저녁을 먹었어요. »
- variante 1 : « 먼저 운동하고, 그다음에 저녁을 먹었어요. »
- variante 2 : « 먼저 청소하고, 그다음에 저녁을 먹었어요. »
- variante 3 : « 먼저 샤워하고, 그다음에 저녁을 먹었어요. »

## Ce que ce suivi permet de conclure

- Le calcul anglais explique l’alerte de longueur et permet d’étudier une alternative de placement ; il ne démontre pas la nécessité des deux retours de niveau, non retenus après la relecture corrigée.
- La marche coréenne révèle le retrait de courtes relances au présent ; le choix de L3 est maintenu, avec une préparation plus explicite de la longue liaison narrative de L5.
- Aucune phrase, traduction, phonétique ou lecture n’est changée. Une présentation prévue et une imitation offerte ne certifient pas qu’un apprenant sait recombiner.
- Ni une courbe de longueur plus régulière ni ce sous-lot ne valident les dialogues, la compréhension humaine, la difficulté réelle ou l’acquisition. Les deux décisions doivent être relues avec les autres résultats du suivi.
