Claude — la reprise porte maintenant sur le cours complet, pas seulement sur les sept scènes café.

Branche : `review/parcours-complet-progressif`, base produit `50a2891`. Dossier : `docs/curriculum-v2/`. L’atelier `parcours-preview.html` permet de jouer les sept couples aux dix niveaux ; l’application réelle conserve son accès L1 gratuit et son accès complet existant.

Le joueur contient les 841 unités et leurs 3 364 variantes, plus neuf microleçons communes par couple et quatorze premières expositions logement/travail : 918 leçons, 8 307 étapes. Les 11 488 champs des variantes sont inchangés ; les sources du plan précédent sont figées. Les phonétiques ne sont ni harmonisées ni assemblées.

**Ce qui est nouveau et doit recevoir ta propre relecture** : les 77 anciennes unités L1 sortent du tronc débutant (48 vers L2, 28 vers L3, une vers L4), avec raisons par construction et par langue. Les 308 variantes restent gratuites dans une bibliothèque distincte. Le L1 obligatoire a désormais le même ordre dans les sept couples : saluer, prénom, incompréhension, répétition, commande, variation café/thé, offre/refus, prix, scène café entière. Ce nouveau lot ne doit pas hériter automatiquement de ta validation de l’ancien reclassement.

Je te demande de contrôler particulièrement :

1. La difficulté réellement rencontrée dans le L1 chinois, puis l’entrée dans L2 : juge les phrases vues et les variations demandées, pas uniquement le titre du niveau ou la longueur moyenne.
2. Les 77 placements de `placements-entree-v2.json`, leurs blocs de variantes et la conservation des constructions entières. Aucun invariant nouveau ne doit être supposé lorsque la famille mélange plusieurs opérations.
3. Les quatorze phrases logement/travail en L2 : elles préparent une occurrence entière commune, sans préparer à elles seules les quatre variantes de leur famille. Les trente anciens liens devenus futurs sont retirés des prérequis effectifs et restent consignés comme réserves.
4. Les accès historiques : 2 218 droits d’indices de cartes, strictement par couple, et les 308 variantes L1. Le cas espagnol `DECKS.es[1829]`, anciennement offert par le guidé mais filtré par le catalogue courant, a été rétabli explicitement.
5. L’interface réelle : mêmes étapes sur mobile et ordinateur, reçus visibles pendant le rappel, oreille réversible, sortie sans notation ni modification des révisions classiques.

La recherche concurrentielle est cette fois réalisée : six sources officielles, avec liens et limites dans `reprise-globale/concurrents.md`. La banque thématique examine douze situations modernes dans les sept couples ; elle distingue les 23 échanges disponibles, huit voisins, 46 ensembles partiels et sept manques. Les 362 énoncés sont sourcés ; cette banque n’est pas encore un ensemble de nouvelles scènes activées.

Limites conservées explicitement : 341 réserves du plan source, corpus des 210 dialogues non entièrement préparé/câblé, déficit italien L8, registre ja/ko et règles phonétiques chinoises. Les 32 115 cartes classiques restent une réserve distincte ; je ne les annonce pas individuellement reclassées. Les contrôles techniques ne mesurent pas l’acquisition.

Les contrôles du build utilisent Node sans dépendance Python dans Netlify. Les tests locaux et le parcours sur l’aperçu hébergé sont consignés séparément. Rien à fusionner dans `main` ni à mettre en production à ce stade.
