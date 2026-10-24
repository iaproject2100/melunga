# Thèmes L1–L10 — contenu corrigé et enrichi

L’aperçu conserve l’architecture validée : un niveau, des thèmes illustrés et
numérotés, puis la pratique en un clic, sur mobile et ordinateur. Le menu à
quatre carrés reste le menu des rubriques. La page est
`melunga_deploy/parcours-niveaux.html` ; elle ne remplace pas l’application publiée.

## Corrections visibles

- Les situations contiennent des phrases entières ; le vocabulaire, les nombres
  et les modèles incomplets sont distincts.
- Les couleurs ont leur rubrique. Les adjectifs demandés sont présents : taille,
  poids, beauté, émotions puis caractère, avec les formes propres à chaque langue.
- Maison et mobilier, Nature/jardin/météo et Loisirs/culture ont un classement
  explicite et des visuels distincts.
- « Saludos a tu familia » rejoint les salutations, et « Salirse con la suya »
  les expressions d’action, hors du voyage.
- Chaque thème affiché contient au moins six concepts pertinents. Les formes
  masculine/féminine liées ne servent pas à gonfler artificiellement ce minimum.
- Les révisions portent un badge et un compteur séparé ; elles précèdent les
  nouveautés. Elles viennent uniquement d’un niveau antérieur de la même famille.
- La progression numérique commence par 0–10, puis 11–100 et les premiers ordinaux,
  avant les grandes quantités et les fractions. Les systèmes coréens restent distincts.
- Les huit repères de position chinois de base sont introduits en L1. Les
  relations de justification et de registre formel arrivent ensuite selon leur fonction.

## Périmètre exact de ce lot

| Contenu | Quantité |
|---|---:|
| Couples × niveaux | 7 × 10 |
| Cartes originales conservées une fois | 32 115 |
| Champs originaux comparés, sans écart | 110 277 |
| Phrases entières reprises des sources conversation | 43 |
| Nouvelles entrées entières | 140 |
| Entrées canoniques au total | 32 298 |
| Entrées canoniques dans les thèmes visibles | 31 436 |
| Modèles incomplets ou cas incertains en réserve | 862 |
| Thèmes affichés d’au moins six concepts | 1 432 |
| Références de révision, hors nouveautés | 7 402 |
| Thèmes trop légers gardés hors écran | 0 |

Les 140 ajouts comprennent 134 entrées de vocabulaire et
6 formes de zéro absentes de leur stock. Leurs 139 nouvelles aides entières sont
proposées à Claude ; l’aide de l’anglais « light » est reprise du mot source entier
pour un sens adjectival distinct. Aucun mot ni aucune phonétique ne sont extraits
par découpage d’une phrase.

## Progression : ce qui est établi et ce qui ne l’est pas

1 226 cartes possèdent une décision explicite de placement ou d’introduction ;
30 889 conservent encore leur niveau source sans relecture individuelle de ce niveau.
L’examen des thèmes et leur densité ne certifient donc pas toute la progression
du catalogue. Les classifications encore candidates restent marquées comme telles.
Les modèles réservés sont conservés, sans exercice ni audio de production.

Les 295 liens de construction déclarés sont ordonnés ou préparés localement.
Les liens lexicaux, les contextes absents et les réserves restent documentés :
le dossier ne déclare pas tous les prérequis clos. Un ordre conseillé ne prouve
pas ce que la personne a parcouru ou acquis, puisque les thèmes restent libres.
Les reprises ne sont pas comptées comme de nouvelles cartes.

## Qui vérifie quoi

Codex prend en charge les sens, les regroupements, les niveaux, les préparations
et les enrichissements. **Claude vérifie uniquement la phonétique**, conformément
à la précision de Kartech. La conservation verbatim d’une aide ancienne ne prouve
pas sa conformité à la méthode. Les nouvelles aides restent `pending-Claude`.

- [Compte rendu chiffré](classement.md) et [cadre pédagogique](README-pedagogique.md).
- [Corrections de thèmes et preuves sources](corrections-themes/README.md).
- [Liste des nouvelles entrées à vérifier en phonétique](corrections-themes/enrichissements-rediges.md).
- [Message prêt pour Claude](message-pour-claude.md).
- [Contrôle indépendant](verification-independante.md) et [contrôle navigateur](verification-navigateur.json).

## Inspiration et accès

La recherche chez Babbel, Busuu, Duolingo, Memrise et Pimsleur couvre 13 pages
publiques officielles, 18 pistes et 54 appuis Melunga exacts. Elle inspire les
fonctions et thèmes ; elle ne prouve pas une efficacité comparée et ne consiste
pas à recopier un cours concurrent. Voir [les sources](recherche-concurrents/README.md).

Les niveaux éditoriaux n’écrivent jamais le `lv` du catalogue. `isFreeCard` teste
`lv === 1` : changer ce champ déplacerait la frontière gratuit/payant.
Les 2 134 identités source L1 restent conservées. Aucun prix, abonnement,
compte ou droit de production n’est modifié.

L’aperçu #14 reste un brouillon, sans fusion ni publication sur melunga.com.
Les essais navigateur sont locaux, avec des écrans simulés ; ils ne constituent
pas un essai sur téléphone physique ou sur le déploiement Netlify.

## Reproduire

```sh
python3 -B tools/maquette-guidee/inventory_levels.py --check
python3 -B tools/maquette-guidee/assemble_decisions.py --check
python3 -B tools/maquette-guidee/build_visuals.py --check
python3 -B tools/maquette-guidee/build_number_progression.py --check
python3 -B tools/maquette-guidee/check_authored_enrichments.py
python3 -B tools/maquette-guidee/build_levels.py --check
python3 -B tools/maquette-guidee/check_levels_independent.py --check-report --require-visuals --strict-editorial --require-no-held --self-test
NODE_PATH=/tmp/melunga-review-tools/node_modules node --test melunga_deploy/tests/levels-themes.browser.cjs
```

Le chemin Playwright correspond à cet environnement ; ailleurs installer
`playwright-core` et fournir `CHROMIUM_PATH` si nécessaire.
