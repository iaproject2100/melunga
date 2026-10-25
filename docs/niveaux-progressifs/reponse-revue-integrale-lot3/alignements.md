# Contre-lecture des alignements du lot 3

**90 aides entières et cinq corrections de Pinyin ont été lues dans leur texte, sans échantillonnage. Aucun faux positif de segment n’a été trouvé dans cette liste figée.** Le raccord peut reprendre ces avant/après précis. Cela ne constitue pas une certification native ou acoustique de toutes les aides.

Base : `3df885d`. Preuves : `d06a62e`. Les avant et les annotations B ont également été relus depuis Git, sans dépendre d’une sortie en cours de génération.

## Cinq lectures corrigées

| Carte | Lecture corrigée | Contrôle contextuel |
|---|---|---|
| `catalogue:zh:621` — 五金是电镀的吗？ | wǔjīn shì diàndù de ma? | 镀 est dù dans 电镀 ‘électroplaquer’ ; duó n’est pas la lecture de ce caractère dans ce terme. |
| `catalogue:zh:1680` — 有什么当地人才知道的好去处？ | yǒu shén me dāng dì rén cái zhī dào de hǎo qù chù? | 当地 ‘local’ est dāngdì. Le Pinyin avant transcrivait le synonyme 本地 běndì, absent du texte étudié. |
| `catalogue:zh:4810` — 君子疾没世而名不称焉 | jūn zǐ jí mò shì ér míng bù chēng yān | 没世 ‘à la fin de sa vie’ dans cette citation est mòshì ; lire méi traiterait à tort 没 comme négation ordinaire. |
| `catalogue:zh:1608` — 千磨万击还坚劲任尔东西南北风 | qiān mó wàn jī hái jiān jìng rèn ěr dōng xī nán běi fēng | 坚劲 signifie ici ferme/tenace dans le vers 千磨万击还坚劲. 劲 adjectival se lit jìng, distinct du nom jìn ‘force’. |
| `catalogue:zh:1323` — 逝者如斯夫不舍昼夜 | shì zhě rú sī fú bù shě zhòu yè | 夫 est la particule exclamative fú dans 逝者如斯夫, pas fū ‘homme/époux’. La correction ne change que le ton, et l’aide fou n’a pas de ton à changer. |

Quatre lectures sont liées à une aide J ; 夫 fú ne change que le ton de la lecture et conserve l’aide entière « fou ».

## Chaînes et répliques reçues

Sept cartes reçoivent un événement après B : `catalogue:zh:1016`, `catalogue:zh:1143`, `catalogue:zh:1193`, `catalogue:zh:1898`, `catalogue:zh:2018`, `catalogue:zh:2145`, `catalogue:zh:2164`. L’avant du lot 3 est bien l’après B ; son annotation antérieure doit rester intacte. Les sept copies de transport déclarées portent les mêmes tuples avant que leur canonique.

Les deux aides zh→fr sont bien des modèles **reçus seulement** : Ami en L3 pour la question sur les activités calmes, Partenaire de discussion en L9 pour la clôture. `analyse`, `requiresProduction` et les deux compteurs de production sont faux. La première question possède une réponse préparée ; la clôture a explicitement `answerWith: []`. Aucun faux canonique n’est créé.

## Limites à garder dans le message de méthode

- L’ajout de y à *yang* rétablit une attaque absente dans les aides visées. Les cinq aides *一样 i-ang* et le second *样* de 4812 restent volontairement hors de cette décision.
- Les corrections F/G rétablissent une frontière de syllabe et son attaque. Le rendu conservé *chu-eu* de 削 n’est pas approuvé globalement par ce seul changement.
- Écrire « tch fait forcément lire q/une consonne aspirée » serait trop absolu : l’orthographe française ne code pas seule cette opposition. Le choix *dj* est ici celui de la convention déclarée du deck.
- Les corrections I replacent les sigles et emprunts dans l’ordre du texte. La lecture de lettres de *CE*, *AA*, *ABC*, *ATM* ou *OEM* reste un choix de notation existant, pas une constatation de prononciation native.
- Les changements J suivent les caractères présents : pas un remplacement déclenché par un Pinyin erroné auquel on ferait confiance.

## Registre complet de lecture

| Événement | Carte | Règles | Avis borné |
|---|---|---|---|
| 0 | `catalogue:zh:3111` — 太阳 | E | Le caractère/segment lu porte yáng ou yǎng (样/阳/扬/养/羊/仰/痒) ; le y remis correspond à cette attaque. Les cas 一样 i-ang restés douteux ne sont pas généralisés. |
| 1 | `catalogue:zh:110` — 这样一来 | E | Le caractère/segment lu porte yáng ou yǎng (样/阳/扬/养/羊/仰/痒) ; le y remis correspond à cette attaque. Les cas 一样 i-ang restés douteux ne sont pas généralisés. |
| 2 | `catalogue:zh:143` — 这样最好 | E | Le caractère/segment lu porte yáng ou yǎng (样/阳/扬/养/羊/仰/痒) ; le y remis correspond à cette attaque. Les cas 一样 i-ang restés douteux ne sont pas généralisés. |
| 3 | `catalogue:zh:22` — 怎么样？ | E | Le caractère/segment lu porte yáng ou yǎng (样/阳/扬/养/羊/仰/痒) ; le y remis correspond à cette attaque. Les cas 一样 i-ang restés douteux ne sont pas généralisés. |
| 4 | `catalogue:zh:2270` — 客人 | G | 客人 : kè + rén, deux syllabes ; keu-jeune rétablit 人 séparément plutôt qu’un r collé au premier segment. |
| 5 | `catalogue:zh:251` — 这样也行 | E | Le caractère/segment lu porte yáng ou yǎng (样/阳/扬/养/羊/仰/痒) ; le y remis correspond à cette attaque. Les cas 一样 i-ang restés douteux ne sont pas généralisés. |
| 6 | `catalogue:zh:3154` — 可以打样吗？ | E | Le caractère/segment lu porte yáng ou yǎng (样/阳/扬/养/羊/仰/痒) ; le y remis correspond à cette attaque. Les cas 一样 i-ang restés douteux ne sont pas généralisés. |
| 7 | `catalogue:zh:3155` — 样品费 | E | Le caractère/segment lu porte yáng ou yǎng (样/阳/扬/养/羊/仰/痒) ; le y remis correspond à cette attaque. Les cas 一样 i-ang restés douteux ne sont pas généralisés. |
| 8 | `catalogue:zh:52` — 就这样 | E | Le caractère/segment lu porte yáng ou yǎng (样/阳/扬/养/羊/仰/痒) ; le y remis correspond à cette attaque. Les cas 一样 i-ang restés douteux ne sont pas généralisés. |
| 9 | `catalogue:zh:2319` — 可能 | F | 可能 : kě + néng ; keu-neung conserve n à l’attaque de 能, sans le perdre en fin de 可. |
| 10 | `catalogue:zh:2859` — 有样品吗？ | E | Le caractère/segment lu porte yáng ou yǎng (样/阳/扬/养/羊/仰/痒) ; le y remis correspond à cette attaque. Les cas 一样 i-ang restés douteux ne sont pas généralisés. |
| 11 | `catalogue:zh:3168` — 老师表扬了他 | E | Le caractère/segment lu porte yáng ou yǎng (样/阳/扬/养/羊/仰/痒) ; le y remis correspond à cette attaque. Les cas 一样 i-ang restés douteux ne sont pas généralisés. |
| 12 | `catalogue:zh:3206` — 我们需要样品 | E | Le caractère/segment lu porte yáng ou yǎng (样/阳/扬/养/羊/仰/痒) ; le y remis correspond à cette attaque. Les cas 一样 i-ang restés douteux ne sont pas généralisés. |
| 13 | `catalogue:zh:3212` — 能寄样品吗？ | E | Le caractère/segment lu porte yáng ou yǎng (样/阳/扬/养/羊/仰/痒) ; le y remis correspond à cette attaque. Les cas 一样 i-ang restés douteux ne sont pas généralisés. |
| 14 | `catalogue:zh:525` — 有Wi-Fi吗？ | I | 有 Wi-Fi 吗 : l’attaque w de Wi-Fi manquait ; ouaï-faï reprend une aide déjà présente dans cette famille, sans décider la prononciation native de tous les emprunts. |
| 15 | `catalogue:zh:552` — 我们AA制吧。 | I | Nous AA 制 吧 : seule la position de é-é change. É-é (plutôt que la lecture française de A) demeure explicitement une convention non arbitrée. |
| 16 | `editorial:new-fr-zh-gold` — 金色 | H | L’après rétablit la convention dj du deck pour l’initiale j. La différence Mandarin aspiré/non aspiré n’est pas entièrement prouvée par l’orthographe française tch/dj ; il s’agit ici de cohérence de la convention, pas d’une mesure acoustique. |
| 17 | `situation-conversation:fr-zh:loisirs-sorties-04` — 我经常运动。 | H | L’après rétablit la convention dj du deck pour l’initiale j. La différence Mandarin aspiré/non aspiré n’est pas entièrement prouvée par l’orthographe française tch/dj ; il s’agit ici de cohérence de la convention, pas d’une mesure acoustique. |
| 18 | `situation-conversation:fr-zh:loisirs-sorties-05` — 我们在酒店门口见。 | H | 酒 jiǔ et 见 jiàn : les deux attaques j sont rétablies. Djyo suit la graphie du deck pour jiǔ ; le maintien de tièn pour 店 diàn ne crée pas une nouvelle règle générale de dévoisement. |
| 19 | `situation-conversation:fr-zh:loisirs-sorties-08` — 好啊！十二点见。 | H | L’après rétablit la convention dj du deck pour l’initiale j. La différence Mandarin aspiré/non aspiré n’est pas entièrement prouvée par l’orthographe française tch/dj ; il s’agit ici de cohérence de la convention, pas d’une mesure acoustique. |
| 20 | `catalogue:zh:2098` — 请尽快确认 | G | 确认 : què + rèn ; le j rendu dans jeune appartient à 认. L’après n’impose pas une nouvelle théorie de toutes les finales üe. |
| 21 | `catalogue:zh:2377` — 样品 | E | Le caractère/segment lu porte yáng ou yǎng (样/阳/扬/养/羊/仰/痒) ; le y remis correspond à cette attaque. Les cas 一样 i-ang restés douteux ne sont pas généralisés. |
| 22 | `catalogue:zh:3449` — 样板 | E | Le caractère/segment lu porte yáng ou yǎng (样/阳/扬/养/羊/仰/痒) ; le y remis correspond à cette attaque. Les cas 一样 i-ang restés douteux ne sont pas généralisés. |
| 23 | `catalogue:zh:3537` — 样品什么时候能好？ | E | Le caractère/segment lu porte yáng ou yǎng (样/阳/扬/养/羊/仰/痒) ; le y remis correspond à cette attaque. Les cas 一样 i-ang restés douteux ne sont pas généralisés. |
| 24 | `catalogue:zh:3538` — 先看样品 | E | Le caractère/segment lu porte yáng ou yǎng (样/阳/扬/养/羊/仰/痒) ; le y remis correspond à cette attaque. Les cas 一样 i-ang restés douteux ne sont pas généralisés. |
| 25 | `catalogue:zh:3565` — 痒 | E | Le caractère/segment lu porte yáng ou yǎng (样/阳/扬/养/羊/仰/痒) ; le y remis correspond à cette attaque. Les cas 一样 i-ang restés douteux ne sont pas généralisés. |
| 26 | `catalogue:zh:621` — 五金是电镀的吗？ | J | 电镀 diàndù : le 镀 de la phrase est dù, pas duó ; dou retire le glide o indu du segment douo. |
| 27 | `catalogue:zh:631` — 有CE认证吗？ | I | CE occupe deux lettres entre 有 et 认证 ; sé-eu suit le choix déjà employé dans 提供 CE 认证. Cela ne prétend pas certifier la façon dont un locuteur chinois épelle ce sigle. |
| 28 | `catalogue:zh:695` — 样品要多久？ | E | Le caractère/segment lu porte yáng ou yǎng (样/阳/扬/养/羊/仰/痒) ; le y remis correspond à cette attaque. Les cas 一样 i-ang restés douteux ne sont pas généralisés. |
| 29 | `catalogue:zh:753` — 能寄对色样吗？ | E | Le caractère/segment lu porte yáng ou yǎng (样/阳/扬/养/羊/仰/痒) ; le y remis correspond à cette attaque. Les cas 一样 i-ang restés douteux ne sont pas généralisés. |
| 30 | `catalogue:zh:789` — 这样能省钱 | E | Le caractère/segment lu porte yáng ou yǎng (样/阳/扬/养/羊/仰/痒) ; le y remis correspond à cette attaque. Les cas 一样 i-ang restés douteux ne sont pas généralisés. |
| 31 | `catalogue:zh:893` — 我们不能再拖延了 | F | La frontière lue dans les caractères et le Pinyin réattribue une consonne au début de la syllabe suivante ; l’après conserve le reste de l’aide entière. |
| 32 | `catalogue:zh:906` — 我们倡导环保理念 | F | La frontière lue dans les caractères et le Pinyin réattribue une consonne au début de la syllabe suivante ; l’après conserve le reste de l’aide entière. |
| 33 | `catalogue:zh:1006` — 这削弱了我们的优势 | G | 削弱 xuē + ruò : le r de 弱 est rétabli par j. Le rendu antérieur chu-eu pour xuē et son nombre d’unités écrites restent ouverts, hors de cette correction. |
| 34 | `catalogue:zh:1007` — 智能手机已经普及了 | F | 智能 zhì + néng : djinn-eung suggérait jin + eng. Djr-neung utilise le repère rétroflexe et rétablit n devant 能 ; ce n’est pas une uniformisation de toutes les rétroflexes. |
| 35 | `catalogue:zh:1016` — 这个责任我来扛 | G | La syllabe contenant r dans le Pinyin est distincte de la précédente ; l’après rétablit le repère j du deck pour cette syllabe, sans trancher les autres finales. |
| 36 | `catalogue:zh:1047` — 有智能控制功能吗？ | F | 智能 même défaut local qu’en 1007 ; le segment ultérieur 控制 kong-djr est conservé. |
| 37 | `catalogue:zh:1143` — 这个事件催化了变革 | F | 变革 biàn + gé : byèn-gueu rend bien deux syllabes. Le gueu de 革 reste la convention B avant e/i, au lieu de perdre son g au profit d’un faux biang. |
| 38 | `catalogue:zh:1193` — 这个app要怎么下载？ | I | L’emplacement des lettres/sigles a été lu dans la chaîne chinoise entière. Leur ordre corrigé correspond à la source ; les noms français de lettres et les lectures déjà employées restent des choix de convention. |
| 39 | `catalogue:zh:2432` — 责任 | G | La syllabe contenant r dans le Pinyin est distincte de la précédente ; l’après rétablit le repère j du deck pour cette syllabe, sans trancher les autres finales. |
| 40 | `catalogue:zh:3788` — 职业素养 | E | Le caractère/segment lu porte yáng ou yǎng (样/阳/扬/养/羊/仰/痒) ; le y remis correspond à cette attaque. Les cas 一样 i-ang restés douteux ne sont pas généralisés. |
| 41 | `catalogue:zh:3875` — 阳台 | E | Le caractère/segment lu porte yáng ou yǎng (样/阳/扬/养/羊/仰/痒) ; le y remis correspond à cette attaque. Les cas 一样 i-ang restés douteux ne sont pas généralisés. |
| 42 | `catalogue:zh:960` — 请发样品 | E | Le caractère/segment lu porte yáng ou yǎng (样/阳/扬/养/羊/仰/痒) ; le y remis correspond à cette attaque. Les cas 一样 i-ang restés douteux ne sont pas généralisés. |
| 43 | `catalogue:zh:997` — 这样能节省时间 | E | Le caractère/segment lu porte yáng ou yǎng (样/阳/扬/养/羊/仰/痒) ; le y remis correspond à cette attaque. Les cas 一样 i-ang restés douteux ne sont pas généralisés. |
| 44 | `catalogue:zh:1251` — 这附近有ATM吗？ | I | L’emplacement des lettres/sigles a été lu dans la chaîne chinoise entière. Leur ordre corrigé correspond à la source ; les noms français de lettres et les lectures déjà employées restent des choix de convention. |
| 45 | `catalogue:zh:1298` — 拉链质量怎么样？ | E | Le caractère/segment lu porte yáng ou yǎng (样/阳/扬/养/羊/仰/痒) ; le y remis correspond à cette attaque. Les cas 一样 i-ang restés douteux ne sont pas généralisés. |
| 46 | `catalogue:zh:1308` — 这里怎么连wifi？ | I | L’emplacement des lettres/sigles a été lu dans la chaîne chinoise entière. Leur ordre corrigé correspond à la source ; les noms français de lettres et les lectures déjà employées restent des choix de convention. |
| 47 | `catalogue:zh:1405` — 我们可以提供样品 | E | Le caractère/segment lu porte yáng ou yǎng (样/阳/扬/养/羊/仰/痒) ; le y remis correspond à cette attaque. Les cas 一样 i-ang restés douteux ne sont pas généralisés. |
| 48 | `catalogue:zh:1412` — 有没有english menu？ | I | L’emplacement des lettres/sigles a été lu dans la chaîne chinoise entière. Leur ordre corrigé correspond à la source ; les noms français de lettres et les lectures déjà employées restent des choix de convention. |
| 49 | `catalogue:zh:1450` — 能提供CE认证吗？ | I | L’emplacement des lettres/sigles a été lu dans la chaîne chinoise entière. Leur ordre corrigé correspond à la source ; les noms français de lettres et les lectures déjà employées restent des choix de convention. |
| 50 | `catalogue:zh:1456` — 请帮我确认一下 | G | La syllabe contenant r dans le Pinyin est distincte de la précédente ; l’après rétablit le repère j du deck pour cette syllabe, sans trancher les autres finales. |
| 51 | `catalogue:zh:1474` — 情绪不能支配你的决定 | F | La frontière lue dans les caractères et le Pinyin réattribue une consonne au début de la syllabe suivante ; l’après conserve le reste de l’aide entière. |
| 52 | `catalogue:zh:3994` — 培养 | E | Le caractère/segment lu porte yáng ou yǎng (样/阳/扬/养/羊/仰/痒) ; le y remis correspond à cette attaque. Les cas 一样 i-ang restés douteux ne sont pas généralisés. |
| 53 | `catalogue:zh:4054` — 新员工很快融入了团队 | F | 员工 yuán + gōng : le g appartient à 工, non à 员. Uèn-gong reprend le rendu existant de yuán sans arbitrer l’ensemble des finales üan. |
| 54 | `catalogue:zh:4086` — 榜样 | E | Le caractère/segment lu porte yáng ou yǎng (样/阳/扬/养/羊/仰/痒) ; le y remis correspond à cette attaque. Les cas 一样 i-ang restés douteux ne sont pas généralisés. |
| 55 | `catalogue:zh:4194` — 这样双方都合适 | E | Le caractère/segment lu porte yáng ou yǎng (样/阳/扬/养/羊/仰/痒) ; le y remis correspond à cette attaque. Les cas 一样 i-ang restés douteux ne sont pas généralisés. |
| 56 | `catalogue:zh:1608` — 千磨万击还坚劲任尔东西南北风 | J | 坚劲 jiānjìng : 劲 est adjectival ‘ferme/vigoureux’ dans le vers de 竹石, non le nom 劲 jìn ‘force’. La finale ng de djing suit cette lecture. |
| 57 | `catalogue:zh:1680` — 有什么当地人才知道的好去处？ | J | 当地 dāngdì est écrit 当地, pas 本地 běndì. Le caractère 当 impose dang, indépendamment de leur sens proche de ‘local’. |
| 58 | `catalogue:zh:1695` — 他引导我们参观工厂 | F | La frontière lue dans les caractères et le Pinyin réattribue une consonne au début de la syllabe suivante ; l’après conserve le reste de l’aide entière. |
| 59 | `catalogue:zh:1728` — 这活动是为了弘扬传统文化 | E | Le caractère/segment lu porte yáng ou yǎng (样/阳/扬/养/羊/仰/痒) ; le y remis correspond à cette attaque. Les cas 一样 i-ang restés douteux ne sont pas généralisés. |
| 60 | `catalogue:zh:2554` — 尴尬 | F | 尴尬 gān + gà : gāngà joint dans le Pinyin ne se segmente pas en gāng + à. Gann-ga remet la consonne à l’attaque de 尬. |
| 61 | `catalogue:zh:2558` — 看到这样我很心疼 | E | Le caractère/segment lu porte yáng ou yǎng (样/阳/扬/养/羊/仰/痒) ; le y remis correspond à cette attaque. Les cas 一样 i-ang restés douteux ne sont pas généralisés. |
| 62 | `catalogue:zh:2560` — 无奈 | F | 无奈 wú + nài : le n de 奈 avait été attaché à 无 ; ou-naï rétablit les deux syllabes. |
| 63 | `catalogue:zh:4239` — 样品满意就下单 | E | Le caractère/segment lu porte yáng ou yǎng (样/阳/扬/养/羊/仰/痒) ; le y remis correspond à cette attaque. Les cas 一样 i-ang restés douteux ne sont pas généralisés. |
| 64 | `catalogue:zh:1860` — 我们要兼顾质量和成本 | F | 兼顾 jiān + gù : djyèn-gou rétablit le g de 顾 et la finale n de 兼 ; ce n’est pas une nouvelle convention phonétique généralisée. |
| 65 | `catalogue:zh:1866` — 我是ABC公司的采购。 | I | L’emplacement des lettres/sigles a été lu dans la chaîne chinoise entière. Leur ordre corrigé correspond à la source ; les noms français de lettres et les lectures déjà employées restent des choix de convention. |
| 66 | `catalogue:zh:1898` — 我们要发扬这个传统 | E | Le caractère/segment lu porte yáng ou yǎng (样/阳/扬/养/羊/仰/痒) ; le y remis correspond à cette attaque. Les cas 一样 i-ang restés douteux ne sont pas généralisés. |
| 67 | `catalogue:zh:4283` — 扬长避短 | E | Le caractère/segment lu porte yáng ou yǎng (样/阳/扬/养/羊/仰/痒) ; le y remis correspond à cette attaque. Les cas 一样 i-ang restés douteux ne sont pas généralisés. |
| 68 | `catalogue:zh:4298` — 久仰 | E | Le caractère/segment lu porte yáng ou yǎng (样/阳/扬/养/羊/仰/痒) ; le y remis correspond à cette attaque. Les cas 一样 i-ang restés douteux ne sont pas généralisés. |
| 69 | `catalogue:zh:4321` — 亡羊补牢 | E | Le caractère/segment lu porte yáng ou yǎng (样/阳/扬/养/羊/仰/痒) ; le y remis correspond à cette attaque. Les cas 一样 i-ang restés douteux ne sont pas généralisés. |
| 70 | `catalogue:zh:4409` — 阳奉阴违 | E | Le caractère/segment lu porte yáng ou yǎng (样/阳/扬/养/羊/仰/痒) ; le y remis correspond à cette attaque. Les cas 一样 i-ang restés douteux ne sont pas généralisés. |
| 71 | `catalogue:zh:4812` — 大货质量要和小样一样 | E | Deux 样 sont présents. Seul 小样 chyao-ang devient chyao-yang ; le second 一样 i-ang reste intact parce que cette graphie peut déjà suggérer un glide à la lecture française. |
| 72 | `catalogue:zh:1997` — 我们想做OEM贴牌。 | I | L’emplacement des lettres/sigles a été lu dans la chaîne chinoise entière. Leur ordre corrigé correspond à la source ; les noms français de lettres et les lectures déjà employées restent des choix de convention. |
| 73 | `catalogue:zh:2018` — 本来可能更糟。 | F | La frontière lue dans les caractères et le Pinyin réattribue une consonne au début de la syllabe suivante ; l’après conserve le reste de l’aide entière. |
| 74 | `catalogue:zh:2698` — 拿捏得当 | F | 拿捏 ná + niē : na-nyé remet le n de 捏 devant la syllabe niē plutôt qu’en fin de 拿. |
| 75 | `catalogue:zh:4604` — 多样 | E | Le caractère/segment lu porte yáng ou yǎng (样/阳/扬/养/羊/仰/痒) ; le y remis correspond à cette attaque. Les cas 一样 i-ang restés douteux ne sont pas généralisés. |
| 76 | `catalogue:zh:4653` — 多样性 | E | Le caractère/segment lu porte yáng ou yǎng (样/阳/扬/养/羊/仰/痒) ; le y remis correspond à cette attaque. Les cas 一样 i-ang restés douteux ne sont pas généralisés. |
| 77 | `catalogue:zh:2074` — 交货方式是FOB还是CIF？ | I | La phrase place FOB avant 还是 puis CIF. L’avant inversait les deux sigles en tête ; l’après respecte les deux positions sans renommer leurs lettres. |
| 78 | `catalogue:zh:2077` — 包装上能印我们的logo吗？ | I | L’emplacement des lettres/sigles a été lu dans la chaîne chinoise entière. Leur ordre corrigé correspond à la source ; les noms français de lettres et les lectures déjà employées restent des choix de convention. |
| 79 | `catalogue:zh:2116` — 请尽快归还样品 | E | Le caractère/segment lu porte yáng ou yǎng (样/阳/扬/养/羊/仰/痒) ; le y remis correspond à cette attaque. Les cas 一样 i-ang restés douteux ne sont pas généralisés. |
| 80 | `catalogue:zh:2126` — 报价涵盖运费吗？ | F | 涵盖 hán + gài : le g appartient à 盖, d’où hann-gaï et non hang-aï. |
| 81 | `catalogue:zh:2143` — 大货前必须先确认样品 | G+E | 确认样品 : què + rèn puis yàng + pǐn ; deux segments distincts corrigés dans la même aide entière, sans perdre l’un en appliquant l’autre. |
| 82 | `catalogue:zh:2145` — 我们不能太依赖一个供应商 | F | La frontière lue dans les caractères et le Pinyin réattribue une consonne au début de la syllabe suivante ; l’après conserve le reste de l’aide entière. |
| 83 | `catalogue:zh:2155` — 我们要界定责任范围 | G | La syllabe contenant r dans le Pinyin est distincte de la précédente ; l’après rétablit le repère j du deck pour cette syllabe, sans trancher les autres finales. |
| 84 | `catalogue:zh:2164` — 这个职位赋予他更多责任 | G | La syllabe contenant r dans le Pinyin est distincte de la précédente ; l’après rétablit le repère j du deck pour cette syllabe, sans trancher les autres finales. |
| 85 | `catalogue:zh:2743` — 久仰大名 | E | Le caractère/segment lu porte yáng ou yǎng (样/阳/扬/养/羊/仰/痒) ; le y remis correspond à cette attaque. Les cas 一样 i-ang restés douteux ne sont pas généralisés. |
| 86 | `catalogue:zh:4810` — 君子疾没世而名不称焉 | J | 没世 est mòshì dans la citation (fin de la vie), non la négation 没 méi. Mo corrige précisément cette lecture. |
| 87 | `heard-conversation:fr-zh-piste-sport-habitudes-received-01` — 你经常运动吗？ | H | Question reçue du sport : 经 jīng avait ting ; djing correspond à l’initiale j dans l’aide francophone de ce deck. |
| 88 | `heard-authored:situation-zh-fr-piste-gouts-activites-received-01` — Tu aimes plutôt les activités calmes ? | C | Reçu de l’ami : les activités, avec liaison z rendue par le segment suivant 扎克蒂维泰. Seul 莱 est remplacé par 雷 ; la liaison n’est pas supprimée. |
| 89 | `heard-authored:situation-zh-fr-piste-repondre-objection-received-03` — Je comprends mieux votre position, comparons les deux formats. | C | Clôture du partenaire : les deux formats ; seul 莱 devient 雷. La phrase reste en compréhension seule et sans réponse à produire. |

Les aides entières avant/après, provenances, liens aux Pinyin, chaînes B et rôles reçus sont dans [alignements-preuves.json](alignements-preuves.json). Aucune source, aide exécutée, convention générale ou interface n’a été modifiée par cette contre-lecture.
