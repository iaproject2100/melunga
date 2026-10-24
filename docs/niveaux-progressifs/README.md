# Thèmes L1–L10 — classement et enrichissement de l’offre

L’aperçu conserve l’architecture validée : niveau, thèmes illustrés et numérotés,
puis pratique en un clic sur mobile et ordinateur. Les quatre carrés ouvrent
le menu. La page `melunga_deploy/parcours-niveaux.html` reste un aperçu distinct
de l’application publiée sur melunga.com.

## Du contenu supplémentaire, au-delà du classement

Les **32 115 cartes** désignent le catalogue d’origine conservé, pas un objectif
figé. Deux lots de rédaction le complètent :

- Le premier apporte **140 entrées lexicales/numériques** : 134 mots et locutions,
  six zéros manquants. Ses 139 aides nouvelles et une aide de mot entier reprise
  restent identifiées séparément.
- Le second apporte **454 phrases entières réellement rédigées**, parmi
  560 positions de pratique. Les 106 autres positions réemploient 79 cartes
  du catalogue et 27 anciens énoncés de conversation, sans prétendre les créer.
- Dix nouveaux thèmes de huit phrases sont déclinés dans les sept couples :
  **70 nouvelles rubriques**, chacune avec ses huit intentions au même niveau.

| Niveau | Nouveaux thèmes |
|---|---|
| L2 | Repas : préférences et alternatives ; Numérique : accéder et rester en contact |
| L3 | Hôtel : organiser son séjour ; Loisirs : choisir et organiser une sortie |
| L4 | Transport : raconter un imprévu et repartir ; Études : raconter un apprentissage réussi |
| L5 | Paiements : vérifier un problème et le régler ; Service client : obtenir et suivre une solution |
| L6 | Invitations : poser une limite et expliquer son choix ; Sortie nature : gestes écologiques utiles |

Ces créations s’inspirent de 13 pages officielles Babbel, Busuu, Duolingo,
Memrise et Pimsleur. Le dossier relie URL, idée observée et adaptation originale ;
il ne recopie pas des cours et ne prétend pas mesurer leur efficacité comparée.

## Comptage sans gonflement

| Périmètre | Entrées canoniques |
|---|---:|
| Catalogue historique intact | 32 115 |
| Anciennes conversations reprises, premier lot | 43 |
| Entrées lexicales/numériques rédigées | 140 |
| Anciennes conversations reprises, second lot | 27 |
| Phrases entières rédigées, second lot | 454 |
| **Total dans l’aperçu** | **32 779** |

Les 79 cartes catalogue utilisées dans les nouvelles situations existent déjà
sur la première ligne : elles ne sont pas ajoutées une seconde fois.
Les révisions et les 31 références de réemploi en contexte ne créent pas de cartes.
Les banques sont des copies de transport, avec une seule identité canonique.

Le total comprend **31 917 entrées dans les thèmes visibles** et
**862 modèles incomplets/cas incertains en réserve**, conservés sans exercice de production.
Il y a **1 502 thèmes affichés d’au moins six concepts** et aucun thème
retenu hors écran pour manque de contenu. Les nouveaux thèmes en ont huit.

## Progression et conservation

Les situations contiennent des prises de parole entières ; vocabulaire, couleurs,
adjectifs et nombres sont séparés. Les adjectifs commencent par grand/petit,
puis les propriétés physiques et émotions ; les formes attestées restent groupées.
Les nombres commencent par 0–10, puis les composés, ordinaux, fractions et quantités.

Dans les anciennes rubriques, les révisions précèdent les nouveautés. Dans les
dix nouvelles situations, les phrases suivent **01→08 du plan**, primaires et
réemplois mêlés, pour passer du besoin à la résolution. Chaque phrase est
comprise, imitée puis rappelée ici : un réemploi ne suppose pas un acquis.
Les mots et les phonétiques ne sont jamais fabriqués par découpage ou collage.

Les **110 277 champs originaux** sont conservés sans écart. Les 1 274 cartes
avec décision explicite ne représentent pas toute la revue : **30 841 niveaux source**
restent sans relecture individuelle. La densité d’une rubrique ne valide pas
sa progressivité ; les prérequis non clos restent nommés dans le compte rendu.

## Claude : la phonétique uniquement

Codex assume les sens, les formes, les rôles, le classement, les niveaux et les
préparations. Claude vérifie uniquement la méthode phonétique.

- [139 aides lexicales nouvelles et une aide reprise](corrections-themes/enrichissements-rediges.md).
- [454 aides de phrases entières nouvelles](enrichissement-situations/nouvelles-phrases-a-relire.md).
- [Message prêt pour Claude](message-pour-claude.md).

Au total, **593 aides entières nouvelles** attendent son contrôle. La copie exacte
d’une aide ancienne ne prouve pas sa conformité à la méthode.

## Dossiers et contrôles

- [Dix thèmes et source des idées](enrichissement-situations/README.md),
  [traçabilité des sources](enrichissement-situations/tracabilite-sources.json),
  [contrat de conservation et réemploi](enrichissement-situations/CONTRAT.md).
- [Premières corrections de thèmes](corrections-themes/README.md),
  [politique mots/phrases](politique-vocabulaire-phrases.md),
  [cadre pédagogique](README-pedagogique.md), [compte rendu chiffré](classement.md).
- [Contrôle indépendant](verification-independante.md) et
  [contrôle navigateur](verification-navigateur.json), liés aux fichiers exacts contrôlés.

Les niveaux éditoriaux n’écrivent jamais le `lv` original. `isFreeCard` teste
`lv === 1` : changer ce champ déplacerait la frontière gratuit/payant.
Les 2 134 identités source L1 sont conservées ; prix, abonnements, comptes et
droits de production restent inchangés.

Aucune fusion ou publication sur melunga.com n’est autorisée par ce dossier.
Les tests navigateur sont locaux et utilisent des tailles d’écran simulées,
pas un téléphone physique ni un parcours sur l’hébergement Netlify.

## Reproduire

```sh
python3 -B tools/maquette-guidee/inventory_levels.py --check
python3 -B tools/maquette-guidee/build_visuals.py --check
python3 -B tools/maquette-guidee/check_authored_enrichments.py
python3 -B tools/maquette-guidee/build_number_progression.py --check
python3 -B tools/maquette-guidee/prepare_situation_catalogue.py --check
python3 -B tools/maquette-guidee/render_situation_review.py --check
python3 -B tools/maquette-guidee/build_levels.py --check
python3 -B tools/maquette-guidee/check_levels_independent.py --check-report --require-visuals --strict-editorial --require-no-held --self-test
NODE_PATH=/tmp/melunga-review-tools/node_modules node --test melunga_deploy/tests/levels-themes.browser.cjs
```

Le chemin Playwright correspond à cet environnement ; ailleurs installer
`playwright-core` et fournir `CHROMIUM_PATH` si nécessaire.
