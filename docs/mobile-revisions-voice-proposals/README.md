# Révisions et Voix à portée de pouce

Quatre propositions pour ajouter les raccourcis Révisions et Voix à la barre mobile approuvée. **Maquettes uniquement : aucun fichier de l’application n’est modifié.**

- [Ouvrir la comparaison](index.html)
- [Les quatre propositions côte à côte](comparaison-mobile.png)
- [1 — Accès directs](captures/revisions-voix-1.png), conseillée : Révisions, Voix, Couleur et Menu restent dans la capsule ; niveau et langue rejoignent l’en-tête du cours.
- [2 — Tout visible](captures/revisions-voix-2.png) : les six réglages sont disposés sur deux rangées centrales.
- [3 — Réglages en volet](captures/revisions-voix-3.png) : Révisions et Voix sont visibles ; un volet dépliable donne accès aux quatre réglages d’origine. La capture montre ce volet ouvert.
- [4 — Deux groupes](captures/revisions-voix-4.png) : une flèche alterne entre Révisions/Voix/niveau et langue/couleur/menu.
- [Second groupe de la proposition 4](captures/revisions-voix-4-groupe2.png).

À revoir reste à gauche et Suivant à droite dans les quatre propositions. Les réglages d’origine conservent leurs icônes sans libellés visibles. La toque représente Révisions ; le casque représente Voix.

## Source et périmètre

Base de l’application : `46b34fcba27c94e82140953577804d0a4aaf6528`. Les maquettes emploient le même véritable cours français–espagnol : thème 08, « Décrire et comparer », phrase « Es muy ligero. », phonétique « és mouy li-RÉ-ro », traduction « c'est très léger », ambiance `legacy-plum`.

Le logo, les textes et leur taille, la carte du cours, l’oreille et le haut-parleur sont conservés. Les boutons À revoir et Suivant, les réglages d’origine et les raccourcis Révisions/Voix réutilisent les commandes existantes de l’application. Pour ces deux nouveaux raccourcis, les nœuds de navigation d’origine et leurs gestionnaires ouvrent les véritables panneaux Révisions et Voix.

La galerie utilise uniquement des ressources locales. Les quatre captures principales mesurent 320 × 620 et ne comportent pas de fausse interface de téléphone. Les liens permettent d’ouvrir chaque PNG directement ou d’en demander le téléchargement ; le comportement de téléchargement dépend du navigateur utilisé.

## Vérification

Les **20 cas navigateur passent** : quatre dispositions dans quatre tailles (320 × 568/620, 390 × 780 et 430 × 780), puis quatre groupes de commandes réelles. Les panneaux Révisions et Voix s’ouvrent directement, les réglages d’origine restent accessibles, le volet et les deux groupes fonctionnent, et les décisions À revoir/Suivant conservent leurs commandes d’origine. Les sources n’ont pas changé pendant les essais. Les dimensions, les champs visibles et les zones tactiles d’au moins 44 × 44 px sont contrôlés dans le [rapport détaillé](verification.json).

Les hauteurs des quatre barres sont 56, 104, 120 et 56 px dans les vues principales. Le volet de la troisième est montré ouvert ; refermé, la barre mesure 56 px. Aucun texte, logo ou contrôle tactile n’est réduit pour faire tenir huit commandes sur une ligne. La galerie passe à 390, 1000 et 1920 px de large.

Aucun essai sur un téléphone physique, Safari iPhone ou application installée n’est revendiqué. Toutes les réponses réseau sont des fixtures locales ; aucun compte réel, paiement ni TTS distant n’est utilisé.

Ces propositions servent au choix de présentation avant toute intégration dans le produit.
