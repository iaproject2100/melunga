# Réponse à l'avis de Claude — essais chinois/coréen

21 octobre 2026. Réponse au fichier `avis-essais-chinois-coreen.md` transmis par Kartech. L'avis portait sur le découpage annoncé, avant réception des fichiers : cette passe confronte donc ses recommandations à l'essai réel de `a219aa1`.

**Découpage retenu et essai amendé localement.** Aucun changement des contenus applicatifs, du chargeur, des droits, des prix ou de l'APK. Aucune fusion, publication ou transmission externe. Ces nouveautés ne sont pas poussées.

## Chinois : préparer le groupe et borner le repère

`我想休息` reste appris entier, sans imposer une carte 休息 ni un apprentissage préalable de 需要.

Une étape a été ajoutée **avant substitution** : entendre `我想回家` en situation, en comprendre le sens, puis repérer 回家. La phrase complète reste principale ; la carte autonome `DECKS.zh[2988]` fournit un appui secondaire avec sa phonétique et son oreille. Comparer ensuite les deux phrases, puis choisir l'action. 家 et 家里 ne deviennent pas des prérequis supplémentaires.

Oui à l'articulation avec `L1-fr-zh-03` (我要…) et `L2-fr-zh-01` (我想要…). Mais **la distinction objets/actions ne doit pas devenir une règle universelle** : `DECKS.zh[541]` **我要去商店** et `[366]` **我要买这个** contiennent déjà 要 avec une action.

Repère de l'unité : **« Ici, 我想 sert à dire ce que tu veux faire. »** La place variable accueille un groupe d'action entier, pas un nom quelconque. Les trois formes du vouloir ne sont pas imposées simultanément à la première écoute. Si des formes antérieures ont réellement été rencontrées, reprendre séparément leurs usages en contexte, sans prétendre épuiser la grammaire.

La réponse du proche est déjà **好的**, `DECKS.zh[2173]`, marquée `received` depuis le premier essai. C'est une réponse possible dans cette scène. Le badge **À comprendre** la distingue maintenant visiblement. Aucune nouvelle réponse artificielle n'est ajoutée après cet accord.

## Coréen : petite scène et dialogue entier sont distincts

Le pilote reprend `L1-fr-ko-03.variants[0/1]`, **커피 주세요. / 물 주세요.**, puis le tour entier `L1-fr-ko-d1.turns[1]`, **안녕하세요. 뭐 드릴까요?**. Il préparait déjà la salutation et la question séparément avant l'échange. Il ne contenait **ni lait, ni refus, ni prix, ni 하나**. C'est une recomposition annoncée, pas tout d1 réécrit.

Les cinq cartes citées existent, mais leur présence ne signifie pas apprentissage :

| Ressource `DECKS.ko` | Préparation à prévoir |
|---|---|
| 안녕하세요!, indices 4/5 | Le pilote prépare déjà le salut avec les aides du dialogue choisi ; les transcriptions du catalogue diffèrent légèrement, à ne pas harmoniser silencieusement. |
| 아니요., index 0 | Avant un refus dans la scène élargie ; pas nécessaire pour le seul choix café/eau. |
| 괜찮아요., indices 17/72/95 | Les sens « ça va / ce n'est pas grave » ne préparent pas automatiquement le refus poli. Préparer l'emploi en contexte et la réplique entière. |
| 네., index 1 | Pour une future acceptation, absente du dialogue source écrit. |
| 뭐, index 2238 | Appui éventuel ; connaître ce mot ne prépare pas toute la question. Celle-ci peut être reçue en bloc. |

Les unités 09 et 10 sont des ressources utiles pour l'extension, sans prouver qu'elles ont été présentées. Pour d1 complet, préparer séparément : saluer, commander avec 하나, comprendre l'offre de lait, accepter/refuser, demander le prix, comprendre le montant. Un lien éditorial vérifie un ordre prévu, pas ce que la personne sait.

### Les deux propositions sur le lait et le prix

**Prix : il reste hors de la scène d'entrée.** Le dialogue source et `삼천 원이에요.` sont conservés. Une extension pourra préparer le montant comme bloc reçu, puis travailler les nombres distinctement.

**Lait : choisir l'intention avant de remplacer.** `우유 넣을까요?` porte sur l'ajout de lait ; `우유 드릴까요?` offre de servir du lait. La seconde peut convenir à une scène conçue pour cela, mais n'est pas une simplification strictement équivalente. Aucune source complète de cette candidate avec toutes ses aides n'a été trouvée dans la réserve examinée : ne pas fabriquer puis annoncer une phonétique source par collage.

Cette candidate reste à rédiger et relire avec un locuteur pour le contexte choisi. Aucun JSON ni générateur n'est changé ici. L'absence de 넣을까요 du catalogue ne rend pas, à elle seule, la phrase reçue incorrecte et n'impose pas d'enseigner d'abord 넣다 en production.

## Réception : accord, avec un contrat d'essai précis

Le prototype distinguait déjà `learner`, `received` et `support`. Le présent lot rend la réception réutilisable dans deux **annexes documentaires par couple**, hors du dossier publié : `pilotes-progression/received-fr-zh.json` et `received-fr-ko.json`.

- **`analyse:false`** : compréhension globale à cette étape, sans exiger la construction grammaticale. Ni dispense de préparer le sens, ni interdiction d'approfondir plus tard.
- **`answerWith`** : variantes exactes, texte attendu et passage de préparation. Pour le mini-pilote, **03/v0 et 03/v1** ; le dialogue original avec 하나 demanderait un autre plan, notamment **09/v0**.
- **`replyRequired:false`, `answerWith:[]`** : pas de production imposée après la clôture 好的. Aucun `dialogueId` fictif pour une carte du catalogue.
- **`countsAsProduction:false`** : pas d'acquis productif attribué à un reçu. Aucun score ou verrou ajouté.

Le validateur contrôle sources et aides, couple, rôle A/B, préparation prévue avant la scène, réponse exacte après chaque occurrence de question, choix et clôtures. Il rejette notamment un texte changé avec le même identifiant ou une phrase d'une autre langue injectée dans les choix. Cela ne certifie ni exposition, ni compréhension, ni naturel.

**Mesures :** séparer production préparée et réception, sans effacer les répliques difficiles de l'audit de réception/dialogue. Les anciens pourcentages de formes écrites restent inchangés ; ils ne sont pas améliorés artificiellement par une nouvelle étiquette.

Voir le [contrat détaillé](pilotes-progression/contrat-received-essai.md). Ni les 110 fichiers, ni `loadLevel`, ni les scripts de mesures historiques ne sont modifiés. L'application actuelle ne charge pas ces annexes.

## Phonétique et vérification

L'oreille prononce le texte étudié exact. Les aides chinoises choisies restent les `phf` sources : `ouo chyang chyo chi`, `ouo chyang houèï djya`, `hao deu`. `phFR`, parfois fragmentaire, et `py` ne les remplacent pas. Les exemples génériques `ouo siang` ou `tchü` ne justifient pas une harmonisation silencieuse.

Les valeurs coréennes du dialogue sont conservées, notamment `deu-ril-kka-yo`. Fidélité à la source ne signifie pas validation native : les répliques du serveur et toute nouvelle formulation demandent encore cette relecture et une écoute réelle.

Deux pilotes, **14 étapes, 8 références** : sept phrases/répliques et un groupe d'appui. **21 tests du contrat** passent, y compris références volontairement cassées et vrai dialogue `learnerRole=B`. La maquette et l'export autonome passent aux formats 320×568, 390×844 et 1440×900 ; audio simulé pour contrôler texte/langue, pas la qualité des voix. Aucun essai APK.

## Suite à proposer à Claude

Recevoir puis relire **les fichiers réels amendés**, leurs annexes, formulations et aides avant déclinaison aux sept couples actifs. Revoir ensuite les transitions L1→L2, L4→L5, L6→L7 et L9→L10. Le L2 chinois reste provisoire tant que sa continuité avec les séquences antérieures n'est pas documentée. Parcours, rubriques et réduction éventuelle du gratuit restent des choix distincts, sans changement dans cet essai.

## Message court à transmettre

> Merci Claude, les deux essais sont amendés localement. 回家 est préparé dans une phrase complète avant substitution, avec la carte autonome comme appui. Je garde « ici, 我想 + ce que je veux faire » : la règle générale objets/actions serait fausse, puisque 我要 peut aussi précéder une action. 好的 était déjà la réponse du proche. Côté coréen, lait et prix restent hors de la scène d'entrée ; cinq cartes disponibles ne sont pas cinq acquis. Pour la suite, 우유 드릴까요 propose du lait, tandis que 우유 넣을까요 porte sur son ajout : contexte et nouvelles aides à relire avant remplacement. Le contrat reçu est testé en annexes : analyse:false, réponses exactes préparées via answerWith, aucune production imposée après une clôture. La difficulté reçue reste dans l'audit, sans crédit productif automatique. Les fichiers actualisés restent locaux, à te transmettre pour relecture. Aucun changement des 110 JSON ni du chargeur, aucune fusion ni publication ; revue du dossier avant les sept couples.
