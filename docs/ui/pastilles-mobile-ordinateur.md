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

## Ajustement des pastilles et du retour

À la demande de Kartech, les fonds des pastilles de commande et du bouton ☰ sont translucides : l’ambiance apparaît à travers, avec des pictogrammes et textes qui restent opaques. Une surface plus lisible est conservée lorsque l’utilisateur demande moins de transparence dans son système. Aucun flou ni filtre n’est ajouté aux ancêtres des menus.

Le bouton de retour `#backBtn` est masqué sur les versions web ordinateur et mobile. Les gestionnaires de navigation, le menu Accueil/Avis et les contenus sont conservés.

Vérification sur quatre vues (390 × 844 et 320 × 568 sur téléphone ; 1440 × 900 sur ordinateur), en ambiances néon et claire : transparence effective des pastilles, flèche absente, absence de débordement horizontal, menus Langue/Voix/Accueil/Avis accessibles et aucune erreur JavaScript. Relecture visuelle indépendante. Captures et rapport dans `/tmp/melunga-pastilles-translucides/`.

## Palette unique dans le rail ordinateur

À la demande de Kartech, sur ordinateur uniquement, les doublons Langue et Niveau du rail sont masqués et remplacés par la pastille Couleur existante. Cette même pastille quitte le coin supérieur droit, sans duplication. L’ordre visible devient Accueil, Couleur, Thèmes, Révisions, Voix, Avis. La langue et le niveau restent sélectionnables dans la barre au-dessus de la leçon, au clic et au clavier ; le petit chevron du niveau est masqué. Les boutons sources et leurs contrôles d’accès restent présents.

Vérification Chromium à 1440 × 900 en ambiance claire et 1024 × 768 en ambiance néon : palette unique et fonctionnelle, sélection de langue au clavier, accès à L10 au clavier, maintien du paywall pour L2 sans droit payant, menus Thèmes/Révisions/Voix dans le viewport, aller-retour ordinateur/téléphone et aucune erreur JavaScript. À 390 × 844 et 320 × 568, géométrie, couleurs et typographie des commandes et de la leçon comparées à `647fb7c` : identiques. Captures et rapport dans `/tmp/melunga-rail-palette/`.
