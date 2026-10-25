# Lot 3 — fr-zh L3 à L10 lus carte par carte, et modèles reçus

Référence : `3df885d` (branche `review/themes-niveaux-progressifs`). Aucun fichier de l'application n'est modifié : ce dossier livre des registres que le générateur peut consommer, comme pour le tour 2.

## Couverture : 4 217 identifiants, chacun avec un statut

| Partie | Identifiants |
|---|---:|
| fr-zh L3 à L10 : `themes[].phrases` et `reserve[]` | 4 181 |
| `receivedModels` du répertoire fr-zh | 36 |
| **Total relu** | **4 217** |

Chaque identifiant est lu individuellement, avec son thème et le titre réel de ce thème. La preuve est [`couverture.json`](couverture.json) : la liste de lecture de chaque partie a été comparée, dans l'ordre, à la liste des identifiants du fichier source, sans écart.

| Statut | Nombre | Sens |
|---|---:|---|
| `verifie` | 3 664 | relu, sans changement |
| `corrige` | 80 (+11 hors lot) | aide ou pinyin corrigé dans les registres |
| `glose-a-corriger` | 25 | glose ou chinois à corriger, dans le lot de contenu séparé |
| `proposition` | 332 | niveau ou thème à reconsidérer, rien n'est appliqué |
| `incertain` | 116 | doute documenté, convention ou contexte à décider |

Les 11 identifiants hors lot sont 8 cartes de fr-zh L1–L2, une carte du L2 (客人), et les deux répliques reçues zh-fr à « les ». **Ces 9 cartes L1–L2 sont des erreurs que j'avais laissées passer dans ma propre lecture du L2** ; je les ai retrouvées en cherchant les mêmes familles dans les cellules déjà lues.

**Cellules désormais lues individuellement : 10 sur 70** (fr-zh L1 à L10). Restent les 60 cellules des six autres couples.

## Registre phonétique : 90 aides entières, avant/après figés

[`registre-phonetique.json`](registre-phonetique.json). Pour chaque événement : identifiant, fichier et position au commit de référence, chinois, pinyin, glose, aide avant, aide après, alignement caractère / syllabe / segment, motif, et nombre de copies de transport (7 cartes en ont une). Chaque avant a été comparé au caractère près à la valeur actuelle. Quand la carte porte déjà une correction B, l'avant est la valeur après B, et l'événement s'ajoute après.

| Règle | Défaut | Événements |
|---|---|---:|
| E | *y* perdu devant *ang* : `ang` se lit *áng*, une autre syllabe | 42 |
| F | consonne glissée d'une syllabe à l'autre : `gang-a` pour 尴尬, `keune-eung` pour 可能 | 16 |
| I | lettres latines hors de leur place dans la phrase (ABC, OEM, ATM…), ou sigle illisible | 12 |
| G | initiale *r* perdue : `dzer-eune` pour 责任, `tchu-er-eune` pour 确认 | 8 |
| G+E | 确认样品 : les deux défauts dans la même aide | 1 |
| H | *j* rendu `t` ou `tch` : `ting` pour 经, `tchin` pour 金 | 5 |
| J | aide qui suivait un pinyin fautif, corrigé ci-dessous | 4 |
| C | les deux répliques reçues zh-fr où « les » était écrit 莱 | 2 |

Ce ne sont pas des règles à étendre : la génération reprend les avant/après figés.

- **E** : cinq cartes 一样 *yíyàng* écrites `i-ang` sont laissées de côté. Le *i* précédent donne à peu près le son *y* à l'oral, donc la correction n'est pas certaine ; elles sont dans les conventions.
- **I** : les lettres latines s'écrivent avec les noms de lettres français, comme le deck le fait déjà (`a-bé-sé`, `é-é`, `sé-eu`).

**Sept cartes déjà corrigées en B gardaient une faute ailleurs dans l'aide**, par exemple 可能 `keunn-eung` (2018), 不能 `bounn-eung` (2145), 责任 `dzer-eune` (2164, 1016) et 变革 `byang-eu` (1143). La règle B n'avait touché que le *g*. Une correction antérieure ne vaut donc pas validation de l'aide entière.

## Registre des lectures pinyin : 5 corrections

[`registre-lectures.json`](registre-lectures.json).

| Carte | Avant | Après | Raison |
|---|---|---|---|
| 621 | 电镀 *diànduó* | *diàndù* | lecture de 镀 |
| 1680 | 当地 noté *běn dì* | *dāng dì* | le pinyin rend 本地, pas les caractères écrits |
| 4810 | 没世 *méi shì* | *mò shì* | « jusqu'à la fin de sa vie » |
| 1608 | 坚劲 *jiān jìn* | *jiān jìng* | poème 竹石 |
| 1323 | 逝者如斯夫 *fū* | *fú* | particule finale ; l'aide `fou` reste juste |

Pour les quatre premières, l'aide liée est corrigée par la règle J.

## Lot de contenu séparé : 27 corrections certaines, 74 propositions

[`lot-contenu-gloses.json`](lot-contenu-gloses.json). Comme 退货 et 调光 au tour 2, ce lot ne touche pas la phonétique.

Gloses fausses :

- 一码归一码 « chaque chose en son temps » : le sens est qu'il faut traiter séparément deux affaires distinctes, pas un ordre dans le temps.
- 牵一发而动全身 « tout tient à un fil » : le sens est la répercussion d'un détail sur l'ensemble, pas la fragilité.
- 羡慕 rendu « admirer » (2452) ou « fou de jalousie » (613) : le mot veut dire envier.
- 总监 « directeur général » : c'est 总经理 ; 总监 dirige une fonction ou un département.
- 保质期 « date de péremption » : c'est une durée de conservation.
- 上传 « télécharger » : c'est mettre en ligne.
- 不惑 « sans doute » : en français, « sans doute » veut dire probablement.
- 退一步说 « pour le dire autrement » : l'expression introduit une concession.
- 嘴上不饶人 « le mot pour rire » : le sens est la langue acérée.
- 物超所值 « dépasse sa valeur » : se lit comme « trop cher ».
- 这个能退换吗 « rembourser ça » : c'est le client qui demande le retour.

Gloses incomplètes ou fautives en français :

- Deux anglicismes : « devoir (should) » et « devoir (must) ».
- Trois maximes tronquées : 己所不欲, 知彼知己百战不殆, 过而不改.
- « demi-pointure » ajouté sans base dans le chinois.

Une citation composite en chinois : 过而不改是谓过矣**是知也**. Le 是知也 final appartient à une autre phrase des *Entretiens* ; la glose suivait ce 是知也 parasite.

## Niveaux et thèmes : 340 propositions, aucune appliquée

[`propositions-niveaux-themes.json`](propositions-niveaux-themes.json).

**Niveaux (78).** Deux mouvements reviennent :

- **Citations classiques de L3 à L7 vers L8 ou L10.** Ce sont des textes de Confucius, Laozi, Xunzi et Zhang Zai, en langue littéraire.
- **Formules de premier contact de L7 à L10 vers L1 ou L2.** Exemples : 您好, 路上小心, des demandes de besoin immédiat.

**Thèmes (261).** J'ai vérifié que chaque destination proposée est un thème réel **du même niveau**. L'adéquation de l'acte de parole à l'objectif reste à arbitrer carte par carte. 81 cartes sont marquées « à contextualiser », parce qu'aucun thème du niveau ne convient. Elles ne sont pas déplacées de force.

Le constat principal confirme celui du L2 : **les thèmes `conversation` servent de rubrique de chute à plusieurs niveaux**. Ils reçoivent surtout des phrases commerciales (échantillons, certifications, logos, paiement) qui n'accomplissent pas leur objectif :

| Thème | Cartes concernées |
|---|---:|
| L4 « Partager une expérience » | 55 |
| L8 « Exprimer un désaccord avec tact » | 39 |
| L5 « Se mettre d'accord » | 16 |
| L9 « Répondre à une objection » | 14 |

Les deux répliques reçues de la piste « répondre à une objection » sont signalées pour leur chinois, pas déplacées.

## Conventions à décider : 58 aides, rien n'est changé

[`conventions-a-decider.json`](conventions-a-decider.json). Ces aides se lisent toutes. La question est d'unifier, pas de réparer.

- **ü rendu `lou`** (律, 率, 虑 : 12 aides). Le L1 écrit lui-même 绿 `lou`. Je recommande `lu`, mais c'est une convention.
- **z rendu `ts` hors de 在/怎** (走, 早, 做, 最, 总, 自 : 11 aides). C'est la même question que 在/怎, déjà ouverte.
- **x rendu `s`** dans des aides d'ancien style (`sia`, `siène`, `sing` : 8 aides).
- **Érisation 儿** (11 aides) : le pinyin omet parfois le *r*, une aide écrit 儿 comme une syllabe séparée, une autre ajoute un `-j` final (一会儿 `houèï-j`).
- **一样 `i-ang`** (6 aides), à décider avec la famille E.
- **Cas isolés** : 有 `i-eou`, 都 `deou`, 后 `hou`, 回 `houé`, 办 `pan`, les sigles EN71 et YKK, 那得 *nà/nǎ*.

## Limites

- La lecture a été faite par 17 lecteurs en parallèle, puis j'ai repris moi-même chaque constat. J'en ai déclassé plusieurs, rejeté d'autres, et j'ai ajouté les cartes que la recherche par famille a fait remonter. Tous les constats d'aide et de pinyin ont été contre-vérifiés par alignement. Les propositions de thème ont été contrôlées pour l'existence de la destination, pas arbitrées une à une.
- Une relecture native et une écoute restent nécessaires pour le chinois.
- Rien n'est fusionné dans `main` ni publié sur melunga.com.
