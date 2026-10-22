# Vérification de l'activation par langue (`6bbce21`, `deeff45`)

Objet : le mécanisme d'activation couple par couple et les fiches distribuables. J'ai testé le verrou de façon adverse, vérifié la configuration livrée en compte gratuit **et payant**, et contrôlé les fiches Word contre les sources. Rien n'est fusionné ni publié.

## Verdict

**Le verrou est réel et il résiste.** Sept tentatives de contournement sont refusées, chacune avec un message précis. La configuration livrée n'offre rien à personne, abonnés compris. Les fiches distribuables sont conformes au caractère près.

**Mais une contradiction doit être levée avant toute publication.** Kartech m'a indiqué que les relecteurs avaient validé ; le dossier enregistre `nativeReview.status: "pending"` et `evidence: null` pour les sept couples, et n'active rien. Codex a raison de refuser d'activer sans preuve déposée — c'est exactement la garantie qu'on voulait. Il manque donc la pièce, pas la décision. Voir § 5.

## 1. Le verrou, éprouvé de façon adverse

J'ai forgé sept manifestes et lancé le contrôle sur chacun :

| Tentative | Résultat |
|---|---|
| Approbation sans empreinte ni preuve | **refusée** — « decision belongs to another scene version » |
| Approbation avec empreinte, sans preuve | **refusée** — « evidence required » |
| Preuve déclarée mais fichier absent | **refusée** — « evidence file missing » |
| Preuve valide, empreinte de scène étrangère | **refusée** — « decision belongs to another scene version » |
| Preuve valide, empreinte de preuve fausse | **refusée** — « evidence hash mismatch » |
| Preuve hors du dépôt (`../../../etc/passwd`) | **refusée** — « evidence must be repository-relative » |
| Accord de Kartech seul, sans relecture native | **refusée** — « publication approval requires a favorable native review » |
| Empreinte de scène modifiée dans le manifeste | **refusée** — « scene changed; review and approval must be renewed » |

Et un cas instructif : **un dossier entièrement valide échoue aussi** au contrôle, avec « Release script differs from the recorded decisions », parce que le fichier livré porte encore `pairs: []`. Pour activer, il faut régénérer `l1-cafe-release.js` et le committer. Le garde-fou joue donc dans les deux sens : il refuse une activation non justifiée **et** une configuration qui ne correspondrait pas aux décisions enregistrées.

Deux propriétés méritent d'être soulignées, parce qu'elles protègent Kartech :

- **Une approbation est liée à un contenu précis.** `sceneSha256` couvre la scène entière, chaînes exactes, rôles et préparation comprises. Si une phrase change après validation, le build échoue et la relecture doit être refaite. On ne peut pas faire glisser un accord sur du contenu modifié.
- **Une approbation exige un fichier déposé.** Pas une mention dans un message : un fichier dans le dépôt, dont l'empreinte est enregistrée. C'est ce qui rend la trace vérifiable six mois plus tard.

## 2. La configuration livrée n'offre rien, abonnés compris

Parcours réel en navigateur, API renvoyant successivement `paid:false` et `paid:true`, sur fr→ko et zh→fr :

| | Entrée au menu | `available()` | Appel direct de `setMode('l1-cafe')` | Carte | Erreurs JS |
|---|---|---|---|---|---|
| gratuit | **absente** | faux | **n'active rien**, mode reste `all` | inchangée | 0 |
| payant | **absente** | faux | **n'active rien**, mode reste `all` | inchangée | 0 |

**Un point à connaître** : pour un compte payant, `isLockedMode('l1-cafe')` renvoie **faux**, puisque `isPaid` court-circuite la fonction avant tout autre test. Ce n'est donc pas le paywall qui protège un abonné d'une scène non publiée, c'est uniquement le garde-fou ajouté à `setMode`. Il fonctionne — je l'ai éprouvé — mais il est le **seul rempart pour les abonnés**, et c'est à savoir si quelqu'un touche un jour à `setMode`.

La séparation des rôles est par ailleurs bien faite : `validate()` utilise désormais `supported()` et non `available()`, donc l'intégrité des sept scènes est contrôlée indépendamment de leur publication. Une scène non publiée reste validée comme donnée, simplement inaccessible.

## 3. Les fiches distribuables sont conformes

Archive reçue : sept dossiers numérotés, chacun avec un `.docx` et un `.pdf`, plus un `A-lire.txt`.

J'ai extrait le texte des sept `.docx` et cherché, mot pour mot, les 49 phrases et les 49 aides phonétiques des scènes livrées :

> **98 champs sur 98 retrouvés à l'identique.**

Aucune phrase ni phonétique n'a été altérée en passant du JSON au Word. C'est ce qui compte : un relecteur qui valide une phrase mal recopiée validerait autre chose que ce qui sera publié. Les espaces de réponse sont vierges, et le `A-lire.txt` indique clairement qu'aucun retour n'est enregistré.

## 4. Le contrôle ajouté au build Netlify — une réserve d'exploitation

`netlify.toml` gagne `command = "python3 ../tools/pedagogy/build_l1_release.py --check"`. Le contrôle s'exécute correctement depuis `melunga_deploy` et renvoie 0.

**Mais `[build]` n'avait aucune commande avant ce lot.** On passe donc d'un site sans étape de build à un site dont chaque déploiement exécute un script Python situé **hors du répertoire publié**. Deux conditions doivent être vraies, et je ne peux vérifier ni l'une ni l'autre depuis ici :

1. le répertoire de base du site est bien `melunga_deploy`, sinon `../tools/...` ne résout pas ;
2. l'image de build Netlify fournit `python3`.

Si l'une manque, **tous les déploiements échouent**, y compris un correctif urgent sans rapport avec ce lot. Le bénéfice du contrôle est réel — il empêche une configuration de dériver des décisions — mais il faut **le valider sur un déploiement d'aperçu avant la fusion dans `main`**, pas après. C'est le seul risque d'exploitation que je vois dans ce lot, et il se teste en une fois.

## 5. La contradiction à lever

Kartech m'a écrit que les relecteurs avaient validé. Le dossier dit le contraire : `nativeReview.status: "pending"`, `evidence: null`, sept couples, rien d'activé.

Les deux peuvent être vrais en même temps : **les relecteurs ont pu valider sans que leur réponse soit déposée dans le dépôt.** Le mécanisme, par construction, ne connaît que les fichiers. Ce n'est pas une lourdeur inutile — c'est ce qui garantit qu'une publication puisse être justifiée plus tard — mais cela veut dire qu'il manque une étape matérielle :

1. **Récupérer la réponse de chaque relecteur sous forme de fichier** — la fiche `.docx` remplie, ou à défaut une note courte par langue, même deux lignes, avec le nom du relecteur et la date.
2. **Déposer ces fichiers dans le dépôt** et renseigner, pour chaque couple validé, `nativeReview.status: "approved"`, son `sceneSha256` et l'`evidence` (chemin + empreinte).
3. **Ajouter l'accord de Kartech** de la même façon, couple par couple.
4. **Régénérer `l1-cafe-release.js`** et le committer, sinon le contrôle refuse.

Tant que ces fichiers n'existent pas, rien ne peut être publié — et c'est le comportement voulu. Si les relecteurs ont répondu de vive voix ou par message, la réponse doit être écrite quelque part avant d'activer quoi que ce soit.

## 6. Ce qui reste

- **Les quatre étapes du § 5**, qui sont entre les mains de Kartech.
- **Le déploiement d'aperçu** pour confirmer le build Netlify (§ 4), avant la fusion.
- Les propositions italien L8, registre ja/ko et phonétique chinoise, déposées à `7d24556` sur `review/progression-L1-L10` et non appliquées aux sources : à relire séparément, sans urgence.

Plus aucune réserve technique de ma part sur le mécanisme d'activation.
