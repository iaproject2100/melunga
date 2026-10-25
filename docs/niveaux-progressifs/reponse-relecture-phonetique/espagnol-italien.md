# Réponse à la relecture phonétique — espagnol et italien

**État du 25 octobre 2026 :** le compte rendu de Claude à `d4eaea3` rapporte le refus par Kartech du doublement automatique `s → ss`. Les treize propositions espagnoles, jamais appliquées, sont **archivées et retirées de la file active**. Les mesures et avant/après ci-dessous restent des traces de la passe précédente ; ils ne constituent plus une demande d’application. Le [nouveau suivi](../reponse-revue-integrale-lot1/README.md) fait foi pour la suite.

**Les nombres 55/317 et 686/4672 sont reproductibles, mais ce ne sont pas des nombres de fautes validées.** Une règle explicite indépendante les reproduit exactement ; le calcul du `ss` n’est présent dans aucun des trois scripts fournis par Claude. Je ne prétends donc pas avoir reproduit son instrument sur ce point.

Lecture seule sur `90a343391807b5a62ef1f140ce40075c53b7d9d8`, comparaison avec le rapport et les scripts de `295adf3`. Aucun catalogue, ledger, fichier de conversation ou runtime modifié. Les propositions ci-dessous attendent la revue de Claude et une décision de convention.

## 1. Reproduction exacte et unités de comptage

Les scripts `phon1.py` et `phon2.py` ont été rejoués sans changement d’algorithme dans un harnais temporaire. Seule la référence Git de `phon1` a été figée au commit cible ; le corpus historique complet (application et 70 fichiers conversation du commit de Claude) est utilisé. Les sept snapshots L1 du dépôt actuel ne remplacent pas ce corpus : ils changent les résultats.

- `phon1` : 87 JSON, 2 965 positions portant une aide ; statuts 1 715 `pending-Claude`, 535 `existing-verbatim`, 381 `source-exact-preserved`, 334 absents.
- `phon2` : ES, 723 rendus comparables et 127 divergences ; IT, 379 rendus comparables et 43 divergences. Ce sont des divergences de graphie contre une référence majoritaire, pas des erreurs phonétiques établies.
- Champ réellement contrôlé au catalogue : **`pf`** pour ES et IT, jamais le champ générique `phon`, ni `py`. Les deux decks sont identiques entre le corpus historique et le commit cible.

| Mesure ES | Positions de fichiers/cartes | Aides entières distinctes | Repérées par le filtre |
|---|---:|---:|---:|
| Lot `pending-Claude` | 317 | 306 | 55, toutes distinctes |
| Catalogue `DECKS.es` | 4 672 | 4 672 | 686, toutes distinctes |

Les onze positions de différence du lot sont des références à dix mots déjà présents dans le master éditorial ; *película* est réutilisé deux fois. Elles restent `pending-Claude` par héritage de la source, mais ne sont pas onze aides créées. Aucun de ces onze réemplois n’appartient aux 55 signalements. L’italien compte 230 positions `pending-Claude` et 230 tuples entiers distincts.

L’identité utilisée est `(study, native, phon, reading si présent)` et la provenance est conservée. Dédupliquer sur la seule chaîne phonétique serait insuffisant : deux mots différents peuvent avoir la même aide.

Reproduction portable, sans dépendance à un fichier temporaire :

```sh
python3 docs/niveaux-progressifs/reponse-relecture-phonetique/reproduire-espagnol-italien.py --repo .
```

Le script lit les objets Git sources et vérifie aussi les 13 propositions et leurs 14 seules insertions `s/S`. Il n’écrit aucun corpus.

## 2. Ce que reproduit exactement le filtre `ss`

Hypothèse de reproduction déclarée, sensible aux frontières de mots :

```python
bool(re.search(r'[aeiouéèêàâîïôùûüëö]s[aeiouéèêàâîïôùûüëö]',
               phon.replace('-', ''), re.I))
```

Elle retire uniquement les tirets syllabiques, conserve les blancs et compte une aide une seule fois, quel que soit le nombre de positions repérées. Elle redonne **55/317** et **686/4 672**. La liste complète avec indices, empreintes et textes est dans [les preuves](espagnol-italien-preuves.json).

| Sensibilité du filtre | Lot | Catalogue |
|---|---:|---:|
| Tirets conservés | 0 | 0 |
| Tirets retirés, blancs conservés | 55 | 686 |
| Tirets et blancs retirés | 95 | 1 427 |

La dernière ligne ajoute des faux positifs aux frontières de mots : un `s` initial après une voyelle du mot précédent n’est pas un `s` intervocalique interne. Les trois scripts ne donnent pas cette règle de filtrage ; Claude doit confirmer la sienne avant de considérer les listes comme identiques.

Le filtre porte sur des **graphies vocaliques**, pas sur une segmentation phonétique certaine. Par exemple `GRA-sias` déclenche le motif après retrait du tiret, mais *gracias* comporte /sj/ : le `i` représente ici une semi-voyelle. Et `KA-sa` n’est signalé qu’après fusion des syllabes ; la méthode doit préciser si le tiret est un repère interne au mot ou une consigne de lecture par petits blocs. On ne peut pas en déduire automatiquement que tous les lecteurs prononcent /z/.

Les 55 aides portent **68 positions graphiques** signalées si l’on compte aussi les motifs qui se recouvrent ; les 686 cartes en portent 735. Le total 741 additionne donc des entrées, pas des sons ni des corrections validées.

Les pourcentages sur toutes les entrées (17,35 % et 14,68 %) ne mesurent pas le taux d’application d’une règle : beaucoup de cartes n’offrent aucune occasion de l’appliquer. Avec le même détecteur graphique étendu à `s+`, seules 118 positions du lot / 115 aides distinctes et 1 211 cartes du catalogue présentent un contexte candidat. Il y a 68 `s` simples contre 88 séquences doublées dans les positions du lot, et 735 contre 724 au catalogue. Ces chiffres décrivent l’exposition graphique ; ils ne valident toujours pas la prononciation. « Appliquée aux quatre cinquièmes » n’est donc pas démontré par 55/317.

### Convention `c`, `z` et portée proposée

Le corpus adopte régulièrement une aide en `s` pour `ce/ci/z`. C’est une convention de transcription à confirmer, compatible avec un modèle de type seseo ; elle ne permet pas d’affirmer que tous ces sons valent /s/ dans toutes les variétés espagnoles. `c` devant `a/o/u` reste notamment /k/. Les tirets et lettres du mot étudié ne doivent pas déclencher une réécriture générale.

**Proposition bornée :** dans les nouvelles aides dont le /s/ interne est confirmé pour le mot entier, écrire `ss` entre graphies vocaliques à l’intérieur du même mot, y compris lorsqu’un tiret syllabique sépare les syllabes. Conserver les espaces, les contextes `s` + consonne, les autres segments et le marquage tonique. Cette règle reste proposée, elle n’est appliquée à aucun fichier.

## 3. Treize propositions entières à faire relire

Sous-ensemble fermé et vérifié des huit lexèmes `camisa`, `casa`, `mesa`, `uso`, `usé`, `paso`, `repasar`, `acceso` : **13 aides entières, 14 marques `s`**. Les segments visés correspondent à /s/, sans décision nouvelle sur `ce/ci/z`. Les graphies déjà doublées des mots isolés *casa* et *mesa* restent telles quelles. Le second `s` de *acceso* est visé ; son premier segment `ak-SÉ` n’est pas doublé mécaniquement.

Les variantes de *camisa*, *casa* et *repasar* sont incluses ensemble pour ne pas corriger un seul exemple en oubliant ses autres emplois nouveaux. Aucun accent de voyelle, accent tonique ou repère `n/nn` n’est changé. Les autres 42 signalements restent ouverts. Fournir une proposition entière ne valide pas automatiquement le reste de cette aide.

| Identifiant | Phrase/mot étudié | Aide entière actuelle | Aide entière proposée |
|---|---|---|---|
| `fr-es:piste-vetement-taille-01` | Busco una camisa. | `BOUS-ko OU-na ka-MI-sa` | `BOUS-ko OU-na ka-MI-ssa` |
| `fr-es:piste-vetement-taille-02` | ¿Puedo probarme esta camisa? | `POUÉ-do pro-BAR-mé ÈS-ta ka-MI-sa` | `POUÉ-do pro-BAR-mé ÈS-ta ka-MI-ssa` |
| `fr-es:piste-gouts-activites-06` | Prefiero quedarme en casa cuando llueve. | `pré-FIÉ-ro ké-DAR-mé ènn KA-sa KOUANN-do YOUÉ-bé` | `pré-FIÉ-ro ké-DAR-mé ènn KA-ssa KOUANN-do YOUÉ-bé` |
| `fr-es:piste-recuperer-compte-03` | Uso esta dirección de correo electrónico para esta cuenta. | `OU-so ÈS-ta di-rèk-SSIONN dé ko-RÉ-o é-lèk-TRO-ni-ko PA-ra ÈS-ta KOUÈNN-ta` | `OU-sso ÈS-ta di-rèk-SSIONN dé ko-RÉ-o é-lèk-TRO-ni-ko PA-ra ÈS-ta KOUÈNN-ta` |
| `fr-es:piste-recuperer-compte-04` | No recibo el código de acceso. | `no ré-SSI-bo él KO-di-go dé ak-SÉ-so` | `no ré-SSI-bo él KO-di-go dé ak-SÉ-sso` |
| `fr-es:piste-cours-aide-07` | Quisiera repasar este paso. | `ki-SSIÉ-ra ré-pa-SAR ÈS-té PA-so` | `ki-SSIÉ-ra ré-pa-SSAR ÈS-té PA-sso` |
| `fr-es:piste-incident-objet-02` | Lo usé cerca de la entrada. | `lo ou-SÉ SÈR-ka dé la ènn-TRA-da` | `lo ou-SSÉ SÈR-ka dé la ènn-TRA-da` |
| `fr-es:piste-incident-objet-03` | Lo dejé sobre la mesa. | `lo dé-KHÉ SO-bré la MÉ-sa` | `lo dé-KHÉ SO-bré la MÉ-ssa` |
| `fr-es:piste-visite-proches-received-02` | Hasta pronto, que llegues bien a casa. | `AS-ta PRONN-to ké YÉ-guès biènn a KA-sa` | `AS-ta PRONN-to ké YÉ-guès biènn a KA-ssa` |
| `fr-es:piste-recuperer-compte-received-02` | Perfecto, ya tiene acceso a su cuenta. | `pèr-FÈK-to ya TIÉ-né ak-SÉ-so a sou KOUÈNN-ta` | `pèr-FÈK-to ya TIÉ-né ak-SÉ-sso a sou KOUÈNN-ta` |
| `fr-es:piste-cours-aide-received-01` | ¿Qué parte quieres repasar? | `ké PAR-té KIÉ-rès ré-pa-SAR` | `ké PAR-té KIÉ-rès ré-pa-SSAR` |
| `fr-es:piste-vetement-taille-support-01` | una camisa | `OU-na ka-MI-sa` | `OU-na ka-MI-ssa` |
| `fr-es:invitations-limites-04` | Prefiero volver temprano a casa porque trabajo mañana. | `pré-FIÉ-ro bol-BÈR tèmm-PRA-no a KA-sa POR-ké tra-BA-kho ma-NYA-na` | `pré-FIÉ-ro bol-BÈR tèmm-PRA-no a KA-ssa POR-ké tra-BA-kho ma-NYA-na` |

La provenance, les empreintes des entrées et le statut non appliqué sont dans [les propositions JSON](espagnol-italien-propositions.json). **Aucune migration des 686 cartes anciennes n’est proposée dans ce lot.** Une règle retenue devrait ensuite être appliquée dans un chantier séparé, avec sources, variantes et contrôles de conservation explicites.

## 4. `oun/ounn`, `kon/konn` et `é/è`

Une seconde lecture a conservé toutes les divergences avant d’en limiter l’affichage. Les détails et chaque exemple sont dans [l’inventaire des conventions](espagnol-italien-conventions.json).

| Point du lot | Compte vérifié | Limite de la mesure publiée |
|---|---|---|
| ES `un/con → ounn/konn` | 27 positions de mots, dans 26 aides distinctes | Le top 8 de `phon2` retient 18 `un → ounn` et 8 `con → konn`, mais omet 1 `con → KONN` classé séparément par casse. |
| ES `es/tengo/entiendo`, `é/è` | 17 positions, dans 17 aides | 9 `es`, 4 `tengo`, 4 `entiendo` ; le top 8 omet la variante `ènn-TIÈNN-do` et donne 16. |
| IT `un → ounn`, alignement strict | 15 positions, dans 13 aides | Ce n’est ni 15 phrases ni un total exhaustif. Trois emplois de `un’` dans des lignes exclues portent aussi `ounn`. |

Dans le corpus historique alignable, ES `un` donne `oun` 257 fois au catalogue et 84 en conversation ; `con` donne `kon` 126 et 23 fois. Pour IT `un`, `oun` est observé 401 et 66 fois. Mais le même corpus italien écrit déjà `con` 30 fois `conn` au catalogue contre 9 fois `kon` en conversation, et `non` 205 fois `nonn` contre 68 fois `non`. Sa convention n’est donc pas globalement unique.

Le double `n` peut servir de repère de consonne prononcée et de voyelle orale pour le lecteur francophone. C’est un choix à expliciter ; il ne démontre pas que toute graphie `oun` est fautive et ne doit pas enseigner une consonne longue. En italien, les vraies consonnes géminées sont distinctives : aucun remplacement général de `n` par `nn` ne convient. Garder les deux formes en attente d’une règle écrite vaut mieux qu’une harmonisation silencieuse.

Pour l’espagnol, la préférence `é/è` relève d’une convention d’approximation du /e/ espagnol, avec ses réalisations contextuelles ; les majuscules de l’accent tonique doivent rester distinctes de ce choix. Le catalogue lui-même contient déjà pour *es* 339 `és`, 12 `ès` et 1 `èss`, et pour *tengo* 62 `tén-go` contre 9 `tèn-go` sur les lignes alignables. La majorité n’est pas une preuve phonétique.

**L’italien ne permet pas d’étendre cette équivalence.** `e` et `è`, `perché` et `caffè` conservent des distinctions de timbre pertinentes. Le corpus oppose aussi pour *bene* 46 `bé-né` au catalogue et 36 `bè-né` en conversation ; ce désaccord disparaît du détecteur dès que le seuil de stabilité de 90 % écarte le mot. Il faut une décision lexicale et phonétique, pas un remplacement de tous les accents.

## 5. Limites de l’alignement et demandes à Claude

L’égalité du nombre de mots et de jetons phonétiques ne garantit pas leur correspondance. Dans `Uso questo indirizzo e-mail…`, le découpage de `e-mail` par `phon2` aligne le `e` de cet emprunt avec `i`, puis le présente potentiellement comme la conjonction italienne. Les apostrophes courbes échappent par ailleurs à la liste de ponctuation limitée à U+0020–U+02FF et excluent des élisions italiennes. Ce sont des limites vérifiées de l’instrument, pas des fautes du contenu.

À soumettre à Claude :

1. Confirmer le filtre exact du `ss` (voyelles, tirets, blancs, normalisation, unité comptée). Les 55 et 686 se reproduisent, mais la règle reproduite ici est indépendante et explicite.
2. Valider ou amender la règle bornée et les 13 aides entières proposées ; garder les autres signalements et le catalogue historique hors application automatique.
3. Énoncer le rôle de `nn` pour le lecteur, séparément de la gémination italienne, et la convention espagnole `é/è` sans neutraliser les distinctions italiennes.
4. Exporter toutes les divergences avant le top d’affichage, compter séparément positions, aides distinctes et réemplois, et traiter traits d’union/emprunts/apostrophes avant de qualifier un alignement de certain.

Les statuts absents des 334 positions globales sont un dossier de provenance distinct ; ils ne sont pas requalifiés comme créations par cette note. Aucun élément du présent dossier n’autorise à considérer le lot entier comme relu naturellement ou à modifier une aide existante sans décision et nouvelle vérification.
