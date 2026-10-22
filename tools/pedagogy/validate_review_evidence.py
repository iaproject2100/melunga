#!/usr/bin/env python3
"""Check exact quotations in the targeted reviews, including proposed bridges."""
import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
REVIEW = ROOT / 'docs/progression-complete'
REPORTS = ('relecture-fr-en-es-it.json', 'relecture-zh-ja-ko.json')
PAIRS = ('fr-en', 'fr-es', 'fr-it', 'fr-zh', 'fr-ja', 'fr-ko', 'zh-fr')


def validate():
    bank = json.loads((REVIEW / 'banque-phrases.json').read_text())
    entries = {entry['id']: entry for entry in bank['entries']}
    seen = set()
    rows = []
    findings = direct = bridges = 0
    for name in REPORTS:
        document = json.loads((REVIEW / name).read_text())
        report_direct = report_bridges = 0
        for case in document['cases']:
            key = (case['pair'], case['niveau'])
            assert key not in seen, f'Duplicate review case: {key}'
            seen.add(key)
            case_direct = case_bridges = 0
            for finding in case['findings']:
                findings += 1
                groups = (finding.get('refs', []),
                          finding.get('pontRecommande', {}).get('refs', []))
                for index, refs in enumerate(groups):
                    for ref in refs:
                        entry = entries[ref['sourceBankId']]
                        pair = entry['nativeLanguage'] + '-' + entry['studyLanguage']
                        assert pair == case['pair'], f'Wrong reader: {ref}'
                        assert ref['quote'] == entry['copy']['study'], f'Wrong quote: {ref}'
                        assert ref['nativeQuote'] == entry['copy']['native'], f'Wrong translation quote: {ref}'
                    if index == 0:
                        case_direct += len(refs)
                    else:
                        case_bridges += len(refs)
            report_direct += case_direct
            report_bridges += case_bridges
            rows.append({'pair': key[0], 'level': key[1],
                         'findings': len(case['findings']),
                         'directCitations': case_direct,
                         'bridgeCitations': case_bridges,
                         'citations': case_direct + case_bridges,
                         'sourceReport': name,
                         'status': 'targeted-editorial-review-not-native-validation'})
        if 'totals' in document:
            assert document['totals']['referenceOccurrences'] == report_direct + report_bridges
        direct += report_direct
        bridges += report_bridges
    assert seen == {(pair, level) for pair in PAIRS for level in range(1, 11)}
    return {'cases': len(seen), 'findings': findings,
            'directCitations': direct, 'bridgeCitations': bridges,
            'citations': direct + bridges, 'allQuotesExact': True,
            'nativeValidation': False, 'reports': rows}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    report = validate()
    target = REVIEW / 'validation-relectures.json'
    data = json.dumps(report, ensure_ascii=False, indent=2) + '\n'
    if args.check:
        assert target.read_text() == data, 'Review evidence output is stale'
    else:
        target.write_text(data)
    print(json.dumps({key: value for key, value in report.items() if key != 'reports'}))


if __name__ == '__main__':
    main()
