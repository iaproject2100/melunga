# Reproduire le contrôle indépendant

Le lecteur indépendant n’importe aucun module de génération. Il lit les preuves
brutes au commit annoncé, les compare octet pour octet avec Git et reconstruit les
valeurs attendues à partir des seuls événements entiers. Son fonctionnement par
défaut ne produit aucun fichier.

```sh
python3 tools/maquette-guidee/check_conventions_independent.py --self-test --check-report
python3 tools/maquette-guidee/check_levels_independent.py --base-ref origin/main --check-report
```

La première commande vérifie cette couche et ses fautes négatives propres. La
seconde compare les après réels avant la projection privée convention → contenu
→ couches historiques → sources. Les empreintes publiées restent celles des
fichiers runtime réellement lus. Les copies privées ne réécrivent aucun fichier
et ne modifient pas le pack fourni par l’appelant.

Pour mettre à jour uniquement les rapports appartenant au lecteur, après une
modification explicite de ses preuves ou de son code :

```sh
python3 tools/maquette-guidee/check_conventions_independent.py --self-test --write-report
```

La contrelecture linguistique documente séparément les erreurs et les demandes
de réexamen. Un contrôle mécanique réussi démontre la fidélité aux littéraux
figés ; il ne certifie pas leur prononciation native. Les propositions de
substitution ne sont jamais utilisées pour fabriquer une aide nouvelle.
