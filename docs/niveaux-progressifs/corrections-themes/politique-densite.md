# Densité, pertinence et premières rencontres

Décision de Kartech : une rubrique ne doit pas ouvrir sur un mot isolé, ni être
remplie par des intrus. Codex assume le classement, la progression, la pertinence,
la densité et l'enrichissement. Claude vérifie uniquement les phonétiques
nouvelles ou signalées. Aucun formulaire de validation externe ne remplace ce
travail éditorial.

## Ce qui doit changer

La mesure de départ porte sur 70 cellules : 1 272 thèmes affichés, dont **85 à
un élément** et **389 à moins de six**. Les listes et empreintes de cette photo
de départ sont dans `politique-densite.json`. Ce ne sont pas les résultats du
lot corrigé et ils ne prouvent pas que tous les autres thèmes sont pertinents.

Une carte de thème doit proposer **au moins six présentations cohérentes** :
ses premières rencontres, complétées si nécessaire par des révisions sourcées.
Six est une règle d'affichage, pas une autorisation de remplir une rubrique avec
des mots étrangers à son sujet. Les variantes de genre réelles peuvent être
apprises, mais ne sont pas présentées comme six concepts différents.

Les canoniques restent une seule fois dans `themes[].phrases`. Les révisions
sont des `reviewReferences` distinctes : même famille, même type de contenu,
première rencontre à un niveau strictement antérieur et effectivement
présentable. Un élément futur ou tenu en réserve ne devient pas une révision.
Les compteurs séparent premières rencontres, révisions et présentations.

Les révisions et leur rappel précèdent les nouveautés, dans des groupes de
pratique distincts. Dans chacun de ces deux blocs, les adjectifs regroupent les
concepts et leurs formes attestées : grand, petit, gros, beau, léger, lourd,
triste, heureux, puis les autres propriétés ; les prérequis explicites gardent
priorité. Les nombres suivent leur ordre numérique déclaré. Les autres
révisions suivent l’ordre de première rencontre. Aucun de ces tris n’invente
une forme grammaticale ou une phonétique.

## Enrichir avant de cacher

Pour un stock insuffisant, l'ordre de travail est :

1. Réunir les éléments qui partagent réellement une situation ou une famille
   lexicale, sans créer une rubrique « Divers ».
2. Introduire plus tôt un lexème simple existant, avec index, champs exacts et
   décision éditoriale explicite. Son `lv` source reste inchangé.
3. Rédiger une entrée entière si la recherche démontre un vrai manque ; déclarer
   cette nouveauté et sa phonétique au lieu de prétendre l'avoir extraite.
4. Compléter par des rappels antérieurs choisis pour le besoin du niveau.
5. Documenter la destination cohérente de tout reliquat. Le conserver dans
   l'inventaire et le stock canonique ; ne pas le rendre introuvable ni publier
   une carte à un seul mot sous prétexte que sa source existe.

Un regroupement conserve les IDs et origines, explique son sujet et ne mélange
pas mots et phrases par commodité. L'état `insufficient-source-repertoire-or-needs-coherent-grouping`
signale le travail restant ; il ne constitue pas une suppression de cartes.

## Trois destinations qui manquaient

| Famille | Titre français | Titre chinois |
| --- | --- | --- |
| `vocab-couleurs` | Couleurs | 颜色 |
| `vocab-nature` | Nature, jardin et météo | 自然、园艺与天气 |
| `vocab-loisirs` | Loisirs et culture | 休闲与文化 |

Maison devient **Maison et mobilier** / **居家与家具**, avec le même ID et les
mêmes visuels. Les plantes, animaux et phénomènes naturels ne vont plus dans
Maison faute de destination. La musique, le cinéma et les sports ne vont plus
dans Actions ou Travail par défaut. Un film d'emballage n'est pas un film de
cinéma ; une batterie d'appareil n'est pas un instrument. Les décisions
explicites de source priment sur les signaux automatiques.

Couleurs est distinct d'Adjectifs : une entrée lexicale de couleur reconnue
porte `lexicalClass: color` et une seule famille canonique. Une phrase qui
décrit une couleur reste une phrase. Orange et marron exigent leur sens source.

## Introductions lexicales déjà disponibles

`introductions-lexicales.json` propose **323 références de sources existantes**,
avec index, niveau source, niveau éditorial proposé, empreinte et champs entiers.
Ce n'est ni une modification du catalogue ni une rédaction de 323 cartes.

- Adjectifs : taille, aspect et poids simples en L1 ; émotions sources retenues
  en L2 ; caractère, dont radin et égoïste, en L3. Les nouvelles entrées du lot
  séparé complètent ce que les sources ne fournissent pas.
- Couleurs : palette de base en L1, compléments en L2, nuances entières attestées
  en L3. Les niveaux suivants rappellent ce répertoire ; dix palettes de
  difficulté artificielle ne sont pas créées.
- Nature : six noms concrets de départ, puis paysages et autres éléments
  naturels. La source entière, article éventuel compris, est conservée ; aucune
  règle d'article inconnue n'est fabriquée ou supposée acquise.
- Loisirs : noms usuels préparant les échanges culturels, puis activités et
  instruments. Les groupes verbaux « regarder un film » et « écouter de la
  musique » ne sont jamais découpés pour fabriquer les noms qui manquent.

| Couple | Adjectifs sources sélectionnés L1 | Couleurs/lexique couleur L1 | Nature L1 | Loisirs L1 |
| --- | ---: | ---: | ---: | ---: |
| fr→en | 3 | 8 | 6 | 6 |
| fr→es | 2 | 8 | 0 | 0 |
| fr→it | 4 | 8 | 6 | 6 |
| fr→zh | 5 | 7 | 6 | 1 |
| fr→ja | 4 | 8 | 6 | 6 |
| fr→ko | 4 | 8 | 6 | 6 |
| zh→fr | 4 | 8 | 6 | 6 |

Ces chiffres ne comptent que la sélection explicite de ce fichier, pas tous
les adjectifs déjà classés. Le chinois compte six noms de couleurs et le mot
« couleur », pas sept couleurs différentes. Le stock rédigé dans `enrichissements-rediges.json` reste compté et signalé
séparément, avec les aides nouvelles à vérifier par Claude.

La recherche ciblée ne trouve pas les noms autonomes Nature/Loisirs retenus en
espagnol, ni un répertoire complet de noms de loisirs en chinois. Ce sont des
besoins de rédaction ou de recherche élargie, pas une raison de couper des
phrases ou de cacher la lacune. Ils ne se confondent pas avec les mots déjà
présents à un niveau source plus élevé.

## Formes et reprise progressive

Grand, petit, gros, beau/belle, léger/légère, lourd, radin, égoïste, triste et
heureux représentent des besoins sémantiques, pas dix morphologies identiques.
En français, espagnol et italien, seules les formes réellement sourcées ou
rédigées sont proposées ; aucun féminin n'est calculé automatiquement. En
anglais, on n'en invente pas. Les distinctions de sens comme big/tall ou
fat/large restent explicites.

Une forme descriptive coréenne adnominale entière peut être lexicale avec
`requiresNoun: true` : elle s'emploie devant un nom et ne devient pas une phrase
autonome. Le japonais conserve les propriétés de ses formes lexicales et de
leur emploi. Le chinois ne reçoit aucun ajout automatique de 是 ou 很. Toutes
les aides sources restent intactes.

Le JSON fournit, pour les 70 cellules, le stock d'adjectifs planifié et les
candidats antérieurs, ainsi que des orientations allant des propriétés
concrètes à l'appréciation nuancée. **Disponibilité numérique n'est pas
pertinence validée** : Codex choisit les rappels utiles à la capacité du niveau.
Une référence antérieure n'est pas une mesure de ce que l'apprenant a acquis.

Le `lv` du catalogue reste la frontière de droits historique ; ce lot n'en
modifie aucune valeur. Aucun prix ni abonnement n'est modifié. Des graines lexicales supplémentaires en Restaurant, Voyage, Maison et Travail
complètent les stocks L1 avec de vraies sources concrètes : il ne s’agit pas de
prendre un terme spécialisé pour remplir un chiffre. Les seuls déficits des
listes de graines retenues restent Restaurant espagnol (trois noms retrouvés)
et Voyage espagnol (aucun des noms ou modes ciblés retrouvé). Les besoins
Nature/Loisirs mentionnés plus haut restent également distincts.

Les nombres
sont traités séparément dans `introductions-nombres.json`. Cette politique
n'édite ni l'interface ni les aides phonétiques et ne publie rien.

Le complément `introductions-lexicales-complement.json` conserve séparément les
25 introductions/ancrages supplémentaires et quatre corrections sémantiques
autorisées : les 323 références du fichier initial ne sont pas réécrites.
