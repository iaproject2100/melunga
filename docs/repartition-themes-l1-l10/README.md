# Classement thématique : 12 langues, L1 à L10

Les **10 343 déplacements proposés** dans les trois audits fournis par Claude sont intégrés dans une édition de présentation commune aux parcours. Ils conservent le niveau éditorial et visent uniquement des thèmes déjà présents dans la banque de la langue concernée. Les rubriques gardent leurs titres actuels ; les propositions de renommage, de création et de fusion ne sont pas appliquées.

| Lot | Déplacements des sources |
| --- | ---: |
| L1–L3 | 2 544 |
| L4–L6 | 4 245 |
| L7–L10 | 3 554 |
| Total | 10 343 |

Les **4 582 incertitudes** et les **775 destinations absentes** restent dans leur thème actuel. Les mini-scènes, les modèles, les réserves et les changements entre sections sont exclus. Les compteurs restent propres à chaque banque ; les langues ne contiennent pas toutes les mêmes phrases.

Les 120 cellules langue × niveau et toutes les destinations ont été contrôlées contre les sources. La lecture sémantique exhaustive est celle de l’audit fourni par Claude ; notre contre-vérification indépendante a porté sur 36 propositions et sur les 31 textes affichés qui avaient déjà été corrigés. Voir les [écarts réconciliés](ecarts-avant-classement.md). Aucune ancienne formulation de l’audit ne remplace ces corrections.

## Sources et régénération

Les décisions durables sont dans les douze fichiers [`imports/domain-edition-v1/*-themes-v1.json`](../../tools/maquette-guidee/imports/domain-edition-v1), accompagnés de `edition.json`. Ils décrivent explicitement la position des **54 583 indices sources**, y compris ceux qui restent inchangés, et les décisions incertaines ou inapplicables. Le compilateur [`theme_placement_edition.py`](../../tools/maquette-guidee/theme_placement_edition.py) vérifie les trois empreintes des audits, les banques, les comptes des 120 cellules et l’intégralité de ces sources de placement.

L’export habituel incorpore cette édition automatiquement :

```sh
python3 tools/maquette-guidee/export_native_catalogue.py --check
```

Les anciennes banques et les 78 documents des parcours révisés restent inchangés. Ils constituent une édition source historique vérifiable. Les anciennes correspondances de traduction utilisées pour les produire ne décident d’aucun nouveau placement. Une source, une carte ou une position inconnue fait échouer la régénération ; elle ne reçoit pas un thème par défaut ou à partir d’un mot. L’ajout d’une nouvelle banque demande donc des affectations explicites, revues dans leur langue.

Le fichier généré `content/native-catalogue/theme-placements.json` est vérifié par SHA-256 avant affichage. Le contrôleur valide d’abord le document source, puis applique l’édition, puis les droits d’accès. Il conserve le cache source séparément de la présentation. Une erreur affiche « Réessayer » et ne présente pas silencieusement l’ancien classement.

Dans chaque destination, les fiches déjà présentes gardent leur ordre relatif. Les entrantes sont ajoutées par indice source croissant. Les mêmes objets de fiche et d’activité sont réutilisés : textes, significations, prononciations, champs d’origine et identifiants restent intacts. Les préparations suivent la phrase qu’elles préparent, notamment le cas coréen 733 → 772. Les références de révision et de contexte restent présentes.

## Vérifications

- **1 280 parcours langue × niveau** : 128 paires disponibles, dont 7 parcours révisés et 121 vues natives. Toutes les fiches primaires et les **1 614 754 activités** restent identiques, sans perte ni duplication d’identité. Les 10 343 décisions sources se déclinent en 96 866 déplacements visibles selon l’éligibilité des différentes langues d’explication.
- **753 thèmes longs** : le partitionneur réel trouve des étapes de 30 à 40 fiches, sans retirer de groupe technique.
- Les 12 banques, les 78 documents historiques, les accès, les fonctions d’authentification et les huit fonctions de progression protégées sont inchangés. La preuve de périmètre vérifie aussi chaque nouveau fichier, sans exclusion générale de répertoire.
- Navigation locale Chromium : les 12 langues d’étude en L6 sur ordinateur et mobile, compteurs recalculés, photos conservées, entrées depuis l’accueil, voix et écoute simulées, progression après rechargement, comptes et verrouillage L2. Une fiche « À revoir » enregistrée avec son ancien thème retrouve le même identifiant dans sa destination, sans réinitialiser les fiches connues.
- Téléchargement corrompu, requête annulée et reprise après échec : rejet vérifié ; une annulation ne bloque pas la sélection suivante.

Commandes principales :

```sh
node --test melunga_deploy/tests/theme-edition.test.cjs melunga_deploy/tests/german-launch-layer.test.cjs
NODE_PATH=/opt/codex/cua_node/lib/node_modules node --test melunga_deploy/tests/imported-targets.browser.cjs
```

Les comptes rendus et captures de cette vérification sont joints dans ce dossier. Les tests utilisent des réponses locales : aucun paiement, compte réel, appel audio Google ni appareil physique n’a été utilisé. Le déploiement public n’est pas vérifié : l’environnement autorise GitHub mais n’a pas d’accès réseau à Melunga ou Netlify.

L’activation des quatre nouvelles langues d’explication et la grille ordinateur affichant toutes les langues sur un écran sont décrites dans le [compte rendu précédent](../integration-langues-application-ru-pt-ar-hi/README.md).
