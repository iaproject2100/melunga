# Ponts L1 : préparer le premier échange au café

Lot de relecture sur les sept couples actifs `fr→en/es/it/zh/ja/ko` et `zh→fr`, préparé depuis `bcd108d`. La [proposition de Claude](../../revue-pedagogique/ponts-L1-sept-langues.md) est conservée exactement depuis son commit `60c142a`. Aucune publication ni fusion n’est effectuée dans ce lot.

## Livré

- **14 petites unités en annexe** : « Saluer » et « Refuser poliment » pour chaque couple. Chaque formule entière est découverte, imitée puis proposée au rappel avec l’aide disponible. Elles n’inventent pas quatre variantes pour satisfaire le schéma historique.
- **7 préparations de la demande de prix exacte**, à l’intérieur du parcours de préparation de chaque scène.
- **7 scènes dérivées du café**, avec quatre énoncés apprenant préparés séparément et trois répliques du serveur déclarées en réception.
- **14 extraits contrôlés**, refus et prix, dans une banque distincte. Les salutations, commandes et répliques du serveur réutilisent les références entières déjà enregistrées.
- **Un correctif proposé pour « Bonjour ! »**, isolé et contrôlé, sans application au catalogue actuel.

Les [données des ponts](../l1-bridges.json) et la [banque des extraits](../banks/l1-bridges.json) complètent les 210 unités précédemment sélectionnées : 210 unités sources et 14 préparations supplémentaires. Zéro phrase étudiée nouvellement rédigée, zéro nouvelle transcription. Les aides sont reprises entières ou découpées à une frontière vérifiée, avec les espaces de jointure conservés séparément.

## Une précision qui change la préparation

La commande du café égale **exactement** la première variante de l’unité `L1-<couple>-09`, traduction et aides comprises, dans les sept couples. Cette référence est réutilisée.

La question de prix isolée n’est **identique à aucune variante d’une unité L1**, dans les sept couples. L’unité `-10` travaille une intention proche, mais elle ne prépare pas à elle seule la forme exacte du dialogue : sujet présent ou absent, « this/it », ordre des mots ou particules diffèrent. La scène prépare donc aussi la question extraite telle quelle, avec son sens et son audio. Une parenté de construction ne devient pas une preuve de préparation ou d’acquisition.

Le contexte du refus est explicite dans la langue du lecteur : le serveur propose du lait, le client refuse poliment. L’emploi coréen de `괜찮아요` n’est pas expliqué par le sens « ça va » d’une autre carte. Aucune règle universelle de refus n’est déduite d’une formule.

## Scission et réception

Le dialogue original est conservé. La scène dérivée a son propre identifiant et l’ordre suivant :

| Position source, index zéro | Présentation dans la scène dérivée |
|---|---|
| 0, apprenant | Salutation entière |
| 1, serveur | Accueil et demande de commande, à comprendre |
| 2, apprenant | Commande exacte de `-09:v0` |
| 3, serveur | Proposition de lait, à comprendre |
| 4, apprenant, premier énoncé | Refus poli extrait |
| 4, apprenant, second énoncé | Demande de prix extraite, initiative du client |
| 5, serveur | Montant, à comprendre |

Chaque champ du tour 4 — texte, traduction, phonétique et lecture lorsqu’elle existe — est partagé à sa propre frontière. Les deux sous-chaînes et leur séparateur reconstituent exactement le champ d’origine. Les aides absentes restent absentes ; aucun `reading:"—"` n’est ajouté.

Le contrat `received` reste explicite :

- La question de commande pointe vers la commande entière déjà présentée, par `answerWith` et `preparedInStep`.
- La question sur le lait pointe **seulement vers le refus**. La demande de prix constitue ensuite une continuation du client.
- Le montant reçu termine cette petite scène avec `replyRequired:false` et `answerWith:[]`. Aucun remerciement supplémentaire n’est inventé pour lui donner une clôture artificielle.

`introducedInStep` désigne la première présentation du reçu. `analyse:false` et `countsAsProduction:false` distinguent réception et production. Toutes les réponses sont présentées avant l’échange ; ces liens éditoriaux ne prouvent pas que la personne les comprend ou sait les produire.

## Pourquoi une annexe

Le schéma des 110 JSON impose des modèles à emplacement et au moins quatre variantes distinctes. Les nouvelles préparations sont des expressions entières extraites d’une seule source. L’annexe évite de fabriquer des variantes ou de changer globalement le contrat du chargeur, des générateurs et des contrôles déjà relus.

Les 110 JSON, les anciennes séquences, les 32 115 cartes et les phonétiques restent inchangés. La maquette complète propose le nouveau bloc « Préparer mon premier échange » au L1 ; les trois situations historiques, les trois dialogues originaux et L2–L10 restent disponibles. En l’absence de l’annexe, elle conserve le parcours existant et affiche une information locale.

Le matériel de ce lot n’est pas dans les leçons du site public ni dans l’aperçu Netlify précédent. Son intégration à l’application et sa publication sont des étapes ultérieures.

## « Bonjour ! » : correctif prêt à examiner

La carte exacte est `DECKS.fr[272]`, historiquement `lv:2`. La [proposition JSON Patch](bonjour-lv1-proposal.json) ne remplace que sa valeur `lv` par `1`. Le catalogue est partagé entre les lecteurs du français ; le couple actif concerné est `zh→fr`.

Le catalogue garde `phon:"帮茹"` et `py:"bon-ZHOOR"`. L’essai utilise la source de conversation L1, qui garde sa propre aide `蓬茹尔`. Les deux provenances ne sont pas fusionnées. La décision sur les conventions phonétiques reste hors de ce lot.

```sh
python3 -B tools/pedagogy/preview_bonjour_level.py --check
python3 -B tools/pedagogy/preview_bonjour_level.py --output /tmp/bonjour-lv1-candidate.html
```

La première commande valide la proposition en mémoire ; la seconde produit un fichier candidat séparé, s’il n’existe pas déjà. Le contrôle vérifie qu’un seul caractère change, le chiffre du niveau, et que tous les autres champs et toutes les aides sont identiques. Le programme refuse d’écraser un fichier de l’application. **La proposition n’est pas appliquée au catalogue de cette branche.**

## Relecture native à obtenir avant publication

Les sept scènes restent `pending`, avec `productionApproved:false`. Une extraction exacte ne valide pas son naturel une fois détachée. Faire renseigner, pour chaque couple, le nom du relecteur, les références écoutées, les trois avis ci-dessous et les éventuelles réserves.

| Couple | Refus détaché et poli dans ce contexte | Scène et intonation naturelles | Phonétique/lecture et sens en contexte |
|---|---|---|---|
| fr→en | À relire | À écouter | À contrôler |
| fr→es | À relire | À écouter | À contrôler |
| fr→it | À relire | À écouter | À contrôler |
| fr→zh | À relire | À écouter | À contrôler |
| fr→ja | À relire, en particulier `結構です` | Degré de fermeté à écouter | À contrôler |
| fr→ko | À relire, `괜찮아요` en refus du lait | À écouter | Ne pas assimiler au sens « ça va » |
| zh→fr | À relire | À écouter | Aide chinoise propre à la conversation |

La qualité vocale réelle, la pragmatique et la compréhension d’un débutant ne sont pas certifiées par les scripts. Les conventions chinoises `不/谢/想` sont conservées source par source, sans harmonisation.

## Vérifications reproductibles

```sh
python3 -B tools/pedagogy/prepare_l1_bridges.py --check
python3 -B tools/pedagogy/validate_l1_bridges.py
python3 -B tools/pedagogy/test_l1_bridges.py
python3 -B tools/pedagogy/test_fragment_phonetics.py
python3 -B tools/pedagogy/guard_phonetics.py --check --bank docs/progression-complete/banque-themes.json
python3 -B tools/pedagogy/prepare_complete_sequences.py --check
python3 -B tools/pedagogy/validate_complete_sequences.py
python3 -B tools/pedagogy/preview_bonjour_level.py --check
NODE_PATH=/tmp/melunga-review-tools/node_modules node docs/progression-complete/maquette/verify-l1-bridges.cjs
```

Le chemin `NODE_PATH` dépend de l’installation locale de `playwright-core`. Le navigateur est Chromium, les lectures sont simulées et les requêtes externes sont interceptées. Le contrôle des nouvelles préparations couvre les trois formats 320 × 568, 390 × 844 et 1440 × 900. La suite DOM historique a également réussi sur l’ensemble L1–L10. [Rapport des nouveaux contrôles](verification-navigateur.json).

[Vue mobile au rappel](fr-ko-scene-recall-390x844.png) · [Vue ordinateur au rappel](fr-ko-scene-recall-1440x900.png). Les quatre intentions du client restent visibles ; ses phrases étudiées, phonétiques et lectures sont retirées du DOM. Les trois répliques du serveur gardent leur oreille.

Pour ouvrir la maquette localement, servir le dépôt par HTTP (`python3 -m http.server 8000`) puis ouvrir `http://localhost:8000/docs/progression-complete/maquette/`. Choisir L1 et une des sept langues, puis « Saluer », « Refuser poliment » ou « Le café, pas à pas ».

Les travaux de fond L2–L4 et L7/L8 ne sont pas modifiés par ces ponts L1.
