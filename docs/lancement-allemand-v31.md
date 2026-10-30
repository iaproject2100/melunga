# Allemand — intégration du deck validé v3.1

L’allemand est ajouté comme langue étudiée dans le parcours existant, pour les
sept langues natives déjà proposées. L’accueil, les leçons, la barre mobile et
la colonne de thèmes sur ordinateur conservent leur architecture.

## Source et contenu

- Source importée : `tools/maquette-guidee/imports/de-deck-v3.1.json`.
- SHA-256 du fichier reçu :
  `49d6f1cd3b2a44b4ab4efcbae4c5f58988ebc7e142ebb74b1505d4ce9e39d789`.
- 4 519 cartes, 15 champs par carte ; textes, traductions, phonétiques, ordre
  des objets source, catégories et niveaux conservés exactement. Aucune
  phonétique régénérée.
- Niveaux L1 à L10 : 283, 545, 666, 594, 718, 432, 428, 401, 226, 226.
- Le classement thématique est conservé séparément dans
  `tools/maquette-guidee/imports/de-themes-v1.json`. Les 4 519 affectations ont
  été lues carte par carte, puis les ambiguïtés ont été revues. Les titres et
  photographies reprennent le catalogue existant, sans nouvel écran.
- 194 rubriques illustrées sur dix niveaux : 21, 20, 22, 18, 22, 19, 20, 18,
  19, 15. Les situations et le vocabulaire sont séparés comme dans les autres
  langues. Les entrées lexicales sont distinguées des phrases complètes sans
  modifier le champ source `cat`.
- Les 4 444 cartes actives gardent leur ordre source à l’intérieur de chaque
  thème ; l’affichage est désormais regroupé par thème. Les 75 modèles incomplets
  (`template`) sont conservés en réserve selon les règles du parcours actuel ;
  ils ne deviennent pas des exercices principaux. L1 comprend 270 cartes
  actives et 13 modèles en réserve.
- La provenance allemande est explicitement `validated-import.de`, distincte
  du catalogue historique `DECKS`. Les sept banques historiques, les 78 JSON
  progressifs, leurs droits et les littéraux classiques restent inchangés.

L’accueil propose un quatrième exemple, « Allemand », avec la carte source
« Können Sie mir helfen? », sa phonétique française exacte et sa traduction.
Les trois exemples précédents sont conservés. L’audio allemand utilise les
modules partagés et le catalogue Chirp vérifié, sans lecture automatique.
Le bandeau des huit langues, les bulles et l’exemple mobile existant restent
présents.

## Parcours et audio

Les couples `fr-de`, `en-de`, `es-de`, `it-de`, `zh-de`, `ja-de` et `ko-de`
utilisent les mêmes droits et sauvegardes de progression que les autres cours.
L1 est gratuit ; les niveaux suivants suivent l’accès existant. Les identités
des cartes et les sauvegardes sont inchangées ; les entrées « À revoir » écrites
avec l’ancien identifiant `all-lessons` retrouvent leur thème par leur identifiant
de carte stable. L’allemand ne
devient pas une langue native de l’interface. Les guides japonais et coréen
emploient le secours anglais existant, explicitement identifié dans l’aide.

Les formulaires de connexion et d’abonnement conservent le retour allemand
validé sans tenter de charger une banque classique allemande inexistante.
L’ancienne entrée Capacitor/file reste limitée à ses langues disponibles ;
l’ajout concerne le parcours web, y compris le navigateur mobile.

Le contrat audio `kartech-2026-10-30-de` ajoute l’allemand aux sept langues.
Les clients utilisant `kartech-2026-10-27`, ou aucune version, reçoivent toujours
leur catalogue à sept langues. Le défaut allemand
`de-DE-Chirp3-HD-Kore` n’est utilisé qu’après observation et vérification du
genre par le serveur. Le secours navigateur accepte uniquement une voix
allemande. Les préférences existantes et l’application unique de la vitesse
sont conservées. Aucun appel réel au fournisseur ni essai d’écoute physique
n’a été effectué pendant cette validation.

## Validation

- Export déterministe et deux builders de traduction : `--check` réussi.
- Conservation du catalogue allemand et projections des 70 vues : 9 tests,
  dont 1 680 appels aux sept dictionnaires réels pour les 240 définitions.
- Sources et projections natives, avec oracle indépendant pour les 42 couples
  historiques : 12 tests.
- Contrats audio simulés : 57 tests ; intégration des applications : 16 tests.
- Couches de preuve historique et allemande, incluant les contrôles négatifs :
  17 tests. La couche allemande part de `541afb7`, scelle 27 modifications et
  trois nouveaux fichiers, puis vérifie les 190 autres fichiers de production.
  Les huit fonctions d’authentification/paiement et huit fonctions de
  progression restent identiques.
- Navigateur Chromium local : huit groupes, 21 cas allemands, couvrant les
  rubriques illustrées, la pagination, les sept langues natives, les droits,
  « À revoir », la progression, les formulaires de compte et l’audio simulé.
- Routage natif : quatre groupes, 26 cas, les 49 directions, y compris petits
  écrans et texte agrandi ; sources stables et aucune requête inattendue.
- Accueil : trois tests, dont l’onglet allemand dans les sept langues du site,
  l’exactitude des trois exemples précédents et la présentation mobile.
- Régression de l’entrée connexion : 13 cas réussis. Une ancienne attente de
  carte classique a été remplacée par l’entrée moderne, après reproduction du
  même échec sur `541afb7` ; le fallback classique reste vérifié.
- Conservation et découpage des longues séquences : 6 tests, comprenant les
  70 vues allemandes. Les 42 premières leçons historiques restent directes ;
  la première rubrique allemande « Saluer et faire connaissance » compte 31
  cartes et entre directement en leçon. Les thèmes de plus de 100 cartes
  utilisent le découpage en étapes existant.
- Comparaison de la leçon espagnole existante avec `541afb7` : pixels
  identiques sur ordinateur et mobile. Les seules extensions CSS dessinent
  le nouveau drapeau allemand.

Les essais navigateur interceptent les API : aucun compte, paiement ou audio
réel. Ils émulent les formats mobile et ordinateur ; ce ne sont pas des essais
sur téléphone physique ou Safari.
