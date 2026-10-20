# Architecture mobile — reprise par Codex

État du 20 octobre 2026. Base de travail : `feat/conversation-integration` @ `2918e5a` et APK `Melunga-TEST-conversation-v3.apk` transmis par Kartech. Document de cadrage ; aucun projet Android source, build de release, fusion ou déploiement n'est créé ici.

## État vérifié

- SHA-256 APK v3 : `cdf5a277613d54ce805cf291f3b4223d8a2abd61f5552db5a45a64a6ed756695`.
- Configuration embarquée : `com.melunga.app.test`, nom `Melunga TEST`, origine Capacitor HTTPS localhost.
- `assets/public/construire.js`, `conversation-loader.js` et `mobile-runtime.js` identiques aux fichiers de la branche au moment de cette vérification.
- Contenus distants : `https://deploy-preview-8--chic-dragon-e2baf2.netlify.app/` ; marqueur `MELUNGA_TEST_BUILD = conversation-preview-8-v3`.
- Fonctions Netlify : le runtime conserve `https://melunga.com` pour les appels relatifs aux fonctions. La configuration d'origine des contenus ne transforme pas ces services en environnement de test.
- Sources du runtime et du CSS natifs disponibles dans `tools/apk-test/`. Reconstruction actuelle : apktool et signature de test à partir d'un APK existant, pas compilation Gradle/Capacitor depuis les sources.
- Retours de Kartech : chargement/CORS et dialogues fonctionnels ; corrections visuelles natives livrées dans v2/v3. Les essais restants ne sont pas considérés comme réussis par déduction.
- Données `roles: {A,B}` et `learnerRole` ajoutées dans le dernier commit de contenu ; leur prise en charge est ajoutée dans cette reprise de code (pas dans l'APK v3 reçu).

## Architecture cible

### 1. Une base web commune

`melunga_deploy/` reste la source de l'interface et du contenu web, copiée dans le répertoire web de Capacitor lors du build. Pas de correction manuelle dans l'APK comme source durable. Les corrections natives versionnées sont intégrées par une étape de préparation contrôlée.

Conserver le parcours validé : leçon → Mes phrases → modèles/variantes → rappel → dialogue. Modulariser progressivement le mode conversation :

- accès aux données et validation : `conversation-loader.js` ;
- libellés : `conversation-labels.js` ;
- état du parcours, reprise locale et règles d'accès : module explicite ;
- rendu et navigation : composants/fonctions séparés du chargement ;
- adaptation native : runtime dédié, sans recopier la logique des contenus.

Les phrases complètes restent la référence. `roles` fournit les noms affichés et `learnerRole` le rôle masqué initialement ; préserver le repli pour les anciens contenus. `reuses` ne déverrouille rien et ne mesure aucun acquis.

### 2. Un vrai projet Android/Capacitor source

Retrouver le projet original ou recréer explicitement un wrapper depuis les sources web, après inventaire des fonctions natives nécessaires. Versionner la configuration Capacitor, le projet Android, le Gradle wrapper, les versions des dépendances et les commandes de build. Vérifier les ponts audio, permissions et fonctions de boutique avant d'affirmer une équivalence avec l'application existante.

L'outillage apktool reste un moyen de reproduire les essais actuels. Il ne constitue pas la chaîne de release Google Play. Le script actuel utilise notamment un dossier de sortie supprimé au démarrage : ne pas l'exécuter sur un dossier utilisateur existant ; le sécuriser avant son adoption comme commande générale.

### 3. Configurations test et release séparées

| Élément | Test | Release |
| --- | --- | --- |
| Identifiant Android | `com.melunga.app.test` | `com.melunga.app` |
| Nom affiché | Melunga TEST | Melunga |
| Contenus | Aperçu explicitement choisi | Origine de production |
| Tous niveaux ouverts | Marqueur de test uniquement | Marqueur absent ; droits existants |
| Signature | Clé de test stable pour les mises à jour d'essai | Keystore de release géré hors Git |
| Artefact | APK installable pour recette | AAB signé pour Google Play |

La préparation des assets devra injecter la configuration, plutôt que maintenir une URL d'aperçu et un marqueur de test dans un runtime utilisé indistinctement. Le build release doit échouer si un hôte `deploy-preview-*`, un marqueur de test ou l'identifiant `.test` est présent.

Les identifiants différents isolent aussi le stockage local : la reprise de l'application habituelle n'est pas automatiquement transférée dans Melunga TEST. Vérifier le certificat avant toute mise à jour : un nouveau fichier de même identifiant signé avec une autre clé ne pourra pas remplacer l'installation existante sans désinstallation.

### 4. Contrats des services

Séparer la configuration des contenus de celle des services TTS, du compte et de la facturation. Documenter pour chaque essai les services effectivement contactés. Ne pas tester un paiement réel sous prétexte que l'interface utilise un aperçu. Pour le moment, la confirmation CORS concerne le scénario de chargement observé sur le téléphone de Kartech.

## Ordre de finalisation

1. Rôles nommés et rôle apprenant : raccordés au rendu dans cette reprise, avec repli pour les anciens fichiers ; à inclure dans le prochain APK.
2. Terminer la recette de l'APK v3 : mode avion/reprise réseau, reprise après fermeture, audio et lectures zh/ja/ko, affichage et droits en configuration appropriée.
3. Retrouver ou recréer le projet Capacitor ; établir un build debug depuis les sources avec configuration test séparée.
4. Sécuriser et documenter une commande de build reproductible, conserver le certificat de test de manière appropriée et identifier chaque artefact par commit/configuration/empreinte.
5. Effectuer la revue de release : aucune origine ni ouverture de droits de test, fonctionnalités natives vérifiées, puis préparation d'un AAB signé avec le keystore autorisé.

La publication reste une opération distincte. Aucun résultat de compilation ou essai sur appareil n'est acquis par l'existence de ce document.
