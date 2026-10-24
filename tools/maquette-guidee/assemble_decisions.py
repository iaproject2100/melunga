#!/usr/bin/env python3
"""Validate and assemble the seven pair reviews; never edits catalogue levels."""
import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
REVIEWS = ROOT / 'docs/niveaux-progressifs/revues'
OUTPUT = ROOT / 'docs/niveaux-progressifs/decisions.json'
REVIEW_FILES = ('fr-zh.json', 'zh-fr.json', 'latins.json', 'ja-ko.json')
PAIRS = {'fr-en': 'en', 'fr-es': 'es', 'fr-it': 'it', 'fr-zh': 'zh',
         'fr-ja': 'ja', 'fr-ko': 'ko', 'zh-fr': 'fr'}


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()


def sha(value):
    return hashlib.sha256(canonical(value)).hexdigest()


def assemble():
    raw = (ROOT / 'melunga_deploy/app.html').read_text()
    line = next(line for line in raw.splitlines() if line.startswith('var DECKS = '))
    decks = json.loads(line.split('=', 1)[1].strip().rstrip(';'))
    moves, provenance, seen = [], [], set()
    fields_compared = 0
    for filename in REVIEW_FILES:
        path = REVIEWS / filename
        review = json.loads(path.read_text())
        provenance.append({'path': path.relative_to(ROOT).as_posix(),
                           'sha256': hashlib.sha256(path.read_bytes()).hexdigest()})
        for pair in review.get('pairs', [review]):
            pair_id = pair.get('pair', pair.get('id'))
            if pair_id not in PAIRS:
                raise ValueError('Unknown pair in ' + filename)
            deck = decks[PAIRS[pair_id]]
            for move in pair.get('moves', []):
                index = move['sourceIndex']
                if type(index) is not int or not 0 <= index < len(deck):
                    raise ValueError('Invalid source index')
                key = (pair_id, index)
                if key in seen:
                    raise ValueError('Duplicate decision: ' + str(key))
                seen.add(key)
                card = deck[index]
                if move['sourceLevel'] != card['lv']:
                    raise ValueError('Source level changed: ' + str(key))
                proposed = move['proposedLevel']
                if type(proposed) is not int or not 1 <= proposed <= 10 or proposed == card['lv']:
                    raise ValueError('Invalid proposed level: ' + str(key))
                expected = move.get('sourceSha256', move.get('sourceCardSha256'))
                if expected != sha(card):
                    raise ValueError('Source card changed: ' + str(key))
                mapping = {'study': 't', 'native': 'cn' if pair_id == 'zh-fr' else 'frm',
                           'phon': 'phon' if pair_id == 'zh-fr' else 'phf' if pair_id == 'fr-zh' else 'pf'}
                if PAIRS[pair_id] in ('zh', 'ja', 'ko'):
                    mapping['reading'] = 'py'
                copied = move.get('copy', move)
                for output, source in mapping.items():
                    if output in copied:
                        if copied[output] != card[source]:
                            raise ValueError('Copied source text differs: ' + str(key))
                        fields_compared += 1
                if not isinstance(move.get('reason'), str) or not move['reason'].strip():
                    raise ValueError('Missing editorial reason')
                prerequisites = move.get('plannedPrerequisiteIndices', [])
                if any(type(value) is not int or value == index or not 0 <= value < len(deck)
                       for value in prerequisites):
                    raise ValueError('Invalid prerequisite: ' + str(key))
                moves.append({**move, 'pair': pair_id, 'sourceSha256': sha(card),
                              'reviewFile': path.relative_to(ROOT).as_posix(),
                              'placementStatus': 'candidate-awaiting-cross-review'})
    moves.sort(key=lambda move: (move['pair'], move['sourceIndex']))
    adjudication_path = ROOT / 'docs/niveaux-progressifs/adjudications.json'
    adjudications = json.loads(adjudication_path.read_text()) if adjudication_path.exists() else {'items': []}
    for adjudication in adjudications['items']:
        move = next(move for move in moves if move['pair'] == adjudication['pair']
                    and move['sourceIndex'] == adjudication['sourceIndex'])
        original_prerequisites = list(move.get('plannedPrerequisiteIndices', []))
        move['originalPlannedPrerequisiteIndices'] = original_prerequisites
        move['rejectedPrerequisites'] = adjudication['rejectPrerequisites']
        for rejected in adjudication['rejectPrerequisites']:
            index = rejected['sourceIndex']
            if index not in original_prerequisites:
                raise ValueError('Rejected reference was not present')
            card = decks[PAIRS[move['pair']]][index]
            if rejected['sourceStudy'] != card['t'] or rejected['sourceNative'] != card['frm']:
                raise ValueError('Adjudication evidence changed')
        rejected_indices = {row['sourceIndex'] for row in adjudication['rejectPrerequisites']}
        move['plannedPrerequisiteIndices'] = [index for index in original_prerequisites if index not in rejected_indices]
    return {
        'version': 1, 'status': 'candidate-editorial-overlay-awaiting-Claude',
        'publicationApproved': False, 'doesNotMeasureAcquisition': True,
        'sourceCatalogueLevelsChanged': False, 'accessChanged': False,
        'newWrittenPhrases': 0, 'newWrittenPhonetics': 0,
        'sourceDecksSha256': sha(decks), 'reviewSources': provenance,
        'adjudicationsSource': 'docs/niveaux-progressifs/adjudications.json',
        'adjudications': adjudications['items'],
        'scope': 'All cards receive a thematic placement; only the explicit moves below have an individual placement proposal. Unchanged source levels are not independently validated.',
        'counts': {'catalogueCards': sum(map(len, decks.values())),
                   'explicitMoveProposals': len(moves),
                   'unchangedSourceLevelsNotIndividuallyReviewed': sum(map(len, decks.values())) - len(moves),
                   'copiedReviewFieldsCompared': fields_compared,
                   'movesByPair': dict(sorted(Counter(move['pair'] for move in moves).items()))},
        'moves': moves,
        'enrichmentsSource': 'docs/niveaux-progressifs/enrichissements.json'
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    value = assemble()
    rendered = json.dumps(value, ensure_ascii=False, indent=2) + '\n'
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_text() != rendered:
            raise SystemExit('Out of date: ' + OUTPUT.relative_to(ROOT).as_posix())
    else:
        OUTPUT.write_text(rendered)
    print(json.dumps(value['counts'], ensure_ascii=False))


if __name__ == '__main__':
    main()
