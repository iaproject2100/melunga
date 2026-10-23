# Pourquoi l’entrée chinoise L1 doit être reprise

**Le reproche est fondé sur le contenu réel.** Trois couches différentes portent aujourd’hui l’étiquette L1, sans former une seule progression d’entrée. Le précédent reclassement a conservé les unités L1 et n’a donc pas corrigé ce point. Les données, copies littérales et localisateurs sont dans [chinois-L1-proposition.json](chinois-L1-proposition.json). Cette proposition ne modifie pas l’application, les phrases ou les phonétiques.

## Ce que voit le débutant

| Couche | Contenu effectivement lu | Ce qui manque à la progression |
| --- | --- | --- |
| Bibliothèque classique gratuite, mode « tous » | 314 cartes chinoises de niveau source 1, dont 224 `core`, 45 `biz`, 29 `trip`, 13 `bonus` et 3 `template`. Le bouton explicite L1 ne garde que les 224 `core`. | Un inventaire n’est pas un ordre de prérequis. Le changement de langue appelle `setMode('all')`, qui parcourt les cartes dans l’ordre du catalogue, sans séquence apprendre → reprendre → échanger. |
| Parcours guidé actuel | Trois familles, 19 cartes, ordonnées par `pathLv` puis par leur ordre de cartes. | Les cadres regroupent des intentions et des constructions différentes. Le contenu source va de lv1 à lv10 à l’intérieur du parcours L1. |
| Conversation L1 et maquette du reclassement | 11 unités, 44 variantes. Le chinois proposé conserve l’ordre 01→11 et commence par `我是学生。`, puis les variantes de l’identité, dont `我是来度假的。`. | La salutation n’est pas une unité autonome dans ces onze unités ; le dépannage arrive en dernier. L1 était figé par le lot précédent. Les mentions « appris entier » rendent les limites honnêtes, mais ne rendent pas la phrase plus facile. |

Les 314 cartes ne sont pas toutes des phrases à construire : on y trouve aussi des mots, des formules et trois modèles. Elles peuvent rester une réserve utile sans constituer un passage obligatoire avant L2. Une séquence d’entrée courte ne doit pas remplacer cette réserve ni retirer des droits.

### Le problème le plus net est dans les premières cartes guidées

La famille qui ouvre le chinois L1 est `L1_ETAT_C_EST`, affichée sous le cadre `这是 + 信息` :

| Ordre | Phrase copiée | Niveau source | Nature du saut |
| ---: | --- | ---: | --- |
| 1 | 这是什么？ | 1 | Identifier une chose par une question. |
| 2 | 这是谁的？ | 2 | Possession et interrogation sur le possesseur. |
| 3 | 这是几号出口？ | 4 | Numéro d’une sortie : nombre, numéro et nom nouveau. |
| 4 | 这是几号车厢？ | 4 | Numéro d’une voiture : autre nom de domaine transport. |
| 5 | 这是什么味道？ | 2 | Goût/odeur, complément d’une interrogation. |
| 6 | 这是尺码表 | 4 | Déclaration et tableau de tailles, après cinq questions. |
| 7 | 这是最终报价。 | 10 | Offre de prix finale, contexte professionnel de négociation. |

Ce n’est pas une seule phrase où l’on remplace un élément déjà préparé. Un même début écrit ne suffit pas : question ouverte, possession, numéro, goût et déclaration commerciale ont des fonctions différentes. La phrase du devis n’est pas adaptée à l’entrée d’un grand débutant simplement parce qu’elle commence par `这是`.

Les deux autres familles ont le même défaut :

- **Besoin :** repos, aide, temps, parapluie avec `一把`, consultation d’un médecin avec `看` et réflexion avec `再想想`. Ce ne sont pas six noms interchangeables. Le cadre annoncé « chose / action » ne prépare pas ces différences.
- **Localisation :** `在哪里？`, `你在哪里？`, toilettes, gare, `我们在哪儿？`, puis `你住在哪里？`. Ajouter la personne, une variante de la question et le verbe habiter dépasse une simple substitution de lieu.

Dans ces 19 cartes, les niveaux source sont **2 cartes lv1, 9 lv2, 3 lv3, 4 lv4 et une lv10**. Cette mesure décrit les provenances, pas une échelle objective de difficulté. Les exemples ci-dessus donnent la raison linguistique et situationnelle de la reprise.

## Même progression de compétences, micro-étapes adaptées

Le précédent plan conversation contient **cinq ordres de compétences distincts pour les sept couples**. Anglais et espagnol commencent par le nom ; chinois et japonais par l’identité ; italien place la commande en troisième ; le français pour sinophones commence par la commande. On ne peut donc pas présenter ce L1 comme une progression commune déjà réalisée.

Une échelle commune doit d’abord fixer ce que la personne saura faire : entrer dans un échange, se présenter brièvement, signaler une incompréhension, formuler une demande simple, trouver un lieu, tenir un échange préparé. Elle n’oblige pas les langues à employer le même nombre de syllabes ou les mêmes règles. Le chinois doit préparer un groupe avec classificateur entier ; le français doit préparer son groupe avec déterminant ; le coréen sa formule et ses terminaisons. Ces adaptations restent à l’intérieur de la même capacité, sans lancer plus tôt une autre compétence.

La lecture des caractères, les tons et leur écoute ajoutent un travail propre au chinois. Le pinyin est une lecture existante et l’aide francophone un repère ; aucun n’est annoncé comme une garantie de prononciation exacte. L’oreille reste accessible. Une phrase courte peut rester difficile à entendre, et une longueur moyenne entre langues ne permet pas de trancher.

## Proposition d’entrée concrète : cinq micro-leçons, six phrases sources

Une micro-leçon ne lance qu’une capacité. Elle présente la phrase entière, propose son imitation, puis seulement un choix parmi les phrases préparées et un rappel avec aide réaffichable. Le passage ne certifie pas une acquisition.

| Micro-leçon | Phrases existantes | Une seule nouvelle capacité |
| ---: | --- | --- |
| 1 | 你好 | Saluer. |
| 2 | 再见 | Prendre congé. |
| 3 | 我叫玛丽。 / 我叫保罗。 | Donner un prénom ; seul le prénom varie entre deux phrases entières préparées. |
| 4 | 我不懂。 | Signaler immédiatement qu’on ne comprend pas. |
| 5 | 我要水。 | Formuler une demande élémentaire, apprise entière dans ce contexte. |

Les deux formules viennent de `DECKS.zh[0]` et `[8]`, toutes deux source lv1. Le prénom, le dépannage et l’eau viennent des variantes **déjà présentes dans la conversation L1**, avec leur `phon` et leur `reading` entiers. Le JSON fournit toutes les valeurs copiées ; aucune transcription n’est créée.

Un tout premier échange peut être proposé en réarrangeant des énoncés existants : `你好` → `你好` → `我要水。` → `好的`. **Cette disposition de tours est une proposition éditoriale nouvelle**, et non un dialogue source prétendument retrouvé ou une scène déjà validée. Les quatre énoncés et leurs aides existent ; l’acquiescement reste reçu, jamais une nouvelle tâche de production. Sa mise en contexte est à relire avec Claude.

Le but de cette entrée est une première action parlée accessible, pas la promesse d’un échange autonome en quelques minutes. Elle ne prétend pas résoudre tout L1 à elle seule.

### Suite L1, avec une difficulté nouvelle à la fois

Le parcours peut ensuite conserver ses contenus et les préparer par micro-étapes :

1. Demander une répétition : `请再说一遍。`, formule entière.
2. Donner une identité simple : `我是学生。` / `我是法国人。`. L’expression de vacances est gardée pour une étape distincte.
3. Trouver un lieu : `出口在哪里？` / `地铁在哪里？`, sans introduire simultanément `住` ou la question de possession.
4. Commander une boisson : `请给我一杯咖啡。` / `请给我一杯茶。`. Le groupe `一杯` reste stable ; le sandwich avec `一个` est préparé séparément.
5. Reprendre la **scène café existante** et son refus/prix déjà sourcés, après sa préparation explicite. Sa réponse de prix est à comprendre, pas à produire par l’apprenant.
6. Exprimer une préférence : `我喜欢咖啡。` / `我喜欢音乐。`. Les variantes avec activité ne sont pas déclarées préparées par ces deux noms.
7. Indiquer une destination : `我去公司。` / `我去市场。`, une capacité différente de chercher un lieu.

La proposition détaillée distingue cette consolidation de l’entrée de six phrases. Les autres variantes L1 restent disponibles et sont reprises ensuite dans des contextes pertinents : transport, repas, états, déplacements. La matrice complète commune doit encore décider leur palier pédagogique exact ; elles ne sont ni supprimées ni réputées acquises.

### Ce qui sort de l’entrée obligatoire, sans devenir payant

`我是来度假的。`, la demande de billet avec `一张`, la commande de sandwich avec `一个`, le dialogue de gare qui ajoute `去上海的票`, les montants et les directions, ainsi que les phrases guidées de devis, tailles, numéro de voiture et réflexion ne servent pas à amorcer L1. Une reprise pédagogique plus tardive ne doit pas être transformée en changement d’accès.

Point d’accès à ne pas manquer : les **19 cartes guidées L1 sont actuellement ouvertes par `pathLv:1`**, même quand leur `lv` source est 2, 4 ou 10. Deux appartiennent déjà au catalogue source lv1 ; les **17 autres sont aussi des droits gratuits existants dans ce parcours**. Le total distinct catalogue L1 + ancien guidé L1 est donc **331 cartes**. Si l’on retire une carte du parcours d’entrée et qu’on ne conserve que `FREE_LV=[1]`, ces 17 accès peuvent disparaître par effet de bord. Il faut les garder dans une bibliothèque gratuite ou un accès hérité explicite.

## Ce qu’il faut réellement intégrer

`guidedPool` résout aujourd’hui seulement un texte dans `DECKS`. Il ne peut pas afficher magiquement `我叫玛丽。` depuis les 110 JSON : au catalogue, le modèle disponible est notamment `我叫……`, pas cette phrase complète. La remise en ordre demande donc un adaptateur de banque et une séquence réelle, pas seulement des nouvelles lignes documentaires ou des titres de niveaux.

Les champs corrects du catalogue chinois sont `t`, `frm`, **`phf`** et `py`; les variantes conversation utilisent `study`, `native`, **`phon`** et `reading`. Chaque phrase conserve l’aide de sa source. Les divergences chinoises déjà documentées ne sont pas harmonisées dans cette proposition. En particulier, aucune règle universelle « 要 + objet / 想 + action » n’est enseignée.

**État du présent lot :** 22 cartes catalogue et 44 variantes conversation copiées comme références, 0 aide rédigée, 0 phrase source retouchée, 0 fichier produit modifié. C’est une proposition fondée sur l’entrée réelle ; son intégration et l’enrichissement des autres niveaux restent à réaliser dans le travail global.
