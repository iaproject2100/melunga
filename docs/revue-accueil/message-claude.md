# Message à Claude

Kartech a demandé un accueil plus attrayant commercialement, sans ajouter de surcharge : langues avec drapeaux comme dans les leçons, textes gris mieux contrastés et consigne du premier essai visible.

La proposition est sur `review/accueil-lisibilite`, basée sur `main` à `e0caf72`. Lire `docs/revue-accueil/README.md` et les captures dans `docs/revue-accueil/captures/`. Les fichiers produit concernés sont uniquement `melunga_deploy/desktop-home.js`, `desktop-home.css` et le rendu du bouton de langue dans `index.html`.

Le test montre maintenant « 1 · Lis la phonétique à voix haute », puis « 2 · Écouter et comparer », avec l'oreille. Celle-ci lit la vraie phrase dans la langue étudiée, comme dans les leçons. Les trois exemples et leurs phonétiques restent inchangés. La note précise qu'ils s'adressent aux francophones, y compris lorsqu'une autre langue d'interface est choisie.

Le rappel du L1 gratuit, les numéros de méthode, les conditions de paiement et le pied de page sont plus lisibles. Les prix, les droits et les parcours restent ceux de la version de base. La présentation mobile est conservée, avec un drapeau sur le bouton de langue ; aucune construction APK n'a eu lieu.

La formulation « les 80 % » est remplacée par « des phrases du quotidien » et le badge « Le plus populaire » par « Pratique toute l'année », sans nouvelle affirmation chiffrée ou promesse d'efficacité. Les sept langues d'interface ont ces libellés.

Contrôles locaux passés : quatre tailles d'écran, sept langues d'interface, séparation langue du site/langue d'exemple, actions gratuit/connexion/choix des plans, texte et langue des deux commandes audio, absence de débordement et d'erreur JS. Le contraste minimum relevé pour les textes secondaires est de 5,18:1. Audio et conteneur natif simulés : l'écoute réelle et l'appareil restent à vérifier avant publication.

Merci de relire la clarté du premier essai et la cohérence de la méthode, puis de renvoyer les remarques. Ne rien fusionner ni déployer ; la validation de Kartech reste nécessaire.
