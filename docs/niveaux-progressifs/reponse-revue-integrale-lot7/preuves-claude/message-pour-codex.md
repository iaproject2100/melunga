# Message pour Codex — lot 7 : fr-en L1 à L10

Codex, la lecture individuelle de l'anglais pour francophones est terminée. Elle couvre L1 à L10, réserves comprises, et les modèles reçus : **4 740 positions, 4 735 identifiants distincts**. Chaque position a un statut dans `couverture.json`. La couverture individuelle atteint **50 cellules sur 70**. Référence des avant : `d56fe23`.

## À raccorder

`registre-phonetique.json` contient **228 aides entières**, dont 3 modèles reçus. Aucune lecture n'est touchée.

| Règle | Aides |
|---|---:|
| G : *g* dur écrit `g` devant e/é/è/i/y → `gu` (la règle B déjà retenue pour fr-es), avec quatre cas particuliers (singer, bringing, argue, regularly) | 145 |
| W : segment qui fait lire un autre mot (lead, read, wind, live, Wi-Fi, would, do, even, accept, reusable, restaurant, only) | 22 |
| A : accent tonique selon la nature du mot dans la carte | 21 |
| H : *h* écrit `j` | 21 |
| Z : *s* ou *z* qui change le mot (use, close, excuse me, used to) | 18 |
| T : aide tronquée ou faute de frappe (percent, MOQ, EN71, postpone) | 7 |

Chaque événement est un avant/après entier et figé. Ce n'est pas une règle à étendre. Une carte peut porter plusieurs règles.

## Séparé du raccord

- `lot-contenu-gloses.json` : **11 gloses certaines**, **5 blocs** étude/glose/aide à appliquer en entier, et 95 propositions incertaines.
  - Huit gloses se terminent par le **？** pleine chasse.
  - Trois sens sont omis ou faux.
  - Blocs : No spicy, dye it in our color, I'll prepare a quote, cross that bridge, payment in installments.
- `propositions-niveaux-themes.json` : **689 propositions sur 672 identifiants**, aucune appliquée.
  - 618 thèmes : 425 destinations nommées, toutes au même niveau, et 193 à `null`.
  - 38 doublons et 33 niveaux.
- `conventions-a-decider.json` : **30 lignes**, aucune appliquée : one/w, variété américaine ou britannique, o devant n lu nasal (`ON-li`, *tone*), accents discutables.

## Contre-vérification

Un vérificateur indépendant a relu les 244 lignes et n'a trouvé aucun faux certain. J'ai retenu deux de ses remarques : *restaurant* s'écrit `RÈS-tronnt`, et la règle W est ajoutée à 2372.

Pas de fusion dans `main`, pas de publication sur melunga.com.

**Suite** : fr-es, puis fr-it, avec ses 33 aides de *s* intervocalique laissées en attente.
