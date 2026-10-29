# Contrôles de livraison

Référence : `41d682251ad544072557b104d3d7c94e48ec0c8c`.

La seule modification du code de présentation rend visible le bouton **Voix d’origine** dans le bandeau ordinateur. Il suit déjà « Révisions » dans la navigation et ouvre son panneau existant. Le cache CSS est actualisé à `17` dans les deux documents.

Contrôles après gel des sources :

- QA ciblée : 5 groupes / 14 cas réussis, 169 empreintes stables (`acceptance.json`).
- Sources Chirp/audio serveur : 12 tests réussis.
- Audio partagé : 15 tests réussis.
- Validations des couches Chirp, routage natif et ressources d’entrée : réussies.
- Groupe permanent de conservation visuelle : 4 cas réussis, 169 empreintes stables. Deux vues mobiles sont comparées intégralement ; deux contenus de thèmes sont comparés pixel pour pixel dans `.mg-main`.

Le nouveau raccourci modifie volontairement le bandeau ordinateur. Les deux comparateurs historiques de présentation ciblent donc désormais les pixels du contenu principal pour les thèmes, tout en conservant leurs comparaisons complètes sur mobile et les vérifications de géométrie, styles et libellés des éléments. Cette évolution ne masque pas une modification de l’audio ou des règles d’apprentissage.

Le JavaScript de présentation, le contrôleur, les voix, l’audio, les droits et les données restent identiques à la référence. La couche finie garde son inventaire de 13 fichiers modifiés et 11 ajoutés ; trois empreintes sont actualisées et les 21 autres sont inchangées.

Vérifications dans Chromium local avec écrans émulés, sans compte réel ni requête fournisseur. Pas de test sur appareil physique ou Safari. L’interface publique de production n’a pas été vérifiée depuis cet environnement ; la publication Git et l’image publique d’aperçu sont vérifiées séparément.
