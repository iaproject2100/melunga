# Vérification navigateur du parcours local

Exécution : `2026-10-24T17:48:34.742Z` — statut **passed**.

Chromium local, largeurs 320, 390 et 1440 px. Ces vues émulent des écrans ; aucun téléphone physique ni site déployé n’a été testé par cette suite.

- Contrôles réussis : 17 / 17.
- Matrice : 210 vues de cellules ; 4506 entrées de thèmes ; 160054 étapes DOM.
- Nouvelles situations : 70 cas couple/thème, 560 positions de phrases entières distinctes vérifiées.
- Répartition de ces positions : 529 premières rencontres et 31 réemplois ; aucun réemploi compté comme révision.
- Sources du lot : 2240 comparaisons de champs entiers, dont contrôle de l’absence de lecture lorsqu’elle n’existe pas.
- Affichage du lot : 15120 comparaisons de champs dans le DOM ; 1260 rappels contrôlés.
- Audio simulé : 3780 envois du texte étudié entier ; la phonétique n’est pas utilisée comme texte TTS.
- Gardes du réemploi : 9 corruptions refusées, puis correction et rechargement de banque contrôlés.
- Visuels : 260 emplacements et 22 atlas vérifiés.

Le masquage conserve le sens ; l’oreille révèle explicitement le modèle et le bouton de fond ne le révèle pas. Les contrôles de révision ordinaire, de chargements concurrents, de reprise après erreur, du menu et de la page L1 v1 sont conservés dans la suite.

Fraîcheur : les empreintes avant/après des cellules, banques, manifeste, sources rédigées, plan, ledgers, snapshots de conversation, catalogue/index, HTML, CSS, JavaScript, suite de tests et images sont enregistrées dans le JSON. Une exécution partielle ne reçoit pas le statut passed.

Le TTS est remplacé par un témoin d’envoi : cette suite vérifie le texte transmis et le comportement d’écoute, pas le son réel ni la justesse linguistique des aides. Claude vérifie la phonétique ; les résultats ne sont pas une mesure d’acquisition.

Rapport détaillé : [verification-navigateur.json](verification-navigateur.json).
Plan : `01a6ddae871e0df8dcf27bfbbae254565c4fb3d55b767f4b75219ce991473604`.
Manifeste : `410c9762042ee3ff5a30a317e01282411286ed0dda06b844d6abb812dc4e81be`.
