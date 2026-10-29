# Cinq maquettes de leçon sur ordinateur

Propositions visuelles à comparer avant le choix de l’utilisateur. Cette branche ajoute uniquement des documents et des aperçus ; aucun fichier de `melunga_deploy` n’a été modifié. Le site conserve sa présentation actuelle.

Les cinq propositions utilisent la même ambiance rose actuelle, le logo original, les photos des thèmes et leurs intitulés réellement présents dans le cours français–espagnol L1. La phrase, la phonétique et la traduction restent lisibles ; la bande de phonétique est translucide et conserve son oreille.

1. **Thèmes à gauche, commandes à droite** : parcours visible, leçon compacte au centre, « Écouter » juste au-dessus de « Suivant ». Proposition recommandée.
2. **Bibliothèque à droite** : grandes vignettes latérales, trois actions sous la leçon.
3. **Ruban de thèmes en bas** : quatre thèmes photographiques sous une leçon compacte ; commandes à droite.
4. **Navigation en colonne** : rubriques à gauche, commandes attachées au bord de la carte.
5. **Thèmes en mosaïque** : six grandes vignettes sur le côté, actions sous la leçon.

## Fichiers à ouvrir

- `comparaison-5-maquettes.png` : planche comparative.
- `5-maquettes-ordinateur.pdf` : cinq pages, une maquette par page.
- Les cinq fichiers `1-*.png` à `5-*.png` : captures individuelles en 1600 × 900.
- `comparaison.html` : comparaison locale avec liens vers les images et les prototypes.
- `maquettes.html?v=1` à `?v=5` : prototype autonome avec les images intégrées. « Suivant » parcourt trois phrases réellement issues du catalogue ; aucun appel audio, compte, ni enregistrement de progression. Les autres actions donnent seulement un aperçu visuel.

## Reproduction et vérifications

```sh
python3 docs/desktop-five-lesson-layouts/build.py
NODE_PATH=/tmp/melunga-review-tools/node_modules:/opt/codex/cua_node/lib/node_modules \
  node docs/desktop-five-lesson-layouts/render.cjs
python3 docs/desktop-five-lesson-layouts/export_pdf.py
```

`verification.json` contient **10 cas réussis** : cinq propositions à 1600 × 900 et à 1366 × 768. Tous les boutons et les liens légaux sont visibles, sans débordement horizontal ou vertical. Phrase ≥ 40 px, phonétique ≥ 29 px et traduction ≥ 28 px. Le bouton « Suivant » fonctionne dans le prototype sans écriture dans le stockage local ni requête vers un service.

Une relecture indépendante a confirmé les cinq dispositions distinctes, les photos sans étirement et les contrastes des trois actions (minimum mesuré : 4,83:1). Les vignettes de la mosaïque recadrent les cellules 4:3 de la photo source, sans déformer les visages. Vérifications sous Chromium local avec tailles d’écran émulées ; aucune vérification sur matériel physique.

La conservation du produit a été vérifiée avec `git diff --exit-code HEAD -- melunga_deploy`.
