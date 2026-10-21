# Réponse à la relecture 113b247 — même progression et deux cycles complets

Revue de Claude lue dans les fichiers réels ; la pièce jointe de Kartech correspond au document du commit `113b247`. Le présent lot ne modifie que le dossier de revue. **Catalogue, 110 JSON, générateurs de contenu, chargeur, droits et prix restent inchangés.** Aucune fusion ou mise en production.

## Ordre retenu et réalisé dans les deux essais

Le premier échange chinois venait trop tôt. Il est retiré de sa place initiale : l'échange est maintenant l'aboutissement du remplacement, comme demandé par Kartech.

Les deux pilotes suivent huit passages dans le même ordre :

| Passage | Chinois | Coréen |
|---|---|---|
| Comprendre | Une envie de repos | Une demande de café |
| Imiter | La même phrase entière | La même demande entière |
| Préparer le remplacement | Rentrer, dans une phrase entière ; appui 回家 | L'eau, dans une demande entière ; appui 물 |
| Remplacer | Comparer repos / retour | Comparer café / eau |
| Comprendre la question reçue | « Tu as décidé ? », en situation de choix après la promenade | Le tour entier du serveur « Bonjour. Vous désirez ? » |
| Comprendre la clôture reçue | 好的 | 네. comme confirmation de commande |
| Écouter le cycle visible | Question → réponse préparée → clôture | Question → réponse préparée → clôture |
| Choisir et réutiliser | Choix personnel, modèle visible ou masqué volontairement | Même geste pour la boisson |

Ce nombre n'est pas un quota universel. Le contrôle porte sur l'ordre et sur la présence du cycle ; il ne démontre pas qu'une personne a compris. Les deux étiquettes sont désormais de même nature : **« Essai de progression · niveau à positionner »**. Les anciens `lv` restent dans la provenance, sans renumérotation ni changement d'accès. Le repos est L2 historique, le retour et la question chinois L3 : la future insertion exige des prérequis précis, pas l'effacement de ces écarts.

## Les deux échanges complets

**Chinois, recomposition explicite après une promenade :**

1. Un proche : **你想好了吗？** — Tu as décidé ? (`DECKS.zh[511]`).
2. Toi : **我想回家** ou **我想休息** — rentrer ou se reposer (`[416]` / `[226]`).
3. Un proche : **好的** — d'accord (`[2173]`).

La question source est présentée entière en compréhension. Il n'est demandé ni d'analyser 想好/了/吗, ni de produire cette question. Son naturel et son accessibilité dans ce contexte restent à essayer. Le plan suggéré « 我想回家 → question → 好的 » aurait laissé la question sans réponse : le pilote place bien la question **avant** la réponse personnelle. Aucune question absente du catalogue n'est inventée.

**Coréen, recomposition de la petite scène :**

1. Serveur : **안녕하세요. 뭐 드릴까요?** — Bonjour. Vous désirez ? (`L1-fr-ko-d1.turns[1]`).
2. Client : **커피 주세요.** ou **물 주세요.** (`L1-fr-ko-03.variants[0/1]`).
3. Serveur : **네.** — Oui. (`DECKS.ko[1]`), accusé de réception dans cette scène.

La salutation isolée et « Une personne au café » sont supprimées. Il n'y a qu'un serveur, dont le tour entier est d'abord découvert puis rejoué dans l'échange. Cette option corrige le défaut sans extraire puis faire passer **뭐 드릴까요?** pour un ancien tour complet. La clôture 네. est contextualisée, pas enseignée comme réponse universelle. Saluer en production restera à préparer dans l'extension ; lait, refus, montant et 하나 restent hors de l'entrée. Relecture native du serveur et écoute réelle encore nécessaires.

## `received` : introduction nommée et réponses du catalogue permises

Les annexes passent à une **version d'essai 2**, sans changement de `loadLevel` :

- **`introducedInStep`** remplace le nom ambigu `preparedInStep` sur les reçus. Il identifie leur première présentation entière, strictement avant la scène. Ce n'est pas une préparation partielle ni un acquis.
- **`preparedInStep` reste sur les réponses** : il désigne le passage contenant la réponse entière avant la scène, selon le plan éditorial.
- **`answerWith` référence une `utteranceId` enregistrée**, son texte attendu et le passage de préparation. Le registre source permet une variante conversation **ou une carte catalogue**. Sans cette extension, l'ancienne référence `unitId/variantIndex` n'aurait pas pu nommer les réponses chinoises sans fausse unité.
- Les quatre reçus distinguent désormais deux questions avec réponse et deux clôtures `replyRequired:false`, `answerWith:[]`. Chaque scène montre tout le cycle.

La suppression du salut isolé rend inutile, dans ces deux pilotes, une relation de préparation partielle. Elle n'est pas dissimulée derrière un changement arbitraire de référence. Si une future scène a besoin d'une telle relation, la spécifier séparément plutôt que déclarer qu'un bloc connu prouve la compréhension du tour entier.

Les choix, les aides et l'ordre sont contrôlés. Les questions répétées sans réponse et les changements derrière un identifiant identique restent rejetés. Le reçu ne compte pas comme acquis productif et sa difficulté ne disparaît pas des audits de réception. Aucun suivi de maîtrise ou verrou ajouté.

## Trois propositions locales visibles, aucune correction canonique glissée

Le prototype affiche maintenant des propositions identifiées par une note. [Le manifeste](pilotes-progression/editorial-amendments.json) garde le champ source, la valeur proposée et la raison ; [les références](pilotes-progression/sources.json) conservent séparément `original` et `expected` (affichage).

| Champ | Source conservée | Proposition affichée uniquement dans l'essai |
|---|---|---|
| Phonétique de 我想休息 | `ouo chyang chyo chi` | `ouo chyang chyoou chi` |
| Français de 커피 주세요. | Je veux un café. | Un café, s’il vous plaît. |
| Français de 물 주세요. | Je veux de l'eau. | De l’eau, s’il vous plaît. |

`chyoou` reprend la variante plus explicite relevée dans le catalogue, sans certifier le son par une transcription. L'audio continue de lire **我想休息**, jamais la phonétique. La note demeure une proposition à écouter et relire ; ni la carte `[226]`, ni une autre entrée n'a été modifiée.

Les deux traductions coréennes rendent la fonction de demande polie dès la première imitation. Leur présence dans un essai local ne vaut pas décision d'amender les JSON. L'original reste vérifiable et l'interface porte **« Traduction proposée pour cet essai »**. Il n'est pas annoncé que 주세요 devient plus poli en L2 : le complément de quantité est une autre difficulté.

## Deux décisions canoniques restent à Kartech

**Registre ja/ko L1-03.** La proposition ciblée est prête dans [proposition-registre-L1-03.json](pilotes-progression/proposition-registre-L1-03.json) : **10 champs français**, soit `model.native` et quatre `variants[].native` dans chacun de `L1-fr-ja-03` et `L1-fr-ko-03`. Préserver `slot.native`, les phrases étudiées, phonétiques, lectures, identifiants et niveaux. Les générateurs et sorties dérivées devront être corrigés ensemble après décision, avec comparaison des diffs. Ce n'est pas une réécriture des 110 fichiers ; `L1-en-ja-03` est déjà traduit avec *please*.

**Convention chinoise.** Les mesures de Claude sont reproductibles avec le bon périmètre. Le [script de mesure](pilotes-progression/measure_notations.py) et [son résultat](pilotes-progression/mesure-notations-zh.json) lisent les sources sans les modifier :

| Notation | Cartes `DECKS.zh.phf` contenant le jeton | Champs `phon` fr→zh, hors `slot` |
|---|---:|---:|
| chyang | 170 | 0 |
| siang | 1 | 24 |
| tchu | 155 | 0 |
| tchü | 0 | 77 |
| si-houan | 0 | 31 |

Il s'agit de **champs de notation**, pas du nombre d'occurrences d'un même mot chinois : par exemple les 170 cartes contiennent 184 occurrences du jeton `chyang`, les 77 champs 78 occurrences de `tchü`. Les gabarits sont inclus, les sous-champs `slot` exclus du total principal, et les jetons ne sont pas alignés automatiquement aux caractères. Inclure les `slot` produirait 27/97/34, d'où la nécessité de documenter la mesure.

Les deux séries `siang`/`si-houan` touchent **55 champs distincts** dans les dix fichiers fr→zh. C'est un inventaire de candidats à relire, pas une autorisation de remplacer toutes les lettres `s` ou tous les sons x-. Les autres lecteurs exigent leur propre analyse. Aucune harmonisation n'a été exécutée. L'aide écrite reste une approximation à compléter par l'oreille.

La nuance envie / intention arrêtée ou nécessité pourra expliquer plus tard certains exemples de 想/要. Elle reste une note de réserve, sans devenir une règle absolue déduite des traductions françaises ni une troisième construction imposée maintenant.

## Vérification et prochaine revue

**33 tests** du contrat, de la progression et des propositions locales passent. Les deux versions de la maquette (fichiers séparés et HTML autonome) passent sur 320×568, 390×844 et 1440×900 : 16 passages, 10 références, quatre scènes complètes en comptant visible/rappel. Masquage du seul rôle apprenant, notes proposées retirées au rappel, oreilles et audio du texte exact vérifiés. Audio simulé : qualité des voix et efficacité pédagogique non évaluées. Aucun essai APK.

Les [captures](pilotes-progression/captures/) montrent notamment `zh-echange-complet.png` et `ko-echange-complet.png`. Claude peut relire ce cycle et les annexes avant toute déclinaison. Les décisions de Kartech sur les sources et sur l'entrée restent ouvertes ; aucune réduction du gratuit, activation de couple ou migration de parcours ne découle de ce lot.
