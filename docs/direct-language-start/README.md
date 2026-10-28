# Choisir une langue ouvre directement la première leçon

Préparation de l’aperçu demandé : le bouton « Démarrer ma première leçon » est retiré de l’étape de choix de langue. Un clic ou une activation clavier sur une langue ouvre directement la première fiche autorisée du cours L1. Le choix de langue à apprendre continue d’exclure la langue native.

La présentation sur ordinateur utilise une grille de six langues dans un cadre translucide centré de 960 px maximum, avec le logo Melunga. Les cartes de langue restent accessibles dans une liste sur les petits écrans. Chaque carte porte une flèche qui indique son action immédiate ; le style de sélection préalable et la seconde confirmation disparaissent.

- [Choix des langues sur ordinateur](captures/langues-ordinateur.png)
- [Choix des langues sur mobile](captures/langues-mobile.png)
- [Première fiche ouverte après le clic](captures/lecon-directe.png)
- [Accueil proposé avec « Voir un exemple » conservé en vert](../mobile-home-capsule-green-example/captures/accueil-exemple-vert.png)

## Comportement

Le clic réutilise le lancement existant après la mise à jour du couple choisi. L’entrée web gratuite transmet un signal `start=lesson`, accepté seulement avec un couple explicite valide et le niveau 1. Le contrôleur attend la validation des données et des droits, puis ouvre le premier thème autorisé avec les fonctions normales du cours. Le signal est retiré de l’URL après succès. Un premier échec de chargement peut être réessayé ; le retour aux thèmes et l’actualisation ne relancent pas la leçon.

Les liens ordinaires sans ce signal conservent leur écran des thèmes. Les parcours de connexion, d’abonnement et du conteneur natif gardent leurs destinations et paramètres existants. Aucun son ne se lance automatiquement. Les fonctions d’accès, d’authentification, de paiement, de progression et de lecture audio restent inchangées.

La page d’accueil du produit conserve son bouton vert « Voir un exemple ». La nouvelle disposition des capsules d’accueil est uniquement illustrée dans le dossier de maquette séparé, sans import dans le produit.

## Vérifications

Les rapports finaux sont rangés par responsabilité :

- `checks/` : 12 tests source, 15 tests d’intégration et trois contrôles d’entrée ; les cinq pins de fichiers modifiés sont actualisés, les 19 autres restent identiques.
- `native-audio/` : flux des sept langues natives, 42 directions, première fiche en un clic sur mobile et ordinateur, géométrie et retours de connexion.
- `routes/` : lancement gratuit, abonnements, retours, entrée native, signal consommé une fois et paramètres invalides.
- `layout-verification.json` : géométrie et lisibilité de la nouvelle page, langues natives, petits écrans et texte agrandi.

Les réponses des API et médias sont des fixtures locales explicites. Aucun compte réel, paiement réel, son réellement écouté, appareil physique ou Safari n’est utilisé. Le test audio historique conserve ses anciennes assertions WaveNet ; l’intégration Chirp actuelle est vérifiée par la suite dédiée.

Cette branche prépare un résultat à examiner. Elle n’est pas fusionnée ni déployée en production.
