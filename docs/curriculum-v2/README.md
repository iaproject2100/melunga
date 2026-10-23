# Parcours progressif complet — candidat à essayer

Ce lot répond à la reprise de Kartech : une entrée réellement débutante dans les sept couples, des leçons progressives dans l’application, et une recherche effective des pratiques concurrentes. **Candidat éditorial et technique ; aucune fusion ni publication de production autorisée par ce dossier.**

## Ouvrir le résultat

- `parcours-preview.html` : atelier de relecture des sept couples et des dix niveaux, sans compte. Il utilise le même joueur et les mêmes données que l’application. Tous les niveaux sont ouverts dans cet atelier séparé ; il n’écrit aucun droit d’accès.
- `app.html?start=1&lang=fr&study=zh` : essai dans la véritable interface mobile/ordinateur. « Parcours guidé » et les boutons L1–L10 ouvrent désormais les nouvelles leçons pour les sept couples actifs. Les autres couples ne sont pas activés.
- « Bibliothèque · cartes » : catalogue classique. « Bibliothèque gratuite », dans le parcours : les onze anciennes unités L1 complètes de la langue, gratuites même lorsqu’elles sont différées pédagogiquement.

L’atelier utilise la synthèse vocale du navigateur ; l’application conserve son moteur audio et ses voix existantes. Les contrôles locaux ne prouvent pas la disponibilité d’une voix distante.

## Le changement concret

**L1 a le même ordre de capacités dans les sept couples** : saluer, donner son prénom, signaler une incompréhension, faire répéter, commander une boisson, changer de boisson, comprendre une offre/refuser, demander le prix, jouer l’échange au café. Chaque phrase est préparée entière avant un choix ; la phrase et sa phonétique ne sont jamais fabriquées depuis un modèle à trous.

Pour le chinois, le devis final, le tableau des tailles et les autres phrases de l’ancien guidé ne font plus partie de l’entrée débutante. Le coréen dispose désormais d’un parcours aux dix niveaux, là où l’ancien système de familles n’en avait aucun.

Les **77 anciennes unités L1** sont différées selon leurs constructions : 48 en L2, 28 en L3, une en L4. Ce choix est un amendement éditorial **nouveau**, qui n’a pas encore reçu la validation de Claude. Il ne faut pas présenter la validation de l’ancien reclassement comme celle de cet amendement. Les raisons, ordres et blocs de variantes sont dans [placements-entree-v2.json](../progression-corrections/reprise-globale/placements-entree-v2.json).

Les **841 unités / 3 364 variantes** de la proposition précédente sont présentes dans le joueur. Quatorze premières phrases entières sur le logement et le travail introduisent ces fonctions en L2 dans les sept couples ; leurs familles plus riches gardent ensuite leur placement précédent. Une première phrase ne prépare pas les quatre variantes d’une famille.

Total du candidat : **918 leçons, 8 307 étapes** — 841 unités, 63 microleçons d’entrée et 14 premières expositions. Ce sont des étapes de pratique, pas 8 307 acquis ni 918 situations nouvelles.

Les répliques reçues restent à comprendre, visibles même pendant le rappel. L’oreille reste accessible et révèle explicitement le modèle avant de le lire. Les clics et la navigation ne produisent aucune note, validation de maîtrise ou écriture dans les révisions classiques.

## Ce qui est conservé

- **11 488 champs** des 3 364 variantes copiés exactement depuis les sources figées ; les sélections L1 et les trois soutiens espagnols sont également vérifiés contre leur origine.
- Texte étudié, traduction, phonétique et lecture conservés ; aucune harmonisation chinoise silencieuse, aucune concaténation d’aide de prononciation.
- Les lignes `DECKS` et `PEDAGOGY_FAMILIES` de l’application restent identiques à la base `50a2891` ; les **32 115 cartes classiques ne sont pas individuellement reclassées par ce lot**. Le nouveau cours remplace l’entrée guidée, le catalogue reste une réserve distincte.
- Accès gratuit historique par couple préservé, y compris les anciennes cartes guidées de niveau source supérieur : fr→en 342, fr→es 300, fr→it 347, fr→zh 331, fr→ja 305, fr→ko 284, zh→fr 309. Ces nombres désignent des droits de cartes ; une carte déjà rangée dans « Je connais » reste dans cette rubrique.
- Les 308 variantes des anciennes unités L1 restent disponibles gratuitement dans la bibliothèque du cours. Aucun prix ni abonnement n’est modifié. Le cours complet L2–L10 continue de demander l’accès existant, y compris lors d’appels directs au joueur.
- Les sept scènes café déjà activées sur instruction de Kartech restent un lot identifiable, sans changement de leur contenu ni de leur politique d’activation.

## Pourquoi des différences entre langues subsistent

Le **but communicatif** et le degré d’autonomie doivent progresser ensemble. La grammaire nécessaire pour atteindre ce but varie : une forme coréenne peut changer avec la dernière consonne du nom, alors que le chinois peut conserver son cadre. Forcer la même mécanique grammaticale créerait de fausses substitutions. Les premières capacités sont donc communes, les formes sont préparées langue par langue.

La grille des dix niveaux et les 70 cases est décrite dans [cadre-commun.md](reprise-globale/cadre-commun.md). Le classement reste une proposition de préparation : il ne mesure pas ce que la personne sait déjà.

## Recherche et enrichissement

Six sources officielles ont réellement été consultées : Duolingo, Busuu, Babbel, Pimsleur, Memrise et HelloChinese. [Le rapport](reprise-globale/concurrents.md) fournit URL, date, portée et limites. L’article Duolingo est historique ; les parcours connectés de ces applications n’ont pas été joués. Aucune efficacité comparative n’est déduite d’une page commerciale.

Les principes retenus sont appliqués dans ce candidat : petits objectifs, phrases entières, choix après préparation, rappel réversible et réussite d’un échange. Les thèmes ne sont pas copiés depuis un cours concurrent.

[La banque thématique](reprise-globale/enrichissement-thematique.md) examine douze situations modernes dans les sept couples : 23 échanges existants, huit échanges voisins, 46 ensembles partiels et sept manques. Elle référence 362 énoncés entiers et 32 dialogues ; 1 455 champs ont été comparés aux sources. **Cette banque n’est pas encore un ensemble de nouvelles leçons activées.** Retrait de commande et livraison manquée demandent encore du contenu ou des correspondances adéquates.

## Limites à faire relire

1. Les neuf microleçons communes, le déplacement des 77 anciennes unités L1 et les quatorze premières expositions sont à relire ensemble. Il faut juger les phrases vues par l’apprenant, pas uniquement une moyenne de longueur.
2. Les 341 réserves du plan source restent ouvertes. Trente anciens liens qui auraient pointé vers une famille désormais ultérieure ont été retirés des prérequis effectifs et consignés dans l’annexe ; ils ne sont pas réputés résolus.
3. Les 210 dialogues du corpus conversation, hors scène café préparée, ne sont pas tous câblés au cours. Leur préparation lexicale reste à compléter. Les ajouter avec masquage automatique ferait produire des répliques non préparées.
4. Le déficit lexical italien L8, le registre de `L1-03` japonais/coréen et les conventions phonétiques chinoises restent des dossiers distincts. Les sources actuelles sont conservées.
5. Les essais techniques ne valident ni le naturel de toutes les phrases, ni l’intonation, ni l’acquisition. Aucun label CECR n’est attribué par ces contrôles.
6. Les tests navigateur locaux et la vérification des fichiers servis doivent être distingués d’un parcours réel sur téléphone dans l’aperçu hébergé. Le compte rendu des tests précise ce qui a été exécuté.

## Reproduire

Depuis la racine du dépôt :

```sh
python3 tools/curriculum/build_curriculum.py --check
python3 tools/curriculum/build_legacy_free.py --check
node melunga_deploy/check-curriculum.cjs
node melunga_deploy/check-l1-release.cjs
node melunga_deploy/tests/curriculum-player.test.cjs
node melunga_deploy/tests/lesson-async-safety.test.cjs
node melunga_deploy/tests/l1-cafe.test.cjs
```

Les tests navigateur utilisent `playwright-core`, avec `NODE_PATH` si nécessaire et `CHROMIUM_PATH` pour Chromium. Les contrôles de déploiement utilisent uniquement Node et résolvent leurs chemins depuis leurs propres fichiers. Le build Netlify doit réussir en aperçu avant toute décision sur `main`.

Vérification locale finale : 143 plans examinés, 254 leçons parcourues, 1 924 étapes et 7 696 comparaisons de champs affichés, 2 218 droits historiques contrôlés, aucune erreur JavaScript. Les neuf scénarios de sécurité asynchrone des leçons classiques passent ; les sept scènes café passent leurs 448 étapes sur les deux formats. Les tests utilisent des comptes simulés locaux et une vérification des appels audio, pas une écoute acoustique ni une application native installée.

Source du plan précédent : `7d24556`, empreinte du JSON `311f20f83fe5e47219948b794e2d0477cb0935fea1e81c0015393dc921fbb78d`. Base produit : `50a2891`. Les sources et manifestes sont archivés dans `source/`, les mesures dans [build-report.json](build-report.json).
