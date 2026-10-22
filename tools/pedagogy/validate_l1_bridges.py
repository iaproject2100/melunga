#!/usr/bin/env python3
"""Check L1 bridge preparation and exact source references, never acquisition."""

import argparse
import hashlib
import json
from pathlib import Path
import sys

from guard_phonetics import aids_of, read_json, resolve_source

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[2]
OUT = Path('docs/progression-complete')
SNAPSHOT = 'bcd108dff5c5931f935f70f694a040d235403b64'
PAIRS = {('fr', language) for language in ('en', 'es', 'it', 'zh', 'ja', 'ko')} | {('zh', 'fr')}
EXPECTED_COUNTS = {'pairs': 7, 'bridgeUnits': 14, 'pricePreparations': 7,
                   'derivedDialogues': 7, 'received': 21, 'newStudiedPhrases': 0,
                   'newPhonetics': 0, 'fragmentReferences': 14}
# Reviewed Unicode offsets for the pinned learner turns: refusal end, price start.
# Individual valid slices alone cannot establish that text and reading align.
SPLIT_BOUNDARIES = {
    ('fr', 'en'): {'study': (11, 12), 'native': (11, 12), 'phon': (11, 12)},
    ('fr', 'es'): {'study': (12, 13), 'native': (11, 12), 'phon': (14, 15)},
    ('fr', 'it'): {'study': (11, 12), 'native': (11, 12), 'phon': (13, 14)},
    ('fr', 'zh'): {'study': (6, 6), 'native': (11, 12), 'reading': (15, 16), 'phon': (18, 19)},
    ('fr', 'ja'): {'study': (9, 9), 'native': (11, 12), 'reading': (11, 11), 'phon': (23, 24)},
    ('fr', 'ko'): {'study': (10, 11), 'native': (11, 12), 'reading': (20, 21), 'phon': (26, 27)},
    ('zh', 'fr'): {'study': (11, 12), 'native': (6, 6), 'phon': (5, 5)},
}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def no_certification(value):
    """No annex field may add production credit, mastery or access rights."""
    if isinstance(value, dict):
        for key, item in value.items():
            if key in {'gradesOrUnlocks', 'learnerAcquisitionValidated', 'countsAsProduction',
                       'productionApproved', 'productionCredits', 'acquisitionValidated',
                       'masteryValidated', 'unlocksAccess', 'grantsAccess', 'paymentUnlock'} or 'unlock' in key.lower():
                require(item is False or type(item) is int and item == 0,
                        f'{key}: editorial preparation cannot certify production or unlock access')
            no_certification(item)
    elif isinstance(value, list):
        for item in value:
            no_certification(item)


def load_banks(root=ROOT):
    """Keep the 7,989 existing references and 14 fragments in separate files."""
    root = Path(root)
    main = read_json(root / OUT / 'banque-phrases.json')
    fragments = read_json(root / OUT / 'banks/l1-bridges.json')
    require(len(main['entries']) == 7989, 'The main phrase bank inventory must remain 7,989')
    require(fragments['version'] == 1 and fragments['sourceSnapshot'] == SNAPSHOT,
            'Fragment bank version or pinned source snapshot changed')
    require(len(fragments['entries']) == 14, 'The bridge bank must contain exactly 14 fragments')
    require(all(row['source']['type'] == 'conversation-fragment' for row in fragments['entries']),
            'The bridge bank can contain only source fragments')
    rows = main['entries'] + fragments['entries']
    bank = {row['id']: row for row in rows}
    require(len(bank) == len(rows), 'Duplicate phrase identity across main and bridge banks')
    return bank


def validate(plan, bank, root=ROOT):
    """Validate a complete seven-scene plan against a combined ID-to-row bank."""
    try:
        return _validate(plan, bank, Path(root))
    except (KeyError, IndexError, TypeError, OSError) as error:
        raise ValueError(f'Malformed or missing L1 bridge data: {error}') from error


def _validate(plan, bank, root):
    require(type(plan['version']) is int and plan['version'] == 1, 'Unsupported bridge plan version')
    require(plan['sourceSnapshot'] == SNAPSHOT, 'Wrong pinned source snapshot')
    require(plan['status'] == 'editorial-review-not-published', 'L1 bridges must remain an unpublished editorial review')
    require(plan['doesNotChangeAccess'] is True and plan['learnerAcquisitionValidated'] is False,
            'Editorial plans cannot change access or validate learner acquisition')
    no_certification(plan)
    scenes = plan['scenes']
    require(len(scenes) == 7, 'Exactly seven active reader/study scenes are required')
    require({(scene['nativeLanguage'], scene['studyLanguage']) for scene in scenes} == PAIRS,
            'Wrong, missing or duplicate reader/study pair')
    ids, checked, files, used_fragments = set(), set(), set(), set()
    counts = dict.fromkeys(EXPECTED_COUNTS, 0)

    def unique(identity, context):
        require(isinstance(identity, str) and bool(identity) and identity not in ids,
                f'{context}: missing or duplicate identity {identity!r}')
        ids.add(identity)

    for scene in scenes:
        pair = (scene['nativeLanguage'], scene['studyLanguage'])
        native, study = pair
        prefix = f'L1-{native}-{study}'
        filename = f'{prefix}.json'
        source_file = f'melunga_deploy/content/conversation/{filename}'
        path = root / source_file
        files.add(source_file)
        require(plan['sourceFilesSha256'][source_file] == hashlib.sha256(path.read_bytes()).hexdigest(),
                f'{prefix}: pinned original source file changed')
        raw = read_json(path)
        require((raw['nativeLanguage'], raw['studyLanguage']) == pair and raw['level'] == 1,
                f'{prefix}: wrong original reader/study pair or level')
        require(type(scene['level']) is int and scene['level'] == 1
                and type(scene['accessFloor']) is int and scene['accessFloor'] == 1,
                f'{prefix}: L1 access floor changed')
        require(scene['nativeReview']['status'] == 'pending' and scene['nativeReview']['productionApproved'] is False,
                f'{prefix}: native review must remain pending and cannot claim production approval')
        original_id = f'{prefix}-d1'
        originals = [item for item in raw['dialogues'] if item['id'] == original_id]
        require(len(originals) == 1, f'{prefix}: original dialogue missing or duplicated')
        original = originals[0]
        turns = original['turns']
        learner = original['learnerRole']
        require(len(turns) == 6 and [turn['speaker'] == learner for turn in turns]
                == [True, False, True, False, True, False], f'{prefix}: unexpected original turn roles')

        def reference(identity):
            require(identity in bank, f'{prefix}: unknown phrase reference {identity!r}')
            row = bank[identity]
            require(row['id'] == identity and (row['nativeLanguage'], row['studyLanguage']) == pair,
                    f'{prefix}: wrong phrase identity or reader/study pair')
            require(row['source']['file'] == source_file, f'{prefix}: phrase comes from another source')
            if identity not in checked:
                resolve_source(root, row, {language: [] for _, language in PAIRS})
                checked.add(identity)
            return row

        def original_reference(index):
            identity = f'{filename}:{original_id}:t{index}'
            row = reference(identity)
            require(row['source'] == {'type': 'conversation', 'file': source_file,
                                     'dialogueId': original_id, 'turnIndex': index,
                                     'expectedStudy': turns[index]['study']},
                    f'{prefix}: wrong original dialogue turn reference')
            require(row['copy'] == {'study': turns[index]['study'], 'native': turns[index]['native'],
                                    'aids': aids_of(turns[index])},
                    f'{prefix}: original turn copies must retain native meaning and all source aids')
            return identity

        greeting, welcome, milk, amount = [original_reference(index) for index in (0, 1, 3, 5)]
        order = f'{filename}:{prefix}-09:v0'
        order_row = reference(order)
        require(order_row['source'] == {'type': 'conversation', 'file': source_file,
                                       'unitId': f'{prefix}-09', 'variantIndex': 0, 'slot': False,
                                       'expectedStudy': turns[2]['study']},
                f'{prefix}: order must use the original unit 09 first whole variant')
        require(order_row['copy'] == {'study': turns[2]['study'], 'native': turns[2]['native'],
                                      'aids': aids_of(turns[2])},
                f'{prefix}: the prepared order must match original turn 2 exactly')
        fragments = []
        for fragment in ('refusal', 'price'):
            identity = f'{filename}:{original_id}:t4:{fragment}'
            row = reference(identity)
            locator = row['source']
            require(locator['type'] == 'conversation-fragment' and locator['dialogueId'] == original_id
                    and type(locator['turnIndex']) is int and locator['turnIndex'] == 4
                    and locator['sourceLevel'] == 1 and locator['learnerRole'] == learner
                    and locator['fragment'] == fragment,
                    f'{prefix}: wrong learner fragment source or role')
            fragments.append(identity)
            used_fragments.add(identity)
        refusal, price = fragments
        split = scene['splitReconstruction']
        require(split['originalTurnIndex'] == 4 and split['first'] == refusal and split['second'] == price,
                f'{prefix}: refusal and price split order changed')
        fields = {'study', 'native'} | set(aids_of(turns[4]))
        require(set(split['separators']) == fields == set(SPLIT_BOUNDARIES[pair]),
                f'{prefix}: all source fields need reviewed split boundaries and separators')
        for field in fields:
            first = bank[refusal]['source']['spans'][field]
            second = bank[price]['source']['spans'][field]
            parent = turns[4][field]
            refusal_end, price_start = SPLIT_BOUNDARIES[pair][field]
            require(first == [0, refusal_end] and second == [price_start, len(parent)],
                    f'{prefix}: {field} spans must match the reviewed refusal/price split')
            require(first[0] == 0 and second[1] == len(parent) and first[1] <= second[0]
                    and split['separators'][field] == parent[first[1]:second[0]],
                    f'{prefix}: split must preserve the entire original {field} without overlap or rewriting')
        refs = [greeting, welcome, order, milk, refusal, price, amount]
        speakers = [turns[index]['speaker'] for index in (0, 1, 2, 3, 4, 4, 5)]

        units = scene['bridgeUnits']
        require(len(units) == 2 and [unit['utteranceId'] for unit in units] == [greeting, refusal],
                f'{prefix}: prepare exactly the greeting and refusal bridge units')
        for unit in units:
            unique(unit['unitId'], 'Bridge unit')
            require(unit['unitId'] not in {item['id'] for item in raw['units']},
                    f'{prefix}: bridge units require new identities distinct from original units')
            require(unit['kind'] == 'whole-expression' and type(unit['sourceAccessLevel']) is int
                    and unit['sourceAccessLevel'] == 1
                    and unit['requiresNewPhonetics'] is False and unit['replacementClaim'] is False,
                    f'{prefix}: bridge unit must present a whole source expression at L1')
            steps = unit['steps']
            require([step['kind'] for step in steps] == ['understand', 'imitate', 'recall-whole-phrase'],
                    f'{prefix}: whole-expression preparation order changed')
            for index, step in enumerate(steps):
                unique(step['id'], 'Bridge preparation step')
                require(step['utterance'] == unit['utteranceId'], f'{prefix}: unit phrase changed between phases')
                if index < 2:
                    require(step['wholePhrase'] is True and step['requiresProduction'] is (index == 1),
                            f'{prefix}: understand the whole phrase before imitation')
                else:
                    require(step['hideLearnerModelOnRequest'] is True and step['canRestoreHelp'] is True
                            and step['gradesOrUnlocks'] is False, f'{prefix}: recall must preserve help and access')
            counts['bridgeUnits'] += 1

        dialogue = scene['dialogue']
        unique(dialogue['dialogueId'], 'Derived dialogue')
        require(scene['id'] == dialogue['dialogueId']
                and dialogue['dialogueId'] not in {item['id'] for item in raw['dialogues']}
                and dialogue['originalDialogueId'] == original_id,
                f'{prefix}: derived scene must identify its unchanged original dialogue')
        require(dialogue['roles'] == original['roles'] and dialogue['learnerRole'] == learner,
                f'{prefix}: original learner role or role labels changed')
        require(dialogue['originalTurnOrder'] == [0, 1, 2, 3, '4:refusal', '4:price', 5],
                f'{prefix}: original-to-derived turn order changed')
        require(dialogue['automaticVariantGrafting'] is False and dialogue['gradesOrUnlocks'] is False
                and dialogue['learnerAcquisitionValidated'] is False,
                f'{prefix}: a scene cannot graft phrases, grant access or certify acquisition')
        expected_preparation = []
        for identity, speaker in zip(refs, speakers):
            for kind in (('understand', 'imitate') if speaker == learner else ('receive',)):
                expected_preparation.append((identity, speaker, kind))
        preparation = dialogue['preparation']
        require([(step['utterance'], step['speaker'], step['kind']) for step in preparation]
                == expected_preparation, f'{prefix}: every derived turn needs ordered whole-phrase preparation before exchange')
        prepared, introduced = {}, {}
        for step in preparation:
            unique(step['id'], 'Dialogue preparation step')
            require(step['wholePhrase'] is True and step['requiresProduction'] is (step['kind'] == 'imitate'),
                    f'{prefix}: reception/understanding cannot require learner production')
            prepared[step['id']] = step
            if step['kind'] == 'receive':
                introduced[step['utterance']] = step['id']

        def prepared_whole(identity, step_id):
            require(step_id in prepared, f'{prefix}: reply points outside earlier dialogue preparation')
            step = prepared[step_id]
            require(step['utterance'] == identity and step['speaker'] == learner
                    and step['wholePhrase'] is True and step['kind'] in ('understand', 'imitate'),
                    f'{prefix}: reply must reference earlier preparation of that exact whole learner phrase')

        price_preparation = scene['pricePreparation']
        require(price_preparation['utteranceId'] == price and price_preparation['relatedUnitId'] == f'{prefix}-10'
                and price_preparation['relatedUnitDoesNotPrepareExactPhrase'] is True,
                f'{prefix}: unit 10 cannot implicitly prepare the exact dialogue price question')
        prepared_whole(price, price_preparation['preparedInStep'])
        received = dialogue['received']
        require([item['utteranceId'] for item in received] == [welcome, milk, amount],
                f'{prefix}: all three received turns need one explicit ordered entry')
        for item, index, answer in zip(received, (1, 3, 5), (order, refusal, None)):
            identity = item['utteranceId']
            require(item['source'] == {'type': 'dialogueTurn', 'level': 1, 'dialogueId': original_id,
                                       'turnIndex': index, 'learnerRole': learner,
                                       'expectedStudy': turns[index]['study']},
                    f'{prefix}: wrong received original source, role or text')
            require(type(item['source']['turnIndex']) is int and type(item['source']['level']) is int,
                    f'{prefix}: received source indexes and levels must be integers')
            require(item['introducedInStep'] == introduced[identity],
                    f'{prefix}: received turn must first appear in its earlier receive phase')
            require(item['analyse'] is False and item['countsAsProduction'] is False
                    and item['replyRequired'] is (answer is not None),
                    f'{prefix}: received content cannot certify production or require a false closing answer')
            require(isinstance(item['answerWith'], list), f'{prefix}: answerWith must always be an explicit list')
            answers = item['answerWith']
            require([entry['utteranceId'] for entry in answers] == ([] if answer is None else [answer]),
                    f'{prefix}: welcome requires the order; milk requires only refusal; amount requires no reply')
            for entry in answers:
                require(entry['expectedStudy'] == bank[answer]['copy']['study'],
                        f'{prefix}: answer expectedStudy differs from the prepared source phrase')
                prepared_whole(answer, entry['preparedInStep'])
        steps = dialogue['steps']
        require([step['kind'] for step in steps]
                == ['listen-whole-dialogue', 'reply-with-help', 'reply-without-model'],
                f'{prefix}: exchange phase order changed')
        for step in steps:
            require(step['turns'] == refs and step['learnerRole'] == learner,
                    f'{prefix}: exchange must reuse all seven prepared source phrases in order and role')
        require(steps[-1]['receivedRemainVisible'] is True and steps[-1]['canRestoreHelp'] is True,
                f'{prefix}: recall must keep reception and help available')
        counts['pairs'] += 1
        counts['pricePreparations'] += 1
        counts['derivedDialogues'] += 1
        counts['received'] += len(received)
    require(set(plan['sourceFilesSha256']) == files, 'Pinned source inventory must contain exactly the seven active L1 files')
    counts['fragmentReferences'] = len(used_fragments)
    require(counts == EXPECTED_COUNTS and plan['counts'] == counts, 'Declared bridge counts differ from validated content')
    return counts


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=ROOT)
    args = parser.parse_args(argv)
    try:
        counts = validate(read_json(args.root / OUT / 'l1-bridges.json'), load_banks(args.root), args.root)
        print(json.dumps({'validEditorialPlan': True, 'learnerAcquisitionValidated': False, **counts}))
        return 0
    except (KeyError, IndexError, TypeError, ValueError, OSError) as error:
        print(json.dumps({'validEditorialPlan': False, 'error': str(error)}), file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
