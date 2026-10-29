# Contrôles de la version livrée

Source de référence : `0feb7bc67c6374f1466ccd74febc1a0bbcad0584`.

Empreintes SHA-256 finales :

- Adaptateur `course-desktop.js` : `1a58a5cabba96199c9e44ddbadb9874e3dd08e7e8846e3e643e0193409226c00`.
- Styles `course-desktop.css` : `8289af2516f916bcfe370ca220f49166a1649d0dd665b2e240c0e457adac8148`.
- Le contrôleur complet `maquette-guidee.js` conserve `9a7b4eddbef7fa74b09063a11d06be4621eabb5fa763780597e2ad0bf84ba5d3`.

Contrôles réussis après gel des sources :

- Barre latérale ordinateur : 10 groupes / 18 cas, 169 empreintes stables (`acceptance.json`).
- Lisibilité : 16 cas, y compris longs textes, Pinyin, erreurs de sauvegarde et reprise sur écrans de faible hauteur.
- Démarrage : 12 cas, 215 empreintes stables.
- Entrée et accès : 6 groupes / 29 cas, 208 empreintes stables.
- Validation par « Suivant » : 6 tests, persistance, déduplication, « À revoir », échec de stockage et isolation des langues.
- Sources Chirp/audio serveur : 12 tests.
- Intégration audio partagée : 15 tests.
- Validations des couches Chirp, routage natif et ressources d’entrée : réussies.

La couche finie conserve son inventaire de 13 fichiers modifiés et 11 ajoutés. Quatre empreintes de ressources sont actualisées, les 20 autres conservent leur valeur. Les 78 fichiers JSON de cours, les sept fonctions de progression protégées, les droits, la facturation, la sélection des voix et le lecteur audio restent protégés. Les caches passent à CSS 16 et adaptateur 10 dans les deux documents.

Le test historique de progression garde le compteur d’origine visible, désormais dans l’en-tête de la carte ordinateur. Son ancien harnais n’a pas été exécuté comme validation courante ; le nouveau test de barre latérale et les six tests de progression utilisent les véritables ressources finales.

Vérifications sous Chromium local avec écrans et gestes émulés. Aucun compte réel, paiement ou fournisseur audio utilisé. Pas d’essai sur appareil physique ou sous Safari. L’interface publique de production n’est pas vérifiée depuis cet environnement ; la publication de la source et l’image publique d’aperçu sont contrôlées séparément.
