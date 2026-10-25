# Décisions de Claude pour zh-fr — avant/après entiers
OVERRIDE = {  # remplace l'après proposé par le lecteur
 'catalogue:fr:2352': '茹勒维安维尔武拉皮德芒',
 'catalogue:fr:463':  '波讷茹尔内',
 'catalogue:fr:3113': '边克瑟斯瓦迪菲西勒',
 'catalogue:fr:2158': '飞克松 云 达特 利米特',
 'catalogue:fr:4381': '于 纳莱尔特',
 'catalogue:fr:497':  '伊尔 埃 迪 讷尔',
 'catalogue:fr:517':  '热 韦 安普里梅 萨',
}
RULE_OVERRIDE={'catalogue:fr:3927':'G','catalogue:fr:4356':'G','catalogue:fr:4381':'G','catalogue:fr:497':'G'}
# Événements ajoutés par la recherche de familles (G : genre de « une » / « bonne » ; L : liaison)
EXTRA = {
 'catalogue:fr:432':  ('L','翁 埃 凯尔 茹尔','翁 内 凯尔 茹尔',"On → 翁 · est → 埃 ✗ (liaison on‿est [ɔ̃nɛ] absente) · quel → 凯尔 · jour → 茹尔"),
 'catalogue:fr:2915': ('G','波 尚斯','波讷 尚斯',"Bonne → 波 ✗ (se lit « beau », le n final manque) · chance → 尚斯"),
 'catalogue:fr:392':  ('G','蓬 鲁特','波讷 鲁特',"Bonne → 蓬 ✗ (nasale : se lit « bon ») · route → 鲁特"),
 'catalogue:fr:289':  ('G','凯尔 波 努维尔','凯尔 波讷 努维尔',"Quelle → 凯尔 · bonne → 波 ✗ (« beau ») · nouvelle → 努维尔"),
 'catalogue:fr:1034': ('G','帕塞 云 波 茹尔内','帕塞 云 波讷 茹尔内',"Passez → 帕塞 · une → 云 · bonne → 波 ✗ · journée → 茹尔内"),
 'catalogue:fr:1434': ('G','居 阿 帕塞 云 波 茹尔内','居 阿 帕塞 云 波讷 茹尔内',"Tu → 居 · as → 阿 · passé → 帕塞 · une → 云 · bonne → 波 ✗ · journée → 茹尔内"),
 'catalogue:fr:3287': ('G','拉 卡利得 内 帕 蓬','拉 卡利得 内 帕 波讷',"La → 拉 · qualité → 卡利得 · n'est → 内 · pas → 帕 · bonne → 蓬 ✗ (« bon »)"),
 'catalogue:fr:2669': ('G','热 公菲尔姆 拉 邦 雷塞普西翁','热 公菲尔姆 拉 波讷 雷塞普西翁',"Je → 热 · confirme → 公菲尔姆 · la → 拉 · bonne → 邦 ✗ (« bon ») · réception → 雷塞普西翁"),
 'catalogue:fr:192':  ('G','塞 团 于尔仲斯','塞 迪讷 于尔仲斯',"C'est → 塞 · une → 团 ✗ (rendu de « un » nasal : [tœ̃]) · urgence → 于尔仲斯 ; une avec la liaison t : 迪讷 [tyn]"),
 'catalogue:fr:333':  ('G','塞 团 贝尔 梅宗','塞 迪讷 贝尔 梅宗',"C'est → 塞 · une → 团 ✗ · belle → 贝尔 · maison → 梅宗"),
 'catalogue:fr:267':  ('G','热 费 团 埃勒尔','热 费 迪讷 埃勒尔',"J'ai → 热 · fait → 费 · une → 团 ✗ · erreur → 埃勒尔"),
 'catalogue:fr:723':  ('G','伊尔 么 佛 团 奥尔多农斯','伊尔 么 佛 迪讷 奥尔多农斯',"Il → 伊尔 · me → 么 · faut → 佛 · une → 团 ✗ · ordonnance → 奥尔多农斯"),
 'catalogue:fr:956':  ('G','塞 团 凯斯提翁 多皮尼翁','塞 迪讷 凯斯提翁 多皮尼翁',"C'est → 塞 · une → 团 ✗ · question → 凯斯提翁 · d'opinion → 多皮尼翁"),
 'catalogue:fr:964':  ('G','翁 费 团 波兹','翁 费 迪讷 波兹',"On → 翁 · fait → 费 · une → 团 ✗ · pause → 波兹"),
 'catalogue:fr:1771': ('G','翁 费 团 波兹','翁 费 迪讷 波兹',"On → 翁 · fait → 费 · une → 团 ✗ · pause → 波兹"),
 'catalogue:fr:1207': ('G','塞 团 茹尔内 翁索雷耶','塞 迪讷 茹尔内 翁索雷耶',"C'est → 塞 · une → 团 ✗ · journée → 茹尔内 · ensoleillée → 翁索雷耶"),
 'catalogue:fr:2652': ('G','塞 团 寇奥佩拉西翁 阿 隆 泰尔姆','塞 迪讷 寇奥佩拉西翁 阿 隆 泰尔姆',"C'est → 塞 · une → 团 ✗ · coopération → 寇奥佩拉西翁 · à long terme → 阿 隆 泰尔姆"),
 'catalogue:fr:2737': ('G','伊尔 努 佛 团 法克图尔 普罗佛尔马','伊尔 努 佛 迪讷 法克图尔 普罗佛尔马',"Il → 伊尔 · nous → 努 · faut → 佛 · une → 团 ✗ · facture → 法克图尔 · proforma → 普罗佛尔马"),
 'catalogue:fr:427':  ('G','热 乌德雷 战 尚布勒','热 乌德雷 云 尚布勒',"Je → 热 · voudrais → 乌德雷 · une → 战 ✗ (« z'un » nasal) · chambre → 尚布勒 ; liaison facultative non notée"),
 'catalogue:fr:310':  ('G','普隆 战 佛托','普隆 云 佛托',"Prends → 普隆 · une → 战 ✗ · photo → 佛托"),
 'catalogue:fr:653':  ('G','热 费 战 费特','热 费 云 费特',"Je → 热 · fais → 费 · une → 战 ✗ · fête → 费特"),
 'catalogue:fr:3958': ('G','安 内蓬日','于 内蓬日',"une → 安 ✗ (« un ») · éponge → 内蓬日 (enchaînement déjà noté)"),
 'catalogue:fr:4059': ('G','安 纳雷尼耶','于 纳雷尼耶',"une → 安 ✗ · araignée → 纳雷尼耶"),
 'catalogue:fr:4208': ('G','安 内沙尔普','于 内沙尔普',"une → 安 ✗ · écharpe → 内沙尔普"),
 'catalogue:fr:4274': ('G','安 纳普利','于 纳普利',"une → 安 ✗ · appli → 纳普利"),
 'catalogue:fr:4377': ('G','安 尼农达西翁','于 尼农达西翁',"une → 安 ✗ · inondation → 尼农达西翁"),
 'catalogue:fr:4380': ('G','安 内瓦库阿西翁','于 内瓦库阿西翁',"une → 安 ✗ · évacuation → 内瓦库阿西翁"),
 'catalogue:fr:4057': ('G','安 纳贝伊','于 纳贝伊',"une → 安 ✗ · abeille → 纳贝伊"),
 'catalogue:fr:3269': ('G','安 纳纳利兹 德 松','于 纳纳利兹 德 松',"une → 安 ✗ · analyse → 纳纳利兹 · de → 德 · sang → 松"),
 'catalogue:fr:3272': ('G','安 纳莱尔特 东佩特','于 纳莱尔特 东佩特',"une → 安 ✗ · alerte → 纳莱尔特 · tempête → 东佩特"),
}
# Corrections du lot de contenu à appliquer en bloc (étude + aide)
BUNDLES = {
 'catalogue:fr:757': {'before':{'study':'Il fait moins zéro.','phon':'伊尔 费 姆万 泽罗','native':'零下'},
                      'after':{'study':'Il fait en dessous de zéro.','phon':'伊尔 费 昂 德苏 德 泽罗','native':'零下'},
                      'reason':"« moins zéro » n'a pas de sens en français ; la glose 零下 (« en dessous de zéro ») est juste. Étude et aide changent ensemble ; l'aide après reprend 伊尔 费 et 泽罗 de l'aide actuelle."},
}

OVERRIDE.update({
 'catalogue:fr:1870':'孔 珀东 安斯佩克得',
 'catalogue:fr:1668':'阿维武云塔布勒普尔德',
 'catalogue:fr:3581':'于 内斯卡勒',
 'catalogue:fr:3602':'于 内谢翁斯',
 'catalogue:fr:604':'茹普朗勒比斯',
 'catalogue:fr:2463':'努 泽格齐戎 云 孔庞萨西翁',
 'catalogue:fr:2177':'伊尔 色 珀 孔 纳里夫 安 珀 普吕 塔尔',
 'catalogue:fr:1293':'武普维帕雷普吕隆特芒',
 'catalogue:fr:2390':'普罗巴布勒芒 梅 热 普雷费尔 维里菲耶 达波尔',
 'catalogue:fr:3665':'热 拉 弗莱姆',
 'catalogue:fr:2365':'努普里昂特鲁维安纳科尔',
})
RULE_OVERRIDE.update({'catalogue:fr:1870':'X','catalogue:fr:1668':'T','catalogue:fr:463':'G'})
EXTRA_RULES={'catalogue:fr:1668':['T','G'],'catalogue:fr:463':['G','S'],'catalogue:fr:2365':['T','S']}
for k,a in (('catalogue:fr:267','热 费 于 内勒尔'),('catalogue:fr:964','翁 费 云 波兹'),('catalogue:fr:1771','翁 费 云 波兹'),('catalogue:fr:723','伊尔 么 佛 于 诺尔多农斯'),('catalogue:fr:2737','伊尔 努 佛 云 法克图尔 普罗佛尔马')):
    r,b,_,al=EXTRA[k]; EXTRA[k]=(r,b,a,al+" ; liaison facultative après fait/faut non notée")
DOWNGRADE_NATIVE={'catalogue:fr:40':"Classé incertain après contre-vérification : en contexte de repas, 我吃完了 se défend ; sinon 我好了 / 我完成了.",'catalogue:fr:3664':"Retouche de style (redondance), pas un faux sens."}
