# Types de contenu — chinois pour francophones

Classification sémantique candidate des 4 903 cartes de `DECKS.zh`, sans découpage ni modification des textes, niveaux ou phonétiques.

| Type | Cartes |
|---|---:|
| utterance | 2638 |
| vocabulary | 2137 |
| number | 36 |
| incomplete | 39 |
| review | 53 |

| Classe du vocabulaire chinois | Cartes |
|---|---:|
| adjective | 384 |
| color | 6 |
| preposition | 26 |
| adverb | 107 |
| other | 1543 |
| uncertain | 71 |

## Frontières retenues

- `utterance` : énoncé ou réplique autonome. Bonjour, merci, oui, une consigne et une réponse elliptique conventionnelle ne nécessitent pas un sujet et un verbe explicites.
- `vocabulary` : nom, adjectif, verbe à l’infinitif dans le sens source, locution ou groupe nominal. Les quantités avec unité (`两个`, `两个人`, `一杯水`), les horaires isolés et les jours de semaine restent ici.
- `number` : nombre, ordinal ou fraction seul. Une phrase qui mentionne un nombre ne quitte pas les énoncés.
- `incomplete` : modèle à emplacement, amorce ouverte ou particule grammaticale liée. Rien n’est complété automatiquement.
- `review` : l’autonomie sémantique reste incertaine. Ces éléments sont réservés, pas présentés comme des phrases sûres.

Les classes grammaticales portent sur le chinois : `我很累` reste un énoncé, `累` est un adjectif isolé. `都` et `也` sont des adverbes ; `里面` est un localisateur, non une préposition copiée de « à l’intérieur ». Les noms de temps (`今天`, `下午`) ne deviennent pas automatiquement des adverbes. Les noms de couleur isolés sont désormais `color`, tandis que les fleurs, fruits et phrases avec une couleur conservent leur propre sens. Les groupes relationnels bornés peuvent rejoindre `preposition` ; les amorces à complément ou emplacement explicitement ouvert restent réservées ou incomplètes.

Les clés `lexicalClass`, `lexicalClassReason` et `lexicalClassReviewStatus` existent uniquement sur les entrées de vocabulaire. La rubrique grammaticale canonique ne duplique pas une carte dans un thème. `uncertain` réserve les emplois polyfonctionnels que le sens source ne tranche pas ; `other` conserve noms, verbes, groupes de quantité et locutions hors des trois classes demandées.

Les catégories `cat` et `pedagogicalStatus` ne suffisent jamais. La forme chinoise et son sens français sont lus ensemble ; aucune frontière n’est fondée sur la seule longueur. Les normalisations servent aux règles de repérage et ne sont jamais réécrites dans le catalogue.

`reviewed` désigne ici une décision sémantique explicite sur un mot ou une formule ; ce n’est ni une validation native ni une validation phonétique de la méthode. Les autres décisions restent `rule-based-candidate`.

## Contrôle ciblé des catégories source

Le total lexical dépasse `cat:vocab` parce que le catalogue range aussi les séries de mots dans `core`, `biz`, `basics` et `trip`. Une contre-lecture des candidats lexicaux a retiré les prédications et demandes chinoises dont le sens français est nominalisé : `质量很好`, `加我微信`, `订单增加了`, `你先走`. Les phrases complètes `我想…`, `我要…`, `请…` avec leur contenu ne deviennent pas lexicales par la seule présence d’un infinitif dans leur traduction.

| Catégorie source | Énoncés | Vocabulaire | Nombres | Incomplets | Réserve |
|---|---:|---:|---:|---:|---:|
| basics | 0 | 39 | 0 | 0 | 0 |
| biz | 192 | 676 | 0 | 10 | 8 |
| bonus | 145 | 360 | 0 | 1 | 5 |
| core | 2093 | 198 | 36 | 10 | 34 |
| template | 0 | 0 | 0 | 13 | 0 |
| trip | 16 | 85 | 0 | 0 | 0 |
| vocab | 192 | 779 | 0 | 5 | 6 |

## Contre-exemples vérifiables

| Indice | Catégorie source | Texte | Sens | Type candidat |
|---|---|---|---|---|
| 0 | core | 你好 | bonjour | utterance |
| 2 | core | 谢谢 | merci | utterance |
| 2168 | core | 是 | oui / c'est ça | utterance |
| 2207 | core | 吗 | (particule interrogative) | incomplete |
| 2223 | template | 我是…… | je suis… | incomplete |
| 39 | core | 我想要 | je voudrais | incomplete |
| 2235 | vocab | 给我看看 | montre-moi | utterance |
| 2300 | vocab | 以后我会常来看你。 | Désormais, je viendrai te voir souvent. | utterance |
| 2301 | vocab | 真的吗？ | vraiment ? | utterance |
| 2305 | vocab | 一个 | un (général) | vocabulary |
| 2306 | vocab | 两个人 | deux personnes | vocabulary |
| 2308 | vocab | 一张 | un (billet/feuille) | vocabulary |
| 2385 | vocab | 商店关门了，于是我们去了别家。 | Le magasin était fermé, du coup on est allés ailleurs. | utterance |
| 2779 | core | 十一 | onze | number |
| 2786 | core | 两个 | deux (unités) | vocabulary |
| 2787 | core | 第一 | premier | number |
| 2793 | core | 星期一 | lundi | vocabulary |
| 2852 | core | 护照 | passeport | vocabulary |
| 2948 | core | 都 | tous / les deux | vocabulary |
| 3071 | vocab | 我会 | je sais (faire) | utterance |
| 3334 | vocab | 祝贺你！ | félicitations ! | utterance |
| 3902 | vocab | 请重启一下电脑 | redémarre l'ordinateur s'il te plaît | utterance |
| 4816 | vocab | 生产周期是四十五天 | le délai de production est de 45 jours. | utterance |
| 147 | core | 你先走 | pars devant | utterance |
| 2234 | bonus | 加我微信 | ajoute-moi sur WeChat | utterance |
| 2411 | vocab | 订单增加了 | la commande a augmenté | utterance |
| 2970 | biz | 质量很好 | bonne qualité | utterance |
| 2242 | vocab | 大 | grand | vocabulary |
| 2866 | biz | 名片 | carte de visite | vocabulary |
| 2934 | biz | 数量 | quantité | vocabulary |
| 2935 | biz | 颜色 | couleur | vocabulary |
| 2936 | biz | 尺寸 | dimensions | vocabulary |
| 2843 | trip | 地铁站 | station de métro | vocabulary |
| 2846 | trip | 右边 | à droite (côté) | vocabulary |
| 2923 | trip | 一张票 | un billet | vocabulary |
| 2459 | bonus | 反正 | de toute façon | vocabulary |
| 3065 | basics | 每次 | à chaque fois | vocabulary |
| 2219 | core | 今天 | aujourd'hui | vocabulary |

## Réserve de relecture

| Indice | Texte | Sens source |
|---|---|---|
| 650 | 百尺竿头更进一步 | toujours viser plus haut |
| 705 | 精益求精不断进取 | toujours viser l'excellence |
| 714 | 虚己以游世 | traverser la vie avec humilité |
| 782 | 走一步看一步 | avancer pas à pas |
| 844 | 功夫不负有心人 | à cœur vaillant rien d'impossible |
| 845 | 牵一发而动全身 | tout tient à un fil |
| 898 | 登高必自卑 | gravir haut part du bas |
| 1011 | 大直若屈大巧若拙 | droiture et talent véritables paraissent simples |
| 1090 | 靡不有初鲜克有终 | beaucoup commencent bien, peu terminent bien |
| 1092 | 贫而无谄富而无骄 | pauvre sans flatterie, riche sans arrogance |
| 1128 | 谋定而后动 | réfléchir avant d'agir |
| 1194 | 三思而后行 | réfléchir avant d'agir |
| 1206 | 行远自迩笃行不怠 | avancer sans relâche vers un but lointain |
| 1322 | 不积跬步无以至千里 | sans petits pas, pas de grande distance |
| 1369 | 温故而知新可以为师矣 | réviser l'ancien pour connaître le neuf |
| 1370 | 欲穷千里目更上一层楼 | monter plus haut pour voir plus loin |
| 1371 | 会当凌绝顶一览众山小 | atteindre le sommet, voir tout en contrebas |
| 1418 | 先天下之忧而忧 | s'inquiéter avant tous les autres |
| 1426 | 君子务本本立而道生 | se concentrer sur l'essentiel, et la voie suit |
| 1608 | 千磨万击还坚劲任尔东西南北风 | inébranlable face à mille épreuves |
| 1697 | 不患人之不己知患不知人也 | ne t'inquiète pas d'être méconnu |
| 1716 | 见贤思齐焉见不贤而内自省也 | imiter les vertueux, réfléchir face aux autres |
| 1729 | 宠辱不惊闲看庭前花开花落 | imperturbable, regarder les fleurs éclore et tomber |
| 1730 | 不经一番寒彻骨怎得梅花扑鼻香 | pas de parfum sans avoir enduré le froid |
| 1949 | 会挽雕弓如满月西北望射天狼 | tendre l'arc à plein, viser hardiment le défi |
| 1950 | 能近取譬可谓仁之方也已 | trouver des exemples proches, voilà la voie de la bienveillance |
| 1951 | 莫愁前路无知己天下谁人不识君 | ne crains rien, des amis t'attendent sur la route |
| 1952 | 己欲立而立人己欲达而达人 | aider autrui à se tenir debout et réussir comme soi-même |
| 1953 | 众恶之必察焉众好之必察焉 | examine par toi-même, même ce que tous détestent ou aiment |
| 1979 | 不患人之不己知患其不能也 | ne pas craindre d'être méconnu, mais de manquer de talent |
| 1980 | 先天下之忧而忧后天下之乐而乐 | s'inquiéter avant tous, se réjouir après tous |
| 2115 | 君子不以言举人不以人废言 | ne pas juger la personne aux mots, ni les mots à la personne |
| 2117 | 锲而舍之朽木不折锲而不舍金石可镂 | abandonner et même le bois mou résiste ; persévérer et même la pierre cède |
| 2144 | 举一隅不以三隅反则不复也 | si un exemple n'en suscite pas trois autres, cesser |
| 2581 | 换汤不换药 | même chose sous un autre nom |
| 2582 | 八九不离十 | à peu de chose près juste |
| 2641 | 摸着石头过河 | avancer à tâtons |
| 2774 | 百尺竿头，更进一步 | viser plus haut encore |
| 4143 | 一手交钱一手交货 | donnant-donnant |
| 4158 | 超出我们的预算 | au-dessus de notre budget |
| 4183 | 先小人后君子 | poser les règles avant de s'engager |
| 4276 | 具体问题具体分析 | au cas par cas |
| 4339 | 达成如下协议 | conviennent de ce qui suit |
| 4375 | 经研究后决定 | décidé après examen |
| 4511 | 四两拨千斤 | vaincre la force par l'adresse |
| 4773 | 穷则独善其身达则兼济天下 | dans l'épreuve, se perfectionner ; dans la réussite, aider tous |
| 4775 | 长风破浪会有时直挂云帆济沧海 | viendra le jour de fendre les flots portés par le vent |
| 4778 | 苟日新日日新又日新 | se renouveler chaque jour, sans fin |
| 4781 | 不积小流无以成江海 | sans petits ruisseaux, pas de grande mer |
| 4796 | 三十而立四十而不惑 | à trente ans, être établi ; à quarante, sans doute |
| 4797 | 五十而知天命六十而耳顺 | à cinquante ans, connaître son destin ; à soixante, tout entendre avec sérénité |
| 4798 | 七十而从心所欲不逾矩 | à soixante-dix ans, suivre son cœur sans dépasser les limites |
| 4806 | 当仁不让于师 | face à la vertu, ne pas céder même à son maître |

## Corrections sémantiques de routage

Décisions explicites par indice : 162 affectations lexicales et 160 affectations de situation. Les champs `lexicalFamilyOverride` / `situationDomainOverride` portent une raison dédiée et un statut `reviewed` ; ils corrigent les emplois figurés ou les noms mal dirigés sans toucher à la source.

Les noms concrets de nature, jardin et météo rejoignent `vocab-nature` ; films, musique, lecture et culture rejoignent `vocab-loisirs`. `vocab-maison` garde les pièces, objets et équipements du logement. Les six couleurs isolées existantes rejoignent `color`, distinct de rouge de honte, Bluetooth, feu de circulation, fleur ou fruit.

Le contrôle des 43 rubriques courantes de moins de six entrées, les erreurs constatées et les introductions proposées d’adjectifs existants sont détaillés dans [corrections-themes/fr-zh.md](../corrections-themes/fr-zh.md). Il ne prétend pas enrichir une rubrique en y déplaçant des mots hors sujet.

## Reproduction

```sh
python3 tools/maquette-guidee/classify_zh.py
python3 tools/maquette-guidee/classify_zh.py --check
```

Empreinte canonique du deck : `09ed4015f9b7b1b9d446d8ab61d205bf573a41625a5f0596ce9987f83e06d765`.

Une affectation existe exactement pour chaque indice 0–4902. Les doublons de texte ne sont pas fusionnés. Aucune phrase, lecture, traduction ou phonétique n’est produite ou retouchée par cet outil.
