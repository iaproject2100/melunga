# Dix-huit pistes : couverture dans le parcours

Le lot ajoute **18 modules, déclinés en 126 rubriques et 1 008 positions apprenant** dans les sept couples. Avec les dix modules précédents conservés, le parcours comporte **28 modules, 196 rubriques et 1 568 positions apprenant**. Chaque rubrique propose huit répliques complètes distinctes au même niveau, dans l’ordre des intentions prévu.

Ces positions ne sont pas toutes des créations : **803 productions sont rédigées et 205 réemploient des sources existantes**. Les 259 positions reçues comprennent 219 formulations rédigées et 40 sources existantes ; les 252 positions de soutien lexical comprennent 53 formulations rédigées et 199 réemplois. Les soutiens demeurent des mots ou groupes lexicaux séparés des exercices de phrase.

| Couple | Productions rédigées / sources | Reçus rédigés / sources | Soutiens rédigés / sources | Premières rencontres / réemplois en situation |
|---|---:|---:|---:|---:|
| fr-en | 115 / 29 | 31 / 6 | 0 / 36 | 133 / 11 |
| fr-es | 118 / 26 | 33 / 4 | 22 / 14 | 130 / 14 |
| fr-it | 114 / 30 | 33 / 4 | 5 / 31 | 134 / 10 |
| fr-zh | 118 / 26 | 31 / 6 | 0 / 36 | 133 / 11 |
| fr-ja | 117 / 27 | 30 / 7 | 9 / 27 | 134 / 10 |
| fr-ko | 118 / 26 | 32 / 5 | 10 / 26 | 133 / 11 |
| zh-fr | 103 / 41 | 29 / 8 | 7 / 29 | 133 / 11 |

Les créations de l’extension représentent **1 075 formes avec aide entière rédigée** : 803 productions, 219 reçus et 53 soutiens lexicaux. Ajoutées aux 454 formulations du lot précédent, cela donne **1 529 formes**. Les 139 aides lexicales antérieures réellement nouvelles restent consignées à part : **1 668 aides nouvelles étaient à relire avant la reprise des corrections de Claude**. Le raccord actuel atteste 45 aides rédigées corrigées ; il ne déclare pas toute cette production validée. Une reprise de source ou une différence de traduction ne constitue pas une nouvelle forme.

Chaque piste possède maintenant sept réalisations concrètes dans `matrice-couverture.json` : huit identifiants d’intention, huit identifiants canoniques distincts, les tours reçus et les soutiens. Les tuples texte/sens/aide/lecture ont été comparés au ledger. La vérification du navigateur reste distincte et son résultat est donné dans `verification-navigateur.json` ; cette matrice n’est pas une mesure d’acquisition.

Les trois reçus clarifiés apportent respectivement une direction réelle vers la gare, l’envoi du nouveau code et la réparation de l’appareil avant de vérifier la réponse ou le résultat. Les réponses sont préparées avant l’écoute de la question ; les clôtures ont explicitement une liste `answerWith: []`. Les reçus ne comptent jamais dans la progression de production.

Les anciens dix modules, leurs 560 positions et le stock lexical rédigé précédent sont protégés. Les 32 115 cartes historiques, leurs champs et leurs niveaux d’accès restent intacts ; le niveau éditorial ne réécrit pas `lv`. Codex assure le sens, le classement, la cohérence et la progression ; Claude relit aussi les thèmes et niveaux dans le mandat élargi de revue intégrale. Rien dans ce document ne constitue une publication.

Manifeste : `7a131ebf463b6365d45305b05a6638dbdd65e21b07a15666e2d4cdad064f027f`. Plan : `d2ce2e8d9476756ee7e6651a3103b449ee89625ec1065c4fdf6f83382010a379`.


La vérification navigateur du **25 octobre 2026 à 13:31:38 UTC** réussit **19 contrôles sur 19**, avec **210 vues** (320, 390 et 1440 px), 196 rubriques de situation et 1 568 positions apprenant. Les 259 reçus et 252 soutiens sont sourcés ; 133 questions/objections ciblent une réponse comprise et imitée, 126 clôtures déclarent une liste de réponse vide. Neuf corruptions du réemploi et treize corruptions des reçus/soutiens sont refusées avant rechargement d’une banque corrigée. Les 278 emplacements photo dans 24 atlas et la page L1 v1 sont vérifiés. Les cellules, banques, ledgers, sources, images et le code restent stables pendant l’exécution.

Rapport détaillé : [verification-navigateur.json](../../verification-navigateur.json), empreinte `0090e794be07209bb54a2035771f76fe0797a01973576e5fa6dddad200086ffa`. Le contrôle audio utilise un témoin TTS qui vérifie le texte entier et sa langue ; il ne valide pas le son réel ni la phonétique. Aucun site déployé ni téléphone physique n’est certifié par ce passage local.

Le raccord phonétique du 25 octobre vérifie les après exacts et leurs annotations avant de comparer les tuples sources sur une projection privée vers les avant. Les indicateurs `sourceTuplesMatchLedger` se rapportent à ce contrôle des origines, pas à une identité verbatim des aides corrigées avec le ledger historique. L’affichage est comparé aux après réels. Voir [la vérification du raccord](../../verification-raccord-phonetique.md).
