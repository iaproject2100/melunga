# Localisation de la démonstration Melunga

Le contrôle porte sur les cinq écrans « La preuve Melunga » de l’accueil, pour les sept langues natives : français, anglais, espagnol, chinois, italien, japonais et coréen. Il utilise les véritables boutons de langue, de navigation, de retour et d’écoute du site.

Le défaut traité concernait la dépendance au module externe de traduction : l’accueil possédait ses propres textes traduits, tandis que la démonstration pouvait revenir au français si le module manquait ou ne connaissait pas une clé. Le correctif embarque les traductions déjà validées des écrans et de leurs contrôles ; le test impose ces deux modes de panne pour éviter un résultat dépendant du cache du navigateur.

## Périmètre du test

- Titres, consignes, paragraphes, étapes de méthode, bouton principal et indication de balayage : comparaison aux dictionnaires, avec un repère de titre indépendant pour chaque langue.
- Accessibilité : langue du document, noms du retour et des cinq boutons de pagination, nom de la progression.
- Présentation du héros anglais : le mot « demonstration » et les autres mots longs doivent rester entiers ; la région d’application porte le nom accessible neutre « Melunga ».
- Conservation de la langue après changement, navigation entre les écrans, retour à l’accueil, rechargement et retour depuis l’offre.
- Géométrie des cinq écrans dans les sept langues à 320 × 568, 390 × 700 et 1440 × 900 pixels : aucune coupe horizontale, titre lisible et boutons de navigation accessibles.
- États de l’écoute : chargement, résultat, réécoute et erreur. Les événements audio sont simulés ; aucune voix n’est chargée ou entendue.
- Deux pannes du module externe de traduction : réponse 503 et ancien module qui renvoie le texte source. Dans chaque cas, les sept langues et les cinq écrans restent contrôlés, ainsi que tous les libellés audio simulés. Le test vérifie que la requête défectueuse a réellement été interceptée.
- Priorité de la langue initiale : paramètre URL valide, préférence d’application valide, `ox_nat` valide, langue native du couple valide, puis français. Les préférences absentes ou malformées sont également testées, avec rechargement.

Sur ordinateur, l’accueil possède une section méthode dédiée, distincte du carrousel mobile. Pour contrôler le carrousel à grande largeur sans déclencher une fonction interne ni cliquer un bouton caché, le test choisit la langue depuis le véritable sélecteur ordinateur, réduit la fenêtre pour ouvrir « Voir un exemple », puis restaure sa largeur.

## Isolation

Les fichiers HTML, CSS, JavaScript, images et dictionnaires sont servis depuis cette copie du dépôt. Les seules réponses API autorisées sont des fixtures explicites de géolocalisation, de prix et de statut gratuit. Toute autre requête API, tout chargement externe inattendu ou toute erreur JavaScript fait échouer le contrôle. Aucun compte réel, achat, service vocal ou site publié n’est utilisé.

Le navigateur est Chromium local. Les profils mobiles utilisent un viewport, une interaction tactile et une chaîne d’identification Android. Ces vérifications ne constituent pas un essai sur téléphone physique, Safari, application installée ou mode silencieux.

## Exécution

```sh
NODE_PATH=/tmp/melunga-review-tools/node_modules node --test melunga_deploy/tests/proof-localization.browser.cjs
```

Le rapport complet est écrit dans `/tmp/melunga-proof-localization-browser.json`, les captures dans `/tmp/melunga-proof-localization-browser/`. Les sources du produit sont empreintées avant et après la passe pour détecter toute modification pendant le test.

## Résultat du 27 octobre 2026

Les **7 groupes passent, soit 250 cas**. Les empreintes des sources sont identiques avant et après la passe. Aucune erreur JavaScript, erreur de fixture ou requête inattendue n’a été observée. Aucun appel API n’a été nécessaire dans ce parcours : le pays est fixé à FR dans l’URL et tous les événements audio sont simulés en mémoire.

| Contrôle | Cas |
| --- | ---: |
| Couverture des traductions existantes | 1 |
| Sept langues, cinq écrans | 35 |
| Changements de langue et retour après rechargement | 9 |
| Sept langues, cinq écrans, trois dimensions | 105 |
| États audio simulés avec le module courant | 7 |
| Cinq écrans dans sept langues avec module absent ou ancien | 70 |
| États audio simulés avec module absent ou ancien | 14 |
| Priorités de langue initiale et rechargement | 9 |

Le mot anglais « demonstration » reste entier à 320 et 390 pixels ; le nom accessible du conteneur est « Melunga ». Un examen visuel des captures complète les assertions de géométrie. Une revue statique indépendante du test a confirmé les contrôles d’interception effective, d’états audio dans les modes de panne et d’accès au dernier contenu vertical.

Le contenu français de l’exemple et son aide phonétique sont conservés intentionnellement. Dans les autres langues natives, l’avertissement correspondant est traduit et vérifié séparément des consignes. La passe compare les rendus aux traductions déjà présentes ; elle ne constitue pas une nouvelle relecture linguistique.

La [synthèse JSON](qa-summary.json) indique les comptes et limites ; le [rapport complet](verification-browser.json) contient les 250 cas et les empreintes des sources. Les 12 captures de cette passe sont conservées dans [captures/](captures/), dont :

- [Héros anglais, 390 px](captures/en-slide-1-390.png)
- [Méthode en anglais, 320 px](captures/en-slide-4-320.png)
- [Progression en chinois, 390 px](captures/zh-slide-5-390.png)
- [Héros chinois, ordinateur](captures/zh-slide-1-1440.png)
- [Héros japonais sans module externe](captures/ja-slide-1-without-external-module-390.png)
