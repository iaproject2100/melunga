# Vérification du parcours progressif complet (`afc39f3`)

Objet : le candidat `review/parcours-complet-progressif`, qui refait l'entrée L1 des sept couples et diffère 77 anciennes unités. J'ai vérifié ses chiffres contre les sources, mesuré la charge réelle du L1 présenté, et éprouvé son avertissement sur l'accès gratuit. Rien n'est fusionné ni publié.

## Verdict

**C'est le meilleur lot du dossier, et il règle le reproche de départ.** Son analyse de l'ancien L1 chinois est exacte au chiffre près, et elle est plus pénétrante que la mienne. La conservation est intacte : 13 078 champs contrôlés, **zéro écart**. Le L1 chinois passe de 96 caractères présentés d'un coup à **2 à la première leçon et 36 sur tout le niveau**, avec une montée dont aucune marche ne dépasse huit caractères.

Une seule réserve, et elle porte précisément sur le chiffre qui doit être indiscutable : **quatre des sept totaux d'accès gratuit ne se reproduisent pas chez moi.** Voir § 6.

## 1. Son diagnostic de l'ancien L1 chinois est exact, et meilleur que le mien

J'avais mesuré la charge de déchiffrage : 96 caractères. Il a cherché ailleurs et trouvé plus net. Vérifié en résolvant chaque carte par son texte, comme le fait `guidedPool()` :

**Famille `L1_ETAT_C_EST`, cadre `这是 + 信息`, celle qui ouvre le chinois guidé :**

| Étape | Phrase | Niveau réel | Sens |
|---|---|---|---|
| 1 | 这是什么？ | 1 | qu'est-ce que c'est ? |
| 2 | 这是谁的？ | 2 | c'est à qui ? |
| 3 | 这是几号出口？ | **4** | c'est quelle sortie ? |
| 4 | 这是几号车厢？ | **4** | c'est quelle voiture ? |
| 5 | 这是什么味道？ | 2 | c'est quel goût ? |
| 6 | 这是尺码表 | **4** | voici le tableau des tailles |
| 7 | 这是最终报价。 | **10** | **c'est notre prix final** |

**La septième carte de la première famille du chinois débutant est un devis commercial de niveau 10.** Et sur les 19 cartes qui ouvrent le parcours chinois, la répartition réelle des niveaux sources est `{1: 2, 2: 9, 3: 3, 4: 4, 10: 1}` — exactement ce qu'il annonce, au chiffre près. **Dix-sept des dix-neuf sont au-dessus du niveau 1.**

C'est là la cause du reproche de votre femme, et elle est plus directe que ma charge de caractères : ce n'était pas seulement beaucoup, c'était mal rangé.

Au passage, le contrôle confirme une fois de plus que `currentLevel` est faux : **11 des 19 cartes** portent un niveau annoncé différent du réel, dans les deux sens — 我需要休息 annoncé 1 alors qu'il est 3, 这是尺码表 annoncé 8 alors qu'il est 4. Ces champs restent inexploitables.

## 2. Conservation : intacte

| Contrôle | Résultat |
|---|---|
| Champs du curriculum comparés à leur source | **13 078 conformes, 0 écart** |
| Références non résolues par mon lecteur | **0** |
| Fragments de la scène café (`:refusal`, `:price`) | sous-chaînes exactes de leur tour parent |
| `newStudiedPhrases` / `newPhonetics` déclarés | 0 / 0 — confirmés |

Chaque phrase du nouveau L1 chinois vient d'une source existante : la salutation du tour `d1:t0`, les prénoms de l'unité 02, le dépannage de l'unité 11, la commande de l'unité 09, le refus et le prix des fragments déjà vérifiés. **Rien n'est inventé.**

## 3. Le L1 est enfin commun aux sept couples

Neuf microleçons, **la même suite de capacités dans les sept couples**, titres localisés pour le lecteur sinophone :

> saluer → donner son prénom → signaler une incompréhension → faire répéter → commander une boisson → changer de boisson → comprendre une offre et refuser → demander le prix → jouer l'échange au café

Son document établissait que l'ancien plan comptait **cinq ordres de compétences distincts** pour sept couples. Il n'y avait donc pas de L1 commun ; il y en a un maintenant. C'est la réponse directe à votre question « pourquoi chaque langue n'a pas le même pas ».

Et le principe énoncé est le bon : **les capacités sont communes, les formes restent propres à chaque langue.** Forcer la même mécanique grammaticale produirait de fausses substitutions — un nom coréen dont la particule change selon sa dernière consonne ne se comporte pas comme un groupe chinois à cadre stable.

## 4. La charge de déchiffrage, avant et après

| Couple | Ancien L1 (44 phrases) | Nouveau L1 (12 phrases) | |
|---|---|---|---|
| fr→en | 0 | 0 | — |
| fr→it | 3 | 2 | |
| fr→es | 6 | 3 | |
| zh→fr | 7 | 4 | |
| fr→ko | 92 | **41** | −55 % |
| **fr→zh** | **96** | **36** | **−62 %** |
| fr→ja | 107 | **45** | −58 % |

Mais le chiffre qui répond vraiment à votre question est la **montée**, pas le total :

| Leçon chinoise | Nouveaux caractères | Cumul |
|---|---|---|
| 1 · Saluer | **2** | 2 |
| 2 · Donner son prénom | 6 | 8 |
| 3 · Signaler une incompréhension | 2 | 10 |
| 4 · Faire répéter | 5 | 15 |
| 5 · Commander une boisson | **8** | 23 |
| 6 · Changer de boisson | 1 | 24 |
| 7 · Comprendre l'offre et refuser | 6 | 30 |
| 8 · Demander le prix | 6 | 36 |
| 9 · Au café : à toi de jouer | **0** | 36 |

**Le premier contact du débutant chinois est de deux caractères — 你好 — au lieu de quatre-vingt-seize.** Aucune marche ne dépasse huit caractères, et la leçon finale, l'échange au café, n'ajoute **rien** : elle ne réemploie que ce qui précède. C'est exactement la forme qu'on cherchait depuis le début.

Réponse à votre question 1, donc : **oui, c'est suffisamment simple.** Quatre caractères par leçon en moyenne, là où un cours de chinois pour débutants en introduit couramment dix à quinze par leçon. La charge est même conservatrice.

Un seul point à surveiller : **le japonais est le plus lourd** (45 au total, +10 à la deuxième leçon, la marche la plus raide des trois langues à écriture non latine). Si une langue doit être allégée encore, c'est celle-là, pas le chinois.

## 5. Les différés : conformes

| Annoncé | Mesuré |
|---|---|
| 77 unités différées | **77** |
| 48 vers L2, 28 vers L3, 1 vers L4 | **48 / 28 / 1** |
| 308 variantes restant gratuites | **308**, dans `freeLibrary` |

Onze entrées par couple, soit **l'intégralité de l'ancien L1** de chaque langue. Il faut le dire clairement, parce que « 77 unités différées » sous-estime la portée du changement : **l'ancien L1 n'est pas allégé, il est entièrement déplacé**, et un nouveau L1 de douze phrases est construit à la place. Les onze unités restent gratuites dans une bibliothèque distincte — vérifié, avec leurs quatre variantes chacune et toutes leurs aides.

C'est le bon choix pédagogiquement, et il mérite d'être présenté comme ce qu'il est : une refonte de l'entrée, pas un réglage.

## 6. La réserve : les totaux d'accès gratuit ne se reproduisent pas tous

C'est le chiffre censé prouver qu'aucun droit n'est perdu. Il doit donc être au-dessus de tout soupçon.

| Langue | Son total | Le mien | Écart |
|---|---|---|---|
| fr→en | 342 | **342** | ✔ |
| fr→zh | 331 | **331** | ✔ |
| zh→fr | 309 | **309** | ✔ |
| fr→es | 300 | 301 | **+1** |
| fr→it | 347 | 345 | **−2** |
| fr→ko | 284 | 283 | **−1** |
| fr→ja | 305 | 299 | **−6** |

Trois sur sept coïncident exactement avec ma méthode — cartes de niveau 1 du catalogue, union des cibles guidées `pathLv:1`. Quatre divergent, de 1 à 6 cartes, **dans les deux sens**.

J'ai cherché la cause évidente et elle n'y est pas : **toutes les cibles guidées se résolvent proprement dans leur deck, et aucune carte n'est dépourvue de niveau.** Ce n'est donc pas une carte manquante mais une convention de comptage qui diffère. L'écart est faible, mais il porte sur la garantie elle-même : il faut réconcilier les deux méthodes avant que ce tableau serve de preuve. Six cartes en japonais, c'est peu — sauf si ce sont six cartes qu'un apprenant perd.

Et son avertissement structurel est, lui, **entièrement confirmé** : en chinois, 314 cartes de catalogue lv1, 19 cartes guidées dont **17 absentes du catalogue lv1**, soit 331 distinctes. Comme `isFreeCard` ne teste que `lv === 1`, ces 17 cartes ne sont gratuites que par le parcours. Je peux les nommer — 这是最终报价。 (lv10), 我需要看医生 (lv4), 这是几号出口？ (lv4), 这是尺码表 (lv4), et treize autres. **Si l'entrée change et qu'elles quittent le parcours sans passer dans la bibliothèque gratuite, elles deviennent payantes par effet de bord.** C'est exactement ce que votre règle interdit, et c'est lui qui l'a vu.

## 7. Ses questions 3 et 4

**Les substitutions.** La structure ne déclare pas de champ « substitution » : elle enchaîne comprendre v0, imiter v0, comprendre v3, imiter v3, puis le choix. Par construction, retirer le préfixe et le suffixe communs aux deux phrases comparées laisse **une seule zone divergente**, et c'est le cas des 855 leçons concernées. Mon premier test en signalait la moitié comme fautives : il rejetait « a coffee » / « some water » au prétexte que la zone contient un espace, ce qui était absurde — un emplacement peut légitimement accueillir un groupe nominal. **Je m'apprêtais à vous signaler un défaut inexistant ; c'est la troisième fois cette semaine que mon instrument me trompe avant que le contenu ne me trompe.** Reste que la cohérence *grammaticale* de la zone ne se mesure pas : elle demande un lecteur natif.

**Les trente réserves.** Le README les décrit : trente anciens liens qui auraient pointé vers une famille désormais ultérieure, retirés des prérequis effectifs et conservés comme réserves. Je n'ai pas trouvé le champ correspondant dans les fichiers d'exécution — mes recherches sur `futureDependencies` et voisins ne rendent rien —, donc je ne peux ni confirmer ni infirmer que les trente sont bien hors des prérequis effectifs. **À me dire où elles sont consignées** et je vérifie ; en l'état, c'est le seul de ses cinq points que je n'ai pas pu contrôler.

## 8. Ce que je n'ai pas pu vérifier

**Le parcours hébergé.** Mon proxy refuse le trafic de navigateur vers l'extérieur ; je peux récupérer les fichiers servis, pas parcourir une leçon sur l'aperçu. Ses essais sont locaux, les miens aussi. **Personne n'a joué une leçon sur le site déployé** — c'est la même limite que pour les scènes café, et elle se referme de la même façon : vous ouvrez le lien et vous jouez le L1 chinois.

Le naturel linguistique des douze phrases du nouveau L1 relève de la relecture native, non de la mesure. Les neuf microleçons réutilisent des phrases déjà sourcées, mais **leur enchaînement est nouveau** : qu'une phrase existe ne dit pas qu'elle est à sa place.

## 9. Ce que je recommande

1. **Réconcilier les quatre totaux d'accès** (§ 6) avant que le tableau serve de garantie.
2. **Dire où sont consignées les trente réserves** (§ 7) pour que je puisse les contrôler.
3. **Regarder le japonais** (§ 4) : 45 caractères et une marche à +10, le plus lourd des trois.
4. **Jouer le L1 chinois sur l'aperçu** (§ 8), deux minutes.
5. **Faire relire les douze phrases du nouveau L1** par les mêmes relecteurs que les scènes café : l'enchaînement est neuf même si les phrases ne le sont pas.

Les tons du chinois ne sont toujours pas notés dans l'aide francophone, et il le dit — la divergence n'est pas harmonisée dans ce lot. C'est la seule des sept langues dont l'aide phonétique reste structurellement incomplète, et cela reste ouvert.

**Mon avis d'ensemble : ce candidat répond au reproche initial, et il y répond par la mesure et non par l'affirmation.** La réserve du § 6 est petite mais elle porte sur le mauvais chiffre pour être petite.
