# Relecture des essais amendés (chinois, coréen)

Objet : `a219aa1` et `82ddba4` sur `review/familles-huit-corrections`, avec la réponse de Codex à mon avis du 21 octobre. Relecture des fichiers réels : `pilotes-progression/data.js`, les deux annexes `received-*.json`, le contrat d'essai, et les sources citées, vérifiées contre `DECKS` et les 110 JSON. Rien n'est fusionné ni publié.

## Verdict

**Les essais sont bons et le contrat `received` est meilleur que ce que j'avais proposé.** Les quatre index du catalogue cités sont exacts au texte près — ce qui n'était pas acquis après l'affaire des 853 références fausses, et mérite d'être dit. Les deux annexes tiennent la distinction qui manquait, avec trois précisions que je n'avais pas vues : `sourceCommit` comme repère de provenance, la vérification que le tour reçu appartient bien à l'autre rôle (A n'est pas présumé apprenant), et « une liste absente est une omission, pas une clôture implicite ». Je les reprends.

**Mais un défaut bloque la déclinaison aux sept couples : les deux pilotes n'instancient pas la même progression.** Ce n'est pas un détail de rédaction, c'est la forme qui va être copiée quatorze fois. Détail au § 2.

Trois objections de Codex sont fondées et je les accepte sans réserve (§ 1). Quatre défauts de contenu sont vérifiés et corrigeables à coût faible (§ 3). Une divergence de convention phonétique, mesurée, doit être tranchée avant la déclinaison et pas après (§ 4).

## 1. Les trois objections de Codex, vérifiées et acceptées

**我要 + action existe : ma règle était fausse.** Vérifié, et largement : `我要去商店`, `我要买这个`, `我要走了`, `我要点餐`, `我要退货`, `我要洗一下手`, `我要复习功课`, `我要改签`, `我要回去了`, `我要去睡了`. Une règle « 我要 + chose / 我想 + action » aurait été démentie par le catalogue lui-même. Le repère scopé « ici, 我想 sert à dire ce que tu veux faire » est le bon choix.

Je propose seulement de lui donner sa raison, parce qu'elle est lisible dans les traductions françaises déjà écrites par Codex : **我想 est rendu « je veux » partout, 我要 bascule sur « je vais » et « je dois »** (我要去商店 « je vais au magasin », 我要回去了 « je dois y retourner », 我要洗一下手 « je dois me laver les mains », 我要复习功课 « je dois réviser mes leçons »). La différence n'est pas objet/action, c'est **envie contre intention arrêtée ou nécessité**. Elle n'a pas à être énoncée comme grammaire à cette étape, mais si un jour une note de famille doit distinguer les deux, c'est celle-là, et elle est déjà portée par le contenu.

**우유 드릴까요 n'est pas équivalent à 우유 넣을까요.** Codex a raison et ma proposition était mauvaise : 넣다 porte sur l'ajout du lait dans la boisson, 드리다 sur le fait d'en servir. Dans un café, c'est bien l'ajout qui est en jeu. Remplacer l'un par l'autre pour économiser une brique aurait changé l'intention de la réplique — exactement le défaut que je reproche ailleurs. Le lait sort de la scène d'entrée, c'est la bonne décision et elle rend ma proposition sans objet.

**Cinq cartes disponibles ne sont pas cinq acquis.** Accepté, et la formulation de Codex est plus juste que la mienne : « un lien éditorial vérifie un ordre prévu, pas ce que la personne sait ». J'avais écrit « coût nul », ce qui était vrai du coût de rédaction et faux de la préparation. La remarque sur 괜찮아요 est un bon relevé linguistique : les sens catalogués « ça va / ce n'est pas grave » ne préparent pas le refus poli, qui est un emploi distinct. À retenir pour la scène élargie.

## 2. Le défaut qui bloque la déclinaison : deux progressions différentes

La méthode annoncée est : **entendre et comprendre → imiter une phrase complète → remplacer un élément préparé → combiner et converser.** Les deux pilotes ne la suivent pas dans le même ordre.

| | Chinois (`fr-zh-envie`) | Coréen (`fr-ko-demande`) |
|---|---|---|
| 1 | Comprendre — 我想休息 | Comprendre — 커피 주세요 |
| 2 | Imiter — 我想休息 | Imiter — 커피 주세요 |
| 3 | **Comprendre l'autre — 好的** | **Remplacer — 물 주세요** |
| 4 | **Échanger — scène visible** | Comprendre l'autre — salutation |
| 5 | Préparer — 我想回家 + 回家 | Comprendre l'autre — question du serveur |
| 6 | **Remplacer — comparaison** | **Échanger — scène visible** |
| 7 | Choisir et réutiliser | Choisir et réutiliser |

**Le coréen suit la méthode énoncée. Le chinois place l'échange en quatrième position, avant toute substitution, puis revient préparer et remplacer.** L'apprenant chinois converse avec une seule phrase, puis repart apprendre ; l'apprenant coréen a varié sa phrase avant de rencontrer son interlocuteur.

Les deux formes sont défendables isolément — commencer par un échange minimal est motivant — mais elles ne peuvent pas être livrées ensemble comme un même parcours, et moins encore servir de modèle à quatorze fichiers. Il faut choisir, et le choix a une conséquence pédagogique réelle : l'ordre coréen fait de l'échange l'aboutissement du remplacement ; l'ordre chinois fait du remplacement un ajout après un premier échange réussi.

Mon avis : **retenir l'ordre coréen**, parce qu'il est celui de la méthode et parce que la quatrième étape de l'ordre chinois (« Ton premier échange visible », 我想休息 → 好的) n'est pas un échange mais une phrase suivie d'un acquiescement, ce qui la rend peu différente de l'étape « Comprendre l'autre » qui la précède immédiatement. Si l'ordre chinois est retenu malgré tout, il faut qu'il le soit pour les sept couples et que la méthode soit réécrite en conséquence.

Point voisin, plus léger : `levelLabel` vaut « Classement L2 provisoire » côté chinois et « Essai du chemin L1 » côté coréen. Deux natures d'étiquette pour deux pilotes qu'on compare. Et le pilote chinois étiqueté L2 s'appuie sur 我想休息 (`lv2`), 回家 (`lv2`) mais 我想回家 (**`lv3`**) : un niveau d'écart sur la phrase cible de la substitution. C'est bénin comparé aux écarts 4→8/10 relevés dans l'audit, mais c'est le même mécanisme, et c'est le moment de ne pas le reproduire.

## 3. Quatre défauts de contenu vérifiés

**a. La salutation est entendue deux fois, de deux personnes différentes.** À l'étape `ko-greeting`, 안녕하세요 ! est attribué à « Une personne au café » (`kind: support`). À l'étape suivante `ko-received`, le bloc reçu est « 안녕하세요. 뭐 드릴까요 ? », attribué à « Serveur ». L'apprenant est donc salué, puis salué de nouveau par quelqu'un d'autre. Et la « personne au café » n'apparaît plus ensuite : elle est orpheline dans les étapes `ko-visible` et `ko-choice`.

Deux corrections possibles, les deux simples : attribuer la salutation au **Serveur** dès `ko-greeting` (un seul interlocuteur, c'est d'ailleurs conforme à l'usage coréen où le personnel salue le premier), ou garder la préparation séparée et réduire le bloc reçu à **뭐 드릴까요 ?** seul, puisque la salutation vient d'être présentée. La seconde a ma préférence : elle isole la vraie nouveauté et évite de redonner en bloc une phrase déjà traitée.

À noter en passant : dans le dialogue source, 안녕하세요 ! est la réplique du **Client**, donc de l'apprenant. Le pilote la réassigne à l'autre rôle. C'est une recomposition légitime et Codex l'annonce, mais elle a une conséquence à assumer : **l'apprenant ne produit aucune salutation dans tout le pilote.** Pour une première scène de café, c'est acceptable ; pour la scène élargie, saluer est la première chose à préparer en production.

**b. Le registre de 주세요 est faux en L1, et seulement en L1.** Même construction coréenne, deux traductions françaises selon le niveau :

| Source | Coréen | Français |
|---|---|---|
| `L1-fr-ko-03` | `{s} 주세요.` | « **Je veux** {s}. » |
| `L1-fr-ko-09` | `{s} 하나 주세요.` | « Un {s}, **s'il vous plaît**. » |
| `L2-fr-ko-01` | `{s} 주세요.` | « **Je voudrais** {s}, s'il vous plaît. » |
| `L1-fr-ko-d1` | `커피 하나 주세요.` | « Un café, **s'il vous plaît**. » |

주세요 est une demande polie (-세요 honorifique, littéralement « donnez-moi, je vous prie »). « Je veux un café » est à la fois impoli en français et inexact sur le coréen. Conséquence directe sur le pilote, dont c'est la **première phrase** : l'apprenant imite une phrase dont le sens lui est mal décrit, puis retrouvera la même forme en L2 présentée comme plus polie, alors que rien n'a changé en coréen. Il croira avoir appris une tournure nouvelle.

Le défaut est dans le contenu source, pas dans le pilote, et sa portée est **exactement deux couples sur six** :

| Couple | Modèle `L1-03` | Français | Registre |
|---|---|---|---|
| fr→en | `I want {s}.` | Je veux {s}. | ✔ |
| fr→es | `Quiero {s}.` | Je veux {s}. | ✔ |
| fr→zh | `我要{s}。` | Je veux {s}. | ✔ |
| fr→it | `Vorrei {s}.` | Je voudrais {s}. | ✔ |
| fr→ja | `{s}をください。` | Je veux {s}. | **✘** |
| fr→ko | `{s} 주세요.` | Je veux {s}. | **✘** |

Même cause dans les deux cas : ください et 주세요 portent la politesse dans la forme verbale, pas dans un auxiliaire, et la traduction l'a perdue. L'italien, où la politesse passe par un conditionnel, est correctement rendu — le contenu est donc déjà sensible au registre, il a seulement manqué les deux langues où la marque est morphologique.

La correction est petite et la bonne formulation existe déjà dans les mêmes fichiers : « {s}, s'il vous plaît. » Elle rend aussi `L1-03` et `L1-09` distincts par ce qui les distingue réellement en coréen, c'est-à-dire 하나. **Elle touche les 110 JSON, que ce lot ne modifie pas** : c'est donc une décision à prendre, pas une retouche à glisser. Mais la prendre après la déclinaison aux sept couples coûterait quatorze fichiers de plus.

**c. La phonétique de la première phrase chinoise est la moins bonne des deux présentes au catalogue.** 休 (xiū) y est rendu de deux façons :

| Carte | `phf` |
|---|---|
| `lv2 我想休息` ← **utilisée par le pilote** | ouo chyang **chyo** chi |
| `lv3 休息一下` | **chyo** chi i chya |
| `lv7 辛苦了，好好休息吧。` | … hao hao **chyoou** chi ba |
| `lv8 ——你昨天做了什么？——我在家休息。` | … ouo dzaï djya **chyoou** chi |
| `lv10 我劝他休息，他反而更忙了。` | … ta **chyoou** chi … |

`chyoou` conserve la diphtongue de xiū ; `chyo` la perd et se lit [ʃjo]. Le pilote hérite de `chyo`. Correction d'une carte : `ouo chyang chyo chi` → `ouo chyang chyoou chi`. Je ne demande pas d'harmoniser tout le catalogue ici, seulement de ne pas asseoir un essai sur la variante la moins fidèle de sa toute première écoute.

**d. `preparedInStep` ne sait pas exprimer une préparation partielle.** Dans les deux annexes, l'élément reçu porte `preparedInStep` égal à l'identifiant de l'étape où il apparaît (`zh-received` dans `zh-received`, `ko-received` dans `ko-received`). Le champ est donc toujours autoréférentiel pour un reçu et ne transporte aucune information. Surtout, il perd la seule relation intéressante du pilote coréen : le bloc `L1-fr-ko-d1-t1` contient 안녕하세요, préparé à l'étape précédente `ko-greeting`, et rien ne l'enregistre. Soit le champ est renommé (`introducedInStep`) et l'on ajoute de quoi dire « partiellement préparé par », soit la correction **3a** le rend sans objet en retirant la salutation du bloc reçu — ce qui est une raison de plus de la préférer.

## 4. Divergence de convention phonétique, mesurée

Codex écrit que `phf` fait foi et que `phFR`, parfois fragmentaire, ne le remplace pas. Vérifié, et `phFR` est pire que fragmentaire : pour 回家 il vaut `houí-djiā`, pour 我要去商店 `tchù`, pour 我要买这个 `mǎi` — une glose de la syllabe difficile seule, avec des diacritiques du pinyin. `phf` est bien le bon champ.

Mais `phf` et le champ `phon` du contenu conversation ne transcrivent pas les mêmes sons de la même façon, et le partage est total, pas mélangé :

| Syllabe | Catalogue (`phf`) | Contenu conversation (`phon`, fr→zh) |
|---|---|---|
| xiǎng 想 | **chyang** — 170 cartes | **siang** — 24 occurrences |
| | siang — 1 carte (isolée) | chyang — 0 |
| qù 去 | **tchu** — 155 cartes | **tchü** — 77 occurrences |
| | tchü — 0 | tchu — 0 |
| xǐhuan 喜欢 | — | **si-houan** — 31 occurrences |

Les deux corpus sont chacun cohérents et mutuellement contradictoires. Le pilote chinois n'en souffre pas, puisqu'il est intégralement sourcé au catalogue : c'est précisément pourquoi je le signale maintenant. **La déclinaison aux sept couples prendra ses phrases dans les 110 JSON, et c'est là que le même mot s'écrira `chyang` dans le deck et `siang` dans « Mes phrases ».**

Sur le fond, le catalogue a raison là où ça compte : x- du pinyin est [ɕ], que le « ch » français [ʃ] approche nettement mieux que le « s » [s]. `chyang` et `chi-houan` valent mieux que `siang` et `si-houan`. Pour 去, « tchu » et « tchü » se lisent tous deux [tʃy] par un lecteur français — l'écart est cosmétique.

Donc : **aligner le contenu conversation sur la convention du catalogue** (x → ch), par script, annoncé et vérifié, pas en silence — Codex a raison de refuser une harmonisation silencieuse. L'ordre de grandeur est modeste, 55 occurrences sur fr→zh, et il faut le mesurer sur zh→fr et les autres couples avant de décider. À faire avant la déclinaison, pour la même raison qu'au § 3b.

Je n'étends pas la remarque au reste de la convention, mais je note pour mémoire que `houèï` (huí) repose sur un « h » muet en français et que l'oreille 👂 porte seule le son réel — ce qui est conforme à la méthode, l'approximation n'ayant jamais prétendu remplacer l'écoute.

## 5. Le contrat `received` : accord, et deux manques

Je reprends le contrat tel qu'il est, y compris ce que je n'avais pas prévu : les sources typées `dialogueTurn` / `catalogue` qui évitent un faux `dialogueId` pour 好的, la relecture du rôle, le refus du collage phonétique, `countsAsProduction:false`, et le maintien du reçu dans l'audit du dialogue sans crédit productif. La séparation « production préparée » / « réception » dans les bilans est le bon arbitrage : elle empêche qu'une étiquette nouvelle améliore mécaniquement les pourcentages de l'audit.

Deux manques :

1. **Le point 3d** : pas de moyen d'exprimer une préparation partielle.
2. **Chaque pilote n'exerce que la moitié du contrat.** Le chinois ne contient aucun `answerWith` (sa réplique reçue est une clôture, `replyRequired:false`) ; le coréen ne contient aucune clôture (`replyRequired:true` partout). Les 21 tests couvrent les deux branches, mais aucun pilote ne montre le cycle complet **question reçue → réponse préparée → clôture reçue**, qui est pourtant la forme d'un échange réel. Le chinois s'y prête en trois lignes : 我想回家 → une question du proche → 好的 en clôture. Sans cela, on validera la déclinaison sur deux demi-cycles.

## 6. Ce que je ne peux pas juger

Le naturel des répliques coréennes du serveur, que `reviewStatus` signale déjà (« Relecture linguistique requise »), et la qualité des voix, l'audio des maquettes étant simulé. Mon accord sur `deu-ril-kka-yo` et `kouèn-tchan-a-yo` porte sur la fidélité à la convention francophone, pas sur une validation native. Pour le chinois, `chyoou chi` est une correction interne au catalogue, pas un avis de locuteur.

## 7. Ordre proposé

1. **Trancher la progression** (§ 2) — c'est le seul point dont dépend la forme des quatorze fichiers.
2. **Corriger la salutation dédoublée** (§ 3a) et, par ricochet, le champ `preparedInStep` (§ 3d).
3. **Décider du registre de `L1-03` en ja et ko** (§ 3b) et de **l'alignement phonétique zh** (§ 4). Les deux touchent les 110 JSON : ce sont des décisions de Kartech, et elles coûtent moins cher maintenant qu'après la déclinaison.
4. **Compléter un pilote en cycle entier** (§ 5.2), puis corriger `chyoou` (§ 3c).
5. Déclinaison aux sept couples, puis transitions L1→L2, L4→L5, L6→L7, L9→L10.

Les quatre décisions en attente sur le parcours, L1, les rubriques et les priorités ne bloquent aucun des points 1 à 4. Elles bloquent le point 5, qui fixe ce que voit l'apprenant à l'entrée.
