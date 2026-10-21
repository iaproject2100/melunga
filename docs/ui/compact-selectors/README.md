# Contrôle local des sélecteurs de leçons

Résultat final : PASS après correction de l’ancrage et du focus du tiroir mobile.

- Formats web : 320×568, 390×844, 1440×900 ; sélecteur ouvert redimensionné 1440→320→1024→1440.
- Popup : largeur min(320 px, viewport−32 px), hauteur limitée, marges de 16 px, ancrage près du contrôle visible. Leçon conservée dans le DOM et partiellement exposée.
- Fond opaque teinté : 80 % de --bg + 20 % de --card ; sélection à 14 % d’accent ; voile à alpha 0,14.
- Ambiances réelles parcourues avec cycleAmb : claire, sombre, rose, plus Océan par défaut. Contrastes minimaux : 12,06 ; 13,72 ; 11,24 ; 10,41.
- Fonctionnel : langues, L1–L10 défilants, Entrée/Espace/flèches/Fin/Échap, retour du focus, défilement tactile vertical et geste horizontal sans notation, clic extérieur sans notation, niveau Premium et paywall gratuit préservés.
- Tiroir mobile fermé avant ouverture ; popup ancré près de l’en-tête ; focus rendu à un contrôle visible.
- Contrôle ciblé supplémentaire du focus après resize : 4 ouvertures fraîches, toutes réussies. L’échec intermittent observé avant la dernière correction ne s’est pas reproduit.
- Simulation Capacitor : contrôles natifs d’origine, contrainte pointer-events du parent, niveaux défilants, Échap et focus. Ce contrôle n’utilise pas une vraie WebView Android ni les assets complets de l’APK ; l’exposition géométrique de la carte est contrôlée sur le web uniquement.
- Aucune erreur JavaScript. Aucune API réelle, aucun achat ni APK modifié.

Données de contraste : picker-report.json.

Captures finales :
- mobile-langues.png et mobile-niveaux.png : 320×568.
- mobile-390-langues.png et mobile-390-niveaux.png : depuis le tiroir, après correction.
- mobile-390-clair-language.png / mobile-390-clair-level.png.
- mobile-390-sombre-language.png / mobile-390-sombre-level.png.
- mobile-390-rose-language.png / mobile-390-rose-level.png.
- ordinateur-langues.png et ordinateur-niveaux.png : 1440×900, phrases visibles à côté du menu.
- ordinateur-langues-entete.png : ouverture depuis la langue centrée.

Les fichiers inspect-* et trigger-audit.* sont des diagnostics antérieurs à la correction d’ancrage, pas les captures finales.

Correctif publié sur main : `25a7cad6e1729bb392f9ac96a73068569721986e`. Captures issues de la page réelle servie localement, avec les mêmes fichiers que le correctif publié.
