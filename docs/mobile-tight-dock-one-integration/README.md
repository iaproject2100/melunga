# Capsule resserrée 1 avec icônes agrandies

L’utilisateur valide la première maquette et signale des vignettes trop petites. La version intégrée rapproche les deux rangées du dock et agrandit les quatre icônes du bas, en conservant la capsule translucide et les libellés masqués.

La barre de leçon passe de 120 à 104 px. Les supports d’icônes passent de 24 à 32 px, et leur espace visible avant les actions descend de 24 à 8 px. Les réglages conservent des cibles de 44 px minimum et À revoir / Suivant gardent leurs grands boutons de 48 px. Sur les thèmes, la barre mesure 54 px au lieu de 58 px.

La marge héritée du footer est retirée par un sélecteur ciblé. Le drapeau est redimensionné sur son véritable span à fond SVG CSS, avec le ratio 3:2 conservé. Le dock existant mesure automatiquement sa hauteur et adapte l’espace réservé. Le logo, le numéro et la photo du thème restent ceux du parcours.

## Voir le résultat

- [Ambiance rose et carte 08 de la capture utilisateur](captures/tight-dock-one-approved-pink.png)
- [Rapport navigateur](BROWSER_QA.md)
- [Mesures et contrôles détaillés](browser-report.json)

## Validation

Huit groupes et 38 cas passent sur le produit réel, sans adaptateur de maquette, comparé au commit `f01a73138aad17be0cb6e712752afe6cb664dfaa`. Les contrôles couvrent les tailles mobiles, la carte source de l’utilisateur, les champs longs et le Pinyin, les sept langues, les vraies commandes, la restauration ordinateur et les réserves d’espace. Le contraste normal et au survol est vérifié sur les 17 ambiances ; son minimum est de 4,6083:1.

Les contrôles sources comprennent 12 tests de couches, 15 tests d’intégration et la validation des ressources d’entrée. Seuls le CSS responsive et ses deux entrées HTML changent parmi les fichiers produit. Les 21 autres empreintes de la couche restent identiques ; tout le JavaScript, le contenu, les droits, les prix et les services sont conservés. Le cache CSS passe en version 8, le JavaScript reste en version 5.

La capture rose utilise la vraie première carte `catalogue:es:302` du thème `decrire`, atteinte par les commandes du parcours. Les réponses de compte et d’audio sont des fixtures locales, sans compte réel, paiement, POST ou TTS distant. Chromium émule les dimensions et le toucher ; aucun essai sur appareil physique ou Safari n’est revendiqué, et ces contrôles ne prouvent pas une publication sur melunga.com.
