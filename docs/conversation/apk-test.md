# APK d'essai « Melunga TEST » (contenus de conversation sur l'aperçu Netlify)

Le projet Android/Capacitor source n'est pas dans le dépôt. L'APK d'essai est donc **dérivé de l'APK existant** (`Melunga-Android-1.0.4-test.apk`) par apktool, sans recompilation native :

| Élément | Valeur |
|---|---|
| Identifiant | `com.melunga.app.test` (cohabite avec l'application habituelle `com.melunga.app`) |
| Nom affiché | Melunga TEST · versionName `1.0.4-conv-test` |
| Signature | clé de debug (uber-apk-signer) — installation « sources inconnues », jamais destinée au Play Store |
| Fichiers web | `melunga_deploy/` de `feat/conversation-integration` (sans `netlify/`, `tests/`, docs), plus les fichiers propres à l'APK repris de l'original (`mobile-runtime.js`, `mobile-app.css`, `cordova*.js`, `native-speech.js`) |
| Configuration de test | `window.MELUNGA_CONTENT_ORIGIN = 'https://deploy-preview-8--chic-dragon-e2baf2.netlify.app/'` et `window.MELUNGA_TEST_BUILD` injectés en tête de `mobile-runtime.js` |
| Services | fonctions Netlify (TTS, statut) toujours sur `melunga.com` ; paiements hors essais (identifiant différent → boutique native inactive) |

Recette (reproductible) : `apktool d` → `package` et autorités/permission renommés en `.test` (classe `com.melunga.app.MainActivity` inchangée), `strings.xml` (`app_name`, `title_activity_main`, `package_name`, `custom_url_scheme`), `assets/capacitor.config.json` (`appId`, `appName`), remplacement de `assets/public`, `apktool b`, signature debug + zipalign. Vérifié après reconstruction : manifeste, config, scripts et origine de test présents.

Essais à dérouler sur téléphone : liste de `revue-ADF.md` (chargement/CORS, langues et audio, mode avion, reprise et accès, affichage). Pour voir les niveaux > 1 dans l'APK, un compte Premium connecté est nécessaire (droits inchangés).

## Reproduire / reprendre (Codex)
`tools/apk-test/build-test-apk.sh <APK d'origine> <dossier>` refait l'APK d'essai ; `tools/apk-test/mobile-runtime.js` est le runtime natif versionné (en-tête centré, roue de thème unique — `app.html` a désormais `.colorbtn` —, libellés de notation sur une ligne, pastille « Mes phrases » sous le sélecteur de langue, `MELUNGA_CONTENT_ORIGIN` = aperçu #8, `MELUNGA_TEST_BUILD` = tous les niveaux ouverts). Versions livrées à Kartech : v1 (12:41), v2 (12:55), v3 (13:11). Essais déjà concluants sur téléphone : chargement depuis l'aperçu (CORS), dialogues, affichage mobile. Restent : mode avion / retry, reprise après fermeture, zh/ja/ko audio + lecture. Pour l'AAB Google Play, un projet Capacitor doit être recréé (hors périmètre de cette branche).
