# Vérification du dock mobile B intégré

**Neuf groupes et 37 cas réussis**, avec les sources stables pendant la passe. Les captures viennent du vrai parcours local, sans adaptateur de maquette. La référence de comparaison est `fd1598eff3264d6bfaf753c76e798686e3d75a11`.

Le [rapport complet](browser-report.json) conserve les dimensions, les champs sources, les langues, les contrôles de progression et les empreintes des fichiers chargés.

## Contrôles exécutés

| Groupe | Résultat |
| --- | --- |
| Sources conservées | 164 fichiers du produit, des données et des services sont comparés intégralement à la référence. Seuls l’adaptateur responsive, sa feuille de style et les deux entrées HTML sont exclus de cette égalité attendue. |
| Leçons mobiles | FR–ES L1 à 320 × 700, 390 × 780 et 430 × 780 ; FR–ZH avec Pinyin à 390 × 700 ; vraie carte longue FR–ES L8 à 390 × 700. Tous les champs source restent entiers et visibles, avec la bonne photo 48 × 36 px et son cadrage d’origine. |
| Six commandes | Les quatre réglages et les deux vrais boutons d’action sont présents en un seul exemplaire. Les cibles mesurent au moins 44 px dans les deux dimensions ; la largeur minimale observée est 64,5 px. Aucun bouton ou libellé ne chevauche son voisin. |
| Traductions | Les légendes du dock et le libellé visible de Suivant sont vérifiés dans les sept langues de l’interface. Le texte source `#mgContinueText` reste présent ; la légende alternative est visible uniquement dans la leçon mobile. Le nom accessible français du bouton est bien Suivant. |
| Progression et audio | Suivant garde exactement la transition mobile de la référence : une étape supplémentaire, sans sauter la phrase ni classer la carte comme connue. Les vrais boutons de niveau, langue et menu ouvrent leurs dialogues. Le réglage vocal à 0,85 est conservé ; oreille et haut-parleur invoquent le même lecteur et la même phrase. Le changement d’ambiance fonctionne. |
| Chargement, thèmes et fin | Une vraie requête de données retenue par la fixture maintient le dock inerte pendant le chargement, sans actions de leçon visibles. Les derniers thèmes restent accessibles au défilement au-dessus du dock. Vingt-cinq clics sur le vrai bouton À revoir enregistrent 25 cartes et atteignent la vraie fin du thème. Les légendes Rejouer et Thèmes restent affichées ; elles ne sont pas remplacées par Suivant. Rejouer revient à la première étape. |
| Ordinateur et restauration | Le rendu, les textes, les styles et les dimensions à 1366 × 768 et 1920 × 1080 correspondent exactement à la référence. Les passages répétés par 760, 761 et 1101 px retirent et recréent le dock sans doublon, rétablissent les enfants et légendes d’origine des boutons et conservent l’étape courante. |
| Rappel et états masqués | Un vrai rappel atteint par les commandes garde la phonétique masquée pendant les changements de largeur. Les attributs `hidden` et le bouton désactivé d’une fixture d’attente restent conservés par la présentation. |
| Contraste et place disponible | Les 17 ambiances passent le contrôle sur les pixels réellement composés derrière les textes et SVG, au repos puis au survol de Niveau, À revoir et Suivant. Minimum observé : **4,6083:1 pour les textes** et **4,6083:1 pour les SVG testés**, au-dessus des seuils de 4,5:1 et 3:1. La valeur du badge L1 atteint au minimum **4,7876:1**. Une réserve de sécurité simulée de 24 px et une vraie barre externe fixe de 60 px ne recouvrent pas le dock ou la carte et ne doublent pas l’espace réservé. La confirmation À revoir reste au-dessus du dock. |

Les couleurs sont mesurées sur des PNG de Chromium, en masquant momentanément uniquement les glyphes et les SVG sans modifier leur géométrie. Chaque rapport de contraste conserve le pire pixel de fond sous la région complète du texte ou de l’icône : la transparence, les dégradés, les fonds parents et le flou sont donc pris en compte. Le seuil n’est pas arrondi pour accepter une valeur insuffisante.

La première passe a détecté le contraste légèrement insuffisant du badge L1, à 4,4918:1. Le contrôle complémentaire du survol a également détecté un éclaircissement hérité du bouton Suivant qui abaissait son contraste jusqu’à 4,1978:1 dans l’ambiance Zen. Après correction ciblée du fond du badge et neutralisation de cet éclaircissement dans le dock, la passe finale complète a été relancée sur les fichiers figés, avec les états de survol inclus. Le libellé des couleurs utilise les traductions existantes, notamment 背景颜色, 背景色 et 배경 색상.

## Captures conservées

- [Dock B intégré, 390 × 780](captures/mobile-dock-b-integrated.png)
- [Pinyin](captures/mobile-dock-b-pinyin.png)
- [Carte longue réelle, niveau 8](captures/mobile-dock-b-long.png)
- [Fin de thème réelle](captures/mobile-dock-b-done.png)
- [Retour sur mobile après plusieurs changements de largeur](captures/mobile-dock-b-after-resize.png)
- [Rappel avec phonétique masquée](captures/mobile-dock-b-masked.png)
- [Ambiance claire](captures/mobile-dock-b-dusk.png)
- [Ambiance sombre](captures/mobile-dock-b-legacy-premium.png)
- [Réserve pour une barre externe de prévisualisation](captures/mobile-dock-b-toolbar-reserved.png)

Les [empreintes des captures](capture-sha256.json) couvrent les neuf PNG de cette passe finale.

## Méthode et limites

Exécution avec Playwright Core et Chromium local à partir du harnais `/tmp/mobile-dock-b-integration-qa.cjs`. Les services de compte, prix et voix sont des fixtures locales explicites ; le lecteur audio est simulé en mémoire. Aucune erreur JavaScript, requête inattendue ou erreur de fixture n’est observée. Aucun compte réel, paiement, POST ou serveur TTS distant n’est utilisé.

La réserve de 24 px, la barre externe, la retenue de chargement et les attributs d’attente sont des fixtures de présentation explicites. La fin du thème et le rappel utilisent les véritables commandes et contenus du parcours. Cette passe émule des tailles d’écran et le toucher dans Chromium ; elle ne constitue pas un test sur appareil physique, Safari, application installée, bouton silencieux ou une preuve de publication sur melunga.com.
