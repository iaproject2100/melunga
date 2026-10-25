# Consignes de relecture carte par carte — espagnol pour francophones (fr-es)

Tu relis une partie d'une cellule du parcours Melunga : des cartes d'espagnol pour apprenants francophones.

Chaque carte comporte :
- ÉTUDE : la phrase espagnole ;
- AIDE (`phon`) : une transcription que le francophone lit à voix haute, avec les sons du français. La syllabe accentuée est en MAJUSCULES ;
- GLOSE FR (`native`) : le sens en français ;
- le thème, avec son identifiant et son titre, et le type de carte.

**Lis chaque carte de ton fichier, une par une, sans en sauter.** Un relecteur contrôle ensuite chaque constat.
N'écris que le fichier de résultat demandé, aucun fichier temporaire. Ne modifie rien dans le dépôt.

Fichiers utiles, en lecture seule :
- ton fichier de cartes ;
- `themes-fr-es.txt` : les thèmes réels de chaque niveau, avec leur titre ;
- `reference-L1.txt` : les cartes L1, qui montrent les conventions de l'aide.

Conventions observées dans le L1 (à confirmer dans `reference-L1.txt`) :
- *j* et *g* devant *e*/*i* (la jota) rendus `r` : `mé-ROR` (mejor), `LÉ-ros` (lejos) ;
- *ll* et *y* rendus `y` ; *ñ* rendu `ny` ;
- *v* et *b* rendus `b` (`BA-mos`), parfois `v` ;
- *c* devant *e*/*i* et *z* rendus `s` ou `ss` ; *s* simple ou `ss` entre voyelles ;
- *h* muet non écrit ; *ch* rendu `tch` ; *u* rendu `ou` ; *e* rendu `é` (parfois `è`) ;
- *gue*/*gui* (g dur) rendus `gué`/`gui`, *ga*/*go*/*gu* rendus `ga`/`go`/`gou` ;
- *qu* rendu `k` ; *rr* et *r* initial rendus `rr`.

## Pour chaque carte, vérifie

1. **ÉTUDE.** Fautes d'espagnol : orthographe, accents écrits (tilde), ¿ ¡, grammaire, accord, temps, préposition. Phrases non idiomatiques, calques du français, registre incohérent (tú / usted mélangés dans une même phrase).
2. **GLOSE FR.** Faux sens, contresens, sens ajouté ou omis, fautes de français. *Tú* peut se rendre par tu ; *usted* appelle normalement vous : une glose qui tutoie un *usted* net est une erreur ; tutoyer ou vouvoyer un énoncé sans marque claire n'en est pas une.
3. **AIDE, syllabe par syllabe.** Une erreur **certaine** est :
   - un mot ou une syllabe sans segment (aide tronquée), un segment en trop, des mots dans le mauvais ordre ;
   - un segment qui fait lire **un autre mot ou un autre son espagnol** : *g* dur écrit `ge`/`gi` (lu [ʒ]), jota écrite `j` ou `g` (lu [ʒ]), *ch* écrit `ch` (lu [ʃ]), *u* écrit `u` (lu [y]), *ll* ou *ñ* non rendus, *h* prononcé, *qu* écrit `qu` avec u prononcé, *e* final écrit `e` muet (lu muet en français), voyelle qui change le mot ;
   - l'accent tonique sur la mauvaise syllabe : il doit suivre la règle espagnole et la tilde (*está* / *esta*, *papá* / *papa*, *habló* / *hablo*) ;
   - des lettres espagnoles laissées telles quelles que le francophone lira mal ;
   - une faute de frappe manifeste.
4. **NIVEAU.** Seulement si l'écart est net avec le titre du niveau et la progression.
5. **THÈME.** Seulement si l'acte de parole n'accomplit pas l'objectif du titre. La destination doit exister dans `themes-fr-es.txt` **au même niveau**. Sinon, écris « à contextualiser ».
6. **Doublons.** Signale toute ÉTUDE présente deux fois dans ton fichier, sans demander de suppression. Une différence de ponctuation seule est un quasi-doublon, à classer `incertain`.

Progression indicative : L1 premiers échanges · L2 besoins et intentions · L3 préciser, choisir, proposer · L4 raconter, enchaîner · L5 expérience et condition réelle · L6 nuancer · L7 hypothèse et recul · L8 expressions imagées et implicite · L9 discussion exigeante, registre formel · L10 culture et style.

## Ce qui n'est PAS une erreur

- Le seseo (`s` pour *c*/*z*) ou la distinction ; l'espagnol d'Espagne ou d'Amérique, s'il n'est pas mélangé dans une même aide.
- `s` ou `ss`, `b` ou `v`, `é` ou `è`, `BIÉN` ou `BIÈN` : deux rendus lisibles. Ne décide jamais par majorité. **Le doublement du *s* (ancienne règle A) a été retiré : le *s* simple n'est pas une erreur.**
- La jota rendue `r` : c'est la convention du deck (L1 compris). Ne la signale pas.
- Les majuscules sur un monosyllabe, les tirets, la ponctuation de l'aide, une coupe de syllabe qui se lit correctement (`dét-RAS`).
- Les cartes marquées `aide-déjà-corrigée-par-Claude` : relis-les, sans re-signaler la correction déjà faite (*g* dur → `gu`).

## Certitude

- `certain` : tu peux le justifier par l'alignement mot / syllabe / segment ou par la grammaire et le sens.
- `incertain` : tu doutes, ou cela dépend d'une convention ou du contexte. En cas de doute, c'est `incertain`.

## Correction

Donne **le champ entier** avant et après. Change le minimum, en gardant les conventions de la même aide.

## Fichier de résultat (JSON, UTF-8)

```json
{
  "chunk": "fr-es-L1-part1",
  "cardsInFile": 352,
  "readIds": ["…tous les identifiants, dans l'ordre…"],
  "findings": [
    {"id": "…", "loc": "themes/0/phrases/3", "category": "phon", "certainty": "certain", "field": "phon",
     "before": "champ entier actuel", "after": "champ entier corrigé",
     "alignment": "me → mé · llamo → YA-mo · …",
     "reason": "explication courte en français"}
  ]
}
```

- `category` vaut `phon`, `native`, `study`, `level`, `theme` ou `duplicate`.
- Pour `level`, `theme` et `duplicate`, `field` vaut `null`, `before` donne la valeur actuelle et `after` la proposition.
- `alignment` est obligatoire pour `phon`.
- Toute carte absente de `findings` est considérée comme relue sans changement.

Termine par un message court : le nombre de cartes lues, de constats certains et de constats incertains.
