# Consignes de relecture carte par carte — anglais pour francophones (fr-en)

Tu relis une partie d'une cellule du parcours Melunga : des cartes d'anglais pour apprenants francophones.

Chaque carte comporte :
- ÉTUDE : la phrase anglaise ;
- AIDE (`phon`) : une transcription que le francophone lit à voix haute, avec les sons du français. La syllabe accentuée est en MAJUSCULES ;
- GLOSE FR (`native`) : le sens en français ;
- le thème, avec son identifiant et son titre, et le type de carte.

**Lis chaque carte de ton fichier, une par une, sans en sauter.** Un relecteur contrôle ensuite chaque constat.
N'écris que le fichier de résultat demandé, aucun fichier temporaire. Ne modifie rien dans le dépôt.

Fichiers utiles, en lecture seule :
- ton fichier de cartes ;
- `themes-fr-en.txt` : les thèmes réels de chaque niveau, avec leur titre ;
- `reference-L1.txt` : les cartes L1, qui montrent les conventions de l'aide.

Voici les conventions observées :
- *th* rendu `z` ou `s` ;
- *w* rendu `ou` ou `w` ;
- diphtongues `aï`, `éï`, `aou`, `oï` ;
- *i* bref `i` et *ee* `i` ;
- *u* de *cup* rendu `eu` ;
- *a* de *cat* rendu `è` ou `a` ;
- *-ing* rendu `ing`.

## Pour chaque carte, vérifie

1. **ÉTUDE.** Relève les fautes d'anglais : orthographe, grammaire, temps, article, préposition. Relève aussi les phrases non idiomatiques, les calques du français et un registre incohérent.
2. **GLOSE FR.** Relève les faux sens, les contresens, le sens ajouté ou omis et les fautes de français. *You* peut se rendre par tu ou par vous : ce n'est pas une erreur.
3. **AIDE, mot par mot.** Une erreur **certaine** est :
   - un mot ou une syllabe sans segment (aide tronquée), un segment en trop, ou des mots dans le mauvais ordre ;
   - un segment qui fait lire **un autre mot ou un autre son anglais**. Exemples : une lettre muette prononcée (le *k* de *know*, le *b* de *climb*, le *gh* de *night*) ; une voyelle qui change le mot (*live* lu comme *leave*, *ship* comme *sheep*, *full* comme *fool*) ; un *-ed* prononcé comme une syllabe en trop (*walked* → `WOK-tid`) ; un *-s* ou un *-ed* oublié qui change le temps ou le nombre ;
   - l'accent tonique sur la mauvaise syllabe quand cela change le mot (*REcord* / *reCORD*) ou que c'est net (*hoTEL*, *comPUter*) ;
   - des lettres anglaises laissées telles quelles, que le francophone lira mal (`th` non transcrit, `ee`, `oo`, `ow` tels quels) ;
   - une faute de frappe manifeste.
4. **NIVEAU.** Signale-le seulement si l'écart est net avec le titre du niveau et la progression.
5. **THÈME.** Signale-le seulement si l'acte de parole n'accomplit pas l'objectif du titre. La destination doit exister dans `themes-fr-en.txt` **au même niveau**. Sinon, écris « à contextualiser ».
6. **Doublons.** Signale toute ÉTUDE présente deux fois dans ton fichier, sans demander de suppression. Une différence de ponctuation seule est un quasi-doublon, à classer `incertain`.

Progression indicative :
- L1 : premiers échanges ;
- L2 : besoins et intentions ;
- L3 : préciser, choisir, proposer ;
- L4 : raconter, enchaîner ;
- L5 : expérience et condition réelle ;
- L6 : nuancer ;
- L7 : hypothèse et recul ;
- L8 : expressions imagées et implicite ;
- L9 : discussion exigeante, registre formel ;
- L10 : culture et style.

## Ce qui n'est PAS une erreur

- L'anglais américain ou britannique : `HAT` ou `HOT` pour *hot*, *r* final prononcé ou non. C'est un choix de variété ; signale-le seulement si une même aide mélange les deux.
- Deux rendus lisibles d'un même son (`OUANN` ou `WEUN` pour *one*, `z` ou `s` pour *th*). Ne décide jamais par majorité.
- Les majuscules sur un monosyllabe, les tirets et la ponctuation de l'aide.
- La forme faible d'un mot grammatical (*to* → `teu`, *and* → `eun`).
- Le *s* simple (la règle de doublement du *s* a été retirée).
- Les cartes marquées `aide-déjà-corrigée-par-Claude` : relis-les, sans re-signaler la correction déjà faite.

## Certitude

- `certain` : tu peux le justifier par l'alignement mot / segment ou par la grammaire et le sens.
- `incertain` : tu doutes, ou cela dépend d'une convention ou du contexte. En cas de doute, c'est `incertain`.

## Correction

Donne **le champ entier** avant et après. Change le minimum, en gardant les conventions de la même aide.

## Fichier de résultat (JSON, UTF-8)

```json
{
  "chunk": "fr-en-L1-part1",
  "cardsInFile": 203,
  "readIds": ["…tous les identifiants, dans l'ordre…"],
  "findings": [
    {"id": "…", "loc": "themes/0/phrases/3", "category": "phon", "certainty": "certain", "field": "phon",
     "before": "champ entier actuel", "after": "champ entier corrigé",
     "alignment": "I → aï · know → NO · …",
     "reason": "explication courte en français"}
  ]
}
```

- `category` vaut `phon`, `native`, `study`, `level`, `theme` ou `duplicate`.
- Pour `level`, `theme` et `duplicate`, `field` vaut `null`, `before` donne la valeur actuelle et `after` la proposition.
- `alignment` est obligatoire pour `phon`.
- Toute carte absente de `findings` est considérée comme relue sans changement.

Termine par un message court : le nombre de cartes lues, de constats certains et de constats incertains.
