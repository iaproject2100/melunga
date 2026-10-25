# Contrelecture séparée du contenu du lot 8

Source Claude `e12c600`, avant `224e459`. La lecture ciblée reprend les **18
gloses, deux études ponctuées et trois blocs complets**, soit 23 candidats.
Les valeurs après sont retenues comme événements bornés. Les 119 propositions
incertaines ne sont pas appliquées.

Le contrôle indépendant lit les **77 JSON du snapshot Git**, sans importer le
générateur. Il retrouve **23 identifiants, 23 canoniques et une copie de
transport**, soit **24 objets**. La copie correspond au soutien lexical
`situation-support-conversation:fr-es:piste-douleur-simple-support-02`, où
*el estómago* devient « l’estomac ». Aucun modèle reçu n’est concerné par ce
registre de contenu. Tous les avant, études et niveaux sont exacts ; il n’y
a ni annotation de correction antérieure sur ces objets, ni chevauchement
avec les 63 aides du registre phonétique.

Le registre autorise **27 champs**, répartis en 19 sens, cinq études et trois
aides. La copie lexicale porte un sens supplémentaire : **28 champs dans les
fichiers d’exécution**, soit 20 sens, cinq études et trois aides.

## Ponctuation seule et blocs complets

| Carte | Après retenu | Champs modifiés |
|---|---|---|
| 661 | ¡Qué día tan largo! | étude seule |
| 875 | ¡Qué bochorno hace! | étude seule |
| 1340 | ¿Me lo pone para llevar? | étude, sens, aide |
| 2727 | ¿Cuánto tarda en llegar a España? | étude, aide |
| 3186 | Necesito ver un vídeo de la línea. | étude, aide |

Les deux exclamations changent uniquement l’orthographe. Leur aide entière,
sens français, statut phonétique, source et autres propriétés doivent rester
inchangés. Cette correction ne produit pas une nouvelle aide. Les trois blocs
s’appliquent en entier ; les **sens natifs de 2727 et 3186 sont des gardes
inchangées**. Les lectures et les sources historiques restent conservées.
Les aides de remplacement sont copiées comme phrases entières, sans collage
automatique de segments.

Les 18 gloses rétablissent notamment le nom *el estómago*, le sujet et la portée
de *cada entrenamiento*, le verbe d’aller aux urgences, les personnes de
*puedo*, *tú* et *recojo*, le sens de *apuntarse*, la présence de *cerca*, les
degrés retenus pour *muy* et le sens de *cubrir*. « Ne fais pas trop confiance »
remplace le français fautif « ne fais pas si confiance ».

## Portée des motifs

- *No hay que* peut exprimer une absence de nécessité ou une recommandation,
  voire une interdiction, selon le contexte. « Pas besoin de décider aujourd’hui »
  est la lecture choisie ici ; l’autre sens n’est pas déclaré universellement faux.
- *Flipas* porte une morphologie présente, mais « tu vas halluciner » peut être
  une paraphrase pragmatique naturelle en français oral. « Tu délires » est un
  sens défendable retenu pour cette carte, sans règle interdisant toute paraphrase
  française au futur ni prétention à un sens unique hors contexte.
- *Muy* reçoit « très » dans les deux cartes retenues. Un contexte peut faire
  comprendre un degré excessif ailleurs ; cela ne transforme pas toute traduction
  par « trop » en faute grammaticale.
- Le français « on » peut rendre une question personnelle dans certains emplois.
  Les après retenus explicitent ici la première personne, sans déclarer toute
  formulation impersonnelle impossible. Les nouveaux pronoms évitent aussi
  d’imposer « voiture » là où l’espagnol ne donne que *lo*.
- *Poner* ne se limite pas aux vêtements. La forme *me lo pone* est choisie pour
  la demande d’un client au serveur, cohérente avec l’emport d’un plat.
- *Vídeo* peut désigner de la matière vidéo dans un autre emploi. Le déterminant
  ajouté correspond ici à l’exemplaire attendu et à la glose déjà présente
  « une vidéo ».

[Détail complet avant/après et objets sources](contenu.json). Le script peut
reproduire les comparaisons contre les blobs Git épinglés puis vérifier les
après, annotations et autres champs après génération :

```sh
python3 -B docs/niveaux-progressifs/reponse-revue-integrale-lot8/reproduire-contenu.py
python3 -B docs/niveaux-progressifs/reponse-revue-integrale-lot8/reproduire-contenu.py --runtime
```

La passe `--runtime` a été exécutée après génération : les **28 valeurs après
sont exactes dans les 24 objets**, la copie lexicale et les 24 annotations
correspondent à l’édition du registre, et tous les autres champs reviennent
intégralement aux avant Git après retrait des seuls changements autorisés.
Les aides et statuts des deux exclamations ainsi que les sens gardés de 2727
et 3186 sont inchangés. Cette contrelecture porte sur 23 candidats et non une
seconde lecture humaine des 4 995 positions. Elle ne remplace ni une écoute
ni une certification native. Les 310 propositions de classement, 151
conventions — notamment les 112 jota — et 119 contenus incertains restent
non appliqués. Aucune présentation, niveau, prix ni droit n’est modifié.
