# Types de contenu — français pour sinophones

**Candidats à relecture sémantique.** 4 500 cartes, une affectation par indice source. Aucun niveau, texte, traduction, lecture ou aide phonétique n’est changé.

Les répliques autonomes restent des énoncés : Bonjour, Merci, Oui, une demande polie nominale et une consigne à l’impératif ne sont pas écartées faute de verbe personnel. Les noms, adjectifs, adverbes et locutions verbales à l’infinitif vont au vocabulaire. Les nombres cardinaux, ordinaux et fractions seuls vont à Nombres ; une phrase comportant un nombre reste une phrase.

| Type | Cartes |
|---|---:|
| `utterance` | 3144 |
| `vocabulary` | 1192 |
| `number` | 33 |
| `incomplete` | 83 |
| `review` | 48 |

## Sous-classes du vocabulaire

| Sous-classe | Cartes |
|---|---:|
| `adjective` | 118 |
| `preposition` | 12 |
| `adverb` | 133 |
| `other` | 918 |
| `uncertain` | 11 |

Une carte n’est pas dupliquée entre les rubriques. Le classement porte sur l’unité entière : `un petit ami` reste un groupe nominal, `C’est cher.` reste une phrase, `cher` est un adjectif. `sur` ou `à côté de` sont des unités prépositives délimitées ; `Je vais à...` et les modèles à trou restent ouverts. `avant` et `après`, sans contexte tranchant leur emploi, sont explicitement incertains.

Un marqueur comme `cat: vocab` ne suffit pas : les sources contiennent des phrases complètes sous cette étiquette. Inversement, des mots isolés sont étiquetés `core`. Les catégories existantes ne sont utilisées qu’après examen de la forme comme indice de secours. Aucun énoncé n’est découpé, recomposé ou complété.

Les cartes regroupant deux interlocuteurs restent en réserve (`review`) : ni la carte entière ni l’un de ses morceaux n’est imposé comme tour de l’apprenant. Les groupes d’unité de mesure ne sont pas confondus avec un nombre seul (`un kilo` reste lexical ; `un million` est numérique).

## Exemples vérifiés

| Indice | Source exacte | Affectation | Sous-classe |
|---:|---|---|---|
| 1 | Oui. | `utterance` | `` |
| 2 | Merci. | `utterance` | `` |
| 272 | Bonjour ! | `utterance` | `` |
| 3120 | Un café, s'il vous plaît. | `utterance` | `` |
| 2918 | Le film était bien ; par contre, la salle était bruyante. | `utterance` | `` |
| 3051 | L'eau bout. | `utterance` | `` |
| 3202 | Le bébé pleure. | `utterance` | `` |
| 3338 | Au lieu de te plaindre, aide-moi. | `utterance` | `` |
| 3664 | La peinture s'écaille. | `utterance` | `` |
| 3076 | le mot de passe | `vocabulary` | `other` |
| 3297 | le taux de change | `vocabulary` | `other` |
| 3676 | grand | `vocabulary` | `adjective` |
| 3688 | cher | `vocabulary` | `adjective` |
| 3697 | souvent | `vocabulary` | `adverb` |
| 3712 | sur | `vocabulary` | `preposition` |
| 2990 | à côté de | `vocabulary` | `preposition` |
| 2854 | Avant. | `vocabulary` | `uncertain` |
| 3388 | bien cuit | `vocabulary` | `adjective` |
| 3804 | un | `number` | `` |
| 3826 | deuxième | `number` | `` |
| 3171 | un million | `number` | `` |
| 3360 | une douzaine | `number` | `` |
| 3497 | une dizaine | `number` | `` |
| 4470 | Une table pour deux, s'il vous plaît. | `utterance` | `` |
| 137 | Combien de ? | `incomplete` | `` |
| 2903 | Je m'appelle... | `incomplete` | `` |
| 2997 | À cause de... | `incomplete` | `` |
| 2228 | — Qui a appelé ? — C'était ta mère. | `review` | `` |

## Huit exceptions explicites à l’étiquette template

Les sources et leurs ellipses restent identiques. 2902 est une formule de prise de tour ; les sept autres sont du vocabulaire adverbial entier. Chaque affectation porte `sourceTemplateException: true`, `reviewStatus: reviewed` et une raison spécifique ; aucun emplacement n’est rempli.

| Indice | Source exacte | Traitement |
|---:|---|---|
| 2902 | Eh bien… | Formule entière de prise de tour : Eh bien est une réplique autonome malgré l’ellipse expressive ; aucune suite n’est inventée. |
| 3046 | À mon avis... | Locution adverbiale de point de vue, proposée comme vocabulaire entier ; l’ellipse de source reste inchangée, aucun avis n’est ajouté. |
| 3140 | Pour être honnête... | Locution adverbiale de franchise délimitée ; vocabulaire entier, pas modèle de phrase ni complément recomposé. |
| 3193 | En théorie... | Locution adverbiale de domaine délimitée ; vocabulaire entier malgré l’ellipse expressive, sans proposition ajoutée. |
| 3201 | Franchement... | Adverbe de manière ou d’énonciation isolé ; unité lexicale entière, sans compléter l’ellipse de source. |
| 3245 | En pratique... | Locution adverbiale de domaine délimitée ; vocabulaire entier, sans invention d’une phrase après l’ellipse. |
| 3292 | Personnellement... | Adverbe de point de vue isolé ; unité lexicale entière, sans proposition ni complément ajouté. |
| 3321 | Soit dit en passant... | Locution adverbiale d’incise délimitée ; vocabulaire entier, et non cadre à compléter malgré l’ellipse de source. |

## Répartition par niveau source

| Niveau source | Énoncés | Vocabulaire | Nombres | Ouverts | Réserve |
|---|---:|---:|---:|---:|---:|
| L1 | 60 | 205 | 5 | 23 | 0 |
| L2 | 426 | 100 | 5 | 16 | 1 |
| L3 | 455 | 163 | 7 | 7 | 0 |
| L4 | 372 | 213 | 6 | 4 | 0 |
| L5 | 441 | 228 | 6 | 7 | 1 |
| L6 | 370 | 57 | 0 | 10 | 2 |
| L7 | 374 | 43 | 2 | 5 | 6 |
| L8 | 303 | 66 | 1 | 3 | 29 |
| L9 | 167 | 56 | 1 | 3 | 0 |
| L10 | 176 | 61 | 0 | 5 | 9 |

## Sous-classes lexicales par niveau source

| Niveau source | Adjectifs | Prépositions | Adverbes | Autres | Incertains |
|---|---:|---:|---:|---:|---:|
| L1 | 68 | 10 | 61 | 62 | 4 |
| L2 | 15 | 1 | 27 | 56 | 1 |
| L3 | 9 | 0 | 12 | 142 | 0 |
| L4 | 7 | 0 | 10 | 194 | 2 |
| L5 | 6 | 0 | 6 | 216 | 0 |
| L6 | 3 | 0 | 6 | 48 | 0 |
| L7 | 0 | 0 | 4 | 37 | 2 |
| L8 | 3 | 0 | 2 | 60 | 1 |
| L9 | 0 | 0 | 2 | 53 | 1 |
| L10 | 7 | 1 | 3 | 50 | 0 |

Ce tableau utilise le niveau historique uniquement pour l’inventaire. Il ne réaffecte aucun niveau et ne touche pas aux droits d’accès. Le `reviewStatus` distingue les cas précisément examinés des décisions proposées par règles ; même le statut `reviewed` ne vaut pas validation native ou validation de la méthode phonétique.

## Réserves à examiner

| Indice | Source exacte | Motif |
|---:|---|---|
| 1923 | Toujours dans les meilleurs termes. | Autonomie de l’énoncé non établie par cette passe : vérifier s’il s’agit de vocabulaire, d’une consigne ou d’un fragment. |
| 1953 | frais de port inclus | Autonomie de l’énoncé non établie par cette passe : vérifier s’il s’agit de vocabulaire, d’une consigne ou d’un fragment. |
| 2228 | — Qui a appelé ? — C'était ta mère. | Plusieurs tours sont réunis dans la carte ; attribution des rôles à revoir sans scinder la source. |
| 2229 | — C'est combien ? — Ça fait dix euros. | Plusieurs tours sont réunis dans la carte ; attribution des rôles à revoir sans scinder la source. |
| 2230 | — Ça s'est bien passé ? — Mieux que prévu. | Plusieurs tours sont réunis dans la carte ; attribution des rôles à revoir sans scinder la source. |
| 2269 | — Quelle heure est-il ? — Il est trois heures. | Plusieurs tours sont réunis dans la carte ; attribution des rôles à revoir sans scinder la source. |
| 2271 | — Tu viens d'où ? — Je viens de Chine. | Plusieurs tours sont réunis dans la carte ; attribution des rôles à revoir sans scinder la source. |
| 2489 | — Tu t'appelles comment ? — Moi, c'est Léa. | Plusieurs tours sont réunis dans la carte ; attribution des rôles à revoir sans scinder la source. |
| 2490 | — Tu vas venir demain ? — Oui, sans faute. | Plusieurs tours sont réunis dans la carte ; attribution des rôles à revoir sans scinder la source. |
| 2491 | — Tu veux un café ? — Oui, volontiers. | Plusieurs tours sont réunis dans la carte ; attribution des rôles à revoir sans scinder la source. |
| 2492 | — Ça va ? — Oui, ça va bien, merci. | Plusieurs tours sont réunis dans la carte ; attribution des rôles à revoir sans scinder la source. |
| 2494 | — Pourquoi tu es en retard ? — J'ai raté le bus. | Plusieurs tours sont réunis dans la carte ; attribution des rôles à revoir sans scinder la source. |
| 2495 | — On mange quoi ce soir ? — J'ai fait des pâtes. | Plusieurs tours sont réunis dans la carte ; attribution des rôles à revoir sans scinder la source. |
| 2496 | — Tu parles français ? — Oui, un petit peu. | Plusieurs tours sont réunis dans la carte ; attribution des rôles à revoir sans scinder la source. |
| 2498 | — Tu es libre samedi ? — Ça dépend à quelle heure. | Plusieurs tours sont réunis dans la carte ; attribution des rôles à revoir sans scinder la source. |
| 2499 | — C'est loin ? — Non, c'est à cinq minutes. | Plusieurs tours sont réunis dans la carte ; attribution des rôles à revoir sans scinder la source. |
| 2537 | — Tu as bien dormi ? — Oui, comme un bébé. | Plusieurs tours sont réunis dans la carte ; attribution des rôles à revoir sans scinder la source. |
| 2538 | — Tu vas prendre lequel ? — Je vais prendre le bleu. | Plusieurs tours sont réunis dans la carte ; attribution des rôles à revoir sans scinder la source. |
| 2539 | — On y va ? — Oui, allons-y. | Plusieurs tours sont réunis dans la carte ; attribution des rôles à revoir sans scinder la source. |
| 2541 | — Depuis quand tu apprends le français ? — Depuis six mois. | Plusieurs tours sont réunis dans la carte ; attribution des rôles à revoir sans scinder la source. |
| 2542 | — Comment on dit ça en français ? — On dit « rendez-vous ». | Plusieurs tours sont réunis dans la carte ; attribution des rôles à revoir sans scinder la source. |
| 2559 | — Tu as aimé le film ? — Oui, je l'ai adoré. | Plusieurs tours sont réunis dans la carte ; attribution des rôles à revoir sans scinder la source. |
| 2560 | — Qu'est-ce que tu as fait hier ? — Je suis resté à la maison. | Plusieurs tours sont réunis dans la carte ; attribution des rôles à revoir sans scinder la source. |
| 2561 | — Tu en penses quoi ? — Franchement, j'hésite encore. | Plusieurs tours sont réunis dans la carte ; attribution des rôles à revoir sans scinder la source. |
| 2562 | — Où sont les toilettes ? — Au fond, à droite. | Plusieurs tours sont réunis dans la carte ; attribution des rôles à revoir sans scinder la source. |
| 2563 | — Comment tu as su que c'était moi ? — J'ai reconnu ta voix. | Plusieurs tours sont réunis dans la carte ; attribution des rôles à revoir sans scinder la source. |
| 2564 | — Qu'est-ce qu'on ferait sans toi ? — Vous vous débrouilleriez très bien. | Plusieurs tours sont réunis dans la carte ; attribution des rôles à revoir sans scinder la source. |
| 2565 | — Qu'est-ce qui ne va pas ? — Rien, juste un peu de fatigue. | Plusieurs tours sont réunis dans la carte ; attribution des rôles à revoir sans scinder la source. |
| 2566 | — Tu as reçu mon message ? — Oui, je viens de le lire. | Plusieurs tours sont réunis dans la carte ; attribution des rôles à revoir sans scinder la source. |
| 2574 | — Qu'est-ce que tu ferais à ma place ? — J'attendrais un peu. | Plusieurs tours sont réunis dans la carte ; attribution des rôles à revoir sans scinder la source. |
| 2575 | — C'était comment, avant ? — C'était beaucoup plus calme. | Plusieurs tours sont réunis dans la carte ; attribution des rôles à revoir sans scinder la source. |
| 2576 | — On se retrouve où ? — Devant la gare, comme d'habitude. | Plusieurs tours sont réunis dans la carte ; attribution des rôles à revoir sans scinder la source. |
| 2577 | — Tu te souviens de lui ? — Vaguement, ça remonte à loin. | Plusieurs tours sont réunis dans la carte ; attribution des rôles à revoir sans scinder la source. |
| 2578 | — Ça te dirait d'aller au cinéma ? — Bonne idée, on y va. | Plusieurs tours sont réunis dans la carte ; attribution des rôles à revoir sans scinder la source. |
| 2579 | — Où est-ce que tu veux en venir ? — Laisse-moi finir, tu vas comprendre. | Plusieurs tours sont réunis dans la carte ; attribution des rôles à revoir sans scinder la source. |
| 2782 | Si possible, avant vendredi. | Autonomie de l’énoncé non établie par cette passe : vérifier s’il s’agit de vocabulaire, d’une consigne ou d’un fragment. |
| 2798 | — Qu'est-ce qui t'a pris autant de temps ? — Il y avait un monde fou. | Plusieurs tours sont réunis dans la carte ; attribution des rôles à revoir sans scinder la source. |
| 2799 | — Comment ça se fait que tu sois déjà là ? — J'ai pris le premier train. | Plusieurs tours sont réunis dans la carte ; attribution des rôles à revoir sans scinder la source. |
| 2817 | Trente pour cent d'acompte, soixante-dix contre connaissement. | Autonomie de l’énoncé non établie par cette passe : vérifier s’il s’agit de vocabulaire, d’une consigne ou d’un fragment. |
| 2830 | — Qu'est-ce qu'on fera s'il pleut ? — On restera à la maison. | Plusieurs tours sont réunis dans la carte ; attribution des rôles à revoir sans scinder la source. |
| 2840 | — Tu es sûr que ça vaut le coup ? — Certain, tu ne le regretteras pas. | Plusieurs tours sont réunis dans la carte ; attribution des rôles à revoir sans scinder la source. |
| 2841 | — Tu ne trouves pas que ça fait beaucoup ? — Si, on devrait ralentir. | Plusieurs tours sont réunis dans la carte ; attribution des rôles à revoir sans scinder la source. |
| 2844 | — Et si on partait quelques jours ? — Pourquoi pas, j'en ai bien besoin. | Plusieurs tours sont réunis dans la carte ; attribution des rôles à revoir sans scinder la source. |
| 2845 | — Ça ne te dérange pas si j'ouvre ? — Pas du tout, vas-y. | Plusieurs tours sont réunis dans la carte ; attribution des rôles à revoir sans scinder la source. |
| 2982 | Au cas où. | Amorce conditionnelle ou réplique elliptique selon le contexte ; ne pas imposer comme production sans contexte. |
| 3178 | Suite à notre conversation. | Renvoi épistolaire sans proposition principale ; emploi à préciser avant production. |
| 3253 | Dans l'attente de votre retour. | Formule épistolaire suspendue : absence de proposition principale, autonomie à vérifier. |
| 3447 | Comme convenu. | Renvoi à un accord antérieur : autonomie ou fonction adverbiale à situer avant une production. |

## Reproduction

```sh
python3 -B tools/maquette-guidee/classify_fr.py
python3 -B tools/maquette-guidee/classify_fr.py --check
```

Empreinte canonique de `DECKS.fr` : `8ba6854ad6e77063c9d3d02b9696f1cfa0bf009265bda3f37200a007ed820acf`. Aucune phonétique n’a été normalisée ou inférée.
