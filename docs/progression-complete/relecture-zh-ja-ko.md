# Relecture ciblée : chinois, japonais et coréen, L1 à L10

Statut : **propositions locales à relire avec Claude et à essayer avec Kartech**. Aucun contenu canonique, niveau d’accès, affichage ou déploiement modifié. Toutes les aides phonétiques et lectures restent intactes.

Le contenu peut être conservé. L’amélioration proposée consiste à choisir la première phrase utile, préparer chaque groupe avant remplacement et faire comprendre les répliques de l’autre avant le dialogue complet. Un gabarit qui accepte quatre textes ne prouve ni une même opération ni une difficulté égale.

## Portée réelle

Lecture textuelle des 30 fichiers **fr→zh, fr→ja et fr→ko** : 349 unités, 1 396 variantes complètes, 90 dialogues et 732 tours. Les gabarits, notes, phrases et traductions ont été parcourus. Les constats ci-dessous portent sur des exemples prioritaires ; ils ne certifient pas le naturel de chaque phrase. **Aucune relecture native ni validation audio** dans ce lot. Les phonétiques ne sont pas réécrites.

Les trois familles sélectionnées par niveau viennent de `selection-guidee-enrichie.json`. Les exemples hors de cette sélection sont indiqués. La lecture anglophone de zh/ja et les autres couples ne sont pas validés par extension. Le contrôle exact des 7 989 copies est documenté séparément dans `phonetics-preservation.md`.

Contrôle des références : 123 constats, 369 occurrences de citations vérifiées contre la banque, 71 occurrences de rôles reçus vérifiées contre les dialogues. Au moins deux exemples précis et un passage reçu par langue/niveau ; les 90 familles sélectionnées sont citées.

## Découpage recommandé

| Langue | L1–L3 | L4–L5 | L6–L7 | L8–L9 | L10 |
|---|---|---|---|---|---|
| Chinois | Demande entière, groupe prêt, secours ; distinguer identité et action | Routines/personnes ; récit situé, sans « 了 = passé » | Projet puis proposition ; raison et comparaison stables | Une condition ou un problème ; puis clarification | Réponse pertinente, vraie reformulation et relance |
| Japonais | Objet avec particule ; rôle demandeur/aidant explicite | Routines, proches ; une action racontée avant enchaînement | Projet entier, invitation et alternative ; avis avec formes préparées | Condition et registre distincts ; solution simple avant conseil long | Avis reçu, réponse adaptée ; respect poussé en option |
| Coréen | Demande entière ; identité séparée de provenance | Famille située, particules préparées ; un événement | Projets et invitations en rôle clair ; cause et réponse négative contextualisée | Condition et engagement ; problème et solution | Ajuster son interprétation, argumenter et poursuivre |

Les étapes ne se débloquent pas par simple exposition. L’aide reste accessible ; la phrase complète demeure principale. Les niveaux indiqués ci-après sont des positions éditoriales à essayer, pas une mesure d’acquisition.

## Chinois — lecteur francophone

### L1

**Sélection examinée :** `L1-fr-zh-03`, `L1-fr-zh-05`, `L1-fr-zh-11`.

**Décision proposée :** Conserver le stock ; ouvrir par deux demandes en contexte et une formule de secours, pas les onze familles ensemble.

**Pont du niveau :** Écoute et sens de la phrase entière → deux demandes connues → choix de la demande → question reçue préparée ; aucun besoin supposé déjà appris.

1. **Sélection — L1, première micro-scène : commander deux boissons connues.**

   - `L1-fr-zh.json:L1-fr-zh-03:v0` : **我要一杯咖啡。** — « Je veux un café. ».
   - `L1-fr-zh.json:L1-fr-zh-03:v1` : **我要水。** — « Je veux de l'eau. ».

   La demande de café comporte 一杯, contrairement à 水 ; le gabarit commun ne signifie pas que le lecteur connaît les quantités ni tous les noms.

   **Action :** Préparer les deux phrases complètes ; garder 一杯咖啡 comme groupe. Billet et sandwich restent une réserve de scènes ultérieures.

   **Pont :** Même intention et même début 我要 ; seul le groupe demandé change.

2. **Sélection — L1, après la première demande, sans tout mêler.**

   - `L1-fr-zh.json:L1-fr-zh-05:v0` : **火车站在哪里？** — « Où est la gare ? ».
   - `L1-fr-zh.json:L1-fr-zh-05:v2` : **洗手间在哪里？** — « Où sont les toilettes ? ».

   Trouver la gare et trouver les toilettes partagent bien …在哪里, mais connaître une commande ne prépare pas la compréhension d’une direction.

   **Action :** En faire une deuxième micro-scène ; préparer le lieu et une réponse courte réellement retenue, avant le dialogue de gare.

   **Pont :** Demande entière de localisation → réponse reçue → réutilisation avec un autre lieu connu.

3. **Sélection — L1, appui permanent, expressions entières.**

   - `L1-fr-zh.json:L1-fr-zh-11:v0` : **我不懂。** — « Je ne comprends pas. ».
   - `L1-fr-zh.json:L1-fr-zh-11:v1` : **请再说一遍。** — « Répétez, s'il vous plaît. ».

   我不懂 et 请再说一遍 ne sont pas deux noms à remplacer : déclarer une incompréhension et demander de répéter sont deux actes complémentaires.

   **Action :** Les proposer tôt comme phrases entières accessibles ; les deux autres formules restent disponibles sans être exigées à la même séance.

   **Pont :** Une incompréhension jouée → phrase de secours → l’autre répète la réplique connue.

4. **Hors sélection / réserve — v0–v2 : identité ; v3 : annexe contextualisée à positionner après préparation.**

   - `L1-fr-zh.json:L1-fr-zh-01:v0` : **我是学生。** — « Je suis étudiant. ».
   - `L1-fr-zh.json:L1-fr-zh-01:v3` : **我是来度假的。** — « Je suis en vacances. ».

   我是学生 est une identité nominale ; 我是来度假的 comprend 来 + action + 的. La même chaîne 我是 ne suffit pas à en faire une substitution nominale.

   **Action :** Retirer v3 de la première série d’identité ; la conserver comme bloc complet de voyage, à préparer dans une scène distincte. Ne pas corriger sa phonétique.

   **Pont :** Comparer d’abord deux identités connues ; ne pas demander de fabriquer 我是 + action à partir de ce seul exemple.

5. **Répliques reçues — Réception L1 par étapes ; dialogue intégral en réserve.**

   - `L1-fr-zh.json:L1-fr-zh-d1:t1` : **你好。您要什么？** — « Bonjour. Vous désirez ? » — rôle Serveur, reçu.
   - `L1-fr-zh.json:L1-fr-zh-d1:t2` : **请给我一杯咖啡。** — « Un café, s'il vous plaît. » — rôle Client, apprenant.
   - `L1-fr-zh.json:L1-fr-zh-d1:t3` : **加牛奶吗？** — « Avec du lait ? » — rôle Serveur, reçu.
   - `L1-fr-zh.json:L1-fr-zh-d1:t4` : **不用，谢谢。多少钱？** — « Non, merci. Combien ça coûte ? » — rôle Client, apprenant.

   La question du serveur est suivie d’une commande, puis d’une question sur le lait et d’un refus accompagné du prix : plusieurs opérations nouvelles, même sur six tours.

   **Action :** Préparer la question entière et la commande connue. Ne garder le cycle complet qu’après avoir travaillé lait, refus et prix ; ne pas fabriquer une clôture absente en coupant les tours.

   **Pont :** Comprendre 您要什么 avant de répondre ; préparer 加牛奶吗 et 不用 séparément avant de poursuivre.

### L2

**Sélection examinée :** `L2-fr-zh-02`, `L2-fr-zh-03`, `L2-fr-zh-05`.

**Décision proposée :** Maintenir L2 avec séries distinctes pour quantités, position et rendez-vous ; quatre variantes restent une réserve.

**Pont du niveau :** Repartir d’une demande L1 réellement connue ; ajouter soit une quantité, soit une position, soit un repère de temps.

1. **Sélection — L2, compteurs préparés ; poids en prolongement.**

   - `L2-fr-zh.json:L2-fr-zh-02:v0` : **我要两张票。** — « Je prends deux billets. ».
   - `L2-fr-zh.json:L2-fr-zh-02:v2` : **我要三瓶水。** — « Je prends trois bouteilles d'eau. ».
   - `L2-fr-zh.json:L2-fr-zh-02:v3` : **我要一斤苹果。** — « Je prends une livre de pommes. ».

   两张票, 三瓶水 et 一斤苹果 changent à la fois nombre, nom et mesure ; 斤 ajoute une unité culturelle, pas seulement un mot de plus.

   **Action :** Choisir d’abord un groupe déjà entendu ; préparer chaque groupe complet avant remplacement. Réserver le poids pour une scène de marché.

   **Pont :** Reconnaître quantité et objet dans la phrase complète avant de choisir un autre groupe prêt à l’emploi.

2. **Sélection — L2, position → direction → étage.**

   - `L2-fr-zh.json:L2-fr-zh-03:v0` : **洗手间在这里。** — « Les toilettes sont ici. ».
   - `L2-fr-zh.json:L2-fr-zh-03:v2` : **洗手间在左边。** — « Les toilettes sont à gauche. ».
   - `L2-fr-zh.json:L2-fr-zh-03:v3` : **洗手间在二楼。** — « Les toilettes sont au premier étage. ».

   Ici, à gauche et au premier étage français ne sont pas trois directions équivalentes ; 二楼 requiert un repère de bâtiment cohérent.

   **Action :** Commencer par ici/là-bas ; ajouter gauche puis étage avec un plan. Garder explicitement la convention d’étage de la scène.

   **Pont :** Réutiliser la question L1 des toilettes avec une seule réponse localisée préparée.

3. **Sélection — L2, rendez-vous simple puis précision horaire.**

   - `L2-fr-zh.json:L2-fr-zh-05:v0` : **我们八点见。** — « On se voit à huit heures. ».
   - `L2-fr-zh.json:L2-fr-zh-05:v1` : **我们今晚见。** — « On se voit ce soir. ».
   - `L2-fr-zh.json:L2-fr-zh-05:v3` : **我们下午三点见。** — « On se voit à trois heures de l'après-midi. ».

   八点 et 今晚 sont des repères de temps ; 下午三点 cumule moment de la journée et heure, donc une charge supplémentaire.

   **Action :** Opposer d’abord deux moments compris, puis ajouter une heure déjà reconnue. Ne pas ouvrir la construction libre de toutes les heures.

   **Pont :** Écouter le moment, l’identifier, puis confirmer la phrase complète.

4. **Répliques reçues — Réception L2 en deux mini-passages.**

   - `L2-fr-zh.json:L2-fr-zh-d1:t1` : **有。几位？** — « Oui. Combien de personnes ? » — rôle Serveur, reçu.
   - `L2-fr-zh.json:L2-fr-zh-d1:t2` : **两位。我们想要靠窗的座位。** — « Deux. Nous voudrions une table côté fenêtre. » — rôle Client, apprenant.
   - `L2-fr-zh.json:L2-fr-zh-d1:t5` : **热茶还是冰茶？** — « Thé chaud ou thé glacé ? » — rôle Serveur, reçu.
   - `L2-fr-zh.json:L2-fr-zh-d1:t6` : **热的，谢谢。** — « Chaud, merci. » — rôle Client, apprenant.

   几位 demande un nombre de personnes ; 热茶还是冰茶 demande de choisir entre deux boissons. Ni l’une ni l’autre n’est préparée par les seules phrases de quantité.

   **Action :** Préparer les deux questions comme réceptions distinctes avec leurs réponses exactes ; introduire le choix chaud/glacé après les boissons connues.

   **Pont :** Question sur personnes → réponse ; plus tard question de boisson → réponse, avant les huit tours.

### L3

**Sélection examinée :** `L3-fr-zh-01`, `L3-fr-zh-07`, `L3-fr-zh-08`.

**Décision proposée :** Conserver L3 en distinguant service demandé, proposition commune et type de réponse.

**Pont du niveau :** Une phrase de secours connue devient une demande de service ; puis proposer une activité connue et traiter la réponse réelle.

1. **Sélection — L3, demande à une personne ; registre connu.**

   - `L3-fr-zh.json:L3-fr-zh-01:v0` : **你可以帮我吗？** — « Tu peux m'aider ? ».
   - `L3-fr-zh.json:L3-fr-zh-01:v1` : **你可以再说一遍吗？** — « Tu peux répéter ? ».

   帮我 et 再说一遍 changent l’action demandée ; 你可以…吗 reste un cadre de demande, pas une règle générale de politesse envers tout interlocuteur.

   **Action :** Fixer le rôle et le registre. Réutiliser d’abord répéter, déjà entendu, puis introduire aider en phrase entière.

   **Pont :** Faire entendre la demande complète avant de repérer son action.

2. **Sélection — L3, proposer une action préparée puis un rendez-vous.**

   - `L3-fr-zh.json:L3-fr-zh-07:v0` : **我们一起吃饭，好吗？** — « On mange ensemble, d'accord ? ».
   - `L3-fr-zh.json:L3-fr-zh-07:v2` : **我们明天见，好吗？** — « On se voit demain, d'accord ? ».

   一起吃饭 et 明天见 ne sont pas simplement deux verbes isolés : l’un ajoute la participation commune, l’autre un moment de rendez-vous.

   **Action :** Préparer chaque groupe d’action ; garder 好吗 comme fin de proposition dans ces exemples choisis, sans imposer de création libre.

   **Pont :** Une proposition connue → une réponse courte appropriée → autre proposition préparée.

3. **Sélection — L3, expressions de réponse entières, contextualisées.**

   - `L3-fr-zh.json:L3-fr-zh-08:v0` : **是的。** — « Oui. ».
   - `L3-fr-zh.json:L3-fr-zh-08:v1` : **不是。** — « Non. ».
   - `L3-fr-zh.json:L3-fr-zh-08:v3` : **不用了，谢谢。** — « Non merci, ça ira. ».

   是的, 不是 et 不用了 ne forment pas une table universelle oui/non. 不用了 refuse un besoin ou une offre, pas toute proposition.

   **Action :** Associer chaque réponse à sa question source et à son intention. Ne pas noter faux un refus adéquat parce qu’il n’utilise pas 不是.

   **Pont :** Entendre la question ; choisir son intention ; entendre la réponse qui lui correspond.

4. **Répliques reçues — Réception L3, savoir faire / expliquer, après les demandes simples.**

   - `L3-fr-zh.json:L3-fr-zh-d2:t3` : **喜欢。这个怎么吃？** — « Oui. Comment on mange ça ? » — rôle Un ami, reçu.
   - `L3-fr-zh.json:L3-fr-zh-d2:t4` : **用筷子。你会用筷子吗？** — « Avec des baguettes. Tu sais te servir des baguettes ? » — rôle Toi, apprenant.
   - `L3-fr-zh.json:L3-fr-zh-d2:t5` : **不太会。你可以帮我吗？** — « Pas très bien. Tu peux m'aider ? » — rôle Un ami, reçu.
   - `L3-fr-zh.json:L3-fr-zh-d2:t6` : **当然。要啤酒吗？** — « Bien sûr. Tu veux une bière ? » — rôle Toi, apprenant.

   La question sur l’usage des baguettes, la réponse elliptique et la demande d’aide déplacent le rôle de celui qui enseigne ; le dialogue n’est pas une simple suite de questions apprises.

   **Action :** Préparer séparément les deux questions sur l’usage et les baguettes ; conserver chaque réponse avec son antécédent. Jouer ensuite les rôles nommés.

   **Pont :** Question reçue entière → réponse préparée → demande d’aide, sans découper un fragment hors contexte.

### L4

**Sélection examinée :** `L4-fr-zh-01`, `L4-fr-zh-04`, `L4-fr-zh-05`.

**Décision proposée :** Conserver L4 ; organiser par ancrage personnel et préparer nombre, famille et lieu dans des passages séparés.

**Pont du niveau :** Action simple déjà connue → habitude ; description personnelle courte → une question de l’autre → une précision.

1. **Sélection — L4, une routine puis deux routines.**

   - `L4-fr-zh.json:L4-fr-zh-01:v0` : **我平时七点起床。** — « D'habitude, je me lève à sept heures. ».
   - `L4-fr-zh.json:L4-fr-zh-01:v1` : **我平时坐地铁上班。** — « D'habitude, je vais au travail en métro. ».

   Se lever à une heure et aller au travail en métro mobilisent des groupes complets différents ; ajouter 平时 ne crée pas leur connaissance.

   **Action :** Commencer par une action réellement connue ; préparer ensuite le trajet entier avant d’y appliquer le cadre d’habitude.

   **Pont :** Réactiver action et heure, puis ajouter un seul marqueur d’habitude.

2. **Sélection — L4, famille proche ; quantité et animal ensuite.**

   - `L4-fr-zh.json:L4-fr-zh-04:v0` : **我有一个哥哥。** — « J'ai un grand frère. ».
   - `L4-fr-zh.json:L4-fr-zh-04:v1` : **我有两个孩子。** — « J'ai deux enfants. ».
   - `L4-fr-zh.json:L4-fr-zh-04:v3` : **我有一只猫。** — « J'ai un chat. ».

   Grand frère, deux enfants et chat combinent termes de parenté et compteurs ; 个 et 只 ne sont pas interchangeables.

   **Action :** Préparer d’abord une phrase familiale qui correspond à la personne ; introduire compter puis l’animal dans d’autres passages.

   **Pont :** Une phrase personnelle comprise → une autre personne ou quantité déjà préparée, sans inventaire des compteurs.

3. **Sélection — L4, lieu simple → lieu décrit.**

   - `L4-fr-zh.json:L4-fr-zh-05:v0` : **我住在巴黎。** — « J'habite à Paris. ».
   - `L4-fr-zh.json:L4-fr-zh-05:v1` : **我住在一个小公寓。** — « J'habite dans un petit appartement. ».
   - `L4-fr-zh.json:L4-fr-zh-05:v2` : **我住在市中心。** — « J'habite dans le centre-ville. ».

   Ville, appartement et quartier restent des lieux, mais 一个小公寓 ajoute détermination et description au simple nom de ville.

   **Action :** Garder chaque complément entier ; commencer ville/centre, puis le groupe décrivant l’appartement. Faire relire le naturel de la formulation du logement.

   **Pont :** Partir de 我在… connu et faire entendre la nouvelle phrase entière 我住在…, sans déduire qu’ils sont synonymes.

4. **Répliques reçues — Dialogue familial complet après préparation ; premier cycle à recomposer et relire.**

   - `L4-fr-zh.json:L4-fr-zh-d1:t1` : **有，我有一个哥哥和一个妹妹。你呢？** — « Oui, j'ai un grand frère et une petite sœur. Et toi ? » — rôle Un ami, reçu.
   - `L4-fr-zh.json:L4-fr-zh-d1:t2` : **我有两个孩子。** — « J'ai deux enfants. » — rôle Toi, apprenant.
   - `L4-fr-zh.json:L4-fr-zh-d1:t3` : **他们多大？** — « Ils ont quel âge ? » — rôle Un ami, reçu.
   - `L4-fr-zh.json:L4-fr-zh-d1:t4` : **女儿十岁，儿子七岁。** — « Ma fille a dix ans, mon fils sept ans. » — rôle Toi, apprenant.

   À la question initiale sur frères et sœurs, le lecteur répond qu’il a deux enfants ; cela peut faire bifurquer une vraie conversation mais ne constitue pas une réponse guidée claire à cette question.

   **Action :** Pour le premier essai, choisir une autre question pertinente déjà sourcée ou présenter explicitement une bifurcation familiale. Préparer ensuite 他们多大 et la réponse d’âge.

   **Pont :** Une question ciblée doit recevoir une réponse qui répond effectivement à son contenu, avant d’enchaîner vers l’âge.

### L5

**Sélection examinée :** `L5-fr-zh-01`, `L5-fr-zh-08`, `L5-fr-zh-05`.

**Décision proposée :** Maintenir le récit simple ; séparer repère temporel, aspect, changement d’état et enchaînement.

**Pont du niveau :** Routine connue → même action située hier → question sur hier → réaction ; pas de règle « 了 = passé ».

1. **Sélection — L5, récit d’un événement, sans analyse globale de 了.**

   - `L5-fr-zh.json:L5-fr-zh-01:v0` : **昨天我看电影了。** — « Hier, j'ai vu un film. ».
   - `L5-fr-zh.json:L5-fr-zh-01:v1` : **昨天我工作了。** — « Hier, j'ai travaillé. ».

   La note assimile 了 final à une action menée à son terme ; 看电影了 et 工作了 ne prouvent pourtant pas qu’un film ou un travail a été terminé.

   **Action :** Garder les phrases entières et 昨天 comme repère du récit. Amender seulement l’explication annexe : cet exemple rapporte un événement ; ne pas généraliser « fin de tâche ».

   **Pont :** Action connue → phrase située hier ; constater la forme entendue, sans fabriquer tous les passés.

2. **Sélection — L5, question courte puis récit étendu.**

   - `L5-fr-zh.json:L5-fr-zh-08:v0` : **你昨天做了什么？** — « Qu'est-ce que tu as fait hier ? ».
   - `L5-fr-zh.json:L5-fr-zh-08:v3` : **你昨晚做了什么？** — « Qu'est-ce que tu as fait hier soir ? ».

   La question sur hier et celle sur hier soir réemploient la même demande ; la question sur les vacances ajoute une autre étendue de récit.

   **Action :** Commencer par hier/hier soir et une réponse courte préparée ; réserver les vacances au récit plus long.

   **Pont :** Entendre la question et choisir l’événement effectivement demandé avant de répondre.

3. **Sélection — L5, réactions contextualisées.**

   - `L5-fr-zh.json:L5-fr-zh-05:v0` : **太好了！** — « C'est super ! ».
   - `L5-fr-zh.json:L5-fr-zh-05:v2` : **太可惜了！** — « Quel dommage ! ».

   太好了 et 太可惜了 sont des réactions entières dont 了 n’est pas le passé ; la longueur identique ne garantit pas que leur emploi soit approprié à toute nouvelle.

   **Action :** Les associer à une bonne et à une mauvaise nouvelle connues ; ne pas compter leur maîtrise grammaticale comme un nouveau temps.

   **Pont :** Récit connu → sens de la nouvelle → réaction adaptée.

4. **Répliques reçues — Réception L5, résultat et accompagnateur en passages séparés.**

   - `L5-fr-zh.json:L5-fr-zh-d2:t5` : **现在做完了吗？** — « Et maintenant, c'est fini ? » — rôle Un collègue, reçu.
   - `L5-fr-zh.json:L5-fr-zh-d2:t6` : **做完了！** — « C'est fini ! » — rôle Toi, apprenant.
   - `L5-fr-zh.json:L5-fr-zh-d1:t4` : **真的吗？和谁去的？** — « Vraiment ? Avec qui ? » — rôle Toi, apprenant.
   - `L5-fr-zh.json:L5-fr-zh-d1:t5` : **和同事一起。先坐火车，然后走了两个小时。** — « Avec des collègues. D'abord le train, puis on a marché deux heures. » — rôle Un ami, reçu.

   做完了吗 introduit un résultat terminé ; 和谁去的 utilise une autre construction, puis une réponse longue avec déplacement et durée.

   **Action :** Préparer la question et sa réponse entière avant les dialogues complets. Ne pas annoncer ces tours comme acquis parce que 昨天…了 a été montré.

   **Pont :** Question reçue → réponse courte ; ajouter ensuite deux événements liés et leur durée.

### L6

**Sélection examinée :** `L6-fr-zh-01`, `L6-fr-zh-03`, `L6-fr-zh-05`.

**Décision proposée :** Conserver les projets ; choisir une première construction, puis invitation et alternative dans des scènes séparées.

**Pont du niveau :** Une action connue avec un projet explicite → invitation → accepter/refuser → fixer un autre moment.

1. **Sélection — L6, projet explicite ; nouveaux groupes ensuite.**

   - `L6-fr-zh.json:L6-fr-zh-01:v0` : **我打算去中国。** — « J'ai l'intention d'aller en Chine. ».
   - `L6-fr-zh.json:L6-fr-zh-01:v1` : **我打算学开车。** — « J'ai l'intention d'apprendre à conduire. ».
   - `L6-fr-zh.json:L6-fr-zh-01:v3` : **我打算周末去爬山。** — « J'ai l'intention de faire de la randonnée ce week-end. ».

   打算 sert bien l’intention, mais apprendre à conduire et faire une randonnée ne sont pas des actions déjà préparées par « aller en Chine ».

   **Action :** Commencer par un projet utile et son action connue ; garder les nouveaux groupes comme phrases entières à préparer.

   **Pont :** Réactiver une action avant de la placer dans une phrase d’intention complète.

2. **Sélection — L6, invitation connue → autre activité préparée.**

   - `L6-fr-zh.json:L6-fr-zh-03:v0` : **我们去看电影，怎么样？** — « Et si on allait au cinéma ? ».
   - `L6-fr-zh.json:L6-fr-zh-03:v2` : **我们一起吃晚饭，怎么样？** — « Et si on dînait ensemble ? ».

   La proposition de cinéma et de dîner peut réutiliser un échange antérieur, mais 怎么样 ne doit pas être enseigné simultanément comme remplacement libre de 好吗 dans toutes les scènes.

   **Action :** Choisir la tournure présente dans la scène et préparer deux propositions. Ajouter une autre tournure seulement en reconnaissance.

   **Pont :** Proposition → réaction pertinente → détail de rendez-vous, sans empiler tous les futurs.

3. **Sélection — L6, alternative temporelle ; autre acteur en prolongement.**

   - `L6-fr-zh.json:L6-fr-zh-05:v0` : **我不行，不过星期天可以。** — « Je ne peux pas, mais dimanche c'est possible. ».
   - `L6-fr-zh.json:L6-fr-zh-05:v3` : **我不行，不过玛丽可以去。** — « Je ne peux pas, mais Marie peut y aller. ».

   Les premières variantes refusent puis proposent une disponibilité ; v3 désigne une autre personne. L’acteur change, pas seulement le moment.

   **Action :** Faire d’abord samedi/dimanche ou journée/soir ; garder la proposition concernant Marie pour un passage avec changement de personne préparé.

   **Pont :** Même locuteur, même empêchement, seul le moment change avant de passer à un tiers.

4. **Répliques reçues — Réception L6, renégociation d’un seul détail.**

   - `L6-fr-zh.json:L6-fr-zh-d1:t5` : **八点太早了。九点可以吗？** — « Huit heures, c'est trop tôt. Neuf heures, ça va ? » — rôle Un ami, reçu.
   - `L6-fr-zh.json:L6-fr-zh-d1:t6` : **可以。那就九点，说定了！** — « Oui. Alors neuf heures, c'est décidé ! » — rôle Toi, apprenant.
   - `L6-fr-zh.json:L6-fr-zh-d1:t7` : **好，我会带水和吃的。** — « Bien, j'apporterai de l'eau et à manger. » — rôle Un ami, reçu.

   Le partenaire conteste l’heure puis annonce qu’il apportera eau et nourriture ; comprendre une invitation ne prépare ni la contre-proposition ni l’engagement.

   **Action :** Préparer le refus de l’horaire et la confirmation comme cycle distinct ; la réplique sur les provisions reste un ajout reçu préparé, non une surprise à produire.

   **Pont :** Identifier le détail contesté et répondre à ce détail avant la suite.

### L7

**Sélection examinée :** `L7-fr-zh-02`, `L7-fr-zh-03`, `L7-fr-zh-06`.

**Décision proposée :** Conserver raisons, comparaison et avis, avec une comparaison stable avant les propositions imbriquées.

**Pont du niveau :** Deux descriptions connues → un critère de comparaison → une raison connue → avis situé.

1. **Sélection — L7, raison simple → raison relationnelle.**

   - `L7-fr-zh.json:L7-fr-zh-02:v0` : **我喜欢这里，因为很安静。** — « J'aime bien ici, parce que c'est très calme. ».
   - `L7-fr-zh.json:L7-fr-zh-02:v1` : **我喜欢这里，因为离公司很近。** — « J'aime bien ici, parce que c'est tout près du bureau. ».

   很安静 décrit le lieu ; 离公司很近 ajoute une relation de distance et un autre groupe syntaxique. Ce sont deux raisons possibles, pas deux adjectifs nus.

   **Action :** Commencer par une raison courte comprise ; préparer la distance entière avant de la substituer.

   **Pont :** Dire la préférence connue puis ajouter une cause préparée, sans nouveau lexique simultané.

2. **Sélection — L7, comparaison contrôlée.**

   - `L7-fr-zh.json:L7-fr-zh-03:v0` : **这个比那个更便宜。** — « Celui-ci est moins cher que celui-là. ».
   - `L7-fr-zh.json:L7-fr-zh-03:v2` : **这个比那个更大。** — « Celui-ci est plus grand que celui-là. ».

   La comparaison garde bien les deux objets et le cadre ; 便宜 et 大 demandent néanmoins de fixer le critère et de comprendre quel objet est plus/moins cher ou grand.

   **Action :** Utiliser deux objets visibles, un seul critère puis un second. Ne pas appeler 便宜 un comparatif négatif parce que sa traduction dit « moins cher ».

   **Pont :** Deux descriptions séparées → comparaison unique → décision motivée.

3. **Sélection — L7, avis simple ; proposition rapportée en prolongement L7/L9 à essayer.**

   - `L7-fr-zh.json:L7-fr-zh-06:v0` : **我觉得这个太贵了。** — « Je trouve que c'est trop cher. ».
   - `L7-fr-zh.json:L7-fr-zh-06:v3` : **我觉得他说得对。** — « Je trouve qu'il a raison. ».

   我觉得这个太贵了 exprime une appréciation ; 他说得对 ajoute une proposition sur les paroles d’un tiers et 得, au-delà du même début 我觉得.

   **Action :** Garder les avis simples en première série ; reporter v3 après une scène où le propos du tiers a été entendu.

   **Pont :** Écouter le propos du tiers puis approuver ; ne pas inventer ce tiers à partir du gabarit.

4. **Répliques reçues — Réception L7, suivre référent et critère.**

   - `L7-fr-zh.json:L7-fr-zh-d1:t3` : **是的，因为这个质量更好。** — « Oui, parce que la qualité est meilleure. » — rôle Vendeur, reçu.
   - `L7-fr-zh.json:L7-fr-zh-d1:t4` : **那个电池怎么样？** — « Et la batterie de celui-là ? » — rôle Client, apprenant.
   - `L7-fr-zh.json:L7-fr-zh-d1:t5` : **那个没有这个好，但是更轻。** — « Moins bonne que celui-ci, mais il est plus léger. » — rôle Vendeur, reçu.

   Le vendeur compare la qualité, puis la batterie et le poids ; 那个/这个 changent de référent à chaque prise de parole.

   **Action :** Garder les objets visibles et préparer les réponses entières ; faire reformuler le critère compris avant de décider.

   **Pont :** Même paire d’objets → un critère → autre critère, avant les huit tours.

### L8

**Sélection examinée :** `L8-fr-zh-01`, `L8-fr-zh-03`, `L8-fr-zh-07`.

**Décision proposée :** Conserver négociation et réparation ; ne pas présenter la politesse comme une nouveauté absente de L1.

**Pont du niveau :** Demande connue → condition précise → réponse comprise → accord ou solution, un problème à la fois.

1. **Sélection — L8, demande plus élaborée en contexte, politesse déjà présente auparavant.**

   - `L8-fr-zh.json:L8-fr-zh-01:v0` : **您能便宜一点吗？** — « Pourriez-vous baisser un peu le prix ? ».
   - `L8-fr-zh.json:L8-fr-zh-01:v2` : **您能明天再来吗？** — « Pourriez-vous revenir demain ? ».

   La demande de prix et celle de revenir portent le même cadre 您能…吗, avec des contraintes sociales différentes ; 您 seul ne rend pas tout contenu également poli.

   **Action :** Nommer les rôles et la scène ; réactiver une demande simple avant la forme retenue. Préparer les atténuations entières.

   **Pont :** Comparer fonctionnellement deux demandes connues, sans cours de toutes les modalités.

2. **Sélection — L8, une condition concrète → une autre condition préparée.**

   - `L8-fr-zh.json:L8-fr-zh-03:v0` : **如果便宜一点，我就买。** — « Si c'est un peu moins cher, je l'achète. ».
   - `L8-fr-zh.json:L8-fr-zh-03:v2` : **如果可以退货，我就买。** — « Si on peut le rendre, je l'achète. ».

   Baisse de prix et droit de retour sont des conditions différentes ; chaque protase porte son vocabulaire et la conséquence est une promesse d’achat.

   **Action :** Traiter une seule condition de décision d’abord ; ne pas faire mémoriser les quatre avant tout échange.

   **Pont :** Comprendre ce qui doit être vrai puis l’engagement associé, avant de remplacer la condition.

3. **Sélection — L8, réception du prestataire puis rôle productif séparé.**

   - `L8-fr-zh.json:L8-fr-zh-07:v0` : **对不起，我马上改。** — « Désolé(e), je corrige tout de suite. ».
   - `L8-fr-zh.json:L8-fr-zh-07:v1` : **对不起，我马上给您换一个新的。** — « Désolé(e), je vous le change tout de suite. ».

   Corriger et changer l’article sont des réponses du prestataire ; le même apprenant est souvent client dans les autres familles choisies.

   **Action :** Conserver ces phrases mais ouvrir un second rôle explicite ou les recevoir d’abord. Ne pas masquer ces réponses comme si elles étaient automatiquement celles du client.

   **Pont :** Problème du client → réponse du prestataire → confirmation, avec acteur stable.

4. **Répliques reçues — Réception L8, conditions et contre-proposition.**

   - `L8-fr-zh.json:L8-fr-zh-d1:t5` : **好，两个三百五，但是要付现金才行。** — « D'accord, trois cent cinquante les deux, mais seulement en espèces. » — rôle Vendeur, reçu.
   - `L8-fr-zh.json:L8-fr-zh-d1:t6` : **可以刷卡吗？** — « On peut payer par carte ? » — rôle Client, apprenant.
   - `L8-fr-zh.json:L8-fr-zh-d1:t7` : **不行，不过可以用手机付。** — « Non, mais vous pouvez payer avec le téléphone. » — rôle Vendeur, reçu.

   Le vendeur exige les espèces, le client demande la carte, puis le vendeur admet le téléphone ; suivre cet écart est le cœur de la négociation.

   **Action :** Préparer montant, condition et options de paiement avant les dix tours. Faire repérer quelle condition est remplacée plutôt que répéter tout le dialogue.

   **Pont :** Refus explicite → autre moyen autorisé → choix ; ne pas considérer 付现金 comme une condition déjà comprise.

### L9

**Sélection examinée :** `L9-fr-zh-01`, `L9-fr-zh-07`, `L9-fr-zh-11`.

**Décision proposée :** Conserver la résolution d’imprévu ; séparer exposé du problème, reformulation et proposition de solution.

**Pont du niveau :** Un problème concret connu → réplique reçue préparée → clarification utile → solution, avant les incertitudes imbriquées.

1. **Sélection — L9, reformulation d’un contenu déjà compris.**

   - `L9-fr-zh.json:L9-fr-zh-01:v0` : **我的意思是我今天不能去。** — « Ce que je veux dire, c'est que je ne peux pas y aller aujourd'hui. ».
   - `L9-fr-zh.json:L9-fr-zh-01:v3` : **我的意思是他还没到。** — « Ce que je veux dire, c'est qu'il n'est pas encore arrivé. ».

   我的意思是 peut encadrer un empêchement simple ou 他还没到, avec personne, négation d’accompli et attente encore en cours.

   **Action :** Commencer par reformuler une phrase connue en lui gardant son sens ; introduire la situation « pas encore arrivé » à part.

   **Pont :** Deux manières de dire la même intention, sans ajouter en même temps une nouvelle temporalité.

2. **Sélection — L9, problème simple ; problème avec disposition de l’objet ensuite.**

   - `L9-fr-zh.json:L9-fr-zh-07:v0` : **有个问题：我的行李丢了。怎么办？** — « Il y a un problème : j'ai perdu mes bagages. Qu'est-ce qu'on fait ? ».
   - `L9-fr-zh.json:L9-fr-zh-07:v2` : **有个问题：我把护照忘在酒店了。怎么办？** — « Il y a un problème : j'ai oublié mon passeport à l'hôtel. Qu'est-ce qu'on fait ? ».

   Perdre les bagages et oublier son passeport à l’hôtel ne sont pas deux noms interchangeables : v2 introduit 把…忘在…了.

   **Action :** Préparer le problème complet ; garder la construction 把 comme bloc reçu ou deuxième passage, sans généraliser librement.

   **Pont :** Identifier l’objet et le lieu dans le récit connu avant d’ajouter la demande de solution.

3. **Sélection — L9, solution rattachée au problème.**

   - `L9-fr-zh.json:L9-fr-zh-11:v0` : **那我们坐下一班吧。** — « Alors prenons le prochain. ».
   - `L9-fr-zh.json:L9-fr-zh-11:v1` : **那我们先问问吧。** — « Alors demandons d'abord. ».

   Prendre le prochain et demander d’abord sont des actions de résolution différentes ; la première requiert que le transport ait été nommé.

   **Action :** Conserver le contexte visible/entendu et préparer la solution ; ne pas faire de 下一班 un objet autonome hors situation.

   **Pont :** Entendre le problème puis choisir entre solutions effectivement préparées et appropriées.

4. **Répliques reçues — Réception L9, départ puis bagages, pas dix informations d’un coup.**

   - `L9-fr-zh.json:L9-fr-zh-d1:t3` : **不是，下一班是下午三点，可能会晚一点。** — « Non, le prochain est à quinze heures, il aura peut-être un peu de retard. » — rôle Agent, reçu.
   - `L9-fr-zh.json:L9-fr-zh-d1:t4` : **如果我没理解错，我可以用这张票坐下一班？** — « Si j'ai bien compris, je peux prendre le prochain avec ce billet ? » — rôle Voyageur, apprenant.
   - `L9-fr-zh.json:L9-fr-zh-d1:t5` : **对，不用换票。** — « Oui, pas besoin de changer de billet. » — rôle Agent, reçu.
   - `L9-fr-zh.json:L9-fr-zh-d1:t7` : **在二号窗口，不过我不太确定现在开不开。** — « Au guichet deux, mais je ne suis pas sûr qu'il soit ouvert en ce moment. » — rôle Agent, reçu.

   La disponibilité du prochain train, le billet réutilisable et l’ouverture incertaine du guichet forment trois informations ; 开不开 est une nouvelle question indirecte reçue.

   **Action :** D’abord résoudre le départ avec le même billet ; préparer le guichet et son incertitude dans un second cycle. Garder la négation exacte de la réponse.

   **Pont :** Une clarification doit vérifier l’information qui vient d’être reçue avant de changer de problème.

### L10

**Sélection examinée :** `L10-fr-zh-01`, `L10-fr-zh-03`, `L10-fr-zh-08`.

**Décision proposée :** Objectif : conversation plus autonome à essayer ; les gabarits d’argumentation ne suffisent pas à la démontrer.

**Pont du niveau :** Réactiver avis et raison → entendre une objection → reformuler fidèlement → choisir une réponse pertinente → conclure ou changer de sujet.

1. **Sélection — L10, argumentation guidée avant conversation moins aidée.**

   - `L10-fr-zh.json:L10-fr-zh-01:v0` : **一方面很方便，另一方面比较贵。** — « D'un côté c'est très pratique, de l'autre c'est plutôt cher. ».
   - `L10-fr-zh.json:L10-fr-zh-01:v3` : **一方面质量很好，另一方面比较贵。** — « D'un côté la qualité est très bonne, de l'autre c'est plutôt cher. ».

   Avantage et coût peuvent structurer un avis, mais maintenir 比较贵 pour tous les objets produit vite une argumentation mécanique.

   **Action :** Utiliser les exemples comme entraînement guidé ; ensuite demander une décision justifiée dans une scène comprise, sans obliger le double connecteur.

   **Pont :** Avis simple déjà acquis → avantage et limite réels → décision expliquée.

2. **Sélection — L10, reformulation fidèle, pas lecture mécanique du gabarit.**

   - `L10-fr-zh.json:L10-fr-zh-03:v0` : **如果我理解得对，你觉得我们应该等一等？** — « Si je comprends bien, tu penses que nous devrions attendre un peu ? ».
   - `L10-fr-zh.json:L10-fr-zh-03:v3` : **如果我理解得对，你觉得他不会同意？** — « Si je comprends bien, tu penses qu'il ne sera pas d'accord ? ».

   La reformulation reprend une pensée supposée de l’autre ; v3 ajoute l’avis sur ce qu’un tiers acceptera. Elle doit correspondre à une parole réellement entendue.

   **Action :** Faire choisir la reformulation fidèle d’un propos connu, puis vérifier auprès de l’interlocuteur. Préparer la personne tierce séparément.

   **Pont :** Avis reçu → vérification → confirmation ou rectification avant l’argument suivant.

3. **Sélection — L10, transition vers sujet connu ; expérience en prolongement.**

   - `L10-fr-zh.json:L10-fr-zh-08:v0` : **对了，你的新工作怎么样？** — « Au fait, comment ça se passe, ton nouveau travail ? ».
   - `L10-fr-zh.json:L10-fr-zh-08:v3` : **对了，你去过西安吗？** — « Au fait, tu es déjà allé(e) à Xi'an ? ».

   Le changement de sujet réutilise un état actuel du travail ou une question d’expérience en 过 : ce dernier n’est pas seulement un autre sujet.

   **Action :** Commencer par un sujet connu ; garder l’expérience de voyage entière pour un passage où 去过 a été préparé.

   **Pont :** Terminer un échange puis ouvrir un autre sujet avec une question déjà comprise.

4. **Répliques reçues — Réception L10 et essai conversationnel ; aucune certification CECRL.**

   - `L10-fr-zh.json:L10-fr-zh-d1:t0` : **最近怎么样？听说你想换工作？** — « Quoi de neuf ? J'ai entendu dire que tu voulais changer de travail ? » — rôle Un ami, reçu.
   - `L10-fr-zh.json:L10-fr-zh-d1:t2` : **如果我理解得对，你觉得现在是好时机？** — « Si je comprends bien, tu penses que c'est le bon moment ? » — rôle Un ami, reçu.
   - `L10-fr-zh.json:L10-fr-zh-d1:t8` : **总的来说，你已经决定了。** — « Pour résumer, tu as déjà décidé. » — rôle Un ami, reçu.
   - `L10-fr-zh.json:L10-fr-zh-d1:t9` : **差不多。对了，你周末有空吗？一起吃饭聊聊。** — « À peu près. Au fait, tu es libre ce week-end ? On mange ensemble et on en reparle. » — rôle Toi, apprenant.

   L’interlocuteur questionne l’intention, reformule le moment choisi et conclut que la décision est prise ; répondre suppose d’ajuster ce qui vient d’être dit.

   **Action :** Essayer la scène en sous-échanges puis sans modèle de l’apprenant ; observer pertinence, relance, réparation et continuité. La récitation des dix tours ne suffit pas.

   **Pont :** Intention reçue → réponse → clarification véritable → maintien ou révision de l’avis.

5. **Hors sélection / réserve — Dialogue de voisinage : réserve de relecture, pas exemple de réparation validé.**

   - `L10-fr-zh.json:L10-fr-zh-d3:t2` : **最近晚上楼上声音比较大，孩子睡不着。** — « Ces derniers temps, le soir, il y a pas mal de bruit au-dessus, les enfants n'arrivent pas à dormir. » — rôle Toi, apprenant.
   - `L10-fr-zh.json:L10-fr-zh-d3:t3` : **不好意思！是我儿子在练钢琴。** — « Oh, désolée ! C'est mon fils qui travaille son piano. » — rôle Une voisine, reçu.
   - `L10-fr-zh.json:L10-fr-zh-d3:t4` : **我不是这个意思，我是说能不能早一点练？** — « Ce n'est pas un reproche, je veux dire : est-ce qu'il pourrait répéter un peu plus tôt ? » — rôle Toi, apprenant.

   Le voisin s’excuse et explique le bruit ; aucun contresens explicite ne précède 我不是这个意思. Le français « Ce n’est pas un reproche » ajoute une intention qui n’est pas dite littéralement.

   **Action :** Faire relire la cohérence de la scène avant essai : choisir un contexte où une clarification est nécessaire, ou une autre réplique source appropriée. Garder le tour et ses aides intacts dans le stock.

   **Pont :** Un vrai malentendu ou un vrai besoin de précision doit précéder la formule de clarification.

## Japonais — lecteur francophone

### L1

**Sélection examinée :** `L1-fr-ja-03`, `L1-fr-ja-05`, `L1-fr-ja-11`.

**Décision proposée :** Garder les demandes utiles ; limiter la première scène et conserver les phrases de secours.

**Pont du niveau :** Demande entière → autre objet préparé → localisation → réponse reçue ; particules gardées avec leur groupe.

1. **Sélection — L1, demande polie concrète ; désir d’action ailleurs.**

   - `L1-fr-ja.json:L1-fr-ja-03:v0` : **コーヒーをください。** — « Je veux un café. ».
   - `L1-fr-ja.json:L1-fr-ja-03:v1` : **水をください。** — « Je veux de l'eau. ».

   をください adresse une demande à quelqu’un ; « Je veux » peut faire croire à une déclaration générale de désir.

   **Action :** Nommer la fonction « demander un objet » ; proposer en annexe « Un café / De l’eau, s’il vous plaît ». Sources et aides restent identiques.

   **Pont :** Écouter la phrase entière puis remplacer le groupe préparé avec sa particule.

2. **Sélection — L1, localisation après première demande.**

   - `L1-fr-ja.json:L1-fr-ja-05:v0` : **駅はどこですか。** — « Où est la gare ? ».
   - `L1-fr-ja.json:L1-fr-ja-05:v2` : **トイレはどこですか。** — « Où sont les toilettes ? ».

   駅はどこですか et トイレはどこですか partagent un cadre utile ; leurs réponses de direction ne sont pas encore préparées.

   **Action :** Préparer deux lieux familiers, puis une réponse cohérente. Ne pas avancer automatiquement au dialogue complet de gare.

   **Pont :** Question comprise → réponse spatiale reçue → bon lieu identifié.

3. **Sélection — L1, appuis entiers ; capacité en complément.**

   - `L1-fr-ja.json:L1-fr-ja-11:v0` : **分かりません。** — « Je ne comprends pas. ».
   - `L1-fr-ja.json:L1-fr-ja-11:v1` : **もう一度お願いします。** — « Répétez, s'il vous plaît. ».
   - `L1-fr-ja.json:L1-fr-ja-11:v3` : **フランス語が話せますか。** — « Parlez-vous français ? ».

   Incompréhension, répétition et capacité à parler français sont trois fonctions, non trois mots interchangeables.

   **Action :** Introduire incompréhension puis répétition en situation ; garder la question de langue disponible sans production obligatoire immédiate.

   **Pont :** Blocage simulé → demande de secours → répétition d’une réplique connue.

4. **Répliques reçues — Réception L1 par fonction ; dialogue intégral ensuite.**

   - `L1-fr-ja.json:L1-fr-ja-d1:t1` : **こんにちは。ご注文は？** — « Bonjour. Vous désirez ? » — rôle Serveur, reçu.
   - `L1-fr-ja.json:L1-fr-ja-d1:t2` : **コーヒーをお願いします。** — « Un café, s'il vous plaît. » — rôle Client, apprenant.
   - `L1-fr-ja.json:L1-fr-ja-d1:t3` : **ミルクは？** — « Avec du lait ? » — rôle Serveur, reçu.
   - `L1-fr-ja.json:L1-fr-ja-d1:t4` : **いいえ、結構です。いくらですか。** — « Non, merci. Combien ça coûte ? » — rôle Client, apprenant.

   ご注文は et ミルクは sont elliptiques ; la réponse finale ajoute refus puis prix, sans préparation par la seule commande.

   **Action :** Apprendre la question entière de commande ; préparer lait et refus à part avant de jouer les six tours.

   **Pont :** Reconnaître la commande attendue puis l’option proposée avant de répondre.

### L2

**Sélection examinée :** `L2-fr-ja-01`, `L2-fr-ja-06`, `L2-fr-ja-07`.

**Décision proposée :** Garder quantité, lieu et moment en passages distincts ; quatre variantes sont une réserve.

**Pont du niveau :** Demande L1 connue → groupe quantifié préparé ; lieu connu → position ; moment connu → départ.

1. **Sélection — L2, un compteur fonctionnel puis un autre.**

   - `L2-fr-ja.json:L2-fr-ja-01:v0` : **コーヒーを二つください。** — « Deux cafés, s'il vous plaît. ».
   - `L2-fr-ja.json:L2-fr-ja-01:v2` : **お茶を一杯ください。** — « Une tasse de thé, s'il vous plaît. ».
   - `L2-fr-ja.json:L2-fr-ja-01:v3` : **切符を二枚ください。** — « Deux billets, s'il vous plaît. ».

   二つ, 一杯 et 二枚 imposent compteurs et lectures différents ; passer au billet ajoute aussi une autre scène.

   **Action :** Café/eau d’abord en phrases entières ; préparer tasse puis billet ailleurs. Ne pas demander de calculer les lectures à partir du nombre seul.

   **Pont :** Demande connue → groupe quantifié entendu → remplacement contrôlé.

2. **Sélection — L2, position simple → groupe relationnel.**

   - `L2-fr-ja.json:L2-fr-ja-06:v0` : **ここにあります。** — « C'est ici. ».
   - `L2-fr-ja.json:L2-fr-ja-06:v2` : **駅の近くにあります。** — « C'est près de la gare. ».
   - `L2-fr-ja.json:L2-fr-ja-06:v3` : **二階にあります。** — « C'est au premier étage. ».

   Ici, près de la gare et au premier étage ajoutent des relations spatiales distinctes ; にあります ne couvre pas toute présence humaine.

   **Action :** Ici/là-bas d’abord, puis 駅の近く, puis étage avec un plan ; garder clairement ce qui est localisé.

   **Pont :** Question L1 réactivée → réponse complète avec référent connu.

3. **Sélection — L2, repère temporel entier.**

   - `L2-fr-ja.json:L2-fr-ja-07:v0` : **八時に出発します。** — « Je pars à huit heures. ».
   - `L2-fr-ja.json:L2-fr-ja-07:v1` : **明日出発します。** — « Je pars demain. ».
   - `L2-fr-ja.json:L2-fr-ja-07:v3` : **午後三時に出発します。** — « Je pars à trois heures de l'après-midi. ».

   八時に contient に, 明日 n’en prend pas ici ; « remplacer un mot de temps » pourrait produire une fausse règle.

   **Action :** Conserver les groupes complets avec les particules de la source ; comparer deux phrases entendues avant le choix de moment.

   **Pont :** Heure comprise → départ à cette heure ; jour compris → départ ce jour-là.

4. **Répliques reçues — Réception L2, choix puis paiement.**

   - `L2-fr-ja.json:L2-fr-ja-d1:t1` : **はい。ホットですか、アイスですか。** — « Oui. Chauds ou glacés ? » — rôle Serveur, reçu.
   - `L2-fr-ja.json:L2-fr-ja-d1:t2` : **ホットをお願いします。それから、サンドイッチはありますか。** — « Chauds, s'il vous plaît. Et puis, avez-vous des sandwichs ? » — rôle Client, apprenant.
   - `L2-fr-ja.json:L2-fr-ja-d1:t5` : **かしこまりました。全部で千二百円です。** — « Très bien. Ça fait mille deux cents yens en tout. » — rôle Serveur, reçu.

   Chaud/glacé est une alternative nouvelle ; le total ajoute nombre composé et formule de service.

   **Action :** Préparer d’abord le choix et sa réponse ; le total vient après apprentissage des nombres utiles, la formule du vendeur reste reçue entière.

   **Pont :** Alternative reconnue → réponse adaptée → nouvelle demande ; prix préparé plus tard.

### L3

**Sélection examinée :** `L3-fr-ja-01`, `L3-fr-ja-06`, `L3-fr-ja-07`.

**Décision proposée :** Distinguer service demandé, offre d’aide et réponse : qui agit doit rester clair.

**Pont du niveau :** Fonction connue → acteur identifié → phrase complète → réponse appropriée.

1. **Sélection — L3, demander à l’autre une action connue.**

   - `L3-fr-ja.json:L3-fr-ja-01:v0` : **書いてもらえますか。** — « Pouvez-vous l'écrire ? ».
   - `L3-fr-ja.json:L3-fr-ja-01:v1` : **手伝ってもらえますか。** — « Pouvez-vous m'aider ? ».
   - `L3-fr-ja.json:L3-fr-ja-01:v2` : **待ってもらえますか。** — « Pouvez-vous attendre ? ».

   書いて, 手伝って et 待って sont des formes différentes préparées en て ; on ne colle pas un verbe de dictionnaire devant もらえますか.

   **Action :** Écouter et imiter chaque demande entière avant de remplacer l’action ; commencer par une seule tâche utile.

   **Pont :** Demande de secours L1 réactivée comme fonction, puis nouvelle phrase entière.

2. **Sélection — L3, offre d’aide après demande de service.**

   - `L3-fr-ja.json:L3-fr-ja-06:v0` : **手伝いましょうか。** — « Je vous aide ? ».
   - `L3-fr-ja.json:L3-fr-ja-06:v2` : **写真を撮りましょうか。** — « Je prends une photo ? ».

   ましょうか propose que le locuteur aide l’autre ; もらえますか demande à l’autre d’agir. La même tâche ne suffit pas à rendre ces actes équivalents.

   **Action :** Jouer les deux rôles séparément, avec acteur explicite ; ne pas faire alterner les formules comme variantes libres.

   **Pont :** Tâche connue → acteur différent → autre phrase complète.

3. **Sélection — L3, formules contextualisées.**

   - `L3-fr-ja.json:L3-fr-ja-07:v0` : **はい、お願いします。** — « Oui, s'il vous plaît. ».
   - `L3-fr-ja.json:L3-fr-ja-07:v2` : **いいえ、結構です。** — « Non, merci. ».
   - `L3-fr-ja.json:L3-fr-ja-07:v3` : **すみません、ちょっと…。** — « Désolé, ce n'est pas possible… ».

   お願いします accepte une offre ; 結構です la refuse ; ちょっと… laisse un refus implicite dépendant du contexte.

   **Action :** Associer chaque réponse à une offre entendue ; accepter/refuser une boisson d’abord, refus implicite ensuite.

   **Pont :** Offre reçue → intention choisie → réponse appropriée au service offert.

4. **Répliques reçues — Réception L3, offre de boisson puis dessert.**

   - `L3-fr-ja.json:L3-fr-ja-d2:t1` : **はい、どうぞ。お飲み物はいかがですか。** — « Oui, voilà. Voulez-vous une boisson ? » — rôle Serveur, reçu.
   - `L3-fr-ja.json:L3-fr-ja-d2:t2` : **お茶をお願いします。これは何ですか。** — « Du thé, s'il vous plaît. Qu'est-ce que c'est, ça ? » — rôle Client, apprenant.
   - `L3-fr-ja.json:L3-fr-ja-d2:t5` : **かしこまりました。デザートはいかがですか。** — « Très bien. Voulez-vous un dessert ? » — rôle Serveur, reçu.
   - `L3-fr-ja.json:L3-fr-ja-d2:t6` : **いいえ、結構です。** — « Non, merci. » — rôle Client, apprenant.

   Les offres de boisson puis de dessert partagent une tournure polie, mais il faut identifier l’objet proposé pour répondre.

   **Action :** Préparer les deux tours entiers avec leurs réponses exactes ; traiter nom et description du plat séparément.

   **Pont :** Même acte d’offre sur deux objets connus ; réponse après compréhension.

### L4

**Sélection examinée :** `L4-fr-ja-01`, `L4-fr-ja-04`, `L4-fr-ja-05`.

**Décision proposée :** Préserver routines, famille et logement ; ne pas ramener に, で et が au même mot français.

**Pont du niveau :** Action connue → habitude ; proche connu → quantité préparée ; ville → logement précisé.

1. **Sélection — L4, journée décrite progressivement.**

   - `L4-fr-ja.json:L4-fr-ja-01:v0` : **普段は七時に起きます。** — « D'habitude, je me lève à sept heures. ».
   - `L4-fr-ja.json:L4-fr-ja-01:v1` : **普段は電車で会社に行きます。** — « D'habitude, je vais au travail en train. ».
   - `L4-fr-ja.json:L4-fr-ja-01:v2` : **普段は家で晩ご飯を食べます。** — « D'habitude, je dîne à la maison. ».

   Se lever à une heure, aller en train et dîner chez soi mobilisent heure, transport et lieu d’action ; 普段は ne prépare pas ces groupes.

   **Action :** Partir d’une routine déjà travaillée, puis préparer une seconde avec son complément entier.

   **Pont :** Action et complément reconnus → repère d’habitude ajouté.

2. **Sélection — L4, famille simple ; quantité et animal en prolongement.**

   - `L4-fr-ja.json:L4-fr-ja-04:v0` : **兄がいます。** — « J'ai un grand frère. ».
   - `L4-fr-ja.json:L4-fr-ja-04:v2` : **子供が二人います。** — « J'ai deux enfants. ».
   - `L4-fr-ja.json:L4-fr-ja-04:v3` : **犬が一匹います。** — « J'ai un chien. ».

   兄がいます, 子供が二人います et 犬が一匹います ajoutent comptage humain et animal, avec lectures à préparer.

   **Action :** Une personne pertinente d’abord ; groupes comptés ensuite ; conserver la distinction de fonction avec あります.

   **Pont :** Présence d’une personne connue → groupe compté entendu → autre phrase complète.

3. **Sélection — L4, habitation simple → groupe de lieu étendu.**

   - `L4-fr-ja.json:L4-fr-ja-05:v0` : **東京に住んでいます。** — « J'habite à Tokyo. ».
   - `L4-fr-ja.json:L4-fr-ja-05:v2` : **駅の近くに住んでいます。** — « J'habite près de la gare. ».
   - `L4-fr-ja.json:L4-fr-ja-05:v3` : **小さいアパートに住んでいます。** — « J'habite dans un petit appartement. ».

   Ville, proximité de gare et appartement décrit gardent に住んでいます mais ajoutent longueur et description.

   **Action :** Ville/ville d’abord, puis le lieu décrit ; séparer le travail en で de la série d’habitation.

   **Pont :** Deux villes connues avant une relation spatiale plus longue.

4. **Répliques reçues — Réception L4, un proche puis un autre.**

   - `L4-fr-ja.json:L4-fr-ja-d1:t3` : **お兄さんの仕事は何ですか。** — « Que fait votre frère comme travail ? » — rôle Un ami, reçu.
   - `L4-fr-ja.json:L4-fr-ja-d1:t4` : **銀行で働いています。** — « Il travaille dans une banque. » — rôle Toi, apprenant.
   - `L4-fr-ja.json:L4-fr-ja-d1:t5` : **そうですか。ご両親は？** — « Ah bon. Et vos parents ? » — rôle Un ami, reçu.
   - `L4-fr-ja.json:L4-fr-ja-d1:t6` : **両親はリヨンに住んでいます。父は医者です。** — « Mes parents habitent à Lyon. Mon père est médecin. » — rôle Toi, apprenant.

   お兄さん et ご両親 introduisent les proches de l’autre ; les réponses changent de référent et omettent parfois leur sujet.

   **Action :** Garder le référent visible ; préparer chaque question entière et distinguer les formes pour ses proches et ceux de l’autre.

   **Pont :** Question sur le proche identifié → réponse le concernant → changement de proche ensuite.

### L5

**Sélection examinée :** `L5-fr-ja-01`, `L5-fr-ja-09`, `L5-fr-ja-05`.

**Décision proposée :** Garder le récit court ; deux actions liées et passé des adjectifs viennent après un premier événement.

**Pont du niveau :** Action connue → même action racontée → question sur hier → réaction entière.

1. **Sélection — L5, changement temporel isolé avant diversification.**

   - `L5-fr-ja.json:L5-fr-ja-01:v0` : **昨日映画を見ました。** — « Hier, j'ai vu un film. ».
   - `L4-fr-ja.json:L4-fr-ja-11:v0` : **休みの日は映画を見ます。** — « Les jours de congé, je regarde des films. ».
   - `L5-fr-ja.json:L5-fr-ja-01:v2` : **昨日家で休みました。** — « Hier, je me suis reposé à la maison. ».

   Le film permet une reprise exacte 映画を見ます → 昨日映画を見ました ; changer aussitôt vers 食事をしました ou 休みました ajoute d’autres verbes.

   **Action :** S’appuyer sur ce couple exact ; préparer ensuite chaque nouvel événement entier.

   **Pont :** Même action et objet déjà travaillés → repère hier et forme passée entendue.

2. **Sélection — L5, question courte puis autre période.**

   - `L5-fr-ja.json:L5-fr-ja-09:v0` : **昨日は何をしましたか。** — « Qu'avez-vous fait hier ? ».
   - `L5-fr-ja.json:L5-fr-ja-09:v1` : **週末は何をしましたか。** — « Qu'avez-vous fait ce week-end ? ».
   - `L5-fr-ja.json:L5-fr-ja-09:v3` : **誕生日には何をしましたか。** — « Qu'avez-vous fait pour votre anniversaire ? ».

   Hier et week-end prolongent une même question ; l’anniversaire ouvre un événement et un lexique supplémentaires.

   **Action :** Question sur hier d’abord avec réponse prête ; autre période après compréhension et réemploi, pas après simple affichage.

   **Pont :** Question reçue → événement pertinent → autre repère connu.

3. **Sélection — L5, réactions entières contextualisées.**

   - `L5-fr-ja.json:L5-fr-ja-05:v0` : **いいですね！** — « C'est super ! ».
   - `L5-fr-ja.json:L5-fr-ja-05:v1` : **残念ですね。** — « Dommage. ».
   - `L5-fr-ja.json:L5-fr-ja-05:v3` : **大変でしたね。** — « Ça a dû être dur. ».

   Les réactions super, dommage et ça a dû être dur supposent des interprétations différentes ; ce ne sont pas quatre réponses libres à toute nouvelle.

   **Action :** Faire entendre l’événement qui motive chaque réaction ; éviter une sélection décorative de formules sans contexte.

   **Pont :** Récit connu → sens de la nouvelle → réaction appropriée.

4. **Répliques reçues — Réception L5, récit puis évaluation ; deux événements ensuite.**

   - `L5-fr-ja.json:L5-fr-ja-d2:t1` : **土曜日は買い物をしました。日曜日は家族と山に登りました。** — « Samedi, j'ai fait des courses. Dimanche, j'ai fait une randonnée en montagne avec ma famille. » — rôle Un ami, reçu.
   - `L5-fr-ja.json:L5-fr-ja-d2:t2` : **山ですか。大変でしたね。** — « En montagne ? Ça a dû être dur. » — rôle Toi, apprenant.
   - `L5-fr-ja.json:L5-fr-ja-d2:t3` : **いいえ、楽しかったです。天気も良かったです。** — « Non, c'était amusant. Il faisait beau, en plus. » — rôle Un ami, reçu.
   - `L5-fr-ja.json:L5-fr-ja-d2:t5` : **何の映画ですか。** — « Quel film ? » — rôle Un ami, reçu.
   - `L5-fr-ja.json:L5-fr-ja-d2:t6` : **日本の映画です。少し難しかったですが、面白かったです。** — « Un film japonais. C'était un peu difficile, mais intéressant. » — rôle Toi, apprenant.

   Le partenaire raconte deux journées, rectifie l’idée que la randonnée était difficile, puis demande quel film : récit, évaluation et relance s’enchaînent.

   **Action :** Préparer récit/réaction avant les huit tours ; maintenir la rectification いいえ, 楽しかったです compréhensible.

   **Pont :** Réaction au récit → confirmation ou rectification entendue → précision suivante.

### L6

**Sélection examinée :** `L6-fr-ja-01`, `L6-fr-ja-03`, `L6-fr-ja-06`.

**Décision proposée :** Distinguer intention, invitation et alternative sans présenter tous les futurs ensemble.

**Pont du niveau :** Action connue → projet entier → invitation → réponse et autre moment préparés.

1. **Sélection — L6, projet formulé, verbe entier conservé.**

   - `L6-fr-ja.json:L6-fr-ja-01:v0` : **週末に京都に行くつもりです。** — « J'ai l'intention d'aller à Kyoto ce week-end. ».
   - `L6-fr-ja.json:L6-fr-ja-01:v2` : **今晩早く寝るつもりです。** — « J'ai l'intention de me coucher tôt ce soir. ».

   つもりです utilise la forme de dictionnaire donnée dans la phrase ; y coller 行きます ou 寝ます n’est pas une substitution valable.

   **Action :** Préparer une intention entière sur action connue ; apprendre l’autre groupe verbal avant remplacement.

   **Pont :** Action connue en phrase polie → nouvelle phrase d’intention, sans transformation automatique.

2. **Sélection — L6, invitation connue ; déplacement pour activité ensuite.**

   - `L6-fr-ja.json:L6-fr-ja-03:v0` : **一緒に昼ご飯を食べませんか。** — « Ça vous dirait de déjeuner ensemble ? ».
   - `L6-fr-ja.json:L6-fr-ja-03:v1` : **映画を見に行きませんか。** — « Ça vous dirait d'aller voir un film ? ».
   - `L6-fr-ja.json:L6-fr-ja-03:v2` : **コーヒーを飲みませんか。** — « Ça vous dirait de prendre un café ? ».

   ませんか invite ici, sans refuser l’activité ; 映画を見に行きませんか ajoute aussi « aller voir ».

   **Action :** Café ou déjeuner d’abord ; déplacement vers activité ensuite. Ne pas enseigner invitation et tous les projets dans la même première écoute.

   **Pont :** Reconnaître la fonction d’invitation sans traduire la négation mot à mot.

3. **Sélection — L6, alternative temporelle concrète.**

   - `L6-fr-ja.json:L6-fr-ja-06:v0` : **ちょっと無理ですが、日曜日なら大丈夫です。** — « Là, c'est difficile, mais dimanche, c'est possible. ».
   - `L6-fr-ja.json:L6-fr-ja-06:v2` : **ちょっと無理ですが、夜なら行けます。** — « Là, c'est difficile, mais le soir, je peux venir. ».
   - `L6-fr-ja.json:L6-fr-ja-06:v3` : **ちょっと無理ですが、また今度お願いします。** — « Là, c'est difficile, mais une autre fois, volontiers. ».

   Dimanche, venir le soir et また今度 n’ont pas la même conséquence : le dernier reporte sans fixer un rendez-vous.

   **Action :** Refus et autre jour d’abord ; capacité et report vague dans des scènes séparées.

   **Pont :** Moment reçu → empêchement → autre moment disponible → confirmation.

4. **Répliques reçues — Réception L6, calendrier puis choix du repas.**

   - `L6-fr-ja.json:L6-fr-ja-d2:t0` : **マリーさん、今晩一緒に晩ご飯を食べませんか。** — « Marie, ça vous dirait de dîner ensemble ce soir ? » — rôle Un collègue, reçu.
   - `L6-fr-ja.json:L6-fr-ja-d2:t1` : **今晩はちょっと無理ですが、明日なら大丈夫です。** — « Ce soir, c'est difficile, mais demain, c'est possible. » — rôle Toi, apprenant.
   - `L6-fr-ja.json:L6-fr-ja-d2:t2` : **明日ですね。何が食べたいですか。** — « Demain, donc. Qu'est-ce que vous voudriez manger ? » — rôle Un collègue, reçu.
   - `L6-fr-ja.json:L6-fr-ja-d2:t3` : **寿司が食べたいです。** — « Je voudrais manger des sushis. » — rôle Toi, apprenant.

   Le partenaire invite puis demande ce que le lecteur aimerait manger ; le souhait en たい n’est pas acquis par la seule invitation.

   **Action :** Préparer cette question et sa réponse après le cycle de calendrier ; traiter les sushis et le souhait comme phrase entière.

   **Pont :** Question de moment → réponse ; question de repas → autre réponse préparée.

### L7

**Sélection examinée :** `L7-fr-ja-01`, `L7-fr-ja-03`, `L7-fr-ja-07`.

**Décision proposée :** Conserver cause, comparaison et avis ; préparer leurs formes différentes avant recombinaison.

**Pont du niveau :** Description connue → raison dans un bloc → comparaison stable → avis justifié.

1. **Sélection — L7, une raison connue puis diversité de causes.**

   - `L7-fr-ja.json:L7-fr-ja-01:v0` : **雨ですから、今日は家にいます。** — « Comme il pleut, je reste à la maison aujourd'hui. ».
   - `L7-fr-ja.json:L7-fr-ja-01:v1` : **疲れていますから、今日は家にいます。** — « Comme je suis fatigué, je reste à la maison aujourd'hui. ».
   - `L7-fr-ja.json:L7-fr-ja-01:v2` : **風邪をひきましたから、今日は家にいます。** — « Comme j'ai attrapé froid, je reste à la maison aujourd'hui. ».

   雨です, 疲れています et 風邪をひきました sont des raisons de formes différentes, dont état et événement accompli.

   **Action :** Préparer chaque cause entière ; commencer par une seule, sans déduire une terminaison universelle de « parce que ».

   **Pont :** Cause déjà comprise → même conséquence, avant plusieurs structures de cause.

2. **Sélection — L7, comparaison explicite → référence elliptique ensuite.**

   - `L7-fr-ja.json:L7-fr-ja-03:v0` : **これはあれより安いです。** — « Celui-ci est moins cher que celui-là. ».
   - `L7-fr-ja.json:L7-fr-ja-03:v1` : **これは前のより安いです。** — « Celui-ci est moins cher que l'ancien. ».
   - `L7-fr-ja.json:L7-fr-ja-03:v3` : **これはデパートのものより安いです。** — « Celui-ci est moins cher que celui du grand magasin. ».

   前の et デパートのもの supposent objet et nom sous-entendus ; la comparaison n’est claire que si les référents le sont.

   **Action :** Deux objets visibles d’abord ; objet ancien puis produit du magasin après préparation des groupes entiers.

   **Pont :** Deux objets identifiés → un critère connu → décision motivée.

3. **Sélection — L7, avis simple ; nuance et forme nominale ensuite.**

   - `L7-fr-ja.json:L7-fr-ja-07:v0` : **いいと思います。** — « Je pense que c'est bien. ».
   - `L7-fr-ja.json:L7-fr-ja-07:v1` : **高すぎると思います。** — « Je pense que c'est trop cher. ».
   - `L7-fr-ja.json:L7-fr-ja-07:v3` : **大丈夫だと思います。** — « Je pense que ça va aller. ».

   大丈夫 garde だ devant と思います ; 高すぎる ajoute « trop ». Tous les prédicats ne sont pas de simples adjectifs collés au même suffixe.

   **Action :** Conserver les formes entières ; avis simple d’abord, nuance et prédicat nominal à part.

   **Pont :** Opinion connue → phrase complète avec と思います, sans ajout mécanique de です.

4. **Répliques reçues — Réception L7, critère puis quantité/prix.**

   - `L7-fr-ja.json:L7-fr-ja-d1:t1` : **こちらの方が軽いです。でも、あちらの方が安いです。** — « Celui-ci est plus léger. Mais celui-là est moins cher. » — rôle Vendeur, reçu.
   - `L7-fr-ja.json:L7-fr-ja-d1:t2` : **いくらですか。** — « Combien coûtent-ils ? » — rôle Client, apprenant.
   - `L7-fr-ja.json:L7-fr-ja-d1:t3` : **こちらは八千円で、あちらは五千円です。** — « Celui-ci huit mille yens, celui-là cinq mille. » — rôle Vendeur, reçu.
   - `L7-fr-ja.json:L7-fr-ja-d1:t5` : **そうですね。こちらは色も三つあります。** — « Bon choix. Celui-ci existe aussi en trois couleurs. » — rôle Vendeur, reçu.

   Le vendeur oppose poids et prix puis ajoute couleurs et montants ; suivre la comparaison dépend des sacs visibles.

   **Action :** Préparer réponse chiffrée et référents ; couleurs après première décision poids/prix.

   **Pont :** Savoir quel sac a quel avantage avant de justifier son choix.

### L8

**Sélection examinée :** `L8-fr-ja-01`, `L8-fr-ja-02`, `L8-fr-ja-07`.

**Décision proposée :** Garder demandes élaborées et négociation ; préparer registre, condition et rôle séparément.

**Pont du niveau :** Demande L3 connue → forme plus respectueuse choisie → condition → réponse et réparation.

1. **Sélection — L8, demande plus respectueuse ; prix en scène spécifique.**

   - `L8-fr-ja.json:L8-fr-ja-01:v0` : **少し安くしていただけますか。** — « Pourriez-vous baisser un peu le prix ? ».
   - `L8-fr-ja.json:L8-fr-ja-01:v2` : **写真を撮っていただけますか。** — « Pourriez-vous prendre une photo ? ».

   ていただけますか change le registre ; négocier le prix n’est pas une attente naturelle dans toute boutique.

   **Action :** Commencer par photo ou explication dans une scène claire ; réserver la négociation à un contexte plausible à faire relire.

   **Pont :** Demande simple connue → même action avec la forme retenue, sans multiplier le keigo.

2. **Sélection — L8, condition connue ; possibilité ensuite.**

   - `L8-fr-ja.json:L8-fr-ja-02:v0` : **安かったら、買います。** — « Si c'est moins cher, j'achète. ».
   - `L8-fr-ja.json:L8-fr-ja-02:v1` : **割引があったら、買います。** — « S'il y a une remise, j'achète. ».
   - `L8-fr-ja.json:L8-fr-ja-02:v3` : **配達できたら、買います。** — « Si la livraison est possible, j'achète. ».

   安かったら ne dit pas à lui seul « moins cher que le prix actuel » ; 配達できたら ajoute la possibilité ; た n’est pas ici un passé narratif.

   **Action :** Proposer en annexe « Si c’est bon marché, je l’achète » pour v0 ; préparer chaque condition entière, sans dérivation depuis le français.

   **Pont :** Condition et décision entendues ensemble → condition identifiée → remplacement par une autre condition préparée.

3. **Sélection — L8, réception de la réparation ; autre rôle ensuite.**

   - `L8-fr-ja.json:L8-fr-ja-07:v0` : **すみません、すぐ直します。** — « Désolé, je répare tout de suite. ».
   - `L8-fr-ja.json:L8-fr-ja-07:v2` : **すみません、すぐ確認します。** — « Désolé, je vérifie tout de suite. ».
   - `L8-fr-ja.json:L8-fr-ja-07:v3` : **すみません、すぐ片付けます。** — « Désolé, je range tout de suite. ».

   Réparer, vérifier et ranger sont les actions de l’intervenant ; demander une réduction est l’acte du client.

   **Action :** Nommer les rôles ; recevoir les réponses de réparation d’abord, puis produire dans une deuxième scène.

   **Pont :** Problème du client → réponse de l’intervenant → confirmation.

4. **Répliques reçues — Réception L8, négociation en deux passages.**

   - `L8-fr-ja.json:L8-fr-ja-d1:t3` : **うーん、現金なら、七万五千円にできます。** — « Hum, en espèces, je peux faire soixante-quinze mille yens. » — rôle Vendeur, reçu.
   - `L8-fr-ja.json:L8-fr-ja-d1:t4` : **配達することはできますか。** — « Est-il possible de la faire livrer ? » — rôle Client, apprenant.
   - `L8-fr-ja.json:L8-fr-ja-d1:t5` : **はい、でも配達は来週なら大丈夫です。** — « Oui, mais la livraison, c'est possible seulement la semaine prochaine. » — rôle Vendeur, reçu.
   - `L8-fr-ja.json:L8-fr-ja-d1:t6` : **分かりました。じゃあ、それでお願いします。** — « D'accord. Alors, va pour ça. » — rôle Client, apprenant.

   Espèces pour le prix et semaine suivante pour la livraison sont deux conditions distinctes.

   **Action :** Préparer montants et délai ; traiter une condition à la fois puis vérifier ce qui a été accepté.

   **Pont :** Prix/paiement compris → délai compris → accord explicite.

### L9

**Sélection examinée :** `L9-fr-ja-01`, `L9-fr-ja-06`, `L9-fr-ja-12`.

**Décision proposée :** Garder résolution et clarification ; réserver les conseils longs et structures imbriquées à une seconde série.

**Pont du niveau :** Problème connu → réponse → clarification fidèle → solution ; une incertitude seulement à la fois.

1. **Sélection — L9, reformulation d’une information reçue précise.**

   - `L9-fr-ja.json:L9-fr-ja-01:v0` : **つまり、明日は休みということです。** — « Autrement dit, demain c'est fermé. ».
   - `L9-fr-ja.json:L9-fr-ja-01:v2` : **つまり、予約が必要だということです。** — « Autrement dit, il faut réserver. ».
   - `L9-fr-ja.json:L9-fr-ja-01:v3` : **つまり、もう一度来るということです。** — « Autrement dit, je dois revenir. ».

   休み peut désigner fermeture ou congé ; もう一度来る n’énonce pas seul l’obligation ajoutée par « je dois revenir ».

   **Action :** Fixer le contexte avant la paraphrase ; proposer une traduction annexe contextualisée sans transformer toute reformulation en obligation.

   **Pont :** Information initiale comprise → vérifier ce que つまり reprend réellement.

2. **Sélection — L9, un imprévu concret avant plusieurs.**

   - `L9-fr-ja.json:L9-fr-ja-06:v0` : **問題があります。切符をなくしました。どうしましょうか。** — « Il y a un problème : j'ai perdu mon billet. Qu'est-ce qu'on fait ? ».
   - `L9-fr-ja.json:L9-fr-ja-06:v1` : **問題があります。電車に乗り遅れました。どうしましょうか。** — « Il y a un problème : j'ai raté le train. Qu'est-ce qu'on fait ? ».
   - `L9-fr-ja.json:L9-fr-ja-06:v2` : **問題があります。予約が入っていません。どうしましょうか。** — « Il y a un problème : la réservation n'est pas enregistrée. Qu'est-ce qu'on fait ? ».

   Billet perdu, train raté et réservation non enregistrée contiennent des événements distincts, puis la même demande de solution.

   **Action :** Préparer un seul problème entier dans sa scène ; les autres restent situations à découvrir.

   **Pont :** Événement connu → demande d’aide → solution reçue.

3. **Sélection — L9, conseil prudent en seconde série.**

   - `L9-fr-ja.json:L9-fr-ja-12:v0` : **次の電車に乗った方がいいかもしれません。** — « Il vaudrait peut-être mieux prendre le prochain train. ».
   - `L9-fr-ja.json:L9-fr-ja-12:v3` : **先に電話した方がいいかもしれません。** — « Il vaudrait peut-être mieux téléphoner d'abord. ».

   乗った方がいいかもしれません et 電話した方がいいかもしれません cumulent conseil, réserve et forme verbale préparée.

   **Action :** Les recevoir entières après une solution simple ; ne pas exiger immédiatement leur fabrication par empilement de suffixes.

   **Pont :** Action conseillée comprise → nuance comprise → production libre ultérieure.

4. **Répliques reçues — Réception L9, transport et contraintes précises.**

   - `L9-fr-ja.json:L9-fr-ja-d1:t1` : **次の電車は三十分後です。この切符で乗れます。** — « Le prochain train est dans trente minutes. Vous pouvez monter avec ce billet. » — rôle Agent, reçu.
   - `L9-fr-ja.json:L9-fr-ja-d1:t2` : **つまり、同じ切符でいいということですか。** — « Autrement dit, vous voulez dire que le même billet suffit ? » — rôle Voyageur, apprenant.
   - `L9-fr-ja.json:L9-fr-ja-d1:t3` : **はい。でも、指定席は使えないかもしれません。** — « Oui. Mais il se peut que vous ne puissiez pas utiliser la place réservée. » — rôle Agent, reçu.
   - `L9-fr-ja.json:L9-fr-ja-d1:t4` : **自由席ということですか。** — « Vous voulez dire en place libre ? » — rôle Voyageur, apprenant.
   - `L9-fr-ja.json:L9-fr-ja-d1:t5` : **はい、自由席なら大丈夫です。** — « Oui, en place libre, pas de problème. » — rôle Agent, reçu.

   Même billet, siège réservé incertain et place libre sont trois informations ; 指定席 et 自由席 sont essentiels au sens.

   **Action :** Préparer les deux types de place et le billet avant le dialogue ; vérifier la distinction comprise avant de répondre.

   **Pont :** Droit de monter → restriction de place → clarification, sans simple répétition des mots.

### L10

**Sélection examinée :** `L10-fr-ja-01`, `L10-fr-ja-03`, `L10-fr-ja-09`.

**Décision proposée :** Viser une conversation plus autonome ; registre très respectueux en option, pas preuve de maîtrise.

**Pont du niveau :** Opinion → objection reçue → reformulation fidèle → réponse pertinente → transition ; aide restaurable.

1. **Sélection — L10, débat guidé puis décision argumentée réelle.**

   - `L10-fr-ja.json:L10-fr-ja-01:v0` : **一方で安いですが、他方で時間がかかります。** — « D'un côté, c'est bon marché, mais de l'autre, ça prend du temps. ».
   - `L10-fr-ja.json:L10-fr-ja-01:v2` : **一方で静かですが、他方で時間がかかります。** — « D'un côté, c'est calme, mais de l'autre, ça prend du temps. ».

   Le gabarit oppose toujours un avantage au temps nécessaire ; pour une maison calme, le contexte doit préciser ce qui prend du temps.

   **Action :** Définir l’objet discuté ; ne pas confondre répétition du double connecteur avec raisonnement autonome.

   **Pont :** Avis et conséquence connus → avantage/limite cohérents dans la scène.

2. **Sélection — L10, reformulation respectueuse en option contextualisée.**

   - `L10-fr-ja.json:L10-fr-ja-03:v0` : **つまり、値段が高すぎるとお考えなんですね。** — « Si je comprends bien, vous pensez que le prix est trop élevé. ».
   - `L10-fr-ja.json:L10-fr-ja-03:v2` : **つまり、もっと人が必要だとお考えなんですね。** — « Si je comprends bien, vous pensez qu'il faut plus de monde. ».

   とお考えなんですね ajoute respect et reformulation ; un nom peut exiger だ dans la proposition reprise.

   **Action :** Recevoir la formule entière en rôle professionnel ; en contexte amical, permettre une clarification déjà travaillée, sans imposer ce nouveau registre.

   **Pont :** Avis réellement entendu → reprise fidèle → correction éventuelle, registre stable.

3. **Sélection — L10, transition vers contenu connu.**

   - `L10-fr-ja.json:L10-fr-ja-09:v0` : **ところで、仕事はどうですか。** — « Au fait, comment va le travail ? ».
   - `L10-fr-ja.json:L10-fr-ja-09:v1` : **ところで、ご家族はどうですか。** — « Au fait, comment va votre famille ? ».
   - `L10-fr-ja.json:L10-fr-ja-09:v3` : **ところで、日本語の勉強はどうですか。** — « Au fait, comment vont vos études de japonais ? ».

   Changer de sujet vers travail, famille ou apprentissage exige préparer la question et une réponse, pas seulement ところで.

   **Action :** Choisir un sujet déjà vécu ; garder les autres en réserve et observer si l’échange continue après la transition.

   **Pont :** Clore un sous-échange → question sur un sujet connu → réponse de l’autre.

4. **Répliques reçues — Réception L10 puis évaluation qualitative ; aucun niveau CECRL mesuré.**

   - `L10-fr-ja.json:L10-fr-ja-d1:t2` : **確かにそうですが、今はリモートワークもありますよ。** — « C'est vrai, mais maintenant il y a aussi le télétravail. » — rôle Un ami, reçu.
   - `L10-fr-ja.json:L10-fr-ja-d1:t3` : **そうですね。でも、子供の学校が心配です。** — « Oui. Mais l'école des enfants m'inquiète. » — rôle Toi, apprenant.
   - `L10-fr-ja.json:L10-fr-ja-d1:t4` : **つまり、教育が一番大切だとお考えなんですね。** — « Si je comprends bien, vous pensez que l'éducation est le plus important. » — rôle Un ami, reçu.
   - `L10-fr-ja.json:L10-fr-ja-d1:t5` : **はい。それに、病院も遠いです。** — « Oui. En plus, l'hôpital est loin. » — rôle Toi, apprenant.
   - `L10-fr-ja.json:L10-fr-ja-d1:t8` : **そう思います。ところで、ご家族はお元気ですか。** — « Je pense aussi. Au fait, comment va votre famille ? » — rôle Un ami, reçu.
   - `L10-fr-ja.json:L10-fr-ja-d1:t9` : **はい、おかげさまで。** — « Bien, merci. » — rôle Toi, apprenant.

   Objection sur le télétravail, reformulation de la priorité éducative et nouvelles familiales exigent de suivre l’autre, pas d’aligner des connecteurs.

   **Action :** Essayer argument/objection puis transition ; observer fidélité, pertinence et réparation sans script imposé de l’apprenant.

   **Pont :** Objection entendue → réponse liée → validation du point de vue → nouveau sujet.

## Coréen — lecteur francophone

### L1

**Sélection examinée :** `L1-fr-ko-03`, `L1-fr-ko-05`, `L1-fr-ko-11`.

**Décision proposée :** Garder les demandes quotidiennes ; ne pas transformer l’identité en série de mots sous 저는.

**Pont du niveau :** Demande entière sans quantité → deuxième demande préparée → question reçue connue ; groupes avec particules conservés.

1. **Sélection — L1, demande concrète ; désir d’action distinct.**

   - `L1-fr-ko.json:L1-fr-ko-03:v0` : **커피 주세요.** — « Je veux un café. ».
   - `L1-fr-ko.json:L1-fr-ko-03:v1` : **물 주세요.** — « Je veux de l'eau. ».

   주세요 exprime une demande polie au destinataire ; « Je veux » la rapproche à tort d’un désir intérieur ou d’un désir d’action.

   **Action :** Nommer l’acte « demander une boisson » et proposer en annexe « Un café / De l’eau, s’il vous plaît ». Garder toutes les données originales.

   **Pont :** Une demande comprise et imitée → seule la boisson préparée change.

2. **Sélection — L1, question de lieu en groupes complets.**

   - `L1-fr-ko.json:L1-fr-ko-05:v0` : **역이 어디예요?** — « Où est la gare ? ».
   - `L1-fr-ko.json:L1-fr-ko-05:v1` : **출구가 어디예요?** — « Où est la sortie ? ».

   역이 et 출구가 contiennent la particule choisie selon le groupe ; le gabarit ne signifie pas remplacer seulement le nom puis conserver 이.

   **Action :** Garder le nom avec sa particule dans le morceau préparé ; deux lieux seulement avant un nouvel itinéraire.

   **Pont :** Phrase entière du premier lieu → second groupe préparé → question de localisation.

3. **Sélection — L1, appuis entiers et accessibles.**

   - `L1-fr-ko.json:L1-fr-ko-11:v0` : **이해 못 했어요.** — « Je ne comprends pas. ».
   - `L1-fr-ko.json:L1-fr-ko-11:v1` : **다시 말해 주세요.** — « Répétez, s'il vous plaît. ».
   - `L1-fr-ko.json:L1-fr-ko-11:v2` : **천천히 말해 주세요.** — « Plus lentement, s'il vous plaît. ».

   이해 못 했어요 constate ne pas avoir compris ; 다시 et 천천히 demandent répétition ou débit. Trois actes utiles, pas des synonymes à choisir au hasard.

   **Action :** Introduire constat puis une demande de secours selon le blocage réel ; ne pas exiger l’analyse du passé dès L1.

   **Pont :** Une réplique connue mal entendue → demande adaptée → réplique répétée.

4. **Hors sélection / réserve — L1 : identité choisie ; provenance et variations de copule en annexe préparée.**

   - `L1-fr-ko.json:L1-fr-ko-01:v0` : **저는 학생이에요.** — « Je suis étudiant. ».
   - `L1-fr-ko.json:L1-fr-ko-01:v2` : **저는 파리에서 왔어요.** — « Je suis de Paris. ».
   - `L1-fr-ko.json:L1-fr-ko-02:v0` : **제 이름은 마리예요.** — « Je m'appelle Marie. ».
   - `L1-fr-ko.json:L1-fr-ko-02:v1` : **제 이름은 폴이에요.** — « Je m'appelle Paul. ».

   학생이에요 est nominal, 파리에서 왔어요 est un verbe d’arrivée au passé ; 마리예요 et 폴이에요 changent aussi la forme de la copule selon le nom.

   **Action :** Séparer état/identité et provenance ; préparer la provenance comme phrase entière plus tard. Garder nom et terminaison ensemble, sans exiger un exercice morphologique.

   **Pont :** Deux identités nominales connues avant une provenance ; aucun « 저는 + mot » universel.

5. **Répliques reçues — Réception L1 limitée au choix ; café intégral ensuite.**

   - `L1-fr-ko.json:L1-fr-ko-d1:t1` : **안녕하세요. 뭐 드릴까요?** — « Bonjour. Vous désirez ? » — rôle Serveur, reçu.
   - `L1-fr-ko.json:L1-fr-ko-d1:t2` : **커피 하나 주세요.** — « Un café, s'il vous plaît. » — rôle Client, apprenant.
   - `L1-fr-ko.json:L1-fr-ko-d1:t3` : **우유 넣을까요?** — « Avec du lait ? » — rôle Serveur, reçu.
   - `L1-fr-ko.json:L1-fr-ko-d1:t4` : **아니요, 괜찮아요. 얼마예요?** — « Non, merci. Combien ça coûte ? » — rôle Client, apprenant.

   Le serveur demande le choix puis propose d’ajouter du lait ; le client commande avec 하나 puis refuse et demande le prix. La commande sans quantité ne prépare pas tout cela.

   **Action :** Préparer la question entière et la demande du pilote ; lait, quantité, refus et prix ont leurs propres étapes. 우유 넣을까요 reste une proposition d’ajout, pas une offre de verre de lait.

   **Pont :** Question comprise → demande préparée ; option lait seulement après sa réponse préparée.

### L2

**Sélection examinée :** `L2-fr-ko-01`, `L2-fr-ko-03`, `L2-fr-ko-05`.

**Décision proposée :** Maintenir les précisions, en séparant compteur, lieu et rendez-vous ; repères complets plutôt que mots seuls.

**Pont du niveau :** Demande L1 → quantité préparée ; question de lieu → position ; temps ou lieu de rencontre préparé séparément.

1. **Sélection — L2, un compteur en contexte puis un autre.**

   - `L2-fr-ko.json:L2-fr-ko-01:v0` : **커피 두 잔 주세요.** — « Je voudrais deux cafés, s'il vous plaît. ».
   - `L2-fr-ko.json:L2-fr-ko-01:v1` : **물 한 잔 주세요.** — « Je voudrais un verre d'eau, s'il vous plaît. ».
   - `L2-fr-ko.json:L2-fr-ko-01:v2` : **빵 세 개 주세요.** — « Je voudrais trois pains, s'il vous plaît. ».
   - `L2-fr-ko.json:L2-fr-ko-01:v3` : **표 두 장 주세요.** — « Je voudrais deux billets, s'il vous plaît. ».

   두 잔, 한 잔, 세 개 et 두 장 changent nombre, compteur et objet ; heures et minutes utilisent encore d’autres combinaisons.

   **Action :** Commencer café/eau avec 잔 ; pain et billet après leurs groupes préparés. Ne pas présenter les quatre comme une première séance unique.

   **Pont :** Objet connu → quantité entendue avec ce même objet → autre groupe prêt à l’emploi.

2. **Sélection — L2, position simple ; étage en réserve de contexte.**

   - `L2-fr-ko.json:L2-fr-ko-03:v0` : **화장실은 여기에 있어요.** — « Les toilettes sont ici. ».
   - `L2-fr-ko.json:L2-fr-ko-03:v2` : **화장실은 이 층에 있어요.** — « Les toilettes sont à cet étage. ».
   - `L2-fr-ko.json:L2-fr-ko-03:v3` : **화장실은 카페 옆에 있어요.** — « Les toilettes sont à côté du café. ».

   여기에 et 카페 옆에 sont des groupes spatiaux complets. 이 층 peut renvoyer contextuellement à « cet étage » ou au deuxième étage, ambiguïté absente d’un simple tableau.

   **Action :** Ici/là-bas d’abord ; préparer à côté du café puis fixer un plan et le sens voulu pour 이 층. Ne pas harmoniser ce groupe automatiquement.

   **Pont :** Question connue → réponse entière située sur un plan → autre relation préparée.

3. **Sélection — L2, moment → lieu de rendez-vous dans un autre passage.**

   - `L2-fr-ko.json:L2-fr-ko-05:v0` : **여덟 시에 만나요.** — « On se voit à huit heures. ».
   - `L2-fr-ko.json:L2-fr-ko-05:v2` : **내일 만나요.** — « On se voit demain. ».
   - `L2-fr-ko.json:L2-fr-ko-05:v3` : **역 앞에서 만나요.** — « On se voit devant la gare. ».

   여덟 시에 et 내일 donnent un moment ; 역 앞에서 donne un lieu d’action. La même case du gabarit accueille ici deux types de précisions.

   **Action :** Faire une série de moments puis une série de lieux ; garder 에/에서 avec les groupes, sans croire qu’un mot français se remplace partout.

   **Pont :** Fixer quand, puis où, avant de réunir les deux informations.

4. **Répliques reçues — Réception L2, choix puis orientation.**

   - `L2-fr-ko.json:L2-fr-ko-d1:t1` : **네. 따뜻한 거요, 차가운 거요?** — « Oui. Chaud ou froid ? » — rôle Serveur, reçu.
   - `L2-fr-ko.json:L2-fr-ko-d1:t2` : **따뜻한 거요. 그리고 물 조금 주세요.** — « Chaud. Et un peu d'eau, s'il vous plaît. » — rôle Client, apprenant.
   - `L2-fr-ko.json:L2-fr-ko-d1:t5` : **저기 계단 옆에 있어요.** — « Là-bas, à côté de l'escalier. » — rôle Serveur, reçu.

   Le serveur oppose chaud/froid puis localise près de l’escalier ; les adjectifs et 계단 sont des réceptions nouvelles.

   **Action :** Préparer le choix de boisson avec sa réponse ; traiter ensuite la question de toilettes et la direction sur plan.

   **Pont :** Une question reçue identifiable → réponse adaptée ; ne pas mélanger les deux scènes à la première écoute.

### L3

**Sélection examinée :** `L3-fr-ko-01`, `L3-fr-ko-05`, `L3-fr-ko-06`.

**Décision proposée :** Garder demande, proposition et réponse ; stabiliser rôle et registre avant de varier les actions.

**Pont du niveau :** Action connue → demander à l’autre de la faire ; ensuite activité commune → acceptation ou refus approprié.

1. **Sélection — L3, demande de service entre interlocuteurs choisis.**

   - `L3-fr-ko.json:L3-fr-ko-01:v0` : **도와 줄 수 있어요?** — « Vous pouvez m'aider ? ».
   - `L3-fr-ko.json:L3-fr-ko-01:v1` : **다시 말해 줄 수 있어요?** — « Vous pouvez répéter ? ».
   - `L3-fr-ko.json:L3-fr-ko-01:v3` : **사진 찍어 줄 수 있어요?** — « Vous pouvez prendre une photo ? ».

   도와, 말해 et 찍어 sont des formes verbales entières ; la même fin 줄 수 있어요 ne prépare ni ces changements ni tout registre social.

   **Action :** Partir d’une demande de répétition connue puis préparer aider/photo en phrase entière ; fixer des interlocuteurs de registre adapté.

   **Pont :** Fonction connue → nouvelle phrase complète → autre action seulement après écoute.

2. **Sélection — L3, activité commune en contexte explicite.**

   - `L3-fr-ko.json:L3-fr-ko-05:v0` : **같이 먹어요?** — « On mange ensemble ? ».
   - `L3-fr-ko.json:L3-fr-ko-05:v1` : **같이 가요?** — « On y va ensemble ? ».
   - `L3-fr-ko.json:L3-fr-ko-05:v2` : **같이 커피 마셔요?** — « On prend un café ensemble ? ».

   같이 et l’intonation peuvent proposer une activité ; selon le contexte, la même forme peut aussi demander si l’on fait déjà quelque chose ensemble.

   **Action :** Mettre en scène le moment d’invitation et l’interlocuteur ; ne pas présenter la question écrite seule comme une invitation universelle.

   **Pont :** Activité connue → proposition entendue → réponse liée à cette invitation.

3. **Sélection — L3, réponses entières contextualisées.**

   - `L3-fr-ko.json:L3-fr-ko-06:v0` : **네, 좋아요.** — « Oui, d'accord. ».
   - `L3-fr-ko.json:L3-fr-ko-06:v1` : **아니요, 괜찮아요.** — « Non, merci. ».
   - `L3-fr-ko.json:L3-fr-ko-06:v2` : **글쎄요, 잘 모르겠어요.** — « Euh, je ne sais pas trop. ».

   괜찮아요 peut refuser une offre ou dire que tout va bien ; la présence de 아니요 et le contexte distinguent ces fonctions.

   **Action :** Apprendre d’abord le refus complet après une offre préparée ; comparer ensuite avec le 괜찮아요 d’acceptation dans une autre scène.

   **Pont :** Offre reçue → intention de refuser/accepter → réponse choisie sans mot-à-mot.

4. **Répliques reçues — Réception L3, même expression dans une fonction distincte.**

   - `L3-fr-ko.json:L3-fr-ko-d2:t5` : **조금 매워요. 괜찮아요?** — « Un peu. Ça va ? » — rôle Serveur, reçu.
   - `L3-fr-ko.json:L3-fr-ko-d2:t6` : **네, 괜찮아요. 비빔밥 하나 주세요. 그리고 물 한 잔 주세요.** — « Oui, ça va. Un bibimbap, s'il vous plaît. Et un verre d'eau. » — rôle Client, apprenant.
   - `L3-fr-ko.json:L3-fr-ko-d2:t7` : **네, 잠시만요.** — « D'accord, un instant. » — rôle Serveur, reçu.

   조금 매워요. 괜찮아요? vérifie si le lecteur accepte un plat épicé ; sa réponse 네, 괜찮아요 est l’inverse pragmatique du refus appris avec 아니요.

   **Action :** Préparer la question de tolérance au goût et la réponse complète ; ne pas noter faux 괜찮아요 parce qu’il avait servi à refuser.

   **Pont :** Contexte épicé compris → accord/refus choisi → commande, avant le dialogue complet.

### L4

**Sélection examinée :** `L4-fr-ko-01`, `L4-fr-ko-04`, `L4-fr-ko-05`.

**Décision proposée :** Garder les descriptions personnelles, en préparant l’honorification et les liens familiaux selon le lecteur.

**Pont du niveau :** Routine connue → habitude ; personne familiale pertinente → quantité ; lieu de vie → précision.

1. **Sélection — L4, une routine puis deux.**

   - `L4-fr-ko.json:L4-fr-ko-01:v0` : **보통 일곱 시에 일어나요.** — « D'habitude, je me lève à sept heures. ».
   - `L4-fr-ko.json:L4-fr-ko-01:v1` : **보통 지하철을 타요.** — « D'habitude, je prends le métro. ».
   - `L4-fr-ko.json:L4-fr-ko-01:v2` : **보통 집에서 밥을 먹어요.** — « D'habitude, je mange à la maison. ».

   L’heure du lever, le métro et le repas chez soi changent plusieurs compléments et verbes ; 보통 n’en fait pas une unique opération déjà connue.

   **Action :** Réutiliser une routine travaillée, puis préparer la seconde entièrement ; ne pas ajouter heure, transport et nouveau verbe à la fois.

   **Pont :** Phrase d’action connue → repère d’habitude → précision préparée.

2. **Sélection — L4, famille située ; quantité ensuite.**

   - `L4-fr-ko.json:L4-fr-ko-04:v0` : **오빠가 있어요.** — « J'ai un grand frère. ».
   - `L4-fr-ko.json:L4-fr-ko-04:v1` : **여동생이 있어요.** — « J'ai une petite sœur. ».
   - `L4-fr-ko.json:L4-fr-ko-04:v2` : **아이가 둘 있어요.** — « J'ai deux enfants. ».

   오빠 suppose ici une locutrice ; 여동생 et 아이가 둘 ne portent pas le même lien ni la même opération de comptage.

   **Action :** Présenter le personnage ou la pertinence personnelle ; garder cette phrase exacte sans la proposer indifféremment à tout lecteur. Autres formes familiales nécessitent leurs propres sources.

   **Pont :** Une relation familiale connue → phrase qui correspond au rôle → autre relation préparée.

3. **Sélection — L4, lieu simple ; cohabitation en prolongement.**

   - `L4-fr-ko.json:L4-fr-ko-05:v0` : **서울에 살아요.** — « J'habite à Séoul. ».
   - `L4-fr-ko.json:L4-fr-ko-05:v2` : **파리 근처에 살아요.** — « J'habite près de Paris. ».
   - `L4-fr-ko.json:L4-fr-ko-05:v3` : **부모님하고 같이 살아요.** — « J'habite avec mes parents. ».

   서울에 et 파리 근처에 localisent ; 부모님하고 같이 ajoute une cohabitation avec quelqu’un. Ce n’est plus seulement un autre lieu.

   **Action :** Ville puis proximité d’abord ; préparer la cohabitation dans une autre scène, sans la ranger comme nom de lieu interchangeable.

   **Pont :** Où j’habite → précision du lieu ; ensuite avec qui, après préparation du nouveau groupe.

4. **Répliques reçues — Réception L4, un proche et une fonction à la fois.**

   - `L4-fr-ko.json:L4-fr-ko-d1:t1` : **네 명이에요. 부모님하고 여동생이 있어요. 마리 씨는요?** — « Quatre. Mes parents et une petite sœur. Et vous, Marie ? » — rôle Un ami, reçu.
   - `L4-fr-ko.json:L4-fr-ko-d1:t2` : **저는 오빠가 한 명 있어요. 부모님은 파리 근처에 사세요.** — « Moi, j'ai un grand frère. Mes parents habitent près de Paris. » — rôle Toi, apprenant.
   - `L4-fr-ko.json:L4-fr-ko-d1:t3` : **오빠는 뭐 해요?** — « Il fait quoi, votre frère ? » — rôle Un ami, reçu.
   - `L4-fr-ko.json:L4-fr-ko-d1:t4` : **은행에서 일해요. 민수 씨 여동생은요?** — « Il travaille dans une banque. Et votre sœur ? » — rôle Toi, apprenant.

   Le partenaire décrit sa famille puis demande le métier du frère ; 사세요 pour les parents ajoute une forme honorifique non produite par 살아요 + lieu.

   **Action :** Préparer la réplique reçue sur la famille et la question sur le frère ; recevoir l’honorification puis imiter la phrase entière, sans la déduire seule du gabarit.

   **Pont :** Proche identifié → question comprise → réponse le concernant, puis autre proche.

### L5

**Sélection examinée :** `L5-fr-ko-01`, `L5-fr-ko-07`, `L5-fr-ko-05`.

**Décision proposée :** Garder récit et nouvelles ; choisir un événement connu avant contractions, réactions et enchaînement.

**Pont du niveau :** Action déjà travaillée → même événement hier → question sur hier → réaction ; récit à deux actions ensuite.

1. **Sélection — L5, événement unique puis répertoire de passés.**

   - `L5-fr-ko.json:L5-fr-ko-01:v0` : **어제 친구를 만났어요.** — « Hier, j'ai vu un ami. ».
   - `L4-fr-ko.json:L4-fr-ko-03:v2` : **저녁에 친구를 만나요.** — « Le soir, je vois des amis. ».
   - `L5-fr-ko.json:L5-fr-ko-01:v2` : **어제 집에서 쉬었어요.** — « Hier, je me suis reposé(e) à la maison. ».
   - `L5-fr-ko.json:L5-fr-ko-01:v3` : **어제 늦게 잤어요.** — « Hier, je me suis couché(e) tard. ».

   친구를 만나요 permet une reprise exacte vers 만났어요 ; 쉬었어요 et 잤어요 ajoutent d’autres formes de verbes.

   **Action :** Travailler d’abord le couple même action/temps différent ; préparer chaque forme entière avant nouvelle substitution.

   **Pont :** Même ami et même action connus → hier → phrase passée entière.

2. **Sélection — L5, question et événement ciblés.**

   - `L5-fr-ko.json:L5-fr-ko-07:v0` : **어제 뭐 했어요?** — « Qu'est-ce que vous avez fait hier ? ».
   - `L5-fr-ko.json:L5-fr-ko-07:v1` : **주말에 뭐 했어요?** — « Qu'est-ce que vous avez fait ce week-end ? ».
   - `L5-fr-ko.json:L5-fr-ko-07:v2` : **휴가 때 뭐 했어요?** — « Qu'est-ce que vous avez fait pendant les vacances ? ».

   Hier, week-end et vacances n’appellent pas le même volume de réponse ; une question courte peut lancer un récit encore trop riche.

   **Action :** Réponse d’un événement à la question sur hier d’abord ; élargir la durée après une autre réplique préparée.

   **Pont :** Question de période comprise → réponse pertinente, puis seconde information si demandée.

3. **Sélection — L5, réaction simple ; supposition empathique ensuite.**

   - `L5-fr-ko.json:L5-fr-ko-05:v0` : **정말요?** — « Vraiment ? ».
   - `L5-fr-ko.json:L5-fr-ko-05:v1` : **잘됐네요!** — « C'est super ! ».
   - `L5-fr-ko.json:L5-fr-ko-05:v3` : **힘들었겠네요.** — « Ça a dû être dur. ».

   정말요 est une réaction brève ; 힘들었겠네요 combine passé et supposition empathique sur la difficulté vécue par l’autre.

   **Action :** Commencer par réaction courte contextualisée ; garder l’empathie comme bloc reçu/imitable, pas comme terminaison à générer aussitôt.

   **Pont :** Nouvelle comprise → réaction adéquate → retour de l’autre.

4. **Répliques reçues — Réception L5, raison passée puis état actuel.**

   - `L5-fr-ko.json:L5-fr-ko-d3:t0` : **어제 왜 안 왔어요?** — « Pourquoi vous n'êtes pas venu hier ? » — rôle Responsable, reçu.
   - `L5-fr-ko.json:L5-fr-ko-d3:t1` : **미안해요. 어제 아이가 아팠어요.** — « Désolé. Hier, mon enfant était malade. » — rôle Toi, apprenant.
   - `L5-fr-ko.json:L5-fr-ko-d3:t2` : **아이고, 지금은 괜찮아요?** — « Oh là là, ça va mieux maintenant ? » — rôle Responsable, reçu.
   - `L5-fr-ko.json:L5-fr-ko-d3:t3` : **네, 병원에 갔어요. 이제 괜찮아요.** — « Oui, on est allés à l'hôpital. Ça va maintenant. » — rôle Toi, apprenant.
   - `L5-fr-ko.json:L5-fr-ko-d3:t4` : **다행이네요. 힘들었겠네요.** — « Tant mieux. Ça a dû être dur. » — rôle Responsable, reçu.

   Le collègue demande l’absence puis l’état actuel de l’enfant ; le lecteur répond avec maladie, hôpital et amélioration, pas seulement une action passée.

   **Action :** Préparer les deux questions entières et les réponses ; le cycle d’absence se joue après le récit simple, avec rôle patient/enfant clairement maintenu.

   **Pont :** Question sur hier → réponse ; question sur maintenant → réponse d’état, sans mélanger temporalités.

### L6

**Sélection examinée :** `L6-fr-ko-01`, `L6-fr-ko-03`, `L6-fr-ko-05`.

**Décision proposée :** Distinguer projet, invitation et impossibilité ; choisir un registre relationnel cohérent.

**Pont du niveau :** Action connue → projet entier ; invitation reçue → refus motivé par disponibilité → autre moment.

1. **Sélection — L6, projet connu, morphologie dans le groupe.**

   - `L6-fr-ko.json:L6-fr-ko-01:v0` : **내일 집에 있을 거예요.** — « Demain, je vais rester à la maison. ».
   - `L6-fr-ko.json:L6-fr-ko-01:v1` : **내일 친구를 만날 거예요.** — « Demain, je vais voir un ami. ».
   - `L6-fr-ko.json:L6-fr-ko-01:v2` : **내일 영화를 볼 거예요.** — « Demain, je vais regarder un film. ».

   있을, 만날 et 볼 devant 거예요 ne se construisent pas en ajoutant simplement un mot à la forme en 요 déjà apprise.

   **Action :** Apprendre le projet entier d’une action connue, puis le second ; ne pas proposer un assemblage aveugle de formes.

   **Pont :** Même action connue → projet entendu avec son groupe verbal complet.

2. **Sélection — L6, invitation relationnelle claire.**

   - `L6-fr-ko.json:L6-fr-ko-03:v0` : **같이 점심 먹을래요?** — « Ça vous dit de déjeuner ensemble ? ».
   - `L6-fr-ko.json:L6-fr-ko-03:v1` : **같이 영화 볼래요?** — « Ça vous dit de voir un film ensemble ? ».
   - `L6-fr-ko.json:L6-fr-ko-03:v2` : **같이 커피 마실래요?** — « Ça vous dit de prendre un café ensemble ? ».

   -(으)ㄹ래요 invite ici entre interlocuteurs familiers-polis ; ce n’est pas la même invitation appropriée à tout supérieur ou inconnu.

   **Action :** Nommer le contexte collègue/ami et préparer une activité ; ne pas multiplier invitation, souhait en 싶어요 et projet au premier passage.

   **Pont :** Activité connue → invitation comprise → réponse, sans empiler les modalités.

3. **Sélection — L6, disponibilité et alternative concrètes.**

   - `L6-fr-ko.json:L6-fr-ko-05:v0` : **미안해요, 토요일에는 못 가요.** — « Désolé(e), samedi je ne peux pas venir. ».
   - `L6-fr-ko.json:L6-fr-ko-05:v1` : **미안해요, 내일은 못 가요.** — « Désolé(e), demain je ne peux pas venir. ».
   - `L6-fr-ko.json:L6-fr-ko-05:v2` : **미안해요, 저녁에는 못 가요.** — « Désolé(e), ce soir je ne peux pas venir. ».

   못 가요 exprime l’empêchement ; 저녁에는 n’encode pas à lui seul « ce soir » si le contexte ne fixe pas le jour.

   **Action :** Fixer le jour dans la scène ; préparer un refus puis une alternative, sans assimiler empêchement et refus volontaire.

   **Pont :** Moment proposé → empêchement compris → autre moment → confirmation.

4. **Répliques reçues — Réception L6, un détail renégocié.**

   - `L6-fr-ko.json:L6-fr-ko-d1:t3` : **좋아요! 언제요?** — « Oui ! Quand ? » — rôle Un ami, reçu.
   - `L6-fr-ko.json:L6-fr-ko-d1:t4` : **토요일 저녁 일곱 시 어때요?** — « Samedi à dix-neuf heures, ça vous va ? » — rôle Toi, apprenant.
   - `L6-fr-ko.json:L6-fr-ko-d1:t5` : **미안해요, 토요일에는 못 가요. 일요일은 어때요?** — « Désolée, samedi je ne peux pas. Et dimanche ? » — rôle Un ami, reçu.
   - `L6-fr-ko.json:L6-fr-ko-d1:t6` : **일요일도 괜찮아요. 그럼 일요일 일곱 시에 역 앞에서 봐요.** — « Dimanche, ça va aussi. Alors dimanche dix-neuf heures devant la gare. » — rôle Toi, apprenant.

   La partenaire accepte l’activité mais refuse samedi et propose dimanche ; accepter l’activité ne signifie donc pas accepter l’horaire.

   **Action :** Préparer l’alternative entière et le jour final ; vérifier quel détail a changé avant de poursuivre.

   **Pont :** Invitation acceptée → horaire refusé → contre-proposition → confirmation du bon jour.

### L7

**Sélection examinée :** `L7-fr-ko-01`, `L7-fr-ko-03`, `L7-fr-ko-07`.

**Décision proposée :** Garder cause, comparaison et avis ; distinguer la forme des causes et la logique de la réponse négative.

**Pont du niveau :** Description connue → cause préparée → comparaison d’objets connus → avis, avec réponse contextualisée.

1. **Sélection — L7, raison connue puis diversité.**

   - `L7-fr-ko.json:L7-fr-ko-01:v0` : **피곤해서 집에 있었어요.** — « Je suis resté(e) à la maison parce que j'étais fatigué(e). ».
   - `L7-fr-ko.json:L7-fr-ko-01:v1` : **비가 와서 집에 있었어요.** — « Je suis resté(e) à la maison parce qu'il pleuvait. ».
   - `L7-fr-ko.json:L7-fr-ko-01:v2` : **아파서 집에 있었어요.** — « Je suis resté(e) à la maison parce que j'étais malade. ».

   피곤해서, 비가 와서 et 아파서 sont des causes de formes différentes ; elles ne se créent pas par un mot fixe ajouté à la phrase polie.

   **Action :** Préparer une cause entière puis une autre sur action/état déjà compris ; garder la conséquence stable.

   **Pont :** Cause connue → même conséquence ; nouvelle cause seulement après préparation.

2. **Sélection — L7, comparaison sur un critère stable.**

   - `L7-fr-ko.json:L7-fr-ko-03:v0` : **이게 저것보다 더 비싸요.** — « Celui-ci est plus cher que celui-là. ».
   - `L7-fr-ko.json:L7-fr-ko-03:v1` : **이게 커피보다 더 비싸요.** — « Celui-ci est plus cher que le café. ».
   - `L7-fr-ko.json:L7-fr-ko-03:v3` : **이게 기차표보다 더 비싸요.** — « Celui-ci est plus cher que le billet de train. ».

   보다 suit le terme comparé ; comparer objet/café/billet n’a du sens que si le critère et les objets sont identifiés.

   **Action :** Deux objets et prix visibles d’abord ; préparer chaque groupe avec 보다, puis autre référence.

   **Pont :** Identifier les deux éléments → comparer le prix → choisir et justifier.

3. **Sélection — L7, avis simple ; besoin abstrait ensuite.**

   - `L7-fr-ko.json:L7-fr-ko-07:v0` : **제 생각에는 이게 더 나아요.** — « À mon avis, celui-ci est mieux. ».
   - `L7-fr-ko.json:L7-fr-ko-07:v1` : **제 생각에는 너무 비싸요.** — « À mon avis, c'est trop cher. ».
   - `L7-fr-ko.json:L7-fr-ko-07:v3` : **제 생각에는 시간이 더 필요해요.** — « À mon avis, il faut plus de temps. ».

   L’avis peut porter sur un meilleur objet, un prix excessif ou un besoin de temps ; la dernière proposition ajoute un besoin abstrait.

   **Action :** Commencer par une appréciation connue ; temps nécessaire et délai dans une scène ultérieure.

   **Pont :** Appréciation connue → phrase d’avis entière → précision ou raison connue.

4. **Répliques reçues — Réception L7, question négative contextualisée.**

   - `L7-fr-ko.json:L7-fr-ko-d2:t0` : **고기 안 먹어요?** — « Vous ne mangez pas de viande ? » — rôle Toi, apprenant.
   - `L7-fr-ko.json:L7-fr-ko-d2:t1` : **네, 예전에는 많이 먹었는데, 지금은 안 먹어요.** — « Non. Avant j'en mangeais beaucoup, mais plus maintenant. » — rôle Un ami, reçu.
   - `L7-fr-ko.json:L7-fr-ko-d2:t2` : **왜요?** — « Pourquoi ? » — rôle Toi, apprenant.
   - `L7-fr-ko.json:L7-fr-ko-d2:t3` : **건강 때문에요. 채소가 고기보다 더 건강한 것 같아요.** — « Pour la santé. Je crois que les légumes sont plus sains que la viande. » — rôle Un ami, reçu.

   À 고기 안 먹어요?, 네 confirme la négation ; la traduction française dit correctement « Non ». Un tableau 네=oui / 아니요=non ferait échouer ce tour.

   **Action :** Faire comprendre la question négative entière, puis la réponse complète. Ne pas proposer un oui/non isolé déconnecté de la proposition confirmée.

   **Pont :** Comprendre ce qui est nié → entendre si le partenaire le confirme → demander la raison.

### L8

**Sélection examinée :** `L8-fr-ko-01`, `L8-fr-ko-03`, `L8-fr-ko-07`.

**Décision proposée :** Garder négociation et réparation ; condition, engagement et honorification demandent des passages propres.

**Pont du niveau :** Demande connue → forme retenue → condition → engagement ; changer de rôle seulement après préparation.

1. **Sélection — L8, demande plus élaborée, non première politesse.**

   - `L8-fr-ko.json:L8-fr-ko-01:v0` : **좀 도와 주시겠어요?** — « Pourriez-vous m'aider ? ».
   - `L8-fr-ko.json:L8-fr-ko-01:v1` : **영수증 좀 주시겠어요?** — « Pourriez-vous me donner le reçu ? ».
   - `L8-fr-ko.json:L8-fr-ko-01:v2` : **다시 한번 말씀해 주시겠어요?** — « Pourriez-vous répéter ? ».

   주시겠어요 combine déférence et demande ; 말씀해 fait encore varier le verbe. La politesse existe déjà en 주세요 au L1.

   **Action :** Réactiver une demande simple puis apprendre une demande élaborée entière ; ne pas présenter L8 comme le début de la politesse.

   **Pont :** Même fonction connue → forme plus respectueuse dans une scène pertinente.

2. **Sélection — L8, condition simple → condition avec possibilité.**

   - `L8-fr-ko.json:L8-fr-ko-03:v0` : **조금 깎아 주시면 살게요.** — « Si vous baissez un peu le prix, je le prends. ».
   - `L8-fr-ko.json:L8-fr-ko-03:v1` : **배송이 무료면 살게요.** — « Si la livraison est gratuite, je le prends. ».
   - `L8-fr-ko.json:L8-fr-ko-03:v3` : **내일까지 받을 수 있으면 살게요.** — « Si je peux le recevoir d'ici demain, je le prends. ».

   주시면, 무료면 et 받을 수 있으면 combinent formes de condition différentes ; 살게요 engage le locuteur, plus que dire une possibilité future.

   **Action :** Une condition concrète d’abord, reçue et comprise avec l’engagement ; possibilité de réception avant demain ensuite.

   **Pont :** Condition reconnue → engagement d’achat → autre condition préparée, sans morphologie libre.

3. **Sélection — L8, réception puis rôle d’intervenant.**

   - `L8-fr-ko.json:L8-fr-ko-07:v0` : **죄송해요, 바로 고칠게요.** — « Désolé(e), je répare tout de suite. ».
   - `L8-fr-ko.json:L8-fr-ko-07:v1` : **죄송해요, 바로 바꿔 드릴게요.** — « Désolé(e), je vous l'échange tout de suite. ».
   - `L8-fr-ko.json:L8-fr-ko-07:v3` : **죄송해요, 바로 다시 보내 드릴게요.** — « Désolé(e), je vous le renvoie tout de suite. ».

   고칠게요 est l’action de l’intervenant ; 바꿔 드릴게요 et 보내 드릴게요 ajoutent un service au destinataire avec forme humble.

   **Action :** Recevoir ces réponses du prestataire avant de les produire dans un rôle différent ; ne pas coller 드리다 dans toutes les réparations.

   **Pont :** Problème client → réponse du prestataire → confirmation avec acteurs stables.

4. **Répliques reçues — Réception L8, refus puis condition commerciale.**

   - `L8-fr-ko.json:L8-fr-ko-d1:t3` : **죄송하지만 할인은 안 돼요. 하지만 두 켤레 사시면 십 퍼센트 할인해 드릴게요.** — « Désolé, mais la réduction, ce n'est pas possible. Mais si vous en prenez deux paires, je vous fais dix pour cent. » — rôle Vendeur, reçu.
   - `L8-fr-ko.json:L8-fr-ko-d1:t4` : **음, 다른 색이 있으면 두 켤레 살게요.** — « Hmm, s'il y a une autre couleur, j'en prends deux paires. » — rôle Client, apprenant.
   - `L8-fr-ko.json:L8-fr-ko-d1:t5` : **네, 검은색하고 흰색이 있어요.** — « Oui, il y a du noir et du blanc. » — rôle Vendeur, reçu.
   - `L8-fr-ko.json:L8-fr-ko-d1:t6` : **그럼 두 켤레 주세요. 영수증도 주시겠어요?** — « Alors deux paires, s'il vous plaît. Pourriez-vous me donner le reçu aussi ? » — rôle Client, apprenant.

   Le vendeur refuse une réduction isolée mais en propose une pour deux paires ; la réponse du client ajoute encore la condition de couleur.

   **Action :** Préparer paires, pourcentage et couleur séparément ; jouer une condition à la fois avant les huit tours.

   **Pont :** Refus compris → condition nouvelle comprise → contre-condition → accord.

### L9

**Sélection examinée :** `L9-fr-ko-01`, `L9-fr-ko-08`, `L9-fr-ko-12`.

**Décision proposée :** Conserver clarification et imprévu ; éviter plusieurs couches de citation et de supposition au premier essai.

**Pont du niveau :** Problème connu → réponse préparée → clarification utile → prochain départ connu ; discours indirect ensuite.

1. **Sélection — L9, reformulation d’un contenu connu.**

   - `L9-fr-ko.json:L9-fr-ko-01:v0` : **제 말은, 시간이 더 필요하다는 거예요.** — « Ce que je veux dire, c'est qu'il me faut plus de temps. ».
   - `L9-fr-ko.json:L9-fr-ko-01:v3` : **제 말은, 먼저 확인해야 한다는 거예요.** — « Ce que je veux dire, c'est qu'il faut vérifier d'abord. ».

   필요하다는 거예요 et 해야 한다는 거예요 contiennent des formes différentes de discours indirect ; la dernière ajoute devoir vérifier.

   **Action :** Préparer d’abord le contenu à reformuler ; travailler un bloc entier avant une nouvelle obligation et une autre terminaison.

   **Pont :** Phrase simple comprise → même intention reformulée → vérification auprès de l’autre.

2. **Sélection — L9, un problème et une résolution cohérents.**

   - `L9-fr-ko.json:L9-fr-ko-08:v0` : **문제가 있어요. 기차를 놓쳤어요. 어떻게 하죠?** — « Il y a un problème : j'ai raté le train. Qu'est-ce qu'on peut faire ? ».
   - `L9-fr-ko.json:L9-fr-ko-08:v1` : **문제가 있어요. 지갑을 잃어버렸어요. 어떻게 하죠?** — « Il y a un problème : j'ai perdu mon portefeuille. Qu'est-ce qu'on peut faire ? ».
   - `L9-fr-ko.json:L9-fr-ko-08:v2` : **문제가 있어요. 예약이 취소됐어요. 어떻게 하죠?** — « Il y a un problème : la réservation a été annulée. Qu'est-ce qu'on peut faire ? ».

   Train raté, portefeuille perdu et réservation annulée sont des événements entiers distincts ; 어떻게 하죠 n’en prépare aucun automatiquement.

   **Action :** Choisir un imprévu concret, comprendre sa solution, puis proposer une autre scène ; conserver les autres variantes en réserve.

   **Pont :** Événement connu → demande de solution → réponse reçue, pas quatre problèmes simultanés.

3. **Sélection — L9, réemploi de question simple ; peut servir plus tôt si déjà préparée, sans modifier les droits.**

   - `L9-fr-ko.json:L9-fr-ko-12:v0` : **다음 기차는 몇 시예요?** — « Le prochain train est à quelle heure ? ».
   - `L9-fr-ko.json:L9-fr-ko-12:v1` : **다음 버스는 몇 시예요?** — « Le prochain bus est à quelle heure ? ».
   - `L9-fr-ko.json:L9-fr-ko-12:v3` : **다음 배는 몇 시예요?** — « Le prochain bateau est à quelle heure ? ».

   La question du prochain départ est beaucoup plus simple que les autres familles L9 ; elle est utile pour réparer la scène après un train raté.

   **Action :** La garder comme réactivation fonctionnelle, non comme difficulté nouvelle artificielle. Préparer le moyen de transport et l’heure reçue.

   **Pont :** Imprévu compris → solution → question pratique sur le prochain départ.

4. **Répliques reçues — Réception L9, échange puis contrainte de place.**

   - `L9-fr-ko.json:L9-fr-ko-d1:t1` : **표 좀 보여 주시겠어요? 음, 이 표는 다음 기차로 바꿀 수 있어요.** — « Pourriez-vous me montrer votre billet ? Hmm, ce billet peut être changé pour le prochain train. » — rôle Agent, reçu.
   - `L9-fr-ko.json:L9-fr-ko-d1:t2` : **추가 비용이 있어요?** — « Il y a des frais supplémentaires ? » — rôle Voyageur, apprenant.
   - `L9-fr-ko.json:L9-fr-ko-d1:t3` : **아니요, 없어요. 하지만 자리가 없을지도 몰라요.** — « Non, aucun. Mais il se peut qu'il n'y ait pas de place assise. » — rôle Agent, reçu.
   - `L9-fr-ko.json:L9-fr-ko-d1:t4` : **제가 제대로 이해했다면, 서서 가야 할 수도 있다는 거죠?** — « Si j'ai bien compris, je devrai peut-être voyager debout ? » — rôle Voyageur, apprenant.
   - `L9-fr-ko.json:L9-fr-ko-d1:t5` : **네, 그럴 수도 있어요. 아마 괜찮을 거예요. 월요일 오후는 별로 안 붐비거든요.** — « Oui, c'est possible. Mais ça ira, probablement. Le lundi après-midi, il n'y a pas trop de monde. » — rôle Agent, reçu.

   Le partenaire propose l’échange puis avertit de l’absence possible de siège ; la reformulation du lecteur cumule obligation, possibilité et citation.

   **Action :** D’abord échanger le billet et comprendre les frais ; puis préparer séparément la contrainte de siège et la reformulation entière.

   **Pont :** Solution reçue → coût compris → restriction comprise → clarification ; ne pas exiger toutes les couches à la première réponse.

### L10

**Sélection examinée :** `L10-fr-ko-01`, `L10-fr-ko-03`, `L10-fr-ko-09`.

**Décision proposée :** Viser une conversation plus autonome à essayer ; longs connecteurs et honorification ne prouvent pas l’autonomie.

**Pont du niveau :** Avis → objection → reprise fidèle → réponse adaptée → relance ; modèles masquables volontairement et aides restaurables.

1. **Sélection — L10, argumentation guidée puis décision réelle.**

   - `L10-fr-ko.json:L10-fr-ko-01:v0` : **한편으로는 편하지만, 다른 한편으로는 비싸요.** — « D'un côté c'est pratique, de l'autre c'est cher. ».
   - `L10-fr-ko.json:L10-fr-ko-01:v1` : **한편으로는 재미있지만, 다른 한편으로는 비싸요.** — « D'un côté c'est amusant, de l'autre c'est cher. ».
   - `L10-fr-ko.json:L10-fr-ko-01:v2` : **한편으로는 가깝지만, 다른 한편으로는 비싸요.** — « D'un côté c'est proche, de l'autre c'est cher. ».

   Les deux volets gardent toujours « c’est cher » comme limite ; il faut un objet réel pour que le contraste ait un sens.

   **Action :** Commencer par une décision concrète dont avantage et coût sont connus ; ne pas exiger ce connecteur long dans toute réponse spontanée.

   **Pont :** Avis et raison connus → avantage/limite cohérents → choix expliqué.

2. **Sélection — L10, reformulation fidèle et registre préparé.**

   - `L10-fr-ko.json:L10-fr-ko-03:v0` : **제가 이해하기로는, 재택근무가 더 좋다고 생각하시는 거죠?** — « Si je comprends bien, vous pensez que le télétravail est mieux ? ».
   - `L10-fr-ko.json:L10-fr-ko-03:v1` : **제가 이해하기로는, 이사하는 게 낫다고 생각하시는 거죠?** — « Si je comprends bien, vous pensez qu'il vaut mieux déménager ? ».
   - `L10-fr-ko.json:L10-fr-ko-03:v2` : **제가 이해하기로는, 지금은 때가 아니라고 생각하시는 거죠?** — « Si je comprends bien, vous pensez que ce n'est pas le moment ? ».

   좋다고, 낫다고 et 아니라고 encodent des propositions de natures différentes ; 생각하시는 reprend respectueusement la pensée de l’autre.

   **Action :** Préparer la reprise entière d’un avis réellement entendu ; travailler le contraste nominal/verbal ensuite, pas une seule case de mots.

   **Pont :** Avis reçu → reformulation → validation ou rectification par l’interlocuteur.

3. **Sélection — L10, transition vers sujet connu.**

   - `L10-fr-ko.json:L10-fr-ko-09:v0` : **그건 그렇고, 주말에 뭐 해요?** — « Au fait, qu'est-ce que vous faites ce week-end ? ».
   - `L10-fr-ko.json:L10-fr-ko-09:v2` : **그건 그렇고, 그 일은 어떻게 됐어요?** — « Au fait, ça a donné quoi, cette histoire ? ».
   - `L10-fr-ko.json:L10-fr-ko-09:v3` : **그건 그렇고, 점심 먹었어요?** — « Au fait, vous avez déjeuné ? ».

   Le week-end, le résultat d’une affaire et le repas récent ne sollicitent pas le même type de réponse ; le changement de sujet reste une vraie interaction.

   **Action :** Choisir une question dont le contenu est déjà préparé ; garder les autres comme contextes distincts, avec une réponse possible connue.

   **Pont :** Sous-échange terminé → nouvelle question pertinente → réponse qui permet de continuer.

4. **Répliques reçues — Réception L10 puis essai conversationnel ; aucun CECRL mesuré.**

   - `L10-fr-ko.json:L10-fr-ko-d1:t1` : **한편으로는 편하지만, 다른 한편으로는 동료들을 못 봐서 아쉬워요.** — « D'un côté c'est pratique, de l'autre c'est dommage de ne pas voir les collègues. » — rôle Un collègue, reçu.
   - `L10-fr-ko.json:L10-fr-ko-d1:t2` : **제가 이해하기로는, 사무실이 더 좋다고 생각하시는 거죠?** — « Si je comprends bien, vous pensez que le bureau, c'est mieux ? » — rôle Toi, apprenant.
   - `L10-fr-ko.json:L10-fr-ko-d1:t3` : **꼭 그렇지는 않아요. 일주일에 이틀 정도 집에서 일하는 게 제일 좋은 것 같아요.** — « Pas forcément. Je crois que l'idéal, c'est deux jours par semaine à la maison. » — rôle Un collègue, reçu.
   - `L10-fr-ko.json:L10-fr-ko-d1:t5` : **그렇긴 한데, 한번 물어볼 수는 있잖아요. 마리 씨는요?** — « Certes, mais on peut toujours demander. Et vous, Marie ? » — rôle Un collègue, reçu.
   - `L10-fr-ko.json:L10-fr-ko-d1:t7` : **사람마다 다르네요. 정리하자면, 선택할 수 있으면 제일 좋겠네요.** — « Ça dépend des gens, alors. Pour résumer, l'idéal serait de pouvoir choisir. » — rôle Un collègue, reçu.
   - `L10-fr-ko.json:L10-fr-ko-d1:t9` : **아직이요. 같이 먹을래요?** — « Pas encore. On mange ensemble ? » — rôle Un collègue, reçu.

   Le partenaire nuance la préférence pour le bureau, renvoie la question, résume et invite à déjeuner : il faut réviser l’interprétation puis suivre la transition.

   **Action :** Essayer ces sous-échanges sans imposer la récitation des dix tours ; observer pertinence, maintien du sujet, clarification et réparation.

   **Pont :** Reformulation imparfaite → correction reçue → réponse mise à jour → transition avec réponse cohérente.

## Propositions de traduction ou de contexte, séparées des sources

Ces propositions demandent une décision de Claude et Kartech. Elles ne remplacent pas la copie de provenance et ne déclenchent aucune modification de phonétique. Si un texte étudié devait changer plus tard, sa prononciation devrait faire l’objet d’un travail séparé explicitement autorisé.

- `L1-fr-ja.json:L1-fr-ja-03:v0` — **コーヒーをください。**. Source française : « Je veux un café. ». Proposition : « Un café, s’il vous plaît. ». Donner la fonction de demande polie à quelqu’un ; ne pas confondre avec un désir d’action.

- `L1-fr-ko.json:L1-fr-ko-03:v0` — **커피 주세요.**. Source française : « Je veux un café. ». Proposition : « Un café, s’il vous plaît. ». Faire entendre la demande adressée au serveur ; les données source et la phonétique restent intactes.

- `L2-fr-zh.json:L2-fr-zh-02:v3` — **我要一斤苹果。**. Source française : « Je prends une livre de pommes. ». Proposition : « Je prends 500 g de pommes. ». Rendre explicite la mesure choisie par la note source pour cette scène de Chine continentale ; ne pas universaliser cette valeur à tous les usages régionaux de 斤.

- `L8-fr-ja.json:L8-fr-ja-02:v0` — **安かったら、買います。**. Source française : « Si c'est moins cher, j'achète. ». Proposition : « Si c’est bon marché, je l’achète. ». 安かったら ne code pas explicitement un prix devenu inférieur au prix précédent ; une comparaison éventuelle dépend du contexte.

- `L9-fr-ja.json:L9-fr-ja-01:v3` — **つまり、もう一度来るということです。**. Source française : « Autrement dit, je dois revenir. ». Proposition : « Autrement dit, je reviens une autre fois. ». Si le contexte ne dit pas qu’il faut revenir, ne pas ajouter une obligation dans la traduction ; s’il l’exige, garder ce contexte explicite.

- `L10-fr-zh.json:L10-fr-zh-d3:t4` — **我不是这个意思，我是说能不能早一点练？**. Source française : « Ce n'est pas un reproche, je veux dire : est-ce qu'il pourrait répéter un peu plus tôt ? ». Proposition : « Ce n’est pas ce que je voulais dire ; je demande s’il serait possible de répéter un peu plus tôt. ». Rapprocher la traduction de 我不是这个意思 sans lui faire dire automatiquement « ce n’est pas un reproche ». Le problème de cohérence de la scène demeure et exige une décision éditoriale.

## Essai L10 : ce qu’il faut observer

L’objectif est de soutenir une conversation plus autonome ; le contenu ne permet pas de promettre qu’elle est maîtrisée. Dans une situation préparée, puis une variation pertinente :

- Répondre au sens de la réplique reçue, y compris une correction.
- Réutiliser une phrase préparée avec un changement réellement pertinent.
- Maintenir ou relancer le sujet, puis changer de sujet avec une réponse possible.
- Demander une répétition ou clarification quand c’est nécessaire.
- Soutenir plusieurs échanges avec modèle volontairement masqué et aide restaurable.
- Observer ces comportements en essai ; ne pas déduire une autonomie ni un CECRL de la consultation du contenu.

Une bonne lecture des modèles n’est pas une preuve de compréhension en temps réel. La récitation d’un dialogue n’est pas une preuve de capacité à répondre à une variation. Les reformulations doivent correspondre à une parole réellement entendue ; le partenaire doit pouvoir confirmer ou rectifier.

## Réserves à transmettre à Claude

- Garder toutes les variantes comme réserve, mais n’en présenter initialement que deux compatibles avec la scène et la progression réelle.
- Préparer le groupe nouveau dans une phrase complète avant d’en faire le morceau à remplacer.
- Ne pas imposer simultanément plusieurs expressions de vouloir, plusieurs futurs ou plusieurs registres.
- Préparer la question reçue et une réponse pertinente ; ne pas composer un faux dialogue où la question reste sans réponse.
- Distinguer réception et production, y compris quand le prestataire devient l’acteur d’une réparation.
- Faire relire par des locuteurs compétents les points de naturel, registre, particules et cohérence de scène signalés ; les avis du présent rapport sont des propositions pédagogiques.
- Conserver strictement phonétiques et lectures ; le garde prouve leur provenance, pas leur justesse native.
