# Vérification du démarrage du parcours

La suite locale `melunga_deploy/tests/course-startup.browser.cjs` vérifie le premier affichage statique sans JavaScript, puis le démarrage réel avec des chargements indépendamment retardés. Elle conserve les 78 fichiers de cartes et le contrat d’accès comme références immuables du commit `ff4f1e0`.

Les scénarios couvrent :

- les deux HTML avant JavaScript, sans bandeau « Maquette / Site actuel » ni langue ou niveau trompeurs ;
- le cadre, les placeholders et le bouton de reprise sur 320 × 568, 390 × 700 et 1440 × 900 ;
- la route `fr-es`, niveau 4, avec une préférence locale ancienne d’un autre couple ;
- le démarrage simultané du contenu et de la vérification d’accès, en maintenant toutes les cartes masquées tant que le statut de confiance n’est pas prêt ;
- le refus d’un accès payant déduit de `ox_paid=1` ou de la chaîne serveur `"true"`, et les présentations gratuites comparées à leurs identités sources ;
- le chargement et les erreurs localisés en français, anglais et chinois, puis la reprise dans le même couple et au même niveau ;
- six langues cibles pour un francophone, dans le sélecteur caché et dans la liste visible, sans le français ;
- le maintien de la langue maternelle après un changement de cible, les entêtes et les premières et dernières entrées des dialogues après chargement ;
- les routes inconnues, identiques ou ambiguës, qui affichent une erreur sans ouvrir un autre couple ;
- une vraie fiche sur les deux tailles de téléphone, qui occupe la hauteur utile sans conserver l’ancien espace de bandeau de 29 ou 34 pixels.

```sh
COURSE_STARTUP_REPORT=/tmp/melunga-course-startup-browser.json \
COURSE_STARTUP_CAPTURES=/tmp/melunga-course-startup-browser \
NODE_PATH=/tmp/melunga-review-tools/node_modules \
node --test melunga_deploy/tests/course-startup.browser.cjs
```

Toutes les réponses HTTP sont servies depuis les fichiers du checkout ou des fixtures déclarées. Le domaine de test utilise le mode production du contrat d’accès, et non les droits illimités des aperçus Netlify. Le service vocal reçoit une erreur de catalogue contrôlée ; aucun audio, compte réel, paiement ou message n’est envoyé.

Les captures sont produites avec Chromium local. Les profils mobiles règlent le tactile, la fenêtre et l’agent utilisateur Android ; ils ne constituent pas un test sur téléphone physique, Safari ou une application d’accueil installée. Le rapport distingue les assertions réussies, les fichiers effectivement vérifiés et leur stabilité pendant le passage.

## Correctif livré

Le bandeau de maquette est retiré des deux HTML, sans attendre le réseau ou le statut du compte. L’entête présente un état neutre avant JavaScript puis la langue et le niveau demandés, sans imposer le chinois ou L1. Le chargement montre des emplacements de rubriques et un message localisé. Les métadonnées et la vérification des droits se chargent ensemble ; les données du niveau et son répertoire aussi. Les contenus restent bloqués jusqu’au statut de confiance. La reprise après erreur garde le couple et le niveau.

La feuille additionnelle de démarrage supprime l’espace de l’ancien bandeau sans retoucher la feuille principale validée. Le classement, les 78 JSON des parcours relus, les prix, les droits et les sept voix choisies restent inchangés par ce correctif.

Les [12 protections des couches](verification-layers.json) passent : 15 fichiers de produit bornés, 78 JSON non projetés, 27 illustrations et les fonctions audio approuvées préservées. Les 69 tests serveur, lecteur, sélection et intégration passent également.

## Dernier passage

Les six groupes passent sur les sources gelées : 22 cas, 22 captures produites, aucune erreur JavaScript ou requête inattendue, fichiers stables pendant le passage. Le statut non payant conserve exactement 42 présentations accessibles sur les 671 présentations sources du niveau espagnol 4 ; aucune fiche n’apparaît avant la fin de la vérification d’accès.

Le [rapport complet](verification-browser.json) conserve les empreintes des fichiers testés. La [synthèse](qa-summary.json) indique les limites et les résultats. Exemples de captures Chromium locales :

- [HTML statique avant JavaScript](captures/static-320x568.png)
- [Langue et niveau corrects pendant l’attente du statut](captures/awaiting-trusted-access-320x568.png)
- [Erreur et reprise en anglais](captures/localized-error-en.png)
- [Six langues cibles pour un francophone](captures/six-french-native-targets-390.png)
- [Fiche occupant la hauteur utile après retrait du bandeau](captures/lesson-full-viewport-320x568.png)

Ces résultats ne constituent pas une ouverture de l’aperçu distant ni un essai physique sur téléphone.
