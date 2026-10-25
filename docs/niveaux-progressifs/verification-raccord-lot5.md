# Vérification du lot 5 — paires japonaises et gloses séparées

État consigné le 25/10/2026 à 19:45 CET. Horodatages détaillés des essais dans leurs JSON.

**Deux registres indépendants, 30 identifiants, 31 objets et 36 valeurs changées.**
Quatre paires aide/lecture forment huit événements figés, sur quatre canoniques
et une copie (4320), soit dix champs. Les 26 gloses natives sont appliquées
séparément, sans changer les cibles, aides ou lectures de ces 26 cartes.

| Contrôle | Résultat |
|---|---:|
| Génération reproductible | conforme |
| Rapport indépendant lié aux fichiers réels | conforme |
| Contre-épreuves Python refusées | 111 / 111 |
| Tests ciblés et historiques | 5 + 15 réussis |
| Nouvelles corruptions JS refusées | 26 / 26 |
| Commandes, Pinyin, gestes, À revoir, fiche entière | 9 / 9 |
| Matrice générale navigateur | 19 / 19 |

Les trois paires actives sont vérifiées dans le DOM et par le texte entier
transmis à la synthèse vocale. La lecture japonaise s’affiche séparément de
l’aide adaptée ; l’interface chinoise du Pinyin n’est pas modifiée. La copie
4320 a les deux valeurs corrigées. Le modèle à trou 3771 reste en réserve,
sans étape de production ajoutée. Les cinq gloses 日本語 et la polarité de la
place libre sont testées, ainsi que les fiches sur mobile et ordinateur.

Les 77 JSON sont comparés intégralement à `f22202c` après projection privée des
seuls champs attestés. Les 37 fichiers d’application/interface restent identiques.
Les nouveaux changements ne touchent ni étude, ni source, type, emplacement,
niveau, rôle, étape, prix ou accès. Les exceptions anciennes d’étude, de sens
et de lecture des lots précédents restent autorisées par leurs propres preuves.

Les 32 115 cartes classiques et leurs 110 277 champs originaux restent intacts.
Dans le parcours, 109 143 champs catalogue restent verbatim ; 1 134 sont des
exceptions enregistrées de l’ensemble des couches : 1 063 aides, dix lectures,
deux études et 59 sens. Les après ne sont pas présentés comme des copies
verbatim de l’origine, et la validation ne réécrit pas le pack appelant.

La couverture est exacte : 4 763 positions / 4 757 identifiants. Les 604
propositions sur 582 IDs et l’unique convention ne sont pas appliquées.
Le before erroné de la proposition incertaine 833 est documenté sans l’utiliser.
Les errata et les 81 stades du lot 4 sont confirmés, sans modifier ses valeurs
ni ses empreintes. La lecture individuelle annoncée par Claude atteint 30/70.

[Preuves, commandes et empreintes](verification-raccord-lot5.json),
[contrôle indépendant](verification-independante.md),
[commandes](verification-commandes-lecon-navigateur.md),
[matrice navigateur](verification-navigateur.md),
[compte rendu](reponse-revue-integrale-lot5/README.md).

Essais Chromium locaux, formats émulés, TTS simulée pour le texte transmis.
Aucun téléphone physique, son réel, parcours du site hébergé ou validation
native globale revendiqué. Aucune fusion dans main ni publication sur melunga.com.
