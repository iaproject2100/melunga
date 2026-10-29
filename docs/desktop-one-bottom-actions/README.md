# Variante de la maquette 1 : commandes sous la leçon

L’utilisateur préfère les thèmes à gauche de la proposition 1 et souhaite revoir les trois commandes sous la leçon, comme dans la présentation habituelle.

Cette variante garde la colonne de thèmes, l’ambiance rose, les photos et le logo originaux, ainsi que la phonétique translucide avec son oreille. « À revoir », « Écouter » et « Suivant » sont réunis sur une seule ligne sous la traduction. L’ensemble reste centré sur 1080 px ; la carte de leçon mesure 806 px de large et ne s’étend pas à l’espace libéré par la colonne de commandes.

- `maquette-1-commandes-en-bas.png` : aperçu en 1600 × 900.
- `maquette-1-1366.png` : aperçu sur un ordinateur en 1366 × 768.
- `maquette-1-commandes-en-bas.pdf` : aperçu sur une page à agrandir ou télécharger.
- `maquette-boutons-en-bas.html` : prototype autonome avec les images intégrées.

Reproduction :

```sh
python3 docs/desktop-one-bottom-actions/build.py
NODE_PATH=/tmp/melunga-review-tools/node_modules:/opt/codex/cua_node/lib/node_modules \
  node docs/desktop-one-bottom-actions/render.cjs
```

`verification.json` confirme les deux tailles, la position des thèmes à gauche, l’alignement des trois actions sous la traduction, la lisibilité du texte, l’oreille visible et l’absence de débordement. Le bouton « Suivant » fonctionne dans le prototype sans écrire de progression ni appeler un service. Vérifications Chromium local ; écrans émulés.

Cette proposition est un document de prévisualisation. Aucun fichier de `melunga_deploy` n’est modifié ; les cinq premières maquettes restent disponibles séparément.
