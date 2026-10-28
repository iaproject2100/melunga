# Animation du logo pendant le chargement

Le logo Melunga d’origine flotte doucement sur le fond pastel de la page de choix des langues. Un halo léger et trois petites bulles dorées l’accompagnent. L’animation dure quatre secondes par cycle ; le logo ne tourne pas. La légende de chargement conserve sa capsule translucide et sa traduction dans les sept langues natives.

L’animation apparaît avec la légende si la préparation dépasse 400 ms. Elle n’impose aucune durée minimale : dès que la première leçon et sa disposition sont prêtes, le cache et tous ses éléments animés quittent le DOM. La préférence de mouvement réduit conserve le logo et les bulles immobiles. Le logo est réduit dans les écrans très bas ; le bouton de reprise reste accessible.

Le produit utilise uniquement du CSS et l’image existante `melunga-logo.png`, dont les octets sont inchangés. Le GIF ci-dessous sert d’aperçu, sans être chargé par l’application.

- [Voir l’animation réelle — GIF, quatre secondes](animation-logo-melunga.gif)
- [Téléphone avec mouvement](logo-chargement-anime-mobile.png)
- [Téléphone avec mouvement réduit](logo-chargement-mobile.png)
- [Ordinateur](logo-chargement-ordinateur.png)
- [Paysage court avec reprise](logo-chargement-paysage.png)
- [Rapport navigateur](browser-report.json)

## Validation

Le test existant `melunga_deploy/tests/course-discreet-loading.browser.cjs` est adapté à cette demande : les anciennes assertions d’absence d’image sont remplacées par la vérification d’un unique logo original décodé, de son empreinte exacte, de son rôle décoratif et de ses dimensions. Les protections de chargement et de reprise restent vérifiées.

Onze cas ont réussi :

- Sept langues natives avec adaptateur retardé : français, anglais, espagnol, chinois, italien, japonais et coréen. Le texte est traduit avant la fin du chargement ; le logo et la légende tiennent dans l’écran. Aucune animation du logo, du halo ou des bulles ne tourne avec la préférence de mouvement réduit.
- Deux parcours réels accueil → langue → première leçon, sur mobile de 320 px et ordinateur de 1366 px. Avec mouvement normal, la transformation du logo change réellement au fil du temps et les cinq animations CSS sont en cours d’exécution.
- Une préparation rapide sous horloge navigateur contrôlée : la leçon est prête avant 400 ms et le minuteur annulé ne fait pas réapparaître l’animation plus tard. Ce temps simulé ne mesure pas la performance du site public.
- Une erreur d’adaptateur sur écran paysage de 640 × 320 px : le logo réduit, le message et le bouton de reprise tiennent dans l’écran ; la reprise conserve l’entrée directe dans la première leçon.

Les 215 empreintes d’entrée correspondent aux sources finales et sont restées stables. Aucun ancien écran visible, erreur JavaScript ou appel inattendu n’a été observé. Le logo est décoratif pour les technologies d’assistance ; la légende localisée sert d’indication de statut.

Le GIF contient 48 captures des pixels réels de Chromium à 12 images par seconde. Les véritables animations CSS de l’illustration sont mises en pause puis avancées uniformément sur un cycle de quatre secondes pour l’export. Aucun dessin ni modification de l’image du logo n’est effectué. Le fichier GIF mesure 320 × 740 px et 217 373 octets.

Les contrôles de démarrage existants (12), les contrôles source (12), l’intégration audio (15) et les ressources d’entrée ont également réussi lors de l’intégration ; leurs rapports sont joints séparément. La logique de démarrage et le corps de l’application sont identiques à `9202c95` ; seule la présentation du cache change dans le fichier HTML. Les 23 autres fichiers de la couche source finie conservent leurs empreintes. Les contrôles utilisent Chromium et des réponses API locales explicites ; aucun appareil physique, Safari, compte, paiement ou son réel n’a été utilisé.

Exécution des contrôles comportementaux :

```sh
COURSE_DISCREET_LOADING_REPORT_DIR=/tmp/melunga-course-loading-logo-animation \
NODE_PATH=/tmp/melunga-review-tools/node_modules:/opt/codex/cua_node/lib/node_modules \
node melunga_deploy/tests/course-discreet-loading.browser.cjs
```

Ajouter `COURSE_LOADING_ANIMATION_CAPTURE=1` pour exporter aussi le GIF ; cette option nécessite FFmpeg. Les vérifications ordinaires ne nécessitent pas FFmpeg.
