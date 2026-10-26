# Progression du niveau dans une capsule

La page des thèmes affiche le libellé court « L1 » et la capsule choisie par Kartech : le pourcentage reste fixe à gauche, et le remplissage avance vers « Fin ». Pour les sinophones, le repère devient « 完成 » et le nom accessible du niveau reste traduit. La pastille reste à 6 px du bord de sa piste et réserve la largeur de « 100 % » pour ne pas chevaucher le repère de fin.

La couleur évolue continûment du turquoise au vert, puis au doré à 100 %. Le remplissage atteint le bord droit de la capsule et passe derrière « Fin » à 100 %. Le repère de fin dispose également d’un fond coloré assorti au pourcentage dans tous les états. Le chiffre sombre garde son contraste ; le contraste de « Fin » et « 完成 » est vérifié avec un minimum de 6,85:1 dans cette composition. La piste s’adapte aux trois ambiances, dont l’ambiance claire ; les transitions sont désactivées si les mouvements réduits sont demandés. La capsule apparaît uniquement sur l’accueil des thèmes du parcours par niveaux. La barre fine et le compteur de séance restent ceux des leçons ; la page L1 historique conserve sa présentation.

Le dénominateur reste l’union des identifiants distincts du niveau complet validé, avant le filtrage gratuit/payant, sans doublons, modèles incomplets ni répliques reçues. Seul un « Je connais » explicite enregistre la carte courante ; « À revoir » la retire. Continuer, écouter ou terminer un thème ne créent pas de connaissance. Le libellé est arrondi vers le bas : 100 % n’est affiché que si toutes les cartes du niveau sont déclarées connues. Cette progression ne constitue pas une mesure d’acquisition.

Le registre `melunga-guided-known-v1` reste local au profil de navigateur et indexé par couple et identifiant de carte. Il ne synchronise pas les appareils et ne modifie pas le registre classique `ox_known_*`. Les contrôles conservent la reprise, les mises à jour d’un autre onglet et les refus d’écriture, avec maintien de la carte et restauration du rappel au mieux en cas d’échec.

Le logo original validé reste le PNG inchangé avec masque CSS à 43 %, sans contour sombre. Le menu conserve neuf rubriques, sans « Toutes les leçons ». « Mon compte » ouvre son volet sans charger une autre leçon ; le lien de connexion des visiteurs et les contrats de déconnexion restent ceux du composant relu. En aperçu Netlify, le volet signale explicitement l’aperçu et la déconnexion est désactivée.

## Vérification de la composition courante

Les rapports et captures actuels sont dans `capsule-fin-coloree/` ; les dossiers `capsule-fixe-coloree/`, `capsule-coloree/` et les autres dossiers décrivent les étapes de revue antérieures.

- Six suites de progression réussies, 54 cas dont 36 états français/chinois × 320/390/1440 px × 0/25/50/75/99/100 %, sans chevauchement. Le ratio et les décisions proviennent de vrais identifiants de sources, avec un stockage prérempli explicitement simulé.
- Les six suites de compte de la composition précédente restent une référence sur la logique de compte inchangée ; elles ne sont pas réputées rejouées pour ce seul changement de position CSS. Aucun compte réel ni déconnexion réelle.
- Barre de séance vérifiée physiquement : 3 px et largeur correcte jusqu’à 100 %. Gestes, persistance, droits, ancienne page L1, ambiances et mouvements réduits conservés.
- Les 78 JSON, le catalogue classique, les prix, le backend et le module d’accès sont inchangés. Les fonctions de calcul et de stockage sont comparées exactement au commit pré-capsule `711537b`.
- Neuf assets entiers épinglés, quatre altérations en mémoire refusées. La présentation a été revue sur Chromium local, avec tailles de téléphone simulées. Aucun téléphone physique ni navigateur sur le déployé n’est revendiqué.

`proposition-capsule.html` permet d’essayer la variante retenue en couleur à 0/25/50/75/100 %, avec des valeurs illustratives sans lecture ni écriture de données d’élève. Le parcours effectif, lui, utilise les décisions « Je connais » enregistrées.

Le logo et la forme de la capsule sont validés par Kartech. La nouvelle version colorée reste dans l’aperçu #23 ; aucune fusion dans `main` ni publication sur melunga.com n’a été effectuée pour ce lot.
