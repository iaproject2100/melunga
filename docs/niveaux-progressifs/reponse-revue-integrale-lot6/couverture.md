# Lot 6 — couverture, propositions et correctif japonais contrôlés

Référence des avant : `161d0ebef38bb38ea9e26a836ca701b9d136f6d2`. Lot de Claude :
`87357b16c7d77a1c94fdbd940dcb3f232758748d`. Le contrôle lit les objets Git épinglés,
sans importer le générateur. Il vérifie la couverture et les références ; il ne
reproduit pas une relecture native de toutes les cartes.

## Couverture exacte

**4 734 cartes canoniques**, réserves comprises, et **36 modèles reçus** donnent
**4 770 positions / 4 766 identifiants distincts**. Les quatre IDs présents dans
les deux rôles sont `catalogue:ko:136`, `527`, `646` et `1053`. Leurs statuts
concordent : `646` est proposé dans les deux rôles ; les trois autres sont
vérifiés dans les deux rôles. Chaque position attendue possède exactement une
entrée au bon rôle et au bon niveau. Aucune position ne manque et aucune n'est
ajoutée.

Les compteurs se reproduisent : **3 916 vérifiés, 18 corrigés, 424 propositions,
365 incertains et 47 gloses à corriger**. Aucun statut vérifié ne masque un suivi
présent dans les registres livrés. Les 18 statuts corrigés correspondent aux
18 aides du registre ; les cinq lectures liées portent sur un sous-ensemble de
ces mêmes IDs. Les 47 statuts de contenu correspondent aux 45 gloses certaines
et aux deux blocs indivisibles. Un statut principal n'exclut pas d'autres suivis
pour la même carte.

La couverture individuelle annoncée par Claude est **40 cellules sur 70** ;
**30 cellules restent à lire**. Cela ne vaut ni application de toutes les
propositions ni certification native globale.

## Propositions laissées distinctes du raccord

| Dossier | Compte vérifié | Résultat du contrôle |
|---|---:|---|
| Classement | 447 lignes / 432 IDs | 327 thèmes, 89 doublons, 31 niveaux ; études, sens, niveau et thème actuels exacts. |
| Destinations de thème | 239 nommées, 88 à contextualiser | Les 239 existent au même niveau ; les 88 portent une destination null. |
| Conventions | 260 lignes / 259 IDs | Avant, étude, niveau et stage exacts ; aucune normalisation globale. |
| Contenu | 193 gloses | 45 certaines, 148 incertaines ; avant et champs annoncés exacts. Deux blocs de trois champs sont séparés. |

Les neuf titres explicitement joints à une destination concordent avec les titres
réels. L'existence d'une destination ne prouve pas qu'elle constitue le bon
classement. Les 89 propositions de doublon fournissent 89 comparaisons résolues :
66 études identiques et 23 variantes de ponctuation normalisée. Aucun chemin
comparé ne manque. Ce contrôle de formes ne justifie aucune suppression : les
sens, emplois et rôles doivent rester distingués.

Les conventions se répartissent en **115 batchim, 53 nasalisation/assimilation,
66 consonnes ㅈ/ㅉ/ㅊ, 13 aspiration, 10 autres et 3 의/희**. Les deux derniers
groupes expliquent les « 13 autres » du message de Claude. Les 260 lignes portent
`stage: snapshot-161d0eb`. Elles comprennent 32 jugements « certain » et 228
« incertain » ; ces étiquettes de lecteur ne valent pas décision d'ensemble.
Le modèle reçu `heard-authored:fr-ko:piste-trouver-gare-received-01` apparaît deux
fois, pour deux segments distincts à arbitrer : 쭉 puis 가실 거예요. Ce sont deux
propositions séparées fondées sur le même avant, pas deux versions à appliquer
successivement. Aucune des 260 lignes n'est appliquée par ce contrôle.

**Rectification du résumé de Claude : cinq 한국어**, et non six, figurent dans les
45 gloses certaines avec « français » dans l'avant : `1472`, `1679`, `1847`,
`1900`, `1902`. Le nombre total de 45 est exact ; seul le sous-total du message
était erroné. Cette recherche ciblée ne prouve pas l'absence de toute autre erreur
de traduction dans le corpus.

## Correctif japonais `45cebbd`

Le fichier source du lot 5 ne change que la proposition incertaine
`catalogue:ja:833`, dans son `before` et l'explication de celui-ci. Le champ
annoncé est `study` : l'avant erroné `wa-ta-shi-ni ni-a-i-ma-su` était la lecture ;
l'avant rectifié est bien **`私に似合います。`**, identique à l'étude de la carte
au snapshot `161d0eb`. Le texte proposé `私に似合いますか？`, l'incertitude, le
niveau et les autres champs de la proposition restent identiques.

Il n'y a donc **aucune nouvelle correction produit à appliquer** : l'étude réelle
n'avait pas été modifiée dans le lot 5 et la proposition interrogative reste non
appliquée. Le correctif répare une preuve documentaire ; il ne valide pas cette
interrogation ni n'impose de modifier la phonétique.

## Architecture et accès conservés

Une comparaison locale séparée avec `161d0eb` porte sur les **70 fichiers de
niveau et les sept répertoires** : identifiants, positions, ordre, séquences,
provenances et rôles restent identiques après abstraction des seuls champs de
phrase et annotations de correction. Le contrôle des valeurs corrigées relève
du vérificateur indépendant et des essais de raccord, pas de cette abstraction.

Les **36 fichiers HTML/CSS/JS directement sous `melunga_deploy`** et les **sept
snapshots L1 de conversation présents localement** sont identiques octet pour
octet au snapshot. Ce périmètre local ne doit pas être confondu avec les 110
sources conversationnelles du dossier global. L'application classique conserve
son empreinte `61853d499f60790a68630e6984ba652ceaa320fe3c8fcd85fed8f116e7d504cd`.
Sa définition d'accès gratuit reste `FREE_LV=[1]` et `isFreeCard` consulte le
niveau original du catalogue. Les prix et droits contenus dans cette application
restent donc identiques. Aucun déplacement de niveau de catalogue n'est appliqué.

## Reproduction et limites

[Preuves JSON](couverture.json). Le script écrit uniquement son résultat sur la
sortie standard, ne charge aucun générateur et ne modifie aucun produit :

```sh
python3 -B docs/niveaux-progressifs/reponse-revue-integrale-lot6/verifier_couverture.py
```

Les avant documentaires restent reproductibles depuis les objets Git épinglés,
même après régénération. Les comparaisons de structure et d'interface portent
sur les fichiers locaux au moment de l'exécution. Cette vérification ne remplace
ni l'écoute ni le contrôle natif ; elle n'approuve aucune fusion dans `main`
ni publication sur melunga.com.
