# Allemand comme langue de départ

L’option « Deutsch » de l’accueil permet désormais d’utiliser les menus en
allemand et d’obtenir les traductions allemandes des leçons des sept autres
langues. Le parcours web conserve la présentation mobile et ordinateur, les
thèmes illustrés, les commandes de leçon, les révisions, « À revoir », la
progression, la voix et les écrans de compte existants.

Cette extension complète l’[ajout de l’allemand comme langue étudiée](lancement-allemand-v31.md).
Le catalogue web propose huit langues de départ et huit langues étudiées,
soit 56 directions distinctes. Les 49 directions déjà disponibles sont
conservées. Sur l’accueil, Deutsch apparaît après English ; son parcours par
défaut est l’anglais et un choix précédent valide reste restauré.

## Données et provenance

Les 32 115 cartes des sept banques historiques disposent d’un sens allemand
dans un fichier séparé, sans ajout de champ aux objets source ni changement
de leurs textes, phonétiques, catégories, niveaux ou identifiants :

- Source : `tools/maquette-guidee/imports/de-native-meanings-v1.json`.
- Fichier livré : `melunga_deploy/content/native-catalogue/de-native-meanings.json`.
- 15 869 concepts : 15 249 nouvelles traductions et 620 traductions reprises
  du deck allemand validé. Plusieurs cartes partagent un même concept ; les
  liens conservent chaque identité de carte.
- Le manifeste référence le fichier et son empreinte SHA-256. Le chargeur
  vérifie aussi les empreintes des banques auxquelles ses liens renvoient.

Le deck allemand étudié reste celui de la revue v3.1 close : 4 519 cartes,
194 rubriques et 4 444 cartes actives. Le total des huit banques de cartes
reste 36 634 ; les nouvelles traductions ne sont pas de nouvelles cartes.

Les aides de prononciation ne sont pas présentées comme de nouvelles
transcriptions adaptées à l’allemand. Le parcours de départ allemand
réutilise exactement les aides anglaises source, avec un secours explicitement
identifié comme anglais, ou le pinyin pour le chinois. Une aide absente reste
absente. Aucun champ phonétique source n’est réécrit ni généré.

## Accès et comptes

Les sept nouveaux parcours `de-fr`, `de-en`, `de-es`, `de-it`, `de-zh`,
`de-ja` et `de-ko` suivent les règles d’accès du parcours partagé : L1 gratuit,
puis accès confirmé par le serveur. La navigation de connexion et d’abonnement
conserve le retour typé vers le cours allemand. L’habillage allemand des
formulaires est limité à ces retours web validés ; les contrats de connexion,
de paiement et de sauvegarde existants restent inchangés.

L’ancien conteneur classique Capacitor/file garde ses sept langues natives
disponibles. L’extension concerne le web, y compris le navigateur mobile et
l’entrée PWA web ; elle ne crée pas une banque classique allemande manquante.

## Contrôles réalisés

Les rapports locaux du 30 octobre 2026 établissent les résultats suivants :

- `german-native.test.cjs` : cinq contrôles finaux réussis. Couverture des 32 115
  identités, des 15 869 concepts et des 70 niveaux des nouveaux parcours ;
  1 434 thèmes et 27 963 modèles éligibles vérifiés. Parmi ces modèles,
  22 363 utilisent le secours anglais, 4 903 le pinyin et 697 gardent une
  aide indisponible.
- Conservation des 49 directions précédentes : 175 622 modèles dérivés,
  420 niveaux dérivés et les sept parcours relus contrôlés ; banques source
  inchangées. Les droits gratuits et payants restent vérifiés séparément.
- Formulaires de compte : 11 cas navigateur réussis, dont les retours de
  connexion, l’ouverture différée, les deux abonnements, la confirmation
  d’appareil et le rejet des retours hors périmètre. Les 15 fonctions source
  protégées ainsi que les littéraux classiques `DECKS` et `PEDAGOGY`
  sont identiques à la base.
- Accueil : menus et textes allemands, choix restauré, liens de cours et
  limites des anciens conteneurs vérifiés localement. Les sept dictionnaires
  antérieurs et leurs suppléments conservent leurs valeurs.
- Dictionnaire allemand : clés, champs non vides, balises et paramètres
  vérifiés ; 185 libellés d’interface, 290 thèmes, dix niveaux, huit langues,
  14 formats et 20 suppléments.
- Parcours dans Chromium : six groupes de contrôles finaux réussis, sur
  mobile tactile émulé et ordinateur. Ils couvrent l’entrée directe depuis
  l’accueil, les 14 changements entre les sept langues étudiées sur les deux
  formats, les commandes de leçon, les révisions, « À revoir », la sauvegarde,
  les longues étapes et la progression. Les droits de L1 et L2 ainsi que le
  retour vers le compte sont vérifiés. Les quatre comparaisons des écrans
  espagnols précédents — thèmes et leçon en 390 et 1 366 pixels — donnent
  des captures PNG identiques octet par octet à la base `5675b01`.

Les rapports finaux sont `browser-final/acceptance.json` et
`german-native-unit-final-validation.json` dans le dossier de validation local
du 30 octobre 2026. Les contrôles utilisent des réponses locales ou simulées :
aucun compte réel, paiement réel ou fournisseur audio n’a été appelé. Ils ne
constituent pas un essai sur téléphone physique ni une confirmation de
publication ou de fonctionnement en production.
