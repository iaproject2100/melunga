# Écart entre le parcours proposé et les leçons réellement intégrées

**Le reclassement de 841 unités n’a pas remplacé le parcours guidé du produit.** Les 32 115 cartes du catalogue ont été auditées, mais leurs niveaux n’ont pas été reclassés par ce travail. La branche de revue comporte une proposition complète des conversations ; `main` conserve ses anciennes familles et ne charge pas cette proposition. Réduire la prochaine livraison aux sept scènes de café répéterait cet écart.

Lecture locale de `origin/main` à **`bb9f904d79afff6efee19a80e7fe80980c733514`**, de `review/progression-L1-L10` à **`7d24556`**, et du socle d’intégration L1 à **`50a2891`**. Il ne s’agit pas d’une observation HTTP du site public. Les nombres, indices et références sont dans [inventaire.json](inventaire.json). Aucun code produit n’a été modifié pour cet audit.

## Ce qui existe, et où cela existe

| Couche | Périmètre constaté | État réel |
| --- | --- | --- |
| Catalogue classique `DECKS` | **32 115 cartes**, sept langues étudiées, niveaux historiques 1–10 | Présent dans `main`. Classement historique conservé ; audit global ≠ reclassement global. |
| Parcours guidé `PEDAGOGY_FAMILIES` | **156 familles, 906 références** | Présent dans `main`. Six langues ont 26 familles et 151 références chacune ; le coréen en a **zéro à tous les niveaux**. |
| Contenu conversation source | **110 fichiers**, 11 couples × 10 niveaux ; 1 319 unités, 5 276 variantes et 330 dialogues | Présent dans la branche pédagogique ; absent de `main` au snapshot examiné. Les quatre couples en réserve ne sont pas à activer par défaut. |
| Sous-ensemble conversation actif | **841 unités, 3 364 variantes, 210 dialogues, 1 725 tours**, sept couples | Les unités sont la matière du reclassement proposé ; les dialogues ne sont pas automatiquement reclassés avec elles. |
| `parcours-corriges.json` | **841 unités**, 70 cases couple/niveau, 122 déplacements, 319 comparaisons ciblées, 522 expressions entières, 341 réserves, trois supports catalogue | Proposition navigable et contrôlée dans `docs/`, pas un chargeur de leçon du produit. Les 3 367 énoncés affichables incluent les trois supports préexistants. |
| Sélection guidée initiale | 210 unités, 840 variantes, trois unités par niveau/couple | Ancienne sélection de revue, plus petite que le reclassement complet. Ce n’est pas la couverture finale demandée. |
| Sept scènes L1 | 49 répliques, quatre phrases à produire et trois à comprendre par couple | Intégration distincte dans la branche L1/aperçu #9. Utile pour un premier échange, mais ne remplace ni 841 unités ni 32 115 cartes. |
| Enrichissement thématique | 30 thèmes, 210 cases thème/langue, 618 phrases existantes candidates | Matière de sélection, pas 618 leçons nouvelles validées et intégrées. |

Le chargeur `conversation-loader.js` existe dans la branche pédagogique, avec les sept couples actifs et les dix fichiers par couple. **Il n’existe pas dans `main`, qui ne contient aucun des 110 JSON de niveau.** Importer ses fichiers inchangés dans le produit ne suffirait d’ailleurs pas : ils portent encore les niveaux source et ne lisent pas les décisions `proposedLevel` du reclassement.

## Pourquoi le L1 chinois actuel paraît difficile

Le mode produit `path` appelle `guidedPool(guidedActiveDeck())`. Il trie les familles par `pathLv`, puis déroule leurs cartes. Ce n’est pas une séquence comprendre → imiter → remplacer : chaque référence devient une carte classique avec un cadre affiché.

Dans le **L1 guidé réellement défini sur `main`**, la première famille chinoise contient notamment :

| Texte entier | Index catalogue résolu | Niveau historique réel | Problème d’entrée |
| --- | ---: | ---: | --- |
| 这是什么？ | 13 | 1 | Question d’identification, distincte d’une simple affirmation `这是`. |
| 这是谁的？ | 91 | 2 | Possession et interrogation différentes. |
| 这是几号出口？ | 623 | 4 | Numéro de sortie et groupe interrogatif nouveau. |
| 这是几号车厢？ | 690 | 4 | Même opération avec vocabulaire de voiture ferroviaire non préparé. |
| 这是尺码表 | 624 | 4 | Affirmation sur un tableau de tailles, autre acte de parole. |
| **这是最终报价。** | **2106** | **10** | **Devis final commercial dès la première famille L1.** |

Une origine historique L10 ne démontre pas seule une difficulté ; ici le problème est surtout la diversité des actes de parole, des constructions et des compléments introduits sans préparation. Partager quelques caractères de départ ne constitue pas une seule substitution. La famille de besoin ajoute ensuite `我需要看医生` et `我需要再想想` : action, intention et contexte ne sont pas préparés par le seul groupe `我需要`.

Le diagnostic de l’utilisatrice porte donc sur un vrai chemin disponible, pas seulement sur un seuil de longueur ou sur les conversations de la maquette. Une introduction commune peut conserver des objectifs comparables entre langues sans imposer à chacune un calque grammatical de la première famille française.

## Droits actuels à préserver avant de déplacer l’introduction

`FREE_LV = [1]` n’est **pas** la totalité de l’offre gratuite. Le mode `path` est autorisé aux non-abonnés puis filtré sur `d._path.pathLv === 1`. Ses 19 références sont donc gratuites même lorsque leur carte source est en L2, L4 ou L10. Les déplacer hors de l’introduction ne doit pas les retirer à l’utilisateur.

Les comptes ci-dessous reproduisent `activeDeck()` et `guidedPool()` depuis les données de `main`, avant le filtre personnel « déjà connues ». Le compteur brut par langue ne tient pas compte du filtre de traduction et des secteurs métier ; il ne suffit pas à mesurer l’offre effectivement présentée à chaque lecteur.

| Couple | Cartes L1 de la route classique | Cartes guidées L1 distinctes | Dont hors L1 classique | Union gratuite à conserver |
| --- | ---: | ---: | ---: | ---: |
| fr→en | 323 | 19 | 19 | **342** |
| fr→es | 288 | 19 | 12 | **300** |
| fr→it | 335 | 19 | 12 | **347** |
| fr→zh | 314 | 19 | 17 | **331** |
| fr→ja | 287 | 19 | 18 | **305** |
| fr→ko | 284 | 0 | 0 | **284** |
| zh→fr | 293 | 18 | 16 | **309** |

Le français a 19 références, mais 18 cartes distinctes, car `C’est où ?` apparaît dans deux familles. Les sept scènes café sont un droit gratuit supplémentaire de la branche L1, à conserver séparément de ce décompte de cartes classiques.

**Manifest recommandé :** un inventaire `legacyGuidedL1Access` par **couple lecteur/langue**, dont chaque ligne porte le deck, l’index effectivement résolu, le texte attendu, l’empreinte de la carte et le snapshot source. Les indices exacts sont déjà consignés dans `inventaire.json`. L’ancien chemin résout par `target` et prend la première occurrence disponible ; certains `sourceIndex` déclarés sur `main` sont faux. Utiliser ces champs déclarés directement pour restaurer les droits préserverait les mauvaises cartes.

Cet inventaire permet de retirer le devis final du démarrage débutant tout en le laissant accessible dans la bibliothèque gratuite correspondante. Il ne faut pas laisser ce devis dans la première séquence au prétexte de conserver un droit. Il ne faut pas non plus élargir `isFreeCard()` globalement à tous les lecteurs : une exception héritée de fr→zh ne doit pas ouvrir un couple en réserve.

## Points d’intégration à changer dans une branche candidate

| Point actuel | Conséquence | Adaptation recommandée |
| --- | --- | --- |
| `guidedActiveDeck()` + `guidedPool()` dans `app.html` | Le chemin guidé est une liste de cartes issue des anciennes familles ; il ne lit pas le paquet de 841 unités. | Brancher l’entrée guidée sur un contrôleur de progression lisant le nouveau paquet, avec une référence de source précise par énoncé. |
| `buildLevels()` crée l’entrée `path` | Une maquette dans `docs/` n’y apparaît jamais. | Réutiliser cette entrée visible pour l’expérience complète, et non créer une énième rubrique qui masque le nouveau parcours. |
| `setMode('path')` filtre seulement `pathLv === 1` pour les non-payants | Les droits existants sont liés aux anciennes familles, indépendamment du niveau catalogue. | Séparer niveau pédagogique proposé et droit d’accès ; conserver explicitement l’union gratuite héritée dans la bibliothèque. |
| `setMode('L1')` et autres niveaux filtrent `d.lv` + `cat === 'core'` | Le sélecteur historique ne sait pas sélectionner `proposedLevel`. | En mode parcours, les dix niveaux doivent sélectionner le niveau pédagogique du paquet ; la bibliothèque conserve son classement source jusqu’à son propre reclassement. |
| `show()`, `next()`, `prev()`, `rateCard()`, écoute et reconnaissance gèrent les cartes classiques | Des phases guidées temporaires pourraient être archivées comme cartes connues ou évaluées à tort. | Contrôleur de séance explicite, sur le modèle du branchement café, avec retour aux cartes, annulation audio/reconnaissance et aucun acquis automatique. |
| Maquette `app.js` : `understand`, `imitate`, `compare`, `choose-and-recall` | Le rendu et le contrat existent déjà, mais hors de la vraie carte. | Réutiliser ces étapes dans la carte thémée actuelle ; garder l’oreille, le sens visible au rappel et les aides exactes. Ne pas afficher le panneau de relecture dans le parcours client. |
| `conversation-loader.js` charge `L<n>-<pair>.json` | Les anciens fichiers ne changent pas de niveau par magie. | Un chargeur du paquet compilé, par couple/niveau ou par couple complet, doit conserver `sourceLevel`, `proposedLevel`, l’ID et la provenance séparément. |

Une branche candidate fondée sur le socle d’intégration L1 peut fournir cette expérience sans fusion préalable : nouveau contrôleur, données compilées, entrée guidée unique et bibliothèque préservée. Le socle, sa référence et son écart avec `main` doivent être indiqués dans la PR ; ne pas présenter une livraison complète comme un patch des seuls deux marqueurs L1.

## Séquence de livraison concrète

1. **Geler les droits et les sources.** Relever sur le `main` actualisé l’union des cartes gratuites par couple, le café et les aides des deux sens de langue. Les 32 différences de catalogue entre `main` et la branche pédagogique portent uniquement sur `arch`, pas sur les phrases, sens ou aides ; les familles ont aussi des retouches et métadonnées différentes. Ne pas importer aveuglément le gros fichier `app.html` de la branche pédagogique.
2. **Revoir vraiment L1 dans les sept langues.** L’ancienne proposition gardait les onze unités L1 à leur place par contrainte de conservation. Cette contrainte ne répond plus à la demande de démarrage plus simple. Construire une entrée courte, commune par capacités, avec phrases entières puis une seule opération réemployée. Reporter les constructions plus chargées dans le parcours tout en conservant leur ancien accès gratuit via la bibliothèque.
3. **Charger les 841 unités des sept couples dans la vraie leçon candidate.** Les 70 cases doivent être navigables et pas seulement trois démonstrations par niveau. Garder les trois supports espagnols ; enrichir progressivement avec des supports précisément sourcés et relus. Aucun énoncé ou aide assemblé à partir de morceaux.
4. **Relier des échanges effectivement préparés.** Le paquet de 841 unités n’intègre pas automatiquement les 210 dialogues actifs. N’insérer que les scènes dont les tours et réponses sont reliés aux préparations ; les sept cafés n’épuisent pas cette tâche. Les répliques reçues restent à comprendre.
5. **Enrichir les thèmes à partir d’une recherche vérifiable.** Les 30 thèmes et 618 candidats antérieurs sont une réserve ; `inspiration-concurrents.md` disait explicitement que les pages officielles étaient bloquées. Aucune lecture concurrente réalisée ne doit être revendiquée à partir de ce dossier. Sélectionner des idées de situations puis rédiger ou sourcer les contenus Melunga, sans copier les phrases propriétaires.
6. **Vérifier le produit complet.** Couverture des 841 unités et des 70 cases, entrée L1, couple/lecteur, gestes, écoute, rappel et retour, comptes gratuits/payants, accès aux anciens gratuits, erreurs/réessais et réponses tardives. Le navigateur doit exercer le fichier réellement livré. Distinguer tests locaux et parcours sur l’aperçu hébergé.
7. **Rendre visible le travail restant sur le catalogue.** Un parcours complet de 841 unités est une intégration importante, mais ne classe pas les 32 115 cartes. Pour prétendre avoir remis tout le catalogue en ordre, il faut un manifeste par entrée avec rôle (phrase entière, vocabulaire, fragment, modèle, spécialité), placement proposé, préparation et raison ; les non classées doivent rester déclarées comme telles. Une longueur ou un recouvrement lexical ne suffit pas à attribuer un niveau fiable à toute la langue.

Cette séquence conserve le périmètre global demandé et distingue les étapes livrables. Les niveaux peuvent viser les mêmes capacités entre langues avec un nombre d’étapes différent ; l’écart doit venir des constructions à préparer, pas d’un remplissage égal de gabarits. L’apprentissage observé, la qualité vocale et la relecture native ne sont pas prouvés par ces seuls comptes.

## Périmètre du présent audit

Deux fichiers documentaires seulement sont produits : ce rapport et `inventaire.json`. Sources, code de leçon, données d’exécution, tarifs, droits et phonétiques n’ont pas été modifiés. Aucune fusion ni publication n’est effectuée.
