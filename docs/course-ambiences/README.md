# Ambiance pastel par défaut et palettes restaurées

Le dégradé pêche, rose et lavande demandé est l’ambiance `dusk` déjà présente : ses couleurs ne sont pas redessinées. Les deux HTML le portent avant JavaScript ; l’index du bouton Couleur commence au même endroit.

Les trois ambiances modernes restent disponibles, avec les quatorze ambiances immersives réellement accessibles dans le classique, soit dix-sept choix. Les trois variantes classiques réservées au mode Cartes ne sont pas ajoutées. Les gradients classiques sont repris exactement dans leur ordre ; les surfaces, menus et options gardent un texte lisible. Le CSS principal, le catalogue classique, l’audio, les droits et les données de cours sont inchangés.

Un choix explicite est conservé dans `localStorage["melunga-course-ambience"]`. Une ancienne préférence de session valide reste reconnue. Sans préférence valide, le pastel s’affiche sans créer de favori. Un stockage indisponible ne bloque pas les couleurs.

Validation : cinq groupes navigateur, quinze tests d’intégration et douze protections des couches passent. Le navigateur vérifie le premier affichage des deux pages, le cycle complet des dix-sept ambiances, l’égalité des quatorze gradients avec le tableau `AMB` classique, la persistance, les préférences invalides et le stockage refusé. Les cartes restent identiques durant les changements de couleur. Chromium local avec réponses de compte/audio contrôlées ; aucun téléphone physique, Safari ou audio réel n’est prétendu.

Les propositions de disposition du menu sont des maquettes séparées dans `docs/navigation-proposals/` et ne changent pas la navigation du produit.

```sh
NODE_PATH=/tmp/melunga-review-tools/node_modules node --test melunga_deploy/tests/course-ambiences.browser.cjs
```
