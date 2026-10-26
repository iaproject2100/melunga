# Revue technique du lot intégral 1 de Claude

Revue locale du 25 octobre 2026. Base du lot : `4ec163e68b60bff98a63baf52a36428f6ffe63fa`. Candidat relu : `d4eaea3` (`0f5f087`, retrait `bf928d0`, puis lecture `d4eaea3`). Référence Codex : `345c709`. Les fichiers de produit et outils de `345c709` sont identiques à ceux de la base pour ce périmètre.

**Le lot se charge dans l’interface locale. Il n’est pas encore intégré durablement à la génération : les 736 corrections disparaîtraient à la prochaine régénération, et 12 copies de transport présentent encore les anciennes aides.** Aucun défaut d’identité, de niveau ou d’accès n’a été trouvé dans le diff. Ces résultats ne valident pas le naturel des nouvelles aides.

Aucune fusion, publication, modification de produit ou application de règle `s→ss` n’a été réalisée pour cette revue. Le candidat a été isolé dans `/tmp/melunga-revue-integrale-tech` ; seuls des documents et preuves sont remis sur la branche Codex.

## Comparaison exhaustive des données

| Contrôle entre base et candidat | Résultat |
|---|---:|
| Cellules JSON de niveaux modifiées | 35 sur 70 |
| Identifiants canoniques avant / après | 33 654 / 33 654 |
| Identifiants canoniques perdus / ajoutés | 0 / 0 |
| Valeurs `phon` modifiées | 736 |
| Statuts `phoneticReviewStatus` modifiés ou ajoutés | 736 |
| Autres champs modifiés dans les cellules | 0 |
| Entrées du registre / clés uniques `(couple,id)` | 736 / 736 |
| Désaccord avant/après entre registre et cellules | 0 |
| Couples distincts de chaînes `(ancienne aide,nouvelle aide)` | 728 |

Répartition des 736 cartes : fr→zh 423, fr→ko 260, fr→es 36, zh→fr 17. Ce sont bien **736 identifiants de cartes**, pas un total gonflé par plusieurs occurrences d’une syllabe. Les 728 couples de chaînes montrent que plusieurs cartes peuvent partager la même retouche écrite ; ils ne ramènent pas le nombre de cartes à 728.

Le périmètre annoncé de **33 874 identités uniques** est cohérent : 33 654 entrées canoniques, plus 252 modèles reçus, moins 32 identifiants déjà communs aux deux ensembles. Les 32 792 entrées visibles et 862 entrées de réserve constituent ensemble les 33 654 canoniques. Additionner à nouveau les 32 partagées compterait deux fois ces identités.

Les textes étudiés, traductions, lectures/Pinyin, identifiants, emplacements, séquences, compteurs, métadonnées de niveaux et sources déclarées restent identiques. Le diff ne touche aucun fichier d’interface, de facturation, d’accès, ni `app.html`.

Les détails de chaque carte et de chaque fichier sont dans [preuves-techniques.json](preuves-techniques.json). Le vérificateur autonome [verifier_technique.py](verifier_technique.py) relit les objets Git ; il ne modifie aucun contenu et n’exécute aucun script correctif de Claude.

## 1. Bloquant pour l’intégration : corrections absentes du générateur

Le lot corrige directement les JSON de sortie. Les sources éditoriales, instantanés, ledgers, répertoires et le générateur n’ont pas reçu ces changements.

Commande rejouée dans le candidat isolé :

```sh
python3 -B tools/maquette-guidee/build_levels.py --check
```

Résultat, code 1 :

```text
ValueError: Out of date: melunga_deploy/content/niveaux-progressifs/fr-es/L1.json
```

Pour mesurer toute la portée au lieu de s’arrêter au premier écart, la fonction `make()` a été appelée en mémoire, sans effectuer la boucle d’écriture de `main()`. Sur les 80 sorties calculées, **seules les mêmes 35 cellules diffèrent** des fichiers du candidat. Leur contenu recalculé remet **les 736 aides à leur valeur antérieure**. Aucune sortie n’a été écrite par cette expérience.

[regeneration-virtuelle.json](regeneration-virtuelle.json) fournit le décompte par cellule. Reproduction, dans un checkout isolé du candidat :

```sh
python3 -B - <<'PY'
import importlib.util
from pathlib import Path
p = Path('tools/maquette-guidee/build_levels.py')
s = importlib.util.spec_from_file_location('review_builder', p)
m = importlib.util.module_from_spec(s)
s.loader.exec_module(m)
outputs, report = m.make()
for path, expected in outputs.items():
    if not path.exists() or path.read_text() != expected:
        print(path)
# Ne pas appeler main() ni écrire outputs.
PY
```

**À préparer avant intégration :** représenter les corrections retenues dans une source versionnée consommée par le générateur, avec identifiant, ancien champ attendu, nouvelle aide, provenance et statut de relecture. Garder l’origine exacte distincte de la correction éditoriale ; ne pas changer un hash pour prétendre que la source originale contenait déjà la nouvelle aide. La génération doit produire ensemble les cellules, copies de transport, registres et empreintes correspondantes. Cette couche n’est pas réalisée par la présente revue.

## 2. Bloquant de cohérence : 12 aides anciennes restent dans les répertoires

Les sept fichiers `repertoires/<couple>.json` sont inchangés. Douze cartes modifiées possèdent une copie de transport : huit fr→zh et quatre fr→ko. **Les douze copies ont encore l’ancienne aide** et sont utilisées dans 27 références de révision, de contexte ou de soutien. Les 724 autres cartes corrigées n’ont pas de copie dans ces banques sélectionnées ; cette absence est normale et n’est pas un défaut.

Exemples :

| Identifiant | Carte canonique corrigée | Copie de transport encore utilisée |
|---|---|---|
| `catalogue:zh:221` — 我要那个 | L1 : `ouo yao na gueu` | L2, `L2-situation-repas-preferences` : `ouo yao na geu` |
| `catalogue:zh:2373` — 价格 | L4 : `djya-gueu` | Révisions L7 et L8, `vocab-restaurant` : `djya-geu` |
| `catalogue:zh:3442` — 合格 | L4 : `heu gueu` | Révisions L5–L10, `vocab-adjectifs` : `heu geu` |

La résolution de `phraseById()` dans `melunga_deploy/maquette-guidee.js:150` privilégie une carte canonique du niveau ouvert, puis se replie sur `state.referenceMap`. Les révisions d’un niveau ultérieur peuvent donc réafficher l’ancienne aide pour la même identité. La page ne doit pas être qualifiée de cassée : c’est une **incohérence entre première présentation et réemploi**.

Les 12 identifiants et leurs utilisations sont intégralement listés dans `transportMismatches` de la preuve JSON. Le correctif durable doit régénérer ces copies ; une seconde retouche manuelle de douze transports laisserait le problème de génération intact.

## 3. Les scripts de correction livrés ne rejouent pas l’état final en sécurité

La décision de Kartech de conserver le `s` simple est respectée dans les données finales ; aucune règle `s→ss` n’est proposée ici.

Cependant :

- `docs/revue-integrale/mesures/corrige.py:109` applique toujours la règle A. La commande dite « simulation » n’écrit pas les cellules sans `--apply`, mais réécrit malgré tout `mesures/registre.json` à la ligne 189. Avec `--apply`, elle réintroduirait les modifications A retirées. **Ce script n’a pas été exécuté pour cette revue.**
- `revert_A.py:63` décide de conserver B à partir du champ `nB`. Les **719 entrées B du registre final ne contiennent pas ce champ** : elles ont `regle: "B"`, mais pas `nB`. Sa condition de ligne 68 serait donc fausse pour les 719 corrections B. Une nouvelle exécution sur l’état final les remettrait à la valeur de la base ; seules les 17 C seraient épargnées. Constat effectué par lecture du code et du registre, sans exécution du correctif.
- Les mesures dépendent aussi de fichiers intermédiaires, dont `mesures/inventaire.json`, qui n’est pas versionné et doit d’abord être reconstruit par `charge.py`. Leur portée « lecture seule » signifie lecture des contenus applicatifs, pas absence totale d’écriture de rapports.

Ces scripts conservent la trace d’opérations historiques. Ils ne constituent pas encore une procédure finale, idempotente et compatible avec les décisions de Kartech. Il faut neutraliser les transformations retirées et définir une seule chaîne de génération depuis les corrections autorisées.

## Profils de contrôles : chargement, source et durabilité sont distincts

| Contrôle rejoué sur `d4eaea3` | Résultat et portée |
|---|---|
| Comparaison structurelle des 70 cellules | Passe : identités et champs hors aides/statuts conservés |
| Première matrice navigateur, 70 cellules à 320 px | Passe : les sept couples et dix niveaux sont chargés localement |
| `guided-lesson-controls.browser.cjs` | **9/9 passent** : carte entière sur ordinateur/mobile simulés, Pinyin, masquage, quatre balayages, interactions, redimensionnement, À revoir et séparation du reçu |
| `build_levels.py --check` | Échoue : sorties manuelles différentes des sorties calculées |
| Génération virtuelle en mémoire | Les 736 corrections sont perdues sur les 35 cellules ; aucune écriture réalisée |
| `check_levels_independent.py --check-report --require-visuals --strict-editorial --require-no-held --self-test` | Échoue : `Resolved whole source is missing or changed` |
| Comparaison canonique / copie de transport | Échoue pour 12 aides, utilisées 27 fois |

Le contrôle indépendant est conçu pour vérifier les copies exactes de sources et les transports, notamment dans `check_levels_independent.py:413–427`. Son échec est attendu tant que les corrections sont injectées dans les sorties sans représentation dans les sources/overlays reconnus. Désactiver ce contrôle pour obtenir du vert masquerait le problème.

Le rendu emploie bien `phrase.phon` ou, lorsque le lecteur l’a choisi, `phrase.reading` pour le Pinyin (`maquette-guidee.js:737–740`). Il n’introduit aucune transformation phonétique automatique à l’affichage. Le manifeste conserve les chemins et compteurs corrects, mais ne vérifie pas dans le navigateur l’identité source complète de chaque aide ; c’est pourquoi le chargement peut passer alors que l’intégrité éditoriale échoue.

Les contrôles navigateur sont locaux, avec tailles d’écran simulées et mécanismes audio contrôlés. Ils ne vérifient ni voix réelle, ni téléphone physique, ni APK, ni aperçu Netlify, ni production. Seule la première passe de la matrice étendue à 320 px est revendiquée ici ; ce rapport ne transforme pas le lancement de la suite complète en réussite globale.

## Conditions pour retenir techniquement les corrections choisies

1. Faire valider les corrections et exceptions linguistiques par la revue correspondante, sans réintroduire la règle du `ss` retirée.
2. Porter les modifications acceptées dans une couche de correction versionnée, sourcée et reproductible, préservant l’identité et l’aide originales.
3. Régénérer les 70 cellules et leurs copies/empreintes ensemble ; vérifier zéro variation d’ID, niveau, texte étudié, traduction, lecture et droits.
4. Faire passer génération `--check`, contrôle indépendant et cohérence des transports ; reprendre les neuf contrôles d’interface après le lot technique effectif.

**Avis technique : intégrer une fois ces points traités, pas fusionner les 35 sorties seules.** Le travail de Claude apporte 736 modifications précisément traçables ; leur sélection linguistique et leur intégration durable restent deux validations distinctes.
