# Vérification après publication

La PR nº 10 a été fusionnée le 23 octobre 2026 à 10:33 UTC : `dfdf6e42bd9ad324b903f320508accd2a7e7154c`. Elle contient le parcours progressif complet **et** les sept scènes café ; GitHub a automatiquement marqué la PR nº 9 comme intégrée. Une seule fusion produit a été nécessaire.

Les contrôles ci-dessous interrogent **https://melunga.com**, sans serveur local de contenu ni réponses de compte ou de leçon substituées. Ce dossier de constat est conservé sur la branche de suivi ; il ne nécessite aucune nouvelle fusion produit.

## Ce qui a été contrôlé

- 19 fichiers effectivement servis : correspondance avec le commit fusionné. L’HTML de l’application présente seulement deux réécritures Netlify attendues (`/terms.html` → `/terms`, `/privacy.html` → `/privacy`) ; tous les autres octets de cette page sont identiques. Les autres fichiers contrôlés sont identiques octet pour octet.
- Sept couples, dix niveaux et neuf microleçons L1 par couple servis avec `owner-instruction-activated` et `publicationApproved:true`.
- Catalogue servi : **32 115 cartes**, contenu et niveaux strictement identiques à la production historique `bb9f904`. Anciennes familles guidées également intactes.
- Fichier café servi : `status: owner-instruction-activated`, `nativeReviewPending:false`, `sourceCommit:30e7d40a8af3f51ee186bf83f983596b8ca8798f` inchangé ; fichier d’activation des sept couples identique au commit.
- Prix, grille et fonctions d’abonnement inchangés. L’API de prix réelle répond HTTP 200 ; depuis l’emplacement de ce navigateur elle affiche la grille USD existante. La grille EUR inchangée reste 7,90 € / 42 €.
- L’ancien atelier ouvert à tous les niveaux n’est plus publié : son adresse redirige vers l’application et les droits normaux.

## Parcours navigateur réel

Chromium en émulation mobile/tactile 390 × 844, TLS vérifié et proxy conservé : **fr→zh et fr→es, neuf leçons chacun, 53 étapes chacun, 106 étapes au total**. L’oreille pendant le rappel, les reçus visibles, l’accès à la bibliothèque gratuite, le refus du L2 complet et l’activation de la rubrique café distincte passent. **Zéro erreur JavaScript non interceptée.**

Les sessions étaient **invitées non payantes**, sans droit injecté et sans connexion à un compte réel. Ce test n’est donc ni un essai sur téléphone physique, ni un essai d’authentification d’un compte gratuit existant. Aucun compte n’a été créé et aucun paiement n’a été déclenché. La fonction audio réelle a été conservée ; le texte demandé est vérifié, l’audibilité et la qualité acoustique ne sont pas attestées.

Le rapport conserve les échecs de requête observés : police Google bloquée par le proxy de l’environnement et requêtes annulées lors de changements d’étape/langue ou de fermeture de contexte. Ils ne sont pas présentés comme un essai réseau sans aucun incident. Le rendu et la navigation sont passés avec la police de secours. Aucun contournement de politique réseau ni désactivation TLS n’a été utilisé ; Chromium a été exécuté avec l’accès nécessaire à son magasin de certificats existant.

## Pièces

- [Fichiers du site réel](controle-fichiers-production.json)
- [Parcours navigateur réel](controle-navigateur-production.json)
- [Contrôle indépendant des fichiers](controle-production-independant.json)
- [Réconciliation des compteurs](reconciliation-gratuit.md)
- [2 228 droits exacts avant/après : zéro perte, zéro nouveau droit](droits-avant-apres.json)
- [Passage à la main sur téléphone](passage-manuel-telephone.md)

Les deux risques éditoriaux acceptés par Kartech restent distincts de ces vérifications : le nouvel enchaînement L1 n’est pas déclaré relu en natif, et les tests ne certifient pas l’acquisition. Les réserves pédagogiques déclarées dans le README ne sont pas réputées résolues.
