# Retour aux capsules mobiles précédentes

Les supports ronds givrés ajoutés dans la version `4f29cee` sont retirés à la demande de l’utilisateur. La feuille `course-desktop.css` retrouve exactement ses octets de la version `69674c0508d04c0332a4cf1969a1467165a45544`. Le niveau et le drapeau partagent à nouveau une capsule translucide ; l’écoute redevient une touche large, avec « À revoir » à gauche et « Suivant » à droite et leurs libellés visibles. Les raccourcis de révision, de voix, de couleur et de menu restent groupés.

Le chargement discret pastel de `4bfd605` et la protection contre l’ancienne interface sont conservés. Les deux références de la feuille passent à `course-desktop.css?v=12`. Les 21 autres fichiers de la couche source finie conservent leur empreinte ; seuls la feuille et ses deux références HTML changent.

- [Thèmes mobiles rétablis](themes-capsules-retablies.png)
- [Leçon de chinois rétablie](lecon-capsules-retablies.png)
- [Rapport navigateur](browser-report.json)

## Vérification

Sept groupes de contrôles ont réussi : quatre comparaisons visuelles et trois contrôles des commandes mobiles. Les pages réellement rendues utilisent les contenus et scripts du dépôt, avec des réponses locales explicites pour le statut d’accès et le catalogue de voix.

Les captures des thèmes et de la première fiche sont identiques, octet par octet, à celles de la version `69674c` pour quatre profils : français–espagnol sur 320 × 620 px et 390 × 740 px, français–chinois sur 390 × 740 px, et français–espagnol sur ordinateur de 1366 × 768 px. La comparaison porte sur les pages prêtes ; l’écran temporaire de chargement reste volontairement celui de la correction récente.

Les trois profils mobiles vérifient le support commun niveau/langue, les formes et dimensions des capsules, la largeur de l’écoute, les libellés « À revoir », « Suivant » et d’écoute, les panneaux Révisions et Voix, les dialogues de niveau/langue/menu, l’unique gestionnaire audio d’origine, la continuation et l’enregistrement en révision de la phrase réelle. Le profil chinois vérifie aussi le libellé Pinyin et son commutateur. Les boutons d’origine restent les mêmes nœuds DOM.

Les 169 empreintes d’entrée du contrôle sont restées stables pendant l’exécution. Aucune erreur JavaScript, erreur de fixture ou requête inattendue n’a été observée. Ces contrôles utilisent Chromium avec émulation de tailles et de toucher ; aucun appareil physique, Safari, compte, paiement ou son réel n’a été utilisé.

Les contrôles de démarrage existants (12 cas), de source (12), d’intégration audio (15) et des ressources d’entrée sont exécutés séparément lors de l’intégration ; leurs rapports et journaux sont joints par l’intégrateur.
