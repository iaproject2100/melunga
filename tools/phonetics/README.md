# Générateurs fournis avec les decks russe et hindi

Les trois scripts sont conservés ensemble, sans modification des fichiers fournis :
`hi_phon.py` importe `ru_phon.py`, qui importe les tables de `de_phon.py`.
Ils utilisent uniquement la bibliothèque standard Python.

Depuis ce dossier :

```sh
python3 ru_phon.py
python3 hi_phon.py
```

Ces commandes affichent les exemples du fournisseur. Elles ne régénèrent pas
les decks complets : les translittérations syllabées d’entrée ne sont pas
incluses dans les JSON à 15 champs. Les corrections de phonétique du rapport
sont donc destinées à l’auteur du contenu pour régénération.

Les imports originaux sont dans `../maquette-guidee/imports/` et la relecture
dans `../../docs/relecture-russe-hindi/`. Aucune phonétique n’a été remplacée
à la main pendant l’intégration.

## Portugais du Brésil

`pt_phon.py` importe aussi `ru_phon.py` et les tables de `de_phon.py`.
Ces fichiers restent ensemble. Pour ce pack, les translittérations originales
sont disponibles dans `../maquette-guidee/imports/pt-tr-map-v1.json` :

```sh
python3 pt_phon.py
python3 check_pt_deck.py --report ../../docs/relecture-portugais/regeneration.json
```

Le vérificateur appelle `GR(t, tr_map[t], ...)` pour chaque carte, compare
`py`, `pf`, `ps`, `pi`, `phon` et ne modifie pas le deck. Les entrées supplémentaires
de la table sont signalées, sans être importées comme cartes.
