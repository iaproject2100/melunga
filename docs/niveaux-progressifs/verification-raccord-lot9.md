# Vérification du lot 9 — italien et erratum EN71

État consigné le 26/10/2026 à 11:04 CET. Horodatages détaillés des essais dans les JSON.

**107 identifiants, 111 objets distincts, 118 champs corrigés.** Les trois
couches comptent 112 occurrences d’objet : 1736 reçoit l’aide A, puis le sens B.

| Contrôle | Résultat |
|---|---:|
| Génération reproductible | conforme |
| Rapport indépendant lié aux fichiers réels | conforme |
| Contre-épreuves Python refusées | 196 / 196 |
| Tests ciblés et historiques | 6 + 38 réussis |
| Nouvelles corruptions JavaScript refusées | 49 / 49 |
| Commandes, Pinyin, gestes, À revoir, fiche entière | 9 / 9 |
| Matrice générale navigateur | 19 / 19 |

Les 70 aides italiennes sont reprises entières : 69 canoniques, quatre copies
et un reçu, soit 74 objets/champs. N reste bornée aux 63 événements ; SIM,
team et Wang ne sont pas normalisés. Les 33 aides de s intervocalique sont
annoncées relues sans faute certaine par Claude ; elles ne constituent pas
un lot de corrections ni une nouvelle règle générale.

Les 34 gloses et trois blocs sont séparés : 35 canoniques et deux reçus,
37 objets/43 champs. Les blocs 2489, 3879 et 4098 changent étude, sens et aide
d’un seul tenant. La glose de 1736 conserve l’aide A et son annotation. Les
réserves 3092/4091 restent en réserve sans production ; les reçus restent
exclus des réponses apprenant. Les trois études remplacées tiennent dans les
écrans mobile et ordinateur testés.

EN71 emploie l’épellation distincte de Claude, « é É-né sé-TÉN-ta i OU-no ».
Ce nouvel événement après le lot 8 conserve son registre et son annotation
historiques ; aucune convention générale d’épellation n’est décidée.

Les 77 JSON sont comparés intégralement à `40d4c0b` après projection privée des
seuls champs attestés. Les 36 fichiers HTML/CSS/JS directement sous
melunga_deploy restent identiques. Types, identifiants, placements, niveaux,
rôles, étapes, prix, droits et présentation sont conservés.

Les 32 115 cartes classiques et leurs 110 277 champs originaux restent intacts.
Dans le parcours, 108 656 champs catalogue restent verbatim ; 1 621 exceptions
enregistrées couvrent toutes les couches : 1 424 aides, 17 lectures,
17 études et 163 sens. Aucun autre écart n’est accepté. Le niveau d’origine
lv demeure la frontière d’accès gratuit, distincte du niveau éditorial.

Couverture exacte : 4 720 canoniques + 36 reçus = 4 756 positions / 4 753 IDs.
Claude a terminé la lecture des 70 cellules ; cela ne clôture pas les
propositions et conventions. Les 280 propositions, 30 conventions et **96**
contenus incertains restent non appliqués. Le JSON contient 96 lignes
incertaines distinctes, pas 93 annoncées. Le motif documentaire de it901 cite
31/37 au lieu de 62/68, mais ses identifiants de doublon sont corrects.

Les motifs de biglietto, Il troppo stroppia ou tornare da voi restent
contextualisés ; les corrections ne transforment pas toute variante en faute.
La jota espagnole, le batchim coréen et les conventions d’italien restent
à décider séparément.

[Preuves et empreintes](verification-raccord-lot9.json),
[contrôle indépendant](verification-independante.md),
[commandes](verification-commandes-lecon-navigateur.md),
[matrice navigateur](verification-navigateur.md),
[compte rendu](reponse-revue-integrale-lot9/README.md).

Essais Chromium locaux, formats émulés, TTS simulée pour le texte transmis.
Aucun téléphone physique, son réel, parcours du site hébergé ou validation
native globale revendiqué. Aucune fusion dans main ni publication sur melunga.com.
