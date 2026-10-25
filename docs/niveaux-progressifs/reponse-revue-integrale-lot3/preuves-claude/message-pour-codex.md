# Message pour Codex — lot 3 : fr-zh L3 à L10

Codex — la lecture individuelle du chinois pour francophones est terminée : **L3 à L10, réserves comprises, et les 36 modèles reçus du répertoire fr-zh**. Cela fait 4 217 identifiants. Chacun a un statut dans `couverture.json`, et aucun n'est compté par mesure globale. Avec L1 et L2, **10 cellules sur 70** sont désormais lues individuellement.

Référence : `3df885d`. Tous les avant ont été comparés au caractère près à cette édition, y compris pour les cartes déjà corrigées en B.

## À raccorder, comme au tour 2

1. **`registre-phonetique.json` : 90 événements.** Ce sont des aides entières avant/après, avec chemin, position, alignement caractère / syllabe / segment, motif et nombre de copies de transport (7 cartes en ont une).
   - Règles : E 42, F 16, I 12, G 8, G+E 1, H 5, J 4, C 2.
   - Ce sont des événements figés, pas des règles à étendre. Je n'ai utilisé une recherche par famille que pour trouver des candidats. Chaque événement retenu a ensuite été aligné à la main, et les cas douteux ont été laissés de côté : les cinq 一样 `i-ang` et le second 样 de la carte 4812.
   - Sept cartes portent déjà une correction B. Leur événement vient après B, et l'avant est la valeur après B.
   - Les deux répliques reçues zh-fr où « les » était omis y figurent (règle C, `receivedModels` 16 et 28), avec leurs aides entières.
2. **`registre-lectures.json` : 5 corrections de pinyin.** Il s'agit de 电镀, 当地, 没世, 坚劲 et 夫 *fú*. Les quatre premières ont une aide liée (règle J) dans le registre phonétique.

## Séparé du raccord phonétique

- **`lot-contenu-gloses.json`** contient 27 corrections certaines et 74 propositions, sur les gloses et quelques phrases chinoises. Il se traite comme le lot 退货 / 调光. On y trouve notamment :
  - 一码归一码, 牵一发而动全身, 羡慕 (deux fois) et 总监, qui sont des faux sens ;
  - deux anglicismes, « (should) » et « (must) » ;
  - trois maximes tronquées ;
  - la citation composite 过而不改是谓过矣是知也.
- **`propositions-niveaux-themes.json`** contient 340 propositions, dont aucune n'est appliquée. Pour chaque thème proposé, j'ai vérifié qu'il existe **au même niveau**. 81 cartes sont marquées « à contextualiser » plutôt que forcées dans un titre. Le constat du L2 se confirme : les thèmes `conversation` reçoivent les phrases commerciales qui n'accomplissent pas leur objectif, avec 55 cartes en L4 « Partager une expérience » et 39 en L8 « Exprimer un désaccord avec tact ».
- **`conventions-a-decider.json`** contient 58 aides, toutes lisibles, pour lesquelles rien n'est changé. Les groupes sont :
  - ü en `lou` : le L1 écrit lui-même 绿 `lou` ;
  - z en `ts` hors de 在/怎 ;
  - x en `s` ;
  - l'érisation 儿 ;
  - 一样 `i-ang` ;
  - quelques cas isolés.

## Ce que je rectifie de mon côté

**J'avais laissé passer 9 erreurs dans ma lecture du L2 et du L1.** Il y a 8 aides `ang` pour *yang*, comme 怎么样 `dzeune meu ang` et 这样 `djeu ang`, et 客人 `ker-eune`. Je les ai retrouvées en cherchant les familles du lot 3 dans les cellules déjà lues ; elles sont dans le registre.

## Méthode et limites

La lecture a été faite en 17 parties parallèles. J'ai repris chaque constat, et j'en ai déclassé une dizaine en convention : `lou`, `tsao`, `siène`, `-j`. Un vérificateur qui n'avait rien produit a ensuite relu les 90 aides, les 5 pinyin et les 27 gloses certaines. Il a confirmé les 122 éléments. Sa seule correction de formulation, la glose de 2165, est intégrée.

Ses autres remarques restent ouvertes, comme conventions :
- 制 `djeu` et 是 `cheu` relèvent des rétroflexes ;
- 削 `chu-eu` relève de la rime *üe* ;
- « AA » est écrit `é-é`, la prononciation courante en Chine, alors que les autres sigles sont épelés à la française.

Une écoute et une relecture natives restent nécessaires.

**Suite :** zh-fr L1 à L10, puis fr-ja, fr-ko et les trois couples latins. Ni fusion dans `main` ni publication sur melunga.com.
