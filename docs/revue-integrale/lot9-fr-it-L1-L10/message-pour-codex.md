# Message pour Codex — lot 9 : fr-it L1 à L10

Codex, la lecture individuelle de l'italien pour francophones est terminée. Elle couvre L1 à L10, réserves comprises, et les 36 modèles reçus, soit **4 756 positions et 4 753 identifiants distincts**. Chaque position a un statut dans `couverture.json`. Avec ce lot, **les 70 cellules sur 70 ont été lues individuellement**. Les avant ont pour référence `40d4c0b`.

Les 33 aides de *s* intervocalique laissées en attente ont été relues mot par mot. Aucune n'a de *s* faux en italien standard.

Le correctif EN71 du lot 8 est dans `docs/revue-integrale/lot8-fr-es-L1-L10/errata-1.json`, commit `76602a1`. Il vise une épellation distincte : `é É-né sé-TÉN-ta i OU-no`.

## À raccorder

`registre-phonetique.json` contient **70 aides entières**, dont un modèle reçu. Aucune lecture n'est concernée.

| Règle | Aides |
|---|---:|
| N : voyelle + *n*/*m* simple devant consonne ou en fin de mot, lue nasale → `nn`/`mm`, la graphie que le deck emploie près de 2 000 fois | 63 |
| S : lettre de sigle nommée à la française (CE, ASTM) | 3 |
| T : faute de frappe (sciocchezze, commedie, tro-Va-ré) | 3 |
| A : accent (rivedere) | 1 |

Chaque événement est un avant/après entier et figé. Ce n'est pas une règle à étendre : SIM, team et Wang restent en convention.

## Séparé du raccord

- `lot-contenu-gloses.json` :
  - **34 gloses certaines**, dont cinq *italiano* traduits « français » ;
  - **3 blocs** étude/glose/aide à appliquer en entier : *Faccio seguito alla mia mail*, *la via amichevole*, *offre un prezzo più basso* ;
  - 93 propositions incertaines.
- `propositions-niveaux-themes.json` : **280 propositions sur 278 identifiants**, non appliquées :
  - 217 thèmes : 150 destinations nommées existant au même niveau, 67 `null` ;
  - 47 doublons, dont 28 exacts ;
  - 16 niveaux.
- `conventions-a-decider.json` : **30 lignes**, non appliquées : `sh`/`ch`, `lli`/`li`, *z*, emprunts anglais, sigles abrégés.

## Contre-vérification

Un vérificateur indépendant a relu les 107 lignes et n'a trouvé aucun faux certain. J'ai retenu `djinnss` et « on en verra de belles ». J'ai écarté `tèmm-po`, parce que `è` bloque la nasale, et gardé *la via amichevole*.

Pas de fusion dans `main`, pas de publication sur melunga.com.

**Suite** : la lecture individuelle des 70 cellules est terminée. Restent les décisions d'ensemble pour Kartech : batchim coréen, jota espagnole, conventions par couple, propositions de thèmes.
