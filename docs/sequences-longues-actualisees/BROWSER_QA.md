# Vérification navigateur du parcours découpé en étapes

Cette revue utilise les pages et les contenus actuels, après remise à jour de l’ancienne branche sur le produit publié `f25250627f94334fd097a4eed0d4da814d65561f`. Elle prépare des aperçus avant toute fusion dans `main`.

## Règle vérifiée

Les thèmes de plus de 100 cartes présentent un choix d’étapes de 30 à 40 cartes. Une étape réunit des groupes pédagogiques entiers : les identifiants, leur ordre et tous leurs pas sont comparés aux documents source, sans créer ni réécrire de phrase, de phonétique ou de traduction. Le test navigateur ne reprend pas l’algorithme d’optimisation pour fabriquer ses attentes ; il vérifie les frontières, tailles et données obtenues contre les groupes source indépendamment lus.

- Français → espagnol L2 : `L2-conversation`, **309 cartes, 9 étapes**. La première contient 30 cartes et conserve ses 90 pas guidés sur mobile.
- Français → chinois L10 : `L10-vocab-adjectifs`, **387 cartes, 11 étapes**, avec le Pinyin réel.
- Coréen → français L2 : `L2-conversation`, **229 cartes éligibles, 7 étapes**, avec les libellés et le sens coréens réels.
- Le thème anglais `L8-conversation` contient exactement **100 cartes** et reste une leçon directe. Les premières leçons L1 et leur entrée directe gardent leur présentation publiée.

La progression locale de la leçon repart à la première carte quand on passe à l’étape suivante. Les barres d’acquis du sélecteur utilisent exclusivement le registre de connaissances existant : ouvrir, parcourir ou quitter une étape ne valide aucune carte. Les compteurs d’acquis et leurs attributs accessibles sont contrôlés indépendamment des pas visités.

## Scénarios

Le nouveau test est `melunga_deploy/tests/long-sequences-current.browser.cjs`.

1. Choix et lecture de vrais thèmes longs sur mobile 320/390 × 740/844 et 380 × 844, ainsi que sur ordinateur 1600 × 900 et 1366 × 768. Les dernières étapes sont atteignables par un défilement utilisateur ; la capsule de contexte reste visible et retourne à la liste.
2. Sur ordinateur, validation des 30 premières cartes par les vrais clics « Continuer », fin d’étape, passage à la seconde, retour à la liste avec 30/30 acquis, rechargement persistant, puis fin de la dernière étape et retour à sa liste.
3. Sur mobile, conservation des 90 pas de la première étape ; seules les confirmations de rappel productif valident les cartes. L’écoute ne modifie pas la connaissance. La seconde étape démarre avec son premier identifiant source.
4. Une carte « À revoir » maintient l’étape à 29/30. Sa reprise depuis la liste réelle valide la carte et rétablit 30/30, sans perdre la progression au rechargement. Les registres mal formés n’empêchent pas l’ouverture ; un échec d’écriture au premier puis au dernier clic de validation bloque réellement la navigation jusqu’à une tentative réussie.
5. L’entrée directe L1 ne lance pas de son ni de choix d’étapes. Deux premières leçons, mobile et ordinateur, sont comparées pixel pour pixel avec la version publiée. Le seuil strict de 100 cartes est contrôlé sur un vrai thème.
6. L’interface coréenne et les données de son catalogue sont vérifiées, puis la présentation passe de l’ordinateur au mobile et revient sans perdre la carte ou l’étape. Le vrai raccourci latéral d’un autre thème conserve la navigation habituelle.
7. Les droits s’appliquent avant le découpage : un thème entièrement payant ouvre le compte d’origine ; le thème espagnol L2 partiellement gratuit ne réintroduit pas les cartes verrouillées. Le seuil tient compte du contenu effectivement accessible. La page L1 explicite `maquette-guidee.html` garde son fonctionnement et sa portée de progression.
8. Les deux préparations et les deux tours de l’interlocuteur de vrais thèmes courts chinois ne créent aucune acquisition. Les thèmes longs revus n’ont actuellement aucun de ces contextes ; aucun contexte artificiel n’est injecté pour ce contrôle.

Le cas entièrement verrouillé est `fr-es` L3, `L3-conversation` (206 cartes, aucune dans l’allowlist gratuite historique). Le thème chinois L10 Adjectifs possède cinq cartes historiquement gratuites et ne convient donc pas à une hypothèse de verrouillage intégral.

## Reproduction

```sh
LONG_SEQUENCES_CURRENT_REPORT_DIR=docs/sequences-longues-actualisees \
NODE_PATH=/tmp/melunga-review-tools/node_modules:/opt/codex/cua_node/lib/node_modules \
  node melunga_deploy/tests/long-sequences-current.browser.cjs
```

Le rapport `acceptance.json` contient les résultats et les empreintes des entrées. Les tests partiels de mise au point sont explicitement marqués `partial` ; seule l’exécution complète peut être marquée `passed`.

## Aperçus

- `choix-fr-es-L2-390.png` et `lecon-fr-es-L2-390.png` : choix et lecture sur mobile.
- `choix-fr-es-L2-1600.png` et `lecon-fr-es-L2-1600.png` : choix et lecture sur ordinateur.
- `progression-premiere-etape-fr-es-L2-390.png` et `progression-premiere-etape-fr-es-L2-1600.png` : progression réelle de 30/30 après les clics de validation.
- Les captures chinoises L10 illustrent les 11 étapes et le Pinyin ; les captures coréennes L2 illustrent le parcours natif.

Les captures roses sont obtenues avec le bouton d’ambiance d’origine. Les noms, textes et photos proviennent du produit réel, sans maquette de substitution.

## Limites

Chromium local avec tailles et gestes tactiles émulés. Le statut d’accès, le catalogue des voix et le lecteur média sont des fixtures explicites ; aucun compte réel, paiement ou fournisseur audio n’est sollicité. Aucun essai sur matériel physique ou Safari. Le choix d’une position courante ne bénéficie d’aucun nouveau stockage : la persistance démontrée porte sur les acquisitions et les rappels existants.

## Résultat final

Les **8 groupes et 18 cas passent**, avec **169 empreintes d’entrée stables** et aucune erreur navigateur, erreur de fixture ou requête inattendue. Le rapport et les 15 captures ont été produits sur le contrôleur `a4d3864167810eb352c8cfbe55b02a1732135b9c6abeb5e1f48217d37f8c436b` et la feuille de style `4654ab18b4724ed7f28463ce8e480c6ec58672eb5e6866449a1757fed62fdfca`, puis comparés aux fichiers effectifs.
