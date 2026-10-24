# Besoins grammaticaux à préparer — L1 à L10

Statut : cahier de besoins pour recherche de sources et travail éditorial Codex.
Claude vérifie uniquement les phonétiques nouvelles ou signalées.
Ce cahier de besoins n’active lui-même aucune carte et ne modifie aucun niveau
source. Les corrections et enrichissements réalisés depuis sont consignés dans
`corrections-themes/`, avec une liste distincte des nouvelles aides à vérifier.
Ce document complète `politique-vocabulaire-phrases.json`.

Les trois destinations Adjectifs, Prépositions et Adverbes sont prévues à chaque
niveau **lorsque des entrées correspondantes existent**. Elles ne sont pas
réputées remplies. Une capacité peut progresser grâce au réemploi d'un mot déjà
présent, sans imposer dix listes de mots nouveaux ou dix cases artificielles.

## Point de départ à vérifier

Les premières mesures de classement candidat repèrent des entrées isolées
surtout en L1–L2 et de nombreux trous plus haut. Un premier état ne repérait
aucune préposition isolée en espagnol ; les partitions et les gardes sont encore
en cours de vérification. Les totaux consolidés devront venir de
`classement.json` (`lexicalClassCounts`, `lexicalThemesWithoutSourceContent`).
Cela décrit le résultat du classifieur,
**pas une absence linguistique ni une absence définitive dans les sources** :
étiquetage ancien, sens polysémique et locution non reconnue peuvent produire
des faux négatifs. Les familles restées vides doivent d'abord être recherchées
dans les sources, puis documentées avec un périmètre et une méthode explicites.

## Progression proposée pour la recherche

Les niveaux suivent les capacités du plan commun ; ce ne sont ni des niveaux
CECR ni une grammaire universelle. Chaque cellule décrit un besoin à chercher
ou un réemploi à organiser. **Tous les exemples français entre guillemets sont
indicatifs : ils ne sont ni des cartes approuvées ni du contenu à publier.**
Leur traduction, leur structure et leur registre restent à décider par langue.

| Niveau et capacité | Adjectifs / unités descriptives | Prépositions / relations | Adverbes / unités de modification |
| --- | --- | --- | --- |
| L1 — Premiers échanges | Une propriété concrète utile ; réemployer une demande connue : « Un petit café, s'il vous plaît. » | Situer une personne ou un objet dans une relation simple préparée : « Le sac est sur la table. » | Modifier une action connue ou répondre sur son lieu, si la langue le permet : « Je reste ici. » |
| L2 — Besoins et intentions | Préciser un besoin par une propriété préparée : « Je voudrais de l'eau chaude. » | Préciser une destination ou un bénéficiaire sans changer tout le modèle : « C'est pour ma sœur. » | Préciser une intention avec un modificateur préparé : « Je veux seulement de l'eau. » |
| L3 — Routines et projets | Décrire un lieu ou une activité familière : « Le trajet est court. » | Situer une routine ou un projet dans un lieu connu : « Je travaille près de la gare. » | Introduire une fréquence attestée, puis varier un élément : « Je mange souvent chez moi. » |
| L4 — Raconter simplement | Réutiliser une propriété dans une construction de récit déjà préparée : « Le restaurant était calme. » | Situer deux faits sans cumuler des relations nouvelles : « Après le repas, je suis rentré. » | Organiser deux faits ou préciser une action passée : « J'ai ensuite appelé mon ami. » |
| L5 — S'organiser et se débrouiller | Décrire un problème ou une solution concrète : « La porte est bloquée. » | Indiquer un point de rencontre ou une limite utile : « Retrouvons-nous devant la gare. » | Préciser la manière ou le délai d'une action : « Vérifie bien l'adresse. » |
| L6 — Expliquer et comparer | Comparer deux propriétés après préparation de la construction propre à la langue : « Cette chambre est plus calme. » | Exprimer une relation utile à une explication préparée : « Le retard est dû à la pluie. » | Préciser le degré sans ajouter en même temps une comparaison inconnue : « C'est vraiment utile. » |
| L7 — Conditions et possibilités | Décrire une possibilité ou une contrainte : « Ce créneau est disponible. » | Relier une option à sa condition dans un cadre préparé : « En cas de pluie, restons ici. » | Distinguer possibilité et certitude dans l'usage retenu : « Il viendra peut-être. » |
| L8 — Nuancer et adapter | Distinguer deux propriétés proches dans une situation concrète : « C'est pratique, mais fragile. » | Exprimer une limite ou une réserve sans présenter une locution comme règle universelle : « Malgré le retard, nous pouvons partir. » | Ajuster le degré ou la portée d'une affirmation : « Je suis plutôt satisfait. » |
| L9 — Développer un point de vue | Qualifier une proposition et justifier ce choix : « Cette solution me paraît cohérente. » | Relier une proposition à un critère ou un point de vue : « Selon ce critère, cette option convient. » | Préciser la portée d'un argument : « Cela concerne surtout les débutants. » |
| L10 — Converser avec souplesse | Reformuler une appréciation et adapter son registre : « Je dirais plutôt que cette réponse est incomplète. » | Choisir entre plusieurs constructions de relation déjà rencontrées ; expliquer un malentendu de sens. | Choisir un degré de certitude, corriger sa formulation et nuancer un désaccord : « Ce n'est pas exactement ce que je voulais dire. » |

La présence d'une construction dans cette table ne l'introduit pas directement
en production. Une phrase longue peut réemployer des mots simples ; un mot
court peut demander une construction nouvelle. Le nombre de mots n'est donc
pas le critère d'affectation. Les outils de récit, de comparaison ou de
condition ne doivent pas être cachés dans une simple substitution lexicale.

## Adaptation obligatoire à la langue étudiée

- **Japonais :** vérifier les unités descriptives et leurs emplois attributifs
  ou prédicatifs ; ne pas traiter tous les descriptifs comme un unique modèle.
  Les relations peuvent passer par des particules et des constructions entières.
  Une particule attachée à un emplacement vide n'est pas une carte autonome.
- **Coréen :** tenir compte des verbes descriptifs et de leurs formes en phrase.
  Les particules, postpositions et formes liées ne se remplacent pas par un
  tableau de prépositions françaises. Une forme complète de dictionnaire et une
  réplique conjuguée peuvent avoir des fonctions pédagogiques différentes.
- **Chinois :** vérifier les constructions descriptives, le degré et les
  relations effectivement employés ; ne pas importer automatiquement la copule
  ou les catégories du français. Les éléments de localisation et les
  constructions verbales de relation demandent une analyse dans leur phrase.
  Toute convention phonétique reste celle de la source, sans harmonisation ici.
- **Autres couples :** vérifier place, accord, complément et registre dans la
  langue étudiée. Une traduction française identique ne prouve pas une
  catégorie ni une construction identique en anglais, espagnol ou italien.

Une locution de temps n'est pas automatiquement un adverbe. Une unité appelée
« adjectif » dans la traduction française peut être une prédication complète
dans la langue étudiée. Une locution de relation n'est admissible en vocabulaire
que si la source la fournit entière et bornée. Toute hésitation reste en revue.

## Recherche des sources avant toute rédaction

1. Reprendre les cartes déjà classées, leurs cas `review` et leurs catégories
   historiques : le classifieur peut avoir manqué une entrée existante.
2. Rechercher dans les sept decks le texte étudié, son sens, ses variantes
   sémantiques et les locutions entières. Conserver index, champs exacts et
   empreinte ; lire la source étudiée, pas seulement la traduction française.
3. Chercher ensuite dans les 110 JSON de conversation des variantes **entières**
   et les dialogues préparés. Une phrase contenant un adjectif peut enrichir
   une situation ; elle ne fournit pas une carte d'adjectif par extraction.
4. Vérifier les doublons de texte étudié et les divergences d'aides ou de sens.
   Ne pas afficher deux versions concurrentes ni choisir silencieusement une
   phonétique. Consigner le cas pour décision et revue.
5. Si aucune source appropriée n'est trouvée après cette recherche bornée,
   ouvrir un besoin de rédaction distinct. Il exigera une formulation revue,
   sa phonétique entière selon la méthode de Kartech et une validation adaptée.
   Aucun collage de syllabes ni traduction automatique n'est publiable ici.

## Réemploi et contrôle éditorial Codex

Pour chaque couple, niveau et destination, consigner : capacité visée, source
recherchée, résultat exact ou manque encore candidat, construction nécessaire,
statut de revue et niveau de première rencontre. Une entrée déjà apprise est
rappelée par `reuseVocabularyIds`, sans duplication canonique ni déplacement
du niveau catalogue pour faire coïncider le mot et sa phrase.

Dans les situations, préparer une phrase entière puis permettre une variation
vérifiée, avec un seul changement à la fois quand la structure le permet.
Comparer ensuite deux phrases réellement parallèles et terminer par un échange
utile. Une substitution qui change accord, particule, complément ou registre
doit déclarer cette opération ; elle n'est pas présentée comme un simple mot
interchangeable. La préparation prévue ne mesure pas l'acquisition.

Codex vérifie la fonction grammaticale dans la langue étudiée,
la progressivité des constructions, l'utilité de l'échange, la conservation des
champs source. Claude vérifie la conformité phonétique uniquement. Une rubrique vide peut rester vide
en attendant une source ou une décision ; ce cahier n'autorise ni activation,
ni publication, ni nouvelle carte, ni modification de la frontière gratuit/payant.
