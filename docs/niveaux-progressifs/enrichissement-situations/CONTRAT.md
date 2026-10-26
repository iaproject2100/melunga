# Contrat du lot de situations

Lot de revue séparé : aucune modification des 140 entrées précédentes, du catalogue ou de ses niveaux d’accès. Les fichiers d’exécution ne sont générés qu’après gel du plan et des sept fichiers linguistiques.

## Plan

`plan.json` définit dix rubriques, deux par niveau L2–L6, avec huit intentions au même niveau dans chaque rubrique. Chaque thème possède `id`, `domain`, `level`, `title: {fr, zh}`, `visualId` et `intents`. Un `visualId` vaut `situation-<topicId>` et désigne une nouvelle photographie, partagée entre les couples linguistiques.

## Fichier linguistique

Chemin : `<pair>.json`, avec `version: 1`, `pair`, `planHash` (SHA-256 des octets de `plan.json`), `status: "editorial-review"`, `items` et `searchEvidence` facultatif.

Chaque item porte :

- `id` unique, `pair`, `topicId`, `intentId`, `proposedLevel`, `contentType: "utterance"` ;
- `kind`: `catalogue-reference`, `conversation-whole-entry`, `editorial-authored-whole-entry` ou `candidate-reference` ;
- les champs entiers `study`, `native`, `phon`, et `reading` si la source en possède un ;
- `editorialReviewStatus: "reviewed"`, `phoneticReviewStatus: "existing-verbatim"` pour une copie existante ou `"pending-Claude"` pour une aide rédigée ;
- `reason` expliquant la pertinence pour cette intention ;
- `duplicateAudit`, `dependencyConcepts` facultatif, `oneParameter` facultatif (descriptif, ne fabrique aucune variante).

`duplicateAudit` doit distinguer les correspondances exactes de forme, les différences de traduction et les vrais sens différents. Forme déjà présente ou ponctuation seule changée ne constitue pas une nouvelle phrase. Une traduction ou une transcription différente ne rend pas une forme nouvelle. Les aides existantes sont reprises entières ; aucun assemblage ni découpage phonétique.

### Carte du catalogue

`source: {collection: "DECKS.<lang>", sourceIndex, sourceLevel, sourceSha256}`. L’indice est celui du tableau original, à partir de zéro ; l’empreinte est celle de la carte entière (JSON canonique UTF-8, clés triées, sans espaces). Les champs doivent correspondre exactement à cette carte. L’identifiant canonique d’exécution est `catalogue:<lang>:<index>` ; aucun second identifiant n’est créé pour un réemploi.

### Conversation existante

`source: {path, jsonPointer, fileSha256, entrySha256, sourceCommit?}`. Le fichier parent complet est copié sans modification sous `sources/conversation/<pair>/` dans ce dossier. `path` est relatif à la racine du dépôt. `jsonPointer` pointe vers un objet entier possédant `study/native/phon[/reading]`. L’empreinte de fichier porte sur les octets ; celle de l’entrée sur le JSON canonique. Les snapshots sources restent indépendants du catalogue ; aucun faux indice DECKS n’est fourni.

Les fichiers peuvent provenir de l’archive locale `melunga-progression-corrections/melunga_deploy/content/conversation/`. Seuls les parents nécessaires sont copiés, intégralement, afin que la preuve soit portable. Conserver le rôle d’origine dans la provenance ; expliquer la pertinence de son usage dans la nouvelle situation.

### Phrase réellement rédigée

`source: {kind: "editorial-authored-whole-utterance"}`. La phrase, son sens et son aide sont rédigés en entier, avec `phoneticReviewStatus: "pending-Claude"`. La nouveauté de forme est vérifiée contre le catalogue, les conversations consultées et les autres candidats du même couple. Un doute de doublon est déclaré, pas résolu en changeant silencieusement la traduction.

### Réemploi d’un autre candidat du même lot

`source: {candidateId}` et `kind: "candidate-reference"`. Les champs sont identiques à ceux de l’item cité, avec le même statut phonétique. Aucun nouvel identifiant canonique ni nouvelle phrase n’est compté. Le graphe doit être sans cycle. La première rencontre prévue ne peut pas être postérieure au réemploi.

## Première rencontre et contexte

Une source déjà introduite au même niveau ou à un niveau antérieur conserve son emplacement canonique. La nouvelle rubrique utilise `contextReferences`, `reuseCount` et des étapes `isContextReuse: true`, via la même banque de transport. « Réemploi » ne signifie pas qu’une personne l’a déjà étudiée ou acquise.

Une source actuellement plus tardive exige une décision explicite : `introductionDecision: {action: "introduce-earlier", fromEditorialLevel, proposedLevel, reason, reviewStatus: "reviewed"}`. Cette décision ne change jamais `sourceLevel` ni les droits gratuit/payant. Sans cette décision, le cas reste à résoudre avant génération ; il n’est pas discrètement présenté comme une révision.

Le lot rend compte séparément des sources réemployées, des anciens contenus importés, des entrées rédigées, des formes véritablement nouvelles et des doublons ou nouveaux sens d’une forme existante. Les 560 candidats ne sont jamais annoncés comme 560 nouvelles phrases.
