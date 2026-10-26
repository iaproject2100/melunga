# Thèmes L1–L10 — classement et enrichissement de l’offre

L’aperçu conserve l’architecture validée : niveau, thèmes illustrés et numérotés,
puis pratique en un clic sur mobile et ordinateur. Les quatre carrés ouvrent
le menu. La page `melunga_deploy/parcours-niveaux.html` reste un aperçu distinct
de l’application publiée sur melunga.com.


## Classement anglais appliqué sur une branche de revue distincte

Le [registre anglais](classement-fr-en/README.md), commit source `1bf76c7`,
applique 670 décisions : 610 déplacements, dont 127 changements de niveau,
37 mises en réserve et 23 maintiens. Textes, phonétique, lectures, niveaux
source d’accès et cartes classiques sont conservés. Le classement reste en
PR distincte, sans nouvelle fusion ou publication autorisée.

L’état courant de cette branche contient **32 755 cartes actives, 899 en réserve
et 1 637 thèmes visibles**, toujours 33 654 cartes canoniques. Trois nouveaux
thèmes ont trois cartes ; 22 autres rubriques passent aussi sous six concepts.
Les tailles réelles et sept rubriques de plus de 100 présentations sont signalées.
Les chiffres de densité des lots antérieurs ci-dessous décrivent leurs
snapshots, pas un maintien universel du seuil de six après ce registre.

## Commandes des leçons

Sur mobile et ordinateur, la phrase entière, la phonétique, le sens et les
commandes tiennent dans l’écran, sans défilement de la fiche. Les espacements
puis les tailles de texte s’adaptent à la place disponible lorsque c’est nécessaire ;
aucun texte n’est tronqué. Les listes de thèmes restent défilantes.

Le bouton **Pinyin**, directement sous la traduction chinoise, échange la
phonétique adaptée contre la lecture source et conserve le choix sur ce navigateur.
Pendant un rappel masqué, l’oreille révèle le modèle avant de permettre la bascule.

Sur mobile, les gestes reprennent les quatre directions de l’application :

- **Vers le haut** : mot ou phrase suivante.
- **Vers le bas** : mot ou phrase précédente.
- **Vers la gauche** : enregistrer dans **À revoir** et passer à la suite.
- **Vers la droite** : **Je connais**, retirer de la liste À revoir et passer à la suite.

La fiche suit le doigt, puis la suivante ou la précédente entre avec une brève
animation. Les gestes horizontaux affichent **« Elle reviendra »** à gauche et
**« Rangée »** à droite pendant 1,4 seconde. Le message n’intercepte aucun appui.
Les boutons, la sélection de texte et les gestes à plusieurs doigts ne classent
pas de carte ; le zoom à deux doigts reste possible.
Les répliques de l’interlocuteur restent réservées à l’écoute.

Le bouton **À revoir** remplace la réécoute de fond ; l’oreille sert toujours à
écouter. Les mots et phrases enregistrés se retrouvent dans **quatre carrés →
À revoir**, avec **Revoir** et **Retirer**. Les libellés en cache ne servent pas
à reconstruire une leçon : la reprise charge la véritable source et prépare la
forme avant son rappel. La liste est séparée par couple et reste enregistrée
localement sur le navigateur utilisé ; elle ne synchronise pas les comptes.
Les cartes restent accessibles dans leur thème.

[Contrôle des commandes et de l’affichage](verification-commandes-lecon-navigateur.md).

## Les dix-huit pistes deviennent du contenu de pratique

Les **18 propositions recensées chez les concurrents** sont déclinées dans
les sept couples : **126 rubriques supplémentaires**, avec **144 intentions
apprenant par couple**, des répliques d’interlocuteur et des soutiens lexicaux.
Elles s’ajoutent aux dix situations précédentes. Ensemble, les 28 situations
proposent 224 intentions par couple, soit 1 568 positions de pratique.

Cette extension apporte réellement **803 phrases apprenant rédigées**,
**53 mots rédigés** et **219 modèles reçus rédigés**.
Les autres positions utilisent des sources entières préexistantes : un réemploi,
un import ancien et une nouvelle rédaction sont comptés séparément.

| Niveau | Modules ajoutés par les dix-huit pistes |
|---|---|
| L1 | Première visite : entrer et prendre congé ; Comprendre : faire ralentir et répéter |
| L2 | Vêtements : choisir la bonne taille ; Santé : décrire une douleur simple ; En ville : trouver la gare ; Café : préciser une boisson |
| L3 | Loisirs : goûts et préférences ; Compte : retrouver son accès ; Cours : demander une aide précise ; Sport : parler de ses habitudes |
| L4 | Objets : raconter une perte et se faire aider ; Culture : raconter une sortie ; Logement : raconter une panne d’équipement |
| L5 | Rendez-vous : déplacer une réservation ; Connexion : résoudre un problème numérique |
| L8 | Réclamation : négocier avec tact ; Proches : préserver la relation en posant une limite |
| L9 | Débat : répondre à une objection |

Chaque module contient huit prises de parole entières au même niveau. Les mots
et nombres isolés restent dans leurs rubriques dédiées. Chaque réponse à produire
est comprise puis imitée avant sa mise en situation. Les questions et clôtures
reçues sont visibles, écoutables et marquées comme paroles de l’autre ; elles
ne sont jamais masquées ni comptées comme productions de l’apprenant.

Les **259 usages reçus** ont des rôles et des listes `answerWith` explicites.
Une question précède immédiatement le rappel de sa réponse préparée ; une clôture
suit la réponse et déclare `answerWith: []`. Le module d’argumentation ajoute
une objection et sa réponse. Les soutiens lexicaux ne sont pas des exercices
supplémentaires dans la leçon de phrases et ne gonflent pas ses huit positions.

## Comptage sans gonflement

| Périmètre | Entrées canoniques de pratique |
|---|---:|
| Catalogue historique intact | 32 115 |
| Anciennes conversations reprises avant les situations | 43 |
| Premier lot lexical/numérique rédigé | 140 |
| Anciennes conversations reprises dans les dix premières situations | 27 |
| Phrases rédigées des dix premières situations | 454 |
| Phrases apprenant rédigées par l’extension | 803 |
| Imports de conversation supplémentaires, apprenant | 15 |
| Nouveaux mots de soutien rédigés | 53 |
| Imports lexicaux supplémentaires | 4 |
| **Total de pratique dans l’aperçu** | **33 654** |

Les modèles réservés à l’écoute de l’interlocuteur sont à part : ils ne sont
ni ajoutés au total de production, ni utilisés pour gonfler le compteur de leçon.
Les copies de transport, révisions et références de contexte n’ajoutent aucune carte.

Avant le registre anglais, le total comprenait **32 792 entrées visibles**,
**862 réserves** et **1 636 thèmes**, tous d’au moins six concepts. Le registre
ci-dessus donne l’état courant : **32 755 visibles / 899 réserves / 1 637 thèmes**.
Les 25 petites rubriques sont explicites ; aucun thème non vide n’est retenu hors écran.

## Progression, cohérence et limites

Les dix-huit propositions sont reliées à leurs objectifs, huit intentions,
répliques reçues et soutiens dans la [matrice de couverture](enrichissement-situations/extension-pistes/matrice-couverture.md).
Les situations passent des formules utiles en L1 aux besoins pratiques, routines,
récits, résolutions de problèmes, réclamations et réponses à une objection.
Les formulations sont adaptées à chaque langue ; un changement de registre,
de temps ou de construction ne se déguise pas en simple mot remplacé.

Dans les anciennes rubriques, les révisions précèdent les nouveautés. Dans les
28 situations supplémentaires, l’ordre global suit **01→08 du plan**, sources
réemployées et nouvelles premières rencontres mêlées. Le réemploi ne suppose
pas que la personne connaisse déjà la phrase. Les prononciations sont rédigées
ou reprises entières ; elles ne sont pas fabriquées par collage.

Les soutiens sont aussi vérifiés par famille : les noms hérités d’un classement
« actions » par défaut sont réaffectés selon leur sens, sans retoucher leurs
champs source. « Le plan » au sens de carte géographique rejoint ainsi le voyage,
les climatiseurs la maison et les horaires les repères temporels.

Le contrôle additif compare aux fichiers du commit antérieur `30ef75b` :
**32 779 anciens tuples et sources** conservés, **700 premiers emplacements protégés**
et **70 thèmes de situation initiaux** inchangés.
Les **110 277 champs du catalogue original** restent identiques.

Ce contrôle automatique initial ne constituait pas une relecture individuelle :
il comptait alors **1 420 décisions explicites** et **30 695 placements source
non relus**. La lecture individuelle menée ensuite par Claude couvre désormais
les **70 cellules sur 70**, réserves et modèles reçus compris. Les propositions
de classement et les conventions encore ouvertes restent distinctes de cette
couverture ; ni lecture, ni densité, ni ordre prévu ne démontrent une acquisition
ou une progressivité globale déjà validée.

## Revue complète par Claude : thèmes, niveaux et phonétique

Le [lot 9 de Claude](reponse-revue-integrale-lot9/README.md) termine la lecture
individuelle : **70 cellules lues sur 70**, réserves et reçus compris. Il
raccorde **70 aides italiennes**, puis **34 gloses et trois blocs complets**
séparément. L’erratum EN71 du lot 8 a sa propre couche. Avec ce dernier,
107 IDs / 111 objets distincts portent 118 champs corrigés ; le chaînage de
1736 explique les 112 applications d’objet par couche. Les **280 propositions,
30 conventions et 96 contenus incertains** restent non appliqués. Le résumé
source en annonçait 93 ; le JSON en contient 96, toutes conservées à part.
[Rapport de vérification](verification-raccord-lot9.md).
[Inventaire des décisions encore ouvertes dans les sept couples](reponse-revue-integrale-lot9/decisions-restantes.md).

Le [lot 8 de Claude](reponse-revue-integrale-lot8/README.md) raccorde **63 aides
espagnoles entières**, puis **18 gloses, deux études et trois blocs complets**
séparément. Les 88 objets portent 92 champs corrigés, copies et reçu compris,
sans changer la présentation ni les droits. À la livraison du lot 8, Claude annonçait **60 cellules lues
sur 70** ; le lot 9 ci-dessus termine les dix cellules fr→it. Les **310 propositions et
151 conventions**, dont la jota, restent non appliquées.
[Rapport de vérification](verification-raccord-lot8.md).

Le [lot 7 de Claude](reponse-revue-integrale-lot7/README.md) raccorde **228 aides
anglaises entières**, avec les dix copies et trois reçus, puis **11 gloses et
cinq blocs complets** séparément. Les 254 objets portent 262 champs corrigés,
sans modifier la présentation ou les droits. À la livraison du lot 7, Claude annonçait **50 cellules
lues sur 70** ; le lot 8 ci-dessus porte cet avancement à soixante. Les **689
propositions et 30 conventions** restent non appliquées.
[Rapport de vérification](verification-raccord-lot7.md).

Le [lot 6 de Claude](reponse-revue-integrale-lot6/README.md) raccorde **18 aides
coréennes et cinq lectures liées**, puis **45 gloses et deux blocs complets**
dans un registre de contenu distinct. Les 65 objets portent 74 champs corrigés,
sans changement de présentation, placement ou accès. À la livraison du lot 6, Claude annonçait **40 cellules
lues sur 70** ; le lot 7 ci-dessus porte cet avancement à cinquante.
Les **447 propositions de classement et 260 conventions**, notamment le batchim,
restent non appliquées. [Rapport de vérification](verification-raccord-lot6.md).

Le [lot 5 de Claude](reponse-revue-integrale-lot5/README.md) raccorde **quatre
paires aide/lecture japonaises**, copie comprise, et **26 gloses** dans un
registre distinct. La réserve 3771 reste sans production. Les cinq mentions
de 日本語 sont rendues par japonais. Les errata des motifs et les stades du
lot 4 sont confirmés, sans changement de ses preuves figées. À la livraison du lot 5, Claude annonçait
**30 cellules lues sur 70** ; le lot 6 ci-dessus porte cet avancement à quarante. Les 604 propositions de classement et l’unique convention ne sont
pas appliquées. Les essais de conservation ne sont pas une validation
pédagogique globale de ces propositions.

Le [lot 4 de Claude](reponse-revue-integrale-lot4/README.md) raccorde **259 aides
entières pour sinophones** et, dans un registre distinct, **33 gloses et les
blocs atomiques 1900 et 757**, avec les rectifications `c849bf3` du lot 3.
La conservation des textes et sens admet désormais ces seules corrections de
contenu explicitement attestées ; les originaux restent vérifiables et le
catalogue classique reste intact. Les propositions de niveau/thème et les
conventions ne sont pas appliquées. À la livraison du lot 4, Claude annonçait **20 cellules
lues sur 70** (fr→zh et zh→fr).

Le [lot 3 de Claude](reponse-revue-integrale-lot3/README.md) ajoute une couche
durable de **90 aides entières et cinq lectures/Pinyin**, après la couche
précédente. Les sept suites après B conservent leurs annotations antérieures ;
les copies et les deux reçus zh→fr « les » sont traités ensemble. Les gloses,
propositions de classement et conventions restent des dossiers séparés.
À la livraison du lot 3, la couverture individuelle annoncée par Claude était
de **10 cellules sur 70** (tout fr→zh). Codex assure le raccord et
sa contre-vérification technique, sans reprendre en parallèle la mission
de lecture confiée à Claude.

Le [tour 2 de Claude](reponse-revue-integrale-tour2/README.md) est raccordé à
[la génération durable](corrections-phonetiques/README.md) : **774 événements
sur 772 cartes**, avec **14 copies de transport** mises à jour dans la même édition.
Les originaux restent vérifiables avant correction ; chaque aide modifiée reçoit
une annotation de provenance séparée. Les textes, lectures/Pinyin, niveaux, thèmes
et droits restent conservés. Au tour 2, la lecture individuelle annoncée couvrait **deux cellules
sur 70** ; le lot 3 ci-dessus porte cet avancement à dix.
Les treize propositions antérieures de doublement du `s`, jamais appliquées,
sont archivées. [Retour prêt pour Claude](reponse-revue-integrale-tour2/message-pour-claude.md).
La [contre-vérification du lot 1](reponse-revue-integrale-lot1/README.md) reste une trace datée des problèmes désormais corrigés par ce raccord.

La consigne de Kartech du **25 octobre 2026** remplace la restriction précédente
« phonétique uniquement » : Claude vérifie et corrige le classement, la progression
et les aides de toutes les cartes, anciennes et nouvelles. Codex assure
l’intégration et les contrôles techniques en conservant la présentation validée.

- [Mandat complet et message à transmettre](message-pour-claude.md).
- [Accès sans compte Melunga et liens vers tout le contenu, réserves comprises](acces-revue-integrale.md).

La revue vise 33 654 cartes et les modèles reçus, soit **33 874 identifiants distincts**.
Les consignes historiques de ce dossier restent des traces datées ; leur limitation
de rôle ne restreint pas le nouveau mandat.

La relecture de convention reçue à `295adf3` et sa réponse sont documentées dans
[le dossier de reprise phonétique](reponse-relecture-phonetique/README.md).
Ce dossier historique réconcilie les 334 copies sans statut et les 1 668 nouvelles
entrées et conserve les propositions de la première passe. Les 17 aides « les »
sont maintenant couvertes par le registre intégré ; les autres propositions
restent distinctes, et les treize espagnoles `s→ss` sont archivées.
[Message de réponse à transmettre à Claude](reponse-relecture-phonetique/message-pour-claude.md).

- [Tableau des formes entières de situations, répliques reçues et nouveaux soutiens](enrichissement-situations/nouvelles-phrases-a-relire.md).
- [139 aides nouvelles du premier lot lexical et une aide entière reprise](corrections-themes/enrichissements-rediges.md).
- [Message prêt pour Claude](message-pour-claude.md).

Le lot d’enrichissement comprend **1 668 aides entières nouvelles**. Le nouveau
mandat couvre aussi les aides anciennes ; ce nombre ne limite plus la revue.
La passe de convention reçue et les propositions de correction ne valent pas
validation du naturel de chaque aide.
La conservation d’une aide ancienne ne prouve pas sa conformité à la méthode.
Pour zh→fr, les aides restent destinées au lecteur sinophone et écrites en caractères.

## Sources et contrôles

Les idées viennent de 13 pages officielles Babbel, Busuu, Duolingo, Memrise et
Pimsleur. Le dossier relie URL, idée observée et adaptation originale ; il ne
recopie pas leurs cours et ne prétend pas comparer leur efficacité pédagogique.

- [Extension des dix-huit pistes](enrichissement-situations/extension-pistes/README.md),
  [contrat reçus et soutiens](enrichissement-situations/extension-pistes/CONTRAT.md).
- [Dix premières situations](enrichissement-situations/README.md),
  [traçabilité initiale](enrichissement-situations/tracabilite-sources.json).
- [Compte rendu chiffré](classement.md), [contrôle indépendant](verification-independante.md)
  et [contrôle navigateur](verification-navigateur.md), liés aux fichiers exacts contrôlés.

Les niveaux éditoriaux n’écrivent jamais le `lv` original. `isFreeCard` teste
`lv === 1` : modifier ce champ déplacerait la frontière gratuit/payant.
Les **2 134 identités source L1**, prix, abonnements et droits de production
restent inchangés. Aucune fusion ni publication sur melunga.com n’est autorisée
par ce dossier. Les tests navigateur sont locaux avec tailles d’écran simulées,
pas un téléphone physique ni un parcours joué sur Netlify.

## Reproduire

```sh
python3 -B tools/maquette-guidee/inventory_levels.py --check
python3 -B tools/maquette-guidee/build_visuals.py --check
python3 -B tools/maquette-guidee/check_authored_enrichments.py
python3 -B tools/maquette-guidee/build_number_progression.py --check
python3 -B tools/maquette-guidee/prepare_situation_catalogue.py --check
python3 -B tools/maquette-guidee/render_situation_review.py --check
python3 -B tools/maquette-guidee/build_levels.py --check
python3 -B tools/maquette-guidee/check_levels_independent.py --check-report --require-visuals --strict-editorial --require-no-held --self-test
NODE_PATH=/tmp/melunga-review-tools/node_modules node --test melunga_deploy/tests/levels-themes.browser.cjs
NODE_PATH=/tmp/melunga-review-tools/node_modules node --test melunga_deploy/tests/guided-lesson-controls.browser.cjs
```

Le chemin Playwright correspond à cet environnement ; ailleurs installer
`playwright-core` et fournir `CHROMIUM_PATH` si nécessaire.

Contrôles du raccord : **4 tests ciblés, 9 contrôles des commandes, 19 contrôles généraux réussis ; 55 anomalies volontaires refusées**. [Rapport et limites](verification-raccord-phonetique.md).

Validation du lot 3 : **5 tests ciblés et 4 historiques, 9 commandes et 19 contrôles généraux réussis ; 69 contre-épreuves Python refusées**. [Rapport et limites](verification-raccord-lot3.md).

Validation du lot 4 et du contenu distinct : **6 tests ciblés + 9 historiques, 9 commandes et 19 contrôles généraux réussis ; 93 contre-épreuves Python refusées**. [Rapport et limites](verification-raccord-lot4.md).

Validation du lot 5 : **5 tests ciblés + 15 historiques, 9 commandes et 19 contrôles généraux réussis ; 111 contre-épreuves Python refusées**. [Rapport et limites](verification-raccord-lot5.md).

Validation du lot 6 : **6 tests ciblés + 20 historiques, 9 commandes et 19 contrôles généraux réussis ; 131 contre-épreuves Python refusées**. [Rapport et limites](verification-raccord-lot6.md).

Validation du lot 7 : **6 tests ciblés + 26 historiques, 9 commandes et 19 contrôles généraux réussis ; 151 contre-épreuves Python refusées**. [Rapport et limites](verification-raccord-lot7.md).

Validation du lot 8 : **6 tests ciblés + 32 historiques, 9 commandes et 19 contrôles généraux réussis ; 171 contre-épreuves Python refusées**. [Rapport et limites](verification-raccord-lot8.md).

Validation du lot 9 : **6 tests ciblés + 38 historiques, 9 commandes et 19 contrôles généraux réussis ; 196 contre-épreuves Python refusées**. [Rapport et limites](verification-raccord-lot9.md).

Classement anglais : **80 essais locaux réussis et 36 contre-épreuves du registre refusées**. [Preuves et limites](classement-fr-en/verification.md).
