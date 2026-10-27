# Vérification indépendante en navigateur

Résultat : **6 groupes réussis, 26 cas, aucune erreur JavaScript ni requête inattendue**. Les entrées sont restées identiques pendant l’exécution. Le test est dans `melunga_deploy/tests/lesson-server-audio.browser.cjs`, le rapport complet dans [verification-browser.json](verification-browser.json).

Les sept couples utilisent le texte étudié, jamais l’aide phonétique, avec leur voix WaveNet féminine attendue. Les deux boutons ont les mêmes états de chargement et de lecture. Le clavier déclenche une seule lecture, le Pinyin ne remplace pas le texte envoyé et aucune déclaration de connaissance ou de révision n’est ajoutée.

Les choix féminin/masculin correspondent aux voix serveur. Les trois vitesses 0,75 / 0,85 / 1 sont transmises dans la requête ; la vitesse de lecture du média reste à 1 pour ne pas appliquer le ralentissement deux fois.

Les contre-épreuves couvrent :

- échec média et rejet `NotAllowedError`, avec liste de voix vide, uniquement française ou avec une voix espagnole compatible ;
- absence de synthèse automatique ou française pour une phrase espagnole ;
- refus des voix `yue-HK`, `zh-HK`, `zh-MO` et d’une voix explicitement nommée cantonais, même déclarée `zh-CN` ; acceptation des voix mandarin `zh-TW`, `zh-SG` et `cmn-CN` ;
- clics répétés, événements média et promesses périmés, changement d’étape ou de langue, sortie pendant le secours système et nouvelle tentative après erreur ;
- révélation explicite de vraies cartes de rappel en français/chinois, sans avancer ni noter la carte.

Les 78 JSON d’exécution et 29 fichiers protégés restent exacts par rapport à `ef147deacf85b4a5631c1b05ff8050de7918ea1f`, dont l’application classique, l’endpoint TTS, les droits et les fonctions de paiement.

Les captures ont été inspectées : [espagnol sur mobile](captures/server-audio-spanish-mobile.png), [choix de voix et vitesse](captures/server-audio-spanish-voice-menu.png), [chinois avec Pinyin sur 320 px](captures/server-audio-chinese-pinyin-320.png), [anglais sur ordinateur](captures/server-audio-english-desktop.png). Les champs et commandes restent visibles sans défilement dans les cas contrôlés.

Les tests tournent sur Chromium local avec agent Android et écran tactile émulés. `Audio` et `speechSynthesis` sont instrumentés ; aucun son, appel public TTS, compte réel ou envoi de formulaire n’est utilisé. Ils vérifient le câblage et les gardes, pas la qualité sonore, les voix réellement installées, la latence réseau ou les règles de lecture d’un téléphone physique. Le contrôle des réponses réelles de l’endpoint est un relevé distinct.

Pour reproduire depuis `melunga_deploy` :

```sh
LESSON_SERVER_AUDIO_REPORT=/tmp/melunga-server-audio-browser.json \
LESSON_SERVER_AUDIO_CAPTURES=/tmp/melunga-server-audio-browser \
node --test tests/lesson-server-audio.browser.cjs
```

`CHROMIUM_PATH` permet de sélectionner un autre exécutable Chromium. Cette vérification n’autorise aucune fusion ni publication.
