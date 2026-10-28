# Les six langues sur un seul écran mobile

La page de choix utilise maintenant deux colonnes et trois rangées de vignettes translucides, sur le fond pastel déjà utilisé sur ordinateur. Le logo et le nom Melunga restent en tête. Les mentions identiques de public natif sont visuellement retirées ; chaque vignette conserve son drapeau et le nom traduit de la langue.

Les six choix sont visibles sans défilement aux tailles mobiles normales contrôlées, pour chacune des sept langues natives. Le choix de la langue native reste exclu. Sur un écran très bas, l’introduction est raccourcie ; en paysage large, la grille utilise trois colonnes. Le texte fortement agrandi garde la possibilité de défiler pour ne pas rendre une langue inaccessible.

- [Vue mobile](langues-mobile.png)
- [Petit écran 320 × 568](langues-mobile-320.png)

Les 25 cas Chromium ont réussi : sept langues natives sur trois tailles, deux fenêtres compactes, ouverture directe de la première fiche et accès à la dernière langue avec texte agrandi. Les API sont des réponses locales explicites ; aucun appareil physique, Safari, compte, paiement ou audio réel n’est utilisé.

Les 12 tests source, 15 tests d’intégration et trois contrôles d’entrée ont réussi. Seul le CSS de cette page dans `index.html` et son pin sont modifiés ; les fonctions de navigation, de lecture audio et d’accès restent identiques.
