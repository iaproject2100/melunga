# Convention coréenne : l'aide écrit la prononciation

**Décision de Kartech (26 octobre 2026).** L'aide n'écrit plus le batchim selon l'orthographe, mais selon la prononciation réelle.

| Mot | Avant | Après |
|---|---|---|
| 맞아요 | `mat-a-yo` | `ma-dja-yo` |
| 같이 | `gat-i` | `ga-tchi` |
| 몇 | `myoch` | `myot` |
| 감사합니다 | `gam-sa-hap-ni-da` | `gam-sa-ham-ni-da` |
| 필요해요 | `pil-yo-hè-yo` | `pi-ryo-hè-yo` |
| 괜찮아요 | `gouèn-tchan-a-yo` | `gouèn-tcha-na-yo` |
| 어떻게 | `o-tto-gué` | `o-tto-ké` |

## Méthode

Un convertisseur part du hangeul. Il applique les règles standard à l'intérieur de chaque mot :
- liaison, groupes doubles compris ;
- ㄹ entre voyelles rendu `r` ;
- chute du ㅎ, et aspiration avec ㅎ (ㅈ+ㅎ → ㅊ, ㄷ+히 → ㅊ) ;
- neutralisation des finales ;
- nasalisation, latéralisation et palatalisation ;
- insertion de ㄴ, limitée à une liste fermée de mots (역, 별일, 색연필…) ;
- tension après k/t/p.

Il rend ensuite le résultat avec les conventions de l'aide du deck. **Seuls les mots dont la prononciation diffère de l'aide actuelle sont réécrits.** La variante de consonne initiale du deck (g/k, d/t, b/p, dj/tch) est conservée. Rien n'est appliqué entre deux mots.

Un relecteur indépendant a vérifié trois échantillons, de 150, 150 et 130 cartes. Chaque erreur systématique qu'il a relevée a été corrigée dans le convertisseur avant de régénérer :
- liaison de ㄴ et de ㅁ manquante ;
- aspiration ㅎ+ㄱ manquante ;
- ㅈ+ㅎ rendu ㅌ au lieu de ㅊ ;
- « s devant i → ch » perdu après la tension ;
- insertion de ㄴ.

Une limite est assumée : la tension après ㄹ dans les mots sino-coréens (솔직히 [솔찌키]) n'est pas écrite.

## Résultat

Le registre est [`registre-batchim.json`](registre-batchim.json).

- **`events` : 1 989 aides entières**, chacune figée avant et après, avec la liste des mots changés.
- **`notApplied` : 69 cartes** à reprendre à part, avec une suggestion de prononciation. Ce sont 63 cartes de situation qui suivent une autre convention (`kh`, `ph`, `th`…) et 6 cartes dont les mots ne s'alignent pas.
- **`afterContentRegister` : 21 blocs** du registre de contenu incertain, dont la nouvelle aide reçoit la même règle. Il faut appliquer le bloc d'abord, puis l'aide `afterBatchim`.

Le convertisseur est dans [`outils/`](outils/).

Référence : `13f42b5`. Rien n'est fusionné dans `main` ni publié sur melunga.com.
