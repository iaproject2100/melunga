# Activation des scènes L1, langue par langue

**État actuel : les sept couples sont activés dans la branche de revue, sur instruction directe de Kartech.** Une fiche nominative ou un fichier de preuve native n’est plus une condition d’activation. Le [suivi de cette instruction](../activation-instruction/README.md) remplace la procédure de double preuve de `6bbce21` ; aucune fusion ni mise en production n’a été effectuée.

Le [manifeste](statut.json), version 2, indique `activationPolicy: "owner-instruction-only"`. Chaque couple possède une décision `kartechApproval` avec son statut et l’empreinte de la scène autorisée. Le champ `nativeReview` conserve seulement le fait qu’une validation a été rapportée dans le message transmis : il n’est pas lu pour décider de l’activation. Les pièces jointes de consignation sont vierges et ne sont pas présentées comme des réponses remplies.

## Disponibilité et intégrité

Le générateur [build_l1_release.py](../../../tools/pedagogy/build_l1_release.py) produit `melunga_deploy/l1-cafe-release.js`. Il n’ouvre ni pièce justificative ni fichier nominatif. Il conserve les vérifications des sept couples connus, des doublons, des statuts et de la version exacte de chaque scène. Une scène modifiée ne reçoit pas silencieusement l’instruction donnée pour une autre version.

La configuration livrée active fr→en, fr→es, fr→it, fr→zh, fr→ja, fr→ko et zh→fr. La sélection reste modifiable par couple : `pending` ou `withheld` retire uniquement la scène concernée après régénération. Les scènes activées restent gratuites, abonnés et non-abonnés compris. Les accès L2–L10, les tarifs, les phrases et leurs aides ne changent pas.

Le menu, `available()`, `start()` et le garde en tête de `setMode()` utilisent cette même sélection. Le garde `setMode()` reste nécessaire pour les comptes payants, dont `isLockedMode()` court-circuite les restrictions. Une liste vide ou mal formée n’ouvre aucune scène, quel que soit le compte.

## Contrôle avant livraison

Le build Netlify appelle maintenant **`node check-l1-release.cjs`**, depuis la base du site `melunga_deploy`. Le vérificateur utilise seulement les modules intégrés à Node, déjà nécessaire aux fonctions du projet. Il résout les fichiers à partir de son propre emplacement, ne requiert ni Python ni historique Git, et ne demande aucune preuve native.

Il compare le manifeste, les empreintes des scènes et le script généré. Le générateur Python reste un outil de préparation facultatif ; Python n’est plus requis au build Netlify. Les résultats du contrôle local et du déploiement d’aperçu sont consignés dans le [lot d’activation](../activation-instruction/README.md). Aucun échec de build n’est contourné.

## Fiches facultatives

Les sept questionnaires originaux de Claude à `0f0a5a9` restent dans [fiches/](fiches/), et leurs [versions PDF et Word](telechargements/README.md) restent téléchargeables. Ce sont des supports facultatifs de relecture ; ils ne constituent pas en eux-mêmes des avis favorables.

Le [générateur original des fiches](genere_fiches_relecture.py) est conservé sans modification. Il peut produire une nouvelle copie dans un autre dossier :

```sh
python3 -B docs/integration-ponts-L1/publication-par-langue/genere_fiches_relecture.py melunga_deploy/content/l1-cafe.json /tmp/melunga-fiches-relecture
```

La quatrième question concerne le refus isolé ; les réserves sur `結構です`, `괜찮아요` et `不用，谢谢` restent disponibles pour une relecture ultérieure. Aucune formulation ou aide n’est réécrite par ce lot. Le paquet contient déjà `不用，谢谢。` : la coquille signalée dans le message de Claude n’y figurait pas.

## Vérifications

```sh
python3 -B tools/pedagogy/build_l1_runtime.py --check
python3 -B tools/pedagogy/build_l1_release.py --check
python3 -B -m unittest discover -s tools/pedagogy -p 'test_l1_release.py'
node melunga_deploy/check-l1-release.cjs
NODE_PATH=/tmp/melunga-review-tools/node_modules CHROMIUM_PATH=/usr/bin/chromium node melunga_deploy/tests/l1-cafe-release.test.cjs
NODE_PATH=/tmp/melunga-review-tools/node_modules CHROMIUM_PATH=/usr/bin/chromium node melunga_deploy/tests/l1-cafe.test.cjs
```

Les anciens rapports de ce dossier décrivent l’état antérieur, fermé, à `6bbce21` / `deeff45`. Ils ne sont pas réécrits. Les nouveaux contrôles portent sur [l’activation sur instruction](../activation-instruction/README.md). Ils ne certifient ni la voix de synthèse, ni une écoute humaine, ni une acquisition pédagogique. Aucun APK n’est construit.
