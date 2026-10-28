# Accueil mobile — exemple vert et capsules translucides

Affinement de la proposition 4 : le bouton original **« Voir un exemple »** conserve son dégradé vert, son texte foncé et ses arrondis. Il occupe toute la largeur, 12 px au-dessus de l’ensemble translucide « Essayer gratuitement / Créer un compte / langue ». « Se connecter » reste disponible dessous. Le logo et le texte central restent identiques à la comparaison précédente.

- [Maquette — 390 × 740](captures/accueil-exemple-vert.png)
- [Maquette compacte — 320 × 620](captures/accueil-exemple-vert-320.png)

Le prototype reprend les fichiers de présentation du commit `941a7834845bb41a5a94bed71787c3ecfba36282`, puis déplace le véritable bouton d’exemple au-dessus des capsules. Les commandes originales restent les mêmes nœuds DOM avec leurs actions ; aucun code de production n’importe ce dossier. La page réelle et ses ressources sont servies localement, sans modification des fichiers de l’application.

La vérification porte sur quatre formats, de 320 × 568 à 430 × 780, les sept langues de l’application, les cibles tactiles d’au moins 44 × 44 px, l’absence de débordement et la conservation du style vert original. L’exemple ouvre le véritable carrousel et le choix de langue utilise le dialogue existant. Les destinations d’essai, d’inscription et de connexion ne sont pas exercées dans cette maquette, car elles font l’objet d’une validation distincte.

Le rapport est disponible dans [verification.json](verification.json) et les empreintes des captures dans [sha256.json](sha256.json). Les images sont des rendus du navigateur, sans retouche ni interface de téléphone ajoutée. Aucun compte réel, service audio, appareil physique ou Safari n’a été utilisé. Cette maquette ne comprend aucune fusion ni mise en production.
