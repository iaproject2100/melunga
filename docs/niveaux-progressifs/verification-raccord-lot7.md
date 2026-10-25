# Vérification du lot 7 — anglais, aides et contenu séparés

État historique du lot 7 à `224e459`. Le [lot 8](verification-raccord-lot8.md) décrit l’édition actuelle.

État consigné le 25/10/2026 à 22:00 CET. Horodatages détaillés des essais dans leurs JSON.

**Deux registres disjoints : 244 identifiants, 254 objets, 262 champs corrigés.**
Le premier reprend 228 aides entières, sans lecture : 225 canoniques, dix copies
et trois modèles reçus, soit 238 objets/champs. Les six familles comptent 234
appartenances, six aides ayant deux labels. Le second reprend 11 gloses et
cinq blocs complets : 16 canoniques, 24 champs (cinq études, cinq aides et
14 sens). Deux blocs gardent leur sens natif inchangé comme garde.

| Contrôle | Résultat |
|---|---:|
| Génération reproductible | conforme |
| Rapport indépendant lié aux fichiers réels | conforme |
| Contre-épreuves Python refusées | 151 / 151 |
| Tests ciblés et historiques | 6 + 26 réussis |
| Nouvelles corruptions JavaScript refusées | 35 / 35 |
| Commandes, Pinyin, gestes, À revoir, fiche entière | 9 / 9 |
| Matrice générale navigateur | 19 / 19 |

Les six familles, exceptions G et trois modèles reçus sont vérifiés dans le
DOM et par le texte entier transmis à la synthèse vocale. Les cinq blocs et
11 gloses ont leurs valeurs exactes, sans changement non déclaré ; les deux
sens gardés restent intacts. Les cinq blocs tiennent dans les fiches mobile
et ordinateur. Les sources, annotations antérieures et lectures sont conservées.

Les 77 JSON sont comparés intégralement à `d56fe23` après projection privée des
seuls champs attestés. Les **36 fichiers HTML/CSS/JS directement sous
melunga_deploy** restent identiques. Les identifiants, types, placements,
niveaux, rôles, étapes, prix, droits et la présentation sont conservés.
Seuls les cinq blocs déclarés changent leur étude anglaise. Les sources
historiques ne sont pas réécrites pour présenter l’après comme verbatim.

Les **32 115 cartes classiques et leurs 110 277 champs originaux restent intacts**.
Dans le parcours, **108 839 champs catalogue restent verbatim** ; 1 438 sont
des exceptions enregistrées de toutes les couches : 1 296 aides, 17 lectures,
neuf études et 116 sens. Aucun autre écart n’est accepté. La projection de
contrôle ne modifie pas le pack appelant.

La couverture est exacte : **4 704 canoniques + 36 modèles reçus = 4 740
positions / 4 735 identifiants**. Les 689 propositions, 30 conventions et
95 gloses incertaines restent non appliquées. La lecture individuelle annoncée
par Claude atteint **50/70 cellules**, les vingt cellules fr→es et fr→it restent
à lire. Les tests techniques ne remplacent pas cette lecture.

Les motifs sont contextualisés : accept peut avoir une initiale réduite /ə/,
I make a quote peut être habituel, et burn that bridge peut être humoristique.
Les après retenus servent les sens visés ; ils ne constituent pas une
interdiction universelle de ces variantes. La règle A de ce lot est l’accent
anglais, sans rapport avec l’ancienne A espagnole retirée. Au snapshot avant d56fe23, les 739 autres
gloses finissant par espace+? se reproduisent en IDs distincts (740 positions) ;
les huit ponctuations pleine chasse sont bien les huit corrigées.

[Preuves, commandes et empreintes](verification-raccord-lot7.json),
[contrôle indépendant](verification-independante.md),
[commandes](verification-commandes-lecon-navigateur.md),
[matrice navigateur](verification-navigateur.md),
[compte rendu](reponse-revue-integrale-lot7/README.md).

Essais Chromium locaux, formats émulés, TTS simulée pour le texte transmis.
Aucun téléphone physique, son réel, parcours du site hébergé ou validation
native globale revendiqué. Aucune fusion dans main ni publication sur melunga.com.
