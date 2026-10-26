# Réponse à la relecture phonétique de Claude

**État du 25 octobre 2026 :** le compte rendu de Claude à `d4eaea3` rapporte le refus par Kartech du doublement automatique `s → ss`. Les treize propositions espagnoles, jamais appliquées, sont **archivées et retirées de la file active**. Les mesures et avant/après ci-dessous restent des traces de la passe précédente ; ils ne constituent plus une demande d’application. Le [nouveau suivi](../reponse-revue-integrale-lot1/README.md) fait foi pour la suite.

Lot examiné : `90a3433`. Relecture de Claude : `295adf3`.

Ce dossier prépare la réponse et les corrections à relire. **Aucun changement n’est appliqué aux cartes, aux ledgers ou à l’aperçu validé.** Une proposition de correction n’est pas une validation phonétique. Les conventions du catalogue historique ne sont pas réécrites par ce dossier.

## Périmètre réconcilié

Les 87 JSON et les 2 965 occurrences portant `phon` sont reproduits. Les **334 sans statut sont des copies exactes du catalogue** : 223 nombres et 111 phrases L1, avec 1 144 champs comparés et zéro écart. Leurs 334 qualifications de copie proposées sont fournies, localisateur et preuve à l’appui.

Les **1 715 occurrences `pending-Claude`** ne sont pas 1 715 créations indépendantes :

`1 715 − 30 copies du complément chinois − 16 renvois lexicaux − 1 aide entière reprise = 1 668 entrées nouvelles à relire`.

Les seize renvois restent à relire à leur source nouvelle ; ils ne sont pas comptés deux fois. Une copie exacte n’est pas réputée correcte linguistiquement.

Preuves : [périmètre détaillé](perimetre-aides.md), [334 localisateurs et comparaisons](perimetre-aides.json).

## Mesures de Claude reproduites sur sa référence complète

La copie locale de travail ne contient plus les 70 conversations L1–L10 dans l’ancien chemin produit. Remplacer ce chemin par les sept snapshots L1 changerait le lexique de référence et les résultats. La reproduction utilise donc un arbre isolé figé à `295adf3`, contenant les 70 conversations, et les trois scripts originaux de Claude. Leur seul ajustement est de fixer le lot lu par `phon1.py` à `90a3433` plutôt qu’à une référence distante mutable.

Les catalogues `DECKS` de ces deux commits sont identiques, empreinte canonique `2fd6735db365ab869d8426bf879ef0106418698fbb9307b0eca60a5549b89d2a`.

| Couple | Rendus comparables | Différences graphiques |
|---|---:|---:|
| fr→en | 401 | 16 |
| fr→es | 723 | 127 |
| fr→it | 379 | 43 |
| zh→fr | 236 | 36 |
| fr→zh | 957 | 28 |
| fr→ko | 1 784 | 521 |
| **Total** | **4 480** | **771** |

Les **4 079** annoncés correspondent exactement au total **sans fr→en**. Il faut préciser ce périmètre dans le chiffre, plutôt que mélanger les deux totaux. Le japonais n’a pas de décompte d’alignement automatique fiable dans `phon3.py`.

Le nombre de mots/syllabes et le nombre de jetons peuvent coïncider sans que les frontières ou contextes soient comparables. Les écarts sont des pistes de contrôle, pas autant de fautes. De plus, les JSON originaux des scripts n’exportent que les huit/dix groupes les plus fréquents ; les totaux imprimés et les listes exportées n’ont pas la même portée.

Résultats, sorties originales et empreintes : [reproduction-claude.json](reproduction-claude.json).

## Corrections ciblées proposées entières

[corrections-ciblees-proposees.json](corrections-ciblees-proposees.json) contient **25 aides complètes avant/après**, chacune rattachée à sa ligne source et à son empreinte. Elles restent `proposed-pending-Claude`.

- **Français pour sinophones : 20 occurrences de « les » dans 19 aides**, contre 15 détectées par l’alignement automatique. Les cinq autres se trouvent dans des phrases exclues par son filtre : élisions ou ponctuation chinoise sans blanc. La proposition remplace uniquement le caractère autonome qui représente « les » ; elle ne touche pas le même caractère dans « plaît », « téléphone », « délai », etc. Les liaisons en 蒂勒 et le repère 桑 pour « sans » restent intacts.
- **Chinois pour francophones : six aides contenant 预/愉**, contre trois occurrences détectées par l’alignement. La proposition enlève le `y` supplémentaire pour ces syllabes. La graphie de **约**, `yué` dans ces mêmes aides contre `ué` dans des sources, est une question distincte explicitement laissée à Claude ; elle n’est pas modifiée par extension silencieuse de la correction.

Ce sont des révisions proposées de formes existantes, pas 25 cartes supplémentaires. Le préparateur vérifie aussi que les 170 fichiers protégés — 87 sources, 78 JSON d’exécution, application classique et quatre fichiers d’interface — restent identiques au lot.

Avec les trois propositions coréennes et les treize espagnoles, le dossier comporte
**41 aides entières proposées**, chacune contrôlée contre sa source réelle.
Les choix de convention conditionnels restent identifiés comme tels ; ce nombre
n’est pas un compteur de fautes certaines ni de cartes ajoutées.

## Coréen et espagnol/italien

L’examen contextuel coréen et les propositions d’aides entières sont dans [coreen.md](coreen.md). Il distingue les contrastes attendus — début de mot, contexte voisé, tension après finale, aspiration avec ㅎ — des incohérences de la nouvelle rédaction et du mélange avec les imports historiques. **521 différences avec le catalogue ne prouvent pas 521 erreurs.** La règle de rédaction doit toutefois être explicite et sa coexistence avec les anciennes sources reste à traiter.

Le contrôle espagnol/italien est dans [espagnol-italien.md](espagnol-italien.md). Le filtre qui retrouve 55/317 et 686/4 672 n’est pas fourni par les trois scripts de Claude ; sa reproduction doit donc être présentée comme une hypothèse explicitée. La règle de lecture francophone `/s/ → ss` demande une portée précise et des vérifications dans les mots concernés. `oun/ounn`, `kon/konn` et l’espagnol `é/è` sont des conventions à décider, sans effacer la distinction italienne `é/è`.

La migration des aides du catalogue historique n’est pas engagée ici. Une fois les règles et les corrections relues, elle devra former un lot identifié avec inventaire, avant/après et contrôle de conservation du reste des champs. Les niveaux d’accès, prix et abonnements ne font pas partie de cette décision phonétique.

## Rejouer les vérifications

Depuis la racine du dépôt :

```sh
python3 -B docs/niveaux-progressifs/reponse-relecture-phonetique/perimetre-reproduire.py
python3 -B docs/niveaux-progressifs/reponse-relecture-phonetique/prepare_corrections_ciblees.py --check
python3 -B docs/niveaux-progressifs/reponse-relecture-phonetique/verifier_propositions.py
python3 -B docs/niveaux-progressifs/reponse-relecture-phonetique/reproduire-espagnol-italien.py
git worktree add --detach /tmp/melunga-claude-reference 295adf3
python3 -B docs/niveaux-progressifs/reponse-relecture-phonetique/reproduire_claude.py --reference-tree /tmp/melunga-claude-reference --check
```

Le premier script ne réécrit que sa preuve dans ce dossier. Les deux modes `--check` refusent une preuve périmée ; aucun ne corrige le produit. Les contrôles linguistiques restants ne sont pas remplacés par ces vérifications mécaniques. Rien à fusionner ni publier.
