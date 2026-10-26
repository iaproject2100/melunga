# Reproduire le contrôle indépendant

```sh
python3 -B tools/maquette-guidee/check_all_classification_independent.py --self-test --write-report
python3 -B tools/maquette-guidee/check_levels_independent.py --require-visuals --strict-editorial --require-no-held --classification-self-test
```

Le lecteur n’importe aucun producteur. Il contrôle l’édition réelle complète avant de fournir une copie privée de l’édition historique aux contrôles antérieurs. Les tests négatifs restent en mémoire.
