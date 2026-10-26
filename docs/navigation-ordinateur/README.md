# Navigation sur ordinateur et décor de connexion

L’aperçu reprend les quatre demandes de Kartech : langues et niveaux sous forme de cartes arrondies avec drapeau/couleur et coche, neuf rubriques directement accessibles dans un rail sur les grands écrans, et décor du parcours conservé à l’ouverture de la connexion.

À partir de 1024 px, le rail de 180 px montre les neuf actions en deux colonnes. Les niveaux et langues restent les deux commandes principales ; les commandes Couleur et Menu devenues redondantes y sont masquées. Les actions du rail et du menu partagent les mêmes spécifications et les mêmes callbacks. Sous ce seuil, le menu reste replié ; les quatre commandes du téléphone sont conservées. Les sélecteurs gardent leurs selects internes et les événements existants.

L’ambiance est mémorisée dans la session sous `melunga-course-ambience`, avec seulement `ocean`, `aurora` et `dusk` autorisés. Elle est rétablie au retour au parcours et reprise par le formulaire de connexion.

Pour un compte connecté, le volet « Mon compte » reste interne au parcours, comme dans le lot publié. Pour un invité, le formulaire existant reste utilisé : le nouvel habillage ne s’applique qu’à une entrée `login=1` avec `courseReturn` explicite déjà validé par les fonctions classiques, hors natif, parcours classique ou checkout. Le décor et les champs reprennent les trois ambiances ; les branches de l’ancien chrome sont masquées sans cacher les ancêtres du formulaire. Les annulations explicites renvoient au couple/niveau validé. Le masquage persiste pendant les confirmations d’appareil ; il n’observe ni n’intercepte les masquages internes de l’authentification.

Le seul changement dans `app.html` est l’inclusion des deux nouveaux fichiers CSS/JS. Les 32 115 cartes classiques, les 78 JSON, les prix, les modules d’authentification, les fonctions serveur et les règles d’accès restent conservés. Le logo et la capsule fixe colorée publiés dans `a5c721f` sont préservés.

## Vérifications

- Navigation indépendante : 6 groupes, 16 cas, desktop 1366/1440 et mobile 320/390, clavier, neuf actions, sept drapeaux de source, dix niveaux, langue et ambiance après rechargement.
- Connexion depuis le parcours : 5 groupes, 24 cas, trois ambiances en français/chinois, annulations, routes exclues et authentification/remplacement avec requêtes entièrement simulées.
- Composition : six contrôles de compte, six de progression et quatre de logo réussis. Les fonctions de calcul/stockage sont inchangées.
- Onze actifs finis épinglés et sept altérations rejetées ; les deux inclusions classiques sont comparées exactement, et les littéraux de données restent intacts.

Les captures sont des rendus locaux avec tailles de téléphone simulées et comptes/API simulés. Aucun compte réel, achat, déconnexion réelle ou essai sur téléphone physique n’est revendiqué. Les confirmations de retour d’authentification locales utilisent une cible sentinelle dont l’URL exacte est vérifiée.

Ce lot est distinct de la publication de la capsule. Il est préparé pour un aperçu dans une PR vers `main`, sans autorisation de fusion reçue pour cette nouvelle présentation.
