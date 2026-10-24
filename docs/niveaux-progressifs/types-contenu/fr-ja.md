# Types de contenu — fr-ja

Classification candidate, sans modification du catalogue, des niveaux source, des droits ou des phonétiques.

`reviewed` signifie décision éditoriale inspectée pour la carte citée ; ce n’est ni une relecture native ni une certification de la méthode phonétique. Les autres décisions sont des candidates à règles explicites. Une réserve `review` reste à décider avant de présenter sa carte comme une phrase entière.

Une réplique peut être brève : Oui, Non, Bonjour, Merci sont autonomes dans leur échange. À l’inverse, un point final ne prouve pas qu’un nom ou un suffixe soit une phrase. `cat` et `pedagogicalStatus` sont conservés comme diagnostics et ne constituent jamais seuls la preuve du type.

| Niveau source | Cartes | utterance | vocabulary | number | incomplete | review |
|---|---:|---:|---:|---:|---:|---:|
| L1 | 290 | 59 | 204 | 4 | 23 | 0 |
| L2 | 555 | 441 | 88 | 5 | 17 | 4 |
| L3 | 571 | 382 | 172 | 6 | 5 | 6 |
| L4 | 641 | 421 | 208 | 6 | 5 | 1 |
| L5 | 688 | 450 | 221 | 6 | 10 | 1 |
| L6 | 440 | 373 | 51 | 0 | 15 | 1 |
| L7 | 517 | 470 | 40 | 0 | 6 | 1 |
| L8 | 322 | 252 | 64 | 0 | 4 | 2 |
| L9 | 227 | 175 | 49 | 0 | 3 | 0 |
| L10 | 258 | 194 | 56 | 0 | 7 | 1 |
| Total | 4509 | 3217 | 1153 | 27 | 95 | 17 |

## Cas inspectés

- `0` — いいえ。 / Non. → `utterance`. Formule entière de réponse, salutation ou politesse ; une réplique n’exige pas sujet et verbe explicites.
- `1` — はい。 / Oui. → `utterance`. Formule entière de réponse, salutation ou politesse ; une réplique n’exige pas sujet et verbe explicites.
- `2` — ありがとう。 / Merci. → `utterance`. Formule entière de réponse, salutation ou politesse ; une réplique n’exige pas sujet et verbe explicites.
- `3` — ごめんなさい。 / Désolé. → `utterance`. Formule entière de réponse, salutation ou politesse ; une réplique n’exige pas sujet et verbe explicites.
- `4` — こんにちは！ / Bonjour ! → `utterance`. Formule entière de réponse, salutation ou politesse ; une réplique n’exige pas sujet et verbe explicites.
- `5` — すみません。 / Pardon. → `utterance`. Formule entière de réponse, salutation ou politesse ; une réplique n’exige pas sujet et verbe explicites.
- `6` — すみません。 / Excusez-moi. → `utterance`. Formule entière de réponse, salutation ou politesse ; une réplique n’exige pas sujet et verbe explicites.
- `7` — ごめんなさい。 / Je suis désolé. → `utterance`. Formule entière de réponse, salutation ou politesse ; une réplique n’exige pas sujet et verbe explicites.
- `8` — ごめんなさい。 / Je suis désolé(e). → `utterance`. Formule entière de réponse, salutation ou politesse ; une réplique n’exige pas sujet et verbe explicites.
- `9` — おやすみなさい！ / Bonne nuit ! → `utterance`. Formule entière de réponse, salutation ou politesse ; une réplique n’exige pas sujet et verbe explicites.
- `15` — お願い。 / S'il te plaît. → `utterance`. お願い。 signifie ici « S’il te plaît » : demande lexicalisée entière, distincte de la carte nominale « la demande ».
- `2985` — ええと… / Eh bien… → `utterance`. ええと… est une hésitation conventionnelle complète dans l’échange ; les points indiquent l’intonation, pas un emplacement à remplir.
- `3001` — 映画は良かったけど、その代わり部屋がうるさかった。 / Le film était bien ; par contre, la salle était bruyante. → `utterance`. Deux propositions complètes malgré cat:vocab et pedagogicalStatus:fragment ; ne pas assimiler le marquage source à une analyse syntaxique.
- `3004` — お願い / la demande → `vocabulary`. お願い signifie ici le nom « la demande » ; le sens de cette carte est lexical, distinct de la réplique « S’il te plaît ».
- `3062` — 大きい / grand → `vocabulary`. 大きい est présenté comme le mot « grand » ; sa possibilité d’emploi prédicatif dans un autre contexte ne transforme pas cette carte lexicale en réplique située.
- `3063` — 小さい / petit → `vocabulary`. 小さい est présenté comme le mot « petit », sans contexte de réplique ; conserver sa fonction lexicale.
- `3201` — マジで？ / Sérieux ? → `utterance`. マジで？ est une vraie question de réaction (« Sérieux ? »), malgré son étiquette vocab.
- `3064` — 新しい / nouveau → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3065` — 古い / vieux → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3066` — 簡単 / facile → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3067` — 難しい / difficile → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3068` — 速い / rapide → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3069` — 遅い / lent → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3070` — きれい / propre → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3071` — 汚い / sale → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3072` — いっぱい / plein → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3073` — 空っぽ / vide → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3074` — 高い / cher → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3075` — 重い / lourd → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3076` — 軽い / léger → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3077` — 長い / long → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3078` — 短い / court → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3079` — 強い / fort → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3080` — 弱い / faible → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3081` — 同じ / pareil → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3082` — 違う / différent → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3083` — よく / souvent → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3084` — 時々 / parfois → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3085` — めったに / rarement → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3086` — 誰 / qui → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3087` — 何 / quoi → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3088` — どこ / où → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3089` — いつ / quand → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3090` — なぜ / pourquoi → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3091` — どうやって / comment → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3092` — どの / quel → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3093` — いくつ / combien → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3094` — もっと / plus → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3095` — より少なく / moins → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3096` — 十分 / assez → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3097` — とても / tellement → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3098` — 上に / sur → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3099` — 下に / sous → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3100` — 中に / dans → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3101` — 前に / devant → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3102` — 後ろに / derrière → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3103` — 間に / entre → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3104` — 中で / dedans → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3105` — 外で / dehors → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3106` — どこでも / partout → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3107` — それから / ensuite → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3108` — 後で / après → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3109` — 前に / avant → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3110` — 間 / pendant → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3111` — 〜以来 / depuis → `incomplete`. Liste inspectée : le marqueur lié de cette entrée exige un complément, absent de la carte.
- `3112` — もう / déjà → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3113` — まだ / encore → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3114` — ついに / enfin → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3115` — 面白い / intéressant → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3116` — つまらない / ennuyeux → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3117` — 便利 / utile → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3118` — 無駄 / inutile → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3119` — 危ない / dangereux → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3120` — 安全 / sûr → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3121` — 大切 / important → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3122` — 変 / étrange → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3123` — 普通 / normal → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3124` — 有名 / célèbre → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3125` — 人気 / populaire → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3126` — シンプル / simple → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3127` — 複雑 / compliqué → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3128` — 真面目 / sérieux → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3129` — 面白い / drôle → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3130` — 奇妙 / bizarre → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3131` — 信じられない / incroyable → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3132` — ひどい / terrible → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3133` — 快適 / confortable → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3134` — 必要 / nécessaire → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3135` — 光る / brillant → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3136` — つや消し / mat → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3137` — 明るい / clair → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3138` — 鮮やか / vif → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3139` — 薄い / pâle → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3140` — いくつかの / plusieurs → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3141` — 硬い / dur → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3142` — きつい / serré → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3143` — 広い / large → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3144` — 細い / fin → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3145` — 深い / profond → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3146` — 平ら / plat → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3147` — 丸い / rond → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3148` — まっすぐ / droit → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3149` — ゆるい / lâche → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3150` — 嫉妬深い / jaloux → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3151` — 恥ずかしい / gêné → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3152` — がっかり / déçu → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3153` — 感謝している / reconnaissant → `utterance`. La forme japonaise fournit un prédicat entier (état ou verbe conjugué), malgré une glose française adjectivale ; ne pas la transformer en simple mot-adjectif.
- `3154` — 緊張している / nerveux → `utterance`. La forme japonaise fournit un prédicat entier (état ou verbe conjugué), malgré une glose française adjectivale ; ne pas la transformer en simple mot-adjectif.
- `3155` — 罪悪感がある / coupable → `utterance`. La forme japonaise fournit un prédicat entier (état ou verbe conjugué), malgré une glose française adjectivale ; ne pas la transformer en simple mot-adjectif.
- `3156` — 一人 / seul → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3157` — 好奇心が強い / curieux → `utterance`. La forme japonaise fournit un prédicat entier (état ou verbe conjugué), malgré une glose française adjectivale ; ne pas la transformer en simple mot-adjectif.
- `3158` — いっぱいいっぱい / dépassé → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3159` — 満足 / satisfait → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3160` — 待ちきれない / impatient → `utterance`. La forme japonaise fournit un prédicat entier (état ou verbe conjugué), malgré une glose française adjectivale ; ne pas la transformer en simple mot-adjectif.
- `3161` — もうすぐ / bientôt → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3162` — 最近 / récemment → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3163` — しかし / cependant → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3164` — それでも / pourtant → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3165` — だから / donc → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3166` — 要するに / bref → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3167` — それにもかかわらず / néanmoins → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3168` — 独身 / célibataire → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3169` — 一 / un → `number`. Liste inspectée : cette carte donne un nombre ou ordinal seul, à séparer des phrases qui l’emploient.
- `3170` — 二 / deux → `number`. Liste inspectée : cette carte donne un nombre ou ordinal seul, à séparer des phrases qui l’emploient.
- `3171` — 三 / trois → `number`. Liste inspectée : cette carte donne un nombre ou ordinal seul, à séparer des phrases qui l’emploient.
- `3172` — 一番目 / premier → `number`. Liste inspectée : cette carte donne un nombre ou ordinal seul, à séparer des phrases qui l’emploient.
- `3173` — 家 / la maison → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3174` — ドア / la porte → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3175` — 部屋 / la chambre → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3176` — おばあさん / la grand-mère → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3177` — 夏 / l'été → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3178` — 空気 / l'air → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3179` — 地球 / la Terre → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3180` — 頭 / la tête → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3181` — 手 / la main → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3182` — 血 / le sang → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3183` — 妻 / la femme → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3184` — 赤ちゃん / un bébé → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3185` — 子供 / un enfant → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3186` — 男の人 / un homme → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3187` — 女の人 / une femme → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3188` — 女の子 / une fille → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3189` — 車 / la voiture → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3190` — 水 / l'eau → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3191` — まず / d'abord → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3192` — おじいさん / le grand-père → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3193` — 孫息子 / le petit-fils → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3194` — 孫娘 / la petite-fille → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3195` — 幼児 / un tout-petit → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `3196` — 人々 / les gens → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `48` — どうぞ。 / Vas-y. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `323` — まあまあ。 / Plus ou moins. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `362` — 彼によろしく。 / Dis-lui bonjour. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `397` — その通りだね。 / T'as raison. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `475` — 好きなように。 / Comme tu veux. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `512` — お大事に。 / Prends soin de toi. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `534` — これ味見してみて！ / Goûte ça ! → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `568` — もう行かないと。 / Faut que j'y aille. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `783` — 滑りますよ、気をつけて。 / Attention, ça glisse. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `816` — 一つずつ。 / Chaque chose en son temps. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `819` — やっと来たね！ / Enfin, tu es arrivé ! → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `1623` — 羹に懲りて膾を吹く。 / Chat échaudé craint l'eau froide. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `1708` — 為せば成る。 / Vouloir, c'est pouvoir. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `1746` — 子供たちによろしくね。 / Embrasse les enfants pour moi. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `1833` — まず、来てくれてありがとう。 / Tout d'abord, merci d'être venus. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `1876` — そう言うなら。 / Si tu le dis. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `2102` — 文句を言う代わりに、手伝って。 / Au lieu de te plaindre, aide-moi. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `2201` — 郷に入っては郷に従え。 / À Rome, fais comme les Romains. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `2271` — 待てば海路の日和あり。 / Tout vient à point à qui sait attendre. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `2272` — 急がば回れ。 / Rien ne sert de courir, il faut partir à point. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `2274` — 人それぞれの見方がありますからね。 / Chacun voit midi à sa porte. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `2279` — さあ、行きましょう、遅いですから。 / Allez, on y va, il est tard. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `2280` — ちりも積もれば山となる。 / Petit à petit, l'oiseau fait son nid. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `2296` — 準備ができたら電話して。 / Appelle-moi quand tu seras prêt. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `2298` — 果物を食べて、例えばりんごとか。 / Prends un fruit, par exemple une pomme. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `2299` — 上着を持って、でないと寒いよ。 / Prends une veste, sinon tu vas avoir froid. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `2350` — — 明日来ますか？ — はい、必ず。 / — Tu vas venir demain ? — Oui, sans faute. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `2369` — 宿題を終わらせて、それから遊んでいいよ。 / Finis tes devoirs, ensuite tu pourras jouer. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `2392` — — コーヒーはいかがですか？ — はい、喜んで。 / — Tu veux un café ? — Oui, volontiers. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `2393` — — 元気ですか？ — はい、元気です、ありがとう。 / — Ça va ? — Oui, ça va bien, merci. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `2394` — — うまくいきましたか？ — 予想以上に。 / — Ça s'est bien passé ? — Mieux que prévu. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `2395` — — 日本語を話しますか？ — はい、少しだけ。 / — Tu parles français ? — Oui, un petit peu. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `2396` — — よく眠れましたか？ — はい、ぐっすり。 / — Tu as bien dormi ? — Oui, comme un bébé. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `2515` — 問題があったら、電話してね。 / En cas de problème, appelle-moi. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `2516` — 時間があったら、電話してね。 / Si tu as le temps, appelle-moi. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `2567` — せっかくいるんだから、手伝って。 / Tant que tu es là, aide-moi. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `2573` — 加える前に卵を混ぜて。 / Bats les œufs avant de les ajouter. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `2625` — 時間を節約するために前もって準備して。 / Prépare tout d'avance afin de gagner du temps. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `2637` — — どこで会いましょうか？ — いつも通り、駅の前で。 / — On se retrouve où ? — Devant la gare, comme d'habitude. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `2638` — — どうしましたか？ — 何でもない、ちょっと疲れただけ。 / — Qu'est-ce qui ne va pas ? — Rien, juste un peu de fatigue. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `2644` — — 何が言いたいの？ — 最後まで聞いて、わかりますから。 / — Où est-ce que tu veux en venir ? — Laisse-moi finir, tu vas comprendre. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `2646` — — 彼のこと覚えていますか？ — なんとなく、昔のことなので。 / — Tu te souviens de lui ? — Vaguement, ça remonte à loin. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `2674` — 何かあれば遠慮なく。 / N'hésite pas si besoin. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `2858` — 知っていたら、来たのに。 / Si j'avais su, je serais venu. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `2911` — — 開けてもいいですか？ — どうぞどうぞ。 / — Ça ne te dérange pas si j'ouvre ? — Pas du tout, vas-y. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `2924` — 知っていたら、もっと早く来たのに。 / Si j'avais su, je serais venu plus tôt. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `2953` — 早く！ / Vite ! → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `2954` — とてもいい。 / Très bien. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `2955` — すごい！ / Super ! → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `2956` — 私も。 / Moi aussi. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `2963` — お先にどうぞ。 / Après vous. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `2968` — 悪くない。 / Pas mal. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `2983` — やっと！ / Enfin ! → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `2997` — まったくその通り。 / Tout à fait. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `3006` — やってみて。 / Essaie. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `3008` — その通り。 / Exactement. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `3202` — 多分後で。 / Peut-être plus tard. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `3207` — 仕事頑張って。 / Travaille bien. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `3218` — 今すぐに。 / Tout de suite. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `3267` — はいはい。 / Ben voyons. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `3354` — 落ち着いて。 / Tranquille. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `3563` — 座って。 / Assieds-toi. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `3569` — 彼を知っているなら、電話して。 / Puisque tu le connais, appelle-le. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `3575` — 喜んで。 / Avec joie. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `3774` — 落ち着いて。 / Calme-toi. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `3813` — いい夢を。 / Fais de beaux rêves. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `3817` — 落ち着いていて。 / Reste posé. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `4064` — キャッチして！ / Attrape ! → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `4092` — 電話してね。 / Appelle-moi. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `4159` — リラックスして。 / Détends-toi. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `4180` — よく狙って。 / Vise bien. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `4183` — ここで止まって。 / Arrête-toi ici. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `4195` — ついてきて。 / Suis-moi. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `4240` — ゆっくり休んでね。 / Repose-toi bien. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `4242` — もう忘れなよ。 / Laisse béton. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `4311` — ほどほどにね。 / Vas-y mollo. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `4502` — 召し上がれ！ / Régale-toi ! → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `4508` — 雨降って地固まる。 / Après la pluie, le beau temps. → `utterance`. Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.
- `210` — 今朝 / ce matin → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `334` — 今日の午後 / cet après-midi → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `339` — つまり / c'est-à-dire → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `350` — 今年 / cette année → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `452` — ウェルダンで / bien cuit → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `459` — 朝早く / tôt le matin → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `529` — 家族全員 / toute ma famille → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `531` — あちこち / ici et là → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `690` — 遅かれ早かれ / tôt ou tard → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `926` — 大雪 / de fortes chutes de neige → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `1307` — 自由、平等、博愛。 / La liberté, l'égalité, la fraternité. → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `1377` — ドアツードア / porte à porte → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `2067` — マナーと技を兼ね備えること。 / Savoir-vivre et savoir-faire. → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `2528` — できるだけ早く / dès que possible → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `2931` — 決して。 / Jamais. → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `2933` — 今。 / Maintenant. → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `2934` — いつも。 / Toujours. → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `2935` — もう一度。 / Encore. → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `2937` — たぶん。 / Peut-être. → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `2939` — 前に。 / Avant. → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `2940` — 後で。 / Après. → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `2941` — たくさん。 / Beaucoup. → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `2950` — 実は。 / En fait. → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `2957` — 少し。 / Un peu. → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `2964` — 私の父。 / Mon père. → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `2967` — 正直に。 / En vrai. → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `2973` — 私の母。 / Ma mère. → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `2975` — 夜に。 / Le soir. → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `2977` — いつか。 / Un jour. → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `2978` — 今晩 / ce soir → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `3005` — いつでも。 / N'importe quand. → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `3013` — 同じものを。 / La même chose. → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `3018` — どちらか。 / L'un ou l'autre. → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `3023` — 朝に。 / Le matin. → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `3033` — まっすぐ。 / Tout droit. → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `3039` — 一週間。 / Une semaine. → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `3040` — 一泊で。 / Pour une nuit. → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `3061` — インターネット / internet → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `3211` — 最悪の場合。 / Au pire. → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `3252` — 明日から。 / À partir de demain. → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `3254` — 五分後に。 / Dans cinq minutes. → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `3259` — 昔 / il y a longtemps → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `3266` — 飛行機で。 / Par avion. → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `3339` — 片道で。 / Un aller simple. → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `3347` — シングルルームを。 / Une chambre simple. → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `3379` — 将来的に。 / À l'avenir. → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `3385` — どうやら。 / Apparemment. → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `3561` — 午後に。 / L'après-midi. → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `3562` — 食事の前に。 / Avant les repas. → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `3564` — 食事の後に。 / Après les repas. → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `3805` — 幸いなことに。 / Heureusement. → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `4220` — 一目惚れする。 / Avoir le coup de foudre. → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `4235` — 美容院で。 / Chez le coiffeur. → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `4402` — 船便で。 / Par voie maritime. → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `4468` — パリの街をぶらぶら歩く。 / Flâner dans les rues de Paris. → `vocabulary`. Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.
- `357` — 多すぎる / trop de → `incomplete`. Cadre ou préface inspecté : condition, quantité ou reprise qui attend son contenu principal ; celui-ci ne figure pas dans la carte. Ne pas inventer une suite ni une phonétique.
- `1639` — できれば。 / Si possible. → `incomplete`. Cadre ou préface inspecté : condition, quantité ou reprise qui attend son contenu principal ; celui-ci ne figure pas dans la carte. Ne pas inventer une suite ni une phonétique.
- `1640` — できれば。 / Si je peux. → `incomplete`. Cadre ou préface inspecté : condition, quantité ou reprise qui attend son contenu principal ; celui-ci ne figure pas dans la carte. Ne pas inventer une suite ni une phonétique.
- `1641` — よかったら。 / Si tu veux. → `incomplete`. Cadre ou préface inspecté : condition, quantité ou reprise qui attend son contenu principal ; celui-ci ne figure pas dans la carte. Ne pas inventer une suite ni une phonétique.
- `1642` — よければ。 / Si tu es d'accord. → `incomplete`. Cadre ou préface inspecté : condition, quantité ou reprise qui attend son contenu principal ; celui-ci ne figure pas dans la carte. Ne pas inventer une suite ni une phonétique.
- `1903` — 時間があれば。 / Si tu as le temps. → `incomplete`. Cadre ou préface inspecté : condition, quantité ou reprise qui attend son contenu principal ; celui-ci ne figure pas dans la carte. Ne pas inventer une suite ni une phonétique.
- `1910` — 興味があれば。 / Si ça t'intéresse. → `incomplete`. Cadre ou préface inspecté : condition, quantité ou reprise qui attend son contenu principal ; celui-ci ne figure pas dans la carte. Ne pas inventer une suite ni une phonétique.
- `2215` — よろしければ。 / Si ça ne te dérange pas. → `incomplete`. Cadre ou préface inspecté : condition, quantité ou reprise qui attend son contenu principal ; celui-ci ne figure pas dans la carte. Ne pas inventer une suite ni une phonétique.
- `2530` — 遅すぎなければ。 / Si ce n'est pas trop tard. → `incomplete`. Cadre ou préface inspecté : condition, quantité ou reprise qui attend son contenu principal ; celui-ci ne figure pas dans la carte. Ne pas inventer une suite ni une phonétique.
- `2831` — 前回のメールでお伝えした通り。 / Comme indiqué dans mon précédent message. → `incomplete`. Cadre ou préface inspecté : condition, quantité ou reprise qui attend son contenu principal ; celui-ci ne figure pas dans la carte. Ne pas inventer une suite ni une phonétique.
- `2851` — できれば金曜日までに。 / Si possible, avant vendredi. → `incomplete`. Cadre ou préface inspecté : condition, quantité ou reprise qui attend son contenu principal ; celui-ci ne figure pas dans la carte. Ne pas inventer une suite ni une phonétique.
- `3779` — 先日の話の続きですが。 / Suite à notre conversation. → `incomplete`. Cadre ou préface inspecté : condition, quantité ou reprise qui attend son contenu principal ; celui-ci ne figure pas dans la carte. Ne pas inventer une suite ni une phonétique.
- `2505` — お返事をお待ちしております。 / Dans l'attente de votre réponse... → `utterance`. お返事をお待ちしております。 est une formule japonaise entière ; les points dans sa traduction française n’ouvrent aucun trou dans le texte appris.
- `4143` — 契約条件は以下の通りです。 / Les termes du contrat sont... → `utterance`. 契約条件は以下の通りです。 contient la prédication entière « les conditions sont les suivantes » ; la liste qu’elle peut annoncer n’est pas un trou grammatical de la carte.

## Limites

Les finales natives et le sens source évitent de confondre les listes lexicales avec les phrases finies. Les réponses elliptiques et les formes liées sans marqueur explicite restent le point à revoir. Aucun nombre situé dans une phrase n’est extrait ni reconstruit. Les 56 cartes `basics` contiennent aussi couleurs et dates : cette catégorie ne signifie pas « nombre ». Les champs phonétiques restent intégralement dans leur source ; le présent lot ne les calcule pas.

Les comptes ci-dessus suivent `lv` source, pas le reclassement éditorial candidat. Le builder doit calculer les comptes par niveau éditorial après avoir joint les décisions par `sourceIndex`.

Empreinte canonique du deck : `9eeb1866e121998c2ec46f3a9d5bb41fbbdf329153fab85436feb1d140dd09e4`.

## Réserves conservées

Ces cartes restent hors d’une certification de phrase entière tant que leur fonction dans une scène n’est pas tranchée.

| Index | Forme étudiée | Sens source |
|---:|---|---|
| 103 | それで。 | Du coup. |
| 191 | ところで。 | Au fait. |
| 327 | 念のため。 | Au cas où. |
| 592 | ほんの少し。 | Juste un peu. |
| 593 | 一日二回。 | Deux fois par jour. |
| 598 | 向かい側に。 | En face. |
| 601 | 進入禁止 | sens interdit |
| 621 | そのうちに。 | Un de ces jours. |
| 689 | 遅かれ早かれ。 | Tôt ou tard. |
| 826 | 辛さ控えめで。 | Pas trop épicé. |
| 1802 | 取り扱い注意。 | Manipuler avec soin. |
| 2401 | やってみたと言うためだけですけどね。 | Histoire de dire qu'on a essayé. |
| 3223 | 私の大切な人。 | Mon cœur. |
| 3792 | お肉は抜きで。 | Pas de viande. |
| 4226 | もういいから。 | Arrête ton char. |
| 4271 | お約束の通り。 | Comme convenu. |
| 4495 | やる気が出ない。 | Avoir la flemme. |

## Sous-familles lexicales

Ces trois familles décrivent la forme native et son usage source, pas une traduction grammaticale automatique depuis le français. Une phrase prédicative reste `utterance`. Un suffixe sans support reste `incomplete`, jamais un mot-préposition autonome.

`preposition` est une famille de repères relationnels : en japonais/coréen, les formes retenues sont surtout des groupes nominaux avec particule. Cette clé technique ne prétend pas que ces langues utilisent les prépositions françaises. Les noms de couleur et de temps ne deviennent pas automatiquement adjectifs/adverbes. `uncertain` réserve la sous-famille sans forcer une analyse.

| Niveau source | adjective | preposition | adverb | other | uncertain |
|---|---:|---:|---:|---:|---:|
| L1 | 57 | 13 | 22 | 77 | 35 |
| L2 | 2 | 2 | 2 | 64 | 18 |
| L3 | 0 | 0 | 0 | 156 | 16 |
| L4 | 1 | 0 | 0 | 189 | 18 |
| L5 | 0 | 1 | 0 | 215 | 5 |
| L6 | 0 | 0 | 0 | 47 | 4 |
| L7 | 0 | 0 | 0 | 37 | 3 |
| L8 | 0 | 0 | 0 | 59 | 5 |
| L9 | 0 | 0 | 0 | 46 | 3 |
| L10 | 0 | 1 | 0 | 48 | 7 |
| Total | 60 | 17 | 24 | 938 | 114 |

La présence d’une famille à chaque niveau ne se déduit pas de cette table. Le builder ne doit pas remplir un thème vide avec une forme liée ou une phrase dupliquée. Les réserves de sous-famille restent accessibles au dossier de Claude.
