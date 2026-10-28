# Quatre présentations mobiles à portée de pouce

Ces maquettes répondent aux exemples de barre d’applications et d’onglets fournis par l’utilisateur. Elles déplacent les quatre commandes actuelles **Niveau, Langue, Couleur, Menu** au bas de l’écran, avec leurs libellés. Cette hypothèse a été annoncée pendant la préparation des propositions.

1. **Barre classique** : une barre sur toute la largeur, avec icônes et libellés.
2. **Dock translucide**, conseillé : une barre flottante arrondie, légèrement détachée des bords.
3. **Icônes d’application** : quatre carrés arrondis séparés, dans l’esprit d’un écran d’accueil.
4. **Grandes pastilles** : quatre cercles espacés, avec les libellés dessous.

La marque, la photo du thème près du numéro, la phrase, la phonétique avec son oreille et le haut-parleur restent visibles. Les boutons « À revoir » et « Continuer » restent juste au-dessus de la nouvelle barre. Aucun titre de thème supplémentaire n’est répété.

## Voir les propositions

- [Comparatif en deux colonnes](comparaison-mobile.png)
- [Comparatif sur grand écran](comparaison-large.png)
- [1 — Barre classique](captures/mobile-dock-1.png)
- [2 — Dock translucide](captures/mobile-dock-2.png)
- [3 — Icônes d’application](captures/mobile-dock-3.png)
- [4 — Grandes pastilles](captures/mobile-dock-4.png)
- [Galerie HTML locale](index.html)

Chaque image individuelle mesure 390 × 780 px. La galerie adapte ses colonnes à la largeur de l’écran et propose l’ouverture en grand et le téléchargement.

## Fabrication et validation

Les captures proviennent du véritable parcours local au commit `fd1598eff3264d6bfaf753c76e798686e3d75a11`. Les adaptateurs `proposal.js` et `proposal.css` sont injectés uniquement pour ces maquettes. Aucun fichier de l’application publiée ne les charge ; la demande reste une comparaison de présentations avant choix.

Les quatre boutons sont leurs vrais nœuds DOM, avec leurs identifiants et écouteurs d’origine. Leur déplacement évite de doubler les commandes en haut et en bas. La barre a une hauteur réservée dans la mise en page ; les variantes prennent en compte `env(safe-area-inset-bottom)`.

**Quatorze cas passent** : quatre styles à 320 × 700, 390 × 780 et 430 × 780, plus une carte chinoise avec Pinyin et une vraie carte longue de niveau 8 avec le dock translucide. Le contrôle vérifie les champs sources, le cadrage de la photo, les boutons d’origine présents en un seul exemplaire, des zones tactiles d’au moins 44 px, la position dans les 108 derniers pixels de l’écran et l’absence de recouvrement. Les commandes de leçon restent à moins de 30 px au-dessus de la barre. Les trois dialogues s’ouvrent avec leurs vrais boutons déplacés et le changement d’ambiance fonctionne.

La galerie est également vérifiée à 390, 1000 et 1920 px. Le [rapport](verification.json) conserve les mesures et les empreintes des adaptateurs. Les sources produit restent stables et aucun fichier sous `melunga_deploy` n’est modifié.

Chromium local avec dimensions mobiles et toucher simulés ; compte et audio utilisent des fixtures locales. Aucun compte réel, paiement, POST ou appel TTS distant n’est utilisé. Ce contrôle ne constitue pas un essai sur téléphone physique, Safari ou avec une main réelle. Les captures n’ajoutent aucune barre de système ou de navigateur simulée.

Harnais locaux : `/tmp/mobile-thumb-dock-proposals.cjs` et `/tmp/mobile-thumb-gallery-capture.cjs`. Les images de référence sont une inspiration de disposition ; aucun élément de leurs captures n’est retouché ou réutilisé dans les maquettes.
