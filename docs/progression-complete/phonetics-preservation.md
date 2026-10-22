# Préserver les phonétiques pendant la préparation de la progression

État : contrôle documentaire local. Les contenus d’origine, leur affichage et leur diffusion ne sont pas modifiés par cet outil. Une copie identique à la source ne constitue pas une validation de prononciation par un locuteur natif.

## Périmètre figé

`phonetics-baseline.json` contient des empreintes SHA-256, des décomptes et des références, sans recopier le texte intégral des 32 115 cartes. La référence protège :

- les sept catalogues `DECKS` de `melunga_deploy/app.html`, intégralement et par langue ;
- les 110 fichiers `L<n>-<maternelle>-<étudiée>.json` actuellement présents, soit onze couples sur dix niveaux ;
- `content/conversation/matrix.json` et le premier fichier `content/conversation-fr-es.json` : **112 fichiers JSON au total** ;
- tous les champs d’aide effectivement présents, notamment `py`, `pf`, `ps`, `pi`, `pj`, `pk`, `phon`, `phf`, `phe`, `phs`, `phi`, `phFR`, `phEN`, `phES`, `reading` et les éventuelles formes `…Full`.

La sélection des champs prend les noms courts connus, les clés commençant par `ph` et les noms de lecture/transcription documentés dans le script. Le hachage intégral protège également un éventuel champ inconnu de cette sélection. Pour les JSON, la recherche parcourt les modèles, phrases complètes, morceaux remplaçables, répliques et métadonnées, sans se limiter au premier niveau de l’objet.

L’empreinte des aides inclut chaque référence exacte (`DECKS.<langue>[indice]` ou chemin JSON), l’identifiant de l’unité ou du dialogue lorsqu’il existe, **la phrase associée et les valeurs de tous ses champs d’aide**. Les champs absents, présents mais vides, ou présents avec `null` restent distincts. Les accents, tons, majuscules, espaces et traits d’union ne sont jamais normalisés.

La sérialisation canonique autorise seulement les changements de présentation du JSON : indentation ou ordre des clés d’un objet. L’ordre des listes, tous les textes et toutes les autres valeurs restent protégés. Les modifications HTML hors de `DECKS` n’entrent pas dans ce contrôle. L’empreinte du catalogue intégral interdit aussi d’enlever une carte, d’en modifier une traduction ou de changer son classement en douce. La nouvelle progression doit être construite dans les documents et banques séparés.

## Commande de vérification

Depuis la racine du dépôt :

```sh
python3 tools/pedagogy/guard_phonetics.py --check
```

Cette commande ne réécrit aucun fichier. Elle vérifie les sources et contrôle automatiquement `docs/progression-complete/banque-phrases.json`, s’il existe, ainsi que les fichiers `docs/progression-complete/banks/*.json`. Pour une autre banque :

```sh
python3 tools/pedagogy/guard_phonetics.py --check --bank chemin/banque.json
```

Le code de sortie vaut `0` si tout concorde, `1` si le contrôle révèle un écart, `2` en cas d’erreur de lecture ou de contrat. Le résultat JSON expose notamment `sourcePreserved`, `bankEntries`, `errors` et `nativeValidation: false`.

`--create-baseline` a servi une seule fois à créer la référence documentaire initiale et refuse d’écraser un fichier existant. Il n’existe pas de mode de mise à jour automatique de cette référence. Le snapshot doit être relu et conservé avec le contrôle ; modifier simultanément une source et sa référence pourrait naturellement masquer un écart. Un changement de commit sans changement de contenu ne rend pas la référence périmée : `sourceRevision` est informatif.

## Contrat des banques nouvelles

La banque expose une liste `entries`. Chaque entrée indique son identifiant propre, la langue du lecteur, la langue étudiée, une référence précise et une copie. Exemple de forme, à remplir uniquement par copie des objets sources :

```json
{
  "entries": [
    {
      "id": "copie-fr-ko-L1-03-v0",
      "nativeLanguage": "fr",
      "studyLanguage": "ko",
      "source": {
        "type": "conversation",
        "file": "melunga_deploy/content/conversation/L1-fr-ko.json",
        "unitId": "L1-fr-ko-03",
        "variantIndex": 0,
        "slot": false,
        "expectedStudy": "커피 주세요."
      },
      "copy": {
        "study": "커피 주세요.",
        "aids": {
          "phon": "keo-pi djou-sé-yo",
          "reading": "keopi juseyo."
        },
        "native": "Je veux un café."
      }
    }
  ]
}
```

Pour une réplique, remplacer `unitId`, `variantIndex`, `slot` par `dialogueId` et `turnIndex` (indices commençant à zéro). Un morceau remplaçable est repéré avec `slot: true` ; un modèle avec `unitId` et `model: true`. Ces objets ne deviennent pas pour autant des phrases principales complètes : ce contrôle établit la provenance, pas la fonction pédagogique.

Pour une carte, la référence est `{"type":"deck","language":"zh","index":226,"expectedStudy":"我想休息"}`. `copy.aids` doit contenir **tous** les champs d’aide présents sur la carte, y compris les champs historiques et les champs vides. `copy.native` est facultatif ; s’il est présent, il doit correspondre exactement à la traduction du lecteur dans la source. Une éventuelle proposition de correction éditoriale doit rester dans un champ ou document distinct, et ne remplace jamais la copie.

Le contrôle refuse une copie phonétique amputée, un accent ou un espace changé, une lecture remplacée, une phrase différente à l’indice indiqué et un fichier de conversation pour un autre couple de langues. La langue du lecteur n’est jamais déduite de la langue étudiée.

### Champ de prononciation selon le lecteur

Pour les conversations, `phon` appartient au couple indiqué dans le fichier et `reading`, s’il existe, reste une aide de lecture distincte. Pour `DECKS`, le contrôle suit le sélecteur actuel de `app.html` :

| Lecteur | Étude du chinois | Autres langues étudiées |
|---|---|---|
| Français | `phf` | `pf` |
| Espagnol | `phs` | `ps` |
| Anglais | `phe` | `py` |
| Italien | `phi` | `pi` |
| Japonais | `pj` | `pj` |
| Coréen | `pk` | `pk` |
| Chinois | `phon` | `phon` |

Le champ optionnel `displayPhonField` doit correspondre au champ déduit. Un repli existant vers `py` faute de champ dédié ne doit pas être présenté comme une nouvelle phonétique adaptée au lecteur. Pour l’accepter dans une banque, il faut déclarer `phoneticStatus: "reading-fallback-not-reader-adapted"` et `reviewRequired: true`. Le contrôle conserve alors la réserve ; il ne fabrique aucun champ manquant. `phFR` n’est pas substitué à `phf`, ni une romanisation à une aide francophone.

## Collisions et limite de l’audit

Le snapshot signale onze groupes de phrases identiques dont les aides diffèrent dans un même catalogue. Les indices exacts figurent dans `decks.languages.<langue>.differentAidCollisions`. Ils servent de références pour relecture ; le contrôle ne décide pas laquelle serait correcte, ne fusionne pas les cartes et ne modifie aucun JSON. Une banque doit pointer un indice précis, jamais une recherche qui prendrait silencieusement la première phrase identique.

La vérification a été éprouvée sur des sources temporaires avec 19 cas positifs et négatifs : conservation intacte, espaces et accents changés, champ historique modifié, phrase ou traduction modifiée, lecture supprimée, fichier supprimé, variante complète, morceau, réplique, copie complète de carte, lecteur incorrect, copie tronquée et repli non déclaré. Les sources du dépôt n’ont pas servi de fichiers de mutation.

Ce dispositif prouve une conservation exacte et la provenance des copies. Il ne certifie ni le naturel linguistique, ni les tons chinois, ni les voyelles longues japonaises, ni les enchaînements coréens, ni l’efficacité d’un niveau. Ces points nécessitent une écoute et une relecture humaine séparées, avec des propositions tracées et la validation de Kartech avant toute diffusion.
