# Version mobile 4 — grande touche d’écoute

L’utilisateur demande la mise en ligne de la proposition 4 : une large touche d’écoute translucide au-dessus de la barre. À revoir reste à gauche, Suivant à droite ; Révisions, Voix, Couleur et Menu restent directement accessibles au centre. Niveau et langue sont réunis dans une capsule translucide dans l’en-tête, avec deux commandes distinctes.

La barre de leçon mesure 106 px, dont 44 px pour la touche d’écoute. Les dimensions et la disposition correspondent exactement à la proposition choisie en 320 × 568/620, 390 × 780 et 430 × 780. Les cibles tactiles font au moins 44 × 44 px. Les textes des actions et de l’écoute peuvent se répartir sur plusieurs lignes si leur traduction le nécessite.

Le bouton d’écoute est le bouton d’origine : son audio, ses états masqués ou désactivés et ses libellés sont conservés, notamment « Révéler et écouter » pendant le rappel. Le bouton Pinyin reste dans la carte. Les raccourcis Révisions/Voix réutilisent les commandes d’origine et sont renouvelés après les reconstructions du menu. Les déplacements et les libellés ajoutés sont retirés lors du retour au bureau ; les nœuds et leurs gestionnaires sont restaurés.

## Voir les résultats

- [Version 4 intégrée, ambiance rose et carte 08](captures/speaker-four-approved-pink.png)
- [Vérification navigateur](BROWSER_QA.md)
- [Rapport détaillé](browser-report.json)
- [Conservation des sources et tests](source-verification.json)
- [Maquette séparée de la version 3 translucide](../mobile-phone-translucent-proposal/telephone-translucide.png)
- [Commandes de la version 3 vues de près](../mobile-phone-translucent-proposal/boutons-translucides.png)

La version 3 reste une proposition de comparaison. Ses styles ne sont pas chargés par l’application publiée.

## Validation

Les **12 groupes et 54 cas navigateur** passent. Ils couvrent la correspondance avec la proposition retenue, les sept langues natives et les sept couples audio, les 17 ambiances en état normal et au survol, les vrais panneaux, le rappel masqué et sa révélation, la fin de leçon, les textes longs et le Pinyin, les réserves du bas de l’écran et la restauration au bureau. Les changements de niveau, de couple et d’accès renouvellent correctement les raccourcis. Un clic d’écoute conserve un seul gestionnaire audio et la vitesse choisie. Les états de choix non présents dans les données sont testés par des fixtures de présentation explicitement identifiées.

Les **12 tests de couches**, les **15 tests d’intégration** et les validations des ressources d’entrée passent. Les seuls fichiers produit modifiés sont l’adaptateur de présentation, son CSS et les deux entrées HTML. Les 20 autres empreintes de la couche restent identiques. Le moteur du cours, l’audio, les données, les accès, les prix, les services et les voix sont conservés. Les assertions de protection ne changent pas ; les quatre empreintes concernées et le patch exact sont actualisés. Le cache CSS passe en version 10 et celui de l’adaptateur JavaScript en version 6.

Les vérifications utilisent Chromium local, une émulation des dimensions et du toucher, et des réponses réseau et audio simulées. Aucun téléphone physique, Safari, compte réel, paiement, TTS distant ou lecture audio réelle n’est revendiqué. Ces résultats ne constituent pas une vérification de la publication sur melunga.com.
