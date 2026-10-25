#!/usr/bin/env python3
"""Reproduce the declared ss-filter hypothesis, not Claude's unpublished filter.
Reads Git source objects only; writes no corpus, ledger or runtime.
Usage: python3 docs/niveaux-progressifs/reponse-relecture-phonetique/reproduire-espagnol-italien.py
"""
import argparse
import hashlib
import json
import re
import subprocess
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--repo', type=Path, default=HERE.parents[2])
args = parser.parse_args()
repo = args.repo.resolve()
commit = '90a343391807b5a62ef1f140ce40075c53b7d9d8'

def raw(path):
    return subprocess.check_output(['git', 'show', commit + ':' + path], cwd=repo)

def load(path):
    return json.loads(raw(path))

def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()

def checksum(value):
    return hashlib.sha256(value).hexdigest()

files = []
for prefix in ('docs/niveaux-progressifs/enrichissement-situations', 'docs/niveaux-progressifs/corrections-themes'):
    paths = subprocess.check_output(['git', 'ls-tree', '-r', '--name-only', commit, '--', prefix], cwd=repo, text=True).splitlines()
    files.extend(path for path in paths if path.endswith('.json'))
rows = []
for filename in files:
    document = load(filename)
    if not isinstance(document, dict):
        continue
    for bucket in ('items', 'receivedTurns', 'lexicalSupports', 'entries', 'introductions'):
        for index, item in enumerate(document.get(bucket) or []):
            if isinstance(item, dict) and 'phon' in item:
                rows.append({'file': filename, 'bucket': bucket, 'arrayIndex': index,
                             'pair': item.get('pair') or document.get('pair'), **item})
pending = [row for row in rows if row.get('pair') == 'fr-es' and row.get('phoneticReviewStatus') == 'pending-Claude']
line, = [line for line in raw('melunga_deploy/app.html').decode().splitlines() if line.startswith('var DECKS = ')]
deck = json.loads(line.split('=', 1)[1].strip().rstrip(';'))['es']
pattern = re.compile(r'[aeiouéèêàâîïôùûüëö]s[aeiouéèêàâîïôùûüëö]', re.I)
flag = lambda phon: bool(pattern.search(phon.replace('-', '')))
flagged = [row for row in pending if flag(row['phon'])]
indices = [index for index, row in enumerate(deck) if flag(row['pf'])]
assert (len(files), len(rows), len(pending), len(flagged), len(deck), len(indices)) == (87, 2965, 317, 55, 4672, 686)
identities = {tuple(row.get(key) for key in ('study', 'native', 'phon', 'reading')) for row in pending}
assert len(identities) == 306
proof = json.loads((HERE / 'espagnol-italien-preuves.json').read_text())
assert {row['id'] for row in flagged} == {row['id'] for row in proof['flaggedPendingEntries']}
assert indices == [row['sourceIndex'] for row in proof['flaggedCatalogueEntries']]
proposal = json.loads((HERE / 'espagnol-italien-propositions.json').read_text())
assert len(proposal['wholeAids']) == 13
changes = 0
for row in proposal['wholeAids']:
    reference = row['source']
    parent = raw(reference['path'])
    assert checksum(parent) == reference['fileSha256']
    value = json.loads(parent)
    for part in reference['jsonPointer'].strip('/').split('/'):
        value = value[int(part)] if isinstance(value, list) else value[part]
    assert checksum(canonical(value)) == reference['entrySha256']
    assert (value['id'], value['study'], value['native'], value['phon']) == (row['id'], row['study'], row['native'], row['currentWholePhon'])
    before, after = row['currentWholePhon'], row['proposedWholePhon']
    collapse = lambda text: re.sub(r'(s)s+', r'\1', text, flags=re.I)
    assert collapse(before) == collapse(after), row['id']
    delta = Counter(after) - Counter(before)
    assert not (Counter(before) - Counter(after)) and set(delta) <= {'s', 'S'}
    changes += sum(delta.values())
assert changes == 14
print(json.dumps({'commit': commit, 'jsonFiles': len(files), 'phonBearingPositions': len(rows),
                  'spanishPendingPositions': len(pending), 'spanishPendingDistinctWholeEntries': len(identities),
                  'lotFlags': len(flagged), 'catalogueFlags': len(indices), 'wholeAidProposalsChecked': 13,
                  'insertedSMarkersOnly': changes,
                  'activeWholeAidProposals': sum(row.get('active', True) for row in proposal['wholeAids']),
                  'archivedWholeAidProposals': sum(not row.get('active', True) for row in proposal['wholeAids']),
                  'extractedRowsSha256': checksum(json.dumps(rows, ensure_ascii=False).encode()),
                  'status': 'reproduced-declared-hypothesis-not-Claude-unpublished-filter',
                  'corpusWritten': False}, ensure_ascii=False, indent=2))
