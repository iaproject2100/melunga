# Langue maternelle et entrée dans le parcours

Un élève anglophone qui choisit l’espagnol doit ouvrir `parcours-niveaux.html?pair=en-es&level=1`, avec des rubriques et un sens en anglais. La langue maternelle reste stable lorsqu’il change de langue à apprendre ; sa propre langue n’est pas proposée comme cible. Les anciennes URL web `app.html?start=1&lang=…&study=…` rejoignent ce même parcours. L’entrée de connexion conserve le couple et le niveau demandés.

## Sources et limites

Les sept parcours relus restent exactement leurs 78 fichiers JSON publiés, avec leurs 33 654 modèles et leurs corrections. Les 35 autres directions affichent les blocs déjà présents dans le catalogue classique : étude, sens, lecture et aide sont conservés ensemble. Aucun traducteur automatique ni générateur phonétique ne crée de cartes pendant le chargement.

L’export `content/native-catalogue/` associe les identifiants classiques stables aux emplacements thématiques du parcours de la langue étudiée. Il n’introduit pas les 1 539 enrichissements bilingues dans une langue pour laquelle aucun sens n’existe. Les réserves restent en réserve. Les préparations nouvelles utilisent les cartes effectivement disponibles, dans leur ordre source, par groupes de cinq.

Les aides japonaises et coréennes adaptées à la langue maternelle manquent dans la source classique. La notation anglaise ou le pinyin existant peuvent donc apparaître en secours, avec leur provenance dans l’aide ; une aide absente reste absente. Ces directions supplémentaires ne sont pas présentées comme ayant reçu la relecture individuelle des sept parcours.

Les libellés d’interface, thèmes et niveaux sont des ressources séparées, dans `content/course-locales/`. Le compilateur conserve les 115 traductions chinoises déjà publiées et vérifie les clés, variables et balises.

## Accès

Les 2 218 identifiants historiquement gratuits des sept parcours restent identiques. Pour les autres directions, le registre reprend l’union des fiches accessibles dans l’ancien catalogue et dans ses parcours guidés, selon les vrais sélecteurs classiques. Le niveau éditorial 1 reste gratuit ; l’abonnement doit toujours venir du booléen serveur `paid === true`. Une préférence locale ne donne aucun droit. Une direction inconnue, identique à la langue maternelle ou une identité étrangère à la direction sont refusées.

Les tarifs, fonctions serveur d’authentification et de paiement, DECKS et PEDAGOGY_FAMILIES restent identiques. Les URL `classic=1` et les entrées APK restent dans l’application classique.

## Vérification reproductible

Depuis la racine du dépôt :

```sh
python tools/maquette-guidee/export_native_catalogue.py --check
node tools/maquette-guidee/build_course_i18n.cjs --check
node --test melunga_deploy/tests/native-courses.test.cjs
NODE_PATH=/tmp/melunga-review-tools/node_modules node --test melunga_deploy/tests/native-language-flow.test.cjs
```

Le test de données vérifie les 42 directions, les 350 projections supplémentaires de niveaux et leurs 143 989 blocs éligibles, les sources immuables, les droits gratuits et payants, les URL de connexion, les refus de corruption et l’annulation/reprise du chargement. Le test navigateur utilise Chromium local et des réponses d’accès simulées ; il ne se connecte à aucun compte réel.

Le correctif de démarrage et le lecteur audio serveur sont réunis dans le même aperçu, afin de tester le trajet complet depuis l’accueil. Aucun changement aux séquences visibles de la PR #19 n’est inclus ici.
