# Lot 5 — couverture, propositions et errata contrôlés

Référence des avant : `f22202c`. Livré par Claude à `62daa86` ; suivi documentaire
du lot 4 à `8bd6297`. Ce contrôle vérifie les valeurs et la traçabilité. Il ne
prétend pas reproduire la relecture linguistique des 4 763 positions ni certifier
leur prononciation native ou leur progression pédagogique.

## Couverture exacte

**4 727 cartes canoniques**, réserves comprises, et **36 modèles reçus** donnent
**4 763 positions / 4 757 identifiants distincts**. Les six IDs présents dans
les deux rôles sont 193, 246, 388, 578, 664 et 1957. Leurs statuts concordent :
les cinq premiers sont vérifiés, le dernier est incertain dans les deux rôles.
Aucune position attendue ne manque et aucune position supplémentaire n’est
introduite. Chaque position est rattachée au bon rôle et au bon niveau.

Les compteurs se reproduisent exactement : 4 033 vérifiés, 579 propositions,
121 incertains, 26 gloses à corriger et quatre corrigés. Aucun statut vérifié
ne masque un suivi présent dans les registres. Un statut principal n’est pas
une liste exclusive de tâches ; une même carte peut avoir plusieurs suivis.
L’avancement annoncé par Claude est **30 cellules sur 70**, pas une validation
native globale de ces cellules ni une application automatique de leurs propositions.

## Aides et lectures liées

Les quatre aides et quatre lectures concernent **quatre identifiants**,
avec une copie de transport pour `4320`, soit **cinq objets / dix champs**.
Les avant complets étude/sens/aide/lecture, leurs chemins et positions, les
provenances et la copie de `4320` concordent avec le snapshot. Aucune de ces
quatre cartes ne porte une correction des lots antérieurs.

`3630`, `2400` et `4320` sont actifs. **`3771` reste en réserve** : la correction
de sa particule et de sa lecture ne crée pas une phrase remplie ni une étape
de production. Les deux registres citent les mêmes quatre sources et positions ;
les quatre statuts principaux corrigés correspondent exactement à leur union.
Les valeurs retenues sont relues séparément dans le dossier d’alignement/contenu.

## Dossiers de contenu et de classement distincts

| Dossier | Compte exact | Vérification structurelle |
|---|---:|---|
| Gloses/contenu | 173 lignes / 172 IDs | 26 certaines natives et 147 propositions incertaines ; les 26 avant certains sont exacts. |
| Classement | 604 propositions / 582 IDs | 463 thèmes, 100 doublons et 41 niveaux ; études, sens, niveaux et thèmes actuels concordent. |
| Convention | Une ligne / un ID | `3890` クッション, stage explicite `snapshot-f22202c`, avant exact. |

Les **306 destinations de thème nommées** existent au même niveau ; 101 citent
aussi un titre, comparé exactement au titre réel. Les **157 destinations à
contextualiser** sont null. Les propositions de niveau ou de doublon n’affirment
pas à tort une destination de thème. L’existence d’un thème n’établit ni le bon
acte de parole ni la progressivité de la carte.

Les 100 propositions de doublon fournissent 104 comparaisons résolues :
94 études identiques, neuf variantes de ponctuation normalisée et un cas déclaré
kanji/kana (`分かりません。` / `わかりません。`, carte 3031 face à la variante de
conversation L1). Ce contrôle de formes ne justifie aucune suppression : les
sens, usages et rôles doivent rester distingués. Aucune carte n’est supprimée
ou déplacée par cette vérification.

Les cinq cartes `1956`, `2352`, `2395`, `2615` et `2647` contiennent 日本語 et
une glose parlant français ; elles sont toutes dans les 26 corrections certaines.
Une recherche bornée à « 日本語 + français, sans フランス語 » ne trouve pas d’autre
candidat dans le couple. Cette recherche ne prouve pas l’absence de toute autre
erreur de traduction en japonais.

**Un avant est à rectifier dans une proposition non appliquée : `833`.** Son
champ déclaré est `study`, mais son before vaut la lecture
`wa-ta-shi-ni ni-a-i-ma-su`. L’étude réelle est `私に似合います。`. Le texte étudié
et le niveau de cette ligne sont corrects ; seul ce before n’est pas celui du
champ annoncé. Cette anomalie est consignée, sans bloquer le raccord des quatre
paires ni les 26 gloses certaines, qui n’utilisent pas cette proposition.

`1566` porte deux propositions incertaines, l’une sur la glose, l’autre sur la
cible : c’est ce qui explique 173 lignes pour 172 IDs. Les propositions incertaines
ne sont pas confondues avec les 26 corrections natives retenues.

## Errata du lot 4 vérifiés

Les errata de `604`, `2158` et `2463` conservent les après phonétiques déjà
livrés et servent uniquement à corriger leur motif. Les anciens motifs cités
concordent avec le registre d’origine, et les trois après concordent avec les
valeurs exécutées à `f22202c`. Le fichier `registre-phonetique.json` du lot 4
est **identique octet pour octet** entre `7631c0f` et `8bd6297` ; son empreinte
reste `15237777a65b287a4008d53167b458dde2e486af27deafb31698e91c99ff5167`.

Le champ stage est présent dans **les 81 conventions** : **76** désignent le
snapshot `606592c`, **cinq** l’après du registre phonétique. Les cinq IDs sont
971, 1451, 2426, 2439 et 2581. Pour chacun, le before égale bien l’après de son
événement figé ; pour les 76 autres, il égale le champ du snapshot annoncé.
Après retrait du seul champ stage, le fichier est exactement celui du lot 4
initial : aucun avant, après proposé, motif, alignement ou classement n’est
réécrit par cet amendement. Aucun de ces arbitrages de convention n’est appliqué.

## Reproduction et limites

[Preuves JSON](couverture-errata-preuves.json). Le script ne charge aucun
générateur et n’écrit aucun fichier de produit ou de preuve :

```sh
python3 -B docs/niveaux-progressifs/reponse-revue-integrale-lot5/verifier_couverture.py
```

La vérification se fonde sur des objets Git épinglés et reste donc indépendante
d’une régénération ultérieure du runtime. Elle ne remplace ni l’écoute ni le
contrôle natif. La présentation, le catalogue classique, les prix et les accès
n’ont pas été modifiés par ce contrôle. Aucune fusion ni publication n’est approuvée.
