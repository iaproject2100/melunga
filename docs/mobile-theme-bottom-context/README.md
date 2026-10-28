# Niveau et langue en bas sur la page des thèmes

Sur téléphone, les deux cercles translucides de niveau et de langue se placent aux extrémités de la barre inférieure lorsque la liste des thèmes est affichée. Les raccourcis Révisions, Voix, Couleur et Menu restent dans leur capsule centrale. Les commandes « À revoir », « Suivant » et l’écoute sont absentes de cette vue ; leur espace est ainsi utilisé par les réglages de niveau et de langue.

Dès qu’une leçon s’ouvre, les mêmes boutons de niveau et de langue reviennent dans l’en-tête, à leur place précédente. Les deux cercles restent de 48 × 48 px, avec leur transparence, la couleur du niveau et le drapeau d’origine. Aucune copie de bouton ni nouveau gestionnaire n’est créé. L’ordre de tabulation de la barre des thèmes suit l’ordre visuel : niveau, Révisions, Voix, Couleur, Menu, langue.

Le déplacement est appliqué au changement de vue avant l’image suivante, puis les mesures habituelles de l’interface sont recalculées. Le haut de la liste ne conserve pas de rangée vide. Les thèmes et leurs photos profitent de l’espace libéré. Les vues de leçon, de fin et de séquences conservent leurs réglages en haut ; la version ordinateur conserve son organisation.

- [Thèmes mobiles : niveau et langue en bas](themes-niveau-langue-en-bas.png)
- [Leçon : niveau et langue en haut](lecon-niveau-langue-en-haut.png)
- [Rapport navigateur](browser-report.json)

## Vérifications

Le contrôle de présentation utilise les véritables pages et contenus du dépôt, avec des réponses API locales explicites. Il comprend huit groupes :

- Quatre profils mobiles : français–espagnol sur 280 × 620 et 320 × 620 px, français–chinois sur 390 × 740 px et coréen–français sur 320 × 620 px. Les six réglages sont accessibles en bas sur les thèmes, avec des cibles distinctes d’au moins 44 px et deux cercles de 48 px. Le contenu reste au-dessus de la barre, les photos sont visibles, et les dialogues restent dans l’écran lorsqu’ils sont ouverts depuis le bas.
- Les captures complètes des premières fiches mobiles sont identiques, octet par octet, à celles de la version précédente `169e1f785128113a4cb7ca26d2354e7841d40b6b`. Les allers-retours thèmes → leçon → thèmes conservent les mêmes boutons d’origine et remettent chaque commande à sa place. Les raccourcis Révisions et Voix et l’unique gestionnaire d’écoute fonctionnent toujours.
- Deux profils ordinateur, 1366 × 768 et 1920 × 1080 px : les captures complètes des thèmes et des premières fiches sont identiques à la version précédente.
- Un changement réel de niveau L1 → L2 puis de couple français–espagnol → français–chinois, avec accès payant simulé, vérifie les reconstructions du menu, les dialogues, les positions et l’absence de doublons.
- Un passage mobile → tablette → ordinateur → mobile vérifie les largeurs 800, 1366, 390, 1101, 760 et 280 px, puis un redimensionnement pendant une leçon. Chaque commande reste unique et retrouve le bon emplacement.

Les 169 empreintes complètes des sources utilisées correspondent aux fichiers finaux et sont restées stables. Aucune erreur JavaScript, erreur de fixture ou requête inattendue n’a été observée. Les contrôles de démarrage (12), de l’animation du logo (12), de source (12), d’intégration audio (15) et des ressources d’entrée ont également réussi sur les sources finales ; leurs rapports sont joints séparément par l’intégration. Les versions de cache sont `course-desktop.css?v=14` et `course-desktop.js?v=8`. Vingt des vingt-quatre fichiers de la couche source finie conservent leur empreinte : seuls la feuille, l’adaptateur et leurs deux références HTML changent.

Ces contrôles utilisent Chromium avec émulation de tailles et de toucher. Aucun appareil physique, Safari, compte, paiement ou son réel n’a été utilisé.
