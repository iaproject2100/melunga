# Visuels des neuf nouvelles affectations de thèmes

Les neuf affectations par couple sont figées dans [visuels.json](visuels.json). Elles reprennent huit cadrages de photographies synthétiques locales déjà présentes dans la base `13f42b5814f2b230d76d2d0ef267dcf406c523c2`. Le thème Téléphone partage volontairement son cadrage entre fr-en et fr-ja, selon la politique historique de partage d’un même thème entre langues. Aucun fichier image n’est créé ou retouché.

Le registre de décisions retenu est l’édition `342600641c8a621019d0c05d75a481843640e9ed`, qui remplace entièrement l’ancienne proposition anglaise. Les sept empreintes de registres sources figurent dans le document JSON. Les titres restent ceux de cette source ; aucune nouvelle traduction n’est inventée pour les trois thèmes zh-fr.

| Couple et nouveau thème | Cadrage retenu | Atlas, colonne et ligne à partir de zéro |
|---|---|---|
| fr-en · L3-sante — Santé : demander une aide médicale | Un cœur rouge et un stéthoscope donnent un repère médical direct. | [vocabulary-scenes-L5-L6.webp](../../../melunga_deploy/assets/vocabulary-scenes-L5-L6.webp), 3, 2 ; grille 4 × 4 |
| fr-en · L5-cuisine-recette — Cuisine : suivre une recette | Deux personnes préparent un petit-déjeuner ; les aliments et les gestes situent une préparation de cuisine. | [theme-scenes-L3.webp](../../../melunga_deploy/assets/theme-scenes-L3.webp), 0, 2 ; grille 3 × 4 |
| fr-en · L9-telephone — Téléphone : accueillir, filtrer et faire patienter | Une personne utilise son téléphone portable ; la scène situe le contact à distance. | [situation-scenes.webp](../../../melunga_deploy/assets/situation-scenes.webp), 1, 0 ; grille 3 × 4 |
| fr-ja · L2-prevenir — Prévenir et mettre en garde | Deux personnes échangent sous la pluie avec un parapluie retourné ; ce contexte exposé au mauvais temps accompagne les mises en garde. | [situation-pistes-1.webp](../../../melunga_deploy/assets/situation-pistes-1.webp), 1, 3 ; grille 3 × 4 |
| fr-ja · L9-telephone — Téléphone : accueillir, filtrer et faire patienter | Le même thème de téléphone partage le même cadrage entre les deux couples, conformément à la politique visuelle historique. | [situation-scenes.webp](../../../melunga_deploy/assets/situation-scenes.webp), 1, 0 ; grille 3 × 4 |
| fr-ko · L5-situation-conduite — Conduite : se débrouiller sur la route | Une maquette montre des chaussées et des transports ; elle évoque le contexte routier des trois cartes sans illustrer précisément chaque action. | [theme-scenes-L9.webp](../../../melunga_deploy/assets/theme-scenes-L9.webp), 1, 1 ; grille 3 × 4 |
| zh-fr · L6-souhaits — Souhaiter, encourager et réconforter | Deux proches se font face et s’écoutent avec attention ; cet échange calme accompagne le réconfort et les encouragements. | [theme-scenes-L10.webp](../../../melunga_deploy/assets/theme-scenes-L10.webp), 1, 0 ; grille 3 × 4 |
| zh-fr · L6-relations — Parler de sa vie sentimentale | Un couple regarde ensemble son portrait ; le cadrage évoque directement la vie sentimentale. | [theme-scenes-L4.webp](../../../melunga_deploy/assets/theme-scenes-L4.webp), 0, 0 ; grille 3 × 4 |
| zh-fr · L8-marqueurs-oraux — Nuancer un récit avec les marqueurs de l’oral | Deux personnes échangent dehors dans une conversation informelle ; le cadrage situe l’usage des marqueurs de l’oral. | [theme-scenes-L3.webp](../../../melunga_deploy/assets/theme-scenes-L3.webp), 2, 2 ; grille 3 × 4 |

Les atlas ont été examinés visuellement et les coordonnées ont été comparées aux entrées du [registre visuel historique](../visuels.json). Les neuf affectations restent dans les limites des grilles. Leurs fichiers existent, leurs empreintes sont vérifiées et aucun cadrage retenu n’est déjà présenté au même niveau dans le même couple avant classement. Les deux thèmes Téléphone ont une photo identique, avec le même identifiant visuel.

Le contexte routier coréen est représenté par les chaussées et transports d’une maquette de quartier. La photo ne représente pas précisément faire le plein, klaxonner ou accélérer. De même, les autres photos donnent un contexte et ne garantissent pas le sens de chaque carte.

Les neuf tailles de thèmes suivent le registre approuvé : 3, 3 et 3 cartes pour fr-en ; 2 et 10 pour fr-ja ; 3 pour fr-ko ; 4, 7 et 3 pour zh-fr. Les petits thèmes gardent leur exception bornée, y compris les deux cartes japonaises de mise en garde ; aucun contenu n’est ajouté pour remplir une grille. Les thèmes L9-saluer renommés conservent leur photo existante.

Empreinte SHA-256 de `visuels.json` : `e2703326a63f8cf7a2b8d49454b3f6e55722a382809672abcaa0063826655f6a`.

Cette affectation reste une proposition de la PR de classement des sept couples. Aucune fusion dans main ni publication n’est effectuée ici.
