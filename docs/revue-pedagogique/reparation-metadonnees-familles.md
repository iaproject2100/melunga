# Réparation des références éditoriales des familles

Préparation locale après la relecture Claude `99d027a`, sur la base `f277261`. Aucun envoi distant, fusion ou déploiement dans ce lot.

## Décision proposée et réalisée en local

Conserver `sourceIndex` et `currentLevel`, et les recalculer depuis la carte effectivement servie. Ces champs permettent une comparaison entre le classement du catalogue et celui du parcours guidé ; les supprimer ferait perdre cette information utile à la relecture.

- `sourceIndex` : position, à partir de zéro, de la **première** carte dont le texte `t` correspond exactement à `target`, dans `DECKS[langue]`.
- `currentLevel` : valeur `lv` de cette même carte dans le catalogue.
- `pathLv` : niveau de la famille guidée, conservé sans modification.

Le choix de la première occurrence reproduit `guidedPool()`, y compris lorsqu'un texte apparaît plusieurs fois. Ces deux métadonnées ne sont pas des prérequis, une mesure de compréhension ou un niveau de maîtrise. Leur réparation ne rend pas la progression pédagogique cohérente à elle seule : les écarts révélés restent à examiner dans le travail de séquençage.

## Mesure sur la base `f277261`

Sur 906 références : 853 indices et 613 niveaux de catalogue étaient inexacts. Au moins un des deux champs était faux pour **854 références**, et non 853. L'écart supplémentaire est `fr / L1_ETAT_C_EST / C'est ça.` : son indice était correct, mais son `currentLevel` valait 1 au lieu du niveau 2 de la carte servie.

Les 906 références correspondent désormais toutes à la première carte servie. La réparation seule laisse strictement identiques les sept catalogues, les textes sélectionnés, l'ordre des familles, leurs étapes, leurs niveaux guidés et les 906 cartes produites à l'exécution, annotations de parcours comprises. Aucun prérequis, verrou, activation de langue ou droit d'accès n'est ajouté.

## Entretien

Depuis la racine du dépôt :

```sh
python3 tools/pedagogy/refresh_family_metadata.py --check
python3 tools/pedagogy/refresh_family_metadata.py --write
python3 -m unittest discover -s tools/pedagogy -p 'test_*.py'
```

Sans option, le script contrôle seulement. Il sort avec le code 1 si des écarts existent, et avec le code 2 si les données sources sont invalides. Une référence absente ou un niveau source invalide empêche toute écriture. `--write` ne change que les deux champs documentés ; une seconde exécution sur les mêmes données ne réécrit rien.

Sept tests vérifient notamment la première occurrence, l'absence d'écriture en contrôle, l'idempotence et l'absence de réparation partielle en cas d'erreur. Une comparaison indépendante confirme l'identité des données et des cartes servies pour cette réparation seule. Les retouches linguistiques demandées par Claude sont isolées dans le lot suivant.
