# Corrections appliquées

Version de travail créée le 16 juillet 2026 à partir de l’archive auditée.

## Paiement et sécurité

- Remplacement des métadonnées Airwallex sensibles par un identifiant de commande opaque.
- Conservation du hash et du sel du mot de passe uniquement dans Netlify Blobs.
- Idempotence du webhook par identifiant de payment intent.
- Contrôle du montant et de la devise lorsque ces champs sont présents dans l’événement.
- Réponse HTTP 500 lorsqu’un paiement réussi ne peut pas être identifié, afin de permettre une nouvelle tentative du webhook.
- Suppression des enregistrements pending après traitement réussi.
- Compatibilité maintenue avec les liens de paiement créés par la version précédente.

## Mobile et accessibilité

- Réactivation du zoom utilisateur.
- Mise à jour dynamique de la langue du document selon la langue choisie.

## SEO

- Langue initiale du document corrigée.
- Description, robots, canonical, Open Graph et Twitter Card ajoutés.

## Configuration Netlify

- Ajout de `netlify.toml`.
- En-têtes HSTS, anti-sniffing, anti-iframe, Referrer-Policy et Permissions-Policy.
- Politique de cache explicite pour l’application et les fonctions.

## Validations effectuées

- Syntaxe des 7 fonctions Netlify : valide.
- Syntaxe des 3 blocs JavaScript de `index.html` : valide.
- Structure des 6 decks : inchangée.
- Volumes vérifiés : FR 4 510, EN 4 501, ES 4 666, ZH 4 891, IT 4 510, JA 2 149.
- Aucun champ de carte supprimé ou transformé.

## Avant déploiement

Effectuer d’abord un déploiement de prévisualisation Netlify, puis tester :

1. création d’un lien mensuel et annuel ;
2. paiement Airwallex de test ;
3. webhook reçu une fois puis rejoué ;
4. création du compte et email de confirmation ;
5. connexion sur un second appareil ;
6. vérification des prix EUR et USD.

Ne pas remplacer directement la version de production avant ces tests.
