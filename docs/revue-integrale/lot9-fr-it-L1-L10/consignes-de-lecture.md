# Consignes de relecture carte par carte — italien pour francophones (fr-it)

Tu relis une partie d'une cellule du parcours Melunga : des cartes d'italien pour apprenants francophones.

Chaque carte comporte :
- ÉTUDE : la phrase italienne ;
- AIDE (`phon`) : une transcription que le francophone lit à voix haute, avec les sons du français. La syllabe accentuée est en MAJUSCULES quand l'aide la marque ;
- GLOSE FR (`native`) : le sens en français ;
- le thème, avec son identifiant et son titre, et le type de carte.

**Lis chaque carte de ton fichier, une par une, sans en sauter.** Un relecteur contrôle ensuite chaque constat.
N'écris que le fichier de résultat demandé, aucun fichier temporaire. Ne modifie rien dans le dépôt.

Fichiers utiles, en lecture seule : ton fichier de cartes ; `themes-fr-it.txt` (thèmes réels de chaque niveau) ; `reference-L1.txt` (cartes L1, qui montrent les conventions de l'aide).

Conventions observées dans le L1 (à confirmer dans `reference-L1.txt`) :
- *c*/*g* devant *e*/*i* rendus `tch`/`dj` (`fran-TCHÉ-zé`, `bouonn-djor-no`) ; *c* dur devant a/o/u rendu `c` ; *ch*/*che*/*chi* rendus `qu`/`k` (`qué`, `quiou`, `KIA-mo`) ; *qui* rendu `coui` ;
- *gn* rendu `gn` ; *gli* rendu `li` ; *z* rendu `ts` ou `dz` ; *u* rendu `ou` ; *sc* devant e/i rendu `ch` ;
- consonnes doubles écrites doubles (`frèd-do`, `dac-cor-do`) ; voyelle nasale évitée par `nn` (`nonn`, `pronn-to`) ;
- *s* entre voyelles rendu `z` (prononciation du nord) ou `s` ;
- la syllabe accentuée est souvent **non marquée** dans le L1 (aide toute en minuscules).

## Pour chaque carte, vérifie

1. **ÉTUDE.** Fautes d'italien : orthographe, accents écrits (è/é, più, perché, città), apostrophes, grammaire, accord, temps, préposition et article contracté. Phrases non idiomatiques, calques du français, registre incohérent (tu / Lei mélangés).
2. **GLOSE FR.** Faux sens, contresens, sens ajouté ou omis, fautes de français. *Lei* (forme de politesse) appelle normalement vous : une glose qui tutoie un *Lei* net est une erreur ; tutoyer ou vouvoyer un énoncé sans marque claire n'en est pas une.
3. **AIDE, syllabe par syllabe.** Une erreur **certaine** est :
   - un mot ou une syllabe sans segment (aide tronquée), un segment en trop, des mots dans le mauvais ordre ;
   - un segment qui fait lire **un autre son ou un autre mot italien** : *c*/*g* devant e/i laissés `ce`/`ci`/`ge`/`gi` (lus [s]/[ʒ]) ; *ch* écrit `ch` (lu [ʃ]) ; *gh* rendu `g` devant e/i ; *sc* devant e/i écrit `sc` ; *u* écrit `u` (lu [y]) ; *gli* ou *gn* non rendus ; *e* final écrit `e` (muet en français) ; voyelle nasale française qui avale un *n* (`on`, `an`, `in` suivis d'une consonne sans `nn`) quand cela change nettement le son ; consonne double simplifiée **si cela fait un autre mot** (*nonno*/*nono*, *caro*/*carro*, *pala*/*palla*, *sete*/*sette*) ;
   - un accent tonique **marqué** sur la mauvaise syllabe (selon la règle italienne et l'accent écrit : *città*, *perché*, *telefono* = te-LÈ-fo-no) ;
   - des lettres italiennes laissées telles quelles que le francophone lira mal ; une faute de frappe manifeste.
4. **NIVEAU.** Seulement si l'écart est net avec le titre du niveau et la progression.
5. **THÈME.** Seulement si l'acte de parole n'accomplit pas l'objectif du titre. La destination doit exister dans `themes-fr-it.txt` **au même niveau**. Sinon, écris « à contextualiser ».
6. **Doublons.** Signale toute ÉTUDE présente deux fois dans ton fichier, sans demander de suppression. Une différence de ponctuation seule est un quasi-doublon, à classer `incertain`.

Progression indicative : L1 premiers échanges · L2 besoins et intentions · L3 préciser, choisir, proposer · L4 raconter, enchaîner · L5 expérience et condition réelle · L6 nuancer · L7 hypothèse et recul · L8 expressions imagées et implicite · L9 discussion exigeante, registre formel · L10 culture et style.

## Ce qui n'est PAS une erreur

- **L'absence de majuscules d'accent** dans une aide : le L1 lui-même ne marque souvent pas l'accent. Ne le signale pas (c'est une convention d'ensemble). Signale seulement un accent marqué au mauvais endroit.
- *s* intervocalique en `s` ou en `z`, *e*/*o* ouverts ou fermés (`é`/`è`, `o`/`ô`) : variantes régionales lisibles. Ne décide jamais par majorité. Le *s* simple n'est pas une erreur (l'ancienne règle de doublement du *s* a été retirée).
- Les cartes marquées `s-intervocalique-à-trancher` : dis seulement si le *s* de l'aide fait lire un son **faux en italien standard** (par exemple un *s* sourd après préfixe, *risentiamo*, *stasera*, est correct en `s` ; un `z` y serait une variante du nord). Range ces cas en `incertain` sauf erreur nette.
- Deux rendus lisibles d'un même son (`c`/`k`, `ts`/`z`), les tirets, la ponctuation de l'aide.
- Les cartes marquées `aide-déjà-corrigée-par-Claude` : relis-les sans re-signaler la correction déjà faite.

## Certitude

- `certain` : tu peux le justifier par l'alignement mot / syllabe / segment, ou par la grammaire et le sens.
- `incertain` : tu doutes, ou cela dépend d'une convention, d'une variante ou du contexte. En cas de doute, c'est `incertain`.

## Correction

Donne **le champ entier** avant et après. Change le minimum, en gardant les conventions de la même aide.

## Fichier de résultat (JSON, UTF-8)

```json
{
  "chunk": "fr-it-L1-part1",
  "cardsInFile": 240,
  "readIds": ["…tous les identifiants, dans l'ordre…"],
  "findings": [
    {"id": "…", "loc": "themes/0/phrases/3", "category": "phon", "certainty": "certain", "field": "phon",
     "before": "champ entier actuel", "after": "champ entier corrigé",
     "alignment": "mi → mi · chiamo → KIA-mo · …",
     "reason": "explication courte en français"}
  ]
}
```

- `category` vaut `phon`, `native`, `study`, `level`, `theme` ou `duplicate`.
- Pour `level`, `theme` et `duplicate`, `field` vaut `null`, `before` donne la valeur actuelle et `after` la proposition.
- `alignment` est obligatoire pour `phon`.
- Toute carte absente de `findings` est considérée comme relue sans changement.

Termine par un message court : le nombre de cartes lues, de constats certains et de constats incertains.
