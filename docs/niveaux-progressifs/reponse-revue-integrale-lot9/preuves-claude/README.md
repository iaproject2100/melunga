# Lot 9 — fr-it L1 à L10 lus carte par carte, et modèles reçus

Référence : `40d4c0b`, branche `review/themes-niveaux-progressifs`, lots 3 à 8 compris. Aucun fichier de l'application n'est modifié.

## Couverture : 4 756 positions, chacune avec un statut

| Partie | Positions |
|---|---:|
| fr-it L1 à L10, `themes[].phrases` et `reserve[]`, et 36 `receivedModels` | 4 756 |
| **Identifiants distincts** | **4 753** |

La preuve est dans [`couverture.json`](couverture.json) : pour chacune des 21 parties, la liste lue a été comparée dans l'ordre à celle du fichier source, sans écart.

| Statut | Positions |
|---|---:|
| `verifie` | 4 276 |
| `corrige` | 70 |
| `glose-a-corriger` | 36 |
| `proposition` | 263 |
| `incertain` | 111 |

**Avec ce lot, toutes les cellules ont été lues individuellement : 70 sur 70.**

### Les 33 aides de *s* intervocalique laissées en attente

Ces 33 aides ont été marquées à part et relues mot par mot. Aucune ne contient de *s* faux en italien standard. Dans *stasera*, *risentiamo* et *termosifone*, le *s* placé après un préfixe est sourd, et `s` est donc juste.

Elles se répartissent ainsi :
- 26 sont vérifiées ;
- 4 ont une proposition de thème, de niveau ou de doublon ;
- 2 sont incertaines pour une autre raison ;
- 1 est corrigée pour la règle N, sans rapport avec le *s*.

## Registre : 70 aides entières, chacune figée avant et après

Le registre est dans [`registre-phonetique.json`](registre-phonetique.json). Un de ces 70 événements est un modèle reçu.

| Règle | Défaut | Aides |
|---|---|---:|
| N | voyelle suivie d'un *n* ou d'un *m* simple, devant une consonne ou en fin de mot : le francophone lit une voyelle nasale et avale la consonne | 63 |
| S | lettre de sigle nommée à la française | 3 |
| T | faute de frappe ou lettre fausse | 3 |
| A | accent tonique marqué sur la mauvaise syllabe | 1 |

**Règle N.** Pour empêcher la lecture nasale, le deck double lui-même la consonne près de 2 000 fois : `nonn`, `ann-dia-mo`, `comm-pli-ca-to`, `frann-tché-zé`. Les 63 aides corrigées sont celles qui font exception :
- `an-co-ra` (25 cartes) ;
- `im-por-`, `im-pa-`, `im-pos-`, `im-pèr-` et `dim-bar-co` ;
- `non POS-so` et `non MAN-djo` ;
- `fran-TCHÉ-zé` ;
- `cam-pa-gna`, `com-pi-ti`, `stan-co`, `KOUAN-to`, `ROM-pé` ;
- `champ-po`, `link` et `djins`.

Une recherche dans tout le couple n'en trouve pas d'autre. Quelques mots sont laissés, comme *SIM*, *team* (`tim`) et *Wang* : ce sont des emprunts dont la lecture est discutable, ils vont dans les conventions. Le doublement ne s'applique pas après `é` ou `è` : l'accent empêche déjà la lecture nasale en français.

Le L1 contenait lui-même quelques-unes de ces exceptions (`an-co-ra`, `im-por-tann-té`, `fran-TCHÉ-zé`). Je les corrige parce qu'elles s'écartent de la graphie que le reste du deck, L1 compris, emploie presque partout.

**Règle S.**
- Le C de CE est écrit `tché` ; son nom italien est *ci*, donc `tchi-é`.
- ASTM est épelé avec les noms français des lettres ; il devient `a-ès-sé-ti-èm-mé`.

**Règle T.**
- *sciocchezze* : le *i* de *sci* est muet devant *o*, d'où `choc-quét-tsé`.
- *commedie* n'a qu'un seul *d* : `kom-MÈ-dié`.
- `tro-Va-ré` devient `tro-VA-ré`.

**Règle A.** *rivedere* est accentué ri-ve-DE-re.

## Lot de contenu séparé : 34 gloses certaines, 3 blocs, 93 propositions

Le lot est dans [`lot-contenu-gloses.json`](lot-contenu-gloses.json).

**« Italien » traduit par « français ».** Cinq gloses rendent *italiano* par « français » : *Da quando studi l'italiano?* (deux fois), *Come si dice in italiano?* (deux fois) et *Parli italiano?*. C'est la même famille d'erreur que 日本語 et 한국어 en fr-ja et fr-ko. La recherche dans tout le couple n'en trouve pas d'autre.

**Faux sens et contresens :**

| Italien | Glose actuelle | Glose corrigée |
|---|---|---|
| *Assurdo!* | « Grave ! » | « C'est absurde ! » |
| *Il troppo stroppia* | « Trop, c'est trop » | « L'excès nuit en tout » |
| *Stare per* | « être en train de » | « être sur le point de » |
| *Cade a proposito* | « ça tombe sous le sens » | « ça tombe bien » |
| *Ne vedremo delle belle* | « on aura tout vu » | « on en verra de belles » |
| *Ecco il mio biglietto* | « ma carte » | « mon billet » |
| *precisare* | « nuancer » | « préciser » |
| *centrare il bersaglio* | « viser » | « toucher la cible » |
| *Piacere di conoscerla* | « au plaisir de vous rencontrer » | « ravi de faire votre connaissance » |

**Tutoiement et vouvoiement.** Quatre gloses ne respectent pas une forme nette :
- *Resti in linea* est au *Lei* : « Ne quittez pas » ;
- *Fai come a casa tua* tutoie : « Fais comme chez toi » ;
- *Quanto ti devo?* tutoie : « je te dois » ;
- *Quale taglia prende?* demande « prenez-vous », et non « gardez-vous ».

Plusieurs gloses ont aussi perdu un pronom ou un mot : *dirtelo*, *parlarne*, *l'ho*, *mi*, *domattina*, *da parte mia*, *ogni*, *grazie*.

**Trois blocs**, où l'étude, la glose et l'aide changent ensemble :
- *Torno da voi in seguito alla mia mail* devient *Faccio seguito alla mia mail*. La phrase d'origine calque « je reviens vers vous », alors que *tornare da voi* veut dire revenir physiquement chez vous.
- *privilegiamo l'amichevole* devient *la via amichevole*. Employé seul, *l'amichevole* désigne un match amical.
- *propone meno caro* devient *offre un prezzo più basso*.

## Niveaux, thèmes et doublons : 280 propositions sur 278 identifiants, aucune appliquée

Les propositions sont dans [`propositions-niveaux-themes.json`](propositions-niveaux-themes.json).

**Thèmes : 217.** 150 ont une destination nommée qui existe au même niveau ; les 67 autres valent `null`. Comme dans les autres couples, les thèmes `conversation` servent de fourre-tout :

| Thème | Propositions |
|---|---:|
| L8 « Exprimer un désaccord avec tact » | 64 |
| L5 « Se mettre d'accord » | 42 |
| L6 « Donner son avis et relancer » | 9 |

**Doublons : 47**, dont 28 sont des doublons exacts de l'étude. **Niveaux : 16**, surtout des formules de L1 placées en L6 à L9.

## Conventions à décider : 30 lignes

Elles sont dans [`conventions-a-decider.json`](conventions-a-decider.json) :
- *sc* devant *e* ou *i* écrit `sh` dans les modèles reçus, au lieu de `ch` ;
- *gli* écrit `lli` au lieu de `li` ;
- *z* sourd ou sonore, par exemple dans *polizza* ;
- les emprunts anglais : *wifi* (`oui-fi` ou `ouaï-faï`), *label*, *puzzle* ;
- les sigles abrégés (`èm` pour *emme*) ;
- quelques accents à vérifier.

## Limites

La lecture a été faite en 21 parties parallèles. J'ai ensuite repris chaque constat certain et cherché chaque famille dans tout le couple : la nasale, « français » et les sigles.

Un vérificateur indépendant a relu les 107 lignes et n'a trouvé aucun faux certain. J'ai retenu deux de ses remarques :
- *jeans* devient `djinnss`, pour que le *s* final soit lu ;
- *Ne vedremo* garde le futur simple, « on en verra de belles ».

J'en ai écarté deux autres :
- Je n'ai pas doublé le *m* de `tèm-po`, parce que `è` empêche déjà la nasale.
- J'ai gardé *la via amichevole*, qui est juste. *Soluzione amichevole* serait une variante.

Une écoute native reste nécessaire. Rien n'est fusionné dans `main` ni publié sur melunga.com.
