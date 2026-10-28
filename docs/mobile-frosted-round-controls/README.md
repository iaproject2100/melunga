# Boutons mobiles ronds — verre givré, couleurs conservées

La finition 2 du comparatif `a93b426193b88883392e7566ba74fa882f6f1cbf` est intégrée au parcours mobile. Les supports fonctionnels sont des cercles individuels, avec un fond blanc à 46 % et un flou de 25 px. Les repères colorés restent présents : badge de niveau avec sa couleur actuelle et son texte blanc, drapeau, roue chromatique, « À revoir » turquoise clair et « Suivant » turquoise foncé. Ces deux actions conservent leur couleur de fond pleine.

Les icônes usuelles sont foncées pour garder un contraste suffisant sur le verre dans les ambiances sombres. Les textes visuellement masqués restent accessibles aux lecteurs d’écran, notamment le nom de la commande de continuation. Les cibles mesurent au moins 44 × 44 px, avec écoute de 52 px et actions latérales de 46 px. Les boutons d’origine et leurs gestionnaires sont conservés. La feuille est versionnée `course-desktop.css?v=11` dans les deux pages qui l’utilisent.

- [Thèmes sur téléphone](themes-verre-givre.png)
- [Leçon sur téléphone](lecon-verre-givre.png)

La modification produit comprend uniquement la feuille responsive et ses deux références HTML. Aucun changement des voix, des données, des droits, de l’authentification ou de la progression. Les inventaires source restent fixés à 13 fichiers modifiés et 11 fichiers ajoutés ; seuls trois de leurs 24 fichiers ont une nouvelle empreinte, les 21 autres sont inchangés.

## Vérification

Les onze groupes du contrôle navigateur ont réussi : six tailles de 280 à 760 px, dialogues de niveau et de langue, commandes audio et navigation d’origine, 17 ambiances, révisions et voix, pinyin, états masqués, retour ordinateur puis mobile. Les 51 points de contraste des icônes ordinaires atteignent au moins 3,17:1. Les captures ordinateur à 1366 et 1920 px sont identiques, octet par octet, à celles de la version précédente `69674c0508d04c0332a4cf1969a1467165a45544`.

Le test permanent de démarrage a également réussi ses douze cas sur les sources finales : première fiche directement après le choix de langue, scripts retardés, erreurs et reprise, avec aucune image de l’ancienne disposition visible. Le rapport `startup-browser-report.json` contient les 215 empreintes finales, stables pendant ce contrôle.

Les contrôles source (12), l’intégration audio des deux applications (15) et les validations des ressources d’entrée ont réussi. Les journaux et rapports sont joints. Les scénarios navigateur utilisent Chromium, des tailles et interactions tactiles émulées, et des réponses API locales explicites. Aucun appareil physique, Safari, son réel, compte ou paiement n’a été utilisé.

Relancer le contrôle de présentation depuis la racine du dépôt avec Playwright Core et pngjs disponibles :

```sh
NODE_PATH=/tmp/melunga-review-tools/node_modules:/opt/codex/cua_node/lib/node_modules node docs/mobile-frosted-round-controls/browser-check.cjs
```

Le contrôle permanent de démarrage se trouve dans `melunga_deploy/tests/course-startup-presentation.browser.cjs`.
