# Vérification du lot 6 — coréen, aides/lectures et contenu séparés

État historique du lot 6 à `d56fe23`. Le [lot 7](verification-raccord-lot7.md) décrit l’édition actuelle.

État consigné le 25/10/2026 à 20:44 CET. Horodatages détaillés des essais dans leurs JSON.

**Deux registres disjoints, 65 identifiants, 65 objets et 74 champs corrigés.**
Le premier porte 18 aides entières et cinq lectures liées, appliquées en cinq
paires atomiques et treize aides seules : 17 canoniques et un modèle reçu,
23 champs. Le second porte 45 gloses certaines et deux blocs complets
étude/lecture/aide : 47 canoniques et 51 champs. Aucune copie de transport
supplémentaire n’est concernée.

| Contrôle | Résultat |
|---|---:|
| Génération reproductible | conforme |
| Rapport indépendant lié aux fichiers réels | conforme |
| Contre-épreuves Python refusées | 131 / 131 |
| Tests ciblés et historiques | 6 + 20 réussis |
| Nouvelles corruptions JavaScript refusées | 32 / 32 |
| Commandes, Pinyin, gestes, À revoir, fiche entière | 9 / 9 |
| Matrice générale navigateur | 19 / 19 |

Les cinq paires, deux premières rencontres L1 et le modèle reçu sont vérifiés
dans le DOM et par le texte entier transmis à la synthèse vocale. Les deux
blocs coréens restent complets ; les cinq 한국어 et les dix mille wons ont leur
sens corrigé. Les 18 choix de registre sont contextualisés, sans règle
universelle tu/vous. L’ancienne correction B de 3980 et les autres annotations
antérieures restent intactes.

Les 77 JSON sont comparés intégralement à `161d0eb` après projection privée des
seuls champs attestés. Les **36 fichiers HTML/CSS/JS directement sous
melunga_deploy** restent identiques. Les identifiants, types, placements,
niveaux, rôles, étapes, prix, droits et la présentation sont conservés.
Seuls les deux blocs de contenu changent leur étude coréenne ; ces exceptions
sont explicites et ne réécrivent pas les sources originales.

Les **32 115 cartes classiques et leurs 110 277 champs originaux restent intacts**.
Dans le parcours, **109 078 champs catalogue restent verbatim** ; 1 199 sont
des exceptions enregistrées de l’ensemble des couches : 1 075 aides, 17
lectures, quatre études et 103 sens. Les après ne sont pas présentés comme des
copies verbatim des origines. La projection de contrôle ne modifie pas le pack
appelant. Les 45 gloses comprennent 44 cartes du catalogue et une situation
rédigée, ce qui explique l’augmentation de 44 sens dans ce seul périmètre.

La couverture est exacte : **4 770 positions / 4 766 identifiants**. Les 447
propositions, 260 conventions et 148 gloses incertaines restent non appliquées.
Le batchim est une décision d’ensemble en attente ; les lectures locales de
닭 ne la tranchent pas. La lecture individuelle annoncée par Claude atteint
**40/70 cellules**, trente restent à lire.

Deux rectifications documentaires sont consignées : cinq 한국어 à corriger,
et non six dans le résumé de Claude ; le motif de 4125 devrait citer [달기],
les valeurs après `dalg-i` et `dal-gui` étant correctes. Le correctif japonais
833 ne change que le before d’une proposition incertaine, sans effet produit.
Les preuves anciennes restent figées.

[Preuves, commandes et empreintes](verification-raccord-lot6.json),
[contrôle indépendant](verification-independante.md),
[commandes](verification-commandes-lecon-navigateur.md),
[matrice navigateur](verification-navigateur.md),
[compte rendu](reponse-revue-integrale-lot6/README.md).

Essais Chromium locaux, formats émulés, TTS simulée pour le texte transmis.
Aucun téléphone physique, son réel, parcours du site hébergé ou validation
native globale revendiqué. Aucune fusion dans main ni publication sur melunga.com.
