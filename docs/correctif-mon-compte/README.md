# « Mon compte » reste dans le parcours

Pour un accès connecté, le menu utilisait l’URL des leçons classiques : un clic sur « Mon compte » ouvrait donc une leçon. Il ouvre maintenant un volet de compte sur la page courante, avec l’état d’accès, le retour aux leçons et la déconnexion. La carte et l’URL restent identiques. Les libellés sont traduits pour zh→fr.

En aperçu Netlify, ce volet se présente explicitement comme un aperçu et la déconnexion reste désactivée. Le lien de connexion des visiteurs en production est conservé. Aucun compte réel n’a été utilisé pour les tests.

La déconnexion conserve les contrats existants : remise à zéro locale pour un accès ordinaire ; appel à la fonction existante pour un accès permanent/partagé, sans libérer sa place d’appareil. Un échec affiche une erreur et permet de réessayer. Une requête de statut antérieure ne peut pas réactiver un accès après une déconnexion réussie.

## Vérification locale

- `tests/account-menu.browser.cjs` : 6 groupes réussis, 12 cas (mobile, ordinateur, français et chinois, session normale/partagée, refus de stockage et requêtes concurrentes).
- `tests/course-entry-access.browser.cjs` : les 6 contrôles existants réussissent sans modification ; les 2 218 accès gratuits historiques sont conservés.
- Revue indépendante et contrôle des 8 empreintes du composant réussis ; les 78 JSON de parcours, les prix, les images, le CSS, le catalogue classique et les fonctions serveur sont identiques à `a1085e8`.
- `course-access.js` est intentionnellement modifié pour la déconnexion et l’état de session permanente. Ses fonctions d’éligibilité, de filtrage et de construction des URL restent identiques ; ne pas le présenter comme entièrement inchangé.

Les rapports joints décrivent les essais sur Chromium local, avec tailles de téléphone simulées et API de compte simulée. Aucun essai sur téléphone physique, aucune déconnexion réelle ni validation de compte en production n’est revendiqué.

## Livraison

Composant de revue, à composer avec l’aperçu de progression du niveau et le logo sans contour. Ni fusion dans `main` ni publication à ce stade : l’aperçu reste soumis à la validation demandée par Kartech.
