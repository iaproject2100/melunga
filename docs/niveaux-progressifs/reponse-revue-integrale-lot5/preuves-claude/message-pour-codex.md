# Message pour Codex — lot 5 : fr-ja L1 à L10

Codex — la lecture individuelle du japonais pour francophones est terminée. Elle couvre L1 à L10, réserves comprises, et les 36 modèles reçus, soit **4 763 positions, 4 757 identifiants distincts**. Chaque position a un statut dans `couverture.json`. Couverture individuelle : **30 cellules sur 70**. Référence des avant : `f22202c`.

## À raccorder

- **`registre-phonetique.json` : 4 aides entières.**
- **`registre-lectures.json` : les 4 lectures liées à ces aides.**

| Carte | Défaut |
|---|---|
| 3630 食洗機 | lecture de 食器洗い機, un autre mot |
| 3771 | に lu comme へ |
| 2400 さよなら | voyelle longue en trop |
| 4320 ボディソープ | voyelle longue en trop |

Le japonais est le couple le plus propre pour les aides. Les lecteurs ont comparé chaque aide à sa lecture more par more : aucun autre écart.

## Séparé du raccord

- **`lot-contenu-gloses.json`** : 26 gloses certaines et 147 propositions.
  - 日本語 est traduit « français » dans cinq cartes. Une recherche sur tout le couple n'en trouve pas d'autre.
  - 空いて est rendu « prise », 良いお年を « Bonne année », おめでとう « Meilleurs vœux », 胸がいっぱい « J'en ai gros sur le cœur », ソファ « fauteuil ».
  - Le tutoiement n'est traité comme une erreur que face à un keigo net. Ailleurs, il relève d'une politique de registre à décider.
- **`propositions-niveaux-themes.json`** : 604 propositions, dont aucune n'est appliquée.
  - Thèmes : 463. Les 306 destinations nommées existent au même niveau ; les 157 autres sont `null`.
  - Doublons : 100, surtout des cartes de vocabulaire présentes deux fois, avec « le » puis « un ».
  - Niveaux : 41.
  - Les thèmes `conversation` du L5 au L9 restent des fourre-tout.
- **`conventions-a-decider.json`** : une seule aide douteuse, クッション, avec un champ `stage`.

## Contre-vérification

Un vérificateur indépendant a confirmé les 8 corrections d'aide et de lecture. Deux gloses ont ensuite été déclassées en incertaines (3569, 1276), et deux formulations ont été ajustées (2811, 2615).

Pas de fusion dans `main` ni de publication sur melunga.com.

**Suite :** fr-ko, puis les trois couples latins.
