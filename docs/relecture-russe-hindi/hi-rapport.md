# Relecture par sondage — Hindi

30 octobre 2026. Numéro = position **globale, à partir de 1**, dans le fichier JSON reçu. Le niveau est le champ `lv` réel ; les niveaux ne sont pas tous contigus dans le fichier hindi. Les cartes importées restent inchangées.

Lecture de 50 cartes par niveau (500 au total), espacées régulièrement dans chaque niveau : texte cible, guides anglais/français, traductions anglaise/française/japonaise/coréenne. Contrôle complémentaire des autres traductions et conventions phonétiques pour les écarts repérés ; ce sondage ne constitue pas une certification exhaustive des 15 champs. Aucun audio natif de référence n’a été confronté aux guides.

Les numéros exacts de l’échantillon figurent dans `validation.json`. Les propositions « à arbitrer » dépendent du contexte ou de la convention éditoriale et ne sont pas des corrections certaines.

## L1

### N° 41 — मैं छात्रा हूँ।

**À arbitrer.** छात्रा désigne une étudiante, mais les traductions neutres ne portent pas le marqueur de genre annoncé dans le brief, contrairement aux autres phrases à la première personne.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `en` | I'm a student. | I'm a student. (female) |
| `jam` | 学生です。 | 学生です。（女性） |
| `kom` | 저는 학생이에요. | 저는 학생이에요. (여) |

### N° 87 — मैं थकी हुई हूँ।

**Correction recommandée.** La locutrice est féminine, mais l’adjectif français est au masculin malgré le marqueur « femme ».

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `frm` | Je suis fatigué. (femme) | Je suis fatiguée. (femme) |

### N° 231 — क्या मुझे … मिल सकता है?

**Correction recommandée.** Le gabarit hindi demande d’obtenir quelque chose ; le japonais et le coréen demandent une permission de faire une action. Le français ne précise pas avoir/obtenir.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `frm` | Est-ce que je peux… ? | Est-ce que je peux avoir… ? |
| `jam` | ～してもいいですか？ | ～をいただけますか？ |
| `kom` | …해도 돼요? | …을/를 받을 수 있나요? |

## L2

### N° 617 — जूते

**Correction recommandée.** जूते désigne les chaussures en général ; « chaussures de ville » et 구두 restreignent inutilement à un type de chaussures.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `frm` | les chaussures (de ville) | les chaussures |
| `kom` | 구두 | 신발 |

## L3

### N° 1216 — माफ़ कीजिए, मैं नहीं आ सकता।

**Correction recommandée.** नहीं आ सकता signifie ne pas pouvoir venir ; les traductions anglaise et française omettent ce verbe et atténuent l’excuse explicite माफ़ कीजिए.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `en` | Unfortunately, I can't. (male) | I'm sorry, I can't come. (male) |
| `frm` | Malheureusement, je ne peux pas. (homme) | Je suis désolé, je ne peux pas venir. (homme) |

## L4

### N° 1535 — निदेशक

**À arbitrer.** Le terme निदेशक est plus général que le président d’une entreprise : 社長 et 사장 supposent un contexte particulier.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `jam` | 社長 | Confirmer le contexte ; 取締役 pour un administrateur de société, ou le titre de direction approprié. |
| `kom` | 사장 | Confirmer le contexte ; 이사 pour un administrateur de société, ou le titre de direction approprié. |

### N° 1644 — तय करना

**Correction recommandée.** तय करना signifie décider/fixer, pas résoudre un problème au sens de solve / 解く / 풀다.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `en` | to decide / solve | to decide / determine |
| `frm` | décider / résoudre | décider / fixer |
| `esm` | decidir / resolver | decidir / fijar |
| `itm` | decidere / risolvere | decidere / stabilire |
| `cn` | 决定；解决 | 决定；确定 |
| `jam` | 決める / 解く | 決める／定める |
| `kom` | 결정하다 / 풀다 | 결정하다 / 정하다 |

### N° 1801 — अंपायर ने ग़लत फ़ैसला दिया।

**Correction recommandée.** Le hindi dit que l’arbitre a pris une mauvaise décision, pas nécessairement qu’il a été injuste ou partial.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `en` | The referee was unfair. | The umpire made an incorrect call. |
| `frm` | L'arbitre était injuste. | L’arbitre a pris une mauvaise décision. |
| `esm` | El árbitro fue injusto. | El árbitro tomó una decisión equivocada. |
| `itm` | L'arbitro è stato ingiusto. | L’arbitro ha preso una decisione sbagliata. |
| `cn` | 裁判不公平。 | 裁判作出了错误判定。 |
| `jam` | 審判が不公平でした。 | 審判の判定が間違っていました。 |
| `kom` | 심판이 불공평했어요. | 심판이 잘못된 판정을 내렸어요. |

### N° 1837 — कहानी

**Correction recommandée.** कहानी est une histoire ; les références au conte de fées ou à la fable restreignent le sens.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `en` | the fairy tale | the story |
| `itm` | la favola | il racconto |
| `cn` | 童话 | 故事 |
| `jam` | おとぎ話 | 物語 |
| `kom` | 동화 | 이야기 |

### N° 1849 — गिरजाघर

**Correction recommandée.** गिरजाघर signifie église ; aucune précision ne désigne une cathédrale.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `en` | the cathedral | the church |
| `frm` | la cathédrale | l’église |
| `esm` | la catedral | la iglesia |
| `itm` | la cattedrale | la chiesa |
| `cn` | 大教堂 | 教堂 |
| `jam` | 大聖堂 | 教会 |
| `kom` | 대성당 | 교회 |

### N° 2019 — आँधी-तूफ़ान आया था।

**À arbitrer.** आँधी-तूफ़ान indique une tempête de vent ; les traductions ajoutent explicitement tonnerre ou orage.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `en` | There was a thunderstorm. | There was a storm. |
| `frm` | Il y a eu un orage. | Il y a eu une tempête. |
| `jam` | 雷雨がありました。 | 嵐がありました。 |
| `kom` | 천둥번개가 쳤어요. | 폭풍이 몰아쳤어요. |

## L5

### N° 2084 — मैं डॉक्टर बनना चाहती थी।

**À arbitrer.** चाहती थी indique une locutrice, mais les traductions ne portent pas le marqueur féminin annoncé dans le brief.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `en` | I dreamed of becoming a doctor. | I dreamed of becoming a doctor. (female) |
| `frm` | Je rêvais de devenir médecin. | Je rêvais de devenir médecin. (femme) |
| `jam` | 医者になるのが夢でした。 | 医者になるのが夢でした。（女性） |
| `kom` | 의사가 되는 게 꿈이었어요. | 의사가 되는 게 꿈이었어요. (여) |

### N° 2195 — नमक और मिर्च डालो।

**À arbitrer.** मिर्च désigne normalement le piment ; les traductions du groupe sel-poivre visent le poivre noir.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `t` | नमक और मिर्च डालो। | Confirmer le condiment : si le poivre noir est voulu, नमक और काली मिर्च डालो। ; sinon aligner les traductions sur le piment. |

### N° 2223 — काली मिर्च

**Correction recommandée.** काली मिर्च est le poivre noir ; les sens poivron / pimiento / peperone / ピーマン / 고추 sont incorrects.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `frm` | le poivre / poivron | le poivre noir |
| `esm` | la pimienta / el pimiento | la pimienta negra |
| `itm` | il pepe / peperone | il pepe nero |
| `cn` | 胡椒；辣椒 | 黑胡椒 |
| `jam` | 胡椒 / ピーマン | 黒胡椒 |
| `kom` | 후추 / 고추 | 후추 |

### N° 2348 — हड्डी का विभाग कहाँ है?

**À arbitrer.** Le hindi demande le service des os (orthopédie), tandis que les traductions désignent la traumatologie en général.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `en` | Where's the trauma department? | Where is the orthopaedics department? |
| `frm` | Où est le service de traumatologie ? | Où est le service d’orthopédie ? |
| `esm` | ¿Dónde está traumatología? | ¿Dónde está el servicio de ortopedia? |
| `itm` | Dov'è il reparto di traumatologia? | Dov’è il reparto di ortopedia? |
| `cn` | 创伤科在哪里？ | 骨科在哪里？ |
| `jam` | 外傷科はどこですか？ | 整形外科はどこですか？ |
| `kom` | 외상과는 어디예요? | 정형외과는 어디예요? |

### N° 2543 — मैं बजट बनाकर चलती हूँ।

**Correction recommandée.** Le hindi signifie vivre en suivant un budget ; tenir un livre de comptes n’est pas la même activité.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `jam` | 家計簿をつけています。（女性） | 予算を立て、それに沿って生活しています。（女性） |
| `kom` | 가계부를 써요. (여) | 예산을 세우고 그에 맞춰 생활해요. (여) |

### N° 2613 — पड़ोसन

**À arbitrer.** पड़ोसन désigne une voisine ; l’anglais et le japonais ne rendent pas le genre, contrairement au français et au coréen.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `en` | the neighbor | the female neighbor |
| `jam` | 隣人 | 隣人（女性） |

### N° 2641 — मैं आपके पौधों को पानी दे रहा हूँ।

**Correction recommandée.** पौधों signifie plantes ; le français, l’anglais, l’italien, le chinois, le japonais et le coréen disent fleurs. L’espagnol dit déjà plantas.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `en` | I'm watering your flowers. (male) | I’m watering your plants. (male) |
| `frm` | J'arrose vos fleurs. (homme) | J’arrose vos plantes. (homme) |
| `itm` | Annaffio i vostri fiori. (uomo) | Annaffio le vostre piante. (uomo) |
| `cn` | 我在给您的花浇水。（男） | 我在给您的植物浇水。（男） |
| `jam` | あなたの花に水をやっています。（男性） | あなたの植物に水をやっています。（男性） |
| `kom` | 당신 꽃에 물을 주고 있어요. (남) | 당신이 키우는 식물에 물을 주고 있어요. (남) |

## L6

### N° 2766 — क्या मैं एक बात स्पष्ट कर सकती हूँ?

**À arbitrer.** Le hindi propose de clarifier un point ; 確認 et 확인 peuvent être compris comme vérifier ou demander confirmation.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `jam` | 一つ細かい点を確認してもいいですか？（女性） | 一点、説明を補ってもよろしいでしょうか？（女性） |
| `kom` | 한 가지 세부 사항을 확인해도 될까요? (여) | 한 가지만 명확히 설명해도 될까요? (여) |

### N° 2837 — इससे बुरा भी हो सकता था।

**Correction recommandée.** हो सकता था exprime une possibilité passée (« aurait pu être pire »), alors que les traductions sont au présent.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `en` | It could be worse. | It could have been worse. |
| `frm` | Ça pourrait être pire. | Ça aurait pu être pire. |
| `jam` | もっと悪いこともある。 | もっと悪くなっていたかもしれません。 |
| `kom` | 더 나쁠 수도 있어. | 더 나쁠 수도 있었어요. |

### N° 2846 — वह अपनी ग़लतियाँ नहीं मानता।

**À arbitrer.** Le hindi constate qu’il ne reconnaît pas ses erreurs ; les traductions ajoutent une incapacité ou le fait de ne pas savoir le faire.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `en` | He can't admit his mistakes. | He doesn’t admit his mistakes. |
| `frm` | Il ne sait pas reconnaître ses erreurs. | Il ne reconnaît pas ses erreurs. |
| `jam` | 彼は過ちを認められません。 | 彼は自分の過ちを認めません。 |
| `kom` | 그는 실수를 인정할 줄 몰라요. | 그는 자신의 실수를 인정하지 않아요. |

### N° 3141 — इमरजेंसी सर्विस को फ़ोन करो।

**Correction recommandée.** Le coréen ajoute un service de réparation, absent de la demande hindi générique de service d’urgence.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `kom` | 긴급 수리 서비스에 전화하세요. | 긴급 서비스에 전화하세요. |

## L7

### N° 3404 — मैं काम से थककर चूर हो गया।

**À arbitrer.** थककर चूर हो गया exprime un épuisement intense ; les traductions peuvent être comprises comme un burn-out durable ou clinique.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `en` | I burned out at work. (male) | Work left me completely exhausted. (male) |
| `frm` | J'ai fait un burn-out. (homme) | Je suis complètement épuisé par le travail. (homme) |
| `jam` | 仕事で燃え尽きました。（男性） | 仕事でへとへとになりました。（男性） |
| `kom` | 직장에서 번아웃됐어요. (남) | 일하느라 완전히 지쳤어요. (남) |

### N° 3482 — कम से कम मैंने कोशिश की।

**Correction recommandée.** कम से कम signifie au moins ; les traductions utilisent en tout cas / quoi qu’il en soit.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `en` | At any rate, I tried. | At least I tried. |
| `frm` | En tout cas, j'ai essayé. | Au moins, j’ai essayé. |
| `jam` | とにかく、やってみました。 | 少なくとも挑戦はしました。 |
| `kom` | 어쨌든 시도는 했어요. | 적어도 시도는 했어요. |

### N° 3491 — मेरा बेटा बोर्ड परीक्षा की तैयारी कर रहा है।

**À arbitrer.** Les board exams sont des examens scolaires indiens, qui ne relèvent pas nécessairement d’un organisme national ; 국가 시험 peut suggérer un concours ou une qualification professionnelle.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `frm` | Mon fils prépare les examens nationaux. | Mon fils prépare les examens de fin de cycle du secondaire. |
| `kom` | 아들이 국가 시험을 준비하고 있어요. | 아들이 중등학교 졸업시험(보드 시험)을 준비하고 있어요. |

## L8

### N° 3608 — ज्यों ही कोई …, …

**Correction recommandée.** ज्यों ही exprime dès que ; plusieurs traductions expriment une condition suffisante (il suffit de), ce qui change le connecteur.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `frm` | Il suffit de… pour que… | Dès que quelqu’un…, … |
| `esm` | Basta con… para que… | En cuanto alguien…, … |
| `itm` | Basta… perché… | Non appena qualcuno…, … |
| `cn` | 只要……就…… | 某人一……就…… |
| `kom` | …하기만 하면… | 누군가 …하자마자… |

### N° 3723 — बारिश में हम पूरी तरह भीग गए।

**Correction recommandée.** La phrase dit que nous avons été complètement trempés ; comme des idiots ajoute un jugement absent.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `frm` | On s'est fait prendre par la pluie comme des idiots. | Nous avons été complètement trempés par la pluie. |

### N° 3829 — मैं उनका एहसानमंद हूँ।

**Correction recommandée.** एहसानमंद exprime la gratitude ou le fait d’être redevable ; toutes les traductions ajoutent tout et certaines imposent une femme, alors que उनका peut être honorifique ou pluriel.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `en` | I owe her everything. | I’m grateful to them. |
| `frm` | Je lui dois tout. | Je leur suis reconnaissant / reconnaissante. |
| `esm` | Se lo debo todo. | Les estoy agradecido/a. |
| `itm` | Le devo tutto. | Sono loro grato/a. |
| `cn` | 我的一切都归功于她。 | 我很感激他们。 |
| `jam` | 彼女にはすべてを負っています。 | あの方には感謝しています。 |
| `kom` | 저는 그분께 모든 걸 빚졌어요. | 그분께 감사하고 있어요. |

### N° 3935 — दोस्ती पक्की!

**Correction recommandée.** दोस्ती पक्की scelle une amitié ; le mot paix est absent. Traduire une amitié conclue ou solide.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `en` | Peace and friendship! | Friends for good! |
| `frm` | Paix et amitié ! | Amis pour de bon ! |
| `esm` | ¡Paz y amistad! | ¡Amigos de verdad! |
| `itm` | Pace e amicizia! | Amici per davvero! |
| `cn` | 和平与友谊！ | 说定了，我们是朋友！ |
| `jam` | 平和と友情を！ | これで友達だね！ |
| `kom` | 평화와 우정을! | 우리 이제 확실히 친구야! |

## L9

### N° 4010 — अगर बात यहाँ तक पहुँची, तो …

**Correction recommandée.** Le modèle signifie si les choses en arrivent là, et non tant qu’à faire / puisque nous en parlons.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `frm` | Tant qu'à faire, … | Si les choses en arrivent là, … |
| `esm` | Ya puestos, … | Si las cosas llegan a ese punto, … |
| `itm` | Se proprio vogliamo dirla tutta, … | Se si arriva a quel punto, … |
| `kom` | 말이 나왔으니 말인데… | 상황이 거기까지 이르면… |
| `cn` | 既然说到这个份上…… | 如果事情到了那个地步，…… |

### N° 4024 — स्थायी

**Correction recommandée.** स्थायी signifie permanent ou durable ; constant / incessant ne rend pas nécessairement la permanence.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `en` | constant | permanent / lasting |
| `frm` | constant | permanent / durable |
| `esm` | constante | permanente / duradero |
| `itm` | costante | permanente / duraturo |
| `jam` | 絶え間ない | 永続的な / 恒久的な |
| `kom` | 지속적인 | 영구적인 / 지속적인 |
| `cn` | 持续的 | 永久的；持久的 |

### N° 4070 — अपेक्षाकृत

**Correction recommandée.** अपेक्षाकृत est comparatif (relativement / par comparaison), plutôt qu’un simple degré assez ou très.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `en` | fairly | relatively / comparatively |
| `frm` | assez | relativement / comparativement |
| `esm` | bastante | relativamente / comparativamente |
| `itm` | abbastanza | relativamente / in confronto |
| `jam` | かなり | 比較的 / 相対的に |
| `kom` | 꽤 | 비교적 / 상대적으로 |
| `cn` | 相当 | 相对而言；比较起来 |

### N° 4102 — के ज़रिए

**Correction recommandée.** के ज़रिए marque un moyen ou un intermédiaire. Les versions chinoise et coréenne décrivent une traversée physique.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `kom` | …을 뚫고 | …을/를 통해 / …에 의해 |
| `cn` | 穿过 | 通过；借助 |

## L10

### N° 4247 — अध्यादेश

**Correction recommandée.** अध्यादेश désigne une ordonnance ou un décret, notamment en droit indien ; une résolution ou une simple décision est trop large.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `en` | the resolution (decree) | the ordinance / decree |
| `esm` | la resolución | el decreto / la ordenanza |
| `cn` | 决议 | 法令；条例 |
| `jam` | 決定（政令） | 政令 / 法令 |
| `kom` | 결정(법령) | 법령 / 명령 |

### N° 4268 — कोशिका

**Correction recommandée.** कोशिका désigne une cellule biologique ; le sens cage est une fausse polysémie.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `en` | the cell / cage | the cell (biology) |
| `frm` | la cellule / cage | la cellule (biologie) |
| `esm` | la célula / jaula | la célula (biología) |
| `itm` | la cellula / gabbia | la cellula (biologia) |
| `cn` | 细胞；笼子 | 细胞 |
| `jam` | 細胞 / 檻 | 細胞 |
| `kom` | 세포 / 우리 | 세포 |

### N° 4288 — मुहैया कराना

**Correction recommandée.** मुहैया कराना signifie fournir ou mettre à disposition. Les traductions ont pris le sens juridique prévoir / stipuler de l’anglais provide for.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `en` | to provide for | to provide / supply |
| `frm` | prévoir | fournir / mettre à disposition |
| `esm` | prever | proporcionar / suministrar |
| `itm` | prevedere | fornire / mettere a disposizione |
| `cn` | 规定；预见 | 提供；供应 |
| `jam` | 定める | 提供する / 用意する |
| `kom` | 규정하다 | 제공하다 / 공급하다 |

### N° 4344 — बुद्धिमत्ता

**À arbitrer.** बुद्धिमत्ता renvoie d’abord à l’intelligence ; sagesse est une lecture possible selon le contexte, à distinguer dans cette carte de vocabulaire.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `en` | the wisdom | intelligence / wisdom (depending on context) |
| `frm` | la sagesse | l’intelligence / la sagesse (selon le contexte) |
| `esm` | la sabiduría | la inteligencia / la sabiduría (según el contexto) |
| `itm` | la saggezza | l’intelligenza / la saggezza (secondo il contesto) |
| `jam` | 知恵 | 知性 / 賢さ |
| `kom` | 지혜 | 지능 / 총명함 |
