# Rail complet, langues en colonne et propositions de titre

Le rail publié dans `6f9437b` pouvait laisser « Mon compte » sous le bord d'une fenêtre peu haute. Il resserre maintenant ses marges selon la hauteur disponible. La dernière action occupe une ligne horizontale entière. Les neuf actions, leurs destinations, les libellés et les cibles d'au moins 44 px sont conservés ; le défilement n'est pas masqué pour faire passer le contrôle.

Le sélecteur « Langues » reprend la référence choisie par Kartech : une seule colonne de grandes cartes arrondies, drapeau rectangulaire à gauche, nom en 22 px (20 px sur les très petits écrans), coche à droite et sélection colorée dans l'ambiance courante. Les sept fonds de drapeaux sont repris exactement du catalogue classique ; l'affichage ne dépend plus de la police emoji du système. Le titre chinois est « 语言 ». Le clavier, les couples et leurs données sont conservés.

`propositions-titre.html` présente quatre options dans les trois ambiances : titre coloré, bandeau, numéro en pastille et typographie livre. Cette page indépendante sert au choix de Kartech. Elle ne change pas le titre des fiches et n'écrit aucune progression.

## Contrôles

- Le contrôle du rail mesure le débordement réel avant toute mise au point automatique par le navigateur, dans les écrans de thèmes et de leçon, pour un invité et un abonné simulés, jusqu'à 1280 × 480. Les neuf actions, leurs libellés et les cibles restent entièrement accessibles.
- Le contrôle des langues vérifie la colonne unique, les drapeaux peints en CSS, les sept couples, la coche à droite, les libellés français/chinois, le clavier et les tailles de téléphone 320/390 px.
- La conservation des sources et la vérification indépendante de composition protègent les 78 JSON, 33 654 cartes, prix et droits. Aucun changement dans le catalogue, l'accès, l'authentification, la facturation, les fonctions serveur, le logo ou le calcul de progression.
- Les quatre tests existants reçoivent seulement les empreintes courantes des actifs UI concernés. Les couches de projection historiques restent intactes. Compte et progression ont passé leurs six contrôles chacun avant le dernier ajustement de 5 px des marges du seul rail compact ; le contrôle de logo et la vérification source ont été rejoués sur le CSS final.
- Les propositions de titre tiennent à 320, 390 et 1440 px dans les trois ambiances, sans débordement ni appel API.

`controle-rail-langues.json` porte le statut explicite `partial-scoped-passed` : quatre groupes existants ont été rejoués, soit 36 cas, dont 24 mesures du rail. Ce rapport ne revendique pas une nouvelle exécution des sept groupes de la suite complète. Les contrôles des niveaux, des panneaux partagés et du titre déjà publiés ne sont pas inclus dans cette passe ciblée.

Les captures locales utilisent Chromium et des tailles d'écran simulées. Aucun téléphone physique, compte réel, achat, soumission de formulaire ou audio réel n'est revendiqué. La PR #19 sur les séquences reste hors de cette modification.

Le CSS passe en cache v21 et le JS en v27 dans les deux entrées. Les rapports et captures de cette composition sont conservés dans ce dossier.
