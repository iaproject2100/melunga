# Pilotes locaux de progression

Maquette de relecture pour les deux parcours fournis par `data.js` : français → chinois (envie de repos ou de retour) et français → coréen (demande de café ou d’eau). Elle n’est reliée ni au site publié ni à l’application installée.

Depuis ce dossier, lancer par exemple `python -m http.server 8765 --bind 127.0.0.1`, puis ouvrir `http://localhost:8765/`. `index.html`, `style.css`, `app.js` et `data.js` doivent rester ensemble. Pour transmettre une présentation en un seul fichier, `Melunga-essais-progression.html` embarque les styles, les données et l'interface. Les phrases proviennent exclusivement de `window.ProgressionPilotData` ; aucune phrase étudiée n’est produite ou assemblée par l’interface. Les références détaillées sont conservées dans `sources.json` et par le générateur `prepare.py`, fournis séparément.

## Parcours et aide

- Choisir le pilote chinois ou coréen ; utiliser **Suivant** et **Retour** pour parcourir les étapes manuellement. La dernière étape ne certifie aucun acquis et ne débloque rien.
- Les phrases, leurs aides phonétiques et leurs traductions apparaissent d’abord entièrement. Les répliques d’un dialogue gardent l’ordre et les rôles des données.
- Aux étapes prévues pour le rappel, **Essayer sans modèle** retire réellement du DOM la phrase étudiée, sa phonétique et sa lecture pour le rôle de l’apprenant. L’intention française et les répliques de l’interlocuteur restent visibles. **Réafficher l’aide** restaure le modèle, sans lancer automatiquement l’audio.
- Les choix d’intention remplacent la réplique de l’apprenant par une phrase source complète. Ils conservent le modèle masqué si cet essai est actif. Changer d’étape ou de pilote remet le modèle visible.
- Les notes éditoriales sont repliées sous **Détail pour Claude** et retirées pendant le rappel, car elles peuvent elles-mêmes citer des éléments étudiés.

## Écoute et limites

L’oreille est un bouton d’au moins 44 px, placé près de la phonétique. Elle prononce uniquement la phrase étudiée complète avec la synthèse vocale du navigateur, en `zh-CN` ou `ko-KR` selon `pair.study`. Aucune oreille n’est créée pour une réponse apprenant masquée ; il faut d’abord réafficher l’aide. Le changement d’intention, d’étape, de pilote ou d’aide interrompt la lecture en cours.

La disponibilité et la qualité des voix dépendent de l’appareil. La maquette ne mesure ni prononciation, ni maîtrise, ni efficacité pédagogique. Elle n’émet aucun appel réseau applicatif : seulement les fichiers statiques locaux et, à la demande, l’audio du système. Elle ne lit ni n’écrit aucun stockage et n’inclut ni statistiques, compte ou paiement.

Le document entier peut défiler, y compris sur un écran de 320 px : aucun contenu long n’est coupé dans une carte fixe. Les boutons utilisent le clavier natif ; les choix signalent leur état par `aria-pressed`. Le texte étudié porte la langue du couple et reste identique aux données.

La validation du contenu et la revue avec Claude restent nécessaires avant toute éventuelle intégration au produit. Aucun fichier de production n’est modifié par cette maquette.

## Vérification du 21 octobre 2026

`python3 prepare.py --check` vérifie les sept références sources des deux pilotes (treize étapes) et la fidélité de l'export autonome. `python3 prepare.py` régénère seulement les fichiers documentaires `data.js`, `sources.json` et `Melunga-essais-progression.html` ; il ne modifie jamais les sources applicatives.

Les treize étapes ont été vérifiées dans Chromium à 320×568, 390×844 et 1440×900 : aides entières, oreille d'au moins 44 px, choix d'intention, modèle retiré du DOM au rappel, restauration de l'aide, clavier et absence de débordement horizontal. Aucun appel externe, écriture de droits/stockage ni erreur JavaScript n'a été observé. L'audio a été simulé pour contrôler le texte et la langue transmis ; sa qualité réelle reste à écouter.

L'export autonome est vérifié via HTTP local. L'ouverture directe `file://` est bloquée par la politique du navigateur de cet environnement et n'a pas été validée. Le masquage concerne l'affichage et le DOM courant : les données restent dans le fichier et en mémoire, comme avec les scripts externes ; ce n'est pas une protection de contenu.

Les captures et le rapport de navigateur sont joints dans `captures/` et `verification-navigateur.json`. Ces vérifications ne mesurent ni compréhension ni efficacité pédagogique et ne remplacent pas la relecture de Claude.

## Vérifications de l’interface

Les 13 étapes ont été parcourues dans Chromium aux formats 320 × 568, 390 × 844 et 1440 × 900 : textes et aides identiques aux données, absence de réponse apprenant dans le DOM pendant le rappel, choix d’intention conservant le masquage, retour au modèle visible en changeant d’étape, commandes clavier et absence de débordement horizontal. Les oreilles mesurent au moins 44 px.

La synthèse vocale a été simulée pour vérifier le texte complet et la langue transmis ; cela ne constitue pas un essai de voix sur téléphone. Ces contrôles d’interface ne valident ni la justesse linguistique des sources ni l’efficacité de la progression proposée.
