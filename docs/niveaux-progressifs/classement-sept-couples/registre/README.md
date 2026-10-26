# Registres des sept couples : contrat d’application

Les sept fichiers `<couple>.json` sont copiés octet pour octet depuis
`342600641c8a621019d0c05d75a481843640e9ed`, chemins
`docs/revue-integrale/classement-<couple>/registre-classement.json`.
Les textes livrés sont conservés dans [preuve-README.md](preuve-README.md) et
[preuve-message-pour-codex.md](preuve-message-pour-codex.md). Les empreintes des
pièces, des 78 fichiers d’entrée, du descripteur et du manifeste de sortie sont
énumérées dans [contrat.json](contrat.json).

Le registre anglais de cette livraison remplace entièrement celui de
`1bf76c72f58e2ffe37e27d2b137a1ebe350e097f`. Aucune sortie de l’ancienne branche
anglaise n’est utilisée comme entrée.

## Édition et ordre d’application

`all_classification.py` applique cette couche après les corrections existantes,
jusqu’au contenu du lot 9. Les fichiers d’entrée sont liés au snapshot
`13f42b5814f2b230d76d2d0ef267dcf406c523c2`. Pour chaque couple, tous les
`expectedBefore` sont confrontés à cette même édition avant la première mutation.
Le texte, l’identité, le niveau, le thème, le chemin et la position doivent
correspondre exactement. Un écart arrête la génération.

Les cartes survivantes gardent leur ordre ; les entrantes suivent l’ordre stable
du registre. Les neuf nouveaux thèmes sont insérés avant la première rubrique
lexicale du niveau. Les cinq renommages déclarés sont appliqués ; les identités
techniques et les photographies des thèmes renommés sont conservées.

## Comptages réconciliés

| Couple | Opérations | Déplacements | Changements de niveau déclarés | Opérations réserve | Déjà en réserve | Réserves supplémentaires des thèmes masqués | Réserve avant → après |
|---|---:|---:|---:|---:|---:|---:|---:|
| fr-en | 670 | 610 | 127 | 37 | 0 | 4 | 125 → 166 |
| fr-es | 308 | 302 | 33 | 5 | 1 | 6 | 163 → 173 |
| fr-it | 278 | 224 | 61 | 48 | 2 | 4 | 149 → 199 |
| fr-ja | 580 | 470 | 121 | 101 | 3 | 4 | 115 → 217 |
| fr-ko | 430 | 325 | 86 | 95 | 0 | 8 | 87 → 190 |
| fr-zh | 340 | 337 | 131 | 2 | 0 | 2 | 92 → 96 |
| zh-fr | 300 | 264 | 63 | 30 | 1 | 5 | 131 → 165 |
| **Total** | **2 906** | **2 532** | **622** | **318** | **7** | **33** | **862 → 1 206** |

Les 56 opérations de maintien restent tracées dans le descripteur. Les **33 654
identités canoniques** restent présentes exactement une fois, dont **32 448
actives** et **1 206 en réserve**. Le gain net de réserve est **344** :
`318 opérations − 7 cartes déjà réservées + 33 cartes de thèmes masqués`.
Les sept opérations concernant une carte déjà réservée conservent sa position,
ajoutent l’annotation prévue et ne créent pas de deuxième carte.

`hideThemes` s’applique **après** tous les déplacements. Les 29 thèmes désignés
quittent la grille, même s’il reste des références de révision. Leurs métadonnées
sont conservées dans `retiredThemes`. Un autre thème, fr-en `L4-decrire`, ne possède
plus aucune présentation et est également retiré. Aucun autre thème non vide
n’est masqué automatiquement.

Quatre opérations sont supplantées par le masquage de leur destination : les
maintiens de `catalogue:es:3211` et `catalogue:zh:2477`, ainsi que les déplacements
entrants de `catalogue:en:3421` vers `L3-decrire` et de `catalogue:ko:3967` vers
`L2-travail`. Ces deux cartes entrantes sont donc réservées au niveau éditorial
d’arrivée, respectivement 3 et 2. Les 622 changements de niveau décrivent les
opérations de déplacement approuvées et ne sont pas recalculés à partir du seul
résultat final. Six opérations vers la réserve possèdent aussi un `toLevel`
explicite : deux italiennes, une japonaise et trois coréennes. Leur cellule de
réserve suit ce niveau d’arrivée, déclaré séparément par `reserveLevelChanges`.

## Champs et présentations

Les seuls champs canoniques modifiés sont `editorialLevel`, les trois clés
courantes `placement.domain`, `placement.themeId`, `placement.section`, et la
nouvelle annotation `classification`. Tous les autres champs sont comparés
égaux après restauration de ces cinq éléments : étude, sens, aide entière,
lecture, type, classe lexicale, source, niveau source et anciennes annotations.
Une annotation `hide-theme-to-reserve` conserve l’opération qu’elle supplante.

Les mélanges restent explicites : **58 thèmes** portent `mixed` et leurs listes
finies de types et d’identités. Les **72 petits thèmes** non vides restent visibles
et signalés, dont les nouveaux thèmes approuvés avec deux ou trois cartes. Les
**67 thèmes au-delà de 100 présentations** sont signalés sans découpage éditorial
automatique. Les groupes techniques restent limités à cinq cartes.

Les huit intentions et toutes les étapes d’origine de chaque mini-scène restent
identiques. Les **163 présentations entrantes** sont ajoutées après ce noyau.
Cinq cartes déjà présentes comme réemplois deviennent primaires dans la même
scène : leurs références d’intention restent des alias, avec une seule
présentation et un seul canonique. La phrase chinoise
`situation-conversation:fr-zh:loisirs-sorties-04` conserve son intention d’origine
par une référence explicite à son nouveau canonique dans la scène sportive.

Le mot italien entier `una parola`, déjà typé `vocabulary`, rejoint la scène
`L1-situation-piste-ralentir-repeter` conformément au registre. Il garde son type
et se pratique comme mot dans une extension après les huit intentions, déclarée
par `classificationTypedExtensionIds`. Aucun mot n’est transformé en phrase et
aucune carte active approuvée n’est silencieusement exclue de l’entraînement.

Les 89 références devenues futures, réservées ou incompatibles avec la famille
ou le type d’une révision sont retirées et déclarées. Les réemplois contextuels
et soutiens des scènes gardent leur rôle propre ; leurs pointeurs suivent le
canonique courant. Deux soutiens lexicaux devenus réservés sont retirés des
scènes japonaises et coréennes. Treize copies de transport réservées sont gardées
avec `canonicalReserveLocation`, sans être exercées par une référence retirée.

Les modèles reçus gardent exactement leurs textes, sources, rôles et niveaux
d’écoute. Seuls deux pointeurs changent : `catalogue:en:748` désigne désormais la
réserve canonique L3 et `catalogue:zh:3907` le canonique actif L2. Les étapes
`receive` d’origine restent hors production et hors progression de production.

## Empreintes et composition future

Le manifeste et le rapport portent `allClassification`. Son empreinte canonique
complète est figée, ainsi que le manifeste entier et les onze fichiers de chaque
couple : dix niveaux et un répertoire. Une seconde application à l’édition
exacte est sans effet ; un descripteur ou un fichier de sortie modifié est
refusé. Le mode historique `include_situations=False` conserve ses sorties
historiques sans cette couche.

Cette PR contient uniquement le classement. Les travaux séparés de contenu
incertain et de conventions ne sont pas incorporés. Leur composition future
nécessitera un ordre de couches explicite, une nouvelle confrontation aux
preuves et un nouveau gel des empreintes ; aucun flottement de référence ne
les appliquera implicitement.

Les visuels utilisent neuf affectations et huit cadrages photographiques
existants, le cadrage Téléphone étant partagé entre fr-en et fr-ja ; aucun asset
n’est créé. Le registre et les cadrages sont documentés dans
[visuels.json](../visuels.json) et [visuels.md](../visuels.md).

Les contrôles de traçabilité ne prouvent ni acquisition ni validation pédagogique
de chaque apprenant. Aucun `lv` source, prix, abonnement, droit gratuit,
authentification ou carte du catalogue classique de 32 115 cartes ne change.
Aucune fusion dans `main` ni publication sur melunga.com n’est autorisée ici.
