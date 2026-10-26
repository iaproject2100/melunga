# Message pour Codex — lot 8 : fr-es L1 à L10

Codex, la lecture individuelle de l'espagnol pour francophones est terminée : L1 à L10, réserves comprises, et les 36 modèles reçus. Cela fait **4 995 positions et 4 992 identifiants distincts**, chacun avec un statut dans `couverture.json`. La couverture individuelle atteint **60 cellules sur 70**. Les avant ont pour référence `224e459`.

## À raccorder

`registre-phonetique.json` contient **63 aides entières**, dont un modèle reçu. Aucune lecture n'est touchée.

| Règle | Aides |
|---|---:|
| S : sigle ou nombre sans segment ou tronqué (CE, B/L, DHL, HS, QR, FCC, EN71, 30 %…) | 31 |
| G : *g* dur de *-gué*/*-guí* écrit GÉ/GI (cas non couverts par la règle B) | 11 |
| R : *rr* écrit *r* qui fait lire un autre mot (perros, barra, parra, corro, cerros, cerré, cerremos) | 10 |
| A : accent tonique ou découpage (euros, tíquet, audioguía, continuar, anglicismes en KINR) | 9 |
| T : faute de frappe (jueves, check-out) | 2 |

Chaque événement est un avant/après entier et figé, pas une règle à étendre. R ne concerne que ces dix cartes : les autres *r* simples restent en convention.

## Séparé du raccord

- `lot-contenu-gloses.json` :
  - **18 gloses** et **2 études** certaines (¡ ! manquants) ;
  - **3 blocs** étude/aide ± glose à appliquer en entier : *¿Me lo pone para llevar?*, *tarda en llegar a*, *ver un vídeo* ;
  - 119 propositions incertaines.
- `propositions-niveaux-themes.json` : **310 propositions sur 308 identifiants**, non appliquées.
  - Thèmes : 290, dont 259 destinations au même niveau et 31 `null`. L8 « Exprimer un désaccord avec tact » en compte 113.
  - Niveaux : 15.
  - Quasi-doublons : 5.
- `conventions-a-decider.json` : **151 lignes**, non appliquées.
  - 112 pour la jota, écrite `r`, `kh` ou `rh`. Il faut une décision d'ensemble pour Kartech.
  - 28 pour des *rr* simples.
  - Le reste : *ñ*, sigles, accents.

## Contre-vérification

Un vérificateur indépendant a relu les 86 lignes et n'a trouvé aucun faux certain. J'ai retenu ses deux remarques : `A-OUT` et « ne fais pas trop confiance ».

Pas de fusion dans `main`, pas de publication sur melunga.com.

**Suite** : fr-it, avec ses 33 aides de *s* intervocalique laissées en attente.
