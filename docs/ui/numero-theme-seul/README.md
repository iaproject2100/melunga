# Numéro seul dans le bandeau des fiches

Le bandeau des fiches affiche seulement le numéro du thème, par exemple `01`, sans répéter son titre à chaque carte. Il prend maintenant la largeur de ce numéro. Le style du bandeau, les icônes, le compteur de fiche, le haut-parleur et Pinyin sont conservés.

Le titre complet reste dans la liste des thèmes et le menu de révision. Il est aussi conservé dans l'infobulle et le nom accessible du bandeau, y compris les mentions Révision/Réemploi. Le bandeau a un rôle de titre pour que ce nom soit disponible aux lecteurs d'écran. Les contextes sans numéro conservent leur libellé plutôt qu'un faux numéro.

Le produit ne change que ce rendu de `renderStep`, le flex du bandeau, le rôle du titre et les caches CSS26/JS29 dans les deux entrées. Les fonctions de numérotation communes, les contenus, les droits, les prix, les voix et les calculs de progression restent identiques à `72a94ca`.

Deux groupes existants sont exécutés : conservation des sources et présentation des fiches. 62 cas conformes, numéro conforme à la liste et stable sur deux cartes, titres complets conservés dans la liste et le menu, contexte accessible français/chinois, premières et longues fiches dans les trois ambiances, sans défilement ni chevauchement. Le haut-parleur et Pinyin restent visibles ; les autres groupes, dont les essais audio fonctionnels, ne sont pas présentés comme rejoués. Les captures utilisent Chromium et des tailles d'écran simulées, sans compte ni audio réels.
