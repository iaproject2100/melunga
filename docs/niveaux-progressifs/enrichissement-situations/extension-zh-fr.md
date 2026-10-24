# Dix-huit pistes supplémentaires — français pour sinophones

144 intentions de production : **41 réemplois entiers** (38 catalogue, 3 conversation) et **103 phrases rédigées**. Les **37 répliques reçues** comprennent 8 copies catalogue et 29 rédactions ; les **36 soutiens lexicaux** comprennent 28 copies catalogue, 1 slot conversation entier et 7 mots nouveaux. Les 139 nouvelles aides sont des brouillons entiers en caractères chinois, en attente de Claude ; aucune ancienne aide n’est modifiée.

Les 80 anciennes entrées, leurs 59 aides rédigées et le fichier ancien complet restent byte à byte identiques. Ce dossier ne modifie ni catalogue, ni niveau source, ni prix, ni droit d’accès. La progression éditoriale est une décision Codex ; Claude relit uniquement les aides phonétiques nouvelles.

## Recherche et décisions

Recherche effective : 4 500 cartes françaises, 723 variantes/tours, 724 lignes de banque ancienne (qui doublonnent largement les conversations) et les 80 anciens candidats. Le détail des 144 requêtes, leurs correspondances proches et chaque décision est dans `extension-pistes/zh-fr-recherche.json`. Ces totaux sont des lignes consultées, pas des formes uniques.

- `Je peux m’asseoir ?` n’est pas un besoin de repos : `J’ai besoin de m’asseoir` est rédigé entier.
- Les ordres `Tournez à droite ici` ne vérifient pas un itinéraire : la question de vérification est rédigée entière.
- Une permission de recharge, un accord `Ça marche !` et une demande d’existence du Wi-Fi ne remplacent pas un besoin, un fonctionnement technique ou la recherche d’un réseau.
- `Votre image est figée` est repris pour l’image de l’interlocuteur visible à l’écran, sans changer votre en mon.
- Une demande de rendez-vous n’est pas une demande de le décaler : la nouvelle phrase `Je dois déplacer mon rendez-vous` garde le référent masculin du pronom le en03.
- Demander un remboursement n’explique pas pourquoi une proposition partielle est insuffisante : l’objection est rédigée entière.
- Les mots complets `le plan` et `la taille` ont des sens précis : ici 地图 est bien une carte, alors que 腰 n’est pas le尺码 vestimentaire. Aucune aide ne provient d’un morceau de phrase.

## Préparation et progression

Deux modules L1 : formules pratiques et secours à la compréhension ; L2 : choix et demandes simples ; L3 : goûts, récupération de compte, aide de cours et habitudes ; L4 : courts récits terminés ; L5 : modification et dépannage en plusieurs étapes ; L8 : tact, condition et limites ; L9 : deux critères, concession et réponse à une objection sur des formats de cours. Les références à des sources historiquement plus tardives portent des décisions d’introduction explicites. La préparation prévue ne constitue pas une preuve d’acquisition.

Les soutiens lexicaux restent des mots autonomes dans leur famille, hors des étapes de phrase. Les reçus gardent `analyse:false`, leur rôle et leurs `answerWith` ; ils ne gonflent pas les huit productions du module. La question survient après préparation des réponses ; la clôture ne demande aucune production.

## Productions par module

### L1 — Première visite : entrer et prendre congé

8 intentions ; 7 réemplois et 1 rédactions.

| Intention | Phrase entière | Provenance |
| --- | --- | --- |
| piste-visite-proches-01 | Bonjour ! | DECKS.fr[272] |
| piste-visite-proches-02 | Merci de votre accueil. | DECKS.fr[1010] |
| piste-visite-proches-03 | Je peux entrer ? | DECKS.fr[562] |
| piste-visite-proches-04 | Je suis trop content de te voir ! | DECKS.fr[1840] |
| piste-visite-proches-05 | Je m'assois ici. | rédaction entière |
| piste-visite-proches-06 | Je voudrais un verre d'eau. | DECKS.fr[1313] |
| piste-visite-proches-07 | Je vais partir maintenant. | DECKS.fr[751] |
| piste-visite-proches-08 | Merci, à bientôt ! | L10-zh-fr.json /dialogues/0/turns/9 |

Soutiens : **ma famille**, **mon ami**.

### L1 — Comprendre : faire ralentir et répéter

8 intentions ; 6 réemplois et 2 rédactions.

| Intention | Phrase entière | Provenance |
| --- | --- | --- |
| piste-ralentir-repeter-01 | Je ne comprends pas. | DECKS.fr[1040] |
| piste-ralentir-repeter-02 | Vous pouvez parler plus lentement ? | DECKS.fr[1293] |
| piste-ralentir-repeter-03 | Vous pouvez répéter ? | DECKS.fr[912] |
| piste-ralentir-repeter-04 | Un mot à la fois, s'il vous plaît. | rédaction entière |
| piste-ralentir-repeter-05 | Pouvez-vous écrire ça ? | DECKS.fr[1128] |
| piste-ralentir-repeter-06 | Ça veut dire quoi ? | DECKS.fr[804] |
| piste-ralentir-repeter-07 | J'ai compris. | DECKS.fr[411] |
| piste-ralentir-repeter-08 | Merci, maintenant je comprends. | rédaction entière |

Soutiens : **le mot**, **lentement**.

### L2 — Vêtements : choisir la bonne taille

8 intentions ; 4 réemplois et 4 rédactions.

| Intention | Phrase entière | Provenance |
| --- | --- | --- |
| piste-vetement-taille-01 | Je cherche une chemise. | rédaction entière |
| piste-vetement-taille-02 | Je peux l'essayer ? | DECKS.fr[915] |
| piste-vetement-taille-03 | C'est trop grand. | DECKS.fr[57] |
| piste-vetement-taille-04 | C'est trop petit. | DECKS.fr[60] |
| piste-vetement-taille-05 | Vous avez une taille au-dessus ? | DECKS.fr[1674] |
| piste-vetement-taille-06 | Les manches sont trop longues. | rédaction entière |
| piste-vetement-taille-07 | Cette longueur me va. | rédaction entière |
| piste-vetement-taille-08 | Je garde cette taille. | rédaction entière |

Soutiens : **la chemise**, **le pantalon**.

### L2 — Santé : décrire une douleur simple

8 intentions ; 5 réemplois et 3 rédactions.

| Intention | Phrase entière | Provenance |
| --- | --- | --- |
| piste-douleur-simple-01 | J'ai mal au ventre. | DECKS.fr[600] |
| piste-douleur-simple-02 | J'ai mal ici. | DECKS.fr[47] |
| piste-douleur-simple-03 | J'ai mal depuis ce matin. | rédaction entière |
| piste-douleur-simple-04 | J'ai mal à la tête. | DECKS.fr[673] |
| piste-douleur-simple-05 | Je ne me sens pas bien. | DECKS.fr[985] |
| piste-douleur-simple-06 | J'ai besoin de m'asseoir. | rédaction entière |
| piste-douleur-simple-07 | Appelez un médecin. | DECKS.fr[625] |
| piste-douleur-simple-08 | Merci de rester avec moi. | rédaction entière |

Soutiens : **le ventre**, **un médecin**.

### L2 — En ville : trouver la gare

8 intentions ; 2 réemplois et 6 rédactions.

| Intention | Phrase entière | Provenance |
| --- | --- | --- |
| piste-trouver-gare-01 | Où est la gare ? | DECKS.fr[483] |
| piste-trouver-gare-02 | Est-ce que c'est loin d'ici ? | DECKS.fr[1126] |
| piste-trouver-gare-03 | Je n'ai pas de plan. | rédaction entière |
| piste-trouver-gare-04 | Pouvez-vous me montrer le chemin ? | rédaction entière |
| piste-trouver-gare-05 | Je tourne à droite ici ? | rédaction entière |
| piste-trouver-gare-06 | C'est à côté de ce bâtiment ? | rédaction entière |
| piste-trouver-gare-07 | Oui, j'y vais à pied. | rédaction entière |
| piste-trouver-gare-08 | Merci, je vois la gare maintenant. | rédaction entière |

Soutiens : **la gare**, **le plan**.

### L2 — Café : préciser une boisson

8 intentions ; 3 réemplois et 5 rédactions.

| Intention | Phrase entière | Provenance |
| --- | --- | --- |
| piste-boisson-precise-01 | Je voudrais un café. | DECKS.fr[467] |
| piste-boisson-precise-02 | Je voudrais ce café chaud. | rédaction entière |
| piste-boisson-precise-03 | Je prends une petite tasse. | rédaction entière |
| piste-boisson-precise-04 | Sans sucre, s'il vous plaît. | rédaction entière |
| piste-boisson-precise-05 | Je vais le boire ici. | rédaction entière |
| piste-boisson-precise-06 | Je préfère le thé. | DECKS.fr[1119] |
| piste-boisson-precise-07 | Oui, je prends le thé sans sucre. | rédaction entière |
| piste-boisson-precise-08 | Ça me va. | DECKS.fr[78] |

Soutiens : **le café**, **le thé**.

### L3 — Loisirs : goûts et préférences

8 intentions ; 2 réemplois et 6 rédactions.

| Intention | Phrase entière | Provenance |
| --- | --- | --- |
| piste-gouts-activites-01 | J'aime lire le soir. | DECKS.fr[1404] |
| piste-gouts-activites-02 | Je préfère les films aux séries. | rédaction entière |
| piste-gouts-activites-03 | Je n'aime pas les jeux trop bruyants. | rédaction entière |
| piste-gouts-activites-04 | La musique calme m'aide à me détendre. | rédaction entière |
| piste-gouts-activites-05 | Je regarde souvent des comédies. | rédaction entière |
| piste-gouts-activites-06 | Je préfère rester à la maison. | DECKS.fr[1682] |
| piste-gouts-activites-07 | Oui, je préfère une activité calme. | rédaction entière |
| piste-gouts-activites-08 | On aime les mêmes films. | rédaction entière |

Soutiens : **la musique**, **un livre**.

### L3 — Compte : retrouver son accès

8 intentions ; 2 réemplois et 6 rédactions.

| Intention | Phrase entière | Provenance |
| --- | --- | --- |
| piste-recuperer-compte-01 | Je n'arrive pas à me connecter. | DECKS.fr[1688] |
| piste-recuperer-compte-02 | J'ai oublié mon mot de passe. | DECKS.fr[1703] |
| piste-recuperer-compte-03 | J'utilise cette adresse e-mail pour ce compte. | rédaction entière |
| piste-recuperer-compte-04 | Je ne reçois pas le code de connexion. | rédaction entière |
| piste-recuperer-compte-05 | Je voudrais recevoir un nouveau code. | rédaction entière |
| piste-recuperer-compte-06 | Je peux ouvrir le lien sur mon téléphone. | rédaction entière |
| piste-recuperer-compte-07 | Oui, je peux me connecter maintenant. | rédaction entière |
| piste-recuperer-compte-08 | Je vais fermer cette session sur cet appareil. | rédaction entière |

Soutiens : **le compte**, **le mot de passe**.

### L3 — Cours : demander une aide précise

8 intentions ; 1 réemplois et 7 rédactions.

| Intention | Phrase entière | Provenance |
| --- | --- | --- |
| piste-cours-aide-01 | Je suis le cours du soir. | rédaction entière |
| piste-cours-aide-02 | Je prépare l'examen de vendredi. | rédaction entière |
| piste-cours-aide-03 | Je ne comprends pas les indications. | DECKS.fr[2192] |
| piste-cours-aide-04 | Pouvez-vous me montrer un exemple ? | rédaction entière |
| piste-cours-aide-05 | Je voudrais vérifier ma réponse. | rédaction entière |
| piste-cours-aide-06 | Je peux refaire cet exercice. | rédaction entière |
| piste-cours-aide-07 | Je voudrais revoir cette étape. | rédaction entière |
| piste-cours-aide-08 | Merci, je sais comment commencer maintenant. | rédaction entière |

Soutiens : **le cours**, **un cahier**.

### L3 — Sport : parler de ses habitudes

8 intentions ; 4 réemplois et 4 rédactions.

| Intention | Phrase entière | Provenance |
| --- | --- | --- |
| piste-sport-habitudes-01 | Je fais du sport souvent. | L4-zh-fr.json /units/7/variants/1 |
| piste-sport-habitudes-02 | Je cours tous les matins. | DECKS.fr[1534] |
| piste-sport-habitudes-03 | Je fais du vélo le week-end. | DECKS.fr[2263] |
| piste-sport-habitudes-04 | Je m'entraîne pendant une demi-heure. | rédaction entière |
| piste-sport-habitudes-05 | Je m'échauffe avant de commencer. | rédaction entière |
| piste-sport-habitudes-06 | Je me repose entre les exercices. | rédaction entière |
| piste-sport-habitudes-07 | Je m'entraîne tous les jours. | DECKS.fr[1517] |
| piste-sport-habitudes-08 | Je vais garder ce rythme la semaine prochaine. | rédaction entière |

Soutiens : **la course**, **le tennis**.

### L4 — Objets : raconter une perte et se faire aider

8 intentions ; 1 réemplois et 7 rédactions.

| Intention | Phrase entière | Provenance |
| --- | --- | --- |
| piste-incident-objet-01 | J'ai perdu mon téléphone. | DECKS.fr[434] |
| piste-incident-objet-02 | Je l'ai utilisé près de l'entrée. | rédaction entière |
| piste-incident-objet-03 | Je l'ai posé sur cette table. | rédaction entière |
| piste-incident-objet-04 | Mon sac était ouvert. | rédaction entière |
| piste-incident-objet-05 | J'ai regardé sous la chaise. | rédaction entière |
| piste-incident-objet-06 | Je n'ai rien trouvé. | rédaction entière |
| piste-incident-objet-07 | Oui, c'est bien mon téléphone. | rédaction entière |
| piste-incident-objet-08 | Merci, je vais le garder avec moi. | rédaction entière |

Soutiens : **le sac**, **les clés**.

### L4 — Culture : raconter une sortie

8 intentions ; 1 réemplois et 7 rédactions.

| Intention | Phrase entière | Provenance |
| --- | --- | --- |
| piste-sortie-culturelle-01 | Je suis allé au cinéma. | L5-zh-fr.json /units/1/variants/0 |
| piste-sortie-culturelle-02 | J'ai vu un film avec des amis. | rédaction entière |
| piste-sortie-culturelle-03 | La salle était presque vide. | rédaction entière |
| piste-sortie-culturelle-04 | Le film a commencé en retard. | rédaction entière |
| piste-sortie-culturelle-05 | J'ai aimé la musique. | rédaction entière |
| piste-sortie-culturelle-06 | La fin m'a surpris. | rédaction entière |
| piste-sortie-culturelle-07 | Oui, j'ai passé une bonne soirée. | rédaction entière |
| piste-sortie-culturelle-08 | J'ai conseillé ce film à ma sœur. | rédaction entière |

Soutiens : **un film**, **le billet d'entrée**.

### L4 — Logement : raconter une panne d’équipement

8 intentions ; 0 réemplois et 8 rédactions.

| Intention | Phrase entière | Provenance |
| --- | --- | --- |
| piste-equipement-chambre-01 | La lumière s'est éteinte hier soir. | rédaction entière |
| piste-equipement-chambre-02 | La climatisation ne marchait pas. | rédaction entière |
| piste-equipement-chambre-03 | La chambre était trop chaude. | rédaction entière |
| piste-equipement-chambre-04 | J'ai essayé le bouton de la télécommande. | rédaction entière |
| piste-equipement-chambre-05 | L'appareil n'a pas redémarré. | rédaction entière |
| piste-equipement-chambre-06 | J'ai signalé le problème à l'accueil. | rédaction entière |
| piste-equipement-chambre-07 | Oui, l'appareil fonctionne maintenant. | rédaction entière |
| piste-equipement-chambre-08 | Merci, j'ai pu dormir normalement. | rédaction entière |

Soutiens : **la climatisation**, **le chauffage**.

### L5 — Rendez-vous : déplacer une réservation

8 intentions ; 0 réemplois et 8 rédactions.

| Intention | Phrase entière | Provenance |
| --- | --- | --- |
| piste-modifier-rendezvous-01 | Je dois déplacer mon rendez-vous. | rédaction entière |
| piste-modifier-rendezvous-02 | Je ne suis pas disponible à l'heure prévue. | rédaction entière |
| piste-modifier-rendezvous-03 | Je voudrais le reporter à vendredi. | rédaction entière |
| piste-modifier-rendezvous-04 | Le matin ne me convient pas. | rédaction entière |
| piste-modifier-rendezvous-05 | Je suis libre après dix-sept heures. | rédaction entière |
| piste-modifier-rendezvous-06 | Est-ce qu'un créneau plus tard est possible ? | rédaction entière |
| piste-modifier-rendezvous-07 | Oui, vendredi à dix-huit heures me convient. | rédaction entière |
| piste-modifier-rendezvous-08 | Je confirme le nouveau rendez-vous. | rédaction entière |

Soutiens : **un rendez-vous**, **les horaires**.

### L5 — Connexion : résoudre un problème numérique

8 intentions ; 1 réemplois et 7 rédactions.

| Intention | Phrase entière | Provenance |
| --- | --- | --- |
| piste-depannage-connexion-01 | La connexion se coupe pendant l'appel. | rédaction entière |
| piste-depannage-connexion-02 | Votre image est figée. | DECKS.fr[1966] |
| piste-depannage-connexion-03 | Je vous entends, mais vous ne m'entendez pas. | rédaction entière |
| piste-depannage-connexion-04 | J'ai déjà fermé puis rouvert l'application. | rédaction entière |
| piste-depannage-connexion-05 | Le problème continue sur cet autre réseau. | rédaction entière |
| piste-depannage-connexion-06 | Je peux refaire un essai avec vous. | rédaction entière |
| piste-depannage-connexion-07 | Oui, le son est clair maintenant. | rédaction entière |
| piste-depannage-connexion-08 | L'image reste stable pendant l'appel. | rédaction entière |

Soutiens : **l'écran**, **la connexion**.

### L8 — Réclamation : négocier avec tact

8 intentions ; 1 réemplois et 7 rédactions.

| Intention | Phrase entière | Provenance |
| --- | --- | --- |
| piste-reclamation-tact-01 | Je comprends vos contraintes, mais le défaut reste visible. | rédaction entière |
| piste-reclamation-tact-02 | Je souhaite trouver une solution sans compliquer la situation. | rédaction entière |
| piste-reclamation-tact-03 | Serait-il envisageable de remplacer seulement les pièces concernées ? | rédaction entière |
| piste-reclamation-tact-04 | Un remboursement partiel ne suffirait pas à régler le problème. | rédaction entière |
| piste-reclamation-tact-05 | Je peux vous transmettre le reçu et les photos. | rédaction entière |
| piste-reclamation-tact-06 | Je préfère un accord précis sur le délai. | rédaction entière |
| piste-reclamation-tact-07 | Oui, cette solution peut me convenir si le remplacement est confirmé. | rédaction entière |
| piste-reclamation-tact-08 | Pouvez-vous me confirmer par écrit ? | DECKS.fr[2356] |

Soutiens : **un défaut**, **un remboursement**.

### L8 — Proches : préserver la relation en posant une limite

8 intentions ; 1 réemplois et 7 rédactions.

| Intention | Phrase entière | Provenance |
| --- | --- | --- |
| piste-limites-relationnelles-01 | Je sais que votre intention est de m'aider. | rédaction entière |
| piste-limites-relationnelles-02 | Je préfère garder ce sujet pour moi. | rédaction entière |
| piste-limites-relationnelles-03 | Je ne suis pas à l'aise avec cette question. | rédaction entière |
| piste-limites-relationnelles-04 | Nous pouvons en parler sans entrer dans les détails. | rédaction entière |
| piste-limites-relationnelles-05 | Je comprends votre avis sans le partager entièrement. | rédaction entière |
| piste-limites-relationnelles-06 | J'aimerais que nous respections ce choix. | rédaction entière |
| piste-limites-relationnelles-07 | Oui, je préfère qu'on change de sujet pour le moment. | rédaction entière |
| piste-limites-relationnelles-08 | Merci de comprendre. | DECKS.fr[495] |

Soutiens : **une invitation**, **une limite**.

### L9 — Débat : répondre à une objection

8 intentions ; 0 réemplois et 8 rédactions.

| Intention | Phrase entière | Provenance |
| --- | --- | --- |
| piste-repondre-objection-01 | Nous cherchons une formule qui permette à chacun de progresser. | rédaction entière |
| piste-repondre-objection-02 | Le prix compte, mais le temps de parole compte aussi. | rédaction entière |
| piste-repondre-objection-03 | Je recommande le petit groupe, car les échanges entre élèves sont utiles. | rédaction entière |
| piste-repondre-objection-04 | Je reconnais qu'un cours individuel offre plus de temps de parole à chaque élève. | rédaction entière |
| piste-repondre-objection-05 | Ce critère ne suffit pas, à lui seul, pour choisir. | rédaction entière |
| piste-repondre-objection-06 | Il faut aussi tenir compte de la diversité des échanges. | rédaction entière |
| piste-repondre-objection-07 | Nous pouvons comparer les deux formats avec les mêmes objectifs. | rédaction entière |
| piste-repondre-objection-08 | C'est une vraie limite, mais un petit groupe peut garder assez de temps de parole. | rédaction entière |

Soutiens : **un argument**, **une objection**.

## Reçus et contrôle

37 reçus ; 18 questions, 1 objection et 18 clôtures. Chaque réponse ciblée est une des 144 intentions préparées du même module. Les huit copies sources sont contrôlées avec leur sens exact. Les rôles appartiennent à l’usage, jamais au modèle canonique.

Contrôles : 144/144 intentions uniques ; 37/37 reçus ; 36 soutiens ; 234 champs de source recopiés sans écart ; 0 collision de forme normalisée parmi les 139 rédactions ; 0 ancien objet modifié ; empreinte du plan étendu vérifiée. Les trois tours/variantes importés pointent vers des parents complets copiés sans modification.

## Correction séparée du mot « plan »

`catalogue:fr:2969` n’appartient pas aux 700 canoniques protégés. La précédente annotation attribuait à tort 计划 à cette carte ; la source réelle porte `cn: 地图` et `en: the map`. Son classement éditorial est donc corrigé de Travail vers Voyage, avec aucun changement du texte, du sens, de l’aide ni de `lv`. Les comptes de types restent strictement identiques. Cela ne constitue pas une relecture des autres placements.

## Limites

Les nouvelles aides en caractères chinois ne sont pas validées phonétiquement. Les formulations, contraintes et progressions ont été relues éditorialement par Codex ; aucun gain d’acquisition ni efficacité comparative n’est revendiqué. Aucune fusion ni publication n’est effectuée par ce lot.


Le contrôle indépendant de tous les objets de conversation a retrouvé **la gare** dans le slot entier `/units/4/variants/0/slot` du parent L1. Ses champs complets sont désormais copiés ; sa phonétique n’est plus une rédaction nouvelle. Les 1 334 objets du parcours source incluent ces slots, contrairement aux seules 723 variantes/tours de la première recherche.


Après relecture éditoriale croisée, `rendez-vous` est conservé en01 pour que `le reporter` en03 ait le même référent masculin. Dix familles de soutiens catalogue sont corrigées séparément (voir corrections-themes/zh-fr.json) ; les mots nouveaux limite et remboursement sont respectivement classés Personnes et Restaurant/achats. Aucun champ source ni niveau source ne change.


Le reçu du passant dans Trouver la gare donne maintenant une vraie direction avant sa question : **La gare est tout droit. Vous y allez à pied ?** Sens et aide en caractères chinois sont rédigés en entier, pending-Claude. Le reçu garde definitionId, answerWith07 et son ancre ; ni le plan gelé ni les aides existantes ne changent. Le total reste139 nouvelles aides, puisque cette rédaction remplace une autre rédaction du même reçu.


Deux solutions sont maintenant dites explicitement dans le reçu : **Je vous ai envoyé un nouveau code. Pouvez-vous vous connecter ?** et **Nous avons réparé l’appareil. Il fonctionne maintenant ?** Les trois champs sont rédigés en entier, pending-Claude ; les IDs, réponses et ancres restent ceux du plan gelé. Elles remplacent deux rédactions du même lot, sans modifier le total139 ni les aides existantes.
