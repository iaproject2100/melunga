# Anglais, espagnol, italien : première passe sur les niveaux du catalogue

Propositions éditoriales du 24 octobre 2026, à croiser avec Claude. **Aucune carte, aucun niveau `lv`, aucune phrase ni aide n’a été modifiée.** Les déplacements ci-dessous concernent seulement un `proposedLevel` indépendant de l’accès gratuit/payant. Toute intégration devra conserver les indices historiquement gratuits, même lorsqu’un placement pédagogique change.

## Périmètre réellement traité

Les trois catalogues entiers ont été parsés et inventoriés aux dix niveaux : **13 683 cartes**. La relecture est ciblée sur les clauses manifestement composites dans les premiers niveaux, les formules pratiques inutilement tardives et quelques soutiens modernes. Les cartes non déplacées ne sont pas réputées validées individuellement. Il ne s’agit ni d’un classement exhaustif relu en natif, ni d’une mesure d’acquisition.

Les niveaux proposés sont des repères de progression à réexaminer avec le cadre commun. Une formule entière utile peut être rencontrée avant le travail productif sur sa construction. Une occurrence en L2 ne suffit donc pas à déclarer acquise toute sa grammaire. Chaque phrase entière garde sa propre présentation puis imitation ; une aide manquante n’est jamais fabriquée.

| Couple | Cartes inventoriées | Propositions ciblées | L1 source conservé dans les droits |
|---|---:|---:|---:|
| fr-en | 4502 | 34 | 323 |
| fr-es | 4672 | 41 | 289 |
| fr-it | 4509 | 29 | 338 |

## Ne pas confondre les deux reclassements

Le dossier validé à `7d24556` reclasse 841 **unités conversation**, pas les cartes du catalogue. Copier leur niveau sur toute carte au texte identique serait une erreur : `Not really.` (en[2964], L1) tomberait en L9 ; `¿Cómo estás?` (es[22], L1) en L3 ; `Buena idea.` (es[3497], L1) en L6 ; `Me da igual.` (es[70], L2) en L10. Une unité avancée réemploie parfois une formule très simple. Les propositions présentes ont donc leur propre raison au niveau de la carte.

Le dossier `docs/curriculum-v2/README.md` décrit l’ancienne intégration de 918 leçons ; sa réduction de l’entrée L1 à neuf microleçons appartient au parcours ensuite rejeté. Elle ne doit pas être réintroduite dans l’architecture thématique validée. Le volume des cartes existantes reste disponible ; on corrige les placements et la préparation, on ne remplace pas 300 cartes par douze.

## Placements ciblés à relire

Les index sont à base zéro dans `DECKS.<langue>`. Le JSON joint recopie `t`, `frm`, `pf` et l’empreinte de chaque carte entière, avec ses prérequis prévus. La longueur ne sert pas de règle de décision et aucun score en jetons n’est comparé entre langues.

### fr-en

| Index | Source → proposition | Phrase étudiée exacte | Raison |
|---:|---|---|---|
| 250 | L2 → L1 | I'm a student. | Une phrase entière de présentation en be + nom de statut peut ouvrir le répertoire ; elle ne demande pas la productivité de tous les emplois de be. |
| 496 | L3 → L1 | I don't understand. | Formule d’incompréhension indispensable dès les premiers échanges, apprise entière avant les questions plus libres. |
| 78 | L2 → L1 | I'm thirsty. | État personnel en be + adjectif ; la variation thirsty/hungry se prépare dans deux phrases entières. |
| 1300 | L5 → L1 | One coffee, please. | Commande nominale entière et politesse, adaptée au premier café ; aucun temps ou question nouvelle à inférer. |
| 101 | L2 → L1 | I need help. | Formule entière de secours ; elle prépare le recours à une aide avant les demandes plus précises. |
| 670 | L3 → L2 | I need a taxi. | Reprendre need avec le groupe entier a taxi ; l’article fait partie du groupe présenté, il n’est pas supposé acquis par help. |
| 790 | L3 → L2 | I need a doctor. | Reprendre need avec a doctor, après une demande d’aide ; comparaison possible seulement après présentation des deux groupes entiers. |
| 784 | L3 → L2 | Where is the station? | Question située Where is + groupe nominal, après une question de lieu courte ; pas besoin d’attendre un récit ou la négociation. |
| 1190 | L4 → L2 | Where is the exit? | Même opération de repérage, avec le groupe the exit présenté en entier. |
| 1132 | L4 → L2 | Where is the toilet? | Même question de service avec un lieu utile ; garder la formulation source et sa traduction sans les normaliser. |
| 3226 | L4 → L2 | A table for two, please. | Étendre la commande nominale au groupe a table for two ; le groupe est préparé entier, sans reconstruire sa phonétique. |
| 1267 | L5 → L2 | I prefer tea. | Une préférence entière sur une boisson peut suivre le choix initial, sans attendre l’argumentation d’une préférence. |
| 1276 | L5 → L3 | Do you speak English? | Question située en do, distincte de la formule de secours initiale ; faire entendre puis imiter la question entière. |
| 1757 | L6 → L3 | Where can I buy a ticket? | Combiner un repère de lieu et can + action dans une question entière après le premier repérage de gare. |
| 1487 | L5 → L3 | How do you spell it? | Question de réparation utile après la formule d’incompréhension ; ne pas déduire toutes les questions en how de cette occurrence. |
| 1994 | L6 → L3 | How do you say that in English? | Question métalinguistique entière, ensuite réutilisable pour demander de l’aide linguistique. |
| 1682 | L6 → L4 | Do you have a bigger size? | Existence/interrogation et comparatif bigger : préparer le groupe bigger size et la question, pas un simple changement de nom. |
| 2074 | L7 → L3 | I'd like to make an appointment. | Demande entière avec I’d like to, à présenter comme formulation située avant toute généralisation de would. |
| 2080 | L7 → L2 | I go to the gym. | Présent de go avec un lieu ; première occurrence entière possible tôt, avant le travail plus libre sur fréquence/personnes du L4. |
| 2064 | L7 → L2 | Across the street. | Groupe de lieu whole-expression, à utiliser dans une réponse de direction préparée. |
| 2032 | L7 → L3 | Thank you in advance. | Formule de correspondance ; sa découverte n’exige pas un niveau de négociation commerciale. |
| 2017 | L7 → L3 | Can you see my screen? | Question de service avec can + see et un objet concret ; fournir le lexique screen avant le choix. |
| 1284 | L5 → L2 | I have a reservation. | Présent have + un groupe nominal, formule entière utile avant les précisions du nom et de la date. |
| 2383 | L7 → L3 | I have a reservation under Wang. | Reprendre la réservation, puis ajouter le groupe under Wang présenté en bloc ; ne pas enseigner under comme règle universelle des noms. |
| 2601 | L8 → L3 | Do you have a moment? | Question de service courte en have, à apprendre entière ; pas de dépendance à une négociation de niveau 8. |
| 2009 | L7 → L6 | I'll send you an email. | Promesse/projet d’envoi en will, préparée avec son action et son destinataire avant la variation de message. |
| 2470 | L8 → L7 | I'm eating because I'm hungry. | Deux propositions reliées par because ; travailler le lien cause/action après l’état hungry et les actions courantes. |
| 2727 | L9 → L4 | I like tea as well as coffee. | Coordination additive d’objets connus ; as well as ne doit pas attendre une hypothèse de niveau 9. |
| 2970 | L1 → L7 | Since you're here, stay for dinner. | Since causal + proposition, puis impératif : deux opérations et une relation discursive, inadaptées à l’entrée L1. |
| 3059 | L1 → L5 | At least it didn't rain. | Passé négatif en did not et atténuation at least ; préparer l’événement avant sa mise en perspective. |
| 3574 | L8 → L2 | The Wi-Fi password, please. | Demande nominale polie, parallèle à une commande avec please ; le groupe Wi-Fi password doit être présenté entier. |
| 2442 | L8 → L6 | Let's set up a video call. | Proposition collaborative avec let’s ; introduire le groupe set up a video call avant le choix de modalité. |
| 2787 | L9 → L6 | Can we schedule a video call next week? | Préciser la proposition de visio par next week ; préparer schedule et le groupe temporel entiers. |
| 1998 | L6 → L5 | I forgot my password. | Un fait achevé en forgot, à présenter entier avant de développer ses conséquences ou une procédure de récupération. |

### fr-es

| Index | Source → proposition | Phrase étudiée exacte | Raison |
|---:|---|---|---|
| 88 | L2 → L1 | Necesito ayuda. | Formule entière de secours disponible tôt ; ne pas attendre les questions libres pour permettre une demande d’aide. |
| 1511 | L5 → L1 | Más despacio, por favor. | Réparation élémentaire et polie, entière ; le comparatif lexical despacio se traite ici comme formule située. |
| 563 | L3 → L2 | ¿Dónde está la estación? | Question de service entière en dónde está, avec un lieu précis présenté en bloc. |
| 561 | L3 → L2 | ¿Dónde está la salida? | Reprendre la même question avec la salida ; le groupe nominal et son article sont présentés ensemble. |
| 515 | L3 → L2 | ¿Dónde está el baño? | Repère de service quotidien, avant les récits et les demandes conditionnelles. |
| 1610 | L5 → L2 | ¿Hay una farmacia cerca? | Question d’existence hay + un groupe nominal et cerca ; découverte de chaque phrase entière, pas inférence depuis dónde está. |
| 1436 | L5 → L2 | ¿Cuál es el precio? | Formule de prix simple ; préparer cuál es séparément de cuánto cuesta au lieu de supposer la question déjà connue. |
| 603 | L3 → L2 | Nos vemos el lunes. | Formule entière nos vemos avec un jour ; la personne n’a pas à reconstruire une conjugaison réflexive. |
| 613 | L3 → L2 | Me duele la cabeza. | Me duele + groupe corporel ; le singulier est limité aux exemples, aucune généralisation à me duelen. |
| 531 | L3 → L2 | Me duele el estómago. | Présenter el estómago entier ; un changement de déterminant n’est pas caché sous un invariant la + nom. |
| 902 | L3 → L2 | Me duele la garganta. | Même intention, groupe la garganta préparé entier avant le choix. |
| 606 | L3 → L2 | Me duele la espalda. | Même intention, groupe la espalda préparé entier avant le choix. |
| 1697 | L5 → L3 | ¿Tienes hermanos? | Question située en tienes, après les premiers états et besoins ; lexique de parenté préparé dans la phrase. |
| 1140 | L4 → L3 | ¿Qué haces? | Question qué + haces présentée entière avant les reprises de routine plus ouvertes. |
| 1631 | L5 → L3 | ¿A qué hora sale el tren? | Question de service mêlant horaire et départ ; préparer à qué hora et sale dans sa phrase avant substitution. |
| 1061 | L4 → L3 | ¿Puedes repetir? | Question en puedes + infinitif, après une formule de répétition plus élémentaire. |
| 1231 | L4 → L3 | ¿Vamos al cine? | Question-proposition entière avec vamos ; elle ne représente pas encore une négociation de programme. |
| 965 | L4 → L3 | Quiero una tarjeta SIM. | Quiero + groupe nominal utile aux déplacements ; faire connaître tarjeta SIM avant réemploi. |
| 1847 | L5 → L3 | Quiero una tarjeta SIM local. | Reprendre tarjeta SIM puis ajouter local ; nom et adjectif sont préparés comme groupe entier. |
| 2675 | L7 → L3 | Tengo una reserva a nombre de Wang. | Reprendre tengo una reserva puis ajouter a nombre de Wang, sans en déduire une règle générale de préposition. |
| 2930 | L8 → L4 | Tengo que cargar el móvil. | Tengo que + infinitif dans une action numérique courante ; l’obligation est une nouvelle opération explicitement préparée. |
| 2934 | L8 → L3 | Quiero hablar con el responsable. | Intention avec quiero + infinitif et un rôle précis ; présenter le bloc hablar con el responsable entier. |
| 2444 | L7 → L3 | Quiero hacer el check-in. | Intention en quiero + infinitif, avec l’expression de service check-in présentée entière. |
| 2452 | L7 → L3 | Quiero hacer el check-out. | Autre démarche préparée entière ; ne pas traiter check-out comme acquis depuis check-in. |
| 3426 | L1 → L7 | Por eso prefiero venir temprano. | Por eso + préférence + infinitif + repère temporel : plusieurs éléments, à préparer après les choix simples. |
| 3452 | L1 → L5 | De hecho, ya lo sabía. | Imparfait sabía, pronom lo, marqueur ya et de hecho ; découverte entière avant mise en récit. |
| 3487 | L1 → L5 | Por cierto, llegó tu paquete. | Passé llegó et changement de sujet por cierto ; préparer le fait passé avant sa relance discursive. |
| 3513 | L1 → L7 | En realidad, es más fácil de lo que parece. | Comparatif más … de lo que et proposition parece : la relation dépasse un remplacement de nom au L1. |
| 3521 | L1 → L9 | De ahí que llegáramos tarde. | De ahí que suivi de l’imparfait du subjonctif llegáramos ; ne pas laisser cette construction dans l’entrée L1. |
| 3522 | L1 → L5 | A decir verdad, no me gustó mucho. | Gustó au passé avec me et une atténuation no … mucho ; apprendre la réaction entière avant le cadrage a decir verdad. |
| 3561 | L1 → L6 | Por último, no olvides cerrar la puerta. | Impératif négatif no olvides + infinitif et connecteur por último : ne pas faire produire cela en premier échange L1. |
| 3564 | L1 → L7 | En cualquier caso, a mí me encantó. | Passé encantó, reprise emphatique a mí me et cadrage en cualquier caso ; préparer ces opérations séparément. |
| 3565 | L1 → L7 | En cualquier caso, ya es tarde para cambiarlo. | Évaluation ya es tarde, infinitif cambiar et pronom objet lo ; relation discursive préparée après des phrases plus simples. |
| 3539 | L1 → L8 | Sea como sea. | Concession figée sea como sea ; occurrence entière à comprendre et reprendre, pas apprentissage implicite du subjonctif productif. |
| 3578 | L1 → L9 | A buenas horas. | L’expression a buenas horas a une lecture ironique déclarée dans le sens source ; une scène ou intonation reçue est nécessaire. |
| 3580 | L1 → L9 | Ni que decir tiene. | Ni que decir tiene est une formule de discours non transparente, à préparer dans un contexte avant emploi. |
| 3581 | L1 → L8 | Lo hecho, hecho está. | Expression avec participes et reprise ; l’emploi figé ne doit pas enseigner automatiquement hecho ni estar comme règle générale. |
| 4652 | L4 → L9 | De ahí que nadie viniera. | Même construction de ahí que + viniera que le cas L1 corrigé ; préparer la phrase entière avec les opérations rétrospectives. |
| 2234 | L6 → L3 | ¿Cuál es la contraseña del wifi? | Question d’information cuál es + groupe nominal ; nouvelle précision del wifi préparée après la demande de prix. |
| 2807 | L8 → L6 | ¿Podemos hacer una videollamada? | Question-proposition avec podemos + hacer ; nouvelle modalité de rencontre présentée entière. |
| 3079 | L9 → L6 | ¿Podemos vernos por videollamada? | Reprendre une proposition de visio avec vernos por ; le pronom nos est une nouvelle forme, pas une simple substitution de nom. |

### fr-it

| Index | Source → proposition | Phrase étudiée exacte | Raison |
|---:|---|---|---|
| 796 | L4 → L1 | Sono studente. | Sono + statut dans une phrase entière ; cela ne prétend pas rendre tous les emplois de sono interchangeables. |
| 3294 | L4 → L1 | Un caffè, per favore. | Commande nominale entière et per favore, avant les demandes atténuées ou développées. |
| 2927 | L2 → L1 | Non capisco. | Non capisco est une première formule de secours ; la personne doit pouvoir la dire dès l’entrée. |
| 57 | L2 → L1 | Ho bisogno di aiuto. | Ho bisogno di aiuto entier, avant les variantes avec déterminant ou infinitif. |
| 401 | L3 → L2 | Dov'è la stazione? | Question de lieu située avec dov’è + un groupe nominal entier. |
| 717 | L4 → L2 | Dov'è l'uscita? | Reprendre la question de repérage avec le groupe l’uscita présenté entier. |
| 489 | L3 → L2 | Ho bisogno di un medico. | Ho bisogno di + groupe un medico, avec l’article inclus dans le complément préparé. |
| 505 | L3 → L2 | Ho bisogno di un taxi. | Même cadre avec un taxi ; première comparaison possible après les deux phrases entières. |
| 726 | L4 → L2 | Ho una prenotazione. | Ho + groupe nominal dans une déclaration de service, avant d’ajouter le nom du titulaire. |
| 1237 | L5 → L2 | Ci vediamo alle otto. | Formule ci vediamo + alle otto, apprise entière ; ne pas en déduire toute la conjugaison pronominale. |
| 968 | L4 → L3 | Parli inglese? | Question située parli + langue ; elle suit la formule d’incompréhension sans attendre un récit. |
| 975 | L4 → L3 | Può parlare più lentamente? | Question formelle può + infinitif et adverbe ; préparer Lei et la phrase entière séparément de puoi. |
| 2099 | L8 → L4 | Può richiamarmi domani? | Question formelle può + richiamarmi domani ; le bloc est préparé entier avant les atténuations en potrebbe du L8. |
| 1723 | L7 → L5 | Non ho avuto tempo. | Passato prossimo négatif avec avuto ; occurrence entière à préparer avec les autres faits achevés. |
| 1786 | L7 → L2 | Dov'è la fermata dell'autobus? | Même opération de repérage que la gare, avec le groupe la fermata dell’autobus présenté en entier. |
| 1794 | L7 → L3 | Siete aperti la domenica? | Question sur un service connu avec siete et un jour ; préparer l’accord et l’expression la domenica. |
| 1800 | L7 → L4 | Vado a buttare la spazzatura. | Intention immédiate de routine en vado a + action ; le groupe buttare la spazzatura reste entier. |
| 2020 | L7 → L3 | Ho una prenotazione a nome Wang. | Reprendre ho una prenotazione puis le groupe a nome Wang ; nouvelle précision, pas un temps nouveau. |
| 2112 | L8 → L5 | Ho prenotato online, ecco la conferma. | Événement en ho prenotato puis présentation de la confirmation ; préparer les deux blocs avant l’enchaînement. |
| 2120 | L8 → L5 | Ho pagato la fattura. | Événement achevé en ho pagato avec un objet précis ; lexique fattura à présenter dans la phrase. |
| 2306 | L9 → L5 | Ho parlato con il fornitore. | Passato prossimo d’une action et interlocuteur ; situation professionnelle optionnelle, sans attente d’une hypothèse de L9. |
| 2363 | L9 → L4 | Mi piace il tè così come il caffè. | Mi piace + deux groupes coordonnés par così come ; préparer les deux goûts et le lien additif, pas une concession complexe. |
| 2614 | L1 → L7 | Il film era bello; invece, la sala era rumorosa. | Deux descriptions à l’imparfait reliées par invece ; ne pas introduire l’opposition et l’imparfait ensemble au début du L1. |
| 2661 | L1 → L8 | A meno che... | Modèle incomplet A meno che…, non produit seul : à réserver à la préparation des conditions et exceptions, sans fabriquer sa suite. |
| 2633 | L1 → L10 | Da un lato... | Modèle incomplet Da un lato…, à situer avec les nuances et deux aspects d’un avis ; jamais produire une phrase inventée par collage. |
| 4405 | L10 → L3 | Il wifi non funziona. | Il wifi non funziona est un constat au présent négatif, utile avec la demande d’aide avant les négociations complexes. |
| 2413 | L10 → L6 | Organizziamo una videochiamata. | Proposition collaborative en organizziamo et groupe una videochiamata, présenté entier. |
| 2425 | L10 → L6 | Possiamo fissare una videochiamata la settimana prossima? | Proposer et préciser la semaine prochaine ; préparer fissare et le groupe temporel avant le réemploi. |
| 1511 | L6 → L5 | Ho dimenticato la password. | Ho dimenticato la password est un événement achevé ; préparation entière, avant les démarches de récupération. |

## Construire des phrases sans assembler des aides

- **Anglais L2** : `I need a taxi.` et `I need a doctor.` (670/790), après `I need help.` (101). Le premier changement porte sur les groupes complets `a taxi` / `a doctor`, pas sur un nom nu ajouté à un modèle sans article.
- **Espagnol L2** : `Me duele la cabeza.` et `Me duele el estómago.` (613/531). L’invariant est `Me duele {s}.`, où la variable inclut l’article et le nom. Ne pas déclarer `la + nom` invariant, ni considérer le pluriel `me duelen` déjà prêt.
- **Italien L2** : `Ho bisogno di un medico.` et `Ho bisogno di un taxi.` (489/505), après `Ho bisogno di aiuto.` (57). La première comparaison ne mélange pas ces groupes nominaux avec `Ho bisogno di dormire.` : ce dernier change le type de complément.

Ces comparaisons sont des propositions de pratique, non des preuves que la personne connaît les groupes. Elles utilisent des phrases sources complètes, jamais une concaténation de texte ou de phonétique.

## Enrichir par réemploi avant de rédiger

Le JSON référence des phrases entières déjà disponibles pour les thèmes SIM/Wi-Fi, visio, incident numérique et réservation. Une commande de café anglaise en L5 ou italienne en L4, un ralentissement espagnol en L5, ou `Il wifi non funziona.` en italien L10 n’appellent pas une nouvelle phrase : il faut d’abord rendre l’existant atteignable au bon moment.

Pour l’italien L8, le dossier antérieur `suite-validation/italien-L8.md` reste pertinent : it[735] `Ho bisogno di più tempo.` et it[2099] `Può richiamarmi domani?` sont deux soutiens directs distincts. it[775] et it[726] n’apportent qu’un groupe nominal. Les six réserves ne sont pas déclarées résolues ; l’interprétation d’une réponse à `Le dispiace se…?` demande encore une scène reçue relue.

La banque antérieure de douze situations modernes (`reprise-globale/enrichissement-thematique.json`) est une carte de sources, pas une réserve de dialogues prêts. Retrait de commande et livraison manquée restent partiels : ne pas faire répondre à une question avec une phrase qui ne lui répond plus après découpage. Toute nouvelle formulation et sa phonétique doivent passer dans un lot propre pour Claude avant d’entrer dans la maquette.

## Défaut de sens à consigner

it[1591] dit `Come si dice in italiano?`, alors que `frm` vaut `Comment on dit ça en français ?`. Le texte, le sens et `pf` sont laissés intacts dans cette revue. C’est une incohérence de traduction source à faire corriger explicitement, pas une occasion de modifier l’aide au passage.

## Contrôles et limites

- 104 propositions sans index dupliqué ; 312 champs de déplacement comparés aux sources, zéro écart.
- Tous les prérequis référencés existent. Leur niveau source ou proposé ne dépasse pas celui de la carte cible ; cela ne valide pas à lui seul l’ordre interne des thèmes, ni une acquisition.
- Le JSON garde les phonétiques francophones de `pf`, sans reprendre `py` anglophone ni les aides de la conversation. Les champs sont copiés au caractère près.
- Aucune publication, aucun reclassement des `lv` produit, aucun prix, compte ou abonnement changé.
- Restent la relecture de méthode par Claude, la validation native du naturel et l’essai avec apprenants.
