# Visuels des trois nouveaux thèmes anglais

Les trois affectations sont consignées dans [visuels.json](visuels.json),
registre distinct du [registre visuel historique](../visuels.json).
Elles utilisent des photographies synthétiques locales déjà présentes dans
la version publiée `fadadd3` ; aucune image n'est générée ou retouchée.
Le registre contient les coordonnées de cadrage et l'empreinte de chaque atlas.

| Nouveau thème | Visuel retenu | Atlas et cadrage, coordonnées à partir de zéro |
|---|---|---|
| L3 — Santé : demander une aide médicale | Cœur rouge et stéthoscope, repères immédiatement médicaux | [vocabulary-scenes-L5-L6.webp](../../../melunga_deploy/assets/vocabulary-scenes-L5-L6.webp), colonne 3, ligne 2, grille 4 × 4 |
| L5 — Cuisine : suivre une recette | Deux personnes préparant un petit-déjeuner | [theme-scenes-L3.webp](../../../melunga_deploy/assets/theme-scenes-L3.webp), colonne 0, ligne 2, grille 3 × 4 |
| L9 — Téléphone : accueillir, filtrer et faire patienter | Une personne utilisant son téléphone portable | [situation-scenes.webp](../../../melunga_deploy/assets/situation-scenes.webp), colonne 1, ligne 0, grille 3 × 4 |

Les trois cadrages ont été vus individuellement. Ils représentent trois sujets
distincts et ne réutilisent pas de photo déjà présentée au même niveau anglais.
Les atlas continuent d'être partagés entre les langues et les niveaux : leurs
pixels et leurs chemins restent identiques. Les images décrivent un contexte ;
elles ne garantissent pas le sens précis de chacune des trois phrases du thème.

La rubrique L9-saluer renommée **« Remercier et s’excuser en registre soutenu »**
conserve sa photo existante de prise de parole formelle :
`assets/theme-scenes-L9.webp`, colonne 0, ligne 0, grille 3 × 4.

## Contrôles effectués

- Les trois fichiers existent, et leurs empreintes correspondent au contenu
  de `fadadd3` ainsi qu'aux empreintes figées du nouveau registre.
- Les cadrages restent dans les limites des grilles acceptées par la page.
- Les trois identifiants visuels sont distincts et nouveaux ; le registre
  historique garde ses **278 entrées** et ses **24 atlas**.
- Les fichiers HTML, CSS et JavaScript de présentation ne sont pas modifiés
  par cette affectation. Les photos sont affichées par le mécanisme existant.
- Aucune requête d'image vers un tiers et aucun nouvel octet d'image ajouté.

L'empreinte du registre nouveau est
`a7aa72f90aa3ebd42823d7632bd1a6e25d5fa72006d585484990d9ad877a47da`.
La validation des fichiers et cadrages réussit ; l'affichage dans le navigateur
sera vérifié avec les contrôles de la PR après génération des cellules.

Les trois thèmes contiennent **trois cartes chacun**, selon le registre accepté.
Leurs photos ne changent pas ce comptage : ces tailles restent à signaler parmi
les exceptions au seuil historique de six concepts, sans ajout de cartes pour
remplir la grille.

Cette livraison reste une proposition d'affectation visuelle dans la PR de
classement anglais. Aucune fusion dans main ni publication n'est effectuée ici.
