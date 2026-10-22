"""Bounded catalogue-source preparations for the reviewed Spanish L4 trial.

The optional runtime field is separate from the four canonical unit variants.
This helper only reads protected sources and the explicit trial annex.
"""
from copy import deepcopy
import hashlib
import json
from pathlib import Path
import subprocess

ANNEX = Path('docs/progression-corrections/transition-es/preparations.json')
CATALOGUE = Path('melunga_deploy/app.html')
EDITORIAL_DIRECTORY = Path('docs/progression-corrections')
EDITORIAL_BASELINE = 'a4f1ec4e31e436546e775597845ff570476356a8'
SOURCE_SNAPSHOT = 'bcd108dff5c5931f935f70f694a040d235403b64'
EDITORIAL_FILES = ('editorial-en-es.json', 'editorial-ko-it.json',
                   'editorial-zh-ja.json', 'editorial-zh-fr.json')
TARGETS = {'L4-fr-es-01': ([1, 2, 3, 0], [(264, 1), (283, 0)]),
           'L4-fr-es-03': ([3, 0, 1, 2], [(542, 3)])}
LABEL_UNIT = 'L3-fr-es-05'


def require(condition, message):
    if not condition:
        raise ValueError(message)


def catalogue_cards(root):
    text = (root / CATALOGUE).read_text(encoding='utf-8')
    marker = 'var DECKS ='
    require(text.count(marker) == 1, 'Expected one literal protected DECKS object')
    start = text.index('=', text.index(marker)) + 1
    decks, _ = json.JSONDecoder().raw_decode(text[start:].lstrip())
    require(isinstance(decks, dict) and isinstance(decks.get('es'), list),
            'Spanish catalogue source must be a literal list')
    return decks['es']


def copied_preparation(unit_id, reference, cards):
    index, before = reference['catalogueIndex'], reference['beforeVariantIndex']
    require(type(index) is int and 0 <= index < len(cards), 'Invalid catalogue index')
    require(type(before) is int and 0 <= before < 4, 'Invalid preparation destination variant')
    card = cards[index]
    require(all(isinstance(card.get(field), str) and card[field]
                for field in ('t', 'frm', 'pf')), 'A preparation needs exact Spanish/French/phonetic fields')
    require(type(card.get('lv')) is int and 1 <= card['lv'] <= 10,
            'Preparation source level is missing')
    occurrence = f'{unit_id}-preparation-{index}'
    return {
        'id': occurrence, 'beforeVariantIndex': before,
        'source': {'type': 'catalogue-card', 'file': CATALOGUE.as_posix(),
                   'collection': 'DECKS.es', 'index': index, 'indexBase': 0,
                   'sourceCommit': SOURCE_SNAPSHOT, 'sourceLevel': card['lv'],
                   'readerLanguage': 'fr', 'studyLanguage': 'es',
                   'fieldMap': {'study': 't', 'native': 'frm', 'phon': 'pf'}},
        'phrase': {'id': f'catalogue:DECKS.es:{index}:reader-fr',
                   'study': deepcopy(card['t']), 'native': deepcopy(card['frm']),
                   'phon': deepcopy(card['pf'])},
        'understoodInStep': occurrence + '-understand',
        'imitatedInStep': occurrence + '-imitate',
        'rationale': reference['rationale']}


def load_overlay(root):
    spec = json.loads((root / ANNEX).read_text(encoding='utf-8'))
    require(spec.get('version') == 1 and spec.get('scope') == 'fr-es-L3-L4-transition'
            and spec.get('status') == 'source-copy-preparation-trial-not-published',
            'Unexpected preparation trial scope')
    require(spec.get('editorialBaseline') == EDITORIAL_BASELINE
            and spec.get('sourceSnapshot') == SOURCE_SNAPSHOT
            and spec.get('publicationApproved') is False
            and spec.get('doesNotMeasureAcquisition') is True,
            'Preparation references must remain a non-published source-copy trial')
    require(set(spec.get('editorialInputsSha256', {})) == set(EDITORIAL_FILES),
            'Frozen editorial manifest is incomplete')
    for name, expected in spec['editorialInputsSha256'].items():
        relative = EDITORIAL_DIRECTORY / name
        historical = subprocess.check_output(['git', '-C', str(root), 'show',
                                               f'{EDITORIAL_BASELINE}:{relative.as_posix()}'])
        current = (root / relative).read_bytes()
        require(current == historical and hashlib.sha256(historical).hexdigest() == expected,
                f'Preparation annex cannot rewrite the reviewed editorial input: {name}')
    require(isinstance(spec.get('units'), list), 'Preparation annex units must be a list')
    rows = spec['units']
    require(len(rows) == 3 and {row.get('unitId') for row in rows} == set(TARGETS) | {LABEL_UNIT},
            'Only two Spanish L4 units and the isolated L3 label may be overlaid')
    cards = catalogue_cards(root)
    result = {}
    for row in rows:
        uid = row['unitId']
        require(uid not in result, f'Duplicate preparation overlay: {uid}')
        if uid == LABEL_UNIT:
            require(set(row) == {'unitId', 'firstSubstitutionChangedPart', 'reason'}
                    and isinstance(row['firstSubstitutionChangedPart'], str)
                    and row['firstSubstitutionChangedPart'] and row['reason'],
                    'The separate L3 correction is descriptive only')
            result[uid] = {'firstSubstitutionChangedPart': row['firstSubstitutionChangedPart']}
            continue
        order, references = TARGETS[uid]
        require(set(row) == {'unitId', 'variantOrder', 'rationaleAppendix', 'preparations'}
                and row['variantOrder'] == order and row['rationaleAppendix'],
                f'Unexpected discovery-order overlay: {uid}')
        require(isinstance(row['preparations'], list)
                and [(r.get('catalogueIndex'), r.get('beforeVariantIndex'))
                     for r in row['preparations']] == references,
                f'Preparation references differ from the three selected supports: {uid}')
        require(all(set(r) == {'catalogueIndex', 'beforeVariantIndex', 'rationale'}
                    and isinstance(r['rationale'], str) and r['rationale']
                    for r in row['preparations']), f'Invalid preparation reference: {uid}')
        result[uid] = {'variantOrder': order, 'rationaleAppendix': row['rationaleAppendix'],
                       'preparations': [copied_preparation(uid, ref, cards)
                                        for ref in row['preparations']]}
    return result


def apply_overlay(row, overlay):
    selected = overlay.get(row['unitId'])
    if not selected:
        return row
    if 'variantOrder' in selected:
        row['variantOrder'] = deepcopy(selected['variantOrder'])
        row['rationale'] += ' ' + selected['rationaleAppendix']
        row['preparations'] = deepcopy(selected['preparations'])
    if 'firstSubstitutionChangedPart' in selected:
        require(row.get('firstSubstitution') is not None,
                'The separate descriptive correction needs an existing comparison')
        row['firstSubstitution']['changedPart'] = selected['firstSubstitutionChangedPart']
    return row


def validate_overlay_unit(unit, editorial, overlay):
    expected = apply_overlay(deepcopy(editorial), overlay)
    require(unit.get('preparations', []) == expected.get('preparations', []),
            f'Catalogue preparation or provenance differs: {unit["unitId"]}')
    if unit['unitId'] in overlay:
        for field in ('variantOrder', 'rationale', 'firstSubstitution'):
            require(unit[field] == expected[field],
                    f'The preparation overlay changed another editorial field: {unit["unitId"]} {field}')
