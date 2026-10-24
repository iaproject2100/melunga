# Niveaux et thèmes — premier lot de travail

Ce lot reprend la grille illustrée validée par Kartech : choisir un niveau et
un thème ouvre directement sa pratique, sur mobile et sur ordinateur. Il ajoute
la séparation demandée entre **situations**, **vocabulaire** et **nombres**, avec
des destinations **Adjectifs**, **Prépositions** et **Adverbes** par niveau.

L’entrée de la proposition est `melunga_deploy/parcours-niveaux.html`.
La maquette L1 déjà approuvée reste à `maquette-guidee.html` ; l’application
classique de production n’est pas remplacée par cette proposition.

## Ce qui est disponible pour revue

- Sept couples, dix niveaux : 70 fichiers chargés à la demande.
- 32 115 cartes source conservées une fois, avec 110 277 champs inchangés.
- 43 phrases entières reprises de sources conversation : 150 champs exacts,
  aucune phrase ni phonétique nouvelle composée.
- 22 364 énoncés, 8 738 entrées de vocabulaire et 207 nombres dans les rubriques
  actives ; 482 modèles incomplets et 367 cas incertains conservés en réserve.
- 518 propositions de changement de niveau, motivées et liées à leurs sources.
- Des cartes de vocabulaire par contexte et par classe grammaticale, présentes
  lorsque des entrées correspondantes existent ; chaque thème a son visuel.

**Le classement des 32 115 cartes par type n’est pas une validation de leur
progression.** Les 31 597 cartes sans décision explicite conservent un niveau
source encore non relu individuellement. Les affectations sémantiques et
grammaticales candidates restent identifiables, avec leurs raisons et leurs
incertitudes. Les rubriques vides sont signalées dans le rapport, puis traitées
par le cahier d’enrichissement ; elles ne sont pas annoncées comme remplies.

Les modèles réservés ne sont ni supprimés ni exercés. Une situation ne contient
aucune étape de mot isolé : les liens lexicaux sont des références distinctes.
Les reprises locales entre phrases entières préparent 295 liens de construction
dans l’ordre éditorial. L’accès aux thèmes est libre : cet ordre ne prouve pas
ce que la personne a effectivement parcouru ou acquis. La fermeture globale
des prérequis est explicitement fausse.

## À lire avec Claude

1. [Compte rendu chiffré et limites](classement.md).
2. [Séparation entre vocabulaire et phrases](politique-vocabulaire-phrases.md).
3. [Progression des trois rubriques grammaticales à enrichir](enrichissement-grammatical-a-preparer.md).
4. [Sept classifications candidates et cas inspectés](types-contenu/).
5. [Propositions de placement](decisions.json), [enrichissements sourcés](enrichissements.md)
   et [cadre pédagogique](README-pedagogique.md).
6. [Contrôle indépendant](verification-independante.md) et
   [contrôle navigateur local](verification-navigateur.json).

La conservation des phonétiques est vérifiée au caractère près. Leur conformité
à la méthode de Kartech est une revue distincte attendue de Claude. Treize
candidats présentant un conflit d’aide ou de sens sont gardés hors import.
Les adaptations des prépositions et descriptifs au japonais, coréen et chinois
doivent être jugées dans ces langues, sans transposer une grammaire française.

## Accès et diffusion

Les niveaux éditoriaux n’écrivent jamais le `lv` du catalogue.
`isFreeCard` utilise aujourd’hui `lv === 1` : modifier ce champ déplacerait la
frontière gratuit/payant. Les 2 134 identités source L1 restent conservées ; une
future intégration devra maintenir leurs droits où que la progression les place.
Ce lot ne change aucun prix, abonnement, compte ou droit de production.

L’aperçu est un travail à examiner, pas une livraison à fusionner. Les tests
navigateur sont locaux, avec des tailles d’écran simulées : ils ne constituent
ni un essai sur téléphone physique ni un parcours sur l’hébergement Netlify.

## Reproduire

Depuis la racine du dépôt :

```sh
python3 -B tools/maquette-guidee/inventory_levels.py --check
python3 -B tools/maquette-guidee/assemble_decisions.py --check
python3 -B tools/maquette-guidee/build_visuals.py --check
python3 -B tools/maquette-guidee/build_levels.py --check
python3 -B tools/maquette-guidee/check_levels_independent.py --check-report --require-visuals --strict-editorial --self-test
NODE_PATH=/tmp/melunga-review-tools/node_modules node --test melunga_deploy/tests/levels-themes.browser.cjs
```

Le chemin Playwright ci-dessus est celui de cet environnement ; ailleurs,
installer `playwright-core` et fournir `CHROMIUM_PATH` si nécessaire.
