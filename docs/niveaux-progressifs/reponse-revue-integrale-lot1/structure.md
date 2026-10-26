# Revue intégrale de Claude : structure, périmètre et suites bornées

Référence examinée : `d4eaea3`, branche `origin/review/revue-integrale-claude`, basée sur `4ec163e`. Notre référence de travail est `345c709` ; entre `4ec163e` et `345c709`, seuls quatre documents ont changé, aucun fichier de niveaux. Audit du 25 octobre 2026, sans modification de contenu, de classement, d’interface, d’accès ou de prix. Aucune fusion ni publication.

**Les nombres de doublons se reproduisent. Deux conclusions structurelles doivent être corrigées : les 252 rubriques annoncées vides ou minces contiennent des révisions effectivement praticables ; les 281 hanzi du L1 chinois ne sont pas 281 signes à apprendre avant de parler avec l’aide phonétique et l’audio.** La revue trouve aussi de vrais cas à reprendre. Elle ne clôt pas la lecture individuelle des sept langues et dix niveaux.

Les [preuves JSON](structure-preuves.json) sont calculées directement depuis les objets Git figés, indépendamment du chargeur de Claude. Le [script de vérification](verifier_structure.py) peut être rejoué depuis n’importe quel répertoire :

```sh
python3 -BI /workspace/melunga-maquette-guidee-epuree/docs/niveaux-progressifs/reponse-revue-integrale-lot1/verifier_structure.py
```

## 1. Périmètre : occurrences, identifiants et lectures individuelles

| Mesure sur `d4eaea3` | Reproduit |
|---|---:|
| Occurrences lues dans `themes[].phrases[]` | 32 792 |
| Occurrences en réserve | 862 |
| Occurrences de modèles reçus | 252 |
| Occurrences chargées au total | **33 906** |
| Identifiants partagés entre plusieurs de ces occurrences | 32 |
| Identifiants distincts, après cette déduplication | **33 874** |
| Contenu visible + réserve, hors modèles reçus | **33 654** |

Les nombres 33 654 et 33 874 correspondent donc à deux périmètres. La conservation de 33 654 identifiants visibles/réservés ne signifie pas la lecture linguistique de 33 874 contenus, ni le contrôle de toutes leurs copies de transport. Le chargeur omet volontairement les `repertoires[].phrases[]` du total ; il inclut leurs modèles reçus séparément.

`lecture-carte-par-carte.md` déclare une lecture complète de **fr→zh L1, 307 cartes** : une cellule sur 70. Le document donne des exemples et des conclusions, pas un registre de 307 verdicts par identifiant. Les autres 69 cellules ont été comptées et soumises à certains contrôles ; leur lecture individuelle complète n’est pas livrée. Les termes « vérifié » et « couvert » doivent continuer à nommer le contrôle effectué, sans devenir « linguistiquement validé ».

## 2. Doublons : les quatre nombres sont exacts, leur unité compte

Reproduction de `doublons.py`, vérifiée contre les données réelles et les identifiants de `doublons-et-gloses.json` :

| Couple | Groupes de formes répétées | Groupes de gloses françaises partagées |
|---|---:|---:|
| fr→en | 24 | 42 |
| fr→es | 5 | 42 |
| fr→it | 54 | 4 |
| fr→zh | 7 | 52 |
| fr→ja | 109 | 17 |
| fr→ko | 95 | 16 |
| zh→fr | 32 | 18 |
| Total | **326** | **191** |

Les **326 sont des groupes**, définis par couple, niveau et forme étudiée normalisée : suppression des espaces, de la casse et de certaines ponctuations aux extrémités. Ils réunissent **673 occurrences**, soit **347 occurrences au-delà de la première**. Seuls **202 groupes** ont une chaîne `study` strictement identique ; les 124 autres sont rapprochés par la normalisation. Ce rapprochement est utile pour trouver des répétitions, sans prouver que toutes les occurrences sont interchangeables.

Parmi ces groupes :

- **31** ont plusieurs chaînes d’aide différentes après retrait des espaces extérieurs. Ce sont 31 divergences écrites à examiner, pas automatiquement 31 prononciations fausses. Par exemple, `I'd like to open an account.` ne diffère ici que par la casse de `AÏD/aïd` ; `我觉得可以` varie dans le découpage espaces/tirets ; `Mon père.` porte les mêmes caractères d’aide avec ou sans espace. Les écarts substantiels, comme `OUICH/WICH`, méritent une décision fondée sur la phrase entière et la convention retenue.
- **61** sont répartis entre plusieurs thèmes. Cela établit plusieurs emplacements possibles dans le répertoire ; cela ne prouve pas que le même contenu est imposé deux fois dans un parcours obligatoire. Une reprise contextuelle peut être voulue. Il faut différencier la première introduction d’un réemploi déclaré.
- Les **191 gloses** sont elles aussi des groupes après normalisation : accents, ponctuation et nombres sont notamment effacés par le filtre français. La mesure peut réunir une question et une réponse ou des variations de nombre. Elle appelle un examen de sens et de contexte.
- Pour **zh→fr**, le script inverse les champs : ses 18 groupes réunissent plusieurs traductions chinoises d’une même forme française étudiée. Ils n’ont donc pas la même direction que les 173 groupes des six autres couples, où plusieurs formes étudiées partagent une glose française.

Les exemples chinois sur « faux », « d’accord », « pas besoin » ou « je ne comprends pas » justifient de préciser les usages et les répliques attendues. Ils ne justifient pas d’effacer toutes les variantes synonymes. Même limite pour la proposition de corriger les 31 aides « directement et sans risque » : le groupe détecte une divergence, sans choisir à lui seul l’aide complète de référence.

**Suite bornée proposée :** prendre les 31 groupes comme un premier lot de cohérence, avec les identifiants et aides complètes conservés dans les preuves ; séparer format, contexte et différence phonétique ; documenter une décision par groupe. Ne supprimer aucun identifiant ni recomposer une aide depuis des morceaux. Les 61 emplacements multiples et les 191 gloses restent un second lot de sens, qui peut conserver des variantes utiles.

## 3. Thèmes : un vrai déséquilibre descriptif, un crible et des cas précis

### Dénominateur du domaine « conversation »

Le domaine `conversation`, agrégé sur les **70 cellules**, porte **10 421 introductions** :

- **10 421 / 23 847 phrases de situations = 43,6994 %** ;
- **10 421 / 32 792 cartes visibles = 31,7791 %**.

Le 43,7 % est correct pour les situations, pas pour tout le contenu visible. Il s’agit d’un domaine partagé entre les niveaux et langues, pas d’une unique rubrique de 10 421 cartes affichée à l’apprenant. Sa taille suggère un domaine de repli trop large ; elle ne démontre pas à elle seule une surcharge ressentie ni une mauvaise affectation de chaque carte.

### Concordance section/type et qualité sémantique

Le contrôle reproduit bien : 23 847 entrées `situations/utterance`, 8 716 `vocabulary/vocabulary`, 229 `vocabulary/number`, aucune autre combinaison visible. **Cela vérifie la concordance de deux étiquettes déjà attribuées.** Une expression mal reconnue comme phrase peut recevoir les deux étiquettes erronées tout en passant ce contrôle. Il ne valide donc ni le thème réel, ni le statut linguistique de chaque carte.

Le détecteur lexical est correctement présenté par Claude comme un crible. Mais le README est resté à **1 216 candidates**, alors que `candidates-themes.json` contient **1 444**, avec `total: 1444`. Les scripts exacts `charge.py` puis `themes.py`, rejoués dans un répertoire temporaire, reproduisent **1 444 identifiants, tous identiques à l’artefact livré**. C’est un écart documentaire à corriger, pas une divergence entre détecteur et artefact.

Le modèle score dix domaines suffisamment fournis. Les 28 autres domaines de situations, représentant 1 459 introductions, ne passent pas ce crible de la même manière. Le contrôle section/type les inclut, la comparaison lexicale entre domaines calibrés ne les valide pas. Enfin, « 7 sur 26 » décrit l’échantillon lu ; il ne permet pas de déduire le nombre réel d’erreurs parmi les 1 444 candidates.

### Les sept exemples existent ; ils ne sont pas sept déplacements déjà tranchés

| Identifiant | Carte et emplacement réel | Action bornée à instruire |
|---|---|---|
| `catalogue:es:1496` | `Gire en la esquina.` — L5 conversation | Reprendre le placement de cette indication de direction ; comparer aux situations réelles de déplacement du niveau. |
| `catalogue:es:1246` | `Está en el centro.` — L4 conversation | Reprendre la localisation spatiale et son contexte. La destination nue `reperes` ne suffit pas : **L4-reperes s’intitule « Relier les étapes d’un récit »**, pas « se localiser ». |
| `catalogue:en:2945` | Question FOB/CIF — L10 conversation | Examiner la destination professionnelle existante, **L10-travail « Conduire un échange professionnel »**, avec la préparation de ce vocabulaire spécialisé. |
| `catalogue:zh:969` | Question sur la personnalisation de l’angle du faisceau — L5 conversation | Revoir ce contenu technique dans le domaine professionnel facultatif, avec l’objectif réel de L5-travail « Coordonner une tâche ». |
| `catalogue:it:4311` | `Pioveva molto.` — L9 repères | La phrase météo ne remplit pas à elle seule L9-reperes « Structurer une argumentation ». Examiner son contexte narratif et une destination existante ; `decrire` ou « nature » ne désignent pas encore une leçon adéquate du L9. |
| `catalogue:it:427` | `Ecco la sua carta.` — L3 conversation | Préciser ce que désigne *carta* dans la scène, puis seulement arbitrer thème et glose. |
| `catalogue:es:1603` | `Aquí tiene mi tarjeta.` — L5 conversation | Contextualiser la remise de la carte et son sens avant de classer. |

Les cinq premiers sont des cas de placement à examiner ; les deux derniers sont d’abord des ambiguïtés de glose/contexte. La lecture de Claude apporte donc des pistes concrètes, mais la formulation « sept erreurs de thème confirmées » confond ces catégories.

Pour ce petit lot : garder les identifiants, les phrases, les aides complètes et les droits ; expliciter le contexte, la destination exacte et l’objectif de niveau ; vérifier que la séquence prépare les répliques nécessaires. Tout changement de niveau ou de glose doit être montré séparément. Ne pas redistribuer 10 421 cartes sur une règle de mots-clés. Les exemples « Au train où vont les choses » et « Ça ne mange pas de pain » montrent pourquoi ce serait erroné.

## 4. Les 252 rubriques ne sont pas vides à l’exécution

Les **66 zéros** et **186 valeurs de 1–2** se reproduisent sur `totalPhrases`, équivalent ici au nombre de premières introductions placées dans `phrases[]`. Ils omettent les références de révision et les réemplois du répertoire.

Sur les **1 636 rubriques**, les champs `presentedCount` et `pedagogicalConceptCount` sont tous **au moins égaux à 6**. Les références de révision/contexte des données se résolvent ; aucune des séquences comptées n’est vide. Exemple vérifiable :

```text
fr-en / L5 / L5-vocab-couleurs
totalPhrases = 0
reviewReferences = 17
presentedCount = 17
sequences = 4
```

Cette rubrique exerce bien des couleurs déjà introduites. « Aucune carte nouvelle » ne signifie ni « aucune carte affichable » ni « enrichissement manquant ». Les sous-totaux 55 couleurs, 36 adjectifs, 22 loisirs, 18 personnes et 17 repères correspondent eux aussi à 0–2 nouveautés, pas à 0–2 contenus praticables.

Cela ne prouve pas que répéter exactement ce travail sur dix niveaux soit un bon choix pédagogique. Il reste légitime d’examiner son utilité, sa fréquence et son intégration à une situation plus riche. Mais supprimer ou remplir artificiellement 252 rubriques sur le seul compteur de nouveautés corrigerait un défaut qui n’a pas été démontré. `source-repertoire-ready` décrit une disponibilité structurelle avec le répertoire ; il ne certifie ni la maîtrise ni le naturel linguistique.

## 5. L1 chinois : diversité graphique mesurée, prérequis d’oral non mesurés

Le chiffre **307 cartes contenant 281 hanzi distincts** se reproduit exactement. Toutes les 307 portent **`phon` et `reading`**. Le lecteur actuel affiche l’aide phonétique ou le Pinyin, permet l’écoute par l’oreille et révèle explicitement le modèle pendant le rappel (`maquette-guidee.js`, notamment `renderStep`). Aucun exercice de reconnaissance de 281 caractères n’est imposé avant cette pratique orale.

Le nombre décrit le répertoire graphique rencontré si l’on parcourt tout le L1. Il ne décrit ni ce que l’apprenant doit mémoriser avant sa première phrase, ni sa difficulté effective lorsqu’il se sert de l’aide écrite et de l’audio. À titre de périmètre : les 145 phrases de situations du L1 contiennent 178 hanzi distincts ; la première séquence de cinq cartes en contient 14. Ces nombres restent des descriptions, pas des seuils de maîtrise.

La comparaison du tableau de Claude mélange des unités : caractères chinois, kanji et kana japonais, jamo coréens obtenus par décomposition Unicode, et alphabet latin déclaré connu. Elle ne permet pas de conclure que le chinois présente « de loin la plus forte charge » : le japonais compte même 247 kanji + 100 kana dans cette mesure. « Aucune règle » pour les hanzi et « appris en un jour » pour l’alphabet coréen ne résultent d’aucun de ces calculs. Pour un lecteur sinophone apprenant le français, zéro caractère non latin n’établit pas davantage que l’alphabet ou ses règles sont déjà acquis.

Il faut évaluer le L1 chinois sur le geste oral demandé : phrase entière située, sens accessible, écoute et imitation, seule variation préparée, puis réponse utile. L’ambiguïté des gloses, l’alternance d’aides pour une même forme et une variation grammaticale non préparée sont des questions directement pertinentes. Elles ne se résolvent pas en exigeant préalablement la lecture des caractères, ni en choisissant les phrases uniquement selon leur longueur.

Enfin, le README introduit ses exemples par « ce L1 contient des proverbes classiques », mais `catalogue:zh:843` (*不打无准备之仗*) est cité et placé **L4**, et *行远自迩* est cité **L10**. Ces exemples appellent une revue de leur niveau et de leur usage ; ils n’établissent pas qu’un proverbe est présent dans le L1. Aucune fermeture pédagogique générale du L1 n’est déduite ici, dans un sens ou dans l’autre.

## 6. Suite de la revue carte par carte

Le mandat porte toujours sur **sept langues × dix niveaux**, pas sur la seule remise en cohérence des exemples remontés. La suite doit produire un registre vérifiable par identifiant et par cellule : forme complète, sens/contextualisation, aide entière et convention, lecture, classement situation/mot/nombre, thème exact, opération attendue au niveau, préparation de la variation, statut de lecture et décision motivée. Les modèles reçus et les réserves doivent figurer dans leur périmètre propre ; une copie de transport ne devient pas une nouvelle carte lue.

Ordre de lots proposé, sans remplacer le mandat intégral :

1. Corriger le compte documentaire 1 216/1 444 et les interprétations « rubriques vides » / « 281 prérequis de lecture ». Consigner explicitement la cellule fr→zh L1 déclarée lue et les 69 autres à lire individuellement.
2. Instruire les 31 groupes d’aides divergentes et les sept exemples de sens/thème ci-dessus, avec les décisions et les formes complètes conservées ; aucune déduction automatique depuis le détecteur.
3. Fermer les sept L1 par lecture individuelle documentée et essai de leurs séquences, puis poursuivre L2 à L10 par langue et niveau avec un inventaire restant ouvert. Aucune propriété mécanique ne remplace un verdict de formulation ou de progression.
4. Pour chaque lot, distinguer les défauts corrigés, les choix de convention à décider et les cas demandant un avis natif. Publier la couverture réellement lue, les identifiants restant en attente et les limites des tests, sans déclarer une langue entière validée à partir d’un échantillon.

Ce document vérifie des mesures et borne les suites. Il n’approuve pas en bloc les corrections phonétiques de Claude, ne valide pas linguistiquement les 70 cellules, et ne change aucun produit.
