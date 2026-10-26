# Extension des dix situations : les dix-huit pistes documentées

Le plan commun gelé comprend **28 modules et 224 intentions apprenant par couple** : les dix modules antérieurs (80 intentions) restent intacts ; les dix-huit modules ajoutés apportent 144 positions supplémentaires. Une position réemployant une phrase existante n’est pas une nouvelle phrase. Les sept couples représentent 1 568 positions, dont 560 appartiennent au lot précédent.

`plan-base10.json` protège les octets du plan précédent. Dans `plan.json`, `scope` décrit ce lot de base ; `extension` et `combinedScope` décrivent séparément l’extension et l’ensemble. La matrice `matrice-couverture.json` relie chacune des dix-huit propositions de la recherche publique à un module et à ses huit intentions. La proximité d’un mot avec une ancienne rubrique ne vaut pas couverture d’une intention.

Chaque module ajouté contient huit répliques complètes au même niveau, ordonnées de 01 à 08, et deux tours de l’interlocuteur. Le module d’argumentation L9 en contient trois : question, objection, clôture. Les **37 tours reçus par couple** sont en compréhension seule, avec rôle explicite ; ils ne comptent pas dans la progression de production. La réponse ciblée est comprise et imitée avant l’écoute de la question. Une clôture déclare explicitement `answerWith: []`.

Au moins deux mots ou groupes lexicaux autonomes soutiennent chaque module. Ces soutiens restent dans le vocabulaire et ne deviennent pas des étapes de production de phrase. Une première rencontre éditoriale et un réemploi sont distingués ; aucun niveau d’accès du catalogue n’est modifié.

Les fichiers `extension-<couple>.json` complètent les sept ledgers précédents sans les réécrire. Les champs des sources existantes sont repris en entier. Une aide réellement rédigée porte `phoneticReviewStatus: pending-Claude`. Claude vérifie la phonétique ; Codex assume le classement, le sens, le niveau, la densité et la cohérence pédagogique. Ces documents ne constituent pas une publication.


Les comptes réels et le bilan de la matrice complète sont consignés dans [README-extension.md](README-extension.md) et [couverture-execution.json](couverture-execution.json).
