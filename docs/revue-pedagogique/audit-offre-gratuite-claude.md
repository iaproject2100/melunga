# Offre gratuite — contrôle des chiffres et de l’accès réel

Revue en lecture seule du 20 octobre 2026. Copie locale `674888e` dans `/workspace/melunga-familles` et référence Git locale `origin/main` à `e0caf72`. Aucun accès réseau, aucune modification de l’application, des droits ou de l’offre. La référence Git n’est pas une vérification du déploiement réellement servi aujourd’hui sur melunga.com.

## Résultat

Les chiffres bruts annoncés par Claude sont exacts : **293 / 323 / 289 / 314 / 338 / 290 / 287** cartes `DECKS.lv=1` pour fr/en/es/zh/it/ja/ko. Ils sont identiques dans les deux références examinées.

Ils ne signifient pas que chaque utilisateur voit exactement ce nombre de phrases complètes dans le mode « L1 ». Trois distinctions sont nécessaires : catalogue brut, contenu réellement filtré pour le couple, puis mode choisi.

## Catalogue et contenu visible

Comptes sans archives, avec un accès gratuit, pour les sept couples historiques du parcours conversation. Les autres langues maternelles peuvent avoir des filtres de traduction ou de contenu différents.

| Couple lecteur → langue étudiée | Catalogue brut lv1 | Mode Tout gratuit | Mode L1 (`core`) | Entrées lv1 marquées `fragment` dans Tout |
|---|---:|---:|---:|---:|
| zh → fr | 293 | 293 | 272 | 115 |
| fr → en | 323 | 323 | 308 | 116 |
| fr → es | 289 | 288 | 223 | 109 |
| fr → zh | 314 | 314 | 224 | 112 |
| fr → it | 338 | 335 | 316 | 158 |
| fr → ja | 290 | 287 | 260 | 105 |
| fr → ko | 287 | 284 | 268 | 114 |

Ces nombres comptent des **entrées** ; des textes dupliqués peuvent apparaître dans plusieurs cartes. Le statut éditorial `fragment` existe dans les données mais **ne constitue pas un filtre automatique d’accès**. Il ne faut donc ni annoncer tous ces nombres comme des phrases complètes distinctes, ni soustraire les fragments comme s’ils étaient actuellement invisibles.

### Raisons des écarts

`activeDeck()` (`app.html:3264`) :

- retire les thèmes de sourcing quand le couple n’est pas concerné, selon `sourcingRelevant()` ;
- ne garde que les entrées portant le champ de traduction de la langue maternelle ;
- ne filtre pas `pedagogicalStatus=fragment`.

Les retraits lv1 observés ici viennent du classement `th=biz` : espagnol `Buena idea.` ; italien `da fare`, `A meno che...`, `in corso` ; japonais `やること`, `〜でなければ…`, `進行中` ; coréen `할 일`, `아니라면…`, `진행 중`. Le fait que certains de ces contenus semblent quotidiens est une question de classement éditorial distincte, pas une nouvelle règle gratuite appliquée par cette revue.

`setMode()` (`app.html:3431–3470`) :

- **Tout** : `activeDeck`, puis `isFreeCard`, donc toutes catégories lv1 accessibles ;
- **L1** : seulement `lv===1 && cat==='core'` du deck actif ;
- **Bases / Mots** : catégories correspondantes puis restriction lv1 ;
- les cartes archivées sont ensuite retirées de Tout, L1, Bases/Mots et Parcours, par clé `lang|texte`. Les tableaux décrivent un état sans archives et non un nombre garanti restant dans chaque séance.

## Parcours guidé L1 : dix-neuf occurrences, pas dix-neuf nouveautés partout

`guidedActiveDeck()` et `guidedPool()` (`app.html:2934–2957`) construisent une sélection propre au parcours. En accès gratuit, `setMode('path')` la limite par **`_path.pathLv===1`**, et non par le niveau de catalogue `DECKS.lv`.

| Couple | Occurrences de cartes guidées L1 | Textes distincts | Textes déjà dans Tout gratuit | Textes distincts supplémentaires | Union Tout + Parcours, textes distincts |
|---|---:|---:|---:|---:|---:|
| zh → fr | 19 | 18 | 2 | 16 | 309 |
| fr → en | 19 | 19 | 0 | 19 | 342 |
| fr → es | 19 | 19 | 7 | 12 | 300 |
| fr → zh | 19 | 19 | 2 | 17 | 331 |
| fr → it | 19 | 19 | 7 | 12 | 342 |
| fr → ja | 19 | 19 | 2 | 17 | 296 |
| fr → ko | 0 | 0 | 0 | 0 | 280 |

Le français a dix-neuf occurrences mais dix-huit textes : `C'est où ?` est utilisé dans deux familles. Les modes Tout italien/japonais/coréen comportent aussi des textes dupliqués : leurs unions de textes distincts ne s’obtiennent pas en additionnant directement les nombres d’entrées du premier tableau.

Les cartes supplémentaires du parcours ne sont pas de nouvelles cartes créées par l’offre : elles sont déjà dans le catalogue, à d’autres niveaux, et accessibles par la sélection guidée L1. Exemples :

- français `Où est l'enregistrement ?` : niveau de catalogue 5, niveau de parcours 1 ;
- anglais `Where is the hotel?` : catalogue 5, parcours 1 ;
- chinois `这是最终报价。` : catalogue 10, parcours 1.

Ce dernier exemple est également un sujet de pertinence pédagogique du L1. Réparer des métadonnées ou compter l’offre ne suffit pas à valider sa difficulté. Le coréen n’a pas de configuration de familles dans les références examinées : `guidedPool` retourne une liste vide pour cette langue.

Autre distinction : `guidedActiveDeck()` ne reproduit pas tous les filtres de `activeDeck()` ; il utilise sa propre sélection par traduction, et les références de familles. Le tableau ci-dessus calcule chaque mode selon son code réel, sans supposer qu’ils utilisent exactement la même réserve filtrée.

## Mes phrases : branche d’essai et production à distinguer

### Copie conversation locale `674888e`

`construire.js:277` autorise le niveau 1 lorsque le couple existe ; les niveaux 2–10 exigent normalement `isPaid===true`. Chaque L1 des sept couples historiques contient **11 modèles, 44 variantes et 3 dialogues de 6 répliques**, soit 18 tours.

Mais :

- « tous les contenus de Mes phrases L1 accessibles » ne signifie pas autant de phrases nouvelles supplémentaires aux cartes classiques ; aucun dédoublonnage entre ces deux réserves n’a été effectué dans ce compte ;
- le chargeur de cette copie déclare **sept couples** dans `PAIRS` (`conversation-loader.js:29`) : fr→es/en/zh/it/ja/ko, zh→fr ;
- quatre fichiers L1 supplémentaires pour lecteurs anglophones existent, mais la simple présence de leurs JSON ne les rend pas sélectionnables dans le chargeur actuel ;
- sur les hôtes d’aperçu Netlify ou localhost web, `previewLevels()` ouvre tous les niveaux pour l’essai ;
- en natif, ce raccourci par hôte ne suffit pas ; `MELUNGA_TEST_BUILD` explicite ouvre les niveaux d’essai. Cela ne constitue pas un droit Premium accordé à l’utilisateur ;
- hors contexte d’essai, les niveaux supérieurs restent conditionnés à l’état d’accès existant. Cette revue ne change aucune de ces règles.

### Référence de production `origin/main` à `e0caf72`

Elle contient le catalogue et le parcours guidé, avec les mêmes comptes ci-dessus. Elle **ne contient ni `construire.js`, ni `conversation-loader.js`, ni leur inclusion dans `app.html`**.

On ne peut donc pas présenter Mes phrases L1 comme une composante déjà publiée de cette référence de production. C’est une composante de la branche conversation à intégrer après les validations prévues. Le site réellement déployé et l’APK réellement installé devraient être vérifiés séparément pour annoncer leur périmètre exact.

## Révisions et états déjà enregistrés

Les modes Révision/Rappel construisent leur réserve avec `accessible(d)`, qui applique normalement Premium ou `isFreeCard` aux cartes classiques. Les listes À revoir / Rangées lisent leurs états locaux et n’appliquent pas exactement le même filtre dans `setMode`. Un historique d’abonnement ou des archives existantes peut donc produire une expérience différente de celle d’un nouvel utilisateur sans stockage.

Ces différences n’autorisent pas à annoncer un supplément gratuit fixe. Les tableaux précédents portent volontairement sur les trois modes demandés — Tout, L1, Parcours — sans historique d’archives.

## Formulation recommandée pour la discussion commerciale

> Le catalogue comporte environ 290 à 340 entrées lv1 selon la langue, incluant bases, mots et expressions. Le nombre visible dépend du couple et du mode ; la rubrique L1 ne contient que les cartes principales. Le parcours guidé ajoute une sélection L1 de dix-neuf occurrences dans six langues, avec des chevauchements. Mes phrases L1 est accessible dans la branche conversation d’essai pour les couples pris en charge, mais n’est pas présent dans la référence de production examinée. Ces chiffres décrivent l’existant et ne décident pas encore de la future offre gratuite.

Pour la proposition « un L1 plus court avant Premium », faire choisir un **parcours de découverte court au sein d’un L1 riche**, sans prétendre que le catalogue actuel contient seulement ce court essai. Toute réduction réelle d’accès demanderait une décision explicite de Kartech, distincte du découpage pédagogique.
