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
