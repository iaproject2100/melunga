# Lot 3 — couverture et contenu séparé du raccord

Référence des avant : `3df885d`. Preuves de Claude : `d06a62e`. Ce contrôle relit les valeurs et le périmètre ; il ne prétend pas reproduire la lecture linguistique des 4 217 positions ni certifier la prononciation native.

## Couverture réconciliée

Le périmètre annoncé représente **4 181 cartes canoniques L3–L10 et 36 modèles reçus fr→zh, soit 4 217 positions**. Il contient **4 215 identifiants distincts** : `catalogue:zh:2414` et `catalogue:zh:3907` sont à la fois canoniques L5 et modèles reçus. Chacun de ces deux IDs conserve le même statut dans ses deux rôles.

`couverture.json` contient **4 228 lignes et 4 226 IDs distincts**. Les 11 compléments correspondent exactement aux neuf aides retrouvées en L1/L2 et aux deux modèles reçus zh→fr de la règle C. **Aucun ID du périmètre attendu ne manque**, et chaque couple ID/rôle de lecture possède une ligne. Les compteurs déclarés se reproduisent : 3 664 vérifiés, 332 propositions, 25 gloses, 116 incertains, 91 corrigés.

Les 91 identifiants corrigés correspondent exactement à l’union des 90 événements phonétiques et cinq événements de lecture. Le statut glose couvre 25 IDs sur 26 certains : `4812` est déjà marqué corrigé pour sa phonétique, mais sa correction de sens reste un sujet séparé. Les catégories ne sont donc pas des listes de tâches exclusives. Aucun statut vérifié ne masque un événement dans les registres de suivi.

Une convention sur `catalogue:zh:2818` (L1) ne figure pas dans ce registre de couverture. Elle est hors du périmètre L3–L10 ; conserver son suivi ouvert sans en déduire un manque dans ces huit cellules.

## Trois dossiers qui ne changent pas le runtime dans ce raccord

| Dossier | Compte exact | Résultat de la contre-vérification |
|---|---:|---|
| Gloses/contenu | 101 événements / 99 IDs ; 27 certains / 26 IDs ; 74 incertains | Avant et études tous exacts ; 26 champs native et 1 champ study dans les 27 certains |
| Niveaux/thèmes | 340 IDs : 261 thèmes, 78 niveaux, 1 doublon | 180 destinations concrètes existent avec leur titre au même niveau ; 81 restent à contextualiser |
| Conventions | 58 lignes / 57 IDs : 50 phon et 8 reading | Avant exacts, aucune application ; 1520 apparaît pour deux champs |

Le booléen `destinationExistsAtSameLevel` vaut aussi true pour les 81 lignes « à contextualiser ». Il ne faut pas le compter comme une destination validée : ces lignes ne nomment justement aucun thème à appliquer. Pour les 180 destinations réellement nommées, ID et titre existent au niveau concerné ; cela ne démontre pas encore leur adéquation sémantique.

Les 78 propositions de niveau restent à discuter. Par exemple `2139` contient une condition explicite en 如果…就… : son sujet quotidien ne suffit pas à justifier L2, alors que le plan commun prépare la condition en L7. Les dialogues `1535` et `1637`, proposés pour L1, contiennent deux rôles et respectivement vingt-cinq et trois heures et demie ; l’intention simple ne ferme pas ces prérequis. Aucun déplacement n’est appliqué par ce contrôle.

## Lecture des 27 lignes déclarées certaines

**22 après de glose peuvent être retenus sans changer la cible**, dont `2660` avec un motif à rectifier. Trois après demandent une formulation ajustée : `2165`, `3767`, `1110`. Les deux lignes de `1900` constituent une correction de contenu indissociable ; elles ne doivent pas être appliquées isolément.

| Carte / champ | Avis | Point concret |
|---|---|---|
| `catalogue:zh:2165` / `native` | Après à ajuster | La concession de 退一步说 ne signifie pas en général un scénario défavorable. « Au pire » est trop restrictif. Proposition : « même en admettant que ce soit un peu plus cher, ça vaut le coup ». |
| `catalogue:zh:4796` / `native` | Après de glose acceptable | 不惑 signifie ne plus être dans le doute/confusion ; l’après évite « sans doute » compris comme probablement. |
| `catalogue:zh:602` / `native` | Après de glose acceptable | 上传 est l’envoi vers un service distant ; mettre en ligne convient sans nécessairement rendre public. |
| `catalogue:zh:2317` / `native` | Après de glose acceptable | Conseil convient au sens ciblé par should ; 应该 possède aussi des emplois d’attente/probabilité non couverts ici. |
| `catalogue:zh:2318` / `native` | Après de glose acceptable | Obligation correspond à děi, déjà sélectionné par la glose must ; ne pas généraliser aux autres lectures de 得. |
| `catalogue:zh:666` / `native` | Après de glose acceptable | Le temps du before est erroné. Ne mélangeons pas tout restitue la séparation des affaires ; la première parenthèse peut être allégée. |
| `catalogue:zh:880` / `native` | Après de glose acceptable | Retour/échange correct, sans faire du client celui qui rembourse. |
| `catalogue:zh:3452` / `native` | Après de glose acceptable | Durée de conservation, non date précise. |
| `catalogue:zh:3433` / `native` | Après de glose acceptable | Directeur d’une fonction/département est adéquat au contexte courant ; les équivalences de titres d’entreprise ne sont pas universelles. |
| `catalogue:zh:845` / `native` | Après de glose acceptable | Le before de précarité est un contresens. L’après rend les répercussions, mais « ébranler » peut être remplacé par une formulation neutre si le contexte ne les juge pas négatives. |
| `catalogue:zh:898` / `native` | Après de glose acceptable | 自卑 signifie ici un lieu bas, et non le sentiment de dévalorisation. L’après est français et fidèle. |
| `catalogue:zh:2452` / `native` | Après de glose acceptable | Je t’envie restitue directement 羡慕 ; sans malveillance est une nuance habituelle, pas une garantie psychologique absolue. |
| `catalogue:zh:1110` / `native` | Après à ajuster | Le retrait de demi est fondé (一码 = une taille/pointure), mais la formulation française est maladroite. Si le chinois 增大一码的版本 est aussi réécrit, il faudra une nouvelle lecture et une nouvelle aide entières. Proposition : « Existe-t-il une version dans la taille au-dessus ? ». |
| `catalogue:zh:1149` / `native` | Après de glose acceptable | 一整天 est toute la journée, pas nécessairement depuis ce matin. |
| `catalogue:zh:3883` / `native` | Après de glose acceptable | 垃圾 désigne les déchets, pas leur récipient. |
| `catalogue:zh:3767` / `native` | Après à ajuster | Ni réflexion simple ni nécessairement pis aller : la locution introduit une concession. Proposition : « même en admettant que… / à supposer même que… ». |
| `catalogue:zh:2451` / `native` | Après de glose acceptable | Qui s’ennuie/ennuyeux lève l’ambiguïté française ennuyé = contrarié ou embarrassé. |
| `catalogue:zh:613` / `native` | Après de glose acceptable | L’après rend l’intensité et ne force pas le passé. Nuancer le motif : jalousie peut aussi se dire d’une envie sans hostilité en français. |
| `catalogue:zh:4141` / `native` | Après de glose acceptable | La valeur reçue dépasse le prix payé, pas une idée de surfacturation. |
| `catalogue:zh:1774` / `native` | Après de glose acceptable | Parole mordante qui n’épargne pas l’interlocuteur, pas nécessairement humour aimable. |
| `catalogue:zh:1900` / `study` | Lot étude/lecture/aide/sens lié | La suppression de 是知也 touche le texte étudié. Étude, lecture, aide entière et sens doivent être corrigés ensemble. La phonétique indiquée dans le reason du registre n’est pas une aide validée par ce raccord. |
| `catalogue:zh:1900` / `native` | Lot étude/lecture/aide/sens lié | L’après traduit la phrase après suppression de 是知也 ; il ne doit pas être appliqué seul à la cible actuellement plus longue. |
| `catalogue:zh:4378` / `native` | Après de glose acceptable | Coordination française plus naturelle et soignée ; ne pas confondre cette retouche avec un contresens chinois. |
| `catalogue:zh:4812` / `native` | Après de glose acceptable | Le terme de comparaison 小样 est rétabli. Lot de production serait plus idiomatique que grand lot, sans changement de cible. |
| `catalogue:zh:2660` / `native` | Après acceptable, motif à corriger | L’après est correct ; le motif attribue à tort le manque à 勿施于人, déjà rendu par ne fais pas à autrui. C’est le rendu français de 己所不欲 qui doit être complété. |
| `catalogue:zh:4504` / `native` | Après de glose acceptable | L’après rétablit 百战不殆 : absence de péril, sans promesse de victoire. Adversaire serait plus précis que l’autre en contexte militaire. |
| `heard-authored:fr-zh:piste-reclamation-tact-received-01` / `native` | Après de glose acceptable | Seules rétablit la restriction 只. Pièces présentant un problème serait plus explicite que pièces concernées, sans rendre ce dernier faux dans son contexte. |

Pour `1900`, supprimer la finale `是知也` impose une nouvelle phrase étudiée entière, sa lecture entière, son aide entière et sa traduction correspondante. L’aide suggérée dans un champ reason n’est pas un registre validé ni une permission de recomposer une phonétique. La vérification d’une édition de la citation et une relecture de la forme finale restent distinctes.

Ces avis sont pédagogiques et linguistiques bornés, pas une certification native. Les remarques sur les autres sens de 应该 ou 得 ne rendent pas fausse une glose qui cible explicitement un de leurs usages. De même, une préférence de style français ne doit pas être présentée comme un nouveau contresens chinois.

Les détails, valeurs avant/après et empreintes sont dans [contenu-couverture-preuves.json](contenu-couverture-preuves.json). Structure reproductible, sans import du producteur ni mutation des données :

```sh
python3 -B docs/niveaux-progressifs/reponse-revue-integrale-lot3/verifier_contenu_couverture.py
```

La couche phonétique/lecture est traitée séparément par le raccord du générateur. Ces trois fichiers ne modifient aucun contenu d’application, aide, prix ou accès et n’approuvent aucune fusion ni publication.
