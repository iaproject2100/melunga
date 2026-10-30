# Compléter les langues de l’application Melunga

Branche de travail : `feat/interface-russe-portugais`. L’intégration des quatre langues n’est pas encore activée.

## Fichiers à lire

- [État de l’intégration et validations](README.md)
- [Significations à compléter](significations-a-completer.json) : 29 077 concepts, références anglaises/françaises, identifiants et références aux banques existantes.
- [Accueil, compte, commandes et navigation préparés](../../tools/maquette-guidee/imports/native-interface-copy-v1.json)
- Interfaces de cours déjà préparées : [russe](../../melunga_deploy/content/course-locales/ru.json), [portugais du Brésil](../../melunga_deploy/content/course-locales/pt.json), [arabe](../../melunga_deploy/content/course-locales/ar.json), [hindi](../../melunga_deploy/content/course-locales/hi.json).

## Travail demandé à Claude

Complète les champs `ru`, `pt`, `ar` et `hi` de chaque concept dans `significations-a-completer.json`. Il s’agit des significations des leçons dans la langue de l’utilisateur, pour que ces quatre langues puissent être choisies comme langues de l’application avec les mêmes fonctions.

Utilise les références `en`, `frm` et les cartes indiquées dans `sources` pour respecter le sens, le contexte, le registre et le locuteur. Les valeurs `ruCandidate`, `ptCandidate`, `arCandidate`, `hiCandidate` ou les listes de candidats sont des pistes à vérifier ; leur présence ne constitue pas une validation. Portugais du Brésil, arabe standard moderne usuel.

Conserve les identifiants, les références, toutes les autres valeurs et la structure. Ne modifie aucune carte étudiée, aucun champ `t`/`lv`/`cat`, aucune phonétique, aucun thème, aucun ordre ni l’architecture de l’application. N’ajoute aucune traduction automatique non vérifiée. Signale séparément les ambiguïtés qui nécessitent une décision.

Renvoie le JSON complété et un bref rapport des ambiguïtés et contrôles. Si nécessaire, livre par lots d’identifiants consécutifs en indiquant précisément la couverture ; aucun lot partiel ne doit être annoncé comme complet. Codex fera ensuite l’intégration, les contrôles de couverture, les tests mobile/ordinateur et la publication.

## Lecture sans téléchargement depuis le chat

Tous les fichiers ci-dessus sont dans cette branche GitHub. Le bouton « Raw » du fichier JSON permet de récupérer son contenu si GitHub refuse l’aperçu en raison de sa taille. Claude peut aussi récupérer la branche avec Git et lire les fichiers localement.
