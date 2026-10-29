# Aperçu des longues rubriques, actualisé sur le main courant

La branche `review/sequences-longues` du 26 octobre est mise à jour avec le `main` **`f25250627f94334fd097a4eed0d4da814d65561f`**, qui inclut la présentation ordinateur approuvée, les thèmes latéraux, le bouton Voix et la progression actuelle. Le raccordement se fait dans cette branche de revue, sans fusion vers `main` ni publication de cette fonctionnalité sur le site principal.

Les rubriques de **plus de 100 cartes** s’ouvrent sur un choix d’étapes de **30 à 40 cartes**. Les groupes techniques préparés restent entiers ; aucune carte ni étape guidée n’est déplacée, ajoutée ou réécrite. Les rubriques de 100 cartes ou moins gardent l’entrée directe existante.

Le contrôleur reprend le même partitionneur déterministe que `899f36b`, désormais intégré au fichier courant plutôt que chargé comme une ressource supplémentaire. Les deux pages gardent le chargement actuel, avec contrôleur 42 et CSS 18 ; les voix, droits et outils de paiement restent inchangés.

## Aperçus réels à comparer

Les images viennent du navigateur exécutant le code de cette branche. La palette rose est sélectionnée par le bouton d’ambiance d’origine. Le statut payant est une simulation locale explicite, nécessaire pour voir la rubrique longue complète ; aucun compte réel n’est utilisé.

| Écran | Choix des étapes | Leçon | Progression après la première étape |
| --- | --- | --- | --- |
| Mobile 390 × 844 | [Voir](choix-fr-es-L2-390.png) | [Voir](lecon-fr-es-L2-390.png) | [30 / 30 acquises](progression-premiere-etape-fr-es-L2-390.png) |
| Ordinateur 1600 × 900 | [Voir](choix-fr-es-L2-1600.png) | [Voir](lecon-fr-es-L2-1600.png) | [30 / 30 acquises](progression-premiere-etape-fr-es-L2-1600.png) |

[Télécharger les six aperçus en PDF](apercus-mobile-ordinateur.pdf).

Le premier exemple est la rubrique espagnole L2 « Poser et reprendre une question », dont les **309 cartes** deviennent **9 étapes : 30, 35, 35, 35, 35, 35, 35, 35 et 34 cartes**. L’exemple chinois L10 « Adjectifs » conserve ses **387 cartes**, réparties en **11 étapes** (dix de 35 puis une de 37). Des captures chinoises et coréennes sont également présentes dans ce dossier.

La capsule « Étape x / y » reste visible pendant la leçon et permet de revenir au choix des étapes. La fin d’étape propose de continuer avec la suivante. Le compteur de leçon et sa barre restent propres à l’étape courante.

La progression affichée sur chaque étape est calculée depuis les **cartes acquises déjà enregistrées**, sans nouvelle clé de stockage ni acquisition inférée à partir d’une visite. « À revoir » garde la carte à retravailler ; la progression enregistrée du niveau conserve sa logique actuelle.

## Conservation et validations

L’audit exhaustif examine **8 800 thèmes** des 42 paires et trouve **302 rubriques longues**, soit **1 457 étapes** : les 67 rubriques des cours revus et les 235 rubriques des cours natifs supplémentaires. Les occurrences et l’ordre des identifiants, tous les objets de pas, les métadonnées, titres et photos sont conservés. Les **78 JSON progressifs, 8 JSON natifs, 33 images publiées, droits et constructeur natif** sont identiques au main de référence. Les 42 premières leçons L1 restent courtes et gardent leur entrée directe.

Résultats sur les sources finales :

- **5 tests Node** de conservation et de partition, 125 empreintes stables (`conservation.json`).
- **8 groupes / 18 cas navigateur**, 169 empreintes stables : sélection, fin et étape suivante, acquis persistants, « À revoir », données locales malformées, reprise après erreur, droits gratuits/payants, Pinyin, cours coréen, redimensionnement et contexte interlocuteur (`acceptance.json`, `BROWSER_QA.md`).
- **16 cas de lisibilité**, **12 cas de démarrage**, **6 groupes / 29 cas d’entrée et d’accès**, tous réussis. Les comparaisons mobiles et contenus des thèmes restent strictes ; les conteneurs cachés sont comparés par leur texte visible.
- **6 tests de progression par Suivant**, **12 tests de sources/audio serveur**, **15 tests d’intégration audio**, et validations des couches de source/routage/ressources d’entrée réussis.

Le contrôleur final porte le SHA-256 `a4d3864167810eb352c8cfbe55b02a1732135b9c6abeb5e1f48217d37f8c436b` et le CSS `4654ab18b4724ed7f28463ce8e480c6ec58672eb5e6866449a1757fed62fdfca`. L’inventaire fini reste de 13 fichiers modifiés et 11 ajoutés ; quatre empreintes sont actualisées et les vingt autres sont conservées. Les sept fonctions de progression protégées et `validateNextPhrase()` sont inchangées.

Les vérifications utilisent Chromium local avec tailles et gestes émulés, des réponses d’accès/catalogue explicites et un lecteur audio instrumenté. Aucun compte réel, paiement ou fournisseur audio n’est sollicité ; pas d’essai matériel ni Safari. Les preuves du 26 octobre restent historiques dans `docs/sequences-visibles`.

## Reproduire les vérifications ciblées

```sh
LONG_SEQUENCES_CONSERVATION_REPORT=docs/sequences-longues-actualisees/conservation.json \
  node --test melunga_deploy/tests/long-sequences-partition.test.cjs
LONG_SEQUENCES_CURRENT_REPORT_DIR=docs/sequences-longues-actualisees \
NODE_PATH=/tmp/melunga-review-tools/node_modules:/opt/codex/cua_node/lib/node_modules \
  node melunga_deploy/tests/long-sequences-current.browser.cjs
python3 docs/sequences-longues-actualisees/export_apercus.py
```
