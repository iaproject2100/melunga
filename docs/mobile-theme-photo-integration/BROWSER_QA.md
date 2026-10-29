# Vérification de la photo du thème sur mobile

**Résultat : cinq groupes et douze cas réussis**, sur les fichiers produit stables. Les captures utilisent le vrai parcours, sans charger l’adaptateur des maquettes.

La référence comparée est le commit `49b525cf78fd46b063edc0d332740ad8becf9701`, qui contient la présentation ordinateur 3 et sa phonétique translucide. Le [rapport navigateur](browser-report.json) conserve les champs sources, les mesures, les paramètres de découpe et les empreintes des entrées.

## Contrôles

| Groupe | Résultat |
| --- | --- |
| Sources conservées | 164 fichiers produit, données et services sont comparés intégralement à la référence. Seuls les deux fichiers de présentation responsive et leurs deux entrées HTML sont exclus de cette égalité attendue. |
| Mobile et progression | FR–ES L1 à 320 × 700, 390 × 780 et 430 × 780 ; FR–ZH L1 avec Pinyin à 390 × 700 ; vraie carte longue FR–ES L8 à 390 × 700. Les textes, polices, géométries et visibilités des champs et commandes d’origine correspondent à la référence. Continuer garde sa progression mobile par étapes. |
| Photo et numéro | Une seule photo 48 × 36 px, décorative, placée avant le numéro d’origine. Le numéro seul et son libellé accessible sont conservés. Le fichier d’atlas, l’identifiant visuel et les quatre variables de découpe correspondent exactement à la vraie tuile sélectionnée. |
| Navigation | Passage entre deux thèmes utilisant le même atlas avec des découpes différentes ; changements de niveau et de langue ; disparition de la photo de leçon au retour à la grille. La vignette suit le thème sélectionné. |
| Ordinateur et redimensionnement | Captures géométriques, textes et styles identiques à la référence à 1366 × 768 et 1920 × 1080. La vignette mobile disparaît sur ordinateur. Plusieurs allers-retours de taille conservent la fiche, une seule instance de chaque commande et une seule bonne photo sur mobile. |
| Lisibilité et commandes | La carte entière et ses trois champs restent dans l’écran. La photo, le numéro, l’icône d’étape et l’aide ne se chevauchent pas. Oreille, haut-parleur, aide, À revoir et Continuer restent visibles et mesurent au moins 44 px comme cibles tactiles. |
| Secours et masquage | Une erreur d’image retire l’image défectueuse et laisse apparaître le SVG existant. L’absence de photo source retire la vignette sans emplacement vide. Le vrai rappel atteint par les commandes mobiles garde la phonétique masquée, y compris après passage sur ordinateur puis retour sur mobile. Les attributs `hidden` d’un état d’attente restent conservés. |

Les simulations d’image cassée, de source absente et d’attente agissent uniquement sur le DOM d’une fixture de présentation. Le contrôle d’attente ne prétend pas jouer un pas de contenu de ce type : aucune nouvelle séquence n’est créée pour ce test.

## Captures

- [Mobile intégré, 390 × 780](captures/mobile-option-1-integrated.png)
- [Mobile avec Pinyin](captures/mobile-pinyin-integrated.png)
- [Carte longue réelle, niveau 8](captures/mobile-long-theme-integrated.png)
- [Retour de l’ordinateur vers un mobile étroit](captures/responsive-return-mobile.png)
- [Rappel avec phonétique masquée](captures/recall-mask-mobile.png)

Les [empreintes des captures](capture-sha256.json) couvrent les cinq PNG conservés.

## Méthode et limites

Exécution avec Playwright Core et Chromium local, à partir du harnais `/tmp/mobile-photo-integration-qa.cjs`. Les réponses réseau sont interceptées : statut d’accès, catalogue des voix et lecteur audio sont des fixtures locales. Aucun compte réel, paiement, POST ou TTS distant n’est utilisé. Il n’y a aucune erreur JavaScript, requête inattendue ou erreur de fixture.

Les comparaisons chargent le véritable HTML, CSS et JavaScript de la référence Git ; elles ne reconstituent pas une ancienne interface à la main. Les champs restent confrontés aux véritables documents de cours du dépôt. La passe émule des dimensions mobiles dans Chromium ; elle ne constitue ni un test sur téléphone physique ou Safari, ni une preuve de publication sur melunga.com.
