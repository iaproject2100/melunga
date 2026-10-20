# Relecture des huit familles corrigées

Objet : `f277261` sur `review/familles-huit-corrections`, comparé à `49dca94`. Correction demandée par Kartech à la suite de la revue pédagogique. Rien n'est fusionné ni publié.

## Verdict

**La correction fait ce qu'elle annonce et peut être retenue.** Quatorze phrases d'exemple sont remplacées, les huit confusions de construction signalées dans l'audit disparaissent, **les 906 cartes des familles se résolvent toujours à l'exécution** (aucune n'est perdue) et aucune phrase du catalogue n'est supprimée, déplacée ni reclassée : les sept `DECKS` sont identiques au caractère près.

Les quatorze remplacements sont linguistiquement justes :

| Langue · famille | Retiré | Ajouté |
|---|---|---|
| fr `L2_ACTION_PROCHE` | Je vais mieux. | Je vais réfléchir. |
| fr `L4_CONDITION` | Signez ici, s'il vous plaît. | Si tu es d'accord, on signe. |
| en `L2_ACTION_PROCHE` | I'm going to bed. | I'm going to go out. |
| en `L2_ACTION_PROCHE` | I'm going to work. | I'm going to do it. |
| en `L6_OPINION` | I think about you. | I think it's a good idea. |
| en `L6_OPINION` | I believe in you. | I think it's going to work. |
| es `L2_ACTION_PROCHE` | Voy a casa. | Voy a llegar pronto. |
| es `L2_ACTION_PROCHE` | Voy a por agua. | Voy a repetirlo. |
| zh `L2_ACTION_PROCHE` | 我要去…… | 我要去商店 |
| zh `L2_ACTION_PROCHE` | 我要两个 | 我要买这个 |
| zh `L2_ACTION_PROCHE` | 我要这个 | 我要走了 |
| zh `L2_ACTION_PROCHE` | 我要那个 | 我要改签。 |
| it `L4_CONDITION` | Secondo me, è un errore. | Se vuoi, ti aiuto. |
| ja `L9_HYPOTHESE` | もしかすると、明日は雨かもしれません。 | 必要なら行けますよ。 |

## Trois retouches à prévoir

1. **Doublon introduit en anglais.** `L6_OPINION` porte désormais « I think it'll work. » (étape 3) et « I think it's going to work. » (étape 5), avec **la même traduction française** « je pense que ça va marcher ». Remplacer l'une des deux, par exemple par « I think we should wait. » ou « I don't think so. » — une négation manque d'ailleurs à cette famille.
2. **Cohérence du chinois.** L'étape 1 devient 我要去商店 (« je vais au magasin »). C'est grammaticalement 我要 + groupe verbal, donc recevable, mais c'est la sémantique de déplacement que la correction vient justement d'écarter en espagnol (Voy a casa) et en anglais (I'm going to bed). Soit on l'assume et on le dit dans la famille, soit on prend une action sans déplacement, par exemple 我要休息 ou 我要试试. Remarque voisine : 我要走了 relève de 要…了 (action imminente), légèrement différent de 要 + action (intention) — acceptable, à signaler dans la note de famille.
3. **Métadonnée vidée.** Les sept entrées chinoises corrigées ont désormais `"chinese": ""`. Sans effet à l'exécution, mais autant la remplir comme ailleurs.

## Ce que la correction a révélé — plus important que la correction elle-même

En vérifiant les références, j'ai constaté que **`sourceIndex` et `currentLevel` étaient faux pour 905 des 906 entrées** avant ce commit : l'index annoncé ne désignait pas la phrase citée, et le niveau annoncé était celui d'une autre carte. Après correction, 53 entrées (celles des huit familles) sont exactes ; **853 restent fausses**.

Sans conséquence pour l'apprenant : `guidedPool()` résout chaque carte **par son texte** (`byTarget[ref.target]`, première occurrence du catalogue) et n'utilise jamais ces deux champs. Ce sont des métadonnées de documentation.

Mais une fois exactes, elles rendent visible le désalignement décrit dans l'audit, avec des chiffres :

| Famille guidée | Niveau de parcours annoncé | Niveaux réels des cartes servies |
|---|---|---|
| fr `L4_CONDITION` | 4 | 8, 9, 9, 9, 9, 10 |
| it `L4_CONDITION` | 4 | 8, 9, 9, 9, 10, 10 |
| ja `L9_HYPOTHESE` | 9 | 5, 7, 8, 9, 10, 10 |
| fr `L2_ACTION_PROCHE` | 2 | 2, 2, 2, 2, 2, 3, 3 |

La famille « condition » du niveau 4 guidé s'appuie donc, en français comme en italien, sur des cartes classées 8 à 10 au catalogue. C'est la démonstration la plus nette, à ce jour, qu'un même numéro ne recouvre pas les mêmes acquis d'un ensemble à l'autre — et cela vient de la correction de Codex, pas d'une hypothèse.

**Décision à prendre sur ces deux champs** : soit les réparer pour les 853 entrées restantes (un script suffit, ils deviennent alors un indicateur de cohérence exploitable), soit les supprimer, puisqu'ils ne servent à rien à l'exécution et induisent en erreur quiconque les lit. Laisser 853 valeurs fausses est la seule option à écarter.

## Recommandation

Retenir la correction, traiter les trois retouches, puis trancher le sort de `sourceIndex` / `currentLevel`. Aucune de ces actions ne dépend des quatre décisions en attente sur le parcours, L1, les rubriques et les priorités.
