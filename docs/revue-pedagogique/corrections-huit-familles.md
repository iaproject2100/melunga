# Correction locale des huit familles

Proposition réalisée localement après la revue Claude `907a235`, sur la base applicative `d59b98d`. Aucun envoi distant, aucune fusion ni publication. Les décisions de Kartech sur le parcours, la largeur de L1, les rubriques et les priorités restent en attente.

## Périmètre

- Huit familles corrigées par quatorze substitutions de références, toutes prises dans le catalogue existant.
- Aucune phrase, traduction, aide phonétique, catégorie ou valeur de niveau de carte modifiée. Les 32 115 entrées sont conservées.
- Les 26 familles et 151 occurrences de chaque langue configurée restent présentes ; positions et niveaux des familles inchangés.
- Les annotations `arch` correspondant uniquement à ces huit familles sont synchronisées avec les nouvelles sélections. Les annotations des autres familles sont conservées.
- Le cadre anglais d’opinion devient `I think + opinion`, conformément aux six exemples retenus. Les constructions « penser à » et « croire en » restent dans la bibliothèque.
- Les métadonnées `sourceIndex` et `currentLevel` des références des huit familles sont recalculées depuis les phrases exactes, car les anciens indices ne correspondaient plus au catalogue réordonné. Le code courant résout les cartes par texte ; aucune logique de navigation n’est changée.

## Substitutions

| Langue | Famille | Étape | Ancienne référence | Nouvelle référence existante |
|---|---|---:|---|---|
| fr | `L2_ACTION_PROCHE` | 5 | Je vais mieux. | Je vais réfléchir. |
| en | `L2_ACTION_PROCHE` | 1 | I'm going to bed. | I'm going to go out. |
| en | `L2_ACTION_PROCHE` | 2 | I'm going to work. | I'm going to do it. |
| es | `L2_ACTION_PROCHE` | 1 | Voy a casa. | Voy a llegar pronto. |
| es | `L2_ACTION_PROCHE` | 7 | Voy a por agua. | Voy a repetirlo. |
| zh | `L2_ACTION_PROCHE` | 1 | 我要去…… | 我要去商店 |
| zh | `L2_ACTION_PROCHE` | 2 | 我要两个 | 我要买这个 |
| zh | `L2_ACTION_PROCHE` | 5 | 我要这个 | 我要走了 |
| zh | `L2_ACTION_PROCHE` | 7 | 我要那个 | 我要改签。 |
| fr | `L4_CONDITION` | 3 | Signez ici, s'il vous plaît. | Si tu es d'accord, on signe. |
| en | `L6_OPINION` | 4 | I think about you. | I think it's a good idea. |
| en | `L6_OPINION` | 5 | I believe in you. | I think it's going to work. |
| it | `L4_CONDITION` | 6 | Secondo me, è un errore. | Se vuoi, ti aiuto. |
| ja | `L9_HYPOTHESE` | 6 | もしかすると、明日は雨かもしれません。 | 必要なら行けますよ。 |

Les anciennes phrases restent consultables dans le catalogue ; elles sont retirées seulement du groupe qui ne correspond pas à leur construction. La phrase japonaise de possibilité reste aussi référencée dans `L9_PROBABILITE`. Le fragment chinois `我要去……` est remplacé dans cette famille par la phrase complète existante `我要去商店`.

## Ce que cette correction ne prétend pas résoudre

Elle corrige les constructions mélangées. La sélection complète de la difficulté, les prérequis, l’oral reçu, les nouvelles séquences et la couverture coréenne ne sont pas traités dans ce lot. Par exemple, la présence d’une hypothèse italienne avancée au milieu d’une famille reste une question de séquençage à examiner ensuite. Aucun champ `bricks`, `introduces`, `received` ou fichier `seq-*` n’est ajouté. Les quatre nouveaux couples pour lecteurs anglophones ne sont pas activés.

Les deux phrases anglaises ajoutées dans l’opinion possèdent leurs aides pour les lecteurs français/espagnols/italiens/chinois ; leur champ historique `py` vide est conservé tel quel. Cette correction ne constitue pas une nouvelle validation de toutes les prononciations ou de tous les publics.

## Vérifications

- Comparaison structurée avec la base : les contenus de toutes les cartes sont identiques, hors annotations de famille ciblées.
- Résolution du parcours guidé : six langues × 151 occurrences, avec mêmes identifiants, étapes et niveaux de famille.
- Contrôle des quatorze substitutions, du maintien des anciennes phrases dans la bibliothèque et du classement japonais de possibilité.
- Tests existants du chargeur conversation : tous passent.
- Tests existants de l’interface : sept couples actifs, variantes, rappel, dialogues, lectures, gestes, reprise, droits et formats 320×568 / 1440×900 passent.
- Aucun APK construit ou testé sur appareil pour ce lot. Les tests de l’interface utilisent des services simulés.

La correction est prête à être relue ; elle reste locale tant que Kartech n’autorise pas un envoi.
