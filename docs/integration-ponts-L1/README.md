# Intégration des sept premiers échanges L1 — lot de revue

Ce lot relie les sept scènes vérifiées par Claude à la **carte de leçon de l’application**, dans une branche séparée. Il n’est ni fusionné ni publié. Base : `main` à `bb9f904`. Contenu approuvé techniquement : `30e7d40`, branche `review/ponts-L1-sept-langues`.

## Ce que verra l’apprenant

Le [lot d’activation sur instruction directe](activation-instruction/README.md) ouvre maintenant les sept scènes dans la branche de revue. Kartech a supprimé l’exigence de justificatifs nominatifs ; le [manifeste par langue](publication-par-langue/statut.json) enregistre sa décision. Les formulaires restent facultatifs et aucune preuve native individuelle n’est inventée. La fusion et la mise en production ne sont pas effectuées par ce changement.

Dans les thèmes, à côté du parcours guidé, « Premier échange · L1 » ouvre la scène du café pour le couple de langues sélectionné. Les couples disponibles sont français → anglais, espagnol, italien, chinois, japonais, coréen, et chinois → français.

La préparation présente la salutation, la commande, le refus poli et la demande de prix, ainsi que les trois répliques à comprendre. Viennent ensuite l’écoute de l’échange, les réponses avec aide, puis les réponses sans modèle. Dans cette dernière étape, seules les phrases de l’apprenant sont masquées ; la réponse peut être réaffichée. L’interlocuteur reste toujours à comprendre et n’est jamais transformé en exercice de production.

**L’oreille reste visible pendant le rappel.** Un appui explicite réaffiche le modèle et ses aides exactes, puis lit la phrase étudiée. Cela constitue une demande d’aide, sans note ni validation de maîtrise. Le sens dans la langue du lecteur reste affiché avant cette demande. L’oreille des répliques reçues fonctionne directement ; ces répliques ne sont jamais masquées. Les appels d’écoute sans appui sur cette aide, notamment les commandes d’arrière-plan, ne dévoilent pas une réponse masquée.

La carte conserve le fond choisi, les pastilles, l’oreille, l’écoute, les menus, les sélecteurs et l’accès au compte. Les deux boutons du bas servent temporairement à réécouter et continuer. Les gestes font avancer ou reculer dans la séquence sans ranger les phrases dans « Je connais », sans calculer de maîtrise et sans alimenter les révisions espacées. La fin du parcours constate uniquement que les étapes ont été parcourues.

## Périmètre et conservation

- Les 49 répliques référencées sont extraites des sources vérifiées. Les textes, traductions, phonétiques et lectures présentes restent identiques, y compris pour les deux fragments du tour scindé.
- Le catalogue, les familles du parcours guidé existant, les prix et les droits des contenus déjà proposés sont conservés. Le niveau gratuit et sa réserve ne sont pas réduits.
- **Les sept nouvelles scènes sont gratuites, y compris sans abonnement.** C’est un enrichissement de l’offre L1 gratuite, pas une absence de nouvel accès. L2–L10 conservent leurs conditions existantes. Le serveur de droits et les paiements ne sont pas modifiés.
- Le nouveau mode est limité à L1 et aux sept couples. Aucun accès à L2–L10 n’est accordé.
- La branche expérimentale « Mes phrases » et ses 110 fichiers ne sont pas importés : ce lot fournit le paquet autonome nécessaire aux sept scènes.
- Le passage de « Bonjour » au niveau 1 du catalogue n’est pas appliqué.
- Ce lot ne reclasse pas l’ensemble L1–L10 et ne résout pas l’audit de fond des autres niveaux. Il ne modifie aucune convention phonétique.
- Aucun APK n’est construit ou publié.

L’intégration inclut aussi **trois corrections communes à l’application**, distinctes des scènes : abandon d’un classement de carte devenu périmé, abandon des rappels de reconnaissance vocale après changement de contexte, annulation des reprises audio périmées. Leur portée et leurs vérifications sont détaillées dans [correctifs-transverses.md](correctifs-transverses.md). Le lot n’est donc pas présenté comme purement additif.

## Base de comparaison

Après récupération du `main` distant le 22 octobre 2026, sa référence est `bb9f904d79afff6efee19a80e7fe80980c733514`. Les dix commits d’interface cités dans la relecture en sont déjà des ancêtres. Comparer cette base à `b0171bd` donne **0 commit derrière, 1 devant**. Les onze commits se reproduisent contre l’ancienne base `25a7cad` ; cela ne prouve pas quelle référence était utilisée lors de la relecture. Aucun rebasage ni changement d’historique n’est nécessaire pour séparer l’intégration des changements déjà présents dans `main`.

Les preuves sont conservées dans [provenance-main.json](provenance-main.json). La vérification de Claude sur `b0171bd` est conservée sans retouche dans [verification-integration-claude.md](verification-integration-claude.md). Les corrections de l’oreille et les précisions de ce dossier sont ajoutées dans un commit de suivi séparé.

## Reproduire

Depuis la racine du dépôt, les sources historiques doivent être disponibles dans Git. Avec un clone superficiel, récupérer d’abord la branche `review/ponts-L1-sept-langues`.

```sh
python3 tools/pedagogy/build_l1_runtime.py --check
python3 -m unittest discover -s tools/pedagogy -p 'test_l1_runtime.py'
NODE_PATH=/tmp/melunga-review-tools/node_modules node melunga_deploy/tests/l1-cafe.test.cjs
NODE_PATH=/tmp/melunga-review-tools/node_modules node melunga_deploy/tests/lesson-async-safety.test.cjs
```

Pour vérifier la configuration livrée, servir `melunga_deploy` avec un serveur HTTP et ouvrir `app.html?start=1` : « Premier échange · L1 » apparaît dans les rubriques des sept couples. Les tests navigateur utilisent cette configuration réelle, puis des listes locales vides ou partielles pour vérifier la fermeture et l’indépendance des langues.

Le contrat du paquet est décrit dans [runtime-contract.md](runtime-contract.md). La relecture indépendante du contenu est conservée dans [verification-claude.md](verification-claude.md). Les résultats d’intégration sont consignés dans [validation.md](validation.md).

## Points de revue avant publication

Une validation native est rapportée dans le message transmis par Kartech. Les pièces jointes de consignation restent vierges ; elles ne sont pas transformées en comptes rendus remplis. Sur son instruction explicite, leur dépôt nominatif n’est plus une condition d’activation. Les contrôles techniques ne sont pas présentés comme une certification linguistique.

Une [fiche de relecture native à remplir](relecture-native-a-remplir.md) rassemble les 49 répliques exactes et les vérifications par langue. Ce modèle de collecte reste vierge et facultatif.

Le registre de « Je veux » dans les unités historiques et les écarts de conventions phonétiques entre corpus restent des sujets séparés. Les changer ici contredirait la conservation exacte demandée.

Claude a vérifié indépendamment `b0171bd`. La revue du suivi porte sur l’oreille accessible pendant le rappel et sur la distinction explicite entre scènes, corrections communes et offre L1 enrichie. La fusion et la publication attendent la validation de Kartech.
