# Contenu incertain tranché : 637 événements exécutés, un bloc retiré

La preuve originale du commit `17b003810a15954d933f49decc2bafa53de8d881` contient 638 événements retenus parmi 783 propositions : 478 gloses et 160 blocs. Ses 145 décisions écartées ne deviennent pas des corrections. Le registre et son README sont conservés à l’octet près ; [evidence-errata-1.json](evidence-errata-1.json) conserve également l’erratum officiel du commit `4247ca470354f59ea37992608b38e3728a6e22f9`.

La couche exécutable [registre-contenu-tranche.json](registre-contenu-tranche.json) s’appuie sur les tuples exacts de `13f42b5814f2b230d76d2d0ef267dcf406c523c2`, après les corrections de contenu du lot 9. Elle applique 478 gloses et 159 blocs : **637 événements, 870 champs distincts approuvés**, dans **654 objets / 887 champs effectivement changés**. Les profils comprennent 626 objets canoniques, 17 copies de transport et 11 modèles reçus.

Le fichier [exceptions-contenu-tranche.json](exceptions-contenu-tranche.json) trace le retrait officiel de l’événement 211, `catalogue:it:1239`. L’auteur confirme que l’étude actuelle « Si guadagna bene da vivere. » est correcte et que le changement proposé ne l’améliore pas. La carte conserve son étude, son aide et sa glose, ainsi que tous ses autres champs. La preuve initiale de 638 événements reste inchangée.

Pour `catalogue:ko:3637`, l’erratum remplace uniquement l’aide approuvée du bloc entier par « gueu-nyo-neun sam-guè gou-go-reul hè-sso-yo ». Son étude « 그녀는 3개 국어를 했어요. » et sa lecture restent celles du bloc source. Les aides des blocs `catalogue:es:3353` et `catalogue:ko:3767` sont confirmées : leurs anciens événements de convention deviennent sans objet. Cette couche applique les blocs complets ; la couche de conventions doit conserver ces trois décisions officielles.

Chaque événement garde ses valeurs littérales avant/après. Un bloc est atomique, y compris ses champs de lecture et de sens lorsqu’ils sont présents. Neuf blocs ne changent que l’étude ; aucune aide ou lecture non approuvée n’est ajoutée. Les 150 objets dont l’aide change reçoivent un statut phonétique propre à cette couche ; les autres statuts restent identiques. Les anciennes annotations et provenances sont conservées intégralement.

Les copies par identifiant sont mises à jour, avec leurs positions figées et une empreinte de l’objet complet avant correction. Les champs hors correction, le type, le rôle, l’ordre, l’emplacement et le niveau source sont protégés. Une exécution répétée restitue exactement la même édition. Un bloc partiellement appliqué, une copie manquante ou déplacée, une preuve modifiée ou une annotation antérieure altérée provoque un refus.

Sept compteurs `pedagogicalConceptCount` sont recalculés à partir des présentations et références existantes : trois étaient déjà périmés dans la base et quatre changent avec les nouvelles études ou gloses. Les listes de présentations, leur ordre et leur statut de densité ne sont pas reconstruits. Le rapport de densité porte les mêmes nombres.

Cette couche reste indépendante des propositions de classement et des conventions de prononciation. Elle ne modifie ni l’application classique, ni les droits, ni les tarifs. Elle ne déclare aucune validation native ou phonétique globale, aucune publication et aucune fusion dans `main`.

Les empreintes des preuves, de la base et de l’édition produite, les compteurs et les vérifications ciblées figurent dans [preuve-contrats.json](preuve-contrats.json). Le contrôle indépendant reconstruit les événements à partir de la preuve originale et compare les objets complets, puis rétablit la base avant de vérifier les couches antérieures.
