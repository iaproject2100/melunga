# Démarrer ouvre le parcours progressif

La capture montre l’application classique en anglais pour un cours d’espagnol. Dans l’accueil réellement servi sur melunga.com (`main` à `ef147de`), seuls les sept couples relus sont reconnus par `coursePair()`. Pour `en-es`, cette fonction renvoie une chaîne vide ; le bouton lance alors `app.html?lang=en&study=es&start=1`.

Le correctif de langue maternelle de la PR #32 corrige déjà cette entrée, mais il n’était pas présent dans l’aperçu audio de la PR #33. Le présent assemblage conserve les deux correctifs dans un même aperçu : accueil anglais → choix espagnol → « Démarrer » → `parcours-niveaux.html?pair=en-es&level=1` → fiche espagnole, sens anglais et voix serveur `es-ES-Wavenet-F`.

Les deux présentations de l’accueil, sur ordinateur et mobile, suivent ce chemin. Les anciennes URL web avec coordonnées valides et les retours de connexion conservent leur langue et leur niveau. Les exceptions classiques explicites et les applications natives restent inchangées.

Les sept parcours relus, les données du catalogue, la progression mémorisée et les contrats de droits/prix conservent leur référence validée. Les libellés des nouvelles voix et du message d’indisponibilité sont également traduits dans les sept langues maternelles. Le cache de l’interface passe à `maquette-guidee.js?v=31`, celui des libellés à `course-i18n.js?v=2`.

L’aperçu #33 remplace les deux liens de test séparés. Aucune fusion dans main ni publication sur melunga.com n’est effectuée dans cette livraison. L’accès au domaine des aperçus Netlify est bloqué par le proxy de l’environnement d’exécution ; les vérifications de parcours et audio utilisent donc les fichiers exacts dans Chromium local. Les sept voix du service de production ont été vérifiées séparément, sans écoute sur appareil physique.
