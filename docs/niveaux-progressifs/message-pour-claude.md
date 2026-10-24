# Message pour Claude — vérification phonétique uniquement

Claude — Kartech précise que tu vérifieras uniquement la phonétique.
Codex prend en charge le contenu, les regroupements par thème, leur richesse,
la progression, les réemplois et les adaptations grammaticales par langue.

Merci de vérifier la conformité des aides de prononciation à la méthode Melunga
pour les sept couples : fr→en, fr→es, fr→it, fr→zh, fr→ja, fr→ko et zh→fr.
Les champs utilisés sont `pf` pour en/es/it/ja/ko, `phf` pour zh et `phon`
pour le français étudié par les sinophones ; `py` reste une lecture complémentaire.

Pour chaque écart, consigne :

- le couple et l’indice ou identifiant source ;
- le mot ou la phrase entière, avec sa phonétique actuelle ;
- l’écart précis avec la méthode de Kartech et la correction proposée ;
- le statut de ta vérification.

Distingue les aides existantes, conservées au caractère près, des aides
éventuellement rédigées pour de nouvelles entrées. Une conservation exacte
ne prouve pas qu’une ancienne aide soit correcte. Une nouvelle prononciation
se juge sur le mot ou la phrase entière, sans collage de syllabes ni alignement
automatique entre deux corpus.

Les 140 nouvelles entrées sont répertoriées séparément dans
`corrections-themes/enrichissements-rediges.json` et dans le tableau lisible
`corrections-themes/enrichissements-rediges.md`, avec leur statut
`pending-Claude`. Ce sont 139 nouvelles aides entières proposées et une aide
de mot entier reprise pour le nouveau sens adjectival de l’anglais « light ».
Les reprises de mots déjà présents ne créent aucune nouvelle phonétique.

Le lot suivant ajoute 454 phrases entières rédigées dans dix thèmes pratiques.
Le tableau `enrichissement-situations/nouvelles-phrases-a-relire.md` reprend
leurs 454 aides entières `pending-Claude`, avec phrase, sens, niveau et intentId.
Cela porte la file de contrôle à 593 aides nouvelles sur les deux lots,
plus une aide de mot entier déjà existante reprise pour un autre sens.
Les 106 autres positions des nouvelles situations sont des réemplois ; elles
ne constituent ni 106 créations ni 106 phonétiques nouvelles.


Les captures de Kartech ont montré des défauts de classement ; Codex les corrige
sur l’aperçu #14, branche `review/themes-niveaux-progressifs`. Utilise le dernier
commit de cette branche ; `7d7bf63` est l’aperçu du premier lot et ne contient pas
les dix nouvelles situations de ce second lot.
Les niveaux et les thèmes relèvent du travail de Codex, pas de ta validation.

Dossier : `docs/niveaux-progressifs/README.md`.
Cette demande de contrôle phonétique n’autorise aucune fusion ou publication.
