# Types de contenu — fr-ko

Classification candidate, sans modification du catalogue, des niveaux source, des droits ou des phonétiques.

`reviewed` signifie décision éditoriale inspectée pour la carte citée ; ce n’est ni une relecture native ni une certification de la méthode phonétique. Les autres décisions sont des candidates à règles explicites. Une réserve `review` reste à décider avant de présenter sa carte comme une phrase entière.

Une réplique peut être brève : Oui, Non, Bonjour, Merci sont autonomes dans leur échange. À l’inverse, un point final ne prouve pas qu’un nom ou un suffixe soit une phrase. `cat` et `pedagogicalStatus` sont conservés comme diagnostics et ne constituent jamais seuls la preuve du type.

| Niveau source | Cartes | utterance | vocabulary | number | incomplete | review |
|---|---:|---:|---:|---:|---:|---:|
| L1 | 287 | 84 | 181 | 4 | 18 | 0 |
| L2 | 462 | 356 | 86 | 5 | 14 | 1 |
| L3 | 556 | 382 | 161 | 7 | 5 | 1 |
| L4 | 606 | 391 | 204 | 6 | 5 | 0 |
| L5 | 704 | 468 | 220 | 6 | 10 | 0 |
| L6 | 459 | 396 | 52 | 0 | 11 | 0 |
| L7 | 527 | 479 | 39 | 2 | 6 | 1 |
| L8 | 404 | 335 | 62 | 1 | 4 | 2 |
| L9 | 242 | 186 | 52 | 1 | 3 | 0 |
| L10 | 273 | 212 | 55 | 0 | 6 | 0 |
| Total | 4520 | 3289 | 1112 | 32 | 82 | 5 |

## Cas inspectés

- `0` — 아니요. / Non. → `utterance`. Formule entière de réponse, salutation, instruction ou politesse ; conserver les répliques brèves autonomes.
- `1` — 네. / Oui. → `utterance`. Formule entière de réponse, salutation, instruction ou politesse ; conserver les répliques brèves autonomes.
- `2` — 감사합니다. / Merci. → `utterance`. Formule entière de réponse, salutation, instruction ou politesse ; conserver les répliques brèves autonomes.
- `3` — 미안해요. / Désolé. → `utterance`. Formule entière de réponse, salutation, instruction ou politesse ; conserver les répliques brèves autonomes.
- `4` — 안녕하세요! / Bonjour ! → `utterance`. Formule entière de réponse, salutation, instruction ou politesse ; conserver les répliques brèves autonomes.
- `5` — 안녕하세요! / Bonsoir ! → `utterance`. Formule entière de réponse, salutation, instruction ou politesse ; conserver les répliques brèves autonomes.
- `6` — 보세요. / Regardez. → `utterance`. Formule entière de réponse, salutation, instruction ou politesse ; conserver les répliques brèves autonomes.
- `7` — 가요. / Allons-y. → `utterance`. Formule entière de réponse, salutation, instruction ou politesse ; conserver les répliques brèves autonomes.
- `8` — 환영해요! / Bienvenue ! → `utterance`. Formule entière de réponse, salutation, instruction ou politesse ; conserver les répliques brèves autonomes.
- `2138` — 글쎄요… / Eh bien… → `utterance`. 글쎄요… est une réponse d’hésitation lexicalisée ; les points ne sont pas un trou de substitution.
- `2154` — 영화는 좋았는데 방이 시끄러웠어요. / Le film était bien ; par contre, la salle était bruyante. → `utterance`. Deux propositions complètes malgré cat:vocab et pedagogicalStatus:fragment ; ce n’est pas un mot isolé.
- `2213` — 큰 / grand → `vocabulary`. 큰 est la forme adjectivale adnominale de « grand » ; brique lexicale à rattacher à un nom, jamais une phrase autonome.
- `2214` — 작은 / petit → `vocabulary`. 작은 est la forme adjectivale adnominale de « petit » ; la carte fournit une brique lexicale, pas une réplique complète.
- `2352` — 진짜예요? / Sérieux ? → `utterance`. 진짜예요? est une question de réaction entière (« Sérieux ? »), malgré son étiquette vocab.
- `2215` — 새로운 / nouveau → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2216` — 오래된 / vieux → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2217` — 쉬운 / facile → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2218` — 어려운 / difficile → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2219` — 빠른 / rapide → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2220` — 느린 / lent → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2221` — 깨끗한 / propre → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2222` — 더러운 / sale → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2223` — 가득 찬 / plein → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2224` — 빈 / vide → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2225` — 비싼 / cher → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2226` — 무거운 / lourd → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2227` — 가벼운 / léger → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2228` — 긴 / long → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2229` — 짧은 / court → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2230` — 강한 / fort → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2231` — 약한 / faible → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2232` — 같은 / pareil → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2233` — 다른 / différent → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2234` — 자주 / souvent → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2235` — 가끔 / parfois → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2236` — 드물게 / rarement → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2237` — 누구 / qui → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2238` — 뭐 / quoi → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2239` — 어디 / où → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2240` — 언제 / quand → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2241` — 왜 / pourquoi → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2242` — 어떻게 / comment → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2243` — 어느 / quel → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2244` — 얼마나 / combien → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2245` — 더 / plus → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2246` — 덜 / moins → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2247` — 충분히 / assez → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2248` — 아주 / tellement → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2249` — 위에 / sur → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2250` — 아래에 / sous → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2251` — 안에 / dans → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2252` — 앞에 / devant → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2253` — 뒤에 / derrière → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2254` — 사이에 / entre → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2255` — 안에서 / dedans → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2256` — 밖에서 / dehors → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2257` — 어디에나 / partout → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2258` — 그다음에 / ensuite → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2259` — 후에 / après → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2260` — 전에 / avant → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2261` — 동안 / pendant → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2262` — 부터 / depuis → `incomplete`. 부터 est ici la particule liée « depuis » ; il manque le complément auquel elle s’attache.
- `2263` — 이미 / déjà → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2264` — 아직 / encore → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2265` — 드디어 / enfin → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2266` — 재미있는 / intéressant → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2267` — 지루한 / ennuyeux → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2268` — 유용한 / utile → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2269` — 쓸모없는 / inutile → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2270` — 위험한 / dangereux → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2271` — 안전한 / sûr → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2272` — 중요한 / important → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2273` — 이상한 / étrange → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2274` — 보통의 / normal → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2275` — 유명한 / célèbre → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2276` — 인기 있는 / populaire → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2277` — 간단한 / simple → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2278` — 복잡한 / compliqué → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2279` — 진지한 / sérieux → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2280` — 웃긴 / drôle → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2281` — 희한한 / bizarre → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2282` — 믿을 수 없는 / incroyable → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2283` — 끔찍한 / terrible → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2284` — 편안한 / confortable → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2285` — 필요한 / nécessaire → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2286` — 반짝이는 / brillant → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2287` — 무광의 / mat → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2288` — 밝은 / clair → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2289` — 선명한 / vif → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2290` — 연한 / pâle → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2291` — 여러 개의 / plusieurs → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2292` — 딱딱한 / dur → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2293` — 꽉 끼는 / serré → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2294` — 넓은 / large → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2295` — 가는 / fin → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2296` — 깊은 / profond → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2297` — 평평한 / plat → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2298` — 둥근 / rond → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2299` — 곧은 / droit → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2300` — 헐렁한 / lâche → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2301` — 질투하는 / jaloux → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2302` — 민망한 / gêné → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2303` — 실망한 / déçu → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2304` — 고마워하는 / reconnaissant → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2305` — 긴장한 / nerveux → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2306` — 미안해하는 / coupable → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2307` — 혼자 / seul → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2308` — 호기심 많은 / curieux → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2309` — 벅찬 / dépassé → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2310` — 만족한 / satisfait → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2311` — 못 기다리는 / impatient → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2312` — 곧 / bientôt → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2313` — 최근에 / récemment → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2314` — 하지만 / cependant → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2315` — 그런데도 / pourtant → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2316` — 그래서 / donc → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2317` — 한마디로 / bref → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2318` — 그럼에도 / néanmoins → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2319` — 미혼 / célibataire → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2320` — 하나 / un → `number`. Liste inspectée : cette carte donne un nombre ou ordinal seul, à séparer des phrases qui l’emploient.
- `2321` — 둘 / deux → `number`. Liste inspectée : cette carte donne un nombre ou ordinal seul, à séparer des phrases qui l’emploient.
- `2322` — 셋 / trois → `number`. Liste inspectée : cette carte donne un nombre ou ordinal seul, à séparer des phrases qui l’emploient.
- `2323` — 첫 번째 / premier → `number`. Liste inspectée : cette carte donne un nombre ou ordinal seul, à séparer des phrases qui l’emploient.
- `2324` — 집 / la maison → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2325` — 문 / la porte → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2326` — 방 / la chambre → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2327` — 할머니 / la grand-mère → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2328` — 여름 / l'été → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2329` — 공기 / l'air → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2330` — 지구 / la Terre → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2331` — 머리 / la tête → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2332` — 손 / la main → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2333` — 피 / le sang → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2334` — 아내 / la femme → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2335` — 아기 / un bébé → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2336` — 아이 / un enfant → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2337` — 남자 / un homme → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2338` — 여자 / une femme → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2339` — 여자아이 / une fille → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2340` — 자동차 / la voiture → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2341` — 물 / l'eau → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2342` — 먼저 / d'abord → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2343` — 할아버지 / le grand-père → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2344` — 손자 / le petit-fils → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2345` — 손녀 / la petite-fille → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2346` — 아기 / un tout-petit → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `2347` — 사람들 / les gens → `vocabulary`. Liste lexicale inspectée : la carte présente un mot ou groupe de mots dans son sens de dictionnaire, pas une réplique située.
- `139` — 오늘 아침 / ce matin → `vocabulary`. 오늘 아침 est le repère lexical « ce matin », sans phrase source qui l’emploie.
- `173` — 오늘 오후 / cet après-midi → `vocabulary`. 오늘 오후 est le repère lexical « cet après-midi », pas une assertion complète.
- `258` — 여기저기 / ici et là → `vocabulary`. 여기저기 est l’adverbe « ici et là » dans son sens lexical.
- `274` — 다시 말하면 / c'est-à-dire → `vocabulary`. 다시 말하면 est présenté comme le connecteur « c’est-à-dire » ; le lot n’invente pas la proposition qu’il pourrait introduire.
- `275` — 올해 / cette année → `vocabulary`. 올해 est le repère lexical « cette année ».
- `287` — 너무 많이 / trop de → `incomplete`. Le sens « trop de » attend ce qui est quantifié ; la carte ne constitue pas à elle seule une phrase de quantité.
- `325` — 어머나! / Oh là là ! → `utterance`. 어머나! est une interjection entière (« Oh là là ! »), pas un nom de vocabulaire.
- `369` — 조만간 / tôt ou tard → `vocabulary`. 조만간 est une locution temporelle dans son sens lexical, sans assertion source.
- `384` — 아침 일찍 / tôt le matin → `vocabulary`. 아침 일찍 est le groupe adverbial « tôt le matin ».
- `409` — 메리 크리스마스! / Joyeux Noël ! → `utterance`. 메리 크리스마스! est le souhait entier « Joyeux Noël ! ».
- `474` — 우리 가족 모두 / toute ma famille → `vocabulary`. 우리 가족 모두 est le groupe nominal « toute ma famille », pas une assertion de présentation.
- `503` — 점점 더 / de plus en plus → `vocabulary`. 점점 더 est le groupe adverbial « de plus en plus », sans assertion source.
- `1291` — 문에서 문까지 / porte à porte → `vocabulary`. 문에서 문까지 est une locution de trajet (« porte à porte »), pas une phrase source autonome.
- `1317` — 만큼 / autant que → `incomplete`. 만큼 est un terme de comparaison lié à une référence ; le sens « autant que » ne fournit pas les termes comparés.
- `1827` — 하자마자 / dès que → `incomplete`. 하자마자 est ici le cadre temporel « dès que » ; le contenu de l’enchaînement n’est pas donné.
- `1937` — 가능한 한 빨리 / dès que possible → `vocabulary`. 가능한 한 빨리 est le groupe adverbial « dès que possible », sans assertion source.
- `2131` — 오늘 저녁 / ce soir → `vocabulary`. 오늘 저녁 est le repère lexical « ce soir ».
- `2168` — 대박! / Génial ! → `utterance`. 대박! est une réaction entière (« Génial ! »).
- `2212` — 인터넷 / internet → `vocabulary`. 인터넷 nomme Internet ; ce n’est pas une assertion complète.
- `3797` — 이전 메일에서 말씀드린 대로. / Comme indiqué dans mon précédent message. → `incomplete`. La reprise « Comme indiqué dans mon précédent message » annonce un contenu ; aucun contenu n’est fourni dans cette carte.
- `3898` — 배송비 포함 / frais de port inclus → `vocabulary`. 배송비 포함 est le groupe nominal commercial « frais de port inclus », sans réplique source située.
- `3918` — 온수 수도꼭지. / Le robinet d'eau chaude. → `vocabulary`. 온수 수도꼭지. nomme « le robinet d’eau chaude » ; le point final ne transforme pas ce nom en phrase.
- `3921` — 발송 전 잔금. / Le solde avant expédition. → `vocabulary`. 발송 전 잔금. est le groupe nominal « le solde avant expédition », malgré son point final.
- `3954` — 폭설 / de fortes chutes de neige → `vocabulary`. 폭설 nomme de fortes chutes de neige, sans assertion source.
- `4447` — 예의와 노하우. / Savoir-vivre et savoir-faire. → `vocabulary`. 예의와 노하우. coordonne deux notions lexicales ; le point final ne fournit pas de prédication.
- `4460` — 귀찮아하다. / Avoir la flemme. → `vocabulary`. 귀찮아하다. est présenté dans son sens de dictionnaire (« avoir la flemme »), pas comme une réplique conjuguée.
- `2408` — 오래전에 / il y a longtemps → `vocabulary`. 오래전에 est le repère lexical « il y a longtemps », sans assertion source.
- `3569` — 첫눈에 반하다. / Avoir le coup de foudre. → `vocabulary`. 첫눈에 반하다. est l’expression donnée au dictionnaire « avoir le coup de foudre » ; la forme en 다 ne désigne pas ici une prise de parole située.
- `3620` — 미용실에서. / Chez le coiffeur. → `vocabulary`. 미용실에서. est le groupe locatif « chez le coiffeur » ; le point final ne fournit pas d’assertion.
- `3706` — 몇 개 / quelques-uns → `vocabulary`. 몇 개 fournit l’expression de quantité « quelques-uns », pas une phrase qui emploie cette quantité.
- `3728` — 자유, 평등, 박애. / La liberté, l'égalité, la fraternité. → `vocabulary`. 자유, 평등, 박애. est une coordination de notions (« liberté, égalité, fraternité »), conservée dans le lexique culturel.
- `3754` — 물방울무늬의 / à pois → `vocabulary`. 물방울무늬의 est le qualificatif de motif « à pois », lié au nom qu’il peut décrire.
- `3789` — 요즘 / ces jours-ci → `vocabulary`. 요즘 est le repère lexical « ces jours-ci ».
- `3927` — 면세 / hors taxes → `vocabulary`. 면세 est le terme commercial « hors taxes », sans phrase source.
- `4153` — 그동안에 / entre-temps → `vocabulary`. 그동안에 est la locution adverbiale « entre-temps ».
- `4211` — 지금까지 / jusqu'à présent → `vocabulary`. 지금까지 est le repère lexical « jusqu’à présent ».
- `4219` — 채식주의자 / végétarien → `vocabulary`. 채식주의자 est le nom « végétarien », sans phrase de présentation source.
- `4223` — 체크무늬의 / à carreaux → `vocabulary`. 체크무늬의 est le qualificatif de motif « à carreaux », lié au nom qu’il peut décrire.
- `4328` — 방수 / imperméable → `vocabulary`. 방수 nomme la propriété « imperméable », sans assertion source.
- `4344` — 협상 가능 / négociable → `vocabulary`. 협상 가능 est le qualificatif commercial « négociable », sans réplique source située.
- `4357` — 레어로 / saignant → `vocabulary`. 레어로 est l’indication de cuisson « saignant » ; la carte fournit le groupe lexical, sans en inventer une demande complète.
- `4373` — 셀카. / Un selfie. → `vocabulary`. 셀카. nomme « un selfie » ; son point final ne suffit pas à en faire une assertion.
- `4499` — 냉동 / surgelé → `vocabulary`. 냉동 nomme la propriété « surgelé », sans phrase source.
- `4282` — 까지 / jusqu'à → `incomplete`. 까지 est ici la particule liée « jusqu’à » ; il manque le repère auquel elle s’attache.
- `452` — 이거 어떻게 말해요? / Comment on dit... ? → `utterance`. 이거 어떻게 말해요? demande « comment dit-on ceci ? » avec 이거 déjà présent ; l’ellipse de la traduction française ne rend pas la question coréenne incomplète.
- `1806` — 답변 기다리겠습니다. / Dans l'attente de votre réponse... → `utterance`. 답변 기다리겠습니다. est une formule coréenne entière d’attente de réponse ; l’ellipse de la traduction française n’ajoute aucun trou à la forme apprise.
- `2184` — 에서 멀리 / loin de → `incomplete`. 에서 멀리 commence par la particule de provenance/repère 에서 sans son support ; une forme de comparaison complète n’est pas fournie.
- `2100` — 보다 더 / plus que → `incomplete`. 보다 더 laisse vide le terme auquel la comparaison se rapporte ; ce n’est pas la forme adjectivale entière d’un simple mot.
- `2124` — 보다 나은 / mieux que → `incomplete`. 보다 나은 laisse vide la référence devant 보다 ; ne pas confondre ce schéma ouvert avec 큰/작은, formes adnominales lexicales entières.
- `2132` — 보다 적게 / moins que → `incomplete`. 보다 적게 attend le terme comparé avant 보다 ; le cadre reste ouvert.
- `2163` — 와 같은 것 / le même que → `incomplete`. 와 같은 것 attend le terme précédant la particule 와 ; aucun référent n’est donné.
- `2201` — 보다 큰 / plus grand que → `incomplete`. 보다 큰 attend une référence devant 보다 ; 큰 seul est un adjectif adnominal complet, mais ce cadre comparatif-ci est ouvert.
- `2361` — 보다 나쁜 / pire que → `incomplete`. 보다 나쁜 attend une référence avant 보다 ; ne pas le présenter comme le mot autonome « mauvais ».
- `3221` — 한 잔의 / une tasse de → `incomplete`. 한 잔의 est une mesure suivie de 의 sans contenu ; le complément de « une tasse de… » est absent.
- `2495` — 절반 / la moitié → `number`. Fraction isolée entière de valeur 1/2. Le mot/groupe natif et sa phonétique source sont conservés ; la valeur décimale ne sert qu’au tri et la fraction exacte reste déclarée.
- `3291` — 사분의 일 / un quart → `number`. Fraction isolée entière de valeur 1/4. Le mot/groupe natif et sa phonétique source sont conservés ; la valeur décimale ne sert qu’au tri et la fraction exacte reste déclarée.
- `3645` — 삼분의 일 / un tiers → `number`. Fraction isolée entière de valeur 1/3. Le mot/groupe natif et sa phonétique source sont conservés ; la valeur décimale ne sert qu’au tri et la fraction exacte reste déclarée.
- `3341` — 열두 개 / une douzaine → `number`. Quantité collective entière de douze éléments, exactement 12 et non une approximation. Le compteur/nom d’unité natif est gardé dans la forme source, sans découper sa phonétique.
- `3926` — 열 개쯤 / une dizaine → `number`. Quantité entière « environ dix éléments » : le marqueur d’approximation de la cible est conservé. Ce choix ne signifie pas que toute « dizaine » française soit approximative.

## Limites

Les finales natives et le sens source évitent de confondre les listes lexicales avec les phrases finies. Les réponses elliptiques et les formes liées sans marqueur explicite restent le point à revoir. Aucun nombre situé dans une phrase n’est extrait ni reconstruit. Les 56 cartes `basics` contiennent aussi couleurs et dates : cette catégorie ne signifie pas « nombre ». Les champs phonétiques restent intégralement dans leur source ; le présent lot ne les calcule pas.

Les comptes ci-dessus suivent `lv` source, pas le reclassement éditorial candidat. Le builder doit calculer les comptes par niveau éditorial après avoir joint les décisions par `sourceIndex`.

Empreinte canonique du deck : `70028fcae72af8097859a48ad92c3c3fc3489a36e98844baecc4508b07a58e61`.

## Réserves conservées

Ces cartes restent hors d’une certification de phrase entière tant que leur fonction dans une scène n’est pas tranchée.

| Index | Forme étudiée | Sens source |
|---:|---|---|
| 539 | 진입 금지 | sens interdit |
| 2373 | 내 사랑. | Mon cœur. |
| 3552 | 바짝 익혀서 | bien cuit |
| 3600 | 취급 주의. | Manipuler avec soin. |
| 3727 | 합의한 대로. | Comme convenu. |

## Sous-familles lexicales

Ces trois familles décrivent la forme native et son usage source, pas une traduction grammaticale automatique depuis le français. Une phrase prédicative reste `utterance`. Un suffixe sans support reste `incomplete`, jamais un mot-préposition autonome.

`preposition` est une famille de repères relationnels : en japonais/coréen, les formes retenues sont surtout des groupes nominaux avec particule. Cette clé technique ne prétend pas que ces langues utilisent les prépositions françaises. Les noms de couleur et de temps ne deviennent pas automatiquement adjectifs/adverbes. `uncertain` réserve la sous-famille sans forcer une analyse.

| Niveau source | adjective | preposition | adverb | color | other | uncertain |
|---|---:|---:|---:|---:|---:|---:|
| L1 | 66 | 9 | 16 | 0 | 63 | 27 |
| L2 | 9 | 3 | 3 | 2 | 61 | 8 |
| L3 | 1 | 1 | 1 | 5 | 145 | 8 |
| L4 | 1 | 0 | 0 | 3 | 195 | 5 |
| L5 | 1 | 1 | 0 | 5 | 213 | 0 |
| L6 | 1 | 0 | 0 | 0 | 46 | 5 |
| L7 | 0 | 0 | 0 | 0 | 35 | 4 |
| L8 | 0 | 0 | 0 | 0 | 60 | 2 |
| L9 | 0 | 0 | 0 | 0 | 49 | 3 |
| L10 | 0 | 1 | 0 | 0 | 48 | 6 |
| Total | 79 | 15 | 20 | 15 | 915 | 68 |

La présence d’une famille à chaque niveau ne se déduit pas de cette table. Le builder ne doit pas remplir un thème vide avec une forme liée ou une phrase dupliquée. Codex porte la revue sémantique et pédagogique ; Claude vérifie uniquement les phonétiques. Les couleurs ont leur classe autonome `color`, et les formes adnominales coréennes entières portent leur condition d’usage avec un nom.

Exemple décisif : `DECKS.ko[2617]` contient `이` au sens de « les dents » ; il s’agit d’un nom, pas de la particule sujet homographe. Une table de particules sans lecture du sens aurait produit un classement faux.

## Correction ciblée du support sac

`DECKS.ko[2440]` — 가방 / le sac : `vocab-voyage`, avec raison inspectée dans la partition. Le mot entier, ses aides, son niveau source et son type lexical restent intacts. Hors des 140 mots et 560 usages protégés ; aucune phrase ni aucun droit déplacé.
