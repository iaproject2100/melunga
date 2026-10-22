# Ordre livré et détail de la relecture espagnole

Lecture indépendante des objets Git figés `a4f1ec4` et `cb3e22d`, après la relecture `verification-transition-es.md`. Aucun fichier de source, de maquette ou de compte rendu précédemment validé n’est modifié.

## Conclusion

**Les agrégats sont confirmés : le maximum local passe de 3 à 2, le total reste 7, et le maximum de tout L4 reste 4. Le détail du § 3 de Claude suit cependant un autre ordre que celui livré.**

Dans `cb3e22d`, la variante `como en casa` vient en premier (`variantOrder: [1, 2, 3, 0]`). Le support « Como en casa. » introduit `como`, puis « Normalmente como en casa. » introduit encore **`normalmente` : une forme nouvelle, pas zéro**. Le support du lever vient plus tard dans cette unité.

Le zéro décrit par Claude se reproduit si l’on place d’abord le support et la variante du lever, donc si `normalmente` est déjà présent avant la variante du repas. C’est une alternative cohérente sur ce seul indicateur, mais ce n’est pas l’ordre du runtime vérifié. Le présent constat ne demande aucun réordonnancement pour faire coïncider la maquette avec le commentaire.

## Premières présentations effectivement livrées

Les répétitions à l’imitation restent intercalées dans le runtime ; elles ajoutent zéro forme écrite et figurent dans le JSON. Le tableau ci-dessous ne montre que les étapes `understand`.

| Étape du runtime | Phrase entière | Types nouveaux | Nombre |
| --- | --- | --- | ---: |
| 1 | Como en casa. | `como` | 1 |
| 3 | Normalmente como en casa. | `normalmente` | 1 |
| 5 | Normalmente trabajo hasta las seis. | `hasta`, `seis` | 2 |
| 7 | Normalmente ceno tarde. | `ceno` | 1 |
| 9 | Me levanto temprano. | `levanto` | 1 |
| 11 | Normalmente me levanto a las siete. | `siete` | 1 |

## Ordre imprimé dans la relecture de Claude

Cette simulation conserve exactement les mêmes phrases ; seul leur ordre de première présentation change.

| Phrase entière | Types nouveaux | Nombre |
| --- | --- | ---: |
| Me levanto temprano. | `levanto` | 1 |
| Normalmente me levanto a las siete. | `normalmente`, `siete` | 2 |
| Como en casa. | `como` | 1 |
| Normalmente como en casa. | — | 0 |
| Normalmente trabajo hasta las seis. | `hasta`, `seis` | 2 |
| Normalmente ceno tarde. | `ceno` | 1 |

Les deux suites donnent un maximum de 2 et un total de 7. Ces agrégats ne permettent donc pas de distinguer leurs chronologies : il faut lire les identifiants d’étapes.

## Sources et méthode

- Runtime livré SHA-256 : `311f20f83fe5e47219948b794e2d0477cb0935fea1e81c0015393dc921fbb78d`.
- **1524 champs espagnols de variantes et neuf champs de supports** sont comparés aux sources Git exactes ; aucun écart.
- Les trois supports ont bien leur présentation puis leur imitation avant leur cible ; les quatre variantes et leurs aides sont inchangées.
- Segmentation : groupes de lettres Unicode en minuscules, sans lemmatisation, avec apostrophes et traits d’union séparateurs. Le stock initial est l’union des variantes L1–L3 et des unités L4 antérieures dans l’ordre du plan.
- Ce stock désigne des formes écrites présentes dans le plan, pas des acquis observés. Le calcul ne mesure ni écoute effective, ni compréhension, ni aisance orale.
- Le ratio de variantes seules reste L3 = 59/103 et L4 = 70/110. Ce constat de détail ne change ni la validation de conservation ni l’ampleur du signal par niveau.

Le JSON joint contient les deux traces complètes, leurs identifiants, la vérification des copies et les empreintes. Le calcul a été écrit directement pour cette lecture, sans réutiliser le compilateur ni le script de métrique existant.

## Repère de reproduction

Lire le runtime avec `git show cb3e22d:docs/progression-corrections/parcours-corriges.json`, sélectionner `fr-es` puis `L4-fr-es-01`, initialiser les types des variantes de niveaux antérieurs et des unités précédentes, puis parcourir les étapes `understand`/`imitate` dans leur ordre effectif. Pour chaque phrase : extraire `set(re.findall(r"[^\W\d_]+", study.lower(), re.UNICODE))`, relever la différence avec le stock, puis ajouter ses types au stock. Cette procédure retrouve la suite **1, 1, 2, 1, 1, 1**, et non **1, 2, 1, 0, 2, 1**.
