Claude — j’ai préparé le lot suivant sur `review/progression-L1-L10`, à partir de l’audit `bcd108d`. Il propose un ordre concret pour les **841 unités des sept couples actifs**, avec leurs **3 364 variantes** conservées. Rien n’est fusionné ni publié.

Le paquet couvre les 70 cases langue/niveau. Il propose **122 déplacements entre niveaux 2–10**, motivés unité par unité : réponses simples avant les questions qui les reprennent, bases temporelles avant les contrastes, demandes et refus avant la négociation. Ce n’est ni un échange général de L7/L8, ni un tri par longueur, ni une renumérotation des sources. L1 conserve ses onze unités par couple, sans déplacement entrant ou sortant.

Les plans déclarent **319 premières comparaisons limitées à deux variantes**, après présentation et imitation exactes des deux phrases. Les **522 autres unités** restent des expressions entières à préparer ; les quatre variantes sont disponibles partout. La reconstruction du cadre écrit est vérifiée, mais elle ne certifie pas l’unicité de l’opération linguistique. Par exemple, la première comparaison anglaise des superlatifs a été écartée parce qu’elle changeait l’entité et la propriété malgré un gabarit écrit conforme.

`plannedPrerequisites` décrit un ordre éditorial, pas les acquis. Les 1 353 liens sont strictement antérieurs et restent dans le même couple. `preparedChoices` pointe séparément vers les étapes de compréhension et d’imitation de chaque phrase exacte. Le repère `element-prepare.md` explicite cette distinction avec des contre-exemples sourcés.

Merci de vérifier en priorité :

1. Les **placements et dépendances**, surtout L2–L4 et L7–L8, avec leurs raisons dans `corrections.md` et les quatre `editorial-*.json`.
2. Les **319 premières paires** : même fonction du groupe, pas de changement supplémentaire de temps, particule, personne, registre ou construction masqué par le gabarit. Les autres variantes ne sont pas automatiquement déclarées équivalentes.
3. Les **330 réserves et préparations restantes**. Le déficit lexical italien L8 à 52–54 % n’est pas déclaré résolu par des liens ou déplacements ; `note-it-ko.md` le détaille.
4. La cohérence entre le chemin proposé et les activités de la **maquette** : phrase entière, imitation, comparaison ciblée quand elle est déclarée, choix d’intention et rappel avec oreille/aide accessible.

Contrôles : **21 tests Python**, **23 664 étapes navigateur** sur 320/390/1440 px, **0 erreur JavaScript**. Les 110 JSON et l’application source sont identiques à la base, les 3 364 copies de variantes et toutes leurs aides sont vérifiées contre Git. Le rapport navigateur est lié à l’empreinte du paquet final. Les tests prouvent intégrité, ordre et rendu, pas la progressivité linguistique ni l’acquisition.

Périmètre à garder explicite : le **catalogue classique de 32 115 entrées n’est pas reclassé** ; les dialogues ne sont pas automatiquement déplacés avec les unités. Les sept scènes L1 validées techniquement dans `939b82e` restent un lot séparé. Le registre ja/ko et les conventions phonétiques chinoises restent inchangés. Les quatre couples en réserve ne sont pas activés. Prix et droits ne changent pas.

Cette branche est une branche de **revue issue de l’audit**, pas une branche de livraison à fusionner directement dans `main`. La relecture native et les essais avec apprenants restent nécessaires ; aucune validation de maîtrise ou équivalence CECRL n’est revendiquée. Rien à fusionner ni publier.
