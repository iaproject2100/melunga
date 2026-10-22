# zh→fr : examiner la nouveauté de L8 à L9

Examen ciblé du candidat `99478df`, après la correction de Claude au § 3 bis de `verification-claude-corrigee.md`. Ce document traite la remontée de types écrits entre L8 et L9 ; il ne reprend pas les reproches retirés sur l’italien, l’anglais ou le coréen. Aucun niveau ni ordre ne change dans les propositions jointes. Revue croisée et relecture native restent en attente ; aucune publication n’est approuvée.

## Ce que montre la mesure, et son périmètre

La formule reproductible compatible avec le tableau corrigé de Claude prend seulement les **quatre variantes `study` entières** de chaque unité. Elle extrait les groupes de lettres Unicode en minuscules (`re.findall(r'[^\W\d_]+', study.lower())`). Pour un niveau, le numérateur est l’ensemble des types absents de l’union des niveaux antérieurs, le dénominateur tous les types distincts de ce niveau. Elle ne lemmatise pas, sépare apostrophes et traits d’union, et ne lit ni catalogue, ni modèle, ni dialogue, ni phonétique. Le script exact de cette seconde mesure n’étant pas joint par Claude, il s’agit d’une hypothèse de reproduction, documentée dans `nouveaute.md` et détaillée dans `nouveaute.json`.

| Classement `zh→fr` | L8 | L9 | L9 moins L8 |
|---|---:|---:|---:|
| Niveaux sources | 62 / 142 = 43,6620 % | 45 / 122 = 36,8852 % | −6,7767 points |
| Proposition `99478df` | 29 / 85 = 34,1176 % | 44 / 124 = 35,4839 % | +1,3662 point |

La remontée L8→L9 existe donc sous cette hypothèse. L8 proposé contient 6 unités / 24 variantes, L9 11 unités / 44 variantes ; le dénominateur de types distincts change lui aussi. Le signal ne dit pas que chaque phrase de L9 contient soudain plus d’éléments inconnus, ni qu’un apprenant les a acquis. L’hypothèse arrondie à l’entier restitue la marche unique du tableau de Claude ; les fractions exactes font également apparaître une petite remontée L3→L4 (64/113 vers 63/111), masquée par 57 %→57 %. Aucun seuil pédagogique n’en est tiré.

Le déplacement de la marche est cohérent avec des décisions concrètes : `L7-zh-fr-11` (conséquence) arrive en L8 après la cause, tandis que `L8-zh-fr-10` (voisinage, dont infinitif passé) et `L8-zh-fr-11` (condition avec futur simple/impératif) attendent L9. Ces deux dernières unités apportent **13 des 44 types L9**, sans recouvrement entre elles : 6 et 7. Les remonter artificiellement en L8 pour faire baisser un ratio inverserait le motif pédagogique de leur report. Leurs difficultés restent à préparer dans L9, elles ne sont pas résolues par le classement.

## Les onze unités L9, constructions et préparation disponible

Les antécédents ci-dessous sont des **sources présentées plus tôt dans le plan**, pas des acquis observés. Même un groupe déjà rencontré ne prouve ni une règle productive, ni sa prononciation correcte. Les quatre variantes entières restent les supports d’introduction ; aucune phrase nouvelle n’est rédigée et aucune aide phonétique n’est recalculée.

| Unité dans l’ordre proposé | Construction / exemple source exact | Types nouveaux par rapport à L1–L8 | Ce qui existe et ce qui reste nouveau |
|---|---|---|---|
| `L9-zh-fr-01` | Reformuler : Autrement dit. « Autrement dit, le train est annulé. » | `autrement`, `document` | Le groupe est annulé arrive en L8 (`L7-zh-fr-11`), je dois en L6 (`L8-zh-fr-06`), il faut en L7 (`L7-zh-fr-07`). Document est nouveau. Le cadre de reformulation est nouveau même si dit avait déjà une occurrence. |
| `L9-zh-fr-02` | Clarifier : Ce que je veux dire, c’est que. « Ce que je veux dire, c'est que nous avons besoin de temps. » | `avons`, `urgent`, `élevé` | La mise en relief et l’enchâssement sont nouveaux malgré les mots déjà présents. J’ai besoin existe en L1 (`L1-zh-fr-04`) ; nous avons besoin n’en est pas une substitution lexicale libre. Urgent et élevé sont nouveaux. |
| `L9-zh-fr-07` | Vérifier : Si j’ai bien compris. « Si j'ai bien compris, je dois revenir demain ? » | `gratuit`, `prochain`, `revenir` | Je n’ai pas compris est en L5 (`L5-zh-fr-08`) ; rendez-vous et le train ont des contextes préparatoires en L6. La vérification n’est pas le si conditionnel. Revenir, prochain et gratuit sont montrés dans leurs propositions. |
| `L9-zh-fr-11` | Interrogative indirecte : Je ne sais pas si. « Je ne sais pas si c'est le bon guichet. » | `bon`, `formulaire`, `guichet`, `ouvert`, `suffit` | Je ne sais pas est en L3 (`L3-zh-fr-08`) et si conditionnel en L8 (`L8-zh-fr-03`) ; aucun de ces groupes ne prépare à lui seul l’interrogative indirecte. Guichet, formulaire, ouvert et suffit arrivent ici. |
| `L9-zh-fr-04` | Hypothèse : Peut-être que. « Peut-être que j'ai fait une erreur. » | `erreur`, `fermé`, `occupé` | Peut-être est en L3 (`L3-zh-fr-08`) et j’ai fait en L5 (`L5-zh-fr-09`). Le groupe une erreur et les états fermé/occupé sont nouveaux ; les phrases entières sont présentées avant rappel. |
| `L9-zh-fr-05` | Possibilité : Il se peut que. « Il se peut que tu aies raison. » | `aies`, `fermé`, `raison`, `sois`, `soit`, `vol` | Le présent de être/avoir est présent tôt, mais sois, soit, aies et l’enchâssement subjonctif arrivent ici. Peut-être que n’en prépare pas la flexion. Raison et vol sont nouveaux. Pas de généralisation productive déclarée. |
| `L9-zh-fr-12` | Signaler une erreur : Je crois qu’il y a. « Je crois qu'il y a une erreur sur mon billet. » | `crois`, `erreur`, `nom`, `sur` | Il y a est en L2 (`L2-zh-fr-08`), facture en L8 (`L8-zh-fr-08`), billet en L1 et date en L6 (`L8-zh-fr-02`). Crois, erreur, sur et nom ne sont pas ainsi préparés. La première comparaison remplace les groupes complets sur mon billet / dans la date. |
| `L9-zh-fr-06` | Incident puis demande de solution. « Il y a un problème : ma valise n'est pas arrivée. Qu'est-ce qu'on peut faire ? » | `arrivée`, `perdu`, `problème`, `valise` | Le passé avec être est en L5 (`L5-zh-fr-12`) et est annulé en L8 (`L7-zh-fr-11`). Arrivée au féminin, perdu, valise et le cadre complet de résolution de problème sont nouveaux. Tous les mots connus de la question ne rendent pas sa combinaison acquise. |
| `L9-zh-fr-10` | Proposer : On pourrait peut-être. « On pourrait peut-être revenir demain matin. » | `client`, `prochain`, `remboursement`, `revenir`, `service` | On pourrait est en L6 (`L6-zh-fr-03`). Revenir demain apparaît dans `L9-zh-fr-07`, plus tôt au même niveau. Service client et remboursement sont nouveaux ; rembourser en L6 (`L8-zh-fr-07`) n’établit pas le nom dérivé. |
| `L8-zh-fr-10` | Voisinage : quatre actes successifs. « Ce n'est pas grave, merci d'être venu. » | `bruit`, `chauffage`, `déranger`, `excusez`, `grave`, `venu` | Unité reportée de L8. Ni le passage d’une excuse à un constat, ni merci d’être venu ne constituent une simple substitution. Bruit, chauffage, déranger et les expressions d’excuse/clôture sont présentés entiers. Le participe venu n’est pas préparé par venir seul. |
| `L8-zh-fr-11` | Condition puis suites distinctes. « Si c'est possible, envoyez-moi un e-mail. » | `carte`, `e`, `envoyez`, `mail`, `par`, `signe`, `viendrai` | Unité reportée de L8. Si conditionnel est en L8 ; Je préfère + infinitif en L7 (`L7-zh-fr-05`) et envoyer en L6 (`L8-zh-fr-01`). Payer par carte, viendrai, envoyez-moi, e-mail et on signe restent des phrases ou groupes nouveaux à présenter. |

Les contributions par unité ne s’additionnent pas : erreur, fermé, prochain et revenir se retrouvent dans deux unités L9. Leur union contient bien 44 types. Surtout, la mesure ne voit pas le coût d’un nouvel agencement de mots connus : **Ce que je veux dire, c’est que**, **Je ne sais pas si** et **Qu’est-ce qu’on peut faire ?** restent de nouvelles constructions même si la plupart ou la totalité de leurs mots ont déjà une occurrence.

## Distinguer flexion, groupe nouveau et manque de préparation

**Dix des 44 types sont de nouvelles formes de lexèmes déjà rencontrés.** Le constat est écrit et limité au corpus ; il ne permet pas de les retirer de la préparation. Le subjonctif, le futur simple, l’impératif avec pronom et l’infinitif passé sont justement des nouveautés réelles malgré cette parenté lexicale.

| Type L9 | Antécédent source exact, avant L9 | Limite du réemploi |
|---|---|---|
| `aies` | `L1-zh-fr-04`, L1 : « J'ai besoin d'aide. » | avoir déjà rencontré ; aies et le cadre subjonctif ne sont pas préparés par ai. |
| `arrivée` | `L5-zh-fr-12`, L5 : « Je suis arrivé hier soir. » | arrivé existe au masculin ; le féminin avec sujet valise et la négation sont nouveaux. |
| `avons` | `L1-zh-fr-04`, L1 : « J'ai besoin d'aide. » | avoir besoin existe avec j’ai ; nous avons besoin change la personne et la flexion. |
| `bon` | `L6-zh-fr-08`, L6 : « Bonne idée ! » | bonne existe ; le masculin bon et le groupe le bon guichet restent à présenter. |
| `envoyez` | `L8-zh-fr-01`, L6 : « Pourriez-vous m'envoyer le contrat ? » | envoyer existe ; l’impératif et le pronom de envoyez-moi ne se déduisent pas de m’envoyer. |
| `prochain` | `L6-zh-fr-12`, L6 : « Tu es libre la semaine prochaine ? » | prochaine existe avec semaine ; le prochain train change le groupe et le genre. |
| `sois` | `L1-zh-fr-01`, L1 : « Je suis étudiant. » | être existe au présent ; le subjonctif sois est une forme nouvelle. |
| `soit` | `L1-zh-fr-05`, L1 : « Où est la gare ? » | être existe au présent ; le subjonctif soit et soit annulé restent nouveaux. |
| `venu` | `L3-zh-fr-02`, L3 : « Tu peux venir ? » | venir existe à l’infinitif ; le participe venu et merci d’être venu restent nouveaux. |
| `viendrai` | `L3-zh-fr-02`, L3 : « Tu peux venir ? » | venir existe à l’infinitif ; le futur simple viendrai ne se déduit pas du futur proche. |

`e` et `mail` sont les deux types tirés de **e-mail**, un seul groupe lexical source dans « Si c'est possible, envoyez-moi un e-mail. ». Ce découpage explique deux types, il ne prépare pas ce mot. Les pronoms de **envoyez-moi** sont également découpés : le fait que moi existe auparavant ne prépare ni la forme impérative ni son placement après le verbe. À l’inverse, **sur** est bien une préposition nouvelle en L9, absente des variantes antérieures ; sûr, présent ailleurs, est un autre mot, pas une variante normalisable.

Les 32 autres types de surface sont : `autrement`, `bruit`, `carte`, `chauffage`, `client`, `crois`, `document`, `déranger`, `erreur`, `excusez`, `fermé`, `formulaire`, `gratuit`, `grave`, `guichet`, `nom`, `occupé`, `ouvert`, `par`, `perdu`, `problème`, `raison`, `remboursement`, `revenir`, `service`, `signe`, `suffit`, `sur`, `urgent`, `valise`, `vol`, `élevé`. Cette liste mêle des mots lexicaux, des mots grammaticaux et des marqueurs de discours ; elle n’est pas un décompte de 32 constructions ni de 32 erreurs. Le lien rembourser / remboursement est une dérivation lexicale à présenter, pas une simple flexion automatiquement disponible.

Le manque concret n’est donc pas « 44 briques absentes ». Les propositions montrent leurs phrases entières, mais **la généralisation productive** au subjonctif, au futur simple, à l’impératif avec pronom, à l’accord féminin et aux nouveaux enchâssements n’est pas établie par leurs liens. Sur ce point, les réserves L9 restent ouvertes. Exiger une production libre sans préparer ces groupes dépasserait ce que ces sources et ces métadonnées prouvent.

## Corrections proposées : des liens précis, aucun déplacement de niveau

`sinophones-nouveaute-propositions.json` contient sept patches limités à `plannedPrerequisites`, `rationale` et `gaps`, avec les quatre variantes sources exactes de chaque cible et une phrase source complète pour chaque lien ajouté. Ils rendent vérifiables des reprises qui existent déjà dans le plan ; ils ne créent aucun pont fictif vers un contenu du catalogue que l’exécution n’aurait pas présenté.

| Cible | Liens supplémentaires | Pourquoi |
|---|---|---|
| `L9-zh-fr-01` | `L8-zh-fr-06`, `L7-zh-fr-07` | Ajouter les antécédents effectifs de je dois et il faut à la préparation prévue. Autrement dit introduit la reformulation ; les quatre propositions sont toujours présentées entières, notamment document et le passage de il faut attendre à il faut un autre document. |
| `L9-zh-fr-07` | `L5-zh-fr-08`, `L6-zh-fr-05` | Relier explicitement la reprise de compris au passé L5 et celle de rendez-vous aux rendez-vous L6. Le cadre Si j’ai bien compris est appris entier comme vérification ; il n’est pas déduit du si conditionnel. Revenir, prochain et gratuit sont présentés dans leurs propositions complètes. |
| `L9-zh-fr-04` | `L5-zh-fr-09` | Rattacher j’ai fait une erreur au cadre passé j’ai fait déjà rencontré au L5. Peut-être que, une erreur et les états fermé/occupé sont présentés dans les phrases entières avant réponse ou rappel ; aucun remplacement de temps n’est supposé acquis. |
| `L9-zh-fr-12` | `L2-zh-fr-08`, `L8-zh-fr-08` | Ajouter les reprises sourcées de il y a et du groupe facture avant le signalement d’une erreur. Je crois qu’il y a est un nouvel enchâssement appris entier ; la première comparaison conserve les groupes d’emplacement complets sur mon billet / dans la date. |
| `L9-zh-fr-06` | `L5-zh-fr-12`, `L7-zh-fr-11` | Relier les incidents aux antécédents du passé avec être et de est annulé. Présenter chaque incident en entier puis la demande Qu’est-ce qu’on peut faire ? ; le féminin arrivée et le participe perdu ne sont pas déduits des mots déjà rencontrés. |
| `L9-zh-fr-10` | `L9-zh-fr-07` | Après On pourrait au L6, Peut-être que et les problèmes L9, reprendre le groupe revenir demain de la vérification antérieure du même niveau. Les autres solutions sont montrées entières ; service client et remboursement restent des groupes lexicaux nouveaux. |
| `L8-zh-fr-11` | `L7-zh-fr-05`, `L8-zh-fr-01` | Conserver l’unité au L9 après les conditions L8. Rendre explicites Je préfère avec infinitif et envoyer, déjà présentés. Les quatre suites restent des expressions distinctes : par carte et e-mail sont introduits dans leurs groupes, viendrai comme futur simple, envoyez-moi comme impératif avec pronom, sans inférer ces formes de je vais ou m’envoyer. |

Ces **7 lignes / 12 liens prévus supplémentaires** ne changent aucun texte, aucune phonétique, lecture, variante, présentation, comparaison, position, limite du gratuit ou droit. Les réserves existantes sont conservées et précisées ; elles ne sont pas déclarées levées. Les ratios de nouveauté restent donc exactement ceux de `99478df`. Ils ne constituent pas un objectif que ce patch chercherait à aplatir.

Les unités `L9-zh-fr-02`, `L9-zh-fr-11`, `L9-zh-fr-05` et `L8-zh-fr-10` gardent leur préparation en expressions entières et leurs réserves : aucun autre lien antérieur ne suffirait à enseigner leur nouvelle construction. Un complément exigeant une nouvelle phrase ou une nouvelle forme devrait faire l’objet d’un lot source séparé, sourcé et relu. Il n’est pas créé ici.

## Dialogues, catalogue et phonétique : dossiers séparés

Ce calcul de types sur les variantes n’est pas la mesure antérieure des éléments non préparés dans les dialogues. Les dialogues canoniques ne sont pas réécrits par ce reclassement ; une baisse du ratio sur les variantes ne modifierait donc pas leur taux de préparation. Les sept ponts L1 café sont un lot distinct ; on ne les ajoute pas implicitement au vocabulaire mesuré, on ne leur attribue pas une consommation par l’apprenant et on ne les remet pas en cause par ce suivi.

Les 102 annotations `zh→fr` et leur triage restent figés dans `sinophones-reserves.json` / `sinophones-reserves.md`. Elles ne sont ni 102 erreurs ni 102 défauts de transcription chinoise. Les nouvelles formes écrites identifiées ici ne disent rien de la fidélité des aides par caractères. Il faut un examen bilingue français/chinois, phrase et audio ensemble, pour cette question ; aucune harmonisation, nouvelle transcription ou validation native n’est fournie ici.

## Contrôles et suite de revue

- Les 11 unités L9 et leurs 44 variantes sont relues contre les dix sources `zh→fr` du commit `99478df` ; les 44 types inédits sont retrouvés indépendamment par extraction d’ensembles.
- Les sept patches citent 28 variantes cibles et 12 phrases de prérequis exactes, avec leurs champs `study`, `native`, `phon` (et `reading` si présent). Tous les prérequis ajoutés sont strictement antérieurs à leur cible dans le plan figé ; aucun cycle n’est ajouté.
- Les dix empreintes des sources figurent dans le JSON proposé. Les deux premiers fichiers de triage restent inchangés. Les propositions ne modifient que trois champs éditoriaux et n’autorisent ni fusion ni publication.

Pour Claude : vérifier d’abord que chaque lien proposé prépare bien le groupe cité, puis distinguer dans la relecture linguistique la reprise écrite et la forme réellement nouvelle. Pour la suite pédagogique : montrer et faire entendre les phrases entières, faire imiter, n’exercer la substitution que là où elle est déclarée, puis vérifier en essai utilisateur ce qui peut être rappelé ou combiné sans aide. Ce dernier résultat reste à mesurer ; le dossier n’en tient pas lieu.
