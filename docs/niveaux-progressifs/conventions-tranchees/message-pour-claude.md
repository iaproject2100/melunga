Claude — les deux errata officiels sont raccordés, sans fusion dans main ni publication.

Trois PR brouillon sont disponibles :

- [#17 — classement des sept couples](https://github.com/iaproject2100/melunga/pull/17) : 2 906 opérations, tous les expectedBefore vérifiés, 33 654 canoniques conservés. Réserve nette +344 : 318 décisions − 7 déjà réservées + 33 cartes issues des thèmes masqués. Les neuf nouveaux thèmes gardent la présentation et les atlas existants. Les 72 petits thèmes, 67 gros thèmes et deux dépendances vers des réserves restent signalés.
- [#16 — contenu tranché](https://github.com/iaproject2100/melunga/pull/16) : 637 événements après retrait officiel de it:1239 ; 654 objets et 887 champs. Les blocs seuls es:3353 et ko:3767 et l’aide finale de ko:3637 suivent exactement 4247ca4.
- [#18 — jota et batchim](https://github.com/iaproject2100/melunga/pull/18) : 2 100 identités, 2 167 objets, 2 122 références. Les cinq après entiers de d5ad5e4 sont appliqués, sans changer leurs avant. Les 69 exclusions et les trois conventions supplantées restent protégées.

La PR #18 dépend du contenu de #16 et en contient les deux commits. Elle vise main pour déclencher Netlify ; [le diff propre aux conventions](https://github.com/iaproject2100/melunga/compare/review/contenu-incertain-tranche...review/conventions-jota-batchim) reste consultable séparément. Le classement #17 n’y est pas incorporé. La composition finale des trois lots nécessitera une génération et une revue explicites ; aucune de ces branches ne l’applique silencieusement. La précédente PR anglaise #15 est fermée, remplacée par #17.

Les vérificateurs indépendants contrôlent les objets complets avant toute projection historique. Ils rejettent 26 altérations pour le classement, 39 pour le contenu et 45 pour les conventions. Les nouveaux essais navigateur utilisent les données actuelles et la synthèse vocale sur l’étude entière. Pour le classement, la matrice documente explicitement une exécution complète à 16/19, puis cinq reprises ciblées après correction de fixtures ; les 19 groupes sont couverts et les 210 vues avaient réussi. Les rapports originaux sont conservés.

Les 32 115 cartes classiques, leurs niveaux source, les prix, droits gratuits, abonnements et formulaires restent inchangés. Le déplacement éditorial du parcours ne modifie pas la frontière gratuit/payant du catalogue classique.

Limite d’exploitation : le proxy de cet environnement refuse l’accès direct aux domaines Netlify (403, y compris après relance avec escalade). Les essais de navigation sont locaux, sur écrans simulés ; aucun parcours sur le site hébergé ni téléphone physique n’est revendiqué. Les statuts de build restent consultables sur GitHub. Rien à fusionner ni publier sans nouvel accord de Kartech.
