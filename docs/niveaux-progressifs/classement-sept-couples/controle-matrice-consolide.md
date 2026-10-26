# Matrice navigateur : consolidation de deux exécutions

Les **19 groupes uniques sont validés**. Ce résultat rassemble une exécution complète et une reprise ciblée ; il ne décrit pas une exécution complète entièrement verte.

- L’[exécution complète](controle-matrice-navigateur.json), conservée sans modification, a validé **16 groupes sur 19**, dont les **210 vues** des 70 cellules aux largeurs 320, 390 et 1440 px. Les trois échecs concernaient la reprise de réponses de test sérialisées avec des octets différents de l’édition gelée.
- Après correction des seules fixtures, la [reprise ciblée](controle-matrice-reprises.json) a validé **5 groupes sur 5** : les trois groupes en échec et les deux groupes de réponses retardées. Le [journal](controle-matrice-reprises.log) conserve le résultat de la commande. Le rapport de cette reprise garde le statut `partial`, car elle ne rejoue pas la matrice entière.
- Les bundles de cellules, répertoires, manifeste, sources rédigées et plan sont identiques entre les deux exécutions. Tous les autres fichiers recensés sont identiques ; seul `tests/levels-themes.browser.cjs` diffère. Chaque exécution a vérifié la stabilité de ses entrées.

Les réponses authentiques et inchangées passent désormais par le serveur local sans nouvelle sérialisation. Seul le document corrompu est remplacé. Les réponses retardées restituent également les octets exacts. Les 27 corruptions et reprises ciblées sont donc refusées par la garde d’intégrité de l’édition avant usage ; ce test n’affirme pas contourner cette garde pour atteindre les validations sémantiques. Les défauts sémantiques sont vérifiés séparément dans l’[audit indépendant](audit-independant.json).

La scène espagnole de reprise conserve ses huit intentions initiales et ses deux ajouts approuvés. Le compteur de requêtes mesure une requête supplémentaire après la reprise, y compris lorsqu’une cellule corrompue est rejetée avant le premier chargement du répertoire.

La [consolidation détaillée](controle-matrice-consolide.json) rattache chacun des 19 groupes à son exécution probante et conserve les empreintes des deux rapports. Aucun changement de JavaScript produit, HTML, CSS, contenu ou image n’est inclus dans cette correction. Aucune requête externe ou API n’a été observée. Chromium local et écrans émulés ; aucun site public ni téléphone physique n’a été testé.
