# Consignes de relecture carte par carte — coréen pour francophones (fr-ko)

Tu relis une partie d'une cellule du parcours Melunga : des cartes de coréen pour apprenants francophones.

Chaque carte comporte plusieurs champs :
- ÉTUDE : la phrase coréenne en hangeul ;
- LECTURE (`reading`) : sa romanisation ;
- AIDE (`phon`) : une transcription écrite pour qu'un francophone la lise à voix haute ;
- GLOSE FR (`native`) : le sens en français ;
- le thème, avec son identifiant et son titre, et le type de carte.

**Lis chaque carte de ton fichier, une par une, sans en sauter.** Un relecteur contrôle ensuite chaque constat.
N'écris que le fichier de résultat demandé, aucun fichier temporaire. Ne modifie rien dans le dépôt.

Fichiers utiles, en lecture seule :
- ton fichier de cartes ;
- `themes-fr-ko.txt` : les thèmes réels de chaque niveau, avec leur titre ;
- `reference-L1.txt` : les cartes L1, qui montrent les conventions de l'aide.

Conventions observées dans l'aide (à confirmer dans `reference-L1.txt`) :
- `eo → o` ; `eu → eu` ; `ae/e → è/é` ; `u → ou` ; `wo → ouo` ;
- `j → dj` ; `ch → tch` ; `s` devant *i* ou *wi* → `ch` ;
- `g/k`, `d/t`, `b/p` selon la position ;
- `ss`, `kk`, `tt`, `pp` doublés ;
- les syllabes séparées par des tirets.

## Pour chaque carte, vérifie

1. **LECTURE contre ÉTUDE.** La romanisation correspond-elle au hangeul ? Une syllabe manquante, en trop ou fausse est une erreur. La romanisation peut suivre l'orthographe ou la prononciation : ce choix n'est pas une erreur, seul un hangeul mal lu l'est.
2. **AIDE contre ÉTUDE et LECTURE, syllabe par syllabe.** Une erreur **certaine** est :
   - une syllabe manquante ou en trop ;
   - une voyelle qui rend une autre voyelle coréenne, par exemple `eo` laissé tel quel (un francophone lit « é-o »), ou `u`/`eu` confondus quand cela change le mot ;
   - une consonne qui rend une autre consonne ;
   - un batchim (consonne finale) perdu ;
   - des lettres de romanisation laissées dans l'aide (`eo`, `ae`, `oe`, `ui`) qui ne se lisent pas à la française ;
   - une aide tronquée, des mots dans le mauvais ordre, une faute de frappe manifeste.
3. **Phonologie coréenne réelle.** Liaison du batchim devant une voyelle (`먹어요 → meo-geo-yo`), nasalisation (`합니다 → ham-ni-da`), tension, palatalisation (`같이 → ga-tchi`). Ne marque une erreur certaine que si l'aide fait clairement lire un autre mot. Les choix de simplification restent incertains.
4. **GLOSE FR.** Faux sens, contresens, sens ajouté ou omis, faute de français. Le registre (haeyo-che, hamnida-che, banmal) peut guider le tutoiement ou le vouvoiement, mais le tutoiement n'est pas une erreur en soi : signale-le seulement face à un registre nettement honorifique (-(으)시-, 드리다, 께서…).
5. **ÉTUDE.** Faute de hangeul, phrase non naturelle, registre incohérent.
6. **NIVEAU.** Seulement si l'écart est net avec le titre du niveau et la progression.
7. **THÈME.** Seulement si l'acte de parole n'accomplit pas l'objectif du titre. La destination doit exister dans `themes-fr-ko.txt` **au même niveau**. Sinon, écris « à contextualiser ».
8. **Doublons** : même ÉTUDE deux fois dans ton fichier. Signale-le sans demander de suppression. Une différence de ponctuation seule est un quasi-doublon, à classer `incertain`.

Progression indicative : L1 premiers échanges · L2 besoins et intentions · L3 préciser, choisir, proposer · L4 raconter, enchaîner · L5 expérience et condition réelle · L6 nuancer · L7 hypothèse et recul · L8 expressions imagées et implicite · L9 discussion exigeante, registre formel · L10 culture et style.

## Ce qui n'est PAS une erreur

- Le système de romanisation de la LECTURE.
- Les tirets ou les espaces, la ponctuation de l'aide.
- `g` ou `k`, `d` ou `t`, `b` ou `p` en début de mot : ce sont deux rendus lisibles d'une même initiale douce.
- La correction « g devant e/i → gu » déjà faite. Les cartes marquées `aide-déjà-corrigée-par-Claude` sont à relire, mais sans re-signaler ce qui a déjà été corrigé.
- Une variante d'écriture qui se lit correctement. Ne décide jamais par majorité.

## Certitude

- `certain` : tu peux le justifier par l'alignement hangeul / syllabe / segment, ou par le sens.
- `incertain` : tu doutes, ou cela dépend d'une convention ou du contexte. En cas de doute, c'est `incertain`.

## Correction

Donne **le champ entier**, avant et après. Change le minimum, en gardant les conventions de la même aide.

## Fichier de résultat (JSON, UTF-8)

```json
{
  "chunk": "fr-ko-L1-part1",
  "cardsInFile": 370,
  "readIds": ["…tous les identifiants, dans l'ordre…"],
  "findings": [
    {"id": "…", "loc": "themes/0/phrases/3", "category": "phon", "certainty": "certain", "field": "phon",
     "before": "champ entier actuel", "after": "champ entier corrigé",
     "alignment": "커 keo → keo ✗ (eo non rendu) · 피 pi → pi",
     "reason": "explication courte en français"}
  ]
}
```

- `category` prend l'une des valeurs `phon`, `reading`, `native`, `study`, `level`, `theme`, `duplicate`.
- Pour `level`, `theme` et `duplicate`, `field` vaut `null`, `before` est la valeur actuelle et `after` la proposition.
- `alignment` est obligatoire pour `phon` et `reading`.
- Une carte absente de `findings` est considérée comme relue sans changement.

Termine par un message court : nombre de cartes lues, nombre de constats certains et incertains.
