# Contrat de sélection des séquences L1–L10

Proposition réversible pour la revue avec Kartech et Claude. Base de lecture : `ea2619bc6f24e81c254ca00dc272dd76d35cc9a3`. Ce contrat organise des références aux sources existantes ; il n'est pas le contrat du chargeur publié et ne modifie pas les 110 JSON, `DECKS`, `PEDAGOGY_FAMILIES`, les phonétiques ou les droits.

## Périmètre et livrables

Le socle proposé contient sept couples : `fr→en/es/it/zh/ja/ko` et `zh→fr`. Une première sélection candidate par niveau et par couple représente 70 séquences. Les quatre couples anglais lecteurs `en→es/it/zh/ja` font partie de l'audit de réserve, sans activation de nouveau public. Quatre variantes ne constituent pas à elles seules un niveau : chaque séquence introduit ou consolide une capacité précise de la progression générale.

Chaque séquence candidate contient :

- une intention située et un niveau pédagogique proposé ;
- les quatre phrases entières et exactes de l'unité sélectionnée, dont la compatibilité du cadre reste à relire ;
- une seule opération visée au premier changement, avec les autres difficultés identifiées ;
- les répliques reçues nécessaires à un échange cohérent, présentées avant celui-ci ;
- les sources des éléments réemployés, les étapes où ils sont proposés et une suite de réemploi ;
- une tâche où l'apprenant choisit son intention, avec ses aides disponibles ;
- la provenance, le plancher d'accès et les lacunes éventuelles.

Une source à trous, une brique seule ou quatre phrases partageant seulement un mot ne suffisent pas à former une séquence de remplacement. Si le cadre change, scinder la préparation ou déclarer l'opération supplémentaire et ses étapes. Les quatre variantes peuvent être conservées comme **ensemble d'expressions source à relire**, sans être présentées comme une famille de substitution validée. Les dialogues sources restent disponibles ; une scène recomposée est identifiée comme telle.

L'annexe d'importation exhaustive et la sélection guidée sont distinctes. L'importation peut décrire chaque unité et préparer chaque tour de dialogue, mais son exhaustivité n'atteste pas la cohérence de l'ordre d'apprentissage. La sélection retient une entrée principale et des compléments pour chaque niveau/langue ; elle documente le choix et ses limites plutôt que promouvoir automatiquement toutes les unités en séquences prêtes.

## Registre de sources immuables

Une entrée du registre appartient à un seul couple lecteur/langue étudiée. L'identifiant est stable, distinct de la phrase affichée et de son rôle ponctuel dans une scène. Deux cartes au même texte peuvent avoir des aides, un accès ou un contexte différents : ne pas les fusionner par le seul texte.

| Type de source | Repères indispensables | Vérification |
|---|---|---|
| Variante conversation | Fichier `L<n>-<nat>-<study>.json`, `unitId`, index zéro de variante | Unité et variante existent ; couple et niveau de fichier correspondent ; `study/phon/native/reading` sont identiques à cette variante entière |
| Tour de dialogue | Même fichier, `dialogueId`, index zéro de tour, `speaker`, `learnerRole` de source | Relire le tour entier et les rôles ; ne pas prendre systématiquement A pour l'apprenant ni découper une salutation hors du tour |
| Carte de catalogue | Fichier `app.html`, langue `DECKS`, index zéro, texte attendu, noms exacts des champs du lecteur | La carte existe encore à cet index ; le texte attendu et les aides correspondent ; le niveau historique vient de la carte, pas de la famille qui la référence |
| Brique secondaire | Source parente variante/carte et emplacement exact, si présent dans la source | Aide d'observation seulement ; ne compte pas dans les quatre phrases ni comme réponse complète de l'échange |

Le registre conserve `sourceCommit`, empreinte du fichier, repères et valeurs originales. Le commit est un repère de provenance ; un format de hash valide ne prouve pas que les valeurs correspondent. Le contrôle relit les fichiers et compare les champs. Une empreinte inchangée peut être vérifiée même si un commit documentaire ultérieur a déplacé HEAD.

Les valeurs d'affichage `study`, `native`, `phon` et `reading` viennent directement de la source. Pour ce lot, **aucune proposition locale ne remplace une phonétique source**, même si un ancien pilote en présentait une. Aucune normalisation silencieuse de casse, accent, espace ou ponctuation n'est appliquée à l'aide. Un nouveau lecteur ne reçoit pas la phonétique destinée à un autre public. Si un champ requis manque, la référence est incomplète et reste candidate.

Ne pas générer la phrase par `model + slot`, ni la phonétique par concaténation de fragments. La variante entière fait autorité, y compris ses accords, élisions, particules et finales. La description d'un morceau à changer peut être ajoutée en métadonnée documentaire ; elle ne fabrique pas un nouvel énoncé étudié.

## Métadonnées de séquence

Le schéma ci-dessous décrit des rôles de champs, pas une source à copier dans le chargeur actuel.

| Champ | Sens |
|---|---|
| `sequenceId` | Identifiant unique de la sélection, indépendant du texte |
| `pair` | `native` et `study` ; toutes les sources appartiennent à ce couple |
| `proposedLevel` | L1–L10 de la progression communicative proposée ; ce n'est ni une preuve de difficulté ni une modification du niveau source |
| `status` | Candidate, sources vérifiées, relue, essayée ; l'intégrité ne déclenche pas un statut d'apprentissage |
| `intent/context` | But concret, interlocuteurs et situation permettant de juger les réponses |
| `frame/operation` | Invariant réellement conservé et seul changement visé ; toute adaptation supplémentaire est déclarée |
| `productionSources` | Les quatre références d'énoncés entiers de l'unité candidate, avec aide source intacte et compatibilité à relire |
| `receivedSources` | Répliques à comprendre, avec annotations spécifiques à leur occurrence |
| `plannedPrerequisites` | Sources/séquences antérieures proposées à l'entraînement ; pas une liste de connaissances présumées de l'utilisateur |
| `steps` | Comprendre, imiter, préparer le changement, remplacer, recevoir, échanger et réemployer ; ordre explicite adapté à la scène |
| `reuseFrom/reuseLater` | Liens précis vers des éléments antérieurs et reprises prévues ; distinguer une cible future planifiée d'une séquence déjà rédigée |
| `transferTask` | Une intention ou contrainte différente du modèle ; choix pertinents sourcés, ou tâche orale ouverte sans correction automatique prétendue |
| `access` | Niveaux et règles historiques des sources, maximum calculé et compatibilité avec le placement proposé |
| `gaps/reviewNotes` | Source absente, cadre mélangé, réception difficile, registre, phonétique à relire ou suite non encore rédigée |

La même phrase peut servir de réception dans une scène et de production dans une autre. `kind` décrit l'usage de cette occurrence, pas une propriété absolue de la carte source.

## Préparer sans prétendre que c'est appris

`introducedInStep` repère la première présentation entière d'une réplique reçue avant son emploi dans la scène. Une auto-référence qui la montre seulement dans le dialogue final ne constitue pas une introduction préalable.

`preparedInStep` repère, pour une **réponse à produire**, une étape antérieure où cette phrase entière est offerte à la compréhension, imitation ou préparation du changement. Une référence à un mot commun, un titre de famille ou une phrase différente n'est pas suffisante.

Ces deux champs prouvent une propriété du plan seulement. Ils ne prouvent ni que l'apprenant a vu l'étape, ni qu'il l'a comprise ou retenue. Une étape peut aussi proposer des éléments de préparation réceptionnelle distincts, avec leurs sources, sans appeler ceux-ci des acquis. Ne pas introduire une dépendance cyclique « A déjà connu grâce à B qui suppose A ».

Au premier remplacement, le plan doit montrer la phrase de départ **et** les nouvelles phrases complètes avant de demander de choisir entre leurs morceaux. Si un nouveau verbe change plusieurs constructions, la sélection doit préparer ce changement ou le séparer ; un script ne peut pas déclarer leur difficulté identique.

Le réemploi entre niveaux référence une séquence/source antérieure du même couple. Un lien textuel heuristique vers un modèle ne vaut ni préparation effective ni acquisition. Une séquence L1 n'invente pas un prérequis d'un niveau ultérieur ; une source historique tardive ne devient pas ancienne parce qu'une métadonnée le dit.

## Réception, réponse et rôle

Pour chaque occurrence reçue d'une scène :

- `analyse:false` : compréhension globale dans cette séquence ; pas obligation d'analyser tous ses composants ;
- `countsAsProduction:false` : la phrase n'entre pas dans un bilan de production du seul fait d'être entendue ;
- `introducedInStep` : présentation entière préalable vérifiable ;
- `replyRequired:true/false` : décision explicite selon la fonction de ce tour ;
- `answerWith` : références exactes des réponses autorisées pour **ce tour**, chacune avec `utteranceId` et préparation antérieure ; liste vide explicite si aucune réponse n'est attendue.

Ces annotations n'effacent pas la difficulté de compréhension. La réception reste dans l'audit lexical et pédagogique avec son propre périmètre. « Pas à produire ici » ne signifie pas « facile », « compris » ou « sans nouveau contenu ».

Le rôle de l'apprenant est explicite pour la scène, indépendamment des lettres A/B des sources. Dans un dialogue source, un apprenant B reçoit des tours A ; les noms et fonctions des personnages doivent être conservés ou le nouveau contexte signalé comme recomposition à relire.

Une scène peut commencer par la question de l'autre ou par la demande de l'apprenant. Pour un tour reçu exigeant une réponse, vérifier le **tour suivant de l'apprenant** et sa correspondance avec `answerWith`. Ne pas accepter une réponse située avant la question ou après une clôture. Tous les choix visibles pour cette occurrence doivent être couverts. Avec plusieurs questions, ne pas appliquer une liste globale de choix à tous les tours.

Une clôture `replyRequired:false/answerWith:[]` termine la scène courte qui la désigne. Si le dialogue se poursuit, il faut représenter cette continuation explicitement au lieu de traiter chaque reçu comme une clôture. Question → réponse → clôture est un petit cycle utile, pas l'unique forme autorisée de toute conversation L1–L10.

Les identifiants de choix sont non vides et uniques dans leur portée. Un changement de choix remplace le tour de l'apprenant auquel il est lié, sans changer silencieusement le tour reçu, le couple ou les aides. Un dialogue multi-intentions doit porter cette liaison par occurrence.

## Accès : classement pédagogique et droits restent distincts

Conserver séparément :

1. `historicalLevel` de chaque source exacte ;
2. `proposedLevel` de la séquence communicative ;
3. `minimumAccessLevel`, maximum des niveaux historiques requis par **toutes** ses références, y compris reçus et aides secondaires ;
4. les règles d'accès existantes qui peuvent dépendre d'un autre contexte que ce nombre.

Une séquence nouvelle ne peut pas exposer une source à un accès inférieur à celui de cette source en lui attribuant un nouveau numéro pédagogique. Si le plancher dépasse le placement visé, changer les références, repositionner la séquence ou marquer une lacune. Ne pas renuméroter les données canoniques pour faire passer la vérification.

Un même texte déjà disponible dans un JSON L1 et dans une carte classique plus tardive reste deux sources distinctes : sa référence doit désigner l'entrée réellement utilisée et ses aides exactes ; aucun appariement par texte ne réécrit l'autre carte. À l'inverse, ce chantier ne supprime pas les possibilités déjà gratuites et ne déplace pas une source gratuite derrière Premium.

Le numéro L1 gratuit ne signifie pas que quatre phrases remplacent l'offre L1 actuelle. Aucune activation, nouveau prix, essai gratuit, autorisation de paiement ou droits locaux ne découle de ce contrat.

## Ce que le contrôle automatique peut refuser

Le validateur de cette couche documentaire doit pouvoir détecter :

- source, unité, variante, index ou champ cassé ; couple différent ; niveau historique discordant ;
- texte ou aide affichée divergente de la source, dont une phonétique reconstituée ;
- même identifiant de séquence/choix en double, source vide, gabarit à trous promu en phrase entière ;
- une des quatre variantes sources omise sans déclaration de sélection partielle et de lacune ;
- présentation reçue absente, postérieure ou faussement déclarée première ; réponse non présentée avant l'échange ;
- source de brique utilisée comme réponse complète ou comptée dans le minimum ;
- rôle source contredit, apprenant A supposé malgré `learnerRole:B`, réponse précédente acceptée comme réponse suivante ;
- reçu répétant la question sans réponse autorisée, choix d'une autre question, mauvaise liaison multi-tour ou suite après une clôture terminale ;
- dépendance préalable vers un niveau ultérieur/cycle, réemploi qui pointe vers une cible inexistante sans état « prévu » ;
- plancher d'accès incorrect ou placement qui expose les sources trop tôt ;
- séquence lacunaire exportée comme prête ou aide manquante masquée par un repli inventé.

Les tests négatifs doivent muter des sélections valides et vérifier le refus : inverser question et réponse ; remplacer la réponse par une variante d'un autre couple ; modifier un seul caractère phonétique ; donner deux choix au même identifiant ; donner à une deuxième question les réponses de la première ; faire passer une source L3 dans une séquence accessible L1. Une sélection volontairement lacunaire reste exportable pour revue avec son état et ses manques, jamais comptée « complète ».

## Ce que le contrôle ne peut pas certifier

Le nombre de références, leur égalité et l'ordre des étapes ne prouvent pas que les variantes gardent le même cadre, que le nouveau morceau est seul difficile, que l'enchaînement est naturel ou que l'apprenant comprend. Ces points demandent une relecture humaine et des essais. Une phrase phonétiquement source exacte peut malgré tout demander une relecture de qualité ; ce lot la conserve au lieu de la corriger silencieusement.

Les mesures écrites distinguent types/occurrences, production/réception, segmentation et couples effectivement analysés. Une mesure ancienne de 70 fichiers ne devient pas un constat sur 110 fichiers. Réduire un dénominateur en retirant les reçus ne démontre pas une amélioration de leur compréhension.

La revue de Claude porte sur les sélections, les préparations, les dialogues recomposés et les lacunes. Les décisions éditoriales, l'intégration à l'application et la publication constituent des étapes séparées. Ce registre peut être retiré sans réécrire les sources : c'est le sens de sa réversibilité.
