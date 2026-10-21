# Melunga TEST — accueil v4

Nouvel APK d’essai créé à partir du fichier v3 transmis par Kartech. Aucun projet Android source recréé et aucun AAB de release fourni. Le site web a été publié séparément au commit `94f1c4f` ; cet APK reste un paquet d'essai à installer sur téléphone.

## Fichiers utiles

- `verified-build/Melunga-TEST-accueil-v4.apk` : APK à essayer sur téléphone.
- `verified-build/verification-report.json` : versions, certificat, empreintes, modifications autorisées et empreintes de tous les assets.
- `verified-build/verify.log` : vérification Android des signatures v2/v3, du certificat et de l’alignement.
- `build-accueil-v4.py` : script reproductible, sans accès aux clés personnelles, sans suppression de répertoire.

## Modification exacte

Accueil web du commit `94f1c4f` : `index.html`, `desktop-home.css`, `desktop-home.js`. Les autres contenus et fonctions de la v3 sont conservés à l’identique, notamment `app.html`, les plugins, le runtime et les contenus conversation. Le marqueur interne du runtime reste celui de v3 parce que ce runtime n’a pas été remplacé.

Manifest : versionCode 5 → 6, versionName `1.0.4-conv-test3` → `1.0.4-conv-test4`, identifiant inchangé `com.melunga.app.test`. Deux octets du manifest binaire ont changé ; sa structure et sa taille restent identiques. La signature a été renouvelée, puis vérifiée.

Certificat identique à la v3 : `1E08A903AEF9C3A721510B64EC764D01D3D094EB954161B62544EA8F187B5953`. Ceci permet une mise à jour de cet APK de test v3 du même identifiant si Android n’impose pas d’autre restriction ; l’installation réelle reste à essayer. Ce n’est pas la clé de release de Google Play.

SHA-256 de l’APK : `e8c8774ae1b6a3ad707965a2debe4fc7b91a7b28126239c82e8bb22340110e83`.

Les JSON conversation restent chargés depuis l’aperçu #8. Les services API conservent leur origine `melunga.com`, comme dans la v3. Cet APK n’est pas un environnement entièrement isolé des services de production.

## Reproduction

Outil officiel utilisé : https://github.com/patrickfav/uber-apk-signer/releases/tag/v1.3.0

Le JAR téléchargé correspond au checksum publié dans la même livraison : `e1299fd6fcf4da527dd53735b56127e8ea922a321128123b9c32d619bba1d835`. Le script le revérifie avant exécution. La clé de débogage intégrée à l’outil est utilisée avec un répertoire personnel Java isolé ; aucune clé de l’utilisateur n’est recherchée ou lue.

Exécuter avec un **nouveau** dossier de sortie :

```bash
python3 build-accueil-v4.py \
  --source-apk /chemin/Melunga-TEST-conversation-v3.apk \
  --web-root /chemin/melunga-publication/melunga_deploy \
  --signer /chemin/uber-apk-signer-1.3.0.jar \
  --out-dir /chemin/nouveau-dossier-v4
```

Le script refuse un dossier de sortie existant et vérifie l’empreinte de la v3 de référence. Conserver les assets d’accueil au commit indiqué ci-dessus pour reproduire le résultat livré. Il n’a pas vocation à servir de chaîne de publication Play.

## Essais restant à faire

Installation par-dessus la v3 sans désinstallation, nouvel accueil, choix des langues, démarrage des leçons, ouverture de Mes phrases, accès audio et conservation de la progression locale. La signature, l’intégrité et les assets sont contrôlés ; aucun de ces essais sur téléphone n’est déclaré réalisé ici.

## Contrôle visuel local complémentaire

Les assets du paquet signé ont été chargés dans Chromium avec Capacitor simulé : sept langues, largeurs 390 et 320 pixels, drapeaux et démarrage vers la page locale des leçons contrôlés. Rapport `verification-navigateur.json`, capture `accueil-v4-390.png`. Ce contrôle ne remplace pas l’installation sur Android ni les ponts natifs audio ou facturation.
