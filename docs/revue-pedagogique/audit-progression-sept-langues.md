# Audit de la progression L1→L10 dans les sept couples actifs

Objet : vérification du dossier `bcd108d` sur `review/progression-complete`. Plutôt que de relire les conclusions de Codex, j'ai **mesuré indépendamment les 70 cases** à partir des seuls contenus réels — les 110 fichiers de conversation et les 32 115 entrées du catalogue. Les quatre questions posées sont toutes mesurables ; les chiffres ci-dessous viennent de mes propres scripts, pas des siens.

Rien n'est fusionné ni publié. Périmètre mesuré : 7 couples actifs, 841 unités, 3 364 variantes, 210 dialogues.

## Verdict

**La progression existe réellement et elle va dans le bon sens.** Ce n'est pas rien à dire : la part de matière inédite décroît de 100 % en L1 à 15–38 % en L10 selon la langue, et la longueur des phrases croît. Le reproche de l'audit précédent — « le même numéro recouvre des acquis différents » — valait pour le parcours guidé et les familles, pas pour le contenu conversation, qui est, lui, construit en escalier.

**Trois défauts systématiques, présents dans les sept langues à la fois**, et un quatrième qui décide de votre week-end :

1. **L7 est plus difficile que L8** dans les sept couples sans exception.
2. **Le remplacement s'appuie sur un élément préparé dans 2 % des unités seulement**, si l'on exige une carte dédiée comme le faisait le pilote chinois pour 回家.
3. **fr→it est nettement le couple le moins préparé** des quatre à découpage comparable.
4. **Aucun dialogue L1 n'est atteignable** depuis les unités L1, dans les sept langues — et c'est exactement ce que la publicité a besoin de montrer.

Le point 4 se répare avant le week-end, et la réparation est la même dans les sept langues. C'est l'objet du § 6.

## 1. Méthode et limites de mesure

Une « brique » est un jeton : un mot pour les langues latines, un caractère pour zh, ja, ko. Une brique est dite **préparée** à un niveau N si elle apparaît dans le contenu conversation des niveaux antérieurs du même couple, ou dans une carte du catalogue de niveau ≤ N.

Deux limites, à garder en tête avant de citer un chiffre :

- **Les pourcentages des langues à caractères ne sont pas comparables à ceux des langues à mots.** 안녕하세요 compte cinq briques et « hello » une seule. Les comparaisons entre niveaux d'une même langue sont valides ; entre fr→ko et fr→en, non. Je ne compare donc que des couples à découpage identique.
- **Le découpage par jetons ignore la grammaire.** Un verbe conjugué pour la première fois dans une forme déjà rencontrée au présent passe pour « préparé ». Mes chiffres sont donc des **minorants** de la difficulté réelle, et un relevé linguistique comme celui de Codex reste nécessaire par-dessus.

Scripts dans mon espace de travail, reproductibles sur demande ; ils ne lisent le dépôt qu'en lecture et n'écrivent rien.

## 2. Question 1 — progression réelle et sauts de difficulté

Part de briques inédites par niveau, et longueur moyenne des phrases :

| Couple | L1 | L2 | L3 | L4 | L5 | L6 | L7 | L8 | L9 | L10 |
|---|---|---|---|---|---|---|---|---|---|---|
| fr→en | 100 % | 74 | 61 | 68 | 53 | 34 | 42 | 50 | 35 | 36 |
| fr→es | 100 % | 80 | 61 | 64 | 62 | 50 | 36 | 47 | 42 | 38 |
| fr→zh | 100 % | 55 | 42 | 49 | 29 | 23 | 25 | 34 | 29 | 20 |
| fr→it | 100 % | 79 | 62 | 63 | 64 | 46 | 47 | 49 | 38 | 31 |
| fr→ja | 100 % | 52 | 39 | 38 | 34 | 19 | 22 | 30 | 20 | 17 |
| fr→ko | 100 % | 51 | 44 | 30 | 37 | 16 | 25 | 26 | 14 | 15 |
| zh→fr | 100 % | 73 | 61 | 57 | 50 | 37 | 47 | 43 | 37 | 32 |

La décroissance est nette partout. Mais la courbe n'est pas monotone, et les ruptures se répètent d'une langue à l'autre :

**a. L7 est plus long que L8 dans les sept couples.** Longueur moyenne L6 → L7 → L8 :

| Couple | L6 | **L7** | L8 |
|---|---|---|---|
| fr→en | 7,0 | **8,4** | 7,9 |
| fr→es | 5,2 | **6,7** | 5,8 |
| fr→zh | 7,8 | **9,6** | 9,2 |
| fr→it | 5,4 | **6,4** | 5,9 |
| fr→ja | 11,2 | **13,9** | 12,9 |
| fr→ko | 8,8 | **12,5** | 11,5 |
| zh→fr | 5,6 | **8,1** | 7,6 |

Sept sur sept, sans exception, et la part de briques inédites remonte aussi en L7 dans six couples sur sept. **L7 est donc un pic, pas une marche** : l'apprenant y rencontre les phrases les plus longues du parcours, puis redescend. Le coréen est le cas extrême : +42 % de longueur en un niveau (8,8 → 12,5). Une régularité aussi exacte dans sept langues n'est pas un hasard de rédaction, c'est la définition du niveau L7 dans la matrice qu'il faut regarder.

**b. L3 est plus court que L2** dans cinq couples (es 4,4→3,5 ; it 4,2→3,4 ; ja 10,0→9,0 ; ko 7,2→6,7 ; zh→fr 5,5→4,5). Le niveau 2 introduit donc des phrases plus longues que le niveau 3, ce qui inverse l'escalier sur deux marches.

**c. L4 rompt la décroissance des briques inédites** : en, es, it, zh→fr et ja remontent tous de L3 à L4 (en 61→68, zh 42→49, es 61→64). Combiné au point b, cela fait de L2–L4 une zone en dents de scie.

Aucun de ces trois points ne dit que le contenu est mauvais ; ils disent que **l'ordre des niveaux 2 à 4 et la définition de L7 méritent une passe**, et que les corriger profite aux sept langues d'un coup puisque la cause est dans la matrice commune.

## 3. Question 2 — les substitutions permettent-elles de construire ?

C'est la question la plus importante et celle où le chiffre dépend entièrement du critère. J'en donne deux, explicitement, pour qu'on ne me fasse pas dire plus que ce que j'ai mesuré.

**Borne haute — « l'élément remplacé est préparable comme brique ».** Le critère est celui du pilote chinois : l'élément existe en entier comme carte du catalogue au niveau ≤ N, donc avec sa propre phonétique et son oreille.

> **823 unités sur 841, soit 98 %, n'ont pas de carte dédiée pour au moins un de leurs éléments de remplacement.**

**Borne basse — « les morceaux ont déjà été rencontrés ».** Chaque jeton de l'élément a été vu avant, dans le contenu antérieur ou dans une carte de niveau ≤ N. Noms propres exclus.

> **323 unités sur 841, soit 38 %, introduisent au moins un jeton jamais rencontré.**

| Niveau | Unités avec un jeton inédit |
|---|---|
| L1 | 70/77 — **91 %** |
| L2 | 48/84 — 57 % |
| L3 | 32/83 — 39 % |
| **L4** | **39/85 — 46 %** |
| L5 | 21/85 — 25 % |
| L6 | 25/84 — 30 % |
| L7 | 26/86 — 30 % |
| L8 | 25/84 — 30 % |
| L9 | 16/86 — 19 % |
| L10 | 21/87 — 24 % |

Et par couple, parmi les quatre à découpage par mots : fr→es 56 %, fr→en 55 %, zh→fr 43 %, fr→it 42 %. Les trois couples à caractères sont plus bas (fr→ja 30 %, fr→zh 20 %, fr→ko 19 %) pour une raison mécanique : les caractères se réemploient davantage que les mots.

**Trois conclusions.**

- **Le chiffre de L1 (91 %) n'est pas alarmant**, et il faut le dire franchement : les éléments inédits y sont des noms propres (Paul, Lin, Ana) et des internationalismes transparents (taxi, metro, hotel, wifi, sandwich, café). Un francophone n'a besoin d'aucune préparation pour « a taxi ». La substitution L1 fonctionne.
- **L4 est le vrai point noir** : 46 %, en rupture avec les 39 % de L3 et les 25 % de L5. C'est le même L4 qui remonte en briques inédites au § 2c. Deux mesures indépendantes désignent le même niveau.
- **La borne haute, 98 %, a une conséquence structurelle qu'il faut nommer** : la méthode du pilote chinois — préparer 回家 par sa carte autonome avant de l'employer — **n'est pas généralisable en l'état**, parce que la carte dédiée n'existe pas pour 98 % des éléments. Soit on accepte que « préparer » veuille dire « les morceaux ont déjà été rencontrés » (borne basse), soit il faut créer des cartes de briques, ce qui est un chantier de contenu considérable. C'est une décision de méthode, et elle vous revient : elle définit ce que « élément préparé » signifie dans votre promesse.

## 4. Question 3 — répliques reçues, dialogues, réemploi

Part de briques non préparées par dialogue, moyenne par niveau :

| Couple | L1 | L2 | L3 | L4 | L5 | L6 | L7 | L8 | L9 | L10 |
|---|---|---|---|---|---|---|---|---|---|---|
| fr→en | 100 % | 73 | 49 | 44 | 42 | 24 | 32 | 37 | 27 | 27 |
| fr→es | 100 % | 76 | 56 | 41 | 50 | 40 | 30 | 40 | 30 | 24 |
| fr→it | 100 % | 72 | 62 | 52 | 56 | 43 | 41 | **53** | 33 | 38 |
| zh→fr | 100 % | 66 | 55 | 39 | 39 | 34 | 33 | 38 | 30 | 24 |
| fr→zh | 100 % | 55 | 43 | 36 | 29 | 21 | 28 | 25 | 17 | 14 |
| fr→ja | 100 % | 39 | 28 | 23 | 20 | 17 | 17 | 15 | 10 | 13 |
| fr→ko | 100 % | 48 | 37 | 19 | 25 | 13 | 16 | 17 | 13 | 7 |

**fr→it est le couple le moins préparé**, et l'écart est net parmi les quatre comparables : 55 % en moyenne (50 % hors L1), contre 46 % pour fr→en et zh→fr et 49 % pour fr→es. Le bloc L8 est le pire du dossier entier — `L8-fr-it-d1` « Au marché aux puces : négocier » 54 %, `L8-fr-it-d2` « Chez la propriétaire » 52 %, `L8-fr-it-d3` « Au travail : demander un délai » 53 %. J'ai testé l'hypothèse d'un effet de registre, le vouvoiement *Lei* étant introduit sans préparation : **elle est fausse** — 50 % pour les scènes *Lei* contre 48 % pour les scènes *tu*. Le défaut italien est uniforme, pas lié au registre. C'est donc la densité lexicale des dialogues italiens qu'il faut reprendre, en priorité sur L8.

**Le réemploi est bien déclaré** : seulement 11 dialogues sur 189 de niveau 2 à 10 ne citent aucun niveau antérieur (fr→ko 3, fr→en 2, fr→ja 2, un chacun ailleurs). Sur ce point le dossier tient, et c'était une des craintes de l'audit précédent.

**En revanche, les 210 dialogues demandent tous à l'apprenant de produire de la matière non préparée.** Le chiffre brut de 100 % est à prendre avec la limite du § 1 — pour le coréen, 안녕하세요 compte cinq caractères inédits et non une expression — mais il est confirmé à la main sur les cas que j'ai ouverts, et il mène directement au point suivant.

## 5. Question 3 bis — aucun dialogue L1 n'est atteignable

C'est le résultat le plus important de l'audit, et sa régularité est frappante. Dans les sept langues, le premier dialogue L1 est la même scène de café avec exactement trois répliques pour l'apprenant, et le même verdict :

| Couple | Réplique 1 | Réplique 2 | Réplique 3 |
|---|---|---|---|
| fr→en | Hello! **✘** | One coffee, please. ✔ | No, thanks. How much is it? **✘** |
| fr→es | ¡Hola! **✘** | Un café, por favor. ✔ | No, gracias. ¿Cuánto cuesta? **✘** |
| fr→zh | 你好！ **✘** | 请给我一杯咖啡。 ✔ | 不用，谢谢。多少钱？ **✘** |
| fr→it | Buongiorno! **✘** | Un caffè, per favore. ✔ | No, grazie. Quanto costa? **✘** |
| fr→ja | こんにちは！ **✘** | コーヒーをお願いします。 ✔ | いいえ、結構です。いくらですか。 **✘** |
| fr→ko | 안녕하세요! **✘** | 커피 하나 주세요. ✔ | 아니요, 괜찮아요. 얼마예요? **✘** |
| zh→fr | Bonjour ! **✘** | Un café, s'il vous plaît. ✔ | Non, merci. Combien ça coûte ? **✘** |

Une seule des trois répliques de l'apprenant est préparée par les unités L1, dans les sept langues. **Il manque toujours les deux mêmes choses : saluer, et refuser poliment.**

Votre objectif — « le L1 doit permettre rapidement un échange réussi et donner envie de poursuivre » — n'est donc pas atteint aujourd'hui, non par manque de contenu, mais parce que les deux expressions les plus fréquentes de toute conversation ne sont pas dans le chemin. Et c'est précisément la petite réussite observable que le dossier lui-même dit vouloir montrer à la publicité.

## 6. Les sept ponts L1 — ce qui est réparable avant le week-end

J'ai vérifié la disponibilité des deux briques manquantes dans les sept catalogues :

| | Salutation | Refus poli | Refus simple |
|---|---|---|---|
| en | `lv1 Hello` ✔ | **absent** | `lv1 No` |
| es | `lv1 Hola` ✔ | **absent** | `lv1 No` |
| zh | `lv1 你好` ✔ | **absent** | `lv1 不用` |
| it | `lv1 Buongiorno` ✔ | **absent** | `lv1 No` |
| ja | `lv1 こんにちは` ✔ | **absent** | **結構です absent** |
| ko | `lv1 안녕하세요` ✔ | **absent** | `lv1 괜찮아요` |
| fr | **`lv2 Bonjour`** | **absent** | `lv1 Merci` |

**Pont 1 — la salutation ne coûte rien.** Elle existe déjà au niveau 1 dans les six langues étudiées. Il suffit de la câbler : une unité L1 « Saluer » de la même forme que les autres, ou une déclaration en réplique reçue puis produite. Aucune phrase à écrire, aucune phonétique à inventer — les aides existantes sont reprises telles quelles, conformément à la règle de conservation.

Une seule exception à traiter : **« Bonjour » est classé `lv2` dans le catalogue français**, alors que c'est la première réplique du dialogue L1 pour les apprenants sinophones de français. À faire passer en `lv1`, ou à déclarer en reçu pour ce couple.

**Pont 2 — le refus poli est la seule vraie phrase à écrire, et il manque dans les sept.** « No, thanks », « No, gracias », « 不用，谢谢 », « No, grazie », « いいえ、結構です », « 아니요, 괜찮아요 », « Non, merci » : aucune n'existe comme carte. Le refus nu existe partout sauf en japonais (結構です absent lui aussi).

C'est donc **sept phrases à rédiger**, avec leur phonétique par lecteur selon votre méthode et une relecture native — pas sept cents. C'est le plus petit lot de contenu nouveau qui débloque le plus : il rend la troisième réplique atteignable dans les sept langues et il donne à l'apprenant le moyen de dire non, qui manque aujourd'hui à tout le parcours.

**Pont 3 — scinder la troisième réplique.** Elle colle deux actes de parole : refuser, puis demander le prix. Or la question du prix **est déjà préparée** (unité `L1-*-10`, « {s} 얼마예요 ? » et ses équivalents). Une fois le refus disponible, en faire deux répliques rend la scène entièrement atteignable sans rien ajouter d'autre.

Avec ces trois ponts, le dialogue L1 du café devient jouable de bout en bout dans les sept langues : saluer, commander, refuser, demander le prix — tout préparé, sauf les répliques du serveur qui restent en compréhension via le contrat `received`. C'est l'échange réussi que vous voulez montrer, et il tient en sept phrases nouvelles.

## 7. Question 4 — thèmes à compléter et phrases nécessaires

Les 30 thèmes proposés par Codex sont pertinents et je n'ai pas de thème à retirer. Ce que mes mesures ajoutent, c'est un ordre de priorité fondé sur le manque constaté plutôt que sur l'éventail des situations :

1. **Refuser, décliner, dire non poliment** — absent des sept catalogues, bloquant dès L1. Priorité absolue.
2. **Saluer et prendre congé** — présent au catalogue, absent du chemin L1. Câblage, pas rédaction.
3. **Le bloc L8 italien** — trois dialogues à 52–54 %, le pire du dossier.
4. **La zone L2–L4**, en dents de scie dans les sept langues, et L4 désigné par deux mesures indépendantes.
5. **La définition de L7**, pic de longueur dans les sept langues.

Deux constats de la relecture précédente restent valables et non traités, et ils touchent les 110 JSON :

- **Registre de `L1-03` en ja et ko** : `{s}をください。` et `{s} 주세요.` sont traduits « Je veux {s} » alors que ce sont des demandes polies ; `L1-09`, `L2-01` et tous les dialogues disent « s'il vous plaît ». Deux couples sur six, même cause morphologique.
- **Divergence phonétique chinoise** : 想 s'écrit `chyang` 170 fois au catalogue et `siang` 24 fois dans le contenu conversation ; 去 vaut `tchu` 155 fois contre `tchü` 77 fois. Chaque corpus est cohérent, les deux se contredisent. La règle de conservation stricte du dossier interdit l'harmonisation silencieuse — elle n'interdit pas de trancher explicitement, et il faut trancher avant que la déclinaison ne fige les deux.

## 8. Recommandation pour le week-end

La publicité a besoin d'une chose : **que la première séance se termine par un échange réussi**, dans la langue que le prospect a choisie. Les mesures disent que c'est hors d'atteinte aujourd'hui et que ça tient à deux expressions.

Je recommande donc de réduire le lot du week-end à ceci, et de ne rien faire d'autre :

1. Rédiger les **sept refus polis** avec phonétique par lecteur, et les faire relire par un locuteur pour chaque langue. C'est le seul contenu nouveau.
2. **Câbler la salutation** dans les unités L1 des sept couples depuis les cartes existantes, et passer « Bonjour » en `lv1` pour zh→fr.
3. **Scinder la troisième réplique** du dialogue L1 du café dans les sept couples.
4. Déclarer les répliques du serveur en **`received`** selon le contrat déjà testé, et vérifier que chaque question reçue a bien une réponse préparée via `answerWith`.

Les points 1 à 4 rendent une scène complète et honnête dans les sept langues. Tout le reste de cet audit — L7, L2–L4, le bloc italien, la question de méthode sur « préparer », le registre ja/ko, la phonétique chinoise — est du travail de fond qui n'a pas à être fait avant lundi et qui serait mal fait dans l'urgence.

Un mot sur le calendrier, puisque vous me demandez de vérifier avant publicité : **la date ne rend pas le contenu prêt, et les mesures ci-dessus ne constituent pas une validation linguistique.** Ce que je peux affirmer, c'est que la progression est réelle et mesurable, que quatre défauts systématiques sont identifiés avec leurs références, et que le plus bloquant est réparable en sept phrases. Ce que je ne peux pas affirmer, c'est le naturel des formulations : les sept refus polis, comme les répliques des serveurs, demandent une relecture native que ni Codex ni moi ne remplaçons.

## 9. Ce que je n'ai pas vérifié

Le naturel et la correction linguistique des 5 276 variantes ; la qualité des voix ; les 4 couples en réserve (en→es, en→zh, en→it, en→ja), hors périmètre des sept actifs ; les 618 phrases candidates de la banque de thèmes, que je n'ai pas évaluées une à une ; la maquette elle-même, que j'ai lue en code sans la parcourir à l'écran. Les mesures de recouvrement de texte sont des signaux éditoriaux, comme le dit le dossier, et non des mesures de compréhension.
