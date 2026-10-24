# Busuu et Memrise : recherche officielle et besoins pour Melunga

Consultation réelle le 24 octobre 2026 : cinq pages officielles, toutes reçues en HTTP 200, via le proxy normal avec vérification TLS. Les HTML complets et leurs empreintes sont conservés sous `/tmp/melunga-recherche-busuu-memrise/` ; le JSON associé porte les URL finales, titres, dates UTC, chemins et SHA-256. Les extraits ci-dessous ont été retrouvés dans le texte du HTML.

Ce sont des descriptions publiques de leurs offres. Aucun cours interactif n’a été joué ; aucune supériorité pédagogique ou efficacité comparée n’a été mesurée. Les pages Memrise de cours exposent du texte éditorial même si elles signalent que le produit interactif nécessite JavaScript.

## Pages et preuves courtes

### busuu-anglais

[Apprendre l’anglais en ligne | Apprentissage gratuit - Busuu](https://www.busuu.com/fr/course/apprendre-anglais-en-ligne) — consultation `2026-10-24T12:49:59.780948+00:00`.

> Cours complet d’anglais
> L’anglais pour les voyages
> L’anglais des affaires
> A1 – C1
> business English vocabulary for interviews, emails or sweet-talking customers.

HTML : `85b898e6835015b6635edcb733d1d61844f0655e33cca616bbd371151500da37`.

### busuu-chinois

[Apprendre le chinois : cours en ligne - Busuu](https://www.busuu.com/fr/course/apprendre-chinois-en-ligne) — consultation `2026-10-24T12:50:24.212930+00:00`.

> Les caractères chinois
> A1 – B2
> Concentre-toi sur le vocabulaire pour gagner en aisance.

HTML : `3c5a10e69715daf3974ba92c69c439b0f53591cff574fb53cfc8392c26b21c9e`.

### memrise-fr

[Apprends une langue. Ouvre-toi au monde. | Memrise](https://www.memrise.com/fr/) — consultation `2026-10-24T12:49:59.858490+00:00`.

> des discussions en vacances jusqu’à la rencontre avec la belle-famille.

HTML : `d8f7fa127719bc908957924424072306dc169b9f2a814d8e8df4bc1ab4988cca`.

### memrise-anglais-cours

[Cours en ligne d’anglais - Memrise : la façon la plus simple de parler anglais](https://www.memrise.com/fr/apprendre-l-anglais/cours-anglais) — consultation `2026-10-24T12:50:24.000885+00:00`.

> Le sport
> Les opinions
> Les études
> Toutes nos vidéos sont également filtrées pour correspondre aux mots que tu as appris

HTML : `70c699506ede7d49e579d436ad16fe549d6ff1977444ac5e2d9d41c7db68d7c1`.

### memrise-coreen-cours

[Cours en ligne de coréen - Memrise : la façon la plus simple de parler coréen](https://www.memrise.com/fr/apprendre-le-coreen/cours-coreen) — consultation `2026-10-24T12:50:24.078453+00:00`.

> Le hangul
> Écoute ces mots prononcés par des locuteurs·trices natifs·ives

HTML : `c77aa307226d0cbef7993f3570bb6b6d3278bd0ef9d7a8e816f2a1bb75ffcad0`.

## Ce qui peut guider Melunga

- Les pages annoncent des cours complets et des parcours ciblés voyage ; la page anglais présente aussi les affaires et les examens. **Adaptation proposée :** Garder une ossature commune et enrichir des usages concrets, plutôt que remplacer le stock par quelques phrases d’essai.
- Les plages affichées diffèrent : A1–C1 en anglais, A1–B2 en chinois ; le chinois dispose d’un volet caractères. **Adaptation proposée :** Une capacité communicative commune n’impose pas une structure grammaticale identique ni une même cadence de formes nouvelles. Aucune correspondance CECR n’est attribuée à Melunga.
- Les pages nomment notamment sport, études, relations et opinions ; la page coréen ajoute le hangul. **Adaptation proposée :** Ajouter des angles de pratique concrets dans les domaines Melunga existants, et rechercher d’abord les phrases/mots déjà disponibles.
- Les descriptions articulent scénarios, mots, écoute de locuteurs natifs et pratique orale ; les pages de cours déclarent filtrer les vidéos selon les mots appris. **Adaptation proposée :** Relier vocabulaire préparé et échange complet par références explicites, sans prétendre mesurer l’acquisition ni reproduire leur mécanisme.

Les thèmes ne sont pas de simples listes indépendantes : un mot peut apparaître plus tôt, être rappelé par référence, puis être réemployé dans une phrase et un échange préparés. Les trois rubriques grammaticales ne sont pas réputées complètes par niveau. Une forme liée japonaise ou coréenne, ou une construction chinoise, ne devient pas une préposition française parce que sa traduction en contient une.

## Six besoins prioritaires, ancrés dans les sources Melunga

Les phrases et lexèmes ci-dessous sont des copies exactes du catalogue, avec leur **classification candidate actuelle** contrôlée. Les index sont ceux de `DECKS.en` ; la phonétique vient de `pf`, entièrement recopiée dans le JSON. Les niveaux proposés concernent un besoin de thème, pas un déplacement effectué de ses exemples. Les exemples montrent un stock réutilisable, pas une leçon déjà complète ni une combinabilité démontrée.

### Loisirs et sport : parler de ses habitudes — niveau proposé L3

Dire une activité appréciée, préciser une fréquence et répondre à une question sur cette habitude ; préparer séparément les changements de construction.

Ancrages existants :

- `DECKS.en[549]` — **utterance** : « I like sports. » / « j'aime le sport » ; source L3, classement éditorial actuel L3.
- `DECKS.en[4389]` — **vocabulary** : « running » / « la course à pied » ; source L2, classement éditorial actuel L2.
- `DECKS.en[3743]` — **vocabulary** : « often » / « souvent » ; source L1, classement éditorial actuel L1.

Recherche à faire avant enrichissement :

- Trouver une phrase complète qui relie une activité à une fréquence : les trois ancrages ne prouvent pas leur combinabilité.
- Rechercher des noms de sport et adjectifs de sensation exacts dans les sept couples, avant de déclarer un manque.

Réemploi proposé : L2 : Réemployer un goût simple dans une phrase attestée. → L3 : Ajouter une fréquence dans une construction entière sourcée. → L4 : Raconter une séance passée avec une phrase de récit déjà préparée.

### Études : parler de son cours et demander une aide — niveau proposé L3

Décrire une activité d’étude, annoncer un examen et demander une aide précise ; réemployer ensuite un récit et une explication.

Ancrages existants :

- `DECKS.en[586]` — **utterance** : « I have an exam. » / « j'ai un examen » ; source L3, classement éditorial actuel L3.
- `DECKS.en[4329]` — **vocabulary** : « the student » / « l'étudiant » ; source L3, classement éditorial actuel L3.
- `DECKS.en[3117]` — **vocabulary** : « the class » / « le cours » ; source L2, classement éditorial actuel L2.

Recherche à faire avant enrichissement :

- Chercher des demandes complètes d’explication, ainsi que facile/difficile et attentivement/lentement selon les sources.
- Ne pas transformer le nom de cours en phrase par ajout automatique de sujet, verbe ou phonétique.

Réemploi proposé : L1 : Identifier son rôle dans une formule entière déjà disponible, si préparée. → L3 : Parler du cours ou d’un examen et demander une aide. → L5 : Organiser une séance de révision et confirmer la répartition. → L6 : Expliquer une difficulté et comparer deux méthodes.

### Films et musique : choisir une sortie puis la raconter — niveau proposé L4

Choisir une activité culturelle, puis raconter un fait terminé avec une appréciation préparée ; l’ancrage disponible ci-dessous ne couvre que l’invitation.

Ancrages existants :

- `DECKS.en[1144]` — **utterance** : « Let's watch a movie. » / « regardons un film » ; source L4, classement éditorial actuel L4.
- `DECKS.en[4344]` — **vocabulary** : « the music » / « la musique » ; source L2, classement éditorial actuel L2.
- `DECKS.en[4350]` — **vocabulary** : « a movie » / « un film » ; source L2, classement éditorial actuel L2.

Recherche à faire avant enrichissement :

- Le récit après la sortie n’est pas fourni par ces exemples : rechercher une phrase passée complète avant toute activation.
- Chercher des adjectifs d’appréciation exacts et leurs emplois en phrase ; distinguer film culturel et film d’emballage dans les sens français.

Réemploi proposé : L2 : Réemployer des noms de loisirs et une phrase entière de goût. → L4 : Préparer un récit simple et une propriété dans sa construction source. → L6 : Comparer deux sorties avec une raison.

### Numérique : connexion, écran et dépannage — niveau proposé L5

Décrire un problème numérique concret, demander une action et confirmer sa résolution. Le numérique est une adaptation Melunga des besoins de travail et d’activités, pas une rubrique attestée sous ce nom dans les pages consultées.

Ancrages existants :

- `DECKS.en[3310]` — **utterance** : « The internet is slow. » / « la connexion est lente » ; source L5, classement éditorial actuel L5.
- `DECKS.en[4315]` — **vocabulary** : « the Wi-Fi » / « le Wi-Fi » ; source L5, classement éditorial actuel L5.
- `DECKS.en[4317]` — **vocabulary** : « the screen » / « l'écran » ; source L4, classement éditorial actuel L4.

Recherche à faire avant enrichissement :

- Chercher les répliques complètes de demande et de confirmation ; une phrase de problème seule ne constitue pas l’échange.
- Rechercher les mots de passe, chargeurs et adjectifs de fonctionnement déjà disponibles ; distinguer batterie musicale et batterie d’appareil.
- Ne pas déplacer silencieusement un mot connu du catalogue afin de l’aligner sur ce niveau éditorial.

Réemploi proposé : L2 : Chercher une demande complète d’accès ou d’information simple. → L5 : Signaler le problème et obtenir une solution concrète. → L6 : Expliquer une contrainte de travail à distance. → L7 : Prévoir une solution de remplacement en cas de coupure.

### Relations : invitations et limites polies — niveau proposé L8

Entretenir une relation avec les proches, adapter une invitation et exprimer un désaccord avec précaution ; le registre doit être vérifié dans chaque langue.

Ancrages existants :

- `DECKS.en[2557]` — **utterance** : « No offense, but I disagree. » / « Sans vouloir te vexer, je ne suis pas d'accord. » ; source L8, classement éditorial actuel L8.
- `DECKS.en[4378]` — **vocabulary** : « the in-laws » / « la belle-famille » ; source L4, classement éditorial actuel L4.
- `DECKS.en[3103]` — **vocabulary** : « a close friend » / « un ami proche » ; source L2, classement éditorial actuel L2.

Recherche à faire avant enrichissement :

- Rechercher des invitations et refus complets adaptés au lien social, avec tours reçus ; ne pas présumer que la même politesse convient à tous.
- Vérifier la portée pragmatique de la réplique anglaise citée, et les registres JA/KO avant toute déclinaison.

Réemploi proposé : L1 : Saluer un proche et se présenter avec les formules préparées. → L3 : Inviter et accepter ou refuser dans un échange complet. → L5 : Convenir d’un horaire de rencontre. → L8 : Adapter une limite ou un désaccord à la relation.

### Opinions : reconnaître un argument et répondre — niveau proposé L9

Reconnaître le point de vue reçu, défendre un critère et répondre à une objection ; les mots simples déjà connus servent de rappel, pas de preuve que l’argumentation est préparée.

Ancrages existants :

- `DECKS.en[2520]` — **utterance** : « Fair enough, I get your point. » / « C'est juste, je comprends ton point de vue. » ; source L8, classement éditorial actuel L8.
- `DECKS.en[3788]` — **vocabulary** : « important » / « important » ; source L1, classement éditorial actuel L1.
- `DECKS.en[3784]` — **vocabulary** : « useful » / « utile » ; source L1, classement éditorial actuel L1.

Recherche à faire avant enrichissement :

- Chercher une raison puis une objection reçue et une réponse complète préparée ; l’acquiescement cité ne suffit pas à enseigner ce cycle.
- Chercher les adverbes de portée et locutions de relation attestés, sans assimiler automatiquement tout connecteur à un adverbe.
- Ne pas créer un L9 artificiel avec seulement important/utile : la nouvelle capacité porte sur les constructions et l’échange.

Réemploi proposé : L3 : Exprimer un accord ou désaccord bref dans une phrase attestée. → L6 : Donner un avis et une raison sur un choix concret. → L8 : Nuancer la portée ou le registre de l’avis. → L9 : Répondre à une objection avec un argument préparé. → L10 : Reformuler et conclure un désaccord sans modèle fixe.

## Contrat du prochain lot

1. Rechercher chaque besoin dans les sept decks, les variantes entières et les dialogues des 110 JSON. Garder index, champs, empreinte et type. Les exemples de ce dossier ne prouvent que des ancrages fr→en.
2. Vérifier les prérequis et la forme complète de chaque réplique ; ne pas assembler les mots copiés pour fabriquer une nouvelle phrase ou une phonétique.
3. Si une source existe avec d’autres aides ou un autre sens, consigner la divergence au lieu d’aligner silencieusement.
4. Si une formulation manque après recherche documentée, ouvrir une rédaction séparée avec phonétique entière selon la méthode de Kartech puis revue adaptée.
5. Conserver une seule carte canonique par source ; les rappels lexicaux passent par `reuseVocabularyIds`. Ne pas modifier `lv` pour faire coïncider un mot et une phrase.

Aucune UI, aucun bundle et aucune classification n’ont été modifiés par ce dossier. Aucune phrase étudiée ni phonétique nouvelle n’est créée, et aucune activation ou publication n’est demandée.
