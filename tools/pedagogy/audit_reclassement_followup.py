#!/usr/bin/env python3
"""Replay descriptive length indicators on immutable 99478df; never rank lessons.

The indicators below count text. They do not measure grammatical difficulty,
prepared vocabulary, comprehension, acquisition, or CEFR level.
"""
import argparse
from collections import Counter, defaultdict
from decimal import Decimal, ROUND_HALF_UP
from fractions import Fraction
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys
import unicodedata

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[2]
SNAPSHOT = '99478dfd515c7498a71209d5316ad702313789bb'
SOURCE = 'bcd108dff5c5931f935f70f694a040d235403b64'
RUNTIME = 'docs/progression-corrections/parcours-corriges.json'
OUTPUT = Path('docs/progression-corrections/suivi-relecture/mesures')
PAIRS = ('fr-en', 'fr-es', 'fr-it', 'fr-zh', 'fr-ja', 'fr-ko', 'zh-fr')
CJK = {'zh', 'ja', 'ko'}


def require(value, message):
    if not value:
        raise ValueError(message)


def git_bytes(root, commit, path):
    return subprocess.check_output(['git', '-C', str(root), 'show', f'{commit}:{path}'])


def length(text, study):
    """Compatible with all reported source L6-L8 means, without normalisation."""
    if study in CJK:
        return sum(unicodedata.category(char)[0] in 'LN' for char in text)
    return len(re.findall(r'\w+', text, re.UNICODE))


def mean(values):
    values = list(values)
    require(values, 'A mean needs observations')
    return Fraction(sum(values), len(values))


def decimal_tenth(value):
    """Explicit rounding rule; Python binary float round is not used."""
    return (Decimal(value.numerator) / Decimal(value.denominator)).quantize(
        Decimal('0.1'), rounding=ROUND_HALF_UP)


def fraction_record(value):
    return {'numerator': value.numerator, 'denominator': value.denominator,
            'decimal': float(value), 'roundedHalfUpTenth': str(decimal_tenth(value))}


def inversions(means, rounded=False):
    compare = {level: decimal_tenth(value) if rounded else value for level, value in means.items()}
    return [f'L{level}>L{level+1}' for level in range(1, 10)
            if compare[level] > compare[level+1]]


def canonical_sources(root=ROOT):
    index, hashes = {}, {}
    for pair in PAIRS:
        for level in range(1, 11):
            path = f'melunga_deploy/content/conversation/L{level}-{pair}.json'
            raw = git_bytes(root, SOURCE, path)
            hashes[path] = hashlib.sha256(raw).hexdigest()
            document = json.loads(raw)
            for unit in document['units']:
                require(unit['id'] not in index, 'Duplicate source unit')
                index[unit['id']] = {'pair': pair, 'level': level, 'file': path, 'unit': unit}
    require(len(index) == 841, 'Expected all 841 active source units')
    return index, hashes


def checked_units(route, canonical):
    require([pair['id'] for pair in route['pairs']] == list(PAIRS), 'Wrong active pair scope')
    seen, rows, fields = set(), [], 0
    for pair in route['pairs']:
        require(pair['id'] == pair['nativeLanguage'] + '-' + pair['studyLanguage'], 'Reader mismatch')
        for level in pair['levels']:
            for row in level['units']:
                uid = row['unitId']
                require(uid in canonical and uid not in seen, f'Unknown or duplicate unit: {uid}')
                seen.add(uid)
                source = canonical[uid]
                require(source['pair'] == pair['id'] and source['level'] == row['sourceLevel'],
                        f'Wrong pair/source level: {uid}')
                require(row['proposedLevel'] == level['level'], f'Wrong proposed level: {uid}')
                require(len(row['phrases']) == len(source['unit']['variants']) == 4,
                        f'Expected four exact variants: {uid}')
                for index, (copy, variant) in enumerate(zip(row['phrases'], source['unit']['variants'])):
                    expected = {key: value for key, value in variant.items() if key != 'slot'}
                    require({key: value for key, value in copy.items() if key != 'id'} == expected,
                            f'Source fields changed: {uid}:v{index}')
                    expected_id = f'{Path(source["file"]).name}:{uid}:v{index}'
                    require(copy['id'] == expected_id, f'Wrong phrase id: {uid}:v{index}')
                    fields += len(expected)
                rows.append((pair['id'], row, source))
    require(seen == set(canonical), 'Incomplete source coverage')
    return rows, fields


def unit_description(pair, row, source):
    study = pair.split('-')[1]
    variants = source['unit']['variants']
    whole = [length(variant['study'], study) for variant in variants]
    model = source['unit']['model']['study']
    fixed = slots = residual = None
    literal = False
    if model.count('{s}') == 1:
        prefix, suffix = model.split('{s}')
        literal = all(variant['study'] == prefix + variant['slot']['study'] + suffix for variant in variants)
        if literal:
            fixed = length(prefix, study) + length(suffix, study)
            slots = mean(length(variant['slot']['study'], study) for variant in variants)
            residual = mean(whole) - fixed - slots
    return {'unitId': row['unitId'], 'sourceLevel': row['sourceLevel'],
            'proposedLevel': row['proposedLevel'], 'order': row['order'],
            'focus': row['focus'], 'meanLength': fraction_record(mean(whole)),
            'variantLengths': whole, 'example': {key: variants[0][key] for key in ('study', 'native')},
            'fixedFrame': {'allFourMatchSourceTemplate': literal,
                           'fixedLength': fixed,
                           'meanSlotLength': fraction_record(slots) if slots is not None else None,
                           'additivityResidual': fraction_record(residual) if residual is not None else None},
            'presentation': row['presentation'], 'rationale': row['rationale'],
            'gaps': row['gaps']}


def route_statistics(route, canonical):
    rows, fields = checked_units(route, canonical)
    pairs = []
    focus_levels = {'fr-es': {2, 3, 4, 6, 7, 8}, 'fr-it': {2, 3, 4, 6, 7, 8},
                    'fr-en': {6, 7}, 'fr-ko': {5, 6}, 'fr-zh': {8, 9}}
    for pair_id in PAIRS:
        by_source, by_proposal = defaultdict(list), defaultdict(list)
        members = [(row, source) for pair, row, source in rows if pair == pair_id]
        for row, source in members:
            description = unit_description(pair_id, row, source)
            by_source[row['sourceLevel']].append(description)
            by_proposal[row['proposedLevel']].append(description)
        means = {}
        level_rows = {}
        for name, groups in [('source', by_source), ('proposed', by_proposal)]:
            means[name], level_rows[name] = {}, []
            for level in range(1, 11):
                units = groups[level]
                values = [value for unit in units for value in unit['variantLengths']]
                average = mean(values)
                means[name][level] = average
                level_rows[name].append({'level': level, 'unitCount': len(units),
                                         'variantCount': len(values), 'totalLength': sum(values),
                                         'mean': fraction_record(average),
                                         'sourceLevelMix': dict(sorted(Counter(unit['sourceLevel'] for unit in units).items())),
                                         'unitIds': [unit['unitId'] for unit in units]})
        edge_sets = {}
        for name, rounded in [('rawExactMeans', False), ('roundedHalfUpTenths', True)]:
            before, after = inversions(means['source'], rounded), inversions(means['proposed'], rounded)
            edge_sets[name] = {'before': before, 'after': after,
                               'created': sorted(set(after) - set(before)),
                               'removed': sorted(set(before) - set(after))}
        contributors = {}
        for level in sorted(focus_levels.get(pair_id, set())):
            units = sorted(by_proposal[level], key=lambda unit: unit['order'])
            source_here = {unit['unitId'] for unit in by_source[level]}
            contributors[f'L{level}'] = {'incoming': [unit['unitId'] for unit in units if unit['sourceLevel'] != level],
                                         'outgoing': [unit['unitId'] for unit in by_source[level] if unit['proposedLevel'] != level],
                                         'retained': [unit['unitId'] for unit in units if unit['unitId'] in source_here],
                                         'units': units}
        pairs.append({'pair': pair_id, 'lengthUnit': 'Unicode letters/numbers' if pair_id.split('-')[1] in CJK else 'Unicode word tokens; apostrophes split',
                      'source': level_rows['source'], 'proposed': level_rows['proposed'],
                      'inversions': edge_sets, 'targetedContributors': contributors})
    totals = {}
    for method in ('rawExactMeans', 'roundedHalfUpTenths'):
        totals[method] = {key: sum(len(pair['inversions'][method][key]) for pair in pairs)
                          for key in ('before', 'after', 'created', 'removed')}
    return {'verifiedSourceFields': fields, 'unitCount': len(rows), 'pairs': pairs, 'totals': totals}


def build_report(root=ROOT, candidate_path=None):
    canonical, hashes = canonical_sources(root)
    frozen_raw = git_bytes(root, SNAPSHOT, RUNTIME)
    frozen = json.loads(frozen_raw)
    report = {'version': 1, 'scope': 'descriptive-text-length-not-difficulty-or-acquisition',
              'reviewedCommit': SNAPSHOT, 'sourceCommit': SOURCE,
              'reviewedRuntimeSha256': hashlib.sha256(frozen_raw).hexdigest(),
              'activeSourceFilesSha256': hashes,
              'method': {
                  'observations': 'Every one of four whole source variants of every unit; equal weight per variant.',
                  'latin': 'len(re.findall(r"\\w+", study, re.UNICODE)); apostrophes and hyphens split tokens. No normalisation.',
                  'cjk': 'Number of characters whose Unicode general category starts L or N; spaces and punctuation excluded.',
                  'means': 'Exact rational total/variantCount; never average rounded unit means.',
                  'rawInversion': 'Exact rational mean(Ln) > exact rational mean(Ln+1).',
                  'roundedInversion': 'Round each exact mean to one decimal by Decimal ROUND_HALF_UP, then compare.',
                  'roundingCaution': 'The review does not state its rounding/comparison rule. Reported 21→16 is reproducible after explicit tenth-rounding; exact means yield 21→17.',
                  'interpretation': 'These counts reproduce descriptive lengths, not grammatical difficulty or whether a prerequisite was prepared. No route is optimised by this indicator.'},
              'reviewed99478df': route_statistics(frozen, canonical)}
    if candidate_path is not None:
        raw = Path(candidate_path).read_bytes()
        report['candidate'] = {'path': str(candidate_path), 'sha256': hashlib.sha256(raw).hexdigest(),
                               **route_statistics(json.loads(raw), canonical)}
    return report


def render_markdown(report):
    result = report['reviewed99478df']
    raw, rounded = result['totals']['rawExactMeans'], result['totals']['roundedHalfUpTenths']
    lines = ['# Mesures de longueur après reclassement — suivi indépendant', '',
             'La [seconde relecture de Claude](verification-claude-corrigee.md) retire les griefs fondés sur les marches de longueur en italien, anglais et coréen. Ce relevé reste une annexe descriptive ; la demande actuelle porte sur la [nouveauté écrite](nouveaute.md) en fr→es et zh→fr.', '',
             'Périmètre figé : `99478df`, comparé aux niveaux source de `bcd108d`. Les phrases et leurs aides sont relues contre Git ; aucun fichier canonique ou plan n’est modifié par cet outil.', '',
             '**La longueur ne mesure ni la difficulté grammaticale, ni la préparation lexicale, ni les acquis.** Les différences ci-dessous servent à expliquer le lot, pas à obtenir une courbe artificiellement croissante.', '',
             '## Formule et arrondi', '',
             'Chaque variante entière compte une fois. Pour en/es/it/fr, les groupes Unicode `\\w+` sont comptés : une apostrophe sépare des tokens. Pour zh/ja/ko, les caractères de catégorie Unicode lettre/nombre sont comptés, sans espaces ni ponctuation. Le stock ne contient pas de chiffres dans les variantes latines ; compter seulement les groupes de lettres donne donc les mêmes résultats sur ce corpus.', '',
             f'- Moyennes exactes non arrondies : **{raw["before"]} → {raw["after"]}** inversions, avec {raw["created"]} nouvelles et {raw["removed"]} supprimées.',
             f'- Comparaison après arrondi mathématique au dixième (`ROUND_HALF_UP`) : **{rounded["before"]} → {rounded["after"]}**, avec {rounded["created"]} nouvelles et {rounded["removed"]} supprimées.',
             '- L’écart vient de fr→ko L2 = **7,0625** et L3 = **7,05** : 7,0625 > 7,05 exactement, mais les deux deviennent 7,1 avec l’arrondi indiqué. Le seuil/arrondi de la revue n’étant pas explicité, les deux résultats sont conservés.',
             '- Le tableau de la revue fait aussi apparaître **fr→zh L8>L9**, nouvelle par rapport à sa liste source. Les deux marches demandées en en/ko sont examinées sans écarter celle-ci.', '',
             '## Comparaison des inversions', '',
             '| Couple | Avant, moyennes exactes | Après, moyennes exactes | Créées | Après arrondi au dixième |',
             '| --- | --- | --- | --- | --- |']
    for pair in result['pairs']:
        edges = pair['inversions']['rawExactMeans']
        rounded_edges = pair['inversions']['roundedHalfUpTenths']['after']
        lines.append('| ' + ' | '.join([pair['pair'], ' · '.join(edges['before']) or '—',
                                       ' · '.join(edges['after']) or '—', ' · '.join(edges['created']) or '—',
                                       ' · '.join(rounded_edges) or '—']) + ' |')
    lines += ['', '## Moyennes L6, L7, L8', '',
              '| Couple | Sources L6 → L7 → L8 | Proposé L6 → L7 → L8 |', '| --- | --- | --- |']
    for pair in result['pairs']:
        series = []
        for key in ('source', 'proposed'):
            series.append(' → '.join(f'{pair[key][level-1]["mean"]["decimal"]:.4f}' for level in (6, 7, 8)))
        lines.append('| ' + ' | '.join([pair['pair'], *series]) + ' |')
    lines += ['', '## Contributions des unités', '',
              'Le JSON joint donne pour es/it L2–L4 et L6–L8, en L6–L7, ko L5–L6 et zh L8–L9 : unités entrantes/sortantes/conservées, quatre longueurs, moyenne exacte, exemple étudié et sens source, raison de placement et réserves. Quand les quatre variantes reconstruisent le cadre source, les longueurs du cadre fixe et du groupe sont aussi distinguées. Cette décomposition est textuelle, pas une analyse de difficulté grammaticale.', '',
              f'{result["unitCount"]} unités et {result["verifiedSourceFields"]} champs source conformes vérifiés. Les 70 fichiers sources actifs sont figés par leurs empreintes. Les 40 fichiers de réserve restent hors de ces calculs ; la garde de corpus générale les contrôle séparément.', '',
              'Les analyses par langue doivent justifier les placements par les constructions et leurs prérequis, et signaler ce que la mesure ne résout pas. Ces statistiques ne justifient ni de remonter une formule utile seulement parce qu’elle est courte, ni de descendre un récit complexe pour aplanir L7.', '']
    if 'candidate' in report:
        lines += ['## Candidat fourni séparément', '',
                  'Un candidat supplémentaire a été mesuré sans remplacer les résultats figés ci-dessus. Son empreinte figure dans le JSON. Les différences restent des longueurs descriptives, pas des scores de difficulté.', '',
                  '| Couple | Inversions dans `99478df`, moyennes exactes | Inversions du candidat, moyennes exactes | Candidat L6 → L7 → L8 |',
                  '| --- | --- | --- | --- |']
        frozen = {pair['pair']: pair for pair in result['pairs']}
        for pair in report['candidate']['pairs']:
            source_edges = frozen[pair['pair']]['inversions']['rawExactMeans']['after']
            new_edges = pair['inversions']['rawExactMeans']['after']
            values = ' → '.join(f'{pair["proposed"][level-1]["mean"]["decimal"]:.4f}' for level in (6, 7, 8))
            lines.append('| ' + ' | '.join([pair['pair'], ' · '.join(source_edges) or '—',
                                           ' · '.join(new_edges) or '—', values]) + ' |')
        candidate_totals = report['candidate']['totals']
        lines += ['', 'Totaux du candidat : ' + str(candidate_totals['rawExactMeans']['after'])
                  + ' inversions sur moyennes exactes ; '
                  + str(candidate_totals['roundedHalfUpTenths']['after'])
                  + ' après arrondi mathématique au dixième. Aucune suppression ou création ne constitue à elle seule une validation pédagogique.', '']
    return '\n'.join(lines)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    parser.add_argument('--candidate-file', type=Path)
    args = parser.parse_args()
    report = build_report(candidate_path=args.candidate_file)
    outputs = {OUTPUT.with_suffix('.json'): json.dumps(report, ensure_ascii=False, indent=2) + '\n',
               OUTPUT.with_suffix('.md'): render_markdown(report)}
    for relative, content in outputs.items():
        path = ROOT / relative
        if args.check:
            require(path.exists() and path.read_text(encoding='utf-8') == content, f'Out-of-date report: {relative}')
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content, encoding='utf-8')
    print(json.dumps({'reviewedCommit': SNAPSHOT, **report['reviewed99478df']['totals']}, ensure_ascii=False))


if __name__ == '__main__':
    main()
