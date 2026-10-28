# Rétablissement des bulles animées sur l’accueil mobile

Suppression des trois règles de présentation figée provenant de la maquette : elles désactivaient l’animation et remplaçaient deux bulles par des positions fixes. Les onze bulles reprennent leurs dimensions, délais, trajectoires et animation d’origine.

Les contrôles Chromium sur 320 × 568 et 390 × 740 confirment que les onze animations tournent et que les positions changent avec le temps. Le sélecteur de langue reste cliquable à travers le décor ; la préférence système de réduction des animations reste respectée.

Seul le style de l’accueil dans `index.html` change. Aucun réglage de voix, accès, paiement, progression ou contenu n’est modifié. Les contrôles source conservent leurs assertions et inventaires ; seul le pin d’index est actualisé. Aucun essai sur appareil physique ou Safari n’est revendiqué.
