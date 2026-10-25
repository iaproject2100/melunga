# Message pour Codex — lot 6 : fr-ko L1 à L10

Codex — la lecture individuelle du coréen pour francophones est terminée : L1 à L10, réserves comprises, et les 36 modèles reçus, soit **4 770 positions, 4 766 identifiants distincts**. Chaque position a un statut dans `couverture.json`. Couverture individuelle : **40 cellules sur 70**. Référence des avant : `161d0eb`. Le correctif de `catalogue:ja:833` est dans `45cebbd`.

## À raccorder

- `registre-phonetique.json` : **18 aides entières**.
  - Règle R, 12 aides : lettres de romanisation laissées dans l'aide (`eo`, `anj-`, `hyu`).
  - Règle S, 6 aides : syllabe ou consonne perdue ou ajoutée (닭, ABS, ASTM, QR).
- `registre-lectures.json` : **5 lectures liées** (닭 ×3, ABS, QR). Pour 닭, l'après suit l'orthographe du champ `reading` : `dalg-eul`.

N'y figurent que les écarts par rapport aux conventions du deck elles-mêmes, L1 compris, ou les ajouts et pertes de syllabe.

## Une décision d'ensemble, pas un raccord

L'aide coréenne écrit le plus souvent le batchim selon l'orthographe et non selon la prononciation : `mat-a-yo`, `gat-i`, `kkoch`, `myoch`, `yo-dolb`. Les nasalisations ne sont pas rendues non plus. Le L1 du deck suit lui-même ces choix. `conventions-a-decider.json` en regroupe **260 lignes** :
- 115 sur le batchim ;
- 53 sur les nasalisations ;
- 66 sur ㅈ, ㅉ et ㅊ dans les cartes de situation ;
- 13 sur l'aspiration ;
- 13 autres.

Chaque ligne porte un champ `stage`. Je recommande d'écrire la prononciation (`ma-dja-yo`, `ga-tchi`, `kkot`), mais cela touche des centaines d'aides : la décision revient à Kartech. Je n'ai rien appliqué.

## Séparé du raccord

- `lot-contenu-gloses.json` : **45 gloses certaines**, 148 propositions et 2 blocs à appliquer en entier : 경우에요 → 경우예요, et 모두 것을 → 모두의 것을, chacun avec étude, lecture et aide.
  - Six 한국어 sont traduits par « français ».
  - 만 원 est traduit par « dix euros ». En fr-ja, 千円 était déjà traduit par « dix euros » ; je l'avais classé incertain, il est à réexaminer.
  - Autres erreurs : 엉덩이 traduit par « la hanche », 건강하세요 par « À vos souhaits », et 18 tutoiements face à un honorifique net.
- `propositions-niveaux-themes.json` : **447 propositions**, non appliquées.
  - 327 thèmes : 239 destinations existent au même niveau, 88 sont à `null`.
  - 89 doublons et 31 niveaux.
  - Au L5, « Se mettre d'accord » regroupe à lui seul l'essentiel de la cellule.

## Contre-vérification

Un vérificateur indépendant a confirmé les 18 aides. J'ai intégré ses remarques :
- 2076 et 2177 déclassés ;
- lectures de 닭 alignées sur l'orthographe ;
- `eui` gardé dans 모두의 ;
- quatre formulations ajustées.

Pas de fusion dans `main`, pas de publication sur melunga.com.

**Suite** : les trois couples latins (fr-en, fr-es, fr-it).
