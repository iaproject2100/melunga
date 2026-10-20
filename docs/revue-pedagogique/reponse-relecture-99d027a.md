# Réponse à la relecture Claude `99d027a`

Retouches préparées localement sur `review/familles-huit-corrections`, après `f277261`. Aucun envoi distant, fusion, déploiement ou activation de langue supplémentaire. La réparation indépendante des métadonnées est isolée dans le commit local `2cdc312`.

## Objectif pédagogique rappelé par Kartech

L'apprentissage doit s'inspirer de l'acquisition naturelle d'une langue : entendre une phrase dans une situation compréhensible, l'imiter, retrouver ses éléments, les remplacer progressivement, puis les combiner pour parler soi-même. Les phrases complètes, leur sens, l'audio et l'aide phonétique adaptée au lecteur restent le support de cette progression.

Cette intention vaut pour toutes les langues, de L1 à L10, sur ordinateur, navigateur mobile et application. Elle implique du réemploi espacé et des échanges préparés : un élément déjà présenté n'est pas automatiquement compris ou disponible à l'oral. Les futures mini-séquences devront montrer les reprises et les nouveautés, et préparer aussi ce que dit l'interlocuteur. Leurs repères serviront aux essais et à la relecture, sans note ni verrou automatique.

L'objectif de L10 devra être décrit par des conversations quotidiennes que l'apprenant peut conduire et adapter. Le simple inventaire de constructions grammaticales ou la longueur des phrases ne suffit pas à démontrer cette autonomie. La correction locale des familles ne constitue donc pas une validation de toute la progression L1–L10.

## Trois retouches

### 1. Une réponse d'opinion négative en anglais

Dans `en / L6_OPINION`, étape 5, `I think it's going to work.` est remplacé par la carte existante `I don't think so.`. `I think it'll work.` reste à l'étape 3. Le libellé de famille devient `I think… / I don’t think…` et les annotations `arch` de cette seule famille sont synchronisées.

Les aides et traductions de la carte source sont conservées. La réponse négative reprend un avis déjà exprimé ; `so` doit donc être compris dans un échange. Le pont existant `I think so.` permettrait de préparer cette opposition dans une future séquence. Il n'est pas ajouté dans ce lot. La négation complète `I don't think it's a good idea.` est absente du catalogue actuel ; elle n'a pas été fabriquée.

### 2. Distinguer intention et imminence en chinois

`我要去商店` est conservé. Le groupe suivant 要 contient bien un verbe, `去`, et sa destination, `商店`. C'est un exemple pertinent pour l'objectif de Kartech : savoir réutiliser une structure pour dire que l'on va au magasin, au marché ou ailleurs. Les trois constructions citées lors de la revue ne se découpent pas de la même manière : dans `Voy a casa` et `I'm going to bed`, le groupe de destination suit directement la construction de déplacement ; dans `我要去商店`, le groupe suivant 要 commence par l'action 去. Cette distinction est documentée ici, sans ajouter de texte à l'interface.

À l'étape 5, `我要走了` est remplacé par la carte existante `我要洗一下手`, action concrète de la vie quotidienne. Les traductions et aides existantes restent intactes ; l'ancienne phrase reste dans le catalogue. Les annotations `arch` de cette seule famille sont synchronisées.

Cette substitution isole le travail sur 我要 + action de l'usage d'imminence 要…了. Elle ne prouve pas que la nouvelle phrase soit plus facile : le bloc `洗一下手`, notamment 一下 et 手, devra être entendu et compris avant l'assemblage. Son niveau de catalogue est L5 ; le niveau guidé L2 reste inchangé dans cette correction limitée. Ce décalage demeure à traiter dans la future organisation pédagogique. `我要休息` et `我要试试` ne sont pas des cartes existantes de cette copie ; aucune aide phonétique n'a été inventée pour les insérer.

### 3. Compléter les sept champs chinois

Les sept références de `zh / L2_ACTION_PROCHE` ont maintenant `chinese` égal à leur texte chinois `target`. Le vide avait été introduit dans la correction précédente par la lecture d'un champ de traduction absent des cartes dont le texte étudié est déjà chinois. Aucun texte de catalogue n'est réécrit.

## Métadonnées : conserver et réparer

Les 906 références sont exactes après recalcul selon la première correspondance textuelle utilisée par `guidedPool()`. Sur la base `f277261`, 853 indices étaient faux ; une référence supplémentaire avait seulement son niveau faux, soit 854 références avec au moins un écart. Le détail et la commande de contrôle figurent dans `reparation-metadonnees-familles.md`.

`currentLevel` décrit le classement historique de la carte, et `pathLv` le classement de la famille guidée. Aucun des deux ne mesure la maîtrise réelle. Les désalignements qu'ils révèlent doivent nourrir la relecture, sans renumérotation automatique.

## Vérifications et limites

- Les 32 115 contenus de carte sont conservés : phrases, traductions, aides, catégories et niveaux. Seules les annotations `arch` des deux familles retouchées changent dans les catalogues.
- Les six langues dotées de familles gardent chacune 26 familles et 151 références ; les 906 références se résolvent, avec les mêmes étapes et niveaux guidés. Le coréen n'acquiert pas de familles dans ce lot.
- La réparation seule des métadonnées conserve à l'identique les catalogues et les 906 cartes servies. Les retouches suivantes changent seulement les deux sélections et le libellé anglais documentés ci-dessus, ainsi que les sept champs chinois.
- Sept tests du script d'entretien passent. Le contrôle final indique zéro écart de métadonnées.
- La suite existante `conversation-ui.test.cjs` passe sur les sept couples actifs et les formats 320×568 / 1440×900 : parcours, rappel, dialogues, reprise, droits, erreurs de chargement et gestes. Les services de ces essais sont simulés ; aucun essai APK sur appareil n'est ajouté.
- Fonctions, styles et balisage de l'application restent identiques à `f277261`. Le rapport structuré est `verification-retouches-99d027a.json`.

Les décisions sur le parcours, la largeur de L1, les rubriques et les priorités restent à Kartech. Aucun fichier `seq-*`, champ de briques, changement de navigation ou élargissement des couples actifs n'est lancé dans ce lot.
