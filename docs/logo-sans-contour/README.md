# Même mascotte, sans contour sombre

Le PNG utilisé par le parcours inclut un fond bleu nuit autour du disque bleu. Le nouveau `melunga-logo.svg` reprend intégralement le SVG déjà présent dans la barre `.lockup` du classique ; seul le namespace XML nécessaire au fichier externe est ajouté. Aucun tracé, couleur ou détail de la mascotte n’est redessiné. Les deux pages du parcours pointent vers cet asset, avec les mêmes classes et dimensions. Les PNG restent intacts pour leurs autres usages.

Quatre contrôles indépendants réussis : égalité du SVG avec la source classique, contre-épreuve du bord sombre (1 292 pixels sombres dans l’anneau du PNG contre zéro dans le SVG), géométrie identique sur mobile et ordinateur, Pinyin, couleurs et menu conservés. Deux captures inspectées. Les mesures utilisent Chromium local et des tailles simulées, pas un téléphone physique. Seuls les GET de statut sont simulés ; aucune opération de compte.

Les 78 JSON et 13 fichiers protégés sont identiques à `main@a1085e8`. JavaScript, CSS, catalogue, droits, prix et backend restent inchangés. Neuf assets figés sont validés et cinq altérations non autorisées sont rejetées. Aucun audit exhaustif de données n’est prétendu rejoué. Les PR des séquences et de la progression du niveau restent séparées et non fusionnées.

Ces premiers rapports portent sur le composant logo isolé à partir de `a1085e8`. La composition dans l’aperçu de progression possède ses propres rapports et captures dans `docs/progression-niveau/`. Aucune publication isolée n’est effectuée : la validation de Kartech est attendue avant fusion.
