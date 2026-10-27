# Vérification indépendante en navigateur

Résultat de la composition routage natif + audio serveur : **6 groupes réussis, 28 cas, aucune erreur JavaScript ni requête inattendue**. Les entrées sont restées identiques pendant l’exécution. Le test est dans `melunga_deploy/tests/lesson-server-audio.browser.cjs`, le rapport complet dans [verification-browser.json](verification-browser.json). Le test composé a aussi été relu séparément sans réserve bloquante. Ces vérifications locales ne déclarent pas le lot publié sur `main`.

Les sept couples utilisent le texte étudié, jamais l’aide phonétique, avec leur voix WaveNet féminine attendue. Les deux boutons ont les mêmes états de chargement et de lecture. Le clavier déclenche une seule lecture, le Pinyin ne remplace pas le texte envoyé et aucune déclaration de connaissance ou de révision n’est ajoutée.

Les choix féminin/masculin correspondent aux voix serveur. Les trois vitesses 0,75 / 0,85 / 1 sont transmises dans la requête ; la vitesse de lecture du média reste à 1 pour ne pas appliquer le ralentissement deux fois.

Deux parcours supplémentaires commencent à l’accueil neuf : sélection de l’anglais comme langue maternelle, choix de l’espagnol, puis démarrage, à 390 × 844 et 1366 × 768. Ils arrivent sur `parcours-niveaux.html?pair=en-es&level=1` sans jamais naviguer dans `app.html`. L’interface reste anglaise et le sens affiché correspond au champ `en` exact de la carte du catalogue espagnol. Malgré `getVoices()` vide, les boutons envoient le texte espagnol entier avec `es-ES-Wavenet-F`, aux débits 0,75 et 1.

Les contre-épreuves couvrent :

- échec média et rejet `NotAllowedError`, avec liste de voix vide, uniquement française ou avec une voix espagnole compatible ;
- absence de synthèse automatique ou française pour une phrase espagnole ;
- refus des voix `yue-HK`, `zh-HK`, `zh-MO` et d’une voix explicitement nommée cantonais, même déclarée `zh-CN` ; acceptation des voix mandarin `zh-TW`, `zh-SG` et `cmn-CN` ;
- clics répétés, événements média et promesses périmés, changement d’étape ou de langue, sortie pendant le secours système et nouvelle tentative après erreur ;
- révélation explicite de vraies cartes de rappel en français/chinois, sans avancer ni noter la carte.

Les 78 JSON d’exécution et les actifs immuables restent exacts par rapport à `ef147deacf85b4a5631c1b05ff8050de7918ea1f`, dont l’endpoint TTS, les droits et les fonctions de paiement. Les actifs d’entrée natifs, l’application et les 14 JSON natifs/locales sont comparés à la référence native relue `ef0733dd66e3a2cf4c8ee6809f08a77462032678`. L’accueil ne diffère de cette référence que par le cache I18n v2 ; les suppléments n’ajoutent que les trois libellés audio dans chacune des sept langues. Les compteurs exacts figurent dans le cas `source-conservation` du rapport.

Les captures ont été inspectées : [espagnol sur mobile](captures/server-audio-spanish-mobile.png), [choix de voix et vitesse](captures/server-audio-spanish-voice-menu.png), [chinois avec Pinyin sur 320 px](captures/server-audio-chinese-pinyin-320.png), [anglais sur ordinateur](captures/server-audio-english-desktop.png). Les champs et commandes restent visibles sans défilement dans les cas contrôlés.

Les captures de bout en bout montrent l’espagnol avec son sens anglais et l’interface anglaise, après démarrage depuis l’accueil : [mobile](captures/server-audio-home-english-spanish-mobile.png) et [ordinateur](captures/server-audio-home-english-spanish-desktop.png).

Les tests tournent sur Chromium local avec agent Android et écran tactile émulés. `Audio` et `speechSynthesis` sont instrumentés ; aucun son, appel public TTS, compte réel ou envoi de formulaire n’est utilisé. Ils vérifient le câblage et les gardes, pas la qualité sonore, les voix réellement installées, la latence réseau ou les règles de lecture d’un téléphone physique. Le contrôle des réponses réelles de l’endpoint est un relevé distinct.

Pour reproduire depuis `melunga_deploy` :

```sh
LESSON_SERVER_AUDIO_REPORT=/tmp/melunga-server-audio-browser.json \
LESSON_SERVER_AUDIO_CAPTURES=/tmp/melunga-server-audio-browser \
node --test tests/lesson-server-audio.browser.cjs
```

`CHROMIUM_PATH` permet de sélectionner un autre exécutable Chromium. Cette vérification n’autorise aucune fusion ni publication.
