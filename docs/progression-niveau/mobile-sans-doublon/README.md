# Niveau affiché une fois sur mobile et repère Fin neutre

Sur l'écran des thèmes mobile, la pastille principale donne déjà le niveau. La rangée qui répétait « L1 » au-dessus de la progression est donc masquée, espace compris. Le libellé accessible de progression conserve le niveau complet et sa traduction. Le niveau sur ordinateur et le compteur des fiches restent visibles.

Le repère Fin reste neutre avant l'achèvement. À 100 %, son fond propre devient transparent : le remplissage continu de la barre couvre toute la zone, y compris sous Fin. Le texte reste lisible dans les trois ambiances, filtre de l'ambiance claire compris. Le pourcentage fixe, sa couleur et les calculs de progression sont conservés.

Le produit ne change que trois règles CSS et les deux liens de cache CSS v23. JS, sources de cartes, prix, droits, logo, titres et navigation restent identiques à `36bb757`.

Deux groupes existants ont été exécutés : conservation des sources et capsule localisée, soit 126 cas dont 108 états combinant français/chinois, 320/390/1440 px, trois ambiances et 0/25/50/75/99/100 %. L'exécution ne revendique pas les quatre autres groupes de la suite. Les sept fonctions de calcul/persistance ont été comparées exactement. Aucun compte, achat ou audio réel n'a été utilisé ; les écrans sont simulés avec Chromium.

Le contrôle du contraste utilise le fond effectivement rendu sous le texte, et non l'ancienne hypothèse d'un badge Fin opaque et coloré. Le minimum mesuré à 100 % est de 4,67:1. Les empreintes courantes sont actualisées dans les tests existants, sans modification des couches historiques.
