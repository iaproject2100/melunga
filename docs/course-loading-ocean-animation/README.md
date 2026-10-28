# Chargement océan et logo qui nage

Le fond de l’animation utilise le dégradé de l’ambiance Océan classique : `linear-gradient(180deg,#1cb5e0,#000851)`. Le logo Melunga d’origine effectue un mouvement de nage doux : déplacement horizontal de 8 px, déplacement vertical de 6 px et inclinaison totale de 3 degrés par cycle de quatre secondes. Le halo et les trois petites bulles dorées restent présents.

Le message localisé et le bouton de reprise utilisent une capsule bleu foncé translucide avec du texte clair. Le fond ne concerne que le chargement ; les couleurs choisies pour le cours restent conservées.

L’animation apparaît après 400 ms si la leçon charge encore, puis disparaît dès que la leçon et sa disposition sont prêtes. Aucun délai minimum n’est ajouté. La préférence de mouvement réduit laisse le logo et les bulles fixes. L’image du logo n’est ni redessinée ni modifiée ; le produit anime l’élément d’origine en CSS.

- [Voir l’animation océan réelle — GIF, quatre secondes](animation-logo-melunga.gif)
- [Téléphone avec animation](logo-chargement-anime-mobile.png)
- [Téléphone avec mouvement réduit](logo-chargement-mobile.png)
- [Ordinateur](logo-chargement-ordinateur.png)
- [Paysage court avec reprise](logo-chargement-paysage.png)
- [Rapport navigateur](browser-report.json)

## Vérifications

Le test existant `melunga_deploy/tests/course-discreet-loading.browser.cjs` conserve ses onze cas : sept langues natives, deux véritables parcours accueil → choix de langue → première fiche, une préparation rapide sous horloge contrôlée et une reprise après échec sur écran paysage de 640 × 320 px.

La vérification de l’ancien fond pastel devient une vérification des deux extrémités du dégradé Océan. Le contrôle de mouvement mesure la transformation CSS réelle du logo à quatre moments du cycle et confirme les déplacements horizontal et vertical ainsi que l’inclinaison. Les cinq animations fonctionnent en mouvement normal ; aucune ne fonctionne avec la préférence de mouvement réduit.

Les onze points de contraste mesurés sur les pixels réellement rendus, pour les textes de chargement et de reprise, atteignent au moins 10,89:1. Les capsules, le logo et le bouton de reprise restent dans l’écran, y compris en paysage court. Les textes sont traduits dans les sept langues natives, le logo reste décoratif pour les technologies d’assistance et son empreinte correspond exactement à l’image d’origine.

Les onze cas ont réussi, avec 215 empreintes stables correspondant aux sources finales. Aucune ancienne disposition visible, erreur JavaScript, erreur de fixture ou requête inattendue n’a été observée. Les contrôles de démarrage existants (12), de source (12), d’intégration audio (15) et des ressources d’entrée ont également réussi lors de l’intégration ; leurs rapports sont joints séparément.

La logique de démarrage et tout le corps de l’application restent identiques à `c1fe88f`. Seule la présentation de l’écran d’attente change dans le fichier HTML ; les 23 autres fichiers de la couche source finie conservent leurs empreintes. Les contrôles utilisent Chromium, des contenus du dépôt et des réponses API locales explicites. Aucun appareil physique, Safari, compte, paiement ou son réel n’a été utilisé.

Le GIF contient 48 captures réelles de Chromium à 12 images par seconde, sur un cycle de quatre secondes. Les animations CSS sont mises en pause puis avancées uniformément pour l’export ; aucune modification de l’image du logo n’est effectuée. Ce fichier d’aperçu mesure 320 × 740 px et 227 023 octets et n’est pas chargé par l’application.

Relancer les vérifications depuis la racine du dépôt :

```sh
COURSE_DISCREET_LOADING_REPORT_DIR=/tmp/melunga-course-loading-ocean-animation \
NODE_PATH=/tmp/melunga-review-tools/node_modules:/opt/codex/cua_node/lib/node_modules \
node melunga_deploy/tests/course-discreet-loading.browser.cjs
```

Ajouter `COURSE_LOADING_ANIMATION_CAPTURE=1` pour exporter le GIF ; cette option nécessite FFmpeg. Les vérifications ordinaires ne nécessitent pas FFmpeg.
