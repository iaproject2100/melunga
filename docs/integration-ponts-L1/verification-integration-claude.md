# Vérification de l'intégration des sept scènes L1 (`b0171bd`)

Objet : `b0171bd` sur `review/integration-ponts-L1`. J'ai reproduit ses tests, vérifié le contenu livré contre les 110 sources, et parcouru les scènes moi-même en navigateur comme un utilisateur non payant. Rien n'est fusionné ni publié.

## Verdict

**L'intégration est propre, le contenu livré est exact, et ses tests se reproduisent.** Le module est branché défensivement — chaque point d'entrée de l'application teste `l1CafeActive()` en tête de fonction et délègue —, donc hors de la nouvelle rubrique le comportement est inchangé.

Trois points demandent votre décision, et le premier est le plus important :

1. **La branche contient onze commits, dont un seul est cette intégration.** Valider « l'intégration » et fusionner la branche ne sont pas la même chose. § 4.
2. **L'oreille disparaît pendant la passe sans modèle**, dans les trois couples que j'ai parcourus. C'est défendable, mais c'est un écart avec votre règle « l'oreille reste accessible ». § 3.
3. **Le commit n'est pas purement additif** : il corrige trois conditions de course de l'application existante, sur des chemins utilisés par tous. § 5.

## 1. Ce que j'ai vérifié

| Contrôle | Méthode | Résultat |
|---|---|---|
| Contenu livré | les 49 phrases de `content/l1-cafe.json` comparées aux 110 sources ; les 14 fragments vérifiés comme sous-chaînes de leur tour parent | **168 champs, 0 écart** |
| Ses tests | exécutés dans un arbre isolé sur `b0171bd` | **448 étapes, 0 erreur** — reproduit |
| Utilisateur non payant | parcours réel en navigateur, fr→ko, fr→zh, zh→fr, API renvoyant `paid:false` | **aucun paywall, 0 erreur JavaScript** |
| Ordre pédagogique | phases relevées à l'exécution | `preparation` → `listen-whole-dialogue` → `reply-with-help` → `reply-without-model` — **l'ordre de votre méthode** |
| Comprendre / produire | état de la carte pendant le masquage | **les répliques du serveur restent affichées en entier**, seules celles de l'apprenant sont masquées |
| L'oreille | code du module | `window.speak(step.phrase.study, …)` — **le texte étudié, jamais la phonétique** |
| Retour aux cartes | sortie vers la rubrique « Tout » | **module arrêté, carte classique affichée** (아니요. / 你好 / Non.) |

Le masquage est précisément ciblé : `phase === 'reply-without-model' && speaker === 'A' && !helped && !complete`. Une réplique du serveur ne peut donc jamais être masquée, même par erreur de phase.

**Un détail de conception que je trouve juste** : pendant le masquage, le texte étudié et la phonétique disparaissent mais **le sens français reste affiché**. L'apprenant sait quoi dire et doit produire la forme. C'est la bonne façon de faire un rappel, et ce n'était pas écrit dans le cahier des charges.

## 2. Mes vérifications de contenu

Les 49 phrases livrées sont identiques aux sources, phonétiques et lectures comprises. Les fragments issus de la scission sont bien des sous-chaînes de leur tour parent — ce qui veut dire qu'aucune phonétique n'a été recomposée au passage du dossier de revue vers le fichier d'exécution. `sourceCommit` pointe sur `30e7d40`, le lot que j'avais déjà vérifié, et la chaîne de provenance est donc complète : source → lot éditorial → fichier d'exécution, sans altération à aucune étape.

Chaque couple livre la même structure : 4 répliques de l'apprenant, 3 reçues, 1 clôture sans réponse obligatoire.

## 3. L'oreille pendant la passe sans modèle — votre décision

Relevé à l'exécution dans les trois couples parcourus : quand la réplique de l'apprenant est masquée, le bouton d'écoute passe en `display:none`.

L'argument pour est solide : entendre sa propre réplique revient à donner la réponse, et le bouton « Retrouver le modèle » rétablit tout en un geste. L'argument contre est le vôtre : « la phonétique adaptée au lecteur, l'oreille 👂 et l'aide restent accessibles » est une règle que vous avez posée sans exception.

Trois issues possibles, et je n'ai pas de préférence forte :

- **Laisser ainsi** et considérer que le rappel est une exception assumée, à écrire dans la méthode.
- **Garder l'oreille active** pendant le masquage : l'apprenant peut s'entendre souffler la réponse, ce qui affaiblit le rappel mais respecte la règle.
- **Oreille active sur les répliques reçues uniquement**, puisqu'elles ne sont pas masquées — à vérifier, il est possible que ce soit déjà le cas et que seule la réplique masquée perde le bouton.

## 4. La branche contient plus que l'intégration

C'est le point à ne pas manquer avant de valider quoi que ce soit. `review/integration-ponts-L1` est **onze commits** devant `main` :

| Commit | Objet |
|---|---|
| `b0171bd` | **l'intégration des sept scènes — le seul que j'ai vérifié** |
| `bb9f904` | formulaires de compte et navigation de compte |
| `5a24a6f` | gestes de balayage depuis les commandes audio |
| `d7c1081` | balayages mobiles avec pinyin et contenu long |
| `2b2d02f` | texte de leçon dégagé des commandes mobiles |
| `501c7f6` | langues d'essai et bouton de démarrage sur ordinateur |
| `bd0c62a` | leçons gratuites plus faciles à trouver |
| `8947cc7` | commande de couleur dans le rail d'ordinateur |
| `647fb7c` | commandes translucides, retrait du bouton retour web |
| `2cdddcf` | commandes rondes approuvées sur mobile et ordinateur |
| `745d4c0` | navigation par icônes thématiques |

Au total, la branche touche **21 fichiers du produit et 6 201 lignes**, dont `index.html`, `desktop-home.js`, `desktop-home.css` et cinq feuilles ou scripts de leçon qui n'ont rien à voir avec les sept scènes.

Plusieurs de ces commits portent « approved » dans leur libellé, donc certains ont probablement déjà reçu votre accord séparément. Mais la conséquence pratique reste : **fusionner cette branche publierait dix changements d'interface en plus des sept scènes, et ma vérification ne couvre qu'un commit sur onze.**

Avant de valider, demandez-lui lesquels de ces dix ont déjà été vus et approuvés par vous, et lesquels ne l'ont pas été. Si certains ne l'ont pas été, le propre de l'intégration L1 serait de la rebaser sur `main` seule, pour que l'accord porte sur ce que vous avez relu.

## 5. Le commit corrige trois défauts de l'application existante

« Le gratuit, les tarifs, les droits et le catalogue restent inchangés » est exact. Mais le commit n'est pas seulement additif : il corrige trois conditions de course qui préexistaient, sur des chemins utilisés par tous les apprenants, pas seulement dans la nouvelle rubrique.

- **Notation des cartes.** `rateCard` agissait après 300 ms sans vérifier que l'état n'avait pas changé : noter une carte puis changer de langue ou de rubrique dans cet intervalle retirait une carte du nouveau tas. Le commit capture l'état et abandonne si quoi que ce soit a bougé.
- **Reconnaissance vocale.** Les rappels `onresult`, `onerror` et `onend` ne vérifiaient pas leur contexte, et les relances automatiques — pack vocal chinois, silence — pouvaient repartir après un changement d'écran. Même correction, dans `app.html` et dans `native-speech.js`.
- **Lecture audio.** Un jeton `speechGeneration`, incrémenté à chaque `speak()` et comparé dans chaque rappel, annule les retours de lecture périmés. J'ai vérifié qu'il est monotone, sans remise à zéro, donc il ne peut pas se bloquer.

Les trois corrections me paraissent justes et conservatrices — elles abandonnent au lieu d'agir. Mais elles touchent la notation et l'audio, c'est-à-dire ce que tout le monde utilise à chaque séance. Si l'une d'elles avait un défaut, il serait général et non limité à la nouvelle rubrique. C'est une raison de plus pour que la validation distingue ce qui est nouveau de ce qui est corrigé.

## 6. Accès et découvrabilité

**La rubrique est gratuite pour tous.** `isLockedMode('l1-cafe')` renvoie faux dès que le couple est disponible, sans consulter le statut payant, et je l'ai confirmé en parcourant les trois couples avec l'API renvoyant `paid:false` : aucun paywall. C'est cohérent avec « aucune réduction du gratuit » — c'est même une extension — mais il faut le dire clairement : **les sept scènes sont offertes aux utilisateurs non payants.**

L'entrée « Premier échange · L1 » est dans le menu des rubriques, en troisième position après « Tout » et le parcours, donc à un geste et sans défilement. C'est le même emplacement que toutes les autres rubriques : ni mise en avant, ni cachée. Si la publicité doit mener quelqu'un directement à cet échange, c'est une question d'atterrissage à traiter à part, pas un défaut de l'intégration.

## 7. Ce qui reste bloquant

**La relecture native des sept scènes.** Inchangé depuis le lot précédent, et c'est le seul point qu'aucun test ne remplace : ni ses 448 étapes ni mes 168 champs ne disent si le refus détaché sonne juste. Les trois vérifications inscrites dans `nativeReview` sont les bonnes, et j'y ajoute toujours le japonais 結構です, absent du catalogue et susceptible d'être entendu comme un refus ferme.

Le reste de l'audit L1–L10 est hors de ce lot et inchangé : L7 plus difficile que L8 dans les sept langues, la zone L2–L4 en dents de scie, le bloc L8 italien, la question de méthode sur « élément préparé », le registre de `L1-03` en ja et ko, et la décision phonétique chinoise à prendre règle par règle.
