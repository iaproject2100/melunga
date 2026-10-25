# Lecture carte par carte — chinois pour francophones

Avancement : **L1 et L2 lus intégralement** (913 cartes sur 5 018). Référence `4ec163e`.

Chaque constat porte son identifiant, l'ancienne valeur, la nouvelle et la raison. Les conventions qui demandent une décision sont marquées **à décider** et ne sont pas touchées.

---

## Corrigé — règle D : le digramme `tj` n'a aucune valeur en français

**38 aides, niveaux L1 à L10.** Un lecteur francophone bute sur `tj` : la séquence ne correspond à aucun son. Le corpus écrit `dj` pour la même initiale pinyin `j` — 158 fois pour 今 *jīn*, 131 pour 家 *jiā*, 94 pour 见 *jiàn*.

**Ce n'est pas un arbitrage de majorité**, donc l'objection de Codex ne s'applique pas ici : je ne choisis pas entre deux graphies lisibles, je répare une graphie qui ne se lit pas.

Chaque occurrence a été vérifiée contre le pinyin de sa carte : la correction n'est appliquée que si la syllabe visée porte bien une initiale `j`. En pinyin, `j` n'est jamais suivi que de `i` ou de `u` (pour ü), et aucune autre initiale ne produit un `j` — le contrôle est donc sûr. **38 vérifiées, 0 écartée, 0 occurrence restante.**

| Niveau | Identifiant | Avant | Après |
|---|---|---|---|
| L1 | `catalogue:zh:4821` | `tjinn-tyenn tyenn-tchi heunn hao` | `djinn-tyenn tyenn-tchi heunn hao` |
| L2 | — 刚到家 | `ouo gang dao tjya` | `ouo gang dao djya` |
| L2 | — 就在这里 | `tjyo tsaï djeu-li` | `djyo tsaï djeu-li` |
| L2 | — 下周见 | `chya djeou tjyenn` | `chya djeou djyenn` |
| L2 | — 交给我吧 | `tjyao gueï ouo ba` | `djyao gueï ouo ba` |
| L3 | `catalogue:zh:339` | `ouo i-tjing tche gouo leu` | `ouo i-djing tche gouo leu` |
| L3 | `catalogue:zh:502` | `…gong-tjyao-tcheu` | `…gong-djyao-tcheu` |
| L3 | `catalogue:zh:388` | `ouo cheou-tji dyo leu` | `ouo cheou-dji dyo leu` |
| L4 | `catalogue:zh:4829` | `yenn-tjyenn ou-eï che` | `yenn-djyenn ou-eï che` |
| L5 | `catalogue:zh:947` | `ouo tsoueï-tjinn heunn mang` | `ouo tsoueï-djinn heunn mang` |

Liste complète et preuve par identifiant : [`registre-tj.json`](../registre-tj.json).

Répartition : L1 1 · L2 5 · L3 12 · L4 7 · L5 9 · L6 1 · L7 2 · L10 1.

---

## À décider — trois flottements que je ne tranche pas

Codex refuse l'arbitrage par majorité et il a raison : ces trois cas opposent **deux graphies qui se lisent toutes les deux**. Ce que je peux dire, c'est que le flottement existe **à l'intérieur d'une même cellule**, donc quelle que soit la convention retenue, elle doit être unique.

### a. 是 et 事 — trois rendus dans le seul L2

| Rendu | Cartes du L2 |
|---|---|
| `chr` | 是不是？ · 说得也是 · 克重是多少？ |
| `cheu` | 我没事 · 怎么回事？ · 这是谁的？ · 这是什么味道？ |
| `che` | 会没事的。 · 我是认真的。 |

Le L1, fait à la main, écrit `chr` partout. **Trois graphies dans une cellule n'est pas une convention.**

### b. 在 zài et 怎 zěn — `dz` ou `ts`

| Carte du L2 | Aide | Ailleurs dans le corpus |
|---|---|---|
| 我在听。 | `ouo **ts**aï ting` | `dzaï` 143 fois contre `tsaï` 4 |
| 就在这里。 | `djyo **ts**aï djeu-li` | idem |
| 我们在哪儿？ | `ouo-meunn **ts**aï nar?` | idem |
| 我在想你。 | `ouo **ts**aï chyang ni` | idem |
| 怎么样了？ | `**ts**eunn-meu-yang leu?` | `dzeunn` 51 fois contre `dzeune` 8 |

**Les deux se lisent** : le français a *tsar* comme *dzêta*, et `tsaï` est même plus proche de l'affriquée sourde non aspirée du mandarin. Je ne tranche pas. **Mais le choix doit être unique.**

### c. 学 et 雪 — la rime *üe*

| Carte | Aide |
|---|---|
| L1 我是学生。 | `ouo chr **süé**-cheng` |
| L1 我是学生 (doublon) | `ouo chr **chu-eu** cheung` |
| L2 今天下雪了 | `djinn-tyèn chya **chu-eu** leu` |

Trois formes pour la même rime : `süé` (une syllabe, tréma), `chu-eu` (deux syllabes). **Et `süé` emploie un tréma qu'aucune autre aide du corpus n'utilise pour cette rime.** Même question que 约, que tu m'avais confiée : ma recommandation reste **une syllabe**, donc `chüé` ou `chué`.

---

## Gloses à reprendre — jugement de sens, pas de mesure

### Une glose fausse

**`我要退货` (L2, « je veux un remboursement »)**

退货 signifie **retourner la marchandise**, pas obtenir un remboursement — le remboursement est 退款 *tuìkuǎn*. Et la même cellule le glose correctement ailleurs : **可以退货吗？« puis-je le retourner ? »**. Les deux cartes emploient le même mot avec deux sens différents, et c'est la première qui se trompe.

> **Proposé** : « je veux retourner l'article ». Changement de contenu, donc soumis.

### Un doublon strict

**`给我看看` apparaît deux fois dans le L2**, même forme, même aide `gueï ouo kann-kann`, dans deux thèmes — `L2-comprendre` glosé « montre-moi » et `L2-conversation` glosé « montrez-moi ». Le chinois ne distingue pas le tutoiement : **la seconde carte n'apprend rien de plus.**

### Neuf traductions portées par deux formes dans le seul L2

| Traduction | Formes |
|---|---|
| « je comprends » | 我明白了 · 我理解 |
| « je suis fatigué » | 我很累 · 我累了 |
| « tu peux m'aider ? » | 你能帮我吗？ · 你能帮忙吗？ |
| « Il va pleuvoir. » | 快下雨了。 · 要下雨了 |
| « ça dépend » | 看情况 · 看情况吧 |
| « laisse-moi réfléchir » | 让我想一下 · 让我想想 |
| « c'est vrai aussi » | 说得也是 · 说得也对 |
| « tu as raison » | 你说得对 · 你说得没错 |
| « ça suffit » | 够了 · 行了 |

**La plupart sont des paires utiles** — 我很累 décrit un état, 我累了 marque le changement d'état ; 让我想一下 est ponctuel, 让我想想 est plus hésitant. **La glose française, elle, efface la différence.** Ce n'est pas un doublon à supprimer, c'est une glose à préciser : l'apprenant doit pouvoir choisir.

> **Proposé, à titre d'exemple** : 我很累 « je suis fatigué » / 我累了 « je commence à être fatigué », 让我想一下 « laisse-moi réfléchir un instant » / 让我想想 « laisse-moi y réfléchir ». À valider.

---

## Niveau et thème — trois cartes trop techniques pour le L2

| Identifiant | Carte | Glose | Problème |
|---|---|---|---|
| L2 | 克重是多少？ | « quel est le grammage ? » | vocabulaire de négoce textile ou papier, au niveau 2 |
| L2 | 能调光吗？ | « c'est dimmable ? » | spécification d'éclairage — **et « dimmable » est un anglicisme**, pas du français |
| L2 | 这个防水吗？ | « c'est étanche ? » | fiche produit |

Les trois sont dans `L2-conversation`. Elles appartiennent à un registre professionnel, comme l'incoterm anglais et l'angle de faisceau que j'avais déjà relevés au L5 et au L10. **Ce sont des cartes utiles, mais pas au niveau 2 et pas dans « conversation ».**

> **Proposé** : vers `travail`, à un niveau plus élevé. Et pour 能调光吗？, remplacer « dimmable » par **« peut-on faire varier la lumière ? »**.

### Cinq cartes à déplacer hors de `conversation`

| Carte | Glose | Thème actuel | Proposé |
|---|---|---|---|
| 味道很好！ | « C'est très bon ! » | L2-conversation | **repas** |
| 我困了。 | « J'ai sommeil. » | L2-conversation | **ressentis** |
| 我睡得很好。 | « J'ai très bien dormi. » | L2-conversation | **quotidien** |
| 你会开车吗？ | « tu sais conduire ? » | L2-conversation | **deplacements** |
| 我买这个 | « je prends celui-ci » | L2-conversation | **repas** (« Commander selon ses besoins ») |

Conformément à la remarque de Codex, je donne le **titre réel du thème visé au niveau concerné**, pas seulement son domaine : `L2-repas` s'intitule « Commander selon ses besoins », `L2-deplacements` « Trouver son chemin », `L2-ressentis` « Exprimer ce qu'on veut », `L2-quotidien` « Parler de chez soi ». Les cinq cartes entrent dans ces intentions ; aucune n'entre dans « Poser et reprendre une question », qui est l'objectif de `L2-conversation`.

---

## Ce que la lecture confirme sur la densité

`L2-conversation` porte **148 cartes nouvelles** quand les neuf autres thèmes du niveau en portent 11 à 28. Le déséquilibre que j'avais mesuré globalement se voit donc à l'intérieur d'un seul niveau — et il explique pourquoi cinq cartes mal placées s'y trouvent : **c'est la rubrique où tombe ce qui n'a pas trouvé sa place.**

---

## Reste à lire

L3 à L10 du chinois, soit **4 105 cartes**, puis les six autres couples.
