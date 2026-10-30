# Revue thématique L1–L10 — aide demandée à Claude

## Objectif et périmètre

Examiner la cohérence du classement des phrases dans les thèmes pour les **12 langues étudiées et les 10 niveaux** : français, anglais, espagnol, italien, chinois, japonais, coréen, allemand, hindi, russe, portugais du Brésil et arabe. L’inventaire des 120 cellules est déjà disponible ; la revue sémantique reste à faire au-delà des 18 exemples documentés. Le propriétaire demande explicitement de vérifier **tous les niveaux** : les priorités déterminent uniquement l’ordre du travail, jamais une réduction du périmètre.

Ce travail concerne le regroupement thématique. La revue du texte et des phonétiques allemandes est close ; ne pas la recommencer. Il ne s’agit pas du chantier distinct des traductions des langues de l’application.

## Sources à lire

- [Diagnostic et 18 propositions vérifiées](README.md).
- [Inventaire complet avec identités et empreintes des banques](audit.json).
- [Tri des 120 cellules à examiner](priorites.json). Les seuils de comptage servent à prioriser ; ils ne prouvent pas une erreur.
- Banques complètes : `melunga_deploy/content/native-catalogue/{code}.json`. Chaque banque contient les cartes, leurs `locations`, les niveaux et les thèmes avec `phraseIds`. Utiliser ces identités, pas une position dans une liste affichée.

## Répartition du travail

**Claude** : lire le sens des cartes et proposer des affectations thématiques précises, avec justifications. Examiner d’abord les grandes rubriques génériques et les petites situations, puis couvrir le reste des niveaux.
**Codex** : confronter les propositions aux sources, appliquer les décisions validées, régénérer les catalogues et contrôler les identités, les accès, les étapes, la progression et les présentations mobile/ordinateur. Aucune correction de cet audit n’est encore publiée.

## Consignes de revue

1. Commencer par les rubriques les plus chargées indiquées ci-dessous, puis couvrir chaque langue et L1–L10. Vérifier le sens intégral des phrases ; un mot-clé isolé ou un nombre élevé ne suffit pas. Les correspondances de traductions entre banques peuvent propager un ancien mauvais classement : les relire.
2. Conserver les phrases de conversation réellement pertinentes, les proverbes et les expressions courantes voulus. Ne pas viser des tailles artificiellement identiques. Une rubrique de vocabulaire à une entrée ne se juge pas comme une situation conversationnelle.
3. Proposer une destination existante du **même niveau** pour chaque déplacement justifié. Toute création, fusion ou modification d’intitulé doit être une proposition distincte, pas une modification automatique. Signaler les cas incertains séparément.
4. Conserver les identités, les 15 champs de chaque carte, notamment `t`, `lv`, `cat` et toutes les phonétiques. Aucun ajout, suppression ou duplication de carte ; aucune réécriture de traduction. Conserver l’ordre relatif des cartes de chaque thème de destination, les photos et l’architecture.
5. Ne pas toucher aux mini-scènes ni à leur ordre interne, aux réserves, au contenu payant/gratuit, aux comptes ou à la progression sauvegardée. Signaler les implications de progression d’un déplacement pour que Codex les traite.
6. Le découpage d’une grosse rubrique en étapes de 30 à 40 cartes existe déjà. Il facilite la pratique, mais ne justifie pas de conserver un mauvais classement.

## Format attendu

Livrer les propositions par lots de niveaux L1–L3, L4–L6, L7–L10, et par langue. Un fichier JSON peut accompagner le rapport :

```json
{"language":"hi","level":6,"id":"catalogue:hi:2890","sourceIndex":2890,"t":"खोए सामान का काउंटर कहाँ है?","currentTheme":"L6-conversation","proposedTheme":"L6-deplacements","reason":"Demande du guichet des bagages perdus à l’aéroport.","status":"proposed"}
```

`sourceIndex` commence à 0 ; si le rapport utilise un numéro de carte à partir de 1, le préciser. Vérifier `id` et `t` contre la banque. Un cas incertain ne doit pas devenir un déplacement automatique.

Indiquer pour chaque lot les langues/niveaux réellement lus et la couverture, les déplacements proposés, les thèmes laissés inchangés après lecture et les ambiguïtés. Fournir un bilan des **120 cellules langue × niveau**, y compris celles où aucune erreur n’est constatée. La cible est la lecture de toutes les phrases affichées dans leurs rubriques ; les réserves restent inventoriées sans réaffectation. Ne pas annoncer une revue exhaustive si seules les cellules prioritaires ont été relues. Le travail reste ouvert tant qu’une cellule ou une rubrique affichée n’a pas été examinée.

## Premières priorités par taille de situation

Ces chiffres sont issus du catalogue actuel. Ils ne sont pas des objectifs de répartition.

| Langue | Niveau | Plus grosse situation | Expressions | Petites situations (< 5) |
|---|---:|---|---:|---:|
| es | L2 | Poser et reprendre une question | 309 | 3 |
| ar | L5 | Se mettre d’accord | 280 | 2 |
| ar | L3 | Proposer et répondre | 276 | 0 |
| ar | L7 | Anticiper et négocier | 274 | 4 |
| ar | L6 | Donner son avis et relancer | 268 | 2 |
| es | L5 | Se mettre d’accord | 234 | 1 |
| fr | L2 | 提问并接着问 | 232 | 3 |
| ar | L4 | Partager une expérience | 231 | 1 |
| ja | L2 | Poser et reprendre une question | 229 | 6 |
| en | L3 | Proposer et répondre | 225 | 6 |
| hi | L5 | Se mettre d’accord | 223 | 0 |
| en | L2 | Poser et reprendre une question | 223 | 3 |
| es | L4 | Partager une expérience | 220 | 0 |
| ar | L8 | Adapter son registre professionnel | 220 | 2 |
| ko | L7 | Proposer une alternative | 219 | 1 |
| es | L6 | Donner son avis et relancer | 218 | 0 |
| fr | L3 | 提议并作出回应 | 217 | 5 |
| fr | L5 | 达成一致 | 215 | 3 |
| ru | L5 | Se mettre d’accord | 213 | 0 |
| ru | L6 | Donner son avis et relancer | 211 | 0 |
| ru | L3 | Proposer et répondre | 210 | 0 |
| hi | L6 | Donner son avis et relancer | 208 | 0 |
| hi | L3 | Proposer et répondre | 208 | 0 |
| es | L3 | Proposer et répondre | 206 | 3 |
