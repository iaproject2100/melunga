#!/usr/bin/env python3
"""Prépare les 160 choix entiers JA/KO, sans modifier le produit ni les sources.

Les phrases et les aides sont des littéraux entiers dans la pièce de travail.
Cette commande ne construit jamais une aide en assemblant des aides de mots.
L'archive de conversations est consultée pour la recherche, sans import si une
carte canonique couvre déjà l'intention. --check ne modifie aucun fichier.
"""
from __future__ import annotations

import argparse
import difflib
import hashlib
import json
import re
import unicodedata
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DOSSIER = ROOT / 'docs/niveaux-progressifs/enrichissement-situations'
DEFAULT_ARCHIVE = ROOT.parent / 'melunga-progression-corrections/melunga_deploy/content/conversation'
SOURCE_COMMIT = '7d245568102f16fb8ae9e29c46bb89221358058b'


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode('utf-8')


def sha(value):
    return hashlib.sha256(canonical(value)).hexdigest()


def raw_sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def text_normal(value):
    return ''.join(c for c in unicodedata.normalize('NFKC', value).lower() if c.isalnum())


def french_normal(value):
    plain = ''.join(c for c in unicodedata.normalize('NFKD', value.lower()) if not unicodedata.combining(c))
    return re.sub(r'[^a-z0-9]+', ' ', plain).strip()


STOP = set('je j tu il elle on nous vous ils elles le la les un une des du de d l a au aux ce cette ces mon ma mes ton ta tes son sa ses notre nos votre vos leur leurs est et en pour par pas ne n me m te t se s que qu qui ou dans avec sans moi toi y c ca ai as ont sont etre avoir peux peut pouvez puis voudrais veut veux souhaite cet ici la'.split())


def french_tokens(value):
    return set(french_normal(value).split()) - STOP


SEARCH_TERMS = {
    'ja': {
        'repas-preferences': ['肉は食', '水の方', 'ベジタリアン', '牛乳', '辛く', 'それでいい'],
        'numerique-quotidien': ['充電', 'コンセント', 'Wi-Fi', 'ワイファイ', 'ネットワーク', 'パスワード', 'メッセージ', 'ボタン', '接続'],
        'hotel-sejour': ['ホテル', '名前で予約', '二泊', '朝食は何時', '静かな部屋', '朝早く', 'かばんを預', '鍵はここ'],
        'loisirs-sorties': ['今晩出', '昼食の後', '映画', '散歩', '妹と', '席を予約', '午後六時'],
        'transport-imprevus': ['乗り遅れ', '着く前', '二十分', '一駅', '次のバス', '同じ切符', '別の路線', '目的地'],
        'etudes-apprentissage': ['講座', '復習', '練習問題', '指示', '別の例', 'もう一度', '間違いを直', '答えを説明'],
        'argent-paiements': ['端末', '支払い', '金額', 'レシート', '現金', '余分', '返金', '口座'],
        'service-client': ['注文した', '破損', '部品', '問題の写真', '交換', '配達予定', '返送', '動いて'],
        'invitations-limites': ['お誘い', '招待', '静かな場所', '土曜日', '日曜日', '仕事なので', '少人数', '都合', '長くは'],
        'nature-gestes': ['短いコース', '歩く方', '使い捨て', '水筒', 'ごみ', 'ゴミ', 'リサイクル', '分別', '植物', '標識'],
    },
    'ko': {
        'repas-preferences': ['고기', '물이 더', '채식', '우유', '맵게', '딱 좋아'],
        'numerique-quotidien': ['충전', '콘센트', '와이파이', '네트워크', '비밀번호', '메시지', '버튼', '연결'],
        'hotel-sejour': ['호텔', '이름으로 예약', '이박', '이 박', '몇 시', '조용한 방', '일찍 출발', '가방을 맡', '열쇠'],
        'loisirs-sorties': ['저녁에 나', '점심', '영화', '산책', '여동생', '자리를 예약', '여섯 시'],
        'transport-imprevus': ['버스를 놓', '도착하기 전', '이십 분', '정거장', '다음 버스', '같은 표', '노선', '목적지'],
        'etudes-apprentissage': ['강좌', '복습', '연습 문제', '지시', '다른 예', '한 번 더', '실수', '답을 설명'],
        'argent-paiements': ['단말기', '결제', '금액', '영수증', '현금', '환불', '계좌'],
        'service-client': ['주문한', '파손', '부품', '문제 사진', '교환', '배송 예정', '반송', '작동'],
        'invitations-limites': ['초대', '조용한 곳', '토요일', '일요일', '일해야', '소규모', '시간이', '오래 있을', '사정'],
        'nature-gestes': ['짧은 코스', '걸어가는', '일회용', '물병', '쓰레기', '재활용', '분리배출', '식물', '표시된 길'],
    },
}

THEME_NOTES = {
    'ja': {
        'repas-preferences': 'L2 : formule de restaurant apprise entière avant toute analyse. は/に/を et la politesse restent dans les phrases ; une préférence ne devient pas une allergie. Aucune règle universelle de substitution ni de construction négative n’est annoncée.',
        'numerique-quotidien': 'L2 : phrases de dépannage apprises en blocs courts. Le message est celui affiché dans la conversation en cours, donc le possessif français n’est pas ajouté artificiellement en japonais. Voir/apercevoir un message n’équivaut pas à l’avoir lu.',
        'hotel-sejour': 'L3 : le contexte hôtelier prépare arrivée, réservation, quantité de nuits et départ. 二泊 se lit nihaku ; ce n’est pas 二つ ni une règle universelle pour les compteurs. La permission en てもいい et la demande てもらえますか sont préparées comme deux phrases entières distinctes.',
        'loisirs-sorties': 'L3 : projet, disponibilité, préférence, rendez-vous et proposition d’aide dans un registre poli です/ます. Le tu de la référence française n’impose pas un registre familier japonais. 映画を見に行く signifie bien aller voir un film, et non seulement regarder chez soi.',
        'transport-imprevus': 'L4 : raconter un événement, son antériorité et sa durée, puis demander une solution. 前に, durée sans particule, しまう et possibilité restent identifiés comme opérations distinctes ; les lignes longues ne sont pas présentées comme une simple substitution.',
        'etudes-apprentissage': 'L4 : actions achevées, compréhension positive/négative, nouvelle tentative et résultat. Les passés ました/ませんでした et les formes てみる/てくれる sont déclarés ; changer l’objet et la polarité n’est pas traité comme un seul paramètre.',
        'argent-paiements': 'L5 : observation d’un paiement puis demande vérifiable et résolution. Les phrases comportant relatif, passif ou état résultant sont apprises avec leur sens entier ; on ne déduit pas une grammaire du paiement du seul mot carte.',
        'service-client': 'L5 : décrire l’objet livré, proposer une preuve, choisir une solution et constater le résultat. Les groupes relatifs entiers ne sont pas convertis en modèles à trous ; l’offre potentielle d’envoyer n’est pas confondue avec une promesse déjà formulée.',
        'invitations-limites': 'L6 : associer une préférence à une contrainte avec が/なら/ので, comparer et accepter sous limite. Plusieurs propositions peuvent être nécessaires pour accomplir l’intention ; elles restent explicites et ne sont pas comptées comme une seule opération nouvelle.',
        'nature-gestes': 'L6 : comparer deux choix concrets, exprimer un but, une raison et une action maintenue jusqu’à un repère. ために/まで/方が/ので/やすい/ずに sont des dépendances nommées. Le caractère recyclable concerne l’emballage décrit, pas tous les emballages.',
    },
    'ko': {
        'repas-preferences': 'L2 : chaque demande est d’abord une phrase entière en registre poli -요. 은/는 et 이/가 restent inclus dans leur groupe. La négation de manger et la préparation non piquante ne servent pas à inventer une frontière grammaticale générale.',
        'numerique-quotidien': 'L2 : huit blocs de dépannage en registre -요. Le besoin -아/어야 해요, la demande -아/어 주세요 et la perception 보이다 sont distingués. Les messages sont ceux de l’échange affiché, sans votre possessif mécanique.',
        'hotel-sejour': 'L3 : arrivée, réservation, durée en 박, chambre et départ. Deux nuits est 이 박, pas 이틀 (deux jours). 맡아 주실 수 있어요 est une demande à l’employé ; 둬도 돼요 est une permission donnée au client : les rôles ne s’inversent pas.',
        'loisirs-sorties': 'L3 : disponibilité, préférence, projet et rendez-vous en -요, sans imposer du 반말 à partir du tu français. -ㄹ까요 est une proposition interrogative, pas une affirmation. 여동생 explicite petite sœur et n’exige pas de connaître le genre de l’apprenant.',
        'transport-imprevus': 'L4 : événement achevé, avant -기 전에, durée -동안 puis solution. Compteurs 한 정거장, 이십 분 et 표 entier sont préparés. Une permission de réutiliser un billet n’est pas la possibilité physique de le garder dans sa poche.',
        'etudes-apprentissage': 'L4 : actions passées et bilan de compréhension. -기 시작하다, passé, négation, honorification du professeur et essai -아/어 보다 sont déclarés séparément. Le sens ne suppose pas qu’un lien éditorial prouve l’acquisition.',
        'argent-paiements': 'L5 : expliquer un constat de paiement, le faire vérifier et observer le remboursement. Le compteur 두 번, les groupes en -ㄴ et les constructions -ㄹ 수 있다 / -고 싶다 restent entiers ; pas de collage depuis le vocabulaire bancaire.',
        'service-client': 'L5 : qualifier la pièce reçue, apporter une preuve et suivre la solution. Les groupes relatifs 받은/주문한/교환받은 et 드리다 ne sont pas retirés pour masquer la difficulté ; leurs rôles client/employé sont préservés.',
        'invitations-limites': 'L6 : donner une contrainte et une préférence, comparer son confort, accepter avec une limite et évaluer un compromis. -지만, -아/어서, -면 et les groupes nominaux de comparaison sont préparés comme constructions distinctes.',
        'nature-gestes': 'L6 : comparer un trajet, expliquer un but avec -려고 et un geste avec -라서, puis le faire durer -때까지. Recyclable qualifie le matériau donné ; ne pas en déduire une consigne universelle de tri. Les phrases finales mobilisent explicitement plusieurs opérations.',
    },
}

DEPENDENCIES = {
    'ja': {
        'repas-preferences': ['ja:polite-masu-desu', 'ja:whole-topic-or-object-group', 'ja:whole-negative-statement', 'ja:whole-polite-service-request'],
        'numerique-quotidien': ['ja:polite-masu-desu', 'ja:location-ni-arimasu', 'ja:whole-request-kaite-moraemasu-ka', 'ja:mieru-positive-negative'],
        'hotel-sejour': ['ja:planned-arrival-with-time', 'ja:reservation-te-imasu', 'ja:fixed-counter-nihaku', 'ja:whole-permission-te-mo-ii', 'ja:whole-service-request-te-moraemasu'],
        'loisirs-sorties': ['ja:tai-desire', 'ja:no-ato-time-group', 'ja:choice-dochira', 'ja:verb-stem-ni-iku-purpose', 'ja:whole-noun-imouto-younger-sister'],
        'transport-imprevus': ['ja:polite-past', 'ja:mae-ni-antecedence', 'ja:whole-time-nijuppun', 'ja:te-shimau-unfortunate-completion', 'ja:counter-hitoeki', 'ja:whole-potential-tsukaemasu'],
        'etudes-apprentissage': ['ja:polite-past-positive-negative', 'ja:verb-stem-hajimeru', 'ja:whole-time-ichijikan', 'ja:te-kureru-benefactive', 'ja:te-miru-try', 'ja:potential-dekimasu'],
        'argent-paiements': ['ja:card-and-payment-lexicon', 'ja:whole-counter-nikai', 'ja:whole-relative-or-passive-state', 'ja:whole-confirmation-request', 'ja:potential-haraemasu', 'ja:te-hoshii-requested-action'],
        'service-client': ['ja:whole-relative-noun-groups', 'ja:polite-past-and-result-state', 'ja:offer-potential-okuremasu', 'ja:preference-no-hoo-ga-ii', 'ja:whole-delivery-date-group'],
        'invitations-limites': ['ja:contrast-ga', 'ja:conditional-nara', 'ja:reason-na-node', 'ja:comparison-no-hoo-ga', 'ja:whole-potential-negative-iraremasen'],
        'nature-gestes': ['ja:purpose-tame-ni', 'ja:comparison-yori-hoo-ga', 'ja:until-made', 'ja:te-oku-maintained-state', 'ja:verb-stem-yasui', 'ja:reason-node', 'ja:without-zuni', 'ja:whole-potential-herasemasu'],
    },
    'ko': {
        'repas-preferences': ['ko:polite-yo-register', 'ko:whole-topic-and-subject-groups', 'ko:an-negative', 'ko:whole-request-juseyo', 'ko:comparison-deo-joayo'],
        'numerique-quotidien': ['ko:polite-yo-register', 'ko:whole-necessity-chungjeonhaeya-haeyo', 'ko:whole-location-existence', 'ko:whole-request-jeogeo-juseyo', 'ko:boida-perception-positive-negative'],
        'hotel-sejour': ['ko:planned-arrival-with-time', 'ko:booking-past-result', 'ko:fixed-counter-i-bak-nights', 'ko:whole-entrusting-request', 'ko:whole-permission-dwodo-dwaeyo'],
        'loisirs-sorties': ['ko:go-sipeoyo-desire', 'ko:past-sequence-meokgo-naseo', 'ko:choice-junge-mwoga-deo', 'ko:purpose-boreo-gada', 'ko:proposal-mannalkkayo', 'ko:whole-noun-yeodongsaeng-younger-sister'],
        'transport-imprevus': ['ko:polite-past', 'ko:gi-jeone-antecedence', 'ko:whole-duration-isip-bun-dongan', 'ko:counter-han-jeonggeojang', 'ko:whole-permission-sseodo-dwaeyo'],
        'etudes-apprentissage': ['ko:polite-past-positive-negative', 'ko:gi-sijakada-start', 'ko:whole-duration-han-sigan-dongan', 'ko:teacher-honorific-jusyeosseoyo', 'ko:trial-hae-bwasseoyo', 'ko:potential-hal-su-isseoyo'],
        'argent-paiements': ['ko:payment-lexicon', 'ko:counter-du-beon', 'ko:whole-modifier-naon-geumaek', 'ko:whole-service-request-jusil-su', 'ko:potential-nael-su', 'ko:go-sipeoyo-desired-refund'],
        'service-client': ['ko:whole-relative-noun-groups', 'ko:polite-past-and-result-state', 'ko:benefactive-deurida-offer', 'ko:comparison-deo-joayo', 'ko:delivery-date-yejeongil'],
        'invitations-limites': ['ko:contrast-jiman', 'ko:reason-haeya-haeseo', 'ko:comparison-deo', 'ko:whole-small-group-sogyumo-moim', 'ko:contrast-potential-suneun-eopseoyo', 'ko:conditional-imyeon'],
        'nature-gestes': ['ko:comparison-geotboda', 'ko:purpose-ryeogo', 'ko:until-ttaekkaji', 'ko:maintained-state-neoeo-dwoyo', 'ko:potential-chajeul-su', 'ko:reason-raseo', 'ko:without-ji-anko', 'ko:potential-juril-su'],
    },
}

REUSE_REASONS = {
    'repas-preferences-03': 'Demande de préparation non piquante reprise entière, avec la portion du client pour contexte. Elle ne prétend pas établir une allergie ni l’absence de toute épice.',
    'repas-preferences-05': 'La demande d’un plat végétarien répond à la recherche d’une alternative sans viande. Le terme végétarien est appris ici en bloc ; il n’est pas confondu avec végan ni avec sans lait.',
    'repas-preferences-08': 'Formule brève existante pour confirmer que la proposition convient. La traduction source est conservée, sans fabriquer un synonyme plus long ni annoncer une nouvelle phrase.',
    'hotel-sejour-03': 'Formule entière pour demander un séjour de deux nuits. La quantité est conservée ; aucun compteur ni aucune aide n’est découpé pour produire trois nuits.',
    'hotel-sejour-04': 'Question entière identique au besoin d’horaire du petit déjeuner. Son premier niveau éditorial antérieur est conservé : réemploi de contexte, pas nouvelle carte.',
    'transport-imprevus-01': 'Constat entier de bus raté, déjà introduit avant L4. Réemploi conservant le bus et le passé, sans remplacer discrètement un train par un bus.',
    'service-client-02': 'La source décrit la marchandise livrée abîmée. La scène vise l’article reçu endommagé, pas uniquement une boîte extérieure froissée ; ce contexte d’emploi est explicite et la traduction marchandise reste entière.',
    'service-client-03': 'Le carton manque de pièces. Le pluriel de la source est conservé ; l’intention est de signaler un élément manquant, sans ajouter faussement un nombre absent de la source.',
}

SPECIAL = {
    ('ja', 'repas-preferences-01'): 'La carte 1567 exclut le porc seulement ; 肉 étend ici l’aliment évité à la viande. La phrase et son aide nouvelles sont écrites entières, sans enlever 豚 de l’aide existante.',
    ('ko', 'repas-preferences-01'): 'La carte 1481 exclut seulement le porc ; le tour L7 demande à l’autre s’il ne mange pas de viande. Ici le client affirme sa propre habitude. Question, assertion et restriction porc/viande ne sont pas assimilées.',
    ('ja', 'repas-preferences-02'): 'Préférence de boisson dans un choix eau/thé déjà proposé. La construction 水の方がいいです est naturelle dans ce contexte comparatif ; aucune boisson n’est générée automatiquement.',
    ('ko', 'repas-preferences-02'): 'Préférence de boisson après une alternative proposée. Le groupe sujet 물이 est entier, particule comprise ; il ne devient pas une règle pour tous les noms.',
    ('ja', 'repas-preferences-04'): '牛乳 est le lait lui-même, pas un glissement vers toute la catégorie des produits laitiers. La question fermée de présence diffère de la question ouverte existante この料理には何が入っていますか.',
    ('ko', 'repas-preferences-04'): '우유 désigne le lait, pas tous les produits laitiers. La question de présence d’un ingrédient précis n’est pas reprise de 이 요리에 뭐가 들어가요 sans écrire l’énoncé entier.',
    ('ja', 'repas-preferences-06'): 'Contexte : le menu offre le même plat en version chaude ou froide. 温かい方 désigne la version chaude ; on n’emploie ni 暑い (temps/air) ni 辛い (piquant).',
    ('ko', 'repas-preferences-06'): 'Contexte : le même plat peut être servi chaud ou froid. 따뜻한 걸로 fixe la version chaude ; 맵다, qui concerne le piquant, n’est pas réemployé pour la température.',
    ('ja', 'numerique-quotidien-01'): 'Le besoin de recharge ne reprend pas 携帯を充電してもいいですか, qui demande la permission. La nominalisation 充電が必要 est enseignée comme bloc de besoin.',
    ('ko', 'numerique-quotidien-01'): 'Le besoin -해야 해요 n’est pas remplacé par 휴대폰 충전해도 돼요, qui demande la permission. La phrase de besoin est entière.',
    ('ja', 'numerique-quotidien-07'): 'つながっています constate une connexion établie maintenant ; il ne promet pas la réparation définitive d’un réseau. Il prépare le contraste avec le message visible à l’étape suivante.',
    ('ko', 'numerique-quotidien-07'): '잘돼요 constate que la connexion fonctionne à présent. Les syllabes 연결 et 잘돼요 ne sont pas déduites de deux aides séparées.',
    ('ja', 'hotel-sejour-02'): 'La source 2236 donne le nom propre Wang. Le groupe 私の名前 remplace cette identification sans inventer un nom à l’apprenant ; phrase et aide restent nouvelles et entières.',
    ('ko', 'hotel-sejour-02'): 'La réservation est déjà faite au nom de la personne qui parle. 제 이름으로 est complet ; aucun nom fictif ni terminaison réservée à un nom propre n’est inséré.',
    ('ja', 'hotel-sejour-07'): 'La demande confie un sac à l’employé jusqu’au soir. 預かる n’est pas remplacé par 置く : garder pour quelqu’un et simplement poser un objet ont des rôles différents.',
    ('ko', 'hotel-sejour-07'): '맡아 주실 수 있어요 demande au réceptionniste de prendre le sac en garde, jusqu’au soir. L’apprenant n’affirme pas qu’il garde le sac de l’employé.',
    ('ja', 'loisirs-sorties-06'): 'Le japonais impose un choix lexical d’âge relatif pour la sœur : 妹 signifie petite sœur. Le sens français le rend explicite ; aucune hypothèse sur le genre de l’apprenant n’est nécessaire.',
    ('ko', 'loisirs-sorties-06'): '여동생 est petite sœur. Il évite une équivalence universelle sœur→언니/누나, dont le choix dépend du genre et de l’âge relatif. Le français ajoute petite pour préserver le sens exact.',
    ('ja', 'loisirs-sorties-07'): 'Offre déclarative de pouvoir réserver les places, distincte de 予約できますか qui demande si réserver est possible. Ajouter un objet ne permet pas de conserver la question source.',
    ('ko', 'loisirs-sorties-07'): '제가 marque la personne qui propose de réserver les places. L’énoncé n’est pas la question 예약할 수 있어요?, même si la possibilité verbale est apparentée.',
    ('ja', 'transport-imprevus-04'): 'Une gare/station avant celle voulue : 一駅手前. Ce groupe entier fixe la comparaison de position ; しまいました présente l’erreur achevée, pas une nouvelle obligation.',
    ('ko', 'transport-imprevus-04'): '한 정거장 est la quantité une station entière ; 일찍 indique l’arrêt trop tôt dans le contexte d’une station avant celle voulue. La quantité ne se reconstruit pas depuis un mot isolé.',
    ('ja', 'transport-imprevus-06'): 'La question porte sur la validité/réutilisation du même billet pour repartir ; le français dit utiliser plutôt que garder physiquement. 使えます est une possibilité, pas la conservation du papier.',
    ('ko', 'transport-imprevus-06'): 'La question demande si le billet peut être utilisé tel quel pour la suite. 써도 돼요 est une permission ; ce n’est pas une demande de conserver matériellement le billet.',
    ('ja', 'etudes-apprentissage-05'): 'Le professeur montre un exemple à l’apprenant : てくれる exprime ce bénéficiaire. Ce n’est pas le seul ajout d’un mot exemple à un passé déjà su.',
    ('ko', 'etudes-apprentissage-05'): 'Le professeur est honorifié par 주셨어요. L’honneur dû au professeur et le passé sont nommés séparément ; une termininason -었어요 seule ne prépare pas toute la phrase.',
    ('ja', 'service-client-04'): 'Offre possible d’envoyer une photo. La source 2688 annonce l’envoi avec お送りします ; elle ne déclare pas seulement la capacité. Les deux aides ne sont pas mélangées.',
    ('ko', 'service-client-04'): '드릴 수 있어요 propose l’envoi comme possibilité au client/service. La source 1929 promet l’envoi avec 드릴게요 : engagement futur et offre de capacité restent distincts.',
    ('ja', 'service-client-05'): 'Après que le service a proposé remboursement ou échange, l’apprenant préfère l’échange. La comparaison reprend exactement le cadre appris pour la préférence de boisson, avec deux énoncés entiers disponibles.',
    ('ko', 'service-client-05'): 'Après l’alternative remboursement/échange, 교환이 더 좋아요 exprime la préférence. Le groupe 교환이, particule comprise, se compare au groupe 물이 de L2 ; les deux phrases sont entières.',
    ('ja', 'invitations-limites-08'): 'Les contraintes sont celles de l’agenda et des disponibilités dans cette rencontre. 合わせられます signifie pouvoir s’adapter à ces contraintes ; ce n’est pas une garantie abstraite de respect de toutes les obligations.',
    ('ko', 'invitations-limites-08'): '사정 est la situation/contrainte personnelle de chacun dans l’organisation de la rencontre. 고려할 수 있어요 exprime la prise en compte possible, pas une affirmation universelle sur toutes les solutions.',
    ('ja', 'nature-gestes-03'): 'Le but ために, le contenant réutilisable 水筒 et 持っていく sont tous présents dans une phrase complète. Le sujet collectif est compris par le contexte de sortie, sans imposer un pronom français mot à mot.',
    ('ko', 'nature-gestes-03'): '개인 물병 désigne ici la gourde personnelle réutilisable du groupe. -지 않으려고 et 챙겨 가요 portent le but et l’action : il y a plusieurs opérations déclarées, pas une substitution cachée.',
    ('ja', 'nature-gestes-08'): 'Le dernier énoncé combine condition すれば, sans ずに et potentiel 減らせます. Il est préparé comme synthèse L6 de cette scène ; aucune affirmation de maîtrise générale de ces trois opérations.',
    ('ko', 'nature-gestes-08'): 'La synthèse combine si -면, sans -지 않고 et possibilité -ㄹ 수 있어요. La longueur et ces trois opérations sont explicites ; ce n’est pas présenté comme le simple remplacement d’un mot de L2.',
}


def parse_decks():
    # Ne jamais afficher la ligne DECKS : elle contient le catalogue complet.
    line = next(x for x in (ROOT / 'melunga_deploy/app.html').read_text().splitlines() if x.startswith('var DECKS = '))
    return json.loads(line.split('=', 1)[1].strip().rstrip(';'))


def stock_for(lang, decks, archive):
    rows, files = [], []
    for index, card in enumerate(decks[lang]):
        rows.append({'key': f'catalogue:{lang}:{index}', 'kind': 'catalogue-reference',
                     'study': card['t'], 'native': card['frm'], 'phon': card['pf'], 'reading': card['py'],
                     'source': {'collection': 'DECKS.' + lang, 'sourceIndex': index,
                                'sourceLevel': card['lv'], 'sourceSha256': sha(card)}})
    parents = sorted(archive.glob(f'L*-fr-{lang}.json'))
    if len(parents) != 10:
        raise ValueError(f'{lang}: dix parents de conversation L1–L10 attendus, {len(parents)} trouvés')
    for path in parents:
        data = json.loads(path.read_text())
        file_hash = raw_sha(path)
        files.append({'file': path.name, 'fileSha256': file_hash, 'sourceCommit': SOURCE_COMMIT})
        entries = []
        for ui, unit in enumerate(data.get('units', [])):
            for vi, entry in enumerate(unit.get('variants', [])):
                entries.append((f'/units/{ui}/variants/{vi}', entry,
                                {'unitId': unit.get('id'), 'originalRole': 'learner variant'}))
        for di, dialogue in enumerate(data.get('dialogues', [])):
            for ti, entry in enumerate(dialogue.get('turns', [])):
                entries.append((f'/dialogues/{di}/turns/{ti}', entry,
                                {'dialogueId': dialogue.get('id'), 'originalSpeaker': entry.get('speaker'),
                                 'originalLearnerRole': dialogue.get('learnerRole')}))
        for pointer, entry, context in entries:
            if not all(isinstance(entry.get(k), str) for k in ['study', 'native', 'phon']):
                continue
            if re.search(r'\{[^}]+\}|…|\.\.\.|_{2,}|〜|～', entry['study']):
                continue
            rows.append({'key': f'conversation:{path.name}:{pointer}', 'kind': 'conversation-whole-entry',
                         **{k: entry[k] for k in ['study', 'native', 'phon', 'reading'] if k in entry},
                         'source': {'archiveFile': path.name, 'jsonPointer': pointer,
                                    'fileSha256': file_hash, 'entrySha256': sha(entry),
                                    'sourceCommit': SOURCE_COMMIT, 'sourceLevel': data.get('level'), **context}})
    return rows, files


def french_score(reference, row):
    qn, rn = french_normal(reference), french_normal(row['native'])
    if qn == rn:
        return 2.0
    qt, rt = french_tokens(reference), french_tokens(row['native'])
    return .58 * difflib.SequenceMatcher(None, qn, rn).ratio() + .42 * len(qt & rt) / max(1, len(qt | rt))


def short_row(row, score=None):
    out = {k: row[k] for k in ['key', 'study', 'native', 'phon', 'reading', 'source'] if k in row}
    if score is not None:
        out['surfaceSimilarityOnly'] = round(score, 6)
    return out


def one_parameter(lang):
    if lang == 'ja':
        a, b, invariant = '水', '交換', '{groupe nominal complet}の方がいいです。'
    else:
        a, b, invariant = '물이', '교환이', '저는 {groupe sujet complet, particule comprise} 더 좋아요.'
    return {'status': 'reviewed-bounded-two-whole-utterances',
            'preparedCandidateId': f'fr-{lang}:repas-preferences-02',
            'preparedIntentId': 'repas-preferences-02',
            'currentIntentId': 'service-client-05',
            'parameter': 'groupe nominal entier' if lang == 'ja' else 'groupe sujet entier, particule comprise',
            'preparedGroup': a, 'currentGroup': b, 'invariantDescription': invariant,
            'maxChangedElements': 1, 'wholeUtterancesAuthoredIndependently': True,
            'phoneticsComposedFromFragments': False,
            'doesNotLicenseArbitrarySubstitutions': True,
            'doesNotMeasureAcquisition': True,
            'reason': 'Les deux phrases complètes sont présentes au L2 puis au L5. Le parallèle sert à comparer une seule portion entière dans un cadre stable ; aucune flexion, politesse ou particule supplémentaire n’est masquée.'}


def make_pair(lang, plan, plan_hash, proposals, first_seen, decks, archive):
    pair = 'fr-' + lang
    rows, source_files = stock_for(lang, decks, archive)
    lookup = {row['key']: row for row in rows}
    by_normal, by_reading = {}, {}
    for row in rows:
        by_normal.setdefault(text_normal(row['study']), []).append(row)
        if row.get('reading'):
            by_reading.setdefault(text_normal(row['reading']), []).append(row)
    draft_lookup = {x['intentId']: x for x in proposals}
    intents = [(theme, intent) for theme in plan['themes'] for intent in theme['intents']]
    assert len(draft_lookup) == len(proposals) == len(intents) == 80
    assert set(draft_lookup) == {intent['id'] for _, intent in intents}
    evidence, items = [], []
    seen_new = {}
    for theme, intent in intents:
        draft, intent_id = draft_lookup[intent['id']], intent['id']
        reused = draft.get('reuseKey')
        row = lookup[reused] if reused else None
        values = {k: (row if row else draft)[k] for k in ['study', 'native', 'phon', 'reading']}
        assert all(isinstance(value, str) and value.strip() for value in values.values())
        assert not re.search(r'\{[^}]+\}|…|\.\.\.|_{2,}|〜|～', values['study'])
        exact = by_normal.get(text_normal(values['study']), [])
        reading_matches = by_reading.get(text_normal(values['reading']), [])
        if not reused:
            assert not exact, (pair, intent_id, 'forme déjà présente, la réemployer', exact)
            assert not reading_matches, (pair, intent_id, 'lecture déjà présente, vérifier le sens', reading_matches)
            assert text_normal(values['study']) not in seen_new, (pair, intent_id, 'doublon entre candidats')
            seen_new[text_normal(values['study'])] = intent_id
        french_candidates = sorted(rows, key=lambda z: -french_score(intent['referenceUtteranceFr'], z))[:3]
        study_candidates = sorted(((difflib.SequenceMatcher(None, text_normal(values['study']), text_normal(z['study'])).ratio(), z)
                                   for z in rows), key=lambda x: -x[0])[:2]
        special = SPECIAL.get((lang, intent_id))
        reason = REUSE_REASONS[intent_id] if reused else ('Énoncé entier pour : ' + intent['intentFr'] + ' ' + (special or THEME_NOTES[lang][theme['topicId']]))
        duplicate = {
            'status': 'reviewed',
            'scope': 'DECKS plus les variantes et tours entiers admissibles des dix conversations du couple L1–L10, puis les quatre-vingts candidats du couple',
            'sameStudyIgnoringSpacingAndPunctuation': [x['key'] for x in exact],
            'sameReadingIgnoringSpacingAndPunctuation': [x['key'] for x in reading_matches],
            'newWrittenForm': not bool(reused),
            'newTranslationOrPhoneticAloneCountedAsNew': False,
            'decision': ('Réemploi canonique ; aucune nouvelle forme comptée.' if reused else
                         'Aucune forme ni lecture identique dans le périmètre consulté. Les proximités ont été relues pour le sens ; la phrase et son aide ont été rédigées entières.'),
            'semanticDistinction': special or (REUSE_REASONS[intent_id] if reused else
                'Le tri automatique propose des voisins de mots ; il ne conclut pas à leur équivalence de sens, de rôle ou d’acte de parole.'),
            'evidencePath': f'docs/niveaux-progressifs/enrichissement-situations/preuves/{pair}-recherche.json',
            'evidenceIntentId': intent_id,
        }
        item = {
            'id': f'{pair}:{intent_id}', 'pair': pair, 'topicId': theme['topicId'], 'intentId': intent_id,
            'proposedLevel': intent['proposedLevel'], 'contentType': 'utterance',
            'kind': row['kind'] if row else 'editorial-authored-whole-entry',
            **values,
            'source': row['source'].copy() if row else {'kind': 'editorial-authored-whole-utterance'},
            'editorialReviewStatus': 'reviewed',
            'phoneticReviewStatus': 'existing-verbatim' if reused else 'pending-Claude',
            'reason': reason, 'duplicateAudit': duplicate,
            'dependencyConcepts': intent['requiredKnownConcepts'] + DEPENDENCIES[lang][theme['topicId']],
            'pedagogicalNotes': {
                'entryMode': 'whole-utterance-with-meaning-and-whole-phonetic-aid',
                'prerequisitesStatus': 'editorial-planned-not-acquisition-proof',
                'nativeRegister': 'polite-desu-masu' if lang == 'ja' else 'polite-yo',
                'sceneRole': intent['sourceContext']['learnerRole'],
                'context': intent['sourceContext'],
                'languageSpecificPreparation': THEME_NOTES[lang][theme['topicId']],
                'proposedVariableParametersAreNotAutomaticallyGenerated': True,
                'singleParameterClaim': False,
                'doesNotMeasureAcquisition': True,
            },
            'readingScript': 'latin',
        }
        if special:
            item['pedagogicalNotes']['specificPoint'] = special
        if reused:
            current = first_seen['sources'][reused]
            item['canonicalReuseId'] = reused
            item['currentFirstEditorialLevel'] = current['firstEditorialLevel']
            item['originalCataloguePlacement'] = current
            if current['firstEditorialLevel'] > item['proposedLevel']:
                item['introductionDecision'] = {
                    'action': 'introduce-earlier', 'fromEditorialLevel': current['firstEditorialLevel'],
                    'proposedLevel': item['proposedLevel'], 'reviewStatus': 'reviewed',
                    'reason': 'Première rencontre dans une situation bornée, avec phrase entière, sens et aide existants conservés. ' + REUSE_REASONS[intent_id] +
                              ' Ce déplacement éditorial ne modifie ni le niveau catalogue lv, ni le paiement, ni les droits historiques. Il ne démontre pas la maîtrise productive générale des constructions.',
                }
        if intent_id == 'service-client-05':
            item['oneParameter'] = one_parameter(lang)
            item['pedagogicalNotes']['singleParameterClaim'] = True
        evidence.append({
            'intentId': intent_id, 'referenceUtteranceFr': intent['referenceUtteranceFr'],
            'chosenStudy': values['study'], 'decision': item['kind'],
            'chosenSource': short_row(row) if row else None,
            'exactStudyMatches': [short_row(x) for x in exact],
            'exactReadingMatches': [short_row(x) for x in reading_matches],
            'frenchSurfaceCandidates': [short_row(x, french_score(intent['referenceUtteranceFr'], x)) for x in french_candidates],
            'studySurfaceCandidates': [short_row(x, similarity) for similarity, x in study_candidates],
            'semanticDecision': reason,
            'surfaceScoresDoNotProveSemanticEquivalence': True,
        })
        items.append(item)
    # Chaque nouvelle rubrique contient huit intentions distinctes, pas quatre-vingts copies d’un modèle.
    assert Counter(x['topicId'] for x in items) == Counter({theme['topicId']: 8 for theme in plan['themes']})
    # Contrôle source au caractère près, y compris les lectures et les aides existantes.
    for item in items:
        if item['kind'] == 'catalogue-reference':
            source = item['source']
            card = decks[lang][source['sourceIndex']]
            assert source['sourceSha256'] == sha(card)
            assert [item[k] for k in ['study', 'native', 'phon', 'reading']] == [card[k] for k in ['t', 'frm', 'pf', 'py']]
    topic_hits = {}
    for topic, terms in SEARCH_TERMS[lang].items():
        topic_hits[topic] = {'literalTargetQueries': terms,
                             'hits': [short_row(z) for z in rows if any(term in z['study'] for term in terms)]}
    counts = Counter(item['kind'] for item in items)
    report = {
        'version': 1, 'pair': pair, 'planHash': plan_hash,
        'status': 'editorial-source-audit-complete-phonetics-pending-Claude',
        'sourceDeckSha256': sha(decks[lang]), 'catalogueCount': len(decks[lang]),
        'conversationArchiveCommit': SOURCE_COMMIT, 'conversationFiles': source_files,
        'wholeConversationEntriesSearched': len(rows) - len(decks[lang]),
        'sourceFirstEditorialManifestSha256': first_seen['sourceManifestSha256'],
        'normalization': 'NFKC, minuscules, caractères alphanumériques seulement : espaces et ponctuation ignorés ; aucune normalisation des aides conservées',
        'searchMethod': 'Comparaison de toute forme et lecture cible normalisées, recherche littérale thématique en langue étudiée, trois voisins lexicaux français et deux voisins de forme cible, puis décision sémantique explicite pour chaque intention.',
        'limits': ['La normalisation ne prouve pas l’équivalence phonétique des variantes orthographiques.',
                   'La proximité de surface ne prouve ni l’équivalence d’intention ni la validité d’une phrase.',
                   'La relecture sémantique et pédagogique relève de Codex ; Claude doit vérifier les aides nouvelles entières, pas décider du classement sémantique.',
                   'Les aides nouvelles sont candidates et ne sont pas réputées validées par un locuteur natif.',
                   'Le stock scanné ne prétend pas représenter tous les énoncés qui pourraient exister ailleurs.'],
        'counts': {'intentions': len(items), 'catalogueReuses': counts['catalogue-reference'],
                   'conversationImports': counts['conversation-whole-entry'],
                   'authoredWholeUtterances': counts['editorial-authored-whole-entry'],
                   'authoredWholePhoneticsPendingClaude': sum(i['phoneticReviewStatus'] == 'pending-Claude' for i in items),
                   'candidateReferences': counts['candidate-reference'],
                   'sameNewStudyFoundInConsultedStock': 0, 'sameNewReadingFoundInConsultedStock': 0,
                   'duplicatesBetweenNewCandidates': 0,
                   'earlierIntroductionDecisions': sum('introductionDecision' in i for i in items),
                   'wholeSourceFieldsVerified': 4 * counts['catalogue-reference'],
                   'boundedTwoWholeSentenceComparisons': 1},
        'topicQueries': topic_hits, 'intents': evidence,
    }
    pair_data = {'version': 1, 'pair': pair, 'planHash': plan_hash, 'status': 'editorial-review',
                 'items': items,
                 'searchEvidence': {'path': f'docs/niveaux-progressifs/enrichissement-situations/preuves/{pair}-recherche.json',
                                    'sha256': hashlib.sha256((json.dumps(report, ensure_ascii=False, indent=2) + '\n').encode()).hexdigest(),
                                    'counts': report['counts']}}
    return pair_data, report


def serial(value):
    return json.dumps(value, ensure_ascii=False, indent=2) + '\n'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    parser.add_argument('--archive', type=Path, default=DEFAULT_ARCHIVE)
    args = parser.parse_args()
    plan_path = DOSSIER / 'plan.json'
    plan = json.loads(plan_path.read_text())
    plan_hash = raw_sha(plan_path)
    if len(plan['themes']) > 10:
        # L’extension est séparée : ces deux anciens ledgers restent byte-identiques.
        baseline = json.loads((DOSSIER / 'preuves/ja-ko-base-80-empreintes.json').read_text())
        plan_hash = baseline['pairs']['fr-ja']['planHash']
        assert plan_hash == baseline['pairs']['fr-ko']['planHash']
        plan = {**plan, 'themes': plan['themes'][:10]}
    proposals = json.loads((DOSSIER / 'preuves/ja-ko-propositions-entières.json').read_text())
    first_seen = json.loads((DOSSIER / 'preuves/ja-ko-premieres-rencontres.json').read_text())
    decks = parse_decks()
    for lang in ['ja', 'ko']:
        pair, report = make_pair(lang, plan, plan_hash, proposals['pairs'][lang], first_seen, decks, args.archive)
        results = {DOSSIER / f'fr-{lang}.json': pair,
                   DOSSIER / f'preuves/fr-{lang}-recherche.json': report}
        for path, value in results.items():
            expected = serial(value)
            if args.check:
                assert path.read_text() == expected, f'Fichier à régénérer : {path.relative_to(ROOT)}'
            else:
                path.write_text(expected)
        print(json.dumps({'pair': pair['pair'], **report['counts']}, ensure_ascii=False), flush=True)


if __name__ == '__main__':
    main()
