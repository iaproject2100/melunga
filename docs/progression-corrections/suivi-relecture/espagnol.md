# Réexamen espagnol : longueurs, constructions et préparations

Base figée : `99478df`, couple `fr-es`. Examen des 127 unités et des quatre variantes ; les 104 unités actuellement placées en L2–L9 ont une fiche de contribution dans `espagnol-propositions.json`. Les cinq amendements proposés sont uniquement éditoriaux ; aucune source, phrase, phonétique ou lecture n’est modifiée. Rien n’est appliqué au classement par ce document.

## Conclusion

Les quatre inversions de **longueur moyenne** persistent bien. Cela ne signifie cependant pas que les quatre écarts sont inchangés : trois se réduisent et un augmente. Le classement a mieux préparé certaines réponses avant leurs questions, mais il n’a pas rendu la courbe monotone. Il ne faut ni déclarer la courbe réparée, ni transformer cette absence de monotonie en diagnostic grammatical global.

Le maintien de L7 > L8 est principalement structurel dans cet indicateur : les comparatifs répètent des cadres de sept mots avant même leur adjectif, alors que plusieurs demandes ou conditions utilisent un cadre bref mais des formes nouvelles. Le retrait de déclarations simples de L4 vers L2 rend aussi la moyenne restante de L4 plus longue. Cela ne disculpe pas toutes les préparations : le réexamen corrige une chronologie de cause et plusieurs références ou réserves trop généreuses.

## Mesure reproduite

Pour chaque variante entière, compter les mots alphabétiques Unicode avec la même fonction que l’audit (`descriptive_length` pour `es`), puis faire la moyenne des quatre variantes de chaque unité et de toutes les unités du niveau. Chaque unité ayant quatre variantes, les pondérations sont identiques. Aucun arrondi n’intervient avant la différence ; les chiffres ci-dessous sont arrondis pour lecture. Ce nombre n’est pas appelé difficulté.

| Niveau | Nombre d’unités source | Moyenne source | Nombre d’unités proposé | Moyenne proposée |
| --- | ---: | ---: | ---: | ---: |
| L1 | 11 | 3.1364 | 11 | 3.1364 |
| L2 | 13 | 4.4231 | 19 | 4.2368 |
| L3 | 12 | 3.4583 | 14 | 3.5714 |
| L4 | 13 | 4.9808 | 12 | 5.4583 |
| L5 | 13 | 4.6346 | 13 | 4.6346 |
| L6 | 13 | 5.2500 | 15 | 5.4000 |
| L7 | 13 | 6.7308 | 12 | 6.7917 |
| L8 | 13 | 5.8269 | 8 | 6.1875 |
| L9 | 13 | 5.6346 | 11 | 6.0227 |
| L10 | 13 | 6.9808 | 12 | 7.0833 |

| Écart descendant | Avant | Après `99478df` | Variation de l’écart |
| --- | ---: | ---: | ---: |
| L2−L3 | 0.9647 | 0.6654 | -0.2993 |
| L4−L5 | 0.3462 | 0.8237 | +0.4776 |
| L7−L8 | 0.9038 | 0.6042 | -0.2997 |
| L8−L9 | 0.1923 | 0.1648 | -0.0275 |

Le signe reste descendant quatre fois. L2−L3, L7−L8 et L8−L9 se resserrent ; L4−L5 se creuse. C’est un bilan mesurable mixte, pas « aucune variation » et pas « objectif atteint ».

## Pourquoi ces quatre signes restent descendants

### L2 > L3 : précisions longues, questions courtes

- `Un poco más de pan, por favor.` compte 7 mots ; `¿Qué haces?` en compte 2. Le premier est un cadre de demande avec détermination et politesse ; le second implique une forme interrogative et une personne verbale différente. Ces dimensions ne se lisent pas dans le nombre de mots.
- Le premier lot retire de L2 deux unités de questions (`L2-fr-es-08`, moyenne 6 mots ; `L2-fr-es-12`, 2,5) et y place huit unités, notamment les déclarations personnelles de L4. Les déclarations simples précèdent leurs questions de L3, au prix d’un niveau L2 plus fourni. L’écart de longueur baisse de 0,9647 à 0,6654, sans changer de signe.
- Les groupes de quantité de L2 et les conjugaisons de questions de L3 restent à présenter dans leurs phrases entières. Aucun reclassement supplémentaire n’est proposé pour rendre ce signe positif.

### L4 > L5 : le retrait des bases simples augmente la densité du niveau restant

- Cinq unités simples (`Vivo`, `Trabajo`, `Estudio`, `Tengo`, `Soy`) passent de L4 à L2. Leurs moyennes sont respectivement 4 ; 3,5 ; 3,25 ; 3,25 ; 3 mots. Ce déplacement prépare les réponses avant les questions, mais retire précisément les unités courtes de la moyenne L4.
- L4 conserve les routines avec les repères `Por la mañana`, `Por la noche` et `Los fines de semana`, les descriptions du logement/quartier et les proches. Les deux séries matin/week-end atteignent chacune 7,25 mots en moyenne. Il reçoit également trois demandes de L8 et `Falta` de L9. L5 conserve ses treize unités.
- `Por la mañana llevo a los niños al colegio.` (9 mots) est plus long que `Ayer no salí de casa.` (5 mots), mais ce dernier ajoute une forme passée qui n’est pas préparée par la seule longueur du présent.
- L5 inclut aussi les réactions courtes au récit (`L5-fr-es-06`, moyenne 2,25). Leur place répond à l’interaction du récit. Les déplacer uniquement pour allonger la moyenne L5 ne préparerait aucune forme supplémentaire.
- L’augmentation de l’écart 0,3462 → 0,8237 est donc constatée et conservée comme alerte de charge textuelle, sans être baptisée amélioration. La préparation lexicale et les phrases entières de la routine restent à observer avec apprenants.

### L7 > L8 : cadres comparatifs longs et condition/politesse compactes

- `El tren es más rápido que el coche.` (8 mots) et `Este piso es menos caro que el otro.` (8 mots) ont chacun un cadre fixe de sept mots autour de l’adjectif. La longueur relève en grande partie du cadre lui-même.
- `L7-fr-es-13` (comparaisons de préférence) pèse 8,75 mots en moyenne, `L7-fr-es-06` 7,75, `L7-fr-es-04` et `L7-fr-es-11` 7,5. Ces familles restent le noyau argumentatif du niveau.
- L7 ne perd que `Antes…ahora ya no` (6,75 mots) et `Ahora…más que antes` (5), puis reçoit `Estoy de acuerdo con` (5,75). Déplacer ces habitudes vers leur préparation temporelle ne pouvait retirer le noyau des cadres comparatifs longs.
- L8 perd cinq unités : besoins de temps supplémentaire (4,5 mots), demandes de service (5,5), permissions (4,25), démarches (5) et annonce de réparation (7). Sa moyenne monte de 5,8269 à 6,1875, mais reste sous les 6,7917 de L7. Le pic baisse d’environ 0,90 à 0,60 mot ; il n’est pas supprimé.
- `¿Sería posible pagar en dos veces?` et `Si me hace un descuento, lo compro.` sont courts par rapport aux comparatifs, mais introduisent atténuation/condition et parfois clitique. Les allonger pour faire passer leur moyenne au-dessus de L7 serait un faux correctif.

### L8 > L9 : réparation et incertitude peuvent être brèves

- `Puede que sea un error.` a 5 mots ; la forme `sea` relève d’un mode que les comparatifs ne préparent pas à eux seuls. Les quatre expressions de `L9-fr-es-03` ne font que 2,25 mots en moyenne, mais leur usage sert une nuance dans l’échange.
- À l’inverse, `Si he entendido bien…¿no?` et `Lo que quiero decir es que…` atteignent 10,5 et 9 mots. La moyenne L9 mélange ces cadres longs avec des réponses courtes nécessaires à la réparation. Une moyenne par niveau ne décrit donc pas à elle seule la séquence interne.
- L’écart diminue de 0,1923 à 0,1648 mot ; son signe persiste. Ce n’est pas une raison pour reculer les nuances courtes ou avancer arbitrairement le subjonctif.

## Cinq amendements éditoriaux proposés

1. **Cause avant préférence causale.** Inverser l’ordre interne de `L7-fr-es-01` et `L7-fr-es-04` (positions 7 et 8), puis ajouter le premier comme reprise prévue du second. Ainsi la cause en contexte connu précède son emploi avec un comparatif. La moyenne L7 reste strictement identique : le correctif porte sur la chronologie, pas sur le graphe de longueur.
2. **Réserve sur le double clitique.** `L8-fr-es-06` conserve son placement après la condition concrète ; ajouter la réserve sur `me lo` et `por escrito`. Un clitique isolé antérieur ne suffit pas à préparer cette combinaison.
3. **Réserve sur le résultat au participe.** `L8-fr-es-12` conserve son placement et sa préparation comme expressions entières ; `está vendido` n’est pas couvert par l’ancien repère de localisation `Está aquí`, pas plus que `ha pasado` n’est un prétérit L5.
4. **Retirer un faux appui pour le si interrogatif.** Pour `L8-fr-es-10`, retirer le prérequis `L8-fr-es-04` (condition) et reprendre plutôt la demande de service enchâssée `L3-fr-es-02`. Le `dónde` de cette reprise ne devient pas une règle du `si` interrogatif ; la forme totale et l’atténuation `quería` restent préparées dans leur propre phrase entière.

Il s’agit de cinq lignes amendées (deux pour l’inversion, trois pour les réserves/références), appliquées ensemble si retenues. Les autres lignes L2–L9 sont conservées avec leur contribution et leur motif de maintien. Les patches JSON n’altèrent que `order`, `plannedPrerequisites`, `rationale` et `gaps` ; aucun champ source ni aide n’est touché.

## Dialogue, lexique et portée du résultat

Les 49 réserves du lot espagnol initial sont des annotations de préparations ou contraintes, pas 49 erreurs automatiquement déduites d’une courbe. Le réexamen en ajoute trois sur des constructions déjà présentes dans le stock. Le taux de 49 % de briques non préparées en dialogue vient d’un autre audit de la réserve et n’est pas recalculé ici : les dialogues n’ont pas été reclassés et une unité déplacée ne démontre pas que sa réplique a été rencontrée dans le bon rôle.

Le résultat retenu est donc : trois écarts textuels réduits, un écart augmenté et quatre signes encore descendants ; cinq amendements concrets de préparation/chronologie ; aucune preuve d’une progression d’apprentissage validée. Le naturel des phrases et les usages productifs restent à relire, sans nouvelle transcription ni harmonisation phonétique.

## Contribution de toutes les unités proposées en L2–L9

Chaque ligne pèse une unité, soit quatre variantes. Les valeurs décrivent les textes sources, pas un classement grammatical.

| Niveau proposé | Ordre | Unité | Source | Moyenne de mots | Décision |
| --- | ---: | --- | --- | ---: | --- |
| L2 | 1 | `L2-fr-es-02` | L2 | 6.50 | retain |
| L2 | 2 | `L2-fr-es-09` | L2 | 4.00 | retain |
| L2 | 3 | `L2-fr-es-10` | L2 | 7.00 | retain |
| L2 | 4 | `L2-fr-es-01` | L2 | 6.00 | retain |
| L2 | 5 | `L2-fr-es-03` | L2 | 3.25 | retain |
| L2 | 6 | `L4-fr-es-05` | L4 | 4.00 | retain |
| L2 | 7 | `L4-fr-es-06` | L4 | 3.50 | retain |
| L2 | 8 | `L4-fr-es-07` | L4 | 3.25 | retain |
| L2 | 9 | `L4-fr-es-04` | L4 | 3.25 | retain |
| L2 | 10 | `L4-fr-es-13` | L4 | 3.00 | retain |
| L2 | 11 | `L2-fr-es-06` | L2 | 1.50 | retain |
| L2 | 12 | `L2-fr-es-07` | L2 | 4.00 | retain |
| L2 | 13 | `L2-fr-es-11` | L2 | 4.00 | retain |
| L2 | 14 | `L2-fr-es-13` | L2 | 5.50 | retain |
| L2 | 15 | `L6-fr-es-10` | L6 | 6.00 | retain |
| L2 | 16 | `L2-fr-es-04` | L2 | 4.00 | retain |
| L2 | 17 | `L2-fr-es-05` | L2 | 3.25 | retain |
| L2 | 18 | `L8-fr-es-09` | L8 | 4.50 | retain |
| L2 | 19 | `L9-fr-es-10` | L9 | 4.00 | retain |
| L3 | 1 | `L3-fr-es-07` | L3 | 2.50 | retain |
| L3 | 2 | `L3-fr-es-04` | L3 | 5.75 | retain |
| L3 | 3 | `L3-fr-es-08` | L3 | 2.00 | retain |
| L3 | 4 | `L3-fr-es-03` | L3 | 2.00 | retain |
| L3 | 5 | `L3-fr-es-11` | L3 | 2.50 | retain |
| L3 | 6 | `L2-fr-es-08` | L2 | 6.00 | retain |
| L3 | 7 | `L2-fr-es-12` | L2 | 2.50 | retain |
| L3 | 8 | `L3-fr-es-01` | L3 | 3.00 | retain |
| L3 | 9 | `L3-fr-es-02` | L3 | 5.75 | retain |
| L3 | 10 | `L3-fr-es-05` | L3 | 4.75 | retain |
| L3 | 11 | `L3-fr-es-09` | L3 | 4.00 | retain |
| L3 | 12 | `L3-fr-es-06` | L3 | 2.50 | retain |
| L3 | 13 | `L3-fr-es-10` | L3 | 3.75 | retain |
| L3 | 14 | `L3-fr-es-12` | L3 | 3.00 | retain |
| L4 | 1 | `L4-fr-es-11` | L4 | 6.50 | retain |
| L4 | 2 | `L4-fr-es-10` | L4 | 5.25 | retain |
| L4 | 3 | `L4-fr-es-09` | L4 | 5.25 | retain |
| L4 | 4 | `L4-fr-es-01` | L4 | 4.50 | retain |
| L4 | 5 | `L4-fr-es-02` | L4 | 7.25 | retain |
| L4 | 6 | `L4-fr-es-03` | L4 | 6.00 | retain |
| L4 | 7 | `L4-fr-es-12` | L4 | 7.25 | retain |
| L4 | 8 | `L4-fr-es-08` | L4 | 5.75 | retain |
| L4 | 9 | `L8-fr-es-01` | L8 | 5.50 | retain |
| L4 | 10 | `L8-fr-es-02` | L8 | 4.25 | retain |
| L4 | 11 | `L8-fr-es-13` | L8 | 5.00 | retain |
| L4 | 12 | `L9-fr-es-13` | L9 | 3.00 | retain |
| L5 | 1 | `L5-fr-es-01` | L5 | 4.25 | retain |
| L5 | 2 | `L5-fr-es-02` | L5 | 3.75 | retain |
| L5 | 3 | `L5-fr-es-03` | L5 | 6.00 | retain |
| L5 | 4 | `L5-fr-es-11` | L5 | 5.50 | retain |
| L5 | 5 | `L5-fr-es-09` | L5 | 6.25 | retain |
| L5 | 6 | `L5-fr-es-08` | L5 | 4.00 | retain |
| L5 | 7 | `L5-fr-es-07` | L5 | 8.75 | retain |
| L5 | 8 | `L5-fr-es-10` | L5 | 4.00 | retain |
| L5 | 9 | `L5-fr-es-13` | L5 | 4.00 | retain |
| L5 | 10 | `L5-fr-es-12` | L5 | 4.00 | retain |
| L5 | 11 | `L5-fr-es-04` | L5 | 3.75 | retain |
| L5 | 12 | `L5-fr-es-05` | L5 | 3.75 | retain |
| L5 | 13 | `L5-fr-es-06` | L5 | 2.25 | retain |
| L6 | 1 | `L7-fr-es-07` | L7 | 6.75 | retain |
| L6 | 2 | `L7-fr-es-08` | L7 | 5.00 | retain |
| L6 | 3 | `L6-fr-es-01` | L6 | 6.25 | retain |
| L6 | 4 | `L6-fr-es-13` | L6 | 3.75 | retain |
| L6 | 5 | `L6-fr-es-09` | L6 | 5.75 | retain |
| L6 | 6 | `L6-fr-es-11` | L6 | 6.75 | retain |
| L6 | 7 | `L6-fr-es-06` | L6 | 5.25 | retain |
| L6 | 8 | `L6-fr-es-02` | L6 | 4.50 | retain |
| L6 | 9 | `L6-fr-es-08` | L6 | 2.75 | retain |
| L6 | 10 | `L6-fr-es-05` | L6 | 6.25 | retain |
| L6 | 11 | `L6-fr-es-04` | L6 | 5.75 | retain |
| L6 | 12 | `L6-fr-es-12` | L6 | 6.75 | retain |
| L6 | 13 | `L6-fr-es-07` | L6 | 4.50 | retain |
| L6 | 14 | `L8-fr-es-07` | L8 | 7.00 | retain |
| L6 | 15 | `L6-fr-es-03` | L6 | 4.00 | retain |
| L7 | 1 | `L7-fr-es-12` | L7 | 4.00 | retain |
| L7 | 2 | `L7-fr-es-05` | L7 | 5.25 | retain |
| L7 | 3 | `L7-fr-es-02` | L7 | 8.00 | retain |
| L7 | 4 | `L7-fr-es-03` | L7 | 8.00 | retain |
| L7 | 5 | `L7-fr-es-09` | L7 | 7.00 | retain |
| L7 | 6 | `L7-fr-es-13` | L7 | 8.75 | retain |
| L7 | 7 | `L7-fr-es-04` | L7 | 7.50 | amend |
| L7 | 8 | `L7-fr-es-01` | L7 | 6.75 | amend |
| L7 | 9 | `L7-fr-es-10` | L7 | 5.25 | retain |
| L7 | 10 | `L7-fr-es-11` | L7 | 7.50 | retain |
| L7 | 11 | `L7-fr-es-06` | L7 | 7.75 | retain |
| L7 | 12 | `L10-fr-es-10` | L10 | 5.75 | retain |
| L8 | 1 | `L8-fr-es-08` | L8 | 4.75 | retain |
| L8 | 2 | `L8-fr-es-12` | L8 | 6.75 | amend |
| L8 | 3 | `L8-fr-es-05` | L8 | 5.00 | retain |
| L8 | 4 | `L8-fr-es-11` | L8 | 6.00 | retain |
| L8 | 5 | `L8-fr-es-03` | L8 | 6.25 | retain |
| L8 | 6 | `L8-fr-es-06` | L8 | 8.00 | amend |
| L8 | 7 | `L8-fr-es-04` | L8 | 5.25 | retain |
| L8 | 8 | `L8-fr-es-10` | L8 | 7.50 | amend |
| L9 | 1 | `L9-fr-es-03` | L9 | 2.25 | retain |
| L9 | 2 | `L9-fr-es-04` | L9 | 6.00 | retain |
| L9 | 3 | `L9-fr-es-05` | L9 | 4.00 | retain |
| L9 | 4 | `L9-fr-es-12` | L9 | 5.75 | retain |
| L9 | 5 | `L9-fr-es-01` | L9 | 6.00 | retain |
| L9 | 6 | `L9-fr-es-07` | L9 | 7.00 | retain |
| L9 | 7 | `L9-fr-es-11` | L9 | 6.00 | retain |
| L9 | 8 | `L9-fr-es-08` | L9 | 5.25 | retain |
| L9 | 9 | `L9-fr-es-06` | L9 | 4.50 | retain |
| L9 | 10 | `L9-fr-es-09` | L9 | 10.50 | retain |
| L9 | 11 | `L9-fr-es-02` | L9 | 9.00 | retain |
