# Revue intégrale — lot 1 : la phonétique corrigée, les thèmes et niveaux mesurés

Mandat de Kartech du 25 octobre 2026. Référence figée `4ec163e`. Branche `review/revue-integrale-claude`.
**Aucune fusion, aucune publication. Aucun prix, abonnement ni droit gratuit touché.**

## Ce que ce lot apporte

**4 832 aides phonétiques corrigées** sur les sept couples, et une faute de fond identifiée : **les aides les plus fréquentes de trois langues faisaient prononcer au francophone un son qui n'existe pas dans la langue étudiée.**

| | |
|---|---|
| Identifiants au périmètre | **33 874** (32 792 visibles · 862 réserves · 252 modèles reçus · 32 partagés) |
| Cellules couvertes | **70 sur 70** |
| Corrigés | **4 832** |
| Vérifiés sans changement | **27 496** |
| Incertains, lecture mot par mot nécessaire | **352** |
| Candidats de thème à arbitrer | **1 216** |

Conservation vérifiée contre `4ec163e` : identifiants **33 654 avant, 33 654 après, zéro perdu, zéro ajouté** ; seuls `phon` et `phoneticReviewStatus` diffèrent ; **aucune métadonnée de niveau modifiée**. Le diff fait 45 lignes pour 45 fichiers — une par fichier, format d'origine conservé.

## 1. La faute de fond : l'aide doit se lire en français

C'est le principe unique de la méthode, et deux règles d'orthographe française le rendaient faux à grande échelle.

### Règle A — un `s` seul entre deux voyelles se lit /z/

Le français ne laisse aucune ambiguïté : *rose* /roz/ contre *rosse* /ros/, *poison* contre *poisson*. Une aide qui écrit `dé-sou` fait dire **/dezu/**.

| Langue | Formes touchées | Ce que disait le francophone | Occurrences |
|---|---|---|---|
| japonais | **‑ます** `ma-sou` | /mazu/ au lieu de /masu/ | **1 277** |
| japonais | **‑です** `dé-sou` | /dezu/ au lieu de /desu/ | **954** |
| japonais | ‑ません `ma-sen` | /mazen/ | 285 |
| coréen | **‑세요** `sé-yo` | /zejo/ au lieu de /sejo/ | 157 |
| espagnol | *necesito* `né-sé-SI-to` | /nezezito/ | 95 |
| espagnol | *gracias* `GRA-sias` | /grazias/ | 22 |

Ce ne sont pas des mots rares : **‑masu et ‑desu sont la charpente du japonais parlé**, et 안녕하세요 est le premier mot de coréen que tout le monde apprend. Il était écrit `an-nyong-ha-sé-yo`, donc lu *an-niong-a-zé-yo*.

**Appliqué à fr-ja, fr-ko et fr-es seulement** — ces trois langues n'ont pas de /z/ à cet endroit, donc la correction ne peut rien casser. Le japonais n'écrit /z/ qu'avec ざじずぜぞ, romanisés *z*. **Le coréen n'a aucun /z/ du tout.**

### Règle B — un `g` devant `e`, `é`, `è`, `i` ou `y` se lit /ʒ/

`GIV` se lit « jive ». `GÈT` se lit « jète ». 个 écrit `ge` se lit « je ».

| Couple | Exemple | Lu par le francophone | Occurrences |
|---|---|---|---|
| chinois | 个 `geu` · 给 `geï` | /ʒø/ · /ʒɛ/ | **463** |
| coréen | 계 `gyé` · 교 `gyo` | /ʒje/ · /ʒjo/ | **269** |
| anglais | `GIV`, `GÈT`, `GIL-ti`, `eu-GÈN` | jive, jète, jilti, eu-jèn | 146 |
| espagnol | *sigue* `SI-gé` · *enseguida* `GI-da` | /siʒe/ · /ʒida/ | 36 |

Le corpus **connaissait la règle** : il écrit `gueï` sur la carte L1 du café, faite à la main, et `o-gui-so` pour 여기서. Il l'applique juste une fois sur cent quatre-vingts. En espagnol, l'aide a perdu le `u` que l'orthographe espagnole écrit elle-même.

**Appliqué à fr-zh et fr-ko** (ni le mandarin ni le coréen n'ont de /ʒ/) **et à fr-es** quand le mot espagnol écrit lui-même `gu`. **L'anglais est exclu** : *giraffe* est bien /dʒ/, chaque mot doit être lu.

### Règle C — zh→fr : « les » se repère par 雷, pas 莱

17 aides corrigées. Le caractère n'a été remplacé **que** là où il est un jeton isolé aligné sur le mot « les » ; il reste intact dans 托瓦莱特 (*toilettes*), 普罗布莱姆 (*problème*), 泰莱丰 (*téléphone*). Les 39 autres 莱 isolés représentent « est » en liaison (凯 莱 = /kɛ-lɛ/), « lait » et « l'ai » : ils ne relèvent pas de cette règle.

> **Écart à réconcilier avec Codex** : il annonçait 20 occurrences dans 19 aides, j'en corrige 17. Sa liste est l'autorité, qu'il m'indique les deux manquantes.

### Récapitulatif des corrections

| Couple | Règle A | Règle B | Règle C | Cartes |
|---|---:|---:|---:|---:|
| fr-ja | 3 319 | — | — | 2 795 |
| fr-ko | 702 | 269 | — | 830 |
| fr-es | 793 | 36 | — | 767 |
| fr-zh | — | 463 | — | 423 |
| zh-fr | — | — | 17 | 17 |
| **total** | **4 814** | **768** | **17** | **4 832** |

Après application, **plus aucune occurrence des deux règles ne subsiste** dans les couples visés. Registre complet avant/après par identifiant : [`registre-phonetique.json`](registre-phonetique.json).

## 2. Les 352 aides que je n'ai pas corrigées, et pourquoi

[`a-lire-individuellement.json`](a-lire-individuellement.json)

- **anglais, 319** : le `s` intervocalique anglais est /s/ dans *disappointed* mais /z/ dans *designer* ; le `g` est dur dans *give* mais doux dans *giraffe*. Aucune règle mécanique ne tranche. À lire mot par mot.
- **italien, 33** : le `s` intervocalique italien est /s/ en Toscane et au sud, /z/ au nord. `sta-sé-ra` n'est pas une faute, c'est une variante régionale. **Décision de Kartech** : quelle norme Melunga enseigne-t-il ?

## 3. Les conventions chinoises que j'isole sans y toucher

Mesuré sur 18 564 syllabes alignées caractère ↔ pinyin ↔ aide.

**a. La finale rétroflexe -i, où le corpus se contredit.** 是 shì ne contient aucune voyelle : écrire `cheu` ajoute un /ø/ arrondi inexistant.

| Pinyin | Rendus observés | Majorité |
|---|---|---|
| zhi | `djr` 223 · `djeu` 87 | la forme en **r**, 72 % |
| shi | `cheu` 281 · `chr` 247 | la forme en **eu**, 53 % |
| chi | `tcheu` 55 · `tchr` 22 | la forme en **eu**, 71 % |

Le corpus écrit 知 avec `r` et 是 avec `eu` — **une même série, deux conventions**. La forme en `r` est la plus juste et c'est celle du L1 fait à la main (我是法国人 → `ouo chr fa-kouo jeune`). **677 rendus ajoutent une voyelle parasite contre 507 qui n'en ajoutent pas.** Je ne l'applique pas : c'est 431 aides et une décision de convention, pas une faute d'orthographe française.

**b. 的 est rendu `de` 178 fois et `deu` 178 fois.** Pile à égalité, sur la particule la plus fréquente de la langue. Les deux se défendent (le français *de* vaut /də/, proche du /ɤ/ mandarin). Mais l'absence de choix, elle, n'est pas défendable.

**c. 约 : je tranche la question que Codex m'a laissée.** Le `y` du pinyin *yue* n'est pas une consonne, c'est la marque orthographique de la semi-voyelle ü. **Donc pas de `y` en français** — exactement la règle que j'ai donnée pour 预/愉 et que Codex a retenue. Mais le corpus donne **quatre formes** pour 约 : `u-eu`, `yu-yué`, `yué`, `ué`. Le choix entre `ué` (une syllabe, comme dans *muet*) et `u-eu` (deux syllabes) dépasse la question du `y` : **à toi de trancher la syllabation**, ma recommandation étant `ué`.

**d. 和 hé : le `h` français est muet.** Écrit `he` ou `heu`, le /x/ mandarin disparaît purement et simplement. Ni l'une ni l'autre graphie ne le rend. Convention à créer, pas à corriger.

## 4. Les thèmes : aucune correction appliquée, et je dis pourquoi

**Le classement mécanique est parfait.** Sur les 32 792 cartes visibles, section et type de contenu concordent **sans une seule exception** : les situations ne contiennent que des phrases, les mots et nombres restent dans leurs rubriques. La règle que tu énonces est déjà tenue à 100 %.

**Les deux cas que tu nommes.**

- **`Saludos a tu familia.` (`catalogue:es:1668`, fr-es L5, thème `L5-saluer`).** Tu as raison, et la faute est dans la glose avant d'être dans le thème. « Saludos a tu familia » **n'est pas une salutation d'arrivée, c'est une formule d'adieu** : on la dit en partant, et elle signifie « mes amitiés à ta famille ». La glose française « bonjour à ta famille » se lit comme si l'on saluait la famille présente. Le thème `saluer` couvre les deux bouts d'un échange, donc il n'est pas franchement faux — mais **la glose, elle, est à refaire** : « salue ta famille de ma part ». C'est un changement de contenu, pas de classement : il te revient.
- **`Salirse con la suya.` (`catalogue:es:4190`, fr-es L8).** Le piège a déjà été désamorcé : `originalDomain` était **`deplacements`** — classé sur *salir* « sortir », exactement l'erreur de mot-clé que tu décris — et la carte est aujourd'hui en `vocab-actions`. **La correction est déjà faite.** Une locution verbale figée relève bien d'une rubrique lexicale. Je note qu'**aucune rubrique « expressions » n'existe** dans les 260 identifiants de thème : les idiomes se répartissent faute de mieux.

**Pourquoi je ne corrige pas en masse.** J'ai construit un détecteur dont le lexique de chaque domaine est appris sur la donnée, puis **j'ai lu 26 candidates une par une : 7 étaient de vraies erreurs.** Une précision d'une sur quatre interdit toute correction automatique. Les 1 216 candidates sont livrées comme crible dans [`candidates-themes.json`](candidates-themes.json), jamais comme verdict.

Mon propre détecteur a d'ailleurs **reproduit le piège que tu décris** : il voulait déplacer « Au train où vont les choses » vers les transports, et « Ça ne mange pas de pain » (*Tentar non costa nulla*) vers les repas. La preuve que le piège est réel.

**Les 7 erreurs confirmées à la lecture**, par famille :

| Famille | Exemple | Thème actuel | Proposé |
|---|---|---|---|
| Lieu et direction garés en « conversation » | `catalogue:es:1496` *Gire en la esquina.* « tournez au coin » | conversation | **deplacements** |
| | `catalogue:es:1246` *Está en el centro.* « c'est au centre-ville » | conversation | **reperes** |
| Vocabulaire professionnel garé en « conversation » | `catalogue:en:2945` « l'incoterm est-il FOB ou CIF ? » | conversation | **travail** |
| | `catalogue:zh:969` « l'angle du faisceau peut-il être personnalisé ? » | conversation | **travail** |
| Météo en « repères » | `catalogue:it:4311` *Pioveva molto.* | reperes | **decrire** ou nature |
| Glose française ambiguë | `catalogue:it:427` *Ecco la sua carta.* « Voici votre carte » | conversation | **la glose est le problème** : carte de visite, plan, ou carte du restaurant ? |
| | `catalogue:es:1603` *Aquí tiene mi tarjeta.* « voici ma carte » | conversation | idem, ici carte de visite |

## 5. Le déséquilibre structurel : un thème porte 43,7 % du contenu

C'est le constat qui explique la sensation de surcharge.

| Domaine | Cartes | Part |
|---|---:|---:|
| **conversation** | **10 421** | **43,7 %** |
| deplacements | 2 066 | 8,7 % |
| repas | 1 815 | 7,6 % |
| reperes | 1 802 | 7,6 % |
| ressentis | 1 758 | 7,4 % |
| travail | 1 619 | 6,8 % |
| quotidien | 999 | 4,2 % |
| saluer | 854 | 3,6 % |
| comprendre | 564 | 2,4 % |
| decrire | 490 | 2,1 % |

`conversation` est vingt fois `decrire`. Ce n'est pas un thème, c'est ce qui reste quand aucun autre ne s'impose. **À découper** — et les familles du tableau précédent indiquent par où commencer.

### À l'autre bout : 252 rubriques vides ou quasi vides

| | |
|---|---|
| Rubriques totales sur les 70 cellules | 1 636 |
| Vides (0 carte) | **66** |
| Quasi vides (1 ou 2 cartes) | **186** |
| Ensemble | **252, soit 15 %** |

| Rubrique | Vide ou quasi vide dans |
|---|---|
| `vocab-couleurs` | **55 cellules sur 70** |
| `vocab-adjectifs` | 36 |
| `vocab-loisirs` | 22 |
| `vocab-personnes` | 18 |
| `vocab-reperes` | 17 |

**Les couleurs sont un ensemble fermé** — une douzaine de mots par langue. Les répliquer sur dix niveaux produit mécaniquement dix rubriques presque vides par langue. Ce n'est pas un manque de contenu à enrichir, **c'est une rubrique à ne pas répéter à chaque niveau**. Même raisonnement pour les prépositions.

> Et `densityStatus` déclare les **1 636 rubriques « source-repertoire-ready »**, y compris les 66 qui sont vides. L'indicateur ne mesure rien.

## 6. Pourquoi le L1 chinois est trop difficile — la réponse chiffrée

Ta femme avait raison, et voici ce qui le prouve. Charge de décodage au L1, à nombre de cartes comparable :

| Couple | Cartes L1 | Signes distincts à reconnaître | Nature |
|---|---:|---:|---|
| fr-en | 389 | **0** | alphabet connu |
| fr-es | 343 | **0** | alphabet connu |
| fr-it | 395 | **0** | alphabet connu |
| zh-fr | 335 | **0** | alphabet connu |
| fr-ko | 363 | **58 jamo** | alphabet rationnel, appris en un jour |
| fr-ja | 365 | 247 kanji **+ 100 kana** | kana alphabétiques |
| **fr-zh** | **307** | **281 hanzi** | **logogrammes, aucune règle** |

**Le chinois a le moins de cartes au L1 et de loin la plus forte charge** : 281 logogrammes arbitraires, sans alphabet pour s'appuyer. Le coréen demande 58 jamo qui se combinent par règle. La difficulté n'est pas dans la longueur des phrases — c'est le piège de ma mesure précédente — elle est dans le **nombre de signes à mémoriser avant de lire quoi que ce soit**.

**Et ce L1 contient des proverbes classiques.** `catalogue:zh:843` **不打无准备之仗** (« ne jamais partir sans préparation ») est un chengyu militaire, placé au **L4** ; 行远自迩 est au L10. Un idiome lettré en quatre caractères n'a pas sa place dans les premiers niveaux.

## 7. Ce qui reste à traiter

| Travail | Volume | Ce qui bloque |
|---|---|---|
| Lire les 352 aides anglaises et italiennes | 352 | lecture mot par mot, aucune règle mécanique |
| Arbitrer les 1 216 candidates de thème | 1 216 | jugement de sens, une sur quatre est réelle |
| Trancher la finale rétroflexe chinoise | 431 aides | décision de convention (`chr` ou `cheu`) |
| Trancher 的 : `de` ou `deu` | 356 aides | 178 contre 178 aujourd'hui |
| Trancher la syllabation de 约 | ~20 aides | `ué` ou `u-eu` |
| Créer une convention pour 和 hé | ~25 aides | le `h` français est muet |
| Découper `conversation` | 10 421 cartes | travail éditorial |
| Dé-répliquer les rubriques fermées | 252 rubriques | décision de structure |
| Redescendre les chengyu des niveaux bas | à recenser | jugement pédagogique |
| Réduire la charge du L1 chinois | 281 hanzi | décision pédagogique de fond |

## 8. Ce que je ne prétends pas avoir fait

**Je n'ai pas lu 33 874 cartes une par une.** J'ai vérifié des propriétés nommées sur la totalité du périmètre — concordance section/type sur 32 792, deux règles de lecture française sur toutes les aides, cohérence caractère par caractère sur 18 564 syllabes chinoises, identité des formes dupliquées — et j'ai lu individuellement ce que ces tests ont fait remonter. **« Vérifié » veut dire : testé contre ces contrôles, pas validé linguistiquement.**

**Aucune aide conservée n'est pour autant réputée juste.** Une correction d'orthographe française ne dit rien du naturel de l'aide. La relecture native reste nécessaire, et je n'ai assemblé aucune syllabe depuis plusieurs sources.

**Je n'ai pas vu l'aperçu.** La page `parcours-niveaux.html` est rendue par le navigateur et le proxy de mon environnement refuse Netlify. Je n'ai travaillé que sur les fichiers GitHub. Si l'affichage présente autre chose que ces données, cela m'échappe. **Je n'ai touché à aucun fichier d'interface** : la présentation validée, le Pinyin, l'oreille, À revoir et les quatre balayages sont intacts — les 45 fichiers modifiés sont tous du contenu.

**Je n'ai pas touché la frontière d'accès.** `isFreeCard` teste `lv === 1` ; aucun champ `lv`, aucun niveau, aucun prix, aucun abonnement n'a bougé. Vérifié fichier par fichier.

**Et une erreur à mon débit** : ma relecture précédente annonçait « 4 079 rendus comparés ». Codex a montré que c'est le total **sans le fr→en** ; le vrai total est **4 480**. Il a raison. De même, mes chiffres espagnols 55/317 et 686/4 672 venaient d'un filtre que je n'avais pas joint : les scripts de ce lot sont tous dans [`mesures/`](mesures/).

## Rejouer les mesures

```sh
python3 -BI docs/revue-integrale/mesures/charge.py .      # inventaire des 33 874
python3 -BI docs/revue-integrale/mesures/lecture.py        # les trois pièges de lecture
python3 -BI docs/revue-integrale/mesures/portee.py         # portée par couple et niveau
python3 -BI docs/revue-integrale/mesures/retro.py          # finales chinoises contre pinyin
python3 -BI docs/revue-integrale/mesures/themes.py         # crible des thèmes
python3 -BI docs/revue-integrale/mesures/corrige.py .      # simulation, sans --apply
```
