# Pourquoi le pas de progression n'est pas le même d'une langue à l'autre

Réponse à la question de Kartech, et au constat de sa femme : « le L1 chinois est trop compliqué ». J'ai cherché à vérifier ce constat plutôt qu'à l'expliquer, et il est juste — mais pas pour la raison qu'on croit.

## 1. La réponse courte

**Les niveaux sont alignés sur ce que l'apprenant doit pouvoir *faire*, pas sur ce que cela lui *coûte*.**

`matrix.json` définit L1 de la même façon pour les sept langues : se présenter, dire son nom, dire ce qu'on veut, trouver un lieu, commander, demander un prix. Onze situations, identiques partout. Mais exprimer ces onze situations ne coûte pas la même chose en anglais et en japonais — ni en temps de parole, ni surtout en effort de déchiffrage.

Le pas diffère donc **par construction**, et il ne se corrige pas en déplaçant des unités : il faudrait soit accepter des niveaux qui ne recouvrent pas les mêmes fonctions d'une langue à l'autre, soit doser la quantité de matière par niveau selon la langue. C'est une décision de méthode, et elle vous revient.

## 2. La mesure : syllabes par phrase, comparable entre langues

Mes mesures précédentes comptaient des mots pour les langues latines et des caractères pour les autres — donc incomparables entre elles, je l'avais écrit comme limite. Le champ phonétique, lui, est découpé en syllabes dans les sept langues. **C'est la seule mesure vraiment comparable du dossier.**

| Couple | L1 | L2 | L3 | L4 | L5 | L6 | L7 | L8 | L9 | L10 |
|---|---|---|---|---|---|---|---|---|---|---|
| zh→fr | 3,5 | 4,5 | 3,7 | 4,8 | 4,4 | 5,0 | 6,9 | 6,2 | 7,1 | 7,7 |
| fr→en | 4,4 | 5,2 | 5,7 | 7,6 | 6,5 | 7,9 | 9,6 | 9,4 | 8,8 | 9,8 |
| **fr→zh** | **4,9** | 5,7 | 6,4 | 6,3 | 6,5 | 7,8 | 9,6 | 9,2 | 9,4 | 11,8 |
| fr→es | 5,8 | 7,3 | 6,5 | 9,3 | 8,4 | 9,7 | 11,9 | 11,6 | 9,9 | 11,8 |
| fr→it | 6,0 | 7,7 | 6,3 | 9,2 | 9,5 | 11,5 | 11,8 | 12,2 | 11,2 | 12,0 |
| fr→ko | 6,6 | 7,2 | 6,7 | 8,5 | 8,8 | 8,8 | 12,5 | 11,5 | 10,6 | 15,1 |
| fr→ja | 9,0 | 11,1 | 9,2 | 11,0 | 11,0 | 12,2 | 16,5 | 13,6 | 16,1 | 18,9 |

**Premier résultat, contre-intuitif : le chinois L1 est le troisième plus court des sept.** Ses phrases font 4,9 syllabes, contre 5,8 pour l'espagnol, 6,6 pour le coréen et 9,0 pour le japonais. À l'oral, le L1 chinois est donc **plus léger** que le L1 espagnol.

**Second résultat : l'écart entre la langue la plus légère et la plus lourde est constant, de L1 à L10.**

| Niveau | Plus court | Plus long | Rapport |
|---|---|---|---|
| L1 | 3,5 (zh→fr) | 9,0 (fr→ja) | **2,55×** |
| L5 | 4,4 (zh→fr) | 11,0 (fr→ja) | **2,50×** |
| L10 | 7,7 (zh→fr) | 18,9 (fr→ja) | **2,46×** |

Un rapport de deux et demi, identique du premier au dernier niveau. **Les langues ne convergent jamais.** Un apprenant japonais prononce, à chaque niveau, des phrases deux fois et demie plus longues qu'un apprenant sinophone du français. Ce n'est pas un défaut de rédaction : c'est la langue.

## 3. Alors pourquoi le chinois paraît-il plus dur ? Le déchiffrage

Voici ce que le L1 demande réellement à l'apprenant, à nombre de phrases rigoureusement égal :

| Couple | Phrases | Symboles distincts | **Dont inconnus du lecteur** |
|---|---|---|---|
| fr→en | 44 | 34 | **0** |
| fr→it | 44 | 37 | 3 — lettres accentuées |
| fr→es | 44 | 43 | 6 — lettres accentuées |
| zh→fr | 44 | 40 | 7 — lettres accentuées |
| **fr→ko** | 44 | 92 | **92 blocs** |
| **fr→zh** | 44 | 96 | **96 caractères** |
| **fr→ja** | 44 | 110 | **107 caractères** |

**Voilà la réponse à votre femme.** Un francophone qui lit « Un café, por favor » ne déchiffre rien : il connaît l'alphabet. Le même francophone, devant 请给我一杯咖啡。, affronte sept formes qui ne lui disent rien, et le L1 chinois lui en présente **quatre-vingt-seize**.

Le chinois est donc plus court à dire et incomparablement plus lourd à lire. Les deux mesures se contredisent, et c'est exactement pourquoi le constat « c'est trop compliqué » ne se laissait pas expliquer par les chiffres dont nous disposions jusqu'ici.

Une nuance importante en faveur du coréen : ses 92 blocs ne sont pas 92 formes irréductibles. Le hangeul est un **alphabet** — les blocs se décomposent en une vingtaine de lettres apprenables en une heure. Les 96 caractères chinois, eux, sont 96 objets distincts à mémoriser un par un. **À nombre de symboles presque égal, la charge réelle n'a rien à voir**, et c'est le chinois qui est pénalisé.

## 4. Un second handicap, propre au chinois : les tons ne sont pas notés

La convention phonétique du chinois le dit explicitement :

> « Les tons ne sont pas notés dans l'approximation : se reporter au pinyin (champ `reading`) et à l'audio. »

Un francophone voit donc `ouo chr süé-cheng` pour 我是学生。 — sans aucune information de ton, alors que le ton est **distinctif** en chinois. Pour l'obtenir, il doit lire le champ `reading` (`wǒ shì xuéshēng`), c'est-à-dire apprendre une **seconde notation** en plus des caractères.

Le japonais et le coréen n'ont pas ce problème : leurs approximations sont complètes, rien d'essentiel n'y manque. **Le chinois est la seule des sept langues dont l'aide phonétique est structurellement incomplète**, et c'est le cas où elle serait le plus nécessaire.

## 5. Comparaison avec un concurrent

L'environnement de Codex bloquait les pages concurrentes ; le mien ne les bloque pas. Point de comparaison, sur la structure du cours de chinois pour anglophones de Duolingo :

| | Melunga, L1 chinois | Duolingo, unité 1 chinois |
|---|---|---|
| Portée | **11 situations** — se présenter, nom, vouloir, avoir besoin, trouver un lieu, aller, se sentir, aimer, commander, prix, dépannage | **une seule** — nommer des aliments et des boissons |
| Caractères | 96 | un petit ensemble fermé |

Leur section 1 compte dix unités, qui déploient une à une ce que votre L1 présente d'un coup : nationalités (unité 2), professions (3), préférences (4), famille (5), fréquence (6), questions (7), voyage (8), spécificatifs (9), projets (10).

**Ce n'est pas qu'ils en font moins — c'est qu'ils l'étalent.** Leur première unité tient sur un thème unique et un vocabulaire fermé. La vôtre couvre onze situations et 96 caractères. Pour l'anglais, où le déchiffrage est nul, votre L1 large est un atout : l'apprenant fait beaucoup, vite. Pour le chinois, le même L1 large se heurte au mur des caractères.

Je n'ai regardé qu'un concurrent et qu'une langue : c'est un point de comparaison, pas une étude. Je peux l'étendre si vous le souhaitez.

## 6. Ce que je recommande

Trois options, par ordre de coût croissant. Aucune n'exige de toucher aux sept scènes L1 déjà validées.

**a. Doser la matière par langue, à fonctions identiques.** Garder les onze situations partout, mais réduire le nombre de variantes présentées à la première séance pour les langues à écriture non latine. Le mécanisme existe déjà : Codex avait prévu une petite sélection de départ avec un bouton « Toutes les variantes ». Le L1 chinois passerait de 96 caractères à une trentaine pour la première séance, sans qu'aucun contenu ne disparaisse. **C'est l'option la moins chère et la plus rapide.**

**b. Noter les tons dans l'approximation chinoise.** Un chiffre après la syllabe, comme `ouo3 chr4 süé2-cheng1`, ou un accent. Cela touche la convention et donc beaucoup de contenu : à décider règle par règle, et à relire par un natif. C'est le seul des trois points qui corrige une **incomplétude**, pas un dosage.

**c. Désaligner les niveaux.** Accepter que le L1 chinois couvre six situations là où le L1 anglais en couvre onze. C'est l'option la plus honnête pédagogiquement et la plus coûteuse : elle casse la promesse qu'un niveau veut dire la même chose partout, et oblige à repenser la matrice.

Mon avis : **a maintenant, b ensuite, c seulement si vous constatez que a ne suffit pas.** L'option a répond au constat de votre femme en quelques jours sans rien jeter ; l'option b corrige un vrai défaut mais demande une relecture native ; l'option c est une refonte.

## 7. Ce que je n'ai pas vérifié

Le temps réel d'apprentissage — mes mesures décrivent la matière, pas ce qui se passe dans la tête de l'apprenant. La comparaison concurrentielle porte sur un seul produit et une seule langue. Et le constat de votre femme vaut pour une personne : s'il est confirmé par d'autres apprenants, l'option a devient urgente ; s'il ne l'est pas, elle reste souhaitable mais moins pressante.

**Sources :** [Duolingo Chinese course structure](https://duolingodata.com/dat/zhfen67.html)
