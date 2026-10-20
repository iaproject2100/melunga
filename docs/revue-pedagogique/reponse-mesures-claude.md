# Réponse à Claude — sens et limites des mesures pédagogiques

Revue locale du 20 octobre 2026. Sources lues avec `git show` sur `origin/review/pedagogie-maquettes` (`907a235`) : `revue-claude.md`, `mesures/README.md`, `mesure_briques.py`, `mesure_dialogues.py`. Scripts rejoués sans modifier leur calcul sur les 70 JSON du commit audité `49dca94`, extraits temporairement hors du dépôt. Aucune modification applicative, aucun push ni publication.

## Conclusion

Les résultats **62 % en L2** et **51 % pour les dialogues L1** sont reproduits. Ce sont des repères lexicaux utiles pour repérer une charge de nouveauté et guider une relecture. Il faut toutefois préciser ce qu’ils comptent avant de leur attribuer une signification pédagogique.

Deux corrections de formulation sont nécessaires :

1. « La moitié de ce que l’apprenant entend n’a jamais été préparée » est trop fort : le calcul porte sur des **formes écrites distinctes**, dans un sous-ensemble du contenu, et non sur les occurrences entendues, la compréhension ou l’historique réel de l’apprenant.
2. « Dialogues coréens L1 préparés à 18 % » confond le pire dialogue (`L1-fr-ko-d2`) et tout le niveau. Pour le niveau coréen L1, l’indicateur donne **64 % non retrouvés**, donc **36 % retrouvés** dans les variantes ; 18 % retrouvés correspond seulement au dialogue de gare.

La recommandation de mieux préparer les répliques reçues reste solide. Les chiffres la complètent ; ils ne remplacent pas les exemples de difficultés, la revue des structures et les essais avec Kartech.

## Ce que calcule exactement chaque script

### `mesure_briques.py`

Pour un couple et un niveau :

- rassemble les variantes **et** toutes les répliques des dialogues du niveau ;
- transforme ces phrases en tokens selon la langue ;
- ne conserve, pour le pourcentage, que les **types distincts** ;
- calcule `types du niveau absents de tous les niveaux précédents / types distincts du niveau` ;
- ajoute ensuite tous les types du niveau à l’ensemble « déjà vu », même ceux qui ne figurent que dans un dialogue non préparé.

Le résultat n’est donc ni « pourcentage de nouveaux mots dans chaque phrase », ni pourcentage des occurrences rencontrées. La docstring parle de « briques d’une phrase » ; le calcul réel agrège tout le niveau.

### `mesure_dialogues.py`

Pour un couple et un niveau :

- considère comme préparés tous les types des variantes du niveau, ainsi que tous les types des niveaux précédents, variantes **et** dialogues ;
- rassemble les types distincts de l’ensemble des dialogues du niveau ;
- calcule `types des dialogues absents de cet ensemble préparé / types distincts des dialogues`.

Le tableau de niveau porte sur l’**union des types des dialogues**, pas la moyenne des trois pourcentages individuels. Le classement final calcule séparément un ratio par dialogue.

### La ligne « moyenne »

Elle est un **ratio agrégé pondéré par le nombre de types**, pas une moyenne arithmétique donnant le même poids à chacun des sept couples.

- Nouveauté L2 : **527 / 855 = 61,64 %**, arrondi à **62 %**. La moyenne arithmétique des sept ratios serait 62,34 % ; l’arrondi cache ici la différence.
- Dialogues L1 : **231 / 454 = 50,88 %**, arrondi à **51 %**. La moyenne arithmétique des sept ratios serait **52,54 %**, arrondie à **53 %**.

Formulation recommandée : « ratio agrégé des types selon la segmentation retenue, sur les sept couples audités ». Les types identiques sont dédupliqués dans un couple/niveau ; un type commun à plusieurs couples est compté séparément pour chacun.

## Segmentation et comparaison entre langues

| Langue étudiée | Unité réellement comptée | Effet sur l’interprétation |
|---|---|---|
| zh, ja | Un caractère dans la plage Unicode utilisée | Un caractère connu ne garantit pas la connaissance du mot composé, de sa lecture, de son sens contextuel ou de sa structure. En japonais, les mêmes kana présents dans de nombreux mots réduisent mécaniquement le ratio. |
| ko | Une suite continue de syllabes hangul séparée par espaces/ponctuation | La particule ou la terminaison fait partie du token. Une racine familière dans une nouvelle forme devient un type nouveau ; ce n’est pas nécessairement un nouveau mot ou concept. |
| Autres langues | Une suite de lettres mise en minuscules | Flexions et clitiques séparés par apostrophe restent traités comme formes de surface, sans lemmatisation ni analyse des groupes de sens. |

Les nombres écrits en chiffres sont ignorés par ces tokenisations ; pourtant comprendre un horaire ou un prix peut être la principale difficulté du dialogue. Les lettres latines insérées dans une phrase chinoise, japonaise ou coréenne ne sont pas prises en compte par ces branches. Le calcul ne mesure pas l’audio ni la phonétique du lecteur.

**Conséquence :** les ratios ne permettent pas de classer directement les langues du « meilleur » au « pire » réemploi. Ils comparent des unités différentes. Ils peuvent servir de signal avant/après au sein d’un même couple et d’un périmètre stable, avec contrôle humain des changements.

## Cas coréen : résultat utile, classement à nuancer

Les scripts reproduisent :

- nouveauté L2 : 77 % des formes retenues ne sont pas présentes dans L1 ;
- nouveauté L10 : 57 % des formes retenues ne sont pas présentes dans L1–L9 ;
- dialogues L1 agrégés : **35 / 55 = 63,64 %** des types ne sont pas retrouvés dans les variantes L1, donc **20 / 55 = 36,36 %** y sont retrouvés ;
- dialogue de gare L1 : **18 / 22 = 81,82 %** non retrouvés, donc **4 / 22 = 18,18 %** retrouvés.

Exemple précis du dialogue de gare : `표가` est compté nouveau alors que `표` a déjà été présenté. Le nom « billet » est familier, mais sa particule est attachée à la forme écrite. De même, `가요` dans les variantes ne fait pas reconnaître automatiquement `가는` ou `가세요` comme des formes liées. Les nouvelles particules et terminaisons peuvent être de vraies difficultés à préparer ; elles ne doivent simplement pas être étiquetées toutes comme nouveau lexique.

Le dialogue ajoute aussi de vraies nouveautés : destination `부산`, nombre `만`, compteur `장`, direction `쭉`, formules de voyage. Il faut donc **garder le signal et vérifier les briques**, sans réduire toute la différence à un artefact technique.

La configuration coréenne manquante du parcours guidé est un constat indépendant, confirmé dans le périmètre audité. Formulation recommandée : « le coréen demande une revue prioritaire de sa préparation et de ses formes, et sa configuration guidée manque dans cette version ». Éviter « pédagogiquement le plus faible » ou « celui qui réemploie le moins » sur la seule base de ces ratios.

## Pourquoi 51 % ne signifie pas « la moitié de ce qu’il entend »

1. **Types ≠ occurrences.** Un token rare entendu une fois et un token répété dix fois pèsent chacun une unité. À titre de contrôle, avec la même tokenisation mais en comptant les occurrences des répliques L1, la part non retrouvée est **276 / 683 = 40,41 %**. Ce chiffre différent n’est pas davantage une mesure de compréhension ; il montre pourquoi on ne doit pas parler de « moitié de ce qu’il entend » à partir de types distincts.
2. **Contenu potentiel ≠ contenu effectivement préparé.** Toutes les variantes du niveau sont supposées disponibles avant chacun de ses dialogues, même si la séquence réelle ne les a pas encore montrées.
3. **Présent précédemment ≠ acquis.** Une forme vue uniquement dans un dialogue L1 non préparé est considérée connue à partir de L2. Cela peut sous-estimer les reprises nécessaires.
4. **Sous-ensemble ≠ tout le site.** Les scripts utilisent les JSON conversation, sans les cartes classiques, les autres écrans, l’expérience extérieure ou le vocabulaire personnel de l’apprenant. « Jamais préparée » doit donc signifier « non retrouvée dans les sources retenues par ce calcul ».
5. **Recouvrement écrit ≠ compréhension.** Le calcul ne détecte ni un mot composé nouveau avec des caractères familiers, ni une nouvelle structure avec des mots anciens, ni la reconnaissance à l’écoute d’une forme familière.

**Phrase de remplacement proposée :**

> Dans les 70 fichiers audités, environ 51 % des types écrits retenus par notre tokenisation pour les dialogues L1 ne sont pas retrouvés dans les variantes L1. C’est un signal de préparation à vérifier réplique par réplique, et non un pourcentage de ce que l’apprenant comprend ou entend pour la première fois.

## Périmètre ancien et contenu nouveau

Le calcul reproduit ici est celui des **70 fichiers / sept couples du commit `49dca94`**. La revue annonce ensuite 110 fichiers et onze couples dans le dépôt plus récent. Ces deux périmètres peuvent coexister, mais les chiffres anciens ne décrivent pas automatiquement les quatre nouveaux couples, ni leurs aides pour lecteurs anglophones. Si les scripts sont relancés sur les onze couples, le nouveau tableau doit indiquer le commit et le nombre de couples ; sa ligne agrégée ne doit pas être comparée directement à l’ancienne comme une amélioration pédagogique.

## Utilisation proposée pour la suite

- Conserver les deux mesures comme **alertes exploratoires**, avec commit, couple, segmentation, numérateur et dénominateur.
- Renommer clairement les colonnes : « types écrits nouveaux selon la tokenisation » et « types des dialogues non retrouvés dans la préparation retenue ».
- Comparer surtout une séquence avant/après dans le même couple. Un bon changement rend les briques et les réponses reçues plus accessibles ; il ne cherche pas seulement à abaisser un ratio.
- Compléter par la fiche pédagogique : connu → nouveauté → oral reçu → réemploi personnel, et par l’essai sur les trois supports. Aucun seuil de ces scripts ne doit bloquer l’apprenant ni certifier une maîtrise.
- Pour `bricks` / `introduces`, distinguer lexique, groupes de sens, structures, nouvelles formes et cible de production/compréhension. Une métadonnée déclarée n’est pas une preuve que la brique a été comprise ; un contrôle automatique peut vérifier les références et la cohérence, pas observer l’apprentissage.

## Réponse courte à transmettre à Claude

> J’ai reproduit les tableaux : 62 % L2 et 51 % dialogues L1 sont exacts sur `49dca94`. Gardons-les comme repères lexicaux. Il faut préciser qu’il s’agit de types écrits, avec une agrégation pondérée, et que zh/ja sont segmentés en caractères tandis que ko conserve les particules/terminaisons dans les formes. Cela ne permet pas un classement pédagogique direct entre langues ni l’affirmation « la moitié de ce que l’apprenant entend n’a jamais été préparée ». Correction factuelle : 18 % préparés concerne seulement `L1-fr-ko-d2` ; l’agrégat coréen L1 est 36 % retrouvés dans les variantes. Le besoin de préparer l’oral reçu reste confirmé. Les mesures portent sur sept couples, pas automatiquement sur les onze plus récents. Je propose avertissements et revue des briques, sans seuil de maîtrise ni verrou pour l’apprenant.
