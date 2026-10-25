# Lot 4 — zh-fr L1 à L10 lus carte par carte, et modèles reçus

Référence : `606592c`, branche `review/themes-niveaux-progressifs`, lot 3 compris. Aucun fichier de l'application n'est modifié : ce dossier livre des registres que le générateur peut consommer, comme pour les lots 2 et 3.

## Couverture : 4 736 positions, chacune avec un statut

| Partie | Positions |
|---|---:|
| zh-fr L1 à L10, `themes[].phrases` et `reserve[]` | 4 700 |
| `receivedModels` du répertoire zh-fr | 36 |
| **Total relu** | **4 736 positions, 4 729 identifiants distincts** |

Sept identifiants ont deux rôles de lecture : ils sont à la fois cartes canoniques et modèles reçus. Ils ont le même statut dans les deux rôles. La preuve est [`couverture.json`](couverture.json) : la liste de lecture de chaque partie a été comparée, dans l'ordre, à celle du fichier source, sans aucun écart.

| Statut | Positions |
|---|---:|
| `verifie` | 4 010 |
| `corrige` | 260 |
| `glose-a-corriger` | 9 |
| `proposition` | 296 |
| `incertain` | 161 |

Ce statut est le statut principal d'une position. Une carte peut aussi avoir un suivi dans un autre fichier, par exemple une aide corrigée et une glose à revoir.

**Cellules désormais lues individuellement : 20 sur 70** (fr-zh et zh-fr, L1 à L10).

## Registre phonétique : 259 aides entières, avant/après figés

[`registre-phonetique.json`](registre-phonetique.json). Chaque avant a été comparé au caractère près à l'édition `606592c`. Aucune des 259 cartes ne portait de correction antérieure. Quinze ont une copie de transport.

| Règle | Défaut | Événements |
|---|---|---:|
| S | segment qui fait lire un autre mot ou un autre son | 65 |
| L | liaison obligatoire absente | 54 |
| T | aide tronquée : des mots prononcés n'ont aucun segment | 50 |
| G | « une » rendu comme « un », ou « bonne » comme « bon »/« beau » : le genre change | 42 |
| A | lecture à l'anglaise | 22 |
| X | son parasite : fausse liaison, syllabe ou consonne en trop | 20 |
| R | aide en lettres latines ou cyrilliques | 6 |

**Les aides tronquées sont le défaut le plus grave.** Sur 50 cartes, l'aide s'arrête en cours de phrase. Dès le L1, « Vous pouvez parler plus lentement ? » n'a pas de segment pour « plus lentement ». Au L8, « La liberté, l'égalité, la fraternité » ne rend que « La liberté ». Au L10, « La gastronomie française est reconnue dans le monde entier » s'arrête à « La gastronomie ». Il faudrait vérifier à la source pourquoi ces aides sont coupées. Les phrases longues et les amorces en « … » sont les plus touchées.

**Le genre de « une ».** Le deck rend « un » par 安, 团 (après *c'est*) ou 战 (après liaison en *z*), et emploie souvent les mêmes caractères pour « une ». Un sinophone entend alors le masculin : « C'est une urgence » `塞 团…` se lit « c'est‿un ». Les lecteurs en ont relevé une partie. J'ai trouvé les autres en cherchant la famille, puis je les ai alignés un par un :
- après *c'est*, *est*, *fait*, *faut* : `迪讷`, qui garde la liaison en *t* ;
- après un verbe à liaison facultative : `云` ;
- devant une voyelle : `于` suivi de la syllabe en *n* déjà écrite.

J'ai écarté les « bonne » dont l'enchaînement rend déjà le *n* : « Bonne année » `波 纳内`, « de bonne humeur » `波 努穆尔`.

**Autres familles :**
- **Liaison absente** dans « on a » et « on est » (`翁 阿` au lieu de `翁 纳`), sur 25 cartes.
- **« doit être » lié en *z* au lieu de *t*** (`泽特尔` au lieu de `泰特尔`).
- **Lectures à l'anglaise** : « production » et « réduction » (`达克西翁` au lieu de `迪克西翁`), « frustré », « bus », la lettre B, « QR ».
- **Lettres étrangères dans l'aide** : six aides entièrement en lettres latines (`eel suh PUH kohn…`), et une avec des lettres cyrilliques (`жю斯卡` pour « jusqu'à »).

## Lot de contenu séparé : 8 gloses certaines, un bloc, 104 propositions

[`lot-contenu-gloses.json`](lot-contenu-gloses.json).

Gloses fausses :
- « la hanche » glosé 臀部 (les fesses) : il faut 髋部.
- « le contrôleur » glosé 售票员 (vendeur de billets) : il faut 检票员.
- « la demande » glosé 申请表 (le formulaire).
- « Juste un peu » glosé 修一下就好 (« juste une petite coupe »).
- « Suite à notre conversation » glosé avec 承蒙 (« grâce à la faveur de »).

Gloses incomplètes ou ajoutées :
- Une annotation grammaticale « （将来） » restée dans une glose.
- « Pourquoi je ferais ça ? » glosé 我为什么要？, incomplet.
- 它 à la place de « la réunion ».

« J'ai fini » glosé 我吃完了 et 油漆掉漆 sont déclassés en incertain ou en style après contre-vérification.

Bloc indissociable : « Il fait moins zéro. » n'a pas de sens en français. La phrase et l'aide changent ensemble ; la glose 零下 reste.

## Niveaux, thèmes et doublons : 309 propositions, aucune appliquée

[`propositions-niveaux-themes.json`](propositions-niveaux-themes.json).

- **Thèmes : 237.** Les 183 destinations nommées existent toutes au même niveau. Les 54 « à contextualiser » ont `destinationExistsAtSameLevel: null`. L'adéquation de l'acte de parole au titre reste à arbitrer carte par carte.
- **Le L6 concentre le problème.** « 发表看法并继续交谈 » (donner son avis) contient 41 questions techniques entre entreprises, et cinq autres thèmes du L6 reçoivent des phrases hors sujet. Le thème L3 « 动作与描述 » reçoit aussi 41 noms (corps, animaux, objets) qui ont un thème plus juste au même niveau.
- **Niveaux : 38**, surtout des phrases de premier contact placées en L7–L10. Un lecteur signale que le L8 en contient beaucoup plus qu'il n'en a relevé, par exemple « Le chat grimpe à l'arbre » : c'est un problème de niveau de toute la cellule.
- **Doublons : 34**, souvent à la ponctuation près (« Ça suffit » et « Ça suffit. »). Ils sont signalés sans demande de suppression.

## Conventions et doutes : 81 lignes, rien n'est changé

[`conventions-a-decider.json`](conventions-a-decider.json) regroupe :
- les liaisons facultatives ;
- les consonnes finales non rendues (*l* de « signal », *t* de « en fait ») ;
- les voyelles nasales ou orales ;
- les *v*/*f* perdus ;
- les sigles ;
- la graphie de [vy] (vu, vue, prévu) : `维` rétablit le *v* mais pas le *u* ; les cinq aides sont corrigées pour le *v*, la graphie commune reste à choisir ;
- d'autres aides lisibles mais discutables.

## Limites

- La lecture a été faite en 20 parties parallèles, puis j'ai repris chaque constat certain. J'ai corrigé plusieurs propositions, par exemple sans liaison pour « vais imprimer » et « une » pour 497. La recherche par famille a ajouté 30 cartes que les lecteurs avaient manquées.
- Un vérificateur indépendant a relu les 259 aides, les gloses certaines et le bloc. J’ai repris 19 de ses remarques : liaisons facultatives retirées après fait/faut et après « peut-on », 1668 dont le genre restait faux, enchaînement 于 au lieu de 云 devant 内, « bus » 比斯, « exigeons » 戎, « peut » 珀, « -ment » 芒, « flemme » 弗莱姆, deux gloses déclassées.
- Une écoute native, sinophone et francophone, reste nécessaire.
- Rien n'est fusionné dans `main` ni publié sur melunga.com.
