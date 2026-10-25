# Lot 6 — fr-ko L1 à L10 lus carte par carte, et modèles reçus

Référence : `161d0eb`, branche `review/themes-niveaux-progressifs`, lots 3 à 5 compris. Aucun fichier de l'application n'est modifié.

## Couverture : 4 770 positions, chacune avec un statut

| Partie | Positions |
|---|---:|
| fr-ko L1 à L10, `themes[].phrases` et `reserve[]` | 4 734 |
| `receivedModels` du répertoire fr-ko | 36 |
| **Total relu** | **4 770 positions, 4 766 identifiants distincts** |

La preuve est [`couverture.json`](couverture.json) : la liste de lecture de chaque partie a été comparée, dans l'ordre, à celle du fichier source, sans écart.

| Statut | Positions |
|---|---:|
| `verifie` | 3 916 |
| `corrige` | 18 |
| `glose-a-corriger` | 47 |
| `proposition` | 424 |
| `incertain` | 365 |

Le statut `glose-a-corriger` couvre 45 gloses et les 2 blocs. Le statut `corrige` désigne une aide corrigée dans le registre ; une même carte peut aussi recevoir une correction de lecture.

**Cellules désormais lues individuellement : 40 sur 70.**

## Une décision d'ensemble à prendre : le batchim écrit selon l'orthographe

En coréen, la consonne finale d'une syllabe (le batchim) change souvent de prononciation selon ce qui suit. L'aide du deck l'écrit le plus souvent telle qu'elle s'orthographie :

| Mot | Aide actuelle | Prononciation |
|---|---|---|
| 맞아요 | `mat-a-yo` | [ma-ja-yo] |
| 같이 | `gat-i` | [ga-chi] |
| 꽃 | `kkoch` | [kkot] ; un francophone lit « che » |
| 몇 | `myoch` | [myot] |
| 여덟 | `yo-dolb` | [yeo-deol] ; le *b* final est muet |

S'y ajoutent les nasalisations : 입력 se dit [im-nyeok].

Ces graphies font lire un autre son. Mais le **L1 du deck les emploie lui-même**. Les corriger carte par carte serait un arbitrage silencieux sur une convention, ce que Codex a demandé d'éviter. Elles sont donc toutes dans [`conventions-a-decider.json`](conventions-a-decider.json) :
- 115 lignes pour le batchim orthographique ;
- 53 pour les nasalisations et assimilations ;
- 66 pour les consonnes ㅈ, ㅉ et ㅊ, surtout dans les cartes de situation, qui suivent une autre convention ;
- 13 pour l'aspiration.

**Ma recommandation est d'écrire la prononciation.** Le principe du projet est que l'apprenant lise l'aide avec la phonétique de sa langue maternelle : `ma-dja-yo`, `ga-tchi`, `kkot`. Mais cette décision change des centaines d'aides et revient à Kartech. Mes propres consignes donnaient 같이 → `ga-tchi` en exemple d'erreur. Je l'ai pourtant classé en convention, parce que le mécanisme est le même que pour `mat-a-yo` du L1.

## Registres : 18 aides et 5 lectures, des écarts certains

[`registre-phonetique.json`](registre-phonetique.json) et [`registre-lectures.json`](registre-lectures.json). Seules sont retenues les graphies qui s'écartent des conventions du deck, L1 compris, ou qui ajoutent ou suppriment une syllabe.

| Règle | Défaut | Aides |
|---|---|---:|
| R | lettres de romanisation laissées dans l'aide : `djeo`, `keo` (eo), `anj-` (alors que le L1 écrit `an-djeul`), `hyu` (alors que les cartes de situation écrivent `you`) | 12 |
| S | syllabe ou consonne perdue ou ajoutée : 닭 qui perd son ㄹ, 스 d'ABS et d'ASTM, « reul » ajouté après QR | 6 |

Les lectures de 닭, ABS et QR sont corrigées en même temps. Pour 닭, l'après suit l'orthographe, comme le reste du champ : `dalg-eul`.

Une remarque d'un lecteur a été écartée : `kho-pi`. Dans les cartes de situation, `kh`, `ph` et `th` notent l'aspiration de façon cohérente ; ce n'est pas une faute de frappe.

## Lot de contenu séparé : 45 gloses certaines, 2 blocs, 148 propositions

[`lot-contenu-gloses.json`](lot-contenu-gloses.json).

- **한국어 est traduit « français » dans six cartes**, la même famille que 日本語 en fr-ja. Une recherche sur tout le couple n'en trouve pas d'autre.
- **만 원 est traduit « dix euros »** au lieu de « dix mille wons ». En fr-ja, 千円 est rendu de la même façon : je l'avais classé incertain, il mérite d'être réexaminé.
- **Faux sens** :
  - 엉덩이 (les fesses) rendu « la hanche » ;
  - 건강하세요 rendu « À vos souhaits » au lieu de « Portez-vous bien » ;
  - 생일을 축하해요 rendu « On fête ton anniversaire » au lieu de « Joyeux anniversaire » ;
  - 신호등 rendu « feu rouge » ;
  - 청하다 rendu « serrer la main » au lieu de « tendre la main » ;
  - 덧붙이다 rendu « nuancer » ;
  - « Il fait moins zéro ».
- **Tutoiement face à un honorifique net** (-(으)시-, 드리다) : 18 gloses. Ailleurs, le tutoiement relève d'une politique de registre.
- **Deux blocs**, où l'étude, la lecture et l'aide changent ensemble : 경우에요 corrigé en 경우예요, et 모두 것을 corrigé en 모두의 것을.

## Niveaux, thèmes et doublons : 447 propositions, aucune appliquée

[`propositions-niveaux-themes.json`](propositions-niveaux-themes.json).

**Thèmes : 327.** Les 239 destinations nommées existent toutes au même niveau. Les 88 « à contextualiser » valent `null`. Les thèmes `conversation` servent encore de fourre-tout :

| Thème | Cartes concernées |
|---|---:|
| L5 « Se mettre d'accord » | 56 |
| L8 | 53 |
| L6 | 28 |
| L9 « Répondre à une objection » | 22 |

Un lecteur note que, dans sa partie, 220 des 240 cartes du L5 sont rangées dans « Se mettre d'accord ». C'est le découpage de la cellule qui est en cause, pas quelques cartes isolées.

**Doublons : 89**, souvent la même phrase avec deux gloses différentes. **Niveaux : 31.**

## Limites

- La lecture a été faite en 19 parties parallèles, puis j'ai repris chaque constat certain.
- Un vérificateur indépendant a relu les 18 aides, les 5 lectures, les 47 gloses et les 2 blocs. J'ai intégré ses corrections : 2 gloses déclassées, les lectures de 닭 alignées sur l'orthographe, `eui` dans 모두의, et 4 formulations ajustées.
- Une écoute native reste nécessaire.
- Rien n'est fusionné dans `main` ni publié sur melunga.com.
