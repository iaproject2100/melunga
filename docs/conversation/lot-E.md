# Lot E — reprise locale

Branche `feat/conversation-integration` (PR #7), après F `fb2bbaf`. Aucun changement des contenus, des comptes ou de la facturation. Ni fusion ni déploiement.

## Comportement

- Stockage local par couple maternelle/étudiée : `melunga_conversation_resume_v1:<nat>:<study>`.
- Valeur : `{version:1, level, unitId}`. Aucun texte personnel, score ou droit d'accès enregistré.
- Après un chargement réussi, le niveau est mémorisé. Après le choix d'un modèle, son identifiant stable est mémorisé.
- À l'ouverture suivante, reprise du modèle à l'étape 2 avec sa variante de découverte, ou liste des modèles du niveau si aucun modèle n'avait été choisi.
- Chaque couple reprend sa propre position lors d'un changement de langue dans le panneau.
- Identifiant disparu : retour à la liste du niveau, sans sélectionner arbitrairement un autre modèle.
- Version inconnue, JSON invalide ou niveau incorrect : retour à L1.
- Les droits sont revérifiés à la réception d’un chargement retardé.
- Accès Premium absent : un niveau mémorisé supérieur à L1 ne permet pas de le rouvrir sur le site public ou dans l'application native.
- Stockage inaccessible ou quota dépassé : le parcours continue sans reprise persistante.
- Les chargements échoués ou devenus obsolètes n'écrivent pas de progression.

La position du dialogue, la variante, le rôle masqué et les réponses révélées ne sont pas mémorisés. Aucun acquis n'est déduit de la position enregistrée.

## Ajustements de la revue A/D/F

- A : refus explicite des niveaux fractionnaires, test ajouté au chargeur.
- D : `BText` n'utilise que les valeurs textuelles ; les dictionnaires d'aides de lecture ne peuvent pas devenir `[object Object]` dans l'interface.
- F : l'encart est conservé dans les exercices et les dialogues. Une reprise directe à l'étape 2 ne peut donc plus éviter l'information éditoriale.

## Vérifications

Tests Node du chargeur et test UI Chromium existants, étendus à :

- reprise du niveau 5 et d'un modèle après rechargement de page ;
- positions distinctes fr→es et fr→ja ;
- modèle supprimé, stockage corrompu et stockage bloqué ;
- niveau Premium enregistré mais non accessible, et accès retiré pendant le chargement ;
- statut de relecture visible dans un modèle repris, le rappel et le dialogue.

Commandes :

```sh
node --check melunga_deploy/construire.js
node melunga_deploy/tests/conversation-loader.test.cjs
NODE_PATH=/tmp/melunga-review-tools/node_modules node melunga_deploy/tests/conversation-ui.test.cjs
```

Les vérifications B/C sont conservées. Essais réseau et accès payé simulés ; pas de validation APK réelle.
