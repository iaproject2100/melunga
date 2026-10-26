# Reprise du lot 6 — coréen pour francophones

État historique du lot 6 à `d56fe23`. Le [lot 7](../verification-raccord-lot7.md) décrit l’édition actuelle.

La livraison de Claude `87357b1` est raccordée sur les avant de `161d0eb`,
après les couches précédentes conservées. Deux registres séparent les aides
et lectures des corrections de contenu.

- **18 aides entières et cinq lectures liées** : 17 cartes canoniques et un
  modèle reçu, sans copie de transport, soit 18 objets et 23 champs. Les cinq
  paires sont atomiques. Pour 닭, `dalg-` suit l’orthographe du champ de lecture ;
  l’aide rend la liaison ciblée. Cela ne généralise pas une règle de batchim.
- **45 gloses certaines et deux blocs atomiques étude/lecture/aide** : 47
  canoniques et 51 champs, sans copie ni reçu. Les cinq 한국어 désignent le
  coréen ; 만 원 désigne dix mille wons. 경우예요 et 모두의 것을 sont corrigés
  avec leurs lectures et aides, en conservant notamment `eui`.

Les deux registres sont disjoints : **65 identifiants, 65 objets et 74 champs**.
Les annotations antérieures restent intactes, y compris les corrections B sur
3980, 909, 2362, 2915 et 3284. La régénération réapplique ces événements figés ;
elle n’étend aucune règle à des phrases non déclarées.

[Contrat des aides/lectures](../corrections-phonetiques/lot6/README.md),
[contrat du contenu](../corrections-contenu/lot6/README.md),
[contre-lecture des aides](alignements.md), [contenu](contenu.md),
[couverture et correctif japonais](couverture.md).

La couverture est exacte : **4 734 canoniques + 36 modèles reçus = 4 770
positions / 4 766 identifiants**. Les quatre identifiants à deux rôles portent
des statuts concordants. Claude annonce **40 cellules lues sur 70** : fr→zh,
zh→fr, fr→ja et fr→ko. Les trente cellules des trois couples latins restent
à relire. Le raccord et ses essais ne constituent pas cette relecture humaine.

Les **447 propositions sur 432 identifiants** restent non appliquées :
327 thèmes (239 destinations nommées et 88 null), 89 doublons, 31 niveaux.
Les **260 conventions sur 259 identifiants** restent aussi intactes, y compris
les lignes qualifiées de certaines : leur application relève d’une décision
sur la convention, particulièrement les 115 cas de batchim. Les 148 gloses
incertaines ne sont pas appliquées.

Le correctif `45cebbd` rectifie le before d’étude de la proposition japonaise
incertaine `catalogue:ja:833`, sans appliquer cette proposition ni modifier
une carte japonaise. Les preuves anciennes restent figées ; le correctif est
consigné séparément dans [preuves-claude](preuves-claude/).

Les identifiants, placements, thèmes, niveaux, rôles, étapes, prix et droits
restent conservés. La présentation validée reste identique. Les 32 115 cartes
classiques et les niveaux catalogue qui déterminent l’accès gratuit restent
intacts. Les notes Codex interrompues ne font pas partie de cette livraison.

[Message prêt pour Claude](message-pour-claude.md).
Aucune certification native globale, fusion dans main ni publication sur melunga.com.

Validation du lot 6 : **6 tests ciblés + 20 historiques, 9 commandes et 19 contrôles généraux réussis ; 131 contre-épreuves Python refusées**. [Rapport et limites](../verification-raccord-lot6.md).
