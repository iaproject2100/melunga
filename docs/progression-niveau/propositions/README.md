# Propositions visuelles pour le niveau et le pourcentage

Page de comparaison : `melunga_deploy/propositions-progression.html`.

Quatre présentations utilisent le libellé court « L1 » : libellé avec barre fine, ligne unique badge/barre/pourcentage, capsule et anneau autour du bouton du niveau. Les boutons 0 %, 25 %, 50 % et 100 % font varier des exemples, sans lire ni enregistrer la progression d’un élève. Le logo original validé et le CSS courant du site sont réutilisés.

Les propositions visuelles ne modifient pas la page du parcours. Kartech a retenu la capsule ; le placement du pourcentage et de « Fin » reste à préciser. La capsule n’est pas encore intégrée au parcours. Aucun compte, prix, droit ni contenu n’est modifié. La validation du logo est acquise ; ces variantes sont présentées pour choisir l’affichage de la progression.

Vérification locale Chromium : douze combinaisons (320, 390 et 1440 px × quatre pourcentages) sans débordement ni erreur JS. Quatre indicateurs accessibles restent cohérents ; aucun appel API ni stockage de compte. Captures inspectées sur mobile simulé et ordinateur. Aucun essai sur téléphone physique ni navigateur déployé n’est revendiqué.

## Capsule avec repère « Fin »

`melunga_deploy/proposition-capsule.html` montre deux variantes : pourcentage fixe à gauche, ou pastille mobile vers « Fin ». Le libellé du niveau reste « L1 ». Le pourcentage est illustratif, piloté par les boutons 0/25/50/100 ; « Fin » est un repère sans action. La présentation effective du parcours reste celle de `802a19e` pendant le choix.

Douze combinaisons de largeur et pourcentage ont été vérifiées localement : 320, 390 et 1200 px, aux quatre valeurs. Aucun chevauchement entre le chiffre et « Fin », aucune erreur JS ni requête API. La pastille réserve la largeur de « 100 % » et reste bornée aux deux extrémités.

La variante 2 (pastille mobile) est retenue. `proposition-capsule.html` présente désormais cette variante seule avec le dégradé turquoise → vert → doré. Le parcours réel l’intègre également ; les rapports de composition courants sont dans `../capsule-coloree/`. Les images des variantes antérieures restent des archives de comparaison.

Kartech préfère finalement la variante 1 : pourcentage fixe à gauche, avec les couleurs de la capsule. Le parcours et la démonstration sont actualisés ; les contrôles courants sont dans `../capsule-fixe-coloree/`. Les captures précédentes de pastille mobile sont historiques.
