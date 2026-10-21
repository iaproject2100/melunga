#!/usr/bin/env python3
"""Read-only notation inventory; field counts are neither words nor skills."""
import hashlib
import json
import re
import subprocess
from collections import Counter
from pathlib import Path
import sys

sys.dont_write_bytecode = True
from prepare import HERE, ROOT
from refresh_family_metadata import extract_object


def main():
    app = ROOT / 'melunga_deploy/app.html'
    decks, _, _ = extract_object(app.read_text(), 'DECKS')
    folder = ROOT / 'melunga_deploy/content/conversation'
    paths = sorted(folder.glob('L*-fr-zh.json'))
    rows = []

    def walk(obj, locator):
        if isinstance(obj, dict):
            if isinstance(obj.get('phon'), str):
                kind = ('slot' if '.slot' in locator else 'model' if '.model' in locator
                        else 'turn' if '.turns[' in locator else 'variant')
                rows.append((locator, kind, obj['phon']))
            for key, value in obj.items():
                walk(value, locator + '.' + key)
        elif isinstance(obj, list):
            for index, value in enumerate(obj):
                walk(value, f'{locator}[{index}]')

    for path in paths:
        walk(json.loads(path.read_text()), path.name)
    counts = {}
    affected = set()
    for token in ('chyang', 'siang', 'tchu', 'tchü', 'si-houan', 'chi-houan'):
        pattern = re.compile(r'(?<!\w)' + re.escape(token) + r'(?!\w)')
        catalogue = [c.get('phf', '') for c in decks['zh']]
        matched = [(loc, kind, phon) for loc, kind, phon in rows if pattern.search(phon)]
        counts[token] = {
            'catalogueCardsContainingToken': sum(bool(pattern.search(phon)) for phon in catalogue),
            'catalogueTokenOccurrences': sum(len(pattern.findall(phon)) for phon in catalogue),
            'conversationFieldsExcludingSlots': sum(kind != 'slot' for _, kind, _ in matched),
            'conversationByFieldType': dict(Counter(kind for _, kind, _ in matched)),
            'conversationTokenOccurrencesExcludingSlots': sum(len(pattern.findall(phon)) for _, kind, phon in matched if kind != 'slot')}
        if token in ('siang', 'si-houan'):
            affected.update(loc for loc, kind, _ in matched if kind != 'slot')
    pairs = Counter()
    all_files = sorted(folder.glob('L*-*-*.json'))
    for path in all_files:
        data = json.loads(path.read_text())
        pairs[data['nativeLanguage'] + '→' + data['studyLanguage']] += 1
    result = {
        'sourceCommit': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip(),
        'scope': {'catalogueCards': len(decks['zh']), 'conversationPair': 'fr→zh',
                  'pairFiles': len(paths), 'repositoryLevelFiles': len(all_files), 'pairs': dict(pairs)},
        'method': 'Exact Unicode word-boundary tokens, case-sensitive. Catalogue: phf per card. Conversation: model/variant/turn phon, excluding slots in the headline count.',
        'counts': counts, 'distinctCandidateFieldsForReview': len(affected),
        'limitations': ['Counts of notation fields, not counts of one Chinese word or acquired skills.',
                        'Models include templates; the same phrase may occur in several fields.',
                        'Tokens are not automatically aligned with source characters.',
                        'No replacement performed; reader-specific and native review required.'],
        'sha256': {str(path.relative_to(ROOT)): hashlib.sha256(path.read_bytes()).hexdigest() for path in [app, *paths]}}
    (HERE / 'mesure-notations-zh.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'scope': result['scope'], 'counts': counts, 'distinctCandidateFieldsForReview': len(affected)}, ensure_ascii=False))


if __name__ == '__main__':
    main()
