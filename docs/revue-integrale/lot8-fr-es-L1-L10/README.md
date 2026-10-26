# Lot 8 — fr-es L1 à L10 lus carte par carte, et modèles reçus

Ce lot part de `224e459`, sur la branche `review/themes-niveaux-progressifs`, lots 3 à 7 compris. Aucun fichier de l'application n'est modifié.

## Couverture : 4 995 positions, chacune avec un statut

Les 4 995 positions comprennent fr-es L1 à L10 (`themes[].phrases` et `reserve[]`) et les 36 `receivedModels`. Elles correspondent à **4 992 identifiants distincts**.

La preuve est dans [`couverture.json`](couverture.json). Pour chacune des 20 parties, j'ai comparé la liste lue à celle du fichier source, dans l'ordre : aucun écart.

| Statut | Positions |
|---|---:|
| `verifie` | 4 450 |
| `corrige` | 63 |
| `glose-a-corriger` | 23 |
| `proposition` | 294 |
| `incertain` | 165 |

**Cellules désormais lues individuellement : 60 sur 70.**

## Registre : 63 aides entières, chacune figée avant et après

Les aides sont dans [`registre-phonetique.json`](registre-phonetique.json). Une carte de ce registre est un modèle reçu. fr-es n'a pas de champ `reading`.

| Règle | Défaut | Aides |
|---|---|---:|
| S | sigle ou nombre sans segment, tronqué ou laissé en lettres que le francophone lit à la française | 31 |
| G | *g* dur des passés en *-gué*/*-guí* écrit `GÉ`/`GI`, que le francophone lit [ʒ] | 11 |
| R | *rr* écrit avec un seul *r*, ce qui fait lire un autre mot | 10 |
| A | accent tonique ou découpage faux | 9 |
| T | faute de frappe | 2 |

**Règle S.**
- CE devient `SÉ É`, B/L `BÉ É-lé`, L/C `É-lé SÉ`, DHL `dé A-tché É-lé`, HS `A-tché É-sé`, QR `kou-É-rré`.
- Sont aussi épelés : FCC, CBM, ODM, MDF, PDF, ABS et T/T.
- Nombres et pourcentages restitués : EN71, E1, 220, 20, 30, 40, ainsi que 30 % et 70 %.

**Règle G.** *pagué, entregué, llegué, apagué, jugué, arriesgué, cargué, seguí, conseguí*. La recherche dans tout le couple n'en trouve pas d'autre. Ces cas avaient échappé à la règle B.

**Règle R.** Chaque cas fait lire un autre mot :

| Mot | Lu comme |
|---|---|
| *perros* | *peros* |
| *barra(s)* | *vara(s)* |
| *parra* | *para* |
| *corro* | *coro* |
| *cerros* | *ceros* |
| *cerré* | *seré* |
| *cerremos* | *seremos* |

Les autres *r* simples restent une convention à décider (voir plus bas).

**Règle A.**
- *euros* : `é-OU-ros` devient `ÉOU-ros`.
- *tíquet* : `TI-két`.
- *audioguía* : `dio-GUI-a`.
- *continuar* : `ti-NOUAR`.
- Les anglicismes en `KINR` (*parking*, *tracking*, *packing*, *dropshipping*) deviennent `kinn`.

**Règle T.** *jueves* : `RUÉ` devient `ROUÉ`. *check-out* : `OOUT` devient `A-OUT`.

## Lot de contenu séparé : 20 corrections certaines, 3 blocs, 119 propositions

Tout est dans [`lot-contenu-gloses.json`](lot-contenu-gloses.json).

**18 gloses** contiennent un faux sens, un sens omis ou une faute de français :
- *el estómago* est glosé « au ventre » ;
- *muy largo* et *muy ancho* sont glosés « trop » au lieu de « très » ;
- *No hay que decidir hoy* est glosé « il ne faut pas décider », un contresens ;
- *Flipas* est glosé « tu vas halluciner » ;
- *cerca* est omis deux fois ;
- *¿Tú también eres turista?* est glosé au vouvoiement ;
- et d'autres.

**2 études** n'avaient pas les ¡ ! d'une exclamation.

**3 blocs** où l'étude et l'aide changent ensemble, avec la glose si besoin :
- *¿Me lo pongo para llevar?* devient *¿Me lo pone…?*, car « je me le mets » se dit d'un vêtement ;
- *tarda a España* devient *tarda en llegar a España* ;
- *ver vídeo* devient *ver un vídeo*.

Deux cas restent incertains :
- *nunca digas nunca*, cité tel quel ;
- *Vamos a medio camino*. Le lecteur propose *Partamos la diferencia*, qui est un calque de l'anglais. J'ai noté *Quedemos a medio camino*.

## Conventions à décider : 151 lignes, rien n'est appliqué

Elles sont dans [`conventions-a-decider.json`](conventions-a-decider.json).

- **La jota est écrite de trois façons.**
  - `r` dans le L1 et l'essentiel du catalogue : `mé-ROR`.
  - `kh` dans les cartes de situation et un modèle reçu : `mé-KHOR`. Le francophone risque de lire [k].
  - `rh` ailleurs, y compris dans le L1 : `tra-BA-rho`.

  Cela fait 112 lignes. Le balayage les relève toutes, même sans constat d'un lecteur. Une seule graphie devrait être choisie pour tout le deck ; c'est à Kartech de décider.
- **28 *rr* écrits avec un seul *r*** sans changer le mot : *correo*, *cerrar*, *ahorrar*… Le L1 lui-même mélange `SIÉ-ra` et `PÈ-rro`.
- *ñ* écrit `gn`, deux sigles discutables (OEM, PU) et quelques accents d'anglicismes.

## Niveaux, thèmes et doublons : 310 propositions sur 308 identifiants, aucune appliquée

Elles sont dans [`propositions-niveaux-themes.json`](propositions-niveaux-themes.json).

**Thèmes : 290.** 259 ont une destination nommée qui existe au même niveau ; les 31 autres valent `null`. Comme dans les autres couples, certains thèmes `conversation` servent de fourre-tout :

| Thème | Propositions |
|---|---:|
| L8 « Exprimer un désaccord avec tact » | 113, presque toutes des phrases de négoce sans désaccord, vers L8-travail |
| L7 « Proposer une alternative » | 30, vers L7-travail |
| L2 « Trouver son chemin » | 13 |

**Niveaux : 15. Quasi-doublons : 5.**

## Limites

La lecture a été faite en 20 parties parallèles. J'ai ensuite repris chaque constat certain et cherché chaque famille dans tout le couple. La recherche du *g* dur n'a trouvé que les 11 cas relevés. Celle des sigles, des nombres et des *rr* a ajouté :
- les sigles ABS et T/T ;
- les *rr* de *cerros*, *cerré*, *cerremos* et *barras*.

Un vérificateur indépendant a relu les 86 lignes et n'a trouvé aucun faux certain. J'ai retenu ses deux remarques :
- *check-out* devient `A-OUT`, car `AOUT` se lirait « août » ;
- *No te fíes tanto* est glosé « ne fais pas trop confiance ».

Une écoute native reste nécessaire. Rien n'est fusionné dans `main` ni publié sur melunga.com.

## Errata 1 (réponse à Codex)

EN71 (2205) : je vise l'épellation distincte E + N, « e ene ». L'après devient `KOUM-plé la NOR-ma é É-né sé-TÉN-ta i OU-no`, au lieu de `é-né sé-TÉN-ta…`. L'événement figé est dans [`errata-1.json`](errata-1.json) ; il remplace entièrement l'après livré.
