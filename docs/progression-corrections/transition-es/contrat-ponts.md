# Préparations réelles pour les routines espagnoles L4

Étude technique et mise en œuvre bornée après `a4f1ec4`. Les trois références sont dans l’[annexe de préparation](preparations.json), appliquée par le compilateur et la maquette sans modifier les quatre entrées éditoriales validées ni les sources produit. Les copies exactes et les exclusions sont dans [ponts-candidats.json](ponts-candidats.json). Ce document n’approuve aucune publication.

## Option recommandée

Proposer trois phrases courtes déjà présentes au catalogue, chacune **avant la variante entière qui la réemploie**. Chaque support a ses propres étapes de compréhension et d’imitation ; la phrase longue conserve ensuite ses étapes habituelles. Il ne s’agit pas de déclarer la carte déjà connue parce qu’elle existe ou porte un niveau inférieur.

| Catalogue, index base zéro | Phrase entière à présenter | Niveau source | Avant la variante |
| --- | --- | ---: | --- |
| `DECKS.es[264]` | Como en casa. | 2 | `L4-fr-es-01/v1` — Normalmente como en casa. |
| `DECKS.es[283]` | Me levanto temprano. | 2 | `L4-fr-es-01/v0` — Normalmente me levanto a las siete. |
| `DECKS.es[542]` | Me acuesto pronto. | 3 | `L4-fr-es-03/v3` — Por la noche me acuesto pronto. |

Le choix final garde les cartes source lv2/3 et des aides proches : *Me levanto temprano* fournit une occurrence complète de la forme pronominale, **pas le complément a las siete ni Normalmente**. Ces nouveautés demeurent proposées dans la phrase cible entière. `[1531]` *Me levanto a las siete*, lv5, a été examiné comme alternative plus proche à l’écrit, mais n’est pas retenu dans ce petit essai. Un numéro catalogue ne constitue pas une preuve de difficulté ou d’acquisition. `[542]` est plus direct que `[335]` *Me acuesto tarde*, puisque la cible contient *pronto*.

Les trois supports ne remplacent aucune variante ni comparaison. Ils n’autorisent pas à créer une nouvelle phrase en assemblant des aides phonétiques. *Como en casa* et *Me acuesto pronto* sont repris avec un repère ; *Me levanto temprano* reprend la forme verbale mais change aussi de complément dans la cible. Aucune comparaison « un seul changement » n’est créée entre carte et cible. `[1286]` *Voy al gimnasio*, lv4, reste un candidat non retenu pour cet essai.

### Sources et conventions phonétiques

Les dix candidats précédents sont vérifiés : **40 champs catalogue et dix destinations conformes**. Les trois références retenues ont leurs douze champs `t/frm/pf/lv` et leurs neuf champs de destination `study/native/phon` contrôlés, soit onze cartes distinctes avec les précédentes.

Les valeurs `pf` restent littérales :

- `[264]` : `KO-mo én KA-ssa` ;
- `[283]` : `mé lé-BAN-to tém-PRA-no` ;
- `[542]` : `mé a-KOUÉS-to PRON-to`.

La cible de *Me levanto* conserve sa propre graphie du complément horaire, non fourni par la carte. Les autres choix de transcription restent propres à leur corpus. Ce contrôle atteste les copies et ne tranche pas la qualité phonétique ou une convention générale.

`Trabajo hasta las seis.` `[1194]` n’est pas retenu pour cet essai : sa transcription `tra-BA-ro AS-ta las SÉÏS` diverge fortement de la cible en `tra-BA-kho` / `SSÉIS`. Il ne faut ni corriger cette carte dans le lot ni afficher une aide remaniée sous sa provenance.

Il n’existe pas de carte déclarative directe en troisième personne *vive* dans les 4 672 cartes espagnoles examinées. *Vive el presente* est un impératif : l’utiliser comme pont vers *Mi hermano vive* introduirait une fausse équivalence. Aucun support direct en *tiene* décrivant un logement n’a été trouvé. *Mi hijo tiene cinco años* `[2093]` existe, mais ajoute un contexte d’âge et une transcription de *hijo* en `I-ro`, différente du corpus conversation ; il n’est pas ajouté pour satisfaire un recouvrement lexical.

## Contrat minimal proposé

L’annexe stocke la carte choisie, sa destination et sa justification, deux changements d’ordre de variantes et leurs raisons. Le compilateur lit l’application déjà protégée par l’empreinte de source, puis copie **la carte entière** : `t → study`, `frm → native`, `pf → phon`. Les champs sont vérifiés non vides ; aucun fallback vers une autre aide ou langue du lecteur n’est admis. Le niveau catalogue est conservé comme provenance, sans réécriture des cartes ni des droits. Les quatre fichiers éditoriaux sont en outre comparés octet pour octet à Git `a4f1ec4` ; une empreinte modifiée dans l’annexe ne permet pas de modifier ces entrées.

Le runtime garde exactement ses quatre variantes dans `unit.phrases`. Les supports sont distincts :

```json
{
  "preparations": [{
    "id": "L4-fr-es-01-preparation-264",
    "beforeVariantIndex": 1,
    "source": {
      "type": "catalogue-card",
      "file": "melunga_deploy/app.html",
      "collection": "DECKS.es",
      "index": 264,
      "indexBase": 0,
      "sourceLevel": 2,
      "readerLanguage": "fr",
      "studyLanguage": "es",
      "fieldMap": {"study": "t", "native": "frm", "phon": "pf"}
    },
    "phrase": {
      "id": "catalogue:DECKS.es:264:reader-fr",
      "study": "Como en casa.",
      "native": "je mange à la maison",
      "phon": "KO-mo én KA-ssa"
    },
    "understoodInStep": "L4-fr-es-01-preparation-264-understand",
    "imitatedInStep": "L4-fr-es-01-preparation-264-imitate"
  }]
}
```

Le `sourceCommit` immuable `bcd108d` accompagne le locator retenu dans le runtime. Une même carte peut être proposée à deux endroits sans mélanger contenu et placement : `sourceMap` mémorise **`preparation.phrase`**, pas l’occurrence avec son `beforeVariantIndex`. Deux contenus différents sous le même ID sont rejetés.

`beforeVariantIndex` est l’index source 0–3, pas une position dans l’ordre de découverte. L’essai utilise `[1,2,3,0]` pour `L4-fr-es-01` : `[264]` arrive avant `v1`, puis `[283]` avant `v0`. `L4-fr-es-03` suit `[3,0,1,2]` : `[542]` arrive avant `v3`. Il ne faut pas placer toutes les cartes au début du niveau ou les déclarer déjà rencontrées sur cette seule base.

Le compilateur insère deux étapes ordinaires `understand` puis `imitate`, avec un marqueur `preparationId`, immédiatement avant l’étape `understand` de la variante visée. Aucun nouveau `kind` n’est nécessaire. Chaque étape garde `wholePhrase: true` ; seule l’imitation exige la production. Les identifiants de préparation ne peuvent entrer dans `compare.choices` ou `choose-and-recall.choices` : ces choix restent ceux des quatre variantes entières, chacune présentée et proposée à l’imitation auparavant. Aucun score, acquis, droit ou déverrouillage n’est écrit.

Le champ étant optionnel, une unité sans `preparations` garde exactement ses étapes précédentes. Le chargeur de production et les 110 JSON conversation ne changent pas. Le contrat est borné aux deux unités L4 `fr-es` et aux trois références explicites ; il ne doit pas devenir un import automatique de toute carte portant un mot commun.

Une correction descriptive isolée est également portée par cette annexe pour `L3-fr-es-05` : `firstSubstitution.changedPart` désigne maintenant les groupes entiers *esta palabra* / *la pregunta*, déterminants compris. La paire, l’invariant, les opérations déclarées, l’ordre et les phrases ne changent pas. Cette correction n’ajoute aucune préparation L3 et ne gonfle pas le stock mesuré à ce niveau.

## Portée dans le code existant

| Composant | Changement nécessaire si l’option est retenue |
| --- | --- |
| Compilateur | Lire les références, copier les cartes depuis la source protégée, vérifier locator/aides/langues et dériver les six étapes supplémentaires. |
| Validation Python | Garder l’égalité stricte des quatre variantes ; vérifier séparément les cartes, les identifiants et leur placement antérieur à la variante ciblée. |
| Maquette JS | Étendre la table des phrases et l’ensemble d’IDs autorisés aux seuls supports de compréhension/imitation ; conserver les quatre choix originaux. |
| Oreille | Réutiliser le bouton existant : lire `phrase.study` en `es-ES`, jamais `phon`. Aucune nouvelle logique d’audio de fond ni de rappel. |
| Oracle DOM | Lire indépendamment `DECKS.es` dans l’application source ; vérifier les trois cartes et six étapes aux trois formats, en plus des 3 364 variantes. |
| Export autonome | Pas de modification nécessaire au sérialiseur : il intègre déjà tout le paquet et la maquette. Régénérer et vérifier le fichier final. |

Ce n’est donc pas une simple annotation de prérequis : le petit supplément touche le compilateur, le lookup JS, l’oracle et les compteurs, tout en laissant les sources produit intactes. **Six étapes et trois supports** s’ajoutent aux 3 364 variantes, pour 3 367 énoncés sourcés. Les compteurs distinguent `existingCataloguePreparations: 3`, `totalPresentedUtterances: 3367`, `newlyAuthoredStudyPhrases: 0` et `newlyAuthoredPhoneticAids: 0` ; les anciens libellés ambigus `newStudiedPhrases` / `newPhonetics` sont retirés. Trois supports préexistants deviennent de nouveaux énoncés de la séquence, sans rédaction nouvelle.

## Comparabilité des mesures

Le calcul principal reste celui des **quatre variantes par unité**, sans catalogue ni dialogues, et ses ratios restent inchangés. Le corpus étendu aux trois supports a un périmètre différent : **temprano ajoute un type écrit absent des variantes L4**. Les autres types des supports y figuraient déjà. Il ne faut donc annoncer ni diminution du ratio principal ni fermeture du besoin L3→L4 par ce seul supplément.

Un éventuel « reste inédit après les cartes » est une autre mesure : il suppose leur présentation, doit indiquer les étapes réelles et ne peut être comparé au taux d’entrée depuis L3. Présenter une carte sur écran ne prouve d’ailleurs pas qu’elle a été entendue, comprise ou acquise. La séquence offre l’écoute et l’imitation sans les certifier. Sa valeur est un réemploi observable en maquette à tester avec l’apprenant, pas un compteur artificiellement réduit.

## Contrôles utiles avant une intégration

1. Oracle Git indépendant : cartes `t/frm/pf/lv` exactes, quatre variantes originales et leurs aides intactes ; carte sans aide française ou locator décalé rejetés.
2. Chronologie : chaque préparation est comprise puis proposée à l’imitation avant sa cible ; un index cible absent, un identifiant inconnu ou une préparation autoréférentielle est refusé.
3. Frontières : aucune carte ne passe dans les quatre choix/rappels, aucun L1 ni autre couple n’est modifié ; aucun acquis ou droit n’est écrit.
4. Rendu et oreille : texte, sens, aide et audio exacts pour le support, puis pour la cible ; lecture du texte étudié en espagnol, commande toujours accessible ; absence de débordement sur les trois formats.
5. Reproductibilité : trois supports et six étapes comptés séparément, export autonome exact, rapports liés par SHA-256 au runtime final. La garde complète des sources reste exécutée.

Les points de transcription et la relecture native restent explicites. Aucune correction ou harmonisation phonétique n’est autorisée par ce contrat.
