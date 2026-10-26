# Contrelecture séparée du contenu italien — lot 9

Source Claude `5d450cc`, avant `40d4c0b`. Les **34 gloses et trois blocs
complets** ont été relus individuellement. Aucun remplacement matériellement
faux n’a été trouvé. Les après sont retenus comme événements bornés, sans
étendre leurs motifs à toutes les occurrences du couple.

Le contrôle indépendant lit les **77 JSON du snapshot Git**, sans importer
le générateur. Il retrouve **37 identifiants et 37 objets**, dont **35 cartes
canoniques et deux modèles reçus**. Aucun de ces objets n’a de copie de
transport. Les avant, études et niveaux sont exacts. Les deux cartes
`catalogue:it:3092` et `catalogue:it:4091` restent en réserve.

Les 34 gloses changent uniquement le sens français. Les trois blocs changent
chacun l’étude, le sens et l’aide : **43 champs autorisés**, soit **37 sens,
trois études et trois aides entières**. Leurs autres propriétés restent
gardées, y compris les lectures éventuelles et les sources historiques.

| Carte | Étude après retenue | Champs modifiés |
|---|---|---|
| 2489 | Faccio seguito alla mia mail. | étude, sens, aide |
| 3879 | In caso di controversia, privilegiamo la via amichevole. | étude, sens, aide |
| 4098 | Un altro fornitore offre un prezzo più basso. | étude, sens, aide |

Ces blocs s’appliquent en entier. Leurs aides sont copiées comme phrases
entières, sans collage de segments. Aucun bloc n’a de garde de sens inchangée :
ses trois champs changent réellement.

## Un chaînage explicite dans le même lot

`catalogue:it:1736`, *Non l’ho ancora ricevuto.*, reçoit d’abord l’événement
phonétique N : `an-co-ra` devient `ann-co-ra`. Le registre de contenu rend
ensuite le pronom manquant : « Je ne l’ai pas encore reçu. » Cette seconde
opération conserve l’aide, son statut et sa déclaration phonétique nouvellement
ajoutés. C’est le seul chevauchement des registres A et B du lot 9 ; aucune
annotation de correction n’était présente dans le snapshot avant sur les
37 objets sélectionnés.

Les deux modèles reçus restent en compréhension seule : la question sur la
connexion rend désormais *mi* par « m’ » ; celle sur la taille rend *prende*
par « prenez ». La glose ne transforme pas leur rôle en phrase à produire.

## Portée des motifs

- *Il troppo stroppia* reçoit « L’excès nuit en tout », qui explicite le
  proverbe. « Trop, c’est trop » peut aussi convenir dans certains contextes ;
  ce n’est pas une équivalence universellement interdite.
- *Biglietto* peut désigner une carte de visite par ellipse dans un échange
  approprié. « Mon billet » est ici cohérent avec le thème déplacements de
  la carte 1603, sans prétendre que le mot ne peut jamais désigner une carte.
- *Siete aperti* porte un pluriel italien que « ouverts » rend explicite.
  Une question française adressée à un seul représentant d’un établissement
  peut ailleurs prendre un accord singulier de politesse.
- *Resti in linea* est compris ici comme l’impératif formel d’une demande
  téléphonique. La forme *resti* a d’autres analyses hors de cet emploi.
- *Torno da voi* peut avoir un usage métaphorique. La nouvelle formulation
  de 2489 explicite la relance professionnelle, sans interdire toute reprise
  métaphorique par *tornare*.
- *La via amichevole* est une formulation valable pour une voie amiable ;
  *soluzione amichevole* serait une variante, pas une correction imposée.
- *Offre un prezzo più basso* fournit une comparaison de prix complète dans
  la phrase du fournisseur.

Les autres gloses rétablissent notamment cinq mentions de l’italien, le
tutoiement, les pronoms de *dirtelo*, *parlarne* et *l’ho*, les compléments
de *ogni allenamento*, *da parte mia* et *le abitudini*, l’imminence de
*sto per*, le conditionnel *direi* et le futur de *ne vedremo*. Chaque candidat
a sa note individuelle dans le [détail avant/après](contenu.json).

## Écart de comptage dans le message source

Le JSON contient **130 éléments dans `items` : 34 certains et 96 incertains**.
Les trois blocs sont dans un tableau distinct `linkedBundles`. Le README et
le message source annoncent 93 incertains : le raccord en conserve et exclut
bien les **96** présents dans le fichier, sans en appliquer trois implicitement.
Les preuves source ne sont pas réécrites pour masquer cet écart.

Le contrôle est reproductible depuis les blobs Git épinglés :

```sh
python3 -B docs/niveaux-progressifs/reponse-revue-integrale-lot9/reproduire-contenu.py
python3 -B docs/niveaux-progressifs/reponse-revue-integrale-lot9/reproduire-contenu.py --runtime
```

La passe `--runtime` a été exécutée après génération : les **43 valeurs après
sont exactes dans les 37 objets**, les 37 déclarations correspondent au registre,
et tous les autres champs reviennent intégralement aux avant Git après projection
des seuls changements autorisés. Le chaînage de 1736 conserve notamment l’aide,
le statut phonétique et l’annotation de son événement A. Les deux modèles reçus
restent en compréhension seule et les deux cartes en réserve y restent.
Le résultat porte `runtimeChecked: true` dans `contenu.json`.

Cette contrelecture porte sur 37 candidats, pas sur une seconde lecture des
4 756 positions. Elle ne remplace ni une écoute ni une certification native.
Les 280 propositions, 30 conventions et 96 contenus incertains restent non
appliqués. Aucune présentation, niveau, prix ni droit n’est modifié.
