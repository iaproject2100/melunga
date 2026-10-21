# Pilotes locaux de progression

Maquette de relecture pour les deux parcours fournis par `data.js` : français → chinois (envie de repos ou de retour) et français → coréen (demande de café ou d’eau). Elle n’est reliée ni au site publié ni à l’application installée.

Depuis ce dossier, lancer par exemple `python -m http.server 8765 --bind 127.0.0.1`, puis ouvrir `http://localhost:8765/`. `index.html`, `style.css`, `app.js` et `data.js` doivent rester ensemble. Pour transmettre une présentation en un seul fichier, `Melunga-essais-progression.html` embarque les styles, les données et l'interface. Les phrases proviennent exclusivement de `window.ProgressionPilotData` ; aucune phrase étudiée n’est produite ou assemblée par l’interface. Les références détaillées et les valeurs brutes canoniques sont conservées dans `sources.json`, avec les amendements locaux décrits dans `editorial-amendments.json`. Le générateur `prepare.py` les distingue des valeurs proposées pour l'affichage.

## Parcours et aide

- Choisir le pilote chinois ou coréen ; utiliser **Suivant** et **Retour** pour parcourir les étapes manuellement. La dernière étape ne certifie aucun acquis et ne débloque rien.
- Chaque pilote comporte huit étapes : comprendre, imiter, préparer le remplacement, remplacer, comprendre la question, comprendre la clôture, écouter l'échange entier, puis essayer sans modèle. La question et la clôture sont présentées avant leur reprise dans l'échange à trois tours.
- Les phrases, leurs aides phonétiques et leurs traductions apparaissent d’abord entièrement. Les répliques d’un dialogue gardent l’ordre et les rôles des données.
- Le badge **À comprendre** distingue les répliques reçues : elles servent à écouter et à comprendre le sens, sans demander de les produire. Elles restent visibles lors du rappel de la réponse de l’apprenant.
- Quand une étape fournit `focusBrick`, la phrase complète reste au premier plan. Une petite zone **Appui**, sous cette phrase, reprend le groupe source avec son sens et sa phonétique ; elle ne crée ni phrase ni transcription par collage. L’appui est retiré du DOM dès que le modèle est masqué.
- Aux étapes prévues pour le rappel, **Essayer sans modèle** retire réellement du DOM la phrase étudiée, sa phonétique et sa lecture pour le rôle de l’apprenant. L’intention française et les répliques de l’interlocuteur restent visibles. **Réafficher l’aide** restaure le modèle, sans lancer automatiquement l’audio.
- Les choix d’intention remplacent la réplique de l’apprenant par une phrase source complète. Ils conservent le modèle masqué si cet essai est actif. Changer d’étape ou de pilote remet le modèle visible.
- Les détails éditoriaux de progression sont repliés sous **Détail pour Claude** et retirés pendant le rappel, car ils peuvent eux-mêmes citer des éléments étudiés.
- Une aide ou traduction proposée pour cet essai porte sa note éditoriale sous la phrase concernée. L’interface affiche le texte de `editorialNote` et ne réécrit aucune valeur. Les données brutes canoniques et les amendements locaux restent distingués dans la provenance ; ces propositions ne sont pas harmonisées dans les sources applicatives. Toutes ces notes sont retirées du DOM pendant le rappel, quel que soit le rôle.

## Écoute et limites

L’oreille est un bouton d’au moins 44 px, placé près de la phonétique. Elle prononce le texte étudié exact de l’élément choisi : la phrase complète, ou le groupe complet dans la zone **Appui**, avec la synthèse vocale du navigateur, en `zh-CN` ou `ko-KR` selon `pair.study`. Aucune oreille n’est créée pour une réponse apprenant ou un appui masqués ; il faut d’abord réafficher l’aide. Le changement d’intention, d’étape, de pilote ou d’aide interrompt la lecture en cours.

La disponibilité et la qualité des voix dépendent de l’appareil. La maquette ne mesure ni prononciation, ni maîtrise, ni efficacité pédagogique. Elle n’émet aucun appel réseau applicatif : seulement les fichiers statiques locaux et, à la demande, l’audio du système. Elle ne lit ni n’écrit aucun stockage et n’inclut ni statistiques, compte ou paiement.

Le document entier peut défiler, y compris sur un écran de 320 px : aucun contenu long n’est coupé dans une carte fixe. Les boutons utilisent le clavier natif ; les choix signalent leur état par `aria-pressed`. Le texte étudié porte la langue du couple et reste identique aux données.

La validation du contenu et la revue avec Claude restent nécessaires avant toute éventuelle intégration au produit. Aucun fichier de production n’est modifié par cette maquette.

## Vérification du 21 octobre 2026

`python3 prepare.py --check` vérifie les dix références sources des deux pilotes, réparties sur seize étapes, et la fidélité de l'export autonome. Ces références comprennent huit phrases complètes et deux appuis : **回家** accompagne la phrase entière **我想回家**, et **물** accompagne **물 주세요.** Aucun appui ne devient une phrase principale autonome. `python3 prepare.py` régénère seulement les fichiers documentaires `data.js`, `sources.json` et `Melunga-essais-progression.html` ; il ne modifie jamais les sources applicatives.

Les seize étapes ont été vérifiées dans Chromium à 320×568, 390×844 et 1440×900, pour la version avec fichiers séparés et l'export autonome : phrases et aides principales entières, appuis secondaires distincts, badge **À comprendre** sur toutes les répliques reçues, question–réponse–clôture dans les deux échanges, oreille d'au moins 44 px, choix d'intention, modèle retiré du DOM au rappel, restauration de l'aide, clavier et absence de débordement horizontal. Les comparaisons portent sur les valeurs d'affichage de `data.js`, y compris les trois propositions locales signalées ; elles ne prétendent pas que ces propositions sont identiques aux aides ou traductions brutes. Un contrôle séparé relie les 32 occurrences affichables aux dix références et vérifie la séparation entre valeurs brutes et amendements. Un cas ajouté uniquement en mémoire vérifie également qu'un appui fourni à une étape de rappel disparaît avec le modèle. Toutes les notes de proposition sont absentes du DOM pendant le rappel. Aucun appel externe, écriture de droits/stockage ni erreur JavaScript n'a été observé. L'audio a été simulé pour contrôler séparément le texte complet de la phrase et celui du groupe ainsi que la langue transmis ; sa qualité réelle reste à écouter.

L'export autonome est vérifié via HTTP local. L'ouverture directe `file://` est bloquée par la politique du navigateur de cet environnement et n'a pas été validée. Le masquage concerne l'affichage et le DOM courant : les données restent dans le fichier et en mémoire, comme avec les scripts externes ; ce n'est pas une protection de contenu.

Les captures et le rapport de navigateur sont joints dans `captures/` et `verification-navigateur.json`. Ces vérifications ne mesurent ni compréhension ni efficacité pédagogique et ne remplacent pas la relecture de Claude.

## Annexes de réception

Les deux fichiers `received-fr-zh.json` et `received-fr-ko.json` précisent le [contrat d'essai](contrat-received-essai.md) : compréhension globale, réponses exactes préparées et clôture sans production imposée. Ils restent hors du chargeur et des 110 fichiers conversation. `prepare.py --check` les valide aussi avant l'export. Les **33 tests** de `python3 -B test_received_contract.py` couvrent les références cassées, les choix d'une autre langue, l'ordre des réponses et un vrai dialogue où l'apprenant est B. Ces contrôles éditoriaux ne prouvent pas qu'une personne a appris les prérequis.

## Dernière relecture : 113b247

Les deux pilotes montrent chacun huit passages dans le même ordre et un cycle complet question/réponse/clôture. Voir [la réponse détaillée](../reponse-relecture-113b247.md). Les références originales restent dans `sources.json.original`, la présentation dans `expected`. Trois propositions locales (phonétique de 休, français des deux demandes coréennes) sont identifiées dans `editorial-amendments.json` et à l’écran ; elles ne modifient pas les sources. L’inventaire `mesure-notations-zh.json` est reproduit par `python3 -B measure_notations.py`, sans aucun remplacement. Les corrections des JSON restent en attente de décision.
