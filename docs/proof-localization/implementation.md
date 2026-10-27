# Démarrage de la démonstration dans la langue choisie

Deux cas de retour au français sont établis par les contre-vérifications : le fichier externe de traduction absent/incomplet, et une préférence native conservée dans l’ancien parcours mais ignorée par l’accueil. Les sept sessions publiques fraîches avec dictionnaire chargé fonctionnaient déjà ; les rapports ne prétendent pas identifier avec certitude l’état du téléphone de Kartech.

L’accueil embarque maintenant 48 libellés existants nécessaires à la preuve, à ses commandes et au choix de langue. Les noms des langues et les deux formats d’accessibilité nécessaires sont aussi repris des mêmes dictionnaires. Le fichier partagé du cours reste chargé, mais son absence ou une ancienne version ne ramène plus ces écrans au français. Le script ordinateur utilise le même accès de traduction et n’appelle plus directement un module potentiellement absent.

`tools/maquette-guidee/build_home_i18n.cjs` génère le bloc marqué de index.html depuis les fichiers de traduction validés. `--check` empêche la divergence entre les sources et le bloc embarqué. Aucune nouvelle phonétique n’est créée. L’exemple et son avertissement traduit sont conservés.

La priorité initiale est : langue explicite valide dans l’URL, préférence d’accueil valide, ancienne langue native valide, langue native d’un couple sauvegardé valide et distinct, puis français. La démonstration se relocalise aussi à son ouverture. L’index demande le dictionnaire partagé v5 et le script ordinateur v2 pour actualiser les caches.

Le héros anglais utilise une taille adaptée afin de garder « demonstration » sur une seule ligne. Le nom accessible de l’application devient simplement « Melunga ». Ces retouches ne changent pas la disposition du parcours, les contenus, les prix, les droits ou les voix choisies.

```sh
node tools/maquette-guidee/build_home_i18n.cjs --check
node tools/maquette-guidee/build_course_i18n.cjs --check
```
