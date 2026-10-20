# Contenus de conversation — niveaux 1 à 10, 7 langues

État : **matrice des 10 niveaux + contenus L1 à L10 pour les 7 langues étudiées (70 fichiers), en relecture.** Totaux : 840 modèles, 3 360 variantes, 210 dialogues (1 725 répliques). Feu vert éditorial Codex sur L1 ; L2–L10 rédigés selon les règles corrigées ; aucune validation native exhaustive, aucune fusion ni déploiement.
Aucune modification de l'interface ni des données existantes (`conversation-fr-es.json` de Codex est conservé tel quel).

## Fichiers
- `melunga_deploy/content/conversation/matrix.json` — matrice des 10 niveaux (objectif, fonctions, situations, structures par langue, réutilisation, parcours d'exercices, minimums). Lisible : `docs/conversation/matrice-niveaux.md`.
- `melunga_deploy/content/conversation/L<n>-<maternelle>-<étudiée>.json` (n = 1…10) — contenus par niveau ; sources : `conv_L1.py` (L1) et `levels/data_<étudiée>.py` + `conv_build.py` (L2–L10, `python3 conv_build.py` régénère les JSON et `docs/conversation/niveau-L<n>.md`). Brief de rédaction : `levels/BRIEF.md`. L1 : : `L1-fr-es`, `L1-fr-en`, `L1-fr-zh`, `L1-fr-it`, `L1-fr-ja`, `L1-fr-ko` (lecteurs francophones) et `L1-zh-fr` (français pour sinophones, aide de prononciation en caractères chinois comme dans le deck existant). Lisible : `docs/conversation/echantillon-L1.md`.
- `validate.py` — vérifie champs manquants, `{s}` résiduels, identifiants en double, références, minimums. `conv_matrix.py` / `conv_L1.py` — générateurs (sources des fichiers JSON).

## Schéma (générique, une entrée = `{study, phon, native[, reading]}`)
- `study` : phrase dans la langue étudiée · `native` : traduction dans la langue maternelle · `phon` : prononciation écrite **pour le lecteur de la langue maternelle** (jamais la phonétique « francophone » réutilisée pour un autre public) · `reading` : aide de lecture propre à la langue étudiée — pinyin avec tons (zh), hiragana (ja), romanisation révisée (ko).
- `units[]` : `id` stable `L<niveau>-<nat>-<étude>-<nn>`, `situation`, `model` (avec `{s}` à l'emplacement remplaçable, éventuellement `note`), `variants[]` (`slot` = le morceau remplacé + phrase complète), `practice` = découvrir (index) → remplacer (index) → rappel sans réponse visible (index).
- `dialogues[]` : `id` `L<niveau>-<nat>-<étude>-d<n>`, 6 à 10 `turns` (A/B), `practice`, `reuses` (modèles réutilisés).
- Racine : `phoneticConvention` (choix documentés), `reviewStatus` (vérifié / relecture requise), `coverageClaim: null` (aucune promesse de « 80 % »), `readiness` (repère pédagogique).
- `nativeFull` (optionnel, dans la source du générateur) : traduction complète quand l'assemblage mécanique ne suffit pas (accord, pluriel : « Où **sont** les toilettes ? »). Règle : on vérifie la phrase complète, pas seulement chaque brique.

## Différence avec `conversation-fr-es.json` (Codex) — adaptateur à prévoir
| Fichier initial (`version: 1`) | PR #6 (`version: 2`, `format: conversation-generic`) |
|---|---|
| racine `levels[]` (plusieurs niveaux par fichier) | un niveau par fichier `L<n>-<nat>-<étude>.json` |
| clés `es`, `pf`, `fr` | clés génériques `study`, `phon`, `native` (+ `reading`) |
| `dialogue` (un par niveau) | `dialogues[]` (trois par niveau) |
| `model` = début de phrase | `model` = gabarit avec `{s}` |
| — | `note`, `reviewStatus`, `coverageClaim`, `reuses` |

`adapt.py` convertit le format initial vers le format générique (`python3 adapt.py to-generic ../conversation-fr-es.json <dossier>`) : `es→study`, `pf→phon`, `fr→native`, `dialogue→dialogues[0]`, gabarit reconstitué en remplaçant `slot.es` par `{s}` dans la première variante, `sourceId` conservé. Testé sur `conversation-fr-es.json` : 6 niveaux × 6 modèles convertis, tous les gabarits reconstitués, structure acceptée par `validate.py` (seuls les minimums éditoriaux du fichier initial — 3 variantes, 4 répliques — ressortent). Le fichier initial est conservé tel quel ; le chargeur de l'application pourra appliquer la même correspondance en JS.

## Choix linguistiques (L1)
- 11e modèle « Se dépanner » dès L1 : *Je ne comprends pas / Répétez / Plus lentement / Parlez-vous français ?* (phrases entières).
- Relances contextualisées dans les dialogues plutôt qu'un « Et vous ? » littéral (ja : ポールさんは？ ; ko : 어디에서 오셨어요?).
- Japonais : voyelle longue = voyelle répétée (ko-o-hi-i), consonne double = consonne fermant la syllabe (kip-pou, chouc-chin) ; distinction 行きます / 帰ります réservée à L2 (lieux hors domicile en L1).
- Espagnol : seseo noté `ss` partout (né-ssé-SSI-to) ; « en vacances » exprimé avec *estar*, donc hors du modèle *Soy…*.
- Chinois : 了 expliqué sur les exemples concernés (accompli / changement d'état), jamais présenté comme « le passé ».
- Pas de grammaire française imposée : ja/ko expriment « j'ai faim/soif/froid » par un adjectif ou un verbe complet (modèle = phrase entière, signalé par `note`) ; zh utilise 了 / 很 ; ko inclut les particules dans le morceau remplaçable ; registre poli partout (es *usted* dans les dialogues, it *Lei*, ja です/ます, ko -요).
- Chinois : mandarin standard, caractères simplifiés, pinyin avec tons dans `reading` ; l'approximation francophone ne note pas les tons.
- Statut : es/en/it rédigés à la main à partir des briques du deck, relecture native conseillée ; zh/ja/ko et zh→fr : **relecture linguistique requise**.

## Points signalés par les rédacteurs pour relecture native (L2–L10)
- es : « Está lejos del centro », « Es menos céntrico », « otro día me apunto » (familier), « ¿Cuál es su mejor precio? », « me puse muy contento » ; coger signalé péninsulaire.
- en : « A table for one », « the 9:15 to Leeds », « It's rather good news », « Could you do it for forty? » ; côté français « Je crains que ce ne soit pas possible » (soutenu).
- it : « Prendo la metro delle otto », « Preferisco stasera », « Com'è andata la vacanza », e ouverts/fermés approximés é/è, « Sono convinto che funzionerà » (indicatif).
- zh : « 你为什么不吃 » (abrupt), « 对不起我晚了，因为… », « 洗手间在二楼 = premier étage », approximations « tchyèn », « yeou ».
- ja : 疲れていますから (poli + から), 一部は終わりましたが、全部ではありません, どうしてここにいますか (direct), lectures 指定席/自由席, 郊外, 報告書, 見直します.
- ko : romanisation « selon la prononciation » (연락할게요 → yeollakalgeyo), 어디에서 살아요 vs 어디에 살아요, 식당이요 / 창가 자리요, 그렇기도 해요 / 그런 편이에요 ; è pour ㅐ/ㅔ (L1 utilisait parfois é : à harmoniser).
- fr→zh : 汉字 pour [y]/[ø]/[ʁ] (居/迪/珀/尔), liaisons (于伊 特尔, 迪 泽尔), naturel de « 不如…吧，你看呢？ », « 应该算是吧 ».

## Suite
Relecture Codex de L2–L10 (progression, naturel, phonétique), corrections, puis adaptateur de schéma et intégration dans l'application (hors de cette PR) ; ensuite autres langues maternelles (en, es, zh… lecteurs) avec des phonétiques dédiées.
