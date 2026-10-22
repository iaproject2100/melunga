# Vérification du reclassement L1–L10 (`99478df`)

Objet : `99478df` sur `review/progression-L1-L10`, comparé à l'audit `bcd108d`. J'ai rejoué mes propres mesures en suivant son classement, pour savoir si les 122 déplacements corrigent les anomalies que j'avais relevées. Rien n'est fusionné ni publié.

## Verdict

**Le lot est honnête et bien construit : les 319 premières comparaisons sont mécaniquement propres, les gros déplacements sont fondés, et les 330 réserves sont déclarées plutôt que masquées.** La conservation est exacte : 11 488 champs conformes aux sources, 0 écart.

**Mais le reclassement n'atteint qu'à moitié son objectif, et il échoue précisément là où il fallait réussir.** Le pic L7 est corrigé dans cinq couples sur sept ; les deux qui résistent — **fr→es et fr→it** — sont exactement les deux couples que l'audit désignait déjà comme les moins préparés. Détail au § 3.

## 1. Conservation et propreté des comparaisons

| Contrôle | Résultat |
|---|---|
| Phrases recopiées contre les 110 sources | **11 488 champs, 0 écart** |
| Premières comparaisons déclarées | 319 |
| … avec `additionalOperations` non vide | **0** |
| … avec un invariant sans emplacement `{s}` | **0** |
| … avec un invariant incohérent avec les deux variantes citées | **0** |
| Unités L1 déplacées | **0** — sa promesse tenue |

Sa question 2 — « même fonction du groupe, sans changement caché de temps, personne, particule ou registre » — est donc vérifiable et vérifiée sur la forme : aucune des 319 comparaisons ne déclare d'opération supplémentaire, et l'invariant annoncé est bien le squelette des deux variantes citées. Ce contrôle porte sur la structure déclarée, pas sur la grammaire : qu'un invariant soit cohérent n'établit pas que le changement soit d'une seule nature linguistique. C'est le travail du relevé natif.

## 2. Les déplacements sont fondés, y compris les plus amples

Les 122 déplacements vont massivement vers le bas : 91 descentes contre 31 montées, la plus fréquente étant −2 niveaux (37 unités). Dix-huit unités bougent de cinq niveaux ou plus, et c'est là que j'attendais des surprises. Il n'y en a pas — le motif est au contraire remarquablement cohérent :

| Unité | Déplacement | Phrase |
|---|---|---|
| `L9-fr-en-10` | L9 → L2 | I've got a headache. |
| `L9-fr-es-10` | L9 → L2 | Me duele la cabeza. |
| `L9-zh-fr-08` | L9 → L2 | J'ai mal à la tête. |
| `L9-fr-ja-08` | L9 → L3 | 頭が痛いです。 |
| `L9-fr-ko-10` | L9 → L4 | 머리가 아파요. |
| `L9-fr-it-09` | L9 → L4 | Ho mal di testa da ieri. |

**Dire où l'on a mal passe du niveau 9 au niveau 2–4 dans six langues en parallèle.** C'est juste — c'est un besoin de débutant, pas de confirmé — et le fait que la même décision soit prise simultanément dans six couples indique une règle appliquée, non un brassage opportuniste. Même logique pour « demander la permission » (`L8-fr-zh-02`, 我可以试一下吗？, L8→L3) et « le prochain train » (`L9-fr-ko-12`, L9→L3).

La seule montée ample, `L2-fr-ko-09` (더 큰 사이즈 있어요?, L2→L7), se défend aussi : le comparatif 더 et le compteur ne sont pas du niveau 2.

## 3. Ce que le reclassement corrige — et ce qu'il ne corrige pas

J'ai rejoué ma mesure de difficulté en suivant `proposedLevel` au lieu du niveau d'origine.

**Non-monotonies (un niveau dont les phrases sont plus longues que celles du niveau suivant) :**

| Couple | Avant | Après |
|---|---|---|
| fr→zh | L3>L4 · L7>L8 | **L8>L9** |
| fr→ja | L2>L3 · L7>L8 | **L2>L3** |
| zh→fr | L2>L3 · L4>L5 · L7>L8 | **L2>L3** |
| fr→ko | L2>L3 · L7>L8 · L8>L9 | L5>L6 · L8>L9 |
| fr→en | L4>L5 · L7>L8 · L8>L9 | L4>L5 · L6>L7 · L8>L9 |
| fr→es | L2>L3 · L4>L5 · L7>L8 · L8>L9 | **L2>L3 · L4>L5 · L7>L8 · L8>L9** |
| fr→it | L2>L3 · L4>L5 · L7>L8 · L9>L10 | **L2>L3 · L4>L5 · L7>L8 · L9>L10** |

**Total : 21 avant, 16 après.** Progrès net pour zh, ja et zh→fr. Mais deux observations gênantes :

- **fr→es et fr→it sont inchangés, à l'identique**, quatre non-monotonies avant comme après. Le reclassement ne les a pas touchés de ce point de vue.
- Le reclassement **en introduit deux nouvelles** : `L6>L7` en fr→en et `L5>L6` en fr→ko, qui n'existaient pas avant. Corriger le pic L7 en descendant des unités l'a déplacé d'un cran vers l'amont dans ces deux couples.

**Le pic L7 (longueur moyenne L6 → L7 → L8) :**

| Couple | Avant | Après | |
|---|---|---|---|
| fr→en | 7,0 → **8,4** → 7,9 | 7,9 → 7,6 → 8,7 | corrigé |
| fr→zh | 7,8 → **9,6** → 9,2 | 7,9 → 8,5 → 10,3 | corrigé |
| fr→ja | 11,2 → **13,9** → 12,9 | 11,7 → 12,0 → 15,0 | corrigé |
| fr→ko | 8,8 → **12,5** → 11,5 | 8,8 → 10,6 → 12,5 | corrigé |
| zh→fr | 5,6 → **8,1** → 7,6 | 6,0 → 7,6 → 8,4 | corrigé |
| fr→es | 5,2 → **6,7** → 5,8 | 5,4 → **6,8** → 6,2 | **persiste** |
| fr→it | 5,4 → **6,4** → 5,9 | 5,3 → **6,2** → 6,1 | **persiste** |

**Cinq sur sept corrigés.** Les deux qui résistent sont l'espagnol et l'italien — déjà les deux couples latins les moins préparés de l'audit (fr→es 49 % de briques non préparées en dialogue, fr→it 55 %, contre 46 % pour fr→en). **Les deux couples qui avaient le plus besoin du reclassement sont ceux qu'il a le moins servis.**

Une précaution sur mes propres chiffres, qui vaut aussi en sa faveur : la longueur moyenne est un indicateur grossier. Un reclassement peut être pédagogiquement juste sans aplanir une courbe de longueur, et la longueur n'est pas la difficulté. Je ne conclus donc pas que le reclassement a échoué pour es et it — je constate qu'il n'y produit **aucune amélioration mesurable**, là où il en produit une nette ailleurs, et je demande pourquoi. Ses propres `gaps` vont dans le même sens : fr→es en déclare 49, le deuxième total le plus élevé.

## 4. Les réserves déclarées

330 réserves, réparties ainsi : zh→fr 102, fr→ja 50, fr→es 49, fr→zh 43, fr→en 38, fr→ko 27, fr→it 21.

**zh→fr concentre près d'un tiers des réserves à lui seul.** C'est le couple des apprenants sinophones du français, et c'est aussi celui dont la phonétique repose sur l'approximation par caractères chinois. Il mérite une attention particulière, qui n'est pas dans ce lot.

Sur sa question 4 : l'italien L8 compte 10 unités et **6 réserves déclarées**. Le déficit lexical est donc bien signalé et non réputé résolu, comme il l'écrit. C'est cohérent avec le § 3 : l'italien n'a pas été réparé, et il ne prétend pas l'avoir réparé.

## 5. Sur sa question 3 — préparation prévue et acquisition réelle

Le fichier porte `doesNotMeasureAcquisition: true`, `publicationApproved: false`, 1 353 liens de prérequis « prévus », et la distinction est maintenue dans le vocabulaire de bout en bout (`plannedPrerequisites`, jamais « acquis »). Les 21 tests Python et les 23 664 étapes navigateur contrôlent la cohérence du plan, et il écrit lui-même qu'ils ne prouvent pas la progressivité linguistique. Sur ce point je n'ai rien à redire : la distinction est tenue, y compris dans ses propres affirmations.

## 6. Ce que je recommande

Le lot peut être retenu comme candidat éditorial, avec deux demandes :

1. **Expliquer pourquoi fr→es et fr→it ne bougent pas**, et traiter ces deux couples séparément. Ce sont les deux qui en avaient le plus besoin.
2. **Rendre compte des deux non-monotonies créées** (`L6>L7` en fr→en, `L5>L6` en fr→ko) : si descendre des unités déplace la marche d'un cran, il faut le constater et décider, non le découvrir plus tard.

Et une remarque de calendrier : ce lot reclasse 841 unités, donc il change ce que voit l'apprenant à tous les niveaux sauf L1. **Ce n'est pas un lot de veille de publicité.** Il n'a aucun recoupement avec les sept scènes L1, qui sont, elles, prêtes.
