#!/usr/bin/env python3
"""Compile the reviewed-by-unit curriculum proposal without changing sources."""
import argparse
from copy import deepcopy
import hashlib
import json
from pathlib import Path
import subprocess
import sys

from preparations_es import apply_overlay, load_overlay, validate_overlay_unit

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[2]
BASE = 'bcd108dff5c5931f935f70f694a040d235403b64'
PAIRS = ('fr-en', 'fr-es', 'fr-it', 'fr-zh', 'fr-ja', 'fr-ko', 'zh-fr')
EDITORIAL = ('editorial-en-es.json', 'editorial-ko-it.json', 'editorial-zh-ja.json', 'editorial-zh-fr.json')
DIRECTORY = Path('docs/progression-corrections')
OUTPUT = DIRECTORY / 'parcours-corriges.json'
REPORT = DIRECTORY / 'corrections.md'
TITLES = ('Entrer dans l’échange', 'Préciser son intention', 'Faire circuler la parole',
          'Parler de sa vie', 'Raconter un événement', 'Organiser ensemble',
          'Expliquer un choix', 'Adapter et négocier', 'Résoudre un imprévu', 'Converser avec souplesse')


def require(condition, message):
    if not condition:
        raise ValueError(message)


def load(path):
    return json.loads(path.read_text(encoding='utf-8'))


def verify_sources(root=ROOT):
    """Guard the full 110-file reserve and app, not just the selected phrases."""
    paths = subprocess.check_output(['git', '-C', str(root), 'ls-tree', '-r', '--name-only', BASE,
                                     'melunga_deploy/content/conversation'], text=True).splitlines()
    paths = [path for path in paths if Path(path).name.startswith('L') and path.endswith('.json')]
    require(len(paths) == 110, 'The immutable source snapshot must contain 110 level files')
    paths.append('melunga_deploy/app.html')
    hashes = {}
    for name in paths:
        baseline = subprocess.check_output(['git', '-C', str(root), 'show', f'{BASE}:{name}'])
        current = (root / name).read_bytes()
        require(current == baseline, f'Protected source changed: {name}')
        hashes[name] = hashlib.sha256(current).hexdigest()
    return hashes


def sources(root=ROOT):
    result = {}
    for pair in PAIRS:
        units = {}
        for level in range(1, 11):
            file = f'melunga_deploy/content/conversation/L{level}-{pair}.json'
            data = load(root / file)
            native, study = pair.split('-')
            require(data['nativeLanguage'] == native and data['studyLanguage'] == study
                    and data['level'] == level, f'Source pair or level mismatch: {file}')
            for unit in data['units']:
                require(unit['id'] not in units, f'Duplicate source unit: {unit["id"]}')
                units[unit['id']] = (level, file, unit)
        result[pair] = units
    return result


def copy_phrase(file, unit_id, index, variant):
    # slot is not an utterance; every actual source aid stays exact and present.
    return {'id': f'{Path(file).name}:{unit_id}:v{index}',
            **deepcopy({key: value for key, value in variant.items() if key != 'slot'})}


def steps_for(unit):
    steps, prepared = [], set()
    def preparation(indices):
        return [{'utteranceId': unit['phrases'][i]['id'],
                 'understoodInStep': f'{unit["unitId"]}-understand-{i}',
                 'imitatedInStep': f'{unit["unitId"]}-imitate-{i}'} for i in indices]
    comparison = unit['firstSubstitution']
    compared = False
    for index in unit['variantOrder']:
        for support in unit.get('preparations', []):
            if support['beforeVariantIndex'] != index:
                continue
            for kind, id_field in (('understand', 'understoodInStep'),
                                   ('imitate', 'imitatedInStep')):
                steps.append({'id': support[id_field], 'kind': kind,
                              'utterance': support['phrase']['id'],
                              'preparationId': support['id'], 'wholePhrase': True,
                              'requiresProduction': kind == 'imitate'})
        phrase_id = unit['phrases'][index]['id']
        for kind in ('understand', 'imitate'):
            steps.append({'id': f'{unit["unitId"]}-{kind}-{index}', 'kind': kind,
                          'utterance': phrase_id, 'wholePhrase': True,
                          'requiresProduction': kind == 'imitate'})
        prepared.add(index)
        if comparison and not compared and set(comparison['variants']) <= prepared:
            steps.append({'id': f'{unit["unitId"]}-compare', 'kind': 'compare',
                          'choices': [unit['phrases'][i]['id'] for i in comparison['variants']],
                          'preparedChoices': preparation(comparison['variants']),
                          'wholePhrase': True, 'requiresProduction': False})
            compared = True
    steps.append({'id': f'{unit["unitId"]}-choose', 'kind': 'choose-and-recall',
                  'choices': [unit['phrases'][i]['id'] for i in unit['variantOrder']],
                  'preparedChoices': preparation(unit['variantOrder']),
                  'wholePhrase': True, 'requiresProduction': True,
                  'canRestoreHelp': True, 'gradesOrUnlocks': False})
    return steps


def editorial_rows(root=ROOT):
    result = {}
    for filename in EDITORIAL:
        data = load(root / DIRECTORY / filename)
        entries = data.get('pairs', [data] if 'pair' in data else [])
        for entry in entries:
            pair = entry['pair']
            require(pair in PAIRS and pair not in result, f'Unexpected or duplicate editorial pair: {pair}')
            result[pair] = entry
    require(set(result) == set(PAIRS), 'Editorial plans must cover exactly seven active pairs')
    return result


def validate_runtime(plan, root=ROOT):
    canonical = sources(root)
    overlay = load_overlay(root)
    editorial = {unit['unitId']: unit for pair in editorial_rows(root).values()
                 for unit in pair['units']}
    require(plan.get('version') == 1 and plan.get('sourceSnapshot') == BASE,
            'Wrong source snapshot')
    require(plan.get('doesNotMeasureAcquisition') is True and plan.get('publicationApproved') is False,
            'This plan must not certify acquisition or approve publication')
    require(plan.get('status') == 'editorial-candidate-not-published'
            and plan.get('nativeReview') == {'status': 'pending'}
            and plan.get('doesNotChangeAccess') is True,
            'Review and access status must remain explicit')
    require(plan.get('sourceFilesSha256') == verify_sources(root), 'Source manifest is not the protected snapshot')
    require([pair['id'] for pair in plan['pairs']] == list(PAIRS), 'Wrong active pair scope')
    total = 0
    for pair in plan['pairs']:
        pair_id = pair['id']
        require(pair_id == pair['nativeLanguage'] + '-' + pair['studyLanguage'], 'Reader mismatch')
        require([level['level'] for level in pair['levels']] == list(range(1, 11)), 'Ten proposed levels required')
        rows = [unit for level in pair['levels'] for unit in level['units']]
        ids = [row['unitId'] for row in rows]
        require(len(set(ids)) == len(ids) and set(ids) == set(canonical[pair_id]),
                f'Every source unit must occur exactly once: {pair_id}')
        positions = {row['unitId']: index for index, row in enumerate(rows)}
        for level in pair['levels']:
            require(level['units'], f'Empty proposed level: {pair_id} L{level["level"]}')
            require([unit['order'] for unit in level['units']] == list(range(1, len(level['units']) + 1)),
                    f'Unit orders must be contiguous: {pair_id} L{level["level"]}')
            for unit in level['units']:
                uid = unit['unitId']
                source_level, file, original = canonical[pair_id][uid]
                require(unit['sourceLevel'] == source_level and unit['proposedLevel'] == level['level'],
                        f'Source and proposed levels must remain distinct: {uid}')
                require((source_level == 1) == (unit['proposedLevel'] == 1), f'L1 boundary changed: {uid}')
                require(unit['source'] == {'file': file, 'unitId': uid, 'level': source_level}, f'Source locator mismatch: {uid}')
                require(unit['access'] == {'sourceLevel': source_level, 'mode': 'unchanged'}, f'Access changed: {uid}')
                require(sorted(unit['variantOrder']) == [0, 1, 2, 3], f'Four variants must be retained: {uid}')
                require(unit['phrases'] == [copy_phrase(file, uid, i, variant)
                                           for i, variant in enumerate(original['variants'])], f'Exact phrase or aids changed: {uid}')
                validate_overlay_unit(unit, editorial[uid], overlay)
                require(isinstance(unit['focus'], str) and unit['focus'] and unit['rationale'], f'Missing editorial decision: {uid}')
                require(isinstance(unit['gaps'], list) and isinstance(unit['plannedPrerequisites'], list), f'Missing explicit gaps/dependencies: {uid}')
                require(len(set(unit['plannedPrerequisites'])) == len(unit['plannedPrerequisites']), f'Duplicate prerequisite: {uid}')
                for previous in unit['plannedPrerequisites']:
                    require(previous in positions and positions[previous] < positions[uid],
                            f'Prerequisite must precede its use within the same pair: {uid} -> {previous}')
                comparison = unit['firstSubstitution']
                require(unit['presentation'] in ('whole-expression', 'one-change'), f'Unknown presentation: {uid}')
                require((comparison is not None) == (unit['presentation'] == 'one-change'), f'Comparison/presentation mismatch: {uid}')
                if comparison:
                    indices = comparison['variants']
                    require(len(indices) == 2 and len(set(indices)) == 2 and all(i in range(4) for i in indices), f'Invalid comparison references: {uid}')
                    require(comparison['additionalOperations'] == [] and comparison['invariant'] and comparison['changedPart'],
                            f'A first substitution cannot hide additional operations: {uid}')
                    model = original['model']['study']
                    require(model.count('{s}') == 1, f'No single stable source frame: {uid}')
                    prefix, suffix = model.split('{s}')
                    for i in indices:
                        variant = original['variants'][i]
                        require(variant['study'] == prefix + variant['slot']['study'] + suffix,
                                f'Declared comparison changes the written source frame: {uid} v{i}')
                require(unit['steps'] == steps_for(unit), f'Preparation must precede comparison/choice: {uid}')
                total += 1
    require(total == 841, f'Expected all 841 active units, got {total}')


def build(root=ROOT):
    hashes = verify_sources(root)
    canonical = sources(root)
    decisions = editorial_rows(root)
    overlay = load_overlay(root)
    plan = {'version': 1, 'status': 'editorial-candidate-not-published', 'sourceSnapshot': BASE,
            'doesNotMeasureAcquisition': True, 'publicationApproved': False,
            'doesNotChangeAccess': True, 'nativeReview': {'status': 'pending'},
            'phoneticPolicy': 'exact-whole-source-copy-no-normalization',
            'sourceFilesSha256': hashes, 'pairs': []}
    for pair_id in PAIRS:
        native, study = pair_id.split('-')
        levels = [{'level': n, 'title': TITLES[n-1], 'units': []} for n in range(1, 11)]
        for decision in decisions[pair_id]['units']:
            row = apply_overlay(deepcopy(decision), overlay)
            source_level, file, original = canonical[pair_id][row['unitId']]
            row['source'] = {'file': file, 'unitId': row['unitId'], 'level': source_level}
            row['situation'] = original['situation']
            row['access'] = {'sourceLevel': source_level, 'mode': 'unchanged'}
            row['phrases'] = [copy_phrase(file, row['unitId'], i, variant) for i, variant in enumerate(original['variants'])]
            row['steps'] = steps_for(row)
            levels[row['proposedLevel']-1]['units'].append(row)
        for level in levels:
            level['units'].sort(key=lambda unit: unit['order'])
        plan['pairs'].append({'id': pair_id, 'nativeLanguage': native, 'studyLanguage': study,
                              'notes': decisions[pair_id].get('notes', []), 'levels': levels})
    units = [unit for pair in plan['pairs'] for level in pair['levels'] for unit in level['units']]
    preparation_ids = {support['phrase']['id'] for unit in units
                       for support in unit.get('preparations', [])}
    plan['counts'] = {'pairs': len(PAIRS), 'levelCells': 70, 'units': len(units), 'phrases': 4 * len(units),
                      'movedUnits': sum(unit['sourceLevel'] != unit['proposedLevel'] for unit in units),
                      'declaredFirstSubstitutions': sum(unit['firstSubstitution'] is not None for unit in units),
                      'wholeExpressionUnits': sum(unit['firstSubstitution'] is None for unit in units),
                      'plannedPrerequisiteLinks': sum(len(unit['plannedPrerequisites']) for unit in units),
                      'reportedGaps': sum(len(unit['gaps']) for unit in units),
                      'existingCataloguePreparations': len(preparation_ids),
                      'totalPresentedUtterances': 4 * len(units) + len(preparation_ids),
                      'newlyAuthoredStudyPhrases': 0, 'newlyAuthoredPhoneticAids': 0}
    validate_runtime(plan, root)
    return plan


def render_report(plan):
    counts = plan['counts']
    lines = ['# Classement proposé des 841 unités L1–L10', '',
             'Proposition éditoriale pour revue croisée. Aucun contenu canonique, numéro source, droit ou site publié n’est modifié.', '',
             f'{counts["units"]} unités, {counts["phrases"]} variantes entières, 70 cases, {counts["movedUnits"]} déplacements proposés entre niveaux payants.',
             f'{counts["declaredFirstSubstitutions"]} premières comparaisons à cadre écrit conservé ; {counts["wholeExpressionUnits"]} unités préparées comme expressions entières.',
             f'{counts["existingCataloguePreparations"]} supports entiers préexistants du catalogue sont proposés avant leurs variantes cibles ; {counts["totalPresentedUtterances"]} énoncés sourcés au total. Aucune phrase ni aide phonétique n’est nouvellement rédigée.',
             'L’identité écrite du cadre ne démontre pas à elle seule une opération linguistique simple : ce point reste soumis à relecture.', '',
             'Les prérequis décrivent un ordre prévu. Ils ne déclarent pas ce que l’apprenant sait. Les dialogues ne sont pas automatiquement reclassés avec les unités ; leur préparation et leur pertinence restent à relire séparément.', '',
             '| Couple | L1 | L2 | L3 | L4 | L5 | L6 | L7 | L8 | L9 | L10 | Déplacements |',
             '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |']
    for pair in plan['pairs']:
        rows = [unit for level in pair['levels'] for unit in level['units']]
        values = [str(len(level['units'])) for level in pair['levels']]
        lines.append('| ' + pair['id'] + ' | ' + ' | '.join(values) + ' | ' + str(sum(u['sourceLevel'] != u['proposedLevel'] for u in rows)) + ' |')
    for pair in plan['pairs']:
        lines += ['', f'## {pair["id"]}', '']
        for level in pair['levels']:
            lines += [f'### L{level["level"]} — {level["title"]}', '']
            for unit in level['units']:
                move = f' (source L{unit["sourceLevel"]} → proposé L{unit["proposedLevel"]})' if unit['sourceLevel'] != unit['proposedLevel'] else ''
                lines.append(f'- `{unit["unitId"]}`{move} — {unit["focus"]}. {unit["rationale"]}')
                for support in unit.get('preparations', []):
                    lines.append(f'  - Préparation catalogue `{support["source"]["collection"]}[{support["source"]["index"]}]` avant v{support["beforeVariantIndex"]} : « {support["phrase"]["study"]} » ; compréhension puis imitation proposées. {support["rationale"]}')
                for gap in unit['gaps']:
                    lines.append(f'  - À préparer / relire : {gap}')
    return '\n'.join(lines) + '\n'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    plan = build()
    outputs = {OUTPUT: json.dumps(plan, ensure_ascii=False, indent=2) + '\n', REPORT: render_report(plan)}
    for path, content in outputs.items():
        destination = ROOT / path
        if args.check:
            require(destination.exists() and destination.read_text(encoding='utf-8') == content, f'Generated file out of date: {path}')
        else:
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_text(content, encoding='utf-8')
    print(json.dumps(plan['counts'], ensure_ascii=False))


if __name__ == '__main__':
    main()
