# Message pour Codex — lot 4 : zh-fr L1 à L10

Codex — la lecture individuelle du français pour sinophones est terminée. Elle couvre L1 à L10, réserves comprises, et les 36 modèles reçus du répertoire zh-fr. Cela fait **4 736 positions, soit 4 729 identifiants distincts** : sept identifiants sont à la fois des cartes canoniques et des modèles reçus. Chaque position a un statut dans `couverture.json`. Couverture individuelle : **20 cellules sur 70**.

Référence de toutes les valeurs avant : `606592c`, lot 3 compris. Aucune des cartes corrigées ne portait de correction antérieure.

## À raccorder, comme aux lots 2 et 3

**`registre-phonetique.json` : 259 aides entières, avant/après figés.** Chaque événement donne le chemin, la position, l'alignement mot / segment, le motif et le nombre de copies de transport (15 cartes en ont une).
- Règles : S 65, L 54, T 50, G 42, A 22, X 20, R 6.
- T, les aides tronquées, est le défaut le plus grave. Sur 50 cartes, des mots prononcés n'ont aucun segment, dès le L1 (« Vous pouvez parler plus lentement ? »). Il serait utile de chercher à la source pourquoi ces aides ont été coupées.
- G : « une » est rendu 安, 团 ou 战, les rendus de « un », et « bonne » est rendu 波 ou 蓬. Les lecteurs en ont relevé une partie. J'ai trouvé les autres en cherchant la famille, puis je les ai alignés un par un.
  - Je garde la liaison en *t* après *c'est* et *est* (迪讷).
  - Je ne la note pas après *fait* et *faut*, où elle est facultative (云).
  - Devant une voyelle, j'écris 于 suivi de la syllabe en *n*.
  - Je laisse les « bonne » dont l'enchaînement rend déjà le *n* : « Bonne année », « de bonne humeur ».
- Ce sont des événements figés, pas des règles à étendre.

## Séparé du raccord

- **`lot-contenu-gloses.json`** : 8 gloses certaines, 104 propositions et un bloc à appliquer d'un seul tenant, `catalogue:fr:757`, où l'étude et l'aide changent ensemble.
  - Gloses certaines : 臀部 pour « la hanche », 售票员 pour « le contrôleur », 申请表 pour « la demande », 修一下就好 pour « Juste un peu », 承蒙, l'annotation « （将来） » laissée dans une glose, et deux gloses incomplètes.
  - Après contre-vérification, deux gloses ne sont plus classées certaines : 我吃完了 est défendable dans un contexte de repas, et 油漆掉漆 relève du style.
- **`propositions-niveaux-themes.json`** : 309 propositions, aucune appliquée.
  - 237 thèmes : les 183 destinations nommées existent au même niveau, les 54 « à contextualiser » valent `null`.
  - 38 niveaux et 34 doublons, ces derniers souvent à la ponctuation près.
  - Comme en fr-zh, les thèmes `conversation` et « 动作与描述 » servent de fourre-tout. Le L6 concentre le problème.
- **`conventions-a-decider.json`** : 81 lignes, rien n'est changé. On y trouve les liaisons facultatives, les consonnes finales, les voyelles nasales ou orales et les sigles. On y trouve aussi la graphie de [vy] : 维 rétablit le *v* de « vu » mais pas le *u* ; cinq aides sont corrigées pour le *v*, et la graphie commune reste à choisir.

## Méthode et limites

La lecture a été faite en 20 parties parallèles. J'ai repris chaque constat certain, puis un vérificateur qui n'avait rien produit a relu les 259 aides, les gloses et le bloc. J'ai intégré 19 de ses remarques :
- les liaisons facultatives retirées après *fait*, *faut* et « peut-on » ;
- la carte 1668, dont le genre restait faux ;
- 于 plutôt que 云 devant une syllabe en 内 ;
- « bus » rendu 比斯 ;
- les rendus de « -geons », « peut », « -ment » et « flemme » ;
- deux gloses déclassées.

Une écoute native, sinophone et francophone, reste nécessaire. Pas de fusion dans `main` ni de publication sur melunga.com.

**Suite :** fr-ja, puis fr-ko, puis les trois couples latins.
