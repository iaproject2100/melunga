# Intégration des lecteurs classique et moderne

Les deux lecteurs utilisent `voice-selection.js` puis `lesson-audio.js`. Le catalogue est préchargé avant les gestes de lecture ; un clic ne suspend jamais `Audio.play()` pour attendre une requête. Un catalogue encore en chargement demande un nouvel essai explicite, sans lecture différée.

Le choix est partagé par langue étudiée avec le comparateur. Les noms, langues et genres viennent des métadonnées du catalogue réel, jamais d'une liste de voix inventée dans les interfaces. Le menu moderne affiche les trois candidates Chirp disponibles. Une référence WaveNet n'y apparaît que si elle a déjà été choisie explicitement dans le comparateur. Les boutons Femme/Homme classiques enregistrent une vraie candidate du genre demandé ; ils ne modifient pas artificiellement la hauteur du son.

Sans choix explicite, la première candidate Chirp reste une proposition provisoire de prévisualisation. Elle n'est jamais enregistrée implicitement comme favorite et ne constitue pas un choix final de voix de production. Les interfaces portent cette provenance dans le titre accessible du contrôle. Aucune sélection globale de production n'est faite par cette intégration.

| Lecteur | Réglages conservés |
|---|---|
| Classique | normal `1`, lent `0.75`, comme l'ancienne primaire WaveNet |
| Moderne | `0.75`, `0.85`, `1` |

Pour Chirp, le serveur reçoit le débit naturel et le lecteur applique le débit demandé avec conservation de hauteur. Pour une référence WaveNet explicitement choisie, le débit reste appliqué par le serveur. Le module partagé décide de ces modalités à partir du catalogue.

Le chemin classique étudié ne contient plus Google Translate TTS, StreamElements ni leur ancien mécanisme de boost. Le seul secours est celui du module partagé : une voix navigateur déclarant la langue étudiée, sans voix par défaut d'une autre langue. L'absence finale d'audio affiche la traduction de « Audio indisponible. Réessaie. ». La navigation, la reconnaissance vocale et la sortie de page arrêtent la lecture classique.

`DECKS`, `PEDAGOGY_FAMILIES`, les huit fonctions d'authentification/paiement, les sélecteurs classiques, les droits, les prix et les fonctions de progression modernes restent inchangés. Les blocs étudiés sont transmis tels que les appelants existants les fournissent ; le nettoyage classique antérieur est conservé.

Les deux pages modernes chargent I18n v3, sélection v1, lecteur v2 puis contrôleur v32. La page classique charge les mêmes modules partagés avant son script existant.

## Vérification locale

```sh
NODE_PATH=/tmp/melunga-review-tools/node_modules node --test melunga_deploy/tests/chirp-apps-integration.test.cjs
```

Les 14 cas passent : sept langues étudiées dans chacun des lecteurs, texte source et cible exacts, démarrage synchrone, aucune favorite implicite, choix masculin partagé, débit classique lent, référence explicitement choisie, secours de langue exacte et message final d'échec pendant une actualisation du catalogue.

Ces tests utilisent des métadonnées de catalogue et des objets média explicitement simulés. Ils n'appellent aucun fournisseur, ne téléchargent ni ne décodent de son et ne prouvent ni une écoute réelle ni un essai sur téléphone physique. Les contrôles de conservation comparent les littéraux et fonctions protégés au commit `4fafe31` et vérifient l'absence de modifications des données/droits ; ils ne relancent pas l'audit linguistique du corpus.
