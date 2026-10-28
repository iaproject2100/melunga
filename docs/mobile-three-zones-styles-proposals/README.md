# Quatre finitions pour les deux actions

L’utilisateur conserve la présentation 3 du dernier comparatif : À revoir tout à gauche, les quatre réglages dans une capsule translucide au centre et Suivant tout à droite. Il demande quatre variantes de couleur et de relief pour les deux actions, sans changer cette disposition.

1. **Turquoise doux**, conseillée : À revoir en turquoise pâle, Suivant plus soutenu, avec un relief discret.
2. **Bleu en relief** : deux teintes bleues avec une ombre plus marquée.
3. **Verre et prune** : du verre clair et du prune, avec des surfaces translucides.
4. **Ivoire et ambre** : des couleurs chaudes et un relief de touches légèrement biseautées.

Les quatre propositions gardent les mêmes positions, tailles de boutons, icônes et libellés. Les quatre réglages centraux restent sans noms visibles. Le logo, la carte de leçon, la photo, la phonétique et le haut-parleur restent ceux de la présentation retenue.

## Voir les finitions

- [Galerie HTML locale](index.html)
- [Comparer les boutons en grand](comparaison-boutons.png)
- [Comparer les quatre maquettes complètes](comparaison-mobile.png)
- [Galerie des boutons en HTML](boutons.html)
- [1 — Turquoise doux](captures/mobile-action-style-1.png)
- [2 — Bleu en relief](captures/mobile-action-style-2.png)
- [3 — Verre et prune](captures/mobile-action-style-3.png)
- [4 — Ivoire et ambre](captures/mobile-action-style-4.png)

Les quatre captures individuelles mesurent 320 × 620 px. La galerie les affiche à leur largeur naturelle lorsqu’il y a assez de place, avec quatre colonnes sur grand écran, deux sur écran intermédiaire et une sur téléphone. Des liens permettent d’ouvrir ou de télécharger chaque image en grand.

Les vues rapprochées de la barre sont de véritables captures du navigateur à densité double : une zone de 320 × 72 px produit une image de 640 × 144 px. Elles montrent les couleurs et les ombres en grand, sans agrandir les boutons dans la maquette complète. Les quatre bandes conservent une hauteur de 56 px ; les deux actions mesurent chacune 54 × 56 px dans la vue de 320 px.

## Source et périmètre

La référence produit est le commit `7ede0dc23d07cf97d18e32d686de6bec3be369ac`. La disposition retenue provient du [comparatif des deux pouces](../mobile-two-thumbs-proposals/README.md), enregistré au commit `32208d4`. Les images utilisent la véritable carte `catalogue:es:302` du thème 08 Décrire et comparer, en français vers espagnol niveau 1 : « Es muy ligero. », sa phonétique et son sens d’origine. L’ambiance rose est Fleur de prunier (`legacy-plum`).

Il s’agit de maquettes avant choix. Les adaptateurs de ce dossier sont utilisés uniquement pour les captures locales ; aucun fichier de l’application publiée ne les charge. Aucun fichier produit n’est modifié. La galerie utilise seulement des styles, des images et des liens relatifs, sans police ni ressource externe.

## Vérification

Les **32 cas navigateur réussissent** : dispositions, dimensions, commandes d’origine, réserves d’espace et mesures de contraste pour les nouvelles couleurs. Le [rapport de vérification](verification.json) conserve le statut, les cas exécutés et les mesures détaillées.

Les dimensions de la barre, de la carte, du logo, des réglages centraux et des zones tactiles des deux actions sont comparées exactement à la disposition 3 retenue, dans quatre tailles de fenêtre. Le contraste des textes des deux actions est mesuré sur leur fond réellement composé ; son minimum est de 4,959:1. La galerie complète passe à 390, 1000 et 1920 px de large ; la vue rapprochée passe à 390 et 1000 px.

Les couleurs et ombres doivent varier sans modifier les rectangles des deux boutons, la capsule centrale ou les icônes de réglage. Les libellés À revoir et Suivant restent présents dans chaque variante. Le relief est visuel ; il ne doit pas déplacer les zones tactiles.

Les captures n’ajoutent aucun élément du système ni aucune barre de navigateur simulée. Un contrôle en navigateur local ne constitue pas un essai sur téléphone physique, Safari ou avec une main réelle, ni une preuve de publication sur melunga.com.
