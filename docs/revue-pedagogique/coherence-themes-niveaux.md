# Cohérence du classement par thème et par niveau

Objet : `review/themes-niveaux-progressifs`, aperçu `parcours-niveaux.html`. Kartech demande si le classement par thème et par niveau est cohérent. J'ai mesuré les données qui nourrissent la page — elle est rendue par le navigateur, donc non lisible de l'extérieur. Rien n'est fusionné ni publié.

## Verdict

**Les thèmes sont parfaitement cohérents. Les niveaux le sont presque. Les prérequis ne le sont pas encore, et Codex le déclare lui-même.**

Le fichier de classement porte `progressivityValidationBlocked: true` et `progressivityReviewComplete: false`. Ce n'est donc pas un lot qui se prétend fini : il demande précisément l'examen que Kartech me confie.

## 1. Les thèmes : cohérence totale

| | |
|---|---|
| Thèmes dans l'extension | **18** |
| Thèmes dont le niveau d'entrée varie d'une langue à l'autre | **0** |

Les dix-huit pistes entrent au même niveau dans les sept couples, sans aucune exception. C'est l'objectif que vous aviez fixé après le constat de votre femme — « je ne comprends pas pourquoi chaque langue n'a pas le même pas » — et sur ce point précis il est atteint.

## 2. Les niveaux : un trou franc, et une rupture qui n'en est pas une

**Le trou.** Les niveaux réellement peuplés par l'extension sont **L1, L2, L3, L4, L5, L8 et L9**. **L6, L7 et L10 sont vides.** Les dix-huit thèmes ne couvrent pas ces trois niveaux, et le saut de L5 à L8 est direct. C'est le constat structurel de cette relecture : il faut soit peupler ces niveaux, soit expliquer pourquoi les thèmes les évitent.

**La rupture apparente.** Longueur moyenne par niveau, en syllabes :

| Couple | L1 | L2 | L3 | L4 | L5 | L8 | L9 |
|---|---|---|---|---|---|---|---|
| zh→fr | 2,6 | 4,2 | 5,7 | 5,1 | 6,0 | 8,1 | 10,8 |
| fr→en | 4,2 | 5,2 | 7,3 | 6,9 | 9,1 | 12,1 | 16,0 |
| fr→zh | 4,9 | 5,8 | 8,9 | 9,0 | 9,7 | 12,8 | 19,0 |
| fr→es | 5,9 | 7,8 | 11,5 | **9,8** | 11,8 | 16,4 | 22,9 |
| fr→it | 6,9 | 7,5 | 11,3 | 10,3 | 12,6 | 16,2 | 22,5 |
| fr→ko | 7,0 | 7,6 | 11,4 | 10,2 | 13,2 | 17,7 | 22,5 |
| fr→ja | 10,8 | 11,3 | 14,8 | 14,2 | 18,2 | 23,9 | 28,1 |

Six couples sur sept montrent `L3 > L4`. **Mais je ne le compte pas comme un défaut**, et je m'en explique : l'écart vaut **0,4 syllabe** en anglais, 0,6 en japonais et en zh→fr. Je me suis déjà trompé ainsi sur l'italien il y a deux jours, en prenant pour une faute un écart de 0,1 jeton. La composition le confirme : en fr→en, L3 porte quatre thèmes et L4 trois, et c'est tout ce qui sépare 7,3 de 6,9.

**Une seule valeur mérite un regard : fr→es, 11,5 → 9,8, soit 1,7 syllabe.** C'est le seul écart qui sorte du bruit, et c'est encore l'espagnol — déjà le couple qui résistait au reclassement précédent.

La progression d'ensemble est par ailleurs franche et régulière : de 4,2 à 16,0 syllabes en anglais, de 2,6 à 10,8 en zh→fr, avec un facteur quatre entre L1 et L9 dans les sept couples.

## 3. Les prérequis : un tiers n'est pas en état

C'est ici que la cohérence manque, et c'est mesurable.

| État des 418 prérequis déclarés | Nombre |
|---|---|
| `earlier-planned-utterance` — énoncé entier, présenté avant | **280** |
| `lexical-reuse-planned-not-presented-in-situation` | **68** |
| `reserved-reference-not-exercised` | **45** |
| `locally-presented-before-target` | 15 |
| `cross-type-reference-needs-review` | 10 |

**280 prérequis sur 418 sont propres. Les 138 autres ne le sont pas**, et ils se répartissent en trois familles qui ont toutes la même cause.

Par type de contenu : 316 pointent vers un énoncé entier, mais **86 vers un simple élément lexical** et **15 vers un contenu marqué « incomplet »**.

Et **31 prérequis n'apparaissent pas avant leur cible** dans l'ordre éditorial — dont **15 pour le seul fr→zh**, soit la moitié du total pour un couple sur sept.

## 4. Les deux questions que Codex me pose : les deux se résolvent

Il m'adresse une adjudication et signale un blocage. Les deux viennent du même geste — **prendre un morphème nu, glosé comme une étiquette grammaticale, pour la préparation de la construction qui l'emploie** — et les deux ont une réponse dans le catalogue existant.

**a. L'adjudication : 是 comme prérequis de 我是学生.**

> Il rejette la carte `[2168]` 是, glosée « oui / c'est ça », au motif qu'elle ne prépare pas l'emploi de 是 comme copule.

**Il a raison, et pour une raison plus forte que celle qu'il donne.** 是 glosé « oui » est la particule d'affirmation, qui répond à une question. La copule de 我是学生 est une autre fonction. Un apprenant qui a appris 是 = « oui » lit « je oui étudiant ».

**Mais la bonne carte existe et il ne l'a pas retenue** : `DECKS.zh[2223]`, **« 我是…… »**, niveau 1, glosée « je suis… », phonétique `ouo chr...`. C'est le cadre de la copule avec son emplacement, au niveau 1 — exactement la préparation de 我是学生. Il a lié à la place la carte `[2185]`, de type `vocabulary`, avec le statut `lexical-reuse-planned-not-presented-in-situation`.

> **Prérequis proposé pour `[245] 我是学生` : `[2223] 我是……` (lv1), à la place de `[2185]`.**

**b. Le blocage : 吗 comme prérequis de 质量好吗？**

> `localPreparationGaps` signale la carte `[2944]` 质量好吗？ avec le prérequis `[2207]` 吗, glosé « (particule interrogative) », motif `reserved-source-not-exercised`.

Même défaut : 吗 glosé par une étiquette grammaticale n'est pas une phrase qu'on apprend. Et la bonne carte est là aussi, encore plus évidente : **`DECKS.zh[2810]` « 好吗？ », niveau 1, « d'accord ? »** — une question entière, au même niveau, et **littéralement contenue dans la cible** 质量**好吗**？. `[2802]` « 是吗？ » (lv1) ferait un second appui.

> **Prérequis proposé pour `[2944] 质量好吗？` : `[2810] 好吗？` (lv1), à la place de `[2207] 吗`.**

**c. Et le principe se généralise.** Ces deux cas ne sont pas isolés : les **68 prérequis « lexical-reuse-planned-not-presented-in-situation »** et les **45 « reserved-reference-not-exercised »** relèvent probablement de la même logique. Un morphème ou un mot isolé, glosé hors de son emploi, ne prépare pas la construction qui l'utilise — alors qu'une phrase entière déjà rencontrée, oui.

**La règle que je propose d'énoncer** : un prérequis est un **énoncé entier déjà présenté**, jamais un élément lexical nu ni une étiquette grammaticale. C'est d'ailleurs ce que fait déjà la majorité — 280 sur 418 — donc il s'agit d'étendre une pratique existante, pas d'en inventer une.

## 5. Ce que je n'ai pas vérifié

L'appartenance de chaque énoncé à son thème, c'est-à-dire si « je recommande le film à ma sœur » relève bien de `piste-sortie-culturelle` : cela demande un jugement de sens, qui est le domaine de Codex et que Kartech ne m'a pas confié. Je n'ai vérifié que la **structure** du classement — niveaux, thèmes, prérequis, progression mesurable.

La page `parcours-niveaux.html` est rendue par le navigateur ; mon environnement ne peut pas l'exécuter. **Je n'ai donc pas vu l'affichage**, seulement les données qui le produisent. Si la page présente autre chose que ces données, cela m'échappe.

## 6. Récapitulatif

1. **Thèmes : rien à redire.** 18 sur 18 au même niveau dans les sept couples.
2. **L6, L7 et L10 sont vides** dans l'extension. À peupler ou à expliquer. *C'est le point structurel.*
3. **L3 > L4 dans six couples, mais c'est du bruit** sauf en fr→es, où l'écart de 1,7 syllabe mérite un regard.
4. **138 prérequis sur 418 ne sont pas en état**, dont 31 qui n'apparaissent pas avant leur cible — 15 pour le seul fr→zh.
5. **Les deux questions posées se résolvent** avec des cartes existantes : `[2223] 我是……` et `[2810] 好吗？`.
6. **Règle à énoncer** : un prérequis est un énoncé entier déjà présenté, jamais un morphème glosé par une étiquette.
