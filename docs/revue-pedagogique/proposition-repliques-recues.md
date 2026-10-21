# Préparer les répliques reçues — proposition à discuter avec Claude

Actualisation du 21 octobre : [contrat annexe testé sur les deux pilotes](pilotes-progression/contrat-received-essai.md) et [réponse à l'avis de Claude](reponse-avis-essais-chinois-coreen.md). Le texte ci-dessous conserve la proposition initiale du 20 octobre.

20 octobre 2026. Document de proposition uniquement, destiné à la branche de revue. Aucun changement des contenus, de l’application, du chargeur ou des droits ; aucun déploiement. Le travail APK reste reporté. Lecture de `L1-fr-zh.json`, du contrat du lot A et de la réponse locale aux mesures de Claude.

## Décision pédagogique proposée

Avant un dialogue avec le rôle de l’apprenant masqué, lui permettre d’entendre et de comprendre les répliques auxquelles il devra réagir. Une découverte visible de l’échange vient avant le rappel ; une aide reste accessible ensuite. Cette préparation concerne la compréhension, et ne demande pas de produire immédiatement toute la grammaire de l’interlocuteur.

`received` peut désigner cette sélection éditoriale. Il ne faut pas l’interpréter comme « déjà compris », « acquis » ou comme une autorisation de débloquer le dialogue.

## Contrat minimal de données, sans changer les fichiers actuels

Pour le premier essai, un **fichier annexe par couple** convient mieux qu’un champ indispensable ajouté aux 110 fichiers ou au chargeur. Emplacement proposé, à valider : `received-<nat>-<study>.json`, à côté des contenus. Aucun de ces fichiers n’est créé par cette note.

Exemple de contrat indicatif :

```json
{
  "version": 1,
  "nativeLanguage": "fr",
  "studyLanguage": "zh",
  "dialogues": [
    {
      "level": 1,
      "dialogueId": "L1-fr-zh-d1",
      "learnerRole": "A",
      "received": [
        {"turnIndex": 1, "expectedStudy": "你好。您要什么？"},
        {"turnIndex": 3, "expectedStudy": "加牛奶吗？"},
        {"turnIndex": 5, "expectedStudy": "二十块。"}
      ]
    }
  ]
}
```

### Sens et limites de ces champs

- `nativeLanguage` / `studyLanguage` : un couple précis, pas seulement une langue étudiée. Des lecteurs anglophones et francophones ne partagent pas automatiquement traduction ou phonétique.
- `level` + `dialogueId` : pointent vers le dialogue existant du fichier correspondant. Les identifiants des dialogues ne changent pas.
- `learnerRole` : rôle que cette préparation accompagne, A ou B, validé face au `learnerRole` du dialogue. C’est un contexte éditorial, pas un droit ou un résultat d’exercice.
- `turnIndex` : **index à partir de zéro**, dans `dialogue.turns`. On référence une réplique entière, même si elle contient deux phrases courtes.
- `expectedStudy` : copie exacte du texte référencé, utilisée seulement pour signaler un décalage lors d’une réorganisation. Elle ne remplace pas la phrase source. Si le texte ou l’ordre a changé, l’éditeur doit revoir la référence ; ne pas afficher silencieusement la mauvaise réplique.
- L’affichage et l’audio reprennent toujours les champs de la réplique source : `study`, `native`, `phon` et `reading` quand présent. `speak` reçoit `study`, jamais l’approximation phonétique.

La référence évite de recopier séparément traduction, lecture et phonétique. Il n’existe pas aujourd’hui d’identifiant stable par réplique : index + texte attendu est un compromis pour l’essai, pas une raison de renuméroter tous les dialogues. Si de nombreuses réorganisations rendent ce compromis gênant, discuter plus tard d’identifiants de réplique stables.

Pour rester réversible : fichier annexe absent, donnée invalide ou préparation non encore livrée ne doivent ni invalider le niveau existant ni modifier l’accès. L’application actuelle ne charge pas cet annexe ; sa consommation éventuelle constitue un lot séparé à réaliser après validation. Une relecture documentaire peut déjà utiliser ce contrat.

## Exemple réel : L1 chinois, Au café

Source : `melunga_deploy/content/conversation/L1-fr-zh.json`, dialogue `L1-fr-zh-d1`, rôles **Client / Serveur**, apprenant **A = Client**. Les trois répliques du serveur existent déjà ; aucune phrase nouvelle n’est proposée ici.

| Réplique source | Phrase complète | Lecture et sens existants | Préparation de compréhension proposée |
|---|---|---|---|
| Index 1, B | 你好。您要什么？ | `nǐ hǎo. nín yào shénme?` — Bonjour. Vous désirez ? | Reconnaître qu’on lui demande ce qu’il souhaite commander ; pouvoir réécouter avec le sens et la phonétique |
| Index 3, B | 加牛奶吗？ | `jiā niúnǎi ma?` — Avec du lait ? | Comprendre le choix relatif au lait avant de tenter la réponse déjà présente `不用，谢谢。多少钱？` |
| Index 5, B | 二十块。 | `èrshí kuài.` — Vingt yuans. | Reconnaître le prix annoncé ; les nombres et la désignation courante de la monnaie demandent leur propre préparation si inconnus |

Ces trois cibles sont un bon exemple de `received`, mais elles ne suffisent pas à préparer tout le dialogue :

- Le client ouvre par `你好！`, puis commande `请给我一杯咖啡。` et répond `不用，谢谢。多少钱？`. Il faut préparer **aussi** ces productions ; leur présence dans un fichier ou dans une autre unité n’est pas une preuve d’exposition réelle.
- La réplique `不用，谢谢。多少钱？` réalise deux actes : refuser l’ajout puis demander un prix. Écouter la question sur le lait ne prépare pas, à elle seule, l’assemblage de cette réponse.
- Le prix final n’appelle aucune réponse dans le scénario écrit. On peut le travailler comme compréhension, sans prétendre qu’il donne lieu à une production évaluée.
- La phonétique source est conservée comme référence de travail, pas certifiée par cette note ; notamment les sons/tons et les approximations existantes restent à relire à l’écoute.

## Critères de composition pour Claude

1. Choisir les répliques qui portent une intention nécessaire pour poursuivre : question, alternative, précision, prix, changement ou objection.
2. Référencer les tours de **l’autre rôle**, en tenant compte du rôle apprenant réel, qui peut être B. Ne pas supposer que A est toujours l’apprenant ni que l’interlocuteur pose toujours une question.
3. Conserver le contexte. Un simple mot ou une clause détachée peut perdre le sens, le registre ou l’intonation. Si un fragment doit être travaillé séparément, le considérer comme un nouveau contenu à rédiger et relire ; ne pas reconstruire sa phonétique par collage.
4. Vérifier lexique, groupes de sens, construction et paramètres concrets : nombres, heure, destination, politesse, négation. Des caractères ou mots déjà présents ne garantissent pas que la phrase complète est accessible.
5. Ajouter une nouvelle tournure reçue à la fois quand le débutant en a besoin, puis la réemployer. La quantité exacte de nouveautés se règle par l’essai, pas par une règle universelle.
6. Préparer compréhension et production distinctement. L’apprenant peut comprendre une tournure plus riche que celles qu’il produit, avec une aide adaptée.
7. Si le lecteur change de langue maternelle, vérifier de nouveau le sens, la phonétique et le registre dans le couple correspondant ; ne pas recopier les aides francophones.

### Le nombre « une à trois »

C’est un point de départ pratique pour une petite préparation, **pas une borne du schéma ou un engagement de couverture**. Il faut distinguer nombre de tours, nombre de phrases et nombre de nouveautés. Trois tours longs peuvent être plus difficiles que cinq réponses courtes.

Si les répliques nécessaires sont trop nombreuses ou trop chargées, proposer plusieurs passages courts ou une pause, puis reprendre. Ne pas supprimer arbitrairement les réponses indispensables pour tenir un quota. Le dialogue entier peut rester dans la réserve.

## Pauses, aide et observation : aucun verrou

Scénario d’essai proposé : entendre un échange visible → réécouter une réplique reçue avec le sens et la phonétique → répondre avec aide → choisir d’essayer sans modèle → revenir à l’aide ou faire une pause → reprendre plus tard.

L’apprenant peut poursuivre ou explorer sans score obligatoire. Les observations de Kartech portent sur l’intention comprise, la réponse pertinente et les aides nécessaires. Aucun seuil automatique, note de prononciation, blocage de niveau, changement de Premium ou obligation d’utiliser le micro ne découle de `received`.

Si l’apprenant choisit de masquer l’autre rôle dans l’exercice, la préparation conçue pour `learnerRole` ne convient plus automatiquement : garder l’écoute complète accessible et signaler à la relecture qu’il faut un autre plan pour ce rôle. Ne pas réutiliser silencieusement les mêmes trois répliques comme si le rôle n’avait pas changé.

## Ce que signifie réellement la mesure de 51 %

Le chiffre reproduit concerne les **70 JSON / sept couples audités à `49dca94`**. C’est `231 / 454 = 50,88 %` de **types écrits distincts** des dialogues L1, selon la tokenisation retenue, non retrouvés dans les variantes L1. Ce n’est ni la moitié des tours ni la moitié des occurrences entendues, et encore moins un taux de compréhension.

Les langues ne sont pas segmentées de la même manière : caractères pour zh/ja dans le script, formes hangul avec particules/terminaisons en coréen, formes de surface pour d’autres langues. Les prix et heures écrits en chiffres peuvent être ignorés alors qu’ils sont essentiels à la compréhension. Le calcul suppose également les variantes du niveau disponibles, sans savoir lesquelles ont réellement été montrées.

Conséquences :

- Ne pas présenter l’ajout de trois répliques reçues comme la correction garantie des « 51 % ».
- Ne pas viser mécaniquement zéro : compréhension d’un message et simple recouvrement de tokens sont différents.
- Signaler commit, couple, périmètre, segmentation et numérateur/dénominateur à chaque mesure.
- Comparer une même séquence avant/après et revoir les exemples, sans classer directement les langues entre elles.
- L’extension à onze couples nécessite un calcul explicitement distinct ; l’ancien pourcentage ne décrit pas automatiquement les quatre nouveaux couples.

## Contrôles éditoriaux envisagés, avant toute implémentation

Un contrôle de proposition peut vérifier le couple, le niveau, l’existence du dialogue et du rôle, les index entiers bornés, l’égalité des textes attendus, l’absence de doublons et la présence des aides requises dans les tours référencés. Il peut avertir si un tour appartient au rôle de l’apprenant ou si les champs ont changé.

Il ne peut pas vérifier automatiquement qu’un humain a compris ou mémorisé la réplique. Aucun de ces contrôles n’est ajouté aux outils existants dans cette note.

## Message court pour Claude

> D’accord sur l’objectif de préparer les répliques reçues avant le dialogue masqué. Pour l’essai, proposons un annexe réversible par couple, référant aux tours existants avec dialogueId, learnerRole, turnIndex et texte attendu. La phrase source complète, sa traduction, la phonétique du lecteur et la lecture restent la référence. « Une à trois » est un point de départ, pas une limite ou une garantie de préparation. Exemple réel fr→zh café : 你好。您要什么？ / 加牛奶吗？ / 二十块。 Il faut aussi préparer les productions du client. Gardons les aides et la pause, sans verrou ni score ; les 51 % mesurent des types écrits dans un périmètre précis, pas ce que l’apprenant comprend. Maquette et contrat à valider par Kartech avant données, interface ou publication.
