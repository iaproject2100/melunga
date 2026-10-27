# Vérification navigateur — version 3 et phonétique PC

Résultat : **réussi**, 7 groupes et 41 cas, après la correction de l'espacement des rangées à 18 px. Les fichiers de l'application sont restés identiques entre le début et la fin de la passe. Le [rapport complet](browser-report.json) contient les mesures, les sources des cartes et leurs empreintes.

Les captures proviennent de l'application réelle dans Chromium avec les documents et images du dépôt. Le statut d'accès, le catalogue de voix et le lecteur audio sont des fixtures locales. Toutes les requêtes sont interceptées ; aucun compte réel, paiement, envoi de données ni appel TTS distant n'est utilisé.

## Aperçus à présenter

- [Leçon PC, 1366 × 768](captures/preview-lesson-fr-es-L1-1366.png) : phonétique contrastée et oreille d'origine visibles, avant toute lecture audio.
- [Thèmes PC, 1366 × 768](captures/preview-themes-fr-es-L1-1366.png).
- [Leçon PC, 1920 × 1080](captures/preview-lesson-fr-es-L1-1920.png).
- [Thèmes PC, 1920 × 1080](captures/preview-themes-fr-es-L1-1920.png).
- [Pinyin actif](captures/lesson-fr-zh-pinyin-1366.png).
- [Carte longue réelle FR–ES, niveau 8](captures/lesson-fr-es-L8-1366.png).
- [Ambiance sombre](captures/contrast-legacy-premium.png).

## Contrôles exécutés

| Contrôle | Résultat |
| --- | --- |
| Plateau PC | Largeur maximale 920 px ; logo existant 96 × 96 px |
| Grille de thèmes | Quatre tuiles en 2 × 2, rangées séparées de 18 px ; titres, quantités et photos sans rognage à 1101 × 700, 1366 × 768, 1440 × 900 et 1920 × 1080 |
| Pagination | Les 26 thèmes FR–ES restent accessibles dans leur ordre ; dernière page de deux thèmes ; retour de leçon conservé ; changement de niveau ou de paire réinitialisé |
| Langues | Contrôles de pagination et légende phonétique vérifiés dans les sept langues maternelles de `document.lang` |
| Documents juridiques | Liens vers les pages existantes FR, EN, ES et ZH ; repli EN explicitement indiqué pour IT, JA et KO |
| Leçons PC | FR–ES niveau 1, FR–ZH niveau 1 et vraie carte longue FR–ES niveau 8 à 1366 × 768 et 1920 × 1080 ; aucun chevauchement ni texte coupé ; marge basse mesurée de 56 px |
| Audio | L'oreille SVG existante et le haut-parleur invoquent le même lecteur avec la même phrase source ; Continuer change réellement de phrase, annule la lecture et ne classe aucune carte comme connue |
| Phonétique | Texte et Pinyin comparés aux champs existants des cartes ; bascule toujours nommée Pinyin lorsqu'elle est active |
| Contraste | Les 17 ambiances couvrent leurs schémas clair et sombre ; texte phonétique 12,30:1 et légende 10,03:1, seuil requis 4,5:1 |
| Mobile | Comparaison réelle avec le commit `f18316ab3ab372b48e8a0a57444f4d44ccbf3437` à 390 × 700 pour FR–ES niveau 1, FR–ZH avec Pinyin et carte longue FR–ES niveau 8 : géométrie, texte, visibilité, polices, ordre des thèmes/photos et progression Continuer identiques |
| Redimensionnement | Retour du DOM, des attributs hidden et de l'ordre d'origine sur téléphone ; suppression du pager, du pied juridique et de la légende PC ; une seule instance de chaque commande ; leçon courante conservée |
| Modèle masqué | Rappel réel atteint par les commandes mobiles puis redimensionné sur PC : phonétique et légende restent masquées |

L'état d'attente de choix est couvert par la conservation des vrais attributs `hidden` et `disabled` lors d'un rafraîchissement de présentation. Aucun pas d'attente de choix n'a été trouvé dans les parcours progressifs sélectionnés : ce contrôle ne prétend pas jouer un tel pas de contenu.

Exécution locale : Playwright Core 1.56.1 et `/usr/bin/chromium`. Harness autonome préparé dans `/tmp/desktop-three-qa.cjs` à partir des fixtures de `melunga_deploy/tests/desktop-course-layout.browser.cjs`, sans modifier ce fichier de test ni les dépendances du dépôt. Les aperçus propres sont générés par `/tmp/desktop-three-clean-preview.cjs`. Les [empreintes des captures](capture-sha256.json) couvrent les dix fichiers conservés. Les autres captures de la passe complète restent dans `/tmp/melunga-desktop-three-browser/`.

Cette passe émule les fenêtres PC et téléphone dans Chromium ; elle ne revendique pas de test sur appareil physique, Safari ou de validation acoustique d'un audio distant.
