# Haut-parleur sous la traduction

Le bouton rond bleu est rétabli sous la traduction, en conservant l'oreille dans la zone phonétique. Il partage la même lecture `speak(true)` : texte étudié entier, langue cible, voix choisie et débit existants. Il ne lit ni la glose ni l'aide phonétique. Les libellés accessibles suivent le mot/la phrase, le rappel et la langue de l'interface.

L'état de lecture et `aria-busy` sont communs aux deux boutons, avec remise à zéro à la fin, en cas d'erreur ou de changement de fiche. Le haut-parleur suit les mêmes conditions de visibilité que l'oreille pour les modèles incomplets et les choix en attente. L'accès à la carte reste contrôlé par le moteur existant.

Pinyin/lecture et haut-parleur occupent une même rangée sous la traduction, avec retour à la ligne si nécessaire. Sans option de lecture, le haut-parleur est seul au centre. Son diamètre s'adapte entre 48 et 64 px selon la hauteur pour garder la fiche entière à l'écran. Le logo, la progression, les données, les prix et les droits sont conservés depuis `9e98d357`.

Trois groupes existants/ciblés sont vérifiés : conservation des sources, fiches complètes et commandes audio. 64 cas, sept couples, clavier, préférences de voix/débit, Pinyin, rappels français/chinois, réplique reçue, annulation et événements périmés, erreurs et nouvelle tentative. Les deux gardes absentes des cartes présentées actuelles utilisent des réponses JSON de fixture explicitement synthétiques ; les autres cartes sont réelles. La première fiche japonaise à 320 px est aussi vérifiée avec lecture affichée puis masquée.

Les appels de synthèse sont simulés : ils valident les paramètres et l'état de lecture, pas le son ou une validation phonétique humaine. Les tailles de téléphone sont émulées dans Chromium. Les cinq autres groupes de la suite ne sont pas présentés comme rejoués. Les pins courants sont actualisés sans changer les couches historiques ni les règles de conservation des sources. Caches CSS25/JS28 dans les deux entrées.
