# Contrat des conventions tranchées

Cette couche dépend du registre de contenu tranché de la PR de contenu. Les
instantanés `expectedBefore` décrivent son résultat, et non le contenu antérieur.
Le producteur est `tools/maquette-guidee/convention_corrections.py` ; il applique
uniquement les aides entières présentes dans les deux preuves copiées octet pour
octet du commit `68031b7c8643e78cae7b40ad59600db32b08f79a`, avec l'erratum
officiel `4247ca470354f59ea37992608b38e3728a6e22f9` et l'erratum batchim
`d5ad5e422f3fe1563d425ef8e0a07bea7b874559`, également copiés sans modification.

| Sélection | Nombre |
|---|---:|
| Événements source jota | 110 |
| Événements source batchim | 1 989 |
| Remplacements explicites après contenu | 21 |
| Remplacements recouvrant un événement source | 17 |
| Identités ajoutées par les remplacements | 4 |
| Remplacements entiers d'après dans l'erratum batchim | 5 |
| Événements source remplacés par l'erratum officiel de contenu | 3 |
| Identités effectivement corrigées | 2 100 |
| Occurrences canoniques | 2 099 |
| Copies de transport | 66 |
| Modèles reçus, dont une copie du catalogue coréen | 2 |
| Occurrences effectivement corrigées | 2 167 |

Les 2 120 références initiales figées (2 099 événements source et 21 remplacements)
restent intégralement dans les preuves. Les lignes exécutables citent 2 117 de
ces références et les cinq événements de l'erratum batchim, soit 2 122 pointeurs.
Les trois références initiales restantes figurent dans `supersededByContent`, avec
l'ancien événement, le bloc de contenu approuvé et la décision officielle :
`catalogue:es:3353`, `catalogue:ko:3767`, `catalogue:ko:3637`. L'erratum rend les
deux premiers événements de convention sans objet et corrige l'aide du dernier
bloc de contenu en `gueu-nyo-neun sam-guè gou-go-reul hè-sso-yo`. La couche de
contenu applique déjà ces trois tuples finaux ; cette couche les protège intégralement.

L'erratum batchim remplace uniquement l'après entier de cinq événements, en
conservant leur avant : `catalogue:ko:3090` reçoit `kkon-nip`,
`catalogue:ko:4275` reçoit `al-lyak`, et `catalogue:ko:3870`,
`catalogue:ko:1433`, `catalogue:ko:4193` reçoivent
`ha-ma-to-myon keun-nil nal ppon-hè-sso-yo`. Leurs lignes citent l'événement
source et l'événement d'erratum. Aucun de ces cinq cas ne reste en attente.

Les 69 suggestions `notApplied` ne sont jamais exécutées. Trois de ces cartes
reçoivent uniquement leur glose approuvée dans la couche de contenu précédente :
`situation-authored:fr-ko:invitations-limites-04`,
`situation-authored:fr-ko:piste-repondre-objection-08`, et
`heard-authored:fr-ko:piste-cours-aide-received-02`. Leurs aides restent inchangées.
Le registre protège les objets complets des 69 exclusions et des trois décisions remplacées,
soit 72 identités et 78 occurrences.

`overlapMatrix` détaille les 66 identités communes avec le contenu (62 événements
source et quatre ajouts). `sourceBeforeMismatchesBeforeContent` est vide : les
2 099 ancres et champs fournis par les preuves concordent avec la base
`13f42b5`. `sourceBeforeMismatchesAfterContent` énumère les 61 événements dont
un champ fourni change légitimement après le contenu. Les nouveaux instantanés
vérifient strictement les tuples approuvés, leur provenance et toutes les anciennes
annotations. Le hash de l'objet entier protège aussi les champs de niveau, type,
placement et toute métadonnée absente de l'instantané lisible.

Seuls `phon`, `phoneticReviewStatus` et `conventionCorrection` peuvent changer.
Les sorties sont produites en mémoire ; les modèles reçus et copies de transport
sont contrôlés à leur adresse exacte. Une seconde application doit restituer les
mêmes octets. Aucune règle du convertisseur n'est exécutée ou étendue. Aucune
validation native ou phonétique globale n'est déclarée.

`verification-producteur.json` conserve les compteurs et résultats du contrôle
avant/après en mémoire, y compris l'idempotence et la préservation de tous les
autres champs. Le registre et ses deux preuves sont épinglés par SHA-256 dans le
producteur, ainsi que les preuves des deux errata officiels. Aucun des trois
recouvrements résolus par cet erratum ne reste en attente.
