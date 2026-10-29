# Dock mobile B intégré

L’utilisateur a choisi la variante B : une barre translucide en deux rangées, avec Niveau, Langue, Couleur et Menu en haut, puis les grands boutons À revoir et Suivant en bas. La barre s’applique jusqu’à 760 px de large. La photo du thème près du numéro, le logo, la phonétique et son oreille, ainsi que le haut-parleur sont conservés.

Le dock réutilise les véritables boutons et déplace le footer d’origine en entier. Les écouteurs, identifiants, états masqués et désactivés restent donc ceux du parcours. Suivant avance toujours d’une étape sur mobile ; il ne saute pas de phrase et ne classe aucune carte comme connue. À revoir enregistre toujours la carte courante. Les libellés particuliers de fin, comme Rejouer ou Thèmes, restent ceux du contrôleur.

Le texte source Continuer n’est pas remplacé : un libellé mobile traduit est affiché pendant la leçon. Les nouveaux libellés courts sont disponibles dans les sept langues. En quittant la taille mobile, les nœuds, enfants, emplacements et textes originaux sont restitués avant la présentation ordinateur. Le dock est inerte pendant le chargement ; il respecte les états du footer sur les thèmes et à la fin du parcours.

Sa hauteur est mesurée, avec la marge de sécurité système et les barres externes éventuelles. L’espace est réservé dans la page ; la barre ne couvre pas la leçon. Les notifications À revoir apparaissent au-dessus du dock. Un verre clair ou sombre adapté aux ambiances conserve le contraste ; un voile noir de 4 % assombrit seulement le fond du badge de niveau dans le dock pour rendre son texte blanc suffisamment contrasté. Les effets d’éclaircissement au survol sont neutralisés dans le dock pour préserver ce contraste, y compris après un appui tactile.

## Vérification

Les [contrôles navigateur](BROWSER_QA.md) utilisent le produit réel, sans adaptateur de maquette, comparé au commit `fd1598eff3264d6bfaf753c76e798686e3d75a11`. Neuf groupes et 37 cas passent : petits écrans, langues, progression et fins réelles, commandes, changements de taille, ambiances et espaces occupés. Le [rapport complet](browser-report.json) et les captures conservent les mesures. Le contraste minimal mesuré sur les pixels réellement composés est de 4,6083:1 pour les textes ; le badge corrigé atteint 4,7876:1. Les états normal et survolé sont tous deux vérifiés sur les 17 ambiances.

- [Dock B intégré, 390 × 780 px](captures/mobile-dock-b-integrated.png)
- [Carte avec Pinyin](captures/mobile-dock-b-pinyin.png)
- [Ambiance sombre](captures/mobile-dock-b-legacy-premium.png)
- [Barre externe et marge de sécurité réservées](captures/mobile-dock-b-toolbar-reserved.png)

Les contrôles des sources comprennent 12 tests de couches, 15 tests d’intégration et la validation des ressources d’entrée. Quatre fichiers produit changent : l’adaptateur responsive, son CSS et les deux HTML qui les chargent. Les vingt autres empreintes produit restent identiques, ainsi que le CSS ordinateur existant, le contenu, les transcriptions, les voix, les droits et les prix. Les versions de cache deviennent CSS 6 et JavaScript 5.

Chromium local avec dimensions mobiles simulées et réponses de compte et d’audio locales. Aucun compte réel, paiement ou TTS distant n’est utilisé. Ce contrôle ne constitue pas un test sur appareil physique ou Safari, ni une preuve de publication sur melunga.com.
