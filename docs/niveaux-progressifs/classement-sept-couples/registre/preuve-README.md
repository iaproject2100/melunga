# Classement des cartes dans les thèmes et les niveaux : les 7 couples

Référence : `13f42b5`. Aucun fichier de l'application n'est modifié : chaque couple a son registre `classement-<couple>/registre-classement.json`.

## Décisions de Kartech (26 octobre 2026)

1. **Changement de niveau.** Une carte change de niveau quand aucun thème de son niveau ne lui convient et qu'un thème clair existe à un autre niveau.
2. **Doublons.** Quand deux cartes ne diffèrent que par la ponctuation ou l'article, une seule reste présentée. L'autre passe en réserve ; rien n'est supprimé.
3. **Nouveaux thèmes validés :**
   - fr-en : `L3-sante`, `L5-cuisine-recette`, `L9-telephone` ;
   - fr-ja : `L9-telephone`, `L2-prevenir` ;
   - zh-fr : `L6-relations`, `L6-souhaits`, `L8-marqueurs-oraux` ;
   - fr-ko : `L5-situation-conduite`.
4. **`L9-saluer` renommé.** Partout où ce thème garde au moins 3 cartes, son titre devient « Remercier et s'excuser en registre soutenu ». Les formules de politesse soutenues restent en L9 ; le nom technique ne change pas.
5. **Thèmes presque vides masqués.** Un thème qui avait au moins 3 cartes et n'en garde que 0 à 2 après le rangement est masqué ; ses cartes restantes passent en réserve. Ce sont surtout des fourre-tout de L9 et L10. Ils pourront revenir avec de vraies cartes.

## Résultat

| Couple | Cartes | Déplacées | dont changement de niveau | En réserve | Gardées | Nouveaux thèmes | Thèmes masqués |
|---|---:|---:|---:|---:|---:|---|---:|
| fr-en | 670 | 610 | 127 | 37 | 23 | L3-sante, L5-cuisine-recette, L9-telephone | 7 |
| fr-es | 308 | 302 | 33 | 5 | 1 | — | 5 |
| fr-it | 278 | 224 | 61 | 48 | 6 | — | 2 |
| fr-zh | 340 | 337 | 131 | 2 | 1 | — | 2 |
| zh-fr | 300 | 264 | 63 | 30 | 6 | L6-souhaits, L6-relations, L8-marqueurs-oraux | 3 |
| fr-ja | 580 | 470 | 121 | 101 | 9 | L2-prevenir, L9-telephone | 5 |
| fr-ko | 430 | 325 | 86 | 95 | 10 | L5-situation-conduite | 5 |
| **Total** | **2906** | **2532** | **622** | **318** | **56** | 9 | **29** |

## Ce que contient chaque opération

Chaque opération porte :
- les propositions d'origine (`proposals`) ;
- l'emplacement attendu avant changement (`expectedBefore` : niveau, thème, chemin, position, étude) ;
- la destination (`toLevel`, `toTheme`, avec `newTheme` pour un nouveau thème) ;
- le motif.

Les registres listent aussi :
- `newThemes` : identifiant, niveau, titre et nombre de cartes ;
- `renameThemes` ;
- `hideThemes` : le thème et les cartes qui en restent, à mettre en réserve.

## Méthode

1. Pour chaque couple, des trieurs ont relu chaque proposition avec l'étude, la glose, le thème actuel et la liste des thèmes, puis ont décidé en appliquant les règles de Kartech.
2. J'ai repris toutes les destinations. Chaque thème cité existe au niveau indiqué, à l'exception des nouveaux thèmes validés.
3. J'ai résolu les conflits, c'est-à-dire deux propositions contradictoires sur une même carte. Les doublons l'emportent ; une description élémentaire descend en L2.
4. Si la même phrase est déjà présentée au niveau d'arrivée, la carte passe en réserve au lieu de créer un doublon.
5. J'ai harmonisé `L9-saluer` dans tous les couples. Les tris coréens envoyaient ses formules en L10 : elles restent en L9.
6. J'ai calculé la taille de chaque thème après rangement pour repérer les thèmes presque vides.

## Points à surveiller au raccord

- **Thèmes qui grossissent fortement.** Les thèmes `travail` de L6 à L8 grossissent beaucoup, par exemple fr-es L8-travail passe de 53 à environ 188 cartes. Ce sont les phrases de négoce sorties des fourre-tout. Il faudra peut-être les découper en séquences.
- **fr-ja `L2-prevenir`** n'a que 2 cartes déplacées. 気をつけて！ et 心配しないで, déjà en L2, pourraient l'enrichir ; c'est une décision éditoriale.
- Les valeurs `expectedBefore` sont celles de `13f42b5` : il faut les confronter au contenu courant avant d'appliquer.

Rien n'est fusionné dans `main` ni publié sur melunga.com.
