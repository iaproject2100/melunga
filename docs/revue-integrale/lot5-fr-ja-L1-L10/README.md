# Lot 5 — fr-ja L1 à L10 lus carte par carte, et modèles reçus

Référence : `f22202c`, branche `review/themes-niveaux-progressifs`, lots 3 et 4 compris. Aucun fichier de l'application n'est modifié.

## Couverture : 4 763 positions, chacune avec un statut

| Partie | Positions |
|---|---:|
| fr-ja L1 à L10, `themes[].phrases` et `reserve[]` | 4 727 |
| `receivedModels` du répertoire fr-ja | 36 |
| **Total relu** | **4 763 positions, 4 757 identifiants distincts** |

La preuve est [`couverture.json`](couverture.json) : la liste de lecture de chaque partie a été comparée, dans l'ordre, à celle du fichier source, sans écart.

| Statut | Positions |
|---|---:|
| `verifie` | 4 033 |
| `corrige` | 4 |
| `glose-a-corriger` | 26 |
| `proposition` | 579 |
| `incertain` | 121 |

**Cellules désormais lues individuellement : 30 sur 70.**

## Aides et lectures : le couple le plus propre

Plusieurs lecteurs ont comparé chaque aide à une transcription refaite à partir de la lecture, more par more, puis vérifié chaque lecture contre les kanji. Ils ont relevé seulement **4 aides et 4 lectures** à corriger, détaillées dans [`registre-phonetique.json`](registre-phonetique.json) et [`registre-lectures.json`](registre-lectures.json) :

| Carte | Défaut | Lecture avant | Lecture après |
|---|---|---|---|
| 3630 食洗機 | lecture d'un autre mot (食器洗い機) | `sho-k-ki a-ra-i-ki` | `sho-ku-se-n-ki` |
| 3771 このバスは〜に行きますか | に lu comme へ | `… ba-su-wa e …` | `… ba-su-wa ni …` |
| 2400 さよなら | voyelle longue en trop (さようなら) | `sa-yo-o-na-ra` | `sa-yo-na-ra` |
| 4320 ボディソープ | voyelle longue en trop | `bo-di-i` | `bo-di` |

Chaque aide liée suit sa lecture corrigée. Aucune de ces cartes ne portait de correction antérieure.

## Gloses : 26 certaines, dans le lot de contenu séparé

[`lot-contenu-gloses.json`](lot-contenu-gloses.json). Le défaut le plus visible est que **日本語 est traduit « français » dans cinq cartes**, par exemple « Depuis quand tu apprends le français ? » ou « Comment on dit ça en français ? ». C'est sans doute un reste d'adaptation d'un deck pour un autre public. J'ai cherché ce défaut dans tout le couple : il n'y en a pas d'autre.

Autres faux sens :
- 空いていますか rendu par « Cette place est **prise** ? », ce qui inverse le sens.
- 良いお年を rendu par « Bonne année », alors qu'il se dit avant le Nouvel An.
- おめでとうございます rendu par « Meilleurs vœux » au lieu de « Félicitations ».
- 胸がいっぱい rendu par « J'en ai gros sur le cœur » au lieu de « je suis très ému ».
- 気がある rendu par « flirter ».
- 何でもいい rendu par « N'importe quoi ».
- ソファ rendu par « fauteuil ».
- 信号 rendu par « feu **rouge** ».

Le tutoiement n'est retenu comme erreur que lorsque le japonais est nettement en keigo : いたします, ご同意いただければ, お伝えください, お支払いすれば. Ailleurs, il relève d'une politique de registre à décider. J'ai donc déclassé 4 gloses en incertain.

## Niveaux, thèmes et doublons : 604 propositions, aucune appliquée

[`propositions-niveaux-themes.json`](propositions-niveaux-themes.json).

**Thèmes : 463.** Les 306 destinations nommées existent toutes au même niveau. Les 157 cas « à contextualiser » ont `null`. Les thèmes `conversation` servent de fourre-tout du L5 au L9, comme dans les autres couples :

| Thème | Cartes concernées | Constat |
|---|---:|---|
| L8 « conversation » | 71 | |
| L5 « conversation » | 65 | |
| L9 « Répondre à une objection » | 59 | aucune objection dans ces cartes |
| L7 « Proposer une alternative » | 34 | |

Le thème L2 « Trouver son chemin » reçoit aussi 21 cartes sans rapport avec l'orientation.

**Doublons : 100.** C'est bien plus que dans les autres couples. La plupart sont des cartes de vocabulaire présentes deux fois, dont seule la glose change : « le couteau » et « un couteau », par exemple pour ナイフ, シャツ, 靴, 鍵, スプーン. Ils sont signalés sans demande de suppression.

**Niveaux : 41**, surtout des phrases élémentaires placées en L8–L9 (いくらですか, 何時ですか) et quelques proverbes placés trop tôt.

## Limites

- La lecture a été faite en 19 parties parallèles, puis j'ai repris chaque constat certain. Un vérificateur indépendant a relu les 8 corrections et les 28 gloses déclarées certaines. Il confirme les 8 corrections. J'ai déclassé deux gloses (3569 なら « puisque », 1276 « Il m'a menti ») et ajusté 2811 et 2615.
- Le japonais a été relu par alignement et par sens. Une écoute native reste nécessaire.
- Rien n'est fusionné dans `main` ni publié sur melunga.com.

## Suivi après le retour de Codex (`161d0eb`)

- Dans les gloses incertaines, la ligne `catalogue:ja:833` (champ `study`) prend comme avant la phrase japonaise `私に似合います。`. Elle contenait la lecture, recopiée par erreur. La ligne reste incertaine et n'est pas appliquée.
