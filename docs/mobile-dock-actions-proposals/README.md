# À revoir et Suivant dans le dock translucide

L’utilisateur retient le dock translucide de la proposition 2 et demande de le comparer à trois nouvelles dispositions qui réunissent aussi « À revoir » et « Suivant » dans cette barre. Ces maquettes gardent les six commandes disponibles, avec leurs libellés.

- **Repère : dock choisi** — quatre réglages dans le dock, les deux actions juste au-dessus.
- **A : une rangée** — les six commandes sur une seule ligne. Compact, mais plus serré sur petit écran.
- **B : deux rangées**, conseillé — quatre réglages en haut et deux grandes actions en bas, dans une même capsule translucide.
- **C : actions à droite** — les quatre réglages en grille à gauche et les deux grandes actions empilées à droite.

Le logo, la photo près du numéro, la phrase, la phonétique et son oreille ainsi que le haut-parleur sont conservés. Les trois nouvelles variantes retirent la rangée d’actions séparée, puisque ses vrais boutons se trouvent désormais dans le dock.

## Voir les maquettes

- [Comparatif en deux colonnes](comparaison-mobile.png)
- [Comparatif sur grand écran](comparaison-large.png)
- [Dock choisi comme repère](captures/mobile-dock-reference.png)
- [A — Une rangée](captures/mobile-dock-a.png)
- [B — Deux rangées](captures/mobile-dock-b.png)
- [C — Actions à droite](captures/mobile-dock-c.png)
- [Galerie HTML locale](index.html)

Les quatre captures individuelles mesurent 390 × 780 px. La galerie permet de les ouvrir ou de les télécharger en grand.

## Réalisation et contrôle

Le produit de référence est `fd1598eff3264d6bfaf753c76e798686e3d75a11`. Les adaptateurs de la proposition précédente sont chargés localement, puis complétés par `proposal.css` et `proposal.js`. Aucun fichier de l’application publiée ne charge ces adaptateurs ; aucun fichier sous `melunga_deploy` n’est modifié.

Les boutons sont leurs nœuds d’origine, conservant leurs identifiants et leurs écouteurs. Le libellé « Continuer » est remplacé par « Suivant » uniquement pour ces captures, y compris dans le panneau de repère. Sa logique reste celle du mobile : avancer d’une étape, sans sauter de phrase ni classer la carte comme connue. Le bouton « À revoir » continue d’enregistrer la véritable carte à réviser. Les réglages ne sont ni masqués ni regroupés dans un menu supplémentaire.

**Quinze cas passent** : les quatre dispositions à 320 × 700, 390 × 780 et 430 × 780 ; une carte chinoise avec Pinyin et une vraie carte longue de niveau 8 avec la variante B ; puis les trois dialogues et le changement d’ambiance avec les vrais boutons déplacés. Chaque zone tactile mesure au moins 44 px, les libellés tiennent entièrement, les boutons ne se chevauchent pas et la carte reste au-dessus du dock. Le modèle phonétique n’est ni tronqué ni remplacé. Les sources produit et les quatre adaptateurs restent stables pendant la passe.

Le [rapport détaillé](verification.json) conserve les dimensions et les contrôles de progression. La galerie est aussi vérifiée à 390, 1000 et 1920 px. Les barres réservent leur hauteur et prennent en compte `env(safe-area-inset-bottom)` ; aucune barre de système ou de navigateur n’est ajoutée artificiellement aux images.

Chromium local avec dimensions et toucher simulés. Compte et audio utilisent des fixtures locales ; aucun compte réel, paiement, POST ou serveur TTS distant n’est sollicité. Ce contrôle ne constitue pas un essai sur téléphone physique, Safari ou avec une main réelle.

Harnais locaux : `/tmp/mobile-dock-actions-proposals.cjs` et `/tmp/mobile-dock-actions-gallery-capture.cjs`. Il s’agit de propositions à choisir, sans nouvelle publication du parcours.
