# Contrelecture phonétique ciblée du lot 9 et erratum EN71

Avant : `40d4c0b264b364fe31d4fd1bc9acae03dc130e01`.
Preuve italienne : `5d450cc79f32d180f9331c5d06387fe36e8d94a6`.
Erratum espagnol : `76602a1b0be0a3539171090733d0a17b079644c6`.

Les **70 aides entières** ont été contre-lues dans leur phrase et leur sens.
Aucun faux certain ni nouvelle erreur matérielle n’a été repéré dans les
après retenus. Cette acceptation porte sur ces chaînes figées : elle ne
certifie pas toute la prononciation italienne et ne rédige aucune aide nouvelle.

| Famille | Aides | Portée |
|---|---:|---|
| N | 63 | nn/mm pour éviter une lecture nasale française dans les seuls événements retenus. |
| S | 3 | CE : ci + e ; ASTM : a + esse + ti + emme. |
| T | 3 | sciocchezze, commedie et la capitale de trovare. |
| A | 1 | rivedere accentué sur DE, dans un modèle reçu. |

Les doubles nn/mm servent ici de repère pour un lecteur francophone ; ils
n’annoncent pas de nouvelles géminées dans le mot italien. `ann-co-ra`,
`imm-por-`, `dimm-bar-co`, `nonn`, `linnk` et `chamm-po` restent des corrections
entières bornées. La chaîne retenue `djinnss` conserve une voyelle orale et un
s final audible pour jeans. Aucune règle n’est étendue aux autres emprunts.

Les trois autres corrections de lettres et de capitales sont cohérentes avec
les mots étudiés : le i de sciocchezze n’est pas prononcé devant o, commedie
n’a qu’un d, et trovare porte son accent sur VA. Le modèle reçu rivedere
porte son accent sur DE. Ce contrôle ne mesure pas leur restitution audio.

## Avant, copies et séparation du contenu

Le script lit les **77 JSON du snapshot Git**, sans importer le générateur.
Les 70 événements correspondent à **74 objets** : 69 canoniques, quatre copies
de transport (`2762`, `875`, `4256`, `4261`) et un modèle reçu. Chaque avant
entier, étude, sens, emplacement, déclaration de copie et absence de lecture
concorde avec la preuve : **0 écart**. Aucun événement italien n’annonce de
correction antérieure.

Un seul identifiant croise le lot de contenu : `catalogue:it:1736`. Son aide
reçoit le N figé ; sa glose reçoit séparément le pronom manquant dans « Je ne
l’ai pas encore reçu ». Les deux annotations restent distinctes. Les 34
gloses et trois blocs sont analysés dans [contenu.md](contenu.md), et non
comptés comme des événements du registre phonétique.

La reproduction avec `--runtime` construit une copie privée attendue des
77 documents depuis le snapshot et les seules valeurs des preuves. Elle
ajoute indépendamment les annotations attendues, les statuts, les 70 aides,
les 34 gloses, les trois blocs et l’erratum. Elle compare ensuite chaque arbre
entier au fichier exécuté. Les propriétés de source, les autres annotations,
les niveaux, les emplacements et toutes les autres cartes sont ainsi gardés.
Le fichier [alignements.json](alignements.json) indique si cette vérification
d’exécution a été effectuée ; `runtimeChecked` doit valoir `true` pour conclure
sur les après.

**Vérification exécutée après génération : 77 documents conformes, 0 écart.**
Les 74 objets du registre italien et l’objet EN71 ont leurs aides attendues ;
les quatre copies, le reçu et les annotations antérieures sont contrôlés.

## EN71 : une précision séparée et traçable

Claude a confirmé que l’épellation **séparée** E + N était visée. Le nouvel
événement sur `catalogue:es:2205` part donc de l’après réellement livré :

`KOUM-plé la NOR-ma é-né sé-TÉN-ta i OU-no`

et livre l’aide entière :

`KOUM-plé la NOR-ma é É-né sé-TÉN-ta i OU-no`.

La chaîne distingue les deux noms de lettre. L’ancien registre du lot 8 et
son annotation restent inchangés ; un erratum entier lui succède avec sa
preuve propre. L’avant initial `KOUM-plé la NOR-ma én` reste dans l’événement
historique. Il n’est ni remplacé ni présenté comme l’état qui précédait
immédiatement l’erratum. Cette clarification ne décide pas d’une convention
universelle d’épellation des sigles.

## Conventions et aides s laissées en attente

Les **30 lignes / 30 IDs** de conventions ont leurs avant exacts au stade
`snapshot-40d4c0b`. Elles portent toutes sur phon et sont toutes étiquetées
incertaines. Aucun ID ne croise les événements appliqués du lot 9 ; leurs
objets entiers restent identiques dans la projection attendue.

Les groupes sont conservés comme libellés de la source, pas comme une
classification vérifiée. Par exemple, le groupe intitulé « voyelle nasale
(cas laissés : SIM, team, Wang) » contient deux lignes sur lentamente et
pluriball, et non ces trois emprunts. Le groupe gli contient aussi fan et
private label. Ce défaut d’étiquetage ne fait appliquer aucun événement.
SIM, team et Wang ne sont pas normalisés.

Les **33 aides s intervocaliques** laissées en attente ont été relues par
Claude : il n’annonce aucune erreur en italien standard. Elles ne deviennent
donc pas 33 corrections supplémentaires. Les s après préfixe, notamment dans
stasera, risentiamo et termosifone, ne justifient pas une substitution globale.
Cette contrelecture ciblée ne répète pas la lecture de ces 33 aides ni celle
des 4 756 positions annoncée par Claude.

## Reproduction et limites

```sh
python3 -B docs/niveaux-progressifs/reponse-revue-integrale-lot9/reproduire-alignements.py
python3 -B docs/niveaux-progressifs/reponse-revue-integrale-lot9/reproduire-alignements.py --runtime
```

Les sources et registres sont contrôlés par leurs empreintes. Les aides
restent entières et figées. Ni voix native, ni son réel, ni téléphone, ni
navigateur hébergé ne sont évalués ici. Les conventions et les propositions
de niveaux ou de thèmes ne sont pas réputées résolues par une comparaison
de fichiers. Aucune fusion dans main ni publication sur melunga.com n’est
approuvée.
