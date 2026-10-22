# Vérification de `939b82e` — et correction de mon erreur sur le périmètre

Objet : `939b82e` sur `review/integration-ponts-L1`, qui répond aux trois points de `verification-integration-ponts-L1.md`. Rien n'est fusionné ni publié.

## 1. Mon erreur sur les onze commits

**Codex a raison et j'avais tort.** J'avais écrit que la branche était onze commits devant `main` et que la fusionner publierait dix changements d'interface non vérifiés. C'était faux, et la cause est entièrement de mon côté : **j'ai comparé contre une référence `origin/main` périmée**, n'ayant récupéré que les branches de revue sans rafraîchir `main`.

Après récupération, le constat est net :

```
origin/main = bb9f904
commits de la branche absents de main :
  939b82e  Keep the ear accessible during L1 recall and clarify reviewed scope
  b0171bd  Integrate seven prepared L1 cafe exchanges into the lesson app
```

**Deux commits, pas onze.** `bb9f904` — que je citais parmi les « dix non vérifiés » — est devenu `main` lui-même. Et le diff produit contre le `main` à jour ne contient plus ni `index.html`, ni `desktop-home.js`, ni `desktop-home.css`, ni les feuilles de leçon : seulement `app.html`, `l1-cafe.js`, `l1-cafe.css`, `content/l1-cafe.json`, `native-speech.js`, les deux fichiers de tests et les deux outils. Soit exactement le travail L1.

Aucun rebasage n'est nécessaire, comme il l'écrit. La leçon est pour moi : une comparaison de branches ne vaut rien sans récupération préalable de la base, et j'aurais dû la faire avant d'écrire un paragraphe qui conseillait un rebasage inutile.

## 2. L'oreille pendant le rappel — corrigée, et mieux que mes propositions

J'avais laissé trois issues au choix. Sa solution n'est aucune des trois et elle est meilleure : **l'oreille reste visible et active, et l'appuyer révèle le modèle explicitement** avant de lire la phrase. On ne peut donc pas s'entendre souffler la réponse tout en gardant le bénéfice du rappel — l'aide est enregistrée (`helped = true`) au moment où elle est prise.

Vérifié à l'exécution, en utilisateur non payant, sur fr→ko, fr→zh et zh→fr :

| Moment | État de la carte | Oreille |
|---|---|---|
| Rappel, réplique masquée | texte et phonétique vides, **sens conservé** | **visible et active**, intitulée « Retrouver le modèle et écouter la phrase » |
| Appui sur un bouton d'arrière-plan | **reste masquée** — aucune révélation | inchangée |
| Appui sur l'oreille | **révélée** : texte et phonétique réaffichés | intitulée « Écouter la phrase » |
| Réplique reçue (non masquée) | affichée en entier | **directement active**, sans révélation |

Le garde-fou `if (btn !== nodes.ear) return;` est effectif : j'ai appelé `listen()` avec le bouton d'écoute d'arrière-plan et la carte est restée masquée. L'intitulé est localisé pour le lecteur sinophone (`查看范例并听这句话`). L'oreille d'origine de la carte est remplacée au démarrage et rétablie à l'arrêt, donc la carte classique n'est pas touchée. Aucune erreur JavaScript.

## 3. Les neuf tests supplémentaires portent bien sur les leçons classiques

C'était ma réserve de fond sur `b0171bd` : les trois corrections de conditions de course touchent la notation et l'audio, donc ce que tout le monde utilise, et rien ne prouvait qu'elles étaient correctes **hors** de la nouvelle rubrique. `tests/lesson-async-safety.test.cjs` répond précisément à cela. Exécuté chez moi, 0 erreur, et les neuf parcours sont tous énoncés côté classique :

- la notation courante archive toujours la carte d'origine ;
- la notation en attente est abandonnée après un changement de langue, puis après un changement de rubrique ;
- le résultat de reconnaissance courant fonctionne, les résultats, erreurs et fins périmés sont ignorés après un changement de langue ;
- la relance après silence fonctionne, la relance chinoise programmée est annulée au changement de langue ;
- le résultat natif simulé courant fonctionne, le résultat obsolète est écarté ;
- l'audio courant essaie la deuxième voix puis le repli système ;
- un échec média obsolète ne peut pas redémarrer par-dessus la lecture courante ;
- un repli retardé reste utilisable et ignore la requête précédente.

C'est la preuve que je demandais, et elle est prise du bon côté. La suite `l1-cafe` repasse par ailleurs à **448 étapes, 0 erreur**.

## 4. État du lot

Les trois points de ma vérification précédente sont traités : le périmètre était une erreur de ma part, l'oreille est corrigée et vérifiée, les corrections transverses sont désormais testées côté classique. Le contenu livré avait déjà été vérifié identique aux sources (168 champs, 0 écart) et `939b82e` ne touche pas `content/l1-cafe.json`.

**Je n'ai plus de réserve technique sur ce lot.**

Deux choses restent, et aucune n'est technique :

- **La relecture native des sept scènes**, toujours en attente. Il a joint `relecture-native-a-remplir.md` pour la recueillir, ce qui est la bonne manière de ne pas la perdre de vue. Aucun test ne la remplace : ni ses 448 étapes ni mes 168 champs ne disent si le refus détaché sonne juste. J'y maintiens l'ajout du japonais 結構です.
- **La décision d'accès à énoncer clairement** : les sept scènes sont gratuites pour tous, y compris les non-payants. C'est une extension du gratuit, conforme à la consigne, mais c'est une décision et elle doit être consciente.

Le reste de l'audit L1–L10 est hors de ce lot et inchangé : L7 plus difficile que L8 dans les sept langues, la zone L2–L4 en dents de scie, le bloc L8 italien à 52–54 %, la question de méthode sur ce que « élément préparé » signifie, le registre de `L1-03` en ja et ko, et la décision phonétique chinoise à prendre règle par règle.
