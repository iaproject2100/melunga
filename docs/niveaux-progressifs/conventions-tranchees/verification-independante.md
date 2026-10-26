# Vérification indépendante des conventions tranchées

Les 2 120 enregistrements sources sont contrôlés depuis les octets Git figés : 2 099 événements et 21 après-contenu. Ces derniers remplacent 17 événements et ajoutent quatre identités. Trois événements antérieurs sont remplacés officiellement par le bloc de contenu : leur tuple approuvé est conservé entier. La sélection effective compte 2 100 identités et 2 122 références sources acceptées, dont cinq remplacements entiers attestés par l’erratum batchim d5ad5e4.

Le contrôle compare les 70 cellules et sept banques complètes, puis le manifeste : 2 167 objets (2 099 canoniques, 66 copies et deux modèles reçus). Seuls l’aide, son statut et son annotation changent. Les 69 exclus et trois événements remplacés restent protégés dans leurs 78 objets. La matrice croise les 638 décisions de contenu avec les événements initiaux, les 21 après-contenu et les 69 exclus ; les trois chevauchements exclus ne changent que le sens approuvé en contenu.

Les objets réels, types JSON, annotations antérieures, rôles reçus, emplacements et étapes sont vérifiés avant toute projection privée convention → contenu → historique. Aucune génération ni conversion phonétique n’est importée par ce lecteur.

Tests négatifs propres à cette couche : **45 fautes rejetées**. Le résultat ne constitue pas une certification native ou phonétique globale.

La [contrelecture linguistique](contrelecture-linguistique-independante.md) a repéré cinq erreurs sources matérielles, toutes résolues par l’erratum entier officiel. Les autres observations restent qualifiées. La fidélité mécanique aux événements figés ne vaut pas approbation linguistique de chacun de leurs littéraux.

Reproduction :

```sh
python3 tools/maquette-guidee/check_conventions_independent.py --self-test --check-report
python3 tools/maquette-guidee/check_levels_independent.py --base-ref origin/main --check-report
```

SHA du registre : `3058f970810166d471607251a2544cb7cdb73e50422794a8bbbedbd613b62705`.
SHA des fichiers runtime réels : `cc705898cc9a35f45e14189b7dec9a6f86d8be2f9292cb84b61c032b0210673b`.
