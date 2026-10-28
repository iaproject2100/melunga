# Logo qui se déplace sous l’eau

Le logo parcourt maintenant une trajectoire visible dans l’écran de chargement bleu océan. Il avance latéralement, monte et descend, puis semble s’éloigner et revenir grâce à une variation de taille et d’opacité. Le mouvement s’étend sur un cycle de huit secondes : 88 px de déplacement horizontal, 42 px verticalement, une échelle allant de 85 à 100 % et une inclinaison de −4 à +4 degrés. Le halo et les trois bulles dorées accompagnent le déplacement.

Sur les écrans de moins de 380 px de hauteur, le logo est réduit à 96 px et le déplacement devient plus court, 60 × 20 px, pour rester à distance du message et de la reprise. Le fond Océan, le texte clair localisé et les capsules translucides restent conservés. Le fichier image du logo est exactement celui d’origine ; seules ses transformations CSS changent.

L’animation apparaît si la préparation dépasse 400 ms et disparaît dès que la première leçon est prête. Aucun délai minimum n’est ajouté pour laisser finir le cycle. La préférence de mouvement réduit conserve l’illustration immobile. La présentation des boutons du cours reste celle des capsules rétablies précédemment.

- [Voir le déplacement sous l’eau — GIF, huit secondes](animation-logo-melunga.gif)
- [Téléphone avec animation](logo-chargement-anime-mobile.png)
- [Téléphone avec mouvement réduit](logo-chargement-mobile.png)
- [Ordinateur](logo-chargement-ordinateur.png)
- [Paysage court avec reprise](logo-chargement-paysage.png)
- [Téléphone étroit de 280 px](logo-chargement-etroit.png)
- [Rapport navigateur](browser-report.json)

## Vérifications

Le test existant `melunga_deploy/tests/course-discreet-loading.browser.cjs` conserve les onze scénarios précédents et ajoute un écran étroit de 280 px, soit douze cas réussis. Il utilise les pages, scripts, images et contenus du dépôt avec des réponses API locales explicites.

Les sept langues natives restent traduites pendant l’attente. Les deux entrées réelles accueil → langue → première fiche fonctionnent sur téléphone de 320 px et ordinateur de 1366 px. La préparation rapide sous horloge contrôlée supprime l’indicateur avant 400 ms et empêche son retour tardif. La reprise après une erreur d’adaptateur ouvre toujours directement la première leçon.

Le contrôle de mouvement mesure la transformation réelle à huit moments du cycle complet, plutôt que de seulement vérifier qu’un nom d’animation existe. Il confirme un déplacement horizontal et vertical bien visible, une variation de taille représentant la profondeur et une inclinaison douce. À chacune des huit positions, le logo reste dans l’écran et à distance du texte. Les mêmes vérifications sont réalisées sur les écrans de 280 px et de 640 × 320 px, avec la trajectoire réduite pour ce dernier. Les cinq animations fonctionnent en mode normal et aucune ne fonctionne lorsque le mouvement réduit est demandé.

Les 215 empreintes d’entrée sont exactes et restées stables pendant le test. Aucune ancienne disposition visible, erreur JavaScript, erreur de fixture ou requête inattendue n’a été observée. Les douze points de contraste des textes de chargement et de reprise atteignent au moins 11,33:1. Le logo reste décoratif pour les technologies d’assistance et son empreinte correspond aux octets de l’image d’origine.

Les contrôles de démarrage existants (12), de source (12), d’intégration audio (15) et des ressources d’entrée ont également réussi lors de l’intégration ; leurs rapports sont joints séparément. La logique de démarrage et tout le corps de l’application restent identiques à `c36e5c1`. Seule la présentation du chargement change dans le fichier HTML ; les 23 autres fichiers de la couche source finie conservent leurs empreintes.

Ces contrôles utilisent Chromium et de l’émulation de tailles et de toucher. Aucun appareil physique, Safari, compte, paiement ou son réel n’a été utilisé.

Le GIF présente 96 captures réelles de Chromium à 12 images par seconde, sur le cycle complet de huit secondes. Les animations CSS sont mises en pause puis avancées uniformément pour l’export ; l’image du logo n’est pas redessinée ni retouchée. Cet aperçu mesure 320 × 740 px et 909 095 octets ; il n’est pas chargé par l’application, qui utilise uniquement l’image existante et les animations CSS.

Relancer depuis la racine du dépôt :

```sh
COURSE_DISCREET_LOADING_REPORT_DIR=/tmp/melunga-course-loading-underwater-animation \
NODE_PATH=/tmp/melunga-review-tools/node_modules:/opt/codex/cua_node/lib/node_modules \
node melunga_deploy/tests/course-discreet-loading.browser.cjs
```

Ajouter `COURSE_LOADING_ANIMATION_CAPTURE=1` pour exporter aussi le GIF ; cette option nécessite FFmpeg. Les vérifications ordinaires ne nécessitent pas FFmpeg.
