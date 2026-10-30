# Relecture par sondage — Russe

30 octobre 2026. Numéro = position **globale, à partir de 1**, dans le fichier JSON reçu. Le niveau est le champ `lv` réel ; les niveaux ne sont pas tous contigus dans le fichier hindi. Les cartes importées restent inchangées.

Lecture de 50 cartes par niveau (500 au total), espacées régulièrement dans chaque niveau : texte cible, guides anglais/français, traductions anglaise/française/japonaise/coréenne. Contrôle complémentaire des autres traductions et conventions phonétiques pour les écarts repérés ; ce sondage ne constitue pas une certification exhaustive des 15 champs. Aucun audio natif de référence n’a été confronté aux guides.

Les numéros exacts de l’échantillon figurent dans `validation.json`. Les propositions « à arbitrer » dépendent du contexte ou de la convention éditoriale et ne sont pas des corrections certaines.

## L1

### N° 255 — Занято.

**À arbitrer.** 자리 있어요 peut être compris comme « il y a une place » hors contexte, alors que la carte indique une place ou un équipement occupé.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `kom` | 자리 있어요. | 사용 중이에요. (si un équipement est occupé) / 자리가 찼어요. (si la place est prise) |

## L2

Aucun écart net retenu dans les 50 cartes examinées à ce niveau.

## L3

### N° 1385 — Я не успеваю позавтракать.

**Correction recommandée.** L’accent est placé sur la syllabe тра de позавтракать, alors que le verbe usuel est поза́втракать.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `py` | yah nee oos-pee-VA-yoo pa-zaf-TRA-kat | Corriger la règle ou la translittération source puis régénérer via `ru_phon.py`. Corriger l’accent de позавтракать dans l’entrée/générateur puis régénérer les quatre aides latines ; aucune valeur phonétique manuelle proposée. |
| `pf` | ya ni ous-pi-VA-you pa-zaf-TRA-kat | Corriger la règle ou la translittération source puis régénérer via `ru_phon.py`. Corriger l’accent de позавтракать dans l’entrée/générateur puis régénérer les quatre aides latines ; aucune valeur phonétique manuelle proposée. |
| `ps` | ya ni us-pi-vá-yu pa-saf-trá-kat | Corriger la règle ou la translittération source puis régénérer via `ru_phon.py`. Corriger l’accent de позавтракать dans l’entrée/générateur puis régénérer les quatre aides latines ; aucune valeur phonétique manuelle proposée. |
| `pi` | ia ni us-pi-và-iu pa-saf-trà-cat | Corriger la règle ou la translittération source puis régénérer via `ru_phon.py`. Corriger l’accent de позавтракать dans l’entrée/générateur puis régénérer les quatre aides latines ; aucune valeur phonétique manuelle proposée. |

## L4

### N° 1669 — Это фейк.

**À arbitrer.** La traduction coréenne précise « fausse nouvelle », alors que фейк peut aussi désigner un faux objet ou un montage.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `kom` | 그건 가짜 뉴스예요. | 그건 가짜예요. ; conserver 뉴스 seulement si le contexte vise explicitement une fausse nouvelle. |

## L5

### N° 2154 — Мне нужно отвлечься.

**Correction recommandée.** L’accent usuel tombe sur е, pas sur la syllabe finale ся.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `py` | mnyeh NOOZH-nah at-vlyech-SYAH | Corriger la règle ou la translittération source puis régénérer via `ru_phon.py`. Corriger l’accent de отвлечься dans la source phonétique puis régénérer les quatre guides latins par le générateur ; pas de remplacement manuel. |
| `pf` | mniè NOUJ-na at-vliètch-SIA | Corriger la règle ou la translittération source puis régénérer via `ru_phon.py`. Corriger l’accent de отвлечься dans la source phonétique puis régénérer les quatre guides latins par le générateur ; pas de remplacement manuel. |
| `ps` | mnie núzh-na at-vliech-siá | Corriger la règle ou la translittération source puis régénérer via `ru_phon.py`. Corriger l’accent de отвлечься dans la source phonétique puis régénérer les quatre guides latins par le générateur ; pas de remplacement manuel. |
| `pi` | mnie nùj-na at-vlieci-sià | Corriger la règle ou la translittération source puis régénérer via `ru_phon.py`. Corriger l’accent de отвлечься dans la source phonétique puis régénérer les quatre guides latins par le générateur ; pas de remplacement manuel. |

### N° 2321 — выздороветь

**Correction recommandée.** L’accent normatif est вы́здороветь, pas выздо́роветь.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `py` | vihz-DO-ra-veet | Corriger la règle ou la translittération source puis régénérer via `ru_phon.py`. Corriger l’accent de выздороветь dans la source phonétique puis régénérer les quatre guides latins par le générateur ; pas de remplacement manuel. |
| `pf` | vyz-DO-ra-vit | Corriger la règle ou la translittération source puis régénérer via `ru_phon.py`. Corriger l’accent de выздороветь dans la source phonétique puis régénérer les quatre guides latins par le générateur ; pas de remplacement manuel. |
| `ps` | vis-dó-ra-vit | Corriger la règle ou la translittération source puis régénérer via `ru_phon.py`. Corriger l’accent de выздороветь dans la source phonétique puis régénérer les quatre guides latins par le générateur ; pas de remplacement manuel. |
| `pi` | vis-dò-ra-vit | Corriger la règle ou la translittération source puis régénérer via `ru_phon.py`. Corriger l’accent de выздороветь dans la source phonétique puis régénérer les quatre guides latins par le générateur ; pas de remplacement manuel. |

### N° 2530 — Мы переезжаем в другой город.

**Correction recommandée.** La forme мы переезжа́ем porte l’accent sur жа, pas sur ез.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `py` | mih pee-ree-YEZH-zha-yem v droo-GOY GO-rat | Corriger la règle ou la translittération source puis régénérer via `ru_phon.py`. Corriger l’accent de переезжаем dans la source phonétique puis régénérer les quatre guides latins par le générateur ; pas de remplacement manuel. |
| `pf` | my pi-ri-YÈJ-ja-yèm v drou-GOÏ GO-rat | Corriger la règle ou la translittération source puis régénérer via `ru_phon.py`. Corriger l’accent de переезжаем dans la source phonétique puis régénérer les quatre guides latins par le générateur ; pas de remplacement manuel. |
| `ps` | mi pi-ri-yézh-zha-yem v dru-gói gó-rat | Corriger la règle ou la translittération source puis régénérer via `ru_phon.py`. Corriger l’accent de переезжаем dans la source phonétique puis régénérer les quatre guides latins par le générateur ; pas de remplacement manuel. |
| `pi` | mi pi-ri-ièj-ja-iem v dru-gòi gò-rat | Corriger la règle ou la translittération source puis régénérer via `ru_phon.py`. Corriger l’accent de переезжаем dans la source phonétique puis régénérer les quatre guides latins par le générateur ; pas de remplacement manuel. |

## L6

### N° 2803 — Он вешает лапшу на уши.

**À arbitrer.** Pulling your leg implique souvent une plaisanterie ; вешать лапшу на уши peut décrire un mensonge destiné à tromper.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `en` | He's pulling your leg. | Selon le contexte : He is feeding you lies. Garder la formulation actuelle seulement si la plaisanterie est voulue. |

### N° 2955 — Об этом пишут все газеты.

**Correction recommandée.** L’accent de пишут doit être sur и (пи́шут), pas sur у.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `py` | ab E-tam pee-SHOOT fsyeh ga-ZYE-tih | Corriger la règle ou la translittération source puis régénérer via `ru_phon.py`. Corriger l’accent dans la source puis régénérer les quatre aides latines. |
| `pf` | ab È-tam pi-CHOUT fsiè ga-ZIÈ-ty | Corriger la règle ou la translittération source puis régénérer via `ru_phon.py`. Corriger l’accent dans la source puis régénérer les quatre aides latines. |
| `ps` | ab é-tam pi-shút fsie ga-sié-ti | Corriger la règle ou la translittération source puis régénérer via `ru_phon.py`. Corriger l’accent dans la source puis régénérer les quatre aides latines. |
| `pi` | ab è-tam pi-sciùt fsie ga-siè-ti | Corriger la règle ou la translittération source puis régénérer via `ru_phon.py`. Corriger l’accent dans la source puis régénérer les quatre aides latines. |

### N° 3035 — Шайба!

**À arbitrer.** Шайба désigne le palet ; l’exclamation culturelle habituelle Шайбу! réclame un but et ne signifie pas simplement « Goal! ».

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `t` | Шайба! | Confirmer l’intention : pour célébrer un but, employer Гол! (après contrôle d’unicité) ; pour désigner le palet, aligner les traductions sur cet objet. |
| `en` | Goal! (hockey) | Confirmer l’intention : pour célébrer un but, employer Гол! (après contrôle d’unicité) ; pour désigner le palet, aligner les traductions sur cet objet. |
| `frm` | But ! (hockey) | Confirmer l’intention : pour célébrer un but, employer Гол! (après contrôle d’unicité) ; pour désigner le palet, aligner les traductions sur cet objet. |
| `jam` | ゴール！（ホッケー） | Confirmer l’intention : pour célébrer un but, employer Гол! (après contrôle d’unicité) ; pour désigner le palet, aligner les traductions sur cet objet. |
| `kom` | 골! (하키) | Confirmer l’intention : pour célébrer un but, employer Гол! (après contrôle d’unicité) ; pour désigner le palet, aligner les traductions sur cet objet. |

## L7

### N° 3205 — Исследование длилось десять лет.

**Correction recommandée.** Исследование est accentué sur сле (иссле́дование), pas sur до.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `py` | ees-slye-DO-va-nee-yeh DLEE-las DYE-seet lyet | Corriger la règle ou la translittération source puis régénérer via `ru_phon.py`. Corriger la syllabe tonique dans la source puis régénérer les quatre guides latins. |
| `pf` | is-sliè-DO-va-ni-yè DLI-las DIÈ-sit lièt | Corriger la règle ou la translittération source puis régénérer via `ru_phon.py`. Corriger la syllabe tonique dans la source puis régénérer les quatre guides latins. |
| `ps` | is-slie-dó-va-ni-ye dlí-las dié-sit liet | Corriger la règle ou la translittération source puis régénérer via `ru_phon.py`. Corriger la syllabe tonique dans la source puis régénérer les quatre guides latins. |
| `pi` | is-slie-dò-va-ni-ie dlì-las diè-sit liet | Corriger la règle ou la translittération source puis régénérer via `ru_phon.py`. Corriger la syllabe tonique dans la source puis régénérer les quatre guides latins. |

### N° 3223 — исследование

**Correction recommandée.** Même accent erroné dans l’entrée lexicale исследование : accent attendu иссле́дование.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `py` | ees-slye-DO-va-nee-yeh | Corriger la règle ou la translittération source puis régénérer via `ru_phon.py`. Corriger la source phonétique commune et régénérer les guides latins. |
| `pf` | is-sliè-DO-va-ni-yè | Corriger la règle ou la translittération source puis régénérer via `ru_phon.py`. Corriger la source phonétique commune et régénérer les guides latins. |
| `ps` | is-slie-dó-va-ni-ye | Corriger la règle ou la translittération source puis régénérer via `ru_phon.py`. Corriger la source phonétique commune et régénérer les guides latins. |
| `pi` | is-slie-dò-va-ni-ie | Corriger la règle ou la translittération source puis régénérer via `ru_phon.py`. Corriger la source phonétique commune et régénérer les guides latins. |

## L8

### N° 3773 — Это вырвано из контекста.

**Correction recommandée.** La carte indique une citation arrachée à son contexte ; 맥락에서 벗어난 얘기 peut être compris comme un propos hors sujet.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `kom` | 그건 맥락에서 벗어난 얘기예요. | 맥락을 무시하고 인용한 말이에요. / 문맥에서 떼어 낸 말이에요. |

## L9

### N° 4122 — Я сделал это не нарочно.

**Correction recommandée.** Dans нарочно, la prononciation usuelle du groupe чн est [шн] ; les guides font entendre une affriquée ч.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `py` | yah ZDYE-lal E-tah nee na-ROCH-nah | Corriger la règle ou la translittération source puis régénérer via `ru_phon.py`. Corriger ce traitement lexical dans la source ou le générateur puis régénérer les quatre guides latins, sans remplacement manuel. |
| `pf` | ya ZDIÈ-lal È-ta ni na-ROTCH-na | Corriger la règle ou la translittération source puis régénérer via `ru_phon.py`. Corriger ce traitement lexical dans la source ou le générateur puis régénérer les quatre guides latins, sans remplacement manuel. |
| `ps` | ya sdié-lal é-ta ni na-róch-na | Corriger la règle ou la translittération source puis régénérer via `ru_phon.py`. Corriger ce traitement lexical dans la source ou le générateur puis régénérer les quatre guides latins, sans remplacement manuel. |
| `pi` | ia sdiè-lal è-ta ni na-ròci-na | Corriger la règle ou la translittération source puis régénérer via `ru_phon.py`. Corriger ce traitement lexical dans la source ou le générateur puis régénérer les quatre guides latins, sans remplacement manuel. |

### N° 4195 — Появятся новые, о которых мы пока не знаем.

**À arbitrer.** Le russe dit seulement « de nouveaux apparaîtront » sans nom, mais les traductions japonaise et coréenne spécifient de nouveaux métiers.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `t` | Появятся новые, о которых мы пока не знаем. | Confirmer le contexte des métiers ; si la carte doit être autonome, expliciter профессии dans le texte russe et aligner les sept traductions. |
| `jam` | まだ知らない新しい職業が生まれるでしょう。 | Confirmer le contexte des métiers ; si la carte doit être autonome, expliciter профессии dans le texte russe et aligner les sept traductions. |
| `kom` | 아직 모르는 새로운 직업이 생길 거예요. | Confirmer le contexte des métiers ; si la carte doit être autonome, expliciter профессии dans le texte russe et aligner les sept traductions. |

## L10

### N° 4330 — вспыльчивый

**Correction recommandée.** 성급한 décrit surtout la précipitation ou l’impatience ; вспыльчивый décrit quelqu’un qui se met facilement en colère.

| Champ | Valeur actuelle | Proposition / action |
|---|---|---|
| `kom` | 성급한 | 쉽게 화를 내는 / 욱하는 |
