# Audit de préparation des conversations — proposition locale

Source : `ea2619bc6f24e81c254ca00dc272dd76d35cc9a3`. Audit statique du corpus, aucun essai de compréhension, aucun changement de contenu ou de droits.

Le corpus contient **110 fichiers**, **11 couples** et les niveaux L1–L10 pour chacun. Le chargeur n'active que **7 couples**, soit **70 fichiers**. Les couples stockés mais non activés sont : en-es, en-it, en-ja, en-zh.

Total : 1319 unités, 5276 variantes entières, 330 dialogues et 2713 répliques. Ces nombres décrivent le stock ; ils ne prouvent pas son apprentissage.

## Ce qui doit guider l'amélioration

Conserver les phrases complètes, leurs aides et les identifiants ; ajouter des parcours d'exposition et de réemploi par couple. Les niveaux actuels restent des adresses de contenu, sans être présentés comme une maîtrise attestée.

1. Présenter une intention quotidienne et une phrase complète, faire écouter puis imiter, préparer un groupe de remplacement en contexte, montrer une autre phrase entière, puis combiner avec une question reçue et une clôture déjà présentées.
2. Rendre l'essai sans modèle volontaire, réversible, après exposition du modèle choisi. Dans `construire.js:324–330`, le bouton d'essai passe aujourd'hui à la variante suivante, éventuellement jamais vue. Le dialogue est accessible dès la liste des unités (`:318`) et masque par défaut `learnerRole` (`:351–369`). Une présence dans le JSON ne prouve donc pas une préparation préalable.
3. Traiter les répliques reçues comme compréhension globale ou travail explicite de structure, selon une annotation relue. Une question, une offre, un prix et une clôture n'imposent pas tous une réponse. Ne pas fabriquer une phonétique pour compléter un lien absent.
4. Relier le Guidé, les unités de Mes phrases et les rubriques par références exactes. Garder catalogue, thèmes, vocabulaire et révisions comme ressources accessibles, sans les assimiler automatiquement à des prérequis acquis.

**Cas à relire, sans réécriture automatique :** 81 unités ont un gabarit sans partie fixe alphanumérique (familles de phrases complètes) ; 11 variantes diffèrent de la substitution littérale du gabarit, dont 10 seulement par la ponctuation ou la casse. Une adaptation d'accord ou de particule peut être correcte : ne jamais remplacer la phrase complète par un collage.

Le cas non limité à la ponctuation est `L3-fr-ko-11`, variante index 1 : le gabarit donnerait **어디에서 살아요?**, alors que la phrase entière livrée est **어디에 살아요?**. L'interface conserve correctement cette phrase entière. La série doit être expliquée comme une variation de construction, sans appliquer le gabarit à toutes les réponses.

### Charge d'entrée et montée en difficulté

Chaque L1 contient déjà onze unités de quatre variantes, puis trois dialogues : le stock peut rester, mais ne doit pas imposer quarante-quatre formes et toutes les relances dans une première séance. Choisir un objectif concret, peu de variantes proches et une courte scène préparée ; les autres cartes restent des ressources et des séances suivantes.

Dans `L1-fr-zh-01`, la variante index 3 **我是来度假的。** ajoute 来…的 aux identités nominales. Dans `L1-fr-ko-01`, la variante index 2 **저는 파리에서 왔어요.** ajoute provenance et passé. Les garder comme phrases entières et les préparer avant un rappel ; ne pas présenter ces changements comme le seul remplacement d'un nom. Les séries anglaise, espagnole, italienne, japonaise et française comportent aussi des groupes d'origine ou de situation : l'appui utile est un groupe complet dans sa phrase, pas un mot isolé.

La progression thématique générale vers récit, conditions et argumentation est plausible. Le problème vérifiable est le raccord : les fichiers déclarent des niveaux précédents et des `reuses`, sans définir quelle phrase entière, quelle relance et quelle réponse ont été exposées avant chaque combinaison. Les exemples L1–L10 ci-dessous servent à préparer cette annotation, sans attribuer une difficulté chiffrée.

## Raccord avec le Guidé et les rubriques

`app.html:2934–2958` résout chaque famille guidée vers une carte entière du catalogue et conserve son `pathLv`. `setMode` (`:3431–3470`) filtre catalogue, niveaux, rubriques, thèmes et révisions séparément. Les liens proposés n'ajoutent ni nouveau verrou ni renumérotation.

Le bloc Guidé contient actuellement 26 familles et 151 références pour chacune des langues fr/en/es/zh/it/ja. Il n'a pas de configuration coréenne. Les unités de conversation fr→ko existent pourtant aux dix niveaux : le raccord coréen doit être rédigé et relu, pas traduit mécaniquement depuis un autre gabarit.

## Comment lire les indices

« Apprenant exact » et « Reçu exact » comptent les tours qui égalent une variante entière du même niveau ou d'un niveau antérieur, après normalisation de casse et ponctuation. Une combinaison correcte peut échouer à ce test. À l'inverse, une égalité ne prouve ni exposition ni mémorisation. Les candidats de structure dans le JSON sont de simples pistes de relecture, pas des prérequis validés.

La longueur sert à retrouver des exemples à relire, jamais à comparer la difficulté du chinois et de l'espagnol, ni à attribuer un niveau CECRL.

## Résultats par couple et niveau

### en-es — stocké, non activé dans le chargeur

| Niveau | Unités | Variantes | Tours | Familles de phrases entières | Apprenant exact | Reçu exact | Plus longue variante : référence et texte |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| L1 | 11 | 44 | 18 | 1 | 1/9 | 0/9 | L1-en-es-09 v2 — Un zumo de naranja, por favor. |
| L2 | 13 | 52 | 24 | 1 | 1/12 | 0/12 | L2-en-es-01 v1 — Quisiera un poco de agua, por favor. |
| L3 | 12 | 48 | 25 | 2 | 1/13 | 0/12 | L3-en-es-02 v2 — ¿Puede decirme dónde está el banco, por favor? |
| L4 | 13 | 52 | 24 | 0 | 1/12 | 0/12 | L4-en-es-02 v2 — Por la mañana llevo a los niños al colegio. |
| L5 | 13 | 52 | 26 | 2 | 0/13 | 1/13 | L5-en-es-07 v0 — Primero visitamos el museo y luego fuimos a cenar. |
| L6 | 13 | 52 | 25 | 2 | 1/13 | 0/12 | L6-en-es-09 v2 — Tengo que coger el tren de las ocho. |
| L7 | 13 | 52 | 25 | 0 | 1/12 | 0/13 | L7-en-es-13 v3 — Me gusta más vivir en el centro que en las afueras. |
| L8 | 13 | 52 | 26 | 1 | 0/14 | 1/12 | L8-en-es-06 v0 — Vale, pero solo si me lo confirma por escrito. |
| L9 | 13 | 52 | 29 | 1 | 1/15 | 0/14 | L9-en-es-09 v3 — Si he entendido bien, la cita es con el doctor López, ¿no? |
| L10 | 13 | 52 | 30 | 1 | 0/15 | 0/15 | L10-en-es-01 v0 — Por un lado me gusta el piso, por otro está muy lejos. |

Exemple reçu L1 sans égalité de phrase entière : `L1-en-es-d1`, tour index 1 : « Hola. ¿Qué desea? » (Hello. What would you like?). À annoter ; ce seul test ne démontre pas un manque de compréhension.

Exemple L10 à préparer par réemploi et combinaison : `L10-en-es-d1`, tour index 1 : « No lo sé. Por un lado me gusta el barrio, por otro es muy caro. » (I don't know. On the one hand I like the neighbourhood, on the other it's very expensive.).

### en-it — stocké, non activé dans le chargeur

| Niveau | Unités | Variantes | Tours | Familles de phrases entières | Apprenant exact | Reçu exact | Plus longue variante : référence et texte |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| L1 | 11 | 44 | 18 | 1 | 1/9 | 0/9 | L1-en-it-04 v1 — Ho bisogno di un taxi. |
| L2 | 13 | 52 | 24 | 0 | 0/12 | 0/12 | L2-en-it-01 v2 — Vorrei un bicchiere di vino, per favore. |
| L3 | 11 | 44 | 25 | 1 | 0/13 | 0/12 | L3-en-it-06 v0 — Io sono di Lione. E tu? |
| L4 | 12 | 48 | 25 | 0 | 0/13 | 0/12 | L4-en-it-02 v2 — La mattina porto i bambini a scuola. |
| L5 | 12 | 48 | 24 | 1 | 0/12 | 0/12 | L5-en-it-06 v1 — Prima ho fatto la doccia, poi siamo usciti. |
| L6 | 12 | 48 | 24 | 0 | 0/12 | 0/12 | L6-en-it-08 v3 — Allora siamo d'accordo per il pranzo di domenica? |
| L7 | 12 | 48 | 24 | 0 | 0/12 | 0/12 | L7-en-it-07 v1 — Prima prendevo il treno ogni giorno, adesso lavoro da casa. |
| L8 | 12 | 48 | 25 | 0 | 0/13 | 0/12 | L8-en-it-05 v2 — Va bene, ma solo se il prezzo non cambia. |
| L9 | 12 | 48 | 25 | 0 | 0/13 | 0/12 | L9-en-it-02 v0 — Quello che voglio dire è che il treno è in ritardo. |
| L10 | 13 | 52 | 30 | 1 | 0/15 | 0/15 | L10-en-it-01 v2 — Da un lato è una bella città, dall'altro costa troppo. |

Exemple reçu L1 sans égalité de phrase entière : `L1-en-it-d1`, tour index 1 : « Buongiorno. Cosa desidera? » (Hello. What would you like?). À annoter ; ce seul test ne démontre pas un manque de compréhension.

Exemple L10 à préparer par réemploi et combinaison : `L10-en-it-d1`, tour index 6 : « Ti capisco. Quando sono arrivato a Torino, i primi mesi sono stati duri. Poi ho trovato degli amici. » (I understand. When I arrived in Turin, the first months were hard. Then I made some friends.).

### en-ja — stocké, non activé dans le chargeur

| Niveau | Unités | Variantes | Tours | Familles de phrases entières | Apprenant exact | Reçu exact | Plus longue variante : référence et texte |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| L1 | 11 | 44 | 18 | 2 | 1/9 | 0/9 | L1-en-ja-09 v2 — オレンジジュースをお願いします。 |
| L2 | 11 | 44 | 24 | 0 | 2/12 | 0/12 | L2-en-ja-02 v2 — ベジタリアンの料理はありますか。 |
| L3 | 12 | 48 | 24 | 1 | 1/12 | 0/12 | L3-en-ja-04 v2 — どうして日本語を勉強していますか。 |
| L4 | 12 | 48 | 23 | 0 | 1/11 | 0/12 | L4-en-ja-05 v3 — 小さいアパートに住んでいます。 |
| L5 | 12 | 48 | 24 | 2 | 0/12 | 0/12 | L5-en-ja-06 v2 — まず公園を散歩して、それから家に帰りました。 |
| L6 | 12 | 48 | 25 | 0 | 1/13 | 0/12 | L6-en-ja-06 v0 — ちょっと無理ですが、日曜日なら大丈夫です。 |
| L7 | 12 | 48 | 24 | 0 | 0/12 | 0/12 | L7-en-ja-09 v3 — 前は両親の家に住んでいましたが、今は東京に住んでいます。 |
| L8 | 12 | 48 | 24 | 0 | 0/12 | 0/12 | L8-en-ja-10 v1 — テレビの音をもう少し小さくしていただけますか。 |
| L9 | 12 | 48 | 24 | 0 | 1/12 | 1/12 | L9-en-ja-02 v1 — 私が言いたいのは、もう少し休みが必要だということです。 |
| L10 | 12 | 48 | 30 | 0 | 0/15 | 0/15 | L10-en-ja-10 v2 — 急いでいるのは分かりますが、難しいと思います。 |

Exemple reçu L1 sans égalité de phrase entière : `L1-en-ja-d1`, tour index 1 : « こんにちは。ご注文は？ » (Hello. What would you like?). À annoter ; ce seul test ne démontre pas un manque de compréhension.

Exemple L10 à préparer par réemploi et combinaison : `L10-en-ja-d2`, tour index 3 : « 一週間です。まず那覇を見て、それから島に行きました。でも、台風が来たとき、とても心配しました。 » (One week. First I saw Naha, then I went to the islands. But when the typhoon came, I was very worried.).

### en-zh — stocké, non activé dans le chargeur

| Niveau | Unités | Variantes | Tours | Familles de phrases entières | Apprenant exact | Reçu exact | Plus longue variante : référence et texte |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| L1 | 11 | 44 | 18 | 1 | 1/9 | 0/9 | L1-en-zh-09 v3 — 请给我一个三明治。 |
| L2 | 11 | 44 | 24 | 1 | 0/12 | 0/12 | L2-en-zh-07 v2 — 我更喜欢靠窗的座位。 |
| L3 | 12 | 48 | 26 | 1 | 1/13 | 0/13 | L3-en-zh-06 v0 — 我不懂。可以再说一遍吗？ |
| L4 | 11 | 44 | 25 | 0 | 1/13 | 0/12 | L4-en-zh-09 v0 — 我家附近有一个公园。 |
| L5 | 11 | 44 | 24 | 2 | 0/12 | 2/12 | L5-en-zh-06 v2 — 昨天我们先看了一个展览，然后去了公园。 |
| L6 | 11 | 44 | 26 | 0 | 0/13 | 0/13 | L6-en-zh-04 v1 — 明天晚上七点，在车站前面。 |
| L7 | 11 | 44 | 24 | 0 | 0/12 | 0/12 | L7-en-zh-07 v2 — 以前我住在郊区，现在不住在那里了。 |
| L8 | 11 | 44 | 28 | 0 | 2/14 | 0/14 | L8-en-zh-08 v1 — 不好意思，不行，因为这是最后一个。 |
| L9 | 12 | 48 | 27 | 0 | 1/14 | 0/13 | L9-en-zh-07 v2 — 有个问题：我把护照忘在酒店了。怎么办？ |
| L10 | 12 | 48 | 30 | 0 | 0/15 | 0/15 | L10-en-zh-03 v0 — 如果我理解得对，你觉得我们应该等一等？ |

Exemple reçu L1 sans égalité de phrase entière : `L1-en-zh-d1`, tour index 1 : « 你好。您要什么？ » (Hello. What would you like?). À annoter ; ce seul test ne démontre pas un manque de compréhension.

Exemple L10 à préparer par réemploi et combinaison : `L10-en-zh-d1`, tour index 1 : « 对。一方面现在的公司很稳定，另一方面工资太低了。 » (Yes. On the one hand my current company is stable, on the other the pay is too low.).

### fr-en — actif dans le chargeur

| Niveau | Unités | Variantes | Tours | Familles de phrases entières | Apprenant exact | Reçu exact | Plus longue variante : référence et texte |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| L1 | 11 | 44 | 18 | 1 | 1/9 | 0/9 | L1-fr-en-06 v2 — I'm going to the market. |
| L2 | 12 | 48 | 25 | 0 | 1/13 | 0/12 | L2-fr-en-09 v1 — Is there a bus to the airport? |
| L3 | 12 | 48 | 26 | 2 | 1/13 | 3/13 | L3-fr-en-10 v1 — Nice to meet you, I'm Mary, from the Paris office. |
| L4 | 13 | 52 | 27 | 0 | 1/15 | 0/12 | L4-fr-en-02 v0 — In the morning, I have breakfast with my kids. |
| L5 | 13 | 52 | 26 | 1 | 1/14 | 0/12 | L5-fr-en-06 v3 — First I walked by the river, then I went home. |
| L6 | 12 | 48 | 25 | 1 | 0/13 | 1/12 | L6-fr-en-08 v1 — We're going to take a taxi from the airport. |
| L7 | 14 | 56 | 25 | 0 | 1/13 | 1/12 | L7-fr-en-09 v3 — I used to eat out a lot, now I only go out at the weekend. |
| L8 | 12 | 48 | 24 | 0 | 0/12 | 1/12 | L8-fr-en-08 v3 — Could you do it for the same price as last year? |
| L9 | 13 | 52 | 27 | 2 | 0/14 | 0/13 | L9-fr-en-08 v1 — There's a problem: the room is double-booked. What can we do? |
| L10 | 13 | 52 | 30 | 1 | 0/15 | 1/15 | L10-fr-en-01 v0 — On the one hand it's cheaper, on the other it's far from everything. |

Exemple reçu L1 sans égalité de phrase entière : `L1-fr-en-d1`, tour index 1 : « Hello. What would you like? » (Bonjour. Vous désirez ?). À annoter ; ce seul test ne démontre pas un manque de compréhension.

Exemple L10 à préparer par réemploi et combinaison : `L10-fr-en-d3`, tour index 5 : « Yes! The lakes were beautiful. On the one hand it rained every day, on the other we had the roads to ourselves. » (Oui ! Les lacs étaient magnifiques. D'un côté il a plu tous les jours, de l'autre on avait les routes pour nous.).

### fr-es — actif dans le chargeur

| Niveau | Unités | Variantes | Tours | Familles de phrases entières | Apprenant exact | Reçu exact | Plus longue variante : référence et texte |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| L1 | 11 | 44 | 18 | 1 | 1/9 | 0/9 | L1-fr-es-09 v2 — Un zumo de naranja, por favor. |
| L2 | 13 | 52 | 24 | 1 | 1/12 | 0/12 | L2-fr-es-01 v1 — Quisiera un poco de agua, por favor. |
| L3 | 12 | 48 | 25 | 2 | 1/13 | 0/12 | L3-fr-es-02 v2 — ¿Puede decirme dónde está el banco, por favor? |
| L4 | 13 | 52 | 24 | 0 | 1/12 | 0/12 | L4-fr-es-02 v2 — Por la mañana llevo a los niños al colegio. |
| L5 | 13 | 52 | 26 | 2 | 0/13 | 1/13 | L5-fr-es-07 v0 — Primero visitamos el museo y luego fuimos a cenar. |
| L6 | 13 | 52 | 25 | 2 | 1/13 | 0/12 | L6-fr-es-09 v2 — Tengo que coger el tren de las ocho. |
| L7 | 13 | 52 | 25 | 0 | 1/12 | 0/13 | L7-fr-es-13 v3 — Me gusta más vivir en el centro que en las afueras. |
| L8 | 13 | 52 | 26 | 1 | 0/14 | 1/12 | L8-fr-es-06 v0 — Vale, pero solo si me lo confirma por escrito. |
| L9 | 13 | 52 | 29 | 1 | 1/15 | 0/14 | L9-fr-es-09 v3 — Si he entendido bien, la cita es con el doctor López, ¿no? |
| L10 | 13 | 52 | 30 | 1 | 0/15 | 0/15 | L10-fr-es-01 v0 — Por un lado me gusta el piso, por otro está muy lejos. |

Exemple reçu L1 sans égalité de phrase entière : `L1-fr-es-d1`, tour index 1 : « Hola. ¿Qué desea? » (Bonjour. Vous désirez ?). À annoter ; ce seul test ne démontre pas un manque de compréhension.

Exemple L10 à préparer par réemploi et combinaison : `L10-fr-es-d1`, tour index 1 : « No lo sé. Por un lado me gusta el barrio, por otro es muy caro. » (Je ne sais pas. D'un côté j'aime le quartier, de l'autre c'est très cher.).

### fr-it — actif dans le chargeur

| Niveau | Unités | Variantes | Tours | Familles de phrases entières | Apprenant exact | Reçu exact | Plus longue variante : référence et texte |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| L1 | 11 | 44 | 18 | 1 | 1/9 | 0/9 | L1-fr-it-04 v1 — Ho bisogno di un taxi. |
| L2 | 13 | 52 | 24 | 0 | 0/12 | 0/12 | L2-fr-it-01 v2 — Vorrei un bicchiere di vino, per favore. |
| L3 | 11 | 44 | 25 | 1 | 0/13 | 0/12 | L3-fr-it-06 v0 — Io sono di Lione. E tu? |
| L4 | 12 | 48 | 25 | 0 | 0/13 | 0/12 | L4-fr-it-02 v2 — La mattina porto i bambini a scuola. |
| L5 | 12 | 48 | 24 | 1 | 0/12 | 0/12 | L5-fr-it-06 v1 — Prima ho fatto la doccia, poi siamo usciti. |
| L6 | 12 | 48 | 24 | 0 | 0/12 | 0/12 | L6-fr-it-08 v3 — Allora siamo d'accordo per il pranzo di domenica? |
| L7 | 12 | 48 | 24 | 0 | 0/12 | 0/12 | L7-fr-it-07 v1 — Prima prendevo il treno ogni giorno, adesso lavoro da casa. |
| L8 | 12 | 48 | 25 | 0 | 0/13 | 0/12 | L8-fr-it-05 v2 — Va bene, ma solo se il prezzo non cambia. |
| L9 | 12 | 48 | 25 | 0 | 0/13 | 0/12 | L9-fr-it-02 v0 — Quello che voglio dire è che il treno è in ritardo. |
| L10 | 13 | 52 | 30 | 1 | 0/15 | 0/15 | L10-fr-it-01 v2 — Da un lato è una bella città, dall'altro costa troppo. |

Exemple reçu L1 sans égalité de phrase entière : `L1-fr-it-d1`, tour index 1 : « Buongiorno. Cosa desidera? » (Bonjour. Vous désirez ?). À annoter ; ce seul test ne démontre pas un manque de compréhension.

Exemple L10 à préparer par réemploi et combinaison : `L10-fr-it-d1`, tour index 6 : « Ti capisco. Quando sono arrivato a Torino, i primi mesi sono stati duri. Poi ho trovato degli amici. » (Je te comprends. Quand je suis arrivé à Turin, les premiers mois ont été durs. Puis j'ai trouvé des amis.).

### fr-ja — actif dans le chargeur

| Niveau | Unités | Variantes | Tours | Familles de phrases entières | Apprenant exact | Reçu exact | Plus longue variante : référence et texte |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| L1 | 11 | 44 | 18 | 2 | 1/9 | 0/9 | L1-fr-ja-09 v2 — オレンジジュースをお願いします。 |
| L2 | 11 | 44 | 24 | 0 | 2/12 | 0/12 | L2-fr-ja-02 v2 — ベジタリアンの料理はありますか。 |
| L3 | 12 | 48 | 24 | 1 | 1/12 | 0/12 | L3-fr-ja-04 v2 — どうして日本語を勉強していますか。 |
| L4 | 12 | 48 | 23 | 0 | 1/11 | 0/12 | L4-fr-ja-05 v3 — 小さいアパートに住んでいます。 |
| L5 | 12 | 48 | 24 | 2 | 0/12 | 0/12 | L5-fr-ja-06 v2 — まず公園を散歩して、それから家に帰りました。 |
| L6 | 12 | 48 | 25 | 0 | 1/13 | 0/12 | L6-fr-ja-06 v0 — ちょっと無理ですが、日曜日なら大丈夫です。 |
| L7 | 12 | 48 | 24 | 0 | 0/12 | 0/12 | L7-fr-ja-09 v3 — 前は両親の家に住んでいましたが、今は東京に住んでいます。 |
| L8 | 12 | 48 | 24 | 0 | 0/12 | 0/12 | L8-fr-ja-10 v1 — テレビの音をもう少し小さくしていただけますか。 |
| L9 | 12 | 48 | 24 | 0 | 1/12 | 1/12 | L9-fr-ja-02 v1 — 私が言いたいのは、もう少し休みが必要だということです。 |
| L10 | 12 | 48 | 30 | 0 | 0/15 | 0/15 | L10-fr-ja-10 v2 — 急いでいるのは分かりますが、難しいと思います。 |

Exemple reçu L1 sans égalité de phrase entière : `L1-fr-ja-d1`, tour index 1 : « こんにちは。ご注文は？ » (Bonjour. Vous désirez ?). À annoter ; ce seul test ne démontre pas un manque de compréhension.

Exemple L10 à préparer par réemploi et combinaison : `L10-fr-ja-d2`, tour index 3 : « 一週間です。まず那覇を見て、それから島に行きました。でも、台風が来たとき、とても心配しました。 » (Une semaine. D'abord j'ai visité Naha, puis je suis allé sur les îles. Mais quand le typhon est arrivé, j'étais très inquiet.).

### fr-ko — actif dans le chargeur

| Niveau | Unités | Variantes | Tours | Familles de phrases entières | Apprenant exact | Reçu exact | Plus longue variante : référence et texte |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| L1 | 11 | 44 | 18 | 2 | 1/9 | 0/9 | L1-fr-ko-01 v1 — 저는 프랑스 사람이에요. |
| L2 | 12 | 48 | 24 | 0 | 2/12 | 0/12 | L2-fr-ko-06 v3 — 기차는 내일 아침에 출발해요. |
| L3 | 11 | 44 | 24 | 1 | 2/12 | 0/12 | L3-fr-ko-01 v2 — 천천히 말해 줄 수 있어요? |
| L4 | 12 | 48 | 24 | 0 | 1/12 | 0/12 | L4-fr-ko-09 v2 — 주말에는 가족하고 시간을 보내요. |
| L5 | 12 | 48 | 24 | 2 | 1/12 | 0/12 | L5-fr-ko-06 v0 — 먼저 장을 보고, 그다음에 저녁을 먹었어요. |
| L6 | 12 | 48 | 24 | 1 | 2/12 | 0/12 | L6-fr-ko-11 v2 — 다음 주에 새 프로젝트를 시작할 거예요. |
| L7 | 12 | 48 | 24 | 0 | 0/12 | 0/12 | L7-fr-ko-09 v2 — 예전에는 부모님하고 살았는데, 지금은 서울에 살아요. |
| L8 | 12 | 48 | 24 | 0 | 0/12 | 0/12 | L8-fr-ko-09 v1 — 열 시 이후에는 조금만 조용히 해 주시겠어요? |
| L9 | 12 | 48 | 24 | 1 | 0/12 | 0/12 | L9-fr-ko-08 v1 — 문제가 있어요. 지갑을 잃어버렸어요. 어떻게 하죠? |
| L10 | 12 | 48 | 30 | 1 | 0/15 | 0/15 | L10-fr-ko-07 v3 — 한국어를 배우기 시작했을 때 처음에는 힘들었는데, 나중에는 좋아졌어요. |

Exemple reçu L1 sans égalité de phrase entière : `L1-fr-ko-d1`, tour index 1 : « 안녕하세요. 뭐 드릴까요? » (Bonjour. Vous désirez ?). À annoter ; ce seul test ne démontre pas un manque de compréhension.

Exemple L10 à préparer par réemploi et combinaison : `L10-fr-ko-d1`, tour index 6 : « 저는 예전에는 집에서 일하는 게 더 좋았는데, 지금은 사무실이 더 좋아요. 집에서는 집중이 잘 안 되거든요. » (Avant, je préférais travailler à la maison, mais maintenant je préfère le bureau. À la maison, j'ai du mal à me concentrer.).

### fr-zh — actif dans le chargeur

| Niveau | Unités | Variantes | Tours | Familles de phrases entières | Apprenant exact | Reçu exact | Plus longue variante : référence et texte |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| L1 | 11 | 44 | 18 | 1 | 1/9 | 0/9 | L1-fr-zh-09 v3 — 请给我一个三明治。 |
| L2 | 11 | 44 | 24 | 1 | 0/12 | 0/12 | L2-fr-zh-07 v2 — 我更喜欢靠窗的座位。 |
| L3 | 12 | 48 | 26 | 1 | 1/13 | 0/13 | L3-fr-zh-06 v0 — 我不懂。可以再说一遍吗？ |
| L4 | 11 | 44 | 25 | 0 | 1/13 | 0/12 | L4-fr-zh-09 v0 — 我家附近有一个公园。 |
| L5 | 11 | 44 | 24 | 2 | 0/12 | 2/12 | L5-fr-zh-06 v2 — 昨天我们先看了一个展览，然后去了公园。 |
| L6 | 11 | 44 | 26 | 0 | 0/13 | 0/13 | L6-fr-zh-04 v1 — 明天晚上七点，在车站前面。 |
| L7 | 11 | 44 | 24 | 0 | 0/12 | 0/12 | L7-fr-zh-07 v2 — 以前我住在郊区，现在不住在那里了。 |
| L8 | 11 | 44 | 28 | 0 | 2/14 | 0/14 | L8-fr-zh-08 v1 — 不好意思，不行，因为这是最后一个。 |
| L9 | 12 | 48 | 27 | 0 | 1/14 | 0/13 | L9-fr-zh-07 v2 — 有个问题：我把护照忘在酒店了。怎么办？ |
| L10 | 12 | 48 | 30 | 0 | 0/15 | 0/15 | L10-fr-zh-03 v0 — 如果我理解得对，你觉得我们应该等一等？ |

Exemple reçu L1 sans égalité de phrase entière : `L1-fr-zh-d1`, tour index 1 : « 你好。您要什么？ » (Bonjour. Vous désirez ?). À annoter ; ce seul test ne démontre pas un manque de compréhension.

Exemple L10 à préparer par réemploi et combinaison : `L10-fr-zh-d1`, tour index 1 : « 对。一方面现在的公司很稳定，另一方面工资太低了。 » (Oui. D'un côté ma boîte actuelle est stable, de l'autre le salaire est trop bas.).

### zh-fr — actif dans le chargeur

| Niveau | Unités | Variantes | Tours | Familles de phrases entières | Apprenant exact | Reçu exact | Plus longue variante : référence et texte |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| L1 | 11 | 44 | 18 | 1 | 1/9 | 0/9 | L1-zh-fr-09 v2 — Un jus d'orange, s'il vous plaît. |
| L2 | 12 | 48 | 24 | 1 | 1/12 | 0/12 | L2-zh-fr-01 v2 — Je voudrais une table pour deux, s'il vous plaît. |
| L3 | 13 | 52 | 25 | 3 | 0/13 | 0/12 | L3-zh-fr-09 v2 — Je ne comprends pas. Plus lentement, s'il te plaît. |
| L4 | 12 | 48 | 25 | 0 | 0/13 | 0/12 | L4-zh-fr-10 v1 — Dans mon quartier, il y a beaucoup de cafés. |
| L5 | 12 | 48 | 25 | 3 | 0/13 | 1/12 | L5-zh-fr-03 v2 — J'ai vu Marie il y a deux jours. |
| L6 | 12 | 48 | 24 | 1 | 0/12 | 0/12 | L6-zh-fr-06 v2 — Je ne peux pas, mais on peut se voir plus tard. |
| L7 | 12 | 48 | 22 | 0 | 1/12 | 0/10 | L7-zh-fr-11 v1 — Il pleut, c'est pour ça que tout le monde prend le bus. |
| L8 | 12 | 48 | 26 | 2 | 0/14 | 0/12 | L8-zh-fr-03 v1 — Si je peux venir avec mon chien, je prends l'appartement. |
| L9 | 12 | 48 | 26 | 2 | 0/13 | 0/13 | L9-zh-fr-06 v2 — Il y a un problème : ma valise n'est pas arrivée. Qu'est-ce qu'on peut faire ? |
| L10 | 12 | 48 | 29 | 2 | 1/15 | 0/14 | L10-zh-fr-12 v2 — Ce n'est pas ce que je voulais dire. Je voulais dire que je ne suis pas contre. |

Exemple reçu L1 sans égalité de phrase entière : `L1-zh-fr-d1`, tour index 1 : « Bonjour. Vous désirez ? » (你好。您要什么？). À annoter ; ce seul test ne démontre pas un manque de compréhension.

Exemple L10 à préparer par réemploi et combinaison : `L10-zh-fr-d1`, tour index 6 : « Je comprends, mais je pense quand même que ça vaut le coup. Par exemple, mon frère l'a fait l'an dernier et il est ravi. » (我理解，但我还是觉得值得。比如说，我哥哥去年就搬了，他非常满意。).

## Contrat proposé pour l'outil d'annotation

Une annexe par couple, indépendante des 110 fichiers et du chargeur, avec état `proposition-à-relire`, commit/fichier/identifiant/index et texte exact attendu pour chaque référence. Ne pas réutiliser la phonétique francophone pour un lecteur anglophone ou sinophone.

- **Unité** : objectif concret, type (`substitution productive`, `famille de phrases entières`, `combinaison`), phrase de départ complète, variantes complètes retenues, appui éventuel existant, nouveautés à introduire et éléments réemployés.
- **Étapes** : comprendre → imiter → préparer le remplacement → remplacer → recevoir la question → recevoir la clôture → scène entière → essai volontaire sans modèle. La séquence peut être adaptée à la situation ; huit étapes ne prouvent pas l'efficacité.
- **Réception** : rôle, tour exact, `analyse:false` si compréhension globale, `replyRequired`, références exactes `answerWith` ou tableau vide explicite pour une clôture sans production. Ne pas confondre vide et non renseigné.
- **Réemploi** : liens vers phrases exactes du couple, Guidé (`familyId`, référence de carte, `pathLv` inchangé), catalogue et rubriques. Un groupe remplaçable ne remplace pas la phrase entière et peut porter sa particule ou son accord.
- **Validation** : références résolues, langue/lecteur cohérents, phrases et aides entières, ordre d'exposition déclaré avant rappel, réponse adaptée à la question, distinction proposition/original, relecture pédagogique et native séparées. Aucune note de réussite, aucun verrou ou changement de prix/droits.

## Utilisation et limites

`python3 tools/pedagogy/audit_conversation_progression.py --check` recalcule les deux rapports sans écrire. `--write` met à jour uniquement les rapports dans `docs/progression-complete/`. La comparaison protège les fichiers sources par une empreinte ; le commit indique l'origine de l'audit.

Les détails de chaque unité et tour, les aides exactes des exemples et les candidats de réemploi figurent dans `audit-conversation.json`. Ce rapport ne remplace pas la relecture native ni des essais avec de vrais débutants. Le partage ordinateur/site mobile/application doit être vérifié lors d'une future intégration : aucun appareil ni site en ligne n'a été testé dans cet audit.
