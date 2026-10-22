#!/usr/bin/env bash
# Reconstruit l'APK d'essai « Melunga TEST » à partir de l'APK existant (pas de projet Capacitor source).
# Usage : tools/apk-test/build-test-apk.sh <Melunga-Android-1.0.4-test.apk> <dossier de sortie>
# Prérequis : java, apktool.jar et uber-apk-signer.jar dans le dossier courant (APKTOOL / SIGNER pour les surcharger).
set -euo pipefail
SRC_APK="$1"; OUT="$2"; HERE="$(cd "$(dirname "$0")" && pwd)"; REPO="$(cd "$HERE/../.." && pwd)"; WEB="$REPO/melunga_deploy"
APKTOOL="${APKTOOL:-apktool.jar}"; SIGNER="${SIGNER:-uber-apk-signer.jar}"
rm -rf "$OUT"; mkdir -p "$OUT"; java -jar "$APKTOOL" d -f -o "$OUT/src" "$SRC_APK"
cd "$OUT/src"
# identifiant et nom distincts (la classe com.melunga.app.MainActivity ne change pas)
sed -i 's/package="com\.melunga\.app"/package="com.melunga.app.test"/' AndroidManifest.xml
sed -i -E 's/(android:authorities="|<permission android:name="|<uses-permission android:name=")com\.melunga\.app\./\1com.melunga.app.test./g' AndroidManifest.xml
sed -i 's#<string name="app_name">Melunga</string>#<string name="app_name">Melunga TEST</string>#; s#<string name="title_activity_main">Melunga</string>#<string name="title_activity_main">Melunga TEST</string>#; s#<string name="package_name">com.melunga.app</string>#<string name="package_name">com.melunga.app.test</string>#; s#<string name="custom_url_scheme">com.melunga.app</string>#<string name="custom_url_scheme">com.melunga.app.test</string>#' res/values/strings.xml
sed -i 's/"appId": "com.melunga.app"/"appId": "com.melunga.app.test"/; s/"appName": "Melunga"/"appName": "Melunga TEST"/' assets/capacitor.config.json
# fichiers web de la branche + fichiers propres à l'APK (runtime corrigé versionné dans tools/apk-test)
P=assets/public; mkdir -p keep; cp $P/cordova.js $P/cordova_plugins.js $P/native-speech.js keep/ 2>/dev/null || true
rm -rf "$P"/*; (cd "$WEB" && git ls-files -z | grep -z -v -E '^(netlify/|tests/|content/conversation/(levels/|.*\.(py|md)$)|package\.json|netlify\.toml|.*\.md$)' | xargs -0 -I{} sh -c 'mkdir -p "'"$OUT/src/$P"'/$(dirname "{}")" && cp "{}" "'"$OUT/src/$P"'/{}"')
cp keep/* "$P"/; cp "$HERE/mobile-runtime.js" "$HERE/mobile-app.css" "$P"/
cd "$OUT"; java -jar "$APKTOOL" b -f -o unsigned.apk src; java -jar "$SIGNER" -a unsigned.apk -o signed --allowResign
cp signed/*debugSigned.apk Melunga-TEST-conversation.apk; echo "→ $OUT/Melunga-TEST-conversation.apk"
