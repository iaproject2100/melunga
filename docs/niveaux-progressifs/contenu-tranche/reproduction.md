# Reproduction de la vérification indépendante

Depuis la racine du worktree de revue :

```sh
python3 -B tools/maquette-guidee/build_levels.py --check
python3 -B tools/maquette-guidee/check_uncertain_content_independent.py --self-test --write-report
python3 -B tools/maquette-guidee/check_uncertain_content_independent.py --self-test --check-report
python3 -B tools/maquette-guidee/check_levels_independent.py --base-ref origin/main --write-report
python3 -B tools/maquette-guidee/check_levels_independent.py --base-ref origin/main --check-report
```

Le premier outil compare les sorties du générateur aux fichiers existants. Le vérificateur propre à cette tranche importe le lecteur indépendant historique, puis reconstruit son attendu à partir des 77 documents de données Git figés et du manifeste, sans importer de module de génération. Sa suite négative couvre uniquement la couche nouvelle ; elle ne déclenche pas les 196 scénarios historiques.

La preuve source reste l’objet Git `17b003810a15954d933f49decc2bafa53de8d881:docs/revue-integrale/contenu-incertain/registre-contenu.json`, SHA-256 `0276ad1dac00161a6619de315d22d558f65b55a8821f3ddab95a1f10ad9a9e02`. Ses 638 événements sont tous audités ; 637 sont exécutés. L’événement entier `catalogue:it:1239` (211) est officiellement retiré par l’erratum auteur `4247ca470354f59ea37992608b38e3728a6e22f9` et reste dans son état avant. Cet erratum fournit également l’aide finale entière de `catalogue:ko:3637`, après le bloc initial, et confirme les blocs seuls `catalogue:es:3353` et `catalogue:ko:3767`. Les deux preuves figées sont vérifiées indépendamment. Aucune chaîne de remplacement n’est inventée.

La validation compare les objets réellement lus avec les après autorisés et avec chaque champ inchangé, avant de construire une projection privée vers la couche historique. Elle conserve les annotations précédentes, les positions exactes, les copies de transport, les modèles reçus, les rôles, les étapes et les droits. Les champs d’étude, de glose, d’aide et de lecture des blocs sont vérifiés ensemble ; un bloc de ponctuation ne permet pas de modifier ses champs inchangés ni son statut phonétique.

Les compteurs de concepts sont recalculés indépendamment depuis les phrases et les références de révision et de contexte. Sept compteurs changent : trois écarts hérités et quatre créés par les nouvelles équivalences de contenu. La projection historique restaure seulement les valeurs de compteurs figées nécessaires aux inversions historiques, après avoir prouvé les valeurs réellement servies.

Les fichiers `verification-independante.json` et `.md` enregistrent les empreintes des fichiers runtime réels, les 654 occurrences / 887 champs exécutés et les scénarios négatifs. Les fichiers `contrelecture-linguistique-independante.json` et `.md` distinguent la fidélité mécanique aux décisions de la qualification linguistique. La copie exacte d’un choix contextuel ne prouve pas que toutes les variantes rejetées seraient fautives.
