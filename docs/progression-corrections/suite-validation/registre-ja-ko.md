# Demandes japonaises et coréennes : correction proposée du sens français L1

Examen de `cb3e22d442a62421f3449518df93559569f29709`, limité à `L1-fr-ja-03` et `L1-fr-ko-03`. **Aucune source, maquette ou donnée d’exécution n’est modifiée.** Le [patch concret](registre-ja-ko-proposition.patch) est une proposition pour un lot source séparé ; ses avant/après et empreintes sont dans [registre-ja-ko-proposition.json](registre-ja-ko-proposition.json).

## Défaut et correction recommandée

Les deux premières demandes sont traduites par « Je veux… », alors que `ください` et `주세요` servent déjà ici à demander poliment quelque chose à l’interlocuteur. Les sources présentent ensuite des demandes comparables avec « s’il vous plaît ». Cela risque de faire lire comme une montée de politesse ce qui est surtout une nouvelle quantité ou un compteur.

La correction minimale recommandée est **« Je voudrais {s}, s’il vous plaît. »**, avec une apostrophe droite comme dans les sources. Cette forme conserve les quatre groupes `slot.native` tels quels et permet de vérifier littéralement le modèle français avec chaque variante. Le conditionnel français est une traduction idiomatique de la demande : il ne signifie pas que le japonais ou le coréen vient d’introduire un temps ou une forme nouvelle.

| Champ natif, identique dans les deux unités | Avant | Après proposé |
| --- | --- | --- |
| Modèle | Je veux {s}. | Je voudrais {s}, s’il vous plaît. |
| Variante 0 | Je veux un café. | Je voudrais un café, s’il vous plaît. |
| Variante 1 | Je veux de l’eau. | Je voudrais de l’eau, s’il vous plaît. |
| Variante 2 | Je veux un billet. | Je voudrais un billet, s’il vous plaît. |
| Variante 3 | Je veux un sandwich. | Je voudrais un sandwich, s’il vous plaît. |

L’orthographe des fichiers proposés, notamment les apostrophes, figure exactement dans le JSON et le patch. Les titres, dont « Dire ce qu’on veut », ne sont pas retouchés dans ce lot minimal. Les mots étudiés restent `コーヒーをください。`, `水をください。`, `切符をください。`, `サンドイッチをください。` et leurs quatre homologues coréens déjà présents.

## Vérification contre les autres unités et dialogues

- **Japonais `L1-fr-ja-09` :** `コーヒーをお願いします。` est rendu « Un café, s’il vous plaît. ». Il s’agit d’une autre formule de demande ; ce rapprochement ne les rend pas grammaticalement identiques et ne fixe pas une hiérarchie universelle entre elles.
- **Japonais `L2-fr-ja-01` :** `コーヒーを二つください。` est rendu « Deux cafés, s’il vous plaît. ». La finale `ください` existe déjà en L1 ; les groupes avec quantité et compteurs constituent la nouveauté de cette reprise. Les tours `L2-fr-ja-d1/0`, `L2-fr-ja-d1/4` et `L2-fr-ja-d2/4` confirment la traduction polie.
- **Coréen `L1-fr-ko-09` :** `커피 하나 주세요.` est rendu « Un café, s’il vous plaît. ». Le tour du client `L1-fr-ko-d1/2` reprend exactement cette phrase et ce sens. La formule `주세요` est déjà présente dans `L1-fr-ko-03` ; `하나` ajoute une quantité.
- **Coréen `L2-fr-ko-01` :** le modèle natif est déjà « Je voudrais {s}, s’il vous plaît. » ; `커피 두 잔 주세요.` porte la quantité et le compteur nouveaux. Les dialogues L2 conservent le même sens de demande polie.

Les références complètes, avec texte, sens, phonétique et lecture quand présente, sont copiées au caractère près dans le JSON de proposition. La petite variation `djou-sé-yo` / `djou-sè-yo` entre les sources coréennes demeure inchangée ; elle n’est pas un motif de correction dans ce lot de traduction.

## Étendue exacte et garde

Le patch remplace **dix champs `native`** : modèle et quatre variantes dans chacune des deux unités. Il ne change aucun `slot`, texte étudié, phonétique, lecture, situation, pratique, niveau, ordre d’unité, dialogue, autre unité ou autre couple. Dans la comparaison virtuelle des deux fichiers complets :

- **0 changement de champ hors `native`**, structure JSON identique ;
- **708 valeurs `study` / `phon` / `reading` inchangées**, métadonnées homonymes des fichiers comprises ;
- **352 valeurs situées dans les `slot` inchangées**, leurs sens français compris ;
- modèle natif proposé reproduisant exactement les quatre variantes avec les groupes natifs conservés ;
- diff limité aux dix lignes natives, sans reformatage du reste des fichiers ;
- `git apply --check` réussi, **sans appliquer le patch**.

La garde actuelle protège les sources figées de `bcd108d`. Appliquer cette correction dans le dossier validé invaliderait normalement cette égalité de sources et ses copies de sens français : il ne faut ni la contourner, ni réécrire silencieusement les preuves de `cb3e22d`. Le lot source suivant devra annoncer les dix changements, actualiser explicitement les références qui recopient ces sens et garder la protection de toutes les aides. Aucune baisse de nouveauté ou nouvelle compétence ne peut être déduite d’une correction du sens français.

La proposition attend la revue croisée ; elle ne constitue pas une certification native de l’ensemble des scènes. Les sept scènes L1 déjà préparées restent dans leur lot propre, avec leur relecture native à compléter. Rien n’est fusionné ni publié.
