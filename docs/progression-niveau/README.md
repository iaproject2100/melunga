# Aperçu de progression du niveau

Sur la page des thèmes du parcours, l’inventaire global est remplacé par « Niveau 1 · 0 % » et la barre fine existante indique la part de cartes déclarées « Je connais ». Pour les sinophones, le libellé est « 第 1 级 · 0 % ». Le compteur de chaque thème et la progression de séance restent identiques. Aucun contenu, niveau de catalogue, droit, prix, logo ou CSS ne change.

Le dénominateur est l’union des identifiants de cartes proposés dans les séquences du niveau complet validé, sans doublons, modèles incomplets ni répliques reçues. Les préparations ne créent pas de carte supplémentaire. Il précède le filtrage des accès gratuits : connaître toutes les seules cartes gratuites d’un niveau payant ne donne pas 100 %. Exemples L1 : fr→ja 361, fr→zh 314, zh→fr 344. La barre utilise le rapport exact ; le libellé entier est arrondi vers le bas, donc 100 % signifie que toutes les cartes sont marquées connues.

Seul le balayage droit « Je connais » enregistre l’identité exacte de la carte courante, jamais la phrase que cette carte prépare. « À revoir » la retire des connus. Continuer, écouter, terminer un thème ou retirer un rappel ne déclarent aucune connaissance. Les cartes connues restent accessibles ; aucun saut automatique supplémentaire n’est créé.

Le registre local `melunga-guided-known-v1` garde les identifiants par couple de langues et persiste après rechargement dans le même profil de navigateur. Il ne synchronise pas les comptes ou appareils. Le parcours moderne ne conservait auparavant aucun connu durable : aucune visite ni absence de rappel ne permet d’en reconstituer. Le registre classique `ox_known_*`, indexé par texte, n’est ni lu ni modifié. L’ancienne page L1 conserve son fonctionnement. En cas de refus d’écriture de progression, la carte reste affichée et un rappel supprimé est restauré au mieux ; un double refus de stockage reste une limite locale documentée.

Six contrôles indépendants réussis, 11 cas, trois captures mobiles : état initial, exemple après stockage prérempli et rechargement, localisation chinoise. Les exemples de captures préremplis sont des fixtures, pas un progrès attribué à un élève réel. Les contrôles couvrent gestes, répétitions, quasi-achèvement, reprise, onglet voisin, refus de stockage, À revoir, dénominateur non payant et ancienne page L1. API d’accès simulée en lecture seulement, aucune opération de compte. Les 78 JSON et 13 fichiers protégés sont exacts à `a1085e8`, les huit assets finis sont épinglés et quatre altérations refusées. La matrice historique reste adaptée au nouveau libellé sans prétendre avoir été rejouée intégralement.

Cette proposition est un aperçu séparé de la PR des séquences. Aucune fusion ou publication sur melunga.com n’est autorisée avant l’accord de Kartech sur l’aperçu mobile.

Le retour de Kartech sur le contour noir est intégré à ce même aperçu : les deux images utilisent maintenant le SVG original du classique, sans fond périphérique sombre. L’illustration, les tailles, la disposition, le CSS et le JavaScript de progression sont conservés. Quatre contrôles de logo et les six contrôles de progression passent sur cette composition ; neuf assets sont vérifiés. Les captures sont actualisées. Cette correction reste, elle aussi, en aperçu avant accord de fusion ; `main` n’est pas modifié.

## Correction de « Mon compte » dans cet aperçu

Le clic « Mon compte » ouvre désormais un volet dans le parcours et conserve la carte et l’URL courantes. Le volet indique l’état d’accès et propose le retour aux leçons et la déconnexion ; en aperçu, cette dernière est désactivée et le statut mentionne explicitement l’aperçu. Le lien de connexion des visiteurs reste identique en production.

Le composant `665d0de` est intégré à la progression et au logo sans contour, sans autre modification de leur comportement. `course-access.js` change intentionnellement pour la déconnexion ; le fichier complet correspond au composant relu et ses règles d’éligibilité restent conservées. Les prix, les 78 JSON, le catalogue classique et les fonctions serveur restent identiques à `a1085e8`.

Les nouveaux rapports de composition distinguent les essais locaux simulés de toute vérification réelle. La capture du volet montre un aperçu sans session de compte, sans connexion ni déconnexion réelle. Le site public reste inchangé en attendant la validation de l’aperçu.
