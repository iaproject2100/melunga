# Mesures de longueur après reclassement — suivi indépendant

La [seconde relecture de Claude](verification-claude-corrigee.md) retire les griefs fondés sur les marches de longueur en italien, anglais et coréen. Ce relevé reste une annexe descriptive ; la demande actuelle porte sur la [nouveauté écrite](nouveaute.md) en fr→es et zh→fr.

Périmètre figé : `99478df`, comparé aux niveaux source de `bcd108d`. Les phrases et leurs aides sont relues contre Git ; aucun fichier canonique ou plan n’est modifié par cet outil.

**La longueur ne mesure ni la difficulté grammaticale, ni la préparation lexicale, ni les acquis.** Les différences ci-dessous servent à expliquer le lot, pas à obtenir une courbe artificiellement croissante.

## Formule et arrondi

Chaque variante entière compte une fois. Pour en/es/it/fr, les groupes Unicode `\w+` sont comptés : une apostrophe sépare des tokens. Pour zh/ja/ko, les caractères de catégorie Unicode lettre/nombre sont comptés, sans espaces ni ponctuation. Le stock ne contient pas de chiffres dans les variantes latines ; compter seulement les groupes de lettres donne donc les mêmes résultats sur ce corpus.

- Moyennes exactes non arrondies : **21 → 17** inversions, avec 3 nouvelles et 7 supprimées.
- Comparaison après arrondi mathématique au dixième (`ROUND_HALF_UP`) : **21 → 16**, avec 3 nouvelles et 8 supprimées.
- L’écart vient de fr→ko L2 = **7,0625** et L3 = **7,05** : 7,0625 > 7,05 exactement, mais les deux deviennent 7,1 avec l’arrondi indiqué. Le seuil/arrondi de la revue n’étant pas explicité, les deux résultats sont conservés.
- Le tableau de la revue fait aussi apparaître **fr→zh L8>L9**, nouvelle par rapport à sa liste source. Les deux marches demandées en en/ko sont examinées sans écarter celle-ci.

## Comparaison des inversions

| Couple | Avant, moyennes exactes | Après, moyennes exactes | Créées | Après arrondi au dixième |
| --- | --- | --- | --- | --- |
| fr-en | L4>L5 · L7>L8 · L8>L9 | L4>L5 · L6>L7 · L8>L9 | L6>L7 | L4>L5 · L6>L7 · L8>L9 |
| fr-es | L2>L3 · L4>L5 · L7>L8 · L8>L9 | L2>L3 · L4>L5 · L7>L8 · L8>L9 | — | L2>L3 · L4>L5 · L7>L8 · L8>L9 |
| fr-it | L2>L3 · L4>L5 · L7>L8 · L9>L10 | L2>L3 · L4>L5 · L7>L8 · L9>L10 | — | L2>L3 · L4>L5 · L7>L8 · L9>L10 |
| fr-zh | L3>L4 · L7>L8 | L8>L9 | L8>L9 | L8>L9 |
| fr-ja | L2>L3 · L7>L8 | L2>L3 | — | L2>L3 |
| fr-ko | L2>L3 · L7>L8 · L8>L9 | L2>L3 · L5>L6 · L8>L9 | L5>L6 | L5>L6 · L8>L9 |
| zh-fr | L2>L3 · L4>L5 · L7>L8 | L2>L3 | — | L2>L3 |

## Moyennes L6, L7, L8

| Couple | Sources L6 → L7 → L8 | Proposé L6 → L7 → L8 |
| --- | --- | --- |
| fr-en | 7.0000 → 8.3750 → 7.9375 | 7.9167 → 7.5962 → 8.6786 |
| fr-es | 5.2500 → 6.7308 → 5.8269 | 5.4000 → 6.7917 → 6.1875 |
| fr-it | 5.3958 → 6.4167 → 5.8750 | 5.3214 → 6.2500 → 6.1000 |
| fr-zh | 7.7955 → 9.6364 → 9.1591 | 7.9231 → 8.4792 → 10.3000 |
| fr-ja | 11.2292 → 13.9375 → 12.9167 | 11.6667 → 11.9545 → 14.9583 |
| fr-ko | 8.7917 → 12.5417 → 11.4792 | 8.7917 → 10.6136 → 12.4615 |
| zh-fr | 5.6042 → 8.1458 → 7.5833 | 6.0000 → 7.5833 → 8.4167 |

## Contributions des unités

Le JSON joint donne pour es/it L2–L4 et L6–L8, en L6–L7, ko L5–L6 et zh L8–L9 : unités entrantes/sortantes/conservées, quatre longueurs, moyenne exacte, exemple étudié et sens source, raison de placement et réserves. Quand les quatre variantes reconstruisent le cadre source, les longueurs du cadre fixe et du groupe sont aussi distinguées. Cette décomposition est textuelle, pas une analyse de difficulté grammaticale.

841 unités et 11488 champs source conformes vérifiés. Les 70 fichiers sources actifs sont figés par leurs empreintes. Les 40 fichiers de réserve restent hors de ces calculs ; la garde de corpus générale les contrôle séparément.

Les analyses par langue doivent justifier les placements par les constructions et leurs prérequis, et signaler ce que la mesure ne résout pas. Ces statistiques ne justifient ni de remonter une formule utile seulement parce qu’elle est courte, ni de descendre un récit complexe pour aplanir L7.

## Candidat fourni séparément

Un candidat supplémentaire a été mesuré sans remplacer les résultats figés ci-dessus. Son empreinte figure dans le JSON. Les différences restent des longueurs descriptives, pas des scores de difficulté.

| Couple | Inversions dans `99478df`, moyennes exactes | Inversions du candidat, moyennes exactes | Candidat L6 → L7 → L8 |
| --- | --- | --- | --- |
| fr-en | L4>L5 · L6>L7 · L8>L9 | L4>L5 · L6>L7 · L8>L9 | 7.9167 → 7.5962 → 8.6786 |
| fr-es | L2>L3 · L4>L5 · L7>L8 · L8>L9 | L2>L3 · L4>L5 · L7>L8 · L8>L9 | 5.4000 → 6.7917 → 6.1875 |
| fr-it | L2>L3 · L4>L5 · L7>L8 · L9>L10 | L2>L3 · L4>L5 · L7>L8 · L9>L10 | 5.3214 → 6.2500 → 6.1000 |
| fr-zh | L8>L9 | L8>L9 | 7.9231 → 8.4792 → 10.3000 |
| fr-ja | L2>L3 | L2>L3 | 11.6667 → 11.9545 → 14.9583 |
| fr-ko | L2>L3 · L5>L6 · L8>L9 | L2>L3 · L5>L6 · L8>L9 | 8.7917 → 10.6136 → 12.4615 |
| zh-fr | L2>L3 | L2>L3 | 6.0000 → 7.5833 → 8.4167 |

Totaux du candidat : 17 inversions sur moyennes exactes ; 16 après arrondi mathématique au dixième. Aucune suppression ou création ne constitue à elle seule une validation pédagogique.
