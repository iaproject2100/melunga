# Lot 4 — couverture, propositions et conventions

Ce contrôle relit les valeurs et les périmètres des fichiers de Claude à
`7631c0f`, avec les avant du snapshot `606592c`, et les rectifications du lot 3
à `c849bf3`. Il ne reproduit pas la lecture linguistique de toutes les cartes
et ne certifie pas une prononciation native.

## Couverture complète et rôles distincts

**4 700 cartes canoniques, réserves comprises, et 36 modèles reçus font
4 736 positions / 4 729 identifiants distincts.** Les sept identifiants qui
existent dans les deux rôles sont `1192`, `1605`, `1634`, `176`, `3038`, `463`
et `8` dans `catalogue:fr`. Chacun possède le même statut principal dans ses
deux lignes de couverture. Le multiensemble des identifiants, rôles et niveaux
correspond exactement aux positions réelles : aucune omission, aucun ajout,
aucun rôle remplacé par un autre.

Les compteurs se reproduisent : **4 010 vérifiés, 260 corrigés, 296 propositions,
161 incertains et neuf gloses à corriger**. Les 259 identifiants du registre
phonétique correspondent exactement aux statuts corrigés ; `463` (« Bonne
journée ! ») est aussi un modèle reçu, d’où 260 positions corrigées. Aucun statut
« vérifié » ne masque un suivi inscrit dans les autres fichiers.

Le raccord des 259 aides touche **257 canoniques**, **15 copies de transport**
et **trois modèles reçus**, soit **275 objets**. Deux modèles sont reçus seuls ;
le troisième est la reprise reçue de `463`. Les 259 avant entiers et leurs
positions déclarées sont exacts ; les copies partagent le même tuple avant.
Aucun de ces identifiants ne portait une annotation de correction antérieure.

Les règles principales donnent bien S65, L54, T50, G42, A22, X20 et R6 : **259**.
Trois événements ont aussi une seconde règle (`463` G+S, `1668` T+G, `2365` T+S).
Compter toutes les étiquettes de règle donnerait 262 ; cela ne représente pas
262 aides différentes.

L’avancement individuel annoncé par Claude est donc **20 cellules sur 70** :
les dix fr→zh précédentes et les dix zh→fr de ce lot. Ce contrôle de périmètre
ne valide pas automatiquement leur progressivité ni chaque formulation.

## Dossiers de contenu et de classement distincts

Le fichier de gloses comporte **112 items sur 112 identifiants** : huit dits
certains et 104 incertains, plus le bloc lié `757` à part. Tous leurs avant,
champs étudiés et niveaux correspondent au snapshot. Le bloc possède bien
`applyTogether: true` et ses champs avant sont cohérents ensemble. La relecture
linguistique et l’intégration du bloc ne sont pas effectuées par ce script.

Les **309 propositions** portent sur **305 identifiants** : `1692`, `1928`,
`1933` et `3252` portent deux propositions. Elles comprennent **237 thèmes,
38 niveaux et 34 doublons signalés**. Aucun de ces nombres ne signifie que
les propositions sont approuvées ou que les identifiants peuvent être supprimés.

Parmi les 237 lignes de thème, **183 propositions nomment une destination**,
avec **184 références concrètes** vérifiées — une ligne cite deux alternatives.
Chaque identifiant de destination existe au même niveau et possède exactement
le titre annoncé. Les **54 autres lignes sont à contextualiser** et ont bien
un booléen `destinationExistsAtSameLevel` à `null`. Les niveaux et doublons
ont aussi ce booléen à `null`. La réserve `3288` porte légitimement un titre
`null`, puisqu’elle n’est pas une rubrique affichée.

L’existence d’un thème ne prouve pas que l’acte de parole lui convient. De même,
les 34 doublons restent des propositions à examiner avec leurs sens et contextes ;
une proximité de casse ou de ponctuation ne commande pas une suppression.

## Conventions : deux stades d’avant à ne pas confondre

Les **81 lignes concernent 81 identifiants**. Pour **76**, le champ `before`
est exactement celui de `606592c`. Les cinq lignes sur [vy] — `971`, `1451`,
`2426`, `2439`, `2581` — portent au contraire **l’après de l’événement phonétique**
qui rétablit le *v*. Le motif l’explicite : le choix commun pour la voyelle
[y] reste à faire après cette correction ciblée.

Ces cinq lignes ne sont donc pas cinq avant exacts de `606592c`. Le suivi doit
nommer son stade après-registre, ou séparer `beforeAtBase` et `currentAfter`.
La discordance de libellé ne bloque pas les événements phonétiques, dont les
avant sont exacts, et n’autorise pas à appliquer les graphies proposées pour [y].
Aucune convention n’est arbitrée ou déployée par ce contrôle.

## Rectifications du lot 3

À `c849bf3`, les **340 propositions** précédentes sont conservées. Seuls
**81 booléens** changent, de `true` à `null`, exactement pour les destinations
à contextualiser ; les autres champs de ces propositions sont inchangés.

Les trois formulations de glose demandées pour `2165`, `3767` et `1110` sont
bien rectifiées : concession sans la réduire à « au pire », et version dans
la taille au-dessus sans ajouter une demi-pointure. Les avant des 99 items
amendés restent exacts au snapshot courant ; l’acceptation linguistique des
après est traitée dans le dossier de contenu séparé.

Le bloc `1900` possède bien un avant/après complet **étude + lecture + aide +
sens**, avec `applyTogether: true`. Son tuple avant est conforme à `606592c`.
La suppression de la finale parasite ne doit pas être appliquée isolément au
texte étudié en laissant les trois autres champs dans un état incompatible.
Le fichier amendé compte 25 items certains, plus ce bloc lié, au lieu des deux
lignes isolées de l’ancienne livraison.

## Reproduction et limites

Les valeurs et empreintes sont dans [couverture-preuves.json](couverture-preuves.json).
Le contrôle lit les objets Git épinglés, sans importer le producteur ni modifier
les données d’application :

```sh
python3 -B docs/niveaux-progressifs/reponse-revue-integrale-lot4/verifier_couverture.py
```

Il vérifie l’identité et la traçabilité ; il ne remplace ni la contre-lecture des
aides, ni celle des gloses, ni l’écoute native. Il ne valide aucune fusion dans
`main`, publication, nouvelle frontière gratuite ou modification de présentation.
