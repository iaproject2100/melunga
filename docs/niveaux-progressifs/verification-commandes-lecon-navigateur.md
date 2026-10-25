# Vérification des commandes et de la fiche sans défilement

Exécution : `2026-10-25T15:59:32.482Z` — **9 contrôles sur 9 réussis**.

Chromium local, écrans émulés. Aucun téléphone physique ni site public testé. Les voix sont simulées pour vérifier le texte transmis ; ce rapport ne valide ni le son réel ni les phonétiques.

- **48 mesures de cartes complètes** : trois formats ordinateur (1366 × 768, 1280 × 720, 1280 × 500), deux mobiles (320 × 640, 390 × 740), phrases courtes et longues ZH/IT/JA/KO, aides et lectures activées puis désactivées ; plus le redimensionnement et le bandeau d’aperçu. Aucun scroll de document, contenu, fiche ou modèle ; aucun texte coupé ou chevauchement. Oreille, Pinyin/lecture et actions restent visibles et font au moins 44 px.
- **Polices des cartes courtes conservées** : à 1280 × 500, étude au moins 36 px et phonétique/sens au moins 24 px ; à 320 × 640, étude au moins 28 px, phonétique au moins 20 px et sens au moins 22 px. Les longues utilisent la place disponible et conservent leurs textes entiers.
- **Pinyin** : remplace l’aide adaptée par la lecture source entière, conserve le choix entre cartes et après rechargement. Au rappel, le bouton ne révèle rien ; seule l’oreille affiche le modèle et prononce le texte étudié.
- **Quatre gestes tactiles réels via CDP** : haut = suivant, bas = précédent, gauche = À revoir, droite = Je connais. Le déplacement du panneau est mesuré à mi-geste et en fin de geste, avant le relâchement ; la source ne change pas pendant le déplacement. Annulation et petits gestes remettent la fiche en place. Après une action, animation et nouvelle source entière sont vérifiées.
- **Retour bref non bloquant** : « Elle reviendra » à gauche, « Rangée » à droite ; un nouveau tap sur l’oreille fonctionne alors que le retour est visible, puis celui-ci disparaît. La droite retire le favori ; les cartes connues restent accessibles.
- **Contrôles protégés** : boutons, sélection de texte, multitouch et réponses pas encore choisies ne sont pas classés par erreur ; un tap volontaire reste immédiatement accepté après un geste refusé.
- **Fenêtre et aperçu** : redimensionnement 1366 × 768 vers 1280 × 500 sans rechargement, puis ajout tardif d’un bandeau fixe de 56 px sur 80 % de la largeur. Le footer reste au-dessus, le fit est recalculé, la source et son Pinyin restent identiques.
- **À revoir** : ajout, déduplication, persistance, séparation des couples, liste, reprise depuis les sources réelles malgré des libellés de cache périmés, retrait persistant. Les paroles de l’interlocuteur ne deviennent pas des cartes à produire.

## Mesures de taille

| Élément | Minimum effectivement observé |
|---|---:|
| `#mgPhrase` | 21.84 px |
| `#mgPhon` | 15.64 px |
| `#mgTranslation` | 16.38 px |
| `#mgReading` | 10.00 px |

Les lectures auxiliaires JA/KO peuvent être plus petites sur les écrans étroits (plancher 10 px). Le rapport JSON conserve chaque mesure, y compris ces cas ; aucune réduction de taille n’est présentée comme une suppression ou une coupe de texte.

Les empreintes du HTML, CSS, JavaScript, test, application classique, ancien contenu L1 et 78 JSON sont identiques avant et après le passage. Aucune requête externe, de compte, de paiement ou d’API.

Rapport détaillé : [verification-commandes-lecon-navigateur.json](verification-commandes-lecon-navigateur.json).

Ce passage utilise les deux couches corrigées : le lot 3 ajoute 90 aides entières et cinq lectures/Pinyin après les 774 événements du lot 2. Le raccord et ses limites sont décrits dans [le contrôle du lot 3](verification-raccord-lot3.md). Le JavaScript, le CSS et les HTML de l’interface restent ceux validés avant ces lots.
