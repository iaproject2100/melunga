# Deux boutons mobiles ronds : niveau et langue

Le niveau et la langue possèdent chacun un support circulaire translucide de 48 × 48 px. Leur ancien support commun est transparent ; un espace de 8 px sépare les deux cercles. Les couleurs du badge de niveau et du drapeau restent conservées. Le badge de niveau devient lui-même circulaire dans son support.

La modification est limitée à la présentation mobile du groupe niveau/langue. La barre d’écoute large, « À revoir », « Suivant », les raccourcis Révisions/Voix/Couleur/Menu, les cartes et les photos gardent leur présentation précédente. Les boutons d’origine, leurs noms accessibles et leurs gestionnaires sont conservés. Le chargement avec le logo sous l’eau est également conservé ; les deux références de la feuille responsive utilisent désormais `course-desktop.css?v=13`.

- [Leçon de chinois avec les deux cercles](lecon-deux-cercles.png)
- [Liste des thèmes avec les deux cercles](themes-deux-cercles.png)
- [Rapport navigateur](browser-report.json)

## Vérification

Sept groupes de contrôles ont réussi sur les véritables pages du dépôt, avec des réponses API locales explicites :

- Quatre profils mobiles : français–espagnol sur 280 × 620 et 320 × 620 px, français–chinois sur 390 × 740 px et coréen–français sur 320 × 620 px. Les thèmes et la première fiche montrent deux cercles de 48 px, des fonds partiellement transparents, un flou de 22 px et des noms accessibles. Les cibles restent dans l’écran et ne chevauchent ni le retour, ni le compteur, ni l’autre cercle.
- Deux profils ordinateur, 1366 × 768 et 1920 × 1080 px : les captures complètes des thèmes et de la première fiche sont identiques, octet par octet, à celles de la version précédente `cebe0d4bae09be094a3c41644279e16136bd6280`.
- Les dix-sept ambiances : les deux supports restent ronds et translucides, le texte du niveau reste blanc et les couleurs du badge restent présentes.

Sur les quatre profils mobiles, les captures de la barre inférieure et ses dimensions sont identiques à la version précédente, dans les thèmes comme dans la leçon. Les dialogues du niveau et de la langue s’ouvrent avec les boutons d’origine ; l’écoute réutilise son unique gestionnaire existant. Le drapeau, la couleur et le dégradé du niveau correspondent à leurs valeurs précédentes.

Les 169 empreintes d’entrée correspondent aux sources finales et sont restées stables. Aucune erreur JavaScript, erreur de fixture ou requête inattendue n’a été observée. Les captures de présentation montrent les boutons sans l’anneau de focus clavier laissé par la fermeture des dialogues ; cette neutralisation concerne uniquement la capture du test.

Les contrôles source (12), l’intégration audio (15), les ressources d’entrée et les scénarios de démarrage (12) ont également réussi lors de l’intégration ; leurs journaux sont joints séparément. Les vingt et un autres fichiers de la couche source finie conservent leurs empreintes ; seuls la feuille et ses deux références HTML changent.

Ces contrôles utilisent Chromium avec émulation des tailles et du toucher. Aucun appareil physique, Safari, compte, paiement ou son réel n’a été utilisé.
