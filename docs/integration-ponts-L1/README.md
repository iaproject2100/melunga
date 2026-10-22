# Intégration des sept premiers échanges L1 — lot de revue

Ce lot relie les sept scènes vérifiées par Claude à la **carte de leçon de l’application**, dans une branche séparée. Il n’est ni fusionné ni publié. Base : `main` à `bb9f904`. Contenu approuvé techniquement : `30e7d40`, branche `review/ponts-L1-sept-langues`.

## Ce que verra l’apprenant

Dans les thèmes, à côté du parcours guidé, « Premier échange · L1 » ouvre la scène du café pour le couple de langues sélectionné. Les couples disponibles sont français → anglais, espagnol, italien, chinois, japonais, coréen, et chinois → français.

La préparation présente la salutation, la commande, le refus poli et la demande de prix, ainsi que les trois répliques à comprendre. Viennent ensuite l’écoute de l’échange, les réponses avec aide, puis les réponses sans modèle. Dans cette dernière étape, seules les phrases de l’apprenant sont masquées ; la réponse peut être réaffichée. L’interlocuteur reste toujours à comprendre et n’est jamais transformé en exercice de production.

La carte conserve le fond choisi, les pastilles, l’oreille, l’écoute, les menus, les sélecteurs et l’accès au compte. Les deux boutons du bas servent temporairement à réécouter et continuer. Les gestes font avancer ou reculer dans la séquence sans ranger les phrases dans « Je connais », sans calculer de maîtrise et sans alimenter les révisions espacées. La fin du parcours constate uniquement que les étapes ont été parcourues.

## Périmètre et conservation

- Les 49 répliques référencées sont extraites des sources vérifiées. Les textes, traductions, phonétiques et lectures présentes restent identiques, y compris pour les deux fragments du tour scindé.
- Le catalogue, les familles du parcours guidé existant, les prix et les droits d’accès sont conservés. Le niveau gratuit et sa réserve ne sont pas réduits.
- Le nouveau mode est limité à L1 et aux sept couples. Aucun accès à L2–L10 n’est accordé.
- La branche expérimentale « Mes phrases » et ses 110 fichiers ne sont pas importés : ce lot fournit le paquet autonome nécessaire aux sept scènes.
- Le passage de « Bonjour » au niveau 1 du catalogue n’est pas appliqué.
- Ce lot ne reclasse pas l’ensemble L1–L10 et ne résout pas l’audit de fond des autres niveaux. Il ne modifie aucune convention phonétique.
- Aucun APK n’est construit ou publié.

## Reproduire

Depuis la racine du dépôt, les sources historiques doivent être disponibles dans Git. Avec un clone superficiel, récupérer d’abord la branche `review/ponts-L1-sept-langues`.

```sh
python3 tools/pedagogy/build_l1_runtime.py --check
python3 -m unittest discover -s tools/pedagogy -p 'test_l1_runtime.py'
NODE_PATH=/tmp/melunga-review-tools/node_modules node melunga_deploy/tests/l1-cafe.test.cjs
```

Pour une vérification manuelle locale, servir `melunga_deploy` avec un serveur HTTP, ouvrir `app.html?start=1`, choisir le couple de langues, puis ouvrir les thèmes et « Premier échange · L1 ». Vérifier aussi la sortie vers les cartes habituelles, la connexion et les sélecteurs sur ordinateur et téléphone.

Le contrat du paquet est décrit dans [runtime-contract.md](runtime-contract.md). La relecture indépendante du contenu est conservée dans [verification-claude.md](verification-claude.md). Les résultats d’intégration sont consignés dans [validation.md](validation.md).

## Points de revue avant publication

La relecture native des sept scènes reste en attente. Elle doit vérifier le refus détaché, le naturel et l’intonation des échanges, notamment `結構です` en japonais et `괜찮아요` comme refus en coréen. Les contrôles techniques et la revue de Claude ne remplacent pas cette relecture.

Le registre de « Je veux » dans les unités historiques et les écarts de conventions phonétiques entre corpus restent des sujets séparés. Les changer ici contredirait la conservation exacte demandée.

La revue croisée doit maintenant porter sur **l’application réelle** : ordre des étapes, exactitude des aides affichées, masquage, répliques reçues, écoute, navigation, retour aux cartes habituelles, droits inchangés. La fusion et la publication attendent la validation de Kartech.
