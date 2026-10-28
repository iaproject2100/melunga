# Photo du thème près du numéro sur mobile

Trois maquettes reprennent le vrai parcours mobile du commit `49b525cf78fd46b063edc0d332740ad8becf9701`, avec la même phrase et les mêmes commandes. Seul le repère photographique en haut de la carte varie. Le parcours publié et sa version ordinateur ne sont pas modifiés.

1. **Duo discret**, conseillé : photo 48 × 36 px et numéro séparés.
2. **Capsule translucide** : photo 44 × 33 px et numéro réunis dans une capsule.
3. **Photo mise en avant** : photo 64 × 48 px, numéro à côté et fine séparation sous l’en-tête.

Les trois versions gardent le numéro existant, sans répéter le titre du thème. Dans le code actuel, ce numéro vient de `themeNumber` ; ces maquettes n’introduisent aucune nouvelle numérotation de séquence.

## Voir les propositions

- [Vue comparative](comparaison-mobile.png)
- [Maquette 1](captures/mobile-option-1.png)
- [Maquette 2](captures/mobile-option-2.png)
- [Maquette 3](captures/mobile-option-3.png)
- [Galerie HTML locale](index.html)

Les captures mesurent 390 × 780 px. La galerie fonctionne aussi sur téléphone, avec ouverture et téléchargement des images en taille réelle.

## Fabrication et vérification

`proposal.js` et `proposal.css` sont des adaptateurs de présentation injectés uniquement dans les captures locales. Aucun fichier de l’application ne les charge. Le script copie la vraie miniature de la tuile sélectionnée par son `data-theme-id` et conserve son atlas, son identifiant visuel, ses paramètres de découpe et le ratio 4:3. L’image est décorative ; le libellé accessible du numéro et les boutons existants sont conservés.

La passe locale couvre les trois variantes à 320 × 700, 390 × 780 et 430 × 780 : **neuf cas réussis**. Elle vérifie le texte et la typographie des trois champs de la phrase, la bonne photo, les commandes visibles, l’absence de chevauchement et le maintien de la carte entière dans l’écran. Les sources produit restent stables. La galerie est également contrôlée à 390 et 1440 px de large.

Le [rapport](verification.json) conserve les mesures et la provenance de chaque capture. Les services de compte et d’audio sont des fixtures locales ; aucun compte réel, paiement ou TTS distant n’est utilisé. Il s’agit de Chromium avec dimensions mobiles simulées, sans test sur téléphone physique ou Safari. La capture ne montre aucune barre de navigateur ni de système simulée.

Harnais locaux : `/tmp/mobile-photo-proposals.cjs` et `/tmp/mobile-photo-gallery-capture.cjs`, avec Playwright Core et `/usr/bin/chromium`. Les trois photos d’en-tête viennent de l’illustration existante ; aucune image n’est retouchée.
