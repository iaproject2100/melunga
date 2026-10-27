# Barre haute : trois propositions ordinateur

La base est la variante 3 validée : grand logo Melunga sans bord noir, navigation principale en haut et réglages secondaires dans Menu. Le niveau, le drapeau et Couleur sont désormais alignés à droite du titre du thème, au-dessus de la progression.

Ouvrir [la comparaison](index.html). Elle tient elle-même à 1366 × 768, sans défilement du document. Les explications sont hors de l’écran élève, dans une note compacte avec des détails repliables.

| Proposition | Disposition | Aperçu 1440 × 900 | Aperçu 1366 × 768 |
| --- | --- | --- | --- |
| **A — recommandée** | À revoir, Écouter et Suivant réunis sous la traduction ; aucune seconde commande en bas. | [A](captures/proposition-a-1440x900.png) | [A portable](captures/proposition-a-1366x768.png) |
| B | Petit rail latéral à droite, à mi-hauteur de la carte : audio, Suivant et À revoir discret. | [B](captures/proposition-b-1440x900.png) | [B portable](captures/proposition-b-1366x768.png) |
| C | Barre de commandes fixe, séparée de la carte, toujours visible. | [C](captures/proposition-c-1440x900.png) | [C portable](captures/proposition-c-1366x768.png) |

**Je recommande A** : écouter puis passer à la suite se fait au même endroit que la lecture. B libère davantage le centre de la carte. C garde des commandes à une position stable sur toutes les cartes.

## Prototype et contenu

Seul ce dossier contient les maquettes. Aucun fichier de l’application, contenu du catalogue, prix, droit ou compte n’est modifié. Le CSS est autonome ; seuls le logo et la photo du thème réutilisent deux images locales existantes par liens relatifs.

Les boutons audio sont silencieux et visuels. « Suivant » parcourt trois cartes espagnoles existantes, puis revient à la première. Il ne marque jamais « Je connais », n’enregistre aucune préférence et ne modifie pas la progression affichée. Les valeurs d’étude, de traduction et de phonétique sont copiées exactement depuis `melunga_deploy/content/niveaux-progressifs/fr-es/L1.json`, thème `saluer` ; les identifiants et valeurs figurent dans [source-cards.json](source-cards.json). Aucune aide phonétique n’a été créée.

Les captures se génèrent sans les contrôles de comparaison avec `?variant=a&capture=1`, `?variant=b&capture=1` ou `?variant=c&capture=1`.

## Vérification

[Rapport Chromium](verification.json) : **12 cas réussis**, soit trois propositions × deux dimensions × deux modes (comparaison normale et capture). Les six captures ci-dessus proviennent de cette passe, avec des sources stables.

Les contrôles confirment :

- aucun défilement du document ou de la carte, même dans la page de comparaison à 1366 × 768 ;
- Écouter et Suivant visibles ensemble, avec une seule commande de chaque type ;
- les trois textes entiers dans la carte, sans chevauchement ni recouvrement par la barre C ;
- logo de 96 pixels, plus grand que les trois pastilles de 52 pixels, placées à droite du titre ;
- repères Thèmes, À revoir et Révisions conservés en haut ; Menu accessible sans déborder ;
- les trois cartes restent strictement identiques à leurs sources après navigation ; aucun stockage ou changement de progression.

La vérification est locale, dans Chromium sur ordinateur. Aucun compte, API, service vocal ou appareil physique n’a été utilisé. Aucun commit, fusion ou déploiement n’est inclus.
