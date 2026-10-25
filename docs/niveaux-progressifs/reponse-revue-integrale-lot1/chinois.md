# Chinois : réponse à la revue intégrale, sans correction appliquée

Référence locale `345c709` ; revue Claude `d4eaea3`, base annoncée `4ec163e`. Les deux rapports, le registre et les sources réelles sont examinés. Aucune carte, aide, source ni donnée d’exécution n’est modifiée. Les [preuves](chinois-preuves.json) donnent les localisateurs, valeurs et empreintes.

## Les deux aides « les » manquantes sont des répliques reçues

**Les 17 aides corrigées par Claude portent 18 occurrences ; nos 19 aides portent 20 occurrences.** La phrase avec deux « les » appartient aux 17. Les deux omissions sont donc bien deux aides, une occurrence chacune. Après retrait du seul préfixe produit `situation-authored:`, les 17 correspondances ont exactement les mêmes phrase, sens, avant et après que notre proposition.

| Source dans `extension-zh-fr.json` | Identifiant reçu | Phrase | Occurrences |
| --- | --- | --- | ---: |
| `/receivedTurns/12` | `situation-zh-fr-piste-gouts-activites-received-01` | Tu aimes plutôt les activités calmes ? | 1 |
| `/receivedTurns/36` | `situation-zh-fr-piste-repondre-objection-received-03` | Je comprends mieux votre position, comparons les deux formats. | 1 |

Aides entières proposées :

- **Tu aimes plutôt les activités calmes ?** : `蒂 埃姆 普吕托 莱 扎克蒂维泰 卡勒姆` → `蒂 埃姆 普吕托 雷 扎克蒂维泰 卡勒姆`. Emplacement produit `melunga_deploy/content/niveaux-progressifs/repertoires/zh-fr.json/receivedModels/16`, niveau de première réception L3.
- **Je comprends mieux votre position, comparons les deux formats.** : `热 孔普朗 米厄 沃特尔 波齐西翁，孔帕龙 莱 德 福尔马` → `热 孔普朗 米厄 沃特尔 波齐西翁，孔帕龙 雷 德 福尔马`. Emplacement produit `melunga_deploy/content/niveaux-progressifs/repertoires/zh-fr.json/receivedModels/28`, niveau de première réception L9.

Ces deux lignes restent inchangées dans le ledger et dans le répertoire de `d4eaea3`. Elles se trouvent dans `receivedModels`, alors que les 17 lignes du registre viennent des phrases produites. C’est l’explication concrète du périmètre manquant ; aucune raison de remplacer les autres 莱 des aides.

## `tjinn` : huit aides existantes, dont une au L1

La carte dite « 90 » est précisément `catalogue:zh:4821`, « 今天天气很好。 », en L1. Mais `tjinn` existe dans **huit identifiants / huit occurrences** du catalogue historique, tous repris en exécution : L1 à L5. Dire qu’il n’existe qu’une coquille isolée dépasserait la mesure.

`DECKS.zh[2219]` fournit déjà 今天 → `djinn-tyèn` ; `[3719]` fournit 违约金 → `ouèï u-eu djinn`. Cela atteste le repère `djinn` pour les syllabes jin/jìn concernées, sans suffire à une validation native. La proposition bornée ci-dessous ne change que cette graphie ; **elle conserve `tyenn`, le reste de la phrase, la ponctuation et les autres incertitudes**. Elle touche un héritage déjà présent dans la production, pas une dégradation nouvelle.

| Identifiant | Phrase | Avant entier | Candidat entier à relire |
| --- | --- | --- | --- |
| `catalogue:zh:182` | 我今天上班。 | `ouo tjinn-tyenn chang-bann` | `ouo djinn-tyenn chang-bann` |
| `catalogue:zh:558` | 今晚吃什么？ | `tjinn-ouan tche cheunn-meu?` | `djinn-ouan tche cheunn-meu?` |
| `catalogue:zh:685` | 我以为是今天。 | `ouo i-ou-eï che tjinn-tyenn` | `ouo i-ou-eï che djinn-tyenn` |
| `catalogue:zh:731` | 你今天过得怎么样？ | `ni tjinn-tyenn gouo deu tseunn-meu-yang?` | `ni djinn-tyenn gouo deu tseunn-meu-yang?` |
| `catalogue:zh:947` | 我最近很忙。 | `ouo tsoueï-tjinn heunn mang` | `ouo tsoueï-djinn heunn mang` |
| `catalogue:zh:1029` | 我今晚去不了。 | `ouo tjinn-ouan tchu bou lyao` | `ouo djinn-ouan tchu bou lyao` |
| `catalogue:zh:4821` | 今天天气很好。 | `tjinn-tyenn tyenn-tchi heunn hao` | `djinn-tyenn tyenn-tchi heunn hao` |
| `catalogue:zh:4828` | 今天真累。 | `tjinn-tyenn djeunn leï` | `djinn-tyenn djeunn leï` |

La fréquence de `djinn` ne prouve pas que les huit autres aides sont huit fautes certaines. Une décision peut traiter la seule carte L1 ou le manifeste des huit, mais il faut l’énoncer : aucune substitution globale n’est exécutée.

## Les sept `wo` : une divergence héritée, pas sept aides à recomposer

Les sept identifiants sont retrouvés dans le catalogue et dans le parcours. Ils portent **huit occurrences de `wo`**, dont deux dans `[1874]`. La copie de référence de `[1870]` ajoute une localisation d’exécution, pas une huitième aide indépendante. `[2185]` fournit 我 → `ouo`. Les valeurs historiques sont déjà celles de la base `4ec163e` : on ne peut donc pas les présenter comme une notation perdue dans le nouveau lot.

La graphie ne permet pas non plus d’affirmer l’identité de la personne qui les a rédigées. Les réécritures complètes proposées par Claude modifieraient plusieurs décisions à la fois (`siang/chyang`, `che/chr`, `djia/djya`, `de/deu`, etc.). Elles ne sont pas reprises silencieusement. **L’option limitée, si la régularisation de l’héritage est décidée, ne change que `wo` en `ouo`** :

| Identifiant | Phrase | Avant entier dans `d4eaea3` | Option entière limitée |
| --- | --- | --- | --- |
| `catalogue:zh:227` | 您能帮我一下吗？ | `nine neung bang wo yi sia ma` | `nine neung bang ouo yi sia ma` |
| `catalogue:zh:417` | 我们可以先吃饭。 | `wo men ke yi siène tcheu fane` | `ouo men ke yi siène tcheu fane` |
| `catalogue:zh:627` | 我们可以一起去。 | `wo men ke yi i tchi tchu` | `ouo men ke yi i tchi tchu` |
| `catalogue:zh:1046` | 我们可以明天再谈。 | `wo men ke yi ming tiène dzaï tane` | `ouo men ke yi ming tiène dzaï tane` |
| `catalogue:zh:1460` | 我觉得这个办法更简单。 | `wo djué-de djeu-gue bann-fa gueng djièn-dann` | `ouo djué-de djeu-gue bann-fa gueng djièn-dann` |
| `catalogue:zh:1870` | 我回家，因为太晚了。 | `wo houé djia, yin-oué taï ouane le` | `ouo houé djia, yin-oué taï ouane le` |
| `catalogue:zh:1874` | 我想去，但是我没时间。 | `wo siang tchu, tane che wo méï cheu djienne` | `ouo siang tchu, tane che ouo méï cheu djienne` |

Pour `[1460]`, le registre Claude a déjà changé `djeu-ge` en `djeu-gue`. Le tableau part de son aide effective et conserve ce changement : il ne doit pas l’annuler en recopiant l’avant historique. Le JSON distingue les valeurs du catalogue et du lot Claude. Toute application future devra aussi gérer la provenance des sources et leurs copies ; modifier le seul JSON produit laisserait une divergence cachée.

## 约 : proposition `ué` documentée, décision distincte de 预

**17 aides canoniques** du périmètre fr→zh contiennent 约 : 12 du catalogue et 5 rédigées. Elles représentent 18 localisations avec la copie de référence de 预约. Parmi les 17, cinq aides historiques emploient déjà `ué`, sept `u-eu`, trois rédigées contiennent `yu-yué` pour **预约**, et deux `yué-ding` pour 约定.

La lecture source de 约 est `yuē`, une syllabe mandarine. Mais la présence d’un tiret dans une aide ne prouve pas que la personne prononce deux syllabes ; `yu-yué` ne constitue pas une quatrième écriture de 约 seul, puisque ce groupe couvre **deux caractères**, 预 et 约. La graphie pinyin ne dicte pas à elle seule une orthographe française de l’approximation.

Le support `[1437]` « 我们改天约个饭吧。 » porte déjà `ouo meunn gaï tyenn ué ge fann ba.`. L’option `ué` peut donc être soumise à relecture sur un manifeste entier de **12 aides candidates**, sans invention d’une syllabe nouvelle. Dans trois d’entre elles, `yu-yué` → `u-ué` comporte deux décisions explicitement séparées : la correction de 预 (`yu` → `u`) déjà proposée et celle de 约 (`yué` → `ué`) encore conditionnelle. Les cinq aides déjà en `ué` restent intactes.

| Identifiant | Phrase | Avant entier | Candidat entier conditionnel |
| --- | --- | --- | --- |
| `catalogue:zh:3331` | 约会 | `u-eu houèï` | `ué houèï` |
| `catalogue:zh:3213` | 预约 | `u u-eu` | `u ué` |
| `catalogue:zh:3176` | 大约 | `da u-eu` | `da ué` |
| `catalogue:zh:3374` | 违约 | `ouèï u-eu` | `ouèï ué` |
| `catalogue:zh:3710` | 合同约束了双方 | `heu-tong u-eu-chou leu chouang-fang` | `heu-tong ué-chou leu chouang-fang` |
| `situation-authored:fr-zh:piste-modifier-rendezvous-01` | 我需要改一下预约时间。 | `ouo chu-yao gaï i-chya yu-yué chr-djyènn.` | `ouo chu-yao gaï i-chya u-ué chr-djyènn.` |
| `situation-authored:fr-zh:piste-modifier-rendezvous-03` | 我想把预约改到周五。 | `ouo chyang ba yu-yué gaï dao djeou-ou.` | `ouo chyang ba u-ué gaï dao djeou-ou.` |
| `situation-authored:fr-zh:piste-modifier-rendezvous-06` | 还有晚一点的预约时间吗？ | `haï yeou ouann i-dyènn deu yu-yué chr-djyènn ma ?` | `haï yeou ouann i-dyènn deu u-ué chr-djyènn ma ?` |
| `catalogue:zh:3719` | 违约金 | `ouèï u-eu djinn` | `ouèï ué djinn` |
| `situation-authored:fr-zh:piste-reclamation-tact-06` | 我希望明确约定需要多久才能完成更换。 | `ouo chi-ouang ming-tchué yué-ding chu-yao douo-djyeou tsaï neung ouann-tcheung gueung-houann.` | `ouo chi-ouang ming-tchué ué-ding chu-yao douo-djyeou tsaï neung ouann-tcheung gueung-houann.` |
| `situation-authored:fr-zh:piste-reclamation-tact-08` | 请用书面形式向我确认这个约定。 | `tching yong chou-myènn ching-chr chyang ouo tchué-jeunn djeu-gueu yué-ding.` | `tching yong chou-myènn ching-chr chyang ouo tchué-jeunn djeu-gueu ué-ding.` |
| `catalogue:zh:4518` | 相互制约 | `chyang hou djr u-eu` | `chyang hou djr ué` |

Ces douze candidats restent une décision de convention à relire avec le son et la lecture francophone. Aucun `yu`, `u-eu` ou `yué` n’est remplacé ailleurs par extension.

## Rétroflexes, 的 et les conflits connus restent ouverts

Les **431 aides** rétroflexes et les **356 rendus** de 的 sont les volumes annoncés par le filtre de Claude ; ce dossier ne les transforme pas en fautes certaines ni en inventaire exhaustif de toutes les aides concernées. Le test « même nombre de caractères, de syllabes pinyin et de jetons de l’aide » ne prouve pas chaque alignement. Une distribution `r/eu`, même majoritaire, ne détermine pas ce qu’un francophone produit à la lecture. Le diagnostic « aucune voyelle » ne suffit pas non plus à sélectionner automatiquement une approximation.

Même prudence pour **不 `bou/pou` et 懂 `dong/tong`** : l’aide `ouo pou tong` ne peut être déclarée fausse uniquement parce qu’elle est minoritaire dans une cellule. L’aspiration, le voisement perçu, les contextes et la stratégie d’approximation doivent être explicités. Aucun doublon de ce type n’est normalisé par ce dossier. Les propositions des sept `wo` conservent délibérément les autres syllabes en attendant leur décision propre.

## Vérifications

Les 17 correspondances « les » ont été comparées champ par champ à la proposition antérieure ; les deux omissions ont été vérifiées à leur source et à leur emplacement reçu réel. Les huit `tjinn`, sept `wo` et dix-sept aides portant 约 sont tous localisés et reproduits depuis les objets Git figés. Les fichiers locaux sources lus sont identiques à `345c709`.

**Zéro correction appliquée**, zéro syllabe phonétique nouvelle, zéro niveau ou droit modifié. Ces propositions ne constituent ni une écoute réalisée, ni une validation native, ni une autorisation de fusionner ou publier.
