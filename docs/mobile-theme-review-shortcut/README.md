# Raccourci « À revoir » sur la page des thèmes

Sur mobile, le premier raccourci de la barre des thèmes devient l’ampoule « À revoir ». Il ouvre directement la liste existante des mots et phrases enregistrés pour être retravaillés. Le bouton est celui de la rubrique « À revoir » d’origine, avec son icône, son nom traduit et son gestionnaire ; il ne s’agit pas d’un renommage du bouton d’exercices.

Les raccourcis Voix, Couleur et Menu restent à leur place, entre les cercles de niveau et de langue. Dans la leçon, le raccourci de révisions et exercices retrouve sa toque et son action précédente. Le menu complet propose toujours les deux rubriques distinctes : « À revoir » et « Révisions et exercices ».

- [Thèmes avec le raccourci à ampoule](themes-raccourci-a-revoir.png)
- [Liste réelle d’une expression enregistrée](a-revoir-expression-enregistree.png)
- [Rapport navigateur](browser-report.json)

## Vérifications

Huit groupes de contrôles ont réussi, sur les véritables pages et contenus du dépôt, avec des réponses API locales explicites :

- Quatre profils mobiles : français–espagnol sur 280 × 620 et 320 × 620 px, français–chinois sur 390 × 740 px et coréen–français sur 320 × 620 px. Le raccourci des thèmes est le bouton « À revoir » avec l’icône d’origine du menu, ouvre le panneau des expressions enregistrées et affiche son état vide lorsqu’aucune expression n’a été ajoutée. Les textes restent localisés.
- Pour chaque profil mobile, les captures complètes de la première leçon sont identiques, octet par octet, à celles de la version précédente `1d85863988dc6db3988f339ed73ac8997eb36d8e`. Les allers-retours thèmes → leçon → thèmes déplacent les mêmes boutons d’origine et conservent les gestionnaires de Révisions et de Voix, sans doublons. Le menu complet conserve les deux rubriques.
- Un parcours réel français–espagnol enregistre la phrase « Me llamo María. » avec le bouton de décision « À revoir », retrouve cette même phrase dans la liste grâce au nouveau raccourci, ouvre sa révision dédiée, écoute la phrase avec son gestionnaire audio d’origine, puis revient à la liste et retire l’expression. L’état vide apparaît alors de nouveau. Aucun enregistrement de phrase n’est injecté artificiellement dans le stockage.
- Les vues des thèmes et de la première leçon sont visuellement identiques à la version précédente sur ordinateur, aux tailles 1366 × 768 et 1920 × 1080 px.
- Un changement de niveau L1 → L2, de couple français–espagnol → français–chinois et un rafraîchissement d’accès payant vers gratuit simulé vérifient les reconstructions du menu et les nouveaux boutons d’origine. Les passages aux largeurs 800, 1366, 390, 1101, 760 et 280 px, puis un redimensionnement pendant la leçon, conservent les deux rubriques, les dialogues et la bonne position du raccourci.

Les 169 empreintes d’entrée correspondent aux sources finales et sont restées stables pendant le contrôle. Aucune erreur JavaScript, erreur de fixture ni requête inattendue n’a été observée. Les contrôles source (12), d’intégration audio (15), des ressources d’entrée et de démarrage (12) ont également réussi ; leurs journaux sont joints par l’intégration.

La présentation change uniquement dans l’adaptateur responsive et ses références `course-desktop.js?v=9` des deux pages HTML. Les 21 autres fichiers de la couche source finie conservent leur empreinte. La feuille de style, le contrôleur du parcours, les données, les voix et le chargement avec le logo sous l’eau restent inchangés.

Ces contrôles utilisent Chromium avec émulation des tailles et du toucher. Les réponses de statut et de catalogue vocal sont des fixtures locales. Aucun appareil physique, Safari, compte, paiement ou son réel n’a été utilisé.
