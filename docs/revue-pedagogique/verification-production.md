# Vérification après mise en production (`dfdf6e4`)

Objet : le parcours progressif complet et les sept scènes café, publiés sur melunga.com. J'ai interrogé le site réel et refait moi-même la réconciliation des droits gratuits, qui était ma seule réserve avant publication. Rien de ce document ne demande d'action urgente.

## Verdict

**La réserve est levée, et elle l'est par la mesure.** Sa réconciliation des droits se reproduit exactement chez moi : **2 228 droits, zéro perte, zéro ajout**, dans les sept couples. Le contenu servi est intact, les drapeaux sont corrigés, `sourceCommit` n'a pas bougé.

Aucune réserve technique ne subsiste sur ce qui est publié.

## 1. Ce que melunga.com sert réellement

Interrogé directement sur le site de production :

| | |
|---|---|
| `content/l1-cafe.json` — `status` | **`owner-instruction-activated`** |
| — `nativeReviewPending` | **`false`** |
| — `sourceCommit` | `30e7d40a8af3f51ee186bf83f983596b8ca8798f` — **inchangé** |
| — `doesNotChangeAccess` | `true` |
| Les sept phrases chinoises de la scène café | **identiques au caractère près**, phonétiques et lectures comprises |
| `curriculum-index.js` | sept couples, dix niveaux, titres localisés pour le lecteur sinophone |

Les deux drapeaux que j'avais signalés sont corrigés **sans que `sourceCommit` ait été touché**, exactement comme je l'avais demandé : aucune empreinte de scène n'est invalidée, aucune instruction d'activation n'a eu à être renouvelée.

## 2. Les droits gratuits : sa réconciliation est exacte

C'était ma seule réserve. Je l'ai refaite à partir des données **qui s'exécutent** — le fichier `curriculum-legacy-free.js` chargé par le navigateur, les `DECKS` et les `PEDAGOGY_FAMILIES` du `main` fusionné — en comparant les ensembles d'indices, pas les totaux :

| Couple | Ancien prédicat | Nouveau prédicat | Perdus | Ajoutés | Son chiffre |
|---|---|---|---|---|---|
| fr→en | 342 | 342 | **0** | **0** | 342 ✔ |
| fr→es | 301 | 301 | **0** | **0** | 301 ✔ |
| fr→it | 350 | 350 | **0** | **0** | 350 ✔ |
| fr→zh | 331 | 331 | **0** | **0** | 331 ✔ |
| fr→ja | 308 | 308 | **0** | **0** | 308 ✔ |
| fr→ko | 287 | 287 | **0** | **0** | 287 ✔ |
| zh→fr | 309 | 309 | **0** | **0** | 309 ✔ |
| **total** | **2 228** | **2 228** | **0** | **0** | 2 228 ✔ |

Non seulement les totaux coïncident, mais **les ensembles sont identiques carte par carte**. Un apprenant non payant a exactement les mêmes droits avant et après la publication. C'est la garantie qui devait être au-dessus de tout soupçon, et elle l'est.

Son explication de l'écart japonais est également cohérente : `305 + 3 cartes masquées − 9 occurrences regroupées = 299`, ce 299 étant précisément le chiffre que j'obtenais avec ma convention de textes uniques. Trois conventions distinctes, désormais documentées — c'était bien un désaccord de comptage, pas une carte perdue.

## 3. Le mécanisme de préservation est le bon

Il a ajouté un prédicat explicite plutôt que de dépendre du parcours :

```js
function isFreeCard(d){
  if(FREE_LV.indexOf(d.lv)>-1) return true;
  return isLegacyFreeCard(d);
}
```

`isLegacyFreeCard` consulte une liste d'indices figée par couple. C'est exactement ce qu'il fallait : les 17 cartes chinoises qui n'étaient gratuites que par l'ancien parcours guidé — dont 这是最终报价。 au niveau 10 — ne dépendent plus d'un parcours qui a changé, mais d'un droit inscrit.

**Une fausse alerte de ma part, que je consigne.** Le JavaScript lit `pairs[nat+'-'+lang]`, c'est-à-dire une clé de chaîne. Or `content/curriculum-legacy-free.json` expose `pairs` comme une **liste**, où une telle lecture rendrait `undefined` et n'accorderait aucun droit hérité. J'ai cru tenir un défaut grave. Vérification faite, le fichier réellement chargé par le navigateur, `curriculum-legacy-free.js`, expose un **objet indexé par couple** — `fr-zh` → 331 indices. Le JSON est de la documentation, le JS est ce qui tourne, et il est correct.

C'est la quatrième fois cette semaine que mon instrument me trompe avant que le contenu ne me trompe. Les trois précédentes : un indicateur absolu appliqué à des langues de longueurs différentes, un arrondi masquant des marches, un filtre effaçant « il y a ». À chaque fois j'allais signaler un défaut inexistant. **C'est devenu le risque principal de ma relecture**, et la règle que j'en tire est simple : lire la structure réelle avant de l'interroger, jamais l'inverse.

## 4. Une remarque d'implémentation, sans urgence

`isLegacyFreeCard` localise la carte par `DECKS[lang].indexOf(d)`, un balayage linéaire par identité. Appelé dans `pool.filter(isFreeCard)` sur un deck entier, cela donne :

| Langue | Cartes | Temps du filtre | Comparaisons d'identité |
|---|---|---|---|
| en | 4 502 | 10 ms | 9 099 641 |
| zh | 4 903 | 10 ms | 11 184 716 |
| ja | 4 509 | 6 ms | 9 339 630 |

Onze millions de comparaisons pour un filtrage, soit une trentaine à une soixantaine de millisecondes sur un téléphone. **Ce n'est pas un défaut** : c'est imperceptible à l'usage, et cela ne se produit qu'au changement de rubrique ou de langue pour un non-payant. Une table d'indices rendrait l'opération immédiate, si l'occasion se présente — à ranger dans les améliorations, pas dans les corrections.

## 5. Ce qui n'est pas vérifié, et qu'il énonce lui-même

Ses essais après publication sont honnêtes sur leurs limites, et je les reprends sans les adoucir :

- **aucun téléphone physique**, aucun compte gratuit connecté : Chromium mobile émulé en session invitée ;
- **l'audibilité n'est pas attestée** — les contrôles vérifient qu'un appel audio part, pas qu'un son sort ;
- **l'enchaînement des douze phrases du nouveau L1 n'a pas été relu en natif.** Les phrases viennent de sources existantes, mais leur ordre est neuf, et il a publié en l'assumant.

À quoi j'ajoute : ni lui ni moi n'avons joué une leçon dans un navigateur sur le site. Ses 106 étapes sont passées sur une copie locale ; mes contrôles portent sur les fichiers servis. **Les fichiers sont donc prouvés, l'expérience ne l'est pas.**

## 6. Ce qui reste ouvert

Rien de cela ne remet en cause la publication ; ce sont des chantiers.

1. **Les 203 dialogues non préparés** — sept sur 210 le sont. C'est l'écart entre « savoir dire des phrases » et « tenir un échange », donc entre le produit et sa promesse. La limite la plus importante des trois qu'il énonce.
2. **Les niveaux du catalogue comme frontière commerciale.** `isFreeCard` teste `lv === 1` : le niveau d'une carte ne décrit pas seulement sa difficulté, il décide de sa gratuité. Les 32 115 niveaux n'ayant pas été relus un par un, la frontière gratuit/payant repose sur un classement non audité. Sans conséquence aujourd'hui, puisque rien n'a bougé — mais toute reprise des niveaux déplacerait cette frontière.
3. **Les tons chinois ne sont pas notés** dans l'aide francophone. Seule des sept langues dont l'aide phonétique reste structurellement incomplète.
4. **Les 341 réserves pédagogiques**, consignées et non résolues. Elles ne se résorberont pas sans tri.
5. **La relecture native du nouvel enchaînement L1**, à demander aux mêmes relecteurs que les scènes café.

## 7. La seule chose qui manque vraiment

Tout ce qui précède décrit la matière. **Rien, dans cette semaine, n'a été essayé sur un apprenant.** Nous avons mesuré 13 078 champs, 918 leçons, 2 228 droits, onze millions de comparaisons — et la seule donnée humaine du dossier reste la remarque de Mme Haddad sur le chinois, qui a déclenché la refonte du L1 dans les sept langues et valait davantage que toute cette instrumentation.

Le produit est maintenant en ligne. **L'essai qui compte est devenu possible sur le vrai site, avec le vrai audio.** C'est la prochaine mesure, et la première qui portera sur l'apprentissage plutôt que sur le contenu.
