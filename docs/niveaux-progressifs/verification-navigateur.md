# Vérification navigateur du parcours local

Exécution : `2026-10-25T22:14:05.870Z` — statut **passed**.

Chromium local, largeurs 320, 390 et 1440 px. Ces vues émulent des écrans ; aucun téléphone physique ni site déployé n’a été testé par cette suite.

- Contrôles réussis : 19 / 19.
- Matrice : 210 vues de cellules ; 4908 entrées de thèmes ; 167051 étapes DOM.
- Nouvelles situations : 196 cas couple/thème, 1568 positions de phrases entières distinctes vérifiées.
- Répartition de ces positions : 1459 premières rencontres et 109 réemplois ; aucun réemploi compté comme révision.
- Sources du lot : 6272 comparaisons de champs entiers, dont contrôle de l’absence de lecture lorsqu’elle n’existe pas.
- Affichage du lot : 43428 comparaisons de champs dans le DOM ; 3528 rappels contrôlés.
- Audio simulé : 11130 envois du texte étudié entier ; la phonétique n’est pas utilisée comme texte TTS.
- Interlocuteurs : 259 positions sourcées, 273 affichages contrôlés ; 399 preuves de réponse préparée ; 273 contrôles d’exclusion de la progression de production.
- Soutiens lexicaux : 252 positions sourcées, séparées des étapes de production de phrase.
- Gardes du réemploi : 9 corruptions refusées, puis correction et rechargement de banque contrôlés.
- Gardes des reçus : 13 corruptions refusées, puis banque corrigée rechargée.
- Visuels : 278 emplacements et 24 atlas vérifiés.

Le masquage conserve le sens ; l’oreille révèle explicitement le modèle et le bouton de fond ne le révèle pas. Les contrôles de révision ordinaire, de chargements concurrents, de reprise après erreur, du menu et de la page L1 v1 sont conservés dans la suite.

Fraîcheur : les empreintes avant/après des cellules, banques, manifeste, sources rédigées, plan, ledgers, snapshots de conversation, catalogue/index, HTML, CSS, JavaScript, suite de tests et images sont enregistrées dans le JSON. Une exécution partielle ne reçoit pas le statut passed.

Le TTS est remplacé par un témoin d’envoi : cette suite vérifie le texte transmis et le comportement d’écoute, pas le son réel ni la justesse linguistique des aides. Claude vérifie la phonétique ; les résultats ne sont pas une mesure d’acquisition.

Rapport détaillé : [verification-navigateur.json](verification-navigateur.json).
Plan : `d2ce2e8d9476756ee7e6651a3103b449ee89625ec1065c4fdf6f83382010a379`.
Manifeste : `183eea8ecc7b0a57ff94a0e23f08e64c8aba173a1c25918e75306cf2d57248e8`.

L’édition du lot 8 ajoute 63 aides espagnoles, puis 18 gloses, deux études
ponctuées et trois blocs complets dans un registre distinct. Les deux études
seules gardent aide, sens et statut ; les trois blocs changent étude et aide
ensemble, un seul change aussi le sens. Les après sont validés avant projection
privée des seules corrections attestées vers les sources historiques. Les 310
propositions et 151 conventions restent non appliquées. Voir [le raccord lot 8](verification-raccord-lot8.md).
