# Dix situations supplémentaires — plan et intégration

## Lot intégré à l’aperçu

Les dix situations sont maintenant intégrées au bundle de travail : **454 phrases rédigées**, **79 cartes catalogue réemployées** et **27 anciennes phrases de conversation importées entières**, soit 560 positions. Les 106 sources existantes ne sont jamais annoncées comme une rédaction nouvelle. Les 70 rubriques (dix par couple) jouent chacune huit intentions dans l’ordre du plan.

| Couple | Phrases rédigées | Sources réemployées |
|---|---:|---:|
| fr-en | 66 | 14 |
| fr-es | 64 | 16 |
| fr-it | 66 | 14 |
| fr-zh | 55 | 25 |
| fr-ja | 72 | 8 |
| fr-ko | 72 | 8 |
| zh-fr | 59 | 21 |

Le bilan canonique de l’aperçu passe à **32 779 entrées**, dont 32 115 cartes historiques conservées. Ce total inclut aussi le premier lot de140entrées lexicales/numériques et70phrases anciennes de conversation reprises sur les deux lots. Les31réemplois contextuels sont des références, pas31cartes supplémentaires.

Les nouvelles aides entières sont dans [le tableau pour Claude](nouvelles-phrases-a-relire.md). Elles restent `pending-Claude`. Les anciennes phonétiques ne sont pas modifiées. [Le compte rendu général](../README.md) donne les tests et leurs limites.

Le plan gelé contient **10 thèmes de 8 intentions**, soit **80 objectifs de parole**. Deux thèmes sont proposés à chaque niveau L2–L6. Les huit intentions d’un thème restent au même niveau et forment un bloc cohérent : entrer dans la situation, préciser, ajuster puis résoudre ou conclure. Elles ne sont pas dispersées dans des rubriques à une ou deux cartes.

Les références françaises décrivent les sens à couvrir ; elles ne sont ni des phonétiques ni une obligation de traduction littérale. Chaque langue peut employer une construction naturelle différente pour le même acte. La recherche porte d’abord sur des phrases entières existantes.

| Niveau | Thème / identifiant | Aboutissement |
| --- | --- | --- |
| L2 | Repas : préférences et alternatives — `repas-preferences` | Adapter un repas à un besoin précis, puis choisir une alternative qui convient. |
| L2 | Numérique : accéder et rester en contact — `numerique-quotidien` | Accéder à un appareil ou à une connexion et confirmer un échange numérique simple. |
| L3 | Hôtel : organiser son séjour — `hotel-sejour` | Annoncer son séjour, préciser ses besoins et organiser son départ. |
| L3 | Loisirs : choisir et organiser une sortie — `loisirs-sorties` | Passer d’une envie de sortie à un projet concret partagé. |
| L4 | Transport : raconter un imprévu et repartir — `transport-imprevus` | Rapporter un incident simple, obtenir l’information utile et reprendre son trajet. |
| L4 | Études : raconter un apprentissage réussi — `etudes-apprentissage` | Rapporter une difficulté, un nouvel essai et un résultat observable. |
| L5 | Paiements : vérifier un problème et le régler — `argent-paiements` | Décrire un problème de paiement, demander une vérification et confirmer une solution. |
| L5 | Service client : obtenir et suivre une solution — `service-client` | Décrire un problème matériel précis, convenir d’une réponse et suivre sa réalisation. |
| L6 | Invitations : poser une limite et expliquer son choix — `invitations-limites` | Prendre en compte une invitation, expliquer une contrainte et aboutir à un accord respectueux. |
| L6 | Sortie nature : choisir des gestes écologiques utiles — `nature-gestes` | Comparer des choix concrets puis expliquer un geste qui protège les lieux sans compliquer la sortie. |

## Ce que les chiffres signifient

- **32 115** désigne le catalogue historique ; ce nombre ne mesure pas la préparation d’une conversation.
- **80** désigne les intentions sémantiques de ce lot, pas 80 nouvelles phrases déjà absentes de chaque langue.
- **560** désigne les positions à vérifier sur les sept couples. Chaque position doit être classée comme réemploi, introduction éditoriale d’une source future ou vraie rédaction.
- Un réemploi conserve son ID canonique et ne gonfle pas le nombre de nouvelles phrases. Une source introduite plus tôt reçoit une décision éditoriale, sans modification du `lv` historique.

## Idées officielles et adaptations originales

Treize pages officielles réellement consultées le 24 octobre 2026 sont indexées dans `plan.json` et détaillées dans `tracabilite-sources.json` : URL, titre, date, dossier de recherche et empreinte du HTML. Ce second fichier fournit la chaîne **URL → idée observée → adaptation originale → intentions concernées**. Il ne recopie pas des cours.

| Source publique | Idée observée | Utilisation Melunga |
| --- | --- | --- |
| [Babbel : méthode](https://www.babbel.com/the-babbel-method) et [Pimsleur : méthode](https://www.pimsleur.com/the-pimsleur-method/) | Situations et conversation, progression graduelle, nouvelles informations en quantité limitée. | Huit actes distincts reliés à un résultat ; une étape légère ne réduit pas le catalogue disponible. |
| [Babbel : espagnol](https://www.babbel.com/learn-spanish) | Repas, achats, maison, relations, loisirs, animaux et technologie/Internet dans les ressources publiques. | Angles alimentaires, numériques et de vie quotidienne ; les scénarios précis sont originaux. |
| [Busuu : anglais](https://www.busuu.com/fr/course/apprendre-anglais-en-ligne) et [chinois](https://www.busuu.com/fr/course/apprendre-chinois-en-ligne) | Parcours pratiques, voyage, affaires, examens ; certaines composantes diffèrent par langue. | Hôtel, déplacements, apprentissage et service, avec fonction commune et forme propre à chaque langue. |
| [Memrise : anglais](https://www.memrise.com/fr/apprendre-l-anglais/cours-anglais), [coréen](https://www.memrise.com/fr/apprendre-le-coreen/cours-coreen) et [accueil](https://www.memrise.com/fr/) | Scénarios autour des études, loisirs, relations et opinions ; objectifs personnels. | Sorties organisées, progrès dans l’étude et limites expliquées dans une invitation. |
| [Duolingo : méthode](https://blog.duolingo.com/duolingo-teaching-method/), [usages et niveaux](https://blog.duolingo.com/goldilocks-and-the-cefr-levels-which-proficiency-level-is-just-right/) et [voyage](https://blog.duolingo.com/french-phrases-for-travel/) | Difficulté graduelle, objectifs d’usage, demandes d’aide et déplacements. | L2 besoin, L3 projet, L4 récit court, L5 résolution, L6 raison ou comparaison. Aucune équivalence CECR Melunga n’en est déduite. |
| [Duolingo : chinois](https://blog.duolingo.com/improving-how-duolingo-teaches-chinese-and-other-languages/) et [Babbel : français](https://www.babbel.com/learn-french) | Écriture/son/sens et attention au registre ou aux formes de la langue. | Conservation des aides entières et adaptation linguistique ; aucune règle universelle de substitution. |

Les pages décrivent leurs propres offres : elles ne prouvent pas une efficacité comparée. Le thème écologique est une adaptation Melunga de besoins de sortie et de choix pratiques, pas la copie d’un cours écologique concurrent.

## Contrat pour les sept rédacteurs

Les IDs sont `{topicId}-01` à `-08`. Le thème cible est `L{level}-situation-{topicId}`, son visuel `situation-{topicId}`. Le plan donne l’intention, la référence française entière, le rôle, le contexte, les concepts prévus et l’objectif de chaque acte.

Les paramètres éventuels se limitent à **un élément borné**. Une quantité avec son unité, un groupe nominal avec son article ou une locution entière ne sont pas découpés. Un seul paramètre ne prouve pas une invariance grammaticale : accords, particules et registres se vérifient dans chaque langue. Aucune phrase ni aide ne doit être assemblée par collage.

Les prérequis sont une préparation à relier à des sources, pas une mesure de ce que la personne a acquis. Ils restent des métadonnées de travail ; aucune longue consigne pédagogique ne doit s’ajouter aux cartes de l’interface.

Une phrase déjà introduite avant ou au niveau du thème est contextualisée par référence. Une source future peut être introduite ici par décision motivée. En l’absence d’équivalent complet, l’entrée nouvelle entière est rédigée et signalée séparément, avec son aide phonétique complète. Deux intentions reliées à la même phrase ne deviennent pas deux cartes nouvelles.

Codex assure sens, naturel, registre, progression, pertinence, couverture et nouveauté. **Claude vérifie uniquement la phonétique.** Ce document ne bloque pas le travail par une exigence de relecture native ou de justificatif nominatif.

Le générateur intègre ces registres à l’aperçu de travail avec ses contrôles de source, d’ordre et de comptage. Les cartes classiques et leurs niveaux d’accès, les prix, abonnements et comptes restent inchangés. Ce lot ne publie rien sur melunga.com.

Empreinte du plan gelé : `01a6ddae871e0df8dcf27bfbbae254565c4fb3d55b767f4b75219ce991473604`.
