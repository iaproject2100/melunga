# Classement fr-en : 689 propositions tranchées

Référence : `13f42b5`. Source : `docs/revue-integrale/lot7-fr-en-L1-L10/propositions-niveaux-themes.json`, soit 689 propositions sur 672 identifiants. Aucun fichier de l'application n'est modifié.

## Décisions de Kartech (26 octobre 2026)

- **Changements de niveau acceptés.** Une carte change de niveau quand aucun thème de son niveau ne lui convient et qu'un thème clair existe à un autre niveau. C'est surtout le cas des cartes de L4 qui ne racontent rien, renvoyées en L2 ou L3.
- **Doublons à la ponctuation ou à l'article près.** Une seule variante reste présentée ; l'autre passe en réserve et rien n'est supprimé.
- **Trois nouveaux thèmes et un renommage :**

| Thème | Niveau | Titre | Cartes |
|---|---|---|---:|
| `L3-sante` (nouveau) | L3 | Santé : demander une aide médicale | 3 |
| `L5-cuisine-recette` (nouveau) | L5 | Cuisine : suivre une recette | 3 |
| `L9-telephone` (nouveau) | L9 | Téléphone : accueillir, filtrer et faire patienter | 3 |
| `L9-saluer` (renommé) | L9 | Remercier et s'excuser en registre soutenu | 9 gardées + 2 ajoutées |

## Résultat : une opération par carte

Les opérations sont dans [`registre-classement.json`](registre-classement.json).

| Opération | Cartes |
|---|---:|
| `move` (déplacement) | 610, dont 127 changements de niveau et 9 vers les nouveaux thèmes |
| `to-reserve` (doublons et 5 cartes sans place) | 37 |
| `keep` (signalement écarté ou carte gardée) | 23 |
| **Total** | **670 identifiants** |

Il y a 670 identifiants et non 672 : les deux cartes des paires de doublons signalées deux fois ne comptent qu'une fois. Chaque opération donne :
- les propositions d'origine (`proposals`) ;
- l'emplacement attendu avant changement (`expectedBefore` : niveau, thème, chemin, position, étude) ;
- la destination (`toLevel`, `toTheme`) ;
- le motif.

**Les fourre-tout vidés.** Les thèmes `conversation` et `vocab-actions` rendent les cartes qui n'accomplissent pas leur objectif :
- les phrases de négoce vont vers `travail` ;
- les gestes vont vers `vocab-actions` ;
- les mots de voyage vont vers `vocab-voyage`.

**Quatre conflits** opposaient deux propositions sur une même carte :

| Carte | Résolution |
|---|---|
| 1065 | doublon en réserve |
| 1198 | doublon en réserve |
| 1714 et 1715 (*He has blue eyes*, *He has brown hair*) | L2-vocab-personnes, description élémentaire |

## Méthode

1. Quatre trieurs ont relu chaque proposition avec l'étude, la glose, le thème actuel et la liste des thèmes du couple, puis ont décidé.
2. J'ai repris chaque destination : chaque thème existe au niveau indiqué, sauf les trois nouveaux thèmes. J'ai aussi tranché les 16 cas douteux qui ne demandaient pas de nouveau thème.
3. J'ai relu à la main un échantillon de 30 déplacements.

## Reste à traiter dans le lot de contenu

Kartech n'a pas encore décidé de ce point. *Kind regards.* et *Best regards.* sont présentés avec un point ; l'usage correct en fin de courriel est la virgule, et les variantes avec virgule sont déjà en réserve.

Rien n'est fusionné dans `main` ni publié sur melunga.com.
