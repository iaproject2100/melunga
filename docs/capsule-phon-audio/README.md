# Capsule phonétique pendant la lecture

Livraison 1, base `17ca814`. Le signal `onPlaying` existant pilote le bouton et la capsule, dans le parcours et la carte classique. Fond vert à 22 %, liseré fin, lettres opaques, fondu de 150 ms. Pas de minuteur de durée ; les événements audio / synthèse gèrent la fin, la pause, la reprise, l’erreur et l’arrêt. Changer de carte arrête et éteint la capsule. Le calque ne participe pas à la mise en page.

## Vérifications

- 31 tests audio unitaires passent, dont pause/reprise, interruption, durée sans coupure artificielle et événements périmés.
- 72 combinaisons parcours : 12 langues × 3 ambiances × mobile 390 px / ordinateur 1366 px ; 288 lectures haut-parleur/oreille × normale/lente. Fond à 22 %, texte opaque et géométrie identique vérifiés.
- Carte classique : les 14 ambiances immersives, les 11 banques classiques disponibles et les deux largeurs sont parcourues avec les quatre déclencheurs. L’allemand est couvert dans le parcours.
- Fondu, repli vers une voix du navigateur, fin et changement de carte : vérifiés ; captures active/repos jointes.
- Les 5 contrôles de source passent : banques, progression, fonctions de compte et droits protégés par leurs empreintes. Aucune modification des thèmes ou des données de cartes.

Tests Chromium avec réseau et médias simulés localement, émulation tactile. Aucun son réel ni fournisseur appelé, aucun téléphone physique testé ; déploiement public non vérifié depuis cet environnement. Les appels synthèse conservent le lecteur et les choix de voix existants.

`app.html` : 21 845 324 → 21 846 165 octets, soit **+841 octets**. Modifications locales par Git, sans éditeur web GitHub. Les styles et lecteurs externes restent séparés. La proposition syllabique fera une livraison autonome sans raccord à l’application.

![Capsule active sur mobile](capsule-active-390.png)

![Capsule active sur ordinateur](capsule-active-1366.png)
