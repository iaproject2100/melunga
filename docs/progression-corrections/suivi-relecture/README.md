# Suite à la relecture du reclassement `99478df`

**Historique validé dans `a4f1ec4`.** Les métriques, contrôles et captures de ce dossier restent ceux de cette étape de revue ; leurs fichiers et empreintes originaux peuvent être consultés dans Git à ce commit. La [passe suivante espagnol L3→L4](../transition-es/README.md) possède ses propres mesures et contrôles. Le rapport navigateur à la racine et la maquette suivent le candidat le plus récent.

Ce dossier conserve la [première relecture](verification-claude.md) et la [correction transmise ensuite par Claude](verification-claude-corrigee.md), sans modifier leur texte. **La seconde fixe la demande actuelle : examiner fr→es et, à titre complémentaire, zh→fr sur la part de formes inédites.** Le reproche concernant l’italien et la demande de correction des marches de longueur en anglais/coréen ont été retirés.

La référence historique reste `99478df`. Les rapports de longueur décrivent cette référence, même lorsqu’un candidat amendé est également présenté. Les différences de longueur ne servent pas de preuve d’une difficulté linguistique, ni de critère de permutation des niveaux.

## Changements effectivement adoptés dans la maquette

Les [décisions rejouables](decisions.json) portent sur **29 lignes éditoriales**, sans aucun nouveau changement de niveau :

- **Espagnol :** présenter la cause avant la préférence qui la combine au comparatif ; retirer la condition comme faux antécédent de la question indirecte avec `si` ; expliciter les préparations manquantes pour le double clitique `me lo`, `está vendido` et la valeur atténuative de `quería`. En L4, commencer les routines par les prédicats déjà rencontrés et présenter le document avant la démarche qui le réemploie. En L8, comparer d’abord les aménagements contenant `pagar` et `cambiar`, tout en introduisant leurs nouvelles phrases entières. Le déterminant reste inclus dans chaque groupe nominal de `Falta…`, sans article supposé invariant.
- **Français pour sinophones :** ajouter douze liens exacts de reprise dans sept unités L9 : obligation, passé, rendez-vous, existence, facture, incident, solution et préférence. Le subjonctif, le futur simple, l’impératif avec pronom et les nouveaux enchâssements gardent leur préparation propre ; ils ne se déduisent pas de lexèmes déjà rencontrés.
- **Italien :** présenter les comparaisons avant les avis qui les réemploient ; préciser les reprises lexicales `sconto` et `entro` ; distinguer permission et condition. Ces corrections de dépendances sont indépendantes du grief de longueur retiré. La nouveauté de `migliore` et la réponse reçue à `Le dispiace se` restent déclarées.
- **Coréen :** commencer le récit de deux actions par la phrase entière contenant l’activité déjà rencontrée `운동해요`, avec son lien de préparation explicite. La nouvelle forme et la liaison ne sont pas déclarées connues par analogie.
- **Anglais :** les deux retours proposés vers L7 ne sont **pas adoptés**. Le candidat de `99478df` est conservé ; on ne modifie pas le niveau sur la foi de la courbe de longueur après retrait du grief.

L’ordre interne de certaines unités et les références changent réellement dans la maquette. **Les 841 unités, 3 364 variantes et 11 488 champs de texte/aides restent identiques aux sources.** L1 reste inchangé ; les déplacements déjà proposés dans `99478df` restent au nombre de 122. Le candidat contient désormais **1 372 liens de préparation prévue et 341 annotations de réserves**. Ajouter une réserve décrit une limite ; cela ne la répare pas.

## Réponse à la demande actuelle

La [mesure de nouveauté](nouveaute.md) documente une formule **numériquement compatible** avec les sept lignes du tableau corrigé : variantes seules, types écrits, segmentation spécifique et pourcentages arrondis à l’entier. Le script de la nouvelle mesure de Claude n’étant pas fourni, cette compatibilité n’atteste pas sa méthode exacte. Les fractions non arrondies et trois périmètres alternatifs sont conservés. L’ancien calcul incluant les dialogues n’est pas substitué silencieusement à celui-ci.

**Espagnol :** deux marches conservées ne signifient pas deux amplitudes inchangées. L’écart L3→L4 augmente de **2,964 à 6,355 points**, tandis que L7→L8 diminue de **11,762 à 7,812 points**. L8 passe de 63 à 39 types nouveaux. L4 concentre routines, logement et quatre unités de services/démarches, ces dernières portant 24 de ses 70 types nouveaux. L’[examen détaillé](espagnol-nouveaute.md) identifie les formes, groupes et fonctions à préparer, puis les huit amendements de découverte/reprise. Dix [candidats de ponts catalogue](espagnol-nouveaute-propositions.json) sont sourcés pour un lot suivant ; ils ne sont ni importés ni présumés présentés dans cette maquette.

**Français pour sinophones :** la hausse L8→L9 vaut **29/85 = 34,118 % → 44/124 = 35,484 %**, soit **1,366 point**. Les deux unités reportées de L8 à L9 contribuent 13 des 44 types nouveaux. Dix types sont des formes de lexèmes déjà rencontrés, ce qui ne prépare pas leurs flexions ni leur emploi ; inversement, un enchâssement nouveau peut employer presque uniquement des mots déjà présents. L’[examen des onze unités L9](sinophones-nouveaute.md) distingue ces cas et justifie les douze liens ajoutés, sans annuler le motif pédagogique des reports.

**Les ratios par niveau ne changent pas avec ces amendements.** L’ordre interne et les liens éditoriaux ne changent pas l’union de types du niveau, ni sa comparaison avec les niveaux précédents. Les améliorations portent sur les phrases rencontrées d’abord, la reprise explicite et la description honnête des manques ; leur effet sur compréhension, rappel et recombinaison reste à tester avec des apprenants. Aucun aplanissement numérique ni validation globale de la progression n’est revendiqué.

## Analyses et limites

- [Espagnol : décisions et frontières](espagnol.md) ; [patchs exacts](espagnol-propositions.json).
- [Italien : dépendances et limites lexicales](italien.md) ; [patchs exacts](italien-propositions.json).
- [Explication des anciennes alertes EN/KO](marches-en-ko.md). Les retours de niveau EN de ce document sont des propositions historiques non retenues ; le journal de décisions fait foi.
- [Triage des 102 réserves pour sinophones](sinophones-reserves.md) et [inventaire exact](sinophones-reserves.json). Les 102 notes ne signifient pas 102 erreurs de phonétique : 73 précautions structurelles, 21 limites de réception/contexte, 5 préparations manquantes et 3 problèmes de registre. Aucune de ces notes ne diagnostique directement la qualité phonétique ; cette qualité reste à relire.
- [Mesures de longueur reproductibles](mesures.md). Les amplitudes et numérateurs sont fournis pour vérifier le raisonnement ; les conclusions initiales retirées ne sont pas reconduites.

Le ratio de formes écrites inédites est un signal de corpus, pas une mesure des connaissances d’un apprenant. Les formes fléchies peuvent être comptées nouvelles sans constituer un nouveau lexème ; inversement, une structure nouvelle peut employer des mots déjà présents. L’ordre prévu et la présence dans une source ne démontrent ni exposition effective ni acquisition.

## Périmètre de livraison

Les modifications restent dans le dossier de revue et les outils qui le compilent. L’application, les 110 sources conversation, le catalogue classique, les aides phonétiques, les droits et les tarifs restent protégés. Les dialogues ne sont pas automatiquement reclassés avec les unités : les anciens taux de 49 %/55 % de formes non retrouvées dans les dialogues ES/IT ne sont pas réputés améliorés par ces changements.

Les sept scènes L1 techniquement relues dans `939b82e` restent un lot distinct, avec leur relecture native à compléter. Aucune fusion vers `main`, publication, activation de langue en réserve ou construction d’APK n’est autorisée par ce dossier.

## Rejouer les amendements

```sh
python3 -B tools/pedagogy/apply_reclassement_followup.py --check
python3 -B tools/pedagogy/build_progression_corrections.py --check
python3 -B tools/pedagogy/audit_reclassement_followup.py --candidate-file docs/progression-corrections/parcours-corriges.json --check
python3 -B tools/pedagogy/audit_reclassement_novelty.py --candidate-file docs/progression-corrections/parcours-corriges.json --check
python3 -B -m unittest discover -s tools/pedagogy -p 'test_reclassement*.py'
```

Sans `--check`, l’outil d’amendement repart des trois entrées éditoriales concernées et figées dans `99478df`, vérifie chaque citation et ne change que les champs éditoriaux sélectionnés. Le compilateur recopie ensuite les variantes entières, sans fabriquer de nouvelle phrase ou phonétique.
