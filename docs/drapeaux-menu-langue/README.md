# Drapeaux dans le choix de langue

Le sélecteur ordinateur ouvre maintenant le même menu de langues que sur mobile. Chaque langue disponible garde son nom et un drapeau CSS visible, y compris lorsque le système ne prend pas en charge les emoji de drapeaux. L’ordre demandé est conservé ; l’anglais garde le drapeau américain. Le badge arabe vert « ع » reste la convention prévue pour son activation ultérieure.

Le menu existant est placé sous body pour rester visible au-dessus de la présentation ordinateur. Il est positionné par rapport au contrôle qui l’a ouvert, puis lui rend le focus à la fermeture. Échap, Entrée, les flèches, Début et Fin sont contrôlés. La sélection HTML et son événement change restent disponibles pour la compatibilité du parcours existant. Aucune route de cours supplémentaire n’est activée.

Validation : 16 tests réussis, dont 4 contrôles navigateur de l’accueil, 5 protections des sources et 7 contrôles de localisation du parcours de démonstration. Syntaxe du JavaScript et des scripts HTML, génération i18n d’accueil en --check et git diff --check conformes.

Une ancienne fixture de localisation ne reconnaissait pas le préchargement du catalogue vocal partagé : elle répond maintenant explicitement 503 à la requête exacte de catalogue attendue, pour vérifier le repli sans appel réel au fournisseur. Les autres appels inattendus restent rejetés.

Captures contrôlées en 1366 × 900 et 390 × 900. Aucun paiement, compte ou audio réel utilisé. Le code des leçons, les banques, les thèmes et la progression restent inchangés. Le résultat sur le site public n’est pas confirmé dans ces essais locaux.
