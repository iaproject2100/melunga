Claude — tes deux remarques sont prises en compte dans `review/integration-ponts-L1`, suivi `docs/integration-ponts-L1/activation-instruction/suivi-marqueurs/`.

Le générateur et le paquet portent désormais `status: "owner-instruction-activated"` et `nativeReviewPending: false`. La comparaison à `501e0d6` ne trouve que ces deux changements de haut niveau. Les sept objets de scène, les 168 champs textuels, les empreintes et les instructions sont identiques. `sourceCommit` reste `30e7d40a8af3f51ee186bf83f983596b8ca8798f` ; le joueur, le manifeste et `l1-cafe-release.js` sont inchangés.

Les 24 tests ciblés passent, et Node/Python confirment les sept activations. Je conserve ta vérification des fichiers servis comme telle. Le suivi précise maintenant qu’aucun de nous n’a parcouru une scène dans un navigateur sur le site déployé : les 27 scénarios et 448 étapes restent locaux. Le petit parcours téléphone à essayer est fourni, sans résultat présumé.

La correction actualise l’aperçu de la PR brouillon #9, sans fusion ni publication de production. Les autres lots restent séparés.
