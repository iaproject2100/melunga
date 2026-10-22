# Italien : pourquoi les quatre marches de longueur persistent

La [seconde relecture de Claude](verification-claude-corrigee.md) retire le grief concernant l’italien et constate une amélioration de la part de formes inédites. Ce document conserve l’analyse descriptive de la première demande. Les corrections de dépendances ci-dessous sont retenues pour leurs exemples sources précis ; elles ne sont pas présentées comme une réparation de la courbe de longueur.

Relecture ciblée de `99478df`, sans modification des sources ni de son classement exécuté. Les 120 unités italiennes et leurs 480 variantes ont été examinées, avec attention aux quatre frontières signalées et aux demandes L8.

## Conclusion

**Les 19 déplacements ont changé les moyennes, mais pas les quatre signes de baisse.** Treize déplacements se situent hors de L7/L8 ; dans ce voisinage, le départ de `Penso che` et l’arrivée de `Perché...` réduisent L7, tandis que trois demandes simples quittent L8 et qu’une proposition de solution y arrive. Cela améliore deux écarts et en aggrave deux : il ne faut déclarer ni « aucun effet mesurable », ni « italien réparé ».

Le mécanisme principal est identifiable : L7 contient des cadres longs de cause/comparaison et des contrastes à deux propositions ; L8 emploie souvent des demandes plus courtes qui condensent toutefois conditionnel, clitique, registre et lexique nouveau. La longueur et la préparation ne mesurent donc pas ici le même objet. Cette explication ne justifie pas de laisser une mauvaise dépendance : une correction concrète de `Secondo me` est proposée ci-dessous.

## Mesure descriptive reproduite

Formule : tokens Unicode `\w+` de chaque `study`, apostrophes séparées, moyenne des quatre variantes par unité et de toutes les unités du niveau. Les effectifs de chaque niveau varient ; il ne faut pas comparer des totaux bruts ni interpréter ces valeurs comme des niveaux de langue.

| Niveau | Moyenne source | Moyenne proposée `99478df` |
| --- | ---: | ---: |
| L1 | 3.363636 | 3.363636 |
| L2 | 4.173077 | 3.839286 |
| L3 | 3.363636 | 3.517857 |
| L4 | 4.729167 | 5.159091 |
| L5 | 4.604167 | 4.812500 |
| L6 | 5.395833 | 5.321429 |
| L7 | 6.416667 | 6.250000 |
| L8 | 5.875000 | 6.100000 |
| L9 | 6.166667 | 6.525000 |
| L10 | 6.096154 | 6.291667 |

| Frontière | Baisse source | Baisse proposée | Évolution de la baisse |
| --- | ---: | ---: | --- |
| L2>L3 | 0.809441 | 0.321429 | réduite |
| L4>L5 | 0.125000 | 0.346591 | accrue |
| L7>L8 | 0.541667 | 0.150000 | réduite |
| L9>L10 | 0.070513 | 0.233333 | accrue |

Le différentiel L7→L8 passe de **0,541667 à 0,150000 token moyen** (environ −72 % sur ce seul indicateur). Le différentiel L2→L3 diminue également ; L4→L5 et L9→L10 s’accentuent. Le nombre binaire de marches reste donc quatre. Les propositions ci-dessous sont à niveau constant et ne prétendent pas modifier cette courbe.

## Explication des quatre frontières

- **L2/L3 :** quantité, contenant et formule `per favore` occupent plusieurs mots dans les demandes de L2. Les questions `Cosa fai?` et réactions `Davvero?` sont courtes ; leur brièveté ne prépare ni le changement de verbe ni la fonction de relance. Conserver les demandes L2, plutôt que les remonter pour augmenter la moyenne de L3.
- **L4/L5 :** les cadres de routine, de proximité et de famille (`Nel mio quartiere`, `Nel tempo libero`, possessifs) allongent L4. Le passé peut être plus court (`Non ho capito.`) tout en ajoutant auxiliaire et participe. L’ordre activités courantes → récit passé reste défendable ; une longueur croissante n’en est pas la preuve.
- **L7/L8 :** `Qual è la differenza tra...` impose déjà un long cadre fixe et `Prima..., adesso...` juxtapose deux propositions. À L8, `Potrebbe`, `Sarebbe`, `Avrei`, `chiederle` et le vocabulaire de réservation/administration peuvent tenir dans moins de mots tout en demandant une préparation supplémentaire. C’est un effet d’enveloppe et de densité, étayé par les formes sources, pas une excuse générale tirée de la seule longueur.
- **L9/L10 :** L9 concentre maintenant des réparations longues (`Quello che voglio dire è che...`, incident suivi de `Cosa possiamo fare?`). L10 réemploie aussi des clôtures brèves et des changements de sujet. Les déplacer en bloc pour gonfler L10 introduirait d’autres erreurs de fonction ou de registre ; des entrées plus précoces éventuelles demanderaient de traiter les variantes séparément.

## Corrections ciblées proposées, à niveau constant

1. **Présenter les comparaisons avant les avis comparatifs.** `L7-fr-it-06` est aujourd’hui deuxième et utilise déjà `migliore` / `più buono`, avant `L7-fr-it-03` et `L7-fr-it-02`. Le placer sixième, après ces deux bases, ajouter leurs liens et garder une réserve sur la forme irrégulière. Les quatre ordres intermédiaires sont décalés de façon contiguë. C’est une réparation de dépendance réelle, sans déplacement de niveau.
2. **Relier le réemploi lexical dans la condition.** `L8-fr-it-03` reprend `sconto` de `L8-fr-it-07` : ajouter ce lien précis, sans dire que `fare` prépare automatiquement `fa`.
3. **Relier le contexte d’échéance.** `L8-fr-it-05` contient `entro venerdì` ; `L8-fr-it-08` présente plus tôt `una risposta entro domani`. Ajouter cette reprise prévue, sans déclarer déjà comprise ou productive la clause entière.
4. **Distinguer permission et condition.** Pour `L8-fr-it-10`, rapprocher la permission de `Potrei` (`L8-fr-it-02`) plutôt que faire reposer sa préparation sur le seul `se` de `Va bene, ma solo se...`. La réponse négative qui peut accepter la permission reste une lacune de scène reçue, à relire.

Les patchs exacts, les huit décisions à amender et dix décisions de maintien motivé figurent dans [italien-propositions.json](italien-propositions.json). Ils ne sont pas appliqués dans ce document. Les effets sur l’ordre doivent être vérifiés par le compilateur avant adoption.

## Préparation courte du contraste temporel

`L7-fr-it-07` reste un point de charge réelle : l’arrière-plan `Era...` de `L10-fr-it-11` (proposé L5) ne fournit pas les formes `lavoravo / prendevo / andavo / viaggiavo`. Déplacer le même bloc à L8 ne crée pas ces bases. Il faut distinguer entraînement des quatre phrases entières et généralisation productive du contraste.

Un candidat déjà existant peut préparer un premier cas : `DECKS.it[4020]`, niveau source 7, phrase **« Prima lavoravo a Parigi. »**, sens **« Avant, je travaillais à Paris. »**, aide `pf` **« pri-ma la-vo-ra-vo a pa-ri-dji »**. Il est recensé avec sa provenance dans le JSON, **pas importé, affiché ou entraîné dans le runtime de ce lot**. Aucun pendant autonome pour les trois autres verbes n’a été trouvé dans le catalogue ; ne pas fabriquer leur phonétique ni déclarer leur préparation par analogie. Un futur pont doit traiter ce manque explicitement.

## Trois déficits à ne pas confondre

- **Six réserves sur dix unités L8 :** lexique des documents/remises, compléments de demande, registres et polarité des réponses. Les premiers choix `fattura / copia` sont limités ; ils ne préparent pas `sconto / prezzo migliore` par simple remplacement.
- **52–54 % pour le bloc lexical L8 :** mesure de recouvrement du corpus de l’audit. Les liens proposés ne sont ni une nouvelle exposition lexicale mesurée, ni une révision de cette mesure. Aucun taux amélioré n’est revendiqué.
- **55 % de briques non préparées dans les dialogues italiens :** les dialogues n’ont pas été reclassés ou modifiés. Leur mise en préparation ne découle pas du seul reclassement des unités. Les questions, réponses reçues, tours du client et clôtures doivent être reliés à des phrases précises dans un lot distinct.

## Exemples sources qui motivent les décisions

- `L7-fr-it-06` — Secondo me contient déjà migliore et più buono ; l’unité était présentée en deuxième position, avant les comparaisons meno/più. La déplacer après L7-03 et L7-02 prépare la fonction comparative sans prétendre fournir le lexème irrégulier migliore.
  - v0 : « Secondo me, è troppo caro. »
  - v1 : « Secondo me, questo ristorante è migliore. »
  - v2 : « Secondo me, il vino rosso è più buono. »
- `L8-fr-it-03` — La condition Se mi fa uno sconto réemploie la remise déjà rencontrée dans Mi può fare uno sconto. Ajouter ce lien lexical précis à l’antécédent de futur et au refus ; il n’atteste ni acquisition du mot ni conversion de fare en fa.
  - v0 : « Se mi fa uno sconto, pagherò subito. »
  - v2 : « Se accetta la carta, pagherò subito. »
- `L8-fr-it-05` — La variante finiamo entro venerdì demande le repère de délai entro déjà présent dans una risposta entro domani. Ajouter cette reprise prévue, sans déclarer connue la clause entière ou ses formes verbales.
  - v1 : « Va bene, ma solo se finiamo entro venerdì. »
  - v2 : « Va bene, ma solo se il prezzo non cambia. »
- `L8-fr-it-10` — La fonction de permission de Le dispiace se est rapprochée de Potrei, plutôt que déclarée préparée par le seul se de Va bene ma solo se. Le problème de polarité et de réponse reçue reste entièrement ouvert.
  - v0 : « Le dispiace se apro la finestra? »
  - v2 : « Le dispiace se parcheggio qui? »
- `L2-fr-it-11` — Le cadre de petite quantité et per favore allonge la phrase sans multiplier à lui seul les transformations productives ; garder cet usage en L2, préparé comme demande entière.
  - v0 : « Un po' di zucchero, per favore. »
  - v1 : « Un po' di latte, per favore. »
- `L3-fr-it-03` — Cosa fai / vuoi / prendi / significa sont courts mais changent le verbe et l’intention. Leur longueur inférieure aux demandes de L2 ne justifie pas de les présenter comme plus faciles ni de remonter artificiellement ces demandes.
  - v0 : « Cosa fai? »
  - v1 : « Cosa vuoi? »
  - v2 : « Cosa prendi? »
  - v3 : « Cosa significa? »
- `L4-fr-it-11` — Nel mio quartiere porte un cadre locatif de plusieurs mots ; sa longueur est liée au contexte de description, avant le récit. La réduire en changeant seulement de niveau ne prépare aucun temps nouveau.
  - v0 : « Nel mio quartiere c'è un mercato. »
  - v2 : « Nel mio quartiere c'è un parco. »
- `L5-fr-it-09` — Non ho capito est court mais requiert un auxiliaire et un participe ; la phrase de routine plus longue ne prépare pas cette morphologie. Conserver le récit passé après les activités courantes.
  - v0 : « Non ho dormito. »
  - v1 : « Non ho capito. »
  - v3 : « Non ho visto niente. »
- `L7-fr-it-12` — La question Qual è la differenza tra... a un cadre fixe long, qui gonfle la moyenne L7 sans prouver davantage d’opérations nouvelles dans son groupe nominal.
  - v0 : « Qual è la differenza tra questo e quello? »
  - v1 : « Qual è la differenza tra i due menù? »
- `L7-fr-it-07` — Le contraste passé-habitude/présent justifie une préparation particulière ; le déplacer en L8 seulement pour supprimer le pic ne prépare pas lavoravo/prendevo/andavo/viaggiavo. Garder le placement candidat et signaler la nécessité d’un pont de forme avant généralisation productive ; les quatre phrases restent entraînables entières.
  - v0 : « Prima lavoravo in ufficio, adesso lavoro da casa. »
  - v1 : « Prima prendevo il treno ogni giorno, adesso lavoro da casa. »
  - v2 : « Prima andavo in ufficio ogni giorno, adesso lavoro da casa. »
  - v3 : « Prima viaggiavo molto, adesso lavoro da casa. »
- `L8-fr-it-07` — Les demandes nominales Mi può fare sont relativement courtes, mais fattura/copia/sconto/prezzo migliore changent le domaine lexical ; leur brièveté ne prépare pas les mots. Conserver le premier choix limité fattura/copia, sans déclarer le lexique résolu.
  - v0 : « Mi può fare uno sconto? »
  - v1 : « Mi può fare un prezzo migliore? »
  - v2 : « Mi può fare una fattura? »
  - v3 : « Mi può fare una copia? »
- `L8-fr-it-12` — Vorrei chiederle condense registre et clitique. La variante avec di lavorare change en outre le type de complément ; elle reste une expression entière malgré une longueur moyenne faible.
  - v0 : « Vorrei chiederle un giorno di ferie. »
  - v2 : « Vorrei chiederle di lavorare da casa il venerdì. »
- `L9-fr-it-02` — Quello che voglio dire è che constitue une longue enveloppe de reformulation. Ce cadre allonge L9 sans prouver que chaque mot du contenu est nouveau.
  - v0 : « Quello che voglio dire è che il treno è in ritardo. »
  - v3 : « Quello che voglio dire è che è meglio aspettare. »
- `L10-fr-it-05` — Les clôtures courtes de L10 sont des emplois discursifs hétérogènes, dont Salutami tutti avec impératif/clitique. Les avancer en bloc pour augmenter la moyenne L10 ne résout ni rôle ni formes ; une éventuelle entrée précoce devrait être variante par variante.
  - v0 : « Beh, devo andare. A presto! »
  - v1 : « È stato un piacere! »
  - v2 : « Ci sentiamo presto! »
  - v3 : « Salutami tutti! »

Toutes les citations d’énoncés ci-dessus sont copiées des variantes canoniques. Aucun texte, phonétique, lecture, accès, catalogue ou dialogue source n’est modifié. Aucun résultat d’apprentissage ou avis natif n’est attribué à cette analyse. Rien à fusionner ni publier.
