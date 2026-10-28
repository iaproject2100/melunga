# Quatre barres mobiles avec moins d’espace intérieur

L’utilisateur trouve encore trop d’espace dans la barre réunissant les quatre icônes et les actions À revoir / Suivant. Les quatre maquettes rapprochent ces commandes sans réintroduire les libellés Niveau, Langue, Couleur ou Menu.

1. **Capsule resserrée**, conseillée : la disposition choisie reste sur deux rangées, avec moins de marge entre elles et autour.
2. **Barre pleine largeur** : une présentation plus plate, avec deux rangées rapprochées et un fond sur toute la largeur.
3. **Une seule rangée** : les six commandes sont alignées. Les actions gardent leurs noms mais sont plus étroites ; leur place est légèrement plus large que celle des quatre réglages.
4. **Actions à droite** : les quatre réglages en grille à gauche, les deux actions empilées à droite.

## Voir les propositions

- [Comparatif en deux colonnes](comparaison-mobile.png)
- [Comparatif sur grand écran](comparaison-large.png)
- [1 — Capsule resserrée](captures/mobile-tight-1.png)
- [2 — Barre pleine largeur](captures/mobile-tight-2.png)
- [3 — Une seule rangée](captures/mobile-tight-3.png)
- [4 — Actions à droite](captures/mobile-tight-4.png)
- [Galerie HTML locale](index.html)

Les images utilisent le vrai parcours en 320 × 620 px, l’ambiance **Fleur de prunier** et la première carte du thème 08, **Décrire et comparer** : « Es muy ligero. », « és mouy li-RÉ-ro », « c’est très léger ». Le numéro, la photo, la phrase, les polices, le logo, l’oreille et le haut-parleur restent ceux du produit.

## Espace gagné

La barre actuelle mesure 120 px dans la leçon. Les quatre propositions mesurent respectivement **104, 97, 56 et 100 px** à 320 px de large. Dans la première, l’espace visible entre la fin des icônes et le début des actions passe de **24 à 12 px** ; dans la seconde, il passe à 10 px.

Une marge de 8 px héritée du footer s’ajoute actuellement à l’espace entre les rangées. Les maquettes la retirent avec un sélecteur ciblé sur le footer ; les autres dimensions varient selon la disposition. Les zones tactiles restent d’au moins 44 px. La première garde les deux grandes actions de 48 px ; la troisième privilégie la faible hauteur.

## Réalisation et vérification

Les adaptateurs `proposal.css` et `proposal.js` sont injectés uniquement dans les captures du produit au commit `f01a73138aad17be0cb6e712752afe6cb664dfaa`. Aucun fichier sous `melunga_deploy` n’est modifié. Le dock existant recalcule sa hauteur et l’espace réservé ; il ne couvre ni le modèle ni les commandes.

**Treize cas passent** : quatre dispositions à 320 × 620, 390 × 780 et 430 × 780, puis les vrais dialogues et le changement d’ambiance. Les six boutons sont conservés en un seul exemplaire ; leurs cibles ne se chevauchent pas. Les libellés À revoir et Suivant restent entiers ; ils restent sur une ligne dans la troisième proposition. Les textes et tailles de police du modèle correspondent à la référence. Le vrai bouton Suivant avance toujours d’une étape, sans sauter la phrase ni la classer comme connue, et À revoir enregistre la carte source.

La carte `catalogue:es:302` est atteinte en cliquant le véritable thème `decrire`, sans fabriquer de phrase ni forcer d’étape. Les images reprennent son cadrage local d’origine. Le [rapport](verification.json) conserve les mesures et les contrôles. La galerie est également vérifiée à 390, 1000 et 1920 px.

Chromium local avec dimensions et toucher simulés. Les services de compte et d’audio sont des fixtures locales : aucun compte réel, paiement, POST ou serveur TTS distant n’est sollicité. Aucun navigateur ou système téléphonique n’est dessiné artificiellement dans les images. Il ne s’agit pas d’un essai sur téléphone physique ou Safari.

Harnais locaux : `/tmp/mobile-tight-dock-proposals.cjs` et `/tmp/mobile-tight-gallery-capture.cjs`. Ces propositions restent à choisir ; elles ne publient aucune nouvelle disposition du parcours.
