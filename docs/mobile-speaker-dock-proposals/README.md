# Écouter sans quitter les pouces

Quatre maquettes mobiles rapprochant la lecture audio des boutons À revoir et Suivant. **Propositions uniquement : aucun fichier du produit n’est modifié et la version en ligne reste inchangée.**

- [Ouvrir la galerie](index.html)
- [Comparer les quatre versions côte à côte](comparaison-mobile.png)
- [1 — Écoute à droite](captures/ecoute-pouces-1.png) : un haut-parleur rond au-dessus de Suivant.
- [2 — Deux pouces](captures/ecoute-pouces-2.png) : un haut-parleur au-dessus de chaque action. Les deux déclenchent la lecture de la même phrase étudiée.
- [3 — Comme le téléphone](captures/ecoute-pouces-3.png), conseillée : un seul haut-parleur central entre À revoir et Suivant, sous les quatre raccourcis. La disposition s’inspire des commandes d’appel, en conservant les actions turquoise de Melunga.
- [4 — Grande touche d’écoute](captures/ecoute-pouces-4.png) : une large touche translucide au-dessus de la barre, entièrement cliquable.

## Éléments communs

Les quatre propositions conservent les raccourcis Révisions, Voix, Couleur et Menu de la proposition 1 précédente. Niveau et langue sont désormais regroupés dans une même capsule translucide dans l’en-tête, avec deux commandes distinctes.

Le véritable cours français–espagnol reste identique : thème 08 « Décrire et comparer », phrase « Es muy ligero. », phonétique « és mouy li-RÉ-ro », traduction « c'est très léger », ambiance `legacy-plum`. Le logo, les textes et leur taille, la carte, la vignette et l’oreille restent présents. Les captures de 320 × 620 ne comportent pas de fausse interface de téléphone.

Base du produit : `46b34fcba27c94e82140953577804d0a4aaf6528`. Référence de l’aperçu précédent Révisions/Voix : `1dc2089`.

## Commandes et audio

La maquette déplace le bouton d’écoute d’origine `#mgListen`, en conservant son gestionnaire et la lecture audio existante. Dans la proposition 2, le second bouton transmet le clic à cette même commande : il ne lit pas une autre langue ou une autre traduction. Les états et libellés du bouton d’origine restent la référence, notamment lorsque l’écoute révèle une phrase masquée.

Les panneaux Révisions et Voix utilisent les commandes de navigation existantes. Les services TTS, les voix et leurs mécanismes de secours ne sont pas modifiés par ces maquettes.

## Vérification et consultation

Les **21 cas navigateur passent** : quatre propositions dans quatre tailles de fenêtre (320 × 568/620, 390 × 780 et 430 × 780), quatre groupes de commandes et un contrôle du second haut-parleur en situation réelle de phrase masquée. Les lectures simulées utilisent bien la commande serveur existante, la voix `es-ES-Chirp3-HD-Kore`, le débit serveur 1 et la vitesse de lecture 0,85. Dans la proposition 2, les deux boutons déclenchent la même phrase, et le second suit les états masqué, occupé, caché et désactivé du bouton d’origine.

Les [mesures et résultats détaillés](verification.json) vérifient les zones tactiles d’au moins 44 × 44 px, la capsule commune de niveau/langue, la visibilité des champs, les panneaux, les décisions À revoir et la progression. Les fichiers source du produit sont conservés. La galerie passe également à 390, 1000 et 1920 px de large.

Les réponses réseau et médias sont des fixtures locales ; aucun compte réel, paiement ou TTS distant n’est utilisé et aucun son réel n’est joué. Aucun essai sur téléphone physique, Safari iPhone ou application installée n’est revendiqué.

La galerie utilise uniquement des ressources locales et présente les images à leur largeur naturelle lorsque l’espace le permet. Chaque image possède un lien d’ouverture directe et un lien de téléchargement. Le comportement du téléchargement dépend du navigateur utilisé.

Un choix de présentation reste nécessaire avant toute intégration au produit.
