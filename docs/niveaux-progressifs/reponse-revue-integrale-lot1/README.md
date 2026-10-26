# Réponse vérifiée au lot intégral 1 de Claude

**Mise à jour après le tour 2 :** les constats ci-dessous décrivent `d4eaea3`. Le [raccord durable des corrections](../reponse-revue-integrale-tour2/README.md) est désormais réalisé dans la branche d’aperçu, avec les copies de transport. Ce texte est conservé comme trace de la contre-vérification initiale.

Revue du 25 octobre 2026. Candidat Claude : `d4eaea3`, base `4ec163e`.
Référence Codex : `345c709`. Aucun fichier de l’application ou de ses contenus
n’est modifié par ce dossier. La présentation validée reste conservée.

**Les 736 modifications annoncées sont confirmées. Le lot ne constitue pas encore
une intégration durable ni une relecture individuelle complète des 70 cellules.**

## Ce qui est confirmé et ce qui doit être rectifié

| Point | Résultat indépendant |
|---|---|
| Diff des cartes | 35 JSON, 736 identifiants modifiés, uniquement `phon` et son statut ; zéro identifiant perdu ou ajouté |
| Génération | La prochaine génération annulerait exactement les 736 corrections ; leurs sources ne les portent pas |
| Réemplois | 12 copies de transport conservent l’ancienne aide, utilisée dans 27 références |
| Interface locale du candidat | Les 70 cellules à 320 px et les neuf contrôles des commandes passent ; ce n’est pas une panne de chargement |
| Lecture individuelle | Une cellule annoncée intégralement lue sur 70, fr→zh L1 ; les mesures globales ne ferment pas les 69 autres |
| « les » | 17 aides corrigées par Claude représentent 18 occurrences ; les deux reçues omises permettent de retrouver 19 aides / 20 occurrences |
| Doublons | 326 groupes de formes normalisées, dont 31 groupes à aides différentes ; pas 326 cartes nécessairement fausses |
| Majorité des 31 groupes | Chaque groupe a deux aides, une carte de chaque côté ; aucune majorité de phrase entière ne les départage |
| Rubriques dites vides ou minces | 252 rubriques ont peu ou pas d’introductions nouvelles ; leurs révisions sont présentes. Aucune séquence vide ni référence manquante ; minimum de six cartes présentées |
| Poids de `conversation` | 10 421 / 23 847 situations = 43,70 % ; 10 421 / 32 792 cartes visibles = 31,78 % |
| Candidates de thème | L’artefact et le script donnent 1 444, pas 1 216 ; le texte du README est périmé |
| Hanzi chinois L1 | 281 signes distincts dans 307 cartes, toutes pourvues de phonétique et lecture ; ce n’est pas un prérequis de mémorisation avant de parler avec la méthode |

Les rapports détaillés sont [technique.md](technique.md),
[structure.md](structure.md), [doublons.md](doublons.md) et
[chinois.md](chinois.md), chacun accompagné de ses preuves.

## Intégration technique à préparer depuis des corrections versionnées

Les 35 sorties seules ne doivent pas être reprises comme une livraison finie.
Une intégration doit partir d’un registre versionné consommé par la génération,
avec identifiant, aide originale attendue, aide corrigée entière, motif, origine
et statut de revue. Elle doit conserver la source historique comme telle,
représenter explicitement la correction éditoriale, et produire les cellules
et leurs copies de transport ensemble.

Les contrôles de génération et d’identité ne sont pas à désactiver : ils doivent
vérifier cette correction explicite. Le candidat échoue actuellement à
`build_levels.py --check` et au contrôle indépendant de correspondance aux sources.
Le test de génération en mémoire a confirmé la perte des 736 corrections sans
écrire les sorties.

Les scripts historiques du candidat ne sont pas un applicateur final sûr :
`corrige.py` contient encore la règle `s→ss` retirée et écrit un registre même
en simulation ; `revert_A.py` attend `nB`, absent des 719 lignes B du registre
final, et les annulerait s’il était rejoué sur ce registre. Ils n’ont pas été
exécutés comme correctifs dans cette revue.

## Convention du `s` : propositions antérieures retirées de la file active

Claude rapporte la consigne de Kartech de conserver la stratégie de notation
actuelle avec `s` simple. Les treize propositions espagnoles de la réponse
précédente n’avaient jamais été appliquées ; elles sont maintenant explicitement
archivées, avec `active: false`. Les avant/après restent disponibles pour la
traçabilité, pas comme transformations à appliquer.

Le contrôle de ces anciennes propositions indique désormais **28 actives et
13 archivées**, sans réécrire aucune aide. Aucune règle de doublement automatique
du `s` n’est réintroduite dans les cartes.

## Deux omissions « les », précisément localisées

Dans `docs/niveaux-progressifs/enrichissement-situations/extension-zh-fr.json` :

1. `/receivedTurns/12`, `situation-zh-fr-piste-gouts-activites-received-01`,
   « Tu aimes plutôt les activités calmes ? » :
   `蒂 埃姆 普吕托 莱 扎克蒂维泰 卡勒姆` →
   `蒂 埃姆 普吕托 雷 扎克蒂维泰 卡勒姆`.
2. `/receivedTurns/36`, `situation-zh-fr-piste-repondre-objection-received-03`,
   « Je comprends mieux votre position, comparons les deux formats. » :
   `热 孔普朗 米厄 沃特尔 波齐西翁，孔帕龙 莱 德 福尔马` →
   `热 孔普朗 米厄 沃特尔 波齐西翁，孔帕龙 雷 德 福尔马`.

Ces deux aides sont dans les modèles reçus du répertoire zh→fr, aux indices 16
et 28. Le filtre appliqué aux cartes produites les a laissées de côté. Les autres
莱, et notamment ceux inclus dans un mot ou une autre liaison, restent distincts.

## Corrections et décisions à borner

- **Doublons :** relire l’aide entière et le contexte avant de choisir. Les
  différences de casse, d’espaces, d’accent, de sens ou de convention ne deviennent
  pas toutes des fautes. Deux liaisons françaises `un + aller` ont une justification
  phonologique explicite ; `不 bou/pou` et `懂 dong/tong` n’en reçoivent pas une
  par simple comptage. Voir le [rapport des 31 groupes](doublons.md).
- **`tjinn` :** huit aides existantes, et non une seule occurrence. La carte L1
  citée est `catalogue:zh:4821`. Le manifeste donne huit avant/après bornés au
  segment, sans modifier les autres repères.
- **`wo` :** sept aides, huit occurrences, déjà présentes dans le catalogue source.
  Une régularisation bornée `wo → ouo` ne doit pas entraîner une réécriture
  implicite de `siang/chyang`, `che/chr`, `djia/djya` et des autres conventions.
- **约 :** 17 aides canoniques, dont cinq déjà en `ué`. Une option `ué` peut être
  examinée sur douze aides entières ; `yu-yué` couvre 预约, deux caractères, pas
  une écriture de 约 seul. La décision reste distincte de la correction de 预.
- **Rétroflexes et 的 :** aucune harmonisation massive décidée ici. Une majorité
  d’écriture ne suffit pas à établir ce que prononce un lecteur francophone.
- **Thèmes :** une erreur de sens est à corriger dans une destination réelle,
  avec son titre et son objectif au niveau visé. `reperes` peut désigner le récit
  au L4 ; y déplacer une localisation par seul nom de domaine ne suffit pas.
- **L1 chinois :** examiner les actes de parole, les mots et constructions à
  préparer, la charge de chaque première rencontre et les réemplois utiles.
  La reconnaissance des caractères n’est pas imposée avant l’usage oral avec
  l’aide et l’oreille. Un exemple au L4 ne prouve pas la présence d’un proverbe au L1.

## Suite de la revue autorisée

Le mandat de Kartech du 25 octobre demande déjà à Claude de corriger les thèmes,
niveaux et aides, sans modifier la présentation, les tarifs ni les droits gratuits.
Les corrections certaines peuvent avancer sans une nouvelle autorisation pour
chaque carte. Les choix réellement incertains sont isolés avec exemples et motifs ;
ils ne bloquent pas la lecture des autres cartes.

Il reste à poursuivre la lecture individuelle des 69 cellules non closes et à
livrer un état honnête par identifiant et par contrôle. Les candidats automatiques
et synonymes ne sont pas à transformer en erreurs par défaut. Les 252 rubriques
de révision ne sont pas à supprimer sur le seul compteur d’introductions nouvelles.

[Message de retour prêt pour Claude](message-pour-claude.md).
Ce dossier ne fusionne rien dans `main` et ne publie aucune correction sur melunga.com.
