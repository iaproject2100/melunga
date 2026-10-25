# Reprise du lot 5 — japonais pour francophones

État historique du lot 5 à `161d0eb`. Le [lot 6](../verification-raccord-lot6.md) décrit l’édition actuelle.

Le lot de Claude `62daa86` est repris sur les avant de `f22202c`, dans deux
registres distincts. Le suivi du lot 4 à `8bd6297` est vérifié comme errata
et stades de conventions, sans réécrire les preuves ni les valeurs du lot 4.

## Deux raccords distincts

- **Quatre paires aide/lecture**, huit événements de preuve pour quatre identifiants.
  Avec la copie de 4320 : cinq objets et dix valeurs changées. Aide et lecture
  sont liées et appliquées ensemble. Le modèle à trou 3771 reste dans la réserve,
  sans entraînement ni dialogue artificiel ajouté.
- **26 gloses certaines**, dans un registre de contenu distinct. Elles changent
  le sens français affiché sans modifier les cibles japonaises, les aides ou
  les lectures de ces 26 cartes. Les cinq mentions de 日本語 sont rendues comme
  « japonais », pas « français ». Il n’y a ni copie ni modèle reçu à mettre
  à jour dans ce second lot.

Les deux registres ne partagent aucun identifiant. Ils touchent **30 identifiants,
31 objets et 36 valeurs**, après les couches précédentes qui restent intactes.

[Contrat des paires d’aides/lectures](../corrections-phonetiques/lot5/README.md),
[contrat des gloses](../corrections-contenu/lot5/README.md),
[contre-lecture entière des corrections](alignements-contenu.md),
[contrôle de couverture et errata](couverture-errata.md).

La cible 光る reste dans la rubrique Actions et descriptions : la glose corrigée
« briller » ne demande aucun reroutage de cette carte. Les traductions retenues
sont défendables dans les contextes choisis ; le keigo n’impose pas une règle
universelle de vouvoiement français. « Peu importe » lève une ambiguïté de
« N’importe quoi » sans prétendre que cette dernière expression est toujours
fausse dans une réponse de choix.

## Couverture et dossiers non appliqués

La couverture est exacte : **4 727 canoniques + 36 modèles reçus = 4 763 positions
et 4 757 identifiants distincts**. Les six identifiants à deux rôles ont des statuts
compatibles. La lecture individuelle annoncée par Claude couvre maintenant
**30 cellules sur 70** ; il poursuit fr→ko puis les trois couples latins.

Les **604 propositions de classement sur 582 identifiants** restent non appliquées :
463 propositions de thème, 100 de doublon et 41 de niveau. Les 306 destinations
nommées existent au même niveau, 157 restent null. Une destination existante
ou deux textes proches ne prouvent ni une bonne progression ni un doublon à
supprimer. Les cibles japonaises à deux voix, présentes avant ce lot dans les
cartes 2395, 2615 et 2647, restent telles quelles : corriger leur glose ne valide
pas leur classement en production d’un seul apprenant.

Le fichier de gloses compte **173 lignes / 172 identifiants**, soit 26 certaines
et 147 incertaines. La proposition incertaine 833 donne une lecture romaji comme
before d’un champ study ; son before doit être rectifié, sans bloquer les deux
raccords retenus. L’unique convention クッション reste intacte, avec son stade
snapshot explicite.

Les errata des motifs 604, 2158 et 2463 concordent avec les après réellement
livrés au lot 4. Les 81 conventions du lot 4 ont désormais un stade explicite :
76 avant au snapshot et cinq après le registre phonétique. Les valeurs et
empreintes figées de ce registre ne changent pas.

Les originaux sont conservés dans [preuves-claude](preuves-claude/). Les notes
Codex interrompues restent hors de cette livraison. Les identifiants, types,
placements, niveaux, rôles, étapes, prix et droits restent conservés ; les
seules différences sont les champs nommément corrigés et leurs annotations.

[Message prêt pour Claude](message-pour-claude.md).
Aucune certification native globale, fusion dans main ou publication sur melunga.com.

Validation du lot 5 : **5 tests ciblés + 15 historiques, 9 commandes et 19 contrôles généraux réussis ; 111 contre-épreuves Python refusées**. [Rapport et limites](../verification-raccord-lot5.md).
