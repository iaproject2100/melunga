# Écoute dans la barre mobile — maquette 4 intégrée

**12 groupes / 54 cas réussis**, sans erreur JavaScript, erreur de fixture, requête inattendue ni contrôle manquant. Les empreintes des entrées sont restées identiques pendant la passe. Le [rapport JSON](browser-report.json) conserve les mesures détaillées et les empreintes du produit et du harnais.

## Correspondance avec le choix

La référence produit est `46b34fcba27c94e82140953577804d0a4aaf6528`. Le rapport de la maquette 4 au commit `f5d1569` est identifié par son SHA-256 dans `chosenPreview`. Le navigateur charge les véritables fichiers intégrés : aucun CSS ou JavaScript de proposition n’est injecté.

Les vues **320 × 568**, **320 × 620**, **390 × 780** et **430 × 780** correspondent exactement à ce rapport : contexte d’en-tête, carte, barre, commandes, champs source et rectangles de l’encre. La [capture principale](captures/speaker-four-approved-pink.png) montre le véritable thème 08 « Décrire et comparer », phrase `catalogue:es:302`, ambiance rose `legacy-plum`, sans habillage de téléphone ajouté.

Le niveau et le drapeau partagent une capsule translucide d’en-tête de **100 × 48 px**, contenant deux cibles de **44 × 44 px**. La barre de leçon mesure **106 px** : la commande d’écoute d’origine occupe toute sa largeur, sur **44 px** de haut ; un espace de **6 px** la sépare de la rangée basse de **56 px**. Cette rangée contient « À revoir » à gauche, Révisions, Voix, Couleur et Menu au centre, puis « Suivant » à droite. À 320 px de large, les deux actions mesurent **54 × 56 px**, les réglages centraux **48 × 48 px** et leurs supports d’icônes **32 px**.

## Parcours et commandes

- Trois tailles de grille de thèmes, les quatre vues approuvées, une phrase longue L8 et le chinois avec pinyin : contenu source entier, photo et recadrage exacts, aucun chevauchement ni débordement de page. La bascule pinyin reste visible, active et à l’intérieur de la carte.
- Sept langues natives en **320 × 620** : noms accessibles conservés, réglages sans légendes visibles, action suivante localisée, libellé d’écoute identique à l’ARIA du bouton source. Les panneaux directs Révisions et Voix fonctionnent aussi après une sélection de niveau qui reconstruit le menu dans chaque langue.
- Véritables dialogues de niveau, langue et menu, cycle de couleur, enregistrement réel d’une phrase dans « À revoir » et progression suivante identique à la référence.
- Changement réel du couple `fr-es` vers `fr-zh`, puis appel du véritable `MelungaCourseAccess.refresh()` avec une réponse d’accès locale simulée `paid:false` : les anciens boutons de rail deviennent déconnectés, les nouveaux boutons d’origine prennent leur place dans la barre et leurs deux panneaux s’ouvrent directement. Aucun raccourci dupliqué.
- Chargement retenu par une fixture explicite, thèmes, dernier thème atteignable et vraie fin de leçon obtenue par les commandes d’origine. Les actions et l’écoute restent cachées lorsqu’elles ne sont pas disponibles ; la légende canonique remplace « Suivant » à la fin.
- Après cette vraie fin, **42 fixtures de légendes finales traduites** contrôlent sept langues, trois textes et deux largeurs, 280 et 320 px. L’encre reste à l’intérieur des boutons ; la hauteur finale varie de 56 à 81,75 px pour préserver les libellés entiers. Ces substitutions de texte ne simulent pas l’avancement d’une séquence.

## Écoute et états masqués

Pour les sept couples `zh-fr`, `fr-en`, `fr-es`, `fr-zh`, `fr-it`, `fr-ja` et `fr-ko`, le panneau Voix règle la vitesse à **0,85**. Un clic sur le bouton d’écoute déplacé déclenche une seule lecture par le gestionnaire d’origine. La fonction serveur demandée est `/.netlify/functions/tts`, avec le texte source exact, `rate=1` et une vitesse média de 0,85. L’oreille d’origine produit la même requête complète.

Les voix constatées dans les URL sont : français **Aoede**, anglais et espagnol **Kore**, chinois **Kore**, italien **Charon**, japonais et coréen **Kore**, toutes en **Chirp 3 HD** avec leurs codes de langue attendus. Aucun appel de secours `speechSynthesis` n’est observé.

Un véritable rappel masqué est atteint par les étapes du cours. La commande large prend le libellé « Révéler et écouter… », révèle réellement la phonétique et lance une seule lecture. Un nouveau rappel reste masqué pendant un passage bureau puis un retour mobile. Les niveaux actuels ne contiennent aucune étape avec tableau `choices` : l’état d’attente de choix est donc contrôlé par des drapeaux de présentation explicitement simulés. Les champs cachés, le bouton d’écoute caché et désactivé, sa nouvelle légende cachée et l’action suivante désactivée restent respectés.

## Restauration et espace réservé

Les vues bureau **1366 × 768** et **1920 × 1080** correspondent à la référence. Les passages **760/761/1101/390 px** conservent l’étape et les nœuds de commandes d’origine. Au-dessus du seuil mobile, les emplacements, classes et enfants du bouton d’écoute, des outils du modèle et du rail sont restaurés exactement ; les ajouts mobiles disparaissent. Un clic d’écoute après ces passages déclenche toujours un seul gestionnaire.

Une réserve basse de **24 px** et une barre externe explicite de **60 px** déplacent correctement la barre et réservent la place dans la page, sans masquer la carte.

## Contraste

Les pixels de fond réellement composités des captures sont mesurés sur les **17 ambiances**, au repos puis au survol de L1, Menu, des deux actions, de l’écoute et des deux raccourcis directs. Les seuils sont **4,5:1 pour les textes** et **3:1 pour les SVG**, sans arrondir un échec pour l’accepter.

| Élément | Minimum observé |
| --- | ---: |
| L1 | 4,7876:1 |
| Écoute, libellé | 6,7770:1 |
| Écoute, SVG | 6,7724:1 |
| Menu, Révisions et Voix, SVG | 6,0454:1 |
| À revoir, texte et SVG | 6,9531:1 |
| Suivant, texte et SVG | 4,9594:1 |

## Sources et limites

**164 fichiers protégés** restent identiques à la référence. Les seules exceptions produit sont `course-desktop.css`, `course-desktop.js`, `parcours-niveaux.html` et `maquette-guidee.html`. Le moteur de cours, les modules audio, les catalogues, les données et les services protégés restent conservés octet pour octet.

Exécution locale sous Chromium avec dimensions mobiles et émulation tactile. Réponses réseau et médias sont simulés explicitement : les contrôles audio vérifient le routage et les paramètres, sans appel TTS distant ni écoute réelle. Aucun compte réel ou paiement, aucun essai sur appareil Android/iPhone physique, Safari ou application installée n’est revendiqué. Ce rapport ne prouve pas la publication en ligne.

Les **14 captures** sont référencées dans le rapport, avec leurs empreintes dans [capture-sha256.json](capture-sha256.json). Harnais : `/tmp/mobile-speaker-four-integration-qa.cjs`.
