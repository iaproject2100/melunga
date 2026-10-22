# Préparer la publication des scènes L1, langue par langue

Les sept fiches natives de Claude à `0f0a5a9` sont disponibles dans [fiches/](fiches/). Elles sont encore **vierges**. Aucune réponse native favorable ni autorisation de publication de Kartech n’est enregistrée dans ce dossier. Le site public reste inchangé.

Le [générateur original](genere_fiches_relecture.py) est repris sans modification depuis `docs/revue-pedagogique/mesures/genere_fiches_relecture.py` à ce même commit. Il peut produire une nouvelle copie des sept fiches depuis le paquet courant, dans un autre dossier, sans écraser les réponses de relecteurs :

```sh
python3 -B docs/integration-ponts-L1/publication-par-langue/genere_fiches_relecture.py melunga_deploy/content/l1-cafe.json /tmp/melunga-fiches-relecture
```

## Faire remplir les fiches

Envoyer uniquement la fiche concernée à une personne native de la langue enseignée. Elle peut écrire ses réponses directement sous les questions. La question phonétique est facultative et exige de savoir lire la langue du repère ; l’évaluation des voix de synthèse n’est pas couverte par ces fiches.

| Langue enseignée | Lecteur recherché | Fiche dans sa langue | État |
| --- | --- | --- | --- |
| Anglais | Anglophone natif | [fr→en](fiches/relecture-fr-en.md) | À remplir |
| Espagnol | Hispanophone natif | [fr→es](fiches/relecture-fr-es.md) | À remplir |
| Italien | Italophone natif | [fr→it](fiches/relecture-fr-it.md) | À remplir |
| Chinois | Sinophone natif | [fr→zh](fiches/relecture-fr-zh.md) | À remplir |
| Japonais | Japonophone natif | [fr→ja](fiches/relecture-fr-ja.md) | À remplir |
| Coréen | Coréanophone natif | [fr→ko](fiches/relecture-fr-ko.md) | À remplir |
| Français | Francophone natif | [zh→fr](fiches/relecture-zh-fr.md) | À remplir |

Pour zh→fr, c’est bien le français de la scène qui est à relire. Les caractères chinois sont des aides pour l’apprenant sinophone. Cette fiche ne demande pas de parler chinois pour juger le naturel du dialogue français.

La quatrième question examine le refus poli isolé. Les réserves sur `結構です`, `괜찮아요` et `不用，谢谢` sont également explicites. **Une autre objection sérieuse sur la scène doit aussi être résolue** : une réponse positive à la seule question 4 ne suffit pas à ignorer les autres retours.

La coquille signalée ensuite par Claude ne concerne que son message. Le paquet et la fiche chinoise portent déjà **`不用，谢谢。`** ; aucune correction du contenu ou de son aide n’est nécessaire à ce titre.

Une réplique du serveur peut être simple et plausible sans être la seule formulation possible. Elle reste toutefois du matériel linguistique à valider dans son contexte ; son rôle de compréhension ne permet pas de conserver une phrase signalée comme incorrecte ou trompeuse.

## Activation indépendante, sans changer les abonnements

Le [manifeste de suivi](statut.json) possède un enregistrement par **couple de langues**. « Français » correspond ici à zh→fr ; il ne faut pas ouvrir tous les couples d’une langue par un raccourci de code.

Chaque scène possède deux décisions séparées :

1. Un retour natif favorable sur la version exacte de la scène, avec ses éventuelles réserves résolues.
2. L’accord explicite de Kartech pour publier cette scène.

Ces deux décisions portent leur propre empreinte de la scène et une référence au compte rendu ou à l’accord conservé dans le dépôt, avec l’empreinte de ce document. **Le programme vérifie les références ; il ne juge pas le retour humain et ne donne aucun accord.** Le choix `approved` doit être renseigné après lecture et décision réelles. Aucun test ne remplit ces champs dans le manifeste livré.

Le générateur [build_l1_release.py](../../../tools/pedagogy/build_l1_release.py) produit `melunga_deploy/l1-cafe-release.js` à partir de ces décisions. Le fichier livré contient actuellement **zéro couple activé**. La liste du menu et le démarrage de la scène utilisent cette même sélection ; un appel direct ou ancien est ignoré avant de changer la carte, même pour un compte payant. Une configuration absente ou mal formée n’ouvre aucune scène.

Le fichier Netlify du site impose également `build_l1_release.py --check` avant une livraison. Il refuse une scène, un justificatif ou une liste générée qui ne correspond plus aux décisions enregistrées. La commande est vérifiée depuis la base `melunga_deploy` ; elle ne dépend pas des objets Git historiques. Ce lot prépare cette vérification sans déclencher de déploiement Netlify.

Le paquet conserve les sept scènes complètes, mais sa validation structurelle est indépendante de leur activation. Ouvrir fr→en ne nécessite donc pas de retirer les six autres du paquet ni d’obtenir leur relecture. Une scène approuvée reste **gratuite, non-abonnés compris**. Ce mécanisme n’ouvre aucun niveau L2–L10 et ne modifie ni les prix ni les droits existants. C’est une sélection éditoriale de disponibilité, pas un contrôle de sécurité des comptes.

## Au retour d’une fiche

- **Avis favorable :** conserver la fiche remplie, vérifier le contexte et toutes les remarques, enregistrer la validation de cette version. Après l’accord de Kartech, régénérer la liste et faire la revue du diff de cette seule activation. La fusion et le déploiement restent des opérations distinctes.
- **Formulation à remplacer :** prévoir d’abord un aller-retour supplémentaire avec le même relecteur. La nouvelle phrase entière et son aide selon la méthode de Kartech sortent du lot « aucune phrase rédigée » ; aucune aide ne doit être construite en collant des morceaux. Le présent dossier ne rédige aucun remplacement.
- **Scène modifiée :** remettre ses décisions en attente, actualiser son empreinte, puis obtenir les nouvelles validations. Les empreintes des décisions précédentes empêchent de les reprendre automatiquement. Les validations des six autres scènes ne sont pas annulées par ce changement local.
- **Doute non résolu :** laisser cette scène fermée. Les autres continuent leur propre revue.

## Vérifications techniques

```sh
python3 -B tools/pedagogy/build_l1_runtime.py --check
python3 -B tools/pedagogy/build_l1_release.py --check
python3 -B -m unittest discover -s tools/pedagogy -p 'test_l1_release.py'
python3 -B -m unittest discover -s tools/pedagogy -p 'test_l1_runtime.py'
NODE_PATH=/tmp/melunga-review-tools/node_modules CHROMIUM_PATH=/usr/bin/chromium node melunga_deploy/tests/l1-cafe-release.test.cjs
NODE_PATH=/tmp/melunga-review-tools/node_modules CHROMIUM_PATH=/usr/bin/chromium node melunga_deploy/tests/l1-cafe.test.cjs
NODE_PATH=/tmp/melunga-review-tools/node_modules CHROMIUM_PATH=/usr/bin/chromium node melunga_deploy/tests/lesson-async-safety.test.cjs
```

Les tests navigateur simulent les décisions d’activation par des configurations **locales de test**, sans modifier la liste livrée. Il n’y a pas de paramètre d’URL public pour ouvrir les sept scènes. Les tests de droits utilisent un compte simulé `paid:false`, jamais une création de compte ni un achat réel.

La vérification des fiches et de leurs sources est dans [verification-fiches.md](verification-fiches.md) ; les essais d’activation dans [tests-navigateur.json](tests-navigateur.json). Les contrôles de conservation et les commandes exécutées sont consignés dans [checks.json](checks.json). Aucun de ces contrôles ne remplace la relecture native ou un essai d’apprentissage.

Le reclassement L1–L10, l’italien L8, la traduction des demandes ja/ko et les décisions phonétiques chinoises restent des lots séparés. Rien n’est fusionné ni publié par ce dossier ; aucun APK n’est construit.
