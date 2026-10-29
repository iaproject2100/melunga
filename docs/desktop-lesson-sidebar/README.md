# Leçon ordinateur avec les thèmes à gauche

Cette vérification accompagne la présentation approuvée : une liste de thèmes à gauche d’une carte de leçon compacte, et les commandes habituelles « À revoir », « Écouter » et « Continuer » sous le texte. La phonétique reste contrastée, translucide et accompagnée de l’oreille.

La barre latérale utilise **la grille et les boutons d’origine**, leurs photos, leur ordre et leurs gestionnaires d’ouverture. Elle permet de défiler jusqu’aux autres thèmes ; le thème courant est repéré. Le bouton « Tous les thèmes » réutilise la navigation d’origine puis remet le focus sur la vignette du thème choisi. Les thèmes payants gardent leur accès au compte existant.

La grille principale à quatre cartes et la version mobile gardent leur présentation précédente. Le compteur, la progression, le contenu et les actions sont déplacés avec leurs nœuds d’origine puis restaurés aux changements de présentation.

## Vérification reproductible

```sh
DESKTOP_LESSON_SIDEBAR_REPORT_DIR=docs/desktop-lesson-sidebar \
NODE_PATH=/tmp/melunga-review-tools/node_modules:/opt/codex/cua_node/lib/node_modules \
  node melunga_deploy/tests/desktop-lesson-sidebar.browser.cjs
```

Le test utilise les véritables pages, styles, scripts et contenus locaux. Seuls le statut d’accès, le catalogue de voix et le lecteur audio sont des simulations explicites ; aucun compte réel, aucun fournisseur audio ni aucun paiement ne sont utilisés. Le compte requis par un thème verrouillé est intercepté après vérification de son URL réelle.

Les dix groupes couvrent :

- Cinq configurations de lecture : 1600 × 900, 1366 × 768, 1218 × 548, 1101 × 480, français–espagnol et coréen–français. Les captures roses proviennent du bouton d’ambiance d’origine.
- L’identité des vrais boutons, la sélection d’un thème au clavier, la photo et le titre courants, le défilement jusqu’au dernier thème, le retour à la bonne page et son focus.
- L’écoute chinoise avec la voix approuvée, la validation « Continuer », le rappel « À revoir » et leur persistance.
- Une longue carte espagnole de niveau 8 et le Pinyin chinois, avec les actions accessibles et le retour en haut à la phrase suivante.
- Les passages tablette/mobile/ordinateur sans perte de phrase, d’étape ou de nœud. Les marques et limitations de la grille ordinateur sont retirées sur mobile.
- Les changements réels de niveau et de langue depuis les sélecteurs.
- La fin du thème et le retour à la grille avec les actions de fin d’origine.
- Un échec d’enregistrement suivi d’un redimensionnement et d’une nouvelle tentative, avec les commandes toujours accessibles.
- Deux comparaisons mobile et deux comparaisons de la grille de thèmes **pixel pour pixel** avec le commit publié `0feb7bc67c6374f1466ccd74febc1a0bbcad0584`.
- Le thème verrouillé qui ouvre le compte d’origine sans modifier une décision d’apprentissage.

Les comparaisons géométriques gardent les styles, positions et textes des éléments de contenu. Pour les deux conteneurs principaux, leur texte **visible** est comparé afin que les libellés de la nouvelle barre latérale cachée ne soient pas assimilés à un changement visuel de la grille de thèmes. Les captures complètes restent comparées octet pour octet.

Le rapport `acceptance.json` enregistre les résultats et les empreintes des entrées. Ces vérifications utilisent Chromium local avec des tailles et gestes tactiles émulés ; elles ne constituent pas un essai sur matériel physique ni sous Safari.

## Résultat final

Les **10 groupes et 18 cas passent**, avec **169 empreintes d’entrée stables**, aucune erreur navigateur ni requête inattendue. Deux vues mobiles et deux grilles de thèmes sont strictement identiques aux captures du commit publié de référence. Les captures `lesson-fr-es-1600-rose.png` et `lesson-fr-es-1366-rose.png` montrent la présentation réelle dans l’ambiance rose choisie via le bouton d’origine.
