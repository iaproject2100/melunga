# Vérification du classement proposé

Exécution locale le 22 octobre 2026. Lot de revue non publié. Le suivi `a4f1ec4` a été validé par Claude ; cette passe ajoute trois préparations réellement affichées pour la transition espagnole L3→L4, sans nouveau déplacement de niveau ou d’unité.

| Objet | Résultat vérifié |
| --- | --- |
| Périmètre | Sept couples actifs, 70 cases non vides, 841 unités présentes une seule fois |
| Corpus affiché | 3 364 variantes entières + 3 supports catalogue existants = 3 367 énoncés ; 11 488 champs de variantes et 9 champs de supports exacts |
| Classement proposé | 122 déplacements entre niveaux 2–10 ; niveau source et placement proposé conservés séparément |
| Préparation | 1 372 liens d’unités antérieures dans le même couple ; aucune boucle ni dépendance future acceptée |
| Premières comparaisons | 319 paires déclarées, cadre écrit source conservé, références exactes aux étapes antérieures des deux phrases |
| Expressions entières | 522 unités sans fausse étape de remplacement ; les quatre variantes sont conservées |
| Réserves | 341 annotations de contraintes, préparations ou relectures nécessaires ; leur présence ne bloque pas l’affichage d’une expression entière ni ne prouve leur résolution |
| Préparations nouvelles dans la maquette | 3 cartes entières, compréhension puis imitation proposées avant leurs cibles ; +6 étapes, variantes et choix conservés |
| Conservation du lot validé | Quatre entrées éditoriales `a4f1ec4` inchangées ; annexe bornée à deux unités de routine et à un libellé descriptif L3 |
| Contrôles Python | **80 tests réussis** : 21 sur le parcours, 35 sur le suivi précédent, 12 sur les supports et 12 sur la mesure de transition |
| Rendu navigateur | **23 682 étapes**, soit 7 894 étapes par format × trois formats : 320×568, 390×844 et 1440×900 |
| Exercices affichés | 75 099 affichages de phrases, 32 208 activations simulées d’oreille et 10 092 choix/rappels |
| Aides et rappel | Phonétique et lecture exactes ; texte étudié retiré au rappel ; sens du lecteur conservé ; oreille réaffichant explicitement le modèle avant lecture |
| Isolement | **0 erreur JavaScript**, aucune requête extérieure ni écriture d’acquis ; échec de chargement et réessai vérifiés |
| Protection du corpus | Application et 110 fichiers de niveau inchangés ; garde phonétique des 32 115 entrées et 112 JSON protégés réussie |

Le [rapport navigateur](verification-navigateur.json) enregistre l’empreinte SHA256 du paquet final et ses compteurs. Les tests n’évaluent pas l’apprentissage humain ni le naturel des phrases, et n’ont pas validé les voix sur chaque appareil.

## Captures

- [Italien L8 — mobile](captures/italien-L8-390x844.png)
- [Chinois L2 — petit écran](captures/chinois-L2-320x568.png)
- [Français pour sinophones — rappel sur ordinateur](captures/francais-L7-rappel-1440x900.png)

Neuf captures couvrent ces trois situations aux trois formats. Elles ont été inspectées : textes lisibles, commandes séparées, oreille présente, sans débordement horizontal ; le rappel sinophone ne montre pas la réponse française.

La transition espagnole ajoute [six captures ciblées](transition-es/verification-portable.json), aux largeurs 390 et 1440 :

- [« Como en casa. » — largeur mobile](transition-es/captures/preparation-264-390x844.png), avant la variante avec `Normalmente`.
- [« Me levanto temprano. » — largeur mobile](transition-es/captures/preparation-283-390x844.png), avant la variante complète avec une heure précise.
- [« Me acuesto pronto. » — ordinateur](transition-es/captures/preparation-542-1440x900.png), avant la variante avec `Por la noche`.

Le [relevé de contrôles actuel](transition-es/checks.json) rassemble les commandes et compteurs. Le navigateur, l’export portable et la mesure de transition pointent vers le même runtime SHA-256 `311f20f83fe5e47219948b794e2d0477cb0935fea1e81c0015393dc921fbb78d`. Les captures couvrent la page entière, avec défilement vertical, et des largeurs réactives ; elles ne constituent pas un essai sur téléphone physique. Les anciennes captures et mesures du dossier `suivi-relecture` restent celles de `a4f1ec4`, consultables à ce commit.

## Maquette en un fichier

`export_progression_corrections.py` fournit un HTML autonome, avec les données, styles et scripts intégrés. La vérification de ce fichier chargé par HTTP local n’utilise qu’une seule requête pour le document, sans autre ressource. Les sept couples, les trois oreilles de support et le rappel sont contrôlés. L’ouverture directe `file://` n’est pas testée ; la politique administrateur déjà constatée n’est pas contournée. Le [rapport portable actuel](transition-es/verification-portable.json) précise ce périmètre.

Ce fichier est un artefact de revue local, pas une page publiée. Pour le reproduire :

```sh
python3 -B tools/pedagogy/export_progression_corrections.py /tmp/melunga-progression-L1-L10.html
NODE_PATH=/tmp/melunga-review-tools/node_modules CHROMIUM_PATH=/usr/bin/chromium node docs/progression-corrections/maquette/verify-portable.cjs /tmp/melunga-progression-L1-L10.html
```

## Limites pédagogiques à conserver dans la revue

L’égalité du gabarit, un prérequis ordonné et une présentation exacte ne démontrent pas qu’un apprenant comprend ou peut recombiner. Les [mesures générales validées](suivi-relecture/nouveaute.md) gardent leur référence historique. La [mesure de transition](transition-es/mesures.md) conserve `a4f1ec4` et sépare variantes seules, tous supports et chronologie des premières occurrences. Le ratio L3→L4 reste +6,355 points ; le maximum local par présentation dans la première unité de routine passe de trois à deux types, mais celui du niveau entier reste quatre. Cela ne prouve ni écoute effective ni acquisition. Les anciens taux concernant les dialogues ne sont ni remplacés ni réputés améliorés. Les dialogues et le catalogue classique ne sont pas automatiquement reclassés avec ces unités.

Les conditions d’accès existantes et les unités L1 restent intactes. Aucun contenu n’est publié, aucun compte ou paiement n’est effectué, aucun APK n’est construit. La validation native et les essais d’apprentissage restent distincts de ces tests techniques.
