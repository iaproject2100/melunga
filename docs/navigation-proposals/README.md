# Trois présentations du menu ordinateur

Ces maquettes sont des documents de comparaison. Aucun fichier de l’application, contenu, réglage, tarif ou droit n’est modifié. Aucun script de l’application ni appel serveur n’est exécuté.

Le fichier [maquettes-ordinateur.html](maquettes-ordinateur.html) embarque les styles et les deux images pour comparer les trois versions sans dépendance au projet. Son rendu et les trois boutons sont vérifiés avec Chromium local sans requête externe ([rapport](standalone-verification.json)). [index.html](index.html) conserve les références du projet pour les développeurs. Utiliser les trois boutons placés en dehors de l’écran élève. Le paramètre `capture=1` masque ces commandes de comparaison et leur commentaire.

| Proposition | Disposition | Intérêt | Compromis |
| --- | --- | --- | --- |
| [1 · Une colonne](index.html?variant=1&capture=1) | Les onze commandes suivent le même alignement, avec leur pastille et leur libellé. | Tous les repères restent visibles et réguliers. | Les réglages occupent autant de place que les actions d’apprentissage. |
| [2 · Deux groupes](index.html?variant=2&capture=1) | « Apprendre » réunit les actions principales ; « Réglages » utilise un traitement plus discret. | Les actions utiles à la leçon se repèrent vite et toutes les rubriques restent accessibles. | Une petite séparation de groupes remplace la liste totalement uniforme. |
| [3 · En haut](index.html?variant=3&capture=1) | Une barre supérieure conserve les actions principales et un bouton Menu pour les autres commandes. | La carte occupe un espace central dégagé et le logo garde une place forte. | Les réglages demandent l’ouverture de Menu. |

Je recommande la **proposition 2** : elle conserve les repères visibles sur ordinateur, donne la priorité à l’apprentissage et réduit le poids visuel des réglages. La proposition 1 convient si l’objectif prioritaire est un alignement strict. La proposition 3 privilégie l’espace de lecture.

Les trois versions utilisent la même leçon, le même titre et la même progression. Les différences portent sur la disposition et la hiérarchie du menu. Le pastel est le thème `dusk` existant, chargé depuis la vraie feuille de styles ; ce dossier ne restaure ni ne modifie les palettes du produit.

Le logo utilise le PNG Melunga existant avec son masque actuel : `circle(43% at 49.3% 50.7%)`. Sa boîte mesure 96 pixels sur les captures ordinateur, soit un disque visible d’environ 82,6 pixels, contre 44 à 48 pixels pour les commandes principales. La version mobile utilise une boîte de 80 pixels. L’image n’est ni redessinée ni retouchée.

La photo de contexte provient de `../../melunga_deploy/assets/theme-scenes.webp`. La phrase affichée est issue de la carte existante `conversation:L1-fr-es.json:L1-fr-es-02:v0` : « Me llamo María. », aide « mé YA-mo ma-RI-a », sens « Je m’appelle Marie. ».

## Captures et contrôles

- [Proposition 1 — ordinateur](captures/proposition-1-ordinateur.png)
- [Proposition 2 — ordinateur](captures/proposition-2-ordinateur.png)
- [Proposition 3 — ordinateur](captures/proposition-3-ordinateur.png)

Les trois captures sont réalisées avec Chromium local à **1440 × 900**, sans barre de comparaison dans l’image. Les contrôles vérifient l’absence de débordement du document et des menus, la présence des onze commandes des variantes 1 et 2, la taille et le masque du logo, ainsi que l’espace occupé par la fiche et les boutons. La sélection des variantes et l’ouverture du menu de la proposition 3 sont vérifiées.

Le [rapport](verification.json) conserve les géométries et les empreintes des sources utilisées. Aucun téléphone physique, Safari, compte réel ou audio n’a été testé. Les styles mobiles sont présents, mais la validation de cette livraison porte sur les trois présentations ordinateur demandées.

Ces documents ne changent pas la navigation du produit. Le choix d’une disposition reste à confirmer par Kartech.
