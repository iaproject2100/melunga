# Compte partagé offert : préparation et activation

Demande de Kartech : un seul compte `contact@melunga.com`, accès complet offert
sans date de fin, utilisable sur **30 appareils enregistrés au maximum**.
Ce plafond compte les identifiants de navigateur/appareil, pas les personnes ni
les connexions simultanées. Aucune création de trente adresses n'est nécessaire.

**État de cette livraison : code préparé, compte réel non activé.** Aucun accès
administratif au store Netlify n'était disponible pendant la préparation.
Les essais utilisent uniquement des comptes, mots de passe et stores fictifs.
L'activation réelle doit être confirmée par l'inspection et une connexion réelle.

## Périmètre

- Un grant `complimentaryAccess` explicite donne l'accès sans changer les
  champs commerciaux existants (`paid`, `plan`, `expiry`). Les réponses publiques
  du compte permanent portent `paid: true`, `permanent: true`, `expiry: null`.
- Le registre `devices` accepte 30 identifiants, tous types confondus. Une 31e
  inscription est refusée ; une reconnexion déjà enregistrée réutilise sa place.
- La déconnexion d'un compte permanent révoque sa session, conserve sa place et
  l'identifiant local. Effacer le stockage du navigateur crée un nouvel appareil.
  La réaffectation manuelle d'une place n'est pas incluse dans cette livraison.
- Un paiement ancien ou un ancien code de remplacement ne peut pas reconvertir
  ce registre en deux slots ni supprimer le grant. Le compte offert n'a pas de
  parcours d'achat ou de remplacement automatique.
- Les comptes ordinaires conservent les droits, tarifs et deux slots historiques.
  Les mises à jour concurrentes du compte et du cache utilisent désormais leurs
  révisions ; un refus de concurrence est explicite et les tentatives sont bornées.
- Les cartes, niveaux, phonétiques, tarifs et abonnements ne sont pas modifiés.
  Cette branche ne contient pas la maquette thématique de la PR #11.

## Contrôle administratif

`admin-shared-access.mjs` exige `Authorization: Bearer <ADMIN_SECRET>` et ne peut
agir que sur `contact@melunga.com`. Le secret reste dans les paramètres sécurisés
Netlify ; le client reçoit son équivalent via `MELUNGA_ADMIN_SECRET`, jamais via
un argument ou un fichier. Aucun secret ne doit être ajouté au dépôt ou au chat.

1. Déployer les fonctions de cette branche avant l'activation, puis vérifier
   leur disponibilité. Un aperçu est un contrôle de build, pas une validation
   du compte réel. Ne pas activer le grant avant que les fonctions de production
   sachent le reconnaître.
2. Exécuter l'inspection, qui ne modifie rien :

   ```sh
   python3 -B tools/access/shared_contact.py inspect
   ```

3. Examiner `exists`, `revision`, `registeredDevices`, `canActivate`, `blocker`
   et les champs commerciaux retournés. Une panne de lecture n'est jamais
   traitée comme une absence de compte.
4. Lancer depuis un terminal en reprenant **la révision exacte** de l'inspection :

   ```sh
   python3 -B tools/access/shared_contact.py activate --expected-revision '<revision>' --request-id '<identifiant-operation>'
   ```

   Le mot de passe demandé par le client est saisi sans affichage ni sauvegarde.
   L'identifiant d'opération non secret est affiché avant la requête. Réutiliser
   cet identifiant en cas de réponse perdue rend le nouvel appel idempotent.

L'activation crée le compte s'il est absent. S'il existe, elle exige que le mot
de passe corresponde : elle ne le réinitialise pas. L'écriture compare la
révision inspectée et refuse toute modification concurrente. Les anciens slots
sont copiés avec tous leurs champs et leurs hashes de session ; ils ne sont
jamais remplacés par des sessions fabriquées. Un registre incohérent, une
session historique sans hash ou plus de 30 appareils demande un examen, sans
écriture ni éviction automatique.

Le client refuse les redirections et n'envoie le secret qu'à `melunga.com` ou à
un hôte d'aperçu explicite du même projet. L'activation effective doit viser la
production. Ne pas employer `admin-create-account` ou `seed-demo` pour ce compte :
ce ne sont pas les opérations bornées et conservatrices définies ici.

## Validation reproductible

Depuis la racine du dépôt :

```sh
npm --prefix melunga_deploy ci --ignore-scripts --no-audit --no-fund
node --experimental-vm-modules --test melunga_deploy/tests/complimentary-*.test.cjs melunga_deploy/tests/blobs-cas.test.mjs
python3 -B tools/access/test_shared_contact.py
```

Ces tests couvrent le plafond, les reconnexions, les déconnexions, les écritures
concurrentes, la migration, l'authentification administrative, l'idempotence,
les protections contre un paiement tardif et la conservation exacte des blocs
de contenu. Aucun paiement, message ou compte réel n'est créé par les tests.
Les tests du SDK interceptent toutes ses requêtes et vérifient les vrais en-têtes
conditionnels. Un wrapper rejette les erreurs HTTP que le SDK pourrait traiter
comme une écriture réussie ; seules les absences de lecture/suppression et les
préconditions refusées sont traitées comme des résultats attendus.

Après activation, inspecter à nouveau puis se connecter sur le site réel avec
le compte partagé, vérifier les niveaux payants et la déconnexion/reconnexion
sur le même téléphone sans hausse du compteur. La compatibilité des anciennes
APK distribuées ne peut pas être prouvée à partir du seul code web présent.

Il n'y a ni activation ni validation sur le site réel tant que ces étapes n'ont
pas été exécutées avec l'accès administratif légitime.
