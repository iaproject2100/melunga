# Vérification des routes après sélection directe d’une langue

Les deux suites de navigateur ont réussi sur les fichiers de production finaux, avec la correction du bouton Retour à 44 px. Les empreintes d’entrée sont restées stables et correspondent encore aux fichiers présents après les essais ; voir [summary.json](summary.json).

- **start-return-routing** : 8 groupes et 28 cas, [rapport](start-return-report.json), [journal](start-return.tap).
- **course-entry-access** : 6 groupes, [rapport](course-entry-report.json), [journal](course-entry.tap).

Les nouveaux parcours d’accueil demandent un seul clic sur une langue. L’entrée gratuite ouvre la première carte du parcours progressif, sans détour par l’application classique ni lecture automatique. Le signal `start=lesson` est consommé ; le retour aux thèmes et le rechargement y restent. Les valeurs de signal invalides, dupliquées et les demandes au niveau 2 n’ouvrent pas automatiquement de leçon.

Les contrôles existants de paiement, d’abonnement confirmé, de connexion, de retour natif, de listes de retours autorisés, de cartes gratuites historiques et de révocation des droits sont conservés.

Deux hypothèses anciennes de la suite d’accès ont été actualisées pour la version Chirp déjà approuvée avant cette modification :

- Le fichier serveur TTS complet est comparé au commit exact `ba3ac02313820b19cb4506c647c1e17f08543480`. Tous les autres fichiers serveur déjà vérifiés conservent leur comparaison à `ebd6519a6088e52c157231b44ae4cf41507f0667`. Aucune projection ni exception ouverte n’est introduite.
- Le catalogue audio simulé fournit explicitement les sept voix Chirp approuvées, pour préserver l’assertion de lecture via le serveur dans la fixture Audio. Les médias eux-mêmes restent entièrement simulés en mémoire ; aucun son réel n’a été téléchargé ou écouté.

Ces essais utilisent Chromium local, des tailles d’écran mobiles simulées et des réponses réseau locales explicites. Aucun compte, paiement, appel TTS externe, appareil physique ou Safari n’est utilisé ou revendiqué.
