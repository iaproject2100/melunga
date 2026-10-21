# Contrat `received` — annexe d'essai par couple

21 octobre 2026. Version documentaire 1, hors des contenus publiés. Elle précise la proposition du 20 octobre et l'avis de Claude. **Ce n'est pas une nouvelle version du chargeur.** Aucun niveau, fichier conversation, droit ou prix n'est changé.

Les deux fichiers `received-fr-zh.json` et `received-fr-ko.json` décrivent des **recompositions pilotes**. `sceneId` désigne le pilote, pas un dialogue original réécrit. `sourceCommit` est un repère de provenance ; les contrôles utiles contre un décalage portent aussi sur les références, le texte et les aides.

## Sources et compréhension

Une source `dialogueTurn` précise niveau, dialogue, rôle apprenant, index zéro et texte attendu. Le validateur relit le dialogue : le tour reçu doit appartenir à l'autre rôle. A n'est pas présumé être l'apprenant.

Une source `catalogue` précise langue, index et texte attendu, puis reprend les aides pour le bon lecteur. Cela permet 好的 sans faux `dialogueId`. L'annexe ne maintient pas une seconde traduction ou phonétique : la maquette reprend celles de la source enregistrée. `reading` est requis pour zh/ja/ko, optionnel pour les autres langues.

`analyse:false` signifie **compréhension globale à cette étape**, sans exiger de produire ou d'analyser la grammaire. Cela ne certifie aucun acquis et n'interdit pas un approfondissement ultérieur. Le badge **À comprendre** distingue le reçu. L'aide reste accessible et le rappel concerne seulement `kind:learner`.

## Réponse exacte et préparation prévue

Pour `안녕하세요. 뭐 드릴까요?`, le mini-pilote utilise :

```json
"analyse": false,
"countsAsProduction": false,
"preparedInStep": "ko-received",
"replyRequired": true,
"answerWith": [
  {
    "unitId": "L1-fr-ko-03",
    "variantIndex": 0,
    "expectedStudy": "커피 주세요.",
    "preparedInStep": "ko-understand"
  },
  {
    "unitId": "L1-fr-ko-03",
    "variantIndex": 1,
    "expectedStudy": "물 주세요.",
    "preparedInStep": "ko-substitute"
  }
]
```

Une référence identifie une variante entière. Son passage doit contenir cette phrase et précéder la scène dans le **plan**. Cela ne prouve pas que l'utilisateur l'a écoutée ou apprise. Chaque occurrence de question doit être suivie d'une réponse productive autorisée. Les choix réemploient des phrases complètes et leurs aides, sans assemblage de phonétique.

Cette version référence des variantes comme réponses. Une réponse venant d'un tour plutôt que d'une variante demandera une référence typée de tour ; ne pas lui attribuer de faux `unitId`. Aucun besoin de ce second type pour ces deux pilotes.

## Clôture explicite

Pour 好的 : `analyse:false`, `countsAsProduction:false`, `preparedInStep:"zh-received"`, **`replyRequired:false`, `answerWith:[]`**. Une liste absente est une omission, pas une clôture implicite. Dans cette version, une clôture sans réponse termine la scène. Aucun quota ne force une production inutile.

## Contrôles et limites

`python3 prepare.py --check` contrôle les sources, l'appui, les annexes et l'export. `python3 -B test_received_contract.py` vérifie les erreurs : couple mélangé, mauvais rôle, source ou aide changée, index inexistant, unité non précisée, préparation tardive, réponse avant la question, répétition sans réponse, clôture contournée et crédit productif attribué au reçu. Un cas utilise `L10-fr-ko-d2`, apprenant B : fixture de rôle uniquement, pas séquence L10 nouvellement livrée.

Une erreur empêche la régénération documentaire silencieuse avec une mauvaise source. L'application actuelle ne charge pas ces annexes ; son comportement reste inchangé. Le script ne valide ni naturel, tons/sons, pertinence sémantique ni efficacité pédagogique. Relecture humaine et essais restent nécessaires.

Séparer **production préparée** et **réception** dans les éventuels bilans. Le reçu n'est pas une phrase maîtrisée en production ; sa difficulté ne disparaît pas de l'audit du dialogue. Mesures historiques, accès et suivi de maîtrise restent inchangés.

Avant les sept couples : relire annexes et pilotes réels, puis convenir du contrat de la future couche séquence, du changement de rôle et du repli si l'annexe manque. Cette intégration est un lot distinct soumis à validation de Kartech.
