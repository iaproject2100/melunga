# Relecture du portugais du Brésil

30 octobre 2026. Numéros globaux à partir de 1 dans `pt_deck.json` reçu. Aucune correction de ce rapport n’a été appliquée aux cartes importées.

**500 cartes examinées, 50 par niveau, plus 2 constats culturels hors échantillon : 32 constats**, dont 21 corrections recommandées et 11 points à arbitrer.

La lecture porte sur le portugais, les aides anglaise/française et les traductions anglaise/française/japonaise/coréenne. Les autres traductions ont été contrôlées pour les écarts signalés. Les numéros de l’échantillon sont dans `echantillon.json` ; deux trajets rencontrés lors du classement thématique ont été contrôlés en complément. Il ne s’agit pas d’une validation exhaustive du contenu.

Les **22 435 valeurs phonétiques** ont été régénérées par `GR(t, tr_map[t], ...)` : **zéro différence**. Cela certifie la reproduction du générateur fourni, pas la justesse linguistique de ses entrées. Aucun écart tonique certain n’a été retenu dans le sondage ; aucune valeur phonétique de remplacement n’a été rédigée à la main. Aucun audio natif de référence n’a été utilisé.

Les 64 entrées supplémentaires du fichier de translittérations ne correspondent pas à des cartes actuelles et ne sont pas importées. Les 4 487 cartes ont toutes une entrée utilisable.

## L1

### N° 93 — Estou cansada.

**Correction recommandée.** La carte est féminine ; trois traductions gardent un adjectif masculin malgré le marqueur femme.

| Champ | Valeur actuelle | Proposition |
|---|---|---|
| `frm` | Je suis fatigué. (femme) | Je suis fatiguée. (femme) |
| `esm` | Estoy cansado. (mujer) | Estoy cansada. (mujer) |
| `itm` | Sono stanco. (donna) | Sono stanca. (donna) |

### N° 271 — Eu mesma faço.

**Correction recommandée.** Le coréen omet la précision moi-même, portée par mesma.

| Champ | Valeur actuelle | Proposition |
|---|---|---|
| `kom` | 제가 할게요. (여) | 제가 직접 할게요. (여) |

## L2

### N° 562 — os sapatos

**À arbitrer.** Sapatos ne désigne pas nécessairement des chaussures en cuir ou de ville. Vérifier le type de chaussures voulu avant de conserver 皮鞋 / 구두.

| Champ | Valeur actuelle | Proposition |
|---|---|---|
| `frm` | les chaussures (de ville) | les chaussures |
| `cn` | 皮鞋 | 鞋子 |
| `kom` | 구두 | 신발 |

## L3

### N° 1319 — Tenho alergia a amendoim.

**Correction recommandée.** Amendoim désigne précisément la cacahuète, et non les noix ou les fruits à coque en général. Cette distinction doit rester explicite dans une phrase d’allergie.

| Champ | Valeur actuelle | Proposition |
|---|---|---|
| `en` | I'm allergic to nuts. | I’m allergic to peanuts. |
| `frm` | Je suis allergique aux noix. | Je suis allergique aux cacahuètes. |
| `esm` | Soy alérgico a los frutos secos. | Tengo alergia al cacahuete / maní. |
| `itm` | Sono allergico alla frutta secca. | Sono allergico/a alle arachidi. |
| `cn` | 我对坚果过敏。 | 我对花生过敏。 |
| `jam` | ナッツアレルギーがあります。 | ピーナッツアレルギーがあります。 |
| `kom` | 견과류 알레르기가 있어요. | 땅콩 알레르기가 있어요. |

## L4

### N° 1523 — Fui promovido!

**À arbitrer.** Promovido indique un locuteur masculin. Le marqueur anglais annoncé par le brief est absent ; son ajout permettrait aussi à la sélection vocale de choisir le masculin.

| Champ | Valeur actuelle | Proposition |
|---|---|---|
| `en` | I got promoted! | I got promoted! (male) |

### N° 1837 — a creche

**Correction recommandée.** Dans l’usage brésilien, une creche accueille les très jeunes enfants ; ce n’est pas une école maternelle / kindergarten. L’espagnol guardería convient déjà.

| Champ | Valeur actuelle | Proposition |
|---|---|---|
| `en` | the kindergarten | the daycare / nursery |
| `frm` | la maternelle | la crèche |
| `itm` | l'asilo | l’asilo nido |
| `cn` | 幼儿园 | 托儿所 |
| `jam` | 幼稚園 | 保育所 / 保育園 |
| `kom` | 유치원 | 어린이집 |

## L5

### N° 2084 — Eu queria ser médica.

**À arbitrer.** Médica indique une locutrice, mais le marqueur féminin manque dans le champ utilisé pour sélectionner la voix. Harmoniser avec la convention des autres variantes.

| Champ | Valeur actuelle | Proposition |
|---|---|---|
| `en` | I dreamed of becoming a doctor. | I wanted to become a doctor. (female) |

### N° 2195 — Cozinhe por vinte minutos.

**Correction recommandée.** Cozinhar signifie faire cuire ; les traductions qui imposent une cuisson par ébullition précisent une méthode absente de la phrase.

| Champ | Valeur actuelle | Proposition |
|---|---|---|
| `en` | Boil for twenty minutes. | Cook for twenty minutes. |
| `itm` | Fai bollire venti minuti. | Fai cuocere per venti minuti. |
| `cn` | 煮二十分钟。 | 烹煮二十分钟。 |
| `jam` | 20分煮て。 | 20分調理してください。 |
| `kom` | 20분 동안 끓여. | 20분 동안 조리하세요. |

### N° 2237 — Oscar Niemeyer projetou Brasília.

**À arbitrer.** La phrase attribue globalement la conception de Brasília à Niemeyer. Le plan urbain est de Lúcio Costa ; Niemeyer a conçu ses principaux bâtiments. Préciser la contribution si l’objectif est une information culturelle exacte.

| Champ | Valeur actuelle | Proposition |
|---|---|---|
| `t` | Oscar Niemeyer projetou Brasília. | Oscar Niemeyer projetou os principais edifícios de Brasília. Adapter les sept traductions si cette précision est retenue. |

### N° 2376 — o acordo

**À arbitrer.** Acordo est d’abord un accord. Un compromis en est un cas possible, qui suppose davantage le contexte de concessions réciproques.

| Champ | Valeur actuelle | Proposition |
|---|---|---|
| `en` | the compromise | the agreement / compromise (depending on context) |
| `frm` | le compromis | l’accord / le compromis (selon le contexte) |
| `esm` | el compromiso | el acuerdo |
| `itm` | il compromesso | l’accordo |
| `cn` | 妥协 | 协议；协定 |
| `jam` | 妥協 | 合意 / 協定 |
| `kom` | 타협 | 합의 / 협정 |

### N° 2418 — ganancioso

**Correction recommandée.** Ganancioso décrit l’avidité, pas seulement la réticence à dépenser exprimée par avare / tacaño / けちな.

| Champ | Valeur actuelle | Proposition |
|---|---|---|
| `frm` | avare | cupide / avide |
| `esm` | tacaño | codicioso |
| `itm` | avaro | avido |
| `jam` | けちな | 欲深い / 貪欲な |

### N° 2557 — a ação (bolsa)

**Correction recommandée.** La précision bolsa sélectionne une action boursière. Le sens promotion commerciale doit être retiré de cette carte.

| Champ | Valeur actuelle | Proposition |
|---|---|---|
| `en` | the share / promotion | the share / stock |
| `frm` | l'action / la promotion | l’action (en Bourse) |
| `esm` | la acción / la oferta | la acción (de bolsa) |
| `itm` | l'azione / la promozione | l’azione (di borsa) |
| `cn` | 股票；促销 | 股票 |
| `jam` | 株 / キャンペーン | 株式 |
| `kom` | 주식 / 할인 행사 | 주식 |

### N° 2682 — Tinha muita gente.

**Correction recommandée.** Gente signifie gens / personnes. Les traductions ajoutent un statut d’invité absent du texte.

| Champ | Valeur actuelle | Proposition |
|---|---|---|
| `en` | There were lots of guests. | There were lots of people. |
| `frm` | Il y avait beaucoup d'invités. | Il y avait beaucoup de monde. |
| `esm` | Había muchos invitados. | Había mucha gente. |
| `itm` | C'erano molti ospiti. | C’era molta gente. |
| `cn` | 客人很多。 | 人很多。 |
| `jam` | お客さんがたくさんいました。 | たくさんの人がいました。 |
| `kom` | 손님이 많았어요. | 사람이 많았어요. |

## L6

### N° 3043 — o cartório

**Correction recommandée.** Un cartório est un bureau ou service d’enregistrement / de notariat. Les traductions actuelles désignent la personne du notaire.

| Champ | Valeur actuelle | Proposition |
|---|---|---|
| `en` | the notary | the registry office / notary’s office |
| `frm` | le notaire | le bureau d’enregistrement / l’étude notariale |
| `esm` | el notario | la oficina de registro / la notaría |
| `itm` | il notaio | l’ufficio del registro / lo studio notarile |
| `cn` | 公证人 | 登记处；公证处 |
| `jam` | 公証人 | 登記所 / 公証役場 |
| `kom` | 공증인 | 등기소 / 공증 사무소 |

## L7

### N° 3366 — A Transamazônica é a estrada mais longa.

**Correction recommandée.** La Transamazônica n’est pas la plus longue route sans autre précision ; plusieurs routes brésiliennes sont plus longues. Éviter ce superlatif absolu. Adapter les sept traductions et régénérer après correction du texte.

| Champ | Valeur actuelle | Proposition |
|---|---|---|
| `t` | A Transamazônica é a estrada mais longa. | A Transamazônica é uma das estradas mais longas do Brasil. |

### N° 3367 — De São Paulo a Manaus leva três dias de barco.

**Correction recommandée.** São Paulo et Manaus ne sont pas reliées par le trajet fluvial de trois jours annoncé : São Paulo ne se trouve pas dans le bassin amazonien. Utiliser un itinéraire amazonien plausible, sans durée précise non justifiée. Adapter les sept traductions et régénérer après correction du texte.

| Champ | Valeur actuelle | Proposition |
|---|---|---|
| `t` | De São Paulo a Manaus leva três dias de barco. | De Belém a Manaus, a viagem de barco pode levar vários dias. |

### N° 3397 — Eu discutiria isso.

**À arbitrer.** Discutir isso peut signifier en discuter, ou contester selon le contexte. Les traductions retiennent toutes l’opposition ; expliciter cette intention pour une carte autonome.

| Champ | Valeur actuelle | Proposition |
|---|---|---|
| `t` | Eu discutiria isso. | Si contester est voulu : Eu contestaria isso. Sinon conserver le portugais et traduire en discuter au conditionnel. |

### N° 3519 — Cheguei tarde da noite ontem.

**Correction recommandée.** Chegar indique l’arrivée et ne précise aucun vol aérien.

| Champ | Valeur actuelle | Proposition |
|---|---|---|
| `en` | I flew in late last night. | I arrived late last night. |

## L8

### N° 3608 — Assim que alguém…, …

**Correction recommandée.** Assim que exprime dès que ; les traductions actuelles expriment une condition suffisante (il suffit de).

| Champ | Valeur actuelle | Proposition |
|---|---|---|
| `frm` | Il suffit de… pour que… | Dès que quelqu’un…, … |
| `esm` | Basta con… para que… | En cuanto alguien…, … |
| `itm` | Basta… perché… | Non appena qualcuno…, … |
| `cn` | 只要……就…… | 某人一……就…… |
| `kom` | …하기만 하면… | 누군가 …하자마자… |

### N° 3706 — sentir falta

**Correction recommandée.** Sentir falta exprime le manque de quelqu’un ou de quelque chose, et non l’ennui au sens ne rien avoir à faire.

| Champ | Valeur actuelle | Proposition |
|---|---|---|
| `en` | to miss / be bored | to miss / feel the absence of |
| `frm` | s'ennuyer / regretter | ressentir le manque de / regretter l’absence de |
| `esm` | echar de menos / aburrirse | echar de menos |
| `itm` | sentire la mancanza / annoiarsi | sentire la mancanza di |
| `cn` | 想念；无聊 | 想念；感到缺少 |
| `jam` | 寂しがる / 退屈する | 恋しく思う / …がいなくて寂しく思う |
| `kom` | 그리워하다 / 지루하다 | 그리워하다 / 빈자리를 느끼다 |

### N° 3854 — Confundo o subjuntivo.

**À arbitrer.** La formulation paraît elliptique pour dire que le subjonctif embrouille l’apprenant ; confondre appelle normalement un autre terme de comparaison. À valider en contexte.

| Champ | Valeur actuelle | Proposition |
|---|---|---|
| `t` | Confundo o subjuntivo. | Eu me confundo com o subjuntivo. |
| `frm` | Je confonds le subjonctif. | Je m’embrouille avec le subjonctif. |

### N° 3903 — Quem arrisca, vence.

**À arbitrer.** Les versions asiatiques reprennent une image de champagne absente du proverbe portugais. Le sens général est voisin, mais la tournure japonaise et coréenne est moins native qu’un équivalent courant.

| Champ | Valeur actuelle | Proposition |
|---|---|---|
| `cn` | 不冒险就喝不到香槟。 | 敢于冒险的人才能获胜。 / 不入虎穴，焉得虎子。 |
| `jam` | リスクを取らない者はシャンパンを飲めない。 | 挑戦する者が勝つ。 / 虎穴に入らずんば虎子を得ず。 |
| `kom` | 모험하지 않으면 샴페인도 없다. | 도전하는 자가 이긴다. |

## L9

### N° 4010 — Se for o caso, …

**Correction recommandée.** Se for o caso signifie si c’est le cas / le cas échéant, et non tant qu’à faire ou puisque nous en parlons.

| Champ | Valeur actuelle | Proposition |
|---|---|---|
| `frm` | Tant qu'à faire, … | Le cas échéant, … / Si c’est le cas, … |
| `esm` | Ya puestos, … | Si es el caso, … |
| `itm` | Se proprio vogliamo dirla tutta, … | Se è il caso, … |
| `cn` | 既然说到这个份上…… | 如果是这样，…… |
| `kom` | 말이 나왔으니 말인데… | 그런 경우라면… |

### N° 4084 — de ponta a ponta

**À arbitrer.** De ponta a ponta signifie d’un bout à l’autre, avec un sens spatial ou une extension figurée. Les versions complètement / de façon approfondie ne rendent pas le sens premier sans contexte.

| Champ | Valeur actuelle | Proposition |
|---|---|---|
| `en` | through and through | from end to end |
| `frm` | de part en part | d’un bout à l’autre |
| `esm` | de parte a parte | de un extremo a otro |
| `itm` | da parte a parte | da un capo all’altro |
| `cn` | 透彻地 | 从一端到另一端 |
| `jam` | すっかり | 端から端まで |
| `kom` | 속속들이 | 끝에서 끝까지 |

## L10

### N° 4247 — o decreto

**Correction recommandée.** Un decreto est un décret, pas une résolution ou une simple décision. L’italien est déjà exact.

| Champ | Valeur actuelle | Proposition |
|---|---|---|
| `en` | the resolution (decree) | the decree |
| `frm` | l'arrêté | le décret |
| `esm` | la resolución | el decreto |
| `cn` | 决议 | 法令 |
| `jam` | 決定（政令） | 政令 / 法令 |
| `kom` | 결정(법령) | 법령 |

### N° 4257 — a queda

**À arbitrer.** Queda est une baisse / chute ; une récession est un cas économique plus précis. Vérifier si la rubrique veut vraiment enseigner récession.

| Champ | Valeur actuelle | Proposition |
|---|---|---|
| `frm` | la récession | la baisse / la chute |
| `esm` | la recesión | la caída / la bajada |
| `itm` | la recessione | il calo / la caduta |
| `cn` | 衰退 | 下降；下跌 |
| `jam` | 景気後退 | 下落 / 減少 |
| `kom` | 침체 | 하락 / 감소 |

### N° 4268 — a célula

**Correction recommandée.** Célula est une cellule, notamment biologique ; une cage se dit gaiola et une cellule de prison cela. Retirer le faux sens cage.

| Champ | Valeur actuelle | Proposition |
|---|---|---|
| `en` | the cell / cage | the cell (biology) |
| `frm` | la cellule / cage | la cellule (biologie) |
| `esm` | la célula / jaula | la célula |
| `itm` | la cellula / gabbia | la cellula |
| `cn` | 细胞；笼子 | 细胞 |
| `jam` | 細胞 / 檻 | 細胞 |
| `kom` | 세포 / 우리 | 세포 |

### N° 4288 — prover

**Correction recommandée.** Prover signifie fournir / pourvoir aux besoins. Les traductions utilisent le sens juridique prévoir / stipuler de l’anglais provide for.

| Champ | Valeur actuelle | Proposition |
|---|---|---|
| `en` | to provide for | to provide / supply |
| `frm` | prévoir | fournir / pourvoir aux besoins de |
| `esm` | prever | proveer / suministrar |
| `itm` | prevedere | fornire / provvedere a |
| `cn` | 规定；预见 | 提供；供应 |
| `jam` | 定める | 供給する / 用意する |
| `kom` | 규정하다 | 제공하다 / 공급하다 |

### N° 4365 — Você está confundindo conceitos.

**Correction recommandée.** Confundir conceitos signifie mélanger des concepts ; les versions asiatiques ajoutent une substitution ou manipulation, souvent intentionnelle.

| Champ | Valeur actuelle | Proposition |
|---|---|---|
| `cn` | 您在偷换概念。 | 您在混淆概念。 |
| `jam` | 概念をすり替えています。 | 概念を混同しています。 |
| `kom` | 개념을 바꿔치기하고 있어요. | 개념을 혼동하고 있어요. |

### N° 4375 — Encontramos um denominador comum.

**Correction recommandée.** Un dénominateur commun est un point commun, pas nécessairement une conclusion partagée.

| Champ | Valeur actuelle | Proposition |
|---|---|---|
| `jam` | 共通の結論に至りました。 | 共通点が見つかりました。 |

### N° 4410 — Agradeceria uma resposta breve.

**À arbitrer.** Breve peut être compris comme concis, alors que les traductions demandent une réponse rapide. Lever l’ambiguïté de l’objectif.

| Champ | Valeur actuelle | Proposition |
|---|---|---|
| `t` | Agradeceria uma resposta breve. | Agradeceria uma resposta rápida. |

### N° 4461 — Boa viagem e boa sorte no caminho!

**Correction recommandée.** 좋은 길 되세요 est une traduction littérale peu naturelle pour souhaiter un bon voyage.

| Champ | Valeur actuelle | Proposition |
|---|---|---|
| `kom` | 좋은 길 되세요! | 좋은 여행 되시고 행운을 빌어요! |
