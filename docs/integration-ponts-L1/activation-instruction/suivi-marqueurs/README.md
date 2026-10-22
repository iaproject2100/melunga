# Marqueurs cohérents avec l’activation sur instruction

La [relecture de Claude](verification-claude.md) accepte la politique et le contrôle Node. Elle confirme aussi la récupération des artefacts sur l’aperçu : sept couples activés et contenu coréen exact, aides et lectures comprises. Elle ne rapporte pas de parcours dans un navigateur sur le site déployé.

## Correction appliquée

Deux champs de haut niveau du paquet sont corrigés, dans le générateur et sa sortie reproductible :

| Champ | Avant | Maintenant |
| --- | --- | --- |
| `status` | `integration-review-not-production-approved` | `owner-instruction-activated` |
| `nativeReviewPending` | `true` | `false` |

Ils décrivent l’état d’activation sur instruction directe, sans certifier une relecture nominative. Les sept objets de scène, les **168 champs textuels**, les rôles, les étapes et toutes les aides restent identiques à `501e0d6`. Leurs empreintes et les instructions associées sont conservées. Aucun renouvellement ni nouvelle génération de `l1-cafe-release.js` n’est nécessaire.

`sourceCommit` reste `30e7d40a8af3f51ee186bf83f983596b8ca8798f`, exactement comme dans le validateur de `l1-cafe.js`. Le joueur, la liste des sept activations et le manifeste ne changent pas. Les objets `nativeReview` internes aux scènes restent des métadonnées de l’instantané source et ne décident pas de l’activation.

Les [contrôles ciblés](checks.json) donnent **10 tests de conservation des sources et 14 tests d’activation réussis**. Node et Python confirment les sept couples. Les 27 scénarios navigateur et 448 étapes précédents restent des contrôles locaux historiques ; ils ne sont pas présentés comme rejoués ou comme des essais hébergés pour cette correction de métadonnées.

## Limite de vérification du déployé

**Parcours complet d’une scène en navigateur sur l’aperçu : non vérifié à ce jour.** Codex ne peut pas ouvrir le domaine Netlify depuis son environnement. Claude a pu récupérer les fichiers servis, mais pas parcourir la scène dans un navigateur externe. Une égalité des artefacts et un build réussi ne sont pas un essai de l’expérience en marche.

Pour essayer l’aperçu depuis un téléphone :

1. Ouvrir [les leçons de l’aperçu](https://deploy-preview-9--chic-dragon-e2baf2.netlify.app/app.html?start=1), puis choisir une langue.
2. Dans les rubriques, ouvrir « Premier échange · L1 ».
3. Avancer avec « Continuer » jusqu’à « Échanger sans modèle ».
4. Vérifier que l’oreille réaffiche le modèle et lance l’écoute, puis que « Retour aux leçons » rend les cartes habituelles.

Ce parcours n’est pas coché comme réalisé. Il ne demande pas de justificatif nominatif et ne modifie pas la politique `owner-instruction-only`.

La PR #9 reste en brouillon. Aucun changement n’est fusionné dans `main`, publié sur melunga.com ou construit en APK. Les autres lots pédagogiques restent séparés.
