#!/usr/bin/env python3
"""Propose content types for the three Latin-script learner decks.

This is an explicit, conservative editorial aid, not a syntactic parser. It
never uses cat=vocab/fragment as sufficient evidence and never writes a card.
"""
from __future__ import annotations

import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path
import re
import unicodedata

ROOT = Path(__file__).resolve().parents[2]
DESTINATION = Path("docs/niveaux-progressifs/types-contenu")
LANGUAGES = ("en", "es", "it")


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()


def normal(text):
    text = re.sub(r"\([^)]*\)", "", text.lower().replace("’", "'"))
    text = "".join(c for c in unicodedata.normalize("NFD", text) if not unicodedata.combining(c))
    text = re.sub(r"[.!?¡¿;:«»\"()]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


NUMBERS = set("zero un une deux trois quatre cinq six sept huit neuf dix onze douze treize quatorze quinze seize vingt trente quarante cinquante soixante cent cents mille million millions milliard milliards premier premiere deuxieme second seconde troisieme quatrieme cinquieme sixieme septieme huitieme neuvieme dixieme onzieme douzieme treizieme quatorzieme quinzieme seizieme vingtieme trentieme centieme millieme demi demie moitie tiers quart et ou virgule pourcent".split())
STUDY_NUMBER_WORDS = {
    "en": set("zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty thirty forty fifty sixty seventy eighty ninety hundred thousand million billion first second third fourth fifth sixth seventh eighth ninth tenth half quarter a an and or".split()),
    "es": set("cero uno una un dos tres cuatro cinco seis siete ocho nueve diez once doce trece catorce quince dieciseis veinte treinta cuarenta cincuenta sesenta setenta ochenta noventa cien ciento mil millon millones primero primera segundo segunda tercero tercera cuarto cuarta quinto quinta mitad tercio y o".split()),
    "it": set("zero uno una un due tre quattro cinque sei sette otto nove dieci undici dodici tredici quattordici quindici sedici venti trenta quaranta cinquanta sessanta settanta ottanta novanta cento mille milione milioni primo prima secondo seconda terzo terza quarto quarta quinto quinta meta mezzo terzo e o".split()),
}
PREPOSITIONS = {
    "en": {"in", "on", "under", "over", "above", "below", "behind", "in front of", "between", "among", "with", "without", "for", "at", "from", "to", "towards", "toward", "near", "next to", "beside", "far from", "across from", "opposite", "inside", "outside", "around", "through", "across", "along", "against", "during", "until", "since", "despite", "instead of", "because of", "thanks to", "due to", "according to", "by", "about", "as for", "regarding", "with regard to"},
    "es": {"en", "sobre", "bajo", "debajo de", "encima de", "detras de", "delante de", "entre", "con", "sin", "para", "por", "a", "de", "hacia", "cerca de", "al lado de", "junto a", "lejos de", "frente a", "enfrente de", "dentro de", "fuera de", "alrededor de", "a traves de", "contra", "durante", "hasta", "desde", "a pesar de", "en lugar de", "a causa de", "gracias a", "debido a", "segun", "acerca de", "en cuanto a", "respecto a"},
    "it": {"in", "su", "sotto", "sopra", "dietro", "davanti a", "tra", "fra", "con", "senza", "per", "a", "da", "di", "verso", "vicino a", "accanto a", "lontano da", "di fronte a", "dentro", "fuori da", "intorno a", "attraverso", "contro", "durante", "fino a", "da quando", "nonostante", "invece di", "a causa di", "grazie a", "secondo", "riguardo a", "per quanto riguarda"},
}
PREPOSITION_MEANINGS = {
    "dans", "en", "sur", "sous", "au-dessus de", "au-dessous de", "derriere", "devant", "entre", "parmi",
    "avec", "sans", "pour", "a", "de", "depuis", "vers", "pres de", "a cote de", "loin de", "en face de",
    "a l'interieur de", "a l'exterieur de", "autour de", "a travers", "le long de", "contre", "pendant",
    "jusqu'a", "malgre", "au lieu de", "a cause de", "grace a", "en raison de", "selon", "par", "a propos de",
    "quant a", "par rapport a", "a l'egard de", "au sujet de", "chez",
}
ADJECTIVES_FR = set("""
rouge bleu bleue vert verte jaune noir noire blanc blanche gris grise marron rose orange beige violet violette dore
doree argente argentee nouveau nouvelle neuf neuve ancien ancienne vieux vieille jeune beau belle joli jolie laid
laide grand grande petit petite gros grosse haut haute bas basse long longue court courte large etroit etroite epais
epaisse fin fine chaud chaude froid froide tiede frais fraiche cher chere couteux couteuse gratuit gratuite bon bonne
mauvais mauvaise meilleur meilleure pire propre sale sec seche humide mou molle dur dure doux douce fort forte faible
rapide lent lente facile difficile simple complique compliquee possible impossible vrai vraie faux fausse gentil gentille
mechant mechante sympa sympathique aimable poli polie impoli impolie heureux heureuse triste content contente fatigue
fatiguee malade sain saine libre occupe occupee ouvert ouverte ferme fermee plein pleine vide rond ronde carre carree
pointu pointue plat plate lisse rugueux rugueuse solide fragile lourd lourde leger legere utile inutile important importante
necessaire suffisant suffisante insuffisant insuffisante correct correcte incorrect incorrecte juste injuste pareil pareille
different differente similaire identique certain certaine incertain incertaine sur sure dangereux dangereuse calme
bruyant bruyante silencieux silencieuse confortable inconfortable pratique impratique elegant elegante moderne traditionnel
traditionnelle naturel naturelle artificiel artificielle legal legale illegal illegale local locale international internationale
disponible indisponible public publique prive privee personnel personnelle professionnel professionnelle technique economique
resistant resistante impermeable toxique douteux douteuse urgent urgente prioritaire obligatoire facultatif facultative
efficace inefficace precis precise flou floue exact exacte stable instable adorable delicieux delicieuse savoureux savoureuse
sucre sucree sale salee amer amere acide piquant piquante epice epicee cru crue cuit cuite surgele surgelee congele congelee
mouille mouillee pliable agace agacee intense transparent transparente opaque elastique rigide tendre trouble brillant brillante
mat mate terne nerveux nerveuse inquiet inquiete genereux genereuse honnete malhonnete fier fiere jaloux jalouse timide curieux
curieuse intelligent intelligente idiot idiote drole serieux serieuse fou folle genial geniale fantastique parfait parfaite
nul nulle super cool chelou moisi moisie perime perimee valable abime abimee endommage endommagee casse cassee use usee fixe
standard optimal optimale terrible horrible merveilleux merveilleuse etonnant etonnante surprenant surprenante incroyable
inacceptable admissible inadmissible conforme autonome automatique manuel manuelle rechargeable portable robuste durable
flexible recyclable reutilisable extensible ajustable amovible detendu detendue plastique metallique vibrant vibrante compact
compacte etanche invincible incassable voyant voyante fache fachee
""".split())
ADJECTIVES_STUDY = {
    "en": set("nice great perfect unbelievable cool awesome fresh frozen fragile waterproof big small new old easy hard fast slow clean dirty full empty expensive heavy long short high low strong weak same different useful useless dangerous safe important simple complicated funny comfortable necessary transparent shiny matte lightweight smooth rough thick wide narrow flat round jealous nervous curious annoyed red blue green yellow black white gray brown pink beige golden sweet salty bitter sour spicy raw cooked wet dry warm cold hot soft sharp dull narrow bright dark clear cloudy happy sad tired angry beautiful ugly cheap free available fair possible impossible".split()),
    "es": set("genial caro grande pequeno viejo nuevo rapido facil dificil bueno malo lento rojo azul verde negro blanco amarillo gris marron rosa naranja beige dorado plateado guay frio caliente limpio sucio lleno vacio fuerte debil".split()),
    "it": set("fantastico perfetto geniale incredibile impossibile possibile grande piccolo nuovo vecchio facile difficile veloce lento pulito sporco pieno vuoto caro pesante leggero lungo corto forte debole uguale diverso utile inutile pericoloso sicuro importante semplice complicato serio divertente terribile comodo necessario brillante opaco duro largo sottile piatto rotondo geloso nervoso curioso morbido stretto spesso rosso nero trasparente liscio appuntito blu verde bianco rosa fresco giallo grigio arancione infastidito marrone beige dorato argentato ruvido fragile impermeabile surgelato".split()),
}
FIXED_STUDY_UTTERANCES = {
    "en": {"no way", "good job", "good work", "nice work", "well done", "way to go", "good point", "good call", "thank god"},
    "es": {"que bien", "que mal", "que guay", "menos mal", "bien hecho"},
    "it": {"ben fatto", "ottimo lavoro", "che bello", "che bella notizia"},
}
ADVERBS_FR = {
    "ici", "la", "ailleurs", "partout", "nulle part", "dehors", "dedans", "dessus", "dessous", "en haut", "en bas",
    "hier", "demain", "aujourd'hui", "maintenant", "bientot", "tard", "tot", "toujours", "jamais", "souvent",
    "rarement", "parfois", "quelquefois", "deja", "encore", "enfin", "ensuite", "auparavant", "desormais",
    "beaucoup", "peu", "assez", "tres", "trop", "moins", "plus", "presque", "tellement", "tant", "autant",
    "aussi", "surtout", "seulement", "uniquement", "simplement", "juste", "bien", "mal", "mieux", "plutot",
    "vraiment", "vachement", "absolument", "certainement", "probablement", "peut-etre", "evidemment",
    "ensemble", "separement", "vite", "rapidement", "lentement", "doucement", "clairement", "exactement",
    "completement", "totalement", "entierement", "directement", "sincerement", "franchement", "honnetement",
    "heureusement", "malheureusement", "immediatement", "normalement", "generalement", "habituellement",
    "facilement", "difficilement", "naturellement", "enormement", "extremement", "suffisamment", "autrement",
    "ainsi", "comment", "ou", "pourquoi", "quand", "combien", "volontiers", "tantot", "davantage",
}
ADVERBS_STUDY = {
    "en": set("here there elsewhere everywhere nowhere outside inside upstairs downstairs yesterday tomorrow today now soon late early always never often rarely sometimes already again finally then previously henceforth much little enough very too less more almost so also especially only just well badly better rather really absolutely certainly probably perhaps maybe together separately fast slowly clearly exactly completely totally directly sincerely honestly luckily unfortunately immediately normally generally usually easily hardly naturally enormously extremely sufficiently otherwise thus how where why when willingly afterwards".split()),
    "es": set("aqui ahi alli alla fuera dentro arriba abajo ayer manana hoy ahora pronto tarde temprano siempre nunca jamas raramente ya finalmente luego antes despues mucho poco bastante muy demasiado menos mas casi tambien solo solamente bien mal mejor realmente absolutamente seguramente probablemente quizas quiza juntos deprisa despacio claramente exactamente completamente totalmente directamente sinceramente honestamente afortunadamente desgraciadamente inmediatamente normalmente generalmente habitualmente facilmente dificilmente naturalmente enormemente extremadamente suficientemente asi como donde cuando cuanto".split()),
    "it": set("qui qua li la altrove ovunque fuori dentro sopra sotto ieri domani oggi adesso ora presto tardi sempre mai spesso raramente talvolta gia ancora finalmente poi prima dopo molto poco abbastanza troppo meno piu quasi anche soprattutto solo soltanto appena bene male meglio davvero assolutamente certamente probabilmente forse insieme separatamente velocemente lentamente chiaramente esattamente completamente totalmente direttamente sinceramente onestamente fortunatamente sfortunatamente immediatamente normalmente generalmente abitualmente facilmente difficilmente naturalmente enormemente estremamente sufficientemente altrimenti cosi come dove perche quando quanto volentieri".split()),
}
ADVERBIAL_UNITS = {
    "en": {
        "from time to time": {"de temps en temps"}, "at first": {"au debut"}, "in fact": {"en fait"},
        "as soon as possible": {"des que possible"}, "as well": {"aussi"}, "right away": {"tout de suite"},
        "by the way": {"au fait"}, "little by little": {"petit a petit"}, "step by step": {"pas a pas"},
        "at the same time": {"en meme temps"}, "more or less": {"plus ou moins"}, "so to speak": {"pour ainsi dire"},
        "first of all": {"tout d'abord"}, "in other words": {"autrement dit"}, "in short": {"en bref", "bref"},
        "at last": {"enfin"}, "for now": {"pour l'instant"}, "for the moment": {"pour le moment"},
        "in the end": {"au final", "a la fin", "finalement"}, "all the time": {"tout le temps"},
        "once again": {"encore une fois"}, "in general": {"en general"}, "all of a sudden": {"tout a coup"},
    },
    "es": {
        "de vez en cuando": {"de temps en temps"}, "poco a poco": {"petit a petit"}, "paso a paso": {"pas a pas"},
        "de hecho": {"en fait"}, "en general": {"en general"}, "por lo general": {"en general"},
        "por cierto": {"au fait"}, "mas o menos": {"plus ou moins"}, "enseguida": {"tout de suite"},
        "ahora mismo": {"tout de suite"}, "a menudo": {"souvent"}, "a veces": {"parfois", "quelquefois"},
        "casi siempre": {"presque toujours"}, "en realidad": {"en realite"}, "en resumen": {"en bref"},
        "de todas formas": {"de toute facon"}, "al principio": {"au debut"}, "al final": {"a la fin", "au final"},
        "a la vez": {"en meme temps"}, "de nuevo": {"a nouveau"}, "otra vez": {"encore une fois"},
        "sobre todo": {"surtout"}, "en otras palabras": {"autrement dit"}, "de verdad": {"vraiment"},
        "de repente": {"soudain", "tout a coup"}, "lo antes posible": {"des que possible"},
    },
    "it": {
        "di tanto in tanto": {"de temps en temps"}, "a poco a poco": {"petit a petit"},
        "poco a poco": {"petit a petit"}, "a volte": {"parfois", "quelquefois"}, "infatti": {"en fait"},
        "in breve": {"en bref", "bref"}, "insomma": {"en bref", "bref"}, "per ora": {"pour l'instant"},
        "in altre parole": {"autrement dit"}, "piu o meno": {"plus ou moins"},
        "all'inizio": {"au debut"}, "alla fine": {"a la fin", "au final"},
        "all'improvviso": {"soudain", "tout a coup"}, "ogni tanto": {"de temps en temps"},
        "di nuovo": {"a nouveau"}, "a proposito": {"au fait"},
        "allo stesso tempo": {"en meme temps"}, "prima di tutto": {"tout d'abord"},
        "appena possibile": {"des que possible"}, "in generale": {"en general"},
    },
}
SPEECH_ACTS = {
    "oui", "non", "bonjour", "bonsoir", "salut", "merci", "mille mercis", "merci beaucoup",
    "de rien", "je vous en prie", "je t'en prie", "pardon", "desole", "desolee",
    "s'il vous plait", "s'il te plait", "au revoir", "a bientot", "a plus tard", "a demain",
    "a tout de suite", "a tout a l'heure", "bonne nuit", "bonne journee", "bonne soiree",
    "bon voyage", "bon appetit", "bon courage", "bonne chance", "bon travail", "bonne annee",
    "joyeux anniversaire", "bienvenue", "bienvenue a bord", "felicitations", "bravo",
    "d'accord", "ok", "bien sur", "bien entendu", "sans probleme", "pas de probleme",
    "sans aucun probleme", "avec plaisir", "avec grand plaisir", "a votre service", "a ton service",
    "enchante", "enchantee", "sante", "a tes souhaits", "a vos souhaits", "allo",
    "voila", "tiens", "tiens / voila", "oh non", "oh oui", "moi aussi", "moi non plus",
    "apres vous", "apres toi", "a vous", "a toi", "a toi de jouer", "marche conclu",
    "bien recu", "compris", "entendu", "c'est entendu", "a la votre", "a la tienne",
    "pas du tout", "pas vraiment", "pourquoi pas", "sans aucun doute", "sans doute",
    "comme tu veux", "comme vous voulez", "quand tu veux", "quand vous voulez",
    "rien de neuf", "quoi de neuf", "quoi d'autre", "autre chose", "et toi", "et vous",
    "a table", "attention", "au secours", "a l'aide", "halte", "chut", "silence",
    "apres la pluie, le beau temps", "aux grands maux les grands remedes",
}
LINKED = {
    "parce que", "puisque", "afin de", "afin que", "pour que", "a moins que", "bien que",
    "quoique", "en cas de", "au cas ou", "des que", "tant que", "jusqu'a ce que", "a condition que",
    "plus que", "moins que", "pire que", "mieux que", "autant que", "aussi que", "tellement que",
    "en raison de", "a cause de", "grace a", "a cote de", "en face de", "loin de", "pres de",
    "au lieu de", "a propos de", "en train de", "en fonction de", "a l'egard de", "en vue de",
    "de peur de", "de peur que", "du fait de", "faute de", "quant a", "par rapport a",
    "un sac de", "une bouteille de", "un verre de", "une tasse de", "un peu de", "beaucoup de",
    "trop de", "assez de", "une sorte de", "un genre de", "a la place de",
}
OPEN_END = re.compile(r"\b(?:de|d'|du|des|à|au|aux|pour|avec|sans|que|qu'|si|comme|chez|vers|dans|sur|sous)$")
SUBORDINATE = re.compile(r"^(?:parce que|puisque|bien que|quoique|a moins que|a condition que|si|des que|tant que|jusqu'a ce que|afin que|pour que|en cas de|au cas ou)\b")
PRONOUN_CLAUSE = re.compile(r"\b(?:je\s+|j'|tu\s+|il\s+|elle\s+|on\s+|nous\s+|vous\s+|ils\s+|elles\s+)(?:ne\s+|n'|me\s+|te\s+|se\s+|le\s+|la\s+|les\s+|l'|y\s+|en\s+|m'|t'|s')*([a-zàâäçéèêëïîôöùûüœ]+)", re.I)
NON_VERB_HEADS = set("et ou aussi meme memes seul seuls seule seules autres autre seulement tous toutes un une des du de pour avec sans chez moi toi lui elle eux nous vous le la les ce cette ces ceci cela quelques qui que quoi dont lorsque quand pendant selon apres avant".split())
FRENCH_AUXILIARIES = re.compile(r"(?<![\w'’-])(?:est|sont|était|étaient|sera|seront|serait|seraient|a|ont|avait|avaient|aura|auront|aurait|auraient|fait|font|faisait|fera|feront|doit|doivent|devait|devra|peut|peuvent|pouvait|pourra|va|vont|allaient|semble|paraît|coûte|fonctionne|commence|termine|reste|suffit|manque|marche|ferme|ouvre|propose|arrive|part|commencent|restent|arrivent|coûtent|veut|veulent|vise|dépend|rend)\s+\S", re.I)
IMPERATIVES = set("attends attendez viens venez prends prenez donne donnez dis dites parle parlez ecoute ecoutez regarde regardez regarde regarde-moi regarde-nous garde gardez continue continuez avance avancez recule reculez arrete arretez aide aidez essaie essaye essayez reessaie reessayez ouvre ouvrez ferme fermez entre entrez sortez sors reste restez tais-toi taisez-vous calme-toi calmez-vous detends-toi detendez-vous asseyez-vous assieds-toi assieds-toi leve-toi levez-vous tourne tournez mettez mets allume allumez eteins eteignez appelle appelez rappelle rappelez envoie envoyez ecris ecrivez signe signez verifie verifiez attends souvenez-vous souviens-toi laisse laissez raconte racontez demande demandez pardonne pardonnez excuse excusez-moi excuse-moi veuillez voyez voit passons allons-y allez-y vas-y profitez profite oublie oubliez repose-toi reposez-vous confirme confirmez reponds repondez cessez cesse revenez reviens achete achetez mange mangez bois buvez dors dormez range rangez nettoie nettoyez change changez choisissons choisit choisissez choisisse essaie respire respirez conduis conduisez montre montrez suivez suis-moi pardonne-moi pardonnez-moi prepare preparez sois soyez fais faites tire tirez pousse poussez verifiez validez precise precisez mettons commencons sortons partons ecoutons laissons attendons passons rappelons prenons gardons reglez regle remplis remplissez retire retirez approche approchez souleve soulevez confirmez reserve reservez emporte emportez couche-toi couchez-vous recommence recommencez cherche cherchez note notez lis lisez raccroche raccrochez repete repetez rassure-toi rassurez-vous profite felicite felicitons evite evitez apportez apporte pose posez enleve enlevez tiens tenez".split())
QUESTION_GLOSSES = {
    "pourquoi", "comment", "quand", "qui", "ou", "combien", "comment / pardon", "comment / pardon / quoi",
    "et toi", "et vous", "quoi d'autre", "autre chose", "quoi de neuf", "pourquoi pas", "depuis quand",
    "quelle heure", "quelle ligne", "quelle taille", "quel genre", "quel numero", "quel prix", "quel jour",
    "quel age", "quelle couleur", "a quelle heure", "pour combien de temps", "pour combien", "lequel", "laquelle",
}
IMPERATIVES.update("monte montez montons montrez montre rentre rentrez rentrons lave lavez lave-toi compte comptez embrasse embrassez salue saluez souffle soufflez ajoute ajoutez construisons construisez coupons organisez organisons trouvons trouvez fournissez fournis previens prevenez depeche depechez depeche-toi depechez-vous allez donnons donnons-nous portons souhaitons faites-moi donnez-moi envoyez-moi montrez-moi tiens-moi tenez-moi branche branchez amuse-toi amusez-vous faisons fais-toi faites-vous restons jouons restons profitons n'oublie n'oubliez rassure rassurez laisse-moi laissez-moi parle-leur parlez-leur".split())
IMPERATIVES.update("remets remettez ralentis ralentissez finissons finissez reportons reportez va attrape attrapez souris souriez lance lancez regale regalez sers servez abandonne abandonnez plie pliez derange derangez inquiete inquietez jette jetez espere esperons esperez multiplie multipliez gare garez aie ayez crois croyez surveille surveillez insiste insistez stresse stressez fache fachez culpe culpabilise culpabilisez mele melez perds perdez partage partagez detaille detaillez adaptez adapte travaillons travaillez signons signez cherchons cherchons-nous conseillez conseille ajoutons ajoutons-nous reflechissez reflechis hesitez hesite transmettez transmets bats battez accordez accorde permettez permets rangeons rangeons-nous revoyons revoyez neglige negligez".split())
FRENCH_FINITE = set("donne donnent porte portent chauffe chauffent siffle sifflent grimpe grimpent retrecit retrecissent vient viennent appartient appartiennent vaut valent finira finiront continue continuent arrete arretent respecte respectent correspond correspondent augmente augmentent charge chargent parvient parviennent capte captent contient contiennent produit produisent depasse depassent vend vendent grandit grandissent inclut incluent use usent scintille scintillent comprend comprennent inclue incluez inclure dure durent prend prennent decide decident pousse poussent vole volent entend entendent paie paient paye payent recupere recuperent suffit suffisent manque manquent passe passent ferme ferment ouvre ouvrent pense pensent attend attendent prevoit prevoient resout resolvent depasse depassent sert servent sonne sonnent couvre couvrent part partent vole volent monte montent baisse baissent coule coulent brule brulent brille brillent tombe tombent suffit suffit survient surviennent merite meritent empeche empechent pose posent permet permettent garantit garantissent perd perdent varie varient saute sautent bouge bougent parait paraissent reste restent ressemble ressemblent ressort ressortent tourne tournent risque risquent offre offrent fera feront ira iront verifie verifient sait savent exige exigent rend rendent semble semblent inclut incluent depend dependent suffit suffisent".split())
WH_QUESTIONS = {
    "en": re.compile(r"^(?:what|which|when|why|where|how|who|whom|whose)\b"),
    "es": re.compile(r"^(?:que|cual|cuales|cuanto|cuanta|cuantos|cuantas|cuando|como|donde|quien|quienes|de donde|por que|desde cuando|a que)\b"),
    "it": re.compile(r"^(?:che|quale|quali|quanto|quanta|quanti|quante|quando|come|dove|chi|cosa|da dove|a che|perche)\b"),
}
EN_AUX = re.compile(r"\b(?:am|is|are|was|were|has|have|had|does|did|will|would|could|should|must|isn't|aren't|wasn't|weren't|don't|doesn't|didn't|can't|couldn't|won't|wouldn't|haven't|hasn't|hadn't)\s+\S", re.I)
EN_SUBJECT = re.compile(r"\b(?:I|you|we|they|he|she|it)(?:'(?:m|re|s|ve|ll|d))?\s+([a-z]+)", re.I)
ES_COPULA = re.compile(r"\b(?:soy|eres|es|somos|sois|son|estoy|estas|esta|estamos|estais|estan|hay|tengo|tiene|tienen|necesito|quiero|podemos|puedo|puede|tenemos|tenia|estaba|era|eran|sera|seran|hace|funciona|cuesta|cuestan|parece|falta|sobra|llueve|nieva)\s+\S", re.I)
IT_COPULA = re.compile(r"\b(?:sono|sei|è|siamo|siete|stiamo|sto|sta|stanno|ho|hai|ha|abbiamo|hanno|posso|puoi|può|possiamo|voglio|vuole|devo|deve|bisogna|serve|funziona|costa|costano|manca|sembra|era|erano|sarà|saranno|faccio|facciamo)\s+\S", re.I)


def french_clause(text):
    raw = re.sub(r"\([^)]*\)", "", text.lower().replace("’", "'"))
    pronoun_input = re.sub(r"\b(je |j'|tu |il |elle |on |nous |vous |ils |elles )(?:vous|nous) ", r"\1", raw)
    heads = [normal(match.group(1)) for match in PRONOUN_CLAUSE.finditer(pronoun_input)]
    auxiliary_input = re.sub(r"\b(?:s'|m'|t'|n')(?=(?:est|était|a|avait|ont)\b)", "", raw)
    finite_tokens = [normal(token) for token in re.findall(r"[a-zàâäçéèêëïîôöùûüœ]+", raw)]
    determiners = {"le", "la", "les", "un", "une", "des", "du", "mon", "ma", "mes", "ton", "ta", "tes", "son", "sa", "ses", "notre", "nos", "votre", "vos", "leur", "leurs", "ce", "cette", "cet", "ces", "l", "de", "d", "a", "en", "pour", "au", "aux"}
    return (any(head not in NON_VERB_HEADS for head in heads)
            or bool(FRENCH_AUXILIARIES.search(auxiliary_input))
            or bool(re.search(r"\b(?:c'est|c'etait|c'était|ce sera|ce n'est|ça |cela |ceci )", raw))
            or any(match.group(0) != "rendez-vous" for match in re.finditer(r"\b[a-zàâäçéèêëïîôöùûüœ]+-(?:t-)?(?:il|elle|on|tu|vous|nous|ils|elles)\b", raw))
            or any(token in FRENCH_FINITE and i > 0 and finite_tokens[i - 1] not in determiners
                   for i, token in enumerate(finite_tokens)))


def study_clause(language, text):
    t = normal(text)
    if language == "en":
        return (bool(EN_AUX.search(t))
                or bool(re.search(r"\b(?:i|you|we|they|he|she|it)'(?:m|re|s|ve|ll|d)\s+\S", t))
                or any(m.group(1) not in {"and", "or", "too", "alone", "only", "again", "all", "both", "myself", "yourself", "with", "without", "up", "down", "out", "in", "off", "on", "there", "here", "away"} for m in EN_SUBJECT.finditer(t)))
    return bool((ES_COPULA if language == "es" else IT_COPULA).search(t if language == "es" else text.lower()))


def classify(language, card):
    t, f = normal(card["t"]), normal(card["frm"])
    raw_french_end = re.sub(r"[.!?;:。！？]+$", "", card["frm"].lower().replace("’", "'")).strip()
    has_question = "?" in card["t"]
    words = f.replace("-", " ").split()
    if re.search(r"\{[^}]*\}|\.{2,}|…|_{2,}|\[[^]]*\]", card["t"]):
        return "incomplete", "Forme étudiée explicitement ouverte : emplacement, pointillés ou complément à fournir."
    number_tokens = re.findall(r"[a-z]+|\d+(?:[.,]\d+)?", f)
    study_number_tokens = re.findall(r"[a-z]+|\d+(?:[.,]\d+)?", t)
    if (number_tokens and all(token in NUMBERS or re.fullmatch(r"\d+(?:[.,]\d+)?", token) for token in number_tokens)
            and study_number_tokens and all(token in STUDY_NUMBER_WORDS[language] or token.isdigit() for token in study_number_tokens)
            and f not in {"et", "ou", "une seconde"}):
        return "number", "Nombre cardinal, ordinal ou fraction exprimé seul ; aucun objet, unité usuelle ou proposition."
    if f in SPEECH_ACTS:
        return "utterance", "Formule autonome de salutation, réponse, politesse ou interaction ; la brièveté ne la rend pas incomplète."
    if t in FIXED_STUDY_UTTERANCES[language]:
        return "utterance", "Réplique idiomatique ou formule d'interaction reconnue dans la forme étudiée ; pas un simple adjectif traduit isolément."
    if not has_question and t in PREPOSITIONS[language] and f in PREPOSITION_MEANINGS:
        return "vocabulary", "Préposition ou locution prépositive lexicalement bornée, croisée avec le sens français ; pas une phrase ni un cadre à trous."
    if not has_question and f in ADVERBIAL_UNITS[language].get(t, set()):
        return "vocabulary", "Locution adverbiale bornée reconnue dans les deux langues ; unité lexicale complète plutôt qu'une phrase."
    if (language == "en" and t in {"wood", "the password", "an appointment"}) or (language == "es" and t == "madera") or (language == "it" and t in {"legno", "la password", "un appuntamento", "il naso che cola"}):
        return "vocabulary", "Entrée nominale inspectée ; éviter de confondre bois, mot de passe ou rendez-vous avec un verbe ou une inversion."
    if not has_question and f in {"ou", "et", "mais", "car"}:
        return "vocabulary", "Mot-outil isolé : valeur interrogative ou de liaison, sans proposition complète."
    if f in LINKED or (not has_question and OPEN_END.search(raw_french_end) and len(words) <= 7):
        return "incomplete", "Groupe lié laissé ouvert : introducteur, comparaison ou complément encore attendu."
    if SUBORDINATE.match(f) and not has_question and not re.search(r"[,;]", card["t"]):
        return "incomplete", "Subordonnée conditionnelle ou causale seule, sans proposition principale explicitée."
    if language == "en" and (re.search(r"\blet's\b", t) or re.match(r"^(?:fill|hold|let|shut|cheer|enjoy|remember|forget|show|say|tell|bring|take|give|keep|come|go|help)\s+", t) and re.search(r"[.!]$", card["t"])):
        return "utterance", "Consigne anglaise à l'impératif avec complément ou invitation en let's ; la forme étudiée confirme l'acte de parole."
    if f.startswith(("merci ", "tous mes voeux", "toutes mes condoleances")) or f.startswith(("s'il vous plait ", "s'il te plait ")) or "s'il vous plait" in f or "s'il te plait" in f or re.search(r"\bsvp\b", f):
        return "utterance", "Demande ou formule complète avec marque explicite de politesse, y compris une demande nominale."
    if (re.match(r"^(?:avoir|etre|faire|savoir|mettre|prendre|aller|passer|flaner|tenir|assurer|sentir|renverser|valoir|pousser|attacher|avancer|tourner|se lancer|se retourner)\b", f)
            and not re.search(r"[,;]", card["t"]) and not study_clause(language, card["t"])):
        return "vocabulary", "Infinitif ou locution verbale à forme lexicale, sans sujet et verbe conjugué ; à apprendre dans le vocabulaire."
    imperative = re.sub(r"^(?:ne |n')", "", f)
    first = imperative.split(" ", 1)[0]
    base_verb = first.split("-")[0]
    if first in IMPERATIVES or (base_verb in IMPERATIVES and re.search(r"-(?:moi|toi|nous|vous|leur|le|la|les|y|en)\b", first)):
        return "utterance", "Consigne à l'impératif dans le sens français ; elle fonctionne comme tour complet."
    if has_question and (f in QUESTION_GLOSSES or WH_QUESTIONS[language].search(t) or french_clause(card["frm"]) or study_clause(language, card["t"]) or re.search(r"\bou\b", f)):
        return "utterance", "Question autonome : forme interrogative explicite et proposition ou formule interrogative identifiable."
    if french_clause(card["frm"]) or study_clause(language, card["t"]) or re.search(r"\b(?:voici|voila)\s+\S", f):
        return "utterance", "Proposition avec prédication finie identifiable dans le texte étudié ou son sens français ; ni étiquette ni ponctuation seules."
    if has_question:
        return "review", "Question elliptique possible, mais autonomie non établie par les règles ; relecture sémantique requise."
    if len(t.split()) <= 2 and "/" in f and all(len(part.split()) <= 3 for part in f.split("/")):
        return "vocabulary", "Mot ou unité lexicale courte avec plusieurs traductions ; sa classe exacte est distinguée de son autonomie."
    if len(t.split()) >= 5 and re.search(r"[.!]$", card["t"]):
        return "review", "Forme ponctuée comme une phrase mais prédication non reconnue ; ne pas la déclasser automatiquement en vocabulaire."
    if len(words) <= 4 and not re.search(r"[,;/]", f):
        return "vocabulary", "Entrée lexicale courte sans proposition ni acte de parole identifié : nom, adjectif, infinitif ou locution à apprendre à part."
    if re.match(r"^(?:le|la|les|l'|un |une |des |du |mon |ma |mes |ton |ta |tes |son |sa |ses |notre |votre |leur |ce |cet |cette |ces )", f) and not re.search(r"[,;]", f):
        return "vocabulary", "Groupe nominal ou désignation lexicale sans verbe fini identifié ; à distinguer des phrases thématiques."
    return "review", "Forme ou locution non décidée de façon fiable : vérifier son autonomie avant de la mettre parmi les phrases."


def lexical_class(language, card):
    """Do not confuse an adverbial use of a noun phrase with lexical POS."""
    t, f = normal(card["t"]), normal(card["frm"])
    if language == "en" and t == "sugar" and card["frm"].lower() == "sucre":
        return "other", "Nom de matière sugar / sucre, sans accent dans le sens source ; ne pas le confondre avec l'adjectif sucré après normalisation."
    if t in PREPOSITIONS[language] and f in PREPOSITION_MEANINGS:
        return "preposition", "Unité prépositive reconnue dans la langue étudiée et sens français prépositionnel concordant."
    if f in ADVERBIAL_UNITS[language].get(t, set()):
        return "adverb", "Locution adverbiale bornée vérifiée par une correspondance explicite entre la forme étudiée et le sens français."
    if t in {"next", "home", "gold", "silver", "orange", "right", "left", "only", "alone", "early", "late", "fast", "hard", "plastic", "before", "after", "solo", "sola", "presto", "prima", "dopo", "antes", "despues", "avant", "apres"}:
        return "uncertain", "Forme isolée pouvant avoir plusieurs classes ou sens ; aucun contexte n'autorise une classe exclusive."
    if re.match(r"^(?:to |non )?(?:avoir|etre|faire|savoir|mettre|prendre|aller|passer|flaner|tenir|assurer|sentir|renverser|valoir|pousser|attacher|avancer|tourner|se lancer|se retourner)\b", f):
        return "other", "Infinitif ou locution verbale, conservé au vocabulaire ; ce n'est ni un adjectif ni un adverbe."
    if (f in ADVERBS_FR and
            (t in ADVERBS_STUDY[language] or t.endswith(("ly", "mente")) and len(t.split()) <= 2)):
        return "adverb", "Adverbe lexical identifié dans le sens français et corroboré par la forme ou le lexique de la langue étudiée."
    pieces = [part.strip() for part in re.split(r"\s*/\s*", f)]
    adjective_words = []
    for piece in pieces:
        adjective_words.append(re.sub(r"^(?:tres|assez|plutot|trop|plus|moins|non|peu|pas) ", "", piece))
    if adjective_words and all(word in ADJECTIVES_FR for word in adjective_words):
        if re.match(r"^(?:a |an |the |un |una |uno |el |la |los |las |le |les |lo |il |i |gli |l')", t):
            return "uncertain", "Sens adjectival en français mais déterminant dans la forme étudiée : emploi substantivé ou sens nominal à vérifier."
        adjective_core = re.sub(r"^(?:too|very|quite|demasiado|muy|troppo|molto) ", "", t)
        if adjective_core in ADJECTIVES_STUDY[language]:
            return "adjective", "Sens adjectival isolé concordant et adjectif reconnu dans la langue étudiée, sans déterminant ni prédication finie."
        return "uncertain", "Sens français d'apparence adjectivale, mais forme étudiée non reconnue comme adjectif ; faux ami ou différence de classe possible."
    if f in {"la semaine derniere", "la semaine prochaine", "le mois dernier", "le mois prochain", "cette annee", "ce matin", "cet apres-midi", "le soir", "une fois par semaine", "dans cinq minutes", "a la derniere minute"}:
        return "other", "Groupe nominal ou prépositionnel de temps ; sa fonction temporelle ne suffit pas à en faire un adverbe lexical."
    if "/" in f and not re.match(r"^(?:a |an |the |un |una |uno |el |la |il |lo |l')", t):
        return "uncertain", "Plusieurs sens courts dans la glose ; vérifier la classe dans la langue étudiée avant de trancher."
    if f in ADVERBS_FR:
        return "uncertain", "Le sens français évoque un adverbe mais la classe de la forme étudiée n'est pas corroborée par la règle."
    return "other", "Entrée lexicale nominale, verbale ou mot-outil autre ; aucune preuve suffisante pour les trois classes spécialisées."


def load_decks(root):
    app = (root / "melunga_deploy/app.html").read_text()
    definition = [line for line in app.splitlines() if line.startswith("var DECKS = ")]
    assert len(definition) == 1
    return json.loads(definition[0].partition("=")[2].strip().removesuffix(";"))


def build(root):
    decks = load_decks(root)
    output = {}
    for language in LANGUAGES:
        assignments = []
        for index, card in enumerate(decks[language]):
            content_type, reason = classify(language, card)
            assignment = {"sourceIndex": index, "contentType": content_type, "reason": reason,
                          "reviewStatus": "rule-based-candidate"}
            if language == "en" and index == 3463:
                assert (card["t"], card["frm"]) == ("an X-ray", "une radio"), "Inspected X-ray exception changed"
                assignment.update({
                    "contentType": "vocabulary", "reviewStatus": "reviewed", "sourceTemplateException": True,
                    "reason": "Indice 3463 inspecté : an X-ray / une radio est un groupe nominal entier ; X appartient à X-ray et n'est pas un emplacement. Le marqueur source template est un faux positif, conservé intact.",
                })
            if assignment["contentType"] == "vocabulary":
                pos, pos_reason = lexical_class(language, card)
                assignment.update({"lexicalClass": pos, "lexicalClassReason": pos_reason,
                                   "lexicalClassReviewStatus": "rule-based-candidate"})
                if assignment.get("sourceTemplateException"):
                    assignment.update({"lexicalClass": "other", "lexicalClassReviewStatus": "reviewed",
                                       "lexicalClassReason": "Nom médical X-ray avec article an, et nom radio dans le sens français ; exception vérifiée sur cette carte précise."})
            assignments.append(assignment)
        output[f"fr-{language}.json"] = {
            "version": 1, "pair": f"fr-{language}", "studyLanguage": language,
            "sourceDeckSha256": hashlib.sha256(canonical(decks[language])).hexdigest(),
            "status": "candidate-requires-semantic-review", "assignments": assignments,
        }
    apply_semantic_review(root, decks, output)
    return output


def apply_semantic_review(root, decks, output):
    """Apply source-index editorial decisions, never reroute through keywords."""
    path = root / "docs/niveaux-progressifs/corrections-themes/latins.json"
    document = json.loads(path.read_text())
    assert document["version"] == 1 and document["reviewer"] == "Codex"
    allowed_families = {
        "vocab-restaurant", "vocab-maison", "vocab-voyage", "vocab-personnes", "vocab-reperes",
        "vocab-actions", "vocab-travail", "vocab-adjectifs", "vocab-prepositions", "vocab-adverbes",
        "vocab-couleurs", "vocab-nature", "vocab-loisirs",
    }
    allowed_domains = {"saluer", "comprendre", "ressentis", "repas", "deplacements", "reperes",
                       "quotidien", "decrire", "conversation", "travail"}
    seen = set()
    for language in LANGUAGES:
        assert document["sourceDecksSha256"][language] == hashlib.sha256(canonical(decks[language])).hexdigest()
    for decision in document["reviewedAssignments"]:
        pair, index = decision["pair"], decision["sourceIndex"]
        language = pair[3:]
        key = (pair, index)
        assert key not in seen and language in LANGUAGES
        seen.add(key)
        card = decks[language][index]
        assert (card["t"], card["frm"]) == (decision["expectedStudy"], decision["expectedNative"])
        assert decision["sourceSha256"] == hashlib.sha256(canonical(card)).hexdigest()
        assert decision["reviewStatus"] == "reviewed" and decision["reason"]
        assignment = output[pair + ".json"]["assignments"][index]
        if decision["contentType"] != "vocabulary":
            for field in ("lexicalClass", "lexicalClassReason", "lexicalClassReviewStatus",
                          "lexicalFamilyOverride", "lexicalFamilyOverrideReason"):
                assignment.pop(field, None)
        for field in ("contentType", "reason", "reviewStatus", "lexicalClass", "lexicalClassReason",
                      "lexicalClassReviewStatus", "lexicalFamilyOverride", "lexicalFamilyOverrideReason",
                      "situationDomainOverride", "situationDomainOverrideReason", "lexicalUsage"):
            if field in decision:
                assignment[field] = decision[field]
        if "lexicalFamilyOverride" in assignment:
            assert assignment["contentType"] == "vocabulary"
            assert assignment["lexicalFamilyOverride"] in allowed_families and assignment["lexicalFamilyOverrideReason"]
            priority = {"adjective": "vocab-adjectifs", "preposition": "vocab-prepositions",
                        "adverb": "vocab-adverbes", "color": "vocab-couleurs"}.get(assignment["lexicalClass"])
            assert not priority or assignment["lexicalFamilyOverride"] == priority
        if "situationDomainOverride" in assignment:
            assert assignment["contentType"] == "utterance"
            assert assignment["situationDomainOverride"] in allowed_domains and assignment["situationDomainOverrideReason"]


def readme(output):
    total_types = Counter(a["contentType"] for data in output.values() for a in data["assignments"])
    total_pos = Counter(a["lexicalClass"] for data in output.values() for a in data["assignments"] if a["contentType"] == "vocabulary")
    lines = [
        "# Typage candidat — anglais, espagnol, italien", "",
        "Ces trois fichiers séparent les énoncés, le vocabulaire, les nombres, les modèles incomplets et les réserves avant leur affichage par thème. Ce n’est pas une relecture linguistique exhaustive : les règles sont des hypothèses éditoriales à vérifier.", "",
        "Aucune carte, phonétique, traduction, lecture, décision parmi les 518 placements ni niveau source n’est modifié. Chaque carte reste identifiée par son indice dans son DECKS. L’empreinte de chaque deck utilise JSON trié, sans échappement ASCII, et séparateurs compacts.", "",
        "## Couverture", "",
        "| Couple | Énoncés | Vocabulaire | Nombres seuls | Incomplets | À relire | Total |",
        "|---|---:|---:|---:|---:|---:|---:|",
    ]
    for data in output.values():
        counts = Counter(a["contentType"] for a in data["assignments"])
        lines.append("| " + data["pair"] + " | " + " | ".join(str(counts[key]) for key in ("utterance", "vocabulary", "number", "incomplete", "review")) + f" | {len(data['assignments'])} |")
    lines += [
        "", "Chaque indice est affecté exactement une fois. Aucun libellé ancien cat=vocab ou pedagogicalStatus=fragment ne suffit à décider du type.", "",
        "## Règles appliquées", "",
        "1. Un emplacement ou des pointillés dans la forme étudiée donnent incomplete. Un nom contenant la lettre X ne devient pas un modèle à trous : voir l’exception X-ray ci-dessous.",
        "2. Un nombre doit être reconnu à la fois dans la forme étudiée et son sens français. « où » n’est pas un nombre après désaccentuation ; « une seconde » dans une demande d’attendre ne suffit pas à faire un ordinal.",
        "3. Bonjour, oui, merci, les salutations et les formules de politesse restent des énoncés autonomes. Une question identifiée, un impératif ou une proposition avec prédication finie reste une phrase même sous une ancienne étiquette vocab/fragment.",
        "4. Les prépositions et locutions prépositives bornées sont des unités de vocabulaire. Une comparaison ouverte, une subordonnée seule ou « un sac de » sans objet reste incomplete ; les pointillés ne sont jamais complétés.",
        "5. Les noms, adjectifs et infinitifs isolés sont du vocabulaire. Les expressions que les règles ne peuvent décider de façon fiable restent review. La ponctuation seule ne prouve pas qu’il s’agit d’une phrase.",
        "", "Les comparaisons de forme utilisent une normalisation temporaire ; aucun texte normalisé n’est écrit dans le catalogue ou dans les cartes. Les règles de sens figurent dans classify_latins.py et peuvent être contredites par la revue sémantique.", "",
        "## Classes lexicales candidates", "",
        "| Couple | Adjectifs | Couleurs | Prépositions | Adverbes | Autres mots | Classe incertaine |",
        "|---|---:|---:|---:|---:|---:|---:|",
    ]
    for data in output.values():
        counts = Counter(a["lexicalClass"] for a in data["assignments"] if a["contentType"] == "vocabulary")
        lines.append("| " + data["pair"] + " | " + " | ".join(str(counts[key]) for key in ("adjective", "color", "preposition", "adverb", "other", "uncertain")) + " |")
    lines += [
        "", "Les classes sont renseignées uniquement sur vocabulary, avec une raison et un statut propres. Le sens français est croisé avec la forme étudiée : lexiques de prépositions, locutions adverbiales bilingues, formes et sens adjectivaux isolés. Un adjectif attribut reste dans sa phrase ; il n’est pas extrait.",
        "", "Les noms et infinitifs vont dans other. « La semaine dernière », « cet après-midi » ou « dans cinq minutes » ne deviennent pas automatiquement des adverbes. Les formes à plusieurs classes/sens, comme next ou gold, peuvent rester uncertain. Ces listes ne prétendent pas constituer une analyse morphosyntaxique complète.",
        "", "La règle spécialisée de classe lexicale doit avoir priorité sur les familles maison/restaurant/etc. Une carte ne doit avoir qu’un emplacement principal : ces annotations ne demandent aucune duplication. Les couleurs ont leur classe color distincte, après lecture des formes et de leur série source ; une fleur rose ou un fruit orange n’est pas ajouté par simple correspondance de mots.",
        "", "La passe éditoriale par indices de corrections-themes/latins.json remplace les décisions heuristiques sur les cartes relues : type, classe et destination sont motivés séparément. Les overrides reviewed ont priorité sur les mots-clés de routage. Codex assume cette revue de sens et de progression ; Claude intervient uniquement pour la phonétique.",
        "", "## Exemples contrôlés et limites", "",
        "- en[3082] « In any case, I loved it. », es[3585] « Te extraño. », it[2838] « Lo prendo. » restent des énoncés malgré cat=vocab.",
        "- en[3436] « the password », en[4228] « wood » et it[3531] « un appuntamento » restent du vocabulaire : ni passe/bois ni rendez-vous ne prouvent une conjugaison ou une inversion.",
        "- en[3463] « an X-ray » / « une radio » est la seule exception sourceTemplateException=true : le X de X-ray appartient au nom entier. Cette carte précise est reviewed ; son ancien marqueur template reste intact dans la source. La classe other est également vérifiée pour cette exception.",
        "- Les repères interrogatifs isolés where/dove sans point d’interrogation restent lexicaux ; une question autonome complète garde le type utterance.",
        "", f"**{total_types['review']} cartes** restent à relire pour leur autonomie et **{total_pos['uncertain']} mots** pour leur classe lexicale. Les cartes hors passe éditoriale restent rule-based-candidate ; reviewed signifie une décision de sens de Codex, pas une relecture native ou une validation phonétique.",
        "", "Aucune préposition espagnole isolée n’a été reconnue par les règles actuelles. Cela signale un besoin d’examen/enrichissement, pas la preuve que toute la langue ou tout le catalogue en manque. Les faibles stocks d’adjectifs/adverbes isolés espagnols doivent aussi être examinés avant d’inventer des contenus. Aucune phrase ni phonétique n’est découpée pour remplir ces catégories.",
        "", "Les règles peuvent encore manquer des verbes, des ellipses conversationnelles ou des idiomes. Les cas review restent explicites ; les classer ne démontre ni la progressivité globale des niveaux ni l’acquisition. Les phonétiques existantes restent intégrales et inchangées. Claude vérifie seulement les nouvelles aides du lot éditorial distinct.",
        "", "## Reproduction", "",
        "    python3 -B tools/maquette-guidee/classify_latins.py",
        "    python3 -B tools/maquette-guidee/classify_latins.py --check --self-test", "",
        "Le contrôle vérifie couverture totale, unicité des indices, types autorisés, classes lexicales seulement sur vocabulary, empreintes des sources et reproduit ces fichiers. Les vérifications ciblées utilisent les cartes réelles ; aucun modèle de génération de niveaux n’est importé.", "",
    ]
    return "\n".join(lines)


def self_test(root, output):
    decks = load_decks(root)
    checks = [
        ("en", "No.", "utterance", None), ("en", "Hello.", "utterance", None),
        ("en", "one", "number", None), ("en", "where", "vocabulary", "adverb"),
        ("en", "wood", "vocabulary", "other"), ("en", "the password", "vocabulary", "other"),
        ("en", "under", "vocabulary", "preposition"), ("en", "red", "vocabulary", "color"),
        ("en", "from time to time", "vocabulary", "adverb"),
        ("es", "Te extraño.", "utterance", None), ("es", "veinte", "number", None),
        ("it", "Lo prendo.", "utterance", None), ("it", "sotto", "vocabulary", "preposition"),
        ("it", "blu", "vocabulary", "color"), ("it", "dove", "vocabulary", "adverb"),
        ("it", "un appuntamento", "vocabulary", "other"),
        ("it", "quest'anno", "vocabulary", "other"),
        ("it", "Non avere voglia di fare niente.", "vocabulary", "other"),
    ]
    performed = 0
    for language, text, expected_type, expected_pos in checks:
        indices = [i for i, card in enumerate(decks[language]) if card["t"] == text]
        assert indices, f"Missing targeted source fixture: {language}:{text}"
        # Target the identified record, not every homograph with another gloss.
        # For example sotto / sous and sotto / en dessous need not have one POS.
        for index in indices[:1]:
            assignment = output[f"fr-{language}.json"]["assignments"][index]
            assert assignment["contentType"] == expected_type, (language, index, assignment)
            if expected_pos:
                assert assignment["lexicalClass"] == expected_pos, (language, index, assignment)
            performed += 1
    exception = output["fr-en.json"]["assignments"][3463]
    assert exception["sourceTemplateException"] is True and exception["reviewStatus"] == "reviewed"
    assert exception["lexicalClass"] == "other" and exception["lexicalClassReviewStatus"] == "reviewed"
    editorial_cases = [
        ("fr-es", 1668, "utterance", "situationDomainOverride", "saluer"),
        ("fr-es", 4190, "vocabulary", "lexicalFamilyOverride", "vocab-actions"),
        ("fr-es", 94, "utterance", "situationDomainOverride", "ressentis"),
        ("fr-es", 3995, "utterance", "situationDomainOverride", "decrire"),
        ("fr-en", 4089, "vocabulary", "lexicalFamilyOverride", "vocab-loisirs"),
        ("fr-en", 4076, "vocabulary", "lexicalFamilyOverride", "vocab-restaurant"),
        ("fr-it", 3433, "vocabulary", "lexicalFamilyOverride", "vocab-loisirs"),
        ("fr-it", 3429, "vocabulary", "lexicalFamilyOverride", "vocab-restaurant"),
        ("fr-en", 3903, "vocabulary", "lexicalClass", "color"),
        ("fr-es", 4553, "vocabulary", "lexicalClass", "color"),
        ("fr-it", 3134, "vocabulary", "lexicalClass", "color"),
        ("fr-en", 3312, "number", "reviewStatus", "reviewed"),
        ("fr-it", 3052, "number", "reviewStatus", "reviewed"),
        ("fr-it", 4066, "number", "reviewStatus", "reviewed"),
        ("fr-it", 4265, "number", "reviewStatus", "reviewed"),
    ]
    # Whole nouns selected as extension supports retain a reviewed semantic
    # family; adding a support must never silently reroute its canonical word.
    editorial_cases.extend(
        ("fr-en", index, "vocabulary", "lexicalFamilyOverride", family)
        for index, family in (
            (4317, "vocab-travail"), (4315, "vocab-travail"),
            (3436, "vocab-travail"), (3225, "vocab-travail"),
            (3069, "vocab-travail"), (4332, "vocab-travail"),
            (3938, "vocab-voyage"), (3589, "vocab-maison"),
            (3943, "vocab-maison"), (4390, "vocab-loisirs"),
            (4388, "vocab-loisirs"),
            (3779, "vocab-adverbes"), (3231, "vocab-reperes"),
            (3558, "vocab-travail"), (3553, "vocab-personnes"),
        )
    )
    for pair, index, content_type, field, expected in editorial_cases:
        assignment = output[pair + ".json"]["assignments"][index]
        assert assignment["contentType"] == content_type and assignment[field] == expected, (pair, index, assignment)
        assert assignment["reviewStatus"] == "reviewed"
    for pair, index in (("fr-en", 3038), ("fr-it", 2632)):
        assert output[pair + ".json"]["assignments"][index]["contentType"] != "number"
    print(json.dumps({"targetedRealSourceChecks": performed + 3 + len(editorial_cases), "errors": 0}))


def semantic_review_markdown(root, output):
    document = json.loads((root / "docs/niveaux-progressifs/corrections-themes/latins.json").read_text())
    rows = document["reviewedAssignments"]
    transitions = Counter((row["before"]["contentType"], row["contentType"]) for row in rows)
    by_pair = Counter(row["pair"] for row in rows)
    lines = [
        "# Corrections de sens et de type — anglais, espagnol, italien", "",
        "Cette passe répond aux intrus et rubriques faibles signalés sur l’aperçu. Codex assume les décisions de sens, de type et de fonction communicative ; Claude vérifie uniquement les phonétiques du lot nouveau. Les textes, traductions, aides et niveaux du catalogue restent inchangés.", "",
        "## Périmètre effectivement lu", "",
        f"- {document['coverage']['initialWeakAndSpanishVocabularyCards']} cartes uniques : toutes les cartes des rubriques actives de moins de six entrées et les 540 entrées initialement classées vocabulaire en espagnol.",
        f"- {document['coverage']['figurativeRiskSituationCandidates']} situations Voyage/Repas à risque figuratif ont été lues, dont les cartes contenant arriver/aller, train, pied, eau/œufs, accord, etc.",
        f"- {document['coverage']['uniqueCardsInInitialAudit']} cartes distinctes dans cette union ; {len(rows)} décisions individuelles avec les couleurs et quelques activités contrôlées en complément.",
        "", "| Couple | Cartes avec décision individuelle |", "|---|---:|",
    ]
    for pair in ("fr-en", "fr-es", "fr-it"):
        lines.append(f"| {pair} | {by_pair[pair]} |")
    lines += [
        "", "Le JSON conserve chaque indice de couverture, sa forme étudiée et son sens, puis les décisions par indice avec empreinte de carte entière et état antérieur. Aucun simple seuil de longueur ne valide une phrase, aucun mot-clé ne suffit à choisir la nouvelle destination.", "",
        "## Changements concrets", "",
        f"- {transitions[('vocabulary', 'utterance')]} tours entiers sortent du vocabulaire pour rejoindre une situation adaptée.",
        f"- {transitions[('vocabulary', 'number')]} quantités numériques isolées (la moitié, le double) rejoignent les nombres.",
        f"- {transitions[('utterance', 'incomplete')]} concession sans principale reste une forme incomplète réelle ; aucune réserve n’est utilisée simplement pour masquer une mauvaise rubrique.",
        "- Saludos a tu familia. : salutation entière → Saluer, et non Corps/personnes.",
        "- Salirse con la suya. : infinitif idiomatique « arriver à ses fins » → vocabulaire Actions, jamais Voyage.",
        "- Je n’y arrive pas, au train où vont les choses, partir du mauvais pied, mettre tous ses œufs dans le même panier : le sens figuré et la fonction du tour décident de la situation, sans trajet ou repas fictif.",
        "- fishing / la pêche et la pesca (attività) vont dans Loisirs ; a peach / una pesca fruit ne sont pas promus en activité par leur homographie.",
        "- Pièce jointe, permis de conduire, robinet d’eau chaude et porte d’embarquement ont des destinations distinguées d’après l’objet réel, et non pièce, conduire, eau ou porte isolément.",
        "", "Les autres décisions de la liste peuvent conserver un type correct tout en corrigeant la famille, ou confirmer la destination littérale après examen. Reviewed signifie une décision éditoriale individuelle, pas une validation native ou phonétique.", "",
        "## Couleurs et adjectifs demandés", "",
        "Les 16 cartes EN, 15 ES et 15 IT de couleur sont relues dans leur série source et reçoivent color, distinct de adjective. Rose/orange y sont des teintes ; or/argent sont les teintes métalliques dans cette série. Une fleur, un fruit ou l’argent monétaire ailleurs n’est pas déduit de ce classement.",
        "", "| Couple | Concept | Sources isolées existantes |", "|---|---|---|",
    ]
    for record in document["requestedAdjectiveAvailability"]:
        entries = "; ".join(f"{entry['sourceIndex']} L{entry['sourceLevel']} : {entry['study']} — {entry['native']}" for entry in record["existingIsolatedEntries"]) or "Absent après recherche des formes et du sens"
        lines.append(f"| {record['pair']} | {record['concept']} | {entries} |")
    lines += [
        "", "Ces entrées sont reprises entières avec leurs aides originales. Les féminins non présents ne sont pas inventés à partir d’un masculin. Le lot rédigé distinct complète les absences après contrôle ; sa phonétique entière est à vérifier par Claude.",
        "", "La palette commune manque de violet isolé dans les trois catalogues. Les couleurs EN/IT existantes sont réparties L2–L5 ; les mettre toutes dans une palette pédagogique L1 demanderait une décision de placement explicite distincte, sans changer lv. Aucun des 518 placements existants n’est modifié ici.",
        "", "Le master nouveau a aussi été recherché par forme étudiée exacte et par sens français. Seul light existait avec un autre sens (lumière/lampe, indice3936) ; l’adjectif léger/légère constitue donc un sens entier nouveau, pas un doublon ou une aide extraite. lightweight, indice3818, reste disponible séparément.",
        "", "## Trace des corrections de type, classe et destination", "",
        "| Couple / indice | Forme étudiée | Avant | Décision |", "|---|---|---|---|",
    ]
    for row in rows:
        before = row["before"]
        destination = row.get("situationDomainOverride", row.get("lexicalFamilyOverride", before.get("domain")))
        changed = (before["contentType"] != row["contentType"]
                   or before.get("lexicalClass") != row.get("lexicalClass")
                   or destination != before.get("domain"))
        if not changed:
            continue
        previous = before["contentType"] + "/" + str(before.get("domain"))
        after = row["contentType"] + "/" + str(destination)
        if row.get("lexicalClass"):
            after += " (" + row["lexicalClass"] + ")"
        text = row["expectedStudy"].replace("|", "\\|")
        lines.append(f"| {row['pair']} / {row['sourceIndex']} | {text} | {previous} | {after} |")
    lines += [
        "", "Les motifs complets sont conservés dans latins.json ; cette table résume les cartes dont le type, la classe ou une destination contrôlée changent.", "",
        "## Limites et vérifications", "",
        "La liste est une revue ciblée de contenu, pas la preuve que les 13 683 cartes latines ni toute la progression L1–L10 sont validées. Les rubriques encore légères demandent du contenu entier pertinent ; leur simple regroupement ou leur renommage ne crée aucun apprentissage nouveau. Les classiques restent intacts et les droits ne sont pas recalculés sur les nouveaux niveaux éditoriaux.", "",
        "    python3 -B tools/maquette-guidee/classify_latins.py --check --self-test", "",
        "La génération contrôle les empreintes des trois decks, l’unicité des indices, les formes exactes des décisions et la cohérence type/POS/override. Elle échoue si une source change. Aucun fichier produit, niveau source, prix ou abonnement n’est écrit par cet outil.", "",
    ]
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=ROOT)
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    root = args.root.resolve()
    folder = root / DESTINATION
    output = build(root)
    if not args.check:
        folder.mkdir(parents=True, exist_ok=True)
    for filename, data in output.items():
        assignments = data["assignments"]
        assert [a["sourceIndex"] for a in assignments] == list(range(len(assignments)))
        assert all(a["contentType"] in {"utterance", "vocabulary", "number", "incomplete", "review"} for a in assignments)
        assert all(("lexicalClass" in a) == (a["contentType"] == "vocabulary") for a in assignments)
        assert all(a.get("lexicalClass") in {None, "adjective", "color", "preposition", "adverb", "other", "uncertain"} for a in assignments)
        content = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
        path = folder / filename
        if args.check:
            assert path.read_text() == content, f"Stale classification: {filename}"
        else:
            path.write_text(content)
        print(json.dumps({"pair": data["pair"], "total": len(data["assignments"]),
                          "types": dict(Counter(a["contentType"] for a in data["assignments"])),
                          "lexicalClasses": dict(Counter(a["lexicalClass"] for a in data["assignments"] if a["contentType"] == "vocabulary"))}))
    documentation = readme(output)
    documentation_path = folder / "README-latins.md"
    if args.check:
        assert documentation_path.read_text() == documentation, "Stale Latin types documentation"
    else:
        documentation_path.write_text(documentation)
    review_path = root / "docs/niveaux-progressifs/corrections-themes/latins.md"
    review_documentation = semantic_review_markdown(root, output)
    if args.check:
        assert review_path.read_text() == review_documentation, "Stale Latin semantic review"
    else:
        review_path.write_text(review_documentation)
    if args.self_test:
        self_test(root, output)


if __name__ == "__main__":
    main()
