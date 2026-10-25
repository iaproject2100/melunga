# Lot 3 — aides entières et lectures après la couche précédente

Cette couche reprend les événements figés de Claude à `d06a62e`, sur l’édition
avant `3df885d`. Le registre précédent `revue-claude-lot2.json`, ses preuves et
ses annotations restent inchangés. La nouvelle couche s’applique après lui.

- **90 événements phonétiques et 5 corrections de lecture/Pinyin**.
- **91 identifiants distincts, 98 objets d’exécution** : 88 canoniques, sept
  copies de transport et trois modèles reçus, dont les deux « les » pour sinophones.
- **102 champs effectivement corrigés** : 97 aides (copies comprises) et cinq lectures.
- Sept cartes prolongent une correction B : l’annotation précédente reste intacte,
  la nouvelle étape donne son avant exact après B et son après entier.

Le registre [revue-claude-lot3.json](revue-claude-lot3.json) désigne les preuves,
leurs empreintes, les identifiants, les champs et les profils avant complets.
Il ne contient aucune règle de son à appliquer à d’autres cartes. Les conventions
encore discutées ne sont pas reprises par cette couche.

Le module `reviewed_field_corrections.py` agit sur les sorties en mémoire après
les contrôles d’origine puis la couche du lot 2. Une annotation distincte
`reviewedFieldCorrection` conserve les champs avant et le statut phonétique
antérieur ; `source` et l’annotation B/D ne sont pas réécrits. Une aide ou lecture
avant inattendue fait échouer la génération. Une exécution répétée accepte
seulement le même après attesté et la même annotation.

Les copies sont retrouvées par couple et identifiant, et les empreintes des
banques sont recalculées pour les fichiers réellement écrits. Les positions
consignées attestent le snapshot de départ sans transformer un emplacement
en droit d’accès immuable.

Le manifeste déclare cette couche dans `reviewedFieldCorrections` et conserve
la déclaration précédente. Le vérificateur indépendant contrôle d’abord l’après
réel et ses preuves, puis projette une copie privée vers l’état du lot 2 pour
contrôler sa propre chaîne et les sources originales. Aucune donnée du pack
appelant n’est modifiée pour faire passer un contrôle.

Les textes étudiés, sens, types, thèmes, niveaux, identifiants, rôles, étapes,
prix, accès et fichiers d’interface restent inchangés dans ce raccord. Les cinq
lectures nommément attestées changent ; toutes les autres lectures sont conservées.
Le mode historique `make(include_situations=False)` reste sans ces couches et
ne constitue pas une édition servie du parcours actuel.

[Compte rendu et lots séparés](../../reponse-revue-integrale-lot3/README.md).
Cette couche ne constitue ni une validation native globale ni une publication.
