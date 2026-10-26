# Les 31 groupes d’aides divergentes : lecture bornée

Référence Claude `d4eaea315840576f42347d224b2abbed97283bdd` ; arbre de travail `345c709258b95c7ad0a76ca15c0f343a21973549`. Lecture des 62 cartes et de leurs sources. **Aucune source ni donnée produit modifiée ; aucune fusion ni publication.**

## Conclusion

L’affirmation « la majorité tranche chaque cas sans risque » n’est pas soutenue par le dossier. **Les 31 groupes ont chacun deux cartes et deux aides, donc 31 égalités 1–1.** La recherche de la même forme sur tous les niveaux du couple, avec identifiants uniques et sans copies de transport, donne encore exactement les mêmes 31 égalités. Il n’y a aucune majorité de phrase entière à appliquer.

Le script mélange plusieurs signaux : `nk(study)` efface espaces, casse et ponctuation, tandis que les aides ne subissent qu’un `strip()`. Une différence de mise en page, de caractère chinois homophone, d’insistance ou d’acte de parole peut donc être signalée comme une aide différente. Le signal est utile pour chercher ; il n’est pas une preuve de faute.

Les 62 sources ont été résolues : **196 champs recopiés contrôlés, zéro écart ; 62 empreintes de source concordantes**. Les divergences relevées sont déjà dans les origines : le seul remplacement d’une cellule générée laisserait sa provenance et son générateur incohérents. Les champs de ces 62 cartes sont aussi identiques entre la référence Claude et le HEAD audité.

## Tri du signal

- **4 groupes de séparateurs seulement** : 07, 11, 17, 18.
- **1 groupe de casse/insistance** : 02.
- **3 groupes homophoniques ou proches** : 14, 21, 28.
- **2 groupes à actes de parole distincts** : 10 et 22, question contre affirmation ; ne pas supprimer une carte.
- **6 propositions conservatrices de copie d’aide entière existante** : 08, 20, 23, 24, 30, 31. Les deux liaisons un+aller (24 et 31) ont le critère grammatical le plus net.
- Les autres groupes portent des conventions ou plusieurs compromis à relire ensemble. **Pas d’assemblage syllabe par syllabe, pas de décision par fréquence non définie.**

Les propositions ci-dessous corrigent un défaut nommé ; elles ne certifient pas la prononciation native de tous les segments de l’aide. Aucune ne touche la phrase étudiée, sa traduction, son niveau ou les droits d’accès.

## Lecture de chaque groupe

### 01 — Make a wish! (fr-en, L3)

- `catalogue:en:609` : **Make a wish!** — `MÉÏK eu WICH` — sens : « fais un vœu ! »
- `catalogue:en:610` : **Make a wish!** — `MÉÏK eu OUICH` — sens : « fais un vœu ! »

**choix-de-notation** — WICH et OUICH visent le même /w/ de wish. OUICH est plus explicite pour une lecture française, mais W se lit aussi /w/ dans les emprunts. Aucun vote ne démontre une erreur : choisir la convention de lisibilité, pas déclarer une prononciation fautive.

### 02 — I'd like to open an account. (fr-en, L6)

- `catalogue:en:1761` : **I'd like to open an account.** — `aïd LAÏK tou O-peun an eu-KAOUNT` — sens : « je voudrais ouvrir un compte »
- `catalogue:en:1789` : **I'd like to open an account.** — `AÏD LAÏK tou O-peun an eu-KAOUNT` — sens : « je voudrais ouvrir un compte »

**variante-prosodique** — Les lettres sont identiques après mise en minuscules. Les capitales AÏD marquent potentiellement une insistance sur I’d dans cette méthode ; ce n’est pas une faute de segment ni une raison de remplacer mécaniquement la casse.

### 03 — 我是学生。 (fr-zh, L1)

- `conversation:L1-fr-zh.json:L1-fr-zh-01:v0` : **我是学生。** — `ouo chr süé-cheng` — sens : « Je suis étudiant. »
- `catalogue:zh:245` : **我是学生** — `ouo chr chu-eu cheung` — sens : « je suis étudiant »

**conflit-de-sources-et-conventions** — Les variantes viennent de conversation et du catalogue. Le début x- et la finale üe de 学, ainsi que la finale de 生, changent ensemble. L’une améliore un repère et en change un autre. Aucune aide entière n’est départagée ici ; ne pas fabriquer une troisième aide en collant les segments.

### 04 — 我是法国人。 (fr-zh, L1)

- `conversation:L1-fr-zh.json:L1-fr-zh-01:v1` : **我是法国人。** — `ouo chr fa-kouo jeun` — sens : « Je suis français. »
- `catalogue:zh:285` : **我是法国人** — `ouo chr fa gouo jeune` — sens : « je suis français »

**conflit-de-sources-et-conventions** — Deux sources : gouo / kouo, jeun / jeune et les limites de mots diffèrent. Le choix de la consonne non aspirée g- du pinyin et la notation de rén ne se déduit ni de la ponctuation ni d’un comptage. Conserver les deux provenances tant que la convention n’est pas arbitrée.

### 05 — 我不懂。 (fr-zh, L1)

- `conversation:L1-fr-zh.json:L1-fr-zh-11:v0` : **我不懂。** — `ouo pou tong` — sens : « Je ne comprends pas. »
- `catalogue:zh:132` : **我不懂** — `ouo bou dong` — sens : « je ne comprends pas »

**conflit-de-sources-et-conventions** — Cas à ne surtout pas trancher à la majorité : 不 bou/pou et 懂 dong/tong relèvent de deux conventions distinctes, notamment la transcription française des occlusives non aspirées du mandarin. Deux aides contradictoires ne prouvent pas laquelle est juste. Une règle gagnante pour 不 ne permet pas d’inférer celle de 懂.

### 06 — 请再说一遍。 (fr-zh, L1)

- `conversation:L1-fr-zh.json:L1-fr-zh-11:v1` : **请再说一遍。** — `tching dzaï chouo i pièn` — sens : « Répétez, s'il vous plaît. »
- `catalogue:zh:237` : **请再说一遍** — `tching dzaï chouo i byèn` — sens : « répétez, s'il vous plaît »

**conflit-de-sources-et-conventions** — La divergence byèn / pièn porte sur la consonne initiale de 遍, pinyin biàn, et sur la graphie de la semi-voyelle. Elle doit suivre la règle b-/p- décidée pour le mandarin. Les deux sources restent traçables ; aucun changement entier proposé avant cette décision.

### 07 — 我觉得可以 (fr-zh, L3)

- `catalogue:zh:352` : **我觉得可以** — `ouo dju-eu-deu keu-i` — sens : « je pense que ça va »
- `catalogue:zh:383` : **我觉得可以** — `ouo dju-eu deu keu i` — sens : « je pense que ça va »

**variante-de-separateurs** — Les caractères d’aide deviennent strictement identiques après retrait des espaces et traits d’union. Seules les frontières graphiques changent, pas un son établi. Ce groupe n’est pas une erreur phonétique démontrée.

### 08 — Merci beaucoup ! (zh-fr, L1)

- `catalogue:fr:221` : **Merci beaucoup !** — `梅尔西 波库` — sens : « 太感谢了！ »
- `catalogue:fr:2892` : **Merci beaucoup.** — `美西布库` — sens : « 非常感谢 »

**candidat-entier-tracable** — L’aide de fr: 2892 perd le repère du r de merci et remplace le bo de beaucoup par une lecture de type bou. L’aide entière déjà présente en fr: 221 conserve ces deux repères. Proposition bornée par ces segments, sans prétendre certifier toute l’approximation chinoise.

Proposition entière, non appliquée : `catalogue:fr:2892` : `美西布库` → **`梅尔西 波库`**, copie intégrale de `catalogue:fr:221`. Pas de fusion de cartes.

### 09 — Bonne chance ! (zh-fr, L1)

- `catalogue:fr:260` : **Bonne chance !** — `邦尚斯` — sens : « 祝你好运！ »
- `catalogue:fr:2915` : **Bonne chance.** — `波 尚斯` — sens : « 祝你好运 »

**arbitrage-entier-reserve** — 波 / 邦 change simultanément la voyelle et la façon de noter le n de bonne. 波 perd un repère consonantique, mais 邦 n’est pas une transcription exacte de bonne non plus. Ne pas arbitrer une aide entière par fréquence.

### 10 — C'est gratuit ? (zh-fr, L1)

- `catalogue:fr:49` : **C'est gratuit ?** — `塞 格拉图伊` — sens : « 免费吗？ »
- `catalogue:fr:64` : **C'est gratuit.** — `塞 格拉杜伊` — sens : « 免费 »

**actes-de-parole-distincts** — La question « C’est gratuit ? » et l’affirmation « C’est gratuit. » portent des gloses cohérentes et doivent rester distinctes. 图 / 杜 n’est pas une simple variante de caractères : l’aspiration mandarine diffère. Le regroupement nk efface une ponctuation qui porte ici une fonction communicative.

### 11 — Mon père. (zh-fr, L1)

- `catalogue:fr:2882` : **Mon père.** — `蒙佩尔` — sens : « 我父亲 »
- `catalogue:fr:2883` : **mon père** — `蒙 佩尔` — sens : « 我爸爸 »

**variante-de-separateurs** — 蒙佩尔 et 蒙 佩尔 sont strictement les mêmes caractères, avec une frontière graphique différente. Les deux gloses père/papa sont légitimes. Pas de faute phonétique démontrée ; aucune suppression de carte.

### 12 — Ma mère. (zh-fr, L1)

- `catalogue:fr:2890` : **Ma mère.** — `马麦尔` — sens : « 我母亲 »
- `catalogue:fr:2891` : **ma mère** — `马 梅尔` — sens : « 我妈妈 »

**arbitrage-entier-reserve** — 麦 / 梅 propose deux diphtongues mandarines pour la voyelle française de mère ; aucune ne la restitue exactement. Une préférence exige de connaître la convention choisie. Les gloses maman/mère sont deux formulations légitimes, pas une erreur à canoniser.

### 13 — Avant. (zh-fr, L1)

- `catalogue:fr:2854` : **Avant.** — `阿旺` — sens : « 之前 »
- `catalogue:fr:3723` : **avant** — `阿翁` — sens : « 之前 »

**convention-reservee** — 阿旺 conserve mieux un repère de type an que 阿翁, mais la notation du v et des nasales françaises par caractères chinois doit être explicite. Cette préférence partielle ne vaut pas validation de l’aide entière ; aucun remplacement proposé dans ce lot.

### 14 — Tout de suite. (zh-fr, L1)

- `catalogue:fr:264` : **Tout de suite.** — `图德斯威特` — sens : « 立刻/马上 »
- `catalogue:fr:265` : **tout de suite** — `图 德 斯维特` — sens : « 马上 »

**variante-proche-homophonique** — 威 et 维 partagent la base syllabique mandarine wei et diffèrent notamment par le ton. Le français ne possède pas ce contraste de tons lexicaux. Avec les espaces, c’est une variante de notation qui ne prouve pas une différence de phonème français à corriger.

### 15 — Encore. (zh-fr, L1)

- `catalogue:fr:2851` : **Encore.** — `昂科尔` — sens : « 还/再次 »
- `catalogue:fr:3727` : **encore** — `翁寇尔` — sens : « 仍然 / 再 »

**arbitrage-entier-reserve** — 昂 / 翁 et 科 / 寇 changent deux repères distincts : nasale initiale et voyelle de la syllabe suivante. Une aide peut améliorer le premier et dégrader le second. Aucun entier sûr ; interdiction de construire une troisième aide par collage.

### 16 — Ça fait longtemps. (zh-fr, L2)

- `catalogue:fr:239` : **Ça fait longtemps.** — `萨 费 隆东` — sens : « 好久不见 »
- `catalogue:fr:240` : **Ça fait longtemps !** — `萨 费 隆汤` — sens : « 好久不见！ »

**arbitrage-entier-reserve** — Le temps de longtemps n’est pas rendu de la même façon par 东 et 汤 : voyelle et aspiration changent. 汤 rappelle mieux la voyelle an, 东 a une autre consonne non aspirée. Il faut arbitrer la phrase entière, pas voter entre deux compromis.

### 17 — Bonne année ! (zh-fr, L2)

- `catalogue:fr:305` : **Bonne année !** — `波 纳内` — sens : « 新年快乐！ »
- `catalogue:fr:2993` : **Bonne année.** — `波纳内` — sens : « 新年快乐 »

**variante-de-separateurs** — 波 纳内 et 波纳内 ne diffèrent que par les espaces. L’enchaînement de bonne année est déjà le même repère dans les deux. Pas d’incohérence phonétique démontrée.

### 18 — J'adore ça ! (zh-fr, L2)

- `catalogue:fr:109` : **J'adore ça !** — `扎多尔萨` — sens : « 我超爱这个！ »
- `catalogue:fr:110` : **J'adore ça.** — `扎多尔 萨` — sens : « 我超爱 »

**variante-de-separateurs** — 扎多尔萨 et 扎多尔 萨 ne diffèrent que par un espace. Les gloses chinoises diffèrent par l’objet explicite, de façon compatible avec la phrase française. Aucun changement phonétique nécessaire.

### 19 — C'est délicieux ! (zh-fr, L2)

- `catalogue:fr:71` : **C'est délicieux !** — `赛代利修` — sens : « 真好吃！ »
- `catalogue:fr:72` : **C'est délicieux.** — `塞 得利西厄` — sens : « 很好吃 »

**arbitrage-entier-reserve** — Plusieurs repères changent ensemble : 赛 / 塞, 代 / 得 et 修 / 西厄. Une graphie peut mieux rendre une portion et moins bien une autre. Aucun remplacement d’aide entière sûr ; ne pas réduire la décision au nombre de caractères.

### 20 — Ça marche ! (zh-fr, L2)

- `catalogue:fr:35` : **Ça marche !** — `萨 玛尔什` — sens : « 就这么定！/ 可以！ »
- `catalogue:fr:149` : **Ça marche.** — `萨马什` — sens : « 可以/行 »

**candidat-entier-tracable** — 萨马什 omet le repère du r de marche. L’aide complète de fr: 35 ajoute 尔 ; 马 et 玛 sont homophones dans ce repère. La copie entière existante corrige une omission identifiable sans concaténer de fragments.

Proposition entière, non appliquée : `catalogue:fr:149` : `萨马什` → **`萨 玛尔什`**, copie intégrale de `catalogue:fr:35`. Pas de fusion de cartes.

### 21 — Ça suffit ! (zh-fr, L2)

- `catalogue:fr:129` : **Ça suffit !** — `萨 绪菲` — sens : « 够了！ »
- `catalogue:fr:148` : **Ça suffit.** — `萨 续菲` — sens : « 够了 »

**variante-homophonique** — 绪 et 续 se prononcent tous deux xù en mandarin. Le changement de caractère ne fournit donc pas deux prononciations françaises concurrentes. Une uniformisation graphique est possible comme décision de notation, pas comme correction d’un son faux.

### 22 — Je peux vous aider ? (zh-fr, L3)

- `catalogue:fr:586` : **Je peux vous aider ?** — `热 普 乌 泽得` — sens : « 我能帮您吗？ »
- `catalogue:fr:587` : **Je peux vous aider.** — `热 珀 乌 泽得` — sens : « 我能帮您。（现在） »

**actes-de-parole-distincts** — La question « Je peux vous aider ? » et l’affirmation « Je peux vous aider. » ont des gloses chinoises distinctes et cohérentes. Les préserver. 普 / 珀 approxime différemment le eu de peux ; aucun vote ne restitue ce timbre absent du mandarin sous cette forme.

### 23 — Tu me manques beaucoup. (zh-fr, L3)

- `catalogue:fr:794` : **Tu me manques beaucoup.** — `居 么 蒙克 波库` — sens : « 我很想你 »
- `catalogue:fr:795` : **Tu me manques beaucoup.** — `居 摹 蒙克 博库` — sens : « 我很想你 »

**candidat-entier-tracable** — Pour le e muet de me, 么 fournit le repère me, tandis que 摹 entraîne mo. 波 / 博 ne change pas ici de base syllabique mandarine pour beaucoup. L’aide entière de fr: 794 est une correction conservatrice de ce repère, sans garantie native de tous ses segments.

Proposition entière, non appliquée : `catalogue:fr:795` : `居 摹 蒙克 博库` → **`居 么 蒙克 波库`**, copie intégrale de `catalogue:fr:794`. Pas de fusion de cartes.

### 24 — Un aller simple. (zh-fr, L3)

- `catalogue:fr:3053` : **Un aller simple.** — `安 阿雷 桑普勒` — sens : « 单程票 »
- `catalogue:fr:3054` : **un aller simple** — `安 纳雷 桑普勒` — sens : « 单程票 »

**candidat-entier-tracable** — La liaison de un devant aller est obligatoire dans cette expression. 安 阿雷 ne matérialise pas le n d’enchaînement ; l’aide entière existante 安 纳雷 桑普勒 le conserve. La règle grammaticale, pas une majorité, fonde la proposition.

Proposition entière, non appliquée : `catalogue:fr:3053` : `安 阿雷 桑普勒` → **`安 纳雷 桑普勒`**, copie intégrale de `catalogue:fr:3054`. Pas de fusion de cartes.

### 25 — En fait. (zh-fr, L3)

- `catalogue:fr:2867` : **En fait.** — `昂费` — sens : « 其实/事实上 »
- `catalogue:fr:2868` : **en fait** — `翁 费` — sens : « 事实上 »

**defaut-commun-a-relire** — 昂 évite mieux la lecture de type weng que 翁, mais les deux aides écrites omettent aussi le t de la prononciation courante de « en fait ». Choisir la moins mauvaise nasale ne répare pas l’aide entière. Relecture globale nécessaire, sans créer ici « une bonne aide » par fragments.

### 26 — Appelez une ambulance ! (zh-fr, L4)

- `catalogue:fr:918` : **Appelez une ambulance !** — `阿普雷 云 翁比朗斯` — sens : « 叫救护车！ »
- `catalogue:fr:919` : **Appelez une ambulance.** — `阿普雷 云 农比郎斯` — sens : « 叫救护车 »

**arbitrage-entier-reserve** — L’enchaînement une ambulance et la voyelle initiale d’ambulance sont représentés différemment par 翁 / 农, puis 郎 / 朗. Aucun entier sûr : comparer avec la parole naturelle avant de remplacer ; ne pas appliquer la règle un+aller à une+ambulance.

### 27 — Bon courage ! (zh-fr, L4)

- `catalogue:fr:961` : **Bon courage !** — `邦库拉日` — sens : « 加油！ »
- `catalogue:fr:3142` : **Bon courage.** — `蓬 库拉日` — sens : « 加油 »

**convention-reservee** — 邦 / 蓬 change voyelle et aspiration pour bon ; le mot bon nasal n’est pas identique à bonne suivi d’une consonne. Le choix doit suivre une convention contrôlée, pas la fréquence d’un autre mot.

### 28 — Je voudrais ouvrir un compte. (zh-fr, L5)

- `catalogue:fr:1319` : **Je voudrais ouvrir un compte.** — `热 乌德雷 祖弗里尔 安 孔特` — sens : « 我想开个户 »
- `catalogue:fr:1408` : **Je voudrais ouvrir un compte.** — `热 乌得雷 祖夫里尔 安 孔特` — sens : « 我想开一个账户 »

**variante-proche-homophonique** — 德 / 得 et 弗 / 夫 donnent des repères mandarins proches, avec différences de tons et polyphonie possible de 得. Aucune erreur française déterminée n’est prouvée par ces chaînes différentes. Ne pas copier une aide entière au nom de la seule ressemblance graphique.

### 29 — Je n'arrive pas à y croire. (zh-fr, L7)

- `catalogue:fr:2049` : **Je n'arrive pas à y croire.** — `热 纳里夫 帕 阿 伊 克瓦尔` — sens : « 我难以置信 »
- `catalogue:fr:2098` : **Je n'arrive pas à y croire !** — `热 纳里夫 帕 阿 伊 克鲁瓦尔` — sens : « 我简直不敢相信！ »

**arbitrage-entier-reserve** — 克瓦尔 omet le premier r du groupe croire ; 克鲁瓦尔 l’indique au prix d’une syllabe d’appui. Une convention des groupes consonantiques est nécessaire. Les deux aides ne deviennent pas exactes parce que l’une serait plus fréquente.

### 30 — N'importe quoi ! (zh-fr, L7)

- `catalogue:fr:2919` : **N'importe quoi !** — `尼波科瓦` — sens : « 什么鬼！胡说！ »
- `catalogue:fr:2920` : **N'importe quoi.** — `难波尔特 瓜` — sens : « 胡说 / 随便 »

**candidat-entier-tracable** — 尼波科瓦 escamote notamment les repères r et t de n’importe. L’aide complète existante en fr: 2920 en conserve davantage, sans assemblage. Les valeurs interjective et indéfinie et leurs gloses restent distinctes ; la correction d’aide ne supprime aucune carte.

Proposition entière, non appliquée : `catalogue:fr:2919` : `尼波科瓦` → **`难波尔特 瓜`**, copie intégrale de `catalogue:fr:2920`. Pas de fusion de cartes.

### 31 — Un aller-retour. (zh-fr, L10)

- `catalogue:fr:3569` : **Un aller-retour.** — `安 阿雷 勒图尔` — sens : « 往返票 »
- `catalogue:fr:3570` : **un aller-retour** — `安 纳雷 勒图尔` — sens : « 往返票 »

**candidat-entier-tracable** — Même liaison obligatoire un+aller qu’au groupe 24. L’aide complète 安 纳雷 勒图尔 de fr: 3570 rend le n, absent de l’autre découpage. Ne pas présenter ce choix grammatical comme un vote.

Proposition entière, non appliquée : `catalogue:fr:3569` : `安 阿雷 勒图尔` → **`安 纳雷 勒图尔`**, copie intégrale de `catalogue:fr:3570`. Pas de fusion de cartes.

## Si un correctif est retenu

Appliquer l’aide entière dans une source ou un registre d’exception explicite, avec l’identifiant cible, l’empreinte de l’origine, l’avant et l’après, puis régénérer les cellules et répertoires concernés. Ne jamais copier seulement le son jugé bon depuis une autre carte. Les index catalogue, les variantes de conversation et leurs empreintes sont dans `doublons-preuves.json`.

Une majorité globale de syllabes pourrait documenter une convention, mais elle doit définir corpus, champ, segmentation, pondération et indépendance des occurrences. Elle ne rend pas cette convention phonétiquement juste, et ne résout pas en bloc **不 bou/pou et 懂 dong/tong**. Aucun compte de syllabes n’a été présenté ici comme preuve de vérité.

Limites : lecture linguistique argumentée et contrôles de provenance ; aucune écoute native, aucune évaluation de la synthèse vocale et aucune certification native des31 aides. L’audit est borné aux31 groupes fournis : il ne valide pas les autres doublons, les gloses partagées ni les candidats de coquilles du fichier Claude.
