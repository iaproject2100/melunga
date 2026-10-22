# Vérification du classement proposé

Exécution locale le 22 octobre 2026. Lot éditorial non publié, basé sur `bcd108d`, amendé après la seconde relecture de `99478df`. La demande active porte sur fr→es et zh→fr ; les reproches de longueur retirés ne justifient aucun nouveau déplacement.

| Objet | Résultat vérifié |
| --- | --- |
| Périmètre | Sept couples actifs, 70 cases non vides, 841 unités présentes une seule fois |
| Corpus affiché | 3 364 variantes entières ; valeurs exactes de `study`, `native`, `phon` et `reading` lorsqu’il est présent |
| Classement proposé | 122 déplacements entre niveaux 2–10 ; niveau source et placement proposé conservés séparément |
| Préparation | 1 372 liens d’unités antérieures dans le même couple ; aucune boucle ni dépendance future acceptée |
| Premières comparaisons | 319 paires déclarées, cadre écrit source conservé, références exactes aux étapes antérieures des deux phrases |
| Expressions entières | 522 unités sans fausse étape de remplacement ; les quatre variantes sont conservées |
| Réserves | 341 annotations de contraintes, préparations ou relectures nécessaires ; leur présence ne bloque pas l’affichage d’une expression entière ni ne prouve leur résolution |
| Amendements de suivi | 29 lignes éditoriales ; aucun nouveau déplacement de niveau, aucun changement de phrase ou aide, 19 liens prévus supplémentaires |
| Contrôles Python | **56 tests réussis** : 21 sur le parcours, 8 décisions/conservation, 13 sur la mesure de longueur et 14 sur la nouveauté, le périmètre et l’arrondi |
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

Le suivi ajoute [six captures ciblées](suivi-relecture/verification-ciblee.json), en mobile 390×844 et ordinateur 1440×900 :

- [Espagnol L4 : première phrase de routine](suivi-relecture/captures/espagnol-L4-habitudes-390x844.png), désormais introduite par le travail déjà rencontré.
- [Espagnol L8 : demande d’aménagement](suivi-relecture/captures/espagnol-L8-demander-possible-1440x900.png).
- [Français L9 pour sinophones : reformulation](suivi-relecture/captures/francais-sinophones-L9-reformuler-1440x900.png).

Le [relevé de contrôles](suivi-relecture/checks.json) rassemble les commandes et compteurs. Les rapports navigateur, portable, ciblé et les deux audits candidats pointent vers le même runtime SHA-256 `bbebf82188509ffbd89f13b91eca07aa392be3f9c3581d3b17676fbffbc20c06`. Les images mobiles couvrent la page entière, qui conserve un défilement vertical ; elles ne prétendent pas faire tenir tout le dossier dans la hauteur de l’écran.

## Maquette en un fichier

`export_progression_corrections.py` fournit un HTML autonome, avec les données, styles et scripts intégrés. La vérification de ce fichier chargé par HTTP local n’utilise qu’une seule requête pour le document, sans autre ressource, et contrôle les sept couples. L’ouverture directe `file://` ne peut pas être testée dans le Chromium de cet environnement, bloquée par sa politique administrateur ; aucune politique n’a été contournée. Le [rapport portable](verification-portable.json) précise ce périmètre.

Ce fichier est un artefact de revue local, pas une page publiée. Pour le reproduire :

```sh
python3 -B tools/pedagogy/export_progression_corrections.py /tmp/melunga-progression-L1-L10.html
```

## Limites pédagogiques à conserver dans la revue

L’égalité du gabarit, un prérequis ordonné et une présentation exacte ne démontrent pas qu’un apprenant comprend ou peut recombiner. Le classement et les premières paires restent des décisions à relire. Les [mesures de nouveauté écrite](suivi-relecture/nouveaute.md) et les [longueurs](suivi-relecture/mesures.md) sont recalculées dans des périmètres explicites, avec la référence `99478df` conservée ; l’ordre interne amendé ne change pas les ratios par niveau. Le contrôle distingue une formule numériquement compatible du script de Claude, non fourni pour la seconde mesure. Les anciens taux concernant les dialogues ne sont ni remplacés ni réputés améliorés. Les dialogues et le catalogue classique ne sont pas automatiquement reclassés avec ces unités.

Les conditions d’accès existantes et les unités L1 restent intactes. Aucun contenu n’est publié, aucun compte ou paiement n’est effectué, aucun APK n’est construit. La validation native et les essais d’apprentissage restent distincts de ces tests techniques.
