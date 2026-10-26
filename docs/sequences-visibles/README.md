# Séquences visibles pour les longues rubriques

Cette PR part de `ebd6519`, publication de la version approuvée de #17. Elle transforme l’entrée des **67 rubriques de plus de 100 présentations** en un choix de **337 séquences de 30 à 40 cartes**. Les rubriques plus courtes gardent leur entrée directe.

Le découpage suit les frontières des groupes techniques existants. Une partition déterministe cherche un nombre de séquences proche de 35 cartes chacune, sans couper un groupe ni créer de petite séquence finale. Les 11 809 présentations et leurs 35 427 étapes gardent leur ordre exact. Les onze rubriques dont les groupes partiels ne sont pas tous à la fin sont prises en compte.

La rubrique la plus longue, fr→zh L10 « Adjectifs », passe de 387 présentations à onze séquences : dix de 35 cartes et une de 37. Le titre de la rubrique reste identique. La leçon indique la séquence en cours ; à la fin, l’apprenant peut continuer avec la suivante ou revenir à la liste. Le Pinyin, les quatre balayages et « À revoir » sont conservés. Les modes de révision libre du menu restent disponibles.

Le découpage se fait dans l’interface : **les 78 JSON du parcours sont identiques à la base publiée**, sans modification de contenu, phonétique, thème, niveau, rôle ou ordre. Aucun générateur ni registre pédagogique n’est modifié. Les tarifs, droits, comptes, catalogue classique, CSS et photographies restent inchangés.

Pour l’essai : choisir le chinois, L10, puis « Adjectifs ». La liste des onze séquences permet de vérifier le début, le milieu et la fin de la rubrique. L’ancienne page L1 compatible reste en entrée directe.

Vérifications : six groupes ciblés réussis, couvrant les 67 rubriques aux deux tailles d’écran ; neuf contrôles de leçon réussis ; contrôle de compatibilité exhaustif d’une cellule fr→zh L10 à 390 px, explicitement partiel. Les mesures portent sur Chromium local, des écrans simulés et une synthèse vocale instrumentée. Les rapports et captures sont dans ce dossier.

Le raccordement de l’accueil et de la connexion au nouveau parcours est traité séparément à la demande de Kartech. Cette PR des séquences reste en aperçu, sans autorisation de fusion ni de publication.
