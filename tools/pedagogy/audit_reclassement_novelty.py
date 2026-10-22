#!/usr/bin/env python3
"""Inspect distinct written forms before/after reclassification; never acquisition.

The new review supplies edges but no executable formula. One explicit hypothesis
fits those edges. Keep exact ratios, rounding and alternative scopes separate.
"""
import argparse
from collections import defaultdict
from decimal import Decimal, ROUND_HALF_UP
from fractions import Fraction
import hashlib
import json
from pathlib import Path
import re
import sys
import unicodedata

sys.dont_write_bytecode = True
from audit_reclassement_followup import (
    ROOT, SNAPSHOT, SOURCE, RUNTIME, PAIRS, canonical_sources, checked_units,
    git_bytes, require,
)

OUTPUT = Path('docs/progression-corrections/suivi-relecture/nouveaute')
OLD_SCRIPT_COMMIT = '8ee1b7994247540363cd0cd7d1efb33df63fcb04'
OLD_SCRIPT_PATH = 'docs/revue-pedagogique/mesures/mesure_briques.py'
# Edges transcribed from the review's §3 bis; a match does not prove its formula.
REVIEW_EDGES = {
    'fr-en': ([3, 6, 7, 9], [3, 6, 9]),
    'fr-es': ([3, 7], [3, 7]),
    'fr-it': ([3, 4, 6, 7], [4]),
    'fr-zh': ([3, 6, 7], [3, 7]),
    'fr-ja': ([6, 7], []),
    'fr-ko': ([4, 6, 7, 9], [4, 6]),
    'zh-fr': ([6], [8]),
}


def tokens(text, study, legacy=False):
    """Surface types only: no lemmatisation, Unicode normalisation or phonetics."""
    if legacy:
        if study in ('zh', 'ja'):
            return [char for char in text if '\u3040' <= char <= '\u9fff']
        if study == 'ko':
            return re.findall(r'[\uac00-\ud7af]+', text)
    elif study in ('zh', 'ja', 'ko'):
        return [char for char in text if unicodedata.category(char)[0] in 'LN']
    return re.findall(r'[^\W\d_]+', text.lower(), re.UNICODE)


def rounded_percent(ratio):
    return int((Decimal(ratio.numerator) * 100 / Decimal(ratio.denominator)).quantize(
        Decimal('1'), rounding=ROUND_HALF_UP))


def increases(ratios, rounded=False):
    compared = [rounded_percent(ratio) if rounded else ratio for ratio in ratios]
    return [f'L{index+1}<L{index+2}' for index in range(len(compared)-1)
            if compared[index] < compared[index+1]]


def inventory_statistics(levels, study, legacy=False, detailed=True):
    """Each level is a list of (provider ID, study strings, source level)."""
    seen, rows, ratios = set(), [], []
    for level, providers in enumerate(levels, start=1):
        provider_types = [(provider, {token for text in texts for token in tokens(text, study, legacy)}, source)
                          for provider, texts, source in providers]
        types = set().union(*(types for _, types, _ in provider_types))
        new_types = types - seen
        # Empty inventory has no novel forms; max(1, ...) matches the old script.
        ratio = Fraction(len(new_types), max(1, len(types)))
        ratios.append(ratio)
        row = {'level': level, 'typeCount': len(types), 'newTypeCount': len(new_types),
               'ratio': {'numerator': ratio.numerator, 'denominator': ratio.denominator},
               'percent': float(ratio * 100), 'roundedPercentHalfUp': rounded_percent(ratio)}
        if detailed:
            owners = defaultdict(list)
            for provider, values, _ in provider_types:
                for value in values & new_types:
                    owners[value].append(provider)
            row.update({'types': sorted(types), 'newTypes': sorted(new_types),
                        'previousTypeCount': len(seen),
                        'newTypeProviders': dict(sorted(owners.items())),
                        'providers': [
                            {'id': provider, 'sourceLevel': source, 'typeCount': len(values),
                             'newTypeCount': len(values & new_types),
                             'newTypes': sorted(values & new_types),
                             'exclusiveNewTypes': sorted(value for value in values & new_types
                                                         if len(owners[value]) == 1)}
                            for provider, values, source in provider_types]})
        rows.append(row)
        seen |= types
    return {'levels': rows,
            'increasesExact': increases(ratios),
            'increasesRoundedIntegerPercent': increases(ratios, rounded=True)}


def inventories(pair, rows, dialogues, proposed=False, include_dialogues=False):
    levels = [[] for _ in range(10)]
    for row, source in rows:
        level = row['proposedLevel'] if proposed else source['level']
        texts = [variant['study'] for variant in source['unit']['variants']]
        levels[level-1].append((row['unitId'], texts, source['level']))
    if include_dialogues:
        # Sensitivity scenario only: source dialogues were never reclassified.
        for level, documents in dialogues[pair].items():
            for dialogue in documents:
                levels[level-1].append((dialogue['id'], [turn['study'] for turn in dialogue['turns']], level))
    return levels


def route_statistics(route, canonical, dialogues, detailed=True):
    verified, fields = checked_units(route, canonical)
    pairs = []
    scenarios = (
        ('variantsOnlyCompatibleHypothesis', False, False),
        ('variantsOnlyLegacyTokenizer', False, True),
        ('variantsAndUnmovedDialoguesLegacyTokenizer', True, True),
        ('variantsAndUnmovedDialoguesCompatibleTokenizer', True, False),
    )
    for pair in PAIRS:
        study = pair.split('-')[1]
        units = [(row, source) for pair_id, row, source in verified if pair_id == pair]
        versions = {}
        for name, add_dialogues, legacy in scenarios:
            versions[name] = {
                key: inventory_statistics(inventories(pair, units, dialogues, proposed, add_dialogues),
                                          study, legacy, detailed=detailed and name == scenarios[0][0])
                for key, proposed in (('source', False), ('proposed', True))}
        main = versions[scenarios[0][0]]
        before, after = REVIEW_EDGES[pair]
        expected = {key: [f'L{level}<L{level+1}' for level in edge_levels]
                    for key, edge_levels in (('source', before), ('proposed', after))}
        pairs.append({'pair': pair, 'scenarios': versions,
                      'reviewEdgeList': expected,
                      'roundedEdgesCompatibleWithReview': all(
                          main[key]['increasesRoundedIntegerPercent'] == expected[key]
                          for key in expected)})
    return {'unitCount': len(verified), 'verifiedSourceFields': fields, 'pairs': pairs}


def build_report(root=ROOT, candidate_path=None):
    canonical, hashes = canonical_sources(root)
    raw = git_bytes(root, SNAPSHOT, RUNTIME)
    route = json.loads(raw)
    dialogues = {pair: {
        level: json.loads(git_bytes(root, SOURCE,
                          f'melunga_deploy/content/conversation/L{level}-{pair}.json'))['dialogues']
        for level in range(1, 11)} for pair in PAIRS}
    old_script = git_bytes(root, OLD_SCRIPT_COMMIT, OLD_SCRIPT_PATH)
    report = {
        'version': 1, 'scope': 'distinct-written-surface-types-not-acquisition',
        'reviewedCommit': SNAPSHOT, 'sourceCommit': SOURCE,
        'reviewedRuntimeSha256': hashlib.sha256(raw).hexdigest(),
        'sourceFilesSha256': hashes,
        'legacyScript': {'commit': OLD_SCRIPT_COMMIT, 'path': OLD_SCRIPT_PATH,
                         'sha256': hashlib.sha256(old_script).hexdigest()},
        'method': {
            'status': 'Numerically compatible hypothesis; the new review supplies no executable formula or explicit scope/rounding rule.',
            'mainScope': 'All four whole unit variants; no dialogues, catalogue, model, slot or phonetic field.',
            'ratio': '|distinct types at level minus union of all previous levels| / |distinct types at level|.',
            'latin': "re.findall(r'[^\\W\\d_]+', study.lower(), re.UNICODE); surface letter groups, apostrophe/hyphen boundaries.",
            'cjk': 'For zh/ja/ko, individual Unicode letters/numbers; Hangul syllables in ko, not the legacy word blocks.',
            'rounding': 'Compare exact rational ratios and separately ROUND_HALF_UP integer percentages; no intermediate rounding.',
            'legacyScope': 'Original mesure_briques.py: variants plus dialogue turns; zh/ja U+3040–U+9FFF characters, ko Hangul word blocks, Latin letter groups.',
            'dialogueScenario': 'For sensitivity only, unreclassified dialogues remain at their source level. This is not a proposed integrated dialogue route.',
            'providerCounts': 'A new type appearing in several units is counted once at level and once in each provider; provider counts are not additive.',
            'limits': 'Distinct surface forms are not meanings, structural operations, comprehension or observed mastery. Tokens differ between scripts; do not rank languages. Within-level order is ignored.'},
        'reviewed99478df': route_statistics(route, canonical, dialogues)}
    if candidate_path is not None:
        candidate_raw = Path(candidate_path).read_bytes()
        report['candidate'] = {'path': str(candidate_path), 'sha256': hashlib.sha256(candidate_raw).hexdigest(),
                               **route_statistics(json.loads(candidate_raw), canonical, dialogues)}
    return report


def format_edges(edges):
    return ' · '.join(edges) or '—'


def render_markdown(report):
    checked = report['reviewed99478df']
    lines = ['# Part de types écrits inédits — suivi indépendant', '',
             'Comparaison figée des niveaux source de `bcd108d` et du parcours `99478df`. La nouvelle relecture donne des marches sans préciser son calcul exécutable, son périmètre ou son arrondi : **une hypothèse reproduit numériquement les sept lignes, sans établir que son implémentation est celle de Claude**.', '',
             '## Hypothèse compatible et limites', '',
             'On retient les quatre variantes entières de chaque unité, **sans les dialogues**. Pour les langues latines : groupes de lettres Unicode en minuscules, apostrophes et traits d’union séparateurs. Pour zh/ja/ko : caractères Unicode lettre/nombre ; le coréen est donc découpé en syllabes, alors que l’ancien `mesure_briques.py` conservait les blocs de syllabes. Aucune phonétique ne participe au calcul.', '',
             'À chaque niveau : **types distincts absents de tous les niveaux précédents / types distincts du niveau**. Une répétition ne pèse rien de plus ; toutes les formes du niveau rejoignent ensuite l’ensemble précédent. Le tableau de la relecture est compatible avec la comparaison des pourcentages **arrondis à l’entier**, et non avec les seules fractions exactes.', '',
             'Ces formes de surface ne sont ni des sens, ni des opérations grammaticales, ni des acquis. En coréen une syllabe connue ne prépare pas une terminaison ; en chinois ou japonais des caractères connus ne préparent pas un mot composé. La métrique est sans unité de longueur, mais reste sensible à la segmentation : elle ne classe pas les langues entre elles. L’ordre à l’intérieur d’un niveau n’y change rien.', '',
             '## Marches : comparaison sans et avec arrondi', '',
             '| Couple | Avant, ratios exacts | Après, ratios exacts | Avant, % entiers | Après, % entiers | Compatible avec le tableau |',
             '| --- | --- | --- | --- | --- | --- |']
    for pair in checked['pairs']:
        main = pair['scenarios']['variantsOnlyCompatibleHypothesis']
        lines.append('| ' + ' | '.join([pair['pair'],
            format_edges(main['source']['increasesExact']), format_edges(main['proposed']['increasesExact']),
            format_edges(main['source']['increasesRoundedIntegerPercent']),
            format_edges(main['proposed']['increasesRoundedIntegerPercent']),
            'oui' if pair['roundedEdgesCompatibleWithReview'] else 'non']) + ' |')
    lines += ['', 'Deux marches exactes sont masquées par cet arrondi dans `99478df` : **fr→es L9 = 39/103 = 37,864 % → L10 = 50/130 = 38,462 %** (38 → 38), et **zh→fr L3 = 64/113 = 56,637 % → L4 = 63/111 = 56,757 %** (57 → 57). Leur petite taille ne prouve pas un défaut pédagogique ; il faut seulement rendre le seuil de lecture explicite.', '',
              '## Espagnol et français pour sinophones : numérateurs et dénominateurs', '',
              '| Couple | Niveau | Source : nouveaux / types | `99478df` : nouveaux / types |',
              '| --- | --- | --- | --- |']
    for pair in checked['pairs']:
        if pair['pair'] not in ('fr-es', 'zh-fr'):
            continue
        main = pair['scenarios']['variantsOnlyCompatibleHypothesis']
        for level in range(1, 11):
            a, b = main['source']['levels'][level-1], main['proposed']['levels'][level-1]
            def cell(row):
                return f'{row["newTypeCount"]}/{row["typeCount"]} = {row["percent"]:.3f} %'
            lines.append('| ' + ' | '.join([pair['pair'], f'L{level}', cell(a), cell(b)]) + ' |')
    lines += ['', '**fr→es** : les deux remontées visibles après arrondi restent L3→L4 et L7→L8. Elles subsistent mais leur taille change : **57,282→63,636 %** et **34,579→42,391 %**, contre **61,798→64,762 %** et **35,965→47,727 %** auparavant. Une liste de marches inchangée ne signifie donc pas que toutes les charges sont inchangées. Le JSON donne les types exacts, leur provenance et les contributions non additives des unités pour distinguer nouvelles formes, lexique et construction.', '',
              '**zh→fr** : la remontée visible se déplace de L6→L7 (**37,736→47,170 %**) à L8→L9 (**34,118→35,484 %**). C’est un écart de **1,366 point**, qui appelle l’examen des unités et de leurs opérations, sans chercher à l’effacer mécaniquement.', '',
              '## Sensibilité au périmètre et au découpage', '',
              'Le JSON conserve aussi trois calculs alternatifs : variantes seules avec l’ancien découpage ; variantes + dialogues restés à leur niveau source avec l’ancien découpage ; même périmètre étendu avec le découpage compatible. Les dialogues n’ayant pas de reclassement dans ce lot, leur maintien au niveau source est seulement un scénario de sensibilité. Il ne décrit pas une progression de dialogues prête à publier.', '',
              '| Couple | Ancien découpage, variantes seules : avant → après | Ancienne mesure avec dialogues non déplacés : avant → après |',
              '| --- | --- | --- |']
    for pair in checked['pairs']:
        cells = []
        for scenario in ('variantsOnlyLegacyTokenizer', 'variantsAndUnmovedDialoguesLegacyTokenizer'):
            series = pair['scenarios'][scenario]
            cells.append(format_edges(series['source']['increasesRoundedIntegerPercent']) + ' → '
                         + format_edges(series['proposed']['increasesRoundedIntegerPercent']))
        lines.append('| ' + ' | '.join([pair['pair'], *cells]) + ' |')
    lines += ['', f'{checked["unitCount"]} unités, 3 364 variantes et {checked["verifiedSourceFields"]} champs conformes aux sources figées sont contrôlés avant le calcul. Les empreintes des 70 fichiers actifs, du parcours et du script ancien figurent dans le JSON. Aucune source, phonétique, affectation de niveau ou donnée d’exécution n’est modifiée par cet audit.', '']
    if 'candidate' in report:
        lines += ['## Candidat supplémentaire', '',
                  'Le candidat est mesuré séparément et conserve la référence figée ci-dessus. Son empreinte figure dans le JSON.', '',
                  '| Couple | Marches exactes `99478df` → candidat | Marches après arrondi `99478df` → candidat |',
                  '| --- | --- | --- |']
        by_pair = {pair['pair']: pair for pair in checked['pairs']}
        for pair in report['candidate']['pairs']:
            old = by_pair[pair['pair']]['scenarios']['variantsOnlyCompatibleHypothesis']['proposed']
            new = pair['scenarios']['variantsOnlyCompatibleHypothesis']['proposed']
            cells = [format_edges(old[key]) + ' → ' + format_edges(new[key])
                     for key in ('increasesExact', 'increasesRoundedIntegerPercent')]
            lines.append('| ' + ' | '.join([pair['pair'], *cells]) + ' |')
        lines.append('')
    return '\n'.join(lines)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--candidate-file', type=Path)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    report = build_report(candidate_path=args.candidate_file)
    outputs = {ROOT / OUTPUT.with_suffix('.json'): json.dumps(report, ensure_ascii=False, indent=2) + '\n',
               ROOT / OUTPUT.with_suffix('.md'): render_markdown(report)}
    for path, data in outputs.items():
        if args.check:
            require(path.exists() and path.read_text(encoding='utf-8') == data, f'Stale report: {path}')
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(data, encoding='utf-8')
    summary = report['reviewed99478df']
    print(json.dumps({'units': summary['unitCount'], 'sourceFields': summary['verifiedSourceFields'],
                      'compatibleRoundedPairs': sum(pair['roundedEdgesCompatibleWithReview'] for pair in summary['pairs']),
                      'candidate': 'candidate' in report}, ensure_ascii=False))


if __name__ == '__main__':
    main()
