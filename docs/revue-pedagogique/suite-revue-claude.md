# Suite de la revue avec Claude — propositions à arbitrer

## État de la transmission

Les commits `2cdc312` (métadonnées) et `b5ea64c` (trois retouches) sont maintenant poussés sur `review/familles-huit-corrections`. Claude peut les relire. Ils ne sont ni fusionnés dans `main`, ni publiés sur le site.

La production reste au commit `e0caf72`, correspondant uniquement aux sélecteurs de langues et de niveaux validés séparément. Le travail APK v3 reste reporté.

Kartech souhaite ajuster les quatre choix de parcours qui lui ont été proposés. Il précise le point commercial : L1 est gratuit, doit donner envie d'accéder à la suite, et ne doit pas retenir trop longtemps l'apprenant dans un catalogue gratuit trop riche. Aucun accord global sur les quatre choix n'est retenu. La suite ci-dessous est une proposition documentaire : aucun nouveau parcours, fichier de séquence ou champ applicatif n'est réalisé.

Une proposition de L1 gratuit court et varié, avec une valeur L2 explicite, figure dans `proposition-L1-gratuit-suite-premium.md`. Ce document ne déplace aucune carte et ne modifie pas les droits actuels.

## Chinois : privilégier une première découverte de 我想 + action

La proposition de Claude permet de commencer par des envies concrètes : se reposer, boire de l'eau, rentrer. Il faut toutefois coordonner les deux familles L2 existantes :

| Phrase complète existante | Index dans DECKS.zh | Niveau historique | Sélection guidée actuelle |
|---|---:|---:|---|
| 我想休息 | 226 | 2 | L2_DEMANDE_POLIE, étape 6 |
| 我想喝水 | 349 | 3 | L2_DEMANDE_POLIE, étape 7 |
| 我想回家 | 416 | 3 | L2_DEMANDE_POLIE, étape 5 |

Recopier ces trois cartes dans `L2_ACTION_PROCHE` laisserait deux introductions très proches. Il faut proposer leur articulation : découverte, puis réemploi assumé, ou recomposition de ces familles. Aucun choix technique entre ces options n'est appliqué ici.

La famille actuelle `L2_DEMANDE_POLIE` contient aussi `我想吃……`, `我想去……`, `我想要` et `我想想`. Les deux premiers sont des gabarits à compléter ; `我想要` est donné sans complément ; `我想想` signifie ici « laisse-moi réfléchir ». Ces formes peuvent avoir leur place en contexte, mais ne constituent pas toutes des phrases principales complètes relevant du même sens d'envie d'action. Le titre « demande polie » mérite lui aussi une relecture : exprimer une envie ne suffit pas à réaliser une demande polie adressée à quelqu'un.

Précision sur la réserve : `我要退货` et `我要退房。` sont également classées L2 dans le catalogue, en plus des exemples cités par Claude. Leur lexique de démarches ne les rend pas préférables pour une première séquence quotidienne. L'intérêt de 想 tient ici au choix de situations et de blocs accessibles, pas à l'impossibilité grammaticale d'utiliser 要 avec une action.

Ne pas présenter « 要 pour les objets, 想 pour les actions » comme une règle générale du chinois. On peut préparer ces deux usages séparément au début, puis élargir. Les phrases complètes en 要 + action restent dans la réserve. Aucun niveau historique n'est renuméroté automatiquement.

### Exemple de mini-séquence à essayer, sans interface imposée

Si `我需要休息` a réellement été entendu et compris, reprendre ce sens, puis découvrir `我想休息` avec sa phrase et sa phonétique complètes. Sinon, commencer par la découverte intégrale de cette dernière phrase, sans présumer le mot 休息 acquis.

Faire entendre ensuite la réponse `好的` (« d'accord »), puis un petit échange visible avant tout masquage :

1. Toi : 我想休息 — Je veux me reposer.
2. Un proche : 好的 — D'accord.
3. Toi : 谢谢 — Merci.

Lors d'un passage suivant, faire comprendre le groupe 回家, puis réemployer la phrase complète existante `我想回家`. Il s'agit d'une proposition d'échange construit avec des phrases de la réserve, pas d'un dialogue déjà présent tel quel dans les JSON. Les aides sources restent à relire à l'écoute ; aucune phonétique n'est fabriquée par collage.

Le détail des références et précautions figure dans `proposition-chinois-envies.md`.

## Préparer ce que l'apprenant reçoit avant de lui demander de répondre

Accord sur cet objectif : la compréhension des paroles de l'interlocuteur doit être préparée. Le nom de champ `received` est une possibilité pour rendre cette préparation explicite ; son stockage et son affichage restent à valider.

Dans le dialogue existant `L1-fr-zh-d1`, « Au café », l'apprenant est A, le client. Les trois tours B sont :

- index 1 : `你好。您要什么？` — Bonjour. Vous désirez ?
- index 3 : `加牛奶吗？` — Avec du lait ?
- index 5 : `二十块。` — Vingt yuans.

Ils illustrent trois compréhensions différentes, à préparer dans de petits passages : une commande, un choix relatif au lait, un prix. Le dialogue complet ne devient pas simple par le seul ajout de ces trois tours : les productions du client, dont le refus suivi d'une demande de prix, doivent aussi être préparées.

« Une à trois » est une taille indicative pour un essai court, pas une borne de schéma ni une garantie de préparation. Si plusieurs nouveautés se cumulent, proposer une scène plus petite ou plusieurs passages. Le rôle de l'apprenant peut être B ; un plan préparé pour A ne se transpose pas automatiquement quand on masque l'autre rôle.

Une annexe par couple peut servir à un essai réversible. Elle pourrait référencer des tours existants par dialogue, rôle, index et texte attendu, puis reprendre leurs phrases, traductions, lectures et phonétiques sources. Le texte attendu éviterait qu'un réordonnancement fasse préparer silencieusement la mauvaise réplique. C'est une proposition, pas un changement du contrat du chargeur. Voir `proposition-repliques-recues.md`.

La préparation, l'aide et la réécoute ne doivent pas devenir un score, un verrou ou une modification des droits.

## Mesure de 51 % : conserver la formulation précise

Dans les 70 fichiers et sept couples audités à `49dca94`, `231 / 454`, soit environ 51 %, désigne des types écrits distincts de dialogues L1 non retrouvés dans les variantes L1 selon la tokenisation retenue. Le calcul porte sur les dialogues, pas sur une mesure de compréhension des seules paroles de l'interlocuteur. Il ne permet pas de dire « la moitié des répliques » ni « la moitié de ce qu'entend l'apprenant ».

Ce signal justifie la vérification réplique par réplique. Il ne prouve pas un résultat d'apprentissage et ne prescrit pas à lui seul le bon nombre de phrases à ajouter. L'ancien résultat ne doit pas être étendu automatiquement aux onze couples désormais dans le dépôt.

## Présentation de la méthode : formulation proposée

> Un apprentissage progressif inspiré de l'acquisition naturelle : écouter et comprendre des phrases de la vie quotidienne, les imiter, puis réutiliser et assembler leurs éléments pour parler dans de nouvelles situations.

L'ordre proposé ne reproduit pas le volume d'exposition d'un enfant. Aucun délai, pourcentage de maîtrise ou résultat équivalent à une langue maternelle n'est promis. Les objectifs de L10 doivent être éprouvés dans des conversations concrètes.

## Limite du présent lot

Ces documents n'ajoutent ni contenu au catalogue, ni donnée `received`, ni fichier de séquence, ni activation de langue, ni changement d'écran. Les quatre choix restent en discussion avec Kartech. Après ajustement et validation, proposer un premier essai ciblé avec maquette, puis sa réalisation et sa relecture croisée avant publication.
