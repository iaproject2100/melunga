# Entrée normale vers le parcours publié

La version approuvée de #17 était publiée, mais l’accueil ouvrait encore `app.html`. Le parcours par thèmes restait à l’adresse `parcours-niveaux.html`, sans raccordement au chemin normal d’essai et de connexion. Kartech a demandé que le nouveau parcours devienne l’entrée par défaut, en conservant les droits gratuits et payants.

L’essai ouvre maintenant le parcours pour les sept couples disponibles : fr→en/es/it/zh/ja/ko et zh→fr. La connexion garde le formulaire existant puis retourne au parcours après confirmation du serveur. Les combinaisons non prises en charge et les applications natives conservent leur fonctionnement classique. Le paiement reste dans son chemin existant ; seuls les retours approuvés, relatifs au site et limités aux couples/niveaux connus sont acceptés.

Le raccordement conserve **2 218 identifiants de cartes gratuites historiques**, y compris 292 cartes actives reclassées au-dessus du niveau 1. Les 156 anciennes cartes gratuites désormais en réserve restent accessibles dans les cartes classiques. Le nouveau L1 reste intégralement gratuit. Les autres cartes demandent un accès payé confirmé par le serveur ; un ancien indicateur local ne suffit pas à les déverrouiller.

Les vues gratuites sont construites après la validation complète des fichiers source. Elles gardent les modèles et contextes nécessaires aux réponses gratuites. Un contexte payant reçu reste en compréhension ; il n’est pas transformé en carte de production gratuite. L’affichage, l’audio et « À revoir » vérifient l’accès. Un retour de page après déconnexion provoque une nouvelle vérification.

Les aperçus Netlify de ce projet gardent leur accès de relecture explicite ; le domaine Netlify de production ne bénéficie pas de cette exception. Sur le site public, la barre « Maquette » disparaît. Aucun tarif, backend d’authentification, règle d’appareils ou mécanisme de facturation n’est modifié. Les 32 115 cartes classiques, leurs données pédagogiques et les 78 JSON du parcours restent intacts.

La vérification indépendante comprend six groupes et 22 cas navigateur : essai, connexion réelle de la page, retours refusés, ancien gratuit, accès payé/non payé et déconnexion. Toutes les API sont simulées localement ; aucune opération de compte réelle n’est effectuée. Les tests de contenu comparent les 78 JSON octet par octet et recalculent les droits historiques depuis le classique approuvé.

Ce correctif d’entrée est séparé de la PR #19 des séquences visibles. Les séquences ne sont pas publiées par cette livraison.
