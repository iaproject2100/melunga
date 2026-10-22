# Transition espagnol L3→L4 : préparer réellement les propositions reprises

Suite ciblée à la [validation de Claude sur `a4f1ec4`](verification-claude.md). Ce lot laisse les niveaux et l’ordre des unités validés en place. Il ajoute des supports existants à la maquette de revue, sans modification de l’application publique, des sources, de l’accès gratuit ou des tarifs.

## Décision pédagogique

La transition comporte des formes nouvelles de routine, de description et de services. Reporter les démarches administratives vers L6 diminue le ratio de L4 mais fait apparaître une autre marche vers L5 ; anticiper toutes les routines en L3 déplace également la charge. Ces calculs ne suffisent donc pas à justifier un nouveau reclassement. L’ouverture actuelle « En mi barrio hay un mercado. » ne contient d’ailleurs qu’un type écrit inédit, `barrio`, dans le périmètre retenu. Elle n’est pas remplacée au motif qu’une phrase plus courte serait nécessairement plus facile.

La correction choisie porte sur la préparation locale : **proposer une phrase entière à l’écoute et à l’imitation, puis présenter son réemploi dans une phrase développée**. Les trois cartes existent dans le catalogue et restent copiées exactement, avec leur sens et leur aide francophone.

| Support existant | Source, index base zéro | Avant la variante entière |
| --- | --- | --- |
| « Como en casa. » | `DECKS.es[264]`, niveau source 2 | « Normalmente como en casa. » — `L4-fr-es-01/v1` |
| « Me levanto temprano. » | `DECKS.es[283]`, niveau source 2 | « Normalmente me levanto a las siete. » — `L4-fr-es-01/v0` |
| « Me acuesto pronto. » | `DECKS.es[542]`, niveau source 3 | « Por la noche me acuesto pronto. » — `L4-fr-es-03/v3` |

Chaque support ajoute une étape de compréhension et une étape d’imitation **avant sa cible**, soit six étapes supplémentaires. L’oreille lit le texte espagnol du support, jamais son aide phonétique. Les quatre variantes d’origine restent présentes et entrent seules dans les choix finaux. Les aides ne sont ni assemblées ni réécrites.

L’unité de routine commence désormais par la variante avec `como en casa`, dont la proposition vient d’être présentée. L’unité du soir commence par celle avec `me acuesto pronto`. `Me levanto` est présenté séparément avant sa variante ; il n’est pas déduit de `me acuesto`. L’ordre des autres unités et tous les autres couples de langues restent inchangés.

Le support du lever ne prépare pas à lui seul le complément `a las siete` : `temprano` et une heure précise ne sont pas équivalents. La cible entière garde ses propres étapes de présentation et d’imitation ; aucune transformation libre n’est exigée à partir de la seule carte courte.

Une étape proposée à l’imitation ne prouve pas que l’apprenant l’a réalisée. Aucune note, acquisition, réussite ou condition de déblocage n’est déduite de ce passage.

## Ce que les mesures disent

Le [rapport de transition](mesures.md) distingue les variantes seules, l’inventaire incluant les supports et l’ordre réel de présentation des phrases. L’état `a4f1ec4` reste figé pour la comparaison.

- **Variantes seules :** L3 reste à 59/103 = 57,282 % et L4 à 70/110 = 63,636 %, soit +6,355 points. Aucun nouveau déplacement de niveau ni diminution de ce ratio n’est revendiqué.
- **Tous supports :** `temprano`, déjà présent en L2, ajoute un type au dénominateur de L4. Le résultat 70/111 ne constitue pas une réduction de charge : changer le périmètre du calcul n’est pas un progrès pédagogique.
- **Présentations dans l’ordre :** les supports introduisent quatre types (`como`, `levanto`, `acuesto`, `pronto`) avant leurs cibles. Dans `L4-fr-es-01`, le maximum par présentation passe de trois à deux types nouveaux, supports compris. Dans l’unité du soir il reste à deux ; le maximum de tout L4 reste à quatre. Le total de formes à découvrir n’est pas supprimé.

Ce relevé de formes écrites décrit une distribution de premières occurrences, pas l’effort cognitif ou la compréhension. Il ne compte pas une nouvelle construction comme acquise parce que ses mots étaient présents auparavant. **La correction donne un réemploi réel à observer ; elle ne clôt pas à elle seule la validation de l’apprentissage.**

## Sources et contrat

Les quatre variantes de chaque unité restent séparées des supports dans les données. Les références à ces derniers figurent dans [preparations.json](preparations.json) ; le compilateur copie `t`, `frm` et `pf` depuis l’application source protégée. Les étapes précises de compréhension et d’imitation sont enregistrées et vérifiées avant la présentation cible. Les compteurs distinguent les 3 364 variantes initiales, les trois supports supplémentaires existants et l’absence de rédaction de phrase ou d’aide nouvelle.

Les choix et raisons sont détaillés dans le [diagnostic pédagogique](diagnostic-pedagogique.md) et les [propositions sourcées](propositions.json). Le pont `Trabajo hasta las seis.` n’est pas importé : ses aides diffèrent de celles de la conversation, et ce lot ne décide aucune harmonisation. Les autres candidats non retenus ne sont pas présumés présentés.

La [proposition de libellé pour `L3-fr-es-05`](proposition-libelle-L3-05.json) est distinguée du traitement de la charge : `esta palabra` et `la pregunta` sont des groupes objets entiers, déterminant compris. Ce point ne change aucune phrase ou comparaison de variantes.

## Revue et publication

La [relecture suivante de Claude](../suite-validation/verification-claude-transition-es.md) accepte ce lot sans réserve. La [trace indépendante jointe](../suite-validation/trace-es-verifiee.md) précise son ordre effectif : « Normalmente como en casa » introduit encore `normalmente` (une forme, pas zéro). Le zéro de son tableau appartient à un autre ordre ; les agrégats sont identiques. Aucun ordre ni fichier d’exécution n’est modifié à la suite de ce constat.

Les [contrôles et commandes](checks.json) donnent **80 tests Python réussis**, **23 682 étapes navigateur** et **32 208 activations simulées d’oreille**, sans erreur. Les 11 488 champs de variantes et les neuf champs des trois supports sont comparés à des sources Git indépendantes du compilateur. Le rappel conserve ses quatre choix, et trois cas de supports invalides sont refusés avant présentation.

Le [rapport portable et les six captures](verification-portable.json) contrôlent un fichier autonome par HTTP local : un document, aucune ressource supplémentaire, sept couples et trois oreilles de support. Les captures ont été ouvertes et inspectées à 390 et 1440 pixels de largeur ; elles ne constituent pas un essai sur téléphone physique. L’ouverture directe `file://` n’est pas testée, sans contournement de la politique du navigateur.

Pour rejouer les contrôles de données :

```sh
python3 -B tools/pedagogy/apply_reclassement_followup.py --check
python3 -B tools/pedagogy/build_progression_corrections.py --check
python3 -B tools/pedagogy/audit_transition_es.py --candidate-file docs/progression-corrections/parcours-corriges.json --check
python3 -B -m unittest discover -s tools/pedagogy -p 'test_transition_es*.py'
```

Le lot précédent reste validé au périmètre annoncé par Claude. Les sept scènes L1 restent séparées, avec leur relecture native à compléter. Les questions de registre japonais/coréen, le déficit lexical italien L8 et les conventions phonétiques chinoises ne sont pas réputés résolus par ce travail espagnol.

La maquette actualisée sert à relire les nouvelles étapes. **Aucune fusion vers `main`, publication ou nouvelle promesse de progression validée n’est effectuée.**
