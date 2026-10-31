"""Compile explicit, reviewed domain placements over immutable source editions.

No word, translation match, or default conversation category infers a placement.
The authoring files cover every original source index; an unknown source fails.
"""
import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path

SOURCE_DIR = 'tools/maquette-guidee/imports/domain-edition-v1'
RECEIPTS = {
    'L1-L3': 'e02a389a7a57b6edc426b4634e4aed92c5e48335b1dfca8c198fd3ec3a5dd5a6',
    'L4-L6': 'a59a1e50c42ae66454961da90172c3aef88eea92765194b9f9c41813534393f8',
    'L7-L10': '4424fb3eda83581619e2ef3b0e951604d845aa37c9f536a8e5a7b5bc03650855',
}
FIELDS = ['editorialLevel', 'sourceTheme', 'themeId', 'contentType',
          'lexicalClass', 'isTemplate', 'lexicalConceptId']


def require(condition, message):
    if not condition:
        raise ValueError('Reviewed domain edition: ' + message)


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def encoded(data, pretty=False):
    return (json.dumps(data, ensure_ascii=False, indent=2 if pretty else None,
                       separators=None if pretty else (',', ':')) + '\n').encode()


def receipt_rows(root):
    decisions, inputs, cells = {}, {}, []
    for band, checksum in RECEIPTS.items():
        path = f'docs/livraison-claude-2026-10-31/audit_{band}.json'
        raw = (root / path).read_bytes()
        require(sha(raw) == checksum, 'supplied audit changed: ' + band)
        data = json.loads(raw)
        require(not data['lots_missing'], 'supplier reports missing lots')
        inputs[band] = {'path': path, 'sha256': checksum}
        cells.extend(data['cells'])
        for group, status in [('proposals', 'proposed'), ('uncertain', 'uncertain'),
                              ('targetAbsent', 'target-theme-absent-in-this-language')]:
            for row in data[group]:
                key = row['language'], row['sourceIndex']
                require(key not in decisions and row['status'] == status, 'duplicate or untyped decision')
                require(row['id'] == f'catalogue:{key[0]}:{key[1]}', 'decision identity differs')
                decisions[key] = row
    require(len(cells) == len({(c['language'], c['level']) for c in cells}) == 120,
            'all twelve languages and ten levels are required')
    require(Counter(r['status'] for r in decisions.values()) == {
        'proposed': 10343, 'uncertain': 4582, 'target-theme-absent-in-this-language': 775},
        'received decision inventory differs')
    return decisions, inputs, cells


def build_sources(root, outputs, manifest):
    decisions, inputs, cells = receipt_rows(root)
    baseline = {'version': 1, 'id': 'reviewed-domain-placements-source',
                'sourceBaseCommit': '4ce579f', 'receiptInputs': inputs,
                'studyLanguageIds': manifest['studyLanguageIds'],
                'sourceBanks': {c: manifest['banks'][c]['sha256'] for c in manifest['studyLanguageIds']},
                'reviewedRuntimeSha256ByPath': manifest['source']['reviewedRuntimeSha256ByPath'],
                'policy': {'sameEditorialLevel': True, 'sourceFieldsChanged': False,
                           'protectedScenesChanged': False, 'templatesOrReservesChanged': False,
                           'inferFromWordsOrTranslationMatches': False,
                           'unknownSources': 'reject and request review',
                           'titles': 'retain existing titles pending owner preference',
                           'order': 'retain existing relative order; append incoming in source-index order'}}
    sources = {SOURCE_DIR + '/edition.json': encoded(baseline, True)}
    for study in manifest['studyLanguageIds']:
        bank = json.loads(outputs['melunga_deploy/content/native-catalogue/' + study + '.json'])
        definitions = {(l['level'], t['id']): t for l in bank['levels'] for t in l['themes']}
        rows, notes = [], {}
        for index, (card, old) in enumerate(zip(bank['cards'], bank['locations'])):
            row = decisions.get((study, index))
            target = old[1]
            if row:
                require(row['t'] == card['t'] and row['level'] == old[0]
                        and row['currentTheme'] == old[1], 'audit no longer matches source ' + row['id'])
                notes[str(index)] = {k: row[k] for k in ['status', 'reason', 'proposedTheme']}
                if row['status'] == 'proposed':
                    target = row['proposedTheme']
                    current = definitions.get((old[0], old[1]))
                    destination = definitions.get((old[0], target))
                    require(current and destination and current['section'] == destination['section'],
                            'missing destination or section change')
                    require(not card.get('cat') == 'template' and not old[4]
                            and not current.get('isTemplateCollection')
                            and not any('-situation-' in name for name in [old[1], target]),
                            'protected content in proposed move')
                    require(target != old[1], 'no-op move')
            rows.append([old[0], old[1], target, *old[2:]])
        for cell in [c for c in cells if c['language'] == study]:
            level = bank['levels'][cell['level']-1]
            count = sum(len(t['phraseIds']) for t in level['themes']
                        if '-situation-' not in t['id'] and not t.get('isTemplateCollection'))
            require(cell['cardsRead'] == cell['cardsInDisplayedThemes'] == count, 'coverage changed')
            for theme in cell['themes']:
                definition = definitions.get((cell['level'], theme['theme']))
                require(definition and theme['before'] == len(definition['phraseIds']), 'before count differs')
                after = sum(r[0] == cell['level'] and r[2] == theme['theme'] for r in rows)
                require(after == theme['afterProposed'], 'after count differs')
        source = {'version': 1, 'id': study + '-reviewed-domain-placements', 'studyLanguage': study,
                  'sourceBankSha256': baseline['sourceBanks'][study], 'sourceCardCount': len(bank['cards']),
                  'fields': FIELDS, 'placements': rows, 'reviewDecisions': notes}
        sources[SOURCE_DIR + '/' + study + '-themes-v1.json'] = encoded(source, True)
    require(sum(sum(r[1] != r[2] for r in json.loads(raw)['placements'])
                for path, raw in sources.items() if path.endswith('-themes-v1.json')) == 10343,
            'applied proposal count differs')
    return sources, baseline


def augment_theme_placement_edition(root, outputs, manifest):
    expected, baseline = build_sources(root, outputs, manifest)
    descriptors, banks = {}, {}
    for path, raw in expected.items():
        require((root / path).read_bytes() == raw, 'authoritative placement source differs: ' + path)
        descriptors[path] = sha(raw)
    for study in manifest['studyLanguageIds']:
        path = SOURCE_DIR + '/' + study + '-themes-v1.json'
        source = json.loads(expected[path])
        bank = json.loads(outputs['melunga_deploy/content/native-catalogue/' + study + '.json'])
        banks[study] = {'sourceBankSha256': manifest['banks'][study]['sha256'],
                        'sourceCardCount': len(bank['cards']), 'sourcePath': path,
                        'sourceSha256': descriptors[path],
                        'levels': [{'level': l['level'], 'themes': [
                            {k: v for k, v in t.items() if k != 'phraseIds'} for t in l['themes']]}
                            for l in bank['levels']],
                        'moves': [[i, r[0], r[1], r[2]] for i, r in enumerate(source['placements'])
                                  if r[1] != r[2]]}
    data = {'version': 1, 'id': 'reviewed-domain-placement-edition-v1',
            'policy': baseline['policy'], 'receiptInputs': baseline['receiptInputs'],
            'sourceMaps': descriptors, 'banks': banks, 'sourceCardCount': manifest['sourceCardCount'],
            'moves': 10343, 'uncertainKept': 4582, 'absentTargetsKept': 775,
            'movesByBand': {'L1-L3': 2544, 'L4-L6': 4245, 'L7-L10': 3554}}
    path = 'content/native-catalogue/theme-placements.json'
    raw = encoded(data)
    outputs['melunga_deploy/' + path] = raw
    manifest['themePlacementEdition'] = {k: v for k, v in data.items() if k not in ['banks', 'policy']}
    manifest['themePlacementEdition'].update(path=path, sha256=sha(raw), bytes=len(raw))
    outputs['melunga_deploy/content/native-catalogue/manifest.json'] = encoded(manifest)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--prepare', action='store_true', required=True)
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[2]
    manifest = json.loads((root / 'melunga_deploy/content/native-catalogue/manifest.json').read_bytes())
    outputs = {'melunga_deploy/' + row['path']: (root / 'melunga_deploy' / row['path']).read_bytes()
               for row in manifest['banks'].values()}
    sources, _ = build_sources(root, outputs, manifest)
    for path, raw in sources.items():
        target = root / path
        require(not target.exists() or target.read_bytes() == raw, 'refuse to overwrite edited source: ' + path)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(raw)
    print(json.dumps({'sourceFiles': len(sources), 'sourceCards': manifest['sourceCardCount'],
                      'proposedMoves': 10343, 'uncertainNotApplied': 4582, 'absentNotApplied': 775}))
