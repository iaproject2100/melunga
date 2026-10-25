# Vérification du raccord phonétique — 25 octobre 2026

**Raccord généré et contrôlé : 774 événements, 772 cartes distinctes, 786 occurrences.**
Deux identifiants chinois reçoivent B puis D ; 14 copies de transport utilisent
la même aide finale que la carte canonique. Aucun tour reçu n’est modifié par
ces deux registres. Les 772 cartes se répartissent entre fr→zh (459), fr→ko (260),
fr→es (36) et zh→fr (17).

## Résultats

| Contrôle | Résultat |
|---|---:|
| Générateur `build_levels.py --check` | conforme |
| Vérificateur indépendant et rapport à jour | conforme |
| Anomalies volontaires refusées par le vérificateur Python | 55 / 55 |
| Tests ciblés du raccord, dont 8 corruptions refusées | 4 / 4 |
| Commandes, fiche complète, Pinyin, gestes et À revoir | 9 / 9 |
| Matrice générale navigateur sur sept couples et dix niveaux | 19 / 19 |

Les 77 fichiers de cellules et de transport ont été comparés intégralement au
snapshot `97e80f9`, en retirant seulement les corrections explicitement attestées
sur une copie interne. Étude, sens, lecture/Pinyin, identifiants, sources, niveaux,
thèmes, séquences et accès sont identiques. Le manifeste ne change que pour
référencer le registre et les empreintes des banques réellement corrigées.

Les contrôles de provenance vérifient toujours les **110 277 champs originaux**.
Dans les données exécutées, 109 550 champs catalogue restent verbatim ; les
727 aides catalogue corrigées sont déclarées séparément, ainsi que 45 aides
rédigées. La provenance n’est pas réécrite pour prétendre que l’après était l’original.
L’application classique et les fichiers HTML, CSS et JavaScript validés sont inchangés.

Le navigateur attend les aides corrigées réellement affichées. Le test ciblé
parcourt notamment « 我要那个 » à sa première rencontre et lors de son réemploi
ultérieur, « 今天天气很好。 » avec son Pinyin original, et les 17 aides de « les » pour
sinophones. L’oreille reçoit le texte étudié entier ; aucune aide phonétique
n’est envoyée comme texte à prononcer.

## Reproduction et limites

Les commandes et empreintes sont dans
[verification-raccord-phonetique.json](verification-raccord-phonetique.json).
Les rapports détaillés sont [le contrôle indépendant](verification-independante.md),
[les commandes](verification-commandes-lecon-navigateur.md) et
[la matrice navigateur](verification-navigateur.md).

Les essais navigateur sont locaux, sur formats émulés, avec une synthèse vocale
simulée. Ils ne valident ni le son réel, ni un téléphone physique, ni l’expérience
sur le site hébergé. La relecture individuelle annoncée par Claude reste de
**2 cellules sur 70** ; ce raccord ne ferme pas les 68 autres ni les conventions
encore ouvertes. Aucune fusion dans `main` ni publication sur melunga.com.

Le contrôle historique `prepare_corrections_ciblees.py --check` protège un ancien
snapshot sans cette couche. Il ne constitue pas le contrôle d’acceptation de
l’édition corrigée ; les contrôles ci-dessus vérifient explicitement l’avant,
l’après et les copies sans affaiblir la conservation des autres champs.
