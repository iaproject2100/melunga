# Barre mobile Turquoise doux — vérification navigateur

**10 groupes / 50 cas réussis**, sans erreur JavaScript, erreur de fixture, requête inattendue ni contrôle manquant. Les empreintes des entrées sont restées identiques pendant la passe. Le [rapport JSON](browser-report.json) conserve les mesures détaillées et les empreintes des sources utilisées.

## Concordance avec la maquette choisie

La référence produit est `7ede0dc23d07cf97d18e32d686de6bec3be369ac`. L’option 1 « Turquoise doux » est celle du rapport de maquette au commit `026aa0c`, dont le SHA-256 figure dans `chosenPreview` du rapport. Le navigateur charge uniquement les vrais fichiers du produit, sans injecter les adaptateurs de maquette.

Les quatre vues **320 × 568**, **320 × 620**, **390 × 780** et **430 × 780** correspondent exactement au rapport de la maquette retenue : rectangles de la barre, carte, logo, réglages et actions, champs source, taille du texte et légendes. La [capture principale](captures/turquoise-dock-approved-pink.png) montre le véritable thème 08 « Décrire et comparer », phrase `catalogue:es:302`, ambiance `legacy-plum`. Elle ne dessine aucun habillage de téléphone ou de navigateur.

La barre de leçon mesure **56 px**, contre 104 px à la référence. « À revoir » reste à gauche, les quatre réglages dans leur capsule translucide centrale, et « Suivant » à droite. Les deux actions mesurent **54 × 56 px à 320 px** de largeur ; leurs colonnes s’élargissent à **67,125 px en 390** et **74,625 px en 430**. Les réglages gardent leurs supports de 32 px et leurs cibles hautes de 48 px, d’au moins 44 px de large.

Les couleurs observées sont `#e8f3f1` / `#145b57` pour « À revoir » et `#147d78` / blanc pour « Suivant ». Les quatre noms des réglages restent masqués visuellement et présents pour l’accessibilité.

## Couverture

- Deux largeurs étroites supplémentaires, **280 × 620** et **300 × 620** : repli sans chevauchement, champs source entiers, six commandes contenues dans la fenêtre et cibles intactes. À 280 px, les actions mesurent 50 × 56 px et les quatre réglages centraux 44 × 48 px.
- Sept langues natives en **320 × 620** : français, anglais, espagnol, chinois, italien, japonais et coréen ; noms accessibles et légende suivante localisés. Chinois avec pinyin et phrase longue L8 en **390 × 700**, avec photo et recadrage exacts du thème.
- Véritables dialogues de niveau, langue et menu ; cycle de palette ; progression identique à la référence ; phrase réellement enregistrée dans « À revoir ». Les mêmes nœuds de commandes restent présents pendant les interactions et redimensionnements.
- Chargement bloqué par une fixture de transport explicite, thèmes, dernier thème atteignable et véritable fin de leçon obtenue avec les commandes d’origine. Le pied d’actions reste masqué au chargement et sur les thèmes ; le libellé canonique revient à la fin.
- Après cette véritable fin de leçon, **42 présentations de légendes finales traduites** sont contrôlées à 280 et 320 px : sept langues × « Séquence suivante », « Les séquences » et « À revoir ». Ces substitutions de texte sont explicitement des fixtures de présentation, sans simuler l’avancement d’une séquence. Les rectangles de l’encre restent à l’intérieur des boutons ; la barre peut alors grandir de 56 à 81,75 px pour montrer les libellés entiers.
- Véritable rappel masqué obtenu par les étapes du cours, passage bureau puis retour mobile sans révélation du champ masqué ; drapeaux explicites d’une attente de réponse conservés, bouton désactivé conservé.
- Bureau **1366 × 768** et **1920 × 1080** identique à la référence. Passages 760/761/1101/390 px : état courant, légendes et géométrie d’origine restaurés exactement au-dessus du seuil mobile.
- Réserve basse de **24 px** et barre externe explicite de **60 px** : place réservée, barre déplacée et aucun recouvrement de la carte.

## Contraste

Les fonds réellement composités dans les PNG sont échantillonnés sous les textes et SVG visibles sur les **17 ambiances**, au repos puis au survol de L1, du menu et des deux actions. Les seuils sont **4,5:1 pour les textes** et **3:1 pour les SVG** ; aucun arrondi ne sert à accepter un résultat inférieur.

| Élément | Minimum observé |
| --- | ---: |
| L1 | 4,7876:1 |
| Menu | 6,0454:1 |
| À revoir, texte et SVG | 6,9531:1 |
| Suivant, texte et SVG | 4,9594:1 |

## Sources et limites

Le contrôle compare **165 fichiers protégés** à la référence, en excluant uniquement `course-desktop.css`, `parcours-niveaux.html` et `maquette-guidee.html`. Les JavaScript, données de cours et services protégés sont conservés octet pour octet.

Exécution locale sous Chromium, avec dimensions mobiles et émulation tactile. Réseau et médias utilisent des fixtures explicites : aucun compte réel, paiement, appel TTS distant ou lecture audio réelle. Aucun essai sur téléphone Android ou iPhone physique, Safari ou application installée à l’écran d’accueil n’est revendiqué. Ce rapport vérifie les fichiers locaux ; il ne prouve pas leur publication.

Les **16 captures** sont référencées dans le rapport et leurs empreintes sont conservées dans [capture-sha256.json](capture-sha256.json). Harnais : `/tmp/mobile-turquoise-dock-integration-qa.cjs`.
