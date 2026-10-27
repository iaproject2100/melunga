# Catalogue serveur et comparaison Chirp 3 HD

Ce serveur prépare un aperçu de comparaison. Aucune voix Chirp n’est réputée disponible sur la seule base de son nom : le catalogue interroge `https://texttospeech.googleapis.com/v1/voices` avec la clé Google déjà configurée côté Netlify. La clé ne figure ni dans les URL, ni dans le JSON public, ni dans un journal d’erreur.

`GET /.netlify/functions/tts?catalog=chirp3` renvoie les sept langues de Melunga dans `languages`, avec leur voix WaveNet féminine existante et trois candidates Chirp au maximum. Le serveur préfère Aoede et Kore si Google les déclare féminines, et Charon si Google le déclare masculin. Si ces voix manquent, il choisit trois autres voix effectivement reçues, avec au moins une femme et un homme. Une langue qui n’a pas trois candidates valides de genres mixtes reste `available: false`. Si la voix par défaut approuvée est néanmoins vérifiée, elle seule reste dans `chirp` pour permettre la lecture ; sinon ce tableau est vide. Aucun identifiant de remplacement n’est fabriqué.

Les régions sont bornées : français de France, anglais britannique, espagnol d’Espagne, mandarin de Chine, italien, japonais et coréen. Pour le mandarin, `cmn-CN` et `zh-CN` sont admis uniquement si le préfixe du nom et le tableau `languageCodes` de Google désignent le même code exact. Une voix d’une autre langue, une entrée mal formée, un genre inconnu ou un identifiant en conflit est exclu.

Exemple de forme JSON pour une langue qui n’a pas assez de candidates :

```json
{
  "version": 1,
  "source": "google-voices-list",
  "verifiedAt": "date ISO de la réponse Google",
  "expiresAt": "date ISO cinq minutes plus tard",
  "previewOnly": true,
  "languages": {
    "fr": {
      "language": "fr",
      "available": false,
      "waveNet": {
        "name": "fr-FR-Wavenet-F",
        "languageCode": "fr-FR",
        "gender": "FEMALE",
        "engine": "wavenet",
        "rateMode": "server"
      },
      "chirp": [],
      "reason": "insufficient_voices"
    }
  }
}
```

Le catalogue porte `selectionVersion: "kartech-2026-10-27"`. Pour chaque langue, `defaultVoice` est la voix exacte approuvée et vérifiée, ou `null` avec une raison distincte en cas d’absence, de conflit ou de genre incorrect. La requête peut inclure cette version exacte pour distinguer le cache des anciens essais ; toute autre version et tout paramètre supplémentaire restent refusés. Lorsqu’une langue est disponible, son tableau contient exactement trois candidates, dont son défaut vérifié. Chacune porte `name`, `languageCode`, `gender`, `engine: "chirp3"` et `rateMode: "client"`.

La liste est conservée cinq minutes au plus en mémoire et dans la réponse HTTP. Les requêtes simultanées partagent une lecture Google. Le cache est attaché à la clé utilisée, ne survit pas à son expiration et ne masque pas une erreur de rafraîchissement. Un appel Google dispose de huit secondes ; une réponse invalide ou indisponible renvoie une erreur JSON sans stockage. Une langue absente du résultat ne gêne pas les autres langues ni les voix WaveNet.

La synthèse utilise l’endpoint existant, avec `text`, `voice`, `lang` et `rate`. Les 14 voix WaveNet gardent leurs identifiants, corps de requête, vitesse serveur bornée à 0,65–1,2, `pitch: 0`, format MP3 et en-têtes de cache audio d’un an. Aucun chargement du catalogue Chirp n’est nécessaire pour les utiliser.

Pour Chirp, le serveur n’accepte que les candidates actuellement retournées de chaque langue, y compris la seule voix approuvée si le comparateur est incomplet, avec correspondance exacte entre identifiant et `lang`. Il n’accepte pas une quatrième voix même présente chez Google et ne devient pas un relais libre vers le fournisseur. La requête Google contient `voice.name`, `voice.languageCode` et seulement `audioConfig: {"audioEncoding":"MP3"}`. Elle n’envoie ni `speakingRate`, ni `pitch`, ni SSML. Dans cet aperçu, la vitesse est appliquée une fois dans le lecteur, signalée par `x-melunga-applied-rate: 1` et `rateMode: "client"`. Le cache audio conserve les mêmes durées que WaveNet ; les erreurs restent `no-store`.

Les méthodes, origines CORS admises, limite de 500 caractères et erreurs publiques de WaveNet restent compatibles. Le code ne touche aucun compte, abonnement, droit, prix, phrase ou phonétique.

Les 19 tests serveur passent, dont les sept défauts exacts, leur absence et le cache du catalogue versionné. Ils remplacent `fetch` par des réponses à la forme de l’API Google et vérifient les 14 voix WaveNet, 21 candidates Chirp à deux débits, la sélection bornée, les genres, les rejets, les caches, les erreurs et les corps de synthèse. Le [rapport et les empreintes](verification-approved-defaults-server.json) distinguent ces simulations des observations réelles. Les 78 JSON relus et les autres fonctions serveur restent identiques à la base composée `4fafe31`.

Ces essais ne prouvent pas que les voix sont disponibles dans le projet Google de production. Les pages Google Cloud sur Chirp étaient inaccessibles depuis l’environnement. Le proto officiel Google consulté sur GitHub décrit vitesse et hauteur de façon générale, sans préciser leur compatibilité Chirp : celle-ci reste non vérifiée, et non réputée absente. Il faut donc relever le catalogue réel de l’aperçu Netlify, puis y vérifier la synthèse et écouter les candidates avant toute décision de mise en production. Aucune écoute sur téléphone physique n’est attestée ici.

```sh
node --test melunga_deploy/tests/tts-chirp.test.cjs
```
