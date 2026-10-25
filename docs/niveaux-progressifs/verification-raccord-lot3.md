# Vérification du raccord lot 3

**90 aides entières + cinq lectures/Pinyin : 95 événements, 91 identifiants,
98 objets et 102 champs corrigés.** Les 98 objets sont 88 canoniques, sept
copies de transport et trois modèles reçus. Les sept prolongations de B
conservent l’annotation précédente et ajoutent une déclaration distincte.

| Contrôle | Résultat |
|---|---:|
| Génération reproductible `build_levels.py --check` | conforme |
| Rapport indépendant lié aux fichiers réels | conforme |
| Corruptions refusées par le vérificateur Python | 69 / 69 |
| Tests ciblés lot 3 et historiques | 5 + 4 réussis |
| Corruptions ciblées JS du lot 3 | 17 / 17 refusées |
| Commandes, fiche entière, Pinyin, gestes, À revoir | 9 / 9 |
| Matrice générale navigateur | 19 / 19 |

Les quatre lectures actives sont vérifiées en DOM, bouton Pinyin puis oreille ;
la cinquième (`1608`) reste une réserve sans entraînement ajouté. Une carte
déjà corrigée en B et la carte `143` à sa première présentation puis sa reprise
emploient l’aide finale exacte. Les deux reçus zh→fr « les » restent visibles
et écoutables sans entrer dans la production ni sa progression.

La comparaison complète des 77 documents de contenu et transport avec `3df885d`
n’autorise que les champs figés, leur statut phonétique et leur annotation.
Les autres textes étudiés, sens, sources, lectures, types, identifiants,
emplacements, niveaux, rôles, étapes et accès restent identiques. Le manifeste
ajoute la déclaration de la nouvelle couche et les empreintes réelles des banques.

Les 32 115 cartes classiques et leurs 110 277 champs originaux restent intacts.
Dans le parcours, 109 469 champs catalogue sont verbatim ; 803 aides et cinq
lectures sont des corrections déclarées sur l’ensemble des deux couches.
La vérification des origines utilise des projections privées après contrôle
de chaque après réel. Le pack appelant reste inchangé, et le navigateur attend
les valeurs corrigées réellement affichées.

Le contrôle de couverture est complet : 4 217 positions / 4 215 identifiants
sur L3–L10 et les modèles reçus fr→zh ; onze positions complémentaires expliquent
les 4 228 lignes livrées. Les gloses, 340 propositions de classement et
58 lignes de conventions restent des dossiers distincts, non appliqués par
ce raccord. La lecture individuelle annoncée par Claude couvre 10/70 cellules.

Les empreintes et les commandes sont dans
[verification-raccord-lot3.json](verification-raccord-lot3.json).
Détails : [contrôle indépendant](verification-independante.md),
[commandes](verification-commandes-lecon-navigateur.md),
[matrice navigateur](verification-navigateur.md),
[contenu et couverture](reponse-revue-integrale-lot3/contenu-couverture.md).

Ces essais sont locaux, avec formats émulés et synthèse vocale simulée pour
contrôler le texte transmis. Ils ne certifient ni l’audio réel, ni un téléphone
physique, ni l’expérience du site hébergé, ni une validation native globale.
Aucune fusion dans main ni publication sur melunga.com.
