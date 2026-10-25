# Outils du lot 3 — trace, pas applicateur

- `cands.py` découpe le pinyin en syllabes ; il a servi à **chercher des candidats** (familles E, F, G) dans les cellules, que j'ai ensuite alignés à la main.
- `decisions.py` contient mes décisions explicites, avant et après entiers.
- `make_register.py` et `make_rest.py` écrivent les JSON du dossier et refusent tout avant qui diffère de l'édition `3df885d`.

Aucun de ces scripts n'écrit dans `melunga_deploy/`. Ils ne doivent pas servir à corriger de nouvelles cartes : le générateur consomme les avant/après figés du registre.
