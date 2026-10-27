# Lecture audio des leçons

Les deux boutons de la fiche lisent le texte étudié avec le service WaveNet déjà utilisé par l’application classique. La liste des voix du téléphone ne décide plus de la voix principale. Si le service échoue, une voix système peut prendre le relais uniquement lorsque sa langue correspond explicitement à celle étudiée. Sinon, la fiche indique « Audio indisponible. Réessaie. » ; elle ne demande jamais au système d’utiliser sa voix par défaut.

Cet aperçu compose le routage des langues maternelles relu à `ef0733dd66e3a2cf4c8ee6809f08a77462032678` et le lecteur audio serveur. La référence des contenus et protections historiques reste `ef147deacf85b4a5631c1b05ff8050de7918ea1f`. Le bouton de démarrage de l’accueil et le nouveau lecteur sont donc contrôlés ensemble ; les anciens aperçus séparés ne constituent pas cette composition. Ce dossier n’autorise aucune fusion ni publication et ne décrit pas une modification déjà en production.

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

L’audio ne modifie aucune phrase, phonétique, lecture, règle de droits, tarif, fonction serveur ou lecteur classique. La composition conserve l’entrée native relue et ses vues des sources existantes. Le nouveau module précède le script de cours dans les deux HTML ; les caches du script de cours et de l’interface passent respectivement à `v31` et `v2`. Le CSS reste inchangé.

## Vérifications

Les 13 tests unitaires déterministes du module audio inchangé couvrent les sept langues, les quatorze voix serveur, les trois vitesses, l’absence de voix locale, une voix française sans espagnol, la sélection explicite du secours espagnol, les exclusions cantonaises, les promesses rejetées, événements périmés, annulations, délais et nouveaux essais. La vérification navigateur de la composition a réussi ses 6 groupes et 28 cas.

Deux cas partent de l’accueil, sélectionnent réellement l’anglais comme langue maternelle puis l’espagnol à étudier, sur mobile Android émulé et ordinateur. « Démarrer » arrive directement dans le parcours `en-es`, sans visiter `app.html`. L’interface reste anglaise, la traduction est le champ anglais exact de la carte espagnole et le haut-parleur demande `es-ES-Wavenet-F`, même avec une liste de voix système vide. Les débits `0.75` et `1` sont vérifiés sur ces deux trajets.

```sh
node --test melunga_deploy/tests/lesson-audio.test.cjs
node --test melunga_deploy/tests/lesson-server-audio.browser.cjs
node --test melunga_deploy/tests/serveur-audio-layer.test.cjs
```

La suite navigateur indépendante sert les vrais fichiers du checkout et instrumente les médias. Elle vérifie les sept couples, dont des profils Android émulés sans voix locale ou sans voix espagnole. Ces essais ne produisent aucun son, n’appellent aucune API distante et ne constituent pas une écoute sur téléphone physique. Le rapport navigateur et les captures associés précisent les cas exécutés.

La disponibilité du service existant a été contrôlée séparément : sept GET réels vers le service de production, un par voix féminine à `0.85`, ont renvoyé `200`, un type audio et entre 5 568 et 10 944 octets. Les empreintes sont conservées dans [service-seven-voices.json](service-seven-voices.json). L’analyse `ffprobe` confirme sept MP3 à 24 000 Hz, de 0,696 à 1,368 seconde : [service-seven-voices-media.json](service-seven-voices-media.json). Ces preuves concernent le service déjà déployé ; elles ne prouvent ni que le nouveau lecteur est publié, ni qu’une personne a écouté les fichiers. Aucune écoute physique n’est attestée.

## Compatibilité avec les contrôles historiques

La preuve composée est [native-routing-layer.json](../../melunga_deploy/tests/fixtures/native-routing-layer.json), avec son [patch exact](../../melunga_deploy/tests/fixtures/native-routing-layer.patch). Elle épingle les sources entières et les nouveaux actifs de la composition ; le module audio garde son empreinte `5eda5fbd…`. Les anciennes empreintes historiques ne sont pas réécrites et aucun contrôle de contenu ou de droits n’est désactivé.

Le [patch audio initial](runtime-layer.patch), contre `ef147de`, reste conservé comme preuve du lot audio séparé. Il ne décrit pas à lui seul l’aperçu composé. Le test navigateur contrôle directement les 78 JSON et les actifs immuables contre `ef147de`, puis les actifs natifs contre `ef0733d`. Il admet seulement le changement de cache de l’accueil et les trois nouvelles traductions audio par langue au-delà de cette référence native.

```sh
node -e 'require("./melunga_deploy/tests/all-classification.cjs").validateEntryAssets()'
```

## Contrôle de l’aperçu avant publication

1. Vérifier les fichiers servis : `lesson-audio.js?v=1`, le script du cours `v31`, l’interface `v2` et leurs empreintes issues du commit de l’aperçu composé. Depuis l’accueil de ce même aperçu, choisir English puis Spanish et démarrer : l’interface doit rester anglaise dans le parcours moderne.
2. Depuis cet aperçu, vérifier qu’un GET pour une courte phrase espagnole renvoie un audio non vide avec le type `audio/mpeg`. Le média étant servi depuis le même domaine que la page, aucune permission CORS supplémentaire n’est nécessaire.
3. Ouvrir une fiche espagnole non payante sur téléphone, appuyer sur le haut-parleur puis l’oreille, et contrôler la langue réellement entendue aux trois vitesses. Vérifier aussi le mandarin avec Pinyin : le texte envoyé reste celui en caractères chinois.
4. En bloquant uniquement la requête audio dans le navigateur de test, vérifier le message d’indisponibilité sans voix espagnole et l’usage d’une voix espagnole explicite lorsqu’elle existe. Changer de fiche pendant une tentative puis relancer : aucun ancien son ne doit revenir.

La validation des URL et des états est automatisée. L’écoute réelle, les haut-parleurs, le volume et les politiques propres à un téléphone restent à vérifier sur l’appareil. Aucune fusion ou publication n’est effectuée par les tests.
