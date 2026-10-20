# Revue Claude du dossier pédagogique

20 octobre 2026. Objet : `docs/revue-pedagogique/Melunga-progression-maquettes-pour-Claude.zip` au commit `6955d83`, préparé par Codex à partir de `feat/conversation-integration` @ `49dca94`. Rien n'est modifié, fusionné ni publié ; ce document est une relecture, la décision revient à Kartech.

## 1. Ce que j'ai vérifié, et qui tient

J'ai contrôlé les affirmations factuelles du dossier contre le contenu réel du commit audité, par script.

| Affirmation du dossier | Résultat du contrôle |
|---|---|
| 177 références `L<n>-<nat>-<étude>-<nn>` citées dans les documents | **177 existent**, aucune introuvable |
| 63 phrases citées entre guillemets avec leur référence | **63 correspondent au mot près** au contenu réel |
| 32 115 entrées dans les sept catalogues | **32 115** exactement |
| « L1 contient 224 à 318 cartes core selon la langue » | **exact** : es/zh 224, ja 262, ko 270, fr 272, en 308, it 318 |
| « 26 familles et 151 occurrences par langue » | **exact** pour les six langues configurées |
| Pas de configuration coréenne dans le parcours guidé | **confirmé** : `PEDAGOGY_FAMILIES.languages` = fr, en, es, zh, it, ja |
| Les 8 exemples de familles qui mélangent les constructions | **tous présents** là où le dossier les situe (« Je vais mieux. », « I'm going to bed. », « Voy a casa. », « a por agua », 我要两个 / 我要这个, « s'il vous plaît » en L4_CONDITION, « I think about you. » / « I believe in you. », « Secondo me… » en L4_CONDITION, もしかすると en L9_HYPOTHESE) |
| Exemples de sauts de difficulté L3 cause | **confirmés** (« avais promis », « had promised », « was cancelled because of », 正因为…才…) |

Les phrases nouvelles proposées comme ponts (chinois : 我要水 / 我要茶 / 请给我水 / 水还是茶？ / 一杯茶 / 我要两杯茶 / 我想喝水 / 你要水吗？ avec réponses 要 / 不要 / 想 / 不想 / 一起吃饭，好吗？ ; espagnol : Quiero agua / té, ¿Agua o té?, Dos tés por favor, Quiero beber / comer, ¿Quieres beber agua?, ¿Comemos juntos?) sont **correctes et naturelles**, y compris les sandhi notés (yì bēi, bú yào, liǎng bēi). Les précautions linguistiques du dossier sont justes et fines : 要 ≠ 想, 吃饭 ≠ 吃米饭, pas de oui/non universel, tutoiement à ne pas mélanger avec *usted*, pas de lecture autonome des caractères exigée pour un exercice oral.

**Conclusion sur la méthode d'audit : le dossier est fiable.** Je n'ai trouvé aucune affirmation fausse ni citation approximative. Deux imprécisions mineures de libellé : les exemples cités « es L2 demande » et « ja L2 désir » appartiennent tous deux à la famille `L2_DEMANDE_POLIE` (le nom de famille compte au moment de corriger) ; et « sept langues » désigne partout les langues **étudiées** — côté lecteur, le dossier ne couvre que fr et zh (voir §4).

## 2. Deux mesures que j'ajoute

Le dossier démontre le problème par des exemples. Je l'ai quantifié sur les 70 fichiers, pour donner un point de départ chiffré et un moyen de constater le progrès. Indicateur volontairement grossier : part des *briques* (mots, ou caractères pour zh/ja) d'un niveau jamais rencontrées aux niveaux précédents du même couple.

**Ce que ces chiffres ne sont pas.** Ils comptent des **types écrits**, pas de la compréhension : un mot déjà vu n'est pas un mot compris, un mot nouveau n'est pas forcément un obstacle (il peut être transparent, illustré ou porté par le contexte), et la forme écrite ignore les structures, les particules et l'oral. Ils ne mesurent donc aucun apprentissage. Leur seul usage légitime est **comparatif** : entre niveaux, entre couples de langues, et avant / après réorganisation.

**Briques nouvelles par niveau (moyenne des sept couples)**

| L1 | L2 | L3 | L4 | L5 | L6 | L7 | L8 | L9 | L10 |
|---|---|---|---|---|---|---|---|---|---|
| 100 % | **62 %** | 47 % | 49 % | 45 % | 33 % | 36 % | 41 % | 32 % | 31 % |

Une méthode d'assemblage suppose qu'on recombine surtout du connu. Aujourd'hui, à chaque niveau, **un tiers à deux tiers du lexique est inédit** ; le niveau 2, qui devrait surtout ajouter une quantité à une demande connue, renouvelle 62 % de son vocabulaire. Le coréen est le cas extrême (77 % en L2, encore 57 % en L10) ; le japonais et le chinois sont les plus économes (40 % et 51 % en L2).

**Briques des dialogues jamais préparées par les variantes du même niveau ni par les niveaux antérieurs**

| L1 | L2 | L3 | L4 | L5 | L6 | L7 | L8 | L9 | L10 |
|---|---|---|---|---|---|---|---|---|---|
| **51 %** | 24 % | 23 % | 16 % | 18 % | 14 % | 20 % | 20 % | 15 % | 18 % |

C'est la démonstration chiffrée du point 4 de l'audit : **au niveau 1, la moitié de ce que l'apprenant entend dans le dialogue n'a jamais été préparée**, alors que c'est l'exercice où on lui masque un rôle. Les plus exposés : `L1-fr-ko-d2` (82 %), `L1-fr-ko-d1` (69 %), `L1-fr-es-d2` (65 %), `L1-fr-it-d1` (60 %), `L1-fr-en-d2` (59 %).

Ces deux tableaux donnent une cible mesurable sans rien promettre sur l'apprentissage : *faire baisser ces pourcentages aux niveaux de réemploi*, sans jamais prétendre que le pourcentage mesure une compétence.

## 3. Ce que je valide dans la proposition

- **La cible L10 et les sept critères de sortie** : ils décrivent des capacités d'interaction, pas un volume. Bonne formulation, sans équivalence CECRL ni pourcentage de couverture.
- **La règle « une seule nouveauté principale »** et la séparation des familles qui mélangent les constructions : c'est la correction la plus rentable, et les exemples sont justes.
- **« Les leçons sont faites de phrases »** : conforme à ce qui est déjà construit (modèle, variantes, phrase complète qui fait autorité, phonétique du lecteur, audio).
- **Préparer ce que dit l'autre avant de masquer un rôle** : mesuré ci-dessus, c'est le défaut le plus net du contenu actuel.
- **Conserver la réserve** et ne rien reclasser automatiquement : les 32 115 entrées et les 110 fichiers conversation restent utiles tels quels.
- **La maquette `ordinateur-parcours.png`** : un seul parcours L1–L10 plus trois rubriques de consolidation. C'est la bonne réponse au problème des trois progressions parallèles.

## 4. Mes réserves

**4.1 — Ne pas rétrécir le niveau 1 ; le découper.** Le dossier propose un L1 centré sur le choix d'une boisson. Or le retour de Kartech après essai sur téléphone était l'inverse : « le contenu est très limité, c'est très scolaire ». Les deux constats sont compatibles, à condition de distinguer la **largeur du niveau** et la **largeur d'une séance** : L1 garde ses onze situations (identité, besoin, lieu, prix, goût, commande, dépannage…), mais l'apprenant en voit **une mini-séquence à la fois**, pas une liste de onze. L'écran doit annoncer « séquence 1 sur 5 — obtenir une boisson », pas un sommaire. Si l'on applique la fiche L1 telle quelle, Kartech retrouvera exactement l'impression qu'il a signalée.

**4.2 — Les « repères pour poursuivre » ne doivent pas devenir des verrous.** Ils sont écrits pour un observateur humain (« l'apprenant comprend l'intention du choix »). L'application n'a pas d'observateur. Ils doivent rester des repères pour les essais de Kartech et, au besoin, des questions d'auto-évaluation — jamais un déblocage automatique ni une note affichée. Sinon nous promettons une mesure que nous n'avons pas, ce que le dossier lui-même interdit ailleurs.

**4.3 — La dimension « lecteur » manque.** Le tableau des sept langues couvre les langues étudiées pour un lecteur francophone (plus zh→fr). Depuis aujourd'hui, le dépôt contient aussi quatre couples pour lecteurs anglophones (en→es, en→zh, en→it, en→ja), soit **onze couples**, et d'autres suivront (hispanophones, sinophones). Chaque pont doit être décliné par couple (lecteur, langue étudiée), car la phonétique et la traduction changent avec le lecteur ; seule la partie « langue étudiée » est commune. Sans cette précision, les ponts seront écrits une fois en français puis recopiés.

**4.4 — Le rôle de « Mes phrases » doit être tranché avant toute réalisation.** Dans la maquette, « Mon parcours » L1–L10 devient la colonne vertébrale et « Mes phrases » un atelier de consolidation. Mais aujourd'hui, le contenu L1–L10 **est** celui de Mes phrases (841 modèles, 3 364 variantes, 210 dialogues, rôles, réutilisations). Si l'on crée un parcours L1–L10 distinct, on recrée la duplication que l'audit dénonce. Ma recommandation : **les fichiers conversation deviennent la colonne vertébrale du parcours**, les familles guidées deviennent la sélection de cartes à l'intérieur de chaque étape, et les catalogues restent la bibliothèque. Un seul chemin, trois réserves.

**4.5 — Le coréen est en retard sur deux plans**, pas un seul : pas de configuration dans le parcours guidé, et le contenu conversation est celui qui réemploie le moins (77 % de briques nouvelles en L2 ; sur l'ensemble des dialogues L1, 36 % des types sont préparés par les variantes, contre 49 à 63 % pour les autres couples). À traiter ensemble.

> *Correction du 20/10, après relecture de Codex :* une version antérieure de ce paragraphe annonçait « dialogues L1 préparés à 18 % ». Ce chiffre ne vaut que pour **un** dialogue, `L1-fr-ko-d2` (À la gare, 4 types préparés sur 22). Le détail réel : d1 Au café 31 %, d2 À la gare 18 %, d3 Première rencontre 52 %, ensemble 36 %. L'erreur portait sur ce seul paragraphe ; les tableaux du §2 étaient corrects.

## 5. Ce que je propose d'ajouter

**5.1 — Une couche « séquence », sans renumérotation.** Ne déplacer aucune carte, ne renuméroter aucun niveau. Ajouter un fichier par couple, `content/conversation/seq-<nat>-<étude>.json`, qui ordonne l'existant :

```json
{ "level": 1, "sequences": [
  { "id": "S1-fr-es-01", "title": "Obtenir une boisson",
    "steps": [ {"use": "L1-fr-es-03", "variants": [0,1]},
               {"bridge": "pont-es-001"},
               {"use": "L1-fr-es-09"},
               {"dialogue": "L1-fr-es-d1", "listenFirst": true} ],
    "introduces": ["quiero", "agua", "té"], "received": ["¿Agua o té?"] } ] }
```

Tout est réversible : si la séquence n'existe pas, l'application se comporte comme aujourd'hui. Les 110 fichiers, `DECKS` et `PEDAGOGY_FAMILIES` ne sont pas touchés.

**5.2 — Rendre la règle « une seule nouveauté » vérifiable par machine.** Deux champs par unité : `bricks` (les groupes de sens employés) et `introduces` (ce que l'unité fait découvrir). `validate.py` refuse alors toute unité employant une brique qui n'a été introduite nulle part avant — la règle cesse d'être une intention et devient une contrainte de construction, tenue sur 110 fichiers et sur ceux à venir. C'est la seule façon qu'elle survive à l'ajout de langues.

**5.3 — Un champ `received` par unité.** Une à trois phrases que l'apprenant doit **comprendre** (la question du serveur, la réponse possible), présentées avant le dialogue masqué. Elles existent déjà pour l'essentiel dans les dialogues : il s'agit de les remonter au niveau de l'unité. C'est la correction directe du 51 % mesuré au L1.

**5.4 — Un indicateur de régression.** Intégrer les deux mesures du §2 au validateur, en avertissement et non en erreur, pour qu'un ajout de contenu qui dégrade la préparation se voie immédiatement.

## 6. Ordre de travail que je recommande

1. **Décider le §4.4** (rôle de Mes phrases / parcours) — c'est la seule décision qui bloque tout le reste ; elle appartient à Kartech.
2. Corriger les **huit familles** qui mélangent les constructions : peu coûteux, sans effet sur la numérotation, gain immédiat.
3. Écrire la **couche séquence pour deux couples seulement** (fr→es et fr→zh, L1 à L3), avec les ponts du dossier, puis essai de Kartech sur les trois supports.
4. Ajouter `bricks` / `introduces` / `received` et les contrôles au validateur, sur ces deux couples d'abord.
5. Étendre aux neuf autres couples **seulement après** l'essai, en commençant par le coréen (le plus en retard).
6. Combler la configuration guidée coréenne.

Les étapes 2 à 4 ne modifient ni le site ni l'application publiés ; elles restent sur branche jusqu'à validation.

## 7. Ce qui demande une décision de Kartech

- Parcours unique L1–L10 adossé aux fichiers conversation, ou maintien de deux entrées distinctes (§4.4) ?
- Le niveau 1 garde-t-il ses onze situations, découpées en mini-séquences (ma recommandation), ou se recentre-t-il comme dans la fiche (§4.1) ?
- Les trois rubriques de consolidation de la maquette (« Mes phrases », « Mes révisions », « La vie quotidienne ») remplacent-elles les rubriques actuelles, ou s'y ajoutent-elles ?
- Priorité : corriger la préparation des contenus existants (ce que je recommande) ou produire d'abord les nouvelles langues maternelles ?

Aucune réalisation, fusion ni publication avant ces réponses. La relecture native des contenus zh/ja/ko et du français pour sinophones reste requise et n'est pas couverte par cette revue pédagogique.
