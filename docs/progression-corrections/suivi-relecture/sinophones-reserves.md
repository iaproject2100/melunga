# Les 102 réserves du couple chinois → français

Triage documentaire distinct, à partir de `99478df`. Il ne reclasse aucune unité, ne modifie aucune source ni aide et ne constitue pas une validation native. Les sept scènes L1 relues dans `939b82e` restent un lot séparé.

## Ce que compte le nombre 102

Le relevé contient **102 annotations sur 102 unités différentes, parmi les 120 unités zh→fr**. Aucun texte d’annotation n’est dupliqué à l’identique. Ce sont des notes particulières aux unités, mais leur nombre ne représente ni 102 erreurs de français, ni 102 écrans manquants, ni 102 défauts de phonétique.

Les annotations des sept couples sont bien au nombre de 330 : zh→fr 102, fr→ja 50, fr→es 49, fr→zh 43, fr→en 38, fr→ko 27 et fr→it 21. Le nombre brut mêle des contraintes de présentation, des limites de généralisation, des besoins de contexte et quelques préparations non établies. Le comparer entre couples sans grille commune ne mesure pas un taux de défauts ou un risque phonétique.

Le triage attribue **une catégorie principale exclusive à chaque annotation**, selon le travail qu’elle appelle. Certaines notes concernent plusieurs aspects ; la catégorie n’est ni un score de gravité ni une certification de correction.

| Catégorie principale | Nombre | Sens du triage |
| --- | ---: | --- |
| `structural-caution` | 73 | Limiter une substitution ou une généralisation : prépositions, déterminants, rôle du groupe, personne, temps, collocations ou actes différents. Les phrases sources existent et leur présentation entière est planifiée. |
| `reception-dialogue` | 21 | Vérifier la question réellement reçue, la pertinence de la réponse, le rôle, le contexte ou la place dans l’échange. Une liste de variantes ne remplace pas cette vérification. |
| `preparation-missing` | 5 | Préparation non établie pour un réemploi particulier : autre forme grammaticale ou généralisation productive. Cela ne signifie pas que les quatre phrases entières de l’unité seraient absentes. |
| `source-register-review` | 3 | Situer le tutoiement/vouvoiement, la réparation et les actes de demande ; aucune faute de source n’est déduite de cette catégorie. |
| `native-review` | 0 | Aucune des 102 annotations initiales n’est principalement un diagnostic de prononciation native ou de qualité des caractères d’approximation. **Ce zéro ne valide pas les phonétiques.** |

Le fichier [sinophones-reserves.json](sinophones-reserves.json) conserve chaque texte original, son identifiant d’unité, son index d’annotation, sa catégorie, sa raison et les quatre variantes sources avec toutes leurs aides présentes. Les 102 annotations et les 408 copies de variantes ont été comparées aux objets Git de `99478df`, sans normalisation. Les empreintes des dix fichiers sources de ce couple sont jointes.

## Pourquoi la plupart ne sont pas des omissions d’écran

Le paquet actuel présente chaque variante entière, puis la propose à l’imitation avant son choix. Une note disant « ne pas déduire la forme B du cadre A » peut donc être une contrainte correcte de présentation, déjà respectée par ce mécanisme. Elle ne prouve pas, à elle seule, que la phrase B manque au parcours.

L’inverse mérite autant d’attention : montrer une phrase longue entière ne la rend pas simple, et préparer quatre expressions ne démontre pas que la personne pourra en combiner les morceaux. Les 73 précautions de structure ne sont donc pas à supprimer comme du bruit. Elles doivent devenir des décisions : expression entière suffisante pour cet objectif, première paire plus restreinte, appui antérieur à retrouver, ou généralisation à laisser explicitement hors de la séquence.

Les cinq préparations non établies retenues par ce triage sont les annotations de `L5-zh-fr-02`, `L5-zh-fr-12`, `L7-zh-fr-01`, `L9-zh-fr-05` et `L8-zh-fr-11`. Deux portent sur une autre forme grammaticale non offerte dans l’unité ; trois portent sur la composition ou une généralisation productive. Il ne faut pas en déduire que seules cinq difficultés linguistiques existent dans le couple.

## Huit vérifications prioritaires, avec énoncés sources exacts

### 1. Mouvement et projet ne sont pas le même emploi de « je vais »

`L1-zh-fr-06`, variante 0 : **« Je vais au travail. »**

`L6-zh-fr-01`, variante 0 : **« Je vais partir en vacances. »**

Le premier cadre porte un lieu ; le second porte un infinitif de projet. Conserver la première phrase comme reprise possible, puis présenter la nouvelle phrase entière avant son réemploi. Le lien d’unité ne doit pas déclarer le second emploi déjà acquis.

### 2. Une locution avec avoir ne prépare pas automatiquement la possession

`L1-zh-fr-07`, variante 0 : **« J'ai faim. »**

`L4-zh-fr-04`, variante 0 : **« J'ai un frère. »**

La seconde unité, proposée plus tôt dans le nouveau classement, introduit un nouvel usage et ses groupes nominaux. L’identité des premiers mots n’en fait pas une simple reprise de faim. Faire également relire le sens chinois dans le contexte : il doit être compris comme la traduction de cet exemple, sans devenir une équivalence universelle de tous les emplois d’avoir.

### 3. Passé événementiel et habitude passée gardent des fonctions distinctes

`L5-zh-fr-01`, variante 0 : **« Hier, j'ai travaillé. »**

`L7-zh-fr-08`, variante 0 : **« Avant, je travaillais la nuit. Maintenant, c'est différent. »**

La seconde phrase entière peut préparer un contraste d’habitude. Elle ne peut pas être fabriquée depuis la première par une règle unique intitulée « passé ». Vérifier l’intention et le contexte avant de demander une autre histoire personnelle.

### 4. Les formes masculines conservées ne couvrent pas toutes les formes d’une réponse personnelle

`L5-zh-fr-02`, variante 0 : **« Je suis allé au cinéma. »**

`L5-zh-fr-12`, variante 0 : **« Je suis arrivé hier soir. »**

Toutes les variantes de ces deux unités gardent respectivement allé et arrivé. Le plan ne fournit pas ici une autre forme grammaticale adaptée à une autre réponse personnelle. Rechercher d’abord un énoncé entier existant dans la réserve ; s’il n’est pas disponible, ouvrir un lot source séparé. Ne pas fabriquer un nouvel énoncé ou son aide par modification de la copie actuelle, ni présumer qu’une même aide convient automatiquement à toute variation.

### 5. « Si » conditionnel et question indirecte n’autorisent pas les mêmes réponses

`L8-zh-fr-03`, variante 0 : **« Si le loyer baisse un peu, je prends l'appartement. »**

`L9-zh-fr-11`, variante 0 : **« Je ne sais pas si c'est le bon guichet. »**

La seconde phrase exprime une information incertaine ; la première pose une condition de décision. Le partage du mot si ne prépare ni leur syntaxe ni leur place dans l’échange. Conserver deux introductions et des réponses reçues adaptées à leur fonction.

### 6. Généraliser subjonctif, futur simple et impératif exige davantage que le début commun

`L9-zh-fr-05`, variante 2 : **« Il se peut que tu aies raison. »**

`L8-zh-fr-11`, variante 1 : **« Si c'est possible, je viendrai demain. »**

`L8-zh-fr-11`, variante 2 : **« Si c'est possible, envoyez-moi un e-mail. »**

Les trois phrases existent et peuvent être présentées entières. Le système productif de ces formes n’est pas établi par leur voisinage, ni par le futur proche rencontré auparavant. Fixer l’objectif de la séquence : réemployer ces expressions préparées ou construire une nouvelle phrase. Le second objectif demande des appuis identifiés et une revue distincte, actuellement non établis.

### 7. La question de prix du café est prise en charge par le lot L1 séparé

`L1-zh-fr-10`, variante 1 : **« Combien coûte le café ? »**

`L1-zh-fr-d1`, tour index zéro 4 : **« Non, merci. Combien ça coûte ? »**

Le besoin exact porte sur le fragment **« Combien ça coûte ? »**, pas sur une équivalence supposée de toutes les questions de prix. L’annotation historique reste correcte à propos de l’unité source. Le pont L1 séparé prépare précisément ce fragment ; il ne faut ni oublier cette prise en charge ni la refaire silencieusement dans le reclassement des 841 unités. Sa validation native demeure distincte de sa conservation technique.

### 8. Le choix de registre et la pertinence des réactions se vérifient en situation

`L3-zh-fr-09`, variante 0 : **« Je ne comprends pas. Tu peux répéter ? »**

`L3-zh-fr-09`, variante 1 : **« Je ne comprends pas. Vous pouvez répéter ? »**

Le lecteur doit savoir à qui il s’adresse ; les deux phrases ne deviennent pas une transformation de nom. Relire également la série source `L8-zh-fr-10`, qui mêle dérangement, constat de problème et remerciement. La catégorie « registre » n’affirme pas que ces sources sont fautives : elle impose un contexte et un interlocuteur avant un choix de réponse.

## Examen séparé à ouvrir pour le lecteur sinophone

1. **Préparation et rôle.** Reprendre les huit cas ci-dessus avec les variantes sources entières, l’intention chinoise et les répliques reçues réellement nécessaires. Qualifier chaque attente : expression à réemployer telle quelle, première variation limitée, ou composition encore non préparée. Ne pas transformer un lien entre unités en preuve d’acquisition.
2. **Relecture du français.** Faire écouter ou jouer les énoncés avec leur contexte par un locuteur compétent : naturel, registre, formes grammaticales du rôle et suites de réponse. Consigner une proposition, pas une correction silencieuse du corpus.
3. **Relecture français–chinois des aides.** Examiner ensemble l’audio français, l’intention chinoise et les caractères d’approximation exacts du lecteur. Vérifier ce qu’un sinophone comprend et prononce réellement, notamment segmentation, groupes prépositionnels, élisions/liaisons et contrastes de sons. Le présent triage n’a ni testé ces voix ni validé cette approximation.
4. **Essai avec apprenants.** Observer une petite reprise dans une situation connue puis une variation proche, avec aide disponible. Noter l’aide choisie et ce qui a été compris ou dit dans ce contexte, sans score automatique de maîtrise.
5. **Suite éditoriale tracée.** Pour une forme ou une réplique réellement absente, rechercher une source entière déjà écrite ; à défaut, préparer un lot nouveau à relire avec sa propre aide. Les phonétiques actuelles restent intactes. Les prix, les droits et la frontière du gratuit ne sont pas concernés par ce triage.

Ce volet ne constitue pas un correctif de veille de publicité. Il est distinct du suivi espagnol/italien, des marches de longueur anglaise/coréenne et des sept scènes L1. **Aucune source, aucun parcours publié ni aucun statut de validation native n’est modifié.**
