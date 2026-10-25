# Reprise du lot 3 de Claude — chinois L3 à L10

Le raccord reprend **90 aides entières et cinq Pinyin**, sur l’avant `3df885d`,
depuis les preuves de `d06a62e`. La couche précédente est conservée et les sept
prolongations de B sont déclarées après elle, avec leurs copies de révision.

[Contrat de génération durable](../corrections-phonetiques/lot3/README.md).
[Contre-lecture des alignements](alignements.md).
[Couverture, gloses et propositions séparées](contenu-couverture.md).

## Couverture réelle de la lecture de Claude

Les L3–L10 contiennent **4 181 cartes canoniques**, réserves comprises, auxquelles
s’ajoutent **36 positions de modèles reçus**. Cela donne **4 217 positions et
4 215 identifiants distincts** : les deux cartes 2414 et 3907 existent à la fois
en canonique et en modèle reçu, avec le même statut de suivi.

Le fichier livré contient **4 228 lignes / 4 226 identifiants distincts** : les
onze ajouts sont neuf corrections retrouvées en L1/L2 et les deux reçus zh→fr.
Aucun identifiant attendu n’est omis et les statuts des deux doubles concordent.
Le nombre de cellules individuellement lues par Claude est bien **10 sur 70**.
La lecture des 60 autres reste de son ressort, conformément à la consigne de Kartech.

## Trois lots conservés à part

Les fichiers originaux sont repris dans [preuves-claude](preuves-claude/).
Ils ne sont pas chargés par le raccord phonétique.

- **Gloses et contenu : 101 événements sur 99 identifiants**, dont 27 lignes
  classées certaines et 74 propositions. Les 27 lignes certaines portent sur
  26 identifiants, car la carte 1900 a un changement de cible et de sens.
  La contre-lecture distingue les formulations prêtes, les motifs à corriger
  et les après à reprendre. Une citation chinoise changée doit recevoir sa
  lecture et son aide entières cohérentes ; elle n’est pas corrigée par simple
  collage ou suppression dans l’aide actuelle.
- **Classement : 340 propositions**, dont 261 de thème, 78 de niveau et un doublon.
  Les 180 destinations de thème concrètes existent au même niveau avec leur
  intitulé exact. Les 81 cas à contextualiser n’ont pas de destination choisie ;
  leur booléen `destinationExistsAtSameLevel: true` ne prouve pas le contraire.
  Aucune proposition n’est appliquée par le raccord.
- **Conventions : 58 lignes / 57 identifiants**. Aucun arbitrage silencieux de
  ü, z/ts, x/s, 儿 ou des graphies de 一样 n’est introduit. Un cas L1 supplémentaire
  hors couverture est exposé dans le suivi plutôt que compté comme L3–L10.

Les gloses de 退货 et 调光 du tour précédent restent des corrections de contenu
séparées. L’exactitude de la copie d’un avant ne prouve pas qu’une formulation
proposée est la meilleure traduction, ni qu’une montée ou descente de niveau
est justifiée.

La présentation validée, le catalogue classique, les droits gratuits et les
prix restent intacts. Aucun travail interrompu dans `relecture-individuelle-codex`
n’est compté comme une livraison de cette revue confiée à Claude.

[Message prêt pour Claude](message-pour-claude.md).
Ni fusion dans `main` ni publication sur melunga.com.

Validation du lot 3 : **5 tests ciblés et 4 historiques, 9 commandes et 19 contrôles généraux réussis ; 69 contre-épreuves Python refusées**. [Rapport et limites](../verification-raccord-lot3.md).
