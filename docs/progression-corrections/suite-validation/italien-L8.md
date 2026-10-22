# Italien L8 : deux ponts entiers possibles, six réserves à distinguer

Audit de `cb3e22d442a62421f3449518df93559569f29709`, sans intégration. Les **six unités portant une réserve sur les dix du L8 proposé** ne sont pas six trous de vocabulaire de même nature : cinq mêlent lexique et construction, parfois registre ; la sixième concerne surtout la compréhension d'une réponse reçue. Deux phrases entières existantes peuvent préparer directement deux variantes. Elles ne suffisent pas à déclarer l'italien L8 réparé.

Les copies vérifiables, leurs limites et les empreintes des fichiers figurent dans [italien-L8-candidats.json](italien-L8-candidats.json). Aucun niveau, ordre, lien, énoncé, aide, droit d'accès ou fichier d'exécution n'est modifié par ce dossier.

## Corpus et portée

- Parcours candidat : `docs/progression-corrections/parcours-corriges.json`, SHA-256 `311f20f83fe5e47219948b794e2d0477cb0935fea1e81c0015393dc921fbb78d`.
- Sources conversation : les dix fichiers canoniques `L1-fr-it.json` à `L10-fr-it.json`, instantané `bcd108dff5c5931f935f70f694a040d235403b64`. Les niveaux proposés sont distincts des niveaux source.
- Catalogue : **4 509 cartes** de `DECKS.it` dans `melunga_deploy/app.html`, SHA-256 `945a8befad41fd70c7dbbd29ea91d863451a15e750456aee4de73df3fcaf11bb` ; index à base zéro.
- Pour un francophone, les champs sont **`t` → texte étudié, `frm` → sens français, `pf` → aide phonétique**. `py` n'est pas l'aide francophone.
- La note [italien.md du suivi précédent](../suivi-relecture/italien.md) est historique et porte sa correction de méthode. La part d'inédit a amélioré son diagnostic ; la faible inversion résiduelle de longueur ne justifie pas un nouveau reclassement.

Les **72 champs** `study/native/phon` des 24 variantes concernées ont été comparés aux sources : **0 écart**. Les quatre candidats catalogue sont recopiés sur `t/frm/pf/lv`, et leurs quatre cibles sont comparées aux variantes canoniques. Ce sont des contrôles de copie, pas une validation pédagogique ou native.

## Les six réserves réelles

| Ordre L8 proposé | Unité source | Nature de la réserve | Ce qu'un lien ne prépare pas |
| ---: | --- | --- | --- |
| 1 | `L8-fr-it-07` | Lexique dominant et limites du groupe nominal | `fattura/copia` gardent `una` dans le premier choix ; ni `uno sconto`, ni `un prezzo migliore` n'en découlent. |
| 2 | `L8-fr-it-01` | Lexique, groupe verbal/clitique, atténuation à Lei | `sconto`, `richiamarmi domani`, `controllare la prenotazione` ; le passage à `Potrebbe` n'apprend pas ces contenus. |
| 3 | `L8-fr-it-04` | Construction et compléments lexicaux | `Sarebbe possibile` et les compléments `camera più grande`, `cambiare il volo`, `spostare l'appuntamento`. |
| 4 | `L8-fr-it-08` | Conditionnel et compléments de besoin | `più tempo`, `qualche giorno in più`, `una risposta entro domani`, `un altro appuntamento` ne sont pas fournis par le seul `Ho bisogno di`. |
| 5 | `L8-fr-it-12` | Lexique, pronom formel et type de complément | `chiederle`, `ferie`, `aumento` ; surtout `chiederle + nom` face à `chiederle di + infinitif`. |
| 10 | `L8-fr-it-10` | Réception, pragmatique et registre | Une réponse négative à `Le dispiace se…?` peut autoriser l'action. Il manque la scène reçue reliée et relue, pas seulement un mot. |

Les dix unités sont présentes : les quatre autres (`L8-fr-it-09`, `L9-fr-it-12`, `L8-fr-it-03`, `L8-fr-it-05`) n'ont pas de réserve déclarée dans ce fichier. L'absence de réserve n'est pas une preuve d'acquisition de leurs variantes.

### Antécédents à conserver sans les surinterpréter

`L1-fr-it-04` présente déjà **« Ho bisogno di aiuto. »**, puis taxi, medico et wifi. Il prépare une occurrence du cadre au présent, pas **« Avrei bisogno di più tempo. »** ni son complément exact.

`L8-fr-it-02`, proposé en L6, présente **« Potrei pagare con la carta? »** et trois autres permissions. Il donne une fonction voisine ; il ne fournit ni `Potrebbe`, ni `Sarebbe`, ni `Le dispiace se` par analogie.

`L7-fr-it-01/v2`, proposé en L7, contient **« Non vengo perché ho un appuntamento. »**. Le nom du rendez-vous est donc déjà disponible dans une phrase antérieure prévue ; cela ne prépare pas `un altro appuntamento` ou `spostare l'appuntamento` comme groupes entiers.

`L8-fr-it-06/v1`, proposé en L6, contient **« Mi dispiace, La richiamerò domani. »**. Le rappel est déjà dans le répertoire source, mais au futur avec un autre pronom. Ne pas déduire automatiquement `richiamarmi` de cette phrase.

Les liens déjà ajoutés pour `sconto` (`07` → `03`), l'échéance `entro` (`08` → `05`) et la fonction de permission restent des occasions antérieures **prévues**, pas une mesure de ce que la personne sait.

## Deux soutiens directs, copiés en entier

### 1. Un besoin entier au présent avant la demande atténuée

Source **`DECKS.it[735]`**, niveau source **4** :

| Champ | Copie exacte |
| --- | --- |
| `t` | Ho bisogno di più tempo. |
| `frm` | J'ai besoin de plus de temps. |
| `pf` | `o bi-zo-gno di piou tèm-po` |

Cible **`L8-fr-it-08/v0`**, source et proposition L8 :

- Texte : **« Avrei bisogno di più tempo. »**
- Sens : **« J'aurais besoin de plus de temps. »**
- Aide : `a-VRÈ-i bi-ZO-gno di piou TÈM-po`.

La proposition conserve `bisogno di più tempo`. Présenter puis imiter le support entier avant de présenter puis imiter la cible entière permet d'isoler le nouvel emploi de `Avrei` sans fabriquer un modèle ou une aide. Ce n'est pas un exercice où l'on infère automatiquement le conditionnel.

**Reste ouvert :** les trois autres compléments de l'unité, notamment la réponse attendue avant demain et un autre rendez-vous. Ce soutien ne les prépare pas.

### 2. Une demande de rappel formelle avant son atténuation

Source **`DECKS.it[2099]`**, niveau source **8** :

| Champ | Copie exacte |
| --- | --- |
| `t` | Può richiamarmi domani? |
| `frm` | Pouvez-vous me rappeler demain ? |
| `pf` | `pouo ri-quia-mar-mi do-ma-ni` |

Cible **`L8-fr-it-01/v2`**, source et proposition L8 :

- Texte : **« Potrebbe richiamarmi domani, per favore? »**
- Sens : **« Pourriez-vous me rappeler demain, s'il vous plaît ? »**
- Aide : `po-TRÈB-bé ri-kia-MAR-mi do-MA-ni, pér fa-VO-ré`.

L'action complète `richiamarmi domani` est conservée. `Può` est déjà une demande à Lei ; on n'enseigne aucune frontière universelle poli/impoli. La cible entière introduit sa formulation atténuée. Le niveau source 8 du soutien est déclaré : son existence au catalogue ne signifie pas qu'il aurait été rencontré en L7.

**Reste ouvert :** `Potrebbe`, la formulation complète et les autres variantes, dont `controllare la prenotazione`. L'aide `ri-quia-mar-mi` du catalogue et `ri-kia-MAR-mi` de la conversation restent littérales. Aucune n'est corrigée ou dérivée de l'autre.

## Deux candidats entiers à portée lexicale seulement

Ces phrases sont exploitables, mais leur force est moindre : une proposition commune ne relie pas le support et la cible.

| Source | `t` exact | `frm` exact | `pf` exact | Cible et limite |
| --- | --- | --- | --- | --- |
| `DECKS.it[775]`, lv4 | C'è uno sconto? | Est-ce qu'il y a une réduction ? | `tchè ou-no sconn-to` | Avant `L8-fr-it-07/v0`. Prépare `uno sconto`, pas l'action d'accorder la remise. Question d'existence et demande de geste commercial diffèrent. |
| `DECKS.it[726]`, lv4 | Ho una prenotazione. | J'ai une réservation. | `o ou-na pré-no-ta-tsio-né` | Avant `L8-fr-it-01/v3`. Prépare le nom `prenotazione`, pas `controllare` ni le changement `una` → `la`. |

Les retenir ultérieurement demanderait une raison de placement et une trace locale. Un mot commun n'établit pas que la phrase cible entière est préparée. Ils restent candidats optionnels dans ce dossier.

## Ce que le catalogue ne permet pas de combler simplement

La recherche bornée aux **4 509 champs `t`** ne trouve aucune occurrence exacte de `chiederle`, `prezzo migliore` et `giorno in più`, ni des mots complets `ferie` ou `aumento`. Ce n'est pas une affirmation d'absence dans toute la langue ou tout autre corpus. Des composants comme `migliore`, `chiederti` ou `qualche giorno` peuvent exister sans couvrir l'emploi cible.

- **`copia` :** `DECKS.it[3530]` donne seulement `una copia`. L'autre carte est **« Inviatemi una copia della polizza di carico. »** (`2411`, lv10). L'impératif et le document maritime introduisent une charge disproportionnée pour ce pont. Ne pas construire une nouvelle phrase autour du groupe nominal et en fabriquer l'aide.
- **`fattura` :** **« Ho pagato la fattura. »** (`2120`, lv8) est entière, mais ajoute le passé, une autre action et un autre article. C'est un contexte possible, pas une préparation exacte de la demande.
- **`appuntamento` :** **« Vorrei prendere un appuntamento. »** (`1616`, lv6) est entière ; elle n'apprend ni `altro` ni `spostare`. **« Possiamo spostare? »** (`1288`, lv5) dépend d'un objet de contexte.
- **`entro` :** **« Le invio il preventivo entro venerdì. »** (`3276`, lv3) fournit une échéance, mais ajoute le devis et son envoi. Elle ne prépare pas `una risposta entro domani` en bloc.
- **Réponse à `Le dispiace se` :** le catalogue possède l'échange **« — Ti dispiace se apro? — Per niente, fai pure. »** (`2517`, lv10). Il combine deux rôles dans une seule carte, au tutoiement. Il peut documenter le problème ; il n'est pas une scène reçue à Lei déjà prête. Ne pas lui attribuer de faux tours source ni découper son aide sans contrat vérifiable.

`L8-fr-it-12` demande donc encore une préparation de phrases complètes dans le registre visé. Pour `L8-fr-it-10`, il faut trouver une scène appropriée ou en rédiger et faire relire une avec ses aides ; changer seulement les prérequis ne résout pas la polarité reçue.

## Prochain lot recommandé

Un lot court peut se limiter aux **deux soutiens directs `735` et `2099`** : deux occurrences de compréhension et deux d'imitation, avant leurs cibles exactes, sans modifier le niveau ou l'ordre des unités ni les choix de substitution. Les textes, sens et aides de chaque support et de chaque cible resteraient entiers, avec leur provenance séparée. C'est une proposition ; aucune étape n'est ajoutée à l'exécution ici.

La méthode reprend le principe utile du lot espagnol : **une proposition entière avant sa reprise enrichie**, puis une vérification de ce que le parcours a réellement présenté avant la cible. Elle ne reprend pas un gain chiffré espagnol non revérifié et n'assimile pas le recouvrement lexical à l'acquisition. Toute nouvelle trace devra publier sa tokenisation, son ordre et son périmètre ; elle devra distinguer les formes réemployées des constructions nouvelles.

**Aucune amélioration du taux historique de 52–54 % n'est revendiquée ni recalculée.** Ce taux décrit un périmètre de corpus ; deux présentations locales ne le modifient pas mécaniquement. Les 55 % de briques non préparées des dialogues italiens sont encore un autre périmètre, inchangé.

Le lot proposé laisserait donc des réserves dans les six unités, y compris les compléments non couverts de `01` et `08`. Il apporterait deux préparations concrètes supplémentaires, pas une validation globale de L8. La réception formelle, le naturel des demandes et les réponses restent à relire avec un locuteur natif. Rien à fusionner ni publier.
