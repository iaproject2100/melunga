# Vérification du classement proposé

Exécution locale le 22 octobre 2026. Lot éditorial non publié, basé sur `bcd108d`.

| Objet | Résultat vérifié |
| --- | --- |
| Périmètre | Sept couples actifs, 70 cases non vides, 841 unités présentes une seule fois |
| Corpus affiché | 3 364 variantes entières ; valeurs exactes de `study`, `native`, `phon` et `reading` lorsqu’il est présent |
| Classement proposé | 122 déplacements entre niveaux 2–10 ; niveau source et placement proposé conservés séparément |
| Préparation | 1 353 liens d’unités antérieures dans le même couple ; aucune boucle ni dépendance future acceptée |
| Premières comparaisons | 319 paires déclarées, cadre écrit source conservé, références exactes aux étapes antérieures des deux phrases |
| Expressions entières | 522 unités sans fausse étape de remplacement ; les quatre variantes sont conservées |
| Réserves | 330 annotations de contraintes, préparations ou relectures nécessaires ; leur présence ne bloque pas l’affichage d’une expression entière ni ne prouve leur résolution |
| Contrôles Python | **21 tests réussis** : oracle Git indépendant, couverture, copies, préparation et refus des mutations de source, accès, ordre, lecteur et statuts |
| Rendu navigateur | **23 664 étapes**, soit 7 888 étapes par format × trois formats : 320×568, 390×844 et 1440×900 |
| Exercices affichés | 75 081 affichages de phrases, 32 190 activations simulées d’oreille et 10 092 choix/rappels |
| Aides et rappel | Phonétique et lecture exactes ; texte étudié retiré au rappel ; sens du lecteur conservé ; oreille réaffichant explicitement le modèle avant lecture |
| Isolement | **0 erreur JavaScript**, aucune requête extérieure ni écriture d’acquis ; échec de chargement et réessai vérifiés |
| Protection du corpus | Application et 110 fichiers de niveau inchangés ; garde phonétique des 32 115 entrées et 112 JSON protégés réussie |

Le [rapport navigateur](verification-navigateur.json) enregistre l’empreinte SHA256 du paquet final et ses compteurs. Les tests n’évaluent pas l’apprentissage humain ni le naturel des phrases, et n’ont pas validé les voix sur chaque appareil.

## Captures

- [Italien L8 — mobile](captures/italien-L8-390x844.png)
- [Chinois L2 — petit écran](captures/chinois-L2-320x568.png)
- [Français pour sinophones — rappel sur ordinateur](captures/francais-L7-rappel-1440x900.png)

Neuf captures couvrent ces trois situations aux trois formats. Elles ont été inspectées : textes lisibles, commandes séparées, oreille présente, sans débordement horizontal ; le rappel sinophone ne montre pas la réponse française.

## Maquette en un fichier

`export_progression_corrections.py` fournit un HTML autonome, avec les données, styles et scripts intégrés. La vérification de ce fichier chargé par HTTP local n’utilise qu’une seule requête pour le document, sans autre ressource, et contrôle les sept couples. L’ouverture directe `file://` ne peut pas être testée dans le Chromium de cet environnement, bloquée par sa politique administrateur ; aucune politique n’a été contournée. Le [rapport portable](verification-portable.json) précise ce périmètre.

Ce fichier est un artefact de revue local, pas une page publiée. Pour le reproduire :

```sh
python3 -B tools/pedagogy/export_progression_corrections.py /tmp/melunga-progression-L1-L10.html
```

## Limites pédagogiques à conserver dans la revue

L’égalité du gabarit, un prérequis ordonné et une présentation exacte ne démontrent pas qu’un apprenant comprend ou peut recombiner. Le classement et les premières paires restent des décisions à relire. Les anciennes mesures lexicales ne sont pas recalculées ni présentées comme améliorées par le simple reclassement. Les dialogues et le catalogue classique ne sont pas automatiquement reclassés avec ces unités.

Les conditions d’accès existantes et les unités L1 restent intactes. Aucun contenu n’est publié, aucun compte ou paiement n’est effectué, aucun APK n’est construit. La validation native et les essais d’apprentissage restent distincts de ces tests techniques.
