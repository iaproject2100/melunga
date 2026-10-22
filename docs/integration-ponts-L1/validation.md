# Contrôles de l’intégration L1

Vérifications locales sur Chromium, le 22 octobre 2026, dans l’application réelle issue de `main` à `bb9f904`. Ce compte rendu décrit un lot de revue, pas un déploiement.

| Contrôle | Résultat |
| --- | --- |
| Paquet des sept couples | 49 répliques exactes, générateur reproductible ; `--check` conforme |
| Conservation des sources et contrat | 10 tests Python réussis ; comparaison indépendante aux objets Git, aides présentes, fragments, rôles, réponses préparées et refus des mutations |
| Lecteur intégré | 7 couples × 32 étapes × 2 formats = **448 étapes contrôlées** à 390 × 844 et 1440 × 900 |
| Entrée utilisable | Ouverture du menu des thèmes puis clic sur « Premier échange · L1 » sur mobile et ordinateur |
| Compréhension et production | Les trois répliques reçues restent visibles ; leurs instructions ne demandent pas de les produire |
| Sans modèle | Les quatre répliques de l’apprenant sont retirées du DOM de la carte, phonétique et lecture comprises ; aide réaffichable exacte ; aperçu classique vidé |
| Écoute | L’argument envoyé au moteur est le texte étudié exact, jamais la phonétique ; une phrase masquée n’est pas lue sans restauration de l’aide |
| Gestes et boutons | Navigation, borne de début, fin sans boucle ; geste tactile horizontal réel ; aucune écriture dans les phrases connues/à revoir, le SRS ou les droits |
| Retour aux leçons | Cartes classiques restaurées, y compris après sélection d’un niveau verrouillé ; L2 reste soumis aux droits existants |
| Formulaire de compte | Une ouverture pendant une réponse masquée isole le clavier ; fermer le formulaire conserve le masquage |
| Changement de langues | Sortie de l’ancienne scène, chargement du bon couple ; aucun couple supplémentaire proposé |
| Échecs de chargement | Paquet absent ou invalide : message, réessai et sortie fonctionnels ; une réponse réseau tardive est ignorée après changement de couple |
| Actions différées | Ancien classement de carte, reprise audio et synthèse retardée ne modifient pas la nouvelle scène |
| Reconnaissance native simulée | Une réponse tardive n’affiche pas de score dans la scène ; aucune nouvelle reconnaissance n’y est lancée |
| Petit écran et stockage bloqué | 320 × 568 utilisable ; boutons séparés, cibles d’au moins 44 px et libellés dans les limites des boutons et de l’écran |
| Erreurs JavaScript dans la suite intégrée | **0** |

Les deux suites existantes suivantes passent également sur les fichiers finaux :

- `account-ui.test.cjs` : compte, connexion, trois ambiances, sept langues d’interface, navigation au clavier, formulaires et parcours de paiement isolés avec réponses de test.
- `lesson-mobile-gestures.test.cjs` : neuf configurations de langue/écran, cartes longues, défilement interne, passage à la phrase suivante, commandes protégées et gestes espagnols.

Le test d’intégration compare aussi les déclarations complètes `DECKS`, `PEDAGOGY_FAMILIES` et `FREE_LV` à la base de production : elles sont identiques. Aucun fichier de tarification, de paiement ou de gestion des droits n’est modifié. L’adaptation de `native-speech.js` empêche uniquement qu’une reconnaissance classique tardive ou déclenchée pendant la scène y produise un score ; aucun APK n’est construit.

## Captures de l’application

- [Menu mobile et entrée dans la scène](captures/cafe-menu-390.png)
- [Menu ordinateur et entrée dans la scène](captures/cafe-menu-1440.png)
- [Préparation chinoise — mobile](captures/cafe-fr-zh-390-preparation.png)
- [Préparation chinoise — ordinateur](captures/cafe-fr-zh-1440-preparation.png)
- [Réplique reçue — mobile](captures/cafe-fr-zh-390-received.png)
- [Réponse sans modèle — mobile](captures/cafe-fr-zh-390-hidden.png)
- [Réponse sans modèle — ordinateur](captures/cafe-fr-zh-1440-hidden.png)
- [Préparation coréenne — mobile](captures/cafe-fr-ko-390-preparation.png)
- [Écran 320 px, stockage bloqué](captures/cafe-fr-en-320-blocked-storage.png)

## Limites des vérifications

Les tests utilisent des réponses réseau, une écoute et une reconnaissance contrôlées. Ils vérifient les textes transmis et l’intégration, pas la prononciation effective d’une voix sur chaque appareil, ni les acquis d’une personne. Aucun compte, paiement, envoi externe ou déploiement réel n’est effectué.

La relecture native reste en attente dans les sept scènes, en particulier pour le refus détaché, `結構です` en japonais et `괜찮아요` comme refus en coréen. La revue croisée de ce lot et la validation de Kartech restent à faire avant fusion et publication.
