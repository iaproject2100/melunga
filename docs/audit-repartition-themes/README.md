# Déséquilibre des rubriques — diagnostic

Audit du 30 octobre 2026. **Aucune carte déplacée ni correction publiée par cet audit.**

## Niveau 6 : comparaison des captures

| Langue | Comparer et justifier | Donner son avis et relancer | Besoin professionnel |
|---|---:|---:|---:|
| Hindi | 9 | 208 | 11 |
| Portugais (Brésil) | 11 | 202 | 12 |
| Russe | 10 | 211 | 10 |
| Arabe | 5 | 268 | 18 |
| Allemand | 32 | 45 | 24 |
| Coréen | 7 | 144 | 49 |
| Chinois | 9 | 119 | 30 |

## Ce qui est confirmé

Les comptes des captures sont reproduits dans les banques locales. Les 12 banques et leurs 10 niveaux couvrent les 54583 cartes une seule fois entre thèmes et réserve : cet inventaire ne trouve ni carte perdue ni duplication d’identité. Cela ne suffit pas à valider leur classement.

Des phrases de voyage, de famille et de démarches sont rangées dans le domaine générique `conversation`. Par exemple, la demande de guichet des bagages perdus est dans « Donner son avis » en hindi, russe et portugais. Le registre portugais reprend explicitement la même affectation hindi dans sa preuve de correspondance : une correspondance de traduction a propagé une mauvaise affectation thématique.

Les petites rubriques de vocabulaire à une ou deux entrées doivent être distinguées des situations complètes. Leur faible taille ne démontre pas à elle seule une erreur. Les proverbes et les relances de conversation restent légitimes dans une rubrique de conversation.

## Propositions vérifiées par lecture — pas encore appliquées

Les numéros sont les positions dans le deck, comptées à partir de 1 ; `sourceIndex` dans le JSON est compté à partir de 0.

| Langue | Carte | Phrase française | Destination proposée |
|---|---:|---|---|
| Hindi | 2891 | Où est le guichet des bagages perdus ? | `L6-deplacements` |
| Hindi | 2997 | Je rends souvent visite à maman. (homme) | `L6-quotidien` |
| Hindi | 2998 | Je rends souvent visite à maman. (femme) | `L6-quotidien` |
| Hindi | 3022 | Le document doit être certifié chez le notaire. | `L6-travail` |
| Hindi | 3036 | Je partage mon écran. (femme) | `L6-travail` |
| Hindi | 3070 | À cause des bouchons, je suis arrivé en retard. | `L6-deplacements` |
| Hindi | 3138 | Il faut changer la serrure. | `L6-quotidien` |
| Portugais (Brésil) | 2888 | Où est le guichet des bagages perdus ? | `L6-deplacements` |
| Portugais (Brésil) | 2993 | Je rends souvent visite à maman. | `L6-quotidien` |
| Portugais (Brésil) | 3016 | Le document doit être certifié chez le notaire. | `L6-travail` |
| Portugais (Brésil) | 3030 | Vous voyez mon écran ? | `L6-travail` |
| Portugais (Brésil) | 3059 | À cause des bouchons, je suis arrivé en retard. | `L6-deplacements` |
| Portugais (Brésil) | 3124 | Il faut changer la serrure. | `L6-quotidien` |
| Russe | 2890 | Où est le guichet des bagages perdus ? | `L6-deplacements` |
| Russe | 2977 | Je rends souvent visite à maman. | `L6-quotidien` |
| Russe | 3017 | Le document doit être certifié chez le notaire. | `L6-travail` |
| Russe | 3061 | À cause des bouchons, je suis arrivé en retard. (homme) | `L6-deplacements` |
| Russe | 3127 | Il faut changer la serrure. | `L6-quotidien` |

## Correction recommandée

1. Revoir le sens des phrases des rubriques très chargées dans toutes les langues, en commençant par L6 des quatre nouveaux decks. Les 18 propositions ci-dessus sont des exemples vérifiés, pas une reclassification exhaustive.
2. Réaffecter chaque phrase à son vrai domaine, en conservant son identité, ses 15 champs, son niveau et son ordre relatif dans le thème de destination. Conserver l’architecture, les images et les intitulés existants.
3. Examiner séparément les petites rubriques : enrichissement éditorial réel, regroupement cohérent à proposer, ou maintien lorsqu’elles servent une notion précise. Ne pas copier des phrases ni déplacer des phrases sans rapport pour atteindre un quota.
4. Maintenir le découpage des grosses rubriques en étapes de 30 à 40 cartes. Ce découpage facilite la pratique mais ne corrige pas une erreur de thème.
5. Avant publication : vérifier les identités, les comptes, l’accès aux cartes et les effets sur la progression sauvegardée et sur les étapes. Les captures allemandes, coréennes et chinoises justifient un examen aussi, mais cet audit ne leur attribue pas automatiquement les erreurs constatées en hindi.

Le détail des 120 inventaires et des propositions avec `t`, identités et empreintes des banques est dans [audit.json](audit.json).
