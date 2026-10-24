# Typage candidat — anglais, espagnol, italien

Ces trois fichiers séparent les énoncés, le vocabulaire, les nombres, les modèles incomplets et les réserves avant leur affichage par thème. Ce n’est pas une relecture linguistique exhaustive : les règles sont des hypothèses éditoriales à vérifier.

Aucune carte, phonétique, traduction, lecture, décision parmi les 518 placements ni niveau source n’est modifié. Chaque carte reste identifiée par son indice dans son DECKS. L’empreinte de chaque deck utilise JSON trié, sans échappement ASCII, et séparateurs compacts.

## Couverture

| Couple | Énoncés | Vocabulaire | Nombres seuls | Incomplets | À relire | Total |
|---|---:|---:|---:|---:|---:|---:|
| fr-en | 3066 | 1281 | 30 | 80 | 45 | 4502 |
| fr-es | 4101 | 380 | 28 | 17 | 146 | 4672 |
| fr-it | 3046 | 1282 | 32 | 96 | 53 | 4509 |

Chaque indice est affecté exactement une fois. Aucun libellé ancien cat=vocab ou pedagogicalStatus=fragment ne suffit à décider du type.

## Règles appliquées

1. Un emplacement ou des pointillés dans la forme étudiée donnent incomplete. Un nom contenant la lettre X ne devient pas un modèle à trous : voir l’exception X-ray ci-dessous.
2. Un nombre doit être reconnu à la fois dans la forme étudiée et son sens français. « où » n’est pas un nombre après désaccentuation ; « une seconde » dans une demande d’attendre ne suffit pas à faire un ordinal.
3. Bonjour, oui, merci, les salutations et les formules de politesse restent des énoncés autonomes. Une question identifiée, un impératif ou une proposition avec prédication finie reste une phrase même sous une ancienne étiquette vocab/fragment.
4. Les prépositions et locutions prépositives bornées sont des unités de vocabulaire. Une comparaison ouverte, une subordonnée seule ou « un sac de » sans objet reste incomplete ; les pointillés ne sont jamais complétés.
5. Les noms, adjectifs et infinitifs isolés sont du vocabulaire. Les expressions que les règles ne peuvent décider de façon fiable restent review. La ponctuation seule ne prouve pas qu’il s’agit d’une phrase.

Les comparaisons de forme utilisent une normalisation temporaire ; aucun texte normalisé n’est écrit dans le catalogue ou dans les cartes. Les règles de sens figurent dans classify_latins.py et peuvent être contredites par la revue sémantique.

## Classes lexicales candidates

| Couple | Adjectifs | Couleurs | Prépositions | Adverbes | Autres mots | Classe incertaine |
|---|---:|---:|---:|---:|---:|---:|
| fr-en | 57 | 16 | 12 | 49 | 1112 | 35 |
| fr-es | 18 | 15 | 0 | 65 | 281 | 1 |
| fr-it | 62 | 15 | 11 | 45 | 1135 | 14 |

Les classes sont renseignées uniquement sur vocabulary, avec une raison et un statut propres. Le sens français est croisé avec la forme étudiée : lexiques de prépositions, locutions adverbiales bilingues, formes et sens adjectivaux isolés. Un adjectif attribut reste dans sa phrase ; il n’est pas extrait.

Les noms et infinitifs vont dans other. « La semaine dernière », « cet après-midi » ou « dans cinq minutes » ne deviennent pas automatiquement des adverbes. Les formes à plusieurs classes/sens, comme next ou gold, peuvent rester uncertain. Ces listes ne prétendent pas constituer une analyse morphosyntaxique complète.

La règle spécialisée de classe lexicale doit avoir priorité sur les familles maison/restaurant/etc. Une carte ne doit avoir qu’un emplacement principal : ces annotations ne demandent aucune duplication. Les couleurs ont leur classe color distincte, après lecture des formes et de leur série source ; une fleur rose ou un fruit orange n’est pas ajouté par simple correspondance de mots.

La passe éditoriale par indices de corrections-themes/latins.json remplace les décisions heuristiques sur les cartes relues : type, classe et destination sont motivés séparément. Les overrides reviewed ont priorité sur les mots-clés de routage. Codex assume cette revue de sens et de progression ; Claude intervient uniquement pour la phonétique.

## Exemples contrôlés et limites

- en[3082] « In any case, I loved it. », es[3585] « Te extraño. », it[2838] « Lo prendo. » restent des énoncés malgré cat=vocab.
- en[3436] « the password », en[4228] « wood » et it[3531] « un appuntamento » restent du vocabulaire : ni passe/bois ni rendez-vous ne prouvent une conjugaison ou une inversion.
- en[3463] « an X-ray » / « une radio » est la seule exception sourceTemplateException=true : le X de X-ray appartient au nom entier. Cette carte précise est reviewed ; son ancien marqueur template reste intact dans la source. La classe other est également vérifiée pour cette exception.
- Les repères interrogatifs isolés where/dove sans point d’interrogation restent lexicaux ; une question autonome complète garde le type utterance.

**244 cartes** restent à relire pour leur autonomie et **50 mots** pour leur classe lexicale. Les cartes hors passe éditoriale restent rule-based-candidate ; reviewed signifie une décision de sens de Codex, pas une relecture native ou une validation phonétique.

Aucune préposition espagnole isolée n’a été reconnue par les règles actuelles. Cela signale un besoin d’examen/enrichissement, pas la preuve que toute la langue ou tout le catalogue en manque. Les faibles stocks d’adjectifs/adverbes isolés espagnols doivent aussi être examinés avant d’inventer des contenus. Aucune phrase ni phonétique n’est découpée pour remplir ces catégories.

Les règles peuvent encore manquer des verbes, des ellipses conversationnelles ou des idiomes. Les cas review restent explicites ; les classer ne démontre ni la progressivité globale des niveaux ni l’acquisition. Les phonétiques existantes restent intégrales et inchangées. Claude vérifie seulement les nouvelles aides du lot éditorial distinct.

## Reproduction

    python3 -B tools/maquette-guidee/classify_latins.py
    python3 -B tools/maquette-guidee/classify_latins.py --check --self-test

Le contrôle vérifie couverture totale, unicité des indices, types autorisés, classes lexicales seulement sur vocabulary, empreintes des sources et reproduit ces fichiers. Les vérifications ciblées utilisent les cartes réelles ; aucun modèle de génération de niveaux n’est importé.
