# Vérification du changement de politique et du contrôle Node (`a1d20dc`, `501e0d6`)

Objet : l'activation des sept scènes sur la seule instruction de Kartech, et le remplacement du contrôle Python par un contrôle Node. J'ai vérifié le code, comparé les deux implémentations, et surtout **interrogé l'aperçu réellement déployé**, ce que l'environnement de Codex ne lui permet pas. Rien n'est fusionné ni mis en production.

## Verdict

**Le changement est correctement borné, et le contrôle Node est un portage fidèle.** La garantie qui comptait vraiment est conservée.

**Et l'aperçu déployé fonctionne** : le build Netlify a réussi, le site sert bien les sept couples activés, et le contenu est intact. Cela lève la réserve d'exploitation que j'avais émise sur le build.

Un défaut subsiste, documentaire mais gênant, et il se corrige sans rien invalider : **le fichier livré se déclare toujours non approuvé pour la production**. Voir § 4.

## 1. Ce que la politique retire, et ce qu'elle garde

| | Avant | Après |
|---|---|---|
| Fichier de preuve nominatif | **exigé**, avec empreinte vérifiée | supprimé |
| Relecture native favorable obligatoire | **exigée** avant tout accord | `nativeReview` devient informatif |
| Empreinte de scène liée à la décision | exigée | **conservée** |
| Instruction liée à un contenu précis | exigée | **conservée** |
| Auteur et méthode de la décision | implicites | **explicités** — `method: direct-instruction`, `actor: Kartech` |
| Configuration conforme aux décisions | exigée | **conservée** |
| Garde-fou `setMode` pour les abonnés | présent | **conservé** |

**Ce qui est perdu est la traçabilité de la relecture ; ce qui est gardé est la protection contre l'accident.** Une instruction d'activation ne peut toujours pas glisser sur un contenu modifié : si une phrase change, l'empreinte ne correspond plus et le build échoue avec « scene changed; update its snapshot and owner instruction ».

C'était le bon arbitrage si l'un des deux devait sauter. Je continue de penser que la preuve nominative valait mieux — si une formulation est un jour contestée, le dossier dira « Kartech l'a demandé » et non « tel locuteur a validé telle phrase à telle date ». Mais la décision a été prise explicitement, elle est inscrite dans le manifeste sous un nom qui la décrit sans l'enjoliver (`owner-instruction-only`), et c'est la bonne façon de se passer d'une garantie : en le disant, pas en le laissant déraper.

## 2. Le contrôle Node est un portage fidèle

Le risque d'un portage de ce genre est que les deux implémentations ne calculent pas la même empreinte — JSON canonique, tri des clés, échappement Unicode. J'ai comparé les trois sources pour les sept scènes :

| Couple | Python | Node | Manifeste |
|---|---|---|---|
| fr-en · fr-es · fr-it · fr-zh · fr-ja · fr-ko · zh-fr | **identiques aux trois** | | |

Sept sur sept, Python et Node donnent exactement la même empreinte, et toutes deux correspondent à celle enregistrée. Les deux outils renvoient la même liste de sept couples activés et le même code de sortie. Le `canonical()` de Node — tri des clés, `JSON.stringify` — reproduit bien `json.dumps(sort_keys=True, separators=(",",":"), ensure_ascii=False)`.

Le choix de Node lève par ailleurs ma réserve précédente : plus de dépendance à Python dans l'image de build, et le script résout ses chemins depuis sa propre position (`path.resolve(__dirname, '..')`) au lieu de dépendre du répertoire de travail.

## 3. L'aperçu déployé, interrogé directement

Codex indique que son environnement bloque les domaines Netlify. Le mien laisse passer les requêtes de fichiers, j'ai donc vérifié l'artefact réellement servi.

**La configuration servie** par `deploy-preview-9` :

```
window.MelungaL1CafeRelease=Object.freeze({"version":1,"pairs":["fr-en","fr-es","fr-it","fr-zh","fr-ja","fr-ko","zh-fr"]});
```

Les sept couples sont activés sur le site déployé. **Le build Netlify a donc bien tourné avec le contrôle Node et produit le bon fichier** — c'est la vérification que je réclamais avant toute fusion, et elle est faite.

**Le contenu servi**, scène coréenne, repris verbatim depuis le site :

| | Phrase | Phonétique | Lecture |
|---|---|---|---|
| apprenant | 안녕하세요! | `an-nyeong-ha-sé-yo` | `annyeonghaseyo!` |
| serveur | 안녕하세요. 뭐 드릴까요? | `an-nyeong-ha-sé-yo. mwo deu-ril-kka-yo` | `annyeonghaseyo. mwo deurilkkayo?` |
| apprenant | 커피 하나 주세요. | `keo-pi ha-na djou-sé-yo` | `keopi hana juseyo.` |
| serveur | 우유 넣을까요? | `ou-you neo-eul-kka-yo` | `uyu neoeulkkayo?` |
| apprenant | 아니요, 괜찮아요. | `a-ni-yo, kouèn-tchan-a-yo.` | `aniyo, gwaenchanayo.` |
| apprenant | 얼마예요? | `eol-ma-yé-yo` | `eolmayeyo?` |
| serveur | 삼천 원이에요. | `sam-tcheon ouon-i-é-yo` | `samcheon won-ieyo.` |

Identique au caractère près à ce que j'avais vérifié contre les sources. Rien n'a été altéré en chemin.

## 4. Le défaut qui subsiste — et il est gratuit à corriger

Le fichier **servi par l'aperçu** porte toujours :

```
"nativeReviewPending": true
"status": "integration-review-not-production-approved"
```

Les sept scènes sont activées et accessibles, mais la donnée livrée se déclare en attente de relecture et non approuvée pour la production. Ces deux champs sont inertes à l'exécution — `validate()` ne les lit pas, je l'ai vérifié — donc rien ne casse. Mais si cela part sur melunga.com, le produit servira une donnée qui se contredit elle-même, et c'est exactement ce qui égare la relecture suivante.

**La correction ne coûte rien, et je l'ai vérifiée :**

| | |
|---|---|
| Corriger les deux champs change-t-il une empreinte de scène ? | **non — les sept restent identiques** |
| Faut-il renouveler les instructions d'activation ? | **non** |
| Faut-il régénérer `l1-cafe-release.js` ? | non, la liste est inchangée |

L'empreinte ne couvre que les objets de scène, pas l'en-tête du fichier. Les deux drapeaux peuvent donc être mis à jour librement.

**Un seul piège** : `l1-cafe.js` code en dur `sourceCommit = '30e7d40a8af3f51ee186bf83f983596b8ca8798f'` et `validate()` rejette le lot si le contenu ne porte pas exactement cette valeur. Les deux coïncident aujourd'hui. **Ne pas y toucher** en corrigeant les drapeaux, ou changer les deux fichiers ensemble.

## 5. Le trou qui reste, et qui ne peut être comblé ni par Codex ni par moi

Codex ne peut pas atteindre les domaines Netlify ; j'ai pu récupérer les fichiers servis, mais mon proxy refuse le trafic de navigateur vers l'extérieur. **Les 27 scénarios et les 448 étapes sont donc passés en local, sur une copie, et personne n'a parcouru une scène dans un navigateur sur le site déployé.**

Ce n'est pas inquiétant — les artefacts servis sont vérifiés et identiques à ceux testés en local — mais c'est un trou réel qu'il faut nommer plutôt que de le combler par une supposition. **Il se referme en deux minutes** : Kartech ouvre le lien d'aperçu sur son téléphone, choisit une langue, entre dans « Premier échange · L1 » et va jusqu'à la passe sans modèle. Si l'entrée apparaît, si l'oreille répond et si la sortie rend les cartes habituelles, l'affaire est close.

## 6. Ce qui reste

- **La correction des deux drapeaux** (§ 4), gratuite et sans renouvellement.
- **Un passage à la main sur l'aperçu** (§ 5), par Kartech.
- Les propositions italien L8, registre ja/ko et phonétique chinoise à `7d24556`, à relire séparément.

Plus aucune réserve technique de ma part sur le mécanisme ni sur le contrôle Node.
