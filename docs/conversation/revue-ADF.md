# Revue croisée Codex — lots A/D/F et préparation de la PR unique

Revue après le lot F `fb2bbaf`, avec les ajustements du lot E. Branche à conserver non fusionnée et non déployée jusqu'à la revue de Claude sur B/C/E.

## Résultat sur le périmètre testé

- **A : contrat utilisable.** Tests Node réussis : sept couples, conversion v1 comparée à Python, cache et requêtes simultanées, erreurs et nouvelle tentative, données invalides, réponse tardive et résolution d'URL native. Correction : niveau fractionnaire → indisponible, sans chargement.
- **D : libellés utilisables.** Vérification Node des sept langues, des clés B/C/F, des dix titres/objectifs et des noms d'aides de lecture. Le lecteur UI est désormais limité aux chaînes, car `reading` peut être un dictionnaire.
- **F : encart utilisable pour les statuts actuels.** Présent pour ja/zh/ko et français pour sinophones ; absent pour es/en/it. Ajustement : affichage également après reprise et dans les dialogues. Convention et statut sont insérés comme texte, dans un encart repliable.

La détection F reste une compatibilité avec les chaînes `reviewStatus` existantes (mots « requise », « required », etc.). Si leur vocabulaire change, un code éditorial structuré sera préférable à une nouvelle interprétation de texte libre. Aucune validation native des contenus n'est déduite de cette revue.

## À faire relire par Claude

- E : reprise par couple, identifiant stable, modèle supprimé et droits courants.
- B/C : textes complets affichés et prononcés ; absence des réponses masquées dans le rendu ; navigation, focus et gestes.
- Ajustement F lors de la reprise : vérifier que l'encart reste discret sur téléphone.

## Proposition de PR unique

**Base :** `feat/mode-construire` · **Branche :** `feat/conversation-integration`.

**Titre proposé :** Intégrer les contenus de conversation L1–L10 dans Mes phrases

**Description prête à reprendre :**

> Mes phrases charge désormais les contenus par niveau et couple de langues. L'utilisateur choisit un modèle, transforme ses variantes, essaie une phrase sans voir la réponse, puis pratique un dialogue réplique par réplique en masquant un rôle.
>
> Sept couples disponibles : fr→es/en/zh/it/ja/ko et zh→fr. Les phrases complètes, leur phonétique et leurs lectures restent issues des fichiers de contenu. Les libellés sont fournis dans les sept langues d'interface. La position du dernier niveau/modèle est conservée localement par couple ; elle ne donne aucun droit et n'évalue aucun acquis. Un encart indique les contenus en relecture.
>
> Vérification : validateur de contenu, tests Node du chargeur et contrôles UI Chromium des sept couples ; dialogues, erreurs, changements de langue, stockage et accès gratuit/Premium simulé. Essais APK et accès réseau réels restent à effectuer.

Description préparée pour la PR unique, à reprendre après la revue croisée de Claude. Aucune PR n'est créée, modifiée ou fusionnée par ce document.

## Essais APK à planifier

1. Sur un appareil et un environnement de test contenant les JSON : URL effective, CORS réellement servi, accès depuis `mobile-runtime.js` et latence de chargement.
2. Une langue latine et au moins un contenu zh/ja/ko : lecture affichée et audio de la phrase complète ; rôle masqué sans réponse anticipée.
3. Mode avion : message d'échec, retour du réseau, nouvelle tentative.
4. Fermeture/relance : reprise par couple ; test gratuit puis Premium, sans déblocage via le stockage local.
5. Petit écran, clavier/sélecteurs système, zones de sécurité et encart éditorial.

Aucun nouvel APK/AAB n'a été construit pour cette revue. Le déploiement des données/CORS nécessaire à ces essais doit être organisé séparément, sans publier cette branche en production.
