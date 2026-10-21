# Contrat `received` — annexe d’essai, version 2

Cette version répond à la relecture `113b247`. Elle reste documentaire, hors des contenus publiés : aucun changement du chargeur, des 110 JSON, des droits ou des prix. La version 1 désignait l’introduction du reçu par un nom ambigu et ne pouvait référencer une réponse du catalogue ; la version 2 rend ces deux points explicites.

Les fichiers `received-fr-zh.json` et `received-fr-ko.json` décrivent des **recompositions pilotes**. Leur `sceneId` ne prétend pas désigner un dialogue original réécrit. `sourceCommit` reste un repère de provenance ; les références, valeurs originales et aides présentées restent contrôlées séparément.

## Source reçue et première présentation

`source.type: dialogueTurn` précise niveau, dialogue, rôle apprenant, index zéro et texte attendu. Le validateur relit le dialogue : le tour reçu doit appartenir à l’autre rôle. A n’est pas présumé être l’apprenant. Le coréen conserve le tour complet avec salutation, sans créer d’extrait prétendument original.

`source.type: catalogue` précise langue, index et texte attendu. Les aides sont celles du lecteur concerné. Cela permet les questions et clôtures chinoises, ainsi que 네., sans faux `dialogueId`.

**`introducedInStep`** nomme la première présentation entière du reçu, avant la scène. Le script vérifie cette première occurrence ; le simple fait de se référencer à une étape quelconque ne suffit pas. La salutation isolée ayant disparu, aucun lien de préparation partielle n’est nécessaire dans ces pilotes. Pour en ajouter un ailleurs, concevoir une référence distincte, et ne pas confondre connaissance d’un morceau et compréhension de toute la phrase.

`analyse:false` signifie compréhension globale à cette étape. L’aide reste accessible et le badge **À comprendre** distingue le reçu. Cela ne certifie pas la compréhension et n’interdit pas de produire ou d’analyser la formule plus tard.

## Répondre avec une source exacte préparée

`answerWith` référence le registre source de la maquette :

```json
"introducedInStep": "zh-received-question",
"analyse": false,
"countsAsProduction": false,
"replyRequired": true,
"answerWith": [
  {
    "utteranceId": "zh-deck-416",
    "expectedStudy": "我想回家",
    "preparedInStep": "zh-prepare-home"
  }
]
```

L’annexe réelle autorise aussi le repos. Les réponses coréennes utilisent les identifiants enregistrés des variantes complètes 03/v0 et 03/v1. Le registre contient leur provenance typée, les aides et le couple ; une carte n’est pas transformée en fausse unité conversation pour entrer dans le contrat.

**`preparedInStep` reste sur la réponse** : il désigne le passage qui contient cette phrase entière avant l’échange, selon le plan. Cela ne prouve pas que l’utilisateur l’a écoutée ou apprise. Chaque occurrence de question doit être suivie d’une réponse productive autorisée. Tous les choix de cette petite scène doivent être couverts ; pour plusieurs questions d’intentions différentes, prévoir des choix rattachés à un tour précis plutôt que réutiliser implicitement ceux de toute la scène.

Les pilotes actuels ont un seul cycle par scène : **question reçue → réponse préparée → clôture reçue**. Les scripts vérifient cet ordre, après comprendre/imiter/préparer/remplacer. La souplesse future du parcours ne découle pas d’un nombre obligatoire de huit étapes.

## Clôture explicite

Pour 好的 et 네. : `replyRequired:false`, **`answerWith:[]`**, avec leur propre `introducedInStep`. Une liste absente est une omission, pas une clôture implicite. Une clôture sans réponse termine cette petite scène. Aucun quota ne force une réplique supplémentaire.

## Valeurs originales et propositions affichées

Les sources enregistrent `original` séparément de `expected` (présentation de l’essai). `editorial-amendments.json` déclare trois propositions, limitées à `phon` ou `native` : leur valeur source exacte, valeur proposée et raison sont contrôlées. Changer une source inattendue ou le texte étudié est refusé. La carte du catalogue et les fichiers conversation ne sont pas modifiés.

Le prototype indique les propositions à l’écran. Ces notes, les aides et la phrase de l’apprenant sont retirées du DOM au rappel ; les répliques reçues restent accessibles. La copie de la provenance n’est pas une certification native.

## Contrôles et limites

`python3 prepare.py --check` contrôle sources, propositions, annexes, ordre des phases, cycles et export autonome. `python3 -B test_received_contract.py` vérifie les références cassées, les choix d’une autre langue, les aides divergentes, l’ordre des réponses, un reçu répété sans réponse, les introductions mal nommées, le retour prématuré à l’échange et les demi-cycles. Un cas relit `L10-fr-ko-d2`, dont l’apprenant est B : fixture de rôle uniquement, pas un nouveau parcours L10.

Le reçu ne devient pas un acquis productif ; sa difficulté reste dans l’audit de réception. Les mesures historiques, l’accès et les droits restent inchangés. Aucun script ne vérifie l’exposition réelle, le sens compris, la pertinence sémantique, les tons/sons ou l’efficacité pédagogique. Relecture humaine, écoute réelle et essais restent nécessaires.

Avant les sept couples : relire ces pilotes et les propositions canoniques avec Kartech. L’application actuelle ne charge pas ces annexes ; la couche séquence, le changement de rôle et le repli si l’annexe manque feront l’objet d’un lot distinct.
