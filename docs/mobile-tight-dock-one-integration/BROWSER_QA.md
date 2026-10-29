# Capsule resserrée 1 — vérification navigateur

Résultat : **8 groupes / 38 cas réussis**, sans erreur JavaScript, erreur de fixture, requête inattendue ni contrôle manquant. Les empreintes des entrées sont restées identiques entre le début et la fin de la passe. Le résultat détaillé figure dans [browser-report.json](browser-report.json).

La référence est `f01a73138aad17be0cb6e712752afe6cb664dfaa`. Le contrôle compare 165 fichiers protégés à cette référence ; les trois seules exceptions produit sont `course-desktop.css`, `parcours-niveaux.html` et `maquette-guidee.html`. Tous les JavaScript, données des cours et services protégés sont conservés octet pour octet.

## Présentation vérifiée

La [capture principale](captures/tight-dock-one-approved-pink.png) provient du véritable parcours en 320 × 620, ambiance rose `legacy-plum`, thème 08 « Décrire et comparer », phrase `catalogue:es:302`. Elle n’ajoute aucun habillage de téléphone. Les trois champs correspondent exactement au contenu source : « Es muy ligero. », « és mouy li-RÉ-ro », « c’est très léger ».

La capsule de leçon mesure **104 px**, contre 120 px à la référence. La capsule de thèmes mesure **54 px**, contre 58 px. L’espace entre le bas des icônes visibles et le début des actions mesure **8 px**, contre 24 px. Les quatre supports d’icônes mesurent **32 × 32 px**, avec une cible de réglage haute de **44 px** ; les actions « À revoir » et « Suivant » gardent une hauteur de **48 px**. Le drapeau mesure 32 × 21,333 px, au rapport 3:2 ; le menu 26 px, la roue de couleur 28 px, et le texte L1 17 px.

Les quatre intitulés de réglages sont masqués visuellement. Les noms accessibles d’origine restent présents. L’aspect translucide et le contraste des commandes restent actifs.

## Contrôles effectués

- Thèmes en 320 × 680, 390 × 780 et 430 × 780 : typographie des cartes, logo, vrais noms accessibles et cartes atteignables.
- Leçons en 320 × 620, 390 × 780 et 430 × 780 ; chinois avec pinyin et phrase longue L8 en 390 × 700 : aucun champ tronqué, chevauchement ni défilement de page ; photo et recadrage exacts du thème source.
- Sept langues natives : français, anglais, espagnol, chinois, italien, japonais et coréen ; noms accessibles d’origine et intitulé localisé de l’action suivante.
- Véritables dialogues de niveau, langue et menu, cycle de palette, progression suivante identique à la référence et enregistrement réel de la phrase dans « À revoir ».
- Bureau en 1366 × 768 et 1920 × 1080 : instantanés DOM, géométrie et présentation identiques à la référence. Aux passages 760/761/1101/390 px, l’étape courante est conservée et les contrôles de bureau sont restaurés exactement.
- Réserve basse de 24 px et barre externe explicite de 60 px : capsule déplacée, espace réservé et contenu lisible sans recouvrement.

## Contraste

Les pixels de fond réellement composités du PNG sont mesurés sous chaque texte et SVG visible de la capsule sur les **17 ambiances**, puis au survol de L1, « À revoir » et « Suivant ». Les seuils sont 4,5:1 pour les textes et 3:1 pour les SVG.

Le minimum texte observé est **4,6083:1** (« Suivant », `legacy-gamified`, état normal). Le minimum SVG est également **4,6083:1**. Le minimum du texte L1 est **4,7876:1**. Aucun seuil n’est arrondi pour accepter un échec.

## Portée

Exécution locale sous Chromium, avec dimensions mobiles et émulation tactile. Réponses réseau et médias explicitement simulés ; aucune utilisation de compte réel, paiement, requête TTS distante ou lecture audio réelle. Aucun test sur appareil Android ou iPhone physique, Safari ou application installée à l’écran d’accueil n’est revendiqué.

Les neuf captures de cette passe sont référencées dans le rapport ; leurs empreintes sont dans [capture-sha256.json](capture-sha256.json). Le harnais employé est `/tmp/tight-dock-one-integration-qa.cjs`.
