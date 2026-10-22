# Sept scènes L1 activées sur instruction de Kartech

Kartech demande : « codex peut faire sauter l exigence de preuve et activer que mon instruction ». Cette instruction autorise l’activation des sept scènes existantes, sans formulaire nominatif ou justificatif natif supplémentaire. Elle est enregistrée dans le manifeste ; aucun nom de relecteur, date de réponse ni verdict individuel n’est inventé.

## Résultat

- Les sept couples sont activés dans `l1-cafe-release.js`, pour abonnés et non-abonnés.
- Le manifeste version 2 applique `owner-instruction-only` : seul l’accord direct du propriétaire décide de la sélection ; `nativeReview` est informatif.
- Les [sept pièces jointes de consignation](etat-fiches.md) sont reconnues comme des modèles vierges. Le message transmis rapporte une validation native ; ce dossier ne prétend pas en avoir reçu sept comptes rendus remplis.
- Les 49 phrases, traductions, phonétiques et lectures du paquet restent identiques à `939b82e`. L’oreille conserve son comportement, y compris pendant le rappel.
- Les empreintes techniques, le filtrage des couples, la fermeture des configurations invalides et le garde `setMode()` pour les comptes payants restent en place.

Le lot ne change aucun tarif, droit L2–L10, catalogue ou autre parcours. Il n’intègre pas le reclassement L1–L10, ni les propositions italien L8, registre japonais/coréen ou phonétique chinoise.

Le paquet de contenu immuable conserve les marqueurs de revue de son instantané d’origine (`nativeReviewPending`, notamment). Ils ne décident pas de l’activation et ne sont pas transformés en certification native. L’état courant est porté par le manifeste version 2 et son instruction directe.

## Build Netlify

L’obligation Python ajoutée précédemment est retirée. Le contrôle devient `node check-l1-release.cjs`, sans dépendance externe ni historique Git. Le vérificateur résout son dépôt depuis `__dirname` : invoqué par son chemin, il fonctionne depuis la racine, `melunga_deploy` et un autre dossier. La commande Netlify est exécutée depuis la base du site `melunga_deploy`.

Le contrôle conserve l’égalité manifeste → empreintes → liste générée. Il ne vérifie aucun fichier de preuve humaine. Les tests croisent les résultats Node et Python pour les 128 sélections possibles des sept couples, et rejettent un script non régénéré ou une scène changée.

L’aperçu doit confirmer les paramètres réels du site et la disponibilité du fichier au build, avant toute fusion. Son résultat sera consigné dans `apercu-netlify.json`. L’ouverture d’une PR brouillon sert à cette vérification et n’autorise pas sa fusion.

## Contrôles et livraison

Les résultats locaux sont dans `checks.json`, les essais du joueur dans [tests-navigateur.json](tests-navigateur.json). Les tests utilisent un navigateur Chromium de bureau et un mobile émulé, avec comptes et audio simulés ; ils ne constituent pas une écoute ou un essai sur appareil physique.

Aucun des justificatifs facultatifs n’est ajouté aux conditions de cette activation. La mise en production reste distincte du changement préparé sur `review/integration-ponts-L1`. Aucun APK n’est construit.
