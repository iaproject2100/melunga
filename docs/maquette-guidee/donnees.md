# Données de la maquette thématique L1

Cette proposition conserve **les 2 134 cartes L1 du catalogue restauré**, sans dédoublonner les textes. Elle n’est pas publiée. Les thèmes organisent les cartes existantes ; ils ne changent ni leur niveau, ni les droits d’accès, ni les prix.

Les petites séquences contiennent au maximum cinq expressions. Un thème réunit toutes ses séquences : il ne se limite donc pas à deux ou trois phrases. Chaque expression est présentée entière avant son rappel. Les séquences ne prétendent pas partager un même invariant grammatical et ne constituent pas un dialogue fabriqué.

## Conservation des sources

| Couple | Cartes L1 source | Indices conservés | Champs comparés | Écarts |
|---|---:|---:|---:|---:|
| fr-en | 323 | 323 | 969 | 0 |
| fr-es | 289 | 289 | 867 | 0 |
| fr-it | 338 | 338 | 1014 | 0 |
| fr-zh | 314 | 314 | 1256 | 0 |
| fr-ja | 290 | 290 | 1160 | 0 |
| fr-ko | 287 | 287 | 1148 | 0 |
| zh-fr | 293 | 293 | 879 | 0 |
| **Total** | **2134** | **2134** | **7293** | **0** |

L’identité est l’indice d’origine, pas le texte. Les occurrences de texte identique restent présentes, y compris quand leur sens ou leur aide diffèrent. Chaque entrée porte l’empreinte de la carte source et la correspondance des champs. Le rapport JSON donne tous les indices par thème.

Le champ d’aide francophone est `pf` pour en/es/it/ja/ko et `phf` pour zh. Pour les sinophones étudiant le français, la traduction vient de `cn` et l’aide de `phon`. Les lectures `py` présentes pour zh/ja/ko sont recopiées, jamais transformées. Aucun champ vide n’est complété par un autre corpus.

## Volumes par thème

| Thème | fr-en | fr-es | fr-it | fr-zh | fr-ja | fr-ko | zh-fr |
|---|---:|---:|---:|---:|---:|---:|---:|
| Saluer et faire connaissance | 15 | 19 | 19 | 29 | 12 | 7 | 14 |
| Se comprendre et demander de l’aide | 13 | 9 | 13 | 15 | 13 | 13 | 11 |
| Besoins, envies et santé | 26 | 19 | 25 | 13 | 18 | 19 | 24 |
| Sortir, commander et acheter | 10 | 11 | 10 | 21 | 8 | 9 | 10 |
| Se déplacer et voyager | 33 | 18 | 32 | 40 | 19 | 21 | 22 |
| Temps et nombres | 57 | 70 | 49 | 66 | 52 | 52 | 47 |
| Chez soi et avec ses proches | 29 | 6 | 36 | 16 | 33 | 35 | 35 |
| Décrire et comparer | 81 | 35 | 79 | 34 | 69 | 73 | 74 |
| Faire vivre la conversation | 45 | 87 | 57 | 32 | 38 | 41 | 38 |
| Travail et échanges professionnels | 3 | 13 | 5 | 45 | 5 | 5 | 5 |
| À personnaliser | 11 | 2 | 13 | 3 | 23 | 12 | 13 |

## Limites éditoriales

Le regroupement s’appuie sur le sens français et les catégories de la source. L’ordre source est conservé à l’intérieur de chaque thème, afin de garder les formules de départ avant les extensions du catalogue. C’est un ordre éditorial révisable, pas une preuve d’acquisition ni une validation de difficulté.

Le thème professionnel reste optionnel et arrive à la fin. Les 45 cartes chinoises `cat: biz` y figurent toutes. Les modèles à trous sont conservés à part, dans « À personnaliser » ; leur présence n’est pas présentée comme un échange réussi. L’étendue du L1 historique comprend des mots, des expressions et des phrases complètes, d’où l’emploi du mot « expressions » dans l’interface.

Aucune phrase étudiée, traduction, lecture ou phonétique n’est écrite, harmonisée ou recomposée. Aucun niveau n’est modifié. Rien de cette maquette n’est branché dans les leçons publiées.

## Reproduction

```sh
python3 tools/maquette-guidee/build_data.py
python3 tools/maquette-guidee/build_data.py --check
```

Empreinte SHA-256 du fichier source : `891a622f45afbc561d924fb2f5f860f8dbff4ffb17541c03a8ef481def92ca96`.
