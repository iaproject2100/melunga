# Audit indépendant du registre de classement anglais

Le registre `1bf76c72f58e2ffe37e27d2b137a1ebe350e097f` est comparé directement aux dix cellules anglaises du snapshot `13f42b5814f2b230d76d2d0ef267dcf406c523c2`, sans importer le générateur. Les **670 emplacements attendus correspondent exactement**. La simulation est simultanée : chaque avant est contrôlé contre le snapshot, avant de compter un déplacement.

Le [rapport JSON](audit-registre.json) donne les 670 décisions, les comptages de chaque thème, les couples de doublons, les références et les empreintes des 77 fichiers. Le [script autonome](reproduire-audit.py) n’écrit aucun fichier produit.

## Conservation et répartition

- 610 déplacements, dont 127 changements de niveau et neuf cartes vers trois nouveaux thèmes.
- 37 passages en réserve : 32 variantes de doublons et cinq cartes sans destination retenue.
- 23 maintiens : **21 cartes visibles et deux cartes déjà en réserve** (`3445`, `3447`).
- **4 704 cartes canoniques conservées** : 4 579 → 4 542 visibles ; 125 → 162 en réserve. Aucune suppression.

| Niveau | Visibles avant → après | Réserve avant → après | Total canonique avant → après |
|---|---:|---:|---:|
| L1 | 389 → 396 | 17 → 19 | 406 → 415 |
| L2 | 570 → 595 | 13 → 21 | 583 → 616 |
| L3 | 749 → 777 | 16 → 25 | 765 → 802 |
| L4 | 529 → 477 | 11 → 15 | 540 → 492 |
| L5 | 711 → 712 | 10 → 20 | 721 → 732 |
| L6 | 484 → 461 | 17 → 20 | 501 → 481 |
| L7 | 444 → 437 | 9 → 10 | 453 → 447 |
| L8 | 308 → 312 | 22 → 22 | 330 → 334 |
| L9 | 173 → 153 | 6 → 6 | 179 → 159 |
| L10 | 222 → 222 | 4 → 4 | 226 → 226 |

Le niveau éditorial peut changer ; le `sourceLevel` du catalogue doit rester inchangé. Les mots, phrases, sens, aides, lectures, sources et anciennes annotations ne sont pas corrigés par ce registre. Les textes de prix et le catalogue classique restent des invariants distincts.

## Variantes de doublons

Les 32 variantes à ranger ont toutes une contrepartie identifiable dans les propositions d’origine, qui reste visible après ces décisions. Deux contreparties changent aussi de thème ou de niveau (`1064`, `1133`). Les comparaisons sont : **deux études strictement identiques**, 21 différences de casse/ponctuation/trait d’union, deux contractions, cinq articles, un `OK/okay`, et une variante `this/it` explicitement retenue. Aucune équivalence plus générale n’est déduite de ces 32 paires.

Les quatre signalements de doublon conservés sont explicites : `3134/3133`, `3445/3446` et `3447/3448` ont déjà une seule variante visible. **`2594/2581` reste une exception** : « We'll cross that bridge when we come to it » est dans `L8-conversation`, et la variante avec *get* dans `L8-reperes`. Le motif `keep` ne demandait le retrait de *get* que si les deux étaient dans le même thème ; elles restent donc toutes deux visibles selon ce registre. Les 38 lignes initiales de doublons donnent 36 paires : 32 rangements, trois cas déjà à une visible et cette paire maintenue. Aucune 671e opération n’est ajoutée silencieusement.

Les cinq réserves sans thème sont `1052`, `1633`, `1353`, `1847` et `3532`. Elles sont conservées avec leur texte entier.

**Rôle distinct à préserver : `748` (« Have a good trip. ») est aussi un modèle reçu.** Sa carte canonique va en réserve tandis que `749` reste présentée. Sa réplique reçue doit rester disponible en compréhension seule : partager un identifiant ne confond pas production et réception.

## Thèmes à surveiller

Les premiers tableaux ci-dessous concernent les **cartes canoniques principales**, distinctes des concepts réellement présentés après ajout des révisions et réemplois. Des thèmes avaient déjà peu ou pas de cartes principales et étaient alimentés par des révisions. Le contrôle `--runtime`, exécuté après génération, donne ensuite les tailles finales observées : un petit nombre principal ne doit donc pas être présenté seul comme un thème vide.

Les trois nouveaux thèmes approuvés contiennent trois cartes chacun : **L3-sante**, **L5-cuisine-recette**, **L9-telephone**. Il ne faut ni inventer de cartes ni étendre silencieusement cette exception à toutes les rubriques.

| Rubrique dont le principal passe sous six cartes | Avant | Après |
|---|---:|---:|
| L3 · Décrire un lieu ou une personne (`L3-decrire`) | 8 | 2 |
| L4 · Relier les étapes d’un récit (`L4-reperes`) | 11 | 3 |
| L6 · Expliquer et vérifier le sens (`L6-comprendre`) | 8 | 4 |
| L6 · Temps et repères (`L6-vocab-reperes`) | 8 | 4 |
| L9 · Défendre un choix de consommation (`L9-repas`) | 9 | 0 |
| L9 · Structurer une argumentation (`L9-reperes`) | 8 | 0 |

Neuf thèmes perdent leur dernière carte principale : `L4-saluer`, `L4-decrire`, `L9-ressentis`, `L9-repas`, `L9-deplacements`, `L9-reperes`, `L9-quotidien`, `L9-vocab-personnes`, `L9-vocab-nature`. Leur visibilité finale dépend des références encore pertinentes ; aucune carte ne doit être inventée pour les remplir.

Le seuil **80 cartes principales** ci-dessous est un **signal éditorial**, pas une limite technique ou une décision de fusion. Huit de ces neuf thèmes ont au moins 100 cartes. Certains restent volumineux après ce lot : ce n’est donc pas une résolution générale de la densité.

| Rubrique volumineuse | Avant | Après |
|---|---:|---:|
| L2 · Poser et reprendre une question (`L2-conversation`) | 223 | 223 |
| L3 · Proposer et répondre (`L3-conversation`) | 235 | 225 |
| L4 · Partager une expérience (`L4-conversation`) | 152 | 105 |
| L4 · Actions et descriptions (`L4-vocab-actions`) | 132 | 162 |
| L5 · Se mettre d’accord (`L5-conversation`) | 158 | 124 |
| L5 · Actions et descriptions (`L5-vocab-actions`) | 206 | 213 |
| L6 · Donner son avis et relancer (`L6-conversation`) | 168 | 96 |
| L7 · Proposer une alternative (`L7-conversation`) | 199 | 198 |
| L8 · Exprimer un désaccord avec tact (`L8-conversation`) | 100 | 100 |

## Tailles réellement présentées après génération

Le contrôle des fichiers générés confirme **25 thèmes sous six concepts présentés** : 22 rubriques existantes et les trois nouveaux thèmes approuvés. Le registre est appliqué sans ajout de contenu pour masquer ces petits effectifs. **Deux rubriques devenues réellement vides, `L9-repas` et `L9-reperes`, sont retirées de la liste affichée**, sans perte de leurs cartes, déplacées ailleurs. Les autres thèmes ci-dessous restent visibles et sont signalés à enrichir ou à réorganiser dans un lot distinct.

| Thème visible à petit effectif | Concepts avant | Concepts après |
|---|---:|---:|
| `L2-vocab-travail` · Travail et démarches | 6 | 5 |
| `L3-decrire` · Décrire un lieu ou une personne | 8 | 2 |
| `L3-sante` · Santé : demander une aide médicale | nouveau | 3 |
| `L4-decrire` · Décrire un changement | 6 | 1 |
| `L4-reperes` · Relier les étapes d’un récit | 11 | 3 |
| `L4-saluer` · Raconter une rencontre | 6 | 2 |
| `L5-cuisine-recette` · Cuisine : suivre une recette | nouveau | 3 |
| `L6-comprendre` · Expliquer et vérifier le sens | 8 | 4 |
| `L6-vocab-maison` · Maison et mobilier | 6 | 4 |
| `L6-vocab-reperes` · Temps et repères | 8 | 4 |
| `L7-vocab-maison` · Maison et mobilier | 6 | 3 |
| `L7-vocab-nature` · Nature, jardin et météo | 6 | 5 |
| `L7-vocab-reperes` · Temps et repères | 6 | 3 |
| `L7-vocab-restaurant` · Restaurant et achats | 6 | 5 |
| `L8-comprendre` · Reformuler avec précision | 6 | 5 |
| `L9-comprendre` · Interpréter et reformuler un propos | 6 | 5 |
| `L9-deplacements` · Discuter des choix de mobilité | 6 | 2 |
| `L9-quotidien` · Discuter des modes de vie | 6 | 5 |
| `L9-ressentis` · Expliquer des motivations complexes | 6 | 1 |
| `L9-telephone` · Téléphone : accueillir, filtrer et faire patienter | nouveau | 3 |
| `L9-vocab-maison` · Maison et mobilier | 6 | 4 |
| `L9-vocab-nature` · Nature, jardin et météo | 6 | 5 |
| `L9-vocab-personnes` · Corps, personnes et émotions | 6 | 5 |
| `L10-vocab-maison` · Maison et mobilier | 6 | 4 |
| `L10-vocab-reperes` · Temps et repères | 6 | 4 |

**Sept thèmes dépassent strictement 100 concepts présentés.** Le mot « strictement » compte : `L8-conversation` vaut exactement 100 ; il y a donc huit thèmes à partir de 100 et neuf à partir de 80. Ces seuils sont éditoriaux, explicités pour ne pas masquer un effectif par arrondi ou convention.

| Thème visible au-dessus de 100 concepts | Avant | Après |
|---|---:|---:|
| `L2-conversation` · Poser et reprendre une question | 223 | 223 |
| `L3-conversation` · Proposer et répondre | 235 | 225 |
| `L4-conversation` · Partager une expérience | 152 | 105 |
| `L4-vocab-actions` · Actions et descriptions | 132 | 162 |
| `L5-conversation` · Se mettre d’accord | 158 | 124 |
| `L5-vocab-actions` · Actions et descriptions | 206 | 213 |
| `L7-conversation` · Proposer une alternative | 199 | 198 |

Les dix en-têtes de cellule sont aussi recalculés et comparés aux véritables listes : canoniques visibles, réserves, total, concepts présentés, réemplois et types. Aucun champ de texte, phonétique, source ou niveau source ne change.

## Références et types à vérifier au raccord

**26 références de révision** désignent des cartes déplacées ; aucune référence de contexte n’est concernée. **18 copies de transport** doivent suivre les nouvelles positions canoniques en conservant leurs textes et sources. Le cas `3045` (« the minutes »), déplacé de L1 à L9 mais révisé auparavant en L2, ne peut pas garder une fausse préparation antérieure en L2. D’autres références doivent éviter de réintroduire des termes de travail dans un ancien thème restaurant ou maison.

Le registre envoie aussi **147 cartes de type source `utterance` vers une rubrique `vocabulary`** et quatre cartes de type `vocabulary` vers les situations. Certaines étiquettes source sont heuristiques (`a runny nose` y vaut `utterance`) : ce nombre n’est pas un nombre de fautes linguistiques. Les phrases restent entières ; le raccord ne doit pas annoncer une séparation générale mots/phrases déjà achevée.

## Deux précisions sur la provenance

1. Le passage de **672 identifiants proposés à 670 opérations** se reconstruit précisément : trois identifiants de propositions restent comme contreparties visibles sans opération (`609`, `500`, `749`) et un autre identifiant choisi pour la réserve entre dans le registre (`748`). Donc **672 − 3 + 1 = 670**. Ce n’est pas seulement une déduplication de deux lignes.
2. Les listes `proposals` rattachent **685 codes sur 689**. Quatre codes manquent à ces listes : `P208` (`1065`), `P267` (`1198`), `P456` (`1714`), `P457` (`1715`). Leurs quatre conflits et leurs résolutions sont bien expliqués dans le README de Claude, et les cartes ont chacune leur opération. Les preuves ne sont pas réécrites ; cette limite documentaire est signalée au lieu de prétendre une couverture complète des liens.

## Reproduire

```sh
python3 -B docs/niveaux-progressifs/classement-fr-en/reproduire-audit.py
# Après génération seulement :
python3 -B docs/niveaux-progressifs/classement-fr-en/reproduire-audit.py --runtime
```

Le rapport porte désormais **`runtimeChecked: true`**. La simulation indépendante et la vérification des fichiers générés sont toutes deux réussies : 4 704 identifiants conservés, 0 avant incorrect, 0 carte réservée à produire, 0 révision issue d’un niveau futur et 0 révision hors de sa famille canonique. La variante `--runtime` contrôle aussi les 4 704 identifiants, les 37 mises en réserve hors production, les 36 reçus (35 objets identiques et le seul pointeur canonique de 748 déplacé vers la réserve), les 18 copies, les références réelles et les autres couples. Pour l’interface : 33 fichiers identiques, le JS de garde/reprise lié à une empreinte exacte, et deux seuls changements de clé de cache `v=12` → `v=13` dans les HTML. Aucun changement de mise en page, de CSS, de prix ou de catalogue classique.

Cette PR ne constitue ni une mesure d’acquisition ni une validation native globale. Aucune fusion dans `main` ni publication sur melunga.com n’est autorisée pour ce lot.
