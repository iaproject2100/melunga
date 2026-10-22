#!/usr/bin/env python3
"""Check the proposed Bonjour level change; optionally write a separate candidate.

The canonical application is never overwritten. The review patch changes only
one lv value; it must not import the conversation's different phonetic aid.
"""
import argparse
import copy
import json
from pathlib import Path
import re

from guard_phonetics import aids_of, digest, extract_decks

ROOT = Path(__file__).resolve().parents[2]
APP = ROOT / 'melunga_deploy/app.html'
PROPOSAL = ROOT / 'docs/progression-complete/ponts-L1/bonjour-lv1-proposal.json'


def candidate():
    proposal = json.loads(PROPOSAL.read_text())
    decks = extract_decks(ROOT)
    index = proposal['sourceIndex']
    original = decks['fr'][index]
    if original['t'] != 'Bonjour !' or original['lv'] != 2 or digest(original) != proposal['expectedCardSha256']:
        raise ValueError('Bonjour source differs from the reviewed patch')
    expected_operations = [
        {'op': 'test', 'path': f'/fr/{index}/t', 'value': 'Bonjour !'},
        {'op': 'test', 'path': f'/fr/{index}/lv', 'value': 2},
        {'op': 'replace', 'path': f'/fr/{index}/lv', 'value': 1}]
    if proposal['jsonPatch'] != expected_operations or proposal['preservedAids'] != aids_of(original):
        raise ValueError('Unexpected patch operation or aid change')
    amended = copy.deepcopy(original)
    amended['lv'] = 1
    raw = json.dumps(original, ensure_ascii=False, separators=(',', ':'))
    replacement = json.dumps(amended, ensure_ascii=False, separators=(',', ':'))
    text = APP.read_text()
    if text.count(raw) != 1:
        raise ValueError('Expected one exact serialized catalogue card')
    result = text.replace(raw, replacement, 1)
    differences = [(old, new) for old, new in zip(text, result) if old != new]
    if len(text) != len(result) or differences != [('2', '1')]:
        raise ValueError('The patch must change exactly the one level digit')
    start = re.search(r'(?m)^[ \t]*var\s+DECKS\s*=\s*', result).end()
    actual = json.JSONDecoder().raw_decode(result[start:])[0]
    expected = copy.deepcopy(decks)
    expected['fr'][index]['lv'] = 1
    if actual != expected or aids_of(actual['fr'][index]) != aids_of(original):
        raise ValueError('Unexpected catalogue or phonetic change')
    return result, {'sourceIndex': index, 'study': original['t'], 'fromLevel': 2,
                    'proposedLevel': 1, 'changedFields': [f'DECKS.fr[{index}].lv'],
                    'allPhoneticsUnchanged': True, 'canonicalFileChanged': False,
                    'productionApproved': False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Validate in memory; this is the default')
    parser.add_argument('--output', type=Path, help='Write a separate candidate outside the application tree')
    args = parser.parse_args()
    text, report = candidate()
    if args.output:
        output = args.output.resolve()
        if output.is_relative_to((ROOT / 'melunga_deploy').resolve()):
            raise ValueError('Cannot overwrite a canonical application file')
        with output.open('x', encoding='utf-8') as stream:
            stream.write(text)
        report['candidateWritten'] = True
    print(json.dumps(report, ensure_ascii=False))


if __name__ == '__main__':
    main()
