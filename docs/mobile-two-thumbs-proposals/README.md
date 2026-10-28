# Une commande sous chaque pouce

L’utilisateur retient la capsule translucide et demande de placer À revoir tout à gauche et Suivant tout à droite, pour utiliser les deux pouces. Les quatre réglages restent au centre, avec leurs icônes seules. Les deux actions gardent leurs libellés visibles.

1. **Capsule équilibrée**, conseillée : elle conserve le style choisi, avec les actions aux deux extrémités.
2. **Touches surélevées** : deux touches plus hautes marquent les emplacements des pouces.
3. **Trois zones** : une touche pour chaque action et une petite capsule centrale pour les réglages.
4. **Esprit clavier** : une bande pleine largeur donne davantage de largeur aux deux actions.

La première est la plus proche de la capsule déjà choisie. La quatrième offre des extrémités plus larges. Toutes conservent le même ordre visuel : À revoir, Niveau, Langue, Couleur, Menu, Suivant. Les quatre noms des réglages ne sont pas affichés.

## Voir les propositions

- [Galerie HTML locale](index.html)
- [Comparer les quatre variantes côte à côte](comparaison-mobile.png)
- [1 — Capsule équilibrée](captures/mobile-thumbs-1.png)
- [2 — Touches surélevées](captures/mobile-thumbs-2.png)
- [3 — Trois zones](captures/mobile-thumbs-3.png)
- [4 — Esprit clavier](captures/mobile-thumbs-4.png)

Les captures individuelles mesurent 320 × 620 px. La galerie les affiche à leur largeur naturelle lorsqu’il y a assez de place, avec quatre colonnes sur grand écran, deux sur écran intermédiaire et une sur téléphone. Chaque image peut être ouverte ou téléchargée en grand.

## Source et périmètre

La référence produit est le commit `7ede0dc23d07cf97d18e32d686de6bec3be369ac`. Les quatre images reprennent la même véritable leçon : français vers espagnol, niveau 1, thème 08 Décrire et comparer, première carte `catalogue:es:302`, « Es muy ligero. », avec sa phonétique et son sens d’origine. L’ambiance rose est Fleur de prunier (`legacy-plum`). Le [comparatif précédent](../mobile-proportional-band-proposals/README.md) présentait les bandes dont cette demande prolonge la disposition.

Les vrais boutons et leurs commandes sont conservés. Le logo, la photo du thème, les champs de la leçon et leurs polices ne sont pas réduits. Seules la position et la présentation des éléments de la bande changent. Les adaptateurs de ce dossier ne sont pas chargés par l’application publiée ; aucun fichier produit n’est modifié pour ces maquettes.

## Vérification

La passe navigateur comprend **28 cas réussis**, aux largeurs de 320, 390 et 430 px, avec des vues mobiles courtes et longues, les commandes d’origine, les positions des deux actions, les réserves de sécurité et les thèmes. Le [rapport détaillé](verification.json) conserve le statut, les cas exécutés et les dimensions mesurées.

Sur les captures principales, les hauteurs mesurées des quatre bandes sont respectivement **58, 64, 56 et 65 px**. Les zones tactiles restent d’au moins 44 px ; les actions se trouvent aux deux extrémités sans couper leurs libellés. Ces mesures décrivent le rendu en navigateur local, sans prétendre valider le confort pour toutes les mains.

Il s’agit de propositions avant choix. Les contrôles locaux ne constituent pas des essais sur téléphone physique ou Safari, ni une preuve de publication sur melunga.com. Les captures n’ajoutent aucune barre de navigateur ni aucun élément du système du téléphone. La galerie utilise uniquement des styles, images et liens relatifs, sans police ou service externe.
