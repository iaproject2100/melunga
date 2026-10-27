# Démarrer et revenir au nouveau parcours

La régression a été reproduite avec les véritables écrans : accueil anglais → offre Premium → choix de l’espagnol → Démarrer. Le lien ouvrait `app.html` avec `checkout=annual`, mais sans `courseReturn` ; l’assertion obtenait `null` au lieu de `en-es`. L’ancien test de ce chemin remplaçait la page de compte par une page factice et ne vérifiait pas sa fermeture.

La passe finale du **27 octobre 2026 réussit : 7 groupes, 24 cas**, avec des sources identiques avant et après l’exécution. Aucune erreur JavaScript, erreur de fixture ou requête inattendue n’a été observée. Cette passe inclut la dernière correction de consommation du jeton de retour.

## Ce qui est contrôlé

- Offre réelle depuis l’accueil, sur mobile et ordinateur : couple natif/cible conservé, puis retour aux thèmes modernes en fermant le compte.
- Abonné déjà confirmé par le statut serveur fictif : reprise du parcours sans nouveau paiement ni connexion.
- Anciennes entrées de connexion et d’offre sans coordonnées de retour : prise en compte des paramètres explicites, malgré des préférences locales contradictoires.
- Application nue : reprise du couple et du niveau enregistrés, reprise des anciennes coordonnées de langue à L1, ou retour à l’accueil lorsqu’aucun couple n’est connu.
- Anciens liens `start=1` incomplets : nouveau parcours dans le bon couple à L1 ; `level=2` explicite conserve L2.
- Retour de paiement simulé : `en-es L2` est prioritaire sur une préférence `fr-it L1`, puis son jeton est supprimé. Après enregistrement d’un autre couple, une nouvelle visite nue reprend bien `it-ko L3`, sans rejouer l’ancien retour. Les statuts gratuits et payés sont tous deux exercés.
- Retour navigateur puis nouveau clic sur Démarrer, avec restauration de page ou reconstruction de l’accueil.
- Paramètres invalides ou ambigus, option explicite `classic=1` et conteneur natif : absence de redirection vers un couple inventé.

Le journal des tentatives audio et celui des anciennes fiches visibles persistent entre documents. Les parcours web normaux ne doivent exposer aucune ancienne fiche pendant leur transition. Le statut gratuit est vérifié malgré une valeur `ox_paid=1` fictive en cache.

## Captures de la dernière passe

| État | Capture |
| --- | --- |
| Offre anglaise, avant fermeture, 390 × 700 | [Offre](captures/premium-en-es-before-close-390.png) |
| Thèmes modernes après fermeture, 390 × 700 | [Retour mobile](captures/modern-en-es-after-close-390.png) |
| Thèmes modernes après fermeture, 1366 × 700 | [Retour ordinateur](captures/modern-en-es-after-close-1366.png) |
| Reprise en anglais de l’espagnol à L2, 390 × 700 | [Reprise L2](captures/modern-en-es-bare-resume-L2-390.png) |

## Exécution et limites

```sh
NODE_PATH=/tmp/melunga-review-tools/node_modules node --test melunga_deploy/tests/start-return-routing.browser.cjs
```

Le [résumé JSON](qa-summary.json) expose les comptes et limites. Le [rapport complet](verification-browser.json) conserve les 24 cas, les appels fictifs et les empreintes des sources.

Les pages, scripts, styles, images et données proviennent de cette copie du dépôt. Toutes les réponses réseau sont des fixtures explicites. Les requêtes non GET sont interdites : aucun POST de connexion ou paiement n’a été envoyé. Le catalogue vocal retourne une erreur contrôlée ; aucune voix n’est chargée ou jouée. Comme dans les suites de compte existantes, `mobile-runtime.js` est un module web vide et la feuille Google Fonts est remplacée par une feuille vide pour utiliser les polices système hors réseau.

Cette vérification utilise Chromium local, avec des dimensions et interactions tactiles simulées pour le mobile. Elle ne constitue pas un essai sur téléphone physique, Safari ou application installée. Le rapport porte sur les chemins de démarrage et de retour ; les contrôles de conservation du catalogue, des prix et des fonctions d’authentification sont documentés séparément avec l’implémentation.
