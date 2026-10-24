# Premier enrichissement L1 par réemploi de sources entières

Le [manifeste](enrichissements.json) sélectionne des phrases complètes déjà
écrites dans les unités L1 01, 02, 09 et 11 des sept couples. Elles servent à
préparer l’identification, le prénom, une commande polie et le dépannage d’une
conversation. Aucune phrase étudiée ni phonétique nouvelle n’est rédigée.

Les sept fichiers L1 de la branche `review/progression-L1-L10`, commit
`7d245568102f16fb8ae9e29c46bb89221358058b`, sont copiés **octet pour octet** dans
[`sources/conversation/`](sources/conversation/). Chaque référence porte
l’empreinte SHA-256 du fichier et celle de la variante complète. Les snapshots
complets servent à la provenance et à la revue de Claude ; ils ne signifient pas
que toutes leurs unités sont choisies ou validées pour le nouvel affichage.

## Ce qui entre dans le premier aperçu

| Couple | Variantes sélectionnées | Textes étudiés absents du catalogue : candidats pour l’aperçu | Doublons de texte retenus pour décision |
|---|---:|---:|---:|
| fr→en | 8 | 5 | 3 |
| fr→es | 8 | 7 | 1 |
| fr→it | 8 | 5 | 3 |
| fr→zh | 8 | 8 | 0 |
| fr→ja | 8 | 7 | 1 |
| fr→ko | 8 | 6 | 2 |
| zh→fr | 8 | 5 | 3 |
| **Total** | **56** | **43** | **13** |

Le build doit sélectionner exclusivement les items portant
`runtimeCandidate: true`. Les **43 candidats pour l’aperçu** sont des copies
de phrases entières préexistantes, avec leurs sens, phonétiques et lectures
sources. Ils ne sont pas présentés comme 43 énoncés nouvellement écrits ou comme
une relecture phonétique déjà faite. Le manifeste reste
`reviewStatus: awaiting-Claude` et `publicationApproved: false`.

Avec le catalogue conservé, le premier affichage attendu compte **32 115 cartes
sources + 43 réemplois = 32 158 entrées**, avant toute autre décision du lot.
Les 13 variantes en attente ne gonflent ni ce total ni celui des ajouts.

## Doublons exacts et formulations concurrentes

La comparaison porte exactement sur `study`, `native`, `phon` et `reading`,
avec la présence ou l’absence de chaque champ. Un doublon complet devrait être
un pont vers l’indice du catalogue, sans nouvelle entrée comptée. **Aucun des
56 candidats n’a de correspondance sur tous ces champs.** Cela ne permet pas
de conclure que les 56 textes étudiés seraient nouveaux pour le catalogue.

Treize ont déjà le même texte étudié. Douze ont une aide phonétique différente ;
le treizième, espagnol, a la même phonétique mais une traduction française
différente par sa casse et sa ponctuation. Ils portent
`runtimeCandidate: false` et
`status: needs-phonetic-or-meaning-decision`. Les champs qui diffèrent et les
indices existants sont consignés dans `catalogueSameStudyMatches`.

Le français destiné aux sinophones comporte notamment trois cas dont les aides
en caractères diffèrent entre les deux corpus. Le japonais comporte également
une lecture source en kana là où le catalogue emploie une romanisation. Ces
différences ne sont ni effacées ni harmonisées. Claude pourra choisir la source
à conserver ou proposer un traitement distinct. Une référence de réemploi du
catalogue est signalée comme **candidat soumis à décision**, pas comme un
déplacement ou une correction automatique de sa carte.

## Choix pédagogiques limités

- **Unités 01 :** variantes 0 et 1, identification et nationalité. Chaque phrase
  reste préparée entière ; les variantes de provenance ou de vacances ne sont
  pas présentées comme de simples noms à remplacer.
- **Unités 02 :** variantes 0 et 1 pour les prénoms, sauf en coréen où les
  variantes **0 et 3** sont retenues. Elles conservent `예요` dans leur source ;
  Paul et Lin introduiraient `이에요`. Cette sélection évite de cacher cette
  alternance dans la première paire, sans déclarer une règle générale acquise.
- **Unités 09 :** café puis thé, avec les demandes polies et les groupes de
  quantité exacts des sources. Aucune commande n’est calculée depuis un modèle.
- **Unités 11 :** incompréhension puis demande de répétition, deux formules
  indépendantes. Leur modèle source `{s}` n’est pas un invariant grammatical
  permettant une substitution libre.

Les unités `L1-fr-ja-03` et `L1-fr-ko-03` ne sont pas sélectionnées : leur
question de registre et de traduction demeure un dossier séparé. Leur présence
dans les snapshots L1 complets n’est pas une activation de ces unités.

`priority` indique un ordre éditorial local à proposer dans le thème : prénom
avant les autres identifications, première phrase avant la seconde. Cet indice
ne prouve pas qu’un élément a été préparé ou acquis et doit être combiné avec
les salutations et autres appuis déjà présents dans le catalogue.

## Ce que le build et Claude doivent vérifier

Le build résout la variante depuis son fichier figé et copie ses champs entiers.
Il ne remplit ni ne prononce le modèle ; il ne concatène jamais les aides des
slots. Compréhension et imitation précèdent le rappel de chaque énoncé. Ce
manifeste n’ajoute aucun exercice automatique de remplacement et ne prétend pas
constituer un dialogue avec des tours reçus.

Le dossier fournit **150 champs affichables pour les 43 candidats**, dont
43 aides phonétiques, et les treize conflits de source en attente. Les
192 champs des 56 variantes initialement sélectionnées restent consultables.
Une copie exacte préserve une source ; elle ne valide pas à elle seule sa
méthode phonétique, sa justesse native ou son placement pédagogique.

Les niveaux source du catalogue, ses aides, les droits gratuits et les tarifs
ne sont pas modifiés par ce lot. Les snapshots documentaires ne remplacent pas
les fichiers de contenu de l’application publiée.
