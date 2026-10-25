# Lot 7 — couverture et dossiers non appliqués vérifiés

Référence des avant : `d56fe23b4bafd63bbd2d4aefb67896dbc12374a2`.
Preuves de Claude : `dec4e90a01ca40dca2394ac43eb37a4771b011b1`.
Le script lit les objets Git épinglés, sans importer le générateur. Il contrôle
la couverture et les références ; il ne reproduit pas une lecture native de
chaque carte.

## Couverture exacte

**4 704 canoniques**, réserves comprises, et **36 modèles reçus** donnent
**4 740 positions / 4 735 identifiants distincts**. Chaque position possède une
entrée unique au bon rôle et au bon niveau, sans omission ni surplus. L’ordre
annoncé se reproduit dans les vingt parties de lecture, en concaténant les
parties numérotées de chaque niveau, puis dans les modèles reçus.

Les cinq IDs présents dans les deux rôles sont `catalogue:en:427`, `748`,
`1089`, `1585` et `3160`. Tous portent le statut vérifié dans les deux rôles.
Leur présence comme modèle reçu ne crée pas une carte canonique supplémentaire.

Les statuts se reproduisent exactement : **3 763 vérifiés, 228 corrigés,
16 gloses à corriger, 633 propositions et 100 incertains**. Aucun statut
vérifié ne masque un suivi présent dans les fichiers livrés. Un statut principal
n’exclut pas plusieurs suivis sur une même carte.

La lecture individuelle annoncée par Claude atteint **50 cellules sur 70**.
Les vingt cellules de fr→es et fr→it restent à lire. Le raccord technique et
ses essais ne remplacent pas cette lecture individuelle.

## Périmètre des corrections

Les **228 aides** comprennent 225 canoniques et trois modèles reçus. Les cinq
IDs partagés entre canonique et reçu ne font pas partie de ces trois reçus
corrigés. Les 228 avant entiers concordent avec les profils du snapshot Git.
Aucune lecture n’est modifiée.

Les nombres de règles comptent des appartenances, pas des cartes distinctes :
**G 145, W 22, A 21, H 21, Z 18 et T 7 = 234 appartenances** pour 228 aides.
Six cartes portent deux règles : `794`, `2084`, `2215`, `2234`, `2372`, `2464`.
Le G du lot anglais applique localement la convention du g dur déjà retenue
sous B ailleurs ; son registre reste un ensemble d’événements figés.
Le A anglais désigne l’accent tonique : il n’est pas l’ancienne proposition
espagnole A sur le s intervocalique, qui a été retirée.

Les **106 propositions de glose** comprennent 11 certaines et 95 incertaines.
Les cinq blocs atomiques sont séparés. Tous les champs avant, les études et les
niveaux annoncés concordent avec le snapshot. Huit des onze gloses certaines
remplacent le point d’interrogation pleine chasse **？** : ce sont exactement
les huit occurrences de cette ponctuation dans les positions examinées.
Les trois autres corrections certaines portent sur le sens.

Le sous-total **739 autres gloses** du README de Claude se reproduit avec un
périmètre précis : **739 IDs distincts dont le sens se termine par « ? » précédé
d’une espace**, soit 740 positions en incluant le modèle reçu également présent
comme canonique. Si l’on compte toute occurrence interne de « ? » précédé d’une
espace, on obtient 779 positions / 778 IDs. Ce changement d’indicateur explique
l’écart ; il ne révèle pas une faute dans le nombre 739 ni une neuvième glose
pleine chasse à corriger.

## Propositions laissées à part

| Dossier | Compte vérifié | Contrôle |
|---|---:|---|
| Classement | 689 lignes / 672 IDs | 618 thèmes, 38 doublons, 33 niveaux ; avant et placements actuels exacts. |
| Destinations de thème | 425 nommées / 193 null | Toutes les destinations nommées existent au même niveau ; les 183 titres explicitement cités concordent. |
| Conventions | 30 lignes / 30 IDs | Avant et stage exacts ; valeurs locales toujours inchangées après génération. |
| Gloses incertaines | 95 lignes | Identités, études, niveaux et avant exacts ; aucune de ces propositions n’est appliquée. |

Les 193 destinations à contextualiser portent bien `proposed: null`, avec le
texte du lecteur conservé dans `readerProposal`. Un thème existant ne prouve
pas, à lui seul, que le classement proposé convient à l’apprentissage.

Les 38 lignes de doublon fournissent **38 comparaisons résolues / 36 paires
non orientées** : trois études identiques, 25 identiques après normalisation de
casse et de ponctuation, et dix différentes. Aucun chemin cité ne manque.
Les dix dernières concernent notamment OK/okay, une contraction, this/it,
a/the et le futur rapprochement de l’idiome 2594 après sa correction de contenu.
Ces rapprochements ne sont pas automatiquement des doublons à supprimer :
registre, contexte, rôle et sens restent à examiner. La comparaison de 2594
est annoncée par le lecteur comme dépendant du bloc de contenu, pas comme une
identité de ses études avant correction.

Les trente conventions se répartissent en six accents discutables, treize autres
aides à confirmer, sept rendus de one/w, deux choix de variété et deux lignes
classées sous la voyelle devant n. Ces intitulés sont les groupes du fichier,
pas une réanalyse phonétique de tous leurs éléments. Elles portent toutes
`stage: snapshot-d56fe23` et comprennent 29 jugements incertains et un certain.
Ce dernier qualificatif ne vaut pas décision d’ensemble. Aucune des trente
conventions n’est appliquée ; elles ne chevauchent aucun ID du raccord phonétique
ni des corrections de contenu retenues.

## Structure et accès conservés

La comparaison locale après génération couvre les **70 cellules et sept
répertoires** : identifiants, provenance originale, placements, niveaux,
types, séquences, ordre et rôles restent identiques à `d56fe23`. Pour cette
comparaison structurelle, les autres champs de phrase et leurs annotations
sont abstraits. Le contrôle des après exacts, des annotations et de tous les
champs corrigés appartient au vérificateur indépendant et aux essais de raccord,
pas à cette abstraction.

Les **36 fichiers HTML/CSS/JS directement sous `melunga_deploy`** et les **sept
snapshots L1 de conversation présents localement** restent identiques octet pour
octet. Ce périmètre local n’est pas celui des 110 sources conversationnelles du
dossier global. L’application classique conserve son empreinte
`61853d499f60790a68630e6984ba652ceaa320fe3c8fcd85fed8f116e7d504cd`.
Sa frontière d’accès gratuit reste `FREE_LV=[1]`, avec `isFreeCard` qui consulte
le niveau original du catalogue. Aucun niveau de catalogue ni prix contenu dans
cette application n’est changé.

## Reproduction et limites

[Résultat JSON](couverture.json). Le script lit les fichiers sans les modifier,
n’importe aucun générateur et écrit son résultat sur la sortie standard :

```sh
python3 -B docs/niveaux-progressifs/reponse-revue-integrale-lot7/verifier_couverture.py
```

Les avant documentaires restent reproductibles depuis les commits épinglés,
même après régénération. Les contrôles locaux portent sur les fichiers présents
lors de l’exécution. Ils ne remplacent ni l’écoute ni la relecture native et
n’approuvent aucune fusion dans `main` ni publication sur melunga.com.
