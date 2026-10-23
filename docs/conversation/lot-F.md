# Lot F — statut éditorial visible dans « Mes phrases »

`construire.js` (après le lot C de Codex, commit `29bbba8`) : sur l'écran du niveau (étape 1), un encart repliable apparaît quand le fichier de contenu porte un statut « relecture linguistique requise » (`reviewStatus` contenant *requise / required / 校对 / 감수*) — aujourd'hui zh, ja, ko et le français pour sinophones. Les fichiers es/en/it (« relecture native conseillée ») n'affichent rien.

- Résumé : `reviewNotice` (libellé du lot D dans la langue maternelle, repli fr/zh dans `B_LABELS`).
- Déplié : `phoneticConvention` du fichier (conventions de la prononciation écrite), `phonHint` (« aide, pas un remplacement de l'audio »), `reviewStatus` tel quel.
- Aucune donnée écrite, aucun droit modifié ; l'encart disparaît de lui-même quand le statut du fichier change.

## Vérification
- `node --check melunga_deploy/construire.js` ; `node melunga_deploy/tests/conversation-loader.test.cjs` ; test UI de Codex `conversation-ui.test.cjs` : tous passent.
- Playwright (serveur local) : fr→ja, fr→zh, zh→fr → encart présent (texte fr / zh selon la langue maternelle, statut du fichier affiché) ; fr→es → aucun encart ; liste des situations et bouton « Converser » intacts ; aucune erreur JS.

## Complément de la revue Codex (lot E)

L’encart reste désormais présent aux étapes 1 à 4, y compris lorsqu’une reprise locale ouvre directement un modèle. Les conditions de statut et les libellés sont inchangés.
