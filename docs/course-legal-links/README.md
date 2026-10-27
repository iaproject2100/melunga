# Accès aux conditions et à la confidentialité dans le parcours

Le menu du parcours retrouve deux liens en bas, après l’entrée du compte : Conditions générales et Confidentialité. Ils ouvrent les documents existants dans un nouvel onglet pour conserver la leçon en cours. Ils ne sont pas ajoutés à la barre de navigation ordinateur.

Les libellés suivent la langue maternelle de l’élève. Les documents français, anglais, espagnols et chinois existants sont utilisés. En italien, japonais et coréen, le libellé indique « (EN) » et le lien ouvre le document anglais, avec `hreflang="en"`. Aucun texte juridique n’est créé ni révisé dans ce changement.

## Vérifications ciblées

Le harnais extérieur au dépôt est `/tmp/melunga-course-legal-links.browser.cjs`. Il réutilise les fixtures du contrôle existant du parcours, sans modifier ses tests. La référence source est `e7f54fff59e4acc4fb91b7988a503ebe8cbff0fc`.

- Quatorze profils : sept langues maternelles, chacun à 1366 × 768 et à 390 × 700.
- Deux liens réels et atteignables dans le menu, ordre après Compte, texte visible et nom accessible corrects, URL du même site vers le document attendu, `hreflang`, nouvel onglet et protection `noopener`.
- Le défilement de la zone du menu permet d’atteindre les liens ; sa fermeture et son titre restent accessibles. Les liens sont absents de la navigation ordinateur.
- Clic réel sur les conditions françaises et sur la confidentialité anglaise depuis l’interface italienne : URL, langue du document et titre principal attendus ; `window.opener` nul. La fermeture du nouvel onglet laisse la même URL et le même état de leçon dans l’onglet d’apprentissage.
- Aucun audio n’est démarré par l’accès aux documents. La carte entière reste visible au retour.
- Les huit pages juridiques sont confrontées octet par octet à la référence Git. Les contenus, services, voix, droits, dictionnaires et CSS protégés restent inchangés. Les empreintes du produit sont comparées avant et après la passe.

```sh
NODE_PATH=/tmp/melunga-review-tools/node_modules node --test /tmp/melunga-course-legal-links.browser.cjs
```

Le contrôle porte uniquement sur la restauration des accès. Il ne constitue pas une relecture du fond juridique ni une modification des prix ou des droits.

## Isolation et limites

Chromium local, avec dimensions et interactions mobiles simulées. Aucun téléphone physique ni Safari n’est testé. Toutes les réponses réseau sont des fixtures locales explicites. Les documents HTML juridiques réels sont servis depuis les fichiers du produit ; leurs pages sont ouvertes par de vrais clics. Aucun compte réel, POST, paiement ou serveur TTS n’est utilisé. Les événements audio restent simulés en mémoire.

## Résultat final du 27 octobre 2026

**2 groupes, 14 profils et 28 liens vérifiés : succès.** Les deux documents sont effectivement ouverts par les clics prévus. Les empreintes du produit restent stables ; aucune erreur JavaScript, erreur de fixture ou requête inattendue n’est observée. Les 129 fichiers protégés, dont les huit documents juridiques, sont identiques à la référence Git.

- [Menu français sur ordinateur, 1366 × 768](captures/menu-fr-1366.png)
- [Menu français sur mobile, 390 × 700](captures/menu-fr-390.png)

Le [résumé](qa-summary.json) contient les limites, les empreintes des huit documents et celle du harnais. Le [rapport complet](verification-browser.json) détaille les quatorze profils et les destinations de chaque lien. Les originaux sont conservés dans `/tmp/melunga-course-legal-links-browser/` et `/tmp/melunga-course-legal-links-browser.json`.

Cette vérification n’inclut aucune publication.
