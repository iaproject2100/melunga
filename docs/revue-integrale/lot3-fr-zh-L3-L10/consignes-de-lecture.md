# Consignes de relecture carte par carte — chinois pour francophones (fr-zh)

Tu relis une partie d'une cellule du parcours Melunga : des cartes de chinois pour apprenants francophones.
Chaque carte a : ÉTUDE (le chinois), PINYIN (champ `reading`), AIDE (champ `phon`, une aide de prononciation
écrite pour qu'un francophone la lise à voix haute), GLOSE FR (champ `native`), le thème (identifiant et titre) et le type.

**Tu dois lire chaque carte de ton fichier, une par une, sans en sauter aucune.** Aucun script de règle
automatique ne remplace cette lecture : un relecteur humain contrôle ensuite chaque constat. N'écris
aucun fichier en dehors du fichier de résultat demandé. Ne modifie rien dans le dépôt.

Fichiers utiles (lecture seule) :
- ton fichier de cartes (indiqué dans ta mission) ;
- `themes-fr-zh.txt` : les thèmes réels de chaque niveau avec leur titre ;
- `reference-L1-L2.txt` : 914 cartes L1–L2 déjà relues, qui montrent les conventions de l'aide
  (ex. `wo → ouo`, `j → dj`, `q → tch`, `x → ch/chy`, `zh → dj`, `ch → tch`, `sh → ch`, `r → j`,
  `z → dz`, `c → ts`, `e → eu`, `-n → nn`, `ü → u`, `ui → oueï`, `ie → yé`, `ian → yenn/yèn`, `ou → oou/o`…).

## Pour chaque carte, vérifie

1. **AIDE contre PINYIN, syllabe par syllabe.** Aligne chaque caractère, sa syllabe pinyin et le segment de
   l'aide. Est-ce que l'aide rend bien cette syllabe ? Une erreur **certaine** est : une syllabe manquante ou
   en trop, une initiale ou une finale qui rend une autre syllabe (ex. `chi` pour *qi*, `dong` pour *tong*),
   une faute de frappe manifeste (lettre doublée, lettre parasite), une suite de lettres qu'un francophone
   ne peut pas lire. Exemple déjà trouvé : 一会儿见 *yí huìr jiàn* → `i houèï-j djyèn` : le `-j` final rend
   mal le *r* d'érisation (à examiner).
2. **PINYIN contre ÉTUDE.** Le pinyin correspond-il aux caractères, avec la bonne lecture dans ce contexte
   (caractères à plusieurs lectures : 长, 行, 还, 得, 了, 觉, 重, 乐, 好, 都, 着, 地…) ? L'écriture du sandhi
   de 一 et 不 (yí/yì, bú) et l'espacement des mots sont des conventions, pas des erreurs.
3. **GLOSE FR.** Faux sens, contresens, sens ajouté que le chinois n'exprime pas, faute de français,
   anglicisme. N'impose pas une nuance que le contexte ne fixe pas (ex. ne pas exiger « je commence à être
   fatigué » pour 我累了). Tu/vous ne sont pas des erreurs : le chinois ne les distingue pas toujours.
4. **ÉTUDE.** Faute de caractère, phrase non naturelle ou incorrecte en chinois.
5. **NIVEAU.** Seulement si l'écart est net avec le titre du niveau et la progression ci-dessous
   (ex. un chengyu littéraire au L3, ou une phrase de premier contact au L9).
6. **THÈME.** Seulement si l'acte de parole n'accomplit pas l'objectif du titre du thème. Si tu proposes un
   autre thème, il doit exister dans `themes-fr-zh.txt` au **même niveau**, et tu donnes son titre réel.
   L'acte doit accomplir l'objectif de la destination : « Sais-tu conduire ? » ne demande pas un chemin.
   Si aucun thème existant ne convient, écris « à contextualiser » au lieu de forcer un déplacement.
7. **Doublons** : même ÉTUDE deux fois dans ton fichier → signale-le, sans proposer de suppression.

Progression indicative : L1 premiers échanges · L2 besoins et intentions · L3 préciser, choisir, proposer ·
L4 enchaîner et expliquer · L5 expérience et condition réelle · L6 nuancer · L7 hypothèse et recul ·
L8 expressions imagées et implicite · L9 discussion exigeante, registre formel · L10 culture et style.
Les niveaux ne sont pas des niveaux CECRL validés. Les thèmes professionnels sont des contextes facultatifs.

## Ce que tu ne dois PAS signaler comme erreur (conventions ouvertes, décidées ailleurs)

- 是/事 rendus `chr`, `cheu` ou `che` ; 在/怎 en `dz` ou `ts` ; la rime *üe* (`ué`, `uè`, `ü-é`, `u-eu`) ; 约 ;
  le rendu des rétroflexes *zhi/chi/shi/ri* (`djeu`/`djr`, `tchr`/`tcheu`, `chr`/`cheu`…) ; 的 et 了 en `de/deu`, `le/leu` ;
  `wo`/`ouo` ; 不 `bou/pou` ; 懂 `dong/tong` ; `è`/`é`/`e` dans *ie, ian, ei* ; trait d'union ou espace entre
  syllabes ; majuscule ou ponctuation finale.
- Le doublement du `s` (règle retirée). Le digramme `tj` (déjà corrigé). Les cartes marquées
  `aide-déjà-corrigée-par-Claude` ont reçu une correction : relis-les quand même, mais ne re-signale pas ce
  qui a été corrigé.
- Une variante d'écriture qui se lit correctement n'est **pas** une erreur, même si le reste du corpus en
  utilise une autre. Ne décide jamais par majorité.

## Certitude

- `certain` : tu peux justifier l'erreur par l'alignement caractère/pinyin/aide, ou par le sens du chinois.
- `incertain` : tu doutes, ou cela dépend d'un choix de convention ou de contexte. Donne la raison.
En cas de doute, c'est `incertain`. Mieux vaut peu de constats justes que beaucoup de constats contestables.

## Correction d'une aide ou d'un champ

Donne **le champ entier** avant et après (pas seulement le segment). Change le minimum : seulement la syllabe
fautive, en gardant les conventions déjà utilisées dans la même aide et dans la cellule. Ne réécris pas les
autres syllabes.

## Fichier de résultat (JSON, UTF-8)

Écris exactement un fichier JSON au chemin indiqué dans ta mission :

```json
{
  "chunk": "fr-zh-L3-part1",
  "cardsInFile": 310,
  "readIds": ["catalogue:zh:341", "..."],
  "findings": [
    {
      "id": "catalogue:zh:341",
      "loc": "themes/0/phrases/0",
      "category": "phon",
      "certainty": "certain",
      "field": "phon",
      "before": "i houèï-j djyèn",
      "after": "i houèr djyèn",
      "alignment": "一 yí → i · 会儿 huìr → houèï-j ✗ · 见 jiàn → djyèn",
      "reason": "explication courte en français"
    }
  ]
}
```

- `readIds` : **tous** les identifiants de ton fichier, dans l'ordre, chacun une fois (y compris les
  doublons d'identifiant s'il y en a, dans l'ordre où ils apparaissent). C'est la preuve de couverture.
- `category` ∈ `phon`, `reading`, `native`, `study`, `level`, `theme`, `duplicate`.
- `field` : le champ concerné (`phon`, `reading`, `native`, `study`) ; pour `level` / `theme` / `duplicate`,
  mets `null` et décris la proposition dans `after` (ex. `"L5"` ou `"L4-xxx — « titre réel »"`), `before`
  étant le niveau ou le thème actuel.
- `alignment` : obligatoire pour `phon` et `reading` ; facultatif sinon.
- Toute carte absente de `findings` est considérée comme **relue sans changement**.

Termine par un message très court : nombre de cartes lues, nombre de constats certains et incertains.
