# Compte : ambiance du site et accès depuis le menu

La connexion et la création de compte reprennent l’ambiance choisie sur le site, sur ordinateur et mobile. Le masque bleu nuit opaque est remplacé par un voile léger ; la fenêtre conserve le dégradé et la teinte de cette ambiance, avec des champs suffisamment opaques pour rester lisibles.

« Se connecter / Créer un compte » est accessible dans le menu mobile et par une icône nommée au survol ou au clavier dans le rail ordinateur. L’entrée ouvre l’onglet de connexion ; l’autre onglet conserve le formulaire de création et les offres existantes. Les libellés sont disponibles dans les sept langues du lecteur. L’entrée est masquée lorsque l’accès payant est actif, comme prévu par l’interface actuelle.

La fenêtre isole le clavier et les gestes de la leçon, se ferme par sa croix, Échap ou le voile, puis restitue un point de navigation visible. La fermeture directe utilisée par les intégrations existantes libère également le voile. La confirmation d’un changement d’appareil garde sa propre saisie de code accessible au-dessus de cette fenêtre.

Les prix, règles d’accès, points d’API et charges utiles de paiement sont conservés. Aucun compte ou paiement réel n’a été créé pendant les essais. Les catalogues, familles, phrases et phonétiques sont identiques à la base `5a24a6f`.

## Vérifications

```sh
NODE_PATH=/tmp/melunga-review-tools/node_modules node melunga_deploy/tests/account-ui.test.cjs
NODE_PATH=/tmp/melunga-review-tools/node_modules node melunga_deploy/tests/lesson-mobile-gestures.test.cjs
```

Le chemin `NODE_PATH` dépend de l’installation locale de `playwright-core` ; Chromium peut être sélectionné avec `CHROMIUM_PATH`.

- Compte : 320 × 568, 390 × 844, 1440 × 900 ; ambiances Océan, Fleur de prunier et Nuit néon ; sept langues ; cibles de 44 px ; clavier, focus, gestes tactiles, fermeture et réouverture.
- Connexion et paiement : validation, erreurs et succès simulés, entrées depuis l’accueil, offres mensuelle/annuelle, confirmation de remplacement d’appareil. Toutes les requêtes de test sont interceptées.
- Gestes des leçons : suite existante réussie, dont chinois/japonais/coréen, phrases longues et exemple espagnol.
- Syntaxe : les scripts externes modifiés et les seize scripts intégrés à `app.html` sont vérifiés.

La suite historique `lesson-pickers.test.cjs` réussit sa partie mobile puis échoue sur le bouton `#selLang` du rail ordinateur, retiré lors de la présentation précédente. Le même échec à la ligne 199 est reproduit sur la base `5a24a6f`, sans ces corrections. Ce test historique n’est pas présenté comme réussi ; ses sources restent inchangées.

Les essais automatisés utilisent Chromium et des voix/services simulés. Ils ne constituent pas un essai Safari sur appareil ni la construction d’un APK.

## Rendus contrôlés

- [Mobile rose, connexion](account-320x568-rose-login.png)
- [Mobile océan, connexion](account-390x844-ocean-login.png)
- [Ordinateur néon, connexion](account-1440x900-neon-login.png)
- [Rapport de la suite compte](account-ui-report.json)
