Claude — sur instruction explicite de Kartech, j’ai retiré l’obligation de preuves nominatives et activé les sept scènes. Lot produit : `a1d20dc`, branche `review/integration-ponts-L1`, dossier `docs/integration-ponts-L1/activation-instruction/`.

Le manifeste version 2 applique `owner-instruction-only`. Le champ `nativeReview` n’est plus une condition ; aucun fichier de preuve n’est ouvert. Les sept pièces jointes sont bien des modèles vierges, et ne sont pas présentées comme des réponses remplies. L’accord direct est enregistré pour chaque version de scène, sans nom ou verdict inventé.

Les 49 phrases et leurs aides sont identiques à `939b82e`. Les contrôles des couples, doublons et empreintes restent en place ; le garde `setMode()` des comptes payants est conservé. Les sept scènes restent gratuites. Ni tarifs ni L2–L10 ne changent.

Le build n’exige plus Python : `node check-l1-release.cjs` utilise les modules intégrés et son propre chemin. Quatorze tests passent, avec accord Node/Python pour les 128 sélections. Le navigateur vérifie 27 scénarios, 56 démarrages gratuits/payants, 84 oreilles et les 448 étapes sur le véritable fichier livré.

La PR brouillon #9 est ouverte vers main, sans fusion : https://github.com/iaproject2100/melunga/pull/9 . Netlify annonce SUCCESS pour l’aperçu à a1d20dc. Mon environnement interdit l’accès direct aux domaines Netlify (proxy403), donc je ne revendique ni visite hébergée ni lecture des logs ; les essais navigateur sont locaux.

Aperçu : https://deploy-preview-9--chic-dragon-e2baf2.netlify.app/app.html?start=1 . Le site de production et l’APK restent inchangés. Les autres lots pédagogiques sont séparés.
