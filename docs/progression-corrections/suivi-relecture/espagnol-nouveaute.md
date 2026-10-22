# Espagnol : réexaminer la nouveauté, pas seulement compter les marches

Sources figées à `99478df`, couple `fr-es`. Cette note complète `espagnol.md` sans le remplacer et sans modifier les cinq premiers amendements. Les propositions supplémentaires sont dans `espagnol-nouveaute-propositions.json`. Elles concernent les métadonnées de découverte, de reprise et de réserve ; aucune phrase, phonétique ou traduction source n’est réécrite.

## Ce que change la seconde mesure

Le tableau corrigé de Claude est reproduit par l’hypothèse **variantes seules**, types de lettres Unicode en minuscules, sans lemmatisation, avec comparaison des pourcentages arrondis à l’entier. Il ne reprend pas le périmètre de l’ancien `mesure_briques.py`, qui ajoutait les dialogues. Les deux périmètres ne doivent pas être mélangés. L’ensemble « vu avant » signifie ici « présent dans les variantes des niveaux précédents », pas « appris ».

| Niveau | Source : types nouveaux / types du niveau | Source : part | Classement `99478df` : nouveaux / types | Part proposée |
| --- | ---: | ---: | ---: | ---: |
| L3 | 55 / 89 | 61,798 % | 59 / 103 | 57,282 % |
| L4 | 68 / 105 | 64,762 % | 70 / 110 | 63,636 % |
| L7 | 41 / 114 | 35,965 % | 37 / 107 | 34,579 % |
| L8 | 63 / 132 | 47,727 % | 39 / 92 | 42,391 % |

Deux signes montants restent visibles après arrondi, mais leur amplitude change :

- **L3→L4 se creuse : +2,964 → +6,355 points**, soit +3,391 points. Le ratio de L4 baisse légèrement, mais celui de L3 baisse davantage.
- **L7→L8 se réduit : +11,762 → +7,812 points**, soit −3,950 points. L8 passe de 63 à 39 types nouveaux, une diminution de 24 types, avec un stock de niveau passé de 132 à 92 types.

« Deux marches avant et après » ne signifie donc pas « charge inchangée ». L’alerte L3→L4 s’accroît, celle de L7→L8 diminue sans disparaître. La mesure exacte relève aussi L9→L10 à 37,864 → 38,462 %, une petite hausse masquée par l’arrondi 38→38. Aucun de ces chiffres ne mesure directement la compréhension, l’effort oral ou l’autonomie.

## L3→L4 : une concentration réelle à rendre visible

L3 réemploie maintenant les déclarations de L2 avant les questions : `Vivo…` avant `¿Dónde vives?`, `Tengo…` avant `¿Tienes…?`, `Trabajo…` avant `¿Dónde trabajas?`. Cela réduit son ratio. Les mots écrits `vives`, `tienes` ou `trabajas` restent pourtant des formes nouvelles : le compteur distingue chaque forme et n’examine pas la conjugaison.

L4 conserve les descriptions du logement et les routines, puis reçoit quatre unités de services/démarches. Ces quatre entrantes portent **24 des 70 types nouveaux de L4**, tous absents des huit unités de routine/logement de ce même niveau : `cambiar`, `darme`, `descuento`, `documento`, `enviarme`, `factura`, `falta`, `fecha`, `firma`, `hacerme`, `modelo`, `otro`, `pagar`, `pedir`, `podría`, `presentar`, `reclamación`, `recoger`, `renovar`, `responsable`, `sello`, `tarjeta`, `vengo`, `ver`. Leur déplacement a un motif communicatif, mais cette concentration n’est pas une préparation lexicale accomplie.

| Série proposée en L4 | Ce qui est réellement repris | Nouveauté à préparer |
| --- | --- | --- |
| `En mi barrio hay…` | `¿Hay…?` et des lieux de L2 | quartier, pluriel quantifié et lieux nouveaux ; la réserve `muchos bares` reste pertinente |
| `Mi piso tiene…`, `Mi…vive…` | `Tengo…`, `Vivo…` et les questions correspondantes | `tiene`/`vive`, les pièces/proches ; avoir rencontré une autre personne du verbe ne produit pas ces formes |
| `Normalmente…` | `Trabajo…` en première personne | `normalmente`, le groupe horaire et les autres prédicats, dont `me levanto` |
| `Por la mañana…` | `Voy al trabajo.` (`L1-fr-es-06/v0`) | le repère du matin ; `desayuno`, `hago`, puis le groupe entier `llevo a los niños al colegio` |
| `Por la noche…` | fonction de routine et repère du soir | `veo`, `leo`, `salgo`, `me acuesto`, avec leurs objets ; le `me` de `me levanto` ne fournit pas leur conjugaison |
| `Los fines de semana…`, fréquence | plusieurs activités déjà présentées en L4 | `cocino`, `descanso`, fréquence et lieu `gimnasio`, gardés dans leurs phrases préparées |
| services avec `podría` | demande avec `puede`/`puedes` et permission | atténuation, sujet implicite et groupes d’action nouveaux ; les réserves existantes restent nécessaires |
| `Falta…`, puis `Vengo a…` | rendez-vous et quelques noms déjà rencontrés | documents/pièces manquantes, déplacement vers l’interlocuteur et verbes de démarche |

Les changements proposés ne font pas sortir les démarches de L4 pour baisser le ratio. Ils rendent la découverte plus progressive à l’intérieur du niveau :

1. `L4-fr-es-01` commence par **`Normalmente trabajo hasta las seis.`** (`v2`), dont le prédicat de travail est déjà rencontré, puis présente les autres habitudes séparément. `me levanto` reste une découverte entière, pas une forme à déduire.
2. `L4-fr-es-02` commence par **`Por la mañana voy al trabajo en metro.`** (`v1`) et termine par **`Por la mañana llevo a los niños al colegio.`** (`v2`). L’ajout du repère au déplacement connu précède le groupe d’action comportant les enfants et l’école.
3. `L4-fr-es-03` reçoit une réserve explicite sur ses formes et ses objets. Aucun pont catalogue n’est présumé déjà consommé.
4. `L9-fr-es-13` et `L8-fr-es-13` échangent les positions 11 et 12 : **`Falta un documento.`** est présenté avant **`Vengo a recoger un documento.`**. La démarche commence par **`Vengo a pedir una cita.`**, avec `cita` déjà rencontré en L2. Ce réemploi ne prépare pas automatiquement `pedir`, `recoger`, `renovar` ni `presentar una reclamación`.

Le descriptif de la première comparaison de `Falta…` est aussi précisé : `una firma` et `la fecha` sont deux groupes nominaux entiers, déterminant compris. L’article n’est pas présenté comme invariant.

## L7→L8 : moins de lexique inédit, plusieurs fonctions nouvelles

L7 prépare jugement, comparatif et justification. L8 concentre maintenant négociation, demande atténuée et condition. Le retrait de plusieurs services simples vers L4 explique la baisse de 63 à 39 types nouveaux en L8. Une réserve reste nécessaire : un stock plus petit peut cumuler des fonctions non préparées.

| Unité L8 conservée | Types nouveaux au regard de L1–L7 | Fonction ou forme à ne pas déduire du seul vocabulaire |
| --- | --- | --- |
| `L8-fr-es-08` | `final` | négocier en contexte ; les demandes de prix/services antérieures servent de reprise |
| `L8-fr-es-12` | `depende`, `ha`, `plazo`, `posible`, `vendido` | résultat `está vendido` et passé composé `ha pasado` ; premier amendement conservé |
| `L8-fr-es-05` | `aplazar`, `entregarlo`, `posible`, `sería` | nouvelle formule `sería posible` ; groupes de livraison/report à découvrir |
| `L8-fr-es-11` | `bajar`, `cerrar`, `importaría`, `le`, `mover`, `paquete`, `perdone` | adresse formelle et construction `le importaría`, même si la demande avec `podría` est déjà rencontrée |
| `L8-fr-es-03` | `azul`, `compro`, `devolverlo`, `oferta`, `si` | condition d’achat et référence de l’objet avec `lo` |
| `L8-fr-es-06` | `cambia`, `confirma`, `escrito`, `incluye`, `si`, `solo`, `transporte` | le double clitique `me lo` n’apparaît pas comme type nouveau, bien que la combinaison soit nouvelle ; premier amendement conservé |
| `L8-fr-es-04` | `algún`, `cambia`, `llamaré`, `llego`, `problema`, `si`, `termino` | futur simple `llamaré`, distinct de `voy a…` ; réserve existante conservée |
| `L8-fr-es-10` | `arreglar`, `calefacción`, `cinco`, `gato`, `pintar`, `posible`, `preguntarle`, `quería`, `si` | atténuation et interrogation indirecte ; le `si` conditionnel n’en est pas un prérequis grammatical ; premier amendement conservé |

Les contributions du tableau se recouvrent : elles ne s’additionnent pas pour donner 39. Deux limites concrètes du compteur sont visibles. `le` est nouveau comme mot séparé malgré les enclitiques antérieurs ; inversement, `me lo` combine deux types connus et ne fait pas monter le numérateur. Les types écrits sont un signal lexical utile, sans devenir un inventaire de constructions.

Pour `L8-fr-es-05`, la première comparaison passe de `v0/v3` à **`v0/v2`** : **`¿Sería posible pagar en dos veces?`** / **`¿Sería posible cambiar de habitación?`**. `pagar` et `cambiar` ont leurs contextes de permission en L4 ; `sería posible` et les deux groupes complets sont encore découverts et imités. `entregarlo` puis `aplazar la cita` viennent ensuite. Aucun `aplaz*` n’a été retrouvé au catalogue audité : ce manque lexical est signalé, pas complété par une phrase fabriquée. `en dos veces` n’est pas assimilé au `A veces` de fréquence.

`L8-fr-es-11` et `L8-fr-es-03` reçoivent des réserves sur leurs constructions et groupes lexicaux. Leur ordre de niveau reste inchangé. Le premier lot avait déjà ajouté les réserves sur `me lo`, le résultat au participe et l’interrogation indirecte ; celles-ci restent intégralement conservées.

## Ponts catalogue pour un lot suivant

Dix candidats sont référencés dans le JSON, avec **texte, phonétique francophone `pf`, sens `frm`, index base zéro, niveau source et unité de destination**. Leur état est `next-lot-only-not-consumed-not-imported` : ils ne sont ajoutés ni aux prérequis d’unités, ni aux étapes de la maquette dans ce lot.

Les plus directs sont `Me levanto temprano.` (`DECKS.es[283]`, lv2), `Me acuesto pronto.` (`[542]`, lv3), `Trabajo hasta las seis.` (`[1194]`, lv4) et `¿Puedo devolverlo?` (`[477]`, lv2). Les trois premiers préparent une forme ou une proposition de routine ; la question de retour ne prépare pas à elle seule une condition d’achat.

`¿Tiene esto en oferta?` (`[650]`) fournit un contexte lexical, pas la construction `está en oferta`. `¿Te importaría ayudarme?` (`[946]`) fournit la fonction de demande atténuée, mais **`te` ne prépare pas automatiquement `le`**, et les actions diffèrent. `¿Puedo pagar a plazos?` (`[1583]`) reprend l’intention, sans fournir la surface `en dos veces`. `Todos los días.` et `A menudo.` sont des appuis de fréquence, pas des phrases autonomes à produire.

Les aides des cartes et des unités sont conservées telles quelles ; aucune harmonisation, concaténation ou transcription nouvelle n’est faite. Leur présence au catalogue ne prouve ni exposition antérieure, ni compréhension, ni acquisition.

## Portée des huit propositions supplémentaires

Huit lignes sont proposées : deux découvertes de routine réordonnées, une réserve de routine, les deux lignes de l’inversion document/démarche, une première comparaison de demande réordonnée et deux réserves de condition/demande. Sept réserves sont ajoutées. Avec les cinq amendements déjà retenus, le total espagnol passerait de 49 à 59 réserves explicites ; ce sont des besoins déclarés, pas dix erreurs de phrases nouvelles.

Les ordres restent contigus, les prérequis restent antérieurs et les premières comparaisons restent cohérentes avec leurs phrases sources. La répartition entre niveaux ne change pas. **Ces propositions ne changent donc aucun ratio de types par niveau** : elles traitent la découverte et la réutilisation concrètes, que le compteur agrégé ne peut pas observer. Le test avec apprenants et la relecture linguistique restent nécessaires ; aucune progression d’acquisition n’est réputée validée.
