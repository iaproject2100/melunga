#!/usr/bin/env python3
"""Inventory the local theme photos and their distinct, reusable atlas cells."""
import argparse
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DOCS = ROOT / 'docs/niveaux-progressifs'
OUTPUT = DOCS / 'visuels.json'


def make():
    plan = json.loads((DOCS / 'plan-themes.json').read_text())
    originals = {row['level']: row for row in json.loads((DOCS / 'visuels-sources.json').read_text())['sources']}
    levels, themes, slots, visual_ids = [], [], set(), set()
    for level in plan['levels']:
        number = level['level']
        asset = 'assets/theme-scenes.webp' if number == 1 else f'assets/theme-scenes-L{number}.webp'
        path = ROOT / 'melunga_deploy' / asset
        assert path.is_file(), asset
        levels.append({'level': number, 'asset': asset, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
                       'bytes': path.stat().st_size, 'columns': 3, 'rows': 4, 'original': originals[number],
                       'ownerApproved': number == 1})
        assert len(level['themes']) == 11
        for index, theme in enumerate(level['themes']):
            slot = (asset, index % 3, index // 3)
            assert slot not in slots and theme['visualId'] not in visual_ids
            slots.add(slot)
            visual_ids.add(theme['visualId'])
            themes.append({'level': number, 'themeId': theme['id'], 'visualId': theme['visualId'],
                           'asset': asset, 'column': index % 3, 'row': index // 3,
                           'brief': theme['visualBrief'], 'ownerApproved': number == 1})
    assert len(levels) == 10 and len(themes) == 110
    assert levels[0]['sha256'] == 'ba431628deddbaafa34384b196c1f3428d606673662681a3835c4b92fe5d7a1c'
    assert len({row['sha256'] for row in levels}) == 10
    vocabulary = json.loads((DOCS / 'visuels-vocabulaire-sources.json').read_text())
    families = vocabulary['familyOrder']
    assert families == ['vocab-restaurant', 'vocab-maison', 'vocab-voyage', 'vocab-personnes',
                        'vocab-reperes', 'vocab-actions', 'vocab-travail', 'nombres']
    lexical_atlases = []
    for atlas in vocabulary['atlases']:
        path = ROOT / 'melunga_deploy' / atlas['asset']
        assert hashlib.sha256(path.read_bytes()).hexdigest() == atlas['sha256']
        assert path.stat().st_size == atlas['bytes']
        assert len(atlas['levels']) == 2 and atlas['columns'] == atlas['rows'] == 4
        lexical_atlases.append(atlas)
        for offset, number in enumerate(atlas['levels']):
            for index, family in enumerate(families):
                cell = offset * 8 + index
                slot = (atlas['asset'], cell % 4, cell // 4)
                theme_id = f'L{number}-{family}'
                assert slot not in slots and theme_id not in visual_ids
                slots.add(slot)
                visual_ids.add(theme_id)
                themes.append({'level': number, 'themeId': theme_id, 'visualId': theme_id,
                               'asset': atlas['asset'], 'column': cell % 4, 'row': cell // 4,
                               'columns': 4, 'rows': 4, 'ownerApproved': False,
                               'brief': f'{family}: dedicated vocabulary photograph for L{number}'})
    assert len(lexical_atlases) == 5 and len(slots) == 190
    grammar = json.loads((DOCS / 'visuels-grammaire-sources.json').read_text())
    assert grammar['familyOrder'] == ['vocab-adjectifs', 'vocab-prepositions', 'vocab-adverbes']
    grammar_atlases = []
    for atlas in grammar['atlases']:
        path = ROOT / 'melunga_deploy' / atlas['asset']
        assert hashlib.sha256(path.read_bytes()).hexdigest() == atlas['sha256']
        assert path.stat().st_size == atlas['bytes']
        assert atlas['columns'] == 3 and atlas['rows'] == 4
        grammar_atlases.append(atlas)
        for row, number in enumerate(atlas['levels']):
            for column, family in enumerate(grammar['familyOrder']):
                slot = (atlas['asset'], column, row)
                theme_id = f'L{number}-{family}'
                assert slot not in slots and theme_id not in visual_ids
                slots.add(slot)
                visual_ids.add(theme_id)
                themes.append({'level': number, 'themeId': theme_id, 'visualId': theme_id,
                               'asset': atlas['asset'], 'column': column, 'row': row,
                               'columns': 3, 'rows': 4, 'ownerApproved': False,
                               'brief': f'{family}: dedicated lexical photograph for L{number}'})
    assert len(grammar_atlases) == 3 and len(slots) == 220
    corrections = json.loads((DOCS / 'visuels-corrections-sources.json').read_text())
    correction_atlases = []
    assert {row['family'] for row in corrections['atlases']} == {'vocab-couleurs', 'vocab-nature', 'vocab-loisirs'}
    for atlas in corrections['atlases']:
        path = ROOT / 'melunga_deploy' / atlas['asset']
        assert hashlib.sha256(path.read_bytes()).hexdigest() == atlas['sha256']
        assert path.stat().st_size == atlas['bytes']
        assert atlas['columns'] == 3 and atlas['rows'] == 4
        assert atlas['usedLevels'] == list(range(1, 11))
        correction_atlases.append(atlas)
        for index, number in enumerate(atlas['usedLevels']):
            slot = (atlas['asset'], index % 3, index // 3)
            theme_id = f"L{number}-{atlas['family']}"
            assert slot not in slots and theme_id not in visual_ids
            slots.add(slot)
            visual_ids.add(theme_id)
            themes.append({'level': number, 'themeId': theme_id, 'visualId': theme_id,
                           'asset': atlas['asset'], 'column': index % 3, 'row': index // 3,
                           'columns': 3, 'rows': 4, 'ownerApproved': False,
                           'brief': f"{atlas['family']}: dedicated photograph for L{number}"})
    assert len(correction_atlases) == 3 and len(slots) == 250
    return {'version': 2, 'status': 'approved-L1-photos-preserved-new-level-and-vocabulary-photos-awaiting-owner-review',
            'photographsAreSynthetic': True, 'thirdPartyImageRequests': 0,
            'distinctVisualPerDistinctTheme': True, 'sameThemeSharedAcrossLanguagePairs': True,
            'levels': levels, 'vocabularyAtlases': lexical_atlases, 'grammarAtlases': grammar_atlases,
            'correctionAtlases': correction_atlases, 'themes': themes,
            'checks': {'atlases': len(levels) + len(lexical_atlases) + len(grammar_atlases) + len(correction_atlases), 'distinctThemeSlots': len(slots),
                       'approvedL1HashPreserved': True,
                       'totalBytesAcrossTenLevels': sum(row['bytes'] for row in levels + lexical_atlases + grammar_atlases + correction_atlases)}}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    result = make()
    rendered = json.dumps(result, ensure_ascii=False, indent=2) + '\n'
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_text() != rendered:
            raise SystemExit('Out of date: ' + OUTPUT.relative_to(ROOT).as_posix())
    else:
        OUTPUT.write_text(rendered)
    print(json.dumps(result['checks']))


if __name__ == '__main__':
    main()
