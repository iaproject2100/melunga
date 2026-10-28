# Présentation du cours après le choix d’une langue

Le test reproductible est `melunga_deploy/tests/course-startup-presentation.browser.cjs`. Il utilise les véritables pages d’accueil et du parcours, les scripts et contenus du dépôt, avec des réponses locales explicites pour l’accès et le catalogue de voix. Les appels réseau externes et toute requête autre que GET sont interdits.

La protection concerne l’entrée normale du parcours progressif `parcours-niveaux.html`. Le lien explicite vers l’ancienne page de maquette reste fonctionnel sans ce masque, car son interface n’utilise pas les commandes de niveau attendues par l’adaptateur du parcours.

Les douze cas finaux ont réussi :

- Six entrées réelles accueil → choix de langue, avec l’adaptateur de présentation, le contrôleur ou le manifeste retenu volontairement. Les profils incluent un téléphone de 320 px, un ordinateur de 1366 px, les langues natives française, chinoise et anglaise, ainsi qu’un ancien couple enregistré `zh-en` remplacé explicitement par `fr-es`.
- Un lien ordinaire vers le cours, qui conserve son arrivée sur les thèmes.
- Deux échecs de données consécutifs, respectant la reprise automatique existante, puis une reprise par le véritable bouton « Réessayer » qui ouvre la première fiche.
- Un échec contrôlé de l’adaptateur, du contrôleur et de la feuille de style, suivi d’une reprise conservant l’entrée directe en leçon.
- Un lien explicite vers `maquette-guidee.html`, qui reste accessible sur ses thèmes sans masque de démarrage progressif.

Un observateur `requestAnimationFrame` contrôle chaque image rendue pendant le chargement et après affichage. Aucune image de l’ancienne disposition mobile à quatre commandes en haut, ni de disposition ordinateur incomplète, ni de liste des thèmes intermédiaire avant la première fiche n’a été visible. La première vue montrée est déjà disposée et traduite. Le retour aux thèmes ne fait pas réapparaître le cache de chargement.

L’ambiance néon enregistrée est conservée volontairement dans les profils : sa couleur n’est pas un indicateur de version ancienne. Le couple explicite, la langue native, le niveau L1, la première étape et le caractère gratuit restent corrects. Aucun son ne démarre automatiquement. La reprise après échec de présentation conserve également le signal d’entrée initial, même si le contrôleur avait déjà nettoyé son URL.

Les empreintes complètes des fichiers utilisés figurent dans `browser-report.json`. Elles correspondent aux fichiers finaux du dépôt et sont restées identiques pendant les contrôles. Le rapport décrit Chromium avec émulation de tailles et de toucher ; aucun appareil physique, Safari, compte, paiement ou son réel n’a été utilisé.

Exécution locale :

```sh
COURSE_STARTUP_REPORT_DIR=/tmp/melunga-course-startup-presentation \
NODE_PATH=/tmp/melunga-review-tools/node_modules \
node melunga_deploy/tests/course-startup-presentation.browser.cjs
```

Les journaux de contrôles source et d’intégration sont fournis séparément dans ce dossier par la validation de l’intégration.
