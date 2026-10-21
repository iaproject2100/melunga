# Navigation des leçons par icônes

Présentation validée par Kartech le 21 octobre 2026. Les quatre fichiers applicatifs proviennent exactement de l’aperçu testé au commit `37c6a7370885db78bcbb99840efbdde545ca90c4`.

Sur ordinateur, le menu est un rail d’icônes teinté par l’ambiance. Sur mobile, le même ordre d’icônes apparaît en colonne à l’ouverture du menu ; le défilement reste interne et la croix de fermeture reste accessible. Les noms sont disponibles au survol, au clavier et aux lecteurs d’écran dans les sept langues du lecteur.

`app.html` charge `lesson-chrome.css`, puis `lesson-controls.css`, après les styles de leçon existants. `lesson-controls.js` s’exécute après les scripts desktop et de sélection langue/niveau. Les actions existantes sont conservées. Les gestes du rail sont isolés de la navigation et de la notation des cartes.

Contrôles réussis sur les formats ordinateur et mobile : menus, clavier, noms traduits, contraste, petits écrans, compteurs longs, défilement tactile et absence de notation involontaire. Les catalogues et les règles d’accès ne sont pas modifiés.

Le prochain assemblage Capacitor doit inclure les trois nouveaux assets et `app.html`. Cette publication web ne construit ni ne met à jour un APK installé ; les contrôles natifs précédents utilisent une simulation Capacitor.
