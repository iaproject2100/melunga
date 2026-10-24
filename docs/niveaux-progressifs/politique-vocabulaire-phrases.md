# Situations, vocabulaire et nombres par niveau

Cette politique applique la décision de Kartech : chaque niveau réunit des thèmes
de situations composés de phrases complètes, des thèmes de vocabulaire et une
rubrique Nombres. Elle complète les 110 thèmes de `plan-themes.json` sans les
modifier. La grille et la navigation restent les mêmes ; une carte de thème
n'apparaît que si elle contient réellement des éléments.

Le contrat importable est `politique-vocabulaire-phrases.json`. Il décrit une
classification éditoriale candidate, pas une validation linguistique exhaustive
du catalogue. Il ne change aucun texte, aucune aide phonétique, aucun niveau
source ni aucun droit d'accès.

## Cinq types de contenu

| Type | Destination | Critère |
| --- | --- | --- |
| `utterance` | Situations | Phrase ou formule qui accomplit un tour communicatif complet dans son usage attesté. |
| `vocabulary` | Vocabulaire | Mot ou locution lexicale entière, bornée, présentée comme une entrée de vocabulaire. |
| `number` | Nombres | Cardinal, ordinal ou fraction isolé, sans unité. |
| `incomplete` | Réserve de revue | Construction clairement ouverte, emplacement ou complément manquant. |
| `review` | Réserve de revue | Usage ambigu, source contradictoire ou analyse insuffisamment établie. |

« Bonjour », « Merci » et « Oui » sont des répliques complètes. Leur longueur
n'en fait pas du vocabulaire. À l'inverse, « in fact » peut être une locution
lexicale de plusieurs mots sans constituer un tour complet. Ni la ponctuation,
ni le nombre de mots, ni la catégorie historique du catalogue ne suffisent.

Le sens et la forme de la langue étudiée priment. Une entrée lexicale ne devient
pas une phrase complète parce qu'on peut imaginer une question à laquelle elle
répondrait. Une phrase n'est jamais coupée pour fabriquer une carte de mot.

Les deux types de réserve restent inventoriés dans `cell.reserve`. Ils ne sont
pas demandés en production et aucun complément n'est généré automatiquement.
Les cinq ensembles doivent rester disjoints et couvrir toutes les cartes sources.

## Familles de vocabulaire

Les sept familles contextuelles limitent la dispersion des mots. Leurs cartes
sont propres à chaque niveau, avec les mêmes identifiants sémantiques stables.

| `lexicalFamilyId` | Titre français | Titre chinois |
| --- | --- | --- |
| `vocab-restaurant` | Restaurant et achats | 餐饮与购物 |
| `vocab-maison` | Maison et jardin | 居家与园艺 |
| `vocab-voyage` | Voyage et transport | 出行与交通 |
| `vocab-personnes` | Corps, personnes et émotions | 身体、人物与情绪 |
| `vocab-reperes` | Temps et repères | 时间与方位 |
| `vocab-actions` | Actions et descriptions | 动作与描述 |
| `vocab-travail` | Travail et démarches | 工作与事务 |

Une pomme relève des aliments, une mère des personnes, une chaise de la maison.
L'ancien domaine est un recours secondaire, pas une décision sémantique absolue.
Les signaux lexicaux sur le sens français produisent des candidats tracés ; ils
ne prouvent pas à eux seuls la correspondance exacte dans la langue étudiée.
Un sens ambigu comme « carte », « pièce » ou « vol » exige son contexte source.

Trois destinations grammaticales sont prioritaires sur ces sept familles quand
la catégorie est établie :

| `lexicalFamilyId` | Titre français | Titre chinois |
| --- | --- | --- |
| `vocab-adjectifs` | Adjectifs | 形容词 |
| `vocab-prepositions` | Prépositions | 介词 |
| `vocab-adverbes` | Adverbes | 副词 |

Une unité adjectivale a une seule destination canonique dans Adjectifs, même si
elle décrit aussi un repas ou un logement. Les rappels dans ces situations sont
des références, jamais une seconde première introduction comptée.

Ces noms ne prétendent pas rendre identiques les grammaires. Pour le japonais et
le coréen, la carte Prépositions est intitulée « Particules et structures de
relation ». Pour le coréen, Adjectifs devient « Adjectifs et verbes descriptifs ».
Les équivalents chinois sont également fournis dans le JSON.

La traduction française seule ne suffit pas à décider d'une partie du discours.
Une particule liée à un emplacement absent reste incomplète. Une proposition
entière n'est pas un adjectif isolé. Une locution de temps n'est pas
automatiquement un adverbe. Un usage réellement ambigu reste à relire.

Les signaux grammaticaux conservent les accents : « sûr » et « sur » ne doivent
pas devenir le même signal après normalisation. Le normaliseur historique sans
accents sert uniquement aux candidats des sept familles contextuelles.

## Nombres et repères

La rubrique porte le titre « Nombres » / « 数字 », avec un identifiant propre
`L{level}-nombres`. Elle est séparée des sept familles contextuelles et des trois
destinations grammaticales, au sein de la section Vocabulaire.

- « quatre », « douze », « premier » au sens ordinal et « trois quarts » au sens
  de fraction isolée sont des nombres.
- « trois heures », « deux personnes » et un prix isolé comportent une unité :
  ce sont des entrées de vocabulaire, classées selon leur sens.
- « J'arrive à trois heures » est une phrase de situation.
- « un café » n'est pas un nombre : « un » y est un article.

La source est conservée entière. Aucun nombre n'est extrait d'une phrase pour
créer une carte supplémentaire. Les repères de temps restent du vocabulaire
lorsque leur usage source est lexical ; une analyse grammaticale établie peut
les orienter vers Adverbes, mais le seul sens temporel ne le permet pas.

## Première rencontre et réemploi

Un mot peut être présenté avant la phrase qui le réemploie. Il n'est pas déplacé
vers le haut uniquement pour coïncider avec elle. Par exemple, la présence de
« café » à un niveau et de « Je voudrais un café » au suivant n'est pas une
anomalie qui imposerait de changer le niveau source.

`reuseVocabularyIds` distingue ces rappels des premières rencontres. Une
référence vise la carte canonique entière ; elle ne crée ni nouveau texte, ni
nouvelle phonétique, ni doublon compté. Elle n'ajoute pas une succession de mots
à produire dans la carte de situation. Elle décrit une préparation prévue,
pas ce que l'apprenant sait déjà.

Le niveau éditorial proposé reste séparé du champ source `lv`. Ce dernier
participe à la frontière gratuit/payant ; cette politique ne le modifie pas.

## Contrat du générateur et des visuels

Le fichier JSON fournit `themeDefinitions`, onze modèles par niveau, et
`additionalThemeDefinitions`, leurs 110 instances sur L1–L10. Les identifiants
sont `L{level}-{lexicalFamilyId}` pour les dix familles et `L{level}-nombres`
pour les nombres. L’identifiant machine de la section est `vocabulary`, son
libellé reste « Vocabulaire ». Une définition ne devient visible que si elle reçoit des
éléments. Aucun maximum n'impose de remplir artificiellement toutes les cases.

L'ordre des visuels contextuels déjà prévus est conservé : restaurant, maison,
voyage, personnes, repères, actions, travail, nombres. Cela représente 80
emplacements sur dix niveaux, répartis sur cinq atlas de seize images. Les
trois thèmes grammaticaux ajoutent un lot distinct de 30 emplacements, dans
l'ordre adjectifs, prépositions, adverbes. Chaque thème de niveau possède un
`visualId` distinct. Ces emplacements décrivent le contrat ; la création et la
vérification des images constituent un lot séparé.

`lexicalSignals` propose des destinations contextuelles. `posCandidateSignals`
propose séparément les catégories grammaticales, appliquées en priorité avec
vérification de la forme étudiée. Une décision explicite par carte source prime
sur un signal. Le recours à l'ancien domaine doit rester marqué
`family-needs-review`. Ces règles ne doivent jamais être présentées comme une
relecture manuelle de toutes les cartes.

## Portée vérifiée et limites

Le catalogue de départ contient 32 115 cartes. Ses étiquettes historiques
comprennent notamment 7 468 `vocab` et 360 `template` ; ces chiffres ne sont
pas les totaux de la nouvelle classification. Des cartes `vocab` sont des
phrases complètes, notamment dans les corpus anglais, espagnol, italien,
japonais, coréen et français. Des cartes d'autres catégories sont lexicales.

Le JSON joint 38 cas sources avec index et empreinte de carte, dont « le café »
face à « Je voudrais un café », des salutations, des nombres, des phrases mal
étiquetées historiquement, des modèles ouverts et les trois destinations
grammaticales. Ce sont des exemples contrôlables, pas un inventaire exhaustif.

La classification doit encore être examinée pour ses cas ambigus, en particulier
les catégories grammaticales propres à chaque langue. Claude peut relire le
classement et la conservation des aides sources. Aucune nouvelle formulation
ni aide phonétique n'est autorisée par ces règles, et aucune équivalence CECR
ni mesure d'acquisition n'en découle. Ce document ne publie rien.
