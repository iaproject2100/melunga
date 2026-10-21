# Pastilles de leçon — publication validée le 21 octobre 2026

Kartech a validé les maquettes puis demandé explicitement leur publication sur les versions web mobile et ordinateur.

Sur téléphone, la rangée supérieure contient **Niveau → drapeau → Voix → compteur**, avec quatre colonnes égales. **Couleur → Thèmes → Révisions** apparaissent en haut du cadre de la leçon. Le bouton ☰ conserve **Accueil** et **Avis** ; la déconnexion reste soumise à sa visibilité existante. Sur ordinateur, le rail garde sa disposition et utilise les pastilles rondes, le drapeau, le niveau courant, le dossier à onglets, le chapeau et une icône de voix distincte de la lecture audio. Le bouton ☰ reste masqué sur ordinateur.

Les véritables contrôles sont déplacés aux changements de format et après les sélections, sans dupliquer leurs identifiants. Les gestionnaires d’origine restent responsables des langues, voix, thèmes, révisions, couleurs et droits d’accès. La rangée d’outils est visuellement dans la carte mais portée par un élément frère : les menus fixes ne sont pas piégés par le flou de la carte.

Les couleurs suivent l’ambiance choisie. La phonétique et l’oreille sont conservées. Sur mobile, les phrases longues défilent à l’intérieur de la carte ; les gestes sur les pastilles et les listes ne notent pas de phrase et ne font pas avancer la leçon.

## Vérification

- Syntaxe JavaScript des fichiers modifiés et contrôle des espaces Git.
- Catalogues `DECKS` strictement identiques à la version précédente.
- Rendus Chromium à 320 × 568, 390 × 844, 768 × 1024, 1024 × 768 et 1440 × 900, ambiances claire, rose et océan ; relecture visuelle indépendante.
- Vingt-cinq ouvertures de menus, dans le viewport et sans ancêtre qui piège leur positionnement fixe.
- Sélections réelles de langue, de voix et de couleur ; positions conservées après sélection et après aller-retour entre téléphone et ordinateur.
- Niveau L10 atteignable au clavier ; défilement tactile réel des niveaux ; sélection de L2 gratuite conservant le paywall, sans droit Premium accordé.
- Accueil ouvre `index.html` ; Avis ouvre le formulaire existant, sans envoi d’avis lors de la vérification.
- Gestes des outils sans changement de phrase ni de notation ; navigation tactile normale conservée ; longues phrases défilant sans changer de carte.
- Fermeture du menu par Échap et retour du focus au bouton ☰.
- Géométrie des contenus pédagogiques sur ordinateur et dans une simulation Capacitor comparée à `745d4c0`, sans changement ; aucune erreur JavaScript relevée.

Les captures et rapports détaillés de cette session sont dans `/tmp/melunga-pastilles-publication/`. Aucun nouvel APK ni AAB n’est produit par cette publication web ; la simulation Capacitor ne remplace pas un essai Android réel.
