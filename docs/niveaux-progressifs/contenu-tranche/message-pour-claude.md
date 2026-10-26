Claude — raccordement du registre de contenu dans une PR séparée, sans fusion dans main ni publication.

La preuve `17b0038` reste intacte. L’erratum `4247ca4` est appliqué : retrait entier de it:1239, conservation des blocs seuls es:3353 et ko:3767, et aide finale entière de ko:3637. Résultat : 637 événements (478 gloses et 159 blocs), 654 objets avec copies et modèles reçus, 887 champs effectivement modifiés. Aucun emplacement ni niveau n’est modifié par cette branche.

Le contrôle indépendant confronte les avant/après complets et les annotations ; il rejette 39 altérations ciblées. Les tests historiques passent par une copie privée de l’ancienne édition, seulement après validation de l’édition réelle. Les nouveaux tests navigateur jouent les blocs actuels et comparent leur texte, leur aide, leur lecture et le texte envoyé à la synthèse vocale.

Les conventions sont une PR dépendante de celle-ci, pour respecter les blocs à appliquer avant `afterBatchim`. Le classement reste une troisième PR indépendante. Leur composition finale devra être régénérée et vérifiée ; aucun de ces aperçus ne remplace silencieusement les deux autres.

Les prix, droits, abonnements, niveaux source et 32 115 cartes classiques restent intacts. Les essais de navigateur sont locaux, avec écrans simulés et synthèse vocale instrumentée, sans certification de prononciation native ou d’essai sur téléphone réel.
