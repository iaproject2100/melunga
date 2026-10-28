# Quatre barres mobiles plus compactes

L’utilisateur trouve la barre des quatre réglages trop grande sur la liste des thèmes et demande quatre maquettes, dont une translucide. Les propositions gardent le logo, les cartes et les polices du cours. Seuls la barre, ses icônes et ses espacements changent.

1. **Barre fine** : bande pleine largeur, fond uni et libellés visibles.
2. **Capsule translucide**, conseillée : verre bleuté léger et noms des quatre commandes conservés.
3. **Icônes seules** : la plus compacte ; les noms accessibles sont conservés, mais les légendes ne sont pas visibles.
4. **Boutons séparés** : petites icônes carrées arrondies, avec leurs noms, sans grand panneau de fond.

Les captures reprennent l’ambiance Océan et la liste des thèmes 06–09, comme dans la photo fournie. Le format 320 × 680 px utilise le véritable affichage mobile en une colonne du produit. Aucun style de carte ou de police du cours n’est remplacé pour recréer cette disposition.

## Voir les propositions

- [Comparatif en deux colonnes](comparaison-mobile.png)
- [Comparatif sur grand écran](comparaison-large.png)
- [1 — Barre fine](captures/mobile-compact-1.png)
- [2 — Capsule translucide](captures/mobile-compact-2.png)
- [3 — Icônes seules](captures/mobile-compact-3.png)
- [4 — Boutons séparés](captures/mobile-compact-4.png)
- [Galerie HTML locale](index.html)

Sur la liste des thèmes, la barre actuelle mesure 72 px. Les quatre propositions mesurent respectivement **55, 58, 48 et 56 px**, tout en conservant des cibles tactiles d’au moins 44 px. Les icônes passent de 30 à 24 px environ. Les légendes visibles restent à 11 px ; aucune réduction générale de police ni désactivation de l’agrandissement du texte n’est introduite.

## Réalisation et vérification

Les images viennent du vrai parcours au commit `6a22ff28c08f90edef5e178a23da8b37a9305f07`. `proposal.css` et `proposal.js` sont injectés uniquement pour les captures. Aucun fichier de l’application ne les charge et aucun fichier sous `melunga_deploy` n’est modifié.

**Vingt et un cas passent** : les quatre styles à 320 × 680, 390 × 780 et 430 × 780 ; les quatre styles pendant une leçon, avec les grandes actions À revoir et Suivant conservées ; quatre essais agrandissant les légendes à 18 px sans modifier les polices du cours ; puis les vrais dialogues et le changement d’ambiance. Les champs et la typographie du cours sont comparés avant et après l’injection. Les libellés restent entiers, le dock ne recouvre pas le contenu et la progression mobile reste d’une étape par clic.

Le contraste des légendes et du badge est contrôlé sur les pixels réellement composés dans les quatre captures Océan, avec un seuil de 4,5:1. La variante translucide conserve une vraie opacité alpha inférieure à 1. Le dock existant mesure automatiquement sa nouvelle hauteur et restitue l’espace gagné à la liste. Les grandes actions de la variante B restent disponibles pendant la leçon.

Le [rapport](verification.json) conserve les mesures, les contrôles et les empreintes des adaptateurs. La galerie est également contrôlée à 390, 1000 et 1920 px. Les services de compte et d’audio sont des fixtures locales ; aucun compte réel, paiement, POST ou TTS distant n’est sollicité.

Chromium local avec tailles et toucher simulés ; il ne s’agit pas d’un essai sur téléphone physique ou Safari. L’agrandissement à 18 px est une fixture explicite de lisibilité. Aucun réglage Android ou Samsung de l’utilisateur n’est modifié. Les captures n’ajoutent aucune barre de navigateur ou de système simulée.

Harnais locaux : `/tmp/mobile-compact-dock-proposals.cjs` et `/tmp/mobile-compact-gallery-capture.cjs`. Ces fichiers constituent des propositions avant choix, sans nouvelle publication du parcours.
