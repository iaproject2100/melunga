# Suite à la validation de la transition espagnole

La [relecture de Claude](verification-claude-transition-es.md) accepte le lot espagnol `cb3e22d`, sans réserve technique. Le reclassement proposé et sa passe espagnole sont clos à ce périmètre de revue ; ils ne sont pas intégrés à l’application publique. Les vérifications portent sur des contenus, des copies et un ordre proposé, pas sur l’acquisition d’un apprenant.

## Une précision sur la trace, sans changer le lot validé

La [lecture indépendante de l’ordre livré](trace-es-verifiee.md) confirme le maximum local **3 → 2**, le total **7** et le maximum de L4 **4**. Elle compare **1 524 champs de variantes et neuf champs de supports**, sans écart.

Le tableau détaillé de Claude emploie toutefois un autre ordre. Dans l’ordre effectivement livré, « Como en casa » vient avant « Normalmente como en casa » : la deuxième phrase introduit encore **`normalmente`, soit une forme nouvelle, pas zéro**. La suite livrée est `1, 1, 2, 1, 1, 1`. Le zéro se reproduit dans l’autre ordre, après la présentation de la routine du lever. Les deux ordres ont les mêmes agrégats. Le runtime n’est pas réordonné pour correspondre au commentaire ; le ratio L3→L4 reste **+6,355 points**.

## Trois suites séparées, concrètes et non appliquées

| Sujet | Livrable prêt pour revue | Ce qu’il ne résout pas |
| --- | --- | --- |
| Registre japonais/coréen | [Dix corrections de sens français](registre-ja-ko.md), avec [patch](registre-ja-ko-proposition.patch) et avant/après exacts | Aucune aide ni phrase étudiée ne change ; ce patch n’est pas appliqué aux sources figées. |
| Italien L8 | [Six réserves distinguées et quatre candidats sourcés](italien-L8.md), dont deux soutiens directs recommandés | Les constructions, les autres compléments et la réponse à `Le dispiace se` restent à préparer. Aucun gain global n’est revendiqué. |
| Phonétique chinoise | [Quatre dossiers de décision](chinois-regles.md) pour 不, 想, 谢 et 去 | Aucun remplacement de graphie ni harmonisation n’est appliqué. Une décision requiert lecture francophone et écoute du mandarin. |

Le patch de registre propose « Je voudrais {s}, s'il vous plaît. » pour le modèle et les quatre sens de variantes de chacune des deux unités `L1-fr-ja-03` et `L1-fr-ko-03`. Ses dix changements sont limités à `native` ; **708 valeurs étudiées/aides/lectures et 352 valeurs de slots sont conservées**. Le conditionnel français exprime le sens de la demande, pas une nouvelle forme verbale en japonais ou en coréen. L’intégration éventuelle doit former un nouveau lot source explicite, sans contourner les gardes du dossier validé.

Pour l’italien, les deux ponts les plus directs sont `DECKS.it[735]`, « Ho bisogno di più tempo. », et `[2099]`, « Può richiamarmi domani? ». Leur présentation puis imitation pourrait précéder les deux variantes entières correspondantes. Les candidats `[775]` et `[726]` restent des contextes lexicaux optionnels. Les six réserves ne sont pas six simples mots manquants ; les deux ponts ne les clôturent pas.

L’inventaire chinois utilise `phf`, et celui des cinq autres langues étudiées par un francophone `pf`. Il distingue cartes, caractères et motifs des aides : les anciens totaux de syllabes ne sont pas automatiquement des occurrences d’un caractère. Il relève aussi `DECKS.zh[1874]`, où 想 a déjà `siang`, et `[1730]`, où `pou` correspond à 扑, pas à 不. Ces cas interdisent une substitution globale fondée sur les seuls motifs.

## État de livraison

Ce dossier ajoute des rapports, des propositions et leurs preuves de copie. **Application, 110 JSON, maquette, runtime, niveaux, ordre et accès restent inchangés par rapport à `cb3e22d`.** Les contrôles navigateur précédents demeurent ceux de ce commit ; ils ne sont pas présentés comme rejoués pour ces seuls documents. Les nouvelles vérifications portent sur les copies, les empreintes, le patch non appliqué et l’absence de modification des fichiers d’exécution.

Les sept scènes L1 restent dans la branche indépendante `review/integration-ponts-L1`. Les nouvelles fiches natives de Claude à `0f0a5a9` sont vierges : leur disponibilité n’est pas un avis favorable. Leur suivi et la préparation d’une activation par langue ne changent pas les décisions de phonétique ou le reclassement L1–L10.

Rien n’est fusionné, publié sur le site ni construit en APK. Le [message à transmettre à Claude](message-pour-claude.md) rassemble les points précis à relire.
