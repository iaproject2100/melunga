# Vérification de la maquette

## Données

Génération reproductible et `python3 tools/maquette-guidee/build_data.py --check` réussies. Une seconde extraction indépendante du catalogue confirme les sept ensembles d'indices L1 : **2 134 cartes, 7 293 champs identiques, aucun manque ni doublon d'indice**. Les doublons de texte présents dans la source restent distincts.

Chaque carte appartient à un thème et à une seule séquence de cinq expressions au maximum. Chaque rappel porte sur une expression présentée auparavant dans cette séquence. Les modèles incomplets restent visibles, sans synthèse vocale ni rappel masqué, et n'ont qu'une étape de présentation.

## Interface

Contrôles sous Chromium local sur mobile émulé et ordinateur :

- Sept couples parcourus, totaux et thèmes accessibles ; navigation thème → séquence → phrase → retour.
- Texte étudié, aide phonétique et traduction conformes au JSON ; aide fermée au démarrage.
- Pendant le rappel, le sens reste visible ; l'oreille révèle le modèle explicitement. La lecture complémentaire est facultative.
- Fin de séquence, reprise, changement de langue et trois ambiances fonctionnels.
- Largeurs 320, 390 et 1 440 pixels contrôlées ; les phrases longues défilent dans la zone de contenu sans masquer les commandes.
- Aucune erreur JavaScript, requête d'écriture ou écriture dans le stockage du navigateur pendant les parcours vérifiés.

La synthèse vocale a été contrôlée avec une doublure qui vérifie le texte envoyé : le champ étudié, jamais la phonétique. La qualité des voix réelles n'a pas été évaluée. Ces essais ne sont pas un essai sur téléphone physique, ni une validation pédagogique des regroupements.

## Ajustement après retour sur l'aperçu

Sur ordinateur comme sur mobile, les 77 thèmes démarrent désormais en un clic et les groupes internes s'enchaînent sans écran de sélection. Le contrôle après extension au mobile couvre sept couples sur trois largeurs (1 440, 390 et 320 pixels) : 231 ouvertures directes de thème et 2 070 étapes traversées, compteur et progression sur le thème entier, écran de fin unique, reprise puis retour aux thèmes. Aucune erreur JavaScript ou requête d'écriture observée. Les numéros 01–11 rendent l'ordre éditorial conseillé visible sur les cartes et dans le titre de leçon. Le logo dans la barre latérale est conservé sur ordinateur.

Le JSON des 2 134 cartes et le catalogue ont les mêmes empreintes qu'avant cet ajustement. Aucun prix, accès, texte ou aide phonétique n'est modifié. La numérotation ne constitue pas une nouvelle validation pédagogique de l'ordre des cartes.

## Menu des rubriques

Le bouton à quatre carrés ouvre désormais un dialogue de navigation, distinct du retour aux thèmes. Ouvrir ou fermer ce dialogue ne réinitialise pas la phrase, son affichage de rappel, l'étape ou le compteur. Fermeture par bouton, Échap et clic sur le fond contrôlée, avec retour du focus au déclencheur.

Neuf cas de disposition contrôlés (320/390/1440 pixels × trois ambiances), sans débordement. Sur les sept couples : liens d'accueil, de catalogue et de connexion conformes aux paramètres réellement supportés ; choix de voix et de vitesse appliqué au texte étudié ; 14 séances de révision et 210 étapes parcourues, avec préparation et imitation avant tout rappel. Retour, fin et reprise fonctionnels.

Le formulaire Avis a été testé avec succès, échec et champs obligatoires, en interceptant toutes ses requêtes avant le réseau : aucun avis réel n'a été transmis. Aucune requête d'écriture spontanée ni erreur JavaScript observée. La livraison réelle des avis et la qualité des voix natives ne sont pas évaluées par ces essais locaux. Les pages de compte sont liées, sans connexion automatisée ni changement de paiement.

## Périmètre produit

La branche part du retour arrière `edf7406` et reprend les correctifs de production ultérieurs. Par rapport à `main`, seuls la page autonome de maquette, ses fichiers, son générateur et sa documentation sont ajoutés. Les fichiers préexistants, dont `app.html`, sont inchangés par cette proposition. Aucune fusion de cette maquette n'est demandée.

## Petites photos des thèmes — 24 octobre 2026

Onze scènes originales en couleur remplacent visuellement les pictogrammes des
cartes. Les boutons conservent leurs intitulés, leur numérotation, leur quantité
et leur démarrage direct. Le fichier WebP local partagé pèse 225 420 octets.

Contrôle Chromium local : **231 ouvertures de thème**, sept couples sur
320/390/1440 pixels, onze photos chargées par grille, positions conformes et
ratio 4:3. Une seule requête pour l'image partagée, y compris après changement
de langue et retour aux thèmes. Trois ambiances, absence de chevauchement et
absence de débordement contrôlées. Si le fichier image échoue, les pictogrammes
de secours et les titres restent utilisables ; le clic démarre toujours le thème.

Aucune erreur JavaScript, requête d'écriture ou requête externe observée.
Les captures ordinateur et mobile ont été inspectées visuellement. Le contrôle
du générateur confirme encore 2 134 cartes et 7 293 champs source identiques.
Ces contrôles portent sur la présentation et la navigation, pas sur une mesure
d'efficacité pédagogique. Références et provenance dans [photos-themes.md](photos-themes.md).
