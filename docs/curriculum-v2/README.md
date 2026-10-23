# Parcours progressif complet — publication sur instruction de Kartech

Ce lot propose une entrée débutante commune aux sept couples et branche les 841 unités dans l’application. **Kartech autorise explicitement la fusion de la PR nº 10 et la publication du parcours complet avec les sept scènes café**, après réconciliation des accès gratuits. Il accepte l’absence de parcours navigateur hébergé avant publication et l’absence de relecture native du nouvel enchaînement L1. Les réserves pédagogiques ci-dessous restent déclarées. Voir [la décision de publication](publication/decision-proprietaire.json).

## Ouvrir le résultat

- [Ouvrir le parcours sur melunga.com](https://melunga.com/app.html?start=1&lang=fr&study=zh). L’ancien atelier qui forçait l’accès à tous les niveaux est archivé **hors du répertoire publié** ; son ancienne adresse redirige vers l’application et ses droits normaux.
- `app.html?start=1&lang=fr&study=zh` : essai dans la véritable interface mobile/ordinateur. « Parcours guidé » et les boutons L1–L10 ouvrent désormais les nouvelles leçons pour les sept couples actifs. Les autres couples ne sont pas activés.
- « Bibliothèque · cartes » : catalogue classique. « Bibliothèque gratuite », dans le parcours : les onze anciennes unités L1 complètes de la langue, gratuites même lorsqu’elles sont différées pédagogiquement.

L’application conserve son moteur audio et ses voix existantes. Les contrôles des appels audio ne constituent pas une évaluation acoustique de la prononciation.

## Le changement concret

**L1 a le même ordre de capacités dans les sept couples** : saluer, donner son prénom, signaler une incompréhension, faire répéter, commander une boisson, changer de boisson, comprendre une offre/refuser, demander le prix, jouer l’échange au café. Chaque phrase est préparée entière avant un choix ; la phrase et sa phonétique ne sont jamais fabriquées depuis un modèle à trous.

Pour le chinois, le devis final, le tableau des tailles et les autres phrases de l’ancien guidé ne font plus partie de l’entrée débutante. Le coréen dispose désormais d’un parcours aux dix niveaux, là où l’ancien système de familles n’en avait aucun.

Les **77 anciennes unités L1** sont différées selon leurs constructions : 48 en L2, 28 en L3, une en L4. Ce choix est un amendement éditorial **nouveau**, autorisé pour publication par Kartech. La validation antérieure de Claude sur l’ancien reclassement ne vaut pas validation de cet amendement. Les raisons, ordres et blocs de variantes sont dans [placements-entree-v2.json](../progression-corrections/reprise-globale/placements-entree-v2.json).

Les **841 unités / 3 364 variantes** de la proposition précédente sont présentes dans le joueur. Quatorze premières phrases entières sur le logement et le travail introduisent ces fonctions en L2 dans les sept couples ; leurs familles plus riches gardent ensuite leur placement précédent. Une première phrase ne prépare pas les quatre variantes d’une famille.

Total du parcours : **918 leçons, 8 307 étapes** — 841 unités, 63 microleçons d’entrée et 14 premières expositions. Ce sont des étapes de pratique, pas 8 307 acquis ni 918 situations nouvelles.

Les répliques reçues restent à comprendre, visibles même pendant le rappel. L’oreille reste accessible et révèle explicitement le modèle avant de le lire. Les clics et la navigation ne produisent aucune note, validation de maîtrise ou écriture dans les révisions classiques.

## Ce qui est conservé

- **11 488 champs** des 3 364 variantes copiés exactement depuis les sources figées ; les sélections L1 et les trois soutiens espagnols sont également vérifiés contre leur origine.
- Texte étudié, traduction, phonétique et lecture conservés ; aucune harmonisation chinoise silencieuse, aucune concaténation d’aide de prononciation.
- Les lignes `DECKS` et `PEDAGOGY_FAMILIES` de l’application restent identiques à la base `50a2891` ; les **32 115 cartes classiques ne sont pas individuellement reclassées par ce lot**. Le nouveau cours remplace l’entrée guidée, le catalogue reste une réserve distincte.
- Accès gratuit historique préservé par comparaison des **ensembles exacts d’indices**, sans dédoublonnage de texte. Le tableau précédent comptait les cartes proposées par les anciennes entrées après filtrage de thème ; il ne mesurait pas tous les droits du catalogue brut. La réconciliation avec Claude distingue les trois conventions :

| Couple | Cartes historiquement proposées, par indice | Droits complets avant = après, par indice | Textes distincts bruts, chiffres de Claude |
|---|---:|---:|---:|
| fr→en | 342 | 342 | 342 |
| fr→es | 300 | 301 | 301 |
| fr→it | 347 | 350 | 345 |
| fr→zh | 331 | 331 | 331 |
| fr→ja | 305 | 308 | 299 |
| fr→ko | 284 | 287 | 283 |
| zh→fr | 309 | 309 | 309 |
| **Total** | **2 218** | **2 228** | **2 210** |

Les sept chiffres de Claude se reproduisent exactement avec les textes `t` uniques de toutes les cartes brutes L1 et du guidé L1. Cette convention ajoute dix cartes métier L1 masquées par l’ancien filtre, puis fusionne dix-huit occurrences de texte. Les écarts sont donc : espagnol `300 + 1 − 0 = 301`, italien `347 + 3 − 5 = 345`, japonais `305 + 3 − 9 = 299`, coréen `284 + 3 − 4 = 283`. Des doublons portent des sens ou aides distincts ; les regrouper par texte ne prouve pas la conservation de leurs cartes. Leur clé SRS historique est toutefois partagée (`lang + "|" + t`) : ils ne forment pas autant de clés de révision différentes.

Pour prouver la conservation des droits, le contrôle pertinent est la deuxième colonne : **tout indice de carte L1 brute, union des indices guidés L1 historiquement offerts**. Les fonctions historiques et candidates exécutées dans Node donnent exactement les mêmes **2 228 indices, zéro perte et zéro nouveau droit**. Les 35 autres couples gardent le prédicat L1 strict. [Détail des écarts](publication/reconciliation-gratuit.md) ; [ensembles avant/après](publication/droits-avant-apres.json).

La frontière de base du catalogue est `FREE_LV=[1]`, donc historiquement `isFreeCard(d)` équivalait à `d.lv === 1`. Le candidat ajoute les exceptions historiques par couple pour conserver l’ancien guidé gratuit. **Modifier `lv` dans le catalogue modifierait la frontière de base gratuit/payant**, sous réserve des exceptions gelées ; aucune valeur `lv` du catalogue n’est changée ici. Le niveau pédagogique du nouveau parcours reste distinct de ce niveau d’accès. Une carte déjà rangée dans « Je connais » reste dans cette rubrique.

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

1. Les neuf microleçons communes, les 77 placements et les quatorze premières expositions sont publiés sur décision de Kartech. La relecture pédagogique complémentaire reste souhaitable ; il faut juger les phrases effectivement vues, pas uniquement leur longueur moyenne.
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
node tools/curriculum/audit_free_rights.cjs --repo .
node melunga_deploy/tests/curriculum-player.test.cjs
node melunga_deploy/tests/lesson-async-safety.test.cjs
node melunga_deploy/tests/l1-cafe.test.cjs
```

Les tests navigateur utilisent `playwright-core`, avec `NODE_PATH` si nécessaire et `CHROMIUM_PATH` pour Chromium. Les contrôles de déploiement utilisent uniquement Node et résolvent leurs chemins depuis leurs propres fichiers. Le build Netlify doit réussir en aperçu avant toute décision sur `main`.

Vérification locale finale : 143 plans examinés, 254 leçons parcourues, 1 924 étapes et 7 696 comparaisons de champs affichés, 2 218 droits historiques contrôlés, aucune erreur JavaScript. Les neuf scénarios de sécurité asynchrone des leçons classiques passent ; les sept scènes café passent leurs 448 étapes sur les deux formats. Les tests utilisent des comptes simulés locaux et une vérification des appels audio, pas une écoute acoustique ni une application native installée.

Source du plan précédent : `7d24556`, empreinte du JSON `311f20f83fe5e47219948b794e2d0477cb0935fea1e81c0015393dc921fbb78d`. Base produit : `50a2891`. Les sources et manifestes sont archivés dans `source/`, les mesures dans [build-report.json](build-report.json).

Le dossier [publication/](publication/) consigne la décision, la réconciliation et les vérifications du site réel. Les rapports d’aperçu plus anciens restent des pièces historiques et ne remplacent pas ces contrôles de production.

**Publié et vérifié sur melunga.com** : fusion produit `dfdf6e4`, 19 fichiers réels contrôlés et 106 étapes chinoises/espagnoles parcourues en navigateur mobile émulé, invité non payant. Voir le [constat après publication](publication/verification-production.md) et le [passage sur téléphone physique](publication/passage-manuel-telephone.md).
