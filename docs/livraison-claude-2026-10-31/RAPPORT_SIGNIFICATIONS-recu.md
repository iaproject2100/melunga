# Significations ru / pt / ar / hi : rapport de livraison

Le fichier livré est `significations-a-completer.json`. Il a la même structure que le fichier source de la branche `feat/interface-russe-portugais` (`sourceBaseCommit` 120f1362…).

## Couverture

- **Les 29 077 concepts ont leurs quatre champs remplis**, `ru`, `pt`, `ar` et `hi`, soit 116 308 valeurs. Aucune n'est vide.
- **Une seule passe complète, sans lot partiel.** Le travail a été fait en 59 lots d'identifiants consécutifs (0–499, 500–999, …, 29 000–29 076) ; tous ont été rendus en entier puis rassemblés.
- **Rien d'autre n'a changé**, ce qui a été vérifié par comparaison avec la source :
  - `id`, `en`, `frm` et `sources` ;
  - tous les champs `*Candidate` et `hiCandidates` ;
  - les clés de premier niveau (`version`, `status`, `policy`, `banks`, `nativeLanguagesToComplete`…) ;
  - l'ordre des concepts.

## Variantes

- **Portugais** : variante du Brésil (você, a gente, celular, ônibus, trem).
- **Arabe** : arabe standard moderne d'usage courant, sans voyelles brèves écrites, avec « ؟ » et « ، ».
- **Russe** : orthographe avec ё.
- **Hindi** : devanagari et hindi standard, avec « आप » par défaut pour la politesse et « । » en fin de phrase.

## Candidats : tous relus, aucun accepté d'office

| | ru | pt | ar | hi |
|---|---:|---:|---:|---:|
| Candidats repris tels quels après vérification | 3 976 | 3 867 | 3 321 | 3 553 |
| Candidat gardé, seulement complété par le marqueur de genre ou de registre | 324 | 69 | 67 | 436 |
| Candidat retouché pour la ponctuation seulement | 0 | 0 | 55 | 14 |
| Candidat réécrit (sens, registre, article, naturel) | 162 | 497 | 990 | 432 |

L'arabe compte le plus de réécritures. Les candidats arabes venant des cartes, ils reprenaient souvent une tournure propre au deck : article manquant ou en trop, formule trop littérale pour servir de signification d'interface.

## Conventions de marqueurs (à valider par Codex)

Quand `en` ou `frm` portent un marqueur, la traduction est accordée et se termine par le marqueur équivalent :

| Marqueur | ru | pt | ar | hi |
|---|---|---|---|---|
| (male) | (муж.) | (homem) | (ذكر) | (पुरुष) |
| (female) | (жен.) | (mulher) | (أنثى) | (स्त्री) |
| (to a man) | (мужчине) | (a um homem) | (لرجل) | (पुरुष से) |
| (to a woman) | (женщине) | (a uma mulher) | (لامرأة) | (स्त्री से) |
| (polite / formal) | (вежл.) | (formal) | (رسمي) | (औपचारिक) |
| (informal) | (неформ.) | (informal) | (غير رسمي) | (अनौपचारिक) |

- **Contrôle** : toutes les cartes « (male) » et « (female) » portent le bon marqueur dans les quatre langues. Aucune paire masculin/féminin n'a une traduction identique.
- **À décider** : les candidats fournis ne portaient pas ces marqueurs. Si l'interface affiche déjà le marqueur ailleurs, Codex peut les retirer automatiquement avec une expression régulière en fin de chaîne. C'est le seul choix de forme qui touche un grand nombre de valeurs (environ 900 par langue).

## Contrôles automatiques passés

- **Écriture de chaque langue** : il y a bien du cyrillique dans `ru`, de l'arabe dans `ar` et du devanagari dans `hi`, et aucune de ces écritures n'apparaît dans `pt`.
- **Exceptions voulues** : `IBAN` reste en lettres latines en ru et en hi (concept 29004), comme dans l'usage courant.
- **Points de suspension « … »** : ils sont conservés dans les modèles à trous. Il y a 32 écarts, tous bénins :
  - des réponses suivies de « … » (« Как бы это сказать… » pour « how do I say it ») ;
  - des gabarits du type « a bag of » rendus « пакет... » ou « ...का एक थैला ».
  Ces cas sont listés ci-dessous.
- **Structure** : la structure « / » des variantes est conservée.

## Ambiguïtés et décisions à prendre

1. **Marqueurs de genre et de registre** : les garder ou les retirer (voir plus haut).
2. **Gabarits en ru et hi** (concepts 3062, 3094 et 3258, « a bag of / a box of / a cup of ») : le hindi place le complément avant le nom, d'où « ...का एक थैला ». Il faut vérifier que l'affichage accepte « … » en tête.
3. **Gloses de registre sur du vocabulaire** : par exemple « the meeting (formal) » (20793) ou « Kind greetings, (formal opener) » (27278). La glose est rendue par le choix du mot (« совещание », « Prezados senhores, », « تحية طيبة وبعد، ») et non par un marqueur entre parenthèses.
4. **Proverbes** : ils sont rendus par l'équivalent naturel quand il existe, sinon par le sens. Les maximes chinoises sont traduites selon leur sens habituel.
5. **Relecture native** : ces significations ont été vérifiées sur le sens et le registre par rapport à `en` et `frm`, sans relecture par des locuteurs natifs. Avant publication, il est recommandé de faire relire un échantillon par langue, surtout l'arabe et le hindi.

### Écarts de « … » relevés (non corrigés, jugés acceptables)
3062, 3094, 3258 (ru et hi) ; 12177, 12202 (les quatre langues), ainsi que quelques autres réponses du même type. La liste complète s'obtient en comparant le nombre de « … » dans la source et dans chaque traduction.
