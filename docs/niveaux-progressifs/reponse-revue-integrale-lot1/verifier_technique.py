#!/usr/bin/env python3
"""Compare immutable Git objects; print JSON, never rewrite content or phonetics."""
import argparse
from collections import Counter
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[3]
DATA = 'melunga_deploy/content/niveaux-progressifs'
PAIRS = ('fr-en', 'fr-es', 'fr-it', 'fr-zh', 'fr-ja', 'fr-ko', 'zh-fr')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo', type=Path, default=ROOT)
    parser.add_argument('--base', default='4ec163e68b60bff98a63baf52a36428f6ffe63fa')
    parser.add_argument('--candidate', default='d4eaea3')
    args = parser.parse_args()

    def git(*command):
        return subprocess.check_output(['git', *command], cwd=args.repo)

    def js(ref, filename):
        return json.loads(git('show', f'{ref}:{filename}'))

    def flat(document):
        return [(kind, theme['id'], phrase) for kind in ('themes', 'heldThemes')
                for theme in document.get(kind, []) for phrase in theme.get('phrases', [])] + [
                    ('reserve', None, phrase) for phrase in document.get('reserve', [])]

    def differences(before, after, path=(), ident=None):
        if isinstance(before, dict) and isinstance(after, dict):
            ident = after.get('id', before.get('id', ident))
            for key in sorted(set(before) | set(after)):
                if key not in before:
                    yield {'path': list(path + (key,)), 'id': ident, 'added': after[key]}
                elif key not in after:
                    yield {'path': list(path + (key,)), 'id': ident, 'removed': before[key]}
                else:
                    yield from differences(before[key], after[key], path + (key,), ident)
        elif isinstance(before, list) and isinstance(after, list):
            if len(before) != len(after):
                yield {'path': list(path), 'id': ident, 'beforeLength': len(before), 'afterLength': len(after)}
            for i, (a, b) in enumerate(zip(before, after)):
                yield from differences(a, b, path + (i,), ident)
        elif before != after:
            yield {'path': list(path), 'id': ident, 'before': before, 'after': after}

    before_all, after_all, field_changes = {}, {}, Counter()
    changed_cells, changed_cards, scope_sets = [], [], []
    cells = {}
    for pair in PAIRS:
        visible, reserved = set(), set()
        for level in range(1, 11):
            filename = f'{DATA}/{pair}/L{level}.json'
            before, after = js(args.base, filename), js(args.candidate, filename)
            cells[(pair, level)] = after
            diffs = list(differences(before, after))
            if diffs:
                counts = Counter(x['path'][-1] for x in diffs)
                field_changes.update(counts)
                changed_cells.append({'file': filename, 'leafChanges': dict(counts)})
            for collection, theme, phrase in flat(before):
                key = (pair, phrase['id'])
                if key in before_all:
                    raise ValueError(f'Duplicate canonical before: {key}')
                before_all[key] = phrase
            for collection, theme, phrase in flat(after):
                key = (pair, phrase['id'])
                if key in after_all:
                    raise ValueError(f'Duplicate canonical after: {key}')
                after_all[key] = phrase
                (reserved if collection == 'reserve' else visible).add(phrase['id'])
                previous = before_all.get(key)
                if previous and previous.get('phon') != phrase.get('phon'):
                    changed_cards.append({'pair': pair, 'level': level, 'collection': collection,
                                          'theme': theme, 'id': phrase['id'], 'study': phrase['study'],
                                          'before': previous.get('phon'), 'after': phrase.get('phon')})
        bank = js(args.candidate, f'{DATA}/repertoires/{pair}.json')
        heard = {x['id'] for x in bank.get('receivedModels', [])}
        overlap = heard & (visible | reserved)
        scope_sets.append({'pair': pair, 'visible': len(visible), 'reserve': len(reserved),
                           'heardModels': len(heard), 'heardAlsoCanonical': len(overlap),
                           'uniqueUnion': len(visible | reserved | heard)})

    register = js(args.candidate, 'docs/revue-integrale/registre-phonetique.json')['corrections']
    register_by_key = {(x['pair'], x['id']): x for x in register}
    register_mismatches, transport_mismatches, changed_not_in_transport = [], [], 0
    for card in changed_cards:
        pair, ident = card['pair'], card['id']
        record = register_by_key.get((pair, ident))
        if not record or record.get('avant') != card['before'] or record.get('apres') != card['after']:
            register_mismatches.append({'pair': pair, 'id': ident})
    for pair in PAIRS:
        bank = js(args.candidate, f'{DATA}/repertoires/{pair}.json')
        by_id = {p['id']: p for p in bank['phrases']}
        for card in (c for c in changed_cards if c['pair'] == pair):
            transported = by_id.get(card['id'])
            if transported is None:
                changed_not_in_transport += 1
                continue
            if transported.get('phon') == card['after']:
                continue
            uses = []
            for level in range(1, 11):
                for theme in cells[(pair, level)]['themes']:
                    for field in ('reviewReferences', 'contextReferences', 'lexicalSupports'):
                        for reference in theme.get(field, []):
                            if reference.get('id', reference.get('utterance')) == card['id']:
                                uses.append({'level': level, 'theme': theme['id'], 'field': field})
            transport_mismatches.append({**card, 'transportPhon': transported.get('phon'), 'uses': uses})

    result = {
        'base': git('rev-parse', args.base).decode().strip(),
        'candidate': git('rev-parse', args.candidate).decode().strip(),
        'changedPaths': git('diff', '--name-only', args.base, args.candidate).decode().splitlines(),
        'modifiedCellCount': len(changed_cells), 'modifiedCells': changed_cells,
        'leafChanges': dict(field_changes),
        'canonicalBefore': len(before_all), 'canonicalAfter': len(after_all),
        'lostCanonicalIds': [list(k) for k in sorted(set(before_all) - set(after_all))],
        'addedCanonicalIds': [list(k) for k in sorted(set(after_all) - set(before_all))],
        'changedPhonIds': len(changed_cards),
        'changedPhonByPair': dict(Counter(c['pair'] for c in changed_cards)),
        'uniqueBeforeAfterPhonPairs': len({(c['before'], c['after']) for c in changed_cards}),
        'registerRows': len(register), 'registerUniqueKeys': len(register_by_key),
        'registerMismatches': register_mismatches,
        'scopeSets': scope_sets, 'uniqueScopeIds': sum(x['uniqueUnion'] for x in scope_sets),
        'transportMismatchCount': len(transport_mismatches),
        'transportMismatches': transport_mismatches,
        'changedCanonicalNotUsedInTransport': changed_not_in_transport,
        'changedCards': changed_cards,
        'writesPerformedByVerifier': False,
        'doesNotValidateNativePronunciation': True
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
