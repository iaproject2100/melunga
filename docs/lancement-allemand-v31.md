# Allemand — intégration du deck validé v3.1

L’allemand est ajouté comme langue étudiée dans le parcours existant, pour les
sept langues natives déjà proposées. L’accueil, les leçons, la barre mobile et
la colonne de thèmes sur ordinateur conservent leur architecture.

## Source et contenu

- Source importée : `tools/maquette-guidee/imports/de-deck-v3.1.json`.
- SHA-256 du fichier reçu :
  `49d6f1cd3b2a44b4ab4efcbae4c5f58988ebc7e142ebb74b1505d4ce9e39d789`.
- 4 519 cartes, 15 champs par carte ; textes, traductions, phonétiques, ordre,
  catégories et niveaux conservés exactement. Aucune phonétique régénérée.
- Niveaux L1 à L10 : 283, 545, 666, 594, 718, 432, 428, 401, 226, 226.
- Le fichier reçu n’a pas de champ de thème. Chaque niveau utilise donc une
  rubrique neutre « Toutes les leçons », une photo existante et le découpage en
  étapes déjà présent. Aucun classement thématique inventé.
- Les 4 444 cartes actives gardent leur ordre source. Les 75 modèles incomplets
  (`template`) sont conservés en réserve selon les règles du parcours actuel ;
  ils ne deviennent pas des exercices principaux. L1 comprend 270 cartes
  actives et 13 modèles en réserve.
- La provenance allemande est explicitement `validated-import.de`, distincte
  du catalogue historique `DECKS`. Les sept banques historiques, les 78 JSON
  progressifs, leurs droits et les littéraux classiques restent inchangés.

## Parcours et audio

Les couples `fr-de`, `en-de`, `es-de`, `it-de`, `zh-de`, `ja-de` et `ko-de`
utilisent les mêmes droits et sauvegardes de progression que les autres cours.
L1 est gratuit ; les niveaux suivants suivent l’accès existant. L’allemand ne
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
- Conservation du catalogue allemand et projections des 70 vues : 7 tests.
- Sources et projections natives, avec oracle indépendant pour les 42 couples
  historiques : 12 tests.
- Contrats audio simulés : 57 tests ; intégration des applications : 16 tests.
- Couches de preuve historique et allemande, incluant les contrôles négatifs :
  17 tests. La couche allemande part de `541afb7`, scelle 27 modifications et
  deux nouveaux fichiers, puis vérifie les 190 autres fichiers de production.
  Les huit fonctions d’authentification/paiement et huit fonctions de
  progression restent identiques.
- Navigateur Chromium local : 18 cas allemands et 26 cas de routage natif,
  couvrant les 49 directions, les droits, « À revoir », la progression, les
  formulaires de compte et l’audio simulé.
- Régression de l’entrée connexion : 13 cas réussis. Une ancienne attente de
  carte classique a été remplacée par l’entrée moderne, après reproduction du
  même échec sur `541afb7` ; le fallback classique reste vérifié.
- Conservation et découpage des longues séquences : 6 tests, comprenant les
  70 vues allemandes. Les 42 premières leçons historiques restent directes ;
  L1 allemand conserve ses 270 cartes actives réparties en huit étapes.
- Comparaison de la leçon espagnole existante avec `541afb7` : pixels
  identiques sur ordinateur et mobile. Les seules extensions CSS dessinent
  le nouveau drapeau allemand.

Les essais navigateur interceptent les API : aucun compte, paiement ou audio
réel. Ils émulent les formats mobile et ordinateur ; ce ne sont pas des essais
sur téléphone physique ou Safari.
