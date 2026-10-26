# Contenu incertain : 783 propositions tranchées, 638 corrections retenues

Référence : `13f42b5`. Source : les propositions incertaines des lots 3 à 9 (`lot-contenu-gloses.json`, items dont la certitude n'est pas « certain »). Aucun fichier de l'application n'est modifié.

## Méthode

1. **Tri.** Pour chaque couple, un éditeur a tranché chaque proposition entre `appliquer` et `écarter`. La consigne était stricte : appliquer seulement si la carte devient nettement plus juste, plus fidèle ou plus naturelle, et écarter en cas de doute. Quand une proposition change l'étude, l'aide, la lecture et la glose sont réécrites ensemble selon les conventions du L1 du couple. Si l'aide n'est pas sûre, la carte est écartée « à reprendre avec un natif ».
2. **Contre-vérification.** Un relecteur indépendant a relu toutes les corrections retenues. Il en a corrigé 20 et refusé 1. J'ai écarté une seule de ses remarques : écrire 品 `binn`, alors que le *p* du pinyin est aspiré.

## Résultat

| Couple | Gloses | Blocs (étude + aide ± lecture ± glose) | Écartées |
|---|---:|---:|---:|
| fr-zh | 56 | 7 | 11 |
| zh-fr | 63 | 21 | 20 |
| fr-ja | 103 | 18 | 26 |
| fr-ko | 97 | 27 | 24 |
| fr-en | 41 | 31 | 23 |
| fr-es | 59 | 36 | 24 |
| fr-it | 59 | 20 | 17 |
| **Total** | **478** | **160** | **145** |

## Ce qui est corrigé

**Gloses.** Elles corrigent surtout :
- des sens partiellement faux, comme *Infatti* rendu « En fait » au lieu de « En effet », *scarica* rendu « faible » au lieu de « à plat », 賞味期限 ou *청구서를 내다* ;
- des nuances perdues ou ajoutées ;
- des pronoms ou des temps oubliés ;
- des maximes à moitié traduites ;
- le tutoiement ou le vouvoiement, seulement quand l'étude a une marque nette (honorifique, *Lei*, *usted*).

**Blocs.** Ils corrigent :
- des calques : *Ne sa una più del diavolo*, *Colpa mia*, *entiendo tu postura*, *HS code* ;
- des ¡ ! manquants ;
- des articles ou des compléments absents ;
- une annotation lue comme partie de l'étude, （女性） ;
- des registres mélangés.

Les écartées sont des questions de goût, des variantes correctes ou des propositions elles-mêmes fausses. Une vingtaine sont marquées « à reprendre avec un natif ».

## Format

Le registre est [`registre-contenu.json`](registre-contenu.json). Il contient 638 événements, chacun avec :
- le couple, l'identifiant et le niveau ;
- `kind` : `glose` ou `bloc` ;
- les champs touchés, leurs valeurs avant et après ;
- le motif et la position.

Un bloc est atomique : son étude, son aide, sa lecture et sa glose s'appliquent ensemble.

Rien n'est fusionné dans `main` ni publié sur melunga.com.
