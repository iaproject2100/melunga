# Raccourci Voix à côté de Révisions sur ordinateur

Le changement rend visible le bouton **Voix d’origine** dans le bandeau ordinateur, immédiatement après Révisions. Il ne recrée aucun contrôle et ne modifie aucun gestionnaire de voix, vitesse, audio, progression ou accès.

## Vérification ciblée

Le rapport `acceptance.json` contient **5 groupes et 14 cas réussis**, avec **169 empreintes d’entrée stables**, aucune erreur navigateur et aucune requête inattendue.

- Ordre visible : Thèmes, À revoir, Révisions, Voix. Les vues Thèmes et Leçon sont contrôlées à 1600 × 900, 1366 × 768 et 1101 × 768, sans débordement ni chevauchement avec le logo ou le menu.
- Le clavier ouvre le panneau Voix existant et reçoit le focus sur son sélecteur. Échap ferme le dialogue et rend le focus au bouton d’origine.
- Ouvrir le panneau conserve la voix espagnole approuvée `es-ES-Chirp3-HD-Kore` sans créer de favori. Un choix explicite de `es-ES-Chirp3-HD-Charon` et de vitesse 0,75 atteint le lecteur original : bonne voix, texte exact, débit serveur 1 et vitesse client 0,75. Aucune décision de progression ou de rappel ne change.
- Les reconstructions réelles de niveau et de langue en interface coréenne (`ko-fr` puis `ko-es`) conservent le raccourci traduit. Au passage sur 390 px, le dock utilise le même bouton d’origine ; le retour sur ordinateur le restaure après Révisions, sans changer la phrase ou l’étape.
- Deux vues mobiles complètes, deux contenus principaux de thèmes et un contenu principal de leçon sont comparés pixel pour pixel au commit publié `41d682251ad544072557b104d3d7c94e48ec0c8c`. Le bandeau ordinateur est volontairement exclu des comparaisons de contenu puisqu’il contient désormais le raccourci.
- Les fichiers entiers `course-desktop.js`, `maquette-guidee.js`, `lesson-audio.js`, `voice-selection.js`, `course-access.js`, `course-native.js`, `course-i18n.js`, `content/course-access.json` et `store-billing.js` sont strictement identiques à ce commit.

Les captures `lesson-voice-header-1600-rose.png` et `lesson-voice-header-1366-rose.png` montrent la présentation réelle dans l’ambiance rose, choisie avec le bouton d’origine.

La vérification utilise un harnais temporaire local (`/tmp/desktop-voice-shortcut-qa.cjs`) et les fichiers réellement livrés. Seuls l’accès, le catalogue et le lecteur média sont des fixtures explicites. Aucun appel réel à un compte, un paiement ou un fournisseur audio n’est effectué. Chromium local avec écrans émulés ; matériel physique et Safari non testés. Aucun nouveau test permanent n’a été ajouté pour ce changement CSS limité.
