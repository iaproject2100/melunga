# -*- coding: utf-8 -*-
"""Échantillon L1 « Premiers contacts » — 7 langues étudiées.
Produit : melunga_deploy/content/conversation/L1-<nat>-<study>.json (7 fichiers)
          docs/conversation/echantillon-L1.md (relecture)
Schéma générique (une entrée = {study, phon, native[, reading]}) :
  study   : phrase dans la langue étudiée
  phon    : aide à la prononciation écrite dans la langue maternelle (MAJUSCULES = accent)
  native  : traduction dans la langue maternelle
  reading : aide de lecture propre à la langue étudiée (pinyin + tons · hiragana · romanisation RR)
Les modèles contiennent {s} à l'emplacement du morceau remplaçable.
"""
import json, os, re
REPO = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", ".."))
OUT_DIR = f"{REPO}/melunga_deploy/content/conversation"
OUT_MD = f"{REPO}/docs/conversation/echantillon-L1.md"

L1 = {"level": 1, "title": "Premiers contacts", "goal": "Saluer, se présenter, exprimer un besoin, commander simplement."}
SITU = ["Se présenter", "Dire son nom", "Dire ce qu'on veut", "Dire ce dont on a besoin", "Trouver un lieu", "Dire où l'on va", "Dire comment on se sent", "Dire ce qu'on aime", "Commander", "Demander un prix"]
SITU_ZH = ["自我介绍", "说出名字", "说想要什么", "说需要什么", "找地方", "说要去哪里", "说感受", "说喜欢什么", "点单", "问价格"]
DIALOG_SITU = ["Au café", "À la gare", "Première rencontre"]
DIALOG_SITU_ZH = ["在咖啡馆", "在火车站", "初次见面"]

# ---------------------------------------------------------------- données par langue étudiée
# unit : (model{study,phon,native[,reading]}, [slot{study,phon,native[,reading]} ×4])
# dialogue : [turn{speaker,study,phon,native[,reading]} ×6]

ES = {
 "nat": "fr", "phonConv": "Approximation pour lecteurs francophones (MAJUSCULES = syllabe accentuée ; v→b, ll→y, j/ge/gi→KH, c/z→ss, que→ké). Variante à seseo et yeísmo. Ne remplace pas l'audio.",
 "review": "Généré par règles à partir de briques validées ; relecture par un hispanophone conseillée.",
 "units": [
  ({"study":"Soy {s}.","phon":"SOY {s}","native":"Je suis {s}."}, [{"study":"estudiante","phon":"és-tou-DIAN-té","native":"étudiant"},{"study":"francés","phon":"fran-SSÉS","native":"français"},{"study":"de París","phon":"dé pa-RIS","native":"de Paris"},{"study":"de vacaciones","phon":"dé ba-ka-SSIO-nés","native":"en vacances"}]),
  ({"study":"Me llamo {s}.","phon":"mé YA-mo {s}","native":"Je m'appelle {s}."}, [{"study":"María","phon":"ma-RI-a","native":"Marie"},{"study":"Pablo","phon":"PA-blo","native":"Paul"},{"study":"Lin","phon":"LIN","native":"Lin"},{"study":"Ana","phon":"A-na","native":"Ana"}]),
  ({"study":"Quiero {s}.","phon":"KIÉ-ro {s}","native":"Je veux {s}."}, [{"study":"un café","phon":"oun ka-FÉ","native":"un café"},{"study":"agua","phon":"A-goua","native":"de l'eau"},{"study":"un billete","phon":"oun bi-YÉ-té","native":"un billet"},{"study":"un bocadillo","phon":"oun bo-ka-DI-yo","native":"un sandwich"}]),
  ({"study":"Necesito {s}.","phon":"né-sé-SSI-to {s}","native":"J'ai besoin de {s}."}, [{"study":"ayuda","phon":"a-YOU-da","native":"aide"},{"study":"un taxi","phon":"oun TAK-ssi","native":"un taxi"},{"study":"un médico","phon":"oun MÉ-di-ko","native":"un médecin"},{"study":"wifi","phon":"OUI-fi","native":"la wifi"}]),
  ({"study":"¿Dónde está {s}?","phon":"DON-dé és-TA {s}","native":"Où est {s} ?"}, [{"study":"la estación","phon":"la és-ta-SSION","native":"la gare"},{"study":"la salida","phon":"la ssa-LI-da","native":"la sortie"},{"study":"el baño","phon":"él BA-gno","native":"les toilettes"},{"study":"el metro","phon":"él MÉ-tro","native":"le métro"}]),
  ({"study":"Voy {s}.","phon":"BOY {s}","native":"Je vais {s}."}, [{"study":"al trabajo","phon":"al tra-BA-kho","native":"au travail"},{"study":"a casa","phon":"a KA-ssa","native":"à la maison"},{"study":"al mercado","phon":"al mér-KA-do","native":"au marché"},{"study":"al hotel","phon":"al o-TÉL","native":"à l'hôtel"}]),
  ({"study":"Tengo {s}.","phon":"TÉN-go {s}","native":"J'ai {s}."}, [{"study":"hambre","phon":"AM-bré","native":"faim"},{"study":"sed","phon":"SSÉD","native":"soif"},{"study":"frío","phon":"FRI-o","native":"froid"},{"study":"calor","phon":"ka-LOR","native":"chaud"}]),
  ({"study":"Me gusta {s}.","phon":"mé GOUS-ta {s}","native":"J'aime {s}."}, [{"study":"el café","phon":"él ka-FÉ","native":"le café"},{"study":"la música","phon":"la MOU-ssi-ka","native":"la musique"},{"study":"caminar","phon":"ka-mi-NAR","native":"marcher"},{"study":"el deporte","phon":"él dé-POR-té","native":"le sport"}]),
  ({"study":"Un {s}, por favor.","phon":"oun {s}, por fa-BOR","native":"Un {s}, s'il vous plaît."}, [{"study":"café","phon":"ka-FÉ","native":"café"},{"study":"té","phon":"TÉ","native":"thé"},{"study":"zumo de naranja","phon":"SSOU-mo dé na-RAN-kha","native":"jus d'orange"},{"study":"bocadillo","phon":"bo-ka-DI-yo","native":"sandwich"}]),
  ({"study":"¿Cuánto cuesta {s}?","phon":"KOUAN-to KOUÉS-ta {s}","native":"Combien coûte {s} ?"}, [{"study":"esto","phon":"ÉS-to","native":"ça"},{"study":"el café","phon":"él ka-FÉ","native":"le café"},{"study":"el billete","phon":"él bi-YÉ-té","native":"le billet"},{"study":"la habitación","phon":"la a-bi-ta-SSION","native":"la chambre"}]),
 ],
 "dialogues": [
  [("A","¡Hola!","O-la","Bonjour !"),("B","Hola. ¿Qué desea?","O-la. ké dé-SSÉ-a","Bonjour. Vous désirez ?"),("A","Un café, por favor.","oun ka-FÉ, por fa-BOR","Un café, s'il vous plaît."),("B","¿Con leche?","kon LÉ-tché","Avec du lait ?"),("A","No, gracias. ¿Cuánto cuesta?","no, GRA-ssias. KOUAN-to KOUÉS-ta","Non, merci. Combien ça coûte ?"),("B","Dos euros.","dos É-ou-ros","Deux euros.")],
  [("A","Perdone, ¿dónde está la estación?","pér-DO-né, DON-dé és-TA la és-ta-SSION","Excusez-moi, où est la gare ?"),("B","Todo recto, a cinco minutos.","TO-do RRÉK-to, a SSIN-ko mi-NOU-tos","Tout droit, à cinq minutes."),("A","Gracias. Necesito un billete para Valencia.","GRA-ssias. né-sé-SSI-to oun bi-YÉ-té PA-ra ba-LÉN-ssia","Merci. J'ai besoin d'un billet pour Valence."),("B","Un billete, diez euros.","oun bi-YÉ-té, DIÉSS É-ou-ros","Un billet, dix euros."),("A","Aquí tiene. Muchas gracias.","a-KI TIÉ-né. MOU-tchas GRA-ssias","Voilà. Merci beaucoup."),("B","¡Buen viaje!","bouén BIA-khé","Bon voyage !")],
  [("A","Hola, me llamo María.","O-la, mé YA-mo ma-RI-a","Bonjour, je m'appelle Marie."),("B","Encantado, yo soy Pablo.","én-kan-TA-do, yo SOY PA-blo","Enchanté, moi c'est Paul."),("A","Soy francesa, de París. ¿Y usted?","SOY fran-SSÉ-ssa, dé pa-RIS. i ous-TÉD","Je suis française, de Paris. Et vous ?"),("B","Soy de aquí. ¿Está de vacaciones?","SOY dé a-KI. és-TA dé ba-ka-SSIO-nés","Je suis d'ici. Vous êtes en vacances ?"),("A","Sí, me gusta mucho la ciudad.","SI, mé GOUS-ta MOU-tcho la ssiou-DAD","Oui, j'aime beaucoup la ville."),("B","¡Qué bien! ¡Bienvenida!","ké BIÉN. bién-bé-NI-da","Super ! Bienvenue !")],
 ]}

EN = {
 "nat": "fr", "phonConv": "Approximation pour lecteurs francophones (MAJUSCULES = syllabe accentuée ; th→z/th, h aspiré noté h, -ing→-ing). Anglais britannique standard. Ne remplace pas l'audio.",
 "review": "Rédigé à la main ; relecture par un anglophone conseillée.",
 "units": [
  ({"study":"I'm {s}.","phon":"aïm {s}","native":"Je suis {s}."}, [{"study":"a student","phon":"eu STYOU-deunt","native":"étudiant"},{"study":"French","phon":"FRÈNTCH","native":"français"},{"study":"from Paris","phon":"from PA-riss","native":"de Paris"},{"study":"on holiday","phon":"onn HO-li-dé","native":"en vacances"}]),
  ({"study":"My name is {s}.","phon":"maï NÉÏM iz {s}","native":"Je m'appelle {s}."}, [{"study":"Mary","phon":"MÈ-ri","native":"Marie"},{"study":"Paul","phon":"POL","native":"Paul"},{"study":"Lin","phon":"LINN","native":"Lin"},{"study":"Ana","phon":"A-na","native":"Ana"}]),
  ({"study":"I want {s}.","phon":"aï WONT {s}","native":"Je veux {s}."}, [{"study":"a coffee","phon":"eu KO-fi","native":"un café"},{"study":"some water","phon":"seum WO-teur","native":"de l'eau"},{"study":"a ticket","phon":"eu TI-kit","native":"un billet"},{"study":"a sandwich","phon":"eu SANN-douitch","native":"un sandwich"}]),
  ({"study":"I need {s}.","phon":"aï NID {s}","native":"J'ai besoin de {s}."}, [{"study":"help","phon":"HÈLP","native":"aide"},{"study":"a taxi","phon":"eu TAK-si","native":"un taxi"},{"study":"a doctor","phon":"eu DOK-teur","native":"un médecin"},{"study":"the wifi","phon":"ze OUAÏ-faï","native":"la wifi"}]),
  ({"study":"Where is {s}?","phon":"OUÈR iz {s}","native":"Où est {s} ?"}, [{"study":"the station","phon":"ze STÉÏ-cheun","native":"la gare"},{"study":"the exit","phon":"zi ÈG-zit","native":"la sortie"},{"study":"the toilet","phon":"ze TOÏ-leut","native":"les toilettes"},{"study":"the metro","phon":"ze MÈ-tro","native":"le métro"}]),
  ({"study":"I'm going {s}.","phon":"aïm GÔ-ing {s}","native":"Je vais {s}."}, [{"study":"to work","phon":"tou WEURK","native":"au travail"},{"study":"home","phon":"HÔM","native":"à la maison"},{"study":"to the market","phon":"tou ze MAR-kit","native":"au marché"},{"study":"to the hotel","phon":"tou ze ho-TÈL","native":"à l'hôtel"}]),
  ({"study":"I'm {s}.","phon":"aïm {s}","native":"J'ai {s}."}, [{"study":"hungry","phon":"HANN-gri","native":"faim"},{"study":"thirsty","phon":"THEUR-sti","native":"soif"},{"study":"cold","phon":"KÔLD","native":"froid"},{"study":"hot","phon":"HOT","native":"chaud"}]),
  ({"study":"I like {s}.","phon":"aï LAÏK {s}","native":"J'aime {s}."}, [{"study":"coffee","phon":"KO-fi","native":"le café"},{"study":"music","phon":"MYOU-zik","native":"la musique"},{"study":"walking","phon":"OUO-king","native":"marcher"},{"study":"sport","phon":"SPORT","native":"le sport"}]),
  ({"study":"One {s}, please.","phon":"OUANN {s}, PLIZ","native":"Un {s}, s'il vous plaît."}, [{"study":"coffee","phon":"KO-fi","native":"café"},{"study":"tea","phon":"TI","native":"thé"},{"study":"orange juice","phon":"O-rindj DJOUSS","native":"jus d'orange"},{"study":"sandwich","phon":"SANN-douitch","native":"sandwich"}]),
  ({"study":"How much is {s}?","phon":"HAÔ MEUTCH iz {s}","native":"Combien coûte {s} ?"}, [{"study":"this","phon":"ZISS","native":"ça"},{"study":"the coffee","phon":"ze KO-fi","native":"le café"},{"study":"the ticket","phon":"ze TI-kit","native":"le billet"},{"study":"the room","phon":"ze ROUM","native":"la chambre"}]),
 ],
 "dialogues": [
  [("A","Hello!","hè-LÔ","Bonjour !"),("B","Hello. What would you like?","hè-LÔ. ouot would you LAÏK","Bonjour. Vous désirez ?"),("A","One coffee, please.","OUANN KO-fi, PLIZ","Un café, s'il vous plaît."),("B","With milk?","ouiz MILK","Avec du lait ?"),("A","No, thanks. How much is it?","NÔ, THANKS. HAÔ MEUTCH iz it","Non, merci. Combien ça coûte ?"),("B","Two pounds.","TOU PAÔNDZ","Deux livres.")],
  [("A","Excuse me, where is the station?","ék-SKYOUZ mi, OUÈR iz ze STÉÏ-cheun","Excusez-moi, où est la gare ?"),("B","Straight ahead, five minutes.","STRÉÏT eu-HÈD, FAÏV MI-nits","Tout droit, à cinq minutes."),("A","Thanks. I need a ticket to Brighton.","THANKS. aï NID eu TI-kit tou BRAÏ-teun","Merci. J'ai besoin d'un billet pour Brighton."),("B","One ticket, ten pounds.","OUANN TI-kit, TÈN PAÔNDZ","Un billet, dix livres."),("A","Here you are. Thank you very much.","HIR you AR. THANK you VÈ-ri MEUTCH","Voilà. Merci beaucoup."),("B","Have a good trip!","hav eu goud TRIP","Bon voyage !")],
  [("A","Hi, my name is Mary.","HAÏ, maï NÉÏM iz MÈ-ri","Bonjour, je m'appelle Marie."),("B","Nice to meet you, I'm Paul.","NAÏSS tou MIT you, aïm POL","Enchanté, moi c'est Paul."),("A","I'm French, from Paris. And you?","aïm FRÈNTCH, from PA-riss. and YOU","Je suis française, de Paris. Et vous ?"),("B","I'm from here. Are you on holiday?","aïm from HIR. ar you onn HO-li-dé","Je suis d'ici. Vous êtes en vacances ?"),("A","Yes, I really like the city.","YÈS, aï RI-li LAÏK ze SI-ti","Oui, j'aime beaucoup la ville."),("B","Great! Welcome!","GRÉÏT. OUÈL-keum","Super ! Bienvenue !")],
 ]}

ZH = {
 "nat": "fr", "phonConv": "Approximation pour lecteurs francophones (style du deck : ouo = 我, chr = 是, dzaï = 在). Les tons ne sont pas notés dans l'approximation : se reporter au pinyin (champ reading) et à l'audio. Mandarin standard, caractères simplifiés.",
 "review": "Relecture linguistique requise (tons, naturel des tournures).",
 "units": [
  ({"study":"我是{s}。","reading":"wǒ shì {s}.","phon":"ouo chr {s}","native":"Je suis {s}."}, [{"study":"学生","reading":"xuéshēng","phon":"süé-cheng","native":"étudiant"},{"study":"法国人","reading":"Fǎguó rén","phon":"fa-kouo jeun","native":"français"},{"study":"巴黎人","reading":"Bālí rén","phon":"pa-li jeun","native":"de Paris"},{"study":"来度假的","reading":"lái dùjià de","phon":"laï tou-tia deu","native":"en vacances"}]),
  ({"study":"我叫{s}。","reading":"wǒ jiào {s}.","phon":"ouo djiao {s}","native":"Je m'appelle {s}."}, [{"study":"玛丽","reading":"Mǎlì","phon":"ma-li","native":"Marie"},{"study":"保罗","reading":"Bǎoluó","phon":"pao-louo","native":"Paul"},{"study":"林","reading":"Lín","phon":"linn","native":"Lin"},{"study":"安娜","reading":"Ānnà","phon":"an-na","native":"Ana"}]),
  ({"study":"我要{s}。","reading":"wǒ yào {s}.","phon":"ouo yao {s}","native":"Je veux {s}."}, [{"study":"一杯咖啡","reading":"yì bēi kāfēi","phon":"i peï ka-feï","native":"un café"},{"study":"水","reading":"shuǐ","phon":"chouèï","native":"de l'eau"},{"study":"一张票","reading":"yì zhāng piào","phon":"i djang piao","native":"un billet"},{"study":"一个三明治","reading":"yí ge sānmíngzhì","phon":"i keu san-ming-djr","native":"un sandwich"}]),
  ({"study":"我需要{s}。","reading":"wǒ xūyào {s}.","phon":"ouo sü-yao {s}","native":"J'ai besoin de {s}."}, [{"study":"帮助","reading":"bāngzhù","phon":"pang-djou","native":"aide"},{"study":"出租车","reading":"chūzūchē","phon":"tchou-tsou-tcheu","native":"un taxi"},{"study":"医生","reading":"yīshēng","phon":"i-cheng","native":"un médecin"},{"study":"无线网","reading":"wúxiànwǎng","phon":"ou-sièn-ouang","native":"la wifi"}]),
  ({"study":"{s}在哪里？","reading":"{s} zài nǎlǐ?","phon":"{s} dzaï na-li ?","native":"Où est {s} ?"}, [{"study":"火车站","reading":"huǒchēzhàn","phon":"houo-tcheu-djan","native":"la gare"},{"study":"出口","reading":"chūkǒu","phon":"tchou-kou","native":"la sortie"},{"study":"洗手间","reading":"xǐshǒujiān","phon":"si-chou-tièn","native":"les toilettes"},{"study":"地铁","reading":"dìtiě","phon":"ti-tié","native":"le métro"}]),
  ({"study":"我去{s}。","reading":"wǒ qù {s}.","phon":"ouo tchü {s}","native":"Je vais {s}."}, [{"study":"公司","reading":"gōngsī","phon":"kong-seu","native":"au bureau"},{"study":"市场","reading":"shìchǎng","phon":"chr-tchang","native":"au marché"},{"study":"酒店","reading":"jiǔdiàn","phon":"tiou-tièn","native":"à l'hôtel"},{"study":"车站","reading":"chēzhàn","phon":"tcheu-djan","native":"à la gare"}]),
  ({"study":"我{s}。","reading":"wǒ {s}.","phon":"ouo {s}","native":"J'ai {s}."}, [{"study":"饿了","reading":"è le","phon":"eu leu","native":"faim"},{"study":"渴了","reading":"kě le","phon":"keu leu","native":"soif"},{"study":"很冷","reading":"hěn lěng","phon":"heun leng","native":"froid"},{"study":"很热","reading":"hěn rè","phon":"heun jeu","native":"chaud"}]),
  ({"study":"我喜欢{s}。","reading":"wǒ xǐhuan {s}.","phon":"ouo si-houan {s}","native":"J'aime {s}."}, [{"study":"咖啡","reading":"kāfēi","phon":"ka-feï","native":"le café"},{"study":"音乐","reading":"yīnyuè","phon":"inn-yué","native":"la musique"},{"study":"走路","reading":"zǒulù","phon":"tsou-lou","native":"marcher"},{"study":"运动","reading":"yùndòng","phon":"yun-tong","native":"le sport"}]),
  ({"study":"请给我{s}。","reading":"qǐng gěi wǒ {s}.","phon":"tching gueï ouo {s}","native":"Un {s}, s'il vous plaît."}, [{"study":"一杯咖啡","reading":"yì bēi kāfēi","phon":"i peï ka-feï","native":"café"},{"study":"一杯茶","reading":"yì bēi chá","phon":"i peï tcha","native":"thé"},{"study":"一杯橙汁","reading":"yì bēi chéngzhī","phon":"i peï tcheng-djr","native":"jus d'orange"},{"study":"一个三明治","reading":"yí ge sānmíngzhì","phon":"i keu san-ming-djr","native":"sandwich"}]),
  ({"study":"{s}多少钱？","reading":"{s} duōshao qián?","phon":"{s} douo-chao tchyèn ?","native":"Combien coûte {s} ?"}, [{"study":"这个","reading":"zhège","phon":"djeu-keu","native":"ça"},{"study":"咖啡","reading":"kāfēi","phon":"ka-feï","native":"le café"},{"study":"票","reading":"piào","phon":"piao","native":"le billet"},{"study":"房间","reading":"fángjiān","phon":"fang-tièn","native":"la chambre"}]),
 ],
 "dialogues": [
  [("A","你好！","nǐ hǎo!","ni hao !","Bonjour !"),("B","你好。您要什么？","nǐ hǎo. nín yào shénme?","ni hao. ninn yao cheun-meu ?","Bonjour. Vous désirez ?"),("A","请给我一杯咖啡。","qǐng gěi wǒ yì bēi kāfēi.","tching gueï ouo i peï ka-feï","Un café, s'il vous plaît."),("B","加牛奶吗？","jiā niúnǎi ma?","tia niou-naï ma ?","Avec du lait ?"),("A","不用，谢谢。多少钱？","búyòng, xièxie. duōshao qián?","pou-yong, sié-sié. douo-chao tchyèn ?","Non, merci. Combien ça coûte ?"),("B","二十块。","èrshí kuài.","eur-chr kouaï","Vingt yuans.")],
  [("A","请问，火车站在哪里？","qǐngwèn, huǒchēzhàn zài nǎlǐ?","tching-ouenn, houo-tcheu-djan dzaï na-li ?","Excusez-moi, où est la gare ?"),("B","一直走，五分钟。","yìzhí zǒu, wǔ fēnzhōng.","i-djr tsou, ou feun-djong","Tout droit, à cinq minutes."),("A","谢谢。我需要一张去上海的票。","xièxie. wǒ xūyào yì zhāng qù Shànghǎi de piào.","sié-sié. ouo sü-yao i djang tchü chang-haï deu piao","Merci. J'ai besoin d'un billet pour Shanghai."),("B","一张票，一百块。","yì zhāng piào, yìbǎi kuài.","i djang piao, i-paï kouaï","Un billet, cent yuans."),("A","给您。非常感谢。","gěi nín. fēicháng gǎnxiè.","gueï ninn. feï-tchang kan-sié","Voilà. Merci beaucoup."),("B","一路顺风！","yílù shùnfēng!","i-lou chouenn-feng !","Bon voyage !")],
  [("A","你好，我叫玛丽。","nǐ hǎo, wǒ jiào Mǎlì.","ni hao, ouo djiao ma-li","Bonjour, je m'appelle Marie."),("B","很高兴认识你，我是保罗。","hěn gāoxìng rènshi nǐ, wǒ shì Bǎoluó.","heun kao-sing jeun-chr ni, ouo chr pao-louo","Enchanté, moi c'est Paul."),("A","我是法国人，巴黎人。你呢？","wǒ shì Fǎguó rén, Bālí rén. nǐ ne?","ouo chr fa-kouo jeun, pa-li jeun. ni neu ?","Je suis française, de Paris. Et vous ?"),("B","我是本地人。你来度假吗？","wǒ shì běndì rén. nǐ lái dùjià ma?","ouo chr peun-ti jeun. ni laï tou-tia ma ?","Je suis d'ici. Vous êtes en vacances ?"),("A","是的，我很喜欢这个城市。","shì de, wǒ hěn xǐhuan zhège chéngshì.","chr deu, ouo heun si-houan djeu-keu tcheng-chr","Oui, j'aime beaucoup la ville."),("B","太好了！欢迎！","tài hǎo le! huānyíng!","taï hao leu ! houan-ying !","Super ! Bienvenue !")],
 ]}

IT = {
 "nat": "fr", "phonConv": "Approximation pour lecteurs francophones (MAJUSCULES = syllabe accentuée ; c+e/i→tch, g+e/i→dj, gn→gn, gl→li, z→ts/dz, consonnes doubles allongées). Ne remplace pas l'audio.",
 "review": "Rédigé à la main ; relecture par un italophone conseillée.",
 "units": [
  ({"study":"Sono {s}.","phon":"SO-no {s}","native":"Je suis {s}."}, [{"study":"studente","phon":"stou-DÈN-té","native":"étudiant"},{"study":"francese","phon":"fran-TCHÉ-zé","native":"français"},{"study":"di Parigi","phon":"di pa-RI-dji","native":"de Paris"},{"study":"in vacanza","phon":"inn va-KAN-tsa","native":"en vacances"}]),
  ({"study":"Mi chiamo {s}.","phon":"mi KIA-mo {s}","native":"Je m'appelle {s}."}, [{"study":"Maria","phon":"ma-RI-a","native":"Marie"},{"study":"Paolo","phon":"PA-o-lo","native":"Paul"},{"study":"Lin","phon":"LIN","native":"Lin"},{"study":"Anna","phon":"AN-na","native":"Ana"}]),
  ({"study":"Vorrei {s}.","phon":"vor-RÈÏ {s}","native":"Je voudrais {s}."}, [{"study":"un caffè","phon":"oun kaf-FÈ","native":"un café"},{"study":"dell'acqua","phon":"dél-LA-koua","native":"de l'eau"},{"study":"un biglietto","phon":"oun bi-LIÉT-to","native":"un billet"},{"study":"un panino","phon":"oun pa-NI-no","native":"un sandwich"}]),
  ({"study":"Ho bisogno di {s}.","phon":"o bi-ZO-gno di {s}","native":"J'ai besoin de {s}."}, [{"study":"aiuto","phon":"a-YOU-to","native":"aide"},{"study":"un taxi","phon":"oun TAK-si","native":"un taxi"},{"study":"un medico","phon":"oun MÈ-di-ko","native":"un médecin"},{"study":"wifi","phon":"OUAÏ-faï","native":"la wifi"}]),
  ({"study":"Dov'è {s}?","phon":"do-VÈ {s}","native":"Où est {s} ?"}, [{"study":"la stazione","phon":"la sta-TSIO-né","native":"la gare"},{"study":"l'uscita","phon":"lou-CHI-ta","native":"la sortie"},{"study":"il bagno","phon":"il BA-gno","native":"les toilettes"},{"study":"la metro","phon":"la MÉ-tro","native":"le métro"}]),
  ({"study":"Vado {s}.","phon":"VA-do {s}","native":"Je vais {s}."}, [{"study":"al lavoro","phon":"al la-VO-ro","native":"au travail"},{"study":"a casa","phon":"a KA-za","native":"à la maison"},{"study":"al mercato","phon":"al mér-KA-to","native":"au marché"},{"study":"in albergo","phon":"inn al-BÈR-go","native":"à l'hôtel"}]),
  ({"study":"Ho {s}.","phon":"O {s}","native":"J'ai {s}."}, [{"study":"fame","phon":"FA-mé","native":"faim"},{"study":"sete","phon":"SÉ-té","native":"soif"},{"study":"freddo","phon":"FRÉD-do","native":"froid"},{"study":"caldo","phon":"KAL-do","native":"chaud"}]),
  ({"study":"Mi piace {s}.","phon":"mi PIA-tché {s}","native":"J'aime {s}."}, [{"study":"il caffè","phon":"il kaf-FÈ","native":"le café"},{"study":"la musica","phon":"la MOU-zi-ka","native":"la musique"},{"study":"camminare","phon":"kam-mi-NA-ré","native":"marcher"},{"study":"lo sport","phon":"lo SPORT","native":"le sport"}]),
  ({"study":"Un {s}, per favore.","phon":"oun {s}, pér fa-VO-ré","native":"Un {s}, s'il vous plaît."}, [{"study":"caffè","phon":"kaf-FÈ","native":"café"},{"study":"tè","phon":"TÈ","native":"thé"},{"study":"succo d'arancia","phon":"SOUK-ko da-RAN-tcha","native":"jus d'orange"},{"study":"panino","phon":"pa-NI-no","native":"sandwich"}]),
  ({"study":"Quanto costa {s}?","phon":"KOUAN-to KOS-ta {s}","native":"Combien coûte {s} ?"}, [{"study":"questo","phon":"KOUÉS-to","native":"ça"},{"study":"il caffè","phon":"il kaf-FÈ","native":"le café"},{"study":"il biglietto","phon":"il bi-LIÉT-to","native":"le billet"},{"study":"la camera","phon":"la KA-mé-ra","native":"la chambre"}]),
 ],
 "dialogues": [
  [("A","Buongiorno!","bouon-DJOR-no","Bonjour !"),("B","Buongiorno. Cosa desidera?","bouon-DJOR-no. KO-za dé-ZI-dé-ra","Bonjour. Vous désirez ?"),("A","Un caffè, per favore.","oun kaf-FÈ, pér fa-VO-ré","Un café, s'il vous plaît."),("B","Con latte?","kon LAT-té","Avec du lait ?"),("A","No, grazie. Quanto costa?","no, GRA-tsié. KOUAN-to KOS-ta","Non, merci. Combien ça coûte ?"),("B","Due euro.","DOU-é È-ou-ro","Deux euros.")],
  [("A","Scusi, dov'è la stazione?","SKOU-zi, do-VÈ la sta-TSIO-né","Excusez-moi, où est la gare ?"),("B","Sempre dritto, cinque minuti.","SÈM-pré DRIT-to, TCHIN-koué mi-NOU-ti","Tout droit, à cinq minutes."),("A","Grazie. Ho bisogno di un biglietto per Firenze.","GRA-tsié. o bi-ZO-gno di oun bi-LIÉT-to pér fi-RÈN-tsé","Merci. J'ai besoin d'un billet pour Florence."),("B","Un biglietto, dieci euro.","oun bi-LIÉT-to, DIÈ-tchi È-ou-ro","Un billet, dix euros."),("A","Ecco. Grazie mille.","ÈK-ko. GRA-tsié MIL-lé","Voilà. Merci beaucoup."),("B","Buon viaggio!","bouon VIAD-djo","Bon voyage !")],
  [("A","Ciao, mi chiamo Maria.","TCHA-o, mi KIA-mo ma-RI-a","Bonjour, je m'appelle Marie."),("B","Piacere, io sono Paolo.","pia-TCHÉ-ré, I-o SO-no PA-o-lo","Enchanté, moi c'est Paul."),("A","Sono francese, di Parigi. E Lei?","SO-no fran-TCHÉ-zé, di pa-RI-dji. é LÈÏ","Je suis française, de Paris. Et vous ?"),("B","Sono di qui. È in vacanza?","SO-no di KOUI. è inn va-KAN-tsa","Je suis d'ici. Vous êtes en vacances ?"),("A","Sì, mi piace molto la città.","SI, mi PIA-tché MOL-to la tchit-TA","Oui, j'aime beaucoup la ville."),("B","Che bello! Benvenuta!","ké BÈL-lo. bén-vé-NOU-ta","Super ! Bienvenue !")],
 ]}

JA = {
 "nat": "fr", "phonConv": "Approximation pour lecteurs francophones, syllabe par syllabe (style du deck : a-ri-ga-to-o). Voyelles longues doublées (ô, ii). Le champ reading donne la lecture en hiragana. Registre poli (です / ます).",
 "review": "Relecture linguistique requise (naturel des tournures, lectures des kanji).",
 "units": [
  ({"study":"私は{s}です。","reading":"わたしは{s}です。","phon":"wa-ta-chi wa {s} dé-sou","native":"Je suis {s}."}, [{"study":"学生","reading":"がくせい","phon":"ga-kou-sé-i","native":"étudiant"},{"study":"フランス人","reading":"ふらんすじん","phon":"fou-ran-sou-djin","native":"français"},{"study":"パリ出身","reading":"ぱりしゅっしん","phon":"pa-ri chou-chin","native":"de Paris"},{"study":"休暇中","reading":"きゅうかちゅう","phon":"kyou-ka-tchou","native":"en vacances"}]),
  ({"study":"{s}と言います。","reading":"{s}といいます。","phon":"{s} to i-i-ma-sou","native":"Je m'appelle {s}."}, [{"study":"マリー","reading":"まりー","phon":"ma-rii","native":"Marie"},{"study":"ポール","reading":"ぽーる","phon":"pô-rou","native":"Paul"},{"study":"リン","reading":"りん","phon":"rin","native":"Lin"},{"study":"アナ","reading":"あな","phon":"a-na","native":"Ana"}]),
  ({"study":"{s}をください。","reading":"{s}をください。","phon":"{s} o kou-da-sa-i","native":"Je veux {s}."}, [{"study":"コーヒー","reading":"こーひー","phon":"kô-hii","native":"un café"},{"study":"水","reading":"みず","phon":"mi-zou","native":"de l'eau"},{"study":"切符","reading":"きっぷ","phon":"kip-pou","native":"un billet"},{"study":"サンドイッチ","reading":"さんどいっち","phon":"san-do-it-tchi","native":"un sandwich"}]),
  ({"study":"{s}が必要です。","reading":"{s}がひつようです。","phon":"{s} ga hi-tsou-yô dé-sou","native":"J'ai besoin de {s}."}, [{"study":"助け","reading":"たすけ","phon":"ta-sou-ké","native":"aide"},{"study":"タクシー","reading":"たくしー","phon":"ta-kou-chii","native":"un taxi"},{"study":"医者","reading":"いしゃ","phon":"i-cha","native":"un médecin"},{"study":"Wi-Fi","reading":"わいふぁい","phon":"oua-i-fa-i","native":"la wifi"}]),
  ({"study":"{s}はどこですか。","reading":"{s}はどこですか。","phon":"{s} wa do-ko dé-sou ka","native":"Où est {s} ?"}, [{"study":"駅","reading":"えき","phon":"é-ki","native":"la gare"},{"study":"出口","reading":"でぐち","phon":"dé-gou-tchi","native":"la sortie"},{"study":"トイレ","reading":"といれ","phon":"to-i-ré","native":"les toilettes"},{"study":"地下鉄","reading":"ちかてつ","phon":"tchi-ka-té-tsou","native":"le métro"}]),
  ({"study":"{s}に行きます。","reading":"{s}にいきます。","phon":"{s} ni i-ki-ma-sou","native":"Je vais {s}."}, [{"study":"会社","reading":"かいしゃ","phon":"ka-i-cha","native":"au travail"},{"study":"家","reading":"いえ","phon":"i-é","native":"à la maison"},{"study":"市場","reading":"いちば","phon":"i-tchi-ba","native":"au marché"},{"study":"ホテル","reading":"ほてる","phon":"ho-té-rou","native":"à l'hôtel"}]),
  ({"study":"{s}","reading":"{s}","phon":"{s}","native":"J'ai {s}."}, [{"study":"お腹が空きました。","reading":"おなかがすきました。","phon":"o-na-ka ga sou-ki-ma-chi-ta","native":"faim"},{"study":"喉が渇きました。","reading":"のどがかわきました。","phon":"no-do ga ka-wa-ki-ma-chi-ta","native":"soif"},{"study":"寒いです。","reading":"さむいです。","phon":"sa-mou-i dé-sou","native":"froid"},{"study":"暑いです。","reading":"あついです。","phon":"a-tsou-i dé-sou","native":"chaud"}]),
  ({"study":"{s}が好きです。","reading":"{s}がすきです。","phon":"{s} ga sou-ki dé-sou","native":"J'aime {s}."}, [{"study":"コーヒー","reading":"こーひー","phon":"kô-hii","native":"le café"},{"study":"音楽","reading":"おんがく","phon":"on-ga-kou","native":"la musique"},{"study":"散歩","reading":"さんぽ","phon":"san-po","native":"marcher"},{"study":"スポーツ","reading":"すぽーつ","phon":"sou-pô-tsou","native":"le sport"}]),
  ({"study":"{s}をお願いします。","reading":"{s}をおねがいします。","phon":"{s} o o-né-ga-i chi-ma-sou","native":"Un {s}, s'il vous plaît."}, [{"study":"コーヒー","reading":"こーひー","phon":"kô-hii","native":"café"},{"study":"お茶","reading":"おちゃ","phon":"o-tcha","native":"thé"},{"study":"オレンジジュース","reading":"おれんじじゅーす","phon":"o-ren-dji djou-sou","native":"jus d'orange"},{"study":"サンドイッチ","reading":"さんどいっち","phon":"san-do-it-tchi","native":"sandwich"}]),
  ({"study":"{s}はいくらですか。","reading":"{s}はいくらですか。","phon":"{s} wa i-kou-ra dé-sou ka","native":"Combien coûte {s} ?"}, [{"study":"これ","reading":"これ","phon":"ko-ré","native":"ça"},{"study":"コーヒー","reading":"こーひー","phon":"kô-hii","native":"le café"},{"study":"切符","reading":"きっぷ","phon":"kip-pou","native":"le billet"},{"study":"部屋","reading":"へや","phon":"hé-ya","native":"la chambre"}]),
 ],
 "dialogues": [
  [("A","こんにちは！","こんにちは！","kon-ni-tchi-wa","Bonjour !"),("B","こんにちは。ご注文は？","こんにちは。ごちゅうもんは？","kon-ni-tchi-wa. go-tchou-mon wa","Bonjour. Vous désirez ?"),("A","コーヒーをお願いします。","こーひーをおねがいします。","kô-hii o o-né-ga-i chi-ma-sou","Un café, s'il vous plaît."),("B","ミルクは？","みるくは？","mi-rou-kou wa","Avec du lait ?"),("A","いいえ、結構です。いくらですか。","いいえ、けっこうです。いくらですか。","i-i-é, kék-kô dé-sou. i-kou-ra dé-sou ka","Non, merci. Combien ça coûte ?"),("B","三百円です。","さんびゃくえんです。","san-bya-kou én dé-sou","Trois cents yens.")],
  [("A","すみません、駅はどこですか。","すみません、えきはどこですか。","sou-mi-ma-sén, é-ki wa do-ko dé-sou ka","Excusez-moi, où est la gare ?"),("B","まっすぐ、五分です。","まっすぐ、ごふんです。","mas-sou-gou, go-foun dé-sou","Tout droit, à cinq minutes."),("A","ありがとう。大阪までの切符が必要です。","ありがとう。おおさかまでのきっぷがひつようです。","a-ri-ga-tô. ô-sa-ka ma-dé no kip-pou ga hi-tsou-yô dé-sou","Merci. J'ai besoin d'un billet pour Osaka."),("B","切符一枚、千円です。","きっぷいちまい、せんえんです。","kip-pou i-tchi-ma-i, sén én dé-sou","Un billet, mille yens."),("A","はい、どうぞ。ありがとうございます。","はい、どうぞ。ありがとうございます。","ha-i, dô-zo. a-ri-ga-tô go-za-i-ma-sou","Voilà. Merci beaucoup."),("B","良い旅を！","よいたびを！","yo-i ta-bi o","Bon voyage !")],
  [("A","こんにちは、マリーと言います。","こんにちは、まりーといいます。","kon-ni-tchi-wa, ma-rii to i-i-ma-sou","Bonjour, je m'appelle Marie."),("B","はじめまして、ポールです。","はじめまして、ぽーるです。","ha-dji-mé-ma-chi-té, pô-rou dé-sou","Enchanté, moi c'est Paul."),("A","フランス人で、パリ出身です。あなたは？","ふらんすじんで、ぱりしゅっしんです。あなたは？","fou-ran-sou-djin dé, pa-ri chou-chin dé-sou. a-na-ta wa","Je suis française, de Paris. Et vous ?"),("B","ここの出身です。休暇中ですか。","ここのしゅっしんです。きゅうかちゅうですか。","ko-ko no chou-chin dé-sou. kyou-ka-tchou dé-sou ka","Je suis d'ici. Vous êtes en vacances ?"),("A","はい、この町がとても好きです。","はい、このまちがとてもすきです。","ha-i, ko-no ma-tchi ga to-té-mo sou-ki dé-sou","Oui, j'aime beaucoup la ville."),("B","いいですね！ようこそ！","いいですね！ようこそ！","ii dé-sou né. yô-ko-so","Super ! Bienvenue !")],
 ]}

KO = {
 "nat": "fr", "phonConv": "Approximation pour lecteurs francophones, syllabe par syllabe (style du deck : gam-sa-ham-ni-da ; eo = ㅓ, eu = ㅡ). Le champ reading donne la romanisation révisée. Registre poli (-요). Les particules (이/가, 을/를, 이에요/예요) sont incluses dans le morceau remplaçable.",
 "review": "Relecture linguistique requise (particules, naturel des tournures).",
 "units": [
  ({"study":"저는 {s}","reading":"jeoneun {s}","phon":"djeo-neun {s}","native":"Je suis {s}."}, [{"study":"학생이에요.","reading":"haksaeng-ieyo.","phon":"hak-sèng-i-é-yo","native":"étudiant"},{"study":"프랑스 사람이에요.","reading":"peurangseu saram-ieyo.","phon":"peu-rang-seu sa-ram-i-é-yo","native":"français"},{"study":"파리에서 왔어요.","reading":"pari-eseo wasseoyo.","phon":"pa-ri-é-sseo oua-sseo-yo","native":"de Paris"},{"study":"휴가 중이에요.","reading":"hyuga jung-ieyo.","phon":"hyou-ga djoung-i-é-yo","native":"en vacances"}]),
  ({"study":"제 이름은 {s}","reading":"je ireumeun {s}","phon":"djé i-reum-eun {s}","native":"Je m'appelle {s}."}, [{"study":"마리예요.","reading":"mari-yeyo.","phon":"ma-ri-yé-yo","native":"Marie"},{"study":"폴이에요.","reading":"pol-ieyo.","phon":"pol-i-é-yo","native":"Paul"},{"study":"린이에요.","reading":"rin-ieyo.","phon":"rin-i-é-yo","native":"Lin"},{"study":"아나예요.","reading":"ana-yeyo.","phon":"a-na-yé-yo","native":"Ana"}]),
  ({"study":"{s} 주세요.","reading":"{s} juseyo.","phon":"{s} djou-sé-yo","native":"Je veux {s}."}, [{"study":"커피","reading":"keopi","phon":"keo-pi","native":"un café"},{"study":"물","reading":"mul","phon":"moul","native":"de l'eau"},{"study":"표","reading":"pyo","phon":"pyo","native":"un billet"},{"study":"샌드위치","reading":"saendeuwichi","phon":"ssèn-deu-oui-tchi","native":"un sandwich"}]),
  ({"study":"{s} 필요해요.","reading":"{s} piryohaeyo.","phon":"{s} pil-yo-hè-yo","native":"J'ai besoin de {s}."}, [{"study":"도움이","reading":"doumi","phon":"do-oum-i","native":"aide"},{"study":"택시가","reading":"taeksiga","phon":"tèk-si-ga","native":"un taxi"},{"study":"의사가","reading":"uisaga","phon":"eui-sa-ga","native":"un médecin"},{"study":"와이파이가","reading":"waipaiga","phon":"oua-i-pa-i-ga","native":"la wifi"}]),
  ({"study":"{s} 어디예요?","reading":"{s} eodiyeyo?","phon":"{s} eo-di-yé-yo ?","native":"Où est {s} ?"}, [{"study":"역이","reading":"yeogi","phon":"yeog-i","native":"la gare"},{"study":"출구가","reading":"chulguga","phon":"tchoul-gou-ga","native":"la sortie"},{"study":"화장실이","reading":"hwajangsiri","phon":"houa-djang-sil-i","native":"les toilettes"},{"study":"지하철이","reading":"jihacheori","phon":"dji-ha-tcheol-i","native":"le métro"}]),
  ({"study":"{s} 가요.","reading":"{s} gayo.","phon":"{s} ka-yo","native":"Je vais {s}."}, [{"study":"회사에","reading":"hoesa-e","phon":"houé-sa-é","native":"au travail"},{"study":"집에","reading":"jib-e","phon":"djib-é","native":"à la maison"},{"study":"시장에","reading":"sijang-e","phon":"si-djang-é","native":"au marché"},{"study":"호텔에","reading":"hotel-e","phon":"ho-tél-é","native":"à l'hôtel"}]),
  ({"study":"{s}","reading":"{s}","phon":"{s}","native":"J'ai {s}."}, [{"study":"배고파요.","reading":"baegopayo.","phon":"bè-go-pa-yo","native":"faim"},{"study":"목말라요.","reading":"mongmallayo.","phon":"mong-mal-la-yo","native":"soif"},{"study":"추워요.","reading":"chuwoyo.","phon":"tchou-oueo-yo","native":"froid"},{"study":"더워요.","reading":"deowoyo.","phon":"deo-oueo-yo","native":"chaud"}]),
  ({"study":"{s} 좋아해요.","reading":"{s} joahaeyo.","phon":"{s} djo-a-hè-yo","native":"J'aime {s}."}, [{"study":"커피를","reading":"keopireul","phon":"keo-pi-reul","native":"le café"},{"study":"음악을","reading":"eumageul","phon":"eum-ag-eul","native":"la musique"},{"study":"걷는 걸","reading":"geonneun geol","phon":"geon-neun geol","native":"marcher"},{"study":"운동을","reading":"undong-eul","phon":"oun-dong-eul","native":"le sport"}]),
  ({"study":"{s} 하나 주세요.","reading":"{s} hana juseyo.","phon":"{s} ha-na djou-sé-yo","native":"Un {s}, s'il vous plaît."}, [{"study":"커피","reading":"keopi","phon":"keo-pi","native":"café"},{"study":"차","reading":"cha","phon":"tcha","native":"thé"},{"study":"오렌지 주스","reading":"orenji juseu","phon":"o-ren-dji djou-seu","native":"jus d'orange"},{"study":"샌드위치","reading":"saendeuwichi","phon":"ssèn-deu-oui-tchi","native":"sandwich"}]),
  ({"study":"{s} 얼마예요?","reading":"{s} eolmayeyo?","phon":"{s} eol-ma-yé-yo ?","native":"Combien coûte {s} ?"}, [{"study":"이거","reading":"igeo","phon":"i-geo","native":"ça"},{"study":"커피","reading":"keopi","phon":"keo-pi","native":"le café"},{"study":"표","reading":"pyo","phon":"pyo","native":"le billet"},{"study":"방","reading":"bang","phon":"bang","native":"la chambre"}]),
 ],
 "dialogues": [
  [("A","안녕하세요!","annyeonghaseyo!","an-nyeong-ha-sé-yo","Bonjour !"),("B","안녕하세요. 뭐 드릴까요?","annyeonghaseyo. mwo deurilkkayo?","an-nyeong-ha-sé-yo. mwo deu-ril-kka-yo","Bonjour. Vous désirez ?"),("A","커피 하나 주세요.","keopi hana juseyo.","keo-pi ha-na djou-sé-yo","Un café, s'il vous plaît."),("B","우유 넣을까요?","uyu neoeulkkayo?","ou-you neo-eul-kka-yo","Avec du lait ?"),("A","아니요, 괜찮아요. 얼마예요?","aniyo, gwaenchanayo. eolmayeyo?","a-ni-yo, kouèn-tchan-a-yo. eol-ma-yé-yo","Non, merci. Combien ça coûte ?"),("B","삼천 원이에요.","samcheon won-ieyo.","sam-tcheon ouon-i-é-yo","Trois mille wons.")],
  [("A","실례합니다, 역이 어디예요?","sillyehamnida, yeogi eodiyeyo?","sil-lyé-ham-ni-da, yeog-i eo-di-yé-yo","Excusez-moi, où est la gare ?"),("B","쭉 가세요, 오 분이에요.","jjuk gaseyo, o bun-ieyo.","tchouk ka-sé-yo, o boun-i-é-yo","Tout droit, à cinq minutes."),("A","감사합니다. 부산 가는 표가 필요해요.","gamsahamnida. busan ganeun pyoga piryohaeyo.","gam-sa-ham-ni-da. bou-san ka-neun pyo-ga pil-yo-hè-yo","Merci. J'ai besoin d'un billet pour Busan."),("B","표 한 장, 만 원이에요.","pyo han jang, man won-ieyo.","pyo han djang, man ouon-i-é-yo","Un billet, dix mille wons."),("A","여기요. 정말 감사합니다.","yeogiyo. jeongmal gamsahamnida.","yeo-gi-yo. djeong-mal gam-sa-ham-ni-da","Voilà. Merci beaucoup."),("B","좋은 여행 되세요!","joeun yeohaeng doeseyo!","djo-eun yeo-hèng doé-sé-yo","Bon voyage !")],
  [("A","안녕하세요, 제 이름은 마리예요.","annyeonghaseyo, je ireumeun mari-yeyo.","an-nyeong-ha-sé-yo, djé i-reum-eun ma-ri-yé-yo","Bonjour, je m'appelle Marie."),("B","반갑습니다, 저는 폴이에요.","bangapseumnida, jeoneun pol-ieyo.","ban-gap-seum-ni-da, djeo-neun pol-i-é-yo","Enchanté, moi c'est Paul."),("A","저는 프랑스 사람이에요, 파리에서 왔어요. 당신은요?","jeoneun peurangseu saram-ieyo, pari-eseo wasseoyo. dangsineunyo?","djeo-neun peu-rang-seu sa-ram-i-é-yo, pa-ri-é-sseo oua-sseo-yo. dang-sin-eun-yo","Je suis française, de Paris. Et vous ?"),("B","저는 여기 사람이에요. 휴가 중이에요?","jeoneun yeogi saram-ieyo. hyuga jung-ieyo?","djeo-neun yeo-gi sa-ram-i-é-yo. hyou-ga djoung-i-é-yo","Je suis d'ici. Vous êtes en vacances ?"),("A","네, 이 도시를 정말 좋아해요.","ne, i dosireul jeongmal joahaeyo.","né, i do-si-reul djeong-mal djo-a-hè-yo","Oui, j'aime beaucoup la ville."),("B","좋네요! 환영해요!","jonneyo! hwanyeonghaeyo!","djon-né-yo. houan-yeong-hè-yo","Super ! Bienvenue !")],
 ]}

# Français étudié par des sinophones : phon en caractères chinois (style du deck : 美西 = merci)
FR = {
 "nat": "zh", "phonConv": "用汉字标注法语读音（沿用词库风格：美西 = merci，诺 = non）。汉字只是近似，请以音频为准。法语无声调，重音落在词尾。",
 "review": "需语言校对（汉字注音的近似程度、译文自然度）。",
 "units": [
  ({"study":"Je suis {s}.","phon":"热 绥 {s}","native":"我是{s}。"}, [{"study":"étudiant","phon":"埃居迪昂","native":"学生"},{"study":"français","phon":"弗朗赛","native":"法国人"},{"study":"de Paris","phon":"德 巴黎","native":"巴黎人"},{"study":"en vacances","phon":"昂 瓦康斯","native":"来度假的"}]),
  ({"study":"Je m'appelle {s}.","phon":"热 马佩尔 {s}","native":"我叫{s}。"}, [{"study":"Marie","phon":"玛丽","native":"玛丽"},{"study":"Paul","phon":"保罗","native":"保罗"},{"study":"Lin","phon":"林","native":"林"},{"study":"Ana","phon":"安娜","native":"安娜"}]),
  ({"study":"Je veux {s}.","phon":"热 弗 {s}","native":"我要{s}。"}, [{"study":"un café","phon":"安 卡菲","native":"一杯咖啡"},{"study":"de l'eau","phon":"德 罗","native":"水"},{"study":"un billet","phon":"安 比耶","native":"一张票"},{"study":"un sandwich","phon":"安 桑德维奇","native":"一个三明治"}]),
  ({"study":"J'ai besoin de {s}.","phon":"热 贝祖安 德 {s}","native":"我需要{s}。"}, [{"study":"aide","phon":"埃德","native":"帮助"},{"study":"un taxi","phon":"安 塔克西","native":"一辆出租车"},{"study":"un médecin","phon":"安 梅德森","native":"医生"},{"study":"la wifi","phon":"拉 维菲","native":"无线网"}]),
  ({"study":"Où est {s} ?","phon":"乌 埃 {s}","native":"{s}在哪里？"}, [{"study":"la gare","phon":"拉 嘎尔","native":"火车站"},{"study":"la sortie","phon":"拉 索尔蒂","native":"出口"},{"study":"le métro","phon":"勒 梅特罗","native":"地铁"},{"study":"l'hôtel","phon":"洛泰尔","native":"酒店"}]),
  ({"study":"Je vais {s}.","phon":"热 维 {s}","native":"我去{s}。"}, [{"study":"au travail","phon":"奥 特拉瓦伊","native":"上班"},{"study":"à la maison","phon":"阿 拉 梅宗","native":"家"},{"study":"au marché","phon":"奥 马尔谢","native":"市场"},{"study":"à l'hôtel","phon":"阿 洛泰尔","native":"酒店"}]),
  ({"study":"J'ai {s}.","phon":"热 {s}","native":"我{s}。"}, [{"study":"faim","phon":"方","native":"饿了"},{"study":"soif","phon":"斯瓦夫","native":"渴了"},{"study":"froid","phon":"弗鲁瓦","native":"冷"},{"study":"chaud","phon":"绍","native":"热"}]),
  ({"study":"J'aime {s}.","phon":"热姆 {s}","native":"我喜欢{s}。"}, [{"study":"le café","phon":"勒 卡菲","native":"咖啡"},{"study":"la musique","phon":"拉 缪吉克","native":"音乐"},{"study":"marcher","phon":"马尔谢","native":"走路"},{"study":"le sport","phon":"勒 斯波尔","native":"运动"}]),
  ({"study":"Un {s}, s'il vous plaît.","phon":"安 {s}，西尔 武 普莱","native":"请给我{s}。"}, [{"study":"café","phon":"卡菲","native":"一杯咖啡"},{"study":"thé","phon":"泰","native":"一杯茶"},{"study":"jus d'orange","phon":"居 多朗日","native":"一杯橙汁"},{"study":"sandwich","phon":"桑德维奇","native":"一个三明治"}]),
  ({"study":"Combien coûte {s} ?","phon":"孔比安 库特 {s}","native":"{s}多少钱？"}, [{"study":"ça","phon":"萨","native":"这个"},{"study":"le café","phon":"勒 卡菲","native":"咖啡"},{"study":"le billet","phon":"勒 比耶","native":"票"},{"study":"la chambre","phon":"拉 尚布尔","native":"房间"}]),
 ],
 "dialogues": [
  [("A","Bonjour !","蓬茹尔","你好！"),("B","Bonjour. Vous désirez ?","蓬茹尔。武 德吉雷","你好。您要什么？"),("A","Un café, s'il vous plaît.","安 卡菲，西尔 武 普莱","请给我一杯咖啡。"),("B","Avec du lait ?","阿维克 迪 莱","加牛奶吗？"),("A","Non, merci. Combien ça coûte ?","诺，美西。孔比安 萨 库特","不用，谢谢。多少钱？"),("B","Deux euros.","德 厄罗","两欧元。")],
  [("A","Excusez-moi, où est la gare ?","埃克斯居泽 穆瓦，乌 埃 拉 嘎尔","请问，火车站在哪里？"),("B","Tout droit, à cinq minutes.","图 德鲁瓦，阿 散克 米纽特","一直走，五分钟。"),("A","Merci. J'ai besoin d'un billet pour Lyon.","美西。热 贝祖安 丹 比耶 普尔 里昂","谢谢。我需要一张去里昂的票。"),("B","Un billet, dix euros.","安 比耶，迪 厄罗","一张票，十欧元。"),("A","Voilà. Merci beaucoup.","瓦拉。美西 博库","给您。非常感谢。"),("B","Bon voyage !","蓬 瓦亚日","一路顺风！")],
  [("A","Bonjour, je m'appelle Lin.","蓬茹尔，热 马佩尔 林","你好，我叫林。"),("B","Enchanté, moi c'est Paul.","昂尚泰，穆瓦 赛 保罗","很高兴认识你，我是保罗。"),("A","Je suis chinoise, de Shanghai. Et vous ?","热 绥 希努瓦兹，德 上海。埃 武","我是中国人，上海人。您呢？"),("B","Je suis d'ici. Vous êtes en vacances ?","热 绥 迪西。武 泽特 昂 瓦康斯","我是本地人。您来度假吗？"),("A","Oui, j'aime beaucoup la ville.","威，热姆 博库 拉 维尔","是的，我很喜欢这个城市。"),("B","Super ! Bienvenue !","苏佩尔！比安弗尼","太好了！欢迎！")],
 ]}

DATA = {"es": ES, "en": EN, "zh": ZH, "it": IT, "ja": JA, "ko": KO, "fr": FR}
NAMES = {"fr": "Français", "en": "Anglais", "es": "Espagnol", "zh": "Chinois", "it": "Italien", "ja": "Japonais", "ko": "Coréen"}
NAT_NAMES = {"fr": "francophones", "zh": "sinophones"}

# ---------------------------------------------------------------- assemblage
def fill(tpl, s):
    return tpl.replace("{s}", s)

def native_fill(tpl, s, nat):
    if nat == "fr":
        # élision « de + voyelle » → « d' »
        if " de {s}" in tpl and re.match(r"^[aeiouéèêhAEIOU]", s):
            tpl = tpl.replace(" de {s}", " d'{s}")
    out = fill(tpl, s)
    if nat == "fr":
        out = out[0].upper() + out[1:]
    return out

def compose(entry_model, slot, nat):
    e = {}
    for k in ("study", "phon", "native", "reading"):
        if k in entry_model:
            if k == "native": e[k] = native_fill(entry_model[k], slot[k], nat)
            else: e[k] = fill(entry_model[k], slot[k]).replace("  ", " ")
    # ponctuation : si le morceau porte déjà la ponctuation finale, on n'en double pas
    e["study"] = re.sub(r"([.?!。？！])\s*[.?!。？！]$", r"\1", e["study"])
    if "reading" in e: e["reading"] = re.sub(r"([.?!。？！])\s*[.?!。？！]$", r"\1", e["reading"])
    return e

def build(study, D):
    nat = D["nat"]
    units = []
    for i, (model, slots) in enumerate(D["units"], 1):
        variants = [dict(slot=slot, **compose(model, slot, nat)) for slot in slots]
        m = {k: v for k, v in model.items()}
        if m["study"] == "{s}":
            m["note"] = "Pas de verbe « avoir » ici : la langue exprime la sensation par un adjectif ou un verbe complet. La phrase entière est le morceau à apprendre."
        units.append({"id": f"L1-{nat}-{study}-{i:02d}", "situation": (SITU_ZH if nat == "zh" else SITU)[i-1],
                      "model": m, "variants": variants,
                      "practice": {"discover": 0, "replace": [1, 2, 3], "recall": 3}})
    dialogues = []
    for j, turns in enumerate(D["dialogues"], 1):
        T = []
        for t in turns:
            if len(t) == 5: T.append({"speaker": t[0], "study": t[1], "reading": t[2], "phon": t[3], "native": t[4]})
            else: T.append({"speaker": t[0], "study": t[1], "phon": t[2], "native": t[3]})
        dialogues.append({"id": f"L1-{nat}-{study}-d{j}", "situation": (DIALOG_SITU_ZH if nat == "zh" else DIALOG_SITU)[j-1], "turns": T,
                          "practice": "Écouter les deux rôles, masquer un rôle, répondre, puis remplacer une réplique par une variante personnelle." if nat == "fr" else "先听两个角色，遮住一个角色自己回答，再把一句台词换成自己的说法。",
                          "reuses": [u["id"] for u in units][:4]})
    return {
        "version": 1, "status": "échantillon-à-valider", "studyLanguage": study, "nativeLanguage": nat,
        "fields": {"study": f"phrase en {NAMES[study].lower()}", "phon": f"prononciation écrite pour {NAT_NAMES[nat]}", "native": "traduction en langue maternelle",
                   **({"reading": {"zh": "pinyin avec tons", "ja": "lecture en hiragana", "ko": "romanisation révisée"}[study]} if study in ("zh", "ja", "ko") else {})},
        "phoneticConvention": D["phonConv"], "reviewStatus": D["review"], "coverageClaim": None,
        "level": L1["level"], "title": L1["title"], "goal": L1["goal"], "reviewPreviousLevels": [],
        "exercisePath": ["découvrir", "remplacer", "essayer sans réponse visible", "converser"],
        "units": units, "dialogues": dialogues,
        "readiness": "Se présenter en trois phrases, exprimer un besoin, commander et demander un prix ; comprendre et compléter les trois dialogues. Repère pédagogique, sans certification."
    }

os.makedirs(OUT_DIR, exist_ok=True)
files = {}
for study, D in DATA.items():
    doc = build(study, D)
    path = f"{OUT_DIR}/L1-{D['nat']}-{study}.json"
    json.dump(doc, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    files[study] = doc
    nv = sum(len(u["variants"]) for u in doc["units"]); nt = sum(len(d["turns"]) for d in doc["dialogues"])
    print(f"{path.split('/')[-1]:<16} {len(doc['units'])} modèles · {nv} variantes · {len(doc['dialogues'])} dialogues · {nt} répliques")

# ---------------------------------------------------------------- document de relecture
md = ["# Échantillon L1 « Premiers contacts » — 7 langues étudiées", "",
      "Objectif L1 : saluer, se présenter, exprimer un besoin, commander simplement. Pour chaque langue : 10 modèles × 4 variantes (le morceau remplaçable est en **gras**), 3 dialogues de 6 répliques. Langue maternelle : français pour six langues ; chinois pour le français (public principal).", "",
      "Colonnes : phrase étudiée · lecture (pinyin / hiragana / romanisation, si applicable) · prononciation écrite pour le lecteur · traduction.", ""]
for study, doc in files.items():
    md += [f"## {NAMES[study]} (lecteurs {NAT_NAMES[doc['nativeLanguage']]})", "", f"*Convention phonétique* : {doc['phoneticConvention']}", "", f"*Statut* : {doc['reviewStatus']}", ""]
    for u in doc["units"]:
        md.append(f"### {u['id']} · {u['situation']} — modèle « {u['model']['study']} »")
        md.append("")
        has_r = "reading" in u["model"]
        md.append("| Phrase | " + ("Lecture | " if has_r else "") + "Prononciation | Traduction |")
        md.append("|---|" + ("---|" if has_r else "") + "---|---|")
        for v in u["variants"]:
            st = v["study"].replace(v["slot"]["study"], f"**{v['slot']['study']}**", 1)
            md.append(f"| {st} | " + (f"{v['reading']} | " if has_r else "") + f"{v['phon']} | {v['native']} |")
        md.append("")
    for d in doc["dialogues"]:
        md.append(f"### {d['id']} · {d['situation']}")
        md.append("")
        for t in d["turns"]:
            r = f" *({t['reading']})*" if "reading" in t else ""
            md.append(f"- **{t['speaker']}** : {t['study']}{r} — {t['phon']} — {t['native']}")
        md.append("")
open(OUT_MD, "w", encoding="utf-8").write("\n".join(md))
print("relecture →", OUT_MD)
