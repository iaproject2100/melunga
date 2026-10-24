# Recherche officielle — Duolingo

Consultation HTTPS : 2026-10-24T12:54:48+00:00. Quatre articles publics officiels lus ; URL découvertes dans le [sitemap réel](https://blog.duolingo.com/sitemap-posts.xml). L’[accueil officiel](https://www.duolingo.com/) a également été consulté.

Ce dossier propose des idées de programme. Il ne classe pas les concurrents par efficacité et ne prétend pas avoir parcouru leurs cours actuels. Les affirmations « efficace », « science » ou de personnalisation restent celles de Duolingo.

## Sources vérifiées

### [The Duolingo Method: 5 key principles that make learning fun and effective](https://blog.duolingo.com/duolingo-teaching-method/)

Publication déclarée : 2023-02-02. Modification des métadonnées : 2026-04-01. HTTP 200.

> you start with simpler material in easier exercises

Le fournisseur décrit une progression d’exercices simples vers des exemples plus exigeants. Il ne démontre pas ici une supériorité comparative.

> optional hints and bite-sized explanations

Les aides et explications sont décrites comme optionnelles ; Melunga peut retenir cette discrétion sans ajouter les textes de méthode dans la carte.

HTML conservé : `/tmp/melunga-duolingo-research/duolingo-teaching-method.html`. SHA-256 : `0e273c997410de4f989b16df6ec9ae960e796e6b3667745659bdbaa83c29aead`.

### [Which CEFR level is right for you?](https://blog.duolingo.com/goldilocks-and-the-cefr-levels-which-proficiency-level-is-just-right/)

Publication déclarée : 2020-02-27. Modification des métadonnées : 2026-10-02. HTTP 200.

> Each level builds on the previous one, covering increasingly complex language skills and topics.

La page décrit une progression cumulative de tâches, compétences et thèmes. Les dix niveaux Melunga ne sont pas pour autant équivalents aux six niveaux CECR.

> The right CEFR level for you depends entirely on what you want to do with the language.

Définir les niveaux par ce que la personne peut faire, avec des thèmes récurrents plus riches, constitue une adaptation éditoriale possible.

HTML conservé : `/tmp/melunga-duolingo-research/goldilocks-and-the-cefr-levels-which-proficiency-level-is-just-right.html`. SHA-256 : `88df800f5c3fbbf54109623fc0a5d6409e88e7ea666fa94fbd367e83025a474c`.

### [Improving how Duolingo teaches Chinese—and other languages!](https://blog.duolingo.com/improving-how-duolingo-teaches-chinese-and-other-languages/)

Publication déclarée : 2020-02-03. Modification des métadonnées : 2026-09-18. HTTP 200.

> we’ve started showing pinyin in more places in lessons.

L’article de 2020 décrit l’affichage accru d’une aide de prononciation à côté de l’écriture chinoise. Nous n’avons pas joué le cours courant et n’en déduisons pas sa configuration actuelle.

> the connections between what the characters look like, the sounds they represent, and the meanings they encode.

Le texte identifie trois correspondances à apprendre : écriture, son et sens. Pour Melunga, cela justifie de garder l’aide phonétique existante visible, sans la remplacer par du pinyin.

HTML conservé : `/tmp/melunga-duolingo-research/improving-how-duolingo-teaches-chinese-and-other-languages.html`. SHA-256 : `1ee83bc788eb24d87af4605bda9cacf78f46b1446728b09cb6c7fc0be924fe8b`.

### [30+ common French phrases for your trip to France](https://blog.duolingo.com/french-phrases-for-travel/)

Publication déclarée : 2025-09-03. Modification des métadonnées : 2026-06-01. HTTP 200.

> Greetings

La page publique contient une rubrique de salutation.

> Asking for help

La page publique contient une rubrique de demande d’aide.

> Getting around town

La page publique contient une rubrique de déplacements.

> Ordering food

La page publique contient une rubrique de commande de repas.

HTML conservé : `/tmp/melunga-duolingo-research/french-phrases-for-travel.html`. SHA-256 : `20acb1f78f355b74dc92e776133fdfb8dece884681f23f78f9d81e2dc55ed097`.

## Six microthèmes prioritaires et matériel exact

Chaque proposition contient une phrase complète et deux éléments lexicaux réellement présents. Les exemples sont chinois pour francophones ; les autres couples restent à inventorier. Les champs `study`, `native`, `phon` et `reading` sont copiés intégralement des champs source `t`, `frm`, `phf` et `py` dans le JSON. Aucune phonétique n’est reconstruite.

### L1 candidat — Faire ralentir et répéter

Réutiliser une demande de secours apprise entière, puis préparer une seule variation de manière ; laisser les explications hors de la carte.

| Indice source | Type stable | Texte étudié exact | Sens source exact |
|---|---|---|---|
| 2225 | utterance | 请慢一点 | plus lentement, svp |
| 2250 | vocabulary | 慢 | lent |
| 2312 | vocabulary | 一次 | une fois |

À vérifier :

- Vérifier une seconde réplique complète de répétition avant de proposer une substitution ; 一次 est une locution de quantité, pas un nombre pur.
- Candidats vérifiés ici pour fr→zh uniquement ; autres couples à inventorier avant déclinaison. Aucun texte étudié ni phonétique nouvelle rédigés.

Sources de l’idée : [article officiel](https://blog.duolingo.com/french-phrases-for-travel/), [article officiel](https://blog.duolingo.com/duolingo-teaching-method/).

### L2 candidat — Commander une boisson précise

Présenter la commande entière, puis préparer café et thé séparément avant de remplacer uniquement la boisson. Le classificateur 一杯 est enseigné dans le bloc et ne varie pas dans ce premier essai.

| Indice source | Type stable | Texte étudié exact | Sens source exact |
|---|---|---|---|
| 392 | utterance | 我要一杯咖啡。 | Je voudrais un café. |
| 2285 | vocabulary | 咖啡 | café |
| 2284 | vocabulary | 茶 | thé |

À vérifier :

- Vérifier que le modèle de commande de la famille n’introduit pas déjà cette même opération ; ne pas opposer universellement 要 et 想.
- Candidats vérifiés ici pour fr→zh uniquement ; autres couples à inventorier avant déclinaison. Aucun texte étudié ni phonétique nouvelle rédigés.

Sources de l’idée : [article officiel](https://blog.duolingo.com/french-phrases-for-travel/), [article officiel](https://blog.duolingo.com/duolingo-teaching-method/).

### L2 candidat — Trouver la gare

Apprendre une question de trajet entière ; préparer gare et carte comme lexique distinct, puis une réponse directionnelle comprise avant un nouvel échange.

| Indice source | Type stable | Texte étudié exact | Sens source exact |
|---|---|---|---|
| 1127 | utterance | 怎么去火车站？ | Comment aller à la gare ? |
| 2277 | vocabulary | 火车站 | gare |
| 3043 | vocabulary | 地图 | carte |

À vérifier :

- Une réponse de direction adaptée reste à sélectionner dans le stock ; ne pas prétendre que deux noms préparent à eux seuls cette réponse.
- Candidats vérifiés ici pour fr→zh uniquement ; autres couples à inventorier avant déclinaison. Aucun texte étudié ni phonétique nouvelle rédigés.

Sources de l’idée : [article officiel](https://blog.duolingo.com/french-phrases-for-travel/), [article officiel](https://blog.duolingo.com/goldilocks-and-the-cefr-levels-which-proficiency-level-is-just-right/).

### L2 candidat — Signaler une douleur simple

Réutiliser la phrase entière « J’ai mal au ventre » ; préparer le nom de la partie du corps et le médicament séparément. Ajouter une autre localisation seulement après préparation du patron propre au chinois.

| Indice source | Type stable | Texte étudié exact | Sens source exact |
|---|---|---|---|
| 419 | utterance | 我肚子疼。 | J'ai mal au ventre. |
| 3133 | vocabulary | 肚子 | ventre |
| 2403 | vocabulary | 药 | médicament |

À vérifier :

- Extension éditoriale Melunga, pas thème médical documenté dans ces articles concurrents. Vérifier le registre et une réponse utile sans prétendre fournir un diagnostic.
- Candidats vérifiés ici pour fr→zh uniquement ; autres couples à inventorier avant déclinaison. Aucun texte étudié ni phonétique nouvelle rédigés.

Sources de l’idée : [article officiel](https://blog.duolingo.com/goldilocks-and-the-cefr-levels-which-proficiency-level-is-just-right/), [article officiel](https://blog.duolingo.com/duolingo-teaching-method/).

### L3 candidat — Retrouver un accès numérique

Réutiliser un problème concret déjà écrit, puis les deux noms nécessaires à la situation ; préparer une demande d’aide distincte avant de combiner les deux actes.

| Indice source | Type stable | Texte étudié exact | Sens source exact |
|---|---|---|---|
| 735 | utterance | 我忘了密码。 | J'ai oublié mon mot de passe. |
| 3544 | vocabulary | 密码 | mot de passe |
| 3543 | vocabulary | 账号 | compte |

À vérifier :

- Extension éditoriale Melunga inspirée de l’objectif communicatif, pas contenu numérique observé dans le cours Duolingo. Sélectionner ensuite une réponse reçue et une demande d’aide dans le stock.
- Candidats vérifiés ici pour fr→zh uniquement ; autres couples à inventorier avant déclinaison. Aucun texte étudié ni phonétique nouvelle rédigés.

Sources de l’idée : [article officiel](https://blog.duolingo.com/goldilocks-and-the-cefr-levels-which-proficiency-level-is-just-right/), [article officiel](https://blog.duolingo.com/duolingo-teaching-method/).

### L4 candidat — Signaler un équipement en panne

Réutiliser une plainte simple liée au logement ; préparer chambre et climatisation séparément, puis faire comprendre une proposition de solution. La construction possessive et l’état résultant se préparent avant toute variation.

| Indice source | Type stable | Texte étudié exact | Sens source exact |
|---|---|---|---|
| 4859 | utterance | 我房间的空调坏了。 | La climatisation de ma chambre est en panne. |
| 2850 | vocabulary | 房间 | chambre |
| 3035 | vocabulary | 空调 | climatisation |

À vérifier :

- Le contexte voyage est attesté ; cet équipement précis est une extension Melunga. Le niveau proposé reste éditorial et demande confirmation des constructions préalables.
- Candidats vérifiés ici pour fr→zh uniquement ; autres couples à inventorier avant déclinaison. Aucun texte étudié ni phonétique nouvelle rédigés.

Sources de l’idée : [article officiel](https://blog.duolingo.com/french-phrases-for-travel/), [article officiel](https://blog.duolingo.com/goldilocks-and-the-cefr-levels-which-proficiency-level-is-just-right/).

## Hypothèse générale de progression

Cette grille est une proposition de tâche, pas un reclassement appliqué ni une équivalence L1–L10 / A1–C2. Objectifs communs dans les sept couples ; constructions et nombre de préparations propres à chaque langue.

| Niveau candidat | Réussite visée | Contextes |
|---|---|---|
| L1 | Réussir de très courts échanges du quotidien | Saluer ; demander quelque chose de préparé ; remercier ; faire répéter. |
| L2 | Étendre un modèle familier sans changer plusieurs choses à la fois | Présenter un proche ; exprimer un besoin ; choisir une boisson ou un lieu. |
| L3 | Combiner une phrase et un détail préparé | Quantité en contexte ; description ; petit trajet ; horaire simple. |
| L4 | Enchaîner deux actes simples dans une même situation | Préférence ; rendez-vous ; demande puis vérification. |
| L5 | Expliquer un problème concret et demander une solution | Hôtel ; transport ; achat ; santé quotidienne sans diagnostic. |
| L6 | Raconter un fait et annoncer un projet | Repères temporels ; première cause ; succession de faits. |
| L7 | Comparer des options et justifier une décision | Comparaison ; raison ; conséquence, préparées séparément avant combinaison. |
| L8 | Faire face à un imprévu et poser une condition | Solution de rechange ; hypothèse pratique ; reformulation. |
| L9 | Nuancer une opinion et tenir compte de l’interlocuteur | Accord partiel ; réserve ; degré de certitude ; registre. |
| L10 | Argumenter et négocier dans plusieurs domaines | Objection ; compromis ; explication développée ; spécialisation professionnelle. |

## Principes retenus pour Melunga

1. Entrer directement dans une situation utile, avec une phrase entière et une réussite observable : un échange terminé.
2. Ajouter une seule difficulté à une construction connue, puis la réutiliser dans un autre contexte.
3. Garder les aides et explications discrètes ; les consignes détaillées n’ont pas à encombrer les cartes.
4. En chinois, éviter de cumuler sens, écriture nouvelle, construction nouvelle et substitution nouvelle au premier essai. Garder la phonétique de Kartech.
5. Distinguer préparation prévue et acquisition constatée. Une liste de prérequis ne mesure pas ce que sait l’apprenant.

## Limites et conservation

- Phonétique Kartech inchangée : aucune aide phonétique nouvelle n’est produite dans ce lot.
- Le pinyin décrit par Duolingo n’est pas une consigne de remplacer la méthode phonétique Melunga.
- Les exemples sources chinois ci-dessus réutilisent texte et sens existants ; tout nouveau texte étudié exigerait une rédaction séparée et une vérification par Claude selon la méthode.
- Un même objectif fonctionnel dans les sept langues ne signifie pas une même quantité de cartes ou une même construction grammaticale.
- Les catégories de mots/adjectifs/prépositions/adverbes/nombres restent séparées des énoncés complets ; pas de duplication canonique.
- Réutiliser d’abord le stock existant ; les mots proposés en français sont des besoins lexicaux à inventorier, pas des cartes nouvelles prétendument manquantes.
- Aucun prix, abonnement, droit gratuit, niveau du catalogue, contenu produit ou architecture UI n’est modifié.

Les articles de 2020 décrivent notamment des dispositifs historiques. Les modifications de métadonnées de 2026 ne suffisent pas à établir que tous les détails décrits sont encore ceux du cours courant. Le document de voyage montre un choix public de contextes, pas l’ordre du programme complet.

Les HTML restent dans `/tmp`, hors du code produit. Empreintes, extraits courts, dates, huit pistes générales et six propositions prêtes à agréger sont consignés dans `duolingo.json`.
