# Registre anglais : application durable et bornée

La pièce `registre-classement.json` est copiée **octet pour octet** depuis
`1bf76c72f58e2ffe37e27d2b137a1ebe350e097f`, dossier
`docs/revue-integrale/classement-fr-en/`. Son SHA-256 est
`a605a44eb886e598014dab0ed4b1000c819060ad4dcf83f939fd70c9a4dc020a`.
Les deux pièces `preuve-README.md` et `preuve-message-pour-codex.md` gardent
les textes de Claude tels que livrés ; le présent contrat décrit l’application.

Le générateur applique cette couche **après les couches de corrections
phonétiques et de contenu existantes**. Les 78 fichiers d’entrée sont liés au
snapshot approuvé `13f42b5814f2b230d76d2d0ef267dcf406c523c2`. Les 670
`expectedBefore` sont vérifiés tous ensemble avant le premier déplacement.
Un emplacement, texte étudié, identifiant ou octet inattendu fait échouer
l’application : il n’est jamais recherché approximativement ailleurs.

## Ce qui est modifié

- 610 déplacements, dont 127 changements de **niveau éditorial** ;
- 37 passages en réserve, sans suppression ni production de ces cartes ;
- 23 maintiens, sans annotation ni changement de carte ;
- trois nouveaux thèmes de trois cartes chacun, un titre renommé ;
- pointeurs, comptes et déroulés dépendant de ces placements.

Les 4 704 identités canoniques anglaises restent présentes : **4 542 actives
et 162 en réserve**, contre 4 579 et 125 avant. Les 647 cartes effectivement
déplacées ou réservées portent l’annotation `englishClassification`. L’ordre
reste celui des cartes survivantes de chaque thème, puis celui des entrants
dans le registre. Les nouveaux thèmes sont insérés avant la première rubrique
lexicale du niveau ; l’ordre relatif des anciennes rubriques est conservé.
Les deux thèmes sans aucune présentation (`L9-repas`, `L9-reperes`) quittent
la grille et gardent leurs métadonnées dans `retiredThemes`.

Les seuls champs de carte changés sont `editorialLevel`, les clés
`placement.domain`, `placement.themeId`, `placement.section`, et la nouvelle
annotation. Le texte étudié, le sens, l’aide entière, la lecture, le type,
la classe lexicale, la source et toutes les anciennes corrections restent
conservés. Les décisions et raisons initiales de placement restent des
métadonnées historiques ; la nouvelle annotation indique l’édition qui les
supplante pour l’emplacement courant.

## Mélanges et petits thèmes signalés

Le registre envoie **151 cartes** dans une rubrique dont le type initial est
différent. Les cartes ne sont pas réétiquetées : **25 thèmes** sont marqués
`mixed`, avec leurs types et identifiants précis. Neuf classes lexicales source
ne correspondent pas à l’étiquette adverbes de leur destination ; elles sont
conservées et signalées par neuf exceptions finies.

Les trois nouveaux thèmes et 22 anciens thèmes ont moins de six présentations
ou concepts : **25 exceptions finies**, avec leurs effectifs réels. Ils
restent visibles dans cette PR, sans rembourrage ni phrase inventée. Le seuil
de suivi des grands thèmes est de **100 présentations** : il sert au compte
rendu, sans déplacement ou fractionnement automatique et sans prétendre
mesurer la difficulté pédagogique.

## Révisions et interlocuteur

Les révisions devenues futures ou hors famille/type sont retirées : **22
références retirées**, quatre mises à jour et un pointeur de soutien lexical
mis à jour. Les 244 copies de transport conservent leurs identités et suivent
leur carte canonique ; une copie inutilisée ne crée pas une présentation.

Les 29 cartes ajoutées aux 13 situations existantes viennent **après** les huit
intentions et les étapes de réception d’origine, qui restent intactes. Elles
n’inventent pas de neuvième intention ni de réplique reçue. Les groupes internes
restent limités à cinq et le thème se pratique en un seul clic.

`catalogue:en:748` passe en réserve comme production au niveau canonique **3**.
Sa copie d’interlocuteur, entendue dès le niveau **2**, reste disponible en
compréhension seule. Son `canonicalLocation` est remplacé par
`canonicalReserveLocation: {pairId: "fr-en", level: 3, themeId: null}` ; aucun
autre champ de ce modèle reçu n’est changé.

## Contrôles et droits

La génération vérifie l’empreinte du registre et du registre de visuels distinct,
les sources d’entrée, les champs préservés et les empreintes de sortie figées.
Une deuxième application sur l’édition exacte est sans effet ; un après modifié
est refusé. Le mode historique `include_situations=False` conserve ses anciennes
sorties sans application de ce classement.

Les contrôles indépendants et navigateur sont décrits dans le compte rendu de
la PR. Ces mécanismes vérifient la traçabilité, sans prouver l’acquisition ou
une progression pédagogique déjà validée de chaque apprenant.

Aucun changement du `lv` source, des prix, des abonnements, du gratuit ou du
catalogue classique de 32 115 cartes. Aucune fusion dans `main` ni publication
sur melunga.com sans nouvel accord de Kartech.
