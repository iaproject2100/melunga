# Extension des dix-huit pistes — chinois pour francophones

Lot de revue Codex : **144 positions d’apprenant, 37 répliques reçues et 36 soutiens lexicaux**, ajoutés aux 80 positions précédentes. Le plan commun reste identique aux six autres couples et l’architecture des thèmes est conservée.

Les 144 positions contiennent **118 phrases rédigées entières**, 23 réemplois du catalogue, 2 variantes conversation entières et 1 réemploi d’un candidat antérieur. Les 37 répliques reçues comprennent 31 rédactions, 5 réemplois du catalogue et 1 tour de conversation. Ce sont donc **149 nouvelles aides entières en attente de Claude**, séparées des aides sources conservées sans aucune retouche. Les cinq usages de mots du lot lexical antérieur gardent leur propre état `pending-Claude` ; ils ne sont pas cinq nouvelles aides.

Une position d’exercice n’est pas une fonction communicative nouvelle. Un changement de jour, d’aliment ou de chiffre ne suffit pas à déclarer une fonction ou une forme nouvelle. Une forme courte peut reprendre une fonction attestée pour rendre sa première rencontre plus accessible.

| Niveau | Module | Phrases rédigées | Réemplois entiers | Reçus | Mots de soutien |
|---|---|---:|---:|---:|---:|
| L1 | Première visite : entrer et prendre congé | 4 | 4 | 2 | 2 |
| L1 | Comprendre : faire ralentir et répéter | 3 | 5 | 2 | 2 |
| L2 | Vêtements : choisir la bonne taille | 4 | 4 | 2 | 2 |
| L2 | Santé : décrire une douleur simple | 5 | 3 | 2 | 2 |
| L2 | En ville : trouver la gare | 6 | 2 | 2 | 2 |
| L2 | Café : préciser une boisson | 7 | 1 | 2 | 2 |
| L3 | Loisirs : goûts et préférences | 8 | 0 | 2 | 2 |
| L3 | Compte : retrouver son accès | 7 | 1 | 2 | 2 |
| L3 | Cours : demander une aide précise | 8 | 0 | 2 | 2 |
| L3 | Sport : parler de ses habitudes | 5 | 3 | 2 | 2 |
| L4 | Objets : raconter une perte et se faire aider | 7 | 1 | 2 | 2 |
| L4 | Culture : raconter une sortie | 8 | 0 | 2 | 2 |
| L4 | Logement : raconter une panne d’équipement | 7 | 1 | 2 | 2 |
| L5 | Rendez-vous : déplacer une réservation | 7 | 1 | 2 | 2 |
| L5 | Connexion : résoudre un problème numérique | 8 | 0 | 2 | 2 |
| L8 | Réclamation : négocier avec tact | 8 | 0 | 2 | 2 |
| L8 | Proches : préserver la relation en posant une limite | 8 | 0 | 2 | 2 |
| L9 | Débat : répondre à une objection | 8 | 0 | 3 | 2 |

Le tour source `L4-fr-zh-d3`, `/dialogues/2/turns/2`, attribue originellement « 你经常运动吗？ » au rôle A (« Toi », rôle apprenant). Dans cette extension, la question entière est entendue comme tour du partenaire de sport. Le rôle est un attribut du nouvel usage : le fichier parent conserve explicitement son locuteur et son rôle d’origine, et cet import ne prétend pas que la source était une réplique de serveur.

Les soutiens restent dans les vraies rubriques lexicales et ne deviennent pas des étapes de la situation. Les dix-huit thèmes contiennent chacun huit phrases d’apprenant distinctes. Les questions reçues interviennent après compréhension et imitation de leur réponse possible, avant le rappel ; les clôtures suivent ce rappel et portent `answerWith: []`. Ces tours ne sont jamais à produire ni comptés dans la progression de production.

## Choix de progression et de sens

- L1 visite : `很高兴见到你。` est une formule entière courte validée par le responsable du lot. La fonction existait déjà dans `DECKS.zh[1219]`, mais `见到你我太高兴了！` reste à son niveau antérieur ; aucune construction développée n’est descendue depuis L6. La formule ne certifie pas l’acquisition séparée de 高兴 ou 见到. La permission d’entrer (`我可以进来吗？`) et l’annonce de sa propre place (`我坐这里。`) ne sont pas confondues avec une invitation ou un ordre adressé à l’hôte.
- L1 compréhension : les mots sont explicitement nommés dans les nouvelles demandes de découpage, d’écriture et de sens. Les formules attestées de répétition, d’incompréhension et de remerciement restent entières.
- L2 douleur : l’appel du médecin répond à une offre explicite. `叫医生` est un impératif direct compatible avec une situation urgente ; son réemploi n’ajoute ni oui ni marque de politesse dans la source. Aucun diagnostic n’est enseigné.
- L2 gare : le tour reçu donne une indication réelle (`火车站就在前面。`) avant de demander si la personne marche. La réponse confirme bien le mode de déplacement, pas une permission.
- L3 compte : le code de vérification est annoncé comme envoyé avant la vérification de l’accès. La connexion à un compte n’est pas assimilée à la connexion à un réseau. Le mot de passe est explicitement nommé dans sa source entière.
- L3 sport : `我经常运动。` en première position et `我每天锻炼` en confirmation sont deux sources distinctes ; la seconde donne une fréquence quotidienne à la question sur la régularité. Aucune nouvelle phrase n’est fabriquée en ajoutant seulement oui.
- L4 appareil : l’accueil annonce une réparation effectuée avant de vérifier le fonctionnement ; la dernière source raconte un résultat réel sur le sommeil (`我睡得很好。`). Elle n’est pas réécrite pour contenir une réparation ou un remerciement absent.
- L5 rendez-vous : le vendredi à dix-huit heures est explicitement accepté, puis `那就这么定了` confirme cet accord. Son texte source ne reçoit aucune fausse date. Les sources de rendez-vous (`预约`) et de réservation (`预订`) ne sont pas interchangeables.
- L8/L9 : le complément a été relu indépendamment par l’agent français sinophone. Les options de réparation, conditions, limites et objections sont formulées entières. Une concession reconnaît l’avantage réel de l’autre formule sans abandonner sa recommandation ; la question et l’objection reçues ciblent les réponses préparées.

Quatorze premières rencontres de phrases et huit de soutiens issus de sources plus tardives portent une `introductionDecision` motivée. Il s’agit de choix éditoriaux, sans changement du niveau source et sans prétention d’acquisition. Aucun des 700 canoniques protégés n’est déplacé.

## Recherche et conservation

Le fichier `extension-fr-zh-recherche.json` conserve les requêtes de forme et de sens, les sources exactes retenues et les trois voisins de recherche par entrée. Le rapprochement porte sur **4 903 cartes**, **1 279 objets typés conversation** (dont 704 variantes et tours entiers utilisables comme phrases), les **80 positions chinoises précédentes** et les **15 mots chinois du lot lexical rédigé**. La ponctuation et les espaces sont ignorés pour chercher ; les champs livrés sont copiés entiers. Les objets incomplets et les mots isolés n’acquièrent jamais le statut de phrase par changement de contexte.

Contrôle indépendant final : **68 références, 272 champs textuels identiques aux sources, zéro écart** ; 18 × 8 formes distinctes ; 37 ancrages conformes ; deux soutiens autonomes par module ; zéro doublon exact de source pour les 149 formes nouvelles. Ce contrôle ne prouve ni une absence sémantique universelle ni la maîtrise de l’apprenant. Les 37 échanges ont aussi été relus pour leur rôle, acte, objet et clôture par le planificateur.

Dix affectations lexicales manifestement erronées, hors des canoniques protégés, ont été corrigées explicitement dans la partition et son générateur : mot de passe, écran et signal vers Travail/études/numérique ; enseignant vers Travail/études ; portefeuille vers Voyage ; avis, relation, point de vue et argument vers Personnes/relations ; dimensions vers Repères/mesures. Chaque indice conserve son tuple et son niveau source exacts. Les comptes de types restent inchangés (4 903 cartes).

Aucun catalogue, tarif, abonnement, droit gratuit, fichier d’application ou exécution de production n’est modifié par ce dossier. La responsabilité du classement et de la progression est Codex ; Claude relit les aides phonétiques nouvelles.

## Empreintes au gel

- `plan.json` : `d2ce2e8d9476756ee7e6651a3103b449ee89625ec1065c4fdf6f83382010a379`.
- `extension-fr-zh.json` : `07b5c5822a81920048e4ab0b4fd7755a647566acd21a36c9374804b8b7d93be0`.
- `extension-fr-zh-recherche.json` : `81bf3f8cd158204a70ccea9ecbde9d80b27029fff5b6c368870fccd9825454bf`.
- `fr-zh.json` : `9ec01a94f8d1a7e27e1c1737485ba75f306b0a5cb31d04e83726261527d48519`.
- `fr-zh-recherche.json` : `10a1ec516fb991481c37877b6f9aba0fea3e8f8099c740fe8b9777c6db980600`.
