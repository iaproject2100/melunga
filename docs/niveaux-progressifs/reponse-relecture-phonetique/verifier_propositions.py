#!/usr/bin/env python3
"""Verify complete before/after proposals against their unchanged real sources."""
from collections import Counter
import difflib
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent


def load(name):
    return json.loads((HERE / name).read_text())


def pointer(document, value):
    for key in value.split('/')[1:]:
        key = key.replace('~1', '/').replace('~0', '~')
        document = document[int(key)] if isinstance(document, list) else document[key]
    return document


def source(path, location, file_hash=None):
    raw = (ROOT / path).read_bytes()
    if file_hash:
        assert hashlib.sha256(raw).hexdigest() == file_hash, path
    return pointer(json.loads(raw), location)


def same_fields(proposal, original):
    assert original['id'] == proposal['id']
    for key in ['study', 'native', 'reading']:
        if key in proposal:
            assert original.get(key) == proposal[key], (proposal['id'], key)


def main():
    counts = Counter()
    ids = set()
    targeted = load('corrections-ciblees-proposees.json')
    for path, expected in targeted['inputSha256'].items():
        assert hashlib.sha256((ROOT / path).read_bytes()).hexdigest() == expected, path
    for item in targeted['proposals']:
        original = source(item['file'], item['pointer'])
        same_fields(item, original)
        assert original['phon'] == item['phonBefore'] != item['phonProposed']
        assert item['reviewStatus'] == 'proposed-pending-Claude'
        ids.add(item['id'])
        counts[item['pair']] += 1
    korean = load('coreen-propositions.json')
    for item in korean['wholeAidProposals']:
        assert item['jsonPointer'].endswith('/phon')
        original = source(item['sourceFile'], item['jsonPointer'][:-len('/phon')], item['sourceFileSha256'])
        same_fields(item, original)
        assert original['phon'] == item['currentPhon'] != item['proposedWholePhon']
        assert item['status'] == 'proposed-whole-aid-pending-Claude' and item['applied'] is False
        assert item['id'] not in ids
        ids.add(item['id']); counts['fr-ko'] += 1
    spanish = load('espagnol-italien-propositions.json')
    assert spanish['active'] is False and spanish['status'] == 'archived-not-applied-ss-extension-withdrawn'
    for item in spanish['wholeAids']:
        ref = item['source']
        original = source(ref['path'], ref['jsonPointer'], ref['fileSha256'])
        same_fields(item, original)
        canonical = json.dumps(original, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()
        assert hashlib.sha256(canonical).hexdigest() == ref['entrySha256']
        before, after = item['currentWholePhon'], item['proposedWholePhon']
        assert original['phon'] == before != after and item['applied'] is False
        for tag, a, b, c, d in difflib.SequenceMatcher(None, before, after, autojunk=False).get_opcodes():
            assert tag == 'equal' or (tag == 'insert' and set(after[c:d].lower()) == {'s'}), item['id']
        assert item['id'] not in ids
        ids.add(item['id']); counts['fr-es'] += 1
    assert len(ids) == 41 and counts == {'zh-fr': 19, 'fr-zh': 6, 'fr-ko': 3, 'fr-es': 13}
    assert len(load('perimetre-aides.json')['noStatusRows']) == 334
    print(json.dumps({'status': 'checked-proposals-not-applied', 'wholeAids': len(ids),
        'byPair': dict(counts), 'activeWholeAids': len(ids) - len(spanish['wholeAids']),
        'archivedSpanishWholeAids': len(spanish['wholeAids']),
        'protectedFileFingerprints': len(targeted['inputSha256']),
        'productEdits': 0, 'linguisticApprovalClaimed': False}, ensure_ascii=False))


if __name__ == '__main__':
    main()
