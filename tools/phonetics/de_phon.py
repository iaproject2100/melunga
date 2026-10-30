# -*- coding: utf-8 -*-
# de_phon.py — générateur phonétique allemand Melunga (v2, reconstruit)
# Sorties : py (anglophone), pf (francophone), ps (hispanophone), pi (italophone), phon (汉字)
import re

FUNC = set("""ich du er sie es wir ihr der die das den dem des ein eine einen einem einer eines
ist sind war hat und oder aber in im an am auf mit von vom zu zum zur bei für um aus nach vor
über unter nicht kein keine mein dein sein mir dir sich uns euch ihnen wie wo was wer wenn dass
ob so ja nein auch noch schon nur sehr hier da dort dann denn als bis man mich dich ihn ihm ihre
ihrem ihren wird bin bist seid""".split())

OV = {
 'ich':('ish','ich','ij','ich','伊希'),'ist':('ist','ist','ist','ist','伊斯特'),
 'das':('dahs','dass','das','das','达斯'),'dass':('dahs','dass','das','das','达斯'),
 'der':('dair','dèr','der','der','德尔'),'die':('dee','di','di','di','迪'),
 'den':('dayn','déne','den','den','登'),'dem':('daym','dème','dem','dem','德姆'),'des':('des','dèss','des','des','德斯'),
 'ein':('ine','aïne','ain','ain','艾因'),'eine':('EYE-nuh','AÏ-neu','ái-ne','ài-ne','艾内'),
 'einen':('EYE-nen','AÏ-nenn','ái-nen','ài-nen','艾嫩'),'einem':('EYE-nem','AÏ-nème','ái-nem','ài-nem','艾内姆'),
 'einer':('EYE-ner','AÏ-neur','ái-ner','ài-ner','艾纳'),'eins':('ines','aïnss','áins','àins','艾恩斯'),
 'und':('oont','ount','unt','unt','温特'),'nicht':('nisht','nicht','níjt','nìcht','尼希特'),
 'habe':('HAH-buh','HA-beu','já-be','hà-be','哈贝'),'haben':('HAH-ben','HA-benn','já-ben','hà-ben','哈本'),
 'hat':('haht','hatt','ját','hàt','哈特'),'hast':('hahst','hast','jast','hast','哈斯特'),'hatte':('HAH-tuh','HA-teu','já-te','hàt-te','哈特'),
 'sind':('zint','zinnt','sínt','sìnt','津特'),'war':('var','var','vár','vàr','瓦尔'),'waren':('VAH-ren','VA-renn','vá-ren','và-ren','瓦伦'),
 'wir':('veer','vir','vir','vir','维尔'),'sie':('zee','zi','sí','sì','齐'),'es':('es','ès','es','es','埃斯'),'du':('doo','dou','du','du','杜'),
 'er':('air','èr','er','er','埃尔'),'ihr':('eer','ir','ír','ìr','伊尔'),'mir':('meer','mir','mir','mìr','米尔'),'dir':('deer','dir','dir','dìr','迪尔'),
 'mich':('mish','mich','míj','mìch','米希'),'dich':('dish','dich','díj','dìch','迪希'),'sich':('zish','zich','síj','sìch','齐希'),
 'uns':('oons','ounss','úns','ùns','温斯'),'ihnen':('EE-nen','I-nenn','í-nen','ì-nen','伊嫩'),'euch':('oysh','oïch','óij','òich','奥伊希'),
 'auf':('owf','aouf','áuf','àuf','奥夫'),'aus':('ows','aouss','áus','àus','奥斯'),'in':('in','ine','in','in','因'),'im':('im','ime','im','im','伊姆'),
 'an':('ahn','ane','án','àn','安'),'am':('ahm','ame','ám','àm','阿姆'),'mit':('mit','mite','mit','mit','米特'),'von':('fon','fone','fón','fòn','冯'),
 'vom':('fom','fome','fóm','fòm','佛姆'),'zu':('tsoo','tsou','tsu','zu','祖'),'zum':('tsoom','tsoum','tsum','zum','祖姆'),'zur':('tsoor','tsour','tsur','zur','祖尔'),
 'bei':('by','baï','bái','bài','拜'),'beim':('bime','baïm','báim','bàim','拜姆'),'für':('fur','fur','fur','für','菲尔'),'um':('oom','oum','um','um','乌姆'),
 'nach':('nahkh','narr','naj','nach','纳赫'),'vor':('for','for','fór','fòr','佛尔'),'über':('U-ber','U-beur','ú-ber','ü-ber','于贝尔'),
 'unter':('OON-ter','OUN-teur','ún-ter','ùn-ter','温特'),'kein':('kine','kaïne','káin','càin','凯因'),'keine':('KY-nuh','KAÏ-neu','kái-ne','cài-ne','凯内'),
 'keinen':('KY-nen','KAÏ-nenn','kái-nen','cài-nen','凯嫩'),'mein':('mine','maïne','máin','màin','迈因'),'meine':('MY-nuh','MAÏ-neu','mái-ne','mài-ne','迈内'),
 'meiner':('MY-ner','MAÏ-neur','mái-ner','mài-ner','迈纳'),'meinem':('MY-nem','MAÏ-nème','mái-nem','mài-nem','迈内姆'),'meinen':('MY-nen','MAÏ-nenn','mái-nen','mài-nen','迈嫩'),
 'dein':('dine','daïne','dáin','dàin','代因'),'deine':('DY-nuh','DAÏ-neu','dái-ne','dài-ne','代内'),'deiner':('DY-ner','DAÏ-neur','dái-ner','dài-ner','代纳'),
 'sein':('zine','zaïne','sáin','sàin','赛因'),'seine':('ZY-nuh','ZAÏ-neu','sái-ne','sài-ne','赛内'),'seinen':('ZY-nen','ZAÏ-nenn','sái-nen','sài-nen','赛嫩'),'seinem':('ZY-nem','ZAÏ-nème','sái-nem','sài-nem','赛内姆'),
 'wie':('vee','vi','vi','vi','维'),'wo':('voh','vo','vó','vò','沃'),'was':('vahs','vass','vas','vas','瓦斯'),'wer':('vair','vèr','ver','ver','韦尔'),
 'wenn':('ven','vène','ven','ven','文'),'ob':('op','op','óp','òp','奥普'),'so':('zoh','zo','só','sò','佐'),'ja':('yah','ya','yá','ià','亚'),
 'nein':('nine','naïne','náin','nàin','奈因'),'auch':('owkh','aourr','áuj','àuch','奥赫'),'noch':('nokh','norr','noj','noch','诺赫'),
 'schon':('shohn','chone','shón','sción','勋'),'nur':('noor','nour','núr','nùr','努尔'),'sehr':('zair','zèr','ser','ser','泽尔'),
 'hier':('heer','hir','jír','hìr','希尔'),'da':('dah','da','dá','dà','达'),'dann':('dahn','dane','dán','dàn','丹'),'denn':('den','dène','dén','dèn','登'),
 'dort':('dort','dort','dórt','dòrt','多尔特'),'als':('ahls','alss','áls','àls','阿尔斯'),'bis':('biss','biss','bis','bis','比斯'),'man':('mahn','mane','man','man','曼'),
 'wird':('virt','virt','vírt','vìrt','维尔特'),'werden':('VAIR-den','VÈR-denn','vér-den','vér-den','韦尔登'),
 'wurde':('VOOR-duh','VOUR-deu','vúr-de','vùr-de','武尔德'),'wurden':('VOOR-den','VOUR-denn','vúr-den','vùr-den','武尔登'),
 'würde':('VUR-duh','VUR-deu','vúr-de','vür-de','维尔德'),'würden':('VUR-den','VUR-denn','vúr-den','vür-den','维尔登'),'würdest':('VUR-dest','VUR-dèst','vúr-dest','vür-dest','维尔德斯特'),
 'wäre':('VAI-ruh','VÈ-reu','vé-re','vè-re','韦雷'),'wären':('VAI-ren','VÈ-renn','vé-ren','vè-ren','韦伦'),
 'hätte':('HET-tuh','HÈ-teu','jé-te','hèt-te','海特'),'hätten':('HET-ten','HÈ-tenn','jé-ten','hèt-ten','海滕'),'hättest':('HET-test','HÈ-tèst','jé-test','hèt-test','海特斯特'),
 'können':('KUH-nen','KEU-nenn','ké-nen','chö-nen','克能'),'könnte':('KUHN-tuh','KEUN-teu','kén-te','chön-te','克恩特'),'könnten':('KUHN-ten','KEUN-tenn','kén-ten','chön-ten','克恩滕'),
 'kann':('kahn','kane','kán','càn','坎'),'kannst':('kahnst','kannst','kánst','cànst','坎斯特'),'möchte':('MUHSH-tuh','MEUCH-teu','méj-te','möch-te','默希特'),
 'muss':('moos','mouss','mús','mùs','穆斯'),'müssen':('MUS-sen','MU-senn','mú-sen','müs-sen','米森'),'will':('vil','vil','víl','vìl','维尔'),
 'soll':('zol','zol','sól','sòl','佐尔'),'sollen':('ZOL-len','ZO-lenn','só-len','sòl-len','佐伦'),'sollte':('ZOL-tuh','ZOL-teu','sól-te','sòl-te','佐尔特'),
 'lassen':('LAHS-sen','LA-senn','lá-sen','làs-sen','拉森'),'lässt':('lest','lèst','lést','lèst','莱斯特'),'lasse':('LAHS-suh','LA-seu','lá-se','làs-se','拉瑟'),
 'gibt':('gipt','guipt','guípt','ghìpt','吉普特'),'geht':('gayt','guéte','guét','ghét','盖特'),'gehe':('GAY-uh','GUÉ-eu','gué-e','ghé-e','盖厄'),
 'gehen':('GAY-en','GUÉ-enn','gué-en','ghé-en','盖恩'),'geben':('GAY-ben','GUÉ-benn','gué-ben','ghé-ben','盖本'),'gegen':('GAY-gen','GUÉ-guenn','gué-guen','ghé-ghen','盖根'),
 'gelten':('GEL-ten','GUÈL-tenn','guél-ten','ghèl-ten','盖尔滕'),'gegenwärtig':('GAY-gen-vair-tish','GUÉ-guenn-vèr-tich','gué-guen-ver-tij','ghé-ghen-vèr-tich','盖根韦尔蒂希'),
 'gegensatz':('GAY-gen-zahts','GUÉ-guenn-zatss','gué-guen-sats','ghé-ghen-sàz','盖根扎茨'),'gerade':('guh-RAH-duh','gueu-RA-deu','gue-rá-de','ghe-rà-de','格拉德'),
 'sagen':('ZAH-gen','ZA-guenn','sá-guen','sà-ghen','扎根'),'sagt':('zahkt','zakt','sákt','sàct','扎克特'),'gesagt':('guh-ZAHKT','gueu-ZAKT','gue-sákt','ghe-sàct','格扎克特'),
 'machen':('MAHKH-en','MA-rrenn','má-jen','mà-chen','马痕'),'macht':('mahkht','marrt','májt','màcht','马赫特'),
 'heute':('HOY-tuh','HOÏ-teu','jói-te','hòi-te','霍伊特'),'morgen':('MOR-gen','MOR-guenn','mór-guen','mòr-ghen','摩根'),
 'gestern':('GES-tern','GUÈS-teurn','gués-tern','ghès-tern','盖斯滕'),'jetzt':('yetst','yètst','yétst','ièzt','耶茨特'),
 'gut':('goot','gout','gút','gùt','古特'),'mehr':('mair','mèr','mér','mér','梅尔'),'viel':('feel','fil','fíl','fìl','菲尔'),
 'zeit':('TSITE','TSAÏT','tsáit','zàit','茨艾特'),'geld':('gelt','guèlt','guélt','ghèlt','盖尔特'),'gern':('gairn','guèrn','guérn','ghèrn','盖恩'),
 'gerne':('GAIR-nuh','GUÈR-neu','guér-ne','ghèr-ne','盖尔内'),'bitte':('BIT-tuh','BIT-teu','bí-te','bì-te','比特'),'danke':('DAHN-kuh','DANN-keu','dán-ke','dàn-che','当克'),
 'zurück':('tsoo-RUK','tsou-RUK','tsu-rúk','zu-rüc','祖吕克'),'chef':('shef','chèf','shéf','scèf','谢夫'),
 'restaurant':('res-toh-RAHNG','rès-to-RANG','res-to-ráng','re-sto-ràn','雷斯托朗'),'hotel':('ho-TEL','o-TÈL','jo-tél','ho-tèl','霍特尔'),
 'okay':('oh-KAY','o-KÉ','o-kéi','o-kèi','欧凯'),'homeoffice':('HOHM-of-fis','HOME-o-fiss','jóm-ó-fis','hòm-òf-fis','霍姆奥菲斯'),
 'kredit':('kray-DEET','kré-DITE','kre-dít','cre-dìt','克雷迪特'),'privat':('pree-VAHT','pri-VATE','pri-vát','pri-vàt','普里瓦特'),
 'inflation':('in-flah-TSYOHN','ine-fla-TSIONE','in-fla-tsión','in-fla-ziòn','因弗拉齐翁'),'kontrolle':('kon-TROL-luh','kone-TRO-leu','kon-tró-le','con-tròl-le','孔特罗勒'),
 'überzeugt':('u-ber-TSOYKT','u-beur-TSOÏKT','u-ber-tsóikt','ü-ber-zòict','于贝尔佐伊克特'),'überzeugen':('u-ber-TSOY-gen','u-beur-TSOÏ-guenn','u-ber-tsói-guen','ü-ber-zòi-ghen','于贝尔佐伊根'),
 'überlegen':('u-ber-LAY-gen','u-beur-LÉ-guenn','u-ber-lé-guen','ü-ber-lé-ghen','于贝尔莱根'),'übernimmt':('u-ber-NIMT','u-beur-NIMT','u-ber-nímt','ü-ber-nìmt','于贝尔尼姆特'),
 'überraschen':('u-ber-RAH-shen','u-beur-RA-chenn','u-ber-rá-shen','ü-ber-rà-scen','于贝尔拉申'),'überfragt':('u-ber-FRAHKT','u-beur-FRAKT','u-ber-frákt','ü-ber-fràct','于贝尔弗拉克特'),
 'überfüllt':('u-ber-FULT','u-beur-FULT','u-ber-fúlt','ü-ber-fült','于贝尔菲尔特'),'überwiegt':('u-ber-VEEKT','u-beur-VIKT','u-ber-víkt','ü-ber-vìct','于贝尔维克特'),
 'übersetzen':('u-ber-ZET-sen','u-beur-ZÈT-senn','u-ber-sét-sen','ü-ber-sèt-sen','于贝尔泽岑'),'übersetzung':('u-ber-ZET-soong','u-beur-ZÈT-soung','u-ber-sét-sung','ü-ber-sèt-sung','于贝尔泽聪'),
 'angeblich':('AHN-gayp-lish','ANE-guép-lich','án-guep-lij','àn-ghép-lich','安盖普利希'),'angebot':('AHN-guh-boht','ANE-gueu-bote','án-gue-bót','àn-ghe-bòt','安格博特'),
 'dazwischengekommen':('dah-TSVISH-en-guh-kom-men','da-TSVI-chenn-gueu-ko-menn','da-tsví-shen-gue-kó-men','da-zvì-scen-ghe-còm-men','达茨维申格科门'),
 'wetterbericht':('VET-ter-buh-risht','VÈ-teur-beu-richt','vé-ter-be-ríjt','vèt-ter-be-rìcht','韦特贝里希特'),'laufenden':('LOW-fen-den','LAOU-fenn-denn','láu-fen-den','làu-fen-den','劳芬登'),
 'einchecken':('INE-tshe-ken','AÏNE-tchè-kenn','áin-che-ken','àin-cec-chen','艾因切肯'),'auschecken':('OWS-tshe-ken','AOUSS-tchè-kenn','áus-che-ken','àus-cec-chen','奥斯切肯'),
 'online':('ON-line','ONE-laïne','ón-lain','òn-lain','昂莱恩'),'boarding':('BOR-ding','BOR-dinng','bór-ding','bòr-ding','博尔丁'),'gate':('gayt','guéte','guéit','ghèit','盖特'),
 'container':('kon-TAY-ner','kone-TÈ-neur','kon-téi-ner','con-tèi-ner','孔泰纳'),'mail':('mail','mèl','meil','meil','梅尔'),'e':('ay','é','e','e','伊'),
 'penizillin':('pay-nee-tsi-LEEN','pé-ni-tsi-LINE','pe-ni-tsi-lín','pe-ni-zi-lìn','佩尼齐林'),'tour':('toor','tour','túr','tùr','图尔'),
 'touristeninformation':('too-ris-ten-in-for-mah-TSYOHN','tou-riss-tenn-ine-for-ma-TSIONE','tu-ris-ten-in-for-ma-tsión','tu-ri-sten-in-for-ma-ziòn','图里斯滕因佛尔马齐翁'),
 'faktoren':('fahk-TOH-ren','fak-TO-renn','fak-tó-ren','fac-tò-ren','法克托伦'),'ponyhof':('POH-nee-hohf','PO-ni-hofe','pó-ni-jóf','pò-ni-hòf','波尼霍夫'),
 'qualität':('kvah-lee-TAYT','kva-li-TÈTE','kva-li-tét','cva-li-tèt','克瓦利泰特'),'qualitätskontrolle':('kvah-lee-TAYTS-kon-trol-luh','kva-li-TÈTSS-kone-tro-leu','kva-li-téts-kon-tró-le','cva-li-tèts-con-tròl-le','克瓦利泰茨孔特罗勒'),
 'produktion':('pro-dook-TSYOHN','pro-douk-TSIONE','pro-duk-tsión','pro-duc-ziòn','普罗杜克齐翁'),
 'produktionskapazität':('pro-dook-TSYOHNS-kah-pah-tsi-tayt','pro-douk-TSIONSS-ka-pa-tsi-tète','pro-duk-tsións-ka-pa-tsi-tét','pro-duc-ziòns-ca-pa-zi-tèt','普罗杜克齐翁斯卡帕齐泰特'),
 'allergisch':('ah-LAIR-gish','a-LÈR-guich','a-lér-guish','al-lèr-ghisc','阿莱尔吉什'),'unternehmen':('oon-ter-NAY-men','oun-teur-NÉ-menn','un-ter-né-men','un-ter-né-men','温特内门'),
 'fabrik':('fah-BREEK','fa-BRIK','fa-brík','fa-brìc','法布里克'),'rabatt':('rah-BAHT','ra-BATT','ra-bát','ra-bàt','拉巴特'),
 'voraus':('fo-ROWS','fo-RAOUSS','fo-ráus','fo-ràus','佛劳斯'),'abgemacht':('AHP-guh-mahkht','AP-gueu-marrt','áp-gue-májt','àp-ghe-màcht','阿普格马赫特'),
 'wlan':('VAY-lahn','VÉ-lane','vé-lan','vé-lan','韦兰'),'passwort':('PAHS-vort','PASS-vort','pás-vort','pàs-vort','帕斯沃尔特'),
 'screenshot':('SKREEN-shot','SKRINE-chotte','skrín-shot','scrìn-sciot','斯克林朔特'),'app':('ep','èp','ap','ap','阿普'),
 'handy':('HEN-dee','HÈN-di','jén-di','hèn-di','亨迪'),'display':('dis-PLAY','diss-PLÈ','dis-pléi','dis-plèi','迪斯普莱'),
 'interview':('IN-ter-vyoo','INE-teur-viou','ín-ter-viu','ìn-ter-viu','因特维尤'),'akzent':('ahk-TSENT','ak-TSÈNT','ak-tsént','ac-zènt','阿克岑特'),
 'energien':('ay-nair-GEE-en','é-nèr-GUI-enn','e-ner-guí-en','e-ner-ghì-en','埃内尔吉恩'),'statistik':('shtah-TIS-tik','chta-TIS-tik','shta-tís-tik','sta-tì-stic','什塔蒂斯蒂克'),
 'toi':('toy','toï','tói','tòi','托伊'), 'papiere':('pah-PEE-ruh', 'pa-PI-reu', 'pa-pí-re', 'pa-pì-re', '帕皮雷'), 'hinterfragen':('hin-ter-FRAH-gen', 'hine-tèr-FRA-guenn', 'jin-ter-frá-guen', 'hin-ter-frà-ghen', '欣特弗拉根'), 'termin':('tair-MEEN', 'tèr-MINE', 'ter-mín', 'ter-mìn', '泰尔明'), 'formular':('for-moo-LAHR', 'for-mou-LAR', 'for-mu-lár', 'for-mu-làr', '佛尔穆拉尔'), 'protokoll':('pro-toh-KOL', 'pro-to-KOL', 'pro-to-kól', 'pro-to-còll', '普罗托科尔'), 'original':('o-ree-gee-NAHL', 'o-ri-gui-NAL', 'o-ri-gui-nál', 'o-ri-ghi-nàl', '奥里吉纳尔'), 'dokument':('do-koo-MENT', 'do-kou-MÈNT', 'do-ku-mént', 'do-cu-mènt', '多库门特'), 'kopie':('ko-PEE', 'ko-PI', 'ko-pí', 'co-pì', '科皮'), 'kaution':('kow-TSYOHN', 'kaou-TSIONE', 'kau-tsión', 'cau-ziòn', '考齐翁'), 'vermieter':('fer-MEE-ter', 'fèr-MI-teur', 'fer-mí-ter', 'fer-mì-ter', '费尔米特'), 'hausordnung':('HOWS-ord-noong', 'HAOUSS-ord-noung', 'jáus-ord-nung', 'hàus-ord-nung', '豪斯奥尔特农'), 'spediteur':('shpay-dee-TUHR', 'chpé-di-TEUR', 'shpe-di-tér', 'spe-di-tör', '什佩迪特尔'), 'spediteurs':('shpay-dee-TUHRS', 'chpé-di-TEURSS', 'shpe-di-térs', 'spe-di-törs', '什佩迪特尔斯'), 'probiere':('pro-BEE-ruh', 'pro-BI-reu', 'pro-bí-re', 'pro-bì-re', '普罗比雷'), 'probieren':('pro-BEE-ren', 'pro-BI-renn', 'pro-bí-ren', 'pro-bì-ren', '普罗比伦'), 'durchs':('doorkhs', 'dourrss', 'dúrjs', 'dùrchs', '杜尔赫斯'), 'schauspieler':('SHOW-shpee-ler', 'CHAOU-chpi-leur', 'sháu-shpi-ler', 'sciàu-spi-ler', '绍什皮勒'), 'schauspielerin':('SHOW-shpee-lay-rin', 'CHAOU-chpi-lé-rine', 'sháu-shpi-le-rin', 'sciàu-spi-le-rin', '绍什皮勒林'), 'vorbehaltlich':('for-buh-HAHLT-lish', 'for-beu-HALT-lich', 'for-be-jált-lij', 'for-be-hàlt-lich', '佛尔贝哈尔特利希'), 'perspektivwechsel':('per-spek-TEEF-vek-sel', 'pèr-spèk-TIF-vèk-seul', 'per-spek-tíf-vek-sel', 'per-spet-tìf-vec-sel', '佩尔斯佩克蒂夫韦克瑟尔'), 'gespräch':('guh-SHPRAYSH', 'gueu-CHPRÈCH', 'gue-shpréj', 'ghe-sprèch', '格什普雷希'), 'kompromiss':('kom-pro-MIS', 'kome-pro-MISS', 'kom-pro-mís', 'com-pro-mìs', '孔普罗米斯'), 'perspektive':('pair-spek-TEE-vuh', 'pèr-spèk-TI-veu', 'per-spek-tí-ve', 'per-spet-tì-ve', '佩尔斯佩克蒂弗'), 'reklamation':('ray-klah-mah-TSYOHN', 'ré-kla-ma-TSIONE', 're-kla-ma-tsión', 're-cla-ma-ziòn', '雷克拉马齐翁'), 'akkreditiv':('ah-kray-dee-TEEF', 'a-kré-di-TIF', 'a-kre-di-tíf', 'ac-cre-di-tìf', '阿克雷迪蒂夫'), 'vollmacht':('FOL-mahkht', 'FOL-marrt', 'fól-majt', 'fòl-macht', '佛尔马赫特'), 'notar':('noh-TAHR', 'no-TAR', 'no-tár', 'no-tàr', '诺塔尔'), 'tendenz':('ten-DENTS', 'tène-DÈNNTS', 'ten-dénts', 'ten-dènz', '滕登茨'), 'souvenir':('zoo-vay-NEER', 'sou-veu-NIR', 'su-ve-nír', 'su-ve-nìr', '苏弗尼尔'), 'hypothese':('hu-poh-TAY-zuh', 'u-po-TÉ-zeu', 'ju-po-té-se', 'ü-po-té-se', '许波泰泽'), 'kulanz':('koo-LAHNTS', 'kou-LANNTS', 'ku-lánts', 'cu-lànz', '库兰茨'), 'prototyp':('PROH-toh-tup', 'PRO-to-tup', 'pró-to-tup', 'prò-to-tüp', '普罗托蒂普'), 'konditionen':('kon-dee-TSYOH-nen', 'kone-di-TSIO-nenn', 'kon-di-tsió-nen', 'con-di-ziò-nen', '孔迪齐奥嫩'), 'paragraf':('pah-rah-GRAHF', 'pa-ra-GRAF', 'pa-ra-gráf', 'pa-ra-gràf', '帕拉格拉夫'), 'sanitäter':('zah-nee-TAY-ter', 'za-ni-TÈ-teur', 'sa-ni-té-ter', 'sa-ni-tè-ter', '萨尼泰特'), 'empfehlung':('em-PFAY-loong', 'ème-PFÉ-loung', 'em-pfé-lung', 'em-pfé-lung', '恩普费隆'), 'portion':('por-TSYOHN', 'por-TSIONE', 'por-tsión', 'por-ziòn', '波尔齐翁'), 'intuition':('in-too-ee-TSYOHN', 'ine-tou-i-TSIONE', 'in-tu-i-tsión', 'in-tu-i-ziòn', '因图伊齐翁'), 'geldautomat':('GELT-ow-toh-maht', 'GUÈLT-aou-to-mate', 'guélt-au-to-mat', 'ghèlt-au-to-mat', '盖尔特奥托马特'), 'automat':('ow-toh-MAHT', 'aou-to-MATE', 'au-to-mát', 'au-to-màt', '奥托马特'), 'geehrte':('guh-AIR-tuh', 'gueu-ÈR-teu', 'gue-ér-te', 'ghe-èr-te', '格埃尔特'), 'reserve':('ray-ZER-vuh', 'ré-ZÈR-veu', 're-sér-ve', 're-sèr-ve', '雷泽尔弗'), 'zollabwicklung':('TSOL-ahp-vik-loong', 'TSOL-ap-vi-kloung', 'tsól-ap-vi-klung', 'zòll-ap-vic-lung', '措尔阿普维克隆'), 'visitenkarte':('vee-ZEE-ten-kahr-tuh', 'vi-ZI-tène-kar-teu', 'vi-sí-ten-kar-te', 'vi-sì-ten-car-te', '维齐滕卡特'), 'stipendium':('shtee-PEN-dee-oom', 'chti-PÈN-di-oum', 'shti-pén-di-um', 'sti-pèn-di-um', '什蒂彭迪乌姆'), 'deadline':('DED-line', 'DÈD-laïne', 'déd-lain', 'dèd-lain', '戴德莱恩'), 'nuance':('nu-AHNG-suh', 'nu-ANSS-eu', 'nu-án-se', 'nu-àn-se', '尼昂瑟'), 'metapher':('may-TAH-fer', 'mé-TA-feur', 'me-tá-fer', 'me-tà-fer', '梅塔弗'), 'weltanschauung':('VELT-ahn-show-oong', 'VÈLT-ane-chaou-oung', 'vélt-an-shau-ung', 'vèlt-an-sciàu-ung', '韦尔特安绍翁'), 'statistiken':('shtah-TIS-tee-ken', 'chta-TISS-ti-kenn', 'shta-tís-ti-ken', 'sta-tì-sti-chen', '什塔蒂斯蒂肯'), 'materialfehler':('mah-tay-ree-AHL-fay-ler', 'ma-té-ri-AL-fé-leur', 'ma-te-ri-ál-fe-ler', 'ma-te-ri-àl-fé-ler', '马特里阿尔费勒'), 'furnier':('foor-NEER', 'four-NIR', 'fur-nír', 'fur-nìr', '富尔尼尔'), 'medium':('MAY-dee-oom', 'MÉ-di-oum', 'mé-di-um', 'mé-di-um', '梅迪乌姆'), 'ironie':('ee-roh-NEE', 'i-ro-NI', 'i-ro-ní', 'i-ro-nì', '伊罗尼'), 'termine':('tair-MEE-nuh', 'tèr-MI-neu', 'ter-mí-ne', 'ter-mì-ne', '泰尔米内'), 'problem':('pro-BLAYM', 'pro-BLÈME', 'pro-blém', 'pro-blèm', '普罗布莱姆'), 'probleme':('pro-BLAY-muh', 'pro-BLÈ-meu', 'pro-blé-me', 'pro-blè-me', '普罗布莱梅'), 'argument':('ahr-goo-MENT', 'ar-gou-MÈNNT', 'ar-gu-mént', 'ar-gu-mènt', '阿尔古门特'), 'reform':('ray-FORM', 'ré-FORM', 're-fórm', 're-fòrm', '雷佛尔姆'), 'regierung':('ray-GEE-roong', 'ré-GUI-roung', 're-guí-rung', 're-ghì-rung', '雷吉隆'), 'personal':('pair-zoh-NAHL', 'pèr-zo-NAL', 'per-so-nál', 'per-so-nàl', '佩尔佐纳尔'), 'kontakt':('kon-TAHKT', 'kone-TAKT', 'kon-tákt', 'con-tàct', '孔塔克特'), 'minute':('mee-NOO-tuh', 'mi-NOU-teu', 'mi-nú-te', 'mi-nù-te', '米努特'), 'minuten':('mee-NOO-ten', 'mi-NOU-tenn', 'mi-nú-ten', 'mi-nù-ten', '米努滕'), 'spezialität':('shpay-tsyah-lee-TAYT', 'chpé-tsia-li-TÈTE', 'shpe-tsia-li-tét', 'spe-zia-li-tèt', '什佩齐亚利泰特'), 'menü':('may-NU', 'mé-NU', 'me-nú', 'me-nü', '梅尼'), 'musik':('moo-ZEEK', 'mou-ZIK', 'mu-sík', 'mu-sìc', '穆齐克'), 'papier':('pah-PEER', 'pa-PIR', 'pa-pír', 'pa-pìr', '帕皮尔'), 'paket':('pah-KAYT', 'pa-KÉTE', 'pa-két', 'pa-chét', '帕凯特'), 'total':('toh-TAHL', 'to-TAL', 'to-tál', 'to-tàl', '托塔尔'), 'rezept':('ray-TSEPT', 'ré-TSÈPT', 're-tsépt', 're-zèpt', '雷采普特'), 'priorität':('pree-oh-ree-TAYT', 'pri-o-ri-TÈTE', 'pri-o-ri-tét', 'pri-o-ri-tèt', '普里奥里泰特'), 'karton':('kahr-TONG', 'kar-TONG', 'kar-tón', 'car-tòn', '卡尔通'), 'kartons':('kahr-TONGS', 'kar-TONGSS', 'kar-tóns', 'car-tòns', '卡尔通斯'), 'prozent':('pro-TSENT', 'pro-TSÈNNT', 'pro-tsént', 'pro-zènt', '普罗岑特'), 'hundertprozentig':('hoon-dert-pro-TSEN-teesh', 'houne-dèrt-pro-TSÈNE-tich', 'jun-dert-pro-tsén-tij', 'hun-dert-pro-zèn-tich', '洪德特普罗岑蒂希'), 'differenz':('dif-fay-RENTS', 'di-fé-RÈNNTSS', 'di-fe-rénts', 'dif-fe-rènz', '迪费伦茨'), 'kollege':('kol-LAY-guh', 'ko-LÉ-gueu', 'ko-lé-gue', 'col-lé-ghe', '科莱格'), 'kollegen':('kol-LAY-gen', 'ko-LÉ-guenn', 'ko-lé-guen', 'col-lé-ghen', '科莱根'), 'lieferant':('lee-fay-RAHNT', 'li-fé-RANNT', 'li-fe-ránt', 'li-fe-rànt', '利费兰特'), 'exklusivität':('eks-kloo-zee-vee-TAYT', 'èks-klou-zi-vi-TÈTE', 'eks-klu-si-vi-tét', 'es-clu-si-vi-tèt', '埃克斯克卢齐维泰特'), 'inventur':('in-ven-TOOR', 'ine-vène-TOUR', 'in-ven-túr', 'in-ven-tùr', '因文图尔'), 'kausalität':('kow-zah-lee-TAYT', 'kaou-za-li-TÈTE', 'kau-sa-li-tét', 'cau-sa-li-tèt', '考扎利泰特'), 'konsequenz':('kon-say-KVENTS', 'kone-sé-KVÈNNTSS', 'kon-se-kvénts', 'con-se-cvènz', '孔塞克文茨'), 'horizont':('ho-ree-TSONT', 'o-ri-TSONNT', 'jo-ri-tsónt', 'ho-ri-zònt', '霍里宗特'), 'medaille':('may-DAHL-yuh', 'mé-DAL-yeu', 'me-dál-ye', 'me-dàl-ie', '梅达利耶'), 'detail':('day-TIE', 'dé-TAÏ', 'de-tái', 'de-tài', '德泰'), 'kompliment':('kom-plee-MENT', 'kome-pli-MÈNNT', 'kom-pli-mént', 'com-pli-mènt', '孔普利门特'), 'massiv':('mahs-SEEF', 'ma-SIF', 'ma-síf', 'mas-sìf', '马西夫'), 'rasant':('rah-ZAHNT', 'ra-ZANNT', 'ra-sánt', 'ra-sànt', '拉赞特'), 'allein':('ahl-LINE', 'a-LAÏNE', 'a-láin', 'al-làin', '阿尔莱恩'), 'ironisch':('ee-ROH-neesh', 'i-RO-nich', 'i-ró-nish', 'i-rò-nisc', '伊罗尼什'), 'realistisch':('ray-ah-LIS-teesh', 'ré-a-LISS-tich', 're-a-lís-tish', 're-a-lì-stisc', '雷阿利斯蒂什'), 'sympathisch':('zum-PAH-teesh', 'zume-PA-tich', 'sum-pá-tish', 'süm-pà-tisc', '聚姆帕蒂什'), 'maschine':('mah-SHEE-nuh', 'ma-CHI-neu', 'ma-shí-ne', 'ma-scì-ne', '马希内'), 'kapazitätsgrenze':('kah-pah-tsee-TAYTS-gren-tsuh', 'ka-pa-tsi-TÈTSS-grène-tseu', 'ka-pa-tsi-téts-gren-tse', 'ca-pa-zi-tèts-gren-ze', '卡帕齐泰茨格伦策'), 'charge':('SHAR-zhuh', 'CHAR-jeu', 'shár-she', 'sciàr-ge', '沙尔热'), 'chargen':('SHAR-zhen', 'CHAR-jenn', 'shár-shen', 'sciàr-gen', '沙尔任'), 'beispiel':('BY-shpeel','BAÏ-chpil','bái-shpil','bài-spil','拜什皮尔'), 'beispiele':('BY-shpee-luh','BAÏ-chpi-leu','bái-shpi-le','bài-spi-le','拜什皮勒'), 'chemie':('shay-MEE','ché-MI','je-mí','che-mì','谢米'), 'szenario':('stsay-NAH-ree-oh','stsé-NA-ri-o','stse-ná-ri-o','sze-nà-ri-o','斯策纳里奥'), 'jetlag':('DJET-lek', 'DJÈT-lèk', 'yét-lak', 'gèt-lak', '杰特莱克'), 'meeting':('MEE-teeng', 'MI-tinng', 'mí-ting', 'mì-ting', '米廷'), 'steak':('stayk', 'stèk', 'stéik', 'stèic', '斯泰克'), 'case':('kays', 'kèss', 'kéis', 'chèis', '凯斯'), 'level':('LEH-vel', 'LÈ-veul', 'lé-vel', 'lè-vel', '莱韦尔'), 'teams':('teems', 'timss', 'tíms', 'tìms', '蒂姆斯'), 'chancen':('SHAHN-sen', 'CHANN-senn', 'shán-sen', 'sciàn-sen', '尚森'), 'familie':('fah-MEE-lyuh', 'fa-MI-lieu', 'fa-mí-lie', 'fa-mì-lie', '法米利耶'), 'batterie':('bah-tay-REE', 'ba-té-RI', 'ba-te-rí', 'bat-te-rì', '巴特里'), 'trinkspruch':('TRINK-shprookh', 'TRINNK-chprourr', 'trínk-shpruj', 'trìnc-spruch', '特林克什普鲁赫'), 'liegestuhl':('LEE-guh-shtool', 'LI-gueu-chtoul', 'lí-gue-shtul', 'lì-ghe-stul', '利格什图尔'), 'kontostand':('KON-toh-shtahnt', 'KONE-to-chtannt', 'kón-to-shtant', 'còn-to-stant', '孔托什坦特'), 'katzensprung':('KAH-tsen-shproong', 'KA-tsène-chproung', 'ká-tsen-shprung', 'cà-zen-sprung', '卡岑什普龙'), 'nachspeise':('NAHKH-shpy-zuh', 'NARR-chpaï-zeu', 'náj-shpai-se', 'nàch-spai-se', '纳赫什派泽'), 'maßstab':('MAHS-shtahp', 'MASS-chtap', 'más-shtap', 'màs-stap', '马斯什塔普'), 'muttersprache':('MOO-ter-shprah-khuh', 'MOU-tèr-chpra-rreu', 'mú-ter-shpra-je', 'mù-ter-spra-che', '穆特什普拉赫'), 'fremdsprache':('FREMT-shprah-khuh', 'FRÈMT-chpra-rreu', 'frémt-shpra-je', 'frèmt-spra-che', '弗雷姆特什普拉赫'), 'aussprache':('OWS-shprah-khuh', 'AOUSS-chpra-rreu', 'áus-shpra-je', 'àus-spra-che', '奥斯什普拉赫'), 'serienproduktion':('ZAY-ree-en-pro-dook-TSYOHN', 'ZÉ-ri-ène-pro-douk-TSIONE', 'sé-ri-en-pro-duk-tsión', 'sé-ri-en-pro-duc-ziòn', '泽里恩普罗杜克齐翁'), 'nächste':('NAYSH-stuh', 'NÈCH-steu', 'néj-ste', 'nèch-ste', '内希斯特'), 'nächsten':('NAYSH-sten', 'NÈCH-stenn', 'néj-sten', 'nèch-sten', '内希斯滕'), 'demnächst':('dem-NAYSHST', 'dème-NÈCHST', 'dem-néjst', 'dem-nèchst', '德姆内希斯特'), 'höchste':('HUHSH-stuh', 'HEUCH-steu', 'jéj-ste', 'höch-ste', '赫希斯特'), 'höchstwahrscheinlich':('huhshst-vahr-SHINE-lish', 'heuchst-var-CHAÏNE-lich', 'jejst-var-sháin-lij', 'höchst-var-sciàin-lich', '赫希斯特瓦尔沙因利希'), 'ohnehin':('oh-nay-HIN', 'o-né-HINE', 'o-ne-jín', 'o-né-hìn', '奥内欣'), 'nachzuhaken':('NAHKH-tsoo-hah-ken', 'NARR-tsou-ha-kenn', 'náj-tsu-ja-ken', 'nàch-zu-ha-chen', '纳赫祖哈肯'), 'hausarbeit':('HOWS-ahr-bite', 'HAOUSS-ar-baït', 'jáus-ar-bait', 'hàus-ar-bait', '豪斯阿尔拜特'), 'quelle':('KVEL-luh', 'KVÈ-leu', 'kvé-le', 'cvèl-le', '克韦勒'), 'unser':('OON-zer', 'OUNE-zeur', 'ún-ser', 'ùn-ser', '温泽尔'), 'pc':('pay-TSAY', 'pé-TSÉ', 'pe-tsé', 'pe-zè', '佩采'), 'b':('bay', 'bé', 'be', 'be', '贝'), 'lkw':('el-kah-VAY', 'èl-ka-VÉ', 'el-ka-vé', 'el-ca-vé', '埃尔卡维'), 'improvisieren':('im-pro-vee-ZEE-ren', 'ime-pro-vi-ZI-renn', 'im-pro-vi-sí-ren', 'im-pro-vi-sì-ren', '伊姆普罗维齐伦'), 'improvisiert':('im-pro-vee-ZEERT', 'ime-pro-vi-ZIRT', 'im-pro-vi-sírt', 'im-pro-vi-sìrt', '伊姆普罗维齐尔特'), 'reservieren':('ray-zer-VEE-ren', 'ré-zèr-VI-renn', 're-ser-ví-ren', 'ré-ser-vì-ren', '雷泽尔维伦'), 'reserviert':('ray-zer-VEERT', 'ré-zèr-VIRT', 're-ser-vírt', 'ré-ser-vìrt', '雷泽尔维尔特'), 'renoviert':('ray-noh-VEERT', 'ré-no-VIRT', 're-no-vírt', 'ré-no-vìrt', '雷诺维尔特'), 'vegetarisch':('vay-gay-TAH-reesh', 'vé-gué-TA-rich', 've-gue-tá-rish', 've-ghe-tà-risc', '韦格塔里什'), 'vegetarische':('vay-gay-TAH-ree-shuh', 'vé-gué-TA-ri-cheu', 've-gue-tá-ri-she', 've-ghe-tà-ri-sce', '韦格塔里舍'), 'visiten':('vee-ZEE-ten', 'vi-ZI-tenn', 'vi-sí-ten', 'vi-sì-ten', '维齐滕'), 'visitenkarten':('vee-ZEE-ten-kahr-ten', 'vi-ZI-tène-kar-tenn', 'vi-sí-ten-kar-ten', 'vi-sì-ten-car-ten', '维齐滕卡滕'), 'fingerspitzengefühl':('FING-er-shpi-tsen-guh-ful', 'FINNG-èr-chpi-tsène-gueu-ful', 'fíng-er-shpi-tsen-gue-ful', 'fìng-er-spi-zen-ghe-fül', '芬厄什皮岑格菲尔'), 'herangehensweise':('hay-RAHN-gay-ens-vy-zuh', 'hé-RANE-gué-ènss-vaï-zeu', 'je-rán-gue-ens-vai-se', 'he-ràn-ghé-ens-vai-se', '黑兰盖恩斯瓦伊泽'), 'entgegengebrachte':('ent-GAY-gen-guh-brahkh-tuh', 'ènnt-GUÉ-guène-gueu-brarr-teu', 'ent-gué-guen-gue-braj-te', 'ent-ghé-ghen-ghe-bràch-te', '恩特盖根格布拉赫特'), 'anscheinend':('AHN-shy-nent', 'ANE-chaï-nènnt', 'án-shai-nent', 'àn-sciai-nent', '安沙伊嫩特'), 'offensichtlich':('OF-fen-zisht-lish', 'O-fènn-zicht-lich', 'ó-fen-sijt-lij', 'òf-fen-sicht-lich', '奥芬齐希特利希'), 'möglicherweise':('MUHG-lish-er-vy-zuh', 'MEUG-li-cheur-vaï-zeu', 'még-lij-er-vai-se', 'mög-lich-er-vai-se', '默格利希尔瓦伊泽'), 'durchstellen':('DOORSH-shtel-len', 'DOURCH-chtè-lenn', 'dúrj-shtel-len', 'dùrch-stel-len', '杜尔希什特伦'), 'enthält':('ent-HELT', 'ènnt-HÈLT', 'ent-jélt', 'ent-hèlt', '恩特黑尔特'), 'enthalten':('ent-HAHL-ten', 'ènnt-HAL-tenn', 'ent-jál-ten', 'ent-hàl-ten', '恩特哈尔滕'), 'mithilfe':('mit-HIL-fuh', 'mite-HIL-feu', 'mit-jíl-fe', 'mit-hìl-fe', '米特希尔弗'), 'machst':('mahkhst', 'marrst', 'májst', 'màchst', '马赫斯特'), 'elefanten':('ay-lay-FAHN-ten', 'é-lé-FANN-tenn', 'e-le-fán-ten', 'e-le-fàn-ten', '埃莱凡滕'), 'voraussetzung':('fo-ROWS-ze-tsoong', 'fo-RAOUSS-zè-tsoung', 'fo-ráus-se-tsung', 'fo-ràus-se-zung', '佛劳斯泽聪'), 'vorausgesetzt':('fo-ROWS-guh-zetst', 'fo-RAOUSS-gueu-zètst', 'fo-ráus-gue-setst', 'fo-ràus-ghe-sezt', '佛劳斯格泽茨特'), 'veranstalten':('fer-AHN-shtahl-ten', 'fèr-ANE-chtal-tenn', 'fer-án-shtal-ten', 'fer-àn-stal-ten', '费尔安什塔尔滕'), 'herausstellen':('hay-ROWS-shtel-len', 'hé-RAOUSS-chtè-lenn', 'je-ráus-shtel-len', 'he-ràus-stel-len', '黑劳斯什特伦'), 'feststellen':('FEST-shtel-len', 'FÈST-chtè-lenn', 'fést-shtel-len', 'fèst-stel-len', '费斯特什特伦'), 'ausgesperrt':('OWS-guh-shpert', 'AOUSS-gueu-chpèrt', 'áus-gue-shpert', 'àus-ghe-spert', '奥斯格什佩尔特'), 'baustelle':('BOW-shtel-luh', 'BAOU-chtè-leu', 'báu-shtel-le', 'bàu-stel-le', '包什特勒'), 'abstimmen':('AHP-shti-men', 'AP-chti-menn', 'áp-shti-men', 'àp-sti-men', '阿普什蒂门'), 'wohlstand':('VOHL-shtahnt', 'VOL-chtannt', 'vól-shtant', 'vòl-stant', '沃尔什坦特'), 'anstieg':('AHN-shteek', 'ANE-chtik', 'án-shtik', 'àn-stik', '安什蒂克'), 'geeignet':('guh-EYE-gnet', 'gueu-AÏ-gneut', 'gue-ái-gnet', 'ghe-ài-ghnet', '格艾格内特'), 'geeinigt':('guh-EYE-neegt', 'gueu-AÏ-nigt', 'gue-ái-nigt', 'ghe-ài-nigt', '格艾尼克特'), 'davongekommen':('dah-FON-guh-kom-men', 'da-FONE-gueu-ko-menn', 'da-fón-gue-ko-men', 'da-fòn-ghe-com-men', '达丰格科姆门'), 'konstruktive':('kon-strook-TEE-vuh', 'kone-strouk-TI-veu', 'kon-struk-tí-ve', 'con-struc-tì-ve', '孔斯特鲁克蒂弗'), 'konkurrenz':('kon-koo-RENTS', 'kone-kou-RÈNNTSS', 'kon-ku-rénts', 'con-cur-rènz', '孔库伦茨'), 'digitalisierung':('dee-gee-tah-lee-ZEE-roong', 'di-gui-ta-li-ZI-roung', 'di-gui-ta-li-sí-rung', 'di-ghi-ta-li-sì-rung', '迪吉塔利齐隆'), 'klimaanlage':('KLEE-mah-ahn-lah-guh', 'KLI-ma-ane-la-gueu', 'klí-ma-an-la-gue', 'clì-ma-an-la-ghe', '克利马安拉格'), 'budget':('bu-DJAY', 'bu-DJÉ', 'bu-dyé', 'bu-gè', '比杰'), 'gestatten':('guh-SHTAH-ten', 'gueu-CHTA-tenn', 'gue-shtá-ten', 'ghe-stàt-ten', '格什塔滕'), 'vorgesehene':('FOR-guh-zay-uh-nuh', 'FOR-gueu-zé-eu-neu', 'fór-gue-se-e-ne', 'fòr-ghe-sé-e-ne', '佛尔格泽内'), 'kennengelernt':('KEN-nen-guh-lernt', 'KÈ-nenn-gueu-lèrnt', 'ké-nen-gue-lernt', 'chèn-nen-ghe-lernt', '肯嫩格莱尔恩特'), 'kennenlernen':('KEN-nen-ler-nen', 'KÈ-nenn-lèr-nenn', 'ké-nen-ler-nen', 'chèn-nen-ler-nen', '肯嫩莱尔嫩'), 'gebührenordnung':('guh-BU-ren-ord-noong', 'gueu-BU-renn-ord-noung', 'gue-bú-ren-ord-nung', 'ghe-bü-ren-ord-nung', '格比伦奥尔特农'), 'entzieht':('ent-TSEET', 'ènnt-TSIT', 'ent-tsít', 'ent-zìt', '恩特齐特'), 'kaffee':('KAHF-fay', 'KA-fé', 'ká-fe', 'càf-fè', '卡费'), 'revidiere':('ray-vee-DEE-ruh', 'ré-vi-DI-reu', 're-vi-dí-re', 're-vi-dì-re', '雷维迪雷'), 'revidieren':('ray-vee-DEE-ren', 'ré-vi-DI-renn', 're-vi-dí-ren', 're-vi-dì-ren', '雷维迪伦'), 'urteil':('OOR-tile', 'OUR-taïl', 'úr-tail', 'ùr-tail', '乌尔泰尔'),'garantie':('gah-rahn-TEE','ga-rane-TI','ga-ran-tí','ga-ran-tì','加兰蒂'),'arabisch':('ah-RAH-bish','a-RA-bich','a-rá-bish','a-rà-bisc','阿拉比什'),'sowohl':('zoh-VOHL','zo-VOL','so-vól','so-vòl','佐沃尔'),'tagesordnung':('TAH-ges-ord-noong','TA-guèss-ord-noung','tá-gues-ord-nung','tà-ghes-ord-nung','塔格斯奥尔特农'),'rückmeldung':('RUK-mel-doong','RUK-mèl-doung','rúk-mel-dung','rük-mel-dung','吕克梅尔敦'),'fan':('fen','fane','fan','fan','粉'),'hobby':('HOB-bee','O-bi','jó-bi','hòb-bi','霍比'),
 'spoiler':('SHPOY-ler','CHPOÏ-leur','shpói-ler','spòi-ler','什波伊勒'),'joggen':('DJOG-gen','DJO-guenn','yó-guen','giòg-ghen','乔根'),
 'gitarre':('gi-TAR-ruh','gui-TA-reu','gui-tá-re','ghi-tàr-re','吉塔雷'),'team':('teem','time','tím','tìm','蒂姆'),'job':('job','djob','yób','giòb','乔布'),
 'computer':('kom-PYOO-ter','kome-PIOU-teur','kom-piú-ter','com-più-ter','科姆皮尤特'),'internet':('IN-ter-net','INE-teur-nèt','ín-ter-net','ìn-ter-net','因特内特'),
 'ticket':('TIK-ket','TI-kète','tí-ket','tì-chet','蒂克特'),'baby':('BAY-bee','BÉ-bi','bé-bi','bè-bi','贝比'),'party':('PAR-tee','PAR-ti','pár-ti','pàr-ti','帕蒂'),
}

# faux préfixes : mots commençant par be/ge/er/ent/ver mais sans préfixe atone
NO_PREF = set("""gegenteil gegenteile gegend gegenwart gegensatz gegensätze gegensätzen beste besten bester bestes bestens besser bessern bett betten beten berg berge bergen besen beere beeren beige beil
bein beine beinahe beispiel beitrag beiträge gelb gelbe gelben gelbes geist geige gestik geier gelee gen gene genf
erste erster ersten erstes erst erde ernst ernte erbe erz erzen erna entweder ente enten verse vers""".split())
PREF_UNSTR = ('be','ge','er','ver','zer','ent','emp')
PREF_ONSET = ('auf','aus','ab','an','ein','vor','um','zu','mit','weg','los','fest','nach','ver','be','ge','er','zer','ent','emp',
              'über','unter','durch','wieder','zusammen','werk','haupt','arbeits','flug','bahn','voll','fern','früh','haus','hand','un','klein','fein')

VOWL = set('aeiouäöüy')
def _is_v(t): return bool(t) and (t[0] in 'aeiouYOE@' or t in ('ai','au','oy','er'))

def _parse(word):
    w = word.lower().replace('ß','\u017f')
    toks=[]; i=0; n=len(w)
    onset_pos={0}
    if w not in NO_PREF:
        for p in PREF_ONSET:
            if w.startswith(p) and len(w)>len(p)+2 and not w.startswith('bei'): onset_pos.add(len(p))
    while i<n:
        c=w[i]
        if w[i:i+4]=='tion' and i>0: toks+=['ts','y','o:','n']; i+=4; continue
        if w[i:i+4]=='tsch':
            if toks and not _is_v(toks[-1]): toks+=['t','S']
            else: toks.append('tS')
            i+=4; continue
        if w[i:i+3]=='sch': toks.append('S'); i+=3; continue
        if w[i:i+3]=='chs' and w[i+3:i+4]!='c' and (i+2) not in onset_pos: toks.append('ks'); i+=3; continue
        if w[i:i+2]=='ch':
            prevv=None
            for t in reversed(toks):
                if _is_v(t): prevv=t; break
            toks.append('X' if prevv in ('a','a:','o','o:','u','u:','au') else 'C'); i+=2; continue
        if w[i:i+2]=='ck': toks.append('k'); i+=2; continue
        if w[i:i+2]=='tz': toks.append('ts'); i+=2; continue
        if w[i:i+2]=='qu': toks.append('kv'); i+=2; continue
        if w[i:i+2]=='pf': toks.append('pf'); i+=2; continue
        if w[i:i+2]=='ph': toks.append('f'); i+=2; continue
        if w[i:i+2]=='th': toks.append('t'); i+=2; continue
        if w[i:i+2]=='ng' and (i+1) not in onset_pos: toks.append('N'); i+=2; continue
        if c=='x': toks.append('ks'); i+=1; continue
        if w[i:i+2] in ('sp','st') and (i in onset_pos):
            toks+=['S', 'p' if w[i+1]=='p' else 't']; i+=2; continue
        if c=='z': toks.append('ts'); i+=1; continue
        if c=='\u017f': toks.append('s'); i+=1; continue
        if c=='s':
            toks.append('z' if (i+1<n and w[i+1] in VOWL and (i==0 or w[i-1] in VOWL or i in onset_pos)) else 's'); i+=1; continue
        if c=='v': toks.append('f'); i+=1; continue
        if c=='w': toks.append('v'); i+=1; continue
        if c=='j': toks.append('y'); i+=1; continue
        if c=='c': toks.append('k'); i+=1; continue
        if c=='h':
            nxt=w[i+1] if i+1<n else ''
            if toks and _is_v(toks[-1]) and ((nxt=='' or nxt not in VOWL) or i not in onset_pos):
                if toks[-1] in ('a','e','i','o','u','Y','O','E'): toks[-1]+=':'
                i+=1; continue
            toks.append('h'); i+=1; continue
        if w[i:i+2]=='ie' and (i+1) not in onset_pos: toks.append('i:'); i+=2; continue
        if w[i:i+2] in ('ei','ai','ey','ay') and (i+1) not in onset_pos: toks.append('ai'); i+=2; continue
        if w[i:i+2]=='au' and (i+1) not in onset_pos: toks.append('au'); i+=2; continue
        if w[i:i+2] in ('eu','äu') and (i+1) not in onset_pos: toks.append('oy'); i+=2; continue
        if w[i:i+2] in ('aa','ee','oo') and (i+1) not in onset_pos: toks.append(c+':'); i+=2; continue
        if c=='ä': toks.append('E'); i+=1; continue
        if c=='ö': toks.append('O'); i+=1; continue
        if c in 'üy': toks.append('Y'); i+=1; continue
        if c in 'aeiou': toks.append(c); i+=1; continue
        if c in 'bdfgklmnprt': toks.append(c); i+=1; continue
        i+=1
    if len(toks)>=2 and toks[-1]=='g' and toks[-2] in ('i','i:'): toks[-1]='C'
    if toks and toks[-1] in ('b','d','g'): toks[-1]={'b':'p','d':'t','g':'k'}[toks[-1]]
    out=[]
    for idx,t in enumerate(toks):
        if t in ('a','e','i','o','u','E','O','Y'):
            k=idx+1; cc=0
            while k<len(toks) and not _is_v(toks[k]): cc+=(2 if toks[k] in ('ks','ts','pf','kv','tS') else 1); k+=1
            if cc<=1: t+=':'
        out.append(t)
    return out

def _syllabify(toks):
    syls=[]; cur={'on':[],'nu':None,'co':[]}
    for t in toks:
        if _is_v(t):
            if cur['nu'] is not None:
                co=cur['co']; on=[]
                if co:
                    take=1
                    if len(co)>=2 and co[-2] in ('p','b','t','d','k','g','f','S') and co[-1] in ('l','r','v','n','m','p','t'): take=2
                    if co[-1] in ('N','X','C'): take=0
                    if take: on=co[-take:]; cur['co']=co[:-take]
                syls.append(cur); cur={'on':on,'nu':t,'co':[]}
            else: cur['nu']=t
        else:
            if cur['nu'] is None: cur['on'].append(t)
            else: cur['co'].append(t)
    if cur['nu'] is not None or cur['on']: syls.append(cur)
    if syls and syls[-1]['nu'] is None and len(syls)>1:
        syls[-2]['co']+=syls[-1]['on']; syls.pop()
    return syls

def _finalize(word, syls):
    w=word.lower()
    for k,s in enumerate(syls):
        if k==len(syls)-1 and len(syls)>1 and s['nu'] in ('e','e:'):
            if not s['co'] or (len(s['co'])<=2 and s['co'][0] in ('n','l','m','s','t','r')): s['nu']='@'

    if syls and syls[-1]['nu'] in ('e','e:','@') and syls[-1]['co']==['r'] and len(syls)>1:
        syls[-1]['nu']='er'; syls[-1]['co']=[]
    stress=0
    if w not in NO_PREF and not w.startswith('bei'):
        for p in PREF_UNSTR:
            if w.startswith(p) and len(syls)>1 and len(w)>len(p)+2:
                stress=1
                if p in ('ge','be') and syls[0]['nu'] in ('e','e:'): syls[0]['nu']='@'
                if p=='er' and syls[0]['nu'] in ('e','e:'): syls[0]['nu']='E:'
                if p in ('ver','zer','ent','emp') and syls[0]['nu'] in ('e','e:'): syls[0]['nu']='e'
                break
    if 'ieren' in w or w.endswith('iert'):
        for k,s in enumerate(syls):
            if s['nu']=='i:': stress=k
    if w.endswith('ion'): stress=len(syls)-1
    STRESS_AT={'überlassen':2,'überlasse':2,'überweisen':2,'überlaufen':2,'überrascht':2,'überraschung':2,'übertragen':2,'übertragenen':2,'übergebe':2,'übergeben':2,'überwiegen':2,'überwältigt':2,'übertreiben':2,'untertreiben':2,'überhaupt':2,'überzeugung':2,'unterwegs':2,'unterbrochen':2,'unterschreiben':2,'widersprechen':2,'widerspreche':2,'widerspricht':2,'widerlegen':2,'wiederholen':2,'wiederhole':2,'wiederholung':2,'hinterlassen':2,'hinterher':2,'zwischendurch':2,'davongekommen':2,'hingegen':1,'infolge':1,'inzwischen':1,'nachdem':1,'sobald':1,'zutiefst':1,'vorbei':1,'vorab':1,'allmählich':1,'allerdings':2,'geirrt':1,'zufrieden':1,'zufriedene':1,'zufriedener':1,'zufriedenheit':1,'verallgemeinerung':2}
    if w in STRESS_AT: stress=min(STRESS_AT[w], len(syls)-1)
    if w.endswith('ei') and len(w)>4 and len(syls)>1: stress=len(syls)-1
    if w.startswith('zurück') or w.startswith('zusammen'): stress=1
    stress=min(stress, len(syls)-1)
    for k,s in enumerate(syls):
        if k!=stress and 0<k<len(syls)-1 and s['on'] in (['g'],['b']) and s['nu'] in ('e','e:') and not s['co']: s['nu']='@'
    return syls, stress

# ---------- RENDEURS ----------
def _dedupe(co):
    out=[]
    for c in co:
        if out and out[-1]==c: continue
        out.append(c)
    return out

def _ren_en(syls, stress):
    CEN={'S':'sh','C':'sh','X':'kh','ts':'ts','tS':'tch','kv':'kv','ks':'ks','y':'y','N':'ng','v':'v','z':'z','pf':'pf'}
    VEN={'a':'ah','a:':'ah','e':'e','e:':'ay','E':'e','E:':'ay','i':'i','i:':'ee','o':'o','o:':'oh','u':'oo','u:':'oo','Y':'u','Y:':'u','O':'uh','O:':'uh','@':'uh','au':'ow','oy':'oy','er':'er'}
    out=[]
    for k,s in enumerate(syls):
        on=''.join(CEN.get(c,c) for c in s['on']); co2=_dedupe(s['co']); nu=s['nu']
        if nu is None: out.append(on); continue
        if nu=='ai':
            if not co2: out.append(on+('eye' if not s['on'] else 'y')); continue
            if len(co2)==1 and co2[0] in ('t','n','s','b','p','f','k','m','d'): out.append(on+'i'+CEN.get(co2[0],co2[0])+'e'); continue
            if co2==['n','s']: out.append(on+'ines'); continue
            out.append(on+'y'+''.join(CEN.get(c,c) for c in co2)); continue
        v='ai' if (nu=='E:' and co2[:1]==['r']) else ('e' if (nu=='@' and co2) else VEN.get(nu,nu))
        out.append(on+v+''.join(CEN.get(c,c) for c in co2))
    return [p.upper() if k==stress else p for k,p in enumerate(out)]

def _ren_fr(syls, stress):
    CFR={'S':'ch','C':'ch','X':'rr','ts':'ts','tS':'tch','kv':'kv','ks':'ks','y':'y','N':'ng','v':'v','z':'z','pf':'pf'}
    VFR={'a':'a','a:':'a','e':'è','e:':'é','E':'è','E:':'è','i':'i','i:':'i','o':'o','o:':'o','u':'ou','u:':'ou','Y':'u','Y:':'u','O':'eu','O:':'eu','@':'eu','ai':'aï','au':'aou','oy':'oï','er':'eur'}
    out=[]
    for k,s in enumerate(syls):
        if s['nu'] is None: out.append(''.join(CFR.get(c,c) for c in s['on'])); continue
        on=''.join(CFR.get(c,c) for c in s['on']); v=VFR.get(s['nu'],s['nu'])
        if on.endswith('g') and v[:1] in ('e','è','é','i'): on+='u'
        co=list(s['co'])
        if k+1<len(syls) and co and syls[k+1]['on'][:1]==co[-1:]: co=co[:-1]
        co2=_dedupe(co); body=on+v
        if co2[:1]==['n']:
            rest=co2[1:]
            m={'eu':'enn','a':'ane','i':'ine','o':'one','ou':'oune','aï':'aïne','è':'ène','é':'éne','u':'une','aou':'aoune'}
            if rest and rest[0] in ('t','d','s'): body=on+({'eu':'è'}.get(v,v))+'nn'+''.join(CFR.get(c,c) for c in rest)
            else: body=on+m.get(v,v+'ne')+''.join(CFR.get(c,c) for c in rest)
        elif co2[:1]==['N']:
            m={'i':'inng','a':'ang','ou':'oung','è':'èng','eu':'eung','o':'ong','u':'ung'}
            body=on+m.get(v,v+'ng')+''.join(CFR.get(c,c) for c in co2[1:])
        elif co2==['m']:
            m={'i':'ime','è':'ème','é':'ème','a':'ame','ou':'oum','o':'ome','eu':'eume','u':'ume'}
            body=on+m.get(v,v+'m')
        else: body+=''.join(CFR.get(c,c) for c in co2)
        if body.endswith('s') and not body.endswith('ss'): body+='s'
        out.append(body)
    return [p.upper() if k==stress else p for k,p in enumerate(out)]

def _acc(seg, table):
    for i,ch in enumerate(seg):
        if ch in table:
            if ch=='i' and i>0 and seg[i-1] in 'cg' and i+1<len(seg) and seg[i+1] in 'aeouàèòù':
                continue  # i orthographique de sci/ci/gi
            return seg[:i]+table[ch]+seg[i+1:]
    return seg

def _ren_es(syls, stress):
    CES={'S':'sh','C':'j','X':'j','h':'j','ts':'ts','tS':'ch','kv':'kv','ks':'ks','y':'y','N':'ng','v':'v','z':'s','pf':'pf'}
    VES={'a':'a','a:':'a','e':'e','e:':'e','E':'e','E:':'e','i':'i','i:':'i','o':'o','o:':'o','u':'u','u:':'u','Y':'u','Y:':'u','O':'e','O:':'e','@':'e','ai':'ai','au':'au','oy':'oi','er':'er'}
    out=[]
    for k,s in enumerate(syls):
        if s['nu'] is None: out.append(''.join(CES.get(c,c) for c in s['on'])); continue
        on=''.join(CES.get(c,c) for c in s['on'])
        if on.endswith('g') and VES.get(s['nu'],'')[:1] in ('e','i'): on+='u'
        co=list(s['co'])
        if k+1<len(syls) and co and syls[k+1]['on'][:1]==co[-1:]: co=co[:-1]
        seg=on+VES.get(s['nu'],s['nu'])+''.join(CES.get(c,c) for c in _dedupe(co))
        if k==stress: seg=_acc(seg,{'a':'á','e':'é','i':'í','o':'ó','u':'ú'})
        out.append(seg)
    return out

def _ren_it(syls, stress):
    VIT={'a':'a','a:':'a','e':'e','e:':'é','E':'e','E:':'e','i':'i','i:':'i','o':'o','o:':'o','u':'u','u:':'u','Y':'ü','Y:':'ü','O':'ö','O:':'ö','@':'e','ai':'ai','au':'au','oy':'oi','er':'er'}
    out=[]
    for k,s in enumerate(syls):
        if s['nu'] is None:
            m0={'S':'sc','C':'ch','X':'ch','ts':'z','y':'i','z':'s','kv':'cv','ks':'cs','N':'ng','tS':'c'}
            out.append(''.join(m0.get(c,c) for c in s['on'])); continue
        on_toks=list(s['on']); v=VIT.get(s['nu'],s['nu']); parts=[]
        for idx,c in enumerate(on_toks):
            if c=='S':
                if idx+1<len(on_toks): parts.append('s')
                else: parts.append('sci' if v[:1] in ('a','o','u','ö','ü') else 'sc')
            elif c=='k': parts.append('ch' if v[:1] in ('e','i','é','ö','ü') else 'c')
            elif c=='g': parts.append('gh' if v[:1] in ('e','i','é') else 'g')
            elif c=='ts': parts.append('z')
            elif c=='tS': parts.append('c' if v[:1] in ('e','i') else 'ci')
            elif c in ('C','X'): parts.append('ch')
            elif c=='y': parts.append('i')
            elif c=='z': parts.append('s')
            elif c=='kv': parts.append('cv')
            elif c=='ks': parts.append('cs')
            elif c=='N': parts.append('ng')
            else: parts.append(c)
        m={'S':'sc','C':'ch','X':'ch','ts':'z','y':'i','z':'s','kv':'cv','ks':'cs','N':'ng','tS':'c'}
        seg=''.join(parts)+v+''.join(m.get(c,c) for c in s['co'])
        if k==stress: seg=_acc(seg,{'a':'à','e':'è','i':'ì','o':'ò','u':'ù'})
        out.append(seg)
    return out

# ---------- HANZI ----------
HV0={'a':'阿','e':'埃','i':'伊','o':'奥','u':'乌','ai':'艾','au':'奥','oy':'奥伊','Y':'于','O':'厄','@':'厄','er':'尔'}
_rows={
 'b':'巴 贝 比 博 布 拜 包 博伊 比 伯 贝','p':'帕 佩 皮 波 普 派 保 珀伊 皮 珀 珀','d':'达 德 迪 多 杜 代 道 多伊 迪 德 德',
 't':'塔 特 蒂 托 图 泰 陶 托伊 蒂 特 特','g':'加 盖 吉 戈 古 盖 高 戈伊 吉 格 格','k':'卡 克 基 科 库 凯 考 科伊 屈 克 克',
 'f':'法 费 菲 佛 夫 法伊 福 佛伊 菲 弗 弗','v':'瓦 韦 维 沃 武 瓦伊 袄 沃伊 维 沃 弗','z':'扎 泽 齐 佐 祖 赛 藻 佐伊 齐 泽 泽',
 's':'萨 塞 西 索 苏 赛 绍 索伊 苏 瑟 瑟','S':'沙 谢 希 朔 舒 沙伊 绍 朔伊 许 舍 舍','h':'哈 黑 希 霍 胡 海 豪 霍伊 许 赫 赫',
 'm':'马 梅 米 莫 穆 迈 毛 莫伊 米 默 梅','n':'纳 内 尼 诺 努 奈 瑙 诺伊 尼 讷 内','l':'拉 莱 利 洛 卢 莱 劳 洛伊 吕 勒 勒',
 'r':'拉 雷 里 罗 鲁 赖 劳 罗伊 吕 勒 雷','y':'亚 耶 伊 约 尤 亚伊 尤 约伊 尤 耶 耶','ts':'察 策 齐 佐 祖 茨艾 曹 措伊 齐 策 策',
 'C':'夏 谢 希 肖 许 沙伊 绍 肖伊 许 谢 谢','X':'哈 黑 希 霍 胡 海 豪 霍伊 许 赫 赫',
}
_vc=['a','e','i','o','u','ai','au','oy','Y','O','@']
HCV={(c,v):ch for c,row in _rows.items() for v,ch in zip(_vc,row.split())}
HN={
 ('m','a'):'曼',('h','a'):'汉',('k','a'):'坎',('l','a'):'兰',('t','a'):'坦',('d','a'):'丹',('s','a'):'桑',('z','a'):'赞',('b','a'):'班',('p','a'):'潘',('f','a'):'凡',('v','a'):'万',('r','a'):'兰',('g','a'):'冈',('S','a'):'尚',('n','a'):'南',('y','a'):'扬',('','a'):'安',('ts','a'):'灿',('X','a'):'汉',
 ('b','e'):'本',('d','e'):'登',('t','e'):'滕',('g','e'):'根',('k','e'):'肯',('l','e'):'伦',('m','e'):'门',('n','e'):'嫩',('r','e'):'伦',('s','e'):'森',('z','e'):'森',('h','e'):'痕',('f','e'):'芬',('v','e'):'文',('S','e'):'申',('ts','e'):'岑',('','e'):'恩',('y','e'):'延',('C','e'):'辛',('X','e'):'痕',('p','e'):'彭',
 ('b','i'):'宾',('l','i'):'林',('m','i'):'明',('n','i'):'宁',('d','i'):'丁',('t','i'):'廷',('s','i'):'辛',('z','i'):'津',('k','i'):'金',('h','i'):'欣',('r','i'):'林',('S','i'):'辛',('v','i'):'温',('f','i'):'芬',('g','i'):'金',('ts','i'):'钦',('y','i'):'因',('','i'):'因',('p','i'):'平',('C','i'):'欣',
 ('t','o'):'通',('k','o'):'孔',('f','o'):'丰',('s','o'):'松',('v','o'):'翁',('b','o'):'邦',('l','o'):'隆',('m','o'):'蒙',('r','o'):'龙',('h','o'):'洪',('d','o'):'东',('g','o'):'贡',('n','o'):'农',('S','o'):'雄',('','o'):'翁',('z','o'):'宗',('ts','o'):'宗',('p','o'):'蓬',
 ('t','u'):'通',('d','u'):'敦',('k','u'):'昆',('g','u'):'贡',('m','u'):'蒙',('l','u'):'隆',('r','u'):'龙',('s','u'):'孙',('z','u'):'尊',('h','u'):'洪',('f','u'):'丰',('v','u'):'文',('S','u'):'顺',('ts','u'):'聪',('y','u'):'云',('','u'):'温',('b','u'):'崩',('n','u'):'农',('p','u'):'蓬',
 ('m','Y'):'明',('','Y'):'云',('f','Y'):'芬',('g','Y'):'金',('k','Y'):'昆',('d','Y'):'敦',('t','Y'):'廷',('b','Y'):'宾',('r','Y'):'伦',('l','Y'):'伦',
 ('','O'):'恩',('k','O'):'肯',('n','O'):'嫩',('l','O'):'伦',('m','O'):'门',('r','O'):'伦',('S','O'):'申',('h','O'):'痕',
 ('','@'):'恩',('d','@'):'登',('t','@'):'滕',('g','@'):'根',('k','@'):'肯',('l','@'):'伦',('m','@'):'门',('n','@'):'嫩',('r','@'):'伦',('s','@'):'森',('z','@'):'森',('h','@'):'痕',('f','@'):'芬',('v','@'):'文',('S','@'):'申',('b','@'):'本',('ts','@'):'岑',('y','@'):'延',('C','@'):'辛',('X','@'):'痕',('p','@'):'彭',
}
HLEAD={'b':'布','p':'普','d':'德','t':'特','g':'格','k':'克','f':'弗','v':'夫','s':'斯','z':'斯','S':'什','ts':'茨','h':'赫','m':'姆','n':'恩','l':'勒','r':'勒','y':'伊','pf':'普夫','kv':'克','ks':'克斯','C':'希','X':'赫','N':'恩','tS':'奇'}
HCODA={'t':'特','d':'特','s':'斯','S':'什','k':'克','g':'克','X':'赫','C':'希','f':'夫','p':'普','b':'普','m':'姆','l':'尔','r':'尔','ts':'茨','ks':'克斯','n':'恩','N':'恩','kv':'克','pf':'普夫','y':'','h':'','tS':'奇'}

def _vclass(nu):
    if nu in ('ai','au','oy','er','@'): return nu
    return 'e' if nu[0]=='E' else nu[0]

def _ren_hz(syls):
    out=''
    for s in syls:
        on=list(s['on']); nu=s['nu']; co=list(s['co'])
        if nu is None: out+=''.join(HCODA.get(c,'') for c in on); continue
        vc=_vclass(nu); last=on[-1] if on else ''; lead=''.join(HLEAD.get(c,'') for c in on[:-1])
        if nu=='er' and not co: out+=lead+(HCODA.get(last,'') if last else '尔'); continue
        if co and co[0] in ('n','N') and (last,vc) in HN:
            out+=lead+HN[(last,vc)]+''.join(HCODA.get(c,'') for c in _dedupe(co[1:])); continue
        cv=HCV.get((last,vc)) or ((HLEAD.get(last,'') if last else '')+HV0.get(vc,''))
        out+=lead+cv+''.join(HCODA.get(c,'') for c in _dedupe(co))
    return out

# ---------- API ----------
def _strip_acc(s): return s.translate(str.maketrans('áéíóúàèìòù','aeiouaeiou'))

def word_phon(word):
    lw=word.lower()
    if lw in OV: return OV[lw]
    toks=_parse(word); syls=_syllabify(toks); syls,stress=_finalize(word,syls)
    _DEV={'b':'p','d':'t','g':'k'}
    for _s in syls:
        if _s.get('co'): _s['co']=[_DEV.get(c,c) for c in _s['co']]
    if not syls: return (word,word,word,word,'')
    en=_ren_en([dict(x) for x in syls],stress); fr=_ren_fr([dict(x) for x in syls],stress)
    es=_ren_es([dict(x) for x in syls],stress); it=_ren_it([dict(x) for x in syls],stress); hz=_ren_hz(syls)
    if lw in FUNC or len(en)==1: py='-'.join(p.lower() for p in en); pf='-'.join(p.lower() for p in fr)
    else: py='-'.join(en); pf='-'.join(fr)
    if lw in FUNC: es=[_strip_acc(x) for x in es]; it=[_strip_acc(x) for x in it]
    return (py,pf,'-'.join(es),'-'.join(it),hz)

def phon_all(sentence):
    words=re.findall(r"[A-Za-zÄÖÜäöüß]+", sentence)
    pys=[];pfs=[];pss=[];pis=[];hz=''
    for k,w in enumerate(words):
        a,b,c,d,e=word_phon(w)
        if k==len(words)-1 and '-' not in a and w.lower() not in FUNC and w.lower() not in OV: a=a.upper(); b=b.upper()
        pys.append(a);pfs.append(b);pss.append(c);pis.append(d);hz+=e
    return (' '.join(pys),' '.join(pfs),' '.join(pss),' '.join(pis),hz)

def G(t,cn,en,frm,esm,itm,jam,kom,cat='core',lv=7):
    py,pf,ps,pi,hz=phon_all(t)
    return dict(t=t,py=py,pf=pf,ps=ps,pi=pi,phon=hz,cn=cn,en=en,frm=frm,esm=esm,itm=itm,jam=jam,kom=kom,lv=lv,cat=cat)

if __name__=='__main__':
    for t in ['Beste','erster','gehorcht','gewonnen','Besuch','behalten','Durchschnitt','reich','bleibt','Zeit','kommt','niedrig','Wirtschaft','verstehen','Straße','Werkstatt','beide','Vorstellung','abgemacht','angekommen','Krankenkasse','sechs']:
        print(t,'→',word_phon(t))
