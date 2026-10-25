# Consignes de relecture carte par carte — japonais pour francophones (fr-ja)

Tu relis une partie d'une cellule du parcours Melunga : des cartes de japonais destinées à des apprenants francophones.
Chaque carte a cinq champs :
- ÉTUDE : la phrase japonaise ;
- LECTURE (`reading`) : sa lecture, en kana ou en romaji selon les cartes ;
- AIDE (`phon`) : une transcription écrite pour qu'un francophone la lise à voix haute ;
- GLOSE FR (`native`) : le sens en français ;
- le thème (identifiant et titre) et le type de carte.

**Lis chaque carte de ton fichier, une par une, sans en sauter.** Un relecteur contrôle ensuite chaque constat.
N'écris que le fichier de résultat demandé. Ne modifie rien dans le dépôt.

Fichiers utiles, en lecture seule :
- ton fichier de cartes ;
- `themes-fr-ja.txt` : les thèmes réels de chaque niveau, avec leur titre ;
- `reference-L1.txt` : les cartes L1, qui montrent les conventions de l'aide.

Conventions de l'aide :
- `u → ou` ; `e → é` ; `shi → chi` ; `chi → tchi` ; `tsu → tsou` ; `ji → dji` ; `fu → fou` ; `wa → wa` ; `ん → n` ou `nn` ;
- les voyelles longues sont doublées (`o-o`, `i-i`) ;
- les syllabes sont séparées par des tirets ;
- を se rend `o`, は (particule) `wa`, へ (particule) `é`.

## Pour chaque carte, vérifie

1. **LECTURE contre ÉTUDE.** La lecture correspond-elle aux kanji, avec la bonne lecture dans ce contexte (on/kun, rendaku, lectures irrégulières comme 今日, 明日, 一人, 大人, 上手) ? Un kanji sans lecture est une erreur. Une particule doit être lue は → wa, を → o, へ → e.
2. **AIDE contre LECTURE, more (mora) par more.** Une erreur **certaine** est :
   - un more manquant ou en trop ;
   - une voyelle longue perdue ou ajoutée, quand cela change le mot (おばさん/おばあさん, ここ/こうこう) ;
   - un petit っ (gémination) ou un ん perdu ;
   - une particule mal rendue (`ha` pour は) ;
   - un segment qui rend un autre son (`sou` pour *tsu*, `dzi` pour *ji*…) ;
   - une aide tronquée (des mots n'ont aucun segment), des mots dans le mauvais ordre, une faute de frappe manifeste.
3. **GLOSE FR.** Faux sens, contresens, sens ajouté ou omis, faute de français. Le registre (poli, familier, keigo) doit être respecté sans imposer de nuance absente.
4. **ÉTUDE.** Faute de kanji ou de kana, phrase non naturelle, registre incohérent (forme familière dans une demande polie, par exemple).
5. **NIVEAU.** Seulement si l'écart est net avec le titre du niveau et la progression.
6. **THÈME.** Seulement si l'acte de parole n'accomplit pas l'objectif du titre. Une destination proposée doit exister dans `themes-fr-ja.txt` **au même niveau**. Sinon, écris « à contextualiser ».
7. **Doublons** : la même ÉTUDE deux fois dans le fichier. Signale-le, sans demander de suppression.

Progression indicative :
- L1 premiers échanges ;
- L2 besoins et intentions ;
- L3 préciser, choisir, proposer ;
- L4 raconter, enchaîner ;
- L5 expérience et condition réelle ;
- L6 nuancer ;
- L7 hypothèse et recul ;
- L8 expressions imagées et implicite ;
- L9 discussion exigeante, registre formel ;
- L10 culture et style.

## Ce qui n'est PAS une erreur (conventions ouvertes)

- L'écriture de la lecture en kana ou en romaji, ou le système de romanisation (Hepburn ou autre).
- Les tirets ou espaces entre syllabes, la ponctuation finale.
- Le rendu du *u* dévoisé (`dé-sou` / `dess`) et du *r* japonais.
- Le doublement ou non des voyelles longues quand la lecture elle-même hésite.
- Les cartes marquées `aide-déjà-corrigée-par-Claude` : relis-les, sans re-signaler la correction déjà faite.
- Une variante d'écriture qui se lit correctement n'est **pas** une erreur. Ne décide jamais par majorité.

## Certitude

- `certain` : tu peux le justifier par l'alignement kanji / kana / segment, ou par le sens.
- `incertain` : tu doutes, ou cela dépend d'une convention ou du contexte. En cas de doute, c'est `incertain`.

## Correction

Donne **le champ entier** avant et après. Change le minimum, en gardant les conventions de la même aide.

## Fichier de résultat (JSON, UTF-8)

```json
{
  "chunk": "fr-ja-L1-part1",
  "cardsInFile": 377,
  "readIds": ["…tous les identifiants, dans l'ordre…"],
  "findings": [
    {"id": "…", "loc": "themes/0/phrases/3", "category": "phon", "certainty": "certain", "field": "phon",
     "before": "champ entier actuel", "after": "champ entier corrigé",
     "alignment": "寒 sa-mu → sa-mou · い i → i · です de-su → dé-sou",
     "reason": "explication courte en français"}
  ]
}
```

- `category` ∈ `phon`, `reading`, `native`, `study`, `level`, `theme`, `duplicate`.
- Pour `level`, `theme` et `duplicate`, `field` vaut `null`, `before` donne la valeur actuelle et `after` la proposition.
- `alignment` est obligatoire pour `phon` et `reading`.
- Une carte absente de `findings` est considérée comme relue sans changement.

Termine par un message court : nombre de cartes lues, constats certains et incertains.
