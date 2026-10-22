# Chinois : inventaire avant décision phonétique, règle par règle

Lecture de `cb3e22d`. Aucune phonétique, phrase, source, application, limite d’accès ou progression n’est modifiée. Les données exactes et leurs localisateurs figurent dans [chinois-regles.json](chinois-regles.json). Ce document prépare une relecture ; il n’en constitue pas la validation native.

## Le champ du lecteur doit être choisi avant toute comparaison

`phonOf` choisit `pf` pour un lecteur francophone étudiant en/es/it/ja/ko, et `phf` pour zh. Le secours `py` existe dans le code, mais aucun enregistrement des six decks n’en a besoin ici. Pour le chinois, le bouton pinyin est un choix explicite et affiche `py` ; ce champ ne doit pas être pris pour l’approximation francophone. Le français étudié par un sinophone utilise `phon` : c’est une autre direction, hors du présent inventaire.

| Langue étudiée | Champ francophone par défaut | Cartes / valeurs non vides | Secours `py` nécessaire |
| --- | --- | ---: | ---: |
| en | `pf` | 4502 / 4502 | 0 |
| es | `pf` | 4672 / 4672 | 0 |
| it | `pf` | 4509 / 4509 | 0 |
| ja | `pf` | 4509 / 4509 | 0 |
| ko | `pf` | 4520 / 4520 | 0 |
| zh | `phf` | 4903 / 4903 | 0 |

La concordance de `Gracias.` sur un exemple et le retrait d’une comparaison faite sur `py` corrigent un faux écart de champ. Ils ne démontrent pas à eux seuls que tous les énoncés espagnols coïncident. Inversement, des écarts de casse, tirets ou graphie ne prouvent pas automatiquement des conventions phonologiques opposées. Aucun inventaire urgent ni harmonisation des cinq autres langues n’est lancé ici.

## Périmètre et règles de comptage

Catalogue : **4 903 lignes de `DECKS.zh`**, tous niveaux et catégories avant filtres d’interface, index base zéro ; les doublons de cartes restent distincts. Conversation : **10 fichiers fr→zh, 452 variantes entières et 252 tours**, soit 704 enregistrements entiers. Les **113 modèles et 452 slots** sont inventoriés à part : les compter avec les phrases doublerait des matériaux et inclurait des modèles à trous.

Le tableau compte séparément les enregistrements dont `study` contient le caractère et les occurrences de ce caractère. Un texte répété dans une variante et un dialogue compte deux fois comme provenance, sans signifier deux mots différents ni deux écoutes. Les motifs de l’aide sont recherchés littéralement et séparément : leur présence ne fournit pas d’alignement caractère–syllabe. Aucune normalisation, seuil de longueur, lemmatisation ou arrondi n’est utilisé.

| Caractère observé | Catalogue : lignes / caractères | Conversation entière : lignes / caractères | Modèles+slots, à part : lignes / caractères |
| --- | ---: | ---: | ---: |
| 不 | 377 / 405 | 105 / 128 | 38 / 40 |
| 想 | 85 / 93 | 19 / 19 | 4 / 4 |
| 谢 | 29 / 45 | 15 / 29 | 1 / 2 |
| 去 | 83 / 85 | 62 / 63 | 23 / 23 |

Ces nombres ne reprennent pas les anciens totaux de sous-chaînes (`170 chyang`, `87 chyé`, `418 bou`, etc.). Sans leur périmètre exact, on ne peut pas les appeler des occurrences des seuls caractères 想/谢/不 : les mêmes syllabes transcrivent aussi des homophones. Les deux comptages sont distingués dans le JSON, sans conclure que l’ancien relevé était faux sur son propre périmètre.

## Quatre points à décider sur des phrases entières

### 不 : initiale et contexte, pas remplacement de chaque `bou`

Dans ce périmètre, les 377 lignes catalogue contenant 不 ont une aide contenant `bou` ; les 105 phrases/tours correspondants en conversation ont `pou`. Cela documente une différence de repère écrit dominante. Le pinyin de ces sources peut être `bù`, `bú` ou une forme neutre selon le contexte : le choix d’un repère français ne doit pas effacer ces contextes ni attribuer chaque sous-chaîne à 不.

- `DECKS.zh[2169]` : « 不是 » — `bou chr` ; `L3-fr-zh-08/v1` : « 不是。 » — `pou chr`. Les champs étudiés ne sont pas identiques au caractère près à cause du point final ; ils sont rapprochés seulement pour relecture.
- Contre-exemple d’automatisation : `DECKS.zh[1730]`, « 不经一番寒彻骨怎得梅花扑鼻香 », aide `bou djing i fann hann tcheu gou dzeune deu meï houa pou bi chyang`. Le `pou` correspond à **扑** (`pū` dans `py`), pas au 不 initial. Remplacer ou compter sans alignement fabriquerait une fausse conclusion.

À faire trancher : la consonne initiale non aspirée du mandarin, son approximation pour un lecteur francophone, la place de l’audio et les lectures contextuelles de 不. Aucune nouvelle graphie n’est proposée par ce lot.

### 想 : différence dominante, avec une exception déjà dans le catalogue

84 des 85 lignes catalogue contenant 想 comportent `chyang`, et une comporte `siang`. Les 19 phrases/tours de conversation contenant 想 ont `siang`. Une opposition de graphies est donc réelle, mais la phrase « chaque corpus est intégralement uniforme » serait trop forte.

- Même phrase étudiée exacte : `DECKS.zh[565]` et `L3-fr-zh-02/v2` / `L3-fr-zh-d2/t0` portent « 你想吃什么？ ». Leurs aides entières sont respectivement `ni chyang tcheu cheunn me?` et `ni siang tchr cheun-meu ?`. Plusieurs autres portions diffèrent aussi ; ne pas les corriger par une seule substitution de caractère.
- Exception catalogue `DECKS.zh[1874]` : « 我想去，但是我没时间。 » — `wo siang tchu, tane che wo méï cheu djienne`. Elle utilise déjà `siang`.

À faire trancher : le repère francophone de l’initiale `x-` dans ces contextes, la distinction avec le `s-` mandarin et la manière de rendre le repère lisible sans promettre une identité phonétique. 想 peut exprimer désir, pensée ou réflexion ; une égalité de caractère ne remplace pas la relecture de la phrase.

### 谢 : contrôler 谢谢 avec son audio et son rythme

Les 29 lignes catalogue contenant 谢 ont `chyé` ; les 15 phrases/tours de conversation ont `sié`. Le caractère est souvent répété dans 谢谢 : lignes et occurrences ne doivent pas être confondues.

- `DECKS.zh[2]` : « 谢谢 » — `chyé-chyé` ; `L2-fr-zh-d2/t6` : « 谢谢！ » — `sié-sié !`. La ponctuation et l’acte de remerciement sont conservés tels quels.

À faire trancher : le repère de l’initiale, la deuxième syllabe et le rythme effectivement entendu. Le JSON fournit les phrases entières ; une sous-chaîne `chyé` peut aussi transcrire d’autres caractères et ne doit pas être assimilée automatiquement à 谢.

### 去 : une graphie `u`/`ü` n’établit pas à elle seule deux voyelles opposées

83 lignes catalogue contenant 去 comportent `tchu`, 62 phrases/tours de conversation comportent `tchü`. Les 85 occurrences du caractère au catalogue et les 63 en conversation ne sont pas un décompte de mots nouveaux. Aucun couple de phrase entière identique pour 去 n’a été trouvé dans ce périmètre, même en ignorant seulement la ponctuation finale ; la comparaison reste celle du mot en contextes distincts.

- `DECKS.zh[97]` : « 怎么去？ » — `dzeune-meu tchu?`, pinyin source `zěnme qù?`.
- `L1-fr-zh-06/v0` : « 我去公司。 » — `ouo tchü kong-seu`, lecture source `wǒ qù gōngsī.`.

À faire trancher : la lecture française visée par `u` et par `ü`, l’initiale `q-` et l’utilité pédagogique du signe. Le français a déjà sa propre valeur de la lettre u ; la différence écrite peut relever d’une convention de repérage plutôt que d’une opposition sonore. Il faut entendre et faire lire les exemples avant de décider.

## Procédure de décision proposée, sans l’appliquer

1. Faire relire chaque famille par une personne capable de juger le mandarin et la lecture francophone, avec les phrases et leur audio, pas seulement les chaînes. Les questions exactes et exemples sont fournis dans le JSON.
2. Écrire une décision explicite par règle : but du repère, portée (mots/contextes), traitement des exceptions et absence de promesse de transcription exacte. Le son cible n’est pas déduit d’un décompte.
3. Avant un lot source éventuel, établir un manifeste des localisateurs exacts, valeurs avant/après proposées et aides parentes. Refuser la substitution globale `bou→pou`, `siang→chyang` ou `tchu→tchü` sans alignement et sans décision sur chaque contexte.
4. Vérifier séparément modèles/slots, phrases entières et dialogues, puis les aides de chaque lecteur. Une source approuvée devient ensuite un nouveau snapshot ; aucune réserve actuelle ne vaut autorisation d’harmoniser silencieusement.

## Contrôles et statut

Les **11 fichiers canoniques** (application et dix JSON fr→zh) ont été comparés octet pour octet à `cb3e22d`. Les **552 copies catalogue** et **249 copies conversation**, modèles/slots identifiés à part, sont revérifiées par index ou pointeur JSON. Leurs champs étudiés, sens et aides sont exacts. Les empreintes figurent dans le JSON.

Ce n’est ni une relecture native, ni une correction appliquée, ni une preuve d’écoute ou d’acquisition. Les sources, les phonétiques, les niveaux, les droits et le site restent inchangés. Aucun commit, fusion ou publication n’est produit par cet audit.
