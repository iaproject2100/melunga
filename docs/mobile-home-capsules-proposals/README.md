# Accueil mobile — quatre propositions de capsules translucides

Demande : réunir « Essayer gratuitement », « Créer un compte » et le choix de langue sur la première page, dans des capsules translucides. Ce dossier ne modifie aucun fichier de l’application et n’est importé par aucune page de production.

La page d’accueil réelle du commit `ba3ac02313820b19cb4506c647c1e17f08543480` sert de base. Le prototype réorganise ses commandes dans un navigateur local et utilise le véritable logo Melunga. Le logo, le titre, le fond et les textes restent identiques entre les quatre propositions. Les bulles sont figées pour permettre une comparaison visuelle stable.

1. **Trois capsules** : essai large, compte et langue sur la deuxième rangée.
2. **Une barre compacte** : une capsule horizontale commune, divisée en trois commandes.
3. **Deux grandes touches** : essai et compte côte à côte, capsule de langue au-dessus.
4. **Un écrin de verre**, conseillé : un seul cadre translucide sur deux rangées, avec l’essai mis en avant.

« Voir un exemple » et « Se connecter » restent disponibles comme actions secondaires. Le choix de langue concerne la **langue de l’application**, comme sur l’accueil actuel ; le choix de la langue à apprendre reste dans l’étape suivante.

La création de compte est représentée par un nouveau bouton qui ouvre l’écran `signup` déjà présent dans la page. Le prototype ne modifie aucun mécanisme d’authentification et ne crée aucun compte. Une éventuelle intégration devra conserver les règles d’inscription de l’application.

- [Galerie comparative](index.html)
- [Maquette 1](captures/accueil-capsule-1.png)
- [Maquette 2](captures/accueil-capsule-2.png)
- [Maquette 3](captures/accueil-capsule-3.png)
- [Maquette 4](captures/accueil-capsule-4.png)

Les captures sont des rendus du navigateur, sans retouche d’image ni interface de téléphone inventée. La validation locale et ses limites sont consignées dans `verification.json`. Aucun essai sur appareil physique ou Safari n’est revendiqué. Aucun changement de production ni fusion dans `main` n’est inclus.

## Vérifications effectuées

Les 52 cas de navigateur ont réussi : quatre tailles de 320 × 568 à 430 × 780, les sept langues pour chaque proposition, et les destinations des cinq commandes. Les quatre commandes originales d’essai, langue, exemple et connexion restent les mêmes nœuds DOM. Le bouton de compte ouvre uniquement l’écran d’inscription existant, sans soumission ; la destination de connexion est interceptée localement.

Les cibles mesurées atteignent au moins 44 × 44 px. Le contraste des textes sur leurs fonds de verre composés atteint au minimum 4,85:1. Aucun débordement horizontal ni erreur JavaScript n’a été détecté. Les 268 fichiers de production contrôlés et les fichiers de prototype sont restés identiques pendant la validation finale.

Les images principales mesurent 390 × 740 px ; les variantes `-320.png` mesurent 320 × 620 px. La galerie a également été contrôlée entre 320 et 1100 px ; sa capture complète est disponible dans [comparaison.png](comparaison.png).
