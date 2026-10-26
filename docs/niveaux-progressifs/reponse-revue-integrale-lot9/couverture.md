# Couverture et réserves du lot 9 italien

L'audit de [couverture.json](couverture.json) reproduit les positions depuis les objets Git de `40d4c0b264b364fe31d4fd1bc9acae03dc130e01`, puis les compare aux preuves de Claude, commit `5d450cc79f32d180f9331c5d06387fe36e8d94a6`. Les huit pièces copiées dans [preuves-claude](preuves-claude/README.md) sont identiques octet par octet ; leurs empreintes et celles des 77 fichiers de la base sont consignées dans le rapport. Le script n'importe pas le générateur et ne modifie aucun fichier produit.

## Positions, ordre et statuts

Les **4 720 positions canoniques**, réserves comprises, et **36 modèles reçus** donnent **4 756 positions / 4 753 identifiants**. Les 21 parties de lecture retrouvent exactement l'ordre des dix cellules et celui des répliques reçues. Aucun ajout ni omission. Les modèles reçus portent tous `heardOnly: true` et `referenceOnly: true`.

| Statut de Claude | Positions |
|---|---:|
| Vérifié | 4 276 |
| Corrigé | 70 |
| Glose à corriger | 36 |
| Proposition | 263 |
| Incertain | 111 |
| **Total** | **4 756** |

Les identifiants `catalogue:it:6`, `catalogue:it:315` et `catalogue:it:2937` apparaissent chacun dans deux rôles, canonique et reçu, avec un statut cohérent. Les champs avant de chaque aide, contenu, proposition et convention correspondent à cette base exacte.

Les 70 aides comptent 69 objets canoniques, quatre copies de transport et un reçu, soit **74 objets / 74 champs** : N 63, S 3, T 3, A 1. Aucune lecture n'est modifiée. Les copies sont celles de `it:2762`, `it:875`, `it:4256` et `it:4261`. Aucun de ces événements ne remplace une correction antérieure.

Les **34 gloses** concernent 32 objets canoniques et deux reçus. Les trois blocs concernent `it:2489`, `it:3879` et `it:4098`, et portent chacun étude, sens et aide. Cela représente **37 objets / 43 champs**, sans copie de transport. `it:1736` reçoit une correction d'aide puis une correction de sens : il reste prioritairement `corrige` dans la couverture. C'est pourquoi les 37 identifiants du lot de contenu ne donnent que 36 positions `glose-a-corriger`.

Le total italien est donc **106 identifiants distincts / 110 objets distincts / 117 champs** ; les 111 occurrences de couche comptent deux fois l'objet `it:1736`. L'erratum espagnol EN71 est un événement distinct, hors de cette couverture italienne.

## Ce qui reste non appliqué

Les **280 propositions sur 278 identifiants** ont toutes leur étude, leur sens et leur emplacement actuels vérifiés :

- 217 propositions de thème : **150 destinations nommées existent au même niveau**, 67 destinations valent explicitement `null` et demandent une contextualisation ;
- 47 propositions de doublon : **28 lignes ont une étude strictement identique**, 18 ont seulement des différences de ponctuation ou de casse, et une compare `un fornello` à `il fornello` ;
- 16 propositions de niveau, sans changement de niveau appliqué.

Le contrôle résout 48 comparaisons de doublons : 28 exactes, 19 avec ponctuation/casse normalisée et une avec article différent. La différence entre lignes et comparaisons vient de `it:2806`, qui cite deux cibles. Aucune suppression de doublon n'est déduite de ce relevé.

Les **30 conventions sur 30 identifiants** gardent toutes leur aide avant, et sont toutes marquées incertaines par le lecteur. Elles n'intersectent aucun champ appliqué. Les intitulés de groupes sont des étiquettes documentaires, pas une validation linguistique de la famille. Aucun statut `verifie` ne masque ici une correction, une proposition ou une convention ouverte.

### Deux rectifications documentaires

1. Le README et le message de Claude annoncent **93 contenus incertains**. Le fichier réel contient **96 lignes sur 96 identifiants distincts**, soit 68 sens et 28 études : ni doublons ni recouvrement avec les trois blocs. Les 96 restent non appliqués. La preuve originale est conservée telle quelle ; le compte rendu utilise le total du fichier réel.
2. La proposition de doublon `catalogue:it:901` cite correctement `catalogue:it:889`, dont l'étude est aussi `Com'è andata?`. Mais sa justification indique `themes/8/phrases/31 et 37`, emplacements de `it:808` et `it:828`. Les bons emplacements sont **62 et 68**. Le contrôle retient les identifiants explicites et signale les deux chemins descriptifs erronés ; aucune carte n'est modifiée sur cette base.

## Fin des 70 cellules : portée exacte

Claude déclare la lecture individuelle des **70 cellules sur 70**. L'inventaire de la base retrouve, sur les sept couples, **33 654 positions canoniques et 252 positions reçues**, soit 33 906 positions de ces deux rôles ; les copies de transport n'y sont pas comptées une seconde fois.

| Couple | Positions canoniques | Reçus | Positions | Identifiants distincts |
|---|---:|---:|---:|---:|
| fr→en | 4 704 | 36 | 4 740 | 4 735 |
| fr→es | 4 959 | 36 | 4 995 | 4 992 |
| fr→it | 4 720 | 36 | 4 756 | 4 753 |
| fr→ja | 4 727 | 36 | 4 763 | 4 757 |
| fr→ko | 4 734 | 36 | 4 770 | 4 766 |
| fr→zh | 5 110 | 36 | 5 146 | 5 142 |
| zh→fr | 4 700 | 36 | 4 736 | 4 729 |

Le détail **26 vérifiées / 4 propositions / 2 incertaines / 1 corrigée pour N** des 33 aides italiennes de *s* intervocalique est déclaré dans le README de Claude. Le manifeste de couverture ne porte pas de marque permettant de relier ces 33 aides à leurs identifiants : ce sous-total n'est donc pas reconstruit individuellement par ce script. La conclusion « aucune faute certaine de *s* en italien standard » est attribuée à sa relecture. Aucune règle générale de doublement de *s* n'est réintroduite.

Un inventaire exact et des statuts documentés prouvent la traçabilité, pas l'acquisition de l'apprenant, la progressivité pédagogique globale ou une écoute native. Les conventions et propositions des sept couples restent des décisions distinctes.

## Reproduire

Depuis la racine du dépôt :

```sh
python3 docs/niveaux-progressifs/reponse-revue-integrale-lot9/verifier_couverture.py
```

Le script contrôle aussi que les 70 fichiers de niveau et sept répertoires gardent leurs placements, séquences, sources et rôles, et que les **36 fichiers d'interface de premier niveau**, les sept instantanés de conversation L1 et le catalogue classique restent inchangés. La frontière gratuite conserve sa définition : `FREE_LV = [1]`, avec `isFreeCard` fondé sur le `lv` d'origine du catalogue. Le reclassement éditorial n'altère pas ces droits.

Aucune fusion dans `main`, aucune publication sur melunga.com. Ce rapport ne constitue pas une approbation native ou pédagogique globale.
