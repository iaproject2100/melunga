# Petite photo près du numéro sur mobile

Cette intégration applique la maquette 1 choisie par l’utilisateur : la photo existante du thème, en 48 × 36 px, apparaît à gauche du numéro dans la carte mobile. Un petit espace les sépare. Aucun titre supplémentaire n’est affiché ; les commandes d’étape et d’aide restent à droite.

La photo est clonée depuis la véritable tuile sélectionnée, via son `data-theme-id`. Le fichier d’atlas, ses quatre paramètres de découpe et le ratio 4:3 restent identiques. Le suivi du nœud source permet de changer de thème, de niveau ou de langue sans garder une ancienne découpe.

Le numéro est son nœud d’origine : son texte, son titre accessible et son libellé ne sont pas remplacés. L’image ajoutée est décorative. Si son chargement échoue, le pictogramme de la tuile reste disponible ; si aucun visuel de thème n’existe, le numéro conserve sa présentation d’origine, sans emplacement photographique vide.

La présentation s’applique jusqu’à 1100 px, au même seuil que le retour au parcours sans l’en-tête ordinateur. En passant au-dessus de ce seuil, la photo ajoutée et la classe de présentation sont retirées. Le CSS ordinateur précédent est conservé à l’identique. La progression mobile par étapes, les contenus, les transcriptions, les voix, les droits et les prix ne sont pas modifiés.

## Validation

Les [vérifications navigateur](BROWSER_QA.md) utilisent le vrai parcours local, avec les données et photos du dépôt : cinq groupes et douze cas réussissent. La référence de comparaison est le commit `49b525cf78fd46b063edc0d332740ad8becf9701` ; aucun adaptateur de maquette n’est injecté.

- [Aperçu mobile intégré, 390 × 780 px](captures/mobile-option-1-integrated.png)
- [Rapport détaillé](browser-report.json)

Les contrôles sources comprennent 12 tests de couches, 15 tests d’intégration et la validation des ressources d’entrée. Les quatre fichiers produit modifiés sont `course-desktop.js`, `course-desktop.css` et les deux pages HTML qui les chargent. Les autres vingt empreintes de la couche produit restent identiques. Les contrôleurs de contenu et d’audio ne changent pas. Le CSS de présentation est chargé en version 5 et l’adaptateur en version 4 pour actualiser les caches.

Cette validation utilise Chromium local avec tailles d’écran simulées et réponses de compte et d’audio locales. Aucun compte réel, paiement ou serveur TTS distant n’est sollicité. Elle ne constitue pas un test sur appareil physique ou Safari, ni une preuve de publication sur melunga.com.
