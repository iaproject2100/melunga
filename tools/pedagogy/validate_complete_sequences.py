#!/usr/bin/env python3
"""Validate editorial preparation/reference order, never learner mastery."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'docs/progression-complete'


def require(condition, message):
    if not condition:
        raise ValueError(message)


def validate(plan, bank):
    pair = (plan['nativeLanguage'], plan['studyLanguage'])
    levels = plan['levels']
    require([level['sourceLevel'] for level in levels] == list(range(1, 11)), 'Ten levels are required')
    require(plan['doesNotMeasureAcquisition'] is True and plan['doesNotChangeAccess'] is True,
            'Editorial planning cannot measure mastery or change rights')
    files = {}
    counts = {'units': 0, 'dialogues': 0, 'received': 0}

    def reference(identity, level, unit=None, dialogue=None):
        require(identity in bank, 'Unknown phrase reference')
        row = bank[identity]
        require((row['nativeLanguage'], row['studyLanguage']) == pair, 'Wrong reader/study pair')
        require(row['source']['file'] == level['sourceFile'], 'Phrase belongs to another level source')
        if unit is not None:
            require(row['source'].get('unitId') == unit, 'Phrase belongs to another unit')
        if dialogue is not None:
            require(row['source'].get('dialogueId') == dialogue, 'Phrase belongs to another dialogue')
        return row

    for level in levels:
        require(level['accessFloor'] == level['sourceLevel'] == level['proposedLevel'], 'Access/source level changed')
        require(level['priorExposurePlan'] == list(range(1, level['sourceLevel'])), 'Exposure order is not cumulative')
        source = files.setdefault(level['sourceFile'], json.loads((ROOT / level['sourceFile']).read_text()))
        require({unit['unitId'] for unit in level['units']} == {u['id'] for u in source['units']}, 'Missing unit plan')
        require({d['dialogueId'] for d in level['dialogues']} == {d['id'] for d in source['dialogues']}, 'Missing dialogue plan')
        for unit in level['units']:
            prepared = set()
            seen_steps = set()
            choices = None
            for step in unit['steps']:
                require(step['id'] not in seen_steps, 'Duplicate step id')
                seen_steps.add(step['id'])
                kind = step['kind']
                if kind in ('understand', 'imitate'):
                    identity = step['utterance']
                    reference(identity, level, unit=unit['unitId'])
                    if kind == 'understand':
                        require(step['wholePhrase'] is True and step['requiresProduction'] is False,
                                'Understanding must present a whole phrase without requiring production')
                        prepared.add(identity)
                    else:
                        require(identity in prepared, 'Imitation before understanding')
                elif kind == 'replace':
                    require(unit['mode'] == 'fixed-frame-candidate', 'Do not substitute across unrelated expressions')
                    require(step['from'] in prepared and step['to'] in prepared, 'Replacement before preparation')
                    reference(step['from'], level, unit=unit['unitId'])
                    reference(step['to'], level, unit=unit['unitId'])
                elif kind == 'choose-and-recall':
                    choices = step['choices']
                    require(len(set(choices)) == len(choices) and bool(choices), 'Choices must be distinct')
                    require(all(identity in prepared for identity in choices), 'Choice without prior presentation')
                    require(step['hideLearnerModelOnRequest'] and step['canRestoreHelp'] and not step['gradesOrUnlocks'],
                            'Recall must preserve help and cannot unlock rights')
                else:
                    raise ValueError('Unknown unit phase')
            require(choices is not None and set(choices) == prepared, 'All choices need explicit preparation')
            counts['units'] += 1
        for dialogue in level['dialogues']:
            raw = next(d for d in source['dialogues'] if d['id'] == dialogue['dialogueId'])
            learner = dialogue['learnerRole']
            require(learner == raw['learnerRole'] and dialogue['roles'] == raw['roles'], 'Original dialogue roles changed')
            preparation = dialogue['preparation']
            require(len(preparation) == len(raw['turns']), 'Every dialogue turn needs preparation')
            refs = []
            received = {}
            for step, turn in zip(preparation, raw['turns']):
                row = reference(step['utterance'], level, dialogue=dialogue['dialogueId'])
                require(row['source']['turnIndex'] == len(refs), 'Original turn order changed')
                require(step['speaker'] == turn['speaker'], 'Wrong source speaker')
                productive = turn['speaker'] == learner
                require(step['requiresProduction'] is productive, 'Received turn treated as learner production')
                require(step['kind'] == ('understand-and-imitate' if productive else 'receive'), 'Wrong preparation kind')
                refs.append(step['utterance'])
                if not productive:
                    received[step['utterance']] = step['id']
            require(len(dialogue['received']) == len(received), 'Missing or duplicate reception plan')
            seen_received = set()
            for item in dialogue['received']:
                identity = item['utterance']
                require(identity not in seen_received and identity in received, 'Wrong/duplicate received turn')
                seen_received.add(identity)
                require(item['introducedInStep'] == received[identity], 'Wrong introduction step')
                require(item['analyse'] is False and item['countsAsProduction'] is False, 'Reception cannot certify production')
                index = refs.index(identity)
                turn = raw['turns'][index]
                require(item['sourceSpeaker'] == turn['speaker'] != learner, 'Wrong received role')
                next_reply = refs[index+1:index+2] if index+1 < len(refs) and raw['turns'][index+1]['speaker'] == learner else []
                require(item['preparedNextTurns'] == next_reply, 'Unprepared or incorrect next reply')
                require(item['isSourceFinalTurn'] is (index == len(refs)-1), 'False final-turn declaration')
            require(seen_received == set(received), 'Omitted received turn')
            for step in dialogue['steps']:
                require(step['turns'] == refs, 'An exchange must reuse the original prepared turns')
            require(not dialogue['automaticVariantGrafting'] and not dialogue['gradesOrUnlocks'],
                    'Do not graft variants into dialogue or unlock levels automatically')
            counts['dialogues'] += 1
            counts['received'] += len(received)
    return counts


def main():
    rows = json.loads((OUT / 'banque-phrases.json').read_text())['entries']
    bank = {row['id']: row for row in rows}
    require(len(bank) == len(rows), 'Duplicate phrase identity')
    total = {'pairs': 0, 'units': 0, 'dialogues': 0, 'received': 0}
    for path in sorted((OUT / 'sequences').glob('seq-*.json')):
        counts = validate(json.loads(path.read_text()), bank)
        total['pairs'] += 1
        for key, value in counts.items():
            total[key] += value
    require(total['pairs'] == 11, 'All eleven stored pairs must be reviewed')
    print(json.dumps({'validEditorialPlan': True, 'learnerAcquisitionValidated': False, **total}))


if __name__ == '__main__':
    main()
