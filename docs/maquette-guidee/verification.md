# Vérification de la maquette

## Données

Génération reproductible et `python3 tools/maquette-guidee/build_data.py --check` réussies. Une seconde extraction indépendante du catalogue confirme les sept ensembles d'indices L1 : **2 134 cartes, 7 293 champs identiques, aucun manque ni doublon d'indice**. Les doublons de texte présents dans la source restent distincts.

Chaque carte appartient à un thème et à une seule séquence de cinq expressions au maximum. Chaque rappel porte sur une expression présentée auparavant dans cette séquence. Les modèles incomplets restent visibles, sans synthèse vocale ni rappel masqué, et n'ont qu'une étape de présentation.

## Interface

Contrôles sous Chromium local sur mobile émulé et ordinateur :

- Sept couples parcourus, totaux et thèmes accessibles ; navigation thème → séquence → phrase → retour.
- Texte étudié, aide phonétique et traduction conformes au JSON ; aide fermée au démarrage.
- Pendant le rappel, le sens reste visible ; l'oreille révèle le modèle explicitement. La lecture complémentaire est facultative.
- Fin de séquence, reprise, changement de langue et trois ambiances fonctionnels.
- Largeurs 320, 390 et 1 440 pixels contrôlées ; les phrases longues défilent dans la zone de contenu sans masquer les commandes.
- Aucune erreur JavaScript, requête d'écriture ou écriture dans le stockage du navigateur pendant les parcours vérifiés.

La synthèse vocale a été contrôlée avec une doublure qui vérifie le texte envoyé : le champ étudié, jamais la phonétique. La qualité des voix réelles n'a pas été évaluée. Ces essais ne sont pas un essai sur téléphone physique, ni une validation pédagogique des regroupements.

## Ajustement après retour sur l'aperçu

Sur ordinateur, les 77 thèmes démarrent désormais en un clic et les groupes internes s'enchaînent sans écran de sélection. Le premier thème de chaque couple a été parcouru intégralement : 345 étapes, compteur et progression sur le thème entier, écran de fin unique puis retour aux thèmes. Sur mobile, le choix des petites séquences reste présent. Les numéros 01–11 rendent l'ordre éditorial conseillé visible sur les cartes et dans le titre de leçon. Le logo dans la barre latérale est conservé.

Le JSON des 2 134 cartes et le catalogue ont les mêmes empreintes qu'avant cet ajustement. Aucun prix, accès, texte ou aide phonétique n'est modifié. La numérotation ne constitue pas une nouvelle validation pédagogique de l'ordre des cartes.

## Périmètre produit

La branche part du retour arrière `edf7406`. Seuls la page autonome de maquette, ses fichiers, son générateur et sa documentation sont ajoutés. Les fichiers préexistants, dont `app.html`, sont inchangés. La branche `main` reste sur la version restaurée ; aucune fusion de cette maquette n'est demandée.
