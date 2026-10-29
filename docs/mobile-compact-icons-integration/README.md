# Capsule mobile compacte sans libellés visibles

L’utilisateur demande de retirer les mots Niveau, Langue, Couleur et Menu, car les quatre icônes suffisent. La capsule translucide compacte conserve le badge L1, le drapeau, la roue des couleurs et le symbole de menu, sans leur légende visible.

Sur les thèmes, la barre mesure 58 px au lieu de 72 px. Les icônes passent à 24 px environ et les boutons gardent une cible tactile de 44 px minimum. Le fond Océan utilise le verre bleuté de la maquette compacte ; les autres ambiances conservent leurs fonds contrastés existants.

Pendant la leçon, les grandes actions À revoir et Suivant restent dans la seconde rangée du dock B. Leurs libellés et leurs cibles d’au moins 48 px ne sont pas supprimés. Le logo, les cartes, les polices du cours, la phonétique, les images, les voix et la progression restent ceux du parcours.

La suppression est visuelle : les libellés accessibles des véritables boutons restent fournis par le contrôleur, dans la langue choisie. Aucun JavaScript n’est modifié. Les dialogues et les écouteurs d’origine sont conservés. Les styles de cette révision restent limités au seuil mobile de 760 px ; l’ordinateur garde son affichage.

## Contrôles

Les [vérifications navigateur](BROWSER_QA.md) portent sur la vraie application locale, sans adaptateur de maquette, comparée au commit `6a22ff28c08f90edef5e178a23da8b37a9305f07`. Huit groupes et 38 cas passent : petits écrans, noms accessibles dans les sept langues, commandes, restauration sur ordinateur, 17 ambiances et place réservée. Le minimum de contraste mesuré sur les pixels réellement composés est de 4,6083:1, au repos et au survol. Les [captures et mesures](browser-report.json) conservent les détails.

- [Liste des thèmes Océan, 320 × 680 px](captures/compact-icons-themes-ocean.png)
- [Leçon avec les grandes actions, 390 × 780 px](captures/compact-icons-integrated.png)

Les contrôles de sources comprennent 12 tests de couches, 15 tests d’intégration et la validation des ressources d’entrée. Seuls le CSS responsive et les deux HTML qui le chargent changent parmi les fichiers produit. Les 21 autres empreintes de la couche produit restent identiques ; le JavaScript, le contenu, les droits, les prix et les services ne changent pas. Le CSS passe en version de cache 7, le JavaScript reste en version 5.

Chromium local avec dimensions mobiles simulées et services de compte et d’audio locaux. Aucun compte réel, paiement ou serveur TTS distant n’est utilisé. Il ne s’agit pas d’un essai sur téléphone physique ou Safari, ni d’une preuve de publication sur melunga.com.
