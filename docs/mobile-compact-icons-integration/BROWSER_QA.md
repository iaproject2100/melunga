# Vérification de la capsule compacte sans libellés visibles

**Huit groupes et 38 cas réussissent**, avec les sources stables et aucune erreur JavaScript, erreur de fixture ou requête inattendue. Les captures utilisent le produit réel, sans adaptateur de maquette. La référence comparée est `6a22ff28c08f90edef5e178a23da8b37a9305f07`.

Le [rapport complet](browser-report.json) conserve les mesures, les champs sources, les contrôles et les empreintes des fichiers chargés.

## Contrôles exécutés

| Groupe | Résultat |
| --- | --- |
| Sources conservées | 165 fichiers du produit, des données et des services restent identiques à la référence. Seuls `course-desktop.css` et ses deux entrées HTML sont exclus de cette égalité attendue. Le JavaScript responsive, les contrôleurs de contenu et d’audio sont donc comparés intégralement. |
| Thèmes compacts | À 320 × 680, 390 × 780 et 430 × 780, la barre passe de 72 à 58 px. Les quatre légendes ne sont plus visibles ; les quatre boutons conservent leurs noms accessibles. Logo, textes, tailles de police des cartes et libellés accessibles correspondent à la référence. La capture principale utilise l’ambiance Océan et la vraie liste en une colonne. |
| Fiches et actions | FR–ES L1 aux trois largeurs, FR–ZH L1 avec Pinyin et vraie carte longue FR–ES L8 : champs sources entiers, bonne photo 48 × 36 px et cadrage d’origine. Les six commandes restent présentes en un seul exemplaire pendant la leçon. À revoir et Suivant restent visibles, avec des cibles d’au moins 48 px de haut. La transition de Suivant correspond exactement à la référence : une étape, sans sauter la phrase ni classer la carte comme connue. |
| Langues et accessibilité | Les sept langues de l’interface conservent les légendes sources traduites, masquées seulement à l’affichage. Chaque bouton d’icône garde son nom accessible d’origine et se retrouve par ce nom. Le libellé mobile de Suivant reste visible et traduit. |
| Commandes d’origine | Les vrais boutons Niveau, Langue et Menu ouvrent leurs dialogues dans l’écran. Couleur change réellement d’ambiance. Le vrai bouton À revoir enregistre la carte courante dans la liste de révision. |
| Ordinateur et restauration | À 1366 × 768 et 1920 × 1080, dimensions, textes et styles correspondent exactement à la référence. Les passages par 760, 761 et 1101 px restituent les enfants et légendes d’origine des boutons, retirent le dock hors mobile et conservent l’étape sans créer de doublon. |
| Contraste | Les 17 ambiances passent les mesures sur les pixels réellement composés, au repos et au survol de Niveau, À revoir et Suivant. Minimum observé : **4,6083:1 pour les textes** et **4,6083:1 pour les SVG testés** ; le badge L1 atteint au minimum **4,7876:1**. Les seuils restent 4,5:1 pour le texte et 3:1 pour les icônes. Les quatre légendes invisibles sont exclues des régions échantillonnées ; les deux textes d’action, la valeur de niveau et les trois SVG visibles sont mesurés. |
| Réserves d’espace | Une marge de sécurité simulée de 24 px et une vraie barre externe fixe de 60 px ne recouvrent ni le dock ni la carte et ne doublent pas l’espace réservé. Chaque cible visible mesure au moins 44 px dans les deux dimensions. Aucun libellé ou bouton ne chevauche son voisin. |

Les couleurs sont mesurées sur les PNG de Chromium en masquant temporairement uniquement les glyphes et SVG, sans changer leur géométrie. Chaque mesure prend le pire pixel de fond sur la région complète du texte ou de l’icône. Les dégradés, surfaces transparentes, arrière-plans et flous sont ainsi pris en compte. Aucun seuil n’est arrondi pour accepter une valeur insuffisante.

## Captures conservées

- [Thèmes Océan, 320 × 680](captures/compact-icons-themes-ocean.png)
- [Leçon, 390 × 780](captures/compact-icons-integrated.png)
- [Pinyin](captures/compact-icons-pinyin.png)
- [Carte longue réelle, niveau 8](captures/compact-icons-long.png)
- [Retour sur mobile après redimensionnements](captures/compact-icons-after-resize.png)
- [Ambiance claire](captures/compact-icons-dusk.png)
- [Ambiance sombre](captures/compact-icons-legacy-premium.png)
- [Réserve pour une barre externe](captures/compact-icons-toolbar-reserved.png)

Les [empreintes des captures](capture-sha256.json) couvrent les huit PNG de cette passe.

## Méthode et limites

Harnais : `/tmp/compact-icons-integration-qa.cjs`, avec Playwright Core et Chromium local. Toutes les réponses réseau sont des fixtures locales explicites. Aucun compte réel, paiement, POST ou serveur TTS distant n’est utilisé. Les marges de sécurité et la barre externe sont des fixtures de présentation ; le cours et les commandes chargent les vrais fichiers du dépôt.

Cette passe émule des dimensions mobiles et le toucher. Elle ne constitue pas un essai sur téléphone physique, Safari ou un réglage Android/Samsung réel, ni une preuve de publication sur melunga.com. Le comportement du JavaScript et les états qui ne sont pas rejoués ici restent protégés par leur égalité intégrale avec la référence.
