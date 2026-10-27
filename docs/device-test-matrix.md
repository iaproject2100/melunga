# Matrice d’écoute sur appareils

Cette matrice concerne le comparateur de trois voix Chirp 3 HD et d’une voix WaveNet par langue, puis le réemploi du choix dans les leçons. La page ne doit pas remplacer silencieusement une voix de comparaison par celle du navigateur.

## Ce qui est automatisé

La suite `melunga_deploy/tests/chirp-comparison.browser.cjs` utilise Chromium Linux réel en mode sans interface, avec les vrais fichiers du dépôt et des réponses de catalogue contrôlées. Un profil mobile configure le viewport, le tactile et l’agent utilisateur Android. Ce profil ne constitue pas un essai sur Chrome Android physique.

Les appels du lecteur, les URL audio, les événements média, les choix et la persistance sont instrumentés en mémoire. Aucun son Google réel n’est entendu ou décodé pendant cette suite. Elle peut vérifier la langue, l’identité demandée, la vitesse appliquée, l’absence de secours navigateur dans une comparaison, l’unicité du média actif, les erreurs et l’annulation. Elle ne peut pas certifier l’accent entendu, les haut-parleurs, le Bluetooth, le volume matériel, le mode silencieux ou l’exécution depuis une icône installée.

Le manifeste demande un affichage autonome et un départ sur le comparateur ; il ne fournit pas de catalogue ni de voix hors ligne. Ces métadonnées sont vérifiées statiquement, sans installation réelle.

Le binaire WebKit de Playwright et Safari ne sont pas installés dans cet environnement. Aucune simulation par simple agent utilisateur iPhone n’est présentée comme un test Safari. Aucun iPhone ni Android physique n’est attaché. Les essais ci-dessous sont donc **à exécuter sur appareils réels** ; aucune ligne n’est validée par les tests Chromium.

## Préparation d’un relevé physique

Noter le commit de l’aperçu, l’URL, la date, le modèle du téléphone, la version du système et du navigateur, le mode navigateur ou icône d’accueil, la sortie audio utilisée, le volume média et l’état du commutateur silencieux. Relever les noms exacts et les genres renvoyés par le catalogue pour les voix proposées. Ne jamais consigner une clé API, un mot de passe ou les données d’un compte réel.

Pour chaque langue, écouter la même phrase avec les quatre boutons et noter la voix réellement entendue. Les sept langues étudiées sont le français, l’anglais, l’espagnol, le mandarin, l’italien, le japonais et le coréen. La disponibilité et le genre des voix viennent du catalogue vérifié ; cette matrice ne suppose pas qu’un nom est disponible dans toutes les langues.

## Seize vérifications physiques

Toutes les lignes commencent à l’état « non exécuté ». Un HTTP 200 et une animation de lecture ne suffisent pas à valider une écoute.

| Nº | Appareil et contexte | Manipulation | Résultat à relever | État |
| --- | --- | --- | --- | --- |
| 1 | Android, Chrome, volume média audible | Comparer les trois Chirp et WaveNet dans les sept langues | Même texte, bonne langue, quatre identités distinctes lorsqu’elles sont disponibles ; noter naturel et intelligibilité sans les déduire du seul nom | Non exécuté |
| 2 | Android, Chrome, aucune voix système espagnole installée | Écouter les quatre versions espagnoles | Les voix serveur fonctionnent sans dépendre d’une voix locale ; aucun accent français substitué | Non exécuté |
| 3 | Android, Chrome | Choisir une Chirp puis lire une leçon aux trois vitesses proposées ; recommencer avec WaveNet | La vitesse change une seule fois, les mots restent complets, le timbre reste compréhensible | Non exécuté |
| 4 | Android, Chrome | Lancer plusieurs boutons rapidement, changer de langue puis de fiche, arrêter et réessayer | Un seul son à la fois ; aucun ancien extrait ne revient ; nouvel essai possible | Non exécuté |
| 5 | iPhone, Safari, onglet neuf | Toucher directement un bouton de comparaison après chargement | Le geste démarre la bonne voix, ou affiche une erreur explicite ; aucune affirmation d’autoplay hors geste | Non exécuté |
| 6 | iPhone, Safari, volume média audible | Comparer les quatre versions dans les sept langues | Bonne langue et texte complet ; relever l’identité, le rendu et la sortie audio réels | Non exécuté |
| 7 | iPhone, Safari | Refaire la même écoute avec le commutateur silencieux désactivé puis activé, sans modifier le volume média | Noter séparément le comportement observé dans les deux états ; ne pas assimiler silencieux, volume média nul et échec réseau | Non exécuté |
| 8 | iPhone, Safari | Choisir une voix, recharger, ouvrir une leçon puis revenir au comparateur | Le choix explicite reste associé à sa langue ; la leçon reprend cette voix ; aucun autre choix n’est écrit automatiquement | Non exécuté |
| 9 | iPhone, lancement depuis l’icône d’accueil | Ajouter l’aperçu à l’accueil, fermer Safari puis ouvrir l’icône | Relever si le navigateur ouvre un mode autonome réel ; bonne page et bon hôte ; premier toucher audio fonctionnel ou erreur explicite | Non exécuté |
| 10 | iPhone, icône d’accueil | Choisir une voix et vérifier la leçon, puis fermer et rouvrir l’application d’accueil | Relever la persistance réelle dans ce contexte de stockage ; ne pas présumer qu’elle partage celle d’un onglet Safari | Non exécuté |
| 11 | iPhone, icône d’accueil | Répéter l’écoute avec commutateur silencieux activé et désactivé, volume média inchangé | Documenter le son réellement entendu, la sortie et les différences de contexte par rapport à Safari | Non exécuté |
| 12 | iPhone, icône d’accueil | Pendant la lecture, passer brièvement en arrière-plan, revenir, arrêter puis relancer | Aucun chevauchement ni ancien extrait relancé ; décrire toute interruption imposée par le système | Non exécuté |
| 13 | Ordinateur, navigateur et sortie audio identifiés | Comparer les quatre versions dans les sept langues | Même texte, bonnes langues et identités ; relever le navigateur et l’écoute réelle | Non exécuté |
| 14 | Ordinateur | Tester les trois vitesses dans les leçons avec une Chirp et avec WaveNet | Bonne vitesse appliquée une seule fois, sans changement inattendu de voix | Non exécuté |
| 15 | Ordinateur ou téléphone, réseau coupé après chargement | Tenter une comparaison puis rétablir le réseau et réessayer | Relever si un extrait est déjà en cache ; sinon, message d’échec clair, aucune autre voix jouée en secours et reprise possible | Non exécuté |
| 16 | Ordinateur et un téléphone | Choisir des voix pour plusieurs langues, exporter le relevé et vérifier les leçons moderne/classique de l’aperçu | Export lisible et identités exactes, choix séparés par langue, aucun effet sur prix, accès, contenu ou progression | Non exécuté |

## Conclusion de validation

Un rapport doit distinguer les contrôles logiciels réussis, les réponses réelles du service, les écoutes physiques effectuées et les lignes encore non exécutées. La page peut être déployée en aperçu sans faire passer les lignes physiques à « validé ». Toute fusion ou publication conserve la procédure d’accord demandée par Kartech.
