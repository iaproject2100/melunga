# Régressions existantes après le garde de présentation du cours

Les deux suites de navigateur existantes ont été exécutées sans modification sur les fichiers runtime gelés de la correction du clignotement au démarrage du cours.

- `start-return-routing.browser.cjs` : **8 groupes réussis, 28 cas**. Lancement gratuit et premium, abonnements confirmés, reprise d’anciens liens, fermeture de paiement, entrée directe consommée une fois et conservation des routes natives/classiques explicites.
- `course-entry-access.browser.cjs` : **6 groupes réussis, 29 cas**. Droits et contenus historiques, confirmation serveur des accès, entrée gratuite, connexion et retour autorisé, paramètres refusés et affichage réel des contenus gratuits/payants.

Les rapports finaux indiquent des sources stables pendant chaque exécution. Les 55 et 208 empreintes d’entrée correspondantes ont aussi été comparées aux fichiers présents après les tests : aucune différence. Les résultats et cette vérification sont consignés dans `summary.json`.

Après ces exécutions, un ajustement final a retiré le garde de démarrage de la page historique `maquette-guidee.html`, que son adaptateur ne prend pas en charge. Le fichier final est exactement celui du commit `7a173947b64c3cb3e76d04ee281b98876e14853f`, avec seulement les deux versions de cache `39 → 40` et `6 → 7`. Cette page figure dans les empreintes statiques, mais aucune des deux suites ne la charge ni ne la parcourt : les 146 chemins de navigation enregistrés portent uniquement sur `index.html`, `app.html` et `parcours-niveaux.html`.

La preuve `final-delta.json` distingue ce seul changement runtime des trois métadonnées de pins Chirp régénérées par la validation source. Tous les autres fichiers runtime exécutés restent identiques. Elle ne prétend pas que ces deux suites ont testé la page historique finale ; celle-ci a sa propre validation finale séparée. Les indicateurs d’égalité de `summary.json` sont datés de la fin des tests, et le delta final est explicitement référencé.

Les requêtes et médias sont des fixtures locales explicites. Aucun compte, paiement ou audio réel n’est utilisé. Aucun essai sur appareil physique ou Safari n’est revendiqué. Aucun fichier produit ou fichier de test n’a été modifié par ces validations.
