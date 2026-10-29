# Barre mobile turquoise, disposition à deux pouces

L’utilisateur retient la disposition 3 et la finition 1 « Turquoise doux ». « À revoir » se trouve à gauche dans une touche turquoise pâle, « Suivant » à droite dans une touche turquoise soutenue. Les quatre réglages restent dans une capsule translucide centrale, sans intitulés visibles.

La barre de leçon passe de 104 à 56 px. Les deux actions mesurent 54 × 56 px sur la capture de 320 px ; les icônes centrales gardent leurs supports de 32 px et toutes les commandes conservent des cibles d’au moins 44 px. La disposition et les dimensions correspondent exactement à l’aperçu retenu en 320 × 568/620, 390 × 780 et 430 × 780.

Un repli étroit permet aux six commandes de tenir en 280 et 300 px. Les légendes originales de fin de séquence peuvent prendre davantage de hauteur selon leur longueur. La réserve automatique du parcours suit cette hauteur et évite de couvrir la leçon. Le bureau et la photo du thème sont conservés.

## Voir et vérifier

- [Rendu mobile intégré, carte 08 et ambiance rose](captures/turquoise-dock-approved-pink.png)
- [Vérification navigateur](BROWSER_QA.md)
- [Rapport détaillé](browser-report.json)
- [Conservation des sources et résultats des tests](source-verification.json)

Les **10 groupes et 50 cas navigateur** passent : rendu retenu, petits écrans, sept langues natives, commandes originales, textes longs et pinyin, chargement et fin de séquence, états masqués, restauration au bureau et réserves du bas de l’écran. Les 17 ambiances passent en état normal et au survol. Le contraste minimum des textes des deux actions est de 4,959:1. Les 42 présentations de légendes finales traduites sont explicitement des fixtures de texte ; les commandes réelles de fin de séquence sont également testées.

Les **12 tests de couches**, les **15 tests d’intégration** et les validations des ressources d’entrée passent. Seuls le CSS responsive et les deux entrées HTML changent parmi les fichiers produit. Les 21 autres empreintes de la couche restent identiques ; tout le JavaScript, les données, les services, les voix, les accès et la progression sont conservés. Les assertions des contrôles sources restent identiques ; leurs trois empreintes concernées et le patch exact sont actualisés. Le cache CSS passe en version 9, le JavaScript reste en version 5.

Les vérifications utilisent Chromium local avec émulation des dimensions et du toucher et des réponses réseau et audio simulées. Aucun essai sur téléphone physique ou Safari, compte réel, paiement ou TTS distant n’est revendiqué. Ces contrôles ne prouvent pas une publication sur melunga.com.
