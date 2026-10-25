# Vérification du lot 8 — espagnol, aides et contenu séparés

État consigné le 25/10/2026 à 23:43 CET. Horodatages détaillés des essais dans les JSON.

**Deux registres disjoints : 86 identifiants, 88 objets, 92 champs corrigés.**
Le premier reprend 63 aides entières : 62 canoniques, une copie et un modèle
reçu, soit 64 objets/champs. Le second reprend 18 gloses, deux études seules
et trois blocs : 23 canoniques et une copie, 28 champs runtime pour 27 au registre.
Aucune lecture n’est modifiée.

| Contrôle | Résultat |
|---|---:|
| Génération reproductible | conforme |
| Rapport indépendant lié aux fichiers réels | conforme |
| Contre-épreuves Python refusées | 171 / 171 |
| Tests ciblés et historiques | 6 + 32 réussis |
| Nouvelles corruptions JavaScript refusées | 46 / 46 |
| Commandes, Pinyin, gestes, À revoir, fiche entière | 9 / 9 |
| Matrice générale navigateur | 19 / 19 |

La copie de 619, le reçu et l’ancienne annotation B de 3159 sont préservés.
Les deux études seules 661/875 reçoivent ¡ et ! en gardant aide, sens et statut.
Les trois blocs 1340/2727/3186 changent étude et aide ensemble ; les deux derniers
gardent leur sens. La copie du soutien el estómago a le même sens corrigé que
sa source. Les cinq cartes de contenu étudiées tiennent sur mobile et ordinateur.

Les 77 JSON sont comparés intégralement à `224e459` après projection privée des
seuls champs attestés. Les 36 fichiers HTML/CSS/JS directement sous
melunga_deploy restent identiques. Types, identifiants, placements, niveaux,
rôles, étapes, prix, droits et présentation sont conservés. Seuls les deux
événements de ponctuation et les trois blocs changent leur étude.

Les 32 115 cartes classiques et leurs 110 277 champs originaux restent intacts.
Dans le parcours, 108 754 champs catalogue restent verbatim ; 1 523 sont des
exceptions enregistrées de toutes les couches : 1 360 aides, 17 lectures,
14 études et 132 sens. Aucun autre écart n’est accepté. La projection ne modifie
pas le pack appelant et les sources historiques ne sont pas réécrites.

Couverture exacte : 4 959 canoniques + 36 reçus = 4 995 positions / 4 992 IDs.
Les 310 propositions, 151 conventions et 119 contenus incertains restent non
appliqués. Les champs phonétiques conventionnels restent gardés, y compris
sur trois cartes dont la glose change séparément. 82 statuts vérifié comportent
une convention jota ouverte : lecture et clôture des conventions sont distinctes.
Claude annonce 60/70 cellules lues, les dix cellules fr→it restent à lire.

EN71 (2205) garde son après source « é-né » : /e e.ne/ peut se réaliser [e.ne]
par coalescence orale, sans distinguer explicitement E + N de N seul. Ce point
est consigné pour confirmation de segmentation par Claude ; aucune nouvelle
chaîne ni règle générale n’est inventée. Les motifs de No hay que, Flipas et
muy restent contextualisés. La jota et le batchim coréen ne sont pas arbitrés.

[Preuves et empreintes](verification-raccord-lot8.json),
[contrôle indépendant](verification-independante.md),
[commandes](verification-commandes-lecon-navigateur.md),
[matrice navigateur](verification-navigateur.md),
[compte rendu](reponse-revue-integrale-lot8/README.md).

Essais Chromium locaux, formats émulés, TTS simulée pour le texte transmis.
Aucun téléphone physique, son réel, parcours du site hébergé ou validation
native globale revendiqué. Aucune fusion dans main ni publication sur melunga.com.
