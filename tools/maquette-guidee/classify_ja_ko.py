#!/usr/bin/env python3
"""Candidate content types, without editing any catalogue text or phonetics.

Semantic ambiguity is retained as ``review``. Source cat/status are diagnostic
metadata, never sufficient alone to label a card. Run from any directory.
"""
from __future__ import annotations

import collections
import hashlib
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "docs/niveaux-progressifs/types-contenu"


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()


def decks():
    line = next(line for line in (ROOT / "melunga_deploy/app.html").read_text().splitlines()
                if line.startswith("var DECKS = "))
    return json.loads(line.split("=", 1)[1].strip().rstrip(";"))


NUMBER_WORDS = set("zéro zero un une deux trois quatre cinq six sept huit neuf dix onze douze treize quatorze quinze seize vingt trente quarante cinquante soixante cent cents mille million millions milliard milliards et premier première premiers premières deuxième second seconde troisième quatrième cinquième sixième septième huitième neuvième dixième onzième douzième treizième quatorzième quinzième seizième vingtième trentième quarantième cinquantième soixantième centième millième".split())
SUBJECT = re.compile(r"^(?:je\b|j['’]|tu\b|il\b|elle\b|on\b|nous\b|vous\b|ils\b|elles\b|ce\b|c['’]|ça\b|cela\b|ceci\b|voici\b|voilà\b|quel(?:le|les|s)?\b|qu['’]|que\b|comment\b|où\b|qui\b|quand\b|pourquoi\b|combien\b|est-ce\b|(?:avez|êtes|pouvez|voulez|savez|faites|auriez|seriez|pourriez)-vous\b)", re.I)
LEXICAL_FRENCH = re.compile(r"^(?:un|une|le|la|les|l['’]|des|du|de la|de l['’]|mon|ma|mes|ton|ta|tes|son|sa|ses|notre|nos|votre|vos|leur|leurs|au|aux|à la|à l['’]|en|dans|sur|sous|chez|avec|sans|pour|par|avant|après|depuis|pendant)\b", re.I)
FRENCH_FORMULAS = {
    "oui", "non", "merci", "merci beaucoup", "bonjour", "bonsoir", "salut", "au revoir", "à bientôt",
    "bonne nuit", "bonne journée", "bon voyage", "bon appétit", "bienvenue", "pardon", "excusez-moi",
    "désolé", "désolé(e)", "d'accord", "d’accord", "s'il vous plaît", "s’il vous plaît", "s'il te plaît",
    "s’il te plaît", "avec plaisir", "avec grand plaisir", "volontiers", "bien sûr", "bien sûr que non",
    "absolument", "parfait", "tant mieux", "tant pis", "félicitations", "bravo", "santé", "allô",
    "allons-y", "on y va", "à vos souhaits", "bon courage", "pas de problème", "pas de souci",
    "de rien", "je vous en prie", "tout va bien", "ça marche", "ça va", "c'est ça", "c’est ça",
    "sérieux", "vraiment", "pourquoi pas", "bien joué", "attention", "au secours", "à l'aide", "à l’aide",
    "bonne chance", "courage", "enchanté", "dommage", "incroyable", "peu importe", "à demain",
    "bon rétablissement", "bon travail", "à la semaine prochaine", "à la prochaine", "bon", "pas du tout",
    "à tout à l'heure", "à tout à l’heure", "oh là là", "bonne année", "bonne soirée", "bon week-end",
    "bonnes vacances", "joyeux anniversaire", "joyeux noël", "allez", "bonne route", "génial", "mince",
    "zut", "à la vôtre", "waouh", "meilleurs vœux", "bien cordialement", "trop bien", "pas possible",
    "doucement", "moins vite", "bien vu", "t'inquiète", "t’inquiète", "tiens", "n'importe quoi", "n’importe quoi",
}
JA_POLITE = re.compile(r"(?:です|でした|でしょう|ます|ました|ません|ください|ましょう)(?:か|ね|よ|よね|かね)?[。！？?!.]*$")
JA_COMMAND = re.compile(r"(?:て|で|なさい|てね|でね|てよ|でよ)[。！？?!.]+$")
FRENCH_IMPERATIVE = re.compile(r"(?:^|[,;]\s*)(?:dépêche|attends|vas|éteins|oublie|allume|tiens|continue|fais|viens|prends|ne\b|n['’]|regarde|envoie|explique|apporte|amuse|va[ -]|ouvre|rappelle|dis[ -]|ferme|lave|donne|pousse|laisse|souris|monte|ajoute|baisse|prenez|regardez|allez|sois|soyez|choisis|demande|redémarre|accélère|régale|profite|lève|crois|lâche|traverse|sors|tourne|parle|appuie|montre|lance|passe|surveille|clique|mets|souffle|ralentis|télécharge|serre|scanne|embrasse|couvre|range|frappe|coupe|branche|écris|place)", re.I)
KO_POLITE = re.compile(r"(?:요|니다|세요|십시오|죠)[。！？?!.]*$")
KO_NOUN_YO = {"필요", "중요", "담요", "소요", "가요", "동요", "민요", "풍요"}
MARKER = re.compile(r"(?:\{[^}]*\}|…|\.\.\.|〜|～|~|_{2,}|[□〇]{2,})")
TERMINAL = re.compile(r"[。！？?!.]$")

# These decisions are individually read, not inferred from cat/status. They
# concern the card's actual sense, not all occurrences of the same study text.
OVERRIDES = {
    "ja": {
        **{i: ("utterance", "Formule entière de réponse, salutation ou politesse ; une réplique n’exige pas sujet et verbe explicites.") for i in range(10)},
        15: ("utterance", "お願い。 signifie ici « S’il te plaît » : demande lexicalisée entière, distincte de la carte nominale « la demande »."),
        2985: ("utterance", "ええと… est une hésitation conventionnelle complète dans l’échange ; les points indiquent l’intonation, pas un emplacement à remplir."),
        3001: ("utterance", "Deux propositions complètes malgré cat:vocab et pedagogicalStatus:fragment ; ne pas assimiler le marquage source à une analyse syntaxique."),
        3004: ("vocabulary", "お願い signifie ici le nom « la demande » ; le sens de cette carte est lexical, distinct de la réplique « S’il te plaît »."),
        3062: ("vocabulary", "大きい est présenté comme le mot « grand » ; sa possibilité d’emploi prédicatif dans un autre contexte ne transforme pas cette carte lexicale en réplique située."),
        3063: ("vocabulary", "小さい est présenté comme le mot « petit », sans contexte de réplique ; conserver sa fonction lexicale."),
        3201: ("utterance", "マジで？ est une vraie question de réaction (« Sérieux ? »), malgré son étiquette vocab."),
    },
    "ko": {
        **{i: ("utterance", "Formule entière de réponse, salutation, instruction ou politesse ; conserver les répliques brèves autonomes.") for i in range(9)},
        2138: ("utterance", "글쎄요… est une réponse d’hésitation lexicalisée ; les points ne sont pas un trou de substitution."),
        2154: ("utterance", "Deux propositions complètes malgré cat:vocab et pedagogicalStatus:fragment ; ce n’est pas un mot isolé."),
        2213: ("vocabulary", "큰 est la forme adjectivale adnominale de « grand » ; brique lexicale à rattacher à un nom, jamais une phrase autonome."),
        2214: ("vocabulary", "작은 est la forme adjectivale adnominale de « petit » ; la carte fournit une brique lexicale, pas une réplique complète."),
        2352: ("utterance", "진짜예요? est une question de réaction entière (« Sérieux ? »), malgré son étiquette vocab."),
    },
}

# These two parallel lexical lists were read in full (study and French sense).
# Their source core tag is misleading: adjectives, places, kinship terms,
# question words and adverbs are presented as words, not as situated replies.
for language, begin, end in (("ja", 3062, 3196), ("ko", 2213, 2347)):
    for source_index in range(begin, end + 1):
        OVERRIDES[language].setdefault(source_index, ("lexical-list", "Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située."))
OVERRIDES["ko"][2262] = ("incomplete", "부터 est ici la particule liée « depuis » ; il manque le complément auquel elle s’attache.")
OVERRIDES["ko"].update({
    139: ("vocabulary", "오늘 아침 est le repère lexical « ce matin », sans phrase source qui l’emploie."),
    173: ("vocabulary", "오늘 오후 est le repère lexical « cet après-midi », pas une assertion complète."),
    258: ("vocabulary", "여기저기 est l’adverbe « ici et là » dans son sens lexical."),
    274: ("vocabulary", "다시 말하면 est présenté comme le connecteur « c’est-à-dire » ; le lot n’invente pas la proposition qu’il pourrait introduire."),
    275: ("vocabulary", "올해 est le repère lexical « cette année »."),
    287: ("incomplete", "Le sens « trop de » attend ce qui est quantifié ; la carte ne constitue pas à elle seule une phrase de quantité."),
    325: ("utterance", "어머나! est une interjection entière (« Oh là là ! »), pas un nom de vocabulaire."),
    369: ("vocabulary", "조만간 est une locution temporelle dans son sens lexical, sans assertion source."),
    384: ("vocabulary", "아침 일찍 est le groupe adverbial « tôt le matin »."),
    409: ("utterance", "메리 크리스마스! est le souhait entier « Joyeux Noël ! »."),
    474: ("vocabulary", "우리 가족 모두 est le groupe nominal « toute ma famille », pas une assertion de présentation."),
    503: ("vocabulary", "점점 더 est le groupe adverbial « de plus en plus », sans assertion source."),
    1291: ("vocabulary", "문에서 문까지 est une locution de trajet (« porte à porte »), pas une phrase source autonome."),
    1317: ("incomplete", "만큼 est un terme de comparaison lié à une référence ; le sens « autant que » ne fournit pas les termes comparés."),
    1827: ("incomplete", "하자마자 est ici le cadre temporel « dès que » ; le contenu de l’enchaînement n’est pas donné."),
    1937: ("vocabulary", "가능한 한 빨리 est le groupe adverbial « dès que possible », sans assertion source."),
    2131: ("vocabulary", "오늘 저녁 est le repère lexical « ce soir »."),
    2168: ("utterance", "대박! est une réaction entière (« Génial ! »)."),
    2212: ("vocabulary", "인터넷 nomme Internet ; ce n’est pas une assertion complète."),
    3797: ("incomplete", "La reprise « Comme indiqué dans mon précédent message » annonce un contenu ; aucun contenu n’est fourni dans cette carte."),
    3898: ("vocabulary", "배송비 포함 est le groupe nominal commercial « frais de port inclus », sans réplique source située."),
    3918: ("vocabulary", "온수 수도꼭지. nomme « le robinet d’eau chaude » ; le point final ne transforme pas ce nom en phrase."),
    3921: ("vocabulary", "발송 전 잔금. est le groupe nominal « le solde avant expédition », malgré son point final."),
    3954: ("vocabulary", "폭설 nomme de fortes chutes de neige, sans assertion source."),
    4447: ("vocabulary", "예의와 노하우. coordonne deux notions lexicales ; le point final ne fournit pas de prédication."),
    4460: ("vocabulary", "귀찮아하다. est présenté dans son sens de dictionnaire (« avoir la flemme »), pas comme une réplique conjuguée.")
})
for source_index, rationale in {
    2408: "오래전에 est le repère lexical « il y a longtemps », sans assertion source.",
    3569: "첫눈에 반하다. est l’expression donnée au dictionnaire « avoir le coup de foudre » ; la forme en 다 ne désigne pas ici une prise de parole située.",
    3620: "미용실에서. est le groupe locatif « chez le coiffeur » ; le point final ne fournit pas d’assertion.",
    3706: "몇 개 fournit l’expression de quantité « quelques-uns », pas une phrase qui emploie cette quantité.",
    3728: "자유, 평등, 박애. est une coordination de notions (« liberté, égalité, fraternité »), conservée dans le lexique culturel.",
    3754: "물방울무늬의 est le qualificatif de motif « à pois », lié au nom qu’il peut décrire.",
    3789: "요즘 est le repère lexical « ces jours-ci ».",
    3927: "면세 est le terme commercial « hors taxes », sans phrase source.",
    4153: "그동안에 est la locution adverbiale « entre-temps ».",
    4211: "지금까지 est le repère lexical « jusqu’à présent ».",
    4219: "채식주의자 est le nom « végétarien », sans phrase de présentation source.",
    4223: "체크무늬의 est le qualificatif de motif « à carreaux », lié au nom qu’il peut décrire.",
    4328: "방수 nomme la propriété « imperméable », sans assertion source.",
    4344: "협상 가능 est le qualificatif commercial « négociable », sans réplique source située.",
    4357: "레어로 est l’indication de cuisson « saignant » ; la carte fournit le groupe lexical, sans en inventer une demande complète.",
    4373: "셀카. nomme « un selfie » ; son point final ne suffit pas à en faire une assertion.",
    4499: "냉동 nomme la propriété « surgelé », sans phrase source."
}.items():
    OVERRIDES["ko"][source_index] = ("vocabulary", rationale)
OVERRIDES["ko"][4282] = ("incomplete", "까지 est ici la particule liée « jusqu’à » ; il manque le repère auquel elle s’attache.")

# Plain Japanese commands, proverbs and short formulas need an explicit pass:
# polite-final detection alone would wrongly leave them all unresolved.
for source_index in [48, 323, 362, 397, 475, 512, 534, 568, 783, 816, 819, 1623, 1708, 1746,
                     1833, 1876, 2102, 2201, 2271, 2272, 2274, 2279, 2280, 2296, 2298, 2299,
                     2350, 2369, 2392, 2393, 2394, 2395, 2396, 2515, 2516, 2567, 2573, 2625,
                     2637, 2638, 2644, 2646, 2674, 2858, 2911, 2924, 2953, 2954, 2955, 2956,
                     2963, 2968, 2983, 2997, 3006, 3008, 3202, 3207, 3218, 3267, 3354, 3563,
                     3569, 3575, 3774, 3813, 3817, 4064, 4092, 4159, 4180, 4183, 4195, 4240,
                     4242, 4311, 4502, 4508]:
    OVERRIDES["ja"][source_index] = ("utterance", "Forme et sens inspectés ensemble : réplique entière (instruction, assertion, formule ou proverbe), sans élément à remplir. Les échanges à deux voix restent copiés en bloc, pas scindés ici.")
for source_index in [210, 334, 339, 350, 452, 459, 529, 531, 690, 926, 1307, 1377, 2067,
                     2528, 2931, 2933, 2934, 2935, 2937, 2939, 2940, 2941, 2950, 2957, 2964,
                     2967, 2973, 2975, 2977, 2978, 3005, 3013, 3018, 3023, 3033, 3039, 3040,
                     3061, 3211, 3252, 3254, 3259, 3266, 3339, 3347, 3379, 3385, 3561, 3562,
                     3564, 3805, 4220, 4235, 4402, 4468]:
    OVERRIDES["ja"][source_index] = ("vocabulary", "Entrée inspectée : mot ou locution donné pour son sens lexical (nom, repère, adverbe ou expression citée), sans contexte source qui en fasse une prise de parole. La ponctuation éventuelle ne suffit pas.")
for source_index in [357, 1639, 1640, 1641, 1642, 1903, 1910, 2215, 2530, 2831, 2851, 3779]:
    OVERRIDES["ja"][source_index] = ("incomplete", "Cadre ou préface inspecté : condition, quantité ou reprise qui attend son contenu principal ; celui-ci ne figure pas dans la carte. Ne pas inventer une suite ni une phonétique.")
OVERRIDES["ja"][2505] = ("utterance", "お返事をお待ちしております。 est une formule japonaise entière ; les points dans sa traduction française n’ouvrent aucun trou dans le texte appris.")
OVERRIDES["ja"][4143] = ("utterance", "契約条件は以下の通りです。 contient la prédication entière « les conditions sont les suivantes » ; la liste qu’elle peut annoncer n’est pas un trou grammatical de la carte.")
OVERRIDES["ko"][452] = ("utterance", "이거 어떻게 말해요? demande « comment dit-on ceci ? » avec 이거 déjà présent ; l’ellipse de la traduction française ne rend pas la question coréenne incomplète.")
OVERRIDES["ko"][1806] = ("utterance", "답변 기다리겠습니다. est une formule coréenne entière d’attente de réponse ; l’ellipse de la traduction française n’ajoute aucun trou à la forme apprise.")
for source_index in [3153, 3154, 3155, 3157, 3160]:
    OVERRIDES["ja"][source_index] = ("utterance", "La forme japonaise fournit un prédicat entier (état ou verbe conjugué), malgré une glose française adjectivale ; ne pas la transformer en simple mot-adjectif.")

DESCRIPTIVE_MEANINGS = set("grand petit nouveau vieux facile difficile rapide lent propre sale plein vide cher lourd léger long court fort faible pareil différent intéressant ennuyeux utile inutile dangereux sûr important étrange normal célèbre populaire simple compliqué sérieux drôle bizarre incroyable terrible confortable nécessaire brillant mat clair vif pâle dur serré large fin profond plat rond droit lâche jaloux gêné déçu reconnaissant nerveux coupable seul curieux dépassé satisfait impatient célibataire rouge noir bleu vert blanc rose jaune gris orange marron beige doré argenté imperméable négociable surgelé végétarien cuit saignant rougeâtre humide sec froid chaud tiède fragile solide intelligent bête calme tranquille doux dur meilleur mauvais bon fier prudent honnête poli impoli disponible occupé prêt propre heureux triste furieux inquiet adorable magnifique formidable étonnant semblable identique dernier premier prochain précédent gratuit payant ouvert fermé complet incomplet vide public privé local national international récent ancien moderne traditionnel quotidien habituel rare commun spécial général particulier possible impossible probable certain incertain vrai faux réel virtuel concret abstrait agréable désagréable passionnant épuisé fatigué frais vivant mort malade sain sévère léger grave rapide lent actif passif efficace inefficace fiable nécessaire suffisant excessif intense modéré facile difficile précis vague net flou étroit mince épais haut bas loin proche exact approximatif essentiel secondaire principal mineur majeur extrême ordinaire extraordinaire fantastique excellent médiocre affreux horrible superbe pratique impratique souple rigide flexible stable instable responsable sensible généreux avare modeste arrogant courageux peureux tolérant impatient patient discret curieux timide sociable réservé naturel artificiel propre sale rugueux lisse moelleux croquant amer sucré salé acide épicé".split())
JA_NA_DESCRIPTIVE = set("簡単 きれい 空っぽ 同じ 便利 無駄 安全 大切 変 普通 有名 人気 シンプル 複雑 真面目 奇妙 快適 必要 鮮やか 平ら まっすぐ 満足 独身 静か 丁寧 親切 元気 大丈夫 不安 心配 自由 特別 重要 正確 明確 曖昧 曖昧な 確実 不確実 可能 不可能 十分 不十分 健康 新鮮 豪華 賑やか にぎやか 簡単な 複雑な 幸せ 幸福 不幸 誠実 正直 素直 無料 有料 不便 楽 清潔 不潔 安心 不満 穏やか 上手 下手 得意 苦手 合理的 非合理的 積極的 消極的 効果的 効率的 魅力的 現実的 理想的 基本的 具体的 抽象的 一般的 個人的 国際的 伝統的 現代的 自然 人工的 安全な 危険 危険な".split())
JA_ADVERBS = set("よく 時々 めったに もっと より少なく 十分 十分に とても どこでも もう まだ ついに すでに 再び まもなく いつも たまに すぐに ずっと ちょうど ゆっくり 早く 少し たくさん 多分 たぶん おそらく 必ず 絶対に 本当に 実際に 特に 主に ほとんど かなり 非常に 全く 全然 一緒に 別々に 順番に 直接 間接的に 静かに 丁寧に 簡単に あまり まったく 先に 後ほど すぐ もうすぐ まず がっかり".split())
KO_ADVERBS = set("자주 가끔 드물게 더 덜 충분히 아주 어디에나 이미 아직 드디어 곧 항상 언제나 매우 너무 정말 진짜 다시 즉시 천천히 빨리 조금 많이 함께 따로 각자 직접 간접적으로 조용히 완전히 거의 특히 주로 절대로 아마 아마도 반드시 분명히 솔직히 일단 점점 갑자기 자꾸 계속 우연히 일부러 겨우 차라리 오히려 훨씬 가장 대체로 대략 꼭 전혀 충분하게 신중하게 정확하게 동시에 먼저 마침내 벌써 도무지 쉽게 어려워서".split())
RELATIONAL_FORMS = {
    "ja": set("上に 下に 中に 前に 後ろに 間に 中で 外で 近くに そばに 隣に 向かいに 向かい側に 周りに 後で 前で 家で 学校で 家に".split()),
    "ko": set("위에 아래에 안에 앞에 뒤에 사이에 안에서 밖에서 옆에 근처에 맞은편에 주변에 가운데에 밖에 뒤에서 앞에서".split())
}
TIME_NOMINALS = {
    "ja": set("今朝 今日の午後 今年 今晩 朝早く 昨日の夜 今日 昨日 明日 今週 来週 先週 今月 来月 先月 来年 去年 最近 将来 将来的に 今のところ 今の所 毎日 毎週 午後に 食事の前に 食事の後に 夜に 朝に 一週間 一泊で 五分後に 明日から".split()),
    "ko": set("오늘 아침|오늘 오후|올해|오늘 저녁|아침 일찍|요즘|최근에|오래전에|지금까지|그동안에|오늘|어제|내일|이번 주|다음 주|지난주|매일|매주|이번 달|다음 달|작년|내년".split("|"))
}


def lexical_metadata(lang, card):
    form = re.sub(r"[。！？?!.]+$", "", card["t"].strip())
    sense = normalized_french(card["frm"])
    if form in RELATIONAL_FORMS[lang]:
        return {"lexicalClass": "preposition", "lexicalClassReason": "Famille relationnelle inspectée : " + ("nom/repère suivi d’une particule japonaise" if lang == "ja" else "repère nominal suivi d’une particule coréenne") + ", pas une équivalence mot à mot avec une préposition française. Le groupe cité est conservé entier.", "lexicalClassReviewStatus": "reviewed"}
    if form in TIME_NOMINALS[lang]:
        return {"lexicalClass": "other", "lexicalClassReason": "Repère ou groupe nominal de temps inspecté ; sa fonction temporelle n’en fait pas automatiquement un adverbe natif.", "lexicalClassReviewStatus": "reviewed"}
    if form in (JA_ADVERBS if lang == "ja" else KO_ADVERBS):
        return {"lexicalClass": "adverb", "lexicalClassReason": "Forme native inspectée dans son emploi adverbial (fréquence, manière, degré ou modalité) ; la décision ne vient pas du seul mot français.", "lexicalClassReviewStatus": "reviewed"}
    if sense in DESCRIPTIVE_MEANINGS:
        if lang == "ja" and (form in JA_NA_DESCRIPTIVE or form.endswith("い")) and form not in {"違い", "願い"}:
            return {"lexicalClass": "adjective", "lexicalClassReason": "Sens descriptif lexical concordant avec une forme japonaise adjectivale en い ou une forme adjectivale nominale identifiée ; aucune phrase prédicative n’est découpée.", "lexicalClassReviewStatus": "rule-based-candidate"}
        if lang == "ko" and re.search(r"(?:[가-힣])(?:은|운|한|인|는|된|의|있는|없는)$", form):
            return {"lexicalClass": "adjective", "lexicalClassReason": "Famille descriptive : la forme coréenne source est adnominale et son sens est qualificatif. Il faut la rattacher à un nom ; ne pas l’enseigner comme une phrase autonome ni comme la morphologie d’un adjectif français.", "lexicalClassReviewStatus": "rule-based-candidate"}
        if lang == "ko" and form and 0xAC00 <= ord(form[-1]) <= 0xD7A3 and (ord(form[-1]) - 0xAC00) % 28 == 4:
            return {"lexicalClass": "adjective", "lexicalClassReason": "Sens descriptif concordant avec la forme adnominale coréenne à finale ㄴ ; classification de famille à revoir, sans en déduire une règle universelle de conjugaison.", "lexicalClassReviewStatus": "rule-based-candidate"}
    if LEXICAL_FRENCH.search(card["frm"]) or form.endswith(("색", "色", "曜日", "월", "요일")):
        return {"lexicalClass": "other", "lexicalClassReason": "Entrée nominale ou nom de couleur/calendrier, pas adjectif ou adverbe par sa seule traduction. La décision de vocabulaire n’est pas changée.", "lexicalClassReviewStatus": "rule-based-candidate"}
    return {"lexicalClass": "uncertain", "lexicalClassReason": "La fonction lexicale native n’est pas assez établie pour imposer adjectif, préposition/repère ou adverbe ; réserver la sous-famille pour revue sémantique.", "lexicalClassReviewStatus": "rule-based-candidate"}


def normalized_french(value):
    return re.sub(r"[.!?…]+$", "", value.strip()).strip().lower()


def pure_number(card):
    value = normalized_french(card["frm"])
    if re.fullmatch(r"[+-]?\d+(?:[,.]\d+)?(?:er|ère|e|ème)?", value):
        return True
    tokens = re.findall(r"[a-zéèêàîôûç]+", value)
    return bool(tokens) and any(token != "et" for token in tokens) and all(token in NUMBER_WORDS for token in tokens) and not re.search(r"[^\w\s\-éèêàîôûç]", value)


def assignment(lang, index, card):
    study = card["t"].strip()
    meaning = card["frm"].strip()
    if index in OVERRIDES[lang]:
        kind, reason = OVERRIDES[lang][index]
        if kind == "lexical-list":
            if pure_number(card):
                kind, reason = "number", "Liste inspectée : cette carte donne un nombre ou ordinal seul, à séparer des phrases qui l’emploient."
            elif MARKER.search(study):
                kind, reason = "incomplete", "Liste inspectée : le marqueur lié de cette entrée exige un complément, absent de la carte."
            else:
                kind = "vocabulary"
        return {"sourceIndex": index, "contentType": kind, "reason": reason, "reviewStatus": "reviewed"}
    if pure_number(card):
        kind, reason = "number", "Le sens source est uniquement un cardinal ou ordinal ; classer le nombre seul séparément des phrases qui l’emploient."
    elif MARKER.search(study) or MARKER.search(meaning) or re.match(r"^[-–][ㄱ-ㅎ가-힣ぁ-んァ-ン一-龯]", study):
        kind, reason = "incomplete", "La forme ou son sens annonce explicitement un emplacement, une suite ou un morphème lié ; ne pas la faire passer pour une phrase complète."
    elif lang == "ja" and JA_POLITE.search(study):
        kind, reason = "utterance", "La forme japonaise termine une assertion, question ou demande en forme finie/polie ; le texte n’annonce aucun trou à remplir."
    elif lang == "ko" and KO_POLITE.search(study) and re.sub(r"[.!?。！？]+$", "", study) not in KO_NOUN_YO:
        kind, reason = "utterance", "La forme coréenne porte une finale de réplique polie/finie, sans emplacement à compléter ; les noms homographes en 요 sont exclus de cette règle."
    elif lang == "ja" and JA_COMMAND.search(study) and FRENCH_IMPERATIVE.search(meaning):
        kind, reason = "utterance", "La forme japonaise et le sens français concordent sur une instruction entière ; une finale en て seule n’aurait pas suffi."
    elif study.endswith(("?", "？")) and meaning.endswith("?"):
        kind, reason = "utterance", "Les deux champs donnent une question entière, y compris une question elliptique de dialogue ; aucun emplacement n’est annoncé."
    elif normalized_french(meaning) in FRENCH_FORMULAS and TERMINAL.search(study):
        kind, reason = "utterance", "Formule pragmatique entière avec une intention de réponse, salutation ou politesse ; la brièveté ne suffit pas à en faire du vocabulaire."
    elif re.match(r"^(?:merci\b|bon(?:ne|nes|s)?\b|joyeux\b|bienvenue\b|félicitations\b)", meaning, re.I) and TERMINAL.search(study):
        kind, reason = "utterance", "Souhait, accueil ou remerciement entier dans les deux champs ; une formule sociale n’exige pas de proposition sujet-verbe."
    elif SUBJECT.search(meaning) and TERMINAL.search(study):
        kind, reason = "utterance", "Le sens décrit une assertion/question entière et la forme étudiée est ponctuée comme une réplique ; aucun emplacement annoncé n’est détecté."
    elif not TERMINAL.search(study) and not SUBJECT.search(meaning) and (LEXICAL_FRENCH.search(meaning) or card.get("cat") in {"vocab", "basics"} or card.get("pedagogicalStatus") == "fragment"):
        kind, reason = "vocabulary", "Forme sans finale de réplique détectée et sens lexical (mot ou locution), confirmé par la fonction de la carte ; les métadonnées source ne sont qu’un indice supplémentaire."
    else:
        kind, reason = "review", "La forme ne fournit pas de critère assez sûr pour séparer entrée lexicale, réplique contextuelle et fragment ; décision sémantique requise, sans déplacement silencieux."
    return {"sourceIndex": index, "contentType": kind, "reason": reason, "reviewStatus": "rule-based-candidate"}


def write(lang, cards):
    pair = "fr-" + lang
    entries = [assignment(lang, i, card) for i, card in enumerate(cards)]
    for entry, card in zip(entries, cards):
        if entry["contentType"] == "vocabulary":
            entry.update(lexical_metadata(lang, card))
        if (lang, entry["sourceIndex"]) in {("ja", 2985), ("ko", 2138)}:
            entry["sourceTemplateException"] = True
    payload = {"version": 1, "pair": pair, "studyLanguage": lang,
               "sourceDeckSha256": hashlib.sha256(canonical(cards)).hexdigest(),
               "status": "candidate-requires-semantic-review", "assignments": entries}
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / (pair + ".json")).write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n")
    kinds = ["utterance", "vocabulary", "number", "incomplete", "review"]
    totals = collections.Counter(entry["contentType"] for entry in entries)
    lines = [f"# Types de contenu — {pair}", "", "Classification candidate, sans modification du catalogue, des niveaux source, des droits ou des phonétiques.", "",
             "`reviewed` signifie décision éditoriale inspectée pour la carte citée ; ce n’est ni une relecture native ni une certification de la méthode phonétique. Les autres décisions sont des candidates à règles explicites. Une réserve `review` reste à décider avant de présenter sa carte comme une phrase entière.", "",
             "Une réplique peut être brève : Oui, Non, Bonjour, Merci sont autonomes dans leur échange. À l’inverse, un point final ne prouve pas qu’un nom ou un suffixe soit une phrase. `cat` et `pedagogicalStatus` sont conservés comme diagnostics et ne constituent jamais seuls la preuve du type.", "",
             "| Niveau source | Cartes | " + " | ".join(kinds) + " |", "|---|---:|" + "---:|" * len(kinds)]
    for level in range(1, 11):
        counts = collections.Counter(entry["contentType"] for entry, card in zip(entries, cards) if card["lv"] == level)
        lines.append(f"| L{level} | {sum(counts.values())} | " + " | ".join(str(counts[kind]) for kind in kinds) + " |")
    lines += [f"| Total | {len(entries)} | " + " | ".join(str(totals[kind]) for kind in kinds) + " |", "", "## Cas inspectés", ""]
    for index, (kind, reason) in OVERRIDES[lang].items():
        card = cards[index]
        kind, reason = entries[index]["contentType"], entries[index]["reason"]
        lines.append(f"- `{index}` — {card['t']} / {card['frm']} → `{kind}`. {reason}")
    lines += ["", "## Limites", "", "Les finales natives et le sens source évitent de confondre les listes lexicales avec les phrases finies. Les réponses elliptiques et les formes liées sans marqueur explicite restent le point à revoir. Aucun nombre situé dans une phrase n’est extrait ni reconstruit. Les 56 cartes `basics` contiennent aussi couleurs et dates : cette catégorie ne signifie pas « nombre ». Les champs phonétiques restent intégralement dans leur source ; le présent lot ne les calcule pas.", "",
              "Les comptes ci-dessus suivent `lv` source, pas le reclassement éditorial candidat. Le builder doit calculer les comptes par niveau éditorial après avoir joint les décisions par `sourceIndex`.", "",
              f"Empreinte canonique du deck : `{payload['sourceDeckSha256']}`.", ""]
    lines += ["## Réserves conservées", "", "Ces cartes restent hors d’une certification de phrase entière tant que leur fonction dans une scène n’est pas tranchée.", "", "| Index | Forme étudiée | Sens source |", "|---:|---|---|"]
    for entry, card in zip(entries, cards):
        if entry["contentType"] == "review":
            lines.append(f"| {entry['sourceIndex']} | {card['t'].replace('|', ' / ')} | {card['frm'].replace('|', ' / ')} |")
    lines += ["", "## Sous-familles lexicales", "", "Ces trois familles décrivent la forme native et son usage source, pas une traduction grammaticale automatique depuis le français. Une phrase prédicative reste `utterance`. Un suffixe sans support reste `incomplete`, jamais un mot-préposition autonome.", "",
              "`preposition` est une famille de repères relationnels : en japonais/coréen, les formes retenues sont surtout des groupes nominaux avec particule. Cette clé technique ne prétend pas que ces langues utilisent les prépositions françaises. Les noms de couleur et de temps ne deviennent pas automatiquement adjectifs/adverbes. `uncertain` réserve la sous-famille sans forcer une analyse.", "",
              "| Niveau source | adjective | preposition | adverb | other | uncertain |", "|---|---:|---:|---:|---:|---:|"]
    lexical_kinds = ["adjective", "preposition", "adverb", "other", "uncertain"]
    for level in range(1, 11):
        counts = collections.Counter(entry["lexicalClass"] for entry, card in zip(entries, cards) if entry["contentType"] == "vocabulary" and card["lv"] == level)
        lines.append(f"| L{level} | " + " | ".join(str(counts[kind]) for kind in lexical_kinds) + " |")
    counts = collections.Counter(entry["lexicalClass"] for entry in entries if entry["contentType"] == "vocabulary")
    lines += ["| Total | " + " | ".join(str(counts[kind]) for kind in lexical_kinds) + " |", "",
              "La présence d’une famille à chaque niveau ne se déduit pas de cette table. Le builder ne doit pas remplir un thème vide avec une forme liée ou une phrase dupliquée. Les réserves de sous-famille restent accessibles au dossier de Claude.", ""]
    if lang == "ko":
        lines += ["Exemple décisif : `DECKS.ko[2617]` contient `이` au sens de « les dents » ; il s’agit d’un nom, pas de la particule sujet homographe. Une table de particules sans lecture du sens aurait produit un classement faux.", ""]
    (OUT / (pair + ".md")).write_text("\n".join(lines))
    return {"pair": pair, "cards": len(cards), "counts": dict(totals), "individuallyInspected": len(OVERRIDES[lang])}


if __name__ == "__main__":
    source = decks()
    print(json.dumps([write(lang, source[lang]) for lang in ("ja", "ko")], ensure_ascii=False, indent=2))
