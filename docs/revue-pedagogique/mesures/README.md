# Scripts de vérification et de mesure (revue Claude)

Lancés depuis un dossier contenant `c49/melunga_deploy/content/conversation` (contenu du commit audité) et
`revue/Melunga-proposition-pedagogique` (dossier décompressé) ; adapter les constantes `C` et `D` en tête de fichier.

- `verif_refs.py` — vérifie que chaque référence `L<n>-<nat>-<étude>-<nn>` citée dans le dossier existe, et que les phrases citées correspondent au contenu réel. Résultat au 20/10/2026 : 177 références existantes, 0 introuvable ; 63 citations exactes, 0 divergente.
- `mesure_briques.py` — part des briques (mots, ou caractères pour zh/ja) d'un niveau jamais vues aux niveaux précédents du même couple.
- `mesure_dialogues.py` — part des briques des dialogues jamais préparées par les variantes du même niveau ni par les niveaux antérieurs.

Indicateurs lexicaux volontairement grossiers : ils ne mesurent pas les structures et encore moins l'apprentissage. Ils servent à comparer les niveaux entre eux et à constater une amélioration après réorganisation.
