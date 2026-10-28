# Intégration de l’accueil mobile validé

La présentation approuvée est intégrée dans l’accueil web : bouton vert « Voir un exemple » vers le milieu, trois capsules translucides individuelles pour l’essai, le compte et la langue, puis le lien de connexion. Les autres écrans et la présentation propre au conteneur natif conservent leurs styles.

Les commandes d’essai, de langue, d’exemple et de connexion gardent leurs nœuds et gestionnaires existants. La création de compte rejoint le parcours réel existant : choix d’accès, langue, puis formulaire d’inscription sécurisé. Elle n’utilise pas l’ancien écran d’inscription de démonstration. Aucun nouveau service d’authentification ou de paiement n’est ajouté.

L’entrée directe dans la première fiche depuis le choix de langue, préparée dans `docs/direct-language-start`, est incluse dans cette version. Le cache du script d’accueil passe à `desktop-home.js?v=4`.

Validation finale : 13 cas de présentation et de langues, quatre parcours de navigation sur les pages réelles avec API locales explicites, 12 tests source, 15 tests d’intégration et trois contrôles d’entrée. Les parcours comprennent l’essai sur mobile et ordinateur, le formulaire réel de création de compte et la connexion, sans soumission. Les inventaires et assertions des contrôles source restent inchangés ; seuls les pins d’`index.html` et `desktop-home.js` sont actualisés depuis la dernière version de travail.

Les captures sont des rendus Chromium. Aucun appareil physique, Safari, compte, paiement ou audio réel n’a été utilisé. Les fichiers du serveur, les voix approuvées, les données du cours et les mécanismes d’accès ne sont pas modifiés.
