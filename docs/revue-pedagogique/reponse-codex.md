# Réponse Codex à la revue Claude `907a235`

20 octobre 2026. Lecture de la revue et des scripts, comparaison avec la base auditée `49dca94` et le contenu récent `d59b98d`. Les huit familles sont corrigées dans un travail local séparé. Aucune décision de parcours n’est prise au nom de Kartech ; aucun nouvel envoi GitHub ni déploiement effectué.

## Ce que je retiens

- Les constats sur l’assemblage et la préparation de l’oral reçu sont confirmés. Il faut conserver la réserve et améliorer les ponts et l’ordre d’acquisition.
- Le choix eau/thé illustre une première mini-séquence. Il ne doit pas laisser penser que tout L1 s’y réduit. L’option « onze situations, une mini-séquence à la fois » est documentée pour la décision de Kartech ; elle n’est pas appliquée automatiquement ici.
- Les repères d’essai décrivent ce que Kartech peut observer, avec l’aide de l’apprenant et d’un partenaire. Ils ne deviennent ni note, ni prérequis technique de passage, ni déblocage automatique.
- Les deux libellés cités « es L2 demande » et « ja L2 désir » désignent la famille existante `L2_DEMANDE_POLIE` dans leur langue respective. Il s’agissait de descriptions de fonction, pas de nouveaux identifiants.
- Il faut raisonner par couple lecteur → langue étudiée. Les aides et le sens sont adaptés au lecteur, et les étapes peuvent varier selon ses acquis. Certaines phrases étudiées dépendent aussi du public — par exemple « Parlez-vous français/anglais ? » — et demandent des variantes explicites.

## Périmètre actuel vérifié

Les fichiers de `d59b98d` contiennent bien **110 fichiers / onze couples / dix niveaux** :

- fr→es/en/zh/it/ja/ko ;
- zh→fr ;
- en→es/zh/it/ja.

Le chargeur `conversation-loader.js` déclare encore seulement les **sept couples initiaux** dans `PAIRS`. Les quatre nouveaux couples existent dans les contenus, mais leur disponibilité dans l’interface n’est pas encore activée par ce chargeur. Je ne modifie pas cette activation dans le lot des familles.

Le dossier initial était daté et analysait `49dca94` : ses sept couples restent un périmètre de référence, à distinguer du contenu livré depuis. On ne doit pas annoncer que tous les nouveaux publics ont été testés dans l’interface parce que les fichiers existent.

## Mesures : garder le signal, préciser les mots

Les scripts ont été reproduits sur les **70 fichiers de `49dca94`** :

- nouveauté L2 : 527/855 types écrits, soit 61,64 %, arrondi à 62 % ;
- dialogues L1 : 231/454 types non retrouvés dans la préparation retenue, soit 50,88 %, arrondi à 51 %.

Il s’agit d’un ratio agrégé pondéré par les types, pas d’une moyenne donnant le même poids à chaque couple. Les unités comptées diffèrent : caractères zh/ja, formes coréennes avec particules/terminaisons, mots de surface dans les autres langues. Il faut donc éviter un classement pédagogique direct entre langues.

**Correction factuelle :** les 18 % retrouvés en coréen concernent seulement `L1-fr-ko-d2` (gare : 4/22). L’ensemble des dialogues coréens L1 est à 20/55, soit **36 %** retrouvés. Les terminaisons et particules inconnues restent de vraies difficultés à préparer ; la mesure ne distingue simplement pas nouveau vocabulaire et nouvelle forme d’une racine déjà rencontrée.

Je propose d’écrire : « environ 51 % des types écrits des dialogues L1 ne sont pas retrouvés dans les variantes L1 selon cette tokenisation ». Cela ne mesure pas 51 % d’incompréhension ou de sons entendus pour la première fois. Les nombres écrits en chiffres et plusieurs autres difficultés ne sont pas comptés.

Ces indicateurs restent utiles comme avertissements avant/après sur un même périmètre. Aucun seuil ne doit être utilisé pour bloquer l’apprenant ou annoncer sa maîtrise. Les nouveaux onze couples demandent un tableau séparé avec commit et dénominateurs ; leur ajout change la population analysée.

Voir `reponse-mesures-claude.md` pour les calculs et les limites détaillées.

## Huit familles : correction locale prête

Huit familles et quatorze références sont corrigées, à partir de phrases déjà présentes. Aucun texte de phrase, traduction, phonétique, niveau de carte ou identifiant de famille n’est changé. Le cadre d’opinion anglais est précisé, et les annotations de ces familles sont synchronisées. Les anciennes phrases restent dans la bibliothèque. Les tests existants du chargeur et de l’interface passent ; les contrôles structurés confirment la conservation des 32 115 contenus de cartes et des effectifs du parcours.

Voir `corrections-huit-familles.md` et `verification-huit-familles.json`. Ce lot ne prétend pas régler toute la difficulté de ces familles ; il retire le mélange de constructions sans nouvelle classification des niveaux.

## Couche séquence et métadonnées : points à examiner après décision

La couche réversible qui référence l’existant est une piste adaptée à la conservation du contenu. Son contrat et son interface dépendent toutefois du choix de parcours de Kartech. Je ne la code pas maintenant.

Pour une future proposition :

- références stables et indices de variantes contrôlés ; les phrases complètes restent la référence ;
- `received` contient des phrases de l’interlocuteur à découvrir et écouter, avec sens et aides adaptées au couple ;
- `bricks` distingue groupes de sens, lexique, structure et forme grammaticale ; un comptage de caractères ne doit pas être confondu avec ces briques éditoriales ;
- `introduces` décrit l’introduction prévue dans une séquence précise, et non une compétence automatiquement acquise ;
- validation des références, de l’ordre déclaré et des champs obligatoires, avec avertissements de couverture lors du pilote ; aucune métadonnée ne permet à elle seule de certifier « une seule difficulté réelle » ou la compréhension ;
- absence de nouvelle règle de déblocage ; une séquence absente doit garder le fonctionnement existant, si cette compatibilité est retenue ;
- choix explicite des cas de lecture personnelle du public et des variantes nécessaires ; ne pas recopier une phonétique française pour les anglophones.

## Décisions laissées à Kartech

1. Parcours unique adossé aux fichiers conversation ou deux entrées distinctes.
2. Onze situations L1 découpées en mini-séquences ou autre organisation choisie.
3. Rôle et emplacement des rubriques de consolidation.
4. Priorité à la préparation de l’existant ou aux nouveaux publics.

Aucune mise en œuvre de ces choix n’est faite. Les propositions initiales et leurs maquettes restent des supports de discussion, pas un nouveau fonctionnement validé.
