# Appui Codex à la rédaction des contenus anglophones

Relecture ciblée du travail en cours `e87fb8b`. Le statut WIP et les champs « ?? » des squelettes sont attendus pendant la rédaction ; ce document ne les présente pas comme une livraison achevée ou un défaut du contenu publié. Aucune source de contenu de Claude n'est modifiée par cette revue.

## 1. Préserver les exceptions de la phrase étudiée lors de la dérivation

**Constat reproduit :** `derive_native.py` conserve le texte complet dans `slot._full.study`, mais `conv_build.compose()` ignore `_full`. La correction d'une particule est donc perdue pour l'anglais→coréen :

- source validée `L3-fr-ko-11`, variante 2 : `어디에 살아요?` ;
- référence conservée dans `data_en_ko.py` : `어디에 살아요?` ;
- assemblage du modèle dérivé : `어디에서 살아요?`.

Comparaison effectuée sur les six modules `data_en_<étude>.py` : une divergence de texte étudié à cette révision, celle-ci. La vérification ne vaut pas relecture linguistique exhaustive.

**Proposition :** le dérivateur transporte la phrase étudiée complète dans un champ consommé (`studyFull`) quand nécessaire, et sa lecture dans `readingFull`. Conserver aussi la référence de phonétique complète dans `_full` pour la réécriture anglaise. Le rédacteur fournit `phonFull` si le découpage du gabarit n'est pas compatible. Les traductions complètes doivent également utiliser `nativeFull` lorsque nécessaire. Ajouter une comparaison de sortie des phrases/lectures étudiées avec les références sources.

## 2. Adapter les phrases de secours au lecteur

Le brief demande de conserver toute la partie étudiée. Prévoir une exception éditoriale explicite pour les phrases qui désignent la langue maternelle :

| Source héritée | Pour un apprenant anglophone |
| --- | --- |
| `¿Habla francés?` | `¿Habla inglés?` |
| `Parlez-vous chinois ?` | `Parlez-vous anglais ?` |
| `Parla francese?` | `Parla inglese?` |
| `你会说法语吗？` | `你会说英语吗？` |
| `フランス語が話せますか。` | `英語が話せますか。` |
| `프랑스어 할 수 있어요?` | `영어 할 수 있어요?` |

Mettre à jour conjointement la traduction, la phonétique et la lecture. Ces modifications intentionnelles doivent être distinguées des régressions d'assemblage, par exemple dans une liste d'exceptions à la comparaison des sources.

Les prénoms et nationalités des exemples peuvent rester fictifs ; ils ne doivent pas être interprétés comme des caractéristiques imposées à l'utilisateur.

## 3. Bloquer les champs inachevés avant export validé

**Constat reproduit sur copie temporaire :** remplacer une traduction par `?? TODO translation` laisse `validate.py` terminer avec code 0 et « aucune erreur ».

Le contrôle du brief `grep '??'` est utile pendant la rédaction mais ne protège pas les seuls JSON livrés. Ajouter un contrôle des marqueurs `??`, `TODO` et `TBD` dans les champs éditoriaux exportés : traduction, phonétique, situation, note, rôles, conventions, statut et repère de progression. Un mode brouillon peut les autoriser explicitement ; le contrôle de livraison doit les refuser. Ne pas qualifier un squelette courant de validé parce que ses champs sont non vides.

## 4. Convention de phonétique pour lecteurs anglophones

Conserver le travail demandé dans le brief : réécrire l'aide à la prononciation pour l'anglais, pas uniquement remplacer les traductions. Le pinyin à tons, les lectures japonaises et les romanisations restent séparés des approximations destinées au lecteur.

Pour le français, expliquer l'accent de groupe plutôt que promettre un accent lexical fixe sur chaque mot. Les aides comme `ew` pour /y/ sont approximatives : indiquer comment former le son et conserver l'audio comme référence.

## Répartition proposée

- Claude poursuit les six couples pour anglophones et les adaptations éditoriales.
- Codex relit les fichiers générés par petits lots, contrôle les phrases complètes et signale les régressions de langue/lecture et les défauts de schéma.
- La relecture native reste nécessaire pour les nuances non certifiées. Aucun nouveau couple n'est activé dans le chargeur uniquement parce qu'un squelette existe.
