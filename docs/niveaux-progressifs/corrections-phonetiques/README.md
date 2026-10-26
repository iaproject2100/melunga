# Corrections phonétiques de Claude — génération durable

**Suite au lot 3 :** une [couche distincte](lot3/README.md) s’applique après
ce registre, qui reste intact. Elle contient 90 aides et cinq corrections
explicites de Pinyin. Les chiffres et invariants ci-dessous décrivent cette
première couche ; les cinq lectures du lot suivant sont des exceptions
nommément déclarées à la conservation des lectures.

Ce dossier relie les registres relus de `dfc665b` à la fabrication du parcours
d’aperçu, sans modifier les sources historiques ni l’interface validée.

## Périmètre exact

- **774 événements de correction**, issus des deux registres de Claude : 736 B/C et 38 D.
- **772 cartes distinctes** : les cartes chinoises 175 et 1032 reçoivent successivement B puis D.
- **786 occurrences corrigées ensemble** : 772 cartes canoniques et 14 copies de transport.
- Répartition des cartes : fr→zh 459, fr→ko 260, fr→es 36, zh→fr 17.
- Règles finales par carte : B 717, C 17, D 36, B+D 2.

Les deux copies d’évidence sont conservées au caractère près et leurs empreintes
sont fixées dans le producteur et, séparément, dans les contrôles indépendants.
Le registre local déclare l’avant entier, la provenance, les profils des copies
et l’après autorisé. Il ne déduit pas de nouvelles aides par une expression régulière.
La règle A de doublement automatique du `s` est exclue.

## Fonctionnement

1. `build_levels.py` reconstruit les cartes originales et effectue ses contrôles
   habituels de source, d’identité, de type, de placement et d’accès.
2. `phonetic_corrections.py` applique les seuls événements du registre sur les
   sorties en mémoire, avant leur écriture. Il cherche les identifiants dans les
   cartes et les banques de transport, et refuse une valeur avant inattendue.
3. Chaque modification reçoit une annotation `phoneticCorrection` avec l’empreinte
   du registre, l’aide et le statut antérieurs, la règle et le commit d’évidence.
   La provenance originale `source` reste intacte ; elle n’est pas présentée comme
   la source de la nouvelle aide.
4. Le manifeste et les empreintes des banques décrivent la même édition corrigée.

Une régénération repart donc toujours des origines vérifiées, puis réapplique
les corrections déclarées. Elle ne les efface plus. Les copies réutilisées dans
un niveau ultérieur emploient la même aide que la première présentation.

Les positions de fichiers consignées dans le registre sont les preuves du
snapshot de départ. Le routage se fait par couple et identifiant, pour permettre
un futur reclassement pédagogique autorisé sans perdre la correction. Les autres
contrôles continuent de vérifier ce reclassement.

Le mode `make(include_situations=False)` sert seulement à reconstituer un état
historique de comparaison pour la préparation des situations ; il garde les
origines, sans couche de correction. Il ne constitue pas une édition servie du
parcours courant : le contrôle indépendant refuserait son manifeste sans registre.

## Contrôles indépendants

Le vérificateur Python n’importe pas le producteur. Il contrôle d’abord les
preuves figées, les événements ordonnés, chaque après exact et chaque annotation
dans les fichiers réellement produits. Il rejoue ensuite les anciens contrôles
de provenance sur une copie interne projetée vers l’avant. Cette projection ne
restaure jamais la provenance et ne modifie pas le pack appelant.

Le rapport distingue les champs des sources originales et les aides corrigées,
et conserve les empreintes des fichiers d’exécution réels. Les tests navigateur
attendent l’après corrigé affiché, pas la projection utilisée pour vérifier les sources.

```sh
python3 -B tools/maquette-guidee/build_levels.py --check
python3 -B tools/maquette-guidee/check_levels_independent.py --check-report --require-visuals --strict-editorial --require-no-held --self-test
NODE_PATH=/tmp/melunga-review-tools/node_modules node --test melunga_deploy/tests/phonetic-corrections.cjs
```

## Limites

Ce lot reprend des modifications précises de Claude, dont les 38 aides D et
leurs 41 segments ont été relus en contexte dans le [dossier chinois](../reponse-revue-integrale-tour2/chinois.md).
Il ne valide pas toute la phonétique ni tous les niveaux. Les conventions
chinoises encore ouvertes, les deux répliques reçues « les » omises et les
propositions de reclassement L2 restent des sujets séparés.

Les textes étudiés, traductions, Pinyin/lectures, niveaux, thèmes, identifiants,
types de carte, prix et droits d’accès restent inchangés par cette couche.
Le catalogue historique de 32 115 cartes et ses 110 277 champs restent intacts.
La correction s’applique aux données du parcours d’aperçu ; elle ne publie rien
dans `main` ni sur melunga.com.
