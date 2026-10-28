# Proposition 3 — Commandes de téléphone translucides

Maquette demandée pour comparaison, distincte de l’intégration de la proposition 4. **Aucun fichier du produit n’est modifié par ce dossier.**

- [Vue complète — 320 × 620](telephone-translucide.png)
- [Commandes vues de près — 640 × 256](boutons-translucides.png), capture réelle avec une densité de deux pixels par point.

La disposition 3 est conservée : raccourcis Révisions, Voix, Couleur et Menu dans la capsule centrale ; À revoir à gauche, écoute au centre et Suivant à droite. Les trois commandes deviennent translucides, avec une écoute en verre clair, À revoir en verre menthe et Suivant en verre turquoise foncé. Niveau et langue restent réunis dans leur capsule translucide en haut, avec deux commandes tactiles distinctes.

La même véritable scène du cours français–espagnol est utilisée : thème 08 « Décrire et comparer », « Es muy ligero. », phonétique « és mouy li-RÉ-ro », traduction « c'est très léger », ambiance `legacy-plum`. Le logo, les textes et leur taille sont conservés. Les captures proviennent du navigateur ; elles ne comportent ni retouche d’image ni fausse interface de téléphone.

## Sources et fonctionnement

Les ressources HTML/CSS/JS de l’application sont servies depuis le commit figé `46b34fcba27c94e82140953577804d0a4aaf6528`, indépendamment des modifications de production réalisées en parallèle. Le prototype reprend la proposition 3 du commit de prévisualisation `f5d1569`, avec uniquement la finition translucide demandée.

Le véritable bouton `#mgListen` est déplacé en conservant son gestionnaire. Les raccourcis Révisions et Voix ouvrent les panneaux existants. Aucune modification des voix, du serveur TTS ou des mécanismes de secours audio n’est effectuée. Les captures utilisent des réponses locales explicites et ne lancent aucun appel audio réel.

## Vérification

Les six cas de vérification ont réussi dans Chromium : présentation, absence de chevauchement, texte visible, cibles tactiles d’au moins 44 × 44, conservation des commandes d’origine, ouverture des panneaux et capture rapprochée. Les dimensions vérifiées sont 320 × 620, 320 × 568, 390 × 780 et 430 × 780. La bande mesure 110 px de haut.

Les contrastes mesurés sur les fonds réellement composés atteignent au minimum 5,23:1 pour les textes contrôlés et 6,06:1 pour les icônes contrôlées. Le détail figure dans [verification.json](verification.json).

Aucun essai sur appareil physique ou Safari n’est revendiqué. Cette proposition reste une maquette jusqu’au choix de l’utilisateur.
