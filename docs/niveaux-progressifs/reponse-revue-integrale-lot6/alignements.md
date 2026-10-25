# Contre-vérification ciblée — aides et lectures du lot 6

Les **18 aides entières et 5 lectures liées** sont recevables comme événements figés. Leur avant correspond exactement au corpus de `161d0ebef38bb38ea9e26a836ca701b9d136f6d2`. Cette contrelecture valide leur raccord ciblé ; elle n'adopte aucune nouvelle convention générale du coréen.

Les preuves proviennent de `87357b16c7d77a1c94fdbd940dcb3f232758748d`. Le script [reproduire-alignements.py](reproduire-alignements.py) lit les preuves et le corpus avant directement dans Git, sans importer le générateur. Il vérifie les 77 JSON de leçons et répertoires pour retrouver toutes les occurrences des identifiants concernés. Les chaînes entières avant/après et les positions figurent dans [alignements.json](alignements.json).

## Périmètre et conservation

| Contrôle | Résultat |
| --- | ---: |
| Aides entières | 18 |
| R : romanisation laissée dans l'aide | 12 |
| S : consonne ou syllabe perdue/ajoutée | 6 |
| Lectures liées à appliquer avec leur aide | 5 |
| Objets canoniques concernés | 17 |
| Modèle reçu concerné | 1 |
| Copies de transport concernées | 0 |
| Avant différents du snapshot | 0 |
| Après différents des événements autorisés | 0 |
| Événement faisant suite à un lot antérieur | 1 |

La chaîne antérieure est `catalogue:ko:3980` : l'avant de Claude est bien `dak-eul toui-guyo-sso-yo`, après le remplacement ciblé `gyo → guyo` du lot 2, et non la valeur originale du catalogue. La provenance du premier événement doit rester jointe quand le second corrige `dak-eul → dal-gueul`.

## Lecture linguistique ciblée

- `eo → o` dans les deux répliques L1 supprime les lettres de romanisation que le lecteur francophone pourrait prononcer séparément. `hyu → hyou` dans les quatre occurrences de 휴 rend la voyelle /ju/ avec les lettres françaises attendues. Le reste de chaque aide est conservé.
- Les six aides contenant 앉 changent uniquement le segment laissé en `anj-` : `an-dja`, `an-djeul` ou `an-djeu` selon la voyelle suivante. Ces événements nommés ne constituent pas une règle automatique appliquée aux autres batchim.
- Pour les trois 닭, le `reading` reste une translittération orthographique (`dalg-eul`, `dalg-i`), tandis que l'aide rend la liaison (`dal-gueul`, `dal-gui`). Les deux champs changent ensemble ; conserver l'ancien `dak-` dans l'un d'eux ferait perdre le ㄹ.
- ABS et ASTM retrouvent la syllabe de 에스 dans leur aide. La lecture ABS est corrigée en même temps ; la lecture ASTM est conservée telle que fournie, sans étendre l'événement à un autre champ non autorisé.
- QR garde 큐알, sans la syllabe supplémentaire `reul` après le sigle. Lecture et aide changent ensemble ; le `reul` appartenant à 코드를 reste présent.

Le motif de la lecture de `catalogue:ko:4125` reprend par erreur l'exemple `[달글]` d'une carte en 을. Sa valeur après est bien `dalg-i` et son aide `dal-gui`, conformes à 닭이 `[달기]`. Il s'agit d'une coquille dans la justification de la preuve, pas d'une valeur à corriger dans le contenu ; la preuve originale reste intacte.

## Conventions laissées ouvertes

Les **260 lignes**, soit **259 identifiants distincts**, restent des décisions à prendre par Kartech. Toutes portent `stage: snapshot-161d0eb` et leurs avant sont exacts dans ce snapshot. Elles n'ont aucun identifiant commun avec les 18 événements raccordés.

| Groupe déclaré par Claude | Lignes |
| --- | ---: |
| Batchim orthographique | 115 |
| Nasalisations et assimilations | 53 |
| Consonnes, surtout dans les situations | 66 |
| Aspiration | 13 |
| Autres aides | 10 |
| 의 et 희 | 3 |

Les intitulés sont ceux du dossier de Claude, pas une taxonomie phonologique exclusive : certains motifs se retrouvent dans plusieurs groupes. Les 32 lignes marquées `readerCertainty: certain` ne deviennent pas des événements appliqués ; les 228 autres restent également ouvertes. Parmi les 260, 259 portent `phon` et une porte `reading` (`catalogue:ko:3792`). Cette distinction évite de vérifier une lecture contre l'aide française.

Le modèle reçu `heard-authored:fr-ko:piste-trouver-gare-received-01` porte deux observations sur la même aide : 쭉 et la tension dans 가실 거예요. Elles expliquent l'écart entre 260 lignes et 259 identifiants. Elles ne sont pas deux remplacements entiers à appliquer successivement : après décision, un éventuel après devra réunir les segments retenus sans effacer l'autre.

## Reproduction et limites

```sh
python3 -B docs/niveaux-progressifs/reponse-revue-integrale-lot6/reproduire-alignements.py
python3 -B docs/niveaux-progressifs/reponse-revue-integrale-lot6/reproduire-alignements.py --runtime
```

La première commande vérifie le dossier figé et les avant. La seconde ajoute les après des fichiers générés, la conservation des sources, de la provenance antérieure et des 260 conventions. Le champ `runtimeChecked` du JSON indique laquelle a produit le rapport.

Le rapport joint a été produit avec `--runtime` : les 18 aides et les 5 lectures après sont exactes, l'événement antérieur de `catalogue:ko:3980` et les sources restent intacts, et aucune des 260 conventions n'a été appliquée.

Ce travail ne répète pas la lecture individuelle des 4 770 positions effectuée par Claude. Il ne constitue ni une validation par locuteur natif, ni une écoute de synthèse vocale, ni un parcours dans le navigateur hébergé.
