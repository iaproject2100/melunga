# Écouter et choisir les voix

Ouvrir `/comparaison-voix.html` dans l’aperçu de cette branche. Le catalogue est chargé depuis Google par la fonction serveur existante ; seules les voix réellement observées peuvent être proposées. Chaque langue présente trois candidates Chirp 3 HD de genres mixtes lorsqu’elles sont disponibles, plus sa référence WaveNet actuelle. Une langue incomplète est signalée sans inventer de voix.

Les quatre voix d’une langue lisent exactement la même phrase existante, à vitesse normale. Aucun secours vocal ne remplace une voix de comparaison. « Ma préférée » conserve un choix explicite sur cet appareil et dans cet aperçu ; « Copier mes choix » ou « Télécharger » produit le relevé des identifiants à transmettre pour le choix final. Aucun choix n’est envoyé automatiquement ni appliqué globalement en production.

Les lecteurs progressif et classique utilisent ensuite ce choix local. Sans favori, une candidate Chirp est provisoire dans l’aperçu seulement. Leur secours navigateur exige une voix de la langue étudiée ; une liste vide ou uniquement française ne peut jamais lire un texte espagnol. Les erreurs finales affichent « Audio indisponible. Réessaie. ».

## Vitesse et cache

La comparaison reste à la vitesse naturelle afin de comparer les timbres. Dans les leçons, cet aperçu envoie à Chirp une demande MP3 sans `speakingRate` ni `pitch`, puis applique une seule fois la vitesse dans le lecteur HTML, avec conservation de hauteur demandée. Les trois vitesses progressives et les deux vitesses classiques restent présentes. WaveNet garde sa vitesse côté serveur. Les réponses audio conservent les deux en-têtes de cache d’un an ; le catalogue de disponibilité a une durée courte distincte de cinq minutes.

Le [proto officiel Google épinglé](https://github.com/googleapis/googleapis/blob/933dd1be8180a22bca2dc473b53d4f4297ee3b0c/google/cloud/texttospeech/v1/cloud_tts.proto#L456) ne précise pas la compatibilité de vitesse avec Chirp 3 HD. Il ne prouve pas une incompatibilité. Le réglage côté lecteur est donc un choix prudent de cet aperçu, pas une limitation fournisseur affirmée. La [preuve consultée](official-api-evidence.json) distingue ce fait des documents Google Cloud bloqués.

## Vérifications et limites

- 14 tests serveur : filtrage réel des candidates dans un catalogue contrôlé, langues, genres, refus, caches, erreurs et compatibilité des 14 voix WaveNet.
- 32 tests lecteur/sélection : aucune favorite implicite, vitesse unique, voix locale de la bonne langue, annulation, expiration et compatibilité des origines natives.
- 14 tests d’intégration : sept langues dans les deux lecteurs, métadonnées, conservation des données, des droits et des fonctions d’authentification.
- Six groupes navigateur, 40 cas : 28 comparaisons dans un catalogue contrôlé, préférences et export, refus de lecture, absence de secours dans la comparaison, arrêt des médias périmés et formats d’écran.
- 12 contrôles des couches historiques : tuples et patchs bornés, inventaires, sources préservées et refus des mutations.

Ces tests sont locaux, avec fournisseurs et médias instrumentés. Ils ne prouvent ni la disponibilité actuelle des 21 candidates dans le projet Google de cet aperçu, ni une écoute sur appareil physique. Le service WaveNet de production a été contrôlé précédemment ; aucune synthèse Chirp réelle n’est prétendue ici.

L’environnement n’autorise actuellement ni les pages Google Cloud concernées ni les nouveaux domaines d’aperçu Netlify. Les ajouts nécessaires sont enregistrés dans le brouillon de configuration, sans changer les autres destinations. L’outil a demandé l’enregistrement et la publication de ce brouillon dans les paramètres de l’environnement avant activation ; cette opération ne publie pas melunga.com. Aucun contournement du proxy ni accès à une clé secrète n’a été utilisé.

Chromium et un profil Android émulé sont vérifiés. Safari, l’installation sur l’écran d’accueil d’un iPhone, le commutateur silencieux et les sorties physiques ne sont pas attestés. La [matrice de 16 essais réels](../device-test-matrix.md) garde ces lignes « Non exécuté » jusqu’à une observation sur l’appareil. Le manifeste prépare un démarrage autonome du comparateur, sans voix hors ligne ni garantie d’installation testée.

Aucune fusion ni publication sur melunga.com avant le choix des voix par Kartech. Le correctif du bouton Démarrer fait partie de la branche d’aperçu précédente et reste conservé dans cet aperçu.

La PR #34 reste en brouillon et cible main pour déclencher l’aperçu Netlify. Elle contient la composition #33, sans la fusionner ni publier le site. Le lien d’écoute est la page `/comparaison-voix.html` de cet aperçu.
