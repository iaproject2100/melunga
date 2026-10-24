# Français pour apprenants sinophones — première passe L1–L10

Proposition à relire avec Claude. **Aucun changement de catalogue, de phonétique, de prix ou de droits ; aucune publication.**

Le catalogue `DECKS.fr` contient **4 500 cartes**. Les dix niveaux ont été inventoriés. Cette passe motive **178 réaffectations éditoriales explicites** ; elle ne certifie pas individuellement les 4322 placements restés inchangés.

## Une progression par tâches, avec tout le stock conservé

Les fonctions deviennent progressivement plus ouvertes : première rencontre, précision d’une demande, aller-retour, quotidien, récit, organisation, raison/comparaison, aménagement, imprévu, discussion nuancée. Les niveaux ne sont pas des quotas et ne sont pas des niveaux CECRL certifiés. Les petits groupes de pratique se placent dans les thèmes existants, sans ajouter des écrans de consignes.

| Niveau | Source | Après cette passe | Capacité proposée |
|---|---:|---:|---|
| L1 | 293 | 257 | Entrer dans un échange utile |
| L2 | 548 | 559 | Préciser une intention simple |
| L3 | 632 | 677 | Faire circuler la parole |
| L4 | 595 | 605 | Parler du quotidien |
| L5 | 683 | 676 | Raconter un événement court |
| L6 | 439 | 427 | Organiser ensemble |
| L7 | 430 | 441 | Expliquer et comparer |
| L8 | 402 | 397 | Adapter et négocier |
| L9 | 227 | 220 | Résoudre un imprévu |
| L10 | 251 | 241 | Converser avec souplesse |

Le L1 conserve un stock étendu, plutôt qu’un parcours réduit à quelques phrases. Les expressions déplacées plus tard gardent leur droit historique : `sourceLevel` n’est pas réécrit. Les groupes spécialisés et le vocabulaire isolé restent à doser par scène ; leur seule présence dans une carte ne prépare pas une phrase nouvelle.

## Les corrections de priorité les plus nettes

- Salutations : `Bonjour !` (272/L2), `Salut !` (498/L3), `Bonsoir !` (773/L3) passent à un premier usage éditorial L1.
- Café et dépannage : `Un café, s'il vous plaît.` (3120/L4), `Combien ça coûte ?` (475/L3), `Je ne comprends pas.` (1040/L4) rejoignent les premières tâches, comme phrases entières.
- `À moins que...` (2956/L1) ne relève pas du même démarrage : condition restrictive à reprendre en L8, sans fabriquer son complément.
- `Le film était bien ; par contre, la salle était bruyante.` (2918/L1) combine passé et opposition ; proposition L7 après récit et comparaison.
- Les demandes téléphoniques `Vous m’entendez ?` (2291/L8) ou `Je vous entends mal.` (1974/L7) n’ont pas besoin d’attendre une négociation de niveau avancé.
- Le classement repose sur la fonction et les constructions observées, pas sur une moyenne de longueur ou un nombre de mots commun aux langues.

## Premières substitutions : distinguer les types de groupe

- `C'est bon.` → `C'est cher.` : phrases entières d’abord, un adjectif variable ensuite ; l’adjectif est préparé.
- `Je voudrais un café.` → `Je voudrais une chambre.` : le groupe nominal entier change ; le changement d’article n’est pas caché dans une consigne « remplace le nom ».
- `J’aime les films.` et `J’aime lire.` ne sont pas la première paire de substitution : groupe nominal et infinitif sont deux opérations différentes.
- `J’ai faim.` n’est pas une préparation suffisante de `J’ai un frère.` ; `Je vais au travail.` ne prépare pas automatiquement `Je vais partir en vacances.`.

## Enrichir sans écrire de nouvelle phonétique

Le catalogue classique n’offre pas comme cartes autonomes un prénom complet, `Non, merci.`, `Au revoir.` ni une deuxième boisson pour la première paire café/thé. Il contient seulement le template `Je m'appelle...`, la commande café et des morceaux pertinents dispersés. Cela ne justifie pas de recomposer une aide.

Les JSON conversation `L1-zh-fr.json` de la branche `review/progression-L1-L10` et le lot café antérieur contiennent déjà ces échanges, prénoms et variantes avec leurs aides exactes. Ils ne sont **pas** présents dans le checkout produit courant : leur réemploi demande un import de source typé et vérifiable, pas une prétendue provenance `DECKS.fr`. Les `gaps` du JSON en consignent les références et les limites. Aucun de ces énoncés n’a été ajouté au runtime dans cette passe.

## Ce que les 102 réserves précédentes signifient réellement

Les 102 annotations concernaient 102 des 120 unités conversation zh→fr, pas 102 cartes classiques ou 102 fautes de phonétique. Le triage antérieur établit 73 précautions de structure, 21 de réception/dialogue, 5 préparations non établies et 3 points de registre. Zéro diagnostic natif dans ce triage ne valide aucune aide. Cette revue conserve la distinction.

Les cinq préparations déjà signalées (`L5-zh-fr-02`, `L5-zh-fr-12`, `L7-zh-fr-01`, `L9-zh-fr-05`, `L8-zh-fr-11`) et les différences de rôle/registre restent ouvertes. La carte à deux répliques jointes n’est pas réputée un seul tour à produire ; toute scission doit garder ses offsets et le contrat `received`.

## Relecture de Claude et limites

Chaque déplacement est listé dans [zh-fr.json](zh-fr.json), avec indice, niveau source/proposé, raison, prérequis prévus et copies exactes de `t`, `cn`, `phon`. Le champ `py` anglophone n’est pas utilisé comme aide sinophone. Les copies et empreintes ont été vérifiées contre le catalogue. Les prérequis renvoient à des cartes existantes au même niveau proposé ou à un niveau antérieur ; ils n’attestent pas ce que l’apprenant sait et imposent encore un ordre réel avant la cible.

Les aides en caractères chinois restent intégralement intactes. Claude doit les examiner avec le sens chinois et l’audio français, notamment élisions, liaisons, groupes prépositionnels et contrastes de sons. Aucun mot, article, prénom, accord ou phonétique n’est inventé pour boucher un trou.

La conservation technique du stock n’est pas une validation native, une mesure d’acquisition ni la preuve que tous les placements sont progressifs. Cette première passe déclare son périmètre de vérification et laisse le reste en revue.

## Déplacements proposés

| Indice | Source → proposition | Expression exacte | Motif de groupe |
|---:|---|---|---|
| 31 | L2 → L1 | C'est cher. | Décrire simplement |
| 34 | L2 → L1 | C'est ici. | Se repérer |
| 37 | L2 → L1 | C'est bon. | Décrire simplement |
| 49 | L2 → L1 | C'est gratuit ? | Acheter et obtenir une information |
| 62 | L2 → L1 | C'est ouvert ? | Acheter et obtenir une information |
| 64 | L2 → L1 | C'est gratuit. | Acheter et obtenir une information |
| 69 | L2 → L1 | C'est pour moi. | Acheter et obtenir une information |
| 76 | L2 → L1 | C'est difficile. | Décrire simplement |
| 87 | L2 → L1 | C'est facile. | Décrire simplement |
| 183 | L2 → L1 | Moins vite ! | Premiers échanges utiles |
| 188 | L2 → L1 | C'est à gauche. | Premiers échanges utiles |
| 189 | L2 → L1 | C'est à droite. | Premiers échanges utiles |
| 197 | L2 → L1 | Ça coûte combien ? | Premiers échanges utiles |
| 221 | L2 → L1 | Merci beaucoup ! | Saluer, remercier et prendre congé |
| 222 | L2 → L1 | S'il vous plaît. | Saluer, remercier et prendre congé |
| 260 | L2 → L1 | Bonne chance ! | Saluer, remercier et prendre congé |
| 264 | L2 → L1 | Tout de suite. | Premiers échanges utiles |
| 265 | L2 → L1 | tout de suite | Premiers échanges utiles |
| 272 | L2 → L1 | Bonjour ! | Saluer, remercier et prendre congé |
| 316 | L2 → L1 | Pas de problème. | Premiers échanges utiles |
| 323 | L2 → L1 | Attention ! | Premiers échanges utiles |
| 357 | L2 → L1 | C'est quoi, ça ? | Premiers échanges utiles |
| 379 | L2 → L1 | Allô ? | Premiers échanges utiles |
| 394 | L2 → L1 | Bienvenue ! | Saluer, remercier et prendre congé |
| 405 | L2 → L1 | Bonne nuit ! | Saluer, remercier et prendre congé |
| 415 | L2 → L1 | Il pleut. | Premiers échanges utiles |
| 417 | L2 → L1 | Je comprends. | Comprendre l’autre |
| 433 | L3 → L1 | Tu peux répéter ? | Faire répéter |
| 475 | L3 → L1 | Combien ça coûte ? | Demander le prix |
| 498 | L3 → L1 | Salut ! | Saluer, remercier et prendre congé |
| 773 | L3 → L1 | Bonsoir ! | Saluer, remercier et prendre congé |
| 1040 | L4 → L1 | Je ne comprends pas. | Réparer le premier échange |
| 3120 | L4 → L1 | Un café, s'il vous plaît. | Commander une chose |
| 427 | L3 → L2 | Je voudrais une chambre. | Préciser ce que l’on demande |
| 466 | L3 → L2 | Je voudrais un reçu. | Préciser ce que l’on demande |
| 467 | L3 → L2 | Je voudrais un café. | Préciser ce que l’on demande |
| 585 | L3 → L2 | J'habite ici. | Préciser sa situation |
| 686 | L3 → L2 | Je suis fatigué. | Préciser sa situation |
| 743 | L3 → L2 | J'apprends le français. | Préciser sa situation |
| 854 | L4 → L2 | Où est la sortie ? | Trouver une sortie |
| 859 | L4 → L2 | Je voudrais commander. | Obtenir un service |
| 862 | L4 → L2 | J'ai besoin d'un médicament. | Obtenir un service |
| 863 | L4 → L2 | Vous prenez la carte ? | Obtenir un service |
| 865 | L4 → L2 | J'aime les films. | Dire ce que l’on aime |
| 870 | L4 → L2 | J'aime lire. | Dire ce que l’on aime |
| 871 | L4 → L2 | Je n'ai pas faim. | Préciser un besoin |
| 872 | L4 → L2 | J'aime cuisiner. | Dire ce que l’on aime |
| 881 | L4 → L2 | Je suis heureux. | Parler de soi et de son quotidien |
| 882 | L4 → L2 | Il est gentil. | Parler de soi et de son quotidien |
| 897 | L4 → L2 | Je suis calme. | Parler de soi et de son quotidien |
| 988 | L4 → L2 | Je suis étudiant. | Parler de soi et de son quotidien |
| 1114 | L4 → L2 | Je travaille aujourd'hui. | Parler de soi et de son quotidien |
| 1135 | L4 → L2 | Je suis malade. | Parler de soi et de son quotidien |
| 1196 | L5 → L2 | Voici votre commande. | Situations quotidiennes |
| 1200 | L5 → L2 | Je voudrais voir la carte. | Situations quotidiennes |
| 1201 | L5 → L2 | Où se trouve la pharmacie ? | Situations quotidiennes |
| 1208 | L5 → L2 | C'est là-bas. | Situations quotidiennes |
| 1210 | L5 → L2 | Il y a du monde. | Situations quotidiennes |
| 1212 | L5 → L2 | Il fait chaud aujourd'hui. | Situations quotidiennes |
| 1219 | L5 → L2 | Je t'aime. | Situations quotidiennes |
| 1221 | L5 → L2 | Je t'invite. | Situations quotidiennes |
| 1602 | L6 → L2 | Je suis allergique aux noix. | Signaler une allergie |
| 1603 | L6 → L2 | Je suis allergique aux cacahuètes. | Signaler une allergie |
| 1610 | L6 → L2 | C'est au coin de la rue. | Se repérer dans la rue |
| 1640 | L6 → L2 | Comment on dit ça en français ? | Demander une formulation |
| 1974 | L7 → L2 | Je vous entends mal. | Maintenir la compréhension |
| 1983 | L7 → L2 | Vous pouvez parler plus fort ? | Maintenir la compréhension |
| 2291 | L8 → L2 | Vous m'entendez ? | Maintenir la compréhension |
| 2887 | L1 → L2 | beaucoup de | Préciser une intention simple |
| 2913 | L1 → L2 | de nouveau | Préciser une intention simple |
| 2927 | L1 → L2 | Essaie. | Préciser une intention simple |
| 1235 | L5 → L3 | Il a mal aux dents. | Préciser un problème de santé |
| 1597 | L6 → L3 | Je peux vous accompagner ? | Obtenir un service et répondre |
| 1604 | L6 → L3 | Je voudrais louer une voiture. | Obtenir un service et répondre |
| 1605 | L6 → L3 | Qu'est-ce que vous recommandez ? | Obtenir un service et répondre |
| 1606 | L6 → L3 | Je voudrais un billet pour Paris. | Obtenir un service et répondre |
| 1608 | L6 → L3 | Je voudrais régler la note. | Obtenir un service et répondre |
| 1980 | L7 → L3 | Je voudrais celui-ci. | Choisir entre deux options |
| 1982 | L7 → L3 | Vous pouvez épeler ? | Clarifier ou terminer une démarche |
| 1986 | L7 → L3 | Il faut signer ici. | Clarifier ou terminer une démarche |
| 1988 | L7 → L3 | Je préfère celui-ci. | Choisir entre deux options |
| 2297 | L8 → L3 | Pouvez-vous préciser ? | Faire circuler la parole |
| 2304 | L8 → L3 | Pouvez-vous confirmer la date ? | Faire circuler la parole |
| 2313 | L8 → L3 | Pouvez-vous me rappeler demain ? | Faire circuler la parole |
| 2319 | L8 → L3 | Qui est à l'appareil ? | Faire circuler la parole |
| 2588 | L9 → L3 | Vous pouvez m'ajouter au groupe ? | Faire circuler la parole |
| 2607 | L9 → L3 | Je paie la facture. | Achever une transaction |
| 2610 | L9 → L3 | Je vais payer la facture. | Achever une transaction |
| 2614 | L9 → L3 | Puis-je prendre un message ? | Faire circuler la parole |
| 2639 | L9 → L3 | Voici ma carte de visite. | Faire connaissance au travail |
| 2641 | L9 → L3 | Je vous remercie par avance. | Faire circuler la parole |
| 2642 | L9 → L3 | Je vous remercie infiniment. | Faire circuler la parole |
| 2759 | L10 → L3 | Excusez-moi de vous déranger. | Adapter une formule de politesse |
| 2761 | L10 → L3 | Je vous souhaite une excellente journée. | Adapter une formule de politesse |
| 2809 | L10 → L3 | Je vous souhaite un bon week-end. | Adapter une formule de politesse |
| 2863 | L1 → L3 | le plus | Comparer deux objets connus |
| 2864 | L1 → L3 | plus que | Comparer deux objets connus |
| 2865 | L1 → L3 | en plus | Faire circuler la parole |
| 2867 | L1 → L3 | En fait. | Faire circuler la parole |
| 2868 | L1 → L3 | en fait | Faire circuler la parole |
| 2870 | L1 → L3 | Au fait. | Faire circuler la parole |
| 2888 | L1 → L3 | mieux que | Comparer deux objets connus |
| 2896 | L1 → L3 | moins que | Comparer deux objets connus |
| 2897 | L1 → L3 | T'as raison. | Faire circuler la parole |
| 2898 | L1 → L3 | Ça passe. | Faire circuler la parole |
| 2902 | L1 → L3 | Eh bien… | Faire circuler la parole |
| 2911 | L1 → L3 | Ça y est ! | Faire circuler la parole |
| 2923 | L1 → L3 | Pour quoi faire ? | Faire circuler la parole |
| 2924 | L1 → L3 | N'importe quand. | Faire circuler la parole |
| 2925 | L1 → L3 | Tant mieux. | Faire circuler la parole |
| 2932 | L1 → L3 | le même que | Comparer deux objets connus |
| 2943 | L1 → L3 | Je crois que... | Commencer à demander et donner un avis |
| 2944 | L1 → L3 | Comment aller à... ? | Commencer à demander et donner un avis |
| 2945 | L1 → L3 | Je pense que... | Commencer à demander et donner un avis |
| 2962 | L1 → L3 | le meilleur | Comparer deux objets connus |
| 2968 | L1 → L3 | autant que | Comparer deux objets connus |
| 3752 | L1 → L3 | brillant | Décrire et distinguer des objets |
| 3753 | L1 → L3 | mat | Décrire et distinguer des objets |
| 3757 | L1 → L3 | vif | Décrire et distinguer des objets |
| 3758 | L1 → L3 | pâle | Décrire et distinguer des objets |
| 3766 | L1 → L3 | serré | Décrire et distinguer des objets |
| 3767 | L1 → L3 | large | Décrire et distinguer des objets |
| 3770 | L1 → L3 | fin | Décrire et distinguer des objets |
| 3771 | L1 → L3 | profond | Décrire et distinguer des objets |
| 3772 | L1 → L3 | plat | Décrire et distinguer des objets |
| 3773 | L1 → L3 | rond | Décrire et distinguer des objets |
| 3776 | L1 → L3 | lâche | Décrire et distinguer des objets |
| 1614 | L6 → L4 | J'allume la lumière. | Décrire son quotidien et son travail |
| 1615 | L6 → L4 | J'éteins la lumière. | Décrire son quotidien et son travail |
| 1631 | L6 → L4 | J'adore la photographie. | Décrire son quotidien et son travail |
| 1685 | L6 → L4 | Je travaille dans la vente. | Décrire son quotidien et son travail |
| 1687 | L6 → L4 | Je travaille dans le commerce. | Décrire son quotidien et son travail |
| 2736 | L10 → L4 | L'expédition est en retard. | Échanges professionnels de base |
| 2742 | L10 → L4 | Je vais parler au fournisseur. | Échanges professionnels de base |
| 2779 | L10 → L4 | Pouvez-vous m'envoyer un devis ? | Échanges professionnels de base |
| 2781 | L10 → L4 | L'expédition est retardée. | Échanges professionnels de base |
| 2862 | L1 → L4 | De plus, le petit-déjeuner est inclus. | Ajouter une précision |
| 2866 | L1 → L4 | En plus, c'est gratuit. | Relier des faits quotidiens |
| 2877 | L1 → L4 | parce que | Relier des faits quotidiens |
| 2914 | L1 → L4 | Du coup. | Relier des faits quotidiens |
| 2926 | L1 → L4 | J'en peux plus. | Relier des faits quotidiens |
| 2939 | L1 → L4 | en même temps | Relier des faits quotidiens |
| 2967 | L1 → L4 | en cours | Relier des faits quotidiens |
| 3777 | L1 → L4 | jaloux | Parler de ses ressentis |
| 3778 | L1 → L4 | gêné | Parler de ses ressentis |
| 3780 | L1 → L4 | déçu | Parler de ses ressentis |
| 3781 | L1 → L4 | reconnaissant | Parler de ses ressentis |
| 3786 | L1 → L4 | nerveux | Parler de ses ressentis |
| 3787 | L1 → L4 | coupable | Parler de ses ressentis |
| 3792 | L1 → L4 | dépassé | Parler de ses ressentis |
| 3793 | L1 → L4 | satisfait | Parler de ses ressentis |
| 3794 | L1 → L4 | impatient | Parler de ses ressentis |
| 3800 | L1 → L4 | donc | Relier des faits quotidiens |
| 2899 | L1 → L5 | l'autre jour | Raconter un événement |
| 2955 | L1 → L5 | dans le passé | Raconter un événement |
| 2296 | L8 → L6 | Peut-on décaler l'appel ? | Organiser et adapter un rendez-vous |
| 2753 | L10 → L6 | Permettez-moi de me présenter. | Organiser et adapter un rendez-vous |
| 2764 | L10 → L6 | Pourriez-vous patienter un instant ? | Organiser et adapter un rendez-vous |
| 2767 | L10 → L6 | Seriez-vous disponible mardi ? | Organiser et adapter un rendez-vous |
| 2954 | L1 → L6 | Si possible. | Organiser ensemble |
| 444 | L3 → L7 | Il faut qu'on parle. | Formuler une nécessité dans un échange |
| 1641 | L6 → L7 | N'empêche qu'il est arrivé premier. | Interpréter et réemployer une expression |
| 1642 | L6 → L7 | Il m'a posé un lapin. | Interpréter et réemployer une expression |
| 1758 | L6 → L7 | Impossible n'est pas français. | Interpréter et réemployer une expression |
| 2853 | L1 → L7 | Donc... | Relier et nuancer des idées |
| 2861 | L1 → L7 | de plus | Relier et nuancer des idées |
| 2917 | L1 → L7 | Par contre... | Relier et nuancer des idées |
| 2918 | L1 → L7 | Le film était bien ; par contre, la salle était bruyante. | Comparer et nuancer un avis |
| 2919 | L1 → L7 | N'importe quoi ! | Réagir sans confondre sens littéral et registre |
| 2920 | L1 → L7 | N'importe quoi. | Réagir sans confondre sens littéral et registre |
| 2937 | L1 → L7 | D'un côté... | Relier et nuancer des idées |
| 2948 | L1 → L7 | C'est vrai, mais... | Relier et nuancer des idées |
| 2974 | L1 → L7 | Je comprends, mais... | Relier et nuancer des idées |
| 3798 | L1 → L7 | cependant | Relier et nuancer des idées |
| 3799 | L1 → L7 | pourtant | Relier et nuancer des idées |
| 3801 | L1 → L7 | bref | Résumer un point de vue |
| 3802 | L1 → L7 | néanmoins | Relier et nuancer des idées |
| 2956 | L1 → L8 | À moins que... | Poser une condition |
