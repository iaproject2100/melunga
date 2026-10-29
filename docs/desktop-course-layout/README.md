# Barre haute du parcours sur ordinateur

Ce contrôle porte sur le vrai parcours, après application de la présentation ordinateur approuvée : logo de 96 pixels, navigation en haut, niveau/langue/couleur à droite du titre, et commandes d’écoute et de continuation réunies près de la traduction.

La vérification utilise les fichiers HTML, CSS et JavaScript du produit. Les maquettes de comparaison ne sont pas utilisées pour établir le résultat.

## Périmètre

- Thèmes et fiches à 1366 × 768 et 1440 × 900, avec un titre lisible, les trois pastilles alignées et une seule instance de chaque commande.
- Sélecteurs de langue et de niveau, réglage de voix et de vitesse, couleur, menu secondaire et espace compte restant dans le nouveau parcours.
- Cartes réelles : anglais vers espagnol à L1, français vers chinois avec Pinyin à L1, et une phrase espagnole de L8.
- Étude, aide phonétique et traduction entières, effectivement visibles dans la carte ; écouter et continuer accessibles ensemble, sans défilement.
- Écoute simulée avec le texte et la langue de la carte, respect du choix de voix/vitesse, puis passage à une autre phrase en un clic sur ordinateur : identifiant différent, compteur augmenté d’une carte, média arrêté et aucun classement « Je connais ». Un simple passage « comprendre → imiter » sur la même phrase fait échouer le test. Une fin ne peut survenir qu’après la dernière carte.
- Mobile à 390 × 700 comparé au véritable rendu de `7b17e56`, servi depuis Git avec les mêmes données et fixtures : pastilles, footer, textes et Pinyin.
- Le bouton Continuer est aussi cliqué sur mobile : il conserve la progression par étapes d’origine, avec les mêmes identifiants et indices avant/après que la référence Git. Le comportement ordinateur de passage à la phrase suivante ne s’applique pas au mobile.
- Quatre balayages mobiles, messages et classement, puis aller-retour de largeur ordinateur → mobile → ordinateur sans doublon ni changement de carte.

La phrase L8 est une carte entière existante : « Entiendo sus limitaciones, pero el defecto sigue siendo visible. » (`situation-authored:fr-es:piste-reclamation-tact-01`). Elle est atteinte depuis la rubrique « Réclamation : négocier avec tact ». Aucune phrase ou aide phonétique n’est créée pour le contrôle.

## Isolation

Le navigateur est Chromium local. Le mobile est une simulation de dimensions et d’interactions tactiles, pas un téléphone physique ni Safari. Aucun compte réel, POST, paiement ou service vocal n’est utilisé. Les statuts de compte et le catalogue vocal sont des fixtures explicites ; les lectures audio sont des événements en mémoire, sans chargement ni décodage de son.

Les données, dictionnaires, CSS mobile d’origine, audio, services de compte et de prix sont confrontés à `7b17e56`. Les deux délégations autorisées de lecture dans `course-access.js` et `course-native.js` sont vérifiées séparément : seul l’appel à l’utilitaire de téléchargement peut différer ; les validations et les droits restent identiques.

```sh
NODE_PATH=/tmp/melunga-review-tools/node_modules node --test melunga_deploy/tests/desktop-course-layout.browser.cjs
```

## Résultat final du 27 octobre 2026

**8 groupes et 26 cas réussissent**, avec des sources identiques avant et après la passe. Aucune erreur JavaScript, erreur de fixture ou requête inattendue n’est observée. Vingt captures ont été produites ; onze sont conservées dans ce dossier.

| Groupe | Cas |
| --- | ---: |
| Conservation de 121 fichiers entiers et contrôle des deux délégations de lecture | 1 |
| Barre haute, titre et pastilles sur les deux formats ordinateur et deux couples | 4 |
| Langues, niveaux, voix, vitesse, couleur, menu et compte | 2 |
| Fiches réelles, commandes proches et vraie phrase suivante en un clic | 6 |
| Mobile : référence Git et rendu actuel sur trois cartes | 6 |
| Quatre gestes mobiles, référence puis rendu actuel | 2 |
| Aller-retour ordinateur → mobile → ordinateur | 1 |
| Récupération des documents et refus de SHA incompatible | 4 |

Les glyphes peuvent dépasser légèrement leur boîte de ligne lorsque `overflow:visible` les affiche entièrement. Le test mesure leurs rectangles réels, la visibilité de leurs ancêtres, les limites de la carte et leur séparation des boutons. Il refuse les textes cachés, coupés ou superposés ; il ne confond pas un dépassement typographique visible avec une troncature.

## Chargement et droits

Sur `en-es L1`, une première réponse 503 de la banque espagnole est suivie d’une réponse valide : la récupération se fait sans clic. Le manifeste et les droits sont aussi mis en échec une première fois ; la réponse valide des droits est retenue pour vérifier qu’aucune carte ne s’installe entre-temps.

Une panne persistante s’arrête après deux tentatives. Le véritable bouton Réessayer est ensuite cliqué et les thèmes apparaissent lorsque la fixture redevient disponible. Un dernier cas renvoie un JSON valide dont les octets ne correspondent pas au SHA attendu : aucun thème ni contenu de secours n’est accepté. Les données et les droits restent validés par leurs contrôles d’origine.

## Captures à examiner

- [Thèmes, ordinateur 1366 × 768](captures/themes-en-es-1366.png)
- [Thèmes, ordinateur 1440 × 900](captures/themes-en-es-1440.png)
- [Fiche et commandes groupées, 1366 × 768](captures/initial-lesson-en-es-L1-1366.png)
- [Phrase espagnole L8 entière, 1366 × 768](captures/initial-lesson-fr-es-L8-1366.png)
- [Chinois avec Pinyin, 1366 × 768](captures/lesson-fr-zh-L1-1366.png)
- [Menu secondaire](captures/menu-1366.png), [réglage des voix](captures/voice-1366.png) et [compte dans le nouveau parcours](captures/account-1366.png)
- [Mobile anglais → espagnol](captures/mobile-unchanged-en-es-L1.png), [chinois avec Pinyin](captures/mobile-unchanged-fr-zh-L1.png) et [espagnol L8](captures/mobile-unchanged-fr-es-L8.png)

Le [résumé JSON](qa-summary.json) indique les comptes, limites et empreinte du test. Le [rapport complet](verification-browser.json) conserve les 26 cas et les empreintes des sources. Les originaux des vingt captures et du rapport restent aussi dans `/tmp/melunga-desktop-course-layout-browser/` et `/tmp/melunga-desktop-course-layout-browser.json`.

Les vues Menu, Voix et Compte sont prises après le contrôle du bouton Couleur ; leur fond correspond donc au choix effectué pendant ce scénario. Les captures principales de thèmes et de fiches montrent le fond pastel initial.

La liste des thèmes peut défiler dans sa propre zone ; les fiches, la barre haute et les commandes de leçon tiennent dans le viewport. La lecture vocale n’est pas évaluée à l’oreille : seuls son déclenchement, ses paramètres et son arrêt sont simulés. Aucune publication n’est incluse dans cette vérification.
