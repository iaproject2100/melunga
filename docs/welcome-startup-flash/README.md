# Suppression de l’ancien accueil pendant le chargement

La page initiale était visible avant la transformation de l’accueil et la construction de sa version ordinateur par `desktop-home.js`. Sur une connexion lente, plusieurs présentations pouvaient donc être aperçues successivement.

Un garde installé dans le `head`, avant la lecture du corps de page, masque les interfaces intermédiaires. Seuls le logo et le nom Melunga sont affichés pendant le chargement. L’accueil devient visible à la fin de sa préparation, après l’application de la langue native et de la disposition finale, sans délai artificiel. Le cache du script passe à `desktop-home.js?v=5`.

Si le script échoue, la présentation intermédiaire reste masquée et un bouton de nouvelle tentative apparaît dans la langue choisie. Le chargement peut ensuite reprendre normalement. La préférence de réduction des mouvements, les bulles et les gestionnaires des commandes restent inchangés.

Le test reproductible `melunga_deploy/tests/welcome-startup.browser.cjs` retarde explicitement les scripts et observe les images rendues sur petit écran et ordinateur, en français, anglais et chinois. Il vérifie l’absence de présentation ancienne visible, l’arrivée de la bonne langue, le retour depuis l’exemple et la reprise après échec de script. Les API sont des fixtures locales explicites ; aucun appareil physique, Safari, compte ou paiement réel n’est utilisé.

Les 12 tests source, 15 tests d’intégration et trois contrôles d’entrée sont également conservés et exécutés. Les deux pins de fichiers modifiés sont actualisés sans élargir les inventaires ni modifier leurs assertions. Les voix, droits, données, paiements et progression ne changent pas.
