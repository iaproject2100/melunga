# Retour à Claude — tour 2 et raccord du générateur

Claude — le raccord technique de tes registres de `dfc665b` est désormais porté
par une source versionnée consommée par `build_levels.py` :
`docs/niveaux-progressifs/corrections-phonetiques/revue-claude-lot2.json`.
Il réapplique les aides après validation des origines et met à jour les copies
utilisées en révision. Les originaux et leurs provenances restent distincts des
corrections. Aucun calcul général de phonétique ni règle A n’est exécuté.

**Le total exact est 774 événements sur 772 cartes distinctes**, pas 774 cartes :
`catalogue:zh:175` et `catalogue:zh:1032` reçoivent B puis D. Les événements sont
composés dans cet ordre ; les aides entières finales gardent les deux retouches.
Les 772 cartes et leurs 14 copies de transport, soit 786 occurrences, appartiennent
à la même édition corrigée. Pour la suite, livre les nouveaux événements avant/après
et leur motif ; ne retouche pas les seules sorties générées.

**Les 38 aides D ont été relues intégralement**, avec 41 alignements explicites
entre caractère, pinyin et segment modifié. Aucun faux positif trouvé dans ce
registre borné. En revanche, ton script ne vérifie qu’un `j` quelque part dans
la chaîne : il n’aligne pas chaque `tj` avec sa syllabe. Nous consommons donc les
avant/après figés, pas une règle extensible. La justification utile est la
convention `dj` du deck pour ces syllabes ; « tj ne peut jamais se lire en français »
est trop absolu.

Sur la lecture L2, quelques distinctions à conserver :

- **我要退货 (`catalogue:zh:223`)** : la correction de sens vers « je veux retourner
  l’article » est justifiée. Un remboursement peut accompagner un retour, mais
  n’est pas exprimé par le mot seul.
- **能调光吗？ (`catalogue:zh:231`)** : « Peut-on régler l’intensité lumineuse ? »
  est une glose accessible. La question peut porter sur une lampe domestique ;
  elle n’impose pas un niveau avancé ou une scène professionnelle.
- **我累了** : ne pas imposer « je commence à être fatigué ». La valeur de 了
  dépend du contexte ; « je suis fatigué » peut convenir aux deux formes sans
  faire de l’une une carte inutile.
- **这个防水吗？** : utile dans un achat courant ; la technicité d’un produit
  possible ne suffit pas à faire monter la carte.
- **让我想想** n’est pas intrinsèquement « plus hésitant » que 让我想一下.
- **给我看看** : les gloses françaises « montre-moi/montrez-moi » ne créent pas
  une opposition grammaticale en chinois, mais ne supprime pas un identifiant
  pour autant. Documenter l’équivalence ou le réemploi et conserver les sources.

Pour les destinations de thèmes, la lecture des titres est nécessaire, mais il
faut aussi vérifier que l’acte de parole accomplit l’objectif. « Sais-tu conduire ? »
ne demande pas un chemin ; 我买这个 ne désigne pas forcément un aliment ; un récit
de sommeil ne précise pas le domicile. Le dossier chinois donne les cinq cas,
les intitulés réels et les choix restant à contextualiser. Une adaptation de
thème cohérente et documentée vaut mieux qu’un déplacement forcé dans un titre
existant ; aucun de ces cinq déplacements n’est appliqué par le raccord phonétique.

La couverture individuelle annoncée reste **2 cellules sur 70**. Continue la
lecture des 68 autres sans attendre les arbitrages des conventions chinoises
ouvertes. Les registres de correction doivent rester bornés à des aides entières,
les propositions incertaines séparées et la présentation validée conservée.
Les textes, niveaux et droits d’accès n’ont pas été modifiés par ce raccord.
Ajoute au prochain registre les deux répliques reçues « les » omises, avec leurs
aides entières avant/après et leurs sources. Les deux corrections de glose
justifiées pour 退货 et 调光 restent un lot de contenu séparé du raccord phonétique.
Pas de fusion dans `main` ni publication sur melunga.com dans cette revue.

Contrôles du raccord : **4 tests ciblés, 9 contrôles des commandes, 19 contrôles généraux réussis ; 55 anomalies volontaires refusées**. [Rapport et limites](../verification-raccord-phonetique.md).
