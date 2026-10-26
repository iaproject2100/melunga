# Contre-lecture des 259 aides du lot 4

**259 aides entières avant/après ont été lues**, avec leur texte français, leur
sens chinois et leur alignement, en cinq lots sans troncature. Référence des
avant : `606592c` ; preuve livrée : `7631c0f`.

La conclusion est bornée : **aucun faux positif certain trouvé sur les segments
visés qui imposerait d’exclure un événement de cette liste figée**. Cela ne certifie
pas chaque son des 259 aides après correction et ne transforme aucune recherche
de famille en règle applicable à d’autres cartes. Des réserves de convention et
de complétude de certaines aides restent explicites ci-dessous.

## Avant, source et copies

Les 259 identifiants sont distincts. Leurs avant entiers — cible, sens et aide —
coïncident avec leur occurrence réelle dans le Git `606592c`. Aucun objet ciblé
ne porte de correction des lots précédents. Les compteurs de transport du registre
se reproduisent : **15 cartes ont une copie**.

Au total, la correction concerne **275 objets** : 257 cartes canoniques, quinze
copies de transport et trois modèles reçus. Deux de ces modèles ont un identifiant
`heard-authored`; le troisième réutilise un identifiant canonique. Les aides des
copies et des modèles reçus sont les mêmes avant entiers, sans recomposition.

## Ce que la lecture confirme

- Les 50 aides T laissent réellement des mots de la cible sans repère ; les après
  les rétablissent, y compris les fins de demandes, compléments de lieu, objections
  et formules professionnelles. Les modèles qui restent ouverts ne deviennent pas
  pour autant des phrases complètes à produire.
- Les liaisons entre déterminant et nom, entre pronom préverbal et verbe, après
  `en` devant un mot vocalique ou dans une expression figée comme « petit à petit »
  apportent le segment attendu. Les corrections de fausse liaison retirent les
  `z`, `t` ou `n` qui n’appartiennent pas au texte, sans étendre une liaison
  facultative par défaut.
- Le contraste « un/une » et « bon/bonne » est préservé dans les cibles lues.
  Les rendus avec enchaînement avant voyelle sont vérifiés comme groupes entiers,
  pas en recollant une prétendue aide indépendante de chaque mot.
- Les changements d’une finale nasale de « fonction » vers la finale orale de
  « fonctionne », des finales prononcées manquantes, des consonnes perdues et des
  formes telles que « coiffe/coiffé » ou « viennes/viens » correspondent aux
  différences visées. Les occurrences de `plus` sont jugées dans leur sens
  additionnel, sans généraliser le `s` à tous ses usages.
- Les six aides utilisant l’alphabet latin ou des caractères cyrilliques sont
  remplacées par des aides en caractères chinois, conformément au couple zh→fr.
  L’épellation de B et QR est traitée dans les événements nommés, sans imposer
  rétrospectivement une nouvelle convention à tous les sigles.

Le `t` retenu dans certaines aides après `est/c’est` est une réalisation possible,
mais il ne faut pas déclarer toute liaison après ces formes universellement
obligatoire. Les réalisations après `fait`, `faut`, un verbe conjugué ou un
pronom inversé ne sont pas rétablies par une règle automatique.

## Des motifs à synchroniser avec les après livrés

| Événement | Carte | Écart documentaire |
|---|---|---|
| 43 | `catalogue:fr:604` | L’après de « bus » est **比斯** ; le motif cite encore **布斯**. |
| 150 | `catalogue:fr:2158` | L’après emploie **云** sans liaison facultative en z ; la fin du motif cite encore **祖讷**. |
| 191 | `catalogue:fr:2463` | L’après emploie **戎** dans « exigeons » ; le motif cite encore **雄**. |

Ces différences ne changent pas les valeurs figées à intégrer. La documentation
doit citer la valeur effectivement livrée, pas l’ancienne variante envisagée.

## Réserves sur l’aide entière, sans modification silencieuse

- **2573, « de l’autre » → 德 楼特** : la nouvelle aide entière ne comporte pas
  de repère explicite pour le r final, alors que le latin `LOHTR` le marquait.
  À vérifier avec la convention des groupes finaux et un lecteur natif ; le
  remplacement d’alphabet ne suffit pas à certifier la complétude phonémique.
- **3883, « savon » → 萨旺** : un début de syllabe de type w reste une
  approximation de v, et 旺 déplace aussi le repère vocalique. Vérifier le
  rendu de `[vɔ̃]` avant de présenter cela comme la restauration exacte du v.
- Les cinq exemples signalés de `[vy]` utilisent 维 : ce repère ne représente
  pas exactement à lui seul le v et la voyelle u français. La réserve du
  fichier de conventions est donc justifiée et reste ouverte.
- Les nasales françaises, les voyelles arrondies antérieures et les syllabes
  d’appui n’ont pas toujours d’équivalent chinois. Les graphies de « production »,
  « réduction », « bus » ou « yeux » suivent une approximation déclarée ; une
  amélioration ciblée ne remplace pas l’oreille.

Aucun de ces points n’autorise un remplacement général ni la fabrication d’une
aide nouvelle par assemblage de morceaux. La distinction entre segment amélioré,
convention choisie et aide entière native demeure nécessaire.

## D’où viennent les 50 aides tronquées ?

Pour les **50 événements T**, le texte étudié entier et l’aide courte sont déjà
présents **au caractère près dans `DECKS.fr` du `app.html` de référence**. Le
raccord au parcours, les copies de transport et le rendu à l’écran n’ont donc
pas créé ces omissions. Le défaut remonte aux données classiques.

Cette vérification établit l’origine des valeurs, pas le mécanisme éditorial
historique qui les a produites. Elle ne démontre ni une limite de longueur commune,
ni un recadrage automatique d’interface, ni la cause d’une génération antérieure.
Le catalogue source est laissé intact ; les corrections sont déclarées dans
la couche de génération prévue par le lot.

Les 259 lectures, les avant exacts et les profils sont conservés dans
[alignements-preuves.json](alignements-preuves.json).
Aucun fichier produit, source, prix, droit ou interface n’a été modifié par
cette contre-lecture. Une écoute native sinophone et francophone reste distincte.
