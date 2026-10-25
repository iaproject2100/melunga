# Lot 7 — fr-en L1 à L10 lus carte par carte, et modèles reçus

Référence : `d56fe23`, branche `review/themes-niveaux-progressifs`, lots 3 à 6 compris. Aucun fichier de l'application n'est modifié.

## Couverture : 4 740 positions, chacune avec un statut

| Partie | Positions |
|---|---:|
| fr-en L1 à L10, `themes[].phrases` et `reserve[]`, et `receivedModels` | 4 740 |
| **Identifiants distincts** | **4 735** |

La preuve est dans [`couverture.json`](couverture.json). La liste lue dans chacune des 20 parties a été comparée, dans l'ordre, à celle du fichier source : aucun écart.

| Statut | Positions |
|---|---:|
| `verifie` | 3 763 |
| `corrige` | 228 |
| `glose-a-corriger` | 16 |
| `proposition` | 633 |
| `incertain` | 100 |

**Cellules désormais lues individuellement : 50 sur 70.**

## Registre : 228 aides entières, chacune figée avant et après

Le registre est dans [`registre-phonetique.json`](registre-phonetique.json). Une même aide peut relever de plusieurs règles. Les 228 aides comprennent trois modèles reçus. Aucune lecture n'est concernée : fr-en n'a pas de champ `reading`.

| Règle | Défaut | Aides |
|---|---|---:|
| G | *g* dur écrit `g` devant *e*, *é*, *è*, *i* ou *y*, que le francophone lit [ʒ] (`GÈT`, `GIV`, `GÉÏT`, `LEU-geudj`, `CHOU-geur`) → `gu` (règle B, déjà retenue pour fr-es) | 145 |
| W | segment qui fait lire un autre mot ou un autre son (voir ci-dessous) | 22 |
| A | accent tonique faux pour la nature du mot dans la carte | 21 |
| H | *h* transcrit `j`, que le francophone lit [ʒ] (`JI`, `jav`, `jir`, `JANDZ`, `jáus`) | 21 |
| Z | *s* ou *z* qui change le mot | 18 |
| T | aide tronquée ou faute de frappe | 7 |

**Règle G.** Le vérificateur a confirmé que le *g* de chaque mot est dur. Dans *jungle*, *luggage*, *baggage* et *engaged*, la partie [dʒ] reste écrite `dj`. Quatre cas sont particuliers :
- *singer* devient `SING-eur` et *bringing* devient `BRING-ing`, car ces mots n'ont pas de [g] ;
- *argue* et *regularly* deviennent `guiou`.

**Règle W.**
- `LÈD` → `LID` pour *lead time* (cinq cartes) et `RÈD` → `RID` pour *read* au présent.
- `WAÏND` → `WIND` pour *the wind* et `LAÏV` → `LIV` pour le verbe *live*.
- *Wi-Fi* `wi FAÏ` → `WAÏ-faï`.
- *would* `oud` → `woud`.
- `du` → `dou` et `I-vin` → `I-veun`.
- *accept* `eu-SÈPT` → `ak-SÈPT` et *reusable* `ri-OU` → `ri-YOU`.
- *restaurant* `RÈS-tronn` → `RÈS-tronnt`.
- *only* `OUN-li` → `ÔN-li`.

**Règle A.**
- Les noms *refund*, *discount*, *transfer* et *produce* sont accentués sur la première syllabe.
- Le verbe *refund* est accentué sur la seconde (1026).
- *perfect* est un adjectif : `PEUR-fèkt`.
- *content*, glosé « satisfait », est l'adjectif : `keun-TÈNT`.
- *sometimes*, *sunscreen* et *overheats* sont aussi corrigés.

**Règle Z.**
- Les verbes *use* et *close* se prononcent avec [z].
- *Excuse me* est corrigé en `ik-SKYOUZ`.
- *used to*, au sens de l'habitude, se dit `YOUST`.
- Restent inchangés : l'adjectif *close*, *useful*, *useless* et *I used it*.

**Règle T.**
- Le signe % n'était pas transcrit (`peur-SÈNT`).
- Le Q de MOQ était tronqué : `KY` devient `KYOU`.
- Le E de EN71 manquait.
- Le découpage `pos-TPON` devient `post-PON`.

Chaque famille a été cherchée dans tout le couple, et pas seulement dans les constats des lecteurs. Les 21 *h* écrits `j` sont tous les cas trouvés. Les `jeur` de *pleasure* et *measure*, le `jou` de *usual* et le `jeun` de *decision* sont justes, donc gardés.

## Lot de contenu séparé : 11 gloses certaines, 5 blocs, 95 propositions

Le lot est dans [`lot-contenu-gloses.json`](lot-contenu-gloses.json).

**Huit gloses** se terminent par le point d'interrogation pleine chasse chinois **？**. Les 739 autres gloses du couple écrivent « ? » précédé d'une espace. Ces huit-là sont les seules dans ce cas.

**Trois sens** sont omis ou faux :
- *See you at eight* est glosé « à huit heures » ;
- *still use* est glosé « garder » ;
- *to check quality* est glosé « pour la qualité ».

**Cinq blocs** : l'étude, l'aide et, s'il le faut, la glose changent ensemble.

| Étude actuelle | Étude corrigée |
|---|---|
| *No spicy* | *Not spicy* |
| *dye our color* | *dye it in our color* |
| *I make a quote* | *I'll prepare a quote* |
| *burn that bridge* | *cross that bridge* (« advienne que pourra » retiré de la glose) |
| *accept installment payment* | *accept payment in installments* |

*I'll revert to you* et *How to optimize loading?* restent incertains : le premier est un usage régional, le second une tournure de titre.

## Niveaux, thèmes et doublons : 672 identifiants, rien n'est appliqué

Les propositions sont dans [`propositions-niveaux-themes.json`](propositions-niveaux-themes.json).

**Thèmes : 618 propositions.** Les 425 destinations nommées existent au même niveau. Les 193 autres sont « à contextualiser » et valent `null`. Les thèmes `conversation` et `vocab-actions` servent encore de fourre-tout :

| Thème | Propositions |
|---|---:|
| L6 conversation | 81 |
| L6 vocab-actions | 58 |
| L4 conversation | 48 |
| L5 conversation | 38 |
| L3 vocab-actions | 33 |

**Doublons : 38. Niveaux : 33.**

## Conventions à décider : 30 lignes

Elles sont dans [`conventions-a-decider.json`](conventions-a-decider.json). Aucune n'est appliquée :
- les rendus de *one* et de *w* (`OUANN` ou `WEUN`) ;
- la variété américaine ou britannique ;
- *o* devant *n* lu nasal : `ON-li` et `LON-li`, ainsi que *tone* laissé tel quel dans `RING-tone` et `PAN-tone` ;
- quelques accents discutables.

## Limites

La lecture a été faite en 20 parties parallèles. J'ai ensuite repris chaque constat certain et cherché chaque famille dans tout le couple.

Un vérificateur indépendant a relu les 228 aides, les 11 gloses et les 5 blocs. Il n'a trouvé aucun faux certain. J'ai retenu deux de ses remarques :
- *restaurant* s'écrit `tronnt`, car `tront` se lirait nasal ;
- la règle W est ajoutée à 2372.

J'ai gardé `ÔN-li`, déjà employé ailleurs dans le deck, et `keun-TÈNT`, puisque la glose est « satisfait ».

Une écoute native reste nécessaire. Rien n'est fusionné dans `main` ni publié sur melunga.com.
