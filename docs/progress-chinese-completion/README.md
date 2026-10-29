# Progression du premier thème chinois

La règle validée par l’utilisateur est désormais : **« Suivant » valide la carte travaillée ; « À revoir » la garde à retravailler.** Sur mobile, les étapes d’écoute, d’imitation et de préparation restent présentes ; la validation intervient au rappel final de production. Sur ordinateur, « Suivant » valide la carte affichée avant de passer à la suivante.

Le nouveau test d’acceptation est `melunga_deploy/tests/next-progress.browser.cjs`. Il utilise les pages et contenus réels, avec seulement l’accès, le catalogue de voix et la lecture audio simulés localement. Il n’injecte aucune décision de connaissance et n’utilise aucun compte réel. Il vérifie :

- Les 89 clics « Suivant » du premier thème chinois : aucune validation à l’écoute ou à l’imitation, cinq cartes après la première séquence source (**1 %**), puis 29 cartes sur 314 (**9 %**) à la fin du thème. Les deux étapes de préparation ne créent aucune validation supplémentaire.
- La persistance de ces 29 cartes après rechargement et un nouveau parcours complet sans doublons.
- Sur ordinateur, les 29 clics « Suivant » valident les 29 cartes et leur progression persiste.
- Le retour réel aux thèmes après les 15 premiers clics affiche bien **1 %**. Une seconde langue native, le coréen avec le français appris (`ko-fr`), valide également le premier rappel par « Suivant » et conserve cette carte après rechargement, sans modifier les cinq cartes chinoises déjà acquises.
- « À revoir » conserve la carte en attente malgré la poursuite du thème ; un rappel réussi depuis la liste « À revoir » la valide et retire son rappel. Redemander « À revoir » annule sa validation et ne duplique pas le rappel.
- Un échec d’enregistrement bloque la navigation, conserve le rappel et permet une nouvelle tentative explicite sur mobile et ordinateur.
- Les deux tours de l’interlocuteur du premier thème de situation ne comptent pas. Les contenus progressifs actuels n’ont pas de modèles à compléter : le vrai thème `personnaliser` de la page classique vérifie que ces modèles n’alimentent pas la progression moderne, sans modification de données source. Ce contrôle ne prouve pas l’exclusion d’un futur modèle inséré dans un parcours progressif.

Exécution reproductible :

```sh
NODE_PATH=/tmp/melunga-review-tools/node_modules:/opt/codex/cua_node/lib/node_modules \
NEXT_PROGRESS_REPORT=docs/progress-chinese-completion/acceptance-after.json \
NEXT_PROGRESS_CAPTURES=docs/progress-chinese-completion \
node --test melunga_deploy/tests/next-progress.browser.cjs
```

Résultat après gel des sources : **6 tests réussis**, aucune erreur navigateur ni requête inattendue, et empreintes des entrées stables durant l’exécution. Le rapport complet est `acceptance-after.json`. Les captures `corrected-first-sequence-one-percent.png`, `corrected-after-mobile.png` et `corrected-after-desktop.png` montrent les barres réellement affichées à 1 % puis 9 %. Les captures `corrected-before-mobile.png` et `corrected-done-mobile.png` conservent les états de départ et de fin.

Les observations initiales ci-dessous sont conservées pour expliquer le défaut signalé. Elles décrivent la version avant correction.

## Diagnostic avant correction

Le problème signalé est reproduit sur les sources `5f8298b26d0c4e7b9530706579ce8b1b09ee229b`, sans modification du produit. Les contrôles utilisent Chromium, les pages et contenus réels du dépôt, des réponses API locales explicites pour l’accès et les voix, et aucun compte ou son réel.

Le premier thème français–chinois L1, « Saluer et faire connaissance », regroupe six séquences source et 29 expressions distinctes. Son ouverture crée la leçon `fr-zh:saluer:all`, de portée `theme`.

- Sur mobile de 390 × 740 px, 89 clics réels sur « Suivant », avec choix explicite lorsque nécessaire, atteignent « Thème terminé ». Le retour aux thèmes puis le rechargement restent à **0 / 314, soit 0 %**. Aucune écriture n’a lieu dans le registre des cartes connues ni dans la liste « À revoir ».
- Sur ordinateur de 1366 × 768 px, 29 clics sur « Suivant » parcourent les mêmes expressions puis atteignent la fin. Le résultat est également **0 / 314, soit 0 %**, après retour et rechargement.
- Dans une session fraîche, cinq gestes réels de glissement vers la droite produisent cinq déclarations de connaissance. La barre devient **5 / 314, soit 1 %**.

La première séquence source contient cinq cartes éligibles : sa validation représenterait 1 % du niveau. Les 29 cartes du premier thème visible représenteraient 9 %. Le dénominateur de 314 exclut les modèles à compléter et les paroles de l’interlocuteur.

Le code initial séparait navigation et connaissance : « Suivant » appelait `advanceStep` sur mobile ou `browsePhrase` sur ordinateur ; seule `markKnown`, accessible par glissement vers la droite, enregistrait une carte connue. Le test historique `level-progress.browser.cjs` affirmait explicitement que continuer et terminer un thème ne déclarait pas une connaissance. Le résultat constaté était donc cohérent avec cette ancienne règle, mais la règle n’était pas visible dans la présentation à deux actions « À revoir » et « Suivant ».

Aucune progression de l’utilisatrice n’est accessible depuis cette session et aucune donnée utilisateur n’a été altérée. La correction ne peut pas reconstituer les anciennes validations absentes du stockage.

Le rapport `reproduction-before.json` contient trois cas, les états à chaque étape et 169 empreintes de sources stables. Les captures `before-*`, `done-*`, `after-*` montrent les situations réelles ; `five-known-swipes.png` montre la déclaration de connaissance explicite.
