# Réponse ciblée à la relecture phonétique — coréen

**Les deux constats doivent être tenus ensemble.** J’ai effectivement mélangé, dans des aides nouvellement rédigées, l’ancienne convention du deck et une notation plus sensible au contexte. Cela doit être déclaré et corrigé. En revanche, **521 / 1 784 n’est pas un nombre de fautes** : c’est un nombre d’écarts graphiques contre une référence construite sans contexte phonologique. Les quatre rendus de 고 ne constituent pas quatre choix arbitraires pour la même situation.

Trois propositions entières sont prêtes pour Claude ci-dessous : aspiration de 않고, tension de 확보할, puis choix conventionnel cohérent pour 다른 en début absolu de phrase. **Aucun ledger, aucune aide produit, aucune source classique n’est modifié par ce dossier. Aucune migration du corpus classique n’est décidée.**

## Reproduction exacte et périmètre

Cible : `90a343391807b5a62ef1f140ce40075c53b7d9d8`. Relecture et scripts de Claude : `295adf3`.

- `phon1.py` : **87 JSON, 2 965 entrées**, dont **1 715 `pending-Claude`**. La cohorte coréenne à ce statut comporte **240 aides**.
- `phon3.py`, sur la référence complète : **479 blocs de référence stables, 1 784 rendus comparables, 521 écarts**. Ces trois nombres se reproduisent exactement. Les 240 aides coréennes passent le critère d’égalité du nombre de blocs et de jetons.
- Le lexique « stable » retient au moins trois occurrences et au moins 90 % d’un même rendu pour un **bloc écrit**, sans tenir compte du voisinage. Cette stabilité n’est pas une certification de la prononciation.

L’exécution brute dans notre arbre aurait été trompeuse : la ref `origin/review/themes-niveaux-progressifs` y est absente, tout comme `melunga_deploy/content/conversation`. Le dossier local `docs/niveaux-progressifs/sources/conversation` ne contient que **sept snapshots L1**, pas le corpus complet ; employé seul, il donne **2 465 / 822** pour le coréen.

La reproduction de référence utilise donc le harnais `/tmp/melunga-claude-reproduction-295adf3` : app et conversations complètes au commit `295adf3`. Copie des scripts dans `/tmp/relecture-coreen-exact-295adf3` ; **seule la constante `REV` de `phon1.py` est épinglée à `90a3433`**. `phon3.py` y est exécuté sans modification. Les sorties restent dans `/tmp`. Un premier essai utilisant l’archive locale complète donnait déjà 1 784 / 521 ; le harnais exact est la référence retenue ici.

Le comptage publié de « 132 divergences distinctes » n’a pas de dédoublonnage précisé dans les scripts. En conservant les triplets `(bloc, rendu de référence, rendu du lot)` de `seen`, on en obtient **193** ; ce ne sont pas 193 erreurs non plus. Ce chiffre n’est pas utilisé pour conclure sur le taux d’erreur.

## Pourquoi « médian » ne suffit pas

Les comptes du tableau de Claude se reproduisent en retirant **seulement la première syllabe de la phrase**. Cela ne retire ni les débuts des mots suivants ni les frontières de groupes oraux.

| Bloc | Relevé hors première syllabe de phrase, reproduit | Lecture des environnements réels dans la cohorte |
|---|---|---|
| 가 | `ga` 37 ; `ka` 11 | Toutes positions : `ga` 37 à l’intérieur du mot ; `ka` 12 en début de mot. Pas d’oscillation sur ce critère. |
| 고 | `go` 13 ; `kko` 8 ; `ko` 6 ; `kho` 3 | `go` après voyelle/sonante ; `kko` après obstruante ; `kho` avec ㅎ ; `ko` principalement initial d’un autre mot. Un `ko` interne perd réellement l’aspiration : 않고. |
| 다 | `ta` 11 ; `da` 6 ; `tta` 3 | Une partie des `ta/da` commence un autre mot. Les `tta` de 닫았다가 proviennent d’une tension réelle ; ils ne doivent pas être ramenés mécaniquement à `da`. Le mélange initial de 다른 demeure, voir proposition 3. |
| 보 | `bo` 10 ; `po` 10 ; **`ppo` 1 également présent** | 드라마보다 : `bo` intervocalique. 것보다 : `ppo` après obstruante. 확보할 : `ppo` attendu, actuellement `po`. Les autres `bo/po` commencent des mots ; leur frontière prosodique n’est pas décrite par « médian dans la phrase ». |

La liste jointe [coreen-contextes.json](coreen-contextes.json) contient **toutes les occurrences alignables de ces quatre blocs** dans les 240 aides : phrase, aide entière, mot, indice du bloc et position orthographique. Les positions sont descriptives ; ce fichier ne prétend pas valider automatiquement chaque occurrence, ni classifier exhaustivement les 521 écarts.

### Contre-exemples contrôlés

- **나가고** dans `fr-ko:loisirs-sorties-01` : `na-ga-go`, avec 가 et 고 intervocaliques internes. Ce n’est pas le même environnement que **고마워요**, initial d’un mot dans `piste-douleur-simple-08`, rendu `ko-ma-ouo-yo`.
- **먹고, 찾고, 듣고** : [먹꼬], [찯꼬], [듣꼬]. `kko` représente une tension après obstruante, pas une hésitation entre sourde et sonore.
- **않고, 놓고** : [안코], [노코]. `kho` représente l’aspiration liée à ㅎ. **알고**, après ㄹ sonant, garde `al-go` : « après toute finale, tendre » serait faux.
- **닫았다가** dans `piste-depannage-connexion-04` : `ta-da-tta-ga`. La liaison puis la tension changent la syllabification sonore ; les blocs 닫 / 았 / 다 / 가 ne peuvent pas recevoir chacun un rendu indépendant fixé par majorité.
- **시간을** : `chi-ga-neul`. Le /n/ de 간 est reporté dans l’attaque de la syllabe suivante ; `간 → ga` n’est pas une consonne perdue. Le même problème affecte des écarts comme `을 → geul` après une finale ㄱ. Une égalité de nombres de jetons ne rend pas cet alignement phonologique certain.
- **-(으)ㄹ 수** : le `ssou` de `할 수` peut rendre une tension réelle, [할쑤]. Il ne démontre pas à lui seul une nouvelle règle générale « ㅅ devient ss ».

La référence a aussi ses défauts : `catalogue:ko:1328` **우리는 먹고 있었어요.** porte `ou-ri-neun mok-go iss-o-sso-yo`, et `catalogue:ko:995` **가방을 놓고 왔어요.** porte `ga-bang-eul no-go oua-sso-yo`. Les nouveaux `mok-kko` et `no-kho` préservent des distinctions que ces deux références effacent. **Revenir aveuglément au rendu majoritaire dégraderait ces cas.**

## Règle proposée pour les nouvelles aides

Il s’agit d’une **convention pédagogique francophone**, pas d’une romanisation normalisée ni d’une transcription IPA.

1. **Partir de la phrase et du groupe oral.** Établir liaison/resyllabation, neutralisation des finales, assimilation, aspiration par ㅎ et tensions obligatoires, y compris les constructions grammaticales comme `-(으)ㄹ 수` et `-ㄹ게`. Ne jamais attribuer automatiquement une syllabe française à chaque bloc hangeul.
2. **Distinguer les séries.** Dans la notation déjà employée dans ce lot, `go` pour 하고/알고, `kko` pour 먹고/찾고/듣고 et `kho` pour 놓고/않고 sont trois cas différents. Une sonante ne déclenche pas à elle seule toutes les tensions ; une finale sourde et ㅎ ne sont pas équivalents.
3. **Déclarer le voisement retenu.** Proposition : `k/t/p/tch` à l’initiale d’un **groupe oral** ; `g/d/b/dj` entre voyelles ou après sonante à l’intérieur de ce groupe, sauf les règles précédentes. Au début absolu d’une phrase, cela conduit notamment à `ta-reun`. Une initiale de mot située au milieu de la phrase peut appartenir au groupe précédent : elle n’est donc pas automatiquement une initiale sourde. La phonétique du coréen de Séoul varie aussi selon la prosodie ; « toujours sourde non aspirée à l’initiale » serait une définition trop absolue.
4. **Rendre cette règle tenable éditorialement.** Fixer la lecture lente en groupes de sens pour chaque aide entière ; garder le même rendu d’un même groupe réemployé, sauf différence de prosodie explicitement voulue. Sans découpage ou audio, un `bo/po` initial d’un autre mot doit rester **à trancher**, pas être automatiquement déclaré fautif. Le contrôle utile porte sur le mot et ses voisins, puis sur le groupe entier.
5. **Séparer décisions nouvelles et copies.** Les imports `existing-verbatim` gardent leur aide historique, avec leur provenance. Leur coexistence avec les nouvelles aides doit être déclarée. On peut ensuite décider d’un chantier classique séparé ; cette réponse ne l’autorise pas et ne le réalise pas.

Une variation éditoriale demeure, par exemple entre **문제 사진을 보내 드릴 수 있어요.** (`service-client-04`, `... sa-dji-neul bo-nè ...`) et **영수증과 사진을 보내 드릴 수 있어요.** (`piste-reclamation-tact-05`, `... sa-dji-neul po-nè ...`). Le groupe verbal est le même ; son rendu doit être stabilisé après choix du groupement oral. Cela ne permet pas de déclarer que toute réalisation `po` à une frontière de groupe est phonétiquement impossible.

## Trois propositions entières à Claude — non appliquées

Version structurée : [coreen-propositions.json](coreen-propositions.json).

Statut commun : **`proposed-whole-aid-pending-Claude`**. Les formes étudiées, sens, lectures et ledgers restent inchangés. Ces propositions corrigent les points précisément audités ; elles ne certifient pas les autres segments de chaque aide.

### 1. Aspiration de 않고

Localisateur : `docs/niveaux-progressifs/enrichissement-situations/fr-ko.json`, `/items/79/phon`, ID **`fr-ko:nature-gestes-08`**.

**이렇게 하면 나들이를 복잡하게 만들지 않고 쓰레기를 줄일 수 있어요.**

Avant, aide entière :

```text
i-ro-khé ha-myon na-deu-ri-reul pok-tcha-pa-gué man-deul-dji an-ko sseu-ré-gui-reul djou-ril ssou i-sso-yo
```

Proposition entière :

```text
i-ro-khé ha-myon na-deu-ri-reul pok-tcha-pa-gué man-deul-dji an-kho sseu-ré-gui-reul djou-ril ssou i-sso-yo
```

Motif : **않고 [안코]** porte une aspiration. La même construction 만들지 않고 est déjà rendue `man-deul-dji an-kho` dans `piste-reclamation-tact-02` et `piste-limites-relationnelles-04`. Ici, le défaut ne dépend pas d’une frontière prosodique hypothétique.

### 2. Tension de 확보할

Localisateur : `docs/niveaux-progressifs/enrichissement-situations/extension-fr-ko.json`, `/items/143/phon`, ID **`fr-ko:piste-repondre-objection-08`**.

**그건 분명한 한계예요. 하지만 소규모 그룹이라면 각자 말할 시간을 충분히 확보할 수 있어요.**

Avant, aide entière :

```text
keu-gon poun-myong-han han-gyé-yé-yo. ha-dji-man so-kyou-mo keu-rou-bi-ra-myon kak-tcha mal-hal chi-ga-neul tchoung-boun-hi houak-po-hal ssou i-sso-yo
```

Proposition entière :

```text
keu-gon poun-myong-han han-gyé-yé-yo. ha-dji-man so-kyou-mo keu-rou-bi-ra-myon kak-tcha mal-hal chi-ga-neul tchoung-boun-hi houak-ppo-hal ssou i-sso-yo
```

Motif : **확보할 [확뽀할]**, avec ㅂ tendu après la finale ㄱ. La même distinction `pp` est déjà utilisée pour 것보다 (`kot-ppo-da`). Ce `po` intérieur n’est pas un simple cas d’initiale de groupe.

### 3. Convention à l’initiale de 다른

Localisateur : `docs/niveaux-progressifs/enrichissement-situations/fr-ko.json`, `/items/6/phon`, ID **`fr-ko:repas-preferences-07`**.

**다른 요리로 할게요.**

Avant, aide entière :

```text
da-reun yo-ri-ro hal-kké-yo
```

Proposition entière, si la règle initiale proposée est retenue :

```text
ta-reun yo-ri-ro hal-kké-yo
```

Motif : le même lexème **다른** commence aussi la phrase de `piste-depannage-connexion-05`, rendu `ta-reun ...`. Il n’existe dans ces deux cas aucune opposition de position justifiant `da` d’un côté et `ta` de l’autre. **C’est un choix de cohérence conventionnelle**, distinct des deux défauts d’aspiration/tension ci-dessus.

## Limite explicite

Cette passe reproduit les mesures, contextualise exhaustivement **보/고/다/가 dans la cohorte alignable**, et propose les trois corrections entières localisées. **Elle ne classe pas exhaustivement les 521 écarts et ne valide pas les 240 aides une par une.** Les autres consonnes, voyelles, groupes prosodiques et approximations francophones restent dans la relecture de Claude. Aucune aide automatique n’est fabriquée en assemblant des syllabes, aucun texte produit n’est modifié, aucune fusion ni publication n’est effectuée.
