# Décisions de Claude après contre-vérification — avant/après entiers, champ phon
PHON = {
 # F — consonne glissée d'une syllabe à la suivante
 'catalogue:zh:2319': ('F','keune-eung','keu-neung','可 kě → keune ✗ · 能 néng → eung ✗'),
 'catalogue:zh:2018': ('F','beunn-laï keunn-eung gueung tsao','beunn-laï keu-neung gueung tsao','本来 běnlái → beunn-laï · 可 kě → keunn ✗ · 能 néng → eung ✗ · 更 gèng → gueung · 糟 zāo → tsao (convention dz/ts, non touchée)'),
 'catalogue:zh:893':  ('F','ouo-meune bounn-eung dzaï touo-yèn leu','ouo-meune bou-neung dzaï touo-yèn leu','不 bù → bounn ✗ · 能 néng → eung ✗'),
 'catalogue:zh:1474': ('F','tching-chu bounn-eung djr-peï ni deu dju-eu-ding','tching-chu bou-neung djr-peï ni deu dju-eu-ding','不 bù → bounn ✗ · 能 néng → eung ✗'),
 'catalogue:zh:2145': ('F','ouo-meune bounn-eung taï i-laï i gueu gong-ing-chang','ouo-meune bou-neung taï i-laï i gueu gong-ing-chang','不 bù → bounn ✗ · 能 néng → eung ✗'),
 'catalogue:zh:1007': ('F','djinn-eung chou-dji i-djing pou-dji leu','djr-neung chou-dji i-djing pou-dji leu','智 zhì → djinn ✗ · 能 néng → eung ✗'),
 'catalogue:zh:1047': ('F','yo djinn-eung kong-djr gong-neung ma?','yo djr-neung kong-djr gong-neung ma?','智 zhì → djinn ✗ · 能 néng → eung ✗'),
 'catalogue:zh:906':  ('F','ouo-meune tchang-dao houann-bao linn-yèn','ouo-meune tchang-dao houann-bao li-nyèn','理 lǐ → linn ✗ · 念 niàn → yèn ✗'),
 'catalogue:zh:2698': ('F','nann-yé deu-dang','na-nyé deu-dang','拿 ná → nann ✗ · 捏 niē → yé ✗'),
 'catalogue:zh:2560': ('F','ounn-aï','ou-naï','无 wú → ounn ✗ · 奈 nài → aï ✗'),
 'catalogue:zh:1695': ('F','ta inn-dao ouo-meune tsang-ouann gong-tchang','ta inn-dao ouo-meune tsann-gouann gong-tchang','参 cān → tsang ✗ · 观 guān → ouann ✗'),
 'catalogue:zh:2554': ('F','gang-a','gann-ga','尴 gān → gang ✗ · 尬 gà → a ✗'),
 'catalogue:zh:2126': ('F','bao-djya hang-aï unn-feï ma?','bao-djya hann-gaï unn-feï ma?','涵 hán → hang ✗ · 盖 gài → aï ✗'),
 'catalogue:zh:1860': ('F','ouo-meune yao djyang-ou djr-lyang heu tcheung-beune','ouo-meune yao djyèn-gou djr-lyang heu tcheung-beune','兼 jiān → djyang ✗ · 顾 gù → ou ✗'),
 'catalogue:zh:1143': ('F','djeu-gueu chr-djyèn tsouèï-houa leu byang-eu','djeu-gueu chr-djyèn tsouèï-houa leu byèn-gueu','变 biàn → byang ✗ · 革 gé → eu ✗'),
 'catalogue:zh:4054': ('F','chinn ouang-ong heune kouaï jong-jou leu touann-douèï','chinn uèn-gong heune kouaï jong-jou leu touann-douèï','员 yuán → ouang ✗ (rend wang) · 工 gōng → ong ✗ ; 员 rendu uèn ailleurs (员工 uèn gong)'),
 # G — initiale r perdue
 'catalogue:zh:2155': ('G','ouo-meune yao djyé-ding dzer-eune fann-ouèï','ouo-meune yao djyé-ding dzeu-jeune fann-ouèï','责 zé → dzer ✗ · 任 rèn → eune ✗'),
 'catalogue:zh:2164': ('G','djeu-gueu djr-ouèï fou-u ta gueung douo dzer-eune','djeu-gueu djr-ouèï fou-u ta gueung douo dzeu-jeune','责 zé → dzer ✗ · 任 rèn → eune ✗'),
 'catalogue:zh:1016': ('G','djeu-gueu dzer-eune ouo laï kang','djeu-gueu dzeu-jeune ouo laï kang','责 zé → dzer ✗ · 任 rèn → eune ✗'),
 'catalogue:zh:2432': ('G','dzer-eune','dzeu-jeune','责 zé → dzer ✗ · 任 rèn → eune ✗'),
 'catalogue:zh:2270': ('G','ker-eune','keu-jeune','客 kè → ker ✗ · 人 rén → eune ✗ (correction de ma lecture du L2)'),
 'catalogue:zh:2098': ('G','tching djinn-kouaï tchu-er-eune','tching djinn-kouaï tchué-jeune','确 què → tchu-er ✗ · 认 rèn → eune ✗ ; 确认 rendu tchué jeunn dans la même famille'),
 'catalogue:zh:1456': ('G','tching bang ouo tchu-er-eune i-chya','tching bang ouo tchué-jeune i-chya','确 què → tchu-er ✗ · 认 rèn → eune ✗'),
 'catalogue:zh:1006': ('G','djeu chu-er-ouo leu ouo-meune deu yo-chr','djeu chu-eu-jouo leu ouo-meune deu yo-chr','削 xuē → chu-er ✗ (rime üe gardée en chu-eu) · 弱 ruò → ouo ✗ (rend wo)'),
 # H — initiale j rendue t / tch
 'situation-conversation:fr-zh:loisirs-sorties-04': ('H','ouo ting-tchang yun-tong','ouo djing-tchang yun-tong','经 jīng → ting ✗ (rend tīng) ; 动 tong laissé : dévoisement propre à cette carte'),
 'situation-conversation:fr-zh:loisirs-sorties-05': ('H','ouo-meun dzaï tiou-tièn meun-kou tièn','ouo-meun dzaï djyo-tièn meun-kou djyèn','酒 jiǔ → tiou ✗ · 店 diàn → tièn (dévoisement laissé) · 见 jiàn → tièn ✗ ; 酒 jiǔ rendu djyo comme 久 jiǔ'),
 'situation-conversation:fr-zh:loisirs-sorties-08': ('H','hao a ! chr-eur tièn tièn','hao a ! chr-eur tièn djyèn','点 diǎn → tièn (dévoisement laissé) · 见 jiàn → tièn ✗'),
 'heard-conversation:fr-zh-piste-sport-habitudes-received-01': ('H','ni ting-tchang yun-tong ma ?','ni djing-tchang yun-tong ma ?','经 jīng → ting ✗'),
 'editorial:new-fr-zh-gold': ('H','tchin seu','djinn seu','金 jīn → tchin ✗ (rend qīn)'),
 # I — lettres latines déplacées ou illisibles
 'catalogue:zh:2074': ('I','sé-i-èf èf-o-bé djyao houo fang cheu cheu haï cheu','djyao houo fang cheu cheu èf-o-bé haï cheu sé-i-èf','交货方式是 FOB 还是 CIF : FOB et CIF placés en tête, inversés'),
 'catalogue:zh:2077': ('I','lo-go bao djouang chang neung inn ouo meunn de ma?','bao djouang chang neung inn ouo meunn de lo-go ma?','logo placé en tête au lieu d’être entre 的 et 吗'),
 'catalogue:zh:1412': ('I','me-nu in-glich yoou meï yoou','yoou meï yoou in-glich me-nu','有没有 english menu : ordre renversé'),
 'catalogue:zh:1308': ('I','ouaï-faï dje li dzeunn me lyenn','dje li dzeunn me lyenn ouaï-faï','连 wifi : wifi placé en tête'),
 'catalogue:zh:1251': ('I','a-té-èm dje fou djinn yoou ma?','dje fou djinn yoou a-té-èm ma?','有 ATM 吗 : ATM placé en tête'),
 'catalogue:zh:1450': ('I','sé-eu neung ti gong jeunn djeung ma?','neung ti gong sé-eu jeunn djeung ma?','提供 CE 认证 : CE placé en tête'),
 'catalogue:zh:1866': ('I','a-bé-sé ouo cheu gong sseu de tsaï goou.','ouo cheu a-bé-sé gong sseu de tsaï goou.','我是 ABC 公司 : ABC placé en tête'),
 'catalogue:zh:1997': ('I','o-eu-èm ouo meunn chyang dzouo tyé paï.','ouo meunn chyang dzouo o-eu-èm tyé paï.','做 OEM 贴牌 : OEM placé en tête'),
 'catalogue:zh:1193': ('I','ap dje gue yao dzeunn me chya dzaï?','dje gue ap yao dzeunn me chya dzaï?','这个 app : app placé en tête'),
 'catalogue:zh:552':  ('I','é-é ouo meunn djeu ba.','ouo meunn é-é djeu ba.','我们 AA 制 : AA placé en tête'),
 'catalogue:zh:525':  ('I','yo i-Fi ma?','yo ouaï-faï ma?','Wi-Fi → i-Fi ✗ (w perdu, Fi non transcrit) ; ouaï-faï comme 连 wifi'),
 'catalogue:zh:631':  ('I','yo tseu jeune-djeung ma?','yo sé-eu jeune-djeung ma?','CE → tseu ✗ (deux lettres, un segment qui rend cì) ; sé-eu comme 提供 CE 认证'),
 # J — aide alignée sur une lecture pinyin corrigée
 'catalogue:zh:621':  ('J','ou-djinn chr dyèn-douo deu ma?','ou-djinn chr dyèn-dou deu ma?','镀 dù (lu duó par erreur) → douo ✗'),
 'catalogue:zh:1680': ('J','yoou cheunn me beunn di jeunn tsaï djeu dao de hao tchu tchou?','yoou cheunn me dang di jeunn tsaï djeu dao de hao tchu tchou?','当 dāng (lu běn par erreur, comme 本地) → beunn ✗'),
 'catalogue:zh:4810': ('J','djunn dzeu dji meï chr er ming bou tcheung yèn','djunn dzeu dji mo chr er ming bou tcheung yèn','没世 mò shì (lu méi par erreur) → meï ✗'),
 'catalogue:zh:1608': ('J','tchyèn mo ouann dji haï djyèn djinn jeune er dong chi nann beï feung','tchyèn mo ouann dji haï djyèn djing jeune er dong chi nann beï feung','坚劲 jiānjìng (lu jìn par erreur) → djinn ✗'),
}
READING = {
 'catalogue:zh:621':  ('wǔjīn shì diànduó de ma?','wǔjīn shì diàndù de ma?','电镀 se lit diàndù'),
 'catalogue:zh:1680': ('yǒu shén me běn dì rén cái zhī dào de hǎo qù chù?','yǒu shén me dāng dì rén cái zhī dào de hǎo qù chù?','les caractères sont 当地 dāngdì, pas 本地'),
 'catalogue:zh:4810': ('jūn zǐ jí méi shì ér míng bù chēng yān','jūn zǐ jí mò shì ér míng bù chēng yān','没世 « jusqu’à la fin de sa vie » se lit mòshì'),
 'catalogue:zh:1608': ('qiān mó wàn jī hái jiān jìn rèn ěr dōng xī nán běi fēng','qiān mó wàn jī hái jiān jìng rèn ěr dōng xī nán běi fēng','坚劲 « ferme, vigoureux » se lit jiānjìng (Zheng Banqiao, 竹石)'),
 'catalogue:zh:1323': ('shì zhě rú sī fū bù shě zhòu yè','shì zhě rú sī fú bù shě zhòu yè','夫 particule finale de 逝者如斯夫 se lit fú ; l’aide « fou » reste juste'),
}
# E — y perdu devant ang : cartes où la syllabe précédente ne fournit pas le son i (correction certaine)
E_UNCERTAIN = {'catalogue:zh:2818','catalogue:zh:2324','catalogue:zh:2325','catalogue:zh:2534','catalogue:zh:4818'}
E_EXTRA = {'catalogue:zh:2143': ('da-houo tchyèn bi-chu chyèn tchu-er-eune ang-pinn','da-houo tchyèn bi-chu chyèn tchué-jeune yang-pinn','确 què → tchu-er ✗ · 认 rèn → eune ✗ · 样 yàng → ang ✗')}
