# Chinois — tour 2 : les 38 aides et les propositions L2

Relecture des objets Git figés : notre `97e80f9`, Claude `dfc665b`, lot précédent `d4eaea3`. [Preuves et sources exactes](chinois-preuves.json). Aucun changement produit, source, phonétique, niveau ou thème n’est appliqué par ce dossier.

## Verdict sur les 38 aides

**Les 38 aides entières ont été lues, et leurs 41 segments modifiés sont tous rattachés à la syllabe pinyin réellement visée. Aucun faux positif n’a été trouvé dans ce registre figé.** Il ne s’agit pas de vérifier seulement la présence de la lettre `j` dans la phrase : le tableau et le JSON identifient le caractère, la syllabe accentuée source et le segment précis de l’aide.

Les trois aides à deux modifications sont `[618]` (觉 `jiào` et 决 `jué`), `[1701]` (经 `jīng` et 结 `jié`) et `[2147]` (就 `jiù` et 接 `jiē`). Les 35 autres portent chacune une modification. Les autres syllabes, les tons du pinyin, la ponctuation et le sens restent à leur valeur source.

| ID catalogue zh | Phrase entière | Cible(s) relue(s) | Avant entier | Après entier |
| ---: | --- | --- | --- | --- |
| 4821 | 今天天气很好。 | 今 `jīn` : `tjinn→djinn` | `tjinn-tyenn tyenn-tchi heunn hao` | `djinn-tyenn tyenn-tchi heunn hao` |
| 195 | 我刚到家。 | 家 `jiā` : `tjya→djya` | `ouo gang dao tjya` | `ouo gang dao djya` |
| 70 | 就在这里。 | 就 `jiù` : `tjyo→djyo` | `tjyo tsaï djeu-li` | `djyo tsaï djeu-li` |
| 193 | 下周见。 | 见 `jiàn` : `tjyenn→djyenn` | `chya djeou tjyenn` | `chya djeou djyenn` |
| 175 | 交给我吧。 | 交 `jiāo` : `tjyao→djyao` | `tjyao gueï ouo ba` | `djyao gueï ouo ba` |
| 182 | 我今天上班。 | 今 `jīn` : `tjinn→djinn` | `ouo tjinn-tyenn chang-bann` | `ouo djinn-tyenn chang-bann` |
| 339 | 我已经吃过了。 | 经 `jīng` : `tjing→djing` | `ouo i-tjing tche gouo leu` | `ouo i-djing tche gouo leu` |
| 558 | 今晚吃什么？ | 今 `jīn` : `tjinn→djinn` | `tjinn-ouan tche cheunn-meu?` | `djinn-ouan tche cheunn-meu?` |
| 562 | 饭马上就好。 | 就 `jiù` : `tjyo→djyo` | `fann ma-chang tjyo hao` | `fann ma-chang djyo hao` |
| 502 | 我错过了公交车。 | 交 `jiāo` : `tjyao→djyao` | `ouo tsouo-gouo leu gong-tjyao-tcheu` | `ouo tsouo-gouo leu gong-djyao-tcheu` |
| 4828 | 今天真累。 | 今 `jīn` : `tjinn→djinn` | `tjinn-tyenn djeunn leï` | `djinn-tyenn djeunn leï` |
| 340 | 我回家了。 | 家 `jiā` : `tjya→djya` | `ouo houeï tjya leu` | `ouo houeï djya leu` |
| 388 | 我手机丢了。 | 机 `jī` : `tji→dji` | `ouo cheou-tji dyo leu` | `ouo cheou-dji dyo leu` |
| 389 | 我去睡觉了。 | 觉 `jiào` : `tjyao→djyao` | `ouo tchu choueï-tjyao leu` | `ouo tchu choueï-djyao leu` |
| 501 | 我手机没电了。 | 机 `jī` : `tji→dji` | `ouo cheou-tji meï dyenn leu` | `ouo cheou-dji meï dyenn leu` |
| 395 | 我早就说过了。 | 就 `jiù` : `tjyo→djyo` | `ouo tsao tjyo chouo gouo leu` | `ouo tsao djyo chouo gouo leu` |
| 559 | 不会太久。 | 久 `jiǔ` : `tjyo→djyo` | `bou houeï taï tjyo` | `bou houeï taï djyo` |
| 503 | 我忙得不可开交。 | 交 `jiāo` : `tjyao→djyao` | `ouo mang deu bou-keu kaï-tjyao` | `ouo mang deu bou-keu kaï-djyao` |
| 685 | 我以为是今天。 | 今 `jīn` : `tjinn→djinn` | `ouo i-ou-eï che tjinn-tyenn` | `ouo i-ou-eï che djinn-tyenn` |
| 731 | 你今天过得怎么样？ | 今 `jīn` : `tjinn→djinn` | `ni tjinn-tyenn gouo deu tseunn-meu-yang?` | `ni djinn-tyenn gouo deu tseunn-meu-yang?` |
| 857 | 花了很长时间。 | 间 `jiān` : `tjyenn→djyenn` | `houa leu heunn tchang che-tjyenn` | `houa leu heunn tchang che-djyenn` |
| 618 | 我睡一觉再决定。 | 觉 `jiào` : `tjyao→djyao` ; 决 `jué` : `tjué→djué` | `ouo choueï i tjyao tsaï tjué-ding` | `ouo choueï i djyao tsaï djué-ding` |
| 861 | 我落在家里了。 | 家 `jiā` : `tjya→djya` | `ouo la tsaï tjya li leu` | `ouo la tsaï djya li leu` |
| 617 | 时间会证明一切。 | 间 `jiān` : `tjyenn→djyenn` | `che-tjyenn houeï djeung-ming i-tchyé` | `che-djyenn houeï djeung-ming i-tchyé` |
| 4829 | 眼见为实。 | 见 `jiàn` : `tjyenn→djyenn` | `yenn-tjyenn ou-eï che` | `yenn-djyenn ou-eï che` |
| 2066 | 我一知道就告诉你。 | 就 `jiù` : `tjyo→djyo` | `ouo i dje-dao tjyo gao-sou ni` | `ouo i dje-dao djyo gao-sou ni` |
| 1029 | 我今晚去不了。 | 今 `jīn` : `tjinn→djinn` | `ouo tjinn-ouan tchu bou lyao` | `ouo djinn-ouan tchu bou lyao` |
| 947 | 我最近很忙。 | 近 `jìn` : `tjinn→djinn` | `ouo tsoueï-tjinn heunn mang` | `ouo tsoueï-djinn heunn mang` |
| 1032 | 我们上个月搬家了。 | 家 `jiā` : `tjya→djya` | `ouo-meunn chang gueu ué bann-tjya leu` | `ouo-meunn chang gueu ué bann-djya leu` |
| 1034 | 我周五前就能做完。 | 就 `jiù` : `tjyo→djyo` | `ouo djeou-ou tchyenn tjyo neung tsouo ouan` | `ouo djeou-ou tchyenn djyo neung tsouo ouan` |
| 1097 | 我七点来接你。 | 接 `jiē` : `tjyé→djyé` | `ouo tchi dyenn laï tjyé ni` | `ouo tchi dyenn laï djyé ni` |
| 1031 | 我去接孩子了。 | 接 `jiē` : `tjyé→djyé` | `ouo tchu tjyé haï-tse leu` | `ouo tchu djyé haï-tse leu` |
| 1030 | 我剪头发了。 | 剪 `jiǎn` : `tjyenn→djyenn` | `ouo tjyenn teou-fa leu` | `ouo djyenn teou-fa leu` |
| 1100 | 就这样吧。 | 就 `jiù` : `tjyo→djyo` | `tjyo djeu-yang ba` | `djyo djeu-yang ba` |
| 1224 | 我回家路上顺便买。 | 家 `jiā` : `tjya→djya` | `ouo houeï tjya lou-chang chouenn-byenn maï` | `ouo houeï djya lou-chang chouenn-byenn maï` |
| 1701 | 我们到的时候已经结束了。 | 经 `jīng` : `tjing→djing` ; 结 `jié` : `tjyé→djyé` | `ouo-meunn dao deu che-heou i-tjing tjyé-chou leu` | `ouo-meunn dao deu che-heou i-djing djyé-chou leu` |
| 2147 | 我要是你就接受。 | 就 `jiù` : `tjyo→djyo` ; 接 `jiē` : `tjyé→djyé` | `ouo yao-che ni tjyo tjyé-cheou` | `ouo yao-che ni djyo djyé-cheou` |
| 2068 | 我明明记得锁门了。 | 记 `jì` : `tji→dji` | `ouo ming-ming tji-deu souo meunn leu` | `ouo ming-ming dji-deu souo meunn leu` |

## La convention du deck et la sûreté du script sont deux questions distinctes

Le remplacement est défendable ici comme mise en accord des syllabes `j-` explicitement identifiées avec le repère `dj` déjà choisi dans le deck. **« `tj` ne se lit jamais en français » est un argument trop absolu** : une aide pédagogique peut définir ses propres repères ; la question est leur lisibilité et leur cohérence avec la méthode et le son. `dj` reste une approximation francophone, pas une promesse d’identité avec un son français voisé. Ni la majorité des graphies ni ce contrôle ne remplacent une relecture native.

Le script ne prouve pas ce que son commentaire annonce. Il construit un ensemble `j_syl`, puis ne teste que `if not j_syl`. Il ne compare même pas le nombre de syllabes en `j-` au nombre de jetons `tj`, et **n’aligne pas chaque segment sur son caractère et sa syllabe**. Une carte contenant un `j` pertinent ailleurs pourrait faire passer une autre cible mal attribuée. Aucun tel cas n’a été trouvé ici ; cela n’autorise pas à considérer le filtre comme sûr sur des cartes futures.

**Pour ce lot : utiliser le manifeste fini des 38 aides et leurs avant/après entiers, pas étendre automatiquement la règle.** Les deux cas suivants composent déjà B et D :

| ID | Avant dans notre `97e80f9` | Avant intermédiaire du registre D | Après B+D |
| --- | --- | --- | --- |
| `catalogue:zh:175` | `tjyao geï ouo ba` | `tjyao gueï ouo ba` | `djyao gueï ouo ba` |
| `catalogue:zh:1032` | `ouo-meunn chang geu ué bann-tjya leu` | `ouo-meunn chang gueu ué bann-tjya leu` | `ouo-meunn chang gueu ué bann-djya leu` |

Ces deux différences d’avant ne sont pas des faux positifs : `geï/gueï` et `geu/gueu` viennent de B, tandis que `tj/dj` vient de D. Le raccord durable doit conserver les deux changements et contrôler l’avant historique réel.

## L2 : sens, usage et niveau

- **`[223]` 我要退货** : la carte isolée exprime le retour d’une marchandise. Un remboursement peut accompagner ce retour dans une scène, mais n’est pas garanti par le mot ; 退款 désigne le remboursement. La correction de glose **« je veux un remboursement » → « je veux retourner l’article »** est justifiée. `[213]` 可以退货吗？ porte déjà « puis-je le retourner ? ». Aide conservée : `ouo yao touèï-houo`.

- **`[169]` 我累了** : « je suis fatigué » est une traduction naturelle. 了 peut mettre en relief une situation désormais pertinente ou un changement selon le contexte ; il ne signifie pas systématiquement que la fatigue débute. **Ne pas remplacer automatiquement par « je commence à être fatigué ».** `[121]` 我很累 peut également être rendu naturellement par « je suis fatigué » ; partager une glose n’est pas en soi une erreur. Une note d’usage contextualisée vaut mieux qu’une opposition forcée.

- **`[215]` 这个防水吗？** : demander si un vêtement, un sac ou un appareil résiste à l’eau relève d’un achat courant. 防水 n’impose ni un niveau avancé ni une destination professionnelle. La question courte `这个…吗` et le lexème utile se préparent séparément. « C’est étanche ? » dépend du produit ; la carte seule ne fournit pas une norme technique d’étanchéité. **Aucune montée de niveau automatique.**

- **`[231]` 能调光吗？** : un client peut poser cette question pour une lampe domestique. Une glose accessible proposée est **« Peut-on régler l’intensité lumineuse ? »**, aide `neung tyao-gouang ma?` intacte. Le mot *dimmable* est un jargon à expliciter ici ; son emploi ne suffit pas à classer la scène en négociation professionnelle ou à faire monter son niveau.

- **`[232]` 克重是多少？** : 克重 est un lexique spécifique au textile ou au papier. Un parcours de négoce ou d’achat de ces produits peut le justifier ; le cadre `是多少` n’est pas avancé à lui seul. Le titre existant `L2-travail`, « Demander une information au travail », peut accueillir une scène professionnelle explicitée. **Le classement en `travail` et la montée de niveau sont deux décisions différentes** ; aucune montée n’est prouvée par le seul mot « grammage ».

- **`[114]` 让我想一下 / `[159]` 让我想想** : les deux peuvent demander poliment un moment pour réfléchir. Le redoublement ne signifie pas intrinsèquement « plus hésitant » ; éviter une nouvelle règle d’usage catégorique sans scène qui l’établit.

## Les destinations proposées doivent aussi accomplir leur objectif réel

Les cinq phrases sont effectivement dans `L2-conversation`, intitulé « Poser et reprendre une question ». Mais constater ce rangement trop large ne valide pas automatiquement la destination. Les titres ci-dessous sont ceux des fichiers réels :

| Carte | Destination proposée par Claude | Ce qui est établi / ce qui manque |
| --- | --- | --- |
| `catalogue:zh:62` 味道很好！ | `L2-repas` — Commander selon ses besoins | Le domaine alimentaire est clair ; commenter un goût n’est pas commander. Une scène après service ou un objectif élargi doit l’expliciter. |
| `catalogue:zh:77` 我困了。 | `L2-ressentis` — Exprimer ce qu’on veut | Le sommeil relève d’un état ressenti ; il n’énonce pas ce que l’on veut. Le titre cible ne suffit pas. |
| `catalogue:zh:191` 我睡得很好。 | `L2-quotidien` — Parler de chez soi | Le récit de sommeil ne précise pas le domicile. Une scène de routine/sommeil peut justifier la réutilisation. |
| `catalogue:zh:205` 你会开车吗？ | `L2-deplacements` — Trouver son chemin | Savoir conduire est une capacité de mobilité, pas trouver son chemin. Chercher un objectif capacité/choix du transport. |
| `catalogue:zh:100` 我买这个 | `L2-repas` — Commander selon ses besoins | 买 signifie acheter ; aucun aliment n’est désigné. Préférer une scène d’achat explicite plutôt que supposer un repas. |

En particulier, la rubrique lexicale « Restaurant et achats » existe (`L2-vocab-restaurant`), mais y déplacer une phrase entière pour contourner ce problème mélangerait vocabulaire et situation. Il faut une intention d’achat déclarée, avec la phrase entière et son contexte, sans transformer ces mots en modèle implicite. Aucun de ces cinq déplacements n’est appliqué ici.

## Portée de la vérification

Ce dossier contrôle intégralement les **38 aides / 41 segments du registre D** et les propositions L2 citées. Il ne prétend pas relire indépendamment toutes les cartes du L2, valider toutes les autres syllabes de ces aides ou trancher les conventions `r/eu`, `de/deu`, `bou/pou`, `dong/tong`, `ué/u-eu` et `dz/ts`. Aucun acquis apprenant n’est déduit de la présence d’une source. Les empreintes, localisateurs, segments exacts et valeurs des gloses figurent dans le JSON.

**Zéro mutation produit, zéro phrase étudiée ou aide recomposée par ce dossier, zéro fusion, push ou publication.** Les deux gloses candidates sont proposées séparément pour décision ; les phonétiques correspondantes restent intactes.
