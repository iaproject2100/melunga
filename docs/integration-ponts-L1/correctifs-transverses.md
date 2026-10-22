# Les trois corrections communes aux leçons

Le commit `b0171bd`, comparé à sa base `bb9f904`, ne fait pas qu’ajouter la rubrique L1. Il corrige aussi trois actions différées dans les leçons existantes. La revue doit donc distinguer l’ajout des scènes et ces corrections, qui concernent également une séance classique.

| Chemin commun | Déclencheur du défaut | Correction livrée |
| --- | --- | --- |
| Classement d’une carte (`rateCard`) | Cliquer « Je connais » ou « À revoir », puis changer de langue, de rubrique ou de carte avant la fin des 300 ms d’animation | L’action vérifie qu’elle concerne encore le même tas, mode, couple de langues, index et objet carte. Sinon elle abandonne le classement. |
| Reconnaissance vocale navigateur et adaptateur natif | Recevoir un résultat, une erreur ou une relance du microphone après avoir quitté le contexte de départ | Les rappels vérifient le tas, la carte, le mode et les langues. Une réponse périmée n’affiche pas de résultat ; une relance périmée ne redémarre pas le microphone. |
| Lecture audio et synthèse système | Une erreur de lecture ou l’arrivée tardive des voix déclenche la reprise d’une ancienne demande après qu’une nouvelle écoute a commencé ou que l’écoute a été annulée | Un jeton de demande invalide les reprises et synthèses périmées. La demande actuelle conserve ses essais de voix et son repli système. |

Ces corrections abandonnent une action devenue obsolète. Elles ne changent ni le calcul SRS, ni la durée des intervalles de révision, ni les clés de classement, ni les prix, ni les cartes du catalogue. Elles modifient bien le comportement audio et de classement dans les situations décrites : il serait inexact de présenter le lot comme entièrement additif ou d’affirmer que rien d’autre ne change.

## Vérification spécifique hors de la nouvelle rubrique

La suite `melunga_deploy/tests/lesson-async-safety.test.cjs` utilise uniquement des cartes classiques. Elle vérifie des effets observables : carte rangée et enregistrée quand l’action est actuelle ; état du nouveau tas conservé quand elle est périmée ; modèle révélé par une reconnaissance actuelle ; résultat périmé ignoré ; voix suivante et synthèse système utilisées pour l’écoute actuelle, sans reprise de l’ancienne demande.

Exécution du 22 octobre 2026 : **neuf scénarios réussis, aucune erreur JavaScript**.

Les neuf scénarios couvrent :

1. Classement classique normal, avec retrait d’une seule carte et enregistrement de sa clé.
2. Classement différé abandonné après changement de langue.
3. Classement différé abandonné après changement de rubrique.
4. Reconnaissance navigateur actuelle opérationnelle ; anciens résultat, erreur et fin ignorés après changement de langue.
5. Relance actuelle après silence conservée ; relance programmée du pack chinois abandonnée après changement de langue.
6. Reconnaissance native simulée actuelle opérationnelle ; ancien résultat ignoré après changement de langue.
7. Essai de la deuxième voix puis synthèse système pour une écoute actuelle.
8. Erreur et rejet de lecture obsolètes sans reprise par-dessus la nouvelle écoute.
9. Arrivée tardive des voix système : seule la dernière carte demandée est prononcée.

Commande reproductible, depuis la racine du dépôt :

```sh
NODE_PATH=/tmp/melunga-review-tools/node_modules \
CHROMIUM_PATH=/usr/bin/chromium \
node melunga_deploy/tests/lesson-async-safety.test.cjs
```

Les suites existantes apportent une couverture complémentaire : les gestes mobiles classiques naviguent sans classer, un geste horizontal classe toujours une carte, les contrôles d’écoute reçoivent les taps volontaires, et les formulaires de compte isolent la navigation de la leçon. La suite L1 vérifie séparément que ces actions périmées ne débordent pas dans la nouvelle rubrique.

## Limites

Les réponses réseau, les médias, la reconnaissance et l’arrivée des voix sont contrôlés. La suite teste l’orchestration réelle des fonctions et leurs effets dans le navigateur ; elle ne valide ni la prononciation effective d’un service audio, ni un moteur de reconnaissance sur un téléphone physique. Aucun compte, paiement, déploiement ou APK réel n’est utilisé. La relecture native des sept dialogues demeure une vérification distincte.
