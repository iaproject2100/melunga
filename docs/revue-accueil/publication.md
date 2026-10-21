# Publication de l'accueil et APK d'essai v4

Kartech a validé la proposition puis demandé explicitement la mise à jour du site sur ordinateur, sur mobile et de l'application, le 21 octobre 2026.

## Site publié

- Site : https://melunga.com/
- Commit de production : `94f1c4f1ce41ee115f608d28883e83a7b6fe226d`.
- Trois fichiers publiés : `index.html`, `desktop-home.js`, `desktop-home.css`.
- Contenus identiques, octet pour octet, à la proposition validée de `5f40d80`.

Les trois URL de production répondent en HTTPS avec le statut 200 et les empreintes attendues. Leurs en-têtes demandent une revalidation du cache à chaque chargement. Le détail figure dans `verification-production.json`.

Le rendu a été testé localement à quatre tailles d'écran et dans les sept langues d'interface. Le contrôle supplémentaire par Chromium sur le domaine réel a rencontré le certificat du proxy de cet environnement ; TLS n'a pas été désactivé. La confirmation du déploiement repose sur les réponses HTTPS et les empreintes des fichiers effectivement servis, identiques aux fichiers testés.

Aucune fusion des contenus conversation ni des correctifs pédagogiques n'a été effectuée. Le module « Ma prochaine conversation » reste une maquette séparée. Les tarifs, les droits et les leçons n'ont pas changé.

## Application Android

Le v3 fourni embarque ses pages. Il ne reçoit pas la nouvelle page d'accueil par la publication web. L'application est donc traitée par un nouveau paquet d'essai, séparé de la production web.

Fichier : `android/Melunga-TEST-accueil-v4.apk`, environ 10,3 Mo. Identifiant inchangé `com.melunga.app.test`, version `1.0.4-conv-test4`, code `6`.

Le certificat est identique à celui du v3 ; les signatures Android et l'alignement sont vérifiés. Les trois fichiers d'accueil ont été remplacés et le numéro de version incrémenté. Les 584 autres entrées du paquet sont conservées, notamment les leçons, le runtime, les plugins et la configuration conversation de l'aperçu #8. Le rapport détaillé et le script de préparation sont dans `android/`.

SHA-256 : `e8c8774ae1b6a3ad707965a2debe4fc7b91a7b28126239c82e8bb22340110e83`.

Cet APK de test est prévu pour être installé par-dessus le v3. Ne pas désinstaller la v3 pour cet essai ; la conservation réelle de la progression et le fonctionnement sur téléphone restent à confirmer par l'installation. Aucun AAB de release n'est fourni ni publié sur Google Play.

## À vérifier avec Kartech et Claude

Ouvrir le site sur ordinateur et téléphone ; installer le v4 de test puis vérifier le drapeau de l'accueil, la sélection des langues, le démarrage d'une leçon et la progression existante. Les vérifications de navigateur simulé ne remplacent pas cet essai sur appareil.
