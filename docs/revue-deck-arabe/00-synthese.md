# Synthèse — revue de contenu du deck arabe Melunga

Revue du 30 octobre 2026. Livraison de rapports ; aucun changement au deck.

**4 487 cartes parcourues ; 568 constats sur 542 cartes principales**, dont 483 corrections ou anomalies recommandées au contrôle et 85 points à vérifier. Une carte peut avoir plusieurs constats ; ces nombres ne sont pas un taux d’erreur.

## Structure et périmètre

- Liste JSON UTF-8 plate ; 4 487 valeurs `t` strictement uniques ; 15 champs non vides par carte.
- Les 4 487 textes arabes, les sept traductions et les cinq guides ont été parcourus : 58 331 valeurs textuelles, plus les métadonnées.
- Les expressions dialectales familières, proverbes et formules religieuses demandés ont été conservés dans le périmètre attendu.
- Les niveaux vont globalement de la survie quotidienne aux échanges professionnels, à la négociation et aux expressions. L1–L10 n’est pas assimilé automatiquement au CECRL ; aucune réaffectation de niveau/catégorie proposée.

| Niveau | Cartes parcourues | Constats |
|---|---:|---:|
| L1 | 283 | 37 |
| L2 | 545 | 53 |
| L3 | 633 | 32 |
| L4 | 594 | 27 |
| L5 | 683 | 82 |
| L6 | 439 | 62 |
| L7 | 430 | 100 |
| L8 | 402 | 107 |
| L9 | 227 | 32 |
| L10 | 251 | 36 |

## Rapports par lots

| Lot | Cartes | Constats | Rapport |
|---|---:|---:|---|
| L1–L3 | 1461 | 122 | [01-L1-L3.md](01-L1-L3.md) |
| L4–L6 | 1716 | 171 | [02-L4-L6.md](02-L4-L6.md) |
| L7–L10 | 1310 | 275 | [03-L7-L10.md](03-L7-L10.md) |

## Répartition

| Axe | Constats |
|---|---:|
| arabe | 41 |
| traduction | 220 |
| phonétique | 301 |
| rapprochement | 6 |

## Prononciation : diagnostic puis régénération

Les anomalies les plus récurrentes concernent des consonnes lexicales perdues dans `phon`, notamment ج et ز. Le générateur arabe transforme `j` en une clé interne `J`, mais les tables de coda partagées ne contiennent ni `J` ni `z` : le secours vide peut supprimer la consonne. Il faut corriger le générateur et contrôler les familles touchées avant régénération. Les constats détaillés repèrent les cartes, sans réécrire leurs aides.

Les défauts des guides latins portent sur les consonnes/voyelles manquantes ou sur une vocalisation à confirmer. Les approximations conventionnelles de ع/ح, l’absence de désinences finales et les variantes recevables n’ont pas été assimilées automatiquement à des erreurs. L’accent tonique est dépisté, sans certifier chaque syllabation.

Les 12 démonstrations de `ar_phon.py` ont été exécutées avec la dépendance allemande v3.1. La formule السلام عليكم reproduit les cinq sorties étalons annoncées. Le deck ne contient pas les translittérations d’entrée `tr` : une reproduction complète des 4 487 cartes par `GA()` n’est donc pas vérifiable à partir de ces seuls fichiers. Les résultats des 12 démonstrations ne prouvent pas la justesse du deck entier.

## Rapprochements entre niveaux

6 répétitions proches sont signalées pour arbitrage pédagogique. La réexposition et le pattern drilling peuvent être intentionnels. Aucun retrait automatique n’est préconisé.

## Contrelecture et limites

Après la lecture complète, une contrelecture des constats a retiré 37 signalements et en a nuancé ou reformulé 96. Les variantes idiomatiques recevables ont été retirées ou marquées comme vérifications de contexte. Chaque numéro, niveau, texte exact et nom de champ est vérifié contre le JSON original.

Relecture textuelle assistée par modèle ; aucune écoute systématique ni validation humaine native des huit langues. Une carte absente du rapport n’est pas certifiée sans erreur. Les ambiguïtés de sens, de vocalisation ou de contexte sont marquées « à vérifier ».

Le deck, son ordre, ses 15 champs, `lv`, `cat` et le générateur sont conservés. Ce rapport propose des corrections éditoriales ; il n’applique aucun patch. Pour les phonétiques, seul le problème et l’action de contrôle/régénération sont fournis, jamais une valeur de remplacement saisie à la main.

Source : `ar_deck_complet.json` — SHA-256 `2658c1135f1e22e91cebf4b29795e9e0bda6af21798b829eca240ffde9369b46`.
Générateur fourni : `ar_phon.py` — SHA-256 `58d007c9c3eef73205f9ed8d2067386205320687d04980ad8ca9c5f7a8a2a85d`.
