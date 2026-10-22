# Vérification du lot des ponts L1 (`30e7d40`)

Objet : `30e7d40` sur `review/ponts-L1-sept-langues`. J'ai vérifié mécaniquement les trois choses que le lot affirme — conservation exacte des aides, scission sans perte, scènes atteignables — contre les 110 fichiers sources, et non contre les contrôles de Codex. Rien n'est fusionné ni publié.

## Verdict

**Le lot fait ce qu'il annonce, et il est vérifiable.** Les quatre défauts que j'avais relevés sur les pilotes sont corrigés par construction, et deux de mes propres approximations sont rectifiées par son travail. Je n'ai aucune réserve technique.

Un seul point mérite votre attention, et il n'est pas dans le lot : **ces sept scènes sont dans un dossier de revue, pas dans l'application.** Voir § 4.

## 1. Ce que j'ai vérifié, et comment

| Contrôle | Méthode | Résultat |
|---|---|---|
| Conservation des aides | chaque champ copié comparé à la tranche `[début:fin]` annoncée du tour source réel | **48 champs, 0 écart** — `study`, `phon`, `native`, `reading` |
| Tour parent déclaré | `expectedParent` de la banque contre le tour du fichier | **62 champs conformes** |
| Scission sans perte | les deux fragments couvrent-ils le tour entier ? | **7 tours, couverture complète**, seuls des blancs entre fragments |
| Répliques reçues | `expectedStudy` contre la source, et appartenance au rôle de l'interlocuteur | **21 déclarations conformes, 0 écart** |
| Atteignabilité | chaque réplique de l'apprenant est-elle préparée en production ? | **7 scènes × 4 répliques, 0 non préparée** |
| Cycle du contrat | question reçue → réponse préparée → clôture | **complet dans les sept scènes** |

Le choix d'enregistrer des **offsets de caractères** plutôt que des séparateurs est meilleur que ce que j'avais proposé : il rend la scission vérifiable par reconstruction, et c'est ce qui m'a permis de contrôler la conservation sans lui faire confiance. `newStudiedPhrases: 0` et `newPhonetics: 0` sont confirmés : aucune phrase, aucune phonétique n'a été produite.

## 2. Mes quatre défauts des pilotes, corrigés

1. **Salutation attribuée à deux personnes différentes** → la salutation est reprise du tour `t0`, qui appartient **au rôle de l'apprenant dans les sept sources** (vérifié : locuteur A, apprenant A partout). Elle est donc préparée en production, par la bonne personne, et il n'y a plus de « personne au café » orpheline.
2. **`preparedInStep` autoréférentiel** → remplacé par `introducedInStep` pour les reçues, avec `preparedInStep` réservé aux réponses. C'est exactement la distinction qui manquait.
3. **Chaque pilote n'exerçait que la moitié du contrat** → les sept scènes portent les trois formes : deux questions à réponse préparée et une clôture `replyRequired: false` avec `answerWith: []`.
4. **Progressions divergentes entre les deux pilotes** → les sept scènes suivent le même ordre, celui de votre méthode : comprendre, imiter, recevoir, répondre, échanger avec aide, puis sans modèle.

## 3. Deux corrections qu'il m'apporte

**L'unité du prix ne préparait pas la phrase voulue.** J'avais écrit que la demande de prix était « déjà préparée par l'unité `L1-*-10` ». C'était trop généreux, et son champ `relatedUnitDoesNotPrepareExactPhrase` le signale. Vérifié dans les sept couples :

| Unité | Modèle | Phrase voulue dans la scène |
|---|---|---|
| `L1-fr-en-10` | How much is {s}? | How much is it? — absente |
| `L1-fr-es-10` | ¿Cuánto cuesta {s}? | ¿Cuánto cuesta? — absente |
| `L1-fr-it-10` | Quanto costa {s}? | Quanto costa? — absente |
| `L1-fr-zh-10` | {s}多少钱？ | 多少钱？ — absente |
| `L1-fr-ja-10` | {s}はいくらですか。 | いくらですか。 — absente |
| `L1-fr-ko-10` | {s} 얼마예요? | 얼마예요? — absente |
| `L1-zh-fr-10` | Combien coûte {s} ? | Combien ça coûte ? — absente |

L'unité enseigne la forme avec complément ; la scène emploie la forme nue. En chinois, japonais et coréen la forme nue est une phrase complète à elle seule, donc le besoin était réel et non cosmétique. Il l'a préparée séparément dans les sept scènes, et c'est la bonne décision.

**La demande de prix ne répond pas à la question sur le lait.** Son `reviewQuestion` le dit explicitement. Après scission, l'apprenant demande le prix sans y être invité, ce qui est naturel dans une commande mais n'est plus une réponse à une question reçue. Le signaler plutôt que le masquer est juste.

## 4. Le point qui reste ouvert, et il n'est pas technique

Le lot est **éditorialement prêt et vérifié**. Mais il vit dans `docs/progression-complete/`, consultable par une maquette, et l'application publiée ne le contient pas. Les sept scènes ne sont donc pas, à cette heure, ce que verrait quelqu'un arrivant sur melunga.com.

Avec une publicité annoncée les 24–25 octobre, c'est la seule question qui compte vraiment ce week-end : **l'intégration aux leçons publiées est un lot distinct, qui n'existe pas encore.** Le constat n'est pas un reproche — la consigne était explicitement de ne rien fusionner ni publier — mais il faut le poser clairement, parce que l'écart entre « contenu prêt » et « produit à jour » ne se referme pas tout seul.

Deux options, et elles vous appartiennent :

- **Intégrer les sept scènes avant la publicité.** Cela demande un lot d'intégration, une revue croisée de ce lot, les contrôles ordinateur et mobile sur l'application réelle, et votre validation. C'est faisable sur deux jours parce que le contenu est prêt et qu'il ne touche ni les droits ni les prix, mais c'est un chantier de produit, pas d'édition.
- **Lancer la publicité sur l'état actuel** et intégrer ensuite. Dans ce cas la promesse de l'annonce doit décrire ce que l'application fait aujourd'hui, et non la scène préparée que je viens de vérifier.

Je n'ai pas d'avis sur le choix commercial. J'ai un avis sur une chose : ne pas annoncer l'échange préparé tant qu'il n'est pas dans le produit.

## 5. Ce qui reste nécessaire avant toute publication

- **La relecture native des sept scènes.** C'est le seul élément du lot qui dépende d'un tiers, et il n'est pas remplaçable : ni ses contrôles ni mes mesures ne disent si le refus détaché sonne juste. Les trois points qu'il inscrit dans `nativeReview` sont les bons — refus détaché, naturel et intonation de la scène, et pour le coréen l'emploi de 괜찮아요 en refus plutôt qu'au sens « ça va ». J'ajouterais le japonais 結構です, absent du catalogue et susceptible d'être entendu comme un refus ferme.
- **Le passage de « Bonjour » en `lv1`** est préparé et non appliqué, ce qui est sans effet sur les scènes : la salutation de zh→fr vient du tour du dialogue avec sa propre aide `蓬茹尔`. C'est une cohérence de catalogue, pas un blocage.

Le reste de l'audit est inchangé et hors week-end : L7 plus difficile que L8 dans les sept langues, la zone L2–L4 en dents de scie, le bloc L8 italien à 52–54 %, la question de méthode sur ce que « élément préparé » signifie, le registre de `L1-03` en ja et ko, et la décision phonétique chinoise à prendre règle par règle.
