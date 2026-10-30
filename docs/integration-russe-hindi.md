# Intégration russe et hindi — 30 octobre 2026

L’intégration part du `main` courant `24e09c1`. Elle ajoute les deux packs fournis aux parcours existants, sans reprendre une ancienne copie de `app.html`.

## Contenu conservé

| Deck | Cartes reçues | Cartes dans les thèmes | Modèles conservés en réserve | Thèmes illustrés |
|---|---:|---:|---:|---:|
| Russe | 4 488 | 4 411 | 77 | 177 |
| Hindi | 4 487 | 4 410 | 77 | 179 |

Les fichiers reçus sont conservés à l’identique dans `tools/maquette-guidee/imports/`. Chaque carte garde ses 15 champs, sa position source, son niveau et sa catégorie. Les modèles à compléter restent en réserve comme dans les parcours existants, sans suppression du JSON.

Les nouveaux classements utilisent les rubriques, traductions de titres et photos déjà présentes. Ils sont stockés séparément des cartes ; l’ordre source est conservé dans chaque rubrique. Les correspondances exactes avec les significations des anciens decks réutilisent leur classement lorsqu’il est univoque. Les autres placements thématiques restent une classification éditoriale à affiner si nécessaire, et non une nouvelle validation linguistique.

Les huit banques antérieures, les 56 anciennes directions, les thèmes, les photos et les droits historiques sont conservés. Les fonctions de progression et les huit fonctions classiques de compte/paiement restent inchangées.

## Parcours disponibles

Les deux nouveaux decks sont accessibles depuis les sept langues de départ dont leurs traductions sont fournies : français, anglais, espagnol, italien, chinois, japonais et coréen. Cela ajoute 14 directions, soit 70 au total. Le site garde ses huit langues d’interface ; le russe et le hindi sont des langues étudiées.

Les packs ne contiennent pas de traduction allemande. Les directions allemand→russe et allemand→hindi ne sont donc pas proposées : aucune traduction anglaise n’est présentée comme allemande. Les sept cours au départ de l’allemand restent disponibles.

L’accueil ajoute les deux choix et leurs exemples. Les drapeaux russe et indien sont des SVG locaux, y compris dans les capsules et les menus de langue. Les dispositions ordinateur/mobile, les commandes sous la leçon et la barre mobile existantes sont conservées.

## Voix et reconnaissance

- Russe : `ru-RU-Wavenet-A` (féminine), `ru-RU-Wavenet-B` (masculine), reconnaissance `ru-RU`.
- Hindi : `hi-IN-Wavenet-C` (féminine), `hi-IN-Wavenet-B` (masculine), reconnaissance `hi-IN`.
- Les marqueurs explicites `(male)` / `(female)` du champ anglais règlent le sexe de la voix pour les cartes concernées ; les marqueurs d’interlocuteur `(to a female)` ne sont pas traités comme ceux du locuteur. Une carte non marquée utilise le choix personnel enregistré, puis la voix féminine par défaut.
- Les deux langues utilisent des voix WaveNet configurées. Elles ne sont pas présentées comme des voix Chirp observées via `voices:list`. Le catalogue Chirp et les préférences des huit langues précédentes restent compatibles.
- Le repli navigateur reste dans la langue étudiée. Aucune requête de traduction externe n’est ajoutée.
- Le code lit la clé exclusivement via `process.env.GOOGLE_TTS_API_KEY` ; aucune clé ni jeton n’est inclus dans cette livraison.

La comparaison des réponses conserve le cyrillique et la devanagari. Elle accepte `ё/е`, ignore le nukta et la ponctuation, accepte les variantes chandrabindu/anusvara, et distingue toujours `й/и` ainsi que les consonnes hindi aspirées/non aspirées.

Les trois générateurs fournis restent ensemble dans `tools/phonetics/`, sans modification. Leurs démonstrations s’exécutent avec la bibliothèque standard. Le deck ne fournit pas les translittérations d’entrée : il n’est donc pas possible de certifier une régénération complète à partir des seuls JSON reçus.

## Relecture et validations

[Rapports et fichiers téléchargeables](relecture-russe-hindi/00-synthese.md) : 500 cartes par langue, 50 par niveau ; russe 15 constats (10 recommandés, 5 à arbitrer), hindi 37 constats (25 recommandés, 12 à arbitrer). Les corrections proposées n’ont pas été appliquées aux sources ; les phonétiques sont à régénérer par l’auteur.

Contrôles locaux réalisés :

- sources JSON et générateurs identiques aux pièces jointes, champs/niveaux/catégories/identités conservés ; export reproductible avec `--check` ;
- les 140 combinaisons des nouveaux parcours/niveaux conservent les champs fournis et les droits L1 ; modèles des 56 parcours précédents comparés à la base ;
- grammaire JavaScript des scripts intégrés et externes, normalisation Unicode et tests des voix/TTS avec fournisseur simulé ;
- navigation réelle Chromium à 390 et 1 366 px : accueil, thèmes et photos, leçons, drapeaux SVG, phonétique, voix, écoute, « À revoir », progression après les étapes mobiles, rechargement, droits L2 et retour du compte ;
- rubriques longues : chaque carte est conservée dans les étapes visibles d’environ 30–40 cartes, achèvement d’une étape et progression après rechargement ;
- accueil à 1 366 et 1 827 px : neuf exemples visibles dans les huit langues d’interface, sans débordement ; les anciens exemples restent identiques ;
- garde-fous de sources et anciens droits vérifiés : seule la liste explicite des nouveaux imports et des fichiers modifiés est admise ; les anciennes preuves Chirp/audio ne sont pas réécrites.

Ces essais utilisent des réponses locales et de l’audio simulé. Aucun audio Google réel ni appareil physique n’a été testé. La configuration Netlify et la réponse audio en production restent à vérifier dans un environnement disposant de la clé et de l’accès à Netlify/Google. Les accès API de cet environnement ne permettent pas de les confirmer.

## Inventaire des banques après intégration

| Langue | Cartes source |
|---|---:|
| Français | 4 500 |
| Anglais | 4 502 |
| Espagnol | 4 672 |
| Italien | 4 509 |
| Chinois | 4 903 |
| Japonais | 4 509 |
| Coréen | 4 520 |
| Allemand | 4 519 |
| Hindi | 4 487 |
| Russe | 4 488 |
| **Total** | **45 609** |

Le deck arabe n’est pas ajouté par cette intégration : sa revue est livrée séparément et ses corrections restent attendues.

## Aperçus locaux

- [Russe ordinateur](relecture-russe-hindi/previews/ru-1366.png) · [Russe mobile](relecture-russe-hindi/previews/ru-390.png)
- [Hindi ordinateur](relecture-russe-hindi/previews/hi-1366.png) · [Hindi mobile](relecture-russe-hindi/previews/hi-390.png)
- [Résultats et limites des validations](relecture-russe-hindi/integration-validation.json)
