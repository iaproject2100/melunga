#!/usr/bin/env python3
"""Reproduce the phonetic scope on frozen Git data; writes only this review folder."""
from collections import Counter, defaultdict
import hashlib
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[3]
REV = '90a3433'
CLAUDE = '295adf3'
BASE = 'docs/niveaux-progressifs'
OUT = ROOT / BASE / 'reponse-relecture-phonetique'
CACHE = {}


def raw(path):
    if path not in CACHE:
        CACHE[path] = subprocess.check_output(['git', '-C', str(ROOT), 'show', REV + ':' + path])
    return CACHE[path]


def load(path):
    return json.loads(raw(path))


def sha(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()


def fields(value):
    return {k: value[k] for k in ('study', 'native', 'phon', 'reading') if k in value}


def location(row):
    return {'file': row['file'], 'jsonPointer': '/' + row['bucket'] + '/' + str(row['index']),
            'pair': row['pair'], 'id': row['item'].get('id'), 'status': row['status']}


def pointer(document, value):
    for key in value.split('/')[1:]:
        key = key.replace('~1', '/').replace('~0', '~')
        document = document[int(key)] if isinstance(document, list) else document[key]
    return document


def compare(item, source, mapping=None):
    mapping = mapping or {key: key for key in fields(item)}
    for key in fields(item):
        assert key in mapping and item[key] == source[mapping[key]], (item.get('id'), key)
    return len(fields(item))


def main():
    files = [p for prefix in ('enrichissement-situations', 'corrections-themes')
             for p in subprocess.check_output(['git', '-C', str(ROOT), 'ls-tree', '-r', '--name-only', REV, '--', BASE + '/' + prefix], text=True).splitlines()
             if p.endswith('.json')]
    rows = []
    for path in files:
        document = load(path)
        if not isinstance(document, dict):
            continue
        for bucket in ('items', 'receivedTurns', 'lexicalSupports', 'entries', 'introductions'):
            for index, item in enumerate(document.get(bucket) or []):
                if isinstance(item, dict) and 'phon' in item:
                    rows.append({'file': path, 'bucket': bucket, 'index': index,
                                 'pair': item.get('pair') or document.get('pair'),
                                 'status': item.get('phoneticReviewStatus'), 'kind': item.get('kind'), 'item': item})
    statuses = Counter(row['status'] for row in rows)
    assert len(files) == 87 and len(rows) == 2965
    assert statuses == {None: 334, 'pending-Claude': 1715, 'existing-verbatim': 535, 'source-exact-preserved': 381}
    app = raw('melunga_deploy/app.html').decode()
    decks = json.JSONDecoder().raw_decode(app.split('var DECKS = ', 1)[1])[0]
    lexical = {row['item']['id']: row for row in rows if row['file'].endswith('/enrichissements-rediges.json')}
    by_pair_id = defaultdict(list)
    for row in rows:
        by_pair_id[(row['pair'], row['item'].get('id'))].append(row)
    copies, missing, source_links = [], [], defaultdict(list)
    for row in rows:
        item = row['item']; index = item.get('sourceIndex', item.get('source', {}).get('sourceIndex'))
        if isinstance(index, int):
            source_links[(row['pair'], index)].append(row)
    for row in rows:
        if row['status'] not in (None, 'source-exact-preserved', 'existing-verbatim'):
            continue
        item, source = row['item'], row['item'].get('source', {})
        index = item.get('sourceIndex', source.get('sourceIndex'))
        proof = location(row)
        if isinstance(index, int):
            study = row['pair'].split('-')[1]
            card = decks[study][index]
            mapping = {'study': 't', 'native': 'cn' if study == 'fr' else 'frm',
                       'phon': 'phon' if study == 'fr' else 'phf' if study == 'zh' else 'pf', 'reading': 'py'}
            count = compare(item, card, mapping)
            expected_hash = item.get('sourceSha256', source.get('sourceSha256'))
            assert expected_hash == sha(card), (row['file'], index, 'whole card hash')
            assert item.get('sourceLevel', source.get('sourceLevel')) == card['lv']
            proof.update(source={'collection': 'DECKS.' + study, 'indexBaseZero': index,
                                 'file': 'melunga_deploy/app.html', 'cardSha256': sha(card), 'sourceLevel': card['lv']},
                         copiedFields=fields(item), sourceFieldMap={k: mapping[k] for k in fields(item)},
                         comparedFieldCount=count, fieldDifferences=0,
                         sameCanonicalSourceReferences=[location(other) for other in source_links[(row['pair'], index)] if other is not row])
        elif row['kind'] == 'conversation-whole-entry':
            source_bytes = raw(source['path']); source_object = pointer(json.loads(source_bytes), source['jsonPointer'])
            assert hashlib.sha256(source_bytes).hexdigest() == source['fileSha256']
            assert sha(source_object) == source['entrySha256']
            count = compare(item, source_object)
            proof.update(source=source, comparedFieldCount=count, fieldDifferences=0)
        elif row['kind'] == 'candidate-reference':
            matches = by_pair_id[(row['pair'], source['candidateId'])]
            assert len(matches) == 1
            count = compare(item, matches[0]['item'])
            proof.update(source=location(matches[0]), comparedFieldCount=count, fieldDifferences=0)
        else:
            raise AssertionError(('Unknown copy provenance', location(row)))
        if row['status'] is None:
            proof['proposedPhoneticReviewStatus'] = 'source-exact-preserved'
            proof['classificationAppliedToLedger'] = False
        copies.append(proof)
        if row['status'] is None:
            missing.append(proof)
    pending_references = []
    for row in rows:
        if row['status'] == 'pending-Claude' and row['kind'] == 'candidate-reference':
            target = lexical[row['item']['source']['canonicalId'].removeprefix('editorial:')]
            count = compare(row['item'], target['item'])
            pending_references.append({**location(row), 'source': location(target), 'copiedFields': fields(row['item']),
                                       'comparedFieldCount': count, 'fieldDifferences': 0})
    complement = []
    for row in rows:
        if row['file'].endswith('/extension-pistes/fr-zh-avances-complement.json'):
            matches = [other for other in by_pair_id[(row['pair'], row['item']['id'])] if other['file'].endswith('/extension-fr-zh.json')]
            assert len(matches) == 1
            count = compare(row['item'], matches[0]['item'])
            complement.append({**location(row), 'mainLedger': location(matches[0]),
                               'comparedFieldCount': count, 'fieldDifferences': 0})
    headwords = []
    for row in lexical.values():
        source = row['item'].get('wholeHeadwordPhonSource')
        if source:
            card = decks[source['collection'].split('.')[1]][source['sourceIndex']]
            assert row['item']['study'] == card['t'] and row['item']['phon'] == card[source['field']]
            headwords.append({**location(row), 'source': source, 'study': row['item']['study'],
                              'phon': row['item']['phon'], 'sourceNative': card.get('frm'),
                              'newNative': row['item']['native'], 'fieldDifferencesOnStudyAndPhon': 0})
    new = [row for row in rows if row['status'] == 'pending-Claude' and row['kind'] == 'editorial-authored-whole-entry'
           and '/extension-pistes/' not in row['file']]
    new += [row for row in lexical.values() if not row['item'].get('wholeHeadwordPhonSource')]
    assert len(new) == 1668 and len(pending_references) == 16 and len(headwords) == 1
    assert len([row for row in complement if row['status'] == 'pending-Claude']) == 30
    keys = [(row['pair'], *[row['item'].get(k) for k in ('study', 'native', 'phon', 'reading')]) for row in new]
    assert len(set(keys)) == 1668
    groups = defaultdict(list)
    for row in new:
        groups[(row['pair'], row['item']['phon'])].append(row)
    phon_spelling_duplicates = [{'pair': key[0], 'phon': key[1], 'occurrences': [location(r) for r in value],
                                'studyTexts': [r['item']['study'] for r in value]}
                               for key, value in groups.items() if len(value) > 1]
    result = {'version': 1, 'sourceRevision': subprocess.check_output(['git', '-C', str(ROOT), 'rev-parse', REV], text=True).strip(),
              'claudeReviewRevision': CLAUDE, 'method': 'Independent frozen-Git reader; no compiler imports, text normalization or phonetic assembly.',
              'scriptHarnessAdaptations': ['Replace absent origin/review/themes-niveaux-progressifs with the frozen 90a3433 object.',
                'Conversation references are read through their archived paths in docs/niveaux-progressifs; no missing product directory is invented.'],
              'counts': {'jsonFilesScanned': len(files), 'rowsWithPhonField': len(rows),
                         'byDeclaredStatus': {str(k):v for k,v in statuses.items()}, 'noStatusCatalogueCopies': len(missing),
                         'copyRowsVerifiedAgainstSource': len(copies), 'sourceFieldsCompared': sum(r['comparedFieldCount'] for r in copies),
                         'sourceFieldDifferences': 0, 'pendingCandidateReferences': len(pending_references),
                         'complementRowsDuplicatedInMainLedger': len(complement), 'pendingComplementDuplicates': 30,
                         'wholeHeadwordPhoneticReused': len(headwords), 'newWholeEntryAidsToReview': len(new),
                         'distinctNewFullFieldIdentitiesByPair': len(set(keys)), 'distinctNewPhonSpellingsByPair': len(groups)},
              'equation': '1715 pending occurrences - 30 copied supplement occurrences - 16 references to lexical entries already counted - 1 whole-headword aid reused = 1668 new whole-entry aids.',
              'noStatusByFile': dict(Counter(row['file'] for row in missing)),
              'noStatusByPair': dict(Counter(row['pair'] for row in missing)),
              'noStatusFieldCount': sum(r['comparedFieldCount'] for r in missing),
              'noStatusCanonicalSourceIdentities': len({(row['pair'], row['source']['indexBaseZero']) for row in missing}),
              'noStatusRows': missing, 'pendingCandidateCopies': pending_references,
              'complementDuplicates': complement, 'headwordCopies': headwords,
              'samePhonSpellingForDifferentNewEntries': phon_spelling_duplicates,
              'newAidLocations': [location(row) for row in new],
              'sourceFilesSha256': {path: hashlib.sha256(data).hexdigest() for path, data in sorted(CACHE.items())},
              'productDataEdits': 0, 'ledgerEdits': 0, 'linguisticValidationClaimed': False}
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / 'perimetre-aides.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(result['counts'], ensure_ascii=False))


if __name__ == '__main__':
    main()
