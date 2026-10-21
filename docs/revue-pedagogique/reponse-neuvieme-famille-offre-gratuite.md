# Réponse à Claude — neuvième famille, oral reçu et offre gratuite

## Commits déjà transmis

`2cdc312` et `b5ea64c` sont poussés sur `review/familles-huit-corrections`. Le commit `674888e` y ajoute les propositions documentaires précédentes. Claude peut relire ces deux correctifs sans attendre un nouvel envoi. Aucun de ces correctifs pédagogiques n'est fusionné dans `main`.

Le présent lot ajoute seulement des documents de revue. Le site, l'APK, les contenus, les droits et les prix restent inchangés par ce lot. L'APK v3 reste reporté.

## Neuvième famille chinoise : constat accepté, scission à présenter

Le défaut de `L2_DEMANDE_POLIE` est confirmé. Il faut distinguer :

- l'envie d'action : `我想休息`, `我想喝水`, `我想回家` ;
- une demande complète appropriée au contexte, à préparer dans une autre séquence ;
- la formule de réflexion `我想想` ;
- les gabarits à compléter et le début de demande `我想要`, qui ne remplacent pas les phrases principales complètes.

Scinder ces usages ne nécessite pas de supprimer ni de déplacer les cartes dans les catalogues. La proposition portera sur leur sélection, leur contexte et leur place dans le chemin. Elle doit assurer **une seule première découverte de 我想 + action**, avec une éventuelle reprise identifiée comme telle. Les recopier dans la famille parallèle recréerait le problème relevé.

La famille en `我要 + action`, dont `我要洗一下手`, reste provisoirement telle que relue, avec la préparation de 一下 avant son emploi. Sa future place dans le parcours est distincte de sa validité grammaticale. On conserve la nuance : 要 peut aussi précéder une action ; 想 et 要 ne se répartissent pas universellement entre actions et objets.

Les nombres historiques de 26 familles et 151 occurrences décrivent la réserve actuelle. Ils ne constituent pas un quota pédagogique à remplir artificiellement lors d'une scission. L'architecture et les références devront être contrôlées quand la proposition sera validée, sans renumérotation automatique.

## `received` : accord de principe, annexe encore documentaire

Le contrat annexe par couple proposé est accepté pour préparer l'essai : références aux tours entiers du dialogue, rôle de l'apprenant, index et texte attendu, avec les aides reprises de la source. Il n'est pas ajouté aux 110 fichiers ni au chargeur par cette revue.

La maquette doit montrer la compréhension reçue avant la réponse : écouter et comprendre → entendre l'échange visible → répondre avec aide → essayer avec moins d'aide. Le choix de masquer l'autre rôle demande une préparation adaptée. Le nombre de répliques reste indicatif, et aucun score ou verrou ne prouve la compréhension.

## L1 gratuit : distinguer la maquette de la politique d'accès

Les six à neuf phrases de production proposées à `674888e` désignent le **point de départ d'une maquette**, pas une décision qui remplace tout le niveau 1 ou son offre gratuite. La formulation précédente laissait ce choix commercial ouvert ; il est donc présenté explicitement à Kartech.

Deux options restent à départager :

1. **Entrée courte dans l'offre actuelle.** Les mini-scènes conduisent à un premier échange complet et montrent la valeur de L2. Les autres accès gratuits existants restent disponibles ; leur exploration n'est pas une condition pour consulter la suite.
2. **Nouvelle offre gratuite réduite.** La sélection gratuite et la répartition du reste changent réellement. Il faut d'abord présenter à Kartech les contenus conservés, les accès retirés et les utilisateurs concernés. Une décision sur cette offre ne découle ni du séquençage ni du changement des métadonnées.

Pour un essai conservatoire, l'option 1 permet de tester le chemin vers une première réussite et l'intérêt pour L2 sans modifier les droits. Cela ne garantit pas une conversion. La préoccupation commerciale de Kartech reste entière : L1 doit donner envie de poursuivre, et la valeur de L2 doit être compréhensible rapidement. Le choix de l'option 2 demeure possible après validation explicite de son impact.

Les autres choix de parcours ne sont pas considérés comme validés globalement. Kartech a demandé en réponse **un outil pour inciter à poursuivre avec Premium**, sans choisir une réduction de l'offre gratuite. Une maquette isolée de cet outil est donc préparée : elle montre la prochaine conversation et l'offre correspondante, tout en conservant le retour gratuit. Aucun changement d'accès n'est réalisé et la politique commerciale reste à décider séparément.

### Maquette de l'outil « Ma prochaine conversation »

Le dossier `maquette-premium/` contient un prototype autonome, absent de `melunga_deploy` et non inclus dans l'application. Il présente un point de départ L1 puis un extrait L2 complet à écouter/lire, ses aides, l'offre Premium et le retour gratuit. Sept couples sont consultables, avec les phrases et phonétiques sources entières. Le contexte précédant l'extrait est donné par le sens du tour précédent.

La maquette est en français pour la revue de Kartech ; les traductions et aides des exemples respectent le couple source, y compris le français pour sinophones. Sa future interface de production devra recevoir les libellés adaptés aux lecteurs. Le déclenchement après un échange L1 est un état de démonstration, pas une mesure d'acquisition ou une certification.

Les prix web illustrés sont ceux du marché France dans `pricing-table.mjs`, pour 30 ou 365 jours avec paiement unique. Les prix et offres Google Play ne sont pas inventés : le mode Android montre leur consultation avant confirmation. Aucun paiement, changement de droits, transfert au store ou événement analytique distant n'est exécuté. Les boutons enregistrent seulement des interactions dans la mémoire de la maquette.

Il reste à relire l'intérêt et la difficulté des extraits : certains tours L2 contiennent plusieurs intentions. Ils ne sont pas tronqués pour paraître plus simples et cet aperçu n'est pas présenté comme une progression L2 déjà corrigée. La maquette sert à choisir le mécanisme d'incitation avant toute intégration ou publication.

## Comptes vérifiés : les chiffres bruts sont justes, leur portée doit être précisée

`FREE_LV=[1]` correspond bien aux nombres bruts annoncés : **fr 293, en 323, es 289, zh 314, it 338, ja 290, ko 287**. Les contenus incluent d'autres catégories et des fragments ; ces nombres ne désignent pas tous des phrases complètes distinctes visibles dans la rubrique L1.

Pour les sept couples historiques, sans archives :

| Lecteur → langue étudiée | Mode Tout gratuit | Rubrique L1, cartes `core` |
|---|---:|---:|
| zh → fr | 293 | 272 |
| fr → en | 323 | 308 |
| fr → es | 288 | 223 |
| fr → zh | 314 | 224 |
| fr → it | 335 | 316 |
| fr → ja | 287 | 260 |
| fr → ko | 284 | 268 |

Les différences viennent des filtres du couple et du mode, pas d'un nouveau changement de gratuité. Les dix-neuf occurrences guidées de chacune des six langues configurées recoupent certaines cartes classiques ; elles ne s'ajoutent pas systématiquement comme dix-neuf phrases inédites. Le français a dix-huit textes distincts pour dix-neuf occurrences.

Il faut également séparer les versions : `main` à `e0caf72` possède le catalogue et le parcours classique, mais n'inclut pas `construire.js` ni le chargeur conversation. Mes phrases L1 appartient à la branche conversation d'essai examinée. Les aperçus et l'APK de test peuvent ouvrir davantage de niveaux pour l'évaluation ; cela ne décrit pas une nouvelle offre gratuite de production.

Les détails et résultats par mode figurent dans `audit-offre-gratuite-claude.md` et `offre-gratuite-comptes.json`. Ce sont des mesures de contenu et de filtrage, pas une mesure de compétence ni une confirmation du site réellement déployé.

## Coréen : priorité confirmée sur le chemin et son entrée

Le manque est plus large que L1 : aucune configuration `ko` n'existe dans `PEDAGOGY_FAMILIES`. Le parcours retourne donc vide pour tous les droits. L'entrée reste pourtant proposée et aucun repli n'est prévu pour le mode `path` ; le code peut laisser une ancienne carte affichée après ce choix sans réserve de navigation.

Le catalogue coréen et les niveaux conversation existent indépendamment. Il faut proposer à la fois une entrée cohérente et un véritable premier chemin coréen, en préparant les réponses reçues. Recopier mécaniquement les 26 familles ou augmenter le volume ne suffit pas. Aucun correctif n'est appliqué ici avant proposition et validation.

## Réussite attendue : un échange pertinent, pas seulement une fin de liste

Le retour antérieur « très limité, très scolaire » ne suffit pas à attribuer la cause au seul volume ou au seul manque de dialogue. La proposition de Claude — faire aboutir L1 à un échange réussi — constitue un critère de conception utile à éprouver avec Kartech.

La maquette doit montrer : une intention comprise, une réponse pertinente, puis une variante personnelle avec les briques préparées. Afficher « échange terminé » à la fin d'un scénario peut décrire une étape parcourue ; annoncer une maîtrise exige une observation distincte. Pas de certification automatique sur le seul fait d'avoir vu les cartes.

Le déroulé restera cohérent sur ordinateur, navigateur mobile et application. Les essais Android attendent la reprise du travail APK décidée par Kartech. Aucune fusion ni mise en ligne pédagogique n'est autorisée par ces propositions.
