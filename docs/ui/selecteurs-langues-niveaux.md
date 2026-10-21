# Sélecteurs de langues et de niveaux

Le premier essai utilisait un écran opaque. À la demande de Kartech, la retouche du 21 octobre 2026, basée sur `main` au commit `e9ab12d`, le remplace par un menu compact assorti à la leçon. Les retouches pédagogiques et le chantier `feat/conversation-integration` ne sont pas inclus.

## Comportement préparé

- Le clic sur la langue dans la barre des leçons ou dans le menu ouvre un menu d'au plus 320 px, avec 16 px de marge au bord de l'écran. Il se place près du contrôle utilisé et garde une hauteur limitée. La liste défile à l'intérieur ; la leçon reste visible autour sous un voile léger.
- Le menu utilise le fond, la carte, le texte et l'accent de l'ambiance choisie. Sa surface est opaque et teintée ; elle n'impose plus le blanc. La sélection combine la couleur d'accent et une coche.
- Les langues défilent dans une seule liste. La langue du lecteur reste masquée comme dans le sélecteur d'origine ; le choix courant est marqué.
- Le clic sur le niveau visible de la barre ouvre la liste verticale L1–L10. Le même accès est disponible depuis le menu. Le niveau courant est marqué, les cadenas existants sont conservés et le bas de la liste reste accessible sur petit écran.
- La croix, Échap ou un clic à l'extérieur ferme la liste. Le focus revient à un contrôle visible de la leçon, y compris si le tiroir d'origine vient de se fermer. Entrée/Espace ouvrent le menu ; les flèches, Début et Fin parcourent les choix. Les gestes tactiles dans la liste et le clic à l'extérieur n'agissent pas sur les cartes ni sur leur notation.

## Intégration

`lesson-pickers.js` construit un dialogue hors du tiroir existant. Il réutilise les choix et libellés déjà produits par l'application. Le choix déclenche le bouton original, donc `setLang()` ou `setMode()` avec leurs vérifications habituelles. Aucun catalogue, niveau, prix ou droit d'accès n'est modifié.

Le branchement couvre `.desktop-progress-language` et `.desktop-progress-level` sur le site, et les indicateurs d'origine `#studyLang` / `#currentLevel` lorsque Capacitor désactive l'adaptation desktop. La palette reste à côté de la langue dans la barre mobile ; aucun changement de disposition de la leçon n'est ajouté.

`app.html` ajoute uniquement les liens vers `lesson-pickers.css` et `lesson-pickers.js`. Au prochain assemblage APK/AAB, ces deux fichiers doivent être inclus dans les ressources web. Le script APK du dépôt lit les fichiers suivis par Git : ne pas omettre les nouveaux fichiers.

## Vérifications

```sh
node --check melunga_deploy/lesson-pickers.js
NODE_PATH=/tmp/melunga-review-tools/node_modules node melunga_deploy/tests/lesson-pickers.test.cjs
```

Les tests ciblés utilisent Chromium, des appels réseau simulés et un serveur local. Ils vérifient notamment les dimensions compactes, l'exposition de la leçon sur le web, les couleurs réellement choisies (clair, sombre et rose), un contraste du texte d'au moins 4,5:1, les dix niveaux, le défilement jusqu'à L10 sur 320×568, les commandes au clavier, le focus, les vrais glissements tactiles, l'invariance des cartes et archives pendant les gestes ou la fermeture extérieure, la sélection Premium et le maintien du paywall gratuit. Formats contrôlés : 320×568, 390×844, 1024×768 et 1440×900, plus le branchement Capacitor simulé.

Sur la branche d'essai `ui/language-level-selectors`, la suite conversation a également vérifié les sept couples actifs et leurs parcours. Cette suite et les fonctionnalités de conversation ne sont pas introduites dans `main` par ce lot. Les fichiers de contenu sont identiques à la base de production.

Le test Capacitor utilise la feuille CSS de l'APK si elle est disponible dans le checkout ; sur `main`, il reproduit la contrainte pertinente du parent natif (`pointer-events:none`) et contrôle les vrais clics sur ses enfants. Aucun nouvel APK n'est construit et aucun essai sur appareil réel n'est revendiqué : le contrôle Android devra être fait sur le prochain APK d'essai.
