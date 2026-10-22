# Vérification du suivi de reclassement (`a4f1ec4`)

Objet : `a4f1ec4` sur `review/progression-L1-L10`, qui répond à ma vérification de `99478df` et à ma propre correction. Rien n'est fusionné ni publié.

## Verdict

**Le lot est juste, et c'est lui qui corrige mes mesures, pas l'inverse.** Ses 32 valeurs de nouveauté se reproduisent **au millième** depuis ma propre implémentation de son hypothèse, et il a relevé **trois artefacts d'arrondi chez moi**, tous réels. Ses trois affirmations structurelles sont vérifiées : **0 déplacement de niveau, 0 phrase ou phonétique modifiée**, 9 réordonnancements internes, 2 comparaisons revues, 15 unités aux liens de préparation changés.

Un seul point reste ouvert, et c'est lui qui le signale : **l'espagnol échange un défaut contre un autre.**

## 1. Trois artefacts d'arrondi dans mes mesures

| Ma mesure | Ce que j'avais écrit | Valeur exacte | Conséquence |
|---|---|---|---|
| Longueur, total des inversions | 21 → **16** | 21 → **17** | fr→ko L2 = 7,0625 reste supérieur à L3 = 7,05, mais les deux arrondissent à 7,1 : j'avais perdu une inversion réelle |
| Nouveauté, fr→es | après : `L3<L4 · L7<L8` | + **`L9<L10`** | L9 = 37,864 % → L10 = 38,462 % : marche réelle masquée par l'arrondi à l'entier (38 → 38) |
| Nouveauté, zh→fr | après : `L8<L9` | + **`L3<L4`** | L3 = 56,637 % → L4 = 56,757 % : même cause (57 → 57) |

Les trois sont confirmés par mon propre calcul. Les deux dernières aggravent légèrement le constat espagnol et nuancent le constat sinophone — elles vont donc contre moi dans un cas et contre lui dans l'autre, ce qui est le signe qu'il a mesuré et non plaidé.

Sa formulation est en outre plus honnête que la mienne : il écrit que son hypothèse « reproduit numériquement les sept lignes, sans établir que son implémentation est celle de Claude ». C'est exactement le statut de son travail, et je confirme que l'hypothèse qu'il décrit — quatre variantes entières, dialogues exclus, groupes de lettres Unicode minuscules, caractères lettre/nombre pour zh/ja/ko — redonne mes chiffres à l'identique.

## 2. L'espagnol : mon « inchangé » était trop grossier

J'avais conclu que fr→es ne s'améliorait sur aucun indicateur. La **liste** des marches est bien inchangée, mais leur **taille** a changé, et dans deux directions opposées :

| Marche | Source | Après reclassement | |
|---|---|---|---|
| L3 → L4 | 61,798 → 64,762 % — écart **+2,964 pt** | 57,282 → 63,636 % — écart **+6,355 pt** | **aggravée** |
| L7 → L8 | 35,965 → 47,727 % — écart **+11,762 pt** | 34,579 → 42,391 % — écart **+7,812 pt** | **améliorée** |

Vérifié au millième depuis mes propres calculs : les trois valeurs qu'il annonce sont exactes.

Le reclassement a donc **amélioré l'espagnol là où je m'en plaignais (L7→L8, le pic qui motivait tout le lot) et l'a dégradé plus tôt (L3→L4)**. « Une liste de marches inchangée ne signifie pas que toutes les charges sont inchangées » — sa phrase est juste et c'est la bonne correction de ma conclusion. L'espagnol reste le couple à reprendre, mais pour une raison précise : la charge s'est déplacée vers L4, pas pour une absence d'effet.

Même logique pour zh→fr : la remontée passe de L6→L7 (+9,434 pt) à L8→L9 (+1,366 pt). Le déplacement s'accompagne d'une réduction de charge d'un facteur sept. Ce n'était pas lisible dans ma liste de marches.

## 3. Les deux comparaisons revues — dont une qui comble un trou de mon contrôle

**`L9-fr-es-13` « Falta {s}. » — correction importante.** L'ancienne description annonçait « le nom du manque dans le groupe *una* + nom ». Or les quatre variantes sont *una firma*, *un documento*, *la fecha*, *el sello* : **le déterminant varie en genre et en définitude**. Présenter *una* comme invariant aurait enseigné une fausse régularité. La nouvelle description dit « le groupe nominal entier, déterminant inclus et appris avec chaque groupe ; aucun article invariant n'est supposé ».

Ce défaut est exactement le « changement supplémentaire caché » que sa question 2 visait, et **mon contrôle mécanique ne pouvait pas le voir** : je vérifiais que `additionalOperations` était vide et que l'invariant encadrait bien les variantes citées, ce qui était le cas. Le défaut était dans la *description* de l'invariant, pas dans sa forme. C'est une limite de mon contrôle qu'il a trouvée avant moi.

**`L8-fr-es-05` « ¿Sería posible {s}? »** — les variantes comparées passent de [0, 3] à [0, 2] : *pagar en dos veces* est désormais comparé à *cambiar de habitación* (verbe + préposition + nom) au lieu de *aplazar la cita* (verbe + objet direct). La paire est structurellement parallèle. Raffinement juste.

## 4. Les 21 liens de préparation ajoutés

J'ai mesuré le recouvrement lexical entre chaque lien ajouté et sa cible. **20 des 21 en ont un**, et le vingt-et-unième est déclaré comme un lien de construction :

- `L9-zh-fr-10 ← L9-zh-fr-07` : 5 formes communes (*demain, prendre, prochain, revenir, train*) — dépendance forte à l'intérieur d'un même niveau, ce qui justifie précisément les réordonnancements.
- `L9-zh-fr-07 ← L6-zh-fr-05` : 4 communes (*demain, midi, rendez, vous*).
- `L8-fr-it-03 ← L8-fr-it-07` : 3 communes (*sconto, prezzo, uno*) — on ne pose pas une condition sur une remise avant de savoir la demander.
- `L9-zh-fr-06 ← L5-zh-fr-12` : **aucun recouvrement lexical**, et sa raison déclarée l'assume : « relier les incidents aux antécédents du passé **avec être** ». *Je suis arrivé* prépare le passé composé en *être*, que *j'ai perdu* vient contraster. C'est un lien de construction, exactement la distinction qu'il annonce faire.

**Et ma mesure sous-détecte.** Mon filtre écartait les mots de deux lettres ou moins, donc il a manqué le lien le plus évident du lot : `L9-zh-fr-12 ← L2-zh-fr-08`, où *Il y a du wifi ?* prépare *Il y a un problème*. Mon calcul n'a vu que l'article *une* en commun et classait ce lien comme faible. **« Il y a », « c'est », « on a » — les structures françaises qui comptent le plus sont faites de mots courts, et mon filtre les efface.** Le soutien réel de ses liens est donc supérieur à 20 sur 21.

Mon soupçon initial — des liens ajoutés pour satisfaire un compte plutôt qu'une dépendance — n'est pas fondé.

## 5. Ce que ce lot ne peut pas démontrer, et il le dit

Puisque aucun niveau ne bouge, **les ratios par niveau sont inchangés par construction** : ni sa mesure ni la mienne ne peut évaluer l'effet de ces 26 amendements. Il l'écrit lui-même — « ces amendements concernent l'ordre de découverte et les reprises. Leur effet sur l'apprentissage reste à observer ». C'est exact, et c'est pourquoi la vérification de ce lot est une lecture au fond, non un calcul : c'est ce que fait le § 3 et le § 4.

Ses 56 tests et 23 664 étapes navigateur contrôlent la cohérence du plan, pas la progressivité. Sa table de sensibilité au périmètre est en outre instructive : en incluant les dialogues restés à leur niveau source, les conclusions changent pour plusieurs couples. **Mon choix de ne compter que les variantes était un choix, avec des conséquences que je n'avais pas explicitées.**

## 6. Ce qui reste

1. **Espagnol L3→L4**, charge portée de +2,964 à +6,355 points. C'est le seul point ouvert du lot, et il est désormais localisé.
2. **La relecture native des sept scènes L1**, qui est un lot distinct et reste le seul verrou avant publication.

Le reste de l'audit initial est hors de ce lot : le déficit lexical italien L8 — 6 réserves sur 10 unités, non réputé résolu —, le registre de `L1-03` en ja et ko, et la décision phonétique chinoise à prendre règle par règle.

## 7. Note de méthode, pour moi

Trois corrections de mes propres mesures en deux échanges : un indicateur absolu appliqué à des langues de longueurs différentes, un arrondi à l'entier qui masque des marches, un filtre de longueur qui efface les mots-outils français. À retenir : **publier le seuil, l'arrondi et le périmètre avec le chiffre**, systématiquement. Il l'a fait dès son premier relevé ; je ne l'avais pas fait.
