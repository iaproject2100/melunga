# Vignette du thème dans l’en-tête ordinateur

Ce contrôle porte sur le vrai parcours. L’en-tête de la fiche reprend la photo de la tuile sélectionnée, à gauche du titre du thème, et le nom du niveau déjà traduit au-dessus. Les photos de la grille restent présentes. Le logo de 96 pixels, les pastilles à droite et les commandes groupées sont conservés.

La photo est un fragment d’un atlas local. La vérification compare le `src`, l’identifiant visuel et les quatre paramètres de découpe du clone avec ceux de la véritable tuile. Elle attend le décodage du clone visible, sans imposer le téléchargement d’une tuile source cachée et chargée à la demande.

## Périmètre ciblé

Trois groupes utilisent six profils de navigateur :

- Anglais vers espagnol L1 à 1366 × 768, français vers espagnol L8 à 1366 × 768, et français vers espagnol L1 à 1440 × 900. Photo correcte et décodée, titre du niveau, disposition complète et véritable phrase suivante en un clic ; la photo du thème reste identique.
- Un profil passe entre deux thèmes L8, change de niveau puis de langue et revient du mobile à l’ordinateur. Deux vignettes utilisent volontairement le même fichier d’atlas avec des découpes différentes : une ancienne découpe ne peut pas passer le contrôle en conservant seulement le bon `src`.
- Deux profils mobiles à 390 × 700 comparent le produit au véritable HTML/CSS/JavaScript de `7b17e56`. Les photos des thèmes, leurs découpes et dimensions, le logo, les pastilles, la carte et le footer restent identiques. Le bouton Continuer conserve sa progression par étapes d’origine.

Les champs visibles des cartes restent conformes aux données sources ; le texte entier et les boutons Écouter/Suivant doivent tenir dans l’écran. La nouvelle vignette et sa légende sont absentes du DOM mobile. Aucune carte n’est marquée « Je connais » par Suivant.

## Reproduction et limites

Le harnais autonome est `/tmp/melunga-desktop-theme-thumbnail.browser.cjs`. Il réutilise les fixtures du test existant `melunga_deploy/tests/desktop-course-layout.browser.cjs`, sans modifier celui-ci. Les données, dictionnaires, services vocaux, compte, prix et CSS mobile d’origine restent confrontés à la référence Git ; les empreintes du produit sont comparées avant et après la passe.

```sh
NODE_PATH=/tmp/melunga-review-tools/node_modules node --test /tmp/melunga-desktop-theme-thumbnail.browser.cjs
```

Toutes les réponses réseau sont des fixtures locales explicites. Aucun compte réel, paiement, POST ou serveur TTS n’est sollicité. Les images locales sont réellement chargées et décodées ; les événements audio sont simulés en mémoire. Le navigateur est Chromium local. Il ne s’agit pas d’un test sur téléphone physique ni sur Safari, et la voix n’est pas évaluée à l’oreille.

## Résultat final du 27 octobre 2026

**3 groupes et 6 profils réussissent.** Les empreintes du produit sont stables pendant la passe. Aucune erreur JavaScript, erreur de fixture ou requête inattendue n’est observée. Les 121 fichiers sources protégés sont identiques à la référence Git.

La première passe a détecté une erreur réelle quand aucune photo n’était sélectionnée : une valeur `false` était traitée comme un nœud DOM. Le produit a été corrigé pour utiliser `null`, puis cette passe complète a été relancée sur le nouveau gel. Le harnais vérifie aussi la visibilité effective des images et textes, en plus du décodage et des dimensions.

- [Français → espagnol L1, 1366 × 768](captures/desktop-fr-es-L1-1366.png)
- [Français → espagnol L8, 1366 × 768](captures/desktop-fr-es-L8-1366.png)
- [Français → espagnol L1, 1440 × 900](captures/desktop-fr-es-L1-1440.png)
- [Mobile conservé, français → espagnol L1, 390 × 700](captures/mobile-fr-es-L1-390.png)

Le [résumé](qa-summary.json) donne les assertions, les limites et l’empreinte du harnais. Le [rapport complet](verification-browser.json) conserve les six profils, la provenance des vignettes, leur géométrie et les empreintes du produit. Les originaux restent dans `/tmp/melunga-desktop-theme-thumbnail-browser/` et `/tmp/melunga-desktop-theme-thumbnail-browser.json`.

Cette vérification n’inclut aucune publication.
