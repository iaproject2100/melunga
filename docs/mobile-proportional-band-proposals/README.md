# Une bande mobile à la bonne proportion

L’utilisateur demande quatre nouvelles maquettes où la bande du bas occupe une place comparable à celle de son exemple d’application mobile. Ces propositions réunissent toujours les quatre réglages et les deux actions de leçon. Les réglages gardent leurs icônes seules ; À revoir et Suivant conservent leurs libellés.

1. **Bande native** : une bande fine sur toute la largeur, la plus proche de l’exemple fourni.
2. **Capsule translucide** : une seule rangée flottante, dans l’esprit du verre déjà choisi.
3. **Deux groupes** : les réglages et les actions occupent deux petites capsules alignées.
4. **Suivant mis en avant** : l’action la plus fréquente dispose d’une case plus large.

Le premier style reprend surtout les proportions de l’exemple ; le deuxième conserve la préférence exprimée pour la transparence. Le quatrième met davantage l’accent sur le geste Suivant. Le choix reste ouvert entre ces présentations.

## Voir les maquettes

- [Galerie HTML locale](index.html)
- [Les quatre maquettes côte à côte](comparaison-mobile.png)
- [1 — Bande native](captures/mobile-band-1.png)
- [2 — Capsule translucide](captures/mobile-band-2.png)
- [3 — Deux groupes](captures/mobile-band-3.png)
- [4 — Suivant mis en avant](captures/mobile-band-4.png)

Les quatre captures individuelles utilisent un écran de 320 × 620 px. La galerie les affiche à leur largeur naturelle lorsqu’il y a assez de place, avec quatre colonnes sur grand écran, deux sur écran intermédiaire et une sur téléphone. Chaque image peut être ouverte ou téléchargée en grand.

Sur ces captures, les bandes mesurent respectivement **57, 58, 56 et 63 px**, soit **9,2 %, 9,4 %, 9,0 % et 10,2 %** de la hauteur disponible dans l’application. La capsule actuelle mesure 104 px, soit 16,8 % sur cette même vue. Les icônes gardent leurs supports de 32 px et les zones tactiles mesurent au moins 44 × 44 px. Les éléments système et le navigateur ne sont pas inclus dans ces proportions.

Les [28 cas navigateur](verification.json) passent : quatre présentations sur quatre tailles (320 × 568, 320 × 620, 390 × 780 et 430 × 780), quatre contrôles des commandes d’origine, quatre réserves de zone sûre de 24 px et quatre retours à la liste des thèmes. Les sources visibles, le non-chevauchement, les boutons, les dialogues et les libellés sont contrôlés sur le vrai parcours. La galerie est également vérifiée à 390, 1000 et 1920 px de large.

## Périmètre

La référence produit est le commit `7ede0dc23d07cf97d18e32d686de6bec3be369ac`. Les quatre maquettes reprennent la même véritable leçon : français vers espagnol, niveau 1, thème 08 Décrire et comparer, première carte `catalogue:es:302`, « Es muy ligero. », avec sa phonétique et son sens d’origine. L’ambiance rose est Fleur de prunier (`legacy-plum`).

Le logo, la photo du thème, les champs de la leçon et leurs polices restent ceux du parcours. Seule la présentation de la bande inférieure varie. L’objectif est de réduire sa hauteur tout en conservant des zones tactiles d’au moins 44 px et des libellés lisibles pour les deux actions. Les hauteurs et contrôles effectivement mesurés sont consignés dans le [rapport de vérification](verification.json).

Il s’agit de propositions de présentation avant choix. Les adaptateurs et les images de ce dossier ne sont pas chargés par l’application publiée ; aucun fichier produit n’est modifié par la galerie. Les styles, les images et les liens utilisent des ressources locales, sans police ni service externe.

Les maquettes ne simulent aucune barre de navigateur ni aucun élément du système du téléphone. Les contrôles éventuels en navigateur local ne constituent pas des essais sur appareil physique, Safari ou avec une main réelle. Ce dossier n’est pas une preuve de publication du parcours sur melunga.com.
