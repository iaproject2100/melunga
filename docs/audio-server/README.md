# Lecture audio des leçons

Les deux boutons de la fiche lisent le texte étudié avec le service WaveNet déjà utilisé par l’application classique. La liste des voix du téléphone ne décide plus de la voix principale. Si le service échoue, une voix système peut prendre le relais uniquement lorsque sa langue correspond explicitement à celle étudiée. Sinon, la fiche indique « Audio indisponible. Réessaie. » ; elle ne demande jamais au système d’utiliser sa voix par défaut.

Ce lot part de `ef147deacf85b4a5631c1b05ff8050de7918ea1f` et reste indépendant du chantier des langues natives. Il est destiné à un aperçu avant accord ; aucune publication n’est approuvée par ce dossier.

## Voix et vitesse

| Langue étudiée | Voix féminine par défaut | Voix masculine | Paramètre `lang` |
| --- | --- | --- | --- |
| Français | `fr-FR-Wavenet-F` | `fr-FR-Wavenet-G` | `fr-FR` |
| Anglais | `en-GB-Wavenet-C` | `en-GB-Wavenet-D` | `en-GB` |
| Espagnol | `es-ES-Wavenet-F` | `es-ES-Wavenet-E` | `es-ES` |
| Mandarin | `cmn-CN-Wavenet-A` | `cmn-CN-Wavenet-B` | `cmn-CN` |
| Italien | `it-IT-Wavenet-E` | `it-IT-Wavenet-F` | `it-IT` |
| Japonais | `ja-JP-Wavenet-B` | `ja-JP-Wavenet-C` | `ja-JP` |
| Coréen | `ko-KR-Wavenet-A` | `ko-KR-Wavenet-C` | `ko-KR` |

Le menu « Voix » propose les deux voix serveur réellement prises en charge, avec la voix féminine par défaut. Il ne présente plus les noms des voix locales comme s’ils commandaient le service. Le secours système privilégie une voix de la même variante régionale, puis une voix de la même langue ; son timbre peut différer du choix serveur. Pour le mandarin, les voix `yue`, `zh-HK`, `zh-MO` et celles explicitement nommées cantonaises sont exclues. Les voix mandarin `zh-CN`, `zh-TW`, `zh-SG` et `cmn` sont acceptées.

La vitesse sélectionnée (`0.75`, `0.85` ou `1`) figure une seule fois dans la requête `/.netlify/functions/tts`. `audio.playbackRate` reste à `1`, car le serveur applique déjà la vitesse. La voix de secours reçoit la même valeur numérique.

## Annulation et erreurs

`lesson-audio.js` lance directement `Audio.play()` dans le geste de l’élève, sans attendre un téléchargement préalable. Un jeton de génération et l’identité du média empêchent les anciens événements, promesses ou délais de lancer une voix ou d’altérer les boutons après un autre clic, un changement de fiche ou une navigation. Les deux boutons partagent leur état d’attente et de lecture. Changer de voix ou de vitesse arrête la lecture précédente.

Une erreur média, un refus de lecture ou dix secondes sans démarrage déclenchent au maximum un secours compatible. Une lecture bloquée après démarrage dispose aussi d’un délai sur les événements d’attente. Si aucune voix compatible n’existe, aucun `speechSynthesis.speak()` n’est appelé. Un nouvel appui retente le serveur ; un échec n’exclut pas définitivement la voix.

Les phrases, phonétiques, lectures, droits, tarifs, fonctions serveur et lecteur classique ne sont pas modifiés. Le nouveau module précède le script de cours dans les deux HTML ; le cache du script de cours passe à `v30`. Le CSS reste inchangé.

## Vérifications

Les 13 tests unitaires déterministes couvrent les sept langues, les quatorze voix serveur, les trois vitesses, l’absence de voix locale, une voix française sans espagnol, la sélection explicite du secours espagnol, les exclusions cantonaises, les promesses rejetées, événements périmés, annulations, délais et nouveaux essais. La vérification navigateur indépendante a réussi ses 6 groupes et 26 cas.

```sh
node --test melunga_deploy/tests/lesson-audio.test.cjs
node --test melunga_deploy/tests/lesson-server-audio.browser.cjs
node --test melunga_deploy/tests/serveur-audio-layer.test.cjs
```

La suite navigateur indépendante sert les vrais fichiers du checkout et instrumente les médias. Elle vérifie les sept couples, dont des profils Android émulés sans voix locale ou sans voix espagnole. Ces essais ne produisent aucun son, n’appellent aucune API distante et ne constituent pas une écoute sur téléphone physique. Le rapport navigateur et les captures associés précisent les cas exécutés.

La disponibilité du service existant a été contrôlée séparément : sept GET réels vers le service de production, un par voix féminine à `0.85`, ont renvoyé `200`, un type audio et entre 5 568 et 10 944 octets. Les empreintes sont conservées dans [service-seven-voices.json](service-seven-voices.json). L’analyse `ffprobe` confirme sept MP3 à 24 000 Hz, de 0,696 à 1,368 seconde : [service-seven-voices-media.json](service-seven-voices-media.json). Ces preuves concernent le service déjà déployé ; elles ne prouvent ni que le nouveau lecteur est publié, ni qu’une personne a écouté les fichiers. Aucune écoute physique n’est attestée.

## Compatibilité avec les contrôles historiques

La couche de contrôle [serveur-audio-layer.cjs](../../melunga_deploy/tests/serveur-audio-layer.cjs) n’admet que trois modifications : le contrôleur et ses deux HTML, plus le nouveau module audio. Leurs octets entiers avant/après et le [patch exact](runtime-layer.patch) contre `ef147de` sont épinglés. Les 78 JSON, l’inventaire des fonctions serveur et 58 autres actifs sont vérifiés avant toute projection des trois fichiers vers leur ancien état. Le module ajouté est également épinglé ; aucun autre runtime nouveau n’est admis.

Les anciennes empreintes de `all-classification.cjs` restent identiques. Ses fonctions `validateEntryAssets` et `beforeAssetBytes` passent par cette couche finie ; aucun contrôle de contenu ou de droits n’est désactivé. Les 8 tests de couche passent, y compris des substitutions en mémoire d’un HTML, du contrôleur, du module, du patch, d’un JSON, des droits, du prix et d’un fichier nouveau : ces modifications sont rejetées sans altérer les fichiers sur disque.

```sh
node -e 'require("./melunga_deploy/tests/all-classification.cjs").validateEntryAssets()'
```

## Contrôle de l’aperçu avant publication

1. Vérifier les fichiers servis : `lesson-audio.js?v=1`, le script du cours `v30` et leurs empreintes issues du commit de l’aperçu.
2. Depuis cet aperçu, vérifier qu’un GET pour une courte phrase espagnole renvoie un audio non vide avec le type `audio/mpeg`. Le média étant servi depuis le même domaine que la page, aucune permission CORS supplémentaire n’est nécessaire.
3. Ouvrir une fiche espagnole non payante sur téléphone, appuyer sur le haut-parleur puis l’oreille, et contrôler la langue réellement entendue aux trois vitesses. Vérifier aussi le mandarin avec Pinyin : le texte envoyé reste celui en caractères chinois.
4. En bloquant uniquement la requête audio dans le navigateur de test, vérifier le message d’indisponibilité sans voix espagnole et l’usage d’une voix espagnole explicite lorsqu’elle existe. Changer de fiche pendant une tentative puis relancer : aucun ancien son ne doit revenir.

La validation des URL et des états est automatisée. L’écoute réelle, les haut-parleurs, le volume et les politiques propres à un téléphone restent à vérifier sur l’appareil. Aucune fusion ou publication n’est effectuée par les tests.
