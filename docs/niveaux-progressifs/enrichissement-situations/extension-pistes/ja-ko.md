# Dix-huit modules supplémentaires — japonais et coréen

Les deux extensions ajoutent chacune **144 intentions apprenantes, 37 répliques reçues et 36 soutiens lexicaux autonomes**. Elles sont séparées des fichiers initiaux `fr-ja.json` et `fr-ko.json` : leurs 160 objets, leurs aides et leurs fichiers complets restent byte-identiques.

| Couple | Modèles rédigés | Modèles catalogue réemployés | Modèles de conversation importés | Reçus rédigés / réemployés | Mots rédigés / réemployés |
|---|---:|---:|---:|---:|---:|
| fr→ja | 117 | 25 | 2 | 30 / 7 | 9 / 27 |
| fr→ko | 118 | 26 | 0 | 32 / 5 | 10 / 26 |

Il s’agit de **235 modèles supplémentaires réellement rédigés**, 62 nouveaux reçus et 19 nouvelles entrées lexicales autonomes : **316 aides nouvelles entières en attente de Claude**. Les autres usages conservent tous les champs de leurs sources. Une nouvelle variante entière ne constitue pas à elle seule une nouvelle règle grammaticale ; les heures, pronoms ou différences de transcription ne sont pas annoncés comme des progrès grammaticaux supplémentaires.

## Progression et adaptation à chaque langue

- **L1 — visite et secours de compréhension.** Formules entières, contexte d’hôte et réponses brèves. Pour quitter une visite, le japonais `そろそろ帰ります。` est approprié ; `行ってきます。` annonce habituellement un départ avec retour au lieu quitté et ne lui est pas substitué. Le coréen garde des formes polies. Les expressions de quantité de boisson restent des blocs fixés, sans généralisation des compteurs.
- **L2 — vêtements, douleur, gare et boisson.** `ワンサイズ上` et `한 사이즈 위` restent entiers. Aucun comparatif productif n’est introduit en même temps qu’un compteur variable. Le chaud d’une boisson et le piquant restent distincts ; un plan est `地図/지도`, pas un projet `計画/계획`. Les nécessités, permissions et demandes sont des actes différents.
- **L3 — goûts, compte numérique, cours et sport.** Le compte est un compte utilisateur `アカウント/계정`, pas une note à payer ni un compte bancaire. Fréquence, quantité de temps, comparaison et demande de précision sont préparées dans leurs groupes complets. Les variantes ne sont pas présentées comme un seul changement lorsque plusieurs constructions changent.
- **L4 — perte d’objet, récit culturel et équipement.** Raconter au passé puis obtenir une résolution observable. Une question sur la soirée n’est jamais présentée comme une réponse au passé. Le récit japonais importé est raconté le dimanche : son « hier » correspond au samedi de la première carte. Le retour à l’accueil après la réparation nocturne est situé le matin, ce qui rend le sommeil passé cohérent.
- **L5 — rendez-vous et dépannage.** Repère d’horaire, indisponibilité et confirmation ; ordre fermeture/réouverture de l’application, voix reçue et voix non entendue. La personne cliente confirme son choix ; les actes de l’agent sont réservés aux répliques reçues.
- **L8 — réclamation et limites personnelles.** Le tact repose sur la reconnaissance d’une contrainte, une portée limitée, une demande de faisabilité, une condition et une confirmation écrite. Ni `ください` ni `주세요`, déjà connus, ne sont rebaptisés nouveautés avancées. Le désaccord partiel et le refus de divulguer des détails sont explicites. `胸にしまう` est ici garder pour soi, pas une douleur physique.
- **L9 — objection sur le format d’un cours.** Alternative concrète petit groupe / cours individuel : temps de parole, utilité des échanges, concession et réponse à une objection précise. Ce n’est pas une liste de huit phrases d’opinion sans interlocuteur.

Ces préparations sont prévues éditorialement. Elles ne prouvent pas ce qu’une personne a acquis ; les notes de construction ne sont pas des instructions supplémentaires à afficher sur les cartes.

## Répliques reçues et réussite de l’échange

Chaque module a une question visant une réponse déterminée et une clôture. L9 ajoute une objection visant la huitième réponse. Les 37 reçus portent leur véritable rôle, `analyse: false`, une liste `answerWith` explicite et une ancre. La clôture conserve `answerWith: []`. Aucun reçu ne compte en progression de production ni n’est demandé à la personne apprenante.

Trois solutions sont réellement énoncées avant la vérification de leur résultat :

- Gare : `駅は、この道をまっすぐ行った先にあります。歩いて行きますか。` / `기차역은 쭉 가면 나와요. 걸어서 가실 거예요?` — indication tout droit puis question sur la marche.
- Compte : `新しいコードをお送りしました。ログインできますか。` / `새 코드를 보내 드렸어요. 이제 로그인할 수 있어요?` — code envoyé puis vérification de connexion.
- Équipement : `機械を修理しました。今は動いていますか。` / `기기를 수리했어요. 이제 잘 작동하나요?` — réparation annoncée puis vérification de fonctionnement.

Ce sont des scènes de langue ; les modèles qui annoncent ces actions appartiennent à l’interlocuteur reçu. Ils ne décrivent aucune opération réellement faite sur un compte ou un appareil.

## Recherche, réemploi et mots autonomes

La recherche couvre les decks entiers JA/KO, les variantes, tours et **objets `slot` lexicaux entiers** des dix conversations de chaque couple, les anciens 80 candidats et les mots éditoriaux. Les candidats de surface sont conservés dans les preuves ; ils ne sont pas réputés équivalents par leur seul score.

Le contrôle indépendant d’Inventaire a relevé un point manqué dans le premier index, limité aux variantes et tours : **`駅` existe déjà comme objet `slot` autonome**. Il est maintenant repris entier depuis `L1-fr-ja.json /units/4/variants/0/slot`, avec `reading: えき` et `phon: é-ki`, sans nouvelle aide. Le parent L1 complet est copié et hashé. L’index de cette extension parcourt désormais ces objets source complets.

Le parallèle coréen a été inspecté : le slot contient **`역이`**, avec particule sujet, et son aide entière. Il n’a pas été amputé pour fabriquer le nom `역`. L’entrée autonome `기차역` et son aide nouvelle sont rédigées en entier et restent à vérifier phonétiquement.

Les autres soutiens sont des mots ou groupes lexicaux complets. Les mots nouveaux `単語/意味`, `단어/뜻`, les comptes utilisateurs et les termes manquants sont des entrées indépendantes avec aides littérales complètes, jamais des extractions phonétiques d’une phrase. Les formes coréennes `큰/작은` conservent leur condition adnominale : elles décrivent un nom dans une phrase.

Deux placements classiques ont été corrigés après contrôle hors des 700 contenus protégés : `DECKS.ja[3291] かばん` et `DECKS.ko[2440] 가방` passent de `vocab-actions` à `vocab-voyage`. Le classifieur et les partitions portent les mêmes raisons revues. Aucun niveau, type, texte ni phonétique source n’a changé. Écran, mot de passe et cahier sont dans Travail ; climatisation dans Maison ; vendredi dans Repères ; sport dans Loisirs.

## Vérification et limites

```sh
python3 tools/maquette-guidee/prepare_ja_ko_extension.py --check
python3 tools/maquette-guidee/prepare_ja_ko_situations.py --check
```

Les contrôles vérifient les anciennes empreintes, les champs source entiers, les objets parents et leurs empreintes, les absences de trous, les doublons de forme/lecture consultés et la couverture 18 × 8 / 37 / 36. Les deux imports de modèles japonais proviennent de tours ou variantes de l’apprenant, pas du serveur. Les mots importés de slots gardent le slot entier.

La conformité des fichiers ne constitue ni une relecture native indépendante, ni une mesure d’apprentissage, ni une validation d’un site hébergé. Codex porte ici le sens, le registre, les rôles et la proposition de progression ; Claude doit vérifier les **316 aides nouvelles entières** selon la méthode de Kartech. Les aides existantes restent inchangées. Aucun catalogue classique, niveau d’accès, prix, abonnement ou ancien mot du lot de 140 n’est modifié par ces commandes ; le runtime et les tests navigateur sont pris en charge séparément par les agents responsables.
