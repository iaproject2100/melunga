# Trois maquettes ordinateur : confort de lecture

Ces propositions sont des pages de comparaison isolées. Elles ne modifient pas le parcours publié. Chacune présente l’écran des thèmes et celui d’une leçon.

| Proposition | Liste des thèmes | Largeur maximale | Marge sous le contenu principal |
| --- | --- | ---: | ---: |
| A · Vue centrée | Trois colonnes, défilement et bouton Autres thèmes | 1 040 px | 48 px |
| B · Lecture calme | Deux colonnes, photos à gauche | 980 px ; leçon 880 px | 60 px |
| C · Par pages | Quatre thèmes par page, deux colonnes | 920 px | 56 px |

Le logo reste grand, la vignette accompagne le thème en leçon et les trois commandes À revoir, Écouter et Continuer sont réunies. Les accès aux conditions générales et à la confidentialité restent dans Menu ; C montre aussi deux liens discrets en pied de page, dans la marge prévue.

## Données et isolation

Les vingt-six thèmes et les 353 cartes sont repris du fichier existant `melunga_deploy/content/niveaux-progressifs/fr-es/L1.json`. Le contrôle compare l’empreinte du document, les titres et les photos, puis les identifiants, leur appartenance au thème et leur ordre exacts. Étude, sens français et aide phonétique sont comparés aux valeurs sources entières. Aucune aide phonétique n’est créée.

Le harnais est extérieur au dépôt : `/tmp/melunga-desktop-comfort.browser.cjs`. Il charge les vrais fichiers HTML, CSS, JavaScript, données et images des maquettes dans Chromium local, avec interception des requêtes vers ces fichiers. Il refuse les API, les domaines extérieurs, les appels audio et les écritures de stockage. Aucun compte, paiement ou service vocal n’est utilisé. Les liens juridiques sont vérifiés sans ouverture réseau.

Les fichiers de l’application publiée sont aussi inclus dans les empreintes avant/après pour constater leur conservation pendant la passe. Le contrôle ne modifie aucun test existant ni aucun fichier des maquettes.

## Matrice finale

- Douze cas normaux : A/B/C × Thèmes/Leçon × 1366 × 768 et 1920 × 1080.
- Six captures à 1366 × 768 en mode `capture=1`, sans barre d’outils de comparaison.
- Texte et commandes entiers, aucune barre horizontale ni défilement du document de comparaison, largeur de contenu bornée et marge d’au moins 48 px sous le contenu principal.
- Les images locales et le logo sont réellement chargés et décodés avant chaque capture.
- A/B : piste DOM visible de 16 px, curseur de 10 px réellement peint en violet, clic sur la piste et glissement jusqu’en bas puis en haut, synchronisation du curseur et navigation clavier ; bouton Autres thèmes et accès effectif aux vingt-six thèmes. C : sept pages, dernier groupe 25–26, ouverture réelle du dernier thème.
- Continuer passe à la carte source suivante, sans classement « Je connais », audio réel ou stockage.

```sh
NODE_PATH=/tmp/melunga-review-tools/node_modules node --test /tmp/melunga-desktop-comfort.browser.cjs
```

## Résultat final du 27 octobre 2026

**Les 12 cas normaux et les 6 captures réussissent**, dans trois groupes de contrôle. Les empreintes des fichiers restent stables pendant la passe. Aucune erreur JavaScript, erreur de fixture, requête imprévue, écriture de stockage ou lecture audio réelle n’est observée.

Les marges sous le contenu principal mesurées sont de **48 px pour A, 60 px pour B et 56 px pour C**, sur les deux tailles et en mode capture. Les 26 thèmes sont accessibles dans chaque proposition. La pagination C atteint sept pages, dont le dernier groupe 25–26.

La première inspection avait montré qu’une barre native déclarée par CSS pouvait être masquée dans Chromium. Les maquettes utilisent maintenant un rail constitué d’éléments DOM. Le test mesure entre 620 et 2 510 pixels violets effectivement peints selon la taille, puis utilise la souris pour cliquer la piste et déplacer le curseur jusqu’aux deux extrémités. Il vérifie aussi que le panneau reste utilisable au clavier.

Une vérification supplémentaire confronte chaque vignette rendue au titre, à l’image et aux quatre coordonnées de cadrage attendus. Le seul décodage du logo ne peut donc pas suffire à valider la présence des photos.

| Proposition | Thèmes | Leçon |
| --- | --- | --- |
| A · Vue centrée | [Capture](captures/a-themes-1366.png) | [Capture](captures/a-lecon-1366.png) |
| B · Lecture calme | [Capture](captures/b-themes-1366.png) | [Capture](captures/b-lecon-1366.png) |
| C · Par pages | [Capture](captures/c-themes-1366.png) | [Capture](captures/c-lecon-1366.png) |

Le [résumé](qa-summary.json) conserve les marges, les mesures du rail, l’empreinte du harnais et les limites. Le [rapport complet](verification-browser.json) donne les dix-huit cas et les empreintes des fichiers. Les six PNG originaux restent dans `/tmp/melunga-desktop-comfort-browser/`.

Cette passe de maquettes n’inclut pas leur publication. La galerie mobile et le ZIP des six images font l’objet de la vérification complémentaire décrite ci-dessous.
## Consultation et téléchargement

La page à publier est `/apercus/ordinateur-confort/`. Elle permet de choisir les trois présentations et les vues Thèmes/Leçon. Sur téléphone, elle affiche une galerie des six captures ; elle ne modifie pas la présentation de l’application mobile.

Le ZIP contient six images PNG et une courte notice. Elles s’ouvrent indépendamment de la page interactive, sans installation ni serveur. Les six images archivées sont identiques aux captures publiées. La galerie mobile à 390 × 844 et le téléchargement effectif du ZIP ont été vérifiés dans Chromium sur un serveur HTTP local ; voir [verification-downloads.json](verification-downloads.json) et [verification-bundle.json](verification-bundle.json).

Les fichiers existants de l’application, du catalogue, des comptes, des prix et des conditions générales sont conservés. Seuls les nouveaux fichiers statiques de comparaison et leur documentation sont ajoutés. Les contrôles des ressources d’entrée de l’application continuent de passer : [verification-entry-gates.log](verification-entry-gates.log).
