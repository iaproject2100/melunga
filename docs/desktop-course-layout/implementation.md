# Application de la présentation ordinateur choisie

Le site publié utilisait encore la barre latérale : les propositions ordinateur précédentes étaient des documents de comparaison. Cette modification applique la barre haute au véritable `parcours-niveaux.html` à partir de 1101 pixels de largeur.

`course-desktop.js` déplace les commandes existantes et garde leurs identifiants et leurs événements. Le logo mesure 96 pixels ; les pastilles de niveau, langue et couleur sont placées à droite du titre. Thèmes, À revoir et Révisions restent directement visibles ; les autres fonctions sont disponibles dans Menu. Le libellé L1 répété au-dessus de la progression est masqué sur ordinateur.

Dans une fiche, les véritables boutons À revoir, Écouter et Continuer sont réunis sous la traduction. Sur ordinateur, Continuer utilise la fonction existante de passage à la phrase suivante, sans classement « Je connais ». Sur mobile, il conserve la progression par étapes d’origine. Un changement de largeur restaure les commandes dans leurs emplacements initiaux ; les styles mobiles, le Pinyin et les gestes restent ceux de la version publiée.

## Reprise du chargement

L’erreur de chargement signalée n’a pas été reproduite lors des trois chargements publics isolés effectués avant publication : les thèmes anglais → espagnol, leurs photos et leurs données vérifiées ont été reçus correctement. Sa cause particulière reste donc indéterminée.

Le nouvel utilitaire `course-data.js` permet une seconde tentative pour un téléchargement JSON interrompu ou mal formé, une erreur réseau, un délai dépassé ou un statut HTTP transitoire. Il s’applique uniquement aux lectures GET de fichiers `content/*.json`, avec deux tentatives au maximum et un délai de 12 secondes par tentative. Les appels de compte, les mutations et les paiements ne sont pas concernés. Les octets reçus sont préservés pour les validations SHA d’origine ; aucune donnée de secours ni droit supplémentaire n’est introduit. Le bouton Réessayer recharge aussi les scripts lorsqu’un module indispensable manque.

## Vérification

- 8 groupes de navigateur, 26 cas : vrai rendu ordinateur, phrase suivante réelle, trois références mobiles et leurs gestes, aller-retour de largeur, reprise après panne et rejet des données incompatibles. Détails et captures dans le [rapport](README.md).
- 10 tests unitaires de téléchargement, 12 tests de cours natifs et 15 tests d’intégration des lecteurs réussis.
- 12 contrôles des couches sources et validation des ressources d’entrée réussis. Les 78 documents révisés, les illustrations, les fonctions audio et les services de compte et de paiement restent protégés. Les seules différences dans les deux chargeurs de droits et de cours sont leurs délégations GET décrites ci-dessus.

Le navigateur est Chromium local, avec dimensions et gestes mobiles simulés. Aucun appareil physique, Safari, compte réel, paiement ou lecture TTS réelle n’est testé dans cette modification. Le contrôle du site public après publication est une vérification séparée.
