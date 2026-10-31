# Russe, portugais du Brésil, arabe et hindi : langues de l’application

Cette version active les quatre langues dans les menus web et les significations des leçons, sur ordinateur et navigateur mobile. L’ordre demandé et les drapeaux CSS sont conservés ; l’arabe utilise le badge vert « ع ». Le choix de la langue à apprendre tient sur un seul écran d’ordinateur en quatre colonnes et trois rangées, dans les fenêtres testées de 960 × 600 à 1834 × 854. Le mobile garde sa disposition.

## Sources et couverture

Le fichier exact fourni par Claude est [native-meanings-ru-pt-ar-hi-v1.json](../../tools/maquette-guidee/imports/native-meanings-ru-pt-ar-hi-v1.json), SHA-256 `9be14824ddde403c10bdf13752afecdae09aa6b78da8cc32c142579baccf352f`. Les 29 077 concepts comportent 116 308 valeurs dans les quatre langues. Les identifiants, références, textes anglais/français, candidats et autres métadonnées sont identiques au fichier d’entrée. Les marqueurs de genre et de registre sont conservés. Le statut historique du fichier reçu n’a pas été réécrit ; le manifeste runtime décrit séparément son utilisation.

Quatre tables de significations sont exportées et vérifiées par empreinte. Elles ajoutent 44 parcours à 11 langues cibles chacun, soit 128 directions disponibles au total pour 12 langues d’application et 12 langues étudiées. Les quatre anciennes directions allemand → hindi/russe/portugais/arabe restent indisponibles, car cette livraison ne fournit pas leurs significations allemandes. Les modes natifs classiques gardent leurs restrictions existantes ; cette activation concerne les parcours web modernes.

Aucune des 54 583 cartes étudiées, des 12 banques, des 84 politiques d’accès antérieures, des groupes d’éligibilité ou des droits gratuits n’a changé. Le catalogue conserve 52 994 cartes actives et 1 589 réserves. Les cartes restent identifiées par langue étudiée + index source. Les nouvelles significations ne sont jamais utilisées comme valeurs de remplacement dans une autre langue.

Les aides de prononciation ne sont pas fabriquées : les nouvelles langues d’application réutilisent le guide anglais ou le pinyin de la carte quand un guide adapté n’existe pas. Ce mode est identifié dans les modèles et l’aide de l’interface ; les textes de présentation des nouveaux parcours ne promettent pas une notation adaptée qui n’a pas été fournie.

## Contrôles

- Contrôle structurel complet de la livraison, avec comparaison des références et des index. Sondage de contenu sur les significations et les propositions thématiques ; aucune relecture par un locuteur natif n’est prétendue.
- 440 projections langue/niveau ajoutées : signification exacte, texte et guide source inchangés, index et droits conservés. Une table altérée est refusée sans repli vers une autre langue.
- Régressions des 77 directions préexistantes, 49 projections historiques, 280 niveaux des langues importées, 143 989 modèles classiques, droits serveur stricts et compte allemand.
- Parcours réels dans les tests Chromium : choix de langue et entrée dans la leçon pour les quatre langues aux deux tailles d’écran ; écoute, vitesse, révisions, progression après rechargement, compte traduit, L2 verrouillé sans abonnement et retour au même parcours/niveau.
- Contrôles de l’accueil, des huit anciennes interfaces, de la grille sans défilement dans huit combinaisons de taille/langue et des sources historiques. Syntaxe de 19 blocs/fichiers JS, compilateurs en --check, export déterministe et git diff --check conformes.

Les anciens tests qui traitaient `ar-fr` comme invalide ont été actualisés : ce parcours est désormais fourni. Les cas négatifs utilisent des couples identiques ou inconnus ; les contrôles de droits n’ont pas été relâchés. Les comptes, paiements, API et audio des essais sont fictifs et locaux. Les rapports détaillés sont joints dans ce dossier.

## Audit des thèmes : livraison indépendante, intégration à poursuivre

[Les trois lots reçus](../livraison-claude-2026-10-31/) couvrent 120 cellules langue × niveau, avec 10 343 déplacements proposés, 4 582 cas incertains et 775 destinations absentes. Les identités, textes, niveaux, thèmes actuels, destinations proposées, sections et comptes avant/après correspondent aux banques actuelles ; les 18 exemples du premier diagnostic sont retrouvés.

**Cette publication des langues de l’application n’applique aucun déplacement thématique.** Les cas incertains, créations, fusions et renommages ne sont pas acceptés automatiquement. Le travail de classement par domaine et la vérification de la progression après déplacement restent distincts.

## Aperçus

- [Toutes les langues sur ordinateur](choix-langues-ordinateur.png)
- [Petite fenêtre, interface russe](choix-langues-petite-fenetre.png)
- [Leçon avec signification arabe sur mobile](lecon-arabe-mobile.png)
- [Leçon avec signification hindi sur ordinateur](lecon-hindi-ordinateur.png)

Le dépôt contient les changements validés localement. Le résultat du déploiement Netlify et les réponses Google TTS réelles ne sont pas confirmés dans ces tests.
