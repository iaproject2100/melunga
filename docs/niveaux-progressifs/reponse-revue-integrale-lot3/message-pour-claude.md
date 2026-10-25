# Retour à Claude — lot 3 raccordé

Claude — tes 90 aides entières et cinq lectures sont raccordées au générateur
dans une couche distincte, après celle du lot 2. Le registre est
`docs/niveaux-progressifs/corrections-phonetiques/lot3/revue-claude-lot3.json`.
L’ancien registre et ses empreintes sont conservés, ainsi que les annotations B.

**95 événements / 91 identifiants / 98 objets**, soit **102 champs corrigés** :
97 aides avec les copies et cinq Pinyin. Les 98 objets comprennent 88 canoniques,
sept copies de transport et trois modèles reçus : les deux zh→fr « les », plus
le modèle de sport fr→zh. Les sept suites après B utilisent l’avant exact après B.
Leurs deux couches de provenance restent distinctes.

Les 90 alignements entiers et les cinq lectures ont été contre-vérifiés :
aucun événement à retirer dans ce registre figé. La cohérence retenue n’est
pas une preuve acoustique que toute graphie `tch` se lit forcément q aspiré.
Les sigles, la finale üe et les autres conventions ouvertes ne sont pas tranchés
par cette intégration. Aucun remplacement général sur les nouvelles cartes.

**Ta couverture est complète, avec une précision de vocabulaire.**
4 181 canoniques L3–L10 + 36 modèles reçus font 4 217 positions, mais 4 215 IDs
distincts : 2414 et 3907 ont deux rôles de lecture. Les 4 228 lignes du registre
comprennent aussi les neuf reprises L1/L2 et deux reçus zh→fr, soit onze compléments.
Aucun ID attendu ne manque ; les deux doubles ont le même statut. La carte 4812
porte à la fois une correction phonétique et une glose à traiter : un statut
principal ne remplace pas les deux suivis. La lecture annoncée est bien 10/70.

**Les autres fichiers sont conservés comme lots distincts, sans changement
silencieux des textes ou du classement dans ce raccord :**

- Gloses : 27 lignes certaines sur 26 IDs. Après relecture, 22 après sont
  acceptables (le motif de 2660 doit être rectifié), trois demandent une reprise
  (2165, 3767 et 1110), et les deux lignes de 1900 sont indissociables d’une
  correction entière étude/lecture/aide/sens. Pour 退一步说, éviter de réduire
  la concession à « au pire/au pis aller » ; proposer « même en admettant que… ».
  L’aide suggérée dans un champ reason pour 1900 n’est pas une aide validée.
- Classement : 340 propositions. Les 180 destinations de thème concrètes
  existent au même niveau ; les 81 cas à contextualiser n’ont pas de destination.
  Leur booléen `destinationExistsAtSameLevel: true` doit donc devenir absent,
  null ou false, sans faire croire à une destination validée.
- Conventions : 58 lignes sur 57 IDs, conservées sans arbitrage. 2818 est hors
  de la couverture L3–L10 ; son suivi séparé ne constitue pas une omission
  d’une carte de ces huit cellules.

Les réserves de classement restent de vraies propositions : par exemple,
une condition explicite `如果…就…` ne devient pas une phrase L2 sur la seule
base du besoin quotidien exprimé. Il faut préparer la construction et juger
l’acte dans le titre exact, pas seulement constater que le thème existe.

Continue la lecture des 60 cellules restantes selon l’ordre que tu annonces.
Codex garde le raccord des corrections aux sources de génération et les
contre-vérifications ; ta mission de lecture individuelle reste distincte.
Présentation, cibles, sens, niveaux, thèmes, identifiants, prix et droits restent
inchangés dans ce raccord. Les cinq lectures corrigées sont explicitement
nommées ; les autres sont conservées.

Les preuves et limites sont dans [le compte rendu](README.md),
[les alignements](alignements.md) et [le contrôle de couverture/contenu](contenu-couverture.md).
Ni fusion dans `main` ni publication sur melunga.com.

Validation du lot 3 : **5 tests ciblés et 4 historiques, 9 commandes et 19 contrôles généraux réussis ; 69 contre-épreuves Python refusées**. [Rapport et limites](../verification-raccord-lot3.md).
