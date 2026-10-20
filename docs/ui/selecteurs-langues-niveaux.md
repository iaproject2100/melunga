# Sélecteurs de langues et de niveaux — essai local

Branche `ui/language-level-selectors`, basée sur `feat/conversation-integration` au commit `d59b98d`. Travail indépendant des retouches pédagogiques en attente de relecture. Aucun envoi distant, fusion ou déploiement.

## Comportement préparé

- Le clic sur la langue dans la barre des leçons ou dans le menu ouvre un sélecteur autonome. Sur téléphone, il remplit l'écran ; sur ordinateur, il est centré. Surface et fond sont opaques : accueil, menu et leçon ne se voient plus derrière.
- Les langues défilent dans une seule liste. La langue du lecteur reste masquée comme dans le sélecteur d'origine ; le choix courant est marqué.
- Le clic sur le niveau visible de la barre ouvre la liste verticale L1–L10. Le même accès est disponible depuis le menu. Le niveau courant est marqué, les cadenas existants sont conservés et le bas de la liste reste accessible sur petit écran.
- Retour ou Échap ferme la liste et rend le focus au déclencheur. Entrée/Espace l'ouvrent ; les flèches, Début et Fin parcourent les choix. Les gestes tactiles dans la liste n'agissent pas sur les cartes ni sur leur notation.

## Intégration

`lesson-pickers.js` construit un dialogue hors du tiroir existant. Il réutilise les choix et libellés déjà produits par l'application. Le choix déclenche le bouton original, donc `setLang()` ou `setMode()` avec leurs vérifications habituelles. Aucun catalogue, niveau, prix ou droit d'accès n'est modifié.

Le branchement couvre `.desktop-progress-language` et `.desktop-progress-level` sur le site, et les indicateurs d'origine `#studyLang` / `#currentLevel` lorsque Capacitor désactive l'adaptation desktop. La palette reste à côté de la langue dans la barre mobile ; aucun changement de disposition de la leçon n'est ajouté.

`app.html` ajoute uniquement les liens vers `lesson-pickers.css` et `lesson-pickers.js`. Au prochain assemblage APK/AAB, ces deux fichiers doivent être inclus dans les ressources web. Le script APK du dépôt lit les fichiers suivis par Git : ne pas omettre les nouveaux fichiers.

## Vérifications

```sh
node --check melunga_deploy/lesson-pickers.js
NODE_PATH=/tmp/melunga-review-tools/node_modules node melunga_deploy/tests/lesson-pickers.test.cjs
NODE_PATH=/tmp/melunga-review-tools/node_modules node melunga_deploy/tests/conversation-ui.test.cjs
```

Les tests ciblés utilisent Chromium, des appels réseau simulés et un serveur local. Ils vérifient notamment le fond opaque, les dix niveaux, le défilement jusqu'à L10 sur 320×568, les commandes au clavier, le focus, les vrais glissements tactiles, l'invariance des cartes et archives pendant les gestes, la sélection Premium et le maintien du paywall gratuit. Formats contrôlés : 320×568, 390×844 et 1440×900, plus le branchement Capacitor simulé.

La suite conversation vérifie les sept couples actifs et les parcours existants. Les fichiers de contenu sont identiques à la base. Aucun nouvel APK n'est construit et aucun essai sur appareil réel n'est revendiqué : le contrôle Android devra être fait sur le prochain APK d'essai.
