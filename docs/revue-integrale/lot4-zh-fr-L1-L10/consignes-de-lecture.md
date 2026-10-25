# Consignes de relecture carte par carte — français pour sinophones (zh-fr)

Tu relis une partie d'une cellule du parcours Melunga. Les apprenants sont sinophones et apprennent le **français**.
Chaque carte comporte plusieurs champs :
- ÉTUDE : la phrase française apprise ;
- AIDE (`phon`) : une transcription en **caractères chinois**, lue en mandarin, pour approcher la prononciation française ;
- GLOSE (`native`) : le sens en chinois ;
- le thème, avec son identifiant et son titre chinois, et le type de carte.

**Lis chaque carte de ton fichier, une par une, sans en sauter.** Un relecteur contrôle ensuite chaque constat.
N'écris que le fichier de résultat demandé. Ne modifie rien dans le dépôt.

Fichiers utiles, en lecture seule :
- ton fichier de cartes ;
- `themes-zh-fr.txt` : les thèmes réels de chaque niveau, avec leur titre ;
- `reference-mots.txt` : les rendus habituels des mots français dans les aides (je → 热, le → 勒, la → 拉, les → 雷,
  de → 德, c'est → 塞, pas → 帕, on → 翁, ça → 萨, il → 伊尔, vous → 乌/武…). C'est une référence, **pas** une règle de majorité.

## Pour chaque carte, vérifie

1. **ÉTUDE** : faute de français (orthographe, accord, conjugaison, élision, ponctuation française), phrase non idiomatique,
   registre incohérent avec l'usage de la phrase.
2. **GLOSE** : faux sens ou contresens du chinois, sens ajouté ou omis, chinois fautif ou non naturel.
   Ne pas exiger une nuance que le contexte ne fixe pas.
3. **AIDE, mot par mot.** Aligne chaque mot ou groupe prononcé du français avec son segment de caractères. Une erreur **certaine** :
   - **aide tronquée** : un ou plusieurs mots prononcés n'ont aucun segment (ex. « Vous pouvez parler plus lentement ? » → `武普维帕雷`,
     « plus lentement » manque) ;
   - **syllabe en trop**, ou **mot dans le mauvais ordre** ;
   - **lettres latines** dans l'aide (`zhuh`, `say`, `PUH`, `pray-FAIR`…) : l'aide doit être en caractères chinois ;
   - **segment qui rend un autre mot ou un autre son** : lettre muette prononcée à tort (le *s* final de « plus » devant consonne,
     le *t* de « et »), liaison obligatoire absente ou liaison interdite faite, voyelle nasale rendue comme une voyelle orale
     ou l'inverse quand cela change le mot, lecture « à l'anglaise » d'un mot français (`production → 普罗达克西翁`).
4. **NIVEAU** : seulement si l'écart est net avec le titre du niveau et la progression.
5. **THÈME** : seulement si l'acte de parole n'accomplit pas l'objectif du titre. Une destination proposée doit exister dans
   `themes-zh-fr.txt` **au même niveau**, avec son titre réel. Sinon, écris « à contextualiser ».
6. **Doublons** : même ÉTUDE deux fois dans ton fichier. Signale-le, sans demander de suppression.

Progression indicative : L1 premiers échanges · L2 besoins et intentions · L3 préciser, choisir, proposer · L4 raconter, enchaîner ·
L5 expérience et condition réelle · L6 nuancer · L7 hypothèse et recul · L8 expressions imagées et implicite · L9 discussion exigeante,
registre formel · L10 culture et style.

## Ce qu'il ne faut PAS signaler comme erreur (conventions ouvertes)

- Le choix entre deux caractères de son voisin (乌/武 pour « vous », 普/珀 pour « peux », 韦/维 pour « vais », 比安/比央…).
- Le *e* muet rendu ou non quand l'élision est facultative. Les espaces ou leur absence entre segments, la ponctuation de l'aide.
- La convention 雷 pour « les » (déjà corrigée). Les cartes marquées `aide-déjà-corrigée-par-Claude` : relis-les, sans
  re-signaler la correction déjà faite.
- Une approximation imparfaite mais lisible : le mandarin n'a ni *r* uvulaire ni *u* français. Seule l'erreur qui fait lire
  un autre mot, ou qui omet ou ajoute un mot, est certaine. Ne décide jamais par majorité.

## Certitude

- `certain` : tu peux le justifier par l'alignement mot / segment ou par la grammaire et le sens.
- `incertain` : tu doutes, ou cela dépend d'une convention ou du contexte. En cas de doute, c'est `incertain`.

## Correction

Donne **le champ entier** avant et après. Change le minimum, en gardant les caractères déjà employés dans la même aide et dans
`reference-mots.txt`. Pour une aide tronquée, ajoute les segments manquants avec les rendus habituels des mots concernés.

## Fichier de résultat (JSON, UTF-8)

```json
{
  "chunk": "zh-fr-L1-part1",
  "cardsInFile": 340,
  "readIds": ["…tous les identifiants, dans l'ordre…"],
  "findings": [
    {"id": "…", "loc": "themes/0/phrases/3", "category": "phon", "certainty": "certain", "field": "phon",
     "before": "aide entière actuelle", "after": "aide entière corrigée",
     "alignment": "Vous → 武 · pouvez → 普维 · parler → 帕雷 · plus → ✗ manquant · lentement → ✗ manquant",
     "reason": "explication courte en français"}
  ]
}
```

- `category` ∈ `phon`, `study`, `native`, `level`, `theme`, `duplicate`.
- Pour `level`, `theme` et `duplicate`, `field` vaut `null`. `before` donne la valeur actuelle, `after` la proposition.
- `alignment` est obligatoire pour `phon`.
- Une carte absente de `findings` est considérée comme relue sans changement.

Termine par un message court : nombre de cartes lues, constats certains et incertains.
