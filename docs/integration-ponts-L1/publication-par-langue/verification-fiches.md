# Vérification des fiches de relecture native

**Les copies sont conformes. La relecture native reste en attente dans les sept couples.** Ce contrôle ne remplit aucune fiche et ne valide aucune langue pour publication.

## Références et méthode

- Fiches : `0f0a5a9f0a3ab26eb88049e8da58406210026720`, dossier `docs/revue-pedagogique/relecture-native/` : **sept questionnaires et un README**, et non huit fiches natives.
- Contenu d’exécution : `939b82e561521ab12218bc5e7f3577961410a26e`, `melunga_deploy/content/l1-cafe.json`. Le fichier de travail lui est identique ; SHA256 : `bf22f9592adf23219d1e25f491b8cedef8bc086148e12331830b0b6404e5180c`.
- Les huit copies de `fiches/` et les huit pièces jointes téléchargées sous `/workspace/attachments` sont identiques, octet par octet, aux huit fichiers de `0f0a5a9`. Le JSON associé consigne leurs chemins et empreintes.
- Chaque ligne de tableau a été comparée dans l’ordre à sa phrase source : texte étudié, aide phonétique et étiquette apprenant/serveur. Aucune normalisation de casse, ponctuation, espacement ou accents n’a été appliquée aux valeurs comparées.

## Résultats

| Couple | Phrases étudiées exactes | Aides exactes | Étiquettes de rôle conformes | Lectures source absentes du questionnaire | Questions sans réponse |
|---|---:|---:|---:|---:|---:|
| fr→en | 7 | 7 | 7 | 0 | 8 |
| fr→es | 7 | 7 | 7 | 0 | 8 |
| fr→it | 7 | 7 | 7 | 0 | 8 |
| fr→zh | 7 | 7 | 7 | 7 | 9 |
| fr→ja | 7 | 7 | 7 | 7 | 9 |
| fr→ko | 7 | 7 | 7 | 7 | 9 |
| zh→fr | 7 | 7 | 7 | 0 | 7 |
| **Total** | **49** | **49** | **49** | **21** | **58** |

Les quatre répliques de l’apprenant et les trois du serveur sont reproduites dans leur ordre source. Le refus reste séparé de la demande de prix. Les **58 emplacements de réponse sont vierges** : aucun retour natif favorable, identité de relecteur ou date de validation n’est acquis par ces documents.

Pour **zh→fr**, les phrases étudiées sont françaises et les sept aides sont bien les approximations en caractères chinois destinées aux sinophones, par exemple `安 卡菲，西尔 武 普莱`. Elles sont identiques au champ `phon` source ; elles ne sont pas des guides pour lecteurs francophones. La fiche est rédigée en français pour faire relire le naturel du français par un francophone. Elle ne contient pas de question sur l’adéquation de ces aides : cette vérification demande une compétence adaptée aux deux langues.

## Générateur retrouvé et reproduction

Le générateur n’est pas dans `relecture-native/`. Il existe au même commit à `docs/revue-pedagogique/mesures/genere_fiches_relecture.py`. Exécuté avec le contenu de `939b82e` et un dossier de sortie temporaire, il reproduit **les sept questionnaires à l’octet près**. Il ne génère pas le README, qui est une pièce manuelle. Aucun questionnaire de travail n’a été remplacé.

Il reprend `phrases.study` et `phrases.phon`, choisit les étiquettes par `phrases.kind`, puis injecte les répliques dans les questions. Il ne rend ni `native` ni `reading`, ni les identifiants, les noms de rôle source et le déroulé pédagogique. Il suppose les quatre répliques de l’apprenant et les trois reçues dans leur ordre attendu ; sa seule exécution n’est donc pas un contrôle général du contrat de contenu.

## Ce que les questionnaires courts ne couvrent pas

**49 traductions `native` et 21 lectures `reading` ne figurent pas dans ces tableaux.** Les lectures concernent fr→zh, fr→ja et fr→ko. Le code d’affichage de `939b82e` utilise bien `phrase.reading` lorsqu’elle existe et que le modèle n’est pas masqué : ce sont des aides affichables dans la leçon, distinctes de la colonne phonétique des questionnaires.

Le dossier complémentaire existant `docs/integration-ponts-L1/relecture-native-a-remplir.md` reproduit les **168 champs textuels** des 49 phrases (`study`, `native`, `phon`, et `reading` lorsqu’elle existe), vérifiés ici avec **zéro écart**. Il permet de conserver les lectures et le sens du lecteur dans le périmètre de relecture, sans modifier les fiches courtes.

Les six fiches destinées aux apprenants francophones proposent une question phonétique facultative, limitée à la commande du café ; la présence des sept aides dans leur tableau ne constitue pas une validation native de chacune. La voix de synthèse, les intonations jouées, la progression pédagogique complète, l’exécution dans l’interface et L2–L10 ne sont pas validés par cette comparaison.

## Portée des futurs retours

La question 4 donne la priorité au refus détaché. **Une réponse favorable à cette seule question ne suffit pas à ignorer une anomalie signalée ailleurs** : salutation, commande, registre, réplique du serveur ou enchaînement doivent aussi rester plausibles dans la scène. Un doute matériel doit être résolu ou explicitement examiné avant de conclure pour le couple concerné. L’écoute ou le jeu de l’échange reste nécessaire pour le naturel oral et l’intonation ; l’exactitude des copies ne les prouve pas.

Aucune réponse, validation, source, fiche ou donnée d’exécution n’a été modifiée. Seuls ce compte rendu et son relevé JSON sont produits par cette vérification. Aucune fusion ni publication n’en résulte.
