# Vérification du lot 4 et du contenu certain distinct

État consigné le 25/10/2026 à 18:42 CET. Les horodatages détaillés des essais restent dans leurs JSON.

**Deux registres indépendants, 311 objets concernés et 315 valeurs effectivement
changées.** Les 259 aides représentent 275 objets (257 canoniques, 15 copies et
trois reçus). Les 33 gloses et deux blocs représentent 35 identifiants / 36
objets (34 canoniques, une copie et un reçu), 41 champs déclarés / 40 changés.
La garde native de 757 est volontairement inchangée.

| Contrôle | Résultat |
|---|---:|
| Génération reproductible | conforme |
| Rapport indépendant lié aux fichiers réels | conforme |
| Contre-épreuves Python refusées | 93 / 93 |
| Tests ciblés et historiques | 6 + 9 réussis |
| Nouvelles corruptions JS refusées | 22 / 22 |
| Commandes, Pinyin, gestes, À revoir, fiche entière | 9 / 9 |
| Matrice générale navigateur | 19 / 19 |

Les blocs 1900 et 757 sont vérifiés en entier dans le DOM et en TTS ; le Pinyin
corrigé de 1900 est explicite. Six mesures supplémentaires des fiches 757,
1900 et de la longue glose 4504 sur mobile 320×640 et ordinateur 1280×720 ne
montrent aucun défilement, coupe ou chevauchement. Les aides tronquées, liaisons,
genre, sigles, révisions et modèles reçus sont contrôlés dans leurs cas ciblés.

Les 77 JSON sont comparés intégralement à `606592c` après projection privée des
seules exceptions attestées. Les 37 fichiers d’application/interface restent
identiques. Les études et sens ne sont pas déclarés intacts globalement :
leurs corrections explicites font partie du registre de contenu, avec application
atomique des deux blocs. Provenance, annotations précédentes, identifiants,
types, placements, niveaux, rôles, étapes, prix et accès restent conservés.

Le catalogue classique de 32 115 cartes et ses 110 277 champs originaux restent
inchangés. Dans les données du parcours, 109 177 champs catalogue sont verbatim ;
1 100 sont des exceptions déclarées de toutes les couches : 1 059 aides, six
lectures, deux études et 33 sens. Les champs des origines sont contrôlés avant
correction, pas présentés comme égaux aux valeurs après. Le pack appelant est
inchangé par la validation.

La couverture est exacte : 4 736 positions / 4 729 identifiants. Les 309
propositions de classement sur 305 IDs et les 81 conventions ne sont pas appliquées.
Les cinq conventions repartant d’un après phonétique sont distinguées des 76
avant à `606592c`. Les 50 aides tronquées existaient déjà dans la source classique,
sans cause éditoriale historique établie.

[Preuves, commandes et empreintes](verification-raccord-lot4.json),
[contrôle indépendant](verification-independante.md),
[commandes](verification-commandes-lecon-navigateur.md),
[matrice navigateur](verification-navigateur.md),
[compte rendu](reponse-revue-integrale-lot4/README.md).

Essais Chromium locaux, formats émulés et TTS simulée pour le texte transmis.
Aucun téléphone physique, son réel, expérience du site hébergé ou validation
native globale revendiqués. Aucune fusion dans main ni publication sur melunga.com.
