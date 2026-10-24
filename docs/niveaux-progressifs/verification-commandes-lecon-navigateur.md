# Vérification des commandes de leçon

Exécution : `2026-10-24T20:44:30.599Z` — **7 contrôles sur 7 réussis**.

Chromium local ; écrans émulés. Aucun téléphone physique ni site public testé. Les voix sont simulées pour vérifier le texte transmis, sans valider le son ou les phonétiques.

- Ordinateur : 10 cartes complètes contrôlées, à 1366 × 768 et 1280 × 720 ; carte courte puis plus longues expressions ZH, IT, JA et KO, lectures activées. Aucun scroll, chevauchement ou texte coupé ; oreille et commandes restent dans l’écran.
- Pinyin : remplace la phonétique adaptée par la lecture source entière, conserve le choix entre cartes et après rechargement ; aucune révélation pendant le rappel avant l’appui sur l’oreille.
- Gestes tactiles réels via CDP : haut = suivant, bas = précédent, gauche = À revoir, droite = Je connais. La droite retire le favori et avance ; les cartes connues restent accessibles dans le thème.
- Carte mobile longue : un geste commencé dans le contenu fait défiler la carte ; seuls les gestes commencés au bord approprié changent de phrase.
- Boutons, sélection de texte, multitouch, petits mouvements et réponses non choisies ne sont pas classés par erreur. Le choix explicite reste immédiatement cliquable après un geste refusé.
- À revoir : ajout, déduplication, rechargement, séparation des couples, liste, reprise depuis les véritables sources malgré des libellés de cache périmés, retrait persistant ; les répliques de l’interlocuteur sont exclues.

Les empreintes du HTML, CSS, JavaScript, test, application classique et 78 JSON sont identiques avant et après le passage. Aucune requête externe, de compte, de paiement ou d’API.

Rapport détaillé : [verification-commandes-lecon-navigateur.json](verification-commandes-lecon-navigateur.json).
