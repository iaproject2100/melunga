# Contrat append-only des dix-huit pistes

Les sept anciens fichiers `<couple>.json` restent byte à byte inchangés. `plan-base10.json` conserve le plan antérieur exact ; `plan.json` conserve ses dix premiers objets de thème et ajoute les dix-huit pistes. `baseline.json` protège les 32 779 anciens canoniques (texte, sens, aide, lecture et source), les premières positions des 700 canoniques anciens de situations ou du lot lexical rédigé, et les 70 anciens thèmes de situations.

Chaque nouveau fichier `extension-<couple>.json` contient `version: 1`, `pair`, `planHash` du plan étendu, `items` (144 intentions apprenant), `receivedTurns` (une entrée pour chaque définition reçue du plan) et `lexicalSupports` (au moins deux entrées autonomes distinctes par module). Les nouveaux thèmes ont huit intentions chacun ; les réemplois ne sont jamais comptés comme de nouvelles rédactions.

Les trois tableaux emploient les mêmes champs entiers `study`, `native`, `phon`, et `reading` lorsque la source le porte ; les mêmes `kind`, `source`, `duplicateAudit`, `editorialReviewStatus: reviewed`, `phoneticReviewStatus` et `reason`. Les sources catalogue et conversation sont vérifiées avant la résolution canonique. Une entrée rédigée porte `pending-Claude`. Une aide préexistante reprise intégralement conserve son état de revue.

`candidate-reference` peut viser `source.candidateId` (ancien ou nouveau candidat du même couple) ou, exclusivement, `source.canonicalId` (un canonique existant, par exemple du lot lexical de 140 entrées). Tous les champs doivent être identiques ; aucune substitution de traduction ou de phonétique n'est permise.

## Répliques reçues

Exemple de question dans un ledger :

```json
{
  "id": "fr-en-piste-visite-proches-received-01",
  "definitionId": "piste-visite-proches-received-01",
  "pair": "fr-en",
  "topicId": "piste-visite-proches",
  "proposedLevel": 1,
  "contentType": "utterance",
  "role": {"fr": "Hôte", "zh": "主人"},
  "analyse": false,
  "answerWith": ["piste-visite-proches-07"],
  "beforeIntentId": "piste-visite-proches-07"
}
```

Les champs de source et de phrase entière s'ajoutent à cet exemple. La clôture emploie `afterIntentId`, jamais `beforeIntentId`, et déclare obligatoirement `answerWith: []`. L'ancre et la liste de réponses correspondent exactement à `plan.receivedTurnsDefs`. `definitionId` est recommandé ; sinon l'identifiant doit être celui du plan préfixé par `<couple>-`.

Le rôle est un attribut d'usage. Il n'est jamais inscrit dans le modèle canonique de réception. Une phrase peut avoir un usage apprenant et un usage interlocuteur sans devenir deux phrases différentes.

La banque de répertoire contient `receivedModels`, séparé de `phrases` : chaque objet porte `heardOnly: true`, `referenceOnly: true`, `firstHeardLevel`, les champs entiers et la source. Une copie d'un canonique de production a `canonicalLocation`; un nouveau modèle réservé à l'écoute n'en a pas. `firstHeardLevel` ne déplace jamais la première production d'un canonique catalogue.

Le thème contient des usages `receivedTurns` avec `id`, `utterance`, `role`, `level`, `analyse: false`, `answerWith`, `answerWithUtteranceIds`, l'ancre, `targetIntentId` et `prepares` (canonique cible).

Chaque étape reçue a un identifiant propre, `kind: receive`, `receivedId` égal à l'usage, et reprend le modèle, le rôle, les réponses et l'ancre. Elle porte `countsForProgress: false`, `countsTowardProductionProgression: false`, `requiresProduction: false`. La question suit les étapes comprendre et imiter de toutes ses réponses possibles et précède immédiatement le rappel de sa cible. La clôture suit immédiatement le rappel de sa cible. `preparedAnswerSteps` conserve les identifiants réellement exécutés de préparation.

`sequence.receivedIds` nomme séparément les modèles entendus. Ils n'entrent jamais dans les huit `phraseIds`, la couverture des intentions, les comptes de phrases apprenant ou le numérateur/dénominateur de progression.

## Soutiens lexicaux

Chaque entrée porte `contentType: vocabulary` (ou `number`), `lexicalFamily`, `lexicalClass` si vocabulaire, et `introducedBeforeIntentId` appartenant au même module. Elle est une unité lexicale entière et autonome, jamais une extraction improvisée d'une phrase.

Un mot nouveau devient un canonique unique dans sa vraie famille lexicale au niveau prévu. Une source préexistante est réemployée exactement. Une première introduction depuis un niveau ultérieur exige une `introductionDecision` motivée et relue ; les 700 modèles protégés ne peuvent pas être déplacés. Une source encore en réserve ou dans une rubrique insuffisamment fournie ne peut pas servir de soutien actif.

Le thème porte `lexicalSupports` comme références vers la banque : `id` canonique, `supportId`, `firstEditorialLevel`, `canonicalThemeId`, `introducedBeforeIntentId`, `reason`, `analyse: false`, `countsTowardProductionProgression: false`, `insertedIntoPhraseSteps: false`. Ces mots n'apparaissent pas dans les étapes de la situation et ne gonflent pas ses huit phrases. Leur présence est une préparation prévue, pas une preuve d'acquisition.

## Comptage

Le bilan distingue les productions réellement rédigées, les imports de phrases anciennes, les réemplois catalogue/contexte, les modèles reçus réellement rédigés, les imports reçus et les nouveaux soutiens lexicaux. Les modèles réservés à l'écoute sont exclus du total canonique de production. Tous les nouveaux champs phonétiques restent en attente de Claude ; les aides sources restent intactes. Aucun prix, abonnement, droit gratuit ou niveau du catalogue n'est modifié.
