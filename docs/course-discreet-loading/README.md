# Attente discrète après le choix de langue

Le grand logo sur fond bleu du parcours est remplacé par le même dégradé pastel que la page de choix des langues. Une petite capsule translucide « Chargement… » apparaît seulement si la préparation dépasse 400 ms. Il n’existe pas de durée d’attente minimale : dès que la leçon et sa disposition sont prêtes, la protection disparaît.

La protection contre l’ancienne disposition, les deux images de synchronisation, le traitement des échecs et le bouton de reprise restent actifs. Le signal d’entrée directe dans la première leçon est conservé lors d’une reprise. Les vérifications des droits et les téléchargements de contenu restent inchangés.

La modification produit concerne uniquement `melunga_deploy/parcours-niveaux.html`. Son empreinte complète est mise à jour dans la couche source finie ; les 23 autres fichiers de cette couche conservent leurs empreintes précédentes. Les inventaires restent à 13 fichiers modifiés et 11 fichiers ajoutés.

- [Attente sur téléphone](attente-discrete-mobile.png)
- [Attente sur ordinateur](attente-discrete-ordinateur.png)
- [Rapport de présentation](browser-report.json)

## Vérifications

Le nouveau test reproductible `melunga_deploy/tests/course-discreet-loading.browser.cjs` a réussi onze cas :

- Sept langues natives, avec l’adaptateur volontairement retenu : français, anglais, espagnol, chinois, italien, japonais et coréen. Le texte d’attente est localisé avant la fin du chargement, le grand logo et son titre sont absents et la capsule tient dans l’écran.
- Deux clics réels depuis l’accueil et le choix de langue, avec manifeste retenu sur mobile de 320 px et adaptateur retenu sur ordinateur de 1366 px. La première vue visible est directement la leçon correctement disposée.
- Une préparation rapide sous horloge navigateur contrôlée : la première leçon est prête après 80 ms de temps simulé, avant l’échéance de 400 ms. Le minuteur de l’indicateur est annulé ; aucune capsule tardive ne revient après une seconde supplémentaire.
- Un échec contrôlé de l’adaptateur, suivi du bouton de reprise d’origine : la première leçon s’ouvre et le signal d’entrée directe est préservé.

Les sept cas avec mouvement réduit vérifient que l’anneau ne tourne pas ; les deux cas de mouvement normal vérifient son animation. Aucune ancienne disposition visible, erreur JavaScript ou requête inattendue n’a été observée. Les 215 empreintes de fichiers, dont le test exécuté, correspondent aux sources finales et sont restées stables pendant ce contrôle.

Les captures représentent les pixels réels de Chromium pendant que le script de fin de page est retenu. Le protocole CDP permet cette capture sans attendre `document.fonts.ready`, qui reste normalement en attente tant que l’analyse du document est suspendue.

Les contrôles de démarrage existants (douze cas), les contrôles source (douze), l’intégration audio des deux applications (quinze) et les ressources d’entrée ont également réussi lors de l’intégration ; leurs rapports et journaux sont joints séparément. Ces contrôles utilisent Chromium avec émulation de tailles et de toucher, des contenus réels du dépôt et des réponses API locales explicites. Aucun appareil physique, Safari, compte, paiement ou son réel n’a été utilisé.

Exécution depuis la racine du dépôt avec Playwright Core disponible :

```sh
COURSE_DISCREET_LOADING_REPORT_DIR=/tmp/melunga-course-discreet-loading \
NODE_PATH=/tmp/melunga-review-tools/node_modules:/opt/codex/cua_node/lib/node_modules \
node melunga_deploy/tests/course-discreet-loading.browser.cjs
```
